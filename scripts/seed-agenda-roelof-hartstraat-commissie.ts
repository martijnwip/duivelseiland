/**
 * Zet de twee vergaderingen van de stadsdeelcommissie Zuid waarop de adviesaanvraag over de
 * herinrichting van de Roelof Hartstraat en het Roelof Hartplein waarschijnlijk besproken wordt
 * (woensdag 18 november en woensdag 2 december 2026, 19.30 uur) in de Agenda, NL en EN, met een link
 * naar het nieuwsbericht (zie scripts/seed-nieuws-roelof-hartstraat-commissie.ts).
 *
 * Op welke van de twee het onderwerp staat, was bij het schrijven nog niet bekend. Staat de agenda
 * online, pas dan de items aan in /admin (of verwijder het item dat niet klopt).
 *
 * De items komen als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de
 * slug al, dan wordt het item bijgewerkt (status blijft dan zoals hij is).
 *
 *   bun run seed:agenda-roelof-hartstraat-commissie
 *   bun run seed:agenda-roelof-hartstraat-commissie:prod
 */
import { randomBytes } from 'node:crypto';
import type { Payload } from 'payload';
import { getClient } from './lib/payload-client';

const BERICHT_SLUG = 'roelof-hartstraat-stadsdeelcommissie';
const AFBEELDING = 'projectgebied.jpg';
const TIJD = '19:30';
const NOTUBIZ = 'https://zuid.notubiz.nl';

type Locale = 'nl' | 'en';

const VERGADERINGEN = [
  {
    slug: 'stadsdeelcommissie-roelof-hartstraat-18-november',
    // 19.30 uur Amsterdamse tijd (CET, UTC+1).
    date: '2026-11-18T18:30:00.000Z',
    datum: { nl: '18 november', en: '18 November' },
    andere: { nl: '2 december', en: '2 December' },
  },
  {
    slug: 'stadsdeelcommissie-roelof-hartstraat-2-december',
    date: '2026-12-02T18:30:00.000Z',
    datum: { nl: '2 december', en: '2 December' },
    andere: { nl: '18 november', en: '18 November' },
  },
] as const;
type Vergadering = (typeof VERGADERINGEN)[number];

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const text = (t: string) => ({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1 });
const link = (url: string, label: string, newTab = false) => ({
  ...base,
  type: 'link',
  version: 3,
  id: randomBytes(12).toString('hex'),
  fields: { url, newTab, linkType: 'custom' },
  children: [text(label)],
});
type Deel = string | ReturnType<typeof link>;
const p = (...delen: Deel[]) => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  textStyle: '',
  children: delen.map((d) => (typeof d === 'string' ? text(d) : d)),
});
type LexicalNode = { type: string; version: number; [k: string]: unknown };
const richText = (children: LexicalNode[]) => ({ root: { ...base, type: 'root', children } });

// ---- Inhoud ----
const bericht = (locale: Locale) => (locale === 'nl' ? `/nieuws/${BERICHT_SLUG}` : `/en/nieuws/${BERICHT_SLUG}`);

function inhoud(v: Vergadering, locale: Locale) {
  if (locale === 'nl') {
    return {
      title: `Stadsdeelcommissie Zuid over de Roelof Hartstraat (${v.datum.nl})`,
      intro: `De stadsdeelcommissie geeft advies over de herinrichting van de Roelof Hartstraat en het Roelof Hartplein: geen linksaf meer naar de Hobbemakade en de Joh. M. Coenenstraat, ongeveer 45 parkeerplaatsen minder en bomen die gekapt worden. Het onderwerp staat op ${v.datum.nl} of op ${v.andere.nl} op de agenda; dat is nog niet bekend. Je kunt inspreken.`,
      stap: {
        title: 'Vergadering stadsdeelcommissie',
        description:
          'Commissiezaal, President Kennedylaan 923. Inspreken: aanmelden uiterlijk 09.00 uur op de dag zelf. Ook live te volgen.',
      },
      content: richText([
        p(
          'Hoe je inspreekt en wat er in de stukken staat, lees je in ',
          link(bericht('nl'), 'ons bericht'),
          '. De agenda en de livestream staan op ',
          link(NOTUBIZ, 'zuid.notubiz.nl', true),
          '.',
        ),
      ]),
    };
  }
  return {
    title: `District committee Zuid on Roelof Hartstraat (${v.datum.en})`,
    intro: `The district committee advises on the redesign of Roelof Hartstraat and Roelof Hartplein: no more left turns onto Hobbemakade and Joh. M. Coenenstraat, about 45 fewer parking spaces and trees to be felled. The topic is on the agenda on ${v.datum.en} or on ${v.andere.en}; which one is not yet known. You can speak at the meeting.`,
    stap: {
      title: 'District committee meeting',
      description:
        'Committee room, President Kennedylaan 923. Speaking: register by 09:00 on the day itself. You can also watch live.',
    },
    content: richText([
      p(
        'How to speak and what the documents say: see ',
        link(bericht('en'), 'our article'),
        '. The agenda and livestream are on ',
        link(NOTUBIZ, 'zuid.notubiz.nl', true),
        ' (in Dutch).',
      ),
    ]),
  };
}

// ---- Uitvoeren ----
async function zetVergadering(payload: Payload, v: Vergadering, image: number | null) {
  const nl = inhoud(v, 'nl');
  const gedeeld = { date: v.date, recurrence: 'none' as const, image };
  const stapNl = { time: TIJD, icon: 'meeting' as const, title: nl.stap.title, description: nl.stap.description };
  const tekstNl = { title: nl.title, intro: nl.intro, content: nl.content };

  const bestaand = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: v.slug } },
    overrideAccess: true,
    limit: 1,
  });

  let docId: number;
  if (bestaand.docs[0]) {
    docId = bestaand.docs[0].id;
    await payload.update({
      collection: 'agenda',
      id: docId,
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, ...tekstNl, schedule: [stapNl] },
    });
    console.log(`[seed-agenda-roelof-hartstraat-commissie] bijgewerkt: agenda #${docId} (${v.slug})`);
  } else {
    const doc = await payload.create({
      collection: 'agenda',
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, ...tekstNl, slug: v.slug, status: 'draft', alleenBuurt: false, schedule: [stapNl] },
    });
    docId = doc.id;
    console.log(`[seed-agenda-roelof-hartstraat-commissie] aangemaakt als concept: agenda #${docId} (${v.slug})`);
  }

  // De programmaregels zijn een array: de Engelse tekst hoort bij dezelfde rij (zelfde id).
  const metRijen = await payload.findByID({ collection: 'agenda', id: docId, overrideAccess: true, locale: 'nl' });
  const rijId = metRijen.schedule?.[0]?.id;
  const en = inhoud(v, 'en');
  await payload.update({
    collection: 'agenda',
    id: docId,
    overrideAccess: true,
    locale: 'en',
    data: {
      title: en.title,
      intro: en.intro,
      content: en.content,
      schedule: [{ id: rijId, time: TIJD, icon: 'meeting', title: en.stap.title, description: en.stap.description }],
    },
  });
}

async function run() {
  const payload = await getClient();

  const beeld = await payload.find({
    collection: 'media',
    where: { filename: { equals: AFBEELDING } },
    overrideAccess: true,
    limit: 1,
  });
  if (!beeld.docs[0]) {
    console.warn(`[seed-agenda-roelof-hartstraat-commissie] ${AFBEELDING} niet gevonden; items komen er zonder afbeelding in.`);
  }

  for (const v of VERGADERINGEN) {
    await zetVergadering(payload, v, beeld.docs[0]?.id ?? null);
  }
  console.log('[seed-agenda-roelof-hartstraat-commissie] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

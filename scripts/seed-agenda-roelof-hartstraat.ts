/**
 * Zet de inloopavond over de herinrichting van de Roelof Hartstraat (donderdag 19 november 2026,
 * 20.00–22.00 uur, Buurthuis De Coenen) in de Agenda, NL en EN, met een link naar de brief in Nieuws
 * (zie scripts/seed-nieuws-roelof-hartstraat.ts).
 *
 * Het item komt als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de slug
 * al, dan wordt het item bijgewerkt (status blijft dan zoals hij is).
 *
 *   bun run seed:agenda-roelof-hartstraat
 *   bun run seed:agenda-roelof-hartstraat:prod
 */
import { randomBytes } from 'node:crypto';
import { getClient } from './lib/payload-client';

const SLUG = 'inloopavond-roelof-hartstraat';
const BRIEF_SLUG = 'herinrichting-roelof-hartstraat';
const AFBEELDING = 'projectgebied.jpg';

type Locale = 'nl' | 'en';

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const text = (t: string) => ({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1 });
const link = (url: string, label: string) => ({
  ...base,
  type: 'link',
  version: 3,
  id: randomBytes(12).toString('hex'),
  fields: { url, newTab: false, linkType: 'custom' },
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
const brief = (locale: Locale) => (locale === 'nl' ? `/nieuws/${BRIEF_SLUG}` : `/en/nieuws/${BRIEF_SLUG}`);

const INHOUD = {
  nl: {
    title: 'Inloopavond herinrichting Roelof Hartstraat',
    intro:
      'De gemeente laat de plannen voor de nieuwe Roelof Hartstraat en het Roelof Hartplein zien: brede fietsstroken, minder parkeerplaatsen, twee linksafrichtingen die verdwijnen en bomen die gekapt of verplaatst worden. Loop binnen wanneer het je uitkomt en geef je mening.',
    stap: {
      title: 'Inloop in Buurthuis De Coenen',
      description:
        'Tuinzaal, Johan M. Coenenstraat 4. Geen presentatie: medewerkers van het project bespreken de plannen met je.',
    },
    content: richText([
      p(
        'Kun je niet komen? Reageren kan tot en met 5 december 2026, ook per mail of telefoon. Alles staat in ',
        link(brief('nl'), 'de brief van de gemeente'),
        '.',
      ),
    ]),
  },
  en: {
    title: 'Drop-in evening: redesign of Roelof Hartstraat',
    intro:
      'The city is showing its plans for the new Roelof Hartstraat and Roelof Hartplein: wide cycle lanes, fewer parking spaces, two left turns removed, and trees to be felled or moved. Drop in whenever suits you and share your views.',
    stap: {
      title: 'Drop-in at Buurthuis De Coenen',
      description:
        'Garden room (tuinzaal), Johan M. Coenenstraat 4. No presentation: project staff will talk you through the plans.',
    },
    content: richText([
      p(
        'Can’t make it? You can respond until 5 December 2026, also by email or phone. Everything is in ',
        link(brief('en'), 'the letter from the city'),
        '.',
      ),
    ]),
  },
} as const;

// ---- Uitvoeren ----
async function run() {
  const payload = await getClient();

  const beeld = await payload.find({
    collection: 'media',
    where: { filename: { equals: AFBEELDING } },
    overrideAccess: true,
    limit: 1,
  });
  if (!beeld.docs[0]) {
    console.warn(`[seed-agenda-roelof-hartstraat] ${AFBEELDING} niet gevonden; draai eerst seed:roelof-hartstraat. Item komt er zonder afbeelding in.`);
  }

  const nl = INHOUD.nl;
  const gedeeld = {
    // 20.00 uur Amsterdamse tijd (CET, UTC+1).
    date: '2026-11-19T19:00:00.000Z',
    recurrence: 'none' as const,
    image: beeld.docs[0]?.id ?? null,
  };
  const tekst = (locale: Locale) => {
    const t = INHOUD[locale];
    return {
      title: t.title,
      intro: t.intro,
      content: t.content,
    };
  };

  const bestaand = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: SLUG } },
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
      data: {
        ...gedeeld,
        ...tekst('nl'),
        schedule: [{ time: '20:00–22:00', icon: 'meeting', title: nl.stap.title, description: nl.stap.description }],
      },
    });
    console.log(`[seed-agenda-roelof-hartstraat] bijgewerkt: agenda #${docId} (${SLUG})`);
  } else {
    const doc = await payload.create({
      collection: 'agenda',
      overrideAccess: true,
      locale: 'nl',
      data: {
        ...gedeeld,
        ...tekst('nl'),
        slug: SLUG,
        status: 'draft',
        alleenBuurt: false,
        schedule: [{ time: '20:00–22:00', icon: 'meeting', title: nl.stap.title, description: nl.stap.description }],
      },
    });
    docId = doc.id;
    console.log(`[seed-agenda-roelof-hartstraat] aangemaakt als concept: agenda #${docId} (${SLUG})`);
  }

  // De programmaregels zijn een array: de Engelse tekst hoort bij dezelfde rij (zelfde id).
  const metRijen = await payload.findByID({ collection: 'agenda', id: docId, overrideAccess: true, locale: 'nl' });
  const rijId = metRijen.schedule?.[0]?.id;
  const en = INHOUD.en;
  await payload.update({
    collection: 'agenda',
    id: docId,
    overrideAccess: true,
    locale: 'en',
    data: {
      ...tekst('en'),
      schedule: [{ id: rijId, time: '20:00–22:00', icon: 'meeting', title: en.stap.title, description: en.stap.description }],
    },
  });
  console.log('[seed-agenda-roelof-hartstraat] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

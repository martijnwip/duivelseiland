/**
 * Zet het open huis van de winteropvang (woensdag 25 november 2026, 17.00–19.00 uur, Pieter de
 * Hoochstraat 78) in de Agenda, NL en EN, met een link naar de brief in Nieuws
 * (zie scripts/seed-nieuws-winteropvang.ts).
 *
 * Het item komt als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de slug
 * al, dan wordt het item bijgewerkt (status blijft dan zoals hij is).
 *
 *   bun run seed:agenda-winteropvang
 *   bun run seed:agenda-winteropvang:prod
 */
import { randomBytes } from 'node:crypto';
import { getClient } from './lib/payload-client';

const SLUG = 'open-huis-winteropvang';
const BRIEF_SLUG = 'winteropvang-pieter-de-hoochstraat';
const TIJD = '17:00–19:00';

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
    title: 'Open huis winteropvang Pieter de Hoochstraat',
    intro:
      'Van 1 december tot 1 april is de oude school aan de Pieter de Hoochstraat 78 een nachtopvang voor maximaal 100 dak- en thuisloze mensen. HVO-Querido, dat de opvang begeleidt, laat het gebouw zien en vertelt hoe de opvang werkt.',
    stap: {
      title: 'Open huis in de winteropvang',
      description:
        'Pieter de Hoochstraat 78. Kennismaken met de medewerkers van HVO-Querido, rondleiding door het gebouw, vragen stellen en suggesties delen.',
    },
    content: richText([
      p(
        'Kun je niet komen? Voor dringende vragen over de locatie, of als je iets wilt betekenen voor de opvang, bel HVO-Querido: 06 51 00 01 26. Alles staat in ',
        link(brief('nl'), 'de brief van de gemeente'),
        '.',
      ),
    ]),
  },
  en: {
    title: 'Open house: winter shelter on Pieter de Hoochstraat',
    intro:
      'From 1 December to 1 April, the former school at Pieter de Hoochstraat 78 will be a night shelter for up to 100 homeless people. HVO-Querido, who run the shelter, will show you around and explain how it works.',
    stap: {
      title: 'Open house at the winter shelter',
      description:
        'Pieter de Hoochstraat 78. Meet the HVO-Querido staff, take a tour of the building, ask questions and share suggestions.',
    },
    content: richText([
      p(
        'Can’t make it? For urgent questions about the location, or if you would like to help the shelter, call HVO-Querido: 06 51 00 01 26. Everything is in ',
        link(brief('en'), 'the letter from the city'),
        '.',
      ),
    ]),
  },
} as const;

// ---- Uitvoeren ----
async function run() {
  const payload = await getClient();

  const nl = INHOUD.nl;
  const gedeeld = {
    // 17.00 uur Amsterdamse tijd (CET, UTC+1).
    date: '2026-11-25T16:00:00.000Z',
    recurrence: 'none' as const,
  };
  const tekst = (locale: Locale) => {
    const t = INHOUD[locale];
    return { title: t.title, intro: t.intro, content: t.content };
  };

  const bestaand = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: SLUG } },
    overrideAccess: true,
    limit: 1,
  });

  const stapNl = { time: TIJD, icon: 'meeting' as const, title: nl.stap.title, description: nl.stap.description };
  let docId: number;
  if (bestaand.docs[0]) {
    docId = bestaand.docs[0].id;
    await payload.update({
      collection: 'agenda',
      id: docId,
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, ...tekst('nl'), schedule: [stapNl] },
    });
    console.log(`[seed-agenda-winteropvang] bijgewerkt: agenda #${docId} (${SLUG})`);
  } else {
    const doc = await payload.create({
      collection: 'agenda',
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, ...tekst('nl'), slug: SLUG, status: 'draft', alleenBuurt: false, schedule: [stapNl] },
    });
    docId = doc.id;
    console.log(`[seed-agenda-winteropvang] aangemaakt als concept: agenda #${docId} (${SLUG})`);
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
      schedule: [{ id: rijId, time: TIJD, icon: 'meeting', title: en.stap.title, description: en.stap.description }],
    },
  });
  console.log('[seed-agenda-winteropvang] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

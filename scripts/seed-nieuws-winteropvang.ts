/**
 * Zet de brief van de gemeente over de winteropvang in het voormalige schoolgebouw aan de
 * Pieter de Hoochstraat 78 (6 november 2026, wethouder Opvang Zita Pels) als Nieuws-item op de site,
 * in het Nederlands en het Engels. De tekst is overgenomen van een foto van de papieren brief.
 *
 * Let op: in het onderwerp van de brief staat "Pieter de Hoochstraat 76", in de tekst twee keer 78.
 * Op de site staat 78; het onderwerp is letterlijk overgenomen.
 *
 * Het item komt als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de slug
 * al, dan wordt het item bijgewerkt (status blijft dan zoals hij is).
 *
 *   bun run seed:winteropvang
 *   bun run seed:winteropvang:prod
 */
import { randomBytes } from 'node:crypto';
import { getClient } from './lib/payload-client';

const SLUG = 'winteropvang-pieter-de-hoochstraat';
const TEL = 'tel:+31651000126';
const TEL_LABEL = '06 51 00 01 26';
const WINTEROPVANG = 'https://www.amsterdam.nl';

type Locale = 'nl' | 'en';
type Tekst = Record<Locale, string>;

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const BOLD = 1;
const ITALIC = 2;
const text = (t: string, format = 0) => ({ type: 'text', detail: 0, format, mode: 'normal', style: '', text: t, version: 1 });
const link = (url: string, label: string, newTab = false) => ({
  ...base,
  type: 'link',
  version: 3,
  id: randomBytes(12).toString('hex'),
  fields: { url, newTab, linkType: 'custom' },
  children: [text(label)],
});
type Inline = ReturnType<typeof text> | ReturnType<typeof link>;
type Deel = string | Inline;
const inline = (delen: Deel[]): Inline[] => delen.map((d) => (typeof d === 'string' ? text(d) : d));
const p = (...delen: Deel[]) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(delen) });
const kop = (tag: 'h2' | 'h3', t: string) => ({ ...base, type: 'heading', tag, children: [text(t)] });
const lijst = (items: Deel[][]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((delen, i) => ({ ...base, type: 'listitem', value: i + 1, children: inline(delen) })),
});
const vet = (t: string) => text(t, BOLD);
const schuin = (t: string) => text(t, ITALIC);
type LexicalNode = { type: string; version: number; [k: string]: unknown };
const richText = (children: LexicalNode[]) => ({ root: { ...base, type: 'root', children } });

const tel = () => link(TEL, TEL_LABEL);
const winteropvang = (label: string) => link(WINTEROPVANG, label, true);

// ---- Inhoud ----
const TITEL: Tekst = {
  nl: 'Winteropvang in de oude school aan de Pieter de Hoochstraat: open huis 25 november',
  en: 'Winter shelter in the former school on Pieter de Hoochstraat: open house on 25 November',
};

function inhoudNl() {
  return richText([
    p(
      'Van 1 december 2026 tot 1 april 2027 is het voormalige schoolgebouw aan de Pieter de Hoochstraat 78 een nachtopvang voor maximaal 100 dak- en thuisloze mensen. Op woensdag 25 november is er een open huis. Hieronder staat de brief die de gemeente op 6 november stuurde.',
    ),
    lijst([
      [vet('Opvang: '), '1 december 2026 tot 1 april 2027, elke dag van 16.30 tot 9.30 uur'],
      [vet('Open huis: '), 'woensdag 25 november, 17.00–19.00 uur, Pieter de Hoochstraat 78'],
      [vet('Vragen of iets betekenen voor de opvang: '), 'HVO-Querido op de locatie, ', tel()],
    ]),

    kop('h2', 'De brief'),
    p(schuin('Datum: 6 november 2026')),
    p(vet('Onderwerp: Winteropvang Pieter de Hoochstraat 76')),
    p('Beste bewoner/ondernemer,'),
    p(
      'Van 1 december 2026 tot 1 april 2027 is het voormalige schoolgebouw aan de Pieter de Hoochstraat 78 een winteropvang voor maximaal 100 dak- en thuisloze mensen. De opvang is bedoeld voor een kwetsbare doelgroep. Het gebouw wordt alleen deze winter als nachtopvang gebruikt, daarna is het weer beschikbaar voor onderwijs. In februari diende het al kort als noodopvang.',
    ),

    kop('h3', 'Waarom deze opvang?'),
    p(
      'In de wintermaanden biedt de gemeente tijdelijk nachtopvang voor kwetsbare dak- of thuisloze mensen. Zo hoeven zij niet buiten te slapen als het koud is. De GGD bepaalt wie in aanmerking komt. De opvang is bedoeld voor kwetsbare mensen met binding met Amsterdam. Ook moeten zij willen werken aan een toekomstperspectief.',
    ),

    kop('h3', 'Hoe werkt de opvang?'),
    p(
      'HVO-Querido begeleidt de opvang. De opvang is dagelijks geopend van 16.30 uur tot de volgende ochtend 09.30 uur. De mensen krijgen er een bed, een warme maaltijd, een warme douche en ontbijt. Overdag worden zij verwezen naar inloopvoorzieningen elders in de stad.',
    ),

    kop('h3', 'Uitnodiging Open huis'),
    p(
      'HVO-Querido nodigt u uit voor een Open Huis in de winteropvang op de Pieter de Hoochstraat 78. Op woensdag 25 november bent u daar tussen 17 en 19 uur van harte welkom om kennis te maken met de medewerkers van HVO-Querido. Zij geven een rondleiding door het gebouw en vertellen over de opvang en hoe deze wordt georganiseerd. Ook kunt u vragen stellen en suggesties delen.',
    ),

    kop('h3', 'Contactinformatie'),
    p(
      'Voor dringende vragen over de locatie kunt u contact opnemen met HVO-Querido op de locatie via ',
      tel(),
      '. Dit nummer kunt u ook bellen als u iets wilt betekenen voor de opvang.',
    ),
    p('De gemeente Amsterdam biedt verschillende vormen winteropvang, zie ', winteropvang('www.amsterdam.nl'), '.'),
    p('Met vriendelijke groet,'),
    p('Zita Pels, wethouder Opvang, Gemeente Amsterdam'),
  ]);
}

function inhoudEn() {
  return richText([
    p(
      'From 1 December 2026 to 1 April 2027, the former school building at Pieter de Hoochstraat 78 will be a night shelter for up to 100 homeless people. There is an open house on Wednesday 25 November. Below is the letter the city sent on 6 November (translated from Dutch).',
    ),
    lijst([
      [vet('Shelter: '), '1 December 2026 to 1 April 2027, every day from 16:30 to 9:30'],
      [vet('Open house: '), 'Wednesday 25 November, 17:00–19:00, Pieter de Hoochstraat 78'],
      [vet('Questions, or want to help the shelter: '), 'HVO-Querido on site, ', tel()],
    ]),

    kop('h2', 'The letter'),
    p(schuin('Date: 6 November 2026')),
    p(vet('Subject: Winter shelter Pieter de Hoochstraat 76')),
    p('Dear resident/business owner,'),
    p(
      'From 1 December 2026 to 1 April 2027, the former school building at Pieter de Hoochstraat 78 will be a winter shelter for up to 100 homeless people. The shelter is intended for a vulnerable group. The building will only be used as a night shelter this winter; after that it will be available for education again. In February it already served briefly as an emergency shelter.',
    ),

    kop('h3', 'Why this shelter?'),
    p(
      'During the winter months the city provides temporary night shelter for vulnerable homeless people, so that they do not have to sleep outside when it is cold. The GGD (public health service) decides who is eligible. The shelter is intended for vulnerable people with ties to Amsterdam. They must also be willing to work towards a future.',
    ),

    kop('h3', 'How does the shelter work?'),
    p(
      'HVO-Querido runs the shelter. It is open every day from 16:30 until 09:30 the next morning. People get a bed, a hot meal, a hot shower and breakfast. During the day they are referred to drop-in facilities elsewhere in the city.',
    ),

    kop('h3', 'Invitation: open house'),
    p(
      'HVO-Querido invites you to an open house at the winter shelter at Pieter de Hoochstraat 78. On Wednesday 25 November you are very welcome between 17:00 and 19:00 to meet the HVO-Querido staff. They will give a tour of the building and explain how the shelter is organised. You can also ask questions and share suggestions.',
    ),

    kop('h3', 'Contact'),
    p(
      'For urgent questions about the location, contact HVO-Querido on site at ',
      tel(),
      '. You can also call this number if you would like to help the shelter.',
    ),
    p('The City of Amsterdam offers several kinds of winter shelter, see ', winteropvang('www.amsterdam.nl'), '.'),
    p('Kind regards,'),
    p('Zita Pels, alderman for Shelter, City of Amsterdam'),
  ]);
}

// ---- Uitvoeren ----
async function run() {
  const payload = await getClient();

  const gedeeld = { date: '2026-11-06T12:00:00.000Z' };
  const bestaand = await payload.find({
    collection: 'nieuws',
    where: { slug: { equals: SLUG } },
    overrideAccess: true,
    limit: 1,
  });

  let docId: number;
  if (bestaand.docs[0]) {
    docId = bestaand.docs[0].id;
    await payload.update({
      collection: 'nieuws',
      id: docId,
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, title: TITEL.nl, content: inhoudNl() },
    });
    console.log(`[seed-winteropvang] bijgewerkt: nieuws #${docId} (${SLUG})`);
  } else {
    const doc = await payload.create({
      collection: 'nieuws',
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, slug: SLUG, status: 'draft', alleenBuurt: false, title: TITEL.nl, content: inhoudNl() },
    });
    docId = doc.id;
    console.log(`[seed-winteropvang] aangemaakt als concept: nieuws #${docId} (${SLUG})`);
  }

  await payload.update({
    collection: 'nieuws',
    id: docId,
    overrideAccess: true,
    locale: 'en',
    data: { title: TITEL.en, content: inhoudEn() },
  });
  console.log('[seed-winteropvang] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

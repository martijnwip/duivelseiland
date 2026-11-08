/**
 * Nieuws-item over de adviesaanvraag aan de stadsdeelcommissie Zuid over de herinrichting van de
 * Roelof Hartstraat en het Roelof Hartplein (vastgesteld door het dagelijks bestuur op 27 oktober
 * 2026), met wat er voor Duivelseiland in staat en hoe je kunt inspreken. NL en EN.
 * Bron: de stukken op zuid.notubiz.nl (module Adviesaanvragen) en de pagina over inspreken.
 * Vervolg op de brief in scripts/seed-nieuws-roelof-hartstraat.ts.
 *
 * Het item komt als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de slug
 * al, dan wordt het item bijgewerkt (status blijft dan zoals hij is). Gebruikt de verkeerskaart uit
 * het eerdere bericht als afbeelding, als die er is.
 *
 *   bun run seed:roelof-hartstraat-commissie
 *   bun run seed:roelof-hartstraat-commissie:prod
 */
import { randomBytes } from 'node:crypto';
import { getClient } from './lib/payload-client';

const SLUG = 'roelof-hartstraat-stadsdeelcommissie';
const BRIEF_SLUG = 'herinrichting-roelof-hartstraat';
const AFBEELDING = 'verkeerskaart.jpg';
const NOTUBIZ = 'https://zuid.notubiz.nl';
const ADVIESAANVRAGEN = 'https://zuid.notubiz.nl/modules/3';
// Vergaderpagina's: daar komen de agenda, de stukken en de livestream.
const VERGADERING_18_NOV = 'https://zuid.notubiz.nl/vergadering/1489153';
const VERGADERING_2_DEC = 'https://zuid.notubiz.nl/vergadering/1489157';
const MAIL = 'bestuursondersteuning.sdz@amsterdam.nl';

type Locale = 'nl' | 'en';
type Tekst = Record<Locale, string>;

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const BOLD = 1;
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
type LexicalNode = { type: string; version: number; [k: string]: unknown };
const richText = (children: LexicalNode[]) => ({ root: { ...base, type: 'root', children } });

const notubiz = () => link(NOTUBIZ, 'zuid.notubiz.nl', true);
const adviesaanvragen = () => link(ADVIESAANVRAGEN, 'zuid.notubiz.nl/modules/3', true);
const mail = () => link(`mailto:${MAIL}`, MAIL);
const brief = (locale: Locale, label: string) =>
  link(locale === 'nl' ? `/nieuws/${BRIEF_SLUG}` : `/en/nieuws/${BRIEF_SLUG}`, label);

// ---- Inhoud ----
const TITEL: Tekst = {
  nl: 'Roelof Hartstraat bij de stadsdeelcommissie: wat er voor Duivelseiland in staat en hoe je inspreekt',
  en: 'Roelof Hartstraat at the district committee: what it means for Duivelseiland and how to speak',
};

function inhoudNl() {
  return richText([
    p(
      'Het dagelijks bestuur van stadsdeel Zuid vraagt de stadsdeelcommissie om advies over de herinrichting van de Roelof Hartstraat en het Roelof Hartplein. Daarna stelt het bestuur de plannen definitief vast. Bewoners mogen op de vergadering inspreken. Eerder schreven we over ',
      brief('nl', 'de brief van de gemeente en de inloopavond van 19 november'),
      '.',
    ),
    lijst([
      [
        vet('Vergadering: '),
        link(VERGADERING_18_NOV, 'woensdag 18 november', true),
        ' of ',
        link(VERGADERING_2_DEC, 'woensdag 2 december', true),
        ', 19.30 uur, commissiezaal, President Kennedylaan 923. Op welke van de twee het onderwerp staat, is nog niet bekend: de agenda komt meestal een week van tevoren online, op de pagina van de vergadering.',
      ],
      [vet('Live volgen en terugkijken: '), 'via dezelfde pagina van de vergadering'],
      [vet('Inspreken: '), 'aanmelden uiterlijk 09.00 uur op de dag van de vergadering (zie hieronder)'],
    ]),

    kop('h2', 'Waar de adviesaanvraag over gaat'),
    p(
      'De aanvraag heet "Adviesaanvraag concept nota van uitgangspunten herinrichting de Roelof Hartstraat en Roelof Hartplein". Het dagelijks bestuur stelde hem vast op 27 oktober 2026. De commissie geeft advies over de concept Nota van Uitgangspunten en het concept Voorlopig Ontwerp. De belangrijkste punten uit de stukken:',
    ),
    lijst([
      [
        vet('Tweede fietsring: '),
        'fietsers krijgen een brede strook naast de rijbaan, als "fietsstraat in wording". Nu fietsen ze op smalle fietspaden van ongeveer 1,80 m tussen de gevels en de bomen.',
      ],
      [
        vet('Geen linksaf meer '),
        'vanaf de Roelof Hartstraat naar de Joh. M. Coenenstraat en de Hobbemakade. De stukken noemen zelf het risico op sluipverkeer door de Harmoniehofbuurt, Duivelseiland en de Johannes Vermeerbuurt. De gemeente verwacht dat dat beperkt blijft.',
      ],
      [vet('Bredere stoepen, '), 'omdat het fietspad naar de rijbaan verhuist.'],
      [vet('Veiligere oversteekplaatsen '), 'voor voetgangers en fietsers.'],
      [vet('Drie tramhaltes '), 'worden breder en beter toegankelijk.'],
      [
        vet('Parkeren: '),
        'ongeveer 45 parkeerplaatsen verdwijnen en er komen meer laad- en losplekken. In Duivelseiland is de parkeerdruk nu al hoog; volgens de stukken wordt de balans hier eerst negatief, tot ongeveer 2031.',
      ],
      [
        vet('Bomen: '),
        '7 bomen worden gekapt en 2 verplaatst; volgens de stukken is daar geen alternatief voor. Van nog 20 bomen langs de rijbaan is kap waarschijnlijk ook nodig. Dat wordt nog onderzocht met grondradar en proefkuilen.',
      ],
      [
        vet('Water: '),
        'het Roelof Hartplein ligt laag. Bij een extreme bui (90 mm per uur) staat er meer dan 15 cm water. Er komt onder meer een hemelwaterriool, maar dat lost de wateroverlast niet helemaal op.',
      ],
    ]),
    p(
      'Over het schrappen van de linksafslag is de buurt niet om een besluit gevraagd: volgens de gemeente zijn er "geen goede alternatieven". De concept Nota van Uitgangspunten en het Voorlopig Ontwerp worden in november nog aan de buurt voorgelegd, waarschijnlijk op de inloopavond van 19 november. De reacties uit die buurtraadpleging gaan als bijlage mee naar het bestuur.',
    ),

    kop('h2', 'Inspreken'),
    lijst([
      [
        vet('Aanmelden '),
        'bij Bestuursondersteuning van stadsdeel Zuid, via het aanmeldformulier op de pagina over inspreken, uiterlijk 09.00 uur op de dag van de vergadering. Vermeld of je als bewoner of namens een organisatie spreekt, en geef je telefoonnummer en e-mailadres.',
      ],
      [vet('Spreektijd: '), 'twee à drie minuten. Wordt die korter, dan krijg je rond 16.00 uur op de vergaderdag een mail.'],
      [vet('Kopieën: '), 'neem er eventueel 15 mee om uit te delen.'],
      [vet('Met meer mensen? '), 'De gemeente raadt aan om met één of twee sprekers te komen.'],
      [vet('Openbaar: '), 'je naam en onderwerp komen in de vergaderstukken en de vergadering wordt opgenomen.'],
      [vet('Vragen: '), mail()],
    ]),

    kop('h2', 'De stukken zelf lezen'),
    p(
      'Zoek op ',
      notubiz(),
      ' naar "Roelof Hartplein" en sorteer op datum (nieuwste eerst). De adviesaanvraag staat in de module Adviesaanvragen: ',
      adviesaanvragen(),
      '. Er zitten bijlagen bij: profielen van de straat, een verslag van de vragen op de buurtbijeenkomst, een notitie over de verkeerseffecten en een presentatie over klimaatadaptatie.',
    ),
  ]);
}

function inhoudEn() {
  return richText([
    p(
      'The executive board of the Zuid district is asking the district committee (stadsdeelcommissie) for advice on the redesign of Roelof Hartstraat and Roelof Hartplein. After that, the board will adopt the plans. Residents may speak at the meeting. We wrote earlier about ',
      brief('en', 'the letter from the city and the drop-in evening on 19 November'),
      '.',
    ),
    lijst([
      [
        vet('Meeting: '),
        link(VERGADERING_18_NOV, 'Wednesday 18 November', true),
        ' or ',
        link(VERGADERING_2_DEC, 'Wednesday 2 December', true),
        ', 19:30, committee room, President Kennedylaan 923. Which of the two will cover this is not yet known: the agenda usually goes online about a week beforehand, on the meeting page.',
      ],
      [vet('Watch live or afterwards: '), 'on the same meeting page (in Dutch)'],
      [vet('Speaking: '), 'register by 09:00 on the day of the meeting (see below)'],
    ]),

    kop('h2', 'What the request for advice is about'),
    p(
      'The request is called "Adviesaanvraag concept nota van uitgangspunten herinrichting de Roelof Hartstraat en Roelof Hartplein". The executive board adopted it on 27 October 2026. The committee advises on the draft Memorandum of Principles (Nota van Uitgangspunten) and the draft Preliminary Design (Voorlopig Ontwerp). The main points from the documents:',
    ),
    lijst([
      [
        vet('Second cycle ring: '),
        'cyclists get a wide lane next to the carriageway, as a "cycle street in the making". Today they ride on narrow cycle paths of about 1.80 m between the façades and the trees.',
      ],
      [
        vet('No more left turns '),
        'from Roelof Hartstraat onto Joh. M. Coenenstraat and Hobbemakade. The documents themselves mention the risk of rat-running through the Harmoniehof neighbourhood, Duivelseiland and the Johannes Vermeer neighbourhood. The city expects this to stay limited.',
      ],
      [vet('Wider pavements, '), 'because the cycle path moves to the carriageway.'],
      [vet('Safer crossings '), 'for pedestrians and cyclists.'],
      [vet('Three tram stops '), 'become wider and more accessible.'],
      [
        vet('Parking: '),
        'about 45 parking spaces disappear and more loading bays are added. Parking pressure in Duivelseiland is already high; according to the documents the balance here will first turn negative, until around 2031.',
      ],
      [
        vet('Trees: '),
        '7 trees will be felled and 2 moved; according to the documents there is no alternative. Another 20 trees along the carriageway will probably also have to be felled. This is still being investigated with ground-penetrating radar and trial pits.',
      ],
      [
        vet('Water: '),
        'Roelof Hartplein is low-lying. In an extreme downpour (90 mm per hour) there is more than 15 cm of water. Among other things a rainwater sewer will be built, but that will not fully solve the flooding.',
      ],
    ]),
    p(
      'The neighbourhood was not asked to decide on removing the left turns: according to the city there are "no good alternatives". The draft Memorandum of Principles and Preliminary Design will be presented to the neighbourhood in November, probably at the drop-in evening on 19 November. The responses from that consultation go to the board as an appendix.',
    ),

    kop('h2', 'Speaking at the meeting'),
    lijst([
      [
        vet('Register '),
        'with Bestuursondersteuning (committee support) of the Zuid district, using the registration form on the page about speaking (inspreken), by 09:00 on the day of the meeting. Say whether you speak as a resident or on behalf of an organisation, and give your phone number and email address.',
      ],
      [vet('Speaking time: '), 'two to three minutes. If it is shortened, you will get an email around 16:00 on the day.'],
      [vet('Copies: '), 'you can bring 15 to hand out.'],
      [vet('With a group? '), 'The city recommends coming with one or two speakers.'],
      [vet('Public: '), 'your name and topic appear in the meeting documents and the meeting is recorded.'],
      [vet('Questions: '), mail()],
    ]),

    kop('h2', 'Reading the documents'),
    p(
      'Search ',
      notubiz(),
      ' for "Roelof Hartplein" and sort by date (newest first). The request is in the Adviesaanvragen module: ',
      adviesaanvragen(),
      '. It comes with appendices: street profiles, a report of questions from the neighbourhood meeting, a note on the traffic effects and a presentation on climate adaptation. The documents are in Dutch.',
    ),
  ]);
}

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
    console.warn(`[seed-roelof-hartstraat-commissie] ${AFBEELDING} niet gevonden; item komt er zonder afbeelding in.`);
  }

  const gedeeld = { date: '2026-11-08T12:00:00.000Z', image: beeld.docs[0]?.id ?? null };
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
    console.log(`[seed-roelof-hartstraat-commissie] bijgewerkt: nieuws #${docId} (${SLUG})`);
  } else {
    const doc = await payload.create({
      collection: 'nieuws',
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, slug: SLUG, status: 'draft', alleenBuurt: false, title: TITEL.nl, content: inhoudNl() },
    });
    docId = doc.id;
    console.log(`[seed-roelof-hartstraat-commissie] aangemaakt als concept: nieuws #${docId} (${SLUG})`);
  }

  await payload.update({
    collection: 'nieuws',
    id: docId,
    overrideAccess: true,
    locale: 'en',
    data: { title: TITEL.en, content: inhoudEn() },
  });
  console.log('[seed-roelof-hartstraat-commissie] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

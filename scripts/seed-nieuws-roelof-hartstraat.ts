/**
 * Zet de brief van de gemeente over de herinrichting van de Roelof Hartstraat en het Roelof Hartplein
 * (5 november 2026, kenmerk Z-21-81770) als Nieuws-item op de site, in het Nederlands en het Engels.
 * De tekst is overgenomen van foto's van de papieren brief; de kaarten en impressies zijn daaruit
 * uitgeknipt en staan in `scripts/assets/roelof-hartstraat/`.
 *
 * Het item komt als concept binnen: controleren en publiceren in /admin. Idempotent: bestaat de slug
 * al, dan wordt het item bijgewerkt (status blijft dan zoals hij is); bestaande afbeeldingen met
 * dezelfde bestandsnaam worden hergebruikt.
 *
 *   bun run seed:roelof-hartstraat
 *   bun run seed:roelof-hartstraat:prod
 */
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { Payload } from 'payload';
import { getClient } from './lib/payload-client';

const SLUG = 'herinrichting-roelof-hartstraat';
const ASSETS = path.join(import.meta.dirname, 'assets', 'roelof-hartstraat');
const PROJECTPAGINA = 'https://www.amsterdam.nl/projecten/roelof-hartstraat';
const MAIL = 'l.blom@amsterdam.nl';
const TEL = 'tel:+31618758783';
const TEL_LABEL = '06 187 587 83';

type Locale = 'nl' | 'en';
type Tekst = Record<Locale, string>;

// ---- Afbeeldingen ----
const BEELDEN = {
  projectgebied: {
    file: 'projectgebied.jpg',
    alt: {
      nl: 'Kaart van het projectgebied: de Roelof Hartstraat van de Van Baerlestraat en Joh. M. Coenenstraat tot de Hobbemakade, met het Roelof Hartplein',
      en: 'Map of the project area: Roelof Hartstraat from Van Baerlestraat and Joh. M. Coenenstraat to Hobbemakade, including Roelof Hartplein',
    },
    caption: { nl: 'Het projectgebied (rood omlijnd)', en: 'The project area (outlined in red)' },
  },
  impressie1: {
    file: 'impressie-1.jpg',
    alt: {
      nl: 'Impressie van de nieuwe Roelof Hartstraat: brede rode fietsstroken aan weerszijden van de tramsporen, bomen en fietsparkeren op de stoep',
      en: 'Impression of the new Roelof Hartstraat: wide red cycle lanes on both sides of the tram tracks, trees and bicycle parking on the pavement',
    },
    caption: { nl: 'Impressie van het concept Voorontwerp', en: 'Impression of the draft preliminary design' },
  },
  impressie2: {
    file: 'impressie-2.jpg',
    alt: {
      nl: 'Tweede impressie van de nieuwe Roelof Hartstraat richting het Roelof Hartplein, met rode fietsstroken langs de tramsporen',
      en: 'Second impression of the new Roelof Hartstraat towards Roelof Hartplein, with red cycle lanes along the tram tracks',
    },
    caption: { nl: 'Impressie van het concept Voorontwerp', en: 'Impression of the draft preliminary design' },
  },
  verkeerskaart: {
    file: 'verkeerskaart.jpg',
    alt: {
      nl: 'Kaart met de mogelijke verkeersstromen (blauw) en de twee linksafrichtingen die verdwijnen (rood): vanaf de Roelof Hartstraat naar de Joh. M. Coenenstraat en naar de Hobbemakade',
      en: 'Map with the possible traffic flows (blue) and the two left turns that will be removed (red): from Roelof Hartstraat towards Joh. M. Coenenstraat and towards Hobbemakade',
    },
    caption: {
      nl: 'Blauw: mogelijke verkeersstromen. Rood: op te heffen linksafrichting. Kaart © Routecraft',
      en: 'Blue: possible traffic flows. Red: left turn to be removed. Map © Routecraft',
    },
  },
} satisfies Record<string, { file: string; alt: Tekst; caption: Tekst }>;

type BeeldNaam = keyof typeof BEELDEN;
type BeeldIds = Record<BeeldNaam, number>;

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const BOLD = 1;
const ITALIC = 2;
const id = () => randomBytes(12).toString('hex');
const text = (t: string, format = 0) => ({ type: 'text', detail: 0, format, mode: 'normal', style: '', text: t, version: 1 });
const link = (url: string, label: string, newTab = false) => ({
  ...base,
  type: 'link',
  version: 3,
  id: id(),
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

function beeld(ids: BeeldIds, naam: BeeldNaam, locale: Locale) {
  return [
    { type: 'upload', version: 3, format: '', id: id(), fields: null, relationTo: 'media', value: ids[naam] },
    p(schuin(BEELDEN[naam].caption[locale])),
  ];
}

const mail = () => link(`mailto:${MAIL}`, MAIL);
const tel = () => link(TEL, TEL_LABEL);
const projectpagina = () => link(PROJECTPAGINA, 'www.amsterdam.nl/projecten/roelof-hartstraat', true);

// ---- Inhoud ----
const TITEL: Tekst = {
  nl: 'Herinrichting Roelof Hartstraat: inloopavond 19 november',
  en: 'Redesign of Roelof Hartstraat: drop-in evening on 19 November',
};

function inhoudNl(ids: BeeldIds) {
  return richText([
    p(
      'De Roelof Hartstraat en het Roelof Hartplein worden opnieuw ingericht. Inloopavond op donderdag 19 november, 20.00–22.00 uur, in Buurthuis De Coenen. Reageren op de plannen kan tot en met 5 december. Hieronder staat de brief die de gemeente op 5 november stuurde, met het informatieblad dat erbij zat.',
    ),
    lijst([
      [vet('Inloopavond: '), 'donderdag 19 november, 20.00–22.00 uur, Buurthuis De Coenen (tuinzaal), Johan M. Coenenstraat 4'],
      [vet('Reageren: '), 'tot en met 5 december 2026, op de avond zelf, per mail (', mail(), ') of telefoon (', tel(), ')'],
      [vet('Plannen en verslagen: '), projectpagina()],
    ]),

    kop('h2', 'De brief'),
    p(schuin('Datum: 5 november 2026 · Kenmerk: Z-21-81770 · Behandeld door: Linette Blom, Ingenieursbureau')),
    p(vet('Onderwerp: Herinrichting Roelof Hartstraat en Roelof Hartplein')),
    lijst([
      ['Uitnodiging inloop informatiebijeenkomst op 19 november 2026'],
      ['Buurtraadpleging over de concept Nota van Uitgangspunten en het Voorontwerp'],
    ]),
    p('Beste bewoner, ondernemer of organisatie,'),
    p(
      'We gaan de Roelof Hartstraat en Roelof Hartplein herinrichten. Hierover hebben we u eerder dit jaar per bewonersbrief geïnformeerd. Ook zijn er informatie- en ontwerpbijeenkomsten geweest voor het maken van het schetsontwerp. Hier hebben we toen veel reacties op ontvangen. Hierna is het project verder uitgewerkt. We hebben de concept Nota van Uitgangspunten en het concept Voorontwerp opgesteld.',
    ),

    kop('h3', 'Uitnodiging inloop informatiebijeenkomst'),
    p(
      'Graag nodigen we u uit voor een inloop informatiebijeenkomst over de plannen. Tijdens deze bijeenkomst kunt u reageren op de concept Nota van Uitgangspunten. Dit zijn de uitgangspunten waar het ontwerp aan moet voldoen. Ook kunt u reageren op het concept Voorontwerp.',
    ),
    lijst([
      [vet('Datum: '), 'donderdag 19 november'],
      [vet('Tijd: '), 'van 20.00 uur tot 22.00 uur'],
      [vet('Locatie: '), 'Buurthuis De Coenen, tuinzaal, Johan M. Coenenstraat 4, 1071 WG Amsterdam'],
    ]),
    p(
      'U kunt tussen 20.00 uur en 22.00 uur binnen lopen. Er is dit keer geen presentatie. Medewerkers van het project zijn aanwezig om de plannen met u te bespreken. De concept Nota van Uitgangspunten, het Voorontwerp en het verslag van eerdere bijeenkomsten kunt u online terugvinden op: ',
      projectpagina(),
    ),

    kop('h3', 'Hoe kunt u een reactie geven?'),
    lijst([
      [
        'Geef uw reactie mondeling of schriftelijk door op de inloopbijeenkomst op donderdag 19 november. Kunt u niet aanwezig zijn, maar wilt u wel met ons in gesprek? Neem dan telefonisch contact op met Linette Blom via het telefoonnummer ',
        tel(),
        ' of stuur een reactie per mail naar ',
        mail(),
        '.',
      ],
      ['U kunt tot uiterlijk 5 december 2026 een reactie geven op de plannen.'],
    ]),

    kop('h3', 'Wat gaat er gebeuren?'),
    p(
      'De straat is toe aan groot onderhoud. De verhardingen, tramsporen en kabels en leidingen moeten worden vervangen. Dit biedt kansen om de openbare ruimte te verbeteren: meer ruimte voor voetgangers, fietsers, groen en toegankelijke tramhaltes. We nemen ook maatregelen om de buurt beter bestand te maken tegen hevige regenval. De Roelof Hartstraat en -plein zijn onderdeel van de Tweede fietsring in Amsterdam: fietsers krijgen meer ruimte. Meer informatie over het project treft u op het informatieblad dat meegestuurd is met deze brief (bijlage 1, hieronder).',
    ),

    kop('h3', 'Planning en vervolg'),
    lijst([
      ['Momenteel zitten we in de participatiefase van het project.'],
      [
        'Na de buurtraadpleging worden het concept Voorontwerp en Nota van Uitgangspunten samen met het verslag van de buurtreacties voorgelegd aan het Dagelijks Bestuur van stadsdeel Zuid.',
      ],
      [
        'Nadat het Dagelijks Bestuur het concept Voorontwerp en de Nota van Uitgangspunten heeft vastgesteld werken we het Voorontwerp verder uit tot een Definitief Ontwerp. Naar verwachting is dit in begin 2027.',
      ],
      [
        'We organiseren voor de buurt nog een aantal participatiemomenten, bijvoorbeeld voor de inrichting van de stoepen, het plantsoen op het Roelof Hartplein of de afvalinzamelingslocatie naast het plantsoen. U ontvangt hierover van ons meer informatie.',
      ],
      ['Medio 2027: ontwerp gereed.'],
      ['Begin 2028 tot einde 2028: uitvoering werkzaamheden.'],
    ]),
    ...beeld(ids, 'projectgebied', 'nl'),

    kop('h3', 'Vragen?'),
    p(
      'Heeft u vragen over deze brief of wilt u zich aanmelden voor de mailinglijst? Neem dan contact op met omgevingsmanager Linette Blom via ',
      mail(),
      ' of bel ',
      tel(),
      '. Of kijk op de projectpagina ',
      projectpagina(),
      '.',
    ),
    p(
      'Wilt u het verslag van de bijeenkomsten van 17 november 2025 en 2 maart 2026 per mail ontvangen? Laat het ons weten, dan sturen we het toe.',
    ),
    p('Alvast hartelijk bedankt voor uw komst.'),
    p('Met vriendelijke groet,'),
    p('Steven Wijsman, projectleider, Gemeente Amsterdam'),

    kop('h2', 'Bijlage 1: Informatieblad project Roelof Hartstraat en Roelof Hartplein'),

    kop('h3', 'Achtergrond: de Tweede fietsring'),
    p(
      'De gemeente wil meer ruimte voor fietsers op drukke fietsroutes. Daarom komt er een Tweede fietsring. De Roelof Hartstraat en het Roelof Hartplein horen hierbij. De Tweede fietsring loopt van de Ceintuurbaan via de Roelof Hartstraat, de Van Baerlestraat, de Eerste Constantijn Huygensstraat en de Bilderdijkstraat naar de Frederik Hendrikstraat.',
    ),
    p(
      'De Binnenring rond het oude centrum is de eerste fietsring van Amsterdam en een voorbeeld voor de Tweede fietsring. Die loopt van het Haarlemmerplein via de Marnixstraat, Weteringschans, de Sarphatistraat naar de Czaar Peterstraat. Hier hebben fietsers al meer ruimte. Het duurt nog jaren voordat de hele Tweede fietsring klaar is. We werken duurzaam en vernieuwen straten pas als deze aan onderhoud toe zijn. Het eerste deel van de Tweede fietsring is al te zien op een deel van de Eerste Constantijn Huygensstraat en de Ceintuurbaan. Daar liggen nu brede fietsstroken. Nu zijn de Roelof Hartstraat en -plein aan de beurt.',
    ),

    kop('h3', 'Concept Voorontwerp voor de Roelof Hartstraat en het Roelof Hartplein'),
    p(
      'Op de Roelof Hartstraat maken we brede fietsstroken, verkeersdrempels en rijbanen van rood asfalt. Op de plek van het oude fietspad komt er meer ruimte voor voetgangers, fietsparkeren en betere groeiplaatsen voor bomen.',
    ),
    ...beeld(ids, 'impressie1', 'nl'),
    ...beeld(ids, 'impressie2', 'nl'),

    kop('h3', 'Amsterdam klimaatbestendig'),
    p(
      'We verwachten dat er in de toekomst vaker hevige regenbuien vallen. Dit kan zorgen voor een overvol riool, waardoor het water niet goed wegstroomt. De straat wordt dan moeilijk begaanbaar, ook voor nood- en hulpdiensten. Roelof Hartplein ligt ook lager dan de rest van de buurt. Al het water van de buurt stroomt hiernaartoe. Wanneer een straat aan onderhoud toe is, nemen we maatregelen: bijvoorbeeld meer groen, aanleg van een speciaal riool en plekken om water op te vangen.',
    ),
    p(
      'Dit project lost het waterprobleem op het plein niet op. Daarvoor moeten alle straten in de buurt worden aangepakt. Het draagt wel bij aan een betere situatie.',
    ),

    kop('h3', 'Opheffen van linksafrichtingen voor autoverkeer vanaf de Roelof Hartstraat naar de Joh. M. Coenenstraat en de Hobbemakade'),
    p(
      'Voor de brede fietsstroken op de rijbanen van de Roelof Hartstraat is er bij de kruisingen nu nog te weinig ruimte. Om ruimte te maken is het nodig dat er twee linksafrichtingen voor autoverkeer worden opgeheven: vanaf de Roelof Hartstraat naar de richting Joh. M. Coenenstraat en naar de Hobbemakade. De buurt en alle ondernemingen blijven goed bereikbaar, gedeeltelijk via andere routes.',
    ),
    ...beeld(ids, 'verkeerskaart', 'nl'),
    p(
      schuin(
        "Voor het inpassen van het nieuwe wegprofiel is het nodig dat er twee linksafrichtingen voor autoverkeer worden opgeheven: vanaf de Roelof Hartstraat kunnen auto's straks niet meer linksaf slaan richting de Joh. M. Coenenstraat en richting de Hobbemakade.",
      ),
    ),

    kop('h3', 'Omvormen parkeerplaatsen'),
    p(
      'Om ruimte te maken voor fietsers, voetgangers en betere groeiplaatsen voor de bomen moeten ook de parkeerplekken langs de Roelof Hartstraat worden opgeheven. Ze worden deels fietsstrook en deels groen of fietsparkeerplaatsen. Er blijven voldoende plekken voor laden en lossen. Ook worden er plekken omgevormd voor meer groen en fietsparkeren rond het Roelof Hartplein.',
    ),

    kop('h3', 'Bomen'),
    p(
      'Veel van de bomen die langs de Roelof Hartstraat staan zijn nu in een slechte of matige staat. Tegelijk met het onderzoek naar de conditie van de bomen zijn ook de gevolgen van het nieuwe ontwerp onderzocht. Voor het nieuwe ontwerp is het nodig dat er 7 bomen worden gekapt en 2 bomen moeten worden verplaatst. Deze bomen staan te dicht op het nieuwe wegprofiel of staan op het nieuwe wegprofiel. De bomen maken deel uit van de Hoofdbomenstructuur. Behoud is het uitgangspunt maar dat is niet altijd mogelijk. Er is ook veel wortelopdruk bij de bomen en de bestrating kan niet worden verhoogd.',
    ),
    p(
      'Daarnaast worden de mogelijkheden voor het duurzaam behouden van 20 andere bomen langs de Roelof Hartstraat nog nader onderzocht. Dit hangt ook af van de exacte locatie van het wortelpakket van de bomen. Recent (van 2 tot en met 5 november) is hiervoor ook een grondradaronderzoek uitgevoerd om de ondergrondse ligging van de wortels beter in beeld te brengen. Er zijn ook een aantal proefkuilen gegraven.',
    ),
    p(
      'Na de beoordeling van de resultaten van het onderzoek ontvangt de buurt hierover nog nadere informatie. Voor alle bomen die vervangen moeten worden wordt een omgevingsvergunning Kap aangevraagd en worden er nieuwe bomen terug geplant in de straat. Mogelijke aanpassingen aan het ontwerp voor de bomen worden meegenomen in de vervolgfase: de fase van Nota van Uitgangspunten naar Definitief Ontwerp.',
    ),
  ]);
}

function inhoudEn(ids: BeeldIds) {
  return richText([
    p(
      'Roelof Hartstraat and Roelof Hartplein are going to be redesigned. Drop-in evening on Thursday 19 November, 20:00–22:00, at Buurthuis De Coenen. You can respond to the plans until 5 December. Below is our English translation of the letter the city sent on 5 November, with the information sheet that came with it. The original is in Dutch.',
    ),
    lijst([
      [vet('Drop-in evening: '), 'Thursday 19 November, 20:00–22:00, Buurthuis De Coenen (garden room), Johan M. Coenenstraat 4'],
      [vet('Respond: '), 'until 5 December 2026, at the evening itself, by email (', mail(), ') or phone (', tel(), ')'],
      [vet('Plans and reports (in Dutch): '), projectpagina()],
    ]),

    kop('h2', 'The letter'),
    p(schuin('Date: 5 November 2026 · Reference: Z-21-81770 · Handled by: Linette Blom, Engineering Bureau')),
    p(vet('Subject: Redesign of Roelof Hartstraat and Roelof Hartplein')),
    lijst([
      ['Invitation to a drop-in information meeting on 19 November 2026'],
      ['Neighbourhood consultation on the draft Memorandum of Principles and the Preliminary Design'],
    ]),
    p('Dear resident, business owner or organisation,'),
    p(
      'We are going to redesign Roelof Hartstraat and Roelof Hartplein. We informed you about this earlier this year in a letter to residents. There were also information and design meetings to draw up the sketch design, and we received many responses at the time. Since then the project has been worked out in more detail. We have drawn up the draft Memorandum of Principles (Nota van Uitgangspunten) and the draft Preliminary Design (Voorontwerp).',
    ),

    kop('h3', 'Invitation to a drop-in information meeting'),
    p(
      'We would like to invite you to a drop-in information meeting about the plans. At this meeting you can respond to the draft Memorandum of Principles: the principles the design has to meet. You can also respond to the draft Preliminary Design.',
    ),
    lijst([
      [vet('Date: '), 'Thursday 19 November'],
      [vet('Time: '), 'from 20:00 to 22:00'],
      [vet('Location: '), 'Buurthuis De Coenen, garden room (tuinzaal), Johan M. Coenenstraat 4, 1071 WG Amsterdam'],
    ]),
    p(
      'You can drop in any time between 20:00 and 22:00. There is no presentation this time. Project staff will be there to discuss the plans with you. The draft Memorandum of Principles, the Preliminary Design and the report of earlier meetings are available online at: ',
      projectpagina(),
    ),

    kop('h3', 'How can you respond?'),
    lijst([
      [
        'Give your response verbally or in writing at the drop-in meeting on Thursday 19 November. Can’t make it, but would you still like to talk to us? Then call Linette Blom on ',
        tel(),
        ' or send your response by email to ',
        mail(),
        '.',
      ],
      ['You can respond to the plans until 5 December 2026 at the latest.'],
    ]),

    kop('h3', 'What is going to happen?'),
    p(
      'The street is due for major maintenance. The paving, tram tracks, and cables and pipes need to be replaced. This is an opportunity to improve the public space: more room for pedestrians, cyclists, greenery and accessible tram stops. We are also taking measures to make the neighbourhood more resilient to heavy rainfall. Roelof Hartstraat and Roelof Hartplein are part of Amsterdam’s Second Cycling Ring: cyclists will get more space. You can find more information about the project in the information sheet enclosed with this letter (appendix 1, below).',
    ),

    kop('h3', 'Planning and next steps'),
    lijst([
      ['We are currently in the participation phase of the project.'],
      [
        'After the neighbourhood consultation, the draft Preliminary Design and Memorandum of Principles, together with the report of the neighbourhood’s responses, will be submitted to the Executive Committee of the Zuid district.',
      ],
      [
        'Once the Executive Committee has adopted the draft Preliminary Design and the Memorandum of Principles, we will develop the Preliminary Design into a Final Design. We expect this to be in early 2027.',
      ],
      [
        'We will organise several more participation moments for the neighbourhood, for example on the layout of the pavements, the green space on Roelof Hartplein or the waste collection point next to it. We will send you more information about this.',
      ],
      ['Mid-2027: design finished.'],
      ['Early 2028 to end of 2028: construction work.'],
    ]),
    ...beeld(ids, 'projectgebied', 'en'),

    kop('h3', 'Questions?'),
    p(
      'Do you have questions about this letter, or would you like to join the mailing list? Contact the community liaison manager, Linette Blom, at ',
      mail(),
      ' or call ',
      tel(),
      '. Or visit the project page ',
      projectpagina(),
      '.',
    ),
    p(
      'Would you like to receive the report of the meetings of 17 November 2025 and 2 March 2026 by email? Let us know and we will send it to you.',
    ),
    p('Thank you in advance for coming.'),
    p('Kind regards,'),
    p('Steven Wijsman, project manager, City of Amsterdam'),

    kop('h2', 'Appendix 1: Information sheet, Roelof Hartstraat and Roelof Hartplein project'),

    kop('h3', 'Background: the Second Cycling Ring'),
    p(
      'The city wants more space for cyclists on busy cycle routes. That is why there will be a Second Cycling Ring (Tweede fietsring). Roelof Hartstraat and Roelof Hartplein are part of it. The Second Cycling Ring runs from Ceintuurbaan via Roelof Hartstraat, Van Baerlestraat, Eerste Constantijn Huygensstraat and Bilderdijkstraat to Frederik Hendrikstraat.',
    ),
    p(
      'The Inner Ring around the old centre is Amsterdam’s first cycling ring and an example for the Second Cycling Ring. It runs from Haarlemmerplein via Marnixstraat, Weteringschans and Sarphatistraat to Czaar Peterstraat. Cyclists already have more space there. It will be years before the whole Second Cycling Ring is finished. We work sustainably and only renew streets when they are due for maintenance. The first part of the Second Cycling Ring can already be seen on part of Eerste Constantijn Huygensstraat and Ceintuurbaan, which now have wide cycle lanes. Now it is the turn of Roelof Hartstraat and Roelof Hartplein.',
    ),

    kop('h3', 'Draft Preliminary Design for Roelof Hartstraat and Roelof Hartplein'),
    p(
      'On Roelof Hartstraat we will create wide cycle lanes, speed bumps and carriageways of red asphalt. Where the old cycle path is now, there will be more room for pedestrians, bicycle parking and better growing conditions for trees.',
    ),
    ...beeld(ids, 'impressie1', 'en'),
    ...beeld(ids, 'impressie2', 'en'),

    kop('h3', 'A climate-proof Amsterdam'),
    p(
      'We expect heavy downpours to become more frequent. This can overload the sewers, so the water cannot drain away properly. The street then becomes hard to use, including for emergency services. Roelof Hartplein is also lower than the rest of the neighbourhood, so all the water from the area flows towards it. When a street is due for maintenance, we take measures: for example more greenery, a special sewer and places to collect water.',
    ),
    p(
      'This project will not solve the water problem on the square. That would require tackling every street in the neighbourhood. It does help to improve the situation.',
    ),

    kop('h3', 'Removing left turns for cars from Roelof Hartstraat towards Joh. M. Coenenstraat and Hobbemakade'),
    p(
      'At the junctions there is currently too little space for wide cycle lanes on the Roelof Hartstraat carriageways. To make room, two left turns for cars have to be removed: from Roelof Hartstraat towards Joh. M. Coenenstraat and towards Hobbemakade. The neighbourhood and all businesses will remain easy to reach, partly via other routes.',
    ),
    ...beeld(ids, 'verkeerskaart', 'en'),
    p(
      schuin(
        'To fit the new road layout, two left turns for cars have to be removed: from Roelof Hartstraat, cars will no longer be able to turn left towards Joh. M. Coenenstraat or towards Hobbemakade.',
      ),
    ),

    kop('h3', 'Converting parking spaces'),
    p(
      'To make room for cyclists, pedestrians and better growing conditions for the trees, the parking spaces along Roelof Hartstraat also have to go. They will become partly cycle lane and partly greenery or bicycle parking. There will still be enough loading and unloading spaces. Spaces around Roelof Hartplein will also be converted for more greenery and bicycle parking.',
    ),

    kop('h3', 'Trees'),
    p(
      'Many of the trees along Roelof Hartstraat are currently in poor or mediocre condition. Alongside the survey of the trees’ condition, the effects of the new design were also examined. The new design requires 7 trees to be felled and 2 trees to be moved. These trees are too close to, or on, the new road layout. The trees are part of the city’s main tree structure (Hoofdbomenstructuur). Keeping them is the starting point, but that is not always possible. There is also a lot of root heave around the trees, and the paving cannot be raised.',
    ),
    p(
      'In addition, the options for keeping 20 other trees along Roelof Hartstraat in the long term are being examined further. This also depends on exactly where the trees’ roots are. Recently (2 to 5 November) a ground-penetrating radar survey was carried out to map the roots underground more accurately, and several trial pits were dug.',
    ),
    p(
      'Once the results of the survey have been assessed, the neighbourhood will receive more information. A felling permit will be applied for for every tree that has to be replaced, and new trees will be planted back in the street. Any changes to the design for the trees will be taken into the next phase: from the Memorandum of Principles to the Final Design.',
    ),
  ]);
}

// ---- Uitvoeren ----
async function zorgVoorBeeld(payload: Payload, naam: BeeldNaam): Promise<number> {
  const { file, alt, caption } = BEELDEN[naam];
  const bestaand = await payload.find({
    collection: 'media',
    where: { filename: { equals: file } },
    overrideAccess: true,
    limit: 1,
  });
  if (bestaand.docs[0]) return bestaand.docs[0].id;

  const bestandspad = path.join(ASSETS, file);
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    locale: 'nl',
    data: { alt: alt.nl, caption: caption.nl },
    file: { data: readFileSync(bestandspad), mimetype: 'image/jpeg', name: file, size: statSync(bestandspad).size },
  });
  await payload.update({
    collection: 'media',
    id: doc.id,
    overrideAccess: true,
    locale: 'en',
    data: { alt: alt.en, caption: caption.en },
  });
  console.log(`[seed-roelof-hartstraat] afbeelding geüpload: ${file} (#${doc.id})`);
  return doc.id;
}

async function run() {
  const payload = await getClient();

  const ids = {} as BeeldIds;
  for (const naam of Object.keys(BEELDEN) as BeeldNaam[]) {
    ids[naam] = await zorgVoorBeeld(payload, naam);
  }

  const gedeeld = { date: '2026-11-05T12:00:00.000Z', image: ids.impressie1 };
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
      data: { ...gedeeld, title: TITEL.nl, content: inhoudNl(ids) },
    });
    console.log(`[seed-roelof-hartstraat] bijgewerkt: nieuws #${docId} (${SLUG})`);
  } else {
    const doc = await payload.create({
      collection: 'nieuws',
      overrideAccess: true,
      locale: 'nl',
      data: { ...gedeeld, slug: SLUG, status: 'draft', alleenBuurt: false, title: TITEL.nl, content: inhoudNl(ids) },
    });
    docId = doc.id;
    console.log(`[seed-roelof-hartstraat] aangemaakt als concept: nieuws #${docId} (${SLUG})`);
  }

  await payload.update({
    collection: 'nieuws',
    id: docId,
    overrideAccess: true,
    locale: 'en',
    data: { title: TITEL.en, content: inhoudEn(ids) },
  });
  console.log('[seed-roelof-hartstraat] Engelse tekst gezet. Controleer en publiceer in /admin.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

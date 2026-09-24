/**
 * Vult het geschiedenisverhaal (global `geschiedenis-verhaal`) met de concepttekst uit
 * GESCHIEDENIS.md, in het Nederlands en Engels, en importeert de bijbehorende
 * archieffoto's uit de Beeldbank (met datering, maker en rechten).
 *
 *   bun run seed:geschiedenis           doet niets als het verhaal al een titel heeft
 *   bun run seed:geschiedenis --force   overschrijft het verhaal (foto's blijven)
 */
import { getClient } from './lib/payload-client';
import { fetchBeeldbankMetadata } from '../src/lib/beeldbank';

type L = { nl: string; en: string };
type Lang = keyof L;
const l = (nl: string, en: string): L => ({ nl, en });

const BEELDBANK = 'https://archief.amsterdam/beeldbank/detail/';
const FOTOS = {
  fabriekPrent: 'd47f4bf8-11d2-a9af-6f52-fb15d76e2b7b',
  fabriekTekening: 'ccbad743-957a-393e-cda7-b4a817797ffe',
  circus: 'd86e0706-7e65-2f05-a9c0-598eabf1474c',
  hbs1931: '552da911-da47-4f34-8de2-da12b24fd5b6',
  hbs1988: 'd10cd4b7-f622-adbc-d288-14da49f63199',
  terborgstraat: 'fb44c672-c837-c15b-c667-b668bf8ddba8',
  roelofHartstraat1906: '993ce645-e37a-6f53-79ba-e2f7cfaf4d6b',
  kinderen: 'dbe86bfe-8ae0-548f-5d8a-9823ce77ed3b',
  ruysdaelkade: '82b8bf55-0005-f68c-ffca-24d0657271bc',
  boerenwetering1907: '49efe490-243e-60e1-810c-3d72b08b5211',
  huizeLydia: '5552eb4a-1fa0-6939-27f8-011c977a2f1f',
  plein1930: '05886070-fdb4-a962-2256-40f00bf56796',
  vlaggendag: 'af1ecc37-1c6c-9be3-d25c-3aa5fb497383',
  plein1937: '346ba0df-e90a-7293-9f3e-cb03eb82f9de',
  plein6: '52ed67f1-4115-aadb-bb34-46e8221eee63',
} as const;
type FotoKey = keyof typeof FOTOS;

// ---- Lexical ----
const text = (t: string) => ({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1 });
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const paragraaf = (t: string) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(t)] });
const lijst = (items: string[]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((t, i) => ({ ...base, type: 'listitem', value: i + 1, children: [text(t)] })),
});
const richText = (children: object[]) => ({ root: { ...base, type: 'root', children } });

// ---- Inhoud ----
type Gebeurtenis = { datum: L; jaar?: number; icoon: string; titel: L; tekst: L; foto?: FotoKey; breuk?: L };
type TijdvakInhoud = {
  anker: string;
  band: L;
  kleur: 'grijs' | 'rood' | 'blauw' | 'groen';
  titel: L;
  kernzin: L;
  tekst: L[];
  gebeurtenissen?: Gebeurtenis[];
  fotos?: FotoKey[];
  kader?: { titel: L; tekst: L };
  infographic?: 'groeit' | 'eilanden' | 'fabriek' | 'omDeHoek' | 'maten';
};

const opening = {
  titel: l('Een eiland zonder water', 'An island without water'),
  ondertitel: l(
    'Hoe een stinkende uithoek aan de Boerenwetering een van de rustigste buurten van Zuid werd.',
    'How a smelly corner by the Boerenwetering became one of the quietest neighbourhoods in Amsterdam-Zuid.',
  ),
  openingszin: l('In 1906 rook het hier nog naar kaarsvet.', 'In 1906, this place still smelled of candle wax.'),
  intro: l(
    'Duivelseiland is geen eiland. Er is geen water omheen, er is nooit een veerpont geweest. Toch noemden Amsterdammers dit stukje stad rond 1900 naar het beruchtste eiland ter wereld: de strafkolonie in Frans-Guyana waar de Franse officier Alfred Dreyfus onschuldig gevangenzat. Dit is het verhaal van hoe dat kwam — en hoe het weer goed kwam.',
    "Duivelseiland — Devil's Island — is not an island. There is no water around it, and there never was a ferry. Yet around 1900, Amsterdammers named this corner of the city after the most notorious island in the world: the penal colony in French Guiana where the French officer Alfred Dreyfus was held, innocent. This is the story of how that happened — and how it turned out well.",
  ),
  kerncijfers: [
    { waarde: l('1896', '1896'), label: l('Amsterdam neemt het gebied over van Nieuwer-Amstel', 'Amsterdam takes over the area from Nieuwer-Amstel') },
    { waarde: l('ƒ1 mln', 'ƒ1 mln'), label: l('vraagprijs van de kaarsenfabriek voor haar grond', "the candle factory's asking price for its land") },
    { waarde: l('1906', '1906'), label: l('de fabriek verdwijnt — en Dreyfus wordt in ere hersteld', 'the factory disappears — and Dreyfus is exonerated') },
    { waarde: l('7.400 km', '7,400 km'), label: l("naar het echte Duivelseiland, in Frans-Guyana", "to the real Devil's Island, in French Guiana") },
  ],
};

const tijdvakken: TijdvakInhoud[] = [
  {
    anker: 'grens',
    band: l('tot 1896', 'until 1896'),
    kleur: 'grijs',
    titel: l('Aan de rand van twee gemeenten', 'On the edge of two municipalities'),
    kernzin: l('Tot 1896 was hier geen Amsterdam, maar Nieuwer-Amstel.', 'Until 1896, this was not Amsterdam but Nieuwer-Amstel.'),
    tekst: [
      l(
        'De Boerenwetering was eeuwenlang gewoon een poldersloot. Aan de ene kant groeide Amsterdam, aan de andere kant lag Nieuwer-Amstel, de gemeente die we nu als Amstelveen kennen. Precies op die grens stond de Koninklijke Waskaarsenfabriek.',
        'For centuries the Boerenwetering was just a polder ditch. On one side Amsterdam was growing; on the other lay Nieuwer-Amstel, the municipality we now know as Amstelveen. Right on that border stood the Royal Wax Candle Factory.',
      ),
      l(
        'Nieuwer-Amstel wist dat de grote stad het gebied wilde inlijven, en bouwde snel nog wat het zelf nodig vond. Een brug over de wetering verbond het Amsterdamse Zaagmolenpad met de Schagerlaan aan de overkant. In 1896 was het zover: Amsterdam annexeerde het gebied.',
        'Nieuwer-Amstel knew the big city wanted to annex the area, and quickly built what it still needed itself. A bridge over the wetering connected the Amsterdam Zaagmolenpad with the Schagerlaan on the other side. In 1896 it happened: Amsterdam annexed the area.',
      ),
    ],
    gebeurtenissen: [
      {
        datum: l('1882', '1882'),
        jaar: 1882,
        icoon: 'brug',
        titel: l('Een kade die verdween', 'A quay that disappeared'),
        tekst: l(
          'De eerste Hobbemakade wordt gegraven — en meteen weer gedempt. De naam komt later terug, op een andere plek.',
          'The first Hobbemakade is dug — and filled in again straight away. The name returns later, in a different place.',
        ),
      },
      {
        datum: l('1894', '1894'),
        jaar: 1894,
        icoon: 'school',
        titel: l('De HBS van Nieuwer-Amstel', "Nieuwer-Amstel's secondary school"),
        tekst: l(
          'Vlak voor de annexatie opent Nieuwer-Amstel een HBS aan het latere Roelof Hartplein. Tegenwoordig is het The College Hotel.',
          'Just before the annexation, Nieuwer-Amstel opens a secondary school (HBS) on what later becomes the Roelof Hartplein. Today it is The College Hotel.',
        ),
        foto: 'hbs1931',
        breuk: l('12 jaar later', '12 years later'),
      },
      {
        datum: l('1894–1896', '1894–1896'),
        jaar: 1895,
        icoon: 'brandweer',
        titel: l('Een post voor brandweer en politie', 'A fire and police post'),
        tekst: l(
          'Nieuwer-Amstel bouwt aan de Roelof Hartstraat nog een brandweer- en politiepost. Amsterdam vindt hem meteen te klein.',
          'Nieuwer-Amstel also builds a fire and police post on the Roelof Hartstraat. Amsterdam immediately finds it too small.',
        ),
      },
      {
        datum: l('1896', '1896'),
        jaar: 1896,
        icoon: 'kaart',
        titel: l('Amsterdam neemt over', 'Amsterdam takes over'),
        tekst: l(
          'Het gebied tussen Singelgracht en Van Baerlestraat wordt bij Amsterdam gevoegd. De Schagerlaan heet voortaan Ruysdaelstraat.',
          'The area between the Singelgracht and the Van Baerlestraat becomes part of Amsterdam. The Schagerlaan is renamed Ruysdaelstraat.',
        ),
      },
    ],
    infographic: 'groeit',
  },
  {
    anker: 'naam',
    band: l('1896–1906', '1896–1906'),
    kleur: 'rood',
    titel: l('Een eiland zonder water', 'An island without water'),
    kernzin: l(
      'Afgelegen, slecht bereikbaar en met de stank van de fabriek in de lucht: de bijnaam lag voor het oprapen.',
      'Remote, hard to reach and with the stench of the factory in the air: the nickname was there for the taking.',
    ),
    tekst: [
      l(
        'Na de annexatie kwamen er in de hoek achter het Roelof Hartplein eenvoudige huizen, veel soberder dan in de rest van de nieuwe Museumbuurt. Er stonden houten huisjes en schuren op opgehoogd zand; de straten waar we nu wonen bestonden nog niet. Je kwam er alleen via die ene brug bij de Ruysdaelstraat.',
        'After the annexation, simple houses appeared in the corner behind the Roelof Hartplein, far plainer than in the rest of the new museum district. Wooden cottages and sheds stood on raised sand; the streets we live in now did not exist yet. The only way in was that one bridge at the Ruysdaelstraat.',
      ),
      l(
        'Tegelijk ging in Frankrijk een verhaal de wereld over: kapitein Alfred Dreyfus, onterecht veroordeeld voor spionage, zat vast op het Île du Diable — het Duivelseiland. De Amsterdammers maakten de vergelijking snel: ook hun nieuwe buurtje lag afgesneden van de rest van de wereld.',
        "Meanwhile a story from France was making headlines worldwide: Captain Alfred Dreyfus, wrongly convicted of espionage, was held on the Île du Diable — Devil's Island. Amsterdammers were quick to make the comparison: their new neighbourhood, too, was cut off from the rest of the world.",
      ),
    ],
    gebeurtenissen: [
      {
        datum: l('1895', '1895'),
        jaar: 1895,
        icoon: 'eiland',
        titel: l('Dreyfus naar het Duivelseiland', "Dreyfus sent to Devil's Island"),
        tekst: l(
          'De Franse kapitein wordt verbannen naar een strafkolonie in Frans-Guyana. De wereld kijkt mee.',
          'The French captain is exiled to a penal colony in French Guiana. The world is watching.',
        ),
      },
      {
        datum: l('ca. 1896–1906', 'c. 1896–1906'),
        jaar: 1897,
        icoon: 'duivel',
        titel: l('Een buurt krijgt een bijnaam', 'A neighbourhood gets a nickname'),
        tekst: l(
          'Geïsoleerd, slecht bereikbaar en stinkend: Amsterdammers noemen het hoekje achter het Roelof Hartplein "Duivelseiland".',
          'Isolated, hard to reach and smelly: Amsterdammers call the corner behind the Roelof Hartplein "Duivelseiland".',
        ),
      },
      {
        datum: l('1899', '1899'),
        jaar: 1899,
        icoon: 'eiland',
        titel: l('Gratie voor Dreyfus', 'Dreyfus pardoned'),
        tekst: l('Dreyfus mag terug naar Frankrijk, maar is nog niet vrijgesproken.', 'Dreyfus may return to France, but he has not yet been cleared.'),
      },
      {
        datum: l('17 januari 1906', '17 January 1906'),
        jaar: 1906,
        icoon: 'camera',
        titel: l('Een fotograaf komt kijken', 'A photographer comes to look'),
        tekst: l(
          'J.L. Scherpenisse fotografeert zand, houten huizen en rennende kinderen — de beste momentopname van het "eiland" die we hebben.',
          'J.L. Scherpenisse photographs sand, wooden houses and children running — the best snapshot of the "island" we have.',
        ),
      },
    ],
    fotos: ['kinderen', 'terborgstraat'],
    kader: {
      titel: l('Wie was Dreyfus?', 'Who was Dreyfus?'),
      tekst: l(
        'Alfred Dreyfus (1859–1935) was een Joodse officier in het Franse leger. In 1894 werd hij ten onrechte veroordeeld voor spionage voor Duitsland en in 1895 verbannen naar het Duivelseiland, een rotsachtig eilandje voor de kust van Frans-Guyana, ruim 7.000 km van Amsterdam. De zaak verdeelde Frankrijk en haalde kranten over de hele wereld. In 1899 kreeg hij gratie; pas in 1906 werd hij volledig in ere hersteld.',
        "Alfred Dreyfus (1859–1935) was a Jewish officer in the French army. In 1894 he was wrongly convicted of spying for Germany and in 1895 exiled to Devil's Island, a rocky islet off the coast of French Guiana, more than 7,000 km from Amsterdam. The affair divided France and made newspapers around the world. He was pardoned in 1899; only in 1906 was he fully exonerated.",
      ),
    },
    infographic: 'eilanden',
  },
  {
    anker: 'fabriek',
    band: l('tot 1906', 'until 1906'),
    kleur: 'rood',
    titel: l('De fabriek die alles tegenhield', 'The factory that held everything back'),
    kernzin: l('Eén fabriek hield een hele stadsuitbreiding tien jaar lang tegen.', 'One factory held back an entire city extension for ten years.'),
    tekst: [
      l(
        'De Koninklijke Waskaarsenfabriek stond aan de Boerenwetering, op de oude gemeentegrens. Ze verspreidde een walgelijke stank, en haar afvalwater maakte de wetering er niet schoner op. Amsterdam wilde rond het nieuwe Rijksmuseum een chique buurt met villa\'s bouwen — maar wie wil er wonen naast zo\'n fabriek?',
        'The Royal Wax Candle Factory stood on the Boerenwetering, on the old municipal border. It spread a revolting stench, and its waste water did the wetering no good. Amsterdam wanted to build an elegant district of villas around the new Rijksmuseum — but who wants to live next to a factory like that?',
      ),
      l(
        'De stad wilde de grond kopen, maar de fabriek vroeg er een miljoen gulden voor. Pas in 1906 kwamen stad en fabriek eruit: de fabriek werd gekocht en gesloopt.',
        'The city wanted to buy the land, but the factory asked a million guilders for it. Only in 1906 did the city and the factory reach an agreement: the factory was bought and demolished.',
      ),
    ],
    fotos: ['fabriekTekening'],
    infographic: 'fabriek',
  },
  {
    anker: 'om-de-hoek',
    band: l('1881–1912', '1881–1912'),
    kleur: 'blauw',
    titel: l('Om de hoek: wat er kwam in plaats van huizen', 'Around the corner: what came instead of houses'),
    kernzin: l(
      'Zolang de fabriek er stond, wilde niemand hier wonen. Dus kwamen er een circus, een fietsschool en een brandweerkazerne.',
      'As long as the factory stood, nobody wanted to live here. So a circus, a cycling school and a fire station moved in.',
    ),
    tekst: [
      l(
        'De stad verhuurde de grond aan de Hobbemakade voor korte tijd, of verkocht die aan wie geen keus had of de stank voor lief nam. Tussen Rijksmuseum en Ruysdaelstraat kwam maar één blok woonhuizen; de rest was utiliteitsbouw.',
        'The city let the land along the Hobbemakade for short periods, or sold it to those who had no choice or put up with the smell. Between the Rijksmuseum and the Ruysdaelstraat only one block of houses was built; the rest were public and commercial buildings.',
      ),
    ],
    infographic: 'omDeHoek',
  },
  {
    anker: 'keerpunt',
    band: l('1906–1930', '1906–1930'),
    kleur: 'groen',
    titel: l('Het keerpunt', 'The turning point'),
    kernzin: l('Zodra de fabriek weg was, groeide het eiland vast aan de stad.', 'Once the factory was gone, the island grew into the city.'),
    tekst: [
      l(
        'Na de sloop kon er langs de Boerenwetering een tweede toegang komen: de Hobbemakade. Voor het eerst was het buurtje niet meer afhankelijk van één brug. Het duurde tot na de Eerste Wereldoorlog voordat de buurt af was, maar wie in 1930 over het Roelof Hartplein liep, stond in een modern stuk Amsterdam-Zuid — met een tramhalte voor de deur.',
        'After the demolition, a second way in could be built along the Boerenwetering: the Hobbemakade. For the first time the neighbourhood no longer depended on a single bridge. It took until after the First World War for the neighbourhood to be finished, but anyone crossing the Roelof Hartplein in 1930 stood in a modern part of Amsterdam-Zuid — with a tram stop right outside.',
      ),
    ],
    gebeurtenissen: [
      {
        datum: l('1906', '1906'),
        jaar: 1906,
        icoon: 'fabriek',
        titel: l('De fabriek gaat weg', 'The factory goes'),
        tekst: l(
          'De stad koopt de waskaarsenfabriek en sloopt die. In hetzelfde jaar wordt Dreyfus in ere hersteld.',
          'The city buys the candle factory and demolishes it. In the same year, Dreyfus is exonerated.',
        ),
      },
      {
        datum: l('na 1906', 'after 1906'),
        jaar: 1907,
        icoon: 'brug',
        titel: l('Een tweede toegang', 'A second way in'),
        tekst: l(
          'Langs de Boerenwetering wordt de Hobbemakade aangelegd. Het eiland is geen eiland meer.',
          'The Hobbemakade is built along the Boerenwetering. The island is no longer an island.',
        ),
        foto: 'boerenwetering1907',
      },
      {
        datum: l('ca. 1920', 'c. 1920'),
        jaar: 1920,
        icoon: 'huis',
        titel: l('Het Roelof Hartplein is af', 'The Roelof Hartplein is finished'),
        tekst: l(
          'Huize Lydia en de andere gebouwen rond het plein zijn klaar: het begin van Nieuw-Zuid.',
          'Huize Lydia and the other buildings around the square are complete: the beginning of Nieuw-Zuid.',
        ),
      },
      {
        datum: l('1927', '1927'),
        jaar: 1927,
        icoon: 'huis',
        titel: l('De Ruysdaelstraat wordt breder', 'The Ruysdaelstraat is widened'),
        tekst: l('De oude bebouwing van de Schagerlaan verdwijnt.', 'The old houses of the Schagerlaan disappear.'),
      },
      {
        datum: l('21 mei 1930', '21 May 1930'),
        jaar: 1930,
        icoon: 'kroon',
        titel: l('Koninklijk bezoek', 'A royal visit'),
        tekst: l(
          'Koningin Wilhelmina en prinses Juliana bezoeken Huize Lydia. Dertig jaar eerder wilde "geen net mens" hier komen.',
          'Queen Wilhelmina and Princess Juliana visit Huize Lydia. Thirty years earlier, "no respectable person" wanted to come here.',
        ),
        foto: 'huizeLydia',
      },
    ],
  },
  {
    anker: 'nu',
    band: l('nu', 'today'),
    kleur: 'groen',
    titel: l('Duivelseiland nu', 'Duivelseiland today'),
    kernzin: l('Alleen de naam herinnert nog aan het eiland.', 'Only the name still recalls the island.'),
    tekst: [
      l(
        'Duivelseiland is nu een buurt in het Museumkwartier (buurtcode KD09), ingeklemd tussen de Pijp en de Concertgebouwbuurt. Wie goed kijkt, ziet de geschiedenis nog terug.',
        'Duivelseiland is now a neighbourhood in the Museum Quarter (area code KD09), squeezed between De Pijp and the Concertgebouw district. Look closely and you can still see its history.',
      ),
    ],
    gebeurtenissen: [
      {
        datum: l('spoor 1', 'trace 1'),
        icoon: 'school',
        titel: l('The College Hotel', 'The College Hotel'),
        tekst: l('De HBS van Nieuwer-Amstel uit 1894, aan het Roelof Hartplein.', "Nieuwer-Amstel's 1894 secondary school, on the Roelof Hartplein."),
        breuk: l('bijna een eeuw later', 'almost a century later'),
      },
      {
        datum: l('spoor 2', 'trace 2'),
        icoon: 'zwemmer',
        titel: l('Het Zuiderbad', 'The Zuiderbad'),
        tekst: l('Een zwembad in een fietsschool uit 1898.', 'A swimming pool in an 1898 cycling school.'),
      },
      {
        datum: l('spoor 3', 'trace 3'),
        icoon: 'brug',
        titel: l('De knik bij de Albert Cuypstraat', 'The kink at the Albert Cuypstraat'),
        tekst: l(
          'Amsterdam wilde de brug elders, maar alleen de Ruysdaelstraat was breed genoeg.',
          'Amsterdam wanted the bridge elsewhere, but only the Ruysdaelstraat was wide enough.',
        ),
      },
      {
        datum: l('spoor 4', 'trace 4'),
        icoon: 'kaart',
        titel: l('De Hobbemakade', 'The Hobbemakade'),
        tekst: l('De tweede toegang, die pas na de sloop van de fabriek kon komen.', "The second way in, only possible after the factory's demolition."),
      },
    ],
    infographic: 'maten',
  },
];

const onbekend = {
  intro: l('Niet alles over Duivelseiland is zeker.', 'Not everything about Duivelseiland is certain.'),
  vragen: [
    l('Werd de fabriek in 1906 of in 1910 gesloopt?', 'Was the factory demolished in 1906 or in 1910?'),
    l('Klopt het verhaal over kinderarbeid?', 'Is the story about child labour true?'),
    l('Waar komt de aanduiding "wijk 50" vandaan die je soms leest?', 'Where does the label "district 50" that you sometimes read come from?'),
  ],
  oproep: l(
    'Heeft u oude foto\'s, verhalen of documenten over de buurt? We horen het graag.',
    'Do you have old photos, stories or documents about the neighbourhood? We would love to hear from you.',
  ),
};

const bronnen = [
  l('Stadsarchief Amsterdam, Beeldbank.', 'Amsterdam City Archives, Beeldbank.'),
  l(
    'Theo Bakker, "Annexaties en stadsuitbreidingen" en "Het Museumkwartier en de Koninklijke Fabriek van Waskaarsen" (theobakker.net).',
    'Theo Bakker, "Annexaties en stadsuitbreidingen" and "Het Museumkwartier en de Koninklijke Fabriek van Waskaarsen" (theobakker.net).',
  ),
  l('"Duivelseiland", onh.nl.', '"Duivelseiland", onh.nl.'),
  l('Wijkkrant nr. 1 (2025), Buurthuis Lydia.', 'Neighbourhood paper no. 1 (2025), Buurthuis Lydia.'),
];

const ARCHIEF: FotoKey[] = ['plein1930', 'vlaggendag', 'plein6', 'circus'];
const HERO: FotoKey = 'fabriekPrent';

// ---- Uitvoeren ----
async function run() {
  const force = process.argv.includes('--force');
  const payload = await getClient();
  const context = { disableRevalidate: true };

  const huidig = await payload.findGlobal({ slug: 'geschiedenis-verhaal', locale: 'nl', depth: 0 });
  if (huidig.titel && !force) {
    console.log('[seed-geschiedenis] het verhaal heeft al een titel — niets gedaan (gebruik --force om te overschrijven).');
    process.exit(0);
  }

  // 1. Foto's: bestaande (op bronUrl) hergebruiken, anders importeren uit de Beeldbank.
  const ids = {} as Record<FotoKey, number>;
  for (const [key, uuid] of Object.entries(FOTOS) as [FotoKey, string][]) {
    const bronUrl = BEELDBANK + uuid;
    const bestaand = await payload.find({
      collection: 'historische-fotos',
      where: { bronUrl: { equals: bronUrl } },
      limit: 1,
      overrideAccess: true,
    });
    if (bestaand.docs[0]) {
      ids[key] = bestaand.docs[0].id;
      continue;
    }
    const m = await fetchBeeldbankMetadata(bronUrl);
    const doc = await payload.create({
      collection: 'historische-fotos',
      overrideAccess: true,
      context,
      data: {
        title: m.title,
        description: m.description,
        imageUrl: m.imageUrl,
        bronUrl,
        datering: m.datering,
        vervaardiger: m.vervaardiger,
        rechten: m.rechten,
        status: 'published',
      },
    });
    ids[key] = doc.id;
    console.log(`[seed-geschiedenis] foto geïmporteerd: ${key} (${m.rechten}) — ${m.title}`);
  }

  // 2. Het verhaal, eerst in het Nederlands. Array-rijen krijgen daarbij een id; de Engelse
  //    versie moet dezelfde ids meegeven, anders maakt Payload nieuwe rijen aan.
  type Rij = { id?: string | null };
  const data = (lang: Lang, rijen?: { kerncijfers: Rij[]; tijdvakken: (Rij & { gebeurtenissen?: Rij[] | null })[]; bronnen: Rij[] }) => ({
    titel: opening.titel[lang],
    ondertitel: opening.ondertitel[lang],
    openingszin: opening.openingszin[lang],
    intro: opening.intro[lang],
    heroFoto: ids[HERO],
    kerncijfers: opening.kerncijfers.map((k, i) => ({ id: rijen?.kerncijfers[i]?.id, waarde: k.waarde[lang], label: k.label[lang] })),
    tijdvakken: tijdvakken.map((tv, i) => ({
      id: rijen?.tijdvakken[i]?.id,
      anker: tv.anker,
      band: tv.band[lang],
      kleur: tv.kleur,
      titel: tv.titel[lang],
      kernzin: tv.kernzin[lang],
      tekst: richText(tv.tekst.map((p) => paragraaf(p[lang]))),
      gebeurtenissen: (tv.gebeurtenissen ?? []).map((g, j) => ({
        id: rijen?.tijdvakken[i]?.gebeurtenissen?.[j]?.id,
        datum: g.datum[lang],
        jaar: g.jaar,
        icoon: g.icoon as 'huis',
        titel: g.titel[lang],
        tekst: g.tekst[lang],
        foto: g.foto ? ids[g.foto] : null,
        breukLabel: g.breuk?.[lang] ?? null,
      })),
      fotos: (tv.fotos ?? []).map((k) => ids[k]),
      kader: { titel: tv.kader?.titel[lang] ?? null, tekst: tv.kader?.tekst[lang] ?? null },
      infographic: tv.infographic ?? null,
    })),
    archief: ARCHIEF.map((k) => ids[k]),
    onbekendTekst: richText([
      paragraaf(onbekend.intro[lang]),
      lijst(onbekend.vragen.map((v) => v[lang])),
      paragraaf(onbekend.oproep[lang]),
    ]),
    bronnen: bronnen.map((b, i) => ({ id: rijen?.bronnen[i]?.id, tekst: b[lang] })),
  });

  const nl = await payload.updateGlobal({ slug: 'geschiedenis-verhaal', locale: 'nl', data: data('nl'), overrideAccess: true, context, depth: 0 });
  await payload.updateGlobal({
    slug: 'geschiedenis-verhaal',
    locale: 'en',
    data: data('en', {
      kerncijfers: nl.kerncijfers ?? [],
      tijdvakken: nl.tijdvakken ?? [],
      bronnen: nl.bronnen ?? [],
    }),
    overrideAccess: true,
    context,
    depth: 0,
  });

  console.log(`[seed-geschiedenis] verhaal gevuld: ${tijdvakken.length} tijdvakken, NL en EN.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-geschiedenis] MISLUKT:', err);
  process.exit(1);
});

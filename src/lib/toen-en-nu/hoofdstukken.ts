import type { StaticImageData } from 'next/image';
import jaensch from '../../../public/toen-en-nu/01-voorwoord/01-emile-jaensch.jpg';
import kaart1893 from '../../../public/toen-en-nu/02-duivelseiland/01-kaart-1893.jpg';
import gevel1898 from '../../../public/toen-en-nu/02-duivelseiland/02-gevel-hobbemakade-65.jpg';
import caNaamgever from '../../../public/toen-en-nu/03-cornelis-anthoniszstraat/01-cornelis-anthoniszoon.jpg';
import caOneven1968 from '../../../public/toen-en-nu/03-cornelis-anthoniszstraat/03-oneven-zijde-1968.jpg';
import caOneven2004 from '../../../public/toen-en-nu/03-cornelis-anthoniszstraat/04-oneven-zijde-2004.jpg';
import caKade1904 from '../../../public/toen-en-nu/03-cornelis-anthoniszstraat/05-naar-hobbemakade-1904.jpg';
import caKade2004 from '../../../public/toen-en-nu/03-cornelis-anthoniszstraat/06-naar-hobbemakade-2004.jpg';
import bfNaamgever from '../../../public/toen-en-nu/04-balthasar-floriszstraat/01-balthasar-floriszoon.jpg';
import bfKade1968 from '../../../public/toen-en-nu/04-balthasar-floriszstraat/03-vanaf-kade-1968.jpg';
import bfKade2004 from '../../../public/toen-en-nu/04-balthasar-floriszstraat/04-vanaf-kade-2004.jpg';
import bfKapper1940 from '../../../public/toen-en-nu/04-balthasar-floriszstraat/05-dameskapper-1940.jpg';
import bf49in2004 from '../../../public/toen-en-nu/04-balthasar-floriszstraat/06-nummer-49-2004.jpg';
import pbNaamgever from '../../../public/toen-en-nu/05-pieter-baststraat/01-pieter-bast.jpg';
import pbGlasenap from '../../../public/toen-en-nu/05-pieter-baststraat/02-schoenmakerij-van-glasenap.jpg';
import pbBegin1913 from '../../../public/toen-en-nu/05-pieter-baststraat/03-nummers-2-6-1913.jpg';
import pbBegin2004 from '../../../public/toen-en-nu/05-pieter-baststraat/04-begin-straat-2004.jpg';
import pbOneven1968 from '../../../public/toen-en-nu/05-pieter-baststraat/05-oneven-zijde-1968.jpg';
import pbOneven2004 from '../../../public/toen-en-nu/05-pieter-baststraat/06-oneven-zijde-2004.jpg';
import rhNaamgever from '../../../public/toen-en-nu/06-roelof-hartstraat/01-roelof-hart.jpg';
import rhKaart1895 from '../../../public/toen-en-nu/06-roelof-hartstraat/02-kaart-1895.jpg';
import rh1920 from '../../../public/toen-en-nu/06-roelof-hartstraat/03-richting-plein-1920.jpg';
import rh2004 from '../../../public/toen-en-nu/06-roelof-hartstraat/04-richting-plein-2004.jpg';
import alberto1987 from '../../../public/toen-en-nu/05-pieter-baststraat/07-alberto-explosie-1987.jpg';
import alberto1989 from '../../../public/toen-en-nu/05-pieter-baststraat/08-alberto-hersteld-1989.jpg';
import rp1323 from '../../../public/toen-en-nu/07-roelof-hartplein/01-nummers-13-23-2004.jpg';
import rpTekening from '../../../public/toen-en-nu/07-roelof-hartplein/02-tekening-nummers-13-23.jpg';
import rp1925 from '../../../public/toen-en-nu/07-roelof-hartplein/03-plein-1925.jpg';
import rp2004 from '../../../public/toen-en-nu/07-roelof-hartplein/04-plein-2004.jpg';
import hk5763 from '../../../public/toen-en-nu/08-hobbemakade/01-nummers-63-57-2004.jpg';
import hk1904 from '../../../public/toen-en-nu/08-hobbemakade/02-ruijsdaelkade-1904.jpg';
import hk1970 from '../../../public/toen-en-nu/08-hobbemakade/03-tot-balthasar-floriszstraat-jaren-70.jpg';
import hk2004 from '../../../public/toen-en-nu/08-hobbemakade/04-tot-balthasar-floriszstraat-2004.jpg';
import rsPompen1954 from '../../../public/toen-en-nu/09-ruysdaelstraat/01-benzinepompen-1954.jpg';
import rs1968 from '../../../public/toen-en-nu/09-ruysdaelstraat/03-nummers-26-56-1968.jpg';
import rs2004 from '../../../public/toen-en-nu/09-ruysdaelstraat/04-nummers-26-56-2004.jpg';
import rs1930 from '../../../public/toen-en-nu/09-ruysdaelstraat/05-tot-vermeerstraat-1930.jpg';
import rsVermeer2004 from '../../../public/toen-en-nu/09-ruysdaelstraat/06-tot-vermeerstraat-2004.jpg';
import vandenhoven from '../../../public/toen-en-nu/10-nawoord/01-laurien-van-den-hoven.jpg';
import type straten from './straten.json';

/**
 * Het boekje "Duivelseiland 1898-2004" als scrollverhaal op /toen-en-nu.
 * Elk hoofdstuk heeft beelden (foto, toen/nu-paar of kaart) en stappen: een korte tekst bij één beeld.
 * Bij een toen/nu-paar toont de stap met `nu: true` de foto van nu (de foto veegt over).
 * De volledige tekst uit het boekje staat in tekst.ts.
 */

export type Taal = 'nl' | 'en';
export type T = Record<Taal, string>;
export type Straat = keyof typeof straten;

/**
 * Voor foto's met een andere rechthebbende dan het Stadsarchief (`beschermd`). Sinds november 2026 is er
 * toestemming voor alle foto's en is er geen meer beschermd (zie docs/boekje/README.md en issue #75).
 */
export const TOESTEMMING_BESCHERMDE_FOTOS = false;

export type Bron = 'oudeboon' | 'archief' | 'boekje' | 'prentbriefkaart' | 'fotokaart';

export type Foto = {
  src: StaticImageData;
  alt: T;
  bijschrift: T;
  bron: Bron;
  /** Beeldnummer in de Beeldbank van het Stadsarchief. */
  beeldnummer?: string;
  /** Fotograaf; het Stadsarchief vraagt "Stadsarchief Amsterdam" plus de fotograaf als bronvermelding. */
  maker?: string;
  /** Rechthebbende is niet het Stadsarchief; alleen tonen met TOESTEMMING_BESCHERMDE_FOTOS. */
  beschermd?: boolean;
};

export type Beeld =
  | { soort: 'foto'; foto: Foto; jaar?: string; staand?: boolean }
  | { soort: 'toenNu'; toen: Foto; nu: Foto; jaren: [string | T, string] }
  | { soort: 'kaart'; straat?: Straat };

export type Stap = { beeld: string; nu?: boolean; tekst: T };

export type Hoofdstuk = {
  id: string;
  titel: string;
  ondertitel: T;
  beelden: Record<string, Beeld>;
  stappen: Stap[];
};

/** Fotograaf van de fotodienst van het Stadsarchief, gespeld zoals in de Beeldbank. */
const ARSATH = "J.M. Arsath Ro'is";

const BEELDBANK = 'https://archief.amsterdam/beeldbank/detail/';
export const beeldbankLink: Record<string, string> = {
  '010122007735': `${BEELDBANK}b962935a-f35d-05c8-8524-b1e24b882bbe`,
  '010122008058': `${BEELDBANK}0c60a57c-e4a5-2b67-8bf2-e4559a5a1093`,
  '010122007836': `${BEELDBANK}14cd3378-4235-e2f6-7db5-c4aaea65145c`,
  '010122009078': `${BEELDBANK}a5aadf40-c3d5-9ecb-3367-5f707262d433`,
  '010107000778': `${BEELDBANK}2dcf4ebc-e41b-aeb9-7f0d-1a7fec019202`,
  OSIM00008003820: `${BEELDBANK}975a96b4-9f4c-f5c2-8e25-5c77281859fb`,
  '010122032170': `${BEELDBANK}51262b72-fa40-3f69-2c54-0a510044aa77`,
  B00000005392: `${BEELDBANK}68b1c175-d80b-24d9-ebef-ef0a0d7e4481`,
  B00000005390: `${BEELDBANK}0f22424c-6288-2bc2-00f1-200cf229ed96`,
};

const f = (src: StaticImageData, bron: Bron, alt: T, bijschrift: T, extra: Partial<Foto> = {}): Foto => ({ src, bron, alt, bijschrift, ...extra });

/**
 * Openingsfoto. Het boekje opent met een luchtfoto van Het Parool (2 september 2004); daar is (nog) geen
 * toestemming voor, dus hier de Pieter Baststraat in 1968, dezelfde foto als op de deelafbeelding.
 */
export const OMSLAG = f(
  pbOneven1968,
  'archief',
  { nl: 'Oneven zijde van de Pieter Baststraat in 1968, met rijwielhandel Jorg op de hoek', en: 'Odd-numbered side of the Pieter Baststraat in 1968, with Jorg’s bicycle shop on the corner' },
  { nl: 'Pieter Baststraat, 12 juli 1968', en: 'Pieter Baststraat, 12 July 1968' },
  { beeldnummer: '010122007836', maker: ARSATH },
);

export const VOORWOORD = {
  naam: 'Emile Jaensch',
  rol: { nl: 'Projectwethouder Duivelseiland, 2004', en: 'Alderman for the Duivelseiland project, 2004' },
  citaat: {
    nl: 'In totaal zijn 272 panden en ruim 900 woningen opgeknapt.',
    en: 'In total, 272 buildings and more than 900 homes were renovated.',
  },
  foto: f(jaensch, 'oudeboon', { nl: 'Emile Jaensch op een straathoek in Duivelseiland', en: 'Emile Jaensch on a street corner in Duivelseiland' }, { nl: '', en: '' }),
};

export const NAWOORD = {
  naam: 'Laurien van den Hoven',
  rol: { nl: 'Wijkwethouder Museumkwartier, 2004', en: 'Alderman for Museumkwartier, 2004' },
  citaat: {
    nl: 'Met de afronding van de stadsvernieuwing moet de betrokkenheid van de buurt natuurlijk niet ophouden.',
    en: 'With the completion of the urban renewal, the involvement of the neighbourhood should of course not stop.',
  },
  foto: f(vandenhoven, 'oudeboon', { nl: 'Portret van Laurien van den Hoven', en: 'Portrait of Laurien van den Hoven' }, { nl: '', en: '' }),
};

export const HOOFDSTUKKEN: Hoofdstuk[] = [
  {
    id: 'duivelseiland',
    titel: 'Duivelseiland',
    ondertitel: { nl: 'Een aparte naam voor een aparte buurt', en: 'An odd name for an odd neighbourhood' },
    beelden: {
      kaart1893: {
        soort: 'foto',
        jaar: '1893',
        foto: f(
          kaart1893,
          'boekje',
          { nl: 'Kaart van Amsterdam en omgeving in 1893, met een vergrootglas op het latere Duivelseiland', en: 'Map of Amsterdam and surroundings in 1893, with a magnifying glass over the later Duivelseiland' },
          { nl: 'Kaart van Amsterdam en omgeving in 1893', en: 'Map of Amsterdam and surroundings in 1893' },
        ),
      },
      kaart: { soort: 'kaart' },
      gevel: {
        soort: 'foto',
        jaar: '1898',
        staand: true,
        foto: f(
          gevel1898,
          'oudeboon',
          { nl: 'Bovenkant van een gevel met de stenen "ANNO" en "1898"', en: 'Top of a facade with the stones "ANNO" and "1898"' },
          { nl: 'Gevel van Hobbemakade 65', en: 'Facade of Hobbemakade 65' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart1893',
        tekst: {
          nl: 'In 1893 ligt hier nog niets. Tot mei 1896 hoort de grond bij Nieuwer-Amstel, het huidige Amstelveen: een onverlichte, rommelige uithoek.',
          en: 'In 1893 there is nothing here yet. Until May 1896 the land belongs to Nieuwer-Amstel, today’s Amstelveen: an unlit, messy corner.',
        },
      },
      {
        beeld: 'kaart',
        tekst: {
          nl: 'Omstreeks 1897 wordt een driehoekig stuk grond aan de Boerenwetering met zand opgehoogd om er huizen op te bouwen.',
          en: 'Around 1897 a triangular plot on the Boerenwetering is raised with sand so houses can be built on it.',
        },
      },
      {
        beeld: 'kaart',
        tekst: {
          nl: 'De kranten staan vol over Dreyfus, de Franse kapitein die vastzit op het kale Duivelseiland voor de kust van Frans-Guyana.',
          en: 'The papers are full of Dreyfus, the French captain imprisoned on barren Devil’s Island off the coast of French Guiana.',
        },
      },
      {
        beeld: 'kaart',
        tekst: {
          nl: 'Wie ’s avonds over het bouwterrein loopt, zucht: “Het lijkt hier wel Duivelseiland!” De gemeente neemt de naam over voor wijk 50.',
          en: 'People crossing the building site at night sigh: “It’s like Devil’s Island here!” The city adopts the name for ward 50.',
        },
      },
      {
        beeld: 'gevel',
        tekst: {
          nl: 'In 1898 komt de eerste nieuwbouw. Het jaartal staat nog altijd boven in de gevel van Hobbemakade 65.',
          en: 'The first new buildings go up in 1898. The year is still at the top of the facade of Hobbemakade 65.',
        },
      },
    ],
  },

  {
    id: 'cornelis-anthoniszstraat',
    titel: 'Cornelis Anthoniszstraat',
    ondertitel: { nl: 'Vroeger en nu', en: 'Then and now' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Cornelis Anthoniszstraat' },
      naamgever: {
        soort: 'foto',
        foto: f(
          caNaamgever,
          'boekje',
          { nl: 'Portret van Cornelis Anthoniszoon voor zijn houtsnedekaart van Amsterdam uit 1544', en: 'Portrait of Cornelis Anthoniszoon in front of his 1544 woodcut map of Amsterdam' },
          { nl: 'Cornelis Anthoniszoon, met zijn kaart van Amsterdam uit 1544', en: 'Cornelis Anthoniszoon, with his 1544 map of Amsterdam' },
        ),
      },
      oneven: {
        soort: 'toenNu',
        jaren: ['1968', '2004'],
        toen: f(
          caOneven1968,
          'archief',
          { nl: 'Oneven zijde van de Cornelis Anthoniszstraat in 1968, zwart-wit', en: 'Odd-numbered side of the Cornelis Anthoniszstraat in 1968, black and white' },
          { nl: 'Oneven zijde, 9 juli 1968', en: 'Odd-numbered side, 9 July 1968' },
          { beeldnummer: '010122007735', maker: ARSATH },
        ),
        nu: f(
          caOneven2004,
          'oudeboon',
          { nl: 'Oneven zijde van de Cornelis Anthoniszstraat in 2004', en: 'Odd-numbered side of the Cornelis Anthoniszstraat in 2004' },
          { nl: 'Oneven zijde, 2004', en: 'Odd-numbered side, 2004' },
        ),
      },
      kade: {
        soort: 'toenNu',
        jaren: ['1904', '2004'],
        toen: f(
          caKade1904,
          'prentbriefkaart',
          { nl: 'Prentbriefkaart van de Cornelis Anthoniszstraat uit 1904 met spelende kinderen', en: '1904 postcard of the Cornelis Anthoniszstraat with children playing' },
          { nl: 'Gezien naar de Hobbemakade, prentbriefkaart 1904', en: 'Looking towards the Hobbemakade, postcard 1904' },
        ),
        nu: f(
          caKade2004,
          'oudeboon',
          { nl: 'De Cornelis Anthoniszstraat in 2004 met bomen aan beide kanten', en: 'The Cornelis Anthoniszstraat in 2004 with trees on both sides' },
          { nl: 'Gezien naar de Hobbemakade, 2004', en: 'Looking towards the Hobbemakade, 2004' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: { nl: 'De Cornelis Anthoniszstraat. De huizen aan beide kanten zijn uit 1900.', en: 'The Cornelis Anthoniszstraat. The houses on both sides date from 1900.' },
      },
      {
        beeld: 'naamgever',
        tekst: {
          nl: 'Genoemd naar Cornelis Anthoniszoon (ca. 1500-1554), schilder en kaartmaker. In 1544 maakte hij een houtsnedekaart van Amsterdam.',
          en: 'Named after Cornelis Anthoniszoon (c. 1500-1554), painter and mapmaker. In 1544 he made a woodcut map of Amsterdam.',
        },
      },
      {
        beeld: 'oneven',
        tekst: {
          nl: 'De oneven kant in 1968. Aan de onderpuien zie je nog dat hier overal winkels en bedrijfjes zaten.',
          en: 'The odd-numbered side in 1968. The shopfronts still show there were shops and small businesses everywhere.',
        },
      },
      {
        beeld: 'oneven',
        nu: true,
        tekst: {
          nl: 'Dezelfde plek in 2004. Bij de renovatie zijn de dakkapellen en andere historische details van dit blok hersteld.',
          en: 'The same spot in 2004. During the renovation the dormers and other historic details of this block were restored.',
        },
      },
      {
        beeld: 'kade',
        tekst: {
          nl: 'Gezien naar de Hobbemakade, op een prentbriefkaart uit 1904. Op nummer 23 zat ooit een zaal voor bruiloften en partijen.',
          en: 'Looking towards the Hobbemakade, on a postcard from 1904. Number 23 once had a hall for weddings and parties.',
        },
      },
      {
        beeld: 'kade',
        nu: true,
        tekst: {
          nl: 'Honderd jaar later: een woonstraat met veel jonge gezinnen, en bomen.',
          en: 'A hundred years later: a residential street with many young families, and trees.',
        },
      },
    ],
  },

  {
    id: 'balthasar-floriszstraat',
    titel: 'Balthasar Floriszstraat',
    ondertitel: { nl: 'Vroeger en nu', en: 'Then and now' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Balthasar Floriszstraat' },
      naamgever: {
        soort: 'foto',
        foto: f(
          bfNaamgever,
          'boekje',
          { nl: 'Gotische kerktoren voor een detail van de kaart van Amsterdam uit 1625', en: 'Gothic church tower in front of a detail of the 1625 map of Amsterdam' },
          { nl: 'Detail van de kaart van Amsterdam met de uitbreiding van 1625', en: 'Detail of the map of Amsterdam with the 1625 extension' },
        ),
      },
      kade: {
        soort: 'toenNu',
        jaren: ['1968', '2004'],
        toen: f(
          bfKade1968,
          'archief',
          { nl: 'De Balthasar Floriszstraat vanaf de kade in 1968, met een man op een brommer', en: 'The Balthasar Floriszstraat from the quay in 1968, with a man on a moped' },
          { nl: 'Vanaf de kade, 9 juli 1968', en: 'From the quay, 9 July 1968' },
          { beeldnummer: '010122008058', maker: ARSATH },
        ),
        nu: f(
          bfKade2004,
          'oudeboon',
          { nl: 'De Balthasar Floriszstraat vanaf de kade in 2004, met een winkel op de hoek', en: 'The Balthasar Floriszstraat from the quay in 2004, with a shop on the corner' },
          { nl: 'Vanaf de kade, 2004', en: 'From the quay, 2004' },
        ),
      },
      kapper: {
        soort: 'toenNu',
        jaren: ['1940', '2004'],
        toen: f(
          bfKapper1940,
          'archief',
          { nl: 'Etalage met het opschrift Dameskapper en een paspop, huisnummer 49', en: 'Shop window reading Dameskapper (ladies’ hairdresser) with a mannequin, number 49' },
          { nl: 'De dameskapper op nummer 49, omstreeks 1940', en: 'The ladies’ hairdresser at number 49, around 1940' },
        ),
        nu: f(
          bf49in2004,
          'oudeboon',
          { nl: 'Hetzelfde raam van nummer 49 in 2004, nu met gordijnen en een fiets ervoor', en: 'The same window of number 49 in 2004, now with curtains and a bicycle in front' },
          { nl: 'Nummer 49 in 2004', en: 'Number 49 in 2004' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: { nl: 'De Balthasar Floriszstraat werd volgebouwd in 1899 en 1900.', en: 'The Balthasar Floriszstraat was built up in 1899 and 1900.' },
      },
      {
        beeld: 'naamgever',
        tekst: {
          nl: 'Genoemd naar Balthasar Floriszoon van Berckenrode (1591-1644), kaartmaker en landmeter.',
          en: 'Named after Balthasar Floriszoon van Berckenrode (1591-1644), mapmaker and surveyor.',
        },
      },
      {
        beeld: 'kade',
        tekst: {
          nl: 'Vanaf de kade in 1968. Er is nog geen eenrichtingsverkeer, en er staat geen boom.',
          en: 'From the quay in 1968. There is no one-way traffic yet, and not a single tree.',
        },
      },
      {
        beeld: 'kade',
        nu: true,
        tekst: {
          nl: 'Bij de herinrichting van 1998 kwamen er bomen. De straat is een stuk groener geworden.',
          en: 'Trees were planted when the street was redesigned in 1998. It has become much greener.',
        },
      },
      {
        beeld: 'kapper',
        tekst: {
          nl: 'Tot in de jaren vijftig zaten hier winkels: een verfhandel op 11, een houthandel op 19, een banketbakker op 29. En rond 1940 een dameskapper op 49.',
          en: 'Until the 1950s the street had shops: paint at 11, timber at 19, pastries at 29. And around 1940 a ladies’ hairdresser at 49.',
        },
      },
      {
        beeld: 'kapper',
        nu: true,
        tekst: { nl: 'Hetzelfde raam in 2004. Nu woont er iemand.', en: 'The same window in 2004. Now someone lives there.' },
      },
    ],
  },

  {
    id: 'pieter-baststraat',
    titel: 'Pieter Baststraat',
    ondertitel: { nl: 'Het hart van de buurt', en: 'The heart of the neighbourhood' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Pieter Baststraat' },
      naamgever: {
        soort: 'foto',
        foto: f(
          pbNaamgever,
          'boekje',
          { nl: 'Getekende figuur met hoed die uitkijkt over de vogelvluchtkaart van Amsterdam uit 1597', en: 'Drawn figure in a hat looking out over the 1597 bird’s-eye map of Amsterdam' },
          { nl: 'Pieter Bast, met zijn vogelvluchtkaart van Amsterdam uit 1597', en: 'Pieter Bast, with his 1597 bird’s-eye map of Amsterdam' },
        ),
      },
      begin: {
        soort: 'toenNu',
        jaren: ['1913', '2004'],
        toen: f(
          pbBegin1913,
          'fotokaart',
          { nl: 'Fotokaart van het pas gebouwde rijtje huizen aan de Pieter Baststraat 2-6, met een sigarenmagazijn op de hoek', en: 'Photo card of the newly built row of houses at Pieter Baststraat 2-6, with a cigar shop on the corner' },
          { nl: 'Nummer 2-6 op een fotokaart, waarschijnlijk 1913', en: 'Numbers 2-6 on a photo card, probably 1913' },
        ),
        nu: f(
          pbBegin2004,
          'oudeboon',
          { nl: 'Het begin van de Pieter Baststraat in 2004, met de sigarenwinkel en de herenkapper', en: 'The start of the Pieter Baststraat in 2004, with the tobacconist and the barber' },
          { nl: 'Het begin van de straat, 2004', en: 'The start of the street, 2004' },
        ),
      },
      oneven: {
        soort: 'toenNu',
        jaren: ['1968', '2004'],
        toen: f(
          pbOneven1968,
          'archief',
          { nl: 'Oneven zijde van de Pieter Baststraat in 1968, met rijwielhandel Jorg op de hoek', en: 'Odd-numbered side of the Pieter Baststraat in 1968, with Jorg’s bicycle shop on the corner' },
          { nl: 'Oneven zijde, 12 juli 1968', en: 'Odd-numbered side, 12 July 1968' },
          { beeldnummer: '010122007836', maker: ARSATH },
        ),
        nu: f(
          pbOneven2004,
          'oudeboon',
          { nl: 'Oneven zijde van de Pieter Baststraat in 2004', en: 'Odd-numbered side of the Pieter Baststraat in 2004' },
          { nl: 'Oneven zijde, 2004', en: 'Odd-numbered side, 2004' },
        ),
      },
      glasenap: {
        soort: 'foto',
        foto: f(
          pbGlasenap,
          'boekje',
          { nl: 'Etalage van schoenmakerij Van Glasenap met vlaggen en een bord met het getal 50', en: 'Window of the Van Glasenap shoe repair shop with flags and a sign with the number 50' },
          { nl: 'Schoenmakerij Van Glasenap, Pieter Baststraat 31', en: 'Van Glasenap shoe repair, Pieter Baststraat 31' },
        ),
      },
      // Niet uit het boekje: de explosie van 1987, uit kranten in Delpher en de Beeldbank (zie docs/boekje/README.md).
      alberto: {
        soort: 'toenNu',
        jaren: ['1987', '1989'],
        toen: f(
          alberto1987,
          'archief',
          { nl: 'Brandweerlieden in het puin van het Alberto-pand op de hoek van de Pieter Baststraat en de Roelof Hartstraat, avond van 20 december 1987', en: 'Firefighters in the rubble of the Alberto building on the corner of the Pieter Baststraat and the Roelof Hartstraat, evening of 20 December 1987' },
          { nl: 'Explosie in het Alberto-pand, 20 december 1987', en: 'Explosion in the Alberto building, 20 December 1987' },
          { beeldnummer: 'B00000005392', maker: 'Frans Busselman' },
        ),
        nu: f(
          alberto1989,
          'archief',
          { nl: 'Het herbouwde hoekpand met boogramen, geparkeerde auto’s ervoor, 1989', en: 'The rebuilt corner building with arched windows and parked cars in front, 1989' },
          { nl: 'Het Alberto-pand gerestaureerd, 4 november 1989', en: 'The Alberto building restored, 4 November 1989' },
          { beeldnummer: 'B00000005390', maker: 'Frans Busselman' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: {
          nl: 'De Pieter Baststraat was vanaf het begin een goede plek om een winkel te beginnen.',
          en: 'From the start, the Pieter Baststraat was a good place to open a shop.',
        },
      },
      {
        beeld: 'naamgever',
        tekst: {
          nl: 'Genoemd naar Pieter Bast (gestorven 1605), kaartmaker en kopergraveur uit Antwerpen.',
          en: 'Named after Pieter Bast (died 1605), mapmaker and copper engraver from Antwerp.',
        },
      },
      {
        beeld: 'begin',
        tekst: {
          nl: 'Het pas gebouwde rijtje op nummer 2-6, rond 1913. Sinds 1912 zit op nummer 2 een sigarenwinkel; op 2a begon Chr. Sorel dat jaar een kapperszaak.',
          en: 'The newly built row at numbers 2-6, around 1913. A tobacconist has been at number 2 since 1912; that year Chr. Sorel opened a barber’s at 2a.',
        },
      },
      {
        beeld: 'begin',
        nu: true,
        tekst: {
          nl: 'In 2004 zitten er nog altijd een sigarenwinkel en een herenkapper.',
          en: 'In 2004 there is still a tobacconist and a barber.',
        },
      },
      {
        beeld: 'oneven',
        tekst: {
          nl: 'De oneven kant op 12 juli 1968, met rijwielhandel Jorg op de hoek van de Roelof Hartstraat.',
          en: 'The odd-numbered side on 12 July 1968, with Jorg’s bicycle shop on the corner of the Roelof Hartstraat.',
        },
      },
      {
        beeld: 'oneven',
        nu: true,
        tekst: { nl: 'Dezelfde kant in 2004.', en: 'The same side in 2004.' },
      },
      {
        beeld: 'alberto',
        tekst: {
          nl: 'Zondag 20 december 1987, even voor zes uur ’s avonds: een enorme klap op de hoek met de Roelof Hartstraat. Drankenwinkel Alberto en de woning erboven worden weggeslagen.',
          en: 'Sunday 20 December 1987, just before six in the evening: a huge blast on the corner with the Roelof Hartstraat. The Alberto off-licence and the flat above it are blown apart.',
        },
      },
      {
        beeld: 'alberto',
        tekst: {
          nl: 'Drie gewonden, zo’n veertig mensen dakloos en honderden ruiten kapot. Omdat Alberto bij Ahold hoort, gaat het gerucht dat de ontvoerders van Gerrit Jan Heijn erachter zitten.',
          en: 'Three people injured, some forty left homeless and hundreds of windows shattered. Because Alberto belongs to Ahold, rumour has it that Gerrit Jan Heijn’s kidnappers are behind it.',
        },
      },
      {
        beeld: 'alberto',
        nu: true,
        tekst: {
          nl: 'In januari 1988 blijkt het gewoon gas: iemand had de leiding in huis slecht gesoldeerd. Het pand wordt bijna precies zo herbouwd; zo staat het er in 1989.',
          en: 'In January 1988 it turns out to be plain gas: someone had badly soldered the pipe inside. The building is rebuilt almost exactly as it was; this is 1989.',
        },
      },
      {
        beeld: 'glasenap',
        tekst: {
          nl: 'Van 1906 tot 2003, bijna een eeuw en drie generaties lang, zat schoenmakerij Van Glasenap op nummer 31.',
          en: 'From 1906 to 2003, almost a century and three generations, the Van Glasenap shoe repair shop was at number 31.',
        },
      },
    ],
  },

  {
    id: 'roelof-hartstraat',
    titel: 'Roelof Hartstraat',
    ondertitel: { nl: 'De bochtige grens van Duivelseiland', en: 'The winding edge of Duivelseiland' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Roelof Hartstraat' },
      naamgever: {
        soort: 'foto',
        foto: f(
          rhNaamgever,
          'boekje',
          { nl: 'Portret van Roelof Hart naast een beeld ter ere van zijn 25-jarig ambtsjubileum', en: 'Portrait of Roelof Hart next to a statue marking his 25 years in office' },
          { nl: 'Roelof Hart (1837-1892)', en: 'Roelof Hart (1837-1892)' },
        ),
      },
      kaart1895: {
        soort: 'foto',
        jaar: '1895',
        staand: true,
        foto: f(
          rhKaart1895,
          'boekje',
          { nl: 'Kaart uit 1895 met de Roelof Hartstraat en de gemeentegrens in blauw', en: '1895 map with the Roelof Hartstraat and the municipal boundary in blue' },
          { nl: '1895: Roelof Hartstraat en gemeentegrens', en: '1895: Roelof Hartstraat and municipal boundary' },
        ),
      },
      plein: {
        soort: 'toenNu',
        jaren: ['1920', '2004'],
        toen: f(
          rh1920,
          'archief',
          { nl: 'De Roelof Hartstraat in 1920 vanaf de brug, met een tram', en: 'The Roelof Hartstraat in 1920 from the bridge, with a tram' },
          { nl: 'Richting Roelof Hartplein, 1920', en: 'Towards the Roelof Hartplein, 1920' },
        ),
        nu: f(
          rh2004,
          'oudeboon',
          { nl: 'De Roelof Hartstraat in 2004 vanaf dezelfde brug', en: 'The Roelof Hartstraat in 2004 from the same bridge' },
          { nl: 'Richting Roelof Hartplein, 2004', en: 'Towards the Roelof Hartplein, 2004' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: {
          nl: 'Alleen de oneven nummers van de Roelof Hartstraat, 1 tot en met 31, horen bij Duivelseiland. De overkant is de Harmoniehofbuurt.',
          en: 'Only the odd numbers of the Roelof Hartstraat, 1 to 31, belong to Duivelseiland. The other side is the Harmoniehof neighbourhood.',
        },
      },
      {
        beeld: 'naamgever',
        tekst: {
          nl: 'Roelof Hart (1837-1892) was dokter, raadslid en weldoener in Nieuwer-Amstel. Een jaar na zijn dood kreeg hij een straat.',
          en: 'Roelof Hart (1837-1892) was a doctor, councillor and benefactor in Nieuwer-Amstel. A year after his death he got a street.',
        },
      },
      {
        beeld: 'kaart1895',
        tekst: {
          nl: 'Toen liep de straat van het Concertgebouw tot de Boerenwetering. Pas in 1917 werd het eerste stuk de Van Baerlestraat.',
          en: 'Back then the street ran from the Concertgebouw to the Boerenwetering. Only in 1917 did the first stretch become the Van Baerlestraat.',
        },
      },
      {
        beeld: 'plein',
        tekst: { nl: 'Vanaf de brug richting het plein, in 1920.', en: 'From the bridge towards the square, in 1920.' },
      },
      {
        beeld: 'plein',
        nu: true,
        tekst: {
          nl: 'In 2004. Op nummer 17 zat jarenlang een bakker, op 31 een café met hotel.',
          en: 'In 2004. Number 17 was a bakery for years, number 31 a café and hotel.',
        },
      },
    ],
  },

  {
    id: 'roelof-hartplein',
    titel: 'Roelof Hartplein',
    ondertitel: { nl: 'Perikelen bij de naamgeving', en: 'Trouble over a name' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Roelof Hartplein' },
      huizen: {
        soort: 'foto',
        foto: f(
          rp1323,
          'oudeboon',
          { nl: 'De huizen Roelof Hartplein 13-23 achter de bomen van het plein', en: 'The houses at Roelof Hartplein 13-23 behind the trees of the square' },
          { nl: 'Roelof Hartplein 13-23, 2004', en: 'Roelof Hartplein 13-23, 2004' },
        ),
      },
      tekening: {
        soort: 'foto',
        foto: f(
          rpTekening,
          'boekje',
          { nl: 'Pentekening van de huizen Roelof Hartplein 13-23', en: 'Pen drawing of the houses at Roelof Hartplein 13-23' },
          { nl: 'Roelof Hartplein 13-23', en: 'Roelof Hartplein 13-23' },
        ),
      },
      plein: {
        soort: 'toenNu',
        jaren: [{ nl: 'ca. 1924', en: 'c. 1924' }, '2004'],
        toen: f(
          rp1925,
          'archief',
          { nl: 'Het onbebouwde Roelof Hartplein rond 1924, een zandvlakte', en: 'The empty Roelof Hartplein around 1924, a sandy plain' },
          { nl: 'Het plein, nog niet af (ca. 1924)', en: 'The square, not yet finished (c. 1924)' },
          { beeldnummer: '010107000778', maker: 'ing. J. van Dijk' },
        ),
        nu: f(
          rp2004,
          'oudeboon',
          { nl: 'Huize Lydia aan het Roelof Hartplein in 2004, met terrassen', en: 'Huize Lydia on the Roelof Hartplein in 2004, with terraces' },
          { nl: 'Het plein zoals we het nu kennen', en: 'The square as we know it today' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: {
          nl: 'Het Roelof Hartplein, in de bocht tussen de straten. Het plein was pas af in 1928.',
          en: 'The Roelof Hartplein, in the bend between the streets. The square was only finished in 1928.',
        },
      },
      {
        beeld: 'huizen',
        tekst: {
          nl: 'De huizen op nummer 13-23 zijn uit 1899. Toen heetten ze nog Roelof Hartstraat 70-60, en keken ze uit op tuinderijen.',
          en: 'The houses at numbers 13-23 date from 1899. They were then called Roelof Hartstraat 70-60 and looked out over market gardens.',
        },
      },
      {
        beeld: 'tekening',
        tekst: {
          nl: 'Van 1920 tot 1923 woonde de schilder G.H. Breitner op nummer 23.',
          en: 'From 1920 to 1923 the painter G.H. Breitner lived at number 23.',
        },
      },
      {
        beeld: 'plein',
        tekst: {
          nl: 'In 1917 wilden raadsleden liever een Van Baerleplein. “Wat doet die Nieuweramstelse dokter tussen al die schilders?”',
          en: 'In 1917 some councillors preferred a Van Baerleplein. “What is that Nieuwer-Amstel doctor doing among all those painters?”',
        },
      },
      {
        beeld: 'plein',
        nu: true,
        tekst: {
          nl: 'Op 6 juni 1917 won Roelof Hart toch: achttien stemmen tegen zeventien.',
          en: 'On 6 June 1917 Roelof Hart won after all: eighteen votes to seventeen.',
        },
      },
    ],
  },

  {
    id: 'hobbemakade',
    titel: 'Hobbemakade',
    ondertitel: { nl: 'Hoe het groeide', en: 'How it grew' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Hobbemakade' },
      ansicht: {
        soort: 'foto',
        jaar: '1904',
        foto: f(
          hk1904,
          'prentbriefkaart',
          { nl: 'Prentbriefkaart van de Ruijsdaelkade met tuindershuizen en een hoge fabriek aan het water', en: 'Postcard of the Ruijsdaelkade with gardeners’ houses and a tall factory on the water' },
          { nl: 'Prentbriefkaart, verzonden op 11 oktober 1904', en: 'Postcard, sent on 11 October 1904' },
        ),
      },
      kade: {
        soort: 'toenNu',
        jaren: ['1959', '2004'],
        toen: f(
          hk1970,
          'archief',
          { nl: 'De Hobbemakade in 1959, met de bloemenboot aan de kade', en: 'The Hobbemakade in 1959, with the flower boat at the quay' },
          // Het boekje zegt "jaren zeventig"; de Beeldbank dateert de foto op maart 1959.
          { nl: 'Tot aan de Balthasar Floriszstraat, maart 1959', en: 'Up to the Balthasar Floriszstraat, March 1959' },
          { beeldnummer: '010122032170', maker: ARSATH },
        ),
        nu: f(
          hk2004,
          'oudeboon',
          { nl: 'De Hobbemakade in 2004 met bootjes en volgroeide bomen', en: 'The Hobbemakade in 2004 with boats and full-grown trees' },
          { nl: 'Tot aan de Balthasar Floriszstraat, 2004', en: 'Up to the Balthasar Floriszstraat, 2004' },
        ),
      },
      panden: {
        soort: 'foto',
        foto: f(
          hk5763,
          'oudeboon',
          { nl: 'Hobbemakade 63-57 in 2004, met het gele hoekpand van een restaurant', en: 'Hobbemakade 63-57 in 2004, with the yellow corner building of a restaurant' },
          { nl: 'Hobbemakade 63-57, 2004', en: 'Hobbemakade 63-57, 2004' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: {
          nl: 'Dit stuk Hobbemakade werd aangelegd in 1898, tegelijk met de eerste nieuwbouw.',
          en: 'This stretch of the Hobbemakade was laid out in 1898, together with the first new buildings.',
        },
      },
      {
        beeld: 'ansicht',
        tekst: {
          nl: 'Daarvoor lagen hier groentetuinen aan het water. Langs het water lopen kon niet; je meerde aan bij een steiger.',
          en: 'Before that there were vegetable gardens on the water. You could not walk along it; you moored at a landing stage.',
        },
      },
      {
        beeld: 'kade',
        tekst: {
          nl: 'Toen lag de bloemenboot nog aan de Hobbemakade, en ook een kolenschuit. De kolen werden verkocht in het souterrain van nummer 61.',
          en: 'Back then the flower boat was still moored on the Hobbemakade, and so was a coal barge. The coal was sold in the basement of number 61.',
        },
      },
      {
        beeld: 'kade',
        nu: true,
        tekst: { nl: 'In 2004 ligt de bloemenboot aan de Ruysdaelkade.', en: 'By 2004 the flower boat has moved to the Ruysdaelkade.' },
      },
      {
        beeld: 'panden',
        tekst: {
          nl: 'Nummer 61 tot en met 67 bouwde J.H. Gottmer. Het gevelontwerp, met het jaartal 1900, is van architect J.H. Lesmeister.',
          en: 'Numbers 61 to 67 were built by J.H. Gottmer. The facade design, with the year 1900, is by architect J.H. Lesmeister.',
        },
      },
    ],
  },

  {
    id: 'ruysdaelstraat',
    titel: 'Ruysdaelstraat',
    ondertitel: { nl: 'Veel ouder dan de rest van Duivelseiland', en: 'Much older than the rest of Duivelseiland' },
    beelden: {
      kaart: { soort: 'kaart', straat: 'Ruysdaelstraat' },
      pompen: {
        soort: 'foto',
        jaar: '1954',
        foto: f(
          rsPompen1954,
          'archief',
          { nl: 'De Ruysdaelstraat in 1954 van bovenaf, met benzinepompen op de stoep en een tram in de verte', en: 'The Ruysdaelstraat from above in 1954, with petrol pumps on the pavement and a tram in the distance' },
          { nl: 'Bedrijven en benzinepompen, augustus 1954', en: 'Businesses and petrol pumps, August 1954' },
          { beeldnummer: 'OSIM00008003820' },
        ),
      },
      even: {
        soort: 'toenNu',
        jaren: ['1968', '2004'],
        toen: f(
          rs1968,
          'archief',
          { nl: 'Ruysdaelstraat 26-56 in 1968, met veel geparkeerde auto’s', en: 'Ruysdaelstraat 26-56 in 1968, with many parked cars' },
          { nl: 'Nummer 26 tot en met 56, 12 juli 1968', en: 'Numbers 26 to 56, 12 July 1968' },
          { beeldnummer: '010122009078', maker: ARSATH },
        ),
        nu: f(
          rs2004,
          'oudeboon',
          { nl: 'Ruysdaelstraat 26-56 in september 2004, met een vol terras op de hoek', en: 'Ruysdaelstraat 26-56 in September 2004, with a busy terrace on the corner' },
          { nl: 'Nummer 26 tot en met 56, september 2004', en: 'Numbers 26 to 56, September 2004' },
        ),
      },
      tram: {
        soort: 'toenNu',
        jaren: ['1930', '2004'],
        toen: f(
          rs1930,
          'prentbriefkaart',
          { nl: 'Prentbriefkaart van de Ruysdaelstraat rond 1930, met tramrails en handkarren', en: 'Postcard of the Ruysdaelstraat around 1930, with tram tracks and handcarts' },
          { nl: 'Tot de Johannes Vermeerstraat, prentbriefkaart ca. 1930', en: 'Up to the Johannes Vermeerstraat, postcard c. 1930' },
        ),
        nu: f(
          rsVermeer2004,
          'oudeboon',
          { nl: 'De Ruysdaelstraat in 2004 met tramhalte en bovenleiding', en: 'The Ruysdaelstraat in 2004 with a tram stop and overhead wires' },
          { nl: 'Tot de Johannes Vermeerstraat, 2004', en: 'Up to the Johannes Vermeerstraat, 2004' },
        ),
      },
    },
    stappen: [
      {
        beeld: 'kaart',
        tekst: {
          nl: 'De Ruysdaelstraat is veel ouder dan de rest. In de zeventiende eeuw was dit de Schagerlaan, langs moestuinen en boomgaarden.',
          en: 'The Ruysdaelstraat is much older than the rest. In the seventeenth century this was the Schagerlaan, past vegetable gardens and orchards.',
        },
      },
      {
        beeld: 'pompen',
        tekst: { nl: 'Bedrijven en benzinepompen in 1954.', en: 'Businesses and petrol pumps in 1954.' },
      },
      {
        beeld: 'even',
        tekst: {
          nl: 'Nummer 26 tot en met 56 in 1968: ook toen al vol auto’s. De huizen 44 tot en met 52 zijn uit 1881.',
          en: 'Numbers 26 to 56 in 1968: full of cars even then. The houses at 44 to 52 date from 1881.',
        },
      },
      {
        beeld: 'even',
        nu: true,
        tekst: { nl: 'Dezelfde huizen in september 2004.', en: 'The same houses in September 2004.' },
      },
      {
        beeld: 'tram',
        tekst: {
          nl: 'Rond 1930. In 1923-1924 werd de straat tien meter breder, zodat er een tweede tramspoor voor lijn 16 bij kon.',
          en: 'Around 1930. In 1923-1924 the street was made ten metres wider, to fit a second track for tram line 16.',
        },
      },
      {
        beeld: 'tram',
        nu: true,
        tekst: { nl: 'In 2004, met tramhalte en bovenleiding.', en: 'In 2004, with a tram stop and overhead wires.' },
      },
    ],
  },
];

const beschermd = (b: Beeld) =>
  b.soort === 'foto' ? b.foto.beschermd : b.soort === 'toenNu' ? b.toen.beschermd || b.nu.beschermd : false;

/**
 * Het hoofdstuk zoals het op de site komt: zonder toestemming valt een beschermde foto weg.
 * Bij een toen/nu-paar blijft dan de foto van nu staan (als losse foto), zodat de tekst een beeld houdt.
 */
export function zichtbaar(h: Hoofdstuk): Hoofdstuk {
  if (TOESTEMMING_BESCHERMDE_FOTOS) return h;
  const beelden: Record<string, Beeld> = {};
  for (const [k, b] of Object.entries(h.beelden)) {
    if (!beschermd(b)) beelden[k] = b;
    else if (b.soort === 'toenNu' && !b.nu.beschermd) beelden[k] = { soort: 'foto', foto: b.nu, jaar: b.jaren[1] };
  }
  return { ...h, beelden, stappen: h.stappen.filter((s) => s.beeld in beelden).map((s) => (beelden[s.beeld].soort === 'toenNu' ? s : { ...s, nu: undefined })) };
}

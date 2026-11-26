/**
 * Haalt de hartlijnen van de straten van Duivelseiland uit OpenStreetMap (Overpass) en schrijft ze
 * als SVG-paden in de coördinaten van de basiskaart (src/lib/afval/basemap.json) naar
 * src/lib/toen-en-nu/straten.json. Gebruikt door de kaart op /toen-en-nu, die per hoofdstuk één straat oplicht.
 *
 *   bun run scripts/toen-en-nu-straten.ts
 */
import { writeFile } from 'fs/promises';
import { VIEW_WGS84 } from '../src/lib/afval/constants';
import { toView, wgs84ToRd } from '../src/lib/afval/geo';

const STRATEN = [
  'Hobbemakade',
  'Cornelis Anthoniszstraat',
  'Balthasar Floriszstraat',
  'Pieter Baststraat',
  'Roelof Hartstraat',
  'Roelof Hartplein',
  'Ruysdaelstraat',
] as const;

const [w, s, e, n] = VIEW_WGS84;
const namen = STRATEN.join('|');
const query = `[out:json][timeout:25];way["highway"]["name"~"^(${namen})$"](${s},${w},${n},${e});out geom;`;

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'duivelseiland-buurtsite' },
  body: `data=${encodeURIComponent(query)}`,
});
if (!res.ok) throw new Error(`Overpass: HTTP ${res.status}`);
const { elements } = (await res.json()) as {
  elements: { tags: { name: string; highway: string }; geometry: { lat: number; lon: number }[] }[];
};

// Alleen rijbanen en woonstraten; fietspaden en stoepen met dezelfde naam zouden dubbele lijnen geven.
const WEG = /^(primary|secondary|tertiary|unclassified|residential|living_street|pedestrian)$/;

const r1 = (v: number) => Math.round(v * 10) / 10;
const uit: Record<string, string> = {};
for (const naam of STRATEN) {
  const ways = elements.filter((el) => el.tags.name === naam && WEG.test(el.tags.highway));
  if (!ways.length) throw new Error(`Geen lijn gevonden voor ${naam}`);
  uit[naam] = ways
    .map((way) => 'M' + way.geometry.map(({ lat, lon }) => toView(wgs84ToRd(lat, lon)).map(r1).join(',')).join('L'))
    .join('');
  console.log(`${naam}: ${ways.length} delen`);
}

await writeFile(new URL('../src/lib/toen-en-nu/straten.json', import.meta.url), JSON.stringify(uit, null, 2) + '\n');
console.log('klaar: src/lib/toen-en-nu/straten.json');

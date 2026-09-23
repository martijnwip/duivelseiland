/**
 * Maakt een losse locatiekaart van Duivelseiland in huisstijl: bouwblokken, water, groen,
 * de buurtgrens en alleen de namen Duivelseiland, Roelof Hartplein en Hobbemakade.
 * Gebruikt de basiskaart van de afvalpagina (src/lib/afval/basemap.json) plus het groen uit de BGT.
 * Schrijft een SVG met ingebedde lettertypes en, via headless Chrome, een PNG op 3× formaat.
 *
 *   bun run kaart:locatie
 *
 * Chrome-pad aanpassen kan met CHROME=/pad/naar/chrome.
 */
import { spawnSync } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import basemap from '../src/lib/afval/basemap.json';
import { DSO, VIEW } from '../src/lib/afval/constants';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../public/kaart/', import.meta.url);

/** Uitsnede in meters binnen de basiskaart: van Van Baerlestraat tot net over de Boerenwetering. */
const CROP = { x: 45, y: 105, w: 440, h: 320 } as const;
const SCALE = 3;

/** Huisstijlkleuren (licht), zie app/(site)/[locale]/globals.css. */
const C = {
  card: '#faf6ee',
  blok: '#e3d5be',
  water: '#c9d5d4',
  groen: '#b7c6b8',
  text: '#2b241c',
  muted: '#6b5f4f',
  primary: '#3b5d42',
};

/** Handmatig geplaatste namen (meters, graden met de klok mee). */
const LABELS = [
  { naam: 'Duivelseiland', x: 322, y: 231, angle: -17.6, cls: 'buurt' },
  { naam: 'Roelof Hartplein', x: 152, y: 337, angle: 0, cls: 'plein' },
  { naam: 'Hobbemakade', x: 427, y: 300, angle: -84, cls: 'straat' },
];

type Ring = [number, number][];
type Geom = { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] };

const toView = ([x, y]: [number, number]) => `${Math.round((x - VIEW.minX) * 10) / 10},${Math.round((VIEW.maxY - y) * 10) / 10}`;
const ringArea = (r: Ring) => Math.abs(r.reduce((s, [x, y], i) => s + x * r[(i + 1) % r.length][1] - r[(i + 1) % r.length][0] * y, 0)) / 2;

/** Openbaar groen uit de BGT, zonder gaten (bomen); boomspiegels en kleine perkjes (< 40 m²) laten we weg. */
async function groen(): Promise<string> {
  const bbox = `${VIEW.minX},${VIEW.minY},${VIEW.maxX},${VIEW.maxY},urn:ogc:def:crs:EPSG::28992`;
  const url = `${DSO}/wfs/bgt/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=begroeideterreindelen&OUTPUTFORMAT=geojson&BBOX=${bbox}&COUNT=5000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`begroeideterreindelen: HTTP ${res.status}`);
  const { features } = (await res.json()) as { features: { geometry: Geom; properties: Record<string, unknown> }[] };
  return features
    .filter((f) => !f.properties.object_eindtijd && f.properties.relatieve_hoogteligging === 0)
    .flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates))
    .filter((poly) => ringArea(poly[0]) >= 40)
    .map(([outer]) => 'M' + outer.map(toView).join('L') + 'Z')
    .join('');
}

async function font(file: string): Promise<string> {
  const data = await readFile(new URL(`../docs/design-reference/${file}`, import.meta.url));
  return `data:font/woff2;base64,${data.toString('base64')}`;
}

async function run() {
  const [green, lexend, source] = await Promise.all([groen(), font('Lexend-Variable.woff2'), font('SourceSans3-Variable.woff2')]);
  const outside = `M0,0H${basemap.width}V${basemap.height}H0Z${basemap.buurt}`;
  const { x, y, w, h } = CROP;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w * SCALE}" height="${h * SCALE}" role="img" aria-label="Kaart van Duivelseiland, tussen Roelof Hartplein en Hobbemakade">
<title>Duivelseiland</title>
<style>
@font-face { font-family: 'Lexend'; src: url(${lexend}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Source Sans 3'; src: url(${source}) format('woff2'); font-weight: 200 900; }
text { text-anchor: middle; dominant-baseline: middle; paint-order: stroke; stroke: ${C.card}; stroke-linejoin: round; }
.buurt { font: 600 14px 'Lexend', sans-serif; letter-spacing: 2.6px; text-transform: uppercase; fill: ${C.text}; stroke-width: 4px; }
.plein { font: 600 8.5px 'Source Sans 3', sans-serif; fill: ${C.primary}; stroke-width: 3px; }
.straat { font: 600 8.5px 'Source Sans 3', sans-serif; letter-spacing: 1.2px; text-transform: uppercase; fill: ${C.muted}; stroke-width: 3px; }
</style>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.card}"/>
<path d="${green}" fill="${C.groen}"/>
<path d="${basemap.water}" fill="${C.water}"/>
<path d="${basemap.blokken}" fill="${C.blok}"/>
<path d="${outside}" fill-rule="evenodd" fill="${C.card}" opacity="0.55"/>
<path d="${basemap.buurt}" fill="none" stroke="${C.text}" stroke-width="1.5" stroke-dasharray="5 3"/>
${LABELS.map((l) => `<text x="${l.x}" y="${l.y}" transform="rotate(${l.angle} ${l.x} ${l.y})" class="${l.cls}">${l.naam}</text>`).join('\n')}
</svg>
`;

  await mkdir(OUT, { recursive: true });
  const svgFile = new URL('duivelseiland.svg', OUT);
  const pngFile = new URL('duivelseiland.png', OUT);
  await writeFile(svgFile, svg);

  const shot = spawnSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${w * SCALE},${h * SCALE}`,
    `--screenshot=${fileURLToPath(pngFile)}`,
    svgFile.href,
  ]);
  if (shot.status !== 0) throw new Error(`Chrome faalde: ${shot.stderr}`);
  console.log(`Locatiekaart geschreven: public/kaart/duivelseiland.svg en .png (${w * SCALE}×${h * SCALE}).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

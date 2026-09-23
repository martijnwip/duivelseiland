/**
 * Maakt de basiskaart voor de afvalpagina: buurtgrens, bouwblokken, water en
 * straatnamen in RD (EPSG:28992), vereenvoudigd en relatief aan de linkerbovenhoek
 * van de uitsnede. Geometrie verandert zelden; draai dit script alleen opnieuw als
 * de buurt of de uitsnede verandert.
 *
 *   bun run scripts/afval-basemap.ts
 */
import { writeFile } from 'fs/promises';
import { BUURT_ID, DSO, VIEW } from '../src/lib/afval/constants';

type Ring = [number, number][];
type Geom = { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] } | { type: 'Point'; coordinates: [number, number] };
type Feature = { geometry: Geom; properties: Record<string, unknown> };

const BBOX = `${VIEW.minX},${VIEW.minY},${VIEW.maxX},${VIEW.maxY},urn:ogc:def:crs:EPSG::28992`;

async function wfs(dataset: string, typename: string): Promise<Feature[]> {
  const url = `${DSO}/wfs/${dataset}/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typename}&OUTPUTFORMAT=geojson&BBOX=${BBOX}&COUNT=5000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${typename}: HTTP ${res.status}`);
  return ((await res.json()) as { features: Feature[] }).features;
}

/** Douglas-Peucker, tolerantie in meters. */
function simplify(pts: Ring, tol: number): Ring {
  if (pts.length < 4) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const d = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}

/** RD naar SVG-coördinaten (x naar rechts, y naar beneden), afgerond op 0,1 m. */
const toView = ([x, y]: [number, number]): [number, number] => [Math.round((x - VIEW.minX) * 10) / 10, Math.round((VIEW.maxY - y) * 10) / 10];

/** Gesloten ring: splits op het verste punt, anders valt begin = eind samen en blijft er niets over. */
function simplifyRing(ring: Ring, tol: number): Ring {
  const [x0, y0] = ring[0];
  let far = 0;
  ring.forEach(([x, y], i) => {
    if (Math.hypot(x - x0, y - y0) > Math.hypot(ring[far][0] - x0, ring[far][1] - y0)) far = i;
  });
  if (far === 0) return ring;
  return [...simplify(ring.slice(0, far + 1), tol).slice(0, -1), ...simplify(ring.slice(far), tol)];
}

function path(rings: Ring[], tol = 0.6): string {
  return rings
    .map((ring) => {
      const pts = simplifyRing(ring, tol).map(toView);
      return 'M' + pts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
    })
    .join('');
}

const polys = (g: Geom): Ring[] => (g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : []);

async function run() {
  const buurt = (await (await fetch(`${DSO}/gebieden/buurten/${BUURT_ID}?_format=json`)).json()) as { geometrie: Geom };
  const [blokken, water, labels] = await Promise.all([wfs('gebieden', 'bouwblokken'), wfs('bgt', 'waterdelen'), wfs('bgt', 'openbareruimtelabels')]);

  // Alleen actuele bouwblokken (de WFS geeft ook historische volgnummers).
  const actueel = blokken.filter((f) => !f.properties.eind_geldigheid);

  // Eén label per straatnaam: het punt dat het dichtst bij het midden van de uitsnede ligt.
  const cx = (VIEW.minX + VIEW.maxX) / 2;
  const cy = (VIEW.minY + VIEW.maxY) / 2;
  const byName = new Map<string, { x: number; y: number; angle: number; d: number }>();
  for (const f of labels) {
    const naam = f.properties.naam as string | undefined;
    if (!naam || f.geometry.type !== 'Point') continue;
    const [x, y] = f.geometry.coordinates;
    const d = Math.hypot(x - cx, y - cy);
    const prev = byName.get(naam);
    if (!prev || d < prev.d) byName.set(naam, { x, y, angle: Number(f.properties.label_hoek ?? 0), d });
  }

  const out = {
    width: VIEW.maxX - VIEW.minX,
    height: VIEW.maxY - VIEW.minY,
    buurt: path(polys(buurt.geometrie), 0.3),
    blokken: path(actueel.flatMap((f) => polys(f.geometry))),
    water: path(water.flatMap((f) => polys(f.geometry))),
    labels: [...byName.entries()]
      .map(([naam, l]) => {
        const [x, y] = toView([l.x, l.y]);
        // BGT-hoek is tegen de klok in; SVG draait met de klok mee.
        return { naam, x, y, angle: -l.angle };
      })
      .sort((a, b) => a.naam.localeCompare(b.naam)),
  };

  const file = new URL('../src/lib/afval/basemap.json', import.meta.url);
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
  console.log(`Basiskaart geschreven: ${actueel.length} bouwblokken, ${water.length} waterdelen, ${out.labels.length} straatnamen.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

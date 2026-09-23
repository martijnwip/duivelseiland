/**
 * Gedeelde helpers voor de kaartscripts: gemeentelijke WFS ophalen, vereenvoudigen
 * en omzetten naar SVG-paden in de coördinaten van de basiskaart (zie src/lib/afval/basemap.json).
 */
import { DSO, VIEW } from '../../src/lib/afval/constants';

export type Ring = [number, number][];
export type Geom = { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] } | { type: 'Point'; coordinates: [number, number] };
export type Feature = { geometry: Geom; properties: Record<string, unknown> };

/** Features uit de WFS van de gemeente binnen een RD-uitsnede (standaard de hele basiskaart). */
export async function wfs(dataset: string, typename: string, view: { minX: number; minY: number; maxX: number; maxY: number } = VIEW): Promise<Feature[]> {
  const bbox = `${view.minX},${view.minY},${view.maxX},${view.maxY},urn:ogc:def:crs:EPSG::28992`;
  const url = `${DSO}/wfs/${dataset}/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typename}&OUTPUTFORMAT=geojson&BBOX=${bbox}&COUNT=5000`;
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
export const toView = ([x, y]: [number, number]): [number, number] => [Math.round((x - VIEW.minX) * 10) / 10, Math.round((VIEW.maxY - y) * 10) / 10];

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

export function path(rings: Ring[], tol = 0.6): string {
  return rings
    .map((ring) => {
      const pts = simplifyRing(ring, tol).map(toView);
      return 'M' + pts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
    })
    .join('');
}

export const polys = (g: Geom): Ring[] => (g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : []);

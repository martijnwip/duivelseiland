import type { Pt } from './geo';
import type { Bijplaatsing, Container, Melding } from './types';

const count = <K>(items: K[]) => {
  const m = new Map<K, number>();
  for (const k of items) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
};

/** Laatste waarnemingsdatum (ISO, yyyy-mm-dd); daaraan meten we "afgelopen 12 maanden". */
export const laatsteDatum = (b: Bijplaatsing[]) => b.reduce((m, x) => (x.datum > m ? x.datum : m), '');

const minusMonths = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString().slice(0, 10);
};

export function perJaar(b: Bijplaatsing[]) {
  const m = count(b.map((x) => Number(x.datum.slice(0, 4))));
  return [...m.entries()].sort((a, c) => a[0] - c[0]).map(([jaar, n]) => ({ jaar, n }));
}

/** Aantal in de afgelopen 12 maanden en de 12 maanden daarvoor. */
export function jaarVergelijking(b: Bijplaatsing[]) {
  const end = laatsteDatum(b);
  const a = minusMonths(end, 12);
  const c = minusMonths(end, 24);
  return {
    recent: b.filter((x) => x.datum > a).length,
    vorig: b.filter((x) => x.datum > c && x.datum <= a).length,
  };
}

/** "Pieter Baststraat 12-H" en "Pieter baststraat" worden "Pieter Baststraat". */
const straatKey = (s: string) => s.replace(/\s*\d.*$/, '').trim();

export function perStraat(b: Bijplaatsing[], min = 5) {
  const groups = new Map<string, { naam: string; n: number; spellingen: Map<string, number> }>();
  for (const x of b) {
    if (!x.straat) continue;
    const naam = straatKey(x.straat);
    const key = naam.toLowerCase();
    const g = groups.get(key) ?? { naam, n: 0, spellingen: new Map() };
    g.n++;
    g.spellingen.set(naam, (g.spellingen.get(naam) ?? 0) + 1);
    groups.set(key, g);
  }
  return [...groups.values()]
    .filter((g) => g.n >= min)
    .map((g) => ({ naam: [...g.spellingen.entries()].sort((a, c) => c[1] - a[1])[0][0], n: g.n }))
    .sort((a, c) => c.n - a.n);
}

/** Wat er naast de container lag. Eén waarneming kan meerdere soorten hebben. */
export function soorten(b: Bijplaatsing[]) {
  return {
    grof: b.filter((x) => x.grof).length,
    huisvuil: b.filter((x) => x.huisvuil).length,
    zwerfafval: b.filter((x) => x.zwerfafval).length,
    karton: b.filter((x) => x.karton).length,
  };
}

export const CROW = ['A+', 'A', 'B', 'C', 'D'] as const;

export function crowVerdeling(b: Bijplaatsing[]) {
  const m = count(b.map((x) => x.crow));
  return CROW.map((score) => ({ score, n: m.get(score) ?? 0 }));
}

export type Hotspot = { id: string; rd: Pt; n: number; recent: number; straat: string | null };

/** Waarnemingen per containerplek (cluster), met het gemiddelde punt als locatie. */
export function hotspots(b: Bijplaatsing[]): Hotspot[] {
  const since = minusMonths(laatsteDatum(b), 12);
  const groups = new Map<string, { sx: number; sy: number; n: number; recent: number; straten: string[] }>();
  for (const x of b) {
    if (!x.rd) continue;
    const id = x.clusterId ?? `${Math.round(x.rd[0] / 10)}|${Math.round(x.rd[1] / 10)}`;
    const g = groups.get(id) ?? { sx: 0, sy: 0, n: 0, recent: 0, straten: [] };
    g.sx += x.rd[0];
    g.sy += x.rd[1];
    g.n++;
    if (x.datum > since) g.recent++;
    if (x.straat) g.straten.push(straatKey(x.straat));
    groups.set(id, g);
  }
  // Clusters krijgen soms een nieuw id op dezelfde plek; voeg plekken binnen 10 m samen.
  const merged: { id: string; sx: number; sy: number; n: number; recent: number; straten: string[] }[] = [];
  for (const [id, g] of [...groups.entries()].sort((a, c) => c[1].n - a[1].n)) {
    const near = merged.find((m) => Math.hypot(m.sx / m.n - g.sx / g.n, m.sy / m.n - g.sy / g.n) < 10);
    if (near) {
      near.sx += g.sx;
      near.sy += g.sy;
      near.n += g.n;
      near.recent += g.recent;
      near.straten.push(...g.straten);
    } else merged.push({ id, ...g });
  }
  return merged
    .map((g) => {
      const top = [...count(g.straten).entries()].sort((a, c) => c[1] - a[1])[0];
      return { id: g.id, rd: [g.sx / g.n, g.sy / g.n] as Pt, n: g.n, recent: g.recent, straat: top?.[0] ?? null };
    })
    .sort((a, c) => c.n - a.n);
}

export function perFractie(c: Container[]) {
  return [...count(c.map((x) => x.fractie)).entries()].sort((a, b) => b[1] - a[1]).map(([fractie, n]) => ({ fractie, n }));
}

/** Meldingen van de afgelopen `dagen`, per categorie. */
export function meldingenRecent(m: Melding[], nu: Date, dagen = 30) {
  const since = new Date(nu.getTime() - dagen * 86400_000).toISOString();
  const recent = m.filter((x) => x.datum >= since);
  const perCat = [...count(recent.map((x) => x.categorie)).entries()].sort((a, b) => b[1] - a[1]).map(([categorie, n]) => ({ categorie, n }));
  return { recent, perCat };
}

/** Kleine SVG-helpers: lineaire schaal, getallen voor paden en een sterk vereenvoudigde tick-lijst. */

export type Scale = (v: number) => number;

export const lin =
  (d0: number, d1: number, r0: number, r1: number): Scale =>
  (v) =>
    d1 === d0 ? r0 : r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);

/** Afgerond op 1 decimaal, zonder ".0" (houdt de SVG-markup compact). */
export const r = (x: number): string => {
  const s = x.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
};

/** "M x,y L x,y ..." voor een reeks punten. */
export const polyline = (pts: readonly (readonly [number, number])[]): string =>
  'M' + pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' L');

/** Gesloten vlak tussen een bovenlijn en een onderlijn (beide links naar rechts). */
export const band = (up: readonly (readonly [number, number])[], lo: readonly (readonly [number, number])[]): string =>
  `${polyline(up)} L${[...lo].reverse().map(([x, y]) => `${r(x)},${r(y)}`).join(' L')} Z`;

/** Klasse-onafhankelijke kleurcodes; de vertaling naar Tailwind-klassen staat in charts/tone.ts. */
export type Tone = 'p' | 'p6' | 'p3' | 's' | 's5' | 'c' | 'c4' | 'm' | 'm3';

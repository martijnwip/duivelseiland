/**
 * Maakt uit het embleem public/logo/Duivelseiland_logo_vector.svg (het origineel,
 * blijft ongewijzigd) een webversie (duivelseiland-embleem.svg) en de vrijstaande
 * sub-logo's (duivelskopje en kaartje) in de merkkleuren, in public/logo/.
 * Draai opnieuw als het embleem verandert.
 *
 *   bun run scripts/extract-logo.ts
 *
 * Het embleem is met potrace getraceerd: één <path> per kleur, opgebouwd uit
 * deelpaden die met een hoofdletter-M beginnen (gaten daarbinnen met een kleine m).
 * Het rode pad bevat drie deelpaden: de ring, het kaartje (straten en omtrek, met
 * de blokken als gaten) en het duivelskopje (ogen en mond als gaten). De schaduw
 * (zwart pad) laten we weg.
 */
import { readFile, writeFile } from 'fs/promises';

const SRC = 'public/logo/Duivelseiland_logo_vector.svg';
const OUT = 'public/logo';
const RED = '#ed0a0a';
// Zelfde coördinatenstelsel als de bron: potrace-eenheden (×10, y omgekeerd).
const TRANSFORM = 'translate(0,1234) scale(0.1,-0.1)';

type Box = { minX: number; minY: number; maxX: number; maxY: number };

// Bounding boxes in viewBox-eenheden (0..1275 × 0..1234), gemeten op het embleem.
const DUIVEL_BOX: Box = { minX: 440, minY: 420, maxX: 670, maxY: 700 };
const KAART_BOX: Box = { minX: 220, minY: 280, maxX: 970, maxY: 940 };

const COLORS = {
  rood: '#ec0000',
  groen: '#00893c',
  zwart: '#202020',
  wit: '#ffffff',
} as const;

// Kleuren van het origineel → merkkleuren (Amsterdam-tokens, zie /styleguide).
const EMBLEEM_KLEUREN: Record<string, string> = {
  '#038031': COLORS.groen,
  '#ed0a0a': COLORS.rood,
  '#000000': COLORS.zwart,
  '#fdfdfd': COLORS.wit,
};
// Deelpaden korter dan dit zijn anti-aliasspikkels van het traceren (onzichtbaar).
const SPIKKEL = 120;

const svg = await readFile(SRC, 'utf8');
const red = svg.match(new RegExp(`<path fill="${RED}"[^>]*d="([^"]+)"`))?.[1];
if (!red) throw new Error(`Rood pad (${RED}) niet gevonden in ${SRC}`);

const subpaths = red
  .trim()
  .split(/(?=M)/)
  .map((d) => d.trim())
  .filter(Boolean);

/** Het deelpad waarvan het startpunt binnen `box` valt (op `exclude` na). */
function pick(box: Box, exclude: string[] = []): string {
  const found = subpaths.filter((d) => {
    if (exclude.includes(d)) return false;
    const [, x, y] = d.match(/^M\s*(-?\d+)\s+(-?\d+)/) ?? [];
    const vx = Number(x) / 10;
    const vy = 1234 - Number(y) / 10;
    return vx >= box.minX && vx <= box.maxX && vy >= box.minY && vy <= box.maxY;
  });
  if (found.length !== 1) throw new Error(`Verwachtte 1 deelpad in ${JSON.stringify(box)}, vond ${found.length}`);
  return found[0];
}

const duivel = pick(DUIVEL_BOX);
// Het kopje ligt binnen het kaartje, dus dat sluiten we hier uit.
const kaart = pick(KAART_BOX, [duivel]);
// Buitenomtrek van het kaartje: alles vóór het eerste gat (kleine m).
const kaartOmtrek = kaart.split(/(?=m)/)[0];

const doc = (title: string, viewBox: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <title>${title}</title>
  <g transform="${TRANSFORM}">
    ${body}
  </g>
</svg>
`;

const path = (fill: string, d: string) => `<path fill="${fill}" d="${d}"/>`;

const DUIVEL_VIEWBOX = '425 429 260 260';
const KAART_VIEWBOX = '229 289 735 648';

/** Bbox van een potrace-deelpad in viewBox-eenheden (volgt M/m/c/l). */
function bbox(sub: string): Box {
  let x = 0;
  let y = 0;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [, cmd, args] of sub.matchAll(/([MmcClLzZ])([^MmcClLzZ]*)/g)) {
    const n = (args.match(/-?\d+\.?\d*/g) ?? []).map(Number);
    if (cmd === 'M') [x, y] = n;
    else if (cmd === 'm') (x += n[0]), (y += n[1]);
    else if (cmd === 'c' || cmd === 'l') {
      const step = cmd === 'c' ? 6 : 2;
      for (let k = 0; k < n.length; k += step) {
        x += n[k + step - 2];
        y += n[k + step - 1];
        xs.push(x);
        ys.push(y);
      }
      continue;
    }
    xs.push(x);
    ys.push(y);
  }
  return { minX: Math.min(...xs) / 10, minY: 1234 - Math.max(...ys) / 10, maxX: Math.max(...xs) / 10, maxY: 1234 - Math.min(...ys) / 10 };
}

/** Webversie van het embleem: merkkleuren, zonder spikkels, schaalbaar. */
const embleem = [...svg.matchAll(/<path fill="([^"]+)"[^>]*d="([^"]+)"/g)].map(([, fill, d]) => {
  const kleur = EMBLEEM_KLEUREN[fill];
  if (!kleur) throw new Error(`Onbekende kleur ${fill} in ${SRC}`);
  const subs = d
    .trim()
    .split(/(?=M)/)
    .filter((sub) => sub.trim().length >= SPIKKEL);
  return { kleur, subs };
});

/*
 * Badge (header): het embleem zonder ringtekst, met het kaartje groter en gecentreerd.
 * Letters (en de groene binnenkantjes van D, A, R …) liggen in de ring rond het
 * schijfmidden; een groene cirkel onder alles dicht de gaten die ze in de schijf laten.
 */
const SCHIJF = { cx: 635, cy: 597.5, r: 540 };
const KAART_MIDDEN = { x: 596.5, y: 613 };
const KAART_SCHAAL = 1.15;
const isLetter = (b: Box) => {
  const afstand = Math.hypot((b.minX + b.maxX) / 2 - SCHIJF.cx, (b.minY + b.maxY) / 2 - SCHIJF.cy);
  return afstand > 420 && afstand < 520 && b.maxX - b.minX < 200;
};
const ring: string[] = [];
const inhoud: string[] = [];
for (const { kleur, subs } of embleem) {
  const zonderLetters = subs.filter((sub) => !((kleur === COLORS.wit || kleur === COLORS.groen) && isLetter(bbox(sub))));
  const r = zonderLetters.filter((sub) => bbox(sub).maxX - bbox(sub).minX > 1000);
  const i = zonderLetters.filter((sub) => !r.includes(sub));
  if (r.length) ring.push(path(kleur, r.join('')));
  if (i.length) inhoud.push(path(kleur, i.join('')));
}
const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 -2 1193 1193">
  <title>Duivelseiland</title>
  <circle cx="${SCHIJF.cx}" cy="${SCHIJF.cy}" r="${SCHIJF.r}" fill="${COLORS.groen}"/>
  <g transform="${TRANSFORM}">
    ${ring.join('\n    ')}
  </g>
  <g transform="translate(${SCHIJF.cx},${SCHIJF.cy}) scale(${KAART_SCHAAL}) translate(${-KAART_MIDDEN.x},${-KAART_MIDDEN.y})">
    <g transform="${TRANSFORM}">
      ${inhoud.join('\n      ')}
    </g>
  </g>
</svg>
`;

const files: Record<string, string> = {
  'duivelseiland-embleem.svg': doc(
    'Duivelseiland Amsterdam',
    '0 0 1275 1234',
    embleem.map(({ kleur, subs }) => path(kleur, subs.join(''))).join('\n    '),
  ),
  'duivelseiland-badge.svg': badge,
};
for (const [naam, hex] of Object.entries(COLORS)) {
  files[`duivel-${naam}.svg`] = doc(`Duivelseiland duivelskopje (${naam})`, DUIVEL_VIEWBOX, path(hex, duivel));
  files[`kaart-${naam}.svg`] = doc(`Duivelseiland kaartje (${naam})`, KAART_VIEWBOX, `${path(hex, kaart)}\n    ${path(hex, duivel)}`);
}
files['kaart-kleur.svg'] = doc(
  'Duivelseiland kaartje (kleur)',
  KAART_VIEWBOX,
  [path(COLORS.wit, kaartOmtrek), path(COLORS.rood, kaart), path(COLORS.rood, duivel)].join('\n    '),
);

for (const [name, content] of Object.entries(files)) {
  await writeFile(`${OUT}/${name}`, content);
  console.log(`[extract-logo] ${OUT}/${name} (${(content.length / 1024).toFixed(1)} kB)`);
}

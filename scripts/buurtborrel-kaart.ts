/**
 * Maakt de laag voor de Buurtborrel-kaart bovenop de basiskaart van de afvalpagina:
 * het groen rond het Roelof Hartplein (BGT begroeide terreindelen), met apart het
 * plantsoen waar de borrel is, plus de plekken die een label krijgen. Draai dit
 * alleen opnieuw als de inrichting van het plein verandert.
 *
 *   bun run scripts/buurtborrel-kaart.ts
 */
import { writeFile } from 'fs/promises';
import { path, polys, toView, wfs, type Ring } from './lib/kaart';

/** Uitsnede in RD rond het plein; ruimer dan wat de kaart laat zien. */
const PLEIN = { minX: 120540, minY: 485020, maxX: 120820, maxY: 485240 } as const;

/** Een punt midden in het plantsoen (het bovenste, grote groenvak aan het plein). */
const PLANTSOEN_PUNT: [number, number] = [120628, 485138];

/** Plekken met een label, in RD. */
const PLEKKEN = {
  // PDOK Locatieserver: Roelof Hartplein 1.
  wildschut: [120603, 485180],
  // Afgelezen van de kaart: de OBA-zuil aan de zuidkant van het plein.
  oba: [120639, 485058],
} satisfies Record<string, [number, number]>;

/** Ligt het punt binnen de (buiten)ring? Ray casting. */
function inRing([px, py]: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

async function run() {
  const groen = (await wfs('bgt', 'begroeideterreindelen', PLEIN)).filter((f) => !f.properties.eind_registratie);
  const plantsoen = groen.find((f) => polys(f.geometry).some((ring) => inRing(PLANTSOEN_PUNT, ring)));
  if (!plantsoen) throw new Error('Plantsoen niet gevonden: controleer PLANTSOEN_PUNT.');

  const out = {
    groen: path(groen.filter((f) => f !== plantsoen).flatMap((f) => polys(f.geometry))),
    // Alleen de buitenrand: de gaten in het vlak zijn boomspiegels.
    plantsoen: path([polys(plantsoen.geometry)[0]], 0.3),
    marker: toView(PLANTSOEN_PUNT),
    plekken: Object.fromEntries(Object.entries(PLEKKEN).map(([k, p]) => [k, toView(p)])),
  };

  const file = new URL('../src/lib/buurtborrel/kaart.json', import.meta.url);
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
  console.log(`Buurtborrel-kaart geschreven: ${groen.length} groenvakken.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

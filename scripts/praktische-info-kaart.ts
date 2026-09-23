/**
 * Maakt de kaart voor Praktische info: brievenbussen en de buurt-AED. Een deel ligt buiten
 * de basiskaart van de afvalpagina, dus dit script haalt bouwblokken, water en straatnamen
 * op voor een ruimere uitsnede. De coördinaten blijven relatief aan dezelfde oorsprong als
 * src/lib/afval/basemap.json (negatief kan), zodat de buurtgrens daaruit gewoon past.
 * Draai dit alleen opnieuw als een plek verandert.
 *
 *   bun run scripts/praktische-info-kaart.ts
 */
import { writeFile } from 'fs/promises';
import { path, polys, toView, wfs } from './lib/kaart';

/** Uitsnede in RD: van de Gerard Terborgstraat tot de Eerste Jan Steenstraat en de Teniersstraat. */
const UITSNEDE = { minX: 120560, minY: 484990, maxX: 121180, maxY: 485600 } as const;

/** Plekken in RD. */
const PLEKKEN = {
  // PDOK Locatieserver: Gerard Terborgstraat 44 (de bus staat aan de overkant, tegenover Atalmedial).
  terborg: [120629, 485027],
  // OpenStreetMap: PostNL-brievenbus bij Eerste Jan Steenstraat 53.
  janSteen: [121113, 485233],
  // OpenStreetMap: brievenbus op de hoek Johannes Vermeerstraat / Teniersstraat.
  vermeer: [120732, 485538],
  // OpenStreetMap: gevel van de Sint-Petrus-en-Pauluskerk (Oud-Katholiek) aan de Ruysdaelstraat.
  aed: [120758, 485262],
} satisfies Record<string, [number, number]>;

async function run() {
  const [blokken, water, labels] = await Promise.all([
    wfs('gebieden', 'bouwblokken', UITSNEDE),
    wfs('bgt', 'waterdelen', UITSNEDE),
    wfs('bgt', 'openbareruimtelabels', UITSNEDE),
  ]);
  const actueel = blokken.filter((f) => !f.properties.eind_geldigheid);

  // Eén label per straatnaam: het punt dat het dichtst bij het midden van de uitsnede ligt.
  const cx = (UITSNEDE.minX + UITSNEDE.maxX) / 2;
  const cy = (UITSNEDE.minY + UITSNEDE.maxY) / 2;
  const byName = new Map<string, { x: number; y: number; angle: number; d: number }>();
  for (const f of labels) {
    const naam = f.properties.naam as string | undefined;
    if (!naam || f.geometry.type !== 'Point') continue;
    const [x, y] = f.geometry.coordinates;
    const d = Math.hypot(x - cx, y - cy);
    const prev = byName.get(naam);
    if (!prev || d < prev.d) byName.set(naam, { x, y, angle: Number(f.properties.label_hoek ?? 0), d });
  }

  const [x0, y1] = toView([UITSNEDE.minX, UITSNEDE.minY]);
  const [x1, y0] = toView([UITSNEDE.maxX, UITSNEDE.maxY]);
  const out = {
    crop: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
    blokken: path(actueel.flatMap((f) => polys(f.geometry))),
    water: path(water.flatMap((f) => polys(f.geometry))),
    labels: [...byName.entries()]
      .map(([naam, l]) => {
        const [x, y] = toView([l.x, l.y]);
        // BGT-hoek is tegen de klok in; SVG draait met de klok mee.
        return { naam, x, y, angle: -l.angle };
      })
      .sort((a, b) => a.naam.localeCompare(b.naam)),
    plekken: Object.fromEntries(Object.entries(PLEKKEN).map(([k, p]) => [k, toView(p)])),
  };

  const file = new URL('../src/lib/praktische-info/kaart.json', import.meta.url);
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
  console.log(`Praktische-info-kaart geschreven: ${actueel.length} bouwblokken, ${water.length} waterdelen, ${out.labels.length} straatnamen.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

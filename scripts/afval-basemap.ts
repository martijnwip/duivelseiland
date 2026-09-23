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
import { path, polys, toView, wfs, type Geom } from './lib/kaart';

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

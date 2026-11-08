/**
 * Controleert dat elke openbare pagina een goed linkvoorbeeld heeft (WhatsApp, sociale media):
 *
 *   1. een eigen opengraph-image.tsx in dezelfde map als page.tsx (anders erft de pagina de
 *      deelafbeelding van de homepage), en
 *   2. og:-titel en -omschrijving: `metDeelinfo(...)` of `deelMetadata(...)` in generateMetadata
 *      (of een eigen `openGraph`).
 *
 * Pagina's met `index: false` (tokenlinks, styleguide, afbeeldingspagina's) worden overgeslagen.
 * Zie "Deellinks" in PROJECT.md. Draait ook aan het begin van `bun run build`.
 *
 *   bun run check:deellinks
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SITE = path.join(ROOT, 'app', '(site)');
const OG_BESTANDEN = ['opengraph-image.tsx', 'opengraph-image.ts', 'opengraph-image.jpg', 'opengraph-image.png'];

function paginas(map: string): string[] {
  return readdirSync(map).flatMap((naam) => {
    const pad = path.join(map, naam);
    if (statSync(pad).isDirectory()) return paginas(pad);
    return naam === 'page.tsx' ? [pad] : [];
  });
}

const fouten: string[] = [];
let gecontroleerd = 0;

for (const pagina of paginas(SITE)) {
  const bron = readFileSync(pagina, 'utf8');
  if (/index:\s*false/.test(bron)) continue;
  gecontroleerd++;

  const map = path.dirname(pagina);
  const route = path.relative(SITE, map) || '.';
  const problemen: string[] = [];
  if (!OG_BESTANDEN.some((naam) => existsSync(path.join(map, naam)))) {
    problemen.push('geen opengraph-image.tsx (kopieer er een uit een andere map en pas de namespace aan)');
  }
  if (!/metDeelinfo\(|deelMetadata\(|openGraph:/.test(bron)) {
    problemen.push('generateMetadata gebruikt geen metDeelinfo(...) (src/lib/deelMetadata.ts)');
  }
  for (const probleem of problemen) fouten.push(`  ${route}: ${probleem}`);
}

if (fouten.length > 0) {
  console.error(`Deellinks: ${fouten.length} probleem/problemen in openbare pagina's (zie "Deellinks" in PROJECT.md):\n${fouten.join('\n')}`);
  console.error("\nIs de pagina niet bedoeld om te delen (tokenlink, hulppagina)? Zet dan robots: { index: false } in de metadata.");
  process.exit(1);
}
console.log(`Deellinks: alle ${gecontroleerd} openbare pagina's hebben een deelafbeelding en og-metadata.`);

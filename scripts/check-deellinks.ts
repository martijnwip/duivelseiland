/**
 * Controleert dat elke openbare pagina een goed linkvoorbeeld heeft (WhatsApp, sociale media):
 *
 *   1. een eigen opengraph-image.tsx in dezelfde map als page.tsx (anders erft de pagina de
 *      deelafbeelding van de homepage), en
 *   2. og:-titel en -omschrijving: `metDeelinfo(...)` of `deelMetadata(...)` in generateMetadata
 *      (of een eigen `openGraph`).
 *   3. dat elk bestand dat een deelafbeelding uit public/ leest, in next.config.ts bij
 *      outputFileTracingIncludes staat (anders 500 op Vercel).
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

// 3. Bestanden die een deelafbeelding met readFile uit public/ leest, moeten in next.config.ts bij
//    outputFileTracingIncludes['/**/opengraph-image*'] staan: op Vercel zit public/ niet in de function,
//    en zonder die regel geeft de afbeelding in productie een 500 (lokaal werkt het wel; issue #59).
function ogBronnen(map: string): string[] {
  return readdirSync(map).flatMap((naam) => {
    const pad = path.join(map, naam);
    if (statSync(pad).isDirectory()) return ogBronnen(pad);
    return /^opengraph-image\.tsx?$/.test(naam) ? [pad] : [];
  });
}
const DEEL = path.join(ROOT, 'src', 'components', 'deel');
const bronnen = [...ogBronnen(SITE), ...readdirSync(DEEL).map((naam) => path.join(DEEL, naam))];
// 'public/logo/x.png' en pad: 'kaart/x.png' / pad: `afval/x-${locale}.png`; ${...} wordt een wildcard.
const verwijzing = /['"`]public\/([^'"`]+)['"`]|\bpad:\s*['"`]([^'"`]+)['"`]/g;
const gelezen = new Set<string>();
for (const bron of bronnen) {
  for (const m of readFileSync(bron, 'utf8').matchAll(verwijzing)) {
    gelezen.add((m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, '*'));
  }
}
const config = readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
const ogIncludes = config.match(/'\/\*\*\/opengraph-image\*':\s*\[([^\]]*)\]/)?.[1] ?? '';
// De patronen hebben alleen `*` binnen één map nodig (bv. instructiekaart-*.png).
const alsRegex = (glob: string) => new RegExp(`^${glob.split('*').map((deel) => deel.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
const includes = [...ogIncludes.matchAll(/'\.\/public\/([^']+)'/g)].map((m) => alsRegex(m[1]));
for (const patroon of gelezen) {
  const map = path.join(ROOT, 'public', path.dirname(patroon));
  const naam = alsRegex(path.basename(patroon));
  const bestanden = existsSync(map) ? readdirSync(map).filter((b) => naam.test(b)).map((b) => path.posix.join(path.dirname(patroon), b)) : [];
  if (bestanden.length === 0) fouten.push(`  public/${patroon}: bestand bestaat niet (gelezen door een deelafbeelding)`);
  for (const bestand of bestanden) {
    if (!includes.some((glob) => glob.test(bestand))) {
      fouten.push(`  public/${bestand}: ontbreekt in next.config.ts bij outputFileTracingIncludes['/**/opengraph-image*'] (anders 500 op Vercel)`);
    }
  }
}

if (fouten.length > 0) {
  console.error(`Deellinks: ${fouten.length} probleem/problemen met deellinks (zie "Deellinks" in PROJECT.md):\n${fouten.join('\n')}`);
  console.error("\nIs de pagina niet bedoeld om te delen (tokenlink, hulppagina)? Zet dan robots: { index: false } in de metadata.");
  process.exit(1);
}
console.log(`Deellinks: alle ${gecontroleerd} openbare pagina's hebben een deelafbeelding en og-metadata; ${gelezen.size} bestand(en) uit public/ gaan mee naar Vercel.`);

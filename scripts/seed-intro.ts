/**
 * Zet de homepagina-intro (Site-instellingen → Intro, NL en EN): waar de site voor is en wat je er
 * kunt doen. Schrijft alleen het veld `intro`; menu, footer en de rest van Site-instellingen blijven
 * staan. De huidige intro gaat eerst naar een back-up in `data/`.
 *
 *   bun run seed:intro
 *   bun run seed:intro:prod
 *   bun run seed:intro --herstel data/intro-backup.<omgeving>.<tijdstip>.json
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { getClient } from './lib/payload-client';

type Locale = 'nl' | 'en';
const LOCALES: Locale[] = ['nl', 'en'];

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const BOLD = 1;
const text = (t: string, format = 0) => ({ type: 'text', detail: 0, format, mode: 'normal', style: '', text: t, version: 1 });
const link = (url: string, label: string, format = 0) => ({
  ...base,
  type: 'link',
  version: 3,
  id: randomBytes(12).toString('hex'),
  fields: { url, newTab: false, linkType: 'custom' },
  children: [text(label, format)],
});
type Inline = ReturnType<typeof text> | ReturnType<typeof link>;
const paragraaf = (children: Inline[]) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children });
const lijst = (items: Inline[][]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((children, i) => ({ ...base, type: 'listitem', value: i + 1, children })),
});
const richText = (children: object[]) => ({ root: { ...base, type: 'root', children } });

// ---- Inhoud ----
function intro(locale: Locale) {
  const p = (path: string) => (locale === 'nl' ? path : `/${locale}${path}`);
  const vet = (path: string, label: string) => link(p(path), label, BOLD);

  if (locale === 'nl') {
    return richText([
      paragraaf([
        text(
          'Welkom op de buurtsite van Duivelseiland. Deze site is er voor en door bewoners: om elkaar beter te leren kennen, en als plek waar alles over de buurt samenkomt.',
        ),
      ]),
      paragraaf([text('Wat je hier vindt:')]),
      lijst([
        [vet('/agenda', 'Agenda'), text(' en '), vet('/activiteiten', 'activiteiten'), text(': wat er te doen is, van de Duivelse Schoonmaak tot de buurtborrel. '), link(p('/activiteiten/aanmelden'), 'Organiseer ook zelf iets'), text('.')],
        [vet('/praktische-info', 'Praktische info'), text(': '), link(p('/afval'), 'afval en grof vuil'), text(', en waar je overlast meldt.')],
        [vet('/vaklui', 'Vaklui'), text(': loodgieters, schilders en klussers, aangeraden door buren.')],
        [vet('/geschiedenis', 'Geschiedenis'), text(' en '), vet('/fotos', "foto's"), text(': hoe de buurt aan zijn naam kwam en hoe het hier vroeger uitzag.')],
        [vet('/buurt-statistieken', 'De buurt in cijfers'), text(': wie er wonen, hoe en hoeveel.')],
        [vet('/nieuwsbrief', 'Nieuwsbrief'), text(': het buurtnieuws in je mailbox.')],
      ]),
    ]);
  }

  return richText([
    paragraaf([
      text(
        "Welcome to the neighbourhood site of Duivelseiland. It's made by and for residents: to get to know each other better, and as the place where everything about the neighbourhood comes together.",
      ),
    ]),
    paragraaf([text("What you'll find here:")]),
    lijst([
      [vet('/agenda', 'Agenda'), text(' and '), vet('/activiteiten', 'activities'), text(": what's on, from the Duivelse Schoonmaak clean-up to the neighbourhood drinks. "), link(p('/activiteiten/aanmelden'), 'You can organise something yourself too'), text('.')],
      [vet('/praktische-info', 'Practical info'), text(': '), link(p('/afval'), 'waste and bulky rubbish'), text(', and where to report a nuisance.')],
      [vet('/vaklui', 'Tradespeople'), text(': plumbers, painters and handymen recommended by neighbours.')],
      [vet('/geschiedenis', 'History'), text(' and '), vet('/fotos', 'photos'), text(': how the neighbourhood got its name and what it used to look like.')],
      [vet('/buurt-statistieken', 'The neighbourhood in numbers'), text(': who lives here, and how.')],
      [vet('/nieuwsbrief', 'Newsletter'), text(': neighbourhood news in your inbox.')],
    ]),
  ]);
}

// ---- Uitvoeren ----
const platteTekst = (node: unknown): string => {
  if (!node || typeof node !== 'object') return '';
  const n = node as { text?: string; children?: unknown[]; root?: unknown };
  if (n.root) return platteTekst(n.root);
  return (n.text ?? '') + (n.children ?? []).map(platteTekst).join(' ');
};

async function run() {
  const args = process.argv.slice(2);
  const herstelIdx = args.indexOf('--herstel');
  const herstelBestand = herstelIdx >= 0 ? args[herstelIdx + 1] : undefined;
  if (herstelIdx >= 0 && !herstelBestand) {
    console.error('[seed-intro] gebruik: bun run seed:intro --herstel <back-upbestand>');
    process.exit(1);
  }

  const uri = process.env.DATABASE_URI || process.env.TURSO_DATABASE_URL || 'file:./dev.db';
  const omgeving = uri.startsWith('file:') ? 'lokaal' : 'prod';
  console.log(`[seed-intro] database: ${uri.replace(/\?.*$/, '')} (${omgeving})`);

  const payload = await getClient();
  const context = { disableRevalidate: true };

  // Back-up van de huidige intro, per taal.
  const huidig: Record<Locale, unknown> = { nl: null, en: null };
  for (const locale of LOCALES) {
    const doc = await payload.findGlobal({ slug: 'site-instellingen', locale, depth: 0, overrideAccess: true });
    huidig[locale] = doc.intro ?? null;
    console.log(`[seed-intro] huidige intro (${locale}): ${platteTekst(doc.intro).replace(/\s+/g, ' ').trim().slice(0, 100) || '(leeg)'}…`);
  }
  mkdirSync('data', { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = `data/intro-backup.${omgeving}.${stempel}.json`;
  writeFileSync(backup, JSON.stringify(huidig, null, 2));
  console.log(`[seed-intro] back-up: ${backup}`);

  const nieuw: Record<Locale, unknown> = herstelBestand
    ? (JSON.parse(readFileSync(herstelBestand, 'utf8')) as Record<Locale, unknown>)
    : { nl: intro('nl'), en: intro('en') };

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'site-instellingen',
      locale,
      data: { intro: nieuw[locale] } as never,
      overrideAccess: true,
      context,
      depth: 0,
    });
  }

  console.log(`[seed-intro] intro ${herstelBestand ? `hersteld uit ${herstelBestand}` : 'gezet'} (nl en en).`);
  console.log(`[seed-intro] terugzetten: bun run seed:intro${omgeving === 'prod' ? ':prod' : ''} --herstel ${backup}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-intro] MISLUKT:', err instanceof Error ? err.message : err);
  process.exit(1);
});

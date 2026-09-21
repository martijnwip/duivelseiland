import { writeFile } from 'fs/promises';
import { getClient } from './lib/payload-client';
import { findTranslatableLeaves } from '../src/lib/translate-live/field-walker';
import { judgeTranslation } from '../src/lib/translate-live/verify';

// Alleen-lezen. Vergelijkt bestaande NL/EN-paren met de vertaalcontrole.
// Gebruik: bun --env-file=.env.local run scripts/audit-translations.ts [uitvoerpad.json]
const outPath = process.argv[2];
const MAX_PAIRS = 80;

type Pair = { where: string; nl: string; en: string };

function paragraphs(value: unknown): string[] {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root;
  const text = (n: any): string =>
    typeof n?.text === 'string' ? n.text : Array.isArray(n?.children) ? n.children.map(text).join('') : '';
  return (root?.children ?? []).map(text).filter((t) => t.trim() !== '');
}

function toPairs(where: string, nl: unknown, en: unknown): Pair[] {
  if (typeof nl === 'string') {
    return typeof en === 'string' && en.trim() && nl.trim() ? [{ where, nl, en }] : [];
  }
  const a = paragraphs(nl);
  const b = paragraphs(en);
  if (a.length === 0 || b.length === 0) return [];
  if (a.length === b.length) return a.map((nlText, i) => ({ where: `${where}#${i}`, nl: nlText, en: b[i] }));
  return [{ where: `${where}#alles`, nl: a.join('\n'), en: b.join('\n') }];
}

const get = (obj: any, path: (string | number)[]) => path.reduce((o, k) => o?.[k], obj);

async function run() {
  const payload = await getClient();
  const pairs: Pair[] = [];

  const targets = [
    ...payload.config.collections.map((c) => ({ kind: 'collection' as const, slug: c.slug, fields: c.fields })),
    ...payload.config.globals.map((g) => ({ kind: 'global' as const, slug: g.slug, fields: g.fields })),
  ];

  for (const t of targets) {
    const docs =
      t.kind === 'collection'
        ? (await payload.find({ collection: t.slug as any, locale: 'all', overrideAccess: true, limit: 0, depth: 0 })).docs
        : [await payload.findGlobal({ slug: t.slug as any, locale: 'all', overrideAccess: true, depth: 0 })];

    for (const doc of docs as any[]) {
      for (const leaf of findTranslatableLeaves(t.fields, doc)) {
        const en = get(doc, [...leaf.path.slice(0, -1), leaf.path.at(-1)!])?.en;
        pairs.push(...toPairs(`${t.slug}/${doc.id ?? ''}/${leaf.path.join('.')}`, leaf.nl, en));
      }
    }
  }

  console.log(`${pairs.length} NL/EN-paren gevonden` + (pairs.length > MAX_PAIRS ? `, eerste ${MAX_PAIRS} beoordeeld` : ''));

  const results: (Pair & { faithful?: number; keepAsIs?: number })[] = [];
  const batch = pairs.slice(0, MAX_PAIRS);
  for (let i = 0; i < batch.length; i += 5) {
    const chunk = batch.slice(i, i + 5);
    const judged = await Promise.all(chunk.map((p) => judgeTranslation(p.nl.slice(0, 1500), p.en.slice(0, 1500))));
    chunk.forEach((p, k) => results.push({ ...p, ...(judged[k] ?? {}) }));
  }

  const scored = results.filter((r) => r.faithful !== undefined);
  console.log(`${scored.length} beoordeeld, ${results.length - scored.length} mislukt\n`);

  const buckets = [0, 0.2, 0.4, 0.6, 0.8, 1.0001];
  for (let b = 0; b < buckets.length - 1; b++) {
    const n = scored.filter((r) => r.faithful! >= buckets[b] && r.faithful! < buckets[b + 1]).length;
    console.log(`faithful ${buckets[b].toFixed(1)}-${Math.min(buckets[b + 1], 1).toFixed(1)}: ${n}`);
  }

  console.log('\nLaagste scores (mogelijke slechte vertalingen):');
  for (const r of [...scored].sort((a, b) => a.faithful! - b.faithful!).slice(0, 10)) {
    console.log(`\n[${r.faithful!.toFixed(2)}] ${r.where}\n  NL: ${r.nl.slice(0, 160)}\n  EN: ${r.en.slice(0, 160)}`);
  }

  const keep = scored.filter((r) => r.keepAsIs! >= 0.5);
  console.log(`\n${keep.length} fragmenten met keepAsIs >= 0.5:`);
  for (const r of keep.slice(0, 10)) console.log(`  [${r.keepAsIs!.toFixed(2)}] "${r.nl.slice(0, 60)}" -> "${r.en.slice(0, 60)}"`);

  if (outPath) await writeFile(outPath, JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error('[audit-translations] MISLUKT:', err);
  process.exit(1);
});

import { readFile } from 'fs/promises';
import { getClient } from './lib/payload-client';
import { CONTENT_COLLECTIONS, COLLECTION_FIELDS } from './lib/collections';

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error('Gebruik: bun run scripts/reseed.ts <pad-naar-translated.json>');
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (typeof v === 'object' && v !== null && 'root' in (v as Record<string, unknown>)) {
    const root = (v as { root?: { children?: unknown[] } }).root;
    return (root?.children ?? []).length === 0;
  }
  return false;
}

async function run() {
  const payload = await getClient();
  const data = JSON.parse(await readFile(inputPath, 'utf-8'));
  const summary: Record<string, { written: number; skipped: number; missingSource: number }> = {};

  for (const slug of [...CONTENT_COLLECTIONS, 'media'] as const) {
    const fields = COLLECTION_FIELDS[slug];
    const docs = (data[slug] ?? []) as Array<Record<string, any>>;
    summary[slug] = { written: 0, skipped: 0, missingSource: 0 };

    for (const doc of docs) {
      const live = await payload.findByID({
        collection: slug,
        id: doc.id,
        locale: 'all',
        overrideAccess: true,
        depth: 0,
      });

      const patch: Record<string, unknown> = {};
      for (const fieldName of Object.keys(fields)) {
        const liveField = (live as any)[fieldName];
        const exportedField = doc[fieldName];
        if (!liveField || !isEmpty(liveField.en)) {
          summary[slug].skipped++;
          continue;
        }
        const newEn = exportedField?.en;
        if (isEmpty(newEn)) {
          summary[slug].missingSource++;
          continue;
        }
        patch[fieldName] = newEn;
      }

      if (Object.keys(patch).length > 0) {
        await payload.update({
          collection: slug,
          id: doc.id,
          locale: 'en',
          overrideAccess: true,
          data: patch,
        });
        summary[slug].written++;
      }
    }
  }

  const liveGlobal = await payload.findGlobal({
    slug: 'site-instellingen',
    locale: 'all',
    overrideAccess: true,
  });
  const exportedGlobal = data['global:site-instellingen'] ?? {};
  summary['site-instellingen'] = { written: 0, skipped: 0, missingSource: 0 };

  const globalPatch: Record<string, unknown> = {};
  for (const fieldName of ['intro', 'footer'] as const) {
    const liveField = (liveGlobal as any)[fieldName];
    const exportedField = exportedGlobal?.[fieldName];
    if (isEmpty(liveField?.en) && !isEmpty(exportedField?.en)) {
      globalPatch[fieldName] = exportedField.en;
      summary['site-instellingen'].written++;
    } else {
      summary['site-instellingen'].skipped++;
    }
  }

  if (Array.isArray((liveGlobal as any).menu)) {
    const menuPatch = (liveGlobal as any).menu.map((liveItem: any, i: number) => {
      const exportedItem = exportedGlobal?.menu?.[i];
      if (isEmpty(liveItem.label?.en) && exportedItem && !isEmpty(exportedItem.label?.en)) {
        summary['site-instellingen'].written++;
        return { ...liveItem, label: exportedItem.label.en };
      }
      summary['site-instellingen'].skipped++;
      return liveItem;
    });
    globalPatch.menu = menuPatch;
  }

  if (Object.keys(globalPatch).length > 0) {
    await payload.updateGlobal({
      slug: 'site-instellingen',
      locale: 'en',
      overrideAccess: true,
      data: globalPatch,
    });
  }

  console.log('[reseed] samenvatting:', JSON.stringify(summary, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error('[reseed] MISLUKT:', err);
  process.exit(1);
});

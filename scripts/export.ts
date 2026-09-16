import { mkdir, writeFile } from 'fs/promises';
import { getClient } from './lib/payload-client';
import { CONTENT_COLLECTIONS } from './lib/collections';

const label = process.argv[2] ?? 'export';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

async function run() {
  const payload = await getClient();
  const output: Record<string, unknown> = {};

  for (const slug of [...CONTENT_COLLECTIONS, 'media'] as const) {
    const result = await payload.find({
      collection: slug,
      locale: 'all',
      overrideAccess: true,
      limit: 0,
      depth: 0,
    });
    output[slug] = result.docs;
    console.log(`[export] ${slug}: ${result.docs.length} docs`);
  }

  output['global:site-instellingen'] = await payload.findGlobal({
    slug: 'site-instellingen',
    locale: 'all',
    overrideAccess: true,
  });

  await mkdir('data', { recursive: true });
  const outPath = `data/export.${label}.${timestamp}.json`;
  await writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`[export] geschreven: ${outPath}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[export] MISLUKT:', err);
  process.exit(1);
});

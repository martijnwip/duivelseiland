import { getClient } from './lib/payload-client';
import { fetchBeeldbankMetadata } from '../src/lib/beeldbank';

const link = process.argv[2];
const geografischeAanduiding = process.argv[3];

if (!link || !geografischeAanduiding) {
  console.error(
    '[import-beeldbank] gebruik: bun run scripts/import-beeldbank.ts <archief.amsterdam-link> "<geografische aanduiding>"',
  );
  process.exit(1);
}

async function run() {
  const { title, description, imageUrl, datering, vervaardiger, rechten } = await fetchBeeldbankMetadata(link);

  const payload = await getClient();

  const doc = await payload.create({
    collection: 'historische-fotos',
    overrideAccess: true,
    data: {
      title,
      description,
      imageUrl,
      datering,
      vervaardiger,
      rechten,
      bronUrl: link,
      geografischeAanduiding,
      status: 'draft',
    },
  });

  console.log(`[import-beeldbank] concept aangemaakt: id ${doc.id} ("${title}")`);
  console.log('[import-beeldbank] controleer en publiceer in /admin/collections/historische-fotos');
  process.exit(0);
}

run().catch((err) => {
  console.error('[import-beeldbank] MISLUKT:', err instanceof Error ? err.message : err);
  process.exit(1);
});

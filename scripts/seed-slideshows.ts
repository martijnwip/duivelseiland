import { getClient } from './lib/payload-client';

const name = 'Homepage hero';
const slug = 'homepage-hero';

async function run() {
  const payload = await getClient();

  const existing = await payload.find({
    collection: 'slideshows',
    where: { slug: { equals: slug } },
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`[seed-slideshows] slideshow "${slug}" bestaat al (id ${existing.docs[0].id}) — niets gedaan.`);
    process.exit(0);
  }

  const slideshow = await payload.create({
    collection: 'slideshows',
    overrideAccess: true,
    data: { name, slug },
  });

  console.log(`[seed-slideshows] slideshow aangemaakt: ${slideshow.name} (id ${slideshow.id}, slug ${slideshow.slug})`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-slideshows] MISLUKT:', err);
  process.exit(1);
});

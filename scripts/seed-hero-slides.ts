import { getPayload } from 'payload';
import config from '../src/payload.config';
import fs from 'fs/promises';
import path from 'path';

const slidesDir = path.join(import.meta.dirname, '..', 'slides');

async function run() {
  const payload = await getPayload({ config });

  const files = (await fs.readdir(slidesDir)).filter((file) => file.toLowerCase().endsWith('.jpg'));

  let order = 0;
  for (const file of files) {
    const filePath = path.join(slidesDir, file);
    const data = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Archieffoto ${file.replace(/\.jpg$/i, '')} — bijschrift nog invullen`,
      },
      file: {
        data,
        mimetype: 'image/jpeg',
        name: file,
        size: stats.size,
      },
    });

    await payload.create({
      collection: 'hero-slides',
      data: {
        image: media.id,
        order,
        status: 'draft',
      },
    });

    console.log(`Seeded ${file} -> media #${media.id}, hero-slide order ${order}`);
    order += 1;
  }

  console.log(`Done. ${order} slides created as drafts — review alt text and captions in /admin before publishing.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

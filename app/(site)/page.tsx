import { getPayload } from 'payload';
import config from '@payload-config';
import { HeroSlideshow, type HeroSlide } from '../../src/components/HeroSlideshow';

async function getHeroSlides(): Promise<HeroSlide[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'hero-slides',
    where: { status: { equals: 'published' } },
    sort: 'order',
    depth: 1,
  });

  return docs
    .filter((slide) => typeof slide.image === 'object' && slide.image !== null)
    .map((slide) => {
      const image = slide.image as Exclude<typeof slide.image, number>;
      const imageUrl = image.sizes?.hero?.url ?? image.url ?? '';

      return {
        id: String(slide.id),
        imageUrl,
        alt: image.alt,
        caption: image.caption ?? null,
      };
    });
}

export default async function HomePage() {
  const slides = await getHeroSlides();

  return (
    <main>
      <HeroSlideshow slides={slides} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold">Duivelseiland</h1>
        <p className="mt-2 text-gray-600">Deze site is in ontwikkeling.</p>
      </div>
    </main>
  );
}

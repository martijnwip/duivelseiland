import { getPayload } from 'payload';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import config from '@payload-config';
import { HeroSlideshow, type HeroSlide } from '@/components/HeroSlideshow';
import { RichTextContent } from '@/components/site/RichTextContent';
import { HomeStats } from '@/components/stats/HomeStats';
import { HomeDuivelseSchoonmaak } from '@/components/content/HomeDuivelseSchoonmaak';
import { hasRichTextContent } from '@/lib/richtext';

const HOMEPAGE_SLIDESHOW_SLUG = 'homepage-hero';

async function getHeroSlides(locale: string): Promise<HeroSlide[]> {
  const payload = await getPayload({ config });

  const [{ docs: heroSlideDocs }, homepageSlideshow] = await Promise.all([
    payload.find({
      collection: 'hero-slides',
      where: { status: { equals: 'published' } },
      sort: 'order',
      depth: 1,
    }),
    payload.find({
      collection: 'slideshows',
      where: { slug: { equals: HOMEPAGE_SLIDESHOW_SLUG } },
      limit: 1,
    }),
  ]);

  const heroSlides = heroSlideDocs
    .filter((slide) => typeof slide.image === 'object' && slide.image !== null)
    .map((slide) => {
      const image = slide.image as Exclude<typeof slide.image, number>;
      const imageUrl = image.sizes?.hero?.url ?? image.url ?? '';

      return {
        id: `hero-slides-${slide.id}`,
        order: slide.order,
        imageUrl,
        alt: image.alt,
        caption: image.caption ?? null,
      };
    });

  const homepageSlideshowId = homepageSlideshow.docs[0]?.id;

  const historischeFotos = homepageSlideshowId
    ? (
        await payload.find({
          collection: 'historische-fotos',
          where: {
            status: { equals: 'published' },
            slideshows: { contains: homepageSlideshowId },
          },
          sort: 'order',
          locale: locale as 'nl' | 'en',
        })
      ).docs.map((foto) => ({
        id: `historische-fotos-${foto.id}`,
        order: foto.order ?? 0,
        imageUrl: foto.imageUrl,
        alt: foto.title,
        caption: foto.description ?? null,
      }))
    : [];

  return [...heroSlides, ...historischeFotos]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ id, imageUrl, alt, caption }) => ({ id, imageUrl, alt, caption }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  const payload = await getPayload({ config });
  // Onafhankelijke queries parallel, niet na elkaar.
  const [siteInstellingen, slides] = await Promise.all([
    payload.findGlobal({ slug: 'site-instellingen', locale: locale as 'nl' | 'en' }),
    getHeroSlides(locale),
  ]);
  const { intro } = siteInstellingen;

  return (
    <main>
      <HeroSlideshow
        slides={slides}
        labels={{
          region: t('hero.region'),
          loading: t('hero.loading'),
          previous: t('hero.previous'),
          next: t('hero.next'),
          pause: t('hero.pause'),
          play: t('hero.play'),
          // Sjabloon met {number}; de client vult het slidenummer in.
          goToSlide: t.raw('hero.goToSlide'),
        }}
      />
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8">
        <h1 className="m-0 text-4xl leading-[1.1] font-bold text-primary xl:text-5xl">{t('heading')}</h1>
        {hasRichTextContent(intro) ? (
          <RichTextContent data={intro} className="max-w-[640px] text-lg leading-[1.5]" />
        ) : (
          <p className="m-0 max-w-[640px] text-lg leading-[1.5] text-text">{t('underConstruction')}</p>
        )}
      </div>
      <HomeStats locale={locale} />
      <HomeDuivelseSchoonmaak locale={locale as 'nl' | 'en'} />
    </main>
  );
}

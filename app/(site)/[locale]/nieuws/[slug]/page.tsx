import type { Metadata } from 'next';
import { deelMetadata } from '@/lib/deelinfo';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentDetailPage } from '@/components/content/ContentDetailPage';

/** Titel, omschrijving en deelafbeelding voor een gedeelde link (zie src/lib/deelinfo.ts). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return deelMetadata('nieuws', slug, locale === 'en' ? 'en' : 'nl');
}

export default async function NieuwsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentDetailPage
      collection="nieuws"
      routeSegment="nieuws"
      slug={slug}
      locale={locale as 'nl' | 'en'}
      backLabel={t('backToOverview')}
    />
  );
}

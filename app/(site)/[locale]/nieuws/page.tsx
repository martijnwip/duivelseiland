import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';

/** Titel en omschrijving, ook voor een gedeelde link (deelafbeelding: opengraph-image.tsx). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.nieuws' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function NieuwsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.nieuws' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentListPage
      collection="nieuws"
      routeSegment="nieuws"
      locale={locale as 'nl' | 'en'}
      heading={t('heading')}
      emptyText={tc('empty')}
    />
  );
}

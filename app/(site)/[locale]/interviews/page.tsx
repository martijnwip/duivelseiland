import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';

/** Titel en omschrijving, ook voor een gedeelde link (deelafbeelding: opengraph-image.tsx). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.interviews' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function InterviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.interviews' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentListPage
      collection="interviews"
      routeSegment="interviews"
      locale={locale as 'nl' | 'en'}
      heading={t('heading')}
      emptyText={tc('empty')}
    />
  );
}

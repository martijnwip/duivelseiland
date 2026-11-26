import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { NOINDEX, heeftOpenbareItems } from '@/lib/openbareItems';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';

/** Titel en omschrijving, ook voor een gedeelde link (deelafbeelding: opengraph-image.tsx); noindex zolang het overzicht leeg is. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.interviews' });
  const meta = metDeelinfo(locale, { pad: '/interviews', title: t('heading'), description: t('metaDescription') });
  // Een leeg overzicht hoort niet in Google; zodra er iets gepubliceerd is, wel (revalidatePath bij publiceren).
  return (await heeftOpenbareItems('interviews')) ? meta : { ...meta, robots: NOINDEX };
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

import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';
import { GeschiedenisPage as Verhaal } from '@/components/geschiedenis/GeschiedenisPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function GeschiedenisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  return (
    <>
      <Verhaal locale={locale as 'nl' | 'en'} />
      <ContentListPage
        collection="geschiedenis"
        routeSegment="geschiedenis"
        locale={locale as 'nl' | 'en'}
        heading={t('ui.meer')}
        emptyText={tc('empty')}
        embedded
      />
    </>
  );
}

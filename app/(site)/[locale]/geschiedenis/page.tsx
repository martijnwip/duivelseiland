import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';

export default async function GeschiedenisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentListPage
      collection="geschiedenis"
      routeSegment="geschiedenis"
      locale={locale as 'nl' | 'en'}
      heading={t('heading')}
      emptyText={tc('empty')}
    />
  );
}

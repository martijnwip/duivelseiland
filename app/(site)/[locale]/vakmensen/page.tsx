import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentListPage } from '@/components/content/ContentListPage';

export default async function VakmensenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.vakmensen' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentListPage
      collection="vakmensen"
      routeSegment="vakmensen"
      locale={locale as 'nl' | 'en'}
      heading={t('heading')}
      emptyText={tc('empty')}
    />
  );
}

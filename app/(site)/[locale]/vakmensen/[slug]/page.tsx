import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentDetailPage } from '@/components/content/ContentDetailPage';

export default async function VakmensenDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentDetailPage
      collection="vakmensen"
      routeSegment="vakmensen"
      slug={slug}
      locale={locale as 'nl' | 'en'}
      backLabel={t('backToOverview')}
    />
  );
}

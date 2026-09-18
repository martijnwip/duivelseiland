import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContentDetailPage } from '@/components/content/ContentDetailPage';

export default async function InterviewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'content' });

  return (
    <ContentDetailPage
      collection="interviews"
      routeSegment="interviews"
      slug={slug}
      locale={locale as 'nl' | 'en'}
      backLabel={t('backToOverview')}
    />
  );
}

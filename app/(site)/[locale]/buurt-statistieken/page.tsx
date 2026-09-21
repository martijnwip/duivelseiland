import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { StatsPage } from '@/components/stats/StatsPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.buurtStatistieken' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function BuurtStatistiekenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StatsPage locale={locale} />;
}

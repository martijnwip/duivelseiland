import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { GeluidPage } from '@/components/geluid/GeluidPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.geluid' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function GeluidRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GeluidPage locale={locale} />;
}

import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BriefjePage } from '@/components/geluid/briefje/BriefjePage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.geluidBriefje' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function GeluidBriefjeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BriefjePage locale={locale} />;
}

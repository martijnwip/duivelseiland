import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PraktischeInfoPage } from '@/components/praktische-info/PraktischeInfoPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.praktischeInfo' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function PraktischeInfoRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PraktischeInfoPage locale={locale as 'nl' | 'en'} />;
}

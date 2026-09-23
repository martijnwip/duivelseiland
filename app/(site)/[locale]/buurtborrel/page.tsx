import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BuurtborrelPage } from '@/components/buurtborrel/BuurtborrelPage';

// Nummers komen uit het CMS; een wijziging daar valideert de site direct opnieuw (revalidateSite).
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.buurtborrel' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function BuurtborrelRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BuurtborrelPage locale={locale as 'nl' | 'en'} />;
}

import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MascottePage } from '@/components/mascotte/MascottePage';
import { metDeelinfo } from '@/lib/deelMetadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.mascotte' });
  return metDeelinfo(locale, { pad: '/neighborhood-mascot', title: t('heading'), description: t('metaDescription'), deelTitel: t('title') });
}

export default async function NeighborhoodMascotRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MascottePage locale={locale} />;
}

import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MascottePage } from '@/components/mascotte/MascottePage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.mascotte' });
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  return {
    title: t('heading'),
    description: t('metaDescription'),
    // WhatsApp en andere apps hebben een absolute URL voor de deelafbeelding nodig (opengraph-image.tsx).
    ...(serverUrl && URL.canParse(serverUrl) ? { metadataBase: new URL(serverUrl) } : {}),
    openGraph: {
      type: 'website',
      siteName: 'Duivelseiland',
      locale: locale === 'en' ? 'en_GB' : 'nl_NL',
      title: t('title'),
      description: t('metaDescription'),
    },
  };
}

export default async function NeighborhoodMascotRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MascottePage locale={locale} />;
}

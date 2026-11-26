import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { metDeelinfo } from '@/lib/deelMetadata';
import { ToenEnNuPage } from '@/components/toen-en-nu/ToenEnNuPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.toenEnNu' });
  return metDeelinfo(locale, { pad: '/toen-en-nu', title: t('heading'), description: t('metaDescription') });
}

export default async function ToenEnNuRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ToenEnNuPage locale={locale === 'en' ? 'en' : 'nl'} />;
}

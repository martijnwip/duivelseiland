import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AfvalPage } from '@/components/afval/AfvalPage';

// Live data van de gemeente; de fetches zelf verversen per uur (waarnemingen, meldingen) of per dag.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.afval' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function AfvalRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AfvalPage locale={locale} />;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NieuwsbriefTokenPage } from '@/components/nieuwsbrief/NieuwsbriefTokenPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nieuwsbrief' });
  return { title: t('bevestigen.heading'), robots: { index: false, follow: false } };
}

export default async function NieuwsbriefBevestigenRoute({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <NieuwsbriefTokenPage kind="bevestigen" locale={locale} token={token} />;
}

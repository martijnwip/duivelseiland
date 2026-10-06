import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TokenPage } from '@/components/activiteiten/TokenPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'activiteiten.token' });
  return { title: t('idee-bevestigen.heading'), robots: { index: false, follow: false } };
}

export default async function Route({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <TokenPage kind="idee-bevestigen" locale={locale} token={token} />;
}

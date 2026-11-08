import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { GeluidKaart } from '@/components/geluid/instructie/GeluidKaart';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.geluidInstructie' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function GeluidInstructieRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GeluidKaart locale={locale} />;
}

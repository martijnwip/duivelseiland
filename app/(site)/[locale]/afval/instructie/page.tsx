import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstructieKaart } from '@/components/afval/instructie/InstructieKaart';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.afvalInstructie' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function AfvalInstructieRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InstructieKaart locale={locale} />;
}

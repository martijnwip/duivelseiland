import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ActiviteitenListPage } from '@/components/activiteiten/ActiviteitenListPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'activiteiten' });
  return { title: t('eyebrow'), description: t('metaDescription') };
}

export default async function ActiviteitenRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActiviteitenListPage locale={locale as 'nl' | 'en'} />;
}

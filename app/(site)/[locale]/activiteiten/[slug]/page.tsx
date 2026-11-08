import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ActiviteitDetailPage } from '@/components/activiteiten/ActiviteitDetailPage';
import { haalActiviteitDeelinfo } from '@/lib/deelinfo';
import { metDeelinfo } from '@/lib/deelMetadata';

// Fase, inschrijving en aantal deelnemers veranderen zonder publicatiemoment.
export const dynamic = 'force-dynamic';

/** Titel en omschrijving (wanneer, eerste zinnen), ook voor een gedeelde link (zie src/lib/deelinfo.ts). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const info = await haalActiviteitDeelinfo(slug, locale === 'en' ? 'en' : 'nl');
  if (!info) return {};
  const description = [info.regels.join(', '), info.description].filter(Boolean).join('. ');
  return metDeelinfo(locale, { title: info.title, description, type: 'article' });
}

export default async function ActiviteitRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ActiviteitDetailPage slug={slug} locale={locale as 'nl' | 'en'} />;
}

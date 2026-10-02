import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ActiviteitDetailPage, vindActiviteit } from '@/components/activiteiten/ActiviteitDetailPage';
import { lexicalNaarTekst } from '@/lib/activiteiten/lexical';

// Fase, inschrijving en aantal deelnemers veranderen zonder publicatiemoment.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await vindActiviteit(slug, locale as 'nl' | 'en');
  if (!doc) return {};
  return { title: doc.title, description: lexicalNaarTekst(doc.content).trim().slice(0, 160) || undefined };
}

export default async function ActiviteitRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ActiviteitDetailPage slug={slug} locale={locale as 'nl' | 'en'} />;
}

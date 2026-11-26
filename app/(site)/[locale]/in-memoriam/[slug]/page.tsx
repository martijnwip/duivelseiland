import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { InMemoriamPage } from '@/components/in-memoriam/InMemoriamPage';
import { haalInMemoriamDeelinfo } from '@/lib/deelinfo';
import { metDeelinfo } from '@/lib/deelMetadata';

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const info = await haalInMemoriamDeelinfo(slug, locale === 'en' ? 'en' : 'nl');
  if (!info) return {};
  // In het linkvoorbeeld eerst naam, typering en datum ("Kees Kroon, de markante melkhandelaar, † 9 april 2026"), dan de eerste zinnen.
  const description = [[info.title, ...info.regels].join(', '), info.description].filter(Boolean).join('. ');
  return metDeelinfo(locale, { pad: `/in-memoriam/${slug}`, title: `In memoriam ${info.title}`, description, type: 'article' });
}

export default async function InMemoriamRoute({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <InMemoriamPage slug={slug} locale={locale === 'en' ? 'en' : 'nl'} />;
}

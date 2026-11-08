import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { Section } from '@/components/site/Section';
import { VakluiDisclaimer, VakmanKaart, kaartGegevens, telefoonAfgeschermd, vakNamen, vakmanPad } from '@/components/vaklui/VakmanKaart';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

type Params = { params: Promise<{ locale: string; slug: string }> };

/** Een gepubliceerde vakman; concepten en aanmeldingen geven een 404. */
const vindVakman = cache(async (slug: string, locale: 'nl' | 'en') => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'vaklui',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  return docs[0] ?? null;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const vakman = await vindVakman(slug, locale as 'nl' | 'en');
  if (!vakman) return {};
  const t = await getTranslations({ locale, namespace: 'pages.vaklui' });
  const vakken = vakNamen(vakman).join(', ');
  return metDeelinfo(locale, {
    title: vakken ? `${vakman.naam} (${vakken})` : vakman.naam,
    description: vakman.aanbeveling?.trim().slice(0, 160) || t('metaDescription', { naam: vakman.naam }),
    deelTitel: vakman.naam,
  });
}

export default async function VakmanPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const vakman = await vindVakman(slug, locale as 'nl' | 'en');
  if (!vakman) notFound();

  const t = await getTranslations({ locale, namespace: 'pages.vaklui' });
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });
  // Niet-openbaar telefoonnummer alleen met buurtpas, net als op het overzicht.
  const buurtpas = await heeftBuurtpas();

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="vakman">
        <Link href={localizedHref(locale, '/vaklui')} className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">
          ← {t('terug')}
        </Link>

        <div className="mt-4 max-w-xl">
          <VakmanKaart vakman={kaartGegevens(vakman, buurtpas)} locale={locale} kopId="vakman" />
        </div>

        {telefoonAfgeschermd(vakman, buurtpas) ? (
          <div className="mt-6 max-w-3xl">
            <BuurtpasSlot locale={locale as 'nl' | 'en'} terug={vakmanPad(locale, slug)} titel={tb('slot.telefoon')} />
          </div>
        ) : null}

        <div className="mt-8">
          <VakluiDisclaimer locale={locale} />
        </div>
      </Section>
    </main>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { BuurtpasForm } from '@/components/buurtpas/BuurtpasForm';
import { formStrings } from '@/components/buurtpas/BuurtpasSlot';
import { beeindigBuurtpas } from '@/components/buurtpas/actions';
import { heeftBuurtpas, veiligTerugpad } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  return { title: t('heading'), description: t('intro') };
}

export default async function BuurtpasRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ terug?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  // Komt de bezoeker van een afgeschermde knop, dan gaat hij na het activeren daarheen terug.
  const terug = veiligTerugpad((await searchParams).terug, localizedHref(locale, '/buurtpas'));
  const actief = await heeftBuurtpas();

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="buurtpas">
        <SectionHead id="buurtpas" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />
        <ul className="mt-6 max-w-xl list-disc pl-5 leading-[1.6] text-text">
          <li>{t('punten.wat')}</li>
          <li>{t('punten.geenAccount')}</li>
          <li>{t('punten.apparaat')}</li>
        </ul>
        <div className={`${boxCls} mt-8 max-w-xl`}>
          {actief ? (
            <form action={beeindigBuurtpas} className="flex flex-col gap-3">
              <p className="m-0 font-medium text-primary">{t('actief')}</p>
              <input type="hidden" name="terug" value={terug} />
              <button type="submit" className="self-start text-sm text-primary underline">
                {t('uitloggen')}
              </button>
            </form>
          ) : (
            <BuurtpasForm locale={locale} terug={terug} strings={await formStrings(locale)} />
          )}
        </div>
        <p className="mt-4 mb-0 max-w-xl text-sm text-muted">{t('privacy')}</p>
      </Section>
    </main>
  );
}

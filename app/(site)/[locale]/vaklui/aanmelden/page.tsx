import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { VakmanForm } from '@/components/vaklui/VakmanForm';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.vaklui.aanmelden' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function VakmanAanmeldenRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.vaklui.aanmelden' });
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });
  // Alleen buren met een buurtpas kunnen aanmelden (leest cookies, dus per request gerenderd).
  const buurtpas = await heeftBuurtpas();
  const f = (key: string) => t(`form.${key}`);

  let vakken: { id: number; naam: string }[] = [];
  if (buurtpas) {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({ collection: 'vakken', locale: locale as 'nl' | 'en', depth: 0, pagination: false });
    vakken = docs.map((v) => ({ id: v.id, naam: v.naam })).sort((a, b) => a.naam.localeCompare(b.naam, locale));
  }

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="vakman-aanmelden">
        <SectionHead id="vakman-aanmelden" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />

        <div className="mt-8 max-w-2xl">
          {buurtpas ? (
            <div className={boxCls}>
              <VakmanForm
                locale={locale}
                vakken={vakken}
                strings={{
                  naam: f('naam'),
                  naamPlaceholder: f('naamPlaceholder'),
                  vakken: f('vakken'),
                  vakkenHint: f('vakkenHint'),
                  anderVak: f('anderVak'),
                  anderVakPlaceholder: f('anderVakPlaceholder'),
                  telefoon: f('telefoon'),
                  website: f('website'),
                  contactHint: f('contactHint'),
                  aanmelderNaam: f('aanmelderNaam'),
                  aanmelderNaamHint: f('aanmelderNaamHint'),
                  toelichting: f('toelichting'),
                  toelichtingHint: f('toelichtingHint'),
                  akkoord: f('akkoord'),
                  submit: f('submit'),
                  submitting: f('submitting'),
                  success: f('success'),
                  error: {
                    velden: f('error.velden'),
                    vak: f('error.vak'),
                    contact: f('error.contact'),
                    akkoord: f('error.akkoord'),
                    buurtpas: f('error.buurtpas'),
                    server: f('error.server'),
                  },
                }}
              />
            </div>
          ) : (
            <BuurtpasSlot locale={locale as 'nl' | 'en'} terug={localizedHref(locale, '/vaklui/aanmelden')} titel={tb('slot.vakmanAanmelden')} />
          )}
        </div>
      </Section>
    </main>
  );
}

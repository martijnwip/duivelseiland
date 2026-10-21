import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { WhatsappForm } from '@/components/whatsapp/WhatsappForm';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { WHATSAPP_GROEPEN } from '@/lib/whatsapp-groepen/constants';
import { localizedHref } from '@/i18n/localizedHref';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.whatsapp' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function WhatsappRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.whatsapp' });
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });
  // Alleen buren met een buurtpas kunnen zich aanmelden (leest cookies, dus per request gerenderd).
  const buurtpas = await heeftBuurtpas();
  const f = (key: string) => t(`form.${key}`);

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="whatsapp-aanmelden">
        <SectionHead id="whatsapp-aanmelden" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />

        <div className="mt-8 max-w-2xl">
          {buurtpas ? (
            <div className={boxCls}>
              <WhatsappForm
                locale={locale}
                groepen={WHATSAPP_GROEPEN.map((g) => ({ value: g.value, naam: t(`groepen.${g.value}.naam`), uitleg: t(`groepen.${g.value}.uitleg`) }))}
                strings={{
                  naam: f('naam'),
                  telefoon: f('telefoon'),
                  telefoonHint: f('telefoonHint'),
                  groepen: f('groepen'),
                  groepenHint: f('groepenHint'),
                  akkoord: f('akkoord'),
                  submit: f('submit'),
                  submitting: f('submitting'),
                  success: f('success'),
                  error: {
                    velden: f('error.velden'),
                    groep: f('error.groep'),
                    akkoord: f('error.akkoord'),
                    buurtpas: f('error.buurtpas'),
                    server: f('error.server'),
                  },
                }}
              />
            </div>
          ) : (
            <BuurtpasSlot locale={locale as 'nl' | 'en'} terug={localizedHref(locale, '/whatsapp')} titel={tb('slot.whatsappAanmelden')} />
          )}
        </div>
      </Section>
    </main>
  );
}

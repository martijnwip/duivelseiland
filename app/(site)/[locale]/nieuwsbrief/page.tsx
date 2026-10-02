import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { NieuwsbriefForm } from '@/components/nieuwsbrief/NieuwsbriefForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nieuwsbrief' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function NieuwsbriefRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'nieuwsbrief' });

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="nieuwsbrief">
        <SectionHead id="nieuwsbrief" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />
        <div className={`${boxCls} mt-8 max-w-xl`}>
          <NieuwsbriefForm
            locale={locale}
            strings={{
              legend: t('form.legend'),
              aanmelden: t('form.aanmelden'),
              afmelden: t('form.afmelden'),
              emailLabel: t('form.emailLabel'),
              emailPlaceholder: t('form.emailPlaceholder'),
              submitAanmelden: t('form.submitAanmelden'),
              submitAfmelden: t('form.submitAfmelden'),
              submitting: t('form.submitting'),
              successAanmelden: t('form.successAanmelden'),
              successAfmelden: t('form.successAfmelden'),
              error: t('form.error'),
            }}
          />
        </div>
        <p className="mt-4 mb-0 max-w-xl text-sm text-muted">{t('privacy')}</p>
      </Section>
    </main>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { ContactForm } from '@/components/contact/ContactForm';
import { CONTACT_SOORTEN } from '@/lib/contact/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('heading'), description: t('metaDescription') };
}

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  const f = (key: string) => t(`form.${key}`);

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="contact">
        <SectionHead id="contact" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />

        <div className="mt-8 max-w-2xl">
          <div className={boxCls}>
            <ContactForm
              locale={locale}
              soorten={CONTACT_SOORTEN.map((value) => ({ value, label: t(`soorten.${value}`) }))}
              strings={{
                soort: f('soort'),
                naam: f('naam'),
                email: f('email'),
                emailHint: f('emailHint'),
                bericht: f('bericht'),
                submit: f('submit'),
                submitting: f('submitting'),
                success: f('success'),
                error: { velden: f('error.velden'), email: f('error.email'), server: f('error.server') },
              }}
            />
          </div>
        </div>
      </Section>
    </main>
  );
}

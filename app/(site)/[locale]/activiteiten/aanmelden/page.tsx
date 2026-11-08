import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { IdeeForm } from '@/components/activiteiten/IdeeForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'activiteiten.aanmelden' });
  return metDeelinfo(locale, { title: t('eyebrow'), description: t('metaDescription') });
}

export default async function IdeeAanmeldenRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'activiteiten' });
  const stappen = t.raw('aanmelden.stappen') as string[];
  const regels = t.raw('aanmelden.regels') as string[];
  const f = (key: string) => t(`ideeForm.${key}`);

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="idee-aanmelden">
        <SectionHead id="idee-aanmelden" eyebrow={t('aanmelden.eyebrow')} title={t('aanmelden.heading')} intro={t('aanmelden.intro')} />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className={boxCls}>
            <h3 className="m-0 font-heading text-lg font-semibold text-text">{t('aanmelden.stappenTitel')}</h3>
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-text">
              {stappen.map((stap) => (
                <li key={stap}>{stap}</li>
              ))}
            </ol>
          </div>
          <div className={boxCls}>
            <h3 className="m-0 font-heading text-lg font-semibold text-text">{t('aanmelden.regelsTitel')}</h3>
            <p className="m-0 text-text">{t('aanmelden.regelsIntro')}</p>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-text">
              {regels.map((regel) => (
                <li key={regel}>{regel}</li>
              ))}
            </ul>
            <p className="m-0 text-sm text-muted">{t('aanmelden.nietToegestaan')}</p>
          </div>
        </div>

        <div className={`${boxCls} mt-6 max-w-2xl`}>
          <IdeeForm
            locale={locale}
            strings={{
              titel: f('titel'),
              titelPlaceholder: f('titelPlaceholder'),
              omschrijving: f('omschrijving'),
              omschrijvingHint: f('omschrijvingHint'),
              soort: f('soort'),
              eenmalig: t('soort.eenmalig'),
              terugkerend: t('soort.terugkerend'),
              soortToelichting: f('soortToelichting'),
              soortToelichtingPlaceholder: f('soortToelichtingPlaceholder'),
              datum: f('datum'),
              datumHint: f('datumHint'),
              afbeelding: f('afbeelding'),
              afbeeldingHint: f('afbeeldingHint'),
              afbeeldingTeGroot: f('afbeeldingTeGroot'),
              naam: f('naam'),
              naamHint: f('naamHint'),
              email: f('email'),
              emailHint: f('emailHint'),
              akkoord: f('akkoord'),
              submit: f('submit'),
              submitting: f('submitting'),
              success: f('success'),
              error: {
                velden: f('error.velden'),
                afbeelding: f('error.afbeelding'),
                akkoord: f('error.akkoord'),
                server: f('error.server'),
              },
            }}
          />
        </div>
      </Section>
    </main>
  );
}

import { getTranslations } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { Icon, type PraktischeInfoIconName } from './icons';
import { BRIEVENBUSSEN, PraktischeKaart } from './PraktischeKaart';

const AED_KAARTEN = [
  { key: 'locatie', icon: 'locatie' },
  { key: 'pincode', icon: 'slot' },
] as const satisfies readonly { key: string; icon: PraktischeInfoIconName }[];

const IN_DE_BUURT = [
  { key: 'kerk', icon: 'kerk', url: 'https://amsterdam.oudkatholiek.nl/' },
] as const satisfies readonly { key: string; icon: PraktischeInfoIconName; url: string }[];

export async function PraktischeInfoPage({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'praktischeInfo' });

  return (
    <main>
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-12 xl:pt-14 xl:pb-16">
        <div className="flex flex-col gap-4">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('intro.eyebrow')}</div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold text-primary xl:text-5xl">{t('intro.title')}</h1>
          <p className="m-0 max-w-[620px] text-lg leading-[1.5] text-text">{t('intro.lead')}</p>
        </div>
      </header>

      <Section id="praktisch-brievenbussen">
        <SectionHead
          id="praktisch-brievenbussen"
          eyebrow={t('brievenbussen.eyebrow')}
          title={t('brievenbussen.title')}
          intro={t('brievenbussen.intro')}
        />
        <ul className="mt-8 grid list-none gap-4 p-0 md:grid-cols-3">
          {BRIEVENBUSSEN.map((key, i) => (
            <li key={key} className={boxCls}>
              <div className="flex items-center justify-between">
                <Icon name="brievenbus" className="size-10 text-primary" />
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-card">
                  <span className="sr-only">{t('brievenbussen.nummer')} </span>
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`brievenbussen.items.${key}.adres`)}</h3>
                <p className="mt-1 mb-0 leading-[1.5] text-muted">{t(`brievenbussen.items.${key}.bij`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="praktisch-aed">
        <SectionHead id="praktisch-aed" eyebrow={t('aed.eyebrow')} title={t('aed.title')} intro={t('aed.intro')} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {AED_KAARTEN.map(({ key, icon }) => (
            <div key={key} className={boxCls}>
              <div className="flex items-start gap-4">
                <Icon name={icon} className="size-10 flex-none text-primary" />
                <div>
                  <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`aed.${key}.title`)}</h3>
                  <p className="mt-1 mb-0 leading-[1.5] text-muted">{t(`aed.${key}.text`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${boxCls} mt-4 border-2 border-primary`}>
          <div className="flex items-start gap-4">
            <Icon name="telefoon" className="size-10 flex-none text-primary" />
            <div>
              <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('aed.noodgeval.title')}</h3>
              <p className="mt-1 mb-0 max-w-[620px] leading-[1.5] text-text">{t('aed.noodgeval.text')}</p>
            </div>
          </div>
          <a
            href="tel:112"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-cta px-5 py-2 font-medium text-on-cta no-underline transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('aed.noodgeval.knop')}
          </a>
        </div>

        <p className="mt-6 mb-0 leading-[1.5] text-text">
          {t.rich('aed.hartslagnu', {
            link: (chunks) => (
              <a href="https://www.hartslagnu.nl" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                {chunks}
                <span className="sr-only"> ({t('nieuwVenster')})</span>
              </a>
            ),
          })}
        </p>
      </Section>

      <Section id="praktisch-in-de-buurt">
        <SectionHead
          id="praktisch-in-de-buurt"
          eyebrow={t('inDeBuurt.eyebrow')}
          title={t('inDeBuurt.title')}
          intro={t('inDeBuurt.intro')}
        />
        <ul className="mt-8 grid list-none gap-4 p-0 md:grid-cols-2">
          {IN_DE_BUURT.map(({ key, icon, url }) => (
            <li key={key} className={boxCls}>
              <div className="flex items-start gap-4">
                <Icon name={icon} className="size-10 flex-none text-primary" />
                <div>
                  <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`inDeBuurt.items.${key}.naam`)}</h3>
                  <p className="mt-1 mb-0 leading-[1.5] text-muted">{t(`inDeBuurt.items.${key}.adres`)}</p>
                  <p className="mt-3 mb-0 leading-[1.5] text-text">{t(`inDeBuurt.items.${key}.tekst`)}</p>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-medium text-primary underline">
                    {t('inDeBuurt.link')}
                    <span className="sr-only"> ({t('nieuwVenster')})</span>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="praktisch-kaart">
        <SectionHead id="praktisch-kaart" eyebrow={t('kaart.eyebrow')} title={t('kaart.title')} />
        <figure className={`${boxCls} mt-8 mb-0`}>
          <PraktischeKaart label={t('kaart.label')} />
          <figcaption className="text-sm leading-[1.4] text-muted">{t('kaart.bijschrift')}</figcaption>
        </figure>
      </Section>
    </main>
  );
}

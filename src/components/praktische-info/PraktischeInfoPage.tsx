import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { Legend } from '@/components/stats/charts/base';
import { getParkeervakken } from '@/lib/parkeren/api';
import { perSoort } from '@/lib/parkeren/aggregate';
import { BEZOEK_KORTING, getTarieven, type Betaaltijd } from '@/lib/parkeren/tarieven';
import { Icon, type PraktischeInfoIconName } from './icons';
import { BRIEVENBUSSEN, PraktischeKaart } from './PraktischeKaart';
import { ParkeerKaart, SOORT_TONE } from './ParkeerKaart';

const AED_KAARTEN = [
  { key: 'locatie', icon: 'locatie' },
  { key: 'pincode', icon: 'slot' },
] as const satisfies readonly { key: string; icon: PraktischeInfoIconName }[];

const IN_DE_BUURT = [
  { key: 'kerk', icon: 'kerk', url: 'https://amsterdam.oudkatholiek.nl/' },
] as const satisfies readonly { key: string; icon: PraktischeInfoIconName; url: string }[];

const PARKEER_SOORTEN = ['laadpaal', 'laden-lossen', 'deelauto', 'gehandicapt'] as const;

/** Links naar amsterdam.nl, gecontroleerd (alleen in het Nederlands). */
const PARKEER_LINKS = {
  vergunning: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-voor-bewoners/',
  bezoek: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunningen-voor-uw-bezoek/parkeervergunning-bezoek-aanvragen/',
  tarievenkaart: 'https://www.amsterdam.nl/parkeren/parkeertarieven-kaart/',
} as const;

/** Overige uitleg bij parkeren. */
const PARKEER_KAARTJES = [
  { key: 'laden', icon: 'doos', url: null },
  { key: 'laadpaal', icon: 'stekker', url: 'https://www.amsterdam.nl/parkeren/elektrische-oplaadpunten-amsterdam/' },
  { key: 'gehandicapt', icon: 'rolstoel', url: 'https://www.amsterdam.nl/parkeren/parkeren-gehandicapten/parkeren-gehandicapten-waar/' },
] as const satisfies readonly { key: string; icon: PraktischeInfoIconName; url: string | null }[];

export async function PraktischeInfoPage({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'praktischeInfo' });
  const [vakken, tarieven] = await Promise.all([getParkeervakken(), getTarieven()]);
  const aantal = vakken.ok ? perSoort(vakken.data) : null;
  const tarief = tarieven.ok ? tarieven.data : null;
  const num = (n: number) => n.toLocaleString(locale);
  const euro = (n: number) => n.toLocaleString(locale, { style: 'currency', currency: 'EUR' });
  // "09:00" → "9.00" (nl) of "9:00" (en).
  const klok = (hhmm: string) => hhmm.replace(/^0/, '').replace(':', locale === 'nl' ? '.' : ':');
  const tijden = (b: Betaaltijd[]) => b.map((x) => `${t(`parkeren.tarief.dagen.${x.dagen}`)} ${klok(x.van)}–${klok(x.tot)}`).join(', ');
  const sinds = tarief
    ? new Date(`${tarief.sinds.slice(0, 4)}-${tarief.sinds.slice(4, 6)}-${tarief.sinds.slice(6, 8)}`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const externeLink = (href: string, label: ReactNode) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
      {label}
      <span className="sr-only"> ({t('nieuwVenster')})</span>
    </a>
  );

  return (
    <main>
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-12 xl:pt-14 xl:pb-16">
        <div className="flex flex-col gap-4">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('intro.eyebrow')}</div>
          <h1 className="m-0 text-4xl leading-[1.1] font-bold text-text xl:text-5xl">{t('intro.title')}</h1>
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
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-primary px-5 py-2 font-medium text-on-primary no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

      <Section id="praktisch-parkeren">
        <SectionHead id="praktisch-parkeren" eyebrow={t('parkeren.eyebrow')} title={t('parkeren.title')} intro={t('parkeren.intro')} />

        <h3 className="mt-8 mb-0 text-xl leading-[1.3] font-semibold text-text">{t('parkeren.tarief.titel')}</h3>
        <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-3">
          <li className={boxCls}>
            <div className="flex items-center gap-3">
              <Icon name="auto" className="size-9 flex-none text-primary" />
              <h4 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('parkeren.tarief.bezoeker.titel')}</h4>
            </div>
            {tarief ? (
              <>
                <p className="m-0 font-heading text-3xl leading-none font-semibold text-primary">{t('parkeren.tarief.perUur', { bedrag: euro(tarief.perUur) })}</p>
                <p className="m-0 leading-[1.5] text-text">{t('parkeren.tarief.bezoeker.betalen', { tijden: tijden(tarief.betaaltijden) })}</p>
                <p className="m-0 leading-[1.5] text-muted">
                  {t('parkeren.tarief.bezoeker.kaarten', { dag: euro(tarief.kaarten.dag), zondag: euro(tarief.kaarten.zondag), avond: euro(tarief.kaarten.avond) })}
                </p>
              </>
            ) : (
              <p className="m-0 leading-[1.5] text-muted">{t('parkeren.tarief.onbekend')}</p>
            )}
          </li>
          <li className={boxCls}>
            <div className="flex items-center gap-3">
              <Icon name="bezoek" className="size-9 flex-none text-primary" />
              <h4 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('parkeren.tarief.bezoek.titel')}</h4>
            </div>
            {tarief ? (
              <p className="m-0 font-heading text-3xl leading-none font-semibold text-primary">
                {t('parkeren.tarief.perUur', { bedrag: euro(Math.round(tarief.perUur * (1 - BEZOEK_KORTING) * 100) / 100) })}
              </p>
            ) : null}
            <p className="m-0 leading-[1.5] text-text">{t('parkeren.tarief.bezoek.tekst')}</p>
            <p className="m-0">{externeLink(PARKEER_LINKS.bezoek, t('parkeren.link'))}</p>
          </li>
          <li className={boxCls}>
            <div className="flex items-center gap-3">
              <Icon name="slot" className="size-9 flex-none text-primary" />
              <h4 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t('parkeren.tarief.bewoner.titel')}</h4>
            </div>
            <p className="m-0 font-heading text-3xl leading-none font-semibold text-primary">{t('parkeren.tarief.bewoner.prijs')}</p>
            <p className="m-0 leading-[1.5] text-text">{t('parkeren.tarief.bewoner.tekst')}</p>
            <p className="m-0">{externeLink(PARKEER_LINKS.vergunning, t('parkeren.link'))}</p>
          </li>
        </ul>
        <p className="mt-4 mb-0 text-sm leading-[1.5] text-muted">
          {tarief
            ? t.rich('parkeren.tarief.bron', { datum: sinds, link: (chunks) => externeLink(PARKEER_LINKS.tarievenkaart, chunks) })
            : externeLink(PARKEER_LINKS.tarievenkaart, t('parkeren.link'))}
        </p>

        {vakken.ok && aantal ? (
          <>
            <dl className="mt-8 mb-0 grid grid-cols-2 gap-4 md:grid-cols-5">
              {(['totaal', ...PARKEER_SOORTEN] as const).map((key) => (
                <div key={key} className="flex flex-col gap-1 border-t border-border pt-3">
                  <dt className="order-2 text-sm leading-[1.4] text-muted">{t(`parkeren.cijfers.${key}`)}</dt>
                  <dd className="order-1 m-0 font-heading text-3xl leading-none font-semibold text-primary">{num(aantal[key])}</dd>
                </div>
              ))}
            </dl>
            <figure className={`${boxCls} mt-6 mb-0`}>
              <ParkeerKaart
                vakken={vakken.data}
                label={t('parkeren.kaartLabel', {
                  laadpaal: aantal.laadpaal,
                  ladenLossen: aantal['laden-lossen'],
                  deelauto: aantal.deelauto,
                  gehandicapt: aantal.gehandicapt,
                })}
              />
              <div className="flex flex-wrap items-center gap-x-4.5 gap-y-1.5">
                <Legend items={PARKEER_SOORTEN.map((key) => ({ label: t(`parkeren.legenda.${key}`), tone: SOORT_TONE[key] }))} />
                {/* Gewone vakken staan op de kaart als omtrek, dus hier ook. */}
                <span className="inline-flex items-center gap-2 text-[13px] text-text">
                  <span aria-hidden className="size-3 rounded-[2px] border border-muted" />
                  {t('parkeren.legenda.gewoon')}
                </span>
              </div>
              <figcaption className="text-sm leading-[1.4] text-muted">{t('parkeren.bron')}</figcaption>
            </figure>
          </>
        ) : null}

        <ul className="mt-6 grid list-none gap-4 p-0 md:grid-cols-2">
          {PARKEER_KAARTJES.map(({ key, icon, url }) => (
            <li key={key} className={boxCls}>
              <div className="flex items-start gap-4">
                <Icon name={icon} className="size-10 flex-none text-primary" />
                <div>
                  <h3 className="m-0 text-lg leading-[1.3] font-semibold text-text">{t(`parkeren.kaartjes.${key}.title`)}</h3>
                  <p className="mt-1 mb-0 leading-[1.5] text-text">{t(`parkeren.kaartjes.${key}.text`)}</p>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-medium text-primary underline">
                      {t('parkeren.link')}
                      <span className="sr-only"> ({t('nieuwVenster')})</span>
                    </a>
                  ) : null}
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

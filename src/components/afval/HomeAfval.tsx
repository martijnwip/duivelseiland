import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { makeFormatters } from '@/lib/stats/format';
import { CountUp } from '@/components/stats/CountUp';
import { getBijplaatsingen, getContainers, getMeldingen } from '@/lib/afval/api';
import { jaarVergelijking, meldingenRecent } from '@/lib/afval/aggregate';
import { Icon, Mark, type IconName } from './instructie/icons';

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M2 7.5h10M8 3.5l4 4-4 4" />
  </svg>
);
const buttonCls =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2 font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Dubbele lijn + kopstuk, gedeeld door de sectie en het skeleton. */
async function Kop({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.afval' });
  return (
    <>
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      {/* Zelfde kopvorm als HomeDuivelseSchoonmaak / een hoofdstuk op Buurt statistieken. */}
      <div className="mt-8 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h2 id="home-afval-title" className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
            {t('title')}
          </h2>
          <p className="m-0 max-w-[560px] text-lg leading-[1.4] text-text">{t('intro')}</p>
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold text-primary xl:text-[48px]">{t('factBig')}</span>
          <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('factText')}</span>
        </div>
      </div>
    </>
  );
}

function Regel({ icons, title, text }: { icons: ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3 border-t border-border py-3 first:border-t-0">
      <span aria-hidden className="flex h-12 w-24 flex-none items-center justify-center gap-0.5 rounded-md bg-background text-text">
        {icons}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 font-heading text-[15px] font-semibold text-text">
          <Mark ok className="size-4" />
          {title}
        </span>
        <span className="text-sm leading-[1.4] text-muted">{text}</span>
      </span>
    </li>
  );
}

const icon = (name: IconName, cls = 'size-9') => <Icon name={name} className={cls} />;

/** Homepagina-sectie na Duivelse Schoonmaak: mini-instructie (links) en drie live afvalcijfers (rechts). */
export async function HomeAfval({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.afval' });
  const f = makeFormatters(locale);
  const [containers, bij, meldingen] = await Promise.all([getContainers(), getBijplaatsingen(), getMeldingen()]);

  const kpis = [
    { key: 'containers', value: containers.ok ? containers.data.length : null },
    { key: 'bijplaatsingen', value: bij.ok && bij.data.length ? jaarVergelijking(bij.data).recent : null },
    { key: 'meldingen', value: meldingen.ok ? meldingenRecent(meldingen.data, new Date(), 90).recent.length : null },
  ];

  return (
    <section aria-labelledby="home-afval-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <Kop locale={locale} />

      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        {/* Mini-instructie in de stijl van de instructiekaart */}
        <div className="flex flex-col gap-4 overflow-hidden rounded-xl border-2 border-text bg-card">
          <div className="flex items-center gap-4 bg-primary px-4 py-3 text-background">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase">{t('whenLabel')}</span>
              <span className="font-heading text-[22px] leading-tight font-bold whitespace-nowrap">{t('when')}</span>
            </div>
          </div>
          <ul className="m-0 list-none px-4 py-0">
            <Regel
              icons={
                <>
                  {icon('zak', 'size-8')}
                  {icon('container', 'size-10')}
                </>
              }
              title={t('rules.rest.title')}
              text={t('rules.rest.text')}
            />
            <Regel
              icons={
                <>
                  {icon('mes', 'size-7')}
                  {icon('papiercontainer', 'size-10')}
                </>
              }
              title={t('rules.karton.title')}
              text={t('rules.karton.text')}
            />
            <Regel icons={icon('kubus', 'size-10 text-primary')} title={t('rules.grof.title')} text={t('rules.grof.text')} />
          </ul>
          <div className="px-4 pb-4">
            <Link href={localizedHref(locale, '/afval/instructie')} className={`${buttonCls} bg-primary text-on-primary hover:bg-primary-hover`}>
              {t('cardCta')}
              <span className="sr-only"> {t('cardCtaContext')}</span>
              {ARROW}
            </Link>
          </div>
        </div>

        {/* Live cijfers */}
        <div className="flex flex-col gap-6">
          <dl className="m-0 grid border-t border-b border-border">
            {kpis.map((k) => (
              <div key={k.key} className="flex min-w-0 items-baseline gap-4 border-t border-border py-4 first:border-t-0">
                <dt className="order-2 text-[15px] leading-[1.3] text-text">{t(`kpi.${k.key}`)}</dt>
                <dd className="order-1 m-0 w-24 flex-none font-heading text-[32px] leading-[1.05] font-semibold whitespace-nowrap text-text xl:text-[40px]">
                  {k.value === null ? (
                    '–'
                  ) : (
                    <CountUp value={k.value} locale={locale}>
                      {f.num(k.value)}
                    </CountUp>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="m-0 -mt-3 text-[13px] text-muted">{t('source')}</p>
          <Link href={localizedHref(locale, '/afval')} className={`${buttonCls} self-start border border-input-border bg-card text-text hover:bg-background`}>
            {t('statsCta')}
            <span className="sr-only"> {t('statsCtaContext')}</span>
            {ARROW}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Tijdens het (eventueel trage) ophalen van de live cijfers: kopstuk staat er al, de rest is een placeholder. */
export async function HomeAfvalSkeleton({ locale }: { locale: string }) {
  return (
    <section aria-labelledby="home-afval-title" aria-busy="true" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <Kop locale={locale} />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border-2 border-border bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    </section>
  );
}

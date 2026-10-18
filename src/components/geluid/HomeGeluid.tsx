import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import type { T } from '@/components/stats/cards/card';
import { Icon, Mark, type IconName } from '@/components/afval/instructie/icons';
import { ADVIES_LAWAAI_VANAF, BOUW, uur } from '@/lib/geluid/constants';
import { WeekBalk, type WeekBalkLabels } from './WeekBalk';

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M2 7.5h10M8 3.5l4 4-4 4" />
  </svg>
);
const buttonCls =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2 font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function Regel({ icons, title, text }: { icons: ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3 border-t border-border py-3 first:border-t-0">
      <span aria-hidden className="flex h-12 w-16 flex-none items-center justify-center gap-0.5 rounded-md bg-background text-text">
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

const REGELS = [
  { key: 'later', icon: 'boor' },
  { key: 'buren', icon: 'brief' },
  { key: 'feest', icon: 'muziek' },
] as const satisfies readonly { key: string; icon: IconName }[];

/** Homepagina-sectie na Afval: de inleiding van /geluid, drie vuistregels (links) en de weekbalk (rechts). */
export async function HomeGeluid({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'home.geluid' })) as unknown as T;
  // Inleiding en weekbalk komen van de pagina zelf, zodat ze niet uit elkaar lopen.
  const tg = (await getTranslations({ locale, namespace: 'pages.geluid' })) as unknown as T;
  const tijd = { van: uur(BOUW.van, locale), tot: uur(BOUW.tot, locale), advies: uur(ADVIES_LAWAAI_VANAF, locale) };
  const week: WeekBalkLabels = { ...(tg.raw('verbouwen.week') as WeekBalkLabels), summary: tg('verbouwen.week.summary', tijd) };

  return (
    <section aria-labelledby="home-geluid-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      {/* Zelfde kopvorm als HomeAfval / een hoofdstuk op Buurt statistieken. */}
      <div className="mt-8 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h2 id="home-geluid-title" className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
            {t('title')}
          </h2>
          <p className="m-0 max-w-[560px] text-lg leading-[1.4] text-text">{tg('hero.lead')}</p>
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold whitespace-nowrap text-primary xl:text-[48px]">
            {tijd.van}–{tijd.tot}
          </span>
          <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('factText')}</span>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        {/* Vuistregels in de stijl van de instructiekaart */}
        <div className="flex flex-col gap-4 overflow-hidden rounded-xl border-2 border-text bg-card">
          <ul className="m-0 list-none px-4 pt-2 pb-0">
            {REGELS.map(({ key, icon }) => (
              <Regel key={key} icons={<Icon name={icon} className="size-9" />} title={t(`rules.${key}.title`)} text={t(`rules.${key}.text`)} />
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 pb-4">
            <Link href={localizedHref(locale, '/geluid/instructie')} className={`${buttonCls} bg-primary text-on-primary hover:bg-primary-hover`}>
              {t('cardCta')}
              <span className="sr-only"> {t('cardCtaContext')}</span>
              {ARROW}
            </Link>
            <Link href={localizedHref(locale, '/geluid/briefje')} className="font-medium text-primary underline underline-offset-3 hover:text-text">
              {t('briefjeCta')}
            </Link>
          </div>
        </div>

        {/* Wanneer mag het */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <h3 className="m-0 text-[17px] leading-[1.3] font-semibold text-text">{t('weekTitle')}</h3>
            <WeekBalk labels={week} />
          </div>
          <Link href={localizedHref(locale, '/geluid')} className={`${buttonCls} self-start border border-input-border bg-card text-text hover:bg-background`}>
            {t('pageCta')}
            <span className="sr-only"> {t('pageCtaContext')}</span>
            {ARROW}
          </Link>
        </div>
      </div>
    </section>
  );
}

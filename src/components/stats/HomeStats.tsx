import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { makeFormatters } from '@/lib/stats/format';
import { section } from '@/lib/stats/load';
import { CountUp } from './CountUp';

// Welke kerncijfers op de homepage staan (sleutels uit de sectie `kerncijfers`).
const KEYS = ['inwoners', 'woningen', 'gemiddelde-woz-waarde', 'inwoners-per-km'] as const;

/** Homepagina-sectie: vier kerncijfers als introductie en een knop naar Buurt statistieken. */
export async function HomeStats({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.stats' });
  const tk = await getTranslations({ locale, namespace: 'pages.buurtStatistieken' });
  const f = makeFormatters(locale);
  const s = section('kerncijfers');
  const items = KEYS.map((key) => s.data.find((x) => x.key === key)).filter((x) => x !== undefined);

  return (
    <section aria-labelledby="home-stats-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <h2 id="home-stats-title" className="m-0 text-3xl leading-[1.15] font-semibold text-text xl:text-4xl">
          {t('title')}
        </h2>
        <p className="m-0 max-w-[640px] text-lg leading-[1.5] text-text">{t('intro')}</p>
      </div>

      <dl className="m-0 mt-8 grid grid-cols-2 gap-x-6 border-t border-b border-border md:grid-cols-4 md:gap-x-0">
        {items.map((it) => {
          const eur = it.eenheid === '€';
          const prefix = eur ? '€ ' : '';
          return (
            <div key={it.key} className="flex min-w-0 flex-col-reverse justify-end gap-1 py-5 md:pr-5">
              <dt className="text-[15px] leading-[1.3] text-text">
                {tk(`kpi.${it.key}`)}
                <span className="block text-[13px] text-muted">{t('source', { year: String(it.jaar) })}</span>
              </dt>
              <dd className="m-0 font-heading text-[32px] leading-[1.05] font-semibold whitespace-nowrap text-text xl:text-[40px]">
                <CountUp value={it.waarde} locale={locale} prefix={prefix}>
                  {`${prefix}${f.num(it.waarde)}`}
                </CountUp>
              </dd>
            </div>
          );
        })}
      </dl>

      <Link
        href={localizedHref(locale, '/buurt-statistieken')}
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cta px-5 py-2 font-medium text-on-cta no-underline transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t('readMore')}
        <span className="sr-only"> {t('readMoreContext')}</span>
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M2 7.5h10M8 3.5l4 4-4 4" />
        </svg>
      </Link>
    </section>
  );
}

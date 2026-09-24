import { CountUp } from './CountUp';
import type { Ctx } from './cards/card';
import { section } from '@/lib/stats/load';

const ARROW_DOWN = (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M7.5 2v10M3 8l4.5 4.5L12 8" />
  </svg>
);

/** Kerncijfers onder de titel; tellen omhoog zodra ze in beeld komen. */
function KpiStrip({ ctx }: { ctx: Ctx }) {
  const { t, f, locale } = ctx;
  const s = section('kerncijfers');
  const affix: Record<string, { prefix?: string; suffix?: string }> = {
    'gemiddelde-woz-waarde': { prefix: '€\u00a0' },
    oppervlakte: { suffix: ` ${t('ui.hectare')}` },
  };
  return (
    <div className="grid grid-cols-2 gap-x-6 border-t-2 border-b border-text xl:grid-cols-6 xl:gap-x-0">
      {s.data.map((it) => {
        const meta = affix[it.key] ?? {};
        const shown = `${meta.prefix ?? ''}${f.num(it.waarde)}${meta.suffix ?? ''}`;
        return (
          <div key={it.key} className="flex min-w-0 flex-col gap-1 py-4 xl:py-5 xl:pr-5">
            <span className="font-heading text-[32px] leading-[1.05] font-semibold whitespace-nowrap text-text xl:text-[40px]">
              <CountUp value={it.waarde} locale={locale} prefix={meta.prefix} suffix={meta.suffix}>
                {shown}
              </CountUp>
            </span>
            <span className="text-[15px] leading-[1.3] text-text">{t(`kpi.${it.key}`)}</span>
            <span className="text-[13px] text-muted">{t('ui.kpiSource', { bron: s.bron, jaar: String(it.jaar) })}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Hero({ ctx }: { ctx: Ctx }) {
  const { t } = ctx;
  return (
    <section className="flex flex-col gap-8 pt-8 pb-10 xl:gap-14 xl:pt-20 xl:pb-16">
      <div className="flex flex-col-reverse items-start justify-between gap-6 xl:flex-row xl:items-center xl:gap-16">
        <div className="flex min-w-0 flex-col gap-4 xl:gap-5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('hero.eyebrow')}</div>
          <h1 className="m-0 text-[46px] leading-[1.02] font-bold tracking-[-0.02em] text-text xl:text-[84px]">{t('heading')}</h1>
          <p className="m-0 max-w-[640px] text-[19px] leading-[1.45] text-text xl:text-[22px]">{t('hero.intro')}</p>
          <a
            href="#mensen"
            className="inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('hero.start')} {ARROW_DOWN}
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/duivelseiland-mark-color.svg" alt="" className="h-24 w-auto flex-none xl:h-44" />
      </div>
      <KpiStrip ctx={ctx} />
    </section>
  );
}

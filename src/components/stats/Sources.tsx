import type { Ctx } from './cards/card';
import { stats } from '@/lib/stats/load';

type Row = { name: string; what: string; period: string };

/** Bronnen en toelichting: peiljaren per bron, schatting, afronding en gebruik. */
export function Sources({ ctx }: { ctx: Ctx }) {
  const { t } = ctx;
  const rows = t.raw('sources.rows') as Row[];
  const date = new Intl.DateTimeFormat(ctx.locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(stats.peildatum_bron));
  return (
    <section id="bronnen" aria-labelledby="bronnen-t" className="flex scroll-mt-26 flex-col gap-8">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      <h2 id="bronnen-t" className="m-0 text-[30px] leading-[1.1] font-semibold text-text xl:text-[44px]">
        {t('sources.title')}
      </h2>
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:gap-16">
        <div>
          <h3 className="m-0 mb-2.5 text-[15px] font-semibold text-text">{t('sources.tableTitle')}</h3>
          <table className="w-full border-collapse">
            <caption className="sr-only">{t('sources.tableTitle')}</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{t('sources.colSource')}</th>
                <th scope="col">{t('sources.colWhat')}</th>
                <th scope="col">{t('sources.colPeriod')}</th>
              </tr>
            </thead>
            <tbody className="max-xl:block">
              {rows.map((r) => (
                <tr key={r.name} className="max-xl:flex max-xl:flex-col max-xl:gap-0.5 max-xl:border-t max-xl:border-border max-xl:py-3">
                  <th scope="row" className="border-t border-border py-2.5 pr-4 text-left align-top text-sm leading-[1.4] font-semibold whitespace-nowrap text-text max-xl:border-0 max-xl:p-0 max-xl:text-[15px] max-xl:whitespace-normal">
                    {r.name}
                  </th>
                  <td className="border-t border-border py-2.5 pr-4 align-top text-sm leading-[1.4] text-text max-xl:border-0 max-xl:p-0">{r.what}</td>
                  <td className="border-t border-border py-2.5 align-top text-sm leading-[1.4] whitespace-nowrap text-muted max-xl:border-0 max-xl:p-0 max-xl:text-[13px]">{r.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3.5">
          <h3 className="m-0 text-[15px] font-semibold text-text">{t('sources.estimateTitle')}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-text">{t('sources.estimateText')}</p>
          <h3 className="m-0 text-[15px] font-semibold text-text">{t('sources.roundedTitle')}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-text">{t('sources.roundedText')}</p>
          <h3 className="m-0 text-[15px] font-semibold text-text">{t('sources.viaTitle')}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-text">
            {t('sources.viaLead')}{' '}
            <a
              href={stats.vindplaats}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-3 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              allecijfers.nl
            </a>
            {t('sources.viaTail', { date })}
          </p>
          <h3 className="m-0 text-[15px] font-semibold text-text">{t('sources.useTitle')}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-text">{t('sources.useText')}</p>
        </div>
      </div>
    </section>
  );
}

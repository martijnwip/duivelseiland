import type { ReactNode } from 'react';
import { section } from '@/lib/stats/load';
import type { Formatters } from '@/lib/stats/format';
import { ChartCardShell } from '../ChartCardShell';
import { ChartFrame } from '../ChartFrame';
import { Dual } from '../charts/base';

/** Vertaler voor `pages.buurtStatistieken` (next-intl), met `has` voor optionele teksten. */
export type T = {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
  raw(key: string): unknown;
};

export type Ctx = {
  locale: string;
  f: Formatters;
  t: T;
  /** Vertaalt een Nederlands label uit de data (Engels: messages `labels.<slug>`; valt terug op het origineel). */
  tl: (label: string) => string;
  /** Maakt "sep 2026" / "mrt 2022 - sep 2026" en "2013-2025" geschikt voor de taal. */
  period: (jaar: string | number) => string;
};

export type Cell = string | number | null;

/** Echte tabel achter "Toon als tabel": caption, th scope, eerste kolom als rijkop. */
export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: Cell[][] }) {
  return (
    <div tabIndex={0} className="max-h-[420px] overflow-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={h + i}
                scope="col"
                className={`sticky top-0 bg-card pb-1.5 text-xs font-semibold text-muted ${i === 0 ? 'text-left' : 'text-right'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((c, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="border-t border-border py-2 pr-3 text-left font-normal text-text">
                    {c}
                  </th>
                ) : (
                  <td key={ci} className="border-t border-border py-2 text-right font-heading font-semibold text-text tabular-nums">
                    {c ?? '–'}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Eén kaart. Titel, ondertitel en noot komen uit `cards.<cardId>` in messages. */
export function Card({
  ctx,
  cardId,
  sid,
  chart,
  head,
  rows,
  noteValues,
}: {
  ctx: Ctx;
  cardId: string;
  sid: string;
  chart: ReactNode;
  head: string[];
  rows: Cell[][];
  /** Waarden voor plaatshouders in de noot (bijvoorbeeld het aantal niet getoonde partijen). */
  noteValues?: Record<string, string | number>;
}) {
  const { t } = ctx;
  const s = section(sid);
  const opt = (k: 'sub' | 'note') => (t.has(`cards.${cardId}.${k}`) ? t(`cards.${cardId}.${k}`, k === 'note' ? noteValues : undefined) : undefined);
  const values = { bron: s.bron, jaar: ctx.period(s.jaar) };
  const source = s.schatting ? t('ui.estimateSource', values) : t('ui.source', values);
  const title = t(`cards.${cardId}.title`);
  return (
    <ChartCardShell
      title={title}
      sub={opt('sub')}
      note={opt('note')}
      source={source}
      badge={s.schatting ? t('ui.estimate') : undefined}
      chart={<ChartFrame source={source}>{chart}</ChartFrame>}
      table={<DataTable caption={title} head={head} rows={rows} />}
      labels={{ showTable: t('ui.showTable'), showChart: t('ui.showChart') }}
    />
  );
}

/** Desktop- en mobielvariant van dezelfde grafiek; `full` = volle kaartbreedte. */
export function dual(full: boolean, make: (width: number, mobile: boolean) => ReactNode) {
  return <Dual desktop={make(full ? 976 : 452, false)} mobile={make(310, true)} />;
}

/** Kerncijfer met label en optioneel jaartal/toelichting (inkomen, auto's, bereik). */
export function Stat({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={`font-heading leading-[1.1] font-semibold text-text ${big ? 'text-[28px]' : 'text-[22px]'}`}>{value}</span>
      <span className="text-sm leading-[1.35] text-muted">{label}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}

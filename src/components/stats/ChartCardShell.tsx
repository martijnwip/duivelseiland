'use client';

import { useId, useState, type ReactNode } from 'react';

const ICON_TABLE = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <rect x="1.5" y="2.5" width="12" height="10" rx="1" />
    <path d="M1.5 6h12M1.5 9h12M6 2.5v10" />
  </svg>
);

/** Kaart om één grafiek: titel, "Toon als tabel", noot, bronregel en (bij schatting) een badge. */
export function ChartCardShell({
  title,
  sub,
  note,
  source,
  badge,
  chart,
  table,
  labels,
}: {
  title: string;
  sub?: string;
  note?: string;
  source: string;
  badge?: string;
  chart: ReactNode;
  table: ReactNode;
  labels: { showTable: string; showChart: string };
}) {
  const [asTable, setAsTable] = useState(false);
  const bodyId = useId();
  const btnText = asTable ? labels.showChart : labels.showTable;
  const btn = (cls: string) => (
    <button
      type="button"
      aria-expanded={asTable}
      aria-controls={bodyId}
      onClick={() => setAsTable((v) => !v)}
      className={`min-h-11 flex-none cursor-pointer items-center gap-2 border-0 bg-transparent px-2 text-sm font-medium whitespace-nowrap text-muted underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${cls}`}
    >
      {ICON_TABLE}
      {btnText}
    </button>
  );
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="m-0 text-[17px] leading-[1.3] font-semibold text-text xl:text-lg">{title}</h3>
          {sub && <p className="mt-1 mb-0 text-sm leading-[1.4] text-muted">{sub}</p>}
        </div>
        {btn('hidden xl:inline-flex')}
      </div>
      <div id={bodyId} className="flex flex-col gap-4">
        <div hidden={asTable}>{chart}</div>
        <div hidden={!asTable}>{table}</div>
      </div>
      {note && <p className="m-0 text-[13px] leading-[1.45] text-muted">{note}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <span className="inline-flex flex-wrap items-center gap-2.5 text-[13px] text-muted">
          {source}
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-input-border px-2.5 py-px text-xs font-semibold whitespace-nowrap text-text">
              <span aria-hidden className="size-1.5 rounded-full bg-cta" />
              {badge}
            </span>
          )}
        </span>
        {btn('inline-flex xl:hidden')}
      </div>
    </figure>
  );
}

import { useId } from 'react';
import { Svg, FILL, GRID, AXIS, tipProps } from './base';
import { lin, r, band } from '@/lib/stats/scale';
import type { Formatters } from '@/lib/stats/format';
import type { HerkomstRow, OngevalRow } from '@/lib/stats/types';

/**
 * Gestapeld vlak: herkomst per jaar. 2022 mist Europa/buiten Europa in de bron (null):
 * dat stuk is gearceerd en benoemd, Nederland loopt door. Nooit nul tekenen.
 */
export function StackedArea({
  width: w,
  height: h,
  rows,
  mobile,
  f,
  names,
  gapLabel,
  label,
  tip,
}: {
  width: number;
  height: number;
  rows: HerkomstRow[];
  mobile: boolean;
  f: Formatters;
  names: { nl: string; eu: string; non: string };
  gapLabel: string;
  label: string;
  tip: (row: HerkomstRow) => string;
}) {
  const uid = useId();
  const yrs = rows.map((d) => d.jaar);
  const l = 48;
  const rgt = mobile ? 20 : 96;
  const t = 16;
  const b = 28;
  const X = lin(yrs[0], yrs[yrs.length - 1], l, w - rgt);
  const Y = lin(0, 1500, h - b, t);
  const eu = (d: HerkomstRow) => d.europa ?? 0;
  const non = (d: HerkomstRow) => d.buiten_europa ?? 0;
  const tot = rows.map((d) => d.nederland + eu(d) + non(d));
  const gapIdx = rows.findIndex((d) => d.europa === null || d.buiten_europa === null);
  const last = rows[rows.length - 1];
  const first = rows[0];

  const seg = (i0: number, i1: number) => {
    const idx = Array.from({ length: i1 - i0 + 1 }, (_, k) => i0 + k);
    const base = idx.map((i) => [X(rows[i].jaar), Y(rows[i].nederland)] as const);
    const topEu = idx.map((i) => [X(rows[i].jaar), Y(rows[i].nederland + eu(rows[i]))] as const);
    const topAll = idx.map((i) => [X(rows[i].jaar), Y(tot[i])] as const);
    return (
      <>
        <path d={band(topEu, base)} className={FILL.s} />
        <path d={band(topAll, topEu)} className={FILL.m3} />
      </>
    );
  };

  const hatchId = `hatch${uid.replace(/:/g, '')}`;
  const nlPath = `M${r(X(yrs[0]))},${r(Y(0))} ${rows.map((d) => `L${r(X(d.jaar))},${r(Y(d.nederland))}`).join(' ')} L${r(X(yrs[yrs.length - 1]))},${r(Y(0))} Z`;
  const slot = (w - l - rgt) / (yrs.length - 1);

  const share = (v: number, total: number) => `${Math.round((100 * v) / total)}%`;

  return (
    <Svg w={w} h={h} label={label}>
      <defs>
        <pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse">
          <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" strokeWidth={1} style={{ stroke: 'var(--color-input-border)' }} />
        </pattern>
      </defs>
      {[0, 500, 1000, 1500].map((yv) => (
        <g key={yv}>
          <line x1={l} x2={w - rgt} y1={Y(yv)} y2={Y(yv)} className={yv === 0 ? AXIS : GRID} />
          <text x={l - 8} y={Y(yv) + 4} textAnchor="end" className="stats-t">
            {f.num(yv)}
          </text>
        </g>
      ))}
      {yrs
        .filter((y) => [2013, 2016, 2019, 2022, 2025].includes(y))
        .map((y) => (
          <text key={y} x={X(y)} y={h - 8} textAnchor="middle" className="stats-t">
            {y}
          </text>
        ))}

      <path d={nlPath} className={`${FILL.p} stats-fade`} />
      {gapIdx > 0 ? (
        <>
          {seg(0, gapIdx - 1)}
          {seg(gapIdx + 1, rows.length - 1)}
          <path
            d={`M${r(X(rows[gapIdx - 1].jaar))},${r(Y(rows[gapIdx - 1].nederland))} L${r(X(rows[gapIdx].jaar))},${r(Y(rows[gapIdx].nederland))} L${r(X(rows[gapIdx + 1].jaar))},${r(Y(rows[gapIdx + 1].nederland))} L${r(X(rows[gapIdx + 1].jaar))},${r(Y(tot[gapIdx + 1]))} L${r(X(rows[gapIdx - 1].jaar))},${r(Y(tot[gapIdx - 1]))} Z`}
            fill={`url(#${hatchId})`}
            strokeWidth={1}
            strokeDasharray="3 3"
            style={{ stroke: 'var(--color-input-border)' }}
          />
          <text x={X(rows[gapIdx].jaar)} y={Y(tot[gapIdx - 1]) - 8} textAnchor="middle" className="stats-t">
            {gapLabel}
          </text>
          <line
            x1={X(rows[gapIdx].jaar)}
            x2={X(rows[gapIdx].jaar)}
            y1={Y(tot[gapIdx - 1]) - 4}
            y2={Y(rows[gapIdx].nederland) - 4}
            className={GRID}
          />
        </>
      ) : (
        seg(0, rows.length - 1)
      )}

      {!mobile &&
        (() => {
          const xe = w - rgt + 10;
          const lt = tot[tot.length - 1];
          const lines: [number, string, string][] = [
            [Y(last.nederland / 2), names.nl, `${f.num(last.nederland)} (${share(last.nederland, lt)})`],
            [Y(last.nederland + eu(last) / 2), names.eu, `${f.num(eu(last))} (${share(eu(last), lt)})`],
            [Y(last.nederland + eu(last) + non(last) / 2), names.non, `${f.num(non(last))} (${share(non(last), lt)})`],
          ];
          return lines.map(([yy, a, b2]) => (
            <g key={a}>
              <text x={xe} y={yy - 2} className="stats-tt">
                {a}
              </text>
              <text x={xe} y={yy + 13} className="stats-t">
                {b2}
              </text>
            </g>
          ));
        })()}
      <text x={X(first.jaar) + 6} y={Y(first.nederland / 2) + 5} className="stats-vb stats-on-card">
        {share(first.nederland, tot[0])}
      </text>
      <text x={X(last.jaar) - 6} y={Y(last.nederland / 2) + 5} textAnchor="end" className="stats-vb stats-on-card">
        {share(last.nederland, tot[tot.length - 1])}
      </text>

      {rows.map((d, i) => (
        <rect
          key={d.jaar}
          x={X(d.jaar) - slot / 2}
          y={t}
          width={slot}
          height={h - b - t}
          fill="transparent"
          className="stats-mark"
          {...tipProps(tip(d), i === 0)}
        />
      ))}
    </Svg>
  );
}

/** Verkeersongevallen per jaar, gestapeld per afloop; het laatste jaar krijgt een sterkere kleur. */
export function StackedBar({
  width: w,
  height: h,
  rows,
  label,
  annotation,
  tip,
}: {
  width: number;
  height: number;
  rows: OngevalRow[];
  label: string;
  annotation: [string, string];
  tip: (row: OngevalRow) => string;
}) {
  const n = rows.length;
  const l = 34;
  const rgt = 10;
  const t = 30;
  const b = 26;
  const slot = (w - l - rgt) / n;
  const bw = slot * 0.66;
  const Y = lin(0, 16, h - b, t);
  const lastRow = rows[n - 1];
  const xLast = l + (n - 1) * slot + slot / 2;
  return (
    <Svg w={w} h={h} label={label}>
      {[0, 4, 8, 12, 16].map((yv) => (
        <g key={yv}>
          <line x1={l} x2={w - rgt} y1={Y(yv)} y2={Y(yv)} className={yv === 0 ? AXIS : GRID} />
          <text x={l - 8} y={Y(yv) + 4} textAnchor="end" className="stats-t">
            {yv}
          </text>
        </g>
      ))}
      {rows.map((d, k) => {
        const xx = l + k * slot + (slot - bw) / 2;
        const isLast = k === n - 1;
        const mat = d.materiele_schade;
        const let_ = d.letselschade;
        return (
          <g key={d.jaar}>
            <rect
              x={xx}
              y={Y(mat)}
              width={bw}
              height={Math.max(Y(0) - Y(mat), 0)}
              rx={1}
              className={`${isLast ? FILL.p6 : FILL.p3} stats-mark`}
              {...tipProps(tip(d), k === 0)}
            />
            <rect
              x={xx}
              y={Y(mat + let_)}
              width={bw}
              height={Math.max(Y(mat) - Y(mat + let_), 0)}
              rx={1}
              className={isLast ? FILL.c : FILL.c4}
            />
            {[2003, 2010, 2015, 2020, 2025].includes(d.jaar) && (
              <text x={xx + bw / 2} y={h - 8} textAnchor="middle" className="stats-t">
                {d.jaar}
              </text>
            )}
          </g>
        );
      })}
      <text x={xLast} y={Y(lastRow.totaal) - 18} textAnchor="end" className="stats-v">
        {annotation[0]}
      </text>
      <text x={xLast} y={Y(lastRow.totaal) - 5} textAnchor="end" className="stats-t">
        {annotation[1]}
      </text>
    </Svg>
  );
}


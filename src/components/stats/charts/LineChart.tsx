import { Svg, FILL, STROKE, GRID, AXIS, tipProps } from './base';
import { lin, r, polyline, type Tone } from '@/lib/stats/scale';

export type LineSeries = { vals: (number | null)[]; tone: Tone; dash?: string; name?: string };
export type LineMark = {
  si: number;
  i: number;
  text: string;
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
  muted?: boolean;
};

/**
 * Lijn- en vlakgrafiek. `tip(si, i)` levert de tooltiptekst voor een punt
 * (regel 1: x, regel 2: waarde); zonder `tip` zijn er geen aanwijsbare punten.
 */
export function LineChart({
  width: w,
  height: h,
  xs,
  series,
  ymin,
  ymax,
  yticks,
  yfmt,
  xticks,
  marks = [],
  area,
  left: l = 48,
  right: rgt = 20,
  top: t = 14,
  bottom: b = 28,
  label,
  tip,
}: {
  width: number;
  height: number;
  xs: number[];
  series: LineSeries[];
  ymin: number;
  ymax: number;
  yticks: number[];
  yfmt: (v: number) => string;
  xticks: [number, string][];
  marks?: LineMark[];
  area?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  label: string;
  tip?: (si: number, i: number) => string;
}) {
  const X = lin(xs[0], xs[xs.length - 1], l, w - rgt);
  const Y = lin(ymin, ymax, h - b, t);

  const areaSeries = area !== undefined ? series[area] : undefined;
  const areaPts = areaSeries
    ? xs.flatMap((x, i) => (areaSeries.vals[i] == null ? [] : [[X(x), Y(areaSeries.vals[i] as number)] as const]))
    : [];

  return (
    <Svg w={w} h={h} label={label}>
      {yticks.map((yv) => (
        <g key={yv}>
          <line x1={l} x2={w - rgt} y1={Y(yv)} y2={Y(yv)} className={yv === ymin ? AXIS : GRID} />
          <text x={l - 8} y={Y(yv) + 4} textAnchor="end" className="stats-t">
            {yfmt(yv)}
          </text>
        </g>
      ))}
      {xticks.map(([xv, lab]) => (
        <text key={xv} x={X(xv)} y={h - 8} textAnchor="middle" className="stats-t">
          {lab}
        </text>
      ))}

      {areaSeries && areaPts.length > 0 && (
        <path
          d={`M${r(areaPts[0][0])},${r(Y(ymin))} ${areaPts.map(([x, y]) => `L${r(x)},${r(y)}`).join(' ')} L${r(areaPts[areaPts.length - 1][0])},${r(Y(ymin))} Z`}
          className={`${areaSeries.tone === 'p' ? FILL.p3 : FILL[areaSeries.tone]} stats-fade`}
          opacity={0.35}
        />
      )}

      {series.map((s, si) => {
        // Onderbrekingen bij null: elk stuk krijgt een eigen pad.
        const segs: (readonly [number, number])[][] = [];
        let seg: (readonly [number, number])[] = [];
        xs.forEach((x, i) => {
          const v = s.vals[i];
          if (v == null) {
            if (seg.length) segs.push(seg);
            seg = [];
          } else seg.push([X(x), Y(v)] as const);
        });
        if (seg.length) segs.push(seg);
        return segs.map((sg, k) => (
          <path
            key={`${si}-${k}`}
            d={polyline(sg)}
            pathLength={s.dash ? undefined : 1}
            strokeDasharray={s.dash}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`fill-none stroke-[2.5] ${STROKE[s.tone]} ${s.dash ? '' : 'stats-draw'}`}
          />
        ));
      })}

      {marks.map((m, k) => {
        const s = series[m.si];
        const v = s.vals[m.i] as number;
        const x = X(xs[m.i]);
        return (
          <g key={k}>
            <circle cx={x} cy={Y(v)} r={4.5} strokeWidth={2} className={`fill-card ${STROKE[s.tone]}`} />
            <text
              x={x + (m.dx ?? 0)}
              y={Y(v) + (m.dy ?? -12)}
              textAnchor={m.anchor ?? 'middle'}
              className={m.muted ? 'stats-t' : 'stats-v'}
            >
              {m.text}
            </text>
          </g>
        );
      })}

      {tip &&
        series.flatMap((s, si) =>
          xs.map((x, i) => {
            const v = s.vals[i];
            if (v == null) return null;
            return (
              <circle
                key={`${si}-${i}`}
                cx={X(x)}
                cy={Y(v)}
                r={9}
                fill="transparent"
                className="stats-mark"
                {...tipProps(tip(si, i), si === 0 && i === 0)}
              />
            );
          }),
        )}
    </Svg>
  );
}

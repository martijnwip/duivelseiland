import { Svg, FILL, AXIS, tipProps } from './base';
import { lin, type Tone } from '@/lib/stats/scale';

export type BarItem = { label: string; v: number; tone?: Tone; strong?: boolean; tip?: string };

/** Verticale staven; waarde boven de staaf, label eronder (lange labels over twee regels). */
export function BarVertical({
  width: w,
  height: h,
  items,
  fmt,
  gap = 0.36,
  left: l = 8,
  right: rgt = 8,
  top: t = 24,
  bottom: b = 34,
  label,
}: {
  width: number;
  height: number;
  items: BarItem[];
  fmt: (v: number) => string;
  gap?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  label: string;
}) {
  const n = items.length;
  const mx = Math.max(...items.map((i) => i.v)) || 1;
  const slot = (w - l - rgt) / n;
  const bw = slot * (1 - gap);
  const Y = lin(0, mx, h - b, t);
  return (
    <Svg w={w} h={h} label={label}>
      <line x1={l} x2={w - rgt} y1={h - b} y2={h - b} className={AXIS} />
      {items.map((it, k) => {
        const x = l + k * slot + (slot - bw) / 2;
        const y = Y(it.v);
        const parts = it.label.includes(' ') && it.label.length > 9 ? [it.label.split(' ')[0], it.label.split(' ').slice(1).join(' ')] : [it.label];
        return (
          <g key={it.label}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={Math.max(h - b - y, 0)}
              rx={2}
              className={`${FILL[it.tone ?? 'p']} stats-mark`}
              {...tipProps(it.tip, k === 0)}
            />
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" className="stats-v">
              {fmt(it.v)}
            </text>
            {parts.map((part, j) => (
              <text key={j} x={x + bw / 2} y={h - b + 16 + j * 13} textAnchor="middle" className="stats-t">
                {part}
              </text>
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

/**
 * Horizontale staven. Desktop: label links, staaf rechts. `mobile`: label boven de balk
 * (lange namen passen), balk over de volle breedte met een lichte achtergrondbalk.
 */
export function BarHorizontal({
  width: w,
  rows,
  fmt,
  labelWidth: lw = 190,
  rowHeight: rh = 28,
  mobile = false,
  max,
  barHeight: bh = 14,
  valueWidth: valw = 64,
  label,
}: {
  width: number;
  rows: BarItem[];
  fmt: (v: number) => string;
  labelWidth?: number;
  rowHeight?: number;
  mobile?: boolean;
  max?: number;
  barHeight?: number;
  valueWidth?: number;
  label: string;
}) {
  const mx = max || Math.max(...rows.map((x) => x.v)) || 1;
  let y = 4;
  const out = rows.map((row, k) => {
    const tone = row.tone ?? 'p';
    const bold = row.strong ? 'font-semibold' : '';
    let el;
    if (mobile) {
      const bw = ((w - valw) * row.v) / mx;
      el = (
        <g key={row.label}>
          <text x={0} y={y + 12} className={`stats-tt ${bold}`}>
            {row.label}
          </text>
          <rect x={0} y={y + 18} width={w - valw} height={bh} rx={2} className="fill-muted-soft" opacity={0.35} />
          <rect
            x={0}
            y={y + 18}
            width={Math.max(bw, row.v ? 2 : 0)}
            height={bh}
            rx={2}
            className={`${FILL[tone]} stats-mark`}
            {...tipProps(row.tip, k === 0)}
          />
          <text x={w} y={y + 18 + bh - 2} textAnchor="end" className="stats-v">
            {fmt(row.v)}
          </text>
        </g>
      );
      y += 18 + bh + 12;
    } else {
      const bw = ((w - lw - valw) * row.v) / mx;
      el = (
        <g key={row.label}>
          <text x={lw - 12} y={y + rh / 2 + 4} textAnchor="end" className={`stats-tt ${bold}`}>
            {row.label}
          </text>
          <rect
            x={lw}
            y={y + (rh - bh) / 2}
            width={Math.max(bw, row.v ? 2 : 0)}
            height={bh}
            rx={2}
            className={`${FILL[tone]} stats-mark`}
            {...tipProps(row.tip, k === 0)}
          />
          <text x={lw + Math.max(bw, 2) + 8} y={y + rh / 2 + 4} className="stats-v">
            {fmt(row.v)}
          </text>
        </g>
      );
      y += rh;
    }
    return el;
  });
  return (
    <Svg w={w} h={y + 4} label={label}>
      {!mobile && <line x1={lw} x2={lw} y1={0} y2={y} className={AXIS} />}
      {out}
    </Svg>
  );
}

export type GroupRow = { label: string; vals: (number | null)[]; tips?: (string | undefined)[] };

/** Gegroepeerde horizontale staven: per rij één balk per reeks (buurt, wijk, Amsterdam, Nederland). */
export function GroupedHorizontal({
  width: w,
  rows,
  tones,
  fmt,
  max,
  label,
}: {
  width: number;
  rows: GroupRow[];
  tones: Tone[];
  fmt: (v: number) => string;
  max?: number;
  label: string;
}) {
  const mx = max || Math.max(...rows.flatMap((x) => x.vals.filter((v): v is number => v != null)));
  const bh = 9;
  const gap = 3;
  const vw = 44;
  let y = 0;
  const out = rows.map((row, ri) => {
    const head = (
      <text key={`h${ri}`} x={0} y={y + 12} className="stats-tt">
        {row.label}
      </text>
    );
    y += 18;
    const bars = row.vals.map((v, k) => {
      const yy = y;
      y += bh + gap;
      if (v == null) return null;
      const bw = ((w - vw) * v) / mx;
      return (
        <g key={`${ri}-${k}`}>
          <rect
            x={0}
            y={yy}
            width={Math.max(bw, 2)}
            height={bh}
            rx={2}
            className={`${FILL[tones[k]]} stats-mark`}
            {...tipProps(row.tips?.[k], ri === 0 && k === 0)}
          />
          <text x={Math.max(bw, 2) + 6} y={yy + bh - 0.5} className={k ? 'stats-t' : 'stats-v'}>
            {fmt(v)}
          </text>
        </g>
      );
    });
    y += 12;
    return [head, ...bars];
  });
  return (
    <Svg w={w} h={y} label={label}>
      {out}
    </Svg>
  );
}


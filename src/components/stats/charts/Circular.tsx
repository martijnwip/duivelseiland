import { Svg, FILL, BG, STROKE } from './base';
import { r, type Tone } from '@/lib/stats/scale';

export type DonutPart = { label: string; v: number; tone: Tone; shareText?: string };

/** Donut met totaal in het midden en een legenda met aandelen. Alleen bij 2 of 3 delen. */
export function Donut({
  parts,
  centerTop,
  centerBottom,
  size = 148,
  label,
}: {
  parts: DonutPart[];
  centerTop: string;
  centerBottom: string;
  size?: number;
  label: string;
}) {
  const total = parts.reduce((a, p) => a + p.v, 0);
  const rr = size / 2 - 14;
  const circ = 2 * Math.PI * rr;
  let off = 0;
  return (
    <div className="flex flex-wrap items-center gap-6 xl:flex-nowrap">
      <div className="flex-none">
        <Svg w={size} h={size} label={label}>
          <circle cx={size / 2} cy={size / 2} r={rr} fill="none" strokeWidth={22} className="stroke-border" />
          {parts.map((p) => {
            const ln = (circ * p.v) / total;
            const el = (
              <circle
                key={p.label}
                cx={size / 2}
                cy={size / 2}
                r={rr}
                fill="none"
                strokeWidth={22}
                strokeDasharray={`${r(ln - 2)} ${r(circ - ln + 2)}`}
                strokeDashoffset={r(-off)}
                transform={`rotate(-90 ${r(size / 2)} ${r(size / 2)})`}
                className={STROKE[p.tone]}
              />
            );
            off += ln;
            return el;
          })}
          <text x={size / 2} y={size / 2 + 4} textAnchor="middle" className="stats-vb">
            {centerTop}
          </text>
          <text x={size / 2} y={size / 2 + 20} textAnchor="middle" className="stats-t">
            {centerBottom}
          </text>
        </Svg>
      </div>
      <ul className="m-0 min-w-[150px] flex-1 list-none p-0">
        {parts.map((p) => (
          <li key={p.label} className="flex items-baseline gap-2.5 border-t border-border py-1.5">
            <span aria-hidden className={`size-3 flex-none self-center rounded-[2px] ${BG[p.tone]}`} />
            <span className="flex-1 text-sm leading-[1.3] text-text">{p.label}</span>
            <span className="font-heading text-sm font-semibold text-text">
              {p.shareText ?? `${Math.round((100 * p.v) / total)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type MeterItem = { label: string; v: number; tone?: Tone };

/** Compacte percentagemeters (0 tot 100%) in een raster. */
export function Meters({ items, cols = 1, fmt }: { items: MeterItem[]; cols?: 1 | 2; fmt: (v: number) => string }) {
  return (
    <ul className={`m-0 grid list-none gap-x-8 gap-y-4.5 p-0 ${cols === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm leading-[1.3] text-text">{it.label}</span>
            <span className="font-heading text-[15px] font-semibold whitespace-nowrap text-text">{fmt(it.v)}</span>
          </div>
          <div
            role="img"
            aria-label={`${it.label}: ${fmt(it.v)}`}
            className="relative h-2 rounded bg-border"
          >
            <div
              className={`absolute inset-y-0 left-0 rounded ${BG[it.tone ?? 'p']}`}
              style={{ width: `${Math.min(Math.max(it.v, 0), 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** `at`: positie van het label langs de stroom (0 = links, 1 = rechts), standaard het midden. */
export type SankeyFlow = { from: number; to: number; v: number; at?: number };
export type SankeyNode = { name: string; v: number };

/** Sankey met vaste stromen (geboorteland naar herkomst). Op mobiel: zie SankeyStacked. */
export function Sankey({
  width: w,
  height: h = 280,
  left,
  right,
  rightTones,
  flows,
  fmt,
  label,
}: {
  width: number;
  height?: number;
  left: SankeyNode[];
  right: SankeyNode[];
  rightTones: Tone[];
  flows: SankeyFlow[];
  fmt: (v: number) => string;
  label: string;
}) {
  const lw = 170;
  const rw = 170;
  const nw = 14;
  const top = 8;
  const bot = h - 8;
  const total = left.reduce((a, n) => a + n.v, 0);
  const scale = (bot - top - 24) / total;
  const ly: number[] = [];
  let y = top;
  for (const n of left) {
    ly.push(y);
    y += n.v * scale + 24;
  }
  const ry: number[] = [];
  y = top;
  for (const n of right) {
    ry.push(y);
    y += n.v * scale + 12;
  }
  const x0 = lw + nw;
  const x1 = w - rw - nw;
  const lo = [...ly];
  const ro = [...ry];
  const mid = (x0 + x1) / 2;
  return (
    <Svg w={w} h={h} label={label}>
      {flows.map((f, k) => {
        const th = f.v * scale;
        const y0 = lo[f.from];
        const y1 = ro[f.to];
        lo[f.from] += th;
        ro[f.to] += th;
        const d = `M${r(x0)},${r(y0)} C${r(mid)},${r(y0)} ${r(mid)},${r(y1)} ${r(x1)},${r(y1)} L${r(x1)},${r(y1 + th)} C${r(mid)},${r(y1 + th)} ${r(mid)},${r(y0 + th)} ${r(x0)},${r(y0 + th)} Z`;
        // Punt op de kubieke bezier (x0, mid, mid, x1) / (y0, y0, y1, y1) voor het label.
        const u = f.at ?? 0.5;
        const b0 = (1 - u) ** 3;
        const b1 = 3 * (1 - u) ** 2 * u;
        const b2 = 3 * (1 - u) * u ** 2;
        const b3 = u ** 3;
        const lx = x0 * b0 + mid * (b1 + b2) + x1 * b3;
        const ly = y0 * (b0 + b1) + y1 * (b2 + b3);
        return (
          <g key={k}>
            <path d={d} opacity={0.62} className={FILL[rightTones[f.to]]} />
            <text x={lx} y={ly + th / 2 + 4} textAnchor="middle" className="stats-v">
              {fmt(f.v)}
            </text>
          </g>
        );
      })}
      {left.map((n, k) => (
        <g key={n.name}>
          <rect x={lw} y={ly[k]} width={nw} height={n.v * scale} className="fill-muted" />
          <text x={lw - 10} y={ly[k] + (n.v * scale) / 2} textAnchor="end" className="stats-tt">
            {n.name}
          </text>
          <text x={lw - 10} y={ly[k] + (n.v * scale) / 2 + 15} textAnchor="end" className="stats-v">
            {fmt(n.v)}
          </text>
        </g>
      ))}
      {right.map((n, k) => (
        <g key={n.name}>
          <rect x={w - rw - nw} y={ry[k]} width={nw} height={n.v * scale} className="fill-muted" />
          <text x={w - rw + 4} y={ry[k] + (n.v * scale) / 2} className="stats-tt">
            {n.name}
          </text>
          <text x={w - rw + 4} y={ry[k] + (n.v * scale) / 2 + 15} className="stats-v">
            {fmt(n.v)}
          </text>
        </g>
      ))}
    </Svg>
  );
}

export type StackRow = { name: string; total: number; segs: { v: number; tone: Tone }[] };

/** Mobiele vervanger van de sankey: per geboorteland één gestapelde balk. */
export function SankeyStacked({
  width: w,
  rows,
  scaleTo,
  fmt,
  label,
}: {
  width: number;
  rows: StackRow[];
  scaleTo: number;
  fmt: (v: number) => string;
  label: string;
}) {
  let y = 0;
  const out = rows.map((row) => {
    const head = (
      <text key={`${row.name}-h`} x={0} y={y + 12} className="stats-tt">
        {`${row.name} (${fmt(row.total)})`}
      </text>
    );
    y += 20;
    let x = 0;
    const segs = row.segs.map((s, k) => {
      const wd = (w * s.v) / scaleTo;
      const el = (
        <g key={`${row.name}-${k}`}>
          <rect x={x} y={y} width={Math.max(wd - 2, 1)} height={22} rx={2} className={FILL[s.tone]} />
          {wd > 36 && (
            <text x={x + 6} y={y + 15} className="stats-v">
              {fmt(s.v)}
            </text>
          )}
        </g>
      );
      x += wd;
      return el;
    });
    y += 36;
    return [head, ...segs];
  });
  return (
    <Svg w={w} h={y + 6} label={label}>
      {out}
    </Svg>
  );
}

import { Svg, FILL, GRID, AXIS, tipProps } from './base';
import { lin, r } from '@/lib/stats/scale';
import type { Formatters } from '@/lib/stats/format';

/* ---------- afstandsschaal ---------- */

const ICONS: Record<string, string> = {
  huisartsenpraktijk: 'M8 3v10M3 8h10',
  supermarkt: 'M2 6h12l-1.5 7h-9zM5 6l2-3M11 6l-2-3',
  restaurant: 'M4 2v4a1.5 1.5 0 0 0 3 0V2M5.5 7v7M12 14V2c-1.6 1-2.2 3-2.2 5.2H12',
  basisonderwijs: 'M3 13l1-3.2 7.2-7.2 2.2 2.2-7.2 7.2z',
  'voortgezet-onderwijs': 'M2 4c2-1 4-1 6 1 2-2 4-2 6-1v9c-2-1-4-1-6 1-2-2-4-2-6-1zM8 5v9',
  bibliotheek: 'M3 3v10M6.2 3v10M9.4 4.2l3 8.8M2 14h12',
  treinstation: 'M4 2h8v9H4zM4 8h8M6 14l-1 1.5M10 14l1 1.5',
  sportterrein: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM2.3 6.5c3 1.6 8.4 1.6 11.4 0M2.3 9.5c3-1.6 8.4-1.6 11.4 0',
  bioscoop: 'M2 4h12v8H2zM5 4v8M11 4v8M2 8h3M11 8h3',
  museum: 'M2 6l6-3 6 3H2zM4 7.5V12M8 7.5V12M12 7.5V12M2 13.5h12',
};

export type DistanceRow = { key: string; label: string; km: number };

/** Gemiddelde afstand tot voorzieningen: dichtbij links, het treinstation (>2 km) in terracotta. */
export function DistanceScale({
  width: w,
  rows,
  mobile,
  f,
  label,
}: {
  width: number;
  rows: DistanceRow[];
  mobile: boolean;
  f: Formatters;
  label: string;
}) {
  const d = [...rows].sort((a, b) => a.km - b.km);
  const lw = mobile ? 132 : 190;
  const rh = 30;
  const X = lin(0, 2.5, lw, w - 34);
  const hh = d.length * rh + 30;
  const unit = f.km(0).replace(/^[\d.,]+\s*/, '');
  return (
    <Svg w={w} h={hh} label={label}>
      {[0, 0.5, 1, 1.5, 2, 2.5].map((tv) => (
        <g key={tv}>
          <line x1={X(tv)} x2={X(tv)} y1={6} y2={hh - 26} className={tv ? GRID : AXIS} />
          {(!mobile || [0, 1, 2].includes(tv)) && (
            <text x={X(tv)} y={hh - 8} textAnchor="middle" className="stats-t">
              {[0, 1, 2].includes(tv) ? `${f.num(tv, 1)} ${unit}` : f.num(tv, 1)}
            </text>
          )}
        </g>
      ))}
      {d.map((x, k) => {
        const y = 6 + k * rh + rh / 2;
        const far = x.km > 2;
        const lx = X(x.km);
        return (
          <g key={x.key}>
            <g transform={`translate(0,${r(y - 8)})`}>
              <path d={ICONS[x.key] ?? ICONS.museum} fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="stroke-text" />
            </g>
            <text x={24} y={y + 4} className="stats-tt">
              {x.label}
            </text>
            <line x1={lw} x2={lx} y1={y} y2={y} strokeWidth={2} className="stroke-border" />
            <circle cx={lx} cy={y} r={6} className={far ? FILL.c : FILL.p} />
            <text x={lx + 12} y={y + 4} textAnchor={lx + 60 < w ? 'start' : 'end'} className="stats-v">
              {f.km(x.km)}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/* ---------- vergelijking met factor ---------- */

export type CompareRow = { key: string; title: string; dv: number; nl: number };

/** Duivelseiland tegenover Nederland per rij op een eigen schaal, met de factor rechts. */
export function BarCompare({
  width: w,
  rows,
  f,
  names,
  label,
}: {
  width: number;
  rows: CompareRow[];
  f: Formatters;
  names: { dv: string; nl: string };
  label: string;
}) {
  const fw = 74;
  let y = 0;
  const out = rows.map((it) => {
    const factor = it.dv / it.nl;
    const full = w - fw - 8;
    const nw = Math.max((full * it.nl) / it.dv, 3);
    const el = (
      <g key={it.key}>
        <text x={0} y={y + 12} className="stats-tt">
          {it.title}
        </text>
        <rect x={0} y={y + 20} width={full} height={14} rx={2} className={FILL.p} />
        <text x={full - 8} y={y + 31} textAnchor="end" className="stats-v stats-on-card">
          {f.num(it.dv)}
        </text>
        <text x={8} y={y + 31} className="stats-t stats-on-card">
          {names.dv}
        </text>
        <rect x={0} y={y + 40} width={nw} height={14} rx={2} className={FILL.m} />
        <text x={nw + 8} y={y + 51} className="stats-t">
          {`${f.num(it.nl)} ${names.nl}`}
        </text>
        <text x={w} y={y + 36} textAnchor="end" className="fill-primary font-heading text-[26px] font-semibold">
          {f.factor(factor)}
        </text>
      </g>
    );
    y += 20 + 20 + 32;
    return el;
  });
  return (
    <Svg w={w} h={y} label={label}>
      {out}
    </Svg>
  );
}

/* ---------- markeringen: cirkel (buurt), vierkant (Amsterdam), ruit (Nederland) ---------- */

export type Who = 'dv' | 'am' | 'nl';

function Marker({ who, x, y, big }: { who: Who; x: number; y: number; big?: boolean }) {
  if (who === 'dv') return <circle cx={x} cy={y} r={big ? 9 : 8} className={FILL.p} />;
  if (who === 'am') return <rect x={x - 6} y={y - 6} width={12} height={12} className={FILL.s} />;
  return <path d={`M${r(x)},${r(y - 8)} L${r(x + 8)},${r(y)} L${r(x)},${r(y + 8)} L${r(x - 8)},${r(y)} Z`} className={FILL.m} />;
}

export function ShapeLegend({ names }: { names: Record<Who, string> }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-[13px] text-text">
      <li className="inline-flex items-center gap-2">
        <svg width="14" height="14" aria-hidden>
          <circle cx="7" cy="7" r="6" className={FILL.p} />
        </svg>
        {names.dv}
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="14" height="14" aria-hidden>
          <rect x="1" y="1" width="12" height="12" className={FILL.s} />
        </svg>
        {names.am}
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="14" height="14" aria-hidden>
          <path d="M7 0 L14 7 L7 14 L0 7 Z" className={FILL.m} />
        </svg>
        {names.nl}
      </li>
    </ul>
  );
}

export type DumbbellRow = {
  key: string;
  title: string;
  dv: number;
  am: number;
  nl: number;
  derived: boolean;
  fmt: (v: number) => string;
};

/** Drie markeringen per rij op een eigen schaal. Een afgeleide waarde wordt als zodanig gelabeld. */
export function Dumbbell({
  width: w,
  rows,
  mobile,
  names,
  derivedText,
  label,
}: {
  width: number;
  rows: DumbbellRow[];
  mobile: boolean;
  names: Record<Who, string>;
  derivedText: string;
  label: string;
}) {
  const pad = 44;
  let y = 0;
  const out = rows.map((it) => {
    const vals: Record<Who, number> = { dv: it.dv, am: it.am, nl: it.nl };
    const mx = Math.max(...Object.values(vals)) * 1.1;
    const X = lin(0, mx, 0, w - pad);
    const yy = y + 56;
    const order = (Object.entries(vals) as [Who, number][]).sort((a, b) => a[1] - b[1]);
    const a = order[0][1];
    const b = order[2][1];
    const el = (
      <g key={it.key}>
        <text x={0} y={y + 12} className="stats-tt">
          {it.title}
        </text>
        <line x1={0} x2={w - pad} y1={yy} y2={yy} className={GRID} />
        <line x1={X(a)} x2={X(b)} y1={yy} y2={yy} strokeWidth={3} className="stroke-input-border" />
        {order.map(([who, v]) => (
          <Marker key={who} who={who} x={X(v)} y={yy} />
        ))}
        {order.map(([who, v], j) => {
          const x = X(v);
          const up = j % 2 === 0;
          const txt = it.fmt(v) + (it.derived && who === 'dv' ? ` (${derivedText})` : '');
          return (
            <text
              key={who}
              x={Math.min(Math.max(x, 0), w - pad)}
              y={up ? yy - 14 : yy + 26}
              textAnchor={x > 20 && x < w - pad - 20 ? 'middle' : x <= 20 ? 'start' : 'end'}
              className={who === 'dv' ? 'stats-v' : 'stats-t'}
            >
              {mobile ? txt : `${names[who]} ${txt}`}
            </text>
          );
        })}
      </g>
    );
    y += 100;
    return el;
  });
  return (
    <Svg w={w} h={y} label={label}>
      {out}
    </Svg>
  );
}

/** Kaal inkomen op een schaal van 0 tot 70.000 met drie markeringen. */
export function IncomeScale({
  width: w,
  values,
  f,
  names,
  label,
}: {
  width: number;
  values: Record<Who, number>;
  f: Formatters;
  names: Record<Who, string>;
  label: string;
}) {
  const X = lin(0, 70000, 0, w - 8);
  const ay = 64;
  return (
    <Svg w={w} h={96} label={label}>
      <line x1={0} x2={w - 8} y1={ay} y2={ay} className={AXIS} />
      {[0, 20000, 40000, 60000].map((tv) => (
        <g key={tv}>
          <line x1={X(tv)} x2={X(tv)} y1={ay} y2={ay + 6} className={AXIS} />
          <text x={X(tv)} y={ay + 22} textAnchor={tv ? 'middle' : 'start'} className="stats-t">
            {f.eur(tv)}
          </text>
        </g>
      ))}
      {(['nl', 'am', 'dv'] as Who[]).map((who) => {
        const x = X(values[who]);
        const ly = who === 'am' ? 14 : 34;
        const anchor = who === 'dv' ? 'middle' : who === 'nl' ? 'end' : 'start';
        const dx = who === 'dv' ? 0 : who === 'nl' ? -5 : 5;
        return (
          <g key={who}>
            <Marker who={who} x={x} y={ay} big />
            <line x1={x} x2={x} y1={ay} y2={ly + 4} strokeWidth={1} className={AXIS} />
            <text x={x + dx} y={ly} textAnchor={anchor} className={who === 'dv' ? 'stats-v' : 'stats-t'}>
              {`${names[who]} ${f.eur(values[who])}`}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/* ---------- spreiding ---------- */

export type ScatterPoint = { label: string; woz: number; share: number; homes: number; role: 'dv' | 'wijk' | 'other'; tip: string };

/** Woningwaarde tegenover aandeel 65-plussers. Alleen de buurt en de wijk hebben een label; kleine gebieden zijn gestippeld. */
export function Scatter({
  width: w,
  height: h,
  points,
  mobile,
  f,
  names,
  axisLabels,
  label,
}: {
  width: number;
  height: number;
  points: ScatterPoint[];
  mobile: boolean;
  f: Formatters;
  names: { dv: string; wijk: string };
  axisLabels: { x: string; y: string };
  label: string;
}) {
  const l = 44;
  const rgt = 16;
  const t = 14;
  const b = 40;
  const X = lin(300000, 1800000, l, w - rgt);
  const Y = lin(0, 55, h - b, t);
  return (
    <Svg w={w} h={h} label={label}>
      {[0, 10, 20, 30, 40, 50].map((yv) => (
        <g key={yv}>
          <line x1={l} x2={w - rgt} y1={Y(yv)} y2={Y(yv)} className={yv === 0 ? AXIS : GRID} />
          <text x={l - 8} y={Y(yv) + 4} textAnchor="end" className="stats-t">
            {f.pct(yv)}
          </text>
        </g>
      ))}
      {[400000, 800000, 1200000, 1600000].map((xv) => (
        <text key={xv} x={X(xv)} y={h - 22} textAnchor="middle" className="stats-t">
          {f.eurK(xv)}
        </text>
      ))}
      <text x={w - rgt} y={h - 6} textAnchor="end" className="stats-t">
        {axisLabels.x}
      </text>
      <text x={l} y={t - 2} className="stats-t">
        {axisLabels.y}
      </text>
      {points.map((p, i) => {
        const x = X(p.woz);
        const y = Y(p.share);
        const small = p.homes < 10;
        const tp = tipProps(p.tip, i === 0);
        if (p.role === 'dv')
          return (
            <g key={p.label}>
              <circle cx={x} cy={y} r={9} className={`${FILL.p} stats-mark`} {...tp} />
              <text x={x + 14} y={y + 4} className="stats-v">
                {names.dv}
              </text>
            </g>
          );
        if (p.role === 'wijk')
          return (
            <g key={p.label}>
              <rect x={x - 7} y={y - 7} width={14} height={14} className={`${FILL.s} stats-mark`} {...tp} />
              <text x={x - 12} y={y - 12} textAnchor={mobile ? 'middle' : 'end'} className="stats-tt">
                {names.wijk}
              </text>
            </g>
          );
        if (small)
          return (
            <circle key={p.label} cx={x} cy={y} r={5} fill="none" strokeWidth={1.5} strokeDasharray="2 2" className="stroke-input-border stats-mark" {...tp} />
          );
        return <circle key={p.label} cx={x} cy={y} r={5} strokeWidth={1} className={`${FILL.m3} stroke-muted stats-mark`} {...tp} />;
      })}
    </Svg>
  );
}

import type { ReactNode } from 'react';
import { r, type Tone } from '@/lib/stats/scale';

/* Letterlijke klassenamen, zodat Tailwind ze bij het scannen vindt. */
export const FILL: Record<Tone, string> = {
  p: 'fill-primary',
  p6: 'fill-primary-mid',
  p3: 'fill-primary-soft',
  s: 'fill-secondary',
  s5: 'fill-secondary-soft',
  c: 'fill-cta',
  c4: 'fill-cta-soft',
  m: 'fill-muted',
  m3: 'fill-muted-soft',
};

export const STROKE: Record<Tone, string> = {
  p: 'stroke-primary',
  p6: 'stroke-primary-mid',
  p3: 'stroke-primary-soft',
  s: 'stroke-secondary',
  s5: 'stroke-secondary-soft',
  c: 'stroke-cta',
  c4: 'stroke-cta-soft',
  m: 'stroke-muted',
  m3: 'stroke-muted-soft',
};

export const BG: Record<Tone, string> = {
  p: 'bg-primary',
  p6: 'bg-primary-mid',
  p3: 'bg-primary-soft',
  s: 'bg-secondary',
  s5: 'bg-secondary-soft',
  c: 'bg-cta',
  c4: 'bg-cta-soft',
  m: 'bg-muted',
  m3: 'bg-muted-soft',
};

export const GRID = 'stroke-border';
export const AXIS = 'stroke-input-border';

/**
 * Elk SVG heeft role="img", een aria-label met de kernboodschap en een <title>.
 * De breedte schaalt mee met de kaart, maximaal de ontwerpbreedte.
 */
export function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${r(w)} ${r(h)}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full overflow-visible"
      style={{ maxWidth: w }}
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}

/** Attributen voor een aanwijsbaar/focusbaar element met tooltip (zie ChartFrame). Voeg zelf de klasse `stats-mark` toe voor de focusring. */
export function tipProps(tip: string | undefined, first: boolean) {
  if (!tip) return {};
  return {
    'data-tip': tip,
    tabIndex: first ? 0 : -1,
    'aria-label': tip.replace('\n', ': '),
  };
}

export function Legend({ items }: { items: { label: string; tone: Tone }[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4.5 gap-y-1.5 p-0">
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-2 text-[13px] text-text">
          <span aria-hidden className={`size-3 rounded-[2px] ${BG[it.tone]}`} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Toont twee varianten van dezelfde grafiek: mobiel (smal) en desktop (breed). */
export function Dual({ desktop, mobile }: { desktop: ReactNode; mobile: ReactNode }) {
  return (
    <>
      <div className="hidden xl:block">{desktop}</div>
      <div className="max-w-[480px] xl:hidden">{mobile}</div>
    </>
  );
}

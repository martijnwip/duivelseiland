import { FILL, STROKE, tipProps } from '@/components/stats/charts/base';
import type { Tone } from '@/lib/stats/scale';
import type { Hotspot } from '@/lib/afval/aggregate';
import type { Container, Melding } from '@/lib/afval/types';
import { at } from './BaseMap';

export const FRACTIE_TONE: Record<string, Tone> = { Rest: 'm', Papier: 's', Glas: 'p', Textiel: 'c' };
export const fractieTone = (f: string): Tone => FRACTIE_TONE[f] ?? 'p6';

/**
 * Containers per plek: staan er meerdere op (bijna) hetzelfde punt, dan naast elkaar,
 * zodat elke fractie zichtbaar blijft.
 */
export function ContainerLayer({ containers, tip }: { containers: Container[]; tip: (c: Container) => string }) {
  const spots: { x: number; y: number; items: Container[] }[] = [];
  for (const c of [...containers].sort((a, b) => a.fractie.localeCompare(b.fractie))) {
    const [x, y] = at(c.rd);
    const s = spots.find((p) => Math.hypot(p.x - x, p.y - y) < 6);
    if (s) s.items.push(c);
    else spots.push({ x, y, items: [c] });
  }
  const size = 9;
  let k = 0;
  return (
    <g>
      {spots.map((s) =>
        s.items.map((c, i) => {
          const x = s.x + (i - (s.items.length - 1) / 2) * (size + 2) - size / 2;
          return (
            <rect
              key={c.id}
              x={x}
              y={s.y - size / 2}
              width={size}
              height={size}
              rx={2}
              strokeWidth={1.5}
              className={`${FILL[fractieTone(c.fractie)]} stroke-card stats-mark`}
              {...tipProps(tip(c), k++ === 0)}
            />
          );
        }),
      )}
    </g>
  );
}

/** Cirkels waarvan het oppervlak meeschaalt met het aantal waarnemingen. */
export function HotspotLayer({ hotspots, tip, maxR = 26 }: { hotspots: Hotspot[]; tip: (h: Hotspot) => string; maxR?: number }) {
  const max = Math.max(...hotspots.map((h) => h.n), 1);
  // Groot eerst, zodat kleine cirkels bovenop liggen en aanwijsbaar blijven.
  return (
    <g>
      {hotspots.map((h, i) => {
        const [x, y] = at(h.rd);
        return (
          <circle
            key={h.id}
            cx={x}
            cy={y}
            r={Math.max(Math.sqrt(h.n / max) * maxR, 2.5)}
            strokeWidth={1.25}
            fillOpacity={0.35}
            className={`${FILL.c} ${STROKE.c} stats-mark`}
            {...tipProps(tip(h), i === 0)}
          />
        );
      })}
    </g>
  );
}

export function MeldingLayer({ meldingen, tone, tip }: { meldingen: Melding[]; tone: (m: Melding) => Tone; tip: (m: Melding) => string }) {
  return (
    <g>
      {meldingen.map((m, i) => {
        const [x, y] = at(m.rd);
        return (
          <circle
            key={`${m.datum}-${i}`}
            cx={x}
            cy={y}
            r={4}
            strokeWidth={1.25}
            className={`${FILL[tone(m)]} stroke-card stats-mark`}
            {...tipProps(tip(m), i === 0)}
          />
        );
      })}
    </g>
  );
}

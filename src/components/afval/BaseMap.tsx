import type { ReactNode } from 'react';
import basemap from '@/lib/afval/basemap.json';
import { toView, type Pt } from '@/lib/afval/geo';

/** Uitsnede rond de buurtgrens (in meters binnen de basiskaart); de basiskaart zelf is ruimer. */
export const CROP = { x: 95, y: 100, w: 400, h: 310 } as const;

/** RD-punt naar kaartcoördinaten (meters vanaf linksboven van de basiskaart). */
export const at = (rd: Pt) => toView(rd);

const inCrop = (x: number, y: number, pad = 0) => x >= CROP.x - pad && x <= CROP.x + CROP.w + pad && y >= CROP.y - pad && y <= CROP.y + CROP.h + pad;

/** Draaihoek zo dat tekst nooit op zijn kop staat. */
const upright = (a: number) => (a > 90 ? a - 180 : a < -90 ? a + 180 : a);

/**
 * Stille ondergrond in huisstijl: bouwblokken, water, straatnamen en de buurtgrens.
 * De omgeving is gedempt, zodat de buurt zelf eruit springt. `children` tekent de laag erbovenop.
 */
export function BaseMap({ label, children, labels = true }: { label: string; children?: ReactNode; labels?: boolean }) {
  const outside = `M0,0H${basemap.width}V${basemap.height}H0Z${basemap.buurt}`;
  return (
    <svg viewBox={`${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}`} role="img" aria-label={label} className="block h-auto w-full rounded-md">
      <title>{label}</title>
      <rect x={0} y={0} width={basemap.width} height={basemap.height} className="fill-card" />
      <path d={basemap.water} className="fill-water" />
      <path d={basemap.blokken} className="fill-border" />
      <path d={outside} fillRule="evenodd" className="fill-card" opacity={0.55} />
      <path d={basemap.buurt} fill="none" strokeWidth={1.5} strokeDasharray="5 3" className="stroke-text" />
      {labels &&
        basemap.labels
          .filter((l) => {
            // Bruggen overlappen de kadenamen; en de hele naam moet binnen de uitsnede passen.
            if (/brug$/i.test(l.naam)) return false;
            const half = l.naam.length * 2.9;
            const a = (upright(l.angle) * Math.PI) / 180;
            const [dx, dy] = [Math.cos(a) * half, Math.sin(a) * half];
            return inCrop(l.x - dx, l.y - dy, -4) && inCrop(l.x + dx, l.y + dy, -4);
          })
          .map((l) => (
            <text
              key={l.naam}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${upright(l.angle)} ${l.x} ${l.y})`}
              className="afval-label"
              aria-hidden
            >
              {l.naam}
            </text>
          ))}
      {children}
    </svg>
  );
}

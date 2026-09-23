import type { ReactNode } from 'react';
import basemap from '@/lib/afval/basemap.json';
import { toView, type Pt } from '@/lib/afval/geo';

/** Uitsnede rond de buurtgrens (in meters binnen de basiskaart); de basiskaart zelf is ruimer. */
export const CROP = { x: 95, y: 100, w: 400, h: 310 } as const;

/** RD-punt naar kaartcoördinaten (meters vanaf linksboven van de basiskaart). */
export const at = (rd: Pt) => toView(rd);

type Crop = { x: number; y: number; w: number; h: number };

/** Bouwblokken, water en straatnamen; standaard de basiskaart, een andere kaart kan een ruimere ondergrond meegeven. */
type Ondergrond = { blokken: string; water: string; labels: { naam: string; x: number; y: number; angle: number }[] };

const inCrop = (crop: Crop, x: number, y: number, pad = 0) =>
  x >= crop.x - pad && x <= crop.x + crop.w + pad && y >= crop.y - pad && y <= crop.y + crop.h + pad;

/** Draaihoek zo dat tekst nooit op zijn kop staat. */
const upright = (a: number) => (a > 90 ? a - 180 : a < -90 ? a + 180 : a);

/**
 * Stille ondergrond in huisstijl: bouwblokken, water, straatnamen en de buurtgrens.
 * De omgeving is gedempt, zodat de buurt zelf eruit springt. `children` tekent de laag erbovenop;
 * `crop` kiest een andere uitsnede (in meters binnen de basiskaart), `ondergrond` een ruimere ondergrond.
 */
export function BaseMap({
  label,
  children,
  labels = true,
  crop = CROP,
  ondergrond = basemap,
}: {
  label: string;
  children?: ReactNode;
  labels?: boolean;
  crop?: Crop;
  ondergrond?: Ondergrond;
}) {
  const outside = `M${crop.x},${crop.y}h${crop.w}v${crop.h}h${-crop.w}Z${basemap.buurt}`;
  return (
    <svg viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`} role="img" aria-label={label} className="block h-auto w-full rounded-md">
      <title>{label}</title>
      <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} className="fill-card" />
      <path d={ondergrond.water} className="fill-water" />
      <path d={ondergrond.blokken} className="fill-border" />
      <path d={outside} fillRule="evenodd" className="fill-card" opacity={0.55} />
      <path d={basemap.buurt} fill="none" strokeWidth={1.5} strokeDasharray="5 3" className="stroke-text" />
      {labels &&
        ondergrond.labels
          .filter((l) => {
            // Bruggen overlappen de kadenamen; en de hele naam moet binnen de uitsnede passen.
            if (/brug$/i.test(l.naam)) return false;
            const half = l.naam.length * 2.9;
            const a = (upright(l.angle) * Math.PI) / 180;
            const [dx, dy] = [Math.cos(a) * half, Math.sin(a) * half];
            return inCrop(crop, l.x - dx, l.y - dy, -4) && inCrop(crop, l.x + dx, l.y + dy, -4);
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

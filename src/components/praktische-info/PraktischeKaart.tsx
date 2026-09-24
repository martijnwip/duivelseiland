import { BaseMap } from '@/components/afval/BaseMap';
import kaart from '@/lib/praktische-info/kaart.json';

/** Straatnamen die onder een marker vallen schuiven een stukje op (in meters langs de x-as). */
const VERSCHUIF: Record<string, number> = { Teniersstraat: 28 };

const ondergrond = { ...kaart, labels: kaart.labels.map((l) => ({ ...l, x: l.x + (VERSCHUIF[l.naam] ?? 0) })) };

export const BRIEVENBUSSEN = ['terborg', 'janSteen', 'vermeer'] as const;

/** Genummerde stip voor een brievenbus; het nummer staat ook op het kaartje in de lijst. */
function Brievenbus({ at: [x, y], nr }: { at: number[]; nr: number }) {
  return (
    <g aria-hidden>
      <circle cx={x} cy={y} r={11} strokeWidth={2} className="fill-primary stroke-card" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-card" style={{ font: '700 13px var(--font-body)' }}>
        {nr}
      </text>
    </g>
  );
}

/** Kaart met de brievenbussen en de buurt-AED rond Duivelseiland. */
export function PraktischeKaart({ label }: { label: string }) {
  const [ax, ay] = kaart.plekken.aed;

  return (
    <BaseMap label={label} crop={kaart.crop} ondergrond={ondergrond}>
      <text
        x={262}
        y={273}
        textAnchor="middle"
        dominantBaseline="middle"
        transform="rotate(16 262 273)"
        className="afval-label"
        style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, fill: 'var(--color-text)' }}
        aria-hidden
      >
        DUIVELSEILAND
      </text>

      {BRIEVENBUSSEN.map((key, i) => (
        <Brievenbus key={key} at={kaart.plekken[key]} nr={i + 1} />
      ))}

      {/* AED: een druppel met de punt op de gevel, zoals de marker op de Buurtborrel-kaart. */}
      <g aria-hidden>
        <ellipse cx={ax} cy={ay} rx={6} ry={2.2} className="fill-text" opacity={0.25} />
        <path d={`M${ax},${ay}c-3-6-10.5-12-10.5-19.5a10.5,10.5 0 0 1 21,0c0,7.5-7.5,13.5-10.5,19.5z`} strokeWidth={1.5} className="fill-accent stroke-card" />
        <circle cx={ax} cy={ay - 19.5} r={3.9} className="fill-card" />
        <text x={ax} y={ay - 36} textAnchor="middle" className="afval-label" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--color-text)' }}>
          AED
        </text>
      </g>
    </BaseMap>
  );
}

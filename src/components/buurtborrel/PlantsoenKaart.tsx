import { BaseMap } from '@/components/afval/BaseMap';
import basemap from '@/lib/afval/basemap.json';
import kaart from '@/lib/buurtborrel/kaart.json';

/** Uitsnede rond het Roelof Hartplein (meters binnen de basiskaart). */
const CROP = { x: 112, y: 225, w: 220, h: 155 } as const;

// De uitsnede is kleiner dan op de afvalpagina, dus de labels kleiner zetten (anders worden ze te groot).
const labelStyle = { fontSize: 7 };

const STRATEN = ['Cornelis Anthoniszstraat', 'Balthasar Floriszstraat'];

/** Label met een stip ervoor, voor een plek (café, OBA). */
function Plek({ at: [x, y], naam }: { at: number[]; naam: string }) {
  return (
    <g aria-hidden>
      <circle cx={x} cy={y} r={2.2} className="fill-text" />
      <text x={x + 4} y={y} dominantBaseline="middle" className="afval-label" style={{ ...labelStyle, fill: 'var(--color-text)' }}>
        {naam}
      </text>
    </g>
  );
}

/** Kaartje van het plantsoen aan het Roelof Hartplein, met een marker op de plek van de borrel. */
export function PlantsoenKaart({ label }: { label: string }) {
  const [mx, my] = kaart.marker;
  const straten = basemap.labels.filter((l) => STRATEN.includes(l.naam));

  return (
    <BaseMap label={label} labels={false} crop={CROP}>
      <path d={kaart.groen} className="fill-primary-soft" />
      <path d={kaart.plantsoen} strokeWidth={0.8} className="fill-primary-mid stroke-primary" />

      {straten.map((l) => (
        <text
          key={l.naam}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${l.angle} ${l.x} ${l.y})`}
          className="afval-label"
          style={labelStyle}
          aria-hidden
        >
          {l.naam}
        </text>
      ))}
      <text x={172} y={327} textAnchor="middle" className="afval-label" style={{ ...labelStyle, fontWeight: 600 }} aria-hidden>
        Roelof Hartplein
      </text>
      <text
        x={262}
        y={273}
        textAnchor="middle"
        dominantBaseline="middle"
        transform="rotate(16 262 273)"
        className="afval-label"
        style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, fill: 'var(--color-text)' }}
        aria-hidden
      >
        DUIVELSEILAND
      </text>
      <Plek at={kaart.plekken.wildschut} naam="Café Wildschut" />
      <Plek at={kaart.plekken.oba} naam="OBA" />

      {/* Marker: een druppel die met de punt op het plantsoen staat. */}
      <g aria-hidden>
        <ellipse cx={mx} cy={my} rx={4} ry={1.5} className="fill-text" opacity={0.25} />
        <path
          d={`M${mx},${my}c-2-4-7-8-7-13a7,7 0 0 1 14,0c0,5-5,9-7,13z`}
          strokeWidth={1}
          className="fill-cta stroke-card"
        />
        <circle cx={mx} cy={my - 13} r={2.6} className="fill-card" />
      </g>
    </BaseMap>
  );
}

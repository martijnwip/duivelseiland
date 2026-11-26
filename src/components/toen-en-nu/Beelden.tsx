import Image from 'next/image';
import { BaseMapLagen, CROP } from '@/components/afval/BaseMap';
import straten from '@/lib/toen-en-nu/straten.json';
import type { Beeld, Foto, Straat, Taal } from '@/lib/toen-en-nu/hoofdstukken';

/** Bijschrift onder een foto, met de bron (en het beeldnummer van het Stadsarchief). */
export type BronLabels = Record<Foto['bron'], string> & { beeldnummer: string; foto: string };

const SIZES = '(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw';

/** Uitsnede rond de buurt; de straten zelf lopen verder (Hobbemakade, Ruysdaelstraat). */
const BUURT_CLIP = { x: 112, y: 112, w: 368, h: 286 };

function Jaar({ jaar, className = '' }: { jaar: string; className?: string }) {
  return (
    <span
      className={`absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 font-heading text-[clamp(18px,2.4vw,26px)] font-semibold text-text tabular-nums shadow-sm ${className}`}
    >
      {jaar}
    </span>
  );
}

export function Onderschrift({ foto, taal, labels, className = '' }: { foto: Foto; taal: Taal; labels: BronLabels; className?: string }) {
  return (
    <span className={className}>
      {foto.bijschrift[taal]}
      <span className="text-muted">
        {' · '}
        {labels[foto.bron]}
        {foto.maker ? `, ${labels.foto} ${foto.maker}` : ''}
        {foto.beeldnummer ? `, ${labels.beeldnummer} ${foto.beeldnummer}` : ''}
      </span>
    </span>
  );
}

const ar = (foto: Foto) => ({ '--ar': `${foto.src.width} / ${foto.src.height}`, '--ar-getal': foto.src.width / foto.src.height }) as React.CSSProperties;

function FotoBeeld({ foto, jaar, taal, labels }: { foto: Foto; jaar?: string; taal: Taal; labels: BronLabels }) {
  return (
    <figure className="m-0 flex w-full flex-col items-center">
      <div className="tn-kader overflow-hidden rounded-md bg-card" style={ar(foto)}>
        <Image src={foto.src} alt={foto.alt[taal]} fill placeholder="blur" sizes={SIZES} className="object-contain" />
        {jaar ? <Jaar jaar={jaar} /> : null}
      </div>
      <figcaption className="mt-2 max-w-[60ch] text-center text-[15px] leading-snug text-text">
        <Onderschrift foto={foto} taal={taal} labels={labels} />
      </figcaption>
    </figure>
  );
}

function ToenNuBeeld({ toen, nu, jaren, taal, labels }: { toen: Foto; nu: Foto; jaren: [string, string]; taal: Taal; labels: BronLabels }) {
  const vast = { '--ar': '3 / 2', '--ar-getal': 1.5 } as React.CSSProperties;
  return (
    <div className="tn-toennu">
      <figure className="m-0 flex w-full flex-col items-center">
        <div className="tn-kader overflow-hidden rounded-md bg-card" style={vast}>
          <Image src={toen.src} alt={toen.alt[taal]} fill placeholder="blur" sizes={SIZES} className="object-cover" />
          <Image src={nu.src} alt={nu.alt[taal]} fill placeholder="blur" sizes={SIZES} className="tn-nu-foto object-cover" />
          <Jaar jaar={jaren[0]} className="tn-als-toen" />
          <Jaar jaar={jaren[1]} className="tn-als-nu" />
        </div>
        <figcaption className="mt-2 max-w-[60ch] text-center text-[15px] leading-snug text-text">
          <Onderschrift foto={toen} taal={taal} labels={labels} className="tn-als-toen" />
          <Onderschrift foto={nu} taal={taal} labels={labels} className="tn-als-nu" />
        </figcaption>
      </figure>
      {/* Alleen zonder JS: toen en nu naast elkaar. Geen blur-placeholder: met JS is deze figuur nooit te zien. */}
      <figure className="tn-nu-figuur m-0 flex w-full flex-col items-center">
        <div className="tn-kader overflow-hidden rounded-md bg-card" style={vast}>
          <Image src={nu.src} alt={nu.alt[taal]} fill sizes={SIZES} className="object-cover" />
          <Jaar jaar={jaren[1]} />
        </div>
        <figcaption className="mt-2 max-w-[60ch] text-center text-[15px] leading-snug text-text">
          <Onderschrift foto={nu} taal={taal} labels={labels} />
        </figcaption>
      </figure>
    </div>
  );
}

const ONDERGROND_ID = 'tn-ondergrond';

/**
 * De ondergrond van de buurtkaart, één keer per pagina. Elke BuurtKaart verwijst ernaar met `<use>`,
 * zodat de kaart (~12 kB) niet per hoofdstuk opnieuw in de HTML staat. Niet `display: none`, anders
 * tekent `<use>` in sommige browsers niets.
 */
export function BuurtKaartOndergrond() {
  return (
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute overflow-hidden" focusable="false">
      <defs>
        <g id={ONDERGROND_ID}>
          <BaseMapLagen />
        </g>
      </defs>
    </svg>
  );
}

/** Buurtkaart met één straat opgelicht (lijnen uit OpenStreetMap, zie scripts/toen-en-nu-straten.ts). Vraagt BuurtKaartOndergrond op de pagina. */
export function BuurtKaart({ straat, label }: { straat?: Straat; label: string }) {
  const c = BUURT_CLIP;
  return (
    <div className="tn-kader" style={{ '--ar': '400 / 310', '--ar-getal': 400 / 310 } as React.CSSProperties}>
      <svg viewBox={`${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}`} role="img" aria-label={label} className="block h-auto w-full rounded-md">
        <title>{label}</title>
        <use href={`#${ONDERGROND_ID}`} />
        {straat ? (
          <>
            <clipPath id={`tn-clip-${straat.replace(/\W/g, '')}`}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} />
            </clipPath>
            <path
              d={straten[straat]}
              pathLength={1}
              clipPath={`url(#tn-clip-${straat.replace(/\W/g, '')})`}
              fill="none"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tn-straat stroke-accent"
              opacity={0.85}
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

export function BeeldLaag({
  beeld,
  taal,
  labels,
  kaartLabel,
}: {
  beeld: Beeld;
  taal: Taal;
  labels: BronLabels;
  kaartLabel: (straat?: Straat) => string;
}) {
  switch (beeld.soort) {
    case 'foto':
      return <FotoBeeld foto={beeld.foto} jaar={beeld.jaar} taal={taal} labels={labels} />;
    case 'toenNu': {
      const [toen, nu] = beeld.jaren;
      return <ToenNuBeeld toen={beeld.toen} nu={beeld.nu} jaren={[typeof toen === 'string' ? toen : toen[taal], nu]} taal={taal} labels={labels} />;
    }
    case 'kaart':
      return <BuurtKaart straat={beeld.straat} label={kaartLabel(beeld.straat)} />;
  }
}

/** Korte omschrijving van het beeld bij een stap, voor schermlezers (het beeldvlak zelf is aria-hidden). */
export function beeldOmschrijving(beeld: Beeld, nu: boolean | undefined, taal: Taal, kaartLabel: (straat?: Straat) => string) {
  switch (beeld.soort) {
    case 'foto':
      return beeld.foto.alt[taal];
    case 'toenNu':
      return (nu ? beeld.nu : beeld.toen).alt[taal];
    case 'kaart':
      return kaartLabel(beeld.straat);
  }
}

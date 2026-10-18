import type { ReactNode } from 'react';

/**
 * Lijnpictogrammen voor de instructiekaart (viewBox 48×48, `currentColor`), zodat ze
 * licht/donker en print volgen. De paden staan los, zodat scènes ze in een eigen SVG kunnen zetten.
 */
export const ICONS = {
  zak: (
    <>
      <path d="M17 19c-4 6-6 11-6 17a6 6 0 0 0 6 6h14a6 6 0 0 0 6-6c0-6-2-11-6-17z" />
      <path d="M19 19c1-3 3-6 5-9 2 3 4 6 5 9" />
      <path d="M17 19h14" />
    </>
  ),
  container: (
    <>
      <path d="M15 43V14a9 9 0 0 1 18 0v29" />
      <rect x="18.5" y="15" width="11" height="5" rx="1" />
      <path d="M7 43h34" />
    </>
  ),
  papiercontainer: (
    <>
      <path d="M15 43V14a9 9 0 0 1 18 0v29" />
      <rect x="20" y="14" width="8" height="3" rx="1" />
      <rect x="18" y="26" width="12" height="11" rx="1" />
      <path d="M21 31.5h6M24 29v5" />
      <path d="M7 43h34" />
    </>
  ),
  rat: (
    <>
      <path d="M11 34c0-6 5-10 12-10s11 3 13 6l6 2-6 3c-2 2-6 3-13 3S11 37 11 34z" />
      <circle cx="31" cy="24" r="3" />
      <circle cx="36" cy="31" r="0.8" fill="currentColor" />
      <path d="M11 34c-4 0-7 2-6 6s5 3 7 1" />
      <path d="M18 38v4M28 38v4" />
    </>
  ),
  doos: (
    <>
      <path d="M8 17l16-8 16 8v20l-16 8-16-8z" />
      <path d="M8 17l16 8 16-8M24 25v20" />
      <path d="M16 13l16 8" />
    </>
  ),
  mes: (
    <>
      <circle cx="14" cy="36" r="6" />
      <circle cx="34" cy="36" r="6" />
      <path d="M18 31.5L37 6M30 31.5L11 6" />
    </>
  ),
  stukken: (
    <>
      <rect x="6" y="10" width="15" height="12" rx="1" />
      <rect x="27" y="10" width="15" height="12" rx="1" />
      <rect x="6" y="27" width="15" height="12" rx="1" />
      <rect x="27" y="27" width="15" height="12" rx="1" />
    </>
  ),
  pijl: <path d="M6 24h34M30 14l10 10-10 10" />,
  maan: <path d="M30 7a17 17 0 1 0 11 27A14 14 0 0 1 30 7z" />,
  zon: (
    <>
      <circle cx="24" cy="24" r="8" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
    </>
  ),
  kubus: (
    <>
      <path d="M24 5l17 9.5v19L24 43 7 33.5v-19z" />
      <path d="M7 14.5l17 9.5 17-9.5M24 24v19" />
    </>
  ),
  wasmachine: (
    <>
      <rect x="10" y="5" width="28" height="38" rx="3" />
      <path d="M10 13h28" />
      <circle cx="24" cy="28" r="9" />
      <circle cx="16" cy="9" r="1" fill="currentColor" />
      <path d="M26 9h7" />
    </>
  ),
  bank: (
    <>
      <path d="M10 20v-5a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v5" />
      <path d="M6 23a4 4 0 0 1 8 0v5h20v-5a4 4 0 0 1 8 0v12H6z" />
      <path d="M10 35v5M38 35v5" />
    </>
  ),
  bed: (
    <>
      <path d="M5 38V12M5 30h38v8M43 30v-5a4 4 0 0 0-4-4H20v9" />
      <rect x="9" y="22" width="9" height="6" rx="2" />
    </>
  ),
  koelkast: (
    <>
      <rect x="12" y="4" width="24" height="40" rx="3" />
      <path d="M12 17h24M17 9v4M17 22v7" />
    </>
  ),
  kast: (
    <>
      <rect x="10" y="5" width="28" height="36" rx="1" />
      <path d="M24 5v36M21 21v5M27 21v5M12 41v3M36 41v3" />
    </>
  ),
  plank: (
    <>
      <path d="M4 31L40 14l4 5L8 36z" />
      <path d="M14 29l14-6.5M20 31l12-5.5" />
    </>
  ),
  snoeiafval: (
    <>
      <path d="M8 41L37 12" />
      <path d="M20 29c-6-2-8-8-6-13 5 1 8 7 6 13z" />
      <path d="M27 22c1-6 7-9 12-7-1 5-6 8-12 7z" />
      <path d="M14 35c-6 0-9-4-9-9 5 0 9 4 9 9z" />
    </>
  ),
  stoel: (
    <>
      <path d="M15 4v38M15 4h5M15 26h19v16" />
      <path d="M15 12h5" />
    </>
  ),
  tapijt: (
    <>
      <circle cx="13" cy="21" r="8" />
      <circle cx="13" cy="21" r="3" />
      <path d="M13 29h31V13H13M40 29v5M35 29v5M30 29v5" />
    </>
  ),
  tuinstoel: (
    <>
      <path d="M12 41l10-28h8" />
      <path d="M17 27h21l3 14M20 27l-4 14" />
      <path d="M20 20h10" />
    </>
  ),
  puin: (
    <>
      <rect x="5" y="31" width="16" height="9" rx="1" />
      <rect x="23" y="31" width="16" height="9" rx="1" />
      <rect x="13" y="21" width="16" height="9" rx="1" />
      <path d="M34 22l6-4 3 6-5 3zM38 12l4 1-1 4-4-1z" />
    </>
  ),
  ijzer: <path d="M8 12h32v6H28v12h12v6H8v-6h12V18H8z" />,
  accu: (
    <>
      <rect x="5" y="14" width="38" height="26" rx="2" />
      <path d="M11 14v-4h7v4M30 14v-4h7v4M12 26h6M33 23v6M30 26h6" />
    </>
  ),
  apparaat: (
    <>
      <rect x="6" y="18" width="36" height="22" rx="6" />
      <path d="M15 18v-8h8v8M25 18v-8h8v8M40 26h4M12 40v3M36 40v3" />
    </>
  ),
  spiegel: (
    <>
      <ellipse cx="24" cy="22" rx="12" ry="17" />
      <path d="M17 17l7-7M17 25l12-12M18 43h12M24 39v4" />
    </>
  ),
  tegel: (
    <>
      <rect x="7" y="7" width="34" height="34" rx="1" />
      <path d="M7 24h34M24 7v34" />
    </>
  ),
  band: (
    <>
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="8" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" />
    </>
  ),
  motor: (
    <>
      <path d="M11 18h20l4 4h6v14h-6l-4 4H11z" />
      <path d="M16 18v-6h10v6M4 23v10M4 28h7" />
    </>
  ),
  onderdeel: <path d="M30 6a10 10 0 0 0-9 13L6 34a4 4 0 0 0 6 6l15-15a10 10 0 0 0 13-9l-6 6-5-1-1-5z" />,
  zand: (
    <>
      <path d="M3 41c7-15 14-21 21-21s14 6 21 21z" />
      <path d="M17 33h.1M25 29h.1M30 36h.1M20 38h.1M33 31h.1" strokeWidth="3.5" />
    </>
  ),
  boom: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="4" />
    </>
  ),
  parkeren: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="4" />
      <path d="M19 35V13h8a7 7 0 0 1 0 14h-8" />
    </>
  ),
  grijper: (
    <>
      <path d="M24 3v14M17 17h14" />
      <path d="M18 17l-8 12 6 10M30 17l8 12-6 10" />
    </>
  ),
  // Geluid (instructiekaart en pagina /geluid)
  boor: (
    <>
      <path d="M6 12h24a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H6z" />
      <path d="M34 18h10M6 12v12" />
      <path d="M13 24l-3 17h9l3-17" />
    </>
  ),
  hamer: (
    <>
      <path d="M22 8l12-3 9 9-3 12-6-6-4 4-6-6 4-4z" />
      <path d="M24 20L7 37a3.5 3.5 0 0 0 5 5l17-17" />
    </>
  ),
  muziek: (
    <>
      <path d="M18 36V11l22-5v26" />
      <path d="M18 18l22-5" />
      <circle cx="13" cy="36" r="5" />
      <circle cx="35" cy="32" r="5" />
    </>
  ),
  brief: (
    <>
      <rect x="6" y="11" width="36" height="27" rx="2" />
      <path d="M6 13l18 14 18-14" />
    </>
  ),
  telefoon: (
    <path d="M14 6h7l3 9-5 3.5a24 24 0 0 0 10.5 10.5L33 24l9 3v7a4 4 0 0 1-4 4C21 38 10 27 10 10a4 4 0 0 1 4-4z" />
  ),
  bouwbord: (
    <>
      <rect x="7" y="5" width="34" height="23" rx="2" />
      <path d="M14 28v15M34 28v15M13 12h22M13 19h14" />
    </>
  ),
  praten: (
    <>
      <path d="M5 8h24v16H15l-6 5v-5H5z" />
      <path d="M33 16h10v16h-3v5l-5-5H23v-4" />
    </>
  ),
  huis: (
    <>
      <path d="M5 23L24 7l19 16" />
      <path d="M10 19v22h28V19" />
      <path d="M20 41V30h8v11" />
    </>
  ),
  kalender: (
    <>
      <rect x="6" y="9" width="36" height="33" rx="3" />
      <path d="M6 18h36M15 5v8M33 5v8" />
      <path d="M14 26h4M22 26h4M30 26h4M14 34h4M22 34h4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = 'size-10', strike = false }: { name: IconName; className?: string; strike?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
      {strike && <path d="M6 6l36 36" strokeWidth={4} className="stroke-accent" />}
    </svg>
  );
}

/** ✓ of ✗ in een gekleurde cirkel. Kleur is nooit de enige drager: er staat altijd ook tekst bij. */
export function Mark({ ok, className = 'size-7' }: { ok: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} flex-none`} aria-hidden>
      <circle cx="12" cy="12" r="12" className={ok ? 'fill-primary' : 'fill-accent'} />
      <path
        d={ok ? 'M6.5 12.5l3.5 3.5 7.5-8' : 'M7.5 7.5l9 9M16.5 7.5l-9 9'}
        fill="none"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background"
      />
    </svg>
  );
}

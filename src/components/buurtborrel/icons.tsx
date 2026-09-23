/**
 * Lijnpictogrammen voor de Buurtborrel-pagina, in dezelfde stijl als de
 * afval-instructiekaart (viewBox 48×48, `currentColor`, ronde lijnen).
 */
const ICONS = {
  vuurkorf: (
    <>
      <path d="M24 8c-5 5-7 9-4 13 1-3 3-4 4-4 1 3 5 3 5-1 2 2 2 5 0 7" />
      <path d="M10 26h28l-4 10H14z" />
      <path d="M17 26v10M24 26v10M31 26v10" />
      <path d="M16 36l-4 7M32 36l4 7M24 36v7" />
    </>
  ),
  zon: (
    <>
      <circle cx="24" cy="24" r="8" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
    </>
  ),
  proost: (
    <>
      <path d="M8 10h12l-1 10a5 5 0 0 1-10 0z" />
      <path d="M14 25v13M9 38h10" />
      <path d="M28 10h12l-1 10a5 5 0 0 1-10 0z" />
      <path d="M34 25v13M29 38h10" />
      <path d="M24 4v3M19 6l1.5 2M29 6l-1.5 2" />
    </>
  ),
  mand: (
    <>
      <path d="M6 22h36l-4 18H10z" />
      <path d="M14 22a10 10 0 0 1 20 0" />
      <path d="M8 30h32M16 22l2 18M32 22l-2 18M24 22v18" />
    </>
  ),
  ei: (
    <>
      <path d="M24 6c-8 0-14 12-14 21a14 14 0 0 0 28 0C38 18 32 6 24 6z" />
      <path d="M11 26l5-3 4 3 4-3 4 3 4-3 5 3" />
    </>
  ),
  kroon: (
    <>
      <path d="M8 36l-2-22 10 8 8-12 8 12 10-8-2 22z" />
      <path d="M8 42h32" />
    </>
  ),
  ruilen: (
    <>
      <path d="M8 17h28l-7-7" />
      <path d="M40 31H12l7 7" />
    </>
  ),
  idee: (
    <>
      <path d="M17 30a12 12 0 1 1 14 0c-1.5 1-2 2.5-2 4v1H19v-1c0-1.5-.5-3-2-4z" />
      <path d="M19 40h10M21 44h6" />
    </>
  ),
  appgroep: (
    <>
      <path d="M6 10h24v16H16l-6 5v-5H6z" />
      <path d="M34 18h8v14h-4v5l-6-5H20v-2" />
    </>
  ),
  bezem: (
    <>
      <path d="M36 5L22 28" />
      <path d="M18 26l10 6-4 10-16-9z" />
      <path d="M13 38l4-6M18 41l3-5" />
    </>
  ),
  pan: (
    <>
      <ellipse cx="20" cy="28" rx="14" ry="6" />
      <path d="M6 28v2c0 3.5 6 6 14 6s14-2.5 14-6v-2" />
      <path d="M33 26l10-5" />
      <path d="M14 16c0-2 2-2 2-4M20 14c0-2 2-2 2-4M26 16c0-2 2-2 2-4" />
    </>
  ),
  pijl: <path d="M6 24h34M30 14l10 10-10 10" />,
  hart: <path d="M24 41S6 30 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z" />,
} as const;

export type BuurtborrelIconName = keyof typeof ICONS;

export function Icon({ name, className = 'size-10' }: { name: BuurtborrelIconName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/** Het WhatsApp-beeldmerk (gevuld), klein naast de knoptekst. */
export function WhatsAppIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.2-4.24 9.44-9.45 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.05.69C5.78.69.67 5.8.67 12.07c0 2 .52 3.96 1.52 5.69L.57 23.69l6.06-1.59a11.35 11.35 0 0 0 5.42 1.38h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.35-8.08z" />
    </svg>
  );
}

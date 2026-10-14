/**
 * Lijnpictogrammen voor Praktische info, in dezelfde stijl als de
 * Buurtborrel-pictogrammen (viewBox 48×48, `currentColor`, ronde lijnen).
 */
const ICONS = {
  brievenbus: (
    <>
      <path d="M10 18a8 8 0 0 1 16 0v14H10z" />
      <path d="M26 18h12v14H26" />
      <path d="M14 23h8" />
      <path d="M18 32v10M14 42h8" />
    </>
  ),
  aed: (
    <>
      <path d="M24 41S6 30 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z" />
      <path d="M26 14l-6 11h8l-6 11" />
    </>
  ),
  locatie: (
    <>
      <path d="M24 43s-13-12-13-22a13 13 0 0 1 26 0c0 10-13 22-13 22z" />
      <circle cx="24" cy="21" r="5" />
    </>
  ),
  slot: (
    <>
      <rect x="11" y="21" width="26" height="20" rx="2" />
      <path d="M16 21v-6a8 8 0 0 1 16 0v6" />
      <path d="M24 29v5" />
    </>
  ),
  telefoon: (
    <path d="M14 7l6 9-4 4a24 24 0 0 0 12 12l4-4 9 6-3 6c-2 2-5 2-8 1A36 36 0 0 1 9 20c-1-3-1-6 1-8z" />
  ),
  auto: (
    <>
      <path d="M8 32v-7l4-9h24l4 9v7z" />
      <path d="M8 25h32" />
      <circle cx="15" cy="32" r="4" />
      <circle cx="33" cy="32" r="4" />
    </>
  ),
  bezoek: (
    <>
      <circle cx="17" cy="16" r="6" />
      <path d="M6 40a11 11 0 0 1 22 0" />
      <circle cx="33" cy="18" r="5" />
      <path d="M29 30a9 9 0 0 1 13 10" />
    </>
  ),
  doos: (
    <>
      <path d="M8 16l16-8 16 8v18l-16 8-16-8z" />
      <path d="M8 16l16 8 16-8M24 24v18" />
    </>
  ),
  stekker: (
    <>
      <path d="M18 6v9M30 6v9" />
      <path d="M13 15h22v7a11 11 0 0 1-22 0z" />
      <path d="M24 33v9" />
    </>
  ),
  rolstoel: (
    <>
      <circle cx="21" cy="8" r="3" />
      <path d="M21 13v13h11l4 10" />
      <path d="M21 19h9" />
      <path d="M15 22a10 10 0 1 0 14 13" />
    </>
  ),
  kerk: (
    <>
      <path d="M24 5v8M20 9h8" />
      <path d="M14 42V24l10-11 10 11v18" />
      <path d="M8 42V30l6-6M40 42V30l-6-6" />
      <path d="M6 42h36" />
      <path d="M20 42v-8a4 4 0 0 1 8 0v8" />
    </>
  ),
} as const;

export type PraktischeInfoIconName = keyof typeof ICONS;

export function Icon({ name, className = 'size-10' }: { name: PraktischeInfoIconName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

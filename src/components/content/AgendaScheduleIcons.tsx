/**
 * Kleine lijn-iconen voor programmastappen op een agenda-detailpagina, in
 * dezelfde stijl als het "Toon als tabel"-icoon in ChartCardShell
 * (currentColor, strokeWidth 1.2, viewBox 15x15) — geen icoon-library nodig
 * voor dit ene gebruik.
 */
import type { JSX } from 'react';

const shared = {
  width: 15,
  height: 15,
  viewBox: '0 0 15 15',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function MeetingIcon() {
  return (
    <svg {...shared}>
      <path d="M7.5 1.5c-2.2 0-4 1.7-4 4 0 3 4 8 4 8s4-5 4-8c0-2.3-1.8-4-4-4Z" />
      <circle cx="7.5" cy="5.5" r="1.4" />
    </svg>
  );
}

function CleanupIcon() {
  // Bezem (steel + kop) met twee veeg-strepen ernaast — "actief" vegen,
  // in plaats van een stilstaande bezem.
  return (
    <svg {...shared}>
      <path d="M11.8 1 6.3 6.8" />
      <path d="M6.3 6.8 2.7 8.3 3.6 13 7.7 10.5Z" />
      <path d="M5.1 8.4 4.3 11.8" />
      <path d="M1.3 10.8c-.5.35-.75.85-.7 1.4" />
      <path d="M0.3 12.6c-.4.25-.6.6-.55 1" />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg {...shared}>
      <path d="M2 5.5h8v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4Z" />
      <path d="M10 6.5h1a1.8 1.8 0 0 1 0 3.6h-1" />
      <path d="M4.5 3c0-.6.5-.8.5-1.4S4.5 .6 4.5 0" />
      <path d="M6.8 3c0-.6.5-.8.5-1.4S6.8.6 6.8 0" />
    </svg>
  );
}

export function ScheduleIcon({ icon }: { icon?: string | null }): JSX.Element | null {
  switch (icon) {
    case 'meeting':
      return <MeetingIcon />;
    case 'cleanup':
      return <CleanupIcon />;
    case 'coffee':
      return <CoffeeIcon />;
    default:
      return null;
  }
}

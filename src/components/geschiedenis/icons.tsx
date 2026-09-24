import type { ReactElement } from 'react';
import type { GeschiedenisVerhaal } from '../../../payload-types';

type Tijdvak = NonNullable<GeschiedenisVerhaal['tijdvakken']>[number];
export type IcoonNaam = NonNullable<Tijdvak['gebeurtenissen']>[number]['icoon'];

// Platte lijnicoontjes, 20×20, lijn 1,5 (zie de design brief).
const PADEN: Record<IcoonNaam, ReactElement> = {
  school: <path d="M2.5 8.5 10 4.5l7.5 4M4.5 8v8.5h11V8M8.5 16.5v-4h3v4" />,
  brandweer: (
    <path d="M10 2.5c.8 3 4.5 4.3 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2.2 1.2-3.4 2.2-4.3 0 2 1 3.1 2.1 3.1 0-3-1.1-4.4.2-7.3z" />
  ),
  kaart: <path d="m2.5 5 4.5-2 6 2 4.5-2v12l-4.5 2-6-2-4.5 2zM7 3v12M13 5v12" />,
  brug: (
    <path d="M1.5 12.5h17M3.5 12.5c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5M5.5 12.5V16M14.5 12.5V16M1.5 16.5c1.5-.8 2.5-.8 4 0s2.5.8 4 0 2.5-.8 4 0 2.5.8 4 0" />
  ),
  eiland: (
    <path d="M1.5 15c2-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 2 .8 3.5 0M4.5 13c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5M10 8.5V3l4 1.5-4 1.5" />
  ),
  duivel: <path d="M3 17c5 0 7-3.5 7-7s2-6.5 6-6.5M13.5 1.5 17 3.5l-2.5 3" />,
  camera: (
    <>
      <path d="M2.5 6.5h3.5l1.5-2h5l1.5 2h3.5v10h-15z" />
      <circle cx="10" cy="11" r="3" />
    </>
  ),
  fabriek: <path d="M2 17.5V9l4 2.5V9l4 2.5V9l4 2.5V3h3.5v14.5zM6 14.5h1.5M10 14.5h1.5" />,
  circus: <path d="M2.5 16.5 10 5l7.5 11.5zM10 5V1.5l3 1.2-3 1.2M8 16.5l2-4.5 2 4.5" />,
  fiets: (
    <>
      <circle cx="5" cy="13" r="3.5" />
      <circle cx="15" cy="13" r="3.5" />
      <path d="M5 13 8 7h6l1 6M8 7 10 13h5M7 5h3" />
    </>
  ),
  zwemmer: (
    <>
      <path d="M1.5 15.5c2-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 2 .8 3.5 0M4 12.5l4.5-4 3 2.5 3-2" />
      <circle cx="14" cy="5.5" r="1.8" />
    </>
  ),
  huis: <path d="M2.5 9.5 10 3l7.5 6.5M4.5 8.5v9h11v-9M8.5 17.5v-5h3v5" />,
  kroon: <path d="m3 15 1-8.5 4 4 2-6 2 6 4-4 1 8.5zM3 17.5h14" />,
};

export function TijdlijnIcoon({ naam, className = 'size-5' }: { naam: IcoonNaam; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PADEN[naam]}
    </svg>
  );
}

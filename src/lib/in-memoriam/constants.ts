/** Status van een herinnering (reactie) op een In-memoriam-pagina. Alleen `goedgekeurd` staat op de site. */
export const REACTIE_STATUS = [
  { value: 'ingediend', label: 'Ingediend (wacht op goedkeuring)' },
  { value: 'goedgekeurd', label: 'Goedgekeurd (staat op de site)' },
  { value: 'afgekeurd', label: 'Afgekeurd' },
] as const;

export type ReactieStatus = (typeof REACTIE_STATUS)[number]['value'];

export const REACTIE_MAX = 2000;
export const NAAM_MAX = 80;

/** Pad van een In-memoriam-pagina, zonder taalprefix. */
export const inMemoriamPad = (slug: string) => `/in-memoriam/${slug}`;

/** Duivelseiland in de gebiedsindeling van de gemeente (gebieden/buurten). */
export const BUURT_ID = '03630980000265';
export const BUURT_CODE = 'KD09';

export const DSO = 'https://api.data.amsterdam.nl/v1';
export const RECYCLEPUNTEN_URL = 'https://kaart.amsterdam.nl/api/maps/917.json';
export const SIGNALEN_URL = 'https://api.meldingen.amsterdam.nl/signals/v1/public/signals/geography';

/** Uitsnede van de kaart in RD (EPSG:28992): buurtgrens plus ~120 m marge. */
export const VIEW = { minX: 120440, minY: 484920, maxX: 121040, maxY: 485430 } as const;

/** Dezelfde uitsnede in WGS84 (lon/lat) voor de meldingen-API. */
export const VIEW_WGS84 = [4.87996, 52.3511, 4.88872, 52.35572] as const;

export const LINKS = {
  grofAfspraak: 'https://www.amsterdam.nl/afval-hergebruik/grof-afval/',
  afvalwijzer: 'https://www.amsterdam.nl/afval-hergebruik/afvalwijzer/',
  recyclepunten: 'https://www.amsterdam.nl/afval-hergebruik/recyclepunten/',
  melding: 'https://meldingen.amsterdam.nl/',
  meldingenkaart: 'https://meldingen.amsterdam.nl/meldingenkaart',
  containerkaart: 'https://kaart.amsterdam.nl/afvalcontainers',
} as const;

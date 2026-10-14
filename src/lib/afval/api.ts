import { BUURT_CODE, BUURT_ID, DSO, RECYCLEPUNTEN_URL, SIGNALEN_URL, VIEW_WGS84 } from './constants';
import { wgs84ToRd, type Pt } from './geo';
import type { Bijplaatsing, Container, Melding, Recyclepunt, Regel, Result } from './types';

const DAG = 86400;
const UUR = 3600;

type Point = { type: 'Point'; coordinates: Pt };
type DsoPage<K extends string, T> = { _embedded: Record<K, T[]>; page?: { totalPages?: number } };

async function json<T>(url: string, revalidate: number): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Vangt fouten per bron af; de rest van de pagina blijft werken. */
async function safe<T>(name: string, load: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await load(), fetchedAt: new Date().toISOString() };
  } catch (e) {
    console.error(`[afval] ${name} niet beschikbaar:`, e);
    return { ok: false };
  }
}

/** Alle pagina's van een DSO-lijst: eerst pagina 1 met telling, daarna de rest tegelijk. */
async function dsoAll<K extends string, T>(key: K, path: string, params: Record<string, string>, revalidate: number): Promise<T[]> {
  const qs = (page: number) => new URLSearchParams({ _format: 'json', _pageSize: '1000', ...params, page: String(page) }).toString();
  const first = await json<DsoPage<K, T>>(`${DSO}${path}?${qs(1)}&_count=true`, revalidate);
  const pages = first.page?.totalPages ?? 1;
  const rest = await Promise.all(Array.from({ length: Math.max(pages - 1, 0) }, (_, i) => json<DsoPage<K, T>>(`${DSO}${path}?${qs(i + 2)}`, revalidate)));
  return [first, ...rest].flatMap((p) => p._embedded[key]);
}

export function getContainers(): Promise<Result<Container[]>> {
  type Row = { id: string; fractieOmschrijving: string; geometrie: Point | null };
  return safe('containers', async () => {
    const rows = await dsoAll<'container', Row>(
      'container',
      '/huishoudelijkafval/container/',
      { gbdBuurtId: BUURT_ID, status: '1', _fields: 'id,fractieOmschrijving,geometrie' },
      DAG,
    );
    return rows.filter((r) => r.geometrie).map((r) => ({ id: r.id, fractie: r.fractieOmschrijving, rd: r.geometrie!.coordinates }));
  });
}

export function getBijplaatsingen(): Promise<Result<Bijplaatsing[]>> {
  type Row = {
    datumWaarneming: string;
    clusterId: string | null;
    straatnaam: string | null;
    geometrie: Point | null;
    grof: boolean | null;
    huisvuil: boolean | null;
    karton: boolean | null;
    zwerfafval: boolean | null;
    crowScore: string | null;
  };
  return safe('bijplaatsingen', async () => {
    const rows = await dsoAll<'bijplaatsingen', Row>(
      'bijplaatsingen',
      '/huishoudelijkafval/bijplaatsingen/',
      { gbdBuurtId: BUURT_ID, _fields: 'datumWaarneming,clusterId,straatnaam,geometrie,grof,huisvuil,karton,zwerfafval,crowScore' },
      UUR,
    );
    return rows.map((r) => ({
      datum: r.datumWaarneming,
      clusterId: r.clusterId,
      straat: r.straatnaam,
      rd: r.geometrie?.coordinates ?? null,
      grof: !!r.grof,
      huisvuil: !!r.huisvuil,
      karton: !!r.karton,
      zwerfafval: !!r.zwerfafval,
      crow: r.crowScore,
    }));
  });
}

const FRACTIES = ['GA', 'Rest', 'GFT', 'Plastic', 'Papier', 'Glas', 'Textiel'] as const;

type AfvalwijzerRow = {
  afvalwijzerFractieNaam: string;
  afvalwijzerFractieCode: string;
  afvalwijzerInstructie2: string | null;
  afvalwijzerOphaaldagen2: string | null;
  afvalwijzerBuitenzettenVanafTot: string | null;
  afvalwijzerWaar: string | null;
  afvalwijzerAfvalkalenderOpmerking: string | null;
  afvalwijzerAfvalkalenderMelding: string | null;
  afvalwijzerUrl: string | null;
};
const AFVALWIJZER_FIELDS = [
  'afvalwijzerFractieNaam',
  'afvalwijzerFractieCode',
  'afvalwijzerInstructie2',
  'afvalwijzerOphaaldagen2',
  'afvalwijzerBuitenzettenVanafTot',
  'afvalwijzerWaar',
  'afvalwijzerAfvalkalenderOpmerking',
  'afvalwijzerAfvalkalenderMelding',
  'afvalwijzerUrl',
].join(',');

const leeg = (s: string | null) => (s && s.trim() ? s.trim() : null);
/** De Afvalwijzer zet soms HTML in opmerkingen; wij tonen alleen de tekst. */
const tekst = (s: string | null) => leeg(s ? s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ') : null);

export const toRegel = (r: AfvalwijzerRow, adressen = 1): Regel => ({
  fractie: r.afvalwijzerFractieNaam,
  code: r.afvalwijzerFractieCode,
  instructie: leeg(r.afvalwijzerInstructie2),
  dagen: leeg(r.afvalwijzerOphaaldagen2),
  buitenzetten: leeg(r.afvalwijzerBuitenzettenVanafTot),
  waar: leeg(r.afvalwijzerWaar),
  opmerking: tekst(r.afvalwijzerAfvalkalenderOpmerking),
  melding: tekst(r.afvalwijzerAfvalkalenderMelding),
  url: leeg(r.afvalwijzerUrl),
  adressen,
});

/** Per fractie de regels voor woonadressen in de buurt, meest voorkomende eerst. */
export function getRegels(): Promise<Result<Record<string, Regel[]>>> {
  return safe('afvalwijzer', async () => {
    const perFractie = await Promise.all(
      FRACTIES.map(async (code) => {
        const rows = await dsoAll<'afvalwijzer', AfvalwijzerRow>(
          'afvalwijzer',
          '/afvalwijzer/afvalwijzer/',
          { gbdBuurtCode: BUURT_CODE, gebruiksdoelWoonfunctie: 'true', afvalwijzerFractieCode: code, _fields: AFVALWIJZER_FIELDS },
          DAG,
        );
        const groups = new Map<string, { row: AfvalwijzerRow; n: number }>();
        for (const row of rows) {
          const key = JSON.stringify(toRegel(row));
          const g = groups.get(key);
          if (g) g.n++;
          else groups.set(key, { row, n: 1 });
        }
        const regels = [...groups.values()].sort((a, b) => b.n - a.n).map((g) => toRegel(g.row, g.n));
        return [code, regels] as const;
      }),
    );
    return Object.fromEntries(perFractie);
  });
}

/** Regels voor één adres (adrescheck). */
export async function getRegelsVoorAdres(postcode: string, huisnummer: number, toevoeging?: string): Promise<Regel[]> {
  type Row = AfvalwijzerRow & { huisletter: string | null; huisnummertoevoeging: string | null; afvalwijzerFractieVolgnummer: number | null };
  const params = new URLSearchParams({
    _format: 'json',
    _pageSize: '100',
    postcode,
    huisnummer: String(huisnummer),
    _fields: `${AFVALWIJZER_FIELDS},huisletter,huisnummertoevoeging,afvalwijzerFractieVolgnummer`,
  });
  const page = await json<DsoPage<'afvalwijzer', Row>>(`${DSO}/afvalwijzer/afvalwijzer/?${params}`, DAG);
  const rows = page._embedded.afvalwijzer;
  // Meerdere adressen op één huisnummer (1-H, 1-2, 1A): kies de gevraagde toevoeging, anders de eerste.
  const suffix = (r: Row) => `${r.huisletter ?? ''}${r.huisnummertoevoeging ?? ''}`.toUpperCase();
  const wanted = (toevoeging ?? '').replace(/[\s-]/g, '').toUpperCase();
  const suffixes = [...new Set(rows.map(suffix))];
  const pick = suffixes.includes(wanted) ? wanted : suffixes[0];
  return rows
    .filter((r) => suffix(r) === pick)
    .sort((a, b) => (a.afvalwijzerFractieVolgnummer ?? 99) - (b.afvalwijzerFractieVolgnummer ?? 99))
    .map((r) => toRegel(r));
}

export function getRecyclepunten(): Promise<Result<Recyclepunt[]>> {
  type Feature = {
    geometry: { coordinates: [number, number] };
    properties: { title: string; street: string; street_number: string; zip: string; website?: string };
  };
  return safe('recyclepunten', async () => {
    const fc = await json<{ features: Feature[] }>(RECYCLEPUNTEN_URL, DAG);
    return fc.features.map(({ geometry, properties: p }) => {
      const [lon, lat] = geometry.coordinates;
      return {
        naam: p.title.replace(/^Recyclepunt\s+/i, '').replace(/\s*\(.*\)\s*$/, ''),
        adres: `${p.street} ${p.street_number}`,
        postcode: p.zip,
        url: p.website || null,
        rd: wgs84ToRd(lat, lon),
        geenBedrijfsafval: /geen bedrijfsafval/i.test(p.title),
      };
    });
  });
}

/** Meldingen rond de buurt (afval en zwerfvuil) van de openbare meldingenkaart. */
export function getMeldingen(): Promise<Result<Melding[]>> {
  type Feature = {
    geometry: { coordinates: [number, number] };
    properties: { created_at: string; category: { name: string; slug: string; parent: { slug: string } } };
  };
  return safe('meldingen', async () => {
    const bbox = VIEW_WGS84.join(',');
    const lists = await Promise.all(
      ['afval', 'schoon'].map((slug) => json<{ features: Feature[] }>(`${SIGNALEN_URL}?bbox=${bbox}&maincategory_slug=${slug}`, UUR)),
    );
    return lists
      .flatMap((fc) => fc.features)
      .map(({ geometry, properties: p }) => ({
        categorie: p.category.name,
        categorieSlug: p.category.slug,
        hoofdcategorie: p.category.parent.slug,
        datum: p.created_at,
        rd: wgs84ToRd(geometry.coordinates[1], geometry.coordinates[0]),
      }))
      .sort((a, b) => b.datum.localeCompare(a.datum));
  });
}

/** Vorm van src/lib/stats/statistieken.json. Velden per sectie verschillen; zie load.ts voor de validatie. */

export type Item = {
  key: string;
  label: string;
  waarde: number;
  eenheid?: string;
  aandeel?: number;
  jaar?: number;
  [extra: string]: unknown;
};

export type SectionBase = {
  id: string;
  thema: string;
  titel: string;
  type: string;
  bron: string;
  jaar: number | string;
  schatting: boolean;
  noot?: string;
  opvallend?: string;
  eenheid?: string | Record<string, string>;
  totaal?: number;
};

export type Section<Row = Item> = SectionBase & {
  data: Row[];
  [extra: string]: unknown;
};

export type StatsData = {
  buurt: string;
  buurtcode: string;
  wijk: string;
  stadsdeel: string;
  gemeente: string;
  oppervlakte_ha: number;
  peildatum_bron: string;
  vindplaats: string;
  licentie_noot: string;
  themas: { id: string; titel: string }[];
  secties: Section<Record<string, unknown>>[];
};

export type HerkomstRow = { jaar: number; nederland: number; europa: number | null; buiten_europa: number | null };
export type GeboorteRow = { jaar: number; geboorte: number; sterfte: number };
export type VerbruikRow = { jaar: number; gas_m3: number; stroom_kwh: number };
export type OngevalRow = { jaar: number; totaal: number; materiele_schade: number; letselschade: number; dodelijk: number };
export type GezondheidRow = { jaar: number; van_18_tot_65: number; vanaf_18: number; vanaf_65: number };
export type AlcoholRow = { label: string; '18 jaar of ouder': number; '18 tot 65 jaar': number; '65 jaar of ouder': number };
export type SchoolRow = { label: string; duivelseiland: number; museumkwartier: number; amsterdam: number; nederland: number };
export type DichtheidRow = { key: string; label: string; nederland: number; duivelseiland: number };
export type OnderscheidRow = { label: string; duivelseiland: number | null; nederland: number; amsterdam: number; noot?: string };
export type ScatterRow = { label: string; woz: number; aandeel_65plus: number; woningen: number; soort: string };
export type VergelijkItem = Item & { is_duivelseiland: boolean; is_wijk: boolean };

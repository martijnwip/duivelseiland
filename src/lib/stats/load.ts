import raw from './statistieken.json';
import type { Item, Section, StatsData } from './types';

/**
 * Laadt statistieken.json en controleert bij het laden (dus ook tijdens `next build`)
 * of alle secties die de pagina gebruikt bestaan en de verwachte getalvelden hebben.
 * Een fout in de data valt zo meteen op, met sectie-id en veldnaam.
 */

// sectie-id -> velden die in elke rij van `data` een eindig getal moeten zijn
const NUMERIC_ROWS: Record<string, string[]> = {
  kerncijfers: ['waarde'],
  'inwoners-trend': ['waarde'],
  leeftijd: ['waarde'],
  geslacht: ['waarde'],
  huishoudens: ['waarde'],
  'burgerlijke-staat': ['waarde'],
  geboorteland: ['waarde'],
  'geboorte-sterfte': ['jaar', 'geboorte', 'sterfte'],
  woningwaarde: ['waarde'],
  eigendom: ['waarde'],
  bewoning: ['waarde'],
  woningtype: ['waarde'],
  bouwperiode: ['waarde'],
  gebruiksdoelen: ['waarde'],
  energielabels: ['waarde'],
  energieverbruik: ['jaar', 'gas_m3', 'stroom_kwh'],
  bedrijven: ['waarde'],
  inkomen: ['waarde'],
  'inkomen-vergelijking': ['waarde'],
  arbeid: ['waarde'],
  uitkeringen: ['waarde'],
  voertuigen: ['waarde'],
  'elektrische-autos': ['waarde'],
  'vervoer-cbs': ['waarde'],
  verkeersongevallen: ['jaar', 'totaal', 'materiele_schade', 'letselschade', 'dodelijk'],
  dichtheid: ['nederland', 'duivelseiland'],
  'misdaad-jaren': ['waarde'],
  'misdaad-soorten': ['waarde'],
  'misdaad-per-1000': ['waarde'],
  'gezondheid-trend': ['jaar', 'van_18_tot_65', 'vanaf_18', 'vanaf_65'],
  'alcohol-roken': ['18 jaar of ouder', '18 tot 65 jaar', '65 jaar of ouder'],
  leefstijl: ['waarde'],
  welzijn: ['waarde'],
  tevredenheid: ['waarde'],
  geluidhinder: ['waarde'],
  voorzieningen: ['waarde'],
  leerlingen: ['waarde'],
  opleidingsniveau: ['waarde'],
  'school-afstand': ['duivelseiland', 'museumkwartier', 'amsterdam', 'nederland'],
  verkiezingen: ['waarde', 'aandeel'],
  'vergelijk-woz-65plus': ['woz', 'aandeel_65plus', 'woningen'],
};

// Rijen waar een veld bewust null mag zijn (ontbrekende bron).
const NULLABLE: Record<string, string[]> = {
  'herkomst-trend': ['europa', 'buiten_europa'],
  onderscheidend: ['duivelseiland'],
};

function fail(sectionId: string, msg: string): never {
  throw new Error(`statistieken.json, sectie "${sectionId}": ${msg}`);
}

function validate(d: StatsData): void {
  const seen = new Set<string>();
  for (const s of d.secties) {
    if (seen.has(s.id)) fail(s.id, 'dubbel sectie-id');
    seen.add(s.id);
    for (const f of ['titel', 'type', 'bron'] as const) {
      if (typeof s[f] !== 'string' || !s[f]) fail(s.id, `veld "${f}" ontbreekt`);
    }
    if (typeof s.schatting !== 'boolean') fail(s.id, 'veld "schatting" moet true/false zijn');
    if (!Array.isArray(s.data) || s.data.length === 0) fail(s.id, 'veld "data" is leeg of geen lijst');
    const fields = NUMERIC_ROWS[s.id];
    if (fields) {
      s.data.forEach((row, i) => {
        for (const f of fields) {
          const v = row[f];
          if (typeof v !== 'number' || !Number.isFinite(v)) fail(s.id, `rij ${i}: "${f}" is geen getal (${String(v)})`);
        }
      });
    }
  }
  for (const id of Object.keys(NUMERIC_ROWS)) if (!seen.has(id)) fail(id, 'ontbreekt in het bestand');
  for (const id of Object.keys(NULLABLE)) if (!seen.has(id)) fail(id, 'ontbreekt in het bestand');
  const herkomst = d.secties.find((s) => s.id === 'herkomst-trend')!;
  herkomst.data.forEach((row, i) => {
    if (typeof row.jaar !== 'number' || typeof row.nederland !== 'number') fail(herkomst.id, `rij ${i}: jaar of nederland ontbreekt`);
    for (const f of NULLABLE['herkomst-trend']) {
      const v = row[f];
      if (v !== null && (typeof v !== 'number' || !Number.isFinite(v))) fail(herkomst.id, `rij ${i}: "${f}" moet getal of null zijn`);
    }
  });
}

const data = raw as unknown as StatsData;
validate(data);

const byId = new Map(data.secties.map((s) => [s.id, s]));

export const stats = data;

/** Sectie op id. De rijvorm geeft de aanroeper op; velden zijn hierboven gecontroleerd. */
export function section<Row = Item>(id: string): Section<Row> {
  const s = byId.get(id);
  if (!s) throw new Error(`statistieken.json: sectie "${id}" bestaat niet`);
  return s as unknown as Section<Row>;
}

/** Ids van alle secties (voor de controle "alle 43 getoond"). */
export const allSectionIds = data.secties.map((s) => s.id);

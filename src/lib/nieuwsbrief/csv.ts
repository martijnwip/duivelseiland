/**
 * Adressen (met naam) uit een CSV-bestand of geplakte tekst halen, voor de import in /admin.
 * Draait zowel in de browser (CSV lezen vóór het versturen) als in het import-endpoint.
 */

export type ImportRij = { naam?: string; email: string };

const ADRES_RE = /[^\s<>,;:"'()[\]]+@[^\s<>,;:"'()[\]]+\.[^\s<>,;:"'()[\]]+/;
const ADRES_RE_G = new RegExp(ADRES_RE.source, 'g');

function schoonNaam(naam: string) {
  return naam
    .replace(/[<>()[\]"]/g, ' ')
    .replace(/^[\s,;:\t-]+|[\s,;:\t-]+$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 200);
}

/** CSV naar rijen met cellen: scheidingsteken `;`, `,` of tab, aanhalingstekens, CRLF en BOM. */
export function parseCsv(tekst: string): string[][] {
  const bron = tekst.replace(/^﻿/, '');
  const eersteRegel = bron.split(/\r?\n/, 1)[0] ?? '';
  const sep = [';', '\t', ','].reduce((best, s) =>
    eersteRegel.split(s).length > eersteRegel.split(best).length ? s : best,
  );

  const rijen: string[][] = [];
  let rij: string[] = [];
  let cel = '';
  let inQuotes = false;
  for (let i = 0; i < bron.length; i++) {
    const c = bron[i];
    if (inQuotes) {
      if (c === '"' && bron[i + 1] === '"') {
        cel += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cel += c;
      }
    } else if (c === '"' && cel === '') {
      inQuotes = true;
    } else if (c === sep) {
      rij.push(cel);
      cel = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && bron[i + 1] === '\n') i++;
      rij.push(cel);
      rijen.push(rij);
      rij = [];
      cel = '';
    } else {
      cel += c;
    }
  }
  if (cel !== '' || rij.length) {
    rij.push(cel);
    rijen.push(rij);
  }
  return rijen.filter((r) => r.some((c) => c.trim()));
}

export type CsvResultaat = {
  rijen: ImportRij[];
  naamKolom: string | null;
  emailKolom: string;
  /** Rijen met tekst maar zonder herkenbaar adres. */
  zonderAdres: number;
};

/**
 * Zoekt de kolommen voor naam en e-mail; de rest wordt genegeerd. Met een kopregel op naam
 * (`naam`, `name`, `mail`, `e-mail`), anders de kolom met de meeste adressen en de eerste
 * andere kolom met tekst als naam.
 */
export function csvNaarRijen(tekst: string): CsvResultaat | null {
  const rijen = parseCsv(tekst);
  if (rijen.length === 0) return null;

  const kop = rijen[0].map((c) => c.trim().toLowerCase());
  const kopHeeftAdres = rijen[0].some((c) => ADRES_RE.test(c));
  let emailIdx = kopHeeftAdres ? -1 : kop.findIndex((c) => /mail/.test(c));
  let naamIdx = kopHeeftAdres ? -1 : kop.findIndex((c) => /^(naam|name|namen|names)\b/.test(c));
  const heeftKop = emailIdx >= 0;
  const data = heeftKop ? rijen.slice(1) : rijen;

  if (!heeftKop) {
    const breedte = Math.max(...data.map((r) => r.length));
    const telling = Array.from({ length: breedte }, (_, i) => data.filter((r) => ADRES_RE.test(r[i] ?? '')).length);
    emailIdx = telling.indexOf(Math.max(...telling));
    if (telling[emailIdx] === 0) return null;
    naamIdx = Array.from({ length: breedte }, (_, i) => i).find(
      (i) => i !== emailIdx && data.some((r) => (r[i] ?? '').trim() && !ADRES_RE.test(r[i] ?? '')),
    ) ?? -1;
  }

  let zonderAdres = 0;
  const resultaat: ImportRij[] = [];
  for (const r of data) {
    const adres = (r[emailIdx] ?? '').match(ADRES_RE)?.[0];
    if (!adres) {
      if (r.some((c) => c.trim())) zonderAdres++;
      continue;
    }
    const naam = naamIdx >= 0 ? schoonNaam(r[naamIdx] ?? '') : '';
    resultaat.push({ email: adres, ...(naam ? { naam } : {}) });
  }

  return {
    rijen: resultaat,
    naamKolom: naamIdx >= 0 ? (heeftKop ? rijen[0][naamIdx].trim() : `kolom ${naamIdx + 1}`) : null,
    emailKolom: heeftKop ? rijen[0][emailIdx].trim() : `kolom ${emailIdx + 1}`,
    zonderAdres,
  };
}

/**
 * Geplakte tekst: per regel alle adressen, met als naam wat er verder op de regel staat
 * ("Naam <adres>", "Naam;adres", "Naam<TAB>adres"). Meerdere adressen op één regel krijgen geen naam.
 * Regels zonder @ komen terug als `zonderAdres`.
 */
export function tekstNaarRijen(tekst: string): { rijen: ImportRij[]; zonderAdres: string[] } {
  const rijen: ImportRij[] = [];
  const zonderAdres: string[] = [];
  for (const regel of tekst.split(/\r?\n/)) {
    if (!regel.trim()) continue;
    const adressen = regel.match(ADRES_RE_G) ?? [];
    if (adressen.length === 0) {
      // Een regel met @ maar zonder geldig adres (bijv. "kapot@adres") wordt verderop als ongeldig gemeld.
      if (regel.includes('@')) {
        for (const woord of regel.split(/[\s,;]+/)) if (woord.includes('@')) rijen.push({ email: woord });
      } else {
        zonderAdres.push(regel.trim());
      }
      continue;
    }
    if (adressen.length === 1) {
      const naam = schoonNaam(regel.replace(adressen[0], ' '));
      rijen.push({ email: adressen[0], ...(naam ? { naam } : {}) });
    } else {
      for (const email of adressen) rijen.push({ email });
    }
  }
  return { rijen, zonderAdres };
}

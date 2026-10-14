import type { Pt } from './geo';

/** Uitkomst van één bron: bij uitval toont de pagina een melding i.p.v. te crashen. */
export type Result<T> = { ok: true; data: T; fetchedAt: string } | { ok: false };

export type Container = { id: string; fractie: string; rd: Pt };

export type Bijplaatsing = {
  datum: string;
  clusterId: string | null;
  straat: string | null;
  rd: Pt | null;
  grof: boolean;
  huisvuil: boolean;
  karton: boolean;
  zwerfafval: boolean;
  crow: string | null;
};

/** Eén regel uit de Afvalwijzer, samengevat per fractie. */
export type Regel = {
  fractie: string;
  code: string;
  instructie: string | null;
  dagen: string | null;
  buitenzetten: string | null;
  waar: string | null;
  opmerking: string | null;
  melding: string | null;
  url: string | null;
  /** Aantal woonadressen in de buurt waarvoor deze regel geldt. */
  adressen: number;
};

export type Recyclepunt = { naam: string; adres: string; postcode: string; url: string | null; rd: Pt; geenBedrijfsafval: boolean };

export type Melding = { categorie: string; categorieSlug: string; hoofdcategorie: string; datum: string; rd: Pt };

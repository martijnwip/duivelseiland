/**
 * Regels en links voor de geluidspagina. Gecontroleerd op 18 oktober 2026 tegen het Besluit
 * bouwwerken leefomgeving (art. 7.4, 7.17), de beleidsregels bouwlawaai Amsterdam (CVDR726068)
 * en de APV Amsterdam (art. 2.18A, 2.41, 5.5). Wijzigt er iets, pas het dan hier aan:
 * pagina, instructiekaart en briefjes lezen deze getallen.
 */
export const GECONTROLEERD = '2026-10-18';

/** Bedrijfsmatig bouwen en slopen: maandag t/m zaterdag, niet op zon- en feestdagen. */
export const BOUW = { van: 7, tot: 19 } as const;

/** Advies van de buurt, geen regel: lawaaiig werk (boren, schuren) liever niet vóór dit uur. */
export const ADVIES_LAWAAI_VANAF = 9;

/** Feestje: vanaf dit uur muziek zachter (advies; staat ook als standaard in het briefje). */
export const FEEST_ZACHTER_VANAF = 23;

/** Uur als tijd in de taal van de pagina: 7 → "07.00" (nl) of "07:00" (en). */
export const uur = (h: number, locale: string) => `${String(h).padStart(2, '0')}${locale === 'nl' ? '.' : ':'}00`;

/** Buurtfeest buiten met alleen een melding (APV 2.41). */
export const BUURTFEEST = { van: 9, tot: 23, maxBezoekers: 250, dbC: 75, meldenWeken: 2 } as const;

/** Bbl tabel 7.17: dagwaarde op de gevel en het maximum aantal dagen per bouwproject. */
export const DAGWAARDEN = [
  { db: '≤ 60', dagen: null },
  { db: '> 60', dagen: 50 },
  { db: '> 65', dagen: 30 },
  { db: '> 70', dagen: 15 },
  { db: '> 75', dagen: 5 },
  { db: '> 80', dagen: 0 },
] as const;

export const ONTHEFFING = { kostenPerNacht: 311.5, wekenVooraf: 4 } as const;

export const TELEFOON = {
  beterBuren: { label: '085 902 2810', href: 'tel:0859022810' },
  meldpunt: { label: '020 552 5000', href: 'tel:0205525000' },
  politie: { label: '0900 8844', href: 'tel:09008844' },
  nood: { label: '112', href: 'tel:112' },
} as const;

export const LINKS = {
  burenVerbouwen: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bouwen-verbouwen/mijn-buren-gaan-verbouwen/',
  vertelBuren: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bouwen-verbouwen/omgevingsvergunning/verbouwen-vertel-buren/',
  ontheffing: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bouwen-verbouwen/geluidsontheffing-bouw-aanvragen/',
  melding: 'https://www.amsterdam.nl/leefomgeving/een-melding-doen/',
  meldpunt: 'https://www.amsterdam.nl/zorg-en-ondersteuning/wmo/overlast-intimidatie-buurtbewoners/',
  horeca: 'https://www.amsterdam.nl/leefomgeving/een-melding-doen/overlast-melden-horeca-bedrijven/',
  evenementMelden: 'https://www.amsterdam.nl/ondernemen/evenement-organiseren/evenement-melden/',
  beterBuren: 'https://www.beterburen.nl/een-melding-doen/',
  omgevingsalert: 'https://www.omgevingsalert.nl/',
  juridischLoket: 'https://www.juridischloket.nl/',
} as const;

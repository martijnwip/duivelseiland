/** Fasen van een activiteit; zie docs/brief-activiteiten.md, sectie 3. */
export const FASES = ['onbevestigd', 'ingediend', 'afgewezen', 'goedgekeurd', 'gaat-door', 'afgelast', 'afgelopen'] as const;
export type Fase = (typeof FASES)[number];

export const FASE_LABELS: Record<Fase, string> = {
  onbevestigd: 'Wacht op e-mailbevestiging',
  ingediend: 'Wacht op goedkeuring',
  afgewezen: 'Afgewezen',
  goedgekeurd: 'Goedgekeurd: online, nog niet definitief',
  'gaat-door': 'Gaat door (besloten door organisator)',
  afgelast: 'Afgelast',
  afgelopen: 'Afgelopen',
};

/** Fasen die bezoekers te zien krijgen. Afgelopen alleen als archief, zonder inschrijfformulier. */
export const PUBLIEKE_FASES: Fase[] = ['goedgekeurd', 'gaat-door', 'afgelopen'];
/** Fasen waarin je je kunt inschrijven en de organisator berichten kan sturen. */
export const ACTIEVE_FASES: Fase[] = ['goedgekeurd', 'gaat-door'];
/** Ideeën die nog bij de aanvrager of de redactie liggen. */
export const OPEN_IDEE_FASES: Fase[] = ['onbevestigd', 'ingediend'];

/** Fasen die een organisator in /admin kan kiezen. */
export const ORGANISATOR_FASES: Fase[] = ['goedgekeurd', 'gaat-door', 'afgelast', 'afgelopen'];
/** Overgangen die een organisator zelf mag maken. De redactie mag alles. */
export const ORGANISATOR_OVERGANGEN: Partial<Record<Fase, Fase[]>> = {
  goedgekeurd: ['gaat-door', 'afgelast', 'afgelopen'],
  'gaat-door': ['goedgekeurd', 'afgelast', 'afgelopen'],
};

// Binnen deze tijd geen tweede mail naar hetzelfde adres (zelfde rem als de nieuwsbrief).
export const MAIL_INTERVAL_MS = 2 * 60 * 1000;
export const MAX_OPEN_IDEEEN_PER_ADRES = 2;
export const MAX_BERICHTEN_PER_WEEK = 3;
// Rem op het Resend-quotum (gratis: 100 per dag); berichten van organisatoren mogen samen hier niet boven.
export const BERICHTEN_DAGLIMIET = Number(process.env.ACTIVITEITEN_MAIL_DAGLIMIET) || 80;
export const MAX_AFBEELDING_BYTES = 4 * 1024 * 1024;
export const AFBEELDING_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Paden onder /activiteiten die geen slug mogen zijn. */
export const GERESERVEERDE_SLUGS = ['aanmelden', 'idee', 'inschrijving'];

export function recentGemaild(laatsteMailOp: string | null | undefined) {
  return Boolean(laatsteMailOp) && Date.now() - new Date(laatsteMailOp!).getTime() < MAIL_INTERVAL_MS;
}

export function voornaam(naam: string | null | undefined) {
  return (naam ?? '').trim().split(/\s+/)[0] ?? '';
}

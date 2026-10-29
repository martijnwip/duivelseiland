/** Moderatie van een vakman die een buur via /vaklui/aanmelden heeft aangemeld. Leeg: door de redactie aangemaakt. */
export const MODERATIE = ['ingediend', 'afgewezen', 'goedgekeurd'] as const;
export type Moderatie = (typeof MODERATIE)[number];

export const MODERATIE_LABELS: Record<Moderatie, string> = {
  ingediend: 'Wacht op goedkeuring',
  afgewezen: 'Afgekeurd',
  goedgekeurd: 'Goedgekeurd',
};

/** Gedeeld door de collection en het aanmeldformulier. */
export const TELEFOON = /^[0-9+\-()\s]{6,20}$/;
export const WEBSITE = /^https?:\/\/\S+\.\S+$/;

/** Hooguit zoveel aanmeldingen per adres die nog op de redactie wachten. */
export const MAX_OPEN_AANMELDINGEN_PER_ADRES = 3;

/** Paden onder /vaklui die geen vakman zijn. */
export const GERESERVEERDE_SLUGS = ['aanmelden', 'aanmelding'];

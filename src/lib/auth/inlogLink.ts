/**
 * Inloglinks voor /admin gaan niet rechtstreeks naar het verify-endpoint van better-auth, maar naar
 * /inloggen met een knop. Het token werkt maar één keer, en een GET op de verify-link verbruikt het: een
 * mailscanner, Chrome dat een geplakte URL al vooraf laadt, of een andere browser die de link eerst
 * opent, maakte de link onbruikbaar ("invalid token"). Formulieren worden niet vooraf verstuurd, dus
 * het token wordt pas bij de klik gebruikt. Zelfde idee als de buurtpas (*Activeer buurtpas*).
 */

/** Verify-endpoint van de magic-link-plugin (better-auth onder /api/auth). */
export const VERIFY_PAD = '/api/auth/magic-link/verify';

/** De bevestigingspagina, in het Nederlands (zonder taalprefix), net als /admin. */
export const INLOGGEN_PAD = '/inloggen';

/** Queryparameters die de verify-link meekrijgt en die de knop weer doorgeeft. */
export const VERIFY_PARAMS = ['token', 'callbackURL', 'errorCallbackURL', 'newUserCallbackURL'] as const;

/** Verify-link van better-auth → link naar /inloggen met dezelfde parameters (zelfde domein). */
export function bevestigingsLink(verifyUrl: string): string {
  const url = new URL(verifyUrl);
  if (url.pathname !== VERIFY_PAD) return verifyUrl;
  const doel = new URL(INLOGGEN_PAD, url.origin);
  for (const naam of VERIFY_PARAMS) {
    const waarde = url.searchParams.get(naam);
    if (waarde) doel.searchParams.set(naam, waarde);
  }
  return doel.toString();
}

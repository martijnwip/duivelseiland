import type { GlobalAfterChangeHook } from 'payload';
import { revalidatePath } from 'next/cache';

/**
 * Site-instellingen (intro, menu, footer) staan op elke pagina, en de pagina's
 * worden bij de build statisch gegenereerd; dus de hele site opnieuw valideren.
 * Buiten een Next.js-request (seeds, scripts) is er niets te valideren.
 */
export const revalidateSite: GlobalAfterChangeHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc;

  try {
    revalidatePath('/', 'layout');
  } catch {
    // Geen actieve Next.js-request context.
  }
  return doc;
};

import { revalidatePath } from 'next/cache';
import { routing } from '../../i18n/routing';

/**
 * Het geschiedenisverhaal (global) en de historische foto's die erin staan
 * verschijnen op /geschiedenis. Buiten een Next.js-request (seeds, scripts)
 * is er niets te valideren.
 */
export function revalidateGeschiedenis({ req }: { req?: { context?: Record<string, unknown> } } = {}) {
  if (req?.context?.disableRevalidate) return;
  try {
    for (const locale of routing.locales) {
      revalidatePath(locale === routing.defaultLocale ? '/geschiedenis' : `/${locale}/geschiedenis`);
    }
  } catch {
    // Geen actieve Next.js-request context.
  }
}

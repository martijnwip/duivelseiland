import { revalidatePath } from 'next/cache';
import { routing } from '../../i18n/routing';

/**
 * revalidatePath needs an active Next.js request context (works from
 * /admin and /api), which isn't present when the Local API is invoked
 * from a standalone script (e.g. scripts/seed-hero-slides.ts).
 */
export function revalidateHome() {
  try {
    for (const locale of routing.locales) {
      revalidatePath(locale === routing.defaultLocale ? '/' : `/${locale}`);
    }
  } catch {
    // Not running inside a Next.js request — nothing to revalidate.
  }
}

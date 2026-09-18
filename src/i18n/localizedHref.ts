import { routing } from './routing';

/**
 * Prefixes `path` with the locale segment, matching routing.ts's
 * `localePrefix: 'as-needed'` (default locale has no prefix). Used instead of
 * next-intl's `Link` for plain next/link hrefs — next-intl's Link needs a
 * NextIntlClientProvider, which this app doesn't set up.
 */
export function localizedHref(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

/**
 * Strips a leading `/xx` locale segment from `pathname` if present, so the
 * remaining path can be re-prefixed for a different locale via
 * `localizedHref`. No-op if `pathname` has no locale prefix (e.g. the
 * default locale, which isn't prefixed).
 */
export function stripLocalePrefix(pathname: string, locales: readonly string[]): string {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || '/';
    }
  }
  return pathname;
}

import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Paden met een punt (bv. /favicon.ico) slaat de middleware over en komen als "locale" binnen;
  // val dan terug op de standaardtaal, zodat de layout netjes een 404 geeft in plaats van te crashen.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

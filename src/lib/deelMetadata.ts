import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { localizedHref } from '@/i18n/localizedHref';

/** Achter elke titel (template in de layout), behalve als de titel dan langer wordt dan Google toont. */
export const TITEL_ACHTERVOEGSEL = ' | Duivelseiland';
const MAX_TITEL = 60;

/**
 * Canonical en hreflang voor een pagina die in beide talen op hetzelfde pad staat (`pad` zonder
 * taalvoorvoegsel, bv. `/geluid` of `/vaklui/bouw-chickie`; de homepage is `''`). Relatief: Next
 * maakt ze absoluut met `metadataBase`. x-default wijst naar de Nederlandse versie.
 */
export function taalAlternatieven(locale: string, pad: string): NonNullable<Metadata['alternates']> {
  const url = (l: string) => localizedHref(l, pad) || '/';
  return {
    canonical: url(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, url(l)])),
      'x-default': url(routing.defaultLocale),
    },
  };
}

/**
 * Vult de metadata van een pagina aan met wat zoekmachines, WhatsApp en sociale media nodig hebben:
 * canonical en hreflang (`pad`), og:title, og:description, twitter-card en een absolute basis-URL voor
 * de deelafbeelding (opengraph-image.tsx naast de pagina).
 *
 * De titel van het tabblad krijgt via de template in de layout " | Duivelseiland" erachter; met
 * `volledigeTitel`, of als de titel met toevoeging langer wordt dan ~60 tekens (Google kapt af), staat
 * `title` er zonder toevoeging. `deelTitel` is de titel in het linkvoorbeeld
 * (standaard `title`, zonder toevoeging).
 *
 * `canonicalPad`: staat dezelfde inhoud ook op een andere pagina (de hoofdversie), dan wijst de canonical
 * daarheen en vervallen de hreflang-alternatieven van deze pagina (die zou Google anders tegenspreken).
 */
export function metDeelinfo(
  locale: string,
  meta: {
    title: string;
    pad: string;
    canonicalPad?: string;
    description?: string | null;
    deelTitel?: string;
    volledigeTitel?: boolean;
    type?: 'website' | 'article';
  },
): Metadata {
  const deelTitel = meta.deelTitel ?? meta.title;
  const zonderAchtervoegsel = meta.volledigeTitel || meta.title.length + TITEL_ACHTERVOEGSEL.length > MAX_TITEL;
  const description = meta.description?.trim() || undefined;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  return {
    title: zonderAchtervoegsel ? { absolute: meta.title } : meta.title,
    description,
    ...(serverUrl && URL.canParse(serverUrl) ? { metadataBase: new URL(serverUrl) } : {}),
    alternates: meta.canonicalPad
      ? { canonical: localizedHref(locale, meta.canonicalPad) || '/' }
      : taalAlternatieven(locale, meta.pad),
    openGraph: {
      type: meta.type ?? 'website',
      siteName: 'Duivelseiland',
      locale: locale === 'en' ? 'en_GB' : 'nl_NL',
      title: deelTitel,
      description,
    },
    twitter: { card: 'summary_large_image', title: deelTitel, description },
  };
}

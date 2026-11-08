import type { Metadata } from 'next';

/**
 * Vult de metadata van een pagina aan met wat WhatsApp en sociale media bij een gedeelde link tonen:
 * og:title, og:description, twitter-card en een absolute basis-URL voor de deelafbeelding
 * (opengraph-image.tsx naast de pagina). De titel van het tabblad blijft zoals de pagina hem opgeeft;
 * `deelTitel` is de titel in het linkvoorbeeld (standaard dezelfde).
 */
export function metDeelinfo(
  locale: string,
  meta: { title: string; description?: string | null; deelTitel?: string; type?: 'website' | 'article' },
): Metadata {
  const deelTitel = meta.deelTitel ?? meta.title;
  const description = meta.description?.trim() || undefined;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  return {
    title: meta.title,
    description,
    ...(serverUrl && URL.canParse(serverUrl) ? { metadataBase: new URL(serverUrl) } : {}),
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

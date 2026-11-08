import { paginaAfbeelding } from '@/components/deel/paginaAfbeelding';

/** Deelafbeelding (WhatsApp, sociale media), zie src/components/deel/deelKaart.tsx. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'Duivelseiland';

export default async function Image({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  return paginaAfbeelding(params, { ns: 'pages.overDeNaam' });
}

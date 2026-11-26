import { paginaAfbeelding } from '@/components/deel/paginaAfbeelding';

/** Deelafbeelding (WhatsApp, sociale media), zie src/components/deel/deelKaart.tsx: de Pieter Baststraat in 1968. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'Duivelseiland, toen en nu';

export default async function Image({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  return paginaAfbeelding(params, {
    ns: 'pages.toenEnNu',
    regels: ['eyebrow'],
    foto: { pad: 'toen-en-nu/05-pieter-baststraat/05-oneven-zijde-1968.jpg' },
  });
}

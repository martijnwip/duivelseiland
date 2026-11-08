import { deelAfbeelding } from '@/components/deel/deelAfbeelding';

/** Deelafbeelding (WhatsApp, sociale media) met titel en de belangrijkste info, zie src/lib/deelinfo.ts. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const alt = 'Duivelseiland';

// Next 15 geeft params als object, Next 16 als Promise; await werkt voor allebei.
export default async function Image({
  params,
}: {
  params: { locale: string; slug: string } | Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return deelAfbeelding('geschiedenis', slug, locale === 'en' ? 'en' : 'nl');
}

import type { Metadata } from 'next';
import { getPayload, type Where } from 'payload';
import config from '@payload-config';

/** Gepubliceerd en niet "Alleen voor de buurt": wat een zoekmachine van een contentcollectie te zien krijgt. */
export const PUBLIEK_CONTENT: Where = {
  and: [
    { status: { equals: 'published' } },
    { or: [{ alleenBuurt: { equals: false } }, { alleenBuurt: { exists: false } }] },
  ],
};

/** Niet in zoekmachines, links wel volgen. */
export const NOINDEX: NonNullable<Metadata['robots']> = { index: false, follow: true };

/** Overzichten die (nog) leeg kunnen zijn: zonder openbare items noindex en niet in de sitemap. */
export type OverzichtCollectie = 'interviews' | 'duivelse-kunst';

export async function heeftOpenbareItems(collection: OverzichtCollectie): Promise<boolean> {
  const payload = await getPayload({ config });
  const { totalDocs } = await payload.count({ collection, where: PUBLIEK_CONTENT });
  return totalDocs > 0;
}

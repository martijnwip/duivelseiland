import type { CollectionSlug, Payload } from 'payload';

/** Kleine letters, cijfers en streepjes; accenten vallen weg. "Bouw Chickie" → "bouw-chickie". */
export function slugify(tekst: string) {
  return tekst
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export const SLUG_PATROON = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Eerste vrije slug op basis van `tekst`: "bouw-chickie", anders "bouw-chickie-2" enzovoort. */
export async function uniekeSlug(
  payload: Payload,
  collection: CollectionSlug,
  tekst: string,
  { gereserveerd = [], fallback }: { gereserveerd?: readonly string[]; fallback: string },
) {
  const basis = slugify(tekst) || fallback;
  for (let i = 1; i < 100; i++) {
    const kandidaat = i === 1 ? basis : `${basis}-${i}`;
    if (gereserveerd.includes(kandidaat)) continue;
    const { totalDocs } = await payload.count({ collection, where: { slug: { equals: kandidaat } } });
    if (totalDocs === 0) return kandidaat;
  }
  return `${basis}-${Date.now()}`;
}

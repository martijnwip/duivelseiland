import type { Payload } from 'payload';
import { GERESERVEERDE_SLUGS } from './constants';

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

/** Voorstel voor een unieke slug; de redactie kan hem bij de moderatie nog aanpassen. */
export async function uniekeSlug(payload: Payload, titel: string) {
  const basis = slugify(titel) || 'activiteit';
  for (let i = 1; i < 100; i++) {
    const kandidaat = i === 1 ? basis : `${basis}-${i}`;
    if (GERESERVEERDE_SLUGS.includes(kandidaat)) continue;
    const { totalDocs } = await payload.count({ collection: 'activiteiten', where: { slug: { equals: kandidaat } } });
    if (totalDocs === 0) return kandidaat;
  }
  return `${basis}-${Date.now()}`;
}

export { formatDatumTijd } from '@/lib/activiteiten/datum';

export function mediaUrl(image: unknown, size: 'card' | 'hero') {
  if (!image || typeof image !== 'object') return null;
  const m = image as { url?: string | null; alt?: string | null; sizes?: Record<string, { url?: string | null } | undefined> };
  return { url: m.sizes?.[size]?.url ?? m.url ?? null, alt: m.alt ?? '' };
}

/** Label op de site: een goedgekeurde activiteit met gesloten aanmelding heet "Aanmelding gesloten". */
export function faseLabel(doc: { fase: string; inschrijving?: string | null }): 'goedgekeurd' | 'gesloten' | 'gaat-door' | 'afgelopen' {
  if (doc.fase === 'goedgekeurd' && doc.inschrijving === 'gesloten') return 'gesloten';
  return doc.fase as 'goedgekeurd' | 'gaat-door' | 'afgelopen';
}

const TZ = 'Europe/Amsterdam';

export function formatDatum(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
}

export function formatDatumTijd(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  });
}

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

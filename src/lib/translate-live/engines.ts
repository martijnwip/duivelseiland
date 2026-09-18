const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const MYMEMORY_MAX_CHARS = 500;

// MyMemory is a translation-memory service: it returns the best-matching
// previously-translated segment from its corpus, not a pure NMT engine.
// For short/generic fragments (common in Lexical rich text, which splits a
// sentence into one node per formatting run) a low-confidence fuzzy match
// can be completely unrelated to the input. Its response includes a
// `match` quality score (0-1) per result; below this threshold we treat
// the result as untrustworthy and fail soft rather than write garbage.
// Confirmed this session: "Dit weekend is er een " once matched at 0.59
// ("Ook is er een" -> "There is a TV, radio and CD-player.", nonsense),
// while a later identical query matched at 0.85 with the correct MT result.
const MIN_MATCH_QUALITY = 0.7;

/**
 * Translate NL -> EN via MyMemory (free, no account/key needed for light
 * use). Never throws; returns null if the request fails, the text is too
 * long for a single request, or the best match's confidence is too low to
 * trust (see MIN_MATCH_QUALITY above) — callers should treat null as "leave
 * empty for manual translation", matching translate/translate.py's
 * fail-soft, per-field-isolated behavior.
 */
export async function translateText(text: string): Promise<string | null> {
  if (!text || !text.trim()) return text;
  if (text.length > MYMEMORY_MAX_CHARS) {
    console.warn(`[translate-live] tekst te lang voor MyMemory (${text.length} tekens), overgeslagen.`);
    return null;
  }

  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=nl-NL|en-GB`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    const match = json?.responseData?.match;

    if (json?.responseStatus !== 200 || typeof translated !== 'string') {
      throw new Error(`MyMemory bad response: ${JSON.stringify(json).slice(0, 200)}`);
    }
    if (typeof match === 'number' && match < MIN_MATCH_QUALITY) {
      console.warn(`[translate-live] MyMemory match te laag (${match}) voor "${text.slice(0, 60)}", overgeslagen.`);
      return null;
    }
    return translated;
  } catch (err) {
    console.warn('[translate-live] MyMemory mislukt:', err);
    return null;
  }
}

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const MYMEMORY_MAX_CHARS = 500;
// Target size per chunk when splitting long text, kept safely under
// MYMEMORY_MAX_CHARS so sentence-boundary splitting never produces a chunk
// that itself exceeds the hard limit.
const CHUNK_TARGET_CHARS = 450;

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
 * Splits a newline-free `text` into chunks no longer than `maxLen`,
 * breaking on sentence boundaries where possible so translation quality
 * isn't hurt by cutting mid-sentence. Falls back to a hard word-boundary
 * split for any single "sentence" that alone exceeds maxLen.
 */
function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current) chunks.push(current);
    current = '';
  };

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      // A single sentence is itself too long - hard-split on words.
      pushCurrent();
      const words = sentence.split(' ');
      let wordChunk = '';
      for (const word of words) {
        const candidate = wordChunk ? `${wordChunk} ${word}` : word;
        if (candidate.length > maxLen) {
          if (wordChunk) chunks.push(wordChunk);
          wordChunk = word;
        } else {
          wordChunk = candidate;
        }
      }
      if (wordChunk) chunks.push(wordChunk);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen) {
      pushCurrent();
      current = sentence;
    } else {
      current = candidate;
    }
  }
  pushCurrent();

  return chunks;
}

/** Translates a single chunk (already guaranteed <= MYMEMORY_MAX_CHARS). */
async function translateChunk(text: string): Promise<string | null> {
  if (!text || !text.trim()) return text;
  if (text.length > MYMEMORY_MAX_CHARS) {
    console.warn(`[translate-live] chunk toch te lang voor MyMemory (${text.length} tekens), overgeslagen.`);
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

/**
 * Translates one newline-free segment, chunking it if it exceeds
 * MyMemory's per-request limit and rejoining the chunk results with a
 * single space. Returns null if any chunk fails.
 */
async function translateSegment(text: string): Promise<string | null> {
  const chunks = splitIntoChunks(text, CHUNK_TARGET_CHARS);
  if (chunks.length === 1) return translateChunk(chunks[0]);

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    const result = await translateChunk(chunk);
    if (result === null) return null;
    translatedChunks.push(result);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return translatedChunks.join(' ');
}

/**
 * Translate NL -> EN via MyMemory (free, no account/key needed for light
 * use). Text longer than MyMemory's ~500-character-per-request limit is
 * automatically split into sentence-bounded chunks, translated separately,
 * and rejoined. Never throws; returns null if any chunk fails (network
 * error, bad response, or a too-low-confidence match) — callers should
 * treat null as "leave empty for manual translation", matching
 * translate/translate.py's fail-soft, per-field-isolated behavior. A
 * partially-translated mixed-language result is considered worse than
 * leaving the whole field untouched, so one failed chunk fails the whole
 * text rather than returning a partial join.
 *
 * Plain-text fields (e.g. a `textarea`) can contain meaningful newlines -
 * single line breaks or blank-line paragraph separators - which are NOT
 * translatable content. The text is first split on newline runs, each
 * newline run is preserved verbatim, and only the text between them is
 * chunked/translated/rejoined - so paragraph structure survives even when
 * chunking kicks in. (Confirmed broken before this fix: chunking's
 * sentence-boundary split treats "\n\n" as ordinary whitespace and the
 * chunk rejoin used a single space, silently collapsing every paragraph
 * break in text over ~450 characters.)
 */
export async function translateText(text: string): Promise<string | null> {
  if (!text || !text.trim()) return text;

  const parts = text.split(/(\n+)/);
  if (parts.length === 1) return translateSegment(text);

  const translatedParts: string[] = [];
  for (const part of parts) {
    if (part === '' || /^\n+$/.test(part)) {
      translatedParts.push(part); // newline run or empty gap - preserve verbatim
      continue;
    }
    const translated = await translateSegment(part);
    if (translated === null) return null;
    translatedParts.push(translated);
  }
  return translatedParts.join('');
}

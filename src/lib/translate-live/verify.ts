const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone';

type NoulAnswer = { type: 'noul'; noul: number };

async function askNoul(state: unknown, questions: Record<string, { instructions: string; criteria?: unknown }>) {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) throw new Error('TYPESAFE_API_KEY ontbreekt');

  const res = await fetch(TYPESAFE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state,
      model: 'jev-latest',
      questions: Object.fromEntries(Object.entries(questions).map(([id, q]) => [id, { type: 'noul', ...q }])),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`TypeSafe HTTP ${res.status}`);

  const json = (await res.json()) as { answers: Record<string, NoulAnswer> };
  return Object.fromEntries(Object.entries(json.answers).map(([id, a]) => [id, a.noul]));
}

export type TranslationJudgment = {
  /** Kans (0-1) dat de Engelse tekst dezelfde betekenis heeft als de Nederlandse. */
  faithful: number;
  /** Kans (0-1) dat het fragment ongewijzigd moet blijven (eigennaam, adres, code). */
  keepAsIs: number;
};

/**
 * Prototype: beoordeelt een NL -> EN-vertaling. Beide vragen delen dezelfde state en
 * draaien parallel in één request. Geeft null bij een fout, zodat de aanroeper kan
 * terugvallen op het bestaande gedrag.
 */
export async function judgeTranslation(nl: string, en: string): Promise<TranslationJudgment | null> {
  try {
    const answers = await askNoul(
      { nl, en },
      {
        faithful: {
          instructions:
            'Does the English text in `en` convey the same meaning as the Dutch text in `nl`, ' +
            'without unrelated, added or missing content?',
          criteria: {
            true: 'The English is an accurate translation, even if the wording differs.',
            false: 'The English says something different, is unrelated, is cut off, or is still mostly Dutch.',
          },
        },
        keepAsIs: {
          instructions:
            'Should the Dutch text in `nl` stay unchanged in an English version of the page, ' +
            'because it is only a proper name, street address, number, URL or code?',
          criteria: {
            true: 'Only names, addresses, numbers, URLs or codes; nothing that has an English equivalent.',
            false: 'Contains ordinary Dutch words or sentences that should be translated.',
          },
        },
      },
    );
    return { faithful: answers.faithful, keepAsIs: answers.keepAsIs };
  } catch (err) {
    console.warn('[translate-live] beoordelen van vertaling mislukt:', err);
    return null;
  }
}

/** Schakelaar: TRANSLATION_CHECK=on (en TYPESAFE_API_KEY) zet de vertaalcontrole aan. Standaard uit. */
export const translationCheckEnabled = (): boolean =>
  process.env.TRANSLATION_CHECK === 'on' && Boolean(process.env.TYPESAFE_API_KEY);

// Drempels uit scripts/audit-translations.ts (24 bestaande paren); nog weinig data.
const REJECT_BELOW = 0.5;
const REVIEW_BELOW = 0.8;
const KEEP_AT_OR_ABOVE = 0.5;
// Langere teksten slaan we over i.p.v. af te kappen: een afgekapt paar is niet vergelijkbaar.
const MAX_CHECK_CHARS = 2000;

/**
 * Past de vertaalcontrole toe op een engine-resultaat. Geeft de tekst die bewaard moet worden:
 * het origineel voor eigennamen/adressen, `null` voor een onbetrouwbare vertaling, anders de
 * vertaling zelf. Bij een fout of een te lange tekst blijft de vertaling ongewijzigd staan.
 */
export async function checkTranslation(nl: string, en: string): Promise<string | null> {
  if (!/\p{L}/u.test(nl) || nl.length > MAX_CHECK_CHARS || en.length > MAX_CHECK_CHARS) return en;

  const judgment = await judgeTranslation(nl, en);
  if (!judgment) return en;

  if (judgment.keepAsIs >= KEEP_AT_OR_ABOVE) return nl;
  if (judgment.faithful < REJECT_BELOW) {
    console.warn(`[translate-live] vertaling afgewezen (${judgment.faithful.toFixed(2)}): "${nl.slice(0, 60)}"`);
    return null;
  }
  if (judgment.faithful < REVIEW_BELOW) {
    console.warn(`[translate-live] vertaling controleren (${judgment.faithful.toFixed(2)}): "${nl.slice(0, 60)}"`);
  }
  return en;
}

import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { findTranslatableLeaves } from '../src/lib/translate-live/field-walker';

// Laat de Nederlandse teksten van de site nakijken door Loes, een lokaal model
// via Ollama. Alleen-lezen: het script schrijft een rapport en past niets aan.
//
// Gebruik:
//   bun run taalcheck                 messages/nl.json + CMS (lokale database)
//   bun run taalcheck:prod            idem, CMS-teksten van productie (alleen lezen)
//   bun run taalcheck --alleen messages|cms
//   bun run taalcheck --snel          zonder denken: ~10x sneller, maar mist meer en
//                                     meldt vaker goede tekst als fout
//   bun run taalcheck --limiet 20     alleen de eerste 20 porties (proberen)
//   bun run taalcheck --opnieuw       cache negeren, alles opnieuw nakijken
//
// Vereist: Ollama met het model uit TAALCHECK_MODEL (standaard Loes, zie MODEL).
// Gecontroleerde teksten gaan in data/taalcheck-cache.json, zodat een volgende
// ronde alleen nieuwe of gewijzigde teksten nakijkt en een afgebroken ronde
// verdergaat waar hij was.

const MODEL = process.env.TAALCHECK_MODEL ?? 'hf.co/mradermacher/loes-qwen3.8-27b-GGUF:Q4_K_M';
const HOST = (process.env.OLLAMA_HOST ?? 'localhost:11434').replace(/^(?!https?:\/\/)/, 'http://');
const CACHE_PATH = 'data/taalcheck-cache.json';
const PORTIE_TEKENS = 1200;
const MAX_MINUTEN = 10;
const MAX_TOKENS = 6000;

const args = process.argv.slice(2);
const vlag = (naam: string) => args.includes(`--${naam}`);
const waarde = (naam: string) => {
  const i = args.indexOf(`--${naam}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const snel = vlag('snel');
const alleen = waarde('alleen') as 'messages' | 'cms' | undefined;
const limiet = Number(waarde('limiet') ?? Infinity);

type Tekst = { waar: string; tekst: string };
type Melding = { fout: string; correctie: string; reden: string };
type Cache = Record<string, Melding[]>; // sleutel: hash van tekst + modus

// ---------- teksten verzamelen ----------

function uitMessages(obj: unknown, pad: string[] = []): Tekst[] {
  if (typeof obj === 'string') return [{ waar: `messages/nl.json › ${pad.join('.')}`, tekst: obj }];
  if (obj && typeof obj === 'object')
    return Object.entries(obj).flatMap(([k, v]) => uitMessages(v, [...pad, k]));
  return [];
}

const BLOKKEN = new Set(['paragraph', 'heading', 'listitem', 'quote']);

/** Eén tekst per alinea, kop of lijstitem, zodat meldingen naar een plek wijzen. */
function lexicalAlineas(node: any): string[] {
  if (!node || typeof node !== 'object') return [];
  if (BLOKKEN.has(node.type)) {
    const plat = (n: any): string =>
      typeof n?.text === 'string' ? n.text : Array.isArray(n?.children) ? n.children.map(plat).join('') : '';
    const eigen = plat({ children: (node.children ?? []).filter((c: any) => c?.type !== 'list') });
    const genest = (node.children ?? []).filter((c: any) => c?.type === 'list').flatMap(lexicalAlineas);
    return [eigen, ...genest];
  }
  return (Array.isArray(node.children) ? node.children : []).flatMap(lexicalAlineas);
}

async function uitCms(): Promise<Tekst[]> {
  const { getClient } = await import('./lib/payload-client');
  const payload = await getClient();
  const doelen = [
    ...payload.config.collections.map((c) => ({ soort: 'collection' as const, slug: c.slug, fields: c.fields })),
    ...payload.config.globals.map((g) => ({ soort: 'global' as const, slug: g.slug, fields: g.fields })),
  ];
  const uit: Tekst[] = [];
  for (const d of doelen) {
    const docs =
      d.soort === 'collection'
        ? (await payload.find({ collection: d.slug as any, locale: 'all', overrideAccess: true, limit: 0, depth: 0 })).docs
        : [await payload.findGlobal({ slug: d.slug as any, locale: 'all', overrideAccess: true, depth: 0 })];
    for (const doc of docs as any[]) {
      const naam = doc.slug ?? doc.id ?? '';
      for (const blad of findTranslatableLeaves(d.fields, doc)) {
        const waar = `${d.slug}${naam !== '' ? `/${naam}` : ''} › ${blad.path.join('.')}`;
        if (typeof blad.nl === 'string') uit.push({ waar, tekst: blad.nl });
        else
          lexicalAlineas((blad.nl as any)?.root).forEach((t, i) => uit.push({ waar: `${waar} #${i + 1}`, tekst: t }));
      }
    }
  }
  return uit;
}

// ---------- nakijken ----------

const PROMPT = `Je bent corrector voor een Nederlandse buurtwebsite. Hieronder staan genummerde teksten.
Zoek alleen echte taalfouten: spelling, d/t, grammatica (ook hun/hen, groter dan/als), dubbele woorden.
Verander geen stijl, toon of inhoud. Negeer {plaatshouders}, HTML-tags en eigennamen.
Geef per fout precies één regel in deze vorm:
[nummer] fout → correctie (korte reden)
Neem in "fout" letterlijk het stukje tekst over. Geen fouten? Antwoord dan alleen: GEEN FOUTEN`;

async function vraagLoes(teksten: string[]): Promise<string> {
  const lijst = teksten.map((t, i) => `[${i + 1}] ${t}`).join('\n');
  for (let poging = 1; poging <= 2; poging++) {
    const res = await fetch(`${HOST}/api/chat`, {
      method: 'POST',
      // Bun breekt fetch standaard na 5 minuten af; een portie met denken kan langer duren.
      ...({ timeout: false } as object),
      signal: AbortSignal.timeout(MAX_MINUTEN * 60_000),
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        think: !snel,
        // Begrenst denken + antwoord, zodat een denklus niet eindeloos doorgaat.
        options: { temperature: 0.2, num_predict: MAX_TOKENS },
        messages: [{ role: 'user', content: `${PROMPT}\n\n${lijst}` }],
      }),
    });
    if (!res.ok) throw new Error(`Ollama gaf ${res.status}: ${await res.text()}`);
    const antwoord = ((await res.json()) as { message?: { content?: string } }).message?.content?.trim() ?? '';
    // Met denken aan blijft het antwoord soms leeg; dan één keer opnieuw.
    if (antwoord) return antwoord;
  }
  throw new Error('twee keer een leeg antwoord');
}

const REGEL = /^\s*\[(\d+)\]\s*(.+?)\s*(?:→|->)\s*(.+?)\s*(?:\((.*)\))?\s*$/;

function leesMeldingen(antwoord: string, teksten: string[]): Melding[][] {
  const perTekst: Melding[][] = teksten.map(() => []);
  for (const regel of antwoord.split('\n')) {
    const m = regel.match(REGEL);
    if (!m) continue;
    const i = Number(m[1]) - 1;
    const fout = m[2].replace(/^["'“]|["'”]$/g, '');
    const correctie = m[3].replace(/^["'“]|["'”]$/g, '');
    // Alleen meldingen die echt in de tekst staan en iets veranderen.
    if (!teksten[i]?.includes(fout) || fout === correctie) continue;
    perTekst[i].push({ fout, correctie, reden: m[4] ?? '' });
  }
  return perTekst;
}

function porties(teksten: Tekst[]): Tekst[][] {
  const uit: Tekst[][] = [];
  let huidig: Tekst[] = [];
  let tekens = 0;
  for (const t of teksten) {
    if (huidig.length && tekens + t.tekst.length > PORTIE_TEKENS) {
      uit.push(huidig);
      huidig = [];
      tekens = 0;
    }
    huidig.push(t);
    tekens += t.tekst.length;
  }
  if (huidig.length) uit.push(huidig);
  return uit;
}

// ---------- rapport ----------

function rapport(teksten: Tekst[], cache: Cache, sleutel: (t: string) => string, overgeslagen: number): string {
  const metFouten = teksten
    .map((t) => ({ ...t, meldingen: cache[sleutel(t.tekst)] ?? [] }))
    .filter((t) => t.meldingen.length);
  const regels = [
    `# Taalcheck ${new Date().toLocaleString('nl-NL')}`,
    '',
    `Model: \`${MODEL}\`, denken ${snel ? 'uit' : 'aan'}. ${teksten.length} teksten, ` +
      `${metFouten.length} met mogelijke fouten` +
      (overgeslagen ? `, ${overgeslagen} nog niet nagekeken (--limiet of overgeslagen)` : '') +
      '.',
    '',
    'Loes mist sommige fouten (vooral hun/hen) en kan zich vergissen. Controleer elke melding zelf.',
  ];
  for (const t of metFouten) {
    regels.push('', `## ${t.waar}`, '', `> ${t.tekst.replace(/\n/g, ' ')}`, '');
    for (const m of t.meldingen) regels.push(`- **${m.fout}** → **${m.correctie}**${m.reden ? ` (${m.reden})` : ''}`);
  }
  return regels.join('\n') + '\n';
}

// ---------- hoofdprogramma ----------

async function run() {
  const teksten: Tekst[] = [];
  if (alleen !== 'cms') teksten.push(...uitMessages(JSON.parse(await readFile('messages/nl.json', 'utf8'))));
  if (alleen !== 'messages') teksten.push(...(await uitCms()));
  // Alleen teksten met echte woorden buiten {plaatshouders} en <tags> om; puur
  // een filter, de tekst zelf gaat ongewijzigd naar Loes en nooit naar HTML.
  const heeftWoorden = (t: string) => t.split(/\{[^}]*\}|<[^>]*>/).some((deel) => /[a-zA-Z]{2}/.test(deel));
  const nakijken = teksten.filter((t) => heeftWoorden(t.tekst));

  await fetch(`${HOST}/api/version`).catch(() => {
    throw new Error(`Ollama is niet bereikbaar op ${HOST}. Start Ollama of zet OLLAMA_HOST.`);
  });

  await mkdir('data', { recursive: true });
  const cache: Cache = vlag('opnieuw')
    ? {}
    : JSON.parse(await readFile(CACHE_PATH, 'utf8').catch(() => '{}'));
  const sleutel = (t: string) => `${snel ? 'snel' : 'denken'}:${createHash('sha1').update(`${MODEL}\n${t}`).digest('hex').slice(0, 16)}`;

  // Dezelfde tekst op meerdere plekken hoeft maar één keer nagekeken te worden.
  const uniek = [...new Map(nakijken.filter((t) => !(sleutel(t.tekst) in cache)).map((t) => [t.tekst, t])).values()];
  const alle = porties(uniek);
  const werk = alle.slice(0, limiet);
  console.log(
    `[taalcheck] ${nakijken.length} teksten, ${uniek.length} nog na te kijken in ${alle.length} porties` +
      (werk.length < alle.length ? ` (nu ${werk.length})` : '') +
      ` · ${MODEL} · denken ${snel ? 'uit' : 'aan'}`,
  );

  const start = Date.now();
  let mislukt = 0;
  for (const [n, portie] of werk.entries()) {
    const lijst = portie.map((t) => t.tekst.replace(/\s*\n\s*/g, ' '));
    let status: string;
    try {
      const meldingen = leesMeldingen(await vraagLoes(lijst), lijst);
      portie.forEach((t, i) => (cache[sleutel(t.tekst)] = meldingen[i]));
      await writeFile(CACHE_PATH, JSON.stringify(cache));
      status = `${meldingen.flat().length} meldingen`;
    } catch (err) {
      // Niet in de cache: de volgende ronde probeert deze portie opnieuw.
      mislukt++;
      status = `overgeslagen (${err instanceof Error ? err.message : err})`;
    }
    const perPortie = (Date.now() - start) / (n + 1);
    const rest = Math.round(((werk.length - n - 1) * perPortie) / 60000);
    console.log(`[taalcheck] ${n + 1}/${werk.length} · ${status} · nog ~${rest} min`);
  }
  if (mislukt) console.log(`[taalcheck] ${mislukt} porties overgeslagen; draai opnieuw om ze na te kijken`);

  const overgeslagen = nakijken.filter((t) => !(sleutel(t.tekst) in cache)).length;
  const pad = `data/taalcheck.${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  await writeFile(pad, rapport(nakijken, cache, sleutel, overgeslagen));
  console.log(`[taalcheck] rapport: ${pad}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[taalcheck] MISLUKT:', err instanceof Error ? err.message : err);
  process.exit(1);
});

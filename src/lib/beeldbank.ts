export type BeeldbankRechten = 'vrij' | 'toestemming' | 'onbekend';

export type BeeldbankMetadata = {
  title: string;
  description?: string;
  imageUrl: string;
  datering?: string;
  vervaardiger?: string;
  rechten: BeeldbankRechten;
};

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, name) => {
    if (dec || hex) return String.fromCodePoint(dec ? Number(dec) : parseInt(hex, 16));
    return NAMED_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

// Attribuutwaarde tussen dubbele of enkele aanhalingstekens; de andere soort mag erin voorkomen.
const ATTRIBUTE_RE = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function extractMetaContent(html: string, property: string): string | undefined {
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attributes = new Map<string, string>();
    for (const [, name, double, single] of tag.matchAll(ATTRIBUTE_RE)) {
      attributes.set(name.toLowerCase(), double ?? single);
    }
    if (attributes.get('property')?.toLowerCase() === property.toLowerCase()) {
      const content = attributes.get('content');
      if (content !== undefined) return decodeEntities(content);
    }
  }
  return undefined;
}

export async function fetchBeeldbankMetadata(link: string): Promise<BeeldbankMetadata> {
  const url = new URL(link);
  if (!url.hostname.endsWith('archief.amsterdam')) {
    throw new Error(`alleen archief.amsterdam-links worden ondersteund, kreeg: ${url.hostname}`);
  }

  const response = await fetch(link, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`ophalen van pagina mislukt: HTTP ${response.status}`);
  }

  const html = await response.text();

  const title = extractMetaContent(html, 'og:title');
  const description = extractMetaContent(html, 'og:description');
  const imageUrl = extractMetaContent(html, 'og:image');

  if (!title || !imageUrl) {
    throw new Error('og:title of og:image niet gevonden op de pagina — import gestopt.');
  }

  const extra = await fetchMediabankFields(html, url).catch(() => undefined);

  return { title, description, imageUrl, rechten: 'onbekend', ...extra };
}

type MemorixField = { field: string; value: unknown };

/**
 * Datering, maker en rechten staan niet in de og-tags maar in de Memorix-API die de
 * Beeldbank zelf gebruikt. De (publieke) sleutel en URL staan als data-attribuut op de pagina.
 * Lukt dit niet, dan gaat de import gewoon door zonder deze velden.
 */
async function fetchMediabankFields(html: string, url: URL): Promise<Partial<BeeldbankMetadata>> {
  const apiKey = html.match(/data-api-key="([^"]+)"/)?.[1];
  const apiUrl = html.match(/data-api-url="([^"]+)"/)?.[1];
  const uuid = url.pathname.match(/\/detail\/([0-9a-f-]{36})/i)?.[1];
  if (!apiKey || !apiUrl || !uuid) return {};

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/media/${uuid}?apiKey=${encodeURIComponent(apiKey)}&lang=nl`);
  if (!response.ok) return {};
  const json = (await response.json()) as { media?: { metadata?: MemorixField[] }[] };
  const fields = json.media?.[0]?.metadata ?? [];
  const text = (name: string) => {
    const value = fields.find((f) => f.field === name)?.value;
    const flat = Array.isArray(value) ? value.flat(Infinity).filter((v) => typeof v === 'string') : [value];
    const joined = flat.filter((v): v is string => typeof v === 'string' && v.trim() !== '').join('; ');
    return joined ? decodeEntities(joined) : undefined;
  };

  const rechthebbende = text('sr_rechthebbende');
  const voorwaarden = text('sr_leveringsvoorwaarden') ?? '';
  const rechten: BeeldbankRechten =
    rechthebbende === 'Auteursrechtvrij'
      ? 'vrij'
      : /auteursrechtelijk beschermd/i.test(voorwaarden)
        ? 'toestemming'
        : 'onbekend';

  return { datering: text('dc_date'), vervaardiger: text('sk_vervaardiger'), rechten };
}

export type BeeldbankMetadata = {
  title: string;
  description?: string;
  imageUrl: string;
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

  return { title, description, imageUrl };
}

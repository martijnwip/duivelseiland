export type BeeldbankMetadata = {
  title: string;
  description?: string;
  imageUrl: string;
};

function extractMetaContent(html: string, property: string): string | undefined {
  const pattern = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i');
  const match = html.match(pattern);
  return match?.[1];
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

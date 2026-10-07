export const CONTENT_COLLECTIONS = [
  'nieuws',
  'agenda',
  'interviews',
  'geschiedenis',
  'duivelse-kunst',
  'praktische-info',
] as const;

export const COLLECTION_FIELDS: Record<string, Record<string, 'string' | 'lexical'>> = {
  ...Object.fromEntries(
    CONTENT_COLLECTIONS.map((slug) => [slug, { title: 'string', content: 'lexical' }] as const),
  ),
  media: { alt: 'string', caption: 'string' },
};

export const GLOBAL_FIELDS: Record<string, { footer: 'string'; menuLabel: 'array-string' }> = {
  'site-instellingen': { footer: 'string', menuLabel: 'array-string' },
};

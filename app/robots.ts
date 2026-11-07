import type { MetadataRoute } from 'next';

/**
 * /robots.txt: de site mag geïndexeerd worden, het CMS en de API niet.
 * Foto's komen via /api/media/file/ (Payload serveert de Vercel Blob-bestanden), dus die blijven open.
 * Pagina's met een token (bevestigen, afmelden, buurtpas) staan hier bewust niet in: die hebben
 * zelf noindex, en een Disallow zou zoekmachines juist verhinderen die noindex te zien.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/admin', '/api/'],
    },
  };
}

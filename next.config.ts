import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config = withNextIntl(
  withPayload({
    reactStrictMode: true,
    // The dev-mode indicator badge overlaps Payload admin UI controls
    // (e.g. the logout button), blocking clicks — disable it.
    devIndicators: false,
    // Het ideeformulier (/activiteiten/aanmelden) stuurt een afbeelding van max. 4 MB mee via een
    // server action; de standaardlimiet is 1 MB. Vercel zelf staat max. 4,5 MB per request toe.
    experimental: {
      serverActions: { bodySizeLimit: '4.5mb' },
    },
    // @libsql/client dynamically requires 'ws' and 'undici' for its transport;
    // Next's build tracer can't follow those, so keep the package external
    // instead of bundling it (see runtime "Cannot find module 'ws'" on Vercel).
    serverExternalPackages: ['@libsql/client', 'ws', 'undici'],
    // /vakmensen heet sinds oktober 2026 /vaklui; oude links (bladwijzers, zoekmachines, verstuurde mails) blijven werken.
    async redirects() {
      return [
        { source: '/vakmensen/:path*', destination: '/vaklui/:path*', permanent: true },
        { source: '/:locale(nl|en)/vakmensen/:path*', destination: '/:locale/vaklui/:path*', permanent: true },
      ];
    },
    // Browsers en iOS vragen deze paden direct op; stuur ze naar de echte iconen.
    // Daarna: elk ander pad met een punt in het eerste deel (/robots.txt, /wp-login.php, ...).
    // De middleware slaat die over, dus anders komen ze in [locale] met die naam als taal en
    // crashen pagina's op toLocaleDateString. Rewrites gelden pas na bestaande bestanden en
    // routes (/icon.svg, /apple-icon), dus die blijven werken.
    async rewrites() {
      return [
        { source: '/favicon.ico', destination: '/icon.svg' },
        { source: '/apple-touch-icon.png', destination: '/apple-icon' },
        { source: '/apple-touch-icon-precomposed.png', destination: '/apple-icon' },
        { source: '/:pad([^/]*\\.[^/]*)', destination: '/nl/niet-gevonden' },
      ];
    },
    // The build tracer can't follow @libsql/isomorphic-ws's conditional ESM
    // export into 'ws'/'undici', so force those package files into the
    // deployed function output explicitly.
    outputFileTracingIncludes: {
      '/**': ['./node_modules/ws/**', './node_modules/undici/**', './node_modules/@libsql/**'],
      // public/ staat op Vercel niet in de function (alleen op het CDN); routes die er met
      // readFile uit lezen, moeten die bestanden expliciet meekrijgen.
      '/apple-icon*': ['./public/logo/duivel-rood.svg'],
      '/**/opengraph-image*': ['./public/mascotte/mimi-1.jpg'],
    },
  }),
);

export default config;

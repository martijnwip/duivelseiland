import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Eigen domein: Payload-media kan als absolute URL (serverURL) binnenkomen. Een ongeldige waarde
// (bv. "[SENSITIVE]" uit `vercel env pull`) mag de build niet breken.
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const serverHost = serverUrl && URL.canParse(serverUrl) ? new URL(serverUrl).hostname : 'localhost';

const config = withNextIntl(
  withPayload({
    reactStrictMode: true,
    // Geen "X-Powered-By: Next.js, Payload"; withPayload voegt hem dan ook niet zelf toe.
    poweredByHeader: false,
    // Basisset security-headers op alle routes, ook /admin en /api. Een volledige CSP (script-src enz.) bewust
    // nog niet: Next en de Payload-admin gebruiken inline scripts; dat vraagt nonces of eerst Report-Only.
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            // Tegen clickjacking (vooral /admin): geen andere site mag de pagina's in een iframe laden.
            // 'self' i.p.v. 'none', zodat framen binnen het eigen domein (bv. live preview in de admin) kan.
            { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            // Geüploade media niet als ander bestandstype laten uitvoeren.
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            // De site gebruikt geen camera, microfoon of locatie (een bestandskiezer met camera valt hier niet onder).
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          ],
        },
      ];
    },
    // next/image (Vercel Image Optimization, beperkt op Hobby): de bronfoto's zijn hooguit ~1400 px breed, dus
    // varianten van 2048/3840 px leveren niets op maar tellen wel als transformatie. Next 15 bewaart een variant
    // standaard maar 60 seconden; de bronnen veranderen niet (statische imports met hash), dus 31 dagen.
    // Beeldbank-foto's (images.memorix.nl) gaan ook via next/image: dan komen ze van het eigen domein
    // (geen extra verbinding, langere cache dan de 7 dagen van Memorix) en als AVIF/WebP op schermformaat.
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      minimumCacheTTL: 2678400,
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        { protocol: 'https', hostname: 'images.memorix.nl' },
        { protocol: 'https', hostname: serverHost },
        { protocol: 'http', hostname: 'localhost' },
      ],
    },
    // The dev-mode indicator badge overlaps Payload admin UI controls
    // (e.g. the logout button), blocking clicks — disable it.
    devIndicators: false,
    // Het ideeformulier (/activiteiten/aanmelden) stuurt een afbeelding van max. 4 MB mee via een
    // server action; de standaardlimiet is 1 MB. Vercel zelf staat max. 4,5 MB per request toe.
    experimental: {
      serverActions: { bodySizeLimit: '4.5mb' },
      // CSS in de HTML in plaats van losse, render-blokkerende stylesheets (alleen in productie).
      inlineCss: true,
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
      // readFile uit lezen, moeten die bestanden expliciet meekrijgen. `bun run check:deellinks`
      // controleert dat elk bestand dat een deelafbeelding uit public/ leest hier staat.
      '/apple-icon*': ['./public/logo/duivel-rood.svg'],
      '/**/opengraph-image*': [
        './public/logo/mail-badge.png',
        './public/kaart/duivelseiland.png',
        './public/afval/instructiekaart-*.png',
        './public/geluid/instructiekaart-*.png',
        './public/mascotte/mimi-1.jpg',
      ],
    },
  }),
);

export default config;

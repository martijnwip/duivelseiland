import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config = withNextIntl(
  withPayload({
    reactStrictMode: true,
    // The dev-mode indicator badge overlaps Payload admin UI controls
    // (e.g. the logout button), blocking clicks — disable it.
    devIndicators: false,
    // @libsql/client dynamically requires 'ws' and 'undici' for its transport;
    // Next's build tracer can't follow those, so keep the package external
    // instead of bundling it (see runtime "Cannot find module 'ws'" on Vercel).
    serverExternalPackages: ['@libsql/client', 'ws', 'undici'],
    // The build tracer can't follow @libsql/isomorphic-ws's conditional ESM
    // export into 'ws'/'undici', so force those package files into the
    // deployed function output explicitly.
    outputFileTracingIncludes: {
      '/**': ['./node_modules/ws/**', './node_modules/undici/**', './node_modules/@libsql/**'],
    },
  }),
);

export default config;

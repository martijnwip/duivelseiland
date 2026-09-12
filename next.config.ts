import { withPayload } from '@payloadcms/next/withPayload';

const config = withPayload({
  reactStrictMode: true,
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
});

export default config;

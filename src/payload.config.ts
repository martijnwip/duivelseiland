import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { buildConfig } from 'payload';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { Agenda } from './collections/Agenda';
import { DuivelseKunst } from './collections/DuivelseKunst';
import { Geschiedenis } from './collections/Geschiedenis';
import { Interviews } from './collections/Interviews';
import { Media } from './collections/Media';
import { Nieuws } from './collections/Nieuws';
import { PraktischeInfo } from './collections/PraktischeInfo';
import { Users } from './collections/Users';
import { Vakmensen } from './collections/Vakmensen';
import { translateDocEndpoint } from './endpoints/translateDoc';
import { SiteInstellingen } from './globals/SiteInstellingen';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    // Custom component paths like '/components/admin/TranslateButton#default'
    // resolve relative to src/ (this config's own directory), not the
    // project root, matching where our components actually live.
    importMap: {
      baseDir: dirname,
    },
  },

  collections: [
    Users,
    Media,
    Nieuws,
    Agenda,
    Interviews,
    Geschiedenis,
    DuivelseKunst,
    Vakmensen,
    PraktischeInfo,
  ],

  globals: [SiteInstellingen],

  endpoints: [translateDocEndpoint],

  localization: {
    locales: [
      { label: 'Nederlands', code: 'nl' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'nl',
    fallback: true,
  },

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || process.env.TURSO_DATABASE_URL || 'file:./dev.db',
      authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    },
    autoIncrement: true,
    // Schema is managed by migrations (src/migrations); disable dev-mode
    // auto-push so it doesn't drift from / conflict with applied migrations.
    push: false,
  }),

  editor: lexicalEditor(),

  sharp,

  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  typescript: {
    outputFile: path.join(dirname, '..', 'payload-types.ts'),
  },
});

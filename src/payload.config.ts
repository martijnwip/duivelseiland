import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { buildConfig } from 'payload';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { betterAuth } from 'better-auth';
import { betterAuthCollections, createBetterAuthPlugin, payloadAdapter } from '@delmaredigital/payload-better-auth';
import { betterAuthOptions } from './lib/auth/config';
import { Agenda } from './collections/Agenda';
import { DuivelseKunst } from './collections/DuivelseKunst';
import { Geschiedenis } from './collections/Geschiedenis';
import { HeroSlides } from './collections/HeroSlides';
import { HistorischeFotos } from './collections/HistorischeFotos';
import { InviteLinks } from './collections/InviteLinks';
import { Interviews } from './collections/Interviews';
import { Media } from './collections/Media';
import { Nieuws } from './collections/Nieuws';
import { PraktischeInfo } from './collections/PraktischeInfo';
import { Slideshows } from './collections/Slideshows';
import { Users } from './collections/Users';
import { Vakmensen } from './collections/Vakmensen';
import { OverDeNaam } from './globals/OverDeNaam';
import { translateDocEndpoint } from './endpoints/translateDoc';
import { SiteInstellingen } from './globals/SiteInstellingen';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,

  admin: {
    // Custom component paths like '/components/admin/TranslateButton#default'
    // resolve relative to src/ (this config's own directory), not the
    // project root, matching where our components actually live.
    importMap: {
      baseDir: dirname,
    },
    components: {
      // Laadt de site-lettertypen en de rand-styling voor de rich text-editor.
      providers: ['/components/admin/EditorStyles#default'],
      graphics: {
        // Vervangt het "home"-icoontje voor de breadcrumb (StepNav) op elke
        // ingelogde admin-pagina. Het standaard graphics.Logo-slot (login-pagina)
        // wordt niet gebruikt: de better-auth login view heeft zijn eigen
        // AuthCard en raadpleegt dat slot niet.
        Icon: '/components/admin/AdminIcon#default',
      },
    },
  },

  collections: [
    Users,
    InviteLinks,
    Media,
    Nieuws,
    Agenda,
    Interviews,
    Geschiedenis,
    DuivelseKunst,
    Vakmensen,
    PraktischeInfo,
    HeroSlides,
    HistorischeFotos,
    Slideshows,
  ],

  globals: [SiteInstellingen, OverDeNaam],

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
    betterAuthCollections({
      betterAuthOptions,
      skipCollections: ['user'],
      // De eigen rol-logica (isAdminField, laatste-admin-hook) blijft de enige
      // bron van waarheid voor wie admin wordt — zie access.create in Users.ts.
      firstUserAdmin: false,
    }),
    createBetterAuthPlugin({
      createAuth: (payload) =>
        betterAuth({
          ...betterAuthOptions,
          database: payloadAdapter({ payloadClient: payload }),
          advanced: { database: { generateId: 'serial' } },
          baseURL: serverURL,
          secret: process.env.BETTER_AUTH_SECRET,
          trustedOrigins: [serverURL],
        }),
      admin: {
        // Dunne wrapper om de plugin's eigen LoginViewWrapper die alleen een
        // logo toevoegt (position: fixed, los van AuthCard's layout) — de
        // plugin geeft zelf geen `logo`-prop door aan die view, dus dit is
        // de enige plek om er zonder te forken alsnog een te tonen.
        loginViewComponent: '/components/admin/LoginViewWithLogo#default',
        login: {
          // Alle drie de rollen (auteur/redacteur/admin) loggen in op /admin;
          // de plugin's eigen default (alleen 'admin') zou de andere twee blokkeren.
          requiredRole: null,
          enableSignUp: false,
        },
      },
    }),
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

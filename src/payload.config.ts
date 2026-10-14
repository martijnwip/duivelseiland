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
import type { CollectionConfig, GlobalConfig } from 'payload';
import { ActiviteitBerichten } from './collections/ActiviteitBerichten';
import { Activiteiten } from './collections/Activiteiten';
import { ActiviteitInschrijvingen } from './collections/ActiviteitInschrijvingen';
import { EmailAdressen } from './collections/EmailAdressen';
import { Agenda } from './collections/Agenda';
import { DuivelseKunst } from './collections/DuivelseKunst';
import { Geschiedenis } from './collections/Geschiedenis';
import { HeroSlides } from './collections/HeroSlides';
import { HistorischeFotos } from './collections/HistorischeFotos';
import { IdeeLikes } from './collections/IdeeLikes';
import { InviteLinks } from './collections/InviteLinks';
import { NieuwsbriefAbonnees } from './collections/NieuwsbriefAbonnees';
import { NieuwsbriefEdities } from './collections/NieuwsbriefEdities';
import { NieuwsbriefVerzendingen } from './collections/NieuwsbriefVerzendingen';
import { Interviews } from './collections/Interviews';
import { Media } from './collections/Media';
import { Nieuws } from './collections/Nieuws';
import { PraktischeInfo } from './collections/PraktischeInfo';
import { Slideshows } from './collections/Slideshows';
import { Users } from './collections/Users';
import { Vakken } from './collections/Vakken';
import { Vaklui } from './collections/Vaklui';
import { Buurtborrel } from './globals/Buurtborrel';
import { OverDeNaam } from './globals/OverDeNaam';
import { GeschiedenisVerhaal } from './globals/GeschiedenisVerhaal';
import { translateDocEndpoint } from './endpoints/translateDoc';
import { activiteitenOpruimenEndpoint } from './endpoints/activiteitenOpruimen';
import { nieuwsbriefVerzendenEndpoint } from './endpoints/nieuwsbriefVerzenden';
import { SiteInstellingen } from './globals/SiteInstellingen';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

// Een organisator ziet in /admin alleen wat bij de eigen activiteit hoort (plus Media en het eigen
// profiel). Dit verbergt alleen de navigatie; de access-functies blijven de echte beveiliging.
const ZICHTBAAR_VOOR_ORGANISATOR = new Set(['activiteiten', 'activiteit-inschrijvingen', 'activiteit-berichten', 'media', 'users']);

function verbergVoorOrganisator<T extends CollectionConfig | GlobalConfig>(config: T): T {
  if (ZICHTBAAR_VOOR_ORGANISATOR.has(config.slug)) return config;
  const hidden = config.admin?.hidden;
  return {
    ...config,
    admin: {
      ...config.admin,
      hidden: (args: { user: { role?: string } | null }) =>
        args.user?.role === 'organisator' || (typeof hidden === 'function' ? hidden(args as never) : Boolean(hidden)),
    },
  };
}

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
      // Kopbalk: met welk account je bent ingelogd, en LOKAAL/PREVIEW buiten productie.
      actions: ['/components/admin/IngelogdAls#default'],
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
    Vaklui,
    Vakken,
    PraktischeInfo,
    HeroSlides,
    HistorischeFotos,
    Slideshows,
    IdeeLikes,
    NieuwsbriefAbonnees,
    NieuwsbriefEdities,
    NieuwsbriefVerzendingen,
    Activiteiten,
    ActiviteitInschrijvingen,
    ActiviteitBerichten,
    EmailAdressen,
  ].map(verbergVoorOrganisator),

  globals: [SiteInstellingen, OverDeNaam, GeschiedenisVerhaal, Buurtborrel].map(verbergVoorOrganisator),

  endpoints: [translateDocEndpoint, activiteitenOpruimenEndpoint, nieuwsbriefVerzendenEndpoint],

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
          // Alle rollen (organisator/auteur/redacteur/admin) loggen in op /admin;
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

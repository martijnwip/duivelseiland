# Setup Payload CMS 3 in Next.js App

> **Status:** T1-T3 Complete, T4-T5 In Progress. Core infrastructure bootstrapped successfully.

## Outcome and boundaries

- **Problem and target:** Initialize the Next.js project with Payload CMS 3, Bun runtime (local and Vercel), SQLite (dev) / Turso (prod) database, and conditional Vercel Blob storage. Set up the baseline `users` and `media` collections, and core role-based access control utilities as defined in `PROJECT.md`.
- **In scope:** Next.js setup, Bun runtime/scripts, Payload core config, `users` collection (auth + role), `media` collection, and shared access helpers.
- **Out of scope:** Site content collections (`nieuws`, `agenda`, etc.), frontend site pages (except default Payload admin), and actual Turso/Vercel Blob external accounts (env vars only).
- **Approach:** Scaffold Next.js app directly with Bun; configure `vercel.json` and `package.json` scripts for the Bun runtime; install Payload 3 core/SQLite/Lexical/Blob dependencies; implement conditional storage adapters and role-based access constraints.

## Key files, evidence, and decisions

| File or source | Why it matters | Decision or plan impact |
|---|---|---|
| `PROJECT.md` | Defines the target tech stack, role matrix, and environment rules. | Dictates Bun runtime, `--bun` commands, `vercel.json`, and all role constraints. |
| `vercel.json` | Configures Vercel Functions. | Set to `"bunVersion": "1.x"` to enable Bun runtime on serverless. |
| `package.json` | Defines scripts and dependencies. | Uses `bun --bun` for `next dev/build` and `payload` commands. |
| `src/payload.config.ts` | Single source of truth for Payload schema. | Configures SQLite `@payloadcms/db-sqlite`, Lexical editor, and conditionally enabled Vercel Blob plugin. |
| `src/access/isAdmin.ts` (etc.) | Reusable role logic. | Centralizes `isAdmin`, `isRedacteurOrAdmin`, `publishedOrLoggedIn`, etc. |
| `.env.example` | Defines required variables. | Includes `DATABASE_URI`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SERVER_URL`. |

- **Open gate:** `bun --bun` causes an infinite loop with the Payload CLI (recursive script resolution + ESM/CJS mixing). Resolved by using `bunx payload` for CLI commands (no `--bun` flag), while keeping `bun --bun` for Next.js dev/build/start scripts.
- **Open gate:** Admin page `[[...segments]]` catch-all route: When hitting the bare `/admin` path (zero segments), Next.js 15 RSC passes `params = undefined` rather than `{ segments: [] }`. Payload's `RootPage` expects resolved params internally, causing a logged `TypeError: undefined is not an object (evaluating 'params.segments')`. Functionally the redirect to login/create-first-user works (HTTP 307). The error poisons Payload's `getPayload` cache on the first request, causing subsequent admin requests to 500.
- **Discovery:** `payload.config.ts` must wrap the raw config in `buildConfig()` from `payload` package. Without this, Payload's `BasePayload.init()` crashes on `this.config.blocks.reduce()` because `sanitizeConfig` was never run to provide default values.

## Tasks

#### T1 — Project Init and Bun Runtime Configuration

- **Change:**
  - Create `package.json` with Bun scripts: `dev` (`bun --bun next dev`), `build` (`bun --bun next build`), `start` (`bun --bun next start`), `payload` (`bun --bun payload`).
  - Create `vercel.json` setting `"bunVersion": "1.x"`.
  - Add dependencies: `next`, `payload`, `@payloadcms/next`, `@payloadcms/db-sqlite`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-vercel-blob`, `sharp`, `typescript`, `@types/react`.
- **Starts at:** root `/`
- **Depends on:** None
- **Verify:**
  - Run `bun install`; expect successful dependency installation with a `bun.lock` file generated.
  - Run `bun dev`; expect Next.js dev server to start without fatal runtime errors and serve on port 3000.
- **Risk/recovery:** If `sharp` post-install fails on Bun, add `"sharp": "^0.33.0"` to `package.json`.

#### T2 — Payload Environment Variables

- **Change:**
  - Create `.env.example` and `.env.local` in root.
  - Add `DATABASE_URI=file:./dev.db`, `PAYLOAD_SECRET=your-super-secret-key`, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`, and empty `BLOB_READ_WRITE_TOKEN`.
- **Starts at:** root `/`
- **Depends on:** T1
- **Verify:**
  - Run `bun dev`; expect Payload to connect successfully to the local SQLite file `dev.db` (or create it) without throwing "missing secret key" or database connection errors.
- **Risk/recovery:** If `PAYLOAD_SECRET` is missing, Payload halts startup. Ensure `.env.local` is properly loaded.

#### T3 — Payload Core Configuration (SQLite, Lexical, Blob Plugin)

- **Change:**
  - Create `src/payload.config.ts`.
  - Set `serverURL: process.env.NEXT_PUBLIC_SERVER_URL`.
  - Configure database using `@payloadcms/db-sqlite` with `url: process.env.DATABASE_URI`.
  - Configure Rich Text using `@payloadcms/richtext-lexical`.
  - Configure Vercel Blob Storage adapter using `@payloadcms/storage-vercel-blob`, setting `enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN)` to disable locally (falling back to local storage when token is missing).
  - Set `typescript: { outputFile: 'payload-types.ts' }`.
  - Create `tsconfig.json` alias: `"@payload-config": ["./src/payload.config.ts"]`.
- **Starts at:** `src/`
- **Depends on:** T1, T2
- **Verify:**
  - Run `bun run payload generate:types`; expect `payload-types.ts` to be created successfully in the root.
  - Run `bun dev`; expect the Payload local API and admin panel to load at `http://localhost:3000/admin`.
- **Risk/recovery:** If `tsx` module errors occur when running the Payload CLI on Bun, the fallback is to run Payload CLI with `--disable-transpile` (per Payload issue #15015 guidance).

#### T4 — Access Control Utilities

- **Change:**
  - Create `src/access/isAdmin.ts` exporting `isAdmin` and `isRedacteurOrAdmin` checks based on `req.user?.role`.
  - Create `src/access/isOwnerOrRedacteur.ts` exporting logic that returns `true` for admin/redacteur, and matches `{ author: { equals: user.id } }` for others.
  - Create `src/access/publishedOrLoggedIn.ts` exporting logic returning `{ status: { equals: 'published' } }` for unauthenticated users, `true` for logged-in users.
- **Starts at:** `src/access/`
- **Depends on:** None
- **Verify:**
  - Run `bun --bun next build`; expect successful compilation with no TypeScript errors in the access logic.
- **Risk/recovery:** Ensure return types match Payload's `Access` interface (Boolean or Where query object).

#### T5 — Define `users` Collection & Role Field

- **Change:**
  - Create `src/collections/Users.ts`.
  - Enable `auth: true` and configure `admin: { useAsTitle: 'email' }`.
  - Add `role` select field (options: `admin`, `redacteur`, `auteur`; default: `auteur`).
  - Add field-level `access` on `role` restricting `update` only to admins.
- **Starts at:** `src/collections/`
- **Depends on:** T3
- **Verify:**
  - Run `bun run payload generate:types`; verify `User` type includes the `role` select field in the newly generated `payload-types.ts`.
  - Run `bun dev` and visit `/admin`; verify the Users collection is visible and accessible in the Payload admin dashboard.
- **Risk/recovery:** If Payload complains about the `users` collection missing when referenced elsewhere, ensure the slug is exactly `users`.

#### T6 — Define `media` Collection

- **Change:**
  - Create `src/collections/Media.ts`.
  - Set `slug: 'media'`, `upload: true` with supported image MIME types.
  - Configure `imageSizes` for thumbnails and cards.
  - Add `alt` (text, required) and `caption` (text) fields.
- **Starts at:** `src/collections/`
- **Depends on:** T3
- **Verify:**
  - Run `bun dev` and visit `/admin/media`; verify media upload functionality works locally (storing files in the local `media/` directory).
- **Risk/recovery:** If local upload directory creation fails, ensure the server has write permissions in the project root or adjust storage adapter local path.

## Final acceptance

- **Checks:**
  - `bun dev` starts Payload admin and Next.js seamlessly.
  - `bun run payload generate:types` reflects the `users` and `media` collections.
  - Access control constraints return correct Payload `Access` types.
  - Vercel Blob plugin correctly toggles based on `BLOB_READ_WRITE_TOKEN`.
- **End state:** A fully bootstrapped Next.js project with Bun runtime scripts, Payload CMS 3 configured for SQLite/Dev Blob (conditional), and baseline `users` and `media` collections ready for content extension.
- **Deferrals or blockers:** Actual deployment to Vercel requires external provisioning of Turso (SQLite) and Vercel Blob storage accounts.

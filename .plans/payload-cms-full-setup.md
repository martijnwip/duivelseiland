# Payload CMS: fix core infra and build the full content model

> **Status:** Ready for implementation

## Outcome and boundaries

- **Problem and target:** The previous setup pass (T1–T3 committed, T4–T5 uncommitted) left the Payload CMS 3 backend in a broken state — a build-breaking type error, a wrong Vercel runtime config, a fully non-functional admin CLI, and an unusable "create first user" flow. Diagnosis of the current repo state confirmed all four. This plan fixes those, adds two safety guards `PROJECT.md` requires but the current code lacks, then builds out the rest of `PROJECT.md`'s backend scope: the site-settings global and all seven content collections with role-based access control, so the admin panel is a fully working CMS for every collection described in `PROJECT.md`.
- **In scope:** Fixing the four diagnosed bugs; admin self-demotion and last-admin-deletion guards on `Users`; the `site-instellingen` global; the six author-manageable content collections (`nieuws`, `agenda`, `interviews`, `geschiedenis`, `duivelse-kunst`, `vakmensen`); the editor-only `praktische-info` collection; a seed script to bootstrap the first admin user; shared field/access/hook helpers to avoid duplicating the same shape seven times.
- **Out of scope:** The public-facing `(site)` route group (pages that read and render published content), the `revalidatePath` hook `PROJECT.md` describes for that frontend, actual Turso/Vercel Blob account provisioning (env vars only, as before), and the optional `archived` status `PROJECT.md` merely suggests considering for Geschiedenis/Interviews.
- **Approach:** Fix the four infra bugs and the two missing Users safety guards first (all six independent of each other, no shared dependency), each with its own verify step, so the codebase is provably buildable and the admin panel provably reachable. Then extend `src/payload.config.ts` with one global and seven collections, sharing field/access-preset code across the six similarly-shaped collections rather than repeating it, matching `PROJECT.md`'s **prose** wherever it's more specific than the terser rights-matrix table (see decisions below — an independent review caught two places the matrix table and the prose disagree, and the prose is authoritative both times). Finish with one full regression pass across typecheck, build, type generation, and a real admin-panel login.

## Key files, evidence, and decisions

| File or source | Why it matters | Decision or plan impact |
|---|---|---|
| `PROJECT.md` | Rights matrix, collection list, field list, global fields, and prose rules — the spec this plan implements. | Drives every access-control and schema decision below. Two places the terse matrix table and the fuller prose disagree; prose wins both times (see next two rows). |
| `PROJECT.md`, `### Auteur` bullet: *"Kan alleen eigen items bewerken en verwijderen (veld `author` = ingelogde gebruiker)"* | The Rechtenmatrix table's Auteur cell for content collections just says "aanmaken, eigen bewerken (draft)" and doesn't mention delete — an earlier draft of this plan read that omission as "no delete right." An independent review caught that this prose sentence, two lines above the table, explicitly grants delete on own items. | `authoredContentAccess.delete` must be an ownership check (same shape as `update`), not redacteur/admin-only. |
| `PROJECT.md`, `### Redacteur` bullet: *"Geen toegang tot gebruikersbeheer en site-instellingen"* | The matrix's `Globals (instellingen)` row says Redacteur = "lezen", but this prose bullet says Redacteur has no access at all to site-instellingen. Combined with the Auteur row already saying "geen", the prose is consistent (only Admin manages site-instellingen) while the matrix cell for Redacteur is the outlier. | `site-instellingen` global `read` access excludes both Auteur and Redacteur, not just Auteur. Also: `PROJECT.md`'s own "Data ophalen in de site" section says the (future, out-of-scope) frontend uses the Payload **Local API**, which bypasses access control by default — so the matrix's "Bezoeker: lezen" cell mostly governs admin-panel/REST visibility, not public site rendering, lowering the stakes of this cell either way. |
| `PROJECT.md`, `### Admin` bullet: *"Kan de eigen rol niet verlagen en de laatste admin niet verwijderen"* | Explicit, unambiguous safety rule. Not implemented anywhere in the current `Users.ts` and missing from an earlier draft of this plan — caught by independent review. | New task: field-level `validate` on `role` blocking self-demotion, plus a `beforeDelete` hook blocking deletion of the last admin. |
| `src/access/roles.ts`, `isAdmin.ts`, `isOwnerOrRedacteur.ts` | Existing, correct role/ownership logic from the prior (uncommitted) pass. | Reused for `update`/`delete` on content collections; `publishedOrLoggedIn.ts` (see next row) is not reused as originally planned. |
| `src/access/publishedOrLoggedIn.ts` | Returns `true` for **any** authenticated user regardless of role, falling back to a published-only filter only for anonymous requests. An independent review caught that reusing this verbatim for content-collection `read` access would let an Auteur read every other Auteur's unpublished drafts, and — worse — would let an Auteur read `praktische-info` entirely, directly contradicting `PROJECT.md`'s "Auteur: geen toegang" for that collection and this plan's own T11 verify step. | Replace with two precise, role-aware read functions (T9). This file becomes dead code once nothing references it — remove it rather than leave two overlapping helpers around. |
| `src/collections/Users.ts:64` | `role.access.update: isAdmin` — `isAdmin` is typed `Access` (collection-level, can return a `Where`), but a field's `access.update` must be `FieldAccess` (boolean-only). Confirmed by running `bunx tsc --noEmit`. | Needs boolean-only, `FieldAccess`-typed variants of `isAdmin`/`isRedacteurOrAdmin`, reused later for the `author`/`uploadedBy` field lock (T9) and `status` field lock (T9). |
| `src/collections/Media.ts` | Working reference pattern: relationship field + `beforeChange` hook to stamp the current user as owner. One gap an independent review caught: the hook only sets `uploadedBy` `if (!data.uploadedBy)`, so a client can supply an arbitrary id on create, and nothing stops editing it after creation via the API (`admin.readOnly` is UI-only, not an access rule — a second review confirmed a static `readOnly` disables the field in the panel for everyone including admins, while Payload's admin UI already renders a field read-only per viewer based on its computed field-level access, making a hardcoded `readOnly` both redundant and wrong here). | T9 fixes this for the new shared hook (always overwrite server-side, ignore client input), drops the static `admin.readOnly: true`, and applies a field-level `access.update` lock to `Media.uploadedBy` so the UI disables it per-viewer automatically. |
| `src/payload.config.ts` | Central config; currently registers only `Users`/`Media`; logs "sharp not installed" because `sharp` is a dependency but never passed into `buildConfig`. | Needs `sharp` wired in, plus the new global and seven new collections registered. |
| `vercel.json` — verified against Vercel's docs via Context7 (`/vercel/vercel`, `bun.md`) | Vercel's actual schema for enabling the Bun runtime is a **top-level** `{"bunVersion": "1.x"}`. The repo currently nests it under `functions."app/**/*.ts".bunVersion`, which Vercel does not recognize — the app would silently deploy on Node, not Bun. | Fix to the top-level key exactly as documented. |
| Payload docs via Context7 (`/payloadcms/payload`, `FIELDS.md`) | Payload ships a built-in `slugField()` helper (from the `payload` package) that auto-generates a slug from a source field with a "generate" checkbox — no custom hook needed. | Use `slugField()` for every collection's `slug` field instead of a hand-rolled `beforeValidate` hook. |
| Payload docs via Context7 (`hooks/collections.mdx`, field `types.ts`) | Confirmed exact signatures: `CollectionBeforeDeleteHook` receives `{ req, id, collection, context }` (no preloaded doc — must fetch it); field `validate` receives `(value, { req, id, previousValue, operation, ... })`. | Last-admin guard fetches the doc by `id` inside `beforeDelete`; self-demotion guard compares `previousValue` to the new `value` without needing a separate doc fetch. |
| Background research (fork): Payload CLI on this machine's Node v26.8.1 | Root cause confirmed: `tsx`'s CJS-interop shim throws `ERR_REQUIRE_ASYNC_MODULE` requiring `@payloadcms/richtext-lexical`'s ESM (top-level await) — reproduces on Node 18/20/26 alike, and a newer `tsx` doesn't fix it either. Payload's CLI ships an undocumented `--use-swc` flag that swaps `tsx` for `@swc-node/register`, sidestepping the broken path entirely; verified end-to-end in this repo (`generate:types` succeeds, `payload-types.ts` is written and sane) once `package.json` also gets `"type": "module"` (needed so swc-node's per-file CJS transpile doesn't break named-export interop with `payload.config.ts`). `bun --bun next build` was confirmed to still work after adding `"type": "module"`. | Fix: `"type": "module"` in `package.json`, add `@swc-node/register` as a dev dependency, run `--use-swc` on all `payload` CLI invocations. No Node reinstall needed. |
| Background research (fork): `/admin/create-first-user` 500 | Confirmed **unresolved upstream Payload bug** — [payloadcms/payload#12640](https://github.com/payloadcms/payload/issues/12640) and [#13030](https://github.com/payloadcms/payload/issues/13030) report the identical error (`Cannot destructure property 'config' ... undefined`) in the same `CreateFirstUserClient` component, across Payload 3.0.0–3.45.0 and both React 18/19; reproduced independently here on 3.89.0. Bisection ruled out this repo's custom `access`/`hooks` code — the vanilla flow fails before any of it runs. `/admin/login` (a different component, `LoginClient`) is not reported as affected. | Not a fixable-in-our-code bug. Work around it: seed the first admin via Payload's Local API instead of the browser UI, then use `/admin/login` normally. |
| Diagnosis: `package.json` pins `^3.41.0` for all `@payloadcms/*`/`payload` packages; `bun.lock` resolved everything to `3.89.0`. | Loose caret let the installed version drift silently 40+ minor versions from what was originally tested. | Pin exact versions once the CLI fix (above) is verified working, so future `bun install` can't drift again. |

- **Open gate:** The exact field shapes for the `site-instellingen` global (menu as an array of label/url pairs, footer as a plain textarea, contact info as a small group) are a best-effort reading of `PROJECT.md`'s one-line description ("sitenaam, menu, footer, contactgegevens"), not a specified schema. Low-risk and easy to adjust later — flagging so it isn't mistaken for a firm spec.

## Tasks

#### T1 — Fix the `Users.role` field-access type error

- **Change:**
  - In `src/access/isAdmin.ts`, add boolean-only `FieldAccess`-typed exports alongside the existing collection-level ones (e.g. `isAdminField: FieldAccess`, `isRedacteurOrAdminField: FieldAccess`), both built on the same `hasRoleAtLeast` check already in `src/access/roles.ts` — no logic duplication, just correctly-typed entry points for the two contexts Payload distinguishes.
  - In `src/collections/Users.ts:64`, change `role.access.update` from `isAdmin` to `isAdminField`.
- **Starts at:** `src/access/isAdmin.ts`, `src/collections/Users.ts`
- **Depends on:** None
- **Verify:**
  - Run `bunx tsc --noEmit`; expect zero errors (currently fails on exactly this line).

#### T2 — Admin self-protection guards on `Users`

- **Change:**
  - Add a field-level `validate` function to `Users.role`: if the document being edited is the requesting user's own (`id === req.user.id`), the field's `previousValue` is `'admin'`, and the new `value` is not `'admin'`, return a validation error message instead of `true` (blocks self-demotion).
  - Add a `beforeDelete` collection hook to `Users`: look up the document being deleted (`req.payload.findByID`), and if its `role` is `'admin'`, count remaining admins (`req.payload.count({ collection: 'users', where: { role: { equals: 'admin' } } })`); if the count is `1` (only this doc), throw an error to abort the delete (blocks deleting the last admin). Note: this is a check-then-act with no transaction, so two concurrent delete requests against the last two admins could theoretically both pass the count check before either commits — an accepted, documented limitation given this site's small volunteer-team scale, not something to engineer around here.
- **Starts at:** `src/collections/Users.ts`
- **Depends on:** None
- **Verify:**
  - `bunx tsc --noEmit` clean.
  - Manual check once the admin panel is reachable (T7): as the sole admin, attempt to change your own role away from `admin` — expect a validation error, not a saved change. Attempt to delete your own (only) admin account — expect the delete to be rejected.

#### T3 — Fix `vercel.json`'s Bun runtime config

- **Change:**
  - Replace the current `{"functions": {"app/**/*.ts": {"bunVersion": "1.x"}}}` with the documented top-level form: `{"bunVersion": "1.x"}`.
- **Starts at:** `vercel.json`
- **Depends on:** None
- **Verify:**
  - `cat vercel.json` matches Vercel's documented schema exactly (no local build/deploy check is possible without a Vercel deploy — note this as an inherent verification limit, confirm again on first real deploy).

#### T4 — Fix the Payload CLI on this machine (Node v26 incompatibility)

- **Change:**
  - Add `"type": "module"` to `package.json`.
  - Add `@swc-node/register` as a dev dependency (`bun add -D @swc-node/register`); run `bun pm trust @swc/core` once and commit the `trustedDependencies` entry it adds to `package.json`.
  - Change the `"payload"` script from `"bunx payload"` to `"bunx payload --use-swc"`.
- **Starts at:** `package.json`
- **Depends on:** None
- **Verify:**
  - Run `bun install`; expect it to complete without prompting (trust already granted).
  - Run `bun run payload generate:types`; expect it to complete without `ERR_REQUIRE_ASYNC_MODULE` and write `payload-types.ts` at the repo root containing `User` and `Media` types.
  - Run `bun --bun next build`; expect it to still compile past the type-check stage (only pre-existing unrelated errors, if any, should remain — none should remain after T1).
- **Risk/recovery:** If `"type": "module"` breaks some other file's CJS assumptions, there are currently no `.js`/`.cjs`/`.mjs` files anywhere in the repo (verified) and no `require()` calls outside `node_modules` — expected to be a no-op for everything except the CLI's own module resolution.

#### T5 — Wire `sharp` into `payload.config.ts`

- **Change:**
  - Import `sharp` and pass it into `buildConfig({ sharp, ... })` in `src/payload.config.ts`.
- **Starts at:** `src/payload.config.ts`
- **Depends on:** None
- **Verify:**
  - Run `bun --bun next dev`; visit `/admin` after logging in (see T7) and upload a test image to Media; expect `thumbnail`/`card` sized variants to be generated (check the Media doc's `sizes` data), and expect the "sharp not installed" warning to no longer appear in the dev server log.

#### T6 — Pin exact Payload package versions

- **Change:**
  - In `package.json`, change `^3.41.0` to the exact version currently resolved (`3.89.0`, or whatever `bun.lock` shows at implementation time) for `payload`, `@payloadcms/next`, `@payloadcms/db-sqlite`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-vercel-blob`.
  - Run `bun install` to refresh the lockfile against the pinned versions.
- **Starts at:** `package.json`
- **Depends on:** T4 (pin the version already confirmed working with the CLI fix, not an untested one)
- **Verify:**
  - `bun.lock` shows all five packages at the exact pinned version; `bun install` run a second time makes no further changes (idempotent).

#### T7 — Seed the first admin user (works around the upstream `create-first-user` bug)

- **Change:**
  - Add `scripts/seed-admin.ts`: reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from the environment (or fails with a clear message if unset), calls `getPayload({ config })` then `payload.create({ collection: 'users', data: { email, password, role: 'admin' } })`, and skips (with a message) if a user with that email already exists.
  - Add a `"seed:admin"` script to `package.json`: `"bun scripts/seed-admin.ts"`.
  - Add a short note (README or a comment at the top of the script) that `/admin/create-first-user` is broken by an unresolved upstream bug ([payloadcms/payload#12640](https://github.com/payloadcms/payload/issues/12640), [#13030](https://github.com/payloadcms/payload/issues/13030)) and this script is the supported way to bootstrap the first admin.
- **Starts at:** `scripts/seed-admin.ts`, `package.json`
- **Depends on:** None (runs via `bun` directly against `payload.config.ts`, same as `next dev` — does not go through the CLI's `tsx`/`--use-swc` path, so independent of T4)
- **Verify:**
  - Delete any local `dev.db` to start clean, run `ADMIN_EMAIL=... ADMIN_PASSWORD=... bun run seed:admin`; expect a success message and a new row in the `users` table.
  - Run `bun --bun next dev`, visit `/admin/login`, log in with the seeded credentials; expect the dashboard to load (not the 500 that `/admin/create-first-user` produces).

#### T8 — `site-instellingen` global

- **Change:**
  - Create `src/globals/SiteInstellingen.ts` (`GlobalConfig`, `slug: 'site-instellingen'`) with fields: `siteNaam` (text, required), `menu` (array of `{ label: text required, url: text required }`), `footer` (textarea), `contactgegevens` (group: `email`, `telefoon`, `adres`, all optional text).
  - Access: `read` — `true` for unauthenticated requests and for admin, `false` for a logged-in auteur or redacteur (per the prose-over-matrix decision above); `update` — admin only (`isAdmin`).
  - Register it in `src/payload.config.ts`'s `globals: [...]` array.
- **Starts at:** `src/globals/`
- **Depends on:** None (uses only the already-correctly-typed collection-level `isAdmin`/role check; no dependency on T1's field-level fix)
- **Verify:**
  - `bunx tsc --noEmit` clean.
  - `bun --bun next dev`; as the seeded admin, visit `/admin/globals/site-instellingen`, edit and save each field successfully.
  - `curl http://localhost:3000/api/globals/site-instellingen` (no auth) returns 200 with the saved data.
  - Log in as a redacteur-role test user; confirm `site-instellingen` does not appear / is not readable in the admin panel.

#### T9 — Shared content-collection helpers

- **Change:**
  - `src/collections/shared/contentFields.ts`: a `contentFields()` function returning the common `Field[]` shared by every content collection — `title` (text, required), `slugField()` (from `payload`, keyed off `title`), `status` (select `draft`/`published`, default `draft`, required, `access.update: isRedacteurOrAdminField` from T1), `author` (relationship to `users`, sidebar position, **no static `admin.readOnly`** — `access.update: isRedacteurOrAdminField` instead, so Payload's admin UI disables the field per-viewer automatically based on computed permissions, and a Redacteur retains PROJECT.md's "alles ... ongeacht wie de auteur is" ability to correct a wrongly-attributed author, not just Admin), `content` (richText via `lexicalEditor()`), `date` (date, optional), `image` (upload relationship to `media`, optional).
  - `src/collections/shared/setAuthor.ts`: a reusable `beforeChange` hook, parameterized by field name, that **unconditionally** sets the field to the requesting user's id on create when a user is present (ignoring/overwriting any client-supplied value — closes the authorship-spoofing gap an independent review flagged in the current `Media.ts` hook). Update `Media.ts` to use this shared hook for `uploadedBy`, drop its static `admin.readOnly: true`, and add the same `access.update: isRedacteurOrAdminField` lock to its `uploadedBy` field, removing the now-duplicated inline hook.
  - `src/access/contentReadAccess.ts` (replaces `src/access/publishedOrLoggedIn.ts`, which becomes dead code and should be deleted): two role-aware read functions —
    - `publishedOrOwn(ownerField = 'author'): Access` — unauthenticated: published-only filter; the document's own author: also sees their own non-published drafts (`{ or: [{ status: { equals: 'published' } }, { [ownerField]: { equals: user.id } }] }`); redacteur/admin: unrestricted.
    - `publishedOrRedacteur: Access` — unauthenticated: published-only filter; redacteur/admin: unrestricted; any other authenticated user (i.e. Auteur): `false` (no access at all, matching `PROJECT.md`'s "Geen toegang tot Praktische info").
  - `src/access/contentAccess.ts`: two presets — `authoredContentAccess` (`read: publishedOrOwn()`, `create: isAuthorOrAbove`, `update: isOwnerOrRedacteur('author')`, `delete: isOwnerOrRedacteur('author')`) and `editorOnlyContentAccess` (`read: publishedOrRedacteur`, `create/update/delete: isRedacteurOrAdmin`).
- **Starts at:** `src/collections/shared/`, `src/access/contentAccess.ts`, `src/access/contentReadAccess.ts`
- **Depends on:** T1 (needs `isAdminField`/`isRedacteurOrAdminField`)
- **Verify:**
  - `bunx tsc --noEmit` clean.
  - `bun --bun next dev`; open Media in the admin, confirm upload + owner-stamping still works, and as an auteur-role user send a `PATCH` to a Media doc's `uploadedBy` field via the REST API — Payload discards field-access-denied updates silently (200 response, field unchanged), so confirm the response body shows `uploadedBy` unchanged rather than expecting an error status (regression + security check on the hook/field-lock extraction).

#### T10 — The six author-manageable content collections

- **Change:**
  - Create `src/collections/Nieuws.ts`, `Agenda.ts`, `Interviews.ts`, `Geschiedenis.ts`, `DuivelseKunst.ts`, `Vakmensen.ts` — each a `CollectionConfig` using the exact slugs from `PROJECT.md` (`nieuws`, `agenda`, `interviews`, `geschiedenis`, `duivelse-kunst`, `vakmensen`), `fields: contentFields()`, `access: authoredContentAccess`, `hooks: { beforeChange: [setAuthor('author')] }`, `admin: { useAsTitle: 'title' }`.
  - Register all six in `src/payload.config.ts`'s `collections: [...]` array.
- **Starts at:** `src/collections/`
- **Depends on:** T9
- **Verify:**
  - `bun run payload generate:types`; expect `payload-types.ts` to include all six generated types.
  - `bun --bun next dev`; as the seeded admin, confirm all six collections appear in the admin sidebar and a document can be created, saved as draft, and published in each.
  - As an auteur-role test user: create a document, confirm you can edit and delete your own draft, confirm you cannot see or edit another auteur's draft, confirm you cannot set `status` to `published`.
  - `bunx tsc --noEmit` clean.

#### T11 — `praktische-info` collection (editor-only)

- **Change:**
  - Create `src/collections/PraktischeInfo.ts`: `slug: 'praktische-info'`, `fields: contentFields()`, `access: editorOnlyContentAccess`, `hooks: { beforeChange: [setAuthor('author')] }`.
  - Register it in `src/payload.config.ts`.
- **Starts at:** `src/collections/PraktischeInfo.ts`
- **Depends on:** T9
- **Verify:**
  - `bun run payload generate:types` includes the new type; `bunx tsc --noEmit` clean.
  - As an auteur-role test user, confirm `praktische-info` is entirely inaccessible (no read, not just no write) — this is the case `publishedOrRedacteur` exists to handle, distinct from the six collections above.
  - As a redacteur-role test user, confirm full create/edit/publish/delete access.

#### T12 — Full regression pass

- **Change:** None — verification only.
- **Starts at:** repo root
- **Depends on:** T1–T11
- **Verify:**
  - `bunx tsc --noEmit` → zero errors.
  - `bun --bun next build` → succeeds.
  - `bun run payload generate:types` → succeeds; `payload-types.ts` contains `User`, `Media`, `SiteInstellingen`, and all seven content-collection types.
  - Fresh `dev.db`, `bun run seed:admin`, `bun --bun next dev`, log in at `/admin/login`, confirm every collection and the global load and are editable per role (spot-check with one admin session, one redacteur session, and one auteur session).
  - `git status` reviewed, all new/changed files staged and committed.

## Final acceptance

- **Checks:** All T1–T12 verify steps pass; `bunx tsc --noEmit` and `bun --bun next build` both clean; `payload-types.ts` exists and is current; admin panel fully usable end-to-end via the seeded-admin workaround; the two Users safety guards (T2) and the authorship/status field locks (T9) hold up under a non-admin API request, not just in the UI.
- **End state:** A Payload CMS backend matching every collection, global, and access rule in `PROJECT.md` — including its prose, where that's more specific than the summary table — buildable and deployable with a correctly-configured Bun runtime, with a working local dev loop (`bun dev`, `bun run payload generate:types`, `bun run seed:admin`).
- **Deferrals or blockers:** The public `(site)` frontend and its revalidation hook are out of scope (separate future plan). The upstream `/admin/create-first-user` bug remains unfixed in Payload itself — worked around, not resolved; revisit if Payload ships a fix. Actual Turso/Vercel Blob account provisioning still needs to happen outside this repo before a real deploy. Worth a follow-up to `PROJECT.md` itself: its Rechtenmatrix table's `Globals (instellingen)` row doesn't match its own prose for either Auteur or Redacteur — this plan implements the prose, but the table should probably be corrected for future readers.

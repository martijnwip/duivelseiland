# CLAUDE.md

Projectbeschrijving, rollen, rechtenmatrix, stack en deploy staan in PROJECT.md:

@PROJECT.md

## Werkafspraken

- Alleen Bun: geen `node`, `npm`, `npx` of `pnpm`. Scripts draaien met `--bun` (zie `package.json`); `bun.lock` is de enige lockfile.
- Lokaal draaien: `bun dev`. Inloggen als test-admin: `bun run dev:login` (magic link) of `bun run seed:admin`.
- Schemawijzigingen in Payload (collections/globals/velden) vragen een migratie in `src/migrations/` (`bun payload migrate:create <naam>`). `bun run build` draait de migraties.
- Rechten afdwingen in de Payload access-functies (`src/access/`), niet alleen in de UI. Publiceren (`status = published`) is voorbehouden aan redacteur en admin.
- De publieke site is tweetalig (NL/EN): tekstvelden die bezoekers zien krijgen `localized: true`, UI-teksten gaan via next-intl (`messages/`).
- Parallel werken aan een branch: `./scripts/wt-new.sh <naam>` in plaats van een kale `git worktree add`.

# Duivelseiland

Dit is een website voor de bewoners van DuivelsEiland. Op deze website komt meer informatie over de volgende onderwerpen:
- Waar komt de naam vandaan?
- Geschiedenis : 
- Praktische info
  - grof vuil
  - melden overlast
- Duivelse Kunst
- Vakmensen
- Interviews
- Geschiedenis
- Buurt Statistieken 👉 STATISTIEKEN.md
- Nieuws
- Agenda

## Tweetalig
Omdat er veel expats in de buurt wonen zal de public-facing site tweetalig worden gemaakt met een switch tussen Nederlands / Engels


## Stack

- Next.js (App Router) op Vercel
- Payload CMS binnen dezelfde Next.js-app (admin op `/admin`)
- Database: SQLite via libSQL (Turso), adapter `@payloadcms/db-sqlite`
- Media: Vercel Blob via de Payload storage-adapter

## Buiten het CMS

Statistieken over de buurt staan niet in Payload maar als JSON in de repo; zie `statistieken.md`. Uitwerking volgt later.

## Rollen

Er zijn drie ingelogde rollen en één publieke rol. Een gebruiker heeft precies één rol, vastgelegd in het veld `role` op de collection `users`.

### Bezoeker (niet ingelogd)

- Ziet alleen gepubliceerde content (`status = published`).
- Kan niets aanmaken, wijzigen of verwijderen.
- Heeft geen toegang tot `/admin`.

### Auteur

Buurtbewoner of vrijwilliger die content aanlevert.

- Kan items aanmaken in: Nieuws, Agenda, Interviews, Geschiedenis, Duivelse Kunst, Vakmensen.
- Kan alleen eigen items bewerken en verwijderen (veld `author = ingelogde gebruiker`).
- Kan eigen items alleen opslaan als concept (`draft`); publiceren is niet toegestaan.
- Kan media uploaden en alleen eigen uploads verwijderen.
- Geen toegang tot: Praktische info, gebruikersbeheer.

### Redacteur

Verantwoordelijk voor de inhoud en de kwaliteit van de site.

- Alles wat een auteur kan, op alle items, ongeacht wie de auteur is.
- Kan items publiceren en depubliceren.
- Kan Praktische info beheren.
- Kan alle media beheren.
- Geen toegang tot gebruikersbeheer en site-instellingen.

### Admin

Technisch beheerder.

- Alles wat een redacteur kan.
- Beheert gebruikers: aanmaken, rol toewijzen, deactiveren, verwijderen.
- Beheert globale instellingen (sitenaam, menu, footer, contactgegevens).
- Kan de eigen rol niet verlagen en de laatste admin niet verwijderen.

## Rechtenmatrix

| Collection             | Bezoeker          | Auteur                           | Redacteur                    | Admin |
| ---------------------- | ----------------- | -------------------------------- | ---------------------------- | ----- |
| Nieuws                 | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Agenda                 | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Interviews             | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Geschiedenis           | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Duivelse Kunst         | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Vakmensen              | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Praktische info        | lezen (published) | geen                             | alles                        | alles |
| Media                  | lezen             | uploaden, eigen verwijderen      | alles                        | alles |
| Users                  | geen              | eigen profiel lezen/bewerken     | eigen profiel lezen/bewerken | alles |
| Globals (instellingen) | lezen             | geen                             | lezen                        | alles |

## Regels die voor alle rollen gelden

- Elk contentitem heeft een `status` (`draft` / `published`) en een `author`-relatie naar `users`.
- Alleen `published` items zijn zichtbaar op de site.
- Wijzigen van `status` naar `published` is voorbehouden aan redacteur en admin; dit wordt afgedwongen in de Payload access-functie voor `update`, niet alleen in de UI.
- De rol `role` op `users` is alleen door een admin te wijzigen (veldniveau access).
- Verwijderen is definitief; er is geen prullenbak. Overweeg voor Geschiedenis en Interviews een extra status `archived` in plaats van verwijderen.

## Implementatie in Payload (samenvatting)

- `users.role`: select-veld met opties `admin`, `redacteur`, `auteur`; standaard `auteur`.
- Hulpfuncties in `access/`:
  - `isAdmin`
  - `isRedacteurOrAdmin`
  - `isAuthorOrAbove`
  - `isOwnerOrRedacteur` (query-constraint: `{ author: { equals: user.id } }` voor auteur, `true` voor redacteur/admin)
  - `publishedOrLoggedIn` (query-constraint voor `read`: `{ status: { equals: 'published' } }` voor bezoekers)
- Veldniveau access op `status`: `update` alleen voor redacteur/admin.
- Veldniveau access op `users.role`: `update` alleen voor admin.

# Techstack

## Kern

| Laag                       | Keuze                                             | Reden                                                                      |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Framework                  | Next.js (App Router, TypeScript)                  | Site en admin in één codebase en één deploy                                |
| CMS                        | Payload CMS                                       | Draait in Next.js, rollen ingebouwd, admin op `/admin`                     |
| Database                   | SQLite via Turso (libSQL)                         | SQLite-dialect, werkt serverless op Vercel                                 |
| DB-adapter                 | `@payloadcms/db-sqlite`                           | Officiële Payload-adapter voor libSQL                                      |
| Media                      | Vercel Blob via `@payloadcms/storage-vercel-blob` | Vercel heeft geen schrijfbaar bestandssysteem                              |
| Hosting                    | Vercel                                            | Gratis tier, preview-deploys, Git-koppeling                                |
| Runtime en package manager | Bun                                               | Lokaal en op Vercel (`bunVersion` in `vercel.json`); geen Node in de keten |
| Styling                    | Tailwind CSS                                      | Weinig eigen CSS, geen componentbibliotheek nodig                          |

## Bewust weggelaten

- Geen aparte backend of API-server: Payload levert de REST- en Local API.
- Geen ORM naast Payload: de adapter regelt schema en migraties.
- Geen auth-library: Payload's ingebouwde users-collection met rollen.
- Geen UI-kit, geen state-manager, geen i18n (site is Nederlandstalig).
- Geen Docker; lokaal draait `bun dev` tegen een lokaal SQLite-bestand.
- Geen Node en geen npm/pnpm; `bun.lock` is de enige lockfile.

## Bun op Vercel

- `vercel.json`: `{ "bunVersion": "1.x" }`. Vercel installeert Bun en draait Next.js-routes op de Bun-runtime.
- `package.json`-scripts met `--bun`, anders valt `next` terug op Node:

```json
{
  "scripts": {
    "dev": "bun --bun next dev",
    "build": "bun --bun next build",
    "start": "bun --bun next start",
    "payload": "bun --bun payload"
  }
}
```

- De Bun-runtime op Vercel is publieke bèta. Als Payload of `sharp` daar problemen geeft, is de terugvaloptie: `bunVersion` weghalen en `--bun` uit de scripts halen; Bun blijft dan alleen package manager en de app draait op Node. Dat kost geen codewijziging.

## Omgevingen

|                    | Database                      | Media               |
| ------------------ | ----------------------------- | ------------------- |
| Lokaal             | `file:./dev.db`               | lokale map `media/` |
| Preview (Vercel)   | Turso, aparte branch-database | Vercel Blob         |
| Productie (Vercel) | Turso, productie-database     | Vercel Blob         |

## Environment variables

```
DATABASE_URI=libsql://<naam>.turso.io
DATABASE_AUTH_TOKEN=<turso-token>
PAYLOAD_SECRET=<lange-random-string>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
NEXT_PUBLIC_SERVER_URL=https://<domein>
```

Lokaal: `DATABASE_URI=file:./dev.db`, token leeg laten.

## Projectstructuur

```
src/
  app/
    (site)/          publieke pagina's
    (payload)/       admin en API, gegenereerd door Payload
  collections/       één bestand per collection
  globals/           site-instellingen (menu, footer, contact)
  access/            rol-functies (isAdmin, isRedacteurOrAdmin, ...)
  payload.config.ts
```

## Collections

`users`, `media`, `nieuws`, `agenda`, `interviews`, `geschiedenis`, `duivelse-kunst`, `vakmensen`, `praktische-info`

Buurtstatistieken staan buiten Payload als JSON in de repo (zie `statistieken.md`).

Elke content-collection heeft `title`, `slug`, `status` (draft/published), `author`, `content` (rich text) en waar nodig `date`, `image`.

## Data ophalen in de site

Server components gebruiken de Payload Local API (`getPayload({ config })`), geen fetch naar de eigen REST-API. Pagina's zijn statisch met revalidatie; een Payload `afterChange`-hook roept `revalidatePath` aan, zodat een publicatie direct zichtbaar is.

## Deploy

1. Repo op GitHub, project koppelen in Vercel.
2. Turso-database aanmaken, URL en token als env vars in Vercel zetten.
3. Vercel Blob store aanmaken, token toevoegen.
4. `vercel.json` met `bunVersion` committen; eerste deploy; migraties draaien via `bun payload migrate`.
5. Eerste admin-account aanmaken op `/admin`.

## Kosten

Vercel Hobby, Turso Free en Vercel Blob Free volstaan voor deze omvang. Enige aandachtspunt: Blob-opslag en bandbreedte bij veel grote foto's; afbeeldingen bij upload verkleinen via Payload's `imageSizes`.
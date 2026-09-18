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
- Geen UI-kit, geen state-manager; i18n beperkt tot Payload localization + next-intl routing (zie "Tweetalig").
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
5. Eerste admin-account aanmaken op `/admin` (of lokaal via `bun run seed:admin`, zie hieronder).

### Eerste admin-account lokaal aanmaken

Payload toont automatisch een "eerste gebruiker aanmaken"-scherm op `/admin` zodra de `users`-collectie leeg is — een script is daar dus niet strikt voor nodig. Voor snel lokaal testen (bv. na een nieuwe worktree of een verse `dev.db`) is er wel `scripts/seed-admin.ts`:

```bash
bun run seed:admin                        # maakt test@test.nl / test aan, rol admin
bun run seed:admin jij@voorbeeld.nl geheim # eigen e-mail/wachtwoord
```

Idempotent: bestaat het e-mailadres al, dan gebeurt er niets. Bedoeld voor lokale ontwikkeling — niet voor productie (zwak standaardwachtwoord).

## Content vertalen (NL → EN)

### Live "Vertaal naar Engels"-knop in de admin (primaire aanpak)

Elk contentdocument (Nieuws, Agenda, Interviews, Geschiedenis, Duivelse Kunst, Vakmensen, Praktische info, Media) en de `SiteInstellingen`-global heeft in `/admin` een knop **"Vertaal naar Engels"** naast de standaard document-knoppen. Bij een klik:

- ontdekt de server **dynamisch** (door `payload.config`'s velddefinities te doorlopen, niet via een handmatige lijst) welke `localized: true`-velden op dat document een lege Engelse waarde hebben terwijl de Nederlandse wel gevuld is — werkt dus automatisch mee met nieuwe collecties/velden, ook als het schema nog verandert;
- vertaalt die velden via MyMemory (zie hieronder), inclusief rich text (`content`) met behoud van opmaak (koppen, vet, lijsten — alleen de tekst verandert);
- schrijft alleen de vertaalde velden terug, met een tweede check vlak vóór het schrijven of het Engelse veld nog steeds leeg is (beschermt tegen een handmatige wijziging die tussendoor is gebeurd);
- toont een melding met het aantal vertaalde/mislukte velden.

Rechten: `redacteur`/`admin` voor content en Media, alleen `admin` voor `SiteInstellingen` (zelfde als de bestaande update-rechten). De endpoint zit op `POST /api/translate-doc` (`src/endpoints/translateDoc.ts`); de kernlogica staat in `src/lib/translate-live/` (`engines.ts`, `lexical.ts`, `field-walker.ts`).

**Vertaal-engine: MyMemory, met een kwaliteitsdrempel.** MyMemory is een vertaalgeheugen (geeft de best-passende eerder-vertaalde zin uit zijn database terug, geen zuivere neurale vertaler) en kan bij korte/generieke tekstfragmenten — vaak het geval in rich text, waar een zin per opmaak-run in meerdere tekstnodes wordt opgesplitst — een compleet ongerelateerd resultaat teruggeven. Concreet voorbeeld tijdens het testen: "Dit weekend is er een groot feest voor de buurt" kwam een keer terug als *"There is a TV, radio and CD-player. One big party! for the neighborhood."* MyMemory geeft per resultaat een `match`-kwaliteitsscore (0–1) mee; onder de 0,7 wordt het resultaat nu als mislukt behandeld (veld blijft leeg voor handmatige aanvulling) in plaats van de rommelige tekst te gebruiken.

**LibreTranslate was overwogen als terugval-engine, maar bleek niet bruikbaar**: hun publieke demo vereist inmiddels een betaalde API-key (geen gratis laag meer — bevestigd via hun eigen prijzenpagina, `$29`/maand minimaal). Er is dus bewust **geen terugval-engine**; bij een mislukte of onbetrouwbare vertaling blijft het veld leeg voor handmatige invulling.

### Offline scriptketen (handmatig terugvalalternatief)

Voor een volledige bulkvertaling buiten de site om (bv. alle productie-content in één keer, zonder de admin te openen) is er een losstaande scriptketen: `scripts/export.ts` → `translate/translate.py` → `scripts/reseed.ts`. Deze vult **alleen lege Engelse velden** — bestaande (handmatig ingevoerde) Engelse tekst wordt nooit overschreven — en houdt bij `content` (rich text) de Lexical-opmaak (koppen, vet, lijsten) volledig intact; er wordt alleen tekst vertaald, geen structuur.

### Waar de vertaalde tekst staat

Elk gelokaliseerd veld (`localized: true`) staat niet in de hoofdtabel van de collectie/global, maar in een aparte `<naam>_locales`-tabel met kolommen `_locale` (`nl`/`en`) en `_parent_id` (verwijzing naar het hoofddocument). Bijvoorbeeld: de welkomstboodschap (`intro`-veld op de `SiteInstellingen`-global) staat in tabel `site_instellingen_locales`, kolom `intro`. Hetzelfde patroon geldt voor `title`/`content` van elke contentcollectie (bv. `nieuws_locales`) en `alt`/`caption` van `Media` (`media_locales`). Niet-gelokaliseerde velden (zoals `siteNaam`) staan gewoon in de hoofdtabel zelf.

### Draaien

Eenmalige Python-setup (per werkdirectory/worktree — `translate/.venv/` staat in `.gitignore`, dus dit moet opnieuw na elke nieuwe checkout/worktree):

```bash
bun run translate:setup
```

Lokaal (aanbevolen eerst, om te reviewen in `/admin` voordat productie wordt aangeraakt):

```bash
bun run export:local
bun run translate data/export.local.<tijdstip>.json
bun run reseed:local data/translated.export.local.<tijdstip>.json
```

Productie (pas na goedkeuring van de lokale run):

```bash
vercel link                                                    # eenmalig
vercel env pull .env.production.local --environment=production
bun run export:prod
bun run translate data/export.prod.<tijdstip>.json
bun run reseed:prod data/translated.export.prod.<tijdstip>.json
```

### Huidige vertaal-engine: MyMemory (via `deep-translator`)

Oorspronkelijk stond dit op Google Translate, maar dat endpoint gaf vanaf onze eigen ontwikkelmachine aanhoudend HTTP 429 (rate-limited/geblokkeerd, geverifieerd met een directe `curl`-test) — dus omgezet naar MyMemory, dat op hetzelfde moment wel gewoon werkte. Nadelen om in de gaten te houden:

- Ook een onofficieel/gratis endpoint (niet zo'n harde ToS-schending als Google's webendpoint, maar ook geen officiële garanties).
- **Limiet van 500 tekens per aanroep** — langere tekstnodes in rich text (`content`-velden) kunnen daardoor falen; `translate.py` vangt dat af als een normale mislukking (zie `failed` in de samenvatting), het crasht niet, maar dat stukje tekst blijft dan onvertaald.
- Gratis gebruik zonder account is beperkt tot ~5.000 woorden/dag.
- Kan, net als Google, op elk moment zonder waarschuwing anders gaan reageren — het is en blijft een niet-gecontracteerde gratis dienst.

### Alternatieven mocht MyMemory ook blokkeren

`deep-translator` ondersteunt meerdere vertaal-backends via dezelfde interface, dus een switch is in `translate/translate.py` één regel (`_translator = MyMemoryTranslator(...)` vervangen), geen herschrijving:

- **DeepL API Free** (aanbevolen upgrade) — officiële, gedocumenteerde API, gratis tot 500.000 tekens/maand, betere vertaalkwaliteit, geen 500-tekenlimiet. Vereist een gratis DeepL-account + API-key. `DeeplTranslator(api_key=..., source='nl', target='en')`.
- **Argos Translate** — volledig offline/open-source, geen API-key, geen limiet, geen ToS-risico. Kwaliteit merkbaar lager dan Google/DeepL, maar geen netwerkafhankelijkheid.
- **Google** (`GoogleTranslator`) — was de oorspronkelijke keuze, vanaf deze machine geblokkeerd; kan op een ander netwerk mogelijk wel werken.
- **Handmatig** — de oorspronkelijke aanpak voor doorlopende redactie: zelf de Engelse tekst intypen per veld in `/admin`. Blijft altijd beschikbaar als terugvaloptie, ongeacht wat er met een vertaal-API gebeurt.

## Kosten

Vercel Hobby, Turso Free en Vercel Blob Free volstaan voor deze omvang. Enige aandachtspunt: Blob-opslag en bandbreedte bij veel grote foto's; afbeeldingen bij upload verkleinen via Payload's `imageSizes`.
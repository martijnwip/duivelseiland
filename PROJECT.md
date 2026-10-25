# Duivelseiland

Dit is een website voor de bewoners van DuivelsEiland. Op deze website komt meer informatie over de volgende onderwerpen:
- Waar komt de naam vandaan?
- Geschiedenis 👉 GESCHIEDENIS.md
- Praktische info
  - grof vuil
  - melden overlast
  - geluid & lawaai (verbouwen, feestjes) 👉 `/geluid`, zie "Geluid" hieronder
- Duivelse Kunst
- Vaklui
- Interviews
- Geschiedenis
- Buurt Statistieken 👉 STATISTIEKEN.md
- Nieuws
- Agenda
- Activiteiten 👉 docs/brief-activiteiten.md

## Tweetalig
Omdat er veel expats in de buurt wonen zal de public-facing site tweetalig worden gemaakt met een switch tussen Nederlands / Engels


## Stack

- Next.js (App Router) op Vercel
- Payload CMS binnen dezelfde Next.js-app (admin op `/admin`)
- Database: SQLite via libSQL (Turso), adapter `@payloadcms/db-sqlite`
- Media: Vercel Blob via de Payload storage-adapter

## Buiten het CMS

Statistieken over de buurt staan niet in Payload maar als JSON in de repo; zie `STATISTIEKEN.md`. Uitwerking volgt later.

## Rollen

Er zijn vier ingelogde rollen en één publieke rol. Een gebruiker heeft precies één rol, vastgelegd in het veld `role` op de collection `users`.

### Bezoeker (niet ingelogd)

- Ziet alleen gepubliceerde content (`status = published`).
- Kan niets aanmaken, wijzigen of verwijderen.
- Heeft geen toegang tot `/admin`.
- Met een **buurtpas** (geen account, zie "Buurtpas" hieronder) ziet een bezoeker ook telefoonnummers van vaklui, WhatsApp-knoppen en items met "Alleen voor de buurt".

### Organisator

Buurtbewoner van wie een activiteitidee is goedgekeurd (zie `docs/brief-activiteiten.md`). Laagste rol, onder auteur.

- Ziet en bewerkt alleen de eigen activiteit(en), de aanmeldingen daarvan en de berichten aan deelnemers.
- Kan geen andere content aanmaken; ziet in `/admin` alleen Activiteiten, Aanmeldingen, Berichten, Media en het eigen profiel.

### Auteur

Buurtbewoner of vrijwilliger die content aanlevert.

- Kan items aanmaken in: Nieuws, Agenda.
- Kan alleen eigen items bewerken en verwijderen (veld `author = ingelogde gebruiker`).
- Kan eigen items alleen opslaan als concept (`draft`); publiceren is niet toegestaan.
- Kan media uploaden en alleen eigen uploads verwijderen.
- Geen toegang tot: Interviews, Geschiedenis, Duivelse Kunst, Vaklui, Praktische info, gebruikersbeheer.

### Redacteur

Verantwoordelijk voor de inhoud en de kwaliteit van de site.

- Alles wat een auteur kan, op alle items, ongeacht wie de auteur is.
- Kan items publiceren en depubliceren.
- Kan Praktische info en Vaklui beheren.
- Kan alle media beheren.
- Geen toegang tot Interviews, Geschiedenis en Duivelse Kunst, de globals Site-instellingen, Over de naam en Geschiedenisverhaal, de Auth-groep en gebruikersbeheer. Zo blijft `/admin` overzichtelijk; die onderdelen beheert de admin.

### Admin

Technisch beheerder.

- Alles wat een redacteur kan.
- Beheert gebruikers: aanmaken, rol toewijzen, deactiveren, verwijderen.
- Beheert globale instellingen (sitenaam, menu, footer, contactgegevens) en de globals Over de naam en Geschiedenisverhaal.
- Beheert als enige Interviews, Geschiedenis en Duivelse Kunst.
- Kan de eigen rol niet verlagen en de laatste admin niet verwijderen.

## Rechtenmatrix

| Collection             | Bezoeker          | Auteur                           | Redacteur                    | Admin |
| ---------------------- | ----------------- | -------------------------------- | ---------------------------- | ----- |
| Nieuws                 | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Agenda                 | lezen (published) | aanmaken, eigen bewerken (draft) | alles + publiceren           | alles |
| Interviews             | lezen (published) | geen                             | geen                         | alles |
| Geschiedenis           | lezen (published) | geen                             | geen                         | alles |
| Duivelse Kunst         | lezen (published) | geen                             | geen                         | alles |
| Vaklui              | lezen (published); met buurtpas aanmelden via formulier | geen | alles + modereren | alles |
| Vakken (tags bij Vaklui) | lezen        | geen                             | alles                        | alles |
| Praktische info        | lezen (published) | geen                             | alles                        | alles |
| Media                  | lezen             | uploaden, eigen verwijderen      | alles                        | alles |
| Users                  | geen              | eigen profiel lezen/bewerken     | eigen profiel lezen/bewerken | alles |
| Activiteiten           | lezen (goedgekeurd/gaat-door/afgelopen), idee indienen via formulier | lezen (publiek) | alles + modereren | alles |
| Aanmeldingen / Berichten | inschrijven/afmelden via formulier | geen                      | alles                        | alles |
| WhatsApp-aanmeldingen  | met buurtpas aanmelden via formulier | geen                    | alles                        | alles |
| Nieuwsbrief-abonnees   | aan-/afmelden via formulier | geen                              | alles (import: alleen admin) | alles |
| Nieuwsbrief-edities    | geen              | geen                             | alles + versturen (als de admin het vrijgeeft) | alles |
| E-mailadressen (adresboek) | geen            | geen                             | geen                         | alles |
| Globals: Site-instellingen, Over de naam, Geschiedenisverhaal | lezen | geen          | geen                         | alles |
| Global: Buurtborrel    | lezen             | geen                             | alles                        | alles |

Organisator: alleen de eigen activiteit (bewerken, fase binnen goedgekeurd/gaat-door/afgelast/afgelopen), de aanmeldingen daarvan (lezen, verwijderen, CSV) en berichten aan die deelnemers (max. 3 per week).

## Regels die voor alle rollen gelden

- Elk contentitem heeft een `status` (`draft` / `published`) en een `author`-relatie naar `users`.
- Alleen `published` items zijn zichtbaar op de site.
- Wijzigen van `status` naar `published` is voorbehouden aan redacteur en admin; dit wordt afgedwongen in de Payload access-functie voor `update`, niet alleen in de UI.
- De rol `role` op `users` is alleen door een admin te wijzigen (veldniveau access).
- Verwijderen is definitief; er is geen prullenbak. Overweeg voor Geschiedenis en Interviews een extra status `archived` in plaats van verwijderen.

## Implementatie in Payload (samenvatting)

- `users.role`: select-veld met opties `admin`, `redacteur`, `auteur`, `organisator`; standaard `auteur`.
- Hulpfuncties in `access/`:
  - `isAdmin`
  - `isRedacteurOrAdmin`
  - `isAuthorOrAbove`
  - `isOwnerOrRedacteur` (query-constraint: `{ author: { equals: user.id } }` voor auteur, `true` voor redacteur/admin)
  - `publishedOrLoggedIn` (query-constraint voor `read`: `{ status: { equals: 'published' } }` voor bezoekers)
  - `adminOnlyContentAccess` (Interviews, Geschiedenis, Duivelse Kunst: bezoekers lezen published, verder alleen admin)
  - `editorOnlyContentAccess` (Praktische info, Vaklui: bezoekers lezen published, verder redacteur en admin)
  - `publiekOfAdmin` (`read` voor globals die alleen de admin beheert; zonder leesrecht verdwijnt het item ook uit `/admin`)
  - `zonderBuurtitems` / `publiekZichtbaar` (`read` van contentcollecties: bezoekers via de API zien geen items met `alleenBuurt`)
  - `alleenIngelogdField` (veldniveau `read` op telefoonnummers: vaklui-`telefoon`, agenda-`whatsappNumber`, buurtborrelnummers)
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
| Productie (Vercel) | Turso, productie-database     | Vercel Blob         |

Er zijn geen preview-deploys: `vercel.json` (`git.deploymentEnabled`) laat Vercel alleen `main` bouwen. Een aparte preview-database kost geld, en zonder die database zou een preview zijn migraties op de productiedatabase draaien. Testen gebeurt lokaal; een merge naar `main` gaat direct live.

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

`users`, `media`, `nieuws`, `agenda`, `interviews`, `geschiedenis`, `duivelse-kunst`, `vaklui`, `vakken`, `praktische-info`, `activiteiten`, `activiteit-inschrijvingen`, `activiteit-berichten`, `email-adressen`, `nieuwsbrief-abonnees`, `nieuwsbrief-edities`, `nieuwsbrief-verzendingen`, `whatsapp-aanmeldingen`

Buurtstatistieken staan buiten Payload als JSON in de repo (zie `STATISTIEKEN.md`).

Elke content-collection heeft `title`, `slug`, `status` (draft/published), `author`, `content` (rich text) en waar nodig `date`, `image`.

Uitzondering: **Vaklui** heeft `naam`, `vakken` (één of meer tags uit de collection `vakken`; met de + in het veld voeg je direct een nieuw vak toe), `telefoon`, `website`, `aanbeveling` (gelokaliseerd, optioneel), plus `status` en `author`. De site toont ze als één overzicht op `/vaklui`, gegroepeerd per vak, zonder detailpagina's. Vaknamen zijn tweetalig.

**Vakman aanmelden.** Buren met een buurtpas kunnen op `/vaklui/aanmelden` een vakman aanmelden: naam, vakken (vinkjes) en/of *Ander vak*, telefoon en/of website, de eigen naam en een aanbeveling (waarom deze vakman). Na goedkeuring staat de aanbeveling op de kaart van de vakman, zonder naam van de aanmelder; de redactie kan hem in `/admin` aanpassen of leegmaken. Het e-mailadres komt uit de buurtpas. De aanmelding komt binnen als concept met `moderatie = ingediend`. De redactie krijgt een mail; de aanmelder krijgt een ontvangstmail met een intrekken-link (`/vaklui/aanmelding/intrekken/<token>`, werkt tot goedkeuring). In `/admin` staan bovenaan de knoppen **Goedkeuren** (zet `status = published`; er moet een vak gekoppeld zijn, dus zet *Ander vak* eerst om met de +) en **Afkeuren** (reden verplicht, gaat naar de aanmelder; de vakman gaat terug naar concept). Een afgekeurde aanmelding kun je opnieuw goedkeuren. Handmatig publiceren telt ook als goedkeuren. De regels staan in `src/lib/vaklui/workflow.ts`; de gegevens van de aanmelder zijn alleen voor redacteur en admin. In het adresboek staat de aanmelder als "vakman aangemeld". Verwijder je het adres, dan verdwijnt een open of afgekeurde aanmelding; bij een goedgekeurde gaan alleen de gegevens van de aanmelder weg (de aanbeveling blijft).

**WhatsApp-groepen aanmelden.** Buren met een buurtpas melden zich op `/whatsapp` aan voor de Buren-app Duivelseiland en/of de groep van de Duivelse Schoonmaak: naam, telefoonnummer en de groep(en). Het e-mailadres komt uit de buurtpas. De redactie krijgt een mail (zonder telefoonnummer) en voegt het nummer zelf toe in WhatsApp. Zet de redactie de aanmelding in `/admin` op *Toegevoegd*, dan wordt het telefoonnummer gewist. Een tweede aanmelding van hetzelfde adres werkt de open aanmelding bij. In het adresboek staat het adres als "WhatsApp-groep"; verwijder je het adres, dan verdwijnt de aanmelding. Verwijzingen naar het formulier: homepage (bij de Duivelse Schoonmaak), het agenda-item Duivelse Schoonmaak, Praktische info, `/buurtborrel` en de footer. Code: `src/collections/WhatsappAanmeldingen.ts`, `src/components/whatsapp/`, `src/lib/whatsapp-groepen/`.

## Data ophalen in de site

Server components gebruiken de Payload Local API (`getPayload({ config })`), geen fetch naar de eigen REST-API. Pagina's zijn statisch met revalidatie; een Payload `afterChange`-hook roept `revalidatePath` aan, zodat een publicatie direct zichtbaar is.

## Git worktrees

Voor parallel werken aan meerdere branches (bv. losse agent-sessies) zonder steeds te hoeven stashen: `scripts/wt-new.sh` en `scripts/wt-remove.sh`. Los van `package.json`, rechtstreeks draaien.

`scripts/wt-new.sh <naam>` doet meer dan alleen `git worktree add`: het maakt de worktree + branch aan op `../duivelseiland-<naam>` én kopieert wat git zelf niet meeneemt omdat het niet in de repo zit — `.agents`, `.claude` (project-skills/agent-config), alle `.env*`-bestanden, en `dev.db` (+ eventuele `-wal`/`-shm`-sidecars, zodat de nieuwe worktree met dezelfde lokale content/testgebruikers start in plaats van een lege database). Draait daarna zelf `bun install`, en `bun run translate:setup` als dat script op die branch bestaat.

Binnen herdr (`HERDR_ENV=1`) opent `wt-new.sh` daarna in de huidige herdr-workspace een nieuwe tab met de branchnaam als label: links een shell in de worktree, rechts Claude in dezelfde map. Buiten herdr (of zonder `herdr`/`jq`) wordt die stap overgeslagen.

`scripts/wt-remove.sh <naam>` verwijdert een worktree weer volledig (map, git-worktree-registratie en branch), met een expliciete `yes`/`force`-bevestiging voor je iets kwijtraakt.

```bash
./scripts/wt-new.sh mijn-feature
./scripts/wt-remove.sh mijn-feature
```

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

### Homepagina-intro zetten

De intro naast de kaart op de homepagina staat in Site-instellingen (veld `intro`, NL en EN): waar de site voor is en wat je er kunt doen, met links. `scripts/seed-intro.ts` zet die tekst. Het schrijft alleen `intro`; menu, footer en de andere velden blijven staan. De oude intro gaat eerst naar een back-up in `data/`. Daarna is de tekst gewoon te bewerken in `/admin`.

```bash
bun run seed:intro                                  # lokaal
bun run seed:intro:prod                             # productie (eerst vercel env pull, zie hieronder)
bun run seed:intro --herstel data/intro-backup.<omgeving>.<tijdstip>.json  # back-up terugzetten
```

### Geschiedenisverhaal vullen

De pagina `/geschiedenis` toont het verhaal uit de global `geschiedenis-verhaal` (tijdvakken, gebeurtenissen, vaste infographics); ontwerp in `docs/design-brief-geschiedenis.md`, bronmateriaal in `GESCHIEDENIS.md`. Het script vult de concepttekst in NL en EN en importeert de archieffoto's uit de Beeldbank (met datering, maker en rechten):

```bash
bun run seed:geschiedenis          # niets als het verhaal al een titel heeft
bun run seed:geschiedenis --force  # verhaal overschrijven
```

Foto's met rechten "Toestemming nodig" worden nergens op de site getoond, alleen gelinkt.

Eén foto in het verhaal vervangen door een andere Beeldbank-foto, zonder de rest te overschrijven (importeert de nieuwe foto zo nodig; de oude blijft in Historische foto's staan):

```bash
bun run foto:vervang <oude-beeldbank-link> <nieuwe-beeldbank-link>
bun run foto:vervang:prod <oude-beeldbank-link> <nieuwe-beeldbank-link>  # daarna het verhaal 1x opslaan in /admin
```

## Buurtpas

Afgeschermde inhoud zonder account. Een bezoeker vult een e-mailadres in en krijgt een link (30 minuten geldig, één keer bruikbaar). De link opent een pagina met een knop *Activeer buurtpas* (pas bij de klik, zodat mailscanners het token niet verbruiken). Daarna staat er een jaar lang een ondertekende cookie `buurtpas` op dat apparaat. Er is geen wachtwoord en geen `users`-record; het adres staat in het adresboek (`email-adressen`), dat de buurtpasvelden bevat.

Wat afgeschermd is:
- Vaklui: het `telefoon`-veld op het overzicht `/vaklui`. Zonder buurtpas staat er één slot boven de lijst. Naam, vakken en website ziet iedereen.
- WhatsApp-knoppen: agenda-items met een `whatsappNumber` en de knoppen op `/buurtborrel`.
- Items met het vinkje *Alleen voor de buurt* (`alleenBuurt`, alle collecties met `contentFields()`, dus niet Vaklui): in de lijst staat de titel met een slotje, de detailpagina toont alleen titel en slot (noindex), in de nieuwsbrief alleen titel en link.

Hoe ver het gaat: elk bevestigd e-mailadres krijgt een buurtpas. Dat houdt zoekmachines, scrapers en toevallige bezoekers buiten, maar bewijst niet dat iemand in de buurt woont.

Techniek (`src/lib/buurtpas/`, `src/components/buurtpas/`):
- `heeftBuurtpas()` controleert de handtekening en daarna het adres in het adresboek: bestaat het nog, is het niet ingetrokken, klopt `buurtpasVersie`. Pagina's die het aanroepen worden per request gerenderd.
- Maak afgeschermde inhoud alleen aan als `heeftBuurtpas()` waar is; anders `<BuurtpasSlot>`. Geef de gegevens niet als props mee aan een element dat niet gerenderd wordt: in dev belandt dat in de RSC-payload.
- Via de REST/GraphQL-API zijn de nummers en buurtitems alleen voor ingelogde gebruikers.

Zelf regelen op `/buurtpas`:
- **Bij de aanvraag** kan de bezoeker *Stuur mij ook de nieuwsbrief* aanvinken. De klik op de link in de buurtpasmail bevestigt dan ook de nieuwsbrief; er komt geen aparte bevestigingsmail.
- **Met een buurtpas** toont de pagina het e-mailadres en drie knoppen:
  - *Aan- of afmelden voor de nieuwsbrief*: direct, zonder mail, want de buurtpas bewijst dat het adres van de bezoeker is.
  - *Buurtpas van dit apparaat halen*: andere apparaten houden hun buurtpas.
  - *Buurtpas opzeggen*: geldt meteen op alle apparaten. Gebruikt de site het adres nergens anders voor (nieuwsbrief, activiteiten, account), dan verdwijnt het ook uit het adresboek.

Beheer in *E-mailadressen* (admin):
- *Toegang ingetrokken* blokkeert het adres.
- `buurtpasVersie` ophogen maakt alle bestaande buurtpassen van dat adres ongeldig.
- Het adres verwijderen haalt ook de buurtpas weg.

## Nieuwsbrief

Aanmelden gaat met dubbele opt-in op `/nieuwsbrief` en in de footer; de taal van de abonnee (`locale`) is de taal van de pagina waarop de abonnee zich aanmeldde (bij import kiest de admin). Een admin kan adressen importeren (plakken of CSV) bij Nieuwsbrief-abonnees.

**Edities** (`nieuwsbrief-edities`, redacteur en admin): onderwerp en intro (gelokaliseerd) plus uitgelichte Nieuws-, Agenda- en Activiteiten-items. Knoppen bovenaan: *Voorbeeld NL/EN*, *Deellink* (kopieert een link naar het voorbeeld voor meelezers zonder account; toont steeds de actuele tekst, werkt tot je verstuurt, en een nieuwe deellink maakt de vorige ongeldig), *Testmail* (beide talen naar je eigen adres), *Versturen…* (met bevestiging: aantal ontvangers per taal, verwachte duur, waarschuwing als de Engelse versie leeg is) en *Stoppen*. Na de start ligt de editie vast. *Versturen…* kan een redacteur alleen gebruiken als de admin in Site-instellingen *Redacteur mag versturen* aanzet (standaard uit, tegen per ongeluk versturen); de admin kan altijd versturen. Dit wordt ook op de server gecontroleerd (`magVersturen` in `verzenden.ts`). Is de Engelse tekst leeg, dan krijgen Engelstalige abonnees de Nederlandse.

**Verspreid versturen** (gratis Resend-plan, 100 mails per dag): bij de start krijgt elke actieve abonnee een rij in `nieuwsbrief-verzendingen`. Er gaat meteen een portie uit, de rest elke ochtend via de cron `/api/nieuwsbrief-verzenden` (`vercel.json`). Per 24 uur maximaal `NIEUWSBRIEF_DAGLIMIET` (standaard 60) nieuwsbriefmails, en samen met berichten aan deelnemers maximaal `ACTIVITEITEN_MAIL_DAGLIMIET` (standaard 80); de rest van het quotum blijft over voor bevestigingsmails. Wie zich tussendoor afmeldt, wordt overgeslagen. Elke mail heeft een persoonlijke afmeldlink en een `List-Unsubscribe`-header. Verzendrijen van afgeronde edities verdwijnen na 30 dagen; de tellingen op de editie blijven. Logica: `src/lib/nieuwsbrief/verzenden.ts` en `editieMail.ts`.

**Seintjes over nieuwe ideeën.** Bij het aanmelden op `/nieuwsbrief` kan een bezoeker aanvinken dat die een seintje wil als een buur een idee voor een activiteit heeft (veld `ideeen` op de abonnee; met buurtpas aan of uit te zetten op `/buurtpas`). Keurt de redactie een idee goed (`goedgekeurdOp` op de activiteit), dan gaat de volgende ochtend met de cron van de nieuwsbrief een mail uit: "Annika heeft een idee: Leesclub", met een link naar de activiteit, waar je je als geïnteresseerde aanmeldt. Hooguit één mail per dag (meerdere ideeën in één mail), alleen ideeën van na het aanzetten en niet ouder dan 30 dagen, niet aan de aanvrager zelf. De seintjes gaan vóór de nieuwsbrief-edities en tellen mee in `NIEUWSBRIEF_DAGLIMIET`. Elke mail heeft een afmeldlink voor alleen de seintjes (`/nieuwsbrief/ideeen-afmelden/<token>`); de nieuwsbrief blijft. Logica: `src/lib/activiteiten/seintjes.ts`.

**Alleen op productie.** Mails aan een hele lijst gaan alleen echt uit als `VERCEL_ENV=production`; dat zet Vercel alleen op productie-deploys (`bulkmailToegestaan` in `src/lib/mail.ts`). Lokaal en op previews staan wel echte adressen in de database en vaak een echte Resend-key. Daarom weigert *Versturen…* daar, doet de cron niets, en worden berichten en automatische mails aan alle deelnemers van een activiteit alleen gelogd. *Voorbeeld*, *Testmail* en losse mails (bevestigen, inloglink) werken overal. Een omweg is er bewust niet. Let op: een via `vercel env pull` opgehaalde `.env.production.local` kan `VERCEL_ENV=production` bevatten; draai daarmee dus geen lokale `bun start`.

## Content vertalen (NL → EN)

### Live "Vertaal naar Engels"-knop in de admin (primaire aanpak)

Elk contentdocument (Nieuws, Agenda, Interviews, Geschiedenis, Duivelse Kunst, Vaklui, Praktische info, Media) en de `SiteInstellingen`-global heeft in `/admin` een knop **"Vertaal naar Engels"** naast de standaard document-knoppen. Bij een klik:

- ontdekt de server **dynamisch** (door `payload.config`'s velddefinities te doorlopen, niet via een handmatige lijst) welke `localized: true`-velden op dat document een lege Engelse waarde hebben terwijl de Nederlandse wel gevuld is — werkt dus automatisch mee met nieuwe collecties/velden, ook als het schema nog verandert;
- vertaalt die velden via MyMemory (zie hieronder), inclusief rich text (`content`) met behoud van opmaak (koppen, vet, lijsten — alleen de tekst verandert);
- schrijft alleen de vertaalde velden terug, met een tweede check vlak vóór het schrijven of het Engelse veld nog steeds leeg is (beschermt tegen een handmatige wijziging die tussendoor is gebeurd);
- toont een melding met het aantal vertaalde/mislukte velden.

Rechten: `redacteur`/`admin` voor content en Media, alleen `admin` voor `SiteInstellingen` (zelfde als de bestaande update-rechten). De endpoint zit op `POST /api/translate-doc` (`src/endpoints/translateDoc.ts`); de kernlogica staat in `src/lib/translate-live/` (`engines.ts`, `lexical.ts`, `field-walker.ts`).

**Vertaal-engine: MyMemory, met een kwaliteitsdrempel.** MyMemory is een vertaalgeheugen (geeft de best-passende eerder-vertaalde zin uit zijn database terug, geen zuivere neurale vertaler) en kan bij korte/generieke tekstfragmenten — vaak het geval in rich text, waar een zin per opmaak-run in meerdere tekstnodes wordt opgesplitst — een compleet ongerelateerd resultaat teruggeven. Concreet voorbeeld tijdens het testen: "Dit weekend is er een groot feest voor de buurt" kwam een keer terug als *"There is a TV, radio and CD-player. One big party! for the neighborhood."* MyMemory geeft per resultaat een `match`-kwaliteitsscore (0–1) mee; onder de 0,7 wordt het resultaat nu als mislukt behandeld (veld blijft leeg voor handmatige aanvulling) in plaats van de rommelige tekst te gebruiken.

**LibreTranslate was overwogen als terugval-engine, maar bleek niet bruikbaar**: hun publieke demo vereist inmiddels een betaalde API-key (geen gratis laag meer — bevestigd via hun eigen prijzenpagina, `$29`/maand minimaal). Er is dus bewust **geen terugval-engine**; bij een mislukte of onbetrouwbare vertaling blijft het veld leeg voor handmatige invulling.

MyMemory accepteert maximaal ~500 tekens per aanroep. Lange tekst (bv. een alinea zonder opmaak-onderbrekingen, dus één lange Lexical-tekstnode) wordt daarom automatisch in stukken van ~450 tekens geknipt op zinsgrenzen, apart vertaald en weer samengevoegd (`splitIntoChunks` in `engines.ts`) — de editor merkt hier niets van, behalve dat het even iets langer duurt. Als één van de stukken mislukt, blijft het hele veld onvertaald (liever niets dan een deels Engelse/deels Nederlandse mix).

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

## Geluid

`/geluid` legt uit hoe laat verbouwen mag, hoe je de buren informeert, wat er voor feestjes geldt en wat je doet bij geluidsoverlast. Daarbij een instructiekaart (`/geluid/instructie`, te printen en als PNG te delen) en in te vullen briefjes voor de buren (`/geluid/briefje`). Geen CMS en geen live data: de openbare meldingenkaart heeft voor de buurt bijna geen geluidsmeldingen, en burenlawaai via het Meldpunt Zorg en Woonoverlast is niet openbaar.

- **Regels en getallen** staan op één plek: `src/lib/geluid/constants.ts` (bouwtijden, buurtfeest, geluidsgrenzen, ontheffing, telefoonnummers, links). De datum `GECONTROLEERD` staat op de pagina. Controleer de regels jaarlijks tegen het Besluit bouwwerken leefomgeving (art. 7.4, 7.17), de beleidsregels bouwlawaai Amsterdam (CVDR726068) en de APV (art. 2.18A, 2.41, 5.5), en pas daarna die datum aan.
- **Advies, geen regel:** "lawaaiig werk liever niet vóór 9 uur" (`ADVIES_LAWAAI_VANAF`) en "na 23 uur zachter" (`FEEST_ZACHTER_VANAF`) zijn afspraken van de buurt. Voor zelf klussen staat er geen vaste tijd in de wet, alleen een zorgplicht; de pagina zegt dat ook.
- **Briefjes:** alles blijft in de browser (een concept in `localStorage`), er gaat niets naar de server en niets in de URL. Het briefje kan in het Nederlands, het Engels of allebei, los van de taal van de site.
- **Homepagina:** `HomeGeluid` (onder de afvalsectie) haalt de inleiding en de weekbalk uit `pages.geluid`, zodat ze gelijk blijven met de pagina.
- **Deelafbeelding** opnieuw maken na een tekstwijziging: `bun run geluid:deelkaart` (site moet draaien). Voor afval: `bun run afval:deelkaart`.

## Kosten

Vercel Hobby, Turso Free en Vercel Blob Free volstaan voor deze omvang. Enige aandachtspunt: Blob-opslag en bandbreedte bij veel grote foto's; afbeeldingen bij upload verkleinen via Payload's `imageSizes`.
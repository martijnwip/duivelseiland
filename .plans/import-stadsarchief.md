# Nieuwe collectie + herbruikbare import-tool voor Stadsarchief-beeldbank

## Context

De gebruiker wil historische foto's van de Stadsarchief Amsterdam beeldbank (bijv. https://archief.amsterdam/beeldbank/detail/... ) kunnen opnemen in de site, met per foto: titel, beschrijving, geografische aanduiding, en de afbeelding — expliciet **niet** gedownload/geüpload, maar rechtstreeks als `src` van een `<img>`-tag (hotlinken naar de beeldbank).

Onderzoek van het huidige content-model (`src/collections/*`) laat zien dat **geen enkele bestaande collectie hiervoor geschikt is**:
- Alle gewone contentcollecties (`Geschiedenis`, `DuivelseKunst`, `Interviews`, `Vakmensen`, `PraktischeInfo`, `Nieuws`, `Agenda`) delen dezelfde `contentFields()`-fields (`title`, `slug`, `status`, `author`, `content`, `date`, `image`) — en dat `image`-veld is een Payload `upload`-relatie naar `Media`.
- `Media` (`src/collections/Media.ts`) is uitsluitend een upload-collectie, gekoppeld aan Vercel Blob storage (`vercelBlobStorage` plugin in `src/payload.config.ts`). Er is geen manier om daar een externe URL in te hangen zonder de collectie — die door alle content en de hero-slideshow gebruikt wordt — aan te passen. Dat risico wil ik niet nemen voor deze losstaande behoefte.
- `HeroSlides` (net gemergd) heeft alleen `image`/`order`/`status`, geen titel/beschrijving/locatie.

**Conclusie: een nieuwe collectie `HistorischeFotos` (slug `historische-fotos`)**, met een plat tekstveld voor de externe afbeeldings-URL in plaats van een upload-relatie.

Voor het ophalen van de brondata is onderzocht wat automatisch beschikbaar is van een archief.amsterdam beeldbank-detailpagina:
- **Titel, beschrijving en afbeeldings-URL zitten betrouwbaar in de standaard Open Graph meta-tags** (`og:title`, `og:description`, `og:image`) — bevestigd door de opgegeven link te fetchen (met een browser-achtige User-Agent, want de kale request wordt anders geblokkeerd met een 403).
- De widget op de pagina (Memorix Mediabank, van leverancier Vitec) laadt overige velden — waaronder **"Geografische aanduiding"** — pas client-side via een eigen JSON-API. Die API kon niet binnen redelijke tijd betrouwbaar achterhaald worden (geen publieke documentatie, geen bruikbare eindpunten gevonden via de meegeleverde JS-bundel).
- Afgesproken met de gebruiker: de import-tool haalt titel/beschrijving/afbeelding **automatisch** op uit elke archief.amsterdam-link; de geografische aanduiding wordt als los argument **handmatig** meegegeven.

## Aanpak

### 1. Nieuwe collectie: `src/collections/HistorischeFotos.ts`
Volgt de bestaande conventies (`authoredContentAccess` uit `src/access/contentAccess.ts`, `setAuthor` hook uit `src/collections/shared/setAuthor.ts`, `admin.useAsTitle: 'title'`), met eigen velden (niet via de gedeelde `contentFields()`, omdat die een upload-`image` veronderstelt):
- `title` (text, `localized: true`, required) — zelfde conventie als overal elders.
- `description` (textarea, `localized: true`) — analoog aan `Media.caption`.
- `geografischeAanduiding` (text, **niet** localized — een plaatsnaam zoals `menu.url` op `SiteInstellingen` ook niet localized is).
- `imageUrl` (text, required, met een `admin.description` die duidelijk maakt dat dit een externe, niet-gehoste URL is die direct als `<img src>` gebruikt wordt).
- `bronUrl` (text, required) — link terug naar de originele beeldbank-pagina; nodig voor bronvermelding/auteursrecht en om een import later opnieuw te kunnen verversen. Niet expliciet gevraagd, maar een minimale, voor de hand liggende toevoeging.
- `status` (select `draft`/`published`, default `draft`, field-access via `isRedacteurOrAdminField`) en `author` (relationship naar `users`, sidebar, field-access via `isRedacteurOrAdminField`) — zelfde patroon als alle andere contentcollecties.

Registreren in `src/payload.config.ts` (`collections` array) en een migratie genereren met `bun run payload migrate:create historische_fotos` (zelfde manier als de recent toegevoegde `hero_slides`-migratie).

### 2. Herbruikbaar import-script: `scripts/import-beeldbank.ts`
Cli-script naar het patroon van `scripts/seed-admin.ts` (gebruikt `getClient()` uit `scripts/lib/payload-client.ts`):

```
bun run scripts/import-beeldbank.ts <archief.amsterdam-link> "<geografische aanduiding>"
```

Stappen in het script:
1. Valideert dat er twee argumenten zijn en dat de link-host op `archief.amsterdam` eindigt.
2. Haalt de pagina op met `fetch()` en een browser-achtige `User-Agent`-header (zonder deze header krijg je een 403 — al geverifieerd).
3. Extraheert `og:title`, `og:description`, `og:image` uit de HTML met een kleine regex-helper (geen nieuwe HTML-parser-dependency nodig voor dit ene, voorspelbare gebruik).
4. Faalt met een duidelijke foutmelding als titel of afbeelding ontbreekt.
5. Maakt via `payload.create({ collection: 'historische-fotos', ... })` een nieuw concept-document aan: `title`, `description`, `imageUrl`, `bronUrl` (= de opgegeven link), `geografischeAanduiding` (= het cli-argument), `status: 'draft'` — bewust als concept, zodat een redacteur het in `/admin` controleert vóór publicatie (zelfde voorzichtige aanpak als `seed-hero-slides.ts`).
6. Logt het aangemaakte document-id en een korte "controleer en publiceer in /admin"-melding.

### 3. Deze ene foto meteen importeren
Na het bouwen van collectie + script, het script eenmalig draaien met de door de gebruiker gegeven link en `"Roelof Hartplein"` als geografische aanduiding, zodat de gevraagde foto meteen als concept in de database staat.

### Buiten scope (bewust niet meegenomen)
Een publieke pagina/galerij die deze collectie toont is niet gevraagd en wordt niet gebouwd — dit plan gaat alleen over het datamodel en de import. Dat is een logische vervolgstap, maar een aparte beslissing.

## Verificatie
1. `bun run build` (draait de nieuwe migratie mee, valideert dat de collectie en het admin-paneel correct compileren).
2. `bun run scripts/import-beeldbank.ts "<de opgegeven link>" "Roelof Hartplein"` uitvoeren; controleren dat het script slaagt en een document-id teruggeeft.
3. Via `/admin/collections/historische-fotos` controleren dat het nieuwe concept-document de juiste `title`, `description`, `imageUrl`, `bronUrl` en `geografischeAanduiding` heeft, en dat de `imageUrl` in een `<img>`-tag daadwerkelijk de beeldbank-thumbnail toont.

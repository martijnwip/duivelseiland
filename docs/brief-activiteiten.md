# Brief: Activiteiten

Bewoners kunnen via de site een idee voor een buurtactiviteit aanmelden, zoals een boekenclub, kookclub of naaiclub. Op het moment van aanmelden bestaat er nog niets: de site is de tussenpersoon die andere bewoners bij elkaar brengt. De redactie toetst het idee alleen aan de spelregels (zodat er geen activiteiten komen die niet door de beugel kunnen) en keurt het goed. Goedgekeurd betekent dus nog niet dat het doorgaat. Daarna wordt de aanvrager **organisator**: die is zelf verantwoordelijk voor het werven van deelnemers, het mailen van de groep en de beslissing of de activiteit doorgaat.

Routes: `/activiteiten` (overzicht), `/activiteiten/aanmelden` (idee aanmelden) en `/activiteiten/[slug]` (activiteitpagina met inschrijving). Allemaal in nl en en.

## 1. Doel en spelregels

**Doel:** de verbinding tussen buurtbewoners vergroten door samen iets leuks te doen.

Een activiteit moet:

- **laagdrempelig** zijn: iedereen kan meedoen, er is geen ervaring of lidmaatschap nodig;
- **niet-commercieel** zijn: gratis, of alleen kosten delen (bv. ingrediënten of zaalhuur), zonder winst;
- **inclusief** zijn: open voor alle buurtbewoners, ongeacht leeftijd, achtergrond of taal;
- **in of rond de buurt** plaatsvinden en gericht zijn op bewoners van Duivelseiland.

**Wat niet mag:** verkoop of promotie van producten en diensten, werving voor een bedrijf, politieke of religieuze werving, besloten groepen, en activiteiten met een winstoogmerk.

Op het aanmeldformulier staan deze spelregels uitgelegd. De aanvrager moet een verplicht vinkje aanzetten: "Ik heb de spelregels gelezen en ga ermee akkoord." De redactie toetst elk idee aan deze regels.

## 2. Rollen

| Rol | Wie | Wat |
|---|---|---|
| Bezoeker | Iedereen | Ziet goedgekeurde activiteiten, meldt een idee aan, schrijft zich in of uit. |
| Aanvrager | Bezoeker die een idee heeft ingediend | Heeft nog geen account. Bevestigt het e-mailadres en wacht op moderatie. |
| **Organisator** (nieuw) | Aanvrager na goedkeuring | Logt in op `/admin` en ziet **alleen** de eigen activiteit(en), de inschrijvingen en de berichten. |
| Redacteur / admin | Redactie | Modereert ideeën, kan alles aan elke activiteit wijzigen en kan altijd depubliceren. |

**Organisator als nieuwe rol:**

- Komt in `src/access/roles.ts` en in de `role`-select van `src/collections/Users.ts`, met de laagste rang (onder `auteur`).
- **Waarom geen `auteur`:** een auteur mag items aanmaken in Nieuws, Agenda, Interviews en andere collecties. Een organisator mag dat niet.
- Omdat de organisator onder `auteur` staat, sluit elke `hasRoleAtLeast(..., 'auteur')` (zoals `isAuthorOrAbove`) hem vanzelf uit. Media uploaden mag wel (voor de eigen headerafbeelding). Wijzigen en verwijderen van media mag alleen voor eigen uploads; redactie en admin mogen alles.
- In `/admin` ziet een organisator alleen Activiteiten, Aanmeldingen, Berichten, Media en het eigen profiel (`verbergVoorOrganisator` in `src/payload.config.ts`).
- `users` had geen eigen access-regels, dus elke ingelogde gebruiker kon alle gebruikers lezen, wijzigen en verwijderen. Nu geldt: lezen alles voor redacteur en admin, anders alleen het eigen profiel. Wijzigen alles voor admin, anders alleen het eigen profiel. Verwijderen alleen admin.
- Is de aanvrager al een gebruiker met een hogere rol, dan blijft die rol staan. Eigenaarschap loopt via het veld `eigenaar` op de activiteit, niet via de rol.

**Aanvulling op de rechtenmatrix in `PROJECT.md`** (bijwerken bij de bouw):

| Collection | Bezoeker | Organisator | Auteur | Redacteur | Admin |
|---|---|---|---|---|---|
| Activiteiten | lezen (`goedgekeurd`/`gaat-door`), idee indienen via formulier | eigen activiteit lezen/bewerken | lezen (publiek) | alles + modereren | alles |
| Inschrijvingen | inschrijven/afmelden via formulier | lezen/verwijderen bij eigen activiteit | geen | alles | alles |
| Berichten | geen | aanmaken/lezen bij eigen activiteit | geen | lezen | alles |

## 3. Levenscyclus

Een activiteit heeft **twee losse velden**. "Gaat door" en "inschrijving gesloten" zijn verschillende dingen: een boekenclub kan doorgaan en nog steeds leden zoeken.

**`fase`**

```
ingediend ──► afgewezen
    │
    ▼
 goedgekeurd ◄──► gaat-door ──► afgelopen
    │            │
    └────► afgelast ◄┘
```

| Fase | Betekenis | Publiek zichtbaar |
|---|---|---|
| `ingediend` | E-mail bevestigd, wacht op moderatie | Nee |
| `afgewezen` | Voldoet niet aan de spelregels | Nee |
| `goedgekeurd` | Past binnen de spelregels: online, op de agenda als "nog niet definitief" en open voor aanmelding | Ja |
| `gaat-door` | De organisator heeft besloten dat het doorgaat. Bij een eenmalige activiteit is een datum verplicht | Ja |
| `afgelast` | Gaat niet door | Nee (deelnemers krijgen een mail) |
| `afgelopen` | Klaar | Ja, als archief ("Dit is er al gebeurd in de buurt" onder aan `/activiteiten`, laatste 12), zonder inschrijfformulier |

Een idee dat nog niet bevestigd is, staat als `onbevestigd` in de database en is alleen voor admins zichtbaar. Na 7 dagen wordt het automatisch opgeruimd.

**Goedkeuren** doet één redacteur of admin, met de knoppen **Goedkeuren** / **Afwijzen** bovenaan het item in `/admin`. Vanaf dat moment staat de activiteit online en kan iedereen zich aanmelden. Werven van deelnemers is daarna de taak van de organisator, niet van de redactie. De organisator beslist zelf of en wanneer het doorgaat; in `/admin` ziet die in de fase-keuzelijst alleen Goedgekeurd, Gaat door, Afgelast en Afgelopen.

In `/admin` heten de fasen: Wacht op e-mailbevestiging, Wacht op goedkeuring, Afgewezen, Goedgekeurd (open voor aanmelding), Gaat door, Afgelast, Afgelopen. Op de site staat bij een goedgekeurde activiteit "Open voor aanmelding", of "Aanmelding gesloten" als de organisator de inschrijving heeft gesloten.

**`inschrijving`:** `open` / `gesloten` (in `/admin`: "Aanmelden voor buren"). Dit is de knop van de organisator om de aanmelding te stoppen, bijvoorbeeld als het vol is. Hij is pas zichtbaar na goedkeuring en staat dan open.

- De organisator zet de inschrijving handmatig dicht of open.
- Optioneel stelt de organisator `maxDeelnemers` in. Bij dat aantal bevestigde inschrijvingen sluit de inschrijving automatisch. Gaat iemand weg, dan gaat ze **niet** vanzelf weer open; dat beslist de organisator.

**Wie mag welke overgang:**

| Overgang | Redactie | Organisator |
|---|---|---|
| `ingediend` → `goedgekeurd` / `afgewezen` | ✓ | – |
| `goedgekeurd` ↔ `gaat-door` | ✓ | ✓ |
| → `afgelast` / `afgelopen` | ✓ | ✓ |
| `inschrijving` open/dicht, `maxDeelnemers` | ✓ | ✓ |
| Afkeuren, in elke fase (met reden; deelnemers krijgen een afgelast-mail) | ✓ | – |
| Opnieuw goedkeuren vanuit `afgewezen` of `afgelast` | ✓ | – |
| Aanmelding sluiten of openen | ✓ | ✓ |

De redactie heeft hiervoor knoppen bovenaan het item in `/admin`: **Goedkeuren / Opnieuw goedkeuren**, **Afkeuren** en **Aanmelding sluiten / openen**.

De regels worden afgedwongen in een `beforeChange`-hook en in field-level access, niet alleen in de UI (zie de werkafspraken in `CLAUDE.md`).

## 4. Flow 1: idee aanmelden

Pagina `/activiteiten/aanmelden`, met bovenaan uitleg in drie stappen: *idee indienen → redactie kijkt mee → jij werft deelnemers*. Daaronder de spelregels uit 1.

**Velden**

| Veld | Type | Verplicht | Opmerking |
|---|---|---|---|
| Titel | tekst, max 80 | ja | bv. "Boekenclub Duivelseiland" |
| Omschrijving | platte tekst, max ~2000 | ja | Wat, voor wie, hoe vaak, waar ongeveer. De redactie zet dit om naar rich text. |
| Soort | `eenmalig` / `terugkerend` | ja | Terugkerend: korte toelichting, bv. "elke eerste dinsdag van de maand". |
| Datum | datum, of leeg | nee | Er is één datumveld. Bij het veld staat dat de datum later nog kan veranderen. Zolang de fase `goedgekeurd` is, staat er op de site "Nog niet definitief" bij. Een datum zonder tijd wordt zonder tijd getoond. |
| Afbeelding | jpg/png/webp, max 4 MB | nee | Wordt pas na goedkeuring getoond. De aanvrager verklaart de rechten te hebben en dat er geen herkenbare personen op staan zonder toestemming. |
| Naam aanvrager | tekst | ja | **De aanvrager wordt de organisator.** Op de site staat alleen de voornaam. |
| E-mail aanvrager | e-mail | ja | **Wordt bij goedkeuring de organisator**; met dit adres logt die in op `/admin`. Nooit publiek. |
| Akkoord spelregels | vinkje | ja | |
| `website` | honeypot | – | Verborgen. Is het gevuld, dan doet de site alsof het gelukt is. |

**Na versturen**

1. Het idee wordt opgeslagen met een token (`nieuwToken()` uit `src/lib/nieuwsbrief/token.ts`).
2. Daarna hangt het af van het e-mailadres (zie **Bekende adressen** hieronder):
   - **Onbekend adres:** fase `onbevestigd`. De aanvrager krijgt een mail met een bevestigingslink. Net als bij de nieuwsbrief doet het openen van de link nog niets: op de pagina staat een knop die de aanvrager moet aanklikken. Na bevestiging gaat de fase naar `ingediend`.
   - **Bekend adres:** de fase gaat meteen naar `ingediend`. De aanvrager krijgt een ontvangstmail met de link "Was jij dit niet? Trek het idee in." Intrekken verwijdert het idee.
3. Zodra het idee `ingediend` is, krijgt de redactie (alle redacteuren en admins) een mail met een link naar het item in `/admin`.
4. Op de site ziet de aanvrager in beide gevallen dezelfde melding: "Check je mail." Zo verraadt het formulier niet of een adres al bekend is.

**Bekende adressen.** Een adres hoeft niet opnieuw bevestigd te worden als het in het **adresboek** (sectie 17) op bevestigd staat. Dat geldt bij een idee aanmelden (flow 1) en bij inschrijven (flow 4). Het adres wordt vergeleken zonder spaties en ongeacht hoofdletters. Een adres wordt vanzelf bevestigd zodra het:

- een nieuwsbriefaanmelding bevestigt (of door een admin is geïmporteerd);
- een aanmelding voor een activiteit bevestigt;
- een idee bevestigt;
- een gebruikersaccount krijgt (een gebruiker bewijst het adres via de magic link).

De admin kan een adres in het adresboek ook zelf op bevestigd of niet bevestigd zetten.

Een bekend adres krijgt geen bevestigingsmail, maar wel altijd een **melding met een link om het terug te draaien**. Zo kan niemand ongemerkt iemand anders aanmelden.

De afbeelding gaat naar `Media` (Vercel Blob), zonder `uploadedBy`. Hij wordt nergens getoond zolang de activiteit niet publiek is, omdat alleen de activiteitpagina ernaar verwijst. Bij intrekken en bij het opruimen van onbevestigde of afgewezen ideeën gaat de afbeelding mee weg, maar alleen een anoniem geüploade (zonder `uploadedBy`). De server action accepteert maximaal 4,5 MB per request (`experimental.serverActions.bodySizeLimit` in `next.config.ts`).

## 5. Flow 2: moderatie

In `/admin` staat de collection Activiteiten, met een lijstweergave gefilterd op `ingediend`.

De redactie kan:

- de tekst redigeren en de omschrijving opmaken;
- de **slug** vaststellen. Die moet uniek zijn; bij een tweede boekenclub kies je bijvoorbeeld `boekenclub-noord`;
- de afbeelding vervangen of weghalen;
- de Engelse versie vullen met de bestaande knop **"Vertaal naar Engels"** (`src/endpoints/translateDoc.ts`) en daarna controleren.

**Goedkeuren** (knop bovenaan het item) zet de fase op `goedgekeurd`. Daarbij gebeurt het volgende:

- De gebruiker bij het e-mailadres van de aanvrager wordt opgezocht of aangemaakt met de rol `organisator`. Een bestaande rol blijft staan.
- Die gebruiker wordt gekoppeld aan het veld `eigenaar` van de activiteit.
- De organisator krijgt een mail: "Je activiteit staat online", met een link naar de pagina en naar `/admin`. Daar logt die in met het eigen e-mailadres en krijgt dan een magic link. Een magic link direct in de mail is maar 5 minuten geldig, dus die zit er bewust niet in. De gewone uitnodigingsmail van `Users` wordt bij een nieuwe organisator overgeslagen (`context.skipInviteMail`).

**Afwijzen** zet de fase op `afgewezen`. Een korte reden is verplicht. De aanvrager krijgt een mail met die reden en de uitnodiging om het idee aangepast opnieuw in te dienen.

## 6. Flow 3: overzicht en activiteitpagina

**`/activiteiten`**

- Kaarten met afbeelding, titel, fase-label ("Zoekt deelnemers" of "Gaat door") en de datum.
- Bovenaan een duidelijke knop: "Zelf een idee? Meld het aan."

**`/activiteiten/[slug]`**

- Header-afbeelding (of een standaardbeeld), titel, omschrijving, soort (eenmalig/terugkerend) en datum. Bij `goedgekeurd` staat er "Nog niet definitief" bij.
- Fase-label en "Georganiseerd door *voornaam*". Het e-mailadres staat er nooit.
- Optioneel het aantal aanmeldingen ("al 7 buren doen mee"). De organisator kiest of dat getoond wordt.
- Een inschrijfblok (flow 4). Als de inschrijving gesloten is, staat er in plaats daarvan: "De inschrijving is gesloten."
- Bij `gaat-door` met een gekoppeld agenda-item: een link naar dat agenda-item.

De pagina's halen de data op met de Local API (`getPayload`). Een `afterChange` op Activiteiten roept `revalidatePath` aan, zoals bij de andere content.

## 7. Flow 4: inschrijven en afmelden

**Velden**

| Veld | Verplicht | Opmerking |
|---|---|---|
| Voornaam | ja | Zodat de organisator weet wie er komt. |
| E-mail | ja | |
| Opmerking | nee | Max 500 tekens, alleen zichtbaar voor de organisator. Bv. "ik kan pas om 20:00". |
| `website` | – | Honeypot. |

Onder het formulier staat: *"Je voornaam, e-mailadres en opmerking zijn zichtbaar voor de organisator van deze activiteit. Je krijgt alleen mail over deze activiteit en kunt je altijd afmelden."*

**Dubbele opt-in**, met dezelfde aanpak als de nieuwsbrief (`src/components/nieuwsbrief/actions.ts`). Een bekend adres (zie flow 1) slaat de bevestiging over:

- Het antwoord is altijd hetzelfde ("Check je mail"), zodat niet te zien is of een adres al ingeschreven of bekend is.
- Er gaat maximaal één mail per 2 minuten per adres per activiteit.
- **Onbekend adres:** de inschrijving telt pas mee na een klik op de bevestigingsknop. Bevestigen kan alleen zolang de inschrijving open is; daarna krijgt de bezoeker de melding dat de activiteit vol is.
- **Bekend adres:** de inschrijving is meteen `actief` (als de inschrijving open is) en telt mee voor `maxDeelnemers`. De deelnemer krijgt de mail "Je bent ingeschreven voor X", met de link "Was jij dit niet? Afmelden."
- Elke mail, ook die van de organisator, bevat een **afmeldlink** met het token van de inschrijving.
- Afmelden kan ook via het formulier: de bezoeker vult het e-mailadres in en kiest "Afmelden", en krijgt dan een mail met de afmeldlink.

De organisator krijgt optioneel een melding bij elke nieuwe bevestigde inschrijving (aan/uit op de activiteit, standaard aan).

## 8. Flow 5: de organisator in `/admin`

Login gaat via de bestaande magic link (better-auth). De organisator ziet in het menu alleen Activiteiten, Inschrijvingen en Berichten, steeds gefilterd op de eigen activiteit(en).

Rechten lopen via een query-constraint op `eigenaar`, volgens het patroon van `isOwnerOrRedacteur` in `src/access/isOwnerOrRedacteur.ts`. Voor inschrijvingen en berichten gaat dat via de relatie `activiteit.eigenaar`.

De organisator kan:

- titel, omschrijving, afbeelding, soort en datum wijzigen. Dat hoeft niet opnieuw langs de moderatie; de redactie kan altijd ingrijpen en depubliceren. Bij een gewijzigde datum krijgen de deelnemers automatisch een mail;
- de fase wijzigen (zie 3), de inschrijving open of dicht zetten en `maxDeelnemers` instellen;
- de deelnemerslijst bekijken (voornaam, e-mail, opmerking, datum) en als CSV exporteren;
- een inschrijving verwijderen, bv. bij misbruik of op verzoek;
- berichten sturen (flow 6) en de verstuurde berichten teruglezen.

De organisator kan **niet**: zelf een activiteit aanmaken (dat loopt altijd via het formulier), de slug of eigenaar wijzigen, andere collecties zien, of activiteiten van anderen zien.

## 9. Flow 6: berichten aan deelnemers

Een collection `activiteit-berichten` met de velden onderwerp, tekst, activiteit, verzonden-op en aantal ontvangers. Opslaan is versturen; daarna is het bericht alleen nog te lezen.

**Versturen** gaat via Resend, volgens het patroon van `src/lib/nieuwsbrief/mail.ts`:

- De afzender is het site-adres (`RESEND_FROM_EMAIL`), met `reply-to` naar het e-mailadres van de organisator. Antwoorden komen dus bij de organisator terecht, niet bij de site.
- Elke deelnemer krijgt een eigen mail. Adressen zijn niet onderling zichtbaar.
- Onder elke mail staat: *"Je ontvangt dit bericht via duivelseiland.nl namens [voornaam], organisator van [activiteit]."*, met een afmeldlink.
- Alleen bevestigde deelnemers ontvangen het bericht.
- Alleen op de productiesite: lokaal en op preview-deploys worden berichten en de automatische mails aan alle deelnemers alleen gelogd (`bulkmailToegestaan` in `src/lib/mail.ts`).

**Grenzen**

- Maximaal **3 berichten per 7 dagen** per activiteit (instelbaar door een admin).
- Alleen platte tekst; links zijn toegestaan.
- De redactie kan alle berichten lezen. Bij misbruik kan de redactie de organisator blokkeren.

**Automatische mails aan deelnemers:** bij `goedgekeurd` → `gaat-door` ("Het gaat door!", met de datum), bij `gaat-door` → `goedgekeurd` ("Nog niet definitief": het is weer onzeker), bij `afgelast`, en als de datum verandert terwijl de activiteit goedgekeurd is of doorgaat ("Datum gewijzigd", bij goedgekeurd met "nog niet definitief"). Wil de organisator iets toelichten, dan stuurt die daarnaast een gewoon bericht.

## 10. Flow 7: naar de agenda

Een goedgekeurde activiteit staat **meteen op de agenda**. Dat geeft extra bekendheid en levert meer aanmeldingen op.

- Bij goedkeuring wordt automatisch een gekoppeld agenda-item gemaakt en gepubliceerd. Het krijgt de titel, omschrijving (nl en en), afbeelding en datum van de activiteit.
- Wijzigt de organisator of de redactie de activiteit, dan wordt het agenda-item bijgewerkt (`src/lib/activiteiten/agenda.ts`). Wijzigingen die je rechtstreeks in het agenda-item maakt, worden bij de volgende wijziging van de activiteit overschreven.
- Zolang de fase **goedgekeurd** is, staat er op de agenda en op de activiteitpagina: *"Nog niet definitief: deze activiteit gaat door als er genoeg aanmeldingen zijn."* In de agendalijst staat het label "Nog niet definitief". Bij **gaat door** verdwijnt dat label.
- Het agenda-item heeft een knop "Aanmelden voor deze activiteit", zolang de aanmelding open is. Gewone agenda-items hebben die knop niet.
- Afkeuren, afgelast of terug naar "wacht op goedkeuring": het agenda-item gaat naar concept. Opnieuw goedkeuren publiceert hetzelfde item weer. Bij afgelopen verandert er niets, want de datum ligt dan in het verleden.
- Zonder datum staat het item wel gepubliceerd klaar, maar het verschijnt pas in de agendalijst als er een datum is.

## 11. Privacy en bewaren

- **Doelbinding:** e-mailadressen van deelnemers worden alleen gebruikt voor berichten over die ene activiteit. Ze gaan niet naar de nieuwsbrief en worden niet met andere activiteiten gedeeld.
- **Wie ziet wat:** de organisator ziet alleen de eigen deelnemers. Op de site staan nooit e-mailadressen.
- **Bewaren:** een geplande opruimtaak verwijdert inschrijvingen en berichten **3 maanden** na `afgelopen` of `afgelast`. Afgewezen ideeën worden na 1 maand verwijderd. Bij een terugkerende activiteit blijven de gegevens zolang die loopt.
- **Rechten van betrokkenen:** afmelden kan altijd via de link in elke mail. Een verzoek om verwijdering loopt via de redactie.
- Neem de privacytekst bij de formulieren op in de privacyverklaring van de site.

## 12. Misbruik en grenzen

- Honeypot op alle formulieren, en een mailinterval per adres (zie 4 en 7).
- Maximaal **2 openstaande ideeën** (`onbevestigd` of `ingediend`) per e-mailadres.
- Het mailinterval en deze limiet gelden ook voor bekende adressen die de bevestiging overslaan.
- **Mailquotum:** Resend gratis staat 100 mails per dag en 3.000 per maand toe. Een bericht aan een groep van 40 telt als 40 mails. Houd een teller bij en weiger versturen bij dreigende overschrijding, met een duidelijke melding. Upgrade als het nodig is.
- **Upload:** Vercel staat maximaal 4,5 MB per request toe. Begrens daarom op 4 MB en verklein bij upload via `imageSizes`.
- **Redactie grijpt in:** de redactie kan een activiteit depubliceren, een organisator blokkeren (rol of account deactiveren) en het **eigenaarschap overdragen** aan een andere gebruiker, bv. als de organisator afhaakt.

## 13. Tweetaligheid

- Publieke velden (titel, omschrijving, soort-toelichting) krijgen `localized: true`.
- Een idee komt in één taal binnen, meestal Nederlands. Bij de moderatie vult de redactie de Engelse versie met de vertaalknop.
- Mails gaan in de taal waarin de bezoeker het formulier invulde (`locale` opslaan op het idee en de inschrijving, zoals bij nieuwsbriefabonnees). Berichten van de organisator gaan in de taal waarin die ze schrijft.
- UI-teksten staan onder `pages.activiteiten` in `messages/nl.json` en `messages/en.json`.

## 14. Datamodel (schets)

| Collection | Belangrijkste velden |
|---|---|
| `activiteiten` (nieuw) | `title`*, `slug`, `content`* (rich text), `soort`, `soortToelichting`*, `datum`, `image`, `fase`, `inschrijving`, `maxDeelnemers`, `toonAantal`, `meldingBijInschrijving`, `eigenaar` (→ users), `aanvragerNaam`, `aanvragerEmail`, `afwijsReden`, `token`, `locale`, `agendaItem` (→ agenda) |
| `activiteit-inschrijvingen` (nieuw) | `activiteit` (→ activiteiten), `voornaam`, `email`, `opmerking`, `status` (`pending`/`actief`/`afgemeld`), `token`, `locale`, `bevestigdOp`, `laatsteMailOp`. Uniek per (activiteit, email). |
| `activiteit-berichten` (nieuw) | `activiteit`, `onderwerp`, `tekst`, `afzender` (→ users), `verzondenOp`, `aantalOntvangers` |
| `agenda` (wijziging) | nieuw optioneel veld `activiteit` (→ activiteiten) |
| `users` (wijziging) | rol `organisator` toegevoegd aan `role` |

\* `localized: true`

Elke schemawijziging krijgt een migratie (`bun payload migrate:create activiteiten`). Nieuwe admin-componenten, zoals de moderatieknoppen en de CSV-export, vragen om het opnieuw genereren van `importMap.js`.

**Te hergebruiken**

- `src/lib/nieuwsbrief/token.ts`: `nieuwToken`, `TOKEN_RE`, `EMAIL_RE`
- `isBevestigdAdres(payload, email)` in `src/lib/adresboek.ts`: kijkt in het adresboek en wordt gebruikt door flow 1 en flow 4.
- `src/lib/nieuwsbrief/mail.ts`: Resend-patroon en het opbouwen van links
- `src/components/nieuwsbrief/actions.ts`: server actions, honeypot, mailinterval, altijd hetzelfde antwoord
- `src/access/isOwnerOrRedacteur.ts`, `src/access/roles.ts`, `src/access/contentAccess.ts`
- `src/collections/Users.ts`: invite-mail en magic link
- `src/collections/Agenda.ts`, `src/components/content/AgendaListPage.tsx`
- `src/endpoints/translateDoc.ts`: vertaalknop

## 15. Buiten scope

**Buiten scope (eerste versie)**

- Betalen of kosten innen
- Wachtlijst als de inschrijving vol is
- Meerdere organisatoren per activiteit
- Herinneringsmails vlak voor een bijeenkomst
- Een herinnering aan de organisator als een activiteit na 6 maanden nog op `goedgekeurd` staat
- Reacties of chat op de site
- Een WhatsApp- of Signal-groepslink die de organisator met bevestigde deelnemers deelt (veel groepen draaien in de praktijk zo; telefoonnummers worden dan onderling zichtbaar, buiten de site om)
- Een link "Organiseer dit" bij de vaste ideeën met hartjes op de buurtborrelpagina (`src/components/buurtborrel/`) naar `/activiteiten/aanmelden`

Het agenda-item gaat direct online bij goedkeuring, zonder aparte publicatie door de redactie (zie sectie 10).

## 16. Stand van de bouw

Alles uit sectie 1 tot en met 14 is gebouwd; wat in 15 staat valt buiten deze versie. Waar je wat vindt:

| Wat | Waar |
|---|---|
| Collections | `src/collections/Activiteiten.ts`, `ActiviteitInschrijvingen.ts` (met CSV-export), `ActiviteitBerichten.ts` (opslaan = versturen) |
| Agenda-koppeling | `src/lib/activiteiten/agenda.ts` (automatisch), knoppen voor de redactie in `src/components/admin/ModeratieKnoppen.tsx` |
| Fase-regels en mails bij fasewissels | `src/lib/activiteiten/workflow.ts` |
| Mailteksten (nl/en) | `src/lib/activiteiten/mail.ts` |
| Rechten | `src/access/activiteiten.ts`, `src/access/roles.ts` |
| Formulieren (server actions) | `src/components/activiteiten/actions.ts` |
| Pagina's | `app/(site)/[locale]/activiteiten/` |
| Adresboek | `src/collections/EmailAdressen.ts`, `src/lib/adresboek.ts`, overzicht `src/components/admin/AdresOverzicht.tsx` |
| Opruimtaak | `src/endpoints/activiteitenOpruimen.ts`, dagelijks via de cron in `vercel.json` |
| Migratie | `src/migrations/20261002_125350_activiteiten.ts` |

**Voor productie:**

- Zet `CRON_SECRET` in Vercel. Zonder die variabele weigert de opruimtaak elke aanroep.
- `ACTIVITEITEN_MAIL_DAGLIMIET` is optioneel (standaard 80).
- Zet "Activiteiten" (`/activiteiten`) in het menu via Site-instellingen.

## 17. Adresboek (alleen admin)

In `/admin`, onder **Beheer → E-mailadressen**, staat elk e-mailadres dat op de site voorkomt. Per adres zie je:

- of het **bevestigd** is, en wanneer;
- in welke lijsten het voorkomt (kolom "Lijsten"), bijvoorbeeld "Nieuwsbrief (actief) · Boekenclub (deelnemer, actief)". De lijsten zijn: nieuwsbrief, aanvrager van een idee, deelnemer van een activiteit en gebruiker;
- op de detailpagina een tabel met per lijst de naam, de status, de datum en een link naar dat item;
- een vrij notitieveld.

Rijen ontstaan vanzelf zodra een adres ergens wordt gebruikt. De bestaande adressen zijn bij de migratie toegevoegd.

| Actie van de admin | Gevolg |
|---|---|
| **Op bevestigd zetten** | Wat nog wachtte gaat door: een onbevestigd idee gaat naar de redactie (fase Ingediend, met melding), een wachtende aanmelding wordt actief als er plek is, en een wachtende nieuwsbriefaanmelding wordt actief. |
| **Op niet bevestigd zetten** | Geldt alleen voor nieuwe aanmeldingen: die moeten weer per mail bevestigd worden. Bestaande lidmaatschappen blijven actief. Een gewone wijziging (bijv. een login) zet het adres niet stilletjes terug op bevestigd. |
| **Toevoegen** | Een adres met of zonder het vinkje bevestigd. Met het vinkje gebeurt hetzelfde als bij "op bevestigd zetten". |
| **Verwijderen** | Het adres verdwijnt overal ("vergeet mij"): de nieuwsbriefaanmelding, alle aanmeldingen bij activiteiten en ideeën die nog niet zijn goedgekeurd (met hun anoniem geüploade afbeelding). Bij goedgekeurde activiteiten worden alleen naam en e-mail van de aanvrager leeggemaakt. **Gebruikersaccounts blijven bestaan**; die beheer je bij Users. |

Alleen een admin kan het adresboek lezen of wijzigen, ook via de API.

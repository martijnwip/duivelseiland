# Design-brief: Buurt statistieken (Duivelseiland)

> Plak dit document in Claude Desktop Design en voeg `src/lib/stats/statistieken.json` toe als bijlage.
> Alle cijfers komen uit dat bestand. Verzin of rond niets zelf af.

## 1. Opdracht

Ontwerp de pagina **Buurt statistieken** voor de website van Duivelseiland, een buurt van 6 hectare in het Amsterdamse Museumkwartier (stadsdeel Zuid), met 1.381 inwoners.

Het resultaat is **geen dashboard**, maar een **infographic om doorheen te scrollen**: een verhaal over de buurt, verteld met cijfers. Een bewoner, een nieuwe buur of iemand die overweegt hier te wonen moet in een paar minuten snappen wat voor buurt dit is. Wie wil, kan daarna doorklikken naar de details.

Gewenste uitvoer:
1. Desktop-ontwerp (1440 px) en mobiel ontwerp (390 px) van de hele pagina, licht én donker.
2. Eén uitgewerkt voorbeeld van elk grafiektype dat in sectie 5 staat.
3. Beschreven interactie (hover/tap, uitklappen) en de lege/ontbrekende-data-toestanden.

## 2. Wat het ontwerp moet oproepen

- **Warm, archiefachtig, buurtgevoel.** De buurt bestaat uit 19e-eeuwse gevels (950 van de 960 adressen dateren van vóór 1925). Denk aan een mooi gedrukt buurtboekje of jaarverslag, niet aan een SaaS-dashboard.
- **Verhalend.** Elk hoofdstuk heeft één duidelijke boodschap in een gewone zin ("Bijna iedereen woont in een appartement uit vóór 1945") met de grafiek als bewijs.
- **Eerlijk en rustig.** Geen felle kleuren, geen 3D, geen decoratieve effecten die de cijfers verstoppen.
- **Toegankelijk.** Werkt zonder kleur alleen te vertrouwen (labels, patronen, volgorde), en elk cijfer is ook als tekst of tabel beschikbaar.

## 3. Merkstijl (verplicht)

**Kleuren** (Tailwind-tokens op de site, licht → donker):

| Rol | Licht | Donker |
|---|---|---|
| primary (flessengroen) | `#3b5d42` | `#6b9a73` |
| secondary (koper) | `#c99a46` | `#e0b368` |
| cta (terracotta) | `#b5482e` | `#e2703f` |
| cta-hover | `#9c3a24` | `#eb8a5c` (wordt in donker lichter) |
| on-cta (tekst op cta-vlak) | `#ffffff` | `#211c16` |
| input-border (rand invoerveld, 3:1) | `#8f836f` | `#857868` |
| achtergrond (crème) | `#f5efe3` | `#211c16` |
| tekst | `#2b241c` | `#f1e8d8` |
| border | `#e3d5be` | `#4a4136` |
| muted | `#6b5f4f` | `#a99a85` |

Bron van waarheid: `app/(site)/[locale]/globals.css` (stand van `main`, commit f7f726f). Zet in het ontwerp altijd `on-cta` op terracotta vlakken; wit op het lichtere donkere terracotta haalt het contrast niet.

- Beperk grafieken tot **maximaal 4 accenttinten** uit dit palet, plus tinten en tinten-varianten (opacity) daarvan. Extra kleuren mogen alleen als ze uit dit palet afgeleid en gecontroleerd zijn op contrast.
- Groen = "de buurt / Duivelseiland zelf", koper = vergelijkingsgebied (Amsterdam, Museumkwartier), terracotta = accent of waarschuwing (bijvoorbeeld energielabel G, dip), muted = Nederland of de rest.

**Contrast van grafiekkleuren (gemeten tegen de achtergrond, minimaal 3:1 voor lijnen en vlakken):**

| Kleur | Licht | Donker |
|---|---|---|
| primary | 6,5:1 | 5,2:1 |
| secondary (koper) | **2,2:1, onvoldoende** | 8,7:1 |
| cta | 4,7:1 | 5,3:1 |
| muted | 5,4:1 | 6,2:1 |
| border | 1,3:1 (alleen rasterlijnen) | 1,7:1 (alleen rasterlijnen) |

- Koper haalt in het lichte thema geen 3:1. Gebruik voor **lijnen, stippen en kleine balken in licht** een donkerdere datakleur `#a97b26` (3,3:1); het oorspronkelijke koper mag alleen voor grote vlakken met een donkere omtrek of labels. Dit is een voorstel voor een afgeleide datakleur, geen bestaand sitetoken.
- De vier accentkleuren liggen qua **lichtheid dicht bij elkaar** (bijvoorbeeld groen en terracotta 1,4:1 in licht). Vertrouw dus **nooit op kleur alleen**: gebruik directe labels, verschillende lijnstijlen of vullingen (effen, gearceerd) en een vaste volgorde. Voor volgordes (bijvoorbeeld energielabel A→G, leeftijd) werk je met lichtheidsstappen van één tint.
- Tekst op een terracotta vlak: altijd `on-cta`.

**Typografie:** Fraunces (alleen de paginatitel h1, serif), Lexend (koppen h2–h6), Source Sans 3 (lopende tekst en labels). Grote cijfers ("1.381", "€ 611.000") mogen in Lexend of Fraunces, kies zelf en wees consequent.

**Componentstijl van de site (zie `/styleguide`):**
- **Afronding:** `rounded` 4 px (menulinks), `rounded-lg` 8 px (knoppen, invoervelden, panelen; gebruik dit voor kaarten en grafiekblokken), `rounded-full` (ronde knoppen).
- **Ruimte (Tailwind-schaal):** 2 = 8 px, 3 = 12 px, 4 = 16 px (paginamarge mobiel), 6 = 24 px (tablet), 8 = 32 px (desktop), 12 = 48 px, 16 = 64 px. Gebruik alleen deze stappen.
- **Lijnen:** 1 px `border` in de border-kleur; paginabreedte `max-w` 3xl–5xl, veel witruimte.
- **Knop:** `rounded-lg`, cta-achtergrond, `on-cta` tekst, `px-4 py-2`, medium gewicht. **Invoerveld:** `rounded-lg`, rand `input-border`, `px-3 py-2`.
- **Header en footer:** sticky header van 80 px hoogte; donkere footer (`bg-text`) met wit, gray-300 (links), gray-400 (kleine tekst) en gray-700 (scheidingslijn). De statistiekenpagina komt tussen die twee; grafieken staan op de achtergrondkleur of op een `border`-kaart, niet op de footerkleur.
- **Logo:** varianten in `/logo/*` (zie styleguide); de hero mag het logo niet dupliceren, de header toont het al.
- De site heeft **licht en donker thema**; beide moeten er goed uitzien.

## 4. Structuur: hero en zeven hoofdstukken

Elk hoofdstuk krijgt: een titel, één zin met de kernboodschap, één **hoofdgrafiek (A)**, eventueel 1–2 **ondersteunende grafieken (B)** en details (C) die onder "Meer cijfers" uitklappen. Elke grafiek heeft **bron + jaartal** eronder.

**Hero.** Titel "Buurt statistieken", ondertitel met de buurt, en zes grote kerncijfers (KPI-rij), gevolgd door een uitnodiging om te scrollen. Sectie `kerncijfers`.

| Hoofdstuk | Kernboodschap (voorbeeld) | A (hoofd) | B (ondersteunend) | C (details) |
|---|---|---|---|---|
| **1 Mensen** | Jong, veel alleenstaanden, steeds internationaler | `leeftijd`, `herkomst-trend` | `huishoudens`, `inwoners-trend` | `geslacht`, `burgerlijke-staat`, `geboorteland`, `geboorte-sterfte` |
| **2 Wonen** | Bijna iedereen woont in een appartement uit vóór 1945 | `woningwaarde`, `eigendom`, `bouwperiode` | `energielabels`, `energieverbruik` | `woningtype`, `bewoning`, `gebruiksdoelen` |
| **3 Werk en geld** | Hoge inkomens, veel zakelijke dienstverlening | `inkomen`, `inkomen-vergelijking` | `bedrijven` | `arbeid`, `uitkeringen` |
| **4 Mobiliteit** | Weinig auto's per huishouden, elektrisch groeit snel | `voertuigen`, `elektrische-autos` | `verkeersongevallen`, `dichtheid` | `vervoer-cbs` |
| **5 Veiligheid** | Zeer dicht bebouwd; fietsendiefstal is de grootste post | `misdaad-jaren`, `misdaad-soorten` | – | `misdaad-per-1000` |
| **6 Gezondheid en welzijn** | Goed ervaren gezondheid en tevreden met de omgeving | `tevredenheid`, `leefstijl` | `gezondheid-trend`, `welzijn` | `alcohol-roken`, `geluidhinder` |
| **7 Voorzieningen en onderwijs** | Alles binnen loopafstand, behalve de school in de buurt zelf | `voorzieningen` | `school-afstand` | `leerlingen`, `opleidingsniveau` |
| **8 Vergelijking** | Wat Duivelseiland anders maakt dan de rest van Nederland | `onderscheidend` | `verkiezingen` | `vergelijk-woz-65plus` |

Afsluiting: een blok **Bronnen en toelichting** met alle bronnen, peiljaren en de uitleg over "schatting" (zie sectie 7).

### Opvallende feiten (bruikbaar als koppen of pull-quotes, allemaal uit de data)

- 23.167 inwoners per km², 43 keer zo dicht als het Nederlandse gemiddelde (536).
- 950 van de 960 adressen dateert van vóór 1925; 100% van de woningen is van vóór 1945.
- Herkomst Nederland daalde van 66% (2013) naar 45% (2025).
- De gemiddelde WOZ-waarde is gestegen van € 290.000 naar € 611.000 sinds 2013 (+111%).
- 59% van de huishoudens bestaat uit één persoon; de helft van de bewoners is 25–45 jaar.
- Het gasverbruik per woning daalde van 1.100 m³ (2013) naar 640 m³ (2024).
- Het aantal elektrische auto's steeg van 16 (maart 2022) naar 63 (september 2026).
- Van de 115 misdrijven in 2025 waren er 39 fietsen-, brom- of snorfietsdiefstallen.
- Het dichtstbijzijnde voortgezet onderwijs is gemiddeld 0,4 km weg (Nederland: 2,5 km); in de buurt zelf staat geen enkele school.
- Gemiddeld inkomen per inwoner: € 58.400 (Nederland: € 34.900).
- Het restaurant is gemiddeld 0,1 km weg, de supermarkt en huisarts 0,3 km, het treinstation 2,1 km.

## 5. Grafiektypes (kies vorm bij de data, niet andersom)

Alle cijfers staan in het JSON-bestand, per sectie met `type`, `bron`, `jaar` en `schatting`. Ontwerp elk type één keer goed en herhaal het.

| `type` in JSON | Gebruik | Ontwerpwens |
|---|---|---|
| `kpi` | Hero, inkomen | Groot cijfer, klein label, jaartal; optioneel vergelijking ("Nederland € 34.900") |
| `line` | Inwoners, WOZ, misdrijven, gas/stroom, elektrische auto's, geboorte/sterfte, gezondheid | Eén of twee lijnen, maximaal drie; markeer piek en laatste waarde direct op de grafiek; geen legenda als een direct label kan |
| `stackedArea` | Herkomst per jaar (2013–2025) | Kern van hoofdstuk 1: laat het aandeel Nederland krimpen. **2022 is `null`** (ontbrekende bron): toon een onderbreking of interpolatie met duidelijke markering, geen 0 |
| `bar` / `barHorizontal` | Leeftijd, energielabels, bedrijven, misdrijven, gebruiksdoelen | Sorteer op waarde, behalve bij een natuurlijke volgorde (leeftijd, energielabel A→G, bouwperiode); waarde als label op de balk |
| `donut` | Koop/huur, huishoudens, geslacht, bewoning | Alleen bij 2–3 delen; centrum toont het totaal |
| `stackedBar` | Verkeersongevallen 2003–2025 | Gestapeld per afloop; benadruk 2025 |
| `groupedBar` | Alcohol/roken naar leeftijd, afstand tot school | Buurt naast Nederland / Amsterdam |
| `meters` | Leefstijl, welzijn, tevredenheid | Compacte percentage-meters (0–100%) in een raster, geen taart |
| `distance` | Voorzieningen | Afstandsschaal in km met iconen per voorziening; dichtbij = links |
| `barCompare` / `compare` | Dichtheid, "wat maakt ons anders" | Duivelseiland versus Nederland (en Amsterdam); toon de factor ("43×") |
| `scatter` | Woningwaarde vs 65+ | Optioneel (C); label alleen de buurt zelf en de wijk |
| `sankey` | Geboorteland → herkomst | Optioneel (C); mag vervangen worden door een simpele gestapelde balk |

## 6. Interactie en toestanden

- Hover/tap toont een tooltip met waarde, eenheid en jaartal. Alles moet ook werken zonder hover (mobiel).
- Toetsenbord: grafieken zijn focusbaar; elk heeft een "Toon als tabel"-knop.
- Animatie: alleen subtiel (tellen naar een waarde, lijn tekenen); respecteer `prefers-reduced-motion`.
- Toestanden om uit te werken: **geen data** (`null`), **schatting** (badge), **klein aantal** (waarden afgerond op vijftallen).
- Taalwissel NL/EN: labels en zinnen kunnen in het Engels 30% langer zijn; laat ruimte.
- Sectienavigatie: sticky inhoudsopgave of voortgangsindicator, op mobiel een compacte variant.

## 7. Bronvermelding en betrouwbaarheid (verplicht in het ontwerp)

- Onder elke grafiek: **"Bron: <bron>, <jaar>"** (bijvoorbeeld "Bron: CBS, 2025").
- **Schattingen** (`"schatting": true`, de RIVM-gezondheidsmonitor: enquêtes onder een steekproef) krijgen een zichtbare badge "Schatting" en de bronregel "Schatting, bron: RIVM, 2024".
- Noem per grafiek de **oorspronkelijke bron** (CBS, RIVM, Politie, RDW, RVO, Kadaster, Rijkswaterstaat, Kiesraad). Vermeld in het bronnenblok ook dat de cijfers zijn verzameld via allecijfers.nl, met een link. CBS-cijfers vereisen bronvermelding (CC BY 4.0).
- Peiljaren verschillen per grafiek (2023 tot september 2026): toon ze altijd.
- Waarden zijn door het CBS afgerond op vijftallen. Leeftijdsgroepen tellen daardoor op tot 1.375 in plaats van 1.381; leg dat uit in een noot, niet als fout.

## 8. Bekende datakwesties (vermijd misleidende weergave)

| Onderwerp | Toelichting | Ontwerpkeuze |
|---|---|---|
| Hoger opgeleid | De bron toont "100%"; dat klopt niet (940 van 1.230 = 76%) | Toon 76% met de noot "afgeleid van de aantallen", of laat het percentage weg |
| Herkomst 2022 | Europa en buiten Europa ontbreken in de bron | Toon onderbreking, geen nul |
| Auto's | RDW telt 575 personenauto's op naam van buurtadressen (sept 2026); het CBS telt er 295 (2025) | Twee aparte weergaven met eigen bron, nooit in één grafiek |
| Elektrisch | 63 elektrische auto's (60 personenauto's + 3 bedrijfsauto's); "106" in de brandstofgrafiek bevat ook 43 elektrische bromfietsen | Gebruik 63 voor "elektrische auto's" |
| Klein aantal | Buurten met minder dan 10 woningen (Museumplein, Vondelpark-Oost) zijn statistisch onbetrouwbaar | Weglaten of grijs |
| Verkiezingen | Som van twee stembureaus in de buurt, alleen partijen uit de bron | Neutrale weergave, gewone volgorde op stemmen, geen politieke kleuren die het palet doorbreken |

## 9. Wat je niet moet doen

- Geen standaard dashboardlook met tegels en knoppen.
- Geen kleurrijk regenboogpalet, geen donut met meer dan drie delen, geen 3D, geen dubbele y-assen.
- Geen cijfers verzinnen of afronden; gebruik het JSON-bestand.
- Geen adressenlijst, postcodes of straatstatistieken (privacy, weinig waarde).

## 10. Technische randvoorwaarden (voor de latere bouw)

Next.js + Tailwind 4, tokens als CSS-variabelen (`var(--color-primary)` enz.) zodat het donkere thema automatisch werkt. Grafieken worden SVG of Recharts en krijgen hun labels als props van de server. Lever daarom bij voorkeur een ontwerp dat met eenvoudige SVG/CSS te maken is (geen exotische visualisaties die zware libraries vragen).

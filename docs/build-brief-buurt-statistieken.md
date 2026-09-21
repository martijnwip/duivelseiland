# Bouwbrief: pagina Buurt statistieken

Bouw de pagina `/buurt-statistieken` (nl en en) na, volgens het goedgekeurde ontwerp. Dit is een bouwopdracht, geen ontwerpopdracht: het ontwerp ligt vast, wijk daar alleen van af als iets niet werkt en meld het dan.

## 1. Lees eerst

| Wat | Waar |
|---|---|
| Ontwerp (canvas met de hele pagina licht/donker, desktop/mobiel, alle grafiektypes, interactie en toestanden) | https://claude.ai/artifact/2oVH2pQ5tx5Pc38NQypcfz |
| Dezelfde borden als statische HTML, lokaal te openen | `docs/design-reference/*.html` (`Desktop-Licht.html`, `Desktop-Donker.html`, `Mobiel-Licht.html`, `Mobiel-Donker.html`, `Grafiektypes.html`, `Interactie.html`) |
| Hoe de SVG-grafieken zijn berekend (geometrie, schalen, labelposities) | `docs/design-reference/generator/*.py` (alleen als naslag om te porten, niet uitvoeren of committen) |
| Inhoud en ontwerpregels | `docs/design-brief-buurt-statistieken.md` |
| Cijfers | `src/lib/stats/statistieken.json` (43 secties, 11 thema's) |
| Merk en tokens | https://claude.ai/artifact/529LDaKSYWNCtojQNXiYwT (design system Duivelseiland) en `app/(site)/[locale]/globals.css` |
| Oud plan (deels achterhaald) | `STATISTIEKEN.md`. Houd de uitgangspunten over bron en licentie, laat Recharts vallen (zie 3). |

Open de lokale HTML-bestanden in de browser op 1440 en 390 px breed en vergelijk telkens wat je bouwt met het ontwerp.

## 2. Voorbereiding

1. Deze branch (`stats`) mist de contrastfix `f7f726f` van `main` (tokens `on-cta` en `input-border`). Merge of rebase `main` eerst.
2. Alleen in `docs/` en `src/lib/stats/` staan nu nieuwe, ongecommitte bestanden. Laat `docs/design-reference/` ongecommit of vraag de eigenaar of het erin moet.
3. Route en vertalingen bestaan al: `app/(site)/[locale]/buurt-statistieken/page.tsx` (nu een placeholder) en `messages/nl.json` / `messages/en.json` onder `pages.buurtStatistieken`.

## 3. Technische keuzes

- **Eigen SVG in React, geen grafiekbibliotheek.** Het ontwerp gebruikt vormen die Recharts niet goed kan (gestapeld vlak met ontbrekend jaar, sankey, afstandsschaal, dumbbell). De geometrie is eenvoudig: lineaire schalen, paden, bogen. Schrijf kleine helpers in TypeScript (`src/lib/stats/scale.ts` en dergelijke). `d3-scale` en `d3-shape` mogen als het scheelt; geen zware libraries, geen `d3-sankey` nodig (de sankey heeft vijf vaste stromen).
- **Server components** renderen alle SVG, dus geen client-JS voor de grafieken zelf. Client-eilanden alleen voor: tooltip/tap per grafiek, "Toon als tabel", scroll-spy van de hoofdstuknavigatie en de tel-animatie. "Meer cijfers" gebruikt `<details>`/`<summary>` (of een knop met `aria-expanded`).
- **Data:** `statistieken.json` is niet uniform per sectie (naast `data` staan velden als `per_energiebron`, `verdeling`, `per_stembureau`, `meer`, `binnen_5_km`). Maak per grafiektype een TypeScript-type en een kleine adapter in `src/lib/stats/` die het JSON-veld omzet naar wat de component nodig heeft. Valideer bij het laden (bijvoorbeeld met een klein handgeschreven type-guard) zodat een fout in de data direct opvalt. Het JSON-bestand staat bewust niet in `data/` (staat in `.gitignore`).
- **Thema:** gebruik de bestaande tokens (`bg-background`, `text-text`, `border-border`, `text-primary` enzovoort). Voeg de extra grafiektinten toe in `globals.css` onder `@theme` en in het `[data-theme='dark']`-blok (waarden in 4).
- **Getallen en datums** via `Intl.NumberFormat(locale)`; in het ontwerp staan Nederlandse notaties (`1.381`, `0,34`, `€ 58.400`).
- Geen nieuwe dependencies tenzij echt nodig; noem ze dan in je samenvatting.

## 4. Extra kleuren voor de grafieken

Alleen uit het merkpalet afgeleid (vier accenttinten plus tinten). Betekenis: groen = de buurt, koper = vergelijkingsgebied (Amsterdam, Museumkwartier), terracotta = accent of uitzondering, muted = Nederland en de rest.

| Naam (voorstel) | Licht | Donker | Gebruik |
|---|---|---|---|
| `card` | `#faf6ee` | `#2a241d` | achtergrond van grafiekkaarten |
| `primary-mid` (p6) | `#7f9a84` | `#4f7358` | tweede groentint |
| `primary-soft` (p3) | `#b7c6b8` | `#3c5142` | lichte groentint |
| `secondary-soft` (s5) | `#e0c48f` | `#8d7443` | lichte koperttint (Amsterdam) |
| `cta-soft` (c4) | `#d99a86` | `#8f5236` | lichte terracotta (letselongevallen) |
| `muted-soft` (m3) | `#c9bda9` | `#4f463a` | lichte muted (andere buurten, Buiten Europa) |

Bestaande tokens: `input-border` (`#8f836f` / `#857868`) voor assen en veldranden. Koper (`secondary`) is alleen vulling, nooit tekst of dunne lijn (2,2:1 in licht). Tekstkleuren in de grafieken zijn `text` en `muted`.

## 5. Componenten (voorstel voor `src/components/stats/`)

- `StatsPage` (server): hero, hoofdstukken, bronnenblok, sticky navigatie (desktop links, mobiel compacte balk onder de header).
- `Hero` + `KpiStrip`, `Chapter` (nummer, titel, kernboodschap, opvallend cijfer, dubbele lijn erboven), `ChartCard` (titel, ondertitel, "Toon als tabel", bronregel, badge "Schatting", noot), `MoreCijfers`.
- Grafieken: `LineChart`, `StackedArea`, `BarVertical`, `BarHorizontal` (met de variant "label boven de balk"), `Donut`, `StackedBar`, `GroupedBar`, `Meters`, `DistanceScale` (met iconen), `BarCompare`, `Dumbbell` (sectie `onderscheidend`), `IncomeScale`, `Scatter`, `Sankey` (op mobiel vervangen door twee gestapelde balken).
- Elke grafiek krijgt als props alleen wat hij tekent; labels en zinnen komen van de server (vertaald), niet uit de component.

Sectie-id naar grafiek en volgorde per hoofdstuk staan in de tabel van `docs/design-brief-buurt-statistieken.md` (paragraaf 4). Het ontwerp is daar een exacte uitwerking van; volg het bord `Desktop-Licht.html` voor volgorde en kolommen.

## 6. Layout en typografie (uit het ontwerp)

- Desktop 1440: inhoud 1288 px breed gecentreerd; navigatie 216 px + 48 px tussenruimte + 1024 px inhoud. Halve kaarten 500 px (binnenmaat 452), volle kaarten 1024 px (binnenmaat 976). Kaart: `1px` `border`, `rounded-lg`, padding 24. Tussen hoofdstukken 112 px.
- Mobiel 390: paginamarge 24, kaartpadding 16, grafiekbreedte 310, tussenruimte 24, tussen hoofdstukken 64.
- Hero `h1`: Fraunces 700, 84 px (mobiel 46), `text-primary`. Hoofdstuktitel: Lexend 600, 44 px (mobiel 30). Kernboodschap: Source Sans 22 px (mobiel 19). Opvallend cijfer: Lexend 600, 56 px (mobiel 36), `text-primary`. Kaarttitel: Lexend 600, 18 px. Assen en labels 12–13 px. Kerncijfers: Lexend 600, 40 px (mobiel 32).
- Boven elk hoofdstuk een dubbele lijn (2 px en 1 px, `text`-kleur, 3 px ertussen).
- Header en footer zijn die van de site (niet opnieuw bouwen).

## 7. Datakwesties (verplicht, zie ook de design-brief paragraaf 8)

- **Hoger opgeleid:** toon 76% (afgeleid: 940 van 1.230), met een "afgeleid"-label en de noot. De bron zegt onterecht 100%.
- **Herkomst 2022:** `null` voor Europa en buiten Europa. Teken de gearceerde onderbreking met label "geen uitsplitsing in de bron"; Nederland loopt door. Nooit nul.
- **Auto's:** RDW (575 personenauto's, sept 2026) en CBS (295, 2025) in aparte kaarten met eigen bron; nooit in één grafiek.
- **Elektrisch:** 63 auto's (60 personenauto's + 3 bedrijfsauto's). De 106 in de brandstofgrafiek bevat 43 elektrische bromfietsen; zet dat in de noot.
- **Energielabels:** toon A++ tot G (labels A+++ en hoger zijn 0). Label G in `cta`.
- **Inwoners per jaar:** verticale as begint bij 1.300, met een noot. Andere lijnen beginnen bij 0.
- **Klein aantal:** Museumplein en Vondelpark-Oost (minder dan 10 woningen) als gestippelde cirkel zonder label.
- **Afronding:** het CBS rondt op vijftallen af; de leeftijdsgroepen tellen op tot 1.375 in plaats van 1.381. Leg dat uit in een noot.
- **Verkiezingen:** tien grootste partijen, één kleur, noot over de zeven andere. Aandeel is zelf berekend.
- **Bron per grafiek:** "Bron: CBS, 2026"; bij `schatting: true` "Schatting, bron: RIVM Gezondheidsmonitor, 2024" plus badge. Noem de oorspronkelijke bron, niet allecijfers.nl.

## 8. Toegankelijkheid en gedrag

- Elke SVG: `role="img"`, `aria-label` met de kernboodschap en een `<title>`; elke grafiek heeft een echte tabel achter "Toon als tabel" (`<table>` met `caption`, `th scope`).
- Kleur is nooit de enige aanwijzing: directe labels, vormen (cirkel/vierkant/ruit), arcering.
- Aanraakdoelen minstens 44 px; zichtbare focusring (`outline` 2 px `primary`, offset 2).
- Tooltip bij hover en focus; op mobiel kiest een tik een waarde die ook als tekst onder de grafiek staat. Pijltjestoetsen schuiven per punt.
- Animatie: tellen naar de waarde (600 ms) en lijn tekenen (800 ms), niets meer. Respecteer `prefers-reduced-motion`.
- Tekstcontrast minstens 4,5:1 in licht én donker; controleer met de tokens uit paragraaf 4.
- NL/EN: labels in de JSON zijn Nederlands. Zet zinnen en titels in `messages/*.json` met sleutels per sectie-id; getallen via `Intl`. Engelse teksten zijn ongeveer 30% langer: geen vaste breedtes op tekst.

## 9. Teksten die je moet controleren

De kernboodschappen per hoofdstuk komen uit de brief. De grafiektitels, ondertitels en de zinnen naast de opvallende cijfers heb ik in het ontwerp zelf geschreven op basis van de cijfers; laat de eigenaar die in een keer nalopen en zet ze pas daarna definitief in `messages`.

## 10. Volgorde van werken

1. `main` mergen, tokens toevoegen, types en adapters voor de data, getalnotatie.
2. Hero, hoofdstukkader, `ChartCard`, navigatie, bronnenblok (met één eenvoudige grafiek erin, bijvoorbeeld `BarHorizontal`).
3. De rest van de grafieken per type, in de volgorde van de tabel in paragraaf 5; na elk type vergelijken met `Grafiektypes.html`.
4. Interactie (tooltip, tabel, `Meer cijfers`, scroll-spy, animatie) volgens `Interactie.html`.
5. Mobiel, donker, NL/EN; typecheck, lint en een productiebuild.

## 11. Klaar als

- Alle 43 secties van de JSON worden getoond, met bron en jaar. De details onder "Meer cijfers" staan in het ontwerp alleen uitgeklapt in hoofdstuk 1 en 8. De overige ingeklapte details hebben geen eigen bord; bouw ze met het passende grafiektype en dezelfde kaartopmaak: `bewoning` (donut), `woningtype` (horizontale staaf), `gebruiksdoelen` (horizontale staaf, nullen weglaten), `arbeid` en `uitkeringen` (staaf), `misdaad-per-1000`, `alcohol-roken`, `geluidhinder`, `leerlingen` en `opleidingsniveau`. De kaarten voor de laatste vijf staan als voorbeeld in `generator/page.py` (`C['misdaad1000']`, `C['alcohol']`, `C['geluid']`, `C['leerlingen']`, `C['opleiding']`).
- Pagina ziet er op 1440 en 390 px, licht en donker, hetzelfde uit als het ontwerp.
- Geen console-fouten, `bunx tsc --noEmit` schoon, `next build` slaagt.
- Er is geen download- of exportfunctie (bewust niet).
- Commit op branch `stats` met een duidelijke boodschap; niet pushen zonder overleg.

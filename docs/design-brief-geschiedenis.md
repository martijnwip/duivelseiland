# Design brief — Geschiedenis van Duivelseiland

Pagina: `/geschiedenis` (NL) en `/en/geschiedenis` (EN). Inhoud: de concepttekst in `GESCHIEDENIS.md` ("Concepttekst"). Mockup: `docs/design-reference/geschiedenis/` (open `Overzicht.html`).

## 1. Doel en toon

Eén lange, scrollbare pagina die het verhaal van de buurt vertelt als een **geïllustreerde tijdlijn**: van de gemeentegrens met Nieuwer-Amstel (tot 1896) via het "eiland zonder water" en de stinkende waskaarsenfabriek tot de buurt van nu.

- **Lezer:** een buurtbewoner (vaak een expat, dus ook Engels) die in vijf minuten wil snappen waar de naam vandaan komt, en blijft hangen omdat het verhaal verrast.
- **Toon:** verhalend, licht en nieuwsgierig. Kloppende feiten, en onzekerheid benoemen we als onzekerheid (zie het blok "Wat we (nog) niet weten").
- **Kernbeeld van het verhaal:** twee "Duivelseilanden" die allebei in **1906** eindigen. Dreyfus wordt in ere hersteld en de fabriek verdwijnt. Die parallel is het hart van de pagina.

## 2. Beeldtaal: in de geest van Nicolas Guillerat

Net als de statistiekenpagina: de look van een gedrukte atlas, uitgevoerd in de huidige huisstijl. We nemen alleen de structuur en sfeer van Guillerat over, niet zijn werk.

- **Platte vectorillustraties** zonder verlopen, schaduwen of 3D, met een beperkt palet. Elke illustratie legt iets uit: een kaart, een schaal of een vergelijking. Geen decoratie om de decoratie.
- **Annotatie op het beeld:** korte labels met dunne leader-lijnen (1px, `--color-muted`), in plaats van legenda's.
- **Grote getallen** als ankerpunten: ƒ1.000.000, 1906, 60.000 m², 3000 plaatsen.
- **Rasterlijnen als in een atlas:** een dikke bovenlijn (2px `--color-text`) en een dunne onderlijn boven de kerncijfers, zoals in de hero van de statistiekenpagina.
- **Archieffoto's** in zwart-wit, zonder filters of inkleuring. Altijd met datering en bron.

## 3. Kleuren en typografie

Gebruik uitsluitend de tokens uit `app/(site)/[locale]/globals.css`. Het oude kleurenpalet in `docs/design-brief-buurt-statistieken.md` (crème en terracotta) geldt **niet** meer.

| Rol op deze pagina | Token |
| --- | --- |
| Tijdlijnas, jaartallen, links | `--color-primary` (groen) |
| De fabriek, stank, "Dreyfus"-spoor | `--color-accent` (rood), in vlakken ook `--color-accent-soft` |
| Water (Boerenwetering) | `--color-water`, contour `--color-secondary` |
| Bebouwing op de kaartjes | `--color-muted-soft` (oud) en `--color-primary-soft` (nieuw per periode) |
| Kaarten, kaders | `--color-card` met `--color-border` |

Tijdvakbanden langs de as gebruiken `--color-primary-soft`, `--color-secondary-soft`, `--color-accent-soft` en `--color-muted-soft`. Kleur is nooit de enige drager van betekenis: elke band heeft ook een label.

**Typografie:**
- `h1` in Fraunces (serif), zoals op de hele site.
- `h2`, `h3`, jaartallen en grote getallen in Lexend.
- Lopende tekst in Source Sans 3, 18px, regelhoogte 1,55, maximaal circa 65 tekens per regel.
- Jaartallen in Lexend 600 met `font-variant-numeric: tabular-nums`.

Het donkere thema werkt automatisch via dezelfde tokens. Test elke SVG in beide thema's.

## 4. Paginastructuur

1. **Hero.**
   - Label: "Duivelseiland · Museumkwartier · Amsterdam-Zuid".
   - H1: *Een eiland zonder water*, met de ondertitel en de openingszin *"In 1906 rook het hier nog naar kaarsvet."*
   - Rechts (op mobiel eronder) de prent van de fabriek (D2).
   - Daaronder een rij kerncijfers tussen atlaslijnen: **1896** annexatie, **ƒ1 mln** vraagprijs, **1906** keerpunt, **7.400 km** naar het echte Duivelseiland.
2. **Tijdlijn** met zes tijdvakken. Elk tijdvak heeft:
   - een tijdvakkop op de as: het jaartalbereik groot, de titel en de kernzin;
   - lopende tekst;
   - knopen (gebeurtenissen): een icoon in een cirkel op de as, het jaartal, een kop en één of twee zinnen, soms met een archiefbeeld;
   - een optioneel kader ("Wie was Dreyfus?") of een groot getal.
3. **Infographic-momenten.** Die breken uit de tijdlijn en nemen de volle breedte. Zie §5.
4. **Uit het archief:** een slideshow met losse foto's (hergebruik van `HeroSlideshow`).
5. **Wat we (nog) niet weten:** een kader met een gestippelde rand en een oproep met een knop.
6. **Bronnen:** een genummerde lijst in kleine tekst.
7. **Meer verhalen:** de bestaande lijst met geschiedenis-items.

## 5. De tijdlijn

**Opbouw van de as:**
- Een doorlopende verticale lijn (2px `--color-primary`). Op mobiel staat die 20px van de linkerrand, met de kaarten rechts ervan. Vanaf 1024px staat de as in het midden en wisselen de knopen links en rechts af. De tijdvakkoppen staan dan gecentreerd op de as.
- **Knoop:** een cirkel van 36px (`--color-card`, rand 2px in de tijdvakkleur) met een icoon van 20px. De datum staat boven de kop, in Lexend 600 15px `--color-primary`.
- **Schaalbreuk.** De as is niet op schaal. Waar een sprong van meer dan 10 jaar zit (1882→1894, 1930→nu), wordt de lijn onderbroken met een "≈"-teken en een label zoals "12 jaar later".
- **Sticky jaarteller.** Op desktop een klein label linksboven in de marge, op mobiel rechtsboven onder de header. Het toont het jaartal van de knoop die nu in beeld is (IntersectionObserver). Bij `prefers-reduced-motion` is er geen telanimatie. De teller is `aria-hidden`: de jaartallen staan al in de tekst.

**Iconenset** (platte lijnicoontjes, 1,5px lijn, 20×20): school, brandweer, kaart, brug, eiland, duivel (het staartje uit het embleem), camera, fabriek, circus, fiets, zwemmer, huis, kroon.

## 6. Infographics

Minimale tekstgrootte in SVG is 12px op het scherm. Een viewBox die op mobiel verkleind wordt (zoals de doorsnede van de fabriek) krijgt bij de bouw een eigen mobiele variant met grotere labels, of de labels gaan als HTML onder de figuur.

Alle infographics zijn inline SVG met de kleurtokens, en hebben een `<figcaption>` met de kern in woorden. Waar er gegevens in zitten, komt er ook een visueel verborgen lijst bij voor schermlezers.

1. **Twee eilanden, één tijdlijn (1894–1906).**
   - Twee horizontale sporen boven elkaar met een gedeelde jarenschaal (1894 t/m 1906): "Parijs / Duivelseiland, Frans-Guyana" (rood) en "Amsterdam / Duivelseiland, Zuid" (groen).
   - Beide sporen komen samen in één verticale band bij **1906**.
   - Een kleine afstandsboog Amsterdam → Île du Diable met "ca. 7.400 km" (in de mockup geen wereldkaart: dat voegt weinig toe en wordt snel onleesbaar).
   - Op mobiel is de grafiek in de mockup horizontaal scrollbaar (min. 760px breed). Bij de bouw liever een verticale variant: twee kolommen naast elkaar met de jaren van boven naar beneden.
2. **De buurt groeit (1896 · 1906 · 1930 · nu).**
   - Vier kleine kaartjes met dezelfde schematische uitsnede: de Boerenwetering als blauwe band rechts, de buurtcontour als trapezium (Roelof Hartplein linksonder, Hobbemakade rechts).
   - Per jaar verandert de bebouwing: 1896 losse houten huisjes, 1906 de fabriek in rood met een kruis ("gesloopt"), 1930 de gesloten bouwblokken, nu met de buurtgrens als stippellijn.
   - Op mobiel een horizontale scroll-snaprij, op desktop vier naast elkaar.
3. **De fabriek in getallen.**
   - Een groot getal **ƒ1.000.000**.
   - Een schematisch dwarsprofiel: fabriek → wetering → buurt, met een "stankwolk" (rode gestippelde contour met een pijl) die over de buurt drijft.
   - Twee kleine voor/na-vlakjes: "tot 1906" met de fabriek, "na 1906" met de Hobbemakade als tweede toegang (een pijl naar de buurt).
4. **Om de hoek.** Een langwerpig kaartje van de Hobbemakade langs de wetering, met genummerde gebouwen (1–4). Eronder vier kaarten met een mini-tijdlijn per gebouw. Velox bijvoorbeeld: 1898 fietsschool → 1906 showroom → 1912 Zuiderbad.
5. **Duivelseiland in maten.** De buurtcontour met de vijf grensstraten als labels. Ernaast 9 voetbalveldjes waarvan er ca. 8½ zijn ingekleurd: "ca. 60.000 m² — nog geen 9 voetbalvelden". Met een link naar de buurtstatistieken.

## 7. Archiefbeelden

- **Component `ArchiveFigure`:** de afbeelding in 4:3 of in de oorspronkelijke verhouding, met `rounded` (4px). Het bijschrift staat eronder: titel, dan datering · maker · "Stadsarchief Amsterdam", en een link "Bekijk in de Beeldbank ↗".
- **Rechten.** Alleen beelden met `rechten = vrij` worden getoond. De andere foto's verschijnen als **archiefkaart**: een vlak met een gestippelde rand, een camera-icoon, de titel, de datum en "Deze foto is auteursrechtelijk beschermd. Bekijk hem in de Beeldbank ↗". Die kaart moet er ook aantrekkelijk uitzien, niet als een foutmelding.
- **Beelden laden:** `loading="lazy"`, vaste `width` en `height` tegen layout shift, en een alt-tekst uit de titel.

## 8. Interactie en toegankelijkheid

- Geen scroll-jacking. De pagina scrollt normaal. Animaties zijn beperkt tot infaden en het "tekenen" van lijnen (hergebruik van `stats-draw`/`stats-fade`), en vallen uit bij `prefers-reduced-motion`.
- Tijdvakken zijn `<section>`s met een `id` (anker), zodat `/geschiedenis#naam` werkt vanaf de pagina "Waar komt de naam vandaan".
- De tijdlijn is semantisch een `<ol>` met `<li>`'s en `<time datetime>`.
- Contrast is minimaal 4,5:1 voor tekst en 3:1 voor lijnen en iconen, in beide thema's.
- Klikdoelen zijn minimaal 44px. De horizontale kaartjesrij is met het toetsenbord bereikbaar (`tabindex="0"` op de scrollcontainer, met een label).

## 9. Buiten scope (voor nu)

- Geen interactieve kaart met Leaflet. De kaartjes zijn statische SVG's.
- Geen "toen en nu"-sleepvergelijking met eigen foto's. Kan later, als er eigen foto's zijn.
- Geen download of printversie.

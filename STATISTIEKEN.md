# Statistieken Duivelseiland

Buurtcijfers over Duivelseiland, getoond als grafieken op de site. Referentie voor de gewenste inhoud is de buurtpagina op allecijfers.nl; de data zelf komt van de onderliggende open bronnen.

## Uitgangspunten

- Bron is CBS (en waar nodig RDW, Politie, RIVM, RVO), niet allecijfers.nl. Allecijfers is een presentatielaag over dezelfde open data; scrapen is fragiel en de licentie is onduidelijk. CBS-data valt onder CC BY 4.0 met bronvermelding.
- Cijfers staan als JSON in de repo, niet in Payload. Ze wijzigen één keer per jaar; bijwerken is een commit, geen CMS-taak.
- Grafieken zijn Recharts-componenten in client components; de data komt via een server component uit de JSON.
- Elk cijfer toont bron en peiljaar. Schattingen (RIVM gezondheid, inkomen) worden als schatting gelabeld.

## Databron

Hoofdtabel: CBS Kerncijfers wijken en buurten (KWB). Per jaar een eigen StatLine-tabel (2023: 85618NED; recentere jaren via StatLine zoeken op "Kerncijfers wijken en buurten"). Alternatief voor de eerste vulling: het Excel-bestand `kwb2025.xlsx` van de CBS-maatwerkpagina, één rij per buurt.

Sleutel: de CBS-buurtcode van Duivelseiland (vorm `BU0363xxxx`), op te zoeken in de KWB-tabel op naam.

Aanvullende bronnen, alleen als KWB het cijfer niet bevat:

| Onderwerp                               | Bron                                  | Opmerking                       |
| --------------------------------------- | ------------------------------------- | ------------------------------- |
| Voertuigen, elektrisch                  | RDW open data / CBS                   | KWB bevat totaal personenauto's |
| Misdrijven per type                     | Politie open data (data.politie.nl)   | per buurt beschikbaar           |
| Gezondheid (rokers, ervaren gezondheid) | RIVM Gezondheidsmonitor, buurtcijfers | modelmatige schatting           |
| Energielabels                           | RVO / EP-online                       | per adres, aggregeren per buurt |

Optioneel: Gemeente Amsterdam Onderzoek en Statistiek (data.amsterdam.nl) heeft eigen buurtcijfers die soms actueler zijn dan CBS.

## Onderwerpen en grafieken

| Onderwerp       | Cijfers                                                                     | Grafiek                                  |
| --------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| Kerncijfers     | inwoners, huishoudens, woningen, gemiddelde WOZ                             | losse getallen                           |
| Leeftijdsopbouw | 0-15, 15-25, 25-45, 45-65, 65+                                              | staafdiagram                             |
| Huishoudens     | eenpersoons, meerpersoons zonder kinderen, met kinderen; gemiddelde grootte | staafdiagram of donut                    |
| Inkomen         | gemiddeld inkomen per inwoner en per ontvanger; nettoarbeidsparticipatie    | losse getallen, label "schatting"        |
| Wonen           | koop/huur, bouwjaar, WOZ-ontwikkeling                                       | staaf; lijn voor WOZ over jaren          |
| Energie         | elektriciteit en gas per woning; energielabels                              | staaf per label                          |
| Vervoer         | personenauto's totaal, elektrisch, per huishouden                           | losse getallen of staaf                  |
| Veiligheid      | misdrijven per type                                                         | horizontale staaf                        |
| Gezondheid      | ervaren gezondheid, rokers                                                  | losse getallen, label "schatting (RIVM)" |

Trend over jaren (inwoners, WOZ) is het enige onderdeel dat meer biedt dan allecijfers; alleen opnemen als de historische data zonder veel werk uit KWB te halen is.

## JSON-structuur

```
data/statistieken.json
```

```json
{
  "buurt": "Duivelseiland",
  "buurtcode": "BU0363xxxx",
  "bijgewerkt": "2026-09",
  "secties": [
    {
      "id": "leeftijd",
      "titel": "Leeftijdsopbouw",
      "type": "bar",
      "bron": "CBS Kerncijfers wijken en buurten",
      "jaar": 2025,
      "schatting": false,
      "data": [
        { "label": "0-15", "waarde": 115 },
        { "label": "15-25", "waarde": 165 },
        { "label": "25-45", "waarde": 695 },
        { "label": "45-65", "waarde": 275 },
        { "label": "65+", "waarde": 125 }
      ]
    },
    {
      "id": "kerncijfers",
      "titel": "Kerncijfers",
      "type": "kpi",
      "bron": "CBS Kerncijfers wijken en buurten",
      "jaar": 2025,
      "schatting": false,
      "data": [
        { "label": "Inwoners", "waarde": 1381 },
        { "label": "Huishoudens", "waarde": 860 },
        { "label": "Woningen", "waarde": 885 },
        { "label": "Gemiddelde WOZ", "waarde": 611000, "eenheid": "€" }
      ]
    }
  ]
}
```

`type` is een van `kpi`, `bar`, `barHorizontal`, `donut`, `line`. Eén component per type; de pagina loopt over `secties`.

## Implementatie

```
src/
  app/(site)/statistieken/page.tsx      server component, leest JSON
  components/stats/
    StatsSection.tsx                    kiest component op basis van type
    KpiRow.tsx
    BarChart.tsx                        "use client", Recharts
    DonutChart.tsx
    LineChart.tsx
data/
  statistieken.json
scripts/
  update-stats.ts                       haalt KWB op via StatLine OData, schrijft JSON
```

- Recharts is de enige extra dependency.
- Het update-script is optioneel voor de eerste versie; handmatig vullen vanuit `kwb2025.xlsx` is sneller.
- Kleuren en typografie volgen de site, geen chart-thema van Recharts.
- Onder elke grafiek: "Bron: CBS, peiljaar 2025" of "Schatting, bron: RIVM, 2024".

## Later

- Trendgrafieken over meerdere KWB-jaren.
- Vergelijking met stadsdeel Zuid of heel Amsterdam als tweede reeks.
- Jaarlijkse herinnering (september, wanneer CBS de nieuwe KWB publiceert) om de JSON bij te werken.

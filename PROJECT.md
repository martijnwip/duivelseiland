# Wijkwebsite Amsterdam

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

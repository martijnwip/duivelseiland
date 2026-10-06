import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

// Lege migratie na het mergen van de branches activiteiten en nieuwsbrief. Hun migraties liepen
// tegelijk, dus geen enkele .json-snapshot bevatte het hele schema (die van 20261002_140942 miste
// nieuwsbrief_abonnees.naam, dat al in 20261002_131210 zit). Het .json-bestand naast deze migratie
// is de volledige snapshot waar de volgende `migrate:create` tegen vergelijkt.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}

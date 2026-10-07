import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// De rest van de buurtpas (alleen_buurt, de buurtpasvelden op email_adressen) staat in 20261006_235848_buurtpas,
// die al op productie gedraaid heeft. Hier alleen wat er daarna bij kwam: de nieuwsbrief bij de aanvraag.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_nieuwsbrief\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_locale\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_nieuwsbrief\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_locale\`;`)
}

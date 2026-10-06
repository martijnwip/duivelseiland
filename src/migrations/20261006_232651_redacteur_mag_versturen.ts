import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_instellingen\` ADD \`nieuwsbrief_redacteur_mag_versturen\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_instellingen\` DROP COLUMN \`nieuwsbrief_redacteur_mag_versturen\`;`)
}

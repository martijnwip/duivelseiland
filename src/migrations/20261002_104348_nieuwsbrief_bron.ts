import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` ADD \`bron\` text DEFAULT 'formulier' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` DROP COLUMN \`bron\`;`)
}

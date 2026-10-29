import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`whatsapp_aanmeldingen\` ADD \`uitgenodigd_op\` text;`)
  await db.run(sql`ALTER TABLE \`site_instellingen\` ADD \`whatsapp_buurt_uitnodiging\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`whatsapp_aanmeldingen\` DROP COLUMN \`uitgenodigd_op\`;`)
  await db.run(sql`ALTER TABLE \`site_instellingen\` DROP COLUMN \`whatsapp_buurt_uitnodiging\`;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`nieuws\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`interviews\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` ADD \`alleen_buurt\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_ingetrokken\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_versie\` numeric DEFAULT 1;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_laatst_gebruikt\` text;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_token\` text;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_token_tot\` text;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`laatste_buurtpas_mail_op\` text;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_nieuwsbrief\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` ADD \`buurtpas_locale\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`email_adressen_buurtpas_token_idx\` ON \`email_adressen\` (\`buurtpas_token\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`email_adressen_buurtpas_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_ingetrokken\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_versie\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_laatst_gebruikt\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_token\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_token_tot\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`laatste_buurtpas_mail_op\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_nieuwsbrief\`;`)
  await db.run(sql`ALTER TABLE \`email_adressen\` DROP COLUMN \`buurtpas_locale\`;`)
  await db.run(sql`ALTER TABLE \`nieuws\` DROP COLUMN \`alleen_buurt\`;`)
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`alleen_buurt\`;`)
  await db.run(sql`ALTER TABLE \`interviews\` DROP COLUMN \`alleen_buurt\`;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` DROP COLUMN \`alleen_buurt\`;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` DROP COLUMN \`alleen_buurt\`;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` DROP COLUMN \`alleen_buurt\`;`)
}

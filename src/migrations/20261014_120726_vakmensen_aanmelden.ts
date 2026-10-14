import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`ander_vak\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`moderatie\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`afwijs_reden\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`aanmelder_naam\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`aanmelder_email\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`aanmelder_toelichting\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`locale\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`token\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`laatste_mail_op\` text;`)
  await db.run(sql`CREATE INDEX \`vakmensen_moderatie_idx\` ON \`vakmensen\` (\`moderatie\`);`)
  await db.run(sql`CREATE INDEX \`vakmensen_token_idx\` ON \`vakmensen\` (\`token\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`vakmensen_moderatie_idx\`;`)
  await db.run(sql`DROP INDEX \`vakmensen_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`ander_vak\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`moderatie\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`afwijs_reden\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`aanmelder_naam\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`aanmelder_email\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`aanmelder_toelichting\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`locale\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`token\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`laatste_mail_op\`;`)
}

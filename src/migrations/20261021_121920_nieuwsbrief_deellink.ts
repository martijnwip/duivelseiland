import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`nieuwsbrief_edities\` ADD \`deel_token\` text;`)
  await db.run(sql`CREATE INDEX \`nieuwsbrief_edities_deel_token_idx\` ON \`nieuwsbrief_edities\` (\`deel_token\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`nieuwsbrief_edities_deel_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_edities\` DROP COLUMN \`deel_token\`;`)
}

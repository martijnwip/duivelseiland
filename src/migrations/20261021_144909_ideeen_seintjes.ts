import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` ADD \`ideeen\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` ADD \`ideeen_vanaf\` text;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` ADD \`ideeen_gemaild_op\` text;`)
  await db.run(sql`CREATE INDEX \`nieuwsbrief_abonnees_ideeen_idx\` ON \`nieuwsbrief_abonnees\` (\`ideeen\`);`)
  await db.run(sql`CREATE INDEX \`nieuwsbrief_abonnees_ideeen_gemaild_op_idx\` ON \`nieuwsbrief_abonnees\` (\`ideeen_gemaild_op\`);`)
  await db.run(sql`ALTER TABLE \`activiteiten\` ADD \`goedgekeurd_op\` text;`)
  await db.run(sql`CREATE INDEX \`activiteiten_goedgekeurd_op_idx\` ON \`activiteiten\` (\`goedgekeurd_op\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`nieuwsbrief_abonnees_ideeen_idx\`;`)
  await db.run(sql`DROP INDEX \`nieuwsbrief_abonnees_ideeen_gemaild_op_idx\`;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` DROP COLUMN \`ideeen\`;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` DROP COLUMN \`ideeen_vanaf\`;`)
  await db.run(sql`ALTER TABLE \`nieuwsbrief_abonnees\` DROP COLUMN \`ideeen_gemaild_op\`;`)
  await db.run(sql`DROP INDEX \`activiteiten_goedgekeurd_op_idx\`;`)
  await db.run(sql`ALTER TABLE \`activiteiten\` DROP COLUMN \`goedgekeurd_op\`;`)
}

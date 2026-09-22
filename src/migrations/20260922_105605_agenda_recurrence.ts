import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`recurrence\` text DEFAULT 'none';`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`recurrence_time\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`recurrence\`;`)
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`recurrence_time\`;`)
}

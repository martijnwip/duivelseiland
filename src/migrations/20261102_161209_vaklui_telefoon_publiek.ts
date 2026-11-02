import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vaklui\` ADD \`telefoon_publiek\` integer DEFAULT false;`)
  // Bestaande nummers worden openbaar; nieuwe vaklui hebben het vinkje standaard uit.
  await db.run(sql`UPDATE \`vaklui\` SET \`telefoon_publiek\` = 1 WHERE \`telefoon\` IS NOT NULL AND TRIM(\`telefoon\`) <> '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vaklui\` DROP COLUMN \`telefoon_publiek\`;`)
}

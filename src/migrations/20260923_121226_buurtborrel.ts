import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`buurtborrel\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`aanmeld_email\` text DEFAULT 'duivelseiland@outlook.com' NOT NULL,
  	\`buren_app_nummer\` text,
  	\`barry_nummer\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`buurtborrel\`;`)
}

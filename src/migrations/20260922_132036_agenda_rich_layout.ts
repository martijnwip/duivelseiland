import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`agenda_schedule\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`time\` text,
  	\`icon\` text DEFAULT 'meeting',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`agenda_schedule_order_idx\` ON \`agenda_schedule\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`agenda_schedule_parent_id_idx\` ON \`agenda_schedule\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`agenda_schedule_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agenda_schedule\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_schedule_locales_locale_parent_id_unique\` ON \`agenda_schedule_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`agenda_locales\` ADD \`intro\` text;`)
  await db.run(sql`ALTER TABLE \`agenda_locales\` ADD \`cta_label\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`agenda_schedule\`;`)
  await db.run(sql`DROP TABLE \`agenda_schedule_locales\`;`)
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`cta_url\`;`)
  await db.run(sql`ALTER TABLE \`agenda_locales\` DROP COLUMN \`intro\`;`)
  await db.run(sql`ALTER TABLE \`agenda_locales\` DROP COLUMN \`cta_label\`;`)
}

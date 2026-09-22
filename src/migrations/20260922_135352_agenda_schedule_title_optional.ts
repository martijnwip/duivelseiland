import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_agenda_schedule_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agenda_schedule\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_agenda_schedule_locales\`("title", "description", "id", "_locale", "_parent_id") SELECT "title", "description", "id", "_locale", "_parent_id" FROM \`agenda_schedule_locales\`;`)
  await db.run(sql`DROP TABLE \`agenda_schedule_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_agenda_schedule_locales\` RENAME TO \`agenda_schedule_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_schedule_locales_locale_parent_id_unique\` ON \`agenda_schedule_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_agenda_schedule_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agenda_schedule\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_agenda_schedule_locales\`("title", "description", "id", "_locale", "_parent_id") SELECT "title", "description", "id", "_locale", "_parent_id" FROM \`agenda_schedule_locales\`;`)
  await db.run(sql`DROP TABLE \`agenda_schedule_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_agenda_schedule_locales\` RENAME TO \`agenda_schedule_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_schedule_locales_locale_parent_id_unique\` ON \`agenda_schedule_locales\` (\`_locale\`,\`_parent_id\`);`)
}

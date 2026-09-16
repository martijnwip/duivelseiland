import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`nieuws_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`nieuws\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`nieuws_locales_locale_parent_id_unique\` ON \`nieuws_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`agenda_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_locales_locale_parent_id_unique\` ON \`agenda_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`interviews_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`interviews\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`interviews_locales_locale_parent_id_unique\` ON \`interviews_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_locales_locale_parent_id_unique\` ON \`geschiedenis_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`duivelse_kunst_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`duivelse_kunst\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`duivelse_kunst_locales_locale_parent_id_unique\` ON \`duivelse_kunst_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vakmensen_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vakmensen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`vakmensen_locales_locale_parent_id_unique\` ON \`vakmensen_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`praktische_info_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`praktische_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`praktische_info_locales_locale_parent_id_unique\` ON \`praktische_info_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_instellingen_menu_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_instellingen_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_instellingen_menu_locales_locale_parent_id_unique\` ON \`site_instellingen_menu_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_instellingen_locales\` (
  	\`footer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_instellingen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_instellingen_locales_locale_parent_id_unique\` ON \`site_instellingen_locales\` (\`_locale\`,\`_parent_id\`);`)

  // Seed the new locale tables from the existing single-language columns
  // (under the default locale, 'nl') before those columns are dropped, so
  // any content entered before this migration is not lost.
  await db.run(sql`INSERT INTO \`media_locales\` (\`_parent_id\`, \`_locale\`, \`alt\`, \`caption\`) SELECT \`id\`, 'nl', \`alt\`, \`caption\` FROM \`media\`;`)
  await db.run(sql`INSERT INTO \`nieuws_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`nieuws\`;`)
  await db.run(sql`INSERT INTO \`agenda_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`agenda\`;`)
  await db.run(sql`INSERT INTO \`interviews_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`interviews\`;`)
  await db.run(sql`INSERT INTO \`geschiedenis_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`geschiedenis\`;`)
  await db.run(sql`INSERT INTO \`duivelse_kunst_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`duivelse_kunst\`;`)
  await db.run(sql`INSERT INTO \`vakmensen_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`vakmensen\`;`)
  await db.run(sql`INSERT INTO \`praktische_info_locales\` (\`_parent_id\`, \`_locale\`, \`title\`, \`content\`) SELECT \`id\`, 'nl', \`title\`, \`content\` FROM \`praktische_info\`;`)
  await db.run(sql`INSERT INTO \`site_instellingen_menu_locales\` (\`_parent_id\`, \`_locale\`, \`label\`) SELECT \`id\`, 'nl', \`label\` FROM \`site_instellingen_menu\`;`)
  await db.run(sql`INSERT INTO \`site_instellingen_locales\` (\`_parent_id\`, \`_locale\`, \`footer\`) SELECT \`id\`, 'nl', \`footer\` FROM \`site_instellingen\`;`)

  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`caption\`;`)
  await db.run(sql`ALTER TABLE \`nieuws\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`nieuws\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`agenda\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`interviews\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`interviews\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`site_instellingen_menu\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`site_instellingen\` DROP COLUMN \`footer\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Columns are re-added nullable (SQLite can't ALTER TABLE ADD COLUMN with a
  // NOT NULL constraint and no default against a non-empty table), then
  // backfilled from the 'nl' locale row before the locale tables are dropped,
  // so rolling back does not silently discard translated content.
  await db.run(sql`ALTER TABLE \`media\` ADD \`alt\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`caption\` text;`)
  await db.run(sql`ALTER TABLE \`nieuws\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`nieuws\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`interviews\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`interviews\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`geschiedenis\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`duivelse_kunst\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`vakmensen\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`praktische_info\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`site_instellingen_menu\` ADD \`label\` text;`)
  await db.run(sql`ALTER TABLE \`site_instellingen\` ADD \`footer\` text;`)

  await db.run(sql`UPDATE \`media\` SET \`alt\` = (SELECT \`alt\` FROM \`media_locales\` WHERE \`media_locales\`.\`_parent_id\` = \`media\`.\`id\` AND \`media_locales\`.\`_locale\` = 'nl'), \`caption\` = (SELECT \`caption\` FROM \`media_locales\` WHERE \`media_locales\`.\`_parent_id\` = \`media\`.\`id\` AND \`media_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`nieuws\` SET \`title\` = (SELECT \`title\` FROM \`nieuws_locales\` WHERE \`nieuws_locales\`.\`_parent_id\` = \`nieuws\`.\`id\` AND \`nieuws_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`nieuws_locales\` WHERE \`nieuws_locales\`.\`_parent_id\` = \`nieuws\`.\`id\` AND \`nieuws_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`agenda\` SET \`title\` = (SELECT \`title\` FROM \`agenda_locales\` WHERE \`agenda_locales\`.\`_parent_id\` = \`agenda\`.\`id\` AND \`agenda_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`agenda_locales\` WHERE \`agenda_locales\`.\`_parent_id\` = \`agenda\`.\`id\` AND \`agenda_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`interviews\` SET \`title\` = (SELECT \`title\` FROM \`interviews_locales\` WHERE \`interviews_locales\`.\`_parent_id\` = \`interviews\`.\`id\` AND \`interviews_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`interviews_locales\` WHERE \`interviews_locales\`.\`_parent_id\` = \`interviews\`.\`id\` AND \`interviews_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`geschiedenis\` SET \`title\` = (SELECT \`title\` FROM \`geschiedenis_locales\` WHERE \`geschiedenis_locales\`.\`_parent_id\` = \`geschiedenis\`.\`id\` AND \`geschiedenis_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`geschiedenis_locales\` WHERE \`geschiedenis_locales\`.\`_parent_id\` = \`geschiedenis\`.\`id\` AND \`geschiedenis_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`duivelse_kunst\` SET \`title\` = (SELECT \`title\` FROM \`duivelse_kunst_locales\` WHERE \`duivelse_kunst_locales\`.\`_parent_id\` = \`duivelse_kunst\`.\`id\` AND \`duivelse_kunst_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`duivelse_kunst_locales\` WHERE \`duivelse_kunst_locales\`.\`_parent_id\` = \`duivelse_kunst\`.\`id\` AND \`duivelse_kunst_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`vakmensen\` SET \`title\` = (SELECT \`title\` FROM \`vakmensen_locales\` WHERE \`vakmensen_locales\`.\`_parent_id\` = \`vakmensen\`.\`id\` AND \`vakmensen_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`vakmensen_locales\` WHERE \`vakmensen_locales\`.\`_parent_id\` = \`vakmensen\`.\`id\` AND \`vakmensen_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`praktische_info\` SET \`title\` = (SELECT \`title\` FROM \`praktische_info_locales\` WHERE \`praktische_info_locales\`.\`_parent_id\` = \`praktische_info\`.\`id\` AND \`praktische_info_locales\`.\`_locale\` = 'nl'), \`content\` = (SELECT \`content\` FROM \`praktische_info_locales\` WHERE \`praktische_info_locales\`.\`_parent_id\` = \`praktische_info\`.\`id\` AND \`praktische_info_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`site_instellingen_menu\` SET \`label\` = (SELECT \`label\` FROM \`site_instellingen_menu_locales\` WHERE \`site_instellingen_menu_locales\`.\`_parent_id\` = \`site_instellingen_menu\`.\`id\` AND \`site_instellingen_menu_locales\`.\`_locale\` = 'nl');`)
  await db.run(sql`UPDATE \`site_instellingen\` SET \`footer\` = (SELECT \`footer\` FROM \`site_instellingen_locales\` WHERE \`site_instellingen_locales\`.\`_parent_id\` = \`site_instellingen\`.\`id\` AND \`site_instellingen_locales\`.\`_locale\` = 'nl');`)

  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`nieuws_locales\`;`)
  await db.run(sql`DROP TABLE \`agenda_locales\`;`)
  await db.run(sql`DROP TABLE \`interviews_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_locales\`;`)
  await db.run(sql`DROP TABLE \`duivelse_kunst_locales\`;`)
  await db.run(sql`DROP TABLE \`vakmensen_locales\`;`)
  await db.run(sql`DROP TABLE \`praktische_info_locales\`;`)
  await db.run(sql`DROP TABLE \`site_instellingen_menu_locales\`;`)
  await db.run(sql`DROP TABLE \`site_instellingen_locales\`;`)
}

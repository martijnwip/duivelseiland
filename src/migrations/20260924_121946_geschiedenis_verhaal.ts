import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_kerncijfers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_kerncijfers_order_idx\` ON \`geschiedenis_verhaal_kerncijfers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_kerncijfers_parent_id_idx\` ON \`geschiedenis_verhaal_kerncijfers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_kerncijfers_locales\` (
  	\`waarde\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal_kerncijfers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_verhaal_kerncijfers_locales_locale_parent_id_un\` ON \`geschiedenis_verhaal_kerncijfers_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`jaar\` numeric,
  	\`icoon\` text DEFAULT 'huis' NOT NULL,
  	\`foto_id\` integer,
  	FOREIGN KEY (\`foto_id\`) REFERENCES \`historische_fotos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal_tijdvakken\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_order_idx\` ON \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_parent_id_idx\` ON \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_foto_idx\` ON \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\` (\`foto_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_locales\` (
  	\`datum\` text NOT NULL,
  	\`titel\` text NOT NULL,
  	\`tekst\` text,
  	\`breuk_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_locales_local\` ON \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_tijdvakken\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`anker\` text NOT NULL,
  	\`kleur\` text DEFAULT 'groen',
  	\`infographic\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_tijdvakken_order_idx\` ON \`geschiedenis_verhaal_tijdvakken\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_tijdvakken_parent_id_idx\` ON \`geschiedenis_verhaal_tijdvakken\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_tijdvakken_locales\` (
  	\`band\` text NOT NULL,
  	\`titel\` text NOT NULL,
  	\`kernzin\` text,
  	\`tekst\` text,
  	\`kader_titel\` text,
  	\`kader_tekst\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal_tijdvakken\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_verhaal_tijdvakken_locales_locale_parent_id_uni\` ON \`geschiedenis_verhaal_tijdvakken_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_bronnen\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_bronnen_order_idx\` ON \`geschiedenis_verhaal_bronnen\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_bronnen_parent_id_idx\` ON \`geschiedenis_verhaal_bronnen\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_bronnen_locales\` (
  	\`tekst\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal_bronnen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_verhaal_bronnen_locales_locale_parent_id_unique\` ON \`geschiedenis_verhaal_bronnen_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`hero_foto_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_foto_id\`) REFERENCES \`historische_fotos\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_hero_foto_idx\` ON \`geschiedenis_verhaal\` (\`hero_foto_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_locales\` (
  	\`titel\` text NOT NULL,
  	\`ondertitel\` text,
  	\`openingszin\` text,
  	\`intro\` text,
  	\`onbekend_tekst\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`geschiedenis_verhaal\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_verhaal_locales_locale_parent_id_unique\` ON \`geschiedenis_verhaal_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis_verhaal_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`historische_fotos_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`geschiedenis_verhaal\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`historische_fotos_id\`) REFERENCES \`historische_fotos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_rels_order_idx\` ON \`geschiedenis_verhaal_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_rels_parent_idx\` ON \`geschiedenis_verhaal_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_rels_path_idx\` ON \`geschiedenis_verhaal_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_verhaal_rels_historische_fotos_id_idx\` ON \`geschiedenis_verhaal_rels\` (\`historische_fotos_id\`);`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` ADD \`datering\` text;`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` ADD \`vervaardiger\` text;`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` ADD \`rechten\` text DEFAULT 'onbekend' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_kerncijfers\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_kerncijfers_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_tijdvakken_gebeurtenissen\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_tijdvakken_gebeurtenissen_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_tijdvakken\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_tijdvakken_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_bronnen\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_bronnen_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_locales\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis_verhaal_rels\`;`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` DROP COLUMN \`datering\`;`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` DROP COLUMN \`vervaardiger\`;`)
  await db.run(sql`ALTER TABLE \`historische_fotos\` DROP COLUMN \`rechten\`;`)
}

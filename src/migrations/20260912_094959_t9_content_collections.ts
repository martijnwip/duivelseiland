import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`nieuws\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`nieuws_slug_idx\` ON \`nieuws\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`nieuws_author_idx\` ON \`nieuws\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`nieuws_image_idx\` ON \`nieuws\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`nieuws_updated_at_idx\` ON \`nieuws\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`nieuws_created_at_idx\` ON \`nieuws\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`agenda\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_slug_idx\` ON \`agenda\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`agenda_author_idx\` ON \`agenda\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`agenda_image_idx\` ON \`agenda\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`agenda_updated_at_idx\` ON \`agenda\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agenda_created_at_idx\` ON \`agenda\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`interviews\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`interviews_slug_idx\` ON \`interviews\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`interviews_author_idx\` ON \`interviews\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`interviews_image_idx\` ON \`interviews\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`interviews_updated_at_idx\` ON \`interviews\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`interviews_created_at_idx\` ON \`interviews\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`geschiedenis\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`geschiedenis_slug_idx\` ON \`geschiedenis\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_author_idx\` ON \`geschiedenis\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_image_idx\` ON \`geschiedenis\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_updated_at_idx\` ON \`geschiedenis\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`geschiedenis_created_at_idx\` ON \`geschiedenis\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`duivelse_kunst\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`duivelse_kunst_slug_idx\` ON \`duivelse_kunst\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`duivelse_kunst_author_idx\` ON \`duivelse_kunst\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`duivelse_kunst_image_idx\` ON \`duivelse_kunst\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`duivelse_kunst_updated_at_idx\` ON \`duivelse_kunst\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`duivelse_kunst_created_at_idx\` ON \`duivelse_kunst\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`vakmensen\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`vakmensen_slug_idx\` ON \`vakmensen\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`vakmensen_author_idx\` ON \`vakmensen\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`vakmensen_image_idx\` ON \`vakmensen\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`vakmensen_updated_at_idx\` ON \`vakmensen\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`vakmensen_created_at_idx\` ON \`vakmensen\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`praktische_info\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`content\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`praktische_info_slug_idx\` ON \`praktische_info\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`praktische_info_author_idx\` ON \`praktische_info\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`praktische_info_image_idx\` ON \`praktische_info\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`praktische_info_updated_at_idx\` ON \`praktische_info\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`praktische_info_created_at_idx\` ON \`praktische_info\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_instellingen_menu\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_instellingen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_instellingen_menu_order_idx\` ON \`site_instellingen_menu\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_instellingen_menu_parent_id_idx\` ON \`site_instellingen_menu\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_instellingen\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`site_naam\` text NOT NULL,
  	\`footer\` text,
  	\`contactgegevens_email\` text,
  	\`contactgegevens_telefoon\` text,
  	\`contactgegevens_adres\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`media\` ADD \`uploaded_by_id\` integer REFERENCES users(id);`)
  await db.run(sql`CREATE INDEX \`media_uploaded_by_idx\` ON \`media\` (\`uploaded_by_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`nieuws_id\` integer REFERENCES nieuws(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`agenda_id\` integer REFERENCES agenda(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`interviews_id\` integer REFERENCES interviews(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`geschiedenis_id\` integer REFERENCES geschiedenis(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`duivelse_kunst_id\` integer REFERENCES duivelse_kunst(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`vakmensen_id\` integer REFERENCES vakmensen(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`praktische_info_id\` integer REFERENCES praktische_info(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_nieuws_id_idx\` ON \`payload_locked_documents_rels\` (\`nieuws_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agenda_id_idx\` ON \`payload_locked_documents_rels\` (\`agenda_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_interviews_id_idx\` ON \`payload_locked_documents_rels\` (\`interviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_geschiedenis_id_idx\` ON \`payload_locked_documents_rels\` (\`geschiedenis_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_duivelse_kunst_id_idx\` ON \`payload_locked_documents_rels\` (\`duivelse_kunst_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_vakmensen_id_idx\` ON \`payload_locked_documents_rels\` (\`vakmensen_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_praktische_info_id_idx\` ON \`payload_locked_documents_rels\` (\`praktische_info_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`nieuws\`;`)
  await db.run(sql`DROP TABLE \`agenda\`;`)
  await db.run(sql`DROP TABLE \`interviews\`;`)
  await db.run(sql`DROP TABLE \`geschiedenis\`;`)
  await db.run(sql`DROP TABLE \`duivelse_kunst\`;`)
  await db.run(sql`DROP TABLE \`vakmensen\`;`)
  await db.run(sql`DROP TABLE \`praktische_info\`;`)
  await db.run(sql`DROP TABLE \`site_instellingen_menu\`;`)
  await db.run(sql`DROP TABLE \`site_instellingen\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media\`("id", "alt", "caption", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_card_url", "sizes_card_width", "sizes_card_height", "sizes_card_mime_type", "sizes_card_filesize", "sizes_card_filename") SELECT "id", "alt", "caption", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_card_url", "sizes_card_width", "sizes_card_height", "sizes_card_mime_type", "sizes_card_filesize", "sizes_card_filename" FROM \`media\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`hero_slides\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0 NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`hero_slides_image_idx\` ON \`hero_slides\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`hero_slides_author_idx\` ON \`hero_slides\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`hero_slides_updated_at_idx\` ON \`hero_slides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`hero_slides_created_at_idx\` ON \`hero_slides\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_filename\` text;`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`hero_slides_id\` integer REFERENCES hero_slides(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_hero_slides_id_idx\` ON \`payload_locked_documents_rels\` (\`hero_slides_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`hero_slides\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`nieuws_id\` integer,
  	\`agenda_id\` integer,
  	\`interviews_id\` integer,
  	\`geschiedenis_id\` integer,
  	\`duivelse_kunst_id\` integer,
  	\`vakmensen_id\` integer,
  	\`praktische_info_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`nieuws_id\`) REFERENCES \`nieuws\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agenda_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`interviews_id\`) REFERENCES \`interviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`geschiedenis_id\`) REFERENCES \`geschiedenis\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`duivelse_kunst_id\`) REFERENCES \`duivelse_kunst\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`vakmensen_id\`) REFERENCES \`vakmensen\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`praktische_info_id\`) REFERENCES \`praktische_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_nieuws_id_idx\` ON \`payload_locked_documents_rels\` (\`nieuws_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agenda_id_idx\` ON \`payload_locked_documents_rels\` (\`agenda_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_interviews_id_idx\` ON \`payload_locked_documents_rels\` (\`interviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_geschiedenis_id_idx\` ON \`payload_locked_documents_rels\` (\`geschiedenis_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_duivelse_kunst_id_idx\` ON \`payload_locked_documents_rels\` (\`duivelse_kunst_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_vakmensen_id_idx\` ON \`payload_locked_documents_rels\` (\`vakmensen_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_praktische_info_id_idx\` ON \`payload_locked_documents_rels\` (\`praktische_info_id\`);`)
  await db.run(sql`DROP INDEX \`media_sizes_hero_sizes_hero_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_filename\`;`)
}

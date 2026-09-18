import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`sessions\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`token\` text NOT NULL,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`user_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`sessions_token_idx\` ON \`sessions\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`sessions_user_idx\` ON \`sessions\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`sessions_updated_at_idx\` ON \`sessions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`sessions_created_at_idx\` ON \`sessions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`accounts\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`account_id\` text NOT NULL,
  	\`provider_id\` text NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`access_token\` text,
  	\`refresh_token\` text,
  	\`id_token\` text,
  	\`access_token_expires_at\` text,
  	\`refresh_token_expires_at\` text,
  	\`scope\` text,
  	\`password\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`accounts_user_idx\` ON \`accounts\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`accounts_updated_at_idx\` ON \`accounts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`accounts_created_at_idx\` ON \`accounts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`verifications\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`identifier\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`verifications_updated_at_idx\` ON \`verifications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`verifications_created_at_idx\` ON \`verifications\` (\`created_at\`);`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`name\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`email_verified\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`image\` text;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_token\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_expiration\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`salt\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`hash\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`login_attempts\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`lock_until\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`sessions_id\` integer REFERENCES sessions(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`accounts_id\` integer REFERENCES accounts(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`verifications_id\` integer REFERENCES verifications(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`sessions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accounts_id_idx\` ON \`payload_locked_documents_rels\` (\`accounts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_verifications_id_idx\` ON \`payload_locked_documents_rels\` (\`verifications_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`DROP TABLE \`sessions\`;`)
  await db.run(sql`DROP TABLE \`accounts\`;`)
  await db.run(sql`DROP TABLE \`verifications\`;`)
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
  	\`hero_slides_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`nieuws_id\`) REFERENCES \`nieuws\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agenda_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`interviews_id\`) REFERENCES \`interviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`geschiedenis_id\`) REFERENCES \`geschiedenis\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`duivelse_kunst_id\`) REFERENCES \`duivelse_kunst\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`vakmensen_id\`) REFERENCES \`vakmensen\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`praktische_info_id\`) REFERENCES \`praktische_info\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`hero_slides_id\`) REFERENCES \`hero_slides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id" FROM \`payload_locked_documents_rels\`;`)
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_hero_slides_id_idx\` ON \`payload_locked_documents_rels\` (\`hero_slides_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_token\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_expiration\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`salt\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`hash\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`login_attempts\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`lock_until\` text;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`name\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`email_verified\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`image\`;`)
}

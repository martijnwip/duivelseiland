import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`activiteiten\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`soort\` text DEFAULT 'eenmalig' NOT NULL,
  	\`voorlopige_datum\` text,
  	\`datum\` text,
  	\`image_id\` integer,
  	\`aanvrager_naam\` text,
  	\`aanvrager_email\` text,
  	\`locale\` text DEFAULT 'nl' NOT NULL,
  	\`fase\` text DEFAULT 'ingediend' NOT NULL,
  	\`afwijs_reden\` text,
  	\`slug\` text NOT NULL,
  	\`inschrijving\` text DEFAULT 'open' NOT NULL,
  	\`max_deelnemers\` numeric,
  	\`toon_aantal\` integer DEFAULT false,
  	\`melding_bij_inschrijving\` integer DEFAULT true,
  	\`eigenaar_id\` integer,
  	\`agenda_item_id\` integer,
  	\`token\` text,
  	\`laatste_mail_op\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`eigenaar_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`agenda_item_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`activiteiten_image_idx\` ON \`activiteiten\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_fase_idx\` ON \`activiteiten\` (\`fase\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteiten_slug_idx\` ON \`activiteiten\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_eigenaar_idx\` ON \`activiteiten\` (\`eigenaar_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_agenda_item_idx\` ON \`activiteiten\` (\`agenda_item_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_token_idx\` ON \`activiteiten\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_updated_at_idx\` ON \`activiteiten\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_created_at_idx\` ON \`activiteiten\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`activiteiten_locales\` (
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`soort_toelichting\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`activiteiten\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteiten_locales_locale_parent_id_unique\` ON \`activiteiten_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`activiteit_inschrijvingen\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`activiteit_id\` integer NOT NULL,
  	\`voornaam\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`opmerking\` text,
  	\`status\` text DEFAULT 'pending' NOT NULL,
  	\`locale\` text DEFAULT 'nl' NOT NULL,
  	\`token\` text NOT NULL,
  	\`bevestigd_op\` text,
  	\`afgemeld_op\` text,
  	\`laatste_mail_op\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`activiteit_id\`) REFERENCES \`activiteiten\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`activiteit_inschrijvingen_activiteit_idx\` ON \`activiteit_inschrijvingen\` (\`activiteit_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_inschrijvingen_email_idx\` ON \`activiteit_inschrijvingen\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_inschrijvingen_status_idx\` ON \`activiteit_inschrijvingen\` (\`status\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteit_inschrijvingen_token_idx\` ON \`activiteit_inschrijvingen\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_inschrijvingen_updated_at_idx\` ON \`activiteit_inschrijvingen\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_inschrijvingen_created_at_idx\` ON \`activiteit_inschrijvingen\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteit_email_idx\` ON \`activiteit_inschrijvingen\` (\`activiteit_id\`,\`email\`);`)
  await db.run(sql`CREATE TABLE \`activiteit_berichten\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`activiteit_id\` integer NOT NULL,
  	\`onderwerp\` text NOT NULL,
  	\`tekst\` text NOT NULL,
  	\`afzender_id\` integer,
  	\`verzonden_op\` text,
  	\`aantal_ontvangers\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`activiteit_id\`) REFERENCES \`activiteiten\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`afzender_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`activiteit_berichten_activiteit_idx\` ON \`activiteit_berichten\` (\`activiteit_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_berichten_afzender_idx\` ON \`activiteit_berichten\` (\`afzender_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_berichten_updated_at_idx\` ON \`activiteit_berichten\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activiteit_berichten_created_at_idx\` ON \`activiteit_berichten\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`agenda\` ADD \`activiteit_id\` integer REFERENCES activiteiten(id);`)
  await db.run(sql`CREATE INDEX \`agenda_activiteit_idx\` ON \`agenda\` (\`activiteit_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`activiteiten_id\` integer REFERENCES activiteiten(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`activiteit_inschrijvingen_id\` integer REFERENCES activiteit_inschrijvingen(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`activiteit_berichten_id\` integer REFERENCES activiteit_berichten(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteiten_id_idx\` ON \`payload_locked_documents_rels\` (\`activiteiten_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteit_inschrijvingen__idx\` ON \`payload_locked_documents_rels\` (\`activiteit_inschrijvingen_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteit_berichten_id_idx\` ON \`payload_locked_documents_rels\` (\`activiteit_berichten_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`activiteiten\`;`)
  await db.run(sql`DROP TABLE \`activiteiten_locales\`;`)
  await db.run(sql`DROP TABLE \`activiteit_inschrijvingen\`;`)
  await db.run(sql`DROP TABLE \`activiteit_berichten\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_agenda\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`author_id\` integer,
  	\`date\` text,
  	\`image_id\` integer,
  	\`recurrence\` text DEFAULT 'none',
  	\`recurrence_time\` text,
  	\`whatsapp_number\` text,
  	\`cta_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_agenda\`("id", "generate_slug", "slug", "status", "author_id", "date", "image_id", "recurrence", "recurrence_time", "whatsapp_number", "cta_url", "updated_at", "created_at") SELECT "id", "generate_slug", "slug", "status", "author_id", "date", "image_id", "recurrence", "recurrence_time", "whatsapp_number", "cta_url", "updated_at", "created_at" FROM \`agenda\`;`)
  await db.run(sql`DROP TABLE \`agenda\`;`)
  await db.run(sql`ALTER TABLE \`__new_agenda\` RENAME TO \`agenda\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`agenda_slug_idx\` ON \`agenda\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`agenda_author_idx\` ON \`agenda\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`agenda_image_idx\` ON \`agenda\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`agenda_updated_at_idx\` ON \`agenda\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agenda_created_at_idx\` ON \`agenda\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`invite_links_id\` integer,
  	\`media_id\` integer,
  	\`nieuws_id\` integer,
  	\`agenda_id\` integer,
  	\`interviews_id\` integer,
  	\`geschiedenis_id\` integer,
  	\`duivelse_kunst_id\` integer,
  	\`vakmensen_id\` integer,
  	\`praktische_info_id\` integer,
  	\`hero_slides_id\` integer,
  	\`historische_fotos_id\` integer,
  	\`slideshows_id\` integer,
  	\`idee_likes_id\` integer,
  	\`nieuwsbrief_abonnees_id\` integer,
  	\`sessions_id\` integer,
  	\`accounts_id\` integer,
  	\`verifications_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`invite_links_id\`) REFERENCES \`invite_links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`nieuws_id\`) REFERENCES \`nieuws\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agenda_id\`) REFERENCES \`agenda\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`interviews_id\`) REFERENCES \`interviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`geschiedenis_id\`) REFERENCES \`geschiedenis\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`duivelse_kunst_id\`) REFERENCES \`duivelse_kunst\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`vakmensen_id\`) REFERENCES \`vakmensen\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`praktische_info_id\`) REFERENCES \`praktische_info\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`hero_slides_id\`) REFERENCES \`hero_slides\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`historische_fotos_id\`) REFERENCES \`historische_fotos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`slideshows_id\`) REFERENCES \`slideshows\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`idee_likes_id\`) REFERENCES \`idee_likes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`nieuwsbrief_abonnees_id\`) REFERENCES \`nieuwsbrief_abonnees\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`sessions_id\`) REFERENCES \`sessions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accounts_id\`) REFERENCES \`accounts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`verifications_id\`) REFERENCES \`verifications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "invite_links_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id", "historische_fotos_id", "slideshows_id", "idee_likes_id", "nieuwsbrief_abonnees_id", "sessions_id", "accounts_id", "verifications_id") SELECT "id", "order", "parent_id", "path", "users_id", "invite_links_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id", "historische_fotos_id", "slideshows_id", "idee_likes_id", "nieuwsbrief_abonnees_id", "sessions_id", "accounts_id", "verifications_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_invite_links_id_idx\` ON \`payload_locked_documents_rels\` (\`invite_links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_nieuws_id_idx\` ON \`payload_locked_documents_rels\` (\`nieuws_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agenda_id_idx\` ON \`payload_locked_documents_rels\` (\`agenda_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_interviews_id_idx\` ON \`payload_locked_documents_rels\` (\`interviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_geschiedenis_id_idx\` ON \`payload_locked_documents_rels\` (\`geschiedenis_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_duivelse_kunst_id_idx\` ON \`payload_locked_documents_rels\` (\`duivelse_kunst_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_vakmensen_id_idx\` ON \`payload_locked_documents_rels\` (\`vakmensen_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_praktische_info_id_idx\` ON \`payload_locked_documents_rels\` (\`praktische_info_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_hero_slides_id_idx\` ON \`payload_locked_documents_rels\` (\`hero_slides_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_historische_fotos_id_idx\` ON \`payload_locked_documents_rels\` (\`historische_fotos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_slideshows_id_idx\` ON \`payload_locked_documents_rels\` (\`slideshows_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_idee_likes_id_idx\` ON \`payload_locked_documents_rels\` (\`idee_likes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_nieuwsbrief_abonnees_id_idx\` ON \`payload_locked_documents_rels\` (\`nieuwsbrief_abonnees_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`sessions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accounts_id_idx\` ON \`payload_locked_documents_rels\` (\`accounts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_verifications_id_idx\` ON \`payload_locked_documents_rels\` (\`verifications_id\`);`)
}

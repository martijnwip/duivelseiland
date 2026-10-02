import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { vulAdresboek } from '../lib/adresboek'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`email_adressen\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`email\` text NOT NULL,
  	\`bevestigd\` integer DEFAULT false,
  	\`bevestigd_op\` text,
  	\`lijsten\` text,
  	\`notitie\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`email_adressen_email_idx\` ON \`email_adressen\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`email_adressen_bevestigd_idx\` ON \`email_adressen\` (\`bevestigd\`);`)
  await db.run(sql`CREATE INDEX \`email_adressen_updated_at_idx\` ON \`email_adressen\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`email_adressen_created_at_idx\` ON \`email_adressen\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`email_adressen_id\` integer REFERENCES email_adressen(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_email_adressen_id_idx\` ON \`payload_locked_documents_rels\` (\`email_adressen_id\`);`)

  // Alle bestaande adressen (nieuwsbrief, aanmeldingen, aanvragers, gebruikers) in het adresboek zetten.
  const aantal = await vulAdresboek(payload, req)
  payload.logger.info(`[adresboek] ${aantal} adressen toegevoegd`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`email_adressen\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
  	\`activiteiten_id\` integer,
  	\`activiteit_inschrijvingen_id\` integer,
  	\`activiteit_berichten_id\` integer,
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
  	FOREIGN KEY (\`activiteiten_id\`) REFERENCES \`activiteiten\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`activiteit_inschrijvingen_id\`) REFERENCES \`activiteit_inschrijvingen\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`activiteit_berichten_id\`) REFERENCES \`activiteit_berichten\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`sessions_id\`) REFERENCES \`sessions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`accounts_id\`) REFERENCES \`accounts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`verifications_id\`) REFERENCES \`verifications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "invite_links_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id", "historische_fotos_id", "slideshows_id", "idee_likes_id", "nieuwsbrief_abonnees_id", "activiteiten_id", "activiteit_inschrijvingen_id", "activiteit_berichten_id", "sessions_id", "accounts_id", "verifications_id") SELECT "id", "order", "parent_id", "path", "users_id", "invite_links_id", "media_id", "nieuws_id", "agenda_id", "interviews_id", "geschiedenis_id", "duivelse_kunst_id", "vakmensen_id", "praktische_info_id", "hero_slides_id", "historische_fotos_id", "slideshows_id", "idee_likes_id", "nieuwsbrief_abonnees_id", "activiteiten_id", "activiteit_inschrijvingen_id", "activiteit_berichten_id", "sessions_id", "accounts_id", "verifications_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteiten_id_idx\` ON \`payload_locked_documents_rels\` (\`activiteiten_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteit_inschrijvingen__idx\` ON \`payload_locked_documents_rels\` (\`activiteit_inschrijvingen_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activiteit_berichten_id_idx\` ON \`payload_locked_documents_rels\` (\`activiteit_berichten_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`sessions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_accounts_id_idx\` ON \`payload_locked_documents_rels\` (\`accounts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_verifications_id_idx\` ON \`payload_locked_documents_rels\` (\`verifications_id\`);`)
}

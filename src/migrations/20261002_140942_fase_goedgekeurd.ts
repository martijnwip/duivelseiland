import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_activiteiten\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`soort\` text DEFAULT 'eenmalig' NOT NULL,
  	\`voorlopige_datum\` text,
  	\`datum\` text,
  	\`image_id\` integer,
  	\`locale\` text DEFAULT 'nl' NOT NULL,
  	\`fase\` text DEFAULT 'ingediend' NOT NULL,
  	\`afwijs_reden\` text,
  	\`slug\` text NOT NULL,
  	\`inschrijving\` text DEFAULT 'open',
  	\`max_deelnemers\` numeric,
  	\`toon_aantal\` integer DEFAULT false,
  	\`melding_bij_inschrijving\` integer DEFAULT true,
  	\`aanvrager_naam\` text,
  	\`aanvrager_email\` text,
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
  await db.run(sql`INSERT INTO \`__new_activiteiten\`("id", "soort", "voorlopige_datum", "datum", "image_id", "locale", "fase", "afwijs_reden", "slug", "inschrijving", "max_deelnemers", "toon_aantal", "melding_bij_inschrijving", "aanvrager_naam", "aanvrager_email", "eigenaar_id", "agenda_item_id", "token", "laatste_mail_op", "updated_at", "created_at") SELECT "id", "soort", "voorlopige_datum", "datum", "image_id", "locale", "fase", "afwijs_reden", "slug", "inschrijving", "max_deelnemers", "toon_aantal", "melding_bij_inschrijving", "aanvrager_naam", "aanvrager_email", "eigenaar_id", "agenda_item_id", "token", "laatste_mail_op", "updated_at", "created_at" FROM \`activiteiten\`;`)
  await db.run(sql`DROP TABLE \`activiteiten\`;`)
  await db.run(sql`ALTER TABLE \`__new_activiteiten\` RENAME TO \`activiteiten\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`activiteiten_image_idx\` ON \`activiteiten\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_fase_idx\` ON \`activiteiten\` (\`fase\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteiten_slug_idx\` ON \`activiteiten\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_eigenaar_idx\` ON \`activiteiten\` (\`eigenaar_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_agenda_item_idx\` ON \`activiteiten\` (\`agenda_item_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_token_idx\` ON \`activiteiten\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_updated_at_idx\` ON \`activiteiten\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_created_at_idx\` ON \`activiteiten\` (\`created_at\`);`)
  // Fase "werving" heet voortaan "goedgekeurd" (= online en open voor aanmelding).
  await db.run(sql`UPDATE \`activiteiten\` SET \`fase\` = 'goedgekeurd' WHERE \`fase\` = 'werving';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`activiteiten\` SET \`fase\` = 'werving' WHERE \`fase\` = 'goedgekeurd';`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_activiteiten\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`soort\` text DEFAULT 'eenmalig' NOT NULL,
  	\`voorlopige_datum\` text,
  	\`datum\` text,
  	\`image_id\` integer,
  	\`locale\` text DEFAULT 'nl' NOT NULL,
  	\`fase\` text DEFAULT 'ingediend' NOT NULL,
  	\`afwijs_reden\` text,
  	\`slug\` text NOT NULL,
  	\`inschrijving\` text DEFAULT 'open' NOT NULL,
  	\`max_deelnemers\` numeric,
  	\`toon_aantal\` integer DEFAULT false,
  	\`melding_bij_inschrijving\` integer DEFAULT true,
  	\`aanvrager_naam\` text,
  	\`aanvrager_email\` text,
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
  await db.run(sql`INSERT INTO \`__new_activiteiten\`("id", "soort", "voorlopige_datum", "datum", "image_id", "locale", "fase", "afwijs_reden", "slug", "inschrijving", "max_deelnemers", "toon_aantal", "melding_bij_inschrijving", "aanvrager_naam", "aanvrager_email", "eigenaar_id", "agenda_item_id", "token", "laatste_mail_op", "updated_at", "created_at") SELECT "id", "soort", "voorlopige_datum", "datum", "image_id", "locale", "fase", "afwijs_reden", "slug", "inschrijving", "max_deelnemers", "toon_aantal", "melding_bij_inschrijving", "aanvrager_naam", "aanvrager_email", "eigenaar_id", "agenda_item_id", "token", "laatste_mail_op", "updated_at", "created_at" FROM \`activiteiten\`;`)
  await db.run(sql`DROP TABLE \`activiteiten\`;`)
  await db.run(sql`ALTER TABLE \`__new_activiteiten\` RENAME TO \`activiteiten\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`activiteiten_image_idx\` ON \`activiteiten\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_fase_idx\` ON \`activiteiten\` (\`fase\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`activiteiten_slug_idx\` ON \`activiteiten\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_eigenaar_idx\` ON \`activiteiten\` (\`eigenaar_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_agenda_item_idx\` ON \`activiteiten\` (\`agenda_item_id\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_token_idx\` ON \`activiteiten\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_updated_at_idx\` ON \`activiteiten\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activiteiten_created_at_idx\` ON \`activiteiten\` (\`created_at\`);`)
}

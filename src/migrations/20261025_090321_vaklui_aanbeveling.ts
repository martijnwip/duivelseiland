import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`vaklui_locales\` (
  	\`aanbeveling\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vaklui\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`vaklui_locales_locale_parent_id_unique\` ON \`vaklui_locales\` (\`_locale\`,\`_parent_id\`);`)
  // De toelichting van de aanmelder wordt de aanbeveling, in de standaardtaal (daarop valt Engels terug).
  await db.run(sql`INSERT INTO \`vaklui_locales\` (\`aanbeveling\`, \`_locale\`, \`_parent_id\`)
    SELECT \`aanmelder_toelichting\`, 'nl', \`id\` FROM \`vaklui\`
    WHERE \`aanmelder_toelichting\` IS NOT NULL AND TRIM(\`aanmelder_toelichting\`) <> '';`)
  await db.run(sql`ALTER TABLE \`vaklui\` DROP COLUMN \`aanmelder_toelichting\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vaklui\` ADD \`aanmelder_toelichting\` text;`)
  await db.run(sql`UPDATE \`vaklui\` SET \`aanmelder_toelichting\` = (
    SELECT \`aanbeveling\` FROM \`vaklui_locales\` WHERE \`_parent_id\` = \`vaklui\`.\`id\` AND \`_locale\` = 'nl'
  );`)
  await db.run(sql`DROP TABLE \`vaklui_locales\`;`)
}

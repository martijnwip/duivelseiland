import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite';
import { isLexicalJson, plainTextToLexical, readRows } from './20260921_132141_footer_richtext';

// De vorige migratie (footer_richtext) draaide goed, maar in productie werd de
// Nederlandse footer daarna teruggezet naar platte tekst: de global is opgeslagen
// met een formulier dat vóór de migratie was geladen. Dit zet alle rijen die nog
// geen richText zijn alsnog om; rijen die al Lexical-JSON zijn blijven ongemoeid.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { id, footer } of await readRows(db)) {
    if (isLexicalJson(footer)) continue;
    await db.run(sql`UPDATE \`site_instellingen_locales\` SET footer = ${plainTextToLexical(footer)} WHERE id = ${id}`);
  }
}

// Bewust leeg: er is niets te herstellen (de vorige migratie draait zelf terug).
export async function down(_args: MigrateDownArgs): Promise<void> {}

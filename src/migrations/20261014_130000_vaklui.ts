import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Collection `vakmensen` heet voortaan `vaklui`. Met de hand geschreven: drizzle zou de tabellen weggooien en
// opnieuw aanmaken (dan is de data weg). SQLite past bij RENAME de verwijzingen in andere tabellen zelf aan;
// indexen hebben geen RENAME en worden opnieuw aangemaakt onder de nieuwe naam.

const INDEXEN = [
  ['author_idx', 'vaklui', 'author_id'],
  ['updated_at_idx', 'vaklui', 'updated_at'],
  ['created_at_idx', 'vaklui', 'created_at'],
  ['moderatie_idx', 'vaklui', 'moderatie'],
  ['token_idx', 'vaklui', 'token'],
  ['rels_order_idx', 'vaklui_rels', 'order'],
  ['rels_parent_idx', 'vaklui_rels', 'parent_id'],
  ['rels_path_idx', 'vaklui_rels', 'path'],
  ['rels_vakken_id_idx', 'vaklui_rels', 'vakken_id'],
] as const

async function hernoem(db: MigrateUpArgs['db'], van: string, naar: string) {
  await db.run(sql.raw(`ALTER TABLE \`${van}\` RENAME TO \`${naar}\`;`))
  await db.run(sql.raw(`ALTER TABLE \`${van}_rels\` RENAME TO \`${naar}_rels\`;`))
  await db.run(sql.raw(`ALTER TABLE \`payload_locked_documents_rels\` RENAME COLUMN \`${van}_id\` TO \`${naar}_id\`;`))

  for (const [naam, tabel, kolom] of INDEXEN) {
    const t = tabel.replace('vaklui', naar)
    await db.run(sql.raw(`DROP INDEX IF EXISTS \`${van}_${naam}\`;`))
    await db.run(sql.raw(`CREATE INDEX \`${naar}_${naam}\` ON \`${t}\` (\`${kolom}\`);`))
  }
  await db.run(sql.raw(`DROP INDEX IF EXISTS \`payload_locked_documents_rels_${van}_id_idx\`;`))
  await db.run(
    sql.raw(`CREATE INDEX \`payload_locked_documents_rels_${naar}_id_idx\` ON \`payload_locked_documents_rels\` (\`${naar}_id\`);`),
  )

  // Menu-items in Site-instellingen en de kolominstellingen in /admin wijzen naar de oude naam.
  await db.run(sql.raw(`UPDATE \`site_instellingen_menu\` SET \`url\` = replace(\`url\`, '/${van}', '/${naar}') WHERE \`url\` LIKE '%/${van}%';`))
  await db.run(sql.raw(`UPDATE \`payload_preferences\` SET \`key\` = replace(\`key\`, '${van}', '${naar}') WHERE \`key\` LIKE '%${van}%';`))
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await hernoem(db, 'vakmensen', 'vaklui')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await hernoem(db, 'vaklui', 'vakmensen')
}

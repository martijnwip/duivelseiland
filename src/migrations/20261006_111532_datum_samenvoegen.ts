import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { amsterdamMiddernacht } from '../lib/activiteiten/datum'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Eén datumveld: een voorlopige datum wordt de datum als er nog geen datum was (middernacht in Amsterdam, zonder tijd).
  const rijen = await db.all<{ id: number; voorlopige_datum: string }>(
    sql`SELECT \`id\`, \`voorlopige_datum\` FROM \`activiteiten\` WHERE \`datum\` IS NULL AND \`voorlopige_datum\` IS NOT NULL;`,
  )
  for (const { id, voorlopige_datum } of rijen) {
    const datum = amsterdamMiddernacht(voorlopige_datum.slice(0, 10))
    if (datum) await db.run(sql`UPDATE \`activiteiten\` SET \`datum\` = ${datum} WHERE \`id\` = ${id};`)
  }
  await db.run(sql`ALTER TABLE \`activiteiten\` DROP COLUMN \`voorlopige_datum\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`activiteiten\` ADD \`voorlopige_datum\` text;`)
}

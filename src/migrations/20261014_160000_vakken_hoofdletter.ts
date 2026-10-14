import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { metHoofdletter } from '../lib/vaklui/vaknaam'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Bestaande vaknamen met een hoofdletter (bv. "glazenwasser"); nieuwe krijgen die vanzelf (hook in Vakken.ts).
  const rijen = await db.all<{ id: number; naam: string }>(sql`SELECT \`id\`, \`naam\` FROM \`vakken_locales\`;`)
  for (const { id, naam } of rijen) {
    const nieuw = metHoofdletter(naam)
    if (nieuw !== naam) await db.run(sql`UPDATE \`vakken_locales\` SET \`naam\` = ${nieuw} WHERE \`id\` = ${id};`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Niet terug te draaien: de oorspronkelijke schrijfwijze is niet bewaard.
}

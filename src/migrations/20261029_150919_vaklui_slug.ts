import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { slugify } from '../lib/slug'
import { GERESERVEERDE_SLUGS } from '../lib/vaklui/constants'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`vaklui\` ADD \`slug\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`vaklui_slug_idx\` ON \`vaklui\` (\`slug\`);`)
  // Bestaande vaklui krijgen een slug uit hun naam. Rechtstreeks in SQL, zodat de hooks (mails, adresboek) niet draaien.
  const rijen = await db.all<{ id: number; naam: string }>(sql`SELECT \`id\`, \`naam\` FROM \`vaklui\` ORDER BY \`id\`;`)
  const bezet = new Set<string>(GERESERVEERDE_SLUGS)
  for (const { id, naam } of rijen) {
    const basis = slugify(naam ?? '') || 'vakman'
    let slug = basis
    for (let i = 2; bezet.has(slug); i++) slug = `${basis}-${i}`
    bezet.add(slug)
    await db.run(sql`UPDATE \`vaklui\` SET \`slug\` = ${slug} WHERE \`id\` = ${id};`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`vaklui_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`vaklui\` DROP COLUMN \`slug\`;`)
}

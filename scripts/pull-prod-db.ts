// Kopieert de volledige productie-database (Turso) naar een lokaal SQLite-bestand.
// Gebruikt TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (uit .env.local). Het bestaande
// doelbestand wordt eerst hernoemd naar <doel>.bak-<tijdstip>. Stop `bun dev` vóór het draaien.
//
//   bun run db:pull            # naar dev.db
//   bun run db:pull andere.db  # naar een ander bestand
import { createClient, type InValue } from '@libsql/client';
import { existsSync, renameSync } from 'fs';

const target = process.argv[2] ?? 'dev.db';
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url?.startsWith('libsql://') || !authToken) {
  console.error('[db:pull] TURSO_DATABASE_URL (libsql://…) en TURSO_AUTH_TOKEN zijn nodig.');
  process.exit(1);
}

const tmp = `${target}.pulling`;
for (const f of [tmp, `${tmp}-wal`, `${tmp}-shm`]) if (existsSync(f)) renameSync(f, `${f}.old`);

const remote = createClient({ url, authToken, intMode: 'bigint' });
const local = createClient({ url: `file:${tmp}`, intMode: 'bigint' });

async function run() {
  const schema = await remote.execute(
    `SELECT type, name, sql FROM sqlite_master
     WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%' AND name NOT LIKE '_cf_%'`,
  );
  const objects = schema.rows.map((r) => ({ type: String(r.type), name: String(r.name), sql: String(r.sql) }));
  const tables = objects.filter((o) => o.type === 'table');

  await local.execute('PRAGMA foreign_keys = OFF');
  for (const t of tables) await local.execute(t.sql);

  for (const t of tables) {
    const rows = await remote.execute(`SELECT * FROM "${t.name}"`);
    if (rows.rows.length === 0) continue;
    const cols = rows.columns.map((c) => `"${c}"`).join(', ');
    const params = rows.columns.map(() => '?').join(', ');
    const stmts = rows.rows.map((row) => ({
      sql: `INSERT INTO "${t.name}" (${cols}) VALUES (${params})`,
      args: rows.columns.map((_, i) => row[i] as InValue),
    }));
    for (let i = 0; i < stmts.length; i += 500) await local.batch(stmts.slice(i, i + 500), 'write');
    console.log(`[db:pull] ${t.name}: ${rows.rows.length} rijen`);
  }

  // AUTOINCREMENT-tellers meenemen, zodat nieuwe lokale id's niet botsen.
  const seq = await remote.execute(`SELECT name, seq FROM sqlite_sequence`).catch(() => null);
  if (seq?.rows.length) {
    await local.execute('DELETE FROM sqlite_sequence');
    await local.batch(
      seq.rows.map((r) => ({ sql: 'INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)', args: [r.name, r.seq] })),
      'write',
    );
  }

  for (const o of objects.filter((o) => o.type !== 'table')) await local.execute(o.sql);

  const check = await local.execute('PRAGMA integrity_check');
  if (String(check.rows[0]?.[0]) !== 'ok') throw new Error(`integrity_check: ${String(check.rows[0]?.[0])}`);

  local.close();
  remote.close();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  for (const suffix of ['', '-wal', '-shm']) {
    if (existsSync(target + suffix)) renameSync(target + suffix, `${target}.bak-${stamp}${suffix}`);
  }
  renameSync(tmp, target);
  console.log(`[db:pull] klaar: ${target} (vorige versie: ${target}.bak-${stamp})`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[db:pull] MISLUKT:', err);
  process.exit(1);
});

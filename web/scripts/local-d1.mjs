// Development/test adapter only. Production uses the Sites D1 binding.
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
export async function openLocalDatabase(path) {
  const sqlite = new DatabaseSync(path);
  sqlite.exec('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS __local_migrations(name TEXT PRIMARY KEY)');
  const journal = JSON.parse(await readFile(new URL('../drizzle/meta/_journal.json', import.meta.url), 'utf8'));
  for (const entry of journal.entries) {
    if (sqlite.prepare('SELECT name FROM __local_migrations WHERE name=?').get(entry.tag)) continue;
    const sql = await readFile(fileURLToPath(new URL(`../drizzle/${entry.tag}.sql`, import.meta.url)), 'utf8');
    sqlite.exec('BEGIN');
    try { sqlite.exec(sql); sqlite.prepare('INSERT INTO __local_migrations VALUES(?)').run(entry.tag); sqlite.exec('COMMIT'); }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  }
  class Statement {
    constructor(sql, values = []) { this.sql = sql; this.values = values; }
    bind(...values) { return new Statement(this.sql, values); }
    async first() { return sqlite.prepare(this.sql).get(...this.values) || null; }
    async run() { const meta = sqlite.prepare(this.sql).run(...this.values); return { meta: { changes: Number(meta.changes) } }; }
  }
  return {
    prepare: sql => new Statement(sql),
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = statements.map(s => ({ meta: { changes: Number(sqlite.prepare(s.sql).run(...s.values).changes) } })); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
    close: () => sqlite.close(),
  };
}

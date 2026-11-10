import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { config } from './config.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

// Applique les fichiers migrations/*.sql dans l'ordre, une seule fois chacun.
export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(424242)');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const done = new Set(rows.map((r) => r.name));
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await fs.readFile(path.join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[migrate] appliquée : ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    await seedAdmin(client);
  } finally {
    await client.query('SELECT pg_advisory_unlock(424242)').catch(() => {});
    client.release();
  }
}

// Crée le compte administrateur initial s'il n'existe pas encore.
async function seedAdmin(client) {
  const { email, password, name } = config.admin;
  if (!email || !password) return;
  const hash = await bcrypt.hash(password, 12);
  const res = await client.query(
    `INSERT INTO users (email, password_hash, full_name, role) VALUES (lower($1), $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [email, hash, name],
  );
  if (res.rowCount) console.log(`[migrate] administrateur créé : ${email}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(() => pool.end()).catch((err) => { console.error(err); process.exit(1); });
}

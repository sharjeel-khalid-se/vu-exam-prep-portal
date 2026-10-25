import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const codes = ['CS201', 'CS304P', 'CS403P', 'CS301'];
const slugs = ['cs201', 'cs304p', 'cs403p', 'cs301'];

// 1. Delete from local DB
const localDbPath = path.join(process.cwd(), 'data', 'exam.db');
if (fs.existsSync(localDbPath)) {
  const localDb = new Database(localDbPath);
  console.log('Deleting from local SQLite database...');
  for (const slug of slugs) {
    const sub = localDb.prepare('SELECT id FROM subjects WHERE slug = ?').get(slug);
    if (sub) {
      localDb.prepare('DELETE FROM questions WHERE lecture_id IN (SELECT id FROM lectures WHERE subject_id = ?)').run(sub.id);
      localDb.prepare('DELETE FROM lectures WHERE subject_id = ?').run(sub.id);
      localDb.prepare('DELETE FROM subjects WHERE id = ?').run(sub.id);
      console.log(`  Removed local: ${slug}`);
    }
  }
}

// 2. Delete from Turso Cloud DB
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  console.log('Deleting from Turso cloud database...');
  for (const slug of slugs) {
    const subRes = await turso.execute({
      sql: 'SELECT id FROM subjects WHERE slug = ?',
      args: [slug]
    });
    if (subRes.rows.length > 0) {
      const subId = subRes.rows[0].id;
      await turso.execute({
        sql: 'DELETE FROM questions WHERE lecture_id IN (SELECT id FROM lectures WHERE subject_id = ?)',
        args: [subId]
      });
      await turso.execute({
        sql: 'DELETE FROM lectures WHERE subject_id = ?',
        args: [subId]
      });
      await turso.execute({
        sql: 'DELETE FROM subjects WHERE id = ?',
        args: [subId]
      });
      console.log(`  Removed Turso: ${slug}`);
    }
  }

  const remaining = await turso.execute('SELECT code, name FROM subjects ORDER BY code');
  console.log('\nRemaining Turso Courses (' + remaining.rows.length + '):');
  for (const r of remaining.rows) {
    console.log(` - ${r.code}: ${r.name}`);
  }
}

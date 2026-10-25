import { createClient } from '@libsql/client';
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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function main() {
  const subs = await client.execute('SELECT code, name, slug FROM subjects ORDER BY code');
  console.log('Turso subjects found:', subs.rows.length);
  for (const s of subs.rows) {
    console.log(` - ${s.code}: ${s.name} (${s.slug})`);
  }

  const mgtLectures = await client.execute({
    sql: 'SELECT id, number, title FROM lectures WHERE subject_id = (SELECT id FROM subjects WHERE slug = ?) ORDER BY number',
    args: ['mgt501']
  });
  console.log('MGT501 lectures in Turso:', mgtLectures.rows.length);
  for (const l of mgtLectures.rows) {
    console.log(`   Lecture ${l.number}: ${l.title}`);
  }
}

main().catch(console.error);

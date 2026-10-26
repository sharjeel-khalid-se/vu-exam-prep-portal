import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const envPath = fs.existsSync(path.join(process.cwd(), '.env.local'))
  ? path.join(process.cwd(), '.env.local')
  : path.join(process.cwd(), 'exam-portal', '.env.local');

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

async function run() {
  const r = await client.execute({
    sql: `SELECT q.id, q.type, q.marks, substr(q.stem, 1, 55) as preview 
          FROM questions q 
          JOIN lectures l ON q.lecture_id = l.id 
          JOIN subjects s ON l.subject_id = s.id 
          WHERE s.slug = ? AND l.number = ?`,
    args: ['sta301', 10]
  });

  console.log(`Live Turso STA301 Lecture 10 question count: ${r.rows.length}`);
  console.log('Question breakdown:');
  const mcqs = r.rows.filter(q => q.type === 'mcq').length;
  const shorts = r.rows.filter(q => q.type === 'short').length;
  const longs = r.rows.filter(q => q.type === 'long').length;
  console.log(`  - MCQs (1m): ${mcqs}`);
  console.log(`  - Short Questions (3m): ${shorts}`);
  console.log(`  - Long Questions (5m): ${longs}`);
  console.log('\nSample items:');
  r.rows.slice(0, 5).forEach(row => console.log(`  [${row.type}] (${row.marks}m) ${row.preview}...`));
}

run();

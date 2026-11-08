import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Read env variables manually from .env.local if not in process.env
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

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const localDbPath = path.join(process.cwd(), 'data', 'exam.db');
if (!fs.existsSync(localDbPath)) {
  console.error('Local database not found at:', localDbPath);
  process.exit(1);
}

const localDb = new Database(localDbPath);
const turso = createClient({ url, authToken });

async function withRetry(fn, desc, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`\nFailed permanently on ${desc}:`, err.message || err);
        throw err;
      }
      const backoff = attempt * 1500;
      console.warn(`\n  Warning: ${desc} failed (attempt ${attempt}/${maxRetries}): ${err.message || 'Error'}. Retrying in ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

async function sync() {
  console.log('Connecting to Turso at:', url);

  // 1. Create tables
  await withRetry(async () => {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL,
        description TEXT
      );
    `);
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS lectures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL REFERENCES subjects(id),
        number INTEGER NOT NULL,
        title TEXT NOT NULL
      );
    `);
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lecture_id INTEGER NOT NULL REFERENCES lectures(id),
        type TEXT NOT NULL CHECK(type IN ('mcq','short','long','code','math')),
        stem TEXT NOT NULL,
        options TEXT,
        correct TEXT,
        explanation TEXT,
        urdu_answer TEXT,
        image_url TEXT,
        marks INTEGER DEFAULT 1,
        time_minutes INTEGER DEFAULT 1,
        question_category TEXT DEFAULT 'lecture'
      );
    `);
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        question_id INTEGER NOT NULL REFERENCES questions(id),
        answered TEXT,
        is_correct INTEGER,
        attempted_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }, 'Initialize tables');

  console.log('Tables initialized in Turso.');

  // 2. Fetch local rows
  const subjects = localDb.prepare('SELECT * FROM subjects ORDER BY id').all();
  const lectures = localDb.prepare('SELECT * FROM lectures ORDER BY id').all();
  const questions = localDb.prepare('SELECT * FROM questions ORDER BY id').all();

  console.log(`Local DB Stats: ${subjects.length} subjects, ${lectures.length} lectures, ${questions.length} questions.`);

  // 3. Sync subjects in a batch
  console.log('Syncing subjects...');
  const subjectStatements = subjects.map(s => ({
    sql: `INSERT INTO subjects (id, name, slug, code, description) 
          VALUES (?, ?, ?, ?, ?) 
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, slug=excluded.slug, code=excluded.code, description=excluded.description`,
    args: [s.id, s.name, s.slug, s.code, s.description]
  }));
  await withRetry(() => turso.batch(subjectStatements, 'write'), 'Sync subjects');

  // 4. Sync lectures in batches
  console.log('Syncing lectures...');
  const lecBatchSize = 40;
  for (let i = 0; i < lectures.length; i += lecBatchSize) {
    const chunk = lectures.slice(i, i + lecBatchSize);
    const statements = chunk.map(l => ({
      sql: `INSERT INTO lectures (id, subject_id, number, title) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET subject_id=excluded.subject_id, number=excluded.number, title=excluded.title`,
      args: [l.id, l.subject_id, l.number, l.title]
    }));
    await withRetry(() => turso.batch(statements, 'write'), `Sync lectures chunk ${i + 1}-${i + chunk.length}`);
  }

  // 5. Sync questions in batches
  console.log('Syncing questions in batches...');
  const batchSize = 40;
  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    const statements = chunk.map(q => ({
      sql: `INSERT INTO questions (id, lecture_id, type, stem, options, correct, explanation, urdu_answer, image_url, marks, time_minutes, question_category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
              lecture_id=excluded.lecture_id, type=excluded.type, stem=excluded.stem, 
              options=excluded.options, correct=excluded.correct, explanation=excluded.explanation, 
              urdu_answer=excluded.urdu_answer, image_url=excluded.image_url, marks=excluded.marks, 
              time_minutes=excluded.time_minutes, question_category=excluded.question_category`,
      args: [
        q.id, q.lecture_id, q.type, q.stem, q.options, q.correct,
        q.explanation, q.urdu_answer, q.image_url, q.marks ?? 1,
        q.time_minutes ?? 1, q.question_category ?? 'lecture'
      ]
    }));

    await withRetry(
      () => turso.batch(statements, 'write'),
      `Sync questions batch ${Math.floor(i / batchSize) + 1}`
    );
    process.stdout.write(`  Uploaded ${Math.min(i + batchSize, questions.length)} / ${questions.length} questions...\r`);
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\nVerifying Turso row counts...');
  const subCount = await withRetry(() => turso.execute('SELECT COUNT(*) as c FROM subjects'), 'Verify subjects');
  const lecCount = await withRetry(() => turso.execute('SELECT COUNT(*) as c FROM lectures'), 'Verify lectures');
  const qCount = await withRetry(() => turso.execute('SELECT COUNT(*) as c FROM questions'), 'Verify questions');

  console.log(`Turso Status:
  - Subjects: ${subCount.rows[0].c}
  - Lectures: ${lecCount.rows[0].c}
  - Questions: ${qCount.rows[0].c}
  Sync completed successfully!`);
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

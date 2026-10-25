import Database from 'better-sqlite3';
import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

let _tursoClient: Client | null = null;
let _sqliteDb: Database.Database | null = null;

export function isTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function getTursoClient(): Client {
  if (_tursoClient) return _tursoClient;
  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  _tursoClient = createClient({ url, authToken });
  return _tursoClient;
}

function toPlain<T>(row: unknown): T {
  if (!row || typeof row !== 'object') return row as T;
  const plain: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    plain[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return plain as T;
}

export async function queryAll<T = Record<string, unknown>>(sql: string, args: (string | number | boolean | null)[] = []): Promise<T[]> {
  if (isTurso()) {
    const client = getTursoClient();
    const res = await client.execute({ sql, args });
    return res.rows.map(r => toPlain<T>(r));
  }
  const db = getDb();
  const rows = db.prepare(sql).all(...args);
  return rows.map(r => toPlain<T>(r));
}

export async function queryOne<T = Record<string, unknown>>(sql: string, args: (string | number | boolean | null)[] = []): Promise<T | null> {
  if (isTurso()) {
    const client = getTursoClient();
    const res = await client.execute({ sql, args });
    if (!res.rows || res.rows.length === 0) return null;
    return toPlain<T>(res.rows[0]);
  }
  const db = getDb();
  const row = db.prepare(sql).get(...args);
  return row ? toPlain<T>(row) : null;
}

export async function execute(sql: string, args: (string | number | boolean | null)[] = []): Promise<{ lastInsertRowid?: number }> {
  if (isTurso()) {
    const client = getTursoClient();
    const res = await client.execute({ sql, args });
    return { lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined };
  }
  const db = getDb();
  const res = db.prepare(sql).run(...args);
  return { lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined };
}

export function getDb(): Database.Database {
  if (_sqliteDb) return _sqliteDb;
  const DB_PATH = path.join(process.cwd(), 'data', 'exam.db');
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  _sqliteDb = new Database(DB_PATH);
  _sqliteDb.pragma('journal_mode = WAL');
  _sqliteDb.pragma('foreign_keys = ON');
  initSchema(_sqliteDb);
  return _sqliteDb;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS lectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      number INTEGER NOT NULL,
      title TEXT NOT NULL
    );
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
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      question_id INTEGER NOT NULL REFERENCES questions(id),
      answered TEXT,
      is_correct INTEGER,
      attempted_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const cols = db.prepare('PRAGMA table_info(questions)').all() as { name: string }[];
  const addCol = (col: string, def: string) => {
    if (!cols.find(c => c.name === col)) db.exec(`ALTER TABLE questions ADD COLUMN ${col} ${def}`);
  };
  addCol('marks', 'INTEGER DEFAULT 1');
  addCol('time_minutes', 'INTEGER DEFAULT 1');
  addCol('question_category', "TEXT DEFAULT 'lecture'");
}


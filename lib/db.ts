import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'exam.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      slug      TEXT    NOT NULL UNIQUE,
      code      TEXT    NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS lectures (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      number     INTEGER NOT NULL,
      title      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      lecture_id   INTEGER NOT NULL REFERENCES lectures(id),
      type         TEXT    NOT NULL CHECK(type IN ('mcq','short','code','math')),
      stem         TEXT    NOT NULL,
      options      TEXT,        -- JSON array for MCQ
      correct      TEXT,        -- correct option key e.g. "d" or answer text
      explanation  TEXT,
      urdu_answer  TEXT,
      image_url    TEXT
    );

    CREATE TABLE IF NOT EXISTS progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT    NOT NULL,
      question_id INTEGER NOT NULL REFERENCES questions(id),
      answered    TEXT,
      is_correct  INTEGER,
      attempted_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

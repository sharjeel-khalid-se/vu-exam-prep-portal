import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
const mth202 = db.prepare("SELECT id FROM subjects WHERE slug = 'mth202'").get();
const lectures = db.prepare("SELECT id, number, title FROM lectures WHERE subject_id = ? ORDER BY number ASC").all(mth202.id);
console.log('Lectures in MTH202:', lectures);

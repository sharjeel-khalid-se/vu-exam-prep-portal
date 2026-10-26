import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(dbPath);
const sub = db.prepare("SELECT id, code, name FROM subjects WHERE slug = 'cs504'").get();
console.log('CS504 Subject:', sub);

if (sub) {
  const lecs = db.prepare("SELECT id, number, title FROM lectures WHERE subject_id = ? ORDER BY number").all(sub.id);
  console.log(`Found ${lecs.length} lectures for CS504:`);
  for (const l of lecs) {
    const qCount = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(l.id);
    console.log(`  - Lecture ${l.number} (id: ${l.id}): "${l.title}" -> ${qCount.c} questions`);
  }
}

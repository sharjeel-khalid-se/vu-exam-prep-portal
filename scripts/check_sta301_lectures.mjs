import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(dbPath);

const subject = db.prepare("SELECT * FROM subjects WHERE slug = 'sta301'").get();
console.log('STA301 Subject:', subject);

if (subject) {
  const lectures = db.prepare("SELECT * FROM lectures WHERE subject_id = ? ORDER BY number").all(subject.id);
  console.log(`Found ${lectures.length} lectures for STA301:`);
  for (const l of lectures) {
    const qCount = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(l.id);
    console.log(`  - Lecture ${l.number} (id: ${l.id}): "${l.title}" -> ${qCount.c} questions`);
  }
}

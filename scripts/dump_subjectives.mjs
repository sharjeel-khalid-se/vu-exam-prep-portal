import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');
const db = new Database(dbPath);

const questions = db.prepare(`
  SELECT q.id, s.code, l.number as lecture, q.type, q.marks, q.stem, q.correct, q.explanation, q.urdu_answer
  FROM questions q
  JOIN lectures l ON l.id = q.lecture_id
  JOIN subjects s ON s.id = l.subject_id
  WHERE q.type IN ('short', 'long')
  ORDER BY q.id
`).all();

fs.writeFileSync(
  path.join(process.cwd(), 'exam-portal', 'scripts', 'subjectives_dump.json'),
  JSON.stringify(questions, null, 2)
);

console.log(`Exported ${questions.length} questions to subjectives_dump.json`);

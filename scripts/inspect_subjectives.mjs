import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');
const db = new Database(dbPath);

const rows = db.prepare(`
  SELECT s.slug, s.code, l.number as lec_num, q.id, q.type, q.marks, q.stem, length(q.correct) as len, q.correct
  FROM questions q
  JOIN lectures l ON l.id = q.lecture_id
  JOIN subjects s ON s.id = l.subject_id
  WHERE q.type IN ('short', 'long')
  ORDER BY s.slug, l.number, q.type, q.id
`).all();

console.log(`Total subjective questions: ${rows.length}`);
for (const r of rows) {
  console.log(`[${r.id}] ${r.code} L${r.lec_num} (${r.type}, ${r.marks}m, len ${r.len}): ${r.stem}`);
}

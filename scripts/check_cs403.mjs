import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));

const lectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = 1 ORDER BY number`).all();
for (const l of lectures) {
  const qcount = db.prepare(`SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?`).get(l.id);
  const types = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type`).all(l.id);
  console.log(`L${l.number} (id=${l.id}): "${l.title}" — ${qcount.c} questions`);
  types.forEach(t => console.log(`   ${t.type}: ${t.c}`));
}

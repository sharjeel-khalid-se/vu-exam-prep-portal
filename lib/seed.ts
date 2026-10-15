import { getDb } from './db';

export function seedCS403Lecture1() {
  const db = getDb();

  // Idempotent: skip if already seeded
  const existing = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403'`).get();
  if (existing) return;

  // Insert subject
  const subjectResult = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'Database Management',
    'cs403',
    'CS403',
    'Fundamentals of Database Management Systems — VU Course'
  );
  const subjectId = subjectResult.lastInsertRowid;

  // Insert lecture
  const lectureResult = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, ?, ?)
  `).run(subjectId, 1, 'Introduction to Databases');
  const lectureId = lectureResult.lastInsertRowid;

  // Seed MCQs
  const mcqs = [
    {
      stem: 'Collection of raw facts is called ______.',
      options: JSON.stringify({ a: 'Information', b: 'Object', c: 'Output', d: 'Data' }),
      correct: 'd',
      explanation: 'Data is the collection of raw, unprocessed facts and figures.',
      urdu_answer: 'Data خام حقائق اور اعداد و شمار کا مجموعہ ہوتا ہے۔'
    },
    {
      stem: 'Data is also called ______.',
      options: JSON.stringify({ a: 'Processed facts', b: 'Organized facts', c: 'Raw facts', d: 'Information' }),
      correct: 'c',
      explanation: 'Data consists of raw facts that have not yet been processed.',
      urdu_answer: 'Data کو Raw Facts بھی کہتے ہیں۔'
    },
    {
      stem: 'A collection of related data is called ______.',
      options: JSON.stringify({ a: 'Logical model', b: 'Database', c: 'Data', d: 'Relational model' }),
      correct: 'b',
      explanation: 'A database is an organized collection of logically related data.',
      urdu_answer: 'آپس میں متعلق ڈیٹا کے مجموعے کو Database کہتے ہیں۔'
    },
    {
      stem: 'A software package designed to store and manage database is called ______.',
      options: JSON.stringify({ a: 'Database', b: 'DBMS', c: 'Data model', d: 'Data' }),
      correct: 'b',
      explanation: 'DBMS (Database Management System) is the software that manages databases.',
      urdu_answer: 'DBMS وہ سافٹ ویئر ہے جو ڈیٹا بیس کو store اور manage کرتا ہے۔'
    },
    {
      stem: '"Database System" is the combination of ______.',
      options: JSON.stringify({ a: 'Database and DBMS', b: 'Database and Data', c: 'Data and Information', d: 'Operating System and Database' }),
      correct: 'a',
      explanation: 'Database System = Database + DBMS working together.',
      urdu_answer: 'Database System، Database اور DBMS کا مجموعہ ہوتا ہے۔'
    },
    {
      stem: 'Which of the following is called a replacement of the manual file system?',
      options: JSON.stringify({ a: 'Database system', b: 'File processing system', c: 'Operating system', d: 'DBMS' }),
      correct: 'b',
      explanation: 'The File Processing System replaced manual file keeping before databases were invented.',
      urdu_answer: 'File Processing System نے manual file system کی جگہ لی۔'
    },
    {
      stem: 'Which of the following is an advantage of using the Traditional File Organization?',
      options: JSON.stringify({ a: 'Time consuming', b: 'Data security', c: 'Simplicity', d: 'Efficiency' }),
      correct: 'c',
      explanation: 'Simplicity is the main advantage of traditional file organization, though it has many drawbacks.',
      urdu_answer: 'Traditional File Organization کا سب سے بڑا فائدہ اس کی Simplicity ہے۔'
    },
    {
      stem: 'Controlling redundancy in a DBMS does NOT help to ______.',
      options: JSON.stringify({ a: 'Avoid data duplication', b: 'Avoid unnecessary wastage of storage space', c: 'Avoid unauthorized access to data', d: 'Avoid data inconsistency' }),
      correct: 'c',
      explanation: 'Controlling redundancy is not related to authorization/access control. That is a separate DBMS feature.',
      urdu_answer: 'Redundancy control کا unauthorized access سے کوئی تعلق نہیں — وہ الگ feature ہے۔'
    },
    {
      stem: 'Major benefit of data sharing in database system is ______.',
      options: JSON.stringify({ a: 'Data of same applications placed at same place', b: 'Data of different applications placed at same place', c: 'Data stored at multiple different locations', d: 'None of above' }),
      correct: 'b',
      explanation: 'Data sharing means data from different applications can coexist and be accessed from a single location.',
      urdu_answer: 'Data sharing کا بڑا فائدہ یہ ہے کہ مختلف applications کا data ایک ہی جگہ رکھا جا سکتا ہے۔'
    },
  ];

  const insertMcq = db.prepare(`
    INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer)
    VALUES (?, 'mcq', ?, ?, ?, ?, ?)
  `);

  for (const q of mcqs) {
    insertMcq.run(lectureId, q.stem, q.options, q.correct, q.explanation, q.urdu_answer);
  }

  // Seed Short Questions
  const shorts = [
    {
      stem: 'Data aur Information mein kya farq hai?',
      correct: 'Data raw facts aur figures ka collection hota hai. Jab is par processing hoti hai aur usay meaningful form mein convert kiya jata hai to usay Information kehte hain.',
      urdu_answer: 'Data خام حقائق کا مجموعہ ہے۔ جب اس پر processing ہوتی ہے اور اسے meaningful بنایا جاتا ہے تو وہ Information بن جاتا ہے۔',
      explanation: 'Key distinction: Data = raw, unprocessed. Information = processed, meaningful.'
    },
    {
      stem: 'Database aur DBMS mein kya farq hai?',
      correct: 'Database logically related data ka zakhira hai, jabke DBMS woh software/tool hai jo database ko store, query aur manage karne ke liye istemal hota hai. Dono ke combination ko "Database System" kehte hain.',
      urdu_answer: 'Database ڈیٹا کا ذخیرہ ہے۔ DBMS وہ software ہے جو اسے manage کرتا ہے۔ دونوں مل کر Database System بناتے ہیں۔',
      explanation: 'Database = data storage. DBMS = software to manage it. Together = Database System.'
    },
    {
      stem: 'Traditional File Processing System ki sab se bari kamzori (Drawback) kya hai?',
      correct: 'Program-Data Interdependence (program aur data ka aapas mein shadeed inhisar) aur Data Redundancy/Inconsistency (data ki ghair zaroori doharayi aur ghair yaksaniyat) is ki sab se bari kamzoriyan hain.',
      urdu_answer: 'سب سے بڑی کمزوری Program-Data Interdependence اور Data Redundancy/Inconsistency ہے۔',
      explanation: 'These drawbacks led to the development of the DBMS.'
    },
    {
      stem: 'DBMS ke do bunyadi (Core) functions kon se hain?',
      correct: '1. Database ke Data ko manage karna. 2. Database ke Users ko manage aur authorize karna.',
      urdu_answer: '1. Data کو manage کرنا۔ 2. Users کو manage اور authorize کرنا۔',
      explanation: 'DBMS manages both the data itself and controls who can access it.'
    },
  ];

  const insertShort = db.prepare(`
    INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer)
    VALUES (?, 'short', ?, ?, ?, ?)
  `);

  for (const q of shorts) {
    insertShort.run(lectureId, q.stem, q.correct, q.explanation, q.urdu_answer);
  }

  console.log('✅ CS403 Lecture 1 seeded successfully');
}

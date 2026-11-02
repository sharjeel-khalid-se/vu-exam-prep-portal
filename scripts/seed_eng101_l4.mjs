import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate ENG101 subject
let eng101 = db.prepare("SELECT id FROM subjects WHERE slug = 'eng101'").get();
if (!eng101) {
  const res = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'English Comprehension',
    'eng101',
    'ENG101',
    'Reading comprehension, vocabulary development, dictionary usage, grammar, and reading techniques — Virtual University'
  );
  eng101 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Subject with ID: ${eng101.id}`);
} else {
  console.log(`ENG101 Subject found with ID: ${eng101.id}`);
}

// 2. Create or fetch Lecture 4
let lec4 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 4").get(eng101.id);
if (!lec4) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 4, 'Reading: Topic, Main Idea, Major and Minor Details')
  `).run(eng101.id);
  lec4 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 4 with ID: ${lec4.id}`);
} else {
  console.log(`ENG101 Lecture 4 found with ID: ${lec4.id}`);
}

// 3. Clear existing questions for Lecture 4
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec4.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 4.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Complete the statement based on the reading passage: When apple growers talk about new varieties of apples, they don\'t mean something:',
    options: {
      a: 'developed last month, last year, or even in the last decade.',
      b: 'grown in a foreign country or greenhouse.',
      c: 'produced through synthetic chemical modifications.',
      d: 'sold exclusively in supermarkets at discounted rates.'
    },
    correct: 'a',
    explanation: 'In the reading selection on apples from ENG101 Handouts Lesson 4, it is explained that breeding, cross-pollinating, and commercially establishing new apple varieties requires decades of horticultural development. Hence, when growers discuss new varieties, they do not mean something developed recently (last month, last year, or even the last decade). Appeared in Attiq Kundi and Oxford Handout Shop midterm files.',
    urdu_answer: 'سیب سے متعلق پیراگراف کے مطابق جب کاشتکار نئی اقسام کی بات کرتے ہیں تو ان کا مطلب پچھلے مہینے، سال یا دہائی میں بنائی گئی قسم نہیں ہوتی کیونکہ نئی قسم کی تیاری میں دہائیاں لگ جاتی ہیں۔'
  },
  {
    stem: 'With reference to computers, the word "memory" means:',
    options: {
      a: 'Internal storage',
      b: 'External secondary storage',
      c: 'Input peripheral device',
      d: 'System software program'
    },
    correct: 'a',
    explanation: 'In the passage "What is a Computer?" (ENG101 Handouts Lesson 4), internal storage is specifically designated as "memory," where instructions, programs, and operational data are held for rapid processing by the computer. Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'کمپیوٹر کی اصطلاح میں "Memory" سے مراد انٹرنل اسٹوریج (Internal storage) ہے جہاں کمپیوٹر ہدایات اور ضروری ڈیٹا کو پروسیسنگ کے دوران محفوظ رکھتا ہے۔'
  },
  {
    stem: 'Select the statement that best expresses the overall main idea of the passage "What is a Computer?":',
    options: {
      a: 'Computers have changed the way in which many kinds of jobs are done.',
      b: 'Instructions and data must be given to the computer to act on.',
      c: 'Computers are machines capable of processing and outputting.',
      d: 'Without computers, many tasks would take much longer to do.'
    },
    correct: 'c',
    explanation: 'While all options represent true facts mentioned in the text, statement C encapsulates the overall defining thesis and overarching main idea of the passage: computers are electronic machines fundamentally characterized by their capability to process data and generate output (ENG101 Handouts Lesson 4 exercises).',
    urdu_answer: '"What is a Computer?" کے مضمون کا بنیادی اور جامع مرکزی خیال یہ ہے کہ کمپیوٹر ایسی مشینیں ہیں جو ڈیٹا کو پروسیس کرنے اور آؤٹ پٹ دینے کی صلاحیت رکھتی ہیں۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Fill in the missing words in the following paragraph excerpted from Lecture 4 ("What is a Computer?"):\n\n"Computers are thought t___(1) have many remarkable powers. However, most c________(2), whether large _o____(3)_ small have three basic capabilities. First, computers h___(4)_ circuits of performing arithmetic operations, such as: addition, subtraction, d______(5)_, multiplication and exponentiation. Second, computers have a m______(6)_ of communicating with the user. After all, if we couldn\'t feed information i___(7)__ and get results back, t____(8)____ machines wouldn\'t be o__(9)____ much use. However, c____(10)__ computers (commonly minicomputers and microcomputers) are used t__(11)__ control directly t_____(12)__ such as robots, aircraft\'s navigation systems, medical instruments, etc."',
    correct: `<p><strong>Completed Cloze Text (ENG101 Lecture 4 - "What is a Computer?"):</strong></p>
<ol>
  <li><strong>to</strong> (thought <em>to</em> have)</li>
  <li><strong>computers</strong> (most <em>computers</em>)</li>
  <li><strong>or</strong> (large <em>or</em> small)</li>
  <li><strong>have</strong> (computers <em>have</em> circuits)</li>
  <li><strong>division</strong> (addition, subtraction, <em>division</em>, multiplication...)</li>
  <li><strong>means</strong> (have a <em>means</em> of communicating)</li>
  <li><strong>in</strong> (feed information <em>in</em>)</li>
  <li><strong>these</strong> (<em>these</em> machines wouldn't be...)</li>
  <li><strong>of</strong> (wouldn't be <em>of</em> much use)</li>
  <li><strong>certain</strong> (However, <em>certain</em> computers...)</li>
  <li><strong>to</strong> (used <em>to</em> control directly)</li>
  <li><strong>things</strong> (control directly <em>things</em> such as robots...)</li>
</ol>`,
    explanation: 'Standard 5-mark cloze comprehension exercise from eng101_mid_term_6 (Exercise 3).',
    urdu_answer: 'خالی جگہوں کے درست جوابات: 1. to، 2. computers، 3. or، 4. have، 5. division، 6. means، 7. in، 8. these، 9. of، 10. certain، 11. to، 12. things۔'
  },
  {
    stem: 'What is the structural distinction between a Main Idea, Major Details, and Minor Details in a paragraph? Explain how each level functions.',
    correct: `<p><strong>Structural Hierarchy of a Paragraph (ENG101 Handouts Lesson 4):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Level</th>
      <th style="padding: 8px;">Structural Element</th>
      <th style="padding: 8px;">Function &amp; Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>1</strong></td>
      <td style="padding: 8px;"><strong>Main Idea</strong></td>
      <td style="padding: 8px;">The core argument, central thought, or controlling assertion that the author wishes to convey regarding the topic. It forms the overall umbrella for the entire paragraph.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>2</strong></td>
      <td style="padding: 8px;"><strong>Major Details</strong></td>
      <td style="padding: 8px;">The primary supporting points that grow directly out of the main idea. They explain, justify, or subdivide the main idea into fundamental categories or key arguments.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>3</strong></td>
      <td style="padding: 8px;"><strong>Minor Details</strong></td>
      <td style="padding: 8px;">Specific examples, statistical figures, illustrations, or restatements that grow out of the major details to make them vivid, concrete, and easily understood.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core conceptual 3-mark question appearing across ENG101 Midterm Papers (Handouts Lesson 4 and Latest Paper 2).',
    urdu_answer: 'پیراگراف میں مین آئیڈیا (Main Idea) بنیادی مرکزی خیال ہوتا ہے؛ میجر ڈیٹیلز (Major Details) وہ بنیادی دلائل ہیں جو براہ راست مین آئیڈیا کو ثابت کرتے ہیں؛ اور مائنر ڈیٹیلز (Minor Details) وہ مخصوص مثالیں اور تفصیلات ہیں جو میجر ڈیٹیلز کی وضاحت کرتی ہیں۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Using the structural model taught in Lecture 4, explain how a reader identifies and differentiates between Major Supporting Details and Minor Supporting Details within an expository text. Illustrate with an example analysis based on "What is a Computer?".',
    correct: `<p><strong>Structural Analysis: Main Idea, Major Details, and Minor Details (ENG101 Lesson 4):</strong></p>

<h4>1. The Analytical Model:</h4>
<p>In analytical reading, an expository text functions like an inverted tree or organizational chart:</p>
<ul>
  <li><strong>Topic:</strong> The broad subject matter (<em>Computers</em>).</li>
  <li><strong>Main Idea:</strong> The specific controlling statement made about that subject (<em>Most computers have three basic capabilities</em>).</li>
</ul>

<h4>2. Major Supporting Details:</h4>
<p>Major details emerge directly from the main idea and answer the question: <em>"What are the primary proofs or divisions of this claim?"</em> In the passage "What is a Computer?", there are three distinct major details:</p>
<ol>
  <li><strong>Capability 1:</strong> Performing complex mathematical operations at extreme speeds.</li>
  <li><strong>Capability 2:</strong> Communicating with human users via input and output channels.</li>
  <li><strong>Capability 3:</strong> Internal storage (memory) for programs and active data.</li>
</ol>

<h4>3. Minor Supporting Details:</h4>
<p>Minor details do not support the main idea directly; instead, they substantiate, clarify, and illustrate a specific major detail:</p>
<ul>
  <li><em>Supporting Major Detail 1:</em> Listing individual arithmetic operations—addition, subtraction, multiplication, division, and exponentiation.</li>
  <li><em>Supporting Major Detail 2:</em> Specifying devices used for feeding data in (keyboards) and receiving results back (screens, printers).</li>
  <li><em>Supporting Major Detail 3:</em> Explaining that minicomputers and microcomputers directly control physical systems (such as aircraft navigation and medical instruments).</li>
</ul>

<h4>4. The Diagnostic Test for Readers:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Criterion</th>
      <th style="padding: 8px;">Major Detail</th>
      <th style="padding: 8px;">Minor Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Immediate Target</strong></td>
      <td style="padding: 8px;">Substantiates the <em>Main Idea</em>.</td>
      <td style="padding: 8px;">Substantiates a <em>Major Detail</em>.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Impact of Deletion</strong></td>
      <td style="padding: 8px;">Removes a core argument; weakens the logical integrity of the paragraph.</td>
      <td style="padding: 8px;">Removes illustrative detail; the main argument remains logically coherent.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive 5-mark analytical subjective question synthesizing the reading comprehension hierarchy of Lecture 4.',
    urdu_answer: 'لیکچر 4 کے تنقیدی ماڈل کے مطابق قاری مرکزی خیال، بنیادی نکات (Major Details) اور ثانوی تفصیلات (Minor Details) میں تفریق کر سکتا ہے۔ کمپیوٹر والے پیراگراف میں تین بنیادی صلاحیتیں میجر ڈیٹیلز ہیں، جبکہ ان صلاحیتوں کے تحت دی گئی مخصوص حسابی علامات اور ان پٹ/آؤٹ پٹ ڈیوائسز کی مثالیں مائنر ڈیٹیلز ہیں۔'
  }
];

// 7. Insert Statements
const insMcq = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'lecture')
`);

const insShort = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
`);

const insLong = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'lecture')
`);

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lec4.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec4.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec4.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 4:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 4: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

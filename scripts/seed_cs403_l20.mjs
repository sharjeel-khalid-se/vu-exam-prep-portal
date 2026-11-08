import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS403
const cs403 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs403'").get();
if (!cs403) {
  console.error('CS403 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 20 for CS403
let lec20 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 20").get(cs403.id);
if (!lec20) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 20, 'Second Normal Form (2NF), Third Normal Form (3NF), and BCNF')
  `).run(cs403.id);
  lec20 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 20 with ID: ${lec20.id}`);
} else {
  console.log(`CS403 Lecture 20 found with ID: ${lec20.id}`);
}

const lId = lec20.id;

// 3. Clear existing questions for Lecture 20 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 20.`);

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
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// 11 MCQs
const mcqs = [
  {
    stem: 'Which of the following conditions enforces a relation into Second Normal Form (2NF)?',
    options: {
      a: 'Relation is in 1NF and every non-key attribute is partially dependent on super key',
      b: 'Relation is not in 1NF and non-key attribute is non-transitively dependent on primary key',
      c: 'Relation is in 1NF and every non-key attribute is fully functionally dependent on primary key',
      d: 'The domain of attribute may include multiple values'
    },
    correct: 'c',
    explanation: '<p>A relation is in <strong>Second Normal Form (2NF)</strong> if and only if it is already in 1NF and every non-key attribute is <strong>fully functionally dependent</strong> on the entire primary key, meaning no partial dependencies exist (CS403 Handouts Page 169). Appeared 6 times.</p>',
    urdu_answer: 'دوسری نارمل فارم (2NF) کی بنیادی شرط یہ ہے کہ جدول پہلے سے 1NF میں ہو اور تمام نان-کی ایٹریبیوٹس پرائمری کی پر مکمل طور پر فنکشنل ڈیپینڈنٹ ہوں (یعنی کوئی پارشل ڈیپینڈینسی نہ ہو)۔'
  },
  {
    stem: 'If in a relation R, all non-key attributes are fully functionally dependent on the primary key attributes, the relation R is in ______.',
    options: {
      a: '2NF',
      b: '3NF',
      c: 'BCNF',
      d: 'Higher NF'
    },
    correct: 'a',
    explanation: '<p>When full functional dependency is established across all non-key attributes and partial dependencies are eliminated, the relation satisfies <strong>2NF</strong> (CS403 Handouts Page 169). Appeared 5 times.</p>',
    urdu_answer: 'جب کسی ریلیشن میں تمام نان-کی ایٹریبیوٹس پرائمری کی پر مکمل فنکشنل ڈیپینڈنٹ ہوں تو وہ ریلیشن 2NF میں ہوتا ہے۔'
  },
  {
    stem: 'If a relation is in 1NF and contains a single-attribute (simple) Primary Key, the relation is automatically in ______.',
    options: {
      a: '1NF only',
      b: '2NF',
      c: '3NF',
      d: '4NF'
    },
    correct: 'b',
    explanation: '<p>Partial dependencies can only occur when the primary key is composite (consists of two or more attributes). If a relation has a single-attribute primary key, partial dependency is mathematically impossible, making it <strong>automatically in 2NF</strong> (CS403 Handouts Page 169). Appeared 5 times.</p>',
    urdu_answer: 'اگر 1NF کے ریلیشن کی پرائمری کی صرف ایک ایٹریبیوٹ پر مشتمل ہو تو پارشل ڈیپینڈینسی کا امکان ہی ختم ہو جاتا ہے، اس لیے وہ خود بخود 2NF میں پہنچ جاتا ہے۔'
  },
  {
    stem: 'A relation is in Third Normal Form (3NF) if it is already in 2NF and ______.',
    options: {
      a: 'Every non-key attribute is partially dependent on the key',
      b: 'Every non-key attribute is non-transitively dependent upon its primary key',
      c: 'All attributes are multi-valued',
      d: 'It has composite keys only'
    },
    correct: 'b',
    explanation: '<p>A relation is in <strong>Third Normal Form (3NF)</strong> if it is in 2NF and no non-key attribute is transitively dependent on the primary key—that is, no non-key attribute determines another non-key attribute (CS403 Handouts Page 171). Appeared 5 times.</p>',
    urdu_answer: 'ایک ریلیشن 3NF میں اس وقت ہوتا ہے جب وہ پہلے سے 2NF میں ہو اور کوئی بھی نان-کی ایٹریبیوٹ پرائمری کی پر ٹرانزیٹیو ڈیپینڈنٹ نہ ہو (یعنی کوئی غیر کلیدی ایٹریبیوٹ دوسرے غیر کلیدی ایٹریبیوٹ کا تعین نہ کرے)۔'
  },
  {
    stem: 'Which of the following dependency concepts is directly addressed and eliminated in Third Normal Form (3NF)?',
    options: {
      a: 'Full functional dependency',
      b: 'Any kind of dependency',
      c: 'Transitive dependency',
      d: 'Partial functional dependency'
    },
    correct: 'c',
    explanation: '<p><strong>Transitive dependency</strong> (where A &rarr; B and B &rarr; C, with C depending on A via non-key attribute B) is the primary target eliminated when converting from 2NF to <strong>3NF</strong> (CS403 Handouts Page 171). Appeared 6 times.</p>',
    urdu_answer: 'تیسری نارمل فارم (3NF) میں ٹرانزیٹیو ڈیپینڈینسی (Transitive Dependency) کو براہ راست ختم کیا جاتا ہے۔'
  },
  {
    stem: 'A Transitive Dependency occurs when ______.',
    options: {
      a: 'A primary key determines a non-key attribute',
      b: 'One non-key attribute determines another non-key attribute',
      c: 'A non-key attribute determines a candidate key',
      d: 'Two primary keys determine a third attribute'
    },
    correct: 'b',
    explanation: '<p>A <strong>transitive dependency</strong> occurs when a functional dependency exists between two non-key attributes (e.g. <code>DeptNo &rarr; DeptName</code> in an Employee relation where <code>EmpNo</code> is the primary key) (CS403 Handouts Page 172). Appeared 5 times.</p>',
    urdu_answer: 'ٹرانزیٹیو ڈیپینڈینسی اس وقت وقوع پذیر ہوتی ہے جب ایک نان-کی ایٹریبیوٹ کسی دوسرے نان-کی ایٹریبیوٹ کی قیمت کا تعین کرتا ہے۔'
  },
  {
    stem: 'In ______ Normal Form, every determinant in every functional dependency must be a candidate key.',
    options: {
      a: '3NF',
      b: 'Boyce-Codd Normal Form (BCNF)',
      c: '4NF',
      d: '5NF'
    },
    correct: 'b',
    explanation: '<p>In <strong>Boyce-Codd Normal Form (BCNF)</strong>, the strict rule is that for every functional dependency <code>X &rarr; Y</code>, the determinant <code>X</code> must be a superkey or <strong>candidate key</strong> (CS403 Handouts Page 173). Appeared 6 times.</p>',
    urdu_answer: 'بوائس-کوڈ نارمل فارم (BCNF) میں ہر فنکشنل ڈیپینڈینسی کا ڈیٹرمیننٹ (Determinant) لازماً ایک کینڈیڈیٹ کی (یا سپر کی) ہونا چاہیے۔'
  },
  {
    stem: 'A relation that satisfies 3NF is converted to Boyce-Codd Normal Form (BCNF) by ______.',
    options: {
      a: 'Removing composite keys',
      b: 'Removing multivalued dependencies',
      c: 'Placing dependent attributes of overlapping composite candidate keys into a separate relation',
      d: 'Putting dependent non-key attributes into a separate table'
    },
    correct: 'c',
    explanation: '<p>When overlapping composite candidate keys exist in a 3NF relation, non-candidate-key determinants violate BCNF. It is resolved by decomposing the relation so the violating dependency is isolated in a separate relation with its determinant as primary key (CS403 Handouts Page 174). Appeared 5 times.</p>',
    urdu_answer: 'ایک 3NF ریلیشن کو BCNF میں بدلنے کے لیے اوورلیپنگ کمپوزٹ کینڈیڈیٹ کیز والے ایٹریبیوٹس کو الگ ریلیشن میں منتقل کر کے ڈیٹرمیننٹ کو پرائمری کی بنایا جاتا ہے۔'
  },
  {
    stem: 'Which of the following Normal Forms specifically handles and eliminates Multi-Valued Dependencies (MVD)?',
    options: {
      a: '2NF',
      b: '3NF',
      c: 'Fourth Normal Form (4NF)',
      d: 'Fifth Normal Form (5NF)'
    },
    correct: 'c',
    explanation: '<p><strong>Fourth Normal Form (4NF)</strong> handles <strong>multi-valued dependencies (MVD)</strong>, ensuring that independent multi-valued facts are not stored together in a single relation (CS403 Handouts Page 175). Appeared 5 times.</p>',
    urdu_answer: 'چوتھی نارمل فارم (4NF) ملٹی ویلیوڈ ڈیپینڈینسیز (Multi-Valued Dependencies) کو حل اور ختم کرتی ہے۔'
  },
  {
    stem: 'Which of the following Normal Forms deals with possible lossless join decompositions and join dependencies?',
    options: {
      a: '3NF',
      b: 'BCNF',
      c: '4NF',
      d: 'Fifth Normal Form (5NF)'
    },
    correct: 'd',
    explanation: '<p><strong>Fifth Normal Form (5NF)</strong> (also known as Project-Join Normal Form or PJNF) ensures that relations can be reconstructed without loss of data or generation of spurious tuples via <strong>lossless join decompositions</strong> (CS403 Handouts Page 175). Appeared 4 times.</p>',
    urdu_answer: 'پانچویں نارمل فارم (5NF) جوائن ڈیپینڈینسیز اور لاس لیس جوائن ڈی کمپوزیشنز (Lossless Join Decompositions) کو ڈیل کرتی ہے۔'
  },
  {
    stem: 'While converting a relation to Second Normal Form (2NF), the determinant of each identified partial dependency becomes the ______ of the newly created table.',
    options: {
      a: 'Primary key',
      b: 'Foreign key only',
      c: 'Secondary key',
      d: 'Candidate key without index'
    },
    correct: 'a',
    explanation: '<p>During 2NF decomposition, each partial functional dependency is extracted into a new relation where its determinant becomes the <strong>primary key</strong> (CS403 Handouts Page 170). Appeared 4 times.</p>',
    urdu_answer: '2NF میں تبدیل کرتے وقت، پارشل ڈیپینڈینسی کا ڈیٹرمیننٹ نئی بننے والی ٹیبل کی پرائمری کی (Primary Key) بن جاتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 20.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define Second Normal Form (2NF) and explain the concept of Partial Dependency with a simple example.',
    correct: 'A relation is in 2NF if it is in 1NF and every non-key attribute is fully functionally dependent on the primary key. A partial dependency occurs when a non-key attribute depends on only a subset of a composite primary key.',
    explanation: `<p><strong>Second Normal Form (2NF):</strong><br>
A relation is in <strong>Second Normal Form (2NF)</strong> if:</p>
<ol>
  <li>It is already in First Normal Form (1NF).</li>
  <li>No non-key attribute is <strong>partially dependent</strong> on the primary key (i.e., all non-key attributes are fully functionally dependent on the whole primary key).</li>
</ol>
<p><strong>Partial Dependency:</strong></p>
<p>A partial dependency arises when a non-key attribute is determined by only a <em>portion</em> (subset) of a composite primary key rather than the entire composite key.<br>
<em>Example:</em> In table <code>ENROLL(StudentID, CourseID, StudentName, Grade)</code> with composite key <code>{StudentID, CourseID}</code>:</p>
<ul>
  <li><code>{StudentID, CourseID} &rarr; Grade</code> is a <strong>Full Functional Dependency</strong>.</li>
  <li><code>StudentID &rarr; StudentName</code> is a <strong>Partial Dependency</strong> because <code>StudentName</code> depends only on <code>StudentID</code>.</li>
</ul>`,
    urdu_answer: 'دوسری نارمل فارم (2NF): ایک ریلیشن 2NF میں تب ہوتا ہے جب وہ 1NF میں ہو اور کوئی نان-کی ایٹریبیوٹ پرائمری کی کے کسی جزوی حصے پر منحصر نہ ہو۔ پارشل ڈیپینڈینسی سے مراد یہ ہے کہ نان-کی ایٹریبیوٹ پوری کمپوزٹ پرائمری کی کے بجائے اس کے کسی ایک حصے پر ڈیپینڈ کر رہا ہو۔'
  },
  {
    stem: 'Define Third Normal Form (3NF) and Transitive Dependency. How is a transitive dependency resolved?',
    correct: 'A relation is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key. Transitive dependency occurs when X -> Y and Y -> Z (non-key determines non-key). It is resolved by moving Y and Z into a new relation with Y as primary key.',
    explanation: `<p><strong>Third Normal Form (3NF):</strong><br>
A relation is in <strong>3NF</strong> if:</p>
<ol>
  <li>It is in Second Normal Form (2NF).</li>
  <li>No non-key attribute is <strong>transitively dependent</strong> on the primary key.</li>
</ol>
<p><strong>Transitive Dependency:</strong><br>
Occurs when a primary key <code>X</code> determines non-key attribute <code>Y</code>, and <code>Y</code> in turn functionally determines another non-key attribute <code>Z</code> (<code>X &rarr; Y &rarr; Z</code>).</p>
<p><strong>Resolution:</strong><br>
The transitive dependency is removed by creating a new table containing <code>(Y, Z)</code> with <code>Y</code> as its Primary Key. In the original table, <code>Z</code> is removed, and <code>Y</code> remains as a Foreign Key.</p>`,
    urdu_answer: 'تیسری نارمل فارم (3NF): ریلیشن 3NF میں تب ہوتا ہے جب وہ 2NF میں ہو اور اس میں کوئی ٹرانزیٹیو ڈیپینڈینسی نہ ہو۔ ٹرانزیٹیو ڈیپینڈینسی تب ہوتی ہے جب ایک نان-کی ایٹریبیوٹ دوسرے نان-کی ایٹریبیوٹ کا تعین کرے۔ اسے حل کرنے کے لیے منحصر ایٹریبیوٹس کو الگ ٹیبل میں منتقل کر دیا جاتا ہے۔'
  },
  {
    stem: 'What is Boyce-Codd Normal Form (BCNF)? How does it differ from Third Normal Form (3NF)?',
    correct: 'BCNF is a stricter form of 3NF requiring that in every functional dependency X -> A, the determinant X must be a candidate key (or superkey). In 3NF, A can also be a prime attribute, which BCNF does not allow.',
    explanation: `<p><strong>Boyce-Codd Normal Form (BCNF):</strong><br>
A relation is in <strong>BCNF</strong> if and only if for every non-trivial functional dependency <code>X &rarr; A</code>, the determinant <strong>X is a candidate key (or superkey)</strong>.</p>
<p><strong>Difference between 3NF and BCNF:</strong></p>
<ul>
  <li><strong>3NF Condition:</strong> For <code>X &rarr; A</code>, either <code>X</code> must be a superkey OR <code>A</code> must be a <em>prime attribute</em> (part of a candidate key).</li>
  <li><strong>BCNF Condition:</strong> Strictly requires <code>X</code> to be a superkey, regardless of whether <code>A</code> is a prime attribute or not.</li>
  <li><strong>Applicability:</strong> BCNF eliminates anomalies that persist in 3NF when a relation possesses overlapping composite candidate keys.</li>
</ul>`,
    urdu_answer: 'بوائس-کوڈ نارمل فارم (BCNF): BCNF، 3NF کی ایک سخت اور جدید قسم ہے۔ اس کا بنیادی اصول یہ ہے کہ ہر فنکشنل ڈیپینڈینسی X &rarr; A میں، بائیں طرف والا عنصر (X) لازماً کینڈیڈیٹ کی ہونا چاہیے۔ 3NF میں دائیں طرف پرائم ایٹریبیوٹ ہونے کی اجازت ہوتی ہے، جبکہ BCNF میں ایسی کوئی رعایت نہیں ہوتی۔'
  },
  {
    stem: 'Briefly describe Fourth Normal Form (4NF) and Fifth Normal Form (5NF). What specific issues do they address?',
    correct: '4NF addresses Multi-Valued Dependencies (MVDs) to prevent independent multi-valued facts from co-existing in one table. 5NF (Project-Join Normal Form) addresses Join Dependencies to guarantee lossless join decomposition when reconstructing tables.',
    explanation: `<p><strong>Higher Normal Forms Overview:</strong></p>
<ol>
  <li><strong>Fourth Normal Form (4NF):</strong>
    <ul>
      <li><strong>Focus:</strong> Resolves <strong>Multi-Valued Dependencies (MVDs)</strong> (denoted <code>X &twoheadrightarrow; Y</code>).</li>
      <li><strong>Requirement:</strong> A relation is in 4NF if it is in BCNF and contains no non-trivial multi-valued dependencies. It ensures independent 1:N relationships (e.g. employee skills and employee dependents) are stored in separate relations.</li>
    </ul>
  </li>
  <li><strong>Fifth Normal Form (5NF / PJNF):</strong>
    <ul>
      <li><strong>Focus:</strong> Resolves <strong>Join Dependencies (JD)</strong>.</li>
      <li><strong>Requirement:</strong> A relation is in 5NF if it cannot be decomposed into smaller relations without losing information when re-joined. It guarantees <strong>lossless join decompositions</strong>.</li>
    </ul>
  </li>
</ol>`,
    urdu_answer: 'چوتھی اور پانچویں نارمل فارم: 4NF ملٹی ویلیوڈ ڈیپینڈینسیز (MVDs) کو حل کرتی ہے تاکہ غیر متعلقہ ملٹی ویلیو فیکٹس ایک ساتھ جمع نہ ہوں۔ 5NF (پروجیکٹ جوائن نارمل فارم) جوائن ڈیپینڈینسیز کو سنبھالتی ہے تاکہ ٹیبلز کو تقسیم کرنے اور دوبارہ جوڑنے پر بغیر کسی نقصان کے اصل ڈیٹا حاصل ہو سکے (Lossless Join)۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 20.`);

// 4 Long Questions (5 marks each: 2 Analytical + 2 Problem-Solving)
const longQuestions = [
  {
    stem: 'Explain the progression from 1NF to 2NF and 2NF to 3NF with a complete illustrative decomposition walkthrough. Show how partial and transitive dependencies are eliminated.',
    correct: '1NF to 2NF removes partial dependencies by separating attributes dependent on subset of key into separate tables. 2NF to 3NF removes transitive dependencies by separating non-key attributes that determine other non-key attributes.',
    explanation: `<p><strong>Complete Normalization Walkthrough (1NF &rarr; 2NF &rarr; 3NF):</strong></p>

<p><strong>1. Step 1: 1NF to 2NF Transformation (Eliminating Partial Dependencies):</strong><br>
Consider a university enrollment relation in 1NF:</p>
<p><code>STUDENT_COURSE(stId, crId, stName, stAdr, crTitle, crCredits, grade)</code></p>
<ul>
  <li><strong>Composite Primary Key:</strong> <code>{stId, crId}</code></li>
  <li><strong>Functional Dependencies:</strong>
    <ol>
      <li><code>{stId, crId} &rarr; grade</code> (Full Functional Dependency)</li>
      <li><code>stId &rarr; {stName, stAdr}</code> (Partial Dependency on <code>stId</code>)</li>
      <li><code>crId &rarr; {crTitle, crCredits}</code> (Partial Dependency on <code>crId</code>)</li>
    </ol>
  </li>
  <li><strong>2NF Decomposition:</strong> Create a table for each partial determinant and one for the fully dependent attributes:
    <ul>
      <li><code>STUDENT(stId, stName, stAdr)</code> [PK: <code>stId</code>]</li>
      <li><code>COURSE(crId, crTitle, crCredits)</code> [PK: <code>crId</code>]</li>
      <li><code>ENROLLMENT(stId, crId, grade)</code> [PK: <code>{stId, crId}</code>]</li>
    </ul>
  </li>
</ul>

<p><strong>2. Step 2: 2NF to 3NF Transformation (Eliminating Transitive Dependencies):</strong><br>
Suppose the <code>STUDENT</code> table includes department details:<br>
<code>STUDENT(stId, stName, deptNo, deptName, deptHOD)</code></p>
<ul>
  <li><strong>Primary Key:</strong> <code>stId</code></li>
  <li><strong>Dependencies:</strong>
    <ol>
      <li><code>stId &rarr; deptNo</code> (PK determines non-key)</li>
      <li><code>deptNo &rarr; {deptName, deptHOD}</code> (Non-key determines non-key: <strong>Transitive Dependency</strong>)</li>
    </ol>
  </li>
  <li><strong>3NF Decomposition:</strong> Extract the transitive determinant into a new relation:
    <ul>
      <li><code>DEPARTMENT(deptNo, deptName, deptHOD)</code> [PK: <code>deptNo</code>]</li>
      <li><code>STUDENT(stId, stName, deptNo)</code> [PK: <code>stId</code>, FK: <code>deptNo</code>]</li>
    </ul>
  </li>
</ul>`,
    urdu_answer: '1NF سے 2NF اور 3NF کا مرحلہ وار عمل: 1NF سے 2NF میں جاتے وقت کمپوزٹ کی پر منحصر پارشل ڈیپینڈینسیز کو الگ ٹیبلز میں نکالا جاتا ہے (جیسے طالب علم اور کورس کی معلومات الگ ہو جاتی ہیں)۔ 2NF سے 3NF میں جاتے وقت نان-کی ایٹریبیوٹس کے درمیان باہمی ڈیپینڈینسی (ٹرانزیٹیو ڈیپینڈینسی جیسے deptNo اور deptName) کو الگ کر کے نیا ڈیپارٹمنٹ ٹیبل بنایا جاتا ہے۔'
  },
  {
    stem: 'Write a detailed note on Boyce-Codd Normal Form (BCNF) and Higher Normal Forms (4NF, 5NF, and DKNF). Explain the scenario where a 3NF relation fails BCNF.',
    correct: 'BCNF requires every determinant to be a candidate key. A 3NF relation fails BCNF when overlapping candidate keys exist. 4NF eliminates multi-valued dependencies, 5NF eliminates join dependencies, and DKNF enforces constraints via domain and key definitions.',
    explanation: `<p><strong>Boyce-Codd Normal Form (BCNF) and Higher Normal Forms:</strong></p>

<p><strong>1. Why 3NF is Sometimes Not Enough (The BCNF Motivation):</strong><br>
A relation is in 3NF if for every <code>X &rarr; A</code>, either <code>X</code> is a superkey OR <code>A</code> is a prime attribute. When a table has <em>overlapping candidate keys</em>, a non-superkey determinant may determine a prime attribute. This satisfies 3NF but causes redundancy and update anomalies.</p>

<p><strong>2. Definition of BCNF:</strong><br>
A relation R is in BCNF if and only if for every functional dependency <code>X &rarr; A</code>, <strong>X is a superkey</strong> (there are no exceptions for prime attributes).</p>

<p><strong>3. Higher Normal Forms:</strong></p>
<ul>
  <li><strong>Fourth Normal Form (4NF):</strong>
    Deals with <strong>Multi-Valued Dependencies (MVD)</strong> denoted <code>X &twoheadrightarrow; Y</code>. If an entity has two independent multi-valued properties (e.g., an Instructor with multiple <code>Phone_Numbers</code> and multiple <code>Degrees</code>), placing both in one table leads to a Cartesian product of rows. 4NF splits them into two independent relations.
  </li>
  <li><strong>Fifth Normal Form (5NF / Project-Join Normal Form):</strong>
    Guarantees that when a relation is decomposed into three or more sub-relations, it can be re-joined losslessly without generating spurious records.
  </li>
  <li><strong>Domain-Key Normal Form (DKNF):</strong>
    The theoretical ultimate normal form where every constraint on a relation is a logical consequence of domain constraints and key constraints.
  </li>
</ul>`,
    urdu_answer: 'بوائس-کوڈ (BCNF) اور اعلیٰ نارمل فارمز: BCNF اس بات کا تقاضا کرتا ہے کہ ہر ڈیٹرمیننٹ لازماً سپر کی ہو۔ اگر اوورلیپنگ کیز ہوں تو 3NF میں بھی مسائل رہ جاتے ہیں جنہیں BCNF حل کرتا ہے۔ 4NF ملٹی ویلیوڈ ڈیپینڈینسیز کو الگ کرتا ہے، 5NF لاس لیس جوائنز کو یقینی بناتا ہے اور DKNF تمام شرائط کو ڈومین اور کیز کے ذریعے پورا کرتا ہے۔'
  },
  {
    stem: 'Numerical / Problem-Solving Question 1: Given relation CLASS(crId, stId, stName, fId, room, grade) with composite primary key {crId, stId} and functional dependencies: (1) {crId, stId} -> grade, (2) stId -> stName, and (3) crId -> {fId, room}. Step-by-step convert this relation into Second Normal Form (2NF).',
    correct: 'Identify partial dependencies: stId -> stName and crId -> {fId, room}. Decompose into 3 relations: STUDENT(stId, stName), COURSE(crId, fId, room), and ENROLLMENT(crId, stId, grade).',
    explanation: `<p><strong>Step-by-Step Conversion to Second Normal Form (2NF):</strong></p>
<p><strong>1. Given Relation Schema:</strong><br>
<code>CLASS(crId, stId, stName, fId, room, grade)</code><br>
Composite Primary Key: <code>{crId, stId}</code></p>

<p><strong>2. Functional Dependency Analysis:</strong></p>
<ul>
  <li><strong>FD1:</strong> <code>{crId, stId} &rarr; grade</code>: Fully functionally dependent on the entire composite primary key.</li>
  <li><strong>FD2:</strong> <code>stId &rarr; stName</code>: <code>stName</code> depends only on <code>stId</code> (a subset of the composite key). This is a <strong>Partial Dependency</strong>.</li>
  <li><strong>FD3:</strong> <code>crId &rarr; {fId, room}</code>: <code>fId</code> and <code>room</code> depend only on <code>crId</code> (a subset of the composite key). This is also a <strong>Partial Dependency</strong>.</li>
</ul>

<p><strong>3. Decomposition into 2NF:</strong><br>
Remove the partial dependencies by isolating each determinant into its own relation with its dependent attributes:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Relation Name</th>
      <th>Attributes</th>
      <th>Primary Key</th>
      <th>Foreign Key(s)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>STUDENT</strong></td>
      <td><code>(stId, stName)</code></td>
      <td><code>stId</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td><strong>COURSE</strong></td>
      <td><code>(crId, fId, room)</code></td>
      <td><code>crId</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td><strong>ENROLLMENT</strong></td>
      <td><code>(crId, stId, grade)</code></td>
      <td><code>{crId, stId}</code></td>
      <td><code>crId</code> references COURSE, <code>stId</code> references STUDENT</td>
    </tr>
  </tbody>
</table>
<p>Each newly created table is in 2NF because all non-key attributes are fully functionally dependent on their respective primary keys.</p>`,
    urdu_answer: 'مسئلہ 1 کا حل: کلاس ریلیشن میں stName صرف stId پر اور fId، room صرف crId پر منحصر ہیں جو کہ پارشل ڈیپینڈینسیز ہیں۔ 2NF حاصل کرنے کے لیے تین ٹیبلز بنیں گے: STUDENT(stId, stName)، COURSE(crId, fId, room)، اور ENROLLMENT(crId, stId, grade)۔ اس طرح تمام نان-کی ایٹریبیوٹس اپنی متعلقہ پرائمری کی پر مکمل طور پر ڈیپینڈنٹ ہو جاتے ہیں۔'
  },
  {
    stem: 'Numerical / Problem-Solving Question 2: Consider relation Interview(CandidateNo, InterviewDate, InterviewTime, StaffNo, RoomNo) with functional dependencies: FD1: {CandidateNo, InterviewDate} -> {InterviewTime, StaffNo, RoomNo}, FD2: {RoomNo, InterviewDate, InterviewTime} -> {StaffNo, CandidateNo}, FD3: {StaffNo, InterviewDate} -> RoomNo. Determine which normal form Interview is in and provide full justification.',
    correct: 'Interview is in 3NF. It satisfies 1NF (atomic values) and 2NF (no partial dependencies on candidate keys). In FD3, StaffNo, InterviewDate is not a candidate key, but RoomNo is a prime attribute (part of candidate key FD2), satisfying 3NF. It is not in BCNF because StaffNo, InterviewDate is not a superkey.',
    explanation: `<p><strong>Normal Form Determination and Analysis for Interview Relation:</strong></p>

<p><strong>1. Identification of Candidate Keys:</strong></p>
<ul>
  <li>From <strong>FD1</strong>: <code>{CandidateNo, InterviewDate}</code> determines all attributes &rarr; <strong>Candidate Key 1</strong>.</li>
  <li>From <strong>FD2</strong>: <code>{RoomNo, InterviewDate, InterviewTime}</code> determines all attributes &rarr; <strong>Candidate Key 2</strong>.</li>
  <li>From <strong>FD3</strong> combined with FD2: Since <code>{StaffNo, InterviewDate} &rarr; RoomNo</code>, <code>{StaffNo, InterviewDate, InterviewTime}</code> determines all attributes &rarr; <strong>Candidate Key 3</strong>.</li>
</ul>

<p><strong>2. Prime vs. Non-Prime Attributes:</strong></p>
<ul>
  <li><strong>Prime Attributes</strong> (part of at least one candidate key): <code>CandidateNo</code>, <code>InterviewDate</code>, <code>InterviewTime</code>, <code>StaffNo</code>, <code>RoomNo</code>.</li>
  <li><strong>Non-Prime Attributes:</strong> None (every attribute is part of at least one candidate key!).</li>
</ul>

<p><strong>3. Normal Form Verification:</strong></p>
<ul>
  <li><strong>1NF:</strong> Yes, all attribute values are atomic.</li>
  <li><strong>2NF:</strong> Yes, because there are no non-prime attributes to be partially dependent.</li>
  <li><strong>3NF:</strong> Yes, for every functional dependency <code>X &rarr; Y</code>, either <code>X</code> is a candidate key OR <code>Y</code> is a prime attribute. In FD3 (<code>{StaffNo, InterviewDate} &rarr; RoomNo</code>), <code>RoomNo</code> is a prime attribute, so 3NF is strictly satisfied.</li>
  <li><strong>BCNF:</strong> <strong>No</strong>, because in FD3, the determinant <code>{StaffNo, InterviewDate}</code> is NOT a superkey (it cannot determine <code>CandidateNo</code> or <code>InterviewTime</code> alone).</li>
</ul>
<p><strong>Final Conclusion:</strong> The relation <code>Interview</code> is in <strong>Third Normal Form (3NF)</strong>, but NOT in BCNF.</p>`,
    urdu_answer: 'مسئلہ 2 کا تجزیہ اور نتیجہ: ریلیشن Interview تیسری نارمل فارم (3NF) میں ہے۔ تمام ایٹریبیوٹس کسی نہ کسی کینڈیڈیٹ کی کا حصہ ہیں (یعنی پرائم ایٹریبیوٹس ہیں)، اس لیے پارشل یا ٹرانزیٹیو ڈیپینڈینسی کا سوال ہی پیدا نہیں ہوتا اور یہ 3NF کی شرائط پوری کرتی ہے۔ چونکہ FD3 کا ڈیٹرمیننٹ {StaffNo, InterviewDate} کینڈیڈیٹ کی نہیں ہے، اس لیے یہ BCNF میں نہیں ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 20.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 20 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

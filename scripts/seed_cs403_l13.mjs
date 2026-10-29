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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(cs403.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'The Relational Data Model: Relations, Tuples, Attributes & Domains')
  `).run(cs403.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`CS403 Lecture 13 found with ID: ${lec13.id}`);
}

// 3. Clear existing questions for Lecture 13 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec13.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 13.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Relational Data Model (RDM) is simple because there is just one core structure, and that is __________.',
    options: {
      a: 'A relation or a table',
      b: 'E-R model',
      c: 'Attributes',
      d: 'Data model'
    },
    correct: 'a',
    explanation: 'The elegance of the Relational Data Model lies in its structural simplicity: a single uniform construct, the relation (table), is used to represent both entities and relationships (CS403 Handouts Page 126–127). Appeared 5 times in EducationGator (Q76), JUNAID (Q76), Cs403 Quiz 1 (Q111), and MCS group (Q252).',
    urdu_answer: 'ریلیشنل ڈیٹا ماڈل میں ڈیٹا اور تعلقات کو ظاہر کرنے کے لیے صرف ایک ہی مرکزی ڈھانچہ استعمال ہوتا ہے جسے ریلیشن یا ٹیبل کہتے ہیں۔'
  },
  {
    stem: 'In the relational model, the number of attributes and the number of tuples in a relation are termed as __________ and __________ respectively.',
    options: {
      a: 'Degree, Cardinality',
      b: 'Cardinality, Degree',
      c: 'Row, Column',
      d: 'Domain, Schema'
    },
    correct: 'a',
    explanation: 'In relational terminology, the number of attributes (columns) is defined as the Degree of the relation, while the number of tuples (rows) is defined as the Cardinality (CS403 Handouts Page 129). Appeared 5 times in Cs403 Quiz 1 (Q120), Lec 1-10 (Q137), and MCS group.',
    urdu_answer: 'کالمز کی کل تعداد کو ڈگری (Degree) اور قطاروں کی کل تعداد کو کارڈینالٹی (Cardinality) کہا جاتا ہے۔'
  },
  {
    stem: 'Which of the following is TRUE about relational schemas / tables?',
    options: {
      a: 'The sequence of columns is significant',
      b: 'The sequence of rows is significant',
      c: 'Contains only derived attributes',
      d: 'Values are atomic'
    },
    correct: 'd',
    explanation: 'A fundamental rule of relational database design is the first normal form requirement: every attribute value in every cell must be atomic (single, indivisible value) (CS403 Handouts Page 127). Appeared 5 times in Mega File (Page 13) and Moaaz past files.',
    urdu_answer: 'ریلیشنل ٹیبل کے ہر خانے میں موجود قیمت ایٹامک (غیر منقسم سنگل ویلیو) ہونی چاہیے۔'
  },
  {
    stem: 'Which of the following is NOT true about relational tables?',
    options: {
      a: 'Column values are of the same kind',
      b: 'Each row is unique',
      c: 'Each column must have a unique name',
      d: 'The sequence of rows is significant'
    },
    correct: 'd',
    explanation: 'Because a relation is mathematically a set of unordered tuples, the physical or logical sequence of rows (and columns) is completely insignificant. Stating that the sequence of rows is significant is false (CS403 Handouts Page 127–128). Appeared 5 times in Mega File (Page 2) and Moaaz (Spring 2010, Q6).',
    urdu_answer: 'یہ بات غلط ہے کہ قطاروں کی ترتیب اہم ہوتی ہے؛ حقیقت میں قطاروں اور کالموں کی ترتیب بالکل غیر اہم ہوتی ہے۔'
  },
  {
    stem: 'A relation (from the relational database model) consists of a set of tuples, which implies that __________.',
    options: {
      a: 'All tuples in a relation must be distinct',
      b: 'Relational model supports multi-valued attributes represented in sets',
      c: 'For any two tuples, values associated with all attributes may be duplicate',
      d: 'Sequence of tuples is significant'
    },
    correct: 'a',
    explanation: 'Since a mathematical set cannot contain duplicate elements by definition, a relation defined as a set of tuples requires that every tuple within it must be distinct (unique) (CS403 Handouts Page 129). Appeared 4 times in Moaaz (Session 4, Q4).',
    urdu_answer: 'کیونکہ ریلیشن ٹیپلز کا ایک سیٹ ہوتا ہے اس لیے تمام ٹیپلز (قطاریں) لازمی طور پر ایک دوسرے سے منفرد ہونی چاہئیں۔'
  },
  {
    stem: 'Consider two sets A and B. Set A contains 3 elements and Set B contains 4 elements. How many elements does their Cartesian product contain?',
    options: {
      a: '7',
      b: '9',
      c: '12',
      d: '16'
    },
    correct: 'c',
    explanation: 'The size of the Cartesian product $A \\times B$ is the product of their cardinalities: $|A| \\times |B| = 3 \\times 4 = 12$ ordered pairs (CS403 Handouts Page 129). Appeared 4 times in Waqar Sidhu (File 1, Q13) and Moaaz.',
    urdu_answer: 'سیٹ A اور B کے کارٹیشین پروڈکٹ کے ارکان کی تعداد 3 ضرب 4 برابر 12 ہوگی۔'
  },
  {
    stem: 'Suppose a relation has 5 columns and 10 rows. Select the correct option to identify the CARDINALITY of the relation.',
    options: {
      a: 'Five',
      b: 'Ten',
      c: 'Fifteen',
      d: 'Fifty'
    },
    correct: 'b',
    explanation: 'Cardinality of a relation refers to the total number of records (rows/tuples) stored within it, which is 10 (CS403 Handouts Page 129). Appeared 4 times in Cs403 Quiz 1 (Q175) and MCS group (Q306).',
    urdu_answer: 'کارڈینالٹی قطاروں کی تعداد کو ظاہر کرتی ہے، لہٰذا اس کی کارڈینالٹی 10 ہے۔'
  },
  {
    stem: 'Suppose a relation has 5 columns and 10 rows. What is the DEGREE of the relation?',
    options: {
      a: 'Five',
      b: 'Ten',
      c: 'Fifteen',
      d: 'Fifty'
    },
    correct: 'a',
    explanation: 'The Degree of a relation is defined as the total number of attributes (columns) present in its schema, which is 5 (CS403 Handouts Page 129). Appeared 4 times in CS403 Handouts and Quiz 1.',
    urdu_answer: 'ڈگری کالمز کی کل تعداد کو کہتے ہیں، لہٰذا اس ٹیبل کی ڈگری 5 ہے۔'
  },
  {
    stem: 'The set of all possible atomic values that an attribute can take is called its __________.',
    options: {
      a: 'Schema',
      b: 'Domain',
      c: 'Tuple',
      d: 'Relation'
    },
    correct: 'b',
    explanation: 'A domain $D$ is a set of valid atomic scalar values from which an attribute draws its values (CS403 Handouts Page 128). Appeared 4 times in Mega File (Page 20, Q12) and Handouts.',
    urdu_answer: 'کسی ایٹریبیوٹ کی تمام ممکنہ جائز ایٹامک قیمتوں کے سیٹ کو ڈومین (Domain) کہا جاتا ہے۔'
  },
  {
    stem: 'Which of the following is NOT a component of the Relational Data Model?',
    options: {
      a: 'Relational Data Structure (Tables)',
      b: 'Relational Integrity Constraints',
      c: 'Relational Manipulation Language (Relational Algebra / SQL)',
      d: 'Physical Disk Allocation'
    },
    correct: 'd',
    explanation: 'Dr. E. F. Codd formulated the Relational Model around three pillars: (1) Data Structures, (2) Integrity Rules, and (3) Data Manipulation Language. Physical disk allocation is an operating system and physical storage issue, not part of the logical model (CS403 Handouts Page 126). Appeared 3 times in JUNAID (Q48).',
    urdu_answer: 'فزیکل ڈسک ایلوکیشن ہارڈویئر اور اسٹوریج کا اندرونی عمل ہے، یہ لاجیکل ریلیشنل ڈیٹا ماڈل کا حصہ نہیں ہے۔'
  }
];

// 5. Short Questions (including Section 4 Problem-Solving)
const shorts = [
  {
    stem: 'Define Relation, Tuple, and Attribute in the Relational Data Model.',
    correct: `<p>In the Relational Data Model (CS403 Handouts Page 127–128):</p>
<ol>
  <li><strong>Relation (Table):</strong> A two-dimensional tabular data structure composed of named columns and individual rows that represents an entity set or relationship.</li>
  <li><strong>Tuple (Row / Record):</strong> A single horizontal row in a relation representing an individual entity instance or relationship record.</li>
  <li><strong>Attribute (Column / Field):</strong> A named vertical column in a relation representing a specific property, quality, or characteristic of the entity.</li>
</ol>`,
    explanation: 'Core definitions from CS403 Handouts Page 127–128 frequently tested in Midterm exams.',
    urdu_answer: 'ریلیشن ایک دو رخی ٹیبل ہے، ٹپل اس کی افقی قطار (ریکارڈ) ہے، اور ایٹریبیوٹ اس کا عمودی کالم (خصوصیت) ہے۔'
  },
  {
    stem: 'Differentiate between Degree and Cardinality of a Relation with an example.',
    correct: `<p><strong>Degree vs. Cardinality (CS403 Handouts Page 129):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Term</th>
      <th class="p-2 border">Definition</th>
      <th class="p-2 border">Example Scenario</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Degree</td>
      <td class="p-2 border">The total number of <strong>attributes (columns)</strong> in a relation schema.</td>
      <td class="p-2 border">A table with columns <code>(RollNo, Name, Email, Phone)</code> has <strong>Degree = 4</strong>.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Cardinality</td>
      <td class="p-2 border">The total number of <strong>tuples (rows / records)</strong> currently stored in a relation.</td>
      <td class="p-2 border">If the table currently contains 120 student records, its <strong>Cardinality = 120</strong>.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Key distinction from CS403 Handouts Page 129 and Mega File Page 20.',
    urdu_answer: 'ڈگری کالمز کی تعداد ہوتی ہے جو عموماً مستقل رہتی ہے، جبکہ کارڈینالٹی قطاروں یا ریکارڈز کی تعداد ہوتی ہے جو نئے ڈیٹا کے آنے سے تبدیل ہوتی رہتی ہے۔'
  },
  {
    stem: 'Define the Domain of an Attribute with an example.',
    correct: `<p><strong>Domain of an Attribute (CS403 Handouts Page 128):</strong></p>
<p>A <strong>domain</strong> is the set of all allowable, atomic scalar values that a specific attribute can legally contain.</p>
<ul>
  <li>It establishes the data type, allowable range, and semantic meaning for the attribute.</li>
  <li><strong>Example 1:</strong> The domain for attribute <em>Gender</em> might be strictly restricted to <code>{'Male', 'Female'}</code>.</li>
  <li><strong>Example 2:</strong> The domain for attribute <em>Student_Age</em> might be positive integers defined in the range $15 \\le \\text{Age} \\le 60$.</li>
</ul>`,
    explanation: 'Domain concept from CS403 Handouts Page 128 and Mega File Page 20, Q12.',
    urdu_answer: 'ڈومین سے مراد وہ تمام جائز اور ممکنہ ایٹامک قیمتیں ہیں جو کوئی ایٹریبیوٹ لے سکتا ہے، جیسے صنف کے لیے صرف Male یا Female۔'
  },
  {
    stem: 'List four essential mathematical properties of a Relational Table.',
    correct: `<p>A relational table conforms to strict mathematical set properties (CS403 Handouts Page 127–129):</p>
<ol>
  <li><strong>Atomic Values:</strong> Every intersection of a row and column (cell) contains strictly one indivisible (atomic) value.</li>
  <li><strong>Distinct Tuples:</strong> No two rows can be exact duplicates; each tuple in a relation is uniquely identifiable (typically by a primary key).</li>
  <li><strong>Order Insignificance:</strong> The physical and logical order of rows (tuples) and columns (attributes) is completely immaterial.</li>
  <li><strong>Unique Column Names:</strong> Each attribute in a relation must possess a distinct, unique identifier name.</li>
  <li><strong>Consistent Domains:</strong> All values stored in a particular column are drawn from the exact same domain.</li>
</ol>`,
    explanation: 'Core properties of relational tables from CS403 Handouts Page 127–129.',
    urdu_answer: 'چار اہم خصوصیات: 1. ہر خانے میں سنگل ایٹامک ویلیو ہو، 2. کوئی ڈپلیکیٹ قطار نہ ہو، 3. قطاروں اور کالموں کی ترتیب غیر اہم ہو، 4. ہر کالم کا نام منفرد ہو۔'
  },
  {
    stem: 'Problem: Consider set $A = \\{1, 2, 3\\}$ ($3$ elements) and set $B = \\{a, b, c, d\\}$ ($4$ elements). Calculate the total number of tuples in their Cartesian Product $A \\times B$.',
    correct: `<p><strong>Cartesian Product Calculation:</strong></p>
<p>Given:</p>
<ul>
  <li>Set $A = \\{1, 2, 3\\} \\implies |A| = 3$</li>
  <li>Set $B = \\{a, b, c, d\\} \\implies |B| = 4$</li>
</ul>
<p><strong>Formula:</strong></p>
$$\\text{Total Tuples in } A \\times B = |A| \\times |B|$$
<p><strong>Calculation:</strong></p>
$$\\text{Total Tuples} = 3 \\times 4 = 12 \\text{ ordered pairs.}$$
<p>The resulting Cartesian product consists of the set:</p>
<pre><code>{(1, a), (1, b), (1, c), (1, d),
 (2, a), (2, b), (2, c), (2, d),
 (3, a), (3, b), (3, c), (3, d)}</code></pre>`,
    explanation: 'Numerical calculation from CS403 Midterm Solved McQs Papers By Waqar Sidhu (File 1, Q13) and Moaaz Page 25.',
    urdu_answer: 'کارٹیشین پروڈکٹ کے ارکان کی کل تعداد دونوں سیٹوں کے ارکان کا ضرب ہے: 3 ضرب 4 = 12 جوڑے (tuples)۔'
  },
  {
    stem: 'Problem: Given a relation EMPLOYEE(EmpID, EmpName, Department, Salary, HiredDate) containing $25$ employee records. Identify its Degree and Cardinality.',
    correct: `<p><strong>Determining Degree and Cardinality:</strong></p>
<p>Given relation schema: <code>EMPLOYEE(EmpID, EmpName, Department, Salary, HiredDate)</code> containing $25$ rows.</p>
<ol>
  <li><strong>Degree:</strong>
    <ul>
      <li>Degree is the count of attributes (columns) in the schema.</li>
      <li>Attributes: <em>EmpID</em>, <em>EmpName</em>, <em>Department</em>, <em>Salary</em>, <em>HiredDate</em> (Total = 5 attributes).</li>
      <li><strong>Degree = 5</strong></li>
    </ul>
  </li>
  <li><strong>Cardinality:</strong>
    <ul>
      <li>Cardinality is the total number of tuples (rows / records) present in the table instance.</li>
      <li>Number of records = 25.</li>
      <li><strong>Cardinality = 25</strong></li>
    </ul>
  </li>
</ol>`,
    explanation: 'Direct practical problem from CS403 Handouts Page 129.',
    urdu_answer: 'اس ٹیبل میں 5 کالمز ہیں لہٰذا ڈگری = 5، اور 25 ملازمین کے ریکارڈز ہیں لہٰذا کارڈینالٹی = 25 ہے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Explain the Relational Data Model (RDM) and its mathematical background (Cartesian Product & Subsets).',
    correct: `<p><strong>The Relational Data Model (RDM) and Mathematical Foundation:</strong></p>
<p>Introduced by Dr. E. F. Codd in 1970 at IBM, the Relational Data Model represents data in the form of mathematical relations (tables) with sound theoretical underpinnings (CS403 Handouts Page 126–131).</p>

<h4>1. Three Core Components of RDM:</h4>
<ol>
  <li><strong>Data Structure:</strong> Data is organized entirely into two-dimensional relations consisting of named attributes and ordered tuples.</li>
  <li><strong>Data Integrity:</strong> Constraints (Entity Integrity, Referential Integrity, Domain Constraints) guarantee business rules and consistency.</li>
  <li><strong>Data Manipulation:</strong> Formal languages (Relational Algebra and Relational Calculus) allow rigorous querying and data transformations.</li>
</ol>

<h4>2. Mathematical Formalization (Cartesian Product &amp; Subsets):</h4>
<p>Let $D_1, D_2, \\dots, D_n$ be $n$ domains (sets of values). The <strong>Cartesian Product</strong> is the set of all possible ordered $n$-tuples:</p>
$$D_1 \\times D_2 \\times \\dots \\times D_n = \\{ (v_1, v_2, \\dots, v_n) \\mid v_1 \\in D_1, v_2 \\in D_2, \\dots, v_n \\in D_n \\}$$
<p>A <strong>Relation $R$</strong> is mathematically defined as a <strong>subset</strong> of the Cartesian product of its attribute domains:</p>
$$R \\subseteq (D_1 \\times D_2 \\times \\dots \\times D_n)$$
<p>This mathematical definition ensures that every row in a table is an instance of the Cartesian product that satisfies real-world validity.</p>

<h4>3. Comparison: Mathematical Terms vs. Practical Database Terms:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Mathematical Concept</th>
      <th class="p-2 border">Relational Database Concept</th>
      <th class="p-2 border">Physical Implementation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Relation</td>
      <td class="p-2 border">Table / Entity Type</td>
      <td class="p-2 border">File / Table Store</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Tuple</td>
      <td class="p-2 border">Row / Record</td>
      <td class="p-2 border">Data Block Record</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Attribute</td>
      <td class="p-2 border">Column / Field</td>
      <td class="p-2 border">Named Field / Byte Offset</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Domain</td>
      <td class="p-2 border">Data Type / Set of Legal Values</td>
      <td class="p-2 border">Column Constraint / Type Check</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Relation Schema $R(A_1, \\dots, A_n)$</td>
      <td class="p-2 border">Table Structure Definition</td>
      <td class="p-2 border">DDL <code>CREATE TABLE</code> specification</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive 5-mark subjective question covering Dr. Codd\'s formal model, Cartesian products, and domain subsets from CS403 Handouts Page 126–131.',
    urdu_answer: 'ڈاکٹر ای ایف کوڈ نے 1970 میں ریلیشنل ماڈل پیش کیا۔ ریاضیاتی اعتبار سے ایک ریلیشن مختلف ڈومینز کے کارٹیشین پروڈکٹ کا ذیلی سیٹ (subset) ہوتا ہے۔ اس کے تین حصے ہیں: ڈھانچہ، سالمیت کے اصول اور مینیپولیشن زبان۔'
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
    insMcq.run(lec13.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec13.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec13.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into CS403 Lecture 13:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short / Numerical Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for CS403 Lecture 13: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

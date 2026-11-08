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

// 2. Create or fetch Lecture 19 for CS403
let lec19 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 19").get(cs403.id);
if (!lec19) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 19, 'First Normal Form (1NF) and Rule of Atomicity')
  `).run(cs403.id);
  lec19 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 19 with ID: ${lec19.id}`);
} else {
  console.log(`CS403 Lecture 19 found with ID: ${lec19.id}`);
}

const lId = lec19.id;

// 3. Clear existing questions for Lecture 19 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 19.`);

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

// 10 MCQs
const mcqs = [
  {
    stem: 'Which of the following conditions enforces a relation into First Normal Form (1NF)?',
    options: {
      a: 'The domain of attribute must include only atomic values',
      b: 'Every non-key attribute is fully functionally dependent on primary key',
      c: 'Non-key attribute is non-transitively dependent on primary key',
      d: 'Every non-key attribute is partially dependent on super key'
    },
    correct: 'a',
    explanation: '<p>A relation is in <strong>First Normal Form (1NF)</strong> if and only if the domain of each attribute contains only <strong>atomic (indivisible) values</strong> and there are no repeating groups or multi-valued attributes (CS403 Handouts Page 167). Appeared 6 times.</p>',
    urdu_answer: 'پہلی نارمل فارم (1NF) کی لازمی شرط یہ ہے کہ ہر ایٹریبیوٹ کی ویلیو ایٹامک (ناقابل تقسیم یا واحد قیمت) ہونی چاہیے اور کوئی ملٹی ویلیوڈ یا ریپیٹنگ گروپس موجود نہ ہوں۔'
  },
  {
    stem: 'In ______, the domains of attributes of a relation are atomic, that is they consist of single units that cannot be broken down further.',
    options: {
      a: 'First normal form',
      b: 'Second normal form',
      c: 'Third normal form',
      d: 'Augmentation'
    },
    correct: 'a',
    explanation: '<p>In <strong>First Normal Form (1NF)</strong>, attribute domains are atomic, meaning every attribute holds single scalar units that cannot be broken down into sub-elements (CS403 Handouts Page 167). Appeared 5 times.</p>',
    urdu_answer: 'فرسٹ نارمل فارم (1NF) میں تمام ایٹریبیوٹس کے ڈومینز ایٹامک ہوتے ہیں، یعنی وہ واحد اکائی پر مشتمل ہوتے ہیں جنہیں مزید ذیلی حصوں میں نہیں توڑا جا سکتا۔'
  },
  {
    stem: 'Atomicity of attribute values is a defining feature of ______.',
    options: {
      a: '1NF',
      b: '2NF',
      c: '3NF',
      d: 'BCNF'
    },
    correct: 'a',
    explanation: '<p><strong>Atomicity</strong> is the fundamental characteristic requirement of <strong>1NF</strong>. A relation violates 1NF if any attribute contains non-atomic values (CS403 Handouts Page 167). Appeared 5 times.</p>',
    urdu_answer: 'ایٹامیسٹی (Atomicity) بنیادی طور پر پہلی نارمل فارم (1NF) کی بنیادی اور لازمی خصوصیت ہے۔'
  },
  {
    stem: 'Each ______ of a table in First Normal Form (1NF) must contain an atomic (single) value.',
    options: {
      a: 'Cell',
      b: 'Row',
      c: 'Column',
      d: 'Record'
    },
    correct: 'a',
    explanation: '<p>In 1NF, every individual intersection of a row and a column—referred to as a <strong>cell</strong>—must contain exactly one atomic single value, with no lists, arrays, or sets (CS403 Handouts Page 167). Appeared 4 times.</p>',
    urdu_answer: 'پہلی نارمل فارم (1NF) کے جدول کا ہر خانہ (Cell) صرف اور صرف ایک ہی واحد (ایٹامک) ویلیو پر مشتمل ہونا ضروری ہے۔'
  },
  {
    stem: 'In which normal form do we convert composite attributes into individual simple attributes?',
    options: {
      a: '1NF',
      b: '2NF',
      c: '3NF',
      d: 'BCNF'
    },
    correct: 'a',
    explanation: '<p>Composite attributes (e.g., <code>Name</code> consisting of <code>First_Name, Last_Name</code> or <code>Address</code> consisting of <code>Street, City, PostalCode</code>) violate atomicity and are decomposed into individual simple attributes during <strong>1NF conversion</strong> (CS403 Handouts Page 167). Appeared 4 times.</p>',
    urdu_answer: 'پہلی نارمل فارم (1NF) میں کمپوزٹ ایٹریبیوٹس (جیسے نام یا پتہ) کو توڑ کر انفرادی سادہ ایٹریبیوٹس میں تبدیل کیا جاتا ہے تاکہ ایٹامیسٹی برقرار رہے۔'
  },
  {
    stem: 'A relation is in First Normal Form (1NF) if and only if every attribute is ______ for each tuple.',
    options: {
      a: 'Single-valued',
      b: 'Multi-valued',
      c: 'Composite',
      d: 'Derived'
    },
    correct: 'a',
    explanation: '<p>Every attribute in a 1NF relation must be strictly <strong>single-valued</strong> per row (tuple), ruling out multiple phone numbers, book IDs, or hobbies in a single attribute entry (CS403 Handouts Page 167). Appeared 4 times.</p>',
    urdu_answer: 'ایک ریلیشن اس وقت 1NF میں ہوتا ہے جب ہر ٹپل (رو) کے لیے ہر ایٹریبیوٹ لازماً سنگل ویلیوڈ (واحد قیمت والا) ہو۔'
  },
  {
    stem: 'Multi-valued attributes or repeating groups in an un-normalized relation create severe complications when performing relational operations such as ______.',
    options: {
      a: 'Select and Join',
      b: 'Insert and Delete',
      c: 'Project and Union',
      d: 'Create and Drop'
    },
    correct: 'a',
    explanation: '<p>Storing multiple values within a single column entry disrupts relational algebra operations, especially <strong>SELECT (filtering)</strong> and <strong>JOIN (table matching)</strong>, as relational DBMS engines cannot index or match composite string lists efficiently (CS403 Handouts Page 167). Appeared 3 times.</p>',
    urdu_answer: 'ملٹی ویلیوڈ ایٹریبیوٹس یا ریپیٹنگ گروپس ریلیشنل الجبرا کے آپریشنز بالخصوص سلیکٹ (Select) اور جوائن (Join) میں شدید پیچیدگیاں اور خامیاں پیدا کرتے ہیں۔'
  },
  {
    stem: 'Which of the following is an example of a multi-valued attribute that causes a table to violate 1NF if placed into a single cell?',
    options: {
      a: 'Student_ID',
      b: 'Student_Hobby (or Book_ID list)',
      c: 'Student_Class',
      d: 'Student_Semester'
    },
    correct: 'b',
    explanation: '<p>Attributes like <strong>Student_Hobby</strong> (e.g. Cricket, Music, Reading) or a list of borrowed <strong>Book_IDs</strong> (e.g. B08945, B06352) store multiple values per entity, violating 1NF atomicity if entered in a single cell (CS403 Handouts Page 167). Appeared 3 times.</p>',
    urdu_answer: 'ہابی (Hobby) یا جاری شدہ کتب کی لسٹ (Book_IDs) ملٹی ویلیوڈ ایٹریبیوٹس ہیں جنہیں ایک ہی سیل میں رکھنے سے 1NF کی خلاف ورزی ہوتی ہے۔'
  },
  {
    stem: 'A relational table that contains repeating groups or multi-valued attributes in its columns is classified as a/an ______ relation.',
    options: {
      a: 'Un-normalized (UNF)',
      b: 'First normal form (1NF)',
      c: 'Fully normalized',
      d: 'Third normal form (3NF)'
    },
    correct: 'a',
    explanation: '<p>A table structure containing repeating groups, multi-valued attributes, or nested tables is known as an <strong>Un-normalized Relation (UNF)</strong>. It must undergo 1NF decomposition before relational normalization continues (CS403 Handouts Page 167). Appeared 4 times.</p>',
    urdu_answer: 'ایسا جدول جس میں ریپیٹنگ گروپس یا ملٹی ویلیوڈ ایٹریبیوٹس موجود ہوں، غیر نارملائزڈ ریلیشن (Un-normalized Relation) کہلاتا ہے۔'
  },
  {
    stem: 'When an un-normalized relation with repeating groups is converted to 1NF using the row flattening method, the primary key of the resulting 1NF relation typically becomes a ______.',
    options: {
      a: 'Simple primary key',
      b: 'Composite primary key',
      c: 'Foreign key only without uniqueness',
      d: 'Candidate key without determinant'
    },
    correct: 'b',
    explanation: '<p>In row flattening, the original primary key is combined with the repeating attribute to create a <strong>composite primary key</strong> (such as <code>{stId, bkId}</code>) to guarantee row uniqueness (CS403 Handouts Page 168). Appeared 4 times.</p>',
    urdu_answer: 'جب قطاروں کو پھیلا کر 1NF حاصل کی جائے تو نئے ٹیبل کی پرائمری کی عام طور پر ایک کمپوزٹ پرائمری کی (Composite Primary Key) بن جاتی ہے تاکہ ہر رو منفرد ہو۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 19.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define First Normal Form (1NF). What is meant by the rule of "Atomic Values"?',
    correct: 'A relation is in 1NF if and only if every attribute in every tuple contains a single, indivisible (atomic) value. Atomic values consist of single units that cannot be decomposed into sub-components.',
    explanation: `<p><strong>First Normal Form (1NF) Definition:</strong><br>
A relation is in <strong>First Normal Form (1NF)</strong> if and only if the domain of each attribute contains only <strong>atomic</strong> (indivisible) values, and there are no repeating groups or multi-valued attributes in any tuple.</p>
<p><strong>Rule of Atomicity:</strong></p>
<ul>
  <li><strong>Indivisible Units:</strong> A value is atomic if it represents a single, independent piece of data that cannot or should not be logically broken down further in the database schema.</li>
  <li><strong>No Arrays or Sets:</strong> Storing sets, arrays, or comma-separated lists (e.g., <code>"Cricket, Reading"</code> or <code>"B08945, B06352"</code>) in a single cell violates atomicity.</li>
  <li><strong>No Composite Attributes:</strong> Attributes like <code>Full_Address</code> must be decomposed into atomic parts (e.g., <code>Street, City, ZipCode</code>).</li>
</ul>`,
    urdu_answer: 'فرسٹ نارمل فارم (1NF) کی تعریف: ایک ریلیشن 1NF میں اس وقت ہوتا ہے جب اس کے ہر کالم میں موجود ہر قیمت ایٹامک (ناقابل تقسیم اور واحد) ہو۔ ایٹامک ویلیوز سے مراد ایسی واحد قیمتیں ہیں جن کے مزید حصے نہ کیے جا سکیں، یعنی کسی بھی سیل میں کومے والی لسٹ یا سیٹ رکھنے کی اجازت نہیں ہوتی۔'
  },
  {
    stem: 'What are Repeating Groups (Multi-valued Attributes)? Why are they strictly prohibited in 1NF?',
    correct: 'Repeating groups are multiple values of the same attribute stored for a single entity instance. They are prohibited because they violate relational algebra foundations, make indexing impossible, and cause query anomalies during SELECT and JOIN operations.',
    explanation: `<p><strong>Repeating Groups (Multi-valued Attributes):</strong></p>
<p>A <strong>repeating group</strong> is a set of one or more data items that can occur multiple times within a single record or tuple. For instance, a single student record containing multiple phone numbers or a list of borrowed library books (<code>B01, B02, B03</code>).</p>
<p><strong>Why Repeating Groups are Prohibited in 1NF:</strong></p>
<ol>
  <li><strong>Relational Algebra Incompatibility:</strong> Relational operations (like <code>SELECT</code>, <code>PROJECT</code>, and <code>JOIN</code>) assume that each row-column intersection is an atomic scalar value.</li>
  <li><strong>Search & Filter Inefficiencies:</strong> Querying whether a student borrowed book <code>B02</code> requires pattern-matching substring scans (e.g., <code>LIKE '%B02%'</code>) instead of fast B-tree index lookups.</li>
  <li><strong>Storage & Redundancy Issues:</strong> Storing variable-length text lists causes storage fragmentation and update anomalies when modifying individual elements.</li>
</ol>`,
    urdu_answer: 'ریپیٹنگ گروپس (Repeating Groups) سے مراد ایک ہی ریکارڈ کے اندر کسی ایٹریبیوٹ کی ایک سے زیادہ قیمتوں کا جمع ہونا ہے۔ 1NF میں ان پر مکمل پابندی ہے کیونکہ یہ ریلیشنل الجبرا کے اصولوں کی خلاف ورزی کرتے ہیں، انڈیکسنگ کو ناممکن بناتے ہیں اور سرچنگ، سلیکٹ اور جوائن کے آپریشنز کو سست اور خراب کر دیتے ہیں۔'
  },
  {
    stem: 'How do you convert an un-normalized relation containing repeating groups into 1NF? Explain the two primary conversion methods.',
    correct: '1NF conversion can be performed via: (1) The Row Flattening Method (replicating non-repeating attributes and creating a separate row for each repeating value, forming a composite primary key), or (2) The Table Splitting Method (moving the repeating group into a new relation with the parent entity primary key as a foreign key).',
    explanation: `<p>An un-normalized relation (UNF) with repeating groups can be transformed into 1NF using two standard techniques:</p>
<ol>
  <li><strong>Method 1: Row Flattening (Expanding Tuples):</strong>
    <ul>
      <li>Replicate the non-repeating attributes across multiple rows so that each repeating attribute value occupies its own individual row.</li>
      <li>Establish a <strong>composite primary key</strong> comprising the original entity identifier and the repeating attribute identifier (e.g., <code>{Student_ID, Book_ID}</code>).</li>
    </ul>
  </li>
  <li><strong>Method 2: Table Splitting (Relation Decomposition):</strong>
    <ul>
      <li>Remove the repeating group from the original relation and place it into a newly created separate relation.</li>
      <li>Include the primary key of the original entity inside the new relation as a foreign key to maintain relationship integrity.</li>
    </ul>
  </li>
</ol>`,
    urdu_answer: 'غیر نارملائزڈ ٹیبل کو 1NF میں تبدیل کرنے کے دو طریقے ہیں: (1) رو فلیٹننگ (Row Flattening): جس میں ہر ویلیو کے لیے الگ قطار بنا کر بنیادی معلومات کو دہرایا جاتا ہے اور کمپوزٹ پرائمری کی بنائی جاتی ہے۔ (2) ٹیبل اسپلٹنگ (Table Splitting): جس میں ریپیٹنگ ایٹریبیوٹ کو ایک الگ ٹیبل میں پرائمری کی کے ساتھ منتقل کر دیا جاتا ہے۔'
  },
  {
    stem: 'Differentiate between Simple Attributes and Composite Attributes in the context of 1NF atomicity. Provide an example of how composite attributes are resolved.',
    correct: 'A simple attribute consists of a single indivisible data element, whereas a composite attribute consists of multiple logical sub-components. In 1NF, composite attributes must be divided into separate simple atomic attributes.',
    explanation: `<p><strong>Simple vs. Composite Attributes:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Feature</th>
      <th>Simple Attribute</th>
      <th>Composite Attribute</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>An attribute that cannot be divided into smaller sub-parts.</td>
      <td>An attribute that can be divided into smaller sub-components.</td>
    </tr>
    <tr>
      <td><strong>Atomicity</strong></td>
      <td>Inherently atomic; complies directly with 1NF.</td>
      <td>Violates atomicity if stored as a single compound field.</td>
    </tr>
    <tr>
      <td><strong>Example</strong></td>
      <td><code>Salary</code>, <code>Age</code>, <code>CGPA</code>.</td>
      <td><code>Full_Name</code>, <code>Postal_Address</code>.</td>
    </tr>
  </tbody>
</table>
<p><strong>Resolution Example:</strong><br>
A composite attribute <code>Address</code> (e.g., <code>"House 42, St 5, F-7, Islamabad"</code>) is decomposed into individual atomic columns: <code>House_No, Street, Sector, City</code>.</p>`,
    urdu_answer: 'سادہ ایٹریبیوٹ (Simple Attribute) وہ ہوتا ہے جسے مزید ذیلی حصوں میں تقسیم نہ کیا جا سکے (جیسے عمر یا تنخواہ)، جبکہ کمپوزٹ ایٹریبیوٹ (Composite Attribute) کئی اجزاء پر مشتمل ہوتا ہے (جیسے پتہ یا پورا نام)۔ 1NF حاصل کرنے کے لیے کمپوزٹ ایٹریبیوٹ کو الگ الگ سادہ کالموں میں تقسیم کیا جاتا ہے۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 19.`);

// 3 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: 'Explain First Normal Form (1NF) in detail. Discuss its core requirements, how violations occur, and the step-by-step conversion process using a student library book allocation example.',
    correct: '1NF enforces atomic domains for all attributes. Violations occur due to multi-valued attributes and repeating groups. Conversion expands multi-valued cells into distinct tuples and forms a composite primary key {Student_ID, Book_ID}.',
    explanation: `<p><strong>First Normal Form (1NF) Comprehensive Analysis:</strong></p>
<p><strong>1. Core Concept and Requirements:</strong></p>
<ul>
  <li><strong>Atomicity Requirement:</strong> Every row-and-column intersection (cell) must contain exactly one single, indivisible scalar value.</li>
  <li><strong>No Repeating Groups:</strong> No attribute may hold a list, array, or set of values for a single record.</li>
  <li><strong>Unique Tuple Identification:</strong> Each row in the relation must be uniquely identifiable via a defined primary key.</li>
</ul>

<p><strong>2. Un-normalized Relation (UNF) Example:</strong><br>
Consider a university library issuing multiple books to students in a single table:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>stId</th>
      <th>stName</th>
      <th>stAdr</th>
      <th>prName</th>
      <th>bkId (Repeating Group)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>S1015</td>
      <td>Tahira Ejaz</td>
      <td>L Rukh Wah</td>
      <td>MCS</td>
      <td><strong>B08945, B06352</strong></td>
    </tr>
    <tr>
      <td>S1020</td>
      <td>Amir Khan</td>
      <td>Rawalpindi</td>
      <td>MIT</td>
      <td><strong>B01122</strong></td>
    </tr>
  </tbody>
</table>

<p><strong>3. Step-by-Step Conversion to 1NF (Row Flattening):</strong></p>
<ul>
  <li><strong>Step 1:</strong> Identify the repeating attribute (<code>bkId</code>).</li>
  <li><strong>Step 2:</strong> Replicate student <code>S1015</code>'s non-repeating data across two distinct rows, placing one <code>bkId</code> in each row.</li>
  <li><strong>Step 3:</strong> Establish the new composite primary key: <code>{stId, bkId}</code>.</li>
</ul>

<p><strong>Resulting 1NF Relation:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #e0f2fe;">
      <th>stId (PK)</th>
      <th>stName</th>
      <th>stAdr</th>
      <th>prName</th>
      <th>bkId (PK)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>S1015</td>
      <td>Tahira Ejaz</td>
      <td>L Rukh Wah</td>
      <td>MCS</td>
      <td>B08945</td>
    </tr>
    <tr>
      <td>S1015</td>
      <td>Tahira Ejaz</td>
      <td>L Rukh Wah</td>
      <td>MCS</td>
      <td>B06352</td>
    </tr>
    <tr>
      <td>S1020</td>
      <td>Amir Khan</td>
      <td>Rawalpindi</td>
      <td>MIT</td>
      <td>B01122</td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'پہلی نارمل فارم (1NF) کی جامع وضاحت: 1NF تمام کالموں میں ایٹامک ویلیوز کا تقاضا کرتی ہے۔ ریپیٹنگ گروپس (جیسے ایک ہی طالب علم کو جاری کردہ متعدد کتابیں) 1NF کی خلاف ورزی کرتے ہیں۔ ان کو تبدیل کرنے کے لیے ہر کتاب کی ویلیو کے لیے الگ رو بنائی جاتی ہے اور {stId, bkId} کی کمپوزٹ پرائمری کی مقرر کی جاتی ہے تاکہ ہر رو منفرد ہو جائے۔'
  },
  {
    stem: 'Numerical / Problem-Solving Question: You are given an un-normalized relation STUDENT(Student_ID, Student_Name, Father_Name, City, Hobby) where Student_ID S101 has multiple hobbies {Cricket, Music}. Show the un-normalized relation table, convert it into First Normal Form (1NF), and specify the composite primary key.',
    correct: 'The un-normalized table stores {Cricket, Music} in a single cell. In 1NF, it is decomposed into two distinct rows for S101 with a composite primary key {Student_ID, Hobby}.',
    explanation: `<p><strong>Problem-Solving Solution: Converting Un-normalized Relation to 1NF:</strong></p>
<p><strong>1. Given Un-normalized Relation (UNF):</strong><br>
The attribute <code>Hobby</code> is a multi-valued attribute storing multiple values in a single cell for student <code>S101</code>.</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #fef3c7;">
      <th>Student_ID</th>
      <th>Student_Name</th>
      <th>Father_Name</th>
      <th>City</th>
      <th>Hobby</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>S101</td>
      <td>Ali</td>
      <td>Hassan</td>
      <td>Lahore</td>
      <td><strong>Cricket, Music</strong></td>
    </tr>
    <tr>
      <td>S102</td>
      <td>Sara</td>
      <td>Tariq</td>
      <td>Karachi</td>
      <td>Reading</td>
    </tr>
  </tbody>
</table>

<p><strong>2. Conversion into First Normal Form (1NF):</strong><br>
Each hobby value is assigned its own independent tuple while replicating the scalar attributes of student <code>S101</code>:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #d1fae5;">
      <th>Student_ID (PK)</th>
      <th>Student_Name</th>
      <th>Father_Name</th>
      <th>City</th>
      <th>Hobby (PK)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>S101</td>
      <td>Ali</td>
      <td>Hassan</td>
      <td>Lahore</td>
      <td>Cricket</td>
    </tr>
    <tr>
      <td>S101</td>
      <td>Ali</td>
      <td>Hassan</td>
      <td>Lahore</td>
      <td>Music</td>
    </tr>
    <tr>
      <td>S102</td>
      <td>Sara</td>
      <td>Tariq</td>
      <td>Karachi</td>
      <td>Reading</td>
    </tr>
  </tbody>
</table>

<p><strong>3. Resulting Primary Key:</strong><br>
Because <code>Student_ID</code> alone is no longer unique (due to repeated rows for multiple hobbies), the Primary Key is defined as a <strong>Composite Primary Key</strong>: <code>{Student_ID, Hobby}</code>.</p>`,
    urdu_answer: 'حل: دی گئی غیر نارملائزڈ ٹیبل میں طالب علم S101 کی ہابیز {Cricket, Music} ایک ہی سیل میں رکھی گئی ہیں۔ 1NF میں تبدیل کرنے کے بعد S101 کے لیے دو الگ قطاریں بنیں گی (ایک کرکٹ اور دوسری میوزک کے لیے)۔ چونکہ صرف Student_ID منفرد نہیں رہی، اس لیے کمپوزٹ پرائمری کی {Student_ID, Hobby} بنے گی۔'
  },
  {
    stem: 'Analyze the database anomalies, storage inefficiencies, and relational algebra limitations caused by violating 1NF. How does converting to 1NF resolve these issues?',
    correct: 'Violating 1NF introduces complex string search overhead, prevents DBMS index optimization, complicates JOIN operations, and causes update anomalies when modifying individual elements of multi-valued entries. 1NF normalizes cells to scalar values, allowing B-tree indexing and robust relational algebra.',
    explanation: `<p><strong>Comprehensive Analysis of 1NF Violations and Solutions:</strong></p>
<p><strong>1. Relational Algebra Limitations:</strong></p>
<ul>
  <li>Relational DBMS systems are built upon first-order predicate logic where relation attributes must represent single scalar elements.</li>
  <li>When multi-valued lists are stored in cells, relational operators like <code>SELECT &sigma;</code> cannot evaluate equality conditions (e.g. <code>Hobby = 'Music'</code>) directly; they require costly string parsing or regular expression searches.</li>
  <li><code>JOIN &bowtie;</code> operations cannot match attributes containing grouped lists without complex normalization functions.</li>
</ul>

<p><strong>2. Indexing and Performance Bottlenecks:</strong></p>
<ul>
  <li>Traditional database indexes (B-Tree, Hash) index individual discrete values. When multiple values occupy one cell, the index cannot index embedded tokens, degrading queries to full-table sequential scans.</li>
</ul>

<p><strong>3. Modification and Consistency Anomalies:</strong></p>
<ul>
  <li><strong>Update Anomaly:</strong> If an employee changes a single phone number in a comma-separated cell, the application must read the whole string, parse tokens, modify the target, and rewrite the string, creating concurrency lock issues.</li>
  <li><strong>Deletion Anomaly:</strong> Clearing a repeating value might accidentally truncate entire column entries if null handling is misconfigured.</li>
</ul>

<p><strong>4. Resolution Through 1NF:</strong></p>
<p>Flattening or decomposing the relation ensures that every cell holds one atomic value, enabling native B-tree indexing, O(log N) lookup speeds, and full compliance with relational integrity constraints.</p>`,
    urdu_answer: '1NF کی خلاف ورزی کے نقصانات کا تجزیہ: جب 1NF کی خلاف ورزی ہو تو ڈیٹابیس کا انڈیکس کام نہیں کرتا، سرچ کے لیے سست اسٹرنگ میچنگ کرنی پڑتی ہے، اور جوائن آپریشنز رک جاتے ہیں۔ 1NF میں تبدیل کرنے سے ہر قیمت الگ اور ایٹامک بن جاتی ہے جس سے تیز رفتار B-Tree انڈیکسنگ، سیکیور ڈیٹا انٹیگریٹی اور ریپیٹنگ گروپس کا خاتمہ ممکن ہوتا ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 19.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 19 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

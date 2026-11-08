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

// 2. Create or fetch Lecture 14 for CS403
let lec14 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 14").get(cs403.id);
if (!lec14) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 14, 'Relational Keys and Integrity Constraints')
  `).run(cs403.id);
  lec14 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 14 with ID: ${lec14.id}`);
} else {
  console.log(`CS403 Lecture 14 found with ID: ${lec14.id}`);
}

const lId = lec14.id;

// 3. Clear existing questions for Lecture 14 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 14.`);

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
    stem: 'A super key for which no proper subset is also a super key is defined as a ______ (or minimal super key).',
    options: {
      a: 'Candidate key',
      b: 'Primary key',
      c: 'Foreign key',
      d: 'Alternate key'
    },
    correct: 'a',
    explanation: '<p>A <strong>Candidate Key</strong> is defined as a minimal super key—meaning it uniquely identifies each tuple in a relation and no proper subset of its attributes possesses the uniqueness property (CS403 Handouts Page 132). Appeared 6 times across past papers.</p>',
    urdu_answer: 'کینڈیڈیٹ کی (Candidate key) کو کم از کم سپر کی (Minimal super key) کہا جاتا ہے، یعنی اس کا کوئی بھی ذیلی سیٹ اکیلے سپر کی نہیں بن سکتا۔'
  },
  {
    stem: 'In the relational database model, any combination of additional attributes with an existing super key forms a ______.',
    options: {
      a: 'Primary key',
      b: 'Foreign key',
      c: 'Super key',
      d: 'Candidate key'
    },
    correct: 'c',
    explanation: '<p>By definition, a super key uniquely identifies tuples in a relation. Adding any attribute(s) to an existing super key still uniquely identifies tuples; therefore, any superset of a super key is also a <strong>Super key</strong> (CS403 Handouts Page 132). Appeared 5 times.</p>',
    urdu_answer: 'سپر کی میں کسی بھی دوسرے ایٹری بیوٹ کا اضافہ کرنے سے حاصل ہونے والا مجموعہ بھی ہمیشہ ایک سپر کی (Super key) ہی رہتا ہے۔'
  },
  {
    stem: 'Candidate keys that are not selected by the database designer as the primary key are termed ______.',
    options: {
      a: 'Secondary keys',
      b: 'Foreign keys',
      c: 'Alternate keys',
      d: 'Composite keys'
    },
    correct: 'c',
    explanation: '<p><strong>Alternate keys</strong> are candidate keys that were not chosen as the primary key of the relation (CS403 Handouts Page 133). Appeared 5 times across past papers.</p>',
    urdu_answer: 'وہ کینڈیڈیٹ کیز جنہیں پرائمری کی کے طور پر منتخب نہیں کیا جاتا، انہیں آلٹرنیٹ کیز (Alternate keys) کہا جاتا ہے۔'
  },
  {
    stem: 'Which of the following database constraints strictly enforces Entity Integrity in the relational model?',
    options: {
      a: 'PRIMARY KEY',
      b: 'FOREIGN KEY',
      c: 'CHECK',
      d: 'DEFAULT'
    },
    correct: 'a',
    explanation: '<p><strong>Entity Integrity</strong> states that in a base relation, no attribute of a primary key can be null, ensuring that every tuple can be uniquely identified. It is enforced via the <strong>PRIMARY KEY</strong> constraint (CS403 Handouts Page 134). Appeared 7 times.</p>',
    urdu_answer: 'اینٹیٹی انٹیگریٹی (Entity integrity) کو PRIMARY KEY رکاوٹ کے ذریعے نافذ کیا جاتا ہے، جس کی رو سے پرائمری کی کبھی خالی (Null) نہیں ہو سکتی۔'
  },
  {
    stem: 'Which of the following database constraints strictly enforces Referential Integrity between related tables?',
    options: {
      a: 'FOREIGN KEY',
      b: 'CHECK',
      c: 'PRIMARY KEY',
      d: 'UNIQUE'
    },
    correct: 'a',
    explanation: '<p><strong>Referential Integrity</strong> is enforced through <strong>FOREIGN KEY</strong> constraints, ensuring that a foreign key value in a referencing table must match an existing primary key value in the referenced table or be null (CS403 Handouts Page 134). Appeared 4 times.</p>',
    urdu_answer: 'ریفرینشل انٹیگریٹی (Referential integrity) کو FOREIGN KEY کے ذریعے نافذ کیا جاتا ہے تاکہ مختلف ٹیبلز کے درمیان باہمی روابط درست رہیں۔'
  },
  {
    stem: 'If attribute K is a foreign key in relation R1 referencing relation R2, which of the following statements is unconditionally true?',
    options: {
      a: 'Every tuple of R1 must have a distinct value for K',
      b: 'K cannot have a null value for any tuple in R1',
      c: 'K is a key (primary or candidate key) for some other relation (R2)',
      d: 'K must be the primary key of R1'
    },
    correct: 'c',
    explanation: '<p>A foreign key K in relation R1 must reference a primary key (or candidate key) in another relation R2 (or in the same relation). Foreign key values in R1 do not need to be unique and can contain null values unless restricted (CS403 Handouts Page 134). Appeared 5 times.</p>',
    urdu_answer: 'اگر K ریلیشن R1 میں فارن کی ہے جو R2 کو ریفرنس کر رہی ہے، تو K لازمی طور پر ریلیشن R2 کی پرائمری یا کینڈیڈیٹ کی ہوگی۔'
  },
  {
    stem: 'Within a relational table, each primary key value ______.',
    options: {
      a: 'Must always be the first attribute defined in the table',
      b: 'Must be numeric and sequentially ordered',
      c: 'Can contain null values if the rest of the tuple is unique',
      d: 'Must be strictly unique and non-null for every record'
    },
    correct: 'd',
    explanation: '<p>The primary key must be unique across all rows in the relation, and no component attribute may contain a null value (CS403 Handouts Page 132). Appeared 4 times.</p>',
    urdu_answer: 'ٹیبل کے اندر ہر پرائمری کی کی ویلیو لازمی طور پر منفرد (Unique) اور بغیر خالی (Non-null) ہونی چاہیے۔'
  },
  {
    stem: 'Consider the attributes "CNIC_NO" and "Registration_NO" in a Student table, where both can uniquely identify a student. If the database designer selects "CNIC_NO" as the primary key, then "Registration_NO" is an/a ______ key.',
    options: {
      a: 'Foreign key',
      b: 'Secondary key',
      c: 'Primary key',
      d: 'Alternate key'
    },
    correct: 'd',
    explanation: '<p>Both CNIC_NO and Registration_NO are candidate keys. When CNIC_NO is designated as the primary key, the remaining candidate key Registration_NO becomes the <strong>Alternate key</strong> (CS403 Handouts Page 133). Appeared 4 times.</p>',
    urdu_answer: 'جب دو کینڈیڈیٹ کیز میں سے ایک (CNIC_NO) کو پرائمری کی چن لیا جائے تو دوسری کی (Registration_NO) آلٹرنیٹ کی کہلاتی ہے۔'
  },
  {
    stem: 'Which of the following is NOT a recognized type of key in the relational database model?',
    options: {
      a: 'Super key',
      b: 'Alternate key',
      c: 'Integrity constraint key',
      d: 'Primary key'
    },
    correct: 'c',
    explanation: '<p>Super key, Candidate key, Primary key, Alternate key, Foreign key, and Composite key are standard database keys. <strong>"Integrity constraint key"</strong> is not a valid key classification (CS403 Handouts Page 132–134). Appeared 5 times.</p>',
    urdu_answer: 'انٹیگریٹی کنسٹرینٹ کی (Integrity constraint key) نام کی کوئی کی ریلیشنل ماڈل میں موجود نہیں ہوتی۔'
  },
  {
    stem: 'Consider the attribute combination {CNIC, Name} for a Person table where CNIC alone is unique. Which of the following statements best describes this key?',
    options: {
      a: 'The given key is a super key and an alternate key',
      b: 'The given key is not a super key but a candidate key',
      c: 'The given key is both a super key and a candidate key',
      d: 'The given key is a super key but NOT a candidate key'
    },
    correct: 'd',
    explanation: '<p>Since CNIC uniquely identifies each row, {CNIC, Name} also uniquely identifies each row and is thus a <strong>Super Key</strong>. However, because removing "Name" still leaves a unique key ({CNIC}), {CNIC, Name} is not minimal and therefore <strong>NOT a candidate key</strong> (CS403 Handouts Page 132). Appeared 4 times.</p>',
    urdu_answer: 'چونکہ CNIC اکیلا ہی ریکارڈ کی شناخت کر سکتا ہے، اس لیے {CNIC, Name} ایک سپر کی تو ہے لیکن کم از کم (Minimal) نہ ہونے کی وجہ سے کینڈیڈیٹ کی نہیں ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'Define Primary Key and Foreign Key with a concrete database example.',
    correct: `<p>In relational database design:</p>
<ul>
  <li><strong>Primary Key:</strong> A candidate key selected by the database designer to uniquely identify each tuple (row) in a table. It cannot contain duplicate or <code>NULL</code> values.<br />
  <em>Example:</em> In table <code>STUDENT(StudentID, Name, DeptID)</code>, <code>StudentID</code> is the Primary Key.</li>
  <li><strong>Foreign Key:</strong> An attribute or combination of attributes in a relation (child table) whose values must match the primary key of another relation (parent table) or be null, establishing a logical relationship between them.<br />
  <em>Example:</em> <code>DeptID</code> in the <code>STUDENT</code> table is a Foreign Key referencing <code>DeptID</code> in the <code>DEPARTMENT</code> table.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 132–134) and CS403 Mid Term Past Papers Mega File (Page 17).</p>',
    urdu_answer: 'پرائمری کی وہ کینڈیڈیٹ کی ہے جو ٹیبل میں ہر ریکارڈ کی منفرد شناخت کرتی ہے اور اس کی ویلیو کبھی خالی (Null) نہیں ہو سکتی۔ فارن کی وہ فیلڈ ہے جو کسی دوسرے ٹیبل کی پرائمری کی سے لنک ہو کر دونوں ٹیبلز کے درمیان تعلق قائم کرتی ہے۔'
  },
  {
    stem: 'State and explain the Entity Integrity Rule and the Referential Integrity Rule in relational databases.',
    correct: `<p>Relational databases rely on two foundational structural integrity rules:</p>
<ol>
  <li><strong>Entity Integrity Rule:</strong> States that in a base relation, no attribute participating in the <em>Primary Key</em> can accept <code>NULL</code> values. Because primary keys serve to uniquely identify individual entity instances, allowing nulls would make an entity unidentifiable and ambiguous.</li>
  <li><strong>Referential Integrity Rule:</strong> States that if a relation contains a <em>Foreign Key</em>, each foreign key value must either:
    <ul>
      <li>Strictly match an existing primary key value in the referenced relation, or</li>
      <li>Be completely <code>NULL</code> (if business rules permit an unassigned relationship).</li>
    </ul>
    This prevents orphan records in child tables.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 134) and CS403 Mid Term Past Papers Mega File (Page 12, 16).</p>',
    urdu_answer: 'اینٹیٹی انٹیگریٹی رول کے مطابق پرائمری کی کا کوئی بھی حصہ کبھی خالی (Null) نہیں ہو سکتا تاکہ ہر ریکارڈ کی شناخت برقرار رہے۔ ریفرینشل انٹیگریٹی رول کے مطابق فارن کی کی ویلیو یا تو دوسرے ٹیبل کی موجودہ پرائمری کی سے ہو بہو ملنی چاہیے یا پھر خالی (Null) ہونی چاہیے تاکہ لاوارث ریکارڈز نہ بنیں۔'
  },
  {
    stem: 'Differentiate clearly between a Super Key, a Candidate Key, and an Alternate Key.',
    correct: `<p>The distinctions between these relational key types are based on uniqueness and minimality:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Key Type</th>
      <th>Uniqueness Property</th>
      <th>Minimality Property</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Super Key</strong></td>
      <td>Yes (uniquely identifies tuples)</td>
      <td>Not required (may contain extra/redundant attributes)</td>
      <td>Broadest set of unique attribute combinations.</td>
    </tr>
    <tr>
      <td><strong>Candidate Key</strong></td>
      <td>Yes (uniquely identifies tuples)</td>
      <td><strong>Strictly Minimal</strong> (no proper subset is a key)</td>
      <td>Eligible candidates to be chosen as the primary key.</td>
    </tr>
    <tr>
      <td><strong>Alternate Key</strong></td>
      <td>Yes (uniquely identifies tuples)</td>
      <td>Strictly Minimal</td>
      <td>Any candidate key <em>not selected</em> as the primary key.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 132–133).</p>',
    urdu_answer: 'سپر کی وہ تمام ایٹری بیوٹس کا سیٹ ہے جو ریکارڈ کی منفرد شناخت کر سکے (خواہ اضافی فیلڈز ہوں)۔ کینڈیڈیٹ کی وہ کم از کم سپر کی ہے جس میں سے کوئی بھی فیلڈ ہٹایا نہیں جا سکتا۔ اور آلٹرنیٹ کی وہ کینڈیڈیٹ کی ہے جسے پرائمری کی کے طور پر نہیں چنا گیا۔'
  },
  {
    stem: 'Foreign Key Linkage Analysis: Given the two tables:\n- `EMP(empId, empName, qual, depId)`\n- `DEPT(depId, depName, numEmp)`\nIdentify the Primary Key and Foreign Key in `EMP`, and explain how referential integrity is established between `EMP` and `DEPT`.',
    correct: `<p>Analysis of the schema relationships:</p>
<ol>
  <li><strong>Primary Key of EMP:</strong> <code>empId</code> (uniquely identifies each employee).</li>
  <li><strong>Foreign Key of EMP:</strong> <code>depId</code> (references the primary key <code>depId</code> of the <code>DEPT</code> table).</li>
  <li><strong>Referential Integrity Enforcement:</strong>
    <ul>
      <li>Every <code>depId</code> entered into the <code>EMP</code> table must already exist in the <code>DEPT</code> table.</li>
      <li>The DBMS will reject attempts to assign an employee to a non-existent department (e.g., entering <code>depId = 99</code> when <code>DEPT</code> only has 1, 2, 3).</li>
      <li>Deleting a department from <code>DEPT</code> that still has active employees in <code>EMP</code> is blocked or handled via cascade rules.</li>
    </ul>
  </li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Mid Term Past Papers Mega File (Page 17 Q4) and Cs403 Quiz 1 mcqs (Q18).</p>',
    urdu_answer: 'EMP ٹیبل میں پرائمری کی empId ہے اور فارن کی depId ہے۔ یہ فارن کی DEPT ٹیبل کی پرائمری کی depId سے جڑی ہوئی ہے۔ ریفرینشل انٹیگریٹی اس بات کو یقینی بناتی ہے کہ EMP میں صرف وہی شعبہ (depId) درج کیا جا سکتا ہے جو پہلے سے DEPT ٹیبل میں موجود ہو۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Write a comprehensive note on Relational Database Keys. Detail the definitions, differences, and practical roles of Super Key, Candidate Key, Primary Key, Alternate Key, Foreign Key, and Composite Key with illustrative table examples.',
    correct: `<p>In the Relational Data Model, <strong>Keys</strong> are fundamental constraints that ensure entity identity, prevent data redundancy, and establish inter-table relationships.</p>

<h4>1. Super Key:</h4>
<p>An attribute or set of attributes that uniquely identifies a tuple within a relation. It may contain redundant attributes. For example, in <code>STUDENT(RegNo, CNIC, Name, Address)</code>, both <code>{RegNo}</code> and <code>{RegNo, Name}</code> are super keys.</p>

<h4>2. Candidate Key:</h4>
<p>A <strong>minimal super key</strong>. It uniquely identifies each tuple such that no proper subset can identify the tuple. In the example above, <code>{RegNo}</code> and <code>{CNIC}</code> are candidate keys, while <code>{RegNo, Name}</code> is not minimal.</p>

<h4>3. Primary Key:</h4>
<p>The specific candidate key chosen by the database architect as the principal identifier for the relation. It enforces the <em>Entity Integrity constraint</em>: values must be unique and non-null.</p>

<h4>4. Alternate Key (Secondary Key):</h4>
<p>Any candidate key that was not chosen as the primary key. If <code>RegNo</code> is chosen as Primary Key, then <code>CNIC</code> serves as the Alternate Key.</p>

<h4>5. Foreign Key:</h4>
<p>An attribute in relation \(R_1\) that matches the primary key of relation \(R_2\). It links child and parent records, enforcing <em>Referential Integrity</em>.</p>

<h4>6. Composite Key:</h4>
<p>A primary or candidate key consisting of two or more attributes combined together. Common in associative junction tables representing M:N relationships (e.g., <code>ENROLLMENT(StudentID, CourseID, Semester)</code> where <code>{StudentID, CourseID}</code> is the composite primary key).</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 132–134) and CS403 Mid Term Past Papers Mega File.</p>',
    urdu_answer: 'ریلیشنل ڈیٹا بیس کیز کا تفصیلی نوٹ: سپر کی ہر وہ مجموعہ ہے جو ریکارڈ کی شناخت کرے؛ کینڈیڈیٹ کی کم از کم سپر کی ہوتی ہے؛ پرائمری کی وہ کینڈیڈیٹ کی ہے جسے مرکزی شناخت چنا جائے؛ آلٹرنیٹ کی باقی بچ جانے والی کینڈیڈیٹ کیز ہیں؛ فارن کی دوسرے ٹیبل سے لنک بنانے والی کی ہے؛ اور کمپوزٹ کی ایک سے زیادہ فیلڈز پر مشتمل کی ہوتی ہے۔'
  },
  {
    stem: 'Discuss Relational Integrity Constraints in detail. Explain Domain Integrity, Entity Integrity, Referential Integrity, and Enterprise Constraints, including foreign key update and deletion rules (CASCADE, SET NULL, RESTRICT).',
    correct: `<p><strong>Integrity Constraints</strong> are rules enforced by the DBMS to ensure that data remains accurate, consistent, and valid during insertions, updates, and deletions.</p>

<h4>1. Domain Integrity:</h4>
<p>Specifies that every attribute value must belong to its declared data domain (data type, format, length, and range constraints via <code>CHECK</code> conditions).</p>

<h4>2. Entity Integrity:</h4>
<p>Mandates that in a base relation, no attribute of a primary key can evaluate to <code>NULL</code>, guaranteeing distinct row identification.</p>

<h4>3. Referential Integrity:</h4>
<p>Guarantees that a foreign key value must either reference a valid, existing primary key in the parent table or be <code>NULL</code>.</p>
<h5>Foreign Key Deletion/Update Rules:</h5>
<ul>
  <li><strong>RESTRICT (NO ACTION):</strong> Rejects the deletion or update of a parent row if matching foreign key rows exist in the child table.</li>
  <li><strong>CASCADE:</strong> Automatically deletes or updates all corresponding child rows when the parent row is deleted or modified.</li>
  <li><strong>SET NULL:</strong> Sets the foreign key column in the child table to <code>NULL</code> when the referenced parent row is deleted.</li>
</ul>

<h4>4. Enterprise / Operational Constraints:</h4>
<p>Custom business rules defined by organizational policies (e.g., "A student cannot enroll in more than 6 courses per semester" or "Salary must exceed minimum wage").</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 134–136) and CS403 Mid Term Past Papers Mega File.</p>',
    urdu_answer: 'انٹیگریٹی کنسٹرینٹس کی اقسام: (1) ڈومین انٹیگریٹی (ڈیٹا ٹائپ اور رینج کی پابندی)، (2) اینٹیٹی انٹیگریٹی (پرائمری کی کبھی نل نہ ہو)، (3) ریفرینشل انٹیگریٹی (فارن کی کا درست ہونا، بشمول CASCADE، RESTRICT اور SET NULL کے قوانین)، اور (4) انٹرپرائز کنسٹرینٹس (ادارے کے مخصوص کاروباری اصول)۔'
  },
  {
    stem: 'Schema Key Identification Problem: Given the relation schema `EMP(EmpID, CNIC, Name, DeptID, Phone)` where both `EmpID` and `CNIC` are unique identifiers for each employee:\n(a) Identify all Candidate Keys.\n(b) If `EmpID` is chosen as the Primary Key, what is the Alternate Key?\n(c) Identify two distinct Super Keys that are NOT Candidate Keys, and justify your answer using the minimality property.',
    correct: `<p>Step-by-step schema analysis for <code>EMP(EmpID, CNIC, Name, DeptID, Phone)</code>:</p>

<h4>(a) Candidate Keys:</h4>
<p>Both attributes uniquely identify an employee and have no redundant sub-attributes:</p>
<ul>
  <li><code>{EmpID}</code></li>
  <li><code>{CNIC}</code></li>
</ul>

<h4>(b) Alternate Key:</h4>
<p>Since <code>EmpID</code> is chosen as the Primary Key, the remaining candidate key is:</p>
<ul>
  <li><code>{CNIC}</code></li>
</ul>

<h4>(c) Super Keys that are NOT Candidate Keys:</h4>
<ol>
  <li><code>{EmpID, Name}</code></li>
  <li><code>{CNIC, Phone}</code></li>
</ol>
<h5>Justification via Minimality Property:</h5>
<p>A candidate key must be <strong>minimal</strong> (no proper subset can uniquely identify the tuple). For <code>{EmpID, Name}</code>, if we remove <code>Name</code>, the remaining subset <code>{EmpID}</code> is still a valid unique key. Thus, <code>{EmpID, Name}</code> contains a redundant attribute and violates the minimality property, qualifying as a Super Key but strictly disqualifying it as a Candidate Key.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 132–133), CS403 quiz 1 Lec 1-10 mcqs (Q130 / Q213).</p>',
    urdu_answer: '(a) کینڈیڈیٹ کیز: {EmpID} اور {CNIC}۔ (b) آلٹرنیٹ کی: {CNIC}، کیونکہ EmpID کو پرائمری کی چن لیا گیا۔ (c) سپر کیز جو کینڈیڈیٹ کیز نہیں ہیں: {EmpID, Name} اور {CNIC, Phone}، کیونکہ ان میں سے اضافی نام یا فون ہٹانے کے بعد بھی بچ جانے والا فیلڈ ریکارڈ کی مکمل شناخت کر سکتا ہے، اس لیے وہ کم از کم (Minimal) نہیں رہتیں۔'
  }
];

// 4. Insert All Questions
console.log('Inserting MCQs...');
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Short Questions...');
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Long Questions...');
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

// 5. Verification
const countLec = db.prepare('SELECT COUNT(*) as cnt FROM questions WHERE lecture_id = ?').get(lId);
const countTotal = db.prepare('SELECT COUNT(*) as cnt FROM questions').get();
const totalLectures = db.prepare('SELECT COUNT(*) as cnt FROM lectures').get();
const totalSubjects = db.prepare('SELECT COUNT(*) as cnt FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS403 Lecture 14 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

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

// 2. Create or fetch Lecture 16 for CS403
let lec16 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 16").get(cs403.id);
if (!lec16) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 16, 'Mapping Relationships to Relational Schema and Unary/Hierarchy Mapping')
  `).run(cs403.id);
  lec16 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 16 with ID: ${lec16.id}`);
} else {
  console.log(`CS403 Lecture 16 found with ID: ${lec16.id}`);
}

const lId = lec16.id;

// 3. Clear existing questions for Lecture 16 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 16.`);

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
    stem: 'While mapping a binary One-to-Many (1:N) relationship into a relational schema, the relationship is formally implemented by:',
    options: {
      a: 'Creating a separate junction associative table',
      b: 'Placing the Primary Key of the "One" side entity into the "Many" side table as a Foreign Key',
      c: 'Placing the Primary Key of the "Many" side entity into the "One" side table as a Foreign Key',
      d: 'Merging both participating entity types into a single consolidated table'
    },
    correct: 'b',
    explanation: '<p>In a 1:N relationship, each instance on the "Many" side is associated with at most one instance on the "One" side. Placing the <strong>Primary Key of the "One" side into the "Many" side as a Foreign Key</strong> cleanly implements the relationship without redundancy (CS403 Handouts Page 141). Appeared 6 times.</p>',
    urdu_answer: 'ون ٹو مینی (1:N) تعلق کو لاگو کرنے کے لیے "One" سائیڈ والے ٹیبل کی پرائمری کی کو "Many" سائیڈ والے ٹیبل میں بطور فارن کی شامل کیا جاتا ہے۔'
  },
  {
    stem: 'Which of the following is the standard, normalized technique to implement a Many-to-Many (M:N) binary relationship in relational database design?',
    options: {
      a: 'Placing the Primary Key of either table arbitrarily into the other table',
      b: 'Splitting the attributes across two tables with bidirectional foreign keys',
      c: 'Using a junction (associative) table where the primary keys from both tables form a composite primary key',
      d: 'Merging both entity types into a single wide flat table'
    },
    correct: 'c',
    explanation: '<p>A binary M:N relationship cannot be represented directly with foreign keys in either entity table without violating 1NF. It is implemented using an <strong>associative (junction) table</strong> containing the foreign keys of both entities, which jointly form a composite primary key (CS403 Handouts Page 142). Appeared 5 times.</p>',
    urdu_answer: 'مینی ٹو مینی (M:N) تعلق کے لیے ایک تیسرا جنکشن (Associative) ٹیبل بنایا جاتا ہے جس میں دونوں ٹیبلز کی پرائمری کیز مل کر کمپوزٹ پرائمری کی بناتی ہیں۔'
  },
  {
    stem: 'While mapping a binary Many-to-Many (M:N) relationship into the Relational Data Model, how many total relations (tables) are created in the schema?',
    options: {
      a: 'One',
      b: 'Two',
      c: 'Three (Two for the participating entities + One junction table)',
      d: 'Four'
    },
    correct: 'c',
    explanation: '<p>A binary M:N relationship produces <strong>three relations</strong>: two relations for the two participating entity types, and one junction/associative relation to represent the relationship instances (CS403 Handouts Page 142). Appeared 5 times.</p>',
    urdu_answer: 'مینی ٹو مینی تعلق کے نتیجے میں کل تین ٹیبلز بنتے ہیں: دو ٹیبلز بنیادی اینٹیٹیز کے اور ایک جنکشن ٹیبل۔'
  },
  {
    stem: 'A relationship that exists when an association is maintained between different instances of the very same entity type is called a ______ relationship.',
    options: {
      a: 'Unary (Recursive)',
      b: 'Binary',
      c: 'Ternary',
      d: 'Weak'
    },
    correct: 'a',
    explanation: '<p>A <strong>Unary (or Recursive) relationship</strong> occurs when an entity type participates in an association with itself (e.g., an employee managing other employees) (CS403 Handouts Page 144). Appeared 5 times.</p>',
    urdu_answer: 'جب ایک ہی اینٹیٹی کے اپنے ہی مختلف ریکارڈز کے درمیان تعلق پایا جائے تو اسے یونری (Unary یا Recursive) تعلق کہا جاتا ہے۔'
  },
  {
    stem: 'In a One-to-One (1:1) binary relationship where one entity\'s participation is mandatory (compulsory) and the other is optional, the foreign key should preferably be placed in the:',
    options: {
      a: 'Mandatory side entity table',
      b: 'Optional side entity table',
      c: 'Both entity tables simultaneously',
      d: 'A newly created junction table'
    },
    correct: 'b',
    explanation: '<p>To minimize wasteful <code>NULL</code> values, the foreign key referencing the mandatory entity should be placed inside the <strong>optional side entity table</strong>, because every instance in the optional table is guaranteed to reference a mandatory partner (CS403 Handouts Page 143–144). Appeared 4 times.</p>',
    urdu_answer: '1:1 تعلق میں جہاں ایک طرف لازمی اور دوسری طرف اختیاری ہو، فارن کی کو اختیاری (Optional) سائیڈ والے ٹیبل میں رکھنا چاہیے تاکہ NULL ویلیوز سے بچا جا سکے۔'
  },
  {
    stem: 'How is a recursive (unary) 1:N relationship (such as "EMPLOYEE manages EMPLOYEE") mapped into a normalized relational schema?',
    options: {
      a: 'By creating a separate junction table with two foreign keys',
      b: 'By adding a recursive foreign key column inside the same table that references its own primary key',
      c: 'By duplicating the employee table into manager and staff tables',
      d: 'Unary relationships are not supported in the relational model'
    },
    correct: 'b',
    explanation: '<p>A unary 1:N relationship is represented in a single relation by adding a <strong>recursive foreign key attribute</strong> (e.g., <code>mgrId</code>) that references the primary key (<code>empId</code>) of the same table (CS403 Handouts Page 145). Appeared 4 times.</p>',
    urdu_answer: 'یونری 1:N تعلق (جیسے ملازم اپنے ہی ساتھی ملازمین کا منیجر ہو) اسی ایک ٹیبل کے اندر ایک ریکرسیو فارن کی (mgrId) شامل کر کے بنایا جاتا ہے جو اپنی ہی پرائمری کی کو ریفرنس کرتی ہے۔'
  },
  {
    stem: 'When mapping an Enhanced E-R Supertype/Subtype hierarchy containing 1 Supertype and 3 disjoint Subtypes into a relational schema, how many total relations are created?',
    options: {
      a: 'One',
      b: 'Two',
      c: 'Three',
      d: 'Four (1 for the Supertype + 3 for the Subtypes)'
    },
    correct: 'd',
    explanation: '<p>The standard mapping creates <strong>four relations</strong>: one table for the supertype (holding common attributes and primary key) and three separate tables for each subtype (holding specialized attributes and the supertype PK as both PK and FK) (CS403 Handouts Page 145–146). Appeared 4 times.</p>',
    urdu_answer: 'ایک سپر ٹائپ اور تین سب ٹائپس کی درجہ بندی میں کل 4 ٹیبلز بنتے ہیں: ایک مشترکہ سپر ٹائپ کے لیے اور تین الگ الگ سب ٹائپس کے لیے۔'
  },
  {
    stem: 'In a recursive (unary) Many-to-Many (M:N) relationship (such as a Bill of Materials where a "PART is composed of other SUB-PARTS"), how is the structure mapped into relations?',
    options: {
      a: 'A single relation with no foreign key',
      b: 'Two relations: one for the entity itself and one junction table containing two foreign keys referencing the entity\'s primary key',
      c: 'Three separate entity tables',
      d: 'By embedding a variable-length array attribute in the relation'
    },
    correct: 'b',
    explanation: '<p>A unary M:N relationship requires <strong>two relations</strong>: the main entity table (e.g., <code>PART(partId, partName)</code>) and a junction table (e.g., <code>COMPONENT(partId, subPartId, quantity)</code>) where both columns are foreign keys referencing <code>PART(partId)</code> (CS403 Handouts Page 145). Appeared 4 times.</p>',
    urdu_answer: 'یونری M:N تعلق میں دو ٹیبلز بنتے ہیں: ایک اصل اینٹیٹی کا ٹیبل اور دوسرا ایک جنکشن ٹیبل جس میں دونوں کالمز اصل ٹیبل کی ہی پرائمری کی کو ریفرنس کرتے ہیں۔'
  },
  {
    stem: 'The mathematical property of Relational Algebra that permits relational expressions to be arbitrarily nested because both inputs and outputs are valid relations is called the:',
    options: {
      a: 'Atomicity Property',
      b: 'Inheritance Property',
      c: 'Closure Property',
      d: 'Encapsulation Property'
    },
    correct: 'c',
    explanation: '<p>The <strong>Closure Property</strong> of relational algebra guarantees that the result of any relational operation is itself a relation, allowing expressions to be nested as inputs to subsequent operators (CS403 Handouts Page 148). Appeared 3 times.</p>',
    urdu_answer: 'کلوزر پراپرٹی (Closure Property) اس بات کو یقینی بناتی ہے کہ ریلیشنل آپریشنز کے تمام نتائج بھی درست ریلیشنز ہوتے ہیں جن پر مزید آپریشنز کیے جا سکتے ہیں۔'
  },
  {
    stem: 'Establishing logical connections between newly transformed tables and their parent predecessors via foreign keys is a core objective of which database phase?',
    options: {
      a: 'Physical Storage and Index Design',
      b: 'Logical Database Design (Relational Schema Mapping)',
      c: 'User Requirements Elicitation',
      d: 'Conceptual Modeling'
    },
    correct: 'b',
    explanation: '<p>Mapping conceptual E-R entities and relationships into relations with primary and foreign keys is the central task of <strong>Logical Database Design</strong> (CS403 Handouts Page 140). Appeared 3 times.</p>',
    urdu_answer: 'فارن کیز کے ذریعے ٹیبلز کے درمیان باہمی روابط قائم کرنا لاجیکل ڈیٹا بیس ڈیزائن (ریلیشنل میپنگ) کا بنیادی مقصد ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'How is a Binary 1:N (One-to-Many) Relationship mapped into a normalized Relational Schema? Give an example.',
    correct: `<p>A <strong>Binary 1:N Relationship</strong> connects an entity instance on the "One" side to multiple instances on the "Many" side.</p>
<h4>Mapping Algorithm:</h4>
<ol>
  <li>Create separate relations for both participating entities.</li>
  <li>Identify the <strong>Primary Key of the entity on the "One" side</strong>.</li>
  <li>Place this key as a <strong>Foreign Key inside the relation on the "Many" side</strong>.</li>
</ol>
<h4>Example:</h4>
<p>Relationship between <code>DEPARTMENT (1)</code> and <code>EMPLOYEE (N)</code>:</p>
<pre><code>DEPARTMENT(deptId, deptName)
EMPLOYEE(empId, empName, deptId)</code></pre>
<p>Here, <code>deptId</code> in <code>EMPLOYEE</code> is a foreign key referencing <code>DEPARTMENT(deptId)</code>.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 141) and Cs403 Quiz 1 mcqs (Q211).</p>',
    urdu_answer: 'بائنری 1:N تعلق میں دونوں اینٹیٹیز کے الگ الگ ٹیبلز بنتے ہیں۔ پھر "One" سائیڈ والے ٹیبل کی پرائمری کی کو اٹھا کر "Many" سائیڈ والے ٹیبل میں بطور فارن کی رکھ دیا جاتا ہے، جیسے ڈیپارٹمنٹ کی deptId کو ایمپلائی کے ٹیبل میں شامل کرنا۔'
  },
  {
    stem: 'How is a Binary M:N (Many-to-Many) Relationship mapped into a Relational Schema? Explain the role of the junction table.',
    correct: `<p>A <strong>Binary M:N Relationship</strong> cannot be implemented using direct foreign keys between the two entity tables because doing so would violate 1NF and introduce multi-valued redundancies.</p>
<h4>Mapping Algorithm:</h4>
<ol>
  <li>Create two independent relations for the two participating entity types.</li>
  <li>Create a <strong>third relation (junction / associative table)</strong> to represent the relationship.</li>
  <li>Include the Primary Keys of both entity tables as <strong>Foreign Keys</strong> in this junction table.</li>
  <li>The <strong>composite combination of both foreign keys</strong> forms the Primary Key of the junction table.</li>
  <li>Include any relationship attributes (e.g., date, grade) as columns in the junction table.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 142) and CS403 Mid Term Past Papers Mega File (Page 14).</p>',
    urdu_answer: 'مینی ٹو مینی (M:N) تعلق میں دونوں ٹیبلز کے علاوہ ایک تیسرا جنکشن (Associative) ٹیبل بنایا جاتا ہے۔ اس جنکشن ٹیبل میں دونوں ٹیبلز کی پرائمری کیز بطور فارن کی رکھی جاتی ہیں اور ان دونوں کو ملا کر جنکشن ٹیبل کی کمپوزٹ پرائمری کی بنائی جاتی ہے۔'
  },
  {
    stem: 'How do you map a 1:1 Relationship with optional and mandatory participation to minimize null values?',
    correct: `<p>When mapping a <strong>1:1 Relationship</strong> with asymmetric participation constraints (one entity mandatory, one entity optional):</p>
<h4>Optimal Foreign Key Placement Rule:</h4>
<ul>
  <li>Create separate relations for both entities.</li>
  <li>Place the <strong>Primary Key of the Mandatory side</strong> as a <strong>Foreign Key inside the Optional side\'s relation</strong>.</li>
</ul>
<h4>Reason:</h4>
<p>Every record created in the optional table is guaranteed to link to an existing mandatory entity, eliminating null values. If the foreign key were placed on the mandatory side instead, every mandatory row lacking an optional partner would contain a wasteful <code>NULL</code> foreign key.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 143–144) and CS403 Mid Term Past Papers Mega File (Page 18 Q7).</p>',
    urdu_answer: '1:1 تعلق میں جہاں ایک اینٹیٹی لازمی اور دوسری اختیاری ہو، لازمی سائیڈ کی پرائمری کی کو اختیاری سائیڈ والے ٹیبل میں فارن کی بنایا جاتا ہے۔ اس سے فائدہ یہ ہوتا ہے کہ اختیاری ٹیبل کا ہر ریکارڈ لازمی سے منسلک ہوگا اور کالم میں غیر ضروری NULL ویلیوز نہیں آئیں گی۔'
  },
  {
    stem: 'Explain how an Enhanced E-R Supertype/Subtype hierarchy is transformed into relational tables.',
    correct: `<p>Mapping an <strong>EER Supertype/Subtype hierarchy</strong> into a relational model follows a standardized 3-step mapping rule:</p>
<ol>
  <li><strong>Supertype Table:</strong> Create a relation for the supertype entity containing its primary key and all shared/common attributes.</li>
  <li><strong>Subtype Tables:</strong> Create a separate relation for each subtype entity containing only its unique, specialized attributes.</li>
  <li><strong>Primary/Foreign Key Linkage:</strong> Place the <strong>Primary Key of the Supertype</strong> into each Subtype table. In each subtype table, this attribute serves simultaneously as its <strong>Primary Key</strong> and as a <strong>Foreign Key</strong> referencing the supertype table.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 145–146).</p>',
    urdu_answer: 'سپر ٹائپ/سب ٹائپ ماڈل کی منتقلی کے تین مراحل ہیں: (1) سپر ٹائپ کا ٹیبل جس میں مشترکہ خصوصیات اور پرائمری کی ہوگی، (2) ہر سب ٹائپ کا الگ ٹیبل جس میں صرف اس کی مخصوص خصوصیات ہوں گی، اور (3) سپر ٹائپ کی پرائمری کی ہر سب ٹائپ میں رکھی جائے گی جو اس کی پرائمری کی اور فارن کی دونوں کا کام کرے گی۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Explain the complete set of rules for transforming Binary Relationships (1:1, 1:N, and M:N) from conceptual E-R models into normalized relational schemas. Provide formal schema notations and attribute examples for each case.',
    correct: `<p>In logical database design, binary relationships between two entity types are mapped according to their cardinality ratio:</p>

<h4>1. Binary One-to-Many (1:N) Relationships:</h4>
<ul>
  <li><strong>Rule:</strong> The primary key of the "1" side entity is migrated into the relation representing the "N" side as a foreign key.</li>
  <li><strong>Schema Example:</strong> Entity <code>COURSE (1)</code> and <code>CLASS_SECTION (N)</code>:
    <pre><code>COURSE(courseCode, courseTitle, creditHours)
CLASS_SECTION(sectionId, semester, roomNo, courseCode)</code></pre>
    <em>Foreign Key:</em> <code>CLASS_SECTION.courseCode</code> references <code>COURSE(courseCode)</code>.
  </li>
</ul>

<h4>2. Binary Many-to-Many (M:N) Relationships:</h4>
<ul>
  <li><strong>Rule:</strong> Requires a third relation (junction / associative table). The primary keys of both participating entities are migrated into the junction table as foreign keys, jointly forming its composite primary key. Any relationship attributes reside in this junction table.</li>
  <li><strong>Schema Example:</strong> Entity <code>STUDENT</code> and <code>COURSE</code> linked by <code>ENROLLS</code> with attribute <code>grade</code>:
    <pre><code>STUDENT(stId, stName, major)
COURSE(courseCode, courseTitle)
ENROLLMENT(stId, courseCode, grade, enrollmentDate)</code></pre>
    <em>Primary Key of ENROLLMENT:</em> <code>{stId, courseCode}</code>.<br />
    <em>Foreign Keys:</em> <code>stId</code> references <code>STUDENT</code>, <code>courseCode</code> references <code>COURSE</code>.
  </li>
</ul>

<h4>3. Binary One-to-One (1:1) Relationships:</h4>
<ul>
  <li><strong>Rule:</strong> Three alternative approaches depending on participation:
    <ol>
      <li><strong>Mandatory / Optional:</strong> Place the primary key of the mandatory entity as a foreign key into the optional entity table.</li>
      <li><strong>Both Mandatory:</strong> Merge both entities into a single relation.</li>
      <li><strong>Both Optional:</strong> Place the primary key of either entity into the other with a <code>UNIQUE</code> constraint, or use an associative table.</li>
    </ol>
  </li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 140–144).</p>',
    urdu_answer: 'بائنری تعلقات کو ریلیشنل ماڈل میں بدلنے کے باقاعدہ اصول: (1) 1:N تعلق میں "1" سائیڈ کی پرائمری کی "N" سائیڈ کے ٹیبل میں فارن کی بنتی ہے۔ (2) M:N تعلق میں تین ٹیبلز بنتے ہیں جن میں تیسرا جنکشن ٹیبل دونوں کی پرائمری کیز کو ملا کر کمپوزٹ پرائمری کی بناتا ہے۔ (3) 1:1 تعلق میں لازمی سائیڈ کی پرائمری کی کو اختیاری سائیڈ والے ٹیبل میں فارن کی بنایا جاتا ہے تاکہ غیر ضروری خالی جگہوں (NULLs) سے بچا جا سکے۔'
  },
  {
    stem: 'Discuss the transformation of Unary (Recursive) Relationships into Relational Schemas across all three cardinality ratios (Unary 1:1, Unary 1:N, and Unary M:N) with realistic database examples.',
    correct: `<p>A <strong>Unary (Recursive) Relationship</strong> involves instances of a single entity type associating with other instances of the same entity type:</p>

<h4>1. Unary 1:1 Relationship:</h4>
<ul>
  <li><strong>Concept:</strong> An entity instance associates with at most one other instance of the same entity (e.g., student room sharing).</li>
  <li><strong>Mapping:</strong> Add a recursive foreign key column inside the same table referencing its own primary key, marked with a <code>UNIQUE</code> constraint.
    <pre><code>STUDENT(stId, stName, gender, roommateStId)</code></pre>
    <em>Constraint:</em> <code>roommateStId</code> is a Foreign Key referencing <code>STUDENT(stId)</code>.
  </li>
</ul>

<h4>2. Unary 1:N Relationship:</h4>
<ul>
  <li><strong>Concept:</strong> One instance is associated with multiple subordinate instances of the same entity (e.g., corporate management hierarchy).</li>
  <li><strong>Mapping:</strong> Add a recursive foreign key column inside the same table referencing its own primary key (without a unique constraint).
    <pre><code>EMPLOYEE(empId, empName, salary, managerEmpId)</code></pre>
    <em>Constraint:</em> <code>managerEmpId</code> is a Foreign Key referencing <code>EMPLOYEE(empId)</code>.
  </li>
</ul>

<h4>3. Unary M:N Relationship:</h4>
<ul>
  <li><strong>Concept:</strong> An instance can be associated with multiple other instances, and vice versa (e.g., Bill of Materials where a Part is composed of Sub-Parts, and a Sub-Part is used in multiple Parts).</li>
  <li><strong>Mapping:</strong> Requires <strong>two tables</strong>: one for the entity and one associative table with two foreign keys pointing back to the entity table.
    <pre><code>PART(partNo, partName, unitCost)
BILL_OF_MATERIALS(parentPartNo, componentPartNo, quantityRequired)</code></pre>
    <em>Primary Key:</em> <code>{parentPartNo, componentPartNo}</code>.<br />
    <em>Foreign Keys:</em> Both <code>parentPartNo</code> and <code>componentPartNo</code> reference <code>PART(partNo)</code>.
  </li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 144–145).</p>',
    urdu_answer: 'یونری (Recursive) تعلقات کی منتقلی: (1) یونری 1:1 میں اسی ٹیبل میں ایک یونیک فارن کی (roommateId) ڈالی جاتی ہے۔ (2) یونری 1:N میں اسی ٹیبل کے اندر مینیجر کی آئی ڈی (managerEmpId) بطور فارن کی شامل ہوتی ہے جو ملازم کی اپنی پرائمری کی کو ریفرنس کرتی ہے۔ (3) یونری M:N (جیسے بل آف میٹریلز) میں دو ٹیبلز بنتے ہیں: ایک اصل پرزوں (PART) کا اور دوسرا جنکشن ٹیبل (BILL_OF_MATERIALS) جس میں پیرنٹ پارٹ اور چائلڈ پارٹ دونوں اصل ٹیبل سے لنک ہوتے ہیں۔'
  },
  {
    stem: 'Relational Schema Mapping Practical Problem:\n(a) Transform the Many-to-Many library relationship between `STUDENT(stId, stName, stFname)` and `BOOK(bkId, bkTitle, bkAuth)` through relationship `ISSUED` (with attributes `issueDate` and `returnDate`) into normalized relational schemas.\n(b) Transform the Unary 1:N relationship where `EMPLOYEE(empId, empName, salary)` has a recursive relationship `MANAGES` into a relational schema.\nExplicitly identify all Primary Keys, Foreign Keys, and referential constraints.',
    correct: `<p>Step-by-step relational transformation solutions:</p>

<h4>Part (a): Many-to-Many Library Mapping</h4>
<p>An M:N relationship yields three normalized relations:</p>
<ol>
  <li><strong>Relation 1 (STUDENT):</strong>
    <pre><code>STUDENT(stId, stName, stFname)</code></pre>
    <strong>Primary Key:</strong> <code>stId</code>
  </li>
  <li><strong>Relation 2 (BOOK):</strong>
    <pre><code>BOOK(bkId, bkTitle, bkAuth)</code></pre>
    <strong>Primary Key:</strong> <code>bkId</code>
  </li>
  <li><strong>Relation 3 (Junction Table - ISSUED_TRANSACTIONS):</strong>
    <pre><code>ISSUED_BOOKS(stId, bkId, issueDate, returnDate)</code></pre>
    <strong>Composite Primary Key:</strong> <code>{stId, bkId, issueDate}</code> (or <code>{stId, bkId}</code> if a book can be issued once per student)<br />
    <strong>Foreign Key 1:</strong> <code>stId</code> REFERENCES <code>STUDENT(stId)</code><br />
    <strong>Foreign Key 2:</strong> <code>bkId</code> REFERENCES <code>BOOK(bkId)</code>
  </li>
</ol>

<h4>Part (b): Unary 1:N Management Hierarchy Mapping</h4>
<p>A unary 1:N relationship is mapped within a single relation using a recursive self-referential foreign key:</p>
<pre><code>EMPLOYEE(empId, empName, salary, managerId)</code></pre>
<ul>
  <li><strong>Primary Key:</strong> <code>empId</code></li>
  <li><strong>Recursive Foreign Key:</strong> <code>managerId</code> REFERENCES <code>EMPLOYEE(empId)</code></li>
  <li><strong>Integrity Rule:</strong> <code>managerId</code> can accept <code>NULL</code> (for the CEO or top executive who reports to nobody), but any non-null <code>managerId</code> must strictly match a valid existing <code>empId</code>.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 142–145).</p>',
    urdu_answer: 'حصہ (a): لائبریری کے M:N تعلق کے لیے تین ٹیبلز بنیں گے: STUDENT (پرائمری کی stId)، BOOK (پرائمری کی bkId)، اور جنکشن ٹیبل ISSUED_BOOKS جس کی کمپوزٹ پرائمری کی {stId, bkId} ہوگی اور یہ دونوں اصل ٹیبلز سے لنک ہوں گے۔\nحصہ (b): یونری 1:N تعلق کے لیے ایک ہی ٹیبل EMPLOYEE بنے گا جس کی پرائمری کی empId ہوگی اور ایک کالم managerId ہوگا جو اسی ٹیبل کی پرائمری کی empId کو ریفرنس کرے گا (سی ای او کے لیے یہ فیلڈ نل ہو سکتی ہے)۔'
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
console.log(`CS403 Lecture 16 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

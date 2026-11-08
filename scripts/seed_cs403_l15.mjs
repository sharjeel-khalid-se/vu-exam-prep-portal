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

// 2. Create or fetch Lecture 15 for CS403
let lec15 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 15").get(cs403.id);
if (!lec15) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 15, 'Transforming E-R Design to Relational Schema & Relational Operations')
  `).run(cs403.id);
  lec15 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 15 with ID: ${lec15.id}`);
} else {
  console.log(`CS403 Lecture 15 found with ID: ${lec15.id}`);
}

const lId = lec15.id;

// 3. Clear existing questions for Lecture 15 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 15.`);

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
    stem: 'When mapping a multi-valued attribute into the Relational Data Model, the standard transformation rule requires creating:',
    options: {
      a: 'No new table, storing values as a comma-separated string',
      b: 'A separate relation containing the owner\'s primary key and the multi-valued attribute',
      c: 'A single composite column in the parent table',
      d: 'A temporary database view'
    },
    correct: 'b',
    explanation: '<p>A multi-valued attribute cannot be stored in a single cell without violating First Normal Form (1NF). The relational transformation rule mandates creating a <strong>separate relation</strong> containing the owner\'s primary key (as a foreign key) and the multi-valued attribute (CS403 Handouts Page 134–135). Appeared 5 times.</p>',
    urdu_answer: 'ملٹی ویلیوڈ ایٹری بیوٹ کو ریلیشنل ماڈل میں تبدیل کرتے وقت ایک نیا الگ ٹیبل بنایا جاتا ہے جس میں پیرنٹ کی پرائمری کی اور ملٹی ویلیوڈ فیلڈ شامل ہوتی ہیں۔'
  },
  {
    stem: 'When mapping a composite attribute from a conceptual E-R diagram into a relational schema, the composite attribute is:',
    options: {
      a: 'Completely omitted from the schema',
      b: 'Replaced by its individual simple component attributes as separate columns',
      c: 'Stored as a single concatenated text string column',
      d: 'Converted into an independent weak entity'
    },
    correct: 'b',
    explanation: '<p>Composite attributes are flattened: the composite attribute itself is omitted, and its <strong>individual simple component attributes</strong> become separate columns in the resulting relation (CS403 Handouts Page 133–134). Appeared 4 times.</p>',
    urdu_answer: 'کمپوزٹ ایٹری بیوٹ کے مرکزی نام کو چھوڑ کر اس کے تمام سادہ ذیلی اجزاء کو الگ الگ کالمز کے طور پر ٹیبل میں شامل کیا جاتا ہے۔'
  },
  {
    stem: 'When transforming a weak entity type with Identifier Dependency into a relational model, the primary key of the resulting weak relation consists of:',
    options: {
      a: 'The partial key (discriminator) of the weak entity alone',
      b: 'The primary key of the owner entity combined with the partial key of the weak entity',
      c: 'A newly generated surrogate auto-increment key only',
      d: 'The owner entity\'s primary key alone'
    },
    correct: 'b',
    explanation: '<p>Because a weak entity cannot be uniquely identified by its partial key alone, its primary key in the relational model is formed by combining the <strong>primary key of the identifying owner entity with the partial key of the weak entity</strong> (CS403 Handouts Page 136–138). Appeared 5 times.</p>',
    urdu_answer: 'کمزور اینٹیٹی (Weak entity) کی پرائمری کی اونر اینٹیٹی کی پرائمری کی اور کمزور اینٹیٹی کی پارشل کی کو ملا کر کمپوزٹ کی بنائی جاتی ہے۔'
  },
  {
    stem: 'In relational algebra, the Selection (\u03c3) and Projection (\u03a0) operations are classic examples of ______ operations.',
    options: {
      a: 'Unary (operating on a single relation)',
      b: 'Binary (operating on two relations)',
      c: 'Ternary',
      d: 'N-ary'
    },
    correct: 'a',
    explanation: '<p><strong>Selection (\u03c3)</strong> and <strong>Projection (\u03a0)</strong> are <em>Unary operations</em> because they operate on a single input relation to produce a new output relation (CS403 Handouts Page 148). Appeared 6 times.</p>',
    urdu_answer: 'سلیکشن اور پروجیکشن یونری (Unary) آپریشنز ہیں کیونکہ یہ بیک وقت صرف ایک ہی ریلیشن پر کام کرتے ہیں۔'
  },
  {
    stem: 'Which of the following is NOT one of the five fundamental (primitive) operators in Relational Algebra?',
    options: {
      a: 'Selection (\u03c3)',
      b: 'Projection (\u03a0)',
      c: 'Join (\u22c8)',
      d: 'Cartesian Product (\u00d7)'
    },
    correct: 'c',
    explanation: '<p>The five fundamental relational algebra operators are Selection, Projection, Union, Set Difference, and Cartesian Product. <strong>Join (\u22c8)</strong> is a <em>derived operation</em> composed of a Cartesian product followed by a Selection (CS403 Handouts Page 148 / 157). Appeared 7 times.</p>',
    urdu_answer: 'جوائن (Join) بنیادی آپریشن نہیں ہے بلکہ یہ کارٹیشین پروڈکٹ اور سلیکشن کا مجموعہ یعنی ڈیرائیو شدہ آپریشن ہے۔'
  },
  {
    stem: 'In mathematical Relational Algebra, which Greek symbol is universally used to denote the horizontal SELECT (tuple restriction) operation?',
    options: {
      a: '\u03a0 (Pi)',
      b: '\u03c3 (Sigma)',
      c: '\u03c1 (Rho)',
      d: '\u03b8 (Theta)'
    },
    correct: 'b',
    explanation: '<p>The Greek lowercase letter <strong>\u03c3 (Sigma)</strong> denotes the Selection operator: \u03c3<sub>predicate</sub>(R) (CS403 Handouts Page 149). Appeared 5 times.</p>',
    urdu_answer: 'سلیکشن آپریشن کو ظاہر کرنے کے لیے یونانی حرف سگما (\u03c3) استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In mathematical Relational Algebra, which Greek symbol is universally used to denote the vertical PROJECT (column extraction) operation?',
    options: {
      a: '\u03c3 (Sigma)',
      b: '\u03a0 (Pi)',
      c: '\u03bb (Lambda)',
      d: '\u03b4 (Delta)'
    },
    correct: 'b',
    explanation: '<p>The Greek capital letter <strong>\u03a0 (Pi)</strong> denotes the Projection operator: \u03a0<sub>attributes</sub>(R) (CS403 Handouts Page 150–151). Appeared 5 times.</p>',
    urdu_answer: 'پروجیکشن آپریشن کو ظاہر کرنے کے لیے یونانی حرف پائی (\u03a0) استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Two relations R and S are formally defined as being UNION COMPATIBLE if and only if:',
    options: {
      a: 'They share the exact same primary key name',
      b: 'They have the same degree (number of attributes) and corresponding attributes have identical data domains',
      c: 'They contain the exact same number of tuples (cardinality)',
      d: 'Both relations are normalized to Boyce-Codd Normal Form (BCNF)'
    },
    correct: 'b',
    explanation: '<p>Two relations are <strong>Union Compatible</strong> if they have identical degrees (same number of columns) and the domain of the <em>i</em>-th attribute of R matches the domain of the <em>i</em>-th attribute of S for all columns (CS403 Handouts Page 152–153). Appeared 4 times.</p>',
    urdu_answer: 'دو ریلیشنز یونین کمپیٹیبل اس وقت کہلاتے ہیں جب ان کی ڈگری (کالمز کی تعداد) برابر ہو اور متعلقہ کالمز کے ڈیٹا ڈومینز ایک جیسے ہوں۔'
  },
  {
    stem: 'If relation R has a degree of 4 and a cardinality of 10, and relation S has a degree of 3 and a cardinality of 5, what will be the degree and cardinality of their Cartesian Product (R \u00d7 S)?',
    options: {
      a: 'Degree = 7, Cardinality = 50',
      b: 'Degree = 12, Cardinality = 15',
      c: 'Degree = 7, Cardinality = 15',
      d: 'Degree = 12, Cardinality = 50'
    },
    correct: 'a',
    explanation: '<p>Degree of (R \u00d7 S) = Degree(R) + Degree(S) = 4 + 3 = <strong>7</strong>. Cardinality of (R \u00d7 S) = Cardinality(R) \u00d7 Cardinality(S) = 10 \u00d7 5 = <strong>50</strong> (CS403 Handouts Page 155). Appeared multiple times.</p>',
    urdu_answer: 'کارٹیشین پروڈکٹ میں ڈگری دونوں کے کالمز کا مجموعہ (4 + 3 = 7) ہوتی ہے جبکہ کارڈینالٹی دونوں کی قطاروں کا ضرب (10 \u00d7 5 = 50) ہوتی ہے۔'
  },
  {
    stem: 'In Relational Algebra, which group of set operations strictly requires the participating relations to be Union Compatible?',
    options: {
      a: 'Union (\u222a), Intersection (\u2229), and Set Difference (\u2212)',
      b: 'Cartesian Product (\u00d7) and Selection (\u03c3)',
      c: 'Selection (\u03c3) and Projection (\u03a0)',
      d: 'Natural Join (\u22c8) and Theta Join'
    },
    correct: 'a',
    explanation: '<p><strong>Union, Intersection, and Set Difference</strong> operate on compatible sets of tuples and strictly require union compatibility to produce mathematically valid relations (CS403 Handouts Page 152–154).</p>',
    urdu_answer: 'سیٹ تھیوری کے آپریشنز یعنی یونین (\u222a)، انٹرسیکشن (\u2229) اور سیٹ ڈفرنس (\u2212) کے لیے دونوں ٹیبلز کا یونین کمپیٹیبل ہونا لازمی ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'Explain how Composite Attributes are transformed from a conceptual E-R Diagram into a Relational Schema with an example.',
    correct: `<p>In relational database design, composite attributes cannot be stored as hierarchical units because relational attributes must be atomic.</p>
<h4>Mapping Rule:</h4>
<ul>
  <li>The composite attribute itself is omitted from the resulting table.</li>
  <li>Each of its simple component sub-attributes is mapped as an independent, individual column.</li>
</ul>
<h4>Example:</h4>
<p>An entity <code>EMPLOYEE</code> with composite attribute <code>Address(HouseNo, Street, City, PostalCode)</code> maps to the relation schema:</p>
<pre><code>EMPLOYEE(EmpID, Name, HouseNo, Street, City, PostalCode)</code></pre>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 133–134).</p>',
    urdu_answer: 'کمپوزٹ ایٹری بیوٹ کے نام کو چھوڑ دیا جاتا ہے اور اس کے اندر موجود تمام بنیادی اجزاء کو الگ الگ کالمز کے طور پر ٹیبل میں شامل کیا جاتا ہے، جیسے Address کے اجزاء HouseNo، Street اور City الگ کالم بن جاتے ہیں۔'
  },
  {
    stem: 'Explain the transformation rule for mapping Multi-Valued Attributes from an E-R model into the relational model.',
    correct: `<p>A multi-valued attribute can hold multiple values for a single entity instance, which directly violates the atomicity requirement of First Normal Form (1NF).</p>
<h4>Transformation Procedure:</h4>
<ol>
  <li>Create a <strong>separate new relation</strong> dedicated to the multi-valued attribute.</li>
  <li>Include the <strong>Primary Key</strong> of the parent/owner entity as a Foreign Key in this new table.</li>
  <li>Include the multi-valued attribute as a column.</li>
  <li>The <strong>Primary Key</strong> of the new relation is the composite combination of: <code>(Parent_PK + MultiValued_Attribute)</code>.</li>
</ol>
<p><em>Example:</em> An <code>EMPLOYEE(EmpID, Name)</code> entity with multi-valued attribute <code>Skill</code> maps to two tables: <code>EMPLOYEE(EmpID, Name)</code> and <code>EMP_SKILLS(EmpID, Skill)</code> where <code>{EmpID, Skill}</code> is the composite primary key.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 134–135).</p>',
    urdu_answer: 'ملٹی ویلیوڈ ایٹری بیوٹ کے لیے ایک نیا الگ ٹیبل بنایا جاتا ہے جس میں اصل اینٹیٹی کی پرائمری کی اور وہ ملٹی ویلیوڈ کالم رکھا جاتا ہے۔ ان دونوں کو ملا کر نئے ٹیبل کی کمپوزٹ پرائمری کی بنائی جاتی ہے۔'
  },
  {
    stem: 'What is Union Compatibility in Relational Algebra? Which relational operations require Union Compatibility?',
    correct: `<p>Two relations \(R\) and \(S\) are defined as <strong>Union Compatible</strong> (or type-compatible) if and only if they satisfy two formal structural conditions:</p>
<ol>
  <li><strong>Same Degree:</strong> Relation \(R\) and relation \(S\) must have the exact same number of attributes: \(\text{Degree}(R) = \text{Degree}(S)\).</li>
  <li><strong>Matching Domains:</strong> The domain of the \(i\)-th attribute of \(R\) must be identical to the domain of the \(i\)-th attribute of \(S\) for all \(1 \le i \le n\).</li>
</ol>
<h4>Operations Requiring Union Compatibility:</h4>
<ul>
  <li><strong>Union (\(\cup\))</strong></li>
  <li><strong>Intersection (\(\cap\))</strong></li>
  <li><strong>Set Difference (\(-\))</strong></li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 152–154).</p>',
    urdu_answer: 'یونین کمپیٹیبلٹی کا مطلب ہے کہ دو ٹیبلز کے کالمز کی تعداد برابر ہو اور آمنے سامنے والے کالمز کی ڈیٹا ٹائپ اور ڈومین ایک جیسی ہو۔ یہ شرط یونین (\u222a)، انٹرسیکشن (\u2229) اور سیٹ ڈفرنس (\u2212) کے لیے لازمی ہے۔'
  },
  {
    stem: 'Differentiate between the SELECT (\u03c3) and PROJECT (\u03a0) operations in Relational Algebra.',
    correct: `<p>The difference between <strong>Selection</strong> and <strong>Projection</strong> represents the fundamental orthogonal dimensions of relational filtering:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Feature</th>
      <th>Selection (\u03c3)</th>
      <th>Projection (\u03a0)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Filtering Direction</strong></td>
      <td><strong>Horizontal:</strong> Filters rows (tuples) based on a boolean condition.</td>
      <td><strong>Vertical:</strong> Extracts specific columns (attributes), discarding unwanted ones.</td>
    </tr>
    <tr>
      <td><strong>Impact on Degree</strong></td>
      <td>Preserves degree; output has the <strong>same number of columns</strong>.</td>
      <td>Reduces degree; output has <strong>fewer columns</strong>.</td>
    </tr>
    <tr>
      <td><strong>Duplicate Elimination</strong></td>
      <td>No duplicate elimination (input tuples are already unique).</td>
      <td><strong>Automatically eliminates duplicate tuples</strong> to maintain mathematical set validity.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 149–151).</p>',
    urdu_answer: 'سلیکشن (\u03c3) افقی فلٹرنگ ہے جو شرط کے مطابق قطاریں (Rows) منتخب کرتی ہے اور کالمز کی تعداد تبدیل نہیں ہوتی۔ جبکہ پروجیکشن (\u03a0) عمودی فلٹرنگ ہے جو مخصوص کالمز (Columns) کو الگ کرتی ہے اور ڈپلیکیٹ قطاروں کو خود بخود ختم کر دیتی ہے۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Explain in detail the formal rules for transforming conceptual E-R Diagram constructs into logical Relational Schemas. Detail the transformation of Strong Entities, Composite Attributes, Multi-Valued Attributes, and Weak Entities (Identifier Dependency).',
    correct: `<p>Transforming a conceptual Entity-Relationship (E-R) diagram into a normalized relational schema requires disciplined mapping algorithms:</p>

<h4>1. Strong (Regular) Entity Types:</h4>
<ul>
  <li>Create a distinct relation \(R\) for each strong entity type.</li>
  <li>All simple single-valued attributes become columns of \(R\).</li>
  <li>The entity\'s identifier becomes the Primary Key of \(R\).</li>
</ul>

<h4>2. Composite Attributes:</h4>
<ul>
  <li>Do not allocate a column for the composite attribute container.</li>
  <li>Include each of its simple atomic component attributes directly as separate columns within the relation.</li>
</ul>

<h4>3. Multi-Valued Attributes:</h4>
<ul>
  <li>Violates First Normal Form (1NF) if retained in the same relation.</li>
  <li>Create a new relation \(R_{multi}\).</li>
  <li>Include the Primary Key \(K\) of the owner relation as a Foreign Key.</li>
  <li>Include the multi-valued attribute \(A\).</li>
  <li>The composite primary key of \(R_{multi}\) is \(\{K, A\}\).</li>
</ul>

<h4>4. Weak Entity Types (Identifier Dependency):</h4>
<ul>
  <li>A weak entity cannot exist without its identifying owner entity and possesses only a partial key (discriminator).</li>
  <li>Create a distinct relation \(R_{weak}\) for the weak entity.</li>
  <li>Include the Primary Key of the identifying owner entity as a Foreign Key referencing the owner table.</li>
  <li>The composite primary key of \(R_{weak}\) is: <code>{Owner_PK, Partial_Key}</code>.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 132–139).</p>',
    urdu_answer: 'ای آر ماڈل کو ریلیشنل ماڈل میں بدلنے کے باقاعدہ اصول: مضبوط اینٹیٹی کا الگ ٹیبل بنتا ہے اور اس کا آئیڈینٹی فائر پرائمری کی بنتا ہے؛ کمپوزٹ ایٹری بیوٹ کے تمام ذیلی اجزاء کو الگ الگ کالمز بنایا جاتا ہے؛ ملٹی ویلیوڈ ایٹری بیوٹ کا الگ ٹیبل بنتا ہے جس کی پرائمری کی پیرنٹ کی اور وہ ایٹری بیوٹ مل کر بنتی ہے؛ اور کمزور اینٹیٹی کے ٹیبل کی پرائمری کی اونر اینٹیٹی کی پرائمری کی اور پارشل کی کو ملا کر بنائی جاتی ہے۔'
  },
  {
    stem: 'Write a comprehensive architectural note on the Fundamental Operations of Relational Algebra. Detail the Unary operators (Selection, Projection), Binary operators (Union, Set Difference, Cartesian Product), and explain the Closure Property.',
    correct: `<p><strong>Relational Algebra</strong> is a formal procedural query language founded on set theory that underpins relational database systems.</p>

<h4>1. Unary Operators:</h4>
<ul>
  <li><strong>Selection (\(\sigma_{predicate}(R)\)):</strong> Selects a subset of tuples from relation \(R\) that satisfy the specified boolean predicate condition (\(<, \le, =, \ne, >, \ge, \land, \lor, \neg\)).</li>
  <li><strong>Projection (\(\Pi_{attribute\_list}(R)\)):</strong> Extracts specified columns from \(R\) and discards the rest, automatically eliminating duplicate rows to maintain mathematical set validity.</li>
</ul>

<h4>2. Binary Set Operators (Requiring Union Compatibility):</h4>
<ul>
  <li><strong>Union (\(R \cup S\)):</strong> Returns a relation containing all tuples that appear in \(R\), in \(S\), or in both, with duplicates eliminated.</li>
  <li><strong>Set Difference (\(R - S\)):</strong> Returns a relation containing all tuples that appear in \(R\) but do NOT appear in \(S\).</li>
</ul>

<h4>3. Cartesian Product (\(R \times S\)):</h4>
<p>Combines every tuple of \(R\) with every tuple of \(S\). The resulting relation has \(\text{Degree}(R) + \text{Degree}(S)\) columns and \(\text{Cardinality}(R) \times \text{Cardinality}(S)\) rows. Does not require union compatibility.</p>

<h4>4. The Closure Property:</h4>
<p>Every relational algebra operator accepts relations as inputs and produces a new valid relation as its output. This fundamental property allows complex queries to be built through arbitrary nesting of operations: \(\Pi_{Name}(\sigma_{Salary > 50000}(EMP))\).</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 147–156).</p>',
    urdu_answer: 'ریلیشنل الجبرا کے بنیادی آپریشنز: یونری آپریشنز میں سلیکشن (\u03c3) قطاروں کو فلٹر کرتی ہے اور پروجیکشن (\u03a0) کالمز کو نکالتی ہے۔ بائنری آپریشنز میں یونین (\u222a) دونوں ٹیبلز کے تمام ریکارڈز کو جمع کرتا ہے اور سیٹ ڈفرنس (\u2212) پہلے ٹیبل کے وہ ریکارڈز لاتا ہے جو دوسرے میں نہ ہوں۔ کارٹیشین پروڈکٹ (\u00d7) تمام جوڑے بناتا ہے۔ کلوزر پراپرٹی (Closure Property) اس بات کی ضمانت دیتی ہے کہ ہر آپریشن کا رزلٹ بھی ایک درست ریلیشن ہوتا ہے جس سے کوئریز کو آپس میں نیسٹ کیا جا سکتا ہے۔'
  },
  {
    stem: 'Relational Algebra Query Evaluation Problem: Given the relation:\n\nSTUDENT(StID, StName, Program, Semester)\n(S101, Ali, MCS, 4)\n(S102, Sara, BIT, 2)\n(S103, Tariq, MCS, 5)\n(S104, Hina, BCS, 3)\n(S105, Usman, MCS, 4)\n(S106, Zara, BIT, 1)\n\n(a) Write the mathematical expression, list the matching result tuples, and state the degree and cardinality of: Selection of students enrolled in the "MCS" program.\n(b) Write the mathematical expression, list the output tuples, and state the degree and cardinality of: Projection of the "Program" attribute.\n(c) Explain why Projection eliminates duplicate rows while Selection does not.',
    correct: `<p>Mathematical evaluation and relational algebra analysis of <code>STUDENT</code>:</p>

<h4>(a) Selection of Students in "MCS":</h4>
<ul>
  <li><strong>Expression:</strong> <code>&sigma;<sub>Program = 'MCS'</sub> (STUDENT)</code></li>
  <li><strong>Matching Output Tuples:</strong>
    <ul>
      <li><code>(S101, Ali, MCS, 4)</code></li>
      <li><code>(S103, Tariq, MCS, 5)</code></li>
      <li><code>(S105, Usman, MCS, 4)</code></li>
    </ul>
  </li>
  <li><strong>Degree:</strong> 4 attributes (all original columns preserved).</li>
  <li><strong>Cardinality:</strong> 3 tuples.</li>
</ul>

<h4>(b) Projection of "Program" Attribute:</h4>
<ul>
  <li><strong>Expression:</strong> <code>&Pi;<sub>Program</sub> (STUDENT)</code></li>
  <li><strong>Output Tuples (Set-Theoretic Duplicate Elimination):</strong>
    <ul>
      <li><code>(MCS)</code></li>
      <li><code>(BIT)</code></li>
      <li><code>(BCS)</code></li>
    </ul>
  </li>
  <li><strong>Degree:</strong> 1 attribute.</li>
  <li><strong>Cardinality:</strong> 3 tuples (reduced from 6 rows because <code>MCS</code> and <code>BIT</code> duplicates are removed).</li>
</ul>

<h4>(c) Why Projection Eliminates Duplicates:</h4>
<p>By mathematical definition, a <strong>relation is a set of tuples</strong>, and a set cannot contain duplicate elements. In Selection, because the original relation possesses a Primary Key (<code>StID</code>) ensuring all input rows are distinct, any horizontal subset of rows remains strictly unique. However, when Projection removes the primary key column (<code>StID</code>), multiple remaining tuples may become completely identical across the retained columns. To maintain relational set validity, the DBMS must eliminate these duplicate rows.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 149–151).</p>',
    urdu_answer: '(a) سلیکشن &sigma;<sub>Program = "MCS"</sub>(STUDENT): رزلٹ میں علی، طارق اور عثمان آئیں گے؛ ڈگری 4 اور کارڈینالٹی 3 ہوگی۔ (b) پروجیکشن &Pi;<sub>Program</sub>(STUDENT): رزلٹ میں صرف یونیک پروگرامز {MCS, BIT, BCS} آئیں گے؛ ڈگری 1 اور کارڈینالٹی 3 ہوگی۔ (c) پروجیکشن اس لیے ڈپلیکیٹ ختم کرتا ہے کیونکہ پرائمری کی کے ہٹ جانے سے ایک جیسے ریکارڈز پیدا ہو سکتے ہیں اور ریاضیاتی سیٹ میں ڈپلیکیٹس کی اجازت نہیں ہوتی۔'
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
console.log(`CS403 Lecture 15 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

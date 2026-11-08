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

// 2. Create or fetch Lecture 17 for CS403
let lec17 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 17").get(cs403.id);
if (!lec17) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 17, 'Relational Algebra: Join Operations and Relational Calculus')
  `).run(cs403.id);
  lec17 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 17 with ID: ${lec17.id}`);
} else {
  console.log(`CS403 Lecture 17 found with ID: ${lec17.id}`);
}

const lId = lec17.id;

// 3. Clear existing questions for Lecture 17 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 17.`);

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
    stem: 'Which relational algebra operation combines a Cartesian product followed by a selection condition into a single unified binary operation?',
    options: {
      a: 'Join',
      b: 'Select',
      c: 'Project',
      d: 'Union'
    },
    correct: 'a',
    explanation: '<p>A <strong>Join</strong> operation combines a Cartesian product (\(\times\)) and a Selection (\(\sigma\)) into a single composite operation (CS403 Handouts Page 148 / 157). Appeared 6 times across past papers.</p>',
    urdu_answer: 'جوائن (Join) آپریشن کارٹیشین پروڈکٹ اور سلیکشن کو یکجا کر کے ایک ہی آپریشن میں تبدیل کر دیتا ہے۔'
  },
  {
    stem: 'In relational algebra, the general Theta Join between relation R and relation S is denoted mathematically as:',
    options: {
      a: 'R x S',
      b: 'R \u22c8\u03b8 S',
      c: 'R \u222a S',
      d: 'R \u2229 S'
    },
    correct: 'b',
    explanation: '<p>A <strong>Theta Join</strong> is denoted as <strong>R &#x22C8;<sub>&#952;</sub> S</strong>, where &#952; represents a comparison predicate containing operators such as &lt;, &le;, =, &ne;, &gt;, or &ge; (CS403 Handouts Page 157). Appeared 5 times.</p>',
    urdu_answer: 'تھیٹا جوائن کو ریاضیاتی علامت R &#x22C8;<sub>&#952;</sub> S کے ذریعے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'In a ______ Join, only those paired rows of two relations that satisfy a specified relational comparison condition (&theta;) are included in the cross product.',
    options: {
      a: 'Normal Join',
      b: 'Theta Join',
      c: 'Outer Join',
      d: 'Semi Join'
    },
    correct: 'b',
    explanation: '<p>A <strong>Theta Join</strong> produces all tuple combinations from the Cartesian product of R and S that satisfy the specific condition &#952; (CS403 Handouts Page 157). Appeared 5 times across past papers.</p>',
    urdu_answer: 'تھیٹا جوائن (Theta Join) میں دو ٹیبلز کے صرف وہی ریکارڈز شامل کیے جاتے ہیں جو دی گئی مخصوص شرط (&#952;) پر پورا اترتے ہوں۔'
  },
  {
    stem: 'In which type of join do the common join attributes appear TWICE in the resulting output table schema?',
    options: {
      a: 'Natural Join',
      b: 'Semi Join',
      c: 'Equi-Join',
      d: 'Outer Join'
    },
    correct: 'c',
    explanation: '<p>An <strong>Equi-Join</strong> is a theta join where the comparison operator is strictly equality (<code>=</code>). Because attributes from both participating relations are preserved, the common join attributes appear <strong>twice</strong> (qualified with table prefixes) (CS403 Handouts Page 158). Appeared 6 times.</p>',
    urdu_answer: 'ایکوی جوائن (Equi-Join) میں مساوات کی شرط پر جوائن ہوتا ہے لیکن مشترکہ کالمز رزلٹ ٹیبل میں دو بار ظاہر ہوتے ہیں۔'
  },
  {
    stem: 'In a Natural Join of two relations, how many times does the common joining attribute appear in the resulting schema?',
    options: {
      a: 'Twice',
      b: 'Three times',
      c: 'Once',
      d: 'Four times'
    },
    correct: 'c',
    explanation: '<p>A <strong>Natural Join</strong> automatically eliminates duplicate common attributes from the output schema, meaning the common attribute appears exactly <strong>once</strong> (CS403 Handouts Page 159). Appeared 6 times.</p>',
    urdu_answer: 'نیچرل جوائن (Natural Join) میں ڈپلیکیٹ کالمز ختم کر دیے جاتے ہیں اور مشترکہ کالم صرف ایک بار ہی ظاہر ہوتا ہے۔'
  },
  {
    stem: 'Which join operation produces the exact same tuples as an Equi-Join, with the sole difference being that redundant duplicate common attributes are eliminated?',
    options: {
      a: 'Natural Join',
      b: 'Semi Join',
      c: 'Outer Join',
      d: 'Theta Join'
    },
    correct: 'a',
    explanation: '<p><strong>Natural Join</strong> is conceptually an Equi-Join followed by a projection that removes duplicate columns of the shared join attributes (CS403 Handouts Page 159). Appeared 5 times.</p>',
    urdu_answer: 'نیچرل جوائن دراصل ایکوی جوائن کی طرح ہی کام کرتا ہے مگر اضافی اور ڈپلیکیٹ مشترکہ کالمز کو ہٹا دیتا ہے۔'
  },
  {
    stem: 'In a ______ Join, first the natural join of two relations R and S is computed, and then ONLY the attributes of the first relation (R) are projected into the final output.',
    options: {
      a: 'Equi-Join',
      b: 'Theta Join',
      c: 'Semi-Join',
      d: 'Full Outer Join'
    },
    correct: 'c',
    explanation: '<p>A <strong>Semi-Join</strong> (R &#x22C9; S) evaluates the natural join of R and S, and then projects only the attributes of the first relation R (CS403 Handouts Page 161–162). Appeared 4 times.</p>',
    urdu_answer: 'سیمی جوائن (Semi-Join) میں پہلے دو ٹیبلز کا نیچرل جوائن نکالا جاتا ہے اور پھر صرف پہلے ٹیبل کے ایٹری بیوٹس کو ہی رزلٹ میں شامل کیا جاتا ہے۔'
  },
  {
    stem: 'In a Left Outer Join, unmatched tuples from the ______ relation are preserved in the output table, with missing attributes from the other relation filled with ______.',
    options: {
      a: 'Left, Zero',
      b: 'Left, NULL',
      c: 'Right, NULL',
      d: 'Right, Empty Space'
    },
    correct: 'b',
    explanation: '<p>In a <strong>Left Outer Join</strong>, all tuples from the <em>left</em> relation are preserved in the output; any unmatched columns from the right relation are filled with <strong>NULL</strong> values (CS403 Handouts Page 161). Appeared 4 times.</p>',
    urdu_answer: 'لیفٹ آؤٹر جوائن میں بائیں ٹیبل کے تمام ریکارڈز محفوظ رہتے ہیں اور دائیں ٹیبل سے نہ ملنے والے کالمز کی جگہ NULL درج کر دیا جاتا ہے۔'
  },
  {
    stem: 'Unlike procedural relational algebra, Relational Calculus is classified as a ______ query language founded on first-order predicate logic.',
    options: {
      a: 'Procedural',
      b: 'Non-procedural (Declarative)',
      c: 'Object-Oriented',
      d: 'Imperative Structural'
    },
    correct: 'b',
    explanation: '<p><strong>Relational Calculus</strong> is a <em>non-procedural (declarative)</em> language: it specifies <em>what</em> information is desired without specifying the procedural steps for retrieving it (CS403 Handouts Page 162). Appeared 4 times.</p>',
    urdu_answer: 'ریلیشنل کیلکولس ایک غیر پروسیجرل (Declarative) زبان ہے جس میں مطلوبہ ڈیٹا کی وضاحت کی جاتی ہے بغیر یہ بتائے کہ اسے کس ترتیب میں حاصل کرنا ہے۔'
  },
  {
    stem: 'Relational Calculus is broadly classified into how many primary computational categories?',
    options: {
      a: 'Two (Tuple-Oriented and Domain-Oriented)',
      b: 'Three',
      c: 'Four',
      d: 'Five'
    },
    correct: 'a',
    explanation: '<p>Relational Calculus is divided into <strong>two</strong> main branches: Tuple-Oriented Relational Calculus (TRC) and Domain-Oriented Relational Calculus (DRC) (CS403 Handouts Page 162). Appeared 3 times.</p>',
    urdu_answer: 'ریلیشنل کیلکولس کی دو بنیادی شاخیں ہیں: ٹپل اورینٹڈ ریلیشنل کیلکولس (TRC) اور ڈومین اورینٹڈ ریلیشنل کیلکولس (DRC)۔'
  }
];

// 5 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'Define the Join Operation in Relational Algebra. Why is it considered a derived (non-fundamental) operation?',
    correct: `<p>A <strong>Join</strong> is a binary relational algebra operation that merges related tuples from two relations based on a common logical comparison predicate.</p>
<h4>Why it is a Derived Operation:</h4>
<p>Join is not part of the minimal set of fundamental relational algebra operators (Select, Project, Union, Set Difference, Cartesian Product). It is defined as a <strong>derived operation</strong> because any join can be completely expressed using a <strong>Cartesian Product (\(\times\))</strong> followed immediately by a <strong>Selection (\(\sigma\))</strong>:</p>
<p style="text-align: center;"><code>R &#x22C8;<sub>&theta;</sub> S = &sigma;<sub>&theta;</sub>(R &times; S)</code></p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 148 / 157).</p>',
    urdu_answer: 'جوائن آپریشن دو ٹیبلز کے متعلقہ ریکارڈز کو مشترکہ شرط کی بنیاد پر جوڑتا ہے۔ اسے ڈیرائیو شدہ (Derived) آپریشن اس لیے کہا جاتا ہے کیونکہ یہ بنیادی کارٹیشین پروڈکٹ اور سلیکشن کا مجموعہ ہے: R &#x22C8;<sub>&theta;</sub> S = &sigma;<sub>&theta;</sub>(R &times; S)۔'
  },
  {
    stem: 'Differentiate between an Equi-Join and a Natural Join with an example.',
    correct: `<p>The difference between an <strong>Equi-Join</strong> and a <strong>Natural Join</strong> lies in attribute redundancy:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Feature</th>
      <th>Equi-Join</th>
      <th>Natural Join</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Join Condition</strong></td>
      <td>Uses explicit equality operator (<code>=</code>) on specified attributes.</td>
      <td>Implicitly matches all attributes with identical names across both relations.</td>
    </tr>
    <tr>
      <td><strong>Attribute Duplication</strong></td>
      <td>Common join attributes appear <strong>twice</strong> in the output (e.g., <code>R.A, S.A</code>).</td>
      <td>Duplicate common attributes are automatically eliminated; appears <strong>only once</strong>.</td>
    </tr>
    <tr>
      <td><strong>Mathematical Notation</strong></td>
      <td><code>R &#x22C8;<sub>R.A = S.A</sub> S</code></td>
      <td><code>R &#x22C8; S</code></td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 158–159) and CS403 MIDTERM SOLVED MCQS By EducationGator.</p>',
    urdu_answer: 'ایکوی جوائن میں مساوات کی بنیاد پر موازنہ ہوتا ہے مگر مشترکہ کالمز دو بار ظاہر ہوتے ہیں۔ جبکہ نیچرل جوائن میں دونوں ٹیبلز کے ہم نام کالمز کی بنیاد پر جوائن ہوتا ہے اور ڈپلیکیٹ کالمز ختم ہو کر مشترکہ کالم صرف ایک بار نظر آتا ہے۔'
  },
  {
    stem: 'Explain Outer Joins: Left Outer Join, Right Outer Join, and Full Outer Join.',
    correct: `<p>Unlike inner joins which discard non-matching rows, <strong>Outer Joins</strong> preserve non-matching tuples by padding missing values with <code>NULL</code>:</p>
<ol>
  <li><strong>Left Outer Join:</strong> Keeps all tuples from the left relation. For tuples with no match in the right relation, right-side attributes are populated with <code>NULL</code>.</li>
  <li><strong>Right Outer Join:</strong> Keeps all tuples from the right relation. Unmatched left-side attributes are populated with <code>NULL</code>.</li>
  <li><strong>Full Outer Join:</strong> Preserves all tuples from both relations. Non-matching attributes from either side are padded with <code>NULL</code>.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 161).</p>',
    urdu_answer: 'آؤٹر جوائنز ان ریکارڈز کو بھی محفوظ رکھتے ہیں جو جوائن شرط پر پورا نہیں اترتے: لیفٹ آؤٹر جوائن بائیں ٹیبل کے تمام ریکارڈز کو رکھ کر دائیں جانب NULL ڈالتا ہے؛ رائٹ آؤٹر جوائن دائیں ٹیبل کو ترجیح دیتا ہے؛ اور فل آؤٹر جوائن دونوں ٹیبلز کے تمام ریکارڈز کو ملا کر خالی جگہوں پر NULL لگا دیتا ہے۔'
  },
  {
    stem: 'What is a Semi-Join? Describe its mathematical definition and two-step evaluation procedure.',
    correct: `<p>A <strong>Semi-Join</strong> between relation \(R\) and relation \(S\) (denoted \(R \ltimes S\)) produces all tuples in \(R\) for which there is at least one matching tuple in \(S\).</p>
<h4>Two-Step Evaluation:</h4>
<ol>
  <li><strong>Step 1:</strong> Compute the standard <em>Natural Join</em> of relation \(R\) and relation \(S\) (\(R \bowtie S\)).</li>
  <li><strong>Step 2:</strong> Project (select) <strong>only the attributes belonging to relation \(R\)</strong>, discarding all columns belonging to relation \(S\):
  <p style="text-align: center;"><code>R &ltimes; S = &Pi;<sub>R.*</sub> (R &#x22C8; S)</code></p>
  </li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 161–162) and CS403 MIDTERM FILE 2 SOLVED BY TEAM HADI.</p>',
    urdu_answer: 'سیمی جوائن (R &ltimes; S) بائیں ریلیشن R کے صرف ان ریکارڈز کو لاتا ہے جن کا دائیں ریلیشن S میں جوڑ موجود ہو۔ اس کا طریقہ کار یہ ہے کہ پہلے R اور S کا نیچرل جوائن نکالا جاتا ہے اور پھر صرف پہلے ٹیبل R کے کالمز کو پروجیکٹ کیا جاتا ہے۔'
  },
  {
    stem: 'Differentiate between Relational Algebra and Relational Calculus.',
    correct: `<p>Relational Algebra and Relational Calculus are formally equivalent in expressive power (Relational Completeness) but differ in execution paradigm:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Dimension</th>
      <th>Relational Algebra</th>
      <th>Relational Calculus</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Paradigm</strong></td>
      <td><strong>Procedural:</strong> Specifies <em>how</em> to compute the query step by step.</td>
      <td><strong>Non-Procedural (Declarative):</strong> Specifies <em>what</em> result is wanted without steps.</td>
    </tr>
    <tr>
      <td><strong>Foundations</strong></td>
      <td>Based on mathematical set theory and procedural operators (\(\sigma, \pi, \times, \cup, \bowtie\)).</td>
      <td>Based on First-Order Predicate Logic (Quantifiers \(\forall, \exists\)).</td>
    </tr>
    <tr>
      <td><strong>Commercial Analogy</strong></td>
      <td>Underlying execution plan evaluated by DBMS query optimizers.</td>
      <td>High-level declarative SQL queries written by users.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 162).</p>',
    urdu_answer: 'ریلیشنل الجبرا ایک پروسیجرل زبان ہے جو یہ بتاتی ہے کہ ڈیٹا کو قدم بہ قدم کیسے (How) حاصل کرنا ہے۔ جبکہ ریلیشنل کیلکولس ایک ڈکلیریٹو (Non-procedural) زبان ہے جو صرف یہ بتاتی ہے کہ کیا (What) ڈیٹا چاہیے، یہ براؤزنگ اور انٹرنل کوئری پلاننگ کے لیے بنیاد فراہم کرتی ہے۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Write a comprehensive note on the types of Join Operations in Relational Algebra. Detail Theta Join, Equi-Join, Natural Join, Outer Joins (Left, Right, Full), and Semi-Join with notation and characteristics.',
    correct: `<p><strong>Join Operations</strong> are binary operators that correlate tuples from two relations based on logical relationships between shared attributes:</p>

<h4>1. Theta Join (\(R \bowtie_{\theta} S\)):</h4>
<p>Combines Cartesian product with a selection condition \(\theta\) using any comparison operator (\(<, \le, =, \ne, >, \ge\)). Example: <code>EMP &#x22C8;<sub>EMP.Salary &gt; DEPT.Budget</sub> DEPT</code>.</p>

<h4>2. Equi-Join:</h4>
<p>A specialized Theta Join where the comparison condition involves strictly equality (<code>=</code>). Join attributes appear twice in the resulting schema with table prefixes (e.g., <code>EMP.DeptID, DEPT.DeptID</code>).</p>

<h4>3. Natural Join (\(R \bowtie S\)):</h4>
<p>An Equi-Join performed over all identically named attributes in both relations, with duplicate common attributes systematically eliminated from the output.</p>

<h4>4. Outer Joins:</h4>
<p>Inner joins omit records lacking a match. Outer joins prevent loss of information by populating missing attributes with <code>NULL</code>:</p>
<ul>
  <li><strong>Left Outer Join:</strong> Retains all rows from the left table.</li>
  <li><strong>Right Outer Join:</strong> Retains all rows from the right table.</li>
  <li><strong>Full Outer Join:</strong> Retains all rows from both tables, with nulls for missing counterparts.</li>
</ul>

<h4>5. Semi-Join (\(R \ltimes S\)):</h4>
<p>Returns only tuples from relation \(R\) that participate in a natural join with \(S\). Used in distributed databases to minimize transmission bandwidth across network nodes.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 157–162).</p>',
    urdu_answer: 'ریلیشنل الجبرا کے جوائن آپریشنز کا تفصیلی نوٹ: تھیٹا جوائن کسی بھی حسابی شرط پر ہوتا ہے؛ ایکوی جوائن مساوات کی شرط پر کام کرتا ہے جس میں مشترکہ کالمز دو بار آتے ہیں؛ نیچرل جوائن میں ڈپلیکیٹ کالمز ختم ہو جاتے ہیں؛ آؤٹر جوائنز (لیفٹ، رائٹ، فل) نہ ملنے والے ریکارڈز کو NULL کے ساتھ محفوظ رکھتے ہیں؛ اور سیمی جوائن صرف بائیں ٹیبل کے ملنے والے کالمز کو پروجیکٹ کرتا ہے۔'
  },
  {
    stem: 'Discuss Relational Calculus in detail. Differentiate between Tuple-Oriented Relational Calculus (TRC) and Domain-Oriented Relational Calculus (DRC), and explain the concept of Relational Completeness.',
    correct: `<p><strong>Relational Calculus</strong> is a formal non-procedural query language based on first-order predicate logic. Rather than prescribing a sequence of operational steps, a relational calculus expression defines the predicate conditions that the desired result tuples must satisfy.</p>

<h4>1. Tuple-Oriented Relational Calculus (TRC):</h4>
<ul>
  <li>Variables in TRC represent <strong>tuples</strong> that range over relations.</li>
  <li>A query expression takes the mathematical format:
  <p style="text-align: center;"><code>{ t | P(t) }</code></p>
  where <code>t</code> is a tuple variable and <code>P(t)</code> is a logical predicate formula (using quantifiers \(\exists\) "there exists" and \(\forall\) "for all").</li>
  <li><em>Example:</em> <code>{ t | t &isin; EMP &and; t.DeptID = 'CS' }</code> retrieves all employee tuples working in the CS department.</li>
</ul>

<h4>2. Domain-Oriented Relational Calculus (DRC):</h4>
<ul>
  <li>Variables in DRC range over <strong>individual attribute domains</strong> rather than entire tuples.</li>
  <li>A query expression takes the format:
  <p style="text-align: center;"><code>{ &lang;x<sub>1</sub>, x<sub>2</sub>, ..., x<sub>n</sub>&rang; | P(x<sub>1</sub>, x<sub>2</sub>, ..., x<sub>n</sub>) }</code></p></li>
  <li><em>Example:</em> <code>{ &lang;id, name&rang; | &exist;d (&lang;id, name, d&rang; &isin; EMP &and; d = 'CS') }</code>.</li>
</ul>

<h4>3. Relational Completeness:</h4>
<p>E.F. Codd established that Relational Algebra, TRC, and DRC are mathematically equivalent in expressive power. Any commercial database language (like standard SQL) that can express all queries expressible in relational algebra is classified as <strong>Relationally Complete</strong>.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 162).</p>',
    urdu_answer: 'ریلیشنل کیلکولس فرسٹ آرڈر پریڈیکیٹ لاجک پر مبنی غیر پروسیجرل زبان ہے۔ ٹپل ریلیشنل کیلکولس (TRC) میں ویری ایبلز پورے ٹپلز کی نمائندگی کرتے ہیں ({t | P(t)})، جبکہ ڈومین ریلیشنل کیلکولس (DRC) میں ویری ایبلز کالموں کے ڈومینز پر لاگو ہوتے ہیں۔ ای ایف کاڈ کے مطابق ریلیشنل الجبرا اور دونوں کیلکولس مساوی طاقت رکھتے ہیں اور اس معیار کو ریلیشنل کمپلیٹنس (Relational Completeness) کہا جاتا ہے۔'
  },
  {
    stem: 'Join Evaluation Problem: Given the following two relational database tables:\n\nFACULTY(facId, facName, Dept):\n(F101, Ali, CS)\n(F102, Sara, ENG)\n(F103, Tariq, MATH)\n\nCOURSE(crCode, crName, facId):\n(CS101, Programming, F101)\n(CS201, Data Structures, F101)\n(ENG101, English, F102)\n(PHY101, Physics, F104)\n\nEvaluate and list the complete output tuples, degree (number of attributes), and cardinality (number of tuples) for:\n(a) Natural Join: FACULTY \u22c8 COURSE\n(b) Left Outer Join: FACULTY Left-Join COURSE\n(c) Semi-Join: FACULTY \u22c9 COURSE',
    correct: `<p>Evaluation of relational join operations across <code>FACULTY</code> and <code>COURSE</code>:</p>

<h4>(a) Natural Join (FACULTY &#x22C8; COURSE):</h4>
<p>Matches tuples on common attribute <code>facId</code> (F101 and F102 match; F103 and F104 have no counterpart):</p>
<ul>
  <li><code>(F101, Ali, CS, CS101, Programming)</code></li>
  <li><code>(F101, Ali, CS, CS201, Data Structures)</code></li>
  <li><code>(F102, Sara, ENG, ENG101, English)</code></li>
</ul>
<p><strong>Degree:</strong> 5 attributes | <strong>Cardinality:</strong> 3 tuples</p>

<h4>(b) Left Outer Join (FACULTY &#x27DF; COURSE):</h4>
<p>Preserves all tuples of left relation <code>FACULTY</code>, padding unmatched right attributes with <code>NULL</code>:</p>
<ul>
  <li><code>(F101, Ali, CS, CS101, Programming)</code></li>
  <li><code>(F101, Ali, CS, CS201, Data Structures)</code></li>
  <li><code>(F102, Sara, ENG, ENG101, English)</code></li>
  <li><code>(F103, Tariq, MATH, NULL, NULL)</code></li>
</ul>
<p><strong>Degree:</strong> 5 attributes | <strong>Cardinality:</strong> 4 tuples</p>

<h4>(c) Semi-Join (FACULTY &#x22C9; COURSE):</h4>
<p>Returns only tuples of <code>FACULTY</code> that match at least one record in <code>COURSE</code> (only attributes of <code>FACULTY</code> are projected):</p>
<ul>
  <li><code>(F101, Ali, CS)</code></li>
  <li><code>(F102, Sara, ENG)</code></li>
</ul>
<p><strong>Degree:</strong> 3 attributes | <strong>Cardinality:</strong> 2 tuples</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 157–162).</p>',
    urdu_answer: '(a) نیچرل جوائن: وہ ریکارڈز جن کی facId ملتی ہے (3 ٹپلز، 5 ڈگری)۔ (b) لیفٹ آؤٹر جوائن: فیکلٹی کے تمام ارکان بشمول طارق (F103) جن کے کورس کی جگہ NULL آئے گا (4 ٹپلز، 5 ڈگری)۔ (c) سیمی جوائن: فیکلٹی کے صرف وہ ارکان جو کورس پڑھا رہے ہیں یعنی علی اور سارہ (2 ٹپلز، 3 ڈگری)۔'
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
console.log(`CS403 Lecture 17 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

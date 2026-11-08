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

// 2. Create or fetch Lecture 18 for CS403
let lec18 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 18").get(cs403.id);
if (!lec18) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 18, 'Functional Dependencies, Inference Rules, and Normalization')
  `).run(cs403.id);
  lec18 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 18 with ID: ${lec18.id}`);
} else {
  console.log(`CS403 Lecture 18 found with ID: ${lec18.id}`);
}

const lId = lec18.id;

// 3. Clear existing questions for Lecture 18 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 18.`);

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
    stem: 'A functional dependency between two attributes or sets of attributes Q and P is formally represented by the mathematical notation:',
    options: {
      a: 'Q \u2192 P',
      b: 'Q \u2194 P',
      c: 'Q * P',
      d: 'Q + P'
    },
    correct: 'a',
    explanation: '<p>Functional dependency is denoted as <strong>Q &rarr; P</strong>, pronounced "Q functionally determines P" or "P is functionally dependent on Q" (CS403 Handouts Page 164). Appeared 6 times.</p>',
    urdu_answer: 'فنکشنل ڈیپینڈینسی کو ریاضیاتی طور پر Q &rarr; P سے ظاہر کیا جاتا ہے جس کا مطلب ہے کہ Q کی قیمت P کی قیمت کا تعین کرتی ہے۔'
  },
  {
    stem: 'Functional dependencies that hold unconditionally under Armstrong\'s inference rule of reflexivity (such as X \u2192 Y where Y is a subset of X) are termed ______ dependencies.',
    options: {
      a: 'Augmented',
      b: 'Transitive',
      c: 'Projective',
      d: 'Trivial'
    },
    correct: 'd',
    explanation: '<p>A dependency <code>X &rarr; Y</code> is defined as <strong>Trivial</strong> if Y is a subset of X (e.g., <code>{EmpID, Name} &rarr; EmpID</code>). Such dependencies are self-evident and hold true in all possible relations (CS403 Handouts Page 166). Appeared 5 times.</p>',
    urdu_answer: 'ریفلیسکیوٹی کے تحت حاصل ہونے والی ڈیپینڈینسیز کو ٹریویل (Trivial) کہا جاتا ہے کیونکہ وہ ہمیشہ اور لازمی طور پر درست ہوتی ہیں۔'
  },
  {
    stem: 'If A \u2192 B and A \u2192 C hold in a relation, then A \u2192 BC also holds. Which Armstrong inference rule is applied here?',
    options: {
      a: 'Union (Additivity) Rule',
      b: 'Decomposition (Projectivity) Rule',
      c: 'Augmentation Rule',
      d: 'Reflexivity Rule'
    },
    correct: 'a',
    explanation: '<p>The <strong>Union (Additivity) Rule</strong> states that if a single determinant functionally determines multiple attributes individually (A &rarr; B and A &rarr; C), it determines their collective combination: <code>A &rarr; BC</code> (CS403 Handouts Page 166). Appeared 5 times.</p>',
    urdu_answer: 'یونین (Union یا Additivity) کا اصول کہتا ہے کہ اگر A سے B اور A سے C حاصل ہوتا ہو تو A سے BC بھی حاصل ہوگا۔'
  },
  {
    stem: 'If A \u2192 BC holds in a relation schema, then A \u2192 B and A \u2192 C both hold independently. This inference rule is known as:',
    options: {
      a: 'Decomposition (Projectivity) Rule',
      b: 'Union Rule',
      c: 'Reflexivity Rule',
      d: 'Transitivity Rule'
    },
    correct: 'a',
    explanation: '<p>The <strong>Decomposition (or Projectivity) Rule</strong> states that if a set of attributes is determined by A, any individual subset of those attributes is also determined by A (CS403 Handouts Page 166). Appeared 4 times.</p>',
    urdu_answer: 'ڈی کمپوزیشن (Decomposition) کا اصول یہ بتاتا ہے کہ اگر A سے BC طے ہوتا ہو تو دائیں جانب کو توڑ کر الگ الگ A &rarr; B اور A &rarr; C لکھا جا سکتا ہے۔'
  },
  {
    stem: 'A database anomaly where deleting a student record unintentionally destroys unrelated course information from the database is called a(n):',
    options: {
      a: 'Insertion Anomaly',
      b: 'Updation Anomaly',
      c: 'Redundancy Anomaly',
      d: 'Deletion Anomaly'
    },
    correct: 'd',
    explanation: '<p>A <strong>Deletion Anomaly</strong> occurs when the removal of one piece of data inadvertently leads to the unintentional loss of completely different, valuable information (CS403 Handouts Page 170). Appeared 5 times.</p>',
    urdu_answer: 'ڈیلیشن اینوملی (Deletion Anomaly) وہ خرابی ہے جس میں کسی ایک ریکارڈ کو مٹانے سے اس سے جڑا ہوا کوئی دوسرا ضروری ڈیٹا غیر ارادی طور پر خود بخود ضائع ہو جاتا ہے۔'
  },
  {
    stem: 'Which of the following is NOT an intended benefit of database normalization?',
    options: {
      a: 'Minimizing insertion anomalies',
      b: 'Minimizing deletion anomalies',
      c: 'Minimizing updation anomalies',
      d: 'Maximizing data redundancy'
    },
    correct: 'd',
    explanation: '<p>Normalization is designed specifically to <strong>eliminate / minimize redundancy</strong>, not maximize it (CS403 Handouts Page 166). Appeared 6 times across past papers.</p>',
    urdu_answer: 'ڈیٹا کی غیر ضروری تکرار (Redundancy) کو بڑھانا نارملائزیشن کا مقصد نہیں ہے بلکہ اسے ختم کرنا اس کا اصل ہدف ہے۔'
  },
  {
    stem: 'In the formal functional dependency notation X \u2192 Y, the left-hand side X is called the ______ and the right-hand side Y is called the ______.',
    options: {
      a: 'Dependent, Determinant',
      b: 'Determinant, Dependent',
      c: 'Foreign Key, Primary Key',
      d: 'Domain, Range'
    },
    correct: 'b',
    explanation: '<p>In <code>X &rarr; Y</code>, <strong>X is the Determinant</strong> (the attribute doing the determining) and <strong>Y is the Dependent</strong> (the attribute being determined) (CS403 Handouts Page 164). Appeared 4 times.</p>',
    urdu_answer: 'X &rarr; Y میں بائیں جانب X کو ڈیٹرمیننٹ (Determinant) اور دائیں جانب Y کو ڈیپینڈینٹ (Dependent) کہا جاتا ہے۔'
  },
  {
    stem: 'Which Armstrong inference axiom states that if X \u2192 Y and Y \u2192 Z, then X \u2192 Z logically holds?',
    options: {
      a: 'Reflexivity',
      b: 'Augmentation',
      c: 'Transitivity',
      d: 'Decomposition'
    },
    correct: 'c',
    explanation: '<p>The <strong>Transitivity Rule</strong> states that if X determines Y and Y determines Z, then X transitively determines Z (CS403 Handouts Page 166). Appeared 5 times.</p>',
    urdu_answer: 'ٹرانزیٹیویٹی (Transitivity) کا اصول کہتا ہے کہ اگر X سے Y اور Y سے Z طے ہوتا ہو، تو بالواسطہ طور پر X سے Z بھی حاصل ہوگا۔'
  },
  {
    stem: 'Which Armstrong inference axiom states that if X \u2192 Y holds, then XZ \u2192 YZ also holds for any arbitrary attribute set Z?',
    options: {
      a: 'Reflexivity',
      b: 'Augmentation',
      c: 'Transitivity',
      d: 'Union'
    },
    correct: 'b',
    explanation: '<p>The <strong>Augmentation Rule</strong> asserts that adding the same set of attributes Z to both the determinant and the dependent preserves the validity of the dependency (CS403 Handouts Page 166). Appeared 4 times.</p>',
    urdu_answer: 'اگمنٹیشن (Augmentation) کا اصول بتاتا ہے کہ اگر X &rarr; Y درست ہے تو دونوں طرف Z کا اضافہ کرنے سے XZ &rarr; YZ بھی درست ہوگا۔'
  },
  {
    stem: 'The formal, systematic engineering process of decomposing complex relational tables into smaller, well-structured relations to eliminate redundancy and prevent update anomalies is termed:',
    options: {
      a: 'Denormalization',
      b: 'Normalization',
      c: 'Database Partitioning',
      d: 'Physical Indexing'
    },
    correct: 'b',
    explanation: '<p><strong>Normalization</strong> is the multi-stage theoretical process of structuring relational database schemas to eliminate anomalies and redundant data storage (CS403 Handouts Page 166). Appeared 4 times.</p>',
    urdu_answer: 'نارملائزیشن (Normalization) وہ مرحلہ وار سائنسی عمل ہے جس میں ٹیبلز کو تقسیم کر کے ڈیٹا کی تکرار اور اینوملیز کا خاتمہ کیا جاتا ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'Define Functional Dependency (FD) in relational database theory. Identify its two core components.',
    correct: `<p>A <strong>Functional Dependency</strong> is an integrity constraint between two sets of attributes in a relation. Formally, for relation schema \(R\), attribute set \(Y\) is functionally dependent on attribute set \(X\) (written as <code>X &rarr; Y</code>) if, whenever two tuples agree on their values for \(X\), they must also agree on their values for \(Y\):</p>
<p style="text-align: center;"><code>t1[X] = t2[X] &rArr; t1[Y] = t2[Y]</code></p>
<h4>Two Core Components:</h4>
<ol>
  <li><strong>Determinant (Left-Hand Side, X):</strong> The attribute or collection of attributes whose values uniquely determine the values of other attributes.</li>
  <li><strong>Dependent (Right-Hand Side, Y):</strong> The attribute whose value is determined by the determinant.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 164).</p>',
    urdu_answer: 'فنکشنل ڈیپینڈینسی دو ایٹری بیوٹس کے درمیان ایسا تعلق ہے جس میں اگر دو ریکارڈز کے فیلڈ X کی ویلیو برابر ہو تو ان کے فیلڈ Y کی ویلیو بھی لازماً برابر ہوگی (X &rarr; Y)۔ اس میں X کو ڈیٹرمیننٹ (تعین کرنے والا) اور Y کو ڈیپینڈینٹ کہتے ہیں۔'
  },
  {
    stem: 'State Armstrong\'s three Primary Inference Rules (Reflexivity, Augmentation, and Transitivity).',
    correct: `<p><strong>Armstrong\'s Axioms</strong> are a set of sound and complete inference rules used to deduce new functional dependencies from a known set of dependencies:</p>
<ol>
  <li><strong>Reflexivity Rule:</strong> If \(Y \subseteq X\), then \(X \rightarrow Y\).<br />
  <em>(Any set of attributes always determines itself or any of its subsets; these are trivial dependencies).</em></li>
  <li><strong>Augmentation Rule:</strong> If \(X \rightarrow Y\), then \(XZ \rightarrow YZ\) for any set of attributes \(Z\).<br />
  <em>(Adding attributes equally to both sides preserves the dependency).</em></li>
  <li><strong>Transitivity Rule:</strong> If \(X \rightarrow Y\) and \(Y \rightarrow Z\), then \(X \rightarrow Z\).<br />
  <em>(Dependencies can chain transitively through intermediate attributes).</em></li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 166).</p>',
    urdu_answer: 'آرمسٹرانگ کے تین بنیادی اصول: (1) ریفلیکسویٹی: اگر Y، X کا ذیلی سیٹ ہو تو X &rarr; Y ہمیشہ درست ہوگا، (2) اگمنٹیشن: اگر X &rarr; Y ہو تو دونوں طرف Z ملانے سے XZ &rarr; YZ بنے گا، اور (3) ٹرانزیٹیویٹی: اگر X &rarr; Y اور Y &rarr; Z ہو تو X &rarr; Z ہوگا۔'
  },
  {
    stem: 'Name and briefly describe the three types of Database Modification Anomalies caused by un-normalized data redundancy.',
    correct: `<p>Un-normalized database tables suffering from data redundancy exhibit three classic <strong>Modification Anomalies</strong>:</p>
<ol>
  <li><strong>Insertion Anomaly:</strong> The inability to insert legitimate information about an entity into the database without fabricating artificial or <code>NULL</code> dummy values for unrelated attributes (e.g., cannot record a new course until a student enrolls).</li>
  <li><strong>Deletion Anomaly:</strong> The unintended, accidental loss of vital entity information when a completely different record is removed (e.g., deleting the last student enrolled in a course inadvertently deletes the course description from the database).</li>
  <li><strong>Updation (Update) Anomaly:</strong> Data inconsistency created when modifying a single real-world fact requires updating redundant copies across multiple rows; failing to update every row produces conflicting data.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 169–171) and CS403 Mid Term Past Papers Mega File (Page 18 Q8).</p>',
    urdu_answer: 'ڈیٹا بیس موڈیفیکیشن اینوملیز کی تین اقسام: (1) انسرشن اینوملی: جب غیر متعلقہ ڈیٹا کے بغیر نیا ریکارڈ داخل نہ کیا جا سکے، (2) ڈیلیشن اینوملی: جب ایک ریکارڈ مٹانے سے دوسرے ضروری ریکارڈز نادانستہ ضائع ہو جائیں، اور (3) اپ ڈیشن اینوملی: جب ایک جگہ تبدیلی کے لیے کئی جگہوں پر ڈیٹا بدلنا پڑے اور تضاد پیدا ہو جائے۔'
  },
  {
    stem: 'What is Normalization? State its two primary engineering objectives.',
    correct: `<p><strong>Normalization</strong> is the formal theoretical technique of organizing database relations through systematic decomposition into well-structured, smaller tables that satisfy specific normal forms (1NF, 2NF, 3NF, BCNF).</p>
<h4>Two Primary Objectives:</h4>
<ol>
  <li><strong>Minimizing Data Redundancy:</strong> Eliminating repetitive storage of duplicate facts, thereby conserving storage space and improving disk I/O performance.</li>
  <li><strong>Eliminating Data Anomalies:</strong> Preventing insertion, deletion, and update anomalies to guarantee that data dependencies are logical and data integrity is preserved across transactions.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 166).</p>',
    urdu_answer: 'نارملائزیشن ٹیبلز کو چھوٹے اور منظم ٹیبلز میں تقسیم کرنے کا ایک سائنسی عمل ہے۔ اس کے دو بنیادی مقاصد ہیں: (1) ڈیٹا کی غیر ضروری تکرار (Redundancy) کو ختم کرنا، اور (2) انسرشن، ڈیلیشن اور اپ ڈیٹ اینوملیز کا خاتمہ کر کے ڈیٹا کی درستگی کو برقرار رکھنا۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Explain Functional Dependencies and Armstrong\'s Inference Axioms in detail. Describe Primary Axioms, Secondary (Derived) Rules (Union, Decomposition, Pseudo-transitivity), and explain the Soundness and Completeness of Armstrong\'s Axioms.',
    correct: `<p>In relational database design, <strong>Functional Dependencies (FDs)</strong> serve as the mathematical foundation for normalization and schema quality analysis.</p>

<h4>1. Functional Dependency Definition & Notation:</h4>
<p>An FD is a semantic assertion that attribute set \(X\) uniquely determines attribute set \(Y\), denoted \(X \rightarrow Y\). If \(Y \subseteq X\), the FD is <strong>Trivial</strong>; if \(Y \not\subseteq X\), it is <strong>Non-Trivial</strong>.</p>

<h4>2. Armstrong\'s Primary Axioms:</h4>
<ul>
  <li><strong>Reflexivity:</strong> If \(Y \subseteq X\), then \(X \rightarrow Y\).</li>
  <li><strong>Augmentation:</strong> If \(X \rightarrow Y\), then \(XZ \rightarrow YZ\).</li>
  <li><strong>Transitivity:</strong> If \(X \rightarrow Y\) and \(Y \rightarrow Z\), then \(X \rightarrow Z\).</li>
</ul>

<h4>3. Secondary (Derived) Rules:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Inference Rule</th>
      <th>Formal Definition</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Union (Additivity)</strong></td>
      <td>If \(X \rightarrow Y\) and \(X \rightarrow Z\), then \(X \rightarrow YZ\).</td>
      <td>Combines common determinants into a composite dependent set.</td>
    </tr>
    <tr>
      <td><strong>Decomposition (Projectivity)</strong></td>
      <td>If \(X \rightarrow YZ\), then \(X \rightarrow Y\) and \(X \rightarrow Z\).</td>
      <td>Splits composite dependents into individual attribute FDs.</td>
    </tr>
    <tr>
      <td><strong>Pseudo-Transitivity</strong></td>
      <td>If \(X \rightarrow Y\) and \(WY \rightarrow Z\), then \(WX \rightarrow Z\).</td>
      <td>Substitutes \(X\) into a composite determinant containing \(Y\).</td>
    </tr>
  </tbody>
</table>

<h4>4. Soundness and Completeness:</h4>
<ul>
  <li><strong>Soundness:</strong> Every functional dependency derived using Armstrong\'s rules is mathematically guaranteed to be true in all relations satisfying the original dependencies.</li>
  <li><strong>Completeness:</strong> Armstrong\'s axioms are sufficient to deduce <em>all</em> functional dependencies that are logically implied by a given set of dependencies (their complete closure \(F^+\)).</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 164–166).</p>',
    urdu_answer: 'فنکشنل ڈیپینڈینسیز اور آرمسٹرانگ کے اصولوں کا تفصیلی جائزہ: بنیادی اصولوں میں ریفلیکسویٹی، اگمنٹیشن اور ٹرانزیٹیویٹی شامل ہیں؛ ثانوی اصولوں میں یونین (مشترکہ ڈیٹرمیننٹ کا جوڑ)، ڈی کمپوزیشن (دائیں جانب کو الگ کرنا) اور سوڈو ٹرانزیٹیویٹی شامل ہیں۔ یہ اصول ساؤنڈ (Sound) ہیں یعنی ہمیشہ درست نتائج دیتے ہیں، اور کمپلیٹ (Complete) ہیں یعنی ان کے ذریعے تمام ممکنہ لاجیکل ڈیپینڈینسیز اخذ کی جا سکتی ہیں۔'
  },
  {
    stem: 'Discuss Data Redundancy and the Three Database Modification Anomalies using a comprehensive real-world student enrollment table example. Explain how normalization solves these issues.',
    correct: `<p>Consider an un-normalized, flat relation storing university enrollment records:</p>
<pre><code>STUDENT_COURSE(StdId, StdName, CourseId, CourseTitle, Instructor, RoomNo)</code></pre>

<h4>1. Data Redundancy:</h4>
<p>If 100 students enroll in course <code>CS403</code>, the values <code>"Database Systems"</code>, <code>"Dr. Kamran"</code>, and <code>"Room 402"</code> are needlessly duplicated 100 times, wasting memory and storage bandwidth.</p>

<h4>2. The Three Modification Anomalies:</h4>
<ul>
  <li><strong>Insertion Anomaly:</strong> Suppose the department creates a new advanced course <code>CS506</code> that currently has no students enrolled. Because <code>StdId</code> is part of the primary key, we cannot insert <code>CS506</code> into <code>STUDENT_COURSE</code> without violating Entity Integrity (entering <code>NULL</code> for <code>StdId</code> is forbidden).</li>
  <li><strong>Deletion Anomaly:</strong> Suppose only one student (<code>StdId = 101</code>) is enrolled in <code>PHY101</code>. If this student drops out and we delete their record, the entire course information for <code>PHY101</code> (its title, instructor, and room) is permanently lost from the university database.</li>
  <li><strong>Updation (Update) Anomaly:</strong> If the lecture room for <code>CS403</code> changes from <code>Room 402</code> to <code>Auditorium B</code>, the database system must locate and update all 100 rows. If the server crashes after updating only 60 rows, the database enters an inconsistent state where the same course appears to be taught in two different rooms simultaneously.</li>
</ul>

<h4>3. Resolution via Normalization:</h4>
<p>Decomposing the flat table into two normalized relations: <code>STUDENT(StdId, StdName)</code>, <code>COURSE(CourseId, CourseTitle, Instructor, RoomNo)</code>, and an enrollment table <code>ENROLLMENT(StdId, CourseId)</code> completely resolves all three anomalies while preserving all dependencies.</p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 169–171).</p>',
    urdu_answer: 'ایک فلیٹ ٹیبل STUDENT_COURSE میں ڈیٹا کی تکرار سے پیدا ہونے والی اینوملیز: (1) انسرشن اینوملی: نیا کورس تب تک درج نہیں ہو سکتا جب تک کوئی طالب علم نہ ہو کیونکہ StdId پرائمری کی ہے۔ (2) ڈیلیشن اینوملی: اگر کسی کورس کے آخری طالب علم کا ریکارڈ ڈیلیٹ کیا جائے تو پورا کورس ہی مٹ جاتا ہے۔ (3) اپ ڈیشن اینوملی: کمرہ تبدیل کرنے کے لیے تمام 100 قطاریں بدلنی پڑتی ہیں، اگر کچھ رہ جائیں تو تضاد پیدا ہو جاتا ہے۔ نارملائزیشن اس ٹیبل کو الگ الگ ٹیبلز میں تقسیم کر کے یہ تمام مسائل حل کرتی ہے۔'
  },
  {
    stem: 'Functional Dependency Inference Problem:\n(a) Given the relation schema `EMPLOYEE(Emp_No, Ename, Address, Dept_No, Dname, Mgr_No)` and the following set of Functional Dependencies:\n  1. `Emp_No \u2192 {Ename, Address, Dept_No}`\n  2. `Dept_No \u2192 {Dname, Mgr_No}`\nDerive the additional Functional Dependency logically implied by Armstrong\'s Transitivity Rule.\n(b) Given the dependencies `X \u2192 Y` and `X \u2192 Z`, state the single combined dependency under the Union Rule.\n(c) Given the dependency `P \u2192 QR`, derive all single-attribute dependencies using the Decomposition Rule.',
    correct: `<p>Step-by-step mathematical derivation using Armstrong\'s Inference Rules:</p>

<h4>Part (a): Transitivity Derivation</h4>
<ol>
  <li>From FD (1), applying the <em>Decomposition Rule</em> gives:
  <p style="text-align: center;"><code>Emp_No &rarr; Dept_No</code></p></li>
  <li>From FD (2), we have:
  <p style="text-align: center;"><code>Dept_No &rarr; {Dname, Mgr_No}</code></p></li>
  <li>Applying Armstrong\'s <strong>Transitivity Rule</strong> (If \(A \rightarrow B\) and \(B \rightarrow C\), then \(A \rightarrow C\)):
  <p style="text-align: center;"><code>Emp_No &rarr; {Dname, Mgr_No}</code></p></li>
  <li>Applying Decomposition further yields the individual transitive dependencies:
  <p style="text-align: center;"><strong><code>Emp_No &rarr; Dname</code></strong> and <strong><code>Emp_No &rarr; Mgr_No</code></strong></p></li>
</ol>

<h4>Part (b): Application of Union Rule</h4>
<p>Given <code>X &rarr; Y</code> and <code>X &rarr; Z</code> with the same determinant <code>X</code>:</p>
<p style="text-align: center;"><strong><code>X &rarr; YZ</code></strong></p>

<h4>Part (c): Application of Decomposition Rule</h4>
<p>Given <code>P &rarr; QR</code> with composite dependent <code>QR</code>:</p>
<p style="text-align: center;"><strong><code>P &rarr; Q</code></strong> and <strong><code>P &rarr; R</code></strong></p>`,
    explanation: '<p><strong>Reference:</strong> CS403 Handouts (Page 166) and CS403 Solved MCQs by Moaaz (Session 4 Q5).</p>',
    urdu_answer: 'حصہ (a): ٹرانزیٹیویٹی رول کے تحت چونکہ Emp_No &rarr; Dept_No ہے اور Dept_No &rarr; {Dname, Mgr_No} ہے، اس لیے نیا اخذ کردہ تعلق Emp_No &rarr; {Dname, Mgr_No} ہوگا۔\nحصہ (b): یونین رول کے تحت X &rarr; Y اور X &rarr; Z کو ملا کر X &rarr; YZ بنے گا۔\nحصہ (c): ڈی کمپوزیشن رول کے تحت P &rarr; QR کو الگ کر کے P &rarr; Q اور P &rarr; R لکھا جائے گا۔'
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
console.log(`CS403 Lecture 18 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

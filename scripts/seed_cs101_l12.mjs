import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS101
const cs101 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs101'").get();
if (!cs101) {
  console.error('CS101 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(cs101.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Database Management Systems, Relational Model, and Data Integrity')
  `).run(cs101.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`CS101 Lecture 12 found with ID: ${lec12.id}`);
}

const lId = lec12.id;

// 3. Clear existing questions for Lecture 12 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 12.`);

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

// 12 MCQs
const mcqs = [
  {
    stem: 'In Computer Science, we store, organize, and link data in a structured and interrelated way using a:',
    options: {
      a: 'SDLC (System Development Life Cycle)',
      b: 'MSDB',
      c: 'DMBS',
      d: 'DBMS (Database Management System)'
    },
    correct: 'd',
    explanation: '<p>A <strong>DBMS</strong> (<em>Database Management System</em>) is system software specifically designed for creating, maintaining, querying, and managing structured collections of interrelated data.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101 MID-Term by Attiq Kundi</code> Page 13 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID</code> Q82.</p>',
    urdu_answer: 'کمپیوٹر سائنس میں باہم مربوط ڈیٹا کو منظم انداز میں محفوظ کرنے، تلاش کرنے اور سنبھالنے کے لیے ڈی بی ایم ایس (DBMS - Database Management System) استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In a relational database table, a field (or combination of fields) that uniquely identifies each individual record is called the:',
    options: {
      a: 'Composite Key',
      b: 'Primary Key',
      c: 'Foreign Key',
      d: 'Secondary Key'
    },
    correct: 'b',
    explanation: '<p>A <strong>Primary Key</strong> is a unique attribute or set of attributes in a table that uniquely identifies each record (row/tuple). It enforces entity integrity and cannot contain null or duplicate values.</p><p><strong>Reference:</strong> Appeared 20+ times including <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q15 Page 76/142 and <code>cs101 midterm subjective by moaaz</code> Fall 2009 Q32.</p>',
    urdu_answer: 'پرائمری کی (Primary Key) ٹیبل کا ایک ایسا مخصوص کالم یا فیلڈ ہوتا ہے جو ہر ریکارڈ کی منفرد شناخت کرتا ہے اور اس کی ویلیو کبھی خالی (Null) یا ڈپلیکیٹ نہیں ہو سکتی۔'
  },
  {
    stem: 'In a relational database system, data is logically organized and stored in the form of two-dimensional:',
    options: {
      a: 'Tables (Relations)',
      b: 'Rows only',
      c: 'Columns only',
      d: 'Hierarchical Trees'
    },
    correct: 'a',
    explanation: '<p>Relational databases organize all data into two-dimensional <strong>Tables</strong> (formally known as <em>relations</em>), where rows represent tuples (individual entities) and columns represent attributes (characteristics).</p><p><strong>Reference:</strong> Appeared 18+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q16 Page 70 & Page 72.</p>',
    urdu_answer: 'ریلیشنل ڈیٹا بیس میں تمام ڈیٹا کو دو سمتی ٹیبلز (جنہیں ریلیشنز بھی کہا جاتا ہے) کی صورت میں قطاروں (Rows) اور کالموں (Columns) میں منظم کیا جاتا ہے۔'
  },
  {
    stem: 'The specialized software system that manages, creates, and controls access to a relational database is called a(n):',
    options: {
      a: 'Data Management System (DMS)',
      b: 'Operating System (OS)',
      c: 'Relational Database Management System (RDBMS)',
      d: 'File Allocation Table (FAT)'
    },
    correct: 'c',
    explanation: '<p>An <strong>RDBMS</strong> (<em>Relational Database Management System</em>) is software that manages data structured according to the relational model (e.g., Oracle, MySQL, Microsoft SQL Server, PostgreSQL).</p><p><strong>Reference:</strong> Appeared 12+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q13 Page 74 & Page 78.</p>',
    urdu_answer: 'ریلیشنل ڈیٹا بیسز کو بنانے، تبدیل کرنے اور منظم کرنے والے سافٹ ویئر سسٹم کو آر ڈی بی ایم ایس (RDBMS - Relational Database Management System) کہا جاتا ہے۔'
  },
  {
    stem: 'A collection of data organized in such a way that the computer can quickly search for, access, and retrieve desired items is known as a:',
    options: {
      a: 'Retrieving Engine',
      b: 'Database',
      c: 'Cache Buffer',
      d: 'Transaction Log'
    },
    correct: 'b',
    explanation: '<p>A <strong>Database</strong> is a persistent, logically coherent collection of interrelated data designed for rapid search, retrieval, updates, and maintenance by computerized systems.</p><p><strong>Reference:</strong> Appeared 14+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q20 and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q22.</p>',
    urdu_answer: 'ڈیٹا بیس (Database) آپس میں جڑے ہوئے ڈیٹا کا ایسا منظم مجموعہ ہے جس میں کمپیوٹر انتہائی تیز رفتاری کے ساتھ معلومات کو تلاش، حاصل اور اپ ڈیٹ کر سکتا ہے۔'
  },
  {
    stem: 'In the early days of computing, traditional database systems were restricted to text and numbers and did NOT support rich multimedia data such as:',
    options: {
      a: 'Floating-point numbers',
      b: 'Boolean values',
      c: 'Video and audio',
      d: 'Text strings'
    },
    correct: 'c',
    explanation: '<p>Early flat-file and relational databases were limited to alphanumeric text and numeric values. Modern databases now support rich binary large objects (BLOBs) including <strong>video</strong>, audio, and high-resolution images.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q11 and <code>Cs101-latest -solved-midterm paper 2.pdf</code> Q11.</p>',
    urdu_answer: 'ابتدائی دور کے ڈیٹا بیس سسٹمز صرف سادہ متن اور ہندسوں کو محفوظ کرتے تھے اور ملٹی میڈیا ڈیٹا جیسے ویڈیو اور آڈیو کو سپورٹ نہیں کرتے تھے۔'
  },
  {
    stem: 'In tabular/relational database storage, the fields (attributes) placed in a particular row are strongly:',
    options: {
      a: 'Independent of each other',
      b: 'Interrelated',
      c: 'Inconsistent',
      d: 'Arbitrary'
    },
    correct: 'b',
    explanation: '<p>In a database table, all fields in a single row belong to the same entity (tuple) and describe its specific properties, making them strongly <strong>interrelated</strong>.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q12 and <code>Cs101-latest -solved-midterm paper 2.pdf</code> Q12.</p>',
    urdu_answer: 'ٹیبلر اسٹوریج میں ایک ہی قطار (رو) کے تمام فیلڈز ایک ہی اکائی (Entity) کی خصوصیات کو ظاہر کرتے ہیں، اس لیے وہ آپس میں گہرے طور پر مربوط (Interrelated) ہوتے ہیں۔'
  },
  {
    stem: 'The computational process of analyzing large databases and data warehouses to identify hidden patterns, trends, and relationships is called:',
    options: {
      a: 'Data Normalization',
      b: 'Data Redundancy',
      c: 'Data Mining',
      d: 'Data Encryption'
    },
    correct: 'c',
    explanation: '<p><strong>Data Mining</strong> is the practice of examining large preexisting databases to generate new information, predict trends, and identify correlations using machine learning and statistical algorithms.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q26 and <code>Cs101-latest -solved-midterm paper 2.pdf</code> Q26.</p>',
    urdu_answer: 'ڈیٹا مائننگ (Data Mining) بڑے ڈیٹابیسز یا ڈیٹا ویئر ہاؤسز سے خودکار طور پر پوشیدہ پیٹرنز، رجحانات اور مفید معلومات اخذ کرنے کا عمل ہے۔'
  },
  {
    stem: 'In a database system, which interface provides the most user-friendly way for ordinary users to view, input, and modify record data?',
    options: {
      a: 'Raw SQL Query',
      b: 'Form',
      c: 'Table Schema Definition',
      d: 'Data Dictionary'
    },
    correct: 'b',
    explanation: '<p>A <strong>Form</strong> provides an intuitive, formatted graphical interface with labeled fields, buttons, and drop-down menus that allows users to interact with database records without writing SQL queries.</p><p><strong>Reference:</strong> Appeared 9+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q27 and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q24.</p>',
    urdu_answer: 'فارم (Form) ایک ایسا آسان اور صارف دوست اسکرین انٹرفیس مہیا کرتا ہے جس کے ذریعے عام صارفین بغیر کسی پروگرامنگ کے ڈیٹا بیس میں نیا ریکارڈ درج یا موجودہ ڈیٹا دیکھ سکتے ہیں۔'
  },
  {
    stem: 'If a user mistakenly attempts to enter a negative number in an "Age" field, which database integrity mechanism detects and rejects it?',
    options: {
      a: 'Limit Integrity (Range Integrity)',
      b: 'Physical Integrity',
      c: 'Referential Integrity',
      d: 'Transaction Isolation'
    },
    correct: 'a',
    explanation: '<p><strong>Limit Integrity</strong> (or range integrity constraint) checks whether entered values fall within an acceptable allowable numeric range (e.g., Age &ge; 0).</p><p><strong>Reference:</strong> Appeared 6+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q23 Page 75.</p>',
    urdu_answer: 'لمٹ انٹیگریٹی (Limit Integrity) اس بات کو یقینی بناتی ہے کہ داخل کی جانے والی قیمت ایک مقررہ حد کے اندر ہو، جیسے عمر کبھی منفی نہیں ہو سکتی۔'
  },
  {
    stem: 'Which of the following is an accurate and recognized statement regarding data storage architectures?',
    options: {
      a: 'Flat-file storage is better than tabular storage.',
      b: 'Tabular storage is better than flat-file storage.',
      c: 'Flat-file storage inherently eliminates data duplication.',
      d: 'Flat-file storage supports multi-table relational integrity.'
    },
    correct: 'b',
    explanation: '<p><strong>Tabular (relational) storage is superior to flat-file storage</strong> because it minimizes data redundancy, prevents anomalies, enforces referential integrity, and enables rapid multi-criteria indexing and querying.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q10 Page 74 & Page 78.</p>',
    urdu_answer: 'ٹیبلر (ریلیشنل) اسٹوریج فلیٹ فائل اسٹوریج کے مقابلے میں زیادہ لچکدار، محفوظ، اور بہتر ہے کیونکہ یہ ڈیٹا کی تکرار کو کم کرتی ہے اور تیز رفتار سرچنگ فراہم کرتی ہے۔'
  },
  {
    stem: 'Which of the following application software programs is NOT a Relational Database Management System (RDBMS)?',
    options: {
      a: 'Oracle Database',
      b: 'Microsoft Access',
      c: 'Microsoft SQL Server',
      d: 'Microsoft Excel'
    },
    correct: 'd',
    explanation: '<p><strong>Microsoft Excel</strong> is a spreadsheet program designed for numerical calculations and basic charting. It is not an RDBMS, whereas Oracle, MS Access, and SQL Server are full-featured RDBMS software packages.</p><p><strong>Reference:</strong> Appeared 5+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Q7 Page 79.</p>',
    urdu_answer: 'مائیکروسافٹ ایکسل (MS Excel) ایک اسپریڈشیٹ پروگرام ہے، یہ ریلیشنل ڈیٹا بیس مینجمنٹ سسٹم (RDBMS) نہیں ہے، جبکہ اوریکل، ایم ایس ایکسیس اور ایس کیو ایل سرور تمام RDBMS ہیں۔'
  }
];

// 5 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is a Database? Explain its fundamental purpose in modern computing.',
    correct: `<p>A <strong>Database</strong> is an organized, persistent collection of logically interrelated data designed for standardized storage, efficient querying, quick retrieval, and centralized manipulation by computerized applications.</p>
<ul>
  <li><strong>Centralized Access:</strong> Enables multiple concurrent users and software programs to access shared data without inconsistency.</li>
  <li><strong>Data Persistence:</strong> Permanently maintains critical business, student, or institutional records across power cycles and hardware resets.</li>
  <li><strong>Efficient Querying:</strong> Facilitates rapid filtering, searching, and updating of millions of records using structured query languages.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Spring 2009 Q34) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 73 Q22).</p>',
    urdu_answer: 'ڈیٹا بیس سے مراد باہم مربوط ڈیٹا کا ایک منظم مجموعہ ہے جسے کمپیوٹر سسٹم میں محفوظ کیا جاتا ہے تاکہ مختلف صارفین اور ایپلیکیشنز تیز رفتاری کے ساتھ معلومات کو تلاش، اپ ڈیٹ اور محفوظ رکھ سکیں۔ اس کا بنیادی مقصد ڈیٹا کی مرکزیت اور بروقت دستیابی ہے۔'
  },
  {
    stem: 'Why is there a need to use a Primary Key in a database table? State its main characteristics.',
    correct: `<p>A <strong>Primary Key</strong> is essential in relational database design for the following core reasons:</p>
<ol>
  <li><strong>Unique Identification:</strong> It guarantees that every single row (record/tuple) in a table can be uniquely identified and addressed.</li>
  <li><strong>Entity Integrity:</strong> It strictly enforces that primary key fields can never contain duplicate values or <code>NULL</code> (empty) entries.</li>
  <li><strong>Establishing Relationships:</strong> It serves as the referenced key that links parent tables to child tables via <em>Foreign Keys</em>.</li>
  <li><strong>Optimized Retrieval:</strong> The DBMS automatically creates a clustered index on the primary key, dramatically speeding up search operations.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>Cs101-latest -solved-midterm paper 2.pdf</code> Q32 and <code>cs101 midterm subjective by moaaz (1).pdf</code> Fall 2009 Q32.</p>',
    urdu_answer: 'ڈیٹا بیس ٹیبل میں پرائمری کی (Primary Key) اس لیے ضروری ہے کہ یہ ہر ریکارڈ کی منفرد شناخت کو یقینی بناتی ہے، ڈیٹا کے ڈپلیکیٹ ہونے کو روکتی ہے، اور دوسرے ٹیبلز کے ساتھ فارن کی کے ذریعے ریلیشن شپ قائم کرنے میں بنیاد فراہم کرتی ہے۔ اس کی ویلیو کبھی خالی (Null) نہیں ہو سکتی۔'
  },
  {
    stem: 'What kind of information can be stored in a modern database compared to early databases?',
    correct: `<p>Modern databases have evolved beyond the limitations of early systems:</p>
<ul>
  <li><strong>Early Databases:</strong> Were restricted strictly to basic alphanumeric text strings, integers, floating-point numbers, and dates.</li>
  <li><strong>Modern Databases:</strong> Support diverse, high-capacity multimedia and unstructured data types through Binary Large Objects (<strong>BLOBs</strong>) and Character Large Objects (<strong>CLOBs</strong>):
    <ul>
      <li>High-definition <strong>images, audio, and video streams</strong>.</li>
      <li>Complex documents (PDFs, spreadsheets, XML/JSON semi-structured documents).</li>
      <li>Spatial and Geographic Information System (<strong>GIS</strong>) geospatial coordinates.</li>
      <li>Executable binaries and biometric signatures (fingerprints, facial vectors).</li>
    </ul>
  </li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2009 Q32).</p>',
    urdu_answer: 'ابتدائی ڈیٹا بیسز میں صرف سادہ متن، تاریخ اور اعداد محفوظ کیے جا سکتے تھے، جبکہ جدید ڈیٹا بیسز میں ملٹی میڈیا ڈیٹا جیسے کہ تصاویر، ویڈیوز، آڈیو، جی آئی ایس (نقشہ جات)، بائیومیٹرک ڈیٹا اور پی ڈی ایف دستاویزات کو بھی آسانی سے محفوظ کیا جا سکتا ہے۔'
  },
  {
    stem: 'Define Primary Key and Queries in the context of database management.',
    correct: `<p>In database management systems:</p>
<ul>
  <li><strong>Primary Key:</strong> A single column or designated set of columns in a table whose values are strictly unique across all records. It ensures that no two identical records can exist in the same relation and prohibits null entries.</li>
  <li><strong>Query:</strong> A formalized instruction or question sent to the database (typically written in SQL) to search, filter, aggregate, insert, modify, or delete data based on specific user-defined criteria.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2009 Q36).</p>',
    urdu_answer: 'پرائمری کی وہ کالم ہے جو ٹیبل کے ہر ریکارڈ کو انفرادی شناخت دیتا ہے اور ڈپلیکیٹ نہیں ہو سکتا۔ کوئری (Query) ایک ایسی ہدایت یا سوال ہوتا ہے جو ڈیٹا بیس کو بھیجا جاتا ہے تاکہ مطلوبہ معلومات تلاش کی جا سکیں، نیا ڈیٹا درج کیا جا سکے یا موجودہ ریکارڈ تبدیل کیا جا سکے۔'
  },
  {
    stem: 'Name and describe three basic operations that can be performed on a database.',
    correct: `<p>The three fundamental operational categories performed on a database (part of standard <strong>CRUD</strong> operations) are:</p>
<ol>
  <li><strong>Data Insertion (Create):</strong> Adding new records or tuples into an existing database table (e.g., adding a new student admission record).</li>
  <li><strong>Data Retrieval / Querying (Read):</strong> Searching, filtering, and extracting specific stored data items based on designated conditional criteria.</li>
  <li><strong>Data Modification / Updating (Update):</strong> Altering existing values in table fields when facts change (e.g., updating a student's home address or phone number).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 81 Q14c).</p>',
    urdu_answer: 'ڈیٹا بیس پر تین بنیادی آپریشنز یہ ہیں: (1) انسرشن (نیا ڈیٹا شامل کرنا)، (2) ریٹریول یا سرچنگ (مطلوبہ ریکارڈ تلاش کرنا اور حاصل کرنا)، اور (3) اپ ڈیٹ یا موڈیفیکیشن (پہلے سے موجود ڈیٹا میں تبدیلی کرنا)۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'What is a Relational Database? Explain the core concepts of Tables, Rows (Tuples), and Columns (Attributes), and list three commercial RDBMS software products.',
    correct: `<p>A <strong>Relational Database</strong> is a type of database founded on the mathematical relation model formulated by Dr. E.F. Codd in 1970. It organizes data into structured two-dimensional tables that can be linked or related to one another through shared attributes (keys).</p>

<h4>Core Architectural Components:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Component</th>
      <th>Formal Term</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Table</strong></td>
      <td>Relation</td>
      <td>A 2D structure of rows and columns storing data about a specific entity type (e.g., <code>Students</code>).</td>
    </tr>
    <tr>
      <td><strong>Row</strong></td>
      <td>Tuple / Record</td>
      <td>A horizontal slice representing one complete, discrete real-world entity instance (e.g., one specific student).</td>
    </tr>
    <tr>
      <td><strong>Column</strong></td>
      <td>Attribute / Field</td>
      <td>A vertical slice representing a named property or characteristic shared by all records (e.g., <code>RollNumber</code>, <code>Name</code>).</td>
    </tr>
  </tbody>
</table>

<h4>Commercial RDBMS Software Products:</h4>
<ol>
  <li><strong>Oracle Database:</strong> Industry-standard high-performance enterprise RDBMS.</li>
  <li><strong>Microsoft SQL Server:</strong> Widely used corporate relational database platform for Windows and Linux.</li>
  <li><strong>MySQL / PostgreSQL:</strong> Powerful open-source relational database management systems.</li>
  <li><strong>Microsoft Access:</strong> Desktop-oriented relational database package for small applications.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Spring 2010 Q34), <code>Cs101-latest -solved-midterm paper 2.pdf</code> (Q39), and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Q12c).</p>',
    urdu_answer: 'ریلیشنل ڈیٹا بیس ایک ایسا ڈیٹا بیس ماڈل ہے جس میں تمام ڈیٹا کو دو سمتی ٹیبلز (Relations) میں قطاروں (Rows/Tuples) اور کالموں (Columns/Attributes) کی شکل میں ترتیب دیا جاتا ہے۔ مختلف ٹیبلز کو پرائمری اور فارن کیز کی مدد سے آپس میں جوڑا جاتا ہے۔ معروف RDBMS سافٹ وئیرز میں اوریکل (Oracle)، مائیکروسافٹ ایس کیو ایل سرور (MS SQL Server)، اور مائی ایس کیو ایل (MySQL) شامل ہیں۔'
  },
  {
    stem: 'What is the main problem encountered when storing Object-Oriented data into a Relational Database Management System (RDBMS), and what solution can you suggest for it?',
    correct: `<p>The fundamental problem encountered when persisting object-oriented software data into a relational database is known as the <strong>Object-Relational Impedance Mismatch</strong>.</p>

<h4>1. The Core Problem: Architectural Incompatibility</h4>
<ul>
  <li><strong>Paradigm Difference:</strong> Object-Oriented Programming (OOP) models the real world as networks of interconnected <em>objects</em> containing encapsulated state (data) and behavior (methods), organized into complex hierarchies using <strong>inheritance, polymorphism, abstraction, and pointer references</strong>.</li>
  <li><strong>Relational Paradigm:</strong> An RDBMS models data strictly as mathematical sets of <em>flat, tabular relations</em> (tables) consisting of primitive data types linked only by primary and foreign keys, with zero native understanding of inheritance, method execution, or polymorphic object instances.</li>
  <li><strong>Storage Friction:</strong> To save an object with nested children or subclasses, developers must dismantle the object into multiple rows across several normalized tables, and reassemble it upon retrieval, causing high complexity and severe performance overhead.</li>
</ul>

<h4>2. Recommended Solutions:</h4>
<ol>
  <li><strong>Object-Relational Mapping (ORM):</strong> Software libraries (such as Hibernate, Entity Framework, Prisma) that automatically map OOP classes to database tables, handling schema translation, relationships, and queries seamlessly.</li>
  <li><strong>Object-Oriented Database Management Systems (OODBMS):</strong> Databases that store objects directly in memory without translating them into tabular rows.</li>
  <li><strong>Hybrid Object-Relational DBMS (ORDBMS):</strong> Modern engines (like PostgreSQL) that natively support complex user-defined object types, arrays, and JSON documents within relational tables.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>Cs101-latest -solved-midterm paper 2.pdf</code> (Question No. 41, 10 Marks subjective question).</p>',
    urdu_answer: 'جب آبجیکٹ اورینٹڈ پروگرامنگ کے ڈیٹا کو ریلیشنل ڈیٹا بیس (RDBMS) میں محفوظ کیا جاتا ہے تو اس تضاد کو Object-Relational Impedance Mismatch کہا جاتا ہے۔ او او پی میں ڈیٹا آبجیکٹس، انہیریٹنس اور پولیمورفزم پر مشتمل ہوتا ہے جبکہ RDBMS صرف فلیٹ ٹیبلز اور قطاروں کو سمجھتا ہے۔ اس کا بہترین حل او آر ایم (ORM - Object-Relational Mapping) ٹولز یا ہائبرڈ ڈیٹا بیسز کا استعمال ہے جو آبجیکٹس کو خودکار طور پر ٹیبلر فارمیٹ میں تبدیل کرتے ہیں۔'
  },
  {
    stem: 'Compare Tabular/Relational storage with Flat-File storage in detail. Why is tabular storage considered superior to flat-file storage?',
    correct: `<p>A comprehensive comparison between <strong>Flat-File Storage</strong> and <strong>Tabular / Relational Storage</strong> reveals fundamental differences in performance, integrity, and scalability:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Criterion</th>
      <th>Flat-File Storage</th>
      <th>Tabular / Relational Storage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Data Structure</strong></td>
      <td>Single flat text/binary file with records separated by delimiters (e.g., CSV, text files).</td>
      <td>Multiple interrelated 2D tables linked via primary and foreign key constraints.</td>
    </tr>
    <tr>
      <td><strong>Data Redundancy</strong></td>
      <td>High redundancy; repetitive data must be duplicated across multiple rows.</td>
      <td>Minimal redundancy through rigorous schema normalization.</td>
    </tr>
    <tr>
      <td><strong>Data Integrity</strong></td>
      <td>No built-in enforcement; prone to insertion, update, and deletion anomalies.</td>
      <td>Enforced via domain, entity, limit, and referential integrity rules.</td>
    </tr>
    <tr>
      <td><strong>Search Performance</strong></td>
      <td>Sequential scanning; slow linear search on large datasets.</td>
      <td>High-speed indexed retrieval using B-Trees and hashing.</td>
    </tr>
    <tr>
      <td><strong>Concurrency & Security</strong></td>
      <td>File-level locking; poor multi-user support and coarse access control.</td>
      <td>Fine-grained row/column locking, ACID transactions, and role-based security.</td>
    </tr>
  </tbody>
</table>

<h4>Why Tabular Storage is Superior:</h4>
<ul>
  <li>It completely eliminates conflicting inconsistent copies of identical facts.</li>
  <li>It allows complex ad-hoc queries spanning multiple relations without manual file parsing.</li>
  <li>It scales reliably to millions of records while maintaining transactional safety.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Spring 2009 Q40) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Q10).</p>',
    urdu_answer: 'فلیٹ فائل اسٹوریج میں سارا ڈیٹا ایک ہی فائل (جیسے CSV) میں ہوتا ہے جس کی وجہ سے ڈیٹا کی بے تحاشا تکرار (Redundancy) ہوتی ہے اور سرچنگ سست ہوتی ہے۔ اس کے برعکس ٹیبلر (ریلیشنل) اسٹوریج میں ڈیٹا کو مختلف ٹیبلز میں نارملائز کیا جاتا ہے، انٹیگریٹی قوانین لاگو ہوتے ہیں، انڈیکسنگ کی وجہ سے تلاش انتہائی تیز ہوتی ہے اور بیک وقت ہزاروں صارفین محفوظ طریقے سے ڈیٹا استعمال کر سکتے ہیں۔'
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
console.log(`CS101 Lecture 12 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

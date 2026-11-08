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

// 2. Create or fetch Lecture 22 for CS403
let lec22 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 22").get(cs403.id);
if (!lec22) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 22, 'Physical Database Design: Field Design, Coding & Compression')
  `).run(cs403.id);
  lec22 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 22 with ID: ${lec22.id}`);
} else {
  console.log(`CS403 Lecture 22 found with ID: ${lec22.id}`);
}

const lId = lec22.id;

// 3. Clear existing questions for Lecture 22 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 22.`);

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
    stem: 'With the help of ______ technique, data values with smaller-sized codes can further reduce the space needed by data for storage in the database.',
    options: {
      a: 'Compression',
      b: 'Expansion',
      c: 'Negation',
      d: 'Extension'
    },
    correct: 'a',
    explanation: '<p><strong>Data Compression</strong> algorithms replace repetitive or sparse data patterns with compact encoded bit representations, substantially reducing secondary storage consumption (CS403 Handouts Page 185). Appeared 6 times.</p>',
    urdu_answer: 'ڈیٹا کمپریشن (Compression) کی تکنیک کی مدد سے ڈیٹا کو چھوٹے سائز کے کوڈز میں تبدیل کر کے ڈیٹا بیس میں درکار اسٹوریج اسپیس کو مزید کم کیا جاتا ہے۔'
  },
  {
    stem: 'In physical database terminology, a "Field" is formally defined as the ______.',
    options: {
      a: 'Smallest unit of application data recognized by system software (DBMS or programming language)',
      b: 'Collection of related database tables',
      c: 'High-level entity type in an ER diagram',
      d: 'File organization structure on secondary disk storage'
    },
    correct: 'a',
    explanation: '<p>A <strong>Field</strong> is the smallest named unit of application data recognized by the operating system, DBMS, or application program (CS403 Handouts Page 184). Appeared 5 times.</p>',
    urdu_answer: 'فیلڈ (Field) سے مراد ایپلیکیشن ڈیٹا کی وہ سب سے چھوٹی اکائی ہے جسے سسٹم سافٹ ویئر یا DBMS تسلیم کرتا ہے اور جس پر پراسیسنگ کرتا ہے۔'
  },
  {
    stem: 'Which field constraint is generally used for efficiency purposes in the data entry process by supplying a predefined value automatically when none is specified?',
    options: {
      a: 'Null value constraint',
      b: 'Integer value constraint',
      c: 'Default value',
      d: 'Primary key constraint'
    },
    correct: 'c',
    explanation: '<p>A <strong>Default Value</strong> automatically populates a column when no explicit value is supplied by the user, accelerating data entry and minimizing null entries (CS403 Handouts Page 186). Appeared 4 times.</p>',
    urdu_answer: 'ڈیفالٹ ویلیو (Default Value) ڈیٹا اینٹری کی رفتار بڑھانے کے لیے استعمال ہوتی ہے جو صارف کی طرف سے کوئی قیمت فراہم نہ کرنے کی صورت میں پہلے سے طے شدہ قیمت درج کر دیتی ہے۔'
  },
  {
    stem: 'Which of the following is NOT one of the four major objectives of selecting data types for attributes during Field Design?',
    options: {
      a: 'Minimized usage of storage space',
      b: 'Represent all possible valid data values',
      c: 'Support required data manipulation operations',
      d: 'Maximize network bandwidth capacity'
    },
    correct: 'd',
    explanation: '<p>The four primary goals of data type selection are: (1) Minimize storage space, (2) Represent all valid values, (3) Improve data integrity, and (4) Support data manipulation. Bandwidth maximization is a network infrastructure concern, not a field design goal (CS403 Handouts Page 184). Appeared 4 times.</p>',
    urdu_answer: 'فیلڈ ڈیزائن میں ڈیٹا ٹائپ منتخب کرنے کے چار بنیادی مقاصد میں اسٹوریج کم کرنا، تمام ویلیوز کو سپورٹ کرنا، انٹیگریٹی بڑھانا اور مینیپولیشن شامل ہیں۔ نیٹ ورک بینڈوتھ کا اس سے تعلق نہیں ہے۔'
  },
  {
    stem: 'A coding technique that uses meaningful, easy-to-remember character combinations (such as "CS403" for Database Systems or "M"/"F" for Gender) is termed ______.',
    options: {
      a: 'Serial coding',
      b: 'Mnemonic coding',
      c: 'Block coding',
      d: 'Hierarchical coding'
    },
    correct: 'b',
    explanation: '<p><strong>Mnemonic Coding</strong> uses abbreviated letters or symbols that suggest the meaning of the data being represented, making it intuitive and error-resistant for human data entry (CS403 Handouts Page 185). Appeared 4 times.</p>',
    urdu_answer: 'نیمونک کوڈنگ (Mnemonic Coding) میں آسان اور معنی خیز الفاظ یا حروف استعمال کیے جاتے ہیں جیسے ڈی بی ایم ایس کے لیے CS403 یا صنف کے لیے M/F تاکہ یاد رکھنا آسان ہو۔'
  },
  {
    stem: 'The process of analyzing the expected table size, total record count, and future annual growth rate of database tables is known as ______.',
    options: {
      a: 'Normalization',
      b: 'Data volume and usage analysis',
      c: 'Functional dependency analysis',
      d: 'Conceptual ER modeling'
    },
    correct: 'b',
    explanation: '<p><strong>Data volume and usage analysis</strong> estimates the total bytes per record, number of rows, growth trends, and transaction access frequencies to plan storage hardware capacity (CS403 Handouts Page 183). Appeared 4 times.</p>',
    urdu_answer: 'ڈیٹا بیس کے متوقع سائز، ریکارڈز کی کل تعداد اور سالانہ اضافے کے تجزیے کو ڈیٹا والیم اور یوزج اینالیسس (Data Volume and Usage Analysis) کہا جاتا ہے۔'
  },
  {
    stem: 'Which coding technique assigns consecutive sequential numbers to data items without embedding category information?',
    options: {
      a: 'Serial coding',
      b: 'Block coding',
      c: 'Hierarchical coding',
      d: 'Mnemonic coding'
    },
    correct: 'a',
    explanation: '<p><strong>Serial Coding</strong> assigns consecutive numbers (e.g., 1001, 1002, 1003) sequentially. It is simple and avoids gaps, but conveys no intrinsic category meaning (CS403 Handouts Page 185). Appeared 3 times.</p>',
    urdu_answer: 'سیریل کوڈنگ (Serial Coding) میں آئٹمز کو مسلسل ترتیب وار نمبر (جیسے 1، 2، 3) الاٹ کیے جاتے ہیں جس میں کوئی زمرہ بندی شامل نہیں ہوتی۔'
  },
  {
    stem: 'Which coding technique divides code positions into distinct sub-fields representing a structured category hierarchy (e.g., Department-Category-Item)?',
    options: {
      a: 'Serial coding',
      b: 'Block coding',
      c: 'Hierarchical coding',
      d: 'Mnemonic coding'
    },
    correct: 'c',
    explanation: '<p><strong>Hierarchical Coding</strong> structures the code such that each character position or digit represents a subgroup in an order tree (e.g., <code>Account-Region-Office</code>) (CS403 Handouts Page 185). Appeared 3 times.</p>',
    urdu_answer: 'ہائیرارکیکل کوڈنگ (Hierarchical Coding) میں کوڈ کو مختلف حصوں میں بانٹا جاتا ہے جہاں ہر حصہ کسی مخصوص درجے یا کیٹیگری کی نمائندگی کرتا ہے۔'
  },
  {
    stem: 'Data Compression saves ______ at the expense of additional ______ overhead during database read and write operations.',
    options: {
      a: 'Memory buffer space, Network delay',
      b: 'Secondary disk storage space, CPU computational processing',
      c: 'Primary key length, Foreign key length',
      d: 'Display screen size, Operating system kernel size'
    },
    correct: 'b',
    explanation: '<p>Compression trades off <strong>CPU processing cycles</strong> (needed to encode and decode blocks on the fly) in return for saving <strong>physical disk storage space</strong> and reducing disk I/O transfer volume (CS403 Handouts Page 185-186). Appeared 4 times.</p>',
    urdu_answer: 'ڈیٹا کمپریشن سیکنڈری ڈسک اسٹوریج کی بچت کرتا ہے لیکن اس کے بدلے میں سی پی یو (CPU) پر ڈیٹا کو کھولنے اور کمپریس کرنے کا اضافی بوجھ پڑتا ہے۔'
  },
  {
    stem: 'Using variable-length fields (such as VARCHAR) instead of fixed-length fields (CHAR) for large text attributes primarily helps in ______.',
    options: {
      a: 'Eliminating duplicate rows',
      b: 'Eliminating unused padding space on physical storage media',
      c: 'Removing primary keys',
      d: 'Speeding up indexing automatically'
    },
    correct: 'b',
    explanation: '<p><code>VARCHAR</code> allocates only the actual bytes needed by the text value plus a small length prefix, avoiding the fixed blank padding that wastes storage in <code>CHAR</code> columns (CS403 Handouts Page 184). Appeared 3 times.</p>',
    urdu_answer: 'فکسڈ لینتھ (CHAR) کے بجائے ویری ایبل لینتھ (VARCHAR) استعمال کرنے کا بڑا فائدہ خالی جگہوں (Padding) کے ضیاع کو روکنا اور ڈسک اسپیس بچانا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 22.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define Field and state the four main objectives of selecting data types during Field Design.',
    correct: 'A field is the smallest unit of application data recognized by system software. The 4 objectives are: (1) Minimize storage space, (2) Represent all possible valid values, (3) Improve data integrity, and (4) Support required data manipulation operations.',
    explanation: `<p><strong>Definition of a Field:</strong><br>
A <strong>field</strong> is the smallest named unit of application data recognized by system software (DBMS or programming language).</p>
<p><strong>Four Main Objectives of Data Type Selection:</strong></p>
<ol>
  <li><strong>Minimize Storage Space:</strong> Choosing compact data types (e.g., <code>TINYINT</code> instead of <code>INT</code> for small ranges) saves disk and memory space.</li>
  <li><strong>Represent All Possible Valid Values:</strong> The domain must comfortably accommodate every valid value without truncation or numeric overflow.</li>
  <li><strong>Improve Data Integrity:</strong> Native data type enforcement prevents invalid entries (e.g., letters in a date or phone number field).</li>
  <li><strong>Support Required Data Manipulation:</strong> Ensuring fields support arithmetic operations, string concatenation, or date differences.</li>
</ol>`,
    urdu_answer: 'فیلڈ کی تعریف اور ڈیٹا ٹائپ کے 4 مقاصد: فیلڈ سسٹم سافٹ ویئر کے ذریعے پہچانی جانے والی ڈیٹا کی سب سے چھوٹی اکائی ہے۔ ڈیٹا ٹائپ منتخب کرنے کے چار مقاصد ہیں: (1) اسٹوریج اسپیس کم سے کم رکھنا، (2) تمام درست ممکنہ ویلیوز کو سپورٹ کرنا، (3) ڈیٹا کی درستی (Integrity) قائم رکھنا، اور (4) درکار ریاضیاتی یا لاجیکل آپریشنز کو سپورٹ کرنا۔'
  },
  {
    stem: 'What is Data Volume and Usage Analysis in Physical Database Design? Why is it crucial?',
    correct: 'Data volume and usage analysis calculates estimated row counts, average record lengths, annual growth rates, and transaction access patterns. It is crucial for hardware capacity sizing and optimizing file storage layout.',
    explanation: `<p><strong>Data Volume and Usage Analysis:</strong></p>
<p>This is a foundational physical design activity where designers calculate the expected physical footprint and usage characteristics of the database:</p>
<ul>
  <li><strong>Record Size Estimation:</strong> Sum of average field byte lengths plus DBMS row overhead.</li>
  <li><strong>Table Volume:</strong> Multiplying record size by the estimated initial number of records and projected annual growth percentage.</li>
  <li><strong>Access Pattern Analysis:</strong> Determining peak read vs. update transaction frequencies per minute.</li>
</ul>
<p><strong>Why it is Crucial:</strong><br>
Without volume analysis, organizations risk server disk exhaustion, undersized memory buffers, slow response times, and poor file organization decisions.</p>`,
    urdu_answer: 'ڈیٹا والیم اور یوزج اینالیسس: اس تجزیے میں ہر ریکارڈ کا سائز، کل ریکارڈز کی متوقع تعداد، سالانہ شرح نمو اور ٹرانزیکشنز کی تعداد ناپی جاتی ہے۔ یہ اس لیے انتہائی اہم ہے تاکہ مناسب ہارڈویئر کا انتخاب کیا جا سکے اور سست رفتار کوئریز سے بچا جا سکے۔'
  },
  {
    stem: 'Briefly describe the four main types of Coding Techniques used in Physical Database Design with an example for each.',
    correct: 'The four techniques are: (1) Serial Coding (sequential numbers: 101, 102), (2) Block Coding (assigned number blocks: 1000-1999 for Sales), (3) Hierarchical Coding (structured sub-categories: Class-Item), and (4) Mnemonic Coding (meaningful abbreviations: CS403, PK).',
    explanation: `<p><strong>Four Major Coding Techniques:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Coding Technique</th>
      <th>Description</th>
      <th>Practical Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Serial Coding</strong></td>
      <td>Sequential numbers assigned consecutively to items.</td>
      <td>Student roll numbers: <code>1001, 1002, 1003</code>.</td>
    </tr>
    <tr>
      <td><strong>2. Block Coding</strong></td>
      <td>Specific numeric ranges reserved for distinct item categories.</td>
      <td>Account codes: <code>1000–1999</code> (Assets), <code>2000–2999</code> (Liabilities).</td>
    </tr>
    <tr>
      <td><strong>3. Hierarchical Coding</strong></td>
      <td>Each character position indicates a specific structural sub-level.</td>
      <td>Library codes: <code>SCI-PHY-001</code> (Science, Physics, Item 1).</td>
    </tr>
    <tr>
      <td><strong>4. Mnemonic Coding</strong></td>
      <td>Abbreviated letters that intuitively suggest the meaning of data.</td>
      <td>Country codes: <code>PK</code> (Pakistan), Course codes: <code>CS403</code>.</td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'چار کوڈنگ تکنیکیں: (1) سیریل کوڈنگ: مسلسل ترتیب وار نمبر (جیسے 101، 102)، (2) بلاک کوڈنگ: مخصوص نمبروں کے گروپس مخصوص کیٹیگری کے لیے (جیسے 1000-1999)، (3) ہائیرارکیکل کوڈنگ: درجاتی کوڈ جس کا ہر حصہ ایک ذیلی شاخ دکھائے، اور (4) نیمونک کوڈنگ: یاد رکھنے میں آسان حروف (جیسے CS403 یا PK)۔'
  },
  {
    stem: 'Explain Data Compression and discuss the classic trade-off involved in physical database storage.',
    correct: 'Data compression encodes data values with compact algorithms to reduce storage footprint. The trade-off is saving secondary disk space and reducing disk I/O at the cost of additional CPU processing cycles needed to encode and decode data.',
    explanation: `<p><strong>Data Compression Concept:</strong><br>
Data compression algorithms (e.g., Run-Length Encoding, LZW, or Huffman coding) replace repeated byte sequences or sparse table values with compact bit patterns to minimize physical footprint on storage media.</p>
<p><strong>The Storage vs. CPU Trade-Off:</strong></p>
<ul>
  <li><strong>Advantages:</strong> Drastically reduces hard disk / SSD space consumption, packs more rows into a single disk page, and reduces physical disk I/O transfer time.</li>
  <li><strong>Disadvantages:</strong> Requires significant <strong>CPU computational overhead</strong> because data blocks must be continuously decompressed into memory upon reading and re-compressed when writing.</li>
</ul>`,
    urdu_answer: 'ڈیٹا کمپریشن اور اس کا توازن (Trade-off): کمپریشن کا مقصد ڈیٹا کو کمپیکٹ الگورتھم کے ذریعے سمیٹنا ہے۔ اس کا بنیادی توازن یہ ہے کہ یہ ہارڈ ڈسک کی جگہ اور I/O ٹائم بچاتی ہے مگر ڈیٹا کو پڑھتے اور لکھتے وقت سی پی یو (CPU) پر ڈی کوڈنگ کا اضافی بوجھ پڑتا ہے۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 22.`);

// 3 Long Questions (5 marks each: 2 Analytical + 1 Problem-Solving)
const longQuestions = [
  {
    stem: 'Explain Field Design, Data Type Selection, and Data Integrity Controls in Physical Database Design. Detail the specific field-level integrity mechanisms available in modern DBMSs.',
    correct: 'Field design selects optimal data types and lengths to conserve storage and enforce rules. Field integrity controls include Default values, Range CHECK constraints, NULL value rules, and Referential integrity.',
    explanation: `<p><strong>Field Design and Data Integrity Controls:</strong></p>

<p><strong>1. Role of Field Design:</strong><br>
Field design is the physical implementation of logical entity attributes. Selecting appropriate data types (fixed vs. variable, signed vs. unsigned numeric, date/time) directly impacts storage footprint, query performance, and indexing speed.</p>

<p><strong>2. Fixed-Length (CHAR) vs. Variable-Length (VARCHAR):</strong></p>
<ul>
  <li><strong>CHAR(n):</strong> Fixed size; fast retrieval when attribute length is uniform (e.g., CNIC <code>15 chars</code>, Country Code <code>2 chars</code>).</li>
  <li><strong>VARCHAR(n):</strong> Allocates only actual string length; essential for attributes with high length variance (e.g., <code>Address</code>, <code>Comments</code>), saving substantial disk space.</li>
</ul>

<p><strong>3. Field-Level Data Integrity Controls:</strong></p>
<ol>
  <li><strong>Default Values:</strong> Automatically populates a column with a predefined value when omitted (e.g., <code>Order_Status DEFAULT 'Pending'</code>).</li>
  <li><strong>Range & Check Constraints:</strong> Validates domain bounds using logical expressions (e.g., <code>CHECK (Salary >= 10000 AND Salary <= 500000)</code>).</li>
  <li><strong>Null Value Controls:</strong> Enforces mandatory business attributes using <code>NOT NULL</code>, preventing missing critical data.</li>
  <li><strong>Referential Integrity Constraints:</strong> Ensures that a foreign key value matches an existing valid primary key value in the referenced parent relation.</li>
</ol>`,
    urdu_answer: 'فیلڈ ڈیزائن اور ڈیٹا انٹیگریٹی کنٹرولز: فیلڈ ڈیزائن میں مناسب ڈیٹا ٹائپس منتخب کی جاتی ہیں (جیسے CHAR اور VARCHAR) تاکہ ڈسک اسپیس ضائع نہ ہو۔ فیلڈ لیول پر ڈیٹا کو درست رکھنے کے لیے ڈیفالٹ ویلیوز، رینج چیک (CHECK Constraints)، ناٹ نل (NOT NULL) اور ریفرینشل انٹیگریٹی کی شرائط نافذ کی جاتی ہیں۔'
  },
  {
    stem: 'Write a comprehensive note on Coding Techniques and Data Compression in Physical Database Systems. Discuss when each coding method is best applied and evaluate compression performance implications.',
    correct: 'Coding techniques represent long data with compact symbols (Serial, Block, Hierarchical, Mnemonic). Compression minimizes physical storage footprint, trading CPU processing for disk I/O efficiency.',
    explanation: `<p><strong>Comprehensive Note on Coding and Data Compression:</strong></p>

<p><strong>1. Why Coding Techniques are Necessary:</strong><br>
Entering verbose descriptive strings (e.g., full university department names or vehicle categories) repeatedly wastes storage, slows down B-Tree index traversal, and introduces user spelling errors. Coding standardizes inputs and saves space.</p>

<p><strong>2. Detailed Application of Coding Methods:</strong></p>
<ul>
  <li><strong>Serial Coding:</strong> Ideal for auto-incrementing transaction receipts, invoice numbers, and primary keys where category structure is unnecessary.</li>
  <li><strong>Block Coding:</strong> Widely used in chart of accounts (e.g., General Ledger) where numeric ranges immediately communicate ledger groups.</li>
  <li><strong>Hierarchical Coding:</strong> Best for inventory parts, geographical locations (Country-State-City-Zip), and organizational trees.</li>
  <li><strong>Mnemonic Coding:</strong> Best suited for human-facing fields where quick recognition is critical (e.g., Airport codes <code>LHE, ISB, KHI</code>; Course codes <code>CS101, CS403</code>).</li>
</ul>

<p><strong>3. Data Compression Performance Evaluation:</strong></p>
<ul>
  <li><strong>Block-Level Compression:</strong> Compresses entire 4KB or 8KB database pages. Maximizes memory buffer cache capacity because compressed pages remain compressed in RAM until queried.</li>
  <li><strong>CPU vs. I/O Trade-off:</strong> In modern computing where multi-core CPUs are fast but mechanical disks or storage network latency are the primary bottleneck, data compression almost always yields a net performance boost for read-heavy systems.</li>
</ul>`,
    urdu_answer: 'کوڈنگ تکنیکیں اور ڈیٹا کمپریشن: طویل الفاظ کو بار بار لکھنے سے اسپیس ضائع ہوتی ہے، اس لیے سیریل، بلاک، ہائیرارکیکل اور نیمونک کوڈنگ استعمال کی جاتی ہے۔ کمپریشن ڈسک پر ڈیٹا کے سائز کو نمایاں طور پر کم کرتی ہے اور جدید ملٹی کور سی پی یو کے دور میں کمپریشن ڈسک I/O کے سست پن کو دور کر کے سسٹم کو تیز کرتی ہے۔'
  },
  {
    stem: 'Numerical / Problem-Solving Question: A database administrator is planning storage for a relational table STUDENT with 50,000 records. Field definitions are: StID (Fixed Integer, 4 bytes), StName (Fixed Char, 30 bytes), CNIC (Fixed Char, 15 bytes), DeptCode (Fixed Char, 5 bytes), GPA (Floating point, 4 bytes), with Record Header Overhead of 12 bytes per tuple. Calculate: (1) The physical record size in bytes, and (2) The total raw table storage in Megabytes (MB).',
    correct: 'Single record size = 4 + 30 + 15 + 5 + 4 + 12 = 70 bytes. Total table storage = 50,000 * 70 = 3,500,000 bytes = 3,500,000 / (1024 * 1024) ≈ 3.34 MB.',
    explanation: `<p><strong>Problem-Solving Calculation: Table Storage Volume Estimation:</strong></p>

<p><strong>1. Calculation of Single Record (Row) Size:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Byte Size</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>StID</code></td><td>Fixed Integer</td><td>4 bytes</td></tr>
    <tr><td><code>StName</code></td><td>Fixed Character</td><td>30 bytes</td></tr>
    <tr><td><code>CNIC</code></td><td>Fixed Character</td><td>15 bytes</td></tr>
    <tr><td><code>DeptCode</code></td><td>Fixed Character</td><td>5 bytes</td></tr>
    <tr><td><code>GPA</code></td><td>Float</td><td>4 bytes</td></tr>
    <tr><td><strong>Row Overhead</strong></td><td>Record Header / Metadata</td><td>12 bytes</td></tr>
    <tr style="background-color: #d1fae5; font-weight: bold;">
      <td colspan="2">Total Physical Record Size</td>
      <td><strong>70 bytes per record</strong></td>
    </tr>
  </tbody>
</table>

<p><strong>2. Calculation of Total Raw Storage:</strong></p>
<ul>
  <li><strong>Total Number of Records:</strong> <code>50,000 records</code></li>
  <li><strong>Total Bytes:</strong><br>
    <code>Total Bytes = 50,000 &times; 70 = 3,500,000 bytes</code>
  </li>
  <li><strong>Conversion to Megabytes (MB):</strong><br>
    <code>Total Storage in MB = 3,500,000 / (1,024 &times; 1,024) = 3,500,000 / 1,048,576 &asymp; 3.3378 MB</code>
  </li>
</ul>
<p><strong>Final Answer:</strong></p>
<ol>
  <li>Single Record Size = <strong>70 bytes</strong>.</li>
  <li>Total Table Storage = <strong>3.34 MB</strong> (or approximately <strong>3.5 MB</strong> if using decimal 10^6).</li>
</ol>`,
    urdu_answer: 'مسئلہ کا حسابی حل: (1) سنگل ریکارڈ کا سائز: 4 + 30 + 15 + 5 + 4 + 12 (اوور ہیڈ) = 70 بائٹس فی ریکارڈ۔ (2) 50,000 ریکارڈز کے لیے کل اسٹوریج: 50,000 &times; 70 = 3,500,000 بائٹس۔ میگا بائٹس (MB) میں تبدیل کرنے پر: 3,500,000 / (1024 &times; 1024) &asymp; 3.34 MB درکار ہوں گے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 22.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 22 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

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

// 2. Create or fetch Lecture 21 for CS403
let lec21 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 21").get(cs403.id);
if (!lec21) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 21, 'Normalization Summary and Introduction to Physical Database Design')
  `).run(cs403.id);
  lec21 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 21 with ID: ${lec21.id}`);
} else {
  console.log(`CS403 Lecture 21 found with ID: ${lec21.id}`);
}

const lId = lec21.id;

// 3. Clear existing questions for Lecture 21 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 21.`);

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
    stem: 'In the Database Development Life Cycle, the Normalization process is formally performed immediately after which design phase?',
    options: {
      a: 'Preliminary Study',
      b: 'Requirement Analysis',
      c: 'Logical Database Design',
      d: 'Physical Database Design'
    },
    correct: 'c',
    explanation: '<p>Normalization is performed immediately after the <strong>Logical Database Design</strong> phase. It takes the logical relation schemas and their functional dependencies as inputs to produce an optimized, anomaly-free schema (CS403 Handouts Page 176). Appeared 5 times.</p>',
    urdu_answer: 'ڈیٹا بیس ڈویلپمنٹ پروسیس میں نارملائزیشن کا مرحلہ باقاعدہ طور پر لاجیکل ڈیٹا بیس ڈیزائن (Logical Database Design) کے فوری بعد انجام دیا جاتا ہے۔'
  },
  {
    stem: 'In Physical Database Design, the primary design focus shifts from storage efficiency and consistency to ______.',
    options: {
      a: 'Data redundancy',
      b: 'Execution efficiency (System Performance)',
      c: 'Conceptual modeling',
      d: 'Entity-Relationship mapping'
    },
    correct: 'b',
    explanation: '<p>While logical design prioritizes storage efficiency and structural correctness, <strong>Physical Database Design</strong> shifts priority toward <strong>execution efficiency (system performance, query throughput, and response time)</strong> (CS403 Handouts Page 181). Appeared 5 times.</p>',
    urdu_answer: 'فزیکل ڈیٹا بیس ڈیزائن میں بنیادی توجہ اسٹوریج کی بچت سے ہٹ کر ایگزیکیوشن کی کارکردگی یعنی سسٹم پرفارمنس اور رسپانس ٹائم (Execution Efficiency) پر مرکوز ہو جاتی ہے۔'
  },
  {
    stem: 'Which statement is CORRECT regarding the necessity of Normalization in database development?',
    options: {
      a: 'Normalization is compulsory; a database cannot run without it',
      b: 'Normalization is not a must, but it is a strongly recommended activity',
      c: 'Normalization is performed during the physical implementation phase',
      d: 'Normalization creates redundant data tables'
    },
    correct: 'b',
    explanation: '<p>Normalization is <strong>not an absolute mandatory requirement</strong> for database operation, but it is a <strong>strongly recommended practice</strong> because un-normalized databases suffer from data anomalies and severe maintenance difficulties (CS403 Handouts Page 176). Appeared 4 times.</p>',
    urdu_answer: 'نارملائزیشن کرنا کوئی لازمی اور جبری شرط نہیں ہے، لیکن یہ ایک انتہائی سفارش کردہ (Strongly Recommended) عمل ہے تاکہ ڈیٹا کے بگاڑ اور اناملیز سے بچا جا سکے۔'
  },
  {
    stem: 'The process of normalization through decomposition MUST achieve the ______ property at any cost.',
    options: {
      a: 'Lossless join',
      b: 'Dependency preservation',
      c: 'Total disjointness',
      d: 'Multi-valued dependency'
    },
    correct: 'a',
    explanation: '<p>During decomposition, the <strong>Lossless Join</strong> property is strictly mandatory because losing original tuple information or creating spurious tuples upon re-joining corrupts database truth (CS403 Handouts Page 176). Appeared 5 times.</p>',
    urdu_answer: 'نارملائزیشن کے عمل میں ڈی کمپوزیشن کے دوران لاس لیس جوائن (Lossless Join) کی خصوصیت ہر قیمت پر حاصل کرنا لازمی ہے تاکہ ڈیٹا ضائع نہ ہو۔'
  },
  {
    stem: 'Which of the following is NOT an input required for beginning the Physical Database Design phase?',
    options: {
      a: 'Normalized relations',
      b: 'Data volume and frequency estimates',
      c: 'Context-Level Data Flow Diagram (DFD)',
      d: 'Response time and security expectations'
    },
    correct: 'c',
    explanation: '<p>Context-Level DFDs belong to the early requirement analysis phase. The inputs to physical design include <strong>normalized relations, volume estimates, access frequencies, target DBMS specs, and response time constraints</strong> (CS403 Handouts Page 181, 183). Appeared 4 times.</p>',
    urdu_answer: 'کانٹیکسٹ لیول DFD ریکوائرمنٹ اینالیسس کا حصہ ہوتی ہے، فزیکل ڈیٹا بیس ڈیزائن شروع کرنے کے لیے اس کی ضرورت نہیں ہوتی۔'
  },
  {
    stem: 'Physical Database Design transforms the logical database design into ______.',
    options: {
      a: 'Semantic ER diagrams',
      b: 'Technical specifications for storing and retrieving data',
      c: 'Data Flow Diagrams',
      d: 'High-level user views'
    },
    correct: 'b',
    explanation: '<p>Physical database design converts abstract logical relations and constraints into concrete <strong>technical specifications for storing and retrieving data</strong> on secondary storage devices (CS403 Handouts Page 181). Appeared 4 times.</p>',
    urdu_answer: 'فزیکل ڈیٹا بیس ڈیزائن لاجیکل ڈیزائن کو سیکنڈری اسٹوریج پر ڈیٹا محفوظ کرنے اور حاصل کرنے کی تکنیکی تصریحات (Technical Specifications) میں تبدیل کرتا ہے۔'
  },
  {
    stem: 'The primary inputs to the formal Normalization process are ______ and ______.',
    options: {
      a: 'DFDs, ERDs',
      b: 'Logical database design, Functional Dependencies (FDs)',
      c: 'User interfaces, Physical file structures',
      d: 'Conceptual schemas, Use cases'
    },
    correct: 'b',
    explanation: '<p>The normalization procedure requires the <strong>logical relations</strong> produced during logical schema design and the verified set of <strong>functional dependencies (FDs)</strong> holding among their attributes (CS403 Handouts Page 176-177). Appeared 4 times.</p>',
    urdu_answer: 'نارملائزیشن کے عمل کی بنیادی ان پٹ لاجیکل ڈیٹا بیس ڈیزائن (ریلیشنز) اور ایٹریبیوٹس کے درمیان موجود فنکشنل ڈیپینڈینسیز (FDs) ہوتی ہیں۔'
  },
  {
    stem: 'At which database design level does intentional de-normalization take place to optimize query performance?',
    options: {
      a: 'Requirement Analysis',
      b: 'Conceptual Design',
      c: 'Logical Design',
      d: 'Physical Design'
    },
    correct: 'd',
    explanation: '<p><strong>De-normalization</strong> (deliberately combining tables to avoid expensive JOINs) is evaluated and implemented strictly during <strong>Physical Database Design</strong> where real hardware performance trade-offs are analyzed (CS403 Handouts Page 181). Appeared 5 times.</p>',
    urdu_answer: 'کارکردگی کو بہتر بنانے کے لیے جان بوجھ کر ڈی نارملائزیشن (De-normalization) صرف اور صرف فزیکل ڈیزائن کے لیول پر کی جاتی ہے۔'
  },
  {
    stem: 'During Physical Database Design, designers may deliberately ______ some good logical design principles (like 3NF) for query performance.',
    options: {
      a: 'Violate (Denormalize)',
      b: 'Enforce strictly',
      c: 'Delete permanently',
      d: 'Ignore primary keys'
    },
    correct: 'a',
    explanation: '<p>To reduce join overhead and disk I/O for read-heavy operations, database architects may deliberately <strong>violate (denormalize)</strong> 3NF or BCNF design purity as a controlled performance compromise (CS403 Handouts Page 181). Appeared 3 times.</p>',
    urdu_answer: 'فزیکل ڈیزائن کے دوران ڈیزائنرز کوئریز کی رفتار بڑھانے کے لیے اچھے لاجیکل اصولوں کی جان بوجھ کر خلاف ورزی (Denormalize) کر سکتے ہیں۔'
  },
  {
    stem: 'For most practical commercial and business database applications, normalizing relations up to ______ is considered standard and sufficient.',
    options: {
      a: '1NF',
      b: '2NF',
      c: 'Third Normal Form (3NF)',
      d: 'Sixth Normal Form (6NF)'
    },
    correct: 'c',
    explanation: '<p>In typical enterprise systems, normalizing up to <strong>3NF (or BCNF)</strong> provides an optimal balance between eliminating modification anomalies and maintaining query execution efficiency (CS403 Handouts Page 176). Appeared 4 times.</p>',
    urdu_answer: 'زیادہ تر کاروباری اور کمرشل ایپلی کیشنز کے لیے ریلیشنز کو تیسری نارمل فارم (3NF) تک نارملائز کرنا کافی اور معیاری سمجھا جاتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 21.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Summarize the main purpose of Normalization. Is it a mandatory step in database design?',
    correct: 'The purpose of normalization is to eliminate data redundancy and prevent insert, update, and delete anomalies. It is not mandatory, but strongly recommended because un-normalized schemas cause maintenance errors and inconsistent data.',
    explanation: `<p><strong>Purpose of Normalization:</strong></p>
<ul>
  <li><strong>Eliminate Data Redundancy:</strong> Ensures data elements are stored in exactly one logical place.</li>
  <li><strong>Prevent Modification Anomalies:</strong> Removes insertion, deletion, and update anomalies that corrupt data consistency.</li>
  <li><strong>Facilitate Maintenance:</strong> Makes schemas flexible and easily adaptable as business rules evolve.</li>
</ul>
<p><strong>Is it Mandatory?</strong><br>
No, normalization is <strong>not mandatory</strong>—a DBMS will execute queries and store tables regardless of normal form. However, it is <strong>strongly recommended</strong> because omitting it results in bloated storage, query bugs, and severe data integrity violations.</p>`,
    urdu_answer: 'نارملائزیشن کا مقصد ڈیٹا میں غیر ضروری تکرار (Redundancy) کو ختم کرنا اور انسرشن، اپڈیٹ اور ڈیلیشن کی خرابیوں کو روکنا ہے۔ یہ لازمی نہیں ہے مگر انتہائی ضروری اور سفارش کردہ ہے کیونکہ اس کے بغیر ڈیٹابیس میں ڈیٹا کی غلطیاں اور بگاڑ پیدا ہوتا ہے۔'
  },
  {
    stem: 'Compare the primary objectives of Conceptual/Logical Database Design versus Physical Database Design.',
    correct: 'Conceptual/Logical design focuses on business rules, structural correctness, data consistency, and software/hardware independence. Physical design focuses on execution efficiency, query throughput, response times, and storage structures for a specific DBMS.',
    explanation: `<p><strong>Logical vs. Physical Database Design Comparison:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Criterion</th>
      <th>Conceptual / Logical Design</th>
      <th>Physical Database Design</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Primary Focus</strong></td>
      <td>Storage efficiency, data consistency, and business logic mapping.</td>
      <td>Execution efficiency, query speed, and hardware utilization.</td>
    </tr>
    <tr>
      <td><strong>Hardware Dependency</strong></td>
      <td>Independent of specific DBMS, OS, or storage hardware.</td>
      <td>Highly dependent on target DBMS architecture and storage media.</td>
    </tr>
    <tr>
      <td><strong>Key Outputs</strong></td>
      <td>Normalized relational schemas (tables, keys, foreign keys).</td>
      <td>File organizations, B-Tree indexes, partitioning, storage allocations.</td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'لاجیکل بمقابلہ فزیکل ڈیزائن: لاجیکل ڈیزائن کی توجہ اسٹوریج کی درستگی، ڈیٹا کی مستقل مزاجی اور ہارڈویئر کی آزادی پر ہوتی ہے۔ اس کے برعکس فزیکل ڈیزائن کا مقصد کسی خاص DBMS پر کوئریز کی تیز رفتار ایگزیکیوشن، رسپانس ٹائم اور انڈیکسنگ کی حکمت عملی تیار کرنا ہے۔'
  },
  {
    stem: 'List the key inputs required before beginning the Physical Database Design phase.',
    correct: 'Key inputs include: (1) Normalized logical relations, (2) Data volume and growth estimates, (3) Attribute definitions and access frequencies, (4) Response time and security requirements, and (5) Target DBMS and hardware platform specifications.',
    explanation: `<p><strong>Inputs to Physical Database Design:</strong></p>
<ol>
  <li><strong>Normalized Relations:</strong> The relational schema (typically in 3NF or BCNF) produced during logical database design.</li>
  <li><strong>Data Volume and Growth Rates:</strong> Estimated number of rows per table and anticipated annual growth percentage.</li>
  <li><strong>Access Frequencies and Usage Analysis:</strong> Frequency of critical transactions, reports, and search queries per peak hour.</li>
  <li><strong>Performance Requirements:</strong> Strict response time constraints (e.g., OLTP sub-second query latency) and security/backup rules.</li>
  <li><strong>DBMS and Hardware Environment:</strong> CPU cores, memory/buffer cache limits, and SSD/HDD storage block specifications.</li>
</ol>`,
    urdu_answer: 'فزیکل ڈیزائن کے لیے درکار بنیادی ان پٹس: (1) نارملائزڈ ریلیشنز، (2) ڈیٹا کے حجم اور سالانہ اضافے کے تخمینے، (3) ٹرانزیکشنز اور کوئریز کی تعدد (Access Frequencies)، (4) رسپانس ٹائم اور سیکیورٹی کی شرائط، اور (5) متعلقہ DBMS سافٹ ویئر اور ہارڈویئر کے تکنیکی پیرامیٹرز۔'
  },
  {
    stem: 'List the major decisions and activities involved in Physical Database Design.',
    correct: 'Major decisions include: (1) Choosing DBMS data types and lengths, (2) Physical record grouping and column ordering, (3) Selecting file organization methods, (4) Designing access strategies (indexes and hash tables), and (5) Controlled denormalization and partitioning.',
    explanation: `<p><strong>Major Activities in Physical Database Design:</strong></p>
<ol>
  <li><strong>Data Type Selection:</strong> Mapping logical domains to precise DBMS physical types (e.g., <code>INT</code>, <code>VARCHAR(50)</code>, <code>DECIMAL(10,2)</code>).</li>
  <li><strong>Attribute Grouping:</strong> Determining how columns are grouped into physical records to optimize page fill factor.</li>
  <li><strong>File Organizations:</strong> Selecting sequential, direct/hashed, or indexed file layouts for table storage.</li>
  <li><strong>Access Structures:</strong> Creating primary/secondary B-tree indexes, clustered indexes, or hash keys for frequent queries.</li>
  <li><strong>Controlled Denormalization:</strong> Merging specific tables to eliminate expensive multi-table JOINs in read-heavy workloads.</li>
</ol>`,
    urdu_answer: 'فزیکل ڈیزائن کے اہم فیصلے: (1) فیلڈز کے عین ڈیٹا ٹائپس اور سائز کا انتخاب، (2) فزیکل ریکارڈز میں ایٹریبیوٹس کی ترتیب، (3) فائل آرگنائزیشن کا انتخاب (جیسے انڈیکسڈ یا ہیشڈ فائلز)، (4) انڈیکسز اور ایکسیس اسٹرکچرز کا ڈیزائن، اور (5) ضرورت کے مطابق دانستہ ڈی نارملائزیشن۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 21.`);

// 3 Long Questions (5 marks each: 2 Analytical + 1 Problem-Solving)
const longQuestions = [
  {
    stem: 'Explain the complete Normalization Summary and walk through a comprehensive step-by-step normalization example from an un-normalized document/order record through 1NF, 2NF, and 3NF.',
    correct: 'Normalization transforms un-normalized tables into 3NF by: 1NF eliminating repeating groups and establishing composite key, 2NF eliminating partial dependencies into separate tables, and 3NF eliminating transitive dependencies.',
    explanation: `<p><strong>Comprehensive Normalization Walkthrough (UNF &rarr; 1NF &rarr; 2NF &rarr; 3NF):</strong></p>

<p><strong>1. Un-Normalized Form (UNF):</strong><br>
Consider a sales order invoice containing customer details and a list of ordered line items:<br>
<code>ORDER_DOC(OrderNo, OrderDate, CustNo, CustName, CustCity, {ItemNo, ItemDesc, UnitPrice, QtyOrdered})</code><br>
The nested bracket <code>{...}</code> indicates a repeating group violating atomicity.</p>

<p><strong>2. First Normal Form (1NF Conversion):</strong><br>
Flatten the repeating groups so each cell holds one scalar value. Establish the composite primary key <code>{OrderNo, ItemNo}</code>:<br>
<code>ORDER_1NF(OrderNo, OrderDate, CustNo, CustName, CustCity, ItemNo, ItemDesc, UnitPrice, QtyOrdered)</code><br>
<em>Primary Key:</em> <code>{OrderNo, ItemNo}</code>.</p>

<p><strong>3. Second Normal Form (2NF Conversion):</strong><br>
Identify and remove <strong>Partial Dependencies</strong> on subsets of <code>{OrderNo, ItemNo}</code>:</p>
<ul>
  <li><code>OrderNo &rarr; {OrderDate, CustNo, CustName, CustCity}</code> (Partial Dependency)</li>
  <li><code>ItemNo &rarr; {ItemDesc, UnitPrice}</code> (Partial Dependency)</li>
  <li><code>{OrderNo, ItemNo} &rarr; QtyOrdered</code> (Full Functional Dependency)</li>
</ul>
<p><strong>Decomposed 2NF Tables:</strong></p>
<ul>
  <li><code>ORDERS(OrderNo, OrderDate, CustNo, CustName, CustCity)</code> [PK: <code>OrderNo</code>]</li>
  <li><code>ITEMS(ItemNo, ItemDesc, UnitPrice)</code> [PK: <code>ItemNo</code>]</li>
  <li><code>ORDER_LINE(OrderNo, ItemNo, QtyOrdered)</code> [PK: <code>{OrderNo, ItemNo}</code>]</li>
</ul>

<p><strong>4. Third Normal Form (3NF Conversion):</strong><br>
Examine <code>ORDERS</code> for <strong>Transitive Dependencies</strong> among non-key attributes:</p>
<ul>
  <li><code>OrderNo &rarr; CustNo</code> and <code>CustNo &rarr; {CustName, CustCity}</code> (Transitive Dependency).</li>
</ul>
<p><strong>Final 3NF Relations:</strong></p>
<ol>
  <li><code>CUSTOMER(CustNo, CustName, CustCity)</code> [PK: <code>CustNo</code>]</li>
  <li><code>ORDERS(OrderNo, OrderDate, CustNo)</code> [PK: <code>OrderNo</code>, FK: <code>CustNo</code>]</li>
  <li><code>ITEMS(ItemNo, ItemDesc, UnitPrice)</code> [PK: <code>ItemNo</code>]</li>
  <li><code>ORDER_LINE(OrderNo, ItemNo, QtyOrdered)</code> [PK: <code>{OrderNo, ItemNo}</code>, FKs: <code>OrderNo</code>, <code>ItemNo</code>]</li>
</ol>`,
    urdu_answer: 'نارملائزیشن کی جامع مثال: غیر نارملائزڈ آرڈر ریکارڈ میں ایک سے زیادہ آئٹمز موجود ہوتے ہیں۔ 1NF میں ریپیٹنگ آئٹمز کو الگ قطاروں میں پھیلا کر کمپوزٹ کی {OrderNo, ItemNo} بنائی جاتی ہے۔ 2NF میں آرڈر اور آئٹم کی الگ الگ معلومات کو الگ ٹیبلز میں نکال کر پارشل ڈیپینڈینسی ختم کی جاتی ہے۔ 3NF میں گاہک کی معلومات (CustNo &rarr; CustName) کو الگ کسٹمر ٹیبل میں رکھ کر ٹرانزیٹیو ڈیپینڈینسی کا خاتمہ کیا جاتا ہے۔'
  },
  {
    stem: 'Discuss Physical Database Design in detail: Explain its core goals, inputs, transformation of logical constructs, and performance optimization trade-offs like Denormalization.',
    correct: 'Physical database design translates logical schemas into DBMS storage structures, balancing execution efficiency with storage. It maps entities to tables, domains to data types, and evaluates denormalization to reduce join overhead for critical transactions.',
    explanation: `<p><strong>Physical Database Design: Architecture and Implementation:</strong></p>

<p><strong>1. Objectives and Paradigm Shift:</strong></p>
<ul>
  <li><strong>Logical Design Goal:</strong> Storage economy, structural purity, and data consistency.</li>
  <li><strong>Physical Design Goal:</strong> Query execution speed, I/O minimization, response time guarantees, and resource throughput.</li>
</ul>

<p><strong>2. Mapping Logical Constructs to Physical Constructs:</strong></p>
<ul>
  <li><strong>Entities</strong> map to physical storage <strong>Tables</strong>.</li>
  <li><strong>Attributes</strong> map to physical <strong>Columns</strong> with strict native data types (e.g., <code>INT</code>, <code>VARCHAR</code>).</li>
  <li><strong>Relationships</strong> map to <strong>Foreign Keys</strong> and clustered/non-clustered index paths.</li>
</ul>

<p><strong>3. Performance Optimization Strategies:</strong></p>
<ul>
  <li><strong>File Organizations:</strong> Heap files (fast inserts), Sequential files (batch scans), or B-Tree Indexed files (fast random lookups).</li>
  <li><strong>Secondary Indexes:</strong> Creating composite indexes on high-frequency search attributes.</li>
  <li><strong>Data Compression:</strong> Reducing disk footprint to maximize memory buffer cache hit ratios.</li>
</ul>

<p><strong>4. Controlled Denormalization:</strong><br>
When high-frequency OLTP or reporting queries require joining four or five 3NF tables repeatedly, disk read latency can degrade throughput. Designers selectively denormalize (re-introduce controlled redundancy) to avoid costly joins, provided that update anomalies are mitigated via triggers or application constraints.</p>`,
    urdu_answer: 'فزیکل ڈیٹا بیس ڈیزائن کا تفصیلی جائزہ: یہ مرحلہ لاجیکل اینٹیٹیز کو فزیکل ٹیبلز، ایٹریبیوٹس کو ڈیٹا ٹائپس اور ریلیشنز کو فارن کیز اور انڈیکسز میں ڈھالتا ہے۔ اس کا بنیادی ہدف کوئری کی رفتار بڑھانا ہے۔ جب بار بار جوائنز (JOINs) لگانے سے سسٹم سست ہو رہا ہو تو ڈیزائنرز نپی تلی ڈی نارملائزیشن کے ذریعے کارکردگی کو تیز کر لیتے ہیں۔'
  },
  {
    stem: 'Numerical / Problem-Solving Question: You are given an un-normalized document record: INVOICE(Inv_No, Date, Cust_ID, Cust_Name, Item_Code, Item_Name, Qty, Price) where an invoice contains multiple items. Step-by-step convert this schema into Third Normal Form (3NF), identifying primary keys, foreign keys, and dependencies at each step.',
    correct: '1NF: Flatten table with composite key {Inv_No, Item_Code}. 2NF: Remove partial dependencies to form INVOICE_HEADER(Inv_No, Date, Cust_ID, Cust_Name), ITEM(Item_Code, Item_Name, Price), and INVOICE_DETAIL(Inv_No, Item_Code, Qty). 3NF: Remove transitive dependency to form CUSTOMER(Cust_ID, Cust_Name) and update INVOICE_HEADER.',
    explanation: `<p><strong>Problem-Solving Solution: Normalizing INVOICE to 3NF:</strong></p>

<p><strong>Step 1: First Normal Form (1NF) Conversion:</strong><br>
Flatten all repeating items across distinct rows so every cell is atomic. Establish a composite primary key composed of invoice and item identifiers:</p>
<p><code>INVOICE_1NF(Inv_No, Date, Cust_ID, Cust_Name, Item_Code, Item_Name, Qty, Price)</code><br>
<strong>Primary Key:</strong> <code>{Inv_No, Item_Code}</code></p>

<p><strong>Step 2: Second Normal Form (2NF) Conversion (Remove Partial Dependencies):</strong></p>
<ul>
  <li><code>Inv_No &rarr; {Date, Cust_ID, Cust_Name}</code> (Depends only on part of PK)</li>
  <li><code>Item_Code &rarr; {Item_Name, Price}</code> (Depends only on part of PK)</li>
  <li><code>{Inv_No, Item_Code} &rarr; Qty</code> (Depends on full composite PK)</li>
</ul>
<p><strong>2NF Schemas:</strong></p>
<ul>
  <li><code>INVOICE_HEADER(Inv_No, Date, Cust_ID, Cust_Name)</code> [PK: <code>Inv_No</code>]</li>
  <li><code>ITEM(Item_Code, Item_Name, Price)</code> [PK: <code>Item_Code</code>]</li>
  <li><code>INVOICE_DETAIL(Inv_No, Item_Code, Qty)</code> [PK: <code>{Inv_No, Item_Code}</code>]</li>
</ul>

<p><strong>Step 3: Third Normal Form (3NF) Conversion (Remove Transitive Dependencies):</strong><br>
In <code>INVOICE_HEADER</code>, <code>Cust_ID &rarr; Cust_Name</code> is a transitive dependency between non-key attributes.<br>
Extract <code>CUSTOMER</code> into a separate relation:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #d1fae5;">
      <th>Final 3NF Table</th>
      <th>Attributes</th>
      <th>Primary Key</th>
      <th>Foreign Key(s)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>CUSTOMER</strong></td>
      <td><code>Cust_ID, Cust_Name</code></td>
      <td><code>Cust_ID</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td><strong>INVOICE</strong></td>
      <td><code>Inv_No, Date, Cust_ID</code></td>
      <td><code>Inv_No</code></td>
      <td><code>Cust_ID</code> references CUSTOMER</td>
    </tr>
    <tr>
      <td><strong>ITEM</strong></td>
      <td><code>Item_Code, Item_Name, Price</code></td>
      <td><code>Item_Code</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td><strong>INVOICE_DETAIL</strong></td>
      <td><code>Inv_No, Item_Code, Qty</code></td>
      <td><code>{Inv_No, Item_Code}</code></td>
      <td><code>Inv_No</code> references INVOICE, <code>Item_Code</code> references ITEM</td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'مسئلہ کا حل (INVOICE کو 3NF میں تبدیل کرنا): 1NF میں تمام آئٹمز کو الگ الگ قطاروں میں رکھ کر کمپوزٹ کی {Inv_No, Item_Code} بنائی جاتی ہے۔ 2NF میں انوائس ہیڈر اور آئٹم ماسٹر کو الگ کر کے پارشل ڈیپینڈینسی ختم کی جاتی ہے۔ 3NF میں کسٹمر کی معلومات (Cust_ID &rarr; Cust_Name) کو الگ کر کے چار مکمل نارملائزڈ ٹیبلز (CUSTOMER, INVOICE, ITEM, INVOICE_DETAIL) حاصل کیے جاتے ہیں۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 21.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 21 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

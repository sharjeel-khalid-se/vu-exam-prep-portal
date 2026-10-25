import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// ── Step 1: Find CS403 Subject ───────────────────────────────────────────────
const subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403'`).get();
if (!subj) {
  console.error('CS403 subject not found');
  process.exit(1);
}

// ── Step 2: Check if CS403 L4 already exists ─────────────────────────────────
const existing = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(subj.id);
if (existing) {
  console.log('CS403 Lecture 4 already exists with ID:', existing.id);
  // Check count of questions
  const count = db.prepare(`SELECT count(*) as c FROM questions WHERE lecture_id = ?`).get(existing.id);
  console.log(`Lecture 4 already has ${count.c} questions.`);
  process.exit(0);
}

// ── Step 3: Insert CS403 Lecture 4 ───────────────────────────────────────────
const l4res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 4, ?)`).run(
  subj.id,
  'DBMS Functions and Multi-User Architectures'
);
const l4Id = l4res.lastInsertRowid;
console.log('Inserted CS403 Lecture 4 with ID:', l4Id);

const ins = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
`);

const insS = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
`);

const insL = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// ── Step 4: Insert 10 MCQs ───────────────────────────────────────────────────

// MCQ 1
ins.run(
  l4Id,
  'Which is NOT the function of Database Management System?',
  JSON.stringify({
    a: 'A user accessible Catalog',
    b: 'Concurrency Control Services',
    c: 'Failure Response Service',
    d: 'Support for Data Communication'
  }),
  'c',
  'Failure Response Service is NOT a recognized function of a DBMS. Core DBMS functions include User Accessible Catalog, Concurrency Control Services, Recovery Services, Authorization/Security, and Data Communication support.',
  'ڈیٹا بیس مینجمنٹ سسٹم کے بنیادی فنکشنز میں Recovery سروسز، Concurrency کنٹرول اور کیٹلاگ شامل ہیں، Failure Response Service نامی کوئی فنکشن نہیں ہوتا۔'
);

// MCQ 2
ins.run(
  l4Id,
  'Teleprocessing is a sub-type of ______',
  JSON.stringify({
    a: 'Single user database',
    b: 'Multi-user database',
    c: 'File server',
    d: 'Client server'
  }),
  'b',
  'Teleprocessing is an early multi-user database architecture where one central computer (mainframe) handles all processing for multiple connected dumb terminals.',
  'ٹیلی پروسیسنگ ملٹی یوزر ڈیٹا بیس آرکیٹیکچر کی ایک قسم ہے جس میں مرکزی کمپیوٹر تمام پروسیسنگ کرتا ہے۔'
);

// MCQ 3
ins.run(
  l4Id,
  'A ______ is used to maintain a connection between the users of the database system.',
  JSON.stringify({
    a: 'Virtual server',
    b: 'File server',
    c: 'Client server',
    d: 'FTP server'
  }),
  'b',
  'In a file server architecture, the file server acts as a central repository maintaining file-level connections and sharing disk storage across connected network users.',
  'فائل سرور ڈیٹا بیس کے صارفین کے درمیان کنکشن اور فائلوں کا اشتراک برقرار رکھنے کے لیے استعمال ہوتا ہے۔'
);

// MCQ 4
ins.run(
  l4Id,
  'User rights information is stored in ______.',
  JSON.stringify({
    a: 'Physical database',
    b: 'Catalog',
    c: 'Logical database',
    d: 'Buffer'
  }),
  'b',
  'The data catalog (or data dictionary/system catalog) stores metadata including user accounts, access permissions, security constraints, and database schemas.',
  'صارفین کے اختیارات اور حقوق کی معلومات (User Rights) سسٹم کیٹلاگ (Catalog) میں محفوظ کی جاتی ہیں۔'
);

// MCQ 5
ins.run(
  l4Id,
  'Which feature of database provides conversion from inconsistent state of DB to a consistent state ensuring minimum data loss?',
  JSON.stringify({
    a: 'User accessible catalog',
    b: 'Data processing',
    c: 'Recovery service',
    d: 'Authorization service'
  }),
  'c',
  'Recovery service restores the database to a consistent and correct state after software crashes, hardware malfunctions, or unexpected system aborts, with minimal or zero data loss.',
  'ریکوری سروس خرابی یا سسٹم کے اچانک بند ہونے کی صورت میں ڈیٹا بیس کو غیر متوازن حالت سے متوازن حالت میں واپس لاتی ہے۔'
);

// MCQ 6
ins.run(
  l4Id,
  'On magnetic media, data is stored in ______.',
  JSON.stringify({
    a: 'Text',
    b: 'Images',
    c: 'Binary format',
    d: 'Tables'
  }),
  'c',
  'At the physical hardware level on magnetic media (disks, tapes), data is physically recorded in binary format (sequence of 0s and 1s) via magnetic charges.',
  'مقناطیسی میڈیا پر فزیکل لیول پر ڈیٹا ہمیشہ بائنری فارمیٹ (0 اور 1) کی شکل میں محفوظ ہوتا ہے۔'
);

// MCQ 7
ins.run(
  l4Id,
  'Once the data has been transported to the physical level it is then managed by the ______.',
  JSON.stringify({
    a: 'Database',
    b: 'Program',
    c: 'Operating system',
    d: 'View'
  }),
  'c',
  'Once data moves past the internal DBMS level to the physical hardware/disk block layer, physical I/O and disk management are handled directly by the Operating System (OS).',
  'جب ڈیٹا فزیکل لیول پر پہنچ جاتا ہے تو اس کی فائل اور ڈسک مینیجمنٹ آپریٹنگ سسٹم (OS) کے سپرد ہوتی ہے۔'
);

// MCQ 8
ins.run(
  l4Id,
  'Each component of DBMS performs ______ functions.',
  JSON.stringify({
    a: 'Similar',
    b: 'Different',
    c: 'Identical',
    d: 'Computational'
  }),
  'b',
  'A DBMS is modular; each individual component (query processor, transaction manager, recovery manager, catalog manager, buffer manager) is specialized to execute distinct and different functions.',
  'ڈی بی ایم ایس کا ہر جزو مخصوص اور مختلف (Different) ذمہ داریاں انجام دیتا ہے۔'
);

// MCQ 9
ins.run(
  l4Id,
  '______ provides the change transparency between Conceptual and Internal level.',
  JSON.stringify({
    a: 'Physical Data Independence',
    b: 'Concurrency Control',
    c: 'Logical Data independence',
    d: 'Functional Dependency'
  }),
  'a',
  'Physical Data Independence is the capacity to change the internal schema (storage structures, indexing, file organization) without altering the conceptual schema or application programs.',
  'فزیکل ڈیٹا انڈیپنڈنس کا مطلب یہ ہے کہ انٹرنل لیول کی تبدیلیوں سے کونسیپچول لیول متاثر نہیں ہوتا۔'
);

// MCQ 10
ins.run(
  l4Id,
  'In Client-Server environment, client machine sends its request to DBMS through ______.',
  JSON.stringify({
    a: 'Operating system',
    b: 'Application software',
    c: 'File server',
    d: 'Catalog'
  }),
  'b',
  'In a client-server architecture, end-users interact with an application software (client interface), which formats and transmits requests/queries across the network to the database server.',
  'کلائنٹ سرور ماحول میں کلائنٹ مشین ایپلی کیشن سافٹ ویئر کے ذریعے ڈیٹا بیس سرور کو اپنی درخواست بھیجتی ہے۔'
);

// ── Step 5: Insert 4 Short Questions ─────────────────────────────────────────

// SQ 1
insS.run(
  l4Id,
  'List any five major functions performed by a DBMS.',
  `The five major functions performed by a DBMS are:
1. Data Processing Services: Providing capabilities for creating, defining, updating, and querying database records.
2. User Accessible Catalog: Maintaining an integrated data dictionary that records data definitions, schemas, and user security permissions.
3. Concurrency Control Services: Coordinating simultaneous access by multiple concurrent users to prevent update conflicts and inconsistent states.
4. Recovery Services: Mechanisms to restore database state to consistency after hardware crashes, software faults, or aborted transactions.
5. Authorization and Security Services: Ensuring that only authenticated and authorized users can access or modify designated portions of the database.`,
  'DBMS core services ensure reliable multi-user data storage and prevent data corruption.',
  'ڈیٹا بیس مینجمنٹ سسٹم کے 5 اہم فنکشنز: ڈیٹا پروسیسنگ، یوزر ایکسی ایبل کیٹلاگ (ڈیٹا ڈکشنری)، کونکورینسی کنٹرول، ریکوری سروسز، اور سیکیورٹی و اجازت نامہ (Authorization)۔'
);

// SQ 2
insS.run(
  l4Id,
  'Briefly describe File Server Architecture and its main disadvantage.',
  `File Server Architecture:
In a file server architecture, a centralized file server acts as a shared disk holding the database files across a Local Area Network (LAN). The DBMS software and user applications run entirely on each local client workstation.

Main Disadvantage:
When a client executes a query, the file server must transmit entire database files over the network to the client workstation for local filtering and processing. For large databases, this generates massive network traffic, high latency, and severe performance bottlenecks.`,
  'Because the server is only a file storage device, all query processing is forced onto client machines over the network.',
  'فائل سرور آرکیٹیکچر میں ڈیٹا بیس فائلز مرکزی سرور پر ہوتی ہیں لیکن ڈی بی ایم ایس سافٹ ویئر ہر کلائنٹ پر چلتا ہے۔ اس کا بڑا نقصان یہ ہے کہ معمولی ڈیٹا کے لیے بھی پوری فائل نیٹ ورک پر ٹرانسفر کرنا پڑتی ہے جس سے نیٹ ورک پر شدید بوجھ پڑتا ہے۔'
);

// SQ 3
insS.run(
  l4Id,
  'What is the main advantage of Client-Server Architecture over File Server Architecture?',
  `Main Advantage of Client-Server Architecture:
In Client-Server architecture, query processing is executed on the database server itself rather than on the client workstation. 

When a client application submits an SQL query, the database server searches, indexes, filters, and processes the data locally, and transmits ONLY the final result set back across the network to the client. This drastically minimizes network traffic, reduces communication overhead, and optimizes performance in large-scale multi-user environments.`,
  'Client-Server separates presentation from database processing, transmitting only query answers rather than raw database files.',
  'کلائنٹ سرور کا سب سے بڑا فائدہ یہ ہے کہ کیوری سرور پر پراسیس ہوتی ہے اور نیٹ ورک پر صرف مطلوبہ رزلٹ واپس بھیجا جاتا ہے، پوری فائل نہیں۔ اس سے نیٹ ورک ٹریفک بہت کم ہو جاتی ہے۔'
);

// SQ 4
insS.run(
  l4Id,
  'Differentiate between Internal View and Physical View.',
  `Differences between Internal View and Physical View:

1. Internal View:
• Belongs to the DBMS domain and is managed according to specifications created by the Database Administrator (DBA).
• Defines file organizations, record types, field structures, indexing methods (e.g., B-Trees, hashing), and logical storage allocations.
• Represents how the DBMS views data internally.

2. Physical View:
• Belongs to the Operating System and underlying physical hardware storage domain.
• Defines the actual physical placement of data on storage media (disks, tapes) across tracks, sectors, and blocks.
• Data is stored purely in binary format (sequence of 0s and 1s) and managed directly by the OS file system and device drivers.`,
  'Internal view is the lowest schema level managed by the DBMS; Physical view is managed underneath by the Operating System.',
  'انٹرنل ویو ڈی بی ایم ایس کے ماتحت ہوتا ہے جس میں ریکارڈز، فیلڈز اور انڈیکسز کی ترتیب ہوتی ہے۔ جبکہ فزیکل ویو آپریٹنگ سسٹم کے زیر انتظام ہوتا ہے جہاں مقناطیسی ڈسک پر ڈیٹا 0 اور 1 (بائنری) کی شکل میں محفوظ ہوتا ہے۔'
);

// ── Step 6: Insert 2 Long Questions ──────────────────────────────────────────

// LQ 1
insL.run(
  l4Id,
  'Explain the various Multi-User Database Architectures (Teleprocessing, File Server, and Client-Server).',
  `Multi-User Database Architectures:

1. Teleprocessing Architecture:
• Traditional mainframe computing configuration where a single central computer hosts the operating system, DBMS engine, application programs, and database.
• Users connect through 'dumb terminals' consisting solely of a monitor and keyboard without local CPU processing power.
• All processing, query execution, and display formatting are performed by the central mainframe.
• Disadvantage: Places an enormous processing burden on the central computer and does not scale well with modern graphical user interfaces.

2. File Server Architecture:
• Database files reside on a central file server connected to multiple client personal computers via a Local Area Network (LAN).
• Each client PC runs its own full copy of the DBMS software and application interface.
• The file server simply acts as a remote shared hard drive. When a client submits a query, the server sends whole data files across the network for local processing.
• Disadvantage: Creates heavy network traffic, causes severe concurrency and locking bottlenecks, and degrades performance as database size expands.

3. Client-Server Architecture:
• Divides computing responsibilities between two specialized tiers:
  a. Client (Front-end): Runs the user interface and client application software, handling screen formatting, input validation, and user interaction.
  b. Database Server (Back-end): High-performance dedicated machine hosting the DBMS engine, handling transaction management, concurrency control, security, and query execution.
• When a client submits a request, the server executes the query locally against the database and transmits only the requested result rows across the network.
• Advantages: Dramatically reduced network traffic, improved response times, enhanced centralized security, and excellent scalability for enterprise workloads.`,
  'Client-server architecture overcomes the performance bottlenecks of teleprocessing and file server architectures by distributing processing logically.',
  'ملٹی یوزر ڈیٹا بیس کے تین بنیادی ماڈلز: 1. ٹیلی پروسیسنگ (مین فریم اور ڈمب ٹرمینلز)، 2. فائل سرور (سنٹرل فائلز مگر کلائنٹ پر ڈی بی ایم ایس پروسیسنگ جس سے نیٹ ورک پر لوڈ آتا ہے)، 3. کلائنٹ سرور (فرنٹ اینڈ کلائنٹ پر اور بیک اینڈ سرور پر، نیٹ ورک پر صرف رزلٹ ٹرانسفر ہوتا ہے)۔'
);

// LQ 2
insL.run(
  l4Id,
  'Discuss the Core Functions provided by a Database Management System (DBMS).',
  `Core Functions of a Database Management System (DBMS):

A comprehensive DBMS provides eight essential functions to manage enterprise data securely and efficiently:

1. Data Processing and Storage Services:
Provides facilities for creating, updating, reading, and deleting database records, abstracting low-level physical file structures away from application programmers.

2. User-Accessible Catalog (Data Dictionary):
Maintains centralized metadata detailing entity types, data schemas, relationship definitions, user accounts, and security access permissions.

3. Transaction Management:
Guarantees ACID properties (Atomicity, Consistency, Isolation, Durability) to ensure database transactions complete fully or rollback cleanly without corrupting data.

4. Concurrency Control Services:
Coordinates simultaneous multi-user database operations, employing locking mechanisms and timestamping to prevent anomalies like lost updates or dirty reads.

5. Recovery Services:
Employs transaction logs, checkpointing, and backup mechanisms to restore the database to a verified consistent state following system crashes or power failures.

6. Authorization and Security Services:
Enforces authentication, user roles, view-level restrictions, and encryption to ensure only authorized users access or modify protected data.

7. Support for Data Communication:
Interfaces with network communication managers and application servers to accept remote user requests and return query responses across distributed networks.

8. Data Integrity Enforcement:
Validates domain constraints, entity integrity (primary keys), and referential integrity (foreign keys) to prevent corrupt or inconsistent data from entering the database.`,
  'These eight core services distinguish a professional DBMS from primitive file storage systems, ensuring data durability and integrity.',
  'ڈی بی ایم ایس کے 8 اہم افعال: ڈیٹا پروسیسنگ و اسٹوریج، یوزر ایکسی ایبل کیٹلاگ، ٹرانزیکشن مینیجمنٹ، کونکورینسی کنٹرول، ریکوری سروسز، سیکیورٹی و اجازت، ڈیٹا کمیونیکیشن، اور انٹیگریٹی کانسٹڑینٹس۔'
);

console.log('✅ Successfully seeded CS403 Lecture 4: 10 MCQs, 4 Short Questions, and 2 Long Questions.');

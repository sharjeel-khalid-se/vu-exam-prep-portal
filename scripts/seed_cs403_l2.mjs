import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// Fix: lecture id=14 was wrongly created by the seed.ts append block
// It currently has wrong title (ER) - but actually it was newly inserted with no questions yet
// Let's check what's in id=14
const l14 = db.prepare(`SELECT * FROM lectures WHERE id = 14`).get();
console.log('Lecture id=14:', l14);
const q14 = db.prepare(`SELECT id, type, stem FROM questions WHERE lecture_id = 14`).all();
console.log('Questions in id=14:', q14.length);

// Fix the title of id=14 to be the correct L2 title
db.prepare(`UPDATE lectures SET title = 'Levels of Data, Metadata, and Database Users' WHERE id = 14`).run();
console.log('Fixed title of id=14');

// Now insert all L2 questions into id=14
const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insShort = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
const insLong = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

const l2Id = 14;

// MCQ 1
ins.run(l2Id,'mcq','The level of data at which entities or objects exist in reality is called:',JSON.stringify({a:'Real world data',b:'Schema for real world data',c:'Meta data',d:'Data about data'}),'a','Real world data is the level where actual entities (e.g., a person named Ali) exist in reality with their attributes.',1,1,'lecture');
// MCQ 2
ins.run(l2Id,'mcq','Metadata is also known as ________ for the real world data.',JSON.stringify({a:'Attribute',b:'Schema',c:'Entity',d:'Relation'}),'b','Metadata defines the schema — structural rules (field names, data types, sizes) describing how real-world data will be stored.',1,1,'lecture');
// MCQ 3
ins.run(l2Id,'mcq','Data about data is called:',JSON.stringify({a:'Metadata',b:'Real world data',c:'Database',d:'Relation'}),'a','Metadata describes the structure, properties, and meaning of the actual data — it is literally data about data.',1,1,'lecture');
// MCQ 4
ins.run(l2Id,'mcq','Which one of the following is NOT a characteristic of metadata?',JSON.stringify({a:'Data about data',b:'Describes a data dictionary',c:'Self-describing',d:'Includes user data'}),'d','Metadata describes structure (field names, types, sizes); it does NOT store actual user data values.',1,1,'lecture');
// MCQ 5
ins.run(l2Id,'mcq','Who is responsible for authorizing access to the database, and for coordinating and monitoring its use?',JSON.stringify({a:'Database Designer',b:'Database Administrator',c:'End User',d:'Application Programmer'}),'b','The DBA manages all aspects of security, authorization, performance monitoring, and database coordination.',1,1,'lecture');
// MCQ 6
ins.run(l2Id,'mcq','Users who know what to do and how to do it are called:',JSON.stringify({a:'Beginners',b:'Intermediate',c:'Experts',d:'New'}),'c','Expert users have full knowledge of database operations — they know both what action to perform and how to execute it.',1,1,'lecture');
// MCQ 7
ins.run(l2Id,'mcq','According to their level of knowledge and understanding, how many types of database users are there?',JSON.stringify({a:'Three',b:'Four',c:'Six',d:'Two'}),'a','Database users are classified into three categories: Beginners, Intermediate, and Experts.',1,1,'lecture');
// MCQ 8
ins.run(l2Id,'mcq','Which of the following best describes the job of a Database Administrator (DBA)?',JSON.stringify({a:'Development, implementation and operation of the physical database',b:'Creation of the system catalog',c:'Monitoring and controlling database security and authorization',d:'All of the above'}),'d','The DBA is responsible for all three: physical database management, system catalog creation, and security/authorization control.',1,1,'lecture');
// MCQ 9
ins.run(l2Id,'mcq','Which of the following is an example of metadata?',JSON.stringify({a:'Ali',b:'Address',c:'Person',d:'Student'}),'b','"Address" is a field name (structural attribute name) — this is metadata. "Ali" is an actual data value.',1,1,'lecture');

// Short 1
insShort.run(l2Id,
  'Define Metadata and give an example.',
  `Metadata is defined as "data about data." It is the schema for the real-world data — it describes the structure, data type, field length, and properties of stored entities rather than storing actual data values.

Example:
  Field Name : Name
  Data Type  : Character
  Field Size : 25 characters

"Name", "Character", and "25" are metadata — they describe the structure of actual data (e.g., "Ali") but are not the data themselves.

Key Property: A DBMS is self-describing because it stores its own metadata in the system catalog (data dictionary).`,
  'Metadata = data about data = schema. It describes structure (field names, types, sizes), not actual values.'
);

// Short 2
insShort.run(l2Id,
  'Name and briefly describe the three Levels of Data in a database system.',
  `Database data exists at three distinct levels:

1. Real World Data:
   Entities or objects exist in physical reality with identifiable attributes.
   Example: A person named "Ali" with address "Lahore" and salary "50,000".

2. Meta Data (Schema):
   Rules/schema defining how real-world data will be stored — "data about data."
   Example: Field "Name" of type Character(25), field "Salary" of type Number(8).

3. Data Occurrence (Existence of Data):
   Actual data values stored conforming to the metadata rules.
   Example: "Ali", "Lahore", 50000 — real stored records conforming to the schema.`,
  'Three levels: Real World (entities exist), Metadata (schema/structure), Data Occurrence (actual stored values).'
);

// Short 3
insShort.run(l2Id,
  'What are the main costs involved in implementing a DBMS?',
  `Major DBMS implementation costs:

1. High Initial Cost: Acquiring DBMS software licences and hardware upgrades.
2. Data Conversion Cost: Converting legacy data from manual files or older systems.
3. Training Cost: Personnel must be trained to use the new system effectively.
4. Overhead and Complexity: Additional processing for security, concurrency, and integrity enforcement.
5. Risk of Catastrophic Failure: Centralising data increases failure impact; complex backup/recovery needed.`,
  'DBMS costs: software/hardware, data conversion, training, processing overhead, and catastrophic failure risk.'
);

// Short 4
insShort.run(l2Id,
  'List the major categories of Database Users and briefly describe each.',
  `Major categories of database users:

1. Database Administrator (DBA):
   Manages security, authorization, system catalog, performance tuning, and backup/recovery.

2. Database Designers:
   Design logical (ER model, schema) and physical (storage, indexes) database structure.

3. Application Programmers:
   Write programs and SQL queries to implement business logic and generate reports.

4. End Users:
   Query, insert, update, or delete data. Classified as:
   - Beginners: use menu-driven interfaces.
   - Intermediate: use forms and simple queries.
   - Experts: write complex queries directly.`,
  'Four categories: DBA (admin), Designers (schema), Programmers (code), End Users (beginners/intermediate/experts).'
);

// Long 1
insLong.run(l2Id,
  'Write a detailed note on the three Levels of Data in a database system, explaining each level with suitable examples and tables.',
  `A database system organises data at three distinct levels:

LEVEL 1 — REAL WORLD DATA
Definition: The level at which real entities physically exist with identifiable characteristics.
Example Entity: PERSON
  Name    : Ali
  Address : 15 Model Town, Lahore
  Salary  : Rs. 50,000/month
At this level we identify WHAT needs to be stored.

LEVEL 2 — META DATA (Schema)
Definition: "Data about data" — the schema defining structure, data types, and storage rules.
Does NOT contain actual values.
Example Schema:
  Field Name | Data Type  | Size | Constraint
  Name       | Character  |  25  | NOT NULL
  Address    | Character  |  50  | NULL allowed
  Salary     | Number     |   8  | >= 0
The DBMS stores this in its System Catalog, making the system self-describing.

LEVEL 3 — DATA OCCURRENCE
Definition: Actual data values stored conforming to the metadata schema. Each row is one occurrence.
Example Stored Records:
  Name    | Address            | Salary
  Ali     | 15 Model Town LHR  | 50000
  Sara    | 5 Gulberg III LHR  | 65000
  Hassan  | 22 DHA Phase 5 LHR | 80000

RELATIONSHIP:
Real World → described by → Metadata → used to store → Data Occurrence
Key Point: One schema can hold thousands of data occurrences.`,
  'Three levels: Real World (what exists) → Metadata (how to store) → Data Occurrence (what is stored).'
);

// Long 2
insLong.run(l2Id,
  'Explain the responsibilities of a Database Administrator (DBA) and compare them with the role of Application Programmers.',
  `DATABASE ADMINISTRATOR (DBA):
Central authority for the entire database environment.

Responsibilities:
1. Security & Authorization: Grants/revokes user access rights and login privileges.
2. System Catalog Management: Creates and maintains the data dictionary (metadata store).
3. Physical Database Design: Determines storage structures, indexing, and file organisations.
4. Performance Monitoring: Tunes queries; monitors disk usage and response times.
5. Backup & Recovery: Implements backup schedules; manages disaster recovery.
6. Data Integrity: Enforces integrity constraints and ensures data quality.
7. Concurrency Control: Manages simultaneous multi-user access to prevent conflicts.

APPLICATION PROGRAMMERS:
Develop the software interface between end users and the database.

Responsibilities:
1. Requirements Analysis: Translate end-user needs into database queries.
2. Program Development: Write application code (Java, PHP, Python) calling SQL statements.
3. SQL Query Writing: Craft SELECT, INSERT, UPDATE, DELETE in application logic.
4. Report Generation: Build reports and dashboards for end users.
5. Testing & Debugging: Verify correct data retrieval and modification.

KEY DIFFERENCES:
Aspect          | DBA                    | Application Programmer
Focus           | Database management    | Application development
Authority       | Full system authority  | Restricted to assigned DB
SQL Access      | All DDL + DML          | Primarily DML (queries)
Security Role   | Grants permissions     | Works within permissions`,
  'DBA manages the entire DB environment (security, backup, tuning); App Programmers build software using the database.'
);

// Final report
console.log('\n=== FINAL CS403 LECTURE STRUCTURE ===');
const lectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = 1 ORDER BY number`).all();
for (const l of lectures) {
  const qcount = db.prepare(`SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?`).get(l.id);
  const types = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type`).all(l.id);
  console.log(`L${l.number} (id=${l.id}): "${l.title}" — ${qcount.c} questions`);
  types.forEach(t => console.log(`   ${t.type}: ${t.c}`));
}

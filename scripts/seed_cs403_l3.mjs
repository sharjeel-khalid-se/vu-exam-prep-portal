import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// ── Step 1: Renumber old L3 (ER) → L5, old L4 (Normalization) → L6 ─────────
db.prepare(`UPDATE lectures SET number = 6 WHERE subject_id = 1 AND number = 4`).run();
db.prepare(`UPDATE lectures SET number = 5 WHERE subject_id = 1 AND number = 3`).run();

// ── Step 2: Check L3 doesn't exist yet ──────────────────────────────────────
const subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403'`).get();
const existing = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(subj.id);
if (existing) { console.log('CS403 L3 already exists'); process.exit(0); }

// ── Step 3: Insert CS403 Lecture 3 ──────────────────────────────────────────
const l3res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 3, ?)`).run(
  subj.id,
  'Three-Level Architecture (ANSI/SPARC) and Data Independence'
);
const l3Id = l3res.lastInsertRowid;
console.log('Inserted CS403 L3, id =', l3Id);

const ins   = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insS  = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
const insL  = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

// ── MCQs ─────────────────────────────────────────────────────────────────────

// MCQ 1 — NOT a part of three-level architecture
ins.run(l3Id,'mcq',
  'Which one of the following is NOT a part of the three-level architecture?',
  JSON.stringify({a:'External level',b:'Conceptual level',c:'Internal level',d:'Physical level'}),
  'd',
  'The ANSI/SPARC three-level architecture comprises External, Conceptual, and Internal levels. "Physical level" is not a standard name in this architecture (Internal level handles physical storage).',
  1,1,'lecture');

// MCQ 2 — Logical data independence
ins.run(l3Id,'mcq',
  'Making a change to the conceptual schema of a database without affecting the existing external schemas is an example of:',
  JSON.stringify({a:'Physical data independence',b:'Concurrency control',c:'Logical data independence',d:'Functional dependency'}),
  'c',
  'Logical data independence = the ability to modify the conceptual schema without having to change external schemas or application programs.',
  1,1,'lecture');

// MCQ 3 — Purpose of three-level architecture
ins.run(l3Id,'mcq',
  'The three-level architecture is useful for:',
  JSON.stringify({a:'Arranging the data in an organized manner',b:'Hiding the details of internal systems from users',c:'Breaking the data access restriction',d:'Storing definitions of the structures'}),
  'b',
  'The primary goal of the three-level architecture is to provide data independence by hiding physical storage details from user views.',
  1,1,'lecture');

// MCQ 4 — What provides data independence
ins.run(l3Id,'mcq',
  'Which of the following provides data independence?',
  JSON.stringify({a:'3-Level Architecture',b:'File Processing System',c:'Context DFD',d:'Relational Algebra'}),
  'a',
  'The ANSI/SPARC 3-Level Architecture is specifically designed to achieve data independence by separating user views from physical storage.',
  1,1,'lecture');

// MCQ 5 — What three-level architecture separates
ins.run(l3Id,'mcq',
  'Three-level schema architecture allows us to separate the physical representation of data from the:',
  JSON.stringify({a:'System view',b:'User view',c:'Application view',d:'Logical view'}),
  'b',
  'The architecture separates the user view (external level) from the physical storage (internal level), with the conceptual level acting as the bridge.',
  1,1,'lecture');

// MCQ 6 — Correct ANSI/SPARC statement
ins.run(l3Id,'mcq',
  'Which of the following is the CORRECT statement about the ANSI/SPARC architecture?',
  JSON.stringify({
    a:'The conceptual level is an intermediate level between the internal level and the external level',
    b:'The internal level in a database system will definitely be relational',
    c:'Any given database has many conceptual schemas and one external schema',
    d:'The external level is not concerned with individual user perceptions'
  }),
  'a',
  'The conceptual level sits between external (user view) and internal (storage) levels — it is the community-wide logical view bridging both.',
  1,1,'lecture');

// MCQ 7 — Level displaying non-stored data
ins.run(l3Id,'mcq',
  'In the three-level architecture of the database, which level can display data that is not actually stored in the database?',
  JSON.stringify({a:'External Level',b:'Conceptual Level',c:'Internal Level',d:'Physical Level'}),
  'a',
  'The External Level (user views) can present derived or computed data (e.g., age calculated from date of birth) that is not physically stored.',
  1,1,'lecture');

// MCQ 8 — Level that interacts with users
ins.run(l3Id,'mcq',
  'In a three-level DBMS architecture, which level interacts directly with the users?',
  JSON.stringify({a:'External',b:'Conceptual',c:'Internal',d:'Physical'}),
  'a',
  'The External level (user view / external schema) is the one users interact with — it presents customised views of the database per user group.',
  1,1,'lecture');

// MCQ 9 — Core of database architecture
ins.run(l3Id,'mcq',
  'The core of the Database Architecture is:',
  JSON.stringify({a:'Internal level',b:'External level',c:'Conceptual level',d:'ANSI SPARC'}),
  'a',
  'The Internal level (schema) is the core of the database architecture — it defines how data is physically stored, indexed, and accessed.',
  1,1,'lecture');

// MCQ 10 — Correct statement about three-level schema
ins.run(l3Id,'mcq',
  'Which of the following is CORRECT about Three-Level Schema Architecture?',
  JSON.stringify({
    a:'External level presents data to the user',
    b:'Internal level in a database system will definitely be relational',
    c:'External Level cannot contain user views',
    d:'Conceptual Level is the core of the architecture'
  }),
  'a',
  'The External level is responsible for presenting customised views to individual users or user groups.',
  1,1,'lecture');

// MCQ 11 — Level responsible for physical storage
ins.run(l3Id,'mcq',
  'In the three-level architecture, which level is responsible for the physical storage of data on storage media?',
  JSON.stringify({a:'External view',b:'Conceptual view',c:'Internal/Physical view',d:'User view'}),
  'c',
  'The Internal (Physical) level deals with the actual storage of data on disk — record formats, file organisation, indexes, and hashing.',
  1,1,'lecture');

// ── Short Questions ───────────────────────────────────────────────────────────

insS.run(l3Id,
  'Define the ANSI/SPARC Three-Level Architecture and name its three levels.',
  `The ANSI/SPARC Three-Level Architecture (proposed in 1975) is a standard framework that organises a database system into three abstraction levels to achieve data independence and to isolate users from physical storage details.

The three levels are:

1. External Level (User View / User Schema):
   The topmost level. Each user or group of users sees only their own customised view of the database. Multiple external schemas can exist simultaneously. Can show derived data not physically stored (e.g., Age computed from Date of Birth).

2. Conceptual Level (Community View / Logical Schema):
   The middle level. Describes the logical structure of the entire database for the whole community of users — entities, attributes, relationships, constraints, and security rules. Acts as a bridge between user views and physical storage.

3. Internal Level (Storage View / Physical Schema):
   The lowest level — the core of the architecture. Describes how data is physically stored on storage media: record formats, field sizes, access paths (indexes, hashing), encryption, and compression.`,
  'Three-level architecture = External (user view) + Conceptual (logical/community view) + Internal (physical storage). Proposed by ANSI/SPARC 1975.'
);

insS.run(l3Id,
  'Differentiate between Logical Data Independence and Physical Data Independence.',
  `Data independence is the capacity to modify a schema at one level without affecting the schema at the next higher level.

1. Logical Data Independence:
   The ability to change the conceptual schema without requiring changes to existing external schemas or application programs.
   Example: Adding a new attribute (column) to a table, or splitting one table into two — existing user views and applications continue working unchanged.

2. Physical Data Independence:
   The ability to change the internal/physical schema without affecting the conceptual schema.
   Example: Changing the file indexing method from sequential to hashed storage, or migrating data to a different storage device — the logical structure remains unchanged.

Key Difference:
   Logical independence protects user views from logical schema changes.
   Physical independence protects the logical schema from storage-level changes.`,
  'Logical independence: conceptual changes do not affect external views. Physical independence: internal/storage changes do not affect conceptual schema.'
);

insS.run(l3Id,
  'What is Inter-Schema Mapping in the context of the three-level architecture?',
  `Inter-Schema Mapping refers to the transformation mechanisms used by the DBMS to convert data requests and results between different levels of the three-level architecture.

There are two types of mappings:

1. External/Conceptual Mapping:
   Transforms data between the external level (user views) and the conceptual level (logical schema). Allows each user view to be derived from the single conceptual schema. Handles differences in data format, naming, and structure between user views and the logical schema.

2. Conceptual/Internal Mapping:
   Transforms data between the conceptual level (logical schema) and the internal level (physical storage). Handles how logical entities and attributes correspond to stored records and files on disk.

Importance: Mappings are what enable data independence — when a schema at one level changes, only the mapping needs to be updated, not the schemas at other levels.`,
  'Two mappings: External/Conceptual (user view ↔ logical schema) and Conceptual/Internal (logical schema ↔ physical storage). Mappings enable data independence.'
);

insS.run(l3Id,
  'What is the difference between Schema Intension (Intention) and Schema Extension?',
  `In the context of a database schema:

Schema Intension (Intention / Schema Definition):
   The structural definition, rules, and constraints of the database.
   - Defined during the database design phase.
   - Permanent and rarely changes (only when the database design is modified).
   - Example: "The EMPLOYEE table has columns: EmpID (INT), Name (CHAR 25), Salary (NUMBER 8)."
   - Equivalent to: the blueprint or skeleton of the database.

Schema Extension (Occurrence / Database State):
   The actual data values populated in the database at any given moment in time.
   - Changes continuously as data is inserted, updated, or deleted.
   - Example: The current rows stored in the EMPLOYEE table right now.
   - Equivalent to: a snapshot of the database at a specific instant.

Analogy: Intension is the class definition; Extension is the set of all objects (instances) created from that class at runtime.`,
  'Intension = schema structure (permanent blueprint). Extension = actual data stored at a given moment (changes continuously).'
);

// ── Long Questions ────────────────────────────────────────────────────────────

insL.run(l3Id,
  'Explain the ANSI/SPARC Three-Level Schema Architecture in detail, describing the purpose and characteristics of each level.',
  `The ANSI/SPARC Three-Level Schema Architecture (1975) is the foundational standard for database system design. Its primary goal is to achieve data independence — shielding users from physical storage details and shielding the physical storage from logical restructuring.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 1 — EXTERNAL LEVEL (User View / User Schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• The topmost level — the only level users directly interact with.
• Each user or group sees only the subset of the database relevant to them.
• Multiple external schemas (views) can coexist simultaneously on the same database.
• Can display derived/computed data not physically stored (e.g., Age = Current Year − Birth Year).
• Provides security by hiding sensitive data from unauthorised users.
• Example: An HR officer sees employee salaries; a receptionist sees only names and phone numbers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 2 — CONCEPTUAL LEVEL (Community View / Logical Schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• The middle level — only ONE conceptual schema exists per database.
• Describes the complete logical structure of the entire database for all users as a community.
• Defines entities, their attributes, relationships between entities, integrity constraints, and security rules.
• Implementation-independent: does not specify physical storage details.
• Acts as the mediator between user views (external) and physical storage (internal).
• Example: The conceptual schema defines EMPLOYEE(EmpID, Name, Salary, DeptID) and DEPARTMENT(DeptID, DeptName) with a relationship FK(EmpID.DeptID → DEPARTMENT.DeptID).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 3 — INTERNAL LEVEL (Storage View / Physical Schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• The lowest level — the CORE of the database architecture.
• Only ONE internal schema exists per database.
• Describes how data is physically stored on disk storage:
  - Record formats and field sizes
  - Access paths (B-Tree indexes, hash indexes)
  - Data compression and encryption
  - File organisation (sequential, indexed sequential, hashed)
• Closest to the actual hardware and OS file system.
• Example: EMPLOYEE records stored as fixed-length records of 128 bytes, with a B-Tree index on EmpID and a hash index on DeptID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTER-SCHEMA MAPPINGS:
• External/Conceptual Mapping: Translates between user views and logical schema.
• Conceptual/Internal Mapping: Translates between logical schema and physical storage.

BENEFITS:
• Physical Data Independence: Internal changes do not affect the conceptual schema.
• Logical Data Independence: Conceptual changes do not affect external user views.
• Security: Users only see what they are authorised to see.`,
  'ANSI/SPARC: External (user views, many) → Conceptual (logical schema, one) → Internal (physical storage, one). Mappings between levels enable data independence.'
);

insL.run(l3Id,
  'Write a detailed note on Data Independence — its types, importance, and comparison with Traditional File Systems.',
  `DATA INDEPENDENCE is the ability to modify a database schema at one level of the three-level architecture without needing to modify schemas at the next higher level.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. WHY DATA INDEPENDENCE IS NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traditional File Processing Systems suffered from Program-Data Dependence:
• File structure was hardcoded into application programs.
• Any change in file format (adding a new field, changing a field size) required rewriting ALL programs using that file.
• This was expensive, time-consuming, and error-prone.

DBMS with Three-Level Architecture solves this via data independence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. PHYSICAL DATA INDEPENDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definition: The ability to change the internal/physical schema without affecting the conceptual schema or any external schemas.

What can change without impact:
• Switching from sequential file organisation to indexed file organisation.
• Changing the hashing algorithm for a key field.
• Adding or removing a disk index.
• Migrating data to a different storage device.

How it works: Only the Conceptual/Internal Mapping needs to be updated; the conceptual schema and all user views remain unchanged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. LOGICAL DATA INDEPENDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definition: The ability to change the conceptual schema without affecting existing external schemas or application programs.

What can change without impact:
• Adding new entities, attributes, or relationships to the conceptual schema.
• Splitting one table into two or merging two tables.
• Adding integrity constraints.

How it works: Only the External/Conceptual Mapping needs to be updated; user views continue working unchanged.

Note: Logical data independence is HARDER to achieve than physical data independence because user views are more tightly coupled to the logical schema.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. BENEFITS OF DATA INDEPENDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Reduced Maintenance Cost: Application programs do not need rewriting when storage or schema changes.
• Flexibility: Database administrators can optimize physical storage freely.
• Security: Users only see their authorised external view — internal storage details are hidden.
• Scalability: The database can grow and evolve without disrupting existing applications.`,
  'Data independence = change schema at one level without affecting the next. Physical: internal changes dont affect conceptual. Logical: conceptual changes dont affect external views.'
);

// ── Final Report ─────────────────────────────────────────────────────────────
console.log('\n=== CS403 LECTURES AFTER L3 SEED ===');
const lectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = 1 ORDER BY number`).all();
for (const l of lectures) {
  const qcount = db.prepare(`SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?`).get(l.id);
  const types  = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type ORDER BY type`).all(l.id);
  console.log(`L${l.number} (id=${l.id}): "${l.title}" — ${qcount.c} total`);
  types.forEach(t => console.log(`   ${t.type}: ${t.c}`));
}

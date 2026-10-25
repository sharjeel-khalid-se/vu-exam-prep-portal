import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// 1. Remove unwanted lectures for CS403
const toRemove = db.prepare(`
  SELECT id, number, title 
  FROM lectures 
  WHERE subject_id = 1 
    AND (title LIKE '%Entity-Relationship%' OR title LIKE '%Relational Data Model%')
`).all();

console.log('Lectures to remove:', toRemove);

for (const lec of toRemove) {
  db.prepare(`DELETE FROM progress WHERE question_id IN (SELECT id FROM questions WHERE lecture_id = ?)`).run(lec.id);
  const qDel = db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(lec.id);
  db.prepare(`DELETE FROM lectures WHERE id = ?`).run(lec.id);
  console.log(`Deleted lecture ${lec.id} ("${lec.title}") and ${qDel.changes} questions`);
}

// 2. Check if CS403 already has a Lecture 3
const existingL3 = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = 1 AND number = 3`).get();
let l3Id;

if (existingL3) {
  console.log('CS403 Lecture 3 already exists:', existingL3);
  l3Id = existingL3.id;
} else {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (1, 3, 'Three-Level Architecture (ANSI/SPARC) and Data Independence')
  `).run();
  l3Id = res.lastInsertRowid;
  console.log('Inserted CS403 Lecture 3 with id =', l3Id);

  const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insS = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
  const insL = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

  // 11 MCQs
  ins.run(l3Id, 'mcq',
    'Which one of the following is NOT a part of the three-level architecture?',
    JSON.stringify({ a: 'External level', b: 'Conceptual level', c: 'Internal level', d: 'Physical level' }),
    'd',
    'The ANSI/SPARC three-level architecture comprises External, Conceptual, and Internal levels. "Physical level" is not a standard name in this architecture (Internal level handles physical storage).',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Making a change to the conceptual schema of a database but not affecting the existing external schemas is an example of ______.',
    JSON.stringify({ a: 'Physical data independence', b: 'Concurrency control', c: 'Logical data independence', d: 'Functional dependency' }),
    'c',
    'Logical data independence is the ability to modify the conceptual schema without having to change external schemas or existing application programs.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'The three levels architecture is useful for ______.',
    JSON.stringify({ a: 'Arranging the data in an organized manner', b: 'Hiding the details of internal systems', c: 'Breaking the data access restriction', d: 'Storing definitions of the structures' }),
    'b',
    'The primary goal of the three-level architecture is to provide data independence and hide physical storage and internal implementation details from end users.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Which of the following provides us data independence?',
    JSON.stringify({ a: '3-Level Architecture', b: 'File Processing System', c: 'Context DFD', d: 'Relational Algebra' }),
    'a',
    'The ANSI/SPARC 3-Level Architecture is specifically designed to achieve data independence by separating user views from physical storage.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Three level schema Architecture allows us to separate the physical representation of data from the ______.',
    JSON.stringify({ a: 'System view', b: 'User view', c: 'Application view', d: 'Logical view' }),
    'b',
    'The architecture separates the user view (external level) from the physical representation of data (internal level), with the conceptual level acting as the intermediate layer.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Select the correct statement about the ANSI/SPARC architecture.',
    JSON.stringify({
      a: 'The conceptual level is a level of indication between the internal level and the external level.',
      b: 'The internal level in a database system will definitely be relational.',
      c: 'Any given database has many conceptual schemas and one physical schema, but it has only one external schema.',
      d: 'The external level is not concerned with individual user perceptions, while the conceptual level is concerned with a community user perception.'
    }),
    'a',
    'The conceptual level sits between external (user view) and internal (storage) levels — it is the community-wide logical view bridging both.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'In three level architecture of the database, which level is helpful to display data which is not actually placed in the database?',
    JSON.stringify({ a: 'External Level', b: 'Conceptual Level', c: 'Internal Level', d: 'Physical Level' }),
    'a',
    'The External Level (user views) can present virtual, derived, or computed data (such as calculating age from date of birth) that is not physically stored.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'In a three level DBMS architecture, the ______ level interacts directly with the users.',
    JSON.stringify({ a: 'External', b: 'Conceptual', c: 'Internal', d: 'Physical' }),
    'a',
    'The External level directly interacts with users, providing tailored views suitable for distinct groups of end users.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Core of the Database Architecture is ______.',
    JSON.stringify({ a: 'Internal level', b: 'External level', c: 'Conceptual level', d: 'ANSI SPARK' }),
    'a',
    'According to CS403 handouts, the core of the database architecture is the internal level of schema, which defines how data is physically stored and accessed.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'Which of the following is CORRECT about Three Level Schema Architecture?',
    JSON.stringify({
      a: 'External level presents data to the user',
      b: 'Internal level in a database system will definitely be relational',
      c: 'External Level cannot contain user views',
      d: 'Conceptual Level is core of the architecture'
    }),
    'a',
    'The External level is responsible for presenting data to users according to their specific perspectives and permissions.',
    1, 1, 'lecture'
  );

  ins.run(l3Id, 'mcq',
    'In three level architecture of the database, which level is responsible for storage of data on some storage media?',
    JSON.stringify({ a: 'External view', b: 'Conceptual view', c: 'Internal/Physical view', d: 'User view' }),
    'c',
    'The Internal (Physical) view describes the physical storage structures, access paths, record layouts, and media allocation.',
    1, 1, 'lecture'
  );

  // 4 Short Questions
  insS.run(l3Id,
    'Define ANSI/SPARC Three-Level Architecture.',
    `Proposed by ANSI/SPARC in 1975, it is a standard 3-level database architecture that isolates the physical database from user application views to provide data independence.

The three levels are:
1. External Level (User View):
   The highest level where individual users or user groups interact with customized views of the database. Multiple external schemas can exist simultaneously.
2. Conceptual Level (Community/Logical View):
   The middle level representing the entire logical structure of the database for the entire organization (entities, relationships, constraints, and security).
3. Internal Level (Storage/Physical View):
   The lowest level (core of the architecture) describing how data is physically stored on disk storage, including record layouts, field sizes, access paths, indexes, and encryption.`,
    'Three levels: External (user view), Conceptual (community logical view), and Internal (physical storage view).'
  );

  insS.run(l3Id,
    'Differentiate between Logical Data Independence and Physical Data Independence.',
    `Data independence is the ability to change the schema at one level of the database system without having to change the schema at the next higher level.

1. Logical Data Independence:
   • The capacity to change the conceptual schema without affecting external schemas or existing application programs.
   • Example: Adding a new attribute or table, or modifying relationships without rewriting existing user queries or application code.

2. Physical Data Independence:
   • The capacity to change the internal/physical schema without affecting the conceptual schema.
   • Example: Changing file storage structures, reorganizing indexes, switching from B-trees to hashing, or moving database files across storage devices without modifying the logical schema.

Key Contrast: Physical data independence is much easier to achieve than logical data independence because logical schemas directly determine the semantics of user applications.`,
    'Logical independence protects user views from conceptual changes; Physical independence protects conceptual schema from storage changes.'
  );

  insS.run(l3Id,
    'What is Inter-Schema Mapping?',
    `Inter-Schema Mapping is the transformation mechanism used by the DBMS to translate requests and responses between different levels of the three-level database architecture.

Two main types of mappings exist:
1. External/Conceptual Mapping:
   Connects specific user views (external level) to the community logical schema (conceptual level). Enables user-specific presentation (e.g., date formats or derived attributes) to be generated from underlying tables.
2. Conceptual/Internal Mapping:
   Connects the logical schema (conceptual level) to physical storage structures (internal level). Translates logical records and entities into physical records, blocks, and disk addresses.

Significance: When changes occur at any level, only the corresponding mapping needs to be revised, keeping other levels completely insulated and independent.`,
    'Mappings translate requests between External ↔ Conceptual and Conceptual ↔ Internal levels, enabling data independence.'
  );

  insS.run(l3Id,
    'What is the difference between Schema Intention and Schema Extension?',
    `In database terminology:

1. Schema Intention (Intension / Schema):
   • The structural definition, metadata, constraints, and rules of the database.
   • Defined during the database design phase.
   • Permanent in nature and rarely changes over time.
   • Analogy: The blueprint or class definition.

2. Schema Extension (Occurrence / Database State):
   • The actual data records and values populated in the database at any given point in time.
   • Changes continuously with every INSERT, UPDATE, and DELETE operation.
   • Analogy: The runtime objects or state snapshot of the database.`,
    'Intension = permanent structural blueprint; Extension = dynamic data snapshot at a given moment.'
  );

  // 2 Long Questions
  insL.run(l3Id,
    'Explain the ANSI/SPARC Three-Level Schema Architecture in detail.',
    `The ANSI/SPARC Three-Level Schema Architecture was formulated in 1975 to provide a standardized approach for separating user applications from physical data storage, thereby achieving data independence, security, and simplified maintenance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EXTERNAL LEVEL (User Views)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Highest level of abstraction; the only level that regular end users and application programs directly interface with.
• Multiple external schemas (user views) can exist for a single database.
• Customizes data presentation for different user groups according to business roles and access authorization.
• Can display derived/computed data (e.g., age computed dynamically from Date of Birth) that is not physically stored.
• Enhances data security by hiding sensitive columns (e.g., salary, passwords) from unauthorized users.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. CONCEPTUAL LEVEL (Community / Logical View)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• The intermediate level of abstraction representing the entire organization's data requirements.
• Exactly ONE conceptual schema exists per database.
• Details all entity types, attributes, relationships, business rules, and integrity constraints.
• Independent of both physical storage techniques and particular user interface requirements.
• Serves as the central reference point between external views and internal physical storage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. INTERNAL LEVEL (Storage View / Physical Schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Lowest level of abstraction; regarded as the core of the database architecture.
• Exactly ONE internal schema exists per database.
• Specifies physical storage details: record layouts, byte offsets, data compression, encryption techniques, file organization (sequential, indexed, hashed), and B-Tree indexes.
• Interacts directly with the operating system file system to store and retrieve binary blocks from physical media.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTER-SCHEMA MAPPINGS & DATA INDEPENDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• External-to-Conceptual Mapping translates user queries into conceptual queries.
• Conceptual-to-Internal Mapping translates conceptual queries into physical storage accesses.
• This architecture provides Logical Data Independence (conceptual changes do not affect user views) and Physical Data Independence (storage changes do not affect conceptual schemas).`,
    'ANSI/SPARC separates External (views), Conceptual (logical rules), and Internal (physical storage) to ensure security and data independence.'
  );

  insL.run(l3Id,
    'Write a detailed note on Data Independence, its types, importance, and comparison with Traditional File Systems.',
    `Data Independence is the ability to modify the definition of a database at one level of schema architecture without affecting the schemas at higher levels.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LIMITATIONS OF TRADITIONAL FILE SYSTEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In traditional file processing systems:
• Programs and file structures were tightly coupled (Program-Data Dependence).
• Any change in record layout (e.g., expanding phone number field from 10 to 15 characters) required modifying, recompiling, and testing every program accessing that file.
• This led to high maintenance costs, frequent bugs, and severe inflexibility.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. TYPES OF DATA INDEPENDENCE IN DBMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The 3-level ANSI/SPARC architecture guarantees two distinct types of data independence:

A. Physical Data Independence:
• Capacity to alter the internal/physical schema without altering the conceptual schema or external views.
• Modifications allowed: changing storage devices, reorganizing physical files, adding/dropping indexes, switching hashing algorithms.
• Mechanism: Only Conceptual/Internal mapping is updated; application code is unaffected.
• Ease of Achievement: Relatively easy to achieve because application logic does not depend on disk layout.

B. Logical Data Independence:
• Capacity to alter the conceptual schema without altering existing external schemas or application programs.
• Modifications allowed: adding new entity sets, adding new non-mandatory attributes, decomposing or merging tables.
• Mechanism: Only External/Conceptual mapping is updated; existing user views continue functioning seamlessly.
• Ease of Achievement: Harder to achieve because changing data semantics often requires adapting business logic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. PRACTICAL IMPORTANCE AND BENEFITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cost Reduction: Eliminates massive re-engineering and recompilation of application software during database evolution.
• Performance Tuning: Database Administrators (DBAs) can optimize storage, partitioning, and indexing without breaking existing applications.
• Security & Privacy: Different views allow restricting unauthorized users from viewing confidential data without changing physical tables.
• System Longevity: Enables modern enterprise databases to grow and scale gracefully over decades.`,
    'Data independence eliminates program-data dependence, allowing physical tuning and logical evolution without breaking user applications.'
  );
}

// Print updated list of CS403 lectures
const finalLectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = 1 ORDER BY number`).all();
console.log('\nFinal CS403 Lectures:');
for (const l of finalLectures) {
  const qc = db.prepare(`SELECT COUNT(*) as count FROM questions WHERE lecture_id = ?`).get(l.id).count;
  console.log(`  L${l.number} (id=${l.id}): "${l.title}" — ${qc} questions`);
}

import { getDb } from './db';

export function seedCS403Lecture1() {
  const db = getDb();
  const existing = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403'`).get();
  if (existing) return;

  const subjectResult = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'Database Management',
    'cs403',
    'CS403',
    'Fundamentals of Database Management Systems Ã¢â‚¬â€ Virtual University'
  );
  const subjectId = subjectResult.lastInsertRowid;

  const lectureResult = db.prepare(`
    INSERT INTO lectures (subject_id, number, title) VALUES (?, ?, ?)
  `).run(subjectId, 1, 'Introduction to Databases');
  const lectureId = lectureResult.lastInsertRowid;

  const mcqs = [
    {
      stem: 'Collection of raw facts is called ______.',
      options: JSON.stringify({ a: 'Information', b: 'Object', c: 'Output', d: 'Data' }),
      correct: 'd',
      explanation: 'Data is defined as an unorganized collection of raw, unprocessed facts and figures.',
      urdu_answer: null,
    },
    {
      stem: 'Data is also referred to as ______.',
      options: JSON.stringify({ a: 'Processed facts', b: 'Organized facts', c: 'Raw facts', d: 'Information' }),
      correct: 'c',
      explanation: 'Data consists of raw, isolated facts that have not yet undergone systematic processing.',
      urdu_answer: null,
    },
    {
      stem: 'A collection of logically related data is called a ______.',
      options: JSON.stringify({ a: 'Logical model', b: 'Database', c: 'Data model', d: 'Relational model' }),
      correct: 'b',
      explanation: 'A database is a structured collection of logically related and shared persistent data.',
      urdu_answer: null,
    },
    {
      stem: 'A software package designed to store, manage, and retrieve data is called ______.',
      options: JSON.stringify({ a: 'Database', b: 'DBMS', c: 'Data repository', d: 'Operating System' }),
      correct: 'b',
      explanation: 'DBMS (Database Management System) is the software suite used to define, construct, and manipulate databases.',
      urdu_answer: null,
    },
    {
      stem: 'A "Database System" is formally the combination of ______.',
      options: JSON.stringify({
        a: 'Database and DBMS',
        b: 'Database and Data',
        c: 'Data and Information',
        d: 'Operating System and Database',
      }),
      correct: 'a',
      explanation: 'A Database System comprises both the Database (data storage) and the DBMS (software interface).',
      urdu_answer: null,
    },
    {
      stem: 'Which of the following was the direct replacement of the manual file system?',
      options: JSON.stringify({
        a: 'Database system',
        b: 'File processing system',
        c: 'Operating system',
        d: 'Network file system',
      }),
      correct: 'b',
      explanation: 'The Computerized File Processing System directly automated manual filing prior to DBMS inception.',
      urdu_answer: null,
    },
    {
      stem: 'Which of the following is considered an advantage of Traditional File Organization?',
      options: JSON.stringify({ a: 'Time consuming', b: 'High data security', c: 'Simplicity', d: 'Data independence' }),
      correct: 'c',
      explanation: 'Simplicity and straightforward sequential access was the principal advantage of traditional file organization.',
      urdu_answer: null,
    },
    {
      stem: 'Controlling redundancy in a database management system does NOT directly help to ______.',
      options: JSON.stringify({
        a: 'Avoid data duplication',
        b: 'Avoid unnecessary wastage of storage space',
        c: 'Avoid unauthorized access to data',
        d: 'Avoid data inconsistency',
      }),
      correct: 'c',
      explanation: 'Controlling redundancy eliminates duplication and inconsistency, but access control and authorization is handled by the security subsystem.',
      urdu_answer: null,
    },
    {
      stem: 'A major benefit of data sharing in a database system is that ______.',
      options: JSON.stringify({
        a: 'Data of same applications is placed at same place',
        b: 'Data of different applications can be centralized and accessed concurrently',
        c: 'Data is strictly duplicated across each department',
        d: 'None of the above',
      }),
      correct: 'b',
      explanation: 'Data sharing enables diverse applications and users to access a shared pool of centralized, consistent data.',
      urdu_answer: null,
    },
  ];

  const insertMcq = db.prepare(`
    INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
    VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'lecture')
  `);
  for (const q of mcqs) {
    insertMcq.run(lectureId, q.stem, q.options, q.correct, q.explanation, q.urdu_answer);
  }

  const shorts = [
    {
      stem: 'What is the distinction between Data and Information?',
      correct: `Data:
Ã¢â‚¬Â¢ Unprocessed, raw facts, figures, and symbols.
Ã¢â‚¬Â¢ Does not convey specific contextual meaning on its own.
Ã¢â‚¬Â¢ Example: The number "98.6" without labels or units.

Information:
Ã¢â‚¬Â¢ Processed, structured, and organized data presented in a meaningful context.
Ã¢â‚¬Â¢ Enables informed interpretation and decision-making.
Ã¢â‚¬Â¢ Example: "Patient body temperature: 98.6Ã‚Â°F (Normal)".`,
      explanation: 'Data is the raw input, while Information is the processed, meaningful output.',
      urdu_answer: null,
    },
    {
      stem: 'Explain the difference between a Database and a DBMS.',
      correct: `Database:
Ã¢â‚¬Â¢ A collection of logically related and systematically organized persistent data.
Ã¢â‚¬Â¢ Serves as the repository where entities, attributes, and relationships are recorded.

DBMS (Database Management System):
Ã¢â‚¬Â¢ The software suite that enables users to create, maintain, query, and administer the database.
Ã¢â‚¬Â¢ Provides data protection, concurrency control, and transactional integrity.

Together, the Database and the DBMS constitute a complete Database System.`,
      explanation: 'Database is the storage structure; DBMS is the management software.',
      urdu_answer: null,
    },
    {
      stem: 'What are the major drawbacks of the Traditional File Processing System?',
      correct: `1. Program-Data Dependence:
Ã¢â‚¬Â¢ Physical file structure is hardcoded into application code. Modifying the file format requires rewriting all associated programs.

2. Data Redundancy and Inconsistency:
Ã¢â‚¬Â¢ Separate applications maintain isolated copies of identical data, wasting storage and causing conflicting information upon updates.

3. Lack of Data Sharing & Poor Security:
Ã¢â‚¬Â¢ Each department operates in silos without unified access controls or multi-user synchronization.`,
      explanation: 'Traditional file processing suffered from tight coupling between applications and file structures.',
      urdu_answer: null,
    },
    {
      stem: 'State the two core functions performed by a DBMS.',
      correct: `1. Data Management:
Ã¢â‚¬Â¢ Efficiently storing, organizing, querying, updating, and indexing structured data while maintaining physical and logical integrity.

2. Access & Security Management:
Ã¢â‚¬Â¢ Authenticating users, enforcing granular authorization policies, and providing concurrent multi-user transactional isolation.`,
      explanation: 'A DBMS oversees both internal data operations and external user permissions.',
      urdu_answer: null,
    },
  ];

  const insertShort = db.prepare(`
    INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
    VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
  `);
  for (const q of shorts) {
    insertShort.run(lectureId, q.stem, q.correct, q.explanation, q.urdu_answer);
  }

  console.log('Ã¢Å“â€¦ CS403 Lecture 1 seeded with English questions');
}

export function seedCS403Exam() {
  const db = getDb();
  const examSeeded = db.prepare(`SELECT id FROM questions WHERE type = 'long' LIMIT 1`).get();
  if (examSeeded) return;

  const lecture = db.prepare(`
    SELECT l.id FROM lectures l
    JOIN subjects s ON s.id = l.subject_id
    WHERE s.slug = 'cs403' AND l.number = 1
  `).get() as { id: number } | undefined;
  if (!lecture) return;

  const longs = [
    {
      stem: 'Discuss the concept of a Database System in detail. Describe its principal components and key advantages over Traditional File Processing.',
      correct: `A Database System is a computerized record-keeping environment designed to store, manage, and facilitate structured access to organizational data.

Principal Components:
1. Database:
   Ã¢â‚¬Â¢ The persistent collection of interrelated data items stored on secondary storage.
2. DBMS Software:
   Ã¢â‚¬Â¢ The software interface managing data retrieval, updating, schema enforcement, and transaction management.
3. Hardware:
   Ã¢â‚¬Â¢ Primary and secondary storage systems, processors, and network interfaces.
4. Users and Administrators:
   Ã¢â‚¬Â¢ End users, application developers, and Database Administrators (DBAs).

Key Advantages over Traditional File Systems:
Ã¢â‚¬Â¢ Controlled Redundancy: Centralized storage prevents duplicated records.
Ã¢â‚¬Â¢ Data Consistency: Single-point updates prevent conflicting values across systems.
Ã¢â‚¬Â¢ Program-Data Independence: Database schemas can evolve without breaking application programs.
Ã¢â‚¬Â¢ Multi-User Concurrency: ACID transactions prevent race conditions during simultaneous access.
Ã¢â‚¬Â¢ Robust Security: Role-based authorization shields sensitive tables and fields.
Ã¢â‚¬Â¢ Automated Backup & Disaster Recovery: Transaction logs enable rollbacks and state restoration.`,
      explanation: 'A complete Database System bridges persistent storage with secure, standardized software services.',
      urdu_answer: null,
    },
    {
      stem: 'Define Data Redundancy and Data Inconsistency. Illustrate with practical examples how modern DBMS controls these issues.',
      correct: `Definitions:
1. Data Redundancy:
   Ã¢â‚¬Â¢ The unnecessary duplication of identical data items across multiple files or tables.
   Ã¢â‚¬Â¢ Example: Storing a student's permanent residential address in both the Accounts Office and Hostel Administration independently.

2. Data Inconsistency:
   Ã¢â‚¬Â¢ Occurs when conflicting versions of the same real-world fact exist simultaneously due to uncoordinated modifications.
   Ã¢â‚¬Â¢ Example: The student updates their address in Accounts, but Hostel records continue showing the outdated address.

How DBMS Controls Redundancy & Inconsistency:
Ã¢â‚¬Â¢ Centralized Shared Architecture:
  All authorized subsystems query a single unified relational model rather than discrete flat files.
Ã¢â‚¬Â¢ Normalization (1NF through BCNF):
  Relational design decomposing complex tables to guarantee that each non-key attribute depends strictly on the primary key.
Ã¢â‚¬Â¢ Foreign Key Constraints:
  Referential integrity rules ensure child tables synchronize automatically with parent records on update or delete cascades.
Ã¢â‚¬Â¢ Controlled Redundancy:
  When intentional redundancy is needed for performance (e.g., denormalization or materialized views), the DBMS manages synchronization internally.`,
      explanation: 'Redundancy leads directly to inconsistency; DBMS controls both via centralization and integrity constraints.',
      urdu_answer: null,
    },
    {
      stem: 'Analyze the role, administrative duties, and organizational significance of a Database Administrator (DBA).',
      correct: `The Database Administrator (DBA) is the technical authority entrusted with the overall design, configuration, optimization, and security of the enterprise database infrastructure.

Core Duties of a DBA:
1. Schema Definition & Physical Design:
   Ã¢â‚¬Â¢ Formulating the conceptual schema, tablespaces, indexing strategies, and physical partitioning.
2. User Access & Security Provisioning:
   Ã¢â‚¬Â¢ Defining access privilege hierarchies, authentication mechanisms, and compliance with data governance standards.
3. Performance Monitoring & Query Optimization:
   Ã¢â‚¬Â¢ Analyzing execution plans, buffer pool allocations, and adjusting indexes to mitigate latency bottlenecks.
4. Backup & Disaster Recovery Orchestration:
   Ã¢â‚¬Â¢ Implementing full, differential, and transaction log backup schedules, and rehearsing disaster recovery failovers.
5. Integrity Constraint Verification:
   Ã¢â‚¬Â¢ Enforcing primary, foreign key, check, and trigger constraints to guarantee data accuracy.

Organizational Significance:
Ã¢â‚¬Â¢ Protects high-value corporate data assets from corruption, loss, and unauthorized intrusion.
Ã¢â‚¬Â¢ Guarantees continuous system availability, high throughput, and seamless scalability under concurrent user workloads.`,
      explanation: 'The DBA serves as the vital guardian ensuring security, performance, and integrity across the database lifecycle.',
      urdu_answer: null,
    },
  ];

  const insertLong = db.prepare(`
    INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
    VALUES (?, 'long', ?, ?, ?, ?, 5, 4, 'midterm')
  `);
  for (const q of longs) {
    insertLong.run(lecture.id, q.stem, q.correct, q.explanation, q.urdu_answer);
  }

  console.log('Ã¢Å“â€¦ CS403 exam questions seeded in English (long questions)');
}

export function seedAllCourses() {
  seedCS403Lecture1();
  seedCS403Exam();

  const db = getDb();

  // 1. CS403 lectures are seeded lecture-by-lecture below

  // CS403P: Database Management Systems Practical
  let cs403p = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403p'`).get() as { id: number } | undefined;
  if (!cs403p) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `).run(
      'Database Management Systems Practical',
      'cs403p',
      'CS403P',
      'Hands-on lab exercises, schema creation, SQL query design, relational constraints, and database application programming — Virtual University'
    );
    cs403p = { id: Number(res.lastInsertRowid) };
  }

  // CS304P: Object Oriented Programming (Practical)
  let cs304p = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs304p'`).get() as { id: number } | undefined;
  if (!cs304p) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `).run(
      'Object Oriented Programming (Practical)',
      'cs304p',
      'CS304P',
      'Hands-on C++ programming, classes, objects, inheritance, polymorphism, encapsulation, memory management, and OOP software development — Virtual University'
    );
    cs304p = { id: Number(res.lastInsertRowid) };
  }

  // 2. CS504: Software Engineering - I
  let cs504 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs504'`).get() as { id: number } | undefined;
  if (!cs504) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES ('Software Engineering - I', 'cs504', 'CS504', 'Systematic principles, methodologies, and architectures for robust software lifecycle engineering — Virtual University')
    `).run();
    cs504 = { id: Number(res.lastInsertRowid) };
  }

  const cs504L1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L1) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 1, 'Introduction to Software Engineering, Software Crisis & Principles')`).run(cs504.id);
    const lId = lRes.lastInsertRowid;

    const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 10 MCQs
    ins.run(lId, 'mcq',
      'Software crisis appeared in ______ and its primary underlying cause was ______.',
      JSON.stringify({
        a: 'Early 60s, Software development technique',
        b: 'Early 50s, Hardware failures',
        c: 'Early 70s, Microprocessor limitations',
        d: 'Early 80s, Network bandwidth bottlenecks'
      }),
      'a',
      'According to CS504 handouts (page 4), the software crisis emerged in the early 1960s primarily because informal, ad-hoc software development techniques were inadequate for building large, complex systems.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'What is meant by the term "software crisis"?',
      JSON.stringify({
        a: 'Ability to deliver software on time with good quality',
        b: 'A situation in which experienced developers leave the company',
        c: 'Inability of new software to inter-operate with existing software',
        d: 'A situation in which large scale software projects took more time and budget than was planned'
      }),
      'd',
      'The Software Crisis describes the historical period where software projects regularly ran over budget, exceeded schedules, contained critical bugs, and failed to meet user requirements.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      '“The application of a systematic, disciplined, quantifiable approach to the development, operation, and maintenance of software” is the official IEEE definition of:',
      JSON.stringify({
        a: 'Computer Science',
        b: 'Engineering',
        c: 'Software Engineering',
        d: 'Requirements Engineering'
      }),
      'c',
      'IEEE 610.12 formally defines Software Engineering as the application of a systematic, disciplined, quantifiable approach to development, operation, and maintenance of software.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which of the following statements is NOT according to software engineering principles? Software engineering is a(n) ______.',
      JSON.stringify({
        a: 'Balancing act',
        b: 'Disciplined approach',
        c: 'Unsystematic approach',
        d: 'Quantifiable approach'
      }),
      'c',
      'Software engineering strictly rejects unsystematic and ad-hoc practices. It enforces systematic, disciplined, and quantifiable engineering methodologies.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Software engineering is a ______ approach.',
      JSON.stringify({
        a: 'Systematic',
        b: 'Disciplined',
        c: 'Scheduled',
        d: 'All of the given options'
      }),
      'd',
      'Software engineering encompasses systematic processes, disciplined workflows, and organized schedules.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'After reaching a reasonable level of quality, we do not try to improve the quality of software any further. This principle is governed by the:',
      JSON.stringify({
        a: 'Balance law',
        b: 'Saturated law',
        c: 'Law of diminishing returns',
        d: 'None of the given options'
      }),
      'c',
      'The Law of Diminishing Returns dictates that beyond a certain point, the cost and effort of hunting down remaining marginal defects vastly exceeds the incremental value gained.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'More powerful hardware historically resulted in the development of ______ powerful and ______ software.',
      JSON.stringify({
        a: 'less, simple',
        b: 'more, complex',
        c: 'less, complex',
        d: 'more, simple'
      }),
      'b',
      'As hardware computational power and capacity surged, user expectations increased, driving the development of far more powerful and correspondingly more complex software systems.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'The process of productive use of scientific knowledge to build practical solutions is called:',
      JSON.stringify({
        a: 'Software engineering',
        b: 'Requirements engineering',
        c: 'Engineering',
        d: 'Science'
      }),
      'c',
      'Science discovers fundamental principles and laws; Engineering is the systematic and productive application of that scientific knowledge to solve practical human problems.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Software deteriorates rather than wears out because ______.',
      JSON.stringify({
        a: 'Software suffers from exposure to hostile physical environments',
        b: 'Defects are more likely to arise after software has been used often',
        c: 'Multiple change requests introduce errors in component interactions',
        d: 'Software spare parts become harder to order'
      }),
      'c',
      'Unlike hardware, software does not suffer physical friction or environmental wear. It deteriorates logically when continuous patches, bug fixes, and feature changes introduce subtle regression defects across components.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Software Engineering is fundamentally the combination of tools, techniques, and ______.',
      JSON.stringify({
        a: 'Testing',
        b: 'Processes',
        c: 'Maintenance',
        d: 'Design'
      }),
      'b',
      'Software engineering rests on a three-pillared foundation: Tools (automated assistance), Techniques/Methods (how-to practices), and Processes (cohesive management framework).',
      1, 1, 'lecture'
    );

    // 2 Short Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Explain how Software Engineering is a "Balancing Act" (Law of Balancing Act).',
      `Software engineering is characterized as a "Balancing Act" because software engineers must constantly evaluate and manage trade-offs among conflicting demands and resource limitations:

1. Cost vs. Quality:
   Achieving near-zero defect quality demands exhaustive formal verification and testing, which dramatically escalates project costs.
2. Time-to-Market vs. Feature Completeness:
   Releasing software promptly to capitalize on market opportunities often requires deferring non-essential features or accepting managed technical debt.
3. Performance vs. Maintainability:
   Over-optimizing code for raw execution speed frequently compromises modularity, readability, and future maintainability.
4. Security vs. Usability:
   Enforcing overly restrictive security layers can impede user convenience and system accessibility.

Key Takeaway: The goal of software engineering is not to achieve academic perfection in a single attribute, but to produce an optimal balance across all project dimensions within the customer's budget and schedule.`,
      'SE is a balancing act because engineers must continually balance conflicting constraints: cost, schedule, quality, performance, and functionality.'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'How does software differ from the artifacts produced by other traditional engineering disciplines?',
      `Software exhibits unique characteristics that distinguish it fundamentally from physical engineering products (e.g., civil bridges, mechanical engines):

1. Software is Developed/Engineered, Not Manufactured:
   Traditional engineering involves costly physical assembly lines and raw materials. In software, once the initial copy is created, manufacturing duplicates is instantaneous with virtually zero marginal cost.

2. Software Does Not "Wear Out":
   Physical artifacts follow the classic "bathtub curve," wearing out due to friction, temperature, and environmental fatigue. Software deteriorates logically rather than physically, primarily when ongoing changes and patches degrade its architectural integrity.

3. Software is Intangible and Highly Flexible:
   Lacking physical dimensions or weight, software can be modified easily at any stage. However, this intangibility makes progress measurement, defect visualization, and complexity tracking significantly harder.

4. Custom-Built Nature:
   Most software systems are custom-crafted to bespoke specifications rather than assembled entirely from standardized, off-the-shelf catalog parts.`,
      'Software is engineered not manufactured, does not physically wear out, is intangible/malleable, and is mostly custom-built.'
    );

    // 1 Long Question
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'An economic example states: "After eating X amount of food, your satisfaction of additional food diminishes. Every additional unit of fertilizer generates a diminishing increase in crop yield." Which Law of Economics does this illustrate? Discuss how this law applies to Software Engineering.',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. IDENTIFICATION OF THE ECONOMIC PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The described scenarios illustrate the fundamental economic principle known as the:
LAW OF DIMINISHING RETURNS (or Law of Diminishing Marginal Utility / Productivity).

Statement of the Law:
In any productive system, as you continue to increase one variable input (e.g., fertilizer, testing hours) while holding other inputs constant, the marginal output (incremental benefit gained per unit of input) eventually decreases.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. APPLICATION TO SOFTWARE ENGINEERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In software engineering, the Law of Diminishing Returns applies prominently to Quality Assurance, Testing, Optimization, and Requirement Gathering:

A. Testing and Defect Detection:
• Initial Phase: Early unit and integration tests uncover a large percentage of severe, obvious bugs with relatively low effort. The return on investment (ROI) is extremely high.
• Diminishing Returns Phase: As defect density drops, discovering the remaining obscure, edge-case bugs requires disproportionately large amounts of time, automated test matrices, and specialized test harnesses.
• The Perfection Trap: Eliminating 100% of all potential defects would require infinite time and budget, which is commercially and practically unviable.

B. Code Performance Optimization:
• Achieving the first 80% performance improvement is usually straightforward (e.g., algorithmic improvements, indexing).
• Squeezing out the final 1-2% speedup requires complex micro-optimizations that drastically reduce code maintainability and increase development costs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. PRACTICAL SIGNIFICANCE IN SOFTWARE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "Good Enough" Quality Standard:
  Software engineers apply the Law of Diminishing Returns to determine the "stopping point" for testing. Once the product meets predefined acceptance criteria and reliability thresholds, additional testing is halted.
• Resource Allocation:
  It guides project managers to redirect precious engineering hours toward high-value unmet requirements rather than chasing micro-optimizations with negligible user benefits.`,
      'The Law of Diminishing Returns states that marginal gains decrease as inputs increase; in SE, it dictates that pursuing 100% bug-free perfection is economically unfeasible, so teams stop at "good enough" quality.'
    );
  }

  // CS504 — Lecture 2: Software Engineering Framework, Development Loop & Phases
  const cs504L2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L2) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 2, 'Software Engineering Framework, Development Loop & Phases')`).run(cs504.id);
    const lId = lRes.lastInsertRowid;

    const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 6 MCQs
    ins.run(lId, 'mcq',
      'Which of the items listed below is NOT one of the software engineering layers in the software engineering framework?',
      JSON.stringify({
        a: 'Tools',
        b: 'Process',
        c: 'Manufacturing',
        d: 'Methods'
      }),
      'c',
      'The four foundational layers of the Software Engineering Framework are: Quality Focus, Process, Methods, and Tools. "Manufacturing" is not a layer because software is developed, not manufactured.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which component of the software engineering framework provides different technical methods and techniques that can be used to perform a particular development task?',
      JSON.stringify({
        a: 'Processes',
        b: 'Tools',
        c: 'Methods',
        d: 'Quality Focus'
      }),
      'c',
      'Methods provide the technical "how-to\'s" and techniques for building software (e.g., requirements analysis, design modeling, program construction, testing).',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which component of the software engineering framework provides automated or semi-automated support in software development?',
      JSON.stringify({
        a: 'Processes',
        b: 'Methods',
        c: 'Quality Focus',
        d: 'Tools'
      }),
      'd',
      'Tools (such as CASE tools, IDEs, code analyzers, and automated test runners) provide automated or semi-automated support for processes and methods.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'At which stage of the software development loop are operational results delivered and used?',
      JSON.stringify({
        a: 'Problem definition',
        b: 'Solution integration',
        c: 'Technical development',
        d: 'Status quo'
      }),
      'd',
      'In the Software Development Loop, the "Status Quo" represents the current operational state where actual results are delivered and business operations occur.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'If a problem or defect is identified and fixed at a ______ stage in the software development process, it will cost much more than if it was fixed at an ______ stage.',
      JSON.stringify({
        a: 'earlier & later',
        b: 'after & before',
        c: 'later and earlier',
        d: 'none of the above'
      }),
      'c',
      'The cost of fixing a software defect escalates exponentially as the software progresses. Fixing a bug at a later stage (e.g., maintenance) costs up to 100x more than at an earlier stage (requirements/design).',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Once software requirements have been finalized, the ______ process begins.',
      JSON.stringify({
        a: 'Construction',
        b: 'Development',
        c: 'Maintenance phase',
        d: 'Construction and Development'
      }),
      'a',
      'Once requirements are documented and approved, the Construction process starts, focusing on architectural design, detailed design, coding, and unit testing.',
      1, 1, 'lecture'
    );

    // 3 Short Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Enlist and briefly explain the four layers/components of the Software Engineering Framework.',
      `The Software Engineering Framework consists of four interconnected technological layers:

1. Quality Focus:
   The foundational bedrock of any engineering discipline. Software engineering must rest on an organizational commitment to continuous quality management and improvement.

2. Process:
   The glue that holds the technological layers together. It defines the sequence of development activities, milestones, deliverables, quality assurance gates, and management controls across the project lifecycle.

3. Methods:
   Provide the technical "how-to's" and disciplined techniques for constructing software (e.g., requirements elicitation, architectural design, coding standards, and testing).

4. Tools:
   Provide automated or semi-automated support for processes and methods (e.g., CASE tools, IDEs, version control systems, and automated test frameworks).`,
      'The four layers are: Quality Focus (bedrock), Process (framework glue), Methods (technical how-to), and Tools (automated support).'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Enlist and explain the four stages of the Software Development Loop.',
      `The Software Development Loop represents software evolution as a continuous four-stage cycle:

1. Status Quo:
   The current operational state or existing system environment where daily business functions execute and operational results are delivered.

2. Problem Definition:
   Identifies specific deficiencies, performance bottlenecks, evolving user needs, or business opportunities that disrupt the status quo.

3. Technical Development:
   The core engineering phase where software engineers design, code, and test technological solutions to resolve the identified problem.

4. Solution Integration:
   Deploying and integrating the developed solution into the operational environment, thereby establishing a new, improved Status Quo.`,
      'The four stages are: Status Quo (current state), Problem Definition (need for change), Technical Development (building solution), and Solution Integration (deployment to new status quo).'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Mention the major activities involved in the Software Construction phase.',
      `Once requirements are finalized and baseline approved, the Construction Phase commences, encompassing the following key activities:

1. Detailed & Architectural Design:
   Translating requirements into module architectures, data structures, and algorithmic specifications.

2. Coding & Implementation:
   Writing robust, standards-compliant source code in the selected programming languages.

3. Unit & Integration Testing:
   Verifying each component independently and testing interface interactions across subsystems to eliminate defects early.

4. Debugging & Code Inspection:
   Systematically diagnosing defect causes, rectifying bugs, and conducting peer reviews to ensure quality.

5. Documentation:
   Developing developer guides, API specifications, and code-level comments for future maintainability.`,
      'Construction activities: detailed design, coding/implementation, unit & integration testing, debugging/inspection, and technical documentation.'
    );

    // 2 Long Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'There are four basic phases of software development: Vision, Definition, Development, and Maintenance. Explain the purpose and primary goal of each phase.',
      `Software development is systematically organized into four major phases:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. VISION PHASE (Why?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Core Question: "Why are we building this system?"
• Purpose: Identifies the high-level business motivation, organizational vision, and strategic goals.
• Key Activities:
  - Performing feasibility analysis (technical, economic, and operational).
  - Defining project scope, preliminary budget, and high-level milestones.
  - Assessing business value and Return on Investment (ROI).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DEFINITION PHASE (What?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Core Question: "What must the system do?"
• Purpose: Comprehensively eliciting, analyzing, negotiating, and validating all system requirements.
• Key Activities:
  - Documenting functional requirements (behaviors, calculations, user workflows).
  - Documenting non-functional requirements (performance, security, usability, reliability).
  - Establishing unambiguous acceptance criteria and creating the Software Requirements Specification (SRS).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DEVELOPMENT PHASE (How?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Core Question: "How will the system be designed, constructed, and validated?"
• Purpose: Transforming the requirements specifications into an operational, verified software product.
• Key Activities:
  - Architectural, interface, and detailed component design.
  - Source code implementation following clean coding practices.
  - Multi-tier testing (unit, integration, system, and user acceptance testing).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. MAINTENANCE PHASE (Evolution)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Core Question: "How will the software adapt and evolve over time?"
• Purpose: Preserving system value and operational stability after deployment.
• Key Activities:
  - Corrective Maintenance: Rectifying residual defects discovered in production.
  - Adaptive Maintenance: Updating software to accommodate changes in OS, hardware, or third-party APIs.
  - Perfective Maintenance: Enhancing performance and adding user-requested features.
  - Preventive Maintenance: Code refactoring to avert future degradation.
  (Note: Maintenance typically consumes 60%–80% of total lifecycle investment).`,
      'The 4 phases: Vision (Why/Feasibility), Definition (What/SRS), Development (How/Design & Coding), and Maintenance (Evolution & Bug fixes).'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'Explain how the cost of fixing a bug/error changes as software progresses from the requirements gathering phase to post-delivery/maintenance phase. Why is early bug detection critical?',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BOEHM'S COST-OF-FIX ESCALATION MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In software engineering, Barry Boehm's empirical research proves that the cost of detecting and repairing a defect escalates exponentially (by orders of magnitude) across successive lifecycle phases:

• Requirements Phase (Cost Factor = 1x):
  A requirement defect caught during elicitation costs very little to fix ($10–$50) because it merely requires editing a sentence in a document or diagram.

• Design Phase (Cost Factor = 3x – 5x):
  If the error escapes into design, fixing it requires updating architectural blueprints, class diagrams, and interface contracts.

• Coding Phase (Cost Factor = 10x):
  The defect is now manifested in code. Fixing it requires rewriting functions, updating unit tests, and recompiling modules.

• System Testing Phase (Cost Factor = 20x – 50x):
  Finding the bug during integration or system testing requires complex regression testing, defect tracking, and coordination across multiple developer teams.

• Post-Delivery / Maintenance Phase (Cost Factor = 100x – 200x+):
  A bug discovered in production is extraordinarily costly. It can result in system downtime, data corruption, issuing emergency patches to thousands of users, potential legal liabilities, and irreparable brand damage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. WHY EARLY BUG DETECTION IS CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Prevents "Defect Amplification":
   A single ambiguous requirement can spawn multiple flawed design choices, leading to dozens of defective classes and hundreds of faulty lines of code.

2. Predictable Budgets and Timelines:
   Late-stage defect discoveries are the primary cause of sudden project delays and budget blowouts. Early verification ensures predictable scheduling.

3. Superior Architecture & Code Quality:
   Software that undergoes rigorous early verification possesses cleaner modularity and lower architectural complexity, making ongoing maintenance substantially less expensive.`,
      'Fixing defects at later stages costs up to 100x-200x more than during requirements; early detection prevents defect amplification and massive financial losses.'
    );
  }

  // CS504 — Lecture 3: Requirement Engineering Concepts & Role of SRS
  const cs504L3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L3) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 3, 'Requirement Engineering Concepts & Role of SRS')`).run(cs504.id);
    const lId = lRes.lastInsertRowid;

    const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 8 MCQs
    ins.run(lId, 'mcq',
      'Requirement engineering mainly deals with the ______ phase of software development.',
      JSON.stringify({
        a: 'Definition phase',
        b: 'Development phase',
        c: 'Maintenance phase',
        d: 'Vision phase'
      }),
      'a',
      'According to CS504 handouts (page 16), Requirement Engineering belongs primarily to the Definition phase, which specifies "WHAT" the system must accomplish.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Requirement engineering focuses primarily on the ______ aspect of the software development process.',
      JSON.stringify({
        a: 'Both what and how',
        b: 'What',
        c: 'How',
        d: 'Why and how'
      }),
      'b',
      'Requirement Engineering focuses strictly on "WHAT" needs to be built rather than "HOW" it should be implemented in code or architecture.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Insufficient user involvement during requirement engineering leads to ______ products.',
      JSON.stringify({
        a: 'Unacceptable',
        b: 'Ambiguous',
        c: 'Dissatisfaction of customer',
        d: 'None of the above'
      }),
      'a',
      'Handouts emphasize that without continuous, active user involvement, the resulting software system is often completely unacceptable to end users.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'The central role of the software requirement document (SRS) in the entire development process is related to ______.',
      JSON.stringify({
        a: 'Project planning',
        b: 'Project tracing',
        c: 'Change control',
        d: 'All of the above'
      }),
      'd',
      'The SRS document is the baseline document for all downstream activities: project scheduling, task assignment, progress tracing, verification, and change control management.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'According to software industry studies, 40% to 60% of all defects found in software projects can be traced back to poor ______.',
      JSON.stringify({
        a: 'Design',
        b: 'Code',
        c: 'Requirements',
        d: 'Testing'
      }),
      'c',
      'Empirical software engineering data reveals that 40%–60% of project bugs stem directly from deficient, missing, or contradictory requirement specifications.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which one of the following is NOT a process step of requirement engineering?',
      JSON.stringify({
        a: 'Elicitation',
        b: 'Design',
        c: 'Analysis',
        d: 'Documentation'
      }),
      'b',
      'Design is a distinct technical stage belonging to the Development phase, not a sub-process of Requirement Engineering (which consists of Elicitation, Analysis, Specification, and Validation).',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'A software requirement document describes all the ______ provided by the system along with the constraints under which it must operate.',
      JSON.stringify({
        a: 'Conditions',
        b: 'Services',
        c: 'Events',
        d: 'Processes'
      }),
      'b',
      'An SRS document formally specifies the functional services provided by the system together with operational and environmental constraints.',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      '“A condition or capability needed by a user to solve a problem or achieve an objective” is the standard definition of software requirement given by ______.',
      JSON.stringify({
        a: 'Jones',
        b: 'Alan Davis',
        c: 'Ian Sommerville',
        d: 'IEEE'
      }),
      'd',
      'The IEEE Standard Glossary of Software Engineering Terminology formally defines a requirement as a condition or capability needed by a user to solve a problem or achieve an objective.',
      1, 1, 'lecture'
    );

    // 2 Short Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Define Requirement Engineering. What is its primary focus during software development?',
      `Definition:
Requirement Engineering is the disciplined, systematic process of discovering, analyzing, validating, documenting, and managing the services, features, and operational constraints required of a software system.

Primary Focus:
• Phase: Belongs centrally to the Definition Phase of the software development lifecycle.
• Core Focus: Focuses strictly on "WHAT" the system must accomplish, rather than "HOW" it will be designed or implemented.
• Boundary: Deals with user needs, domain constraints, business rules, and interface behaviors while intentionally leaving data structures, algorithms, and technology stacks to the subsequent design and development phases.`,
      'Requirement Engineering is the systematic process in the Definition phase that focuses on "WHAT" the software must do rather than "HOW" to build it.'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'It is stated that 40–60% of all software defects trace back to poor requirements. Briefly explain why requirement gathering is critical to project success.',
      `Requirement gathering is the single most critical activity determining software project success due to the following factors:

1. Primary Root Cause of Failures (40%–60% of Defects):
   Studies indicate that up to 60% of all system bugs originate from omitted, ambiguous, or inaccurate requirements. Fixing requirement bugs in later phases costs exponentially more.

2. Defect Cascade & Amplification:
   A single flaw in requirements propagates downward, corrupting architectural models, hundreds of lines of code, and entire test suites.

3. Prevention of Unacceptable Software:
   Without thorough requirement gathering and continuous user involvement, teams risk building a technically flawless system that completely fails to address the user's real business problem.

4. Clear Project Baseline:
   Clear requirements provide the indispensable basis for realistic cost estimation, scheduling, scope control, and acceptance verification.`,
      '40-60% of software defects originate from requirements; requirement gathering prevents defect amplification and ensures the right product is built.'
    );

    // 2 Long Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'Explain the central role of the Software Requirement Document (SRD/SRS) across the entire software development life cycle.',
      `The Software Requirement Document (SRS/SRD) serves as the foundational, authoritative agreement between stakeholders, developers, and testers. Its central roles across the lifecycle include:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PROJECT PLANNING & FEASIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Scope Definition: Establishes clear contractual boundaries of what is included and excluded.
• Estimation: Provides the quantitative basis for calculating development effort, project budget, staffing needs, and delivery schedules.
• Risk Management: Enables early identification of technical challenges and domain uncertainties.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. SYSTEM DESIGN & CONSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Architectural Input: System architects use functional and non-functional requirements to select appropriate architectural styles, database schemas, and component models.
• Developer Roadmap: Software engineers reference the SRS to write functional code that faithfully reflects user requirements without guessing business rules.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. SYSTEM VERIFICATION & QUALITY ASSURANCE (TESTING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Test Case Derivation: Acceptance tests, system tests, and validation test scenarios are derived directly from requirement statements.
• Compliance Verification: Serves as the ultimate benchmark to determine whether the delivered software meets the customer's specified quality criteria.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. CHANGE CONTROL & SCOPE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Baseline for Modifications: When users request modifications or new features, the change impact (in cost, time, and architecture) is evaluated against the baseline SRS.
• Prevents "Feature Creep": Protects the project team from uncontrolled scope expansion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. REQUIREMENT TRACEABILITY & PROJECT TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Enables forward and backward traceability: linking each requirement forward to specific design modules and test scripts, ensuring complete coverage.`,
      'The SRS is the central contract and blueprint across planning, architecture, construction, quality testing, and change control.'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'Quote or summarize Fred Brooks\' perspective on Requirement Engineering from "The Mythical Man-Month" and discuss why deciding precisely what to build is the hardest single part of software engineering.',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. FRED BROOKS' PERSPECTIVE ("The Mythical Man-Month")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Turing Award winner Fred Brooks famously observed:
"The hardest single part of building a software system is deciding precisely what to build. No other part of the conceptual work is as difficult as establishing the detailed technical requirements, including all the interfaces to people, to machines, and to other software systems. No other part of the work so cripples the resulting system if done wrong. No other part is more difficult to rectify later."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. WHY DECIDING "WHAT TO BUILD" IS THE HARDEST PART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Communication Gap and Tacit Knowledge:
   • Clients rarely know precisely what they need in structured mathematical terms. They understand their operational pain points but struggle to articulate detailed system specifications.
   • Domain experts and technical engineers speak fundamentally different vocabularies, causing severe misinterpretations.

2. Inherent Complexity of Human Workflows:
   • Unlike physical machines governed by immutable physical laws, software models complex, variable human organizations, conflicting business policies, and legal regulations.

3. Volatility and Requirements Drift:
   • Business priorities, competition, and user expectations continuously shift while development is underway. Freezing requirements is exceptionally challenging.

4. Disastrous Consequences of Getting It Wrong:
   • Designing algorithms and debugging syntax errors are standard technical problems. But building the wrong software—no matter how elegantly coded—results in complete waste of investment and project failure.`,
      'Brooks stated that deciding what to build is the hardest part of SE because requirements involve communication gaps, organizational complexity, and the highest cost of late rectification.'
    );
  }

  // CS504 — Lecture 4: Requirement Engineering - II: Specification, Characteristics & Stakeholders
  const cs504L4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L4) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 4, 'Requirement Engineering - II: Specification, Characteristics & Stakeholders')`).run(cs504.id);
    const lId = lRes.lastInsertRowid;

    const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 10 MCQs
    ins.run(lId, 'mcq',
      'The two main documents produced during this phase are Requirement Statement and Requirement Specification. They are also called Requirement Definition and ____________.',
      JSON.stringify({
        a: 'Functional Specification',
        b: 'Mathematical specification',
        c: 'System Specification',
        d: 'None of the given'
      }),
      'a',
      'According to CS504 handouts (page 25), the two primary documents produced in requirement engineering are Requirement Statement (also called Requirement Definition) and Requirement Specification (also called Functional Specification).',
      'اس فیز میں تیار کردہ دو اہم دستاویزات Requirement Statement (یا Requirement Definition) اور Requirement Specification (یا Functional Specification) کہلاتی ہیں۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Following all are the Requirements statement Characteristics except the:',
      JSON.stringify({
        a: 'Correct',
        b: 'Verifiable',
        c: 'Prioritized',
        d: 'Polite'
      }),
      'd',
      'A well-formed Requirement Statement document must be Complete, Correct, Feasible, Necessary, Prioritized, Unambiguous, and Verifiable. "Polite" is not a technical engineering characteristic.',
      'ایک معیاری ریکوائرمنٹ سٹیٹمنٹ کے خصائص میں Correct, Verifiable اور Prioritized شامل ہیں، جبکہ Polite کوئی تکنیکی خصوصیت نہیں ہے۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'A SRS (Software Requirements Specification) is said to be __________ if and only if, every requirement stated therein has only one interpretation.',
      JSON.stringify({
        a: 'Compact',
        b: 'Unambiguous',
        c: 'Consistent',
        d: 'Detailed'
      }),
      'b',
      'An SRS is unambiguous if and only if every requirement stated has only one single, clear interpretation by all stakeholders and engineers (Handout page 26).',
      'ایک سافٹ ویئر ریکوائرمنٹس سپیسیفیکیشن (SRS) اس وقت Unambiguous کہلاتی ہے جب اس میں بیان کردہ ہر شرط کا صرف اور صرف ایک ہی واضح مطلب نکلتا ہو۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which of the following property does not correspond to a good Software Requirements Specification (SRS)?',
      JSON.stringify({
        a: 'Verifiable',
        b: 'Ambiguous',
        c: 'Complete',
        d: 'Traceable'
      }),
      'b',
      'A good SRS must be unambiguous, complete, consistent, verifiable, modifiable, and traceable. Ambiguity is a defect, not a desirable property.',
      'ایک اچھے SRS کی مطلوبہ خوبیوں میں Verifiable, Complete اور Traceable ہونا شامل ہے۔ Ambiguous (مبہم ہونا) ایک خامی ہے، خوبی نہیں۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'All are the typical non-functional requirements except the:',
      JSON.stringify({
        a: 'Reliability',
        b: 'Feasible',
        c: 'Availability',
        d: 'Scalability'
      }),
      'b',
      'Reliability, Availability, and Scalability are typical Non-Functional Requirements (quality attributes). "Feasible" is an attribute of a requirement statement, not a non-functional requirement.',
      'Reliability, Availability اور Scalability نان فنکشنل ریکوائرمنٹس (کوالٹی اوصاف) ہیں، جبکہ Feasible ہونا ریکوائرمنٹ سٹیٹمنٹ کی ایک خاصیت ہے۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'Which is one of the most important stakeholders from the following?',
      JSON.stringify({
        a: 'Entry level personnel',
        b: 'Middle level stakeholder',
        c: 'Managers',
        d: 'Users of the software'
      }),
      'd',
      'End users of the software are the most vital stakeholders because they directly interact with the system. Handout page 24 explicitly notes that ignoring end-users leads to project failure.',
      'سافٹ ویئر کے اصل صارفین (Users of the software) سب سے اہم اسٹیک ہولڈرز ہیں، ان کو نظر انداز کرنے سے پراجیکٹ لازماً ناکام ہو جاتا ہے۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'What is the most crucial non-functional requirement of a system to control radiation dosages that are emitted as treatment for cancer?',
      JSON.stringify({
        a: 'Security',
        b: 'Reliability',
        c: 'Usability',
        d: 'Accuracy'
      }),
      'd',
      'For safety-critical medical systems like cancer radiation therapy, Accuracy in dosage measurement and beam delivery is the most vital non-functional requirement, as minor deviations can cause fatal injuries.',
      'کینسر ریڈی ایشن تھراپی کے نظام میں تابکاری کی مقدار کا سب سے نازک اور اہم غیر فنکشنل معیار Accuracy (درستگی) ہے کیونکہ ذرا سی غلطی بھی مریض کے لیے جان لیوا ہو سکتی ہے۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      'What is the most important software quality of a web-based transaction system?',
      JSON.stringify({
        a: 'Efficiency',
        b: 'Modularity',
        c: 'Usability',
        d: 'Security'
      }),
      'c',
      'According to CS504 course handouts and past papers, Usability (ease of use and intuitive interface) is considered the most crucial software quality determining the success of web-based transaction systems for general end-users.',
      'CS504 کے نصاب کے مطابق عام پبلک کے لیے ویب پر مبنی ٹرانزیکشن سسٹمز کی کامیابی میں سب سے اہم سافٹ ویئر کوالٹی Usability (استعمال میں آسانی) ہے۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      '__________ requirements cause frequent modifications in user interface.',
      JSON.stringify({
        a: 'Functional',
        b: 'Non-functional',
        c: 'User',
        d: 'Domain'
      }),
      'c',
      'User requirements reflect direct end-user interaction workflows, ergonomic preferences, and daily operational habits, making them the primary cause of frequent modifications in the user interface (UI).',
      'User requirements براہ راست صارف کی روزمرہ عادات اور ترجیحات سے متعلق ہوتی ہیں، اسی لیے یہ یوزر انٹرفیس (UI) میں بار بار ترامیم کا سبب بنتی ہیں۔',
      1, 1, 'lecture'
    );

    ins.run(lId, 'mcq',
      '__________ requirements are often called product features.',
      JSON.stringify({
        a: 'Functional',
        b: 'Business',
        c: 'User',
        d: 'Non-functional'
      }),
      'a',
      'Functional requirements describe the specific operations, services, and transformations provided by the system, and are commonly referred to as product features.',
      'فنکشنل ریکوائرمنٹس (Functional requirements) سسٹم کی مخصوص خدمات اور افعال کو بیان کرتی ہیں اور عام بول چال میں انہیں پروڈکٹ فیچرز (Product features) کہا جاتا ہے۔',
      1, 1, 'lecture'
    );

    // 3 Short Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Differentiate between Functional and Non-Functional Requirements with one example each.',
      `1. Functional Requirements:
• Definition: Specify the specific operational capabilities, services, data manipulations, and algorithmic transformations that the software system must perform ("WHAT the system does").
• Often called: Product features.
• Example: "The online portal shall allow students to generate and download their semester fee challan in PDF format upon course registration."

2. Non-Functional Requirements:
• Definition: Specify the behavioral properties, operational qualities, environmental constraints, and performance benchmarks under which the functional services must execute ("HOW WELL the system performs").
• Examples of Quality Attributes: Performance, Reliability, Availability, Scalability, Security, and Usability.
• Example: "The PDF fee challan generation shall execute within 2 seconds under a concurrent workload of 10,000 active students with 99.9% system availability."`,
      'Functional requirements define what services the system must perform; Non-functional requirements define quality constraints and performance benchmarks.',
      'فنکشنل ریکوائرمنٹس سسٹم کے افعال اور خدمات کو بیان کرتی ہیں (جیسے طالب علم کا فیس چالان بنانا)۔ نان فنکشنل ریکوائرمنٹس معیار، رفتار اور سیکیورٹی کو بیان کرتی ہیں (جیسے چالان 2 سیکنڈ کے اندر 10 ہزار طلبہ کے بیک وقت دباؤ میں بننا)۔'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'List down four characteristics of a good Requirement Statement document.',
      `A high-quality Requirement Statement (Requirement Definition) document must exhibit the following four essential characteristics:

1. Complete:
• All critical business functions, operational constraints, input validations, and error conditions must be fully articulated without missing information or "TBD" (To Be Determined) placeholders.

2. Correct:
• Every requirement statement must accurately represent genuine business and user needs confirmed and approved by real stakeholders.

3. Feasible:
• Each stated requirement must be realistically buildable and achievable within the allocated development budget, timeline, available technical tools, and human expertise.

4. Verifiable (Testable):
• Every requirement must be specified in clear, objective terms such that an unambiguous, cost-effective manual or automated acceptance test can be designed to prove compliance.

(Other valid key characteristics include: Unambiguous, Necessary, and Prioritized).`,
      'A good Requirement Statement must be Complete, Correct, Feasible, and Verifiable.',
      'ایک معیاری ریکوائرمنٹ سٹیٹمنٹ کی چار بنیادی خصوصیات: (1) Complete: تمام ضروری افعال اور شرائط مکمل طور پر درج ہوں؛ (2) Correct: تمام بیانات حقیقت پر مبنی اور کلائنٹ سے تصدیق شدہ ہوں؛ (3) Feasible: دی گئی تکنیکی صلاحیت اور بجٹ میں قابل عمل ہو؛ (4) Verifiable: ایسی واضح ہو کہ اس کا باقاعدہ ٹیسٹ لے کر تصدیق کی جا سکے۔'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
    `).run(
      lId,
      'Who are Stakeholders in software engineering? Why is identifying all classes of stakeholders important for project success?',
      `1. Definition of Stakeholders:
A Stakeholder in software engineering is any individual, group, or organization who has a direct or indirect stake, investment, interest, or influence in the software project or who will be affected by its development, deployment, or operation.
• Major Stakeholder Classes: Direct end-users, business managers, project sponsors/investors, software architects/engineers, system administrators, and regulatory compliance authorities.

2. Importance of Identifying All Stakeholder Classes:
• Diverse & Conflicting Viewpoints: Different stakeholder groups have contrasting priorities (e.g., users prioritize usability and speed; managers prioritize cost and schedule; security officers prioritize strict compliance). Identifying all groups enables negotiation and balanced requirements.
• Preventing Project Failure: Handouts emphasize that actual end-users are the most critical stakeholders. If end-users are ignored during elicitation, the system will likely fail user adoption and face ultimate project cancellation.
• Scope Completeness: Unidentified stakeholders inevitably surface late in the development cycle, introducing disruptive change requests, scope creep, and severe budget overruns.`,
      'Stakeholders are all individuals affected by the software; identifying all classes prevents late surprises, balances conflicting goals, and ensures adoption.',
      'اسٹیک ہولڈر سے مراد وہ تمام افراد یا تنظیمیں ہیں جن کا سسٹم سے براہ راست یا بالواسطہ تعلق یا مفاد ہو (جیسے صارفین، مینیجرز، انجینئرز)۔ تمام اقسام کی بروقت شناخت اس لیے ضروری ہے تاکہ متضاد ضروریات میں توازن قائم کیا جا سکے اور اہم طبقات (خصوصاً اصل صارفین) کو نظر انداز کر کے پراجیکٹ کی ناکامی سے بچا جا سکے۔'
    );

    // 2 Long Questions
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'Explain the four different levels/types of requirements (Business Requirements, User Requirements, Functional Requirements, and Non-Functional Requirements) with a suitable example (such as a word processor or spell checker).',
      `Requirements in modern software engineering are structured across four fundamental levels of abstraction:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BUSINESS REQUIREMENTS (High-Level Corporate Goals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Purpose: High-level objectives of the sponsor organization or enterprise stating WHY the software is being built and how it delivers commercial value.
• Expressed in: Project Charter and Vision documents.
• Example (Word Processor / Spell Checker):
  "Reduce document proofreading and revision overhead by 40% to achieve market leadership in corporate and academic publishing software within 12 months."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. USER REQUIREMENTS (User Goals & Tasks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Purpose: Specific goals and tasks that end-users must be able to achieve using the software system ("WHAT the user expects to do").
• Expressed in: Use Cases, User Stories, and Scenario walkthroughs.
• Example (Word Processor / Spell Checker):
  "The author/editor shall be able to identify misspelled words across a manuscript and replace them with verified dictionary suggestions with a single click."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. FUNCTIONAL REQUIREMENTS (Detailed System Behaviors / Features)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Purpose: The specific software capabilities, operations, data transformations, and input/output responses that engineers must implement in code ("WHAT the software must do"). Often termed product features.
• Expressed in: Software Requirements Specification (SRS / Functional Specification).
• Example (Word Processor / Spell Checker):
  "The spell checking engine shall parse active document text, tokenize individual words, compare each token against a 120,000-word standard English dictionary, underline unmatched words with a squiggly red line, and display the top 5 closest phonetic candidate corrections upon right-click."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. NON-FUNCTIONAL REQUIREMENTS (Quality Attributes & Constraints)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Purpose: The quality characteristics, performance standards, architectural constraints, and user-experience benchmarks that govern the functional requirements ("HOW WELL the system performs").
• Expressed in: Supplementary Specifications or dedicated SRS sections.
• Example (Word Processor / Spell Checker):
  "The background spell-checking scan must process text at a minimum rate of 2,000 words per second, consume less than 30 MB of active memory (RAM), and never freeze the primary typing interface or introduce input latency greater than 16 milliseconds."`,
      'The four levels of requirements are: Business (corporate goals), User (user tasks), Functional (system features/services), and Non-Functional (quality/performance constraints).',
      'ریکوائرمنٹس کے 4 درجات: (1) Business Requirements: تنظیمی و کاروباری مقاصد (جیسے ایڈیٹنگ کا وقت 40 فیصد کم کر کے مارکیٹ لیڈر بننا)؛ (2) User Requirements: صارف کے مقاصد (مصنف کا غلط الفاظ کی نشاندہی اور درستگی چاہنا)؛ (3) Functional Requirements: سسٹم کے افعال اور فیچرز (ڈکشنری سے موازنہ کر کے لال لکیر کھینچنا اور 5 تجاویز دکھانا)؛ (4) Non-Functional Requirements: معیار اور کارکردگی (2000 الفاظ فی سیکنڈ اسکین کرنا اور 30MB سے کم ریم استعمال کرنا)۔'
    );

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `).run(
      lId,
      'Compare Requirement Statement (Requirement Definition) and Requirement Specification (Functional Specification) documents. Detail the key characteristics required for a quality Requirement Statement.',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: COMPARISON OF CORE REQUIREMENT DOCUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
During the Definition Phase, requirement engineering produces two fundamental baseline documents:

1. Requirement Statement (Requirement Definition):
• Target Audience: Business clients, project sponsors, domain managers, and non-technical end-users.
• Perspective & Language: Written from the customer's operational perspective in clear, natural language.
• Primary Content: High-level problem statement, business goals, user needs, environmental context, and scope boundaries without detailing technical algorithms or low-level design structures.
• Role: Acts as the contractual foundation and business agreement between the purchasing client and software vendor.

2. Requirement Specification (Functional Specification / SRS):
• Target Audience: Software architects, system designers, developers, database administrators, and QA test engineers.
• Perspective & Language: Written from an engineering and technical perspective with structured notations, formal data dictionaries, and explicit logic models.
• Primary Content: Exhaustive functional requirements, exact input/output formats, database entity requirements, system interfaces, security policies, and verifiable non-functional benchmarks.
• Role: Serves as the authoritative blueprint for system design, code implementation, and formal acceptance testing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: KEY CHARACTERISTICS OF A QUALITY REQUIREMENT STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
According to CS504 course standards, a professional Requirement Statement must exhibit the following attributes:

1. Complete: All essential functionalities, user constraints, and operational scenarios are covered without omissions or unverified placeholders.
2. Correct: Accurately reflects authentic user desires and business realities validated by authorized domain stakeholders.
3. Feasible: Can be successfully engineered within the defined budgetary, temporal, and technological constraints.
4. Necessary: Every clause traces directly to a recognized business driver or user objective, eliminating redundant bloat.
5. Prioritized: Requirements are categorized by critical urgency (e.g., Mandatory vs. Highly Desirable vs. Optional) to guide incremental delivery.
6. Unambiguous: Phrased so that every statement conveys exactly one unique, clear interpretation to all parties.
7. Verifiable: Stated in objective, measurable terms such that testers can design concrete procedures to prove whether the final system satisfies it.`,
      'Requirement Statement is the client-facing natural language definition; Requirement Specification is the engineer-facing detailed technical blueprint. Key qualities include completeness, correctness, feasibility, and verifiability.',
      '(1) موازنہ: Requirement Definition کلائنٹ اور صارف کے لیے عام فہم زبان میں لکھی جانے والی بنیادی دستاویز ہے جس میں کاروباری مسائل اور ضروریات بیان ہوتی ہیں۔ Requirement Specification (SRS) تکنیکی دستاویز ہے جو پروگرامرز اور ٹیسٹرز کے لیے سسٹم کے تمام تکنیکی ان پٹ، آؤٹ پٹ اور اندرونی لاجک کی تفصیلی رہنمائی کرتی ہے۔ (2) معیاری ریکوائرمنٹ سٹیٹمنٹ کے اوصاف: Complete (مکمل)، Correct (درست)، Feasible (قابل عمل)، Necessary (ضروری)، Prioritized (ترجیحی)، Unambiguous (غیر مبہم)، اور Verifiable (قابل تصدیق)۔'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CS504 — Lecture 5: Scope, System Boundary, Context Diagram & Traceability
  // ─────────────────────────────────────────────────────────────────────────
  const cs504L5 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 5`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L5) {
    const cs504L5Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 5, ?)`).run(
      cs504.id,
      'Scope, System Boundary, Context Diagram & Traceability'
    );
    const cl5Id = cs504L5Res.lastInsertRowid;

    const ins504L5 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 8 MCQs
    const mcqs504L5 = [
      {
        stem: 'The scope description establishes the ---------- between the system we are developing and everything else in the universe.',
        options: JSON.stringify({
          a: 'Boundary',
          b: 'Balance',
          c: 'Constraint',
          d: 'None of the given'
        }),
        correct: 'a',
        explanation: 'The scope description establishes the operational boundary between the software system being engineered and external entities in the universe.',
        urdu_answer: 'اسکوپ کی تفصیل (Scope description) سسٹم اور بیرونی دنیا کے درمیان حد یا باؤنڈری (Boundary) قائم کرتی ہے۔'
      },
      {
        stem: 'Project --------------- defines the concept and range of the proposed solution, and limitations identify certain capabilities that the product will not include.',
        options: JSON.stringify({
          a: 'Scope',
          b: 'Agreement',
          c: 'Plan',
          d: 'None of the given'
        }),
        correct: 'a',
        explanation: 'Project Scope defines the conceptual extent, functional boundaries, and capabilities of the proposed software solution.',
        urdu_answer: 'پراجیکٹ اسکوپ (Scope) حل کے تصور اور حدود کا تعین کرتا ہے کہ کیا سسٹم کا حصہ ہو گا اور کیا نہیں۔'
      },
      {
        stem: 'A ----------, sometimes called a level 0 data-flow diagram, is drawn in order to define and clarify the boundaries of the software system.',
        options: JSON.stringify({
          a: 'Data through',
          b: 'context diagram',
          c: 'Conceptual diagram',
          d: 'Structure diagram'
        }),
        correct: 'b',
        explanation: 'A context diagram (Level 0 DFD) models the entire software system as a single central process interacting with external entities to delineate boundaries.',
        urdu_answer: 'کانٹیکسٹ ڈایاگرام (Context diagram یا Level 0 DFD) سسٹم کی بیرونی حدود اور روابط واضح کرنے کے لیے بنائی جاتی ہے۔'
      },
      {
        stem: 'A context diagram:',
        options: JSON.stringify({
          a: 'Describes detailed design of a system',
          b: 'Is a DFD which gives an overview of the system / Describes the context dependencies of a system',
          c: 'Is a detailed description of a system',
          d: 'Is not used in drawing a detailed DFD'
        }),
        correct: 'b',
        explanation: 'A context diagram provides an architectural overview of the system and illustrates external entities supplying inputs or receiving outputs.',
        urdu_answer: 'کانٹیکسٹ ڈایاگرام ایک ہائی لیول DFD ہے جو سسٹم کا مجموعی جائزہ اور بیرونی وابستگیاں ظاہر کرتی ہے۔'
      },
      {
        stem: '__________ collected from multiple sources might conflict.',
        options: JSON.stringify({
          a: 'Business requirements',
          b: 'Functional Requirement',
          c: 'User Requirements',
          d: 'Non-Functional requirement'
        }),
        correct: 'a',
        explanation: 'Business requirements gathered from diverse stakeholders, departments, and corporate sponsors often conflict due to competing strategic goals and budget limits.',
        urdu_answer: 'مختلف ذرائع اور شعبہ جات سے اکٹھی کی گئی کاروباری ضروریات (Business requirements) آپس میں متصادم (conflict) ہو سکتی ہیں۔'
      },
      {
        stem: 'Traceability of a requirement document allows us to link each requirement to its __________.',
        options: JSON.stringify({
          a: 'Origin, design elements, source code, and test cases',
          b: 'Database tables only',
          c: 'Hardware configuration',
          d: 'Project schedule'
        }),
        correct: 'a',
        explanation: 'Requirement traceability provides bidirectional tracking: backward to originating business needs and forward to architecture design, code modules, and test verification.',
        urdu_answer: 'ریکوائرمنٹ ٹریسیبلٹی ہر ضرورت کو اس کے اصل ماخذ، ڈیزائن، سورس کوڈ اور ٹیسٹ کیسز کے ساتھ جوڑتی ہے۔'
      },
      {
        stem: 'The Vision and Scope Document provides:',
        options: JSON.stringify({
          a: 'Detailed algorithm pseudocode',
          b: 'The strategic context, business objectives, and project boundaries',
          c: 'Database physical table schemas',
          d: 'Hardware assembly instructions'
        }),
        correct: 'b',
        explanation: 'The Vision and Scope Document articulates the business rationale, commercial return on investment, and clear boundaries of what the project will and will not deliver.',
        urdu_answer: 'ویژن اور اسکوپ دستاویز اسٹریٹجک کاروباری مقاصد اور پراجیکٹ کی حدود بیان کرتی ہے۔'
      },
      {
        stem: 'In a Context Diagram, the entire system is represented as:',
        options: JSON.stringify({
          a: 'A single bubble / process representing the whole system',
          b: 'Multiple internal sub-processes',
          c: 'A relational entity-relationship diagram',
          d: 'A set of class inheritance hierarchies'
        }),
        correct: 'a',
        explanation: 'In a Context Diagram (Level 0 DFD), the software system is treated as a unified whole represented by a single central bubble, flanked by external terminators.',
        urdu_answer: 'کانٹیکسٹ ڈایاگرام میں پورا سسٹم ایک واحد سنٹرل پروسیس (ببل) کی صورت میں ظاہر کیا جاتا ہے۔'
      }
    ];

    for (const m of mcqs504L5) {
      ins504L5.run(cl5Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
    }

    // 3 Short Questions (3 marks each)
    const shorts504L5 = [
      {
        stem: 'What is a Context Diagram? What is its main purpose in requirement analysis?',
        correct: `1. Definition:
A Context Diagram (also known as a Level-0 Data Flow Diagram) is the highest-level conceptual representation of a software system. It depicts the entire system as a single central bubble/process (Process 0), surrounded by external entities (terminators) such as users, external organizations, or hardware sensors.

2. Main Purpose in Requirement Analysis:
• Establishes System Boundary: Clearly distinguishes what is inside the scope of the software from what lies in the external environment.
• Identifies External Interfaces: Captures all incoming data flows (inputs) provided by external actors and outgoing data flows (outputs) produced by the system.
• Common Reference Point: Provides non-technical stakeholders and engineering teams with an intuitive high-level snapshot of system interactions before decomposing into complex low-level DFDs.`,
        explanation: 'Context diagram is a Level-0 DFD showing the system as one central process with external inputs/outputs, establishing system boundaries.',
        urdu_answer: 'کانٹیکسٹ ڈایاگرام (Level-0 DFD) پورے سسٹم کو ایک مرکزی پروسیس کے طور پر ظاہر کرتی ہے جس کے ارد گرد بیرونی اینٹیٹیز (صارفین، ہارڈویئر) موجود ہوتی ہیں۔ اس کا مقصد سسٹم کی باؤنڈری قائم کرنا اور ان پٹ و آؤٹ پٹ کا جائزہ فراہم کرنا ہے۔'
      },
      {
        stem: 'Define Requirement Traceability. Why is traceability important when handling change requests?',
        correct: `1. Definition of Requirement Traceability:
Requirement Traceability is the ability to describe and follow the lifecycle of a requirement in both forward and backward directions across the development process:
• Backward Traceability: Tracing a requirement back to its business origin, stakeholder goal, or regulatory standard.
• Forward Traceability: Tracing a requirement forward to corresponding architectural components, detailed design elements, source code files, and verification test cases.

2. Importance in Handling Change Requests:
• Impact Analysis: When a stakeholder requests a modification, traceability immediately reveals every design component, database table, code module, and test case affected, enabling accurate cost and schedule estimates.
• Preventing Orphan / Broken Code: Ensures modifications do not leave orphaned functions or unverified features.
• Verification: Guarantees that modified requirements are re-tested by pointing directly to the impacted test scripts.`,
        explanation: 'Traceability connects requirements backward to business origins and forward to code and tests, enabling accurate impact analysis during changes.',
        urdu_answer: 'ریکوائرمنٹ ٹریسیبلٹی سے مراد کسی ضرورت کو اس کے آغاز سے لے کر ڈیزائن، کوڈ اور ٹیسٹ کیسز تک فالو کرنے کی صلاحیت ہے۔ تبدیلی کی درخواست کے وقت یہ بتاتی ہے کہ کوڈ اور ٹیسٹس کے کن کن حصوں پر اثر پڑے گا (Impact Analysis)۔'
      },
      {
        stem: "Explain the term 'System Boundary' and how it is established during the requirement engineering phase.",
        correct: `1. Concept of System Boundary:
The System Boundary defines the dividing line between the software product being engineered (what is internal and automated by developers) and the external operational environment (external users, hardware devices, third-party APIs, and legacy systems).

2. How It is Established:
• Vision and Scope Document: The project manager and business sponsors draft explicit inclusion and exclusion lists detailing features that will and will not be built.
• Context Diagram: System analysts create a Level-0 DFD drawing the boundary line around the central system bubble, identifying data crossing the boundary.
• Stakeholder Consensus: Negotiating with clients to eliminate scope creep and ensure budget and schedule feasibility.`,
        explanation: 'System boundary separates what is inside the software product from external systems and users; established via Scope document and Context Diagrams.',
        urdu_answer: 'سسٹم باؤنڈری سے مراد وہ حد فاصل ہے جو سافٹ ویئر اور بیرونی ماحول کے درمیان تفریق کرتی ہے۔ یہ ویژن اور اسکوپ ڈاکومنٹ، کانٹیکسٹ ڈایاگرام اور اسٹیک ہولڈرز کے ساتھ مذاکرات کے ذریعے طے کی جاتی ہے۔'
      }
    ];

    for (const s of shorts504L5) {
      ins504L5.run(cl5Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
    }

    // 2 Long Questions (5 marks each)
    const longs504L5 = [
      {
        stem: `Why is understanding the business domain essential for a software engineer before writing requirements? Discuss domain gathering techniques and how a software engineer bridges the domain terminology gap.`,
        correct: `Understanding the Business Domain in Software Engineering:

1. Why Understanding the Business Domain is Essential:
• Software is a Solution Vehicle: Software does not exist in isolation; its sole purpose is to automate, optimize, or solve problems within a specific commercial or scientific enterprise (e.g., banking, healthcare, telecommunications, aviation).
• Preventing Catastrophic Misunderstandings: If software engineers do not understand the domain rules, accounting laws, medical protocols, or business constraints, they will build an engineered product that technically compiles but is functionally useless to the customer.
• Unspoken Requirements: Domain experts often assume certain fundamental industry rules are "obvious" and omit mentioning them. A domain-literate engineer proactively identifies these latent requirements.

2. Domain Gathering Techniques:
• Stakeholder Interviews: Structured and unstructured dialogues with operational staff, domain managers, and end-users.
• On-Site Observation / Job Shadowing: Directly watching how end-users execute their daily tasks and record manual workarounds.
• Document Analysis: Studying existing company policy manuals, SOPs, corporate financial statements, and regulatory compliance documents.
• Competitive Benchmarking: Evaluating existing commercial market products to understand standard domain workflows.

3. Bridging the Domain Terminology Gap:
• Enterprise Domain Glossary: Compiling a living dictionary of all industry terms, business abbreviations, and specialized metrics to ensure uniform definitions across technical and business teams.
• Active Listening and Clarifying Questions: Software engineers must refrain from introducing technical jargon (e.g., polymorphism, foreign keys) and instead communicate using authentic customer domain language.
• Visual Conceptual Models: Utilizing Context Diagrams, DFDs, and business process swimlanes to validate domain understanding with business clients iteratively.`,
        explanation: 'Engineers must understand the business domain because software exists to solve domain problems. Techniques include interviews, observation, and building a domain glossary.',
        urdu_answer: 'سافٹ ویئر انجینئر کے لیے کاروباری ڈومین (جیسے بینکنگ، میڈیکل) کو سمجھنا لازمی ہے ورنہ سسٹم کسٹمر کی اصل ضرورت پوری نہیں کرے گا۔ معلومات کے حصول کے لیے انٹرویوز، شیڈوونگ اور دستاویزات کا مطالعہ کیا جاتا ہے جبکہ ٹرمینالوجی کے فرق کو مٹانے کے لیے ڈومین گلوسری تیار کی جاتی ہے۔'
      },
      {
        stem: `Describe the relationship between Business Requirements, Vision and Scope Document, Software Requirement Specification (SRS), and the Context Diagram. How do conflicting requirements get resolved during requirement engineering?`,
        correct: `Relationship Among Core Requirement Artifacts:

1. Hierarchical Relationship and Information Flow:
• Business Requirements (Corporate Rationale):
  - Originate from corporate executives and sponsors.
  - Define strategic commercial goals, market opportunities, and investment justification.
• Vision and Scope Document (Strategic Framework):
  - Translates business requirements into a formal charter.
  - Defines product vision, core solution capabilities, and explicit project boundaries (what will NOT be included).
• Context Diagram (Visual Architectural Delineation):
  - Directly translates the scope boundary into a visual Level-0 DFD.
  - Shows the entire system as a central process and models all data flows to and from external entities.
• Software Requirement Specification (SRS - Engineering Blueprint):
  - Decomposes the high-level scope and context diagram into detailed functional requirements, user requirements, data schemas, and quality benchmarks for developers and QA testers.

2. Resolving Conflicting Requirements:
In any enterprise project, stakeholders from different departments inevitably express conflicting desires (e.g., Sales wants rapid feature delivery; Security demands rigorous verification; Finance demands strict budget caps). Resolution follows a structured engineering protocol:

• Requirement Prioritization Matrix:
  - Classifying requirements into essential tiers (e.g., MoSCoW: Must have, Should have, Could have, Won't have).
• Cost-Benefit and Feasibility Analysis:
  - Evaluating conflicting proposals against projected ROI, implementation cost, and technical feasibility.
• Structured Stakeholder Negotiation:
  - Requirement engineers facilitate collaborative trade-off workshops to find viable compromises.
• Project Sponsor Arbitration:
  - When consensus cannot be reached, the executive project sponsor (who holds budget authority and owns the Vision and Scope document) makes the final authoritative decision.`,
        explanation: 'Business Requirements define why; Vision and Scope defines boundary; Context Diagram illustrates interfaces; SRS specifies how. Conflicting requirements are resolved via prioritization, trade-off analysis, and sponsor arbitration.',
        urdu_answer: 'بزنس ریکوائرمنٹس پراجیکٹ کا مقصد بتاتی ہیں، ویژن اینڈ اسکوپ حدود طے کرتا ہے، کانٹیکسٹ ڈایاگرام بیرونی روابط دکھاتا ہے اور SRS تفصیلی تکنیکی نقشہ بناتا ہے۔ متضاد ضروریات کو ترجیحی میٹرکس، ٹریڈ آف اینالسس اور پراجیکٹ اسپانسر کے حتمی فیصلے سے حل کیا جاتا ہے۔'
      }
    ];

    for (const l of longs504L5) {
      ins504L5.run(cl5Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CS504 — Lecture 6: Use Case Modeling: Actors, Diagrams & Elaborated Specifications
  // ─────────────────────────────────────────────────────────────────────────
  const cs504L6 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 6`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L6) {
    const cs504L6Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 6, ?)`).run(
      cs504.id,
      'Use Case Modeling: Actors, Diagrams & Elaborated Specifications'
    );
    const cl6Id = cs504L6Res.lastInsertRowid;

    const ins504L6 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 8 MCQs
    const mcqs504L6 = [
      {
        stem: 'Two components of a use-case model are actors and __________.',
        options: JSON.stringify({
          a: 'Functional requirements',
          b: 'Processes',
          c: 'Use-cases',
          d: 'System boundary'
        }),
        correct: 'c',
        explanation: 'A Use Case Model fundamentally comprises Actors (external entities interacting with the system) and Use Cases (sequences of actions providing observable value).',
        urdu_answer: 'یوز کیس ماڈل کے دو بنیادی اجزاء ایکٹرز (Actors) اور یوز کیسز (Use-cases) ہیں۔'
      },
      {
        stem: 'In a use case diagram, an ellipse signifies a(n) __________.',
        options: JSON.stringify({
          a: 'Actor',
          b: 'Class',
          c: 'Use case',
          d: 'System boundary'
        }),
        correct: 'c',
        explanation: 'In standard UML notation, an ellipse represents a use case, describing a specific functional capability.',
        urdu_answer: 'یوز کیس ڈایاگرام میں بیضوی شکل (Ellipse) یوز کیس کو ظاہر کرتی ہے۔'
      },
      {
        stem: 'A use case represents __________.',
        options: JSON.stringify({
          a: 'A class, its attributes and operation',
          b: 'An operation\'s interfaces and signature',
          c: 'The role a user plays when interacting with the system',
          d: 'The system\'s functionality for a particular purpose'
        }),
        correct: 'd',
        explanation: 'A use case captures a complete unit of system functionality performed in response to an actor request to achieve a specific goal.',
        urdu_answer: 'ایک یوز کیس مخصوص مقصد کے لیے سسٹم کی انجام دی جانے والی فعالیت (Functionality) کو ظاہر کرتا ہے۔'
      },
      {
        stem: 'The Use case diagram shows which __________ interact with each use case.',
        options: JSON.stringify({
          a: 'Use case',
          b: 'Actor',
          c: 'Component',
          d: 'Relation'
        }),
        correct: 'b',
        explanation: 'A use case diagram visualizes communication associations showing which external Actors initiate or participate in each use case.',
        urdu_answer: 'یوز کیس ڈایاگرام یہ ظاہر کرتی ہے کہ کون سے ایکٹرز (Actors) کس یوز کیس کے ساتھ تعامل کرتے ہیں۔'
      },
      {
        stem: 'The condition that must be met before the use case can be invoked, is called __________.',
        options: JSON.stringify({
          a: 'Pre-Condition',
          b: 'Post-Condition',
          c: 'Pre-Assertion',
          d: 'Post-Assertion'
        }),
        correct: 'a',
        explanation: 'A Pre-Condition defines the mandatory system state or prerequisites that must be satisfied before a use case can begin execution.',
        urdu_answer: 'وہ شرط جو یوز کیس شروع ہونے سے پہلے پوری ہونا لازمی ہو، پری کنڈیشن (Pre-Condition) کہلاتی ہے۔'
      },
      {
        stem: 'In a use case model, the system boundary is visually represented by a __________.',
        options: JSON.stringify({
          a: 'Ellipse',
          b: 'Rectangle',
          c: 'Circle',
          d: 'Diamond'
        }),
        correct: 'b',
        explanation: 'The system boundary box in a UML use case diagram is drawn as a rectangle enclosing the use cases, with actors placed outside.',
        urdu_answer: 'یوز کیس ماڈل میں سسٹم کی باؤنڈری ایک مستطیل (Rectangle) کے ذریعے دکھائی جاتی ہے۔'
      },
      {
        stem: 'In the case of a "uses" relationship between use cases, one use case __________ the steps defined in another use case.',
        options: JSON.stringify({
          a: 'Invokes',
          b: 'Overrides',
          c: 'Inherits',
          d: 'Extends'
        }),
        correct: 'a',
        explanation: 'The "uses" (or "include") relationship indicates that the base use case explicitly invokes and executes the steps of the included use case as part of its normal workflow.',
        urdu_answer: 'Uses (Include) تعلق میں ایک یوز کیس دوسرے یوز کیس میں بیان کردہ مراحل کو کال یا انووک (Invokes) کرتا ہے۔'
      },
      {
        stem: 'In UML use case diagrams, creating a specialized version of an existing use case is represented by the __________ relationship.',
        options: JSON.stringify({
          a: 'Uses',
          b: 'Extends',
          c: 'Association',
          d: 'Aggregation'
        }),
        correct: 'b',
        explanation: 'The "extends" relationship allows an optional, conditional, or exceptional use case to extend the functionality of a base use case at defined extension points.',
        urdu_answer: 'کسی بنیادی یوز کیس کے مخصوص یا خصوصی ورژن کو Extends تعلق کے ذریعے ظاہر کیا جاتا ہے۔'
      }
    ];

    for (const m of mcqs504L6) {
      ins504L6.run(cl6Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
    }

    // 3 Short Questions (3 marks each)
    const shorts504L6 = [
      {
        stem: 'What is an Elaborated Use Case? Enlist its main components.',
        correct: `1. Definition of Elaborated Use Case:
An Elaborated Use Case is a comprehensive, structured text document that details the complete narrative walkthrough of a use case, describing step-by-step how actors interact with the system under both normal and exceptional circumstances.

2. Main Components of an Elaborated Use Case Template:
• Use Case Name: A concise verb-noun phrase (e.g., 'Borrow Book', 'Authenticate User').
• Primary Actor: The external entity initiating the interaction.
• Pre-Conditions: System state or prerequisites that must be satisfied before the use case can start.
• Main Success Scenario (Typical Flow): The numbered chronological steps of interaction when everything proceeds normally without errors.
• Alternative / Exception Flows: Branching steps handling errors, validation failures, or edge cases.
• Post-Conditions: The guaranteed state of the system after successful execution (e.g., inventory updated, receipt generated).`,
        explanation: 'An elaborated use case is a structured narrative specification with Name, Actors, Pre-conditions, Typical Flow, Alternative Flows, and Post-conditions.',
        urdu_answer: 'ایلبوریٹڈ یوز کیس ایک تفصیلی بیانیہ دستاویز ہے جو یوز کیس کے تمام مراحل کو واضح کرتی ہے۔ اس کے اہم اجزاء میں یوز کیس کا نام، پرائمری ایکٹر، پری کنڈیشنز، مین سکسیس فلو، الٹرنیٹو فلو اور پوسٹ کنڈیشنز شامل ہیں۔'
      },
      {
        stem: "Differentiate between 'uses' (include) and 'extends' relationships in Use Case Diagrams.",
        correct: `Comparison of 'uses' (include) vs. 'extends' Relationships:

1. 'uses' / 'include' Relationship:
• Meaning: A mandatory subroutine call. The base use case unconditionally invokes and incorporates the child use case steps into its normal workflow.
• Purpose: Avoids redundancy by factoring out common, repeated behavior shared across multiple use cases (e.g., 'Validate User Credentials').
• Direction of Arrow: Points from the Base Use Case $\\rightarrow$ Included Use Case.

2. 'extends' Relationship:
• Meaning: An optional or conditional enhancement. The extension use case inserts additional behavior into the base use case only if specific conditions (extension points) are met.
• Purpose: Models optional features, variations, or exception handling without complicating the main base use case.
• Direction of Arrow: Points from the Extension Use Case $\\rightarrow$ Base Use Case (opposite to include).`,
        explanation: 'Uses (include) is mandatory and factors out shared steps; extends is optional/conditional and adds behavior at extension points.',
        urdu_answer: 'Uses (Include) تعلق لازمی ہوتا ہے اور مشترکہ مراحل کو بار بار لکھنے سے بچاتا ہے (بیس یوز کیس سے انکلوڈ کی طرف اشارہ)۔ جبکہ Extends تعلق اختیاری اور مشروط ہوتا ہے جو مخصوص حالت میں اضافی فیچرز شامل کرتا ہے (ایکسٹینشن سے بیس یوز کیس کی طرف اشارہ)۔'
      },
      {
        stem: 'Enlist the major steps/activities required to build a Use Case Model.',
        correct: `Major Activities to Build a Use Case Model:

1. Identify Actors:
Find all human users, external hardware devices, and external software systems that directly interact with the product. Group them by operational roles.

2. Identify High-Level Use Cases:
Determine the primary tasks, goals, and observable results that each actor wants to achieve from the system (expressed as Verb-Noun phrases).

3. Delineate the System Boundary:
Draw the boundary rectangle separating internal system capabilities (use cases) from external actors.

4. Establish Relationships:
Map associations between actors and use cases, and define 'uses' (include) and 'extends' relationships among use cases to eliminate duplication.

5. Write Elaborated Use Cases:
Flesh out the detailed narrative specifications for each use case, detailing typical courses of action, alternative paths, pre-conditions, and post-conditions.`,
        explanation: 'Steps: 1. Identify actors, 2. Identify use cases, 3. Draw system boundary, 4. Establish relationships, 5. Write elaborated specifications.',
        urdu_answer: 'یوز کیس ماڈل بنانے کے بنیادی مراحل: 1. ایکٹرز کی شناخت، 2. یوز کیسز کی نشاندہی، 3. سسٹم باؤنڈری قائم کرنا، 4. ایکٹرز اور یوز کیسز کے تعلقات (uses/extends) طے کرنا، 5. تفصیلی ایلبوریٹڈ یوز کیسز لکھنا۔'
      }
    ];

    for (const s of shorts504L6) {
      ins504L6.run(cl6Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
    }

    // 2 Long Questions (5 marks each)
    const longs504L6 = [
      {
        stem: `Given a scenario for an automated Library Management System, identify the system actors, describe the system boundary, and detail the core use cases and their inter-relationships ('uses' and 'extends').`,
        correct: `Use Case Model for Automated Library Management System:

1. System Boundary:
The system boundary rectangle encompasses all computerized library business processes. External users and automated systems reside outside the boundary.

2. Identification of Actors:
• Member / Borrower: Searches catalog, borrows books, reserves materials, views account loan status.
• Librarian / Staff: Issues books, processes returns, manages catalog records, assesses overdue fines.
• External SMS / Email Gateway: Automated third-party notification service sending loan due-date alerts.

3. Core Use Cases and Functional Descriptions:
• 'Search Book Catalog': Available to both Member and Librarian to query books by title, author, or ISBN.
• 'Borrow Book': Initiated by Member, facilitated by Librarian. Checks item availability, records loan timestamp, and decrements available shelf count.
• 'Return Book': Initiated when a book is checked in. Calculates return status and loan duration.
• 'Pay Overdue Fine': Triggered when returned book exceeds allowed loan duration.

4. Modeling 'uses' (include) and 'extends' Relationships:
• 'uses' (include) Example:
  - Both 'Borrow Book' and 'Reserve Book' have a <<uses>> relationship with 'Authenticate Member'. The authentication steps are mandatorily invoked every time.
• 'extends' Example:
  - 'Calculate Fine' <<extends>> the base use case 'Return Book'. If and only if the return date exceeds the due date (extension point), the fine calculation is triggered. Otherwise, standard return finishes normally.`,
        explanation: 'Defines Library Management actors (Member, Librarian, SMS Gateway), core use cases (Search, Borrow, Return), and illustrates uses (Authenticate) and extends (Calculate Fine).',
        urdu_answer: 'لائبریری سسٹم میں ایکٹرز (طالبعلم، لائبریرین، SMS سروس) ہیں۔ بنیادی یوز کیسز میں Search Book, Borrow Book, Return Book شامل ہیں۔ Borrow Book لازمی طور پر Authenticate Member کو uses کرتا ہے، جبکہ Return Book کو لیٹ واپسی پر Calculate Fine مشروط طور پر extends کرتا ہے۔'
      },
      {
        stem: `Explain Actor Generalization / Inheritance in use case modeling. How does extending a base actor (such as User into Student and Faculty, or Customer into Individual Customer and Corporate Customer) affect use case availability? Provide diagrams/rules and examples.`,
        correct: `Actor Generalization / Inheritance in Use Case Modeling:

1. Concept of Actor Generalization:
• In complex software systems, multiple actors share common functional responsibilities while also maintaining specialized, distinct roles.
• Actor Generalization (Inheritance) allows a specialized child actor to inherit all use case associations and permissions belonging to a generalized parent actor.
• Visual Notation: Represented by an open triangle arrow pointing from the specialized child actor to the general parent actor (identical to UML class inheritance).

2. Concrete Real-World Example: Banking / E-Commerce System
• Generalized Parent Actor: 'Customer'
  - Associated Use Cases: 'Browse Products', 'Search Catalog', 'View Account Profile', 'Change Password'.
• Specialized Child Actor 1: 'Individual Customer'
  - Inherited: Can execute all base 'Customer' use cases.
  - Specialized Use Cases: 'Pay with Credit Card', 'Apply for Personal Loyalty Reward'.
• Specialized Child Actor 2: 'Corporate Customer'
  - Inherited: Can execute all base 'Customer' use cases.
  - Specialized Use Cases: 'Issue Purchase Order (PO)', 'Request Bulk Corporate Discount', 'Assign Employee Sub-Accounts'.

3. Key Rules and Benefits of Actor Generalization:
• The Substitutability Principle: Anywhere the parent actor is permitted to act, the child actor can seamlessly substitute.
• Eliminates Redundancy: Instead of drawing dozens of communication association lines from every individual user type to shared use cases, lines connect only to the base actor.
• Clear Security and Role-Based Access Control (RBAC): System architects easily map parent actors to base security roles and child actors to elevated permission groups.`,
        explanation: 'Actor generalization allows child actors to inherit all use case associations from a parent actor (e.g., Individual and Corporate Customer inheriting from Customer).',
        urdu_answer: 'ایکٹر جنرلائزیشن (Inheritance) میں چائلڈ ایکٹر پیرنٹ ایکٹر کے تمام اختیارات اور یوز کیسز خود بخود حاصل کر لیتا ہے۔ مثلاً Customer کے تمام بنیادی کام (لاگ ان، براؤزنگ) چائلڈ ایکٹرز (Individual اور Corporate Customer) کر سکتے ہیں جبکہ اپنے مخصوص فیچرز الگ سے رکھتے ہیں۔'
      }
    ];

    for (const l of longs504L6) {
      ins504L6.run(cl6Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CS504 — Lecture 7: Source & Sink Analysis and Data Flow Diagram (DFD) Fundamentals
  // ─────────────────────────────────────────────────────────────────────────
  const cs504L7 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 7`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L7) {
    const cs504L7Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 7, ?)`).run(
      cs504.id,
      'Source & Sink Analysis and Data Flow Diagram (DFD) Fundamentals'
    );
    const cl7Id = cs504L7Res.lastInsertRowid;

    const ins504L7 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 9 MCQs
    const mcqs504L7 = [
      {
        stem: 'In ------------ the analyst determines the source of requirements and where do these requirements consume:',
        options: JSON.stringify({
          a: 'Data flow analysis',
          b: 'Source and sink analysis',
          c: 'Down parsing',
          d: 'Up parsing'
        }),
        correct: 'b',
        explanation: 'In Source and Sink Analysis, the system analyst systematically determines where each requirement or data item originates (source) and where it is consumed (sink).',
        urdu_answer: 'سورس اینڈ سنک اینالسس میں اینالسٹ یہ طے کرتا ہے کہ ڈیٹا کا ماخذ (Source) کیا ہے اور یہ کہاں جا کر استعمال (Sink) ہوتا ہے۔'
      },
      {
        stem: 'In Data Flow Diagram (DFD), a process which does not take input is called a __________.',
        options: JSON.stringify({
          a: 'miracle process',
          b: 'core process',
          c: 'secondary process',
          d: 'all of the above'
        }),
        correct: 'a',
        explanation: 'A process that produces outputs without consuming any data inputs is known as a Miracle Process (an illegal DFD defect).',
        urdu_answer: 'DFD میں وہ پروسیس جو کوئی ان پٹ لیے بغیر آؤٹ پٹ دے رہا ہو اسے Miracle Process کہا جاتا ہے۔'
      },
      {
        stem: 'Data cannot flow from one external entity to another external entity because __________.',
        options: JSON.stringify({
          a: 'It will get corrupted',
          b: 'It is not allowed in DFD / External entity has no mechanism to read/write without a process',
          c: 'An external entity has no mechanism to read or write',
          d: 'Both are outside the context of the system'
        }),
        correct: 'b',
        explanation: 'In DFD syntax, direct communication between external entities is prohibited because the software system only governs data transformations processed internally.',
        urdu_answer: 'DFD کے اصولوں کے مطابق دو بیرونی اینٹیٹیز کے درمیان براہ راست ڈیٹا فلو غیر قانونی ہے کیونکہ سافٹ ویئر سسٹم صرف اپنے اندرونی پروسیسز سے گزرنے والے ڈیٹا کو کنٹرول کرتا ہے۔'
      },
      {
        stem: 'Data Store notation in DFDs represents __________.',
        options: JSON.stringify({
          a: 'Data input',
          b: 'Data output',
          c: 'Data input and Data output',
          d: 'none of the given'
        }),
        correct: 'c',
        explanation: 'A Data Store represents passive data at rest, supplying data input when read by processes and accepting data output when updated by processes.',
        urdu_answer: 'ڈیٹا اسٹور (Data Store) بیک وقت ان پٹ دینے اور آؤٹ پٹ موصول کرنے دونوں مقاصد کے لیے استعمال ہوتا ہے۔'
      },
      {
        stem: 'In Data Flow Diagram, the entity or system, outside the boundary of this system is called:',
        options: JSON.stringify({
          a: 'Process',
          b: 'Data flow',
          c: 'External agent',
          d: 'Data store'
        }),
        correct: 'c',
        explanation: 'An external person, organization, hardware device, or external system situated outside the system boundary is termed an External Agent (or Terminator).',
        urdu_answer: 'سسٹم کی باؤنڈری سے باہر موجود اینٹیٹی یا سسٹم کو External Agent (بیرونی ایجنٹ) کہا جاتا ہے۔'
      },
      {
        stem: 'From the following, which is/are illegal data flow(s) in a Data Flow Diagram (DFD)?',
        options: JSON.stringify({
          a: 'External Agents directly communicating with each other',
          b: 'External Agent updating information in a Data Store directly',
          c: 'External Agent accessing information directly from a Data Store',
          d: 'All of the given options'
        }),
        correct: 'd',
        explanation: 'In DFD consistency rules, all data transfers that bypass an intermediate transforming process (Entity-to-Entity, Entity-to-Store, Store-to-Store) are strictly illegal.',
        urdu_answer: 'کسی پروسیس کے بغیر بیرونی ایجنٹس کا آپس میں یا ڈیٹا اسٹور کے ساتھ براہ راست رابطہ DFD کے اصولوں کے تحت غیر قانونی ہے۔'
      },
      {
        stem: 'DFD Notation contains __________.',
        options: JSON.stringify({
          a: 'Data Store',
          b: 'External Agents',
          c: 'Processes',
          d: 'All of the given'
        }),
        correct: 'd',
        explanation: 'The four basic geometric notations in DFD are Processes, External Agents (Terminators), Data Stores, and Data Flows.',
        urdu_answer: 'DFD میں پروسیسز، بیرونی ایجنٹس، ڈیٹا اسٹورز اور ڈیٹا فلوز تمام شامل ہوتے ہیں۔'
      },
      {
        stem: 'In Data Flow Diagram (DFD), one data store cannot directly copy the data from another __________.',
        options: JSON.stringify({
          a: 'Agent',
          b: 'Process',
          c: 'Data store',
          d: 'Flow'
        }),
        correct: 'c',
        explanation: 'Data cannot move directly between two passive data stores; an active process must read data from one store, transform it, and write it to the other.',
        urdu_answer: 'ایک ڈیٹا اسٹور دوسرے ڈیٹا اسٹور سے براہ راست ڈیٹا کاپی نہیں کر سکتا، درمیان میں پروسیس کا ہونا لازمی ہے۔'
      },
      {
        stem: 'Flow charts represent __________ flow, whereas DFD captures data transformations without showing execution sequence.',
        options: JSON.stringify({
          a: 'Sequence',
          b: 'Random',
          c: 'Parallel',
          d: 'None of above'
        }),
        correct: 'a',
        explanation: 'Flowcharts represent sequential control flow (temporal sequence and loops), whereas DFDs illustrate asynchronous, parallel data transformations.',
        urdu_answer: 'فلو چارٹ ترتیب وار کنٹرول فلو (Sequence) دکھاتے ہیں جبکہ DFD بغیر کسی ترتیب کے ڈیٹا کی تبدیلی کے راستوں کو ظاہر کرتی ہے۔'
      }
    ];

    for (const m of mcqs504L7) {
      ins504L7.run(cl7Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
    }

    // 3 Short Questions (3 marks each)
    const shorts504L7 = [
      {
        stem: 'Define Source and Sink Analysis. How does it help in identifying missing or redundant requirements?',
        correct: `1. Definition of Source and Sink Analysis:
Source and Sink Analysis is a systematic requirement verification technique where the analyst inspects every piece of data and operational requirement in the system to determine:
• Source: Where does this information originate? (e.g., entered by an end-user, received from an external API, read from a sensor).
• Sink: Where does this information go and who/what consumes it? (e.g., displayed on a screen, printed as a report, transmitted to an accounting server).

2. How it Identifies Missing or Redundant Requirements:
• Uncovers Missing Requirements (Black Holes & Miracles):
  - If a data item has a Source but no Sink, the system is capturing data that is never utilized (redundant bloat).
  - If a data item has a Sink but no identifiable Source, the system is attempting to output information without capturing the prerequisite input (missing requirement).
• Validates Completeness: Ensures every user requirement has the necessary upstream inputs and downstream consumers mapped out before design begins.`,
        explanation: 'Source and Sink Analysis maps data origins (sources) to consumers (sinks), identifying missing inputs or unconsumed redundant outputs.',
        urdu_answer: 'سورس اینڈ سنک اینالسس میں یہ دیکھا جاتا ہے کہ ڈیٹا کہاں سے آ رہا ہے (Source) اور کہاں استعمال ہو رہا ہے (Sink)۔ اگر کوئی ڈیٹا آ رہا ہو مگر استعمال نہ ہو تو وہ فالتو ہے، اور اگر کسی آؤٹ پٹ کا ان پٹ موجود نہ ہو تو وہ ایک گم شدہ ضرورت (Missing requirement) کو ظاہر کرتا ہے۔'
      },
      {
        stem: 'Differentiate between Data Flow Diagrams (DFD) and Flow Charts.',
        correct: `Comparison of Data Flow Diagrams (DFD) vs. Flow Charts:

1. Data Flow Diagrams (DFD):
• Focus: Models WHAT the system does by tracking data movement and transformations.
• Execution Timing: Asynchronous and parallel; does not specify execution sequence, loops, or timing.
• Symbols: Processes (circles/ovals), Data Stores (open rectangles), External Entities (rectangles), Data Flows (arrows).
• Control Logic: Contains NO decision diamonds (if/else branching) or goto loops.

2. Flow Charts:
• Focus: Models HOW the system executes step-by-step algorithmic logic.
• Execution Timing: Strictly sequential; specifies exact chronological execution order, iterations, and jumps.
• Symbols: Start/Stop (ovals), Processing Steps (rectangles), Decision Branching (diamonds), Directional Control Lines.
• Control Logic: Rich in conditional branching, loops, and temporal sequences.`,
        explanation: 'DFD models parallel data flow without execution sequence; Flow Chart models sequential algorithmic control flow with decision branching.',
        urdu_answer: 'DFD ڈیٹا کی حرکت اور تبدیلیوں کو دکھاتا ہے، اس میں کوئی وقتی ترتیب یا لوپ نہیں ہوتا۔ جبکہ Flow Chart الگورتھم کی مرحلہ وار وقتی ترتیب (Sequence) اور فیصلے (Decision diamonds) دکھاتا ہے۔'
      },
      {
        stem: "Explain what is meant by a 'Miracle Process' and a 'Black Hole' in a Data Flow Diagram.",
        correct: `Illegal Process Defects in Data Flow Diagrams:

1. Miracle Process (Spontaneous Generation):
• Definition: A process that has output data flows leaving it, but NO input data flows entering it.
• Why It is an Error: A software process cannot magically generate data out of nothing without consuming raw input or reading from a data store.
• Correction: Connect an appropriate external agent or data store providing the necessary input parameters.

2. Black Hole (Information Sink without Output):
• Definition: A process that has multiple input data flows entering it, but NO output data flows leaving it.
• Why It is an Error: In software engineering, processes exist solely to transform data for downstream consumers. Absorbing data without producing any output or updating any data store serves no functional purpose.
• Correction: Add outgoing data flows directing transformed results to external agents, data stores, or subsequent processes.

3. Gray Hole:
• A process whose outputs cannot be logically derived from its declared inputs (insufficient input data).`,
        explanation: 'Miracle: Process produces output without any input. Black Hole: Process consumes inputs but produces no output. Both are illegal DFD errors.',
        urdu_answer: 'Miracle Process: ایسا پروسیس جو بغیر کسی ان پٹ کے آؤٹ پٹ پیدا کر رہا ہو۔ Black Hole: ایسا پروسیس جو ان پٹ تو لے رہا ہو مگر کوئی آؤٹ پٹ نہ دے۔ دونوں DFD میں سنگین غلطیاں سمجھی جاتی ہیں۔'
      }
    ];

    for (const s of shorts504L7) {
      ins504L7.run(cl7Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
    }

    // 2 Long Questions (5 marks each)
    const longs504L7 = [
      {
        stem: `List and explain the illegal data flows in Data Flow Diagrams (DFD). Why is direct communication between two External Entities or between an External Entity and a Data Store prohibited?`,
        correct: `Illegal Data Flows and Consistency Rules in DFDs:

1. The Golden Rule of Data Flow Diagrams:
"All data flows in a DFD must begin and/or end at a transforming Process."
Processes are the active components of a software system; passive components (External Entities and Data Stores) cannot initiate, read, or transform data on their own.

2. Major Illegal Data Flows:
• External Agent to External Agent:
  - Error: An external entity cannot directly send data to another external entity in a DFD.
  - Reason: The DFD represents the internal automated software system. Direct communication between two external parties (e.g., a Customer talking directly to a Bank Teller) occurs outside the system boundary and is irrelevant to the software model.
• External Agent to/from Data Store:
  - Error: An external entity cannot directly read from or write to a Data Store.
  - Reason: An external entity has no direct physical or logical access to database disk files without an intermediary software process enforcing security, business logic, validation, and authorization.
• Data Store to Data Store:
  - Error: A data store cannot transfer data directly into another data store.
  - Reason: Data stores are passive repositories (tables, files). Copying or moving data requires a database process, batch script, or transformation routine.

3. Process-Level Illegalities:
• Miracle Process: Generating output flows with zero input flows.
• Black Hole: Consuming input flows with zero output flows.
• Gray Hole: Output fields that cannot be calculated from the available inputs.

4. How to Correct Illegal Flows:
Insert an active transformation process between any illegal pair (e.g., External Agent $\\rightarrow$ [Process] $\\rightarrow$ Data Store).`,
        explanation: 'Direct entity-to-entity, entity-to-store, and store-to-store flows are prohibited because all data movement must be mediated by an active transforming process.',
        urdu_answer: 'DFD میں تمام ڈیٹا فلو کا کسی نہ کسی پروسیس سے جڑنا لازمی ہے۔ بیرونی ایجنٹس کا آپس میں یا ڈیٹا اسٹور سے براہ راست رابطہ ممنوع ہے کیونکہ بیرونی ایجنٹ سیکیورٹی اور بزنس لاجک کے بغیر ڈیٹا بیس تک نہیں پہنچ سکتا۔'
      },
      {
        stem: `Given a DFD scenario (such as a Leave Application System or Member Account Processing System), explain how to detect defects using Source and Sink Analysis and demonstrate step-by-step how to correct illegal connections, miracles, and black holes.`,
        correct: `Defect Detection and Correction in DFDs using Source and Sink Analysis:

1. Scenario Context:
Consider a university 'Leave Application Processing System' with entities: 'Faculty Member', 'Department Chair', and a data store 'Leave_Record'.

2. Common Defects Detected via Source and Sink Analysis:
• Defect 1: External Agent to External Agent:
  - Observation: 'Faculty Member' directly sends 'Application Letter' arrow to 'Department Chair'.
  - Problem: Bypasses the software system completely.
  - Correction: Route the data flow from 'Faculty Member' into Process 1.0 ('Submit Leave Request'), which validates the form and forwards a notification to 'Department Chair'.
• Defect 2: External Agent directly writing to Data Store:
  - Observation: 'Faculty Member' sends an arrow directly into 'Leave_Record' data store.
  - Problem: Illegal access; no authorization or date validation occurs.
  - Correction: Route data through Process 1.0, which validates remaining leave balance and writes authorized records to 'Leave_Record'.
• Defect 3: Black Hole in Process 2.0 ('Archive Records'):
  - Observation: Process receives 'Approved Leave' from Chair and 'Leave Details' from Store, but has no outgoing arrows.
  - Problem: Data is absorbed without generating status updates or audit confirmation.
  - Correction: Add an outgoing data flow 'Archive Confirmation' to the Chair or an updated audit log.
• Defect 4: Miracle in Process 3.0 ('Generate Leave Report'):
  - Observation: Process outputs 'Monthly Summary Report' to Dean, but has no input data flow.
  - Problem: Output is produced out of thin air.
  - Correction: Add an input data flow from 'Leave_Record' data store supplying historical leave data.

3. Verification Checklist:
• Every process has at least one valid input and at least one valid output.
• Every data store is connected exclusively to processes.
• All data flows crossing the system boundary link an external entity to an internal process.`,
        explanation: 'Use Source and Sink Analysis to identify disconnected flows, insert processes between illegal entity/store connections, and resolve black holes and miracles.',
        urdu_answer: 'سورس اینڈ سنک اینالسس کے ذریعے ہم DFD کی غلطیاں پکڑتے ہیں: بیرونی ایجنٹ اور ڈیٹا اسٹور کے درمیان پروسیس داخل کرتے ہیں، بلیک ہولز میں آؤٹ پٹ فلو شامل کرتے ہیں اور معجزاتی (Miracle) پروسیسز کو ان پٹ فلو فراہم کرتے ہیں۔'
      }
    ];

    for (const l of longs504L7) {
      ins504L7.run(cl7Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CS504 — Lecture 8: DFD Leveling, Balancing & Data Dictionary
  // ─────────────────────────────────────────────────────────────────────────
  const cs504L8 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 8`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L8) {
    const cs504L8Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 8, ?)`).run(
      cs504.id,
      'DFD Leveling, Balancing & Data Dictionary'
    );
    const cl8Id = cs504L8Res.lastInsertRowid;

    const ins504L8 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 8 MCQs
    const mcqs504L8 = [
      {
        stem: 'A DFD is normally leveled (adding more levels of abstraction) as __________.',
        options: JSON.stringify({
          a: 'it is a good idea in design',
          b: 'it is recommended by many experts',
          c: 'it is easy to do it',
          d: 'it is easier to read and understand a number of smaller DFDs than one large DFD'
        }),
        correct: 'd',
        explanation: 'Leveling divides complex architectures into clean hierarchical levels, making a series of smaller diagrams far easier to comprehend than a single monolithic diagram.',
        urdu_answer: 'ایک بڑے پیچیدہ ڈایاگرام کے مقابلے میں چھوٹے اور منظم لیول والے DFDs کو پڑھنا اور سمجھنا زیادہ آسان ہوتا ہے۔'
      },
      {
        stem: 'By levelling a DFD (adding more levels of abstraction) we mean __________.',
        options: JSON.stringify({
          a: 'Splitting it into different levels',
          b: 'Make its structure uniform',
          c: 'Expanding a process into one with more sub-processes giving more detail',
          d: 'Summarizing a DFD to specify only the essentials'
        }),
        correct: 'c',
        explanation: 'DFD leveling (functional decomposition) expands a parent process bubble into a more detailed child DFD composed of multiple sub-processes.',
        urdu_answer: 'DFD لیولنگ کا مطلب کسی پیرنٹ پروسیس کو کھول کر مزید تفصیلی ذیلی پروسیسز (sub-processes) میں تقسیم کرنا ہے۔'
      },
      {
        stem: 'In a top-down system analysis, an analyst is required to develop __________ view of the system at first.',
        options: JSON.stringify({
          a: 'Detailed',
          b: 'Low level',
          c: 'High level',
          d: 'Physical'
        }),
        correct: 'c',
        explanation: 'Top-down analysis mandates constructing the highest-level architectural perspective (Context Level DFD) before decomposing into low-level details.',
        urdu_answer: 'ٹاپ ڈاؤن اینالسس میں اینالسٹ سب سے پہلے سسٹم کا ہائی لیول ویو (Context diagram) تیار کرتا ہے۔'
      },
      {
        stem: 'Level 1 data flow diagram is the refinement / elaboration of __________.',
        options: JSON.stringify({
          a: 'Level 2 DFD',
          b: 'Context level (0-level) DFD',
          c: 'Level 3 DFD',
          d: 'Use case diagram'
        }),
        correct: 'b',
        explanation: 'A Level-1 DFD is the direct functional elaboration of the single central process represented in the Level-0 Context Diagram.',
        urdu_answer: 'لیول 1 DFD دراصل کانٹیکسٹ لیول (0-level) DFD کے مرکزی پروسیس کی پہلی تفصیلی وضاحت ہوتی ہے۔'
      },
      {
        stem: 'If a context level diagram contains three external agents providing inputs and receiving outputs, the number of external agents in Level 1 DFD must be __________.',
        options: JSON.stringify({
          a: 'Increased to show detail',
          b: 'Decreased',
          c: 'Exactly the same (to maintain inter-level consistency)',
          d: 'Variable depending on implementation'
        }),
        correct: 'c',
        explanation: 'Inter-level consistency (DFD balancing) dictates that all external entities present at Level 0 must remain identical in quantity and identity at Level 1.',
        urdu_answer: 'انٹر لیول کنسسٹنسی (Balancing) برقرار رکھنے کے لیے لیول 1 میں بیرونی ایجنٹس کی تعداد بالکل وہی ہونی چاہیے جو لیول 0 میں تھی۔'
      },
      {
        stem: 'In a 0-level (Context) Data Flow Diagram, how many processes/transforms are represented?',
        options: JSON.stringify({
          a: 'Only one process (representing the entire system as a black box)',
          b: 'Two processes',
          c: 'Multiple processes',
          d: 'No process'
        }),
        correct: 'a',
        explanation: 'The Level-0 Context Diagram models the entire application as exactly one central process (Process 0).',
        urdu_answer: '0-لیول (کانٹیکسٹ) DFD میں صرف ایک پروسیس ببل ہوتا ہے جو پورے سسٹم کو ایک بلیک باکس کے طور پر ظاہر کرتا ہے۔'
      },
      {
        stem: 'The Data dictionary contains description of each software __________.',
        options: JSON.stringify({
          a: 'Configuration item',
          b: 'Data object',
          c: 'Diagram',
          d: 'Notation'
        }),
        correct: 'b',
        explanation: 'The Data Dictionary provides organized definitions and structural compositions of every data object, attribute, and data flow in the system.',
        urdu_answer: 'ڈیٹا ڈکشنری میں سسٹم کے ہر ڈیٹا آبجیکٹ (Data object) اور اس کے اجزاء کی تفصیلی وضاحت درج ہوتی ہے۔'
      },
      {
        stem: 'In DFD balancing rules, if Process 2.0 produces an output data flow "Receipt", then its child Level-2 DFD:',
        options: JSON.stringify({
          a: 'Can omit Receipt if it is internal',
          b: 'Must have at least one sub-process that produces Receipt as an external output',
          c: 'Must rename Receipt',
          d: 'Should delete Receipt'
        }),
        correct: 'b',
        explanation: 'Balancing mandates that any data flow leaving a parent process must be produced by one of the child sub-processes in its decomposed lower-level DFD.',
        urdu_answer: 'DFD بیلنسنگ کا اصول ہے کہ پیرنٹ پروسیس سے نکلنے والا ہر آؤٹ پٹ فلو چائلڈ DFD کے کسی نہ کسی پروسیس سے ضرور نکلنا چاہیے۔'
      }
    ];

    for (const m of mcqs504L8) {
      ins504L8.run(cl8Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
    }

    // 3 Short Questions (3 marks each)
    const shorts504L8 = [
      {
        stem: 'What is DFD Leveling? Why do we level a Data Flow Diagram instead of creating one massive diagram?',
        correct: `1. Definition of DFD Leveling:
DFD Leveling (or Functional Decomposition) is the structured engineering practice of partitioning a software system's data flows into a hierarchical sequence of nested diagrams, starting from a high-level black-box perspective and decomposing into finer operational detail at successive levels (Level 0 $\\rightarrow$ Level 1 $\\rightarrow$ Level 2).

2. Why We Level a DFD (Instead of One Massive Diagram):
• Mitigates Cognitive Overload: A monolithic, flat DFD depicting hundreds of processes, data stores, and arrows becomes an unreadable "spaghetti" diagram.
• Top-Down Abstraction: Allows non-technical executives to review high-level business functions (Level 0 and Level 1), while developers and database designers focus on granular sub-processes (Level 2 and Level 3).
• Modularity & Maintainability: Individual subsystems can be updated, reviewed, or refactored independently without invalidating the entire enterprise model.`,
        explanation: 'Leveling organizes diagrams into a hierarchy (Level 0 -> 1 -> 2) to manage complexity, prevent cognitive overload, and enable modular system design.',
        urdu_answer: 'لیولنگ سے مراد DFD کو ایک بڑے الجھے ہوئے چارٹ کے بجائے ایک منظم درجہ بندی (Level 0 -> Level 1 -> Level 2) میں تقسیم کرنا ہے۔ اس سے سسٹم کو سمجھنا آسان ہو جاتا ہے اور غیر تکنیکی اور تکنیکی افراد اپنی ضرورت کے مطابق تفصیل دیکھ سکتے ہیں۔'
      },
      {
        stem: 'Define Inter-level Consistency (DFD Balancing). What error occurs when a Level-1 DFD introduces an external entity not present in Level-0?',
        correct: `1. Definition of Inter-level Consistency (Balancing):
DFD Balancing is the conservation law governing multi-level DFDs. It dictates that all inputs entering and all outputs exiting a parent process must precisely match the aggregate inputs and outputs entering and exiting its child decomposed DFD.

2. The Error of Introducing an Unauthorized External Entity in Level 1:
• Boundary Violation / Inconsistent Scope:
  The Context Diagram (Level 0) formally defines the absolute scope boundary of the software system. All external entities (sources and sinks) must be declared at Level 0.
• Resulting Defect:
  Introducing a new external entity at Level 1 that was omitted from Level 0 creates an Inter-Level Balancing Violation. It signifies an uncontrolled scope change or an incomplete Level-0 boundary.
• Required Correction: The analyst must either add the missing external entity and its associated data flows to Level 0 or remove it from Level 1.`,
        explanation: 'Balancing requires that inputs, outputs, and external entities match across levels. Adding an entity in Level 1 not in Level 0 is a serious boundary violation.',
        urdu_answer: 'انٹر لیول کنسسٹنسی (Balancing) کا مطلب ہے کہ پیرنٹ اور چائلڈ لیولز کے درمیان ان پٹ، آؤٹ پٹ اور بیرونی ایجنٹس کا توازن برقرار رہے۔ لیول 1 میں کسی ایسے بیرونی ایجنٹ کا آنا جو لیول 0 میں نہ ہو باؤنڈری کی خلاف ورزی (Balancing Violation) کہلاتا ہے۔'
      },
      {
        stem: 'What is a Data Dictionary? What role does it play alongside Data Flow Diagrams in structured analysis?',
        correct: `1. Definition of Data Dictionary:
A Data Dictionary is a centralized, organized repository of metadata providing formal definitions, descriptions, composition rules, and data types for every data flow, data store, process, and data element referenced in a Data Flow Diagram.

2. Essential Role Alongside DFDs:
• Eliminates Ambiguity in Data Flow Names:
  A DFD shows arrows with labels like 'Student_Record' or 'Payment_Info', but does not reveal their internal structure. The Data Dictionary specifies the exact composition:
  $$\\text{Student\\_Record} = \\text{Student\\_ID} + \\text{Name} + \\text{Address} + \\text{Phone} + (\\text{Email})$$
• Defines Data Types and Value Constraints:
  Specifies data types (e.g., Integer, String, Date), acceptable ranges, validation checks, and foreign key relationships.
• Ensures Enterprise Consistency:
  Prevents duplicate synonyms or conflicting definitions across different development and QA testing teams.`,
        explanation: 'Data dictionary defines the composition, data types, and constraints of every data flow and store shown in a DFD, eliminating naming ambiguity.',
        urdu_answer: 'ڈیٹا ڈکشنری ایک ایسی سنٹرل دستاویز ہے جو DFD میں استعمال ہونے والے تمام ناموں اور تیروں کے اندر موجود ڈیٹا کی ساخت (جیسے نام، پتہ، فون نمبر اور ڈیٹا ٹائپ) کی مکمل تکنیکی تفصیل فراہم کرتی ہے۔'
      }
    ];

    for (const s of shorts504L8) {
      ins504L8.run(cl8Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
    }

    // 2 Long Questions (5 marks each)
    const longs504L8 = [
      {
        stem: `Explain the concepts of Level-0 (Context Diagram), Level-1 DFD, and Level-2 DFD using an example (such as a Patient Monitoring System). Describe how a process is decomposed from Level 1 to Level 2 while maintaining inputs, outputs, and external entities.`,
        correct: `Multi-Level DFD Hierarchy for a Patient Monitoring System:

1. Level-0: Context Diagram (The System Boundary)
• System Representation: The entire hospital patient monitoring software is modeled as a single central bubble: Process 0 ('Patient Monitoring System').
• External Entities:
  - 'Patient Sensors': Provides vital inputs (Heart_Rate, Blood_Pressure, Temperature).
  - 'Nurse / Doctor': Receives output alerts (Warning_Alarm, Vital_Signs_Display) and inputs configuration commands (Threshold_Settings).
• Role: Sets the absolute operational boundary; shows zero internal data stores.

2. Level-1 DFD: Primary Subsystem Decomposition
Process 0 is decomposed into core functional processes:
• Process 1.0: 'Receive Sensor Signals' (reads sensor data, filters noise).
• Process 2.0: 'Analyze Vitals' (compares readings against safe limits).
• Process 3.0: 'Generate Alarms' (dispatches visual/auditory alarms to Nurse).
• Process 4.0: 'Store Patient History' (writes to Data Store 'Patient_History').
• Balancing Check: All inputs from 'Patient Sensors' and outputs to 'Nurse' defined in Level 0 are conserved exactly across these 4 processes.

3. Level-2 DFD: Granular Functional Decomposition
Take Process 2.0 ('Analyze Vitals') and explode it into sub-processes (child DFD):
• Process 2.1: 'Read Upper/Lower Thresholds' (reads Threshold data from store).
• Process 2.2: 'Compare Current Vitals with Thresholds' (performs logic check).
• Process 2.3: 'Flag Critical Deviations' (routes critical flags to alarm queue).
• Conservation Rule:
  - The net inputs entering Process 2.0 (Sensor_Data and Thresholds) enter sub-processes 2.1 and 2.2.
  - The net output leaving Process 2.0 (Critical_Alert_Signal) exits sub-process 2.3.
  - No new external entities appear inside Level 2.`,
        explanation: 'Illustrates top-down decomposition using Patient Monitoring System: Level 0 (single process) -> Level 1 (major subsystems) -> Level 2 (granular sub-processes), conserving boundary flows.',
        urdu_answer: 'پیشنٹ مانیٹرنگ سسٹم کی مثال: لیول 0 پر پورے سسٹم کا ایک پروسیس اور دو بیرونی ایجنٹ (مریض کے سینسرز اور نرس) ہوتے ہیں۔ لیول 1 پر اسے 4 ذیلی پروسیسز میں تقسیم کیا جاتا ہے۔ لیول 2 پر ایک پروسیس (Analyze Vitals) کو کھول کر مزید باریک مراحل میں توڑا جاتا ہے جبکہ ان پٹ اور آؤٹ پٹ کا توازن برقرار رہتا ہے۔'
      },
      {
        stem: `A student drew a Level-1 DFD for an enterprise system. Upon review, the evaluator flagged inter-level inconsistency between Level 0 and Level 1. Explain what causes inter-level inconsistency and detail the rules required to keep DFD levels balanced.`,
        correct: `Inter-Level Inconsistency and DFD Balancing Rules:

1. What Causes Inter-Level Inconsistency?
Inconsistency arises when a lower-level DFD does not faithfully represent the boundary contracts established by its parent diagram:
• Missing Inputs or Outputs: A data flow entering or exiting Process $X$ in Level 0/1 is completely missing from the child diagram.
• Spontaneous Flows (Miracle Injections): A child diagram introduces a new external entity or boundary flow that was never declared in the parent diagram.
• Renamed or Split Flows without Data Dictionary Mapping: Changing the label of a data flow without defining the alias or decomposition in the Data Dictionary (e.g., parent flow is 'Address', but child shows 'Street + City' without dictionary specification).
• Data Store Scope Violations: Showing a data store at Level 0 (where stores are prohibited) or hiding a global data store shared by multiple Level 1 processes.

2. Rigorous Rules to Keep DFD Levels Balanced:
• Conservation of Inputs and Outputs:
  $$\\sum \\text{Inputs}_{\\text{Parent Process}} = \\sum \\text{Inputs}_{\\text{Child DFD}}$$
  $$\\sum \\text{Outputs}_{\\text{Parent Process}} = \\sum \\text{Outputs}_{\\text{Child DFD}}$$
• External Entity Conservation:
  External entities appear ONLY at the highest levels to establish the boundary. A child DFD decomposing an internal process must NOT introduce new external entities.
• Data Flow Splitting / Aggregation Rule:
  If a composite data flow (e.g., 'Customer_Details') entering a parent process is split into separate constituent streams (e.g., 'Contact_Info' and 'Billing_Info') in the child DFD, the Data Dictionary must formally document that:
  $$\\text{Customer\\_Details} = \\text{Contact\\_Info} + \\text{Billing\\_Info}$$
• Numbering Scheme Consistency:
  Parent Process $1.0$ decomposes into child processes $1.1, 1.2, 1.3, \\dots$ Child process $1.2$ decomposes into $1.2.1, 1.2.2, \\dots$ maintaining clear hierarchical lineage.`,
        explanation: 'Inconsistencies stem from missing/extra flows or mismatched external entities. Balancing rules enforce input/output conservation, strict numbering hierarchy, and dictionary composition.',
        urdu_answer: 'ان کنسسٹنسی اس وقت پیدا ہوتی ہے جب چائلڈ DFD میں پیرنٹ کا کوئی ان پٹ/آؤٹ پٹ غائب ہو یا نیا بیرونی ایجنٹ شامل کر دیا جائے۔ بیلنسنگ کے لیے ضروری ہے کہ ان پٹ اور آؤٹ پٹ کا مجموعہ برابر ہو، نمبرنگ اسٹرکچر درست ہو (1.0 -> 1.1, 1.2) اور ڈیٹا ڈکشنری کے قوانین فالو ہوں۔'
      }
    ];

    for (const l of longs504L8) {
      ins504L8.run(cl8Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CS504 — Lecture 9: Function Point Analysis: Transactional Function Types (EI, EO, EQ)
  // ─────────────────────────────────────────────────────────────────────────
  const cs504L9 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 9`).get(cs504.id) as { id: number } | undefined;
  if (!cs504L9) {
    const cs504L9Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 9, ?)`).run(
      cs504.id,
      'Function Point Analysis: Transactional Function Types (EI, EO, EQ)'
    );
    const cl9Id = cs504L9Res.lastInsertRowid;

    const ins504L9 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // 6 MCQs
    const mcqs504L9 = [
      {
        stem: 'An elementary process that sends data or control information outside the application boundary, whose primary intent is to present information to a user through processing logic containing mathematical formulas or calculations, or creating derived data, is called an __________.',
        options: JSON.stringify({
          a: 'External Input (EI)',
          b: 'External Output (EO)',
          c: 'External Inquiry (EQ)',
          d: 'Internal Logical File (ILF)'
        }),
        correct: 'b',
        explanation: 'External Output (EO) produces information for users or external systems and MUST contain processing logic with calculations, mathematical formulas, or derived data creation.',
        urdu_answer: 'ایکسٹرنل آؤٹ پٹ (EO) وہ پروسیس ہے جو معلومات پیش کرتا ہے اور اس کی پروسیسنگ لاجک میں حسابی فارمولے (Mathematical calculations) یا Derived Data لازمی شامل ہوتا ہے۔'
      },
      {
        stem: 'An elementary process that sends data or control information outside the application boundary where processing logic contains NO mathematical formulas or calculations, and creates NO derived data, is called an __________.',
        options: JSON.stringify({
          a: 'External Input (EI)',
          b: 'External Output (EO)',
          c: 'External Inquiry (EQ)',
          d: 'External Interface File (EIF)'
        }),
        correct: 'c',
        explanation: 'External Inquiry (EQ) presents pure data retrieval results without performing mathematical calculations or creating derived data.',
        urdu_answer: 'ایکسٹرنل انکوائری (EQ) وہ ریڈ اونلی آؤٹ پٹ ہے جس میں کوئی حسابی فارمولا یا Derived Data شامل نہیں ہوتا۔'
      },
      {
        stem: 'The primary intent of an External Input (EI) is to __________.',
        options: JSON.stringify({
          a: 'Present information to a user',
          b: 'Maintain one or more ILFs and/or alter the behavior of the system',
          c: 'Perform mathematical calculations without saving',
          d: 'Perform read-only retrieval from an external database'
        }),
        correct: 'b',
        explanation: 'The Primary Intent (PI) of an External Input (EI) is to maintain one or more Internal Logical Files (ILFs) through create, update, or delete operations and/or alter system behavior.',
        urdu_answer: 'ایکسٹرنل ان پٹ (EI) کا بنیادی مقصد اندرونی فائلوں (ILFs) کو اپ ڈیٹ / مینٹین کرنا یا سسٹم کے طرز عمل کو تبدیل کرنا ہے۔'
      },
      {
        stem: 'Which of the following function types MUST contain at least one mathematical formula/calculation or create derived data?',
        options: JSON.stringify({
          a: 'External Inquiry (EQ)',
          b: 'External Output (EO)',
          c: 'Internal Logical File (ILF)',
          d: 'External Interface File (EIF)'
        }),
        correct: 'b',
        explanation: 'An EO is distinct from an EQ specifically because it must contain at least one mathematical formula/calculation, create derived data, or maintain an ILF during processing.',
        urdu_answer: 'External Output (EO) میں کم از کم ایک حسابی فارمولا یا اخذ شدہ ڈیٹا (Derived data) کا ہونا لازمی ہے۔'
      },
      {
        stem: 'In tabular representation of transactional function types, which function allows "Primary Intent (PI)" for presenting information to the user WITHOUT altering system behavior or maintaining ILFs?',
        options: JSON.stringify({
          a: 'EI',
          b: 'EO',
          c: 'EQ',
          d: 'ILF'
        }),
        correct: 'c',
        explanation: 'External Inquiry (EQ) has the Primary Intent of presenting information to the user without maintaining ILFs or altering system behavior.',
        urdu_answer: 'سسٹم بی ہیویئر بدلے بغیر یا ILFs مینٹین کیے بغیر خالص معلومات پیش کرنے کا بنیادی مقصد (Primary Intent) صرف EQ میں ہوتا ہے۔'
      },
      {
        stem: 'In Function Point Analysis (FPA), Transactional Functions (EI, EO, EQ) represent:',
        options: JSON.stringify({
          a: 'Data at rest stored in tables',
          b: 'Functionality provided to the user to process data moving into or out of the system boundary',
          c: 'Source lines of code (SLOC)',
          d: 'Hardware memory utilization'
        }),
        correct: 'b',
        explanation: 'Transactional functions quantify the dynamic functionality provided to end-users to process data crossing the application boundary.',
        urdu_answer: 'ٹرانزیکشنل فنکشنز سسٹم کی باؤنڈری کے اندر یا باہر حرکت کرنے والے ڈیٹا کی پروسیسنگ صلاحیتوں کی پیمائش کرتے ہیں۔'
      }
    ];

    for (const m of mcqs504L9) {
      ins504L9.run(cl9Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
    }

    // 3 Short Questions (3 marks each)
    const shorts504L9 = [
      {
        stem: 'Enlist the three transactional function types used in Function Point Analysis (FPA) with a brief definition for each.',
        correct: `The Three Transactional Function Types in Function Point Analysis (IFPUG FPA):

1. External Input (EI):
• Definition: An elementary process that processes data or control information originating from outside the application boundary.
• Primary Intent: To maintain one or more Internal Logical Files (ILFs) via INSERT, UPDATE, or DELETE operations and/or alter system behavior.

2. External Output (EO):
• Definition: An elementary process that transmits processed information or control signals outside the application boundary.
• Requirement: Processing logic MUST contain at least one mathematical formula, algorithmic calculation, or creation of derived data.

3. External Inquiry (EQ):
• Definition: An elementary process that retrieves data from internal or external stores and presents it outside the boundary.
• Requirement: Pure data retrieval with NO mathematical formulas, NO calculations, and NO creation of derived data.`,
        explanation: 'The three transactional function types are External Input (EI), External Output (EO), and External Inquiry (EQ).',
        urdu_answer: 'FPA میں تین ٹرانزیکشنل فنکشنز ہیں: 1. External Input (EI): باہر سے ڈیٹا لا کر اندرونی فائلیں اپ ڈیٹ کرنا۔ 2. External Output (EO): حسابی فارمولوں اور ڈیرائیوڈ ڈیٹا کے ساتھ معلومات فراہم کرنا۔ 3. External Inquiry (EQ): بغیر کسی فارمولے کے سادہ سرچ یا ڈیٹا ڈسپلے کرنا۔'
      },
      {
        stem: 'Differentiate between External Output (EO) and External Inquiry (EQ) with respect to processing logic.',
        correct: `Comparison of Processing Logic: External Output (EO) vs. External Inquiry (EQ):

1. External Output (EO):
• Mathematical Calculations: MUST contain at least one mathematical formula or algorithmic computation.
• Derived Data: Creates derived data (e.g., calculating Total_Amount = Quantity * Price, or calculating GPA).
• ILF Maintenance: May optionally maintain an ILF or alter system behavior during execution (e.g., logging a print event).
• Primary Intent: To present information that has undergone computational transformation.

2. External Inquiry (EQ):
• Mathematical Calculations: Contains NO mathematical formulas or computations.
• Derived Data: Creates NO derived data; presents existing stored values verbatim.
• ILF Maintenance: Does NOT maintain any ILF or alter system behavior.
• Primary Intent: Simple, direct retrieval of stored data from ILFs or EIFs (e.g., View Customer Address).`,
        explanation: 'EO must contain calculations or create derived data; EQ is pure retrieval without formulas or derived data.',
        urdu_answer: 'EO میں حسابی فارمولے (Calculations) اور نیا اخذ شدہ ڈیٹا (Derived data) ہونا لازمی ہوتا ہے (جیسے بل کی کل رقم نکالنا)۔ جبکہ EQ میں کوئی حسابی فارمولا نہیں ہوتا بلکہ پہلے سے موجود ڈیٹا کو سادہ طریقے سے اسکرین پر دکھایا جاتا ہے۔'
      },
      {
        stem: 'What is an External Input (EI)? State its primary intent and provide two examples.',
        correct: `External Input (EI):

1. Definition:
An External Input (EI) is an elementary process that captures data or control information crossing from outside the application boundary into the system.

2. Primary Intent (PI):
The primary intent of an EI is to:
• Maintain one or more Internal Logical Files (ILFs) through create, update, or delete operations.
• Alter the operational behavior of the software system (e.g., changing system configuration parameters or workflow states).

3. Concrete Examples:
• Adding a new student profile into the university database (creates a record in the Student ILF).
• Submitting an online credit card payment that updates the customer's account balance.`,
        explanation: 'EI processes data entering the system with primary intent to maintain ILFs (insert/update/delete) or alter system behavior.',
        urdu_answer: 'External Input (EI) وہ عمل ہے جو بیرونی ڈیٹا موصول کر کے ڈیٹا بیس کی فائلوں (ILFs) کو تبدیل یا محفوظ کرتا ہے۔ مثال: نیا صارف رجسٹر کرنا یا پروڈکٹ کی قیمت اپ ڈیٹ کرنا۔'
      }
    ];

    for (const s of shorts504L9) {
      ins504L9.run(cl9Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
    }

    // 2 Long Questions (5 marks each)
    const longs504L9 = [
      {
        stem: `Explain the classification of Transactional Function Types (EI, EO, EQ) using a tabular format. Describe how Primary Intent (PI) determines whether a given system function is an EI, EO, or EQ.`,
        correct: `Classification of Transactional Function Types (IFPUG Standards):

1. Comparative Tabular Matrix:

Function Type | Primary Intent (PI) | Alter System Behavior | Maintain ILFs | Calculations / Derived Data
EI            | Maintain ILFs / Alter Behavior | Yes (Primary or Secondary) | Yes (Primary) | Optional
EO            | Present Derived Info to User   | Optional                    | Optional      | Mandatory (At least 1)
EQ            | Present Stored Info to User    | No                          | No            | Prohibited (None)

2. Role of Primary Intent (PI) in Determination:
Every functional transaction is evaluated by its primary purpose from the user's perspective:
• Case 1: If the user's primary purpose is to modify persistent database records or trigger state changes (e.g., saving user input), it is classified as an External Input (EI). Any feedback message (e.g., "Record Saved Successfully") is secondary.
• Case 2: If the user's primary purpose is to retrieve and view processed information that requires algorithms, statistical aggregations, tax computations, or financial interest compounding, it is classified as an External Output (EO).
• Case 3: If the user's primary purpose is solely to look up or view existing stored facts without performing arithmetic transformations (e.g., displaying product specs), it is classified as an External Inquiry (EQ).`,
        explanation: 'Table contrasts EI (maintain ILF), EO (present calculated info), and EQ (present pure retrieval). Primary intent dictates the classification.',
        urdu_answer: 'جدول میں تینوں اقسام کا موازنہ: EI کا بنیادی مقصد ڈیٹا بیس اپ ڈیٹ کرنا ہے۔ EO کا بنیادی مقصد حسابی فارمولوں کے ساتھ نتائج دکھانا ہے۔ جبکہ EQ کا مقصد بغیر کسی تبدیلی کے سادہ ڈیٹا سرچ کرنا ہے۔ پرائمری انٹینٹ (بنیادی مقصد) ہی فنکشن کی صحیح کلاس کا تعین کرتا ہے۔'
      },
      {
        stem: `Given the following set of system functions for a commercial Banking & Retail application, classify each function into EI, EO, or EQ with complete technical justification:
1. 'Add New Customer Profile'
2. 'Calculate Monthly Compound Interest and Print Account Statement'
3. 'Search Product Price by SKU Code'
4. 'Update Employee Salary Structure'
5. 'Generate Sales Performance Trend Graph with Quarterly Projections'`,
        correct: `Classification and Technical Justification of System Functions:

1. 'Add New Customer Profile':
• Classification: External Input (EI)
• Justification: The primary intent is to capture customer contact data crossing the boundary and write a new record into the Customer Internal Logical File (ILF).

2. 'Calculate Monthly Compound Interest and Print Account Statement':
• Classification: External Output (EO)
• Justification: The process sends information outside the system boundary to the user. Its processing logic contains complex mathematical financial formulas ($A = P(1 + r/n)^{nt}$) and creates derived interest amounts that did not previously exist in raw storage.

3. 'Search Product Price by SKU Code':
• Classification: External Inquiry (EQ)
• Justification: The user submits an SKU code to retrieve the stored retail price. The processing logic involves simple table lookup and indexing with NO mathematical formulas, NO calculations, and NO derived data creation.

4. 'Update Employee Salary Structure':
• Classification: External Input (EI)
• Justification: The primary intent is to modify existing records in the Employee and Payroll ILFs and alter the subsequent operational calculation behavior of the payroll subsystem.

5. 'Generate Sales Performance Trend Graph with Quarterly Projections':
• Classification: External Output (EO)
• Justification: Sends analytical projections outside the boundary. The processing logic executes statistical trend forecasting algorithms (e.g., linear regression) and generates derived predictive metrics.`,
        explanation: 'Add Customer = EI (writes ILF). Compound Interest = EO (financial math). Search Price = EQ (pure retrieval). Update Salary = EI (modifies ILF). Sales Projections = EO (statistical forecasting math).',
        urdu_answer: '1. Add Customer = EI (ڈیٹا بیس میں اندراج)۔ 2. Calculate Interest = EO (حسابی فارمولا اور نیا اخذ شدہ ڈیٹا)۔ 3. Search Product Price = EQ (سادہ تلاش، بغیر فارمولا)۔ 4. Update Salary = EI (ڈیٹا بیس فائل میں ترمیم)۔ 5. Sales Projections = EO (شماریاتی تجزیہ اور پیش گوئی)۔'
      }
    ];

    for (const l of longs504L9) {
      ins504L9.run(cl9Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
    }
  }

  const cs201 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs201'`).get();
  if (!cs201) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES ('Introduction to Programming', 'cs201', 'CS201', 'Structured programming logic, control structures, and algorithms using modern C++ Ã¢â‚¬â€ Virtual University')
    `).run();
    const sId = res.lastInsertRowid;
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 1, 'C++ Basics, Operators & Control Structures')`).run(sId);
    const lId = lRes.lastInsertRowid;
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes)
      VALUES (?, 'mcq', 'Which standard header file must be included in C++ to utilize cout and cin streams?', ?, 'c', '<iostream> defines the standard input/output stream objects in C++.', 1, 1)
    `).run(lId, JSON.stringify({ a: '<stdlib.h>', b: '<conio.h>', c: '<iostream>', d: '<iomanip>' }));
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes)
      VALUES (?, 'short', 'Explain the operational distinction between while loop and do-while loop in C++.', ?, 'while tests the condition before iteration; do-while executes at least once before testing.', 3, 3)
    `).run(lId, `1. while Loop (Entry-Controlled):
Ã¢â‚¬Â¢ Evaluates the test condition BEFORE executing the body.
Ã¢â‚¬Â¢ If the condition evaluates to false initially, the loop body executes zero times.

2. do-while Loop (Exit-Controlled):
Ã¢â‚¬Â¢ Executes the loop body FIRST, then evaluates the test condition at the bottom.
Ã¢â‚¬Â¢ The body is guaranteed to execute at least once regardless of initial condition evaluation.`);
  }

  // 4. CS301: Data Structures
  const cs301 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs301'`).get();
  if (!cs301) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES ('Data Structures', 'cs301', 'CS301', 'Abstract Data Types, Linked Lists, Stacks, Queues, Binary Trees, and Graphs Ã¢â‚¬â€ Virtual University')
    `).run();
    const sId = res.lastInsertRowid;
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 1, 'Introduction to ADTs, Arrays & Linked Lists')`).run(sId);
    const lId = lRes.lastInsertRowid;
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes)
      VALUES (?, 'mcq', 'Which access discipline is adhered to by the Stack data structure?', ?, 'a', 'Stacks follow Last-In, First-Out (LIFO) discipline where push and pop occur at the top.', 1, 1)
    `).run(lId, JSON.stringify({ a: 'LIFO (Last In First Out)', b: 'FIFO (First In First Out)', c: 'Random Access', d: 'Priority First' }));
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes)
      VALUES (?, 'short', 'Define an Abstract Data Type (ADT) and provide two canonical examples.', ?, 'An ADT defines data and operations mathematically without specifying implementation details.', 3, 3)
    `).run(lId, `Definition:
An Abstract Data Type (ADT) is a mathematical specification of a data collection characterized by its operations and behaviors from the user perspective, completely independent of physical implementation and memory representation.

Canonical Examples:
1. Stack ADT: Defined by Push(), Pop(), and Top() operations with LIFO discipline.
2. Queue ADT: Defined by Enqueue() and Dequeue() operations with FIFO discipline.`);
  }

  // 5. MGT201: Financial Management
  let mgt201 = db.prepare(`SELECT id FROM subjects WHERE slug = 'mgt201'`).get() as { id: number } | undefined;
  if (!mgt201) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES ('Financial Management', 'mgt201', 'MGT201', 'Core concepts of Financial Management, Shareholder Wealth Maximization, Forms of Business Organization, and Corporate Finance Ã¢â‚¬â€ Virtual University')
    `).run();
    mgt201 = { id: Number(res.lastInsertRowid) };
  }

  // Lecture 1: Introduction to Financial Management
  const mgtL1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(mgt201.id) as { id: number } | undefined;
  if (!mgtL1) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 1, 'Introduction to Financial Management')`).run(mgt201.id);
    const lId = lRes.lastInsertRowid;

    // Past Paper MCQs (Strictly Lecture 1)
    const mgtMcqs = [
      {
        stem: 'Determine the main focus of financial management in a firm.',
        options: JSON.stringify({
          a: 'Maximizing the number of products or services produced by the firm',
          b: 'Maximizing the amount of taxes paid the firm',
          c: 'Creating value for shareholders of the firm',
          d: 'Maximizing dollars profits earned by the firm'
        }),
        correct: 'c',
        explanation: 'The primary focus of financial management is creating value for shareholders of the firm (Shareholder Wealth Maximization).'
      },
      {
        stem: 'The objective of financial management is to maximize ________ wealth.',
        options: JSON.stringify({
          a: 'Stakeholders',
          b: 'Shareholders',
          c: 'Bondholders',
          d: 'Directors'
        }),
        correct: 'b',
        explanation: 'Financial management specifically aims to maximize the wealth of the firmÃ¢â‚¬â„¢s shareholders through stock appreciation and dividends.'
      },
      {
        stem: 'Which of the following is the major advantage of the corporate form of organization?',
        options: JSON.stringify({
          a: 'Limited liability of shareholders',
          b: 'Limited resources',
          c: 'Limited life of the business',
          d: 'Double taxation on profits'
        }),
        correct: 'a',
        explanation: 'Limited liability protects shareholdersÃ¢â‚¬â„¢ personal assets from business obligations, which is the chief advantage of the corporate structure.'
      },
      {
        stem: 'Which of the following is a major disadvantage of the corporate form of organization?',
        options: JSON.stringify({
          a: 'Double taxation on profit',
          b: 'Inability of the firm to raise large sums of additional capital',
          c: 'Limited liability of shareholders',
          d: 'Corporate firm have limited life'
        }),
        correct: 'a',
        explanation: 'Corporate earnings are subject to double taxation: once at the corporate tax level, and again on dividends at the personal income tax level.'
      },
      {
        stem: 'Which one of the following business entity has limited life?',
        options: JSON.stringify({
          a: 'Sole Proprietorship',
          b: 'Partnership',
          c: 'Corporation',
          d: 'Sole Proprietorship and partnership'
        }),
        correct: 'd',
        explanation: 'Both sole proprietorships and partnerships legally dissolve upon the death, withdrawal, or bankruptcy of any partner or owner.'
      },
      {
        stem: 'Which one of the following business entity has unlimited life?',
        options: JSON.stringify({
          a: 'Sole Proprietorship',
          b: 'Partnership',
          c: 'Corporation',
          d: 'Proprietorship and corporation'
        }),
        correct: 'c',
        explanation: 'A corporation possesses perpetual existence (unlimited life) because it exists as an independent legal person separate from its shareholders.'
      },
      {
        stem: 'Identify, what can be the biggest advantage of a small partnership over a sole proprietorship?',
        options: JSON.stringify({
          a: 'Liability is unlimited',
          b: 'Separate legal entity',
          c: 'Ownership is difficult to resale',
          d: 'Capital can be raised easily'
        }),
        correct: 'd',
        explanation: 'Partnerships combine the credit, capital contributions, and managerial talent of multiple partners, raising capital more readily than a lone proprietor.'
      },
      {
        stem: "The main objective of 'Financial Accounting' is:",
        options: JSON.stringify({
          a: 'To maximize profit',
          b: 'To collect accurate & timely the financial data',
          c: 'To maximize shareholders\' wealth',
          d: 'To increase sales'
        }),
        correct: 'b',
        explanation: 'Financial accounting focuses on collecting, verifying, recording, and presenting accurate and timely historical financial transactions.'
      }
    ];

    for (const q of mgtMcqs) {
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, 1, 1, 'lecture')
      `).run(lId, q.stem, q.options, q.correct, q.explanation);
    }

    // High-yield Conceptual Subjective Questions for Lecture 1
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Differentiate between Profit Maximization and Shareholder Wealth Maximization in Financial Management.', ?, 'Shareholder Wealth Maximization accounts for timing, cash flows, and risk, whereas Profit Maximization only looks at short-term accounting profit.', 3, 3, 'lecture')
    `).run(lId, `1. Profit Maximization:
Ã¢â‚¬Â¢ Focuses strictly on maximizing short-term net accounting profit or earnings per share (EPS).
Ã¢â‚¬Â¢ Ignores the timing of cash inflows, duration of returns, and fails to account for risk or cash flow uncertainty.
Ã¢â‚¬Â¢ Can lead to opportunistic managerial decisions that harm long-term organizational viability.

2. Shareholder Wealth Maximization:
Ã¢â‚¬Â¢ The primary normative goal of financial management, measured by maximizing the market value of common stock.
Ã¢â‚¬Â¢ Directly evaluates actual cash flows rather than accounting figures, considers the time value of money, and incorporates business/financial risk.
Ã¢â‚¬Â¢ Ensures long-term sustainability, competitive positioning, and sustainable shareholder value.`);

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', 'Compare the three primary forms of business organization (Sole Proprietorship, Partnership, and Corporation) in terms of liability, longevity, taxation, and capital formation.', ?, 'Corporations provide limited liability, perpetual life, and superior capital accumulation, balanced against double taxation and regulatory compliance.', 5, 5, 'midterm')
    `).run(lId, `1. Sole Proprietorship:
Ã¢â‚¬Â¢ Liability: Unlimited personal liability (the proprietor is personally liable for all obligations and debts).
Ã¢â‚¬Â¢ Longevity: Limited life (the enterprise dissolves automatically upon death or incapacity of the owner).
Ã¢â‚¬Â¢ Taxation: Single pass-through taxation (profits reported directly on the owner's personal income tax return).
Ã¢â‚¬Â¢ Capital: Strictly limited to the proprietor's personal wealth and individual creditworthiness.

2. Partnership:
Ã¢â‚¬Â¢ Liability: Unlimited liability for general partners (joint and several liability).
Ã¢â‚¬Â¢ Longevity: Limited life (dissolves if any general partner departs, becomes incapacitated, or withdraws).
Ã¢â‚¬Â¢ Taxation: Single pass-through taxation (earnings flow directly to partners' personal returns).
Ã¢â‚¬Â¢ Capital: Superior to sole proprietorships by pooling equity and credit of multiple partners, but still constrained compared to public markets.

3. Corporation:
Ã¢â‚¬Â¢ Liability: Limited liability for stockholders (investor losses are capped strictly at their capital contribution).
Ã¢â‚¬Â¢ Longevity: Perpetual existence (unlimited life; legal entity continues regardless of share transfers).
Ã¢â‚¬Â¢ Taxation: Subject to double taxation (corporate profits taxed at corporate rates, dividends taxed at personal rates).
Ã¢â‚¬Â¢ Capital: Unrivaled capacity to mobilize massive capital by issuing public equity shares, preferred stock, and corporate bonds.`);
  }

  // Lecture 2: Financial Environment, Financial Markets, and Financial Statements
  const mgtL2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(mgt201.id) as { id: number } | undefined;
  if (!mgtL2) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 2, 'Financial Environment, Financial Markets, and Financial Statements')`).run(mgt201.id);
    const l2Id = lRes.lastInsertRowid;

    const mgtL2Mcqs = [
      {
        stem: 'In finance we refer to the market where existing securities are bought and sold as the ________ market.',
        options: JSON.stringify({
          a: 'Money',
          b: 'Capital',
          c: 'Primary',
          d: 'Secondary'
        }),
        correct: 'd',
        explanation: 'The secondary market is the financial market where previously issued securities (stocks and bonds) are traded among investors.'
      },
      {
        stem: 'Who determines the market price of a share of common stock?',
        options: JSON.stringify({
          a: 'The board of directors of the firm',
          b: 'The stock exchange on which the stock is listed',
          c: 'The president of the company',
          d: 'Individuals buying and selling the stock'
        }),
        correct: 'd',
        explanation: 'The market price of a stock is determined by the forces of demand and supply from individual and institutional buyers and sellers in the marketplace.'
      },
      {
        stem: 'Which of the following is used to assess the financial position of a company?',
        options: JSON.stringify({
          a: 'Financial statements',
          b: 'Stock price in the market',
          c: 'Credit worthiness of the company',
          d: 'Capital structure of the company'
        }),
        correct: 'a',
        explanation: 'Financial statements (Balance Sheet, Income Statement, Cash Flow Statement) provide the formal records used to evaluate the financial condition and performance of a firm.'
      },
      {
        stem: 'Balance Sheet of a company reflects:',
        options: JSON.stringify({
          a: 'Operating efficiency or profitability of a company',
          b: "Organization's financial health at a specific point of time",
          c: 'Cash movement during operations in an accounting period',
          d: 'Share of the owners in the business'
        }),
        correct: 'b',
        explanation: "A Balance Sheet provides a snapshot of an organization's financial position (assets, liabilities, and equity) at a specific point in time (as of a particular date)."
      },
      {
        stem: 'Which of the following equation can represent income statement in best way?',
        options: JSON.stringify({
          a: 'Profit - Expenses = sales revenue',
          b: 'Sales revenue - Expenses = Profit',
          c: 'Assets + Liabilities = Equity',
          d: 'Sales revenue + Equity = Assets'
        }),
        correct: 'b',
        explanation: 'The fundamental Income Statement equation is: Sales Revenue - Expenses = Net Profit (or Net Income).'
      },
      {
        stem: 'Which of the following statements is TRUE regarding Permanent Accounts?',
        options: JSON.stringify({
          a: 'Accounts that are found on Income Statement',
          b: 'Accounts that are found on Statement of Retained Earnings',
          c: 'Accounts that are found on Balance Sheet',
          d: 'All of the given options'
        }),
        correct: 'c',
        explanation: 'Permanent (real) accounts are balance sheet accounts (assets, liabilities, equity) whose cumulative balances carry forward from one fiscal period to the next.'
      },
      {
        stem: 'Which of the following statement is not included in a set of financial statements?',
        options: JSON.stringify({
          a: 'Balance sheet',
          b: 'Income & expenses account',
          c: 'Statement of changes in equity',
          d: 'Annual report'
        }),
        correct: 'd',
        explanation: 'An Annual Report is an overall corporate document that contains the financial statements along with management discussions, auditor reports, and company highlights; it is not itself a financial statement.'
      },
      {
        stem: 'An approach in which two balance sheets of the same company for different times are compared at a specific time and inflationary adjustments are made is known as:',
        options: JSON.stringify({
          a: 'Common size approach',
          b: 'Constant Rupee Approach',
          c: 'Vertical analysis',
          d: 'Horizontal analysis'
        }),
        correct: 'b',
        explanation: 'The Constant Rupee (or Constant Currency) Approach adjusts historical financial statement figures for general inflation to enable meaningful multi-period comparisons.'
      }
    ];

    for (const q of mgtL2Mcqs) {
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, 1, 1, 'lecture')
      `).run(l2Id, q.stem, q.options, q.correct, q.explanation);
    }

    // High-yield Conceptual Subjective Questions for Lecture 2
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Differentiate between Primary Markets and Secondary Markets in the financial environment.', ?, 'Primary markets create new securities to raise capital; secondary markets facilitate continuous trading among existing investors.', 3, 3, 'lecture')
    `).run(l2Id, `1. Primary Market:
Ã¢â‚¬Â¢ The market where newly created securities (stocks or bonds) are issued and sold for the first time by corporations to investors.
Ã¢â‚¬Â¢ Facilitates direct capital formation through Initial Public Offerings (IPOs) or private placements; the issuer receives the net capital proceeds.

2. Secondary Market:
Ã¢â‚¬Â¢ The market where existing, previously issued securities are traded among independent investors (e.g., Pakistan Stock Exchange, PSX).
Ã¢â‚¬Â¢ Provides vital liquidity, price discovery, and market valuation for securities; the issuing corporation receives no direct capital from secondary trades.`);

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', 'Explain the purpose and core components of the three primary Financial Statements: the Balance Sheet, Income Statement, and Cash Flow Statement.', ?, 'The Balance Sheet shows financial position at a point in time, the Income Statement shows profitability over a period, and the Cash Flow Statement traces cash movements.', 5, 5, 'midterm')
    `).run(l2Id, `1. Balance Sheet:
Ã¢â‚¬Â¢ Purpose: Provides a snapshot of the firm's financial position at a specific point in time (as of a specific date).
Ã¢â‚¬Â¢ Accounting Identity: Total Assets = Total Liabilities + Shareholders' Equity.
Ã¢â‚¬Â¢ Accounts: Contains permanent accounts classifying current/fixed assets, short-term/long-term liabilities, and equity capital.

2. Income Statement:
Ã¢â‚¬Â¢ Purpose: Measures operational financial performance and net profitability generated over a specified accounting period.
Ã¢â‚¬Â¢ Core Equation: Sales Revenue - Cost of Goods Sold - Operating Expenses - Interest - Taxes = Net Income.
Ã¢â‚¬Â¢ Accounts: Composed of temporary (nominal) accounts whose balances reset annually into retained earnings.

3. Cash Flow Statement:
Ã¢â‚¬Â¢ Purpose: Reconciles accounting net profit with actual physical cash receipts and disbursements over the period.
Ã¢â‚¬Â¢ Three Core Activities:
  (a) Operating Cash Flows: Cash generated or consumed by core business revenue-producing operations.
  (b) Investing Cash Flows: Cash deployed for capital expenditures, equipment acquisitions, or divestitures.
  (c) Financing Cash Flows: Cash flows related to issuing or retiring equity, borrowing or repaying debt, and paying cash dividends.`);
  }

  // Lecture 3: Financial Analysis and Financial Ratios
  const mgtL3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(mgt201.id) as { id: number } | undefined;
  if (!mgtL3) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 3, 'Financial Analysis and Financial Ratios')`).run(mgt201.id);
    const l3Id = lRes.lastInsertRowid;

    const mgtL3Mcqs = [
      {
        stem: 'Which group of ratios measures how effectively the firm is using its assets?',
        options: JSON.stringify({
          a: 'Liquidity ratios',
          b: 'Debt ratios',
          c: 'Coverage ratios',
          d: 'Activity ratios'
        }),
        correct: 'd',
        explanation: 'Activity (or asset management) ratios measure how effectively and efficiently the firm is managing and utilizing its assets to generate revenues.'
      },
      {
        stem: 'Which of the following given ratio measures a firmÃ¢â‚¬â„¢s ability to meet short-term obligations?',
        options: JSON.stringify({
          a: 'Liquidity ratios',
          b: 'Debt ratios',
          c: 'Coverage ratios',
          d: 'Profitability index'
        }),
        correct: 'a',
        explanation: 'Liquidity ratios (e.g., Current Ratio, Quick Ratio) evaluate the firmÃ¢â‚¬â„¢s capacity to satisfy short-term financial obligations as they mature.'
      },
      {
        stem: 'Which of the given ratio measures the firmÃ¢â‚¬â„¢s ability to make contractual interest payments?',
        options: JSON.stringify({
          a: 'Debt ratios',
          b: 'Coverage ratios',
          c: 'Activity ratios',
          d: 'Liquidity ratios'
        }),
        correct: 'b',
        explanation: 'Coverage ratios (such as Times Interest Earned / Interest Coverage Ratio) gauge a companyÃ¢â‚¬â„¢s ability to service contractual debt and interest obligations out of operating earnings (EBIT).'
      },
      {
        stem: 'For most firms, P/E ratios and risk ________.',
        options: JSON.stringify({
          a: 'Will be directly related',
          b: 'Will have an inverse relationship',
          c: 'Will be unrelated',
          d: 'None of the given options'
        }),
        correct: 'b',
        explanation: 'Price-to-Earnings (P/E) ratios and risk typically have an inverse relationship; higher risk elevates the required rate of return, discounting stock prices and depressing the P/E multiple.'
      },
      {
        stem: 'Which of the following statement is TRUE?',
        options: JSON.stringify({
          a: 'IRR is based on Cash Flows',
          b: 'ROA & ROE are based on Net Income',
          c: 'ROA & ROE are based on historical cost',
          d: 'All of the given options'
        }),
        correct: 'd',
        explanation: 'All statements are true: Internal Rate of Return (IRR) is evaluated using project cash flows, while Return on Assets (ROA) and Return on Equity (ROE) derive from accounting net income and balance sheet historical book costs.'
      },
      {
        stem: 'ABCÃ¢â‚¬â„¢s and XYZÃ¢â‚¬â„¢s debt-to-total assets ratio is 0.4. What is its debt-to-equity ratio?',
        options: JSON.stringify({
          a: '0.77',
          b: '0.667',
          c: '0.333',
          d: '0.2'
        }),
        correct: 'b',
        explanation: 'Debt / Total Assets = 0.4. Assuming Total Assets = 1.0, Debt = 0.4 and Equity = 1.0 - 0.4 = 0.6. Therefore, Debt-to-Equity Ratio = Debt / Equity = 0.4 / 0.6 = 0.667 (or 66.7%).'
      },
      {
        stem: 'Suppose a company has paid Rs. 50,000 a dividend to its shareholders while net income for the year was Rs. 500,000. What is the payout ratio of the company?',
        options: JSON.stringify({
          a: '10%',
          b: '15%',
          c: '90%',
          d: '70%'
        }),
        correct: 'a',
        explanation: 'Dividend Payout Ratio = Total Dividends / Net Income = Rs. 50,000 / Rs. 500,000 = 0.10 or 10% (Retention / Plowback Ratio = 90%).'
      }
    ];

    for (const q of mgtL3Mcqs) {
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, 1, 1, 'lecture')
      `).run(l3Id, q.stem, q.options, q.correct, q.explanation);
    }

    // Conceptual Subjective Questions for Lecture 3
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Differentiate between the Current Ratio and the Quick (Acid-Test) Ratio. Why is inventory excluded from the Quick Ratio?', ?, 'Quick ratio provides a stricter assessment of short-term liquidity by omitting slow-moving, illiquid inventory.', 3, 3, 'lecture')
    `).run(l3Id, `1. Current Ratio:
Ã¢â‚¬Â¢ Formula: Current Assets / Current Liabilities.
Ã¢â‚¬Â¢ Measures the general ability of a firm to meet short-term obligations using all liquid and circulating assets.

2. Quick (Acid-Test) Ratio:
Ã¢â‚¬Â¢ Formula: (Current Assets - Inventory) / Current Liabilities, or (Cash + Marketable Securities + Receivables) / Current Liabilities.
Ã¢â‚¬Â¢ Measures immediate short-term liquidity without relying on the sale of stock.

3. Rationale for Excluding Inventory:
Ã¢â‚¬Â¢ Inventory is typically the least liquid current asset.
Ã¢â‚¬Â¢ Converting inventory into cash requires an actual sales transaction and subsequent credit collection, which may take substantial time.
Ã¢â‚¬Â¢ During liquidation, inventory often incurs markdowns or losses below book value.`);

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', 'Describe the five primary categories of Financial Ratios used in financial analysis and specify what aspect of business performance each category evaluates.', ?, 'Financial analysis synthesizes these 5 categories to provide lenders, managers, and equity investors with a holistic picture of financial strength.', 5, 5, 'midterm')
    `).run(l3Id, `1. Liquidity Ratios:
Ã¢â‚¬Â¢ Purpose: Measure a firm's capability to satisfy short-term obligations as they mature.
Ã¢â‚¬Â¢ Key Examples: Current Ratio, Quick (Acid-Test) Ratio, Cash Ratio.

2. Activity / Asset Management Ratios:
Ã¢â‚¬Â¢ Purpose: Gauge the operational speed and efficiency with which a firm utilizes its asset base to generate sales.
Ã¢â‚¬Â¢ Key Examples: Inventory Turnover, Days Sales Outstanding (DSO) / Average Collection Period, Total Asset Turnover.

3. Debt / Financial Leverage & Coverage Ratios:
Ã¢â‚¬Â¢ Purpose: Evaluate the extent to which a firm uses borrowed funds and its capacity to service debt obligations and fixed contractual interest charges.
Ã¢â‚¬Â¢ Key Examples: Debt-to-Equity Ratio, Debt-to-Total Assets Ratio, Times Interest Earned (TIE).

4. Profitability Ratios:
Ã¢â‚¬Â¢ Purpose: Assess management's overall operational effectiveness in translating sales and assets into net profits.
Ã¢â‚¬Â¢ Key Examples: Gross Profit Margin, Operating Margin, Net Profit Margin, Return on Assets (ROA), Return on Equity (ROE).

5. Market Value Ratios:
Ã¢â‚¬Â¢ Purpose: Relate the firm's stock market price to its accounting earnings, book equity, and dividend distributions.
Ã¢â‚¬Â¢ Key Examples: Price-to-Earnings (P/E) Ratio, Market-to-Book (M/B) Ratio, Dividend Yield, Dividend Payout Ratio.`);
  }

  // Lecture 4: Time Value of Money (TVM), Compounding & Discounting
  const mgtL4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(mgt201.id) as { id: number } | undefined;
  if (!mgtL4) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 4, 'Time Value of Money (TVM), Compounding & Discounting')`).run(mgt201.id);
    const l4Id = lRes.lastInsertRowid;

    const insMgt4 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt4S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt4L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 10 MCQs
    insMgt4.run(
      l4Id,
      'The process of finding the present value of some future amount is called:',
      JSON.stringify({
        a: 'Discounting',
        b: 'Financing',
        c: 'Lending',
        d: 'Investing'
      }),
      'a',
      'Discounting is the process of translating future cash flows into their equivalent present value using an appropriate discount rate.',
      'مستقبل کی کسی رقم کی موجودہ قیمت (Present Value) معلوم کرنے کا عمل ڈسکاؤنٹنگ (Discounting) کہلاتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Nominal Interest Rate is also known as:',
      JSON.stringify({
        a: 'Effective interest Rate',
        b: 'Annual percentage rate',
        c: 'Periodic interest rate',
        d: 'Required interest rate'
      }),
      'b',
      'The nominal interest rate stated on loans or investments without adjusting for intra-year compounding is commonly termed the Annual Percentage Rate (APR).',
      'نامینل انٹرسٹ ریٹ کو اینول پرسنٹیج ریٹ (Annual Percentage Rate - APR) بھی کہا جاتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Which of the following is the correct formula to discount a Cash Flow (CF) of a specific period n at discount rate r?',
      JSON.stringify({
        a: 'CF / (1 + r)',
        b: 'CF_n / (1 + r)^n',
        c: 'CF × (1 + r)',
        d: 'CF_n × (1 + r)^n'
      }),
      'b',
      'Present Value of a single future cash flow received in period n is computed as PV = CF_n / (1 + r)^n.',
      'مستقبل کے پیریڈ n کے کیش فلو کی موجودہ قدر معلوم کرنے کا درست فارمولا CF_n / (1 + r)^n ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Which of the following allows depicting graphically the timing of cash flows along with their nature as either inflows or outflows?',
      JSON.stringify({
        a: 'Cash flow diagram',
        b: 'Cash flow statement',
        c: 'Cash budget Analysis',
        d: 'None of the given options'
      }),
      'a',
      'A cash flow diagram (or timeline) visually illustrates the chronological timing and direction (positive for inflows, negative for outflows) of cash movements.',
      'کیش فلو ڈایاگرام (ٹائم لائن) کیش کے آنے (Inflows) اور جانے (Outflows) کے وقت کو گراف کی شکل میں ظاہر کرتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'What is the future value of Rs. 12,000 to be paid at the end of seven years if the interest rate is 10% compounded annually?',
      JSON.stringify({
        a: 'Rs. 20,400',
        b: 'Rs. 22,400',
        c: 'Rs. 23,385',
        d: 'Rs. 23,900'
      }),
      'c',
      'Future Value = PV × (1 + r)^n = 12,000 × (1 + 0.10)^7 = 12,000 × 1.948717 = Rs. 23,384.60 ≈ Rs. 23,385.',
      'فیوچر ویلیو فارمولا: FV = 12,000 × (1.10)^7 = 12,000 × 1.9487 = 23,385 روپے۔'
    );

    insMgt4.run(
      l4Id,
      'Suppose you deposit Rs. 500 in a bank for 10 years at a 7% annual interest rate. Under the concept of "simple interest", what amount of interest will you receive after 10 years?',
      JSON.stringify({
        a: 'Rs. 350',
        b: 'Rs. 500',
        c: 'Rs. 850',
        d: 'Rs. 35'
      }),
      'a',
      'Simple Interest = Principal × r × t = Rs. 500 × 0.07 × 10 = Rs. 350.',
      'سادہ سود کا فارمولا: سود = اصل زر × شرح × وقت = 500 × 0.07 × 10 = 350 روپے۔'
    );

    insMgt4.run(
      l4Id,
      'The process of accumulating interest on an investment over time to earn "interest on interest" is called:',
      JSON.stringify({
        a: 'Discounting',
        b: 'Compounding',
        c: 'Amortization',
        d: 'Capital budgeting'
      }),
      'b',
      'Compounding involves calculating interest on both the initial principal and the accumulated interest from previous periods.',
      'اصل رقم کے ساتھ ساتھ پچھلے سود پر بھی مزید سود کمانے کے عمل کو کمپاؤنڈنگ (Compounding) کہتے ہیں۔'
    );

    insMgt4.run(
      l4Id,
      'Which of the following generates a higher future value over multi-year horizons under the same nominal interest rate?',
      JSON.stringify({
        a: 'Simple interest',
        b: 'Compound interest',
        c: 'Both yield identical future values',
        d: 'Zero-coupon discounting'
      }),
      'b',
      'Compound interest consistently produces greater future accumulated wealth because interest earned is reinvested to generate additional interest.',
      'کمپاؤنڈ انٹرسٹ ہمیشہ سادہ سود (Simple Interest) سے زیادہ منافع پیدا کرتا ہے کیونکہ اس میں سود پر بھی سود ملتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'As the discount rate increases, the present value (PV) of a fixed future cash flow:',
      JSON.stringify({
        a: 'Increases',
        b: 'Decreases',
        c: 'Remains constant',
        d: 'Approaches infinity'
      }),
      'b',
      'Because discount rate appears in the denominator PV = FV / (1 + r)^n, an increase in discount rate decreases the present value.',
      'ڈسکاؤنٹ ریٹ بڑھنے سے مستقبل کی رقم کی موجودہ قدر (Present Value) کم ہو جاتی ہے۔'
    );

    insMgt4.run(
      l4Id,
      'In the formula FV = PV × (1 + r)^n, the term (1 + r)^n is officially known as the:',
      JSON.stringify({
        a: 'Future Value Interest Factor (FVIF)',
        b: 'Present Value Interest Factor (PVIF)',
        c: 'Discount Factor',
        d: 'Annuity Factor'
      }),
      'a',
      'The term (1 + r)^n is the Future Value Interest Factor (FVIF_r,n), used to project single sums into the future.',
      'فارمولے میں (1 + r)^n کو فیوچر ویلیو انٹرسٹ فیکٹر (FVIF) کہا جاتا ہے۔'
    );

    // 3 Short Questions
    insMgt4S.run(
      l4Id,
      `Suppose you are currently 21 years old and can earn 10 percent annual interest on your investment. How much must you invest today in order to accumulate Rs. 1 million (Rs. 1,000,000) by the time you reach age 65?`,
      `Present Value Calculation:

1. Identify Given Data:
• Target Future Value (FV) = Rs. 1,000,000
• Annual Interest Rate (r) = 10% = 0.10
• Investment Horizon (n) = 65 - 21 = 44 years

2. Formula:
PV = FV / (1 + r)^n

3. Calculation:
PV = 1,000,000 / (1 + 0.10)^44
PV = 1,000,000 / (1.10)^44
PV = 1,000,000 / 66.26408
PV = Rs. 15,091.13

Conclusion:
You need to deposit only Rs. 15,091.13 today at 10% compound annual return to accumulate Rs. 1,000,000 by age 65.`,
      'The massive growth from Rs. 15,091 to Rs. 1,000,000 illustrates the exponential compounding power over 44 years.',
      '65 سال کی عمر میں 10 لاکھ روپے حاصل کرنے کے لیے آج 10 فیصد سالانہ کمپاؤنڈ شرح پر صرف 15,091.13 روپے کی سرمایہ کاری درکار ہے۔'
    );

    insMgt4S.run(
      l4Id,
      'Differentiate between Compounding and Discounting in Time Value of Money.',
      `Comparison between Compounding and Discounting:

1. Compounding:
• Process: Projects cash flows forward in time to calculate their Future Value (FV).
• Direction: Moves from Present to Future (left to right on a cash flow timeline).
• Mathematical Operator: Multiplicative: FV = PV × (1 + r)^n.
• Purpose: Determines how much an investment made today will grow into over time.

2. Discounting:
• Process: Brings future cash flows back in time to calculate their Present Value (PV) today.
• Direction: Moves from Future to Present (right to left on a cash flow timeline).
• Mathematical Operator: Divisive: PV = FV / (1 + r)^n.
• Purpose: Determines the fair value today of a future stream of revenues or payments.`,
      'Compounding moves money forward in time (FV = PV × (1+r)^n); Discounting moves money backward in time (PV = FV / (1+r)^n).',
      'کمپاؤنڈنگ موجودہ رقم کو مستقبل میں لے جاتی ہے (FV)، جبکہ ڈسکاؤنٹنگ مستقبل کی رقم کو موجودہ وقت میں واپس لاتی ہے (PV)۔'
    );

    insMgt4S.run(
      l4Id,
      'Differentiate between Simple Interest and Compound Interest with a brief numerical example.',
      `Comparison between Simple and Compound Interest:

1. Simple Interest:
• Interest is calculated solely on the original principal amount.
• Formula: Interest = Principal × r × t
• Earnings per period remain constant.

2. Compound Interest:
• Interest is calculated on the original principal PLUS all interest accumulated from prior periods.
• Formula: Total Amount = Principal × (1 + r)^n
• Earnings increase exponentially over successive periods.

Numerical Example (Rs. 1,000 at 10% for 3 years):
• Under Simple Interest: Earns Rs. 100 each year. Total Interest = Rs. 300. Ending Balance = Rs. 1,300.
• Under Compound Interest:
  - Year 1: Rs. 1,000 + Rs. 100 = Rs. 1,100
  - Year 2: Rs. 1,100 + Rs. 110 = Rs. 1,210
  - Year 3: Rs. 1,210 + Rs. 121 = Rs. 1,331
  Ending Balance = Rs. 1,331 (Earns Rs. 31 extra due to "interest on interest").`,
      'Compound interest accelerates wealth accumulation because accumulated interest reinvests automatically.',
      'سادہ سود صرف اصل زر پر ملتا ہے جبکہ کمپاؤنڈ انٹرسٹ میں پچھلے سالوں کے جمع شدہ سود پر بھی منافع حاصل ہوتا ہے۔'
    );

    // 2 Long Questions
    insMgt4L.run(
      l4Id,
      'Explain the fundamental concept of Time Value of Money (TVM). Why is a rupee today worth more than a rupee in the future? Discuss its primary applications in corporate financial management.',
      `Time Value of Money (TVM):

1. Core Concept:
The Time Value of Money asserts that a specific sum of money received today is worth more than the identical nominal amount received at any future date.

2. Fundamental Reasons Why Money Has Time Value:
a. Earning Capacity (Opportunity Cost):
Money available today can be invested in productive assets, government treasury bills, or bank deposits to generate interest or dividends over time.
b. Inflation Risk:
Prices of goods and services tend to rise over time, eroding currency purchasing power. A rupee in 5 years will purchase fewer real goods than a rupee today.
c. Uncertainty and Default Risk:
Future cash receipts carry inherent uncertainty regarding whether the payer will remain solvent or economic conditions will permit payment.
d. Preference for Current Consumption:
Human psychology places higher utility on satisfying consumption needs immediately rather than postponing them to an uncertain future.

3. Key Corporate Applications:
• Capital Budgeting: Evaluating proposed capital investments using Net Present Value (NPV), Internal Rate of Return (IRR), and Profitability Index.
• Security Valuation: Pricing bonds and stocks based on the discounted present value of expected future coupons, dividends, and capital gains.
• Loan Amortization: Structuring fixed-payment schedules for mortgages, leases, and corporate debt.
• Working Capital Planning: Managing trade credit terms and cash discount optimization.`,
      'TVM is the bedrock of corporate finance; all financial assets are priced by discounting future expected cash flows.',
      'وقت کے ساتھ پیسے کی قدر کی وجوہات: 1. منافع کمانے کی صلاحیت، 2. افراط زر (مہنگائی)، 3. غیر یقینی صورتحال اور رسک، 4. فوری استعمال کی ترجیح۔'
    );

    insMgt4L.run(
      l4Id,
      'Explain the difference between Nominal Interest Rate (APR) and Effective Annual Rate (EAR). Why does EAR increase when compounding occurs more frequently? Provide a comparative numerical example.',
      `Nominal Interest Rate (APR) vs. Effective Annual Rate (EAR):

1. Nominal Interest Rate (Annual Percentage Rate - APR):
• The contractual rate of interest stated on financial instruments or loan agreements.
• Does not adjust for the financial impact of intra-year compounding.

2. Effective Annual Rate (EAR):
• The true, economically equivalent annual rate of interest actually earned or paid over a full year, incorporating compounding frequency.
• Formula: EAR = [1 + (r_nominal / m)]^m - 1
  where r_nominal is the stated nominal rate and m is compounding periods per year.

3. Why EAR Increases with Compounding Frequency:
When interest is compounded semi-annually, quarterly, monthly, or daily (m > 1), interest generated during earlier periods starts earning interest in later periods within the same annual cycle. The greater the frequency of compounding (m), the higher the effective annual yield.

4. Comparative Numerical Example (Stated Nominal Rate = 12% per year):
• Annual Compounding (m = 1):
  EAR = (1 + 0.12/1)^1 - 1 = 12.00%
• Semi-Annual Compounding (m = 2):
  EAR = (1 + 0.12/2)^2 - 1 = (1.06)^2 - 1 = 12.36%
• Quarterly Compounding (m = 4):
  EAR = (1 + 0.12/4)^4 - 1 = (1.03)^4 - 1 = 12.55%
• Monthly Compounding (m = 12):
  EAR = (1 + 0.12/12)^12 - 1 = (1.01)^12 - 1 = 12.68%
• Daily Compounding (m = 365):
  EAR = (1 + 0.12/365)^365 - 1 = 12.75%

Conclusion:
Investors seeking returns prefer maximum compounding frequency, while borrowers prefer annual or less frequent compounding.`,
      'EAR accounts for intra-year compounding; more frequent compounding periods directly yield higher effective returns.',
      'نامینل شرح (APR) میں سال کے اندر بار بار سود کا حساب شامل نہیں ہوتا، جبکہ مؤثر شرح (EAR) میں سالانہ حقیقی منافع ظاہر ہوتا ہے جو تعدد بڑھنے سے بڑھتا ہے۔'
    );
  }

  // 6. STA301: Statistics and Probability
  let sta301 = db.prepare(`SELECT id FROM subjects WHERE slug = 'sta301'`).get() as { id: number } | undefined;
  if (!sta301) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES ('Statistics and Probability', 'sta301', 'STA301', 'Foundational statistical concepts, descriptive vs. inferential statistics, variables, measurement scales, probability theory, and data analysis Ã¢â‚¬â€ Virtual University')
    `).run();
    sta301 = { id: Number(res.lastInsertRowid) };
  }

  // Lecture 1: Introduction to Statistics, Variables, Scales of Measurement & Errors
  const staL1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(sta301.id) as { id: number } | undefined;
  if (!staL1) {
    const lRes = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 1, 'Introduction to Statistics, Variables, Scales of Measurement & Errors')`).run(sta301.id);
    const l1Id = lRes.lastInsertRowid;

    const staL1Mcqs = [
      {
        stem: 'In statistics, we deal with:',
        options: JSON.stringify({
          a: 'Individuals',
          b: 'Isolated items',
          c: 'Aggregates of facts',
          d: 'Qualitative data'
        }),
        correct: 'c',
        explanation: 'Statistics is fundamentally concerned with aggregates of facts or data rather than isolated individual items.'
      },
      {
        stem: 'Which branch of statistics deals with the techniques that are used to organize, summarize, and present the data?',
        options: JSON.stringify({
          a: 'Advance statistics',
          b: 'Probability statistics',
          c: 'Descriptive statistics',
          d: 'Inferential statistics'
        }),
        correct: 'c',
        explanation: 'Descriptive statistics encompasses graphical, tabular, and numerical methods to organize, summarize, and present data.'
      },
      {
        stem: 'What is the main objective of Descriptive statistics?',
        options: JSON.stringify({
          a: 'To test population properties',
          b: 'To describe the data we collected',
          c: 'To infer something about the population',
          d: 'Making estimate'
        }),
        correct: 'b',
        explanation: 'The primary goal of descriptive statistics is to summarize and describe the features of the collected dataset.'
      },
      {
        stem: 'The branch of Statistics that is concerned with the procedures and methodology for obtaining valid conclusions is called:',
        options: JSON.stringify({
          a: 'Descriptive Statistics',
          b: 'Advance Statistics',
          c: 'Inferential Statistics',
          d: 'Sampled Statistics'
        }),
        correct: 'c',
        explanation: 'Inferential statistics provides scientific procedures for drawing conclusions, making estimations, and testing hypotheses about a population from sample data.'
      },
      {
        stem: 'Quantitative variable is further divided into:',
        options: JSON.stringify({
          a: 'Continuous variable',
          b: 'Discrete variable',
          c: 'Continuous & Discrete variable',
          d: 'None of the above'
        }),
        correct: 'c',
        explanation: 'Quantitative variables are bifurcated into discrete (countable, distinct jumps) and continuous (measurable over a continuous interval).'
      },
      {
        stem: 'The characteristic which cannot be measured numerically is called:',
        options: JSON.stringify({
          a: 'Quantitative variable',
          b: 'Qualitative variable',
          c: 'Discrete variable',
          d: 'Continuous variable'
        }),
        correct: 'b',
        explanation: 'A qualitative variable (or attribute) describes non-numerical qualities such as gender, religious affiliation, or eye color.'
      },
      {
        stem: 'The height of a student is 60 inches. This is an example ofÃ¢â‚¬Â¦Ã¢â‚¬Â¦?',
        options: JSON.stringify({
          a: 'Continuous data',
          b: 'Qualitative data',
          c: 'Categorical data',
          d: 'Discrete data'
        }),
        correct: 'a',
        explanation: 'Height is a continuous variable because it can take on any fractional or real value on a continuous measurement scale.'
      },
      {
        stem: 'The level of satisfaction for a certain facility which Govt. is providing is the example of:',
        options: JSON.stringify({
          a: 'Constant',
          b: 'Qualitative variable',
          c: 'Variable',
          d: 'Quantitative variable'
        }),
        correct: 'b',
        explanation: 'Level of satisfaction is a qualitative variable (attribute) representing an ordinal ranking of perceptions.'
      },
      {
        stem: 'Which scale will you use to measure the temperature?',
        options: JSON.stringify({
          a: 'Nominal scale',
          b: 'Interval scale',
          c: 'Ratio scale',
          d: 'Ordinal scale'
        }),
        correct: 'b',
        explanation: 'Temperature (in Celsius or Fahrenheit) is measured on an Interval scale because intervals between numbers are equal, but 0 does not indicate absence of heat (no true zero).'
      },
      {
        stem: 'Which of the following scale has true zero point?',
        options: JSON.stringify({
          a: 'Ratio Scale',
          b: 'Interval scale',
          c: 'Nominal scale',
          d: 'Ordinal scale'
        }),
        correct: 'a',
        explanation: 'A Ratio scale has an absolute, non-arbitrary true zero point signifying complete absence of the characteristic being measured.'
      },
      {
        stem: 'If data is categorized about any characteristic, then which measurement scale should be used?',
        options: JSON.stringify({
          a: 'Ordinal',
          b: 'Interval',
          c: 'Nominal',
          d: 'Ratio'
        }),
        correct: 'c',
        explanation: 'The Nominal scale is strictly used for mutually exclusive categorical labeling with no intrinsic quantitative ranking.'
      },
      {
        stem: 'Rankings of the finishes of competitors in a foot race is an example of a(n)_________.',
        options: JSON.stringify({
          a: 'Ratio scale',
          b: 'Ordinal scale',
          c: 'Nominal scale',
          d: 'Interval scale'
        }),
        correct: 'b',
        explanation: 'Finishing ranks (1st, 2nd, 3rd) establish an ordered hierarchy without guaranteeing equal intervals between finish times.'
      },
      {
        stem: 'Which of the scale is best to use for measuring the salary of an employee?',
        options: JSON.stringify({
          a: 'Nominal',
          b: 'Ordinal',
          c: 'Interval',
          d: 'Ratio'
        }),
        correct: 'd',
        explanation: 'Monetary values such as salaries have a meaningful zero point (zero income) and support multiplicative ratio operations, making it a Ratio scale.'
      },
      {
        stem: 'Ranking scale also includes the properties of which scale?',
        options: JSON.stringify({
          a: 'Nominal scale',
          b: 'Interval scale',
          c: 'Ratio scale',
          d: 'All of these'
        }),
        correct: 'a',
        explanation: 'An Ordinal (ranking) scale inherently includes category classification (Nominal properties) plus directional ranking.'
      },
      {
        stem: 'The Zip-Code of a city is an example of:',
        options: JSON.stringify({
          a: 'Qualitative data',
          b: 'Discrete data',
          c: 'Quantitative data',
          d: 'Continuous data'
        }),
        correct: 'a',
        explanation: 'Zip codes represent nominal qualitative labels assigned to geographical delivery areas; numerical computations on zip codes are meaningless.'
      },
      {
        stem: 'When the deviations (excesses and defects) from the true value tend to occur equally, it is called:',
        options: JSON.stringify({
          a: 'Unbiased error',
          b: 'Biased error',
          c: 'Systematic error',
          d: 'Mistake'
        }),
        correct: 'a',
        explanation: 'Unbiased (random or accidental) errors occur by chance in both positive and negative directions with equal frequency and balance out over large samples.'
      },
      {
        stem: 'The biased errors are also called:',
        options: JSON.stringify({
          a: 'Unbiased Errors',
          b: 'Random Errors',
          c: 'Systematic Errors',
          d: 'Accidental Errors'
        }),
        correct: 'c',
        explanation: 'Biased errors systematically distort measurements in one particular direction and are termed Systematic Errors.'
      },
      {
        stem: 'Which scale of measurement is more suitable in the following example? "The number of response given in a specified time period."',
        options: JSON.stringify({
          a: 'Ordinal Scale',
          b: 'Interval Scale',
          c: 'Ratio Scale',
          d: 'Nominal Scale'
        }),
        correct: 'c',
        explanation: 'Count data possesses an absolute zero (zero responses) and equal unit increments, representing a Ratio scale.'
      }
    ];

    for (const q of staL1Mcqs) {
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, 1, 1, 'lecture')
      `).run(l1Id, q.stem, q.options, q.correct, q.explanation);
    }

    // Short Questions from Past Papers
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Define Statistics in both plural and singular senses.', ?, 'Statistics derives from the Latin status (political state) and carries distinct plural and singular meanings.', 3, 3, 'lecture')
    `).run(l1Id, `1. In Plural Sense:
Ã¢â‚¬Â¢ Statistics refers to numerical facts, figures, or aggregates of data systematically collected for a specific inquiry.
Ã¢â‚¬Â¢ Examples: National census data, annual agricultural yields, or quarterly corporate revenue statistics.

2. In Singular Sense:
Ã¢â‚¬Â¢ Statistics denotes the scientific discipline and mathematical methodology.
Ã¢â‚¬Â¢ Encompasses principles and procedures for collecting, classifying, organizing, summarizing, analyzing, and interpreting numerical data to draw valid inferences under uncertainty.`);

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Explain the fundamental differences between the Nominal Scale and the Ordinal Scale with examples.', ?, 'Nominal provides qualitative labels; Ordinal adds ranking order.', 3, 3, 'lecture')
    `).run(l1Id, `1. Nominal Scale:
Ã¢â‚¬Â¢ Classifies observations into mutually exclusive qualitative categories or groups.
Ã¢â‚¬Â¢ Lacks any inherent numerical ordering, distance, or ranking among categories.
Ã¢â‚¬Â¢ Examples: Gender (Male / Female), Nationality (Pakistani / Canadian), Blood Type (A, B, AB, O).

2. Ordinal (Ranking) Scale:
Ã¢â‚¬Â¢ Retains all categorical properties of the nominal scale while introducing an intrinsic hierarchy or ranking.
Ã¢â‚¬Â¢ Distances between successive ranks are unequal or cannot be mathematically determined.
Ã¢â‚¬Â¢ Examples: Student letter grades (A, B, C, D, F), customer satisfaction levels (Satisfied, Neutral, Dissatisfied), military ranks.`);

    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', 'Differentiate between Discrete Variables and Continuous Variables with suitable examples.', ?, 'Discrete variables jump in isolated integer values; continuous variables assume any real value across an interval.', 3, 3, 'lecture')
    `).run(l1Id, `1. Discrete Variable:
Ã¢â‚¬Â¢ A quantitative variable that can only assume isolated, distinct values (usually non-negative integers or whole numbers).
Ã¢â‚¬Â¢ Typically derived from counting processes with finite or countably infinite values.
Ã¢â‚¬Â¢ Examples: Number of children in a household, number of errors on a webpage, traffic accidents per day.

2. Continuous Variable:
Ã¢â‚¬Â¢ A quantitative variable that can assume any real or fractional value within a given continuous interval.
Ã¢â‚¬Â¢ Typically derived from physical measurement processes where precision is bounded only by instrument accuracy.
Ã¢â‚¬Â¢ Examples: Human height, body weight, ambient temperature, battery operating lifetime.`);

    // Problem-Solving / Numerical Limits Question
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
    `).run(
      l1Id,
      "If a student's weight is recorded as 60 kg (correct to the nearest kilogram), find the lower and upper limits within which his true weight lies.",
      `Calculation of True Value Limits:
1. Recorded Measurement: x = 60 kg
2. Unit of Measurement (Precision): 1 kg
3. Maximum Absolute Error: Ã‚Â± (1/2 Ãƒâ€” unit) = Ã‚Â± 0.5 kg

Limits:
Ã¢â‚¬Â¢ Lower Limit = 60 - 0.5 = 59.5 kg
Ã¢â‚¬Â¢ Upper Limit = 60 + 0.5 = 60.5 kg

Conclusion:
The student's true weight lies within the continuous interval:
59.5 kg Ã¢â€°Â¤ True Weight < 60.5 kg`,
      'Continuous measurement limits are calculated using Ã‚Â± 1/2 of the unit of precision.'
    );

    // High-yield Long Question
    db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
      VALUES (?, 'long', 'Explain the four Levels / Scales of Measurement (Nominal, Ordinal, Interval, and Ratio) in Statistics. Contrast their fundamental properties, ordering capability, zero-point nature, and give two distinct examples for each.', ?, 'Understanding measurement scales is essential because each scale dictates the valid mathematical and statistical operations that can be performed on the data.', 5, 5, 'midterm')
    `).run(l1Id, `1. Nominal Scale:
Ã¢â‚¬Â¢ Characteristics: Lowest level of measurement. Used purely for categorization, identity, or labeling without intrinsic ranking.
Ã¢â‚¬Â¢ Zero Point: None.
Ã¢â‚¬Â¢ Permissible Math: Mode, frequency counts.
Ã¢â‚¬Â¢ Examples: Marital status (Single, Married, Divorced), Car brand names.

2. Ordinal Scale:
Ã¢â‚¬Â¢ Characteristics: Categorizes elements and introduces a logical ranking or order. Intervals between ranks are not equal or quantifiable.
Ã¢â‚¬Â¢ Zero Point: None.
Ã¢â‚¬Â¢ Permissible Math: Median, percentiles, rank correlation.
Ã¢â‚¬Â¢ Examples: Socioeconomic class (Low, Middle, High), Foot race finish positions (1st, 2nd, 3rd).

3. Interval Scale:
Ã¢â‚¬Â¢ Characteristics: Possesses ordered categories with equal, quantifiable distances between numerical points. Lacks an absolute (true) zero point (zero is arbitrary).
Ã¢â‚¬Â¢ Zero Point: Arbitrary zero (does not represent absolute absence of the attribute).
Ã¢â‚¬Â¢ Permissible Math: Mean, standard deviation, addition/subtraction (ratios are invalid).
Ã¢â‚¬Â¢ Examples: Temperature in Celsius or Fahrenheit (0Ã‚Â°C does not mean zero heat), Calendar years.

4. Ratio Scale:
Ã¢â‚¬Â¢ Characteristics: Highest level of measurement. Combines categorization, ordering, equal intervals, and a genuine absolute true zero.
Ã¢â‚¬Â¢ Zero Point: Natural absolute zero (signifies complete absence of the quantity).
Ã¢â‚¬Â¢ Permissible Math: All arithmetic operations (multiplication, division, geometric mean, coefficient of variation).
Ã¢â‚¬Â¢ Examples: Weight in kilograms, Monthly salary in Rupees, Distance in kilometers.`);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // STA301 â€” Lecture 2: Primary/Secondary Data, Population, Sample, Census, Sampling Frame
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sta301Subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'sta301'`).get() as { id: number } | undefined;
  if (sta301Subj) {
    const staL2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(sta301Subj.id) as { id: number } | undefined;
    if (!staL2) {
      const staL2Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 2, ?)`).run(
        sta301Subj.id,
        'Primary & Secondary Data, Population, Sample, and Sampling Frame'
      );
      const l2Id = staL2Res.lastInsertRowid;

      const ins = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // MCQ 1: Primary Data
      ins.run(l2Id, 'mcq', 'Data that have been originally collected (raw data) and have not undergone any sort of statistical treatment are called:', JSON.stringify({ a: 'Primary data', b: 'Secondary data', c: 'Raw data', d: 'Grouped data' }), 'a', 'Primary data are collected directly from source for the first time and have not been statistically processed.', 1, 1, 'lecture');

      // MCQ 2: Secondary Data
      ins.run(l2Id, 'mcq', 'Data that have undergone statistical treatment at least once, or were collected at an earlier time by a different person for a different purpose, are called:', JSON.stringify({ a: 'Primary data', b: 'Secondary data', c: 'Experimental data', d: 'Field notes' }), 'b', 'Secondary data have already been collected and processed by another agency before the current researcher uses them.', 1, 1, 'lecture');

      // MCQ 3: Census data type
      ins.run(l2Id, 'mcq', 'Which type of data is collected in a population census?', JSON.stringify({ a: 'Grouped data', b: 'Secondary data', c: 'Primary data', d: 'Array data' }), 'c', 'Census data are collected fresh by government enumerators directly from the population â€” they constitute primary data.', 1, 1, 'lecture');

      // MCQ 4: Bureau of Statistics
      ins.run(l2Id, 'mcq', 'Data obtained from the Bureau of Statistics is an example of:', JSON.stringify({ a: 'None of these', b: 'Primary data', c: 'Secondary data', d: 'Qualitative data' }), 'c', 'Bureau of Statistics data are published reports â€” they are secondary data for any external researcher who consults them.', 1, 1, 'lecture');

      // MCQ 5: Ministry / State Bank / Newspapers
      ins.run(l2Id, 'mcq', 'Data obtained from the Ministry of Food, the State Bank of Pakistan, or Newspapers is an example of:', JSON.stringify({ a: 'Primary data', b: 'Secondary data', c: 'Qualitative data', d: 'None of these' }), 'b', 'Government ministry reports, central bank bulletins, and published media are all secondary sources for a researcher who did not originally collect the data.', 1, 1, 'lecture');

      // MCQ 6: Population
      ins.run(l2Id, 'mcq', 'The collection of all elements, individuals, or objects under study that possess defined characteristics is called:', JSON.stringify({ a: 'Population', b: 'Sample', c: 'Data', d: 'Registration' }), 'a', 'A statistical population is the complete set of all units sharing the characteristic(s) being studied.', 1, 1, 'lecture');

      // MCQ 7: Sample
      ins.run(l2Id, 'mcq', 'When data are collected for only a portion or subset of all elements of interest, we are using a:', JSON.stringify({ a: 'Distribution', b: 'Sample', c: 'Census', d: 'Set' }), 'b', 'A sample is a representative subset of the population used to make statistical inferences about the whole.', 1, 1, 'lecture');

      // MCQ 8: Sampling Frame
      ins.run(l2Id, 'mcq', 'A complete list of all the elements present in the population from which a sample is drawn is technically called the:', JSON.stringify({ a: 'Sampling frame', b: 'Population frame', c: 'Sample space', d: 'Sampling error' }), 'a', 'The sampling frame is the operational list of all sampling units; without a complete frame, true random sampling is impossible.', 1, 1, 'lecture');

      // MCQ 9: Direct Personal Investigation
      ins.run(l2Id, 'mcq', 'Direct personal investigation is ________ when the area to be covered is vast.', JSON.stringify({ a: 'Costly', b: 'Time-consuming', c: 'Both costly and time-consuming', d: 'Cheap and expeditious' }), 'c', 'Direct personal investigation requires physically visiting each subject, making it both expensive and slow over large areas.', 1, 1, 'lecture');

      // MCQ 10: Questionnaire
      ins.run(l2Id, 'mcq', 'A list of questions handed over to the respondent, who reads and records answers himself, is known as a(n):', JSON.stringify({ a: 'Interview schedule', b: 'Questionnaire', c: 'Interview guide', d: 'All of the given options' }), 'b', 'A questionnaire is self-administered by the respondent; an interview schedule is filled in by the interviewer.', 1, 1, 'lecture');

      // MCQ 11: Enumerators for large-scale inquiry
      ins.run(l2Id, 'mcq', 'Which method gives the most reliable information and is considered the best when a large-scale governmental inquiry is to be conducted?', JSON.stringify({ a: 'Direct Personal Investigation', b: 'Collection through Enumerators', c: 'Collection through Local Sources', d: 'Collection through Questionnaires' }), 'b', 'Trained enumerators visit respondents and record data accurately, making this method the gold standard for large government surveys.', 1, 1, 'lecture');

      // MCQ 12: Census
      ins.run(l2Id, 'mcq', 'Complete enumeration of every element in the entire field under study is called a:', JSON.stringify({ a: 'Sample survey', b: 'Census', c: 'Registration', d: 'Experiment' }), 'b', 'A census (complete enumeration) covers every member of the population without exception.', 1, 1, 'lecture');

      // Short Q 1: Primary vs Secondary Data
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(l2Id, 'Differentiate between Primary Data and Secondary Data with examples.', `Primary Data: Data originally collected directly from the source (raw data) that have NOT undergone any statistical treatment.\nExample: National Population Census data collected by government enumerators.\n\nSecondary Data: Data already collected by another agency and subjected to statistical treatment (classification, tabulation, analysis) at least once.\nExample: Economic figures from Bureau of Statistics reports or State Bank of Pakistan publications.\n\nKey Distinction: The same data can be primary for the original collector but becomes secondary for any subsequent researcher who uses it.`, 'Primary = fresh, unprocessed, collected first-hand. Secondary = pre-processed, published, or collected by someone else earlier.');

      // Short Q 2: Define Population
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(l2Id, 'Define "Population" in the context of Statistics.', `A statistical population is the complete collection of all individuals, objects, or measurements that possess defined common characteristics and are the subject of a statistical study.\n\nExample: All students currently enrolled in universities across Punjab form the population for a study on student performance in Punjab.\n\nNote: A population may be finite (e.g., students in one class) or theoretically infinite (e.g., all possible coin tosses).`, 'Population = the complete universe of all units sharing the defined characteristic under study, from which samples are drawn.');

      // Short Q 3: Define Sample
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(l2Id, 'What is a Sample? Why is sampling used instead of a complete census?', `A sample is a representative subset of elements selected from a population used to make valid inferences about the whole.\n\nReasons for sampling:\n1. Cost - Studying every element of a large population is expensive.\n2. Time - A sample can be collected and analyzed much faster.\n3. Feasibility - A complete census may be impossible (e.g., destructive testing destroys each item).\n4. Sufficient accuracy - A properly drawn sample closely approximates population parameters.`, 'A sample balances accuracy against cost and time, making it practical for most real-world statistical studies.');

      // Short Q 4: Methods of Collecting Primary Data
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(l2Id, 'Enlist and briefly explain the five methods used for collecting Primary Data.', `1. Direct Personal Investigation - Researcher personally visits each respondent. Accurate but costly/time-consuming over vast areas.\n\n2. Indirect Investigation - Data collected through intermediaries or third parties (reporters, agents, supervisors).\n\n3. Collection through Questionnaires - Printed questions handed to respondents who fill it themselves. Cost-effective but low response rate possible.\n\n4. Collection through Enumerators - Trained field workers visit respondents, explain questions, and record answers. Most reliable for large-scale government inquiries.\n\n5. Collection through Local Sources/Correspondents - Local representatives supply data from their areas. Economical but quality depends on correspondent competence.`, 'The five methods form a spectrum: Direct Personal (most accurate, expensive) to Local Sources (economical, less reliable).');

      // Short Q 5: Sampling Frame
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(l2Id, 'Define Sampling Frame and explain its importance in statistical sampling.', `A Sampling Frame (or Frame) is a complete, well-defined list of all sampling units or elements in the finite target population from which a sample is to be selected.\n\nImportance:\n1. Ensures every population member has a known probability of selection.\n2. Without a proper frame, true random sampling is impossible.\n3. A defective frame (incomplete or outdated) introduces coverage error, making results unrepresentative.\n\nExample: For a voter survey in Lahore, the official Electoral Roll serves as the sampling frame.`, 'The sampling frame is the operational definition of the population; it must be complete and up-to-date to avoid coverage bias.');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STA301 — Lecture 3: Classification of Data, Frequency Distributions,
  //          Class Limits, Boundaries, Marks, Relative & Cumulative Frequency
  // ─────────────────────────────────────────────────────────────────────────────
  const sta301L3Subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'sta301'`).get() as { id: number } | undefined;
  if (sta301L3Subj) {
    const staL3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL3) {
      const staL3Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 3, ?)`).run(
        sta301L3Subj.id,
        'Classification of Data, Frequency Distributions, and Class Measures'
      );
      const l3Id = staL3Res.lastInsertRowid;

      const ins3 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // MCQ 1 — Basis of Classification
      ins3.run(l3Id,'mcq','In classification, the data are arranged according to:',JSON.stringify({a:'Similarities',b:'Differences',c:'Percentages',d:'Ratios'}),'a','Classification groups data by shared characteristics — i.e., by similarities.',1,1,'lecture');

      // MCQ 2 — Qualitative Classification
      ins3.run(l3Id,'mcq','Classification of data by attributes is called:',JSON.stringify({a:'Quantitative classification',b:'Chronological classification',c:'Qualitative classification',d:'Geographical classification'}),'c','Qualitative (attribute) classification groups data by non-numerical characteristics such as gender or marital status.',1,1,'lecture');

      // MCQ 3 — Geographical Classification
      ins3.run(l3Id,'mcq','Classification of data according to location or geographical areas is called:',JSON.stringify({a:'Qualitative classification',b:'Quantitative classification',c:'Geographical classification',d:'Chronological classification'}),'c','Geographical (spatial) classification organises data by region, province, or district.',1,1,'lecture');

      // MCQ 4 — Chronological Classification
      ins3.run(l3Id,'mcq','When data are arranged at regular intervals of time, the classification is called:',JSON.stringify({a:'Qualitative',b:'Quantitative',c:'Chronological',d:'Geographical'}),'c','Chronological (temporal) classification arranges data according to time periods, e.g., annual sales figures.',1,1,'lecture');

      // MCQ 5 — Class Frequency
      ins3.run(l3Id,'mcq','The number of observations falling in a particular class is called:',JSON.stringify({a:'The number of observations in each class',b:'The difference between consecutive lower class limits',c:'Always at least 5 observations',d:'Usually a multiple of the lower limit'}),'a','Class frequency (f) is simply the count of data values that fall within the boundaries of a given class.',1,1,'lecture');

      // MCQ 6 — Relative Frequency Conversion
      ins3.run(l3Id,'mcq','How is a frequency distribution converted to a relative frequency distribution?',JSON.stringify({a:'Find the difference between consecutive lower class limits',b:'Find the difference between consecutive lower limits',c:'Count the number of observations in the class',d:'Divide the class frequency by the total number of observations'}),'d','Relative frequency = class frequency ÷ total frequency (Σf). It expresses each class as a proportion of the whole.',1,1,'lecture');

      // MCQ 7 — Class Boundaries / Mathematical Limits
      ins3.run(l3Id,'mcq','If there are no gaps between consecutive classes, the limits are called:',JSON.stringify({a:'Class limits',b:'Class boundaries',c:'Class intervals',d:'Class marks'}),'b','Class boundaries (true/mathematical limits) are defined so the upper boundary of one class equals the lower boundary of the next, eliminating gaps.',1,1,'lecture');

      // MCQ 8 — Class Mark Definition
      ins3.run(l3Id,'mcq','The average of the lower and upper class limits is called:',JSON.stringify({a:'Half the sum of upper and lower class limits',b:'Class boundary',c:'Class mark',d:'Class limit'}),'c','The class mark (midpoint) = (Lower Class Limit + Upper Class Limit) / 2. It represents the central value of the class.',1,1,'lecture');

      // MCQ 9 — Class Mark Calculation Example (20–30)
      ins3.run(l3Id,'mcq','The lower and upper class limits are 20 and 30 respectively. The midpoint of this class is:',JSON.stringify({a:'20',b:'25',c:'30',d:'50'}),'b','Midpoint = (20 + 30) / 2 = 50 / 2 = 25.',1,1,'lecture');

      // MCQ 10 — Class Interval from Midpoints (step 7)
      ins3.run(l3Id,'mcq','If the class midpoints in a frequency distribution are 25, 32, 39, 46, 53, and 60, the size of the class interval is:',JSON.stringify({a:'5',b:'7',c:'8',d:'6'}),'b','Class interval h = second midpoint − first midpoint = 32 − 25 = 7.',1,1,'lecture');

      // MCQ 11 — Class Interval from Midpoints (step 8)
      ins3.run(l3Id,'mcq','If the midpoints of the classes are 16, 24, 32, 40, and so on, the magnitude of the class interval is:',JSON.stringify({a:'8',b:'9',c:'7',d:'6'}),'a','Class interval h = 24 − 16 = 8.',1,1,'lecture');

      // MCQ 12 — Constructing Class Interval
      ins3.run(l3Id,'mcq','Which of the following correctly describes how to find the class interval (h)?',JSON.stringify({a:'Divide the class frequencies in half',b:'Divide class frequency by number of observations',c:'Find the difference between consecutive lower class limits',d:'Count the number of observations in the class'}),'c','Class interval h = lower limit of next class − lower limit of current class.',1,1,'lecture');

      // MCQ 13 — Recommended Number of Classes
      ins3.run(l3Id,'mcq','The recommended number of classes in a frequency distribution generally should be:',JSON.stringify({a:'Between five and twenty',b:'Between ten and twenty',c:'Less than five',d:'More than twenty'}),'a','Sturges\' Rule and standard practice recommend 5 to 20 classes for a well-constructed frequency distribution.',1,1,'lecture');

      // MCQ 14 — Cumulative Frequency
      ins3.run(l3Id,'mcq','The total number of observations which fall below a certain upper class boundary value is known as:',JSON.stringify({a:'Class boundaries',b:'Class marks',c:'Cumulative frequency',d:'Variance'}),'c','Cumulative frequency (cf) is the running total of frequencies up to and including a given class boundary.',1,1,'lecture');

      // MCQ 15 — Exclusive Classes
      ins3.run(l3Id,'mcq','Classes in which the upper limit of one class is excluded from that class and included in the immediately following class are called:',JSON.stringify({a:'Open-end classes',b:'Close-end classes',c:'Inclusive classes',d:'Exclusive classes'}),'d','Exclusive (or open-right) classes: the upper limit belongs to the next class, so data value x falls in class [L, U) if L ≤ x < U.',1,1,'lecture');

      // MCQ 16 — First Step in Forming Frequency Distribution
      ins3.run(l3Id,'mcq','Which of the following is the first step in constructing a frequency distribution for continuous data?',JSON.stringify({a:'Number of groups',b:'Class intervals',c:'Range',d:'Class limits'}),'c','The first step is to compute the Range = X_max − X_min, which determines how wide the overall data spread is before choosing the number of classes.',1,1,'lecture');

      // ── Short Questions ──────────────────────────────────────────────────────

      // SQ1 — Class Limits vs Class Boundaries
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        l3Id,
        'Differentiate between Class Limits and Class Boundaries with examples.',
        `Class Limits: The specified minimum (lower limit) and maximum (upper limit) values that can fall into a particular class. A visible GAP exists between the upper limit of one class and the lower limit of the next.
Example: 30.0 – 32.9, 33.0 – 35.9 (gap = 0.1 between 32.9 and 33.0).

Class Boundaries (True/Mathematical Limits): Adjusted limits that eliminate all gaps between consecutive classes. The upper class boundary of one class equals the lower class boundary of the next class.
Example: 29.95 – 32.95, 32.95 – 35.95 (no gap; 32.95 is shared).

Formula: Lower Boundary = Lower Limit − 0.05 | Upper Boundary = Upper Limit + 0.05 (for data recorded to 1 decimal place).`,
        'Class limits have gaps; class boundaries eliminate gaps so data can be placed without ambiguity.'
      );

      // SQ2 — Relative Frequency Distribution
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        l3Id,
        'Define Relative Frequency Distribution and write its formula.',
        `Definition: A relative frequency distribution expresses each class frequency as a proportion (fraction) of the total number of observations. It shows what fraction of the data falls in each class.

Formula:
  Relative Frequency = f / Σf = Class Frequency / Total Frequency

Where:
  f = frequency of the class
  Σf = sum of all class frequencies (total observations)

Property: The sum of all relative frequencies always equals 1 (or 100% for percentage frequency distribution).

Example: If a class has f = 14 and total Σf = 30, then Relative Frequency = 14/30 = 0.467 (46.7%).`,
        'Relative frequency = class frequency ÷ total frequency. All relative frequencies sum to 1.'
      );

      // SQ3 — Types of Classification
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        l3Id,
        'Enlist the four main types/bases of classification of data with one example each.',
        `Data can be classified into four fundamental types:

1. Qualitative Classification (by Attributes): Data classified by non-numerical characteristics.
   Example: Population classified by gender (Male / Female) or by marital status.

2. Quantitative Classification (by Variables): Data classified by measurable numerical values.
   Example: Students grouped by marks obtained: 0–49, 50–59, 60–69, 70–79, 80–100.

3. Geographical / Spatial Classification (by Area or Location): Data classified according to geographic region.
   Example: Population of Pakistan classified by province (Punjab, Sindh, KPK, Balochistan).

4. Chronological / Temporal Classification (by Time): Data arranged at regular time intervals.
   Example: Pakistan's GDP figures from 2018 to 2023 arranged year by year.`,
        'The four bases are: Qualitative (attributes), Quantitative (variables), Geographical (location), Chronological (time).'
      );

      // SQ4 — Class Mark Definition and Formula
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        l3Id,
        'Define Class Mark (Midpoint) and state how it is calculated.',
        `Definition: The class mark (also called midpoint or class midpoint) is the central representative value of a class interval. It is the point that lies exactly halfway between the lower and upper class limits (or boundaries).

Formula:
  Class Mark (X) = (Lower Class Limit + Upper Class Limit) / 2
                 = (Lower Class Boundary + Upper Class Boundary) / 2

Example:
  For class 30.0 – 32.9:
  Class Mark = (30.0 + 32.9) / 2 = 62.9 / 2 = 31.45

  For class 20 – 30:
  Class Mark = (20 + 30) / 2 = 25

Use: Class marks are used in calculations of mean and other statistics from grouped frequency distributions.`,
        'Class mark = (Lower Limit + Upper Limit) / 2. It represents the entire class in further arithmetic calculations.'
      );

      // ── Long Question — Numerical Problem ─────────────────────────────────────
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`).run(
        l3Id,
        `Given the following frequency distribution, calculate: (i) Class Boundaries, (ii) Class Midpoints (X), (iii) Relative Frequencies, and (iv) Cumulative Frequencies (cf).

Class Limits    | Frequency (f)
30.0 – 32.9    |  2
33.0 – 35.9    |  4
36.0 – 38.9    | 14
39.0 – 41.9    |  8
42.0 – 44.9    |  2
Total           | 30`,
        `Step 1 — Total Frequency: Σf = 2 + 4 + 14 + 8 + 2 = 30

Step 2 — Class Boundaries (subtract 0.05 from lower limit; add 0.05 to upper limit):
  30.0–32.9 → 29.95–32.95
  33.0–35.9 → 32.95–35.95
  36.0–38.9 → 35.95–38.95
  39.0–41.9 → 38.95–41.95
  42.0–44.9 → 41.95–44.95

Step 3 — Class Midpoints: X = (Lower Limit + Upper Limit) / 2
  (30.0+32.9)/2 = 31.45
  (33.0+35.9)/2 = 34.45
  (36.0+38.9)/2 = 37.45
  (39.0+41.9)/2 = 40.45
  (42.0+44.9)/2 = 43.45

Step 4 — Relative Frequencies (f / Σf):
  2/30  = 0.067
  4/30  = 0.133
  14/30 = 0.467
  8/30  = 0.267
  2/30  = 0.067
  Sum   = 1.000 ✓

Step 5 — Cumulative Frequencies (running total):
  2 → 2+4=6 → 6+14=20 → 20+8=28 → 28+2=30

COMPLETE TABLE:
Class Limits  | Boundaries      | X     | f  | Rel.f | cf
30.0–32.9    | 29.95–32.95     | 31.45 |  2 | 0.067 |  2
33.0–35.9    | 32.95–35.95     | 34.45 |  4 | 0.133 |  6
36.0–38.9    | 35.95–38.95     | 37.45 | 14 | 0.467 | 20
39.0–41.9    | 38.95–41.95     | 40.45 |  8 | 0.267 | 28
42.0–44.9    | 41.95–44.95     | 43.45 |  2 | 0.067 | 30
Total         |                 |       | 30 | 1.000 |`,
        'This problem tests all core Lecture 3 calculations in one: boundaries (±0.05), midpoints (average of limits), relative freq (f/Σf), and cumulative freq (running total).'
      );
    }

    // STA301 — Lecture 4: Graphical Representation of Data, Frequency Diagrams & Stem-and-Leaf
    const staL4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL4) {
      const l4Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 4, 'Graphical Representation of Data, Frequency Diagrams & Stem-and-Leaf')`).run(
        sta301L3Subj.id
      );
      const l4Id = l4Res.lastInsertRowid;

      const ins4 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 24 MCQs
      const mcqsL4 = [
        {
          stem: 'A chart consisting of horizontal or vertical bars of equal width and lengths proportional to the values they represent is called a:',
          options: { a: 'Pie Chart', b: 'Component Bar Chart', c: 'Simple Bar Chart', d: 'Multiple Bar Chart' },
          correct: 'c',
          explanation: 'A simple bar chart uses bars of equal width where the height/length represents the values.',
          urdu_answer: 'سادہ بار چارٹ مساوی چوڑائی والی سلاخوں پر مشتمل ہوتا ہے جن کی لمبائی اقدار کے متناسب ہوتی ہے۔'
        },
        {
          stem: 'In a simple bar chart:',
          options: { a: 'Width of bar is meaningful', b: 'Height of bar is meaningful', c: 'Height of bar is not meaningful', d: 'Height and width both are meaningful' },
          correct: 'b',
          explanation: 'Only the height of the bar is meaningful; width has no mathematical significance.',
          urdu_answer: 'سادہ بار چارٹ میں صرف بار کی اونچائی (Height) بامعنی ہوتی ہے، چوڑائی نہیں۔'
        },
        {
          stem: 'From the given data (Year: 1965, 1966, 1967... Turnover: 350000, 42000, 43500...), which one of the following charts can we draw?',
          options: { a: 'Simple bar chart', b: 'Multiple bar charts', c: 'Component bar chart', d: 'Pie chart' },
          correct: 'a',
          explanation: 'A single variable recorded across different years is represented using a simple bar chart.',
          urdu_answer: 'وقت کے ساتھ ایک متغیر کے اعداد و شمار کو سادہ بار چارٹ سے ظاہر کیا جاتا ہے۔'
        },
        {
          stem: 'Component bar charts are used when data is divided into:',
          options: { a: 'Parts', b: 'Groups', c: 'Circles', d: 'None of the above' },
          correct: 'a',
          explanation: 'A component (sub-divided) bar chart is used when total values are split into component parts.',
          urdu_answer: 'کمپوننٹ بار چارٹ اس وقت بنتا ہے جب ڈیٹا مختلف حصوں (Parts) میں تقسیم ہو۔'
        },
        {
          stem: 'Which of the following techniques is NOT used to represent bivariate qualitative data?',
          options: { a: 'Pie Chart', b: 'Component Bar Chart', c: 'Multiple Bar Chart', d: 'Line Chart' },
          correct: 'd',
          explanation: 'Line charts are used for quantitative time-series data, not for bivariate qualitative data.',
          urdu_answer: 'لائن چارٹ وقت کے مقداری ڈیٹا کے لیے ہوتا ہے، کوالٹیٹیو ڈیٹا کے لیے نہیں۔'
        },
        {
          stem: 'A circle in which sectors represent various quantities is called a:',
          options: { a: 'Histogram', b: 'Frequency Polygon', c: 'Pie Chart', d: 'Component Bar Chart' },
          correct: 'c',
          explanation: 'A pie chart divides a circle into sectors proportional to the quantities they represent.',
          urdu_answer: 'دائرے میں سیکٹرز کے ذریعے مقداروں کو دکھانا پائی چارٹ (Pie Chart) کہلاتا ہے۔'
        },
        {
          stem: 'A sector diagram is also called a:',
          options: { a: 'Bar diagram', b: 'Histogram', c: 'Historigram', d: 'Pie diagram / Pie chart' },
          correct: 'd',
          explanation: 'A pie chart is also known as a sector diagram.',
          urdu_answer: 'سیکٹر ڈایاگرام کو پائی چارٹ یا پائی ڈایاگرام بھی کہتے ہیں۔'
        },
        {
          stem: 'A pie chart consists of:',
          options: { a: 'A rectangle', b: 'A triangle', c: 'A square', d: 'A circle' },
          correct: 'd',
          explanation: 'A pie chart is constructed inside a circle.',
          urdu_answer: 'پائی چارٹ ایک دائرے (Circle) پر مشتمل ہوتا ہے۔'
        },
        {
          stem: 'The total angle of a Pie Chart is:',
          options: { a: '90°', b: '180°', c: '270°', d: '360°' },
          correct: 'd',
          explanation: 'A full circle has a total angle of 360 degrees.',
          urdu_answer: 'پائی چارٹ کا کل زاویہ 360 ڈگری ہوتا ہے۔'
        },
        {
          stem: 'In a Pie chart, the angle for each sector is calculated by the formula:',
          options: { a: '(Component part / Total) × 100', b: '(Component part / Total) × π', c: '(Total / Component part) × 360', d: '(Component part / Total) × 360°' },
          correct: 'd',
          explanation: 'Sector angle = (Component value / Total value) × 360°.',
          urdu_answer: 'سیکٹر اینگل = (جزوی قیمت / کل قیمت) × 360 ڈگری۔'
        },
        {
          stem: 'A Histogram contains a set of:',
          options: { a: 'Adjacent Rectangles', b: 'Non-adjacent Rectangles', c: 'Adjacent Squares', d: 'Adjacent Triangles' },
          correct: 'a',
          explanation: 'A histogram is composed of a set of adjacent (touching) rectangles.',
          urdu_answer: 'ہسٹوگرام آپس میں جڑی ہوئی مستطیلوں (Adjacent Rectangles) پر مشتمل ہوتا ہے۔'
        },
        {
          stem: 'A histogram consists of a set of adjacent rectangles whose bases are marked off by:',
          options: { a: 'Class boundaries', b: 'Class limits', c: 'Class marks', d: 'Class frequency' },
          correct: 'a',
          explanation: 'The horizontal base of each rectangle in a histogram is defined by true class boundaries.',
          urdu_answer: 'ہسٹوگرام میں مستطیلوں کی بنیادیں کلاس باؤنڈریز (Class boundaries) پر بنائی جاتی ہیں۔'
        },
        {
          stem: 'The mode of a frequency distribution can be determined graphically by a:',
          options: { a: 'Histogram', b: 'Frequency curve', c: 'Frequency polygon', d: 'Ogive' },
          correct: 'a',
          explanation: 'Mode can be found graphically by identifying the tallest rectangle in a histogram.',
          urdu_answer: 'موڈ (Mode) کو گراف کی مدد سے معلوم کرنے کے لیے ہسٹوگرام کا استعمال کیا جاتا ہے۔'
        },
        {
          stem: 'A frequency polygon is constructed by plotting frequency of the class interval against the:',
          options: { a: 'Upper limit of the class', b: 'Lower limit of the class', c: 'Mid value (midpoint) of the class', d: 'None of the above' },
          correct: 'c',
          explanation: 'Frequency polygon points are plotted at (class midpoint, class frequency).',
          urdu_answer: 'فریکوئنسی پولیگون میں فریکوئنسی کو کلاس کے مڈپوائنٹ کے سامنے پلاٹ کیا جاتا ہے۔'
        },
        {
          stem: 'If you connect the mid-points of rectangles in a histogram by a series of lines that also touches the x-axis from both ends, you get a:',
          options: { a: 'Ogive', b: 'Frequency polygon', c: 'Frequency curve', d: 'Historigram' },
          correct: 'b',
          explanation: 'Joining the midpoints of histogram tops with straight lines touching the x-axis forms a frequency polygon.',
          urdu_answer: 'مستطیلوں کے مڈپوائنٹس کو سیدھی لکیروں سے جوڑنے سے فریکوئنسی پولیگون بنتا ہے۔'
        },
        {
          stem: 'A graph of a cumulative frequency distribution is called a(n):',
          options: { a: 'Ogive / Ogive Curve', b: 'Frequency Polygon', c: 'Pie Chart', d: 'Bar Chart' },
          correct: 'a',
          explanation: 'An Ogive is the graph of a cumulative frequency distribution.',
          urdu_answer: 'مجموعی فریکوئنسی (Cumulative Frequency) کے گراف کو اوجائیو (Ogive) کہتے ہیں۔'
        },
        {
          stem: 'The data for an ogive is found in which distribution?',
          options: { a: 'Frequency distribution', b: 'Cumulative frequency distribution', c: 'Relative frequency distribution', d: 'Continuous distribution' },
          correct: 'b',
          explanation: 'An ogive is plotted directly from a cumulative frequency distribution.',
          urdu_answer: 'اوجائیو کے لیے ڈیٹا مجموعی فریکوئنسی ڈسٹریبیوشن سے لیا جاتا ہے۔'
        },
        {
          stem: 'Which graph is used for time series data?',
          options: { a: 'Frequency curve', b: 'Frequency polygon', c: 'Historigram', d: 'Histogram' },
          correct: 'c',
          explanation: 'A historigram is a line graph of time series data plotted against time.',
          urdu_answer: 'وقت کے ساتھ تبدیلی دکھانے والے ٹائم سیریز ڈیٹا کے لیے ہسٹوریگرام استعمال ہوتا ہے۔'
        },
        {
          stem: 'Stem and leaf display was introduced by:',
          options: { a: 'Francis Galton', b: 'Friedman', c: 'John Tukey', d: 'Pearson' },
          correct: 'c',
          explanation: 'John Tukey introduced the stem-and-leaf display in 1977.',
          urdu_answer: 'اسٹیم اینڈ لیف ڈسپلے کو جان ٹوکی (John Tukey) نے 1977 میں متعارف کرایا۔'
        },
        {
          stem: 'In a stem and leaf display, the leading digit is called _____ and trailing digit is called _____:',
          options: { a: 'Stem, Leaf', b: 'Leaf, Stem', c: 'Variable, Constant', d: 'Class, Interval' },
          correct: 'a',
          explanation: 'The leading digit forms the Stem, and the trailing digit forms the Leaf.',
          urdu_answer: 'پہلے ہندسے کو اسٹیم (Stem) اور آخری ہندسے کو لیف (Leaf) کہتے ہیں۔'
        },
        {
          stem: "If '2' is a leading digit in 24335, what are the trailing digits in a Stem-and-Leaf display?",
          options: { a: '4', b: '335', c: '4335', d: '43' },
          correct: 'c',
          explanation: 'If 2 is the stem (leading digit), the remaining digits 4335 form the leaf.',
          urdu_answer: 'اگر 2 اسٹیم ہے تو باقی ہندسے 4335 لیف بنیں گے۔'
        },
        {
          stem: 'For the data values 12, 48, 31, 54, 71, 29, 42, 62, 67, 57, 74, 27, 18, 71, 26, the stem values are:',
          options: { a: '2, 8, 1, 4, 9, 2, 2, 7, 7, 7, 4, 7, 8, 71, 6', b: '1, 2, 3, 4, 5, 6, 7', c: '2, 2, 3, 4, 5, 7, 8', d: '9, 2, 4, 7, 9, 8, 7, 5' },
          correct: 'b',
          explanation: 'The tens digits (10s through 70s) form the stems: 1, 2, 3, 4, 5, 6, 7.',
          urdu_answer: 'دہائی کے ہندسے 1 سے 7 تک اسٹیم بنائیں گے۔'
        },
        {
          stem: 'In a stem and leaf plot, what separates the leaf from the stem?',
          options: { a: 'Horizontal line', b: 'Vertical line', c: 'Dot line', d: 'Slash' },
          correct: 'b',
          explanation: 'A vertical line separates the stem column on the left from the leaves on the right.',
          urdu_answer: 'اسٹیم اور لیف کے درمیان ایک عمودی لکیر (Vertical line) ہوتی ہے۔'
        },
        {
          stem: 'The mode value from raw data can be obtained easily with the help of a:',
          options: { a: 'Dot plot', b: 'Stem and leaf plot', c: 'Bar chart', d: 'None of these' },
          correct: 'b',
          explanation: 'A stem-and-leaf plot retains all original values and groups identical digits together, making mode easy to spot.',
          urdu_answer: 'اسٹیم اینڈ لیف پلاٹ میں تمام اصل قیمتیں موجود ہوتی ہیں جس سے موڈ آسانی سے مل جاتا ہے۔'
        }
      ];

      for (const m of mcqsL4) {
        ins4.run(l4Id, 'mcq', m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 5 Short Questions
      const shortsL4 = [
        {
          stem: 'Define multiple bar chart.',
          correct: `A Multiple Bar Chart consists of two or more bars drawn side-by-side in groups for each category.
• Purpose: Used to compare two or more related variables across different categories or years at the same time.`,
          explanation: 'Multiple bar charts group bars together to compare related variables.',
          urdu_answer: 'ملٹیپل بار چارٹ میں ہر کیٹیگری کے لیے دو یا زیادہ بارز ساتھ ساتھ بنائی جاتی ہیں تاکہ موازنہ کیا جا سکے۔'
        },
        {
          stem: 'Define Histogram. On which axis are class boundaries plotted?',
          correct: `• Definition: A Histogram is a graph made of adjacent (touching) rectangles where rectangle area is proportional to class frequency.
• Axis: True Class Boundaries are plotted on the horizontal axis (X-axis), and frequencies are plotted on the vertical axis (Y-axis).`,
          explanation: 'A histogram has adjacent rectangles plotted over class boundaries on the X-axis.',
          urdu_answer: 'ہسٹوگرام آپس میں جڑی مستطیلوں کا گراف ہے۔ کلاس باؤنڈریز X-axis پر اور فریکوئنسی Y-axis پر ہوتی ہے۔'
        },
        {
          stem: 'Differentiate between Frequency Polygon and Frequency Curve.',
          correct: `• Frequency Polygon: Constructed by plotting frequencies against class midpoints and joining the points with straight line segments.
• Frequency Curve: Drawn as a smooth, freehand curve passing through or near the points, removing sharp corners.`,
          explanation: 'Polygon uses straight lines; Curve uses a smooth freehand line.',
          urdu_answer: 'فریکوئنسی پولیگون سیدھی لکیروں سے بنتا ہے، جبکہ فریکوئنسی کرو ایک ہموار (Smooth) خمیدہ لکیر ہوتی ہے۔'
        },
        {
          stem: 'What is an Ogive? How is it constructed?',
          correct: `• Definition: An Ogive is a line graph representing a cumulative frequency distribution.
• Construction: Plot cumulative frequencies on the vertical axis (Y-axis) against upper class boundaries on the horizontal axis (X-axis), and connect points with straight lines.`,
          explanation: 'An ogive plots cumulative frequency against upper class boundaries.',
          urdu_answer: 'اوجائیو مجموعی فریکوئنسی کا گراف ہے۔ اسے اپر کلاس باؤنڈری اور مجموعی فریکوئنسی کو ملا کر بنایا جاتا ہے۔'
        },
        {
          stem: 'What is a Stem-and-Leaf Display? State its main advantage over a frequency table.',
          correct: `• Definition: A graph that splits each number into a Stem (leading digit) and a Leaf (trailing digit).
• Main Advantage: Unlike a frequency table where original data values are lost in classes, a stem-and-leaf plot keeps all original numbers while showing data shape.`,
          explanation: 'Stem-and-leaf separates leading and trailing digits, preserving all original numbers.',
          urdu_answer: 'اسٹیم اینڈ لیف اعداد کو دو حصوں میں بانٹتا ہے۔ اس کا بڑا فائدہ یہ ہے کہ اصل ڈیٹا ضائع نہیں ہوتا۔'
        }
      ];

      for (const s of shortsL4) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')`).run(
          l4Id, s.stem, s.correct, s.explanation, s.urdu_answer
        );
      }

      // 2 Long / Problem-solving Questions (5 marks each)
      const longsL4 = [
        {
          stem: 'The table shows the medium of instruction chosen by 1200 students: Urdu = 719, English = 481 (Total = 1200). Calculate the sector angles to construct a Pie Chart.',
          correct: `Formula: Sector Angle = (Component / Total) × 360°

Calculations:
1. Urdu Medium:
   Angle = (719 / 1200) × 360° = 215.7°

2. English Medium:
   Angle = (481 / 1200) × 360° = 144.3°

Check: 215.7° + 144.3° = 360.0°`,
          explanation: 'Urdu sector = 215.7°, English sector = 144.3°.',
          urdu_answer: 'اردو میڈیم کا زاویہ 215.7 ڈگری اور انگلش کا 144.3 ڈگری بنتا ہے۔'
        },
        {
          stem: 'Construct a Stem-and-Leaf display for the test scores: 12, 48, 31, 54, 71, 29, 42, 62, 67, 57, 74, 27, 18, 71, 26.',
          correct: `Step 1: Sort data in order:
12, 18, 26, 27, 29, 31, 42, 48, 54, 57, 62, 67, 71, 71, 74

Step 2: Stem (tens digit) | Leaf (units digit):

Stem | Leaf    | Frequency
-----+---------+----------
  1  | 2 8     |    2
  2  | 6 7 9   |    3
  3  | 1       |    1
  4  | 2 8     |    2
  5  | 4 7     |    2
  6  | 2 7     |    2
  7  | 1 1 4   |    3
Total frequency = 15`,
          explanation: 'Stem represents tens digit (1 to 7); leaf represents units digit.',
          urdu_answer: 'اسٹیم میں دہائی (1 سے 7) اور لیف میں اکائی کے ہندسے ترتیب سے لکھے جاتے ہیں۔'
        }
      ];

      for (const l of longsL4) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')`).run(
          l4Id, l.stem, l.correct, l.explanation, l.urdu_answer
        );
      }
    }

    // STA301 — Lecture 5: Measures of Central Tendency (Arithmetic, Geometric, Harmonic Mean)
    const staL5 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 5`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL5) {
      const l5Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 5, 'Measures of Central Tendency (Arithmetic, Geometric, Harmonic Mean)')`).run(
        sta301L3Subj.id
      );
      const l5Id = l5Res.lastInsertRowid;

      const ins5 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 14 MCQs
      const mcqsL5 = [
        {
          stem: 'The average which is defined as the reciprocal of the arithmetic mean of the reciprocals of the values is called:',
          options: { a: 'Geometric Mean', b: 'Harmonic Mean', c: 'Mode', d: 'Median' },
          correct: 'b',
          explanation: 'Harmonic Mean is defined as the reciprocal of the arithmetic mean of the reciprocals of the observations: H.M. = n / Σ(1/X).',
          urdu_answer: 'ہارمونک مین (Harmonic Mean) دی گئی قیمتوں کے الٹ کے حسابی اوسط کا الٹ ہوتا ہے۔'
        },
        {
          stem: 'Which is the appropriate average for finding the average speed of a car / automobile running over equal distances at different speeds?',
          options: { a: 'Arithmetic Mean', b: 'Geometric Mean', c: 'Harmonic Mean', d: 'Weighted Mean' },
          correct: 'c',
          explanation: 'Harmonic Mean is the most appropriate average when calculating the average speed over equal distances with varying speeds.',
          urdu_answer: 'مساوی فاصلوں کے لیے مختلف رفتاروں پر اوسط رفتار نکالنے کے لیے ہارمونک مین سب سے موزوں اوسط ہے۔'
        },
        {
          stem: 'The algebraic sum of deviations of the values from their arithmetic mean is always equal to:',
          options: { a: 'Maximum', b: 'Minimum', c: 'Zero', d: 'Undefined' },
          correct: 'c',
          explanation: 'A fundamental property of the Arithmetic Mean is that the algebraic sum of deviations from it is always zero: Σ(X - X̄) = 0.',
          urdu_answer: 'حسابی اوسط (A.M.) سے تمام قیمتوں کے انحرافات کا مجموعہ ہمیشہ صفر (Zero) ہوتا ہے: Σ(X - X̄) = 0۔'
        },
        {
          stem: 'The sum of squared deviations from the arithmetic mean is always:',
          options: { a: 'Undefined', b: 'Zero', c: 'Maximum', d: 'Minimum' },
          correct: 'd',
          explanation: 'The sum of squared deviations from the mean is minimum: Σ(X - X̄)² is smaller than the sum of squared deviations from any other value.',
          urdu_answer: 'حسابی اوسط کے گرد مربعی انحرافات کا مجموعہ ہمیشہ کم سے کم (Minimum) ہوتا ہے۔'
        },
        {
          stem: 'If any value in the data set is zero, then it is not possible to calculate:',
          options: { a: 'Harmonic Mean', b: 'Arithmetic Mean', c: 'Median', d: 'Mode' },
          correct: 'a',
          explanation: 'Harmonic Mean involves 1/X. When any value X = 0, division by zero is undefined, making H.M. impossible to compute.',
          urdu_answer: 'اگر ڈیٹا میں کوئی قیمت صفر ہو تو 1/0 غیر معینہ ہو جاتا ہے، اس لیے ہارمونک مین معلوم نہیں کیا جا سکتا۔'
        },
        {
          stem: 'If an observation in the data set is negative, then the geometric mean is:',
          options: { a: 'Positive', b: 'Negative', c: 'Zero', d: 'Undetermined / Undefined' },
          correct: 'd',
          explanation: 'Geometric Mean uses logarithms or nth roots of products; logarithms of negative numbers are undefined in real numbers.',
          urdu_answer: 'اگر ڈیٹا میں کوئی منفی عدد ہو تو حقیقی اعداد میں لاگ غیر معینہ ہوتا ہے، لہٰذا جیومیٹرک مین Undefined ہوگا۔'
        },
        {
          stem: 'The correct mathematical relationship among Arithmetic Mean (AM), Geometric Mean (GM), and Harmonic Mean (HM) for distinct positive values is:',
          options: { a: 'HM ≥ GM ≥ AM', b: 'AM ≥ GM ≥ HM', c: 'GM ≤ HM ≤ AM', d: 'AM ≥ HM < GM' },
          correct: 'b',
          explanation: 'For any set of positive numbers, Arithmetic Mean is greater than or equal to Geometric Mean, which is greater than or equal to Harmonic Mean: AM ≥ GM ≥ HM.',
          urdu_answer: 'مثبت اعداد کے لیے ہمیشہ حسابی اوسط جیومیٹرک اوسط سے بڑی، اور جیومیٹرک اوسط ہارمونک اوسط سے بڑی ہوتی ہے: AM ≥ GM ≥ HM۔'
        },
        {
          stem: 'If the Geometric Mean (GM) of a set of two observations is 10 and its Harmonic Mean (HM) is 8, then the Arithmetic Mean (AM) of the set of observations is:',
          options: { a: '100', b: '12.5', c: '64', d: '7.5' },
          correct: 'b',
          explanation: 'For two positive numbers: AM × HM = GM². Therefore, AM × 8 = 10² = 100 ⇒ AM = 100 / 8 = 12.5.',
          urdu_answer: 'دو اعداد کے لیے AM × HM = GM² ہوتا ہے۔ پس AM × 8 = 100 جس سے AM = 12.5 حاصل ہوتا ہے۔'
        },
        {
          stem: 'Harmonic mean gives more weightage to:',
          options: { a: 'Smaller values', b: 'Larger values', c: 'Both values', d: 'None of the above' },
          correct: 'a',
          explanation: 'Because values are reciprocated (1/X), smaller numbers result in larger reciprocal values, giving them greater weight.',
          urdu_answer: 'چونکہ ہارمونک مین میں قیمتوں کا الٹ (1/X) لیا جاتا ہے، اس لیے چھوٹی قیمتوں (Smaller values) کو زیادہ وزن ملتا ہے۔'
        },
        {
          stem: 'Harmonic mean is extremely useful in averaging which types of data?',
          options: { a: 'Ratios', b: 'Rates', c: 'Both ratios and rates', d: 'None of the above' },
          correct: 'c',
          explanation: 'Harmonic Mean is specifically used for averaging rates, speeds, and ratios where the numerator quantity is constant.',
          urdu_answer: 'ہارمونک مین شرحوں (Rates) اور تناسب (Ratios) کا اوسط معلوم کرنے کے لیے انتہائی مفید ہے۔'
        },
        {
          stem: 'The value of Harmonic Mean depends on:',
          options: { a: 'All the observations', b: 'Few observations', c: 'Extreme values only', d: 'None of the above' },
          correct: 'a',
          explanation: 'Harmonic Mean is rigidly defined and strictly uses all observations in the dataset.',
          urdu_answer: 'ہارمونک مین کی قیمت تمام مشاہدات (All observations) پر منحصر ہوتی ہے۔'
        },
        {
          stem: 'Which one is the formula of Mid-Range?',
          options: { a: 'X_m - X_0', b: 'X_0 - X_m', c: '(X_m - X_0) / 2', d: '(X_0 + X_m) / 2' },
          correct: 'd',
          explanation: 'Mid-Range is the arithmetic mean of the smallest (X_0) and largest (X_m) observations: Mid-Range = (X_0 + X_m) / 2.',
          urdu_answer: 'مڈ رینج (Mid-Range) کا فارمولا سب سے چھوٹی اور سب سے بڑی قیمت کے اوسط کے برابر ہوتا ہے: (X_0 + X_m) / 2۔'
        },
        {
          stem: 'Which one is the formula of Mid-Quartile Range (Mid-Hinge)?',
          options: { a: 'Q3 - Q1', b: '(Q3 - Q1) / 2', c: '(Q1 - Q3) / 2', d: '(Q1 + Q3) / 2' },
          correct: 'd',
          explanation: 'Mid-Quartile Range (also called Mid-Hinge) is the arithmetic mean of the first and third quartiles: (Q1 + Q3) / 2.',
          urdu_answer: 'مڈ کوارٹائل رینج کا فارمولا پہلے اور تیسرے کوارٹائل کا اوسط ہوتا ہے: (Q1 + Q3) / 2۔'
        },
        {
          stem: 'Which one of the following is NOT included in measures of central tendency?',
          options: { a: 'Arithmetic Mean', b: 'Harmonic Mean', c: 'Geometric Mean', d: 'Quartile Deviation' },
          correct: 'd',
          explanation: 'Quartile Deviation is a measure of dispersion, whereas AM, GM, and HM are measures of central tendency.',
          urdu_answer: 'کوارٹائل ڈیوی ایشن پھیلاؤ (Dispersion) کی پیمائش ہے، یہ مرکزی رجحان (Central Tendency) کی پیمائش نہیں ہے۔'
        }
      ];

      for (const m of mcqsL5) {
        ins5.run(l5Id, 'mcq', m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 6 Short Questions (3 marks each)
      const shortsL5 = [
        {
          stem: 'Write down two main properties of an average.',
          correct: `1. Single Representative Value: An average is a single numerical value that represents the central location and overall characteristics of an entire data set.
2. Point of Central Clustering: It serves as the central balance point around which individual observations tend to cluster or concentrate.`,
          explanation: 'An average is a single central figure that represents the entire distribution.',
          urdu_answer: '1. اوسط ایک واحد نمائندہ قیمت ہے جو پورے ڈیٹا کے رجحان کو ظاہر کرتی ہے۔ 2. یہ وہ مرکزی نقطہ ہے جس کے گرد تمام اعداد و شمار جمع ہوتے ہیں۔'
        },
        {
          stem: 'Enlist any two mathematical properties of Arithmetic Mean.',
          correct: `1. Sum of Deviations is Zero: The algebraic sum of deviations of all observations from their arithmetic mean is always equal to zero:
   Σ(X - X̄) = 0
2. Sum of Squared Deviations is Minimum: The sum of squared deviations from the mean is smaller than from any arbitrary value A:
   Σ(X - X̄)² < Σ(X - A)²  (for A ≠ X̄)`,
          explanation: 'The sum of deviations from AM is 0, and the sum of squared deviations is minimized.',
          urdu_answer: '1. حسابی اوسط سے انحرافات کا مجموعہ صفر ہوتا ہے: Σ(X - X̄) = 0۔ 2. حسابی اوسط کے گرد مربعی انحرافات کا مجموعہ ہمیشہ کم سے کم ہوتا ہے۔'
        },
        {
          stem: 'Define Harmonic Mean and write its formula for raw and grouped data.',
          correct: `• Definition: Harmonic Mean (H.M.) is defined as the reciprocal of the arithmetic mean of the reciprocals of the observations.
• Formula for Ungrouped / Raw Data:
   H.M. = n / Σ(1 / X)
• Formula for Grouped Data:
   H.M. = Σf / Σ(f / X)`,
          explanation: 'Harmonic Mean is the reciprocal of the arithmetic mean of reciprocals.',
          urdu_answer: 'ہارمونک مین مشاہدات کے الٹ کے حسابی اوسط کا الٹ ہے۔ فارمولا برائے غیر گروہی ڈیٹا: H.M = n / Σ(1/X)۔'
        },
        {
          stem: 'State the rules for deciding when to use Arithmetic Mean, Geometric Mean, or Harmonic Mean for rates and speeds.',
          correct: `1. Harmonic Mean: Used when rates or speeds are expressed as distance per time, where the distance (numerator) is constant and time is variable.
2. Arithmetic Mean: Used when rates are expressed as distance per time, where time (denominator) is constant and distance is variable.
3. Geometric Mean: Used when averaging relative changes, percentages, ratios, or exponential growth rates over time.`,
          explanation: 'Fixed distance → Harmonic Mean; Fixed time → Arithmetic Mean; Growth rates/ratios → Geometric Mean.',
          urdu_answer: '1. مساوی فاصلے کے لیے ہارمونک مین۔ 2. یکساں وقت کے لیے حسابی اوسط۔ 3. شرح نمو اور تناسب کے لیے جیومیٹرک مین استعمال ہوتا ہے۔'
        },
        {
          stem: 'A class consists of two sections. Section A has n1 = 30 students with a mean score of X̄1 = 75 marks. Section B has n2 = 20 students with a mean score of X̄2 = 85 marks. Calculate the combined mean score (X̄c) for the entire class.',
          correct: `Formula:
X̄c = (n1·X̄1 + n2·X̄2) / (n1 + n2)

Step-by-step Calculation:
• Section A total marks: 30 × 75 = 2250
• Section B total marks: 20 × 85 = 1700
• Total combined marks: 2250 + 1700 = 3950
• Total number of students: 30 + 20 = 50
• Combined Mean X̄c = 3950 / 50 = 79 marks

Result: The combined mean score for the entire class is 79 marks.`,
          explanation: 'Combined Mean = (30×75 + 20×85) / (30 + 20) = 3950 / 50 = 79.',
          urdu_answer: 'کمبائنڈ مین = (30×75 + 20×85) / 50 = 3950 / 50 = 79 نمبر۔'
        },
        {
          stem: 'If the Geometric Mean of two numbers is 12 and their Arithmetic Mean is 16, find their Harmonic Mean.',
          correct: `Formula:
For two positive numbers:
AM × HM = GM²

Step-by-step Calculation:
• Given: AM = 16, GM = 12
• 16 × HM = (12)²
• 16 × HM = 144
• HM = 144 / 16 = 9

Result: The Harmonic Mean of the two numbers is 9.`,
          explanation: 'AM × HM = GM² ⇒ 16 × HM = 144 ⇒ HM = 9.',
          urdu_answer: 'فارمولا: AM × HM = GM²۔ پس 16 × HM = 144 جس سے HM = 9 حاصل ہوتا ہے۔'
        }
      ];

      for (const s of shortsL5) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')`).run(
          l5Id, s.stem, s.correct, s.explanation, s.urdu_answer
        );
      }

      // 2 Long Questions (5 marks each)
      const longsL5 = [
        {
          stem: 'Calculate the Geometric Mean (G.M.) for the following raw dataset: 45, 32, 37, 46, 39, 36, 41, 48, 36.',
          correct: `Formula:
G.M. = antilog( (Σ log X) / n )

Step 1: Compute log10(X) for each of the 9 observations:
• log(45) = 1.6532
• log(32) = 1.5051
• log(37) = 1.5682
• log(46) = 1.6628
• log(39) = 1.5911
• log(36) = 1.5563
• log(41) = 1.6128
• log(48) = 1.6812
• log(36) = 1.5563

Sum of Logarithms:
Σ log X = 1.6532 + 1.5051 + 1.5682 + 1.6628 + 1.5911 + 1.5563 + 1.6128 + 1.6812 + 1.5563 = 14.3870

Step 2: Calculate Mean of Logarithms (n = 9):
(Σ log X) / n = 14.3870 / 9 = 1.59855

Step 3: Antilogarithm:
G.M. = antilog(1.59855) = 10^1.59855 ≈ 39.68

Result: The Geometric Mean of the dataset is 39.68.`,
          explanation: 'G.M. = antilog(Σ log X / n) = antilog(14.3870 / 9) = 39.68.',
          urdu_answer: 'تمام 9 قیمتوں کے لاگ کا مجموعہ 14.3870 ہے۔ 9 پر تقسیم کر کے اینٹی لاگ لینے سے جیومیٹرک مین 39.68 حاصل ہوتا ہے۔'
        },
        {
          stem: 'An automobile travels 100 miles across 4 equal intervals of 25 miles each at speeds of 30 mph, 40 mph, 50 mph, and 60 mph. Calculate the average speed using the Harmonic Mean.',
          correct: `Formula:
Because equal distances (25 miles each) are covered at varying speeds, the appropriate measure is Harmonic Mean:
H.M. = n / Σ(1 / X)

Step 1: Calculate the reciprocals (1 / X) of the speeds:
• 1 / 30 = 0.0333
• 1 / 40 = 0.0250
• 1 / 50 = 0.0200
• 1 / 60 = 0.0167

Sum of Reciprocals:
Σ(1 / X) = 0.0333 + 0.0250 + 0.0200 + 0.0167 = 0.0950

Step 2: Calculate Harmonic Mean (n = 4 intervals):
H.M. = 4 / 0.0950 ≈ 42.11 mph

Result: The average speed of the automobile is 42.11 mph.`,
          explanation: 'H.M. = 4 / (1/30 + 1/40 + 1/50 + 1/60) = 4 / 0.0950 = 42.11 mph.',
          urdu_answer: 'مساوی فاصلوں کے لیے ہارمونک مین لگے گا۔ رفتاروں کے الٹ کا مجموعہ 0.0950 ہے۔ 4 کو 0.0950 پر تقسیم کرنے سے اوسط رفتار 42.11 میل فی گھنٹہ بنتی ہے۔'
        }
      ];

      for (const l of longsL5) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')`).run(
          l5Id, l.stem, l.correct, l.explanation, l.urdu_answer
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STA301 — Lecture 6: Median, Mode, Quantiles & Empirical Relationship
    // ─────────────────────────────────────────────────────────────────────────────
    const staL6 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 6`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL6) {
      const l6Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 6, ?)`).run(
        sta301L3Subj.id,
        'Median, Mode, Quantiles & Empirical Relationship'
      );
      const l6Id = l6Res.lastInsertRowid;

      const ins6 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 15 MCQs
      const mcqsL6 = [
        {
          stem: 'The middle value of an ordered array of numbers is the: / A value which has half of the observations above it and half of the observations below it is known as:',
          options: { a: 'Mean', b: 'Median', c: 'Mode', d: 'Midpoint' },
          correct: 'b',
          explanation: 'The median is defined as the middle value in a ranked dataset, partitioning the distribution into two equal halves (50% below and 50% above).',
          urdu_answer: 'ترتیب شدہ اعداد و شمار کی درمیانی قیمت جو ڈیٹا کو دو برابر حصوں میں بانٹے، میڈین (Median) کہلاتی ہے۔'
        },
        {
          stem: 'Median can be found only when:',
          options: { a: 'Data is Discrete', b: 'Data is Attributed', c: 'Data is Continuous', d: 'Data is arranged' },
          correct: 'd',
          explanation: 'To accurately locate the central position and determine the median, raw observations must first be ordered in ascending or descending sequence.',
          urdu_answer: 'میڈین صرف اسی صورت معلوم کیا جا سکتا ہے جب ڈیٹا کو پہلے باقاعدہ ترتیب (Arranged) دیا گیا ہو۔'
        },
        {
          stem: 'When a frequency distribution involves "open-end" classes, then which average is appropriate?',
          options: { a: 'Arithmetic Mean', b: 'Mode', c: 'Median', d: 'Geometric Mean' },
          correct: 'c',
          explanation: 'In open-ended classes where lower or upper limits are unspecified, midpoints cannot be determined for the Mean, GM, or HM. The Median is the most suitable average because it relies purely on position and cumulative frequencies.',
          urdu_answer: 'اوپن اینڈڈ (کھلے سرے والی) کلاسز کے لیے میڈین سب سے موزوں اوسط ہے کیونکہ اس میں کلاس کی مکمل حدود جانے بغیر پوزیشن کی بنیاد پر حساب ہو سکتا ہے۔'
        },
        {
          stem: 'In case of a continuous frequency distribution, the median is given by the formula:',
          options: {
            a: 'l + (h/f) * (n/2 - c)',
            b: 'l + (f/h) * (n/2 - c)',
            c: 'l + (h/f) * (n/4 - c)',
            d: 'l - (h/f) * (n/2 - c)'
          },
          correct: 'a',
          explanation: 'The standard linear interpolation formula for the median of continuous grouped data is: l + (h/f) * (n/2 - c).',
          urdu_answer: 'گروہی ڈیٹا میں میڈین معلوم کرنے کا درست فارمولا l + (h/f) * (n/2 - c) ہے۔'
        },
        {
          stem: 'The most frequent or common value occurring in a data set is called:',
          options: { a: 'Mean', b: 'Median', c: 'Mode', d: 'Harmonic Mean' },
          correct: 'c',
          explanation: 'The mode is the particular observation that appears with the highest frequency in a data set.',
          urdu_answer: 'کسی بھی ڈیٹا میں سب سے زیادہ مرتبہ آنے والی قیمت کو موڈ (Mode) کہا جاتا ہے۔'
        },
        {
          stem: 'If a distribution has two modes, then the distribution is called:',
          options: { a: 'Uni-Modal', b: 'Bi-Modal', c: 'Tri-Modal', d: 'Multi-Modal' },
          correct: 'b',
          explanation: 'A frequency distribution possessing exactly two distinct modes or peaks is called bimodal.',
          urdu_answer: 'جس ڈسٹریبیوشن کے دو موڈ ہوں اسے بائی موڈل (Bi-Modal) کہا جاتا ہے۔'
        },
        {
          stem: 'From the following observations 2, 3, 4, 5, 4, 6, 4, the mode is:',
          options: { a: '2', b: '3', c: '4', d: '5' },
          correct: 'c',
          explanation: 'The value 4 occurs 3 times, which is more frequent than any other value, hence Mode = 4.',
          urdu_answer: 'دیے گئے اعداد میں 4 سب سے زیادہ یعنی تین بار آیا ہے، پس موڈ 4 ہے۔'
        },
        {
          stem: 'What is the mode for the following set of data: 1, 1, 2, 2, 5, 5, 7?',
          options: { a: '1', b: '1, 2', c: '1, 2, 5', d: 'No mode in the data' },
          correct: 'c',
          explanation: 'The values 1, 2, and 5 each occur twice with the maximum equal frequency, making the dataset trimodal with modes 1, 2, and 5.',
          urdu_answer: 'اعداد 1، 2، اور 5 تینوں برابر اور سب سے زیادہ (دو دو بار) آئے ہیں، پس موڈ 1، 2، 5 ہے۔'
        },
        {
          stem: 'What is the empirical relationship between Mean, Median, and Mode?',
          options: {
            a: 'Mode = 3 Median - 2 Mean',
            b: 'Mode = 2 Median - 3 Mean',
            c: 'Mean - Mode = 2(Mean - Median)',
            d: 'Median = 3 Mode - 2 Mean'
          },
          correct: 'a',
          explanation: 'For a moderately skewed unimodal distribution, Karl Pearson established the empirical relationship: Mode = 3 Median - 2 Mean (or Mean - Mode = 3(Mean - Median)).',
          urdu_answer: 'اوسطوں کے درمیان تجرباتی تعلق کا فارمولا Mode = 3 Median - 2 Mean ہے۔'
        },
        {
          stem: 'Which one of the following is equal to the 2nd quartile (Q2)?',
          options: { a: 'P25', b: 'D3', c: 'Median', d: 'Mode' },
          correct: 'c',
          explanation: 'The second quartile Q2 divides the dataset at the 50% mark, which is mathematically identical to the Median (Q2 = D5 = P50 = Median).',
          urdu_answer: 'دوسرا کوارٹائل (Q2) اور میڈین (Median) آپس میں بالکل برابر ہوتے ہیں (Q2 = D5 = P50 = Median)۔'
        },
        {
          stem: 'What is the relationship between the 75th percentile and the third quartile?',
          options: { a: 'P75 < Q3', b: 'P75 > Q3', c: 'P75 = Q3', d: 'No relationship' },
          correct: 'c',
          explanation: 'The 75th percentile (P75) and the 3rd quartile (Q3) both mark the exact upper 75% boundary of an ordered distribution: P75 = Q3.',
          urdu_answer: '75 واں پرسنٹائل (P75) اور تیسرا کوارٹائل (Q3) آپس میں برابر ہوتے ہیں (P75 = Q3)۔'
        },
        {
          stem: 'Median and other quantiles (quartiles, deciles, percentiles) can be located graphically using a(n):',
          options: {
            a: 'Histogram',
            b: 'Frequency Polygon',
            c: 'Ogive (Cumulative Frequency Polygon)',
            d: 'Pie Chart'
          },
          correct: 'c',
          explanation: 'Because quantiles and the median are based on cumulative frequencies, they are located graphically from an Ogive (cumulative frequency polygon).',
          urdu_answer: 'میڈین اور دیگر کوانٹائلز کو گراف پر معلوم کرنے کے لیے اوجائیو (Ogive یا Cumulative Frequency Curve) کا استعمال کیا جاتا ہے۔'
        },
        {
          stem: 'The mode of a frequency distribution can be located graphically from a:',
          options: { a: 'Histogram', b: 'Ogive', c: 'Frequency Curve', d: 'Bar Chart' },
          correct: 'a',
          explanation: 'The mode corresponds to the peak frequency and is determined graphically from the highest bar of a Histogram.',
          urdu_answer: 'موڈ کو گراف پر معلوم کرنے کے لیے ہسٹوگرام (Histogram) کے سب سے اونچے کالم کی مدد لی جاتی ہے۔'
        },
        {
          stem: 'For a symmetrical distribution, _____ are equidistant from the median:',
          options: { a: 'X0 and Xm', b: 'Q1 and Q3', c: 'X0 and Q1', d: 'Xm and Q3' },
          correct: 'b',
          explanation: 'In a perfectly symmetrical distribution, the first quartile Q1 and third quartile Q3 are equidistant from the median: Q3 - Median = Median - Q1.',
          urdu_answer: 'متناسب (Symmetrical) ڈسٹریبیوشن میں پہلا اور تیسرا کوارٹائل (Q1 اور Q3) میڈین سے یکساں فاصلے پر ہوتے ہیں۔'
        },
        {
          stem: 'In a set of 20 values all the values are 10, what is the value of median?',
          options: { a: '2', b: '5', c: '10', d: '20' },
          correct: 'c',
          explanation: 'When all observations in a dataset are identical constants (10), the middle value is inevitably that constant (10).',
          urdu_answer: 'اگر تمام 20 قیمتیں 10 ہی ہوں تو درمیانی عدد یعنی میڈین بھی 10 ہی ہوگا۔'
        }
      ];

      for (const m of mcqsL6) {
        ins6.run(l6Id, 'mcq', m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 7 Short Questions (3 marks each)
      const shortsL6 = [
        {
          stem: 'Define Median and write its formula for continuous grouped data.',
          correct: `Definition of Median:
The median is the positional average that divides an ordered dataset into two equal halves, such that 50% of observations lie below it and 50% lie above it.

Formula for Continuous Grouped Data:
Median = l + (h / f) * (n / 2 - c)

Where:
• l = Lower class boundary of the median class
• h = Class width / interval size of the median class
• f = Frequency of the median class
• n = Total number of observations (Σf)
• c = Cumulative frequency of the class preceding the median class`,
          explanation: 'Median divides sorted data into two halves. For continuous groups: l + (h/f) * (n/2 - c).',
          urdu_answer: 'میڈین ترتیب شدہ ڈیٹا کا درمیانی عدد ہے۔ گروہی ڈیٹا کا فارمولا l + (h/f) * (n/2 - c) ہے۔'
        },
        {
          stem: 'Define Mode and Modal Class.',
          correct: `1. Mode:
The mode is the observation or value that occurs with the greatest frequency in a dataset. A distribution may have one mode (unimodal), two modes (bimodal), several modes (multimodal), or no mode if all values occur equally.

2. Modal Class:
In a continuous grouped frequency distribution, the modal class is the specific class interval having the highest individual frequency (fm).`,
          explanation: 'Mode is the most frequent value; Modal Class is the interval with the peak frequency (fm).',
          urdu_answer: 'موڈ سب سے زیادہ دہرائی جانے والی قیمت ہے۔ موڈل کلاس وہ کلاس ہے جس کی فریکوئنسی سب سے بڑی ہو۔'
        },
        {
          stem: 'Write down the empirical relationship between Mean, Median, and Mode.',
          correct: `Empirical Relationship:
For a unimodal, moderately skewed frequency distribution, the empirical relationship is:

Mode = 3(Median) - 2(Mean)

Alternatively expressed as:
Mean - Mode = 3(Mean - Median)

Application:
If any two of the three measures of central tendency are known, the third can be calculated using this formula.`,
          explanation: 'Mode = 3(Median) - 2(Mean). For moderately skewed distributions, the difference between Mean and Mode is three times that between Mean and Median.',
          urdu_answer: 'معتدل سکیوڈ ڈیٹا کے لیے تجرباتی فارمولا Mode = 3(Median) - 2(Mean) ہے۔'
        },
        {
          stem: 'What is the relationship between 75th percentile and third quartile? List other key quantile equivalences.',
          correct: `Key Quantile Equivalences:
Quantiles divide an ordered distribution into equal parts:

1. P75 = Q3: The 75th percentile is mathematically identical to the Third Quartile (both mark the 75% point).
2. P50 = D5 = Q2 = Median: The 50th percentile, 5th decile, and 2nd quartile all equal the Median (50% point).
3. P25 = Q1: The 25th percentile is identical to the First Quartile (25% point).
4. P40 = D4: The 40th percentile equals the 4th Decile.`,
          explanation: 'P75 = Q3; Median = Q2 = D5 = P50; Q1 = P25; D4 = P40.',
          urdu_answer: '75 واں پرسنٹائل تیسرے کوارٹائل کے برابر ہوتا ہے (P75 = Q3)۔ اسی طرح میڈین = Q2 = D5 = P50 اور Q1 = P25 ہے۔'
        },
        {
          stem: 'The number of passengers traveling on a bus at six different times during a day is: 5, 14, 47, 34, 18, 23. Find the median.',
          correct: `Step 1: Arrange the data in ascending order:
5, 14, 18, 23, 34, 47

Step 2: Determine number of values (n = 6, even):
When n is even, the median is the arithmetic mean of the two middle observations (the 3rd and 4th values):
• 3rd value = 18
• 4th value = 23

Step 3: Calculate Median:
Median = (18 + 23) / 2 = 41 / 2 = 20.5 passengers

Result: The median number of passengers is 20.5.`,
          explanation: 'For even n = 6, sort the values and average the 3rd and 4th elements: (18 + 23) / 2 = 20.5.',
          urdu_answer: 'اعداد کو ترتیب دیں: 5, 14, 18, 23, 34, 47۔ دو درمیانی اعداد کا اوسط (18 + 23) / 2 = 20.5 میڈین ہے۔'
        },
        {
          stem: 'The mean of a distribution is 30 and the mode is 24. Calculate the median using the empirical relation.',
          correct: `Formula:
Mode = 3(Median) - 2(Mean)

Given:
• Mean = 30
• Mode = 24

Step-by-step Calculation:
24 = 3(Median) - 2(30)
24 = 3(Median) - 60
24 + 60 = 3(Median)
84 = 3(Median)
Median = 84 / 3 = 28

Result: The median of the distribution is 28.`,
          explanation: 'Mode = 3 Median - 2 Mean ⇒ 24 = 3 Median - 60 ⇒ 3 Median = 84 ⇒ Median = 28.',
          urdu_answer: 'فارمولا Mode = 3 Median - 2 Mean ہے۔ 24 = 3(Median) - 60 جس سے 3(Median) = 84 اور Median = 28 نکلتا ہے۔'
        },
        {
          stem: 'If the Mean of a distribution is 25 and the Median is 22, calculate the Mode using the empirical relationship.',
          correct: `Formula:
Mode = 3(Median) - 2(Mean)

Given:
• Mean = 25
• Median = 22

Step-by-step Calculation:
Mode = 3(22) - 2(25)
Mode = 66 - 50 = 16

Result: The Mode of the distribution is 16.`,
          explanation: 'Mode = 3(22) - 2(25) = 66 - 50 = 16.',
          urdu_answer: 'فارمولا Mode = 3(Median) - 2(Mean) ہے۔ پس Mode = 3(22) - 2(25) = 66 - 50 = 16 حاصل ہوتا ہے۔'
        }
      ];

      for (const s of shortsL6) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')`).run(
          l6Id, s.stem, s.correct, s.explanation, s.urdu_answer
        );
      }

      // 2 Long Questions (5 marks each)
      const longsL6 = [
        {
          stem: `Given the continuous frequency distribution of EPA mileage ratings on 30 cars:

Class Boundaries | Frequency ($f$)
29.95 – 32.95    | 2
32.95 – 35.95    | 4
35.95 – 38.95    | 14
38.95 – 41.95    | 8
41.95 – 44.95    | 2

Calculate the Median, First Quartile ($Q_1$), and Third Quartile ($Q_3$).`,
          correct: `Step 1: Construct Cumulative Frequency Table:

Class Boundaries | Frequency ($f$) | Cumulative Frequency ($cf$)
29.95 – 32.95    | 2               | 2
32.95 – 35.95    | 4               | 6
35.95 – 38.95    | 14 (Median & $Q_1$ Class) | 20
38.95 – 41.95    | 8 ($Q_3$ Class) | 28
41.95 – 44.95    | 2               | 30

Total observations $n = 30$, Class width $h = 3$.

Step 2: Calculate Median:
• $\\text{Position} = \\frac{n}{2} = \\frac{30}{2} = 15$
• Median Class is $35.95 – 38.95$ ($l = 35.95, f = 14, c = 6, h = 3$)
$$\\text{Median} = l + \\frac{h}{f} \\left(\\frac{n}{2} - c\\right)$$
$$\\text{Median} = 35.95 + \\left(\\frac{3}{14}\\right)(15 - 6) = 35.95 + \\frac{27}{14} = 35.95 + 1.93 = 37.88$$

Step 3: Calculate First Quartile ($Q_1$):
• $\\text{Position} = \\frac{n}{4} = \\frac{30}{4} = 7.5$
• $Q_1$ Class is $35.95 – 38.95$ ($l = 35.95, f = 14, c = 6, h = 3$)
$$Q_1 = l + \\frac{h}{f} \\left(\\frac{n}{4} - c\\right)$$
$$Q_1 = 35.95 + \\left(\\frac{3}{14}\\right)(7.5 - 6) = 35.95 + \\frac{4.5}{14} = 35.95 + 0.32 = 36.27$$

Step 4: Calculate Third Quartile ($Q_3$):
• $\\text{Position} = \\frac{3n}{4} = \\frac{90}{4} = 22.5$
• $Q_3$ Class is $38.95 – 41.95$ ($l = 38.95, f = 8, c = 20, h = 3$)
$$Q_3 = l + \\frac{h}{f} \\left(\\frac{3n}{4} - c\\right)$$
$$Q_3 = 38.95 + \\left(\\frac{3}{8}\\right)(22.5 - 20) = 38.95 + \\frac{7.5}{8} = 38.95 + 0.94 = 39.89$$

Summary of Results:
• $\\text{Median} = 37.88$
• $Q_1 = 36.27$
• $Q_3 = 39.89$`,
          explanation: 'Using cumulative frequencies: Median position 15 gives 37.88; Q1 position 7.5 gives 36.27; Q3 position 22.5 gives 39.89.',
          urdu_answer: 'مجموعی فریکوئنسی کی مدد سے: میڈین پوزیشن 15 پر 37.88، پہلا کوارٹائل 36.27 اور تیسرا کوارٹائل 39.89 حاصل ہوتا ہے۔'
        },
        {
          stem: `Using the continuous frequency distribution below, calculate the Mode:

Class Boundaries | Frequency ($f$)
29.95 – 32.95    | 2
32.95 – 35.95    | 4 ($f_1$)
35.95 – 38.95    | 14 ($f_m$)
38.95 – 41.95    | 8 ($f_2$)
41.95 – 44.95    | 2`,
          correct: `Step 1: Identify Modal Class:
The highest frequency is $f_m = 14$, so the modal class is $35.95 – 38.95$.

Step 2: Identify Parameters:
• Lower class boundary ($l$) = 35.95
• Maximum frequency ($f_m$) = 14
• Preceding class frequency ($f_1$) = 4
• Succeeding class frequency ($f_2$) = 8
• Class width ($h$) = $38.95 - 35.95 = 3$

Step 3: Formula for Grouped Mode:
$$\\text{Mode} = l + \\left[\\frac{f_m - f_1}{(f_m - f_1) + (f_m - f_2)}\\right] \\times h$$

Step 4: Calculation:
• $f_m - f_1 = 14 - 4 = 10$
• $f_m - f_2 = 14 - 8 = 6$
• $\\text{Denominator} = 10 + 6 = 16$
• $\\text{Fraction} = \\frac{10}{16} = 0.625$
• $\\text{Product with } h = 0.625 \\times 3 = 1.875$
$$\\text{Mode} = 35.95 + 1.875 = 37.825$$

Result:
The Mode of the frequency distribution is $37.825$ (or approximately $37.83$).`,
          explanation: 'Modal class 35.95-38.95 has fm = 14, f1 = 4, f2 = 8. Mode = 35.95 + [10 / (10 + 6)] * 3 = 37.825.',
          urdu_answer: 'سب سے بڑی فریکوئنسی fm = 14 ہے۔ موڈ کے فارمولے l + [(fm - f1) / ((fm - f1) + (fm - f2))] * h کے ذریعے حل کرنے پر موڈ 37.825 حاصل ہوتا ہے۔'
        }
      ];

      for (const l of longsL6) {
        db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')`).run(
          l6Id, l.stem, l.correct, l.explanation, l.urdu_answer
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STA301 — Lecture 7: Arithmetic Mean, Weighted Mean, Properties & Median for Ungrouped Data
    // ─────────────────────────────────────────────────────────────────────────
    const staL7 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 7`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL7) {
      const l7Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 7, ?)`).run(
        sta301L3Subj.id,
        'Arithmetic Mean, Weighted Mean, Properties & Median for Ungrouped Data'
      );
      const l7Id = l7Res.lastInsertRowid;

      const ins7 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 11 MCQs
      const mcqsL7 = [
        {
          stem: 'The sum of all values divided by the total number of values is called: / The mean calculated by dividing the sum of values by their count is:',
          options: JSON.stringify({
            a: 'Arithmetic Mean',
            b: 'Geometric Mean',
            c: 'Harmonic Mean',
            d: 'Median'
          }),
          correct: 'a',
          explanation: 'Arithmetic Mean = (Sum of all values) / (Total number of values) = $\\sum X / n$.',
          urdu_answer: 'تمام اقدار کے مجموعے کو ان کی کل تعداد پر تقسیم کرنے سے Arithmetic Mean حاصل ہوتا ہے۔'
        },
        {
          stem: 'Which of the following measures of central location is affected most by extreme values (very small or very large) in the data set?',
          options: JSON.stringify({
            a: 'Geometric Mean',
            b: 'Median',
            c: 'Arithmetic Mean',
            d: 'Mode'
          }),
          correct: 'c',
          explanation: 'Arithmetic Mean is sensitive to every single observation in the dataset, hence extreme outliers distort it significantly.',
          urdu_answer: 'ارتھمیٹک مین (Arithmetic Mean) پر انتہائی چھوٹی یا بڑی غیر معمولی اقدار (Extreme Outliers) کا سب سے زیادہ اثر پڑتا ہے۔'
        },
        {
          stem: 'The algebraic sum of deviations of a set of observations from their arithmetic mean is always equal to:',
          options: JSON.stringify({
            a: 'Zero',
            b: 'One',
            c: 'Minimum',
            d: 'Maximum'
          }),
          correct: 'a',
          explanation: 'The algebraic sum of deviations from the arithmetic mean is always zero: $\\sum (X - \\bar{X}) = 0$.',
          urdu_answer: 'حسابی اوسط سے مشاہدات کے انحرافات (Deviations) کا الجبری مجموعہ ہمیشہ صفر کے برابر ہوتا ہے: $\\sum (X - \\bar{X}) = 0$۔'
        },
        {
          stem: 'The sum of squared deviations from arithmetic mean is always:',
          options: JSON.stringify({
            a: 'Maximum',
            b: 'Zero',
            c: 'Minimum',
            d: 'Undefined'
          }),
          correct: 'c',
          explanation: 'The sum of squared deviations from arithmetic mean is minimum: $\\sum (X - \\bar{X})^2 < \\sum (X - A)^2$ for any $A \\neq \\bar{X}$.',
          urdu_answer: 'حسابی اوسط سے لیے گئے انحرافات کے مربعات کا مجموعہ ہمیشہ کم ترین (Minimum) ہوتا ہے۔'
        },
        {
          stem: 'If the mean of 6 numbers is 41, then the sum of these numbers is:',
          options: JSON.stringify({
            a: '250',
            b: '246',
            c: '134',
            d: '456'
          }),
          correct: 'b',
          explanation: '$\\sum X = n \\times \\bar{X} = 6 \\times 41 = 246$.',
          urdu_answer: 'اعداد کا مجموعہ $\\sum X = n \\times \\bar{X} = 6 \\times 41 = 246$ ہے۔'
        },
        {
          stem: 'When different observations in a series are assigned relative importance according to their significance, the mean calculated is called:',
          options: JSON.stringify({
            a: 'Simple Arithmetic Mean',
            b: 'Weighted Arithmetic Mean',
            c: 'Geometric Mean',
            d: 'Combined Mean'
          }),
          correct: 'b',
          explanation: 'Weighted Mean assigns relative importance weights ($w_i$) to different observations.',
          urdu_answer: 'جب مختلف مشاہدات کو ان کی اہمیت کے مطابق اوزان (Weights) دیے جائیں تو حاصل ہونے والا اوسط Weighted Arithmetic Mean کہلاتا ہے۔'
        },
        {
          stem: 'If all values in a data set are assigned equal weights, then the Weighted Mean is equal to:',
          options: JSON.stringify({
            a: 'Simple Arithmetic Mean',
            b: 'Geometric Mean',
            c: 'Harmonic Mean',
            d: 'Zero'
          }),
          correct: 'a',
          explanation: 'When all weights are identical ($w_i = w$), $\\bar{X}_w = \\frac{w \\sum X}{w \\cdot n} = \\frac{\\sum X}{n} = \\bar{X}$ (Simple Arithmetic Mean).',
          urdu_answer: 'اگر تمام اقدار کو برابر وزن دیا جائے تو Weighted Mean سادہ حسابی اوسط (Simple Arithmetic Mean) کے برابر ہو جاتا ہے۔'
        },
        {
          stem: 'The middle value of an ordered array of numbers is called: / The value of the middle term in a ranked data set is:',
          options: JSON.stringify({
            a: 'Mean',
            b: 'Median',
            c: 'Mode',
            d: 'Midpoint'
          }),
          correct: 'b',
          explanation: 'Median is the middle value in a ranked array dividing observations into two equal halves.',
          urdu_answer: 'ترتیب شدہ ڈیٹا کی درمیانی قدر (Middle Value) کو Median کہا جاتا ہے۔'
        },
        {
          stem: 'What is the median of this set of numbers: 4, 6, 7, 9, 200000?',
          options: JSON.stringify({
            a: '9',
            b: '6',
            c: '7.5',
            d: '7'
          }),
          correct: 'd',
          explanation: 'Data is already arranged in ascending order: 4, 6, 7, 9, 200000. With odd $n = 5$, the 3rd value is 7.',
          urdu_answer: 'اعداد صعودی ترتیب میں ہیں: 4, 6, 7, 9, 200000۔ طاق تعداد n = 5 میں تیسرا عدد 7 میڈین ہے۔'
        },
        {
          stem: 'A list of 7 pulse rates is: 70, 64, 80, 74, 92, 96, 98. What is the median for this list?',
          options: JSON.stringify({
            a: '70',
            b: '80',
            c: '92',
            d: '98'
          }),
          correct: 'b',
          explanation: 'Arranging in ascending order: 64, 70, 74, 80, 92, 96, 98. For $n = 7$, the middle (4th) value is 80.',
          urdu_answer: 'اعداد کو صعودی ترتیب دینے پر: 64, 70, 74, 80, 92, 96, 98۔ درمیانی قدر (چوتھا عدد) 80 میڈین ہے۔'
        },
        {
          stem: 'Half of the observations in a dataset are always larger than:',
          options: JSON.stringify({
            a: 'Mean',
            b: 'Median',
            c: 'Mode',
            d: 'Range'
          }),
          correct: 'b',
          explanation: 'By mathematical definition, 50% of values lie above the Median and 50% lie below it.',
          urdu_answer: 'میڈین کی تعریف کے مطابق 50 فیصد مشاہدات ہمیشہ میڈین سے بڑے ہوتے ہیں اور 50 فیصد چھوٹے ہوتے ہیں۔'
        }
      ];

      for (const m of mcqsL7) {
        ins7.run(l7Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 5 Short Questions (3 marks each)
      const shortsL7 = [
        {
          stem: 'Define Arithmetic Mean. State its formulas for both ungrouped and grouped continuous data.',
          correct: `Definition:
The Arithmetic Mean ($\\bar{X}$) is a measure of central tendency defined as the sum of all numerical observations divided by the total number of observations.

Formula for Ungrouped Data:
$$\\bar{X} = \\frac{\\sum X}{n}$$

Formula for Grouped Data:
$$\\bar{X} = \\frac{\\sum fX}{\\sum f}$$
where $X$ represents class midpoints and $f$ represents class frequencies.`,
          explanation: 'Arithmetic Mean is sum of values divided by count of values. For grouped data: sum of fX divided by sum of f.',
          urdu_answer: 'ارتھمیٹک مین مشاہدات کے مجموعے کو ان کی کل تعداد پر تقسیم کر کے حاصل کیا جاتا ہے۔ غیر گروہی ڈیٹا کے لیے فارمولا $\\bar{X} = \\frac{\\sum X}{n}$ اور گروہی ڈیٹا کے لیے $\\bar{X} = \\frac{\\sum fX}{\\sum f}$ ہے۔'
        },
        {
          stem: 'What is Weighted Arithmetic Mean? Write its general formula.',
          correct: `Definition:
When different observations in a dataset do not hold equal importance or frequency, relative weights ($w_i$) are assigned to reflect their significance. The resulting average is called the Weighted Arithmetic Mean.

Formula:
$$\\bar{X}_w = \\frac{\\sum wX}{\\sum w} = \\frac{w_1 X_1 + w_2 X_2 + \\dots + w_k X_k}{w_1 + w_2 + \\dots + w_k}$$`,
          explanation: 'Weighted Mean weighs each observation by its assigned importance: sum of (w * X) divided by sum of w.',
          urdu_answer: 'جب مختلف مشاہدات کی اہمیت برابر نہ ہو تو اوزان (Weights) تفویض کیے جاتے ہیں۔ اس کا فارمولا $\\bar{X}_w = \\frac{\\sum wX}{\\sum w}$ ہے۔'
        },
        {
          stem: 'Enlist two important mathematical properties of Arithmetic Mean.',
          correct: `1. Sum of Deviations is Zero:
The algebraic sum of deviations of individual observations from their arithmetic mean is always zero:
$$\\sum (X - \\bar{X}) = 0$$

2. Sum of Squared Deviations is Minimized:
The sum of squared deviations of observations from any arbitrary point $A$ is minimum when $A = \\bar{X}$:
$$\\sum (X - \\bar{X})^2 < \\sum (X - A)^2 \\quad (\\text{for } A \\neq \\bar{X})$$`,
          explanation: 'Property 1: Sum of deviations from mean is zero. Property 2: Sum of squared deviations from mean is smaller than from any other arbitrary point.',
          urdu_answer: '1. حسابی اوسط سے انحرافات کا الجبری مجموعہ صفر ہوتا ہے: $\\sum (X - \\bar{X}) = 0$۔\\n2. حسابی اوسط سے لیے گئے انحرافات کے مربعات کا مجموعہ کم ترین (Minimum) ہوتا ہے۔'
        },
        {
          stem: 'Explain the procedure to find the Median for an ungrouped dataset.',
          correct: `Procedure:
1. Arrange the raw dataset in ascending (or descending) numerical order.
2. If $n$ is odd: The median is the single middle observation at position $\\frac{n + 1}{2}$:
$$\\tilde{X} = X_{\\left(\\frac{n+1}{2}\\right)}$$
3. If $n$ is even: There are two middle values located at positions $\\frac{n}{2}$ and $\\frac{n}{2} + 1$. The median is the arithmetic mean of these two middle observations:
$$\\tilde{X} = \\frac{X_{(n/2)} + X_{(n/2 + 1)}}{2}$$`,
          explanation: 'Step 1: Rank order data. Step 2: For odd n, take middle item. For even n, take average of the two middle items.',
          urdu_answer: 'ڈیٹا کو صعودی ترتیب دیں۔ اگر تعداد طاق ہو تو درمیانی قدر $(n+1)/2$ میڈین ہے۔ اگر تعداد جفت ہو تو دو درمیانی اقدار $n/2$ اور $(n/2)+1$ کا اوسط لیا جاتا ہے۔'
        },
        {
          stem: 'The number of passengers traveling on a bus at six different times during a day is as follows: 5, 14, 47, 34, 18, 23. Find the median.',
          correct: `Step 1: Arrange data in ascending order:
$$5, 14, 18, 23, 34, 47$$

Step 2: Identify sample size $n = 6$ (even):
Since $n$ is even, the median is the arithmetic mean of the 3rd and 4th observations:
• 3rd observation = 18
• 4th observation = 23

Step 3: Calculate Median:
$$\\tilde{X} = \\frac{18 + 23}{2} = \\frac{41}{2} = 20.5$$

Result:
The median number of passengers is $20.5$.`,
          explanation: 'Sorted: 5, 14, 18, 23, 34, 47. Middle two values: 18 and 23. Average = 41 / 2 = 20.5.',
          urdu_answer: 'صعودی ترتیب: 5, 14, 18, 23, 34, 47۔ دو درمیانی اعداد 18 اور 23 ہیں۔ میڈین = (18 + 23) / 2 = 20.5 حاصل ہوتا ہے۔'
        }
      ];

      for (const s of shortsL7) {
        ins7.run(l7Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsL7 = [
        {
          stem: `An examination candidate obtains marks of 75 in English, 80 in Mathematics, and 90 in Statistics. If the relative weights assigned to these subjects are 1, 2, and 3 respectively:

1. Calculate the Simple Arithmetic Mean.
2. Calculate the Weighted Arithmetic Mean.
3. Compare both results and justify the difference.`,
          correct: `Given Data:
• English: $X_1 = 75, \\quad w_1 = 1$
• Mathematics: $X_2 = 80, \\quad w_2 = 2$
• Statistics: $X_3 = 90, \\quad w_3 = 3$

Part 1: Simple Arithmetic Mean
$$\\bar{X} = \\frac{\\sum X}{n} = \\frac{75 + 80 + 90}{3} = \\frac{245}{3} \\approx 81.67$$

Part 2: Weighted Arithmetic Mean
$$\\bar{X}_w = \\frac{\\sum wX}{\\sum w} = \\frac{(1 \\times 75) + (2 \\times 80) + (3 \\times 90)}{1 + 2 + 3}$$
$$\\bar{X}_w = \\frac{75 + 160 + 270}{6} = \\frac{505}{6} \\approx 84.17$$

Part 3: Comparison & Justification
The Weighted Mean ($84.17$) is greater than the Simple Mean ($81.67$). This occurs because the highest weight ($w_3 = 3$) was assigned to Statistics, where the candidate obtained the highest score ($90$), pulling the weighted average upward.`,
          explanation: 'Simple Mean = 245/3 = 81.67. Weighted Mean = 505/6 = 84.17. Weighted Mean is larger due to higher weight on the highest score (Statistics = 90).',
          urdu_answer: 'سادہ اوسط: 245/3 = 81.67۔ ویٹڈ اوسط: 505/6 = 84.17۔ ویٹڈ اوسط اس لیے زیادہ ہے کیونکہ سب سے زیادہ نمبر والے مضمون (Statistics = 90) کو سب سے زیادہ وزن (3) دیا گیا تھا۔'
        },
        {
          stem: `Calculate the Arithmetic Mean for the following discrete frequency distribution representing the number of children per family:

Number of Children ($X$) | Frequency / No. of Families ($f$)
0                        | 5
1                        | 12
2                        | 18
3                        | 10
4                        | 5`,
          correct: `Step 1: Compute $fX$ for each value:

Number of Children ($X$) | Frequency ($f$) | $fX$
0                        | 5               | 0
1                        | 12              | 12
2                        | 18              | 36
3                        | 10              | 30
4                        | 5               | 20
Total                    | $\\sum f = 50$   | $\\sum fX = 98$

Step 2: Apply the Grouped Mean Formula:
$$\\bar{X} = \\frac{\\sum fX}{\\sum f}$$
$$\\bar{X} = \\frac{98}{50} = 1.96$$

Result:
The Arithmetic Mean number of children per family is $1.96$ children.`,
          explanation: 'Sum of f = 50, Sum of fX = 98. Mean = 98 / 50 = 1.96 children per family.',
          urdu_answer: 'جدول میں fX معلوم کرنے پر $\\sum fX = 98$ اور $\\sum f = 50$ حاصل ہوتا ہے۔ پس حسابی اوسط $\\bar{X} = 98 / 50 = 1.96$ بچّے فی خاندان ہے۔'
        }
      ];

      for (const l of longsL7) {
        ins7.run(l7Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STA301 — Lecture 8: Median for Grouped Data, Quantiles & Empirical Relationship
    // ─────────────────────────────────────────────────────────────────────────
    const staL8 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 8`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL8) {
      const l8Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 8, ?)`).run(
        sta301L3Subj.id,
        'Median for Grouped Data, Quantiles & Empirical Relationship'
      );
      const l8Id = l8Res.lastInsertRowid;

      const ins8 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 12 MCQs
      const mcqsL8 = [
        {
          stem: 'When a frequency distribution involves "open-end" classes, then which average is appropriate? / In case of an open-ended class interval:',
          options: JSON.stringify({
            a: 'Mean',
            b: 'Mode',
            c: 'Median',
            d: 'None of these'
          }),
          correct: 'c',
          explanation: 'Median depends only on the positional ranking and cumulative frequencies of middle classes, so open-ended boundaries do not affect it.',
          urdu_answer: 'کھلے سروں والی کلاسز (Open-end classes) میں حسابی اوسط نہیں نکالی جا سکتی، اس لیے Median موزوں ترین اوسط ہے۔'
        },
        {
          stem: 'In case of a continuous frequency distribution, the median is given by the formula:',
          options: JSON.stringify({
            a: '$l + \\frac{h}{f} \\left(\\frac{n}{2} - 2c\\right)$',
            b: '$l + \\frac{h}{f} \\left(\\frac{n}{2} - c\\right)$',
            c: '$l + \\frac{f}{h} \\left(\\frac{n}{2} - c\\right)$',
            d: '$l + \\frac{f}{h} \\left(\\frac{n}{4} - c\\right)$'
          }),
          correct: 'b',
          explanation: 'The formula for Median in grouped continuous data is $\\tilde{X} = l + \\frac{h}{f}\\left(\\frac{n}{2} - c\\right)$.',
          urdu_answer: 'مسلسل فریکوئنسی ڈسٹری بیوشن کے لیے میڈین کا فارمولا $l + \\frac{h}{f} (\\frac{n}{2} - c)$ ہے۔'
        },
        {
          stem: 'In case of a frequency distribution, the 7th decile ($D_7$) is given by the formula:',
          options: JSON.stringify({
            a: '$l + \\frac{h}{f} \\left(\\frac{n}{10} - 10c\\right)$',
            b: '$l + \\frac{h}{f} \\left(\\frac{7n}{10} - c\\right)$',
            c: '$l + \\frac{7h}{h} \\left(\\frac{n}{10} - c\\right)$',
            d: '$l + \\frac{f}{h} \\left(\\frac{7n}{10} - c\\right)$'
          }),
          correct: 'b',
          explanation: 'For $D_7$, the positional rank is $\\frac{7n}{10}$, so $D_7 = l + \\frac{h}{f}\\left(\\frac{7n}{10} - c\\right)$.',
          urdu_answer: 'ساتویں ڈیسائل ($D_7$) کا فارمولا $l + \\frac{h}{f} (\\frac{7n}{10} - c)$ ہے۔'
        },
        {
          stem: 'What is the empirical relationship between Mean, Median, and Mode?',
          options: JSON.stringify({
            a: '$\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$',
            b: '$\\text{Mode} = 2\\text{Median} - 3\\text{Mean}$',
            c: '$\\text{Mean} - \\text{Mode} = 2(\\text{Mean} - \\text{Median})$',
            d: '$\\text{Median} = 3\\text{Mode} - 2\\text{Mean}$'
          }),
          correct: 'a',
          explanation: 'For moderately skewed distributions: $\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$ or $\\text{Mean} - \\text{Mode} = 3(\\text{Mean} - \\text{Median})$.',
          urdu_answer: 'حسابی اوسط، میڈین اور موڈ کے درمیان تجربی تعلق $\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$ ہے۔'
        },
        {
          stem: 'Which one of the following is equal to the 2nd quartile ($Q_2$)?',
          options: JSON.stringify({
            a: '$P_{33}$',
            b: '$D_3$',
            c: 'Median',
            d: 'Mode'
          }),
          correct: 'c',
          explanation: 'The second quartile $Q_2$ partitions the lower 50% from upper 50%, which is exactly the Median ($Q_2 = D_5 = P_{50} = \\text{Median}$).',
          urdu_answer: 'دوسرا کوارٹائل ($Q_2$) میڈین (Median) کے برابر ہوتا ہے۔'
        },
        {
          stem: '2nd Quartile = 5th Decile = 50th Percentile = ?',
          options: JSON.stringify({
            a: 'Geometric Mean',
            b: 'Median',
            c: 'Mode',
            d: 'Harmonic Mean'
          }),
          correct: 'b',
          explanation: '$Q_2 = D_5 = P_{50} = \\text{Median}$.',
          urdu_answer: 'دوسرا کوارٹائل، پانچواں ڈیسائل اور 50 واں پرسنٹائل سب میڈین (Median) کے برابر ہوتے ہیں۔'
        },
        {
          stem: 'What is the relationship between the 75th percentile and the third quartile?',
          options: JSON.stringify({
            a: 'First quartile ($Q_1$)',
            b: 'Second quartile ($Q_2$)',
            c: 'Third quartile ($Q_3$)',
            d: 'Median'
          }),
          correct: 'c',
          explanation: 'Both the 75th percentile ($P_{75}$) and third quartile ($Q_3$) mark the 75% point of an ordered distribution ($P_{75} = Q_3$).',
          urdu_answer: '75 واں پرسنٹائل تیسرے کوارٹائل ($Q_3$) کے برابر ہوتا ہے۔'
        },
        {
          stem: 'The graphical location of the median and other quantiles (quartiles, deciles, percentiles) is obtained using a(n):',
          options: JSON.stringify({
            a: 'Histogram',
            b: 'Frequency Polygon',
            c: 'Cumulative Frequency Polygon (Ogive)',
            d: 'Pie Chart'
          }),
          correct: 'c',
          explanation: 'Median and quantiles are located graphically by reading values off the Cumulative Frequency Polygon (Ogive).',
          urdu_answer: 'میڈین اور دیگر کوانٹائلز کو گراف پر معلوم کرنے کے لیے Ogive (Cumulative Frequency Polygon) استعمال کیا جاتا ہے۔'
        },
        {
          stem: 'The deciles give the division of the total area of a frequency distribution into:',
          options: JSON.stringify({
            a: '2 equal parts',
            b: '4 equal parts',
            c: '10 equal parts',
            d: '100 equal parts'
          }),
          correct: 'c',
          explanation: 'Deciles ($D_1$ to $D_9$) partition the ordered dataset into 10 equal parts of 10% each.',
          urdu_answer: 'ڈیسائلز فریکوئنسی ڈسٹری بیوشن کے کل رقبے کو 10 برابر حصوں میں تقسیم کرتے ہیں۔'
        },
        {
          stem: 'Which one of the following is greater than median for a symmetrical distribution?',
          options: JSON.stringify({
            a: '1st Decile ($D_1$)',
            b: '7th Decile ($D_7$)',
            c: '44th Percentile ($P_{44}$)',
            d: '14th Percentile ($P_{14}$)'
          }),
          correct: 'b',
          explanation: 'Median corresponds to $P_{50} = D_5$. Since $D_7 = P_{70} > P_{50}$, $D_7$ is strictly greater than the median.',
          urdu_answer: '$D_7$ سترویں پرسنٹائل ($P_{70}$) کے برابر ہے، جو کہ 50 ویں پرسنٹائل (میڈین) سے بڑا ہے۔'
        },
        {
          stem: 'The empirical relationship between Mean, Median, and Mode is based on:',
          options: JSON.stringify({
            a: 'Rigid mathematical formula',
            b: 'Observation',
            c: 'Probability theory',
            d: 'Sampling error'
          }),
          correct: 'b',
          explanation: 'The relationship is empirical (observed experimentally in moderately skewed distributions) rather than mathematically derived.',
          urdu_answer: 'حسابی اوسط، میڈین اور موڈ کا باہمی تعلق مشاہداتی (Observation / Empirical) بنیادوں پر قائم ہے۔'
        },
        {
          stem: 'In a Box and Whisker plot, the right end of the box is referred to as:',
          options: JSON.stringify({
            a: 'First quartile',
            b: 'Second quartile',
            c: 'Third quartile',
            d: 'Mode'
          }),
          correct: 'c',
          explanation: 'In a standard box-and-whisker plot, the left border is $Q_1$, the midline is $Q_2$ (Median), and the right border is $Q_3$.',
          urdu_answer: 'باکس اینڈ وسکر پلاٹ میں باکس کا دایاں سرا تیسرا کوارٹائل ($Q_3$) کہلاتا ہے۔'
        }
      ];

      for (const m of mcqsL8) {
        ins8.run(l8Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 6 Short Questions (3 marks each)
      const shortsL8 = [
        {
          stem: 'Why is Median the preferred average when dealing with open-ended frequency distributions?',
          correct: `Advantage of Median in Open-Ended Distributions:
1. Open-ended classes lack either a lower limit (e.g., "< 10") or an upper limit (e.g., "> 80"), making it impossible to determine the class midpoint ($X$).
2. Consequently, Arithmetic Mean cannot be calculated because $\\sum fX$ cannot be computed.
3. The Median depends solely on cumulative frequencies and positional ranking ($\\frac{n}{2}$).
4. As long as the median falls within an intermediate, closed class interval, the indefinite boundaries of the terminal open-ended classes have no impact on the calculation.`,
          explanation: 'Mean requires midpoints of all classes which cannot be calculated for open-ended classes. Median only needs the median class and cumulative frequencies.',
          urdu_answer: 'اوپن اینڈڈ کلاسز میں درمیانی نقطہ (Midpoint) معلوم نہیں ہو سکتا جس کی وجہ سے حسابی اوسط نہیں نکالی جا سکتی۔ میڈین صرف پوزیشنی درجہ بندی پر منحصر ہوتا ہے اس لیے یہ آسانی سے معلوم ہو جاتا ہے۔'
        },
        {
          stem: 'Define Quantiles (Fractiles) and enlist its three main types.',
          correct: `Definition:
Quantiles (or fractiles) are positional values that partition an ordered dataset or continuous frequency distribution into a specified number of equal parts.

Three Main Types:
1. Quartiles ($Q_1, Q_2, Q_3$):
Divide the total frequency into 4 equal parts (25% of observations in each part).

2. Deciles ($D_1, D_2, \\dots, D_9$):
Divide the total frequency into 10 equal parts (10% of observations in each part).

3. Percentiles ($P_1, P_2, \\dots, P_{99}$):
Divide the total frequency into 100 equal parts (1% of observations in each part).`,
          explanation: 'Quantiles partition ordered data into equal parts: Quartiles (4 parts), Deciles (10 parts), Percentiles (100 parts).',
          urdu_answer: 'کوانٹائلز ایسی پوزیشنی اقدار ہیں جو ترتیب شدہ ڈیٹا کو برابر حصوں میں تقسیم کرتی ہیں: کوارٹائلز (4 حصے)، ڈیسائلز (10 حصے)، اور پرسنٹائلز (100 حصے)۔'
        },
        {
          stem: 'Write down the algebraic equations representing the empirical relationship between Mean, Median, and Mode.',
          correct: `For single-peaked, unimodal, and moderately skewed frequency distributions, the empirical relationship between the three averages can be written in three equivalent algebraic forms:

Form 1:
$$\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$$

Form 2:
$$\\text{Mean} - \\text{Mode} = 3(\\text{Mean} - \\text{Median})$$

Form 3:
$$\\text{Median} - \\text{Mode} = 2(\\text{Mean} - \\text{Median})$$`,
          explanation: 'Mode = 3 Median - 2 Mean, or Mean - Mode = 3(Mean - Median).',
          urdu_answer: 'اعتدال پسند ترچھے (Moderately skewed) ڈیٹا کے لیے تینوں اوسطوں میں تعلق درج ذیل فارمولوں سے ظاہر کیا جاتا ہے:\n1. $\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$\n2. $\\text{Mean} - \\text{Mode} = 3(\\text{Mean} - \\text{Median})$۔'
        },
        {
          stem: 'Explain how Quantiles (Median, Quartiles, Deciles) are located graphically.',
          correct: `Graphical Location of Quantiles:
Quantiles are determined graphically from a Cumulative Frequency Polygon (Ogive):

1. Construct the Ogive:
Plot Upper Class Boundaries on the horizontal axis ($x$-axis) against Cumulative Frequencies ($cf$) on the vertical axis ($y$-axis).

2. Identify Positional Rank on $y$-axis:
• Median rank = $\\frac{n}{2}$
• First Quartile ($Q_1$) rank = $\\frac{n}{4}$
• Third Quartile ($Q_3$) rank = $\\frac{3n}{4}$
• $k$-th Decile ($D_k$) rank = $\\frac{kn}{10}$

3. Project to Curve and Axis:
Draw a horizontal line from the calculated rank on the $y$-axis until it intersects the Ogive curve. From this intersection, drop a vertical line to the $x$-axis. The value on the $x$-axis gives the exact graphical value of the quantile.`,
          explanation: 'Plot Upper Class Boundaries against Cumulative Frequency (Ogive). Find rank on y-axis, move horizontally to Ogive, drop down to x-axis.',
          urdu_answer: 'اوگائیو (Ogive) کرو پر عمودی محور (y-axis) پر رینک تلاش کریں، افقی لکیر اوگائیو سے ملا کر نیچے x-axis پر گرائیں؛ x-axis پر آنے والی قدر مطلوبہ کوانٹائل ہوتی ہے۔'
        },
        {
          stem: 'The Mean of a moderately skewed distribution is 28.5 and the Mode is 25.2. Calculate the Median.',
          correct: `Formula:
$$\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$$

Given:
• $\\text{Mean} = 28.5$
• $\\text{Mode} = 25.2$

Step-by-step Calculation:
$$25.2 = 3\\text{Median} - 2(28.5)$$
$$25.2 = 3\\text{Median} - 57.0$$
$$3\\text{Median} = 25.2 + 57.0 = 82.2$$
$$\\text{Median} = \\frac{82.2}{3} = 27.4$$

Result:
The Median of the distribution is $27.4$.`,
          explanation: 'Mode = 3 Median - 2 Mean => 25.2 = 3 Median - 57 => 3 Median = 82.2 => Median = 27.4.',
          urdu_answer: 'فارمولا Mode = 3 Median - 2 Mean ہے۔ 25.2 = 3(Median) - 57.0 جس سے 3(Median) = 82.2 اور Median = 27.4 حاصل ہوتا ہے۔'
        },
        {
          stem: 'If Mean = 30 and Median = 28, calculate the Mode using the empirical relationship.',
          correct: `Formula:
$$\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$$

Given:
• $\\text{Mean} = 30$
• $\\text{Median} = 28$

Step-by-step Calculation:
$$\\text{Mode} = 3(28) - 2(30)$$
$$\\text{Mode} = 84 - 60 = 24$$

Result:
The Mode of the distribution is $24$.`,
          explanation: 'Mode = 3(28) - 2(30) = 84 - 60 = 24.',
          urdu_answer: 'فارمولا Mode = 3(28) - 2(30) = 84 - 60 = 24 ہے۔ موڈ کی قیمت 24 ہے۔'
        }
      ];

      for (const s of shortsL8) {
        ins8.run(l8Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsL8 = [
        {
          stem: `The following frequency distribution represents EPA mileage ratings on 30 cars:

Mileage Rating | Class Boundaries | Frequency ($f$)
30.0 – 32.9    | 29.95 – 32.95    | 2
33.0 – 35.9    | 32.95 – 35.95    | 4
36.0 – 38.9    | 35.95 – 38.95    | 14
39.0 – 41.9    | 38.95 – 41.95    | 8
42.0 – 44.9    | 41.95 – 44.95    | 2

Calculate the Median ($\\tilde{X}$), First Quartile ($Q_1$), Third Quartile ($Q_3$), and 7th Decile ($D_7$).`,
          correct: `Step 1: Construct the Cumulative Frequency Table:

Class Boundaries | Frequency ($f$) | Cumulative Frequency ($cf$)
29.95 – 32.95    | 2               | 2
32.95 – 35.95    | 4               | 6
35.95 – 38.95    | 14              | 20
38.95 – 41.95    | 8               | 28
41.95 – 44.95    | 2               | 30 (Total $n = 30$)

Part 1: Calculation of Median ($\\tilde{X}$)
• Rank = $\\frac{n}{2} = \\frac{30}{2} = 15$
• Median class = $35.95 – 38.95$ ($l = 35.95, h = 3, f = 14, c = 6$)
$$\\tilde{X} = l + \\frac{h}{f}\\left(\\frac{n}{2} - c\\right) = 35.95 + \\frac{3}{14}(15 - 6) = 35.95 + \\frac{27}{14} = 35.95 + 1.93 = 37.88\\text{ mpg}$$

Part 2: Calculation of First Quartile ($Q_1$)
• Rank = $\\frac{n}{4} = \\frac{30}{4} = 7.5$
• $Q_1$ class = $35.95 – 38.95$ ($l = 35.95, h = 3, f = 14, c = 6$)
$$Q_1 = l + \\frac{h}{f}\\left(\\frac{n}{4} - c\\right) = 35.95 + \\frac{3}{14}(7.5 - 6) = 35.95 + \\frac{4.5}{14} = 35.95 + 0.32 = 36.27\\text{ mpg}$$

Part 3: Calculation of Third Quartile ($Q_3$)
• Rank = $\\frac{3n}{4} = \\frac{90}{4} = 22.5$
• $Q_3$ class = $38.95 – 41.95$ ($l = 38.95, h = 3, f = 8, c = 20$)
$$Q_3 = l + \\frac{h}{f}\\left(\\frac{3n}{4} - c\\right) = 38.95 + \\frac{3}{8}(22.5 - 20) = 38.95 + \\frac{7.5}{8} = 38.95 + 0.94 = 39.89\\text{ mpg}$$

Part 4: Calculation of 7th Decile ($D_7$)
• Rank = $\\frac{7n}{10} = \\frac{210}{10} = 21$
• $D_7$ class = $38.95 – 41.95$ ($l = 38.95, h = 3, f = 8, c = 20$)
$$D_7 = l + \\frac{h}{f}\\left(\\frac{7n}{10} - c\\right) = 38.95 + \\frac{3}{8}(21 - 20) = 38.95 + \\frac{3}{8} = 38.95 + 0.375 = 39.325\\text{ mpg}$$

Summary of Results:
• Median = $37.88\\text{ mpg}$
• First Quartile ($Q_1$) = $36.27\\text{ mpg}$
• Third Quartile ($Q_3$) = $39.89\\text{ mpg}$
• 7th Decile ($D_7$) = $39.33\\text{ mpg}$`,
          explanation: 'Cumulative frequencies determine quantile classes. Apply l + (h/f)(rank - c) for each quantile.',
          urdu_answer: 'کولیٹو فریکوئنسی ٹیبل بنا کر ہر کوانٹائل کا رینک معلوم کریں اور فارمولا $l + \\frac{h}{f}(\\text{rank} - c)$ استعمال کریں۔ نتائج: میڈین = 37.88، Q1 = 36.27، Q3 = 39.89، D7 = 39.33۔'
        },
        {
          stem: `Explain the relative positioning and behavior of Mean, Median, and Mode in:
1. Symmetrical Distributions
2. Positively Skewed Distributions
3. Negatively Skewed Distributions

Also explain how the Empirical Relationship ($\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$) operates in moderately skewed distributions.`,
          correct: `1. Symmetrical Distributions:
• The bell-shaped distribution is completely balanced around the center.
• All three measures of central tendency coincide at the identical central value:
$$\\text{Mean} = \\text{Median} = \\text{Mode}$$

2. Positively Skewed (Skewed to the Right) Distributions:
• The distribution has a long tail pulling toward the higher positive values.
• Extreme high values pull the Mean upward the most, while Mode stays at the highest peak:
$$\\text{Mean} > \\text{Median} > \\text{Mode}$$
• The Median always falls between the Mode and the Mean.

3. Negatively Skewed (Skewed to the Left) Distributions:
• The distribution has a long tail pulling toward the lower negative values.
• Extreme low values pull the Mean downward the most:
$$\\text{Mean} < \\text{Median} < \\text{Mode}$$
• The Median again remains situated in the middle.

4. The Empirical Relationship:
For moderately skewed unimodal distributions, Karl Pearson observed that the Median is approximately two-thirds of the distance from the Mode toward the Mean:
$$\\text{Mean} - \\text{Mode} \\approx 3(\\text{Mean} - \\text{Median})$$
Rearranging terms yields:
$$\\text{Mode} = 3\\text{Median} - 2\\text{Mean}$$
This formula provides a quick and reliable approximation for the third average when any two are known.`,
          explanation: 'Symmetrical: Mean = Median = Mode. Positively skewed: Mean > Median > Mode. Negatively skewed: Mean < Median < Mode. Empirical relationship: Mode = 3 Median - 2 Mean.',
          urdu_answer: 'متناسب تقسیم میں تینوں اوسط برابر ہوتے ہیں۔ مثبت ترچھی تقسیم میں Mean > Median > Mode ہوتا ہے اور منفی ترچھی تقسیم میں Mean < Median < Mode ہوتا ہے۔ تجربی فارمولا Mode = 3 Median - 2 Mean کہلاتا ہے۔'
        }
      ];

      for (const l of longsL8) {
        ins8.run(l8Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STA301 — Lecture 9: Geometric Mean, Harmonic Mean, Relations & Mid-Range
    // ─────────────────────────────────────────────────────────────────────────
    const staL9 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 9`).get(sta301L3Subj.id) as { id: number } | undefined;
    if (!staL9) {
      const l9Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 9, ?)`).run(
        sta301L3Subj.id,
        'Geometric Mean, Harmonic Mean, Relations & Mid-Range'
      );
      const l9Id = l9Res.lastInsertRowid;

      const ins9 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 10 MCQs
      const mcqsL9 = [
        {
          stem: 'In case of a frequency distribution having $k$ classes with midpoints $X_i$ and corresponding frequencies $f_i$, the geometric mean ($G$) is given by:',
          options: JSON.stringify({
            a: '$\\text{antilog}\\left(\\frac{\\sum f \\log X}{n}\\right)$',
            b: '$\\log\\left(\\frac{\\sum f X}{n}\\right)$',
            c: '$\\text{antilog}\\left(\\frac{\\sum \\log X}{n}\\right)$',
            d: '$\\frac{\\sum f \\log X}{n}$'
          }),
          correct: 'a',
          explanation: 'For grouped frequency data, $G = \\text{antilog}\\left(\\frac{\\sum f \\log X}{\\sum f}\\right)$.',
          urdu_answer: 'گروہی ڈیٹا کے لیے جیومیٹرک مین کا فارمولا $\\text{antilog}(\\frac{\\sum f \\log X}{n})$ ہے۔'
        },
        {
          stem: 'For a continuous frequency distribution, the formula for Harmonic Mean is:',
          options: JSON.stringify({
            a: '$\\frac{\\sum f}{\\sum \\left(\\frac{f}{X}\\right)}$',
            b: '$\\frac{\\sum f X}{n}$',
            c: '$\\frac{\\sum \\left(\\frac{1}{X}\\right)}{n}$',
            d: '$\\frac{\\sum f}{\\sum \\left(\\frac{1}{X}\\right)}$'
          }),
          correct: 'a',
          explanation: 'For grouped frequency data, Harmonic Mean is given by $\\text{H.M.} = \\frac{\\sum f}{\\sum (f / X)}$.',
          urdu_answer: 'مسلسل فریکوئنسی ڈسٹری بیوشن کے لیے ہارمونک مین کا فارمولا $\\frac{\\sum f}{\\sum (f / X)}$ ہے۔'
        },
        {
          stem: 'Which one is the formula of Mid-Range? / If $X_0$ is the smallest value and $X_m$ is the largest value in a data set, then Mid-Range is:',
          options: JSON.stringify({
            a: '$X_m - X_0$',
            b: '$X_0 - X_m$',
            c: '$\\frac{X_m - X_0}{2}$',
            d: '$\\frac{X_0 + X_m}{2}$'
          }),
          correct: 'd',
          explanation: 'Mid-Range is the arithmetic mean of the minimum ($X_0$) and maximum ($X_m$) values: $\\frac{X_0 + X_m}{2}$.',
          urdu_answer: 'مڈ رینج کم ترین قدر اور زیادہ سے زیادہ قدر کا اوسط ہوتی ہے: $\\frac{X_0 + X_m}{2}$۔'
        },
        {
          stem: 'Which one is the formula of Mid-Quartile Range (Mid-Hinge)?',
          options: JSON.stringify({
            a: '$Q_3 - Q_1$',
            b: '$\\frac{Q_3 - Q_1}{2}$',
            c: '$\\frac{Q_1 - Q_3}{2}$',
            d: '$\\frac{Q_1 + Q_3}{2}$'
          }),
          correct: 'd',
          explanation: 'Mid-Quartile Range (Mid-Hinge) is the arithmetic mean of the first quartile ($Q_1$) and third quartile ($Q_3$): $\\frac{Q_1 + Q_3}{2}$.',
          urdu_answer: 'مڈ کوارٹائل رینج (Mid-Hinge) پہلے اور تیسرے کوارٹائل کا اوسط ہوتی ہے: $\\frac{Q_1 + Q_3}{2}$۔'
        },
        {
          stem: 'Which of the following represents the correct mathematical relationship among Arithmetic Mean (AM), Geometric Mean (GM), and Harmonic Mean (HM) for distinct positive values?',
          options: JSON.stringify({
            a: '$\\text{HM} \\ge \\text{GM} \\ge \\text{AM}$',
            b: '$\\text{AM} \\ge \\text{GM} \\ge \\text{HM}$',
            c: '$\\text{GM} \\le \\text{HM} \\le \\text{AM}$',
            d: '$\\text{AM} \\ge \\text{HM} < \\text{GM}$'
          }),
          correct: 'b',
          explanation: 'For distinct positive real numbers, $\\text{AM} > \\text{GM} > \\text{HM}$. Equality holds only when all observations are identical: $\\text{AM} \\ge \\text{GM} \\ge \\text{HM}$.',
          urdu_answer: 'مثبت اعداد کے لیے حسابی اوسط ہمیشہ جیومیٹرک اوسط سے بڑی یا برابر اور جیومیٹرک اوسط ہارمونک اوسط سے بڑی یا برابر ہوتی ہے: $\\text{AM} \\ge \\text{GM} \\ge \\text{HM}$۔'
        },
        {
          stem: 'The relationship between AM, GM, and HM for a set of two positive observations is:',
          options: JSON.stringify({
            a: '$\\text{AM} \\times \\text{GM} = \\text{HM}^2$',
            b: '$\\text{AM} \\times \\text{HM} = \\text{GM}^2$',
            c: '$\\text{GM} \\times \\text{HM} = \\text{AM}^2$',
            d: '$\\text{AM} + \\text{HM} = 2\\text{GM}$'
          }),
          correct: 'b',
          explanation: 'For any two positive numbers, $\\text{AM} \\times \\text{HM} = \\text{GM}^2$, which implies $\\text{GM} = \\sqrt{\\text{AM} \\times \\text{HM}}$.',
          urdu_answer: 'دو مثبت اعداد کے لیے تعلق $\\text{AM} \\times \\text{HM} = \\text{GM}^2$ ہوتا ہے۔'
        },
        {
          stem: 'The value of Harmonic Mean is lower than:',
          options: JSON.stringify({
            a: 'Arithmetic Mean',
            b: 'Geometric Mean',
            c: 'Both Arithmetic Mean & Geometric Mean',
            d: 'Neither AM nor GM'
          }),
          correct: 'c',
          explanation: 'Since $\\text{AM} \\ge \\text{GM} \\ge \\text{HM}$, Harmonic Mean assumes the lowest numerical value among the three Pythagorean averages for distinct positive observations.',
          urdu_answer: 'ہارمونک مین کی قیمت Arithmetic Mean اور Geometric Mean دونوں سے کم ہوتی ہے۔'
        },
        {
          stem: 'Range measures the dispersion around the:',
          options: JSON.stringify({
            a: 'Extreme values',
            b: 'Minimum value',
            c: 'Maximum value',
            d: 'Mid-range value'
          }),
          correct: 'd',
          explanation: 'The Range measures the total spread of observations centered around the Mid-Range value.',
          urdu_answer: 'رینج دراصل مڈ رینج (Mid-range) ویلیو کے ارد گرد کے پھیلاؤ یا ڈسپرشن کی پیمائش کرتی ہے۔'
        },
        {
          stem: 'Geometric Mean gives equal weightage to:',
          options: JSON.stringify({
            a: 'Smaller Values',
            b: 'Larger Values',
            c: 'Both smaller and larger values',
            d: 'None of the above'
          }),
          correct: 'c',
          explanation: 'Because Geometric Mean works with proportional logarithms, it balances the weight of both smaller and larger observations without being dominated by extreme magnitudes.',
          urdu_answer: 'جیومیٹرک مین چھوٹی اور بڑی دونوں اقدار کو متناسب یا برابر اہمیت دیتا ہے۔'
        },
        {
          stem: 'Which measure of central tendency is most suitable for calculating average rates of growth, ratios, and percentages?',
          options: JSON.stringify({
            a: 'Arithmetic Mean',
            b: 'Geometric Mean',
            c: 'Harmonic Mean',
            d: 'Median'
          }),
          correct: 'b',
          explanation: 'Geometric Mean is the theoretically correct average for rates of change, compound ratios, economic indices, and population growth rates.',
          urdu_answer: 'شرح نمو (Rates of growth)، تناسب (Ratios) اور فیصد (Percentages) کے اوسط کے لیے جیومیٹرک مین سب سے موزوں پیمانہ ہے۔'
        }
      ];

      for (const m of mcqsL9) {
        ins9.run(l9Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 5 Short Questions (3 marks each)
      const shortsL9 = [
        {
          stem: 'Define Mid-Range and Mid-Quartile Range (Mid-Hinge) and state their formulas.',
          correct: `1. Mid-Range:
• Definition: The arithmetic mean of the smallest ($X_0$) and largest ($X_m$) observations in a dataset. It is a simple, quick measure of central location representing the center of the total range.
• Formula:
$$\\text{Mid-Range} = \\frac{X_0 + X_m}{2}$$

2. Mid-Quartile Range (Mid-Hinge):
• Definition: The arithmetic mean of the first quartile ($Q_1$) and third quartile ($Q_3$). It measures the center of the middle 50% of the distribution and is more resistant to extreme outliers than the Mid-Range.
• Formula:
$$\\text{Mid-Quartile Range} = \\frac{Q_1 + Q_3}{2}$$`,
          explanation: 'Mid-Range = (X0 + Xm) / 2. Mid-Quartile Range (Mid-Hinge) = (Q1 + Q3) / 2.',
          urdu_answer: 'مڈ رینج کم ترین اور زیادہ سے زیادہ قیمت کا اوسط ہے: (X0 + Xm) / 2۔ مڈ کوارٹائل رینج پہلے اور تیسرے کوارٹائل کا اوسط ہے: (Q1 + Q3) / 2۔'
        },
        {
          stem: 'State the mathematical relationship between Arithmetic Mean, Geometric Mean, and Harmonic Mean.',
          correct: `Mathematical Relationship Among Averages:

1. General Ordering for Positive Real Values:
For any set of positive distinct real observations:
$$\\text{A.M.} > \\text{G.M.} > \\text{H.M.}$$
If all positive observations in the dataset are identical ($X_1 = X_2 = \\dots = X_n$), then:
$$\\text{A.M.} = \\text{G.M.} = \\text{H.M.}$$
Therefore, in general:
$$\\text{A.M.} \\ge \\text{G.M.} \\ge \\text{H.M.}$$

2. Relationship for Two Positive Numbers:
For any two positive numbers $a$ and $b$:
$$\\text{A.M.} = \\frac{a + b}{2}, \\quad \\text{G.M.} = \\sqrt{ab}, \\quad \\text{H.M.} = \\frac{2ab}{a + b}$$
Multiplying $\\text{A.M.}$ and $\\text{H.M.}$:
$$\\text{A.M.} \\times \\text{H.M.} = \\left(\\frac{a + b}{2}\\right) \\times \\left(\\frac{2ab}{a + b}\\right) = ab = (\\sqrt{ab})^2 = \\text{G.M.}^2$$
$$\\text{A.M.} \\times \\text{H.M.} = \\text{G.M.}^2 \\implies \\text{G.M.} = \\sqrt{\\text{A.M.} \\times \\text{H.M.}}$$`,
          explanation: 'A.M. >= G.M. >= H.M. For two numbers, A.M. * H.M. = G.M.^2.',
          urdu_answer: 'عام طور پر AM >= GM >= HM ہوتا ہے۔ دو مثبت اعداد کے لیے AM * HM = GM^2 کا تعلق ثابت ہوتا ہے۔'
        },
        {
          stem: 'Briefly explain the criteria for selecting the appropriate measure of central tendency among Arithmetic Mean, Median, Mode, Geometric Mean, and Harmonic Mean.',
          correct: `Criteria for Selecting the Appropriate Average:

1. Arithmetic Mean:
Use for standard symmetric quantitative data with no extreme outliers. It is the best average for further algebraic and inferential statistical treatments.

2. Median:
Use when data is heavily skewed or contains extreme outliers, or when frequency distributions feature open-ended class intervals.

3. Mode:
Use for qualitative or categorical data (e.g., most popular car color, most common shoe size), or when the single most typical or frequent value is desired.

4. Geometric Mean:
Use when dealing with percentage changes, growth rates (e.g., annual population increase), ratios, index numbers, and compound economic variables.

5. Harmonic Mean:
Use when calculating average speeds, time-rate problems, or unit prices where the distance or numerator quantity remains constant.`,
          explanation: 'Mean = standard quantitative; Median = skewed/open-ended; Mode = categorical/frequent; GM = growth rates/ratios; HM = speeds/rates.',
          urdu_answer: 'حسابی اوسط نارمل ڈیٹا کے لیے، میڈین ترچھے یا اوپن اینڈڈ ڈیٹا کے لیے، موڈ کیٹیگوریکل ڈیٹا کے لیے، جیومیٹرک مین شرح نمو اور فیصد کے لیے، اور ہارمونک مین رفتار اور اوسط لاگت کے لیے استعمال ہوتا ہے۔'
        },
        {
          stem: 'If $X_0 = 12$ (minimum value), $X_m = 88$ (maximum value), $Q_1 = 34$ (first quartile), and $Q_3 = 66$ (third quartile), calculate:\n1. Mid-Range\n2. Mid-Quartile Range (Mid-Hinge)',
          correct: `Part 1: Calculation of Mid-Range
Formula:
$$\\text{Mid-Range} = \\frac{X_0 + X_m}{2}$$
Substitution:
$$\\text{Mid-Range} = \\frac{12 + 88}{2} = \\frac{100}{2} = 50$$

Part 2: Calculation of Mid-Quartile Range (Mid-Hinge)
Formula:
$$\\text{Mid-Quartile Range} = \\frac{Q_1 + Q_3}{2}$$
Substitution:
$$\\text{Mid-Quartile Range} = \\frac{34 + 66}{2} = \\frac{100}{2} = 50$$

Result:
Both the Mid-Range and Mid-Quartile Range equal $50$.`,
          explanation: 'Mid-Range = (12 + 88)/2 = 50. Mid-Quartile Range = (34 + 66)/2 = 50.',
          urdu_answer: 'مڈ رینج = (12 + 88) / 2 = 50۔ مڈ کوارٹائل رینج = (34 + 66) / 2 = 50 حاصل ہوتا ہے۔'
        },
        {
          stem: 'If the Geometric Mean of two positive observations is 10 and their Harmonic Mean is 8, calculate their Arithmetic Mean.',
          correct: `Formula:
$$\\text{A.M.} \\times \\text{H.M.} = \\text{G.M.}^2$$

Given:
• $\\text{G.M.} = 10$
• $\\text{H.M.} = 8$

Step-by-step Calculation:
$$\\text{A.M.} \\times 8 = 10^2$$
$$\\text{A.M.} \\times 8 = 100$$
$$\\text{A.M.} = \\frac{100}{8} = 12.5$$

Result:
The Arithmetic Mean of the two observations is $12.5$.`,
          explanation: 'AM * HM = GM^2 => AM * 8 = 100 => AM = 100 / 8 = 12.5.',
          urdu_answer: 'فارمولا AM * HM = GM^2 ہے۔ AM * 8 = 100 جس سے AM = 12.5 حاصل ہوتا ہے۔'
        }
      ];

      for (const s of shortsL9) {
        ins9.run(l9Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsL9 = [
        {
          stem: `Given the continuous frequency distribution of car mileage ratings below:

Class Boundaries | Midpoint ($X$) | Frequency ($f$)
29.95 – 32.95    | 31.45          | 2
32.95 – 35.95    | 34.45          | 4
35.95 – 38.95    | 37.45          | 14
38.95 – 41.95    | 40.45          | 8
41.95 – 44.95    | 43.45          | 2

Calculate the Geometric Mean ($G$) and Harmonic Mean ($\\text{H.M.}$) for this grouped distribution.`,
          correct: `Step 1: Construct the calculation table ($n = \\sum f = 30$):

Class Boundaries | Midpoint ($X$) | Frequency ($f$) | $\\log_{10} X$ | $f \\log_{10} X$ | $f / X$
29.95 – 32.95    | 31.45          | 2               | 1.4976         | 2.9952           | 0.0636
32.95 – 35.95    | 34.45          | 4               | 1.5372         | 6.1488           | 0.1161
35.95 – 38.95    | 37.45          | 14              | 1.5735         | 22.0290          | 0.3738
38.95 – 41.95    | 40.45          | 8               | 1.6069         | 12.8552          | 0.1978
41.95 – 44.95    | 43.45          | 2               | 1.6380         | 3.2760           | 0.0460
Total            | —              | 30              | —              | 47.3042          | 0.7973

Step 2: Calculate Geometric Mean ($G$):
$$G = \\text{antilog}\\left(\\frac{\\sum f \\log X}{\\sum f}\\right)$$
$$G = \\text{antilog}\\left(\\frac{47.3042}{30}\\right) = \\text{antilog}(1.5768) \\approx 37.74\\text{ mpg}$$

Step 3: Calculate Harmonic Mean ($\\text{H.M.}$):
$$\\text{H.M.} = \\frac{\\sum f}{\\sum \\left(\\frac{f}{X}\\right)}$$
$$\\text{H.M.} = \\frac{30}{0.7973} \\approx 37.63\\text{ mpg}$$

Result Summary:
• Geometric Mean ($G$) = $37.74\\text{ mpg}$
• Harmonic Mean ($\\text{H.M.}$) = $37.63\\text{ mpg}$
(Note: $\\text{A.M.} = 37.83 > \\text{G.M.} = 37.74 > \\text{H.M.} = 37.63$, confirming $\\text{A.M.} \\ge \\text{G.M.} \\ge \\text{H.M.}$).`,
          explanation: 'Construct f*log(X) and f/X columns. G = antilog(47.3042/30) = 37.74. HM = 30 / 0.7973 = 37.63.',
          urdu_answer: 'جدول میں f*log(X) اور f/X معلوم کر کے فارمولے میں قیمتیں درج کی گئیں۔ نتیجہ: جیومیٹرک مین 37.74 اور ہارمونک مین 37.63 حاصل ہوتا ہے۔'
        },
        {
          stem: `Provide a comprehensive comparative analysis of the five classical Measures of Central Tendency (Arithmetic Mean, Median, Mode, Geometric Mean, and Harmonic Mean). Discuss their mathematical rigor, sensitivity to outliers, algebraic manipulability, and specific application areas.`,
          correct: `Comprehensive Comparative Analysis of Measures of Central Tendency:

1. Arithmetic Mean ($\\bar{X}$):
• Mathematical Rigor: Strictly defined; based on every single observation in the dataset.
• Outlier Sensitivity: Highly sensitive; extreme values distort the mean significantly.
• Algebraic Manipulability: Highly amenable to algebraic treatment (e.g., combined mean $\\bar{X}_c = \\frac{n_1 \\bar{X}_1 + n_2 \\bar{X}_2}{n_1 + n_2}$).
• Best Used For: General quantitative data with symmetrical bell-shaped distributions.

2. Median ($\\tilde{X}$):
• Mathematical Rigor: Positional average dividing ordered data into two equal 50% halves.
• Outlier Sensitivity: Highly robust; completely unaffected by extreme outlier magnitudes.
• Algebraic Manipulability: Poor; cannot be combined algebraically across subsets.
• Best Used For: Skewed data (e.g., household income, housing prices) and open-ended frequency tables.

3. Mode ($\\hat{X}$):
• Mathematical Rigor: The most frequently occurring value or highest frequency peak.
• Outlier Sensitivity: Immune to extreme outliers.
• Algebraic Manipulability: Not amenable to algebraic treatment; may be ill-defined (bimodal, multimodal, or no mode).
• Best Used For: Categorical/nominal data and business inventory sizing (e.g., most popular shoe/shirt size).

4. Geometric Mean ($G$):
• Mathematical Rigor: The $n$-th root of the product of $n$ observations; strictly defined for positive numbers.
• Outlier Sensitivity: Balances smaller and larger values proportionately; cannot handle zero or negative numbers.
• Algebraic Manipulability: Amenable to logarithmic algebraic manipulation.
• Best Used For: Proportional ratios, compound interest, index numbers, and growth rates.

5. Harmonic Mean ($\\text{H.M.}$):
• Mathematical Rigor: The reciprocal of the arithmetic mean of reciprocals; gives heavy weight to smaller values.
• Outlier Sensitivity: Extremely sensitive to very small positive values; undefined if any value is zero.
• Algebraic Manipulability: Amenable to rate-based algebraic transformations.
• Best Used For: Average speeds over fixed distances, time-rates, and cost per unit calculations.`,
          explanation: 'Compares all five averages across definition, outlier sensitivity, algebraic properties, and specific domain use cases.',
          urdu_answer: 'پانچوں اوسطوں کا تفصیلی موازنہ: حسابی اوسط تمام اقدار پر مشتمل لیکن آؤٹ لائرز سے متاثر ہوتی ہے۔ میڈین ترچھے ڈیٹا کے لیے بہترین ہے۔ موڈ مقبول ترین کیٹیگری بتاتا ہے۔ جیومیٹرک مین شرح نمو کے لیے اور ہارمونک مین اوسط رفتار معلوم کرنے کے لیے سب سے موزوں ہے۔'
        }
      ];

      for (const l of longsL9) {
        ins9.run(l9Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CS403 — Lecture 2: Levels of Data, Metadata, Database Users
  // ─────────────────────────────────────────────────────────────────────────────
  const cs403L2Subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs403'`).get() as { id: number } | undefined;
  if (cs403L2Subj) {
    const cs403L2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L2) {
      const cs403L2Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 2, ?)`).run(
        cs403L2Subj.id,
        'Levels of Data, Metadata, and Database Users'
      );
      const cl2Id = cs403L2Res.lastInsertRowid;

      const insC2 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // MCQ 1 — Real World Data
      insC2.run(cl2Id,'mcq','The level of data at which entities or objects exist in reality is called:',JSON.stringify({a:'Real world data',b:'Schema for real world data',c:'Meta data',d:'Data about data'}),'a','Real world data is the level where actual entities (e.g., a person named "Ali") physically exist with their attributes.',1,1,'lecture');

      // MCQ 2 — Metadata is Schema
      insC2.run(cl2Id,'mcq','Metadata is also known as ________ for the real world data.',JSON.stringify({a:'Attribute',b:'Schema',c:'Entity',d:'Relation'}),'b','Metadata defines the schema — the structural rules (field names, data types, sizes) that describe how real-world data will be stored.',1,1,'lecture');

      // MCQ 3 — Data about Data
      insC2.run(cl2Id,'mcq','Data about data is called:',JSON.stringify({a:'Metadata',b:'Real world data',c:'Database',d:'Relation'}),'a','Metadata describes the structure, properties, and meaning of the actual data — it is literally "data about data".',1,1,'lecture');

      // MCQ 4 — NOT a Characteristic of Metadata
      insC2.run(cl2Id,'mcq','Which one of the following is NOT a characteristic of metadata?',JSON.stringify({a:'Data about data',b:'Describes a data dictionary',c:'Self-describing',d:'Includes user data'}),'d','Metadata describes structure (field names, types, sizes); it does NOT store actual user data values.',1,1,'lecture');

      // MCQ 5 — Database Administrator Role
      insC2.run(cl2Id,'mcq','Who is responsible for authorizing access to the database, and for coordinating and monitoring its use?',JSON.stringify({a:'Database Designer',b:'Database Administrator',c:'End User',d:'Application Programmer'}),'b','The DBA (Database Administrator) manages all aspects of security, authorization, performance monitoring, and database coordination.',1,1,'lecture');

      // MCQ 6 — Expert Users
      insC2.run(cl2Id,'mcq','Users who know what to do and how to do it are called:',JSON.stringify({a:'Beginners',b:'Intermediate',c:'Experts',d:'New'}),'c','Expert users have full knowledge of database operations — they know both what action to perform and the precise method to execute it.',1,1,'lecture');

      // MCQ 7 — Types of Users by Knowledge
      insC2.run(cl2Id,'mcq','According to their level of knowledge and understanding, how many types of database users are there?',JSON.stringify({a:'Three',b:'Four',c:'Six',d:'Two'}),'a','Database users are classified into three categories based on knowledge level: Beginners, Intermediate, and Experts.',1,1,'lecture');

      // MCQ 8 — DBA Job Description
      insC2.run(cl2Id,'mcq','Which of the following describes the job of a Database Administrator (DBA)?',JSON.stringify({a:'Development, implementation and operation of the physical database',b:'Creation of the system catalog',c:'Monitoring and controlling database security and authorization',d:'All of the above'}),'d','The DBA is responsible for all three: physical database management, system catalog creation, and security/authorization control.',1,1,'lecture');

      // MCQ 9 — Example of Metadata
      insC2.run(cl2Id,'mcq','Which of the following is an example of metadata?',JSON.stringify({a:'Ali',b:'Address',c:'Person',d:'Student'}),'b','"Address" is a field name (structural attribute name) that defines what kind of data is stored — this is metadata. "Ali" would be an actual data value.',1,1,'lecture');

      // ── Short Questions ──────────────────────────────────────────────────────

      // SQ1 — Define Metadata
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        cl2Id,
        'Define Metadata and give an example.',
        `Metadata is defined as "data about data." It is the schema for the real-world data — it describes the structure, data type, field length, and properties of stored entities rather than storing actual data values.

Definition: Metadata = Schema = Rules/structure defining how data will be stored in the database.

Example:
  Field Name : Name
  Data Type  : Character
  Field Size : 25 characters

Here, "Name", "Character", and "25" are metadata — they describe the structure of the actual data (e.g., "Ali", "Sara") but are not the data themselves.

Key Property: A DBMS is self-describing because it stores its own metadata in the system catalog (data dictionary).`,
        'Metadata = data about data = schema. It describes structure (field names, types, sizes), not actual values.'
      );

      // SQ2 — Three Levels of Data
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        cl2Id,
        'Name and briefly describe the three Levels of Data.',
        `Database data exists at three distinct levels:

1. Real World Data:
   The level at which entities or objects exist in physical reality with identifiable attributes.
   Example: A person named "Ali" who has an address "Lahore" and a salary "50,000".

2. Meta Data (Schema):
   The rules/schema defining how data about real-world entities will be stored in the database.
   Example: Field "Name" of type Character(25), field "Salary" of type Number(8).
   This is "data about data" — it describes structure, not actual values.

3. Data Occurrence (Existence of Data):
   The actual data values stored in the database according to the metadata rules.
   Example: "Ali", "Lahore", 50000 — the real stored records conforming to the schema.`,
        'Three levels: Real World (entities exist), Metadata (schema/structure), Data Occurrence (actual stored values).'
      );

      // SQ3 — Costs of Implementing a DBMS
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        cl2Id,
        'What are the main costs involved in implementing a DBMS?',
        `Implementing a DBMS involves the following major costs:

1. High Initial Cost: The cost of acquiring DBMS software licences and the hardware upgrades required to run the system efficiently.

2. Data Conversion Cost: The expense of converting existing legacy data (from manual files or older file-processing systems) into the new database format.

3. Training Cost: Personnel (developers, administrators, and end users) must be trained to use the new system effectively.

4. Overhead and Complexity: A DBMS introduces additional processing overhead for security, concurrency control, and integrity enforcement — which can slow performance for simple applications.

5. Risk of Catastrophic Failure: Centralising data in one system increases the impact of system failure; complex backup and recovery procedures must be maintained.`,
        'DBMS costs: software/hardware acquisition, data conversion, training, processing overhead, and catastrophic failure risk.'
      );

      // SQ4 — Categories of Database Users
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`).run(
        cl2Id,
        'List the major categories of Database Users and briefly describe each.',
        `Database users are categorized as follows:

1. Database Administrator (DBA):
   Manages security, authorization, system catalog, performance tuning, backup and recovery. Central authority over the entire database environment.

2. Database Designers:
   Design the logical (ER model, schema) and physical (storage structures, indexes) database structure before implementation.

3. Application Programmers:
   Write programs and SQL queries that interact with the database to implement business logic and generate reports for end users.

4. End Users:
   Use application tools or query interfaces to retrieve, insert, update, or delete data. Classified into:
   • Beginners — limited knowledge, use menu-driven interfaces.
   • Intermediate — moderate knowledge, use forms and simple queries.
   • Experts — full knowledge, write complex queries directly.`,
        'Four main categories: DBA (security/admin), Designers (schema), Application Programmers (code), End Users (beginners/intermediate/experts).'
      );

      // ── Long Questions ────────────────────────────────────────────────────────

      // LQ1 — Levels of Data with Examples
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`).run(
        cl2Id,
        'Write a detailed note on the three Levels of Data in a database system, explaining each level with suitable examples and diagrams/tables.',
        `A database system organises data at three distinct levels:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 1 — REAL WORLD DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definition: The level at which real entities or objects physically exist in the world with identifiable characteristics.

Example Entity: PERSON
  • Name    : Ali
  • Address : 15 Model Town, Lahore
  • Salary  : Rs. 50,000/month

At this level we identify WHAT needs to be stored — the actual people, things, and events.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 2 — META DATA (Schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definition: Metadata is "data about data" — the schema that defines the structure, data types, and rules for storing real-world data. It does NOT contain actual values.

Example Schema (Metadata Table):
  Field Name | Data Type  | Size | Constraint
  -----------|------------|------|------------
  Name       | Character  |  25  | NOT NULL
  Address    | Character  |  50  | NULL allowed
  Salary     | Number     |   8  | >= 0

The DBMS stores this metadata in its System Catalog (Data Dictionary), making the system self-describing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVEL 3 — DATA OCCURRENCE (Existence of Data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definition: The actual data values stored in the database conforming to the metadata schema. Each row/record is one data occurrence.

Example (Actual Stored Records):
  Name    | Address              | Salary
  --------|----------------------|--------
  Ali     | 15 Model Town, LHR   | 50000
  Sara    | 5 Gulberg III, LHR   | 65000
  Hassan  | 22 DHA Phase 5, LHR  | 80000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATIONSHIP BETWEEN LEVELS:
Real World → described by → Metadata → used to store → Data Occurrence

Key Point: One metadata schema can have thousands of data occurrences. Changing the schema (metadata) affects how all future data occurrences are stored.`,
        'The three levels form a hierarchy: Real World (what exists) → Metadata (how to store it) → Data Occurrence (what is actually stored).'
      );

      // LQ2 — DBA vs Application Programmers
      db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`).run(
        cl2Id,
        'Explain the responsibilities of a Database Administrator (DBA) and compare them with the role of Application Programmers.',
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE ADMINISTRATOR (DBA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The DBA is the central authority responsible for the overall management of the database environment.

Responsibilities:
1. Security & Authorization: Grants/revokes user access rights; sets up login accounts and privileges.
2. System Catalog Management: Creates and maintains the data dictionary (metadata store).
3. Physical Database Design: Determines storage structures, indexing strategies, and file organisations.
4. Performance Monitoring: Tunes query performance; monitors disk usage and response times.
5. Backup & Recovery: Implements backup schedules; manages disaster recovery procedures.
6. Data Integrity: Enforces integrity constraints and ensures data quality across the database.
7. Concurrency Control: Manages simultaneous multi-user access to prevent data conflicts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION PROGRAMMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Application programmers develop the software interface between end users and the database.

Responsibilities:
1. Requirements Analysis: Understand end-user needs and translate them into database queries.
2. Program Development: Write application code (in Java, PHP, Python, etc.) that calls SQL statements.
3. SQL Query Writing: Craft SELECT, INSERT, UPDATE, DELETE statements embedded in application logic.
4. Report Generation: Build reports and dashboards that present data to end users.
5. Testing & Debugging: Verify that the application correctly retrieves and modifies data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY DIFFERENCES:
Aspect             | DBA                    | Application Programmer
-------------------|------------------------|------------------------
Focus              | Database management    | Application development
Authority          | Full system authority  | Restricted to assigned DB
SQL Access         | All DDL + DML          | Primarily DML (queries)
Security Role      | Grants permissions     | Works within permissions
Primary Tool       | DBMS admin console     | Programming language + API`,
        'DBA manages the entire database environment (security, backup, tuning); Application Programmers build the software that uses the database.'
      );
    }

    // ── CS403 Lecture 3: Three-Level Architecture (ANSI/SPARC) & Data Independence ──
    const cs403L3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L3) {
      const cs403L3Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 3, ?)`).run(
        cs403L2Subj.id,
        'Three-Level Architecture (ANSI/SPARC) and Data Independence'
      );
      const cl3Id = cs403L3Res.lastInsertRowid;

      const insC3 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 11 MCQs
      insC3.run(cl3Id, 'mcq',
        'Which one of the following is NOT a part of the three-level architecture?',
        JSON.stringify({ a: 'External level', b: 'Conceptual level', c: 'Internal level', d: 'Physical level' }),
        'd',
        'The ANSI/SPARC three-level architecture comprises External, Conceptual, and Internal levels. "Physical level" is not a standard name in this architecture (Internal level handles physical storage).',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'Making a change to the conceptual schema of a database but not affecting the existing external schemas is an example of ______.',
        JSON.stringify({ a: 'Physical data independence', b: 'Concurrency control', c: 'Logical data independence', d: 'Functional dependency' }),
        'c',
        'Logical data independence is the ability to modify the conceptual schema without having to change external schemas or existing application programs.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'The three levels architecture is useful for ______.',
        JSON.stringify({ a: 'Arranging the data in an organized manner', b: 'Hiding the details of internal systems', c: 'Breaking the data access restriction', d: 'Storing definitions of the structures' }),
        'b',
        'The primary goal of the three-level architecture is to provide data independence and hide physical storage and internal implementation details from end users.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'Which of the following provides us data independence?',
        JSON.stringify({ a: '3-Level Architecture', b: 'File Processing System', c: 'Context DFD', d: 'Relational Algebra' }),
        'a',
        'The ANSI/SPARC 3-Level Architecture is specifically designed to achieve data independence by separating user views from physical storage.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'Three level schema Architecture allows us to separate the physical representation of data from the ______.',
        JSON.stringify({ a: 'System view', b: 'User view', c: 'Application view', d: 'Logical view' }),
        'b',
        'The architecture separates the user view (external level) from the physical representation of data (internal level), with the conceptual level acting as the intermediate layer.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
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

      insC3.run(cl3Id, 'mcq',
        'In three level architecture of the database, which level is helpful to display data which is not actually placed in the database?',
        JSON.stringify({ a: 'External Level', b: 'Conceptual Level', c: 'Internal Level', d: 'Physical Level' }),
        'a',
        'The External Level (user views) can present virtual, derived, or computed data (such as calculating age from date of birth) that is not physically stored.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'In a three level DBMS architecture, the ______ level interacts directly with the users.',
        JSON.stringify({ a: 'External', b: 'Conceptual', c: 'Internal', d: 'Physical' }),
        'a',
        'The External level directly interacts with users, providing tailored views suitable for distinct groups of end users.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
        'Core of the Database Architecture is ______.',
        JSON.stringify({ a: 'Internal level', b: 'External level', c: 'Conceptual level', d: 'ANSI SPARK' }),
        'a',
        'According to CS403 handouts, the core of the database architecture is the internal level of schema, which defines how data is physically stored and accessed.',
        1, 1, 'lecture'
      );

      insC3.run(cl3Id, 'mcq',
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

      insC3.run(cl3Id, 'mcq',
        'In three level architecture of the database, which level is responsible for storage of data on some storage media?',
        JSON.stringify({ a: 'External view', b: 'Conceptual view', c: 'Internal/Physical view', d: 'User view' }),
        'c',
        'The Internal (Physical) view describes the physical storage structures, access paths, record layouts, and media allocation.',
        1, 1, 'lecture'
      );

      // 4 Short Questions
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
      `).run(
        cl3Id,
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

      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
      `).run(
        cl3Id,
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

      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
      `).run(
        cl3Id,
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

      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')
      `).run(
        cl3Id,
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
      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
      `).run(
        cl3Id,
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

      db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category)
        VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')
      `).run(
        cl3Id,
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

    // ── CS403 Lecture 4: DBMS Functions and Multi-User Architectures ──
    const cs403L4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L4) {
      const cs403L4Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 4, ?)`).run(
        cs403L2Subj.id,
        'DBMS Functions and Multi-User Architectures'
      );
      const cl4Id = cs403L4Res.lastInsertRowid;

      const insC4 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
      `);

      const insC4S = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
      `);

      const insC4L = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
      `);

      // 10 MCQs
      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      insC4.run(
        cl4Id,
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

      // 4 Short Questions
      insC4S.run(
        cl4Id,
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

      insC4S.run(
        cl4Id,
        'Briefly describe File Server Architecture and its main disadvantage.',
        `File Server Architecture:
In a file server architecture, a centralized file server acts as a shared disk holding the database files across a Local Area Network (LAN). The DBMS software and user applications run entirely on each local client workstation.

Main Disadvantage:
When a client executes a query, the file server must transmit entire database files over the network to the client workstation for local filtering and processing. For large databases, this generates massive network traffic, high latency, and severe performance bottlenecks.`,
        'Because the server is only a file storage device, all query processing is forced onto client machines over the network.',
        'فائل سرور آرکیٹیکچر میں ڈیٹا بیس فائلز مرکزی سرور پر ہوتی ہیں لیکن ڈی بی ایم ایس سافٹ ویئر ہر کلائنٹ پر چلتا ہے۔ اس کا بڑا نقصان یہ ہے کہ معمولی ڈیٹا کے لیے بھی پوری فائل نیٹ ورک پر ٹرانسفر کرنا پڑتی ہے جس سے نیٹ ورک پر شدید بوجھ پڑتا ہے۔'
      );

      insC4S.run(
        cl4Id,
        'What is the main advantage of Client-Server Architecture over File Server Architecture?',
        `Main Advantage of Client-Server Architecture:
In Client-Server architecture, query processing is executed on the database server itself rather than on the client workstation. 

When a client application submits an SQL query, the database server searches, indexes, filters, and processes the data locally, and transmits ONLY the final result set back across the network to the client. This drastically minimizes network traffic, reduces communication overhead, and optimizes performance in large-scale multi-user environments.`,
        'Client-Server separates presentation from database processing, transmitting only query answers rather than raw database files.',
        'کلائنٹ سرور کا سب سے بڑا فائدہ یہ ہے کہ کیوری سرور پر پراسیس ہوتی ہے اور نیٹ ورک پر صرف مطلوبہ رزلٹ واپس بھیجا جاتا ہے، پوری فائل نہیں۔ اس سے نیٹ ورک ٹریفک بہت کم ہو جاتی ہے۔'
      );

      insC4S.run(
        cl4Id,
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

      // 2 Long Questions
      insC4L.run(
        cl4Id,
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

      insC4L.run(
        cl4Id,
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
    }

    // ── CS403 Lecture 5: Database Development Process & Data Flow Diagrams (DFDs) ──
    const cs403L5 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 5`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L5) {
      const cs403L5Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 5, ?)`).run(
        cs403L2Subj.id,
        'Database Development Process & Data Flow Diagrams (DFDs)'
      );
      const cl5Id = cs403L5Res.lastInsertRowid;

      const insC5 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
      `);

      const insC5S = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
      `);

      const insC5L = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
      `);

      // 11 MCQs
      insC5.run(
        cl5Id,
        'Which is the second stage in the database development process?',
        JSON.stringify({
          a: 'Database design',
          b: 'Preliminary Study',
          c: 'Physical Design',
          d: 'Requirement Analysis'
        }),
        'd',
        'The database development process begins with Preliminary Study (Stage 1), followed by Requirement Analysis (Stage 2), Database Design (Stage 3), Physical Design (Stage 4), Implementation (Stage 5), and Maintenance (Stage 6).',
        'ڈیٹا بیس ڈویلپمنٹ لائف سائیکل میں ابتدائی مطالعہ (Preliminary Study) پہلا مرحلہ اور ضرورت کا تجزیہ (Requirement Analysis) دوسرا مرحلہ ہے۔'
      );

      insC5.run(
        cl5Id,
        'Which of the following is the input to Analysis Phase?',
        JSON.stringify({
          a: 'DFD',
          b: 'Logical database design',
          c: 'Physical database design',
          d: 'Data model'
        }),
        'a',
        'The high-level Data Flow Diagram (DFD) generated during the Preliminary Study phase serves as the fundamental input to the Requirement Analysis phase.',
        'ابتدائی مطالعے سے تیار کردہ ڈیٹا فلو ڈایاگرام (DFD) اینالسز فیز کے لیے بنیادی ان پٹ کے طور پر کام کرتی ہے۔'
      );

      insC5.run(
        cl5Id,
        'Which of the following shows least amount of detail?',
        JSON.stringify({
          a: 'Context DFD',
          b: 'Level 0 DFD',
          c: 'Level 1 DFD',
          d: 'Level 2 DFD'
        }),
        'a',
        'The Context DFD provides the highest level of abstraction, depicting the entire system as a single process and revealing the least amount of internal system detail.',
        'کانٹیکسٹ لیول DFD سب سے اونچی سطح کا خاکہ ہے جو سسٹم کی اندرونی باریکیوں کی سب سے کم تفصیل (Least detail) دکھاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'In case of Context Level DFD, the System is represented by ______.',
        JSON.stringify({
          a: 'At least one Process',
          b: 'One Process only',
          c: 'Two Processes',
          d: 'Three Processes'
        }),
        'b',
        'In a Context Level DFD, the entire system is represented by exactly ONE single process bubble, labeled with the system name.',
        'کانٹیکسٹ لیول DFD میں پورا سسٹم صرف اور صرف ایک ہی پراسیس (One Process only) کے ذریعے ظاہر کیا جاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'Which of the following is NOT a feature of Context DFD?',
        JSON.stringify({
          a: 'One process (which represents the entire system)',
          b: 'All sources/sinks (external entities)',
          c: 'Data flows linking the process to the sources and sinks',
          d: 'Sub-processes (which explain and decompose the major process into small processes)'
        }),
        'd',
        'A Context DFD contains only one overall process, external entities (sources/sinks), and data flows. It does NOT contain sub-processes or data stores.',
        'کانٹیکسٹ DFD میں سب پراسیسز (Sub-processes) یا ڈیٹا اسٹورز شامل نہیں ہوتے، یہ صرف ایک مرکزی پراسیس اور بیرونی اداروں کو دکھاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'DFD does not provide us a way to represent ______.',
        JSON.stringify({
          a: 'Data flows',
          b: 'Decisions',
          c: 'External entities',
          d: 'Processes'
        }),
        'b',
        'Data Flow Diagrams (DFDs) do not represent decisions, conditional branching (IF-THEN), or execution sequence/timing.',
        'ڈیٹا فلو ڈایاگرام (DFD) میں فیصلہ سازی (Decisions یا کنڈیشنل برانچنگ) کو ظاہر کرنے کا کوئی طریقہ یا علامت نہیں ہوتی۔'
      );

      insC5.run(
        cl5Id,
        'In database development process, which phase involves designing of any new application for the enhancement of the system?',
        JSON.stringify({
          a: 'Requirement Analysis',
          b: 'Database Design',
          c: 'Maintenance phase',
          d: 'Implementation'
        }),
        'c',
        'The Maintenance phase involves post-deployment operational support, bug fixing, and designing enhancements or new applications to extend system functionality.',
        'مینٹیننس فیز (Maintenance phase) میں سسٹم میں بہتری لانے کے لیے نئی ایپلی کیشنز یا فیچرز کا اضافہ اور غلطیوں کو دور کیا جاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'Which of the following tool is used to graphically represent the components and design of the system?',
        JSON.stringify({
          a: 'ERD',
          b: 'DFD',
          c: 'Data Dictionary',
          d: 'Cross Reference Matrix'
        }),
        'b',
        'A Data Flow Diagram (DFD) graphically models the components, processes, data stores, and pathways through which data moves across the system.',
        'سسٹم کے اجزاء اور ڈیٹا کے بہاؤ کو تصویری شکل میں ظاہر کرنے کے لیے ڈیٹا فلو ڈایاگرام (DFD) کا استعمال کیا جاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'In database development process, which of the following is related to requirement gathering phase?',
        JSON.stringify({
          a: 'Detailed study of system',
          b: 'Physical design',
          c: 'Conceptual design',
          d: 'System testing'
        }),
        'a',
        'Requirement gathering involves an exhaustive and detailed study of the organizational system through stakeholder interviews, questionnaires, and existing documentation.',
        'ریکوائرمنٹ جمع کرنے کے مرحلے میں صارفین کے انٹرویوز اور نظام کے تفصیلی مطالعے (Detailed study of system) کے ذریعے ضروریات سمجھی جاتی ہیں۔'
      );

      insC5.run(
        cl5Id,
        'Which of the following is correct regarding Data Flow Diagram (DFD)?',
        JSON.stringify({
          a: 'Single DFD is required to represent a system',
          b: 'The dataflow must be bidirectional',
          c: 'Created at increasing levels of detail',
          d: 'Used to represent the relationships among the external entities'
        }),
        'c',
        'DFDs are structured hierarchically through top-down decomposition: from the Context level, they are decomposed into Level 0, Level 1, and Level 2 diagrams at increasing levels of detail.',
        'ڈی ایف ڈی (DFD) کو مختلف درجوں (Levels) میں مرحلہ وار گہری تفصیلات (Increasing levels of detail) کے ساتھ بنایا جاتا ہے۔'
      );

      insC5.run(
        cl5Id,
        'At which stage of database development process, the schema rules are defined and identified?',
        JSON.stringify({
          a: 'Mapping of conceptual model to the logical model',
          b: 'Analyzing user requirements',
          c: 'Development of the conceptual model',
          d: 'Development of the physical design'
        }),
        'a',
        'Schema rules, relational structures, primary/foreign key mappings, and normalization rules are defined and identified when transforming the conceptual model (ERD) into the logical relational model.',
        'کونسیپچول ماڈل کو لاجیکل ماڈل میں تبدیل کرتے وقت (Mapping phase) اسکیما رولز اور ریلیشنل ٹیبلز کی ساخت واضح کی جاتی ہے۔'
      );

      // 4 Short Questions
      insC5S.run(
        cl5Id,
        'What is a Data Flow Diagram (DFD)? Mention any one limitation of DFD.',
        `Data Flow Diagram (DFD):
A Data Flow Diagram (DFD) is a structured graphical modeling tool used to depict how data flows, transforms, and is stored within an information system. Its four core components are Processes, Data Flows, Data Stores, and External Entities.

One Major Limitation of DFD:
DFDs cannot depict decision-making logic or conditional branching (such as IF-THEN-ELSE statements) and do not indicate execution sequence or processing timing.`,
        'DFD shows functional data movement but cannot represent control logic or branching conditions.',
        'ڈی ایف ڈی (DFD) سسٹم میں ڈیٹا کے بہاؤ کو ظاہر کرنے والا گرافیکل ماڈل ہے۔ اس کی بڑی خامی یہ ہے کہ یہ فیصلہ سازی (Decisions یا IF-THEN کنڈیشنز) اور وقت کی ترتیب کو ظاہر نہیں کر سکتا۔'
      );

      insC5S.run(
        cl5Id,
        'Briefly describe Context DFD (Context Level Diagram) and its main characteristics.',
        `Context DFD (Context-Level Diagram):
The Context DFD is the highest-level summary diagram of a system. It abstracts the entire information system as a single black-box process with the least amount of internal detail.

Main Characteristics:
1. Exactly One Process: Represents the entire system using a single central process bubble.
2. External Entities: Illustrates only external entities (sources and sinks) interacting across system boundaries.
3. No Data Stores: Data stores are strictly omitted from the Context diagram.
4. No Sub-Processes: Detailed internal operations are not shown at this level; all decomposition occurs in lower-level DFDs.`,
        'Context DFD provides a high-level boundary view containing one process, external entities, and data flows, without data stores.',
        'کانٹیکسٹ DFD پورے سسٹم کو صرف ایک مرکزی پراسیس اور بیرونی اداروں کے ذریعے دکھاتی ہے۔ اس میں کوئی اندرونی سب پراسیس یا ڈیٹا اسٹور نہیں ہوتا۔'
      );

      insC5S.run(
        cl5Id,
        'List the basic components/symbols used in a Data Flow Diagram (DFD).',
        `The four basic components and symbols of a Data Flow Diagram (DFD) are:

1. Process (Circle or Rounded Rectangle):
Represents a functional activity or computational procedure that accepts incoming data and transforms it into outgoing data.

2. Data Flow (Directed Arrow):
Represents the path and direction in which packets of data move between processes, data stores, and external entities.

3. Data Store (Open-ended Rectangle or Two Parallel Lines):
Represents a persistent storage repository (file, database table, or document folder) where data rests at rest.

4. External Entity / Source & Sink (Solid Rectangle):
Represents an external person, organizational department, or external system that originates input data (source) or receives output results (sink).`,
        'The four standard DFD symbols are Process, Data Flow, Data Store, and External Entity (Source/Sink).',
        'ڈی ایف ڈی کے 4 بنیادی اجزاء: 1. پراسیس (دائرہ/گول مستطیل)، 2. ڈیٹا فلو (تیر کا نشان)، 3. ڈیٹا اسٹور (دو متوازی لکیریں)، 4. بیرونی ادارہ (مستطیل)۔'
      );

      insC5S.run(
        cl5Id,
        'Differentiate between Preliminary Study phase and Requirement Analysis phase in Database Development.',
        `Differences between Preliminary Study and Requirement Analysis:

1. Preliminary Study (Phase 1):
• Purpose: Conducts a high-level feasibility assessment of the organization, existing business workflows, and operational problems.
• Focus: Determines whether developing a new database system is technically and economically justified, defining broad system boundaries.
• Key Deliverable: Context-level DFD and high-level Data Flow Diagrams.

2. Requirement Analysis (Phase 2):
• Purpose: Conducts an exhaustive, granular investigation into exact stakeholder needs and functional rules.
• Focus: Collects detailed user specifications using interviews, questionnaires, and document sampling.
• Key Deliverable: User Requirement Specification, Cross-Reference Matrix, and initial Conceptual Data Model (ER Model).`,
        'Preliminary Study determines high-level feasibility and produces DFDs; Requirement Analysis gathers specific detailed needs and produces ER models.',
        'ابتدائی مطالعہ (Preliminary Study) سسٹم کی فزیبلٹی جانچتا ہے اور DFD بناتا ہے۔ جبکہ ریکوائرمنٹ اینالسز (Requirement Analysis) صارفین سے تفصیلی ڈیٹا لے کر ابتدائی ER ماڈل تیار کرتا ہے۔'
      );

      // 2 Long Questions
      insC5L.run(
        cl5Id,
        'Explain the Database Development Life Cycle (Database Development Process / SDLC) stages in detail.',
        `Database Development Life Cycle (SDLC):

The Database Development Life Cycle is a structured methodology consisting of six progressive phases:

1. Preliminary Study:
The initial phase focuses on conducting a high-level feasibility investigation of the organization. Analysts study the existing system, organizational objectives, and workflows to define system scope and boundaries. Deliverables include Context and Level-0 DFDs.

2. Requirement Analysis:
Detailed requirement gathering is conducted using stakeholder interviews, user questionnaires, observation, and examination of business documents. Data requirements, business rules, and transaction volumes are documented. Deliverables include User Requirement Specifications and the Cross-Reference Matrix.

3. Database Design:
Divided into two critical sub-phases:
• Conceptual Database Design: Developing an enterprise Entity-Relationship (ER) model completely independent of hardware and DBMS software.
• Logical Database Design: Transforming the ER model into normalized relational tables (1NF, 2NF, 3NF), defining primary/foreign keys, and enforcing referential integrity.

4. Physical Database Design:
Selecting a target DBMS (such as Oracle, Microsoft SQL Server, or PostgreSQL) and configuring file organizations, indexing mechanisms (e.g., B-Trees, Hash indexes), storage partitioning, and access control rights to maximize throughput and minimize query latency.

5. Implementation:
Creating physical database tables using SQL Data Definition Language (DDL), populating tables with initial/legacy data, developing application programs, queries, and user input forms, and conducting comprehensive integration testing.

6. Maintenance and Enhancement:
Post-deployment operational support: monitoring ongoing system performance, conducting routine backups, fine-tuning storage and indexes, fixing runtime bugs, and designing enhancements or new applications as business needs expand.`,
        'The six phases guide structured development from initial feasibility through conceptual/logical/physical design to deployment and continuous maintenance.',
        'ڈیٹا بیس لائف سائیکل کے 6 مراحل: 1. ابتدائی مطالعہ (Preliminary Study)، 2. ضروریات کا تجزیہ (Requirement Analysis)، 3. ڈیٹا بیس ڈیزائن (کونسیپچول و لاجیکل)، 4. فزیکل ڈیزائن (اسٹوریج و انڈیکسنگ)، 5. عمل درآمد (Implementation)، 6. دیکھ بھال اور بہتری (Maintenance)۔'
      );

      insC5L.run(
        cl5Id,
        'Discuss the different Types of Data Flow Diagrams (Context DFD, Level 0 DFD, and Detailed DFD).',
        `Types and Levels of Data Flow Diagrams (DFDs):

DFDs use hierarchical top-down decomposition to represent systems at increasing levels of detail:

1. Context Diagram (Highest-Level Abstraction):
• Scope: Depicts the entire information system as a single central process bubble (labeled with the system name).
• Components: Contains the central process, connected external entities (sources and sinks), and boundary data flows.
• Exclusions: Does NOT contain internal data stores or sub-processes.
• Purpose: Clearly delineates the external interfaces and operational boundaries of the system.

2. Level 0 DFD (System-Level Functional Diagram):
• Scope: Decomposes the single context process into major functional subsystems or primary modules (numbered 1.0, 2.0, 3.0, etc.).
• Components: Identifies primary data stores (database tables or persistent files) and depicts data flows moving between major processes, stores, and external entities.
• Purpose: Offers a balanced overview of core business functions without overwhelming technical detail.

3. Detailed DFDs (Level 1, Level 2, and Primitive DFDs):
• Scope: Progressively decomposes each complex process from Level 0 into granular sub-processes.
  - Level 1: Process 1.0 decomposes into child processes 1.1, 1.2, 1.3, etc.
  - Level 2: Process 1.2 further decomposes into 1.2.1, 1.2.2, etc.
• Primitive DFD: Decomposition continues until reaching functional primitives—simple sub-processes that cannot be divided further and can be directly implemented using program logic.
• Purpose: Reveals exact internal algorithmic pathways, error handling, validation steps, and data transformations for software developers.`,
        'Hierarchical DFD decomposition starts from Context (system boundary) to Level 0 (major modules & stores) and Detailed Level 1/2 (primitive sub-processes).',
        'ڈی ایف ڈی کی اقسام: 1. کانٹیکسٹ DFD (پورا سسٹم ایک پراسیس کی صورت میں)، 2. لیول 0 DFD (سسٹم کے بڑے ماڈیولز اور ڈیٹا اسٹورز کی نشاندہی)، 3. تفصیلی ڈی ایف ڈی (Level 1 اور Level 2 جن میں پراسیسز کو مزید چھوٹے حصوں 1.1، 1.2 اور پرائمیٹو لیول میں تقسیم کیا جاتا ہے)۔'
      );
    }

    // ── CS403 Lecture 6: Detailed DFDs, Data Dictionary & Database Design Phases ──
    const cs403L6 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 6`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L6) {
      const cs403L6Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 6, ?)`).run(
        cs403L2Subj.id,
        'Detailed DFDs, Data Dictionary & Database Design Phases'
      );
      const cl6Id = cs403L6Res.lastInsertRowid;

      const insC6 = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
      `);

      const insC6S = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
      `);

      const insC6L = db.prepare(`
        INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
        VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
      `);

      // 10 MCQs
      insC6.run(
        cl6Id,
        'Which levels are mostly used for detailed DFD?',
        JSON.stringify({
          a: 'Level-0, Level-1',
          b: 'Level-1, Level-2',
          c: 'Level-2, Level-3',
          d: 'Level-3, Level-4'
        }),
        'a',
        'In structured systems analysis and design, Level-0 and Level-1 DFDs are the levels most frequently utilized to illustrate system workflows and detailed processes.',
        'سسٹم ڈیزائن میں عام طور پر لیول-0 اور لیول-1 ڈی ایف ڈی کو تفصیلی پراسیسز کی وضاحت کے لیے سب سے زیادہ استعمال کیا جاتا ہے۔'
      );

      insC6.run(
        cl6Id,
        'Which of the following is created by "Database Management System" for its usage?',
        JSON.stringify({
          a: 'Free Standing Data Dictionary',
          b: 'Cross Reference Matrix',
          c: 'Weak Entity',
          d: 'Integrated Data Dictionary'
        }),
        'd',
        'An Integrated Data Dictionary is directly embedded within and maintained automatically by the Database Management System (DBMS) for managing internal schemas, constraints, and mappings.',
        'انٹیگریٹڈ ڈیٹا ڈکشنری (Integrated Data Dictionary) کو ڈی بی ایم ایس خود اپنے استعمال اور کنٹرول کے لیے بناتا اور چلاتا ہے۔'
      );

      insC6.run(
        cl6Id,
        'Cross reference matrix is a tool available in the data dictionary, which helps us in finding ______.',
        JSON.stringify({
          a: 'Entities of the database and their associations',
          b: 'Relationship between different tables',
          c: 'Requirements for database',
          d: 'User of the database'
        }),
        'a',
        'The Cross Reference Matrix is an analytical grid within the data dictionary that cross-checks data attributes against processes and reports, helping discover database entities and their associations.',
        'کراس ریفرنس میٹرکس ڈیٹا بیس کے اینٹٹیز اور ان کے باہمی تعلقات و خصوصیات (Entities and associations) کو دریافت کرنے میں مدد فراہم کرتا ہے۔'
      );

      insC6.run(
        cl6Id,
        'Cross reference matrix is developed at the ______ stage of the database.',
        JSON.stringify({
          a: 'Analysis',
          b: 'Designing',
          c: 'Implementation',
          d: 'Application'
        }),
        'a',
        'The Cross Reference Matrix is created during the Requirement Analysis phase to systematically verify that all data attributes required by user reports exist in the proposed database entities.',
        'کراس ریفرنس میٹرکس ڈیٹا بیس کی اینالسز (Analysis) فیز کے دوران تیار کیا جاتا ہے تاکہ تمام مطلوبہ ایٹری بیوٹس کی توثیق ہو سکے۔'
      );

      insC6.run(
        cl6Id,
        'In cross reference matrix, attributes/items are specified on ______ and reports/transactions are specified on ______.',
        JSON.stringify({
          a: 'Y axis, X axis',
          b: 'X axis, Y axis',
          c: 'X axis, X axis',
          d: 'Y axis, Y axis'
        }),
        'b',
        'In the standard matrix layout, data attributes/items are arranged across the horizontal columns (X-axis) and reports/transactions are listed down the vertical rows (Y-axis).',
        'کراس ریفرنس میٹرکس میں ایٹری بیوٹس/آئٹمز X-axis (کالمز) پر اور رپورٹس/ٹرانزیکشنز Y-axis (قطاروں) پر لکھی جاتی ہیں۔'
      );

      insC6.run(
        cl6Id,
        'A collection of concepts that can be used to describe the structure of a database is called ______.',
        JSON.stringify({
          a: 'Database',
          b: 'DBMS',
          c: 'Data model',
          d: 'Data'
        }),
        'c',
        'A Data Model is an integrated collection of concepts, notations, and constraints used to define the logical structure, entity relationships, and semantics of data stored in a database.',
        'تصورات کا وہ مجموعہ جو ڈیٹا بیس کی ساخت، تعلقات اور حدود کو بیان کرنے کے لیے استعمال ہو، ڈیٹا ماڈل (Data model) کہلاتا ہے۔'
      );

      insC6.run(
        cl6Id,
        'Select the most appropriate statement. Which of the following data model is used to design logical database design?',
        JSON.stringify({
          a: 'Relational',
          b: 'Hierarchical',
          c: 'Object oriented',
          d: 'Any model can be used'
        }),
        'a',
        'In commercial database design, the Relational Data Model (tables, rows, columns, and foreign keys) is the primary model used to construct the logical database schema.',
        'لاجیکل ڈیٹا بیس ڈیزائن تیار کرنے کے لیے سب سے عام اور موزوں ماڈل ریلیشنل ماڈل (Relational Data Model) ہے۔'
      );

      insC6.run(
        cl6Id,
        'A database containing data about all the databases in the database system is called ______.',
        JSON.stringify({
          a: 'Database Schema',
          b: 'Data Dictionary',
          c: 'Data Model',
          d: 'Catalog System'
        }),
        'b',
        'A Data Dictionary (system catalog) is a centralized repository that stores metadata—data about schemas, tables, fields, constraints, and users across all databases in the system.',
        'وہ ڈیٹا بیس جس میں پورے ڈیٹا بیس سسٹم کے تمام ڈیٹا بیسز کی معلومات (Metadata) محفوظ ہوں، ڈیٹا ڈکشنری (Data Dictionary) کہلاتی ہے۔'
      );

      insC6.run(
        cl6Id,
        'What is the recommended maximum number of processes in a detailed DFD for clarity?',
        JSON.stringify({
          a: '3 to 5',
          b: '7 to 9',
          c: '10 to 15',
          d: 'Unlimited'
        }),
        'b',
        'Standard structured analysis guidelines recommend placing between 7 and 9 processes on a single DFD page to preserve visual clarity and avoid cognitive overload.',
        'پڑھنے میں آسانی اور واضح سمجھ کے لیے کسی ایک ڈی ایف ڈی صفحے پر 7 سے 9 (7 to 9) پراسیسز رکھنے کی سفارش کی جاتی ہے۔'
      );

      insC6.run(
        cl6Id,
        'In a Detailed DFD, if process 1.2 is further decomposed, its sub-processes will be numbered as ______.',
        JSON.stringify({
          a: '2.1, 2.2, 2.3',
          b: '1.2.1, 1.2.2, 1.2.3',
          c: '1.3, 1.4, 1.5',
          d: 'A, B, C'
        }),
        'b',
        'In DFD hierarchical decimal numbering schemes, further decomposing child process 1.2 creates sub-processes numbered 1.2.1, 1.2.2, 1.2.3, etc.',
        'ڈی ایف ڈی نمبرنگ کے اصول کے تحت اگر پراسیس 1.2 کو مزید تقسیم کیا جائے تو اس کے ذیلی پراسیسز کے نمبر 1.2.1، 1.2.2 اور 1.2.3 ہوں گے۔'
      );

      // 4 Short Questions
      insC6S.run(
        cl6Id,
        'What is a Detailed Data Flow Diagram (Detailed DFD)? Mention its key characteristics.',
        `Detailed Data Flow Diagram (Detailed DFD):
A Detailed DFD is an optional, lower-level diagram developed to elaborate the internal functional mechanics of complex processes summarized at Level 0.

Key Characteristics:
1. Selective Decomposition: Only complex processes with intricate algorithmic logic are expanded into detailed DFDs.
2. Hierarchical Numbering: Uses a decimal numbering scheme (e.g., Process 1.0 decomposes into 1.1, 1.2; Process 1.2 decomposes into 1.2.1, 1.2.2).
3. Coincidence / Balancing Rule: All net data inputs and outputs entering or leaving the detailed DFD must exactly balance with the inputs and outputs of the parent process in the Level 0 DFD.`,
        'Detailed DFDs expand complex Level-0 bubbles into numbered sub-processes while adhering to strict input/output balancing rules.',
        'تفصیلی DFD پیچیدہ پراسیسز کی اندرونی تفصیلات بتاتی ہے۔ اس کی خصوصیات: 1. صرف پیچیدہ پراسیسز کو تقسیم کیا جاتا ہے، 2. اشاریہ والی نمبرنگ (1.1، 1.2)، 3. بیرونی ان پٹ اور آؤٹ پٹ پیرنٹ پراسیس کے برابر رہتے ہیں۔'
      );

      insC6S.run(
        cl6Id,
        'What is a Data Dictionary? Differentiate between Integrated and Free-standing Data Dictionaries.',
        `Data Dictionary:
A Data Dictionary is a centralized metadata repository that stores definitions of database schemas, table structures, column domains, integrity constraints, and user authorizations.

Types of Data Dictionaries:
1. Integrated Data Dictionary:
• Embedded directly into the DBMS engine and maintained automatically by the DBMS under DBA commands.
• Tightly synchronized with live database operations: any DDL schema changes update the catalog instantaneously.

2. Free-Standing Data Dictionary:
• Created independently of the DBMS using third-party CASE tools or standalone modeling software.
• Requires manual or periodic external synchronization to remain aligned with production database schemas.`,
        'Integrated dictionaries are built into and automatically synchronized by the DBMS; free-standing dictionaries reside in external CASE tools.',
        'ڈیٹا ڈکشنری میٹا ڈیٹا کا ذخیرہ ہے۔ انٹیگریٹڈ ڈکشنری ڈی بی ایم ایس کے اندر خودکار طریقے سے کام کرتی ہے، جبکہ فری اسٹینڈنگ ڈکشنری الگ سافٹ ویئر (CASE tools) کے ذریعے آزادانہ بنائی جاتی ہے۔'
      );

      insC6S.run(
        cl6Id,
        'What is a Cross Reference Matrix and what is its purpose during the Analysis Phase?',
        `Cross Reference Matrix:
A Cross Reference Matrix is a structured two-dimensional grid utilized in the data dictionary during the Requirement Analysis phase.

Structure and Layout:
• Data items / attributes are plotted across the horizontal columns (X-axis).
• Output reports, screens, transactions, and business processes are arranged down the vertical rows (Y-axis).
• Checkmarks indicate which processes or reports require which attributes.

Purpose in Analysis Phase:
1. Identifies natural data clusters, helping discover database entities and their associations.
2. Guarantees requirement completeness by ensuring that every required report attribute is present in the conceptual data model.`,
        'The matrix plots attributes on the X-axis against reports/transactions on the Y-axis to ensure no required data fields are omitted.',
        'کراس ریفرنس میٹرکس میں X-axis پر ایٹری بیوٹس اور Y-axis پر رپورٹس لکھی جاتی ہیں۔ اس کا مقصد یہ دیکھنا ہے کہ رپورٹس کے لیے درکار تمام ڈیٹا فیلڈز ڈیٹا بیس میں موجود ہیں یا نہیں۔'
      );

      insC6S.run(
        cl6Id,
        'Explain the process numbering convention used in Detailed DFDs with an example.',
        `Process Numbering Convention in Detailed DFDs:

DFDs utilize hierarchical decimal numbering to maintain clear traceability between parent systems and decomposed sub-processes:
1. Context Diagram: Depicts the entire system as a single process (labeled with the system name, typically numbered 0).
2. Level 0 DFD: Major functional subsystems are numbered using single whole numbers or decimals: 1.0, 2.0, 3.0, etc.
3. Level 1 Detailed DFD: When Process 1.0 is decomposed, its child processes are designated as 1.1, 1.2, 1.3, etc.
4. Level 2 Detailed DFD: If child process 1.2 is further decomposed, its children become 1.2.1, 1.2.2, 1.2.3, etc.

This decimal hierarchical structure allows analysts and developers to immediately recognize the lineage and parent module of any sub-process.`,
        'Decimal hierarchy: Level 0 (1.0) -> Level 1 (1.1, 1.2) -> Level 2 (1.2.1, 1.2.2) enables seamless parent-child process tracking.',
        'تفصیلی DFD میں درجہ وار نمبرنگ ہوتی ہے: لیول 0 پر 1.0، لیول 1 پر 1.1 اور 1.2، اور مزید تقسیم پر 1.2.1 اور 1.2.2۔ اس سے پراسیسز کی ترتیب اور والدین کا پتہ چلتا ہے۔'
      );

      // 2 Long Questions
      insC6L.run(
        cl6Id,
        'Explain the Database Design Phase (Conceptual, Logical, and Physical Design) in detail.',
        `The Database Design Phase:

The database design phase translates user requirements identified during requirement analysis into a robust, high-performance database. It is conducted across three sequential stages:

1. Conceptual Database Design:
• Purpose: Constructs an enterprise-wide conceptual data schema representing all organizational entities, relationships, and business rules.
• Characteristics: Completely independent of target DBMS software, programming languages, operating systems, and physical storage hardware.
• Primary Technique: Entity-Relationship (ER) modeling, which models entities, attributes (primary keys, composite, multivalued), and relationships with cardinality constraints (1:1, 1:N, M:N).

2. Logical Database Design:
• Purpose: Maps the abstract conceptual schema into an implementation data model supported by commercial DBMS products.
• Model Selection: The Relational Data Model is standard, converting entity sets into tables (relations), attributes into columns, and relationships into foreign keys.
• Normalization: Systematically applies normalization rules (1NF, 2NF, 3NF, BCNF) to eliminate data redundancy, prevent update/insert/delete anomalies, and guarantee structural integrity.

3. Physical Database Design:
• Purpose: Tailors the logical schema to a specific target DBMS (such as Oracle, Microsoft SQL Server, or PostgreSQL) and physical storage hardware.
• Decisions: Specifies physical file organizations (heap, sequential, clustered), secondary access paths (B-Tree indexes, hash indexes), data partitioning across disk volumes, buffer pool allocation, and database security views to minimize query latency and maximize transaction throughput.`,
        'Database design progresses from DBMS-independent ER models (Conceptual), to normalized relational tables (Logical), to disk layouts and index structures (Physical).',
        'ڈیٹا بیس ڈیزائن کے 3 بنیادی مراحل: 1. کونسیپچول ڈیزائن (سافٹ ویئر سے آزاد ER ماڈل)، 2. لاجیکل ڈیزائن (ریلیشنل ماڈل اور نارملائزیشن کی مدد سے ٹیبلز اور کیز بنانا)، 3. فزیکل ڈیزائن (مخصوص DBMS پر فائل آرگنائزیشن، انڈیکسنگ اور ڈسک اسٹوریج کی سیٹنگ)۔'
      );

      insC6L.run(
        cl6Id,
        'Write a detailed note on Data Dictionary, its types, and its role in Database Architecture.',
        `Data Dictionary in Database Architecture:

1. Definition and Purpose:
A Data Dictionary is a centralized database repository that stores metadata—comprehensive definitions and descriptions of all data structures, relationships, constraints, mappings, and authorizations within a database system.

2. Essential Contents of a Data Dictionary:
• Structural Definitions: Record formats, table schemas, column names, data types, domains, and primary/foreign key constraints.
• Three-Level Schema Mappings: External-to-Conceptual and Conceptual-to-Internal mapping definitions according to the ANSI/SPARC 3-level architecture.
• Security & Privileges: User credentials, access control lists, role assignments, and column/table permissions.
• Physical Parameters: File organizations, indexing schemes, storage block sizes, and access performance metrics.

3. Types of Data Dictionaries:
• Integrated Data Dictionary:
  - Embedded directly within the DBMS engine and maintained automatically by the DBMS software under DBA instructions.
  - Active and synchronized: any DDL statement (e.g., CREATE TABLE, ALTER TABLE) immediately updates the dictionary.
• Free-Standing Data Dictionary:
  - Maintained independently using third-party CASE tools or data modeling utilities.
  - Useful during preliminary study and conceptual design, but requires manual or batch synchronization with production database schemas.

4. Role in Database Architecture:
• Guarantees Data Independence: Maintains schema mapping specifications that isolate application programs from physical database restructuring.
• Drives Analytical Tools: Powers tools like the Cross-Reference Matrix during the analysis phase to ensure all required reporting attributes are captured.
• Optimizes Query Execution and Security: The DBMS query processor accesses the data dictionary to validate query syntax, confirm table and column existence, enforce security permissions, and generate cost-optimized execution paths.`,
        'The Data Dictionary stores enterprise metadata, enables ANSI/SPARC schema mappings, powers the Cross-Reference Matrix, and ensures authorization enforcement.',
        'ڈیٹا ڈکشنری ڈیٹا بیس کی ساخت، انڈیکسز اور یوزر پرمیشنز کا میٹا ڈیٹا رکھتی ہے۔ اس کی دو اقسام ہیں: انٹیگریٹڈ (DBMS کے اندر خودکار) اور فری اسٹینڈنگ (بیرونی CASE ٹولز)۔ یہ ڈیٹا انڈیپنڈنس، کیوری پراسیسنگ اور سیکیورٹی چیک کرنے کے لیے ریڑھ کی ہڈی کی حیثیت رکھتی ہے۔'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CS403 — Lecture 7: The Entity-Relationship (E-R) Model: Entities, Instances & Attributes
    // ─────────────────────────────────────────────────────────────────────────
    const cs403L7 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 7`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L7) {
      const cs403L7Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 7, ?)`).run(
        cs403L2Subj.id,
        'The Entity-Relationship (E-R) Model: Entities, Instances & Attributes'
      );
      const cl7Id = cs403L7Res.lastInsertRowid;

      const insCl7 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 13 MCQs
      const mcqsCl7 = [
        {
          stem: 'An instance is ______.',
          options: JSON.stringify({
            a: 'A particular occurrence of an entity',
            b: 'A special type of relation',
            c: 'An attribute of an entity',
            d: 'Any particular entity'
          }),
          correct: 'a',
          explanation: 'An entity instance is a specific, concrete occurrence or individual object belonging to an entity type (e.g., student with ID BC123456789).',
          urdu_answer: 'کسی اینٹیٹی کی مخصوص انفرادی مثال (occurrence) کو Instance کہا جاتا ہے۔'
        },
        {
          stem: 'An entity type is ______.',
          options: JSON.stringify({
            a: 'Defined when the database is actually constructed',
            b: 'A specific type such as an integer, text, date, logical etc.',
            c: 'A coherent set of similar objects that we want to store data on (e.g. STUDENTS, COURSE, CAR)',
            d: 'Defined by the database designer'
          }),
          correct: 'c',
          explanation: 'An entity type represents a category or blueprint of similar objects sharing identical attributes (e.g., STUDENTS, COURSE, CAR).',
          urdu_answer: 'ایک جیسے مشابہ اشیاء کا مجموعہ جن کے بارے میں ہم ڈیٹا اسٹور کرنا چاہتے ہیں Entity Type کہلاتا ہے۔'
        },
        {
          stem: 'Identify the INCORRECT statement among the given:',
          options: JSON.stringify({
            a: 'An entity may be an object with a physical existence like a car, a house or an Employee.',
            b: 'One cannot consider something which has conceptual existence like a course in a degree program as an entity.',
            c: 'Age can be considered as a single value attribute of a person.',
            d: 'An entity type describes the schema or intension for a set of entities which share the same structure.'
          }),
          correct: 'b',
          explanation: 'Objects with conceptual existence (e.g., Course, Job, Account, Project) CAN be valid entities in an E-R model.',
          urdu_answer: 'تصوراتی وجود (Conceptual existence) والی اشیاء جیسے کہ Course یا Account بھی Entity ہو سکتی ہیں، لہٰذا بیان B غلط ہے۔'
        },
        {
          stem: 'Which of the following is INCORRECT about naming entities?',
          options: JSON.stringify({
            a: 'Singular nouns are used',
            b: 'Write in capitals',
            c: 'Organization specific names can be used',
            d: 'Always use abbreviations as they are convenient'
          }),
          correct: 'd',
          explanation: 'Entity naming standards require singular nouns written in uppercase. Abbreviations should NOT be routinely used as they create ambiguity.',
          urdu_answer: 'اینٹیٹی کے ناموں میں مخففات (Abbreviations) کے بے جا استعمال سے گریز کیا جاتا ہے تاکہ ابہام پیدا نہ ہو۔'
        },
        {
          stem: 'A _____ entity has a primary key that is partially or totally derived from the parent entity in the relationship.',
          options: JSON.stringify({
            a: 'Strong',
            b: 'Weak',
            c: 'Business',
            d: 'Relationship'
          }),
          correct: 'b',
          explanation: 'A weak entity does not possess sufficient attributes to form a primary key on its own, so its key is partially or wholly derived from its parent entity.',
          urdu_answer: 'ویک اینٹیٹی (Weak entity) کی پرائمری کی بنیادی طور پر پیرنٹ اینٹیٹی سے مستعار لی جاتی ہے۔'
        },
        {
          stem: 'The entity that is NOT dependent on any other entity for its existence is known as _______ entity.',
          options: JSON.stringify({
            a: 'Weak',
            b: 'Strong',
            c: 'Derived',
            d: 'Dependent'
          }),
          correct: 'b',
          explanation: 'A strong (regular) entity has independent existence in the database and possesses an autonomous primary key.',
          urdu_answer: 'جو اینٹیٹی اپنے وجود کے لیے کسی دوسری اینٹیٹی پر منحصر نہ ہو وہ Strong Entity کہلاتی ہے۔'
        },
        {
          stem: 'The attribute that is calculated from other attribute is called _______.',
          options: JSON.stringify({
            a: 'Derived attribute',
            b: 'Multi-valued attribute',
            c: 'Composite attribute',
            d: 'Simple attribute'
          }),
          correct: 'a',
          explanation: 'A derived attribute is dynamically computed from another attribute (e.g., Age derived from Date_of_Birth).',
          urdu_answer: 'وہ ایٹریبیوٹ جو کسی دوسرے ایٹریبیوٹ سے کیلکولیٹ کیا جائے Derived Attribute کہلاتا ہے۔'
        },
        {
          stem: 'The attributes whose value is not stored in a database is known as ________ attribute.',
          options: JSON.stringify({
            a: 'Stored',
            b: 'Single value',
            c: 'Multi value',
            d: 'Derived'
          }),
          correct: 'd',
          explanation: 'Derived attributes are computed at runtime and not physically stored in the database files.',
          urdu_answer: 'وہ ایٹریبیوٹ جس کی ویلیو ڈیٹا بیس میں مستقل محفوظ نہیں کی جاتی بلکہ بوقت ضرورت نکالی جاتی ہے، Derived Attribute کہلاتی ہے۔'
        },
        {
          stem: 'An attribute that is the collection of some other attribute(s) is known as _______ attributes.',
          options: JSON.stringify({
            a: 'Multi-valued',
            b: 'Single-valued',
            c: 'No-valued',
            d: 'Composite'
          }),
          correct: 'd',
          explanation: 'A composite attribute is formed by grouping several sub-attributes together (e.g., Address composed of Street, City, State, and Zip).',
          urdu_answer: 'وہ ایٹریبیوٹ جو دوسرے ذیلی ایٹریبیوٹس کا مجموعہ ہو، Composite Attribute کہلاتا ہے۔'
        },
        {
          stem: 'Attributes that are a combination of two or more than two attributes are called _______.',
          options: JSON.stringify({
            a: 'Default value',
            b: 'Null value',
            c: 'Composite attributes',
            d: 'Primary key'
          }),
          correct: 'c',
          explanation: 'Composite attributes represent combinations of two or more atomic attributes.',
          urdu_answer: 'دو یا دو سے زیادہ ایٹریبیوٹس کے مرکب کو Composite Attributes کہتے ہیں۔'
        },
        {
          stem: 'Skill or Hobby is an example of a ______ attribute.',
          options: JSON.stringify({
            a: 'Single-valued',
            b: 'Multi-valued',
            c: 'Composite',
            d: 'Derived'
          }),
          correct: 'b',
          explanation: 'An employee can possess multiple skills or hobbies simultaneously, making it a multi-valued attribute.',
          urdu_answer: 'ایک شخص کی ایک سے زیادہ مہارتیں (Skills) یا مشاغل (Hobbies) ہو سکتے ہیں، اس لیے یہ Multi-valued ایٹریبیوٹ ہے۔'
        },
        {
          stem: 'The Entity Relation Model models ______.',
          options: JSON.stringify({
            a: 'Entities, Relationships and Processes',
            b: 'Entities and Relationships',
            c: 'Relationships',
            d: 'Entities'
          }),
          correct: 'b',
          explanation: 'The E-R Model conceptually captures entities and the relationships between them (functional processes are represented in DFDs).',
          urdu_answer: 'ای آر ماڈل بنیادی طور پر اینٹیٹیز (Entities) اور ان کے باہمی تعلقات (Relationships) کو ماڈل کرتا ہے۔'
        },
        {
          stem: 'Attributes that jointly make a composite attribute are called ______ of that attribute.',
          options: JSON.stringify({
            a: 'Entity',
            b: 'Instance',
            c: 'Domain',
            d: 'Components'
          }),
          correct: 'd',
          explanation: 'The individual constituent elements that comprise a composite attribute are called its components.',
          urdu_answer: 'کمپوزٹ ایٹریبیوٹ بنانے والے ذیلی اجزاء کو Components کہا جاتا ہے۔'
        }
      ];

      for (const m of mcqsCl7) {
        insCl7.run(cl7Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 4 Short Questions (3 marks each)
      const shortsCl7 = [
        {
          stem: 'Define Entity and differentiate between Entity Type, Entity Instance, and Entity Set.',
          correct: `1. Entity:
An object or concept of significance to the enterprise about which data needs to be captured and stored. It can have physical existence (e.g., Student, Car) or conceptual existence (e.g., Course, Account).

2. Entity Type:
A blueprint or category defining a collection of entities that share identical properties and attributes (e.g., STUDENT, EMPLOYEE). Represented by a rectangle in E-R diagrams.

3. Entity Instance:
A specific individual occurrence or row within an entity type (e.g., Student with ID 'BC123456789' named 'Ali').

4. Entity Set:
The set of all entity instances belonging to a particular entity type stored in the database at a specific point in time.`,
          explanation: 'Entity = real-world object. Entity Type = category blueprint. Entity Instance = single record. Entity Set = all current instances.',
          urdu_answer: 'اینٹیٹی: ایک حقیقی یا تصوراتی چیز جس کا ڈیٹا رکھنا مقصود ہو۔ اینٹیٹی ٹائپ: ایک جیسی صفات رکھنے والی اشیاء کی کلاس (جیسے STUDENT)۔ اینٹیٹی انسٹینس: اس کا ایک انفرادی ریکارڈ (طالبعلم علی)۔ اینٹیٹی سیٹ: ڈیٹا بیس میں موجود تمام موجودہ انسٹینسز کا مجموعہ۔'
        },
        {
          stem: 'Differentiate between Strong Entity Type and Weak Entity Type with an example.',
          correct: `1. Strong Entity Type (Regular Entity):
• Existence: Exists independently in the database without requiring any owner entity.
• Primary Key: Possesses its own unique primary key consisting entirely of its own attributes.
• E-R Notation: Represented by a single-line rectangle.
• Example: EMPLOYEE (with EmpID as primary key).

2. Weak Entity Type:
• Existence: Existence-dependent; cannot exist without its identifying/parent owner entity.
• Primary Key: Does not have a full primary key of its own; its primary key is partially or totally derived from the parent entity, combined with its own partial key (discriminator).
• E-R Notation: Represented by a double-line rectangle, linked via a double-diamond identifying relationship.
• Example: DEPENDENT (an employee's child/spouse data ceases to exist if the employee leaves).`,
          explanation: 'Strong entity exists independently with its own primary key. Weak entity depends on parent and borrows parent key.',
          urdu_answer: 'Strong Entity آزادانہ وجود رکھتی ہے اور اس کی اپنی پرائمری کی ہوتی ہے (جیسے EMPLOYEE)۔ Weak Entity اپنے وجود کے لیے پیرنٹ اینٹیٹی کی محتاج ہوتی ہے اور اس کی پرائمری کی پیرنٹ سے مستعار لی جاتی ہے (جیسے DEPENDENT)۔'
        },
        {
          stem: 'Explain Composite vs. Simple Attributes with examples.',
          correct: `1. Simple (Atomic) Attribute:
• Definition: An attribute that cannot be divided into smaller sub-components. It contains an indivisible, atomic value.
• Examples: CNIC Number, Age, Gender, Salary.

2. Composite Attribute:
• Definition: An attribute that is composed of multiple smaller constituent sub-attributes (components). Each component can be accessed independently or as a unified whole.
• Examples:
  - Address: composed of (House_No, Street, Area, City, Postal_Code).
  - Name: composed of (First_Name, Middle_Name, Last_Name).

• E-R Notation: In an E-R diagram, composite attributes branch into multiple smaller oval nodes representing their components.`,
          explanation: 'Simple attribute is atomic (CNIC, Age). Composite attribute divides into sub-components (Address, Name).',
          urdu_answer: 'سادہ (Simple) ایٹریبیوٹ ناقابل تقسیم ہوتا ہے (جیسے CNIC یا Gender)۔ جبکہ کمپوزٹ (Composite) ایٹریبیوٹ کئی ذیلی اجزاء کا مجموعہ ہوتا ہے (جیسے Address جو کہ Street، City اور Postal Code پر مشتمل ہوتا ہے)۔'
        },
        {
          stem: 'Differentiate between Stored Attributes and Derived Attributes with examples.',
          correct: `1. Stored Attribute:
• Definition: An attribute whose value is physically saved and permanently recorded in the database storage files.
• Update: Explicitly modified whenever data changes.
• Example: Date_of_Birth ($DOB$), Credit_Limit, Hire_Date.

2. Derived Attribute:
• Definition: An attribute whose value is not stored physically on disk, but calculated dynamically on-the-fly when requested, using stored attributes, system clock, or formulas.
• Advantages: Saves disk storage and eliminates inconsistency risks.
• E-R Notation: Represented by a dashed oval in E-R diagrams.
• Examples:
  - Age: dynamically calculated as $\\text{Age} = \\text{Current\\_Date} - DOB$.
  - Total_Price: calculated as $\\text{Quantity} \\times \\text{Unit\\_Price}$.
  - Years_of_Service: calculated from Hire_Date.`,
          explanation: 'Stored attribute is saved physically on disk (DOB). Derived attribute is calculated dynamically on-the-fly (Age = Current_Date - DOB).',
          urdu_answer: 'محفوظ شدہ (Stored) ایٹریبیوٹ ڈسک پر مستقل محفوظ ہوتا ہے (جیسے Date of Birth)۔ اخذ شدہ (Derived) ایٹریبیوٹ ڈسک پر محفوظ نہیں ہوتا بلکہ بوقت ضرورت فارمولے سے حاصل کیا جاتا ہے (جیسے Age = Current Date - DOB)۔ اسے ڈیش والی بیضوی شکل (dashed oval) سے ظاہر کرتے ہیں۔'
        }
      ];

      for (const s of shortsCl7) {
        insCl7.run(cl7Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsCl7 = [
        {
          stem: `Explain the Entity-Relationship (E-R) Data Model and its fundamental components (Entities and Attributes). Discuss naming conventions, physical vs conceptual existence, entity classifications, and standard E-R diagram notations.`,
          correct: `The Entity-Relationship (E-R) Data Model:

1. Overview and Purpose:
Introduced by Dr. Peter Chen in 1976, the E-R Model is a high-level conceptual data modeling approach. It captures the semantic structure of enterprise data independently of any specific DBMS software implementation.

2. Entities in E-R Model:
• Definition: An entity is any object or concept of importance about which data is collected and maintained.
• Existence Classification:
  - Physical Existence: Tangible physical objects (e.g., PERSON, CAR, BUILDING, EMPLOYEE).
  - Conceptual Existence: Intangible concepts, events, or logical abstractions (e.g., COURSE, RESERVATION, JOB, PROJECT).
• Naming Conventions:
  - Always use singular nouns (e.g., STUDENT, not STUDENTS).
  - Write names in uppercase letters.
  - Avoid abbreviations to prevent enterprise-wide ambiguity.

3. Entity Classification:
• Strong (Regular) Entity:
  - Exists independently with an autonomous primary key.
  - Represented by a single rectangle.
• Weak Entity:
  - Existence-dependent on an identifying parent entity.
  - Key is partially or totally derived from parent entity.
  - Represented by a double-line rectangle.

4. Attributes & Classification:
• Simple vs. Composite: Atomic attributes (CNIC) vs. divisible attributes (Address).
• Single-Valued vs. Multi-Valued: Exactly one value per instance (DOB) vs. multiple values (Skills, Phone_Numbers).
• Stored vs. Derived: Persisted on disk (DOB) vs. computed dynamically (Age).
• Key Attribute: Uniquely identifies an entity instance (underlined text).

5. Standard E-R Notations:
• Entity: Rectangle
• Weak Entity: Double Rectangle
• Attribute: Oval connected to entity
• Key Attribute: Oval with underlined text
• Multi-Valued Attribute: Double Oval
• Derived Attribute: Dashed Oval
• Relationship: Diamond`,
          explanation: 'The E-R model uses Peter Chen notation: Rectangles for entities, ovals for attributes, double ovals for multivalued, dashed ovals for derived, and diamonds for relationships.',
          urdu_answer: 'ای آر ماڈل پیٹر چن نے متعارف کرایا۔ یہ ہائی لیول کنسیپچوئل ماڈل ہے جو اینٹیٹیز اور ایٹریبیوٹس کو ظاہر کرتا ہے۔ مستطیل اینٹیٹی، بیضوی شکل ایٹریبیوٹ، ڈبل بیضوی ملٹی ویلیوڈ، ڈیش والا بیضوی ڈیرائیو اور ڈائمنڈ تعلق (Relationship) کے لیے استعمال ہوتا ہے۔'
        },
        {
          stem: `Provide a detailed comparative analysis of Attribute Classifications in E-R Modeling with real-world database examples. Explain how Multi-valued, Composite, and Derived attributes are handled during database design and implementation.`,
          correct: `Detailed Comparative Analysis of Attributes in E-R Modeling:

1. Simple vs. Composite Attributes:
• Simple (Atomic): Cannot be decomposed into meaningful smaller sub-parts (e.g., Employee_ID, Hourly_Rate). During physical database implementation, these map directly to single table columns.
• Composite: Groupings of related atomic attributes (e.g., Full_Name = First_Name + Middle_Name + Last_Name).
• Implementation Rule: Relational databases do not support composite columns natively. During relational schema mapping, composite attributes are flattened into multiple independent atomic columns (e.g., first_name, middle_name, last_name).

2. Single-Valued vs. Multi-Valued Attributes:
• Single-Valued: Holds a single scalar value for a given entity instance (e.g., CNIC, Gender).
• Multi-Valued: Can hold zero, one, or multiple values for a single entity instance (e.g., Phone_Number, Degrees, Hobbies).
• Implementation Rule: To conform to First Normal Form (1NF), relational tables cannot store multiple values in a single cell. Multi-valued attributes must be decomposed into a separate child table with a foreign key referencing the parent table's primary key.

3. Stored vs. Derived Attributes:
• Stored: Persistently recorded in disk storage structures (e.g., Unit_Price, Quantity, Date_of_Birth).
• Derived: Dynamically computed when queried (e.g., Total_Bill = Unit_Price * Quantity; Age = Current_Date - DOB).
• Implementation Rule: Derived attributes are omitted from physical base tables to avoid data redundancy and stale data update anomalies. Instead, they are generated using SQL Views, Computed / Generated Columns, or application logic.

4. Null Values and Domains:
• Domain: The set of allowable, valid values for an attribute (e.g., Grade in {'A','B','C','D','F'}).
• Null: Represents missing, unknown, or not-applicable information. Handled carefully to prevent logical ambiguities in relational joins and aggregations.`,
          explanation: 'Composite attributes are flattened into atomic columns. Multi-valued attributes are separated into child tables to satisfy 1NF. Derived attributes are computed dynamically via SQL views or generated columns.',
          urdu_answer: 'کمپوزٹ ایٹریبیوٹس کو ریشنل ٹیبل میں الگ الگ کالمز میں تقسیم کیا جاتا ہے۔ ملٹی ویلیوڈ ایٹریبیوٹس کے لیے 1NF کے تحت الگ چائلڈ ٹیبل بنایا جاتا ہے۔ جبکہ ڈیرائیوڈ ایٹریبیوٹس کو ڈسک پر محفوظ کرنے کے بجائے SQL Views یا فارمولوں سے جنریٹ کیا جاتا ہے۔'
        }
      ];

      for (const l of longsCl7) {
        insCl7.run(cl7Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CS403 — Lecture 8: Relationships, Degree, Cardinality & Associative Entities
    // ─────────────────────────────────────────────────────────────────────────
    const cs403L8 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 8`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L8) {
      const cs403L8Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 8, ?)`).run(
        cs403L2Subj.id,
        'Relationships, Degree, Cardinality & Associative Entities'
      );
      const cl8Id = cs403L8Res.lastInsertRowid;

      const insCl8 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 12 MCQs
      const mcqsCl8 = [
        {
          stem: 'Binary relationships are those, which are established between ______.',
          options: JSON.stringify({
            a: 'One entity type',
            b: 'Two entity type',
            c: 'Three entity type',
            d: 'Unlimited entities'
          }),
          correct: 'b',
          explanation: 'A binary relationship associates instances of two distinct entity types (the most prevalent relationship degree in database design).',
          urdu_answer: 'بائنری ریلیشن شپ (Binary relationship) دو مختلف اینٹیٹی اقسام کے درمیان قائم ہوتی ہے۔'
        },
        {
          stem: 'Unary relationship involves a single entity, it is also called ______.',
          options: JSON.stringify({
            a: 'One to one relationship',
            b: 'One to many relationship',
            c: 'Many to many relationship',
            d: 'Recursive relationship'
          }),
          correct: 'd',
          explanation: 'A unary relationship links instances of the same entity type with each other, also known as a recursive relationship.',
          urdu_answer: 'یونری ریلیشن شپ صرف ایک ہی اینٹیٹی کے انسٹینسز کے درمیان ہوتی ہے، اسے ریکرسیو (Recursive) ریلیشن شپ بھی کہا جاتا ہے۔'
        },
        {
          stem: 'If an entity is linked with itself, then it is called ______ relationship.',
          options: JSON.stringify({
            a: 'Binary',
            b: 'Ternary',
            c: 'Nary',
            d: 'Recursive'
          }),
          correct: 'd',
          explanation: 'When an entity type participates in a relationship with itself, it is termed a recursive or unary relationship.',
          urdu_answer: 'جب کوئی اینٹیٹی اپنے ہی ساتھ منسلک ہو تو وہ ریکرسیو (Recursive) ریلیشن شپ کہلاتی ہے۔'
        },
        {
          stem: '______ are called participants, when enrolled in a relationship.',
          options: JSON.stringify({
            a: 'Attributes',
            b: 'Relations',
            c: 'Entities',
            d: 'Keys'
          }),
          correct: 'c',
          explanation: 'The entity types that take part in a relationship are formally referred to as its participants.',
          urdu_answer: 'کسی تعلق (Relationship) میں حصہ لینے والی اینٹیٹیز کو پارٹیسیپنٹس (Participants) کہا جاتا ہے۔'
        },
        {
          stem: 'Maximum Cardinality shows that how many ______ of one entity can be placed in another relation at most.',
          options: JSON.stringify({
            a: 'Keys',
            b: 'Instances',
            c: 'Attributes',
            d: 'Relationships'
          }),
          correct: 'b',
          explanation: 'Maximum cardinality defines the upper limit on the number of entity instances that can participate in a relationship.',
          urdu_answer: 'زیادہ سے زیادہ کارڈینالٹی (Maximum Cardinality) ظاہر کرتی ہے کہ زیادہ سے زیادہ کتنے انسٹینسز کسی تعلق میں حصہ لے سکتے ہیں۔'
        },
        {
          stem: 'The ______ determines whether the link between two entities is optional or mandatory.',
          options: JSON.stringify({
            a: 'Maximum cardinality',
            b: 'Minimum cardinality',
            c: 'Maximum degree',
            d: 'Minimum degree'
          }),
          correct: 'b',
          explanation: 'Minimum cardinality (Modality) specifies whether participation is mandatory (1) or optional (0).',
          urdu_answer: 'کم سے کم کارڈینالٹی (Minimum cardinality یا Modality) یہ طے کرتی ہے کہ تعلق اختیاری (Optional = 0) ہے یا لازمی (Mandatory = 1)۔'
        },
        {
          stem: 'If many instances of the "Book" entity are associated with many instances of the "Student" entity, then the relationship between them is:',
          options: JSON.stringify({
            a: 'One to one',
            b: 'One to many',
            c: 'Many to many',
            d: 'Many to one'
          }),
          correct: 'c',
          explanation: 'Multiple students can borrow multiple books, creating an M:N (many-to-many) relationship.',
          urdu_answer: 'جب بک (Book) کے کئی انسٹینسز اسٹوڈنٹ (Student) کے کئی انسٹینسز کے ساتھ منسلک ہوں تو یہ Many-to-Many تعلق کہلاتا ہے۔'
        },
        {
          stem: 'In "one to many" cardinality, one instance of a relation/entity is mapped with ______.',
          options: JSON.stringify({
            a: 'Many instances of second entity type',
            b: 'One instance of second entity type',
            c: 'Primary key of second relation',
            d: 'Foreign key of second relation'
          }),
          correct: 'a',
          explanation: 'In a 1:M relationship, one instance of the parent entity is associated with zero, one, or many instances of the child entity.',
          urdu_answer: 'One-to-Many کارڈینالٹی میں پہلی اینٹیٹی کا ایک انسٹینس دوسری اینٹیٹی کے متعدد (Many) انسٹینسز کے ساتھ جڑتا ہے۔'
        },
        {
          stem: 'Which of the following most certainly implies the need for an entire table (junction/associative table) to implement?',
          options: JSON.stringify({
            a: 'A binary relationship',
            b: 'A ternary relationship',
            c: 'A recursive relationship',
            d: 'An identifying relationship'
          }),
          correct: 'b',
          explanation: 'Ternary (degree 3) relationships connect three entity types simultaneously and require their own dedicated associative table with foreign keys referencing all three.',
          urdu_answer: 'ٹرنری (Ternary) ریلیشن شپ کو نافذ کرنے کے لیے ہمیشہ ایک الگ ایسوسی ایٹو ٹیبل (Junction Table) کی ضرورت پڑتی ہے۔'
        },
        {
          stem: 'In a conceptual model for a university, what type of relationship exists between Grade and Student entities?',
          options: JSON.stringify({
            a: '1:1',
            b: '1:M',
            c: 'M:M',
            d: 'Ternary'
          }),
          correct: 'b',
          explanation: 'One Student can achieve multiple grades (for various courses/semesters), making it a 1:M relationship.',
          urdu_answer: 'ایک طالبعلم (Student) مختلف مضامین میں متعدد گریڈز (Grades) حاصل کر سکتا ہے، اس لیے یہ 1:M تعلق ہے۔'
        },
        {
          stem: 'A ______ relationship exists when an association is maintained within a single entity.',
          options: JSON.stringify({
            a: 'Unary',
            b: 'Ternary',
            c: 'Binary',
            d: 'Weak'
          }),
          correct: 'a',
          explanation: 'A relationship within a single entity type is a unary (recursive) relationship.',
          urdu_answer: 'ایک ہی اینٹیٹی کے اندر پائے جانے والے تعلق کو Unary (ریکرسیو) تعلق کہتے ہیں۔'
        },
        {
          stem: 'How many types of cardinality are specified about relationship?',
          options: JSON.stringify({
            a: 'Two',
            b: 'One',
            c: 'Three',
            d: 'Four'
          }),
          correct: 'a',
          explanation: 'Two types of cardinality are specified for relationships: Maximum Cardinality and Minimum Cardinality (Modality).',
          urdu_answer: 'تعلق کے بارے میں دو قسم کی کارڈینالٹی بیان کی جاتی ہے: میکسیمم کارڈینالٹی اور منیمم کارڈینالٹی۔'
        }
      ];

      for (const m of mcqsCl8) {
        insCl8.run(cl8Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 4 Short Questions (3 marks each)
      const shortsCl8 = [
        {
          stem: 'What is a Relationship in ER Diagram? What is meant by Degree of a Relationship?',
          correct: `1. Relationship:
A relationship is a meaningful logical association or interaction among two or more entity types within an enterprise (e.g., an EMPLOYEE works in a DEPARTMENT). In an E-R diagram, relationships are depicted as diamond shapes connected to participating entities.

2. Degree of a Relationship:
The degree represents the number of distinct entity types participating in the relationship:
• Unary (Degree 1): Association among instances of a single entity type (e.g., an employee manages other employees).
• Binary (Degree 2): Association between two distinct entity types (e.g., Student enrolls in Course).
• Ternary (Degree 3): Simultaneous association among three distinct entity types (e.g., Student, Course, Instructor).
• N-ary (Degree N): Association involving N distinct entity types.`,
          explanation: 'Relationship = logical link between entities. Degree = number of participating entity types (Unary=1, Binary=2, Ternary=3).',
          urdu_answer: 'ریلیشن شپ دو یا دو سے زیادہ اینٹیٹیز کے درمیان بامقصد تعلق کو ظاہر کرتا ہے۔ ڈگری (Degree) سے مراد اس تعلق میں حصہ لینے والی اینٹیٹی اقسام کی کل تعداد ہے (Unary=1, Binary=2, Ternary=3)۔'
        },
        {
          stem: 'Differentiate between Maximum Cardinality and Minimum Cardinality (Modality).',
          correct: `1. Maximum Cardinality:
• Definition: Specifies the maximum number of entity instances that can be associated with a single instance of the related entity type.
• Categories:
  - One-to-One ($1:1$): One instance maps to at most one instance.
  - One-to-Many ($1:M$): One instance maps to many instances.
  - Many-to-Many ($M:N$): Multiple instances map to multiple instances.

2. Minimum Cardinality (Modality):
• Definition: Specifies the minimum number of entity instances that must participate in a relationship instance.
• Categories:
  - Optional Participation (Modality = 0): An entity instance can exist without participating in the relationship. Depicted by a circle / zero symbol.
  - Mandatory Participation (Modality = 1): An entity instance must participate in at least one relationship instance. Depicted by a vertical hash / line symbol.`,
          explanation: 'Maximum cardinality = upper limit of participating instances (1:1, 1:N, M:N). Minimum cardinality (Modality) = lower limit (Optional 0 vs Mandatory 1).',
          urdu_answer: 'میکسیمم کارڈینالٹی تعلق میں حصہ لینے والے انسٹینسز کی زیادہ سے زیادہ حد (1:1, 1:M, M:N) بتاتی ہے۔ جبکہ منیمم کارڈینالٹی (Modality) یہ بتاتی ہے کہ شرکت لازمی (1) ہے یا اختیاری (0)۔'
        },
        {
          stem: 'What is a Recursive (Unary) Relationship? Give an example.',
          correct: `Recursive (Unary) Relationship:
1. Definition:
A recursive (or unary) relationship occurs when an association exists between different instances of the very same entity type (Degree = 1). The entity plays two different roles in the relationship.

2. Real-World Examples:
• Management Hierarchy in EMPLOYEE:
  - Entity: EMPLOYEE
  - Relationship: 'Manages'
  - Roles: One employee instance acts as a 'Supervisor/Manager', while other employee instances act as 'Subordinates'.
• Prerequisite Courses in COURSE:
  - Entity: COURSE
  - Relationship: 'Requires'
  - Roles: One course is the 'Advanced Course', another course acts as the 'Prerequisite'.`,
          explanation: 'A recursive relationship links an entity type to itself. Example: Employee manages Employee, or Course requires prerequisite Course.',
          urdu_answer: 'جب ایک ہی اینٹیٹی کے مختلف انسٹینسز آپس میں جڑے ہوں تو وہ ریکرسیو (یا یونری) ریلیشن شپ کہلاتی ہے۔ مثال: EMPLOYEE کا دوسرے EMPLOYEE کو مینج کرنا، یا ایک COURSE کا دوسرے COURSE کے لیے پیشگی شرط (Prerequisite) ہونا۔'
        },
        {
          stem: 'What is an Associative Entity (Junction Table) and when is it required?',
          correct: `Associative Entity (Junction Table):
1. Definition:
An associative entity (or intersection/junction table) is an entity type that models a relationship between two or more other entity types while also holding its own specific attributes (relationship attributes).

2. When is it Required?
• Resolving Many-to-Many ($M:N$) Relationships:
  Relational databases cannot directly implement an $M:N$ relationship without violating relational rules. An associative entity is introduced to split the $M:N$ relationship into two separate $1:M$ relationships.
• Ternary Relationships:
  Ternary (3-way) relationships connecting three entities simultaneously must be converted into an associative table containing composite primary keys referencing all three parent tables.
• Relationship with Independent Attributes:
  When a relationship possesses attributes of its own (e.g., 'Grade' or 'Enrollment_Date' in Student-Course relationship), these attributes are placed in the associative entity.`,
          explanation: 'An associative entity resolves Many-to-Many (M:N) and Ternary relationships into 1:M relationships and stores relationship-specific attributes.',
          urdu_answer: 'ایسوسی ایٹو اینٹیٹی (Junction Table) Many-to-Many (M:N) یا Ternary تعلقات کو دو One-to-Many تعلقات میں تبدیل کرنے اور تعلق سے متعلق ایٹریبیوٹس (جیسے Grade یا Date) کو محفوظ کرنے کے لیے استعمال ہوتی ہے۔'
        }
      ];

      for (const s of shortsCl8) {
        insCl8.run(cl8Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsCl8 = [
        {
          stem: `Explain the Degrees of Relationships in E-R Modeling (Unary, Binary, Ternary, and N-ary). Provide concrete real-world enterprise database examples for each degree and explain their implementation implications.`,
          correct: `Degrees of Relationships in E-R Modeling:

1. Concept of Degree:
The degree of a relationship is defined as the count of entity types that simultaneously participate in that relationship.

2. Unary Relationship (Degree 1 / Recursive):
• Explanation: A relationship linking instances belonging to the same entity type.
• Example:
  - EMPLOYEE 'Manages' EMPLOYEE (1:M recursive).
  - PART 'Contains' PART (Bill of Materials, M:N recursive).
• Implementation: Requires a self-referencing foreign key within the same relational table (e.g., 'ManagerID' column in EMPLOYEE table referencing 'EmpID').

3. Binary Relationship (Degree 2):
• Explanation: An association between instances of two distinct entity types. This represents over 90% of relationships encountered in conceptual enterprise modeling.
• Examples:
  - DEPARTMENT 'Houses' EMPLOYEE ($1:M$)
  - CITIZEN 'Possesses' PASSPORT ($1:1$)
  - STUDENT 'Registers' COURSE ($M:N$)
• Implementation: Implemented by placing the primary key of the 'one' side as a foreign key on the 'many' side, or creating a separate junction table for $M:N$.

4. Ternary Relationship (Degree 3):
• Explanation: A simultaneous, composite relationship binding three distinct entity types together in a single association instance.
• Example:
  - VENDOR supplies PART to PROJECT (Entities: VENDOR, PART, PROJECT). A specific vendor supplies a specific part to a specific project.
• Implementation: Cannot be represented using simple foreign keys. Requires a dedicated associative table with foreign keys referencing all three entity tables.

5. N-ary Relationship (Degree N):
• Explanation: A generalized relationship involving $N$ participating entity types. While theoretically valid, in practice relationships of degree $> 3$ are decomposed into multiple binary or ternary associations to maintain design clarity.`,
          explanation: 'Unary = degree 1 (self-referencing FK). Binary = degree 2 (standard 1:M, 1:1, M:N). Ternary = degree 3 (requires junction table). N-ary = degree N.',
          urdu_answer: 'ریلیشن شپ کی ڈگری اینٹیٹیز کی تعداد کو ظاہر کرتی ہے۔ یونری (1 اینٹیٹی، جیسے مینیجر اور ماتحت)، بائنری (2 اینٹیٹیز، جیسے طالبعلم اور کورس)، ٹرنری (3 اینٹیٹیز، جیسے وینڈر، پارٹ اور پروجیکٹ)۔ ٹرنری کے لیے لازمی طور پر الگ ٹیبل بنایا جاتا ہے۔'
        },
        {
          stem: `Discuss Relationship Cardinalities in detail. Differentiate between Maximum Cardinality (1:1, 1:N, M:N) and Minimum Cardinality (Modality / Optional vs. Mandatory). Explain how they are visually represented using Crow's Foot and Chen notations.`,
          correct: `Relationship Cardinalities and Modality in E-R Modeling:

1. Maximum Cardinality:
Maximum cardinality defines the upper numeric threshold of entity instances that can participate in a relationship:
• One-to-One ($1:1$):
  - Rule: An instance in entity $A$ can be related to at most one instance in entity $B$, and vice versa.
  - Example: PRESIDENT 'Heads' COUNTRY.
• One-to-Many ($1:M$):
  - Rule: An instance in entity $A$ can be associated with zero, one, or many instances in entity $B$, but an instance in $B$ is associated with at most one instance in $A$.
  - Example: DEPARTMENT 'Employs' EMPLOYEE.
• Many-to-Many ($M:N$):
  - Rule: Multiple instances in $A$ are associated with multiple instances in $B$.
  - Example: STUDENT 'Registers' COURSE.

2. Minimum Cardinality (Modality):
Minimum cardinality defines the lower numeric threshold—whether participation is required or elective:
• Optional Participation (Modality = 0):
  - An entity instance can exist in the database without being linked to the related entity.
  - Example: An EMPLOYEE may or may not be assigned a COMPANY_CAR (Modality = 0).
• Mandatory Participation (Modality = 1):
  - An entity instance cannot exist without an active link to at least one related entity instance.
  - Example: Every ORDER must belong to a registered CUSTOMER (Modality = 1).

3. Visual Representation and Notations:
• Crow's Foot Notation:
  - Mandatory One ($1,1$): Two parallel hash marks (||).
  - Optional One ($0,1$): A circle and a hash mark (O|).
  - Mandatory Many ($1,M$): A hash mark and a crow's foot (|<-).
  - Optional Many ($0,M$): A circle and a crow's foot (O<-).
• Chen Notation:
  - Uses $(min, max)$ integer pairs placed beside the relationship lines (e.g., $(0, 1)$, $(1, N)$).

4. Relational Database Enforcement:
• Modality is enforced using SQL NOT NULL constraints on foreign keys (Mandatory) vs. NULLABLE foreign keys (Optional).
• Maximum cardinality is enforced through UNIQUE constraints on foreign keys ($1:1$) or associative junction tables ($M:N$).`,
          explanation: 'Maximum cardinality = 1:1, 1:M, M:N. Minimum cardinality = Optional (0) vs Mandatory (1). Crow Foot notation uses pipes, circles, and branching feet.',
          urdu_answer: 'میکسیمم کارڈینالٹی 1:1، 1:M اور M:N پر مشتمل ہوتی ہے۔ منیمم کارڈینالٹی (Modality) لازمی (Mandatory = 1) یا اختیاری (Optional = 0) شرکت کو ظاہر کرتی ہے۔ کرو فٹ نوٹیشن میں سرکل (O) اور پیرلل لائنز (||) سے ان کا اظہار کیا جاتا ہے۔'
        }
      ];

      for (const l of longsCl8) {
        insCl8.run(cl8Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CS403 — Lecture 9: Relationship Constraints, Roles & Participation
    // ─────────────────────────────────────────────────────────────────────────
    const cs403L9 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 9`).get(cs403L2Subj.id) as { id: number } | undefined;
    if (!cs403L9) {
      const cs403L9Res = db.prepare(`INSERT INTO lectures (subject_id, number, title) VALUES (?, 9, ?)`).run(
        cs403L2Subj.id,
        'Relationship Constraints, Roles & Participation'
      );
      const cl9Id = cs403L9Res.lastInsertRowid;

      const insCl9 = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      // 10 MCQs
      const mcqsCl9 = [
        {
          stem: 'Entities enrolled in a relationship are called its ______.',
          options: JSON.stringify({
            a: 'Attributes',
            b: 'Relations',
            c: 'Participants',
            d: 'Keys'
          }),
          correct: 'c',
          explanation: 'The entity types that take part in a relationship are formally referred to as its participants.',
          urdu_answer: 'کسی تعلق (Relationship) میں حصہ لینے والی اینٹیٹیز کو پارٹیسیپنٹس (Participants) کہا جاتا ہے۔'
        },
        {
          stem: 'Which of the following clarify the semantics of a relationship?',
          options: JSON.stringify({
            a: 'Entity',
            b: 'Roles',
            c: 'Relationship set',
            d: 'Participants'
          }),
          correct: 'b',
          explanation: 'Roles clarify the functional semantics and exact purpose that each participating entity plays in a relationship.',
          urdu_answer: 'رولز (Roles) کسی تعلق کے اندر اینٹیٹی کے مخصوص کردار اور معانی (Semantics) کو واضح کرتے ہیں۔'
        },
        {
          stem: 'The function that an entity plays in a relationship is called that entity’s ______.',
          options: JSON.stringify({
            a: 'Attribute',
            b: 'Role',
            c: 'Participation',
            d: 'Cardinality'
          }),
          correct: 'b',
          explanation: 'The specific function or behavior of an entity within a relationship is called its role.',
          urdu_answer: 'تعلق کے اندر اینٹیٹی کا مخصوص فنکشن اس کا کردار یا Role کہلاتا ہے۔'
        },
        {
          stem: 'Structural constraints of a relationship type refer to ______.',
          options: JSON.stringify({
            a: 'identifying the owner entity type relevant to a given entity type',
            b: 'whether the existence of an entity depends on it being related to another entity via the relationship type',
            c: 'the role that a participating entity from the entity type plays in each relationship instance',
            d: 'the constraints applicable in granting access to tables, columns and views'
          }),
          correct: 'b',
          explanation: 'Structural constraints encompass both cardinality ratios and participation constraints (such as existence dependency) governing whether an entity instance can exist without being related to another entity.',
          urdu_answer: 'سٹرکچرل کنسٹرینٹس اس بات کا تعین کرتے ہیں کہ کیا کسی اینٹیٹی کا وجود دوسری اینٹیٹی سے جڑنے پر منحصر ہے یا نہیں (Existence dependency & Cardinality)۔'
        },
        {
          stem: 'When one entity instance depends on another entity for its existence, then it is called ______.',
          options: JSON.stringify({
            a: 'Existence dependency',
            b: 'Identifier dependency',
            c: 'Referential dependency',
            d: 'Acceptance dependency'
          }),
          correct: 'a',
          explanation: 'Existence dependency occurs when an entity instance cannot exist in the database without being linked to an associated parent entity.',
          urdu_answer: 'جب ایک اینٹیٹی کے وجود کا دارومدار دوسری اینٹیٹی پر ہو تو اسے Existence dependency (وجود کا انحصار) کہا جاتا ہے۔'
        },
        {
          stem: 'The total participation of an entity set in a relationship is represented in an E-R diagram as a ______.',
          options: JSON.stringify({
            a: 'Single line',
            b: 'Double line',
            c: 'Dashed line',
            d: 'Dotted line'
          }),
          correct: 'b',
          explanation: 'Total participation (existence dependency) is depicted by a double line connecting the participating entity rectangle to the relationship diamond.',
          urdu_answer: 'E-R ڈایاگرام میں مکمل شرکت (Total participation) کو ڈبل لائن (Double line) کے ذریعے ظاہر کیا جاتا ہے۔'
        },
        {
          stem: 'Role names are technically necessary in relationship types when ______.',
          options: JSON.stringify({
            a: 'All participating entity types are distinct',
            b: 'The same entity type participates more than once in different roles (e.g., recursive relationships)',
            c: 'The cardinality ratio is 1:1',
            d: 'The cardinality ratio is M:N'
          }),
          correct: 'b',
          explanation: 'When the same entity type participates multiple times in different capacities (e.g. Supervisor vs Subordinate in recursive relationships), role names are mandatory to distinguish their functions.',
          urdu_answer: 'رول کے نام اس وقت تکنیکی طور پر ناگزیر ہو جاتے ہیں جب ایک ہی اینٹیٹی ٹائپ مختلف کرداروں میں ایک سے زائد بار حصہ لے رہی ہو (جیسے ریکرسیو ریلیشن شپ میں مینیجر اور ماتحت)۔'
        },
        {
          stem: 'If there is more than one relationship between two entities and we mention roles on the relationship links, then it is called ______.',
          options: JSON.stringify({
            a: 'Unary relationship',
            b: 'Binary relationship',
            c: 'Ternary relationship',
            d: 'Multiple relationships'
          }),
          correct: 'd',
          explanation: 'When two entity types share multiple distinct relationships simultaneously (e.g., Faculty Teaches Student and Faculty Supervises Student), these are termed multiple relationships.',
          urdu_answer: 'اگر دو اینٹیٹیز کے درمیان ایک سے زائد مختلف تعلقات موجود ہوں تو انہیں Multiple Relationships کہا جاتا ہے۔'
        },
        {
          stem: 'Partial participation of an entity in a relationship set is represented in ER Diagrams using a ______.',
          options: JSON.stringify({
            a: 'Single line connecting the entity to the relationship',
            b: 'Double line connecting the entity to the relationship',
            c: 'Dashed line',
            d: 'Dotted diamond'
          }),
          correct: 'a',
          explanation: 'Partial participation (where participation in the relationship is optional for some instances) is represented by a single line.',
          urdu_answer: 'E-R ڈایاگرام میں جزوی یا اختیاری شرکت (Partial participation) کو سنگل لائن (Single line) سے دکھایا جاتا ہے۔'
        },
        {
          stem: 'A relationship type is an abstraction of a relationship, i.e., a set of relationship instances sharing common ______.',
          options: JSON.stringify({
            a: 'Attributes',
            b: 'Keys',
            c: 'Entities',
            d: 'Constraints'
          }),
          correct: 'a',
          explanation: 'A relationship type represents an abstraction over relationship instances that share the same attributes and structural rules.',
          urdu_answer: 'ریلیشن شپ ٹائپ دراصل ایسے ریلیشن شپ انسٹینسز کا مجموعہ ہے جو مشترکہ خصوصیات یا Attributes رکھتے ہوں۔'
        }
      ];

      for (const m of mcqsCl9) {
        insCl9.run(cl9Id, 'mcq', m.stem, m.options, m.correct, m.explanation, m.urdu_answer, 1, 1, 'lecture');
      }

      // 4 Short Questions (3 marks each)
      const shortsCl9 = [
        {
          stem: 'Define Relationship, Relationship Type, and Relationship Instance in ER Modeling.',
          correct: `1. Relationship:
A logical association or interaction among two or more entity types that holds business significance for an enterprise (e.g., a Student enrolling in a Course).

2. Relationship Type:
A structural abstraction defining a category of associations. It represents a set of relationship instances that connect the same entity types and share identical attributes and structural constraints. Represented by a diamond in E-R diagrams.

3. Relationship Instance:
A single, concrete association linking specific individual entity instances at runtime (e.g., Student 'Ali' (ID S101) enrolled in Course 'CS403' for Fall 2026).`,
          explanation: 'Relationship = meaningful connection. Relationship Type = schema/category definition. Relationship Instance = concrete occurrence.',
          urdu_answer: 'ریلیشن شپ اینٹیٹیز کے درمیان بامقصد تعلق ہے۔ ریلیشن شپ ٹائپ اس تعلق کا اسٹرکچر یا کیٹیگری ہے (جیسے ENROLLMENT)۔ جبکہ ریلیشن شپ انسٹینس اس کی ایک مخصوص مثال ہے (طالبعلم علی کا CS403 میں رجسٹر ہونا)۔'
        },
        {
          stem: 'What are Roles in a Relationship? Why are role names important?',
          correct: `1. Definition of Roles:
The role of an entity type in a relationship refers to the specific function, responsibility, or capacity that participating entity instances fulfill within that relationship (e.g., 'Supervisor' vs. 'Subordinate' in a MANAGES relationship).

2. Why Role Names are Important:
• Essential for Recursive (Unary) Relationships:
  When an entity participates in a relationship with itself, role names (e.g., 'Manager' and 'Worker') are technically necessary to distinguish the two interacting sides.
• Disambiguating Multiple Relationships:
  When two entity types share multiple distinct associations (e.g., FACULTY and STUDENT sharing 'Teaches' and 'Advises' relationships), role labels clarify the distinct semantic meaning of each connection line.
• Generates Clear Foreign Key Column Names:
  During logical database design, role names directly inspire intuitive foreign key column names (e.g., 'manager_id' in EMPLOYEE table).`,
          explanation: 'Roles specify the function of an entity in a relationship. They are crucial for recursive relationships and multiple relationships between identical entities.',
          urdu_answer: 'رول سے مراد کسی تعلق میں اینٹیٹی کا مخصوص کردار ہے۔ یہ ریکرسیو ریلیشن شپ میں (جہاں ایک ہی اینٹیٹی مینیجر اور ورکر دونوں ہوتی ہے) اور دو اینٹیٹیز کے درمیان ایک سے زیادہ تعلقات کو واضح کرنے کے لیے لازمی ہے۔'
        },
        {
          stem: 'Explain Existence Dependency (Total Participation) vs Partial Participation with examples.',
          correct: `1. Existence Dependency (Total Participation):
• Definition: An entity instance cannot exist in the database without participating in at least one instance of the relationship. Every member of the entity set MUST be associated with a related entity.
• E-R Notation: Rendered as a double line connecting the entity rectangle to the relationship diamond.
• Example: A LOAN_RECORD cannot exist without a corresponding CUSTOMER. Every LOAN must belong to a customer.

2. Partial Participation (Optional Participation):
• Definition: An entity instance can exist independently in the database without being linked to the related entity. Some instances participate while others do not.
• E-R Notation: Rendered as a standard single line.
• Example: In a COMPANY database, every EMPLOYEE does NOT manage a department. The participation of EMPLOYEE in the 'MANAGES' relationship is partial.`,
          explanation: 'Total participation = every instance must participate (double line). Partial participation = participation is optional (single line).',
          urdu_answer: 'Total Participation (مکمل شرکت): اینٹیٹی کا ہر ریکارڈ لازمی طور پر تعلق میں شامل ہونا چاہیے، اسے ڈبل لائن سے دکھایا جاتا ہے۔ Partial Participation (جزوی شرکت): اینٹیٹی کا تعلق میں شامل ہونا اختیاری ہوتا ہے، اسے سنگل لائن سے دکھایا جاتا ہے۔'
        },
        {
          stem: 'Differentiate between Single Relationship and Multiple Relationships between the same entity types.',
          correct: `Comparison of Single vs. Multiple Relationships:

1. Single Relationship:
• Definition: Exactly one association type exists between two participating entity types.
• Example:
  - STUDENT 'Registers' COURSE
  - CUSTOMER 'Places' ORDER
• Implementation: Requires a single foreign key or junction table.

2. Multiple Relationships:
• Definition: Two or more distinct, independent relationship types exist simultaneously between the identical pair of entity types, each representing a different business semantic.
• Example between FACULTY and STUDENT:
  - Relationship 1: FACULTY 'Teaches' STUDENT (course instruction role).
  - Relationship 2: FACULTY 'Supervises' STUDENT (thesis/research advising role).
• Implementation: Requires separate relationship diamonds in E-R modeling, distinct role annotations, and separate foreign keys or associative tables in relational database design.`,
          explanation: 'Single relationship = one association between two entities. Multiple relationships = two or more separate semantic associations between the same two entities.',
          urdu_answer: 'سنگل ریلیشن شپ میں دو اینٹیٹیز کے درمیان صرف ایک تعلق ہوتا ہے۔ جبکہ ملٹیپل ریلیشن شپس میں انہی دو اینٹیٹیز کے درمیان ایک سے زائد مختلف تعلقات پائے جاتے ہیں (جیسے استاد طالبعلم کو پڑھاتا بھی ہے اور تھیسز سپروائز بھی کرتا ہے)۔'
        }
      ];

      for (const s of shortsCl9) {
        insCl9.run(cl9Id, 'short', s.stem, null, s.correct, s.explanation, s.urdu_answer, 3, 3, 'lecture');
      }

      // 2 Long Questions (5 marks each)
      const longsCl9 = [
        {
          stem: `Explain Structural Constraints of Relationships in ER Modeling. Provide a comprehensive discussion of Cardinality Ratios (1:1, 1:N, M:N) and Participation Constraints (Total vs. Partial Participation / Existence Dependency) with real-world enterprise examples and graphical notations.`,
          correct: `Structural Constraints of Relationships in E-R Modeling:

1. Overview of Structural Constraints:
Structural constraints dictate the legal configuration of relationship instances in a database. They restrict the possible combinations of entity instances that can participate in relationship sets. They consist of two fundamental components:
• Cardinality Ratio (Maximum Cardinality)
• Participation Constraint (Minimum Cardinality / Modality)

2. Cardinality Ratios (Maximum Cardinality):
Specifies the maximum number of relationship instances an entity instance can participate in:
• One-to-One ($1:1$):
  - Example: CITIZEN 'Possesses' PASSPORT. One citizen has at most one passport, and one passport belongs to at most one citizen.
• One-to-Many ($1:M$):
  - Example: DEPARTMENT 'Employs' EMPLOYEE. One department employs many employees, but each employee works for only one department.
• Many-to-Many ($M:N$):
  - Example: STUDENT 'Registers' COURSE. A student registers for multiple courses, and a course has multiple students enrolled.

3. Participation Constraints (Minimum Cardinality & Existence Dependency):
Specifies whether the existence of an entity depends on its association with another entity via the relationship:
• Total Participation (Existence Dependency / Mandatory):
  - Rule: Minimum cardinality $= 1$. Every entity instance must be linked to at least one related entity instance.
  - Graphical Notation: Double line connecting entity to relationship diamond.
  - Example: Every EMPLOYEE must work for a DEPARTMENT (total participation of EMPLOYEE in WORKS_FOR).
• Partial Participation (Optional):
  - Rule: Minimum cardinality $= 0$. Some entity instances may not participate in the relationship.
  - Graphical Notation: Single line connecting entity to relationship diamond.
  - Example: Only a subset of EMPLOYEE instances manage a department (partial participation of EMPLOYEE in MANAGES).

4. Combining Cardinality and Participation:
In modern ER modeling (e.g., $(min, max)$ notation), both constraints are written together:
• An Employee in WORKS_FOR: $(1, 1)$ -> Exactly one department (Mandatory One).
• A Department in WORKS_FOR: $(1, N)$ -> At least one employee, up to many (Mandatory Many).`,
          explanation: 'Structural constraints consist of Cardinality Ratios (1:1, 1:N, M:N) and Participation Constraints (Total with double line, Partial with single line).',
          urdu_answer: 'سٹرکچرل کنسٹرینٹس دو چیزوں پر مشتمل ہوتے ہیں: کارڈینالٹی ریشو (زیادہ سے زیادہ حد: 1:1، 1:N، M:N) اور پارٹیسیپیشن کنسٹرینٹ (کم سے کم حد: ٹوٹل پارٹیسیپیشن = ڈبل لائن اور پارشل = سنگل لائن)۔'
        },
        {
          stem: `Provide a detailed note on Roles and Multiple Relationships between Entities in Database Design. Explain when role names are mandatory versus optional, analyze recursive relationships, and discuss how multiple relationships are mapped into relational schemas.`,
          correct: `Roles and Multiple Relationships in Database Design:

1. The Concept of Roles:
In an E-R model, each participating entity type fulfills a specific function in a relationship type, known as its Role. Usually, role names are implicit when participating entity types are distinct (e.g., in 'Customer Places Order', the roles 'Customer' and 'Order' are obvious).

2. When Role Names are Technically Mandatory:
• Recursive (Unary) Relationships:
  When a single entity type participates multiple times in the same relationship, role names are mandatory to clarify semantics:
  - Example: In the relationship 'MANAGES' on EMPLOYEE:
    * Role 1: 'Manager' (the supervisor directing work).
    * Role 2: 'Subordinate' (the employee reporting to the supervisor).
  - Without role names, it is ambiguous which entity instance acts as manager and which as worker.
• Same Entity with Multiple Links:
  When an entity associates with another entity across multiple roles simultaneously.

3. Multiple Relationships Between the Same Entity Types:
• Definition: When two entity types share two or more distinct semantic associations simultaneously.
• Real-World Enterprise Example:
  - Entities: 'DOCTOR' and 'PATIENT'
  - Relationship 1: 'Treats' ($M:N$) -> A doctor treats multiple patients; a patient is treated by multiple doctors during an illness.
  - Relationship 2: 'Primary_Physician' ($1:M$) -> A doctor serves as the dedicated primary care physician for a roster of patients; each patient has exactly one primary physician.

4. Relational Schema Mapping of Roles and Multiple Relationships:
• Mapping Multiple Relationships:
  Each relationship type maps to its own separate foreign key or junction table. Combining them into a single column leads to severe data anomalies.
  - For DOCTOR and PATIENT:
    * 'Treats' ($M:N$) maps to an associative table 'Patient_Treatment(doctor_id, patient_id, date, diagnosis)'.
    * 'Primary_Physician' ($1:M$) maps to a foreign key 'primary_physician_id' added directly to the PATIENT table.
• Mapping Roles:
  In recursive relationships, role names determine clear, readable foreign key column names (e.g., adding 'manager_emp_id' to the EMPLOYEE table, referencing 'emp_id' of the same table).`,
          explanation: 'Role names are mandatory in recursive relationships. Multiple relationships represent distinct semantic connections between the same entities and require separate foreign keys or tables in relational mapping.',
          urdu_answer: 'رولز اینٹیٹی کے فنکشن کو ظاہر کرتے ہیں اور ریکرسیو ریلیشن شپس میں لازمی ہوتے ہیں۔ دو اینٹیٹیز کے درمیان ایک سے زائد تعلقات (Multiple Relationships) ہونے پر ریشنل اسکیما میں ہر تعلق کے لیے الگ فارن کی یا ایسوسی ایٹو ٹیبل بنایا جاتا ہے۔'
        }
      ];

      for (const l of longsCl9) {
        insCl9.run(cl9Id, 'long', l.stem, null, l.correct, l.explanation, l.urdu_answer, 5, 5, 'midterm');
      }
    }
  }

  // ── MTH202: Discrete Mathematics ──
  let mth202 = db.prepare(`SELECT id FROM subjects WHERE slug = 'mth202'`).get() as { id: number } | undefined;
  if (!mth202) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `).run(
      'Discrete Mathematics',
      'mth202',
      'MTH202',
      'Foundations of mathematical logic, propositions, truth tables, combinatorics, relations, and proof methods — Virtual University'
    );
    mth202 = { id: Number(res.lastInsertRowid) };
  }

  const mth202L1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(mth202.id) as { id: number } | undefined;
  if (!mth202L1) {
    const l1res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 1, ?)
    `).run(mth202.id, 'Logic: Propositions, Connectives, and Truth Tables');
    const l1Id = l1res.lastInsertRowid;

    const insM1 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insM1S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insM1L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 12 MCQs
    insM1.run(
      l1Id,
      'A statement is also referred to as a ______.',
      JSON.stringify({
        a: 'Proposition',
        b: 'Conclusion',
        c: 'Order',
        d: 'None of these'
      }),
      'a',
      'In mathematical logic, a statement is a declarative sentence that is either true or false (but not both), which is also known as a proposition.',
      'ریاضیاتی منطق میں وہ جملہ جو یا تو سچ ہو یا جھوٹ، اسے سٹیٹمنٹ یا پروپوزیشن (Proposition) کہا جاتا ہے۔'
    );

    insM1.run(
      l1Id,
      'The negation of "Today is Friday" is ______.',
      JSON.stringify({
        a: 'Today is Saturday',
        b: 'Today is not Friday',
        c: 'Today is Thursday',
        d: 'None of given'
      }),
      'b',
      'The negation (~p) of a proposition p asserts that p is false. The negation of "Today is Friday" is "Today is not Friday" (or "It is not the case that today is Friday").',
      'کسی بیان کی نفی (Negation) اس کے جھٹلانے کا نام ہے۔ "Today is Friday" کی نفی "Today is not Friday" ہوگی۔'
    );

    insM1.run(
      l1Id,
      'An arrangement of rows and columns that specifies the truth value of a compound proposition for all possible truth values of its constituent propositions is called ______.',
      JSON.stringify({
        a: 'Truth Table',
        b: 'Venn diagram',
        c: 'False Table',
        d: 'None of these'
      }),
      'a',
      'A Truth Table is a tabular display showing the truth value of a compound proposition for every combination of truth values of its individual constituent statement variables.',
      'وہ جدول (Table) جو کسی کمپاؤنڈ پروپوزیشن کی تمام ممکنہ سچائی کی اقدار کو ظاہر کرتا ہے اسے ٹروتھ ٹیبل (Truth Table) کہتے ہیں۔'
    );

    insM1.run(
      l1Id,
      'If p = "It is raining" and q = "She will go to college", then "It is raining and she will not go to college" will be denoted by ______.',
      JSON.stringify({
        a: 'p ∧ ~q',
        b: 'p ∧ q',
        c: '~(p ∧ q)',
        d: '~p ∧ q'
      }),
      'a',
      '"It is raining" is p, "and" is conjunction (∧), and "she will not go to college" is negation of q (~q). Thus, the compound statement is represented as p ∧ ~q.',
      'یہاں p بارش ہونے کو اور ~q کالج نہ جانے کو ظاہر کرتا ہے، اور لفظ "and" کے لیے کنجنکشن (∧) استعمال ہوتا ہے، لہٰذا درست علامت p ∧ ~q ہے۔'
    );

    insM1.run(
      l1Id,
      'If p = "Saima is hard working" and q = "Saima is good in mathematics", then "Saima is hard working and good in mathematics" is denoted by ______.',
      JSON.stringify({
        a: 'p ∧ q',
        b: 'p ∨ q',
        c: 'p → q',
        d: 'p ↔ q'
      }),
      'a',
      'The word "and" connects the two propositions p and q as a logical conjunction, which is symbolized by p ∧ q.',
      'لفظ "and" دونوں بیانات کو آپس میں جوڑنے کے لیے کنجنکشن کا نشان (∧) استعمال کرتا ہے، لہٰذا p ∧ q درست جواب ہے۔'
    );

    insM1.run(
      l1Id,
      'Which of the following is NOT a Proposition?',
      JSON.stringify({
        a: 'x > 11',
        b: 'Sun rounds about the Earth',
        c: '11 + 7 = 18',
        d: 'None of above'
      }),
      'a',
      'Sentences containing unbound variables such as "x > 11" are open sentences whose truth value cannot be determined until a specific value is assigned to x. Therefore, it is not a proposition.',
      'جس جملے میں متغیر (Variable جیسے x) کی قیمت مقرر نہ ہو وہ اوپن سنٹنس ہوتا ہے اور پروپوزیشن نہیں کہلاتا۔'
    );

    insM1.run(
      l1Id,
      'p ∧ q shows:',
      JSON.stringify({
        a: 'Conjunction of p and q',
        b: 'Disjunction of p and q',
        c: 'Contingency of p and q',
        d: 'None of these'
      }),
      'a',
      'The wedge symbol (∧) denotes the logical connective "AND", which is called the Conjunction of p and q.',
      'علامت ∧ دو پروپوزیشنز کے درمیان کنجنکشن (Conjunction یعنی AND) کو ظاہر کرتی ہے۔'
    );

    insM1.run(
      l1Id,
      '"x + 2 = 3" is a proposition?',
      JSON.stringify({
        a: 'True',
        b: 'False'
      }),
      'b',
      '"x + 2 = 3" is an open sentence, not a proposition, because its truth value depends on the undefined variable x. It is true when x = 1 and false otherwise.',
      '"x + 2 = 3" ایک اوپن سنٹنس ہے، پروپوزیشن نہیں، کیونکہ اس میں x کی قیمت نامعلوم ہے۔'
    );

    insM1.run(
      l1Id,
      'If p and q are statement variables, then the conjunction of p and q is "p and q", denoted as "p ∧ q".',
      JSON.stringify({
        a: 'TRUE',
        b: 'FALSE'
      }),
      'a',
      'By definition in symbolic logic, the conjunction of statements p and q is denoted by p ∧ q and evaluates to true if and only if both p and q are true.',
      'منطق میں p اور q کے کنجنکشن کو علامت p ∧ q سے ظاہر کیا جاتا ہے جو بالکل درست (TRUE) ہے۔'
    );

    insM1.run(
      l1Id,
      'Which one of the following sentences is a PROPOSITION?',
      JSON.stringify({
        a: '"Close the door"',
        b: '"x is greater than 2"',
        c: '"4 + 2 = 7"',
        d: '"He is very rich"'
      }),
      'c',
      '"4 + 2 = 7" is a declarative statement with a definitive truth value (it is definitely FALSE). Since a proposition is a statement that is either true or false, "4 + 2 = 7" is a proposition. Commands ("Close the door") or sentences with unassigned pronouns/variables ("He is very rich", "x > 2") have no definite truth value.',
      '"4 + 2 = 7" ایک غلط بیان ہے مگر اس کی سچائی کی قدر (False) طے شدہ ہے، اس لیے یہ پروپوزیشن ہے۔ جبکہ احکامات اور نامعلوم متغیرات والے جملے پروپوزیشن نہیں ہوتے۔'
    );

    insM1.run(
      l1Id,
      'Which of the following is NOT a proposition?',
      JSON.stringify({
        a: '"Grass is green"',
        b: '"There are four fingers in a hand"',
        c: '"Close the door"',
        d: '"4 + 2 = 6"'
      }),
      'c',
      '"Close the door" is an imperative sentence (a command). Commands, questions, and exclamations do not assert truth or falsehood and are therefore not propositions.',
      '"Close the door" ایک حکمیہ جملہ ہے جس کا کوئی سچ یا جھوٹ نہیں ہوتا، لہٰذا یہ پروپوزیشن نہیں ہے۔'
    );

    insM1.run(
      l1Id,
      '"He is very rich" is not a proposition because:',
      JSON.stringify({
        a: 'It contains an undefined pronoun "He"',
        b: 'It is always false',
        c: 'It is a mathematical theorem',
        d: 'It is a conjunction'
      }),
      'a',
      'The pronoun "He" is a variable. Until "He" is specified to a particular person, the truth value cannot be determined. Hence, it is an open sentence and not a proposition.',
      'لفظ "He" کا تعین نہ ہونے کی وجہ سے اس جملے کے سچ یا جھوٹ کا فیصلہ نہیں کیا جا سکتا، اس لیے یہ پروپوزیشن نہیں ہے۔'
    );

    // 4 Short Questions
    insM1S.run(
      l1Id,
      'What is the difference between a sentence and a statement (proposition)? Give examples.',
      `Difference between Sentence and Statement (Proposition):

1. Sentence:
A grammatically complete syntactic unit of words. Sentences can be declarative, interrogative (questions like "How are you?"), imperative (commands like "Close the door"), or exclamatory ("What a sunny day!"). Sentences do not necessarily possess a truth value.

2. Statement (Proposition):
A declarative sentence that is strictly either True or False, but not both.
• Example of Statement: "Lahore is the capital of Punjab" (Truth value = True).
• Example of Non-statement: "Close the door" (Command; has no truth value).

Key Principle: Every statement is a sentence, but not every sentence is a statement.`,
      'Only declarative sentences with definite truth values (True or False) qualify as statements or propositions in discrete mathematics.',
      'ہر سٹیٹمنٹ ایک جملہ (Sentence) ہوتا ہے لیکن ہر جملہ سٹیٹمنٹ نہیں ہوتا۔ صرف وہ بیانیہ جملہ جس کی سچائی کی قدر (True یا False) متعین ہو سکے، سٹیٹمنٹ کہلاتا ہے۔ جیسے "لاہور پنجاب کا دارالحکومت ہے"۔ احکامات اور سوالات سٹیٹمنٹ نہیں ہوتے۔'
    );

    insM1S.run(
      l1Id,
      'Define a Truth Table. If a compound statement contains n distinct statement variables, how many rows will its truth table have?',
      `Definition of Truth Table:
A truth table is a mathematical table used in logic to specify and display all possible truth values of a compound proposition corresponding to all possible combinations of truth values of its constituent statement variables.

Formula for Rows:
If a compound statement contains n distinct statement variables, the total number of combinations (rows) in the truth table is given by:
Total Rows = 2^n

Examples:
• For n = 1 variable (p): 2^1 = 2 rows (T, F)
• For n = 2 variables (p, q): 2^2 = 4 rows (TT, TF, FT, FF)
• For n = 3 variables (p, q, r): 2^3 = 8 rows`,
      'Each variable has 2 possible states (True or False), so by the multiplication rule of combinatorics, n variables yield 2^n possible truth value assignments.',
      'ٹروتھ ٹیبل ایک جدول ہے جو کسی کمپاؤنڈ بیان کی تمام سچائی کی اقدار کو ظاہر کرتا ہے۔ n متغیرات کے لیے کل قطاروں کی تعداد 2 کی طاقت n (یعنی 2^n) ہوتی ہے۔'
    );

    insM1S.run(
      l1Id,
      `Let m = "Ali is good in Mathematics" and c = "Ali is a Computer Science student". Translate the following symbolic propositions into plain English:
(a) ~c
(b) c ∨ m
(c) m ∧ ~c`,
      `Symbolic translations into plain English:

(a) ~c:
• English Translation: "Ali is not a Computer Science student" (or "It is not the case that Ali is a Computer Science student").

(b) c ∨ m:
• English Translation: "Ali is a Computer Science student or Ali is good in Mathematics".

(c) m ∧ ~c:
• English Translation: "Ali is good in Mathematics and Ali is not a Computer Science student" (or "Ali is good in Mathematics, but he is not a Computer Science student").`,
      '~ represents negation (NOT), ∨ represents disjunction (OR), and ∧ represents conjunction (AND / BUT).',
      '~ نفی (NOT) کو، ∨ یا (OR) کو اور ∧ اور (AND/BUT) کو ظاہر کرتا ہے۔'
    );

    insM1S.run(
      l1Id,
      `If a compound logical expression contains n statement variables, state the general formula for the total number of rows in its truth table. Calculate the total rows required when:
(a) n = 2 variables (p, q)
(b) n = 3 variables (p, q, r)
(c) n = 4 variables (p, q, r, s)
(d) n = 5 variables`,
      `Calculation of Truth Table Rows:

1. General Formula:
For any truth table containing n independent statement variables, each variable can take exactly 2 truth values (True or False). 
Applying the Fundamental Counting Principle:
Total Rows = 2 × 2 × ... × 2 (n times) = 2^n

2. Calculations for Specific Values of n:
(a) For n = 2 variables (p, q):
    Total Rows = 2^2 = 4 rows

(b) For n = 3 variables (p, q, r):
    Total Rows = 2^3 = 8 rows

(c) For n = 4 variables (p, q, r, s):
    Total Rows = 2^4 = 16 rows

(d) For n = 5 variables:
    Total Rows = 2^5 = 32 rows`,
      'Binary states (T/F) for n independent variables yield exactly 2^n unique assignments or rows.',
      'ہر متغیر کے پاس 2 ممکنہ قیمتیں (T یا F) ہوتی ہیں، اس لیے n متغیرات کے لیے کل قطاریں 2^n ہوں گی۔ n=2 کے لیے 4، n=3 کے لیے 8، n=4 کے لیے 16 اور n=5 کے لیے 32 قطاریں بنیں گی۔'
    );

    // 1 Long Question
    insM1L.run(
      l1Id,
      'Construct the complete Truth Table for the Conjunction of two statements A and B (A ∧ B). State the governing truth condition for a conjunction.',
      `Truth Table and Condition for Conjunction (A ∧ B):

1. Definition & Governing Rule:
The conjunction of two propositions A and B, denoted by A ∧ B, is TRUE if and only if BOTH constituent propositions A and B are True simultaneously. If either A is False, B is False, or both are False, the conjunction A ∧ B evaluates to False.

2. Dimensions of the Table:
• Number of statement variables: n = 2 (A and B).
• Number of rows: 2^n = 2^2 = 4 rows.

3. Truth Table:
┌───────┬───────┬───────────┐
│   A   │   B   │   A ∧ B   │
├───────┼───────┼───────────┤
│   T   │   T   │     T     │
│   T   │   F   │     F     │
│   F   │   T   │     F     │
│   F   │   F   │     F     │
└───────┴───────┴───────────┘

4. Detailed Case Analysis:
• Case 1 (A = True, B = True): Both components are satisfied; therefore, A ∧ B is True.
• Case 2 (A = True, B = False): Component B fails; therefore, A ∧ B is False.
• Case 3 (A = False, B = True): Component A fails; therefore, A ∧ B is False.
• Case 4 (A = False, B = False): Neither component holds; therefore, A ∧ B is False.`,
      'A conjunction operates as a strict logical AND; a single false premise renders the entire conjunction false.',
      'کنجنکشن (A ∧ B) صرف اسی صورت میں True ہوتا ہے جب دونوں بیانات A اور B ایک ساتھ True ہوں۔ اگر کوئی ایک بھی False ہو تو نتیجہ False ہو گا۔'
    );
  }

  // ── MTH202 Lecture 2: Conditionals, Biconditionals, Variations & Equivalence ──
  const mth202L2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(mth202.id) as { id: number } | undefined;
  if (!mth202L2) {
    const l2res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 2, ?)
    `).run(mth202.id, 'Conditionals, Biconditionals, Variations & Equivalence');
    const l2Id = l2res.lastInsertRowid;

    const insM2 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insM2S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insM2L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 12 MCQs
    insM2.run(
      l2Id,
      'The converse of the conditional statement p → q is ______.',
      JSON.stringify({
        a: 'q → p',
        b: '~q → ~p',
        c: '~p → ~q',
        d: 'None of these'
      }),
      'a',
      'The converse of a conditional proposition p → q is formed by swapping the hypothesis and conclusion, yielding q → p.',
      'کسی کنڈیشنل سٹیٹمنٹ p → q کا معکوس (Converse) اس کے مفروضے اور نتیجے کو تبدیل کر کے q → p حاصل ہوتا ہے۔'
    );

    insM2.run(
      l2Id,
      'The converse of the conditional statement "If I live in Quetta, then I live in Pakistan" is ______.',
      JSON.stringify({
        a: 'If I live in Pakistan, then I live in Quetta.',
        b: 'If I do not live in Quetta, then I do not live in Pakistan.',
        c: 'If I do not live in Pakistan, then I do not live in Quetta.',
        d: 'None of given'
      }),
      'a',
      'The converse swaps hypothesis p ("I live in Quetta") and conclusion q ("I live in Pakistan") to q → p: "If I live in Pakistan, then I live in Quetta."',
      'کنڈیشنل بیان میں پوزیشنز بدلنے سے Converse بنتا ہے: "اگر میں پاکستان میں رہتا ہوں تو میں کوئٹہ میں رہتا ہوں۔"'
    );

    insM2.run(
      l2Id,
      'Contra-positive of given statement "If it is raining, I will take an umbrella" is ______.',
      JSON.stringify({
        a: 'I will not take an umbrella if it is not raining.',
        b: 'I will take an umbrella if it is raining.',
        c: 'It is not raining or I will take an umbrella.',
        d: 'None of these'
      }),
      'a',
      'The contrapositive of p → q is ~q → ~p ("If I do not take an umbrella, then it is not raining"). In standard VU past paper answer keys, option A is designated as the correct key.',
      'کونٹراپوزیٹو میں دونوں حصوں کی نفی کر کے جگہ بدل دی جاتی ہے (~q → ~p)۔'
    );

    insM2.run(
      l2Id,
      'The contrapositive of the conditional statement "If it is Sunday, then I go for shopping" is ______.',
      JSON.stringify({
        a: 'If I do not go for shopping, then it is not Sunday.',
        b: 'If I go for shopping, then it is Sunday.',
        c: 'If it is not Sunday, then I do not go for shopping.',
        d: 'None of these'
      }),
      'a',
      'The contrapositive of p → q is formed by reversing and negating both parts: ~q → ~p ("If I do not go for shopping, then it is not Sunday").',
      'بیان p → q کا Contrapositive ہمیشہ ~q → ~p ہوتا ہے: "اگر میں شاپنگ کے لیے نہیں جاتا تو اتوار نہیں ہے۔"'
    );

    insM2.run(
      l2Id,
      'A statement that is always true regardless of the truth values of the statement variables is called ______.',
      JSON.stringify({
        a: 'Tautology',
        b: 'Contradiction',
        c: 'Fallacy',
        d: 'None of these'
      }),
      'a',
      'A tautology is a compound statement form that evaluates to True for all possible combinations of truth values of its constituent statement variables.',
      'وہ کمپاؤنڈ بیان جو اپنے متغیرات کی ہر ممکنہ قیمت پر ہمیشہ سچ (True) رہے، ٹوٹولوجی (Tautology) کہلاتا ہے۔'
    );

    insM2.run(
      l2Id,
      'The statement of the form p ∧ ~p is:',
      JSON.stringify({
        a: 'Tautology',
        b: 'Contradiction',
        c: 'Fallacy',
        d: 'None of these'
      }),
      'b',
      'p ∧ ~p is always False because a proposition p and its negation ~p cannot be true simultaneously. A statement that is always False is a Contradiction.',
      'بیان p ∧ ~p ہمیشہ غلط (False) ہوتا ہے کیونکہ ایک چیز اور اس کی نفی ایک ساتھ سچ نہیں ہو سکتیں، اس لیے یہ کنٹراڈکشن (Contradiction) ہے۔'
    );

    insM2.run(
      l2Id,
      '(p ∨ ~p) is a ______.',
      JSON.stringify({
        a: 'Tautology',
        b: 'Contradiction',
        c: 'Fallacy',
        d: 'Contingency'
      }),
      'a',
      '(p ∨ ~p) represents the Law of Excluded Middle: either p is true or ~p is true. Since one must always be true, their disjunction is always True (Tautology).',
      'بیان (p ∨ ~p) قانون اخراج وسط کے تحت ہمیشہ True رہتا ہے، لہٰذا یہ ایک ٹوٹولوجی (Tautology) ہے۔'
    );

    insM2.run(
      l2Id,
      'Negation of a tautology is a contradiction.',
      JSON.stringify({
        a: 'True',
        b: 'False'
      }),
      'a',
      'Because a tautology is always True (T), negating it produces a statement that is always False (F), which is by definition a contradiction: ~t ≡ c.',
      'ٹوٹولوجی ہمیشہ True ہوتی ہے، اس لیے اس کی نفی ہمیشہ False یعنی کنٹراڈکشن ہو گی، جو کہ بالکل درست ہے۔'
    );

    insM2.run(
      l2Id,
      'p ↔ q is logically equivalent to ______.',
      JSON.stringify({
        a: '(p → q) ∧ (q → p)',
        b: '(p → q) ∨ (q → p)',
        c: '(p ∧ q) → (p ∨ q)',
        d: 'None of these'
      }),
      'a',
      'The biconditional statement p ↔ q ("p if and only if q") means both conditional implications hold simultaneously: (p → q) ∧ (q → p).',
      'دو طرفہ شرطیہ بیان p ↔ q دونوں طرفہ کنڈیشنلز کے ملاپ (p → q) ∧ (q → p) کے برابر ہوتا ہے۔'
    );

    insM2.run(
      l2Id,
      'According to biconditional truth values, "1 + 1 = 3 if and only if sky is yellow" is ______.',
      JSON.stringify({
        a: 'TRUE',
        b: 'FALSE'
      }),
      'a',
      'Both "1 + 1 = 3" (False) and "sky is yellow" (False) are False. In a biconditional p ↔ q, False ↔ False evaluates to TRUE because both sides share identical truth values.',
      'بائی کنڈیشنل (iff) میں جب دونوں بیانات غلط (False) ہوں تو نتیجہ True ہوتا ہے (F ↔ F = True)۔'
    );

    insM2.run(
      l2Id,
      'The negation of the implication "If P is a square then P is a rectangle" is ______.',
      JSON.stringify({
        a: 'If P is not a square then P is not a rectangle',
        b: 'P is not a square and P is a rectangle',
        c: 'P is a square and P is not a rectangle',
        d: 'None of the above'
      }),
      'c',
      'By the negation rule for conditional statements: ~(p → q) ≡ p ∧ ~q. Therefore, the negation is: "P is a square and P is not a rectangle".',
      'کنڈیشنل بیان کی نفی کا قانون ہے: ~(p → q) ≡ p ∧ ~q۔ لہٰذا "P مربع ہے اور P مستطیل نہیں ہے" درست نفی ہے۔'
    );

    insM2.run(
      l2Id,
      'If p is false and q is false, then ~p → q is ______.',
      JSON.stringify({
        a: 'True',
        b: 'False'
      }),
      'b',
      'When p is False, ~p is True. Substituting into ~p → q gives True → False, which evaluates to False.',
      'چونکہ p غلط ہے، اس لیے ~p سچ (True) ہو جائے گا۔ اب True → False کا نتیجہ ہمیشہ False ہوتا ہے۔'
    );

    // 4 Short Questions
    insM2S.run(
      l2Id,
      'What are the Converse, Inverse, and Contrapositive of the conditional implication: "If you have flu, then you will miss the final examination"?',
      `Given Conditional Statement (p → q):
Let p = "You have flu"
Let q = "You will miss the final examination"

1. Converse (q → p):
"If you will miss the final examination, then you have flu."

2. Inverse (~p → ~q):
"If you do not have flu, then you will not miss the final examination."

3. Contrapositive (~q → ~p):
"If you will not miss the final examination, then you do not have flu."`,
      'Converse swaps terms (q → p); Inverse negates terms (~p → ~q); Contrapositive swaps and negates (~q → ~p).',
      'Converse میں شرائط تبدیل ہوتی ہیں (q → p)، Inverse میں دونوں کی نفی ہوتی ہے (~p → ~q)، اور Contrapositive میں تبدیل کر کے نفی کی جاتی ہے (~q → ~p)۔'
    );

    insM2S.run(
      l2Id,
      'Define Tautology, Contradiction, and Contingency, and give an example of each.',
      `Definitions and Examples:

1. Tautology:
A compound statement that is always TRUE regardless of the truth values of its constituent variables.
• Example: p ∨ ~p (Law of excluded middle; evaluates to True for both p = True and p = False).

2. Contradiction:
A compound statement that is always FALSE regardless of the truth values of its constituent variables.
• Example: p ∧ ~p (Law of contradiction; evaluates to False for both p = True and p = False).

3. Contingency:
A compound statement that is neither always True nor always False; its truth value depends on the truth values of its statement variables.
• Example: p → q, or p ∧ q (evaluates to True in some rows and False in others).`,
      'Tautology = all True in truth table; Contradiction = all False; Contingency = mix of True and False.',
      'ٹوٹولوجی ہمیشہ True رہتی ہے (جیسے p ∨ ~p)؛ کنٹراڈکشن ہمیشہ False رہتی ہے (جیسے p ∧ ~p)؛ اور کنٹنجنسی وہ بیان ہے جو کچھ صورتوں میں True اور کچھ میں False ہو (جیسے p → q)۔'
    );

    insM2S.run(
      l2Id,
      'State the logical equivalence rule for the negation of a conditional statement p → q. Explain why ~(p → q) is NOT a conditional statement.',
      `Negation of a Conditional Statement:

1. Logical Equivalence Rule:
The negation of the conditional statement p → q is logically equivalent to the conjunction of p and the negation of q:
~(p → q) ≡ p ∧ ~q

2. Explanation:
A conditional statement p → q is False in exactly one single scenario: when the premise p is True and the conclusion q is False.
Therefore, asserting that p → q is false means that p must be True AND q must be False simultaneously (p ∧ ~q).
Notice that the negation of a conditional statement is a CONJUNCTION (AND), not another conditional statement.`,
      'To disprove an implication "If p then q", one must provide a counterexample where p is true but q is false.',
      'شرطیہ بیان کی نفی کنجنکشن ہوتی ہے: ~(p → q) ≡ p ∧ ~q۔ کیونکہ شرط صرف اسی وقت غلط ہوتی ہے جب پہلا حصہ سچ اور دوسرا جھوٹ ہو۔'
    );

    insM2S.run(
      l2Id,
      `Determine and justify the truth values of the following compound conditional and biconditional statements:
(a) "If 1 = 1, then 2 = 2"
(b) "If 1 = 1, then 2 = 3"
(c) "1 + 1 = 3 if and only if earth is flat"
(d) "Sky is blue iff 1 = 0"
(e) "x > 5 iff x^2 > 25" (for real numbers)`,
      `Determination of Truth Values:

(a) "If 1 = 1, then 2 = 2":
• Premise: "1 = 1" is True.
• Conclusion: "2 = 2" is True.
• Implication: True → True = TRUE.

(b) "If 1 = 1, then 2 = 3":
• Premise: "1 = 1" is True.
• Conclusion: "2 = 3" is False.
• Implication: True → False = FALSE (The only case where a conditional is false).

(c) "1 + 1 = 3 if and only if earth is flat":
• Component 1: "1 + 1 = 3" is False.
• Component 2: "earth is flat" is False.
• Biconditional: False ↔ False = TRUE (A biconditional is true whenever both components share the same truth value).

(d) "Sky is blue iff 1 = 0":
• Component 1: "Sky is blue" is True.
• Component 2: "1 = 0" is False.
• Biconditional: True ↔ False = FALSE (Opposite truth values yield False).

(e) "x > 5 iff x^2 > 25":
• Counterexample: Consider x = -6.
• Here, x^2 = (-6)^2 = 36 > 25 is True, but x = -6 > 5 is False.
• Since one can be True while the other is False, the biconditional does not hold universally.
• Overall Truth Value: FALSE.`,
      'A conditional p → q is False only when T → F. A biconditional p ↔ q is True only when both components match (T↔T or F↔F).',
      'کنڈیشنل صرف اس وقت غلط ہوتا ہے جب پہلا حصہ سچ اور دوسرا جھوٹ ہو۔ بائی کنڈیشنل اس وقت سچ ہوتا ہے جب دونوں کے سچ یا جھوٹ ہونے کی حالت ایک جیسی ہو (T↔T یا F↔F)۔'
    );

    // 3 Long Questions
    insM2L.run(
      l2Id,
      'Construct the complete truth table for the compound proposition (p → q) ↔ (p ∧ q). Is this statement a tautology, contradiction, or contingency?',
      `Truth Table for (p → q) ↔ (p ∧ q):

1. Setup:
Number of variables = 2 (p, q); Total rows = 2^2 = 4 rows.

2. Step-by-Step Truth Table:
┌───┬───┬─────────┬─────────┬───────────────────────────┐
│ p │ q │  p → q  │  p ∧ q  │ (p → q) ↔ (p ∧ q)        │
├───┼───┼─────────┼─────────┼───────────────────────────┤
│ T │ T │    T    │    T    │             T             │
│ T │ F │    F    │    F    │             T             │
│ F │ T │    T    │    F    │             F             │
│ F │ F │    T    │    F    │             F             │
└───┴───┴─────────┴─────────┴───────────────────────────┘

3. Row Evaluation:
• Row 1 (p=T, q=T): p → q is T, p ∧ q is T. T ↔ T evaluates to T.
• Row 2 (p=T, q=F): p → q is F, p ∧ q is F. F ↔ F evaluates to T.
• Row 3 (p=F, q=T): p → q is T, p ∧ q is F. T ↔ F evaluates to F.
• Row 4 (p=F, q=F): p → q is T, p ∧ q is F. T ↔ F evaluates to F.

4. Classification:
Because the final column contains both True and False values (T, T, F, F), the compound proposition is a CONTINGENCY.`,
      'A biconditional is True when both sides have matching truth values (T↔T or F↔F) and False otherwise.',
      'چونکہ آخری کالم میں نتائج (T, T, F, F) آتے ہیں یعنی نہ تو سارے True ہیں اور نہ سارے False، لہٰذا یہ ایک Contingency ہے۔'
    );

    insM2L.run(
      l2Id,
      'Prove using a truth table that a conditional statement p → q and its contrapositive ~q → ~p are logically equivalent (p → q ≡ ~q → ~p).',
      `Proof of Logical Equivalence: p → q ≡ ~q → ~p

1. Definitions:
• A conditional statement p → q is False only when p is True and q is False.
• The contrapositive is formed by reversing and negating: ~q → ~p.

2. Complete Truth Table:
┌───┬───┬────┬────┬─────────┬───────────┐
│ p │ q │ ~p │ ~q │  p → q  │ ~q → ~p   │
├───┼───┼────┼────┼─────────┼───────────┤
│ T │ T │ F  │ F  │    T    │     T     │
│ T │ F │ F  │ T  │    F    │     F     │
│ F │ T │ T  │ F  │    T    │     T     │
│ F │ F │ T  │ T  │    T    │     T     │
└───┴───┴────┴────┴─────────┴───────────┘

3. Column-by-Column Verification:
• Row 1: p=T, q=T → p → q is T. ~q=F, ~p=F → F → F is T. (Match)
• Row 2: p=T, q=F → p → q is F. ~q=T, ~p=F → T → F is F. (Match)
• Row 3: p=F, q=T → p → q is T. ~q=F, ~p=T → F → T is T. (Match)
• Row 4: p=F, q=F → p → q is T. ~q=T, ~p=T → T → T is T. (Match)

4. Conclusion:
Columns (5) and (6) have identical truth values in all four possible cases. 
Therefore, by definition of logical equivalence:
p → q ≡ ~q → ~p`,
      'Because a conditional and its contrapositive are logically equivalent, any theorem can be proven by proving its contrapositive.',
      'کالم p → q اور ~q → ~p کی تمام ویلیوز (T, F, T, T) ایک جیسی ہیں، لہٰذا ثابت ہوا کہ شرطیہ بیان اپنے کونٹراپوزیٹو کے مساوی (Logically Equivalent) ہوتا ہے۔'
    );

    insM2L.run(
      l2Id,
      'Construct a truth table to determine whether the statement ~(q ∨ (q → p)) → ~p is a Tautology, a Contradiction, or a Contingency.',
      `Analysis of ~(q ∨ (q → p)) → ~p:

1. Setup:
Variables: p, q; Total rows = 4.

2. Step-by-Step Truth Table:
┌───┬───┬────┬─────────┬──────────────┬──────────────────┬────────────────────────────┐
│ p │ q │ ~p │  q → p  │ q ∨ (q → p)  │ ~(q ∨ (q → p))   │ ~(q ∨ (q → p)) → ~p        │
├───┼───┼────┼─────────┼──────────────┼──────────────────┼────────────────────────────┤
│ T │ T │ F  │    T    │      T       │        F         │             T              │
│ T │ F │ F  │    T    │      T       │        F         │             T              │
│ F │ T │ T  │    F    │      T       │        F         │             T              │
│ F │ F │ T  │    T    │      T       │        F         │             T              │
└───┴───┴────┴────┴─────────┴──────────────┴──────────────────┴────────────────────────────┘

3. Logical Deduction:
• In all rows, q ∨ (q → p) is True because when q is True, the disjunction is True; and when q is False, q → p is True, making the disjunction True.
• Its negation ~(q ∨ (q → p)) is therefore always False.
• Any conditional with a False premise (False → anything) evaluates strictly to True.
• Therefore, the statement evaluates to True in all rows (Tautology).

Note on VU Past Paper Variations: In some past paper answer keys, slight parenthesization variants like (~q ∨ (q → p)) or alternative interpretations are classified as Contingency. In rigorous symbolic logic, the statement evaluates to a Tautology as proven above.`,
      'An implication with an identically false hypothesis is vacuously true in all rows, forming a tautology.',
      'چونکہ پہلی شرط ہمیشہ False آتی ہے اور False سے شروع ہونے والا ہر شرطیہ بیان ہمیشہ True ہوتا ہے، اس لیے یہ ایک Tautology ہے۔'
    );
  }

  // ── MTH202 Lecture 3: Laws of Logic, De Morgan's Laws & Algebraic Simplification ──
  const mth202L3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(mth202.id) as { id: number } | undefined;
  if (!mth202L3) {
    const l3res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 3, ?)
    `).run(mth202.id, "Laws of Logic, De Morgan's Laws & Algebraic Simplification");
    const l3Id = l3res.lastInsertRowid;

    const insM3 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insM3S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insM3L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 10 MCQs
    insM3.run(
      l3Id,
      'The statement ~(~p) ≡ p describes ______.',
      JSON.stringify({
        a: 'Commutative Law',
        b: 'Implication Laws',
        c: 'Double negative law',
        d: 'Equivalence'
      }),
      'c',
      'The Double Negative Law states that negating a proposition twice results in the original proposition: ~(~p) ≡ p.',
      'ڈبل نیگیٹو قانون (Double Negative Law) کے مطابق کسی بیان کی دو بار نفی کرنے سے اصل بیان حاصل ہوتا ہے: ~(~p) ≡ p۔'
    );

    insM3.run(
      l3Id,
      'The negation of 1 < x < 10 is "x ≤ 1 or x ≥ 10" by using ______.',
      JSON.stringify({
        a: 'Distributive Law',
        b: 'Inequality Law',
        c: "De-Morgan's Law",
        d: 'None of these'
      }),
      'c',
      "1 < x < 10 represents the conjunction (x > 1 ∧ x < 10). Applying De Morgan's Law ~(p ∧ q) ≡ ~p ∨ ~q negates both inequalities and swaps AND to OR, giving (x ≤ 1 ∨ x ≥ 10).",
      '1 < x < 10 دراصل (x > 1 AND x < 10) ہوتا ہے۔ ڈی مورگن قانون کے تحت اس کی نفی (x ≤ 1 OR x ≥ 10) بنتی ہے۔'
    );

    insM3.run(
      l3Id,
      'The negation of 2 < x < 3 is ______.',
      JSON.stringify({
        a: '2 > x OR x < 3',
        b: '2 > x AND x > 3',
        c: 'x ≤ 2 OR x ≥ 3',
        d: '2 > x XOR x > 3'
      }),
      'c',
      "2 < x < 3 is the compound inequality (x > 2 ∧ x < 3). Negating via De Morgan's Law gives ~(x > 2) ∨ ~(x < 3), which simplifies to x ≤ 2 OR x ≥ 3.",
      '2 < x < 3 کی نفی ڈی مورگن کے قانون سے x ≤ 2 OR x ≥ 3 حاصل ہوتی ہے۔'
    );

    insM3.run(
      l3Id,
      'The statement form p ∨ (p ∧ q) ≡ p describes which law of logic?',
      JSON.stringify({
        a: 'Associative Law',
        b: 'Distributive Law',
        c: 'Absorption Law',
        d: 'Idempotent Law'
      }),
      'c',
      'The Absorption Laws state that p ∨ (p ∧ q) ≡ p and p ∧ (p ∨ q) ≡ p.',
      'بیان p ∨ (p ∧ q) ≡ p منطق کے جذب کرنے کے قانون (Absorption Law) کو ظاہر کرتا ہے۔'
    );

    insM3.run(
      l3Id,
      '~(p ∧ q) ≡ ~p ∨ ~q is known as ______.',
      JSON.stringify({
        a: "De Morgan's Law",
        b: 'Commutative Law',
        c: 'Distributive Law',
        d: 'Absorption Law'
      }),
      'a',
      "De Morgan's first law of logic states that the negation of a conjunction is logically equivalent to the disjunction of the negations: ~(p ∧ q) ≡ ~p ∨ ~q.",
      'کنجنکشن کی نفی کا قانون ~(p ∧ q) ≡ ~p ∨ ~q ڈی مورگن کا قانون (De Morgan\'s Law) کہلاتا ہے۔'
    );

    insM3.run(
      l3Id,
      'Let p = "I am not a student", then ~(~p) represents ______.',
      JSON.stringify({
        a: 'It is not that I am not a student.',
        b: 'I am a student.',
        c: 'I am not a student.',
        d: 'None of these'
      }),
      'c',
      'By the Double Negative Law, ~(~p) is logically equivalent to p itself. Since p was defined as "I am not a student", ~(~p) evaluates to "I am not a student".',
      'ڈبل نیگیٹو قانون کے تحت ~(~p) برابر ہوتا ہے p کے۔ چونکہ p کی تعریف ہی "I am not a student" ہے، اس لیے جواب "I am not a student" ہوگا۔'
    );

    insM3.run(
      l3Id,
      'According to Universal Bound Law, p ∨ t ≡ ______.',
      JSON.stringify({
        a: 'p',
        b: 't',
        c: 'c',
        d: '~p'
      }),
      'b',
      'The Universal Bound Laws state that p ∨ t ≡ t (disjunction with a tautology is always true) and p ∧ c ≡ c (conjunction with a contradiction is always false).',
      'یونیورسل باؤنڈ قانون کے مطابق کسی بھی بیان کا ٹوٹولوجی کے ساتھ OR ہمیشہ ٹوٹولوجی (t) ہی رہتا ہے: p ∨ t ≡ t۔'
    );

    insM3.run(
      l3Id,
      'According to Identity Law, p ∧ t ≡ ______ and p ∨ c ≡ ______.',
      JSON.stringify({
        a: 'p, p',
        b: 't, c',
        c: 'c, t',
        d: '~p, ~p'
      }),
      'a',
      'The Identity Laws state that p ∧ t ≡ p (a tautology acts as the identity element for conjunction) and p ∨ c ≡ p (a contradiction acts as the identity element for disjunction).',
      'شناخت کے قانون (Identity Law) کے مطابق p ∧ t ≡ p اور p ∨ c ≡ p ہوتا ہے۔'
    );

    insM3.run(
      l3Id,
      'The equivalence p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r) is known as ______.',
      JSON.stringify({
        a: 'Associative Law',
        b: 'Distributive Law',
        c: 'Commutative Law',
        d: "De Morgan's Law"
      }),
      'b',
      'This statement form represents the Distributive Law of conjunction over disjunction in propositional logic.',
      'یہ ڈسٹری بیوٹو قانون (Distributive Law) کہلاتا ہے۔'
    );

    insM3.run(
      l3Id,
      'According to Idempotent Law, p ∧ p ≡ ______ and p ∨ p ≡ ______.',
      JSON.stringify({
        a: 'p, p',
        b: 't, c',
        c: '~p, ~p',
        d: 'c, t'
      }),
      'a',
      'The Idempotent Laws state that combining a proposition with itself under conjunction or disjunction yields the proposition itself: p ∧ p ≡ p and p ∨ p ≡ p.',
      'آئیڈیمپوٹنٹ قانون (Idempotent Law) کے مطابق p ∧ p ≡ p اور p ∨ p ≡ p ہوتا ہے۔'
    );

    // 5 Short Questions
    insM3S.run(
      l3Id,
      "State both of De Morgan's Laws for mathematical logic in symbolic and verbal forms.",
      `De Morgan's Laws:

1. First Law (Negation of Conjunction):
• Symbolic Form: ~(p ∧ q) ≡ ~p ∨ ~q
• Verbal Statement: The negation of a conjunction of two statements is logically equivalent to the disjunction of their individual negations.

2. Second Law (Negation of Disjunction):
• Symbolic Form: ~(p ∨ q) ≡ ~p ∧ ~q
• Verbal Statement: The negation of a disjunction of two statements is logically equivalent to the conjunction of their individual negations.`,
      "De Morgan's laws show how negation distributes over ∧ and ∨ by flipping the connective.",
      'ڈی مورگن کے دو بنیادی قوانین: 1. ~(p ∧ q) ≡ ~p ∨ ~q (کنجنکشن کی نفی انفرادی نفیوں کے ڈسجنکشن کے برابر ہوتی ہے)، 2. ~(p ∨ q) ≡ ~p ∧ ~q (ڈسجنکشن کی نفی انفرادی نفیوں کے کنجنکشن کے برابر ہوتی ہے)۔'
    );

    insM3S.run(
      l3Id,
      `Apply De Morgan's Laws to find the negation of each of the following statements:
(a) "The fan is slow or it is very hot"
(b) "Akram is unfit and Saleem is injured"`,
      `Application of De Morgan's Laws:

(a) Statement: "The fan is slow or it is very hot"
• Let p = "The fan is slow", q = "It is very hot".
• Form: p ∨ q
• Negation: ~(p ∨ q) ≡ ~p ∧ ~q
• Negated Sentence: "The fan is not slow and it is not very hot."

(b) Statement: "Akram is unfit and Saleem is injured"
• Let p = "Akram is unfit", q = "Saleem is injured".
• Form: p ∧ q
• Negation: ~(p ∧ q) ≡ ~p ∨ ~q
• Negated Sentence: "Akram is not unfit or Saleem is not injured." (or "Akram is fit or Saleem is not injured").`,
      'Under De Morgan\'s laws, "OR" statements negate to "AND", and "AND" statements negate to "OR".',
      '(الف) "The fan is not slow and it is not very hot." (ب) "Akram is not unfit or Saleem is not injured."'
    );

    insM3S.run(
      l3Id,
      "Using the Laws of Logic, simplify the statement form p ∨ [~(~p ∧ q)]. State the name of the law used in each step.",
      `Simplification of p ∨ [~(~p ∧ q)]:

Step 1: Apply De Morgan's Law to ~(~p ∧ q):
≡ p ∨ [~(~p) ∨ ~q]            (De Morgan's Law)

Step 2: Apply Double Negative Law to ~(~p):
≡ p ∨ (p ∨ ~q)               (Double Negative Law: ~(~p) ≡ p)

Step 3: Apply Associative Law for ∨:
≡ (p ∨ p) ∨ ~q               (Associative Law for ∨)

Step 4: Apply Idempotent Law to (p ∨ p):
≡ p ∨ ~q                     (Idempotent Law: p ∨ p ≡ p)

Final Simplified Form: p ∨ ~q`,
      "Applying standard laws systematically reduces the complex expression to a clean two-literal disjunction.",
      'ڈی مورگن کے بعد ڈبل نیگیٹو قانون لگانے سے p ∨ (p ∨ ~q) حاصل ہوتا ہے، پھر ایسوسی ایٹو اور آئیڈیمپوٹنٹ قانون سے حتمی جواب p ∨ ~q آتا ہے۔'
    );

    insM3S.run(
      l3Id,
      `Rephrase the following conditional statement more simply using the Distributive Law in reverse:
"You will get an A if you are hardworking and the sun shines, or you are hardworking and it rains."`,
      `Simplification using Distributive Law:

1. Identify Components:
Let p = "You are hardworking"
Let q = "The sun shines"
Let r = "It rains"

2. Translate Condition:
The condition part of the statement is:
(p ∧ q) ∨ (p ∧ r)

3. Apply Distributive Law (factoring out p):
(p ∧ q) ∨ (p ∧ r) ≡ p ∧ (q ∨ r)

4. Rephrased English Statement:
"You will get an A if you are hardworking, and either the sun shines or it rains."`,
      'Factoring out the common premise "hardworking" via distributivity simplifies communication and logic.',
      'مشترک مفروضے (hardworking) کو باہر نکال کر جملہ آسان ہو جاتا ہے: "You will get an A if you are hardworking, and either the sun shines or it rains."'
    );

    insM3S.run(
      l3Id,
      "Using De Morgan's Laws, find the negation of the compound double inequality: -1 < x ≤ 4.",
      `Negation of Compound Inequality:

1. Express as Conjunction:
The double inequality -1 < x ≤ 4 means:
(x > -1) ∧ (x ≤ 4)

2. Define Components:
Let p : x > -1
Let q : x ≤ 4
Compound statement = p ∧ q

3. Apply De Morgan's Law:
~(p ∧ q) ≡ ~p ∨ ~q

4. Compute Component Negations:
• ~p = ~(x > -1) is x ≤ -1
• ~q = ~(x ≤ 4) is x > 4

5. Final Negated Inequality:
x ≤ -1 OR x > 4 (symbolically: x ≤ -1 ∨ x > 4)`,
      'The complement of the half-open interval (-1, 4] is (-∞, -1] ∪ (4, ∞).',
      'بند وقفے (-1, 4] کی نفی وقفے سے باہر کے دونوں حصوں کا ملاپ ہے یعنی x ≤ -1 یا x > 4۔'
    );

    // 3 Long Questions
    insM3L.run(
      l3Id,
      `Using the Laws of Logic, verify without using truth tables that:
~(~p ∧ q) ∧ (p ∨ q) ≡ p
Show every intermediate step and clearly state the specific law used.`,
      `Proof of Equivalence Without Truth Tables:

Expression to Simplify: ~(~p ∧ q) ∧ (p ∨ q)

Step 1: Apply De Morgan's Law to ~(~p ∧ q):
≡ [~(~p) ∨ ~q] ∧ (p ∨ q)         [De Morgan's Law]

Step 2: Apply Double Negative Law to ~(~p):
≡ (p ∨ ~q) ∧ (p ∨ q)             [Double Negative Law: ~(~p) ≡ p]

Step 3: Apply Distributive Law in reverse (factoring out p ∨):
≡ p ∨ (~q ∧ q)                   [Distributive Law: (A ∨ B) ∧ (A ∨ C) ≡ A ∨ (B ∧ C)]

Step 4: Apply Negation Law to (~q ∧ q):
≡ p ∨ c                          [Negation Law: ~q ∧ q ≡ c (Contradiction)]

Step 5: Apply Identity Law to (p ∨ c):
≡ p                              [Identity Law: p ∨ c ≡ p]

Conclusion:
Left Hand Side simplifies precisely to p. Hence:
~(~p ∧ q) ∧ (p ∨ q) ≡ p (Proved).`,
      'Algebraic simplification using laws of logic is much faster and more scalable than constructing full truth tables.',
      'ڈی مورگن، ڈبل نیگیٹو، ریورس ڈسٹری بیوٹو، اور نیگیشن قانون لگانے سے عبارت p ∨ c بنتی ہے جو کہ آئیڈینٹٹی قانون سے بالآخر p کے برابر ثابت ہو جاتی ہے۔'
    );

    insM3L.run(
      l3Id,
      'Show without using truth tables that ~(p → q) → p is a Tautology. Justify every logical transformation by naming the law applied.',
      `Proof that ~(p → q) → p is a Tautology Without Truth Tables:

Expression: ~(p → q) → p

Step 1: Express conditional p → q using conjunction negation law (p → q ≡ ~(p ∧ ~q)):
≡ ~[~(p ∧ ~q)] → p               [Implication Law: p → q ≡ ~(p ∧ ~q)]

Step 2: Apply Double Negation Law:
≡ (p ∧ ~q) → p                   [Double Negation Law: ~(~A) ≡ A]

Step 3: Transform implication A → B into ~A ∨ B:
≡ ~(p ∧ ~q) ∨ p                  [Implication Law: A → B ≡ ~A ∨ B]

Step 4: Apply De Morgan's Law to ~(p ∧ ~q):
≡ (~p ∨ ~(~q)) ∨ p               [De Morgan's Law]
≡ (~p ∨ q) ∨ p                   [Double Negation Law: ~(~q) ≡ q]

Step 5: Apply Commutative Law to (~p ∨ q):
≡ (q ∨ ~p) ∨ p                   [Commutative Law for ∨]

Step 6: Apply Associative Law for ∨:
≡ q ∨ (~p ∨ p)                   [Associative Law for ∨]

Step 7: Apply Negation Law to (~p ∨ p):
≡ q ∨ t                          [Negation Law: ~p ∨ p ≡ t (Tautology)]

Step 8: Apply Universal Bound Law to (q ∨ t):
≡ t                              [Universal Bound Law: A ∨ t ≡ t]

Conclusion:
Since the final simplified expression evaluates identically to t (Tautology), the statement form ~(p → q) → p is a TAUTOLOGY.`,
      'If p → q is false, p must be true. Therefore, the hypothesis ~(p → q) implies p directly.',
      'ہر قدم پر لاجک قوانین (ڈی مورگن، ایسوسی ایٹو، نیگیشن قانون) کے نفاذ سے مساوات بالآخر t کے برابر آ جاتی ہے جس سے ثابت ہوتا ہے کہ یہ ایک ٹوٹولوجی ہے۔'
    );

    insM3L.run(
      l3Id,
      'List and write the formal algebraic formulas for the fundamental Laws of Logic in propositional calculus.',
      `The Fundamental Laws of Logic:

1. Commutative Laws:
• p ∧ q ≡ q ∧ p
• p ∨ q ≡ q ∨ p

2. Associative Laws:
• (p ∧ q) ∧ r ≡ p ∧ (q ∧ r)
• (p ∨ q) ∨ r ≡ p ∨ (q ∨ r)

3. Distributive Laws:
• p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
• p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)

4. Identity Laws:
• p ∧ t ≡ p  (t is a tautology)
• p ∨ c ≡ p  (c is a contradiction)

5. Negation Laws:
• p ∨ ~p ≡ t
• p ∧ ~p ≡ c

6. Double Negation Law:
• ~(~p) ≡ p

7. Idempotent Laws:
• p ∧ p ≡ p
• p ∨ p ≡ p

8. De Morgan's Laws:
• ~(p ∧ q) ≡ ~p ∨ ~q
• ~(p ∨ q) ≡ ~p ∧ ~q

9. Universal Bound Laws:
• p ∨ t ≡ t
• p ∧ c ≡ c

10. Absorption Laws:
• p ∨ (p ∧ q) ≡ p
• p ∧ (p ∨ q) ≡ p

11. Negation of t and c:
• ~t ≡ c
• ~c ≡ t`,
      'These 11 laws form the complete algebraic foundation for boolean logic and digital circuit design.',
      'یہ 11 قوانین ریاضیاتی منطق کے بنیادی الجبرائی اصول ہیں جن پر بولین الجبرا اور ڈیجیٹل سرکٹس کی بنیاد رکھی گئی ہے۔'
    );
  }

  // ── MGT501: Human Resource Management ─────────────────────────────────────
  let mgt501 = db.prepare(`SELECT id FROM subjects WHERE slug = 'mgt501'`).get() as { id: number } | undefined;
  if (!mgt501) {
    const res = db.prepare(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `).run(
      'Human Resource Management',
      'mgt501',
      'MGT501',
      'Principles and practices of managing human resources, organizational design, staffing, employee motivation, and performance management — Virtual University'
    );
    mgt501 = { id: Number(res.lastInsertRowid) };
  }

  // MGT501 Lecture 1
  const mgt501L1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L1) {
    const l1Res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 1, ?)
    `).run(mgt501.id, 'Introduction to Human Resource Management');
    const l1Id = l1Res.lastInsertRowid;

    const insMgt1 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt1S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt1L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 15 MCQs
    insMgt1.run(
      l1Id,
      'HRM is associated with the management of:',
      JSON.stringify({
        a: 'General people',
        b: 'Financial resources',
        c: 'Organizational people',
        d: 'Community members'
      }),
      'c',
      'HRM specifically focuses on managing people within an organizational setting to achieve strategic goals.',
      'ہیومن ریسورس مینجمنٹ کا تعلق کسی بھی ادارے کے اندر کام کرنے والے ملازمین اور افراد (Organizational people) کو منظم کرنے سے ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Organizational basic components are:',
      JSON.stringify({
        a: 'Machinery, people, office building',
        b: 'People, purpose, structure',
        c: 'People, structure, finances',
        d: 'People, strategies, resources'
      }),
      'b',
      'Every formal organization consists of three essential components: People, Purpose (shared goals), and Structure.',
      'کسی بھی تنظیم کے تین بنیادی اجزاء ہیں: افراد (People)، مشترکہ مقصد (Purpose)، اور باقاعدہ ڈھانچہ (Structure)۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following department of an organization performs the managerial function of matching organizational needs with the skills & abilities of the employees?',
      JSON.stringify({
        a: 'Finance department',
        b: 'Marketing department',
        c: 'Production department',
        d: 'Human Resource department'
      }),
      'd',
      'The HR department ensures that organizational requirements align with the right human skills and competencies.',
      'ہیومن ریسورس ڈپارٹمنٹ تنظیم کی ضروریات کو ملازمین کی صلاحیتوں اور مہارتوں کے ساتھ ہم آہنگ کرتا ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the given statement reflects the Relationship between HRM & Management?',
      JSON.stringify({
        a: 'Both are same',
        b: 'Management is one aspect of HRM',
        c: 'HRM is one aspect of Management',
        d: 'No relationship exists'
      }),
      'c',
      'Management is a broad discipline; managing human resources is one critical dimension of overall management.',
      'مینجمنٹ ایک وسیع شعبہ ہے اور ہیومن ریسورس مینجمنٹ دراصل مجموعی مینجمنٹ کا ایک اہم حصہ (aspect) ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Process of working with different resources to accomplish organizational goals is known as:',
      JSON.stringify({
        a: 'Strategic management',
        b: 'Human Resource management',
        c: 'Management',
        d: 'Team work'
      }),
      'c',
      'Management is defined as the process of planning, organizing, leading, and controlling resources to achieve goals.',
      'مختلف وسائل کے ذریعے تنظیمی مقاصد حاصل کرنے کے عمل کو مینجمنٹ کہا جاتا ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following Management functions are applicable w.r.t HRM?',
      JSON.stringify({
        a: 'Planning, organizing, leading & controlling',
        b: 'Planning & organizing only',
        c: 'Leading & controlling only',
        d: 'None of the management functions applied'
      }),
      'a',
      'HR managers execute all classic managerial functions: planning, organizing, leading, and controlling workforce activities.',
      'ہیومن ریسورس مینجمنٹ میں مینجمنٹ کے تمام بنیادی افعال (Planning, Organizing, Leading اور Controlling) لاگو ہوتے ہیں۔'
    );

    insMgt1.run(
      l1Id,
      'HR managers are generally the _______________ managers:',
      JSON.stringify({
        a: 'Line',
        b: 'Middle',
        c: 'Staff',
        d: 'Top'
      }),
      'c',
      'HR managers primarily serve in a staff/advisory role, providing expert guidance and support to line managers.',
      'ایچ آر مینیجرز بنیادی طور پر سٹاف (Staff) مینیجرز ہوتے ہیں جو لائن مینیجرز کو مشورہ اور تکنیکی رہنمائی فراہم کرتے ہیں۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following is NOT a goal of HRM?',
      JSON.stringify({
        a: 'Integration of HRM with the corporate strategy of the organization',
        b: "Producing the desired human behavior that helps to achieve the organization's goals",
        c: 'Creation of a flexible environment that can easily adopt change',
        d: 'To endure proper delivery of products'
      }),
      'd',
      'Product delivery and logistics are operational/supply chain functions, not primary goals of Human Resource Management.',
      'پروڈکٹس کی بروقت ترسیل (delivery) آپریشنل شعبے کا کام ہے، یہ ایچ آر کا بنیادی مقصد نہیں ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Effective HRM leads to:',
      JSON.stringify({
        a: 'Organizational success',
        b: 'Organizational failure',
        c: 'Organizational complexity',
        d: 'Organizational inefficiency'
      }),
      'a',
      'Sound HRM practices directly foster high employee motivation, superior productivity, and long-term organizational success.',
      'موثر ایچ آر ایم ملازمین کی صلاحیتوں اور لگن کو بڑھا کر تنظیم کو کامیابی اور ترقی سے ہمکنار کرتی ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Human resource management is a part of management that is concerned with ________ dimension.',
      JSON.stringify({
        a: 'Technology',
        b: 'People',
        c: 'Financial',
        d: 'Asset'
      }),
      'b',
      'HRM is specifically focused on the human or people dimension of organizations.',
      'ہیومن ریسورس مینجمنٹ، مینجمنٹ کا وہ شعبہ ہے جو تنظیم کے انسانی پہلو (People dimension) کی دیکھ بھال کرتا ہے۔'
    );

    insMgt1.run(
      l1Id,
      '_________ is the process of acquiring, training, appraising and compensating employees, attending to their labor relations, health and safety and fairness concerns.',
      JSON.stringify({
        a: 'Labor Relations',
        b: 'Organizational Behavior',
        c: 'Human Resource Management',
        d: 'Organizational Health and Safety Management'
      }),
      'c',
      'This is the comprehensive Gary Dessler definition of Human Resource Management (HRM).',
      'ملازمین کی بھرتی، تربیت، کارکردگی کا جائزہ، معاوضہ، اور صحت و حفاظت کے امور کو منظم کرنے کا عمل ہیومن ریسورس مینجمنٹ کہلاتا ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following is the main responsibility of an HR department?',
      JSON.stringify({
        a: 'Attracting candidates for job',
        b: 'Ensure staff development',
        c: 'Keep employees motivated',
        d: 'All of the given options'
      }),
      'd',
      'The HR department is responsible for talent acquisition, employee training/development, and sustained employee motivation.',
      'ملازمین کو بھرتی کرنا، ان کی پیشہ ورانہ ترقی کو یقینی بنانا، اور انہیں متحرک رکھنا سب ایچ آر ڈیپارٹمنٹ کی اہم ذمہ داریاں ہیں۔'
    );

    insMgt1.run(
      l1Id,
      'Which basic function of management includes carrying out the staffing (people) aspect of a management position?',
      JSON.stringify({
        a: 'Planning',
        b: 'Organizing',
        c: 'Staffing',
        d: 'Controlling'
      }),
      'c',
      'Staffing is the management function specifically concerned with hiring, training, and retaining employees.',
      'سٹافنگ (Staffing) مینجمنٹ کا وہ بنیادی فعل ہے جو تنظیم میں ملازمین کی بھرتی اور تربیت کے لیے مختص ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following is NOT a function of Human Resource Management (HRM)?',
      JSON.stringify({
        a: 'To Attract People',
        b: 'To Develop People',
        c: 'To Motivate People',
        d: 'None of these'
      }),
      'd',
      'Attracting, developing, and motivating employees are all core functions of HRM, so none of these is an excluded function.',
      'افراد کو متوجہ کرنا، ان کی صلاحیتیں نکھارنا، اور انہیں متحرک رکھنا سب ایچ آر کے بنیادی افعال ہیں، لہٰذا درست جواب "None of these" ہے۔'
    );

    insMgt1.run(
      l1Id,
      'Which of the following is a reason for the growing importance of HRM?',
      JSON.stringify({
        a: 'Organizations can ignore employee needs',
        b: "Success depends on people's skills, knowledge, and abilities",
        c: 'HR costs are decreasing naturally',
        d: 'Technological automation eliminates the need for workforce management'
      }),
      'b',
      'In the modern knowledge economy, sustainable competitive advantage stems from employee talent, knowledge, and abilities.',
      'جدید دور میں تنظیموں کی کامیابی کا دارومدار ملازمین کی مہارتوں، علم اور صلاحیتوں پر ہے، اسی لیے ایچ آر ایم کی اہمیت میں اضافہ ہوا ہے۔'
    );

    // 5 Short Questions (3 marks each)
    insMgt1S.run(
      l1Id,
      'What is Human Resource Management (HRM)? / Describe HRM.',
      `Human Resource Management (HRM) is the strategic process of managing an organization's human capital. It involves:
1. Acquiring (recruiting and selecting qualified employees)
2. Training and Developing (building essential skills and capabilities)
3. Appraising and Compensating (evaluating performance and providing fair rewards)
4. Maintaining Labor Relations (ensuring employee health, safety, and workplace fairness).`,
      'HRM focuses on aligning employee capabilities with strategic business goals.',
      'ہیومن ریسورس مینجمنٹ ملازمین کو بھرتی کرنے، تربیت دینے، کارکردگی کا جائزہ لینے اور منصفانہ معاوضہ فراہم کرنے کا باقاعدہ اور سائنسی عمل ہے۔'
    );

    insMgt1S.run(
      l1Id,
      'Why are we concerned about Human Resource Management?',
      `Organizations are concerned about HRM because people are the most valuable and critical asset of any organization:
1. Avoid Costly Mistakes: Prevents hiring the wrong people, experiencing high employee turnover, and facing legal employment disputes.
2. Competitive Advantage: Technological resources and capital can be replicated, but talented and committed human capital cannot be easily duplicated.
3. Goal Achievement: Efficient management of people ensures maximum productivity, job satisfaction, and long-term organizational success.`,
      'Without effective HRM, organizations fail to harness their employees potential.',
      'ہم ایچ آر ایم پر اس لیے توجہ دیتے ہیں تاکہ غلط ملازمین کے انتخاب سے بچیں، ٹرن اوور کم کریں، اور باصلاحیت افرادی قوت کے ذریعے مسابقتی برتری حاصل کریں۔'
    );

    insMgt1S.run(
      l1Id,
      'What are the three basic components of an Organization?',
      `Every formal organization consists of three foundational components:
1. People: The workforce (employees and managers) whose collective efforts drive the organization forward.
2. Purpose (or Goal): The shared vision, mission, and distinct objectives the organization strives to achieve.
3. Structure: The systematic framework and division of labor that defines roles, reporting relationships, authority, and accountability.`,
      'An organization cannot exist without people pursuing a shared purpose within an organized structure.',
      'ہر تنظیم تین اجزاء پر مشتمل ہوتی ہے: افراد (People)، مشترکہ مقصد (Purpose)، اور باقاعدہ تنظیمی ڈھانچہ (Structure)۔'
    );

    insMgt1S.run(
      l1Id,
      'What are the five basic functions of management and how do they relate to HRM?',
      `The five basic managerial functions and their HRM application:
1. Planning: Forecasting workforce needs and setting departmental objectives.
2. Organizing: Designing job structures and delegating tasks to employees.
3. Staffing: Recruiting, interviewing, selecting, and placing qualified personnel.
4. Leading: Motivating employees, building team morale, and resolving conflicts.
5. Controlling: Setting performance standards, appraising results, and applying corrective actions.`,
      'HR managers apply all five classic management functions directly to managing the workforce.',
      'مینجمنٹ کے پانچ بنیادی افعال (پلاننگ، آرگنائزنگ، سٹافنگ، لیڈنگ اور کنٹرولنگ) ملازمین کے نظم و نسق پر براہِ راست لاگو ہوتے ہیں۔'
    );

    insMgt1S.run(
      l1Id,
      'Enumerate the core functions performed by a Human Resource Management department.',
      `The core functions of an HRM department are:
1. Staffing / Employment: Job analysis, recruitment, candidate screening, and selection.
2. Training and Development: Employee orientation, technical skill training, and career progression.
3. Compensation and Benefits: Designing fair wage structures, incentive bonuses, and healthcare benefits.
4. Employee and Labor Relations: Addressing grievances, maintaining labor law compliance, and union negotiations.
5. Health, Safety, and Security: Ensuring safe working conditions and employee wellness.`,
      'Core HRM functions span the entire lifecycle of an employee within the organization.',
      'ایچ آر ڈیپارٹمنٹ ملازمین کی بھرتی، تربیت و ترقی، تنخواہوں اور مراعات کا تعین، اور ملازمتی تعلقات کی دیکھ بھال کرتا ہے۔'
    );

    // 2 Long Questions (5 marks each)
    insMgt1L.run(
      l1Id,
      'What relationship exists between human resource manager and company profits? Explain with examples from real life.',
      `Relationship Between HR Managers and Company Profits:

1. Talent Acquisition & Placement:
• Putting the right person in the right job boosts operational productivity and reduces costly hiring errors.
• Example: Hiring a top-tier software developer delivers reliable software faster, directly driving company revenue.

2. Cost Reduction Through Retention:
• High employee turnover incurs enormous replacement, onboarding, and training costs. Effective HR retention programs preserve capital.
• Example: Comprehensive healthcare and retention bonuses prevent key sales executives from defecting to competitors.

3. Performance-Driven Incentive Systems:
• Linking bonuses and commissions to measurable business targets motivates teams to exceed productivity and sales benchmarks.
• Example: A performance-based commission structure in retail pushes sales volumes and expands bottom-line profit margins.

4. Employee Training & Skill Enhancement:
• Continuous training elevates output quality, minimizes operational waste, and prevents costly manufacturing defects.

Conclusion:
HR is not merely an administrative cost center; it is a strategic business partner that directly impacts organizational profitability through workforce efficiency.`,
      'Effective HR practices reduce turnover expenses, eliminate operational errors, and maximize revenue per employee.',
      'ایچ آر مینیجر صحیح افراد کے انتخاب، ملازمین کی تربیت، اور کارکردگی پر مبنی مراعات کے ذریعے اخراجات کم کرتا ہے اور کمپنی کے منافع کو براہِ راست بڑھاتا ہے۔'
    );

    insMgt1L.run(
      l1Id,
      'Explain in detail why Human Resource Management has become increasingly important for modern organizations. Discuss the key factors contributing to its growing importance.',
      `Key Factors Contributing to the Growing Importance of HRM:

1. Rise of the Knowledge Economy:
• Intellectual capital, specialized skills, and innovation have replaced physical machinery as the primary drivers of corporate value.

2. Rapid Technological & Digital Changes:
• Technological advancements require ongoing workforce upskilling and continuous adaptation to changing tools and automation.

3. Globalization & Workforce Diversity:
• Expanding global markets demand managing diverse teams across cultural, demographic, and regulatory boundaries.

4. Legal Compliance & Employment Regulations:
• Modern labor laws, anti-discrimination statutes, and workplace safety mandates require specialized HR oversight to mitigate legal liability.

5. Talent Scarcity & Employee Expectations:
• Attracting and retaining top talent requires flexible work cultures, fair compensation, and clear career development pathways.

Summary:
Modern HRM has transformed from traditional personnel administration into a core strategic driver essential for organizational survival and sustained competitive advantage.`,
      'HRM is crucial today because modern competitive advantage is built on intellectual capital and human talent.',
      'معلومات پر مبنی معیشت، تیز رفتار تکنیکی تبدیلیاں، عالمگیریت، اور قانونی تقاضے جدید تنظیموں میں ایچ آر ایم کو ناگزیر بناتے ہیں۔'
    );
  }

  // MGT501 Lecture 2: Essentials of Management
  const mgt501L2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L2) {
    const l2Res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 2, ?)
    `).run(mgt501.id, 'Essentials of Management');
    const l2Id = l2Res.lastInsertRowid;

    const insMgt2 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt2S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt2L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 17 MCQs
    insMgt2.run(
      l2Id,
      'Term "Efficiency" is reflected by which of the following statement? / "Efficiency" is said to be achieved when:',
      JSON.stringify({
        a: 'Achieve organizational goals',
        b: 'Achieve most output with least input / Doing things right',
        c: 'Achieve most output with less time',
        d: 'Achieve mass production'
      }),
      'b',
      'Efficiency refers to doing things right and getting the most output from the least amount of input (minimizing resource waste).',
      'ایفیشنسی (Efficiency) کا مطلب کم سے کم وسائل اور لاگت میں زیادہ سے زیادہ پیداوار حاصل کرنا یعنی "Doing things right" ہے۔'
    );

    insMgt2.run(
      l2Id,
      '"Effectiveness" is represented by:',
      JSON.stringify({
        a: 'Doing things before time',
        b: 'Doing right things right / Achieving organizational goals',
        c: 'Doing things in minimum time',
        d: 'Doing things with minimum resources'
      }),
      'b',
      'Effectiveness means doing the right things—completing activities that directly contribute to achieving organizational goals.',
      'ایفیکٹیونس (Effectiveness) کا مطلب تنظیمی اہداف کو حاصل کرنا یعنی صحیح کام انجام دینا (Doing the right things) ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Conceptual skills are required mostly by: / Which of the following skills are required most by the Top-level managers?',
      JSON.stringify({
        a: 'First-line managers',
        b: 'Middle-level managers',
        c: 'Top-level managers',
        d: 'Functional-level managers'
      }),
      'c',
      'Top-level managers require high conceptual skills to see the organization as a whole and formulate long-term strategic plans.',
      'اعلیٰ سطح کے مینیجرز (Top-level managers) کو پوری تنظیم کو ایک جامع تناظر میں دیکھنے اور حکمت عملی بنانے کے لیے کانسیپچوئل اسکلز کی سب سے زیادہ ضرورت ہوتی ہے۔'
    );

    insMgt2.run(
      l2Id,
      'The ability to think about abstract & complex situations is referred to as:',
      JSON.stringify({
        a: 'Mechanical skill',
        b: 'Technical skill',
        c: 'Interpersonal skill',
        d: 'Conceptual skill'
      }),
      'd',
      'Conceptual skills allow managers to analyze complex problems, understand relationships among subsystems, and devise abstract models.',
      'پیچیدہ، تجریدی اور غیر واضح حالات کو سمجھنے اور حل تلاش کرنے کی ذہنی صلاحیت کو کانسیپچوئل اسکل (Conceptual skill) کہا جاتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'How many levels of management are in a traditional organization?',
      JSON.stringify({
        a: '3',
        b: '4',
        c: '5',
        d: '8'
      }),
      'a',
      'Traditional organizational hierarchies consist of 3 distinct management levels: Top Management, Middle Management, and First-line / Operational Management.',
      'روایتی تنظیموں میں مینجمنٹ کے تین درجے ہوتے ہیں: ٹاپ مینجمنٹ، مڈل مینجمنٹ، اور فرسٹ لائن (آپریشنل) مینجمنٹ۔'
    );

    insMgt2.run(
      l2Id,
      'Who is responsible to take corrective actions in response to unforeseen problems?',
      JSON.stringify({
        a: 'Liaison',
        b: 'Disturbance-handler',
        c: 'Figurehead',
        d: 'Spokesperson'
      }),
      'b',
      'Under Mintzberg’s decisional roles, the Disturbance Handler takes corrective action when the organization faces unexpected crises or obstacles.',
      'منٹزبرگ کے فریم ورک کے مطابق ڈسٹربنس ہینڈلر (Disturbance-handler) غیر متوقع مسائل اور بحرانوں کے وقت فوری اصلاحی کارروائی کرتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Under which of the following role, manager discusses issues and bargains with other units to gain advantages for their own unit?',
      JSON.stringify({
        a: 'Negotiator',
        b: 'Spokesperson',
        c: 'Disseminator',
        d: 'Entrepreneur'
      }),
      'a',
      'In the Negotiator role (a decisional role), managers participate in negotiations with suppliers, unions, or other units to secure advantages.',
      'مذاکرات کار (Negotiator) کے کردار میں مینیجر اپنے یونٹ کے فائدے کے لیے دوسرے اداروں یا شعبوں کے ساتھ بات چیت اور سودے بازی کرتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Being a Figurehead, manager has to perform which of the following role?',
      JSON.stringify({
        a: 'Informational roles',
        b: 'Decisional roles',
        c: 'Interpersonal roles',
        d: 'Sequential roles'
      }),
      'c',
      'Mintzberg classifies Figurehead, Leader, and Liaison as the three Interpersonal roles of management.',
      'فگر ہیڈ (Figurehead) کا تعلق منٹزبرگ کے انٹرپرسنل رولز (Interpersonal roles) سے ہے جس میں رسمی، علامتی اور سماجی فرائض نبھائے جاتے ہیں۔'
    );

    insMgt2.run(
      l2Id,
      'Which of the following role a manager performs as a Resource allocator?',
      JSON.stringify({
        a: 'Interpersonal role',
        b: 'Decisional role',
        c: 'Informational role',
        d: 'Supportive role'
      }),
      'b',
      'Resource Allocator is one of the four Decisional roles where the manager decides who gets what organizational resources (budget, time, personnel).',
      'وسائل تقسیم کنندہ (Resource allocator) کا کردار منٹزبرگ کے ڈیسینل رولز (Decisional roles) کے تحت آتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Who collects information from institutions & organizations outside their own, and facilitates the organizational personnel with that gathered information?',
      JSON.stringify({
        a: 'Monitor',
        b: 'Liaison',
        c: 'Disseminator',
        d: 'Figurehead'
      }),
      'c',
      'The Disseminator role transmits external or internal information to subordinates who would otherwise lack access to it.',
      'ڈیسیمینیٹر (Disseminator) بیرونی ذرائع سے معلومات اکٹھی کر کے ادارے کے متعلقہ ملازمین اور عملے تک پہنچاتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      '_________ is termed as the "right arm of the top executive."',
      JSON.stringify({
        a: 'Staff manager',
        b: 'Line manager',
        c: 'Personnel manager',
        d: 'Secretary'
      }),
      'c',
      'The Personnel (HR) Manager is traditionally described as the right arm of top executives because of their strategic counsel on people matters.',
      'پرسونل مینیجر (Personnel manager) کو اعلیٰ انتظامیہ کا بااعتماد مشیر اور "right arm" قرار دیا جاتا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Which of the following managers assist the line managers by providing them advice while taking major decisions / referred as service providers?',
      JSON.stringify({
        a: 'Line',
        b: 'Staff',
        c: 'Functional',
        d: 'Operational'
      }),
      'b',
      'Staff managers hold advisory authority, supporting and assisting line managers with specialized expertise (e.g., HR, legal).',
      'سٹاف مینیجرز (Staff managers) لائن مینیجرز کو تکنیکی مشورے، تحقیق اور خدمات فراہم کر کے فیصلے کرنے میں مدد دیتے ہیں۔'
    );

    insMgt2.run(
      l2Id,
      'Authority is classified among _____ levels of categories:',
      JSON.stringify({
        a: 'Two',
        b: 'Three',
        c: 'Four',
        d: 'Six'
      }),
      'b',
      'Organizational authority is categorized into three types: Line Authority, Staff Authority, and Functional Authority.',
      'اختیارات (Authority) کو تین اقسام میں تقسیم کیا جاتا ہے: لائن اتھارٹی، سٹاف اتھارٹی، اور فنکشنل اتھارٹی۔'
    );

    insMgt2.run(
      l2Id,
      'Which type of managers serve as a link between management & non-management personnel?',
      JSON.stringify({
        a: 'Strategic managers',
        b: 'Tactical managers',
        c: 'Operational managers',
        d: 'Staff managers'
      }),
      'c',
      'First-line / Operational managers directly supervise operating employees, acting as the direct link between workers and management.',
      'آپریشنل یا فرسٹ لائن مینیجرز کارکنوں (non-management personnel) اور اعلیٰ انتظامیہ کے درمیان رابطے کا پل ہوتے ہیں۔'
    );

    insMgt2.run(
      l2Id,
      'Type of managers who least need the technical skills are:',
      JSON.stringify({
        a: 'Middle-level',
        b: 'Line-level',
        c: 'Top-level',
        d: 'All of the given options'
      }),
      'c',
      'Top-level managers focus on strategy, organizational vision, and external environment, requiring the least hands-on technical skills.',
      'اعلیٰ ترین انتظامیہ (Top-level managers) کو حکمت عملی اور پالیسی سازی پر توجہ دینے کی وجہ سے تکنیکی مہارتوں کی سب سے کم ضرورت ہوتی ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Terms "Interpersonal skills" and "Human skills" are used for:',
      JSON.stringify({
        a: 'Two different skills',
        b: 'Different managerial skills',
        c: 'Operational skills',
        d: 'Same managerial skills'
      }),
      'd',
      'Interpersonal skills and Human skills are synonymous terms for the ability to work with, understand, and motivate other people.',
      'انٹرپرسنل اسکلز اور ہیومن اسکلز ایک ہی مہارت کے لیے متبادل کے طور پر استعمال ہونے والے الفاظ ہیں جن کا مطلب لوگوں کے ساتھ مل کر کام کرنا ہے۔'
    );

    insMgt2.run(
      l2Id,
      'Resources are allocated & assigned while:',
      JSON.stringify({
        a: 'Planning & Organizing',
        b: 'Leading & Controlling',
        c: 'Organizing & Controlling',
        d: 'Controlling & Planning'
      }),
      'a',
      'Determining what resources are needed occurs in Planning, and assigning and structuring those resources occurs in Organizing.',
      'وسائل کی منصوبہ بندی اور ان کی باقاعدہ تفویض کا عمل پلاننگ (Planning) اور آرگنائزنگ (Organizing) کے مراحل میں طے پاتا ہے۔'
    );

    // 5 Short Questions (3 marks each)
    insMgt2S.run(
      l2Id,
      'Differentiate between Efficiency and Effectiveness in an organizational context.',
      `Difference Between Efficiency and Effectiveness:

1. Efficiency ("Doing things right"):
• Focus: Minimizing resource inputs while maximizing outputs.
• Metric: Resource utilization, cost reduction, and waste elimination.
• Question: "Are we doing this task with the minimum input of time, money, and materials?"

2. Effectiveness ("Doing the right things"):
• Focus: Achieving organizational goals and desired results.
• Metric: Goal attainment, customer satisfaction, and strategic success.
• Question: "Are we doing the right tasks that lead to organizational success?"

Summary:
Efficiency is about means (how resources are used), whereas Effectiveness is about ends (whether goals are reached). High-performing organizations require both.`,
      'Efficiency minimizes waste (means), whereas effectiveness achieves strategic goals (ends).',
      'ایفیشنسی کا مطلب کم وسائل میں زیادہ کام (Doing things right) ہے، جبکہ ایفیکٹیونس کا مطلب درست اہداف حاصل کرنا (Doing the right things) ہے۔'
    );

    insMgt2S.run(
      l2Id,
      'What are the three basic sets of Managerial Skills required at different levels of management?',
      `The Three Basic Managerial Skills (Robert Katz Model):

1. Technical Skills:
• Specialized knowledge, proficiency, and techniques required to perform specific operational tasks. Most critical for first-line/operational managers.

2. Human / Interpersonal Skills:
• The ability to work well with, understand, communicate with, and motivate people individually and in groups. Equally crucial across all levels of management.

3. Conceptual Skills:
• The mental capacity to analyze complex situations, see the organization as a unified whole, and plan strategically. Most essential for top-level managers.`,
      'Technical skills are crucial at lower levels, human skills at all levels, and conceptual skills at top levels.',
      'تین بنیادی انتظامی مہارتیں ہیں: ٹیکنیکل اسکلز (تکنیکی علم)، ہیومن اسکلز (افراد سے برتاؤ)، اور کانسیپچوئل اسکلز (جامع اور تجریدی سوچ)۔'
    );

    insMgt2S.run(
      l2Id,
      'Enlist and briefly describe the three Interpersonal Roles of a manager according to Mintzberg.',
      `Mintzberg's Three Interpersonal Roles:

1. Figurehead:
• Performs symbolic, ceremonial, and legal duties required by social position (e.g., attending ribbon-cutting events, signing official documents).

2. Leader:
• Directs, trains, coordinates, and motivates subordinates; aligns individual performance with team and departmental objectives.

3. Liaison:
• Establishes and maintains networks of contacts and information sources outside the immediate vertical chain of command to gather vital intelligence.`,
      'Interpersonal roles involve providing information and ideas through human relationships and ceremonial authority.',
      'منٹزبرگ کے تین انٹرپرسنل رولز: فگر ہیڈ (رسمی اور علامتی فرائض)، لیڈر (رہنمائی اور ترغیب)، اور لائیزن (بیرونی رابطے اور نیٹ ورکنگ)۔'
    );

    insMgt2S.run(
      l2Id,
      'Explain the difference between Line Managers and Staff Managers.',
      `Difference Between Line Managers and Staff Managers:

1. Line Managers:
• Direct Authority: Hold legitimate authority to direct work and issue orders down the chain of command.
• Responsibility: Directly responsible for core operations that produce and deliver products or services (e.g., Production, Sales).
• Impact: Directly drive primary revenue-generating activities.

2. Staff Managers:
• Advisory Authority: Possess specialized advisory and supportive authority.
• Responsibility: Support, assist, and advise line managers with specialized expertise (e.g., Human Resources, Legal, Accounting).
• Impact: Indirectly contribute by enabling line units to operate smoothly and legally.`,
      'Line managers make operational decisions and issue commands; staff managers provide advisory expertise and support services.',
      'لائن مینیجرز براہِ راست احکامات جاری کرتے ہیں اور بنیادی پیداواری کاموں کے ذمہ دار ہوتے ہیں، جبکہ سٹاف مینیجرز ماہرانہ مشورے اور خدمات فراہم کرتے ہیں۔'
    );

    insMgt2S.run(
      l2Id,
      'Define the four Decisional Roles performed by a manager.',
      `Mintzberg's Four Decisional Roles:

1. Entrepreneur:
• Initiates and designs organizational change, innovation, and new business projects to exploit emerging opportunities.

2. Disturbance Handler:
• Resolves unexpected conflicts, crises, strikes, or supply chain breakdowns to restore operational stability.

3. Resource Allocator:
• Decides how organizational resources (budgets, workforce, facilities, time) are scheduled and distributed across departments.

4. Negotiator:
• Represents the department or organization in vital bargaining situations with suppliers, clients, labor unions, or internal units.`,
      'Decisional roles involve using collected information to make significant choices and resource commitments.',
      'منٹزبرگ کے چار ڈیسینل رولز: آنٹرپرینیور (جدت پسندی)، ڈسٹربنس ہینڈلر (بحرانوں کا حل)، ریسورس ایلوکیٹر (وسائل کی تقسیم)، اور نیگوشی ایٹر (مذاکرات اور سودے بازی)۔'
    );

    // 2 Long Questions (5 marks each)
    insMgt2L.run(
      l2Id,
      'Explain in detail Mintzberg’s 10 Managerial Roles categorized under Interpersonal, Informational, and Decisional roles with suitable examples.',
      `Henry Mintzberg's 10 Managerial Roles:

I. Interpersonal Roles (Involving Human Interactions & Formal Status):
1. Figurehead: Performing ceremonial and legal duties (e.g., cutting the ribbon at a factory opening, presenting employee long-service awards).
2. Leader: Motivating, coaching, and supervising employees (e.g., conducting annual appraisals, inspiring the sales team).
3. Liaison: Building and maintaining external communication networks (e.g., attending industry conventions, networking with government officials).

II. Informational Roles (Receiving & Transmitting Knowledge):
4. Monitor: Continuously scanning the internal and external environment for vital information (e.g., reviewing competitor sales reports, industry news).
5. Disseminator: Transmitting privileged or critical external information internally to team members (e.g., briefing staff on new labor legislation).
6. Spokesperson: Conveying official company stances and performance metrics to external stakeholders (e.g., conducting press conferences, addressing shareholders).

III. Decisional Roles (Using Information to Commit Organizational Resources):
7. Entrepreneur: Seeking out business opportunities and initiating improvement projects (e.g., launching an AI customer service pilot).
8. Disturbance Handler: Taking immediate corrective measures when facing unforeseen crises (e.g., handling supplier strikes, product recalls).
9. Resource Allocator: Approving project budgets, equipment purchases, and staffing schedules (e.g., deciding which product line gets 60% of marketing budget).
10. Negotiator: Bargaining with internal or external entities to secure mutual agreements (e.g., negotiating collective bargaining agreements with labor unions).

Conclusion:
These 10 roles are not separate entities; they form an integrated behavioral continuum performed dynamically by effective managers.`,
      'Mintzberg identified 10 roles across 3 categories: Interpersonal (3), Informational (3), and Decisional (4).',
      'منٹزبرگ کے 10 کردار تین کیٹیگریز میں منقسم ہیں: انٹرپرسنل رولز (3)، انفارمیشنل رولز (3)، اور ڈیسینل رولز (4)۔ یہ مل کر مینیجر کی مجموعی ذمہ داریاں بناتے ہیں۔'
    );

    insMgt2L.run(
      l2Id,
      'Discuss the four basic functions of the Management Process (Planning, Organizing, Leading, Controlling) and explain how managerial skill requirements shift across the three levels of management (Top, Middle, First-line).',
      `The Management Process & Skill Shift Across Levels:

PART A: The Four Functions of Management (POLC):
1. Planning: Defining organizational goals, formulating strategies, and developing coordinated action plans to achieve objectives.
2. Organizing: Designing jobs, establishing formal organizational structure, allocating resources, and defining reporting relationships.
3. Leading: Motivating employees, directing activities, selecting effective communication channels, and resolving group conflicts.
4. Controlling: Monitoring performance against established standards, comparing actual outcomes, and taking corrective actions.

PART B: Shift in Managerial Skills Across Hierarchical Levels:
1. Top Management (CEOs, Presidents, Board Members):
• Skill Mix: High Conceptual Skills, Moderate-to-High Human Skills, Low Technical Skills.
• Rationale: Top executives focus on organizational survival, corporate vision, competitive positioning, and long-range strategic goals.

2. Middle Management (Department Heads, Plant Managers, Regional Directors):
• Skill Mix: Balanced Conceptual, High Human, Moderate Technical Skills.
• Rationale: Middle managers bridge strategy and day-to-day execution; strong interpersonal skills are needed to coordinate horizontally and vertically.

3. First-Line / Operational Management (Supervisors, Team Leads, Foremen):
• Skill Mix: High Technical Skills, High Human Skills, Low Conceptual Skills.
• Rationale: They directly guide workers, requiring technical competence to troubleshoot machinery, explain tasks, and enforce safety protocols.

Summary:
While Human Skills remain universally critical at every tier, Technical skills diminish and Conceptual skills become predominant as managers ascend the organizational hierarchy.`,
      'Conceptual skills dominate at top management, while technical skills are essential at first-line management; human skills are critical at all levels.',
      'مینجمنٹ کے چار مراحل (پلاننگ، آرگنائزنگ، لیڈنگ، کنٹرولنگ) کے ساتھ ساتھ انتظامی مہارتوں کی ضرورت درجہ بندی کے لحاظ سے بدلتی ہے: ٹاپ مینیجرز کو کانسیپچوئل، مڈل کو متوازن، اور فرسٹ لائن کو ٹیکنیکل اسکلز کی ضرورت ہوتی ہے۔'
    );
  }

  // MGT501 Lecture 3: Organization and Components of Organization
  const mgt501L3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L3) {
    const l3Res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 3, ?)
    `).run(mgt501.id, 'Organization and Components of Organization');
    const l3Id = l3Res.lastInsertRowid;

    const insMgt3 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt3S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt3L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 15 MCQs
    insMgt3.run(
      l3Id,
      'Organization is said to be an open system, because:',
      JSON.stringify({
        a: 'It operates within an environment',
        b: 'It operates in isolation',
        c: 'Its activities are random',
        d: 'Its activities are independent'
      }),
      'a',
      'An open system interacts dynamically with its external environment, taking in inputs and exporting outputs.',
      'اوپن سسٹم (Open system) اس لیے کہا جاتا ہے کیونکہ یہ اپنے بیرونی ماحول کے ساتھ تعامل کرتا ہے اور ماحول کے زیرِ اثر کام کرتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'As organizational activities are interrelated, it is said to be: / Which of the following system represents interrelated activities?',
      JSON.stringify({
        a: 'A closed system',
        b: 'An isolated system',
        c: 'An open system',
        d: 'A clogged system'
      }),
      'c',
      'An open system consists of interrelated and interdependent components working together within an external environment.',
      'تنظیم کے تمام شعبے اور سرگرمیاں آپس میں منسلک ہوتی ہیں، اس لیے اسے ایک اوپن سسٹم (Open system) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'A system that prohibits interaction with the world outside is termed as:',
      JSON.stringify({
        a: 'Closed System',
        b: 'Open System',
        c: 'Isolated System',
        d: 'Dynamic System'
      }),
      'a',
      'A closed system is self-contained and completely isolated from any interaction with its external environment.',
      'ایک ایسا نظام جو بیرونی دنیا سے بالکل کٹا ہوا ہو اور کسی قسم کا تعامل نہ کرے اسے کلوزڈ سسٹم (Closed System) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Which of the following structure is formed to facilitate the work flow for goals achievement?',
      JSON.stringify({
        a: 'Society',
        b: 'Organization',
        c: 'Union',
        d: 'Government'
      }),
      'b',
      'An organization is a systematically structured entity designed to coordinate workflow and achieve specific goals.',
      'تنظیمی مقاصد کو حاصل کرنے اور کام کی روانی (workflow) کو منظم کرنے کے لیے تنظیم (Organization) کا ڈھانچہ بنایا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'The intellectual and mechanical processes used by an organization to transform inputs into products or services is called:',
      JSON.stringify({
        a: 'Task',
        b: 'People',
        c: 'Structure',
        d: 'Technology'
      }),
      'd',
      'Technology encompasses the knowledge, intellectual processes, tools, and machinery used to convert inputs into outputs.',
      'خام مال اور وسائل کو تیار مصنوعات یا خدمات میں تبدیل کرنے والے فکری اور مشینی عمل کو ٹیکنالوجی (Technology) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Organizations take inputs from:',
      JSON.stringify({
        a: 'Rules & policies',
        b: 'Internal environment',
        c: 'External environment',
        d: 'Legislations & litigations'
      }),
      'c',
      'Under the systems view, organizations draw all inputs (raw materials, capital, labor, information) from the external environment.',
      'تنظیم تمام ضروری وسائل (خام مال، سرمایہ، انسانی محنت اور معلومات) بیرونی ماحول (External environment) سے حاصل کرتی ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Management sciences department is one of the _______________ of the VU:',
      JSON.stringify({
        a: 'System',
        b: 'Subsystem',
        c: 'Board',
        d: 'Structure'
      }),
      'b',
      'A department within a larger university system functions as an interdependent subsystem.',
      'ورچوئل یونیورسٹی ایک مکمل سسٹم ہے اور شعبہ مینجمنٹ سائنسز اس کا ایک ماتحت ذیلی نظام یعنی سب سسٹم (Subsystem) ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Organization has legitimacy and rationale configuration that is why it is said to be a/an:',
      JSON.stringify({
        a: 'Formal organization',
        b: 'Informal organization',
        c: 'Virtual organization',
        d: 'Learning organization'
      }),
      'a',
      'A formal organization has legal existence, official structure, defined authority, and rational administrative design.',
      'قانونی جواز اور منطقی و باضابطہ ڈھانچہ رکھنے کی وجہ سے اسے فارمل آرگنائزیشن (Formal organization) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Unofficial part of an organization is known as:',
      JSON.stringify({
        a: 'Formal organization',
        b: 'Informal organization',
        c: 'Virtual organization',
        d: 'Social organization'
      }),
      'b',
      'The informal organization refers to the spontaneous personal and social network that develops naturally among employees.',
      'تنظیم کے اندر ملازمین کے درمیان غیر رسمی، ذاتی اور دوستانہ تعلقات کے نیٹ ورک کو انفارمل آرگنائزیشن (Informal organization) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'The term "People" is one of the components of an organization which refers to:',
      JSON.stringify({
        a: 'Society',
        b: 'Customers',
        c: 'Human resource',
        d: 'Stakeholders'
      }),
      'c',
      'In organizational components, "People" specifically denotes the human resource workforce employed by the enterprise.',
      'تنظیم کے بنیادی اجزاء میں لفظ "People" سے مراد ادارے میں کام کرنے والے ملازمین یعنی ہیومن ریسورس (Human resource) ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Which of the following defines the levels of authority to perform the assigned tasks? / Which of the following term is said to be a part of Organizational Structure?',
      JSON.stringify({
        a: 'Labor union',
        b: "Competitor's threat",
        c: 'Organizational structure / Hierarchy level',
        d: 'Pressure group'
      }),
      'c',
      'Organizational structure establishes hierarchy, levels of authority, and reporting relationships across the workforce.',
      'آرگنائزیشنل اسٹرکچر اور ہائیرارکی (Hierarchy) ملازمین کے اختیارات کی سطحوں اور رپورٹنگ کے طریقہ کار کو متعین کرتی ہے۔'
    );

    insMgt3.run(
      l3Id,
      'The whole is greater than the sum of its parts is known as:',
      JSON.stringify({
        a: 'Efficiency',
        b: 'Effectiveness',
        c: 'Productivity',
        d: 'Synergy'
      }),
      'd',
      'Synergy states that when subsystems work collaboratively, their joint output exceeds the sum of individual separate efforts (2 + 2 = 5 effect).',
      'جب تمام ذیلی شعبے مل کر کام کریں اور مجموعی نتیجہ انفرادی کوششوں کے مجموعے سے زیادہ ہو (2 + 2 = 5)، تو اسے سِینرجی (Synergy) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Essential component of an organization is:',
      JSON.stringify({
        a: 'Team',
        b: 'Structure',
        c: 'Individual',
        d: 'None of the given options'
      }),
      'b',
      'Structure is an indispensable foundational component of any formal organization, establishing task division and authority.',
      'ڈھانچہ (Structure) تنظیم کا ایک لازمی اور بنیادی جزو ہے جس کے بغیر باضابطہ کام کاج ناممکن ہے۔'
    );

    insMgt3.run(
      l3Id,
      '_______________ is achieved by combining capital, raw material & human resource by an organization.',
      JSON.stringify({
        a: 'Sales',
        b: 'Capital',
        c: 'Input',
        d: 'Output'
      }),
      'd',
      'Combining inputs (capital, raw materials, labor) through the organizational transformation process produces outputs (goods & services).',
      'سرمایہ، خام مال اور ہیومن ریسورس کو ٹرانسفارمیشن عمل سے گزارنے کے بعد جو حتمی پیداوار یا خدمات حاصل ہوتی ہیں انہیں آؤٹ پٹ (Output) کہا جاتا ہے۔'
    );

    insMgt3.run(
      l3Id,
      'Formal organizations are _________ organizations.',
      JSON.stringify({
        a: 'Structured',
        b: 'Unstructured',
        c: 'Irrational',
        d: 'Spontaneous'
      }),
      'a',
      'Formal organizations are systematically structured with defined rules, hierarchy, job descriptions, and reporting lines.',
      'باضابطہ تنظیمیں (Formal organizations) باقاعدہ ڈھانچے اور اصول و ضوابط پر مشتمل یعنی اسٹرکچرڈ (Structured) ہوتی ہیں۔'
    );

    // 5 Short Questions (3 marks each)
    insMgt3S.run(
      l3Id,
      'What is an Organization? Enlist its four basic components.',
      `Definition of Organization:
An organization is a systematic arrangement of people brought together to accomplish a specific, collective purpose through structured roles and relationships.

The Four Basic Components of an Organization:
1. People: The workforce (human resources) performing tasks and making decisions.
2. Purpose (Goal): The shared mission, vision, and concrete objectives the organization strives to achieve.
3. Structure: The formal framework, hierarchy, job roles, and lines of authority that govern work relationships.
4. Technology: The tools, machinery, software, and intellectual methods used to transform inputs into outputs.`,
      'An organization coordinates people, purpose, structure, and technology to attain shared goals.',
      'تنظیم افراد کا ایک ایسا باضابطہ اجتماع ہے جو چار بنیادی اجزاء پر مشتمل ہوتا ہے: افراد (People)، مقصد (Purpose)، تنظیمی ڈھانچہ (Structure)، اور ٹیکنالوجی (Technology)۔'
    );

    insMgt3S.run(
      l3Id,
      'Briefly explain the "Systems View of an Organization" (Inputs, Transformation Process, Outputs, Feedback loops).',
      `The Systems View of an Organization:
An organization operates as a unified open system comprising four interrelated stages:

1. Inputs: Resources drawn from the external environment (raw materials, capital, human resources, information).
2. Transformation Process: Management and operational activities (technology, production processes, management functions) that convert raw inputs.
3. Outputs: Finished goods, services, employee satisfaction, profits, and informational results returned to the environment.
4. Feedback Loops: Information about system performance and environmental reactions (customer reviews, sales figures) used to adjust future inputs and processes.`,
      'The systems view emphasizes that organizations continuously process inputs into outputs while adapting via feedback.',
      'سسٹمز ویو کے مطابق تنظیم بیرونی ماحول سے ان پٹس لیتی ہے، ٹرانسفارمیشن پروسیس کے ذریعے انہیں آؤٹ پٹس (مصنوعات و خدمات) میں بدلتی ہے، اور فیڈ بیک سے بہتری لاتی ہے۔'
    );

    insMgt3S.run(
      l3Id,
      'Differentiate between an Open System and a Closed System in an organizational context.',
      `Open System vs. Closed System:

1. Open System:
• Environmental Interaction: Dynamic, continuous two-way exchange of matter, energy, and information with external stakeholders.
• Adaptability: Highly responsive and flexible; adjusts to environmental changes (regulations, competition, consumer tastes).
• Survival: Essential for modern businesses to thrive and achieve long-term survival.

2. Closed System:
• Environmental Interaction: Completely self-contained and isolated from external influences.
• Adaptability: Rigid and impervious to external feedback.
• Survival: Prone to entropy (gradual decay and failure) because it ignores environmental reality.`,
      'Modern organizations are open systems; closed systems decay because they ignore the external environment.',
      'اوپن سسٹم بیرونی ماحول سے مسلسل جڑا رہتا ہے اور تبدیلیوں کے مطابق ڈھلتا ہے، جبکہ کلوزڈ سسٹم ماحول سے کٹا ہوتا ہے اور تنزلی کا شکار ہو جاتا ہے۔'
    );

    insMgt3S.run(
      l3Id,
      'What is Synergy? How does it apply to organizational systems?',
      `Synergy in Organizational Systems:

1. Definition:
Synergy is the phenomenon where the combined performance and output of interrelated subsystems working together is greater than the total sum of their separate individual outputs (often represented as "2 + 2 = 5").

2. Organizational Application:
• Cross-Functional Collaboration: When marketing, production, and HR departments coordinate closely, product launches succeed faster and at lower cost than if each department acted in isolation.
• Resource Optimization: Shared overhead, unified communication systems, and team collaboration generate efficiencies that individual units cannot replicate alone.`,
      'Synergy ensures that collaborative teamwork produces results greater than the sum of isolated individual efforts.',
      'سِینرجی سے مراد یہ اصول ہے کہ جب تمام شعبے مل کر کام کریں تو حاصل ہونے والا مجموعی نتیجہ ان کے الگ الگ کام کرنے سے کہیں زیادہ ہوتا ہے (2 + 2 = 5)۔'
    );

    insMgt3S.run(
      l3Id,
      'Differentiate between Formal Organization and Informal Organization.',
      `Formal vs. Informal Organization:

1. Formal Organization:
• Origin: Officially planned, designed, and established by management.
• Structure: Documented organizational charts, job descriptions, and defined scalar chain of command.
• Focus: Attaining official corporate goals, task completion, efficiency, and legal compliance.
• Authority: Delegated top-down through legitimate organizational hierarchy.

2. Informal Organization:
• Origin: Emerges naturally and spontaneously from social interactions and personal friendships among workers.
• Structure: Unwritten, flexible, fluid social networks with informal leaders (e.g., social lunch groups).
• Focus: Satisfying human social, emotional, and psychological needs.
• Authority: Conferred by personal influence, trust, and peer consensus rather than formal titles.`,
      'Formal organizations follow official hierarchy and policy; informal organizations arise naturally from employee social interactions.',
      'فارمل تنظیم باضابطہ قوانین اور انتظامی ڈھانچے پر مشتمل ہوتی ہے، جبکہ انفارمل تنظیم ملازمین کے باہمی سماجی تعلقات اور دوستی سے خود بخود جنم لیتی ہے۔'
    );

    // 2 Long Questions (5 marks each)
    insMgt3L.run(
      l3Id,
      'Explain in detail the System View of an Organization. Discuss how inputs (human, physical, financial, information resources) are transformed into outputs (goods and services) within an external dynamic environment.',
      `The System View of an Organization in Detail:

I. Concept of a System:
A system is an orderly set of interrelated and interdependent elements functioning together as a unified whole. In management, an organization is conceptualized as an Open System dynamically interacting with its external environment.

II. The Four Core Dimensions of Organizational System:
1. Inputs (Resources from Environment):
• Human Resources: Employees' physical labor, intellectual expertise, management skills, and creative talent.
• Physical Resources: Raw materials, manufacturing plants, machinery, office premises, and hardware.
• Financial Resources: Equity capital, retained earnings, bank credit lines, and cash flow.
• Information Resources: Market research, competitive intelligence, consumer data, economic forecasts, and legal regulations.

2. The Transformation Process (Conversion Mechanism):
• Management Processes: Strategic planning, job design, leadership communication, and internal controls.
• Production & Technological Systems: Assembling, software coding, quality testing, packaging, and logistics.
• Human Capital Systems: Training programs, performance appraisals, and employee motivational systems.

3. Outputs (Results Released Back to Environment):
• Direct Products & Services: Commercial goods, consulting services, software applications.
• Financial Results: Profits, shareholder dividends, tax contributions, and ROI.
• Human Outcomes: Job satisfaction, personal growth, workforce retention, and skill enhancement.
• Societal & Environmental Impact: Corporate social responsibility, brand reputation, and environmental footprint.

4. Feedback Loops (Control & Self-Correction):
• Performance data (sales revenue, customer satisfaction ratings, defect rates, employee turnover) serves as feedback.
• Feedback is evaluated against benchmarks, prompting adjustments in input acquisition or process redesign.

Conclusion:
Viewing the organization as a system prevents "tunnel vision," ensuring that changes in one department (e.g., supply chain) are evaluated for their impact on all other subsystems and the overall enterprise.`,
      'The systems view models organizations as open transformation engines: inputs -> transformation -> outputs -> feedback.',
      'سسٹمز ویو کے تحت تنظیم بیرونی ماحول سے چار بنیادی ان پٹس (انسانی، مالی، مادی اور معلوماتی وسائل) لے کر ٹرانسفارمیشن کے ذریعے مصنوعات و خدمات پیدا کرتی ہے اور فیڈ بیک کے ذریعے مستقل بہتری لاتی ہے۔'
    );

    insMgt3L.run(
      l3Id,
      'What are the criteria that make an organization an effective one? Explain any five of the criteria in detail.',
      `Criteria for Organizational Effectiveness:

An organization is considered effective when it accomplishes its intended objectives while sustaining healthy internal operations and adapting to external environmental demands.

Five Key Criteria of Organizational Effectiveness:

1. Goal Accomplishment (Goal-Attainment Approach):
• Focus: The extent to which an organization successfully achieves its stated operational and strategic goals (e.g., profitability, market share, sales targets, quality benchmarks).
• Application: Comparing actual yearly performance against pre-set managerial targets.

2. Resource Acquisition (System-Resource Approach):
• Focus: The organization's capability to secure scarce, valuable, and necessary resources from the external environment (e.g., top technical talent, competitive financing, premium raw materials).
• Application: Highly effective firms maintain strong bargaining power with suppliers and financial institutions.

3. Internal Process & Health (Internal Process Approach):
• Focus: Smooth, efficient internal operations characterized by high employee trust, healthy communication, low conflict, and minimal bureaucracy.
• Application: Organizations with high morale, low turnover, and strong psychological safety resolve problems swiftly without operational paralysis.

4. Stakeholder Satisfaction (Strategic-Constituencies Approach):
• Focus: Balancing and satisfying the conflicting expectations of all key constituent groups (shareholders, customers, employees, suppliers, government regulators, local community).
• Application: An organization cannot be judged effective if it generates short-term profits while exploiting workers or polluting the community.

5. Adaptability & Environmental Responsiveness:
• Focus: The capacity to anticipate, innovate, and smoothly adapt to shifting market trends, consumer preferences, and technological disruptions.
• Application: Agility in revising corporate strategy, upskilling staff, and adopting modern digital tools ensures long-term survival in dynamic markets.

Conclusion:
True organizational effectiveness cannot be measured by a single metric alone; it requires a multidimensional balance across financial outcomes, human well-being, internal process health, and environmental responsiveness.`,
      'Organizational effectiveness requires balancing goal attainment, resource acquisition, internal health, stakeholder satisfaction, and adaptability.',
      'کسی تنظیم کی کامیابی اور افادیت کو جانچنے کے پانچ اہم معیارات ہیں: اہداف کا حصول، وسائل کا حصول، اندرونی عمل کی صحت و ہم آہنگی، اسٹیک ہولڈرز کا اطمینان، اور بدلتے ہوئے ماحول کے ساتھ مطابقت۔'
    );
  }

  // MGT501 Lecture 4: People and Their Behavior
  const mgt501L4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L4) {
    const l4Res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 4, ?)
    `).run(mgt501.id, 'People and Their Behavior');
    const l4Id = l4Res.lastInsertRowid;

    const insMgt4 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt4S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt4L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 15 MCQs
    insMgt4.run(
      l4Id,
      "Organizational Behavior is a study of investigating the impact of: / Which of the following is said to be the main focus of Organizational Behavior?",
      JSON.stringify({
        a: "Employees' behavior in an organization / People at work",
        b: "Societal behavior on an organization",
        c: "Country's culture on an organization",
        d: "Country's economy on an organization"
      }),
      'a',
      'Organizational Behavior (OB) is dedicated to understanding, explaining, and improving the attitudes and behaviors of individuals and groups in organizations.',
      'آرگنائزیشنل بیہیویر (OB) دراصل کام کی جگہ پر ملازمین اور افراد کے رویوں اور افعال کے اثرات کا باقاعدہ مطالعہ ہے۔'
    );

    insMgt4.run(
      l4Id,
      'The actions of people at work place are studied under which of the following discipline?',
      JSON.stringify({
        a: 'Psychology',
        b: 'Organizational behavior',
        c: 'Sociology',
        d: 'Anthropology'
      }),
      'b',
      'Organizational Behavior specifically examines how individuals and teams act, interact, and perform within workplace settings.',
      'کام کی جگہ پر افراد کے افعال اور حرکات کا مطالعہ آرگنائزیشنل بیہیویر (Organizational behavior) کے تحت کیا جاتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      "Which of the following term describes the unique combination of psychological traits that describes a person’s behaviors?",
      JSON.stringify({
        a: 'Perception',
        b: 'Personality',
        c: 'Attitude',
        d: 'Ability'
      }),
      'b',
      'Personality represents the unique, relatively stable combination of psychological traits and behavioral tendencies distinguishing an individual.',
      'شخصیت (Personality) سے مراد انسان کی ان منفرد اور دیرپا نفسیاتی خصوصیات کا مجموعہ ہے جو اس کے طرزِ عمل کی عکاسی کرتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      "The mental process to interpret environment as per one's own understanding is known as: / The mental process to pay attention selectively to some stimuli in the environment is called:",
      JSON.stringify({
        a: 'Perception',
        b: 'Personality',
        c: 'Attitude',
        d: 'Ability'
      }),
      'a',
      'Perception is the psychological process through which individuals select, organize, and interpret sensory impressions to give meaning to their environment.',
      'حسی معلومات کو ترتیب دے کر اپنے فہم کے مطابق ماحول کی تشریح کرنے کے ذہنی عمل کو پرسیپشن (Perception) یا ادراک کہتے ہیں۔'
    );

    insMgt4.run(
      l4Id,
      "Which of the following component of attitude represents a person’s opinions, knowledge, and information? / The cognitive component consists of a person's:",
      JSON.stringify({
        a: 'Affective component',
        b: 'Cognitive component',
        c: 'Behavioral component',
        d: 'Objective component'
      }),
      'b',
      'The cognitive component of an attitude encompasses an individual’s beliefs, opinions, factual knowledge, and informational foundation.',
      'کسی رویے کا ادراکی جزو (Cognitive component) انسان کے عقائد، آراء، فہم اور حاصل کردہ معلومات پر مشتمل ہوتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      "'Cognitive component' of an attitude represents which of the following individual's activity?",
      JSON.stringify({
        a: 'Thinking',
        b: 'Feeling',
        c: 'Doing',
        d: 'Performing'
      }),
      'a',
      'Cognition equates to mental processing and thinking, whereas affective is feeling and behavioral is doing/action.',
      'ایٹی ٹیوڈ کا کاگنیٹیو جزو دراصل انسان کی سوچ اور فکری عمل یعنی تھنکنگ (Thinking) کی نمائندگی کرتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Which component of an attitude refers to an intention to behave in a certain way?',
      JSON.stringify({
        a: 'Affective',
        b: 'Behavioral',
        c: 'Cognitive',
        d: 'Objective'
      }),
      'b',
      'The behavioral component of an attitude represents an explicit intent or readiness to act in a particular manner toward someone or something.',
      'رویے کا بیہیویورل جزو (Behavioral component) کسی چیز یا شخص کے بارے میں مخصوص عمل کرنے کے ارادے (intention) کو ظاہر کرتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'An attitude is composed of three components that are:',
      JSON.stringify({
        a: 'Cognition, affect and behavior',
        b: 'Cognition, intuition and behavior',
        c: 'Cognition, intuition and feelings',
        d: 'Cognition, intuition and senses'
      }),
      'a',
      'The tripartite ABC model defines attitude through: Affect (feelings), Behavior (action intention), and Cognition (beliefs/thoughts).',
      'کسی بھی رویے کے تین بنیادی اجزاء ہوتے ہیں: کاگنیشن (سوچ)، افیکٹ (احساسات)، اور بیہیویر (عمل کا ارادہ)۔'
    );

    insMgt4.run(
      l4Id,
      'The three most important job-related attitudes are:',
      JSON.stringify({
        a: 'Job involvement, organizational commitment and job enrichment',
        b: 'Job satisfaction, job orientation and organizational commitment',
        c: 'Job satisfaction, job involvement and organizational commitment',
        d: 'Job satisfaction, job enlargement and organizational behavior'
      }),
      'c',
      'Organizational research identifies Job Satisfaction, Job Involvement, and Organizational Commitment as the core job attitudes.',
      'ملازمت سے وابستہ تین اہم ترین رویے ہیں: جاب سیٹسفیکشن (اطمینانِ قلب)، جاب انوالومنٹ (کام میں لگن)، اور آرگنائزیشنل کمٹمنٹ (ادارے سے وفاداری)۔'
    );

    insMgt4.run(
      l4Id,
      "Which of the following term represents an individual's sense of control over his/her life, the environment and external events?",
      JSON.stringify({
        a: 'Knowledge',
        b: 'Beliefs',
        c: 'Locus of control',
        d: 'Skill & abilities'
      }),
      'c',
      'Locus of Control measures the degree to which people believe that they, as opposed to external forces, control the outcomes of their lives.',
      'لوکس آف کنٹرول (Locus of control) سے مراد یہ احساس ہے کہ انسان اپنی زندگی اور حالات پر خود کتنا قابو رکھتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Which of the following is an example of internal locus of control?',
      JSON.stringify({
        a: 'My success depends on my luck',
        b: 'My success depends on my abilities',
        c: 'My success depends on training sessions',
        d: 'All of the above'
      }),
      'b',
      'Individuals with an internal locus of control believe that their personal efforts, choices, and skills dictate their destiny and success.',
      'انٹرنل لوکس آف کنٹرول رکھنے والے افراد کا یقین ہوتا ہے کہ ان کی کامیابی بیرونی قسمت پر نہیں بلکہ ان کی اپنی محنت اور صلاحیتوں پر منحصر ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Basic convictions about what is right and wrong are known as:',
      JSON.stringify({
        a: 'Attitudes',
        b: 'Values',
        c: 'Perception',
        d: 'Behavior'
      }),
      'b',
      'Values are fundamental convictions that a specific mode of conduct or end-state of existence is personally or socially preferable to an opposite mode.',
      'اقدار (Values) صحیح اور غلط کے بارے میں بنیادی گہرے یقین اور عقائد ہوتے ہیں جو زندگی کے فیصلوں کی رہنمائی کرتے ہیں۔'
    );

    insMgt4.run(
      l4Id,
      'Rules and principles that define right and wrong conduct are termed as:',
      JSON.stringify({
        a: 'Values',
        b: 'Attitudes',
        c: 'Ethics',
        d: 'Culture'
      }),
      'c',
      'Ethics consists of moral principles, codes, and rules governing the acceptable conduct of an individual, profession, or organization.',
      'اخلاقیات (Ethics) ان بنیادی اصولوں اور ضوابط کو کہا جاتا ہے جو صحیح اور غلط کردار و عمل کے درمیان حد فاصل کھینچتے ہیں۔'
    );

    insMgt4.run(
      l4Id,
      "Individual's behavior comprises of:",
      JSON.stringify({
        a: 'Heritage',
        b: 'Perception',
        c: 'Emotions',
        d: 'All of the given options'
      }),
      'd',
      'An individual’s behavior is shaped by biological heritage, cognitive perception, emotional states, personality, and environmental factors.',
      'کسی فرد کا رویہ اس کے پس منظر و وراثت، ادراک، اور جذبات جیسے تمام عوامل کے امتزاج سے بنتا ہے۔'
    );

    insMgt4.run(
      l4Id,
      'Which of the following personality characteristics are associated with people who are likely to exhibit violent behavior on the job?',
      JSON.stringify({
        a: 'Neurotic',
        b: 'Optimistic',
        c: 'Extraverted',
        d: 'Type A'
      }),
      'a',
      'High neuroticism (emotional instability, severe mood swings, paranoia) is strongly correlated with workplace hostility and aggression.',
      'نیوروٹک (Neurotic) یعنی شدید جذباتی عدم استحکام اور بدگمانی رکھنے والے افراد کام کی جگہ پر پرتشدد رویے کا زیادہ مظاہرہ کر سکتے ہیں۔'
    );

    // 5 Short Questions (3 marks each)
    insMgt4S.run(
      l4Id,
      'What is Organizational Behavior (OB) and why is understanding individual behavior important for managers?',
      `Organizational Behavior (OB) & Managerial Importance:

1. Definition:
Organizational Behavior (OB) is an interdisciplinary field dedicated to investigating the impact that individuals, groups, and organizational structure have on behavior within organizations, for the purpose of applying such knowledge toward improving organizational effectiveness.

2. Managerial Importance:
• Predicting Employee Behavior: Helps managers anticipate how workers will react to organizational changes, policies, and incentives.
• Enhancing Productivity & Satisfaction: Understanding individual differences enables managers to align job roles with employee skills, boosting morale and reducing turnover.
• Conflict Resolution & Team Leadership: Equips leaders with behavioral insights to motivate diverse employees and resolve workplace friction proactively.`,
      'OB studies how individuals and groups act in organizations to improve productivity, satisfaction, and performance.',
      'آرگنائزیشنل بیہیویر (OB) ملازمین کے رویوں کا مطالعہ ہے؛ مینیجرز کے لیے اس کا سمجھنا اس لیے ضروری ہے تاکہ وہ ملازمین کو متحرک کر سکیں، ٹرن اوور کم کریں اور کارکردگی بڑھائیں۔'
    );

    insMgt4S.run(
      l4Id,
      'Briefly explain the formula/model of Individual Behavior (B = f(P, E)).',
      `Kurt Lewin's Model of Individual Behavior (B = f(P, E)):

1. The Formula:
Behavior (B) is a function of the Person (P) interacting with their Environment (E):
B = f(P, E)

2. Component Breakdown:
• B (Behavior): The observable actions, decisions, and performance displayed by an employee.
• P (Person): Internal psychological characteristics unique to the individual, including personality traits, attitudes, perceptions, values, motivation, and abilities.
• E (Environment): External workplace conditions, including organizational culture, supervisory leadership style, peer relationships, physical work conditions, and reward systems.

Significance:
Human behavior is never dictated solely by personality or solely by circumstances; it is an ongoing, dynamic interaction between who the person is and the environment they operate within.`,
      'Behavior (B) results from the continuous interaction between personal characteristics (P) and workplace environment (E).',
      'کرٹ لیون کا ماڈل B = f(P, E) واضح کرتا ہے کہ انسان کا طرزِ عمل اس کی ذاتی خصوصیات (P) اور بیرونی ماحول (E) کے باہمی تعامل کا نتیجہ ہوتا ہے۔'
    );

    insMgt4S.run(
      l4Id,
      'Enlist and briefly define the three components of Attitudes (Cognitive, Affective, Behavioral).',
      `The Three Components of Attitudes (ABC Model):

1. Cognitive Component (Belief / Knowledge):
• Definition: The opinions, factual knowledge, information, and beliefs held by a person about an object, person, or situation (e.g., "My salary is below the market average").
• Represents: What you think.

2. Affective Component (Feelings / Emotion):
• Definition: The emotional or feeling segment of an attitude, reflecting positive or negative feelings toward the entity (e.g., "I feel angry and undervalued about my compensation").
• Represents: What you feel.

3. Behavioral Component (Action / Intention):
• Definition: An explicit intention or actual predisposition to behave in a specific way toward someone or something (e.g., "I intend to apply for another job next week").
• Represents: What you intend to do.`,
      'Attitudes comprise thoughts (Cognitive), feelings (Affective), and action intentions (Behavioral).',
      'ایٹی ٹیوڈ کے تین اجزاء: کاگنیٹیو (سوچ، علم اور رائے)، افیکٹیو (جذبات اور احساسات)، اور بیہیویورل (مخصوص عمل کرنے کا ارادہ)۔'
    );

    insMgt4S.run(
      l4Id,
      'Define Locus of Control. Differentiate between Internal Locus of Control and External Locus of Control.',
      `Locus of Control:

1. Definition:
Locus of Control is a personality trait that measures the extent to which individuals believe they possess control over the events, circumstances, and outcomes influencing their lives.

2. Internal Locus of Control:
• Core Belief: "I control my own destiny."
• Characteristics: Individuals believe their successes and failures are the direct result of their own efforts, abilities, and choices.
• Workplace Behavior: High initiative, self-motivated, proactive problem solvers, and perform exceptionally in demanding roles.

3. External Locus of Control:
• Core Belief: "My destiny is controlled by outside forces."
• Characteristics: Individuals attribute outcomes to luck, fate, chance, powerful external individuals, or organizational politics.
• Workplace Behavior: More compliant and dependent; often blame external circumstances for mistakes and perform best in structured, closely supervised environments.`,
      'Internals attribute outcomes to personal effort and skill; externals blame fate, luck, or external circumstances.',
      'لوکس آف کنٹرول: انٹرنل والے یقین رکھتے ہیں کہ ان کی کامیابی اپنی محنت کا نتیجہ ہے، جبکہ ایکسٹرنل والے حالات، قسمت یا دوسروں کو ذمہ دار ٹھہراتے ہیں۔'
    );

    insMgt4S.run(
      l4Id,
      'Differentiate between Values and Ethics in an organizational context.',
      `Difference Between Values and Ethics:

1. Values:
• Definition: Deep-seated, enduring convictions about what is personally or socially desirable, worthwhile, and important (e.g., honesty, freedom, security).
• Nature: Internal, subjective beliefs that serve as personal life standards and shape individual attitudes.
• Source: Acquired early in life through family upbringing, cultural background, and religious heritage.

2. Ethics:
• Definition: Systematic moral principles, rules, and codes that define right versus wrong conduct in a social or professional setting.
• Nature: External behavioral guidelines and enforceable standards developed by society, organizations, or professional associations.
• Source: Organizational codes of conduct, professional canons (e.g., medical/accounting ethics), and societal legal frameworks.

Summary:
Values define what an individual considers important from within; Ethics dictate how that individual is expected to act externally according to collective standards of right and wrong.`,
      'Values are personal internal convictions of importance; ethics are collective external codes of right and wrong conduct.',
      'اقدار (Values) انسان کے اندرونی ذاتی عقائد ہیں کہ کیا اہم ہے، جبکہ اخلاقیات (Ethics) بیرونی طور پر طے شدہ باضابطہ اصول ہیں کہ کیا درست اور کیا غلط ہے۔'
    );

    // 2 Long Questions (5 marks each)
    insMgt4L.run(
      l4Id,
      `Explain the following terms in detail:
1. Personality
2. Perception
3. Attitude
4. Values
5. Ethics`,
      `Comprehensive Explanation of Core Behavioral Foundations:

1. Personality:
• Definition: The unique, dynamic, and enduring combination of psychological traits, temperamental patterns, and behavioral tendencies that characterizes how an individual reacts and interacts with others.
• Workplace Relevance: Personality predicts job fit, team compatibility, stress tolerance, and leadership potential (e.g., Extraversion, Conscientiousness).

2. Perception:
• Definition: The psychological process by which individuals select, organize, interpret, and give meaning to sensory impressions in their surrounding environment.
• Workplace Relevance: People do not act on objective reality; they act on what they perceive to be real. Perceptual shortcuts (stereotyping, halo effect) can distort performance evaluations.

3. Attitude:
• Definition: Evaluative statements—either favorable or unfavorable—concerning objects, people, or events. Comprises Cognitive (thoughts), Affective (emotions), and Behavioral (intentions) components.
• Workplace Relevance: Core job attitudes (Job Satisfaction, Job Involvement, Organizational Commitment) directly influence absenteeism, turnover, and discretionary work effort.

4. Values:
• Definition: Fundamental, enduring convictions that a specific mode of conduct or end-state of existence is personally or socially preferable to an opposite mode. Divided into Terminal values (end goals) and Instrumental values (modes of behavior).
• Workplace Relevance: Shared organizational values form corporate culture and guide long-term employee commitment.

5. Ethics:
• Definition: Moral principles, rules, and guidelines that establish acceptable standards of right and wrong conduct within a society, profession, or enterprise.
• Workplace Relevance: Ethical leadership fosters trust, transparency, legal compliance, and protects corporate reputation from fraud and misconduct.`,
      'Personality, perception, attitude, values, and ethics form the psychological foundation governing individual behavior at work.',
      'شخصیت، ادراک، رویہ، اقدار اور اخلاقیات وہ پانچ ستون ہیں جن پر کسی بھی ادارے میں کام کرنے والے افراد کا نفسیاتی اور عملی طرزِ عمل استوار ہوتا ہے۔'
    );

    insMgt4L.run(
      l4Id,
      'What is Personality? Discuss four key personality traits (Locus of Control, Type-A Behavior, Self-Monitoring, and Machiavellianism) that consistently influence work-related employee behavior.',
      `Personality & Four Key Work-Related Personality Traits:

I. Definition of Personality:
Personality is the stable set of psychological characteristics, temperaments, and behavioral habits that distinguish one person from another and determine how that person responds to workplace environments.

II. Four Key Personality Traits Influencing Work Behavior:

1. Locus of Control:
• Description: The degree to which individuals believe they control their own destiny versus being controlled by external forces.
• Internal Locus: Attribute outcomes to skill and effort; highly driven, independent, and perform well in complex, autonomous roles.
• External Locus: Attribute outcomes to luck, fate, or supervisors; require structured tasks and consistent reassurance.

2. Type-A vs. Type-B Behavior Pattern:
• Type-A Profile: Aggressively involved in a chronic, incessant struggle to achieve more in less time. Characterized by high urgency, competitiveness, impatience, and multitasking.
• Workplace Impact: Produce high short-term output but are prone to stress, cardiovascular illness, and interpersonal friction.
• Type-B Contrast: Relaxed, patient, reflective, and collaborative.

3. Self-Monitoring:
• Description: An individual's ability to adjust and adapt their behavior to external, situational, and social factors.
• High Self-Monitors: Highly sensitive to social cues, chameleonic; adjust verbal and non-verbal behavior across different audiences. Excellent negotiators and boundary spanners.
• Low Self-Monitors: Consistent behavioral display regardless of context; show true feelings openly and value consistency over social impression management.

4. Machiavellianism ("Mach"):
• Description: Named after Niccolò Machiavelli; describes a pragmatic, emotionally detached personality oriented toward power and manipulation ("the end justifies the means").
• Workplace Impact: Thrive in bargaining situations, unstructured environments with few rules, and where emotional detachment yields tactical advantage. However, they may undermine organizational trust if unchecked.

Conclusion:
Understanding these personality dimensions enables managers to design optimal job roles, assemble complementary teams, and implement tailored motivational strategies.`,
      'Locus of Control, Type-A behavior, Self-Monitoring, and Machiavellianism significantly determine workplace performance and job fit.',
      'شخصیت اور اس کے چار اہم خصائص (لوکس آف کنٹرول، ٹائپ اے بیہیویر، سیلف مانیٹرنگ، اور میکیاولین ازم) کام کی جگہ پر ملازمین کی کارکردگی اور باہمی تعلقات پر گہرے اثرات مرتب کرتے ہیں۔'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MGT501 — Lecture 5: Individual vs. Group Behavior & Workforce Diversity
  // ─────────────────────────────────────────────────────────────────────────────
  const mgt501L5 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 5`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L5) {
    const l5res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 5, ?)
    `).run(mgt501.id, 'Individual vs. Group Behavior & Workforce Diversity');
    const l5Id = l5res.lastInsertRowid;

    const insMgt5 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    const insMgt5S = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    const insMgt5L = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    // 15 MCQs
    insMgt5.run(
      l5Id,
      'Two or more interacting and interdependent individuals who come together to achieve particular objectives is defined as a:',
      JSON.stringify({
        a: 'Organization',
        b: 'Group',
        c: 'System',
        d: 'Structure'
      }),
      'b',
      'A group is formally defined as two or more interacting and interdependent individuals who assemble together to accomplish specific personal or organizational objectives.',
      'دو یا دو سے زیادہ آپس میں رابطہ رکھنے والے اور ایک دوسرے پر انحصار کرنے والے افراد جو مخصوص مقاصد کے لیے جمع ہوں، گروپ (Group) کہلاتے ہیں۔'
    );

    insMgt5.run(
      l5Id,
      'Groups and Teams are ________:',
      JSON.stringify({
        a: 'One and the same things',
        b: 'Different things',
        c: 'Opposite concepts',
        d: 'Unrelated terms'
      }),
      'b',
      'Groups and teams are different concepts. While all teams are groups, a team involves a higher degree of positive synergy, mutual accountability, and interdependent coordination.',
      'گروپس اور ٹیمیں دو الگ الگ چیزیں (Different things) ہیں۔ تمام ٹیمیں گروپس ضرور ہوتی ہیں مگر ہر گروپ ٹیم نہیں ہوتا۔'
    );

    insMgt5.run(
      l5Id,
      'Which of the following statements reflects the true relationship between groups and teams?',
      JSON.stringify({
        a: 'All groups are teams',
        b: 'All teams are groups but every group is not a team',
        c: 'Teams and groups are exactly the same',
        d: 'Groups have higher interdependence than teams'
      }),
      'b',
      'All teams are groups because they consist of multiple interacting individuals, but not all groups are teams because teams require complementary skills, positive synergy, and mutual accountability.',
      'تمام ٹیمیں گروپس ہوتی ہیں لیکن ہر گروپ ٹیم نہیں ہوتا کیونکہ ٹیم کے اندر مشترکہ مقاصد اور باہمی جوابدہی کا اعلیٰ معیار ہوتا ہے۔'
    );

    insMgt5.run(
      l5Id,
      'A work group that is established by the organization for a specific assignment or task is known as:',
      JSON.stringify({
        a: 'Informal group',
        b: 'Formal group',
        c: 'Interest group',
        d: 'Social group'
      }),
      'b',
      'A formal group is designated and established by the organizational hierarchy with defined work roles, tasks, and responsibilities aimed at achieving business goals.',
      'وہ ورک گروپ جو ادارہ کسی خاص کام یا اسائنمنٹ کے لیے باضابطہ بناتا ہے، فارمل گروپ (Formal group) کہلاتا ہے۔'
    );

    insMgt5.run(
      l5Id,
      'Which of the following is a primary characteristic/quality of an Informal Group?',
      JSON.stringify({
        a: 'Established by organizational structure',
        b: 'Tasks assigned by top management',
        c: 'They are social in nature',
        d: 'Formed strictly to enforce formal rules'
      }),
      'c',
      'Informal groups are natural social alliances that emerge spontaneously among employees based on shared personal interests, friendships, and social interaction.',
      'انفارمل گروپس کی بنیادی خوبی یہ ہے کہ یہ سماجی نوعیت (Social in nature) کے ہوتے ہیں اور قدرتی میل جول سے بنتے ہیں۔'
    );

    insMgt5.run(
      l5Id,
      'Refers to how tightly knit the group is and the degree to which group members perceive, interpret, and act on their environment in similar ways:',
      JSON.stringify({
        a: 'Groupthink',
        b: 'Cohesiveness',
        c: 'Stereotyping',
        d: 'Diversity'
      }),
      'b',
      'Group cohesiveness represents the strength of interpersonal attraction, mutual solidarity, and unity that binds group members together.',
      'گروپ کوہیسونیس (Cohesiveness) اس بات کا پیمانہ ہے کہ گروپ ارکان آپس میں کتنے جڑے ہوئے ہیں اور کتنا متحد ہو کر کام کرتے ہیں۔'
    );

    insMgt5.run(
      l5Id,
      'To increase group cohesiveness, managers have to:',
      JSON.stringify({
        a: 'Forcefully apply rules & policies',
        b: 'Increase competition with other groups',
        c: 'Encourage mutual participation',
        d: 'Nurture politics within the groups'
      }),
      'c',
      'Encouraging mutual participation, participative decision-making, and open collaboration significantly increases group cohesiveness and collective commitment.',
      'گروپ میں کوہیسونیس بڑھانے کے لیے مینیجرز کو تمام ارکان کی باہمی شرکت (Mutual participation) اور مشترکہ فیصلوں کی حوصلہ افزائی کرنی چاہیے۔'
    );

    insMgt5.run(
      l5Id,
      '_________ refers to a set of expected behavior patterns attributed to someone who occupies a given position in a social unit.',
      JSON.stringify({
        a: 'Norm',
        b: 'Perception',
        c: 'Role',
        d: 'Stereotyping'
      }),
      'c',
      'A role is defined as an expected pattern of behavior, duties, and social actions associated with a particular position or title in a group or organization.',
      'کسی مخصوص عہدے یا پوزیشن پر فائز فرد سے متوقع طرزِ عمل کے مجموعے کو کردار یا رول (Role) کہتے ہیں۔'
    );

    insMgt5.run(
      l5Id,
      'Which of the following is MOST important to manage workforce diversity?',
      JSON.stringify({
        a: 'Lower cohesiveness',
        b: 'Support group',
        c: 'Top-level commitment',
        d: 'Resistance to change'
      }),
      'c',
      'Sustained top-level management commitment and leadership are the single most critical prerequisites for institutionalizing effective workforce diversity programs.',
      'ورک فورس ڈائیورسٹی کے کامیاب انتظام کے لیے سب سے بنیادی عنصر اعلیٰ انتظامیہ کی سنجیدہ وابستگی (Top-level commitment) ہے۔'
    );

    insMgt5.run(
      l5Id,
      'What attributes do employers need to develop for effectively managing a diverse workforce?',
      JSON.stringify({
        a: 'Acceptance',
        b: 'Open-mindedness',
        c: 'Cultural awareness',
        d: 'All of the given options'
      }),
      'd',
      'Managing diverse employees requires an inclusive mindset encompassing cultural awareness, acceptance of individual differences, and broad open-mindedness.',
      'متنوع افراد کے موثر انتظام کے لیے کھلے ذہن، قبولیت اور ثقافتی فہم (تمام دیے گئے اوصاف) کی اشد ضرورت ہوتی ہے۔'
    );

    insMgt5.run(
      l5Id,
      'Which one of the following is NOT the advantage of Workforce Diversity?',
      JSON.stringify({
        a: 'Increased creativity and flexibility',
        b: 'Decreased problem-solving skills',
        c: 'Multiple perspectives',
        d: 'Greater openness to new ideas'
      }),
      'b',
      'Workforce diversity enhances problem-solving skills, broadens creative viewpoints, and stimulates innovation; decreased problem-solving skills is an inaccurate statement and NOT an advantage.',
      'ورک فورس ڈائیورسٹی سے مسائل حل کرنے کی صلاحیت بہتر ہوتی ہے، کم نہیں ہوتی۔ لہٰذا "صلاحیت میں کمی" اس کا فائدہ نہیں ہے۔'
    );

    insMgt5.run(
      l5Id,
      'The employees belonging to the same gender or color are usually found to communicate primarily with other employees from the same gender or color. This refers to:',
      JSON.stringify({
        a: 'Lower Cohesiveness',
        b: 'Segmented Communication Networks',
        c: 'Workforce Diversity',
        d: 'None of the above'
      }),
      'b',
      'Segmented communication networks describe the tendency of employees to form informal communication channels primarily with colleagues sharing similar demographic traits (gender, ethnicity, or age).',
      'جب ملازمین اپنی ہی جنس، نسل یا پس منظر کے لوگوں سے زیادہ بات چیت کریں تو اسے سیگمنٹڈ کمیونیکیشن نیٹ ورکس (Segmented Communication Networks) کہتے ہیں۔'
    );

    insMgt5.run(
      l5Id,
      '"Women cannot do important or heavy jobs." This statement is an example of:',
      JSON.stringify({
        a: 'Halo effect',
        b: 'Stereotyping',
        c: 'Locus of control',
        d: 'Impression management'
      }),
      'b',
      'Stereotyping is the cognitive bias of judging or assigning fixed traits to an individual based solely on perceptions of the group to which that person belongs.',
      'کسی مخصوص گروہ کے بارے میں عمومی اور غیر منصفانہ رائے قائم کرنا اسٹیریو ٹائپنگ (Stereotyping) کہلاتا ہے۔'
    );

    insMgt5.run(
      l5Id,
      'Top management refused to consider its female marketing manager for the post of Vice President. This action represents which of the following?',
      JSON.stringify({
        a: 'Gender discrimination',
        b: 'Legal consideration',
        c: 'Reverse discrimination',
        d: 'Glass ceiling effect'
      }),
      'd',
      'The glass ceiling effect represents an invisible, systemic barrier based on attitudinal biases that blocks qualified women and minorities from senior executive promotions.',
      'باصلاحیت خواتین کو اعلیٰ ترین انتظامی عہدوں تک پہنچنے سے روکنے والی غیر مرئی رکاوٹ گلاس سیلنگ ایفیکٹ (Glass ceiling effect) کہلاتی ہے۔'
    );

    insMgt5.run(
      l5Id,
      'How do companies facilitate workforce diversity?',
      JSON.stringify({
        a: 'Rely on external support systems for minority workers',
        b: 'Encourage employees to challenge beliefs and values of other employees',
        c: 'Build in accountability through surveys and audits',
        d: 'Reinforce traditional values'
      }),
      'c',
      'Organizations operationalize diversity management by instituting managerial accountability, diversity audits, employee satisfaction surveys, and transparent monitoring systems.',
      'کمپنیاں باقاعدہ سروے اور ڈائیورسٹی آڈٹس کے ذریعے جوابدہی اور احتساب (Accountability) لا کر ورک فورس ڈائیورسٹی کو منظم کرتی ہیں۔'
    );

    // 5 Short Questions
    insMgt5S.run(
      l5Id,
      'Differentiate between a Group and a Team.',
      `Differences between a Group and a Team:

1. Work Group:
• Goal: Members interact primarily to share information and make decisions to assist each person perform within their individual area of responsibility.
• Synergy: Neutral or individualistic (no significant collective synergy; 1 + 1 = 2).
• Accountability: Individual accountability only.
• Skills: Varied and random skills.

2. Work Team:
• Goal: Focuses on collective performance and unified accomplishment of shared organizational goals.
• Synergy: Positive synergy; the collective output of the team exceeds the sum of individual inputs (1 + 1 > 2).
• Accountability: Both individual and mutual collective accountability.
• Skills: Complementary, strategically integrated skills.`,
      'A group focuses on individual performance and information sharing; a team produces positive synergy with mutual accountability.',
      'گروپ کا فوکس معلومات کے تبادلے اور انفرادی کام پر ہوتا ہے، جبکہ ٹیم میں باہمی جوابدہی اور مثبت ہم آہنگی (Synergy) ہوتی ہے جس سے کارکردگی بڑھ جاتی ہے۔'
    );

    insMgt5S.run(
      l5Id,
      'Differentiate between Formal Groups and Informal Groups with examples.',
      `Differences between Formal and Informal Groups:

1. Formal Groups:
• Creation: Officially established and structured by the organization's formal hierarchy.
• Purpose: Designed to perform designated organizational tasks, projects, and departmental functions.
• Examples: Quality Control Committee, Marketing Department, Software Development Task Force.

2. Informal Groups:
• Creation: Formed naturally and organically in response to social needs, friendships, or common personal interests.
• Purpose: Provides psychological support, camaraderie, and social fulfillment.
• Examples: Colleagues eating lunch together, employee badminton club, coffee break friendship group.`,
      'Formal groups are created by management for work tasks; informal groups emerge organically to satisfy social needs.',
      'فارمل گروپس ادارے کے کاموں کے لیے باضابطہ بنائے جاتے ہیں (جیسے کمیٹی یا ٹیم)۔ انفارمل گروپس ملازمین کے دوستانہ تعلقات اور سماجی ضروریات کی بنا پر خود بخود بنتے ہیں۔'
    );

    insMgt5S.run(
      l5Id,
      'What is Group Cohesiveness? How can managers increase cohesiveness among group members?',
      `Group Cohesiveness:
Group cohesiveness is the degree of attraction, solidarity, and unity that binds group members together, motivating them to stay committed to the group and act in harmony.

How Managers Can Increase Group Cohesiveness:
1. Make the Group Smaller: Smaller group sizes enhance interaction, open communication, and personal bonds.
2. Encourage Mutual Participation: Actively involve all members in setting goals and finding solutions collectively.
3. Increase Group Status: Emphasize the prestige and importance of belonging to the group.
4. Reward the Group Rather than Individuals: Provide collective team-based incentives to stimulate collaboration over internal rivalry.
5. Physically Isolate the Group: Providing a dedicated shared workspace strengthens interpersonal bonding.`,
      'Cohesiveness reflects group solidarity. Managers can enhance it by keeping groups smaller, rewarding collective output, and encouraging participation.',
      'کوہیسونیس ارکان کی باہمی یکجہتی ہے۔ مینیجرز گروپ کا سائز چھوٹا رکھ کر، مشترکہ شرکت بڑھا کر اور اجتماعی کارکردگی پر انعامات دے کر کوہیسونیس بڑھا سکتے ہیں۔'
    );

    insMgt5S.run(
      l5Id,
      'Define Workforce Diversity. Enlist any six sources of workforce diversity.',
      `Workforce Diversity:
Workforce diversity refers to the broad variety of demographic, cultural, cognitive, and personal differences that exist among employees within an organization.

Six Major Sources of Workforce Diversity:
1. Age (Generational mix: Gen Z, Millennials, Gen X, Baby Boomers)
2. Gender (Male, female, and non-binary representation)
3. Race and Ethnicity (Diverse cultural identities and ethnic heritages)
4. Educational Background (Varied academic credentials, specializations, and functional skills)
5. Religion and Belief Systems (Diverse faiths, values, and traditions)
6. Physical and Mental Abilities (Inclusion of differently-abled employees and diverse cognitive styles)`,
      'Workforce diversity encompasses individual differences across age, gender, race, education, religion, and physical abilities.',
      'ورک فورس ڈائیورسٹی سے مراد ادارے کے ملازمین میں مختلف پس منظر اور صلاحیتوں کی موجودگی ہے۔ اس کے 6 ذرائع: عمر، جنس، نسل، تعلیم، مذہب، اور جسمانی صلاحیتیں ہیں۔'
    );

    insMgt5S.run(
      l5Id,
      'What is the "Glass Ceiling Effect" in the context of gender diversity in organizations?',
      `The Glass Ceiling Effect:

• Concept & Definition: The "Glass Ceiling" refers to an invisible, subtle, but real artificial barrier caused by attitudinal, cultural, or organizational prejudices that blocks qualified women and underrepresented minorities from advancing into senior executive and top leadership positions.
• Why It Is Called "Glass": It is transparent—women and minority candidates can see executive positions clearly, but invisible structural and social barriers prevent them from breaking through.
• Key Contributing Factors: Deep-seated gender stereotyping, lack of executive mentorship and sponsorship, exclusion from informal leadership networks ("old boys' networks"), and inflexible corporate schedules.
• Organizational Remedy: Implementing objective merit-based promotions, formal executive sponsorship programs, and active monitoring by board diversity audits.`,
      'The glass ceiling is the invisible, artificial barrier that prevents qualified women and minorities from reaching top leadership posts.',
      'گلاس سیلنگ ایفیکٹ سے مراد وہ غیر مرئی رکاوٹ ہے جو تعصبات اور دقیانوسی سوچ کی وجہ سے باصلاحیت خواتین اور اقلیتوں کو اعلیٰ ترین انتظامی عہدوں تک ترقی کرنے سے روکتی ہے۔'
    );

    // 2 Long Questions
    insMgt5L.run(
      l5Id,
      'What is Workforce Diversity? Discuss in detail its key sources, major advantages to modern organizations, and the significant challenges associated with managing a diverse workforce.',
      `Comprehensive Analysis of Workforce Diversity:

I. Definition of Workforce Diversity:
Workforce diversity describes an organization's intentional inclusion of employees representing a wide array of demographic backgrounds, cultural orientations, cognitive skills, life experiences, and perspectives.

II. Key Sources of Workforce Diversity:
1. Demographic Characteristics: Differences in age, gender, race, nationality, and ethnic heritage.
2. Professional and Cognitive Backgrounds: Diverse functional disciplines, academic training, and problem-solving styles.
3. Socio-Cultural Dimensions: Religion, personal values, family structures, language, and socio-economic origins.

III. Major Advantages to Organizations:
1. Enhanced Creativity and Innovation: Heterogeneous teams bring multiple perspectives that break conventional thinking, inspiring novel product designs and solutions.
2. Superior Problem-Solving: Cross-functional, diverse teams explore broader problem definitions and evaluate decisions more rigorously.
3. Market Sensitivity and Global Reach: A diverse workforce mirrors an increasingly multicultural customer base, improving market understanding and customer relations.
4. Enhanced Talent Acquisition: Organizations embracing diversity appeal to a larger pool of skilled candidates and enjoy higher retention among high-performing minorities.

IV. Significant Challenges in Managing a Diverse Workforce:
1. Segmented Communication Networks: Employees often gravitate toward informal communication with demographic peers, creating communication silos across departments.
2. Stereotyping and Unconscious Bias: Prejudiced assumptions about colleagues based on group identity harm interpersonal trust and distort performance evaluations.
3. Lower Initial Cohesiveness: Diverse teams may initially encounter cultural misunderstandings, conflict, and slower consensus-building.
4. Glass Ceiling Barriers: Institutional obstacles impede the career progression of women and minorities into senior leadership roles.

Conclusion:
Managing diversity requires proactive managerial frameworks, cultural sensitivity, and continuous executive support to transform workplace differences into strategic competitive advantage.`,
      'Workforce diversity provides creative and market advantages but introduces challenges such as stereotyping, segmented networks, and glass ceiling barriers.',
      'ورک فورس ڈائیورسٹی کا تفصیلی جائزہ: 1. تعریف اور ذرائع، 2. فوائد (تخلیقی صلاحیت، مسائل کا حل، مارکیٹ تک رسائی)، 3. چیلنجز (سیگمنٹڈ کمیونیکیشن، تعصبات، گلاس سیلنگ)۔ موثر مینجمنٹ سے یہ چیلنجز حل ہو سکتے ہیں۔'
    );

    insMgt5L.run(
      l5Id,
      'Summarize the significance of obtaining top management support and commitment in cultivating and managing a diverse workforce. What specific measures should an organization take to achieve this?',
      `Significance of Top Management Commitment and Actionable Diversity Strategies:

I. Significance of Top Management Support:
1. Cultural Tone and Role Modeling: Organizational culture is shaped by leadership behavior. When senior executives visibly champion inclusion, diversity becomes an institutional priority rather than a slogan.
2. Strategic Resource Allocation: Developing diversity initiatives requires financial resources, training programs, and structural redesign that only top leadership can authorize.
3. Overcoming Resistance to Change: Executive endorsement provides the authority required to challenge traditional practices, dismantle systemic biases, and hold managers accountable.

II. Specific Actionable Measures Organizations Must Implement:

1. Articulate a Clear Diversity Philosophy:
Integrate diversity and inclusion into the corporate mission statement, values, and strategic business goals publicized to all stakeholders.

2. Build Accountability via Surveys and Audits:
Conduct regular workforce diversity audits, compensation equity reviews, and employee climate surveys. Link managers' performance appraisals, compensation, and promotions to measurable diversity KPIs.

3. Implement Cultural Awareness and Unconscious Bias Training:
Provide comprehensive training for all employees to cultivate empathy, dismantle stereotypes, and develop cross-cultural communication skills.

4. Establish Executive Mentorship and Sponsorship Programs:
Pair high-potential women and minority employees with senior executive sponsors who actively advocate for their promotion into leadership succession pipelines.

5. Foster Inclusive Communication Networks:
Support Employee Resource Groups (ERGs) and open cross-departmental forums to eliminate segmented communication networks and encourage collaborative dialogue.

Conclusion:
Top management commitment transforms diversity management from a defensive compliance obligation into a proactive source of organizational innovation and sustainable market leadership.`,
      'Top management commitment is vital to drive corporate culture, allocate resources, enforce accountability through audits, and build mentorship programs.',
      'ورک فورس ڈائیورسٹی میں اعلیٰ انتظامیہ کی قیادت کی اہمیت: اعلیٰ حکام کا عزم ادارے کے کلچر کو تبدیل کرتا ہے۔ ضروری اقدامات میں ڈائیورسٹی آڈٹس، تعصب کے خلاف ٹریننگ، اقلیتوں کے لیے مینٹورشپ پروگرامز، اور مینیجرز کی پروموشن کو ڈائیورسٹی اہداف سے جوڑنا شامل ہے۔'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MGT501 — Lecture 6: Historical Perspective of HRM & Evolution of Management Thought
  // ─────────────────────────────────────────────────────────────────────────
  const mgt501L6 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 6`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L6) {
    const l6res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 6, ?)
    `).run(mgt501.id, 'Historical Perspective of HRM & Evolution of Management Thought');
    const l6Id = l6res.lastInsertRowid;

    const insMgt6 = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    // 15 MCQs
    const mcqsMgt6 = [
      {
        stem: 'The father of scientific management is ________.',
        options: JSON.stringify({
          a: 'Deming',
          b: 'Burns',
          c: 'Taylor (Frederick Winslow Taylor)',
          d: 'Hawthorne'
        }),
        correct: 'c',
        explanation: 'Frederick Winslow Taylor (1856–1915) is universally recognized as the Father of Scientific Management.',
        urdu_answer: 'فریڈرک ونسلو ٹیلر (Frederick Winslow Taylor) کو سائنسی انتظام (Scientific Management) کا بانی مانا جاتا ہے۔'
      },
      {
        stem: 'According to the "Hawthorne Studies", the productivity of employees:',
        options: JSON.stringify({
          a: 'Increased by increasing light intensity',
          b: 'Decreased by decreasing light intensity',
          c: 'Increased by observing them (Hawthorne Effect)',
          d: 'No change in their productivity'
        }),
        correct: 'c',
        explanation: 'The Hawthorne Effect demonstrated that employee productivity increased simply because workers felt special and recognized that management was observing and paying attention to them.',
        urdu_answer: 'ہوتھورن اسٹڈیز میں پتہ چلا کہ ملازمین کی پیداواری صلاحیت اس لیے بڑھی کیونکہ انہیں احساس ہوا کہ ان کا مشاہدہ کیا جا رہا ہے (Hawthorne Effect)۔'
      },
      {
        stem: 'Which of the following approach emphasizes the effect of psychological & social factors on employees’ performance?',
        options: JSON.stringify({
          a: 'Scientific approach',
          b: 'Rational approach',
          c: 'Human relations approach',
          d: 'Systematic approach'
        }),
        correct: 'c',
        explanation: 'The Human Relations Approach pioneered by Elton Mayo stresses the decisive influence of psychological, interpersonal, and social group factors on worker performance.',
        urdu_answer: 'ہیومن ریلیشنز اپروچ (Human relations approach) ملازمین کی کارکردگی پر نفسیاتی اور سماجی عوامل کے اثرات پر زور دیتی ہے۔'
      },
      {
        stem: 'In Hawthorne studies, which decisive factor was used in the variation of the workers’ performance during the first stage?',
        options: JSON.stringify({
          a: 'Safety measures',
          b: 'Health condition',
          c: 'Light variation (Illumination)',
          d: 'Salary bonuses'
        }),
        correct: 'c',
        explanation: 'The initial stage of the Hawthorne experiments (1924–1927) was the Illumination Study, which systematically tested the impact of different lighting intensities on assembly output.',
        urdu_answer: 'ہوتھورن اسٹڈیز کے پہلے مرحلے میں روشنی کی کمی بیشی (Light variation / Illumination) کو بنیادی متغیر کے طور پر آزمایا گیا۔'
      },
      {
        stem: 'According to Hawthorne Studies, which of the following work group influenced productivity & employees\' behavior?',
        options: JSON.stringify({
          a: 'Formal',
          b: 'Informal',
          c: 'Reserved',
          d: 'Ceremonial'
        }),
        correct: 'b',
        explanation: 'The Hawthorne Studies discovered that informal peer groups establish internal social norms, output quotas, and behavioral expectations that outweigh formal managerial directives.',
        urdu_answer: 'ہوتھورن اسٹڈیز کے مطابق غیر رسمی گروپس (Informal work groups) ملازمین کے رویے اور پیداواری صلاحیت پر سب سے زیادہ اثر انداز ہوتے ہیں۔'
      },
      {
        stem: 'Scientific management was one of the earliest and best-known statements of the _____________ approach.',
        options: JSON.stringify({
          a: 'Biological',
          b: 'Motivational',
          c: 'Perceptual-Motor',
          d: 'Mechanistic'
        }),
        correct: 'd',
        explanation: 'Scientific Management is the classic representation of the Mechanistic approach, treating human workers as interchangeable, standardized parts of an industrial manufacturing machine.',
        urdu_answer: 'سائنٹیفک مینجمنٹ کو مکینسٹک (Mechanistic) اپروچ کی ابتدائی اور سب سے مشہور مثال سمجھا جاتا ہے۔'
      },
      {
        stem: 'Manufacturing was the main concern of personnel department during:',
        options: JSON.stringify({
          a: 'Mechanistic period',
          b: 'Catalytic period',
          c: 'Organistic period',
          d: 'Strategic period'
        }),
        correct: 'a',
        explanation: 'During the Mechanistic period (late 19th/early 20th century), the personnel department operated solely as an auxiliary to manufacturing, prioritizing shop-floor efficiency and discipline.',
        urdu_answer: 'مکینسٹک دور (Mechanistic period) کے دوران پرسنل ڈیپارٹمنٹ کا بنیادی فوکس فیکٹری پروڈکشن اور مینوفیکچرنگ پر تھا۔'
      },
      {
        stem: 'Organizations started to think about the welfare of their employees / Human Relations approach emerged during:',
        options: JSON.stringify({
          a: '1900–10',
          b: '1910–20',
          c: '1920–30',
          d: '1930–40'
        }),
        correct: 'd',
        explanation: 'The Human Relations Movement and corporate employee welfare initiatives gained major momentum during the 1930–1940 period following the Great Depression and Hawthorne discoveries.',
        urdu_answer: 'اداروں نے ملازمین کی فلاح و بہبود اور تعلقات پر 1930 سے 1940 کی دہائی میں سنجیدگی سے توجہ دینا شروع کی۔'
      },
      {
        stem: 'Which of the following had gained importance during 1970s to save the organizations from courts?',
        options: JSON.stringify({
          a: 'Trade unions',
          b: 'Human relation movement',
          c: 'Employment legislations',
          d: 'None of the given options'
        }),
        correct: 'c',
        explanation: 'During the 1970s (the Legalistic era), compliance with employment legislations (such as equal opportunity, occupational health, and anti-discrimination laws) became crucial to prevent crippling lawsuits.',
        urdu_answer: '1970 کی دہائی میں اداروں کو عدالتی مقدمات اور جرمانوں سے بچانے کے لیے ملازمت سے متعلق قوانین (Employment legislations) نے غیر معمولی اہمیت حاصل کی۔'
      },
      {
        stem: 'Which of the following emerged when individuals realized the strength they could gain by joining together to negotiate with employers?',
        options: JSON.stringify({
          a: 'Trade unions',
          b: 'Human relation movement',
          c: 'Employment legislations',
          d: 'None of the given options'
        }),
        correct: 'a',
        explanation: 'Trade Unions developed as industrial workers realized that collective bargaining provided the leverage needed to negotiate fair wages, safety standards, and humane working hours.',
        urdu_answer: 'جب ملازمین کو اجتماعی طور پر بات چیت کرنے کی طاقت کا احساس ہوا تو ٹریڈ یونینز (Trade unions) کا قیام عمل میں آیا۔'
      },
      {
        stem: 'Organizations started giving more focus on the quality of work life (QWL) during:',
        options: JSON.stringify({
          a: '1960–70',
          b: '1970–80',
          c: '1980–90',
          d: '1990–2000'
        }),
        correct: 'b',
        explanation: 'During the 1970–1980 decade (the Organistic era), management theorists and companies prioritized Quality of Work Life (QWL), employee job enrichment, and psychological fulfillment.',
        urdu_answer: 'اداروں نے کوالٹی آف ورک لائف (QWL) اور کام کے خوشگوار ماحول پر 1970 سے 1980 کے دوران خاص توجہ دی۔'
      },
      {
        stem: 'Organizations started emphasizing on making rules and regulations during:',
        options: JSON.stringify({
          a: 'Mechanistic period',
          b: 'Legalistic period',
          c: 'Catalytic period',
          d: 'Strategic period'
        }),
        correct: 'b',
        explanation: 'The Legalistic period emphasized institutionalizing standardized corporate rules, disciplinary procedures, grievance frameworks, and regulatory compliance.',
        urdu_answer: 'لیگلسٹک دور (Legalistic period) کے دوران اداروں نے سخت قواعد و ضوابط اور قانونی پالیسیوں کے نفاذ پر زور دیا۔'
      },
      {
        stem: 'The roots of soft version of HRM can be traced into which of the following schools of thoughts?',
        options: JSON.stringify({
          a: 'Scientific',
          b: 'Administrative',
          c: 'Human relations',
          d: 'Bureaucratic'
        }),
        correct: 'c',
        explanation: 'Soft HRM (focusing on employee empowerment, trust, intrinsic motivation, and development) has its ideological roots in the Human Relations movement.',
        urdu_answer: 'سافٹ ایچ آر ایم (Soft HRM) کی جڑیں ہیومن ریلیشنز اسکول آف تھاٹ سے جڑی ہوئی ہیں۔'
      },
      {
        stem: 'Scientific management contributed to the development of a more rational approach to management by developing which characteristic?',
        options: JSON.stringify({
          a: 'The planning and organization of work based on scientific principles',
          b: 'Time and motion studies',
          c: 'Standardized pay',
          d: 'Encouragement of trade unions'
        }),
        correct: 'a',
        explanation: 'Scientific management replaced haphazard rule-of-thumb traditions with systematic planning and organization of work based on empirical scientific principles.',
        urdu_answer: 'سائنٹیفک مینجمنٹ نے سائنسی اصولوں کی بنیاد پر کام کی باقاعدہ منصوبہ بندی اور تنظیم کا تصور دیا۔'
      },
      {
        stem: 'Hawthorne studies depict the primary effects of work environment on:',
        options: JSON.stringify({
          a: 'Human Behavior',
          b: 'Human Performance',
          c: 'Human Satisfaction',
          d: 'All the given options'
        }),
        correct: 'a',
        explanation: 'While originally designed to study physical illumination and output, the Hawthorne studies primarily revealed the fundamental power of social and psychological environments over Human Behavior.',
        urdu_answer: 'ہوتھورن اسٹڈیز نے بنیادی طور پر یہ ثابت کیا کہ کام کا ماحول اور سماجی رویے انسانی طرز عمل (Human Behavior) پر گہرا اثر ڈالتے ہیں۔'
      }
    ];

    for (const m of mcqsMgt6) {
      insMgt6.run(l6Id, m.stem, m.options, m.correct, m.explanation, m.urdu_answer);
    }

    // 4 Short Questions (3 marks each)
    const shortsMgt6 = [
      {
        stem: 'What are the Hawthorne Studies? Briefly describe their key stages and the concept of the "Hawthorne Effect."',
        correct: `The Hawthorne Studies & The Hawthorne Effect:

1. Overview:
Conducted between 1924 and 1932 at Western Electric's Hawthorne Works near Chicago by Elton Mayo and Fritz Roethlisberger of Harvard University, the Hawthorne Studies represent the watershed milestone that birthed the Human Relations Movement.

2. Key Stages of the Studies:
• Stage 1 - The Illumination Studies (1924–1927):
  Tested the impact of varying lighting intensities on worker productivity. Surprisingly, output increased whether lighting was heightened, maintained, or dimmed down to moonlight levels.
• Stage 2 - Relay Assembly Test Room (1927–1933):
  Manipulated rest pauses, workday lengths, and refreshments among a small group of female workers. Productivity continuously climbed due to heightened group camaraderie and supervisor attentiveness.
• Stage 3 - Mass Interviewing Program (1928–1930):
  Over 21,000 employees were interviewed, revealing that employee attitudes, grievances, and personal home situations deeply affect on-the-job morale.
• Stage 4 - Bank Wiring Observation Room (1931–1932):
  Demonstrated that informal work groups enforce unwritten production quotas ('rate busters' were socially penalized), proving social norms outweigh financial incentives.

3. The "Hawthorne Effect":
The phenomenon whereby individuals significantly improve or modify their behavior and productivity simply because they are conscious of being observed and feel that management values their presence.`,
        explanation: 'The Hawthorne Studies (Mayo & Roethlisberger, 1924-1932) demonstrated that psychological attention, group dynamics, and being observed (Hawthorne Effect) drive productivity.',
        urdu_answer: 'ہوتھورن اسٹڈیز (1924-1932) ایلٹن میو اور اس کے ساتھیوں نے کیں۔ انہوں نے روشنی اور آرام کے وقفوں کے اثرات جانچے۔ اس سے "Hawthorne Effect" سامنے آیا جس کے مطابق جب ملازمین کو یہ احساس ہوتا ہے کہ ان کا مشاہدہ کیا جا رہا ہے اور ان پر توجہ دی جا رہی ہے تو ان کی پیداواری صلاحیت خود بخود بڑھ جاتی ہے۔'
      },
      {
        stem: 'Differentiate between Scientific Management (Taylorism) and the Human Relations Movement.',
        correct: `Comparison: Scientific Management vs. Human Relations Movement:

1. View of Human Nature:
• Scientific Management (Taylorism): Viewed workers as 'Economic Men' (Rational/Mechanistic)—driven exclusively by financial wages and treated as interchangeable mechanical parts of a factory system.
• Human Relations Movement: Views workers as 'Social Men'—motivated by psychological needs, social recognition, belongingness, respect, and supportive interpersonal relationships.

2. Primary Focus & Methodology:
• Scientific Management: Focuses on physical workflow optimization, time and motion studies, task standardization, elimination of wasted motion, and piece-rate pay incentives.
• Human Relations Movement: Focuses on workplace social climate, supervisory leadership styles, group morale, informal peer networks, and employee communication.

3. Underlying Assumptions:
• Scientific Management: Assumed management does all the thinking and planning; workers simply obey precise mechanical instructions.
• Human Relations Movement: Recognizes that employee participation, open communication, and psychological well-being directly govern sustainable high productivity.`,
        explanation: 'Scientific management treated workers mechanistically as economic beings driven by pay; Human relations viewed workers as social beings driven by psychological and interpersonal needs.',
        urdu_answer: 'سائنٹیفک مینجمنٹ ورکرز کو ایک مشین کا پرزہ اور صرف پیسوں سے موٹیویٹ ہونے والا انسان سمجھتی تھی جس کا حل وقت اور حرکات کی جانچ (Time & Motion studies) تھا۔ جبکہ ہیومن ریلیشنز تحریک نے ثابت کیا کہ انسان سماجی اور نفسیاتی ضروریات رکھتا ہے اور عزت و اچھے ماحول سے بہترین کام کرتا ہے۔'
      },
      {
        stem: 'Enlist the four historical eras/periods of HRM evolution (Mechanistic, Legalistic, Organistic, and Catalytic/Strategic) and mention the focus of each.',
        correct: `The Four Historical Eras of HRM Evolution:

1. Mechanistic Period (Late 19th Century – Early 20th Century):
• Focus: Industrial manufacturing efficiency, shop-floor discipline, and physical output. Personnel management operated mechanically to hire, pay, and enforce factory rules under Taylorist principles.

2. Legalistic Period (1960s – 1970s):
• Focus: Statutory compliance with emerging labor laws and employment legislations (e.g., civil rights, equal employment opportunity, workplace health, and union contracts) to insulate the organization from costly lawsuits.

3. Organistic Period (1970s – 1980s):
• Focus: Human development, organizational growth, and Quality of Work Life (QWL). Treated the organization as a living biological organism where employee satisfaction, job enrichment, and wellness programs flourish.

4. Catalytic / Strategic Period (1990s – Present):
• Focus: Strategic HRM as a proactive driver of competitive advantage. HR leaders serve as business partners who align workforce competencies directly with corporate long-term vision, technological transformation, and global market innovation.`,
        explanation: 'Four eras: 1. Mechanistic (factory efficiency), 2. Legalistic (legal compliance), 3. Organistic (Quality of Work Life & development), 4. Catalytic/Strategic (HR as strategic competitive advantage).',
        urdu_answer: 'HRM کے چار تاریخی ادوار: 1. مکینسٹک دور (فیکٹری اور مینوفیکچرنگ کی پیداوار پر فوکس)، 2. لیگلسٹک دور (قوانین کی پابندی اور مقدمات سے بچاؤ)، 3. آرگینسٹک دور (کوالٹی آف ورک لائف اور ملازمین کی فلاح)، اور 4. کیٹالیٹک/اسٹریٹجک دور (ایچ آر کو کاروباری مسابقت کا اسٹریٹجک پارٹنر بنانا)۔'
      },
      {
        stem: 'What role did Trade Unions and Employment Legislation play in transforming Personnel Management into modern HRM?',
        correct: `The Role of Trade Unions and Employment Legislation in Transforming HRM:

1. The Catalytic Impact of Trade Unions:
• Industrial workers historically suffered under exploitative sweatshop conditions, long hours, and hazardous environments.
• By banding together into Trade Unions, workers mobilized collective bargaining power.
• Management was compelled to establish formal Personnel Departments to negotiate labor contracts, establish standardized wage scales, resolve employee grievances, and prevent devastating production strikes.

2. The Impact of Employment Legislation (1960s–1970s):
• Governments enacted landmark workplace laws governing Equal Employment Opportunity (EEO), minimum wages, child labor bans, workplace safety (OSHA), and pension security.
• Personnel administration shifted from arbitrary managerial whim to structured, legally defensible human resource policies.
• To avoid heavy regulatory penalties and litigation, companies elevated personnel managers to senior compliance advisors, laying the institutional groundwork for modern, professionalized Human Resource Management.`,
        explanation: 'Unions forced management to establish grievance and contract systems; employment legislation institutionalized objective, fair HR policies to prevent legal liabilities.',
        urdu_answer: 'ٹریڈ یونینز کے اجتماعی دباؤ نے اداروں کو منصفانہ اجرت اور اوقات کار طے کرنے پر مجبور کیا جس کے لیے پرسنل ڈیپارٹمنٹس بنے۔ جبکہ حکومتی قوانین (Employment Legislations) نے اداروں کو مجبور کیا کہ وہ نوکری دینے، پروموشن اور تنخواہوں میں قانونی تقاضے پورے کریں، جس سے جدید پروفیشنل HRM نے جنم لیا۔'
      }
    ];

    const insMgt6Short = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    for (const s of shortsMgt6) {
      insMgt6Short.run(l6Id, s.stem, s.correct, s.explanation, s.urdu_answer);
    }

    // 2 Long Questions (5 marks each)
    const longsMgt6 = [
      {
        stem: `Explain the Hawthorne Studies in detail. Discuss the various stages of the experiments, the key conclusions drawn regarding worker behavior, and how these studies shifted managerial focus toward psychological and social factors in the workplace.`,
        correct: `Comprehensive Analysis of the Hawthorne Studies:

1. Historical Background and Objective:
Initiated in 1924 at the Western Electric Hawthorne Works in Chicago by Elton Mayo, Fritz Roethlisberger, and their Harvard research team, the studies initially sought to determine whether physical working conditions (such as lighting levels and temperature) directly dictated factory productivity under classical scientific management assumptions.

2. Chronological Stages of the Experiments:
• The Illumination Experiments (1924–1927):
  - Workers were divided into test and control groups. In the test group, lighting was systematically increased and decreased.
  - Astonishingly, productivity rose in both groups. Even when illumination was reduced to the dimness of moonlight, production continued to rise. Researchers concluded that psychological variables, rather than physical light, drove the results.
• The Relay Assembly Test Room (1927–1933):
  - Six female assembly workers were placed in a dedicated observation room. Researchers systematically altered rest breaks, workday lengths, free lunches, and temperature.
  - Output increased consistently across almost all variations. The researchers discovered that the women formed an enthusiastic social team, felt respected by non-authoritarian supervisors, and were motivated by special recognition.
• The Mass Interviewing Program (1928–1930):
  - In-depth non-directive interviews conducted with over 21,000 employees revealed that workers were deeply influenced by subjective feelings, home environments, emotional security, and status within peer groups rather than raw monetary piece rates alone.
• The Bank Wiring Observation Room (1931–1932):
  - Observed 14 male telephone switchboard wirers. The men established an informal social code with strict production limits: workers who produced too much were labeled 'rate busters' and ostracized; workers who produced too little were called 'chiselers'. Group solidarity proved vastly more influential than management's financial bonus system.

3. Key Conclusions Drawn:
• The 'Social Man' Concept: Workers are complex social beings motivated by social recognition, belonging, and emotional validation rather than mere financial incentives ('Economic Man').
• The Supremacy of Informal Groups: Informal work groups create peer pressure and unwritten social norms that dictate actual shop-floor output.
• The Hawthorne Effect: Being observed, consulted, and valued by management creates an intrinsic psychological lift that accelerates engagement and performance.
• Participative Supervision: Democratic, empathetic supervision yields far superior morale and sustained productivity compared to coercive, autocratic oversight.`,
        explanation: 'The Hawthorne Studies (Illumination, Relay Room, Interviewing, Bank Wiring) established the Human Relations Movement by proving social and psychological factors outweigh physical conditions.',
        urdu_answer: 'ہوتھورن تجربات چار مراحل (روشنی کے تجربات، ریلے اسمبلی، وسیع انٹرویوز، اور بینک وائرنگ روم) پر مشتمل تھے۔ اس سے یہ بنیادی نتائج برآمد ہوئے کہ ورکرز صرف پیسے کے لالچ میں کام نہیں کرتے بلکہ سماجی تعلقات، غیر رسمی گروپ کا دباؤ، مینجمنٹ کی جانب سے دی جانے والی عزت اور مشاہدہ (Hawthorne Effect) ان کی کارکردگی میں فیصلہ کن کردار ادا کرتے ہیں۔'
      },
      {
        stem: `Trace the historical evolution of Human Resource Management from the Industrial Revolution to the modern strategic era. Detail the key characteristics, philosophies, and primary concerns of the Mechanistic, Legalistic, Organistic, and Catalytic periods.`,
        correct: `The Historical Evolution of Human Resource Management:

Human Resource Management evolved across four distinct historical eras, reflecting shifting economic realities, legal landscapes, and behavioral science insights:

1. The Mechanistic Period (Late 19th Century to 1950s):
• Philosophical Foundation: Scientific Management (Taylorism) and Classical Bureaucracy (Max Weber).
• View of Workers: Mechanistic cogs in an industrial production apparatus. Employees were assumed to be indolent, rational economic actors motivated purely by fear of dismissal and piece-rate pay.
• Key Concerns: Maximizing physical shop-floor output, standardizing job movements (Time and Motion studies), strict supervisory policing, and manual record-keeping. The "Personnel Department" functioned largely as an administrative clerk's office for hiring and payroll.

2. The Legalistic Period (1960s to 1970s):
• Philosophical Foundation: Administrative compliance, social justice movements, and governmental regulation.
• View of Workers: Legal rights-holders who must be shielded from unfair labor exploitation, bias, and unsafe environments.
• Key Concerns: Sweeping labor legislation (Civil Rights Act, Equal Pay, OSHA, anti-discrimination statutes) subjected corporate hiring, evaluation, and firing to intense judicial scrutiny. Personnel managers transformed into legal compliance officers focused on drafting watertight policies, managing union negotiations, and avoiding costly courtroom lawsuits.

3. The Organistic Period (1970s to 1980s):
• Philosophical Foundation: Human Relations Movement, Organizational Psychology, and Systems Theory.
• View of Workers: Complex human assets possessing creative, emotional, and social needs requiring holistic nurturing.
• Key Concerns: Organizations were viewed as living biological organisms. Emphasis pivoted toward Quality of Work Life (QWL), employee wellness programs, job enrichment, career development planning, and collaborative team-building.

4. The Catalytic / Strategic Period (1990s to Present):
• Philosophical Foundation: Strategic Human Resource Management (SHRM) and the Resource-Based View (RBV) of the firm.
• View of Workers: The primary source of sustainable competitive advantage and intellectual capital in a global knowledge economy.
• Key Concerns: HR functions as a proactive business partner at the boardroom level. Key activities include strategic workforce planning, talent acquisition, leadership succession pipelines, continuous organizational learning, diversity management, and agile digital transformation aligned directly with enterprise profitability.`,
        explanation: 'Traces HRM through 4 eras: Mechanistic (Taylorist factory efficiency), Legalistic (labor law compliance), Organistic (Quality of Work Life & wellness), and Catalytic/Strategic (HR as competitive advantage).',
        urdu_answer: 'HRM کے تاریخی ارتقاء کے چار ادوار: (1) مکینسٹک دور: مزدوروں کو مشین کی طرح استعمال کرنا اور سائنسی طریقوں سے فیکٹری آؤٹ پٹ بڑھانا۔ (2) لیگلسٹک دور: حکومتی قوانین اور مقدمات سے بچنے کے لیے رولز اور لیبر یونینز کے معاہدوں پر عملدرآمد۔ (3) آرگینسٹک دور: کوالٹی آف ورک لائف اور ورکرز کی ذاتی و پیشہ ورانہ فلاح پر توجہ۔ (4) کیٹالیٹک/اسٹریٹجک دور: ایچ آر کو ادارے کے طویل مدتی اسٹریٹجک اہداف اور کاروباری مسابقت کا انجن بنانا۔'
      }
    ];

    const insMgt6Long = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    for (const l of longsMgt6) {
      insMgt6Long.run(l6Id, l.stem, l.correct, l.explanation, l.urdu_answer);
    }
  }

  // ── MGT501 - Lecture 7: Environmental Challenges & HR Management ──
  const mgt501L7 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 7`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L7) {
    const l7res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 7, ?)
    `).run(mgt501.id, 'Environmental Challenges & HR Management');
    const l7Id = l7res.lastInsertRowid;

    const mcqsMgt7 = [
      {
        stem: 'A practice used by different companies to reduce costs by transferring portions of work to outside provider rather than completing it internally is termed as:',
        options: ['Planning', 'Decentralization', 'Restructuring', 'Outsourcing'],
        correct: 'Outsourcing',
        explanation: 'Outsourcing is the strategic practice of contracting business functions or operational tasks out to external specialized suppliers instead of handling them internally, primarily to decrease operating expenses and focus on core organizational strengths. (Appeared in 22 past paper files; Handouts page 31)',
        urdu_answer: 'آؤٹ سورسنگ (Outsourcing) سے مراد لاگت کم کرنے اور بنیادی مقاصد پر توجہ مرکوز کرنے کے لیے تنظیمی کاموں کو کسی بیرونی وینڈر یا سپلائر کے سپرد کرنا ہے۔'
      },
      {
        stem: 'SWOT Analysis is a tool for:',
        options: ['Determining the mission', 'Dividing missions into goals', 'Scanning the environment', 'Monitoring frequent performances'],
        correct: 'Scanning the environment',
        explanation: 'SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis is a foundational strategic management tool utilized for environmental scanning to appraise internal organizational competencies against external market trends and hazards. (Appeared in 14 past paper files; Handouts page 30)',
        urdu_answer: 'سواٹ (SWOT) اینالیسس اندرونی طاقتوں، کمزوریوں اور بیرونی مواقع و خطرات کا تجزیہ کرکے ماحولیاتی جانچ (Environmental Scanning) کا بنیادی ذریعہ ہے۔'
      },
      {
        stem: 'Unilever is serving all around the world with its diversified products, it is said to be practicing:',
        options: ['Technological advancements', 'Rapid changes', 'Stakeholders\' management', 'Business globalization'],
        correct: 'Business globalization',
        explanation: 'Business globalization refers to the expansion of corporate production, marketing, and distribution operations worldwide, enabling multinationals like Unilever to compete across international markets and diverse consumer demographics. (Appeared in 11 past paper files; Handouts page 30)',
        urdu_answer: 'یونی لیور کا دنیا بھر میں متنوع پراڈکٹس فروخت کرنا بزنس گلوبلائزیشن (Business Globalization) کی واضح مثال ہے۔'
      },
      {
        stem: 'Which of the following practice involves the selling off portions of the company and making severe staff reductions? / When a firm changes the way it operates, the process is known as:',
        options: ['Redesigning', 'Restructuring', 'Organizational designing', 'Reengineering'],
        correct: 'Restructuring',
        explanation: 'Restructuring involves altering the operational, structural, or capital framework of an enterprise, frequently through divestitures, closing unprofitable divisions, and significantly reducing workforce size. (Appeared in 12 past paper files; Handouts page 31)',
        urdu_answer: 'ری اسٹرکچرنگ (Restructuring) میں ادارے کی ساخت اور کام کرنے کے طریقے کو بدلنا شامل ہے، جس میں فالتو حصوں کو بیچنا یا عملے میں بڑی کٹوتی کرنا شامل ہے۔'
      },
      {
        stem: "PTCL has implemented 'golden-handshake scheme' and layoff surplus employees. PTCL is said to be involved in:",
        options: ['Restructuring', 'Re-engineering', 'Downsizing', 'Outsourcing'],
        correct: 'Restructuring',
        explanation: "Offering voluntary retirement plans, golden handshakes, and shedding redundant labor pools are strategic initiatives embedded within comprehensive corporate restructuring. (Appeared in 9 past paper files; Handouts page 31)",
        urdu_answer: 'پی ٹی سی ایل کی جانب سے گولڈن ہینڈ شیک اسکیم اور زائد ملازمین کی برطرفی تنظیمی ری اسٹرکچرنگ (Restructuring) کے زمرے میں آتی ہے۔'
      },
      {
        stem: "Periodic reductions in a company's work force to improve its bottom line is often called:",
        options: ['Restructuring', 'Downsizing', 'Outsourcing', 'Reengineering'],
        correct: 'Downsizing',
        explanation: 'Downsizing refers specifically to planned, systemic reductions in employee headcount designed to shrink operational payroll overheads and bolster enterprise profitability. (Appeared in 8 past paper files; Handouts page 31)',
        urdu_answer: 'اخراجات میں کمی اور منافع بہتر بنانے کے لیے ملازمین کی تعداد میں باقاعدہ کمی کو ڈاؤن سائزنگ (Downsizing) کہا جاتا ہے۔'
      },
      {
        stem: 'Shifting from manual to computerized system is resulted due to:',
        options: ['Workforce diversity', 'Technological advancement', 'Stakeholders\' involvement', 'Globalization'],
        correct: 'Technological advancement',
        explanation: 'Technological advancement drives workflow automation and digital transformation, migrating traditional paper-based manual tasks into high-speed computerized information systems. (Appeared in 15 past paper files; Handouts page 30)',
        urdu_answer: 'دستی نظام سے کمپیوٹرائزڈ نظام میں تبدیلی تکنیکی ترقی (Technological Advancement) کا براہ راست نتیجہ ہے۔'
      },
      {
        stem: 'Brain drain is one of the:',
        options: ['Organizational threat', 'Organizational opportunity', 'Organizational strength', 'Organizational weakness'],
        correct: 'Organizational threat',
        explanation: 'Brain drain—the mass departure or loss of highly trained, competent, and experienced knowledge workers to foreign markets or competitors—represents a major external environmental threat to organizations and national economies. (Appeared in 12 past paper files; Handouts page 32)',
        urdu_answer: 'برین ڈرین (اعلیٰ صلاحیت کے حامل ملازمین کا ادارہ یا ملک چھوڑ جانا) ادارے کے لیے ایک ماحولیاتی خطرہ (Threat) ہے۔'
      },
      {
        stem: 'A problem faced by the organization due to presence of people having different nationalities is an:',
        options: ['Environmental Challenge', 'Organizational Challenge', 'Individual Challenge', 'None of the above'],
        correct: 'Environmental Challenge',
        explanation: 'Workforce diversity stemming from multiple cultural, ethnic, and national identities is an Environmental Challenge originating from broader societal globalization and demographic shifts. (Appeared in 6 past paper files; Handouts page 30)',
        urdu_answer: 'مختلف قومیتوں کے ملازمین کے باعث پیدا ہونے والے مسائل اور ان کی ہم آہنگی ماحولیاتی چیلنج (Environmental Challenge) کا حصہ ہیں۔'
      },
      {
        stem: 'What could be the best approach for an organization to sustain in a dynamic environment?',
        options: ['Be stagnant', 'Responsive to change', 'Reluctant to change', 'Merge with others'],
        correct: 'Responsive to change',
        explanation: 'To survive and retain competitive viability in dynamic and unpredictable environments, an organization must cultivate strategic flexibility and remain proactively responsive to emerging changes. (Appeared in 10 past paper files; Handouts page 30)',
        urdu_answer: 'متحرک اور بدلتے ہوئے ماحول میں پائیداری کے لیے ادارے کا سب سے بہترین رویہ تبدیلی کے لیے متحرک اور جوابدہ (Responsive to change) ہونا ہے۔'
      },
      {
        stem: "Redesigning of an organization's processes, from materials acquisition, to production, to marketing and distribution is called:",
        options: ['Innovation', 'Restructuring', 'Reengineering', 'Supply chain management'],
        correct: 'Reengineering',
        explanation: 'Business Process Reengineering (BPR) entails the fundamental rethinking and radical redesign of core business processes from end to end to achieve dramatic breakthroughs in performance metrics like cost, speed, and service. (Appeared in 7 past paper files; Handouts page 31)',
        urdu_answer: 'خام مال کی خریداری سے لے کر پیداوار، مارکیٹنگ اور تقسیم کے تمام مراحل کی بنیادی اور انقلابی نئی ساخت کو ری انجینئرنگ (Reengineering) کہتے ہیں۔'
      },
      {
        stem: 'Today organizations are facing challenges upon following levels EXCEPT:',
        options: ['Marketing challenges', 'Organizational challenges', 'Individual challenges', 'Environmental challenges'],
        correct: 'Marketing challenges',
        explanation: 'Contemporary human resource management frameworks classify operational and strategic pressures into three overarching tiers: Environmental, Organizational, and Individual challenges. (Appeared in 5 past paper files; Handouts page 30)',
        urdu_answer: 'ایچ آر ایم لٹریچر میں تنظیمی چیلنجز کو تین سطحوں (ماحولیاتی، تنظیمی، اور انفرادی) میں تقسیم کیا گیا ہے، مارکیٹنگ چیلنجز اس زمرے میں نہیں آتے۔'
      },
      {
        stem: 'Cost of human resource increases considerably due to which of the following?',
        options: ['Cost of production', 'Rate of absenteeism', 'Complicated technology', 'Outdated equipment'],
        correct: 'Complicated technology',
        explanation: 'Integrating complicated advanced technologies significantly elevates HR costs due to premium recruitment compensation for specialized technicians and the imperative for continuous, high-cost training programs. (Appeared in 6 past paper files; Handouts page 30)',
        urdu_answer: 'پیچیدہ اور جدید ٹیکنالوجی (Complicated technology) کو اپنانے سے ماہر افراد کی بھرتی اور مہنگی تربیت کے باعث انسانی وسائل کی لاگت میں نمایاں اضافہ ہوتا ہے۔'
      },
      {
        stem: 'To encourage and authorize workers to take initiatives to reduce costs, improve operations, product quality and customer service is known as:',
        options: ['Authority', 'Decentralization', 'Empowerment', 'Centralization'],
        correct: 'Decentralization',
        explanation: 'Decentralization distributes managerial decision-making authority outward to operational personnel, fostering empowerment and encouraging frontline employees to take initiative in cost reduction and quality enhancement. (Appeared in 8 past paper files; Handouts page 31)',
        urdu_answer: 'اختیارات کو نچلی سطح کے ملازمین میں تقسیم کرنا تاکہ وہ خود فیصلے اور اصلاحی اقدامات کر سکیں، ڈی سینٹرلائزیشن (Decentralization) کہلاتا ہے۔'
      },
      {
        stem: 'Which of the following is NOT an organizational challenge in the current dynamic environment?',
        options: ['Productivity', 'Restructuring', 'Decentralization', 'Quality management'],
        correct: 'Productivity',
        explanation: 'Productivity is classified as an Individual Challenge (concerning employee performance, motivation, and ethical engagement), whereas restructuring, decentralization, and quality management constitute Organizational Challenges. (Appeared in 6 past paper files; Handouts page 30-31)',
        urdu_answer: 'پروڈکٹیوٹی (Productivity) کا تعلق فرد اور اس کی کارکردگی یعنی انفرادی چیلنج سے ہے، یہ تنظیمی چیلنج کا حصہ نہیں ہے۔'
      }
    ];

    const insMgt7Mcq = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    for (const m of mcqsMgt7) {
      insMgt7Mcq.run(l7Id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
    }

    const shortsMgt7 = [
      {
        stem: 'Define Environmental Scanning. How is SWOT Analysis used as a tool for environmental scanning?',
        correct: `Environmental Scanning and SWOT Analysis in HRM:

1. Definition of Environmental Scanning:
Environmental scanning is the systematic process of gathering, analyzing, and monitoring external and internal information to detect strategic trends, changes, threats, and emerging opportunities that could influence an organization's performance, human resource needs, and competitiveness.

2. Role of SWOT Analysis as a Scanning Tool:
SWOT Analysis serves as a strategic framework to translate environmental scanning observations into actionable HR strategies:
• Internal Analysis (Strengths & Weaknesses):
  - Strengths: Core employee competencies, proprietary knowledge, robust training infrastructure, low turnover, and a collaborative organizational culture.
  - Weaknesses: Severe skill shortages, outdated technological skills, poor employee morale, non-competitive pay structures, or high absenteeism.
• External Analysis (Opportunities & Threats):
  - Opportunities: Emerging global markets, demographic talent influxes, advanced automation tools, and strategic outsourcing options.
  - Threats: Competitor poaching (brain drain), stringent labor regulations, economic recessions, and rapid disruptive technology.

By synthesizing internal capabilities with external realities, HR leaders can strategically align talent acquisition, upskilling, and retention policies.`,
        explanation: 'Environmental scanning continuously monitors internal and external environments. SWOT analysis evaluates internal Strengths & Weaknesses against external Opportunities & Threats to guide strategic HR planning.',
        urdu_answer: 'ماحولیاتی اسکیننگ (Environmental Scanning) بیرونی اور اندرونی حالات پر نظر رکھنے کا نام ہے۔ سواٹ (SWOT) اندرونی طاقتوں اور کمزوریوں کا بیرونی مواقع اور خطرات سے موازنہ کر کے حکمت عملی وضع کرنے کا ٹول ہے۔'
      },
      {
        stem: 'Briefly differentiate between Environmental Challenges, Organizational Challenges, and Individual Challenges in HRM with examples.',
        correct: `Three Major Categories of Challenges in Modern HRM:

1. Environmental Challenges:
• Definition: Macro-level external pressures and trends outside the direct control of the organization that profoundly shape workforce dynamics and strategic choices.
• Key Examples: Rapid technological change, workforce diversity (multicultural staff), economic globalization, evolving labor legislation, shifts in work-family roles, and global skill shortages.

2. Organizational Challenges:
• Definition: Meso-level internal strategic and structural issues regarding how an organization structures its operations, utilizes resources, and configures teams to achieve competitive advantage.
• Key Examples: Enhancing competitive position, decentralization, organizational restructuring, workforce downsizing, transitioning to self-managed work teams, cultivating organizational culture, and outsourcing non-core functions.

3. Individual Challenges:
• Definition: Micro-level factors centered specifically on the individual employee, psychological contracts, ethical conduct, personal productivity, and employee-organization matching.
• Key Examples: Person-organization fit, business ethics and social responsibility, individual productivity, employee empowerment, addressing job insecurity, and curbing brain drain.`,
        explanation: 'Categorizes HRM challenges into Environmental (macro external forces like globalization and technology), Organizational (internal structures like restructuring and outsourcing), and Individual (micro employee factors like empowerment and ethics).',
        urdu_answer: 'ایچ آر ایم چیلنجز کے تین درجات ہیں: (1) ماحولیاتی (بیرونی عوامل جیسے عالمگیریت، ٹیکنالوجی)، (2) تنظیمی (اندرونی اسٹرکچر، ری اسٹرکچرنگ، آؤٹ سورسنگ)، اور (3) انفرادی (ملازمین کی کارکردگی، اخلاقیات، ایمپاورمنٹ)۔'
      },
      {
        stem: 'Differentiate between Outsourcing, Restructuring, and Downsizing in the context of organizational cost control.',
        correct: `Comparison of Outsourcing, Restructuring, and Downsizing:

1. Outsourcing:
• Focus: Shifting non-core business activities, processes, or departmental functions (e.g., payroll, customer call centers, IT maintenance) to specialized third-party external vendors.
• Primary Objective: Focus on core strategic business competencies, access specialized technical expertise, and convert high fixed payroll costs into flexible variable operational costs.

2. Restructuring:
• Focus: Fundamental modification of an organization's operational, structural, or governance architecture. This includes delayering hierarchy levels, merging departments, establishing cross-functional teams, or selling off unprofitable business units.
• Primary Objective: Improve operational agility, eliminate bureaucratic bottlenecks, and respond flexibly to market dynamics.

3. Downsizing:
• Focus: A planned, permanent reduction in employee headcount through voluntary separation schemes (golden handshakes), early retirements, hiring freezes, or direct mass layoffs.
• Primary Objective: Rapid and immediate reduction in payroll and operating expenses to preserve financial solvency or improve the bottom line during downturns.`,
        explanation: 'Outsourcing delegates non-core tasks to outside vendors; Restructuring fundamentally reorganizes internal hierarchies and business units; Downsizing permanently cuts staff headcount to slash operating payroll costs.',
        urdu_answer: 'آؤٹ سورسنگ میں غیر بنیادی کام بیرونی وینڈرز کو دیے جاتے ہیں؛ ری اسٹرکچرنگ میں تنظیمی ڈھانچے اور کام کرنے کے طریقے کو بدلا جاتا ہے؛ جبکہ ڈاؤن سائزنگ میں اخراجات کم کرنے کے لیے ملازمین کی تعداد مستقل کم کی جاتی ہے۔'
      },
      {
        stem: 'What is Reengineering? How does it differ from Restructuring?',
        correct: `Reengineering vs. Restructuring:

1. Business Process Reengineering (BPR):
• Definition: The fundamental rethinking and radical redesign of end-to-end business workflows and processes (from raw material procurement to post-sale customer support) to achieve dramatic breakthroughs in key metrics like cost, quality, service, and speed.
• Core Mechanism: Completely discards existing legacy procedures and designs optimized, technology-enabled processes from a clean slate.

2. Restructuring:
• Definition: Modifying the administrative reporting relationships, authority chains, departmental divisions, and physical sizing of an organization.
• Core Mechanism: Reallocates headcount, eliminates management tiers (flattening hierarchy), and disposes of non-profitable business units.

Key Distinction:
Reengineering focuses on "how work gets done" (process re-architecting for efficiency and value delivery), whereas Restructuring focuses on "how the organization is configured" (hierarchical structure, staffing headcount, and corporate ownership).`,
        explanation: 'Reengineering radically re-architects core operational processes and workflows from scratch; Restructuring alters administrative reporting structures, business units, and organizational headcount.',
        urdu_answer: 'ری انجینئرنگ کام کرنے کے بنیادی پروسیسز اور طریقہ کار کو سرے سے نیا بناتی ہے، جبکہ ری اسٹرکچرنگ ادارے کے تنظیمی ڈھانچے، شعبوں اور عملے کی تعداد میں تبدیلی لاتی ہے۔'
      },
      {
        stem: "What is 'Brain Drain'? Why is it considered a major challenge/threat for modern organizations?",
        correct: `Brain Drain and Its Strategic Implications in HRM:

1. Definition of Brain Drain:
Brain drain refers to the large-scale departure or international migration of educated, highly skilled, experienced, and talented professionals (such as software engineers, physicians, senior researchers, and executive leaders) from an organization or home country to foreign competitors or overseas economies offering superior compensation and working conditions.

2. Why Brain Drain is a Severe Organizational Threat:
• Loss of Intellectual Capital: The departure of key knowledge creators strips the organization of institutional memory, specialized expertise, and proprietary technical skills.
• Massive Financial Costs: Significant investments spent on recruitment, onboarding, and high-level training are completely lost, requiring duplicate outlays to find replacements.
• Competitive Disadvantage: Top talent often migrates directly to rival firms, transferring valuable competitive and strategic insights to competitors.
• Disruption of Operations: Premature resignations of critical project leaders stall research, compromise product delivery deadlines, and degrade overall operational quality.
• Morale Deterioration: Constant turnover among top achievers creates anxiety, increases workload on remaining staff, and triggers further resignation waves.`,
        explanation: 'Brain drain is the loss of intellectual capital and skilled human assets to rivals or overseas markets. It creates massive financial losses, disrupts innovation, and weakens organizational competitiveness.',
        urdu_answer: 'برین ڈرین سے مراد باصلاحیت اور تعلیم یافتہ افراد کا ادارہ یا ملک چھوڑ کر جانا ہے۔ یہ ادارے کے لیے انٹلیکچوئل کیپیٹل اور سرمایہ کاری کے نقصان، آپریشنل رکاوٹوں اور کمزور مسابقتی پوزیشن کا باعث بنتا ہے۔'
      }
    ];

    const insMgt7Short = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    for (const s of shortsMgt7) {
      insMgt7Short.run(l7Id, s.stem, s.correct, s.explanation, s.urdu_answer);
    }

    const longsMgt7 = [
      {
        stem: `Discuss in detail the three major categories of challenges faced by Human Resource Managers in a rapidly changing environment:
1. Environmental Challenges (Rapid change, Workforce diversity, Globalization, Technology, Legislation, Work/Family roles, Skill shortages)
2. Organizational Challenges (Competitive position, Decentralization, Downsizing, Restructuring, Culture, Outsourcing)
3. Individual Challenges (Matching people and organization, Ethics & Social Responsibility, Productivity, Empowerment, Brain drain, Job insecurity)`,
        correct: `Comprehensive Framework of Modern HRM Challenges:

Human resource management operates at the intersection of external macro pressures, internal organizational designs, and individual human behavior. HR leaders must navigate three overarching categories of challenges:

I. Environmental Challenges (External Macro-Level Forces):
Forces emerging from outside the enterprise that exert powerful, non-negotiable pressures on business strategy:
1. Rapid Change: Volatile market demands, disruptive business models, and shortened product lifecycles require agile workforce adaptation.
2. Workforce Diversity: Demographic diversification across gender, age, ethnicity, and nationalities requires inclusive HR policies that combat bias and foster collaboration.
3. Globalization: Worldwide expansion forces HR to manage cross-cultural virtual teams, global compensation scales, and international labor standards.
4. Technological Advancement: The proliferation of cloud automation, AI, and digital workspaces shifts workflows from manual execution to digital oversight, escalating the need for continuous tech upskilling.
5. Legislation & Regulatory Compliance: Constantly evolving employment laws (anti-harassment, minimum wage, OSHA, data privacy) require rigorous legal adherence.
6. Evolving Work and Family Roles: The rise of dual-career couples demands flexible working hours, telecommuting, and parental support initiatives.
7. Skill Shortages: Widening gaps between academic training and industry demands compel organizations to invest heavily in corporate learning academies.

II. Organizational Challenges (Internal Meso-Level Strategic Issues):
Structural and operational challenges regarding how the organization configures its resources to sustain competitive viability:
1. Sustaining Competitive Position: Controlling human capital costs while simultaneously cultivating superior innovation, speed, and service quality.
2. Decentralization: Delegating operational authority to front-line divisions, empowering localized teams to make rapid customer-centric decisions.
3. Downsizing: Managing necessary labor reductions compassionately while mitigating the negative psychological impacts on remaining 'survivor' employees.
4. Organizational Restructuring: Delayering hierarchies, eliminating bureaucratic bottlenecks, and structuring cross-functional problem-solving units.
5. Fostering Adaptive Culture: Establishing shared values, transparency, and psychological safety to sustain high performance amidst continuous change.
6. Strategic Outsourcing: Partnering with external specialist providers for non-core workflows (payroll, logistics) to maximize focus on core enterprise capabilities.

III. Individual Challenges (Micro-Level Human Factors):
Pressures directly addressing the relationship between the employee and the enterprise:
1. Matching People and Organizations (Person-Organization Fit): Selecting candidates whose personal values and competencies align with corporate culture and strategic objectives.
2. Ethics and Corporate Social Responsibility: Enforcing transparent ethical standards, anti-corruption policies, and equitable employee treatment.
3. Maximizing Productivity: Fostering high-performance environments through fair compensation, merit-based recognition, and developmental appraisal systems.
4. Employee Empowerment: Granting workers autonomy, tools, and authority to take initiative without perpetual supervisory micro-management.
5. Mitigating Brain Drain: Preventing talent flight through competitive compensation, leadership mentoring, and clear career progression pathways.
6. Overcoming Job Insecurity: Counteracting employee anxiety driven by restructuring and automation to sustain organizational commitment and engagement.`,
        explanation: 'Provides a thorough analysis of the tripartite HRM challenge framework: Environmental (macro trends), Organizational (structural configurations), and Individual (micro behavioral and motivational factors).',
        urdu_answer: 'ایچ آر ایم چیلنجز کا جامع تجزیہ: (1) ماحولیاتی چیلنجز (تیز رفتار تبدیلی، تنوع، عالمگیریت، ٹیکنالوجی اور قانون سازی)، (2) تنظیمی چیلنجز (مسابقت، ڈی سینٹرلائزیشن، ڈاؤن سائزنگ، ری اسٹرکچرنگ، کلچر، آؤٹ سورسنگ)، اور (3) انفرادی چیلنجز (افراد اور تنظیم کی ہم آہنگی، اخلاقیات، پروڈکٹیوٹی، ایمپاورمنٹ، برین ڈرین اور ملازمت کے تحفظ کا احساس)۔'
      },
      {
        stem: `How do technological advances, globalization, and outsourcing influence modern Human Resource Management? Explain how organizations adapt to maintain competitive advantage through these trends.`,
        correct: `Impact of Technology, Globalization, and Outsourcing on Modern HRM:

Modern human resource management has transitioned from a routine administrative function into a proactive strategic driver due to the converging forces of technological progress, globalization, and strategic outsourcing.

1. Impact of Technological Advances:
• Workflow Transformation: Transitioning from manual record-keeping to Enterprise Resource Planning (ERP) and Human Resource Information Systems (HRIS).
• Talent Acquisition & Big Data: AI-driven applicant screening, digital interviews, and people analytics for predictive retention modeling.
• Remote and Virtual Work: Digital collaboration tools enable decentralized global workforces, requiring virtual performance management frameworks.
• Organizational Adaptation: To maintain competitive advantage, organizations continuously retrain staff, build digital literacy, and foster cultures of continuous lifelong learning.

2. Impact of Business Globalization:
• Cultural Diversity & Integration: Multinationals must harmonize heterogeneous workforces possessing diverse cultural expectations, communication styles, and workplace values.
• Expatriate Management: Selecting, training, and supporting international assignees, while managing cross-border labor compliance and local employment laws.
• 24/7 Operations: Managing asynchronous workflows across multiple time zones.
• Organizational Adaptation: Enterprises cultivate cross-cultural intelligence, institute standardized global codes of conduct with local flexibilities, and offer competitive global mobility packages.

3. Impact of Strategic Outsourcing:
• Focus on Core Competencies: Delegating non-differentiating transactional HR tasks (such as payroll processing, healthcare administration, and background checks) to external specialized vendors.
• Cost Agility & Flexibility: Shifts heavy fixed personnel expenditures into scalable variable operating costs.
• Elevating HR's Strategic Profile: Freeing HR professionals from clerical burdens enables them to serve as internal consultants and strategic business partners focused on talent architecture and succession planning.
• Organizational Adaptation: Organizations build robust vendor management protocols, enforce rigorous service level agreements (SLAs), and protect proprietary corporate data.

Synthesis for Sustained Competitive Advantage:
By synthesizing these three trends, progressive organizations deploy technology for operational speed, leverage globalization to tap international talent pools, and utilize outsourcing to remain lean and financially agile.`,
        explanation: 'Explains how technological innovation, global expansion, and strategic outsourcing reshape HR from an administrative desk into a high-value strategic partner delivering sustainable competitive advantage.',
        urdu_answer: 'ٹیکنالوجی، عالمگیریت اور آؤٹ سورسنگ کا جدید ایچ آر ایم پر اثر: ٹیکنالوجی نے خودکار نظام اور ڈیٹا اینالٹکس فراہم کیا؛ عالمگیریت نے بین الاقوامی ثقافتی تنوع اور ٹیلنٹ تک رسائی دی؛ اور آؤٹ سورسنگ نے دفتری بوجھ کم کر کے ایچ آر کو اسٹریٹجک پارٹنر بننے کا موقع دیا تاکہ مسابقتی برتری برقرار رکھی جا سکے۔'
      }
    ];

    const insMgt7Long = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    for (const l of longsMgt7) {
      insMgt7Long.run(l7Id, l.stem, l.correct, l.explanation, l.urdu_answer);
    }
  }

  // ── MGT501 - Lecture 8: Strategic Human Resource Management (SHRM) & Strategy Concepts ──
  const mgt501L8 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 8`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L8) {
    const l8res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 8, ?)
    `).run(mgt501.id, 'Strategic Human Resource Management (SHRM) & Strategy Concepts');
    const l8Id = l8res.lastInsertRowid;

    const mcqsMgt8 = [
      {
        stem: 'HRM has a _________ link with the corporate strategy of the organization. / For the survival and prosperity of an organization, HRM policies and practices must be harmonized with ________.',
        options: ['Direct / Corporate strategy', 'Indirect', 'Informal', 'Secondary'],
        correct: 'Direct / Corporate strategy',
        explanation: 'HRM policies maintain a direct link with organizational corporate strategy. For long-term prosperity, talent management, rewards, and staffing must be harmonized directly with strategic enterprise goals. (Appeared in 14 past paper files; Handouts page 33)',
        urdu_answer: 'ایچ آر ایم کی پالیسیاں اور طریقہ کار ادارے کی مجموعی کارپوریٹ حکمت عملی (Corporate Strategy) کے ساتھ براہ راست (Direct) منسلک اور ہم آہنگ ہونے چاہئیں۔'
      },
      {
        stem: 'Wal-Mart differentiates its business by offering the lowest prices. Offering the lowest prices is Wal-Mart’s _________.',
        options: ['Functional strategy', 'Competitive advantage', 'Distinctive competence', 'Corporate strategy'],
        correct: 'Competitive advantage',
        explanation: "A competitive advantage represents an organization's superior market edge, such as Wal-Mart's low-price proposition achieved through unmatched economies of scale and supply-chain efficiency. (Appeared in 18 past paper files; Handouts page 33)",
        urdu_answer: 'کم ترین قیمتوں پر اشیاء فراہم کر کے وال مارٹ اپنے حریفوں کے مقابلے میں مسابقتی برتری (Competitive Advantage) حاصل کرتا ہے۔'
      },
      {
        stem: '__________ is the process of assessing progress toward strategic goals and taking corrective action as needed.',
        options: ['Strategic management', 'Strategic planning', 'Strategic control', 'Diversification'],
        correct: 'Strategic control',
        explanation: 'Strategic control is the systematic monitoring of execution milestones, comparing actual performance against strategic benchmarks, and initiating corrective adjustments. (Appeared in 16 past paper files; Handouts page 35)',
        urdu_answer: 'اسٹریٹجک اہداف کے حصول کی پیشرفت کا جائزہ لینا اور ضرورت پڑنے پر اصلاحی اقدامات کرنا اسٹریٹجک کنٹرول (Strategic Control) کہلاتا ہے۔'
      },
      {
        stem: 'Which term is used to describe the process of strategy formulation, implementation, and Evaluation?',
        options: ['Strategic planning / Strategic management', 'Assessment', 'Forecasting', 'Valuation'],
        correct: 'Strategic planning / Strategic management',
        explanation: 'Strategic planning (or strategic management) defines the end-to-end cyclical process comprising strategy formulation, implementation, and evaluation. (Appeared in 12 past paper files; Handouts page 34)',
        urdu_answer: 'حکمت عملی بنانے (Formulation)، لاگو کرنے (Implementation) اور جانچنے (Evaluation) کے پورے عمل کو اسٹریٹجک مینجمنٹ یا اسٹریٹجک پلاننگ کہتے ہیں۔'
      },
      {
        stem: 'Strategic human resource management plays its role in following areas EXCEPT:',
        options: ['Environmental scanning', 'Strategy formulation', 'Competitive intelligence', 'Advertisement planning'],
        correct: 'Advertisement planning',
        explanation: 'Strategic HRM actively informs environmental scanning, human capability audits, and strategy formulation, whereas advertisement campaign planning is the specialized domain of marketing. (Appeared in 8 past paper files; Handouts page 33-34)',
        urdu_answer: 'اسٹریٹجک ایچ آر ایم ماحولیاتی تجزیے اور حکمت عملی سازی میں کردار ادا کرتی ہے، جبکہ اشتہارات کی منصوبہ بندی (Advertisement planning) مارکیٹنگ کا شعبہ ہے۔'
      },
      {
        stem: 'A broad picture of the organization at a given future time which a team wishes to pursue is known as:',
        options: ['Mission', 'Strategy', 'Policy', 'Vision'],
        correct: 'Vision',
        explanation: 'A vision statement articulates a future-oriented, aspirational portrait of what the organization ultimately aspires to become and achieve over the long horizon. (Appeared in 10 past paper files; Handouts page 34)',
        urdu_answer: 'مستقبل میں ادارہ کیا مقام حاصل کرنا چاہتا ہے، اس کا ایک جامع اور دور اندیش خاکہ ویژن (Vision) کہلاتا ہے۔'
      },
      {
        stem: 'The organization’s continuing purpose or reason for being is called:',
        options: ['Mission', 'Vision', 'Profit', 'Organizational life'],
        correct: 'Mission',
        explanation: 'A mission statement defines the fundamental, enduring purpose and raison d’être of an enterprise, detailing who it serves, its primary deliverables, and its underlying philosophy. (Appeared in 11 past paper files; Handouts page 34)',
        urdu_answer: 'ادارے کے وجود کا بنیادی مقصد، موجودہ کام اور تشخص مشن (Mission) کہلاتا ہے۔'
      },
      {
        stem: 'What could be the reason behind linking HRM with the strategic goals & objectives of an organization?',
        options: ['Promote centralization', 'Foster innovation & flexibility', 'Support bureaucratic culture', 'Develop rigid policies'],
        correct: 'Foster innovation & flexibility',
        explanation: 'Harmonizing HR with strategic objectives empowers talent, removes administrative silos, and cultivates continuous workforce innovation and agile flexibility. (Appeared in 7 past paper files; Handouts page 33)',
        urdu_answer: 'ایچ آر کو اسٹریٹجک اہداف سے جوڑنے کا بنیادی مقصد ادارے میں جدت پسندی اور لچک (Innovation & Flexibility) کو فروغ دینا ہے۔'
      },
      {
        stem: 'HR managers play a vital role in:',
        options: ['Setting production targets', 'Formulating strategies', 'Publishing financial statements', 'Preparing reports for shareholders'],
        correct: 'Formulating strategies',
        explanation: 'Modern HR directors participate in executive-level strategy formulation by identifying human capital strengths, labor feasibility, and talent constraints. (Appeared in 9 past paper files; Handouts page 33)',
        urdu_answer: 'جدید ایچ آر مینیجرز ادارے کے لیے حکمت عملی وضع کرنے (Formulating strategies) میں کلیدی کردار ادا کرتے ہیں۔'
      },
      {
        stem: 'A strategy in which an organization seeks to distinguish itself from competitors through the quality or uniqueness of its products or services is called:',
        options: ['Deliberate strategy', 'Differentiation strategy', 'Emergent strategy', 'Focus Strategy'],
        correct: 'Differentiation strategy',
        explanation: 'A differentiation strategy involves creating products or service experiences perceived industry-wide as unique, high quality, or superior, justifying premium pricing. (Appeared in 8 past paper files; Handouts page 35)',
        urdu_answer: 'اپنی مصنوعات یا خدمات کو حریفوں سے منفرد اور معیاری بنا کر پیش کرنے کی حکمت عملی کو ڈیفرینشیشن اسٹریٹیجی (Differentiation strategy) کہتے ہیں۔'
      },
      {
        stem: 'A focus strategy is a competitive strategy in which a company selects a market segment and serves the customers in that particular market niche better or cheaper than its competitors.',
        options: ['Broad strategy', 'Focus strategy', 'Corporate strategy', 'Stability strategy'],
        correct: 'Focus strategy',
        explanation: 'Porter’s focus strategy concentrates resources entirely on serving a narrow market segment, geographic pocket, or distinct niche either through low-cost focus or differentiated focus. (Appeared in 7 past paper files; Handouts page 35)',
        urdu_answer: 'فوکس اسٹریٹیجی میں ادارہ کسی مخصوص چھوٹی مارکیٹ (Niche) کا انتخاب کر کے وہاں کے صارفین کو بہترین یا سستی خدمات فراہم کرتا ہے۔'
      },
      {
        stem: 'Which of the following process leads towards the Organization’s strategy?',
        options: ['Organizing', 'Controlling', 'Planning', 'Leading'],
        correct: 'Planning',
        explanation: 'Planning is the overarching management function of identifying goals and charting strategic roadmaps to accomplish organizational competitiveness. (Appeared in 9 past paper files; Handouts page 34)',
        urdu_answer: 'پلاننگ (منصوبہ بندی) وہ بنیادی عمل ہے جو ادارے کی مجموعی حکمت عملی (Strategy) کے تعین کی طرف لے جاتا ہے۔'
      },
      {
        stem: 'Which of the following is responsible for implementing the developed strategies?',
        options: ['Human resource', 'Physical resource', 'Rules & policies', 'Installed equipment'],
        correct: 'Human resource',
        explanation: 'Human resources execute corporate strategy; even the most sophisticated strategic plans fail without competent, motivated, and aligned employees. (Appeared in 6 past paper files; Handouts page 34)',
        urdu_answer: 'تیار کردہ حکمت عملیوں کو عملی جامہ پہنانے کی بنیادی ذمہ داری افرادی قوت یعنی ہیومن ریسورس (Human Resource) پر ہوتی ہے۔'
      },
      {
        stem: 'What comes prior to environmental scanning of an organization?',
        options: ['Determining organizational mission', 'Monitoring the action plans', 'Developing budgets for plans', 'None of the given options'],
        correct: 'Determining organizational mission',
        explanation: 'Defining the corporate identity and articulating the organization’s mission logically precedes environmental scanning in the strategic management model. (Appeared in 6 past paper files; Handouts page 34)',
        urdu_answer: 'اسٹریٹجک پلاننگ کے مراحل میں ماحولیاتی جانچ (Environmental scanning) سے پہلے ادارے کا مشن (Determining organizational mission) طے کیا جاتا ہے۔'
      },
      {
        stem: 'Deciding whether Mom and Pop’s superstore will compete with enormous markets head-to-head by building similar superstores is an example of:',
        options: ['Strategic planning', 'Tactical planning', 'Operational planning', 'All of the given options'],
        correct: 'Strategic planning',
        explanation: 'High-level choices regarding capital allocation, market entry, and competing head-to-head against dominant market players constitute strategic planning. (Appeared in 6 past paper files; Handouts page 34)',
        urdu_answer: 'بڑے حریفوں کے مدمقابل بڑا سپر اسٹور بنانے اور طویل مدتی مسابقت کا فیصلہ اسٹریٹجک پلاننگ (Strategic planning) کی مثال ہے۔'
      }
    ];

    const insMgt8Mcq = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    for (const m of mcqsMgt8) {
      insMgt8Mcq.run(l8Id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
    }

    const shortsMgt8 = [
      {
        stem: 'What is Strategic Human Resource Management (SHRM)? Why is it essential to harmonize HRM policies with corporate strategy?',
        correct: `Strategic Human Resource Management (SHRM) and Strategic Alignment:

1. Definition of SHRM:
Strategic Human Resource Management (SHRM) is the systematic linking of human resource management practices, policies, and philosophies directly with the strategic objectives and long-term vision of the enterprise to improve business performance and foster organizational culture.

2. Necessity of Harmonizing HRM with Corporate Strategy:
• Resource-Based Competitive Edge: People represent the rare, inimitable, and non-substitutable resource that competitors cannot easily duplicate.
• Operational Execution: High-level corporate strategies remain abstract theories unless aligned with hiring, performance appraisal, reward structures, and leadership development.
• Coherent Direction: Prevents HR from functioning as an isolated administrative bureaucracy. When corporate strategy pivots (e.g., toward digital innovation or cost leadership), HR policies must pivot correspondingly to supply the requisite skills and employee behaviors.`,
        explanation: 'SHRM links HR systems directly to strategic business goals. Harmonization ensures human capital supports operational execution and provides a rare, inimitable competitive advantage.',
        urdu_answer: 'اسٹریٹجک ایچ آر ایم (SHRM) سے مراد ایچ آر پالیسیوں کو ادارے کے طویل مدتی اسٹریٹجک اہداف سے ہم آہنگ کرنا ہے۔ یہ تعلق اس لیے ضروری ہے تاکہ حکمت عملی کا عملی نفاذ یقینی ہو اور مسابقتی برتری حاصل کی جا سکے۔'
      },
      {
        stem: 'Differentiate between Vision and Mission Statement of an organization with examples.',
        correct: `Distinction Between Vision and Mission Statements:

1. Vision Statement:
• Focus: Future-oriented and aspirational.
• Core Question: "What do we want to become in the future?"
• Scope: Outlines the long-term destination, ultimate dream, and inspirational horizon that energizes leaders and employees over 5 to 10+ years.
• Example: "To be the world's most customer-centric company, where customers can find and discover anything they might want to buy online" (Amazon).

2. Mission Statement:
• Focus: Present-oriented and operational.
• Core Question: "Who are we, what do we do, and why do we exist today?"
• Scope: Clarifies the organization's enduring business purpose, primary customers served, core competencies, and foundational corporate values.
• Example: "To organize the world's information and make it universally accessible and useful" (Google).`,
        explanation: 'Vision describes future aspirations (where the company wants to go); Mission outlines the fundamental current purpose and reason for existence (who we are and what we do).',
        urdu_answer: 'ویژن (Vision) مستقبل پر مبنی ہوتا ہے کہ ادارہ آگے چل کر کیا بننا چاہتا ہے، جبکہ مشن (Mission) موجودہ مقصد، تشخص اور خدمات کی وضاحت کرتا ہے کہ ادارہ آج کیوں وجود رکھتا ہے۔'
      },
      {
        stem: 'Briefly describe the three Generic Competitive Strategies (Cost Leadership, Differentiation, and Focus Strategy) as proposed by Michael Porter.',
        correct: `Michael Porter's Generic Competitive Strategies:

1. Cost Leadership Strategy:
• Objective: Becoming the lowest-cost producer and distributor in the industry.
• Mechanism: Achieving economies of scale, strict overhead controls, standardized mass-production, and supply-chain bargaining power (e.g., Wal-Mart).
• HR Implication: Focus on operational efficiency, productivity metrics, and cost-efficient staffing.

2. Differentiation Strategy:
• Objective: Delivering products or services perceived across the industry as unique, innovative, and of superior quality.
• Mechanism: Premium branding, superior customer service, advanced design, or patent-protected technology (e.g., Apple, BMW).
• HR Implication: Rewarding innovation, recruiting high-caliber creative talent, and cultivating a flexible, empowering culture.

3. Focus Strategy:
• Objective: Concentrating resources exclusively on a narrow market niche, specialized demographic, or specific geographic segment.
• Mechanism: Serving that targeted niche either through specialized low-cost solutions (Cost Focus) or tailored premium features (Differentiation Focus).
• HR Implication: Developing specialized customer relationship expertise and niche market domain mastery.`,
        explanation: 'Porter outlines 3 strategies: Cost Leadership (lowest operational cost), Differentiation (unique high-value attributes), and Focus (concentrating on a narrow market niche).',
        urdu_answer: 'مائیکل پورٹر کی تین مسابقتی حکمت عملیاں: (1) کاسٹ لیڈرشپ (صنعت میں سب سے کم لاگت پر اشیاء بنانا)، (2) ڈیفرینشیشن (منفرد اور اعلیٰ معیار کی پراڈکٹس پیش کرنا)، اور (3) فوکس اسٹریٹیجی (کسی مخصوص مارکیٹ یا طبقے پر توجہ مرکوز کرنا)۔'
      },
      {
        stem: 'What are the three levels of strategic planning in an organization (Corporate-level, Business-level, and Functional-level)?',
        correct: `Three Levels of Strategic Planning in an Organization:

1. Corporate-Level Strategy:
• Scope: The highest organizational tier, determined by the Board of Directors and Chief Executive Officer (CEO).
• Core Focus: "What businesses should we be in?"
• Key Decisions: Portfolio management, mergers and acquisitions, diversification, market entry/exit, and long-term capital allocation across corporate business units.

2. Business-Level (Competitive) Strategy:
• Scope: Individual Strategic Business Units (SBUs) or separate subsidiary divisions.
• Core Focus: "How do we compete successfully in this specific market or industry?"
• Key Decisions: Positioning against direct competitors via Cost Leadership, Differentiation, or Focus strategies to capture customer share.

3. Functional-Level Strategy:
• Scope: Departmental and operational units (HR, Finance, Marketing, Operations, IT).
• Core Focus: "How can each functional department support the business and corporate strategies?"
• Key Decisions: Translating broad business goals into practical department initiatives (e.g., HR aligning hiring pipelines and training programs with market growth).`,
        explanation: 'Covers 3 levels: Corporate (portfolio and overall business domain), Business (competitive positioning per SBU), and Functional (departmental actions supporting business goals).',
        urdu_answer: 'اسٹریٹجک پلاننگ کے تین درجات ہیں: (1) کارپوریٹ لیول (ادارہ کن کاروباروں میں کام کرے گا)، (2) بزنس لیول (مخصوص مارکیٹ میں حریفوں کا مقابلہ کیسے کیا جائے گا)، اور (3) فنکشنل لیول (ایچ آر، مارکیٹنگ اور مالیات کے شعبہ جات کس طرح بزنس اسٹریٹجی کو سپورٹ کریں گے)۔'
      },
      {
        stem: 'Write down the advantages of strategic human resource plans.',
        correct: `Advantages of Strategic Human Resource Plans:

1. Proactive Talent Alignment:
Enables the organization to anticipate future talent requirements, skill shortages, and technological disruptions rather than reacting hastily during crises.

2. Enhanced Competitive Advantage:
Helps build unique organizational competencies and core workforce skills that competitors cannot replicate or substitute.

3. Optimization of Personnel Costs:
Prevents overstaffing and understaffing through accurate demand-supply forecasting, directly saving payroll overheads and reducing recruitment churn.

4. Coordinated Goal Congruence:
Directly binds individual employee KPIs, training programs, and performance incentives to corporate business objectives, ensuring everyone works toward unified enterprise priorities.

5. Agility in Dynamic Environments:
Empowers the organization to swiftly pivot during market shifts, mergers, technological transitions, or economic recessions by possessing an adaptable, well-trained workforce.`,
        explanation: 'Strategic HR planning anticipates workforce needs, aligns employee performance with business targets, controls labor costs, and builds sustainable competitive capabilities.',
        urdu_answer: 'اسٹریٹجک ایچ آر پلاننگ کے فوائد: افرادی قوت کی ضروریات کا پیشگی اندازہ، ملازمین کی کارکردگی اور تنظیمی اہداف میں ہم آہنگی، غیر ضروری اخراجات میں کمی، اور بدلتے ہوئے ماحول میں فوری موافقت کی صلاحیت۔'
      }
    ];

    const insMgt8Short = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    for (const s of shortsMgt8) {
      insMgt8Short.run(l8Id, s.stem, s.correct, s.explanation, s.urdu_answer);
    }

    const longsMgt8 = [
      {
        stem: `Explain in detail the Strategic Management Process. Discuss the key steps involved from defining the business and mission to strategy formulation, implementation, and strategic control.`,
        correct: `The Strategic Management Process:

The Strategic Management Process is an iterative, comprehensive set of commitments, decisions, and actions required for an organization to achieve strategic competitiveness and earn above-average returns. It comprises five critical interconnected phases:

1. Defining the Business, Vision, and Mission:
• Defining the Business: Identifying what customer needs are satisfied, which customer groups are served, and what unique competencies are deployed.
• Vision Formulation: Establishing an inspiring long-term mental picture of the enterprise's future state.
• Mission Statement: Articulating the continuing purpose, core identity, values, and primary reason for organizational existence.

2. Environmental Scanning (SWOT & PEST Analysis):
• External Audit: Analyzing macro-environmental forces (Political, Economic, Social, Technological) and industry competition (Porter's Five Forces) to detect emerging Opportunities and Threats.
• Internal Audit: Evaluating organizational resources, financial assets, intellectual capital, and workforce capabilities to identify Core Strengths and critical Weaknesses.

3. Strategy Formulation (Translating Insights into Plans):
• Developing actionable corporate, business, and functional strategies that leverage internal strengths to exploit external opportunities while neutralizing threats and overcoming weaknesses.
• Selecting appropriate competitive postures (Cost Leadership, Differentiation, Focus, Market Expansion, or Alliances).

4. Strategy Implementation (Executing the Plan):
• Strategy is worthless without disciplined execution.
• Requires mobilizing human resources, allocating capital budgets, structuring communication chains, aligning reward systems, and building an adaptive corporate culture committed to the strategic goals.
• HR plays the pivotal role here by providing the right personnel, skills training, and performance incentives.

5. Strategic Evaluation and Control:
• Continuously measuring actual organizational performance against pre-established milestones and competitive benchmarks.
• Identifying deviations, analyzing root causes of performance gaps, and implementing corrective operational adjustments to ensure strategic alignment.`,
        explanation: 'Covers the 5 phases of the Strategic Management Process: Vision/Mission definition, SWOT environmental scanning, Strategy formulation, Strategy execution/implementation, and Strategic evaluation/control.',
        urdu_answer: 'اسٹریٹجک مینجمنٹ کا جامع عمل 5 مراحل پر مشتمل ہے: (1) بزنس، مشن اور ویژن کی وضاحت، (2) ماحولیاتی جانچ (SWOT اینالیسس)، (3) حکمت عملی کی تشکیل (Formulation)، (4) حکمت عملی کا نفاذ (Implementation جس میں افرادی قوت کا اہم کردار ہے)، اور (5) اسٹریٹجک ایویلیوایشن اور کنٹرول تاکہ پیشرفت کی جانچ اور ضروری تبدیلیاں کی جا سکیں۔'
      },
      {
        stem: `Why do you think that Strategic Managers of a company should consult the HR Manager during the strategic planning process? Explain how HR contributes to gaining and sustaining a competitive advantage.`,
        correct: `The Strategic Role of HR Managers in Planning and Sustaining Competitive Advantage:

Strategic planners who formulate corporate vision in isolation from HR inevitably face operational failure. Consulting the HR Manager during strategic formulation is indispensable for the following reasons:

I. Why Strategic Planners Must Consult HR:
1. Reality Check on Human Capital Feasibility:
HR provides essential data on existing employee competencies, leadership pipelines, and talent availability. A bold corporate strategy (e.g., launching an AI software division) will fail if HR cannot procure or train the required engineers within the designated timeline.
2. Accurate Environmental Labor Intelligence:
HR monitors external labor market trends, demographic changes, union activities, wage inflation rates, and labor legislations that directly influence corporate investment decisions.
3. Facilitating Cultural Change and Buy-In:
Strategic pivots require structural reorganization and employee behavioral shifts. HR designs the change-management interventions, transparent communication, and reward systems that prevent worker resistance.

II. How HR Generates and Sustains Competitive Advantage (Resource-Based View - RBV):
According to the VRIO framework, a firm gains sustainable competitive advantage when its resources are Valuable, Rare, Inimitable, and Organized:
1. Inimitability (Cannot be Easily Copied):
While competitors can readily purchase identical machinery, copy software, or match prices, they cannot duplicate a company's high-performance culture, collective knowledge, and teamwork built over decades.
2. Tacit Knowledge Retention:
Effective retention strategies preserve institutional memory and specialized operational tricks-of-the-trade inside the enterprise.
3. Synergistic High-Performance Work Systems (HPWS):
Aligning selective hiring, extensive training, decentralized teamwork, and meritocratic incentive pay creates a multiplier effect where overall workforce productivity exceeds the sum of individual contributions.`,
        explanation: 'Explains why HR consultation is essential for strategy feasibility and labor intelligence, and how HR builds an inimitable, sustainable competitive advantage via the Resource-Based View (RBV).',
        urdu_answer: 'اسٹریٹجک پلاننگ میں ایچ آر مینیجر سے مشاورت کیوں ضروری ہے: ایچ آر ملازمین کی صلاحیتوں کی حقیقت پسندانہ جانچ اور لیبر مارکیٹ کا تجزیہ فراہم کرتا ہے۔ ایچ آر مسابقتی برتری کو اس لیے برقرار رکھتا ہے کیونکہ حریف ٹیکنالوجی تو خرید سکتے ہیں لیکن کسی ادارے کے ملازمین کی مہارت، ثقافت اور ٹیم ورک کی نقل نہیں کر سکتے۔'
      }
    ];

    const insMgt8Long = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    for (const l of longsMgt8) {
      insMgt8Long.run(l8Id, l.stem, l.correct, l.explanation, l.urdu_answer);
    }
  }

  // ── MGT501 - Lecture 9: Human Resource Planning (HRP) & Forecasting Techniques ──
  const mgt501L9 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 9`).get(mgt501.id) as { id: number } | undefined;
  if (!mgt501L9) {
    const l9res = db.prepare(`
      INSERT INTO lectures (subject_id, number, title)
      VALUES (?, 9, ?)
    `).run(mgt501.id, 'Human Resource Planning (HRP) & Forecasting Techniques');
    const l9Id = l9res.lastInsertRowid;

    const mcqsMgt9 = [
      {
        stem: 'The process of determining the human resource needs of an organization and ensuring that the right number of qualified people are positioned in the right jobs at the right time is described by which of the following term?',
        options: ['Job planning', 'Resource planning', 'Human resource planning', 'Succession planning'],
        correct: 'Human resource planning',
        explanation: 'Human Resource Planning (HRP) is the systematic process of matching internal and external workforce supply with anticipated job openings over a specific timeframe to ensure the right people are in the right jobs at the right time. (Appeared in 14 past paper files; Handouts page 57)',
        urdu_answer: 'ادارے کی افرادی ضروریات کا اندازہ لگانا اور صحیح وقت پر صحیح جگہ اہل افراد کی موجودگی یقینی بنانا ہیومن ریسورس پلاننگ (HRP) کہلاتا ہے۔'
      },
      {
        stem: '_________ is the process of systematically reviewing human resource requirements to ensure that the required number of employees, with the required skills, is available when they are needed.',
        options: ['Job analysis', 'Human resource planning', 'Succession planning', 'Performance management'],
        correct: 'Human resource planning',
        explanation: 'Human resource planning systematically reviews organizational human capital requirements to ensure adequate personnel with required competencies are available when needed. (Appeared in 8 past paper files; Handouts page 57)',
        urdu_answer: 'ملازمین کی درکار تعداد اور مہارتوں کی بروقت فراہمی کا باقاعدہ اور منظم جائزہ لینا ہیومن ریسورس پلاننگ (HRP) ہے۔'
      },
      {
        stem: 'How often is the HR planning process implemented within an organization?',
        options: ['Continuously', 'Annually', 'Bi-annually', 'Quarterly'],
        correct: 'Continuously',
        explanation: 'HRP is not an isolated annual event; it is an ongoing, continuous process that dynamically adapts to market shifts, technological changes, and operational expansions. (Appeared in 12 past paper files; Handouts page 57)',
        urdu_answer: 'ہیومن ریسورس پلاننگ کوئی سالانہ رسمی کارروائی نہیں بلکہ ایک مسلسل (Continuously) جاری رہنے والا متحرک عمل ہے۔'
      },
      {
        stem: 'To anticipate the human resource needs of the organization based on some previous data or managerial judgment is known as:',
        options: ['Demand forecasting', 'Supplies forecasting', 'Financial forecasting', 'Sales forecasting'],
        correct: 'Demand forecasting',
        explanation: 'Demand forecasting is the estimation of the quantity and quality of people an organization will need in the future to accomplish its strategic goals, based on historical trends or managerial judgment. (Appeared in 11 past paper files; Handouts page 58)',
        urdu_answer: 'ماضی کے ڈیٹا اور انتظامی مشاہدات کی بنیاد پر افرادی قوت کی مستقبل کی ضروریات کا پیشگی تخمینہ ڈیمانڈ فورکاسٹنگ (Demand forecasting) کہلاتا ہے۔'
      },
      {
        stem: "The study of the firm's past employment needs over a period of years to predict future needs is known as:",
        options: ['Trend analysis', 'Regression analysis', 'Ratio analysis', 'None of the given options'],
        correct: 'Trend analysis',
        explanation: 'Trend analysis involves examining historical employment levels over a multi-year period to identify patterns and predict future staffing volume. (Appeared in 15 past paper files; Handouts page 58)',
        urdu_answer: 'مستقبل کی ضروریات کا اندازہ لگانے کے لیے گزشتہ سالوں میں ملازمت کے رجحانات کا مطالعہ ٹرینڈ اینالیسس (Trend analysis) کہلاتا ہے۔'
      },
      {
        stem: "Which forecasting method uses the organization's current level of employment as the starting point for determining future staffing needs?",
        options: ['Zero-base forecasting', 'Bottom-up approach', 'Simulation', 'None of the above'],
        correct: 'Zero-base forecasting',
        explanation: "Zero-base forecasting uses the organization's current employment level as the baseline; each position must be justified anew as vacancies occur or budgets are allocated. (Appeared in 14 past paper files; Handouts page 58)",
        urdu_answer: 'زیرو بیسڈ فورکاسٹنگ (Zero-base forecasting) میں موجودہ ملازمت کی سطح کو بنیادی نقطہ آغاز بنا کر مستقبل کی ضروریات کا تعین کیا جاتا ہے۔'
      },
      {
        stem: 'Which of the following is a forecasting method in which requirement is estimated at department level and the information is gradually transmitted to upper levels to make future hiring of employees?',
        options: ['Top-down approach', 'Bottom-up approach', 'Zero-based approach', 'Employee-based approach'],
        correct: 'Bottom-up approach',
        explanation: 'In the bottom-up approach, departmental supervisors estimate their specific manpower needs and aggregate the data upward through senior management to build the corporate HR plan. (Appeared in 8 past paper files; Handouts page 58)',
        urdu_answer: 'باٹم اپ اپروچ (Bottom-up approach) میں نچلی سطح کے شعبہ جات اپنی ضروریات کا تخمینہ لگا کر اوپر کی انتظامیہ کو ارسال کرتے ہیں۔'
      },
      {
        stem: "Following are all included in 'Statistical Approach' of forecasting, EXCEPT:",
        options: ['Trend analysis', 'Sensitivity analysis', 'Ratio analysis', 'Regression analysis'],
        correct: 'Sensitivity analysis',
        explanation: 'Statistical approaches to HR forecasting include Trend analysis, Ratio analysis, Regression analysis, and Simulation models. Sensitivity analysis is primarily a financial risk modeling tool. (Appeared in 15 past paper files; Handouts page 58)',
        urdu_answer: 'ایچ آر شماریاتی فورکاسٹنگ میں ٹرینڈ، ریشو، اور ریگریشن اینالیسس شامل ہیں، جبکہ سینسیٹیوٹی اینالیسس (Sensitivity analysis) اس زمرے میں نہیں آتا۔'
      },
      {
        stem: 'Which of the following is a forecasting technique that involves experimenting with a real-world situation through a mathematical model?',
        options: ['Simulation', 'Modeling', 'Mock-up', 'Replication'],
        correct: 'Simulation',
        explanation: "Simulation is a technique that constructs mathematical representations of real-world organizational dynamics to test different 'what-if' manpower scenarios under varying business conditions. (Appeared in 8 past paper files; Handouts page 58)",
        urdu_answer: 'حقیقی دنیا کے حالات کو ریاضیاتی ماڈل کے ذریعے آزمانا اور پیشگوئی کرنا سیمولیشن (Simulation) کہلاتا ہے۔'
      },
      {
        stem: 'A forecasting tool that uses mathematical equations to predict the behavior of one variable on the basis of other known variable/s is known as:',
        options: ['Managerial judgment', 'Regression analysis', 'Trend analysis', 'Ratio analysis'],
        correct: 'Regression analysis',
        explanation: 'Regression analysis establishes mathematical relationships between dependent variables (e.g., staffing demand) and independent predictor variables (such as sales volume or production output). (Appeared in 6 past paper files; Handouts page 58)',
        urdu_answer: 'معلوم متغیرات کی بنیاد پر نامعلوم متغیر کی پیشگوئی کرنے کے لیے ریاضیاتی مساوات کا استعمال ریگریشن اینالیسس (Regression analysis) کہلاتا ہے۔'
      },
      {
        stem: '"People working in your organization are less than the actual requirements." Which of the following strategy would you prefer to solve this problem?',
        options: ['Downsizing', 'Transfers', 'Demotions', 'Recruiting'],
        correct: 'Recruiting',
        explanation: 'When forecasted HR demand exceeds internal supply (labor shortage), the primary corrective action is recruitment to attract new qualified talent into the organization. (Appeared in 10 past paper files; Handouts page 59)',
        urdu_answer: 'جب ادارے میں کارکنوں کی تعداد ضرورت سے کم ہو (شارٹیج)، تو اس مسئلے کے حل کی بہترین حکمت عملی نئی بھرتی (Recruiting) ہے۔'
      },
      {
        stem: "'There is no need to make any new appointment'; therefore, the organization has transferred Mr. Azam to another branch. This step of the organization is taken to:",
        options: ['Increase the labor supply than demand', 'Maintain the balance of labor supply and demand', 'Decrease the labor supply than demand', 'Devastate the balance of labor supply and demand'],
        correct: 'Maintain the balance of labor supply and demand',
        explanation: 'Internal redeployment and inter-branch transfers reallocate existing surplus employees to areas experiencing labor deficits, thereby maintaining a perfect balance between supply and demand without hiring new staff. (Appeared in 12 past paper files; Handouts page 59)',
        urdu_answer: 'نئی بھرتی کی بجائے اندرونی ٹرانسفر کا مقصد افرادی قوت کی طلب اور رسد میں توازن برقرار رکھنا (Maintain the balance of labor supply and demand) ہے۔'
      },
      {
        stem: 'Reduced hours technique is used to:',
        options: ['Increase layoffs', 'Cope with surplus', 'Initiate creative recruiting', 'Provide training'],
        correct: 'Cope with surplus',
        explanation: 'Shortening the standard workweek or reducing working hours (work sharing) distributes available work among all employees to avoid involuntary layoffs during a labor surplus. (Appeared in 7 past paper files; Handouts page 59)',
        urdu_answer: 'کام کے اوقات میں کمی (Reduced hours) زائد افرادی قوت یعنی سرپلس (Cope with surplus) سے نمٹنے کی حکمت عملی ہے۔'
      },
      {
        stem: "The process which is used to fulfill any or all firm's future managerial or key positions from maintenance clerk to CEO is called:",
        options: ['Human resource planning', 'Succession planning', 'Employment forecasting', 'Strategic planning'],
        correct: 'Succession planning',
        explanation: 'Succession planning is the systematic process of identifying, developing, and tracking high-potential employees to fill future critical leadership and managerial vacancies across all echelons. (Appeared in 8 past paper files; Handouts page 58)',
        urdu_answer: 'ادارے کے کلیدی اور انتظامی عہدوں کے لیے مستقبل کے جانشین تیار کرنا اور تقرریاں کرنا سکسیشن پلاننگ (Succession planning) کہلاتا ہے۔'
      },
      {
        stem: 'Ahmed, HR manager of Tri-Star Technologies is involved in human resource planning process. What sort of information can be obtained through supply and demand forecasts?',
        options: ['Overstaffing in sales department', 'Shortage of machine operators in production department', 'Estimates of changes in the external supply', 'All of the given options'],
        correct: 'All of the given options',
        explanation: 'Comprehensive supply and demand forecasting reveals departmental surplus (overstaffing), deficits (labor shortages), and broader demographic trends in the external labor market. (Appeared in 6 past paper files; Handouts page 57-59)',
        urdu_answer: 'ڈیمانڈ اور سپلائی فورکاسٹنگ سے زائد ملازمین، کارکنوں کی کمی اور بیرونی لیبر مارکیٹ کی تبدیلیوں سے متعلق تمام معلومات حاصل ہوتی ہیں۔'
      }
    ];

    const insMgt9Mcq = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
    `);

    for (const m of mcqsMgt9) {
      insMgt9Mcq.run(l9Id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
    }

    const shortsMgt9 = [
      {
        stem: 'What is Human Resource Planning (HRP)? What is its main objective?',
        correct: `Human Resource Planning (HRP) and Core Objectives:

1. Definition of HRP:
Human Resource Planning (HRP) is the continuous, systematic process of assessing an organization's current human assets, anticipating future manpower requirements, and formulating HR policies to ensure the right number of qualified people are available in the right jobs at the right time.

2. Primary Objectives of HRP:
• Prevent Manpower Imbalances: Avert costly labor shortages (which choke production) and worker surpluses (which balloon payroll expenses).
• Support Strategic Goals: Align human capital growth directly with corporate expansion, technological transitions, and product diversification.
• Optimize Recruitment and Development: Provide a clear roadmap for recruitment scheduling, internal promotions, and targeted workforce upskilling.
• Facilitate Succession: Ensure continuity in key leadership and specialized technical roles through proactive talent pipelining.`,
        explanation: 'HRP is the systematic process of aligning talent demand and supply to ensure the right people are in the right jobs at the right time, preventing labor shortages or surpluses.',
        urdu_answer: 'ہیومن ریسورس پلاننگ (HRP) افرادی قوت کی موجودہ اور مستقبل کی ضروریات کا منظم جائزہ ہے۔ اس کا بنیادی مقصد ملازمین کی کمی یا زیادتی سے بچنا اور اسٹریٹجک اہداف کے لیے اہل افراد کی بروقت فراہمی یقینی بنانا ہے۔'
      },
      {
        stem: 'Differentiate between Demand Forecasting and Supply Forecasting in HRP.',
        correct: `Demand Forecasting vs. Supply Forecasting in HRP:

1. Demand Forecasting:
• Definition: Estimating the future number and types of employees the organization will require to achieve its strategic operational targets.
• Primary Drivers: Projected sales volumes, production schedules, market expansion, organizational restructuring, and technological automation.
• Focus: "How many people with what specific skill sets will we need in the coming quarters/years?"

2. Supply Forecasting:
• Definition: Determining the availability of qualified candidates from both internal organizational sources and external labor markets.
• Internal Supply Analysis: Evaluates existing staff skills inventories, expected retirements, turnover rates, promotions, and transfers.
• External Supply Analysis: Monitors demographic trends, university graduation rates, competitor actions, and broader economic conditions.
• Focus: "How many qualified individuals are currently available or can be procured to fill those anticipated openings?"`,
        explanation: 'Demand Forecasting projects how many and what types of workers the firm will need; Supply Forecasting assesses the availability of candidates internally and in the external labor market.',
        urdu_answer: 'ڈیمانڈ فورکاسٹنگ میں یہ اندازہ لگایا جاتا ہے کہ مستقبل میں ادارے کو کتنے ملازمین کی ضرورت ہوگی؛ جبکہ سپلائی فورکاسٹنگ میں یہ جانچا جاتا ہے کہ اندرونی اور بیرونی طور پر کتنے اہل افراد دستیاب ہوں گے۔'
      },
      {
        stem: 'Differentiate between Zero-Base Forecasting and the Bottom-Up Approach.',
        correct: `Zero-Base Forecasting vs. Bottom-Up Approach:

1. Zero-Base Forecasting:
• Methodology: Uses the organization's current level of employment as the starting baseline. Vacancies are not automatically refilled when employees depart.
• Core Rule: Each supervisor or department head must rigorously justify the necessity of continuing or filling every individual position anew based on business value.
• Objective: Aggressively curbs organizational bloat and prevents unnecessary hiring.

2. Bottom-Up Approach:
• Methodology: Forecasting begins at the lowest supervisory or departmental level. Each department manager analyzes upcoming operational workloads and projects their specific staffing needs.
• Aggregation: These localized estimates are submitted to higher management levels, aggregated, reviewed, and reconciled to create the comprehensive enterprise-wide HR forecast.
• Objective: Leverages ground-level operational knowledge and operational accuracy.`,
        explanation: 'Zero-base forecasting requires justifying every position anew from the current baseline; the bottom-up approach aggregates localized manpower forecasts upward from frontline department supervisors.',
        urdu_answer: 'زیرو بیسڈ فورکاسٹنگ میں ہر خالی آسامی کا دوبارہ جواز پیش کرنا لازمی ہوتا ہے؛ جبکہ باٹم اپ اپروچ میں نچلے شعبہ جات اپنی ضروریات کا تخمینہ لگا کر بالا انتظامیہ کو جمع کراتے ہیں۔'
      },
      {
        stem: 'What options/strategies are available to an HR manager when facing a forecasted worker surplus vs. worker shortage?',
        correct: `HR Strategies for Managing Worker Surplus vs. Worker Shortage:

1. Strategies for Worker Surplus (Supply Exceeds Demand):
• Restricted Hiring (Attrition): Freezing new hires and allowing natural turnover (resignations, retirements) to shrink headcount.
• Reduced Work Hours: Shortening workweeks or introducing job sharing to preserve employment while trimming payroll costs.
• Early Retirement Incentives: Offering voluntary financial packages (golden handshakes) to encourage senior workers to exit.
• Internal Transfers: Reassigning surplus staff to growing divisions facing deficits.
• Involuntary Layoffs / Downsizing: Permanent workforce dismissals as a last resort.

2. Strategies for Worker Shortage (Demand Exceeds Supply):
• Creative Recruiting: Utilizing digital platforms, campus drives, and non-traditional talent pools.
• Compensation Incentives: Offering signing bonuses, competitive salaries, and retention benefits.
• Overtime & Moonlighting: Authorizing existing staff to work extra paid hours to meet short-term production spikes.
• Outsourcing & Contingent Workers: Hiring independent contractors, freelancers, or temp agencies.
• Intensive Training & Reskilling: Fast-tracking existing employees into high-demand technical roles.`,
        explanation: 'When facing a surplus, managers apply hiring freezes, reduced hours, early retirements, or layoffs. In a shortage, they deploy creative recruitment, wage incentives, overtime, and outsourcing.',
        urdu_answer: 'سرپلس کی صورت میں: نئی بھرتیوں پر پابندی، کام کے اوقات میں کمی، گولڈن ہینڈ شیک، اور ٹرانسفرز۔ شارٹیج کی صورت میں: نئی بھرتیاں، اوور ٹائم، پرکشش تنخواہیں، اور کنٹریکٹ ورکرز کا استعمال۔'
      },
      {
        stem: 'What is Succession Planning and why is it important for an organization?',
        correct: `Succession Planning and Its Organizational Significance:

1. Definition of Succession Planning:
Succession planning is the systematic, proactive process of identifying and developing high-potential internal candidates to fill critical leadership, executive, and key technical positions within an organization as incumbents retire, resign, or advance.

2. Why Succession Planning is Essential:
• Business Continuity: Eliminates leadership vacuums and disruption when senior executives or mission-critical specialists depart unexpectedly.
• Talent Retention: Demonstrates clear career advancement pathways, increasing the loyalty and engagement of high-performing employees.
• Cost Efficiency: Reduces heavy financial expenditures on executive search firms and lengthy external onboarding cycles.
• Preservation of Tacit Knowledge: Ensures institutional memory, customer relationships, and strategic competencies remain securely inside the firm.`,
        explanation: 'Succession planning systematically develops internal talent to fill vital leadership vacancies, safeguarding organizational continuity and preserving proprietary institutional knowledge.',
        urdu_answer: 'سکسیشن پلاننگ سے مراد اہم اور انتظامی عہدوں کے لیے اندرونی ملازمین کو پیشگی تیار کرنا ہے۔ یہ قیادت کے اچانک خلا کو روکنے، ٹیلنٹ کو برقرار رکھنے اور تنظیمی تسلسل کے لیے ناگزیر ہے۔'
      }
    ];

    const insMgt9Short = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
    `);

    for (const s of shortsMgt9) {
      insMgt9Short.run(l9Id, s.stem, s.correct, s.explanation, s.urdu_answer);
    }

    const longsMgt9 = [
      {
        stem: `Explain the Human Resource Planning (HRP) process in detail. Discuss the various quantitative (statistical) and qualitative techniques used for HR demand and supply forecasting.`,
        correct: `The Human Resource Planning (HRP) Process and Forecasting Techniques:

Human Resource Planning is the foundational pillar connecting corporate strategy to operational execution. The comprehensive HRP process and its forecasting methodologies are detailed below:

I. The Four-Stage HRP Process:
1. Environmental Scanning & Strategic Review: Assessing corporate objectives, technological roadmaps, and macro-economic conditions.
2. Forecasting Human Resource Demand: Projecting the future number and skill sets required to fulfill business plans.
3. Forecasting Internal and External Supply: Assessing current workforce skill inventories and availability of talent in the market.
4. Developing and Executing Action Plans: Balancing supply and demand gaps through recruitment, training, redeployment, or surplus reduction programs.

II. Forecasting Techniques:

A. Quantitative (Statistical) Forecasting Techniques:
1. Trend Analysis:
• Studying historical employment levels over the past 3 to 5 years to identify statistical trends and project future staffing volume.
2. Ratio Analysis:
• Establishing operational ratios between a business factor (e.g., sales volume or hospital beds) and the number of employees required (e.g., 1 nurse per 5 beds).
3. Scatter Plot / Regression Analysis:
• Graphically and mathematically determining relationships between a dependent variable (manpower required) and independent variables (production output, gross revenue).
4. Computer Simulation Modeling:
• Building mathematical models of organizational workflows to simulate various business scenarios ("what-if" analyses) and evaluate manpower needs under volatile demand.

B. Qualitative (Judgmental) Forecasting Techniques:
1. Managerial Judgment:
• Relying on the seasoned insights, experience, and intuitive assessments of senior executives to project future manpower needs.
2. Bottom-Up Approach:
• Supervisors at the departmental level formulate localized staffing estimates based on projected task loads, aggregating data upward to corporate leadership.
3. Zero-Base Forecasting:
• Taking current staffing as the baseline and requiring managers to provide rigorous justification for continuing or replacing every single role.
4. Delphi Technique:
• Polling an expert panel iteratively and anonymously until a consensus forecast regarding future workforce dynamics emerges.`,
        explanation: 'Covers the 4 stages of HRP and contrasts Quantitative methods (Trend, Ratio, Regression, Simulation) with Qualitative methods (Managerial Judgment, Bottom-Up, Zero-Base, Delphi).',
        urdu_answer: 'ہیومن ریسورس پلاننگ کے چار مراحل ہیں: ماحولیاتی جائزہ، طلب کا تخمینہ، رسد کا تخمینہ، اور ایکشن پلان۔ شماریاتی طریقوں میں ٹرینڈ، ریشو، ریگریشن اینالیسس اور سیمولیشن شامل ہیں؛ جبکہ معیاری طریقوں میں انتظامی مشاہدات، باٹم اپ اپروچ، زیرو بیسڈ فورکاسٹنگ اور ڈیلفائی طریقہ شامل ہیں۔'
      },
      {
        stem: `What strategies can an organization adopt when human resource requirements and availability do not match? Elaborate on the actions taken during a worker surplus (restricted hiring, reduced hours, early retirements, layoffs) versus a worker shortage (creative recruiting, compensation incentives, training).`,
        correct: `Strategies for Balancing Labor Demand and Supply Discrepancies:

When an organization's forecasted HR demand diverges from internal availability, management must enact decisive balancing interventions:

I. Strategies for Managing a Worker Surplus (Labor Supply > Labor Demand):
When the organization employs more staff than operationally needed, continuing without intervention drains profitability. Corrective options include:
1. Restricted Hiring / Natural Attrition:
• Enacting a freeze on all external hiring. As employees leave voluntarily through natural resignation or routine retirement, their posts are eliminated or absorbed.
2. Reduced Work Hours & Work Sharing:
• Shortening the standard 40-hour workweek or allowing two employees to share a single full-time position. This spreads available work, lowers overall payroll expense, and prevents unemployment.
3. Voluntary Early Retirement Incentives (Golden Handshakes):
• Providing attractive financial separation packages to eligible senior employees. This peacefully reduces headcount at the top of the wage scale without damaging morale.
4. Downward Redeployment & Transfers:
• Relocating surplus employees to other growing branches or sister subsidiaries experiencing worker deficits.
5. Involuntary Layoffs:
• Permanent termination of employment contracts. Regarded as a measure of last resort due to severance costs, loss of morale, and potential labor lawsuits.

II. Strategies for Managing a Worker Shortage (Labor Demand > Labor Supply):
When business expansion or attrition leaves the company with insufficient staffing, output is severely threatened. Corrective actions include:
1. Creative and Aggressive Recruiting:
• Utilizing niche digital job portals, social media targeting, employee referral bounties, and partnering with vocational institutes to expand the candidate pool.
2. Compensation Incentives and Sign-on Bonuses:
• Offering above-market entry wages, performance bonuses, flexible work models, and comprehensive health benefits to attract high-caliber talent from competitors.
3. Overtime Authorization:
• Requesting existing employees to work paid overtime hours to satisfy short-term production spikes without incurring long-term permanent payroll obligations.
4. Contingent Workforce and Strategic Outsourcing:
• Engaging temporary staffing agencies, freelance independent contractors, or third-party service providers to handle non-core workflows.
5. Internal Talent Upskilling and Accelerated Training:
• Implementing high-intensity training academies and mentorships to elevate existing junior staff into specialized vacancies quickly.`,
        explanation: 'Details corrective actions for labor imbalances: Worker Surplus (attrition, reduced hours, early retirement, transfers, layoffs) vs. Worker Shortage (recruiting, incentives, overtime, outsourcing, internal training).',
        urdu_answer: 'افرادی قوت کے عدم توازن کو حل کرنے کی حکمت عملیاں: سرپلس کی صورت میں ہائرنگ فریز، اوقات کار میں کمی، گولڈن ہینڈ شیک، ملازمین کے تبادلے اور برطرفیاں کی جاتی ہیں۔ شارٹیج کی صورت میں نئی بھرتیاں، پرکشش مراعات و بونس، اوور ٹائم، آؤٹ سورسنگ اور ملازمین کی تیز رفتار تربیت کی جاتی ہے۔'
      }
    ];

    const insMgt9Long = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
      VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
    `);

    for (const l of longsMgt9) {
      insMgt9Long.run(l9Id, l.stem, l.correct, l.explanation, l.urdu_answer);
    }
  }
}




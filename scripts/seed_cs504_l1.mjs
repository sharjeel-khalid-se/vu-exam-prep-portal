import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// 1. Get or create CS504 subject
let cs504 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs504'`).get();
if (!cs504) {
  const sRes = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES ('Software Engineering - I', 'cs504', 'CS504', 'Systematic principles, methodologies, and architectures for robust software lifecycle engineering — Virtual University')
  `).run();
  cs504 = { id: sRes.lastInsertRowid };
}

// 2. Clear old CS504 Lecture 1 (if exists) so we can feed full authentic questions
const oldL1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(cs504.id);
let l1Id;

if (oldL1) {
  db.prepare(`DELETE FROM progress WHERE question_id IN (SELECT id FROM questions WHERE lecture_id = ?)`).run(oldL1.id);
  db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(oldL1.id);
  db.prepare(`UPDATE lectures SET title = 'Introduction to Software Engineering, Software Crisis & Principles' WHERE id = ?`).run(oldL1.id);
  l1Id = oldL1.id;
  console.log(`Updated existing CS504 L1 (id=${l1Id})`);
} else {
  const lRes = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 1, 'Introduction to Software Engineering, Software Crisis & Principles')
  `).run(cs504.id);
  l1Id = lRes.lastInsertRowid;
  console.log(`Created CS504 L1 (id=${l1Id})`);
}

const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insS = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
const insL = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

// ── 10 MCQs ─────────────────────────────────────────────────────────────────

// MCQ 1
ins.run(l1Id, 'mcq',
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

// MCQ 2
ins.run(l1Id, 'mcq',
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

// MCQ 3
ins.run(l1Id, 'mcq',
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

// MCQ 4
ins.run(l1Id, 'mcq',
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

// MCQ 5
ins.run(l1Id, 'mcq',
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

// MCQ 6
ins.run(l1Id, 'mcq',
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

// MCQ 7
ins.run(l1Id, 'mcq',
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

// MCQ 8
ins.run(l1Id, 'mcq',
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

// MCQ 9
ins.run(l1Id, 'mcq',
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

// MCQ 10
ins.run(l1Id, 'mcq',
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

// ── 2 Short Questions ────────────────────────────────────────────────────────

// Short 1
insS.run(l1Id,
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

// Short 2
insS.run(l1Id,
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

// ── 1 Long Question ──────────────────────────────────────────────────────────

// Long 1
insL.run(l1Id,
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

// Verification summary
const qcount = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type`).all(l1Id);
console.log('\nCS504 Lecture 1 Question Summary:');
qcount.forEach(q => console.log(`  ${q.type}: ${q.c}`));

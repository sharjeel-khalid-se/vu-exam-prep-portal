import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// 1. Get CS504 subject
const cs504 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs504'`).get();
if (!cs504) {
  console.error('CS504 subject not found');
  process.exit(1);
}

// 2. Clear old CS504 Lecture 3 if exists, or insert new
const oldL3 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(cs504.id);
let l3Id;

if (oldL3) {
  db.prepare(`DELETE FROM progress WHERE question_id IN (SELECT id FROM questions WHERE lecture_id = ?)`).run(oldL3.id);
  db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(oldL3.id);
  db.prepare(`UPDATE lectures SET title = 'Requirement Engineering Concepts & Role of SRS' WHERE id = ?`).run(oldL3.id);
  l3Id = oldL3.id;
  console.log(`Updated existing CS504 L3 (id=${l3Id})`);
} else {
  const lRes = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 3, 'Requirement Engineering Concepts & Role of SRS')
  `).run(cs504.id);
  l3Id = lRes.lastInsertRowid;
  console.log(`Created CS504 L3 (id=${l3Id})`);
}

const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insS = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
const insL = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

// ── 8 MCQs ──────────────────────────────────────────────────────────────────

// MCQ 1
ins.run(l3Id, 'mcq',
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

// MCQ 2
ins.run(l3Id, 'mcq',
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

// MCQ 3
ins.run(l3Id, 'mcq',
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

// MCQ 4
ins.run(l3Id, 'mcq',
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

// MCQ 5
ins.run(l3Id, 'mcq',
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

// MCQ 6
ins.run(l3Id, 'mcq',
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

// MCQ 7
ins.run(l3Id, 'mcq',
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

// MCQ 8
ins.run(l3Id, 'mcq',
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

// ── 2 Short Questions ────────────────────────────────────────────────────────

// Short 1
insS.run(l3Id,
  'Define Requirement Engineering. What is its primary focus during software development?',
  `Definition:
Requirement Engineering is the disciplined, systematic process of discovering, analyzing, validating, documenting, and managing the services, features, and operational constraints required of a software system.

Primary Focus:
• Phase: Belongs centrally to the Definition Phase of the software development lifecycle.
• Core Focus: Focuses strictly on "WHAT" the system must accomplish, rather than "HOW" it will be designed or implemented.
• Boundary: Deals with user needs, domain constraints, business rules, and interface behaviors while intentionally leaving data structures, algorithms, and technology stacks to the subsequent design and development phases.`,
  'Requirement Engineering is the systematic process in the Definition phase that focuses on "WHAT" the software must do rather than "HOW" to build it.'
);

// Short 2
insS.run(l3Id,
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

// ── 2 Long Questions ─────────────────────────────────────────────────────────

// Long 1
insL.run(l3Id,
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

// Long 2
insL.run(l3Id,
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

// Verification summary
const qcount = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type`).all(l3Id);
console.log('\nCS504 Lecture 3 Question Summary:');
qcount.forEach(q => console.log(`  ${q.type}: ${q.c}`));

const allLectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = ? ORDER BY number`).all(cs504.id);
console.log('\nAll CS504 Lectures:');
allLectures.forEach(l => {
  const qc = db.prepare(`SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?`).get(l.id).c;
  console.log(`  L${l.number} (id=${l.id}): "${l.title}" — ${qc} questions`);
});

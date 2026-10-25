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

// 2. Clear old CS504 Lecture 2 if exists, or insert new
const oldL2 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(cs504.id);
let l2Id;

if (oldL2) {
  db.prepare(`DELETE FROM progress WHERE question_id IN (SELECT id FROM questions WHERE lecture_id = ?)`).run(oldL2.id);
  db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(oldL2.id);
  db.prepare(`UPDATE lectures SET title = 'Software Engineering Framework, Development Loop & Phases' WHERE id = ?`).run(oldL2.id);
  l2Id = oldL2.id;
  console.log(`Updated existing CS504 L2 (id=${l2Id})`);
} else {
  const lRes = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 2, 'Software Engineering Framework, Development Loop & Phases')
  `).run(cs504.id);
  l2Id = lRes.lastInsertRowid;
  console.log(`Created CS504 L2 (id=${l2Id})`);
}

const ins = db.prepare(`INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, marks, time_minutes, question_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insS = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'short', ?, ?, ?, 3, 3, 'lecture')`);
const insL = db.prepare(`INSERT INTO questions (lecture_id, type, stem, correct, explanation, marks, time_minutes, question_category) VALUES (?, 'long', ?, ?, ?, 5, 5, 'midterm')`);

// ── 6 MCQs ──────────────────────────────────────────────────────────────────

// MCQ 1
ins.run(l2Id, 'mcq',
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

// MCQ 2
ins.run(l2Id, 'mcq',
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

// MCQ 3
ins.run(l2Id, 'mcq',
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

// MCQ 4
ins.run(l2Id, 'mcq',
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

// MCQ 5
ins.run(l2Id, 'mcq',
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

// MCQ 6
ins.run(l2Id, 'mcq',
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

// ── 3 Short Questions ────────────────────────────────────────────────────────

// Short 1
insS.run(l2Id,
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

// Short 2
insS.run(l2Id,
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

// Short 3
insS.run(l2Id,
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

// ── 2 Long Questions ─────────────────────────────────────────────────────────

// Long 1
insL.run(l2Id,
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

// Long 2
insL.run(l2Id,
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

// Verification summary
const qcount = db.prepare(`SELECT type, COUNT(*) as c FROM questions WHERE lecture_id = ? GROUP BY type`).all(l2Id);
console.log('\nCS504 Lecture 2 Question Summary:');
qcount.forEach(q => console.log(`  ${q.type}: ${q.c}`));

const allLectures = db.prepare(`SELECT id, number, title FROM lectures WHERE subject_id = ? ORDER BY number`).all(cs504.id);
console.log('\nAll CS504 Lectures:');
allLectures.forEach(l => {
  const qc = db.prepare(`SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?`).get(l.id).c;
  console.log(`  L${l.number} (id=${l.id}): "${l.title}" — ${qc} questions`);
});

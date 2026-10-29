import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS504
const cs504 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs504'").get();
if (!cs504) {
  console.error('CS504 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(cs504.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Software Architecture Fundamentals: Perry & Wolfe Formula, Krutchen 4+1 & Clement Views')
  `).run(cs504.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`CS504 Lecture 12 already exists with ID: ${lec12.id}`);
}

const lId = lec12.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 12.`);

const insMcq = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'lecture')
`);

const insShort = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 2, 2, 'lecture')
`);

const insShort3 = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
`);

const insLong = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// 7 Past Paper MCQs
const mcqs = [
  {
    stem: 'Perry and Wolfe proposed which formula for software architecture?',
    options: {
      a: 'Software architecture = {Forms, Rationale}',
      b: 'Software architecture = {Elements, Forms, Rationale}',
      c: 'Software architecture = {Parts, Rationale}',
      d: 'Software architecture = {Parts, Elements}'
    },
    correct: 'b',
    explanation: 'Perry and Wolfe (1992) introduced the classic architectural formulation: Software Architecture = {Elements, Forms, Rationale}, capturing architectural elements, their configurations/forms, and underlying motivations (CS504 Handouts Page 73).',
    urdu_answer: 'پیری اور ولف نے سافٹ ویئر آرکیٹیکچر کا فارمولا {Elements, Forms, Rationale} تجویز کیا۔'
  },
  {
    stem: "Which one of these represents Krutchen's 4+1 architectural view model?",
    options: {
      a: 'Logical view, Process view, Physical view, Development view, Use case view',
      b: 'Logical view, Dynamic view, Physical view, Development view, Use case view',
      c: 'Logical view, Process view, Physical view, Development view, Sequence view',
      d: 'Dynamic view, Process view, Physical view, Development view, Use case view'
    },
    correct: 'a',
    explanation: "Philippe Krutchen's 4+1 View Model organizes software architecture into four primary views (Logical, Process, Physical, Development) centered around and verified by the Use Case view (CS504 Handouts Pages 74–75).",
    urdu_answer: 'کرچن کے 4+1 ماڈل میں لاجیکل، پراسیس، فزیکل، ڈیولپمنٹ اور یوز کیس ویو شامل ہیں۔'
  },
  {
    stem: "Logical view in Krutchen's 4+1 architectural view model captures __________.",
    options: {
      a: 'Concurrency and synchronization aspects of the design',
      b: 'Mapping(s) of the software onto the hardware and reflects its distributed aspect',
      c: 'Object model of the design',
      d: 'Static organization of the software in its development environment'
    },
    correct: 'c',
    explanation: 'The Logical View models functional requirements and domain abstractions, capturing the object and class models, structural packages, and behavioral relationships (CS504 Handouts Page 74).',
    urdu_answer: 'لاجیکل ویو ڈیزائن کے آبجیکٹ ماڈل اور کلاس سٹرکچر کی نمائندگی کرتا ہے۔'
  },
  {
    stem: "Process view in Krutchen's 4+1 architectural view model captures __________.",
    options: {
      a: 'Object model of the design',
      b: 'Concurrency and synchronization aspects of the design',
      c: 'Mapping(s) of the software onto the hardware and reflects its distributed aspect',
      d: 'Static organization of the software in its development environment'
    },
    correct: 'b',
    explanation: 'The Process View focuses on dynamic runtime aspects including execution threads, concurrency, process synchronization, performance, and scalability (CS504 Handouts Page 75).',
    urdu_answer: 'پراسیس ویو ڈیزائن کے کنکرنسی اور سنکرونائزیشن (تھریڈز/پراسیسز) کو ظاہر کرتا ہے۔'
  },
  {
    stem: "Development view in Krutchen's 4+1 architectural view model captures __________.",
    options: {
      a: 'Object model of the design',
      b: 'Concurrency and synchronization aspects of the design',
      c: 'Mapping(s) of the software onto the hardware and reflects its distributed aspect',
      d: 'Static organization of the software in its development environment'
    },
    correct: 'd',
    explanation: 'The Development View describes the static structure of software modules, libraries, source packages, and build environment organization (CS504 Handouts Page 75).',
    urdu_answer: 'ڈیولپمنٹ ویو ڈیولپمنٹ کے ماحول میں سافٹ ویئر ماڈیولز کی تنظیمی ساخت کو بیان کرتا ہے۔'
  },
  {
    stem: "Maintainability and portability issues are discussed in __________ view (in Clement's modified architectural model).",
    options: {
      a: 'Functional view',
      b: 'Physical view',
      c: 'Code view',
      d: 'Logical view'
    },
    correct: 'c',
    explanation: "In Paul Clement's modified architectural framework, the Code View focuses on source code organization into modules and packages, directly addressing maintainability, buildability, and portability (CS504 Handouts Page 76).",
    urdu_answer: 'کلیمینٹ کے ماڈل میں مینٹین ایبلٹی اور پورٹیبلٹی کے مسائل کا جائزہ کوڈ ویو میں لیا جاتا ہے۔'
  },
  {
    stem: 'Design of software architecture is a(n) __________ process.',
    options: {
      a: 'Deterministic',
      b: 'Creative and iterative',
      c: 'Sequential',
      d: 'Automated'
    },
    correct: 'b',
    explanation: 'Designing a software architecture is an iterative, creative problem-solving activity requiring synthesized judgment and trade-off negotiations between competing quality parameters (CS504 Handouts Page 73).',
    urdu_answer: 'سافٹ ویئر آرکیٹیکچر ڈیزائن ایک تخلیقی اور تکراری (creative and iterative) عمل ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 12.`);

// 3 Short Questions
const shorts = [
  {
    stem: 'Differentiate between architectural design and system architecture in a single line / brief distinction.',
    correct: `<p><strong>Core Distinction (CS504 Handouts Page 73):</strong></p>
<p><strong>Architectural Design</strong> is the creative and iterative <em>process</em> of defining system elements, structural styles, relationships, and trade-offs, whereas <strong>System Architecture</strong> is the tangible <em>outcome or blueprint</em> representing the resulting components, forms, and rationales of that process.</p>`,
    explanation: 'Architectural Design is the engineering activity/process, whereas System Architecture is the resultant artifact/structure.',
    urdu_answer: 'آرکیٹیکچرل ڈیزائن وہ عمل (process) ہے جس کے ذریعے سسٹم کے اجزاء وضع کیے جاتے ہیں، جبکہ سسٹم آرکیٹیکچر اس عمل کا حاصل کردہ حتمی نقشہ یا سٹرکچر (outcome) ہوتا ہے۔',
    marks: 2
  },
  {
    stem: 'Is the design of software architecture a creative process? Briefly explain.',
    correct: `<p><strong>Yes, Software Architecture is Inherently a Creative Process:</strong></p>
<p>Unlike routine algorithmic coding, architectural design requires creative synthesis because:</p>
<ul>
  <li><strong>No Unique Solution:</strong> For any given requirements specification, multiple architectural styles can satisfy functionality; the architect must creatively select the best fit.</li>
  <li><strong>Balancing Conflicting Trade-offs:</strong> Resolving competing quality attributes (e.g., peak performance vs. maximum maintainability or budget limits) demands creative structural compromises.</li>
  <li><strong>Iterative Refinement:</strong> Architects iteratively hypothesize, evaluate, and reshape patterns until the optimal architectural balance is achieved (CS504 Handouts Page 73).</li>
</ul>`,
    explanation: 'Architectural design requires creative judgment to synthesize components and negotiate competing quality trade-offs where no single formula exists.',
    urdu_answer: 'جی ہاں، سافٹ ویئر آرکیٹیکچر ایک تخلیقی عمل ہے کیونکہ متضاد ضروریات (جیسے رفتار اور مینٹین ایبلٹی) میں توازن پیدا کرنے کے لیے کوئی ایک مقررہ فارمولا نہیں ہوتا بلکہ تخلیقی انداز میں نمونے وضع کرنا پڑتے ہیں۔',
    marks: 2
  },
  {
    stem: 'What is the role and importance of Architectural Design in software engineering?',
    correct: `<p><strong>Key Roles and Importance of Architectural Design (CS504 Handouts Pages 73–74):</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Stakeholder Communication:</strong> Provides an accessible high-level abstraction that enables diverse stakeholders (users, clients, managers, and engineers) to discuss and align on system expectations.</li>
  <li><strong>Earliest High-Impact Decisions:</strong> Embodies the earliest structural choices (concurrency, distributed deployment, persistence paradigm). Errors caught here avoid catastrophic downstream rewrite costs.</li>
  <li><strong>Primary Driver of Quality Attributes:</strong> Directly dictates non-functional quality parameters such as reliability, scalability, security, performance, and maintainability.</li>
  <li><strong>Transferable System Abstraction:</strong> Forms a reusable, transferable model across product lines and similar domain families.</li>
</ol>`,
    explanation: 'Architectural design establishes the structural foundation of software, enables stakeholder communication, and determines all critical quality attributes.',
    urdu_answer: 'آرکیٹیکچرل ڈیزائن وہ بنیادی فریم ورک فراہم کرتا ہے جو اسٹیک ہولڈرز کے درمیان رابطے کا کام کرتا ہے، ابتدائی اہم فیصلے طے کرتا ہے، اور سافٹ ویئر کی کارکردگی و سیکیورٹی کا تعین کرتا ہے۔',
    marks: 3
  }
];

for (const s of shorts) {
  if (s.marks === 2) {
    insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
  } else {
    insShort3.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 12.`);

// 2 Long Questions
const longs = [
  {
    stem: "Explain Krutchen's 4+1 Architectural View Model. Briefly describe the purpose, primary stakeholders, and key concerns addressed by each of the five views.",
    correct: `<p><strong>Krutchen's 4+1 Architectural View Model Framework:</strong></p>
<p>Proposed by Philippe Krutchen (1995), the 4+1 View Model organizes software architecture into four specialized views corresponding to different stakeholder perspectives, integrated and verified by a central Fifth view (CS504 Handouts Pages 74–75).</p>

<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">View</th>
      <th class="p-2 border">Primary Stakeholders</th>
      <th class="p-2 border">Core Focus / Concerns Addressed</th>
      <th class="p-2 border">Key Artifacts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">1. Logical View</td>
      <td class="p-2 border">End-users, Analysts, Software Designers</td>
      <td class="p-2 border">Captures functional requirements and domain concepts; models system entities, services, and structural relationships.</td>
      <td class="p-2 border">Class diagrams, Object models, State charts.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">2. Process View</td>
      <td class="p-2 border">Integrators, Performance &amp; System Architects</td>
      <td class="p-2 border">Addresses non-functional runtime behavior: concurrency, multithreading, task synchronization, message queuing, and throughput.</td>
      <td class="p-2 border">Activity diagrams, Communication diagrams, Thread models.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">3. Development View</td>
      <td class="p-2 border">Software Developers, Build Managers</td>
      <td class="p-2 border">Static organization of code in the programming environment: source modules, packages, third-party libraries, and subsystem boundaries.</td>
      <td class="p-2 border">Package diagrams, Component diagrams.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">4. Physical View</td>
      <td class="p-2 border">System Engineers, Network &amp; DevOps Teams</td>
      <td class="p-2 border">Mapping of software elements onto hardware nodes, network topology, communication channels, and distributed scalability.</td>
      <td class="p-2 border">Deployment diagrams, Network topology charts.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">5. Use Case View (+1)</td>
      <td class="p-2 border">All Stakeholders (Unifying Central Core)</td>
      <td class="p-2 border">Illustrates system behavior from user perspective; serves as the validation driver to ensure the four views work together seamlessly.</td>
      <td class="p-2 border">Use case diagrams, Elaborated scenarios.</td>
    </tr>
  </tbody>
</table>

<p><strong>Why "+1" is Unique:</strong> The Use Case View is designated as "+1" because it is redundant with the other views in terms of specification, but essential for guiding architectural discovery and validating cross-view consistency.</p>`,
    explanation: "Krutchen's 4+1 model addresses the diverse concerns of developers, integrators, operations, and users through 4 specialized views bound together by practical use case scenarios.",
    urdu_answer: 'کرچن کے 4+1 ماڈل میں لاجیکل، پراسیس، ڈیولپمنٹ اور فزیکل ویو مختلف اسٹیک ہولڈرز کی ضروریات کو پورا کرتے ہیں، جبکہ درمیان میں موجود یوز کیس ویو تمام ویوز کو باہم جوڑتا اور تصدیق کرتا ہے۔'
  },
  {
    stem: "Discuss Clement's modified version of Krutchen's 4+1 Architectural View Model. Highlight the specific role of the Code View and Concurrency View in software maintainability and performance.",
    correct: `<p><strong>1. Clement's Re-organization of Architectural Views:</strong></p>
<p>Paul Clement and colleagues at the Software Engineering Institute (SEI) refined Krutchen's 4+1 model into a more pragmatically oriented structure divided across clear engineering boundaries: <strong>Functional View</strong>, <strong>Concurrency View</strong>, <strong>Code View</strong>, and <strong>Physical View</strong> (CS504 Handouts Page 76).</p>

<p><strong>2. Focus on Code View &amp; Maintainability:</strong></p>
<ul>
  <li><strong>Structural Scope:</strong> The Code View articulates the organization of raw source code, packages, compilation units, directory hierarchies, and modular dependencies.</li>
  <li><strong>Maintainability Impact:</strong> By rigorously maintaining clean module dependencies in the Code View, circular dependencies are prevented. Developers can modify, refactor, or upgrade a module in isolation without triggering cascading build or runtime failures across unrelated units.</li>
  <li><strong>Portability &amp; Buildability:</strong> Isolating platform-specific libraries into dedicated source layers facilitates re-compilation across diverse target platforms (e.g., Linux vs. Windows).</li>
</ul>

<p><strong>3. Focus on Concurrency View &amp; Performance:</strong></p>
<ul>
  <li><strong>Structural Scope:</strong> The Concurrency View models concurrent threads of control, shared memory zones, mutual exclusion locks, asynchronous event loops, and queue managers.</li>
  <li><strong>Performance &amp; Scalability:</strong> It directly eliminates system bottlenecks by determining which tasks can run in parallel across multi-core processors.</li>
  <li><strong>Reliability &amp; Deadlock Prevention:</strong> Formally mapping thread synchronization prevents race conditions, resource starvation, and catastrophic deadlocks under heavy concurrent user load.</li>
</ul>

<p><strong>4. Summary:</strong> While Krutchen established the conceptual multi-view standard, Clement's separation explicitly isolates static code maintainability (Code View) from dynamic multi-threaded runtime optimization (Concurrency View).</p>`,
    explanation: "Clement's architectural model isolates source code maintainability inside the Code View while dedicating the Concurrency View to multi-threaded throughput and deadlock prevention.",
    urdu_answer: 'کلیمینٹ کے ماڈل میں کوڈ ویو سورس کوڈ اور پیکجز کو منظم کر کے مینٹین ایبلٹی بہتر بناتا ہے جبکہ کنکرنسی ویو تھریڈز اور متوازی پروسیسنگ کو سنبھال کر سسٹم کی کارکردگی اور سپیڈ میں اضافہ کرتا ہے۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 12.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for CS504 Lecture 12.`);

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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(cs504.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Software Design Principles: Quality Attributes, Abstraction, Modularity & Separation of Concerns')
  `).run(cs504.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`CS504 Lecture 11 already exists with ID: ${lec11.id}`);
}

const lId = lec11.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 11.`);

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

// 7 Past Paper MCQs
const mcqs = [
  {
    stem: '__________ is a technique in which we construct a model of an entity based upon its essential characteristics and ignore the inessential details.',
    options: {
      a: 'Inheritance',
      b: 'Polymorphism',
      c: 'Aggregation',
      d: 'Abstraction'
    },
    correct: 'd',
    explanation: 'Abstraction is a core design technique that models an entity focusing on its essential characteristics while deliberately ignoring inessential details to manage complexity (CS504 Handouts Page 70).',
    urdu_answer: 'ایبسٹریکشن وہ تکنیک ہے جس میں بنیادی خصوصیات پر ماڈل بنایا جاتا ہے اور غیر ضروری تفصیلات کو نظر انداز کیا جاتا ہے۔'
  },
  {
    stem: 'A complex system may be divided into smaller pieces of lesser complexity called __________',
    options: {
      a: 'Pieces',
      b: 'Fragmentation',
      c: 'Modules',
      d: 'Abstraction'
    },
    correct: 'c',
    explanation: 'Modularity divides a complex software system into smaller, manageable units of lesser complexity termed modules (CS504 Handouts Page 71).',
    urdu_answer: 'پیچیدہ سسٹم کو چھوٹی اور کم پیچیدہ اکائیوں میں تقسیم کیا جاتا ہے جنہیں ماڈیولز کہتے ہیں۔'
  },
  {
    stem: '__________, modularity, and abstraction are different but related principles.',
    options: {
      a: 'Separation of concern',
      b: 'Layering',
      c: 'Substitution',
      d: 'Cohesion'
    },
    correct: 'a',
    explanation: 'Separation of concern, modularity, and abstraction are interrelated principles that together manage complexity in software architecture (CS504 Handouts Page 71).',
    urdu_answer: 'سیپریشن آف کنسرنز، ماڈیولریٹی اور ایبسٹریکشن ایک دوسرے سے جڑے ہوئے متعلقہ ڈیزائن اصول ہیں۔'
  },
  {
    stem: "The technique allowing us to look at an entity's important external characteristics, at the same time hiding its inner complexity, is called __________ / Hiding internal details is called __________",
    options: {
      a: 'Abstraction (for external view) / Encapsulation (for hiding internal details)',
      b: 'Inheritance (for external view) / Polymorphism (for hiding internal details)',
      c: 'Modularity (for external view) / Layering (for hiding internal details)',
      d: 'Aggregation (for external view) / Generalization (for hiding internal details)'
    },
    correct: 'a',
    explanation: 'Abstraction provides a model of essential external characteristics, whereas Encapsulation (information hiding) conceals internal operational complexities (CS504 Handouts Pages 70–71).',
    urdu_answer: 'بیرونی خصوصیات کو دیکھنا ایبسٹریکشن کہلاتا ہے جبکہ اندرونی تفصیلات کو چھپانا اینکیپسولیشن کہلاتا ہے۔'
  },
  {
    stem: 'Which of the following strategies lead to good software design?',
    options: {
      a: 'Separation of concerns',
      b: 'Modularity',
      c: 'Divide-and-conquer',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: 'Sound software design leverages divide-and-conquer to break systems into parts, separation of concerns to isolate functionalities, and modularity to structure components (CS504 Handouts Page 71).',
    urdu_answer: 'تمام دیے گئے طریقے (سیپریشن آف کنسرنز، ماڈیولریٹی اور ڈیوائیڈ اینڈ کونکور) اچھے سافٹ ویئر ڈیزائن کی بنیادی حکمت عملیاں ہیں۔'
  },
  {
    stem: '__________ provides a road map for implementation by clearly describing how the software system is to be realized / Blueprint for software construction.',
    options: {
      a: 'Requirement Engineering',
      b: 'Implementation process',
      c: 'Software design',
      d: 'Testing'
    },
    correct: 'c',
    explanation: 'Software design acts as the architectural blueprint and implementation roadmap that defines structural relationships and construction specifications (CS504 Handouts Page 69).',
    urdu_answer: 'سافٹ ویئر ڈیزائن عمل درآمد کا تفصیلی نقشہ یا بلیو پرنٹ فراہم کرتا ہے کہ سسٹم کو کیسے بنایا جائے گا۔'
  },
  {
    stem: 'The importance of software design can be summarized in a single word which is __________',
    options: {
      a: 'Efficiency',
      b: 'Accuracy',
      c: 'Quality',
      d: 'Complexity'
    },
    correct: 'c',
    explanation: 'Design is the pivotal place where quality is fostered in software development. Good design directly produces software quality, maintainability, and reliability (CS504 Handouts Page 70).',
    urdu_answer: 'سافٹ ویئر ڈیزائن کی تمام اہمیت کو ایک لفظ "کوالٹی" میں سمویا جا سکتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 11.`);

// 2 Short Questions
const shorts = [
  {
    stem: 'Define Abstraction. How does the principle of abstraction help software engineers manage system complexity?',
    correct: `<p><strong>1. Definition of Abstraction:</strong></p>
<p>Abstraction is a fundamental intellectual and engineering technique wherein we construct a mental or formal model of an entity based strictly upon its <strong>essential characteristics</strong> while deliberately ignoring or filtering out inessential, low-level implementation details (CS504 Handouts Page 70).</p>

<p><strong>2. How Abstraction Manages Complexity:</strong></p>
<ul>
  <li><strong>Cognitive Chunking:</strong> Human working memory can only process approximately $7 \\pm 2$ pieces of information simultaneously. Abstraction allows developers to treat complex multi-tiered subsystems as single conceptual units.</li>
  <li><strong>Separation of "What" from "How":</strong> It separates the external behavior (what the component provides) from the internal implementation (how algorithms and data structures execute).</li>
  <li><strong>Hierarchical Layering:</strong> It enables higher-level modules to interact with lower-level services through well-defined abstract interfaces without depending on underlying hardware or database mechanics.</li>
</ul>`,
    explanation: 'Abstraction suppresses irrelevant low-level details so developers can reason about large-scale software systems within human cognitive limits.',
    urdu_answer: 'ایبسٹریکشن وہ بنیادی تکنیک ہے جس میں ہم کسی سسٹم کے صرف اہم (ضروری) خواص پر توجہ دیتے ہیں اور غیر ضروری اندرونی تفصیلات کو نظر انداز کر دیتے ہیں تاکہ پیچیدگی کو سنبھالا جا سکے۔'
  },
  {
    stem: 'It is a fact that good design makes software maintenance easier. Which core design principles help achieve maintainability, and how?',
    correct: `<p><strong>Core Design Principles that Facilitate Software Maintenance (CS504 Handouts Pages 71–72):</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Modularity:</strong> Decomposing a large system into smaller, self-contained, and manageable modules. When a bug occurs or a change is requested, engineers only inspect and modify the affected module rather than tracing the entire codebase.</li>
  <li><strong>Separation of Concerns (SoC):</strong> Isolating distinct functionalities (e.g., UI, business logic, and database persistence) prevents ripple effects where modifying one feature inadvertently breaks another.</li>
  <li><strong>Encapsulation (Information Hiding):</strong> Hiding internal data structures behind strict public interfaces guarantees that internal algorithmic refactoring does not break external dependent code.</li>
  <li><strong>High Cohesion &amp; Loose Coupling:</strong> Designing modules that perform a single, focused task with minimal dependencies on other modules makes future upgrades safe and cost-effective.</li>
</ol>`,
    explanation: 'Good software design prevents code coupling, isolates bugs to single modules, and drastically reduces the cost and effort of long-term software maintenance.',
    urdu_answer: 'ماڈیولریٹی، سیپریشن آف کنسرنز، اور اینکیپسولیشن ایسے ڈیزائن اصول ہیں جو کوڈ کو آزاد ماڈیولز میں تقسیم کر کے مستقبل میں بگ فکسنگ اور اپ گریڈز کو انتہائی آسان اور محفوظ بناتے ہیں۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 11.`);

// 2 Long Questions
const longs = [
  {
    stem: 'Software design can be measured and analyzed using various quality parameters (e.g., Efficiency, Compactness, Reusability, Maintainability). Explain why a design that is good from one angle (e.g., efficiency) may not be suitable from another (e.g., maintainability), using an example of an embedded control system versus an ordinary business system.',
    correct: `<p><strong>1. Multi-Dimensional Quality Trade-offs in Software Design:</strong></p>
<p>Software quality cannot be evaluated along a single axis. Critical quality parameters such as <strong>Efficiency</strong> (execution speed/resource consumption), <strong>Compactness</strong> (memory footprint), <strong>Maintainability</strong> (readability and ease of modification), and <strong>Reusability</strong> naturally conflict. Optimizing aggressively for one quality attribute almost invariably requires compromises on others (CS504 Handouts Pages 69–70).</p>

<p><strong>2. Comparative Quality Analysis: Embedded System vs. Business System:</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Quality Dimension</th>
      <th class="p-2 border">Embedded Control System (e.g., Pacemaker, ABS)</th>
      <th class="p-2 border">Ordinary Business System (e.g., Payroll, ERP)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Primary Quality Driver</td>
      <td class="p-2 border text-emerald-800 font-semibold">Maximum Efficiency &amp; Compactness</td>
      <td class="p-2 border text-blue-800 font-semibold">High Maintainability &amp; Flexibility</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Hardware Constraints</td>
      <td class="p-2 border">Strictly limited CPU cycles, minimal RAM (kilobytes), strict battery constraints.</td>
      <td class="p-2 border">Abundant server RAM, cloud elasticity, expandable multi-core processors.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Design / Coding Strategy</td>
      <td class="p-2 border">Low-level C/Assembly, bit manipulation, inlined routines, global registers to eliminate call-stack overhead.</td>
      <td class="p-2 border">Layered object-oriented patterns, descriptive variable names, decoupled REST services, automated logging.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Maintainability Trade-off</td>
      <td class="p-2 border">Low readability and difficult to modify; acceptable trade-off because real-time safety is life-critical.</td>
      <td class="p-2 border">High readability and simple to extend; accepts slight CPU overhead in order to minimize developer maintenance costs.</td>
    </tr>
  </tbody>
</table>

<p><strong>3. Conclusion &amp; Key Design Lesson:</strong></p>
<p>A design is "good" only relative to its specific operational context. Writing a business ERP system in unreadable, bit-packed assembly for absolute CPU efficiency would be a catastrophic design failure due to exorbitant maintenance costs. Conversely, applying heavy enterprise object abstractions inside an embedded brake controller could cause catastrophic deadline misses in real-time safety environments.</p>`,
    explanation: 'Software design is a balancing act of trade-offs where achieving peak efficiency often conflicts with code maintainability and readability.',
    urdu_answer: 'سافٹ ویئر ڈیزائن مختلف کوالٹی خصوصیات (جیسے رفتار بمقابلہ کوڈ کی آسانی) کے درمیان توازن قائم کرنے کا نام ہے۔ ایمبیڈڈ سسٹمز میں میموری اور سپیڈ سب سے اہم ہوتی ہے جبکہ بزنس سسٹمز میں مینٹین ایبلٹی اور ریڈ ایبلٹی کو ترجیح دی جاتی ہے۔'
  },
  {
    stem: 'Explain the three core design principles—Abstraction, Modularity, and Separation of Concerns. How do these principles work together to handle software complexity and yield a cohesive, loosely coupled design?',
    correct: `<p><strong>1. Detailed Breakdown of the Three Core Design Principles (CS504 Handouts Pages 70–72):</strong></p>
<ul>
  <li>
    <strong>Abstraction:</strong> The process of identifying the fundamental, essential characteristics of an entity while hiding non-essential implementation details. It provides external consumers with a simplified conceptual interface ("What" rather than "How").
  </li>
  <li>
    <strong>Modularity:</strong> The logical partitioning of software into distinct, bounded units (modules, packages, classes) that can be compiled, tested, and modified independently. Each module packages related data and operations.
  </li>
  <li>
    <strong>Separation of Concerns (SoC):</strong> The architectural guideline that distinct responsibilities and problem domains must be segregated into independent sections of code (e.g., user interface rendering, business validation rules, and database data access).
  </li>
</ul>

<p><strong>2. How These Principles Work Together to Manage Complexity:</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Divide-and-Conquer Synergy:</strong> <em>Separation of Concerns</em> identifies the distinct problem boundaries; <em>Modularity</em> creates the physical containers (modules) for those concerns; and <em>Abstraction</em> creates clean interface contracts so modules can collaborate without knowing each other's internal logic.</li>
  <li><strong>High Cohesion:</strong> By applying Separation of Concerns, every individual module focuses on executing one cohesive responsibility, ensuring that elements within that module strongly belong together.</li>
  <li><strong>Loose Coupling:</strong> Because modules communicate strictly through <em>Abstractions</em> (interfaces/APIs) rather than raw internal variables, changes inside one module do not ripple through or break dependent modules.</li>
  <li><strong>Parallel Development &amp; Testability:</strong> Independent developers can build and unit-test separate modules simultaneously as long as the abstract interfaces have been agreed upon.</li>
</ol>`,
    explanation: 'Abstraction, modularity, and separation of concerns work synergistically to break down monolithic complexity into cohesive, loosely coupled, and independently maintainable building blocks.',
    urdu_answer: 'ایبسٹریکشن، ماڈیولریٹی، اور سیپریشن آف کنسرنز باہمی طور پر مل کر پیچیدہ سسٹمز کو آسان بناتے ہیں: کنسرنز مسائل کو الگ کرتے ہیں، ماڈیولز انہیں الگ حصوں میں محفوظ کرتے ہیں، اور ایبسٹریکشن ان کے درمیان آسان رابطے کی سہولت فراہم کرتی ہے۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 11.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for CS504 Lecture 11.`);

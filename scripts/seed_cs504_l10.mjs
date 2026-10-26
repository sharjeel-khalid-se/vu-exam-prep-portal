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

// 2. Create or fetch Lecture 10
let lec10 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 10").get(cs504.id);
if (!lec10) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 10, 'User Interface Design, GUI Motivation & Prototyping Techniques')
  `).run(cs504.id);
  lec10 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 10 with ID: ${lec10.id}`);
} else {
  console.log(`CS504 Lecture 10 already exists with ID: ${lec10.id}`);
}

const lId = lec10.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 10.`);

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
    stem: 'A poorly designed interface can cause a user to make catastrophic errors is one of the motivations for GUI.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'One of the primary motivations for careful user interface design is that confusing interfaces cause operator fatigue and catastrophic mistakes (CS504 Handouts Page 62).',
    urdu_answer: 'ایک ناقص ڈیزائن شدہ انٹرفیس صارف سے سنگین یا تباہ کن غلطیاں کروا سکتا ہے، یہی GUI ڈیزائن کی بنیادی وجوہات میں سے ایک ہے۔'
  },
  {
    stem: 'Prototyping is used when there is __________ regarding requirements.',
    options: {
      a: 'Uncertainty',
      b: 'Confirmation',
      c: 'Conflict',
      d: 'Consensus'
    },
    correct: 'a',
    explanation: 'Prototyping is ideal when requirements are ambiguous, uncertain, or when users find it difficult to articulate their needs (CS504 Handouts Page 68).',
    urdu_answer: 'پروٹوٹائپنگ کا استعمال اس وقت کیا جاتا ہے جب ضروریات (Requirements) میں غیر یقینی صورتحال یا ابہام پایا جائے۔'
  },
  {
    stem: 'A prototype is not the real product. It is rather just a real looking __________ of what would be eventually delivered and might not do anything useful.',
    options: {
      a: 'Mock-up',
      b: 'Ad-hoc',
      c: 'Design',
      d: 'Structure'
    },
    correct: 'a',
    explanation: 'A prototype is essentially a mock-up that looks and feels like the real system but contains dummy logic or minimal functionality (CS504 Handouts Page 68).',
    urdu_answer: 'پروٹوٹائپ اصل پروڈکٹ نہیں ہوتا بلکہ صرف ایک اصلی جیسا دکھنے والا ماک اپ (Mock-up) ہوتا ہے۔'
  },
  {
    stem: 'Which of the following is NOT considered a valid benefit/statement regarding prototyping?',
    options: {
      a: 'Provide rapid feedback from the user to the designer',
      b: 'Help validate requirements with fewer errors',
      c: 'Enhance designer and user understanding of what system should accomplish',
      d: 'Prototyping is a technique that can be used to reduce customer satisfaction'
    },
    correct: 'd',
    explanation: 'Prototyping aims to reduce customer dissatisfaction and enhance overall client satisfaction; claiming it reduces customer satisfaction is false (CS504 Handouts Page 68).',
    urdu_answer: 'پروٹوٹائپنگ صارف کے عدم اطمینان کو کم کر کے اطمینان بڑھاتی ہے۔ یہ کہنا غلط ہے کہ یہ اطمینان کو کم کرتی ہے۔'
  },
  {
    stem: 'System users often judge a system by its __________ rather than its functionality.',
    options: {
      a: 'Interface',
      b: 'Performance',
      c: 'Code',
      d: 'Architecture'
    },
    correct: 'a',
    explanation: 'End users perceive and interact directly with the user interface, often equating good interface design with system success (CS504 Handouts Page 62).',
    urdu_answer: 'صارفین عام طور پر کسی سسٹم کی اندرونی کارکردگی کے بجائے اس کے انٹرفیس سے اس کا معیار جانچتے ہیں۔'
  },
  {
    stem: 'How to get vision of the product and get early feedback from user to ensure that the development team understands requirements?',
    options: {
      a: 'Using prototype',
      b: 'Using sequence diagram',
      c: 'Using Design Document',
      d: 'None of given'
    },
    correct: 'a',
    explanation: 'Developing a prototype provides tangible visualization and triggers rapid, constructive feedback from stakeholders (CS504 Handouts Page 68).',
    urdu_answer: 'پروڈکٹ کا ابتدائی تصور دیکھنے اور یوزر سے جلد فیڈ بیک حاصل کرنے کے لیے پروٹوٹائپ سب سے مؤثر طریقہ ہے۔'
  },
  {
    stem: 'Which of the following is a fact-finding method in requirement engineering?',
    options: {
      a: 'Site visits',
      b: 'Prototyping',
      c: 'Study of similar systems',
      d: 'All of given'
    },
    correct: 'd',
    explanation: 'Fact-finding methods include interviews, questionnaires, site visits, prototyping, and reviewing existing similar applications (CS504 Handouts Page 68).',
    urdu_answer: 'ضروریات اکٹھی کرنے کے حقائق تلاش کرنے والے طریقوں میں سائٹ وزٹ، پروٹوٹائپنگ اور ملتے جلتے سسٹمز کا مطالعہ سب شامل ہیں۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for CS504 Lecture 10.`);

// 3 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define the Motivation of GUI. / State three key motivations for User Interface Design.',
    correct: `<p><strong>Key Motivations for GUI & Interface Design (CS504 Handouts Page 62):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>User Perception of System Quality:</strong> System users frequently judge a software system by its interface rather than its internal algorithmic functionality. If the interface is clumsy, users perceive the entire software as low-quality.</li>
  <li><strong>Preventing Catastrophic Errors:</strong> A poorly structured interface causes user fatigue, disorientation, and catastrophic operational errors. A well-designed GUI guides the user intuitively and minimizes operational mistakes.</li>
  <li><strong>Cognitive Ease and Direct Manipulation:</strong> Graphical interfaces exploit human visual recognition rather than requiring users to memorize complex command syntax, drastically reducing training time and increasing productivity.</li>
</ol>`,
    explanation: 'Reference: CS504 Handouts (Lecture 10, Page 62).',
    urdu_answer: 'جی یو آئی (GUI) کی بنیادی وجوہات: یوزر سسٹم کے معیار کا اندازہ انٹرفیس سے لگاتا ہے، خراب انٹرفیس سے تباہ کن غلطیاں سرزد ہو سکتی ہیں، اور اچھا انٹرفیس یوزر کی کارکردگی اور آسانی کو بڑھاتا ہے۔'
  },
  {
    stem: 'What is a Prototype, and state at least two major reasons to choose Prototyping during requirement engineering?',
    correct: `<p><strong>Definition of Prototype:</strong> A prototype is an early, real-looking mock-up of what will eventually be delivered. It demonstrates system behavior and screen layouts without necessarily implementing underlying business logic or database services (CS504 Handouts Page 68).</p>
<p><strong>Reasons to Choose Prototyping:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Resolving Requirement Uncertainty:</strong> When users have unclear or ambiguous requirements, an interactive prototype gives them a concrete reference to clarify what they truly want.</li>
  <li><strong>Fast Feedback and Risk Reduction:</strong> It enables rapid user validation early in the software life cycle, drastically reducing the cost of changing requirements before coding begins.</li>
</ol>`,
    explanation: 'Reference: CS504 Handouts (Lecture 10, Page 68).',
    urdu_answer: 'پروٹوٹائپ اور اس کے انتخاب کی وجوہات: پروٹوٹائپ ایک ماک اپ ہوتا ہے۔ اس کا انتخاب غیر یقینی اور مبہم ضروریات کو واضح کرنے اور کلائنٹ سے جلد از جلد فیڈ بیک لینے کے لیے کیا جاتا ہے۔'
  },
  {
    stem: 'Enlist the pitfalls and concerns of incorporating GUIs and detailed screen sketches in the Functional Specifications (SRS).',
    correct: `<p><strong>Pitfalls of Including Detailed GUIs in SRS (CS504 Handouts Pages 63–65):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Shift from "What" to "How":</strong> The primary focus of requirement analysis is to define WHAT the system should accomplish. Adding UI sketches prematurely shifts developer and client focus into design (HOW it looks).</li>
  <li><strong>Fixation on Cosmetic Details:</strong> Clients and stakeholders often become distracted by superficial UI elements (colors, button shapes, fonts) and neglect critical functional requirements and business rules.</li>
  <li><strong>High Documentation Maintenance:</strong> User interfaces evolve frequently. Binding screen designs inside the SRS causes the specification to rapidly become obsolete unless continuously updated.</li>
</ol>`,
    explanation: 'Reference: CS504 Handouts (Lecture 10, Pages 63–65).',
    urdu_answer: 'ایس آر ایس (SRS) میں GUI شامل کرنے کے نقصانات: توجہ "کیا بنانا ہے" سے ہٹ کر "کیسے بنانا ہے" پر چلی جاتی ہے، کلائنٹ بنیادی فنکشنلٹی کے بجائے رنگوں اور بٹنز پر الجھ جاتا ہے، اور دستاویزات کو بار بار اپ ڈیٹ کرنا پڑتا ہے۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for CS504 Lecture 10.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `Adding user interface detail in the Software Requirements Specification (SRS) is controversial because focus shifts from "what" to "how" (analysis vs design). Do you agree? Discuss the pros and cons of incorporating GUI sketches in the SRS document.`,
    correct: `<p><strong>The Analysis vs. Design Debate:</strong></p>
<p>Yes, incorporating GUI details in the SRS is inherently controversial. Classical software engineering asserts that SRS should capture <em>WHAT</em> the system does (analysis), while user interface details represent <em>HOW</em> it is realized (design). However, in modern interactive systems, users cannot easily evaluate functionality without visual models.</p>
<p><strong>Pros of Incorporating GUI Sketches in SRS:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Bridge the Communication Gap:</strong> Non-technical clients and users find abstract technical requirement statements difficult to parse. Visual screen sketches provide an immediate, unambiguous common language.</li>
  <li><strong>Early Usability and Workflow Validation:</strong> Sketches verify whether task sequences, data entry flows, and screen transitions are intuitive before architecture and code are developed.</li>
  <li><strong>Uncovering Omitted Requirements:</strong> Looking at a visual layout prompts clients to identify missing data fields, search filters, and validation rules that they forgot during interview sessions.</li>
</ol>
<p><strong>Cons of Incorporating GUI Sketches in SRS:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Premature Design Commitment:</strong> Binding specific UI layouts into the formal contract restrains designers from implementing more efficient or modern UI paradigms later.</li>
  <li><strong>Distraction by Superficial Artifacts:</strong> Reviews risk devolving into debates over button colors, fonts, and cosmetic aesthetics rather than core system integrity and business rules.</li>
  <li><strong>Documentation Maintenance Burden:</strong> User interfaces change rapidly during user testing; keeping the SRS synchronized with every cosmetic adjustment creates heavy overhead.</li>
</ol>`,
    explanation: 'Reference: CS504 Handouts (Lecture 10, Pages 63–65).',
    urdu_answer: 'ایس آر ایس میں GUI شامل کرنے کے فائدے اور نقصانات: فائدے یہ ہیں کہ نان ٹیکنیکل کلائنٹ آسانی سے سمجھ جاتا ہے اور چھپی ہوئی ضروریات سامنے آتی ہیں۔ نقصانات یہ ہیں کہ ڈیزائن پہلے سے بندھ جاتا ہے اور کلائنٹ بنیادی منطق چھوڑ کر ظاہری چیزوں پر بحث شروع کر دیتا ہے۔'
  },
  {
    stem: `Explain Prototyping as a requirement engineering technique. How does prototyping help in handling ambiguous or uncertain requirements, and why is a prototype not considered the real product?`,
    correct: `<p><strong>1. Prototyping as a Requirement Engineering Technique:</strong></p>
<p>Prototyping is an iterative fact-finding and requirement elicitation process where developers construct an early, tangible representation (throwaway or evolutionary mock-up) of the proposed software system to validate and refine stakeholder needs (CS504 Handouts Page 68).</p>
<p><strong>2. Handling Ambiguous or Uncertain Requirements:</strong></p>
<ul>
  <li><strong>Interactive Clarification:</strong> When clients have only a vague idea of their system, interacting with a working prototype turns abstract ideas into concrete workflows, exposing misunderstandings early.</li>
  <li><strong>Rapid Experimentation:</strong> Alternative interface workflows can be rapidly tested with end users to discover which design maximizes operational speed and user satisfaction.</li>
  <li><strong>Technical Feasibility Assessment:</strong> It enables developers to verify whether complex interactive features can perform effectively within given architectural constraints.</li>
</ul>
<p><strong>3. Why a Prototype is NOT the Real Product:</strong></p>
<ul>
  <li><strong>Lacks Non-Functional Robustness:</strong> Prototypes are built for demonstration and omit critical production requirements such as security encryption, database indexing, concurrency handling, and exception management.</li>
  <li><strong>Superficial Implementation:</strong> Prototypes often use hardcoded dummy data and superficial scripts. Misinterpreting a prototype as a finished product leads to catastrophic system failures when exposed to real-world volume.</li>
</ul>`,
    explanation: 'Reference: CS504 Handouts (Lecture 10, Page 68).',
    urdu_answer: 'پروٹوٹائپنگ کی اہمیت اور حقیقت: پروٹوٹائپنگ غیر یقینی ضروریات کو واضح کرتی ہے کیونکہ یوزر دیکھ کر بہتر فیڈ بیک دیتا ہے۔ یہ اصل پروڈکٹ اس لیے نہیں ہوتا کیونکہ اس میں سیکیورٹی، ڈیٹا بیس اور ایرر ہینڈلنگ جیسی اہم چیزیں نہیں ہوتیں بلکہ یہ صرف ڈمی ماڈل ہوتا ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for CS504 Lecture 10.`);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for CS504 Lecture 10 in local DB: ${total.c}`);

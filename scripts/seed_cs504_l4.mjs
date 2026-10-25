import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Find CS504
const cs504 = db.prepare(`SELECT id FROM subjects WHERE slug = 'cs504'`).get();
if (!cs504) {
  console.error('CS504 subject not found!');
  process.exit(1);
}

// Check or create Lecture 4
let l4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(cs504.id);
if (!l4) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 4, 'Requirement Engineering - II: Specification, Characteristics & Stakeholders')
  `).run(cs504.id);
  l4 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 4 with ID: ${l4.id}`);
} else {
  console.log(`CS504 Lecture 4 already exists with ID: ${l4.id}`);
}

const lId = l4.id;

// Delete existing questions for this lecture to ensure fresh idempotent seed
const del = db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(lId);
console.log(`Cleaned up ${del.changes} old questions for Lecture 4.`);

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

// 10 MCQs
const mcqs = [
  {
    stem: 'The two main documents produced during this phase are Requirement Statement and Requirement Specification. They are also called Requirement Definition and ____________.',
    options: {
      a: 'Functional Specification',
      b: 'Mathematical specification',
      c: 'System Specification',
      d: 'None of the given'
    },
    correct: 'a',
    explanation: 'According to CS504 handouts (page 25), the two primary documents produced in requirement engineering are Requirement Statement (also called Requirement Definition) and Requirement Specification (also called Functional Specification).',
    urdu_answer: 'اس فیز میں تیار کردہ دو اہم دستاویزات Requirement Statement (یا Requirement Definition) اور Requirement Specification (یا Functional Specification) کہلاتی ہیں۔'
  },
  {
    stem: 'Following all are the Requirements statement Characteristics except the:',
    options: {
      a: 'Correct',
      b: 'Verifiable',
      c: 'Prioritized',
      d: 'Polite'
    },
    correct: 'd',
    explanation: 'A well-formed Requirement Statement document must be Complete, Correct, Feasible, Necessary, Prioritized, Unambiguous, and Verifiable. "Polite" is not a technical engineering characteristic.',
    urdu_answer: 'ایک معیاری ریکوائرمنٹ سٹیٹمنٹ کے خصائص میں Correct, Verifiable اور Prioritized شامل ہیں، جبکہ Polite کوئی تکنیکی خصوصیت نہیں ہے۔'
  },
  {
    stem: 'A SRS (Software Requirements Specification) is said to be __________ if and only if, every requirement stated therein has only one interpretation.',
    options: {
      a: 'Compact',
      b: 'Unambiguous',
      c: 'Consistent',
      d: 'Detailed'
    },
    correct: 'b',
    explanation: 'An SRS is unambiguous if and only if every requirement stated has only one single, clear interpretation by all stakeholders and engineers (Handout page 26).',
    urdu_answer: 'ایک سافٹ ویئر ریکوائرمنٹس سپیسیفیکیشن (SRS) اس وقت Unambiguous کہلاتی ہے جب اس میں بیان کردہ ہر شرط کا صرف اور صرف ایک ہی واضح مطلب نکلتا ہو۔'
  },
  {
    stem: 'Which of the following property does not correspond to a good Software Requirements Specification (SRS)?',
    options: {
      a: 'Verifiable',
      b: 'Ambiguous',
      c: 'Complete',
      d: 'Traceable'
    },
    correct: 'b',
    explanation: 'A good SRS must be unambiguous, complete, consistent, verifiable, modifiable, and traceable. Ambiguity is a defect, not a desirable property.',
    urdu_answer: 'ایک اچھے SRS کی مطلوبہ خوبیوں میں Verifiable, Complete اور Traceable ہونا شامل ہے۔ Ambiguous (مبہم ہونا) ایک خامی ہے، خوبی نہیں۔'
  },
  {
    stem: 'All are the typical non-functional requirements except the:',
    options: {
      a: 'Reliability',
      b: 'Feasible',
      c: 'Availability',
      d: 'Scalability'
    },
    correct: 'b',
    explanation: 'Reliability, Availability, and Scalability are typical Non-Functional Requirements (quality attributes). "Feasible" is an attribute of a requirement statement, not a non-functional requirement.',
    urdu_answer: 'Reliability, Availability اور Scalability نان فنکشنل ریکوائرمنٹس (کوالٹی اوصاف) ہیں، جبکہ Feasible ہونا ریکوائرمنٹ سٹیٹمنٹ کی ایک خاصیت ہے۔'
  },
  {
    stem: 'Which is one of the most important stakeholders from the following?',
    options: {
      a: 'Entry level personnel',
      b: 'Middle level stakeholder',
      c: 'Managers',
      d: 'Users of the software'
    },
    correct: 'd',
    explanation: 'End users of the software are the most vital stakeholders because they directly interact with the system. Handout page 24 explicitly notes that ignoring end-users leads to project failure.',
    urdu_answer: 'سافٹ ویئر کے اصل صارفین (Users of the software) سب سے اہم اسٹیک ہولڈرز ہیں، ان کو نظر انداز کرنے سے پراجیکٹ لازماً ناکام ہو جاتا ہے۔'
  },
  {
    stem: 'What is the most crucial non-functional requirement of a system to control radiation dosages that are emitted as treatment for cancer?',
    options: {
      a: 'Security',
      b: 'Reliability',
      c: 'Usability',
      d: 'Accuracy'
    },
    correct: 'd',
    explanation: 'For safety-critical medical systems like cancer radiation therapy, Accuracy in dosage measurement and beam delivery is the most vital non-functional requirement, as minor deviations can cause fatal injuries.',
    urdu_answer: 'کینسر ریڈی ایشن تھراپی کے نظام میں تابکاری کی مقدار کا سب سے نازک اور اہم غیر فنکشنل معیار Accuracy (درستگی) ہے کیونکہ ذرا سی غلطی بھی مریض کے لیے جان لیوا ہو سکتی ہے۔'
  },
  {
    stem: 'What is the most important software quality of a web-based transaction system?',
    options: {
      a: 'Efficiency',
      b: 'Modularity',
      c: 'Usability',
      d: 'Security'
    },
    correct: 'c',
    explanation: 'According to CS504 course handouts and past papers, Usability (ease of use and intuitive interface) is considered the most crucial software quality determining the success of web-based transaction systems for general end-users.',
    urdu_answer: 'CS504 کے نصاب کے مطابق عام پبلک کے لیے ویب پر مبنی ٹرانزیکشن سسٹمز کی کامیابی میں سب سے اہم سافٹ ویئر کوالٹی Usability (استعمال میں آسانی) ہے۔'
  },
  {
    stem: '__________ requirements cause frequent modifications in user interface.',
    options: {
      a: 'Functional',
      b: 'Non-functional',
      c: 'User',
      d: 'Domain'
    },
    correct: 'c',
    explanation: 'User requirements reflect direct end-user interaction workflows, ergonomic preferences, and daily operational habits, making them the primary cause of frequent modifications in the user interface (UI).',
    urdu_answer: 'User requirements براہ راست صارف کی روزمرہ عادات اور ترجیحات سے متعلق ہوتی ہیں، اسی لیے یہ یوزر انٹرفیس (UI) میں بار بار ترامیم کا سبب بنتی ہیں۔'
  },
  {
    stem: '__________ requirements are often called product features.',
    options: {
      a: 'Functional',
      b: 'Business',
      c: 'User',
      d: 'Non-functional'
    },
    correct: 'a',
    explanation: 'Functional requirements describe the specific operations, services, and transformations provided by the system, and are commonly referred to as product features.',
    urdu_answer: 'فنکشنل ریکوائرمنٹس (Functional requirements) سسٹم کی مخصوص خدمات اور افعال کو بیان کرتی ہیں اور عام بول چال میں انہیں پروڈکٹ فیچرز (Product features) کہا جاتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs.`);

// 3 Short Questions
const shorts = [
  {
    stem: 'Differentiate between Functional and Non-Functional Requirements with one example each.',
    correct: `1. Functional Requirements:
• Definition: Specify the specific operational capabilities, services, data manipulations, and algorithmic transformations that the software system must perform ("WHAT the system does").
• Often called: Product features.
• Example: "The online portal shall allow students to generate and download their semester fee challan in PDF format upon course registration."

2. Non-Functional Requirements:
• Definition: Specify the behavioral properties, operational qualities, environmental constraints, and performance benchmarks under which the functional services must execute ("HOW WELL the system performs").
• Examples of Quality Attributes: Performance, Reliability, Availability, Scalability, Security, and Usability.
• Example: "The PDF fee challan generation shall execute within 2 seconds under a concurrent workload of 10,000 active students with 99.9% system availability."`,
    explanation: 'Functional requirements define what services the system must perform; Non-functional requirements define quality constraints and performance benchmarks.',
    urdu_answer: 'فنکشنل ریکوائرمنٹس سسٹم کے افعال اور خدمات کو بیان کرتی ہیں (جیسے طالب علم کا فیس چالان بنانا)۔ نان فنکشنل ریکوائرمنٹس معیار، رفتار اور سیکیورٹی کو بیان کرتی ہیں (جیسے چالان 2 سیکنڈ کے اندر 10 ہزار طلبہ کے بیک وقت دباؤ میں بننا)۔'
  },
  {
    stem: 'List down four characteristics of a good Requirement Statement document.',
    correct: `A high-quality Requirement Statement (Requirement Definition) document must exhibit the following four essential characteristics:

1. Complete:
• All critical business functions, operational constraints, input validations, and error conditions must be fully articulated without missing information or "TBD" (To Be Determined) placeholders.

2. Correct:
• Every requirement statement must accurately represent genuine business and user needs confirmed and approved by real stakeholders.

3. Feasible:
• Each stated requirement must be realistically buildable and achievable within the allocated development budget, timeline, available technical tools, and human expertise.

4. Verifiable (Testable):
• Every requirement must be specified in clear, objective terms such that an unambiguous, cost-effective manual or automated acceptance test can be designed to prove compliance.

(Other valid key characteristics include: Unambiguous, Necessary, and Prioritized).`,
    explanation: 'A good Requirement Statement must be Complete, Correct, Feasible, and Verifiable.',
    urdu_answer: 'ایک معیاری ریکوائرمنٹ سٹیٹمنٹ کی چار بنیادی خصوصیات: (1) Complete: تمام ضروری افعال اور شرائط مکمل طور پر درج ہوں؛ (2) Correct: تمام بیانات حقیقت پر مبنی اور کلائنٹ سے تصدیق شدہ ہوں؛ (3) Feasible: دی گئی تکنیکی صلاحیت اور بجٹ میں قابل عمل ہو؛ (4) Verifiable: ایسی واضح ہو کہ اس کا باقاعدہ ٹیسٹ لے کر تصدیق کی جا سکے۔'
  },
  {
    stem: 'Who are Stakeholders in software engineering? Why is identifying all classes of stakeholders important for project success?',
    correct: `1. Definition of Stakeholders:
A Stakeholder in software engineering is any individual, group, or organization who has a direct or indirect stake, investment, interest, or influence in the software project or who will be affected by its development, deployment, or operation.
• Major Stakeholder Classes: Direct end-users, business managers, project sponsors/investors, software architects/engineers, system administrators, and regulatory compliance authorities.

2. Importance of Identifying All Stakeholder Classes:
• Diverse & Conflicting Viewpoints: Different stakeholder groups have contrasting priorities (e.g., users prioritize usability and speed; managers prioritize cost and schedule; security officers prioritize strict compliance). Identifying all groups enables negotiation and balanced requirements.
• Preventing Project Failure: Handouts emphasize that actual end-users are the most critical stakeholders. If end-users are ignored during elicitation, the system will likely fail user adoption and face ultimate project cancellation.
• Scope Completeness: Unidentified stakeholders inevitably surface late in the development cycle, introducing disruptive change requests, scope creep, and severe budget overruns.`,
    explanation: 'Stakeholders are all individuals affected by the software; identifying all classes prevents late surprises, balances conflicting goals, and ensures adoption.',
    urdu_answer: 'اسٹیک ہولڈر سے مراد وہ تمام افراد یا تنظیمیں ہیں جن کا سسٹم سے براہ راست یا بالواسطہ تعلق یا مفاد ہو (جیسے صارفین، مینیجرز، انجینئرز)۔ تمام اقسام کی بروقت شناخت اس لیے ضروری ہے تاکہ متضاد ضروریات میں توازن قائم کیا جا سکے اور اہم طبقات (خصوصاً اصل صارفین) کو نظر انداز کر کے پراجیکٹ کی ناکامی سے بچا جا سکے۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions.`);

// 2 Long Questions
const longs = [
  {
    stem: 'Explain the four different levels/types of requirements (Business Requirements, User Requirements, Functional Requirements, and Non-Functional Requirements) with a suitable example (such as a word processor or spell checker).',
    correct: `Requirements in modern software engineering are structured across four fundamental levels of abstraction:

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
    explanation: 'The four levels of requirements are: Business (corporate goals), User (user tasks), Functional (system features/services), and Non-Functional (quality/performance constraints).',
    urdu_answer: 'ریکوائرمنٹس کے 4 درجات: (1) Business Requirements: تنظیمی و کاروباری مقاصد (جیسے ایڈیٹنگ کا وقت 40 فیصد کم کر کے مارکیٹ لیڈر بننا)؛ (2) User Requirements: صارف کے مقاصد (مصنف کا غلط الفاظ کی نشاندہی اور درستگی چاہنا)؛ (3) Functional Requirements: سسٹم کے افعال اور فیچرز (ڈکشنری سے موازنہ کر کے لال لکیر کھینچنا اور 5 تجاویز دکھانا)؛ (4) Non-Functional Requirements: معیار اور کارکردگی (2000 الفاظ فی سیکنڈ اسکین کرنا اور 30MB سے کم ریم استعمال کرنا)۔'
  },
  {
    stem: 'Compare Requirement Statement (Requirement Definition) and Requirement Specification (Functional Specification) documents. Detail the key characteristics required for a quality Requirement Statement.',
    correct: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    explanation: 'Requirement Statement is the client-facing natural language definition; Requirement Specification is the engineer-facing detailed technical blueprint. Key qualities include completeness, correctness, feasibility, and verifiability.',
    urdu_answer: '(1) موازنہ: Requirement Definition کلائنٹ اور صارف کے لیے عام فہم زبان میں لکھی جانے والی بنیادی دستاویز ہے جس میں کاروباری مسائل اور ضروریات بیان ہوتی ہیں۔ Requirement Specification (SRS) تکنیکی دستاویز ہے جو پروگرامرز اور ٹیسٹرز کے لیے سسٹم کے تمام تکنیکی ان پٹ، آؤٹ پٹ اور اندرونی لاجک کی تفصیلی رہنمائی کرتی ہے۔ (2) معیاری ریکوائرمنٹ سٹیٹمنٹ کے اوصاف: Complete (مکمل)، Correct (درست)، Feasible (قابل عمل)، Necessary (ضروری)، Prioritized (ترجیحی)، Unambiguous (غیر مبہم)، اور Verifiable (قابل تصدیق)۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions.`);

const total = db.prepare(`SELECT count(*) as cnt FROM questions WHERE lecture_id = ?`).get(lId);
console.log(`Successfully verified! Total questions in CS504 Lecture 4: ${total.cnt}`);

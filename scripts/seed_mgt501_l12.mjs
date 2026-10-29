import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate MGT501
const mgt501 = db.prepare("SELECT id FROM subjects WHERE slug = 'mgt501'").get();
if (!mgt501) {
  console.error('MGT501 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(mgt501.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Job Description & Job Specification: Components, Writing Guidelines & Standards')
  `).run(mgt501.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created MGT501 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`MGT501 Lecture 12 already exists with ID: ${lec12.id}`);
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
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'lecture')
`);

const insLong = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// 10 MCQs
const mcqs = [
  {
    stem: 'Which section of a job description contains the job title, FLSA status, date, job location, and title of the immediate supervisor?',
    options: {
      a: 'Job summary',
      b: 'Job identification',
      c: 'Job duties',
      d: 'Job specification'
    },
    correct: 'b',
    explanation: 'The Job Identification section contains key administrative metadata: official job title, department, job code, FLSA status, date of preparation, and immediate supervisor title (MGT501 Lesson 12).',
    urdu_answer: 'جاب آئیڈینٹیفکیشن (Job identification) میں ملازمت کا عنوان، ڈیپارٹمنٹ، کوڈ، تاریخ اور نگران افسر کی تفصیلات درج ہوتی ہیں۔'
  },
  {
    stem: '"Describe the general nature of the job, and includes only its major functions or activities." This section of a job description represents which of the following?',
    options: {
      a: 'Job identification',
      b: 'Job summary',
      c: 'Job duties & responsibilities',
      d: 'Job specification'
    },
    correct: 'b',
    explanation: 'The Job Summary encapsulates the core purpose and broad primary functions of the role in a few concise sentences (MGT501 Lesson 12).',
    urdu_answer: 'جاب سمری (Job summary) ملازمت کی عمومی نوعیت اور اس کے چند بڑے افعال کا مختصر لیکن جامع خلاصہ بیان کرتی ہے۔'
  },
  {
    stem: 'For the job of material manager, a document states: "The material manager purchases economically, regulates deliveries of store, and distributes all necessary material on production line." This statement represents:',
    options: {
      a: 'Job identification',
      b: 'Job summary',
      c: 'Job specification',
      d: 'Standards of performance'
    },
    correct: 'b',
    explanation: 'This statement describes the broad nature and key functions of the material manager position, which is the definition and textbook example of a Job Summary (MGT501 Lesson 12).',
    urdu_answer: 'یہ بیان مٹیریل مینیجر کی مجموعی ذمہ داریوں کا ایک خلاصہ پیش کرتا ہے، جو کہ جاب سمری (Job summary) کی واضح مثال ہے۔'
  },
  {
    stem: 'Which section of a job description describes the supervisor’s expectations for the quality and quantity of work to be produced by the incumbent?',
    options: {
      a: 'Authority of incumbent',
      b: 'Standards of performance',
      c: 'Working conditions',
      d: 'Job specification'
    },
    correct: 'b',
    explanation: 'Standards of Performance state the explicit qualitative and quantitative criteria against which an employee output is evaluated by management.',
    urdu_answer: 'سٹینڈرڈز آف پرفارمنس (Standards of performance) میں کام کے معیار اور مقدار کے حوالے سے سپروائزر کی توقعات اور پیمانے درج ہوتے ہیں۔'
  },
  {
    stem: 'Which of the following is NOT typically a part of a Job Specification?',
    options: {
      a: "Employee's educational background",
      b: "Employee's work experience",
      c: "Employee's physical abilities and skills",
      d: "Employee's specific daily job duties"
    },
    correct: 'd',
    explanation: 'Daily job duties belong in the Job Description (job-oriented), whereas the Job Specification focuses exclusively on person-oriented qualifications.',
    urdu_answer: 'روزمرہ کے فرائض (Job duties) جاب ڈسکرپشن کا حصہ ہوتے ہیں، جاب اسپیسیفیکیشن کا نہیں۔'
  },
  {
    stem: 'Which statement is most accurate regarding the format of Job Descriptions and Job Specifications?',
    options: {
      a: 'Job specification is always a separate document.',
      b: 'Job description and job specification are always on the same document.',
      c: 'Job specification may be either a separate document or included on the same document as the job description.',
      d: 'Job specification is legally required to be formatted separately.'
    },
    correct: 'c',
    explanation: 'In organizational practice, the Job Specification may be presented as the concluding section of the Job Description document or drafted as an independent standalone form.',
    urdu_answer: 'جاب اسپیسیفیکیشن یا تو جاب ڈسکرپشن کے ساتھ ہی اسی صفحے کے آخر میں شامل ہو سکتی ہے یا پھر الگ دستاویز کے طور پر بنائی جا سکتی ہے۔'
  },
  {
    stem: 'Under which section of the job description are machine operation safety guidelines, noise levels, and environmental hazards described?',
    options: {
      a: 'Job summary',
      b: 'Standards of performance',
      c: 'Working conditions',
      d: 'Job identification'
    },
    correct: 'c',
    explanation: 'Working conditions detail the physical environment, temperature extremes, noise levels, hazardous machinery, protective equipment, and ergonomic factors.',
    urdu_answer: 'ورکنگ کنڈیشنز (Working conditions) میں کام کی جگہ کا ماحول، شور کی سطح، مشینری کی حفاظت اور خطرات بیان کیے جاتے ہیں۔'
  },
  {
    stem: "Which section defines the limits of the jobholder's decision-making power and direct reports?",
    options: {
      a: 'Authority of incumbent',
      b: 'Job summary',
      c: 'Job identification',
      d: 'Standards of performance'
    },
    correct: 'a',
    explanation: 'Authority of incumbent establishes decision boundaries, spending limits, disciplinary powers, and approval authorities granted to the role.',
    urdu_answer: 'اتھارٹی آف انکمبنٹ (Authority of incumbent) میں ملازم کے فیصلے کرنے کے اختیارات اور حدود کا تعین کیا جاتا ہے۔'
  },
  {
    stem: 'Items typically included in a Job Specification are:',
    options: {
      a: 'Educational requirements',
      b: 'Experience and specialized training',
      c: 'Physical capacities and personality traits',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: 'Job specifications encompass education, prior work experience, technical certifications, analytical abilities, and physical or interpersonal traits.',
    urdu_answer: 'جاب اسپیسیفیکیشن میں تعلیمی ضروریات، تجربہ، تربیت، جسمانی صلاحیتیں اور ذاتی اوصاف سب شامل ہوتے ہیں۔'
  },
  {
    stem: "Which component of a job description defines the jobholder's reporting relationships (whom the employee reports to and who reports to the employee)?",
    options: {
      a: 'Job summary',
      b: 'Relationships / Job duties',
      c: 'Job identification',
      d: 'Job specification'
    },
    correct: 'b',
    explanation: 'The Relationships section maps the reporting lines: who the incumbent reports to, who reports to the incumbent, and internal/external contacts.',
    urdu_answer: 'ریلیشن شپس (Relationships) کا سیکشن ملازم کے تنظیمی تعلقات اور رپورٹنگ لائنز (نگران اور ماتحت) کو واضح کرتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for MGT501 Lecture 12.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'List the main sections and components included in a well-designed Job Description document.',
    correct: `<p><strong>Main Components of a Job Description (MGT501 Lesson 12):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Job Identification:</strong> Job title, department, job code, FLSA status, date, location, and reporting supervisor.</li>
  <li><strong>Job Summary:</strong> A concise 2–3 sentence overview summarizing the general nature and primary purpose of the role.</li>
  <li><strong>Relationships:</strong> Vertical reporting lines (whom the employee reports to and who reports to them) and lateral cross-functional contacts.</li>
  <li><strong>Responsibilities and Duties:</strong> A detailed list of major functional areas, specific daily/periodic tasks, and expected deliverables.</li>
  <li><strong>Authority of Incumbent:</strong> Limits of decision-making power, purchasing approval thresholds, and disciplinary authority.</li>
  <li><strong>Standards of Performance:</strong> Qualitative and quantitative benchmarks expected by management.</li>
  <li><strong>Working Conditions:</strong> Physical environment, hazards, noise, temperature, and required safety gear.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Pages 68–69 / Page 182).',
    urdu_answer: 'جاب ڈسکرپشن کے اہم حصے: جاب آئیڈینٹیفکیشن، جاب سمری، رپورٹنگ تعلقات، فرائض و ذمہ داریاں، ملازم کے اختیارات (Authority)، کارکردگی کے معیارات، اور کام کی ماحولیاتی شرائط۔'
  },
  {
    stem: 'Differentiate between Job Identification and Job Summary in a Job Description.',
    correct: `<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Dimension</th>
      <th class="p-2 border">Job Identification</th>
      <th class="p-2 border">Job Summary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Purpose</td>
      <td class="p-2 border">Provides administrative tracking, cataloging, and organizational positioning data.</td>
      <td class="p-2 border">Provides a brief narrative of the job's core purpose and principal functions.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Contents</td>
      <td class="p-2 border">Job title, job grade/code, department, geographic location, FLSA wage status, preparation date, supervisor title.</td>
      <td class="p-2 border">2 to 4 sentences summarizing "what the worker does, how, and why" in plain, overarching language.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Example</td>
      <td class="p-2 border"><em>Title: Senior HR Generalist, Dept: People Ops, Reports To: HR Director.</em></td>
      <td class="p-2 border"><em>"Manages full-cycle recruitment, designs employee onboarding, and administers internal benefits."</em></td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Page 68, Key Terms Page 71).',
    urdu_answer: 'جاب آئیڈینٹیفکیشن میں انتظامی ڈیٹا (عہدہ، شعبہ، گریڈ، کوڈ) ہوتا ہے، جبکہ جاب سمری میں اس عہدے کے کام اور مقصد کا مختصر تعارف اور خلاصہ لکھا جاتا ہے۔'
  },
  {
    stem: 'What essential items and information should be included in a comprehensive Job Specification?',
    correct: `<p><strong>Core Elements of a Job Specification (MGT501 Lesson 12):</strong></p>
<ul>
  <li><strong>Educational Qualifications:</strong> Minimum formal degrees, certifications, or licenses required (e.g., MBA in HRM, PMP certification).</li>
  <li><strong>Work Experience:</strong> Length, level, and specific type of prior industry experience (e.g., 3–5 years in corporate payroll).</li>
  <li><strong>Technical & Functional Skills:</strong> Mastery of specialized software, machinery, statistical techniques, or languages (e.g., SAP, Python, fluency in English).</li>
  <li><strong>Cognitive & Interpersonal Competencies:</strong> Critical thinking, emotional intelligence, negotiation, and leadership traits.</li>
  <li><strong>Physical Demands & Sensory Capacities:</strong> Lifting limits (e.g., lift up to 25 kg), standing duration, visual acuity, and stamina.</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Page 69).',
    urdu_answer: 'جاب اسپیسیفیکیشن کے اہم اجزاء: تعلیمی قابلیت، متعلقہ شعبے کا تجربہ، تکنیکی اور پیشہ ورانہ مہارتیں، بات چیت اور قائدانہ صلاحیتیں، اور جسمانی صحت و قوت کی شرائط۔'
  },
  {
    stem: 'Explain what is meant by "Standards of Performance" and "Authority of Incumbent" in a Job Description.',
    correct: `<p><strong>1. Standards of Performance:</strong> Specific, measurable criteria and expectations established by management regarding the quality and quantity of work that an employee must deliver (e.g., "Resolve 95% of customer billing inquiries within 24 hours with zero unresolved compliance errors"). It serves as the baseline for performance appraisals.</p>
<p><strong>2. Authority of Incumbent:</strong> The defined boundary of decision-making power and administrative freedom granted to the employee (e.g., "Authorized to approve departmental requisitions up to Rs. 100,000, grant emergency sick leaves up to 3 days, and sign off on inventory counts").</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Page 69).',
    urdu_answer: 'سٹینڈرڈز آف پرفارمنس کا مطلب کام کی مقدار اور معیار کے وہ پیمانے ہیں جن پر ملازم کی کارکردگی جانچی جاتی ہے، جبکہ اتھارٹی آف انکمبنٹ ملازم کے مالی، انتظامی اور فیصلے کرنے کے اختیارات کی حد کو کہتے ہیں۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for MGT501 Lecture 12.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `Explain in detail the various sections that construct a comprehensive Job Description document. Describe what information is recorded under Job Identification, Job Summary, Relationships/Duties, Authority, Standards of Performance, Working Conditions, and Job Specifications.`,
    correct: `<p><strong>Comprehensive Anatomy of a Job Description Document (MGT501 Lesson 12):</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Job Identification:</strong> Recorded at the top of the form. Contains official job title, department, wage category (exempt/non-exempt under labor laws), date of last review, job code, salary grade, and supervisor title.</li>
  <li><strong>Job Summary:</strong> A concise paragraph describing the essence of the job. Outlines why the job exists and its primary strategic functions without delving into minutiae.</li>
  <li><strong>Relationships:</strong> Explicitly maps the organizational hierarchy: direct reporting manager, subordinates supervised, and regular internal/external liaison contacts (e.g., suppliers, clients, auditors).</li>
  <li><strong>Responsibilities & Duties:</strong> The core body of the document. Lists major functional areas (often prioritized by percentage of working time) followed by precise, action-oriented task statements beginning with active verbs.</li>
  <li><strong>Authority of Incumbent:</strong> Clarifies exact decision-making autonomy: expenditure limits, hiring/disciplinary input, and policy exception permissions.</li>
  <li><strong>Standards of Performance:</strong> Objective benchmarks defining what constitutes successful completion of each duty, providing transparent targets for periodic appraisals.</li>
  <li><strong>Working Conditions:</strong> Documents environmental factors: office vs. factory floor, noise, extreme temperatures, toxic fumes, night shift requirements, and necessary personal protective equipment (PPE).</li>
  <li><strong>Job Specifications:</strong> May be appended to conclude the document, specifying the education, credentials, experience, and competencies required of the candidate.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Pages 68–69 / Page 182).',
    urdu_answer: 'ایک مکمل جاب ڈسکرپشن دستاویز میں جاب آئیڈینٹیفکیشن (انتظامی ڈیٹا)، جاب سمری (خلاصہ)، تعلقات (رپورٹنگ لائنز)، ڈیوٹیز و ٹاسکس (مکمل کام)، اختیارات کی حدود (Authority)، پرفارمنس کے معیارات، کام کا ماحول (Working conditions)، اور ضروری اہلیت (Job specification) شامل ہوتے ہیں۔'
  },
  {
    stem: `Suppose you are an HR manager tasked with drafting a Job Description and Job Specification for a newly created post in your organization. Outline the essential guidelines and practical steps you will follow to ensure both documents are accurate, clear, and legally compliant.`,
    correct: `<p><strong>Practical Guidelines for Drafting Accurate and Legally Defensible Job Documents:</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Conduct Thorough Ground-Level Job Analysis:</strong> Never invent duties from imagination. Use structured interviews, observational walk-throughs, and supervisor questionnaires to capture the real workflow.</li>
  <li><strong>Use Clear, Action-Oriented Language:</strong> Start every duty statement with an unambiguous active verb in the present tense (e.g., <em>"Conducts," "Audits," "Inspects," "Reconciles"</em>). Avoid vague phrases like <em>"Handles accounts"</em> or <em>"Deals with paperwork."</em></li>
  <li><strong>Define Scope and Frequency:</strong> Quantify the proportion of working time allocated to each major functional area (e.g., 40% financial auditing, 30% client tax advisory, 30% team supervision) to distinguish essential functions from marginal duties.</li>
  <li><strong>Ensure Legal and Non-Discriminatory Compliance:</strong> Ensure job specifications list only <strong>Bona Fide Occupational Qualifications (BFOQs)</strong>. Avoid artificial barriers: do not demand a Master's degree if a Bachelor's is sufficient, and avoid discriminatory age, gender, or non-essential physical demands.</li>
  <li><strong>Differentiate Essential Functions from Marginal Tasks:</strong> Clearly separate core, indispensable duties from occasional secondary tasks, ensuring compliance with equal opportunity and disability accommodations.</li>
  <li><strong>Review and Validate with Stakeholders:</strong> Circulate the initial draft among functional managers and experienced technical leads to verify that reporting relationships, safety requirements, and performance expectations are practical and realistic.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 12/14, Pages 68–70).',
    urdu_answer: 'نئی نوکری کی جاب ڈسکرپشن بنانے کے لیے ایچ آر مینیجر کو چاہیے کہ: اصل جاب اینالیسس ڈیٹا استعمال کرے، ایکشن وربز (جیسے تیار کرتا ہے، جانچتا ہے) لکھے، ہر کام کا وقت فیصد میں بتائے، غیر ضروری یا امتیازی شرائط سے گریز کرے (قانونی پاسداری)، اور متعلقہ سپروائزر سے حتمی منظوری لے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for MGT501 Lecture 12.`);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for MGT501 Lecture 12 in local DB: ${total.c}`);

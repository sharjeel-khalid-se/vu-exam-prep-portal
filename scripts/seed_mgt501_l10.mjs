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

// 2. Create or fetch Lecture 10
let lec10 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 10").get(mgt501.id);
if (!lec10) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 10, 'Job Analysis: Concepts, Building Blocks, Terminology & HR Applications')
  `).run(mgt501.id);
  lec10 = { id: res.lastInsertRowid };
  console.log(`Created MGT501 Lecture 10 with ID: ${lec10.id}`);
} else {
  console.log(`MGT501 Lecture 10 already exists with ID: ${lec10.id}`);
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

// 15 MCQs
const mcqs = [
  {
    stem: 'The thorough & detailed systematic process of collecting and making judgments about all important information regarding jobs within an organization is termed as:',
    options: {
      a: 'Job analysis',
      b: 'Job description',
      c: 'Job specification',
      d: 'Job evaluation'
    },
    correct: 'a',
    explanation: 'Job analysis is the systematic process of gathering, documenting, and analyzing information about the duties, responsibilities, necessary skills, outcomes, and work environment of a particular job (MGT501 Lesson 10).',
    urdu_answer: 'کسی ادارے کے اندر ملازمتوں کے بارے میں تمام اہم معلومات اکٹھی کرنے اور ان کا منظم تجزیہ کرنے کے عمل کو جاب اینالیسس (Job analysis) کہتے ہیں۔'
  },
  {
    stem: "Job analysis is performed to define: / 'Job description' and 'Job specification' are formed from the information gathered from:",
    options: {
      a: 'Job description & job specification',
      b: 'Job specification & job position',
      c: 'Organizational rules & policies',
      d: 'Job description & job duties'
    },
    correct: 'a',
    explanation: 'The two primary tangible outputs derived directly from the job analysis process are the Job Description and the Job Specification (MGT501 Lesson 10).',
    urdu_answer: 'جاب اینالیسس کے عمل سے بنیادی طور پر دو دستاویزات جاب ڈسکرپشن اور جاب اسپیسیفیکیشن تیار کی جاتی ہیں۔'
  },
  {
    stem: 'An identifiable work activity composed of motion is called:',
    options: {
      a: 'Task',
      b: 'Job',
      c: 'Duty',
      d: 'Position'
    },
    correct: 'a',
    explanation: 'A task is a distinct, identifiable work activity composed of specific motions directed towards an immediate objective (MGT501 Lesson 10).',
    urdu_answer: 'ایک مخصوص اور قابل شناخت کام کی سرگرمی جو حرکات و سکنات پر مشتمل ہو، اسے ٹاسک (Task) کہتے ہیں۔'
  },
  {
    stem: 'Which of the following is an obligation to perform certain tasks/activities?',
    options: {
      a: 'Element',
      b: 'Responsibility',
      c: 'Position',
      d: 'Work'
    },
    correct: 'b',
    explanation: 'Responsibility is an obligation that an employee assumes to perform specific tasks or duties satisfactorily.',
    urdu_answer: 'کسی ملازم پر تفویض کردہ کاموں یا فرائض کو بخوبی سرانجام دینے کی قانونی یا اخلاقی پابندی کو ذمہ داری (Responsibility) کہتے ہیں۔'
  },
  {
    stem: 'The set of tasks & duties assigned to a particular person is said to be his/her:',
    options: {
      a: 'Position',
      b: 'Duty',
      c: 'Responsibility',
      d: 'Work'
    },
    correct: 'a',
    explanation: 'A position is a specific collection of tasks and responsibilities performed by only one individual within the organization.',
    urdu_answer: 'کسی ایک مخصوص فرد کے سپرد کیے گئے فرائض اور ٹاسکس کے مجموعے کو اس کی پوزیشن (Position) کہتے ہیں۔'
  },
  {
    stem: 'A group of tasks that must be performed within an organization to achieve its goals is known as:',
    options: {
      a: 'Duty',
      b: 'Responsibility',
      c: 'Job',
      d: 'Position'
    },
    correct: 'c',
    explanation: 'A job is a group of similar positions involving essentially the same significant tasks, duties, and responsibilities across an organization.',
    urdu_answer: 'ادارے کے مقاصد کے حصول کے لیے سرانجام دیے جانے والے مساوی ٹاسکس اور فرائض کے مجموعے کو جاب (Job) کہا جاتا ہے۔'
  },
  {
    stem: 'Which of the given term is used to represent the segments of jobs held by an individual throughout his/her life time?',
    options: {
      a: 'Responsibility',
      b: 'Occupation / Career',
      c: 'Position',
      d: 'Task'
    },
    correct: 'b',
    explanation: 'An occupation or career represents the broader group of similar jobs that an individual holds over their working lifetime.',
    urdu_answer: 'ایک فرد اپنی پوری عملی زندگی میں جن مختلف ملازمتوں کے مراحل سے گزرتا ہے، اسے اس کا پیشہ یا کیریئر (Occupation / Career) کہتے ہیں۔'
  },
  {
    stem: "Which of the following term is used to identify, 'what the job holder does'? 'how it is done'? & 'why it is done'?",
    options: {
      a: 'Job specification',
      b: 'Job evaluation',
      c: 'Job description',
      d: 'Job title'
    },
    correct: 'c',
    explanation: 'Job Description is a written factual statement describing what the job holder does, how it is done, why it is done, and under what conditions.',
    urdu_answer: 'جاب ڈسکرپشن تحریری دستاویز ہے جو یہ واضح کرتی ہے کہ ملازم کیا کام کرتا ہے، کیسے کرتا ہے اور کیوں کرتا ہے۔'
  },
  {
    stem: 'Which of the following identifies the minimum acceptable qualification that the incumbent must possess to perform a particular job successfully?',
    options: {
      a: 'Job analysis',
      b: 'Job specification',
      c: 'Job description',
      d: 'Job evaluation'
    },
    correct: 'b',
    explanation: 'Job Specification details the minimum human traits, knowledge, skills, education, and credentials required to perform a job effectively.',
    urdu_answer: 'کسی ملازمت کو کامیابی سے انجام دینے کے لیے ضروری کم سے کم قابلیت، تجربہ اور مہارتوں کی فہرست کو جاب اسپیسیفیکیشن کہتے ہیں۔'
  },
  {
    stem: 'Job specification is a statement that represents:',
    options: {
      a: 'Required skills',
      b: 'Specific qualification',
      c: 'Personality traits',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: 'Job specification outlines all person-centric attributes: education, experience, specialized technical skills, and physical or personality attributes.',
    urdu_answer: 'جاب اسپیسیفیکیشن میں مطلوبہ مہارتیں، تعلیمی قابلیت اور ذاتی اوصاف سب شامل ہوتے ہیں۔'
  },
  {
    stem: 'Job description concentrates on ___________ and job specification on ___________, that incumbent must possess to perform the job.',
    options: {
      a: 'Knowledge & skills, Content of work',
      b: 'Duties & Responsibilities, Qualifications',
      c: 'General working conditions, Duties',
      d: 'Content of work, Context of work'
    },
    correct: 'b',
    explanation: 'Job description outlines the duties, responsibilities, and tasks of the role, while job specification focuses on human qualifications, credentials, and capabilities.',
    urdu_answer: 'جاب ڈسکرپشن کام کے فرائض و ذمہ داریوں پر اور جاب اسپیسیفیکیشن امیدوار کی مطلوبہ قابلیت و مہارتوں پر فوکس کرتی ہے۔'
  },
  {
    stem: 'Which of the following condition stimulates the need of Job analysis within an organization?',
    options: {
      a: 'Creation of New jobs',
      b: 'Prior to job specification',
      c: 'While modifying existing jobs',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: 'Job analysis is initiated when organizations create new jobs, when technological or workflow changes alter existing jobs, or when compensation systems are updated.',
    urdu_answer: 'جاب اینالیسس کی ضرورت نئی ملازمتوں کے قیام، پرانی ملازمتوں میں تبدیلی، اور جاب اسپیسیفیکیشن بنانے کے وقت پیش آتی ہے۔'
  },
  {
    stem: 'Which of the following specifies the relative value or worth of each job in an organization?',
    options: {
      a: 'Job analysis',
      b: 'Job description',
      c: 'Job specification',
      d: 'Job evaluation'
    },
    correct: 'd',
    explanation: 'Job evaluation systematically determines the relative financial worth and ranking of different jobs within the company to establish equitable compensation structures.',
    urdu_answer: 'ادارے کے اندر ہر ملازمت کی نسبتی مالی قدر اور اہمیت کا تعین کرنے والے عمل کو جاب ایویلیوایشن (Job evaluation) کہتے ہیں۔'
  },
  {
    stem: '"Describe the general nature of the job, and includes only its major functions or activities." This section represents which of the following term?',
    options: {
      a: 'Job analysis',
      b: 'Job description',
      c: 'Job specification',
      d: 'Job summary'
    },
    correct: 'd',
    explanation: 'The Job Summary section in a job description outlines the broad, overarching nature of the position and its primary operational functions in a few concise sentences.',
    urdu_answer: 'جاب سمری (Job summary) ملازمت کی عمومی نوعیت اور اس کے چند بنیادی افعال کا مختصر خلاصہ بیان کرتی ہے۔'
  },
  {
    stem: "Which of the following best describes the importance of 'Job Analysis'?",
    options: {
      a: 'It helps organizations to set their goals',
      b: 'It sets foundation of all HR functions',
      c: 'It is necessary to compete in the market',
      d: 'All of the given options'
    },
    correct: 'b',
    explanation: 'Job analysis is universally acknowledged as the cornerstone or bedrock of HR because recruitment, selection, training, appraisal, and compensation all depend on its findings.',
    urdu_answer: 'جاب اینالیسس کو ہیومن ریسورس مینجمنٹ کے تمام افعال (بھرتی، تربیت، معاوضہ، جانچ) کی بنیاد سمجھا جاتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for MGT501 Lecture 10.`);

// 5 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define Job Analysis. What are the two primary documents/outcomes produced through the job analysis process?',
    correct: `<p><strong>1. Definition of Job Analysis:</strong> Job analysis is the systematic process of collecting, documenting, and analyzing all relevant information regarding the duties, responsibilities, necessary skills, outcomes, and work environment of a specific job (MGT501 Lesson 10).</p>
<p><strong>2. Two Primary Outcomes:</strong></p>
<ul>
  <li><strong>Job Description:</strong> A written statement identifying what the job holder does, how it is done, why it is done, and under what environmental conditions (job-oriented).</li>
  <li><strong>Job Specification:</strong> A written statement detailing the minimum acceptable qualifications, skills, knowledge, credentials, and traits required of the person performing the job (person-oriented).</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 66–68).',
    urdu_answer: 'جاب اینالیسس کسی ملازمت کے بارے میں تمام حقائق اور فرائض جانچنے کا منظم عمل ہے۔ اس کے دو بنیادی نتائج جاب ڈسکرپشن (کام کی تفصیل) اور جاب اسپیسیفیکیشن (امیدوار کی مطلوبہ اہلیت) ہیں۔'
  },
  {
    stem: 'Differentiate between Job Description and Job Specification with key characteristics.',
    correct: `<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Dimension</th>
      <th class="p-2 border">Job Description</th>
      <th class="p-2 border">Job Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Orientation</td>
      <td class="p-2 border">Focuses on the <strong>Job itself</strong> (job-oriented).</td>
      <td class="p-2 border">Focuses on the <strong>Person / Incumbent</strong> (human-oriented).</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Key Contents</td>
      <td class="p-2 border">Job title, location, job summary, reporting relationships, duties, responsibilities, and hazards.</td>
      <td class="p-2 border">Educational degrees, work experience, specialized technical skills, certifications, and personality traits.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Core Question</td>
      <td class="p-2 border">"What duties must be performed, how, and where?"</td>
      <td class="p-2 border">"What qualifications and skills must the worker possess?"</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 68–69).',
    urdu_answer: 'جاب ڈسکرپشن کا فوکس خود نوکری اور اس کے فرائض پر ہوتا ہے (جیسے ٹاسکس اور ماحول)، جبکہ جاب اسپیسیفیکیشن کا فوکس ملازم پر ہوتا ہے (جیسے تعلیم، مہارتیں اور تجربہ)۔'
  },
  {
    stem: 'Define the four basic building blocks of a job: Task, Duty, Responsibility, and Position.',
    correct: `<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Task:</strong> A distinct, identifiable work activity composed of motions directed towards a specific, immediate objective (e.g., entering sales numbers into a spreadsheet).</li>
  <li><strong>Duty:</strong> A major functional cluster of work composed of several related tasks performed by an individual (e.g., managing weekly account reconciliations).</li>
  <li><strong>Responsibility:</strong> An obligation that an employee assumes to perform assigned duties and tasks satisfactorily and accountably.</li>
  <li><strong>Position:</strong> The complete collection of tasks, duties, and responsibilities assigned to be performed by one specific person in an organization (every employee holds a position).</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 66–67).',
    urdu_answer: 'ٹاسک کام کی سب سے چھوٹی اکائی ہے، چند ٹاسکس مل کر ڈیوٹی بناتے ہیں، کام کو صحیح طور پر انجام دینے کی پابندی ذمہ داری ہے، اور کسی ایک فرد کو تفویض کردہ تمام فرائض اس کی پوزیشن کہلاتے ہیں۔'
  },
  {
    stem: 'What conditions or organizational circumstances stimulate the need for conducting Job Analysis?',
    correct: `<p><strong>Circumstances That Trigger Job Analysis (MGT501 Lesson 10):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>When an Organization is Created or Founded:</strong> A comprehensive job analysis program must be initiated to design and establish new jobs from scratch.</li>
  <li><strong>When New Jobs Are Created:</strong> Rapid organizational growth, new product lines, or expanding departments generate brand-new roles requiring formal definition.</li>
  <li><strong>When Existing Jobs Change Substantially:</strong> Adoption of new computer technologies, automation, re-engineering, or operational restructuring fundamentally modifies duties and required skill sets.</li>
  <li><strong>When Updating Compensation Structures:</strong> To resolve internal pay inequities and support job evaluation for revised salary bands.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Page 67).',
    urdu_answer: 'جاب اینالیسس کی ضرورت تب پیش آتی ہے جب نیا ادارہ بنے، نئی نوکریاں قائم ہوں، ٹیکنالوجی یا طریقہ کار بدلنے سے پرانی نوکریوں کے فرائض تبدیل ہو جائیں، یا تنخواہوں کے نظام کا ازسرنو جائزہ لینا ہو۔'
  },
  {
    stem: 'Briefly list the primary uses of Job Analysis information across human resource functions.',
    correct: `<p><strong>Primary Uses of Job Analysis in HR:</strong></p>
<ul>
  <li><strong>Recruitment and Selection:</strong> Provides precise job descriptions for job advertisements and job specifications for screening applicant qualifications.</li>
  <li><strong>Compensation and Benefits:</strong> Provides the factual foundation for Job Evaluation to determine equitable pay scales and wage differentials.</li>
  <li><strong>Performance Appraisal:</strong> Establishes clear, objective performance standards and duty criteria against which employees are evaluated.</li>
  <li><strong>Training and Development:</strong> Pinpoints the exact knowledge, skills, and abilities required so training programs address actual skill deficits.</li>
  <li><strong>Workplace Safety and Health:</strong> Identifies hazardous working conditions and physical demands to design safety procedures.</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 67–68).',
    urdu_answer: 'جاب اینالیسس بھرتی، ملازمین کے انتخاب، تنخواہوں اور مراعات کے تعین، کارکردگی کی جانچ پڑتال اور تربیتی ضروریات کی نشاندہی کے لیے بنیادی ڈیٹا فراہم کرتا ہے۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for MGT501 Lecture 10.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `Traditionally, a job is defined into four segregates: Job, Position, Duty, and Task. Compare these four parts from each other and explain the hierarchical relationship among them.`,
    correct: `<p><strong>1. Definitions and Comparison:</strong></p>
<ul>
  <li><strong>Task:</strong> The fundamental, discrete building block of work consisting of observable physical and mental activities (e.g., verifying a customer invoice).</li>
  <li><strong>Duty:</strong> A major functional area composed of several related tasks recurring regularly (e.g., reconciling accounts payable).</li>
  <li><strong>Position:</strong> The specific bundle of duties and tasks assigned to one single employee. An organization has exactly as many positions as it has employees (plus vacant roles).</li>
  <li><strong>Job:</strong> A broader group of positions that are sufficiently similar in their significant duties and responsibilities (e.g., "Accountant" may represent 10 positions held by 10 different employees).</li>
</ul>
<p><strong>2. Hierarchical Relationship:</strong></p>
<p>The relationship among these four components forms a bottom-up pyramid structure:</p>
$$\\text{Elements} \\longrightarrow \\mathbf{Tasks} \\longrightarrow \\mathbf{Duties} \\longrightarrow \\mathbf{Position} \\longrightarrow \\mathbf{Job} \\longrightarrow \\text{Occupation}$$
<p>Multiple <em>tasks</em> combine to form a <em>duty</em>; a bundle of duties and responsibilities constitutes a <em>position</em>; and identical or highly similar positions across the organization collectively constitute a <em>job</em>.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 66–67).',
    urdu_answer: 'ٹاسک سب سے چھوٹی سرگرمی ہے، کئی ٹاسکس مل کر ڈیوٹی بناتے ہیں، ایک شخص کو دی جانے والی ڈیوٹیز اس کی پوزیشن کہلاتی ہیں، اور ملتی جلتی تمام پوزیشنز مل کر ایک جاب بناتی ہیں۔'
  },
  {
    stem: `Why is Job Analysis considered the cornerstone or foundation of all Human Resource Management activities? Explain how job analysis data is utilized in Recruitment, Selection, Performance Appraisal, Compensation, and Training.`,
    correct: `<p><strong>1. Why Job Analysis is the Cornerstone of HRM:</strong></p>
<p>Job analysis is the fundamental bedrock of Human Resource Management because an organization cannot recruit, select, compensate, train, or evaluate employees fairly without understanding the precise nature, duties, and requirements of each job.</p>
<p><strong>2. Utilization Across Core HR Functions:</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Recruitment:</strong> Job descriptions provide clear, factual specifications for drafting realistic job advertisements, attracting the right talent pool while filtering unqualified applicants.</li>
  <li><strong>Selection:</strong> Job specifications define the minimum required credentials, skills, and testing benchmarks, enabling HR to structure interview questions and assessment tests objectively.</li>
  <li><strong>Compensation & Job Evaluation:</strong> Job analysis provides data on relative skill levels, working hazards, and responsibilities, which determines the relative value (Job Evaluation) and internal pay equity for each position.</li>
  <li><strong>Performance Appraisal:</strong> Objective appraisal requires measurable standards. Job analysis defines the exact duties against which an employee's actual output and performance are judged.</li>
  <li><strong>Training and Development:</strong> By comparing current employee competencies against the required job specification, HR can identify exact training gaps and develop targeted learning interventions.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 10, Pages 66–68).',
    urdu_answer: 'جاب اینالیسس ایچ آر ایم کی بنیاد اس لیے ہے کیونکہ نوکری کے فرائض کو سمجھے بغیر کسی بھی عملے کو بھرتی کرنا، تنخواہ دینا، جانچنا یا ٹریننگ دینا ممکن نہیں ہے۔ یہ بھرتی کے اشتہار، سلیکشن ٹیسٹ، معاوضے اور ٹریننگ پروگرامز کی بنیاد بناتا ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for MGT501 Lecture 10.`);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for MGT501 Lecture 10 in local DB: ${total.c}`);

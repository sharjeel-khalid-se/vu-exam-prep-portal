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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(mgt501.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Job Design, Job Enrichment, JCM Model & Alternative Work Arrangements')
  `).run(mgt501.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created MGT501 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`MGT501 Lecture 13 already exists with ID: ${lec13.id}`);
}

const lId = lec13.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 13.`);

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
    stem: 'A horizontal extension of a job to increase task variety by assigning workers to additional same-level tasks is called:',
    options: {
      a: 'Job evaluation',
      b: 'Job enrichment',
      c: 'Job enlargement',
      d: 'Job rotation'
    },
    correct: 'c',
    explanation: 'Job enlargement is the horizontal expansion of a job, adding more tasks at the same skill level to increase variety and reduce monotony (MGT501 Lesson 13).',
    urdu_answer: 'جاب اینلارجمنٹ (Job enlargement) کام کی افقی وسعت (Horizontal expansion) ہے جس میں ملازم کو اسی سطح کے مزید ٹاسکس دیے جاتے ہیں تاکہ یکسانیت ختم ہو۔'
  },
  {
    stem: 'Extent of individual freedom and discretion employees have in performing their jobs is known as:',
    options: {
      a: 'Capitation',
      b: 'Flextime',
      c: 'Empowerment',
      d: 'Autonomy'
    },
    correct: 'd',
    explanation: 'Autonomy is the degree to which a job provides substantial freedom, independence, and discretion in scheduling work and determining procedures.',
    urdu_answer: 'خود مختاری (Autonomy) سے مراد وہ انفرادی آزادی اور صوابدیدی اختیار ہے جو ملازم کو کام کرنے اور منصوبہ بندی میں حاصل ہوتا ہے۔'
  },
  {
    stem: 'Systematically moving workers from one job to another to reduce boredom and broaden their skills is known as:',
    options: {
      a: 'Job enlargement',
      b: 'Job rotation',
      c: 'Job enrichment',
      d: 'Job evaluation'
    },
    correct: 'b',
    explanation: 'Job rotation (cross-training) systematically shifts employees between different tasks or workstations on a periodic schedule to reduce fatigue and diversify competencies.',
    urdu_answer: 'ملازمین کو بیزاری سے بچانے اور مختلف مہارتیں سکھانے کے لیے ایک کام سے دوسرے کام پر منظم طریقے سے منتقل کرنا جاب روٹیشن (Job rotation) کہلاتا ہے۔'
  },
  {
    stem: 'Building motivators like opportunities for achievement, responsibility, and recognition into the job by making it more interesting and challenging is termed as:',
    options: {
      a: 'Job rotation',
      b: 'Job enlargement',
      c: 'Job enrichment',
      d: 'Job description'
    },
    correct: 'c',
    explanation: 'Job enrichment is the vertical expansion of a job by adding higher-level responsibilities, planning authority, and recognition based on Herzberg’s motivator factors.',
    urdu_answer: 'جاب اینرچمنٹ (Job enrichment) کام کی عمودی وسعت (Vertical expansion) ہے جس میں کام کو زیادہ چیلنجنگ بنا کر کامیابی، ذمہ داری اور پہچان کے مواقع پیدا کیے جاتے ہیں۔'
  },
  {
    stem: 'Which of the following refers to the process of structuring work and specifying the number and nature of activities in a particular job?',
    options: {
      a: 'Job analysis',
      b: 'Job evaluation',
      c: 'Job design',
      d: 'Job specification'
    },
    correct: 'c',
    explanation: 'Job design is the process of structuring tasks, responsibilities, relationships, and work methods to satisfy technological needs and employee psychological requirements.',
    urdu_answer: 'کسی ملازمت کے اندر کام کی سرگرمیوں، طریقوں اور ذمہ داریوں کو باقاعدہ شکل دینے کا عمل جاب ڈیزائن (Job design) کہلاتا ہے۔'
  },
  {
    stem: 'Alternative work arrangements include all of the following EXCEPT:',
    options: {
      a: 'Part-time work',
      b: 'Flexible hours',
      c: 'On-site child care',
      d: 'Job sharing'
    },
    correct: 'c',
    explanation: 'On-site childcare is an employee benefit/service, not an alternative work schedule arrangement like flextime, telecommuting, compressed workweeks, or job sharing.',
    urdu_answer: 'آن سائٹ چائلڈ کیئر ملازمین کی ایک اضافی سہولت (Benefit) ہے، یہ متبادل ورک ارینجمنٹ یا شیڈول نہیں ہے۔'
  },
  {
    stem: 'Mr. Ahmed is a cashier and he feels dissatisfied at work. What best justifies this situation?',
    options: {
      a: 'His job may not be structured to suit his preferences',
      b: 'It involves physical toughness',
      c: 'It requires mental toughness',
      d: 'It involves too much customer interaction'
    },
    correct: 'a',
    explanation: 'A major reason for workplace dissatisfaction in repetitive roles like cashiering is poor job design that lacks variety, autonomy, and task identity suited to employee psychological preferences.',
    urdu_answer: 'احمد کی ملازمت شاید اس کی ترجیحات اور صلاحیتوں کے مطابق ڈیزائن نہیں کی گئی، جس سے یکسانیت اور بیزاری پیدا ہو رہی ہے۔'
  },
  {
    stem: 'Which of the following statements is true regarding participative management and job design?',
    options: {
      a: 'Employees feel more secure when the boss is in charge',
      b: 'Participative management gives employees more control over day-to-day job activities',
      c: 'Employee involvement decreases innovative ideas',
      d: 'None of the above'
    },
    correct: 'b',
    explanation: 'Participative management empowers workers by involving them in decision-making, increasing personal agency, intrinsic motivation, and operational commitment.',
    urdu_answer: 'شراکتی انتظام (Participative management) ملازمین کو روزمرہ کے کاموں پر زیادہ کنٹرول اور فیصلے کرنے کے اختیارات دیتا ہے۔'
  },
  {
    stem: 'According to Hackman and Oldham’s Job Characteristics Model, the degree to which a job provides substantial freedom, independence, and discretion is called:',
    options: {
      a: 'Task identity',
      b: 'Skill variety',
      c: 'Autonomy',
      d: 'Task significance'
    },
    correct: 'c',
    explanation: 'In Hackman & Oldham’s JCM, Autonomy directly leads to the critical psychological state of experienced responsibility for work outcomes.',
    urdu_answer: 'ہیکمین اور اولڈھم کے ماڈل کے مطابق کام میں آزادی اور صوابدید کا پیمانہ خود مختاری (Autonomy) کہلاتا ہے۔'
  },
  {
    stem: 'The key difference between Job Enlargement and Job Enrichment is that Job Enlargement focuses on ________ while Job Enrichment focuses on ________.',
    options: {
      a: 'Vertical expansion, Horizontal expansion',
      b: 'Horizontal expansion (task variety), Vertical expansion (autonomy & responsibility)',
      c: 'Pay increases, Promotions',
      d: 'Skill reduction, Task rotation'
    },
    correct: 'b',
    explanation: 'Job enlargement adds more same-level tasks (horizontal expansion), whereas job enrichment introduces depth, control, and autonomy (vertical expansion).',
    urdu_answer: 'جاب اینلارجمنٹ میں افقی وسعت (مزید کام) ہوتی ہے جبکہ جاب اینرچمنٹ میں عمودی وسعت (زیادہ خود مختاری اور ذمہ داری) ہوتی ہے۔'
  },
  {
    stem: 'An arrangement that allows two or more individuals to split a traditional 40-hour-a-week job is called:',
    options: {
      a: 'Flextime',
      b: 'Telecommuting',
      c: 'Job sharing',
      d: 'Compressed workweek'
    },
    correct: 'c',
    explanation: 'Job sharing divides one full-time position and its salary/benefits between two part-time employees who coordinate responsibilities.',
    urdu_answer: 'ایک روایتی فل ٹائم ملازمت کو دو یا دو سے زیادہ افراد کے درمیان تقسیم کرنے کے عمل کو جاب شیئرنگ (Job sharing) کہتے ہیں۔'
  },
  {
    stem: 'A scheduling option that allows full-time employees to choose their starting and quitting hours within specified core time periods is known as:',
    options: {
      a: 'Flextime',
      b: 'Compressed workweek',
      c: 'Job rotation',
      d: 'Telecommuting'
    },
    correct: 'a',
    explanation: 'Flextime permits employees to alter arrival and departure times provided they work the required total hours and are present during core operating hours (e.g., 10 AM to 3 PM).',
    urdu_answer: 'فلیکس ٹائم (Flextime) میں ملازمین کو بنیادی اوقات (Core hours) کے علاوہ اپنی مرضی سے آنے اور جانے کا شیڈول منتخب کرنے کی اجازت ہوتی ہے۔'
  },
  {
    stem: 'Designing the physical aspects of the job workplace to fit the human body\'s capabilities and limits is termed as:',
    options: {
      a: 'Ergonomics',
      b: 'Reengineering',
      c: 'De-skilling',
      d: 'Job evaluation'
    },
    correct: 'a',
    explanation: 'Ergonomics (human factors engineering) designs physical equipment, seating, lighting, and tool interfaces to maximize physical safety, minimize repetitive strain, and optimize comfort.',
    urdu_answer: 'انسانی جسمانی صلاحیتوں اور حدود کے مطابق کام کی جگہ اور اوزاروں کو محفوظ طریقے سے ڈیزائن کرنے کے علم کو ارگونومکس (Ergonomics) کہتے ہیں۔'
  },
  {
    stem: 'Part-timers, temporaries, and independent contractors who perform specific tasks without permanent employment contracts fall under:',
    options: {
      a: 'Core employees',
      b: 'Contingent workforce',
      c: 'Executive recruiters',
      d: 'Permanent workforce'
    },
    correct: 'b',
    explanation: 'The contingent workforce consists of non-permanent labor (freelancers, temporary agency workers, on-call workers, independent contractors) hired to meet fluctuating demand.',
    urdu_answer: 'عارضی، جز وقتی ملازمین اور کنٹریکٹرز جو مستقل معاہدے کے بغیر کام کرتے ہیں، کنٹنجنٹ ورک فورس (Contingent workforce) کہلاتے ہیں۔'
  },
  {
    stem: 'The degree to which a job requires completion of a whole and identifiable piece of work from beginning to end is known as:',
    options: {
      a: 'Skill variety',
      b: 'Task identity',
      c: 'Task significance',
      d: 'Feedback'
    },
    correct: 'b',
    explanation: 'Task identity is the extent to which a worker completes an entire tangible unit of work (e.g., building a complete cabinet) rather than just a repetitive fragment.',
    urdu_answer: 'ٹاسک آئیڈینٹیٹی (Task identity) سے مراد یہ ہے کہ ملازم شروع سے لے کر اختتام تک کام کا ایک مکمل اور واضح حصہ مکمل کرے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for MGT501 Lecture 13.`);

// 5 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'What is Job Design? Differentiate between Job Enlargement and Job Enrichment.',
    correct: `<p><strong>1. Job Design:</strong> The process of structuring work tasks, responsibilities, relationships, and methods to create a productive and motivating role (MGT501 Lesson 13).</p>
<p><strong>2. Difference:</strong></p>
<ul>
  <li><strong>Job Enlargement (Horizontal Expansion):</strong> Assigns additional tasks at the exact same level of skill and responsibility to broaden task variety and reduce monotony (e.g., a typist who also files and answers phones).</li>
  <li><strong>Job Enrichment (Vertical Expansion):</strong> Empowers the jobholder by building in higher-level responsibilities, planning autonomy, decision-making authority, and self-evaluation (e.g., a cashier given authority to issue customer refunds without managerial sign-off).</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Page 72 / Page 198).',
    urdu_answer: 'جاب ڈیزائن کام کے ڈھانچے کو کہتے ہیں۔ اینلارجمنٹ میں اسی لیول کے مزید کام شامل ہوتے ہیں (افقی وسعت)، جبکہ اینرچمنٹ میں زیادہ اختیارات، منصوبہ بندی اور ذمہ داریاں دی جاتی ہیں (عمودی وسعت)۔'
  },
  {
    stem: 'What is Job Rotation? State its major advantages for both employees and the organization.',
    correct: `<p><strong>1. Definition:</strong> Job rotation (cross-training) systematically moves workers through a sequence of different job assignments on a planned schedule (MGT501 Lesson 13).</p>
<p><strong>2. Advantages for Employees:</strong> Reduces repetitive boredom and physical fatigue, prevents burnout, builds diverse technical skills, and increases promotional prospects.</p>
<p><strong>3. Advantages for Organization:</strong> Creates a flexible, multi-skilled workforce capable of covering unexpected absences or sudden production bottlenecks, while facilitating better cross-departmental coordination.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Page 72).',
    urdu_answer: 'جاب روٹیشن ملازمین کو منظم شیڈول کے تحت مختلف کاموں میں منتقل کرنے کا نام ہے۔ اس سے ملازمین کی بیزاری ختم ہوتی ہے اور ادارہ کثیر الجہتی ہنر مند (Multi-skilled) افرادی قوت حاصل کرتا ہے۔'
  },
  {
    stem: 'Explain Autonomy and Empowerment in the context of Job Redesign.',
    correct: `<p><strong>1. Autonomy:</strong> The degree to which a job grants an employee substantial personal freedom, independence, and discretion to plan, schedule work tasks, and choose procedural methods. It generates a psychological state of personal accountability for work results.</p>
<p><strong>2. Empowerment:</strong> An organizational philosophy and managerial strategy that formally decentralizes power, authority, and resources directly to front-line employees. It encourages workers to take initiative, solve customer problems on the spot, and make operational improvements without waiting for supervisory approval.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Page 73).',
    urdu_answer: 'خود مختاری (Autonomy) کام کی منصوبہ بندی اور طریقوں میں انفرادی آزادی کا نام ہے، جبکہ امپاورمنٹ (Empowerment) ملازمین کو وسائل اور فیصلے کرنے کے عملی اختیارات دینا ہے تاکہ وہ فوری مسائل حل کر سکیں۔'
  },
  {
    stem: 'Enlist and briefly describe four Alternative Work Arrangements / Flexible Work Schedules used in modern organizations.',
    correct: `<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Flextime (Flexible Work Hours):</strong> Employees choose their starting and quitting hours around mandatory "core hours" (e.g., 10 AM to 3 PM) while completing required weekly hours.</li>
  <li><strong>Job Sharing:</strong> Two or more part-time employees split a single full-time 40-hour-per-week position, dividing salary, benefits, and duties proportionately.</li>
  <li><strong>Telecommuting (Remote Work):</strong> Employees perform their job duties from home or remote hubs using internet, cloud tools, and telecommunications technology.</li>
  <li><strong>Compressed Workweek:</strong> Standard weekly hours are condensed into fewer working days (e.g., working four 10-hour days instead of five 8-hour days: "4/10 schedule").</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Pages 73–74).',
    urdu_answer: 'متبادل کام کے شیڈولز: فلیکس ٹائم (مرضی کے اوقات)، جاب شیئرنگ (ایک نوکری کو دو افراد میں بانٹنا)، ٹیلی کمیوٹنگ (گھر سے ریموٹ کام)، اور کمپریسڈ ورک ویک (4 دن میں ہفتے کے گھنٹے پورے کرنا)۔'
  },
  {
    stem: 'What are the five Core Job Dimensions in Hackman and Oldham’s Job Characteristics Model (JCM)?',
    correct: `<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Skill Variety:</strong> The extent to which a job requires a range of different activities and challenges that employ multiple skills and talents.</li>
  <li><strong>Task Identity:</strong> The degree to which a job requires completing a whole, identifiable, visible piece of work from beginning to end.</li>
  <li><strong>Task Significance:</strong> The degree to which the job has a substantial, noticeable impact on the lives or work of other people inside or outside the organization.</li>
  <li><strong>Autonomy:</strong> The extent of substantial freedom, independence, and discretion granted in scheduling and executing work.</li>
  <li><strong>Feedback:</strong> The degree to which executing the work activities provides direct, clear information regarding performance effectiveness.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Pages 72–73).',
    urdu_answer: 'ہیکمین اور اولڈھم ماڈل کی پانچ جہتیں: مہارتوں کا تنوع (Skill Variety)، کام کی شناخت (Task Identity)، کام کی اہمیت (Task Significance)، خود مختاری (Autonomy)، اور براہِ راست فیڈ بیک (Feedback)۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for MGT501 Lecture 13.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `Explain Job Redesign in detail. Compare and contrast the three primary job design strategies: Job Rotation, Job Enlargement, and Job Enrichment. Discuss how job enrichment incorporates Herzberg’s motivators to increase employee motivation and satisfaction.`,
    correct: `<p><strong>1. Concept of Job Redesign:</strong> Job redesign involves re-evaluating and reorganizing existing work tasks, structural relationships, and operating environments to enhance worker productivity and psychological satisfaction.</p>
<p><strong>2. Comparative Matrix of the Three Design Strategies:</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Strategy</th>
      <th class="p-2 border">Direction of Change</th>
      <th class="p-2 border">Mechanism</th>
      <th class="p-2 border">Primary Objective</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Job Rotation</td>
      <td class="p-2 border">Rotational</td>
      <td class="p-2 border">Shifts employees across different jobs periodically.</td>
      <td class="p-2 border">Reduces physical fatigue, breaks monotony, fosters cross-functional skills.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Job Enlargement</td>
      <td class="p-2 border">Horizontal</td>
      <td class="p-2 border">Adds more same-level tasks to broaden duties.</td>
      <td class="p-2 border">Prevents over-specialization and boredom through task variety.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Job Enrichment</td>
      <td class="p-2 border">Vertical</td>
      <td class="p-2 border">Builds higher autonomy, accountability, and planning authority.</td>
      <td class="p-2 border">Fosters intrinsic motivation, personal growth, and professional fulfillment.</td>
    </tr>
  </tbody>
</table>
<p><strong>3. Alignment with Herzberg’s Two-Factor Motivators:</strong></p>
<p>Frederick Herzberg demonstrated that hygiene factors (pay, company policy, working conditions) only prevent dissatisfaction, while true motivation stems from intrinsic <strong>Motivators</strong>. Job enrichment directly infuses these motivators into daily work:</p>
<ul>
  <li><strong>Achievement:</strong> Workers are given full ownership of difficult tasks, experiencing tangible success upon completion.</li>
  <li><strong>Recognition:</strong> Greater visibility allows management and peers to acknowledge exceptional performance.</li>
  <li><strong>Responsibility:</strong> Delegating control and self-inspection gives workers personal accountability.</li>
  <li><strong>Advancement and Growth:</strong> Mastering complex enriched challenges builds professional capabilities, preparing workers for leadership promotions.</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Page 72 / Page 198).',
    urdu_answer: 'جاب ری ڈیزائن میں روٹیشن (مختلف کاموں میں منتقلی)، اینلارجمنٹ (مزید کاموں کا اضافہ)، اور اینرچمنٹ (اختیارات اور ذمہ داری کی عمودی ترقی) شامل ہیں۔ ہرزبرگ کے نظریے کے تحت اینرچمنٹ ملازم کو کامیابی، پہچان، ترقی اور حقیقی حوصلہ افزائی فراہم کرتی ہے۔'
  },
  {
    stem: `Discuss Hackman and Oldham’s Job Characteristics Model (JCM) in detail. Explain how the five core job dimensions lead to three critical psychological states and result in positive personal and work outcomes for employees.`,
    correct: `<p><strong>Hackman and Oldham’s Job Characteristics Model (JCM) Framework:</strong></p>
<p>The JCM proposes that specific core job dimensions create critical psychological states, which in turn drive high internal work motivation and organizational effectiveness.</p>
<p><strong>1. Five Core Job Dimensions:</strong></p>
<ul>
  <li><strong>Skill Variety:</strong> Using multiple skills and creative faculties.</li>
  <li><strong>Task Identity:</strong> Completing a whole, visible unit of work.</li>
  <li><strong>Task Significance:</strong> Feeling the work impacts lives or the community.</li>
  <li><strong>Autonomy:</strong> Discretion in scheduling and procedural choices.</li>
  <li><strong>Feedback:</strong> Clear, direct evidence of performance results.</li>
</ul>
<p><strong>2. Three Critical Psychological States:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Experienced Meaningfulness of the Work:</strong> Generated jointly by <em>Skill Variety</em>, <em>Task Identity</em>, and <em>Task Significance</em>. The worker perceives their effort as inherently worthwhile and important.</li>
  <li><strong>Experienced Responsibility for Work Outcomes:</strong> Driven directly by <em>Autonomy</em>. The employee feels personally accountable for output successes and failures.</li>
  <li><strong>Knowledge of the Actual Results of Work Activities:</strong> Generated by <em>Feedback</em>. The employee continuously understands how effectively they are executing tasks.</li>
</ol>
<p><strong>3. High-Impact Personal and Work Outcomes:</strong></p>
<ul>
  <li>High internal / intrinsic work motivation.</li>
  <li>High-quality work performance.</li>
  <li>High overall job satisfaction.</li>
  <li>Substantially lower absenteeism and employee turnover.</li>
</ul>
<p><em>Moderating Variable:</em> The strength of these relationships is moderated by an employee's <strong>Growth-Need Strength (GNS)</strong> — individuals desiring personal development respond most enthusiastically to enriched job characteristics.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 13, Pages 72–73).',
    urdu_answer: 'ہیکمین اور اولڈھم کا ماڈل بتاتا ہے کہ 5 جہتیں (مہارت، شناخت، اہمیت، خود مختاری، فیڈ بیک) تین ذہنی کیفیات (کام کا بامعنی ہونا، ذاتی ذمہ داری کا احساس، نتائج کا علم) پیدا کرتی ہیں، جس سے ملازم کی اندرونی لگن، اعلیٰ کارکردگی، اطمینان بڑھتا ہے اور غیر حاضری و استعفے کم ہوتے ہیں۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for MGT501 Lecture 13.`);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for MGT501 Lecture 13 in local DB: ${total.c}`);

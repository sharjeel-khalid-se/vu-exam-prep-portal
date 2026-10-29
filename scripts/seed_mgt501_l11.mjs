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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(mgt501.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Job Analysis: Steps in Process, Data Collection Methods & Quantitative Techniques')
  `).run(mgt501.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created MGT501 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`MGT501 Lecture 11 already exists with ID: ${lec11.id}`);
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

// 15 MCQs
const mcqs = [
  {
    stem: 'Which job analysis method is recommended for jobs like janitors, assembly line workers, and accounting clerks?',
    options: {
      a: 'Observation',
      b: 'Log/diary',
      c: 'Structured questionnaire',
      d: 'Technical conference'
    },
    correct: 'c',
    explanation: 'Structured questionnaires with checklists and rating scales are cost-effective and highly effective for jobs with well-defined, standardized duties such as assembly line workers, clerks, and janitors (MGT501 Lesson 11).',
    urdu_answer: 'کلرک، اسمبلی لائن ورکرز اور خاکروبوں جیسی معیاری اور مقررہ ڈیوٹیز کے لیے سٹرکچرڈ سوالنامہ (Structured questionnaire) موزوں طریقہ ہے۔'
  },
  {
    stem: "While conducting job analysis, the 'Observation Method' is useful when:",
    options: {
      a: 'Job requires more intellectual skills to complete',
      b: 'Job consists of physical activity like machine operations / Job is repetitive in nature',
      c: 'Job is market oriented and requires more data',
      d: 'None of the given options'
    },
    correct: 'b',
    explanation: 'Direct observation is most effective for short-cycle, repetitive, manual or physical jobs (such as machine operators, mechanics, or typists) where actions can be visually monitored.',
    urdu_answer: 'مشاہداتی طریقہ (Observation Method) اس وقت کارآمد ہوتا ہے جب کام جسمانی سرگرمیوں، مشین آپریشنز یا بار بار دہرائے جانے والے دستی کاموں پر مشتمل ہو۔'
  },
  {
    stem: 'Which of the following information is NOT collected through observation method while conducting job analysis?',
    options: {
      a: 'Who is monitoring the task?',
      b: 'What task has done?',
      c: 'How task has done?',
      d: 'How long a task has taken to complete?'
    },
    correct: 'a',
    explanation: 'Observation captures what tasks are executed, how they are performed, equipment used, and duration. It does not focus on who is monitoring or supervising the task.',
    urdu_answer: 'مشاہداتی طریقے میں یہ نہیں دیکھا جاتا کہ کام کی نگرانی کون کر رہا ہے، بلکہ یہ دیکھا جاتا ہے کہ کیا، کیسے اور کتنی دیر میں کام ہوا۔'
  },
  {
    stem: 'A questionnaire used to collect quantifiable data concerning the duties and responsibilities of various jobs is called:',
    options: {
      a: 'Functional Job Analysis (FJA)',
      b: 'Position Analysis Questionnaire (PAQ)',
      c: 'Department of Labor Procedure (DOL)',
      d: 'Employee Log'
    },
    correct: 'b',
    explanation: 'The Position Analysis Questionnaire (PAQ) is a highly structured, quantitative job analysis instrument containing 194 job elements rated on specific scales (e.g., extent of use, importance).',
    urdu_answer: 'مختلف ملازمتوں کے فرائض اور ذمہ داریوں کے مقداری (Quantifiable) ڈیٹا کو جمع کرنے کے لیے پوزیشن اینالیسس کوئسچنیر (PAQ) کا استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Standardized method for rating, classifying, and comparing virtually every kind of job based on data, people, and things is known as:',
    options: {
      a: 'Position Analysis Questionnaire (PAQ)',
      b: 'Department of Labor (DOL) Procedure',
      c: 'Functional Job Analysis (FJA)',
      d: 'Critical Incident Method'
    },
    correct: 'b',
    explanation: 'The U.S. Department of Labor (DOL) job analysis procedure provides a standardized rating system classifying work functions into three basic hierarchies: Data, People, and Things.',
    urdu_answer: 'ملازمتوں کو ڈیٹا، افراد اور اشیاء (Data, People, and Things) کی بنیاد پر درجہ بندی اور موازنہ کرنے کا معیاری طریقہ ڈیپارٹمنٹ آف لیبر (DOL) پروسیجر کہلاتا ہے۔'
  },
  {
    stem: 'Which of the following data collection tool is preferred in order to obtain information from a large number of employees in a short time period for job analysis?',
    options: {
      a: 'Questionnaires',
      b: 'Interviews',
      c: 'Observations',
      d: 'Employee diaries'
    },
    correct: 'a',
    explanation: 'Questionnaires are quick, economical, and can be administered simultaneously to hundreds of geographically dispersed incumbents, unlike time-consuming face-to-face interviews.',
    urdu_answer: 'کم وقت میں بہت بڑی تعداد میں ملازمین سے معلومات اکٹھی کرنے کے لیے سوالنامہ (Questionnaire) سب سے تیز رفتار اور سستا ذریعہ ہے۔'
  },
  {
    stem: 'The method of job analysis in which the employee records every activity he/she engages in, along with the time taken to perform each activity, is known as:',
    options: {
      a: 'Observation',
      b: 'Participant Diary / Log',
      c: 'Structured Interview',
      d: 'Position Analysis Questionnaire'
    },
    correct: 'b',
    explanation: 'In the Participant Diary/Log approach, incumbents maintain chronological daily journals logging each activity, interaction, and duration over a designated time period (e.g., 2–4 weeks).',
    urdu_answer: 'وہ طریقہ جس میں ملازم اپنی روزانہ کی تمام سرگرمیوں اور ان پر لگنے والے وقت کا باقاعدہ روزنامچہ رکھتا ہے، پارٹیسیپنٹ ڈائری یا لاگ (Participant Diary / Log) کہلاتا ہے۔'
  },
  {
    stem: 'Which of the following factor plays the vital role while conducting job analysis?',
    options: {
      a: 'Collecting maximum information',
      b: 'Understanding individual goals of employees',
      c: 'Obtaining top management support first',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: 'A successful job analysis program requires senior leadership sponsorship, broad data collection, and clarity on employee perceptions to reduce resistance and anxiety.',
    urdu_answer: 'جاب اینالیسس کرتے وقت اعلیٰ انتظامیہ کی حمایت حاصل کرنا، زیادہ سے زیادہ ڈیٹا جمع کرنا، اور ملازمین کے اہداف کو سمجھنا یہ تمام عوامل اہم کردار ادا کرتے ہیں۔'
  },
  {
    stem: 'Which of the following is considered as the MOST reliable data collection source needed for job analysis?',
    options: {
      a: 'Experienced job analyst',
      b: 'Top leading managers',
      c: 'Employees of that particular job (Job incumbents)',
      d: 'Head of the department'
    },
    correct: 'c',
    explanation: 'Job incumbents (the actual employees doing the work daily) possess the most authentic, first-hand knowledge of daily duties, challenges, and actual time allocation.',
    urdu_answer: 'جاب اینالیسس کے لیے سب سے زیادہ قابل اعتماد اور مستند ذریعہ وہ ملازمین (Job incumbents) ہوتے ہیں جو خود روزانہ وہ کام سرانجام دیتے ہیں۔'
  },
  {
    stem: 'To get more accurate information for job analysis, a questionnaire should include:',
    options: {
      a: 'Structured and unstructured questions',
      b: 'Open-ended and close-ended questions',
      c: 'Job analysis objectives and open-ended questions',
      d: 'Structured and open-ended questions'
    },
    correct: 'a',
    explanation: 'Combining structured questions (checklists/ratings for standardized analysis) with unstructured/open-ended questions (allowing employees to describe unique aspects) yields the most comprehensive picture.',
    urdu_answer: 'زیادہ درست معلومات کے حصول کے لیے سوالنامے میں سٹرکچرڈ (مقررہ پیمانے) اور ان سٹرکچرڈ (تفصیلی وضاحت والے) دونوں قسم کے سوالات شامل ہونے چاہئیں۔'
  },
  {
    stem: 'Which one method of job analysis is universally superior?',
    options: {
      a: 'Individual interview method',
      b: 'Group interview method',
      c: 'Observation method',
      d: 'None of given options'
    },
    correct: 'd',
    explanation: 'No single job analysis technique is universally superior for all jobs. Best practice recommends a multi-method combination (e.g., observation + interview + questionnaire).',
    urdu_answer: 'کوئی بھی ایک طریقہ اکیلا سب سے برتر نہیں ہے، بلکہ مختلف طریقوں کے امتزاج (Combination) کا استعمال سب سے زیادہ موزوں مانا جاتا ہے۔'
  },
  {
    stem: 'Job analysis can be performed in all of the following ways EXCEPT:',
    options: {
      a: 'Observing hourly work',
      b: 'Reviewing interviews conducted with departing employees',
      c: 'Studying diaries or daily journals that managers kept over a period',
      d: 'Giving workers checklists to indicate which tasks are performed'
    },
    correct: 'b',
    explanation: 'Exit interviews are conducted with departing personnel to analyze turnover reasons and organizational culture, not to formulate standard job analysis data.',
    urdu_answer: 'ملازمت چھوڑ کر جانے والے ملازمین کے ایگزٹ انٹرویوز جاب اینالیسس کا طریقہ نہیں ہیں، بلکہ یہ استعفوں کی وجوہات جاننے کے لیے ہوتے ہیں۔'
  },
  {
    stem: 'Which quantitative technique rates a job on data, people, and things and identifies performance standards and training requirements?',
    options: {
      a: 'Position Analysis Questionnaire (PAQ)',
      b: 'Department of Labor Procedure (DOL)',
      c: 'Functional Job Analysis (FJA)',
      d: 'Critical Incident Technique'
    },
    correct: 'c',
    explanation: 'Functional Job Analysis (FJA) expands on the DOL framework by evaluating Data, People, and Things, and explicitly incorporating performance standards and training requirements.',
    urdu_answer: 'فنکشنل جاب اینالیسس (FJA) وہ مقداری تکنیک ہے جو ڈیٹا، افراد اور اشیاء کی بنیاد پر جاب کو جانچنے کے ساتھ ساتھ کارکردگی کے معیارات اور تربیتی ضروریات کا تعین کرتی ہے۔'
  },
  {
    stem: 'What is the main limitation of using the Participant Diary / Log method in job analysis?',
    options: {
      a: 'It requires specialized statistical software',
      b: 'Employees may try to exaggerate some activities and underplay others',
      c: 'It cannot be applied to non-managerial employees',
      d: 'It is illegal under labor laws'
    },
    correct: 'b',
    explanation: 'The chief drawback of employee logs is reporting bias: incumbents may exaggerate high-level tasks to justify higher salaries or under-report non-productive downtime.',
    urdu_answer: 'ڈائری / لاگ طریقے کی سب سے بڑی خامی یہ ہے کہ ملازمین اہم کاموں کو بڑھا چڑھا کر بیان کر سکتے ہیں اور غیر پیداواری وقت کو چھپا سکتے ہیں۔'
  },
  {
    stem: 'As an HR manager, after you have collected and reviewed the information/data related to a particular job while conducting job analysis, what will be your next step?',
    options: {
      a: 'Maintaining and updating the jobs',
      b: 'Identify objectives of job analysis',
      c: 'Review and verify the job analysis information with workers/supervisors',
      d: 'Draft job description & job specification'
    },
    correct: 'd',
    explanation: 'Once job information has been collected, reviewed, and verified, the primary operational milestone is drafting the official Job Description and Job Specification documents.',
    urdu_answer: 'جاب اینالیسس کی معلومات کا جائزہ اور تصدیق کرنے کے بعد اگلا مرحلہ جاب ڈسکرپشن اور جاب اسپیسیفیکیشن تیار کرنا ہوتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for MGT501 Lecture 11.`);

// 5 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Enlist and briefly define the primary methods used for collecting Job Analysis information.',
    correct: `<p><strong>Primary Job Analysis Data Collection Methods (MGT501 Lesson 11):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Interviews:</strong> Structured or unstructured one-on-one, group, or supervisor sessions to probe deeply into job responsibilities, workflows, and conditions.</li>
  <li><strong>Questionnaires:</strong> Standardized rating scales or open-ended forms distributed to a large number of incumbents for quick, cost-effective data gathering.</li>
  <li><strong>Direct Observation:</strong> The analyst visually observes workers executing their tasks, taking notes on activities, physical movements, equipment used, and work conditions.</li>
  <li><strong>Participant Diaries / Logs:</strong> Daily chronological records maintained by employees detailing every activity and time expended over a multi-week period.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Pages 68–70).',
    urdu_answer: 'جاب اینالیسس معلومات اکٹھی کرنے کے چار بنیادی طریقے ہیں: انٹرویوز، سوالنامے (Questionnaires)، براہِ راست مشاہدہ (Observation)، اور ملازمین کی روزانہ کی ڈائریاں (Diaries/Logs)۔'
  },
  {
    stem: 'What is the Observation Method in Job Analysis? For what type of jobs is it most suitable, and what are its main limitations?',
    correct: `<p><strong>1. Observation Method:</strong> Direct visual tracking and documentation of an employee at work by a trained job analyst without interfering in the workflow.</p>
<p><strong>2. Suitable Jobs:</strong> Most effective for manual, standardized, short-cycle, and repetitive physical jobs (e.g., machine operators, assembly line workers, hospital orderlies).</p>
<p><strong>3. Limitations:</strong></p>
<ul>
  <li>Unsuitable for cognitive, creative, or managerial jobs where work consists of mental processing, planning, and decision-making.</li>
  <li>Hawthorne Effect / Observer Effect: Employees may alter normal behavior or work artificially faster/slower while being watched.</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Page 69).',
    urdu_answer: 'مشاہداتی طریقہ دستی اور بار بار دہرائے جانے والے کاموں (جیسے اسمبلی لائن) کے لیے بہترین ہے، مگر ذہنی اور مینیجرئیل کاموں کے لیے غیر موزوں ہے کیونکہ دماغی سوچ کو دیکھا نہیں جا سکتا۔ نیز ملازم کیمرے یا نگران کے سامنے مصنوعی رویہ اختیار کر سکتا ہے۔'
  },
  {
    stem: 'Differentiate between Position Analysis Questionnaire (PAQ) and Functional Job Analysis (FJA).',
    correct: `<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Feature</th>
      <th class="p-2 border">Position Analysis Questionnaire (PAQ)</th>
      <th class="p-2 border">Functional Job Analysis (FJA)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Nature</td>
      <td class="p-2 border">Standardized behavioral questionnaire consisting of 194 job elements organized into 6 basic divisions.</td>
      <td class="p-2 border">Worker-oriented quantitative approach developed by the US Department of Labor.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Focus / Dimensions</td>
      <td class="p-2 border">Evaluates how information is received, mental processes, physical output, relationships, and job context.</td>
      <td class="p-2 border">Rates jobs across three broad functional hierarchies: <strong>Data</strong>, <strong>People</strong>, and <strong>Things</strong>.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Outcomes</td>
      <td class="p-2 border">Generates quantitative scores comparing job complexity and assisting in wage comparison.</td>
      <td class="p-2 border">Specifies what worker does, performance standards, and explicit training requirements.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Page 70).',
    urdu_answer: 'پی اے کیو (PAQ) 194 عناصر پر مشتمل ایک جامع سوالنامہ ہے جو ملازم کے رویوں اور ماحول کو ناپتا ہے، جبکہ ایف جے اے (FJA) کام کو ڈیٹا، افراد اور اشیاء کی درجہ بندی میں تقسیم کر کے کارکردگی کے معیارات اور تربیت کا تعین کرتا ہے۔'
  },
  {
    stem: 'What is the Participant Diary / Log method in job analysis? State one major advantage and one major drawback of this method.',
    correct: `<p><strong>Definition:</strong> In the Diary/Log method, job incumbents maintain a chronological daily logbook recording every task performed, equipment used, and duration of activities over a period of several days or weeks (MGT501 Lesson 11).</p>
<p><strong>Major Advantage:</strong> Extremely useful for analyzing complex, non-repetitive, or professional jobs (such as executives, doctors, engineers) whose tasks vary widely day-to-day and cannot easily be captured by a one-time observation.</p>
<p><strong>Major Drawback:</strong> High risk of subjective bias and employee resistance; incumbents often view daily record-keeping as a tedious burden, and may exaggerate productive tasks while omitting interruptions and leisure time.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Page 70).',
    urdu_answer: 'پارٹیسیپنٹ ڈائری طریقہ ملازم کو اپنے روزانہ کے کاموں کا وقت کے ساتھ اندراج کرنے کا کہتا ہے۔ اس کا فائدہ یہ ہے کہ یہ پیچیدہ اور متنوع کاموں کا احاطہ کرتا ہے، مگر نقصان یہ ہے کہ ملازم کے مبالغہ آرائی کرنے کا امکان ہوتا ہے۔'
  },
  {
    stem: 'List the sequential steps involved in conducting a systematic Job Analysis process.',
    correct: `<p><strong>Key Steps in the Job Analysis Process (MGT501 Lesson 11):</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Identify the Purpose and Uses:</strong> Determine how the collected information will be used (e.g., compensation, selection, training).</li>
  <li><strong>Obtain Top Management Support:</strong> Secure executive sponsorship and communicate goals to staff to alleviate anxiety.</li>
  <li><strong>Review Background Information:</strong> Examine organization charts, workflow diagrams, and existing job descriptions.</li>
  <li><strong>Select Representative Positions:</strong> Choose a sample of jobs to analyze when analyzing hundreds of identical roles.</li>
  <li><strong>Collect Job Data:</strong> Gather information using interviews, questionnaires, observations, or logs.</li>
  <li><strong>Review and Verify Data:</strong> Validate findings with incumbents and direct supervisors to confirm accuracy.</li>
  <li><strong>Develop Job Description and Job Specification:</strong> Draft the final official documentation.</li>
</ol>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Page 68).',
    urdu_answer: 'جاب اینالیسس کے مراحل: مقصد کا تعین، اعلیٰ مینجمنٹ کی اجازت، تنظیمی پس منظر کا جائزہ، نمائندہ جابز کا انتخاب، ڈیٹا اکٹھا کرنا، ملازمین اور سپروائزر سے تصدیق، اور آخر میں جاب ڈسکرپشن اور اسپیسیفیکیشن کی تیاری۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for MGT501 Lecture 11.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `Detail the steps involved in conducting a systematic Job Analysis process. Explain why obtaining top management support and verifying information with workers/supervisors is crucial.`,
    correct: `<p><strong>1. Step-by-Step Job Analysis Framework (MGT501 Lesson 11):</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Clarify Organizational Objectives:</strong> Determine the scope and target applications (compensation review, new job design, compliance).</li>
  <li><strong>Secure Leadership Sponsorship:</strong> Visible commitment from senior management guarantees departmental cooperation and budget allocation.</li>
  <li><strong>Collect and Examine Background Materials:</strong> Review existing organizational charts, process flowcharts, standard operating procedures (SOPs), and previous specifications.</li>
  <li><strong>Identify Representative Jobs:</strong> In large corporations with hundreds of identical operators, select representative job samples to minimize operational disruption.</li>
  <li><strong>Execute Data Gathering:</strong> Utilize appropriate combinations of structured questionnaires, interviews, on-site observations, and employee diaries.</li>
  <li><strong>Review and Verify Data with Incumbents and Supervisors:</strong> Conduct formal review sessions to ensure no critical duty is misrepresented or omitted.</li>
  <li><strong>Draft and Maintain Documentation:</strong> Formulate the official Job Description and Job Specification, establishing periodic review cycles for dynamic markets.</li>
</ol>
<p><strong>2. Why Management Support and Worker Verification are Crucial:</strong></p>
<ul>
  <li><strong>Top Management Support:</strong> Without leadership backing, employees may suspect job analysis is a disguised headcount reduction or pay cut exercise, resulting in passive resistance, uncooperative attitudes, or deliberately distorted answers.</li>
  <li><strong>Worker and Supervisor Verification:</strong> Incumbents provide actual ground reality of daily tasks, while supervisors provide perspective on organizational expectations and quality standards. Reviewing the findings together eliminates personal bias, prevents errors, and secures stakeholder buy-in.</li>
</ul>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Pages 68–70).',
    urdu_answer: 'جاب اینالیسس کا باقاعدہ فریم ورک مقصد کے تعین سے شروع ہو کر اعلیٰ مینجمنٹ کی حمایت، پس منظر کے جائزے، نمونے کے انتخاب، ڈیٹا کلیکشن، تصدیق اور جاب ڈسکرپشن کی ڈرافٹنگ پر مشتمل ہوتا ہے۔ مینجمنٹ کی حمایت خوف دور کرنے کے لیے اور ملازمین سے تصدیق حقیقت پسندی یقینی بنانے کے لیے لازمی ہے۔'
  },
  {
    stem: `While analyzing clerical and administrative jobs, is there only one best method that can be used to conduct job analysis, or is it more appropriate to use a combination of methods? Give logical arguments to prove your stance.`,
    correct: `<p><strong>Stance:</strong> There is <em>no single universally superior method</em> for analyzing clerical and administrative positions; utilizing a <strong>multi-method combination</strong> is significantly more effective, accurate, and defensible.</p>
<p><strong>Nature of Clerical and Administrative Work:</strong></p>
<p>Administrative roles are hybrid positions. They consist of visible physical tasks (filing, data entry, scanning, greeting visitors) combined with invisible cognitive tasks (prioritizing correspondence, resolving billing discrepancies, scheduling conflicting meetings, managing confidential records).</p>
<p><strong>Why a Single Method Fails:</strong></p>
<ul>
  <li><strong>Observation Alone:</strong> Can see a clerk typing or answering a phone, but cannot observe the mental logic used to resolve customer disputes or verify ledger entries.</li>
  <li><strong>Interview Alone:</strong> Highly thorough, but extremely time-consuming and vulnerable to incumbent exaggeration or memory lapses regarding routine micro-tasks.</li>
  <li><strong>Questionnaire Alone:</strong> Gathers quick standardized responses from many clerks, but lacks depth and flexibility to clarify ambiguous answers.</li>
</ul>
<p><strong>The Superiority of a Combination Approach:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Broad Coverage via Structured Questionnaire:</strong> Distribute a standardized questionnaire to all administrative clerks to efficiently collect core duty frequencies and software tools used.</li>
  <li><strong>Contextual Observation:</strong> Spend a short period observing daily office routines to understand physical ergonomics, interruptions, and actual working environments.</li>
  <li><strong>Follow-Up Targeted Interviews:</strong> Conduct brief interviews with select senior clerks and office managers to clarify discrepancies, understand problem-solving demands, and establish qualification benchmarks.</li>
</ol>
<p><strong>Conclusion:</strong> Triangulating data through questionnaires, observation, and interviews neutralizes the limitations of any individual technique, producing a robust, legally defensible, and comprehensive job description.</p>`,
    explanation: 'Reference: MGT501 Handouts (Lesson 11, Pages 68–70).',
    urdu_answer: 'کلیریکل اور ایڈمنسٹریٹو کاموں میں جسمانی کاموں (ٹائپنگ، فائلنگ) کے ساتھ ذہنی فیصلے بھی شامل ہوتے ہیں، اس لیے صرف ایک طریقہ کافی نہیں ہو سکتا۔ سوالنامے کے ذریعے بڑا ڈیٹا لیا جائے، مشاہدے سے ماحول دیکھا جائے اور انٹرویو سے پوشیدہ فیصلے سمجھے جائیں۔ یہ امتزاج (Combination) ہی سب سے درست نتائج دیتا ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for MGT501 Lecture 11.`);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for MGT501 Lecture 11 in local DB: ${total.c}`);

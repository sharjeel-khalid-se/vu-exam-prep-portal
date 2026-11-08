import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS101
const cs101 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs101'").get();
if (!cs101) {
  console.error('CS101 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 17
let lec17 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 17").get(cs101.id);
if (!lec17) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 17, 'Software Engineering, SDLC Phases, Waterfall Model, and Team Roles')
  `).run(cs101.id);
  lec17 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 17 with ID: ${lec17.id}`);
} else {
  console.log(`CS101 Lecture 17 found with ID: ${lec17.id}`);
}

const lId = lec17.id;

// 3. Clear existing questions for Lecture 17 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 17.`);

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

// 12 MCQs
const mcqs = [
  {
    stem: 'The classic Waterfall software development methodology is classified as a ____________ life-cycle model because each phase flows strictly into the next without overlapping.',
    options: {
      a: 'Spiral',
      b: 'Sequential (Linear)',
      c: 'Circular',
      d: 'Spherical'
    },
    correct: 'b',
    explanation: '<p>The <strong>Waterfall Model</strong> is a <em>sequential (linear)</em> software development process where progress flows steadily downwards through distinct phases (like a waterfall).</p><p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> Page 34 Q6.</p>',
    urdu_answer: 'واٹرفال ماڈل ایک لکیری اور ترتیب وار (Sequential) ماڈل ہے جس میں ہر مرحلہ مکمل ہونے کے بعد اگلا مرحلہ شروع ہوتا ہے۔'
  },
  {
    stem: 'Formulating a detailed technical plan that specifies the required software/hardware resources, milestones, and expected system deliverables is conducted during which SDLC phase?',
    options: {
      a: 'Feasibility Study',
      b: 'User Requirements Gathering',
      c: 'Design Phase',
      d: 'Developer Specification Phase'
    },
    correct: 'd',
    explanation: '<p>The <strong>Developer Specification</strong> phase translates business needs into engineering deliverables, resource allocations, timelines, and formal architectural constraints.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 136 and <code>Cs101-latest -solved-midterm paper 10.pdf</code> Q3.</p>',
    urdu_answer: 'ڈویلپر اسپیسیفکیشن (Developer Specification) کے مرحلے میں مطلوبہ وسائل، ورکنگ پلان اور ڈیلیوری ایبلز کا تفصیلی تکنیکی منصوبہ تیار کیا جاتا ہے۔'
  },
  {
    stem: 'In which phase of the software life cycle does the developer decompose the overarching problem into cohesive subsystems and establish their interrelationships?',
    options: {
      a: 'Detailed Code Implementation',
      b: 'Integration Testing',
      c: 'Design Phase',
      d: 'Decommissioning'
    },
    correct: 'c',
    explanation: '<p>During the <strong>Design Phase</strong>, engineers create the system architecture by decomposing the overall problem into modular subsystems, classes, interfaces, and database schemas.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 137 and <code>Cs101-latest -solved-midterm paper 10.pdf</code> Q24.</p>',
    urdu_answer: 'ڈیزائن (Design) کے مرحلے میں ڈویلپر پورے مسئلے کو چھوٹے ذیلی سسٹمز (Subsystems) میں تقسیم کرتا ہے اور ان کے باہمی تعلقات کی ساخت طے کرتا ہے۔'
  },
  {
    stem: 'The preliminary technical and financial exploration of possible software solutions, development platforms, and external suppliers is known as a:',
    options: {
      a: 'Viability Audit',
      b: 'Feasibility Study',
      c: 'Detailed Specification',
      d: 'System Integration'
    },
    correct: 'b',
    explanation: '<p>A <strong>Feasibility Study</strong> evaluates whether a proposed software project is economically viable, technically practical, and operationally achievable before committing significant capital.</p><p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> Page 7 Q6.</p>',
    urdu_answer: 'کسی بھی پروجیکٹ کے تکنیکی، مالیاتی اور آپریشنل امکانات کی ابتدائی جانچ پڑتال کو فزیبلٹی اسٹڈی (Feasibility Study) کہا جاتا ہے۔'
  },
  {
    stem: 'The quality assurance process that confirms whether a software system correctly and accurately implements its specific engineering specifications is known as:',
    options: {
      a: 'Requirements Gathering',
      b: 'Verification ("Are we building the product right?")',
      c: 'Validation ("Are we building the right product?")',
      d: 'Software Modularity'
    },
    correct: 'b',
    explanation: '<p><strong>Verification</strong> evaluates intermediate development work products to ensure they meet specified requirements ("Are we building the product right?"). Validation ensures the finished software fulfills customer intent.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 Grand Quiz For Mid Term Prepration by VU Stars.pdf</code> Q26 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q109.</p>',
    urdu_answer: 'ویریفیکیشن (Verification) سے مراد یہ جانچنا ہے کہ آیا سافٹ ویئر اپنے تکنیکی تقاضوں اور دستاویزات کے عین مطابق بنایا جا رہا ہے یا نہیں۔'
  },
  {
    stem: 'The complete lifespan of a software system formally begins with the ____________ phase and concludes with ____________.',
    options: {
      a: 'Detailed Design, Code Compilation',
      b: 'Initial Concept, Decommissioning (Retirement)',
      c: 'Unit Coding, Integration Testing',
      d: 'User Manual Writing, Software Deployment'
    },
    correct: 'b',
    explanation: '<p>The total Software Life Cycle begins at the initial <strong>Concept/Vision</strong> and terminates when the obsolete system is permanently retired and phased out during <strong>Decommissioning</strong>.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM FILE 6 SOLVED BY TEAM HADI.pdf</code> Q6.</p>',
    urdu_answer: 'سافٹ ویئر کا مکمل لائف سائیکل ابتدائی تصور (Concept) سے شروع ہو کر اس کے ریٹائر ہونے اور ختم کیے جانے (Decommissioning) پر مکمل ہوتا ہے۔'
  },
  {
    stem: 'The formal set of rules, conventions, and engineering guidelines that a development team follows to systematically construct complex software systems is termed a:',
    options: {
      a: 'Design Methodology',
      b: 'Programming Language Grammar',
      c: 'Operating System Shell',
      d: 'Software License Agreement'
    },
    correct: 'a',
    explanation: '<p>A <strong>Design Methodology</strong> (e.g., Object-Oriented Design, Structured Analysis) provides standard architectural patterns and practices for constructing robust software.</p><p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> Page 34 Q5.</p>',
    urdu_answer: 'ڈیزائن میتھوڈولوجی (Design Methodology) سے مراد وہ اصول اور ہدایات ہیں جن پر عمل کرتے ہوئے ڈویلپرز کی ٹیم پیچیدہ سافٹ ویئر سسٹمز تیار کرتی ہے۔'
  },
  {
    stem: 'In a professional software development organization, which key leadership role sits in the Executive/Management tier responsible for tracking project budget, milestones, and client communication?',
    options: {
      a: 'Project Manager',
      b: 'Junior Code Tester',
      c: 'Front-End Programmer',
      d: 'Database Administrator'
    },
    correct: 'a',
    explanation: '<p>The <strong>Project Manager</strong> operates in the executive/management tier, overseeing scheduling, budget, scope, staffing, risk management, and client liaison.</p><p><strong>Reference:</strong> Appeared 6+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 90 & 101 Q10.</p>',
    urdu_answer: 'ایگزیکٹو یا مینجمنٹ ٹیم میں پروجیکٹ منیجر (Project Manager) کلیدی کردار ادا کرتا ہے جو بجٹ، شیڈول اور وسائل کا ذمہ دار ہوتا ہے۔'
  },
  {
    stem: 'Module-level algorithmic design, writing individual source code files, and performing unit testing on single functions is primarily the direct responsibility of the:',
    options: {
      a: 'Executive Sponsor',
      b: 'Developer (Programmer)',
      c: 'HR Recruiter',
      d: 'Sales Representative'
    },
    correct: 'b',
    explanation: '<p>The <strong>Developer</strong> is directly responsible for translating subsystem designs into concrete code statements and verifying individual modules via unit tests.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 90 & 101 Q11.</p>',
    urdu_answer: 'ماڈیول کی سطح پر پروگرامنگ کرنا، کوڈ لکھنا اور یونٹ ٹیسٹنگ کرنا بنیادی طور پر ڈویلپر (پروگرامر) کی براہ راست ذمہ داری ہے۔'
  },
  {
    stem: 'Which specialized team holds direct engineering ownership of a software product immediately following the completion of the specification stage until its final delivery?',
    options: {
      a: 'Human Resources Team',
      b: 'Accounting Team',
      c: 'Development Team',
      d: 'Marketing Agency'
    },
    correct: 'c',
    explanation: '<p>The <strong>Development Team</strong> executes the technical lifecycle of the product from architectural design and coding through integration and initial deployment.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 90 & 101 Q12.</p>',
    urdu_answer: 'ڈویلپمنٹ ٹیم اسپیسیفکیشن کا مرحلہ مکمل ہونے کے بعد کوڈنگ، انٹیگریشن اور ڈیلیوری تک مکمل پروجیکٹ کی تکنیکی ذمہ دار ہوتی ہے۔'
  },
  {
    stem: 'During the Integration and System Testing phase of the software development life cycle, the engineering team:',
    options: {
      a: 'Interviews non-technical clients to draft marketing brochures',
      b: 'Brings independently constructed modules together into a unified system and tests their interfaces',
      c: 'Physically decommissions the server hardware',
      d: 'Calculates the financial return on investment (ROI)'
    },
    correct: 'b',
    explanation: '<p>In the <strong>Integration and Testing</strong> phase, distinct sub-modules written by different developers are compiled together to test interface compatibility and overall system behavior.</p><p><strong>Reference:</strong> Appeared in <code>CS101 Mid Term Paper.pdf</code> Page 2 Q2.</p>',
    urdu_answer: 'انٹیگریشن اور ٹیسٹنگ کے مرحلے میں الگ الگ بنائے گئے ماڈیولز کو اکٹھا کر کے مکمل سسٹم تشکیل دیا جاتا ہے اور ان کے باہمی روابط کی جانچ کی جاتی ہے۔'
  },
  {
    stem: 'The evaluation process that assesses whether the completed software product satisfies the actual operational requirements and real-world expectations of the end-user is termed:',
    options: {
      a: 'Software Verification',
      b: 'Software Validation ("Are we building the right product?")',
      c: 'Code Syntax Checking',
      d: 'Static Source Profiling'
    },
    correct: 'b',
    explanation: '<p><strong>Validation</strong> determines whether the finished software fulfills its intended business purpose and meets user expectations ("Are we building the right product?").</p><p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q110.</p>',
    urdu_answer: 'ویلیڈیشن (Validation) اس بات کی تصدیق کرتی ہے کہ کیا بنایا گیا سافٹ ویئر صارف کی اصل ضروریات اور توقعات کو پورا کر رہا ہے یا نہیں ("Are we building the right product?")۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is meant by the Software Life Cycle? Summarize its significance in modern engineering.',
    correct: `<p>The <strong>Software Life Cycle</strong> (also termed Software Development Life Cycle or SDLC) is the structured sequence of stages that a software system undergoes from its initial conceptualization through retirement.</p>
<h4>Significance:</h4>
<ul>
  <li><strong>Quality Assurance:</strong> Enforces disciplined engineering practices to eliminate defects early, when they are cheapest to resolve.</li>
  <li><strong>Predictability & Control:</strong> Provides structured milestones, budget tracking, and measurable deliverables for project managers and clients.</li>
  <li><strong>Maintainability:</strong> Ensures adequate documentation and clean architectural design, allowing systems to evolve over decades.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 22) and <code>CS101Introduction_to_Computing_Mid_term_Solved_2010_All_in_One_File.pdf</code>.</p>',
    urdu_answer: 'سافٹ ویئر لائف سائیکل سے مراد وہ تمام منظم مراحل ہیں جن سے کوئی بھی سافٹ ویئر اپنے ابتدائی تصور (Concept) سے لے کر ختم ہونے (Decommissioning) تک گزرتا ہے۔ یہ سافٹ ویئر کے معیار، بروقت تکمیل اور مستقبل میں اس کی دیکھ بھال (Maintenance) کو یقینی بناتا ہے۔'
  },
  {
    stem: 'Differentiate clearly between Software Verification and Software Validation with their classic definitions.',
    correct: `<p>The difference between <strong>Verification</strong> and <strong>Validation</strong> represents two distinct dimensions of software quality assurance:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Dimension</th>
      <th>Software Verification</th>
      <th>Software Validation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Core Question</strong></td>
      <td><em>"Are we building the product right?"</em></td>
      <td><em>"Are we building the right product?"</em></td>
    </tr>
    <tr>
      <td><strong>Focus</strong></td>
      <td>Conformance to technical specifications, architecture diagrams, and design rules.</td>
      <td>Fitness for user purpose, customer satisfaction, and business requirement fulfillment.</td>
    </tr>
    <tr>
      <td><strong>Techniques</strong></td>
      <td>Code walkthroughs, static analysis, unit testing, and design reviews.</td>
      <td>Acceptance testing, user trial runs, and black-box operational testing.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> (Q109, Q110) and <code>CS101 Grand Quiz For Mid Term Prepration by VU Stars.pdf</code> (Q26).</p>',
    urdu_answer: 'ویریفیکیشن (Verification) کا مطلب یہ جانچنا ہے کہ کیا پروڈکٹ درست طریقے سے بنائی جا رہی ہے ("Are we building the product right?") یعنی تکنیکی تقاضوں کے مطابق۔ جبکہ ویلیڈیشن (Validation) کا مطلب ہے کہ کیا ہم صحیح پروڈکٹ بنا رہے ہیں ("Are we building the right product?") یعنی صارف کی حقیقی ضروریات کے مطابق۔'
  },
  {
    stem: 'What is the Waterfall Model in software engineering, and why is it categorized as a strictly sequential model?',
    correct: `<p>The <strong>Waterfall Model</strong> (introduced by Winston Royce in 1970) is a linear-sequential software development lifecycle framework.</p>
<h4>Why it is Categorized as Sequential:</h4>
<ul>
  <li><strong>Downwards Progression:</strong> Development progresses strictly one phase at a time (Requirements &rarr; Design &rarr; Implementation &rarr; Testing &rarr; Deployment).</li>
  <li><strong>Phase Sign-Off:</strong> A phase must be 100% completed, reviewed, and signed off with approved documentation before the next phase is allowed to commence.</li>
  <li><strong>No Overlap:</strong> There is virtually no concurrent overlap between phases, making it simple to manage but highly rigid to mid-project requirement changes.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> (Page 34, Q6).</p>',
    urdu_answer: 'واٹرفال ماڈل سافٹ ویئر انجینئرنگ کا ایک لکیری (Linear) فریم ورک ہے جس میں کام آبشار کی طرح اوپر سے نیچے کی طرف بہتا ہے۔ اسے سیکوئنشل اس لیے کہا جاتا ہے کیونکہ جب تک ایک مرحلہ (جیسے ریکوائرمنٹس) مکمل ہو کر منظور نہ ہو جائے، اگلا مرحلہ (جیسے ڈیزائن یا کوڈنگ) شروع نہیں ہو سکتا۔'
  },
  {
    stem: 'Which two phases of the Software Life Cycle are historically the most critical, costly, and effort-consuming? Justify your answer.',
    correct: `<p>Empirical software engineering data demonstrates that the two most critical and effort-consuming phases are:</p>
<ol>
  <li><strong>Requirements Analysis & Specification:</strong> A defect or misunderstanding during requirements gathering that goes undetected costs up to 100 times more to fix once the software is deployed. Clear requirements prevent building the wrong system.</li>
  <li><strong>Operation & Maintenance:</strong> Typically accounts for <strong>60% to 80%</strong> of the total lifecycle budget of commercial software. Long after initial coding ends, systems require ongoing bug fixes, security patches, OS upgrades, and new feature extensions over 10 to 20 years.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 22, Session 4) and <code>CS101Introduction_to_Computing_Mid_term_Solved_2010_All_in_One_File.pdf</code>.</p>',
    urdu_answer: 'سافٹ ویئر لائف سائیکل میں سب سے زیادہ وقت اور بجٹ طلب کرنے والے دو مراحل یہ ہیں: (1) ریکوائرمنٹس فیز، کیونکہ اگر شروع میں غلطی رہ جائے تو بعد میں اسے درست کرنا 100 گنا مہنگا پڑتا ہے؛ اور (2) مینٹیننس فیز، جو کہ سافٹ ویئر کے کل بجٹ کا 60 سے 80 فیصد حصہ لیتی ہے کیونکہ سالہا سال تک بگ فکسز اور اپ ڈیٹس جاری رہتے ہیں۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Explain the major phases of the Software Development Life Cycle (SDLC) from Concept to Decommissioning in chronological order.',
    correct: `<p>A comprehensive Software Development Life Cycle encompasses seven standardized chronological phases:</p>

<ol>
  <li><strong>Concept & Feasibility:</strong> Defining the core business vision, exploring technical alternatives, estimating costs, and establishing economic/operational feasibility.</li>
  <li><strong>User Requirements:</strong> Directly engaging end-users and stakeholders to document functional demands (what the software must achieve) in a formal User Requirements Document (URD).</li>
  <li><strong>Developer Specifications:</strong> Engineering translation of user requirements into precise technical specifications, deliverables, resource allocations, and architectural constraints.</li>
  <li><strong>Design:</strong> Decomposing the system into subsystems, modules, data models, and database schemas; defining algorithms, interfaces, and communications protocols.</li>
  <li><strong>Implementation (Coding):</strong> Programmers write clean, commented source code in chosen programming languages and conduct module-level unit testing.</li>
  <li><strong>Integration & Testing:</strong> Assembling individual modules into a complete system and conducting interface testing, stress testing, security audits, and User Acceptance Testing (UAT).</li>
  <li><strong>Operation, Maintenance & Decommissioning:</strong> Deploying the software into production, maintaining ongoing bug fixes and feature enhancements, and ultimately retiring/decommissioning the legacy software when replaced.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Q22), <code>CS101 MIDTERM FILE 6 SOLVED BY TEAM HADI.pdf</code> (Q6), and <code>cs101 midterm subjective by moaaz.pdf</code> (Q40).</p>',
    urdu_answer: 'سافٹ ویئر ڈویلپمنٹ لائف سائیکل کے سات اہم مراحل ہیں: (1) تصور اور فزیبلٹی، (2) یوزر ریکوائرمنٹس، (3) ڈویلپر اسپیسیفکیشنز، (4) آرکیٹیکچرل ڈیزائن، (5) امپلیمینٹیشن اور کوڈنگ، (6) انٹیگریشن اور ٹیسٹنگ، اور (7) آپریشن، مینٹیننس اور ڈی کمیشننگ (ریٹائرمنٹ)۔'
  },
  {
    stem: 'Detail the primary responsibilities of the following software team roles during an enterprise project:\n1. Executive Team / Project Manager\n2. Developer (Programmer)\n3. Quality Assurance & Support Team',
    correct: `<p>Modern software engineering requires collaborative interdisciplinary teams with clearly defined boundaries of responsibility:</p>

<h4>1. Executive Team / Project Manager:</h4>
<ul>
  <li>Defines high-level project vision, secures capital funding, and negotiates contractual scopes with clients.</li>
  <li>Establishes development schedules, milestones, resource assignments, and contingency budgets.</li>
  <li>Acts as the primary communication bridge between technical engineers and executive stakeholders.</li>
</ul>

<h4>2. Developer (Programmer):</h4>
<ul>
  <li>Conducts detailed module-level algorithmic design based on system architecture documentation.</li>
  <li>Writes, optimizes, and documents high-quality maintainable source code.</li>
  <li>Conducts rigorous unit tests on individual methods/classes before submitting code to repository branches.</li>
</ul>

<h4>3. Quality Assurance (QA) & Support Team:</h4>
<ul>
  <li>Designs automated test suites, integration test plans, and verifies edge-case scenarios.</li>
  <li>Performs regression testing, security scanning, and usability testing to validate client satisfaction.</li>
  <li>Provides post-deployment customer technical support, logs production bug reports, and assists during operational maintenance.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz.pdf</code> (Question No. 40, 10 Marks) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 90).</p>',
    urdu_answer: 'سافٹ ویئر ٹیم کے اہم کردار: (1) پروجیکٹ منیجر بجٹ، شیڈول، وسائل کی تقسیم اور کلائنٹ سے رابطے کا ذمہ دار ہوتا ہے۔ (2) ڈویلپر تفصیلی ڈیزائن کو کوڈ میں تبدیل کرتا ہے اور یونٹ ٹیسٹنگ کرتا ہے۔ (3) کوالٹی ایشورنس اور سپورٹ ٹیم پورے سسٹم کی ٹیسٹنگ، بگز کی نشاندہی، سیکیورٹی آڈٹ اور ریلیز کے بعد صارفین کی رہنمائی اور مدد کی ذمہ دار ہوتی ہے۔'
  }
];

// 4. Insert All Questions
console.log('Inserting MCQs...');
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Short Questions...');
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Long Questions...');
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

// 5. Verification
const countLec = db.prepare('SELECT COUNT(*) as cnt FROM questions WHERE lecture_id = ?').get(lId);
const countTotal = db.prepare('SELECT COUNT(*) as cnt FROM questions').get();
const totalLectures = db.prepare('SELECT COUNT(*) as cnt FROM lectures').get();
const totalSubjects = db.prepare('SELECT COUNT(*) as cnt FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS101 Lecture 17 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

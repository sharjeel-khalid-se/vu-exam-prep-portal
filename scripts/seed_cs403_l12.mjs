import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS403
const cs403 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs403'").get();
if (!cs403) {
  console.error('CS403 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(cs403.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Case Study: Examination System Analysis, DFDs & Conceptual Design')
  `).run(cs403.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`CS403 Lecture 12 found with ID: ${lec12.id}`);
}

// 3. Clear existing questions for Lecture 12 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec12.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 12.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'In logical database design, which appropriate data model is chosen?',
    options: {
      a: 'Network Model',
      b: 'Hierarchical Model',
      c: 'Relational Data Model',
      d: 'Object-Oriented Model'
    },
    correct: 'c',
    explanation: 'During logical database design, the conceptual ER schema is mapped onto a specific data model supported by commercial DBMSs, predominantly the Relational Data Model (CS403 Handouts Page 110 / 118). Appeared 4 times in CS403 Handouts, Team Hadi (Q6), and MCS group (Q150).',
    urdu_answer: 'لاجیکل ڈیٹا بیس ڈیزائن میں بنیادی طور پر ریلیشنل ڈیٹا ماڈل (Relational Data Model) کا انتخاب کیا جاتا ہے۔'
  },
  {
    stem: 'In an Examination System DFD, the process responsible for validating prerequisite requirements before course enrollment is __________.',
    options: {
      a: 'Edit Form (1.0)',
      b: 'Check Pre-Req (2.0)',
      c: 'Collect Result (3.0)',
      d: 'Calculate GPA (6.0)'
    },
    correct: 'b',
    explanation: 'Process 2.0 (Check Pre-Req) checks previous semester academic records to confirm that all prerequisites for requested courses are fulfilled before registration is finalized (CS403 Handouts Page 112–113). Appeared 3 times.',
    urdu_answer: 'امتحانی نظام کے ڈی ایف ڈی میں پراسیس 2.0 (Check Pre-Req) انرولمنٹ سے قبل کورس کی پیشگی شرائط کی توثیق کرتا ہے۔'
  },
  {
    stem: 'In the Examination System case study, which process module calculates overall performance across all previous and current semesters?',
    options: {
      a: 'Calculate GP',
      b: 'Calculate GPA',
      c: 'Calculate CGPA',
      d: 'Update Result'
    },
    correct: 'c',
    explanation: 'Process 7.0 (Calculate CGPA) evaluates aggregate academic performance by computing Cumulative Grade Point Average using total grade points and total credit hours earned across all semesters (CS403 Handouts Page 114–115). Appeared 3 times.',
    urdu_answer: 'تمام سابقہ اور موجودہ سمیسٹرز کی مجموعی کارکردگی کا حساب کیلکولیٹ سی جی پی اے (Calculate CGPA) لگاتا ہے۔'
  },
  {
    stem: 'In a conceptual database model for a university/examination system, which of the following represents a valid composite identifier for a class grade?',
    options: {
      a: 'StudentID',
      b: 'StudentID, CourseID',
      c: 'StudentID, CourseID, SemesterID',
      d: 'Grade'
    },
    correct: 'b',
    explanation: 'A student receives a unique grade for each enrolled course, making the combination (StudentID, CourseID) a natural composite identifier to uniquely distinguish that student\'s grade in that subject (CS403 Solved MCQs by Moaaz, Session 4, Q3). Appeared 4 times.',
    urdu_answer: 'کسی طالبعلم کے مضمون کے گریڈ کے لیے (StudentID, CourseID) کا مجموعہ ایک قدرتی کمپوزٹ شناخت کنندہ ہے۔'
  },
  {
    stem: 'Which external entity interacts with the Examination System to submit assignments, quizzes, and sessional test marks?',
    options: {
      a: 'Student',
      b: 'Teacher',
      c: 'Controller of Examinations',
      d: 'Librarian'
    },
    correct: 'b',
    explanation: 'In the Examination System DFD, the Teacher external entity receives roll lists and feeds back student evaluation data, including assignments, quizzes, and exam scores (CS403 Handouts Page 112–113). Appeared 3 times.',
    urdu_answer: 'امتحانی نظام میں استاد (Teacher) وہ بیرونی اینٹیٹی ہے جو کوئز، اسائنمنٹس اور امتحانی نمبرات سسٹم میں داخل کرتی ہے۔'
  },
  {
    stem: 'The outcome of the analysis phase in a database development process represented through ER modeling is called __________.',
    options: {
      a: 'Physical Database Design',
      b: 'Conceptual Database Design',
      c: 'Logical Database Design',
      d: 'Internal Schema Design'
    },
    correct: 'b',
    explanation: 'The output of user requirements analysis synthesized into an Entity-Relationship (ER) diagram is known as the Conceptual Database Design (CS403 Handouts Page 118). Appeared 4 times in CS403 Handouts, Team Hadi, and EducationGator (Q2).',
    urdu_answer: 'تجزیاتی مرحلے کے اختتام پر ای آر ماڈل کے ذریعے بننے والے ڈیزائن کو کنسیپچوئل ڈیٹا بیس ڈیزائن (Conceptual Database Design) کہا جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Name the main external entities interacting with an Examination System in the case study.',
    correct: `<p>In the Examination System case study (CS403 Handouts Page 112–113), the primary <strong>External Entities</strong> interacting with the system boundaries are:</p>
<ol>
  <li><strong>Student:</strong> Submits registration forms, views course offerings, and receives grade notifications, term reports, and final transcripts.</li>
  <li><strong>Teacher:</strong> Receives course enrollment roll lists, conducts evaluations, and submits assignment, quiz, and examination award lists.</li>
  <li><strong>Controller of Examinations:</strong> Receives consolidated semester gazettes, statistical grade distributions, and oversees final transcript issuance.</li>
  <li><strong>Registration System:</strong> Transmits validated student biodata, admission records, and approved fee statuses to the examination department.</li>
</ol>`,
    explanation: 'Identifies system boundary interactors from CS403 Handouts Page 112–113.',
    urdu_answer: 'امتحانی نظام کی اہم بیرونی اینٹیٹیز یہ ہیں: طالب علم (Student)، استاد (Teacher)، ناظم امتحانات (Controller of Examinations)، اور رجسٹریشن سسٹم (Registration System)۔'
  },
  {
    stem: 'Briefly describe the process modules of the Level 0 DFD for the Examination System.',
    correct: `<p>The <strong>Level 0 Data Flow Diagram (DFD)</strong> for the Examination System decomposes processing into sequential modules (CS403 Handouts Page 112–115):</p>
<ul>
  <li><strong>Process 1.0 (Edit Form):</strong> Checks submitted registration forms for completeness, format validation, and correct course codes.</li>
  <li><strong>Process 2.0 (Check Pre-Req):</strong> Accesses student academic history to ensure all prerequisite courses have been successfully passed.</li>
  <li><strong>Process 3.0 (Collect Result):</strong> Receives and verifies sessional and terminal exam marks from teachers.</li>
  <li><strong>Process 4.0 &amp; 5.0 (Calculate &amp; Update GP):</strong> Computes Grade Points (GP) for individual enrolled subjects and updates the results data store.</li>
  <li><strong>Process 6.0 &amp; 7.0 (Calculate GPA &amp; CGPA):</strong> Calculates semester Grade Point Average (GPA) and Cumulative Grade Point Average (CGPA) across all completed semesters.</li>
  <li><strong>Process 8.0 (Generate Result):</strong> Produces official semester transcripts for students and consolidated gazettes for administration.</li>
</ul>`,
    explanation: 'Comprehensive overview of Level 0 DFD processes from CS403 Handouts Page 112–115.',
    urdu_answer: 'لیول 0 ڈی ایف ڈی میں پراسیس 1.0 فارم جانچتا ہے، 2.0 پیشگی کورسز کی تصدیق کرتا ہے، 3.0 نمبر اکٹھے کرتا ہے، 4.0 و 5.0 گریڈ پوائنٹس نکالتے ہیں، 6.0 و 7.0 جی پی اے اور سی جی پی اے بناتے ہیں اور 8.0 رزلٹ کارڈ جاری کرتا ہے۔'
  },
  {
    stem: 'Why must required system outputs be verified against the E-R Diagram after conceptual design?',
    correct: `<p><strong>Verification of Output Requirements Against the E-R Diagram (CS403 Handouts Page 123):</strong></p>
<p>During database design, every desired system output (such as academic transcripts, semester award lists, or faculty course assignments) relies on specific attributes and entity relationships.</p>
<ul>
  <li><strong>Completeness Check:</strong> It ensures that all data items required in output reports exist as attributes within entities or can be derived via defined relationships.</li>
  <li><strong>Navigational Integrity:</strong> It confirms that valid primary-to-foreign key association paths exist between entities to query and join the necessary information.</li>
  <li><strong>Early Error Detection:</strong> Discovering missing attributes or missing relationships at the conceptual ER stage is vastly cheaper and simpler than modifying normalized tables, indexes, or production application code later.</li>
</ul>`,
    explanation: 'Critical quality-assurance step in conceptual database design from CS403 Handouts Page 123.',
    urdu_answer: 'ای آر ڈایاگرام کی تصدیق اس لیے ضروری ہے تاکہ یہ یقینی بنایا جا سکے کہ درکار تمام رپورٹس اور رزلٹ کارڈز کے لیے ضروری ایٹریبیوٹس اور اینٹیٹیز کے تعلقات ماڈل میں موجود ہیں اور کوئی ڈیٹا غائب نہیں۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Explain the System Analysis and DFD Modeling of the Examination System Case Study.',
    correct: `<p><strong>System Analysis and DFD Modeling of Examination System:</strong></p>
<p>System analysis investigates organizational workflow and transforms business rules into structured Data Flow Diagrams (DFDs) (CS403 Handouts Page 110–116).</p>

<h4>1. Business Problem &amp; Workflow Overview:</h4>
<ul>
  <li>A university semester examination system handles student course registration, prerequisite validation, score entry, GPA/CGPA computation, and transcript generation.</li>
  <li>Key business rules dictate that students cannot register for advanced courses without clearing prerequisite courses, and results cannot be compiled until all course components (quizzes, assignments, exams) are submitted.</li>
</ul>

<h4>2. Context-Level DFD (Level 0 Overview):</h4>
<ul>
  <li>Shows the entire examination system as a single central process interacting with external entities: <code>STUDENT</code>, <code>TEACHER</code>, <code>CONTROLLER</code>, and <code>REGISTRATION_DEPT</code>.</li>
  <li>Defines the fundamental system inputs (registration forms, award lists) and outputs (result notifications, gazettes).</li>
</ul>

<h4>3. Detailed Level 0 DFD Architecture:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Process ID &amp; Name</th>
      <th class="p-2 border">Inputs</th>
      <th class="p-2 border">Outputs / Data Stores</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">1.0 Edit Form</td>
      <td class="p-2 border">Student Registration Form</td>
      <td class="p-2 border">Validated Registration Data</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">2.0 Check Pre-Req</td>
      <td class="p-2 border">Course choices + Student History DB</td>
      <td class="p-2 border">Enrolled Courses Record</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">3.0 Collect Result</td>
      <td class="p-2 border">Teacher Award Lists</td>
      <td class="p-2 border">Raw Marks Data Store</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">4.0 &amp; 5.0 Compute &amp; Update GP</td>
      <td class="p-2 border">Course Marks + Grading Policy DB</td>
      <td class="p-2 border">Subject Grade Points Updated</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">6.0 &amp; 7.0 GPA &amp; CGPA</td>
      <td class="p-2 border">Subject GPs + Credit Hours</td>
      <td class="p-2 border">Semester GPA &amp; Cumulative CGPA</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">8.0 Generate Result</td>
      <td class="p-2 border">Compiled Academic Records</td>
      <td class="p-2 border">Official Transcripts &amp; Gazettes</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'In-depth 5-mark subjective question covering system analysis, workflows, and DFD decomposition from CS403 Handouts Page 110–116.',
    urdu_answer: 'امتحانی نظام کے تجزیے اور ڈی ایف ڈی ماڈلنگ میں سمیسٹر سسٹم کے پورے ورک فلو (فارم رجسٹریشن، پیشگی شرائط، نمبروں کا اندراج، جی پی اے اور سی جی پی اے کا حساب اور رزلٹ کی تیاری) کو تفصیلاً بیان کیا گیا ہے۔'
  },
  {
    stem: 'Explain the transition from System Analysis (DFDs) to Conceptual (ERD) and Logical Database Design.',
    correct: `<p><strong>Transition from System Analysis to Conceptual and Logical Database Design:</strong></p>
<p>The transition from process modeling (DFDs) to data modeling (ERD and Relational Schemas) bridges functional requirements with physical database realization (CS403 Handouts Page 118–123).</p>

<h4>1. Phase 1: From DFDs to Conceptual Database Design (ERD):</h4>
<ul>
  <li><strong>Extracting Entities:</strong> Data stores in DFDs typically become candidate entities in the E-R diagram. Key entities identified include <code>STUDENT</code>, <code>COURSE</code>, <code>TEACHER</code>, <code>SEMESTER</code>, and <code>RESULT</code>.</li>
  <li><strong>Identifying Relationships &amp; Cardinalities:</strong>
    <ul>
      <li><code>STUDENT</code> to <code>COURSE</code>: Many-to-Many ($M:N$), resolved using associative entity <code>ENROLLMENT / RESULT</code>.</li>
      <li><code>TEACHER</code> to <code>COURSE</code>: One-to-Many ($1:N$).</li>
      <li><code>COURSE</code> to <code>COURSE</code>: Recursive relationship for prerequisites.</li>
    </ul>
  </li>
  <li><strong>Output Cross-Verification:</strong> Cross-checking required outputs (e.g. Transcripts) against entity attributes to ensure all necessary fields and join pathways are present.</li>
</ul>

<h4>2. Phase 2: From Conceptual ERD to Logical Database Design:</h4>
<ul>
  <li><strong>Selecting the Logical Model:</strong> The <strong>Relational Data Model</strong> is selected due to its widespread industry adoption, tabular simplicity, and mathematical foundations.</li>
  <li><strong>Entity Transformation:</strong> Entities are converted into relational tables (relations). Entity attributes become table columns.</li>
  <li><strong>Key Specification:</strong>
    <ul>
      <li>Simple entities receive atomic primary keys (e.g., <em>StudentID</em>, <em>CourseCode</em>).</li>
      <li>Associative/junction tables receive composite primary keys (e.g., <em>StudentID + CourseCode + SemesterID</em>).</li>
      <li>Foreign keys are established to enforce referential integrity across related tables.</li>
    </ul>
  </li>
</ul>`,
    explanation: 'High-frequency 5-mark Midterm question exploring the full lifecycle from requirements and DFDs through ERDs to Relational Schema from CS403 Handouts Page 118–123.',
    urdu_answer: 'ڈی ایف ڈی سے ای آر ماڈل اور پھر لاجیکل ڈیزائن میں منتقلی کے تحت ڈی ایف ڈی کے ڈیٹا اسٹورز سے اینٹیٹیز نکالی جاتی ہیں، ان کے کارڈینالٹی تعلقات بنائے جاتے ہیں اور آخر میں ریلیشنل ماڈل میں پرائمری و فارن کیز کے ساتھ ٹیبلز بنتے ہیں۔'
  }
];

// 7. Insert Statements
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
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'lecture')
`);

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lec12.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec12.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec12.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into CS403 Lecture 12:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for CS403 Lecture 12: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

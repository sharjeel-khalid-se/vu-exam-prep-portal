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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(cs403.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Specialization Constraints: Completeness, Disjointness & Subtype Discriminators')
  `).run(cs403.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`CS403 Lecture 11 found with ID: ${lec11.id}`);
}

// 3. Clear existing questions for Lecture 11 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec11.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 11.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'The __________ constraint specifies whether each entity supertype occurrence must also be a member of at least one subtype.',
    options: {
      a: 'Specialization',
      b: 'Uniqueness',
      c: 'Inheritance',
      d: 'Completeness'
    },
    correct: 'd',
    explanation: 'The Completeness constraint specifies whether each entity supertype occurrence must also be a member of at least one subtype. It is categorized into Total Completeness and Partial Completeness. Appeared 4 times in CS403 Mid Term Past Papers Mega File (Page 8), CS403 Solved MCQs by Moaaz (Spring 2010), and CS403 MIDTERM SOLVED MCQS By EducationGator (Q14).',
    urdu_answer: 'کمپلیٹنس کنسٹرینٹ یہ طے کرتی ہے کہ کیا ہر سپر ٹائپ اینٹیٹی کے لیے کم از کم ایک سب ٹائپ کا ممبر ہونا لازمی ہے یا نہیں۔'
  },
  {
    stem: 'If an instance of a supertype entity MUST be a member of at least one subtype entity, it is called __________ constraint.',
    options: {
      a: 'Partial completeness',
      b: 'Total completeness',
      c: 'Partial disjointness',
      d: 'Overlapping'
    },
    correct: 'b',
    explanation: 'If an instance of a supertype entity must belong to at least one subtype entity, it is called Total Completeness (or Total Specialization) (CS403 Handouts Page 103). Appeared 5 times in CS403 MIDTERM SOLVED MCQS By EducationGator (Q101), By JUNAID (Q101), and cs403 quiz 1+midterm by MCS group (Q277).',
    urdu_answer: 'اگر سپر ٹائپ اینٹیٹی کے ہر ریکارڈ کا کسی نہ کسی سب ٹائپ کا ممبر ہونا لازمی ہو، تو اسے ٹوٹل کمپلیٹنس (Total completeness) کہتے ہیں۔'
  },
  {
    stem: 'Which constraint exists when it is NOT necessary for a supertype entity instance to belong to any subtype entity?',
    options: {
      a: 'Total completeness',
      b: 'Partial completeness',
      c: 'Total disjoint',
      d: 'Partial disjoint'
    },
    correct: 'b',
    explanation: 'Partial Completeness specifies that an entity supertype instance is not required to belong to any subtype entity (CS403 Handouts Page 103–104). Appeared 4 times in CS403 MIDTERM SOLVED MCQS By EducationGator and CS403 quiz 1 Lec 1-10 mcqs.',
    urdu_answer: 'جب سپر ٹائپ کے کسی ممبر کے لیے کسی بھی سب ٹائپ میں شامل ہونا لازمی نہ ہو، تو اسے پارشل کمپلیٹنس (Partial completeness) کہا جاتا ہے۔'
  },
  {
    stem: 'In EER Diagrams, the Disjointness rule restricting a supertype instance to belong to at most ONE subtype is indicated by placing letter __________ inside the circle.',
    options: {
      a: 'O',
      b: 'D',
      c: 'C',
      d: 'S'
    },
    correct: 'b',
    explanation: 'The Disjoint rule restricts an entity instance to at most one subtype at any given time. In EER diagrams, this rule is indicated by the letter "d" or "D" inside the circle (CS403 Handouts Page 104–107). Appeared 4 times in CS403 Handouts and MCS group past files.',
    urdu_answer: 'ای ای آر ڈایاگرام میں دائرے کے اندر "D" لکھ کر ڈس جوائنٹ رول کو ظاہر کیا جاتا ہے، جس کا مطلب ہے کہ کوئی اینٹیٹی بیک وقت صرف ایک سب ٹائپ ہو سکتی ہے۔'
  },
  {
    stem: 'In EER Diagrams, the Overlap rule allowing a supertype instance to belong to MORE THAN ONE subtype simultaneously is indicated by placing letter __________ inside the circle.',
    options: {
      a: 'D',
      b: 'O',
      c: 'A',
      d: 'M'
    },
    correct: 'b',
    explanation: 'The Overlap rule allows an entity instance to belong to more than one subtype simultaneously. In EER diagrams, it is visually indicated by placing the letter "o" or "O" inside the circle (CS403 Handouts Page 104, 108). Appeared 4 times.',
    urdu_answer: 'دائرے کے اندر "O" کا حرف اوورلیپ رول کو ظاہر کرتا ہے، یعنی اینٹیٹی بیک وقت ایک سے زیادہ سب ٹائپس کا حصہ بن سکتی ہے۔'
  },
  {
    stem: 'A tool or technique which provides a methodology to determine to which subtype one instance of a supertype belongs is called __________.',
    options: {
      a: 'Primary Key',
      b: 'Foreign Key',
      c: 'Subtype Discriminator',
      d: 'Candidate Key'
    },
    correct: 'c',
    explanation: 'A Subtype Discriminator is an attribute placed in the supertype entity whose value determines which subtype entity or entities the instance belongs to (CS403 Handouts Page 108). Appeared 5 times in CS403 Mid Term Past Papers Mega File (Page 13, Q2) and MCS group.',
    urdu_answer: 'سب ٹائپ ڈسکریمینیٹر (Subtype Discriminator) سپر ٹائپ کا وہ ایٹریبیوٹ ہے جو یہ واضح کرتا ہے کہ وہ ریکارڈ کس سب ٹائپ سے تعلق رکھتا ہے۔'
  },
  {
    stem: 'If an employee can be both a salaried employee and an hourly employee simultaneously in an organization, this reflects which constraint?',
    options: {
      a: 'Disjoint rule',
      b: 'Overlap rule',
      c: 'Partial completeness',
      d: 'Total completeness'
    },
    correct: 'b',
    explanation: 'When an entity instance is permitted to belong to multiple subtypes at the same time, it follows the Overlap rule (CS403 Handouts Page 104–105). Appeared 3 times in cs403 quiz 1+midterm by MCS group.',
    urdu_answer: 'اگر کوئی ملازم بیک وقت تنخواہ دار (Salaried) اور فی گھنٹہ اجرت (Hourly) دونوں ہو سکے، تو یہ اوورلیپ رول (Overlap rule) کہلاتا ہے۔'
  },
  {
    stem: 'How many total combinations of specialization constraints exist between supertype and subtype entities?',
    options: {
      a: 'Two',
      b: 'Three',
      c: 'Four',
      d: 'Five'
    },
    correct: 'c',
    explanation: 'There are four total combinations of specialization constraints: (1) Total Disjoint, (2) Total Overlapping, (3) Partial Disjoint, and (4) Partial Overlapping (CS403 Handouts Page 108). Appeared 4 times.',
    urdu_answer: 'سپیشلائزیشن کنسٹرینٹس کے 4 ممکنہ امتزاج ہوتے ہیں: Total Disjoint، Total Overlapping، Partial Disjoint، اور Partial Overlapping۔'
  },
  {
    stem: 'In an overlapping subtype discriminator, how are choices represented in the supertype entity?',
    options: {
      a: "A single character field (e.g., 'C' or 'T')",
      b: 'Composite or multiple flag attributes (e.g., Y/N attributes for each subtype)',
      c: 'Foreign key constraint',
      d: 'Primary key reference'
    },
    correct: 'b',
    explanation: 'In overlapping subtypes, an entity instance can belong to several subtypes at once. Thus, a composite attribute with distinct boolean flags (e.g., Part_Type: Manufactured? [Y/N], Purchased? [Y/N]) is used (CS403 Handouts Page 108–109). Appeared 3 times.',
    urdu_answer: 'اوورلیپنگ سب ٹائپ ڈسکریمینیٹر میں ہر ممکنہ سب ٹائپ کے لیے الگ یس/نو (Y/N) فلیگ فیلڈز رکھے جاتے ہیں۔'
  },
  {
    stem: 'Total completeness constraint is visually represented in EER diagrams by using a __________ connecting the supertype to the circle.',
    options: {
      a: 'Single line',
      b: 'Double line',
      c: 'Dashed line',
      d: 'Dotted line'
    },
    correct: 'b',
    explanation: 'Total completeness (mandatory specialization) is indicated in EER diagrams by a double line connecting the supertype entity box to the circle (CS403 Handouts Page 103, 105). Appeared 3 times in CS403 Mid Term Past Papers.',
    urdu_answer: 'ای ای آر ڈایاگرام میں ٹوٹل کمپلیٹنس کو سپر ٹائپ اور دائرے کے درمیان ڈبل لائن (double line) کے ذریعے دکھایا جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What is Completeness Constraint? Differentiate between Total Completeness and Partial Completeness.',
    correct: `<p><strong>Completeness Constraint:</strong><br>A completeness constraint addresses whether an instance of a supertype entity must also be a member of at least one subtype entity in the relationship hierarchy (CS403 Handouts Page 103–104).</p>

<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Feature</th>
      <th class="p-2 border">Total Completeness</th>
      <th class="p-2 border">Partial Completeness</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Requirement</td>
      <td class="p-2 border">Every supertype instance <strong>MUST</strong> belong to at least one subtype.</td>
      <td class="p-2 border">A supertype instance is <strong>NOT required</strong> to belong to any subtype.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Notation</td>
      <td class="p-2 border">Represented by a <strong>Double Line</strong> connecting supertype to the circle.</td>
      <td class="p-2 border">Represented by a <strong>Single Line</strong> connecting supertype to the circle.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Example</td>
      <td class="p-2 border">A hospital <code>PATIENT</code> must be either <code>INDOOR_PATIENT</code> or <code>OUTDOOR_PATIENT</code>.</td>
      <td class="p-2 border">A <code>VEHICLE</code> may be a <code>CAR</code> or <code>TRUCK</code>, but could also be a motorcycle with no subtype defined.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Fundamental EER constraint comparison from CS403 Handouts Page 103–104 frequently asked in Midterm examinations.',
    urdu_answer: 'کمپلیٹنس کنسٹرینٹ یہ طے کرتی ہے کہ آیا ہر سپر ٹائپ ممبر کا کسی سب ٹائپ میں ہونا ضروری ہے۔ ٹوٹل کمپلیٹنس میں شمولیت لازمی ہوتی ہے (ڈبل لائن)، جبکہ پارشل میں لازمی نہیں ہوتی (سنگل لائن)۔'
  },
  {
    stem: 'Differentiate between Disjointness Rule and Overlap Rule in Specialization Constraints.',
    correct: `<p><strong>Disjointness Constraints</strong> govern whether a supertype instance may belong to multiple subtypes simultaneously (CS403 Handouts Page 104–105):</p>

<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Rule</th>
      <th class="p-2 border">Disjoint Rule (D)</th>
      <th class="p-2 border">Overlap Rule (O)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Definition</td>
      <td class="p-2 border">An instance of a supertype can be a member of <strong>at most one</strong> subtype.</td>
      <td class="p-2 border">An instance of a supertype can be a member of <strong>multiple subtypes simultaneously</strong>.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Symbol</td>
      <td class="p-2 border">Letter <strong>‘d’</strong> or <strong>‘D’</strong> placed inside the circle.</td>
      <td class="p-2 border">Letter <strong>‘o’</strong> or <strong>‘O’</strong> placed inside the circle.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Example</td>
      <td class="p-2 border">A patient cannot be an indoor and outdoor patient at the exact same moment.</td>
      <td class="p-2 border">A university person can concurrently be both an <code>EMPLOYEE</code> and a <code>STUDENT</code>.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core rule distinction from CS403 Handouts Page 104–105.',
    urdu_answer: 'ڈس جوائنٹ رول (D) کے تحت اینٹیٹی بیک وقت صرف ایک سب ٹائپ ہو سکتی ہے، جبکہ اوورلیپ رول (O) کے تحت وہ بیک وقت ایک سے زائد سب ٹائپس کا حصہ بن سکتی ہے۔'
  },
  {
    stem: 'What is a Subtype Discriminator? Define its main functionality.',
    correct: `<p><strong>Subtype Discriminator:</strong></p>
<p>A Subtype Discriminator is an attribute of the supertype entity whose explicit value determines which subtype entity (or entities) an instance belongs to (CS403 Handouts Page 108).</p>
<ul>
  <li><strong>For Disjoint Subtypes:</strong> A single discrete attribute with mutually exclusive values is used. For example, <em>Employee_Type</em> where value <code>'S'</code> indicates <code>SALARIED_EMPLOYEE</code> and <code>'H'</code> indicates <code>HOURLY_EMPLOYEE</code>.</li>
  <li><strong>For Overlapping Subtypes:</strong> A composite attribute composed of separate boolean/flag attributes is defined. For example, a part entity has flags <em>Manufactured? (Y/N)</em> and <em>Purchased? (Y/N)</em>.</li>
</ul>`,
    explanation: 'Repeated subjective question from CS403 Mid Term Past Papers Mega File (Page 13, Q2) and Handouts Page 108.',
    urdu_answer: 'سب ٹائپ ڈسکریمینیٹر سپر ٹائپ اینٹیٹی کا وہ فیلڈ ہوتا ہے جو یہ ظاہر کرتا ہے کہ کوئی مخصوص ریکارڈ کس سب ٹائپ کا ممبر ہے (ڈس جوائنٹ میں ایک ویلیو، اوورلیپ میں ملٹیپل فلیگز)۔'
  },
  {
    stem: 'List the four possible combinations of Specialization Constraints.',
    correct: `<p>Based on the intersection of <strong>Completeness</strong> (Total / Partial) and <strong>Disjointness</strong> (Disjoint / Overlapping), there are exactly <strong>four possible combinations</strong> (CS403 Handouts Page 108):</p>
<ol>
  <li><strong>Total Specialization, Disjoint Rule (Total Disjoint):</strong> Every supertype instance must belong to exactly one subtype.</li>
  <li><strong>Total Specialization, Overlap Rule (Total Overlapping):</strong> Every supertype instance must belong to at least one subtype, and may belong to multiple subtypes simultaneously.</li>
  <li><strong>Partial Specialization, Disjoint Rule (Partial Disjoint):</strong> A supertype instance does not have to belong to any subtype, but if it does, it can belong to at most one subtype.</li>
  <li><strong>Partial Specialization, Overlap Rule (Partial Overlapping):</strong> A supertype instance is not required to belong to any subtype, but may belong to zero, one, or multiple subtypes concurrently.</li>
</ol>`,
    explanation: 'Standard 3-mark question from CS403 Handouts Page 108.',
    urdu_answer: 'سپیشلائزیشن کنسٹرینٹس کے چار مجموعے ہیں: 1. ٹوٹل ڈس جوائنٹ، 2. ٹوٹل اوورلیپنگ، 3. پارشل ڈس جوائنٹ، 4. پارشل اوورلیپنگ۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Explain Specialization Constraints in EER Modeling (Completeness & Disjointness Constraints) with examples.',
    correct: `<p><strong>Specialization Constraints in Enhanced Entity-Relationship (EER) Modeling:</strong></p>
<p>Specialization constraints specify semantic business rules that restrict how entity instances in a supertype entity can be grouped into subtype entities (CS403 Handouts Page 103–108).</p>

<h4>1. Completeness Constraints:</h4>
<p>Determines whether every supertype instance must participate in at least one subtype:</p>
<ul>
  <li><strong>Total Completeness (Total Specialization):</strong> Every supertype occurrence must belong to at least one subtype. Visual notation: <strong>Double line</strong> from the supertype box to the circle. Example: <code>PATIENT</code> must be either <code>INDOOR_PATIENT</code> or <code>OUTDOOR_PATIENT</code>.</li>
  <li><strong>Partial Completeness (Partial Specialization):</strong> An entity instance in the supertype does not necessarily belong to any subtype. Visual notation: <strong>Single line</strong>. Example: <code>VEHICLE</code> with subtypes <code>CAR</code> and <code>TRUCK</code> (a motorcycle has no subtype).</li>
</ul>

<h4>2. Disjointness Constraints:</h4>
<p>Specifies whether an instance can be a member of multiple subtypes simultaneously:</p>
<ul>
  <li><strong>Disjoint Rule (D):</strong> If an instance of a supertype is a member of one subtype, it cannot simultaneously belong to any other subtype. Denoted by the letter <strong>‘d’</strong> inside the circle.</li>
  <li><strong>Overlap Rule (O):</strong> An entity instance can simultaneously belong to two or more subtypes. Denoted by the letter <strong>‘o’</strong> inside the circle. Example: A university person can be an employee and a student at the same time.</li>
</ul>

<h4>3. The Four Constraint Combinations Matrix:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Combination</th>
      <th class="p-2 border">Visual Notation</th>
      <th class="p-2 border">Semantic Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Total Disjoint</td>
      <td class="p-2 border">Double line + 'd' inside circle</td>
      <td class="p-2 border">Must belong to exactly one subtype.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Total Overlapping</td>
      <td class="p-2 border">Double line + 'o' inside circle</td>
      <td class="p-2 border">Must belong to at least one subtype; may belong to multiple.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Partial Disjoint</td>
      <td class="p-2 border">Single line + 'd' inside circle</td>
      <td class="p-2 border">May belong to zero or at most one subtype.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Partial Overlapping</td>
      <td class="p-2 border">Single line + 'o' inside circle</td>
      <td class="p-2 border">May belong to zero, one, or several subtypes.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive 5-mark Midterm question covering complete constraint hierarchy and matrix from CS403 Handouts Page 103–108.',
    urdu_answer: 'سپیشلائزیشن کنسٹرینٹس ای ای آر ماڈل کے اہم قواعد ہیں جن میں کمپلیٹنس (ٹوٹل یا پارشل) اور ڈس جوائنٹنس (ڈس جوائنٹ یا اوورلیپنگ) کے باہمی تعلق سے 4 صورتیں بنتی ہیں۔'
  },
  {
    stem: 'Discuss the Concept, Types, and Significance of Subtype Discriminators in Enhanced E-R Modeling.',
    correct: `<p><strong>Subtype Discriminators in Enhanced E-R Modeling:</strong></p>
<p>A <strong>Subtype Discriminator</strong> is an attribute of the supertype entity whose value determines to which subtype entity (or entities) an instance belongs (CS403 Handouts Page 108–109).</p>

<h4>1. Discriminators for Disjoint Subtypes:</h4>
<ul>
  <li>When subtypes are mutually exclusive (disjoint), a <strong>single discrete attribute</strong> inside the supertype is sufficient.</li>
  <li><strong>Example:</strong> For supertype <code>EMPLOYEE</code> with subtypes <code>HOURLY_EMPLOYEE</code>, <code>SALARIED_EMPLOYEE</code>, and <code>CONSULTANT</code>:
    <ul>
      <li>Attribute name: <em>Employee_Type</em>.</li>
      <li>Possible discrete values: <code>'H'</code> (Hourly), <code>'S'</code> (Salaried), <code>'C'</code> (Consultant).</li>
      <li>Only one code is active per row.</li>
    </ul>
  </li>
</ul>

<h4>2. Discriminators for Overlapping Subtypes:</h4>
<ul>
  <li>When subtypes can overlap, an instance may belong to multiple subtypes at the same time, making a single discrete value inadequate.</li>
  <li>A <strong>composite attribute</strong> with separate boolean / flag indicators (Yes/No or 1/0) for each potential subtype is defined in the supertype.</li>
  <li><strong>Example:</strong> For supertype <code>PART</code> with overlapping subtypes <code>MANUFACTURED_PART</code> and <code>PURCHASED_PART</code>:
    <ul>
      <li>Composite attribute: <em>Part_Type</em> consisting of two sub-attributes: <em>Manufactured? (Y/N)</em> and <em>Purchased? (Y/N)</em>.</li>
      <li>A part can have <code>(Y, N)</code>, <code>(N, Y)</code>, or <code>(Y, Y)</code> if it is both manufactured internally and purchased from outside vendors.</li>
    </ul>
  </li>
</ul>

<h4>3. Significance in Physical Database Implementation:</h4>
<ul>
  <li><strong>Relational Mapping:</strong> Serves as the primary routing field when transforming EER conceptual models into SQL tables and foreign-key joins.</li>
  <li><strong>Query Performance &amp; Integrity:</strong> Allows SQL queries to quickly filter specialized records without doing expensive multi-table outer joins.</li>
</ul>`,
    explanation: 'Detailed 5-mark subjective question exploring the design and implementation of subtype discriminators from CS403 Handouts Page 108–109.',
    urdu_answer: 'سب ٹائپ ڈسکریمینیٹر وہ فیلڈ ہے جو یہ بتاتی ہے کہ اینٹیٹی کس سب ٹائپ سے تعلق رکھتی ہے۔ ڈس جوائنٹ میں ایک ہی کوڈ کافی ہوتا ہے، جبکہ اوورلیپنگ میں ہر سب ٹائپ کے لیے الگ فلیگ (Y/N) استعمال کیا جاتا ہے۔'
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
    insMcq.run(lec11.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec11.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec11.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into CS403 Lecture 11:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for CS403 Lecture 11: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

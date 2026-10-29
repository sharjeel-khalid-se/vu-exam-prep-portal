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

// 2. Create or fetch Lecture 10
let lec10 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 10").get(cs403.id);
if (!lec10) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 10, 'Enhanced E-R Model: Supertypes, Subtypes, and Dependencies')
  `).run(cs403.id);
  lec10 = { id: res.lastInsertRowid };
  console.log(`Created CS403 Lecture 10 with ID: ${lec10.id}`);
} else {
  console.log(`CS403 Lecture 10 found with ID: ${lec10.id}`);
}

// 3. Clear existing questions for Lecture 10 to prevent duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec10.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 10.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Suppose we have two entities "Shape" and "Triangle", then which of the following is a correct statement?',
    options: {
      a: 'Shape is a super type entity and triangle is a sub type entity',
      b: 'Shape is a sub type entity and triangle is a super type entity',
      c: 'Shape and triangle both are super type entities',
      d: 'Shape and triangle both are sub type entities'
    },
    correct: 'a',
    explanation: 'In Enhanced E-R modeling, a generic entity representing an overall general category is a supertype (Shape), and a specific specialized variation is a subtype (Triangle, Circle, Rectangle). Appeared 5 times in CS403 MIDTERM SOLVED MCQS By EducationGator (Q110), By JUNAID (Q110), Cs403 Quiz 1 mcqs (Q155), CS403 quiz 1 Lec 1-10 mcqs (Q172), and cs403 quiz 1+midterm by MCS group (Q286).',
    urdu_answer: 'شکل (Shape) ایک سپر ٹائپ اینٹیٹی ہے جبکہ مثلث (Triangle) اس کی ذیلی یعنی سب ٹائپ اینٹیٹی ہے۔'
  },
  {
    stem: 'The __________ constraint specifies whether each entity supertype occurrence must also be a member of at least one subtype.',
    options: {
      a: 'Specialization',
      b: 'Uniqueness',
      c: 'Inheritance',
      d: 'Completeness'
    },
    correct: 'd',
    explanation: 'The completeness constraint specifies whether each entity supertype occurrence must also be a member of at least one subtype. It can be Total (mandatory) or Partial (optional). Appeared 4 times in CS403 Mid Term Past Papers Mega File (Page 8), CS403 Solved MCQs by Moaaz (Spring 2010 Session 4, Q14), and CS403 MIDTERM SOLVED MCQS By EducationGator (Q14).',
    urdu_answer: 'کمپلیٹنس کنسٹرینٹ یہ طے کرتی ہے کہ کیا ہر سپر ٹائپ اینٹیٹی کے لیے کم از کم ایک سب ٹائپ کا ممبر ہونا لازمی ہے یا نہیں۔'
  },
  {
    stem: 'A patient can be an outdoor or indoor patient. Analyze this statement and tell what type of constraint will be applied on patient?',
    options: {
      a: 'Total completeness',
      b: 'Partial completeness',
      c: 'Total disjoint',
      d: 'Partial disjoint'
    },
    correct: 'a',
    explanation: 'Since every hospital patient must be classified as either an indoor patient or an outdoor patient (no patient exists without belonging to one of these subtypes), this enforces a Total completeness (Total specialization) constraint. Appeared 5 times in CS403 MIDTERM SOLVED MCQS By EducationGator (Q101), CS403 MIDTERM SOLVED MCQS By JUNAID (Q101), Cs403 Quiz 1 mcqs (Q145), CS403 quiz 1 Lec 1-10 mcqs (Q162), and cs403 quiz 1+midterm by MCS group (Q97 / Q277).',
    urdu_answer: 'کیونکہ ہر مریض لازمی طور پر ان ڈور یا آؤٹ ڈور ہوگا، اس لیے یہ مکمل شمولیت یعنی ٹوٹل کمپلیٹنس (Total completeness) ہے۔'
  },
  {
    stem: 'When we have two entities "Person" and "Doctor", which of all is the best suitable type of relationship between the mentioned entities?',
    options: {
      a: 'Binary',
      b: 'Ternary',
      c: 'Inheritance',
      d: 'Recursive'
    },
    correct: 'c',
    explanation: 'A Doctor is a specialized type of Person (an is-a relationship). In the Enhanced E-R model, the relationship between Person (supertype) and Doctor (subtype) is modeled through Inheritance. Appeared 4 times in Cs403 Quiz 1 mcqs (Q246), CS403 quiz 1 Lec 1-10 mcqs (Q264), and cs403 quiz 1+midterm by MCS group (Q246).',
    urdu_answer: 'پرسن اور ڈاکٹر کے درمیان تعلق وراثت (Inheritance) یعنی سپر ٹائپ اور سب ٹائپ کا رشتہ ہے۔'
  },
  {
    stem: 'Which of the following tells us that the link between two relations is compulsory or optional?',
    options: {
      a: 'Minimum cardinality',
      b: 'Maximum cardinality',
      c: 'Existence dependency',
      d: 'Referential dependency'
    },
    correct: 'a',
    explanation: 'Minimum cardinality defines whether the participation of an entity in a relationship is compulsory (minimum cardinality = 1) or optional (minimum cardinality = 0) (CS403 Handouts Page 91). Appeared 4 times in cs403 quiz 1+midterm by MCS group (Q76).',
    urdu_answer: 'کم سے کم کارڈینالٹی (Minimum cardinality) یہ بتاتی ہے کہ اینٹیٹی کی شمولیت لازمی (compulsory) ہے یا اختیاری (optional)۔'
  },
  {
    stem: 'Which of the following provides us the facility to add properties of one entity to another entity automatically?',
    options: {
      a: 'Abstraction',
      b: 'Encapsulation',
      c: 'Inheritance',
      d: 'Dependencies'
    },
    correct: 'c',
    explanation: 'Inheritance in EER allows subtype entities to automatically acquire (inherit) all attributes and relationships defined in their parent supertype entity without duplicate definitions. Appeared 4 times in CS403 MIDTERM FILE 3 SOLVED BY TEAM HADI (Q30), Cs403 Quiz 1 mcqs (Q161), and cs403 quiz 1+midterm by MCS group (Q84).',
    urdu_answer: 'وراثت (Inheritance) کی بدولت ایک اینٹیٹی کی تمام خصوصیات خودکار طریقے سے دوسری اینٹیٹی کو منتقل ہو جاتی ہیں۔'
  },
  {
    stem: 'How many types of dependencies are there in database design?',
    options: {
      a: 'One',
      b: 'Two',
      c: 'Three',
      d: 'Four'
    },
    correct: 'c',
    explanation: 'CS403 Handouts Page 97 defines three distinct types of dependencies: (1) Existence dependency, (2) Identifier dependency, and (3) Referential dependency. Appeared 4 times in Cs403 Quiz 1 mcqs (Q64) and cs403 quiz 1+midterm by MCS group (Q208).',
    urdu_answer: 'ڈیٹا بیس ڈیزائن میں انحصار (Dependencies) کی تین اقسام ہیں: Existence، Identifier، اور Referential۔'
  },
  {
    stem: 'Subtype entities are expressed with a link to the supertypes having an __________ on the link, the arms of which point to the supertype entity.',
    options: {
      a: 'Circle',
      b: 'Arc',
      c: 'Diamond',
      d: 'Arrow'
    },
    correct: 'b',
    explanation: 'In EER diagrams, a line links subtype entities to the supertype entity with an Arc on the line, where the open arms of the arc face toward the supertype entity (CS403 Handouts Page 98–99). Appeared 3 times in CS403 quiz 1 Lec 1-10 mcqs.',
    urdu_answer: 'سب ٹائپ اینٹیٹیز کو سپر ٹائپ کے ساتھ جوڑنے والی لائن پر ایک قوس (Arc) لگائی جاتی ہے جس کے بازو سپر ٹائپ کی طرف رخ رکھتے ہیں۔'
  },
  {
    stem: 'Which of the following statements is NOT true regarding Supertype and Subtype entities?',
    options: {
      a: 'Any super-type linked entity properties are inherited to subtype entities.',
      b: 'Subtypes hold all properties of their corresponding supertype.',
      c: 'Disjointness constraint defines the existence of a super entity in a subtype.',
      d: 'We never identify subtypes on the basis of general domain knowledge.'
    },
    correct: 'd',
    explanation: 'Statement D is incorrect because database designers actively use domain knowledge, real-world context, and business rules to identify supertypes and subtypes. Appeared 3 times in cs403 quiz 1+midterm by MCS group (Q20) and CS403 Handouts (Page 98–99).',
    urdu_answer: 'یہ بیان غلط ہے کہ ہم ڈومین نالج سے سب ٹائپس کی شناخت نہیں کرتے؛ درحقیقت ڈومین نالج ہی سے ان کی شناخت ہوتی ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Supertype Entity and Subtype Entity with an appropriate example.',
    correct: `<p><strong>1. Supertype Entity:</strong><br>A generic entity type that has a relationship with one or more subtype entities. It contains the common attributes and relationships shared by all its subordinate subtypes.</p>
<p><strong>2. Subtype Entity:</strong><br>A specialized subgrouping of entities within an entity type that possesses distinct attributes or relationships peculiar to that subgroup.</p>
<p><strong>Example:</strong><br>In a university database, <code>PERSON</code> is a <strong>Supertype</strong> entity (possessing common attributes: <em>Person_ID</em>, <em>Name</em>, <em>Address</em>, <em>Phone</em>), whereas <code>STUDENT</code> and <code>FACULTY</code> are <strong>Subtype</strong> entities (possessing distinct attributes like <em>Roll_No</em>, <em>CGPA</em> or <em>Designation</em>, <em>Salary</em>).</p>`,
    explanation: 'Key conceptual distinction from CS403 Handouts (Page 98–99) tested frequently in Midterm Subjective examination papers.',
    urdu_answer: 'سپر ٹائپ ایک عمومی اینٹیٹی ہوتی ہے جس میں تمام مشترکہ اوصاف ہوتے ہیں، جبکہ سب ٹائپ ایک مخصوص ذیلی اینٹیٹی ہوتی ہے جس میں الگ اضافی اوصاف ہوتے ہیں، جیسے Person سپر ٹائپ اور Student سب ٹائپ ہے۔'
  },
  {
    stem: 'Define Attribute Inheritance in the Enhanced E-R Model.',
    correct: `<p><strong>Attribute Inheritance:</strong></p>
<p>Attribute inheritance is the fundamental property of the Enhanced E-R (EER) model whereby instances of a subtype entity automatically inherit all attributes and relationships defined in its corresponding supertype entity.</p>
<ul>
  <li><strong>Elimination of Redundancy:</strong> Attributes common to all subtypes (e.g., <em>ID</em>, <em>Name</em>, <em>Address</em>) are declared once at the supertype level rather than duplicating them in each individual subtype.</li>
  <li><strong>Relationship Inheritance:</strong> Any relationship associated with the supertype is automatically valid and applicable to all of its subtypes.</li>
</ul>`,
    explanation: 'Core mechanism of the EER model defined in CS403 Handouts Page 100.',
    urdu_answer: 'ایٹریبیوٹ انہیریٹنس کے تحت سب ٹائپ اینٹیٹی اپنے پیرنٹ سپر ٹائپ کے تمام اوصاف اور ریلیشن شپس کو خودکار طریقے سے حاصل کر لیتی ہے، جس سے ڈیٹا کی تکرار ختم ہوتی ہے۔'
  },
  {
    stem: 'Name and briefly describe the three types of Dependencies discussed in Lecture 10.',
    correct: `<p>The three types of dependencies in conceptual database design are:</p>
<ol>
  <li><strong>Existence Dependency:</strong> An entity instance cannot exist in the database unless its corresponding parent instance exists. For example, a <code>BOOK_COPY</code> cannot exist without its parent <code>BOOK</code> entity.</li>
  <li><strong>Identifier Dependency:</strong> Occurs when an entity (such as a weak entity) cannot be uniquely identified by its own attributes alone and requires the primary key of its parent entity as part of its composite identifier.</li>
  <li><strong>Referential Dependency:</strong> Enforces relational integrity across tables using foreign keys, guaranteeing that a foreign key value in a child record must match an existing primary key value in the referenced parent record.</li>
</ol>`,
    explanation: 'Standard 3-mark subjective classification from CS403 Handouts Page 97.',
    urdu_answer: 'تین اہم انحصار ہیں: Existence Dependency (والد اینٹیٹی کے بغیر وجود ممکن نہیں)، Identifier Dependency (پہچان کے لیے دوسری اینٹیٹی کی کلید ضروری ہے)، اور Referential Dependency (فارن کی کا درست حوالہ)۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Explain the Enhancements in E-R Data Model (EER Model) with focus on Supertype, Subtype, and Inheritance.',
    correct: `<p><strong>Enhanced Entity-Relationship (EER) Model:</strong></p>
<p>The traditional E-R model is effective for basic relational structures but lacks semantic abstraction mechanisms needed to represent complex enterprise data. The EER model adds concepts of <strong>Generalization</strong>, <strong>Specialization</strong>, and <strong>Inheritance</strong>.</p>

<h4>1. Supertype and Subtype Entities:</h4>
<ul>
  <li><strong>Supertype:</strong> A high-level generic entity type that represents common attributes and relationships shared across multiple entity groups. For example, <code>EMPLOYEE</code> with shared attributes <em>Emp_ID</em>, <em>Name</em>, and <em>Hire_Date</em>.</li>
  <li><strong>Subtype:</strong> A specialized sub-category representing a distinct subset of the supertype entity. For example, <code>SALARIED_EMPLOYEE</code> (having <em>Monthly_Salary</em>) and <code>HOURLY_EMPLOYEE</code> (having <em>Hourly_Rate</em>, <em>Hours_Worked</em>).</li>
</ul>

<h4>2. Attribute and Relationship Inheritance:</h4>
<ul>
  <li>All subtypes automatically inherit all attributes of their parent supertype without re-declaring them.</li>
  <li>Subtypes also inherit any relationship in which the supertype participates.</li>
</ul>

<h4>3. Diagrammatic Representation in EER:</h4>
<ul>
  <li>Subtypes are linked to the supertype entity via connecting lines.</li>
  <li>An <strong>Arc</strong> is drawn across the connecting line with its arms pointing toward the supertype entity, signifying generalization.</li>
</ul>`,
    explanation: 'Comprehensive 5-mark subjective question covering EER core principles from CS403 Handouts (Page 98–101).',
    urdu_answer: 'ای این ہینسڈ ای آر ماڈل عام ای آر ماڈل میں سپر ٹائپ، سب ٹائپ اور انہیریٹنس کے اصول شامل کرتا ہے تاکہ مشترکہ اوصاف کو بار بار لکھے بغیر پیچیدہ تعلقات کو ماڈل کیا جا سکے۔'
  },
  {
    stem: 'Explain the Completeness Constraint and Disjointness Constraint in Supertype-Subtype Hierarchies with Examples.',
    correct: `<p>In Enhanced E-R modeling, two fundamental constraints govern the participation and classification of supertype instances within subtypes:</p>

<h4>1. Completeness Constraint:</h4>
<p>Determines whether each entity occurrence in the supertype must also belong to at least one subtype.</p>
<ul>
  <li><strong>Total Specialization (Total Completeness):</strong> Every supertype instance <em>must</em> be a member of at least one subtype. Represented in EER diagrams by a <strong>double line</strong> connecting the supertype to the circle. Example: A hospital <code>PATIENT</code> must be either an <code>INDOOR_PATIENT</code> or an <code>OUTDOOR_PATIENT</code>.</li>
  <li><strong>Partial Specialization (Partial Completeness):</strong> A supertype instance does not have to belong to any subtype. Represented by a <strong>single line</strong>. Example: A <code>VEHICLE</code> could be a <code>CAR</code> or <code>TRUCK</code>, but could also be a motorcycle which does not belong to any defined subtype.</li>
</ul>

<h4>2. Disjointness Constraint:</h4>
<p>Determines whether an instance of a supertype can simultaneously belong to more than one subtype.</p>
<ul>
  <li><strong>Disjoint Rule (d):</strong> An entity instance can belong to at most <em>one</em> subtype at any given time. Represented by the letter <strong>‘d’</strong> inside the EER circle. Example: An <code>EMPLOYEE</code> cannot be simultaneously a <code>SALARIED_EMPLOYEE</code> and an <code>HOURLY_EMPLOYEE</code>.</li>
  <li><strong>Overlapping Rule (o):</strong> An entity instance can simultaneously belong to <em>multiple</em> subtypes. Represented by the letter <strong>‘o’</strong> inside the circle. Example: In a university system, a <code>PERSON</code> can concurrently be both an <code>EMPLOYEE</code> and a <code>STUDENT</code>.</li>
</ul>`,
    explanation: 'High-frequency 5-mark Midterm Subjective Question from CS403 Handouts (Page 101–102).',
    urdu_answer: 'کمپلیٹنس کنسٹرینٹ بتاتی ہے کہ سب ٹائپ کا ممبر ہونا لازمی ہے یا نہیں (ٹوٹل بمقابلہ پارشل)، جبکہ ڈس جوائنٹ کنسٹرینٹ بتاتی ہے کہ کیا اینٹیٹی بیک وقت دو سب ٹائپس بن سکتی ہے یا نہیں (ڈس جوائنٹ بمقابلہ اوورلیپنگ)۔'
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
    insMcq.run(lec10.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec10.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec10.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for CS403 Lecture 10: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

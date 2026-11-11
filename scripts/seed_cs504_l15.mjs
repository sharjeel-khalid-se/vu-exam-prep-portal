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

// 2. Create or fetch Lecture 15 for CS504
let lec15 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 15").get(cs504.id);
if (!lec15) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 15, 'Object Relationships: Association, Aggregation, Composition & Inheritance')
  `).run(cs504.id);
  lec15 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 15 with ID: ${lec15.id}`);
} else {
  console.log(`CS504 Lecture 15 found with ID: ${lec15.id}`);
}

const lId = lec15.id;

// 3. Clear existing questions for Lecture 15 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 15.`);

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
    stem: 'In a/an ______ relationship, a subclass automatically shares and inherits the structure (attributes) and behavior (methods) defined in another superclass.',
    options: {
      a: 'Aggregation',
      b: 'Composition',
      c: 'Inheritance (Generalization)',
      d: 'Uses / Dependency'
    },
    correct: 'c',
    explanation: '<p><strong>Inheritance (Generalization)</strong> is the mechanism where a derived/child class reuses, extends, and shares the state structure and operations defined in its parent superclass (CS504 Handouts Page 110). Appeared 6 times.</p>',
    urdu_answer: 'انہیرٹنس (Inheritance یا Generalization) میں سب کلاس اپنی سپر کلاس کے تمام ایٹریبیوٹس اور میتھڈز کو خود بخود شیئر اور حاصل کر لیتی ہے۔'
  },
  {
    stem: 'In Object-Oriented Analysis, the "Whole-Part" structure between objects is formally termed ______.',
    options: {
      a: 'Generalization',
      b: 'Aggregation',
      c: 'Specialization',
      d: 'Association'
    },
    correct: 'b',
    explanation: '<p><strong>Aggregation</strong> models the classic <em>Whole-Part</em> relationship where an aggregate object represents the "Whole" and other objects act as its "Parts" or components (CS504 Handouts Page 108). Appeared 5 times.</p>',
    urdu_answer: 'ہول-پارٹ (Whole-Part) اسٹرکچر کو آبجیکٹ اورینٹڈ ڈیزائن میں ایگریگیشن (Aggregation) کہا جاتا ہے جہاں ایک مکمل چیز اپنے اجزاء پر مشتمل ہوتی ہے۔'
  },
  {
    stem: 'A ______ relationship indicates that one entity is composed of one or more sub-parts which are themselves distinct instances of that or another entity.',
    options: {
      a: 'Inheritance',
      b: 'Whole-part (Aggregation / Composition)',
      c: 'Generalization',
      d: 'Specialization'
    },
    correct: 'b',
    explanation: '<p>A <strong>Whole-Part</strong> relationship models an entity configured from multiple independent or dependent sub-components (CS504 Handouts Page 108). Appeared 4 times.</p>',
    urdu_answer: 'ہول-پارٹ ریلیشن شپ اس بات کو ظاہر کرتا ہے کہ ایک بڑی اینٹیٹی ایک یا زائد ذیلی اجزاء (سب-پارٹس) سے مل کر بنی ہے۔'
  },
  {
    stem: '"A car is made up of a body, four wheels, a steering mechanism, a braking system, and a power engine". This statement is a textbook example of a/an ______.',
    options: {
      a: 'Whole-part (Aggregation / Composition) relationship',
      b: 'Inheritance hierarchy',
      c: 'Specialization',
      d: 'Generalization'
    },
    correct: 'a',
    explanation: '<p>Because the car is the assembly (Whole) composed of wheels, engine, and steering (Parts), it represents a <strong>Whole-Part (Aggregation/Composition)</strong> structure (CS504 Handouts Page 108). Appeared 3 times.</p>',
    urdu_answer: 'گاڑی کا باڈی، پہیوں، اسٹیئرنگ اور انجن سے مل کر بننا ہول-پارٹ (Whole-Part یا ایگریگیشن/کمپوزیشن) کی واضح مثال ہے۔'
  },
  {
    stem: 'In domain analysis, identifying Whole-Part structures (Aggregations) fundamentally corresponds to asking the question: "What are my ______?"',
    options: {
      a: 'Components',
      b: 'Structures',
      c: 'Objects',
      d: 'Classes'
    },
    correct: 'a',
    explanation: '<p>Identifying whole-part structures requires an analyst to ask: <em>"What are my components / constituent parts?"</em> to discover aggregating containers (CS504 Handouts Page 109). Appeared 4 times.</p>',
    urdu_answer: 'ایگریگیشن کی تلاش کا مطلب یہ سوال پوچھنا ہے کہ "میرے اجزاء یا کمپوننٹس (Components) کون سے ہیں؟"۔'
  },
  {
    stem: 'Consider the code snippet:\npublic class Square extends Shape {\n  // methods\n}\nThis represents which Object-Oriented relationship?',
    options: {
      a: 'Part-Whole relationship',
      b: 'Generalization / Specialization (Inheritance)',
      c: 'Data Sharing',
      d: 'Encapsulation'
    },
    correct: 'b',
    explanation: '<p>The <code>extends</code> keyword establishes that <code>Square</code> is a specialized kind of <code>Shape</code>, which is <strong>Generalization / Specialization (Inheritance)</strong> (CS504 Handouts Page 110). Appeared 4 times.</p>',
    urdu_answer: 'کی ورڈ extends اس بات کا ثبوت ہے کہ اسکوائر (Square) دراصل شیپ (Shape) کی اسپیشلائزیشن یعنی انہیرٹنس ہے۔'
  },
  {
    stem: 'Identifying Gen-Spec (Generalization-Specialization) structures in an object-oriented domain model means identifying ______.',
    options: {
      a: 'Aggregation',
      b: 'Class Hierarchy (Inheritance tree)',
      c: 'Loose Associations',
      d: 'Whole-part containment'
    },
    correct: 'b',
    explanation: '<p>Gen-Spec structures define the classification <strong>hierarchy</strong> (IS-A tree) where common generalized traits reside in superclasses and specialized variations reside in subclasses (CS504 Handouts Page 110). Appeared 3 times.</p>',
    urdu_answer: 'جن-اسپیک (Gen-Spec) اسٹرکچرز معلوم کرنے کا مطلب کلاسز کے درمیان اوپر سے نیچے درجہ بندی یعنی ہائیرارکی (Hierarchy) معلوم کرنا ہے۔'
  },
  {
    stem: 'As compared to simple Association, Aggregation implies a tighter logical binding between two objects because ______.',
    options: {
      a: 'Objects in association cannot exchange messages',
      b: 'Aggregation models a Whole-Part ownership concept, whereas association represents a peer-to-peer relationship between independent entities',
      c: 'Aggregation requires global static variables',
      d: 'Association is represented solely by inheritance'
    },
    correct: 'b',
    explanation: '<p>Association represents a generic "knows-a" or "uses-a" relationship between peers. Aggregation represents a specialized, tighter "has-a" <strong>Whole-Part ownership</strong> where one entity semantically contains or owns the other (CS504 Handouts Page 108). Appeared 3 times.</p>',
    urdu_answer: 'ایسوسی ایشن کے مقابلے میں ایگریگیشن ایک مضبوط تعلق ہے کیونکہ یہ ہول-پارٹ یعنی ملکیت (Ownership) کے رشتے کو ظاہر کرتا ہے جبکہ ایسوسی ایشن دو آزاد اشیاء کا تعلق ہے۔'
  },
  {
    stem: 'In standard UML class diagram notation, a solid filled black diamond (◆) represents ______, whereas a hollow unfilled white diamond (◇) represents ______.',
    options: {
      a: 'Aggregation, Composition',
      b: 'Composition (Strong Ownership), Aggregation (Shared Ownership)',
      c: 'Inheritance, Association',
      d: 'Dependency, Realization'
    },
    correct: 'b',
    explanation: '<p>In UML standards, a <strong>solid black diamond (◆)</strong> designates <strong>Composition</strong> (strong whole-part with coincident lifetime), while a <strong>hollow white diamond (◇)</strong> designates <strong>Aggregation</strong> (weak whole-part where parts can exist independently) (CS504 Handouts Page 108-109). Appeared 5 times.</p>',
    urdu_answer: 'یو ایم ایل (UML) میں بھرا ہوا کالا ہیرا (◆) کمپوزیشن یعنی مضبوط ملکیت کو ظاہر کرتا ہے، جبکہ خالی سفید ہیرا (◇) ایگریگیشن کو ظاہر کرتا ہے۔'
  },
  {
    stem: 'If the parent Whole object is deleted or destroyed, its part objects are automatically destroyed along with it. This strict lifecycle dependency characterizes ______.',
    options: {
      a: 'Weak Association',
      b: 'Shared Aggregation',
      c: 'Composition',
      d: 'Generalization'
    },
    correct: 'c',
    explanation: '<p><strong>Composition</strong> is a strong form of aggregation where part objects cannot exist without the parent whole. If the whole ceases to exist, all its composed parts are destroyed concurrently (CS504 Handouts Page 109). Appeared 4 times.</p>',
    urdu_answer: 'کمپوزیشن (Composition) میں اگر بنیادی ہول (Whole) آبجیکٹ ختم ہو جائے تو اس کے تمام اجزاء بھی خود بخود تلف ہو جاتے ہیں کیونکہ ان کی زندگی ہول پر منحصر ہوتی ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 15.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'What is the key conceptual and structural difference between Aggregation and Association?',
    correct: 'Association represents a peer-to-peer relationship (uses-a / knows-a) between independent objects. Aggregation represents a specialized Whole-Part relationship (has-a) where one object acts as a container/owner of another, though the part can survive independently.',
    explanation: `<p><strong>Association vs. Aggregation Comparison:</strong></p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Feature</th>
      <th>Association ("Knows-a / Uses-a")</th>
      <th>Aggregation ("Has-a Whole-Part")</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Nature</strong></td>
      <td>Peer-to-peer relationship between independent objects.</td>
      <td>Asymmetric Whole-Part relationship where one entity is container.</td>
    </tr>
    <tr>
      <td><strong>Ownership</strong></td>
      <td>No ownership concept.</td>
      <td>The "Whole" owns/contains the "Part".</td>
    </tr>
    <tr>
      <td><strong>UML Notation</strong></td>
      <td>Plain line connecting classes (with optional arrow).</td>
      <td>Line with a hollow diamond (◇) on the Whole side.</td>
    </tr>
    <tr>
      <td><strong>Example</strong></td>
      <td><code>Doctor</code> treats <code>Patient</code>.</td>
      <td><code>Department</code> has <code>Professors</code>.</td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'ایسوسی ایشن بمقابلہ ایگریگیشن: ایسوسی ایشن دو آزاد آبجیکٹس کے درمیان ایک عام رابطہ ہے (جیسے ڈاکٹر اور مریض)۔ جبکہ ایگریگیشن میں ہول-پارٹ یعنی ایک کنٹینر اور اس کے اجزاء کا رشتہ ہوتا ہے (جیسے شعبہ اور اس کے پروفیسرز)۔'
  },
  {
    stem: 'What is the difference between Association and Composition? Explain in terms of lifetime dependency.',
    correct: 'In association, objects exist independently with completely decoupled lifecycles. In composition, there is strict ownership and coincident lifetime: the part cannot exist without the whole and dies when the whole is destroyed.',
    explanation: `<p><strong>Association vs. Composition:</strong></p>
<ul>
  <li><strong>Association:</strong> Weak coupling. Objects have completely independent lifetimes. If an <code>Instructor</code> resigns, the <code>Student</code> continues to exist unaffected.</li>
  <li><strong>Composition (Death-Binding Lifetime):</strong> Strongest form of aggregation. The part belongs exclusively to one whole. If a <code>Building</code> is demolished, all its constituent <code>Rooms</code> cease to exist. In code, the whole creates and destroys the part within its own constructor/destructor.</li>
</ul>`,
    urdu_answer: 'ایسوسی ایشن اور کمپوزیشن میں فرق: ایسوسی ایشن میں دونوں آبجیکٹس آزادانہ زندگی گزارتے ہیں۔ کمپوزیشن میں پارٹ کی زندگی مکمل طور پر ہول کے تابع ہوتی ہے؛ ہول کے ختم ہونے پر پارٹ بھی ختم ہو جاتا ہے (جیسے عمارت کے گرنے سے اس کے کمرے ختم ہو جاتے ہیں)۔'
  },
  {
    stem: 'Keeping Connie\'s Point of Sale (POS) case study in mind, list down the Whole-Part (Aggregation/Composition) structures identified in the domain.',
    correct: 'In the POS case study: (1) Order is composed of OrderItems, (2) Register/POS terminal is composed of BarcodeScanner, CashDrawer, and ReceiptPrinter, and (3) Store is composed of Registers and Inventory.',
    explanation: `<p><strong>Whole-Part Structures in POS Case Study:</strong></p>
<ol>
  <li><strong>Sale / Order Transaction:</strong> An <code>Order</code> (Whole) aggregates multiple <code>LineItems / OrderItems</code> (Parts).</li>
  <li><strong>POS Checkout Terminal:</strong> A <code>POSTerminal</code> (Whole) is composed of physical peripheral devices: <code>BarcodeScanner</code>, <code>CashDrawer</code>, <code>CardReader</code>, and <code>ReceiptPrinter</code> (Parts).</li>
  <li><strong>Retail Store:</strong> The <code>Store</code> (Whole) aggregates multiple <code>CheckoutCounters</code>, <code>Registers</code>, and <code>ProductShelves</code>.</li>
</ol>`,
    urdu_answer: 'پی او ایس (POS) سسٹم کے ہول-پارٹ اسٹرکچرز: (1) سیل آرڈر (Order) متعدد آئٹمز پر مشتمل ہوتا ہے، (2) پی او ایس ٹرمینل میں بارکوڈ اسکینر، کیش دراز اور پرنٹر شامل ہوتے ہیں، اور (3) اسٹور متعدد کاؤنٹرز اور شیلفوں پر مشتمل ہوتا ہے۔'
  },
  {
    stem: 'Differentiate between Generalization and Specialization (Gen-Spec) structures with an example.',
    correct: 'Generalization is a bottom-up process combining common features of multiple classes into a superclass. Specialization is a top-down process creating distinct subclasses that extend a superclass with specific behaviors.',
    explanation: `<p><strong>Generalization vs. Specialization:</strong></p>
<ul>
  <li><strong>Generalization (Bottom-Up):</strong> Analysts examine specific classes (e.g., <code>Car</code>, <code>Truck</code>, <code>Motorcycle</code>), identify their common attributes (<code>engineNumber</code>, <code>speed</code>) and methods (<code>start()</code>, <code>brake()</code>), and abstract them into a generalized superclass: <code>Vehicle</code>.</li>
  <li><strong>Specialization (Top-Down):</strong> Starts with an existing general concept (e.g., <code>Account</code>) and derives specialized variations with distinct domain rules: <code>SavingsAccount</code> (accrues interest) and <code>CheckingAccount</code> (allows overdraft).</li>
</ul>`,
    urdu_answer: 'جنرلائزیشن بمقابلہ اسپیشلائزیشن: جنرلائزیشن نیچے سے اوپر کا عمل ہے جس میں مختلف کلاسز کی مشترکہ خصوصیات نکال کر ایک سپر کلاس بنائی جاتی ہے (جیسے کار اور ٹرک سے وہیکل بنانا)۔ اسپیشلائزیشن اوپر سے نیچے کا عمل ہے جس میں سپر کلاس کو مخصوص کر کے نئی سب کلاسز بنائی جاتی ہیں۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 15.`);

// 3 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: 'Define Whole-Part Aggregation, Composition, and Inheritance. Explain in detail how each relationship models component ownership, lifetime dependency, and code reusability.',
    correct: 'Aggregation models weak whole-part where parts exist independently. Composition models strong whole-part where parts share coincident lifetime with the whole. Inheritance models IS-A hierarchy enabling polymorphic code reuse.',
    explanation: `<p><strong>Deep Dive: Aggregation, Composition, and Inheritance:</strong></p>

<p><strong>1. Aggregation (Weak Whole-Part Ownership):</strong></p>
<ul>
  <li><strong>Relationship Type:</strong> "Has-a" (Shared Containment).</li>
  <li><strong>Ownership & Lifetime:</strong> The Whole contains references to its Parts, but does NOT manage their creation or destruction. Parts can exist independently and be shared across multiple Wholes.</li>
  <li><strong>Example:</strong> A <code>Department</code> aggregates <code>Professors</code>. If the department closes, the professors still exist.</li>
</ul>

<p><strong>2. Composition (Strong Whole-Part Ownership):</strong></p>
<ul>
  <li><strong>Relationship Type:</strong> "Contains-a" (Exclusive Ownership).</li>
  <li><strong>Ownership & Lifetime:</strong> The Whole strictly controls the lifetime of its Parts. The part cannot belong to any other whole simultaneously. Destroying the Whole cascadingly destroys all its Parts.</li>
  <li><strong>Example:</strong> A <code>Computer</code> composed of a <code>Motherboard</code> and <code>CPU</code>.</li>
</ul>

<p><strong>3. Inheritance (Generalization / Specialization):</strong></p>
<ul>
  <li><strong>Relationship Type:</strong> "Is-a" (Subtyping).</li>
  <li><strong>Mechanism & Reusability:</strong> Enables derived subclasses to inherit structural data fields and behavioral methods from base superclasses without code duplication. Supports runtime polymorphism and dynamic dispatch.</li>
  <li><strong>Example:</strong> <code>SavingsAccount</code> is an <code>Account</code>.</li>
</ul>`,
    urdu_answer: 'ایگریگیشن، کمپوزیشن اور انہیرٹنس کا جامع جائزہ: ایگریگیشن میں کمزور ملکیت ہوتی ہے اور اجزاء آزادانہ رہ سکتے ہیں (شعبہ اور اساتذہ)۔ کمپوزیشن میں سخت ملکیت ہوتی ہے اور ہول کے بغیر پارٹ کا کوئی وجود نہیں ہوتا (کمپیوٹر اور مدر بورڈ)۔ انہیرٹنس (Is-a) کوڈ کی ری یوز ایبلٹی اور پولی مارفزم کے لیے استعمال ہوتی ہے۔'
  },
  {
    stem: 'Relationship Identification Scenario: Consider a manufacturing system assembling Electric Fans and a University Management System. Identify and justify the types of relationships (Association, Aggregation, Composition, or Inheritance) between the specified entities.',
    correct: 'Fan to (Motor, Blades, Wires) is Composition. Department to Professor is Aggregation. Professor to Course is Association. GraduateStudent is a Student is Inheritance.',
    explanation: `<p><strong>Scenario-Based Relationship Identification & Justifications:</strong></p>

<p><strong>Part 1: Electric Fan Manufacturing Company:</strong></p>
<ul>
  <li><code>Fan</code> &rarr; <code>Motor</code>, <code>FanBlades</code>, <code>Capacitor</code>: <strong>Composition (◆)</strong><br>
    <em>Justification:</em> A finished electric fan physically encapsulates these specific components. If a manufactured fan is permanently destroyed in factory testing, the assembled configuration ceases to exist.
  </li>
  <li><code>Fan</code> &rarr; <code>PowerSource</code>: <strong>Association</strong><br>
    <em>Justification:</em> The fan plugs into an electrical socket to operate (uses-a), but neither owns the other.
  </li>
</ul>

<p><strong>Part 2: University Management System:</strong></p>
<ul>
  <li><code>Department</code> &rarr; <code>FacultyMember / Professor</code>: <strong>Aggregation (◇)</strong><br>
    <em>Justification:</em> The department has professors (Whole-Part), but professors retain independent academic existence if a department merges or disbands.
  </li>
  <li><code>Professor</code> &rarr; <code>Course</code>: <strong>Association</strong><br>
    <em>Justification:</em> A professor teaches a course. This is a peer-to-peer behavioral relationship without physical containment.
  </li>
  <li><code>Student</code> &larr; <code>UndergraduateStudent</code>, <code>GraduateStudent</code>: <strong>Inheritance (Generalization)</strong><br>
    <em>Justification:</em> Undergraduate and Graduate students are specific subtypes of the general <code>Student</code> class (IS-A relationship).
  </li>
</ul>`,
    urdu_answer: 'مسئلہ کا حل: پنکھے اور اس کے پروں/موٹر کا تعلق کمپوزیشن ہے کیونکہ وہ مل کر ایک چیز بناتے ہیں۔ یونیورسٹی ڈپارٹمنٹ اور پروفیسر کا تعلق ایگریگیشن ہے کیونکہ پروفیسر آزاد وجود رکھتے ہیں۔ پروفیسر اور کورس کا تعلق ایسوسی ایشن ہے۔ گریجویٹ اسٹوڈنٹ اور اسٹوڈنٹ کا تعلق انہیرٹنس (Is-a) ہے۔'
  },
  {
    stem: 'Compare the UML graphical notations and corresponding source code implementation patterns for Association, Aggregation, Composition, and Inheritance in modern object-oriented languages.',
    correct: 'Association: field reference passed via method or setter. Aggregation: collection/pointer passed in from outside. Composition: part instantiated inside whole constructor. Inheritance: class Sub extends Super.',
    explanation: `<p><strong>UML Notations and Code Implementation Mapping:</strong></p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Relationship</th>
      <th>UML Graphical Symbol</th>
      <th>Code Implementation Pattern (Java / C++)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Association</strong></td>
      <td>Solid line with optional open arrow (&rarr;)</td>
      <td><code>class Order { void bill(Customer c) { c.notify(); } }</code> (Passed as method argument)</td>
    </tr>
    <tr>
      <td><strong>Aggregation</strong></td>
      <td>Hollow diamond at Whole end (◇&mdash;&mdash;)</td>
      <td><code>class Dept { private List&lt;Prof&gt; profs; Dept(List&lt;Prof&gt; p) { this.profs = p; } }</code> (Injected from outside)</td>
    </tr>
    <tr>
      <td><strong>Composition</strong></td>
      <td>Solid black diamond at Whole end (◆&mdash;&mdash;)</td>
      <td><code>class Car { private Engine e; Car() { this.e = new Engine(); } }</code> (Instantiated internally)</td>
    </tr>
    <tr>
      <td><strong>Inheritance</strong></td>
      <td>Solid line with hollow triangular arrowhead (&mdash;&mdash;&gt;) pointing to Superclass</td>
      <td><code>public class Manager extends Employee { ... }</code></td>
    </tr>
  </tbody>
</table>`,
    urdu_answer: 'یو ایم ایل اور کوڈنگ کا موازنہ: ایسوسی ایشن میں آبجیکٹ کو بطور پیرامیٹر بھیجا جاتا ہے۔ ایگریگیشن میں بیرونی آبجیکٹس کی لسٹ کنسٹرکٹر میں پاس کی جاتی ہے۔ کمپوزیشن میں ہول کلاس اپنے اندر ہی پارٹ کا نیا آبجیکٹ بناتی ہے (new Engine())۔ انہیرٹنس میں extends کا لفظ استعمال ہوتا ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 15.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 15 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

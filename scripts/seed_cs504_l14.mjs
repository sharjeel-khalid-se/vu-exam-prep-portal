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

// 2. Create or fetch Lecture 14 for CS504
let lec14 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 14").get(cs504.id);
if (!lec14) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 14, 'Object-Oriented Analysis, Abbot''s Textual Analysis & Object Identification')
  `).run(cs504.id);
  lec14 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 14 with ID: ${lec14.id}`);
} else {
  console.log(`CS504 Lecture 14 found with ID: ${lec14.id}`);
}

const lId = lec14.id;

// 3. Clear existing questions for Lecture 14 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 14.`);

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
    stem: 'The first step in any Object-Oriented Analysis (OOA) process model is to ______.',
    options: {
      a: 'Build an object-relationship model',
      b: 'Define collaborations between objects',
      c: 'Elicit customer requirements',
      d: 'Select a representation language'
    },
    correct: 'a',
    explanation: '<p>The first and foremost activity in Object-Oriented Analysis (OOA) modeling is to <strong>build an object-relationship model</strong> by identifying candidate objects, their structural relationships, and entity boundaries (CS504 Handouts Page 104). Appeared 3 times.</p>',
    urdu_answer: 'آبجیکٹ اورینٹڈ اینالیسس (OOA) ماڈلنگ کا پہلا مرحلہ آبجیکٹ-ریلیشن شپ ماڈل تیار کرنا ہوتا ہے جس میں آبجیکٹس اور ان کے باہمی تعلقات کی نشاندہی کی جاتی ہے۔'
  },
  {
    stem: 'In Abbot\'s Textual Analysis technique, different parts of speech are identified within the text of the specification and these parts are modeled using different ______.',
    options: {
      a: 'Events',
      b: 'Processes',
      c: 'Operations',
      d: 'Components / Model Components'
    },
    correct: 'd',
    explanation: '<p>Russell Abbot\'s Textual Analysis maps natural language parts of speech (nouns, verbs, adjectives) directly into <strong>model components</strong> (classes, objects, attributes, and operations) (CS504 Handouts Page 105). Appeared 4 times.</p>',
    urdu_answer: 'ایبٹ کی ٹیکسٹوئل اینالیسس تکنیک میں تفصیلی دستاویز (SRS) کے مختلف حصص کلام (Parts of Speech) کو ماڈل کے اجزاء (Model Components) جیسے کلاسز، آبجیکٹس اور سروسز میں تبدیل کیا جاتا ہے۔'
  },
  {
    stem: 'The verbs in your problem domain specification usually indicate some of the ______ required of the associated object.',
    options: {
      a: 'Services / Operations',
      b: 'Objects',
      c: 'Collaborations',
      d: 'Actors'
    },
    correct: 'a',
    explanation: '<p>In textual analysis, action/doing verbs (such as <em>calculate, register, scan, deposit</em>) represent the <strong>services, operations, or behaviors</strong> that an object must perform (CS504 Handouts Page 105). Appeared 3 times.</p>',
    urdu_answer: 'پرابلم ڈومین کی عبارت میں آنے والے افعال (Verbs) عام طور پر متعلقہ آبجیکٹ کی فراہم کردہ سروسز (Services) یا آپریشنز کی نشاندہی کرتے ہیں۔'
  },
  {
    stem: 'In Peter Coad\'s object identification framework, transactions are the ______ that must be remembered through time.',
    options: {
      a: 'Events',
      b: 'Actions',
      c: 'Triggers',
      d: 'Methods'
    },
    correct: 'a',
    explanation: '<p>Transactions are historical <strong>events</strong> (e.g., an order placement, money withdrawal, or reservation) that the system must remember and maintain over time with timestamps and details (CS504 Handouts Page 106). Appeared 3 times.</p>',
    urdu_answer: 'پیٹر کوڈ کے مطابق ٹرانزیکشنز وہ اہم واقعات (Events) ہوتے ہیں جن کا تاریخی ریکارڈ سسٹم کو وقت کے ساتھ یاد رکھنا اور سنبھالنا ضروری ہوتا ہے۔'
  },
  {
    stem: 'Agreement, assignment, authorization, contract, delivery, deposit, and incident are classic examples of ______ in Peter Coad\'s methodology.',
    options: {
      a: 'Actors',
      b: 'Participants',
      c: 'Tangible Things',
      d: 'Transactions'
    },
    correct: 'd',
    explanation: '<p>Events that bind parties or establish legal/financial commitments—such as <em>assignments, contracts, deliveries, deposits, and incidents</em>—are categorized as <strong>Transactions</strong> (CS504 Handouts Page 106). Appeared 3 times.</p>',
    urdu_answer: 'معاہدہ (Contract)، تفویض (Assignment)، ڈلیوری (Delivery) اور ڈپازٹ (Deposit) وغیرہ پیٹر کوڈ کے ماڈل میں ٹرانزیکشنز (Transactions) کی مثالیں ہیں۔'
  },
  {
    stem: 'Which of the following is NOT one of the recognized categories in Peter Coad\'s methodology for identifying candidate objects?',
    options: {
      a: 'Select actors',
      b: 'Select participants',
      c: 'Select places',
      d: 'Select actions'
    },
    correct: 'd',
    explanation: '<p>Peter Coad\'s rules identify: <strong>Actors, Participants, Places, Transactions, Container Objects, and Tangible Things</strong>. <em>Actions</em> represent methods/services, not standalone objects (CS504 Handouts Page 106). Appeared 2 times.</p>',
    urdu_answer: 'ایکشنز (Actions) سروسز یا طریقوں کو ظاہر کرتے ہیں، یہ پیٹر کوڈ کی آبجیکٹ تلاش کرنے والی کیٹیگریز میں شامل نہیں ہیں۔'
  },
  {
    stem: 'As per Peter Coad’s methodology, which of the following may NOT be a suitable candidate for being an independent object?',
    options: {
      a: 'Folder',
      b: 'Bin',
      c: 'Student',
      d: 'Size'
    },
    correct: 'd',
    explanation: '<p><code>Folder</code> and <code>Bin</code> are Container Objects; <code>Student</code> is an Actor/Participant. <strong>Size</strong> is merely a qualitative or quantitative <em>attribute</em> of an object, not an entity with independent identity (CS504 Handouts Page 106). Appeared 2 times.</p>',
    urdu_answer: 'سائز (Size) کسی آبجیکٹ کی ایک خوبی یا ایٹریبیوٹ (Attribute) ہوتا ہے، یہ خود ایک الگ اور آزاد آبجیکٹ نہیں بن سکتا۔'
  },
  {
    stem: 'An object is formally defined as an entity that possesses state, behavior, and ______.',
    options: {
      a: 'Class',
      b: 'Identity',
      c: 'Attribute',
      d: 'Method'
    },
    correct: 'b',
    explanation: '<p>The three fundamental characteristics of any software object are: <strong>State</strong> (attribute values), <strong>Behavior</strong> (operations/responses), and <strong>Identity</strong> (a unique handle distinguishing it from all other objects) (CS504 Handouts Page 105). Appeared 3 times.</p>',
    urdu_answer: 'ایک آبجیکٹ کی تین بنیادی خصوصیات ہوتی ہیں: حالت (State)، رویہ (Behavior)، اور منفرد شناخت (Identity)۔'
  },
  {
    stem: 'In Object-Oriented Analysis, an object or class may be conceptualized and classified on the basis of ______.',
    options: {
      a: 'Behavior-Driven attributes',
      b: 'Data-Driven attributes',
      c: 'Responsibility-Driven attributes',
      d: 'All of the above'
    },
    correct: 'd',
    explanation: '<p>Object-oriented abstractions can be formulated from: <strong>Data-driven</strong> (state focus), <strong>Behavior-driven</strong> (state transitions/services focus), or <strong>Responsibility-driven</strong> (obligations/collaborations focus) (CS504 Handouts Page 104). Appeared 5 times.</p>',
    urdu_answer: 'آبجیکٹس اور کلاسز کو ڈیٹا ڈریون، بی ہیویئر ڈریون اور رسپانسبلٹی ڈریون، ان تمام زاویوں کی بنیاد پر ماڈل کیا جا سکتا ہے۔'
  },
  {
    stem: 'In Abbot\'s Textual Analysis, Proper Nouns (such as "Ali", "Lahore", or "Employee #1042") generally correspond to ______ in the OO model.',
    options: {
      a: 'Individual Objects (Instances)',
      b: 'Abstract Classes',
      c: 'System Operations',
      d: 'Inheritance Hierarchies'
    },
    correct: 'a',
    explanation: '<p>In natural language grammar, <strong>Proper Nouns</strong> refer to specific unique real-world entities, which map directly to <strong>individual objects (instances)</strong> rather than general classes (CS504 Handouts Page 105). Appeared 4 times.</p>',
    urdu_answer: 'ایبٹ کے ٹیکسٹوئل اینالیسس میں اسم معرفہ (Proper Nouns جیسے علی یا لاہور) انفرادی آبجیکٹس یعنی انسٹینسز (Instances) کی نمائندگی کرتے ہیں۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 14.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'What is Textual Analysis (Russell Abbot\'s Technique)? Explain its purpose and role in Object-Oriented Analysis.',
    correct: 'Textual analysis is an OOA technique proposed by Russell Abbot that inspects the natural language text of an SRS. It parses parts of speech (nouns, verbs, adjectives) and maps them into object-oriented model components (classes, objects, operations, and attributes).',
    explanation: `<p><strong>Textual Analysis (Russell Abbot's Technique):</strong></p>
<p>Textual Analysis is a foundational method in <strong>Object-Oriented Analysis (OOA)</strong> developed by Russell Abbot. It uses the grammatical structure of the natural language system requirements specification (SRS) to systematically discover candidate object-oriented abstractions.</p>
<ul>
  <li><strong>Core Concept:</strong> Sentences describing the problem domain contain nouns that hint at entities, and verbs that hint at services or relationships.</li>
  <li><strong>Purpose:</strong>
    <ol>
      <li>Provides a disciplined starting point to extract objects without relying on pure guesswork.</li>
      <li>Bridges the gap between informal customer requirements and formal object models.</li>
      <li>Helps identify candidate classes, instances, object attributes, and operations.</li>
    </ol>
  </li>
</ul>`,
    urdu_answer: 'ٹیکسٹوئل اینالیسس (ایبٹ کی تکنیک): یہ ریکوائرمنٹس کے انگریزی متن کا گرامر کی رو سے تجزیہ کرنے کا طریقہ ہے۔ اس میں اسم (Nouns) سے کلاسز اور آبجیکٹس جبکہ افعال (Verbs) سے سروسز اور آپریشنز کی نشاندہی کی جاتی ہے تاکہ سافٹ ویئر ماڈل آسانی سے تیار ہو سکے۔'
  },
  {
    stem: 'What is the Behavior-Driven perspective of an object? Define the three fundamental properties of an object: State, Behavior, and Identity.',
    correct: 'The behavior-driven perspective defines an object by what it does (its services and state transitions) rather than just its data structure. The 3 properties are: State (cumulative attribute values), Behavior (how it acts and reacts), and Identity (unique handle distinguishing it from all other objects).',
    explanation: `<p><strong>Behavior-Driven Perspective:</strong><br>
Instead of viewing an object as a passive data container, the behavior-driven perspective emphasizes the object's <strong>responsibilities, dynamic state transitions, and interactive services</strong> provided to other collaborators in the system.</p>
<p><strong>Three Fundamental Characteristics of an Object:</strong></p>
<ol>
  <li><strong>State:</strong> The condition of an object at any given time, determined by the cumulative current values of all its static and dynamic attributes.</li>
  <li><strong>Behavior:</strong> How an object acts and reacts in terms of state changes and message passing; represented by the functions, methods, or operations it executes.</li>
  <li><strong>Identity:</strong> The property that distinguishes an object from all other objects, even if two objects share identical attribute values. Identity is independent of object state.</li>
</ol>`,
    urdu_answer: 'بی ہیویئر ڈریون زاویہ اور آبجیکٹ کی 3 خصوصیات: آبجیکٹ کو اس کے کاموں اور ذمہ داریوں سے پرکھا جاتا ہے۔ تین بنیادی خصوصیات یہ ہیں: (1) اسٹیٹ (حالت): ایٹریبیوٹس کی موجودہ ویلیوز۔ (2) بی ہیویئر (رویہ): آبجیکٹ کے افعال اور رسپانس۔ (3) آئیڈینٹیٹی (شناخت): آبجیکٹ کا وہ منفرد وجود جو اسے باقی تمام آبجیکٹس سے الگ کرتا ہے۔'
  },
  {
    stem: 'Why are entities like "Radio", "Cat", and "Ali" classified as objects in Object-Oriented Analysis? Explain using the three core characteristics of an object.',
    correct: 'They are objects because each possesses State, Behavior, and a distinct Identity. Ali has attributes (age, CNIC), behaviors (walk, study), and unique identity. A radio has states (on/off, volume), behaviors (tune, play), and distinct identity.',
    explanation: `<p>In Object-Oriented Analysis, an entity qualifies as an <strong>object</strong> if it exhibits the three quintessential object properties:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Entity</th>
      <th>State (Attributes)</th>
      <th>Behavior (Operations)</th>
      <th>Identity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Ali (Person)</strong></td>
      <td>Name, Age, Height, Address, CNIC</td>
      <td>Walk, Speak, RegisterCourse, Sleep</td>
      <td>Unique biological/system ID</td>
    </tr>
    <tr>
      <td><strong>Radio</strong></td>
      <td>Power (On/Off), VolumeLevel, Frequency</td>
      <td>TurnOn(), ChangeFrequency(), SetVolume()</td>
      <td>Unique serial number</td>
    </tr>
    <tr>
      <td><strong>Cat</strong></td>
      <td>Breed, Color, Weight, IsHungry</td>
      <td>Meow(), Run(), Eat(), Sleep()</td>
      <td>Physical distinct organism</td>
    </tr>
  </tbody>
</table>
<p>Because each of these entities can encapsulate private state, execute dynamic behaviors, and retain unique identity, each is a valid object.</p>`,
    urdu_answer: 'علی، ریڈیو اور بلی آبجیکٹس کیوں ہیں؟ کیونکہ ان تینوں میں اسٹیٹ (خصوصیات جیسے رنگ یا فریکوئنسی)، بی ہیویئر (افعال جیسے چلنا یا آن ہونا) اور الگ منفرد شناخت (Identity) موجود ہوتی ہے جو انہیں آبجیکٹ بناتی ہے۔'
  },
  {
    stem: 'Enlist Peter Coad\'s guidelines and categories for identifying candidate objects in Object-Oriented Analysis.',
    correct: 'Peter Coad recommends selecting: (1) Actors (human users/roles), (2) Participants (role played in an event), (3) Places (physical/logical locations), (4) Transactions (historical events to remember), (5) Containers (objects holding others), and (6) Tangible Things.',
    explanation: `<p><strong>Peter Coad\'s Object Identification Methodology:</strong></p>
<p>Peter Coad formulated six systematic categories to guide software engineers in identifying candidate objects in any problem domain:</p>
<ol>
  <li><strong>Select Actors:</strong> Humans or autonomous systems interacting with the system (e.g., <em>Customer, Clerk, Operator</em>).</li>
  <li><strong>Select Participants:</strong> Roles played by an actor in a specific context (e.g., <em>Borrower, Employee, Approver</em>).</li>
  <li><strong>Select Places:</strong> Physical or virtual locations where business occurs (e.g., <em>Branch, Warehouse, Shelf, LoadingDock</em>).</li>
  <li><strong>Select Transactions:</strong> Critical business events that must be logged and remembered with timestamps (e.g., <em>Order, Sale, Withdrawal, Reservation</em>).</li>
  <li><strong>Select Container Objects:</strong> Objects that contain or group collections of other items (e.g., <em>Basket, Bin, Fleet, Folder, Queue</em>).</li>
  <li><strong>Select Tangible Things:</strong> Physical, touchable devices or items used in the domain (e.g., <em>Book, Sensor, Vehicle, Item</em>).</li>
</ol>`,
    urdu_answer: 'پیٹر کوڈ کے آبجیکٹ تلاش کرنے کے 6 اصول: (1) ایکٹرز (صارفین یا سسٹمز)، (2) پارٹیسیپنٹس (کردار جیسے گاہک یا ملازم)، (3) جگہیں (برانچ، گودام)، (4) ٹرانزیکشنز (خریداری، ڈپازٹ)، (5) کنٹینرز (ٹوکری، فولڈر)، اور (6) ٹھوس چیزیں (کتاب، گاڑی، اسکینر)۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 14.`);

// 3 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: 'Explain Russell Abbot\'s Textual Analysis mapping scheme in detail. Provide a comprehensive reference table showing how each grammatical Part of Speech (Proper Noun, Common Noun, Doing Verb, Being Verb, Having Verb, and Adjective) maps to Object-Oriented model components.',
    correct: 'Abbot maps: Proper Noun -> Object/Instance; Common Noun -> Class; Doing Verb -> Operation/Service; Being Verb -> Classification/Inheritance; Having Verb -> Composition/Aggregation; Adjective -> Attribute value.',
    explanation: `<p><strong>Russell Abbot\'s Textual Analysis Mapping Scheme:</strong></p>
<p>Russell Abbot established a structured linguistic mapping between the grammatical elements of an English requirements specification and the formal components of an Object-Oriented model:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Part of Speech</th>
      <th>OO Model Component</th>
      <th>Example from Problem Domain</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Proper Noun</strong></td>
      <td>Specific Object (Instance)</td>
      <td><code>Ali</code>, <code>Lahore Campus</code>, <code>Server#01</code></td>
    </tr>
    <tr>
      <td><strong>Common Noun</strong></td>
      <td>Class (Type / Concept)</td>
      <td><code>Student</code>, <code>Account</code>, <code>Book</code>, <code>Car</code></td>
    </tr>
    <tr>
      <td><strong>Doing Verb (Action)</strong></td>
      <td>Operation / Method / Service</td>
      <td><code>Deposit()</code>, <code>CalculateGPA()</code>, <code>Print()</code></td>
    </tr>
    <tr>
      <td><strong>Being Verb (is a / are)</strong></td>
      <td>Inheritance / Classification (Generalization)</td>
      <td>"A Manager <em>is an</em> Employee" &rarr; Manager inherits Employee</td>
    </tr>
    <tr>
      <td><strong>Having Verb (has / contains)</strong></td>
      <td>Aggregation / Composition (Association)</td>
      <td>"Car <em>has an</em> Engine" &rarr; Composition relationship</td>
    </tr>
    <tr>
      <td><strong>Adjective / Descriptive Phrase</strong></td>
      <td>Attribute / Property Value</td>
      <td>"<em>Red</em> Car" &rarr; <code>color = Red</code>; "<em>Savings</em> Account" &rarr; <code>accountType</code></td>
    </tr>
  </tbody>
</table>

<p><strong>Practical Application Guidelines:</strong></p>
<ul>
  <li>Not all nouns become classes: Some nouns are simply attributes (e.g., <code>Price</code>, <code>Age</code>, <code>Weight</code>).</li>
  <li>Verbs with direct objects define method signatures (e.g., "Cashier enters PIN" &rarr; <code>EnterPIN(pin)</code>).</li>
</ul>`,
    urdu_answer: 'ایبٹ کی ٹیکسٹوئل اینالیسس میپنگ اسکیم: اسم معرفہ (Proper Noun) مخصوص آبجیکٹ بنتا ہے؛ اسم نکرہ (Common Noun) کلاس بنتا ہے؛ ایکشن ورب (Doing Verb) میتھڈ یا آپریشن بنتا ہے؛ بیئنگ ورب (is a) انہیریٹنس بناتا ہے؛ ہیونگ ورب (has a) کمپوزیشن یا ایسوسی ایشن بناتا ہے؛ اور صفت (Adjective) ایٹریبیوٹ کی ویلیو بنتی ہے۔'
  },
  {
    stem: 'Given the problem scenario: "Alia has a fruit basket containing fresh apples and oranges. She registers the basket at the POS checkout counter where Cashier Tariq scans each fruit item and generates an electronic receipt." Using Object-Oriented Analysis techniques, identify and list the Classes, Objects, Attributes, Operations/Services, and Relationships.',
    correct: 'Classes: Customer, FruitBasket, Fruit, Counter, Cashier, Receipt. Objects: Alia, Tariq. Attributes: freshness, quantity, price. Operations: scan(), register(), generateReceipt(). Relationships: FruitBasket contains Fruit (Composition), Cashier scans Fruit at Counter.',
    explanation: `<p><strong>Object-Oriented Analysis of the Scenario:</strong></p>

<p><strong>1. Identification of Candidate Classes:</strong></p>
<ul>
  <li><code>Customer</code> (Common noun representing shoppers)</li>
  <li><code>Cashier</code> (Common noun representing checkout staff)</li>
  <li><code>FruitBasket</code> (Container object)</li>
  <li><code>Fruit</code> (Tangible item class, with subclasses <code>Apple</code> and <code>Orange</code>)</li>
  <li><code>CheckoutCounter</code> / <code>POS</code> (Place / Device object)</li>
  <li><code>Receipt</code> (Transaction document object)</li>
</ul>

<p><strong>2. Identification of Individual Objects (Instances):</strong></p>
<ul>
  <li><code>Alia</code> : Instance of <code>Customer</code></li>
  <li><code>Tariq</code> : Instance of <code>Cashier</code></li>
  <li>Specific basket and fruits being processed</li>
</ul>

<p><strong>3. Attributes:</strong></p>
<ul>
  <li><code>Fruit</code>: <code>variety</code>, <code>unitPrice</code>, <code>weight</code>, <code>freshnessStatus = "fresh"</code></li>
  <li><code>FruitBasket</code>: <code>capacity</code>, <code>totalItemCount</code></li>
  <li><code>Receipt</code>: <code>receiptNumber</code>, <code>timestamp</code>, <code>totalAmount</code></li>
</ul>

<p><strong>4. Operations / Services:</strong></p>
<ul>
  <li><code>FruitBasket.addItem()</code>, <code>FruitBasket.calculateTotal()</code></li>
  <li><code>Cashier.scanItem()</code>, <code>Cashier.generateReceipt()</code></li>
  <li><code>POS.processTransaction()</code></li>
</ul>

<p><strong>5. Relationships:</strong></p>
<ul>
  <li><strong>Composition (Has-a):</strong> <code>FruitBasket</code> contains <code>Fruit</code> (the fruits reside in the basket).</li>
  <li><strong>Association:</strong> <code>Customer</code> uses <code>FruitBasket</code>.</li>
  <li><strong>Interaction / Collaboration:</strong> <code>Cashier</code> operates <code>POS</code> to process <code>Customer</code> basket.</li>
</ul>`,
    urdu_answer: 'مسئلہ کا تجزیہ: کلاسز: Customer, Cashier, FruitBasket, Fruit, Receipt۔ آبجیکٹس: عالیہ اور طارق۔ ایٹریبیوٹس: وزن، قیمت، رسید نمبر۔ آپریشنز: اسکین کرنا (scan)، رسید بنانا (generateReceipt)۔ ریلیشن شپس: ٹوکری پھلوں پر مشتمل ہے (Composition) اور کیشیئر کاؤنٹر پر آئٹمز اسکین کرتا ہے۔'
  },
  {
    stem: 'Compare the Data-Driven, Responsibility-Driven, and Behavior-Driven approaches to Object-Oriented Analysis. Discuss why Peter Coad\'s methodology provides superior stability for evolving enterprise systems.',
    correct: 'Data-driven focuses on attributes and data structures (risk of tight coupling). Behavior-driven focuses on dynamic interactions and state transitions. Responsibility-driven focuses on obligations and contracts (CRC). Peter Coad grounds objects in stable domain archetypes.',
    explanation: `<p><strong>Comparison of Object-Oriented Analysis Approaches:</strong></p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Approach</th>
      <th>Primary Focus</th>
      <th>Strengths</th>
      <th>Limitations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Data-Driven Design</strong></td>
      <td>Internal data attributes, state variables, and relational schemas.</td>
      <td>Straightforward mapping to relational database tables.</td>
      <td>Encapsulation can be compromised; high coupling if data representations change.</td>
    </tr>
    <tr>
      <td><strong>Behavior-Driven Design</strong></td>
      <td>Dynamic interactions, state charts, and operations triggered by external events.</td>
      <td>Captures complex state changes and reactive systems accurately.</td>
      <td>Can become overly complex if state machines proliferate.</td>
    </tr>
    <tr>
      <td><strong>Responsibility-Driven Design (RDD)</strong></td>
      <td>Obligations, contracts, and collaborations among objects (CRC cards).</td>
      <td>High cohesion, low coupling, and strong encapsulation.</td>
      <td>Requires high abstraction skill early in requirements analysis.</td>
    </tr>
  </tbody>
</table>

<p><strong>Why Peter Coad\'s Methodology Ensures Enterprise Stability:</strong></p>
<ul>
  <li><strong>Domain-Centric Invariance:</strong> Peter Coad\'s categories (Actors, Participants, Places, Transactions, Containers, Tangible Things) reflect persistent real-world archetypes. While business rules change frequently, the underlying concepts (Customers, Orders, Invoices, Warehouses) remain structurally stable.</li>
  <li><strong>Separation of Concerns:</strong> Disentangling historical Transactions from active Participants prevents database anomalies and simplifies long-term audit trail maintenance.</li>
</ul>`,
    urdu_answer: 'تینوں زاویوں کا موازنہ: ڈیٹا ڈریون اندرونی ڈیٹا پر، بی ہیویئر ڈریون متحرک افعال پر، اور رسپانسبلٹی ڈریون آبجیکٹ کی ذمہ داریوں اور رابطوں پر توجہ مرکوز کرتا ہے۔ پیٹر کوڈ کا طریقہ کار کاروبار کے حقیقی عناصر (اداکار، جگہیں، ٹرانزیکشنز) پر مبنی ہے جو وقت کے ساتھ تبدیل نہیں ہوتے اور دیرپا استحکام فراہم کرتے ہیں۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 14.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 14 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

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

// 2. Create or fetch Lecture 16 for CS504
let lec16 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 16").get(cs504.id);
if (!lec16) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 16, 'Dynamic Modeling: Sequence Diagrams, Collaboration Diagrams & Interaction Modeling')
  `).run(cs504.id);
  lec16 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 16 with ID: ${lec16.id}`);
} else {
  console.log(`CS504 Lecture 16 found with ID: ${lec16.id}`);
}

const lId = lec16.id;

// 3. Clear existing questions for Lecture 16 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 16.`);

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

// 12 MCQs for Lecture 16
const mcqs = [
  {
    stem: 'In Sequence Diagrams, the time required by the receiver object to process the message is denoted by an ______.',
    options: {
      a: 'Activation Box',
      b: 'Simple Box',
      c: 'Arrow',
      d: 'None of the above'
    },
    correct: 'a',
    explanation: '<p>In UML Sequence Diagrams, an <strong>Activation Box</strong> (also known as the focus of control) is a thin vertical rectangle drawn on an object lifeline that shows the time duration during which an object is actively executing an operation or processing a message (CS504 Handout Page 108). Appeared 4 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام میں ایکٹیویشن باکس (Activation Box) لائف لائن پر عمودی پتلا مستطیل ہوتا ہے جو اس وقت یا دورانیے کو ظاہر کرتا ہے جس میں کوئی آبجیکٹ موصول شدہ پیغام کو پروسیس کرنے میں مصروف ہوتا ہے۔'
  },
  {
    stem: 'In sequence diagrams, events are organized in a ______ timeline.',
    options: {
      a: 'Vertical',
      b: 'Horizontal',
      c: 'Vertical and Horizontal',
      d: 'None of above'
    },
    correct: 'a',
    explanation: '<p>In UML sequence diagrams, the <strong>vertical</strong> axis represents the progression of time proceeding downwards, while the horizontal axis displays participating objects (CS504 Handout Page 106). Appeared 6 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام میں واقعات کا بہاؤ اور وقت کی ترتیب عمودی (Vertical) سمت میں اوپر سے نیچے کی جانب ترتیب دی جاتی ہے۔'
  },
  {
    stem: 'In sequence diagrams, objects/participants are organized along a ______ line and events in a ______ timeline.',
    options: {
      a: 'Horizontal, straight',
      b: 'Vertical, straight',
      c: 'Horizontal, vertical',
      d: 'Vertical, horizontal'
    },
    correct: 'c',
    explanation: '<p>In UML sequence diagrams, objects and roles are arranged horizontally along the top margin, while the timeline of chronological events and messages progresses vertically downwards (CS504 Handout Page 106). Appeared 3 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام میں شریک آبجیکٹس افقی (Horizontal) لائن پر ترتیب دیے جاتے ہیں اور پیغامات یا واقعات عمودی (Vertical) ٹائم لائن پر نیچے کی طرف بڑھتے ہیں۔'
  },
  {
    stem: 'Which one is NOT a type of message which Sequence Diagrams depict?',
    options: {
      a: 'Synchronous',
      b: 'Asynchronous',
      c: 'Create',
      d: 'Update'
    },
    correct: 'd',
    explanation: '<p>Standard UML message types in sequence diagrams include <em>Synchronous</em> (call), <em>Asynchronous</em> (signal), <em>Create</em>, <em>Destroy</em>, and <em>Return</em>. <strong>Update</strong> is an internal database action or method name, not an architectural UML message type (CS504 Handout Page 108). Appeared 6 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام میں سنکرونس، اسنکرونس، کریئیٹ اور ڈسٹرائے معیاری میسج ٹائپس ہیں؛ جبکہ "Update" کوئی میسج ٹائپ نہیں ہے۔'
  },
  {
    stem: 'Asynchronous messages are "signals," denoted by a ______.',
    options: {
      a: 'Full arrow',
      b: 'Half arrow',
      c: 'Simple line',
      d: 'Dashed line'
    },
    correct: 'b',
    explanation: '<p>In UML sequence diagram notation, asynchronous messages (non-blocking signals where the sender continues without waiting for an acknowledgment) are represented with an open stick arrow or <strong>half arrow</strong> (CS504 Handout Page 109). Appeared 5 times.</p>',
    urdu_answer: 'اسنکرونس میسجز نان بلاکنگ سگنلز ہوتے ہیں جنہیں آدھے تیر (Half arrow / open stick arrow) کے نشان سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'Synchronous messages are "call events," denoted by a ______.',
    options: {
      a: 'Full arrow',
      b: 'Half arrow',
      c: '<<create>>',
      d: '<<destroy>>'
    },
    correct: 'a',
    explanation: '<p>Synchronous messages represent nested procedure calls where the caller halts execution until the callee returns. They are formally denoted by a solid <strong>full arrow</strong> head (CS504 Handout Page 109). Appeared 4 times.</p>',
    urdu_answer: 'سنکرونس میسجز پروسیجر کالز کی طرح ہوتے ہیں جن میں کالر عمل مکمل ہونے تک رکتا ہے، اور انہیں ٹھوس بھرے ہوئے تیر (Full arrow) سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'Collaboration diagrams have basically two types of components: objects and ______.',
    options: {
      a: 'Class & Object',
      b: 'Use case & user',
      c: 'Messages',
      d: 'Function & Data'
    },
    correct: 'c',
    explanation: '<p>Collaboration diagrams (Communication diagrams) emphasize structural relationships between participating <strong>objects</strong> and dynamic control flow communicated via sequenced numbered <strong>messages</strong> passed across links (CS504 Handout Page 111). Appeared 4 times.</p>',
    urdu_answer: 'کولیبوریشن ڈایاگرام کے بنیادی طور پر دو اجزاء ہوتے ہیں: آبجیکٹس (Objects) اور ان کے درمیان رابطوں پر بھیجے جانے والے پیغامات (Messages)۔'
  },
  {
    stem: 'Sequence diagrams are best to see the flow of time. On the other hand, static object connections and organization with control flow are best represented by ______ diagrams.',
    options: {
      a: 'Class diagram',
      b: 'Sequence diagram',
      c: 'Collaboration diagram',
      d: 'Object design'
    },
    correct: 'c',
    explanation: '<p>While Sequence diagrams excel at revealing chronological order along a vertical axis, <strong>Collaboration diagrams</strong> excel at portraying spatial object connections, architectural topologies, and network-centric message flows (CS504 Handout Page 111–112). Appeared 5 times.</p>',
    urdu_answer: 'وقت کے بہاؤ کو دیکھنے کے لیے سیکوئنس ڈایاگرام بہترین ہے، جبکہ آبجیکٹس کے باہمی ساختی روابط اور تنظیم کے ساتھ کنٹرول فلو کو سمجھنے کے لیے کولیبوریشن ڈایاگرام (Collaboration diagram) موزوں ترین ہے۔'
  },
  {
    stem: 'Diagrams used to capture dynamic behavior of a system are called ______ diagrams.',
    options: {
      a: 'Interaction',
      b: 'Flow',
      c: 'Sequence',
      d: 'Collaboration'
    },
    correct: 'a',
    explanation: '<p><strong>Interaction diagrams</strong> is the standard UML classification that encompasses both Sequence diagrams and Collaboration diagrams, designed specifically to model runtime communication and dynamic system behavior (CS504 Handout Page 106). Appeared 4 times.</p>',
    urdu_answer: 'سسٹم کے متحرک رویے (Dynamic Behavior) اور پیغامات کے تبادلے کو ماڈل کرنے والے ڈایاگرامز کو انٹرایکشن ڈایاگرامز (Interaction Diagrams) کہا جاتا ہے۔'
  },
  {
    stem: 'UML provides ______ different mechanisms to document the dynamic behavior of the system in terms of interactions.',
    options: {
      a: 'Two',
      b: 'Three',
      c: 'Four',
      d: 'Five'
    },
    correct: 'a',
    explanation: '<p>UML provides <strong>two</strong> complementary interaction mechanisms to model dynamic behavior: Sequence Diagrams (time-oriented) and Collaboration/Communication Diagrams (structure-oriented) (CS504 Handout Page 106). Appeared 3 times.</p>',
    urdu_answer: 'یو ایم ایل انٹرایکشنز کے ذریعے سسٹم کے متحرک رویے کو دستاویز کرنے کے لیے دو (Two) بنیادی طریقے مہیا کرتی ہے: سیکوئنس ڈایاگرام اور کولیبوریشن ڈایاگرام۔'
  },
  {
    stem: 'In sequence diagrams, a message between two object lifelines is represented by a/an ______.',
    options: {
      a: 'Arrow',
      b: 'Straight line',
      c: 'Dotted line',
      d: 'Box'
    },
    correct: 'a',
    explanation: '<p>In UML sequence diagrams, messages transmitted from a source object lifeline to a target object lifeline are rendered as horizontal directed <strong>arrows</strong> (CS504 Handout Page 108). Appeared 3 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام میں دو آبجیکٹس کی لائف لائنز کے درمیان پیغام کو افقی تیر (Arrow) کے نشان سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'In sequence diagrams, the rectangular boxes arranged along the top row denote ______.',
    options: {
      a: 'Objects (or classes)',
      b: 'Messages, sent from one object to another',
      c: 'Life-time of objects',
      d: 'None of the given options'
    },
    correct: 'a',
    explanation: '<p>The rectangular boxes positioned at the top of a sequence diagram represent participating <strong>objects (or classes/roles)</strong> from which vertical dashed lifelines descend (CS504 Handout Page 106). Appeared 3 times.</p>',
    urdu_answer: 'سیکوئنس ڈایاگرام کے سب سے اوپر افقی قطار میں مستطیل خانے شریک آبجیکٹس یا کلاسز (Objects or Classes) کو ظاہر کرتے ہیں۔'
  }
];

// 4 Short Questions for Lecture 16
const shortQuestions = [
  {
    stem: 'Define Asynchronous Messages and Synchronous Messages in UML Sequence Diagrams.',
    correct: `<p>In UML Sequence Diagrams, messages model communication between collaborating objects and are divided into two fundamental execution semantics:</p>
<ul>
  <li><strong>Synchronous Messages (Call Events):</strong>
    <ul>
      <li>Represent traditional function/method calls where the sender thread <strong>blocks and suspends execution</strong> until the receiver finishes executing the request and returns control.</li>
      <li><strong>Notation:</strong> Rendered as a solid horizontal line with a <strong>solid filled arrowhead</strong> (&mdash;&blacktriangleright;). Return values are represented with a dashed open arrow.</li>
    </ul>
  </li>
  <li><strong>Asynchronous Messages (Signals / Event Passing):</strong>
    <ul>
      <li>Represent non-blocking signal transmissions where the sender dispatches the message and <strong>immediately continues its own concurrent processing</strong> without waiting for the receiver's acknowledgment or completion.</li>
      <li><strong>Notation:</strong> Rendered as a solid line with an <strong>open stick / half-arrowhead</strong> (&mdash;&gt; or half-stick).</li>
    </ul>
  </li>
</ul>`,
    explanation: '<p>Drawn directly from CS504 Handout Page 108&ndash;109. Explains blocking versus non-blocking execution semantics and their distinct graphical UML notations. Appeared 5 times in past papers.</p>',
    urdu_answer: `یو ایم ایل سیکوئنس ڈایاگرام میں سنکرونس اور اسنکرونس میسجز کی تعریف درج ذیل ہے:
1. سنکرونس میسجز (Synchronous Messages): یہ روایتی میتھڈ کالز کی نمائندگی کرتے ہیں جن میں کال کرنے والا آبجیکٹ اپنا کام روک کر اس وقت تک انتظار کرتا ہے جب تک ریسیور آبجیکٹ عمل مکمل کر کے جواب نہ دے دے۔ اسے ٹھوس بھرے ہوئے تیر (Full solid arrow) سے ظاہر کیا جاتا ہے۔
2. اسنکرونس میسجز (Asynchronous Messages): یہ نان بلاکنگ پیغامات یا سگنلز ہوتے ہیں جن میں میسج بھیجنے والا آبجیکٹ جواب کا انتظار کیے بغیر اپنا کام جاری رکھتا ہے۔ اسے کھلے آدھے تیر (Half / stick arrow) سے ظاہر کیا جاتا ہے۔`
  },
  {
    stem: 'What is the purpose of Collaboration Diagrams?',
    correct: `<p>The primary purpose of <strong>Collaboration Diagrams</strong> (termed <em>Communication Diagrams</em> in UML 2.0) is to capture the dynamic behavior of an object-oriented system with strong emphasis on <strong>structural organization</strong> and object links:</p>
<ol>
  <li><strong>Highlighting Object Relationships:</strong> They show how participating objects are spatially interconnected via structural links and associations rather than focusing solely on timeline order.</li>
  <li><strong>Visualizing Message Passing:</strong> Messages are superimposed directly onto connection links with chronological sequence numbers (e.g., <code>1: verify()</code>, <code>1.1: checkLimit()</code>, <code>2: deduct()</code>) illustrating the flow of control across collaborators.</li>
  <li><strong>Optimizing Spatial Layout:</strong> They provide an intuitive birds-eye view of architectural clustering and inter-object couplings within a localized use case or scenario.</li>
</ol>`,
    explanation: '<p>Based on CS504 Handout Page 111&ndash;112 on Collaboration diagram fundamentals, structural links, and numbered message sequence syntax. Appeared 4 times in past papers.</p>',
    urdu_answer: `کولیبوریشن ڈایاگرام (Collaboration Diagram) کا بنیادی مقصد یہ ہے:
1. آبجیکٹس کے ساختی روابط کو واضح کرنا: یہ ڈایاگرام دکھاتی ہے کہ سسٹم کے آبجیکٹس آپس میں کس طرح ساختی لنکس کے ذریعے جڑے ہوئے ہیں۔
2. میسج پاسنگ کا جائزہ: آبجیکٹس کے مابین روابط پر نمبر والے پیغامات (جیسے 1: call(), 1.1: validate()) کے ذریعے کنٹرول کے بہاؤ کو ظاہر کیا جاتا ہے۔
3. فن تعمیراتی ڈیزائن کی تفہیم: یہ کسی مخصوص منظرنامے یا یوز کیس میں آبجیکٹس کے باہمی جھکاؤ اور کپلنگ (Coupling) کو سمجھنے کے لیے نہایت مفید ہے۔`
  },
  {
    stem: 'In Sequence Diagrams, what does an Activation Box represent?',
    correct: `<p>In a Sequence Diagram, an <strong>Activation Box</strong> (also referred to as <em>Focus of Control</em> or execution occurrence) represents the following:</p>
<ul>
  <li><strong>Active Execution Period:</strong> It denotes the precise period during which an object is executing an operation, method, or service directly or indirectly (waiting for nested subroutine delegates to return).</li>
  <li><strong>Visual Representation:</strong> It is depicted as a narrow vertical rectangular box superimposed directly on top of the dashed object lifeline.</li>
  <li><strong>Nesting & Recursion:</strong> When an object invokes a method on itself (self-call) or re-enters an active context, activation boxes can be stacked or nested to visually demonstrate recursion or hierarchical call depth.</li>
</ul>`,
    explanation: '<p>Detailed definition of Activation Box according to CS504 Handouts Page 108 and past paper subjective marking criteria. Appeared 3 times in past papers.</p>',
    urdu_answer: `سیکوئنس ڈایاگرام میں ایکٹیویشن باکس (Activation Box یا Focus of Control) لائف لائن کے اوپر ایک پتلا عمودی مستطیل ہوتا ہے۔
- یہ ظاہر کرتا ہے کہ وہ آبجیکٹ کس وقت اور کتنی مدت تک کسی فنکشن، میتھڈ یا آپریشن کو پروسیس کرنے میں متحرک (Active) ہے۔
- جب کوئی آبجیکٹ اپنے ہی کسی فنکشن کو کال کرتا ہے (Self-delegation) تو ایکٹیویشن باکس کے اوپر دوسرا باکس جوڑ کر نیسٹنگ یا ریکرشن کو دکھایا جاتا ہے۔`
  },
  {
    stem: 'Differentiate between Sequence Diagram and Collaboration Diagram.',
    correct: `<p>Both Sequence and Collaboration diagrams are UML <strong>Interaction Diagrams</strong> that model dynamic behavior, but they differ significantly in emphasis, layout, and visual organization:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Feature</th>
      <th>Sequence Diagram</th>
      <th>Collaboration Diagram</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Primary Focus</strong></td>
      <td>Chronological ordering and temporal sequence of messages over time.</td>
      <td>Structural links, object relationships, and organization.</td>
    </tr>
    <tr>
      <td><strong>Time Representation</strong></td>
      <td>Implicitly modeled along a vertical axis flowing from top to bottom.</td>
      <td>Explicitly modeled using numerical decimal prefixes on messages (e.g., 1, 1.1, 2).</td>
    </tr>
    <tr>
      <td><strong>Object Layout</strong></td>
      <td>Arranged horizontally in a straight line along the top margin.</td>
      <td>Arranged freely in 2D space to visualize network links and clusters.</td>
    </tr>
    <tr>
      <td><strong>Lifelines & Activations</strong></td>
      <td>Features explicit vertical lifelines and activation boxes.</td>
      <td>Does not show vertical lifelines or activation bars; uses links between boxes.</td>
    </tr>
    <tr>
      <td><strong>Best Use Case</strong></td>
      <td>Analyzing detailed timing, concurrent threads, and logical complexity.</td>
      <td>Reviewing object coupling, refactoring class associations, and high-level routing.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p>Direct comparison table covering primary focus, time representation, layout, and practical usage based on CS504 Handout Page 106-112. Appeared 4 times in past papers.</p>',
    urdu_answer: `سیکوئنس ڈایاگرام اور کولیبوریشن ڈایاگرام میں واضح فرق درج ذیل ہے:
1. بنیادی توجہ (Focus): سیکوئنس ڈایاگرام وقت کی ترتیب اور زمانی بہاؤ پر زور دیتا ہے، جبکہ کولیبوریشن ڈایاگرام آبجیکٹس کی باہمی ساخت اور نیٹ ورک لنکس پر زور دیتا ہے۔
2. وقت کی نمائندگی: سیکوئنس ڈایاگرام میں وقت اوپر سے نیچے عمودی طور پر بہتا ہے؛ کولیبوریشن ڈایاگرام میں وقت پیغامات پر نمبروں (1, 1.1, 2) کے ذریعے ظاہر کیا جاتا ہے۔
3. آبجیکٹ لے آؤٹ: سیکوئنس میں آبجیکٹس اوپر ایک لائن میں ہوتے ہیں؛ کولیبوریشن میں آبجیکٹس ضرورت کے مطابق کسی بھی پوزیشن میں رکھے جاتے ہیں۔
4. لائف لائن: سیکوئنس ڈایاگرام میں لائف لائن اور ایکٹیویشن باکس ہوتے ہیں جبکہ کولیبوریشن میں سیدھے لنکس ہوتے ہیں۔`
  }
];

// 3 Long Questions for Lecture 16
const longQuestions = [
  {
    stem: 'Discuss the relationship between Sequence Diagrams and logical complexity in Object-Oriented Design.',
    correct: `<p>In Object-Oriented Analysis and Design (OOAD), <strong>Sequence Diagrams</strong> serve as a powerful diagnostic tool to visualize, detect, and mitigate <strong>logical and computational complexity</strong> within software systems:</p>

<h3>1. Identifying Excessive Coupling and "God Objects"</h3>
<p>When a sequence diagram reveals a single participant receiving and delegating dozens of messages to passive entities, it visually highlights poor cohesion and an architectural anti-pattern known as the <em>God Object</em> (or Blob). Well-designed object architectures distribute responsibilities evenly across multiple collaborating peers.</p>

<h3>2. Managing Branching, Conditions, and Loops</h3>
<ul>
  <li><strong>Guard Conditions:</strong> Sequence diagrams denote conditional branching via square bracket guards <code>[condition == true]</code>. When a single diagram contains numerous interleaved conditional guards, it signals excessive control complexity.</li>
  <li><strong>UML Combined Fragments:</strong> Using <code>alt</code> (alternative conditional branches), <code>opt</code> (optional execution), and <code>loop</code> (iterative processing) frames, engineers can formally bound logical paths. High nestings of combined fragments indicate that the scenario should be refactored into polymorphic sub-classes or separate strategies.</li>
</ul>

<h3>3. Pinpointing Deep Call Chaining (Law of Demeter Violations)</h3>
<p>Long staircases of cascading synchronous calls (<code>A &rarr; B &rarr; C &rarr; D &rarr; E</code>) clearly demonstrate tight coupling and violation of the <em>Law of Demeter</em> (Principle of Least Knowledge). Sequence diagrams allow architects to spot these chains and replace them with mediator patterns or direct facades.</p>

<h3>4. Concurrency, Race Conditions, and Deadlocks</h3>
<p>By contrasting asynchronous signal arrows (half-heads) with synchronous blocking arrows (solid heads), sequence diagrams make concurrent thread execution explicit. Critical sections where parallel lifelines invoke the same shared resource simultaneously can be audited for deadlock potential.</p>

<h3>Summary</h3>
<p>Sequence diagrams transform abstract procedural code into spatial and temporal models, allowing software engineers to objectively evaluate cognitive load, flatten call hierarchies, and refactor complex routines before writing code.</p>`,
    explanation: '<p>Comprehensive 5-mark subjective question on how sequence diagrams expose high cyclomatic complexity, coupling anti-patterns, and concurrency bottlenecks (CS504 Handout Page 106-110). Appeared 4 times in past papers.</p>',
    urdu_answer: `سیکوئنس ڈایاگرام اور منطقی پیچیدگی (Logical Complexity) کے مابین تعلق کی جامع وضاحت:
1. ضرورت سے زیادہ کپلنگ اور 'God Objects' کی نشاندہی: اگر سیکوئنس ڈایاگرام میں کوئی ایک آبجیکٹ بے شمار پیغامات کا مرکز بن جائے تو یہ ظاہر کرتا ہے کہ سسٹم میں ذمہ داریاں درست طریقے سے تقسیم نہیں ہوئیں (Poor Cohesion)۔
2. شرائط اور لوپس کا تجزیہ: گارڈ کنڈیشنز [condition] اور کمبائنڈ فریگمنٹس (alt, opt, loop) کی کثرت اس بات کا ثبوت ہے کہ بزنس لاجک بہت پیچیدہ ہو چکی ہے اور اسے پولی مورفزم یا اسٹریٹیجی پیٹرن میں توڑنا چاہیے۔
3. گہری میتھڈ چیننگ (Law of Demeter کی خلاف ورزی): جب ایک میسج طویل سیڑھی کی طرح ایک آبجیکٹ سے دوسرے اور تیسرے تک مسلسل منتقل ہوتا ہے تو یہ ٹائٹ کپلنگ کی نشاندہی کرتا ہے۔
4. کنکرنسی اور ڈیڈ لاکس: متوازی تھریڈز اور اسنکرونس سگنلز کو دیکھ کر ڈویلپرز ریس کنڈیشنز اور ریسورس بلاکنگ کا قبل از وقت تدارک کر سکتے ہیں۔`
  },
  {
    stem: 'Discuss the purpose of Interaction Diagrams (Sequence and Collaboration Diagrams) in capturing the dynamic behavior of an Object-Oriented system. Compare how each diagram portrays time sequence vs structural organization.',
    correct: `<p>In Object-Oriented Software Engineering, system models are bifurcated into <strong>static models</strong> (Class, Object, and Component diagrams) and <strong>dynamic models</strong> (Interaction and State Machine diagrams). Dynamic models capture how objects collaborate at runtime to realize system use cases.</p>

<h3>1. Purpose of Interaction Diagrams</h3>
<ul>
  <li><strong>Realizing Use Cases:</strong> Interaction diagrams translate high-level behavioral use case specifications into discrete, step-by-step object interactions and method calls.</li>
  <li><strong>Assigning Responsibilities:</strong> They assist developers in assigning operations and parameters to the most appropriate classes following GRASP (General Responsibility Assignment Software Patterns) principles.</li>
  <li><strong>Validating Class Interfaces:</strong> Messages sent between objects in interaction diagrams validate the public interfaces and signatures of target classes.</li>
</ul>

<h3>2. Portrayal of Time Sequence vs. Structural Organization</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Dimension</th>
      <th>Sequence Diagram</th>
      <th>Collaboration Diagram</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Time Sequence Representation</strong></td>
      <td><strong>Dominant & Primary:</strong> Time progresses vertically downwards on lifelines. Visual distance down the page indicates temporal succession. Extremely intuitive for tracking real-time events.</td>
      <td><strong>Secondary & Syntactic:</strong> Time has no dedicated spatial axis. Chronological ordering is preserved strictly through sequential numbering schemes (e.g., <code>1: request()</code>, <code>1.1: validate()</code>).</td>
    </tr>
    <tr>
      <td><strong>Structural Organization Representation</strong></td>
      <td><strong>Secondary & Rigid:</strong> Participating objects are aligned uniformly in an arbitrary horizontal row. Physical layout conveys zero information about structural network clustering or memory dependencies.</td>
      <td><strong>Dominant & Expressive:</strong> Emphasizes the structural network topology. Objects are placed anywhere in 2D space, connected by explicit link lines showing exact association paths.</td>
    </tr>
    <tr>
      <td><strong>Isomorphism (Equivalence)</strong></td>
      <td colspan="2" style="text-align: center;"><strong>Semantically Equivalent:</strong> Sequence diagrams and Collaboration diagrams are isomorphic; any interaction expressible in one can be automatically transformed into the other without loss of information.</td>
    </tr>
  </tbody>
</table>

<h3>3. Conclusion</h3>
<p>Software architects utilize <strong>Sequence Diagrams</strong> during detailed implementation and algorithm tracing where execution order is critical, and switch to <strong>Collaboration Diagrams</strong> during high-level architectural reviews where structural coupling and communication density across subsystems dominate.</p>`,
    explanation: '<p>Comprehensive analysis of UML Interaction diagrams, detailing purpose, time-sequence vs structural tradeoffs, and semantic isomorphism (CS504 Handout Page 106-112). Appeared 4 times in past papers.</p>',
    urdu_answer: `آبجیکٹ اورینٹڈ سسٹمز میں متحرک رویے (Dynamic Behavior) کو محفوظ کرنے کے لیے انٹرایکشن ڈایاگرامز کا کردار اور ان کا تقابل:
1. انٹرایکشن ڈایاگرامز کا مقصد: یوز کیسز کو حقیقی آبجیکٹ میتھڈز میں تبدیل کرنا، کلاسز پر ذمہ داریاں تفویض کرنا (GRASP اصول)، اور کلاس انٹرفیسز کی توثیق کرنا۔
2. وقت کے بہاؤ اور ساختی تنظیم کا تقابل:
- سیکوئنس ڈایاگرام: وقت کے بہاؤ (Time Sequence) کو سب سے نمایاں طور پر عمودی لائف لائن کے ذریعے ظاہر کرتا ہے۔ لیکن اس میں ساختی رابطے افقی قطار میں محدود ہوتے ہیں۔
- کولیبوریشن ڈایاگرام: آبجیکٹس کے باہمی ساختی روابط (Structural Organization) اور نیٹ ورک کو آزادی سے واضح کرتا ہے، جبکہ وقت کو میسجز کے ساتھ نمبرز (1, 1.1) لگا کر ظاہر کیا جاتا ہے۔
3. مساوات (Isomorphism): یہ دونوں ڈایاگرامز بنیادی معلومات میں ایک دوسرے کے مساوی ہیں، یعنی ایک کو دوسری شکل میں بآسانی تبدیل کیا جا سکتا ہے۔`
  },
  {
    stem: 'Given a scenario (such as "Course Registration Process" or "ATM Cash Withdrawal"), construct or describe the Sequence Diagram including lifelines, messages (synchronous/asynchronous), activation boxes, and object creations.',
    correct: `<p>To illustrate the complete notation of a UML Sequence Diagram, consider the standard scenario of an <strong>ATM Cash Withdrawal System</strong>:</p>

<h3>1. Participating Participants and Lifelines</h3>
<ul>
  <li><code>:Customer</code> (External Actor)</li>
  <li><code>:ATM_Interface</code> (Boundary / Presentation Object)</li>
  <li><code>:TransactionController</code> (Control Object)</li>
  <li><code>:BankServer</code> (External System / Entity Object)</li>
  <li><code>:CashDispenser</code> (Hardware Controller Device)</li>
</ul>

<h3>2. Chronological Sequence of Interleaved Messages</h3>
<ol>
  <li><strong>Card Insertion & PIN Entry:</strong>
    <ul>
      <li><code>Customer</code> inserts card into <code>ATM_Interface</code>.</li>
      <li><code>ATM_Interface</code> prompts for PIN and invokes synchronous message: <code>verifyPIN(cardNo, pin)</code> &rarr; <code>TransactionController</code>.</li>
      <li><code>TransactionController</code> activates its vertical <strong>Activation Box</strong> and issues synchronous call <code>authenticate(cardNo, pin)</code> &rarr; <code>BankServer</code>.</li>
      <li><code>BankServer</code> processes query and returns dashed arrow: <code>authSuccess: Boolean</code>.</li>
    </ul>
  </li>
  <li><strong>Amount Request & Account Debit:</strong>
    <ul>
      <li><code>Customer</code> inputs amount: <code>requestWithdrawal(amount)</code> &rarr; <code>ATM_Interface</code>.</li>
      <li><code>ATM_Interface</code> &rarr; <code>TransactionController.executeWithdrawal(amount)</code>.</li>
      <li><code>TransactionController</code> verifies balance via synchronous call <code>checkSufficientFunds(amount)</code> &rarr; <code>BankServer</code>.</li>
      <li>If true, <code>TransactionController</code> invokes <code>debitAccount(amount)</code> &rarr; <code>BankServer</code>.</li>
    </ul>
  </li>
  <li><strong>Hardware Cash Dispense:</strong>
    <ul>
      <li><code>TransactionController</code> dispatches synchronous command <code>dispenseCash(amount)</code> &rarr; <code>CashDispenser</code>.</li>
      <li><code>CashDispenser</code> activates motor and hardware sensors, dispensing bills to <code>Customer</code>.</li>
    </ul>
  </li>
  <li><strong>Asynchronous Receipt Printing & Session Termination:</strong>
    <ul>
      <li><code>TransactionController</code> sends an <strong>asynchronous signal</strong> (half arrowhead): <code>printReceipt(txId, amount)</code> &rarr; <code>Printer</code>, immediately freeing the controller.</li>
      <li><code>ATM_Interface</code> ejects card: <code>ejectCard()</code> &rarr; <code>Customer</code>.</li>
    </ul>
  </li>
</ol>

<h3>3. Summary of UML Graphical Notations Employed</h3>
<ul>
  <li><strong>Lifelines:</strong> Dashed vertical lines extending downwards from participant boundary boxes.</li>
  <li><strong>Activation Boxes:</strong> Narrow vertical bars indicating duration of execution during verification and debit phases.</li>
  <li><strong>Synchronous Messages:</strong> Solid lines with closed filled arrowheads (e.g., <code>verifyPIN</code>, <code>debitAccount</code>).</li>
  <li><strong>Asynchronous Messages:</strong> Solid lines with open stick/half arrowheads (e.g., <code>printReceipt</code> signal).</li>
  <li><strong>Return Messages:</strong> Dashed horizontal arrows returning control and values back to callers.</li>
</ul>`,
    explanation: '<p>Complete scenario description illustrating participants, lifelines, activation boxes, synchronous calls, asynchronous print signals, and return arrows (CS504 Handout Page 106-110). Appeared 3 times in past papers.</p>',
    urdu_answer: `اے ٹی ایم سے رقم نکلوانے (ATM Cash Withdrawal) کے منظرنامے پر سیکوئنس ڈایاگرام کی مکمل وضاحت:
1. شریک آبجیکٹس (Lifelines):
- Customer (ایکٹر)
- ATM_Interface (باؤنڈری آبجیکٹ)
- TransactionController (کنٹرولر آبجیکٹ)
- BankServer (ڈیٹابیس/بینک سرور)
- CashDispenser (ہارڈویئر ڈسپنسر)

2. پیغامات اور واقعات کی ترتیب (Sequence of Messages):
- پن تصدیق: کسٹمر کارڈ داخل کر کے پن درج کرتا ہے۔ اے ٹی ایم انٹرفیس سے ٹرانزیکشن کنٹرولر کو سنکرونس کال (verifyPIN) بھیجی جاتی ہے جو بینک سرور سے تصدیق کراتا ہے۔
- رقم کی کٹوتی: رقم درج کرنے پر کنٹرولر بینک سرور پر checkBalance اور debitAccount کال کرتا ہے۔ اس دوران کنٹرولر کی لائف لائن پر ایکٹیویشن باکس متحرک رہتا ہے۔
- کیش ڈسپنس: اکاونٹ ڈیبٹ ہونے کے بعد ڈسپنسر کو کیش دینے کا سنکرونس آرڈر ملتا ہے۔
- اسنکرونس رسید پرنٹنگ: کنٹرولر پرنٹر کو رسید چھاپنے کا اسنکرونس سگنل (Half arrow) بھیج کر فوراً کسٹمر کو کارڈ واپس کر دیتا ہے تاکہ اگلا صارف آ سکے۔`
  }
];

// Insert MCQs
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 16.`);

// Insert Short Questions
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 16.`);

// Insert Long Questions
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 16.`);

// Verify totals
const totalForLec = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId).c;
console.log(`Lecture 16 questions total: ${totalForLec}`);

const grandTotal = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
console.log(`Overall database questions total: ${grandTotal}`);

db.close();

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

// 2. Create or fetch Lecture 17 for CS504
let lec17 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 17").get(cs504.id);
if (!lec17) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 17, 'State Transition Diagrams: States, Events, Actions & Reactive Behavior')
  `).run(cs504.id);
  lec17 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 17 with ID: ${lec17.id}`);
} else {
  console.log(`CS504 Lecture 17 found with ID: ${lec17.id}`);
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

// 8 MCQs for Lecture 17
const mcqs = [
  {
    stem: 'The state transition diagram ______.',
    options: {
      a: 'depicts relationships between data objects',
      b: 'depicts functions that transform the data flow',
      c: 'indicates how data are transformed by the system',
      d: 'indicates system reactions to external events'
    },
    correct: 'd',
    explanation: '<p>A <strong>State Transition Diagram (STD)</strong> indicates how an entity or system behaves and reacts to external events over its lifetime by transitioning from one state to another (CS504 Handout Page 113). Appeared 8 times.</p>',
    urdu_answer: 'اسٹیٹ ٹرانزیشن ڈایاگرام (State Transition Diagram) یہ ظاہر کرتی ہے کہ سسٹم بیرونی واقعات (External Events) پر کیا ردعمل ظاہر کرتا ہے اور کس طرح ایک حالت سے دوسری حالت میں تبدیل ہوتا ہے۔'
  },
  {
    stem: 'In state transition diagrams, an oval (or rounded rectangle) shape represents a ______.',
    options: {
      a: 'State',
      b: 'Input',
      c: 'Output',
      d: 'Data'
    },
    correct: 'a',
    explanation: '<p>In traditional and UML state machine representations, an oval or rounded rectangle symbolizes a recognized <strong>State</strong> of the system or entity (CS504 Handout Page 114). Appeared 3 times.</p>',
    urdu_answer: 'اسٹیٹ ٹرانزیشن ڈایاگرام میں بیضوی شکل (Oval یا گول کونوں والا مستطیل) سسٹم کی حالت (State) کی نمائندگی کرتی ہے۔'
  },
  {
    stem: 'A state transition can only occur when triggered by a(n) ______.',
    options: {
      a: 'actor',
      b: 'collaboration attempt',
      c: 'event',
      d: 'none of the given'
    },
    correct: 'c',
    explanation: '<p>A state transition is a change from an active source state to a target state that is stimulated and triggered by an incoming <strong>event</strong> (CS504 Handout Page 114). Appeared 4 times.</p>',
    urdu_answer: 'کسی بھی حالت میں تبدیلی (State Transition) صرف اسی وقت واقع ہو سکتی ہے جب کوئی بیرونی یا اندرونی واقعہ (Event) پیش آئے۔'
  },
  {
    stem: 'For the purpose of behavior modeling, a state is formally defined as any ______.',
    options: {
      a: 'Consumer or producer of data',
      b: 'Data object hierarchy',
      c: 'Observable mode of behavior',
      d: 'Well defined process'
    },
    correct: 'c',
    explanation: '<p>In behavioral dynamic modeling, a state represents any <strong>observable mode of behavior</strong> or condition in which an object exists and waits for one or more stimuli (CS504 Handout Page 113). Appeared 3 times.</p>',
    urdu_answer: 'رویے کی ماڈلنگ میں، اسٹیٹ (State) سے مراد سسٹم یا آبجیکٹ کا کوئی بھی قابل مشاہدہ طرزِ عمل (Observable mode of behavior) ہے۔'
  },
  {
    stem: 'State Transition Diagrams are especially helpful in determining and capturing ______.',
    options: {
      a: 'Business Understanding',
      b: 'Process Flow',
      c: 'Data store',
      d: 'None of the given'
    },
    correct: 'a',
    explanation: '<p>State Transition Diagrams aid domain analysts in discovering and documenting <strong>Business Understanding</strong>, revealing business rules, lifecycle stages, and valid policy transitions across business entities (CS504 Handout Page 113). Appeared 5 times.</p>',
    urdu_answer: 'اسٹیٹ ٹرانزیشن ڈایاگرام کاروباری فہم (Business Understanding) اور ڈومین قوانین کو گہرائی سے سمجھنے اور دستاویز کرنے میں نہایت مددگار ثابت ہوتی ہے۔'
  },
  {
    stem: '______ is another technique to document domain knowledge by modeling entity lifecycle stages.',
    options: {
      a: 'Business model',
      b: 'Activity diagram',
      c: 'Use-case model',
      d: 'State transition diagram'
    },
    correct: 'd',
    explanation: '<p>Along with textual analysis and object modeling, the <strong>State transition diagram</strong> is recognized as a vital technique to document domain knowledge regarding entity states and event-driven policies (CS504 Handout Page 113). Appeared 3 times.</p>',
    urdu_answer: 'ڈومین کے علم اور کاروباری قوانین کو محفوظ کرنے کے لیے اسٹیٹ ٹرانزیشن ڈایاگرام (State transition diagram) ایک مؤثر اور مستند تکنیک ہے۔'
  },
  {
    stem: 'By following modern system engineering practices, simulation of reactive systems is no longer necessary.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: '<p><strong>False</strong>. Reactive and real-time systems are inherently non-deterministic and event-driven; rigorous simulation and formal state validation remain indispensable in modern systems engineering to eliminate deadlocks and race conditions (CS504 Handout Page 115). Appeared 6 times.</p>',
    urdu_answer: 'یہ بیان غلط (False) ہے۔ جدید انجینئرنگ میں بھی ری ایکٹیو اور ایونٹ ڈریون سسٹمز کی سیمولیشن ناگزیر ہے تاکہ ڈیڈ لاکس اور پوشیدہ خامیوں کا بروقت پتہ چلایا جا سکے۔'
  },
  {
    stem: 'Control flow diagrams are ______.',
    options: {
      a: 'needed to model event driven systems',
      b: 'required for all systems',
      c: 'used in place of data flow diagrams',
      d: 'useful for modeling user interfaces'
    },
    correct: 'a',
    explanation: '<p>Control flow diagrams and state transition networks are specifically <strong>needed to model event driven systems</strong> (such as embedded controllers, telecommunications, and real-time applications) where sequence and timing of events dictate execution (CS504 Handout Page 115). Appeared 6 times.</p>',
    urdu_answer: 'کنٹرول فلو ڈایاگرامز ایونٹ ڈریون سسٹمز (Event-driven systems) اور ری ایکٹیو عمل کو ماڈل کرنے کے لیے ضروری ہوتی ہیں۔'
  }
];

// 3 Short Questions for Lecture 17
const shortQuestions = [
  {
    stem: 'Define State and Event in the context of State Transition Diagrams.',
    correct: `<p>In the context of UML State Transition Diagrams (State Machine Diagrams):</p>
<ul>
  <li><strong>State:</strong>
    <ul>
      <li>A <strong>State</strong> is a condition or an observable mode of behavior during the lifecycle of an object in which it satisfies some condition, performs an activity, or waits for an external/internal event (e.g., <em>Idle</em>, <em>Heating</em>, <em>Suspended</em>, <em>Closed</em>).</li>
      <li>Represented graphically by an <strong>oval</strong> or a rectangle with rounded corners.</li>
    </ul>
  </li>
  <li><strong>Event:</strong>
    <ul>
      <li>An <strong>Event</strong> is a notable occurrence or stimulus at a specific point in time that has the potential to trigger a state transition (e.g., <em>buttonPressed</em>, <em>timerExpired</em>, <em>cardInserted</em>).</li>
      <li>Events are atomic, discrete occurrences labeled directly along the transition arrows.</li>
    </ul>
  </li>
</ul>`,
    explanation: '<p>Drawn from CS504 Handout Page 113&ndash;114. Defines State as an observable behavioral mode and Event as a discrete stimulus triggering state changes. Appeared 3 times in past papers.</p>',
    urdu_answer: `اسٹیٹ اور ایونٹ کی تعریف:
1. اسٹیٹ (State): کسی آبجیکٹ کی زندگی میں وہ حالت یا قابلِ مشاہدہ طرزِ عمل (Observable mode of behavior) جس میں وہ کسی شرط کو پورا کر رہا ہو، کوئی کام انجام دے رہا ہو، یا کسی واقعے کا انتظار کر رہا ہو (جیسے Idle, Processing, Finished)۔ اسے بیضوی خانے سے ظاہر کیا جاتا ہے۔
2. ایونٹ (Event): وقت کے کسی خاص لمحے میں پیش آنے والا واقعہ یا سگنل جو سسٹم کی حالت کو تبدیل کرنے کا سبب بنتا ہے (جیسے بٹن دبانا، ٹائمر مکمل ہونا)۔ اسے ٹرانزیشن تیر کے اوپر لکھا جاتا ہے۔`
  },
  {
    stem: 'What is a State Transition Diagram (STD)? What role does it play in documenting domain knowledge?',
    correct: `<p>A <strong>State Transition Diagram (STD)</strong> is a behavioral modeling specification that illustrates the lifecycle of a single reactive object or system by capturing all possible states it can occupy and the valid transitions triggered by events.</p>

<h3>Role in Documenting Domain Knowledge:</h3>
<ol>
  <li><strong>Clarifying Business Rules and Lifecycles:</strong> STDs make business entity lifecycles explicit (e.g., how an <em>Order</em> moves from <em>Placed &rarr; Paid &rarr; Shipped &rarr; Delivered</em> or <em>Cancelled</em>), eliminating ambiguity in domain policies.</li>
  <li><strong>Enforcing Legal Paths and Prohibiting Illegal Transitions:</strong> They establish which transitions are legally permissible, preventing invalid domain transitions (e.g., an order cannot transition directly from <em>Placed</em> to <em>Delivered</em> without being <em>Paid</em>).</li>
  <li><strong>Bridging Communication Gaps:</strong> STDs serve as an unambiguous visual language between non-technical domain stakeholders (business users) and software architects to validate system behavior before coding.</li>
</ol>`,
    explanation: '<p>Based on CS504 Handout Page 113. Explains the purpose of STDs and how they document business domain constraints and entity lifecycles. Appeared 3 times in past papers.</p>',
    urdu_answer: `اسٹیٹ ٹرانزیشن ڈایاگرام (STD) اور ڈومین نالج میں اس کا کردار:
- تعریف: یہ ایک ایسا ڈایاگرام ہے جو کسی سسٹم یا آبجیکٹ کے تمام ممکنہ حالات (States) اور واقعات کے نتیجے میں ہونے والی تبدیلیوں (Transitions) کو ظاہر کرتا ہے۔
- ڈومین نالج میں کردار:
1. کاروباری قوانین اور لائف سائیکل کی وضاحت: یہ واضح کرتا ہے کہ کوئی کاروباری ادارہ یا دستاویز (جیسے آرڈر یا کسٹمر اکاؤنٹ) کن مراحل سے گزرتی ہے۔
2. غلط تبدیلیوں کی روک تھام: یہ طے کرتا ہے کہ کون سی تبدیلیاں جائز ہیں اور کون سی ناجائز (مثلاً ادائی کے بغیر آرڈر ڈیلیور نہیں ہو سکتا)۔
3. اسٹیک ہولڈرز اور ڈویلپرز میں رابطہ: یہ کاروباری ماہرین اور سوفٹ ویئر انجینئرز کے درمیان مشترکہ سمجھ بوجھ پیدا کرتا ہے۔`
  },
  {
    stem: 'Differentiate between an Event, a Guard Condition, and an Action in a State Transition Diagram.',
    correct: `<p>In a State Transition Diagram, a state transition is formally modeled using the standard UML syntax:</p>
<p style="text-align: center;"><code>Event [Guard Condition] / Action</code></p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Component</th>
      <th>Definition</th>
      <th>Execution Trigger</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Event</strong></td>
      <td>A stimulus or external signal that causes the transition to be evaluated.</td>
      <td>Occurs at a discrete point in time (stimulus).</td>
      <td><code>cardSwiped</code>, <code>timeout</code></td>
    </tr>
    <tr>
      <td><strong>Guard Condition</strong></td>
      <td>A Boolean predicate enclosed in square brackets <code>[ ]</code> that must evaluate to true for the transition to fire.</td>
      <td>Evaluated dynamically upon receipt of the event.</td>
      <td><code>[balance &gt;= amount]</code>, <code>[attempts &lt; 3]</code></td>
    </tr>
    <tr>
      <td><strong>Action</strong></td>
      <td>An atomic, non-interruptible computation executed as a consequence of the firing transition.</td>
      <td>Executed immediately during the transition before entering the target state.</td>
      <td><code>/ dispenseCash()</code>, <code>/ soundAlarm()</code></td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p>Direct comparison of transition elements following the standard UML notation: Event [Guard] / Action. Appeared 2 times in past papers.</p>',
    urdu_answer: `ایونٹ، گارڈ کنڈیشن، اور ایکشن میں فرق (فارمولا: Event [Guard] / Action):
1. ایونٹ (Event): وہ بیرونی یا اندرونی واقعہ یا سگنل جو ٹرانزیشن کو شروع کرنے کا سبب بنتا ہے (مثلاً: swipeCard)۔
2. گارڈ کنڈیشن (Guard Condition): بریکٹ [ ] میں لکھی جانے والی بولین شرط، جس کا سچ (True) ہونا لازمی ہوتا ہے تاکہ ٹرانزیشن مکمل ہو سکے (مثلاً: [balance >= amount])۔
3. ایکشن (Action): ٹرانزیشن کے وقت انجام دیا جانے والا فوری آپریشن (مثلاً: / dispenseCash())۔`
  }
];

// 2 Long Questions for Lecture 17
const longQuestions = [
  {
    stem: 'Explain the structure and components of a State Transition Diagram (States, Transitions, Events, Guard Conditions, Actions). How do state transition diagrams help in modeling reactive and event-driven systems?',
    correct: `<p>In software engineering, <strong>State Transition Diagrams (STDs)</strong> or <strong>UML State Machine Diagrams</strong> provide the foundational paradigm for modeling the dynamic, event-driven behavior of reactive systems.</p>

<h3>1. Architectural Structure and Core Components</h3>
<ul>
  <li><strong>States:</strong>
    <ul>
      <li>Represent recognizable, observable conditions or behavioral modes of an entity over an extended duration.</li>
      <li><em>Initial State:</em> Marked by a solid black circle (<code>&bull;</code>).</li>
      <li><em>Final State:</em> Marked by a bullseye circle (solid dot inside a ring).</li>
      <li><em>Intermediate States:</em> Rendered as rounded rectangles labeled with state names (e.g., <em>Idle</em>, <em>Authenticating</em>, <em>Dispensing</em>).</li>
    </ul>
  </li>
  <li><strong>Transitions:</strong> Directed arrows connecting a source state to a destination state, indicating a change of state.</li>
  <li><strong>Triggering Events:</strong> Stimuli originating from internal timers, hardware sensors, user inputs, or messages that activate the transition.</li>
  <li><strong>Guard Conditions:</strong> Boolean predicates <code>[guard]</code> that must evaluate to true when the event occurs; if false, the transition does not fire.</li>
  <li><strong>Actions:</strong> Atomic, instantaneous computations denoted with a slash <code>/ action</code> executed during the transition traversal.</li>
  <li><strong>Internal Activities:</strong> Long-running activities executed inside a state, designated as <code>entry /</code>, <code>exit /</code>, or <code>do /</code>.</li>
</ul>

<h3>2. Modeling Reactive and Event-Driven Systems</h3>
<ol>
  <li><strong>Handling Asynchronous Stimuli:</strong> Unlike procedural batch systems, reactive systems (e.g., flight control, telecom switches, microwave ovens) continuously interact with their environment. STDs explicitly govern what inputs are accepted in each mode.</li>
  <li><strong>Preventing Deadlocks and Race Conditions:</strong> State transition models enable mathematical verification of reachability, ensuring every state has a valid exit path and no unhandled events result in system freeze.</li>
  <li><strong>Automated Code Generation:</strong> Modern statechart engines directly compile STDs into high-performance Finite State Machines (FSMs) in C, C++, or Java (using state pattern or lookup tables).</li>
</ol>`,
    explanation: '<p>Comprehensive 5-mark subjective question detailing STD components, notation, and the modeling of reactive/event-driven systems (CS504 Handout Page 113&ndash;116). Appeared 3 times in past papers.</p>',
    urdu_answer: `اسٹیٹ ٹرانزیشن ڈایاگرام کے اجزاء اور ری ایکٹیو سسٹمز کی ماڈلنگ:
1. بنیادی اجزاء:
- اسٹیٹس (States): ابتدائی اسٹیٹ (ٹھوس دائرہ)، درمیانی اسٹیٹس (گول مستطیل خانے)، اور آخری اسٹیٹ (حلقے میں دائرہ)۔
- ٹرانزیشنز (Transitions): تیر کے نشان جو ایک حالت سے دوسری حالت کی طرف اشارہ کرتے ہیں۔
- ایونٹس، گارڈز اور ایکشنز: ایونٹ وہ واقعہ ہے جو ٹرانزیشن کو شروع کرتا ہے، گارڈ وہ بولین شرط ہے جس کا پورا ہونا ضروری ہے، اور ایکشن وہ فوری عمل ہے جو ٹرانزیشن کے دوران ہوتا ہے۔
- اندرونی سرگرمیاں: اسٹیٹ کے اندر entry, exit اور do کے ذریعے طویل مدتی کام دکھائے جاتے ہیں۔

2. ری ایکٹیو اور ایونٹ ڈریون سسٹمز میں کردار:
- ماحولیاتی سگنلز اور غیر متوقع ایونٹس کو سنبھالنا۔
- سسٹم میں ڈیڈ لاکس اور پھنس جانے والی حالتوں (Dead-end states) کی روک تھام۔
- اسٹیٹ پیٹرن کے تحت براہِ راست کوڈ کی تیاری اور خودکار تصدیق۔`
  },
  {
    stem: 'Given a scenario (such as a Trouble Report Lifecycle, Control System for a Washing Machine, or Order Processing System), construct or describe the State Transition Diagram showing initial state, final state, intermediate states, triggering events, guard conditions, and resulting actions.',
    correct: `<p>To demonstrate a complete state machine specification, consider the classic software engineering scenario of a <strong>Trouble Ticket / Bug Report Lifecycle Management System</strong>:</p>

<h3>1. Identified System States</h3>
<ul>
  <li><strong>Initial Pseudo-state:</strong> Starting point of the ticket lifecycle.</li>
  <li><strong>New (Submitted):</strong> Ticket has been created and logged by a user; awaiting triage.</li>
  <li><strong>Assigned:</strong> Ticket has been assigned to a responsible engineer for investigation.</li>
  <li><strong>In_Progress (Fixing):</strong> The engineer is actively reproducing or fixing the defect.</li>
  <li><strong>Resolved (Fixed):</strong> Code fix has been committed; awaiting QA verification.</li>
  <li><strong>Closed (Final State):</strong> Ticket is verified, accepted, and permanently archived.</li>
  <li><strong>Rejected:</strong> Ticket deemed invalid, duplicate, or not-a-bug.</li>
</ul>

<h3>2. States, Triggering Events, Guards, and Actions</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Source State</th>
      <th>Event [Guard] / Action</th>
      <th>Target State</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><em>Initial</em></td>
      <td><code>submitTicket() / generateTicketId()</code></td>
      <td><strong>New</strong></td>
    </tr>
    <tr>
      <td><strong>New</strong></td>
      <td><code>triage() [isValidBug == true] / assignDeveloper()</code></td>
      <td><strong>Assigned</strong></td>
    </tr>
    <tr>
      <td><strong>New</strong></td>
      <td><code>triage() [isValidBug == false] / notifyReporter()</code></td>
      <td><strong>Rejected</strong></td>
    </tr>
    <tr>
      <td><strong>Assigned</strong></td>
      <td><code>startWork() / setStartTime()</code></td>
      <td><strong>In_Progress</strong></td>
    </tr>
    <tr>
      <td><strong>In_Progress</strong></td>
      <td><code>commitFix() [testsPass == true] / deployStaging()</code></td>
      <td><strong>Resolved</strong></td>
    </tr>
    <tr>
      <td><strong>Resolved</strong></td>
      <td><code>verifyQA() [qaPassed == true] / logResolution()</code></td>
      <td><strong>Closed</strong></td>
    </tr>
    <tr>
      <td><strong>Resolved</strong></td>
      <td><code>verifyQA() [qaPassed == false] / reopen()</code></td>
      <td><strong>In_Progress</strong></td>
    </tr>
    <tr>
      <td><strong>Rejected</strong></td>
      <td><code>acknowledge() / archive()</code></td>
      <td><strong>Closed</strong></td>
    </tr>
  </tbody>
</table>

<h3>3. Summary of State Machine Characteristics</h3>
<p>This diagram guarantees domain integrity: no ticket can bypass triage, no unverified code commit can reach the <em>Closed</em> state, and re-opened tickets transition back to <em>In_Progress</em> with proper auditing.</p>`,
    explanation: '<p>Complete real-world scenario of a Trouble Report / Bug Lifecycle demonstrating states, transitions, guard conditions, and actions (CS504 Handout Page 113&ndash;116). Appeared 3 times in past papers.</p>',
    urdu_answer: `ٹربل رپورٹ یا بگ ٹریکنگ لائف سائیکل کے اسٹیٹ ٹرانزیشن ماڈل کی مکمل وضاحت:
1. مختلف حالتیں (States):
- New: نیا رجسٹرڈ شدہ بگ۔
- Assigned: ڈویلپر کو تفویض کردہ۔
- In_Progress: بگ پر کام جاری ہے۔
- Resolved: بگ ٹھیک ہو چکا ہے، ٹیسٹنگ کا انتظار ہے۔
- Closed: بگ کی تصدیق ہو گئی اور ٹکٹ بند کر دیا گیا (Final State)۔
- Rejected: غیر متعلقہ یا غلط رپورٹ۔

2. ٹرانزیشنز اور شرائط (Transitions & Guards):
- New سے Assigned: جب بگ درست ہو [isValidBug == true]۔
- Assigned سے In_Progress: کام شروع کرنے پر۔
- In_Progress سے Resolved: جب تمام ٹیسٹ پاس ہو جائیں [testsPass == true]۔
- Resolved سے Closed: کوالٹی اشورنس کی حتمی منظوری پر۔
- Resolved سے In_Progress: اگر کیو اے ٹیسٹ فیل ہو جائے [qaPassed == false] تو ٹکٹ دوبارہ کھل جاتا ہے۔`
  }
];

// Insert MCQs
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 17.`);

// Insert Short Questions
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 17.`);

// Insert Long Questions
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 17.`);

// Verify totals
const totalForLec = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId).c;
console.log(`Lecture 17 questions total: ${totalForLec}`);

const grandTotal = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
console.log(`Overall database questions total: ${grandTotal}`);

db.close();

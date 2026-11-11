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

// 2. Create or fetch Lecture 18 for CS504
let lec18 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 18").get(cs504.id);
if (!lec18) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 18, ?)
  `).run(cs504.id, "Case Study: OOA of Connie's Convenience Store (Point of Sale System)");
  lec18 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 18 with ID: ${lec18.id}`);
} else {
  console.log(`CS504 Lecture 18 found with ID: ${lec18.id}`);
}

const lId = lec18.id;

// 3. Clear existing questions for Lecture 18 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 18.`);

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

// 5 MCQs for Lecture 18
const mcqs = [
  {
    stem: 'A "register" in "Point of Sale system" (Connie\'s Convenience Store) is an example of a(n) ______.',
    options: {
      a: 'Actor',
      b: 'Participant',
      c: 'Tangible thing',
      d: 'Transaction'
    },
    correct: 'c',
    explanation: '<p>In Peter Coad\'s object classification for Connie\'s Point of Sale System, hardware devices like <strong>Register</strong>, barcode scanner, and cash drawer are categorized as <strong>Tangible Things</strong> (physical entities) (CS504 Handouts Page 99&ndash;100). Appeared 5 times.</p>',
    urdu_answer: 'کونی کے پوائنٹ آف سیل (POS) سسٹم میں "رجسٹر" (Register) ایک مادی چیز یعنی ٹھوس شے (Tangible thing) کی مثال ہے۔'
  },
  {
    stem: 'In "Point of Sale system", the term "payment" represents a(n) ______.',
    options: {
      a: 'Actor',
      b: 'Participant',
      c: 'Transaction',
      d: 'Container'
    },
    correct: 'c',
    explanation: '<p>In Coad\'s methodology, events that take place at a specific point in time and must be remembered by the business (such as Sale, Return, and <strong>Payment</strong>) are classified as <strong>Transactions</strong> (CS504 Handouts Page 99). Appeared 4 times.</p>',
    urdu_answer: 'پوائنٹ آف سیل سسٹم میں لفظ "ادائیگی" (Payment) ایک لین دین یعنی ٹرانزیکشن (Transaction) کو ظاہر کرتا ہے۔'
  },
  {
    stem: 'Identifying System Features in Coad\'s methodology (e.g., in Connie\'s Point of Sale System) includes ______.',
    options: {
      a: 'log important information',
      b: 'conduct business',
      c: 'analyze business results',
      d: 'all of the above'
    },
    correct: 'd',
    explanation: '<p>Coad\'s methodology categorizes core system features under three primary business umbrellas: <em>log important information</em>, <em>conduct business</em>, and <em>analyze business results</em> (CS504 Handouts Page 98). Appeared 4 times.</p>',
    urdu_answer: 'پیٹر کوآڈ کی میتھڈولوجی کے مطابق سسٹم کی خصوصیات میں کاروباری سرگرمیاں انجام دینا، معلومات محفوظ کرنا، اور کاروباری نتائج کا تجزیہ کرنا یہ تمام (All of the above) شامل ہیں۔'
  },
  {
    stem: 'In Peter Coad\'s methodology for Connie\'s store, identifying Whole-Part structures (Aggregations) means asking "what are my ______".',
    options: {
      a: 'Components',
      b: 'Structures',
      c: 'Objects',
      d: 'Classes'
    },
    correct: 'a',
    explanation: '<p>To discover Whole-Part relationships, Coad directs the analyst to inspect candidate whole entities and ask <em>"What are my parts?"</em> or <em>"What are my components?"</em> (CS504 Handouts Page 95). Appeared 4 times.</p>',
    urdu_answer: 'پیٹر کوآڈ کے طریقہ کار میں ہول-پارٹ اسٹرکچر کی دریافت کے لیے تجزیہ کار یہ سوال پوچھتا ہے کہ "میرے اجزاء یا کمپوننٹس (Components) کیا ہیں؟"۔'
  },
  {
    stem: 'In Connie’s Convenience Store case study, which of the following is identified as a Container Class?',
    options: {
      a: 'Store',
      b: 'Cashier',
      c: 'Register',
      d: 'Item'
    },
    correct: 'a',
    explanation: '<p>In Connie\'s Convenience Store, <strong>Store</strong> is identified as a <strong>Container Class</strong> because it physically and logically encapsulates other objects such as Cashiers, Registers, and Items (CS504 Handouts Page 99). Appeared 3 times.</p>',
    urdu_answer: 'کونی کی اسٹور کیس اسٹڈی میں "اسٹور" (Store) کو ایک کنٹینر کلاس (Container Class) کے طور پر منتخب کیا گیا ہے کیونکہ یہ کیشیئرز، رجسٹرز اور اشیاء کو اپنے اندر سموئے ہوئے ہے۔'
  }
];

// 3 Short Questions for Lecture 18
const shortQuestions = [
  {
    stem: 'Keeping Connie’s case study in mind, as discussed in lecture, list down whole-part structures which were identified.',
    correct: `<p>In the Object-Oriented Analysis of Connie’s Convenience Store (Point of Sale System), the following key <strong>Whole-Part (Aggregation / Composition)</strong> structures were identified:</p>
<ol>
  <li><strong>Store &harr; Registers:</strong> The <em>Store</em> is the whole; individual <em>Registers</em> (terminals) are its constituent physical parts.</li>
  <li><strong>Store &harr; Items (Inventory):</strong> The <em>Store</em> contains a collection of sellable <em>Items</em>.</li>
  <li><strong>Register &harr; Cash Drawer / Barcode Scanner:</strong> The physical <em>Register</em> unit is composed of a <em>CashDrawer</em>, <em>BarcodeScanner</em>, and <em>ReceiptPrinter</em>.</li>
  <li><strong>Sale &harr; SalesLineItems:</strong> A <em>Sale</em> (whole transaction) is composed of one or more <em>SalesLineItems</em> (part items purchased with quantity and calculated subtotal).</li>
  <li><strong>Store &harr; Cashiers:</strong> The <em>Store</em> employs and contains multiple <em>Cashiers</em>.</li>
</ol>`,
    explanation: '<p>Directly drawn from CS504 Handouts Page 95&ndash;100 covering Coad\'s Whole-Part structure analysis in Connie\'s Store case study. Appeared 4 times in past papers.</p>',
    urdu_answer: `کونی کے پوائنٹ آف سیل سسٹم کیس اسٹڈی میں دریافت کیے گئے اہم ہول-پارٹ (Whole-Part) اسٹرکچرز:
1. اسٹور اور رجسٹرز (Store & Register): اسٹور ایک مکمل ادارہ ہے جبکہ کیش رجسٹرز اس کے اجزاء ہیں۔
2. اسٹور اور آئٹمز (Store & Items): اسٹور انوینٹری کی مختلف اشیاء پر مشتمل ہوتا ہے۔
3. کیش رجسٹر اور ہارڈویئر (Register & CashDrawer/Scanner): رجسٹر ہارڈویئر کیش دراز اور اسکینر پر مشتمل ہوتا ہے۔
4. سیل اور سیلز لائن آئٹمز (Sale & SalesLineItems): ہر سیل ٹرانزیکشن ایک یا ایک سے زیادہ خریدی گئی اشیاء (SalesLineItems) پر مشتمل ہوتی ہے۔`
  },
  {
    stem: 'Keeping in mind Connie’s case study, what rules of thumb were identified for "Who I Know" relationships? List them down.',
    correct: `<p>In Peter Coad’s object modeling methodology for Connie\'s Convenience Store, several practical <strong>"Who I Know" / "Whom I Know"</strong> rules of thumb were established to establish association links between collaborating classes:</p>
<ul>
  <li><strong>Rule 1 (Container to Content):</strong> A container class knows the objects it directly holds (e.g., <em>Store knows its Registers, Cashiers, and Items</em>).</li>
  <li><strong>Rule 2 (Transaction to Participants):</strong> A transaction object knows the actor who conducted it and the tangible terminal where it occurred (e.g., <em>Sale knows Cashier, Register, and Customer</em>).</li>
  <li><strong>Rule 3 (Transaction to Transaction Lines):</strong> A transaction knows its detail line items, and each line item knows its corresponding generic item specification (e.g., <em>Sale knows SalesLineItems; SalesLineItem knows Item</em>).</li>
  <li><strong>Rule 4 (Session to Terminal and User):</strong> An active work session knows the physical register terminal and the logged-in cashier (e.g., <em>Session knows Cashier and Register</em>).</li>
  <li><strong>Rule 5 (Minimizing Redundant Couplings):</strong> Avoid circular associations where two peers know each other unless bidirectional navigation is strictly required by a business rule.</li>
</ul>`,
    explanation: '<p>Based on CS504 Handout Page 99&ndash;102 on Coad\'s rules of thumb for associating collaborating classes in the POS case study. Appeared 4 times in past papers.</p>',
    urdu_answer: `کونی کی کیس اسٹڈی میں "Who I Know" (کون کس کو جانتا ہے) کے اصول:
1. کنٹینر کا مواد کو جاننا: کنٹینر کلاس اپنے اندر موجود چیزوں سے واقف ہوتی ہے (جیسے Store اپنے Registers اور Cashiers کو جانتا ہے)۔
2. ٹرانزیکشن کا شرکاء کو جاننا: ہر ٹرانزیکشن اپنے کرنے والے اور مقام سے واقف ہوتی ہے (جیسے Sale ٹرانزیکشن Cashier اور Register سے منسلک ہوتی ہے)۔
3. ٹرانزیکشن لائنز کا تعلق: سیل ٹرانزیکشن اپنے تمام SalesLineItems اور متعلقہ Item کیٹلاگ کو جانتی ہے۔
4. سیشن کا تعلق: لاگ ان Session اپنے متحرک Cashier اور مخصوص Register سے واقف ہوتا ہے۔`
  },
  {
    stem: 'Develop an overall Purpose Statement (in 25 words or less) for Connie\'s Convenience Store Point of Sale System.',
    correct: `<p><strong>Purpose Statement:</strong></p>
<blockquote>
  <p><em>"To record checkout transactions, manage inventory in real time, and generate accurate sales and cash flow reports for Connie’s Convenience Store."</em></p>
</blockquote>
<p><em>(Word count: 22 words)</em></p>`,
    explanation: '<p>Concise purpose statement adhering to the standard Peter Coad OOA criteria (under 25 words capturing core business objectives: recording transactions, tracking inventory, and business reporting) from CS504 Handout Page 98. Appeared 2 times in past papers.</p>',
    urdu_answer: `کونی کی کنوینینس اسٹور کے POS سسٹم کا جامع مقصد (Purpose Statement):
"کونی کی سہولت اسٹور کے لیے خریداری اور ادائیگیوں کا باقاعدہ اندراج کرنا، انوینٹری کو کنٹرول کرنا، اور فروخت و کیش کے درست کاروباری نتائج کا تجزیہ کرنا۔"`
  }
];

// 2 Long Questions for Lecture 18
const longQuestions = [
  {
    stem: 'Explain Peter Coad’s Object Model Derivation methodology using Connie’s Convenience Store (Point of Sale System) as a case study. Discuss how System Features, System Purpose, Transactions, Container Classes, and Tangible Things are identified.',
    correct: `<p>In Lecture 18 of CS504, <strong>Peter Coad’s Object-Oriented Analysis methodology</strong> is applied to Connie’s Convenience Store to systematically derive an object model from informal problem descriptions. Coad’s methodology follows a structured discovery pipeline:</p>

<h3>1. Establishing System Purpose</h3>
<p>Before identifying classes, analysts formulate a concise statement (25 words or less) declaring the operational goals of the system. For Connie\'s Store: <em>"To record sales, manage inventory, track payments, and provide financial audit reports for store management."</em></p>

<h3>2. Defining Core System Features</h3>
<p>Coad categorizes system features under three fundamental business facets:</p>
<ul>
  <li><strong>Conduct Business:</strong> Processing cash and credit sales, item scanning, price lookups, change calculation, and receipt generation.</li>
  <li><strong>Log Information:</strong> Recording timestamped transactions (Sales, Payments, Cashier shifts, Returns).</li>
  <li><strong>Analyze Business Results:</strong> Calculating daily revenue, tracking top-selling inventory, and auditing cash drawer discrepancies.</li>
</ul>

<h3>3. Object Classification Strategy</h3>
<p>Coad utilizes targeted domain categories to identify robust candidate classes:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Category</th>
      <th>Definition</th>
      <th>Connie\'s Store Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Container Classes</strong></td>
      <td>Entities that physically or conceptually hold collections of other objects.</td>
      <td><code>Store</code> (holds registers, cashiers, inventory).</td>
    </tr>
    <tr>
      <td><strong>Tangible Things</strong></td>
      <td>Physical devices and hardware in the workplace.</td>
      <td><code>Register</code>, <code>CashDrawer</code>, <code>BarcodeScanner</code>, <code>Item</code>.</td>
    </tr>
    <tr>
      <td><strong>Transactions</strong></td>
      <td>Historical moments in time that must be permanently tracked for business accounting.</td>
      <td><code>Sale</code>, <code>Payment</code>, <code>Return</code>, <code>Session</code>.</td>
    </tr>
    <tr>
      <td><strong>Roles / Actors</strong></td>
      <td>People and organizations interacting with the system.</td>
      <td><code>Cashier</code>, <code>Customer</code>, <code>StoreManager</code>.</td>
    </tr>
  </tbody>
</table>

<h3>4. Deriving Relationships & Multiplicities</h3>
<p>Once candidate classes are classified, Whole-Part aggregations (<em>"What are my components?"</em>) and Generalization hierarchies are established, culminating in a resilient, maintainable object architecture.</p>`,
    explanation: '<p>Comprehensive 5-mark question detailing Peter Coad’s OOA process applied to the Connie’s Convenience Store POS system (CS504 Handouts Page 95&ndash;102). Appeared 4 times in past papers.</p>',
    urdu_answer: `پیٹر کوآڈ کی میتھڈولوجی اور کونی کی کنوینینس اسٹور کا آبجیکٹ ماڈل:
1. سسٹم کا مقصد (Purpose Statement): 25 یا اس سے کم الفاظ میں سسٹم کا واضح ہدف بیان کرنا (سیلز ریکارڈ کرنا، انوینٹری سنبھالنا، اور کیش رپورٹس بنانا)۔
2. سسٹم کے فیچرز کی کیٹیگریز:
- کاروبار چلانا (Conduct Business): بارکوڈ اسکیننگ، قیمتوں کی جانچ، اور رسید جاری کرنا۔
- معلومات لاگ کرنا (Log Information): سیلز، ریٹرنز اور کیشیئر سیشنز کا اندراج۔
- تجزیہ کرنا (Analyze Results): منافع اور فروخت کا تفصیلی جائزہ۔
3. آبجیکٹ کلاسز کی درجہ بندی:
- کنٹینر کلاسز (Container Classes): Store جو تمام اشیاء اور کاؤنٹرز کو سنبھالتا ہے۔
- ٹھوس اشیاء (Tangible Things): Register, Barcode Scanner, Item.
- ٹرانزیکشنز (Transactions): Sale, Payment, Session.
- کردار (Roles): Cashier, Customer.`
  },
  {
    stem: 'Discuss the "Who I Know" and "Whom I Know" rules of thumb used in object modeling for Connie’s Convenience Store. Illustrate with examples such as Store, Session, Sale, Register, and Cashier.',
    correct: `<p>In Peter Coad’s object modeling approach, once classes are identified, the next critical step is establishing associations using the intuitive heuristic of <strong>"Who I Know"</strong> (outgoing knowledge) and <strong>"Whom I Know"</strong> (incoming references):</p>

<h3>1. The "Who I Know" Paradigm</h3>
<p>An object needs an association link to another object only if it requires access to that object’s data or needs to send messages requesting its services. Applying this to Connie\'s POS system:</p>

<h3>2. Concrete Examples from Connie\'s Store</h3>
<ul>
  <li><strong>Store ("Who I Know"):</strong>
    <ul>
      <li><code>Store</code> knows its collection of <code>Registers</code>, <code>Cashiers</code>, and <code>Items</code>.</li>
      <li><em>Rationale:</em> The store is the root container responsible for locating available registers and checking warehouse inventory.</li>
    </ul>
  </li>
  <li><strong>Session ("Who I Know"):</strong>
    <ul>
      <li>An active <code>Session</code> knows the specific <code>Cashier</code> logged in and the <code>Register</code> being utilized.</li>
      <li><em>Rationale:</em> For audit logging, every session must bind an authorized cashier to a physical register terminal.</li>
    </ul>
  </li>
  <li><strong>Sale ("Who I Know"):</strong>
    <ul>
      <li>A <code>Sale</code> knows its <code>Session</code> (or Register & Cashier) and its constituent <code>SalesLineItems</code>.</li>
      <li><em>Rationale:</em> A sale must know what items were purchased and which session authorized the transaction.</li>
    </ul>
  </li>
  <li><strong>SalesLineItem ("Who I Know"):</strong>
    <ul>
      <li>Each <code>SalesLineItem</code> knows the underlying <code>Item</code> product description and price.</li>
      <li><em>Rationale:</em> The line item calculates subtotal by invoking <code>item.getPrice() * quantity</code>.</li>
    </ul>
  </li>
</ul>

<h3>3. Design Benefits of Coad\'s Heuristics</h3>
<ol>
  <li><strong>Prevents Over-Coupling:</strong> Cashiers do not need direct references to inventory Items; interactions route through the Sale transaction.</li>
  <li><strong>Clear Navigation Paths:</strong> Responsibilities flow logically from container &rarr; session &rarr; transaction &rarr; line items &rarr; products.</li>
</ol>`,
    explanation: '<p>Comprehensive analysis of Coad’s "Who I Know" heuristic applied to Store, Session, Sale, Register, and Cashier associations (CS504 Handouts Page 99&ndash;102). Appeared 3 times in past papers.</p>',
    urdu_answer: `کونی کے اسٹور میں "Who I Know" اصول اور آبجیکٹس کے باہمی رابطے:
1. "Who I Know" کا فلسفہ: ایک آبجیکٹ کو دوسرے آبجیکٹ سے صرف اسی وقت لنک ہونا چاہیے جب اسے دوسرے آبجیکٹ کی معلومات یا سروسز کی ضرورت ہو۔
2. کونی کیس اسٹڈی کی مثالیں:
- اسٹور (Store): اپنے تمام Registers، Cashiers اور Items کو جانتا ہے۔
- سیشن (Session): لاگ ان شدہ Cashier اور زیر استعمال Register کو جانتا ہے تاکہ آڈٹ محفوظ رہے۔
- سیل (Sale): اپنے سیشن اور خریدی گئی اشیاء (SalesLineItems) کو جانتی ہے۔
- سیلز لائن آئٹم (SalesLineItem): اصل Item کو جانتا ہے تاکہ اس کی قیمت حاصل کر کے کل رقم معلوم کر سکے۔
3. ڈیزائن کا فائدہ: یہ اصول غیر ضروری کپلنگ کو روکتا ہے اور سسٹم کے کنٹرول فلو کو سادہ بناتا ہے۔`
  }
];

// Insert MCQs
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 18.`);

// Insert Short Questions
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 18.`);

// Insert Long Questions
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 18.`);

// Verify totals
const totalForLec = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId).c;
console.log(`Lecture 18 questions total: ${totalForLec}`);

const grandTotal = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
console.log(`Overall database questions total: ${grandTotal}`);

db.close();

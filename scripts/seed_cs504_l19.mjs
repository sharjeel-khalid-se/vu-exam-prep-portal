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

// 2. Create or fetch Lecture 19 for CS504
let lec19 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 19").get(cs504.id);
if (!lec19) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 19, ?)
  `).run(cs504.id, 'Object-Oriented Analysis: Identify Structures (Gen-Spec & Whole-Part)');
  lec19 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 19 with ID: ${lec19.id}`);
} else {
  console.log(`CS504 Lecture 19 found with ID: ${lec19.id}`);
}

const lId = lec19.id;

// 3. Clear existing questions for Lecture 19 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 19.`);

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

// 6 MCQs for Lecture 19
const mcqs = [
  {
    stem: 'Identifying Gen-Spec structures means identifying ______.',
    options: {
      a: 'Aggregation',
      b: 'Hierarchy',
      c: 'Associations',
      d: 'Whole-part'
    },
    correct: 'b',
    explanation: '<p>In Peter Coad\'s methodology, identifying Generalization-Specialization (Gen-Spec) structures means identifying the classification and inheritance <strong>Hierarchy</strong> among domain classes (CS504 Handouts Page 93&ndash;94). Appeared 3 times.</p>',
    urdu_answer: 'جن-اسپیک (Gen-Spec) اسٹرکچرز کی شناخت سے مراد کلاسز کے درمیان درجہ بندی یا وراثت کے سلسلے یعنی ہائیرارکی (Hierarchy) کی شناخت کرنا ہے۔'
  },
  {
    stem: 'Identifying Whole-Part structures (Aggregations) means asking "what are my ______".',
    options: {
      a: 'Components',
      b: 'Structures',
      c: 'Objects',
      d: 'Classes'
    },
    correct: 'a',
    explanation: '<p>In Peter Coad\'s Object Modeling methodology, to discover Whole-Part (Aggregation) structures, the analyst inspects each class and asks <em>"What are my parts?"</em> or <em>"What are my components?"</em> (CS504 Handouts Page 95). Appeared 4 times.</p>',
    urdu_answer: 'پیٹر کوآڈ کے مطابق ہول-پارٹ اسٹرکچر دریافت کرنے کا طریقہ یہ ہے کہ ہر کلاس کے لیے پوچھا جائے کہ "میرے اجزاء یا کمپوننٹس (Components) کیا ہیں؟"۔'
  },
  {
    stem: 'A structure is a manner of organization which expresses a ______ strong organization within the problem domain.',
    options: {
      a: 'Semantically',
      b: 'Syntactically',
      c: 'Graphically',
      d: 'None of the given'
    },
    correct: 'a',
    explanation: '<p>In OOA, a structure represents a formal organization expressing a <strong>semantically</strong> strong relationship within the problem domain, reflecting true real-world meaning rather than arbitrary syntax (CS504 Handouts Page 93). Appeared 3 times.</p>',
    urdu_answer: 'آبجیکٹ ماڈل میں اسٹرکچر ایک ایسی تنظیم کا نام ہے جو پرابلم ڈومین کے اندر معنوی طور پر مضبوط (Semantically strong) تعلق کی عکاسی کرتی ہے۔'
  },
  {
    stem: 'In Peter Coad\'s methodology, identifying Gen-Spec structures involves considering each class as a specialization and looking for its ______ and vice versa.',
    options: {
      a: 'Association',
      b: 'Composition',
      c: 'Generalization',
      d: 'Aggregation'
    },
    correct: 'c',
    explanation: '<p>Coad recommends examining candidate classes both bottom-up (viewing each class as a specialization and finding its <strong>Generalization</strong> superclass) and top-down (viewing a class as a generalization and discovering specializations) (CS504 Handouts Page 93&ndash;94). Appeared 2 times.</p>',
    urdu_answer: 'کوآڈ کے طریقہ کار کے مطابق ہر کلاس کو ذیلی تخصیص سمجھ کر اس کی عمومی کلاس (Generalization) تلاش کی جاتی ہے اور عمومی کلاس سے مزید تخصیصات دریافت کی جاتی ہیں۔'
  },
  {
    stem: 'In Peter Coad\'s methodology for Connie\'s Store case study, Payment is generalized into Cash Payment and Authorized Payment, which is further specialized into ______ and ______.',
    options: {
      a: 'Store and Item',
      b: 'Register and Cashier',
      c: 'Check and Card (Credit)',
      d: 'Sale and Return'
    },
    correct: 'c',
    explanation: '<p>In Connie\'s POS system, Authorized Payment requires external verification and is specialized into <strong>Check</strong> and <strong>Card (Credit/Debit)</strong> payments (CS504 Handouts Page 94). Appeared 2 times.</p>',
    urdu_answer: 'کونی کی اسٹور کیس اسٹڈی میں مجاز ادائیگی (Authorized Payment) کو مزید دو ذیلی کلاسز یعنی چیک (Check) اور کریڈٹ کارڈ (Card) میں تقسیم کیا گیا ہے۔'
  },
  {
    stem: 'In UML-based Object Oriented model of a system, the diamond sign is used to depict ______ relations between two objects/classes.',
    options: {
      a: 'Aggregation / Composition',
      b: 'Inheritance',
      c: 'Generalization',
      d: 'Dependency'
    },
    correct: 'a',
    explanation: '<p>In UML class diagrams, a hollow diamond depicts shared <em>Aggregation</em>, while a solid filled diamond depicts strong <em>Composition</em> (both representing Whole-Part relationships) (CS504 Handouts Page 95). Appeared 3 times.</p>',
    urdu_answer: 'یو ایم ایل کلاس ڈایاگرام میں ڈائمنڈ (ہیرے کا نشان) دو کلاسز کے درمیان ایگریگیشن یا کمپوزیشن (Aggregation / Composition) کے ہول-پارٹ تعلق کو ظاہر کرتا ہے۔'
  }
];

// 3 Short Questions for Lecture 19
const shortQuestions = [
  {
    stem: 'What is the main objective of "Identify Structures" in Peter Coad\'s methodology?',
    correct: `<p>In Peter Coad\'s Object-Oriented Analysis (OOA) methodology, the primary objective of <strong>Activity 2: "Identify Structures"</strong> is:</p>
<ol>
  <li><strong>Establishing Problem Domain Organization:</strong> To organize isolated candidate classes into semantically meaningful relationships that accurately reflect the real-world problem domain.</li>
  <li><strong>Discovering Inheritance Hierarchies:</strong> To uncover <em>Generalization-Specialization (Gen-Spec)</em> structures, allowing common attributes and services to be abstracted into superclasses to promote code reuse and polymorphism.</li>
  <li><strong>Documenting Whole-Part Compositions:</strong> To discover <em>Whole-Part (Aggregation/Composition)</em> structures that describe how composite domain entities are assembled from constituent parts.</li>
  <li><strong>Reducing Domain Complexity:</strong> By imposing hierarchical and compositional structures, the conceptual complexity of the system is partitioned into manageable subsystems.</li>
</ol>`,
    explanation: '<p>Drawn from CS504 Handouts Page 93&ndash;96 on the core objectives and benefits of the "Identify Structures" activity in Peter Coad\'s OOA framework. Appeared 2 times in past papers.</p>',
    urdu_answer: `پیٹر کوآڈ کے طریقہ کار میں "اسٹرکچرز کی شناخت" (Identify Structures) کا بنیادی مقصد یہ ہے:
1. ڈومین کے باہمی تعلقات کی تشکیل: الگ تھلگ کلاسز کو حقیقی دنیا کے معنوی رشتوں میں ترتیب دینا۔
2. وراثت (Inheritance) کی دریافت: جنرلائزیشن-اسپیشلائزیشن کے ذریعے مشترکہ خصوصیات اور افعال کو سپر کلاس میں اکٹھا کرنا تاکہ کوڈ کا دوبارہ استعمال ممکن ہو۔
3. ہول-پارٹ (Whole-Part) تعلقات: یہ واضح کرنا کہ کون سی اشیاء کن اجزاء سے مل کر بنی ہیں۔
4. پیچیدگی کو کم کرنا: سسٹم کے ماڈل کو منظم ذیلی حصوں میں تقسیم کر کے اس کی سمجھ کو آسان بنانا۔`
  },
  {
    stem: 'Differentiate between Gen-Spec (Hierarchy) and Whole-Part (Aggregation) structures with an example from Connie\'s Point of Sale system.',
    correct: `<p>In Object-Oriented Analysis, <strong>Gen-Spec</strong> and <strong>Whole-Part</strong> represent two fundamentally distinct organizational structures:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Feature</th>
      <th>Gen-Spec (Generalization-Specialization)</th>
      <th>Whole-Part (Aggregation / Composition)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Conceptual Relationship</strong></td>
      <td><strong>"is-a"</strong> or "is-a-kind-of" relationship.</td>
      <td><strong>"has-a"</strong> or "is-part-of" relationship.</td>
    </tr>
    <tr>
      <td><strong>Organizational Mechanism</strong></td>
      <td>Classification and inheritance hierarchy where subclasses inherit attributes and operations from a superclass.</td>
      <td>Compositional assembly where a whole composite object contains or references its constituent parts.</td>
    </tr>
    <tr>
      <td><strong>UML Graphical Symbol</strong></td>
      <td>Closed hollow triangle pointing toward the superclass.</td>
      <td>Hollow diamond (Aggregation) or filled diamond (Composition) attached to the whole.</td>
    </tr>
    <tr>
      <td><strong>Connie\'s POS Example</strong></td>
      <td><code>CheckPayment</code> <em>is-a</em> <code>AuthorizedPayment</code> which <em>is-a</em> <code>Payment</code>.</td>
      <td>A <code>Register</code> <em>has-a</em> <code>CashDrawer</code>; a <code>Sale</code> <em>has</em> multiple <code>SalesLineItems</code>.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p>Direct comparison table contrasting "is-a" Gen-Spec inheritance vs "has-a" Whole-Part aggregation with concrete examples from Connie\'s Store (CS504 Handouts Page 93&ndash;96). Appeared 3 times in past papers.</p>',
    urdu_answer: `جن-اسپیک (Gen-Spec) اور ہول-پارٹ (Whole-Part) اسٹرکچرز میں واضح فرق:
1. بنیادی رشتہ: Gen-Spec وراثت کا "is-a" رشتہ ہے (مثلاً کریڈٹ کارڈ ایک قسم کی مجاز ادائیگی ہے)؛ جبکہ Whole-Part "has-a" یعنی اجزاء کا رشتہ ہے (مثلاً کیش رجسٹر میں کیش دراز ہوتا ہے)۔
2. تنظیم کا طریقہ: Gen-Spec میں ذیلی کلاس سپر کلاس سے خصوصیات اور میتھڈز حاصل کرتی ہے؛ جبکہ Whole-Part میں ایک مکمل آبجیکٹ اپنے اندر چھوٹے پرزے یا اجزاء رکھتا ہے۔
3. کونی کی POS مثال:
- Gen-Spec: CheckPayment -> AuthorizedPayment -> Payment.
- Whole-Part: Store -> Registers, Sale -> SalesLineItems.`
  },
  {
    stem: 'Keeping Connie’s case study in mind, as discussed in lecture, list down whole-part structures which were identified.',
    correct: `<p>In the Object-Oriented Analysis of Connie’s Convenience Store (Point of Sale System), the primary <strong>Whole-Part</strong> structures identified are:</p>
<ol>
  <li><strong>Store &harr; Registers:</strong> The <em>Store</em> is the whole container; individual <em>Registers</em> (terminals) are its constituent physical components.</li>
  <li><strong>Store &harr; Cashiers:</strong> The <em>Store</em> employs and organizes multiple <em>Cashiers</em>.</li>
  <li><strong>Store &harr; Items (Inventory):</strong> The <em>Store</em> manages a catalog collection of sellable <em>Items</em>.</li>
  <li><strong>Register &harr; Cash Drawer / Barcode Scanner / Receipt Printer:</strong> The physical <em>Register</em> unit is assembled from a <em>CashDrawer</em>, <em>BarcodeScanner</em>, and <em>ReceiptPrinter</em>.</li>
  <li><strong>Sale &harr; SalesLineItems:</strong> A <em>Sale</em> transaction (whole) is composed of one or more <em>SalesLineItems</em> (part lines containing item reference, quantity, and subtotal).</li>
</ol>`,
    explanation: '<p>Comprehensive listing of Whole-Part structures identified in Connie\'s Store case study according to CS504 Handouts Page 95&ndash;96. Appeared 4 times in past papers.</p>',
    urdu_answer: `کونی کی کنوینینس اسٹور کیس اسٹڈی میں شناخت کیے گئے ہول-پارٹ (Whole-Part) اسٹرکچرز:
1. اسٹور اور رجسٹرز (Store & Registers): اسٹور ایک مکمل ادارہ ہے جس کے اندر متعدد کیش کاؤنٹرز ہوتے ہیں۔
2. اسٹور اور کیشیئرز (Store & Cashiers): اسٹور میں کام کرنے والے کیشیئرز اس کا حصہ ہیں۔
3. اسٹور اور اشیاء (Store & Items): اسٹور کے پاس فروخت کے لیے مختلف اشیاء کا ذخیرہ ہوتا ہے۔
4. کیش رجسٹر اور پرزے (Register & Components): رجسٹر مشین کیش دراز، اسکینر اور پرنٹر پر مشتمل ہوتی ہے۔
5. سیل اور سیلز لائن آئٹمز (Sale & SalesLineItems): ہر سیل ٹرانزیکشن خریدی گئی اشیاء کی تفصیلی لسٹ پر مشتمل ہوتی ہے۔`
  }
];

// 2 Long Questions for Lecture 19
const longQuestions = [
  {
    stem: 'Explain Activity 2 (Identify Structures) in Peter Coad\'s Object Modeling methodology. Detail the two steps: Identifying Gen-Spec Structures and Identifying Whole-Part Structures, using the Payment and Store examples.',
    correct: `<p>In Peter Coad\'s Object-Oriented Analysis methodology, <strong>Activity 2: "Identify Structures"</strong> is the foundational phase where isolated classes identified in Activity 1 are organized into meaningful architectural networks. It comprises two distinct procedural steps:</p>

<h3>Step 1: Identifying Gen-Spec Structures (Generalization-Specialization)</h3>
<p>Gen-Spec structures capture "is-a-kind-of" classification hierarchies. Coad specifies a bidirectional discovery procedure:</p>
<ul>
  <li><strong>Bottom-Up Exploration:</strong> Take each candidate class, consider it as a specialization, and look for a more generalized concept that subsumes it.</li>
  <li><strong>Top-Down Exploration:</strong> Take each generalized class and look for meaningful specializations that require distinct attributes or override behaviors.</li>
  <li><strong>The Payment Hierarchy Example:</strong>
    <ul>
      <li>In Connie\'s Store, customers can pay using diverse instruments. Rather than creating disjoint classes, Coad establishes <code>Payment</code> as the root generalization (holding <code>amount</code> and <code>timestamp</code>).</li>
      <li><code>Payment</code> is specialized into <code>CashPayment</code> (which needs <code>amountTendered</code> and <code>changeDue</code>) and <code>AuthorizedPayment</code> (which requires external electronic clearing).</li>
      <li><code>AuthorizedPayment</code> is further specialized into <code>CheckPayment</code> (with <code>bankRoutingNo</code>, <code>checkNo</code>) and <code>CardPayment</code> (with <code>cardNumber</code>, <code>cardExpiry</code>, <code>authCode</code>).</li>
    </ul>
  </li>
</ul>

<h3>Step 2: Identifying Whole-Part Structures (Aggregation / Composition)</h3>
<p>Whole-Part structures model "has-a" or "consists-of" physical and conceptual configurations. Analysts inspect each class and ask: <em>"What are my parts?"</em> and <em>"What whole do I belong to?"</em></p>
<ul>
  <li><strong>Store as a Container Whole:</strong> A <code>Store</code> is the whole aggregate consisting of parts: <code>Registers</code>, <code>Cashiers</code>, and <code>InventoryItems</code>. If the store closes, its inventory and terminals remain identifiable physical assets (shared aggregation).</li>
  <li><strong>Register Hardware Assembly:</strong> A <code>Register</code> is physically composed of a <code>CashDrawer</code>, <code>BarcodeScanner</code>, and <code>ReceiptPrinter</code>.</li>
  <li><strong>Sale Transaction Composition:</strong> A <code>Sale</code> whole contains a collection of <code>SalesLineItems</code>. This is a tight composition: if a sale transaction is aborted, its individual line items cease to exist.</li>
</ul>

<h3>Benefits of Activity 2</h3>
<p>Structuring the domain model eliminates duplicated code via inheritance, bounds system scope, and establishes explicit communication channels for subsequent interaction modeling.</p>`,
    explanation: '<p>Comprehensive 5-mark subjective question detailing Activity 2 of Peter Coad’s methodology: Gen-Spec discovery (Payment hierarchy) and Whole-Part discovery (Store and Sale assemblies) from CS504 Handouts Page 93&ndash;96. Appeared 3 times in past papers.</p>',
    urdu_answer: `پیٹر کوآڈ کے آبجیکٹ ماڈلنگ کے طریقہ کار میں سرگرمی 2 (Identify Structures) کی تفصیل:
1. جنرلائزیشن-اسپیشلائزیشن (Gen-Spec) اسٹرکچرز کی شناخت:
- یہ درجہ بندی اور وراثت (Inheritance) کا رشتہ ہے جو "is-a" پر مبنی ہوتا ہے۔
- ادائیگی (Payment) کی مثال: سب سے اوپر عام کلاس Payment ہے جس میں رقم اور وقت محفوظ ہوتے ہیں۔ اسے CashPayment اور AuthorizedPayment میں تقسیم کیا گیا۔ بعد ازاں مجاز ادائیگی کو CheckPayment اور CardPayment میں ذیلی تقسیم کیا گیا۔
2. ہول-پارٹ (Whole-Part) اسٹرکچرز کی شناخت:
- یہ اجزاء اور پرزوں کا رشتہ ہے جو "has-a" پر مبنی ہوتا ہے۔ اس میں سوال کیا جاتا ہے کہ "میرے اجزاء کیا ہیں؟"۔
- اسٹور اور سیل کی مثال: Store ایک بڑا کنٹینر ہے جس کے اندر کیش کاؤنٹرز اور اشیاء موجود ہیں۔ اسی طرح Sale ایک مکمل ٹرانزیکشن ہے جو اپنے اندر متعدد SalesLineItems رکھتی ہے۔
3. فوائد: اس سے کوڈ کی نقل ختم ہوتی ہے اور سسٹم کی اندرونی ساخت انتہائی واضح اور منظم ہو جاتی ہے۔`
  },
  {
    stem: 'Given a class diagram scenario (e.g., "Payment System" or "Sugar Factory Assembly"), identify the primary object relationships (Generalization-Specialization, Aggregation, Association) and explain how inheritance hierarchy simplifies class definitions.',
    correct: `<p>In modern Object-Oriented Software Engineering, class diagrams express three primary relationship categories to capture structural semantics:</p>

<h3>1. Primary Object Relationships</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Relationship</th>
      <th>Semantics & UML Notation</th>
      <th>Domain Application</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Generalization-Specialization</strong></td>
      <td>"is-a" inheritance relationship. Solid line with a <strong>hollow triangle</strong> pointing to the superclass.</td>
      <td><code>CreditCardPayment</code> is-a <code>Payment</code>; <code>Supervisor</code> is-a <code>Employee</code>.</td>
    </tr>
    <tr>
      <td><strong>Aggregation & Composition</strong></td>
      <td>"has-a" Whole-Part relationship. Solid line with a <strong>hollow diamond</strong> (Aggregation) or <strong>filled diamond</strong> (Composition) at the whole end.</td>
      <td><code>SugarMill</code> has <code>Boilers</code> and <code>Crushers</code>; <code>Invoice</code> is composed of <code>InvoiceLines</code>.</td>
    </tr>
    <tr>
      <td><strong>Association</strong></td>
      <td>"knows-a" or "collaborates-with" peer relationship. Solid line with optional navigation arrow and multiplicity labels.</td>
      <td><code>Cashier</code> serves <code>Customer</code>; <code>Register</code> records <code>Sale</code>.</td>
    </tr>
  </tbody>
</table>

<h3>2. How Inheritance Hierarchy Simplifies Class Definitions</h3>
<ul>
  <li><strong>Attribute & Method Factoring:</strong> Common state variables (e.g., <code>transactionId</code>, <code>amount</code>, <code>timestamp</code>) and base routines (e.g., <code>generateReceipt()</code>) are declared once in the superclass. Derived classes inherit them automatically without redefinition.</li>
  <li><strong>Polymorphic Substitution:</strong> Client modules (such as a <code>CheckoutController</code>) interact with the abstract superclass <code>Payment</code> via a common interface (<code>process()</code>). New payment types (e.g., <em>ApplePay</em>, <em>CryptoPayment</em>) can be added to the system without altering existing checkout algorithms (Open-Closed Principle).</li>
  <li><strong>Localized Maintenance:</strong> If payment validation rules change, modifications are performed in a single location within the base class, eliminating bug duplication across sibling classes.</li>
</ul>`,
    explanation: '<p>Comprehensive 5-mark subjective question detailing Generalization, Aggregation, and Association relationships, and demonstrating how inheritance simplifies software architecture (CS504 Handouts Page 93&ndash;96). Appeared 3 times in past papers.</p>',
    urdu_answer: `کلاس ڈایاگرام کے بنیادی تعلقات اور وراثت (Inheritance) کے فوائد:
1. بنیادی تعلقات کی اقسام:
- جنرلائزیشن-اسپیشلائزیشن (Gen-Spec): "is-a" رشتہ جیسے CreditCardPayment ایک Payment ہے۔ (علامت: خالی تکون)۔
- ایگریگیشن اور کمپوزیشن (Whole-Part): "has-a" رشتہ جیسے فیکٹری میں بوائلرز اور مشینیں ہوتی ہیں۔ (علامت: ڈائمنڈ)۔
- ایسوسی ایشن (Association): دو آزاد کلاسز کا باہمی رابطہ جیسے کیشیئر اور کسٹمر۔ (علامت: سیدھی لائن)۔

2. وراثت سے کلاس کی تعریف کیسے آسان ہوتی ہے؟
- کوڈ کی بچت: مشترکہ ایٹریبیوٹس (جیسے رقم، تاریخ) صرف سپر کلاس میں ایک بار لکھے جاتے ہیں، سب کلاسز انہیں خود حاصل کر لیتی ہیں۔
- پولی مورفزم: مین پروگرام صرف بنیادی کلاس Payment کے ذریعے سب کو چلا سکتا ہے، نیا پیمنٹ میتھڈ شامل کرنے پر پرانے کوڈ کو چھیڑنا نہیں پڑتا۔
- آسان دیکھ بھال: کسی اصول میں تبدیلی صرف ایک جگہ (سپر کلاس) میں کرنے سے تمام ذیلی کلاسز میں خود بخود نافذ ہو جاتی ہے۔`
  }
];

// Insert MCQs
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 19.`);

// Insert Short Questions
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 19.`);

// Insert Long Questions
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 19.`);

// Verify totals
const totalForLec = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId).c;
console.log(`Lecture 19 questions total: ${totalForLec}`);

const grandTotal = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
console.log(`Overall database questions total: ${grandTotal}`);

db.close();

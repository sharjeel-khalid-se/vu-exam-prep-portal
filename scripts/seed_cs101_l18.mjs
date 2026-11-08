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

// 2. Create or fetch Lecture 18
let lec18 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 18").get(cs101.id);
if (!lec18) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 18, 'Introduction to JavaScript, Data Types, and Client-Side Scripting')
  `).run(cs101.id);
  lec18 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 18 with ID: ${lec18.id}`);
} else {
  console.log(`CS101 Lecture 18 found with ID: ${lec18.id}`);
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

// 14 MCQs
const mcqs = [
  {
    stem: 'What is the correct JavaScript statement to dynamically write and render the string "Hello World" directly into an HTML document body?',
    options: {
      a: '("Hello World")',
      b: 'echo "Hello World"',
      c: 'response.write("Hello World")',
      d: 'document.write("Hello World")'
    },
    correct: 'd',
    explanation: '<p>The <code>document.write()</code> method writes raw HTML expressions or text directly to the active document stream being parsed by the browser.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers (marked *From Lecture # 18* in <code>cs101-lecturewise-midterm.pdf</code> and <code>cs101-lecturewise-midterm-solved-mcqs.pdf</code>).</p>',
    urdu_answer: 'جاوا اسکرپٹ میں ویب پیج پر ٹیکسٹ دکھانے کے لیے document.write("Hello World") کا سینٹیکس استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Where is the permissible and syntactically correct location to insert a `<script>` tag containing JavaScript code in an HTML document?',
    options: {
      a: 'Inside the `<head>` section only',
      b: 'Inside the `<body>` section only',
      c: 'Both in the `<head>` section and in the `<body>` section',
      d: 'Strictly outside the `<html>` root tags'
    },
    correct: 'c',
    explanation: '<p>JavaScript can be embedded within the <code>&lt;head&gt;</code> section, the <code>&lt;body&gt;</code> section, or linked externally in either section.</p><p><strong>Reference:</strong> Appeared 14+ times across past papers in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'جاوا اسکرپٹ کوڈ کو HTML دستاویز کے &lt;head&gt; اور &lt;body&gt; دونوں حصوں میں کہیں بھی درج کیا جا سکتا ہے۔'
  },
  {
    stem: 'Which built-in JavaScript method is used to display a message to the user in a modal popup alert dialog box?',
    options: {
      a: 'alert("Hello World")',
      b: 'alertBox = "Hello World"',
      c: 'alertBox("Hello World")',
      d: 'msgBox("Hello World")'
    },
    correct: 'a',
    explanation: '<p>The <code>alert("Hello World")</code> method displays an alert box with a specified message and an OK button to halt user action until acknowledged.</p><p><strong>Reference:</strong> Appeared 18+ times across past papers in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں پاپ اپ الرٹ باکس ظاہر کرنے کے لیے alert("Hello World") لکھا جاتا ہے۔'
  },
  {
    stem: 'What is the correct JavaScript syntax to display a text string inside the web browser window\'s status bar?',
    options: {
      a: 'window.status("put your message here")',
      b: 'status("put your message here")',
      c: 'window.status = "put your message here"',
      d: 'statusbar = "put your message here"'
    },
    correct: 'c',
    explanation: '<p>In traditional browser object models, the <code>window.status</code> property is assigned a string value: <code>window.status = "message"</code>.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'براؤزر کے اسٹیٹس بار میں پیغام دکھانے کے لیے window.status = "message" پراپرٹی استعمال کی جاتی ہے۔'
  },
  {
    stem: 'According to classical CS101 handouts, what are the four fundamental primitive data types in JavaScript?',
    options: {
      a: 'Strings, numbers, BooBoos, and nulls',
      b: 'Strings, text, Booleans, and nulls',
      c: 'Strings, numbers, Booleans, and nulls',
      d: 'Strings, numbers, Booleans, and zeros'
    },
    correct: 'c',
    explanation: '<p>The foundational core primitive data types in classical JavaScript are: <strong>Strings, Numbers, Booleans, and Nulls</strong>.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>cs101-lecturewise-midterm.pdf</code> and <code>cs101-lecturewise-midterm-solved-mcqs.pdf</code>.</p>',
    urdu_answer: 'جاوا اسکرپٹ کی چار بنیادی بنیادی ڈیٹا ٹائپس یہ ہیں: اسٹرنگز (Strings)، نمبرز (Numbers)، بولینز (Booleans)، اور نل (Nulls)۔'
  },
  {
    stem: 'Which of the following architectural descriptions best categorizes the JavaScript language?',
    options: {
      a: 'A low-level assembly language',
      b: 'A compiled server-side system language',
      c: 'A bytecode-precompiled executable script',
      d: 'An object-based client-side scripting language'
    },
    correct: 'd',
    explanation: '<p>JavaScript is an <strong>object-based client-side scripting language</strong>. It provides built-in objects (like Window and Document) without strictly enforcing classical class-based OOP inheritance hierarchies.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers in <code>cs101-lecturewise-midterm.pdf</code> and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code>.</p>',
    urdu_answer: 'جاوا اسکرپٹ بنیادی طور پر ایک آبجیکٹ بیسڈ کلائنٹ سائیڈ اسکرپٹنگ لینگویج (Object-based scripting language) ہے جو براؤزر کے اندر چلتی ہے۔'
  },
  {
    stem: 'Which JavaScript property is used to automatically redirect or navigate a site visitor to a different URL web address?',
    options: {
      a: 'document.URL',
      b: 'window.location.href',
      c: 'document.location.href',
      d: 'link.href'
    },
    correct: 'b',
    explanation: '<p>Setting <code>window.location.href = "https://example.com"</code> instructs the browser to immediately navigate and load the specified web address.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'صارف کو کسی دوسرے ویب پیج پر ری ڈائریکٹ کرنے کے لیے window.location.href پراپرٹی استعمال کی جاتی ہے۔'
  },
  {
    stem: 'In JavaScript, the built-in modal dialog method `prompt()` is primarily used to:',
    options: {
      a: 'Display a static warning message without input fields',
      b: 'Capture and accept interactive textual input from the user',
      c: 'Embed an animated vector image into the canvas',
      d: 'Close the current browser window'
    },
    correct: 'b',
    explanation: '<p>The <code>prompt(message, defaultValue)</code> method opens an input dialog allowing the user to type in a string and return it to the script.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں پرامپٹ (prompt) کا طریقہ کار صارف سے ٹیکسٹ ان پٹ لینے کے لیے ایک ڈائیلاگ باکس کھولتا ہے۔'
  },
  {
    stem: 'In JavaScript syntax, semicolons (`;`) placed at the end of statements are strictly mandatory or optional?',
    options: {
      a: 'Optional (Automatic Semicolon Insertion allows line-breaks to terminate statements)',
      b: 'Strictly Mandatory (Syntax error occurs without them)',
      c: 'Prohibited completely in client-side code',
      d: 'Mandatory only inside conditional blocks'
    },
    correct: 'a',
    explanation: '<p>Semicolons are <strong>optional</strong> in JavaScript due to Automatic Semicolon Insertion (ASI), although using them explicitly is considered standard best practice.</p><p><strong>Reference:</strong> Appeared 16+ times across past papers in <code>cs101-lecturewise-midterm.pdf</code> and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code>.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں اسٹیٹمنٹ کے آخر میں سیمی کولن (;) لگانا اختیاری (Optional) ہوتا ہے کیونکہ براؤزر نئی لائن پر خود ہی اسٹیٹمنٹ ختم تسلیم کر لیتا ہے، اگرچہ لگانا بہترین طریقہ ہے۔'
  },
  {
    stem: 'Which of the following statements accurately describes the relationship between JavaScript and the Java programming language?',
    options: {
      a: 'JavaScript is identical to Java in syntax and runtime execution',
      b: 'JavaScript is a compiled subset of Java developed by Sun Microsystems',
      c: 'JavaScript is a completely different language with distinct design and runtime architecture',
      d: 'JavaScript is merely the visual user-interface scripting wrapper of Java'
    },
    correct: 'c',
    explanation: '<p>Despite the similarity in name (introduced for marketing reasons by Netscape), <strong>JavaScript is completely different than Java</strong> in design, paradigm, compilation, and execution.</p><p><strong>Reference:</strong> Appeared 12+ times in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'جاوا اسکرپٹ اور جاوا (Java) دو بالکل الگ اور مختلف زبانیں ہیں، ان کے ڈیزائن، عملدرآمد اور مقاصد میں بنیادی فرق ہے۔'
  },
  {
    stem: 'True or False: JavaScript client-side scripts can only be executed on machines running the Microsoft Windows operating system.',
    options: {
      a: 'TRUE',
      b: 'FALSE'
    },
    correct: 'b',
    explanation: '<p><strong>FALSE</strong>. JavaScript runs inside standard web browser engines across all operating systems, including Windows, macOS, Linux, Android, and iOS.</p><p><strong>Reference:</strong> Appeared 7+ times in <code>cs101-lecturewise-midterm.pdf</code> marked *From Lecture # 18*.</p>',
    urdu_answer: 'یہ غلط (FALSE) ہے۔ جاوا اسکرپٹ ایک پلیٹ فارم انڈیپینڈنٹ زبان ہے جو ونڈوز، میک، لینکس اور موبائل سمیت تمام سسٹمز کے براؤزر میں یکساں چلتی ہے۔'
  },
  {
    stem: 'Which HTML element tag is formally used to enclose client-side JavaScript executable code within an HTML document?',
    options: {
      a: '<javascript>',
      b: '<script>',
      c: '<js>',
      d: '<code>'
    },
    correct: 'b',
    explanation: '<p>The standard HTML element used to enclose client-side scripts is <code>&lt;script&gt;</code>.</p><p><strong>Reference:</strong> Standard web development specification and CS101 Lecture 18 handouts.</p>',
    urdu_answer: 'ایچ ٹی ایم ایل کے اندر جاوا اسکرپٹ کوڈ لکھنے کے لیے &lt;script&gt; ٹیگ استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'What will be the exact string value stored in variable `str` after executing the JavaScript statement: `str = "Hello" + "World";` ?',
    options: {
      a: '"Hello World"',
      b: '"HelloWorld"',
      c: '"Hello+World"',
      d: 'undefined'
    },
    correct: 'b',
    explanation: '<p>The <code>+</code> operator concatenates strings directly without inserting extraneous whitespace: <code>"Hello" + "World" = "HelloWorld"</code>.</p><p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 143 Q8 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q80.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں + آپریٹر اسٹرنگز کو بغیر اضافی اسپیس کے آپس میں جوڑتا ہے، اس لیے اس کا نتیجہ "HelloWorld" بنے گا۔'
  },
  {
    stem: 'Evaluate the following JavaScript code snippet:\n```javascript\npitch = "hard";\nbowler = "slow";\nif ((pitch == "hard") || (bowler == "fast"))\n    myStatus = "Bouncer";\nelse\n    myStatus = "Short Pitch";\n```\nWhat value is assigned to `myStatus`?',
    options: {
      a: '"Bouncer"',
      b: '"Short Pitch"',
      c: 'null',
      d: 'undefined'
    },
    correct: 'a',
    explanation: '<p>The logical OR (<code>||</code>) operator evaluates to true if at least one operand is true. Since <code>pitch == "hard"</code> is true, the if-condition succeeds and assigns <code>"Bouncer"</code> to <code>myStatus</code>.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Question No. 11.</p>',
    urdu_answer: 'چونکہ لاجیکل OR (||) آپریٹر میں ایک بھی شرط درست ہو جائے تو پورا کنڈیشن ٹرو ہو جاتا ہے، اور یہاں pitch == "hard" درست ہے، اس لیے myStatus کو "Bouncer" ملے گا۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'Explain briefly the three primary techniques used to integrate and embed JavaScript code into an HTML web page.',
    correct: `<p>JavaScript can be embedded into web pages through three standard methods:</p>
<ol>
  <li><strong>Internal / Embedded Script:</strong> Placed directly within the HTML document between <code>&lt;script&gt; ... &lt;/script&gt;</code> tags in either the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> sections.</li>
  <li><strong>External JavaScript File:</strong> Saved in a separate <code>.js</code> file and linked using the <code>src</code> attribute: <code>&lt;script src="myscript.js"&gt;&lt;/script&gt;</code>, allowing reusable logic across multiple pages.</li>
  <li><strong>Inline Event Handlers:</strong> Embedded directly inside HTML tags as attribute values (e.g., <code>&lt;button onclick="alert('Clicked!')"&gt;</code>).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 17, 2 Marks) and <code>CS101 solved.pdf</code> (Page 27, Q17).</p>',
    urdu_answer: 'جاوا اسکرپٹ کو ویب پیج میں شامل کرنے کے تین طریقے ہیں: (1) انٹرنل اسکرپٹ (&lt;script&gt; ٹیگ کے اندر کوڈ لکھنا)، (2) ایکسٹرنل فائل (الگ .js فائل بنا کر src کے ذریعے لنک کرنا)، اور (3) ان لائن ایونٹ ہینڈلرز (جیسے بٹن کے اندر onclick لکھنا)۔'
  },
  {
    stem: 'Why is JavaScript categorized as an "Object-Based" language rather than a full "Object-Oriented" language in introductory computing?',
    correct: `<p>In classical computer science terminology, JavaScript is distinguished as <strong>Object-Based</strong> rather than fully Object-Oriented for the following reasons:</p>
<ul>
  <li><strong>Uses Built-in Objects:</strong> It provides rich pre-existing built-in objects (such as <code>window</code>, <code>document</code>, <code>Math</code>, <code>Date</code>, <code>String</code>) that can be manipulated immediately.</li>
  <li><strong>Lacks Classical Class Inheritance:</strong> In its original design (prior to ES6 class syntactic sugar), JavaScript did not utilize classical class-based inheritance, encapsulation access modifiers (public/private/protected), or polymorphism found in languages like C++ or Java, utilizing prototype-based delegation instead.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 17, Session 4) and <code>CS101Introduction_to_Computing_Mid_term_Solved_2010_All_in_One_File.pdf</code>.</p>',
    urdu_answer: 'جاوا اسکرپٹ کو آبجیکٹ بیسڈ اس لیے کہا جاتا ہے کیونکہ یہ پہلے سے موجود بلٹ ان آبجیکٹس (جیسے window اور document) کا بھرپور استعمال کرتی ہے، لیکن اس میں روایتی آبجیکٹ اورینٹڈ زبانوں (جیسے C++ یا Java) کی طرح کلاس بیسڈ انہیریٹنس اور پرائیویٹ/پبلک ایکسیس موڈیفائرز کے سخت قوانین موجود نہیں تھے۔'
  },
  {
    stem: 'What are JavaScript Literals? List and describe four primary types of literals.',
    correct: `<p>A <strong>Literal</strong> in JavaScript is a fixed data value provided directly and explicitly in the program code (unlike variables, which hold varying data).</p>
<h4>Primary Types of Literals:</h4>
<ol>
  <li><strong>String Literals:</strong> Text enclosed in single or double quotes (e.g., <code>"Virtual University"</code>, <code>'CS101'</code>).</li>
  <li><strong>Numeric Literals:</strong> Integer or floating-point numbers written without quotes (e.g., <code>42</code>, <code>3.14159</code>, <code>-10</code>).</li>
  <li><strong>Boolean Literals:</strong> The explicit logical truth values <code>true</code> and <code>false</code>.</li>
  <li><strong>Array Literals:</strong> Zero or more expressions enclosed in square brackets (e.g., <code>[10, 20, 30]</code>).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 32, 5 Marks) and <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> (Q31).</p>',
    urdu_answer: 'لٹرل (Literal) سے مراد وہ مستقل قیمت (Fixed Value) ہے جو کوڈ میں براہ راست لکھی جاتی ہے۔ اس کی چار اہم اقسام یہ ہیں: اسٹرنگ لٹرلز ("ٹیکسٹ")، نیومیرک لٹرلز (ہندسے جیسے 42)، بولین لٹرلز (true یا false)، اور اَیرے لٹرلز ([1، 2، 3])۔'
  },
  {
    stem: 'How do you declare a variable in JavaScript that initially holds an "undefined" value? Provide a clear example and explain its behavior.',
    correct: `<p>In JavaScript, declaring a variable without assigning it an initial value automatically sets its value and data type to <code>undefined</code>.</p>
<h4>Code Example:</h4>
<pre><code>var studentName;
document.write(studentName); // Outputs: undefined
</code></pre>
<h4>Explanation:</h4>
<p>The <code>var</code> keyword allocates memory for <code>studentName</code>. Because no assignment operator (<code>=</code>) was used to supply a literal, JavaScript assigns it the primitive value <code>undefined</code> until an explicit value is provided.</p>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid Term Past Paper 1.pdf</code> (Page 12) and <code>CS101 Mid Term Past Paper Mega File.pdf</code> (Page 12).</p>',
    urdu_answer: 'جاوا اسکرپٹ میں جب کسی ویری ایبل کو ڈیکلیئر کیا جائے لیکن اس میں کوئی ویلیو محفوظ نہ کی جائے تو وہ خود بخود "undefined" بن جاتا ہے۔ مثال کے طور پر: var studentName; لکھنے سے اس کی ویلیو اور ٹائپ undefined ہوگی۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Analyze Client-Side Scripting using JavaScript:\n(a) Explain two major advantages/strengths of client-side execution.\n(b) Discuss two significant deficiencies, limitations, or security risks associated with JavaScript.',
    correct: `<p><strong>Client-Side Scripting</strong> involves executing code directly inside the user\'s local web browser rather than on a remote web server.</p>

<h4>(a) Two Major Advantages / Strengths:</h4>
<ol>
  <li><strong>Reduced Server Workload & Faster Response Times:</strong> Simple form validation, interactive calculations, and UI animations are processed immediately on the local CPU without triggering bandwidth-consuming server round-trips.</li>
  <li><strong>Enhanced Interactivity & User Experience:</strong> Enables instantaneous feedback (e.g., warning users about invalid email formats or missing passwords) as the user interacts with form controls.</li>
</ol>

<h4>(b) Two Deficiencies / Security Risks:</h4>
<ol>
  <li><strong>Client-Side Vulnerabilities & Code Exposure:</strong> JavaScript source code is delivered in plain text directly to the browser, exposing proprietary business logic and leaving web applications susceptible to Cross-Site Scripting (XSS) attacks.</li>
  <li><strong>Browser Inconsistencies & Reliance on User Settings:</strong> Different browsers or older rendering engines may interpret JavaScript differently. Furthermore, end-users can disable JavaScript entirely in browser preferences, potentially breaking site functionality.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 22, 5 Marks) and <code>CS101 Mid Term Past Paper Mega File.pdf</code> (Page 12).</p>',
    urdu_answer: '(a) کلائنٹ سائیڈ اسکرپٹنگ کے دو بڑے فوائد: (1) سرور پر بوجھ کم ہوتا ہے اور ویب پیج کا رسپانس فوری ملتا ہے کیونکہ پروسیسنگ مقامی کمپیوٹر کے براؤزر میں ہوتی ہے۔ (2) فارم کی فوری تصدیق سے صارف کا تجربہ بہترین بنتا ہے۔\n(b) دو نقصانات: (1) سورس کوڈ اوپن ہوتا ہے جسے کوئی بھی دیکھ سکتا ہے اور XSS جیسے سیکیورٹی خطرات لاحق ہو سکتے ہیں۔ (2) اگر صارف اپنے براؤزر میں جاوا اسکرپٹ بند کر دے تو ویب سائٹ کام کرنا چھوڑ سکتی ہے۔'
  },
  {
    stem: 'Explain the core principles of JavaScript Variables, Dynamic (Loose) Typing, and Literals. Contrast them with statically typed languages and detail why dynamic typing simplifies rapid scripting.',
    correct: `<p>JavaScript was designed from its inception for rapid, lightweight client-side development, reflected in its handling of variables and types:</p>

<h4>1. Variables and Dynamic (Loose) Typing:</h4>
<ul>
  <li>In statically typed languages (such as C++ or Java), variables are bound strictly to a fixed data type upon declaration (e.g., <code>int count = 5;</code>).</li>
  <li>In JavaScript, variables are untyped containers declared using <code>var</code> (or <code>let</code>/<code>const</code>). The data type is bound dynamically to the current value, allowing a variable to hold different data types across execution:
    <pre><code>var x = 10;        // x is a Number
x = "Hello VU";    // x dynamically becomes a String
x = true;          // x dynamically becomes a Boolean</code></pre>
  </li>
</ul>

<h4>2. Literals and Their Role:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Literal Type</th>
      <th>Syntactic Representation</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>String Literal</strong></td>
      <td>Alphanumeric characters enclosed in quotes.</td>
      <td><code>"Pakistan"</code>, <code>'CS101'</code></td>
    </tr>
    <tr>
      <td><strong>Numeric Literal</strong></td>
      <td>Raw integers or decimal floats.</td>
      <td><code>100</code>, <code>-3.5</code>, <code>1.2e4</code></td>
    </tr>
    <tr>
      <td><strong>Boolean Literal</strong></td>
      <td>Logical states.</td>
      <td><code>true</code>, <code>false</code></td>
    </tr>
    <tr>
      <td><strong>Array Literal</strong></td>
      <td>Ordered element list in square brackets.</td>
      <td><code>["Apple", "Banana", 45]</code></td>
    </tr>
    <tr>
      <td><strong>Object Literal</strong></td>
      <td>Key-value pairs enclosed in curly braces.</td>
      <td><code>{name: "Ali", age: 21}</code></td>
    </tr>
  </tbody>
</table>

<h4>Why Dynamic Typing Simplifies Scripting:</h4>
<p>It eliminates boilerplate type definitions, minimizes code length, accelerates initial prototyping, and allows developers to build dynamic web forms without verbose type casting.</p>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Q32), <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> (Q31), and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'جاوا اسکرپٹ ایک لوزلی ٹائپڈ (Loosely Typed) یا ڈائنامک زبان ہے، جس کا مطلب ہے کہ ویری ایبل بناتے وقت اس کی ڈیٹا ٹائپ متعین نہیں کرنی پڑتی، بلکہ جو ویلیو دی جائے ویری ایبل وہی ٹائپ خود بخود اختیار کر لیتا ہے (جیسے var x پہلے نمبر اور پھر اسٹرنگ بن سکتا ہے)۔ یہ فیچر کوڈنگ کو تیز رفتار اور آسان بناتا ہے اور سی/سی پلس پلس کی طرح ٹائپ کاسٹنگ کے مسائل سے بچاتا ہے۔'
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
console.log(`CS101 Lecture 18 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

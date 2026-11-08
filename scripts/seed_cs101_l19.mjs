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

// 2. Create or fetch Lecture 19
let lec19 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 19").get(cs101.id);
if (!lec19) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 19, 'Event-Driven Programming, Event Handlers, and Browser Timers')
  `).run(cs101.id);
  lec19 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 19 with ID: ${lec19.id}`);
} else {
  console.log(`CS101 Lecture 19 found with ID: ${lec19.id}`);
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

// 12 MCQs
const mcqs = [
  {
    stem: 'JavaScript primarily intercepts user actions and interacts with the web page visitor through the mechanism of:',
    options: {
      a: 'Special ActiveX controls',
      b: 'Internet Explorer system shell',
      c: 'Event Handlers',
      d: 'Synchronous polling threads'
    },
    correct: 'c',
    explanation: '<p>JavaScript uses <strong>Event Handlers</strong> (e.g., <code>onclick</code>, <code>onmouseover</code>) to listen for and respond to interactive user actions on HTML elements.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers including <code>CS101 MID by Attiq Kundi.pdf</code> Page 7/23 and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 3/23.</p>',
    urdu_answer: 'جاوا اسکرپٹ صارفین کے ایکشنز (جیسے کلک کرنا یا ماؤس گھمانا) کا پتہ لگانے اور ان کے جواب میں کارروائی کرنے کے لیے ایونٹ ہینڈلرز (Event Handlers) کا استعمال کرتی ہے۔'
  },
  {
    stem: 'Which of the following is the standard camelCase JavaScript identifier commonly recognized for the mouseover event handler?',
    options: {
      a: 'onMouseOver',
      b: 'OnMouseOver',
      c: 'ONMOUSEOVER',
      d: 'mouseOverOn'
    },
    correct: 'a',
    explanation: '<p>The standard convention in JavaScript DOM documentation is camelCase: <strong>onMouseOver</strong> (the word "on" followed by capital "Mouse" and capital "Over").</p><p><strong>Reference:</strong> Appeared 18+ times across past papers including <code>CS101 MID by Attiq Kundi.pdf</code> Page 7/29 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Page 97.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں ماؤس اوور ایونٹ کے لیے روایتی اور معیاری سینٹیکس onMouseOver ہے۔'
  },
  {
    stem: 'The programmatic mechanism of detecting, intercepting, and dispatching executable code in response to user actions or browser state changes is termed:',
    options: {
      a: 'Function Interception',
      b: 'Event Handling',
      c: 'Thread Synchronization',
      d: 'Exception Throwing'
    },
    correct: 'b',
    explanation: '<p><strong>Event Handling</strong> is the software architecture pattern where asynchronous signals (events) triggered by user interactions are captured and mapped to handler routines.</p><p><strong>Reference:</strong> Appeared 12+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 51 Q22 & Page 54 Q22.</p>',
    urdu_answer: 'صارف کے اعمال یا براؤزر کے سگنلز کو پکڑنا اور ان کے ردعمل میں کوڈ چلانا ایونٹ ہینڈلنگ (Event Handling) کہلاتا ہے۔'
  },
  {
    stem: 'Software applications whose runtime execution sequence is determined asynchronously by external user actions (such as mouse clicks and key presses) or system messages are known as:',
    options: {
      a: 'Batch-processed programs',
      b: 'Event-driven programs',
      c: 'Linear sequential programs',
      d: 'Static procedural scripts'
    },
    correct: 'b',
    explanation: '<p>In <strong>Event-Driven Programming</strong>, the flow of execution is determined by incoming external events rather than a hardcoded top-to-bottom sequence.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 47 Q21.</p>',
    urdu_answer: 'وہ پروگرام جن کا بہاؤ صارف کے اشاروں (ماؤس کلک، کی بورڈ بٹن) یا سسٹم کے پیغامات کے ذریعے طے ہوتا ہے، ایونٹ ڈریون پروگرامز (Event-driven programs) کہلاتے ہیں۔'
  },
  {
    stem: 'In web forms, the `onBlur` event is triggered on an input element specifically when the element:',
    options: {
      a: 'Gains active input focus',
      b: 'Loses active input focus',
      c: 'Receives a double-click',
      d: 'Submits form data'
    },
    correct: 'b',
    explanation: '<p>The <strong>onBlur</strong> event fires when an interactive element (e.g., text box) <em>loses focus</em>, such as when a user tabs or clicks away into another field.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 50 Q28.</p>',
    urdu_answer: 'آن بلر (onBlur) ایونٹ اس وقت فعال ہوتا ہے جب کوئی ان پٹ باکس اپنا فوکس کھو دیتا ہے (یعنی صارف اس فیلڈ سے باہر کہیں اور کلک کرتا ہے)۔'
  },
  {
    stem: 'Which of the following is NOT a valid, recognized browser event handler for an HTML `<img>` (image) object?',
    options: {
      a: 'onAbort',
      b: 'onError',
      c: 'onLoad',
      d: 'onUser'
    },
    correct: 'd',
    explanation: '<p>HTML images natively support <code>onAbort</code>, <code>onError</code>, and <code>onLoad</code>. There is no standard event named <strong>onUser</strong>.</p><p><strong>Reference:</strong> Appeared 6+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 53 Q14.</p>',
    urdu_answer: 'امیج آبجیکٹ پر onAbort، onError اور onLoad کے ایونٹس لاگو ہوتے ہیں، لیکن onUser نام کا کوئی ایونٹ ہینڈلر موجود نہیں ہے۔'
  },
  {
    stem: 'What is the correct standard casing in JavaScript for the event handler invoked when a user leaves or closes an HTML web page document?',
    options: {
      a: 'onUnload',
      b: 'onUnLoad',
      c: 'ONUNLOAD',
      d: 'closeWindow'
    },
    correct: 'a',
    explanation: '<p>The event handler triggered when a document is dismissed or unloaded is spelled <strong>onUnload</strong> (or lowercase <code>onunload</code> in HTML attributes).</p><p><strong>Reference:</strong> Appeared 7+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 51 Q21.</p>',
    urdu_answer: 'جب صارف صفحہ چھوڑتا ہے یا ونڈو بند کرتا ہے تو onUnload کا ایونٹ ہینڈلر فائر ہوتا ہے۔'
  },
  {
    stem: 'Which built-in JavaScript window function pauses for a designated duration in milliseconds before executing a specified callback function?',
    options: {
      a: 'Timeout()',
      b: 'setTimeout()',
      c: 'setTime()',
      d: 'setTimeIn()'
    },
    correct: 'b',
    explanation: '<p>The <strong>setTimeout(expression, milliseconds)</strong> method sets a timer which executes a function once the timer expires.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 53 Q13.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں کسی مقررہ وقت کے بعد کوئی فنکشن چلانے کے لیے setTimeout() کا طریقہ کار استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Select the true statement regarding case sensitivity in the context of HTML tags versus JavaScript code:',
    options: {
      a: 'Both HTML and JavaScript are strictly case sensitive',
      b: 'Neither HTML nor JavaScript is case sensitive',
      c: 'JavaScript is case sensitive, but HTML is NOT case sensitive',
      d: 'HTML is case sensitive, but JavaScript is NOT case sensitive'
    },
    correct: 'c',
    explanation: '<p>HTML tag names and attributes are case-insensitive (e.g., <code>&lt;BODY&gt;</code> equals <code>&lt;body&gt;</code>), whereas <strong>JavaScript is strictly case sensitive</strong> (e.g., <code>myVar</code> and <code>myvar</code> are completely different identifiers).</p><p><strong>Reference:</strong> Appeared 14+ times across past papers in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Page 20.</p>',
    urdu_answer: 'جاوا اسکرپٹ سختی سے کیس سینسیٹو (Case Sensitive) ہے، جبکہ HTML کیس سینسیٹو نہیں ہے (یعنی بڑے اور چھوٹے حروف میں کوئی فرق نہیں سمجھتی)۔'
  },
  {
    stem: 'In the JavaScript statement `window.close()`, what are "window" and "close()" respectively?',
    options: {
      a: '"window" is an Object, and "close()" is a Method',
      b: '"window" is a Method, and "close()" is an Event',
      c: '"window" is an Event Handler, and "close()" is an Attribute',
      d: '"window" is a Variable, and "close()" is an Operator'
    },
    correct: 'a',
    explanation: '<p>In the Browser Object Model (BOM), <code>window</code> is the top-level global <strong>Object</strong> representing the browser viewport, and <code>close()</code> is a built-in <strong>Method</strong> that closes the current window.</p><p><strong>Reference:</strong> Appeared in <code>CS101 - 1.pdf</code> Q22 and <code>CS101 - 2.pdf</code> Q21.</p>',
    urdu_answer: 'اسٹیٹمنٹ window.close() میں "window" ایک آبجیکٹ (Object) ہے اور "close()" اس کا ایک طریقہ کار یعنی میتھڈ (Method) ہے۔'
  },
  {
    stem: 'Which event handler attribute placed in the `<body>` element executes automatically as soon as the browser completes loading and rendering the entire HTML document?',
    options: {
      a: 'onLoad',
      b: 'onUnload',
      c: 'onSubmit',
      d: 'onBlur'
    },
    correct: 'a',
    explanation: '<p>The <strong>onLoad</strong> event handler triggers immediately after a web page has fully loaded all DOM elements, scripts, stylesheets, and images.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 56 Q10.</p>',
    urdu_answer: 'جب ویب پیج اور اس کے تمام عناصر مکمل طور پر لوڈ ہو جاتے ہیں تو &lt;body&gt; ٹیگ کے اندر موجود onLoad ایونٹ خود بخود چل پڑتا ہے۔'
  },
  {
    stem: 'In JavaScript\'s `setTimeout(myFunction, delay)` timer method, the delay parameter is measured in which unit of time?',
    options: {
      a: 'Microseconds',
      b: 'Milliseconds (1/1000th of a second)',
      c: 'Seconds',
      d: 'Nanoseconds'
    },
    correct: 'b',
    explanation: '<p>The delay parameter in <code>setTimeout()</code> is specified in <strong>milliseconds</strong> (e.g., <code>1000</code> ms equals 1 second).</p><p><strong>Reference:</strong> Standard JavaScript documentation and CS101 Lecture 19 handouts.</p>',
    urdu_answer: 'جاوا اسکرپٹ کے setTimeout فنکشن میں وقت کی مدت ملی سیکنڈز (Milliseconds) میں دی جاتی ہے (1000 ملی سیکنڈ ایک سیکنڈ کے برابر ہوتا ہے)۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is Event Handling in JavaScript? Differentiate between user-generated events and system/browser-generated events.',
    correct: `<p><strong>Event Handling</strong> is the programming mechanism by which JavaScript detects actions or state changes and executes custom functions in response.</p>
<h4>Two Categories of Events:</h4>
<ol>
  <li><strong>User-Generated Events:</strong> Direct physical actions taken by human visitors interacting with peripherals (e.g., clicking a button [<code>onClick</code>], typing keys [<code>onKeyPress</code>], moving the mouse pointer [<code>onMouseOver</code>]).</li>
  <li><strong>System / Browser-Generated Events:</strong> Asynchronous environmental signals initiated by the browser itself (e.g., completing page load [<code>onLoad</code>], image load failure [<code>onError</code>], or page departure [<code>onUnload</code>]).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 57 Q34 & Page 59 Q34).</p>',
    urdu_answer: 'ایونٹ ہینڈلنگ سے مراد کسی وقوعہ (Event) کا پتہ لگا کر اس پر پروگرام چلانا ہے۔ ایونٹس دو قسم کے ہوتے ہیں: (1) یوزر ایونٹس جو صارف کے اشاروں سے ہوتے ہیں جیسے کلک کرنا یا بٹن دبانا، اور (2) سسٹم/براؤزر ایونٹس جو خود بخود ہوتے ہیں جیسے صفحہ کا لوڈ ہو جانا (onLoad)۔'
  },
  {
    stem: 'In which situations is Inline Event Handling typically used, and what is its primary design limitation?',
    correct: `<p><strong>Inline Event Handling</strong> embeds JavaScript code directly inside an HTML tag as an attribute (e.g., <code>&lt;button onclick="alert('Clicked!')"&gt;</code>).</p>
<h4>When to Use:</h4>
<ul>
  <li>For rapid prototyping, simple demonstration scripts, or trivial one-line tasks (like displaying a popup or triggering a form reset).</li>
</ul>
<h4>Primary Design Limitation:</h4>
<ul>
  <li><strong>Violates Separation of Concerns:</strong> Tightly couples behavioral scripting logic with visual presentation markup, making large codebases brittle, difficult to debug, and non-reusable across multiple elements.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2009 Q33) and <code>cs101 midterm subjective by moaaz.pdf</code> (Fall 2009 Q33).</p>',
    urdu_answer: 'ان لائن ایونٹ ہینڈلنگ اس وقت استعمال ہوتی ہے جب صرف ایک سادہ لائن کا کوڈ چلانا ہو (جیسے بٹن پر کلک سے الرٹ دکھانا)۔ اس کا سب سے بڑا نقصان یہ ہے کہ یہ ڈیزائن اور پروگرامنگ لاجک کو آپس میں خلط ملط کر دیتی ہے جس سے کوڈ کو سنبھالنا مشکل ہو جاتا ہے۔'
  },
  {
    stem: 'An event handler attribute in an HTML tag conceptually consists of three distinct parts. Identify and describe each part with a concrete example.',
    correct: `<p>An event handler assignment in HTML consists of three foundational components:</p>
<pre><code>&lt;input type="button" value="Submit" onClick="validateForm();"&gt;</code></pre>
<ol>
  <li><strong>The Event Identifier:</strong> The specific browser event name prefixed with "on" (e.g., <code>onClick</code>, <code>onMouseOver</code>).</li>
  <li><strong>The Assignment Operator:</strong> The equals sign (<code>=</code>) establishing the binding between the trigger and the script.</li>
  <li><strong>The Action / Handler Code:</strong> The JavaScript statement, function call, or script block enclosed within quotation marks (e.g., <code>"validateForm();"</code>).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2008 Q37) and <code>cs101 midterm subjective by moaaz.pdf</code> (Fall 2008 Q37).</p>',
    urdu_answer: 'ایونٹ ہینڈلر ایٹری بیوٹ کے تین حصے ہوتے ہیں: (1) ایونٹ کا نام (جیسے onClick)، (2) اسائنمنٹ آپریٹر (=)، اور (3) کوٹیشن مارکس کے اندر لکھا گیا جاوا اسکرپٹ ایکشن یا فنکشن کال (جیسے "validateForm();")۔'
  },
  {
    stem: 'Define an Event Handler with an example. Write a brief HTML/JavaScript code snippet demonstrating its application on a button.',
    correct: `<p>An <strong>Event Handler</strong> is a function or inline code routine that "listens" for a specific event occurring on a designated DOM element and executes programmed logic when that event fires.</p>
<h4>Code Example:</h4>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;script&gt;
    function greetUser() {
      alert("Welcome to Virtual University Exam Portal!");
    }
  &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;button onClick="greetUser()"&gt;Click Me&lt;/button&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Page 1) and <code>cs101 midterm subjective by moaaz.pdf</code> (Page 1).</p>',
    urdu_answer: 'ایونٹ ہینڈلر ایک ایسا پروگرام ہے جو کسی ایونٹ کے وقوع پذیر ہونے کا انتظار کرتا ہے اور اس کے رونما ہوتے ہی متحرک ہو جاتا ہے۔ مثال کے طور پر &lt;button onClick="greetUser()"&gt; میں onClick ایک ایونٹ ہینڈلر ہے جو بٹن دبانے پر الرٹ پیغام ظاہر کرتا ہے۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'What is Event-Driven Programming in JavaScript? Explain the event capture and dispatch cycle. List five common event handlers (e.g., onClick, onMouseOver, onMouseOut, onLoad, onSubmit) and describe their precise triggers.',
    correct: `<p><strong>Event-Driven Programming</strong> is a software paradigm where the execution trajectory is governed by external user interactions, sensor inputs, or system messages rather than a static top-down algorithmic sequence.</p>

<h4>1. Event Capture and Dispatch Cycle:</h4>
<ul>
  <li><strong>Event Generation:</strong> The user moves a mouse or presses a key; the operating system notifies the browser.</li>
  <li><strong>Event Dispatch:</strong> The browser generates an event object and traverses the DOM hierarchy to locate the target element.</li>
  <li><strong>Handler Execution:</strong> If an event handler is attached to the element, the browser pauses normal execution and invokes the assigned JavaScript function asynchronously.</li>
</ul>

<h4>2. Five Common Event Handlers:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Event Handler</th>
      <th>Trigger Condition</th>
      <th>Typical Application</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><code>onClick</code></strong></td>
      <td>User clicks the left mouse button over an element.</td>
      <td>Triggering calculations, navigating, submitting actions.</td>
    </tr>
    <tr>
      <td><strong><code>onMouseOver</code></strong></td>
      <td>Mouse cursor hovers into the boundary of an element.</td>
      <td>Dropdown menus, image rollovers, tooltip previews.</td>
    </tr>
    <tr>
      <td><strong><code>onMouseOut</code></strong></td>
      <td>Mouse cursor leaves the boundary of an element.</td>
      <td>Reverting image rollovers, hiding menus.</td>
    </tr>
    <tr>
      <td><strong><code>onLoad</code></strong></td>
      <td>Webpage finishes loading all assets (images, DOM).</td>
      <td>Initializing variables, welcome prompts, dynamic setups.</td>
    </tr>
    <tr>
      <td><strong><code>onSubmit</code></strong></td>
      <td>User clicks the submit button on a <code>&lt;form&gt;</code>.</td>
      <td>Client-side form input validation before HTTP dispatch.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 47 Q21, Page 51 Q22) and <code>CS101 - Midterm Paper 1 by Waqar Solved by Hadi.pdf</code> (Q25).</p>',
    urdu_answer: 'ایونٹ ڈریون پروگرامنگ میں پروگرام کا عملدرآمد صارف کے اشاروں کے مطابق ہوتا ہے۔ براؤزر ایونٹ کو ریکارڈ کر کے متعلقہ ہینڈلر کو چلاتا ہے۔ عام ایونٹس میں onClick (بٹن دبانا)، onMouseOver (ماؤس اوپر لانا)، onMouseOut (ماؤس ہٹانا)، onLoad (صفحہ لوڈ ہونا) اور onSubmit (فارم جمع کروانا) شامل ہیں جو ویب پیج کو متحرک اور انٹرایکٹو بناتے ہیں۔'
  },
  {
    stem: 'Explain the mechanism of programmatic event activation and browser timers in JavaScript. Write a complete function named `display()` that renders the algebraic string "X³ + Y²" using string manipulation methods, and explain how timer events (`setTimeout`) and lifecycle events (`onLoad`, `onUnload`) execute.',
    correct: `<p>In modern web browsers, event activation occurs asynchronously via an internal single-threaded event loop that handles user inputs, timers, and lifecycle milestones.</p>

<h4>1. Code Implementation for display():</h4>
<pre><code>function display() {
  // Utilizing native string formatting methods for superscripts
  document.write("X" + "3".sup() + " + Y" + "2".sup());
}</code></pre>
<p><em>HTML Lifecycle Binding:</em></p>
<pre><code>&lt;body onLoad="display()" onUnload="alert('Goodbye!')"&gt;
  &lt;!-- Page Content --&gt;
&lt;/body&gt;</code></pre>

<h4>2. Execution Mechanism:</h4>
<ul>
  <li><strong>Lifecycle Events (<code>onLoad</code> & <code>onUnload</code>):</strong>
    <ul>
      <li><code>onLoad</code>: Fires when the HTML document and external stylesheets/images have completely finished parsing, safely allowing scripts to access DOM elements without null reference exceptions.</li>
      <li><code>onUnload</code>: Executes when the browser tab is closed or navigated away from, permitting cleanup of resources or farewell notifications.</li>
    </ul>
  </li>
  <li><strong>Browser Timers (<code>setTimeout</code>):</strong>
    <ul>
      <li>Registers a callback and a millisecond delay into the browser\'s web APIs timer table (e.g., <code>setTimeout(display, 3000)</code>).</li>
      <li>When the timer expires, the callback is pushed into the callback queue and processed by the event loop as soon as the main execution stack is clear, preventing UI freezing.</li>
    </ul>
  </li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 56 Q10, Page 58 Q10) and <code>CS101 - Midterm Paper 1 by Waqar Solved by Hadi.pdf</code> (Q25).</p>',
    urdu_answer: 'جاوا اسکرپٹ میں ایونٹ لوپ کے ذریعے ٹائمرز اور لائف سائیکل ایونٹس چلتے ہیں۔ display() فنکشن میں "3".sup() کا میتھڈ 3 کو پاور یعنی سپر اسکرپٹ (X³ + Y²) میں بدلتا ہے اور اسے onLoad ایونٹ کے ذریعے پیج لوڈ ہوتے ہی چلایا جا سکتا ہے۔ setTimeout() تاخیر کے بعد فنکشن کو بغیر اسکرین فریز کیے چلاتا ہے اور onUnload پیج بند ہوتے وقت کال ہوتا ہے۔'
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
console.log(`CS101 Lecture 19 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

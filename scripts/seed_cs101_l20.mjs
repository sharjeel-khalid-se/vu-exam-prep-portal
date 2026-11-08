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

// 2. Create or fetch Lecture 20
let lec20 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 20").get(cs101.id);
if (!lec20) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 20, 'JavaScript Functions, Parameters, and Variable Scope')
  `).run(cs101.id);
  lec20 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 20 with ID: ${lec20.id}`);
} else {
  console.log(`CS101 Lecture 20 found with ID: ${lec20.id}`);
}

const lId = lec20.id;

// 3. Clear existing questions for Lecture 20 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 20.`);

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
    stem: 'In computer programming and software design, reusable named blocks of code known as functions are also commonly referred to as:',
    options: {
      a: 'Heuristics',
      b: 'Subprograms (or Procedures / Routines)',
      c: 'Arrays',
      d: 'Data Dictionaries'
    },
    correct: 'b',
    explanation: '<p><strong>Functions</strong> are self-contained modular sub-units of a program, also widely known across programming languages as <em>subprograms, procedures, routines, or methods</em>.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Paper 7777 Q2 Page 74 & 84.</p>',
    urdu_answer: 'کمپیوٹر پروگرامنگ میں فنکشنز کو سب پروگرامز (Subprograms)، پروسیجرز (Procedures) یا روٹینز بھی کہا جاتا ہے۔'
  },
  {
    stem: 'In JavaScript, declaring a variable using the `var` keyword inside the body of a function restricts its accessibility, making it a:',
    options: {
      a: 'Global variable',
      b: 'Local variable',
      c: 'Universal variable',
      d: 'Public static variable'
    },
    correct: 'b',
    explanation: '<p>A variable declared inside a function with <code>var</code> has function scope and is strictly <strong>local</strong> to that function. It cannot be accessed or modified from outside the function.</p><p><strong>Reference:</strong> Appeared 18+ times across past papers in <code>cs101 midterm subjective by moaaz (1).pdf</code> Fall 2009 Q32.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں کسی فنکشن کے اندر var کے ساتھ بنایا جانے والا ویری ایبل لوکل (Local) کہلاتا ہے اور وہ صرف اسی فنکشن کے اندر ہی قابل استعمال ہوتا ہے۔'
  },
  {
    stem: 'Defining the specific geographical area or segment of program code within which a variable is recognized and effective is known as defining its:',
    options: {
      a: 'Lifetime',
      b: 'Scope',
      c: 'Bandwidth',
      d: 'Modulation'
    },
    correct: 'b',
    explanation: '<p>The <strong>Scope</strong> of a variable determines the portion of the script where the variable can be directly accessed, referenced, or manipulated.</p><p><strong>Reference:</strong> Appeared 16+ times across past papers including <code>Cs101-latest -solved-midterm paper 2.pdf</code> Page 63.</p>',
    urdu_answer: 'پروگرام کا وہ مخصوص حصہ جس کے اندر کوئی ویری ایبل قابلِ رسائی اور کارآمد ہوتا ہے، اس ویری ایبل کا اسکوپ (Scope) کہلاتا ہے۔'
  },
  {
    stem: 'Unlike statically typed languages like C++ or Java, explicit upfront variable declaration in JavaScript is:',
    options: {
      a: 'Optional (due to implicit variable creation on assignment)',
      b: 'Strictly mandatory for all identifiers',
      c: 'Completely forbidden by the browser engine',
      d: 'Mandatory only for floating-point numbers'
    },
    correct: 'a',
    explanation: '<p>In traditional JavaScript, variable declaration using <code>var</code> is <strong>optional</strong>; assigning a value to an undeclared identifier implicitly creates a global variable.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q4.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں ویری ایبل کو پہلے سے ڈیکلیئر کرنا لازمی نہیں بلکہ اختیاری (Optional) ہے کیونکہ بغیر ڈیکلیئر کیے بھی ویلیو دینے سے ویری ایبل خود بخود بن جاتا ہے۔'
  },
  {
    stem: 'Which reserved keyword is used in JavaScript to formally define and declare a function?',
    options: {
      a: 'sub',
      b: 'procedure',
      c: 'function',
      d: 'def'
    },
    correct: 'c',
    explanation: '<p>In JavaScript, functions are declared using the standard keyword <strong>function</strong> followed by the function name, parameter list, and a body block.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Paper 7777 Q8 Page 76.</p>',
    urdu_answer: 'جاوا اسکرپٹ میں فنکشن کی تعریف شروع کرنے کے لیے مخصوص کی ورڈ "function" استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Which statement is executed inside a JavaScript function to immediately terminate function execution and pass a computed value back to the caller?',
    options: {
      a: 'exit',
      b: 'break',
      c: 'return',
      d: 'send'
    },
    correct: 'c',
    explanation: '<p>The <strong>return</strong> statement halts the execution of a function and specifies the value to be returned to the function caller.</p><p><strong>Reference:</strong> CS101 Lecture 20 handouts and standard JavaScript specification.</p>',
    urdu_answer: 'فنکشن کے اندر حساب کتاب کا نتیجہ کال کرنے والے کوڈ کو واپس بھیجنے اور فنکشن ختم کرنے کے لیے return اسٹیٹمنٹ استعمال ہوتی ہے۔'
  },
  {
    stem: 'What is the scope of a variable declared in the main body of a JavaScript script, outside of any enclosing functions?',
    options: {
      a: 'Global Scope',
      b: 'Local Scope',
      c: 'Block Scope',
      d: 'Restricted Private Scope'
    },
    correct: 'a',
    explanation: '<p>Variables declared outside all functions belong to the <strong>Global Scope</strong> and are accessible from anywhere within the script, including inside all functions.</p><p><strong>Reference:</strong> CS101 Lecture 20 handouts and past paper subjective files.</p>',
    urdu_answer: 'جو ویری ایبل تمام فنکشنز سے باہر بنایا جاتا ہے اس کا اسکوپ گلوبل (Global) ہوتا ہے اور وہ پورے پروگرام میں کہیں بھی استعمال کیا جا سکتا ہے۔'
  },
  {
    stem: 'If a variable is assigned a value inside a function without using the `var` keyword (e.g., `x = 10;`), JavaScript automatically treats `x` as a:',
    options: {
      a: 'Global variable',
      b: 'Local variable',
      c: 'Constant',
      d: 'Syntax error exception'
    },
    correct: 'a',
    explanation: '<p>Omitting <code>var</code> inside a function assigns the identifier to the global window object, inadvertently creating a <strong>global variable</strong> (a common source of bugs).</p><p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> Page 67.</p>',
    urdu_answer: 'اگر فنکشن کے اندر var کے بغیر کسی ویری ایبل کو قیمت دے دی جائے (جیسے x = 10;)، تو جاوا اسکرپٹ اسے خود بخود گلوبل ویری ایبل بنا دیتا ہے۔'
  },
  {
    stem: 'In the function definition `function calculate(length, width)`, the terms `length` and `width` placed within the parentheses are technically called:',
    options: {
      a: 'Formal Parameters',
      b: 'Return Values',
      c: 'Global Constants',
      d: 'Event Listeners'
    },
    correct: 'a',
    explanation: '<p>The variables listed in the function definition header are <strong>parameters</strong> (formal parameters), which act as placeholders for values passed when calling the function.</p><p><strong>Reference:</strong> Standard CS101 Lecture 20 handouts.</p>',
    urdu_answer: 'فنکشن کی تعریف میں بریکٹس کے اندر لکھے گئے متغیرات (جیسے length اور width) پیرامیٹرز (Parameters) کہلاتے ہیں۔'
  },
  {
    stem: 'Which legacy JavaScript string formatting method corresponds directly to the HTML `<PRE>` tag for rendering fixed-width monospace text?',
    options: {
      a: 'fontsize()',
      b: 'fontcolor()',
      c: 'fixed()',
      d: 'monospace()'
    },
    correct: 'c',
    explanation: '<p>In JavaScript\'s built-in String methods, <code>str.fixed()</code> wraps the string in HTML <code>&lt;tt&gt;...&lt;/tt&gt;</code> fixed-pitch font tags, functioning similarly to <code>&lt;pre&gt;</code>.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> Page 79 Q2b.</p>',
    urdu_answer: 'HTML کے &lt;PRE&gt; ٹیگ کے متبادل کے طور پر جاوا اسکرپٹ اسٹرنگ کا fixed() میتھڈ مونو اسپیس فکسڈ وڈتھ فونٹ بنانے کے لیے استعمال ہوتا ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What are Local (Function-Level) Variables in JavaScript? Explain how they are declared and when they are destroyed.',
    correct: `<p>A <strong>Local Variable</strong> is a variable declared inside the body of a function using the <code>var</code>, <code>let</code>, or <code>const</code> keyword.</p>
<h4>Key Characteristics:</h4>
<ul>
  <li><strong>Restricted Scope:</strong> Only accessible within the function where it is declared; inaccessible to outer scripts or sibling functions.</li>
  <li><strong>Lifecycle:</strong> It is created in memory when the function is invoked, and it is automatically deleted (destroyed) when the function completes execution, freeing system RAM.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2009 Q32) and <code>cs101 midterm subjective by moaaz.pdf</code> (Fall 2009 Q32).</p>',
    urdu_answer: 'لوکل ویری ایبل وہ ہوتا ہے جسے کسی فنکشن کے اندر var کے ساتھ ڈیکلیئر کیا جاتا ہے۔ یہ صرف اسی فنکشن کے اندر استعمال ہو سکتا ہے۔ جب فنکشن کال ہوتا ہے تو یہ میموری میں بنتا ہے اور فنکشن ختم ہوتے ہی خود بخود ختم ہو جاتا ہے جس سے میموری آزاد ہو جاتی ہے۔'
  },
  {
    stem: 'What are the alternative names of a Function across programming languages? Name any two and explain their role.',
    correct: `<p>In computer programming, a <strong>Function</strong> is also commonly referred to as:</p>
<ol>
  <li><strong>Subprogram:</strong> A miniature, self-contained sub-application embedded within a larger program that performs a discrete processing task.</li>
  <li><strong>Procedure (or Routine):</strong> A sequence of instructions packaged as a unit to perform an operation without necessarily returning a mathematical value.</li>
  <li><strong>Method:</strong> A function associated with or belonging to a specific object or class.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 84 Q32).</p>',
    urdu_answer: 'فنکشنز کے دوسرے نام یہ ہیں: (1) سب پروگرام (Subprogram)، یعنی بڑے پروگرام کے اندر ایک چھوٹا خود مختار پروگرام؛ اور (2) پروسیجر یا روٹین (Procedure/Routine)، یعنی کسی مخصوص کام کو انجام دینے والی ہدایات کا منظم بلاک۔'
  },
  {
    stem: 'Why are Local variables strongly preferred over Global variables in web programming and modular software design?',
    correct: `<p>Using <strong>Local Variables</strong> instead of Global variables is a fundamental best practice for several critical reasons:</p>
<ol>
  <li><strong>Preventing Name Collisions:</strong> Global variables can be accidentally overwritten by different scripts, third-party libraries, or functions sharing the same variable name.</li>
  <li><strong>Memory Optimization:</strong> Local variables exist only while the function executes and are garbage-collected upon completion, whereas global variables persist throughout the browser session.</li>
  <li><strong>Code Modularity & Reusability:</strong> Functions with local variables are self-contained and can be copied into other projects without unexpected side-effects.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Spring 2010 Q28) and <code>cs101 midterm subjective by moaaz.pdf</code> (Spring 2010 Q28).</p>',
    urdu_answer: 'لوکل ویری ایبلز کو گلوبل پر ترجیح اس لیے دی جاتی ہے کیونکہ یہ غلطی سے کسی دوسرے کوڈ کے ہاتھوں اوور رائٹ ہونے سے محفوظ رہتے ہیں، فنکشن ختم ہوتے ہی میموری خالی کر دیتے ہیں، اور کوڈ کو دوبارہ قابلِ استعمال اور غلطیوں سے پاک بناتے ہیں۔'
  },
  {
    stem: 'What is meant by the "Scope" and "Lifetime" of a variable in computer programming? Differentiate between the two concepts.',
    correct: `<p><strong>Scope</strong> and <strong>Lifetime</strong> represent two fundamental dimensions of a variable:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Dimension</th>
      <th>Scope (Visibility)</th>
      <th>Lifetime (Duration)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>The spatial region of the source code where a variable is visible and accessible.</td>
      <td>The temporal duration of program execution during which the variable exists in memory.</td>
    </tr>
    <tr>
      <td><strong>Example (Local)</strong></td>
      <td>Inside the enclosing curly braces <code>{ ... }</code> of the function.</td>
      <td>From function call entry until function returns and exits.</td>
    </tr>
    <tr>
      <td><strong>Example (Global)</strong></td>
      <td>Accessible anywhere throughout the entire web page script.</td>
      <td>Persists from page load until the webpage tab is closed or navigated away.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Page 67) and <code>Cs101-latest -solved-midterm paper 2.pdf</code> (Page 63).</p>',
    urdu_answer: 'اسکوپ (Scope) کوڈ کے اس حصے کو کہتے ہیں جہاں وہ ویری ایبل نظر آتا ہے اور قابلِ استعمال ہوتا ہے (جیسے فنکشن کے اندر)۔ جبکہ لائف ٹائم (Lifetime) وقت کی اس مدت کو کہتے ہیں جس کے دوران وہ ویری ایبل کمپیوٹر کی میموری میں زندہ اور موجود رہتا ہے۔'
  }
];

// 3 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Differentiate between Local Variables and Global Variables. Compare their scopes, access permissions, lifetime, memory allocation, and impact on code maintenance and reusability.',
    correct: `<p>A comprehensive architectural comparison between <strong>Local Variables</strong> and <strong>Global Variables</strong> reveals contrasting software engineering characteristics:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Criterion</th>
      <th>Local Variables</th>
      <th>Global Variables</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Declaration</strong></td>
      <td>Declared inside a function using <code>var</code>, <code>let</code>, or <code>const</code>.</td>
      <td>Declared outside all functions, or assigned without declaration.</td>
    </tr>
    <tr>
      <td><strong>Scope</strong></td>
      <td>Function-level scope; visible only within its enclosing function.</td>
      <td>Global scope; accessible by every script and function on the page.</td>
    </tr>
    <tr>
      <td><strong>Lifetime</strong></td>
      <td>Created when the function is invoked; destroyed on function return.</td>
      <td>Allocated when page loads; destroyed only when page is closed.</td>
    </tr>
    <tr>
      <td><strong>Memory Consumption</strong></td>
      <td>Temporary stack allocation; automatically garbage-collected.</td>
      <td>Permanent heap allocation; retains memory during whole session.</td>
    </tr>
    <tr>
      <td><strong>Side Effects & Bugs</strong></td>
      <td>Zero risk of unintentional modification by other functions.</td>
      <td>High risk: any script can mutate its value, introducing subtle bugs.</td>
    </tr>
    <tr>
      <td><strong>Modularity & Portability</strong></td>
      <td>High; function remains a plug-and-play independent module.</td>
      <td>Low; creates tight hidden coupling between distant parts of code.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz (1).pdf</code> (Fall 2009 Q36) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 80 Q3).</p>',
    urdu_answer: 'لوکل ویری ایبل فنکشن کے اندر بنتا ہے، صرف اسی میں نظر آتا ہے اور فنکشن ختم ہوتے ہی مٹ جاتا ہے جس کی وجہ سے یہ میموری کم لیتا ہے اور محفوظ رہتا ہے۔ گلوبل ویری ایبل فنکشنز سے باہر بنتا ہے، پورا پروگرام اسے تبدیل کر سکتا ہے اور صفحہ بند ہونے تک میموری میں رہتا ہے جس کی وجہ سے بگ پیدا ہونے کا خطرہ زیادہ ہوتا ہے۔'
  },
  {
    stem: 'Write a complete JavaScript program containing two modular functions: `sum` and `mean`. The program must prompt the user to input five numbers, calculate their total sum and arithmetic average using the functions, and display the formatted results on the webpage.',
    correct: `<p>The following complete HTML and JavaScript code implements modular functions with input parsing and output formatting:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;Sum and Mean Calculator&lt;/title&gt;
  &lt;script&gt;
    // Function 1: Computes the sum of 5 parameters
    function sum(a, b, c, d, e) {
      return a + b + c + d + e;
    }

    // Function 2: Computes the mean (average)
    function mean(totalSum, count) {
      return totalSum / count;
    }
  &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h2&gt;Mathematical Calculation Results&lt;/h2&gt;
  &lt;script&gt;
    // Prompt user for 5 numeric inputs and convert strings to floats
    var n1 = parseFloat(prompt("Enter value 1:"));
    var n2 = parseFloat(prompt("Enter value 2:"));
    var n3 = parseFloat(prompt("Enter value 3:"));
    var n4 = parseFloat(prompt("Enter value 4:"));
    var n5 = parseFloat(prompt("Enter value 5:"));

    // Invoke functions
    var total = sum(n1, n2, n3, n4, n5);
    var avg = mean(total, 5);

    // Display formatted results on the web page
    document.write("&lt;strong&gt;Sum of five numbers:&lt;/strong&gt; " + total + "&lt;br&gt;");
    document.write("&lt;strong&gt;Mean (Average):&lt;/strong&gt; " + avg + "&lt;br&gt;");
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Question No. 40, Page 82).</p>',
    urdu_answer: 'جاوا اسکرپٹ کا یہ پروگرام دو فنکشنز sum اور mean کا استعمال کرتا ہے۔ پرامپٹ کے ذریعے پانچ ان پٹ لے کر parseFloat سے ہندسوں میں تبدیل کیا جاتا ہے، پھر sum کے فنکشن سے کل جمع اور mean کے فنکشن سے اوسط نکال کر document.write کے ذریعے اسکرین پر دکھایا جاتا ہے۔'
  },
  {
    stem: 'Write a JavaScript function named `BinConvert()` that accepts a positive decimal integer as an argument, converts it into its equivalent binary string representation, and displays the result in the browser window.',
    correct: `<p>The following JavaScript function takes a decimal number, applies successive division by 2 to determine binary bits, and outputs the result:</p>

<pre><code>function BinConvert(decimalNum) {
  var originalNum = decimalNum;
  var binaryResult = "";

  // Handle edge case for zero
  if (decimalNum === 0) {
    binaryResult = "0";
  } else {
    // Successive division by 2
    while (decimalNum &gt; 0) {
      var remainder = decimalNum % 2;
      binaryResult = remainder + binaryResult; // Prepend remainder
      decimalNum = Math.floor(decimalNum / 2);
    }
  }

  // Display the output
  document.write("&lt;p&gt;Decimal Number: &lt;strong&gt;" + originalNum + "&lt;/strong&gt;&lt;/p&gt;");
  document.write("&lt;p&gt;Binary Representation: &lt;strong&gt;" + binaryResult + "&lt;/strong&gt;&lt;/p&gt;");
}

// Example usage:
// BinConvert(13); // Outputs: 1101</code></pre>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Paper 7777 Q5, Page 80).</p>',
    urdu_answer: 'یہ فنکشن عشری عدد (Decimal) کو دو پر تقسیم کر کے حاصل ہونے والے باقی ماندہ (Remainders) کو الٹی ترتیب میں جوڑتا ہے، جس سے درست بائنری اسٹرنگ بن جاتی ہے اور پھر اسے document.write کے ذریعے اسکرین پر ظاہر کر دیا جاتا ہے۔'
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
console.log(`CS101 Lecture 20 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

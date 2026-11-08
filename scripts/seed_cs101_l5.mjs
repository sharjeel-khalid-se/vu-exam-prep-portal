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

// 2. Create or fetch Lecture 5
let lec5 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 5").get(cs101.id);
if (!lec5) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 5, 'Web Page Design: HTML Tables, Lists, and Interactive Forms')
  `).run(cs101.id);
  lec5 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 5 with ID: ${lec5.id}`);
} else {
  console.log(`CS101 Lecture 5 found with ID: ${lec5.id}`);
}

const lId = lec5.id;

// 3. Clear existing questions for Lecture 5 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 5.`);

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
    stem: 'In HTML interactive forms, client data can be transmitted to a server using the ________ and ________ HTTP request methods.',
    options: {
      a: 'INCLUDE and POST',
      b: 'INCLUDE and GET',
      c: 'GET and POST',
      d: 'SEND and POST'
    },
    correct: 'c',
    explanation: 'The method attribute of the <form> element specifies how data is sent: GET (appends form-data into the URL query string) or POST (sends form-data inside the HTTP request body) (CS101 Handouts Lecture 5). Appeared in 15+ midterm past papers.',
    urdu_answer: 'ایچ ٹی ایم ایل فارمز کا ڈیٹا سرور تک پہنچانے کے لیے بنیادی طور پر دو طریقے استعمال ہوتے ہیں: GET اور POST۔'
  },
  {
    stem: 'To render an interactive checkbox on an HTML web page, which tag is utilized?',
    options: {
      a: '<CHECKBOX>',
      b: '<CHECK>',
      c: '<INPUT>',
      d: '<INPUTBOX>'
    },
    correct: 'c',
    explanation: 'A checkbox is created using the versatile input element with its type attribute set to "checkbox": <input type="checkbox"> (CS101 Handouts Lecture 5). Appeared in 18+ midterm papers.',
    urdu_answer: 'ویب پیج پر چیک باکس ظاہر کرنے کے لیے <input> ٹیگ استعمال کیا جاتا ہے، جس کی قسم (type="checkbox") رکھی جاتی ہے۔'
  },
  {
    stem: 'Which of the following attributes can be validly associated with the HTML <form> element?',
    options: {
      a: 'method (specifying GET or POST)',
      b: 'action (specifying the target URL/script)',
      c: 'name or value identifiers',
      d: 'All of the above'
    },
    correct: 'd',
    explanation: 'The <form> element supports action, method, name, enctype, and related target attributes to configure data processing and routing (CS101 Handouts Lecture 5). Appeared in 8+ midterm papers.',
    urdu_answer: '<form> ٹیگ کے اہم اوصاف (Attributes) میں method اور action سمیت دیگر تمام اوصاف شامل ہوتے ہیں۔'
  },
  {
    stem: 'In an HTML document, interactive user forms must always be enclosed strictly within the ________ tag-set:',
    options: {
      a: '<TITLE>...</TITLE>',
      b: '<HEAD>...</HEAD>',
      c: '<BODY>...</BODY>',
      d: '<SCRIPT>...</SCRIPT>'
    },
    correct: 'c',
    explanation: 'Because forms constitute visible user-interface elements (text fields, buttons, dropdowns), they must always reside inside the <body> container of the web page (CS101 Handouts Lecture 5). Appeared in 10+ papers.',
    urdu_answer: 'صارف کے لیے بنائے گئے انٹرایکٹو فارمز ہمیشہ <body> ٹیگز کے اندر رکھے جاتے ہیں۔'
  },
  {
    stem: 'In an HTML table structure, a new standard data cell is inserted into a table row using which tag-pair?',
    options: {
      a: '<BR>...</BR>',
      b: '<TR>...</TR>',
      c: '<TD>...</TD>',
      d: '<TABLE>...</TABLE>'
    },
    correct: 'c',
    explanation: 'Inside a table row (<tr>), individual data cells are created using <td>...</td> (Table Data) tags (CS101 Handouts Lecture 5). Appeared in 12+ midterm papers.',
    urdu_answer: 'ٹیبل کی قطار میں نیا ڈیٹا سیل بنانے کے لیے <td>...</td> ٹیگ استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Which of the following sets consists exclusively of valid HTML table layout tags?',
    options: {
      a: '<thead>, <body>, <tr>',
      b: '<table>, <tr>, <tt>',
      c: '<table>, <tr>, <td>',
      d: '<table>, <head>, <tfoot>'
    },
    correct: 'c',
    explanation: '<table> defines the table, <tr> defines a table row, and <td> defines a standard table data cell; these are the essential table building blocks (CS101 Handouts Lecture 5). Appeared in 8+ papers.',
    urdu_answer: 'ٹیبل کے لیے مخصوص بنیادی ٹیگز <table> (ٹیبل)، <tr> (قطار)، اور <td> (سیل) ہیں۔'
  },
  {
    stem: 'Software programs that reside on remote web servers and receive, process, and store information submitted by users through web forms are known as:',
    options: {
      a: 'Server-Side Scripts',
      b: 'Client-Side Scripts',
      c: 'Super Scripts',
      d: 'Form Design Scripts'
    },
    correct: 'a',
    explanation: 'Programs executing on the host server that handle form submission processing and database transactions (written in PHP, ASP, Node.js, Python, etc.) are called Server-Side Scripts (CS101 Handouts Lecture 5). Appeared in 14+ papers.',
    urdu_answer: 'وہ پروگرام جو ویب سرور پر موجود ہوتے ہیں اور فارم کے ذریعے بھیجی گئی معلومات پر کارروائی کرتے ہیں، سرور سائیڈ اسکرپٹس (Server-Side Scripts) کہلاتے ہیں۔'
  },
  {
    stem: 'If the type attribute of the <input> tag is set to "reset" (<input type="reset">), clicking that button will:',
    options: {
      a: 'Save all entered data to the server',
      b: 'Permanently format the layout of all fields',
      c: 'Clear all user inputs and restore all form fields to their original default values',
      d: 'Do nothing until custom JavaScript code is written'
    },
    correct: 'c',
    explanation: 'The standard behavior of a reset button (<input type="reset">) is to wipe user modifications and revert every form control to its initial default value (CS101 Handouts Lecture 5). Appeared in 7+ papers.',
    urdu_answer: 'ری سیٹ بٹن (type="reset") فارم کے تمام فیلڈز کو صاف کر کے ان کی اصل ابتدائی حالت (Default values) پر بحال کر دیتا ہے۔'
  },
  {
    stem: 'To configure an ordered list (<ol>) to begin its numbering from 20 instead of the default 1, the correct HTML syntax is:',
    options: {
      a: '<OL begin = "20">',
      b: '<OL initiate = "20">',
      c: '<OL start = "20">',
      d: '<OL from = "20">'
    },
    correct: 'c',
    explanation: 'The start attribute of the <ol> tag defines the beginning numerical sequence value: <ol start="20"> (CS101 Handouts Lecture 5). Appeared in 9+ midterm past papers.',
    urdu_answer: 'نمبر والی لسٹ کو 1 کے بجائے 20 سے شروع کرنے کے لیے <ol start="20"> کا کوڈ لکھا جاتا ہے۔'
  },
  {
    stem: 'Which of the following is the standard HTML attribute syntax to align content to the left inside a table data cell?',
    options: {
      a: '<tdleft>',
      b: '<td valign="left">',
      c: '<td leftalign>',
      d: '<td align="left">'
    },
    correct: 'd',
    explanation: 'Horizontal text alignment in HTML table cells is controlled using the align attribute: <td align="left"> (CS101 Handouts Lecture 5). Appeared in 6+ papers.',
    urdu_answer: 'سیل کے مواد کو بائیں جانب سیدھ میں لانے کے لیے <td align="left"> لکھا جاتا ہے۔'
  },
  {
    stem: 'In HTML markup, the <ul> tag is specifically used to create a/an:',
    options: {
      a: 'Underlined text segment',
      b: 'Universal line termination',
      c: 'Ordered numbered list',
      d: 'Unordered bulleted list'
    },
    correct: 'd',
    explanation: '<ul> stands for Unordered List, rendering items prepended by graphical bullets rather than numbers (CS101 Handouts Lecture 5). Appeared in 8+ papers.',
    urdu_answer: 'ایچ ٹی ایم ایل میں <ul> ٹیگ بغیر نمبروں والی بلٹ لسٹ (Unordered list) بنانے کے لیے استعمال ہوتا ہے۔'
  },
  {
    stem: 'In HTML table layouts, the COLSPAN attribute is used to make a single table cell span across multiple columns horizontally, while ROWSPAN extends cells:',
    options: {
      a: 'Upward across rows',
      b: 'Downward across multiple rows',
      c: 'Both upward and downward simultaneously',
      d: 'None of the given choices'
    },
    correct: 'b',
    explanation: 'The rowspan attribute extends a cell downward across multiple vertical rows, while colspan expands a cell across horizontal columns (CS101 Handouts Lecture 5). Appeared in 6+ past papers.',
    urdu_answer: 'ٹیبل کے لے آؤٹ میں rowspan کسی سیل کو نیچے کی طرف (Downward) متعدد قطاروں پر پھیلاتا ہے، جبکہ colspan کالموں پر پھیلاتا ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'What is the functional difference between a single-line text input field and a password input field in an HTML form?',
    correct: `<p><strong>Comparison: Single-Line Text vs. Password Input Field:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Single-Line Text Field</th>
      <th>Password Input Field</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>HTML Syntax</strong></td>
      <td><code>&lt;input type="text" name="..."&gt;</code></td>
      <td><code>&lt;input type="password" name="..."&gt;</code></td>
    </tr>
    <tr>
      <td><strong>Character Visibility</strong></td>
      <td>Typed characters are displayed openly as plain text on the screen.</td>
      <td>Typed characters are masked (hidden) using bullet dots (•) or asterisks (*) to preserve visual privacy.</td>
    </tr>
    <tr>
      <td><strong>Intended Use</strong></td>
      <td>General data entry: names, usernames, addresses, search terms.</td>
      <td>Confidential and sensitive data: authentication passwords, PIN codes, secret keys.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 5; cs101 midterm subjective by moaaz, Page 1, Q27.',
    urdu_answer: 'سادہ ٹیکسٹ فیلڈ (<input type="text">) میں صارف جو کچھ لکھتا ہے وہ اسکرین پر صاف نظر آتا ہے (جیسے نام)، جبکہ پاس ورڈ فیلڈ (<input type="password">) میں رازداری کے لیے حروف کے بجائے نقطے (•) یا ستارے (*) ظاہر ہوتے ہیں۔'
  },
  {
    stem: 'Which HTML elements and attributes are used for creating single-line text input fields versus multi-line text input areas?',
    correct: `<p><strong>HTML Elements for Text Inputs:</strong></p>

<ol>
  <li><strong>Single-Line Text Input:</strong>
    <p>Created using the void <code>&lt;input&gt;</code> element with attribute <code>type="text"</code>:</p>
    <p><code>&lt;input type="text" name="username" size="30" maxlength="50"&gt;</code></p>
    <ul>
      <li>Constrained to a single horizontal entry line; pressing "Enter" submits the form rather than inserting a line break.</li>
    </ul>
  </li>
  <li><strong>Multi-Line Text Input:</strong>
    <p>Created using the paired <code>&lt;textarea&gt;...&lt;/textarea&gt;</code> element:</p>
    <p><code>&lt;textarea name="comments" rows="5" cols="40"&gt;Default text here&lt;/textarea&gt;</code></p>
    <ul>
      <li>Allows users to enter extensive multi-paragraph text with carriage returns, specified by <code>rows</code> (vertical height) and <code>cols</code> (horizontal width) attributes.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 5; CS101 Mid Term Past Paper Mega File, Page 11.',
    urdu_answer: 'ایک لائن کی تحریر کے لیے <input type="text"> استعمال کیا جاتا ہے، جبکہ ایک سے زیادہ لائنوں کی لمبی تحریر (جیسے تبصرے یا پیغامات) کے لیے <textarea rows="5" cols="40">...</textarea> استعمال ہوتا ہے۔'
  },
  {
    stem: 'What is the fundamental difference in user interaction between Checkboxes and Radio Buttons in an HTML form?',
    correct: `<p><strong>Difference: Checkboxes vs. Radio Buttons:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Property</th>
      <th>Checkboxes (<code>type="checkbox"</code>)</th>
      <th>Radio Buttons (<code>type="radio"</code>)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Selection Mode</strong></td>
      <td>Multiple options can be selected simultaneously (independent toggles).</td>
      <td>Mutually exclusive; only one single option can be selected from a named group.</td>
    </tr>
    <tr>
      <td><strong>Visual Shape</strong></td>
      <td>Rendered as square check boxes (☐ / ☑).</td>
      <td>Rendered as circular buttons (○ / ◉).</td>
    </tr>
    <tr>
      <td><strong>Grouping Behavior</strong></td>
      <td>Sharing the same <code>name</code> attribute does not restrict multiple selections.</td>
      <td>Must share the exact same <code>name</code> attribute to form an exclusive toggle group.</td>
    </tr>
    <tr>
      <td><strong>Use Case</strong></td>
      <td>Selecting hobbies, preferences, languages known (e.g., Urdu, English, French).</td>
      <td>Selecting gender (Male / Female), payment method (Card / Cash).</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 5; Cs101 latest midterm paper 8, Q22.',
    urdu_answer: 'چیک باکسز (Checkboxes) میں صارف ایک سے زیادہ آپشنز بیک وقت منتخب کر سکتا ہے (جیسے مختلف مشاغل)، جبکہ ریڈیو بٹنز (Radio buttons) میں ایک گروپ کے اندر سے صرف اور صرف ایک ہی آپشن کا انتخاب کیا جا سکتا ہے (جیسے مرد یا عورت)۔'
  },
  {
    stem: 'Provide the general HTML syntax of a <form> tag, explaining its two most critical attributes: action and method.',
    correct: `<p><strong>General Syntax of the &lt;form&gt; Element:</strong></p>
<pre><code>&lt;form action="process_form.php" method="POST" name="registrationForm"&gt;
  &lt;!-- Form input controls, labels, and submit buttons go here --&gt;
&lt;/form&gt;</code></pre>

<p><strong>Explanation of Critical Attributes:</strong></p>
<ol>
  <li><strong><code>action</code>:</strong>
    <p>Specifies the target URL or server-side script endpoint (e.g., PHP, ASP.NET, Node.js script) that will receive and process the collected form data upon submission.</p>
  </li>
  <li><strong><code>method</code>:</strong>
    <p>Specifies the HTTP protocol communication method used to transmit the form-data. It takes one of two values:</p>
    <ul>
      <li><strong>GET:</strong> Encodes data directly into the URL query string (visible in address bar; used for bookmarks and search queries).</li>
      <li><strong>POST:</strong> Packages data invisibly inside the HTTP request payload body (secure, handles unlimited data size, used for passwords and registrations).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 5; CS101 Mid Term Past Paper Mega File, Page 12.',
    urdu_answer: '<form action="script.php" method="POST">۔ یہاں action بتاتا ہے کہ فارم کا ڈیٹا کس سرور فائل کو بھیجا جائے گا، اور method بتاتا ہے کہ ڈیٹا کیسے بھیجا جائے گا (GET کے ذریعے یو آر ایل میں، یا POST کے ذریعے باڈی میں محفوظ طریقے سے)۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Why are Interactive Forms essential on the World Wide Web? Discuss their key advantages and describe how client-side scripting and server-side processing collaborate to handle user form submissions.',
    correct: `<p><strong>1. The Vital Role of Interactive Forms:</strong></p>
<p>Early static web pages were strictly read-only informational billboards. Interactive forms transformed the World Wide Web into a two-way, dynamic transactional platform, allowing users to communicate directly with web applications, submit feedback, authenticate identities, and perform e-commerce transactions.</p>

<p><strong>2. Key Advantages of Interactive Forms:</strong></p>
<ul>
  <li><strong>Structured Data Gathering:</strong> Organizes diverse inputs into standardized key-value pairs (text, checkboxes, radio selections, dropdown menus).</li>
  <li><strong>Personalization & Authentication:</strong> Enables secure user login sessions, profile customization, and identity verification.</li>
  <li><strong>Commercial Transactions:</strong> Powers e-commerce shopping carts, order placements, ticket bookings, and online financial payments.</li>
  <li><strong>User Engagement:</strong> Facilitates search queries, user feedback, discussion forum postings, and survey collection.</li>
</ul>

<p><strong>3. Collaboration Between Client-Side Scripting and Server-Side Processing:</strong></p>
<ol>
  <li><strong>Client-Side Validation (Browser-Level):</strong>
    <p>JavaScript programs running inside the user's browser intercept form submission, instantly validating user input (e.g., verifying email formats, checking required fields, confirming password lengths). This provides instant user feedback without making unnecessary server network round-trips.</p>
  </li>
  <li><strong>Server-Side Processing & Storage (Host-Level):</strong>
    <p>Once client validation passes, the browser packages the form fields and sends an HTTP POST/GET request to the server specified in the <code>action</code> attribute. Server-side scripts (e.g., Node.js, Python, PHP) sanitize the data, authenticate credentials against back-end relational databases, and respond with an updated HTML view or confirmation token.</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 5; CS101 past papers Fall 2009 s4 Q32.',
    urdu_answer: 'انٹرایکٹو فارمز نے ویب کو یکطرفہ کے بجائے دوطرفہ اور فعال بنا دیا جس کے ذریعے ای کامرس، لاگ ان اور آن لائن ڈیٹا جمع کرنا ممکن ہوا۔ کلائنٹ سائیڈ جاوا اسکرپٹ فوری طور پر فیلڈز کی جانچ پڑتال کرتا ہے، جبکہ سرور سائیڈ اسکرپٹ ڈیٹا کو ڈیٹا بیس میں محفوظ کر کے کارروائی مکمل کرتا ہے۔'
  },
  {
    stem: 'Write a complete, valid HTML script demonstrating a form that uses radio buttons to allow a user to select their gender (Male, Female, or Other). Explain the mandatory grouping attribute required for radio buttons to function correctly.',
    correct: `<p><strong>Complete HTML Code Example for Gender Radio Buttons:</strong></p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Gender Selection Form&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h2&gt;User Registration Form&lt;/h2&gt;
    &lt;form action="register.php" method="POST"&gt;
      &lt;p&gt;Please select your gender:&lt;/p&gt;

      &lt;input type="radio" id="male" name="gender" value="Male" checked&gt;
      &lt;label for="male"&gt;Male&lt;/label&gt;&lt;br&gt;

      &lt;input type="radio" id="female" name="gender" value="Female"&gt;
      &lt;label for="female"&gt;Female&lt;/label&gt;&lt;br&gt;

      &lt;input type="radio" id="other" name="gender" value="Other"&gt;
      &lt;label for="other"&gt;Other&lt;/label&gt;&lt;br&gt;&lt;br&gt;

      &lt;input type="submit" value="Submit Form"&gt;
      &lt;input type="reset" value="Reset"&gt;
    &lt;/form&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<p><strong>The Mandatory Grouping Attribute (<code>name</code>):</strong></p>
<ul>
  <li>For radio buttons to operate as a <strong>mutually exclusive group</strong> (where selecting one button automatically deselects all other options in the set), every radio input element in that group <strong>must share the exact same <code>name</code> attribute</strong> (e.g., <code>name="gender"</code>).</li>
  <li>If different <code>name</code> attributes are accidentally assigned, the browser treats them as independent inputs, allowing the user to select multiple conflicting options simultaneously.</li>
  <li>The <code>value</code> attribute specifies the exact data string sent to the receiving server script when that specific radio button is chosen.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 5; Team Hadi Midterm File 5 Q21; CS101 Mid_term_Solved.pdf Page 5.',
    urdu_answer: 'ریڈیو بٹنز کے لیے کوڈ: <input type="radio" name="gender" value="Male"> Male اور <input type="radio" name="gender" value="Female"> Female۔ ریڈیو بٹنز کے درست کام کرنے کی بنیادی شرط یہ ہے کہ تمام آپشنز کا name ایٹری بیوٹ ایک جیسا ہونا چاہیے تاکہ وہ باہمی متضاد گروپ کی طرح کام کریں اور صرف ایک ہی منتخب ہو سکے۔'
  }
];

// 4. Insert questions
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

// 5. Verify counts
const countRow = db.prepare('SELECT count(*) as count FROM questions WHERE lecture_id = ?').get(lId);
const totalRow = db.prepare('SELECT count(*) as count FROM questions').get();
const lecCount = db.prepare('SELECT count(*) as count FROM lectures').get();
const subCount = db.prepare('SELECT count(*) as count FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS101 Lecture 5 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

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

// 2. Create or fetch Lecture 4
let lec4 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 4").get(cs101.id);
if (!lec4) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 4, 'Hardware Architecture (RAM, ROM, CPU) and HTML Basics & Document Structure')
  `).run(cs101.id);
  lec4 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 4 with ID: ${lec4.id}`);
} else {
  console.log(`CS101 Lecture 4 found with ID: ${lec4.id}`);
}

const lId = lec4.id;

// 3. Clear existing questions for Lecture 4 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 4.`);

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

// 13 MCQs
const mcqs = [
  {
    stem: 'Every standard HTML source document is structurally partitioned into two primary top-level sections: ________ and ________.',
    options: {
      a: 'Head and Body',
      b: 'Frame and Title',
      c: 'Head and Title',
      d: 'Frame and Head'
    },
    correct: 'a',
    explanation: 'An HTML document is enclosed in <html> tags and consists of two essential subsections: the <head> (containing metadata, document title, and scripts) and the <body> (containing the visible rendered content) (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ہر معیاری HTML دستاویز بنیادی طور پر دو حصوں پر مشتمل ہوتی ہے: ہیڈ (Head) اور باڈی (Body)۔'
  },
  {
    stem: 'In terms of syntax and markup structure, HTML elements are classified into:',
    options: {
      a: 'Only Single tags',
      b: 'Only Paired tags',
      c: 'Single and Paired tags',
      d: 'Multiple tags only'
    },
    correct: 'c',
    explanation: 'HTML employs both paired tags with opening and closing tags (e.g., <p>...</p>, <b>...</b>) and standalone single (void/empty) tags that do not require closing tags (e.g., <br>, <hr>, <img>) (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ایچ ٹی ایم ایل میں ٹیگز کی دو بنیادی اقسام ہوتی ہیں: سنگل ٹیگز (جیسے <br>) اور پیئرڈ ٹیگز (جیسے <p>...</p>)۔'
  },
  {
    stem: 'The visual rendering effect of the paragraph tag (<p>...</p>) in an HTML web page is that it:',
    options: {
      a: 'Brings the cursor to the next line with an automatic vertical blank line space',
      b: 'Brings the cursor back to the previous line',
      c: 'Brings the cursor to the next after next line without spacing',
      d: 'Keeps the cursor inline on the same line'
    },
    correct: 'a',
    explanation: 'The <p> tag defines a paragraph block. Browsers automatically insert a line break and vertical margin before and after paragraph elements, moving subsequent text to a new line (CS101 Handouts Lecture 4). Appeared in multiple midterm files.',
    urdu_answer: 'پیراگراف ٹیگ (<p>) متن کو اگلی لائن پر منتقل کرتا ہے اور اوپر نیچے خالی جگہ (مارجن) چھوڑتا ہے۔'
  },
  {
    stem: 'To render text in bold typeface in standard HTML, the ________ tag is used:',
    options: {
      a: '<BR></BR>',
      b: '<BOLD></BOLD>',
      c: '<B></B>',
      d: '<BODY></BODY>'
    },
    correct: 'c',
    explanation: 'The <b>...</b> (or <strong>...</strong>) tag is used to format enclosed text in bold weight (CS101 Handouts Lecture 4). Appeared in 10+ midterm past papers.',
    urdu_answer: 'متن کو بولڈ (موٹا) کرنے کے لیے HTML میں <b>...</b> ٹیگ کا استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In legacy HTML styling, the background color of a web page is modified using the ________ attribute of the <body> tag.',
    options: {
      a: 'background',
      b: 'bgcolor',
      c: 'backcolor',
      d: 'backgroundcolor'
    },
    correct: 'b',
    explanation: 'In HTML markup, the background color of the canvas is defined using <body bgcolor="colorname_or_hex"> (CS101 Handouts Lecture 4). Appeared in 8+ midterm papers.',
    urdu_answer: 'ویب پیج کا پس منظر (Background color) تبدیل کرنے کے لیے <body> ٹیگ کے اندر bgcolor ایٹری بیوٹ استعمال ہوتا ہے۔'
  },
  {
    stem: 'The document page title tag (<title>...</title>) must be placed strictly inside the ________ section of an HTML document.',
    options: {
      a: 'Body section',
      b: 'Head section',
      c: 'Meta section',
      d: 'Script section'
    },
    correct: 'b',
    explanation: 'The <title> tag defines the title displayed on the browser\'s tab/title bar and must reside within the <head>...</head> container (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ویب پیج کا ٹائٹل ٹیگ (<title>) ہمیشہ <head> سیکشن کے اندر لکھا جاتا ہے۔'
  },
  {
    stem: 'HTML supports how many hierarchical levels of heading tags (from largest to smallest)?',
    options: {
      a: 'Four levels',
      b: 'Six levels (<h1> through <h6>)',
      c: 'Ten levels',
      d: 'Twelve levels'
    },
    correct: 'b',
    explanation: 'HTML provides exactly six standard heading levels: <h1> for the most prominent main heading down to <h6> for the least prominent subheading (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ایچ ٹی ایم ایل میں ہیڈنگ کے کل 6 لیولز (<h1> سے <h6> تک) ہوتے ہیں۔'
  },
  {
    stem: 'Which of the following represents the correct HTML tag for the largest, highest-level heading?',
    options: {
      a: '<head>',
      b: '<h6>',
      c: '<h1>',
      d: '<heading>'
    },
    correct: 'c',
    explanation: '<h1> is the top-level heading tag that renders text with the largest font size and heaviest weight by default (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'سب سے بڑی ہیڈنگ کے لیے <h1> ٹیگ استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In an HTML document, which tag is essential for containing the visible text, images, and content displayed in the browser window?',
    options: {
      a: '<Head> tag',
      b: '</Body> tag without opener',
      c: '<Body> tag',
      d: 'None of the above'
    },
    correct: 'c',
    explanation: 'The <body> tag encloses all visible layout content (text, hyperlinks, images, tables, lists) rendered in the user\'s viewport (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ویب پیج پر نظر آنے والے تمام مواد (متن، تصاویر وغیرہ) کو دکھانے کے لیے <body> ٹیگ کا ہونا ناگزیر ہے۔'
  },
  {
    stem: 'Which component of a computer system is commonly referred to as the "brain of the computer"?',
    options: {
      a: 'Motherboard',
      b: 'Expansion Slots',
      c: 'Central Processing Unit (Processor / CPU)',
      d: 'Power Supply Unit'
    },
    correct: 'c',
    explanation: 'The Central Processing Unit (CPU / Processor) executes instructions, performs mathematical calculations, and coordinates all hardware operations, functioning as the brain of the computer (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'سینٹرل پروسیسنگ یونٹ (پروسیسر / CPU) کو کمپیوٹر کا دماغ (Brain of computer) کہا جاتا ہے۔'
  },
  {
    stem: 'Which type of computer memory is volatile, losing all of its stored data when electrical power is switched off?',
    options: {
      a: 'Random Access Memory (RAM)',
      b: 'Read Only Memory (ROM)',
      c: 'Magnetic Hard Disk',
      d: 'Optical CD-ROM'
    },
    correct: 'a',
    explanation: 'RAM is volatile primary memory used by the CPU for actively running processes; it requires continuous electrical power to maintain state (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'ریم (RAM) ایک عارضی یا وولاٹائل (Volatile) میموری ہے جس کا ڈیٹا کمپیوٹر بند ہونے پر ختم ہو جاتا ہے۔'
  },
  {
    stem: 'Which of the following statements correctly describes Read Only Memory (ROM)?',
    options: {
      a: 'It is volatile and loses contents upon reboot',
      b: 'It is dynamically reprogrammed during regular user program execution',
      c: 'It is a volatile cache memory inside the processor',
      d: 'It is non-volatile and permanently stores firmware bootstrap instructions'
    },
    correct: 'd',
    explanation: 'ROM is non-volatile semiconductor memory that permanently retains firmware (such as BIOS/UEFI boot routines) even when power is turned off (CS101 Handouts Lecture 4). Appeared in multiple past papers.',
    urdu_answer: 'روم (ROM) ایک نان-وولاٹائل (Non-volatile) میموری ہے جو مستقل بنیادوں پر ڈیٹا کو محفوظ رکھتی ہے۔'
  },
  {
    stem: 'The historic Cray-1 machine developed in 1976 was the world\'s first commercially successful:',
    options: {
      a: 'Supercomputer',
      b: 'Mainframe computer',
      c: 'Minicomputer',
      d: 'Microcomputer'
    },
    correct: 'a',
    explanation: 'Designed by Seymour Cray, the Cray-1 was the first commercially successful vector supercomputer, capable of executing 160 million floating-point operations per second (160 MFLOPS) (CS101 Handouts Lecture 4). Appeared in multiple midterm files.',
    urdu_answer: 'کرے-1 (Cray-1) دنیا کا پہلا تجارتی طور پر کامیاب سپر کمپیوٹر (Supercomputer) تھا۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'What is the <p> tag in HTML and how does it functionally differ from the <br> line break tag?',
    correct: `<p><strong>Comparison: &lt;p&gt; Tag vs. &lt;br&gt; Tag:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Paragraph Tag (&lt;p&gt;...&lt;/p&gt;)</th>
      <th>Line Break Tag (&lt;br&gt;)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tag Classification</strong></td>
      <td>Paired container tag (requires opening <code>&lt;p&gt;</code> and closing <code>&lt;/p&gt;</code>).</td>
      <td>Single void tag (does not require a closing tag).</td>
    </tr>
    <tr>
      <td><strong>Visual Spacing</strong></td>
      <td>Inserts a line break along with an automatic top and bottom vertical margin/blank line.</td>
      <td>Inserts an immediate single-line break with zero additional paragraph margin.</td>
    </tr>
    <tr>
      <td><strong>Semantic Purpose</strong></td>
      <td>Defines a complete, distinct semantic block of text or paragraph.</td>
      <td>Forces a simple carriage return inside an existing paragraph, address, or poetic line.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 4; CS101 past papers Fall 2009 s4 Q29; CS101 solved past papers Q18.',
    urdu_answer: '<p> ٹیگ ایک پیئرڈ ٹیگ ہے جو ایک مکمل پیراگراف بناتا ہے اور اس کے اوپر نیچے خالی جگہ چھوڑتا ہے۔ جبکہ <br> ٹیگ ایک سنگل ٹیگ ہے جو بغیر کوئی اضافی خالی جگہ چھوڑے تحریر کو اگلی لائن پر منتقل کرتا ہے۔'
  },
  {
    stem: 'Identify the structural errors and omissions in the following HTML script segment and provide the corrected code: \n<HTML>\n<HEAD>\n<TITLE> VIRTUAL UNIVERSITY OF PAKISTAN </TITLE>\n</HEAD>',
    correct: `<p><strong>Identified Errors & Omissions:</strong></p>
<ol>
  <li><strong>Missing Body Element:</strong> The script contains no <code>&lt;BODY&gt;...&lt;/BODY&gt;</code> section, which is required to hold visible content.</li>
  <li><strong>Unclosed Root Tag:</strong> The opening root <code>&lt;HTML&gt;</code> tag is never closed with a corresponding <code>&lt;/HTML&gt;</code> tag.</li>
</ol>

<p><strong>Corrected HTML Script:</strong></p>
<pre><code>&lt;HTML&gt;
  &lt;HEAD&gt;
    &lt;TITLE&gt; VIRTUAL UNIVERSITY OF PAKISTAN &lt;/TITLE&gt;
  &lt;/HEAD&gt;
  &lt;BODY&gt;
    &lt;P&gt;Welcome to Virtual University of Pakistan&lt;/P&gt;
  &lt;/BODY&gt;
&lt;/HTML&gt;</code></pre>`,
    explanation: 'From CS101 Handouts Lecture 4; CS101 - 3.pdf Q21; Team Hadi Midterm File 6 Q21.',
    urdu_answer: 'دیے گئے کوڈ میں دو بڑی خامیاں ہیں: 1. مواد ظاہر کرنے کے لیے <body>...</body> سیکشن موجود نہیں ہے، اور 2. شروع میں کھلنے والا <HTML> ٹیگ آخر میں بند (</HTML>) نہیں کیا گیا۔'
  },
  {
    stem: 'What title will be displayed in the browser window title bar for the following HTML code segment, and what is the underlying browser rule?\n<Head>\n<TITLE> VU Web </TITLE>\n<TITLE> Page </TITLE>\n</Head>',
    correct: `<p><strong>Displayed Title:</strong></p>
<p>The title displayed on the browser title bar / tab will be: <strong>"VU Web"</strong>.</p>

<p><strong>Underlying Rule:</strong></p>
<ul>
  <li>According to HTML specifications, the <code>&lt;head&gt;</code> element must contain at most one <code>&lt;title&gt;</code> tag.</li>
  <li>When multiple <code>&lt;title&gt;</code> tags are mistakenly declared, modern web browsers sequentially parse the header and adopt the <strong>first valid <code>&lt;title&gt;</code> element</strong> encountered ("VU Web"), ignoring or discarding any subsequent title tags.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 4; CS101 solved past papers Q17.',
    urdu_answer: 'براؤزر کے ٹائٹل بار پر صرف پہلا ٹائٹل "VU Web" نظر آئے گا، کیونکہ براؤزر ہیڈ سیکشن میں موجود پہلے ٹائٹل ٹیگ کو قبول کرتا ہے اور بعد میں آنے والے ڈپلیکیٹ ٹائٹل ٹیگز کو نظر انداز کر دیتا ہے۔'
  },
  {
    stem: 'Differentiate between Single Tags and Paired Tags in HTML markup, providing at least one concrete example for each.',
    correct: `<p><strong>Comparison: Single Tags vs. Paired Tags in HTML:</strong></p>

<ol>
  <li><strong>Paired Tags (Container Tags):</strong>
    <ul>
      <li>These tags consist of an opening tag <code>&lt;tag&gt;</code> and a closing tag <code>&lt;/tag&gt;</code> with a forward slash.</li>
      <li>They enclose content and apply styling or formatting specifically to the enclosed text or element.</li>
      <li><strong>Examples:</strong> <code>&lt;b&gt;Bold Text&lt;/b&gt;</code>, <code>&lt;p&gt;Paragraph content&lt;/p&gt;</code>, <code>&lt;h1&gt;Main Heading&lt;/h1&gt;</code>.</li>
    </ul>
  </li>
  <li><strong>Single Tags (Void / Empty Tags):</strong>
    <ul>
      <li>These tags stand alone and do not enclose content; hence they do not require a closing tag.</li>
      <li>They instruct the browser to execute a standalone action or insert a standalone element.</li>
      <li><strong>Examples:</strong> <code>&lt;br&gt;</code> (line break), <code>&lt;hr&gt;</code> (horizontal rule), <code>&lt;img src="..."&gt;</code> (image).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 4; CS101 Team Hadi Midterm File 6 Q13.',
    urdu_answer: 'پیئرڈ ٹیگز وہ ہوتے ہیں جن کا اوپننگ اور کلوزنگ دونوں ٹیگز ہوتے ہیں (جیسے <b>...</b> یا <p>...</p>)۔ جبکہ سنگل ٹیگز کو بند کرنے کی ضرورت نہیں ہوتی اور وہ اکیلے استعمال ہوتے ہیں (جیسے <br> یا <hr>)۔'
  }
];

// 1 Long Question
const longQuestions = [
  {
    stem: 'Provide an in-depth explanation of the overall structure of a standard HTML document. Explain the precise purpose and syntax of the root <html>, <head>, <title>, and <body> tags, and specify which section is responsible for rendering content in the user viewport.',
    correct: `<p><strong>1. Architectural Anatomy of an HTML Document:</strong></p>
<p>HTML (HyperText Markup Language) documents are plain text files structured as a hierarchical tree of nested elements. Every conforming HTML document follows a standardized skeleton consisting of two distinct administrative sections:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Page Title Goes Here&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Visible Heading&lt;/h1&gt;
    &lt;p&gt;Visible paragraph text rendered in the browser window.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<p><strong>2. Detailed Explanation of Core Tags:</strong></p>
<ol>
  <li><strong>The Root Tag (<code>&lt;html&gt;...&lt;/html&gt;</code>):</strong>
    <p>The root container element that encloses the entire web page. It informs the browser that the document contains HTML-formatted code and demarcates where the page starts and terminates.</p>
  </li>
  <li><strong>The Header Section (<code>&lt;head&gt;...&lt;/head&gt;</code>):</strong>
    <p>Contains document <em>metadata</em> (data about data). Content placed inside the &lt;head&gt; is <strong>not rendered directly</strong> on the main webpage canvas. It houses page titles, character encodings (e.g., UTF-8), external CSS stylesheets, search engine meta descriptions, and JavaScript files.</p>
  </li>
  <li><strong>The Document Title (<code>&lt;title&gt;...&lt;/title&gt;</code>):</strong>
    <p>Must reside inside the &lt;head&gt; section. It specifies the text displayed in the browser's tab or title bar, provides the title for browser bookmarks/favorites, and serves as the headline in search engine search results.</p>
  </li>
  <li><strong>The Document Body (<code>&lt;body&gt;...&lt;/body&gt;</code>):</strong>
    <p>The operational section responsible for all <strong>visible layout content</strong> rendered in the browser viewport. Everything the end-user sees and interacts with — including headings (&lt;h1&gt;–&lt;h6&gt;), paragraphs (&lt;p&gt;), images (&lt;img&gt;), tables (&lt;table&gt;), lists, forms, and hyperlinks (&lt;a&gt;) — must be enclosed within the &lt;body&gt; element.</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 4; CS101 Team Hadi Midterm File 3 Q19; CS101 Mid Term Paper Q14.',
    urdu_answer: 'ایچ ٹی ایم ایل کی دستاویز بنیادی طور پر دو حصوں پر مشتمل ہوتی ہے: 1. ہیڈ سیکشن (<head>) جو پیج کا ٹائٹل اور میٹا ڈیٹا رکھتا ہے جو براہ راست اسکرین پر نظر نہیں آتا، اور 2. باڈی سیکشن (<body>) جو تمام نظر آنے والے مواد جیسے ہیڈنگز، پیراگراف، تصاویر اور لنکس پر مشتمل ہوتا ہے اور براؤزر کی ونڈو میں ڈسپلے ہوتا ہے۔'
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
console.log(`CS101 Lecture 4 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

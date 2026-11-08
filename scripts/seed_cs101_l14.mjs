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

// 2. Create or fetch Lecture 14
let lec14 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 14").get(cs101.id);
if (!lec14) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 14, 'Word Processing Applications, Text Formatting, and Desktop Publishing')
  `).run(cs101.id);
  lec14 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 14 with ID: ${lec14.id}`);
} else {
  console.log(`CS101 Lecture 14 found with ID: ${lec14.id}`);
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

// 16 MCQs
const mcqs = [
  {
    stem: 'Which category of application software was originally designed as a modern electronic replacement for the manual typewriter?',
    options: {
      a: 'Spreadsheet Software',
      b: 'Word Processor Software',
      c: 'Presentation Software',
      d: 'Database Management System'
    },
    correct: 'b',
    explanation: '<p>A <strong>Word Processor</strong> was developed to replace mechanical typewriters by providing digital text entry, easy editing, formatting, and reprinting without retyping entire pages.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 85 and <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q16.</p>',
    urdu_answer: 'ورڈ پروسیسر سافٹ ویئر (جیسے مائیکروسافٹ ورڈ) کو روایتی ٹائپ رائٹر کے متبادل کے طور پر تیار کیا گیا تھا تاکہ بغیر دوبارہ ٹائپ کیے متن میں آسانی سے ترمیم، فارمیٹنگ اور پرنٹنگ کی جا سکے۔'
  },
  {
    stem: 'In word processing and computer graphics, what does the acronym "WYSIWYG" stand for?',
    options: {
      a: 'What you say is what you get',
      b: 'Where you see is where you go',
      c: 'What you see is what you get',
      d: 'When you see is when you get'
    },
    correct: 'c',
    explanation: '<p><strong>WYSIWYG</strong> stands for <em>"What You See Is What You Get"</em>, meaning the formatted document displayed on the computer screen precisely matches the final printed or published output.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q15 & Q27.</p>',
    urdu_answer: 'WYSIWYG کا مطلب ہے "What You See Is What You Get"، یعنی جو کچھ اسکرین پر نظر آ رہا ہوتا ہے، بالکل وہی نتیجہ پرنٹ آؤٹ میں نکلتا ہے۔'
  },
  {
    stem: 'Which feature is widely regarded as one of the most powerful and liberating capabilities in word processing, allowing users to safely experiment and correct errors?',
    options: {
      a: 'Cut',
      b: 'Copy',
      c: 'Paste',
      d: 'Undo'
    },
    correct: 'd',
    explanation: '<p>The <strong>Undo</strong> feature is considered the best capability in word processing because it removes the fear of making mistakes, enabling users to reverse unintended actions and experiment freely.</p><p><strong>Reference:</strong> Appeared 25+ times in <code>CS101 Mid_term_Solved.pdf</code> Q13, <code>CS101 solved.pdf</code> Q13, and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 35.</p>',
    urdu_answer: 'ان ڈو (Undo) کو ورڈ پروسیسنگ کا بہترین فیچر مانا جاتا ہے کیونکہ یہ غلطیوں کو فوری طور پر ختم کرنے اور بغیر کسی خوف کے نئی تبدیلیاں آزمانے کی آزادی دیتا ہے۔'
  },
  {
    stem: 'A built-in proofing tool in word processors that helps users find synonyms (words with similar meanings) and antonyms is called the:',
    options: {
      a: 'Language Pack',
      b: 'Paragraph Inspector',
      c: 'Thesaurus',
      d: 'Character Symbol Map'
    },
    correct: 'c',
    explanation: '<p>A <strong>Thesaurus</strong> is a built-in lexical reference tool in word processors that provides lists of synonyms and antonyms to improve vocabulary and writing style.</p><p><strong>Reference:</strong> Appeared 18+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 33 Q9 and <code>CS101 MID-Term by Attiq Kundi</code> Page 21.</p>',
    urdu_answer: 'تھیسارس (Thesaurus) ورڈ پروسیسر کا ایک ایسا ٹول ہے جو الفاظ کے ہم معنی (Synonyms) اور متضاد (Antonyms) تلاش کرنے میں مدد دیتا ہے۔'
  },
  {
    stem: 'Which clipboard command removes the selected text from its current document position while preserving a temporary copy in the clipboard buffer?',
    options: {
      a: 'Copy',
      b: 'Delete (Backspace)',
      c: 'Cut',
      d: 'Clear Formatting'
    },
    correct: 'c',
    explanation: '<p>The <strong>Cut</strong> command removes the highlighted text from the screen and places it into the system clipboard so it can be pasted into another location.</p><p><strong>Reference:</strong> Appeared 15+ times in <code>CS101 MIDTERM FILE 5 SOLVED BY TEAM HADI.pdf</code> Q4 and <code>CS101 Mid_term_Solved.pdf</code> Q10/Q16.</p>',
    urdu_answer: 'کٹ (Cut) کمانڈ منتخب کردہ ٹیکسٹ کو صفحے سے ہٹا دیتی ہے لیکن کلپ بورڈ میں محفوظ رکھتی ہے تاکہ اسے کسی دوسری جگہ پیسٹ کیا جا سکے۔'
  },
  {
    stem: 'A dedicated word processor like Microsoft Word is primarily designed as an application to:',
    options: {
      a: 'Build editable word documents and formatted text',
      b: 'Compile executable C++ binary code',
      c: 'Execute complex relational database joins',
      d: 'Generate interactive vector animations'
    },
    correct: 'a',
    explanation: '<p>Word processors are software applications designed specifically to create, edit, format, store, and print <strong>editable text documents</strong>.</p><p><strong>Reference:</strong> Appeared 16+ times in <code>CS101 Grand Quiz For Mid Term Prepration by VU Stars.pdf</code> Q15 & Q19.</p>',
    urdu_answer: 'مائیکروسافٹ ورڈ بنیادی طور پر قابلِ ترمیم ٹیکسٹ دستاویزات (Editable Word Documents) تیار، فارمیٹ اور پرنٹ کرنے کے لیے استعمال ہوتا ہے۔'
  },
  {
    stem: 'Which of the following is globally recognized as the most popular and widely used commercial word processing software?',
    options: {
      a: 'MS Excel',
      b: 'MS Word',
      c: 'WordPad',
      d: 'Notepad'
    },
    correct: 'b',
    explanation: '<p><strong>Microsoft Word</strong> is the world\'s most popular and feature-rich commercial word processing application.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q60 and <code>CS101 Mid Term By JUANID.pdf</code> Q60.</p>',
    urdu_answer: 'مائیکروسافٹ ورڈ (MS Word) دنیا کا سب سے زیادہ استعمال ہونے والا اور مقبول ورڈ پروسیسر ہے۔'
  },
  {
    stem: 'Commercially distributed application packages sold in pre-sealed retail boxes for general public use (such as Microsoft Office) are classified as:',
    options: {
      a: 'System Software',
      b: 'Freeware',
      c: 'Shrink-Wrapped Software',
      d: 'Custom-Built Tailored Software'
    },
    correct: 'c',
    explanation: '<p><strong>Shrink-Wrapped Software</strong> refers to commercial off-the-shelf software sold in standard retail packaging to a mass market under a standard end-user license agreement.</p><p><strong>Reference:</strong> Appeared 14+ times across past papers including <code>Cs101-latest -solved-midterm paper 6.pdf</code> Q16 and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 81/82.</p>',
    urdu_answer: 'شرنک ریپڈ سافٹ ویئر (Shrink-Wrapped Software) وہ کمرشل سافٹ ویئر کہلاتا ہے جو مارکیٹ میں عام پبلک کے لیے پیکٹوں میں فروخت کیا جاتا ہے، جیسے مائیکروسافٹ آفس۔'
  },
  {
    stem: 'In the modern Microsoft Word ribbon interface, which tab contains the "Proofing" group (featuring Spelling & Grammar and Thesaurus)?',
    options: {
      a: 'Home',
      b: 'Insert',
      c: 'Review',
      d: 'View'
    },
    correct: 'c',
    explanation: '<p>The <strong>Review</strong> ribbon tab houses proofing tools, including Spelling & Grammar, Thesaurus, Word Count, and Language Translation.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> Page 23.</p>',
    urdu_answer: 'مائیکروسافٹ ورڈ کے ریبن میں پروفنگ گروپ (جس میں اسپیلنگ، گرامر اور تھیسارس شامل ہیں) "Review" ٹیب کے اندر موجود ہوتا ہے۔'
  },
  {
    stem: 'What is the standard universal keyboard shortcut to execute the "Cut" command on selected text in Windows applications?',
    options: {
      a: 'Ctrl + C',
      b: 'Ctrl + X',
      c: 'Ctrl + V',
      d: 'Ctrl + K'
    },
    correct: 'b',
    explanation: '<p><strong>Ctrl + X</strong> cuts selected content into the clipboard. (Ctrl+C is Copy, Ctrl+V is Paste).</p><p><strong>Reference:</strong> Appeared 12+ times across past papers including <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q69.</p>',
    urdu_answer: 'منتخب کردہ مواد کو کٹ (Cut) کرنے کی عالمی شارٹ کٹ کی Ctrl + X ہے۔'
  },
  {
    stem: 'What is the keyboard shortcut to execute the "Undo" command to reverse your most recent action in MS Word?',
    options: {
      a: 'Ctrl + Z',
      b: 'Ctrl + Y',
      c: 'Ctrl + X',
      d: 'Ctrl + U'
    },
    correct: 'a',
    explanation: '<p><strong>Ctrl + Z</strong> executes the Undo operation, reverting the last typing, formatting, or deletion action. (Ctrl+Y is Redo).</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101 MID-Term by Attiq Kundi</code> Page 24.</p>',
    urdu_answer: 'اپنی آخری غلطی یا ایکشن کو کالعدم (Undo) کرنے کے لیے شارٹ کٹ کی Ctrl + Z استعمال کی جاتی ہے۔'
  },
  {
    stem: 'In Microsoft Word, the options for bulleted lists and numbered lists are located within which group on the "Home" ribbon tab?',
    options: {
      a: 'Font Group',
      b: 'Paragraph Group',
      c: 'Clipboard Group',
      d: 'Styles Group'
    },
    correct: 'b',
    explanation: '<p>Bullets, numbering, paragraph indentation, and alignment options reside within the <strong>Paragraph</strong> group under the Home ribbon tab.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> Page 25.</p>',
    urdu_answer: 'ایم ایس ورڈ میں بلٹس (Bullets) اور نمبرنگ کا آپشن ہوم ٹیب کے "Paragraph" گروپ میں پایا جاتا ہے۔'
  },
  {
    stem: 'Which of the following software applications are recognized examples of Word Processors?',
    options: {
      a: 'Corel WordPerfect',
      b: 'Sun StarOffice Writer',
      c: 'Microsoft Word',
      d: 'All of the above'
    },
    correct: 'd',
    explanation: '<p>WordPerfect, StarOffice Writer, and Microsoft Word are all dedicated full-featured word processing software suites.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q43.</p>',
    urdu_answer: 'ورڈ پرفیکٹ، اسٹار آفس رائٹر اور ایم ایس ورڈ یہ سبھی ورڈ پروسیسنگ سافٹ ویئر ہیں، اس لیے درست جواب All of the above ہے۔'
  },
  {
    stem: 'Which of the following document creation tasks can be effectively performed using a modern word processor?',
    options: {
      a: 'Writing formal letters and memos',
      b: 'Composing academic research papers and dissertations',
      c: 'Generating envelopes and formatted address labels',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: '<p>Word processors are versatile tools used for letters, memos, academic papers, books, brochures, envelopes, and mailing labels.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q16.</p>',
    urdu_answer: 'ورڈ پروسیسر کے ذریعے خطوط، تحقیقی مقالے، رپورٹس اور ایڈریس لیبلز سب کچھ تیار کیا جا سکتا ہے۔'
  },
  {
    stem: 'Approximately how many words or entries does a typical built-in spell checker dictionary in a standard word processor contain?',
    options: {
      a: '10,000 entries',
      b: '25,000 entries',
      c: '500,000 entries',
      d: '5,000,000 entries'
    },
    correct: 'b',
    explanation: '<p>According to classic VU CS101 course material, a typical baseline word processor dictionary contains approximately <strong>25,000 entries</strong> for automated spell-checking.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> Page 22.</p>',
    urdu_answer: 'سی ایس 101 ہینڈ آؤٹس کے مطابق روایتی ورڈ پروسیسر کی بنیادی ڈکشنری میں عام طور پر تقریباً 25,000 الفاظ (اینٹریز) شامل ہوتی ہیں۔'
  },
  {
    stem: 'The integration of high-level word processing capabilities with advanced graphic design, typography, and page layout tools is known as:',
    options: {
      a: 'Corel Draw Vectorization',
      b: 'Desktop Publishing (DTP)',
      c: 'Pixel Painting',
      d: 'Terminal Emulation'
    },
    correct: 'b',
    explanation: '<p><strong>Desktop Publishing (DTP)</strong> combines word processing with sophisticated graphic design and typography layout to produce commercial publications like magazines, newspapers, and books.</p><p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 78 Q2.</p>',
    urdu_answer: 'ورڈ پروسیسنگ اور ایڈوانس گرافک ڈیزائن کے ملاپ سے کتابیں، میگزین اور اشتہارات تیار کرنے کے عمل کو ڈیسک ٹاپ پبلشنگ (Desktop Publishing / DTP) کہا جاتا ہے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is the difference between a WYSIWYG word processor and a Markup-based text editor? Provide examples.',
    correct: `<p>The differences between WYSIWYG and Markup-based document editors are:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Feature</th>
      <th>WYSIWYG Word Processor</th>
      <th>Markup-Based Editor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Visual Display</strong></td>
      <td>Displays formatted text (fonts, bold, margins) on screen exactly as it will appear in print.</td>
      <td>Displays raw plain text interspersed with formatting tags/code; rendering is separate.</td>
    </tr>
    <tr>
      <td><strong>Ease of Use</strong></td>
      <td>Intuitive; formatting applied immediately with buttons or hotkeys.</td>
      <td>Requires learning syntax/tags (e.g., HTML tags or LaTeX markup).</td>
    </tr>
    <tr>
      <td><strong>Examples</strong></td>
      <td>Microsoft Word, LibreOffice Writer, Google Docs.</td>
      <td>HTML, LaTeX, Markdown, vi/vim.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 21, 3 Marks) and <code>CS101Introduction_to_Computing_Mid_term_Solved_2010_All_in_One_File.pdf</code> (Q21).</p>',
    urdu_answer: 'WYSIWYG (جیسے ایم ایس ورڈ) میں اسکرین پر بالکل وہی فارمیٹنگ نظر آتی ہے جو پرنٹ آؤٹ میں نکلے گی، جبکہ مارک اپ ایڈیٹر (جیسے HTML یا LaTeX) میں سادہ ٹیکسٹ کے ساتھ کوڈ یا ٹیگز لکھے جاتے ہیں جنہیں بعد میں پروسیس کر کے رزلٹ دیکھا جاتا ہے۔'
  },
  {
    stem: 'What are the essential core features and capabilities provided by modern word processors?',
    correct: `<p>Modern word processors provide comprehensive document management capabilities, including:</p>
<ul>
  <li><strong>Word Wrap:</strong> Automatically advances text to the next line when reaching the right margin without requiring the user to press Enter.</li>
  <li><strong>Formatting Controls:</strong> Allows full customization of typefaces (fonts), sizes, colors, styles (bold, italic, underline), line spacing, and paragraph margins.</li>
  <li><strong>Editing & Clipboard:</strong> Seamless Cut, Copy, Paste, Drag-and-Drop, and multi-level Undo/Redo.</li>
  <li><strong>Proofing Tools:</strong> Automated spelling verification, grammar checking, and an integrated Thesaurus.</li>
  <li><strong>Search & Replace:</strong> Rapid scanning and systematic substitution of words or phrases across hundreds of pages.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 23) and <code>Cs101-latest midterm paper 10.pdf</code> (Q23).</p>',
    urdu_answer: 'جدید ورڈ پروسیسرز کی اہم خصوصیات میں ورڈ ریپ (خودکار اگلی لائن پر منتقل ہونا)، ٹیکسٹ اور پیراگراف فارمیٹنگ، کلپ بورڈ ٹولز (کٹ، کاپی، پیسٹ)، غلطیوں سے بچاؤ کے لیے ان ڈو، اسپیلنگ و گرامر چیکر، اور فائنڈ اینڈ ریپلیس شامل ہیں۔'
  },
  {
    stem: 'Differentiate between the Cut, Copy, and Paste commands in Microsoft Word, mentioning their respective keyboard shortcuts.',
    correct: `<p>The <strong>Cut</strong>, <strong>Copy</strong>, and <strong>Paste</strong> commands manage the flow of document content via the operating system\'s temporary clipboard memory:</p>
<ul>
  <li><strong>Cut (Ctrl + X):</strong> Deletes/removes the selected text from its current position in the document and places a duplicate in the temporary clipboard.</li>
  <li><strong>Copy (Ctrl + C):</strong> Keeps the original selected text intact in its current location while duplicating an exact copy into the clipboard.</li>
  <li><strong>Paste (Ctrl + V):</strong> Inserts the contents currently held in the clipboard buffer at the current cursor insertion point. It can be repeated multiple times.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> (Q62, Q69) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'کٹ (Ctrl + X) منتخب ٹیکسٹ کو صفحے سے مٹا کر کلپ بورڈ میں رکھ دیتا ہے؛ کاپی (Ctrl + C) اصل ٹیکسٹ کو وہیں برقرار رکھتے ہوئے اس کی ایک کاپی کلپ بورڈ میں محفوظ کرتا ہے؛ اور پیسٹ (Ctrl + V) کلپ بورڈ میں موجود مواد کو کرسر کی جگہ پر لا کر درج کرتا ہے۔'
  },
  {
    stem: 'What is the purpose of the Thesaurus tool in word processing, and how does it assist writers?',
    correct: `<p>A <strong>Thesaurus</strong> in word processing is an electronic reference library that provides lists of synonyms (words with identical or similar meanings) and antonyms (words with opposite meanings) for any highlighted word.</p>
<h4>Benefits to Writers:</h4>
<ol>
  <li><strong>Enhances Vocabulary:</strong> Prevents repetitive word usage throughout a document, resulting in more engaging writing.</li>
  <li><strong>Improves Precision:</strong> Helps authors select the exact shade of meaning or academic tone required for their context.</li>
  <li><strong>Resolves Writer\'s Block:</strong> Offers instant alternative phrasing without needing external reference books.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> (Page 21) and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Page 33).</p>',
    urdu_answer: 'ورڈ پروسیسر میں تھیسارس کا بنیادی مقصد کسی بھی لفظ کے مترادف (Synonyms) اور متضاد (Antonyms) الفاظ فراہم کرنا ہے۔ یہ مصنفین کو ایک ہی لفظ کے بار بار استعمال سے بچاتا ہے اور تحریر کے معیار اور ذخیرہ الفاظ کو بہتر بناتا ہے۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Describe the evolution and core functionality of Word Processing Software. Detail key capabilities including Word Wrap, WYSIWYG display, Paragraph Alignment, Proofing Tools, and Document Layout.',
    correct: `<p><strong>Word Processing Software</strong> revolutionized administrative, academic, and literary publishing by replacing mechanical typewriters with digital, non-destructive document composition.</p>

<h4>1. The Evolution from Typewriters to Word Processors:</h4>
<p>Mechanical typewriters were rigid: typographical errors required physical erasing or retyping entire pages. Early digital word processors (e.g., WordStar, WordPerfect) introduced in-memory editing, allowing endless revision before printing. Modern processors (e.g., MS Word) operate on graphic user interfaces offering instant visual feedback.</p>

<h4>2. Key Architectural Features:</h4>
<ul>
  <li><strong>Word Wrap:</strong> A fundamental automated line-breaking feature. The software automatically moves words that exceed the right margin to the next line without requiring manual carriage returns.</li>
  <li><strong>WYSIWYG Paradigm:</strong> Screen graphics map proportionally to printed dots per inch (DPI), ensuring on-screen margins, fonts, and headers appear identically on paper.</li>
  <li><strong>Paragraph Alignment & Spacing:</strong> Offers Left Align, Right Align, Center, and Justified alignment (straight left and right edges), alongside custom line spacing (Single, 1.5, Double).</li>
  <li><strong>Proofing Engine:</strong> Compares words against an internal dictionary of ~25,000+ entries to highlight spelling errors with red wavy underlines, grammar flaws with blue/green underlines, and provides Thesaurus synonym suggestions.</li>
  <li><strong>Document Layout & Pagination:</strong> Automated header/footer generation, page numbering, footnotes/endnotes, and multi-column formatting.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Q23) and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Page 85/89).</p>',
    urdu_answer: 'ورڈ پروسیسنگ نے ٹائپ رائٹر کی جگہ لے کر دستاویزات کی تیاری کو انتہائی آسان بنا دیا۔ اس کے اہم فیچرز میں ورڈ ریپ (خودکار لائن بریک)، WYSIWYG (اسکرین پر پرنٹ جیسا منظر)، پیراگراف الائنمنٹ (لیفٹ، رائٹ، سینٹر، جسٹیفائیڈ)، پروفنگ ٹولز (اسپیل چیک اور تھیسارس)، اور پیج لے آؤٹ (ہیڈرز، فوٹرز اور کالمز) شامل ہیں جو مل کر ایک معیاری دستاویز تیار کرتے ہیں۔'
  },
  {
    stem: 'Compare Word Processors, Simple Text Editors, and Desktop Publishing (DTP) applications. When should each be used?',
    correct: `<p>Document creation software spans three primary tiers based on complexity and graphic layout capabilities:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Software Tier</th>
      <th>Primary Focus</th>
      <th>Key Characteristics</th>
      <th>Representative Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Simple Text Editor</strong></td>
      <td>Unformatted plain text</td>
      <td>Stores ASCII/Unicode text only with zero embedded font styles, margins, or images. Extremely fast and lightweight. Ideal for source code and config files.</td>
      <td>Notepad, Notepad++, vi/vim, Nano</td>
    </tr>
    <tr>
      <td><strong>Word Processor</strong></td>
      <td>Formatted textual documents</td>
      <td>Focuses on document flow, text formatting, styles, tables, basic embedded graphics, and automated proofing. Ideal for letters, essays, reports, and books.</td>
      <td>Microsoft Word, Google Docs, LibreOffice Writer</td>
    </tr>
    <tr>
      <td><strong>Desktop Publishing (DTP)</strong></td>
      <td>Complex visual page layout</td>
      <td>Combines word processing with frame-based precision layout, color separations, CMYK printing, and typography control. Ideal for magazines, newspapers, and flyers.</td>
      <td>Adobe InDesign, QuarkXPress, MS Publisher</td>
    </tr>
  </tbody>
</table>

<h4>Selection Criteria:</h4>
<ul>
  <li>Use a <strong>Text Editor</strong> when writing programming scripts or configuration files where formatting codes would cause syntax errors.</li>
  <li>Use a <strong>Word Processor</strong> for everyday multi-page written documents where text flow and proofing are paramount.</li>
  <li>Use <strong>Desktop Publishing</strong> when exact millimeter-level placement of text frames, photos, and commercial print margins is required.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Page 78 Q2) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'ٹیکسٹ ایڈیٹر (جیسے نوٹ پیڈ) بغیر کسی فارمیٹنگ کے صرف سادہ ٹیکسٹ اور پروگرامنگ کوڈ کے لیے ہوتا ہے۔ ورڈ پروسیسر (جیسے ایم ایس ورڈ) خطوط اور رپورٹس میں فونٹ، اسٹائلز اور پیراگراف بنانے کے لیے ہوتا ہے۔ جبکہ ڈیسک ٹاپ پبلشنگ (جیسے ان ڈیزائن) اعلیٰ درجے کے میگزین، اخبارات اور اشتہارات میں تصاویر اور ٹیکسٹ کو ملی میٹر کے حساب سے سیٹ کرنے کے لیے استعمال کیا جاتا ہے۔'
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
console.log(`CS101 Lecture 14 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

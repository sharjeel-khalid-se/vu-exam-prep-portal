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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(cs101.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Spreadsheet Applications, Grid Structure, Formulas, and Financial Modeling')
  `).run(cs101.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`CS101 Lecture 13 found with ID: ${lec13.id}`);
}

const lId = lec13.id;

// 3. Clear existing questions for Lecture 13 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 13.`);

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

// 15 MCQs
const mcqs = [
  {
    stem: 'Which application software consists of a grid of cells organized in horizontal rows and vertical columns?',
    options: {
      a: 'Spreadsheet Software',
      b: 'Word Processor',
      c: 'Presentation Software',
      d: 'Image Editing Software'
    },
    correct: 'a',
    explanation: '<p>A <strong>Spreadsheet</strong> application organizes numerical data and text into a two-dimensional grid of cells formed by the intersection of rows and columns.</p><p><strong>Reference:</strong> Appeared 18+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 15 and <code>CS101 MID by Attiq Kundi.pdf</code> Page 83.</p>',
    urdu_answer: 'اسپریڈشیٹ سافٹ ویئر (جیسے ایم ایس ایکسل) ہوریزونٹل قطاروں (Rows) اور ورٹیکل کالموں (Columns) کے انٹرسیکشن سے بننے والے سیلز (Cells) کے گرڈ پر مشتمل ہوتا ہے۔'
  },
  {
    stem: 'Which of the following was the world\'s first widely popular spreadsheet application for personal computers (PCs)?',
    options: {
      a: 'WordStar',
      b: 'VisiCalc',
      c: 'dBase II',
      d: 'Lotus Notes'
    },
    correct: 'b',
    explanation: '<p><strong>VisiCalc</strong> (Visible Calculator), released in 1979 for the Apple II, was the first computer spreadsheet program that transformed personal computers from hobbyist gadgets into essential business tools.</p><p><strong>Reference:</strong> Appeared 16+ times across past papers including <code>Cs101-latest -solved-midterm paper 12.pdf</code> Q6 and <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q16.</p>',
    urdu_answer: 'ویزی کیلک (VisiCalc) پرسنل کمپیوٹرز کے لیے دنیا کا پہلا اور سب سے زیادہ مقبول ہونے والا اسپریڈشیٹ سافٹ ویئر تھا جس نے پی سی کو کاروباری دنیا میں ناگزیر بنا دیا۔'
  },
  {
    stem: 'The first computer spreadsheet program, VisiCalc, was originally conceived and invented by:',
    options: {
      a: 'Charles Babbage',
      b: 'Dan Bricklin',
      c: 'Paul Graham',
      d: 'John von Neumann'
    },
    correct: 'b',
    explanation: '<p><strong>Dan Bricklin</strong> (along with Bob Frankston) invented VisiCalc while studying at Harvard Business School in 1979.</p><p><strong>Reference:</strong> Appeared 6+ times in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q10 and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 94.</p>',
    urdu_answer: 'پہلا کمپیوٹرائزڈ اسپریڈشیٹ پروگرام ویزی کیلک (VisiCalc) 1979 میں ڈین برکلن (Dan Bricklin) نے تیار کیا تھا۔'
  },
  {
    stem: 'In a spreadsheet grid, the cell address "A12" specifically denotes the cell located at:',
    options: {
      a: 'Row A, Column 12',
      b: 'Row 12, Column A',
      c: 'Row 2, Column A1',
      d: 'Row A1, Column 2'
    },
    correct: 'b',
    explanation: '<p>In spreadsheet coordinate notation, letters represent columns and numbers represent rows. Thus, <strong>A12</strong> represents the intersection of <strong>Column A</strong> and <strong>Row 12</strong>.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers including <code>CS101 Mid Term Past Paper 1.pdf</code> Page 2 and <code>CS101 MID by Attiq Kundi.pdf</code> Page 77.</p>',
    urdu_answer: 'اسپریڈشیٹ میں سیل ایڈریس A12 کا مطلب کالم A اور قطار (Row) نمبر 12 ہے۔ کالم کا نام ہمیشہ پہلے حرف اور قطار کا نمبر بعد میں آتا ہے۔'
  },
  {
    stem: 'In a spreadsheet application, a dynamic mathematical or logical relationship between two or more cells is established using:',
    options: {
      a: 'Numbers',
      b: 'Text Labels',
      c: 'Formulas',
      d: 'Watermarks'
    },
    correct: 'c',
    explanation: '<p><strong>Formulas</strong> (beginning with an equals sign <code>=</code>) define mathematical and logical relationships between cells, enabling automated calculation and dynamic updates when values change.</p><p><strong>Reference:</strong> Appeared 25+ times in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 90 and <code>cs101-lecturewise-midterm.pdf</code> Q108.</p>',
    urdu_answer: 'اسپریڈشیٹ میں دو یا دو سے زیادہ سیلز کے درمیان ریاضیاتی یا منطقی تعلق قائم کرنے کے لیے فارمولاز (Formulas) استعمال کیے جاتے ہیں۔'
  },
  {
    stem: 'Which of the following data types can fundamentally NOT be stored as the direct intrinsic value of an individual spreadsheet cell?',
    options: {
      a: 'Numbers',
      b: 'Text strings',
      c: 'Formulas',
      d: 'Embedded Images'
    },
    correct: 'd',
    explanation: '<p>A spreadsheet cell intrinsically stores <strong>Numbers, Text (labels), or Formulas/Functions</strong>. Images are floating graphical objects drawn on an overlay layer above the worksheet grid, not native cell data values.</p><p><strong>Reference:</strong> Appeared 5+ times in <code>cs101-lecturewise-midterm.pdf</code> Q109 and <code>cs101-lecturewise-midterm-solved-mcqs.pdf</code> Q109.</p>',
    urdu_answer: 'اسپریڈشیٹ کا کوئی بھی سیل بنیادی طور پر نمبرز، ٹیکسٹ، یا فارمولے پر مشتمل ہو سکتا ہے، لیکن تصاویر سیل کے اندرونی ڈیٹا ویلیو کے طور پر محفوظ نہیں ہو سکتیں بلکہ وہ ایک اوورلے گرافک کے طور پر تیرتی ہیں۔'
  },
  {
    stem: 'In a modern spreadsheet program such as MS Excel, a worksheet cell may contain:',
    options: {
      a: 'Numbers',
      b: 'Text',
      c: 'Formulas',
      d: 'All of the given options'
    },
    correct: 'd',
    explanation: '<p>A spreadsheet cell is capable of holding numeric values, textual alphanumeric labels, or formulas that compute dynamic output based on other cells.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> Q24.</p>',
    urdu_answer: 'ایم ایس ایکسل کے کسی بھی سیل میں نمبرز، ٹیکسٹ (لیبلز) اور فارمولے سب رکھے جا سکتے ہیں۔ اس لیے درست جواب All of the given options ہے۔'
  },
  {
    stem: 'Which of the following is the most prominent commercial example of spreadsheet application software?',
    options: {
      a: 'Microsoft Word',
      b: 'Microsoft PowerPoint',
      c: 'Microsoft Excel',
      d: 'Microsoft Access'
    },
    correct: 'c',
    explanation: '<p><strong>Microsoft Excel</strong> is a worldwide industry-standard spreadsheet application. MS Word is a word processor, PowerPoint is presentation software, and Access is an RDBMS.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers including <code>Cs101-latest -solved-midterm paper 2.pdf</code> Q24 and <code>CS101 Mid Term By JUANID.pdf</code> Q24.</p>',
    urdu_answer: 'مائیکروسافٹ ایکسل (MS Excel) اسپریڈشیٹ سافٹ ویئر کی سب سے بڑی اور معروف مثال ہے۔'
  },
  {
    stem: 'If you need to analyze financial trends and generate graphical charts based on dynamic mathematical calculations, your preferred software should be a:',
    options: {
      a: 'Spreadsheet program',
      b: 'Word Processor',
      c: 'Database Engine',
      d: 'Web Authoring Tool'
    },
    correct: 'a',
    explanation: '<p>A <strong>Spreadsheet program</strong> is specifically tailored for numerical calculation, mathematical modeling, statistical analysis, and automatic chart generation.</p><p><strong>Reference:</strong> Appeared 6+ times in <code>CS101 MIDTERM FILE 6 SOLVED BY TEAM HADI.pdf</code> Q17 and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'حسابی ڈیٹا اور ریاضیاتی کیلکولیشنز کی بنیاد پر خودکار چارٹس اور گراف بنانے کے لیے اسپریڈشیٹ سافٹ ویئر (جیسے ایکسل) بہترین انتخاب ہے۔'
  },
  {
    stem: 'Which type of chart is ideal for displaying categorical portions of a whole that are typically expressed in percentages?',
    options: {
      a: 'Line Chart',
      b: 'Pie Chart',
      c: 'Bar Chart',
      d: 'Scatter Plot'
    },
    correct: 'b',
    explanation: '<p>A <strong>Pie Chart</strong> displays data as circular slices where each slice represents a proportional share or percentage of the 100% whole.</p><p><strong>Reference:</strong> Appeared 4+ times in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 111 Q15.</p>',
    urdu_answer: 'پائی چارٹ (Pie Chart) کسی بھی کل کے مختلف حصوں کو فیصد (Percentages) کی صورت میں ظاہر کرنے کے لیے سب سے بہترین اور موزوں چارٹ ہے۔'
  },
  {
    stem: 'In a spreadsheet application, which tool/feature is used to solve implicit equations such as 3x^3 - 2x + 5 = 0 by iterating toward a target output?',
    options: {
      a: '=COUNTIF',
      b: '=GoalSeek',
      c: '=AutoFilter',
      d: '=Sum'
    },
    correct: 'b',
    explanation: '<p><strong>Goal Seek</strong> is an iterative what-if analysis tool that back-solves for an unknown input variable required to produce a desired specific formula outcome or solve non-linear equations.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 Mid_term_Solved.pdf</code> Q12 and <code>Cs101-latest midterm paper 10.pdf</code> Q12.</p>',
    urdu_answer: 'گول سیک (Goal Seek) ایکسل کا ایک ایسا تجزیاتی ٹول ہے جو کسی مطلوبہ نتائج (Target) کو حاصل کرنے کے لیے ان پٹ متغیر کی قیمت کو بار بار تبدیل کر کے ریاضیاتی مساوات کو حل کرتا ہے۔'
  },
  {
    stem: 'What is the standard keyboard shortcut to open the "Format Cells" dialog box in Microsoft Excel?',
    options: {
      a: 'Ctrl + 1',
      b: 'Ctrl + F',
      c: 'Ctrl + Shift + F',
      d: 'Ctrl + Alt + C'
    },
    correct: 'a',
    explanation: '<p>Pressing <strong>Ctrl + 1</strong> in MS Excel instantly opens the <em>Format Cells</em> dialog box to customize numbers, alignment, fonts, borders, patterns, and protection.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'ایم ایس ایکسل میں سیل فارمیٹنگ ونڈو (Format Cells) کھولنے کی شارٹ کٹ کی Ctrl + 1 ہے۔'
  },
  {
    stem: 'In Microsoft Excel, what is the output of evaluating the expression entered into cell D4 as: =C4=C4 ?',
    options: {
      a: 'TRUE (Valid Boolean comparison)',
      b: 'FALSE',
      c: '#VALUE! Error',
      d: '#REF! Error'
    },
    correct: 'a',
    explanation: '<p>In MS Excel, the formula <code>=C4=C4</code> tests whether the contents of cell C4 equal themselves. Since any valid cell content equals itself, Excel evaluates this boolean comparison as <strong>TRUE</strong>.</p><p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 52 Q15.</p>',
    urdu_answer: 'ایم ایس ایکسل میں =C4=C4 ایک درست منطقی موازنہ (Logical Comparison) ہے جو جانچتا ہے کہ آیا C4 کی قیمت اپنے برابر ہے یا نہیں۔ چونکہ ہر سیل اپنے برابر ہوتا ہے، اس لیے اس کا نتیجہ TRUE نکلتا ہے۔'
  },
  {
    stem: 'What will be the calculated result of the spreadsheet formula =SUM(A2:A3) if cell A2 contains 25 and cell A3 contains 75?',
    options: {
      a: '50',
      b: '100',
      c: '125',
      d: '2575'
    },
    correct: 'b',
    explanation: '<p>The formula <code>=SUM(A2:A3)</code> adds all values in the range from A2 to A3: <code>25 + 75 = 100</code>.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> Q11 and <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q15.</p>',
    urdu_answer: 'فارمولا =SUM(A2:A3) سیل A2 اور A3 کی ویلیوز کو جمع کرتا ہے: 25 + 75 = 100۔'
  },
  {
    stem: 'What will be the result of the spreadsheet formula =SUM(A2:A3) if cell A2 contains 25 and cell A3 contains -75?',
    options: {
      a: '100',
      b: '50',
      c: '-50',
      d: '#NUM!'
    },
    correct: 'c',
    explanation: '<p>The formula <code>=SUM(A2:A3)</code> computes algebraic addition: <code>25 + (-75) = 25 - 75 = -50</code>.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID by Attiq Kundi.pdf</code> and <code>CS101 solveds mcqs mega files for papers with 115 papes.pdf</code>.</p>',
    urdu_answer: 'جب مثبت اور منفی اعداد کو جمع کیا جائے تو الجبرک جمع ہوتی ہے: 25 + (-75) = -50۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is a Spreadsheet? List any two practical jobs or tasks that it can perform.',
    correct: `<p>A <strong>Spreadsheet</strong> is an interactive application software program that organizes data into a two-dimensional grid of rows and columns (cells). It allows users to store, calculate, manipulate, and analyze numeric and textual information.</p>
<h4>Two Common Practical Tasks:</h4>
<ol>
  <li><strong>Budgeting and Financial Forecasting:</strong> Creating personal, family, or corporate financial balance sheets, tracking expenditures, and projecting future revenues.</li>
  <li><strong>Mathematical & Statistical Modeling:</strong> Automatically computing sums, averages, grade point averages (GPA), profit margins, and generating comparative graphical charts.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz.pdf</code> (Page 1, Q33) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 124, Q33).</p>',
    urdu_answer: 'اسپریڈشیٹ ایک ایسی ایپلیکیشن ہے جو ڈیٹا کو قطاروں اور کالموں میں ترتیب دے کر اس پر ریاضیاتی و مالیاتی حساب کتاب کرتی ہے۔ اس کے دو اہم کام یہ ہیں: (1) بجٹ بنانا اور اخراجات کا حساب رکھنا، (2) ریاضیاتی و شماریاتی فارمولوں اور چارٹس کی مدد سے ڈیٹا کا تفصیلی تجزیہ کرنا۔'
  },
  {
    stem: 'What is the primary purpose and major advantage of using Spreadsheet software in business and data analysis?',
    correct: `<p>The primary purpose of spreadsheet software is to automate numerical calculations, facilitate decision-making, and model financial scenarios.</p>
<h4>Major Advantages:</h4>
<ul>
  <li><strong>Automatic Recalculation:</strong> When an input value in any cell is modified, all dependent formulas throughout the entire worksheet update instantly without manual intervention.</li>
  <li><strong>What-If Analysis:</strong> Enables analysts to experiment with different parameters (e.g., varying interest rates, price changes) to see immediate impacts on bottom-line outcomes.</li>
  <li><strong>Visual Communication:</strong> Converts raw numbers into clear, presentation-ready graphical charts (pie, bar, line charts).</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>Cs101-latest -solved-midterm paper 7.pdf</code> (Page 3, Q28).</p>',
    urdu_answer: 'اسپریڈشیٹ کا بنیادی مقصد کاروباری حساب کتاب کو خودکار بنانا ہے۔ اس کا سب سے بڑا فائدہ آٹومیٹک ری کیلکولیشن (Automatic Recalculation) ہے، یعنی جب کسی بھی سیل کی قیمت بدلی جاتی ہے تو تمام متعلقہ فارمولے خود بخود فوراً اپ ڈیٹ ہو جاتے ہیں۔'
  },
  {
    stem: 'What is meant by a Cell Address and a Cell Range in a Spreadsheet? Give clear examples of each.',
    correct: `<p>In spreadsheet software:</p>
<ul>
  <li><strong>Cell Address:</strong> The unique alphanumeric coordinate that identifies a specific cell at the intersection of a column and a row. The column letter precedes the row number.<br />
  <em>Example:</em> <code>B5</code> refers to the cell situated in Column B at Row 5.</li>
  <li><strong>Cell Range:</strong> A contiguous block or collection of two or more selected cells treated as a unified group, denoted by separating the starting cell and ending cell with a colon (<code>:</code>).<br />
  <em>Example:</em> <code>A1:A10</code> refers to all cells from A1 down through A10 in column A.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid Term Past Paper 1.pdf</code> (Page 2) and <code>CS101 MID by Attiq Kundi.pdf</code> (Page 77).</p>',
    urdu_answer: 'سیل ایڈریس (Cell Address) کسی بھی سیل کا مخصوص پتہ ہوتا ہے جو کالم کے حرف اور قطار کے نمبر سے بنتا ہے، جیسے B5۔ جبکہ سیل رینج (Cell Range) ملحقہ سیلز کے بلاک کو کہتے ہیں جس کے درمیان کالن (:) لگایا جاتا ہے، جیسے A1:A10 (A1 سے A10 تک تمام سیلز)۔'
  },
  {
    stem: 'Write Microsoft Excel formulas for each of the following operational scenarios:\n(a) To add the numeric values from cell C3 to cell C10.\n(b) To add the value of cell C2 to cell C4, and then multiply that sum by the value in cell C6.',
    correct: `<p>The correct Microsoft Excel formulas are:</p>
<ol>
  <li><strong>Part (a) - Sum from C3 to C10:</strong><br />
  <code>=SUM(C3:C10)</code><br />
  <em>(Alternative manual addition: <code>=C3+C4+C5+C6+C7+C8+C9+C10</code>)</em></li>
  <li><strong>Part (b) - Add C2 to C4, then multiply by C6:</strong><br />
  <code>=(C2+C4)*C6</code><br />
  <em>(Parentheses are strictly required to enforce operator precedence so addition occurs before multiplication.)</em></li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 Mid_term_Solved.pdf</code> (Question No. 20, 3 Marks) and <code>CS101 solved.pdf</code> (Page 23, Q20).</p>',
    urdu_answer: '(a) سیل C3 سے C10 تک کی ویلیوز جمع کرنے کا فارمولا: =SUM(C3:C10)\n(b) سیل C2 اور C4 کو جمع کر کے C6 سے ضرب دینے کا فارمولا: =(C2+C4)*C6 (قوسین کا استعمال لازمی ہے تاکہ جمع پہلے ہو)۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Explain the grid structure and core capabilities of Spreadsheet software (such as MS Excel). Discuss how cells, labels, values, formulas, and automatic recalculation distinguish spreadsheets from static tables.',
    correct: `<p>A <strong>Spreadsheet</strong> is a sophisticated numerical modeling environment built upon a two-dimensional matrix of columns and rows.</p>

<h4>1. The Grid Structure:</h4>
<ul>
  <li><strong>Rows:</strong> Horizontal arrangements labeled sequentially with numbers (1, 2, 3, ... up to 1,048,576 in modern Excel).</li>
  <li><strong>Columns:</strong> Vertical arrangements labeled alphabetically with letters (A, B, C, ... Z, AA, AB, ... XFD).</li>
  <li><strong>Cells:</strong> The foundational atomic units created by the intersection of rows and columns, each uniquely addressed (e.g., <code>E15</code>).</li>
</ul>

<h4>2. Types of Cell Content:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Content Type</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Labels (Text)</strong></td>
      <td>Alphanumeric text providing descriptive headings or identifying records; left-aligned by default.</td>
      <td><code>"Student Name"</code>, <code>"Total Marks"</code></td>
    </tr>
    <tr>
      <td><strong>Values (Numbers)</strong></td>
      <td>Raw numeric constants used in calculations; right-aligned by default.</td>
      <td><code>4500</code>, <code>98.6</code>, <code>-15</code></td>
    </tr>
    <tr>
      <td><strong>Formulas & Functions</strong></td>
      <td>Mathematical expressions starting with <code>=</code> that compute dynamic output from other cells.</td>
      <td><code>=B2*0.15</code>, <code>=AVERAGE(C2:C20)</code></td>
    </tr>
  </tbody>
</table>

<h4>3. The Power of Dynamic Recalculation:</h4>
<p>Unlike a static table in a word processor, a spreadsheet maintains an active dependency graph. Whenever a base input cell is edited, the spreadsheet recalculates all dependent formulas across the entire worksheet instantly. This automated recalculation makes complex financial forecasting, budgeting, and sensitivity testing frictionless.</p>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 midterm subjective by moaaz.pdf</code> (Q33) and <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 124, Q33).</p>',
    urdu_answer: 'اسپریڈشیٹ قطاروں (1، 2، 3) اور کالموں (A، B، C) کے ملاپ سے بننے والے سیلز کے گرڈ پر مشتمل ہوتی ہے۔ اس میں تین قسم کا ڈیٹا رکھا جاتا ہے: ٹیکسٹ (لیبلز)، ہندسے (ویلیوز)، اور فارمولے۔ عام ٹیبل کے برعکس اسپریڈشیٹ کی خاصیت آٹومیٹک ری کیلکولیشن ہے، یعنی جیسے ہی ان پٹ بدلے گا، تمام متعلقہ فارمولے فوراً نئی قیمت کا حساب لگا کر رزلٹ اپ ڈیٹ کر دیں گے۔'
  },
  {
    stem: 'Discuss how built-in Functions (e.g., SUM), iterative decision-support tools (Goal Seek), and graphical Charts (e.g., Pie Charts) enable financial forecasting, budgeting, and data analysis in spreadsheets.',
    correct: `<p>Modern spreadsheet applications provide powerful computational and visualization facilities that turn raw data into strategic intelligence:</p>

<h4>1. Built-in Mathematical and Statistical Functions:</h4>
<ul>
  <li>Pre-programmed formulas simplify complex mathematical logic.</li>
  <li><strong><code>SUM(range)</code>:</strong> Quickly aggregates numeric values across hundreds or thousands of cells without lengthy addition syntax.</li>
  <li><strong>Statistical Functions:</strong> <code>AVERAGE</code>, <code>MAX</code>, <code>MIN</code>, <code>COUNT</code>, and <code>COUNTIF</code> provide instant statistical summaries for grading, inventory, or expense audits.</li>
</ul>

<h4>2. Goal Seek and What-If Analysis:</h4>
<ul>
  <li><strong>Reverse Calculation:</strong> In conventional formulas, inputs produce an output. <em>Goal Seek</em> works in reverse: the user specifies the desired output (e.g., achieve a net profit of $100,000), and Goal Seek iteratively adjusts an input variable (e.g., units sold or sales price) until that target is met.</li>
  <li><strong>Solving Equations:</strong> Used by engineers and economists to solve complex non-linear polynomials (e.g., \\(3x^3 - 2x + 5 = 0\\)) through rapid automated approximation.</li>
</ul>

<h4>3. Visual Data Representation (Charts):</h4>
<ul>
  <li><strong>Pie Charts:</strong> Visually segment a single data series into proportionate slices of 100%, ideal for showing departmental expenditure splits or market share percentages.</li>
  <li><strong>Bar and Column Charts:</strong> Compare categorical discrete values across time periods.</li>
  <li><strong>Line Charts:</strong> Illustrate continuous continuous trends, stock prices, and revenue growth trajectories over time.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Page 111) and <code>CS101 Mid_term_Solved.pdf</code> (Q12).</p>',
    urdu_answer: 'ایم ایس ایکسل میں بلٹ ان فنکشنز (جیسے SUM اور AVERAGE) ہزاروں سیلز پر فوری حساب کتاب کرتے ہیں۔ گول سیک (Goal Seek) ایک ایسا زبردست تجزیاتی فیچر ہے جو مطلوبہ ہدف یا منافع حاصل کرنے کے لیے ان پٹ قیمت خودکار طریقے سے معلوم کرتا ہے اور مساوات حل کرتا ہے۔ گرافیکل چارٹس (جیسے پائی چارٹ) ڈیٹا کو بصری اور فیصد کی صورت میں پیش کرتے ہیں تاکہ بجٹ سازی اور کاروباری فیصلے آسانی سے کیے جا سکیں۔'
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
console.log(`CS101 Lecture 13 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

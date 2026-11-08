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

// 2. Create or fetch Lecture 7
let lec7 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 7").get(cs101.id);
if (!lec7) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 7, 'Microprocessor Architecture, Logic Gates, and Boolean Operations')
  `).run(cs101.id);
  lec7 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 7 with ID: ${lec7.id}`);
} else {
  console.log(`CS101 Lecture 7 found with ID: ${lec7.id}`);
}

const lId = lec7.id;

// 3. Clear existing questions for Lecture 7 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 7.`);

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

// 11 MCQs
const mcqs = [
  {
    stem: 'Extremely fast, high-speed static semiconductor memory integrated directly inside a modern microprocessor chip is called:',
    options: {
      a: 'Dynamic RAM',
      b: 'Firmware ROM',
      c: 'Cache Memory (L1 / L2 / L3 Cache)',
      d: 'Pre-fetch buffer only'
    },
    correct: 'c',
    explanation: 'Cache memory consists of ultra-fast static RAM (SRAM) integrated directly on the processor die to bridge the speed disparity between the CPU core and slower main system RAM (CS101 Handouts Lecture 7). Appeared in multiple past papers.',
    urdu_answer: 'مائیکرو پروسیسر کے اندر موجود تیز رفتار ترین میموری کو کیش میموری (Cache Memory) کہا جاتا ہے۔'
  },
  {
    stem: 'Modern microprocessors and integrated circuit chips are predominantly fabricated using which semiconductor material?',
    options: {
      a: 'Aluminum',
      b: 'Ferrous oxide',
      c: 'Silicon',
      d: 'Silicon dioxide'
    },
    correct: 'c',
    explanation: 'Silicon (derived from quartz sand) is the primary semiconductor element utilized to manufacture microprocessors due to its abundant availability and optimal electrical semiconducting properties (CS101 Handouts Lecture 7). Appeared in multiple past papers.',
    urdu_answer: 'مائیکرو پروسیسرز اور کمپیوٹر چپس سلیکون (Silicon) نامی سیمی کنڈکٹر مٹیریل سے بنائی جاتی ہیں۔'
  },
  {
    stem: 'A master electronic hardware device that executes program instructions, controls data movement, and performs arithmetic and logic operations is known as the:',
    options: {
      a: 'Central Processing Unit (CPU)',
      b: 'Integrated Circuit board',
      c: 'Main Storage subsystem',
      d: 'Virtual Memory swap'
    },
    correct: 'a',
    explanation: 'The Central Processing Unit (CPU) is the primary operational core that executes instructions and manipulates data within computer systems (CS101 Handouts Lecture 7). Appeared in multiple past papers.',
    urdu_answer: 'سی پی یو (CPU) وہ مرکزی ہارڈ ویئر یونٹ ہے جو پروگرام کی ہدایات پر عمل درآمد اور حسابی و منطقی آپریشنز انجام دیتا ہے۔'
  },
  {
    stem: 'The specific internal subsystem of the CPU that actively performs numerical mathematical calculations and logical comparisons during program processing is called the:',
    options: {
      a: 'Arithmetic and Logic Unit (ALU)',
      b: 'Control Unit (CU)',
      c: 'Main System Memory (RAM)',
      d: 'Bus Interface Unit'
    },
    correct: 'a',
    explanation: 'The ALU (Arithmetic Logic Unit) executes fundamental arithmetic (addition, subtraction, multiplication) and Boolean logic operations (AND, OR, NOT, comparisons) (CS101 Handouts Lecture 7). Appeared in multiple past papers.',
    urdu_answer: 'سی پی یو کا وہ اندرونی حصہ جو حسابی حساب کتاب اور منطقی موازنے کرتا ہے، ارتھمیٹک لاجک یونٹ (ALU) کہلاتا ہے۔'
  },
  {
    stem: 'Which central module of the microprocessor is electrically connected to all other internal modules to supervise and direct their execution cycles?',
    options: {
      a: 'Control Unit (CU)',
      b: 'Memory Management Unit',
      c: 'Floating Point Unit (FPU)',
      d: 'Arithmetic Logic Unit (ALU)'
    },
    correct: 'a',
    explanation: 'The Control Unit (CU) serves as the brain within the processor, fetching instructions from memory, decoding them, and issuing timing/control signals to all other CPU components (CS101 Handouts Lecture 7). Appeared in 15+ past papers.',
    urdu_answer: 'کنٹرول یونٹ (Control Unit) پروسیسر کے تمام دیگر حصوں سے منسلک ہوتا ہے اور ان کی سرگرمیوں کو کنٹرول کرتا ہے۔'
  },
  {
    stem: 'A Truth Table is a tabular mathematical representation that defines the ________ of a digital logic function for all possible ________.',
    options: {
      a: 'Outputs for all possible combinations of Inputs',
      b: 'Inputs for all possible Outputs',
      c: 'Process for all possible Inputs',
      d: 'Inputs for all possible Processes'
    },
    correct: 'a',
    explanation: 'A truth table systematically enumerates all possible combinations of binary inputs alongside their resulting functional outputs for a given Boolean operation or gate (CS101 Handouts Lecture 7). Appeared in 12+ midterm papers.',
    urdu_answer: 'ٹروتھ ٹیبل (Truth Table) تمام ممکنہ ان پٹس کے مجموعے کے لیے لاجک فنکشن کا حاصل شدہ نتیجہ یعنی آؤٹ پٹ (Output) ظاہر کرتا ہے۔'
  },
  {
    stem: 'In digital bit manipulation, a major application of the ________ Boolean operation is to place zeros in one designated part of a bit pattern while leaving the remaining bits undisturbed.',
    options: {
      a: 'XOR operation',
      b: 'NOR operation',
      c: 'AND operation (Bit Masking)',
      d: 'OR operation'
    },
    correct: 'c',
    explanation: 'In bit manipulation, the AND operator with a 0 mask bit forces the target bit to 0 ($X \\cdot 0 = 0$), while an AND with a 1 bit preserves the original value ($X \\cdot 1 = X$), known as masking out bits (CS101 Handouts Lecture 7). Appeared in 10+ past papers.',
    urdu_answer: 'بٹ ماسکنگ میں AND آپریشن کا استعمال مخصوص بٹس کو صفر کرنے اور باقی بٹس کو تبدیل کیے بغیر محفوظ رکھنے کے لیے کیا جاتا ہے۔'
  },
  {
    stem: 'Which basic Boolean logic operator is used to complement, invert, or flip the value of an input bit (turning 1 into 0, and 0 into 1)?',
    options: {
      a: 'OR operator',
      b: 'NOR operator',
      c: 'AND operator',
      d: 'NOT operator (Inverter)'
    },
    correct: 'd',
    explanation: 'The NOT gate (inverter) performs logical negation, reversing a TRUE/1 to FALSE/0, and vice versa (CS101 Handouts Lecture 7). Appeared in 8+ midterm papers.',
    urdu_answer: 'کسی بھی ان پٹ کو الٹ (Invert/Complement) کرنے کے لیے NOT آپریٹر استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Which Boolean logic operation produces an output of 1 (TRUE) if and only if BOTH of its input operands are simultaneously equal to 1?',
    options: {
      a: 'AND operation',
      b: 'XOR operation',
      c: 'OR operation',
      d: 'NOT operation'
    },
    correct: 'a',
    explanation: 'The AND operation outputs 1 strictly when all inputs are 1; if any single input is 0, the output is 0 (CS101 Handouts Lecture 7). Appeared in 6+ papers.',
    urdu_answer: 'AND آپریشن کا نتیجہ صرف اسی صورت میں 1 آتا ہے جب دونوں کے دونوں ان پٹس 1 ہوں۔'
  },
  {
    stem: 'In digital computing and Boolean logic, the binary bit 0 represents FALSE, while the binary bit 1 represents:',
    options: {
      a: 'Wrong / Error',
      b: 'True / False hybrid',
      c: 'TRUE',
      d: 'Empty / Null'
    },
    correct: 'c',
    explanation: 'In Boolean algebra and digital electronics, 1 corresponds to TRUE (or high voltage), and 0 corresponds to FALSE (or low voltage) (CS101 Handouts Lecture 7). Appeared in 8+ past papers.',
    urdu_answer: 'ڈیجیٹل لاجک میں بائنری 0 کا مطلب False اور بائنری 1 کا مطلب True ہوتا ہے۔'
  },
  {
    stem: 'The programmatic technique of isolating or clearing specific bits in a register using the AND operation is formally known as:',
    options: {
      a: 'Masking',
      b: 'Inverting',
      c: 'Rotating',
      d: 'Multiplexing'
    },
    correct: 'a',
    explanation: 'Masking refers to applying a bit pattern (a mask) using logical AND/OR operations to inspect, isolate, or clear specific bits within a byte or register (CS101 Handouts Lecture 7). Appeared in 5+ past papers.',
    urdu_answer: 'رجسٹر کے اندر مخصوص بٹس کو الگ کرنے یا کلیئر کرنے کے اس عمل کو ماسکنگ (Masking) کہا جاتا ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'How can we mathematically calculate the total number of rows required in a complete truth table for a Boolean logic function with $n$ input variables? Explain with an example.',
    correct: `<p><strong>Calculation of Rows in a Truth Table:</strong></p>
<p>The total number of rows (combinations of binary inputs) in a truth table is calculated using the exponential formula:</p>
<p>$$\\text{Total Rows} = 2^n$$</p>
<p>where \\(n\\) represents the number of distinct binary input variables.</p>

<p><strong>Examples:</strong></p>
<ul>
  <li>For a single variable (\\(n = 1\\)): \\(2^1 = 2\\) rows (inputs: 0, 1).</li>
  <li>For two input variables \\(A\\) and \\(B\\) (\\(n = 2\\)): \\(2^2 = 4\\) rows (inputs: 00, 01, 10, 11).</li>
  <li>For three input variables \\(A, B, C\\) (\\(n = 3\\)): \\(2^3 = 8\\) rows.</li>
  <li>For four input variables (\\(n = 4\\)): \\(2^4 = 16\\) rows.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 7; Cs101 latest solved midterm paper 10 Q30; paper 5 Q30.',
    urdu_answer: 'ٹروتھ ٹیبل کی کل قطاروں کی تعداد معلوم کرنے کا فارمولا $2^n$ ہے، جہاں n ان پٹ متغیرات کی تعداد ہے۔ مثلاً اگر 2 ان پٹس ہوں تو $2^2 = 4$ قطاریں بنیں گی، اور اگر 3 ان پٹس ہوں تو $2^3 = 8$ قطاریں ہوں گی۔'
  },
  {
    stem: 'What are the main functions of the Control Unit (CU) and the Arithmetic Logic Unit (ALU) inside a computer microprocessor?',
    correct: `<p><strong>Core Functions of CU and ALU:</strong></p>

<ol>
  <li><strong>Control Unit (CU):</strong>
    <ul>
      <li>Serves as the supervisor / director of the CPU.</li>
      <li>Fetches instructions sequentially from main memory (RAM) or cache into the Instruction Register.</li>
      <li>Decodes instructions into micro-commands and issues timing signals to orchestrate the movement of data between registers, ALU, and system memory.</li>
    </ul>
  </li>
  <li><strong>Arithmetic Logic Unit (ALU):</strong>
    <ul>
      <li>Executes all fundamental arithmetic operations (addition, subtraction, multiplication, division).</li>
      <li>Executes logical decision operations (AND, OR, NOT, XOR) and relational comparisons (e.g., testing if \\(A = B\\) or \\(A > B\\)).</li>
      <li>Stores intermediate operational flags (zero flag, carry flag, sign flag).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 7; Team Hadi Midterm File 1 Q30.',
    urdu_answer: 'کنٹرول یونٹ (CU) میموری سے ہدایات لے کر انہیں ڈی کوڈ کرتا ہے اور پورے کمپیوٹر کو کنٹرول کرتا ہے۔ جبکہ ارتھمیٹک لاجک یونٹ (ALU) تمام حسابی عمل (جمع، تفریق، ضرب) اور منطقی موازنے (AND, OR, NOT) انجام دیتا ہے۔'
  },
  {
    stem: 'Define Masking in computer bit manipulation. Explain which Boolean logic operator is used to implement it and provide a practical example.',
    correct: `<p><strong>Definition of Bit Masking:</strong></p>
<p><strong>Masking</strong> is a bitwise technique used in computer programming and hardware registers to isolate, clear, or examine specific bits of a byte while keeping other bits intact.</p>

<p><strong>Operator Used:</strong></p>
<p>The <strong>AND operation</strong> is used for clearing/isolating bits because:</p>
<ul>
  <li>\\(X \\text{ AND } 0 = 0\\) (forces the bit to zero).</li>
  <li>\\(X \\text{ AND } 1 = X\\) (leaves the original bit unchanged).</li>
</ul>

<p><strong>Example (Clearing the high nibble of a byte):</strong></p>
<pre><code>Original Data: 1 1 0 1   1 0 1 0
Mask (0x0F):   0 0 0 0   1 1 1 1  (Bitwise AND)
---------------------------------
Result:        0 0 0 0   1 0 1 0</code></pre>
<p>The upper 4 bits have been masked to 0, while the lower 4 bits are perfectly preserved.</p>`,
    explanation: 'From CS101 Handouts Lecture 7; CS101 MID by Attiq Kundi Page 70.',
    urdu_answer: 'ماسکنگ سے مراد کسی بائٹ کے مخصوص بٹس کو الگ کرنے یا صفر کرنے کا عمل ہے۔ اس کے لیے AND آپریٹر استعمال ہوتا ہے کیونکہ صفر سے AND کرنے پر بٹ صفر ہو جاتی ہے جبکہ 1 سے AND کرنے پر اصل ویلیو برقرار رہتی ہے۔'
  },
  {
    stem: 'What would be the digital output when a NOT operation is applied to an input bit of 1? State the truth table for the NOT gate.',
    correct: `<p><strong>Output Calculation:</strong></p>
<p>When the NOT operation is applied to an input of <strong>1</strong>, the resulting output is <strong>0</strong>:</p>
<p>$$\\text{NOT}(1) = 0 \\quad \\text{or} \\quad \\bar{1} = 0$$</p>

<p><strong>Truth Table of NOT Gate (Inverter):</strong></p>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:60%; text-align:center;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Input (\\(A\\))</th>
      <th>Output (\\(Z = \\bar{A}\\))</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>1</td></tr>
    <tr><td>1</td><td>0</td></tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 7; CS101 Quiz-1 2022 Mid Term Preparation Q5.',
    urdu_answer: 'جب 1 پر NOT آپریشن لاگو کیا جائے تو اس کا آؤٹ پٹ 0 ہوگا۔ NOT گیٹ ہمیشہ ان پٹ کو الٹ کر دیتا ہے (0 کو 1 اور 1 کو 0 میں بدلتا ہے)۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Discuss the fundamental logic gates used in digital electronic circuits: AND, OR, NOT, NAND, NOR, and XOR. For each gate, explain its functional behavior, algebraic symbol, and truth table.',
    correct: `<p><strong>Overview of Fundamental Logic Gates:</strong></p>

<ol>
  <li><strong>AND Gate (Conjunction):</strong>
    <p>Output is 1 if and only if all inputs are 1. Algebraic form: \\(Z = A \\cdot B\\).</p>
    <table border="1" cellpadding="4" style="border-collapse:collapse; text-align:center;">
      <tr style="background:#f2f2f2;"><th>A</th><th>B</th><th>Output (A · B)</th></tr>
      <tr><td>0</td><td>0</td><td>0</td></tr>
      <tr><td>0</td><td>1</td><td>0</td></tr>
      <tr><td>1</td><td>0</td><td>0</td></tr>
      <tr><td>1</td><td>1</td><td>1</td></tr>
    </table>
  </li>

  <li><strong>OR Gate (Disjunction):</strong>
    <p>Output is 1 if at least one input is 1. Algebraic form: \\(Z = A + B\\).</p>
    <table border="1" cellpadding="4" style="border-collapse:collapse; text-align:center;">
      <tr style="background:#f2f2f2;"><th>A</th><th>B</th><th>Output (A + B)</th></tr>
      <tr><td>0</td><td>0</td><td>0</td></tr>
      <tr><td>0</td><td>1</td><td>1</td></tr>
      <tr><td>1</td><td>0</td><td>1</td></tr>
      <tr><td>1</td><td>1</td><td>1</td></tr>
    </table>
  </li>

  <li><strong>NOT Gate (Inverter):</strong>
    <p>Inverts the input bit. Algebraic form: \\(Z = \\bar{A}\\). (0 becomes 1; 1 becomes 0).</p>
  </li>

  <li><strong>NAND Gate (Universal Gate):</strong>
    <p>Negation of AND (Output is 0 strictly when both inputs are 1). Form: \\(Z = \\overline{A \\cdot B}\\).</p>
  </li>

  <li><strong>NOR Gate (Universal Gate):</strong>
    <p>Negation of OR (Output is 1 strictly when both inputs are 0). Form: \\(Z = \\overline{A + B}\\).</p>
  </li>

  <li><strong>XOR Gate (Exclusive OR):</strong>
    <p>Output is 1 when inputs are different (one is 1, the other is 0); output is 0 when inputs are identical. Form: \\(Z = A \\oplus B\\).</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 7; CS101 Mid Term Paper Q8 & Q24.',
    urdu_answer: 'بنیادی لاجک گیٹس میں AND (دونوں 1 ہوں تو 1)، OR (کوئی ایک 1 ہو تو 1)، NOT (ان پٹ کو الٹنے والا)، NAND (AND کا الٹ)، NOR (OR کا الٹ) اور XOR (جب دونوں ان پٹس مختلف ہوں تو 1 دینے والا) شامل ہیں۔ یہ ڈیجیٹل سرکٹس کی بنیادی اینٹیں ہیں۔'
  },
  {
    stem: 'Construct the complete truth table for the following Boolean Expression: \n$$Z = X + (X \\cdot Y)\'$$\nShow each intermediate evaluation step clearly.',
    correct: `<p><strong>Truth Table Construction for: \\(Z = X + (X \\cdot Y)'\\)</strong></p>

<ol>
  <li><strong>Identify Variables & Number of Rows:</strong>
    <p>The expression contains 2 input variables (\\(X\\) and \\(Y\\)). Therefore, the truth table requires \\(2^2 = 4\\) rows.</p>
  </li>
  <li><strong>Intermediate Columns:</strong>
    <ul>
      <li>Column 1: Input variable \\(X\\)</li>
      <li>Column 2: Input variable \\(Y\\)</li>
      <li>Column 3: \\(X \\cdot Y\\) (AND operation)</li>
      <li>Column 4: \\((X \\cdot Y)'\\) (NAND / NOT operation on Column 3)</li>
      <li>Column 5: \\(Z = X + (X \\cdot Y)'\\) (OR operation between Column 1 and Column 4)</li>
    </ul>
  </li>
</ol>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; text-align:center;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>\\(X\\)</th>
      <th>\\(Y\\)</th>
      <th>\\(X \\cdot Y\\)</th>
      <th>\\((X \\cdot Y)'\\)</th>
      <th>\\(Z = X + (X \\cdot Y)'\\)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>0</td><td>0</td><td>1</td><td><strong>1</strong> (0 + 1 = 1)</td></tr>
    <tr><td>0</td><td>1</td><td>0</td><td>1</td><td><strong>1</strong> (0 + 1 = 1)</td></tr>
    <tr><td>1</td><td>0</td><td>0</td><td>1</td><td><strong>1</strong> (1 + 1 = 1)</td></tr>
    <tr><td>1</td><td>1</td><td>1</td><td>0</td><td><strong>1</strong> (1 + 0 = 1)</td></tr>
  </tbody>
</table>

<p><strong>Observation & Conclusion:</strong></p>
<p>Notice that for all possible input combinations of \\(X\\) and \\(Y\\), the final output \\(Z\\) evaluates to <strong>1</strong>. In Boolean algebra, an expression that evaluates to TRUE under all possible input assignments is known as a <strong>Tautology</strong>. By Boolean laws: \\(X + (X \\cdot Y)' = X + X' + Y' = 1 + Y' = 1\\).</p>`,
    explanation: 'From CS101 Handouts Lecture 7; CS101 Mid Term Paper Question No. 24 (5 Marks).',
    urdu_answer: 'دی گئی بولین مساوات $Z = X + (X \\cdot Y)\'$ کا ٹروتھ ٹیبل 4 قطاروں پر مشتمل ہے۔ تمام ممکنہ ان پٹس (00, 01, 10, 11) پر حل کرنے سے آخری کالم میں تمام نتائج 1 آتے ہیں، جسے بولین الجبرا میں Tautology کہا جاتا ہے۔'
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
console.log(`CS101 Lecture 7 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

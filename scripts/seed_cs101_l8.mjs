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

// 2. Create or fetch Lecture 8
let lec8 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 8").get(cs101.id);
if (!lec8) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 8, 'Number Systems, Binary Arithmetic, Floating-Point, and Character Encoding')
  `).run(cs101.id);
  lec8 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 8 with ID: ${lec8.id}`);
} else {
  console.log(`CS101 Lecture 8 found with ID: ${lec8.id}`);
}

const lId = lec8.id;

// 3. Clear existing questions for Lecture 8 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 8.`);

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
    stem: 'The Hexadecimal (Base-16) number system is based on ________ distinct alphanumeric digits / symbols (0–9 and A–F).',
    options: {
      a: '2',
      b: '8',
      c: '12',
      d: '16'
    },
    correct: 'd',
    explanation: 'Hexadecimal is a base-16 positional numeral system using sixteen distinct symbols: numbers 0–9 and letters A–F (where A=10, B=11, C=12, D=13, E=14, F=15) (CS101 Handouts Lecture 8). Appeared in 22+ midterm past papers.',
    urdu_answer: 'ہیکسا ڈیسیمل نمبر سسٹم 16 بنیادی ہندسوں (0 سے 9 تک اور A سے F تک) پر مشتمل ہوتا ہے۔'
  },
  {
    stem: 'Which fundamental number system is natively utilized by digital microprocessors and electronic computer hardware to represent all data and instructions?',
    options: {
      a: 'Binary (Base-2)',
      b: 'Decimal (Base-10)',
      c: 'Octal (Base-8)',
      d: 'Hexadecimal (Base-16)'
    },
    correct: 'a',
    explanation: 'Digital circuits and microprocessors operate using two stable voltage states (ON/OFF, High/Low), which naturally correspond to the binary digits 0 and 1 (CS101 Handouts Lecture 8). Appeared in 15+ midterm papers.',
    urdu_answer: 'مائیکرو پروسیسرز اور ڈیجیٹل سرکٹس بنیادی طور پر بائنری نمبر سسٹم (0 اور 1) پر کام کرتے ہیں۔'
  },
  {
    stem: 'In computer science, Hexadecimal notation provides a compact shorthand by using a ________ symbol to represent a pattern of exactly four binary bits (a nibble).',
    options: {
      a: 'Quad',
      b: 'Single',
      c: 'Double',
      d: 'Triple'
    },
    correct: 'b',
    explanation: 'Since $2^4 = 16$, exactly one hexadecimal character uniquely represents any 4-bit binary nibble (e.g., $1111_2 = \\text{F}_{16}$) (CS101 Handouts Lecture 8). Appeared in 6+ papers.',
    urdu_answer: 'ہیکسا ڈیسیمل نوٹیشن میں ایک اکیلا ہندسہ (Single symbol) 4 بائنری بٹس کے پیٹرن کو ظاہر کرتا ہے۔'
  },
  {
    stem: 'A standardized contiguous group of 8 binary digits (bits) that a computer manipulates as a fundamental basic unit is called a:',
    options: {
      a: 'Byte',
      b: 'Word',
      c: 'Bit',
      d: 'Hertz'
    },
    correct: 'a',
    explanation: 'A byte is a contiguous group of 8 bits, which serves as the fundamental addressable storage unit in modern computers (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'آٹھ بٹس کے گروپ کو بائٹ (Byte) کہا جاتا ہے جو کمپیوٹر میں ڈیٹا اسٹوریج کی بنیادی اکائی ہے۔'
  },
  {
    stem: 'What is the decimal equivalent of the binary number $(1000)_2$?',
    options: {
      a: '7',
      b: '8',
      c: '9',
      d: '10'
    },
    correct: 'b',
    explanation: '$(1000)_2 = 1 \\times 2^3 + 0 \\times 2^2 + 0 \\times 2^1 + 0 \\times 2^0 = 8 + 0 + 0 + 0 = 8$ (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'بائنری عدد 1000 کا ڈیسیمل مساوی 8 ہوتا ہے ($1 \\times 2^3 = 8$)۔'
  },
  {
    stem: 'Which of the following binary bit patterns is mathematically equivalent to the decimal number 10?',
    options: {
      a: '1000',
      b: '1100',
      c: '1001',
      d: '1010'
    },
    correct: 'd',
    explanation: 'In binary positional notation: $10 = 8 + 2 = (1 \\times 2^3) + (0 \\times 2^2) + (1 \\times 2^1) + (0 \\times 2^0) = (1010)_2$ (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'ڈیسیمل 10 کا بائنری مساوی 1010 ہوتا ہے۔'
  },
  {
    stem: 'In an 8-bit unsigned binary byte notation, the bit pattern $(11111111)_2$ evaluates to what decimal value?',
    options: {
      a: '128',
      b: '255',
      c: '567',
      d: '127'
    },
    correct: 'b',
    explanation: 'For an 8-bit byte with all bits set to 1: $2^8 - 1 = 256 - 1 = 255$ (or $128+64+32+16+8+4+2+1 = 255$) (CS101 Handouts Lecture 8). Appeared in 10+ past papers.',
    urdu_answer: 'آٹھ بٹس کے بائنری نمبر 11111111 کا ڈیسیمل مساوی 255 ہوتا ہے۔'
  },
  {
    stem: 'What is the name of the smallest elementary unit of digital information, representing a contraction of "Binary Digit"?',
    options: {
      a: 'Bit',
      b: 'Byte',
      c: 'Pattern',
      d: 'Megabyte'
    },
    correct: 'a',
    explanation: 'A bit (binary digit) is the smallest fundamental unit of storage, holding either a 0 or a 1 (CS101 Handouts Lecture 8). Appeared in 14+ past papers.',
    urdu_answer: 'کمپیوٹر میں ڈیٹا اسٹوریج کی سب سے چھوٹی اکائی کو بٹ (Bit) کہتے ہیں جو بائنری ڈیجٹ کا مخفف ہے۔'
  },
  {
    stem: 'The most popular and universally adopted system for storing signed positive and negative integers in modern computer hardware is ________ complement notation.',
    options: {
      a: 'Zero\'s',
      b: 'Two\'s (2\'s)',
      c: 'One\'s (1\'s)',
      d: 'Three\'s'
    },
    correct: 'b',
    explanation: 'Two\'s complement is the industry-standard integer representation because it eliminates duplicate zero (+0 and -0) and allows subtraction to be performed using standard binary addition circuits (CS101 Handouts Lecture 8). Appeared in 8+ midterm papers.',
    urdu_answer: 'جدید کمپیوٹرز میں مثبت اور منفی اعداد کو محفوظ کرنے کے لیے ٹوز کمپلیمنٹ (2\'s complement) سب سے زیادہ مقبول طریقہ ہے۔'
  },
  {
    stem: 'When using a 16-bit word in standard 2\'s complement notation, how many maximum positive integer values (or total positive magnitude up to $2^{15}$) can be addressed?',
    options: {
      a: '32768 (Range: -32,768 to +32,767)',
      b: '32678',
      c: '32867',
      d: '32868'
    },
    correct: 'a',
    explanation: 'With $n = 16$ bits, 2\'s complement represents numbers from $-2^{15} = -32,768$ to $+2^{15}-1 = +32,767$, with total magnitude of $2^{15} = 32,768$ (CS101 Handouts Lecture 8). Appeared in 5+ past papers.',
    urdu_answer: 'سولہ بٹس میں ٹوز کمپلیمنٹ کے تحت کل 32768 کے لگ بھگ اعداد کی رینج ہوتی ہے (-32768 سے +32767 تک)۔'
  },
  {
    stem: 'Which international character encoding standard was designed to encode all of the world\'s living and historical languages by accommodating unique code point patterns of up to 21 bits?',
    options: {
      a: 'UTF-8',
      b: 'ANSI 7-bit',
      c: 'Unicode (Universal Coded Character Set)',
      d: 'Standard ASCII'
    },
    correct: 'c',
    explanation: 'Unicode defines a universal codespace of $1,114,112$ code points ($0x0$ to $0x10FFFF$), which requires 21 bits to uniquely identify every character worldwide (CS101 Handouts Lecture 8). Appeared in 10+ past papers.',
    urdu_answer: 'یونیکوڈ (Unicode) دنیا کی تمام زبانوں کے رسم الخط کو 21 بٹس تک کے کوڈ پوائنٹس کے ذریعے محفوظ کرنے کی صلاحیت رکھتا ہے۔'
  },
  {
    stem: 'The variable-length UTF-8 encoding scheme encodes individual Unicode characters using sequences of 1 to 4 bytes, spanning from 8 up to ________ bits.',
    options: {
      a: '90 bits',
      b: '30 bits',
      c: '32 bits (4 bytes)',
      d: '21 bits'
    },
    correct: 'c',
    explanation: 'UTF-8 uses variable-length encoding: 1 byte (8 bits), 2 bytes (16 bits), 3 bytes (24 bits), or 4 bytes (32 bits) (CS101 Handouts Lecture 8). Appeared in 6+ papers.',
    urdu_answer: 'یو ٹی ایف-8 (UTF-8) انکوڈنگ میں ایک کریکٹر کو ظاہر کرنے کے لیے 8 سے 32 بٹس (1 سے 4 بائٹس) استعمال ہوتی ہیں۔'
  },
  {
    stem: 'Most general-purpose computers manufactured today use at least ________ for storing single-precision fractional values in IEEE 754 floating-point notation.',
    options: {
      a: '38 bits',
      b: '32 bits',
      c: '31 bits',
      d: '30 bits'
    },
    correct: 'b',
    explanation: 'Standard single-precision floating-point format (IEEE 754) uses 32 bits (1 sign bit, 8 exponent bits, 23 mantissa/fraction bits) (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'جدید کمپیوٹرز میں اعشاریہ والے فلوٹنگ پوائنٹ اعداد کو محفوظ کرنے کے لیے عام طور پر کم از کم 32 بٹس کا استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In floating-point number representation, which specific field determines how many positions to move the binary radix point to the left or right?',
    options: {
      a: 'Exponent field',
      b: 'Most Significant Bit',
      c: 'Sign bit',
      d: 'Mantissa field'
    },
    correct: 'a',
    explanation: 'The exponent field indicates the power of 2 by which the mantissa is multiplied, dictating how many places the binary radix point shifts (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'فلوٹنگ پوائنٹ میں ایکسپوننٹ (Exponent) فیلڈ یہ طے کرتی ہے کہ بائنری پوائنٹ کو کتنے درجے دائیں یا بائیں منتقل کرنا ہے۔'
  },
  {
    stem: 'Adding binary fractions is conceptually identical to decimal addition: you align the ________ and add the digits column-by-column, propagating carries across place values.',
    options: {
      a: 'Radix point (binary point)',
      b: 'Sign bit only',
      c: 'Octal prefix',
      d: 'Parity bit'
    },
    correct: 'a',
    explanation: 'Just as in decimal arithmetic where decimal points must align vertically, binary addition requires aligning the binary radix point prior to summing columns (CS101 Handouts Lecture 8). Appeared in multiple past papers.',
    urdu_answer: 'بائنری فریکشنز کی جمع میں اعشاریہ یا ریڈکس پوائنٹ (Radix point) کو سیدھ میں رکھنا لازمی ہوتا ہے۔'
  }
];

// 6 Short Questions
const shortQuestions = [
  {
    stem: 'Why do computer microprocessors and digital electronics use the Binary number system rather than the Decimal or any other number system?',
    correct: `<p><strong>Why Computers Use Binary (Base-2):</strong></p>

<ol>
  <li><strong>Physical Reliability & Noise Tolerance:</strong>
    <p>Transistors and digital electronic switches operate most reliably in two discrete physical states: fully saturated (ON / High Voltage $\\approx 5V$ or $3.3V$) and cutoff (OFF / Low Voltage $\\approx 0V$). Distinguishing between just two states provides enormous tolerance against electrical noise.</p>
  </li>
  <li><strong>Simplicity of Circuit Design:</strong>
    <p>Designing digital logic circuits to differentiate 10 distinct voltage levels (0V, 0.5V, 1.0V... 4.5V for decimal) would require delicate, error-prone analog amplifiers easily corrupted by thermal noise or power fluctuations.</p>
  </li>
  <li><strong>Boolean Logic Mapping:</strong>
    <p>Binary arithmetic directly maps to Boolean logic (1 = TRUE, 0 = FALSE), allowing arithmetic operations (addition, subtraction) and decision logic to be implemented using the exact same logic gates (AND, OR, NOT, XOR).</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 Mid Term Past Paper Mega File, Page 12; Fall 2009 s3 Q31.',
    urdu_answer: 'کمپیوٹر بائنری سسٹم اس لیے استعمال کرتے ہیں کیونکہ الیکٹرانک ٹرانزسٹرز دو حالتوں (آن/آف یا ہائی/لو وولٹیج) میں سب سے زیادہ پائیدار اور درست کام کرتے ہیں۔ 10 الگ الگ وولٹیج لیولز بنانا پیچیدہ اور غلطیوں کا باعث بنتا ہے۔'
  },
  {
    stem: 'Clearly differentiate between ASCII and Unicode character encoding schemes. Compare their bit widths, total character capacity, and language coverage.',
    correct: `<p><strong>Comparison: ASCII vs. Unicode:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>ASCII (American Standard Code)</th>
      <th>Unicode (Universal Character Set)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Bit Width</strong></td>
      <td>Standard ASCII uses <strong>7 bits</strong> (Extended ASCII uses 8 bits / 1 byte).</td>
      <td>Variable-width encoding: <strong>8 to 32 bits</strong> (UTF-8, UTF-16, UTF-32).</td>
    </tr>
    <tr>
      <td><strong>Total Characters</strong></td>
      <td>Can represent at most <strong>128 characters</strong> ($2^7$) or 256 in extended ASCII.</td>
      <td>Accommodates over <strong>1,114,112 code points</strong> (unique characters).</td>
    </tr>
    <tr>
      <td><strong>Language Coverage</strong></td>
      <td>Limited strictly to English letters, numbers, punctuation, and control codes.</td>
      <td>Universal; encodes all living languages (Urdu, Arabic, Chinese, Japanese, Greek, Latin), mathematical symbols, and emojis.</td>
    </tr>
    <tr>
      <td><strong>Backward Compatibility</strong></td>
      <td>Foundation standard developed in 1963.</td>
      <td>UTF-8 is fully backward-compatible with 7-bit ASCII (codes 0–127 are identical).</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 Mid Term by VU Stars Q14; Quiz-1 2022 Q4.',
    urdu_answer: 'اسکی (ASCII) ایک 7 یا 8 بٹ کا کوڈ ہے جو صرف انگریزی زبان کے 128 یا 256 حروف کو سپورٹ کرتا ہے۔ جبکہ یونیکوڈ (Unicode) 8 سے 32 بٹس کا عالمی معیار ہے جو دنیا کی تمام زبانوں (اردو، عربی، چینی وغیرہ) اور علامتوں کو محفوظ کر سکتا ہے۔'
  },
  {
    stem: 'What is a Truncation Error in computer floating-point arithmetic, and what are two common methods used to minimize it?',
    correct: `<p><strong>Truncation Error:</strong></p>
<p>A <strong>truncation error</strong> occurs when a real fractional number has an infinite or recurring binary representation (such as $1/3 = 0.3333\\dots$ or $1/10 = 0.000110011\\dots_2$) that cannot fit within the finite number of bits allocated to the mantissa field of a floating-point register. The trailing bits must be cut off (truncated), introducing rounding inaccuracies.</p>

<p><strong>Two Methods Used to Minimize Truncation Errors:</strong></p>
<ol>
  <li><strong>Rounding (Round-to-Nearest):</strong>
    <p>Instead of simply discarding trailing bits (chopping), the hardware inspects the guard bit immediately following the mantissa and rounds the last retained bit up or down to the nearest representable floating-point number.</p>
  </li>
  <li><strong>Higher Precision Formats (Double Precision / Extended Precision):</strong>
    <p>Using 64-bit IEEE 754 double-precision (which expands the mantissa to 52 bits) or 80-bit/128-bit extended precision formats to increase the significant digits and push truncation errors far beyond meaningful calculation thresholds.</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 midterm 2022 Question No. 11.',
    urdu_answer: 'جب کسی اعشاریہ والے عدد کی بٹس میموری کی گنجائش سے زیادہ ہو جائیں تو اضافی بٹس کو کاٹنا پڑتا ہے جسے Truncation Error کہتے ہیں۔ اس غلطی کو کم کرنے کے لیے 1. راؤنڈنگ (Rounding) اور 2. ڈبل پریسیشن (Double precision یعنی زیادہ بٹس کا استعمال) کیا جاتا ہے۔'
  },
  {
    stem: 'Explain how negative signed integers are represented using 2\'s Complement notation. State the two-step algorithm to find the 2\'s complement of a binary number.',
    correct: `<p><strong>Representation of Negative Integers in 2's Complement:</strong></p>
<p>In 2's complement notation, the <strong>Most Significant Bit (MSB)</strong> serves as the sign bit: an MSB of <code>0</code> signifies a positive integer, while an MSB of <code>1</code> signifies a negative integer.</p>

<p><strong>Two-Step Algorithm to Obtain the 2's Complement:</strong></p>
<ol>
  <li><strong>Step 1 (1's Complement / Inversion):</strong> Invert all the bits of the positive binary representation (change every 0 to 1, and every 1 to 0).</li>
  <li><strong>Step 2 (Add 1):</strong> Add binary 1 to the least significant bit (LSB) of the inverted result, discarding any final overflow carry beyond the register size.</li>
</ol>
<p>$$\\text{2's Complement} = (\\text{1's Complement}) + 1$$</p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 MID-Term by Attiq Kundi Page 18; Quiz-1 2022 Q3.',
    urdu_answer: 'ٹوز کمپلیمنٹ میں سب سے پہلا بٹ (MSB) علامت کو ظاہر کرتا ہے (0 مثبت کے لیے اور 1 منفی کے لیے)۔ کسی عدد کا منفی بنانے کے لیے پہلے تمام بٹس کو الٹ دیا جاتا ہے (0 کو 1 اور 1 کو 0) اور پھر حاصل شدہ جواب میں 1 جمع کر دیا جاتا ہے۔'
  },
  {
    stem: 'If the binary representation of positive 8 in a 5-bit register is 01000, calculate the 2\'s complement binary representation of -8.',
    correct: `<p><strong>Calculation of -8 in 2's Complement (5-bit register):</strong></p>

<ol>
  <li><strong>Positive representation (+8):</strong>
    <p><code>0 1 0 0 0</code></p>
  </li>
  <li><strong>Step 1: Take the 1's Complement (invert all bits):</strong>
    <p><code>1 0 1 1 1</code></p>
  </li>
  <li><strong>Step 2: Add 1 to the result:</strong>
    <pre><code>  1 0 1 1 1
+         1
-----------
  1 1 0 0 0</code></pre>
  </li>
</ol>
<p><strong>Result:</strong> The 2's complement representation of <strong>-8</strong> in a 5-bit register is <strong>11000</strong> (notice the MSB is 1, confirming it is negative).</p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 MID-Term by Attiq Kundi Page 18.',
    urdu_answer: 'مثبت 8 کی بائنری 01000 ہے۔ بٹس کو الٹنے پر 10111 حاصل ہوا، اور اس میں 1 جمع کرنے پر -8 کی بائنری 11000 حاصل ہوئی۔'
  },
  {
    stem: 'What will be the output of evaluating the following bitwise logical OR expression: \n1010 OR 1111? Show the column-by-column evaluation.',
    correct: `<p><strong>Bitwise Logical OR Evaluation:</strong></p>
<p>The bitwise OR operation produces an output of 1 if either input bit (or both) is 1. It only produces 0 when both input bits are 0 ($0 + 0 = 0$; $0 + 1 = 1$; $1 + 0 = 1$; $1 + 1 = 1$).</p>

<pre><code>   1  0  1  0
OR 1  1  1  1
-------------
   1  1  1  1</code></pre>

<p><strong>Step-by-step:</strong></p>
<ul>
  <li>Bit 4 (leftmost): $1 \\text{ OR } 1 = 1$</li>
  <li>Bit 3: $0 \\text{ OR } 1 = 1$</li>
  <li>Bit 2: $1 \\text{ OR } 1 = 1$</li>
  <li>Bit 1 (rightmost): $0 \\text{ OR } 1 = 1$</li>
</ul>
<p><strong>Output:</strong> <strong>1111</strong></p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 MID by Attiq Kundi Q2.',
    urdu_answer: '1010 OR 1111 کا نتیجہ 1111 ہوگا۔ چونکہ دوسرے پیٹرن کے تمام بٹس 1 ہیں، اس لیے OR لاجک کے تحت تمام پوزیشنز پر نتیجہ 1 آئے گا۔'
  }
];

// 4 Long Questions
const longQuestions = [
  {
    stem: 'Write down the complete algorithmic procedure for converting a positive Decimal integer into its equivalent Binary representation using the repeated division-by-2 method. Provide an illustrative example converting decimal 25 to binary.',
    correct: `<p><strong>Algorithm for Decimal-to-Binary Conversion (Division by 2 Method):</strong></p>

<ol>
  <li><strong>Step 1:</strong> Take the decimal integer as the dividend.</li>
  <li><strong>Step 2:</strong> Divide the decimal number by 2 (the base of the binary system).</li>
  <li><strong>Step 3:</strong> Record the integer quotient and write down the remainder (which will always be either 0 or 1).</li>
  <li><strong>Step 4:</strong> Repeat the division using the quotient from the previous step as the new dividend until the quotient becomes 0.</li>
  <li><strong>Step 5:</strong> Read all the recorded remainders in <strong>reverse order</strong> (from the last remainder at the bottom up to the first remainder at the top). The bottom remainder is the Most Significant Bit (MSB) and the top is the Least Significant Bit (LSB).</li>
</ol>

<p><strong>Example: Converting Decimal 25 to Binary:</strong></p>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:80%; text-align:center;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Division Operation</th>
      <th>Quotient</th>
      <th>Remainder</th>
      <th>Bit Position</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>25 ÷ 2</td><td>12</td><td><strong>1</strong></td><td>LSB</td></tr>
    <tr><td>12 ÷ 2</td><td>6</td><td><strong>0</strong></td><td></td></tr>
    <tr><td>6 ÷ 2</td><td>3</td><td><strong>0</strong></td><td></td></tr>
    <tr><td>3 ÷ 2</td><td>1</td><td><strong>1</strong></td><td></td></tr>
    <tr><td>1 ÷ 2</td><td>0</td><td><strong>1</strong></td><td>MSB</td></tr>
  </tbody>
</table>

<p>Reading remainders from bottom to top: <code>1 1 0 0 1</code>.</p>
<p><strong>Result:</strong> $$(25)_{10} = (11001)_2$$</p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 Mid_term_Solved.pdf Question No. 23 (5 Marks).',
    urdu_answer: 'ڈیسیمل سے بائنری میں تبدیل کرنے کا طریقہ یہ ہے کہ عدد کو مسلسل 2 پر تقسیم کیا جائے اور باقی بچنے والے اعداد (Remainders) کو نیچے سے اوپر کی ترتیب میں لکھا جائے۔ مثلاً 25 کو تقسیم کرنے سے بائنری 11001 حاصل ہوتی ہے۔'
  },
  {
    stem: 'Convert the binary number 100100 into its equivalent Decimal number. Show the full positional expansion and mathematical computation step-by-step.',
    correct: `<p><strong>Step-by-Step Binary to Decimal Conversion:</strong></p>
<p>We are given the 6-bit binary number: $$(100100)_2$$</p>

<ol>
  <li><strong>Identify Bit Positions and Powers of 2:</strong>
    <p>Assign positional powers of 2 starting from index 0 on the far right (LSB):</p>
    <ul>
      <li>Bit 5 (MSB): <code>1</code> $\\times 2^5$</li>
      <li>Bit 4: <code>0</code> $\\times 2^4$</li>
      <li>Bit 3: <code>0</code> $\\times 2^3$</li>
      <li>Bit 2: <code>1</code> $\\times 2^2$</li>
      <li>Bit 1: <code>0</code> $\\times 2^1$</li>
      <li>Bit 0 (LSB): <code>0</code> $\\times 2^0$</li>
    </ul>
  </li>

  <li><strong>Mathematical Positional Expansion:</strong>
    <p>$$\\text{Decimal} = (1 \\times 2^5) + (0 \\times 2^4) + (0 \\times 2^3) + (1 \\times 2^2) + (0 \\times 2^1) + (0 \\times 2^0)$$</p>
  </li>

  <li><strong>Evaluate Each Power of 2:</strong>
    <ul>
      <li>$1 \\times 32 = 32$</li>
      <li>$0 \\times 16 = 0$</li>
      <li>$0 \\times 8 = 0$</li>
      <li>$1 \\times 4 = 4$</li>
      <li>$0 \\times 2 = 0$</li>
      <li>$0 \\times 1 = 0$</li>
    </ul>
  </li>

  <li><strong>Sum the Evaluated Terms:</strong>
    <p>$$\\text{Decimal} = 32 + 0 + 0 + 4 + 0 + 0 = \\mathbf{36}$$</p>
  </li>
</ol>

<p><strong>Final Answer:</strong> $$(100100)_2 = (36)_{10}$$</p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 Mid Term Paper Question No. 23 (5 Marks).',
    urdu_answer: 'بائنری نمبر 100100 کو ڈیسیمل میں تبدیل کرنے کے لیے ہر بٹ کو 2 کی متعلقہ پاور سے ضرب دے کر جمع کیا جاتا ہے: $1\\times 32 + 0 + 0 + 1\\times 4 + 0 + 0 = 36$۔ پس جواب 36 ہے۔'
  },
  {
    stem: 'Explain the principles of Floating-Point Representation in computer systems. Describe the roles of the Sign Bit, Exponent Field, and Mantissa (Significand), and explain why floating-point notation is necessary for scientific computation.',
    correct: `<p><strong>1. The Concept and Necessity of Floating-Point:</strong></p>
<p>Fixed-point integer representation cannot represent non-integer fractions (e.g., $0.375$) or extremely vast scientific numbers (e.g., speed of light $3 \\times 10^8$ m/s or electron mass $9.11 \\times 10^{-31}$ kg). Floating-point notation is the digital electronic counterpart to scientific notation ($M \\times 2^E$), allowing the binary radix point to "float" dynamically.</p>

<p><strong>2. Three Component Fields of Floating-Point Notation:</strong></p>
<ol>
  <li><strong>Sign Bit (1 bit):</strong>
    <p>The single leading bit designating the polarity of the entire number: <code>0</code> indicates a positive quantity, while <code>1</code> indicates a negative quantity.</p>
  </li>
  <li><strong>Exponent Field (Biased Exponent):</strong>
    <p>Specifies the power of 2 by which the mantissa is multiplied, controlling the scale of the number and dictating how far the binary radix point shifts. To represent both negative and positive exponents without a separate sign bit, a bias (e.g., Excess-127 in IEEE 754 single precision) is added to the true exponent.</p>
  </li>
  <li><strong>Mantissa / Significand Field:</strong>
    <p>Contains the fractional binary significant digits of the normalized number. In normalized format, the leading binary 1 before the radix point is implicit ("hidden bit"), maximizing precision.</p>
  </li>
</ol>

<p><strong>3. General Mathematical Formula:</strong></p>
<p>$$\\text{Value} = (-1)^{\\text{Sign}} \\times (1.\\text{Mantissa}) \\times 2^{\\text{Exponent} - \\text{Bias}}$$</p>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 midterm 2022 Question No. 3 & Q12; CS101 Mid Term By JUNAID Q49.',
    urdu_answer: 'فلوٹنگ پوائنٹ نوٹیشن اعشاریہ والے اور سائنسی اعداد کو محفوظ کرنے کے لیے استعمال ہوتی ہے۔ اس کے تین اہم حصے ہوتے ہیں: 1. سائن بٹ (علامت کے لیے)، 2. ایکسپوننٹ (عدد کے اسکیل اور پوائنٹ کی پوزیشن کے لیے)، اور 3. مینٹیسا (عدد کے اصل ہندسوں کے لیے)۔'
  },
  {
    stem: 'Represent the fractional mixed number $2\\frac{3}{4}$ (or $2.75_{10}$) in normalized binary and floating-point format. Identify the specific values of the Sign Bit, Exponent, and Mantissa using a simplified 8-bit model (1 sign bit, 3-bit Excess-4 exponent, 4-bit mantissa).',
    correct: `<p><strong>Step-by-Step Floating-Point Representation of $2\\frac{3}{4}$ ($2.75_{10}$):</strong></p>

<ol>
  <li><strong>Step 1: Convert the Mixed Number to Binary:</strong>
    <ul>
      <li>Whole integer part: $2_{10} = (10)_2$</li>
      <li>Fractional part: $\\frac{3}{4} = 0.75_{10}$:
        <br>$0.75 \\times 2 = 1.5$ (take 1)
        <br>$0.5 \\times 2 = 1.0$ (take 1)
        <br>$\\implies 0.75_{10} = (0.11)_2$</li>
      <li>Combined binary: $$(2.75)_{10} = (10.11)_2$$</li>
    </ul>
  </li>

  <li><strong>Step 2: Normalize the Binary Representation:</strong>
    <p>Shift the radix point one position to the left so that exactly one non-zero digit appears before the point:</p>
    <p>$$(10.11)_2 = 1.011 \\times 2^1$$</p>
    <p>Here, the true exponent is $E = +1$.</p>
  </li>

  <li><strong>Step 3: Determine the Component Fields:</strong>
    <ul>
      <li><strong>Sign Bit:</strong> Since $2.75$ is positive, $\\text{Sign Bit} = \\mathbf{0}$.</li>
      <li><strong>Exponent Field (Excess-4 notation):</strong>
        <p>$$\\text{Stored Exponent} = \\text{True Exponent} + \\text{Bias} = 1 + 4 = 5 = (101)_2$$</p>
        So $\\text{Exponent} = \\mathbf{101}$.
      </li>
      <li><strong>Mantissa Field (4 bits):</strong>
        <p>Taking the fractional bits after the binary point ($011$) and padding with a zero to fill 4 bits: $\\mathbf{0110}$.</p>
      </li>
    </ul>
  </li>

  <li><strong>Step 4: Pack the 8-bit Floating-Point Register:</strong>
    <p><code>[Sign: 0] [Exponent: 101] [Mantissa: 0110]</code></p>
    <p>$$\\mathbf{01010110_2}$$</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 8; CS101 midterm 2022 Question No. 12.',
    urdu_answer: 'عدد $2\\frac{3}{4}$ (یعنی 2.75) کا بائنری 10.11 بنتا ہے۔ نارملائز کرنے پر یہ $1.011 \\times 2^1$ بنتا ہے۔ پس: سائن بٹ = 0، ایکسپوننٹ = 101 (ایکسیس-4 میں)، اور مینٹیسا = 0110 ہوگا، اور کل 8 بٹ بائنری 01010110 بنے گی۔'
  }
];

// 5. Insert questions
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

// 6. Verify counts
const countRow = db.prepare('SELECT count(*) as count FROM questions WHERE lecture_id = ?').get(lId);
const totalRow = db.prepare('SELECT count(*) as count FROM questions').get();
const lecCount = db.prepare('SELECT count(*) as count FROM lectures').get();
const subCount = db.prepare('SELECT count(*) as count FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS101 Lecture 8 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

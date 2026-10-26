import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// Read env variables from .env.local if present
const envPath = fs.existsSync(path.join(process.cwd(), '.env.local'))
  ? path.join(process.cwd(), '.env.local')
  : path.join(process.cwd(), 'exam-portal', '.env.local');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate STA301
const sta301 = db.prepare("SELECT id FROM subjects WHERE slug = 'sta301'").get();
if (!sta301) {
  console.error('STA301 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 10
let lec10 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 10").get(sta301.id);
if (!lec10) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 10, 'Measures of Dispersion, Range, Quartile Deviation & Relative Measures')
  `).run(sta301.id);
  lec10 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 10 with ID: ${lec10.id}`);
} else {
  console.log(`STA301 Lecture 10 already exists with ID: ${lec10.id}`);
}

const lId = lec10.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 10.`);

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

// 11 MCQs extracted from past papers
const mcqs = [
  {
    stem: 'Dispersion means the ________ that exists in a data set. / The degree to which numerical data tend to spread about an average is called:',
    options: {
      a: 'Similarity',
      b: 'Variability / Spread',
      c: 'Strength',
      d: 'Location'
    },
    correct: 'b',
    explanation: 'Dispersion (or variability) measures the extent to which numerical observations in a dataset deviate, spread, or scatter around a central average value.',
    urdu_answer: 'پھیلاؤ (Dispersion / Variability) سے مراد یہ ہے کہ اعداد و شمار اپنے مرکزی اوسط کے گرد کس قدر بکھرے ہوئے ہیں۔'
  },
  {
    stem: 'Which of the following is NOT an absolute measure of dispersion? / In measures of relative dispersion, the unit of measurement is:',
    options: {
      a: 'Same as data units',
      b: 'Vanishes / Unitless (expressed as ratio, coefficient, or percentage)',
      c: 'Squared units',
      d: 'Changed to log units'
    },
    correct: 'b',
    explanation: 'Relative measures of dispersion (such as Coefficient of Dispersion, Coefficient of Quartile Deviation) are pure, dimensionless numbers without units.',
    urdu_answer: 'اضافی پیمانے (Relative Measures) خالص تناسب یا فیصد ہوتے ہیں اور ان کا کوئی یونٹ نہیں ہوتا۔'
  },
  {
    stem: 'The measure of dispersion which uses only two observations (the maximum and minimum values) is called:',
    options: {
      a: 'Quartile Deviation',
      b: 'Range',
      c: 'Standard Deviation',
      d: 'Variance'
    },
    correct: 'b',
    explanation: 'Range is the simplest measure of dispersion and relies solely on the two extreme values: the maximum ($X_m$) and the minimum ($X_0$).',
    urdu_answer: 'رینج (Range) پھیلاؤ کا سب سے سادہ پیمانہ ہے جو صرف دو انتہائی اقدار (سب سے بڑی اور سب سے چھوٹی) پر منحصر ہوتا ہے۔'
  },
  {
    stem: 'If $X_0$ is the smallest value and $X_m$ is the largest value in a data set, then Range is defined by the relation:',
    options: {
      a: '$X_0 - X_m$',
      b: '$X_m - X_0$',
      c: '$\\frac{X_m - X_0}{2}$',
      d: '$\\frac{X_m + X_0}{2}$'
    },
    correct: 'b',
    explanation: 'Range is calculated as the difference between the maximum value and the minimum value: $\\text{Range} = X_m - X_0$.',
    urdu_answer: 'رینج کا فارمولا سب سے بڑی قدر تفریق سب سے چھوٹی قدر ہے: $X_m - X_0$۔'
  },
  {
    stem: 'The formula for the Coefficient of Dispersion (relative range) is:',
    options: {
      a: '$\\frac{X_m - X_0}{2}$',
      b: '$\\frac{X_m + X_0}{2}$',
      c: '$\\frac{X_m - X_0}{X_m + X_0}$',
      d: '$\\frac{X_m + X_0}{X_m - X_0}$'
    },
    correct: 'c',
    explanation: 'The Coefficient of Dispersion (relative measure of range) is computed as $\\frac{X_m - X_0}{X_m + X_0}$.',
    urdu_answer: 'کوایفیشینٹ آف ڈسپرشن (ریلیٹیو رینج) کا فارمولا $\\frac{X_m - X_0}{X_m + X_0}$ ہے۔'
  },
  {
    stem: 'Quartile Deviation is defined as half of the difference between the third and first quartiles, and is also known as:',
    options: {
      a: 'Interquartile Range',
      b: 'Semi-Interquartile Range',
      c: 'Mid-Quartile Range',
      d: 'Coefficient of Variation'
    },
    correct: 'b',
    explanation: 'Quartile Deviation is also known as the Semi-Interquartile Range, defined as $Q.D. = \\frac{Q_3 - Q_1}{2}$.',
    urdu_answer: 'کوآرٹائل ڈیوی ایشن کو سیمی انٹرکوآرٹائل رینج بھی کہا جاتا ہے جس کا فارمولا $Q.D. = \\frac{Q_3 - Q_1}{2}$ ہے۔'
  },
  {
    stem: 'If the first and third quartiles of a dataset are 22.16 and 56.36 respectively, then the Quartile Deviation is:',
    options: {
      a: '17.1',
      b: '30.5',
      c: '50.5',
      d: '51.3'
    },
    correct: 'a',
    explanation: '$$Q.D. = \\frac{Q_3 - Q_1}{2} = \\frac{56.36 - 22.16}{2} = \\frac{34.20}{2} = 17.1$$.',
    urdu_answer: '$Q.D. = \\frac{56.36 - 22.16}{2} = \\frac{34.20}{2} = 17.1$۔'
  },
  {
    stem: 'The relative measure of Quartile Deviation, known as the Coefficient of Quartile Deviation, is defined by:',
    options: {
      a: '$\\frac{Q_3 - Q_1}{2}$',
      b: '$\\frac{Q_3 + Q_1}{2}$',
      c: '$\\frac{Q_3 - Q_1}{Q_3 + Q_1}$',
      d: '$\\frac{Q_3 + Q_1}{Q_3 - Q_1}$'
    },
    correct: 'c',
    explanation: 'The Coefficient of Quartile Deviation is a dimensionless ratio computed as $\\frac{Q_3 - Q_1}{Q_3 + Q_1}$.',
    urdu_answer: 'کوایفیشینٹ آف کوآرٹائل ڈیوی ایشن کا فارمولا $\\frac{Q_3 - Q_1}{Q_3 + Q_1}$ ہے۔'
  },
  {
    stem: 'The approximate percentage of observations in a dataset covered within the interval $\\text{Median} \\pm \\text{Q.D.}$ is:',
    options: {
      a: '25 per cent',
      b: '50 per cent',
      c: '68.5 per cent',
      d: '95.4 per cent'
    },
    correct: 'b',
    explanation: 'In a symmetrical or moderately skewed distribution, the interval $\\text{Median} \\pm \\text{Q.D.}$ contains approximately 50% of the total observations.',
    urdu_answer: 'میڈین $\\pm$ کیو ڈی کے درمیانی وقفے میں تقریباً 50 فیصد مشاہدات موجود ہوتے ہیں۔'
  },
  {
    stem: 'Which measure of dispersion should always be employed when the Median has been adopted as the most appropriate average?',
    options: {
      a: 'Range',
      b: 'Quartile Deviation',
      c: 'Mean Deviation',
      d: 'Standard Deviation'
    },
    correct: 'b',
    explanation: 'Because Quartile Deviation is based directly on quartiles ($Q_1$ and $Q_3$) which divide observations around the Median, it is the appropriate companion measure of dispersion for the Median.',
    urdu_answer: 'جب میڈین کو مرکزی اوسط چنا جائے تو کوآرٹائل ڈیوی ایشن پھیلاؤ کا سب سے مناسب پیمانہ ہوتا ہے۔'
  },
  {
    stem: 'Which measure of dispersion is LEAST affected by extreme values / outliers in a dataset?',
    options: {
      a: 'Range',
      b: 'Quartile Deviation',
      c: 'Mean Absolute Deviation',
      d: 'Standard Deviation'
    },
    correct: 'b',
    explanation: 'Quartile Deviation focuses only on the central 50% of the observations (between $Q_1$ and $Q_3$), making it completely resistant to extreme outliers.',
    urdu_answer: 'کوآرٹائل ڈیوی ایشن ڈیٹا کے درمیانی 50 فیصد حصے پر محیط ہوتا ہے، اس لیے یہ انتہائی آؤٹ لائرز سے بالکل متاثر نہیں ہوتا۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 10.`);

// 5 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'What is Dispersion? Why do we need to calculate a measure of dispersion alongside an average?',
    correct: '<p><strong>1. Definition of Dispersion:</strong> Dispersion (or variability) measures the extent to which numerical observations in a dataset spread out, scatter, or deviate around a central average value.</p><p><strong>2. Why It Is Needed:</strong> Two entirely different datasets can share the exact same Arithmetic Mean (e.g., two schools both having a mean class size of 27.33 pupils), yet one dataset may be tightly clustered while the other is widely scattered. An average alone describes only the central location; a measure of dispersion is necessary to quantify the degree of data variability and reliability.</p>',
    explanation: 'Reference: STA301 Handouts (Lecture 10, Pages 81–82). An average without a measure of dispersion gives an incomplete description of data.',
    urdu_answer: 'پھیلاؤ (Dispersion) کی تعریف اور ضرورت: اوسط صرف درمیانی قدر بتاتی ہے۔ دو بالکل مختلف ڈیٹا سیٹس کی اوسط برابر ہو سکتی ہے مگر ان کا پھیلاؤ مختلف ہو سکتا ہے، اس لیے ڈسپرشن ناپنا ضروری ہے۔'
  },
  {
    stem: 'Differentiate between Absolute Dispersion and Relative Dispersion with examples.',
    correct: '<p><strong>1. Absolute Measure of Dispersion:</strong> Measures variability in terms of the same physical units (or squared units) as the original data (e.g., rupees, meters, kilograms). Examples include Range, Quartile Deviation, Mean Deviation, Variance, and Standard Deviation.</p><p><strong>2. Relative Measure of Dispersion:</strong> Expressed as a pure dimensionless number, ratio, coefficient, or percentage, making it independent of the units of measurement. It is used to compare variability between two or more datasets having different units or vastly different scales. Examples include Coefficient of Dispersion, Coefficient of Quartile Deviation, and Coefficient of Variation.</p>',
    explanation: 'Reference: STA301 Handouts (Lecture 10, Page 82). Absolute measures have units; relative measures are unitless coefficients/ratios.',
    urdu_answer: 'مطلق (Absolute) اور اضافی (Relative) ڈسپرشن میں فرق: مطلق پیمانوں کا وہی یونٹ ہوتا ہے جو ڈیٹا کا ہو، جبکہ اضافی پیمانے بغیر یونٹ کے تناسب ہوتے ہیں جو مختلف پیمانوں کے ڈیٹا کا موازنہ کرنے کے کام آتے ہیں۔'
  },
  {
    stem: 'Define Quartile Deviation (Semi-Interquartile Range) and state its formulas for both absolute and relative measures.',
    correct: '<p><strong>Definition:</strong> Quartile Deviation (or Semi-Interquartile Range) is defined as half of the difference between the third quartile ($Q_3$) and the first quartile ($Q_1$). It measures the spread of the central 50% of observations around the median.</p><p><strong>Formulas:</strong></p><ul><li><strong>Absolute Quartile Deviation:</strong> $$Q.D. = \\frac{Q_3 - Q_1}{2}$$</li><li><strong>Coefficient of Quartile Deviation:</strong> $$\\text{Coeff. of Q.D.} = \\frac{Q_3 - Q_1}{Q_3 + Q_1}$$</li></ul>',
    explanation: 'Reference: STA301 Handouts (Lecture 10, Pages 83–84). $Q_3 - Q_1$ is the Interquartile Range; half of it is Semi-Interquartile Range ($Q.D.$).',
    urdu_answer: 'کوآرٹائل ڈیوی ایشن کی تعریف اور فارمولا: یہ تیسرے کوآرٹائل اور پہلے کوآرٹائل کے فرق کا نصف ہوتا ہے ($Q.D. = \\frac{Q_3 - Q_1}{2}$)۔ اس کا اضافی کوایفیشینٹ $\\frac{Q_3 - Q_1}{Q_3 + Q_1}$ ہے۔'
  },
  {
    stem: 'Explain why Quartile Deviation is considered the companion measure of dispersion associated with the Median.',
    correct: '<p>In a symmetrical or moderately skewed distribution, the first quartile ($Q_1$) and third quartile ($Q_3$) are approximately equidistant from the median ($\\tilde{X}$).</p><p>Quartile Deviation can be viewed as the average distance of $Q_1$ and $Q_3$ from the median:</p><p>$$\\frac{(Q_3 - \\text{Median}) + (\\text{Median} - Q_1)}{2} = \\frac{Q_3 - Q_1}{2} = Q.D.$$</p><p>Furthermore, approximately 50% of all observations lie within the interval $\\text{Median} \\pm \\text{Q.D.}$. Therefore, whenever the Median is selected as the primary average, Quartile Deviation is the companion measure of dispersion.</p>',
    explanation: 'Reference: STA301 Handouts (Lecture 10, Page 84). Quartiles divide data at 25% and 75% around the Median (50%).',
    urdu_answer: 'کیو ڈی اور میڈین کا تعلق: ایک متوازن تقسیم میں $Q_1$ اور $Q_3$ میڈین سے مساوی فاصلے پر ہوتے ہیں۔ میڈین $\\pm$ کیو ڈی کے درمیان تقریباً 50 فیصد ڈیٹا واقع ہوتا ہے۔'
  },
  {
    stem: 'Calculate the Range and Coefficient of Dispersion for the following dataset representing daily temperature readings in $^\\circ\\text{C}$:<br/><br/>$$12, 15, 18, 22, 29, 31, 35, 40$$',
    correct: '<p><strong>Step 1: Identify Extreme Values:</strong></p><ul><li>Smallest value ($X_0$) = $12^\\circ\\text{C}$</li><li>Largest value ($X_m$) = $40^\\circ\\text{C}$</li></ul><p><strong>Step 2: Calculate Range:</strong></p>$$\\text{Range} = X_m - X_0 = 40 - 12 = 28^\\circ\\text{C}$$<p><strong>Step 3: Calculate Coefficient of Dispersion:</strong></p>$$\\text{Coeff. of Dispersion} = \\frac{X_m - X_0}{X_m + X_0} = \\frac{40 - 12}{40 + 12} = \\frac{28}{52} \\approx 0.538$$',
    explanation: 'Reference: STA301 Midterm Current Papers / Handout Lecture 10, Page 83. Smallest is 12, largest is 40.',
    urdu_answer: 'رینج = 40 - 12 = 28 سینٹی گریڈ، کوایفیشینٹ آف ڈسپرشن = 28 / 52 = 0.538۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shortQuestions.length} Short Questions for Lecture 10.`);

// 2 Long Questions (5 marks each)
const longQuestions = [
  {
    stem: `The shareholding structure of two companies X and Y gives the following quartile statistics:<br/><br/>
<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead><tr class="bg-slate-100"><th class="p-2 border">Statistic</th><th class="p-2 border">Company X</th><th class="p-2 border">Company Y</th></tr></thead>
  <tbody>
    <tr><td class="p-2 border font-medium">1st Quartile ($Q_1$)</td><td class="p-2 border">60 shares</td><td class="p-2 border">165 shares</td></tr>
    <tr><td class="p-2 border font-medium">Median ($\\tilde{X}$)</td><td class="p-2 border">185 shares</td><td class="p-2 border">185 shares</td></tr>
    <tr><td class="p-2 border font-medium">3rd Quartile ($Q_3$)</td><td class="p-2 border">270 shares</td><td class="p-2 border">210 shares</td></tr>
  </tbody>
</table>
<ol class="list-decimal pl-5 space-y-1">
  <li>Calculate the Quartile Deviation ($Q.D.$) for Company X and Company Y.</li>
  <li>Calculate the Coefficient of Quartile Deviation for both companies.</li>
  <li>Interpret which company exhibits greater concentration of shareholders around the median.</li>
</ol>`,
    correct: `<p><strong>1. Quartile Deviation Calculations:</strong></p>
<ul>
  <li><strong>Company X:</strong> $$Q.D._X = \\frac{Q_3 - Q_1}{2} = \\frac{270 - 60}{2} = \\frac{210}{2} = 105\\text{ shares}$$</li>
  <li><strong>Company Y:</strong> $$Q.D._Y = \\frac{Q_3 - Q_1}{2} = \\frac{210 - 165}{2} = \\frac{45}{2} = 22.5\\text{ shares}$$</li>
</ul>
<p><strong>2. Coefficient of Quartile Deviation Calculations:</strong></p>
<ul>
  <li><strong>Company X:</strong> $$\\text{Coeff.}_X = \\frac{Q_3 - Q_1}{Q_3 + Q_1} = \\frac{270 - 60}{270 + 60} = \\frac{210}{330} \\approx 0.636$$</li>
  <li><strong>Company Y:</strong> $$\\text{Coeff.}_Y = \\frac{Q_3 - Q_1}{Q_3 + Q_1} = \\frac{210 - 165}{210 + 165} = \\frac{45}{375} = 0.120$$</li>
</ul>
<p><strong>3. Interpretation:</strong></p>
<p>Company Y has a significantly smaller Quartile Deviation (22.5 shares) and Coefficient of Q.D. (0.120) compared to Company X (105 shares, 0.636). This indicates a strong concentration of shareholders around the median number of shares in Company Y, whereas Company X exhibits a much wider scatter and inequality in shareholdings.</p>`,
    explanation: 'Reference: STA301 Handouts (Lecture 10, Pages 84–85). Lower Quartile Deviation means higher concentration / less dispersion.',
    urdu_answer: 'کمپنی Y کا کیو ڈی 22.5 اور کوایفیشینٹ 0.120 ہے، جو کمپنی X (105 اور 0.636) کے مقابلے میں بہت کم ہے۔ لہٰذا کمپنی Y کے شیئرز میڈین کے گرد زیادہ مرکوز ہیں۔'
  },
  {
    stem: `If the first and third quartiles of a dataset are given as $Q_1 = 34.5$ and $Q_3 = 68.5$, calculate:<br/><br/>
<ol class="list-decimal pl-5 space-y-1">
  <li>Interquartile Range (IQR)</li>
  <li>Semi-Interquartile Range (Quartile Deviation)</li>
  <li>Coefficient of Quartile Deviation</li>
</ol>`,
    correct: `<p><strong>1. Interquartile Range (IQR):</strong></p>
$$\\text{IQR} = Q_3 - Q_1 = 68.5 - 34.5 = 34.0$$
<p><strong>2. Semi-Interquartile Range (Quartile Deviation):</strong></p>
$$Q.D. = \\frac{Q_3 - Q_1}{2} = \\frac{34.0}{2} = 17.0$$
<p><strong>3. Coefficient of Quartile Deviation:</strong></p>
$$\\text{Coeff. of Q.D.} = \\frac{Q_3 - Q_1}{Q_3 + Q_1} = \\frac{68.5 - 34.5}{68.5 + 34.5} = \\frac{34.0}{103.0} \\approx 0.330$$`,
    explanation: 'Reference: STA301 Grand Quiz 2020 & Handout Lecture 10, Page 84.',
    urdu_answer: 'انٹرکوآرٹائل رینج = 34.0، کوآرٹائل ڈیوی ایشن = 17.0، کوایفیشینٹ = 34.0 / 103.0 = 0.330۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longQuestions.length} Long Questions for Lecture 10.`);

// Verification count
const count = db.prepare("SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Total questions for STA301 Lecture 10 in local DB: ${count.c}`);

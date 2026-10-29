import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(sta301.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Mean Deviation, Variance, Standard Deviation, Properties & Coefficient of Variation (C.V.)')
  `).run(sta301.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`STA301 Lecture 11 already exists with ID: ${lec11.id}`);
}

const lId = lec11.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 11.`);

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

// 12 Past Paper MCQs
const mcqs = [
  {
    stem: 'The average of the absolute deviations of the observations from their mean or median is called:',
    options: {
      a: 'Range',
      b: 'Quartile Deviation',
      c: 'Mean Deviation',
      d: 'Standard Deviation'
    },
    correct: 'c',
    explanation: 'Mean Deviation (or Mean Absolute Deviation / M.D.) is defined as the arithmetic mean of numerical deviations from an average (Mean or Median) taken without regard to algebraic sign (STA301 Handouts Page 85).',
    urdu_answer: 'اوسط یا میڈین سے مطلق انحرافات (absolute deviations) کے اوسط کو مین ڈیوی ایشن کہتے ہیں۔'
  },
  {
    stem: 'Mean deviation is least / minimum when deviations are taken from:',
    options: {
      a: 'Mean',
      b: 'Mode',
      c: 'Median',
      d: 'Geometric mean'
    },
    correct: 'c',
    explanation: 'A fundamental mathematical property of Mean Deviation is that the sum of absolute deviations $\\sum |X - A|$ is minimized when $A = \\text{Median}$ (STA301 Handouts Page 85).',
    urdu_answer: 'مین ڈیوی ایشن کی قدر اس وقت کم ترین (least) ہوتی ہے جب انحرافات میڈین (Median) سے لیے جائیں۔'
  },
  {
    stem: 'Dividing mean deviation by mean (or median), we get a pure unitless number known as:',
    options: {
      a: 'Co-efficient of mean deviation',
      b: 'Co-efficient of variation',
      c: 'Co-efficient of quartile deviation',
      d: 'None of the above'
    },
    correct: 'a',
    explanation: 'The relative measure of dispersion corresponding to Mean Deviation is the Coefficient of Mean Deviation, calculated as $\\frac{\\text{M.D.}}{\\text{Mean}}$ or $\\frac{\\text{M.D.}}{\\text{Median}}$ (STA301 Handouts Page 85).',
    urdu_answer: 'مین ڈیوی ایشن کو اوسط پر تقسیم کرنے سے خالص بے اکائی عدد ملتا ہے جسے کوایفیشنٹ آف مین ڈیوی ایشن کہتے ہیں۔'
  },
  {
    stem: 'Adding all the squared deviations taken from mean and dividing by the number of observations, we get:',
    options: {
      a: 'Standard Deviation',
      b: 'Variance',
      c: 'Mean Deviation',
      d: 'None of the above'
    },
    correct: 'b',
    explanation: 'Variance ($S^2$) is mathematically defined as the arithmetic mean of the squared deviations of values from their arithmetic mean: $S^2 = \\frac{\\sum (X - \\bar{X})^2}{n}$ (STA301 Handouts Page 85).',
    urdu_answer: 'مین سے لیے گئے انحرافات کے مربعات کے اوسط کو ویرینس (Variance) کہتے ہیں۔'
  },
  {
    stem: 'Variance is expressed in ________ units as the units of data set.',
    options: {
      a: 'Same',
      b: 'Squared / Square',
      c: 'Single',
      d: 'Cube'
    },
    correct: 'b',
    explanation: 'Because deviations are squared prior to averaging, Variance is always expressed in squared units of measurement (e.g., $\\text{kg}^2$, $\\text{meters}^2$) (STA301 Handouts Page 85).',
    urdu_answer: 'ویرینس ہمیشہ ڈیٹا سیٹ کی اکائیوں کے مربع (square units) میں ظاہر کی جاتی ہے۔'
  },
  {
    stem: 'The positive square root of the variance of a distribution is called:',
    options: {
      a: 'Range',
      b: 'Quartile deviation',
      c: 'Standard deviation',
      d: 'Mean deviation'
    },
    correct: 'c',
    explanation: 'Standard Deviation ($S$ or $\\sigma$) is defined as the positive square root of variance: $S = \\sqrt{\\text{Variance}}$, restoring dispersion back to the original physical units (STA301 Handouts Page 86).',
    urdu_answer: 'ویرینس کا مثبت جزر المربع (positive square root) سٹینڈرڈ ڈیوی ایشن کہلاتا ہے۔'
  },
  {
    stem: 'The descriptive measure of dispersion that is calculated from all observed values and based on the concept of a deviation about the mean is:',
    options: {
      a: 'Range',
      b: 'Inter quartile range',
      c: 'Quartile deviation',
      d: 'Standard deviation'
    },
    correct: 'd',
    explanation: 'Unlike Range and Quartile Deviation which only evaluate extreme or quartile points, Standard Deviation takes into account every single observation in the dataset (STA301 Handouts Page 86).',
    urdu_answer: 'سٹینڈرڈ ڈیوی ایشن تمام مشاہدات پر مبنی ہوتی ہے اور اوسط کے گرد انحراف کے تصور کو استعمال کرتی ہے۔'
  },
  {
    stem: 'What is the standard deviation of the following constant values: 7, 7, 7, 7, 7, 7, 7?',
    options: {
      a: '7',
      b: '1',
      c: '49',
      d: '0'
    },
    correct: 'd',
    explanation: 'When all observations in a dataset are identical constants ($X = c$), each deviation $(X - \\bar{X}) = 0$, so both Variance and Standard Deviation are identically zero ($S = 0$) (STA301 Handouts Page 87).',
    urdu_answer: 'اگر کسی ڈیٹا سیٹ کی تمام اقدار برابر ہوں تو سٹینڈرڈ ڈیوی ایشن ہمیشہ صفر (0) ہوتی ہے۔'
  },
  {
    stem: 'Standard deviation divided by mean ($S / \\bar{X}$) is known as:',
    options: {
      a: 'Co-efficient of standard deviation',
      b: 'Co-efficient of variation',
      c: 'Both',
      d: 'None'
    },
    correct: 'a',
    explanation: 'The ratio $\\frac{S}{\\bar{X}}$ is the Coefficient of Standard Deviation. When multiplied by 100, it is called the Coefficient of Variation (C.V.) (STA301 Handouts Page 88).',
    urdu_answer: 'سٹینڈرڈ ڈیوی ایشن کو اوسط پر تقسیم کرنے سے کوایفیشنٹ آف سٹینڈرڈ ڈیوی ایشن حاصل ہوتا ہے۔'
  },
  {
    stem: 'Which measure of dispersion is used to compare variation / consistency between two series?',
    options: {
      a: 'C.V. (Coefficient of Variation)',
      b: 'Q.D. (Quartile Deviation)',
      c: 'M.D. (Mean Deviation)',
      d: 'S.D. (Standard Deviation)'
    },
    correct: 'a',
    explanation: 'The Coefficient of Variation ($C.V. = \\frac{S}{\\bar{X}} \\times 100\\%$) is a relative, dimensionless measure used to compare the variability or consistency of datasets with different units or disparate means (STA301 Handouts Page 88).',
    urdu_answer: 'دو مختلف سیریز کے درمیان تغیر پذیری یا تسلسل کا موازنہ کرنے کے لیے کوایفیشنٹ آف ویری ایشن (C.V.) استعمال ہوتا ہے۔'
  },
  {
    stem: 'When Mean is 25 and S.D. is 5, then the Coefficient of Variation (C.V.) is:',
    options: {
      a: '100%',
      b: '25%',
      c: '20%',
      d: '10%'
    },
    correct: 'c',
    explanation: '$$\\text{C.V.} = \\frac{S}{\\bar{X}} \\times 100 = \\frac{5}{25} \\times 100 = 20\\%$$',
    urdu_answer: 'سی وی کا فارمولا (5 تقسیم 25 ضرب 100) = 20 فیصد ہے۔'
  },
  {
    stem: 'If Mean $\\bar{X} = 0.645$ and Variance $S^2 = 0.215$, then the Coefficient of Variation is approximately:',
    options: {
      a: '0.4637',
      b: '71.89%',
      c: '1.3910',
      d: '0.215'
    },
    correct: 'b',
    explanation: 'First compute $S = \\sqrt{0.215} \\approx 0.4637$. Then $\\text{C.V.} = \\frac{0.4637}{0.645} \\times 100 \\approx 71.89\\%$.',
    urdu_answer: 'پہلے ویرینس کا جزر لے کر S = 0.4637 حاصل ہوگا، پھر (0.4637 / 0.645) * 100 = 71.89%۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 11.`);

// 5 Short Questions
const shorts = [
  {
    stem: 'Write the mathematical formulas for Mean Deviation for ungrouped (raw) data and grouped continuous frequency distributions.',
    correct: `<p><strong>Formulas for Mean Deviation (M.D.) (STA301 Lesson 11):</strong></p>
<ol class="list-decimal pl-5 space-y-2">
  <li>
    <strong>Ungrouped (Raw) Data:</strong>
    <p>Around Arithmetic Mean: $$M.D.(\\bar{X}) = \\frac{\\sum |X - \\bar{X}|}{n}$$</p>
    <p>Around Median: $$M.D.(\\tilde{X}) = \\frac{\\sum |X - \\tilde{X}|}{n}$$</p>
  </li>
  <li>
    <strong>Grouped Continuous Frequency Distribution:</strong>
    <p>$$M.D. = \\frac{\\sum f |X - \\bar{X}|}{\\sum f} = \\frac{\\sum f |X - \\bar{X}|}{n}$$</p>
    <p class="text-xs text-slate-500">where $X$ represents class midpoints and $f$ denotes corresponding class frequencies.</p>
  </li>
</ol>`,
    explanation: 'Mean deviation averages absolute differences from an average without regard to sign.',
    urdu_answer: 'غیر گروہی ڈیٹا کے لیے فارمولا $\\frac{\\sum |X - \\bar{X}|}{n}$ ہے جبکہ گروہی فریکوئنسی ڈیٹا کے لیے $\\frac{\\sum f |X - \\bar{X}|}{\\sum f}$ ہے۔'
  },
  {
    stem: 'Why do we need and use the Coefficient of Variation (C.V.) in practical statistical analysis?',
    correct: `<p><strong>Practical Purpose of Coefficient of Variation (C.V.) (STA301 Lesson 11):</strong></p>
<ul>
  <li><strong>Elimination of Measurement Units:</strong> Standard Deviation is an absolute measure expressed in original units (e.g., kg, inches, Rupees). When comparing datasets measured in different physical units (e.g., comparing weight variability vs. height variability), absolute standard deviations cannot be directly compared.</li>
  <li><strong>Adjustment for Different Magnitudes of Averages:</strong> Even with identical units, a group with a much larger mean naturally tends to have a larger standard deviation. The C.V. divides $S$ by $\\bar{X}$, standardizing variation as a relative percentage:
  $$\\text{C.V.} = \\frac{S}{\\bar{X}} \\times 100\\%$$</li>
  <li><strong>Assessing Consistency / Stability:</strong> A series with a smaller C.V. is considered <strong>more consistent, uniform, or stable</strong>, whereas a series with a larger C.V. exhibits greater relative variability.</li>
</ul>`,
    explanation: 'Coefficient of Variation provides a dimensionless relative percentage to compare variability between groups with different units or different mean values.',
    urdu_answer: 'کوایفیشنٹ آف ویری ایشن پیمائش کی اکائیوں کو ختم کر کے فیصد میں تغیر ظاہر کرتا ہے تاکہ مختلف اوسط یا مختلف اکائیوں والے ڈیٹا سیٹس کا درست موازنہ کیا جا سکے۔'
  },
  {
    stem: 'Differentiate between Variance and Standard Deviation with respect to definition, formula, and units of measurement.',
    correct: `<p><strong>Comparison: Variance vs. Standard Deviation (STA301 Lesson 11):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Attribute</th>
      <th class="p-2 border">Variance ($S^2$ / $\\sigma^2$)</th>
      <th class="p-2 border">Standard Deviation ($S$ / $\\sigma$)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Definition</td>
      <td class="p-2 border">The arithmetic mean of the squared deviations of values from their mean.</td>
      <td class="p-2 border">The positive square root of the variance.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Mathematical Formula</td>
      <td class="p-2 border">$$S^2 = \\frac{\\sum (X - \\bar{X})^2}{n}$$</td>
      <td class="p-2 border">$$S = \\sqrt{\\frac{\\sum (X - \\bar{X})^2}{n}}$$</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Unit of Measurement</td>
      <td class="p-2 border">Expressed in <strong>squared units</strong> of the original data (e.g., $\\text{kg}^2$, $\\text{Rs}^2$).</td>
      <td class="p-2 border">Expressed in the <strong>same physical units</strong> as the original data (e.g., $\\text{kg}$, $\\text{Rs}$).</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Variance is measured in squared units, while Standard Deviation is the positive square root that restores dispersion back to the original physical units.',
    urdu_answer: 'ویرینس انحرافات کے مربعات کی اوسط ہے اور مربع اکائیوں میں ہوتی ہے، جبکہ سٹینڈرڈ ڈیوی ایشن اس کا مثبت جزر ہے اور اصل اکائیوں میں ہوتی ہے۔'
  },
  {
    stem: 'What is the primary mathematical drawback / limitation of Mean Deviation?',
    correct: `<p><strong>Primary Mathematical Drawback of Mean Deviation (STA301 Lesson 11):</strong></p>
<p>In computing Mean Deviation, algebraic signs of deviations are arbitrarily dropped by applying absolute value brackets ($|X - \\bar{X}|$).</p>
<ul>
  <li><strong>Artificial Mathematical Manipulation:</strong> Ignoring signs lacks algebraic justification and violates regular algebraic operational rules.</li>
  <li><strong>Inability to Perform Further Advanced Algebraic Treatment:</strong> Because absolute value functions are not differentiable at zero, Mean Deviation cannot be combined across samples or used in advanced inferential statistics, sampling theory, or hypothesis testing (unlike Variance and Standard Deviation).</li>
</ul>`,
    explanation: 'Discarding negative signs through absolute values prevents further mathematical analysis and algebraic manipulation.',
    urdu_answer: 'مین ڈیوی ایشن کی سب سے بڑی خامی یہ ہے کہ اس میں الجبرائی علامتوں کو نظر انداز کیا جاتا ہے جس کی وجہ سے یہ مزید اعلیٰ الجبرائی اور شماریاتی حسابات کے لیے موزوں نہیں رہتی۔'
  },
  {
    stem: 'If Mean $\\bar{X} = 0.645$ and Variance $S^2 = 0.215$, calculate the Coefficient of Variation (C.V.).',
    correct: `<p><strong>Step-by-Step Calculation:</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li>
    <strong>Calculate Standard Deviation ($S$):</strong>
    $$S = \\sqrt{S^2} = \\sqrt{0.215} \\approx \\mathbf{0.4637}$$
  </li>
  <li>
    <strong>Calculate Coefficient of Variation ($\\text{C.V.}$):</strong>
    $$\\text{C.V.} = \\frac{S}{\\bar{X}} \\times 100$$
    $$\\text{C.V.} = \\frac{0.4637}{0.645} \\times 100 \\approx \\mathbf{71.89\\%}$$
  </li>
</ol>
<p><strong>Final Answer:</strong> $\\text{C.V.} \\approx \\mathbf{71.89\\%}$</p>`,
    explanation: 'Standard deviation is obtained by taking the square root of variance, and C.V. is computed by dividing S by the mean and multiplying by 100.',
    urdu_answer: 'پہلے ویرینس 0.215 کا جزر لے کر S = 0.4637 حاصل کیا گیا، پھر اوسط 0.645 پر تقسیم کر کے 100 سے ضرب دینے پر 71.89 فیصد جواب ملا۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 11.`);

// 2 Long Questions
const longs = [
  {
    stem: 'For the raw dataset $X = 34, 70, 42, 54, 40, 68, 56, 38, 36, 72$: (a) Calculate Arithmetic Mean ($\\bar{X}$), (b) Calculate Mean Deviation from Mean ($M.D.$), and (c) Calculate Variance ($S^2$) and Standard Deviation ($S$).',
    correct: `<p><strong>Step 1: Compute Arithmetic Mean ($\\bar{X}$):</strong></p>
$$\\sum X = 34 + 70 + 42 + 54 + 40 + 68 + 56 + 38 + 36 + 72 = 510, \\quad n = 10$$
$$\\bar{X} = \\frac{\\sum X}{n} = \\frac{510}{10} = \\mathbf{51}$$

<p><strong>Step 2: Construct Computation Table:</strong></p>
<table class="border border-slate-300 w-full text-xs text-center mb-3">
  <thead class="bg-slate-100 font-bold">
    <tr>
      <th class="p-1.5 border">Observation ($X$)</th>
      <th class="p-1.5 border">Deviation ($X - \\bar{X}$)</th>
      <th class="p-1.5 border">Absolute Deviation ($|X - \\bar{X}|$)</th>
      <th class="p-1.5 border">Squared Deviation ($(X - \\bar{X})^2$)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="p-1 border">34</td><td class="p-1 border">-17</td><td class="p-1 border">17</td><td class="p-1 border">289</td></tr>
    <tr><td class="p-1 border">70</td><td class="p-1 border">+19</td><td class="p-1 border">19</td><td class="p-1 border">361</td></tr>
    <tr><td class="p-1 border">42</td><td class="p-1 border">-9</td><td class="p-1 border">9</td><td class="p-1 border">81</td></tr>
    <tr><td class="p-1 border">54</td><td class="p-1 border">+3</td><td class="p-1 border">3</td><td class="p-1 border">9</td></tr>
    <tr><td class="p-1 border">40</td><td class="p-1 border">-11</td><td class="p-1 border">11</td><td class="p-1 border">121</td></tr>
    <tr><td class="p-1 border">68</td><td class="p-1 border">+17</td><td class="p-1 border">17</td><td class="p-1 border">289</td></tr>
    <tr><td class="p-1 border">56</td><td class="p-1 border">+5</td><td class="p-1 border">5</td><td class="p-1 border">25</td></tr>
    <tr><td class="p-1 border">38</td><td class="p-1 border">-13</td><td class="p-1 border">13</td><td class="p-1 border">169</td></tr>
    <tr><td class="p-1 border">36</td><td class="p-1 border">-15</td><td class="p-1 border">15</td><td class="p-1 border">225</td></tr>
    <tr><td class="p-1 border">72</td><td class="p-1 border">+21</td><td class="p-1 border">21</td><td class="p-1 border">441</td></tr>
    <tr class="font-bold bg-slate-50"><td class="p-1 border">Total</td><td class="p-1 border">0</td><td class="p-1 border">$\\sum |X - \\bar{X}| = 110$</td><td class="p-1 border">$\\sum (X - \\bar{X})^2 = 2010$</td></tr>
  </tbody>
</table>

<p><strong>Step 3: Calculate Mean Deviation ($M.D.$):</strong></p>
$$M.D. = \\frac{\\sum |X - \\bar{X}|}{n} = \\frac{110}{10} = \\mathbf{11}$$

<p><strong>Step 4: Calculate Variance ($S^2$) and Standard Deviation ($S$):</strong></p>
$$\\text{Variance } (S^2) = \\frac{\\sum (X - \\bar{X})^2}{n} = \\frac{2010}{10} = \\mathbf{201}$$
$$\\text{Standard Deviation } (S) = \\sqrt{201} \\approx \\mathbf{14.18}$$`,
    explanation: 'Complete manual statistical calculation showing table of deviations, sum of absolute deviations, and sum of squared deviations.',
    urdu_answer: '10 مشاہدات کے لیے اوسط 51 نکلی، مین ڈیوی ایشن 11، ویرینس 201 اور سٹینڈرڈ ڈیوی ایشن 14.18 حاصل ہوئی۔'
  },
  {
    stem: 'Find the Arithmetic Mean, Standard Deviation, and Coefficient of Variation ($\\text{C.V.}$) for the following commodity price dataset: $X = 59, 75, 27, 63, 27, 28, 56$.',
    correct: `<p><strong>Step 1: Compute Arithmetic Mean ($\\bar{X}$):</strong></p>
$$\\sum X = 59 + 75 + 27 + 63 + 27 + 28 + 56 = 335, \\quad n = 7$$
$$\\bar{X} = \\frac{\\sum X}{n} = \\frac{335}{7} \\approx \\mathbf{47.86}$$

<p><strong>Step 2: Compute Sum of Squares ($\\sum X^2$):</strong></p>
$$\\sum X^2 = 59^2 + 75^2 + 27^2 + 63^2 + 27^2 + 28^2 + 56^2$$
$$\\sum X^2 = 3481 + 5625 + 729 + 3969 + 729 + 784 + 3136 = \\mathbf{18453}$$

<p><strong>Step 3: Compute Standard Deviation ($S$):</strong></p>
$$S = \\sqrt{\\frac{\\sum X^2}{n} - \\left(\\frac{\\sum X}{n}\\right)^2}$$
$$S = \\sqrt{\\frac{18453}{7} - (47.86)^2} = \\sqrt{2636.14 - 2290.58} = \\sqrt{345.56} \\approx \\mathbf{18.59}$$

<p><strong>Step 4: Compute Coefficient of Variation ($\\text{C.V.}$):</strong></p>
$$\\text{C.V.} = \\frac{S}{\\bar{X}} \\times 100 = \\frac{18.59}{47.86} \\times 100 \\approx \\mathbf{38.84\\%}$$`,
    explanation: 'Standard deviation calculated using raw sum of squares formula, and C.V. calculated as relative percentage.',
    urdu_answer: 'سات مشاہدات کی اوسط 47.86، سٹینڈرڈ ڈیوی ایشن 18.59 اور کوایفیشنٹ آف ویری ایشن 38.84 فیصد نکلی۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 11.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for STA301 Lecture 11.`);

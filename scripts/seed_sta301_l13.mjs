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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(sta301.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Box-and-Whisker Plot, Concept of Skewness & Pearson Coefficient of Skewness')
  `).run(sta301.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`STA301 Lecture 13 already exists with ID: ${lec13.id}`);
}

const lId = lec13.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 13.`);

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

// 10 Past Paper MCQs
const mcqs = [
  {
    stem: 'The deviation of a frequency distribution from symmetry is called: / The lack of symmetry in a distribution is known as:',
    options: {
      a: 'Kurtosis',
      b: 'Skewness',
      c: 'Dispersion',
      d: 'Variance'
    },
    correct: 'b',
    explanation: 'Skewness literally denotes the asymmetry, lopsidedness, or departure from symmetry in a frequency distribution (STA301 Handouts Page 101).',
    urdu_answer: 'فریکوئنسی تقسیم کا تناسب سے ہٹ جانا یا تناسب کی کمی سکیونس (Skewness) کہلاتی ہے۔'
  },
  {
    stem: 'For a positively skewed distribution, which of the following relationships exists among Mean, Median, and Mode?',
    options: {
      a: '$\\text{Mean} = \\text{Median} = \\text{Mode}$',
      b: '$\\text{Mean} > \\text{Median} > \\text{Mode}$',
      c: '$\\text{Mean} < \\text{Median} < \\text{Mode}$',
      d: '$\\text{Median} > \\text{Mode} > \\text{Mean}$'
    },
    correct: 'b',
    explanation: 'In a positively skewed (right-skewed) distribution, extreme high values pull the Mean to the right, establishing the order: $\\text{Mean} > \\text{Median} > \\text{Mode}$ (STA301 Handouts Page 108).',
    urdu_answer: 'پوزیٹیولی سکیوڈ تقسیم میں اوسط سب سے بڑی ہوتی ہے: $\\text{Mean} > \\text{Median} > \\text{Mode}$۔'
  },
  {
    stem: 'If a frequency curve has a longer tail extending to the right, it is called a:',
    options: {
      a: 'Negatively skewed distribution',
      b: 'Positively skewed distribution',
      c: 'Symmetrical distribution',
      d: 'J-shaped distribution'
    },
    correct: 'b',
    explanation: 'A distribution whose tail trails off more slowly toward the high positive values on the right is termed positively skewed or right-skewed (STA301 Handouts Page 108).',
    urdu_answer: 'اگر فریکوئنسی منحنی کی دم دائیں طرف زیادہ لمبی ہو تو اسے پوزیٹیولی سکیوڈ تقسیم کہتے ہیں۔'
  },
  {
    stem: 'In a perfectly symmetrical distribution, which relationship holds true?',
    options: {
      a: '$\\text{Mean} = \\text{Median} = \\text{Mode}$',
      b: '$\\text{Mean} > \\text{Median} > \\text{Mode}$',
      c: '$\\text{Mean} < \\text{Median} < \\text{Mode}$',
      d: '$\\text{Mean} \\ne \\text{Median} \\ne \\text{Mode}$'
    },
    correct: 'a',
    explanation: 'In a unimodal, perfectly symmetric distribution, the center, median cutoff, and peak coincide at the identical central value: $\\text{Mean} = \\text{Median} = \\text{Mode}$ (STA301 Handouts Page 108).',
    urdu_answer: 'مکمل طور پر متناسب (symmetrical) تقسیم میں اوسط، میڈین اور موڈ تینوں برابر ہوتے ہیں۔'
  },
  {
    stem: 'Pearson’s coefficient of skewness is impossible to calculate if the standard deviation ($S$) is:',
    options: {
      a: '1',
      b: '1.5',
      c: '0',
      d: '3'
    },
    correct: 'c',
    explanation: "Pearson's formula divides by $S$. When $S = 0$ (all data values are identical constants), division by zero occurs, rendering the coefficient mathematically undefined (STA301 Handouts Page 108).",
    urdu_answer: 'اگر سٹینڈرڈ ڈیوی ایشن صفر (0) ہو تو پیئرسن کا سکیونس کوایفیشنٹ معلوم نہیں کیا جا سکتا کیونکہ صفر پر تقسیم ناممکن ہے۔'
  },
  {
    stem: 'Pearson’s modified coefficient of skewness expressed using the median is given by:',
    options: {
      a: '$\\frac{\\text{Mean} - \\text{Mode}}{S}$',
      b: '$\\frac{3(\\text{Mean} - \\text{Median})}{S}$',
      c: '$\\frac{\\text{Mean} - \\text{Median}}{S}$',
      d: '$\\frac{3(\\text{Median} - \\text{Mean})}{S}$'
    },
    correct: 'b',
    explanation: "Using the empirical relation $\\text{Mean} - \\text{Mode} \\approx 3(\\text{Mean} - \\text{Median})$, Pearson's second coefficient of skewness is defined as $SK_2 = \\frac{3(\\bar{X} - \\tilde{X})}{S}$ (STA301 Handouts Page 108).",
    urdu_answer: 'میڈین پر مبنی پیئرسن کا فارمولا $\\frac{3(\\text{Mean} - \\text{Median})}{S}$ ہے۔'
  },
  {
    stem: 'In a horizontal Box-and-Whisker plot, the right edge of the box represents the:',
    options: {
      a: 'First quartile ($Q_1$)',
      b: 'Second quartile ($Q_2$)',
      c: 'Third quartile ($Q_3$)',
      d: 'Maximum value ($X_m$)'
    },
    correct: 'c',
    explanation: 'In a horizontal boxplot, the left boundary of the box is $Q_1$, the vertical line inside is the Median ($Q_2$), and the right boundary is the Third Quartile ($Q_3$) (STA301 Handouts Page 101).',
    urdu_answer: 'باکس اینڈ وہسکر پلاٹ میں باکس کا دایاں کنارہ تیسرے کوارٹائل ($Q_3$) کو ظاہر کرتا ہے۔'
  },
  {
    stem: 'In a Box-and-Whisker plot, if the median line is closer to the left end of the box ($Q_1$), the distribution is:',
    options: {
      a: 'Symmetrical',
      b: 'Skewed to the right (positively skewed)',
      c: 'Skewed to the left (negatively skewed)',
      d: 'U-shaped'
    },
    correct: 'b',
    explanation: 'When the median line is located closer to $Q_1$, the upper 25% of the central data is more stretched out, indicating positive skewness (right-skewed) (STA301 Handouts Page 101).',
    urdu_answer: 'اگر میڈین لائن باکس کے بائیں کنارے ($Q_1$) کے قریب ہو تو ڈیٹا دائیں جانب جھکا ہوا (positively skewed) ہوتا ہے۔'
  },
  {
    stem: 'In a Box-and-Whisker plot of a perfectly symmetrical distribution, which of the following is true?',
    options: {
      a: 'The median line is exactly halfway between the two ends of the box',
      b: 'Both whiskers are of equal length',
      c: '$Q_3 - \\text{Median} = \\text{Median} - Q_1$',
      d: 'All of the above'
    },
    correct: 'd',
    explanation: 'In a symmetric distribution, the box and whiskers are balanced: median divides the box into equal halves, whiskers are equidistant, and quartile spreads are identical (STA301 Handouts Page 101).',
    urdu_answer: 'متناسب ڈیٹا کے باکس پلاٹ میں میڈین لائن بالکل درمیان میں ہوتی ہے، دونوں وہسکرز برابر ہوتے ہیں اور کوارٹائلز کا فاصلہ یکساں ہوتا ہے۔'
  },
  {
    stem: 'For a symmetrical distribution, Pearson’s coefficient of skewness is always equal to:',
    options: {
      a: 'Greater than 1',
      b: 'Less than 0',
      c: 'Zero',
      d: '1'
    },
    correct: 'c',
    explanation: 'Since $\\text{Mean} = \\text{Mode} = \\text{Median}$ in a symmetrical distribution, $\\bar{X} - \\text{Mode} = 0$, yielding a Pearson skewness coefficient of exactly 0 (STA301 Handouts Page 108).',
    urdu_answer: 'متناسب تقسیم کے لیے پیئرسن کا سکیونس کوایفیشنٹ ہمیشہ صفر (0) کے برابر ہوتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 13.`);

// 5 Short Questions
const shorts = [
  {
    stem: 'Define Skewness. Differentiate between Positively Skewed and Negatively Skewed distributions.',
    correct: `<p><strong>1. Definition of Skewness (STA301 Lesson 13):</strong></p>
<p>Skewness refers to the lack of symmetry or departure from symmetry in a frequency distribution curve. It indicates whether observations cluster on one side of the distribution with a long tail stretching to the other.</p>

<p><strong>2. Distinction between Types of Skewness:</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100 font-bold">
    <tr>
      <th class="p-2 border">Characteristic</th>
      <th class="p-2 border">Positively Skewed (Right-Skewed)</th>
      <th class="p-2 border">Negatively Skewed (Left-Skewed)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Tail Direction</td>
      <td class="p-2 border">Longer tail extends toward the higher values on the <strong>right</strong>.</td>
      <td class="p-2 border">Longer tail extends toward the lower values on the <strong>left</strong>.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Mean-Median-Mode Relationship</td>
      <td class="p-2 border">$$\\text{Mean} > \\text{Median} > \\text{Mode}$$</td>
      <td class="p-2 border">$$\\text{Mean} < \\text{Median} < \\text{Mode}$$</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Sign of Skewness Coefficient</td>
      <td class="p-2 border">Positive ($SK > 0$)</td>
      <td class="p-2 border">Negative ($SK < 0$)</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Positively skewed distributions have tails to the right with Mean > Median > Mode; negatively skewed distributions have tails to the left with Mean < Median < Mode.',
    urdu_answer: 'پوزیٹیولی سکیوڈ تقسیم کی دم دائیں طرف لمبی ہوتی ہے اور Mean > Median > Mode ہوتا ہے، جبکہ نیگیٹیولی سکیوڈ تقسیم کی دم بائیں طرف لمبی ہوتی ہے اور Mean < Median < Mode ہوتا ہے۔'
  },
  {
    stem: "State the formulas for Pearson's Coefficient of Skewness (both modal and median-based). What condition must the standard deviation satisfy?",
    correct: `<p><strong>Pearson's Coefficients of Skewness (STA301 Lesson 13):</strong></p>
<ol class="list-decimal pl-5 space-y-2">
  <li>
    <strong>First / Modal Coefficient ($SK_1$):</strong>
    $$\\text{Pearson's } SK_1 = \\frac{\\text{Mean} - \\text{Mode}}{S}$$
    <p class="text-xs text-slate-500">Used when a clear, well-defined single Mode exists in the distribution.</p>
  </li>
  <li>
    <strong>Second / Median-based Coefficient ($SK_2$):</strong>
    $$\\text{Pearson's } SK_2 = \\frac{3(\\text{Mean} - \\text{Median})}{S}$$
    <p class="text-xs text-slate-500">Derived from Karl Pearson's empirical approximation $\\text{Mean} - \\text{Mode} \\approx 3(\\text{Mean} - \\text{Median})$; preferred when Mode is ill-defined or multimodal.</p>
  </li>
</ol>
<p><strong>Mandatory Condition:</strong> The Standard Deviation must be strictly greater than zero ($S > 0$). If $S = 0$, all observations are identical constants and Pearson's skewness cannot be computed.</p>`,
    explanation: "Pearson's first coefficient uses mode while the second uses median, both requiring non-zero standard deviation.",
    urdu_answer: 'پہلا فارمولا $\\frac{\\text{Mean} - \\text{Mode}}{S}$ ہے اور دوسرا $\\frac{3(\\text{Mean} - \\text{Median})}{S}$ ہے، جس کے لیے سٹینڈرڈ ڈیوی ایشن کا صفر سے بڑا ہونا لازمی ہے۔'
  },
  {
    stem: 'What is a Box-and-Whisker Plot? Enlist the five key summary statistics used to construct it.',
    correct: `<p><strong>1. Definition of Box-and-Whisker Plot (STA301 Lesson 13):</strong></p>
<p>A Box-and-Whisker Plot (or Boxplot) is an exploratory graphical display introduced by John Tukey that visualizes the center (median), dispersion (interquartile range and overall range), and skewness of a dataset simultaneously.</p>

<p><strong>2. The Five Key Summary Statistics:</strong></p>
<ol class="list-decimal pl-5 space-y-1">
  <li><strong>Minimum Observation ($X_0$):</strong> Lowest observed value in dataset (end of left whisker).</li>
  <li><strong>First Quartile ($Q_1$):</strong> 25th percentile (left boundary of the box).</li>
  <li><strong>Median ($\\tilde{X}$ / $Q_2$):</strong> 50th percentile (vertical line dividing the box).</li>
  <li><strong>Third Quartile ($Q_3$):</strong> 75th percentile (right boundary of the box).</li>
  <li><strong>Maximum Observation ($X_m$):</strong> Highest observed value in dataset (end of right whisker).</li>
</ol>`,
    explanation: 'The boxplot visually portrays the five-number summary: minimum, Q1, median, Q3, and maximum.',
    urdu_answer: 'باکس اینڈ وہسکر پلاٹ ڈیٹا کے مرکز، پھیلاؤ اور سکیونس کو فائیو نمبر سمری (کم ترین، Q1، میڈین، Q3، زیادہ سے زیادہ) کے ذریعے تصویری شکل میں ظاہر کرتا ہے۔'
  },
  {
    stem: 'How can you determine whether a distribution is right-skewed, left-skewed, or symmetric using a Box-and-Whisker plot?',
    correct: `<p><strong>Determining Distribution Shape from a Box-and-Whisker Plot (STA301 Lesson 13):</strong></p>
<ul>
  <li>
    <strong>Symmetric Distribution:</strong>
    The median line is located precisely in the <strong>center</strong> of the box ($Q_3 - \\tilde{X} = \\tilde{X} - Q_1$), and both the left and right whiskers are approximately <strong>equal in length</strong> ($X_m - Q_3 \\approx Q_1 - X_0$).
  </li>
  <li>
    <strong>Positively Skewed (Right-Skewed):</strong>
    The median line is closer to the <strong>left edge</strong> ($Q_1$) of the box, and the <strong>right whisker is significantly longer</strong> than the left whisker ($X_m - Q_3 > Q_1 - X_0$).
  </li>
  <li>
    <strong>Negatively Skewed (Left-Skewed):</strong>
    The median line is closer to the <strong>right edge</strong> ($Q_3$) of the box, and the <strong>left whisker is significantly longer</strong> than the right whisker ($Q_1 - X_0 > X_m - Q_3$).
  </li>
</ul>`,
    explanation: 'Inspection of median line offset within the box and comparative length of the whiskers indicates the skewness direction.',
    urdu_answer: 'اگر میڈین بائیں کنارے کے قریب اور دایاں وہسکر لمبا ہو تو پوزیٹیو سکیونس؛ اگر میڈین دائیں کنارے کے قریب اور بایاں وہسکر لمبا ہو تو نیگیٹیو سکیونس؛ اور اگر دونوں برابر ہوں تو متناسب ہے۔'
  },
  {
    stem: "For a given dataset, Mean = 3.8, Median = 2.3, and Standard Deviation = 1.3. Calculate Pearson's Coefficient of Skewness and state the nature of skewness.",
    correct: `<p><strong>Step-by-Step Calculation (STA301 Lesson 13):</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li>
    <strong>State the Formula:</strong>
    $$\\text{Pearson's } SK = \\frac{3(\\text{Mean} - \\text{Median})}{S}$$
  </li>
  <li>
    <strong>Substitute Given Values:</strong>
    $$\\text{Mean} = 3.8, \\quad \\text{Median} = 2.3, \\quad S = 1.3$$
    $$\\text{Pearson's } SK = \\frac{3(3.8 - 2.3)}{1.3} = \\frac{3(1.5)}{1.3} = \\frac{4.5}{1.3} \\approx \\mathbf{3.46}$$
  </li>
  <li>
    <strong>Interpretation:</strong>
    Since the resulting coefficient is positive ($SK = +3.46 > 0$), the distribution is <strong>positively skewed (skewed to the right)</strong>.
  </li>
</ol>`,
    explanation: "Using Pearson's median-based formula yields +3.46, indicating positive skewness.",
    urdu_answer: 'فارمولے 3(Mean - Median) / S میں قیمتیں رکھنے سے جواب +3.46 آیا جو ظاہر کرتا ہے کہ تقسیم پوزیٹیولی سکیوڈ ہے۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 13.`);

// 2 Long Questions
const longs = [
  {
    stem: 'Given the Five-Number Summary of a machine downtime dataset: $X_0 = 1.0\\text{ hour}$, $Q_1 = 4.0\\text{ hours}$, $\\text{Median} = 5.0\\text{ hours}$, $Q_3 = 8.25\\text{ hours}$, and $X_m = 13.0\\text{ hours}$: (a) Describe how to construct the Box-and-Whisker plot, (b) Determine the spread of the central 50% of observations, and (c) Analyze the position of the median line and whisker lengths to determine the skewness of the distribution.',
    correct: `<p><strong>1. Construction of the Box-and-Whisker Plot (STA301 Lesson 13):</strong></p>
<ul>
  <li><strong>Horizontal Scale:</strong> Draw a horizontal axis spanning from $0$ to $14$ hours to accommodate the full range $[X_0, X_m] = [1.0, 13.0]$.</li>
  <li><strong>Box Boundaries:</strong> Draw a rectangular box starting at the First Quartile $Q_1 = 4.0$ and terminating at the Third Quartile $Q_3 = 8.25$.</li>
  <li><strong>Median Line:</strong> Draw a vertical line inside the box at the Median position $\\tilde{X} = 5.0$.</li>
  <li><strong>Left Whisker:</strong> Draw a horizontal dashed line extending from the left edge of the box ($Q_1 = 4.0$) down to the Minimum observation $X_0 = 1.0$.</li>
  <li><strong>Right Whisker:</strong> Draw a horizontal dashed line extending from the right edge of the box ($Q_3 = 8.25$) up to the Maximum observation $X_m = 13.0$.</li>
</ul>

<p><strong>2. Spread of the Central 50% of Observations:</strong></p>
<p>The central 50% of the distribution lies within the Interquartile Range ($\\text{IQR}$):</p>
$$\\text{IQR} = Q_3 - Q_1 = 8.25 - 4.0 = \\mathbf{4.25\\text{ hours}}$$
<p>Thus, the central 50% of downtime durations are concentrated between <strong>4.00 and 8.25 hours</strong>.</p>

<p><strong>3. Skewness and Shape Analysis:</strong></p>
<ul>
  <li>
    <strong>Median Line Offset:</strong>
    $$\\text{Distance from } Q_1 \\text{ to Median} = 5.0 - 4.0 = \\mathbf{1.0\\text{ hour}}$$
    $$\\text{Distance from Median to } Q_3 = 8.25 - 5.0 = \\mathbf{3.25\\text{ hours}}$$
    The median line is situated significantly closer to the left edge of the box ($1.0 < 3.25$).
  </li>
  <li>
    <strong>Whisker Length Comparison:</strong>
    $$\\text{Left Whisker Length} = Q_1 - X_0 = 4.0 - 1.0 = \\mathbf{3.0\\text{ hours}}$$
    $$\\text{Right Whisker Length} = X_m - Q_3 = 13.0 - 8.25 = \\mathbf{4.75\\text{ hours}}$$
    The right whisker ($4.75\\text{ hours}$) is considerably longer than the left whisker ($3.0\\text{ hours}$).
  </li>
  <li>
    <strong>Conclusion:</strong>
    Both the internal box asymmetry and the elongated right whisker definitively prove that the downtime distribution is <strong>Positively Skewed (Right-Skewed)</strong>.
  </li>
</ul>`,
    explanation: 'Construction of boxplot from five-number summary and derivation of positive skewness from whisker and quartile asymmetry.',
    urdu_answer: 'باکس 4.0 سے 8.25 تک بنے گا، میڈین 5.0 پر ہوگا؛ چونکہ دایاں وہسکر 4.75 بائیں وہسکر 3.0 سے لمبا ہے اور میڈین بائیں طرف جھکا ہوا ہے، اس لیے ڈیٹا پوزیٹیولی سکیوڈ ہے۔'
  },
  {
    stem: 'A clinical study compares the ages of onset of nervous asthma in children of manual workers ($\\bar{X} = 8.50\\text{ years}, \\tilde{X} = 8.50\\text{ years}, S = 3.61\\text{ years}$) and non-manual workers ($\\bar{X} = 8.50\\text{ years}, \\tilde{X} = 9.16\\text{ years}, S = 3.61\\text{ years}$). Calculate Pearson\'s Coefficient of Skewness for both groups and provide an in-depth clinical/statistical interpretation.',
    correct: `<p><strong>1. Mathematical Formula for Pearson's Coefficient of Skewness:</strong></p>
$$\\text{Pearson's } SK = \\frac{3(\\bar{X} - \\tilde{X})}{S}$$

<p><strong>2. Calculations for Children of Manual Workers:</strong></p>
$$\\text{Given: } \\bar{X} = 8.50, \\quad \\tilde{X} = 8.50, \\quad S = 3.61$$
$$SK_{\\text{manual}} = \\frac{3(8.50 - 8.50)}{3.61} = \\frac{3(0)}{3.61} = \\mathbf{0.00}$$
<ul>
  <li><strong>Statistical Interpretation:</strong> The coefficient of skewness is exactly zero ($SK = 0.00$).</li>
  <li><strong>Clinical Conclusion:</strong> The age of onset for children of manual workers is <strong>perfectly symmetrical</strong> around the average age of 8.5 years, with asthma cases occurring symmetrically earlier and later in childhood.</li>
</ul>

<p><strong>3. Calculations for Children of Non-Manual Workers:</strong></p>
$$\\text{Given: } \\bar{X} = 8.50, \\quad \\tilde{X} = 9.16, \\quad S = 3.61$$
$$SK_{\\text{non-manual}} = \\frac{3(8.50 - 9.16)}{3.61} = \\frac{3(-0.66)}{3.61} = \\frac{-1.98}{3.61} \\approx \\mathbf{-0.55}$$
<ul>
  <li><strong>Statistical Interpretation:</strong> The coefficient of skewness is negative ($SK \\approx -0.55 < 0$).</li>
  <li><strong>Clinical Conclusion:</strong> The age of onset for children of non-manual workers is <strong>Negatively Skewed (Skewed to the Left)</strong>. The median age of onset ($9.16\\text{ years}$) is higher than the mean, meaning that while most children develop asthma at later ages around 9 years, a smaller tail of children develops asthma at unusually early ages.</li>
</ul>`,
    explanation: 'Comparative calculation showing symmetric distribution (SK = 0) for manual workers and left-skewed distribution (SK = -0.55) for non-manual workers.',
    urdu_answer: 'دستی مزدوروں کے بچوں کے لیے SK = 0 آیا جو متناسب تقسیم ظاہر کرتا ہے، جبکہ دفتری کارکنوں کے لیے SK = -0.55 آیا جو ظاہر کرتا ہے کہ تقسیم بائیں جانب جھکی ہوئی (نیگیٹیولی سکیوڈ) ہے۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 13.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for STA301 Lecture 13.`);

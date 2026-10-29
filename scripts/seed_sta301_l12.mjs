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

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(sta301.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Chebychev Inequality, The Empirical Rule & The Five-Number Summary')
  `).run(sta301.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`STA301 Lecture 12 already exists with ID: ${lec12.id}`);
}

const lId = lec12.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 12.`);

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

// 11 Past Paper MCQs
const mcqs = [
  {
    stem: 'For any number $k$ ________ $1$, at least $1 - 1/k^2$ of the data values fall within $k$ standard deviations of the mean:',
    options: {
      a: 'Greater than 1',
      b: 'Less than 1',
      c: 'Greater or equal to 1',
      d: 'Less or equal to 1'
    },
    correct: 'a',
    explanation: "Chebychev's Theorem specifically requires $k > 1$. When $k = 1$, $1 - 1/1^2 = 0$, which yields no useful information (STA301 Handouts Page 89).",
    urdu_answer: 'شیبی شیف کے تھیورم کے لیے ضروری شرط ہے کہ k کی قدر 1 سے بڑی ہو ($k > 1$)۔'
  },
  {
    stem: 'Chebychev’s inequality does not hold / is not applicable for $k = ?$:',
    options: {
      a: '3',
      b: '2',
      c: '4',
      d: '0'
    },
    correct: 'd',
    explanation: "Chebychev's inequality is only defined and valid for $k > 1$. It does not hold for $k = 0$ or negative numbers (STA301 Handouts Page 89).",
    urdu_answer: 'شیبی شیف ان ایکویلٹی k = 0 پر لاگو نہیں ہوتی کیونکہ اس کے لیے k > 1 ہونا لازمی ہے۔'
  },
  {
    stem: 'Which rule is applied to any data set, regardless of the shape of the frequency distribution?',
    options: {
      a: 'Chebychev’s rule',
      b: 'Empirical rule',
      c: 'Combination rule',
      d: 'Permutation rule'
    },
    correct: 'a',
    explanation: "Chebychev's Theorem is a distribution-free theorem applicable to any dataset regardless of whether it is symmetric, skewed, bimodal, or uniform (STA301 Handouts Page 89).",
    urdu_answer: 'شیبی شیف کا اصول ڈیٹا کی تقسیم کی شکل سے قطع نظر ہر قسم کے ڈیٹا سیٹ پر لاگو ہوتا ہے۔'
  },
  {
    stem: 'Chebychev’s inequality is valid for which of the following data sets?',
    options: {
      a: 'Sample only',
      b: 'Entire population only',
      c: 'Both sample and entire population',
      d: 'None of the above'
    },
    correct: 'c',
    explanation: "Chebychev's inequality applies equally to sample data using sample statistics ($\\bar{X}, S$) and to population data using population parameters ($\\mu, \\sigma$) (STA301 Handouts Page 89).",
    urdu_answer: 'شیبی شیف ان ایکویلٹی نمونہ (sample) اور پوری آبادی (population) دونوں قسم کے ڈیٹا سیٹس پر لاگو ہوتی ہے۔'
  },
  {
    stem: 'According to the Empirical rule, approximately $68\\%$ of the measurements will fall within:',
    options: {
      a: '(\\text{Mean} - \\text{S.D.}, \\text{Mean} + \\text{S.D.})',
      b: '(\\text{Mean} - 2\\text{S.D.}, \\text{Mean} + 2\\text{S.D.})',
      c: '(\\text{Mean} - 3\\text{S.D.}, \\text{Mean} + 3\\text{S.D.})',
      d: '(\\text{Mean} - 4\\text{S.D.}, \\text{Mean} + 4\\text{S.D.})'
    },
    correct: 'a',
    explanation: 'For mound-shaped (bell-shaped) distributions, the Empirical Rule states that approximately 68% of the data values fall within one standard deviation of the mean: $\\bar{X} \\pm S$ (STA301 Handouts Page 90).',
    urdu_answer: 'ایمپیریل اصول کے مطابق تقریباً 68 فیصد مشاہدات (Mean - S.D., Mean + S.D.) کے درمیان واقع ہوتے ہیں۔'
  },
  {
    stem: 'According to the empirical rule, approximately $95\\%$ of the measurements will fall under which interval?',
    options: {
      a: '$\\bar{X} \\pm S$',
      b: '$\\bar{X} \\pm 2S$',
      c: '$\\bar{X} \\pm 3S$',
      d: '$\\bar{X} \\pm 4S$'
    },
    correct: 'b',
    explanation: 'For mound-shaped distributions, approximately 95% of observations fall within two standard deviations of the mean: $\\bar{X} \\pm 2S$ (STA301 Handouts Page 90).',
    urdu_answer: 'ایمپیریل اصول کے مطابق تقریباً 95 فیصد مشاہدات اوسط سے دو سٹینڈرڈ ڈیوی ایشنز ($\\bar{X} \\pm 2S$) کے اندر واقع ہوتے ہیں۔'
  },
  {
    stem: 'According to the empirical rule, approximately what percentage of values will fall within $(\\text{Mean} - 3\\text{S.D.}, \\text{Mean} + 3\\text{S.D.})$?',
    options: {
      a: '100% (or 99.7%)',
      b: '95%',
      c: '75%',
      d: '68%'
    },
    correct: 'a',
    explanation: 'The Empirical Rule states that almost all (approximately 99.7% or nearly 100%) of observations fall within three standard deviations of the mean: $\\bar{X} \\pm 3S$ (STA301 Handouts Page 90).',
    urdu_answer: 'ایمپیریل اصول کے مطابق تقریباً تمام (99.7 یا 100 فیصد) مشاہدات تین سٹینڈرڈ ڈیوی ایشنز کے اندر واقع ہوتے ہیں۔'
  },
  {
    stem: 'A Five-Number Summary consists of:',
    options: {
      a: '$X_0, Q_1, \\text{Median}, Q_3, \\text{and } X_m$',
      b: '$X_m, Q_1, \\text{Mean}, Q_3, \\text{and } X_0$',
      c: '$X_m, Q_1, \\text{Mode}, Q_3, \\text{and } X_0$',
      d: '$X_0, Q_1, \\text{Median}, Q_2, \\text{and } X_m$'
    },
    correct: 'a',
    explanation: 'A Five-Number Summary comprises five order statistics: Minimum value ($X_0$), First Quartile ($Q_1$), Median ($\\tilde{X}$), Third Quartile ($Q_3$), and Maximum value ($X_m$) (STA301 Handouts Page 91).',
    urdu_answer: 'فائیو نمبر سمری میں کم ترین قدر ($X_0$)، پہلا کوارٹائل ($Q_1$)، میڈین، تیسرا کوارٹائل ($Q_3$) اور زیادہ سے زیادہ قدر ($X_m$) شامل ہیں۔'
  },
  {
    stem: 'Which one of the following measures is NOT used in a "five-number summary"?',
    options: {
      a: 'Mean',
      b: 'Median',
      c: 'First Quartile ($Q_1$)',
      d: 'Maximum Value ($X_m$)'
    },
    correct: 'a',
    explanation: 'Arithmetic Mean is not part of the five-number summary; the summary relies entirely on order/positional statistics ($X_0, Q_1, \\text{Median}, Q_3, X_m$) (STA301 Handouts Page 91).',
    urdu_answer: 'حسابی اوسط (Mean) فائیو نمبر سمری کا حصہ نہیں ہوتی۔'
  },
  {
    stem: 'The concept of a five-number summary is directly linked with which graphical display?',
    options: {
      a: 'Polygon curve',
      b: 'Frequency curve',
      c: 'Box and whisker plot',
      d: 'Scatter plot'
    },
    correct: 'c',
    explanation: 'The Box-and-Whisker Plot is the direct visual display constructed from the five numbers in a five-number summary (STA301 Handouts Page 91).',
    urdu_answer: 'فائیو نمبر سمری کا تصور براہ راست باکس اینڈ وہسکر پلاٹ سے جڑا ہوا ہے۔'
  },
  {
    stem: 'If the data are perfectly symmetrical, which of the following is true for its five-number summary?',
    options: {
      a: 'Distance from $Q_1$ to Median equals distance from Median to $Q_3$',
      b: 'Distance from $X_0$ to $Q_1$ equals distance from $Q_3$ to $X_m$',
      c: '$\\text{Median} = \\text{Mid-Quartile Range} = \\text{Mid-Range}$',
      d: 'All of the above'
    },
    correct: 'd',
    explanation: 'In a perfectly symmetric distribution: (1) $Q_3 - \\text{Median} = \\text{Median} - Q_1$, (2) $X_m - Q_3 = Q_1 - X_0$, and (3) $\\text{Median} = \\frac{Q_1 + Q_3}{2} = \\frac{X_0 + X_m}{2}$ (STA301 Handouts Page 91).',
    urdu_answer: 'مکمل طور پر متناسب (symmetrical) ڈیٹا میں یہ تمام شرائط بیک وقت درست ہوتی ہیں۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 12.`);

// 3 Short Questions
const shorts = [
  {
    stem: 'Define the Five-Number Summary and state its importance in Exploratory Data Analysis (EDA).',
    correct: `<p><strong>1. Definition of Five-Number Summary (STA301 Lesson 12):</strong></p>
<p>A Five-Number Summary is a collection of five key order-based statistics that describe a dataset:</p>
<ol class="list-decimal pl-5 space-y-1">
  <li>Smallest value / Minimum ($X_0$)</li>
  <li>First Quartile ($Q_1$)</li>
  <li>Second Quartile / Median ($\\tilde{X}$ or $Q_2$)</li>
  <li>Third Quartile ($Q_3$)</li>
  <li>Largest value / Maximum ($X_m$)</li>
</ol>

<p><strong>2. Importance in Exploratory Data Analysis (EDA):</strong></p>
<ul>
  <li><strong>Comprehensive Profile without Graphing:</strong> Provides immediate insights into central tendency (Median), spread/dispersion (Range $X_m - X_0$ and Interquartile Range $Q_3 - Q_1$), and distribution shape (skewness or symmetry).</li>
  <li><strong>Foundation for Box-and-Whisker Plots:</strong> Serves as the direct numerical input to construct Box-and-Whisker plots for visual outlier detection.</li>
  <li><strong>Robust against Outliers:</strong> Unlike Mean and Variance, the quartiles and median are resistant to extreme data distortions.</li>
</ul>`,
    explanation: 'The five-number summary provides a robust, order-based profile of data center, spread, and skewness.',
    urdu_answer: 'فائیو نمبر سمری کم ترین قدر، پہلا کوارٹائل، میڈین، تیسرا کوارٹائل اور زیادہ سے زیادہ قدر پر مشتمل ہوتی ہے جو ڈیٹا کے پھیلاؤ اور جھکاؤ کا فوری جائزہ فراہم کرتی ہے۔'
  },
  {
    stem: "State Chebychev's Theorem / Inequality. Write its mathematical formula and mention its domain of applicability.",
    correct: `<p><strong>Statement of Chebychev's Theorem (STA301 Lesson 12):</strong></p>
<p>For any dataset (sample or population) and for any constant $k > 1$, the proportion of observations that lie within $k$ standard deviations of the mean (i.e., within the interval $\\bar{X} \\pm kS$) is <strong>at least</strong>:</p>
$$1 - \\frac{1}{k^2}$$

<p><strong>Key Properties &amp; Applicability:</strong></p>
<ul>
  <li><strong>Universal Applicability:</strong> Applies to <em>any</em> dataset regardless of the shape of the frequency distribution (symmetric, highly skewed, bimodal, or uniform).</li>
  <li><strong>Valid Range for $k$:</strong> Valid strictly for $k > 1$. When $k = 1$, $1 - 1/1^2 = 0$, which yields trivial information (at least 0% of data).</li>
  <li><strong>Conservative Lower Bound:</strong> The formula guarantees a minimum threshold; in practice, the actual proportion of data is often higher.</li>
</ul>`,
    explanation: "Chebychev's theorem guarantees that at least $1 - 1/k^2$ of values lie within $k$ standard deviations of the mean for any distribution.",
    urdu_answer: 'شیبی شیف کے تھیورم کے مطابق کسی بھی ڈیٹا سیٹ کے کم از کم $1 - 1/k^2$ مشاہدات اوسط سے k سٹینڈرڈ ڈیوی ایشنز کے اندر واقع ہوتے ہیں، جہاں k > 1 ہو۔'
  },
  {
    stem: "Differentiate between Chebychev's Rule and the Empirical Rule.",
    correct: `<p><strong>Comparison: Chebychev's Rule vs. The Empirical Rule (STA301 Lesson 12):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100 font-bold">
    <tr>
      <th class="p-2 border">Feature</th>
      <th class="p-2 border">Chebychev's Rule</th>
      <th class="p-2 border">The Empirical Rule</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Distribution Requirement</td>
      <td class="p-2 border">Applies to <strong>any</strong> data set, regardless of distribution shape.</td>
      <td class="p-2 border">Applies strictly to <strong>mound-shaped / bell-shaped (symmetric)</strong> distributions.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Nature of Prediction</td>
      <td class="p-2 border">Provides a conservative <strong>minimum lower bound</strong> ("at least").</td>
      <td class="p-2 border">Provides <strong>precise approximate percentages</strong> ("approximately").</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Within 1 S.D. ($\\bar{X} \\pm 1S$)</td>
      <td class="p-2 border">No information ($1 - 1/1^2 = 0\\%$).</td>
      <td class="p-2 border">Approximately <strong>68%</strong> of observations.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Within 2 S.D. ($\\bar{X} \\pm 2S$)</td>
      <td class="p-2 border">At least <strong>75%</strong> ($1 - 1/4 = 3/4$).</td>
      <td class="p-2 border">Approximately <strong>95%</strong> of observations.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Within 3 S.D. ($\\bar{X} \\pm 3S$)</td>
      <td class="p-2 border">At least <strong>88.89%</strong> ($1 - 1/9 = 8/9$).</td>
      <td class="p-2 border">Approximately <strong>99.7%</strong> (nearly 100%) of observations.</td>
    </tr>
  </tbody>
</table>`,
    explanation: "Chebychev's theorem gives conservative bounds for any distribution, while the Empirical Rule gives precise estimates for bell-shaped distributions.",
    urdu_answer: 'شیبی شیف کا اصول ہر قسم کے ڈیٹا پر کم از کم حد بتاتا ہے جبکہ ایمپیریل اصول صرف گھنٹی نما متناسب ڈیٹا پر تقریباً درست فیصد ظاہر کرتا ہے۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 12.`);

// 3 Long Questions
const longs = [
  {
    stem: "State Chebychev's Theorem. If a dataset has a mean $\\bar{X} = 150$ and a standard deviation $S = 25$, calculate the minimum percentage and the corresponding intervals of data values that fall within $k = 2$ and $k = 3$ standard deviations of the mean.",
    correct: `<p><strong>1. Statement of Chebychev's Theorem:</strong></p>
<p>For any distribution and any constant $k > 1$, at least $(1 - 1/k^2) \\times 100\\%$ of observations fall within the interval $\\bar{X} \\pm kS$ (STA301 Lesson 12).</p>

<p><strong>2. Calculations for $k = 2$:</strong></p>
<ul>
  <li>
    <strong>Minimum Percentage:</strong>
    $$\\text{Percentage} = \\left(1 - \\frac{1}{2^2}\\right) \\times 100\\% = \\left(1 - \\frac{1}{4}\\right) \\times 100\\% = \\frac{3}{4} \\times 100\\% = \\mathbf{75\\%}$$
  </li>
  <li>
    <strong>Interval $(\\bar{X} \\pm 2S)$:</strong>
    $$\\text{Lower Limit} = \\bar{X} - 2S = 150 - 2(25) = 150 - 50 = \\mathbf{100}$$
    $$\\text{Upper Limit} = \\bar{X} + 2S = 150 + 2(25) = 150 + 50 = \\mathbf{200}$$
    $$\\text{Interval} = \\mathbf{[100, 200]}$$
  </li>
  <li><strong>Conclusion:</strong> At least <strong>75%</strong> of the data values lie between <strong>100 and 200</strong>.</li>
</ul>

<p><strong>3. Calculations for $k = 3$:</strong></p>
<ul>
  <li>
    <strong>Minimum Percentage:</strong>
    $$\\text{Percentage} = \\left(1 - \\frac{1}{3^2}\\right) \\times 100\\% = \\left(1 - \\frac{1}{9}\\right) \\times 100\\% = \\frac{8}{9} \\times 100\\% \\approx \\mathbf{88.89\\%}$$
  </li>
  <li>
    <strong>Interval $(\\bar{X} \\pm 3S)$:</strong>
    $$\\text{Lower Limit} = \\bar{X} - 3S = 150 - 3(25) = 150 - 75 = \\mathbf{75}$$
    $$\\text{Upper Limit} = \\bar{X} + 3S = 150 + 3(25) = 150 + 75 = \\mathbf{225}$$
    $$\\text{Interval} = \\mathbf{[75, 225]}$$
  </li>
  <li><strong>Conclusion:</strong> At least <strong>88.89%</strong> of the data values lie between <strong>75 and 225</strong>.</li>
</ul>`,
    explanation: "Using Chebychev's formula $1 - 1/k^2$, minimum bounds are 75% for [100, 200] and 88.89% for [75, 225].",
    urdu_answer: 'k = 2 کے لیے کم از کم 75 فیصد ڈیٹا 100 سے 200 کے درمیان ہے، اور k = 3 کے لیے کم از کم 88.89 فیصد ڈیٹا 75 سے 225 کے درمیان ہے۔'
  },
  {
    stem: 'A sample of 50 companies\' R&D spending percentages has a mean $\\bar{X} = 8.49\\%$ and a standard deviation $S = 1.98\\%$. Assuming a mound-shaped distribution: (a) Find the 1-SD, 2-SD, and 3-SD intervals around the mean, and (b) Apply the Empirical Rule to state the expected proportion and expected count of companies within each interval.',
    correct: `<p><strong>Given Parameters:</strong> Mean $\\bar{X} = 8.49\\%$, Standard Deviation $S = 1.98\\%$, Sample Size $n = 50$ (STA301 Lesson 12).</p>

<p><strong>1. One Standard Deviation Interval ($\\bar{X} \\pm 1S$):</strong></p>
$$\\bar{X} \\pm S = 8.49 \\pm 1.98 = [8.49 - 1.98, \\; 8.49 + 1.98] = \\mathbf{[6.51\\%, \\; 10.47\\%]}$$
<ul>
  <li><strong>Expected Empirical Percentage:</strong> Approximately <strong>68%</strong></li>
  <li><strong>Expected Number of Companies:</strong> $0.68 \\times 50 = \\mathbf{34 \\text{ companies}}$</li>
</ul>

<p><strong>2. Two Standard Deviations Interval ($\\bar{X} \\pm 2S$):</strong></p>
$$\\bar{X} \\pm 2S = 8.49 \\pm 2(1.98) = 8.49 \\pm 3.96 = [8.49 - 3.96, \\; 8.49 + 3.96] = \\mathbf{[4.53\\%, \\; 12.45\\%]}$$
<ul>
  <li><strong>Expected Empirical Percentage:</strong> Approximately <strong>95%</strong></li>
  <li><strong>Expected Number of Companies:</strong> $0.95 \\times 50 = \\mathbf{47.5 \\approx 47 \\text{ or } 48 \\text{ companies}}$</li>
</ul>

<p><strong>3. Three Standard Deviations Interval ($\\bar{X} \\pm 3S$):</strong></p>
$$\\bar{X} \\pm 3S = 8.49 \\pm 3(1.98) = 8.49 \\pm 5.94 = [8.49 - 5.94, \\; 8.49 + 5.94] = \\mathbf{[2.55\\%, \\; 14.43\\%]}$$
<ul>
  <li><strong>Expected Empirical Percentage:</strong> Approximately <strong>99.7% (or 100%)</strong></li>
  <li><strong>Expected Number of Companies:</strong> $1.00 \\times 50 = \\mathbf{50 \\text{ companies}}$</li>
</ul>`,
    explanation: 'Application of the Empirical Rule 68-95-99.7% to sample intervals.',
    urdu_answer: 'ایمپیریل اصول کے تحت 1-SD وقفہ [6.51, 10.47] میں 34 کمپنیاں (68%)، 2-SD وقفہ [4.53, 12.45] میں 47 کمپنیاں (95%) اور 3-SD وقفہ میں تمام 50 کمپنیاں آئیں گی۔'
  },
  {
    stem: 'For a sample dataset of university annual tuition costs (in $\\$000$), the Five-Number Summary is: $X_0 = 13.0$, $Q_1 = 14.9$, $\\text{Median} = 15.3$, $Q_3 = 16.4$, $X_m = 23.1$. (a) Calculate the distances from $X_0$ to $Q_1$ and $Q_3$ to $X_m$, (b) Compare Median, Mid-Quartile Range, and Mid-Range, and (c) Determine whether the distribution is symmetric, positively skewed, or negatively skewed.',
    correct: `<p><strong>1. Distance Analysis between Summary Numbers (STA301 Lesson 12):</strong></p>
<ul>
  <li><strong>Distance from Minimum to First Quartile:</strong>
  $$Q_1 - X_0 = 14.9 - 13.0 = \\mathbf{1.9}$$</li>
  <li><strong>Distance from Third Quartile to Maximum:</strong>
  $$X_m - Q_3 = 23.1 - 16.4 = \\mathbf{6.7}$$</li>
  <li><strong>Comparison:</strong> The distance $X_m - Q_3$ ($6.7$) is significantly greater than $Q_1 - X_0$ ($1.9$), indicating a long upper tail toward the larger values.</li>
</ul>

<p><strong>2. Comparison of Positional Averages:</strong></p>
<ul>
  <li><strong>Median ($\\tilde{X}$):</strong>
  $$\\text{Median} = \\mathbf{15.30}$$</li>
  <li><strong>Mid-Quartile Range:</strong>
  $$\\text{Mid-Quartile Range} = \\frac{Q_1 + Q_3}{2} = \\frac{14.9 + 16.4}{2} = \\frac{31.3}{2} = \\mathbf{15.65}$$</li>
  <li><strong>Mid-Range:</strong>
  $$\\text{Mid-Range} = \\frac{X_0 + X_m}{2} = \\frac{13.0 + 23.1}{2} = \\frac{36.1}{2} = \\mathbf{18.05}$$</li>
  <li><strong>Comparison:</strong>
  $$\\text{Median} < \\text{Mid-Quartile Range} < \\text{Mid-Range} \\quad (15.30 < 15.65 < 18.05)$$</li>
</ul>

<p><strong>3. Conclusion regarding Distribution Shape:</strong></p>
<p>Both criteria confirm that the data distribution is <strong>Positively Skewed (Skewed to the Right)</strong>:</p>
<ol class="list-decimal pl-5 space-y-1">
  <li>The right tail is much longer than the left tail ($(X_m - Q_3) > (Q_1 - X_0)$).</li>
  <li>The Mid-Range is pulled strongly upward by the extreme right-hand value ($X_m = 23.1$).</li>
</ol>`,
    explanation: 'Evaluating skewness through the five-number summary: greater distance from Q3 to Xm and Median < Mid-Quartile Range < Mid-Range confirm positive skewness.',
    urdu_answer: 'چونکہ دائیں جانب کا فاصلہ بائیں جانب سے زیادہ ہے اور میڈین < مڈ کوارٹائل رینج < مڈ رینج ہے، اس لیے ڈیٹا پوزیٹیولی سکیوڈ (دائیں طرف جھکا ہوا) ہے۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 12.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for STA301 Lecture 12.`);

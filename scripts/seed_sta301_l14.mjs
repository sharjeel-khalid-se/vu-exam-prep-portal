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

// 2. Create or fetch Lecture 14
let lec14 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 14").get(sta301.id);
if (!lec14) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 14, 'Bowleys Skewness, Kurtosis, Moments About Mean, and Moment Ratios')
  `).run(sta301.id);
  lec14 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 14 with ID: ${lec14.id}`);
} else {
  console.log(`STA301 Lecture 14 already exists with ID: ${lec14.id}`);
}

const lId = lec14.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 14.`);

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
    stem: 'The fourth moment about the mean ($m_4$) provides information about the ____________ of the frequency distribution:',
    options: {
      a: 'Centre',
      b: 'Dispersion',
      c: 'Symmetry',
      d: 'Kurtosis'
    },
    correct: 'd',
    explanation: 'In central moments, $m_1 = 0$ (centre), $m_2 = S^2$ measures dispersion/variance, $m_3$ measures symmetry/skewness, and the fourth moment about mean $m_4$ measures peakedness or flatness, which is Kurtosis (STA301 Handouts Lecture 14, Page 114). Appeared in 12+ midterm papers.',
    urdu_answer: 'اوسط کے گرد چوتھا مومنٹ ($m_4$) کسی فریکوئنسی تقسیم کے نوک دار یا چپٹے پن یعنی کرٹوسس (Kurtosis) کے متعلق معلومات دیتا ہے۔'
  },
  {
    stem: 'The first moment about the origin / zero ($m_1\'$) is always equal to:',
    options: {
      a: 'Arithmetic Mean',
      b: 'Variance',
      c: 'Standard Deviation',
      d: 'Zero'
    },
    correct: 'a',
    explanation: 'By mathematical definition, the first raw moment about zero is $m_1\' = \\frac{\\sum(X - 0)}{n} = \\frac{\\sum X}{n} = \\bar{X}$, which is the arithmetic mean (STA301 Handouts Lecture 14, Page 114). Appeared across 8+ midterm papers.',
    urdu_answer: 'مبدا (Zero) کے گرد پہلا خام مومنٹ ($m_1\'$) ہمیشہ حسابی اوسط (Mean) کے برابر ہوتا ہے۔'
  },
  {
    stem: 'The first moment about the arithmetic mean ($m_1$) is always equal to:',
    options: {
      a: 'Zero',
      b: 'One',
      c: 'Mean',
      d: 'Variance'
    },
    correct: 'a',
    explanation: 'Because the algebraic sum of deviations of all observations from their arithmetic mean is always zero ($\\sum(X - \\bar{X}) = 0$), the first central moment $m_1 = \\frac{\\sum(X - \\bar{X})}{n} = 0$ for all datasets (STA301 Handouts Lecture 14, Page 112).',
    urdu_answer: 'اوسط سے انحرافات کا مجموعہ صفر ہونے کی وجہ سے اوسط کے گرد پہلا سنٹرل مومنٹ ($m_1$) ہمیشہ صفر ہوتا ہے۔'
  },
  {
    stem: 'The second moment about the arithmetic mean ($m_2$) is equal to:',
    options: {
      a: 'Standard Deviation',
      b: 'Variance',
      c: 'Mean',
      d: 'Zero'
    },
    correct: 'b',
    explanation: 'By formula, $m_2 = \\frac{\\sum(X - \\bar{X})^2}{n} = S^2$, which is the sample variance (STA301 Handouts Lecture 14, Page 114). Appeared in 8+ midterm past papers.',
    urdu_answer: 'اوسط کے گرد دوسرا سنٹرل مومنٹ ($m_2$) تقسیم کے تغیر یعنی ویریئنس (Variance) کے برابر ہوتا ہے۔'
  },
  {
    stem: 'A frequency distribution is called mesokurtic (normal curve) if the moment coefficient of kurtosis $b_2$ is:',
    options: {
      a: 'Equal to 0',
      b: 'Equal to 3',
      c: 'Less than 3',
      d: 'Greater than 3'
    },
    correct: 'b',
    explanation: 'Karl Pearson defined the moment ratio $b_2 = \\frac{m_4}{(m_2)^2}$. For a mesokurtic (standard normal) distribution, $b_2 = 3$ (STA301 Handouts Lecture 14, Page 114). Appeared in 15+ midterm papers.',
    urdu_answer: 'میسوکرٹک یا نارمل منحنی کے لیے مومنٹ ریشو $b_2$ کی قیمت ہمیشہ 3 کے برابر ہوتی ہے۔'
  },
  {
    stem: 'For a Leptokurtic distribution (a curve whose peak is relatively high and sharp), the moment ratio $b_2$ will be:',
    options: {
      a: 'Greater than 3',
      b: 'Less than 3',
      c: 'Equal to 3',
      d: 'Equal to zero'
    },
    correct: 'a',
    explanation: 'A leptokurtic distribution possesses a taller, sharper peak and fatter tails than a normal curve, giving a moment ratio $b_2 > 3$ (STA301 Handouts Lecture 14, Page 114). Appeared in 10+ midterm papers.',
    urdu_answer: 'لیپٹوکرٹک (زیادہ نوک دار چوٹی والی) تقسیم کے لیے $b_2$ کی قیمت 3 سے زیادہ ($b_2 > 3$) ہوتی ہے۔'
  },
  {
    stem: 'For a Platykurtic distribution (a curve that is relatively flat-topped), the moment ratio $b_2$ will be:',
    options: {
      a: 'Greater than 3',
      b: 'Less than 3',
      c: 'Equal to 3',
      d: 'Equal to zero'
    },
    correct: 'b',
    explanation: 'A platykurtic curve has a broader, flatter top and lighter tails than the normal curve, which produces a moment ratio $b_2 < 3$ (STA301 Handouts Lecture 14, Page 114). Appeared in 9+ midterm papers.',
    urdu_answer: 'پلیٹی کرٹک (چپٹی چوٹی والی) تقسیم کے لیے $b_2$ کی قیمت 3 سے کم ($b_2 < 3$) ہوتی ہے۔'
  },
  {
    stem: 'Bowley’s coefficient of skewness is a pure unitless number whose value strictly lies between:',
    options: {
      a: '0 and 1',
      b: '$-1$ and $+1$',
      c: '$-\\infty$ and $+\\infty$',
      d: '0 and $+0.50$'
    },
    correct: 'b',
    explanation: 'Bowley’s quartile coefficient of skewness $SK_B = \\frac{Q_1 + Q_3 - 2\\tilde{X}}{Q_3 - Q_1}$ is a normalized relative index strictly bounded between $-1$ and $+1$ (STA301 Handouts Lecture 14, Page 110).',
    urdu_answer: 'باؤلے کا کوفیشینٹ آف سکیونس ہمیشہ $-1$ اور $+1$ کے درمیان رہتا ہے۔'
  },
  {
    stem: 'Bowley’s coefficient of skewness for a certain frequency distribution is ZERO. What is the shape of the distribution?',
    options: {
      a: 'Positively skewed',
      b: 'Negatively skewed',
      c: 'Symmetrical',
      d: 'Platykurtic'
    },
    correct: 'c',
    explanation: 'When $SK_B = 0$, the median is positioned exactly midway between $Q_1$ and $Q_3$, meaning $Q_3 - \\tilde{X} = \\tilde{X} - Q_1$, confirming a perfectly symmetrical distribution (STA301 Handouts Lecture 14, Page 110).',
    urdu_answer: 'اگر باؤلے کا کوفیشینٹ آف سکیونس صفر ہو تو ڈیٹا کی تقسیم مکمل طور پر متناسب (Symmetrical) ہوتی ہے۔'
  },
  {
    stem: 'For a positively skewed distribution, the third moment about the mean ($m_3$) will always be:',
    options: {
      a: 'Positive',
      b: 'Negative',
      c: 'Zero',
      d: '1'
    },
    correct: 'a',
    explanation: 'Because odd powers preserve algebraic signs, the large positive deviations in a right-skewed tail dominate upon cubing, causing $m_3 = \\frac{\\sum(X - \\bar{X})^3}{n} > 0$ (STA301 Handouts Lecture 14, Page 114).',
    urdu_answer: 'پوزیٹیولی سکیوڈ تقسیم میں لمبی دائیں دم کے انحرافات مثبت ہونے کی وجہ سے تیسرا سنٹرل مومنٹ ($m_3$) ہمیشہ مثبت ہوتا ہے۔'
  },
  {
    stem: 'If the third moment about the mean is zero ($m_3 = 0$), then the frequency distribution is:',
    options: {
      a: 'Symmetrical',
      b: 'Negatively skewed',
      c: 'Positively skewed',
      d: 'Mesokurtic'
    },
    correct: 'a',
    explanation: 'In a symmetrical distribution, every positive deviation $(X_i - \\bar{X})$ has a corresponding negative deviation of equal magnitude; hence their cubes sum to zero ($m_3 = 0$) (STA301 Handouts Lecture 14, Page 114).',
    urdu_answer: 'اگر تیسرا سنٹرل مومنٹ صفر ہو ($m_3 = 0$) تو تقسیم لازمی طور پر متناسب (Symmetrical) ہوتی ہے۔'
  },
  {
    stem: 'The Percentile Coefficient of Kurtosis ($K$) for a standard normal distribution is equal to:',
    options: {
      a: '0.263',
      b: '3.000',
      c: '0.000',
      d: '0.500'
    },
    correct: 'a',
    explanation: 'The percentile coefficient of kurtosis is defined as $K = \\frac{Q.D.}{P_{90} - P_{10}}$. For a normal distribution, $Q.D. = 0.6745\\sigma$ and $P_{90} - P_{10} = 2.564\\sigma$, yielding $K = \\frac{0.6745}{2.564} \\approx 0.263$ (STA301 Handouts Lecture 14, Page 111).',
    urdu_answer: 'نارمل تقسیم کے لیے پرسنٹائل کوفیشینٹ آف کرٹوسس ($K$) کی قیمت 0.263 کے برابر ہوتی ہے۔'
  }
];

// 4 Short Questions
const shorts = [
  {
    stem: 'Define Bowley\'s Coefficient of Skewness, state its formula, and explain its properties.',
    correct: `<p><strong>Bowley\'s Coefficient of Skewness (Quartile Coefficient of Skewness):</strong></p>
<p>Bowley\'s coefficient of skewness is a positional measure of asymmetry based entirely on the median ($\\tilde{X}$) and the two quartiles ($Q_1$ and $Q_3$). It is especially advantageous when a dataset contains extreme outliers or open-ended classes where the mean cannot be reliably computed.</p>

<h4>1. Mathematical Formula:</h4>
\\[SK_B = \\frac{(Q_3 - \\tilde{X}) - (\\tilde{X} - Q_1)}{(Q_3 - \\tilde{X}) + (\\tilde{X} - Q_1)} = \\frac{Q_1 + Q_3 - 2\\tilde{X}}{Q_3 - Q_1}\\]

<h4>2. Key Properties:</h4>
<ul>
  <li><strong>Unitless Number:</strong> It is a pure relative measure independent of units of measurement.</li>
  <li><strong>Bounded Range:</strong> Its value strictly falls within the range \\([-1, +1]\\).</li>
  <li><strong>Interpretation:</strong>
    <ul>
      <li>If \\(SK_B = 0\\), the distribution is <strong>symmetrical</strong>.</li>
      <li>If \\(SK_B > 0\\), the distribution is <strong>positively skewed</strong> (right-skewed).</li>
      <li>If \\(SK_B < 0\\), the distribution is <strong>negatively skewed</strong> (left-skewed).</li>
    </ul>
  </li>
</ul>`,
    explanation: 'Frequently tested 3-mark conceptual question from STA301 Midterm Solved Subjectives and Handouts Lecture 14 (Pages 110–111).',
    urdu_answer: 'باؤلے کا کوفیشینٹ آف سکیونس کواٹائلز اور میڈین پر مبنی عدم تناسب کی پیمائش ہے: $SK_B = \\frac{Q_1 + Q_3 - 2\\tilde{X}}{Q_3 - Q_1}$۔ اس کی قیمت ہمیشہ $-1$ اور $+1$ کے درمیان ہوتی ہے۔ صفر پر تقسیم متناسب، مثبت پر دائیں طرف اور منفی پر بائیں طرف جھکی ہوتی ہے۔'
  },
  {
    stem: 'Define Kurtosis in statistics. Explain the three types of frequency curves: Leptokurtic, Mesokurtic, and Platykurtic.',
    correct: `<p><strong>Kurtosis and Types of Frequency Curves (STA301 Handouts Lecture 14):</strong></p>

<h4>1. Definition of Kurtosis:</h4>
<p><strong>Kurtosis</strong> (derived from the Greek word for "hump" or "convexity") is a statistical term introduced by Karl Pearson to measure the degree of peakedness or flatness of a unimodal frequency distribution compared to a normal distribution.</p>

<h4>2. Three Types of Curves:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Curve Type</th>
      <th style="padding: 8px;">Peak Characteristic</th>
      <th style="padding: 8px;">Moment Ratio \\(b_2\\)</th>
      <th style="padding: 8px;">Tail Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>1. Leptokurtic</strong></td>
      <td style="padding: 8px;">Relatively high, sharp, and narrow peak.</td>
      <td style="padding: 8px;">\\(b_2 > 3\\)</td>
      <td style="padding: 8px;">Heavy/fat tails with higher probability of extreme values.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>2. Mesokurtic</strong></td>
      <td style="padding: 8px;">Moderate, intermediate peakedness (Standard Normal).</td>
      <td style="padding: 8px;">\\(b_2 = 3\\)</td>
      <td style="padding: 8px;">Standard normal bell-shaped tails.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>3. Platykurtic</strong></td>
      <td style="padding: 8px;">Broad, flat-topped peak.</td>
      <td style="padding: 8px;">\\(b_2 < 3\\)</td>
      <td style="padding: 8px;">Light/short tails with lower probability of extreme values.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core 3-mark subjective question from STA301 Midterm Solved Subjectives and Handouts Pages 111–114.',
    urdu_answer: 'کرٹوسس (Kurtosis) کسی تقسیم کی چوٹی کے نوک دار یا چپٹے پن کی پیمائش کو کہتے ہیں۔ اس کی 3 اقسام ہیں: 1. لیپٹوکرٹک ($b_2 > 3$) زیادہ اونچی چوٹی؛ 2. میسوکرٹک ($b_2 = 3$) نارمل درمیانی چوٹی؛ اور 3. پلیٹی کرٹک ($b_2 < 3$) چپٹی اور چوڑی چوٹی۔'
  },
  {
    stem: 'How are the moment ratios $b_1$ and $b_2$ helpful in determining the shape of a frequency distribution?',
    correct: `<p><strong>Role of Moment Ratios \\(b_1\\) and \\(b_2\\) in Shape Determination (STA301 Handouts Lecture 14):</strong></p>

<h4>1. Moment Ratio \\(b_1\\) (Measure of Skewness):</h4>
\\[b_1 = \\frac{(m_3)^2}{(m_2)^3}\\]
<ul>
  <li>\\(b_1\\) measures the <em>magnitude of skewness</em>. Because the third moment is squared, \\(b_1 \\ge 0\\).</li>
  <li>If \\(b_1 = 0\\), the distribution is <strong>symmetrical</strong>.</li>
  <li>The <em>direction of skewness</em> is indicated by the sign of \\(m_3\\):
    <ul>
      <li>\\(m_3 > 0 \\implies\\) <strong>Positively skewed</strong>.</li>
      <li>\\(m_3 < 0 \\implies\\) <strong>Negatively skewed</strong>.</li>
    </ul>
  </li>
</ul>

<h4>2. Moment Ratio \\(b_2\\) (Measure of Kurtosis):</h4>
\\[b_2 = \\frac{m_4}{(m_2)^2}\\]
<ul>
  <li>\\(b_2\\) measures <em>peakedness (kurtosis)</em> relative to a normal distribution:
    <ul>
      <li>If \\(b_2 = 3\\), the curve is <strong>Mesokurtic</strong> (Normal).</li>
      <li>If \\(b_2 > 3\\), the curve is <strong>Leptokurtic</strong> (more peaked than normal).</li>
      <li>If \\(b_2 < 3\\), the curve is <strong>Platykurtic</strong> (flatter than normal).</li>
    </ul>
  </li>
</ul>`,
    explanation: 'High-frequency 3-mark question from STA301 Midterm Papers (Fall 2012, Moaaz) and Handouts Page 114.',
    urdu_answer: 'مومنٹ ریشو $b_1 = \\frac{m_3^2}{m_2^3}$ سکیونس کی شدت ناپتا ہے (اگر $m_3 > 0$ ہو تو مثبت، اور اگر $b_1 = 0$ ہو تو متناسب)۔ مومنٹ ریشو $b_2 = \\frac{m_4}{m_2^2}$ کرٹوسس ناپتا ہے: $b_2 = 3$ پر نارمل (میسوکرٹک)، $b_2 > 3$ پر لیپٹوکرٹک اور $b_2 < 3$ پر پلیٹی کرٹک ہوتا ہے۔'
  },
  {
    stem: 'What are Moments in statistics? Write formulas for the first four sample moments about the mean.',
    correct: `<p><strong>Statistical Moments and Central Moments Formulas (STA301 Handouts Lecture 14):</strong></p>

<h4>1. Definition of Moments:</h4>
<p>In statistics, a <strong>moment</strong> designates the arithmetic average of the powers to which deviations of observations are raised. Moments provide a unified mathematical framework for describing the central tendency, dispersion, skewness, and kurtosis of a frequency distribution.</p>

<h4>2. Formulas for the First Four Sample Central Moments (About the Mean):</h4>
<ol>
  <li><strong>First Central Moment (\\(m_1\\)):</strong>
    \\[m_1 = \\frac{\\sum (X_i - \\bar{X})}{n} = \\mathbf{0}\\]
    <em>(Always identically zero for any dataset)</em>
  </li>
  <li><strong>Second Central Moment (\\(m_2\\)):</strong>
    \\[m_2 = \\frac{\\sum (X_i - \\bar{X})^2}{n} = \\mathbf{S^2} \\quad \\text{(Sample Variance)}\\]
  </li>
  <li><strong>Third Central Moment (\\(m_3\\)):</strong>
    \\[m_3 = \\frac{\\sum (X_i - \\bar{X})^3}{n} \\quad \\text{(Measures Skewness / Asymmetry)}\\]
  </li>
  <li><strong>Fourth Central Moment (\\(m_4\\)):</strong>
    \\[m_4 = \\frac{\\sum (X_i - \\bar{X})^4}{n} \\quad \\text{(Measures Kurtosis / Peakedness)}\\]
  </li>
</ol>`,
    explanation: 'Core 3-mark question from STA301 Handouts Lecture 14 (Pages 111–112).',
    urdu_answer: 'مومنٹس سے مراد اوسط سے لیے گئے انحرافات کی مختلف طاقتوں (Powers) کی حسابی اوسط ہے۔ اوسط کے گرد پہلے چار سنٹرل مومنٹس کے فارمولے یہ ہیں: $m_1 = 0$ (ہمیشہ صفر)؛ $m_2 = \\text{Variance}$؛ $m_3$ سکیونس کے لیے؛ اور $m_4$ کرٹوسس کے لیے استعمال ہوتا ہے۔'
  }
];

// 3 Long Questions
const longs = [
  {
    stem: 'Calculate the first four moments about the mean ($m_1, m_2, m_3, m_4$) for the following set of examination marks: $45, 32, 37, 46, 39, 36, 41, 48, 36$. Show complete step-by-step calculations.',
    correct: `<p><strong>Calculation of First Four Moments About Mean (STA301 Handouts Lecture 14):</strong></p>

<h4>Step 1: Compute Arithmetic Mean (\\(\\bar{X}\\)):</h4>
\\[n = 9\\]
\\[\\sum X = 45 + 32 + 37 + 46 + 39 + 36 + 41 + 48 + 36 = 360\\]
\\[\\bar{X} = \\frac{\\sum X}{n} = \\frac{360}{9} = \\mathbf{40\\text{ marks}}\\]

<h4>Step 2: Construct the Deviation and Powers Calculation Table:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: center;">
      <th style="padding: 6px;">\\(X_i\\)</th>
      <th style="padding: 6px;">\\(X_i - \\bar{X}\\)</th>
      <th style="padding: 6px;">\\((X_i - \\bar{X})^2\\)</th>
      <th style="padding: 6px;">\\((X_i - \\bar{X})^3\\)</th>
      <th style="padding: 6px;">\\((X_i - \\bar{X})^4\\)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align: center;"><td>32</td><td>\\(-8\\)</td><td>64</td><td>\\(-512\\)</td><td>4096</td></tr>
    <tr style="text-align: center;"><td>36</td><td>\\(-4\\)</td><td>16</td><td>\\(-64\\)</td><td>256</td></tr>
    <tr style="text-align: center;"><td>36</td><td>\\(-4\\)</td><td>16</td><td>\\(-64\\)</td><td>256</td></tr>
    <tr style="text-align: center;"><td>37</td><td>\\(-3\\)</td><td>9</td><td>\\(-27\\)</td><td>81</td></tr>
    <tr style="text-align: center;"><td>39</td><td>\\(-1\\)</td><td>1</td><td>\\(-1\\)</td><td>1</td></tr>
    <tr style="text-align: center;"><td>41</td><td>\\(+1\\)</td><td>1</td><td>\\(+1\\)</td><td>1</td></tr>
    <tr style="text-align: center;"><td>45</td><td>\\(+5\\)</td><td>25</td><td>\\(+125\\)</td><td>625</td></tr>
    <tr style="text-align: center;"><td>46</td><td>\\(+6\\)</td><td>36</td><td>\\(+216\\)</td><td>1296</td></tr>
    <tr style="text-align: center;"><td>48</td><td>\\(+8\\)</td><td>64</td><td>\\(+512\\)</td><td>4096</td></tr>
    <tr style="background-color: #f8fafc; font-weight: bold; text-align: center;">
      <td>Total</td><td>0</td><td>232</td><td>186</td><td>10708</td>
    </tr>
  </tbody>
</table>

<h4>Step 3: Calculate the Four Sample Central Moments:</h4>
<ol>
  <li><strong>First Central Moment (\\(m_1\\)):</strong>
    \\[m_1 = \\frac{\\sum(X_i - \\bar{X})}{n} = \\frac{0}{9} = \\mathbf{0\\text{ marks}}\\]
  </li>
  <li><strong>Second Central Moment (\\(m_2\\)):</strong>
    \\[m_2 = \\frac{\\sum(X_i - \\bar{X})^2}{n} = \\frac{232}{9} \\approx \\mathbf{25.78\\text{ (marks)}^2}\\]
  </li>
  <li><strong>Third Central Moment (\\(m_3\\)):</strong>
    \\[m_3 = \\frac{\\sum(X_i - \\bar{X})^3}{n} = \\frac{186}{9} \\approx \\mathbf{20.67\\text{ (marks)}^3}\\]
  </li>
  <li><strong>Fourth Central Moment (\\(m_4\\)):</strong>
    \\[m_4 = \\frac{\\sum(X_i - \\bar{X})^4}{n} = \\frac{10708}{9} \\approx \\mathbf{1189.78\\text{ (marks)}^4}\\]
  </li>
</ol>`,
    explanation: 'High-frequency 5-mark calculation problem from STA301 Midterm Current Papers Spring 2022 (Q32) and Handouts Pages 112–113.',
    urdu_answer: 'حسابی اوسط $\\bar{X} = 40$ ہے۔ پہلے چار مومنٹس کے نتائج: $m_1 = 0$، $m_2 = 25.78$، $m_3 = 20.67$ اور $m_4 = 1189.78$ ہیں۔'
  },
  {
    stem: 'Using the calculated moments ($m_1 = 0, m_2 = 25.78, m_3 = 20.67, m_4 = 1189.78$):\n1. Calculate the moment ratio $b_1$ and interpret the skewness of the distribution.\n2. Calculate the moment ratio $b_2$ and interpret the kurtosis of the distribution.',
    correct: `<p><strong>Calculation and Interpretation of Moment Ratios \\(b_1\\) and \\(b_2\\) (STA301 Handouts Lecture 14):</strong></p>

<h4>Part 1: Moment Ratio \\(b_1\\) (Measure of Skewness):</h4>
\\[b_1 = \\frac{(m_3)^2}{(m_2)^3}\\]
<p>Substitute \\(m_3 = 20.67\\) and \\(m_2 = 25.78\\):</p>
\\[(m_3)^2 = (20.67)^2 = 427.2489\\]
\\[(m_2)^3 = (25.78)^3 \\approx 17132.88\\]
\\[b_1 = \\frac{427.2489}{17132.88} \\approx \\mathbf{0.025}\\]
<p><strong>Interpretation:</strong> Since \\(b_1 = 0.025 > 0\\) and \\(m_3 = +20.67\\) is positive, the examination marks distribution is <strong>slightly positively skewed</strong> (slight tail to the right).</p>

<h4>Part 2: Moment Ratio \\(b_2\\) (Measure of Kurtosis):</h4>
\\[b_2 = \\frac{m_4}{(m_2)^2}\\]
<p>Substitute \\(m_4 = 1189.78\\) and \\(m_2 = 25.78\\):</p>
\\[(m_2)^2 = (25.78)^2 \\approx 664.6084\\]
\\[b_2 = \\frac{1189.78}{664.6084} \\approx \\mathbf{1.79}\\]
<p><strong>Interpretation:</strong> Since \\(b_2 = 1.79 < 3\\), the frequency curve is <strong>Platykurtic</strong> (it is flatter and broader at the top with lighter tails than a normal distribution).</p>`,
    explanation: 'Core 5-mark analytical interpretation problem from STA301 Midterm Current Papers Spring 2022 (Q30) and Handouts Page 114.',
    urdu_answer: 'مومنٹ ریشو $b_1 = 0.025$ چونکہ مثبت ہے اس لیے تقسیم معمولی طور پر پوزیٹیولی سکیوڈ (Right-skewed) ہے۔ مومنٹ ریشو $b_2 = 1.79$ چونکہ 3 سے کم ہے ($b_2 < 3$)، اس لیے یہ تقسیم پلیٹی کرٹک (Platykurtic / چپٹی چوٹی والی) ہے۔'
  },
  {
    stem: 'Find Bowley\'s Coefficient of Skewness for the age distribution of children of manual workers ($Q_1 = 6.00\\text{ years}, \\tilde{X} = 8.50\\text{ years}, Q_3 = 11.00\\text{ years}$) and non-manual workers ($Q_1 = 5.50\\text{ years}, \\tilde{X} = 9.16\\text{ years}, Q_3 = 10.83\\text{ years}$). Compare and interpret the shapes of both distributions.',
    correct: `<p><strong>Bowley\'s Coefficient of Skewness Comparison (STA301 Handouts Lecture 14):</strong></p>

<h4>1. General Formula:</h4>
\\[SK_B = \\frac{Q_1 + Q_3 - 2\\tilde{X}}{Q_3 - Q_1}\\]

<h4>2. Calculation for Manual Workers\' Children:</h4>
<p>Given: \\(Q_1 = 6.00\\text{ years}\\), \\(\\tilde{X} = 8.50\\text{ years}\\), \\(Q_3 = 11.00\\text{ years}\\)</p>
\\[SK_B = \\frac{6.00 + 11.00 - 2(8.50)}{11.00 - 6.00} = \\frac{17.00 - 17.00}{5.00} = \\frac{0}{5.00} = \\mathbf{0.00}\\]
<p><strong>Interpretation:</strong> The coefficient of skewness is exactly 0. The age distribution for manual workers\' children is <strong>perfectly symmetrical</strong>.</p>

<h4>3. Calculation for Non-Manual Workers\' Children:</h4>
<p>Given: \\(Q_1 = 5.50\\text{ years}\\), \\(\\tilde{X} = 9.16\\text{ years}\\), \\(Q_3 = 10.83\\text{ years}\\)</p>
\\[SK_B = \\frac{5.50 + 10.83 - 2(9.16)}{10.83 - 5.50} = \\frac{16.33 - 18.32}{5.33} = \\frac{-1.99}{5.33} \\approx \\mathbf{-0.37}\\]
<p><strong>Interpretation:</strong> Since \\(SK_B = -0.37 < 0\\), the age distribution for non-manual workers\' children is <strong>moderately negatively skewed</strong> (skewed to the left).</p>

<h4>4. Comparative Summary:</h4>
<p>While the ages of manual workers\' children are evenly distributed around the median age of 8.5 years, the ages of non-manual workers\' children cluster more heavily toward the higher age brackets with a longer tail trailing into the younger ages.</p>`,
    explanation: 'High-frequency 5-mark subjective question from STA301 Midterm Solved Subjectives (Page 17) and Handouts Page 110.',
    urdu_answer: 'مینوئل ورکرز کے بچوں کے لیے $SK_B = 0$ ہے جو ظاہر کرتا ہے کہ عمر کی تقسیم مکمل طور پر متناسب (Symmetrical) ہے۔ نان مینوئل ورکرز کے بچوں کے لیے $SK_B = -0.37$ ہے جو ظاہر کرتا ہے کہ تقسیم منفی طور پر سکیوڈ (بائیں طرف جھکی ہوئی) ہے۔'
  }
];

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into STA301 Lecture 14:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for STA301 Lecture 14: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

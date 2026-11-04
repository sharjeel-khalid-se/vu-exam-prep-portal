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

// 2. Create or fetch Lecture 22
let lec22 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 22").get(sta301.id);
if (!lec22) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 22, 'Bayes Theorem, Discrete Random Variables, and Probability Distributions')
  `).run(sta301.id);
  lec22 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 22 with ID: ${lec22.id}`);
} else {
  console.log(`STA301 Lecture 22 already exists with ID: ${lec22.id}`);
}

const lId = lec22.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 22.`);

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

// 10 MCQs
const mcqs = [
  {
    stem: 'If $X$ is a discrete random variable, then the mathematical function $f(x)$ representing the probability that $X$ takes on the specific value $x$ is called a:',
    options: {
      a: 'Probability function (or Probability Mass Function)',
      b: 'Probability density function',
      c: 'Density function',
      d: 'Distribution function'
    },
    correct: 'a',
    explanation: 'For a discrete random variable, the function giving probabilities of individual points $f(x) = P(X = x)$ is called the Probability Function or Probability Mass Function (PMF). Probability Density Function (PDF) applies strictly to continuous random variables (STA301 Handouts Lecture 22, Page 163). Appeared in 12+ midterm papers.',
    urdu_answer: 'ڈسکریٹ رینڈم ویری ایبل کے لیے وہ فنکشن جو کسی مخصوص قدر کے امکان کو ظاہر کرے، پروببلٹی فنکشن (یا پروببلٹی ماس فنکشن - PMF) کہلاتا ہے۔'
  },
  {
    stem: 'A discrete probability function $f(x)$ must satisfy the axiom that the sum of probabilities over all possible values of $X$, $\\sum f(x)$, is equal to:',
    options: {
      a: 'Zero',
      b: 'One',
      c: 'Negative',
      d: 'Greater than 1'
    },
    correct: 'b',
    explanation: 'By the total probability property of a discrete probability mass function, the sum of all probabilities across the support must equal unity: $\\sum f(x_i) = 1$ (STA301 Handouts Lecture 22, Page 163). Appeared in 10+ midterm papers.',
    urdu_answer: 'ڈسکریٹ پروببلٹی فنکشن کی بنیادی شرط یہ ہے کہ تمام ممکنہ نتائج کے امکانات کا مجموعہ ہمیشہ 1 کے برابر ہوتا ہے: $\\sum f(x) = 1$۔'
  },
  {
    stem: 'For every possible value $x_i$ of a discrete random variable $X$, the probability function $f(x_i)$ must strictly satisfy:',
    options: {
      a: 'Non-negativity ($f(x_i) \\ge 0$)',
      b: 'Negative ($f(x_i) < 0$)',
      c: 'Greater than 1',
      d: 'Equal to 0'
    },
    correct: 'a',
    explanation: 'Probabilities can never be negative: $f(x_i) = P(X = x_i) \\ge 0$ for all $x_i$ (STA301 Handouts Lecture 22, Page 163). Appeared in 8+ midterm papers.',
    urdu_answer: 'پروببلٹی کی بنیادی شرط کے مطابق کسی بھی ویلیو کا امکان منفی نہیں ہو سکتا، یعنی $f(x_i) \\ge 0$۔'
  },
  {
    stem: 'The expected value $E(X)$ of a discrete random variable $X$ is mathematically equal to its:',
    options: {
      a: 'Variance',
      b: 'Arithmetic Mean ($\\mu$)',
      c: 'Standard deviation',
      d: 'Covariance'
    },
    correct: 'b',
    explanation: 'The expected value of a random variable is its long-run average or arithmetic mean: $E(X) = \\mu = \\sum x f(x)$ (STA301 Handouts Lecture 22/23, Page 168). Appeared in 11+ midterm papers.',
    urdu_answer: 'ڈسکریٹ رینڈم ویری ایبل کی متوقع قدر $E(X)$ دراصل اس کے حسابی اوسط (Arithmetic Mean - $\\mu$) کے برابر ہوتی ہے۔'
  },
  {
    stem: 'The cumulative function $F(x) = P(X \\le x)$ giving the cumulative probability up to a specified value $x$ is called the:',
    options: {
      a: 'Probability density function',
      b: 'Cumulative distribution function (CDF)',
      c: 'Probability mass function',
      d: 'Expected value function'
    },
    correct: 'b',
    explanation: 'The Cumulative Distribution Function (CDF), denoted by $F(x)$, gives the accumulated probability that the variable takes a value less than or equal to $x$: $F(x) = P(X \\le x) = \\sum_{t \\le x} f(t)$ (STA301 Handouts Lecture 22/23, Page 165). Appeared in 9+ midterm papers.',
    urdu_answer: 'وہ فنکشن جو $x$ تک کی تمام مجموعی پروببلٹیز کو جمع کرتا ہے $F(x) = P(X \\le x)$، اسے کیوملیٹو ڈسٹری بیوشن فنکشن (CDF) کہتے ہیں۔'
  },
  {
    stem: 'In Bayes\' Theorem, the initial probabilities assigned to mutually exclusive events $A_1, A_2, \\dots, A_k$ before acquiring sample evidence are called:',
    options: {
      a: 'Posterior probabilities',
      b: 'Prior probabilities',
      c: 'Joint probabilities',
      d: 'Conditional probabilities'
    },
    correct: 'b',
    explanation: 'The prior probabilities $P(A_i)$ represent beliefs or objective estimates of events prior to obtaining sample or experimental data (STA301 Handouts Lecture 22, Page 161). Appeared in 8+ midterm papers.',
    urdu_answer: 'بیز تھیورم (Bayes Theorem) میں اضافی معلومات حاصل کرنے سے پہلے کے ابتدائی امکانات کو Prior Probabilities کہا جاتا ہے۔'
  },
  {
    stem: 'In Bayes\' Theorem, the revised or updated conditional probabilities $P(A_i | B)$ calculated after obtaining sample information (event $B$) are called:',
    options: {
      a: 'Prior probabilities',
      b: 'Posterior probabilities',
      c: 'Marginal probabilities',
      d: 'Subjective probabilities'
    },
    correct: 'b',
    explanation: 'The updated probabilities $P(A_i | B)$ computed using Bayes\' formula after observing outcome $B$ are called posterior probabilities (posterior = after the fact) (STA301 Handouts Lecture 22, Page 161). Appeared in 9+ midterm papers.',
    urdu_answer: 'نئی معلومات یا واقعہ B کے سامنے آنے کے بعد نظر ثانی شدہ مشروط امکانات کو Posterior Probabilities کہا جاتا ہے۔'
  },
  {
    stem: 'Bayes\' Theorem can be applied when the sample space $S$ is partitioned into how many mutually exclusive and exhaustive events?',
    options: {
      a: 'Only two events',
      b: 'Only three events',
      c: 'Two or more events ($k \\ge 2$)',
      d: 'Infinite events only'
    },
    correct: 'c',
    explanation: 'Bayes\' Theorem generalizes to any partition of the sample space consisting of $k \\ge 2$ mutually exclusive and exhaustive events $A_1, A_2, \\dots, A_k$ (STA301 Handouts Lecture 22, Page 161). Appeared in 7+ midterm papers.',
    urdu_answer: 'بیز تھیورم کا اطلاق اس وقت ممکن ہوتا ہے جب نمونہ اسپیس کم از کم دو یا دو سے زائد ($k \\ge 2$) باہمی متضاد اور جامع واقعات میں تقسیم ہو۔'
  },
  {
    stem: 'If the probability distribution of $X$ is given by $P(X=1) = 0.1$, $P(X=2) = a$, and $P(X=3) = 0.1$, what is the value of parameter $a$?',
    options: {
      a: '0.6',
      b: '0.8',
      c: '0.2',
      d: '0.4'
    },
    correct: 'b',
    explanation: 'Since the sum of all probabilities must equal 1: $\\sum P(X) = 0.1 + a + 0.1 = 1 \\implies a + 0.2 = 1 \\implies a = 0.8$ (STA301 Handouts Lecture 22, Page 163). Appeared in 8+ midterm papers.',
    urdu_answer: 'چونکہ تمام امکانات کا مجموعہ 1 ہونا لازمی ہے: $0.1 + a + 0.1 = 1 \\implies a = 1 - 0.2 = 0.8$۔'
  },
  {
    stem: 'For a discrete random variable $X$ taking values $x_i$ with probability function $f(x_i)$, the mathematical expectation $E(X)$ is given by:',
    options: {
      a: '$\\sum x_i f(x_i)$',
      b: '$\\sum f(x_i)$',
      c: '$\\sum x_i^2 f(x_i)$',
      d: '$\\frac{\\sum x_i}{n}$'
    },
    correct: 'a',
    explanation: 'The mathematical expectation of a discrete random variable is the weighted sum of its values, weighted by their probabilities: $E(X) = \\sum x_i f(x_i)$ (STA301 Handouts Lecture 22/23, Page 168). Appeared in 10+ midterm papers.',
    urdu_answer: 'ڈسکریٹ رینڈم ویری ایبل کی متوقع قدر کا فارمولا ہر ویلیو اور اس کے امکان کے حاصل ضرب کا مجموعہ ہوتا ہے: $E(X) = \\sum x_i f(x_i)$۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'Define a Discrete Random Variable and provide at least two practical examples from daily life.',
    correct: `<p><strong>Definition of Discrete Random Variable:</strong></p>
<p>A <strong>discrete random variable</strong> is a numerical quantity whose value is determined by the outcome of a random experiment and can take on only a countable number of distinct isolated values (either finite or countably infinite), typically integers: \\(X = 0, 1, 2, 3, \\dots\\).</p>

<p><strong>Practical Examples:</strong></p>
<ol>
  <li>The number of heads obtained when a coin is tossed 5 times (values: 0, 1, 2, 3, 4, 5).</li>
  <li>The number of defective items detected in a manufacturing batch of 100 components.</li>
  <li>The number of foreign tours a minister undertakes in a calendar year.</li>
  <li>The number of incoming calls received at an exchange in a one-hour interval.</li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 22, Page 162. Basic definition and standard examples of discrete variables.',
    urdu_answer: 'ڈسکریٹ رینڈم ویری ایبل وہ متغیر ہے جس کی ممکنہ قیمتیں گنتی کی جا سکیں (جیسے 0, 1, 2, 3) اور ان کے درمیان وقفہ ہو۔ مثال کے طور پر سکے کو 5 بار اچھالنے پر ہیڈز کی تعداد، یا کسی لاٹ میں خراب پرزوں کی تعداد۔'
  },
  {
    stem: 'State the two fundamental mathematical properties that every valid discrete probability distribution must satisfy.',
    correct: `<p><strong>Fundamental Properties of a Discrete Probability Distribution:</strong></p>
<p>Let \\(X\\) be a discrete random variable with probability function \\(f(x_i) = P(X = x_i)\\). The function \\(f(x)\\) is a valid probability mass function (PMF) if and only if it satisfies:</p>

<ol>
  <li><strong>Non-negativity:</strong>
    <p>Every individual probability must be greater than or equal to zero:</p>
    <p>$$f(x_i) \\ge 0 \\quad \\text{for all possible values } x_i$$</p>
  </li>
  <li><strong>Total Probability Axiom:</strong>
    <p>The sum of the probabilities over all possible mutually exclusive outcomes must strictly equal one:</p>
    <p>$$\\sum_{i} f(x_i) = 1$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 22, Page 163. Essential axioms for verifying valid probability distributions.',
    urdu_answer: 'ڈسکریٹ پروببلٹی ڈسٹری بیوشن کی دو بنیادی شرائط ہیں: 1. ہر قیمت کا امکان غیر منفی ہونا چاہیے ($f(x) \\ge 0$)، اور 2. تمام ممکنہ نتائج کے امکانات کا مجموعہ لازماً 1 ہونا چاہیے ($\\sum f(x) = 1$)۔'
  },
  {
    stem: 'Can Bayes\' Theorem be applied when the partition of the sample space $S$ consists of more than two sets? State the generalized Bayes\' theorem formula.',
    correct: `<p><strong>Application to Multiple Partitions:</strong></p>
<p><strong>Yes</strong>, Bayes\' Theorem directly applies whenever a sample space \\(S\\) is partitioned into \\(k\\) mutually exclusive and exhaustive events \\(A_1, A_2, \\dots, A_k\\) (where \\(k \\ge 2\\)), meaning:</p>
<ul>
  <li>\\(A_i \\cap A_j = \\phi\\) for all \\(i \\ne j\\) (mutually exclusive)</li>
  <li>\\(A_1 \\cup A_2 \\cup \\dots \\cup A_k = S\\) (exhaustive)</li>
</ul>

<p><strong>Generalized Bayes\' Theorem Formula:</strong></p>
<p>If \\(B\\) is an observed event such that \\(P(B) > 0\\), then for any specific partition event \\(A_i\\) (\\(i = 1, 2, \\dots, k\\)):</p>
<p>$$P(A_i | B) = \\frac{P(A_i) P(B | A_i)}{\\sum_{j=1}^k P(A_j) P(B | A_j)}$$</p>`,
    explanation: 'From STA301 Handouts Lecture 22, Pages 161–162. Generalization of Bayes rule for k partitions.',
    urdu_answer: 'جی ہاں، بیز تھیورم کو نمونہ اسپیس کی دو یا دو سے زائد ($k \\ge 2$) تقسیمات پر لاگو کیا جا سکتا ہے۔ اس کا عمومی فارمولا ہے: $P(A_i | B) = \\frac{P(A_i) P(B | A_i)}{\\sum_{j=1}^k P(A_j) P(B | A_j)}$۔'
  },
  {
    stem: 'Clearly differentiate between Prior Probability and Posterior Probability in the context of Bayes\' Theorem.',
    correct: `<p><strong>Comparison of Prior vs. Posterior Probabilities:</strong></p>
<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Prior Probability</th>
      <th>Posterior Probability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>Initial probability assigned to an event before observing experimental or sample data.</td>
      <td>Revised/updated conditional probability of an event after incorporating sample evidence.</td>
    </tr>
    <tr>
      <td><strong>Notation</strong></td>
      <td>\\(P(A_i)\\)</td>
      <td>\\(P(A_i | B)\\)</td>
    </tr>
    <tr>
      <td><strong>Source of Information</strong></td>
      <td>Based on historical data, subjective judgment, or prior beliefs.</td>
      <td>Calculated by updating the prior probability using sample evidence \\(B\\) via Bayes\' Theorem.</td>
    </tr>
    <tr>
      <td><strong>Timing</strong></td>
      <td>Assigned <em>before</em> conducting the experiment or observing data.</td>
      <td>Computed <em>after</em> the experiment or observation occurs.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From STA301 Handouts Lecture 22, Page 161. Core conceptual distinction in Bayesian inference.',
    urdu_answer: 'پرائر پروببلٹی $P(A_i)$ نئے تجربے یا ڈیٹا سے پہلے کا ابتدائی امکان ہوتا ہے، جبکہ پوسٹیریئر پروببلٹی $P(A_i | B)$ تجربے یا ثبوت B کے سامنے آنے کے بعد بیز تھیورم کے ذریعے حاصل ہونے والا نظر ثانی شدہ مشروط امکان ہوتا ہے۔'
  }
];

// 4 Long / Numerical Questions
const longQuestions = [
  {
    stem: 'In a developed country, 25% of all cars emit excessive pollutants ($P(A_1) = 0.25$). When tested, 99% of all cars that emit excessive pollutants fail the emission test ($P(B|A_1) = 0.99$), but 17% of cars that do NOT emit excessive pollutants also fail the test ($P(B|A_2) = 0.17$). Using Bayes\' Theorem, calculate the probability that a car that fails the emission test actually emits excessive pollutants ($P(A_1|B)$).',
    correct: `<p><strong>Step-by-Step Bayesian Analysis:</strong></p>

<ol>
  <li><strong>Define Partition Events & Prior Probabilities:</strong>
    <ul>
      <li>Let \\(A_1\\) = Event that a car emits excessive pollutants \\(\\implies P(A_1) = 0.25\\).</li>
      <li>Let \\(A_2\\) = Event that a car does NOT emit excessive pollutants \\(\\implies P(A_2) = 1 - 0.25 = 0.75\\).</li>
      <li>Let \\(B\\) = Event that a car fails the emission test.</li>
    </ul>
  </li>

  <li><strong>Given Conditional Probabilities (Test Accuracy):</strong>
    <ul>
      <li>\\(P(B|A_1) = 0.99\\) (Probability of failing given excessive pollutants).</li>
      <li>\\(P(B|A_2) = 0.17\\) (Probability of false positive failure).</li>
    </ul>
  </li>

  <li><strong>Calculate Joint Probabilities \\(P(A_i \\cap B) = P(A_i) P(B|A_i)\\):</strong>
    <ul>
      <li>\\(P(A_1 \\cap B) = 0.25 \\times 0.99 = 0.2475\\)</li>
      <li>\\(P(A_2 \\cap B) = 0.75 \\times 0.17 = 0.1275\\)</li>
    </ul>
  </li>

  <li><strong>Calculate Total Probability of Failing the Test \\(P(B)\\):</strong>
    <p>$$P(B) = P(A_1 \\cap B) + P(A_2 \\cap B) = 0.2475 + 0.1275 = 0.3750$$</p>
  </li>

  <li><strong>Apply Bayes\' Theorem for \\(P(A_1 | B)\\):</strong>
    <p>$$P(A_1|B) = \\frac{P(A_1 \\cap B)}{P(B)} = \\frac{0.2475}{0.3750} = \\mathbf{0.66 \\text{ (or } 66\\%\\)}$$</p>
  </li>
</ol>
<p><strong>Conclusion:</strong> Given that a car has failed the test, there is a 66% probability that it truly emits excessive pollutants.</p>`,
    explanation: 'From STA301 Handouts Lecture 22, Pages 161–162 (Car pollution emission testing problem). Classic 5-mark Bayes Theorem exam problem.',
    urdu_answer: 'بیز تھیورم کے اطلاق سے: آلودگی پھیلانے والی گاڑی کے فیل ہونے کا مشترکہ امکان $0.25 \\times 0.99 = 0.2475$ اور نہ پھیلانے والی کا فیل ہونا $0.75 \\times 0.17 = 0.1275$ ہے۔ کل فیل ہونے کا امکان $0.3750$ بنتا ہے۔ پس مطلوبہ مشروط امکان $P(A_1|B) = \\frac{0.2475}{0.3750} = 0.66$ (یعنی 66 فیصد) ہے۔'
  },
  {
    stem: 'In a bolt manufacturing plant, 25% of bolts are produced by Machine A ($A_1$), 35% by Machine B ($A_2$), and 40% by Machine C ($A_3$). The past records show that 2%, 4%, and 5% of bolts produced by these respective machines are defective ($B$). If a randomly selected bolt is inspected and found to be defective, calculate the probability that it was manufactured by Machine A ($P(A_1|B)$).',
    correct: `<p><strong>Step-by-Step Bayesian Solution:</strong></p>

<ol>
  <li><strong>Identify Prior Probabilities of Production:</strong>
    <ul>
      <li>\\(P(A_1) = 0.25\\) (Produced by Machine A)</li>
      <li>\\(P(A_2) = 0.35\\) (Produced by Machine B)</li>
      <li>\\(P(A_3) = 0.40\\) (Produced by Machine C)</li>
    </ul>
  </li>

  <li><strong>Identify Conditional Defective Probabilities:</strong>
    <ul>
      <li>\\(P(B|A_1) = 0.02\\)</li>
      <li>\\(P(B|A_2) = 0.04\\)</li>
      <li>\\(P(B|A_3) = 0.05\\)</li>
    </ul>
  </li>

  <li><strong>Compute Joint Probabilities \\(P(A_i \\cap B) = P(A_i) P(B|A_i)\\):</strong>
    <ul>
      <li>\\(P(A_1 \\cap B) = 0.25 \\times 0.02 = 0.0050\\)</li>
      <li>\\(P(A_2 \\cap B) = 0.35 \\times 0.04 = 0.0140\\)</li>
      <li>\\(P(A_3 \\cap B) = 0.40 \\times 0.05 = 0.0200\\)</li>
    </ul>
  </li>

  <li><strong>Total Probability of Selecting a Defective Bolt \\(P(B)\\):</strong>
    <p>$$P(B) = \\sum_{i=1}^3 P(A_i \\cap B) = 0.0050 + 0.0140 + 0.0200 = 0.0390$$</p>
  </li>

  <li><strong>Apply Bayes\' Theorem to find \\(P(A_1 | B)\\):</strong>
    <p>$$P(A_1|B) = \\frac{P(A_1 \\cap B)}{P(B)} = \\frac{0.0050}{0.0390} = \\frac{5}{39} = \\mathbf{\\frac{5}{39} \\approx 0.1282 \\text{ (or } 12.82\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 22, Page 162. Standard 3-machine Bayes Theorem manufacturing problem.',
    urdu_answer: 'مشین A کے نٹ بننے اور خراب ہونے کا مشترکہ امکان $0.0050$ ہے، جبکہ فیکٹری کے تمام خراب نٹس کا کل امکان $0.0390$ ہے۔ بیز تھیورم کے فارمولے سے مشین A سے ہونے کا امکان $P(A_1|B) = \\frac{0.0050}{0.0390} = \\frac{5}{39} \\approx 0.1282$ (12.82 فیصد) ہے۔'
  },
  {
    stem: 'The probability distribution of the discrete random variable $X$, representing the number of foreign tours a minister makes in a year, is given as follows: $P(X=1) = 0.1$, $P(X=2) = 0.2$, $P(X=3) = 0.3$, $P(X=4) = 0.3$, and $P(X=5) = 0.1$. Verify that this is a valid probability distribution, and calculate: 1. $P(2 < X < 5)$, 2. $P(X \\le 4)$, and 3. $P(X \\ge 3)$.',
    correct: `<p><strong>Step-by-Step Solution:</strong></p>

<ol>
  <li><strong>Verification of Validity:</strong>
    <ul>
      <li>Non-negativity: Each probability is non-negative (\\(0.1, 0.2, 0.3, 0.3, 0.1 \\ge 0\\)).</li>
      <li>Sum of probabilities:
        <p>$$\\sum P(X) = 0.1 + 0.2 + 0.3 + 0.3 + 0.1 = 1.0$$</p>
        Hence, it is a perfectly valid discrete probability distribution.
      </li>
    </ul>
  </li>

  <li><strong>Calculate \\(P(2 < X < 5)\\):</strong>
    <p>The values strictly between 2 and 5 are \\(X = 3\\) and \\(X = 4\\):</p>
    <p>$$P(2 < X < 5) = P(X = 3) + P(X = 4) = 0.3 + 0.3 = \\mathbf{0.6}$$</p>
  </li>

  <li><strong>Calculate \\(P(X \\le 4)\\):</strong>
    <p>Using cumulative addition or complementation:</p>
    <p>$$P(X \\le 4) = P(X = 1) + P(X = 2) + P(X = 3) + P(X = 4) = 0.1 + 0.2 + 0.3 + 0.3 = \\mathbf{0.9}$$</p>
    <p>(Or via complement: \\(1 - P(X = 5) = 1 - 0.1 = 0.9\\)).</p>
  </li>

  <li><strong>Calculate \\(P(X \\ge 3)\\):</strong>
    <p>$$P(X \\ge 3) = P(X = 3) + P(X = 4) + P(X = 5) = 0.3 + 0.3 + 0.1 = \\mathbf{0.7}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 22, Page 163; Moaaz Midterm Subjectives Spring 2011. Frequent 5-mark distribution calculation problem.',
    urdu_answer: 'امکانات کا مجموعہ $0.1+0.2+0.3+0.3+0.1 = 1.0$ ہے، لہٰذا یہ درست ڈسٹری بیوشن ہے۔ مطلوبہ امکانات: 1. $P(2 < X < 5) = 0.3 + 0.3 = 0.6$، 2. $P(X \\le 4) = 0.9$، اور 3. $P(X \\ge 3) = 0.7$۔'
  },
  {
    stem: 'The number of annual airplane accidents in a region is a discrete random variable $X$ taking values 1, 2, 3, 4 with corresponding probabilities $1/6, 2/6, 2/6, 1/6$. Calculate: 1. The expected number of accidents $E(X)$, 2. $E(X^2)$, and 3. The variance $Var(X)$ of annual accidents.',
    correct: `<p><strong>Step-by-Step Calculation of Mean and Variance:</strong></p>

<table border="1" cellpadding="6" style="border-collapse:collapse; width:100%; text-align:center;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>\\(x\\)</th>
      <th>\\(P(x)\\)</th>
      <th>\\(x P(x)\\)</th>
      <th>\\(x^2\\)</th>
      <th>\\(x^2 P(x)\\)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>1/6</td><td>1/6</td><td>1</td><td>1/6</td></tr>
    <tr><td>2</td><td>2/6</td><td>4/6</td><td>4</td><td>8/6</td></tr>
    <tr><td>3</td><td>2/6</td><td>6/6</td><td>9</td><td>18/6</td></tr>
    <tr><td>4</td><td>1/6</td><td>4/6</td><td>16</td><td>16/6</td></tr>
    <tr style="font-weight:bold; background-color:#fafafa;">
      <td>Total</td>
      <td>6/6 = 1.0</td>
      <td>15/6</td>
      <td>-</td>
      <td>43/6</td>
    </tr>
  </tbody>
</table>

<ol>
  <li><strong>Expected Value \\(E(X)\\) (Mean):</strong>
    <p>$$E(X) = \\sum x P(x) = \\frac{15}{6} = \\mathbf{2.5 \\text{ (or } 5/2)}$$</p>
  </li>

  <li><strong>Expected Value of \\(X^2\\) \\(E(X^2)\\):</strong>
    <p>$$E(X^2) = \\sum x^2 P(x) = \\frac{43}{6}$$</p>
  </li>

  <li><strong>Variance \\(Var(X)\\):</strong>
    <p>$$Var(X) = E(X^2) - [E(X)]^2$$</p>
    <p>$$Var(X) = \\frac{43}{6} - \\left(\\frac{5}{2}\\right)^2 = \\frac{43}{6} - \\frac{25}{4}$$</p>
    <p>Taking common denominator (12):</p>
    <p>$$Var(X) = \\frac{86 - 75}{12} = \\mathbf{\\frac{11}{12} \\approx 0.9167}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 22/23; Moaaz Midterm Subjectives Fall 2012. Standard 5-mark numerical testing expectation and variance.',
    urdu_answer: 'حسابی اوسط $E(X) = 15/6 = 2.5$ ہے۔ $E(X^2) = 43/6$ ہے۔ متغیر کا تغیر (Variance) فارمولا $Var(X) = E(X^2) - [E(X)]^2$ سے حل کرنے پر $\\frac{43}{6} - \\frac{25}{4} = \\frac{11}{12} \\approx 0.9167$ حاصل ہوتا ہے۔'
  }
];

// 5. Execute insertions
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

// 6. Verification counts
const countRow = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
const totalRow = db.prepare("SELECT count(*) as count FROM questions").get();
const lecCount = db.prepare("SELECT count(*) as count FROM lectures").get();
const subCount = db.prepare("SELECT count(*) as count FROM subjects").get();

console.log('--- SEEDING COMPLETE ---');
console.log(`Lecture 22 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

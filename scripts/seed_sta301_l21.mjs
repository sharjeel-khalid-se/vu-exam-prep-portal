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

// 2. Create or fetch Lecture 21
let lec21 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 21").get(sta301.id);
if (!lec21) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 21, 'Independent Events, Special Multiplication Rule, and Marginal Probabilities')
  `).run(sta301.id);
  lec21 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 21 with ID: ${lec21.id}`);
} else {
  console.log(`STA301 Lecture 21 already exists with ID: ${lec21.id}`);
}

const lId = lec21.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 21.`);

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

// 9 MCQs
const mcqs = [
  {
    stem: 'If the probability of one event is NOT affected by the occurrence or non-occurrence of another event, then both events are said to be:',
    options: {
      a: 'Dependent',
      b: 'Mutually Exclusive',
      c: 'Independent',
      d: 'Exhaustive'
    },
    correct: 'c',
    explanation: 'By definition, two events $A$ and $B$ are independent if the occurrence of one does not affect the occurrence of the other, so $P(A|B) = P(A)$ and $P(B|A) = P(B)$ (STA301 Handouts Lecture 21, Page 162). Appeared in 12+ midterm papers.',
    urdu_answer: 'اگر کسی ایک واقعے کے رونما ہونے یا نہ ہونے سے دوسرے واقعے کے امکان پر کوئی اثر نہ پڑے، تو ایسے واقعات کو آزاد یا خودمختار (Independent) واقعات کہا جاتا ہے۔'
  },
  {
    stem: 'If $A$ and $B$ are two statistically independent events, then the probability of their simultaneous occurrence $P(A \\cap B)$ equals:',
    options: {
      a: '$P(A) + P(B)$',
      b: '$P(A) \\times P(B)$',
      c: '$P(A) \\times P(B|A)$',
      d: '$P(A) / P(B)$'
    },
    correct: 'b',
    explanation: 'Under statistical independence, $P(B|A) = P(B)$. Hence, the general multiplication theorem simplifies to the Special Multiplication Rule: $P(A \\cap B) = P(A) \\times P(B)$ (STA301 Handouts Lecture 21, Page 162). Appeared in 15+ midterm papers.',
    urdu_answer: 'خودمختار واقعات کے لیے ضرب کا خصوصی اصول $P(A \\cap B) = P(A) \\times P(B)$ ہوتا ہے۔'
  },
  {
    stem: 'For two independent events $A$ and $B$, if $P(A) = 0.25$ and $P(B) = 0.40$, then $P(A \\cap B)$ equals:',
    options: {
      a: '0.65',
      b: '0.10',
      c: '0.50',
      d: '0.15'
    },
    correct: 'b',
    explanation: 'Since $A$ and $B$ are independent: $P(A \\cap B) = P(A) \\times P(B) = 0.25 \\times 0.40 = 0.10$ (STA301 Handouts Lecture 21, Page 162). Appeared in 11+ midterm papers.',
    urdu_answer: 'آزاد واقعات کے ضربی فارمولے سے: $P(A \\cap B) = 0.25 \\times 0.40 = 0.10$۔'
  },
  {
    stem: 'For two independent events $A$ and $B$, if $P(A) = 0.2$ and $P(B) = 0.4$, what is $P(A \\cap B)$?',
    options: {
      a: '0.06',
      b: '0.08',
      c: '0.02',
      d: '0.04'
    },
    correct: 'b',
    explanation: 'For independent events: $P(A \\cap B) = P(A) \\times P(B) = 0.2 \\times 0.4 = 0.08$ (STA301 Handouts Lecture 21, Page 162). Appeared in 9+ midterm papers.',
    urdu_answer: 'آزاد واقعات کے لیے مشترکہ امکان: $0.2 \\times 0.4 = 0.08$۔'
  },
  {
    stem: 'Events $A$ and $B$ are independent. If $P(A) = 0.40$ and $P(B) = 0.30$, find $P(A \\cap B)$:',
    options: {
      a: '0.70',
      b: '0.12',
      c: '0.10',
      d: '0.30'
    },
    correct: 'b',
    explanation: 'By the special multiplication rule: $P(A \\cap B) = P(A) \\times P(B) = 0.40 \\times 0.30 = 0.12$ (STA301 Midterm Solved Papers). Appeared in 8+ midterm papers.',
    urdu_answer: 'آزاد واقعات کے لیے: $0.40 \\times 0.30 = 0.12$۔'
  },
  {
    stem: 'If two events $A$ and $B$ are statistically independent, then the conditional probability $P(A|B)$ is equal to:',
    options: {
      a: '$P(B)$',
      b: '$P(A)$',
      c: '$P(A) P(B)$',
      d: 'Zero'
    },
    correct: 'b',
    explanation: 'Statistical independence means that knowing $B$ has occurred provides zero information about the likelihood of $A$, meaning $P(A|B) = P(A)$ (STA301 Handouts Lecture 21, Page 162). Appeared in 10+ midterm papers.',
    urdu_answer: 'جب دو واقعات خودمختار ہوں تو B کے وقوع پذیر ہونے سے A کا امکان تبدیل نہیں ہوتا، لہٰذا $P(A|B) = P(A)$ ہوگا۔'
  },
  {
    stem: 'Sampling WITH replacement from a finite population results in:',
    options: {
      a: 'Dependent events',
      b: 'Independent events',
      c: 'Mutually exclusive events',
      d: 'Exhaustive events'
    },
    correct: 'b',
    explanation: 'When sampling is done with replacement, the drawn item is returned before the next draw, keeping the population composition and individual probabilities identical on successive trials (hence independent) (STA301 Handouts Lecture 21, Page 162). Appeared in 7+ midterm papers.',
    urdu_answer: 'واپسی کے ساتھ سیمپلنگ (Sampling with replacement) میں آبادی کی ساخت اور امکانات برقرار رہتے ہیں، جس کی وجہ سے تمام ٹرائلز آزاد (Independent) ہوتے ہیں۔'
  },
  {
    stem: 'In a bivariate probability distribution table, the individual probability distribution of $X$ or $Y$ obtained by summing joint probabilities across rows or columns is called:',
    options: {
      a: 'Conditional probability',
      b: 'Joint probability',
      c: 'Marginal probability',
      d: 'Prior probability'
    },
    correct: 'c',
    explanation: 'The unconditional probabilities found along the margins of a joint probability table by summing across rows ($g(x) = \\sum_j f(x, y_j)$) or columns ($h(y) = \\sum_i f(x_i, y)$) are called marginal probabilities (STA301 Handouts Lecture 21, Pages 163–164). Appeared in 6+ papers.',
    urdu_answer: 'مشترکہ امکانات کے جدول میں قطاروں یا کالموں کا مجموعہ کر کے حاصل ہونے والے امکان کو مارجنل پروببلٹی (Marginal Probability) کہا جاتا ہے۔'
  },
  {
    stem: 'Two discrete random variables $X$ and $Y$ are statistically independent if and only if their joint probability function $f(x, y)$ equals:',
    options: {
      a: '$g(x) + h(y)$',
      b: '$g(x) / h(y)$',
      c: '$g(x) \\cdot h(y)$ for all $(x_i, y_j)$',
      d: '$g(x) - h(y)$'
    },
    correct: 'c',
    explanation: 'Random variables $X$ and $Y$ are independent if and only if their joint probability function factors into the product of their respective marginal probability functions for all pairs of values: $f(x_i, y_j) = g(x_i) \\cdot h(y_j)$ (STA301 Handouts Lecture 21, Page 164). Appeared in 8+ papers.',
    urdu_answer: 'دو متغیرات X اور Y اس وقت شماریاتی طور پر آزاد ہوتے ہیں جب ان کا مشترکہ پروببلٹی فنکشن ان کے مارجنل پروببلٹی فنکشنز کے حاصل ضرب کے برابر ہو: $f(x, y) = g(x) \\cdot h(y)$۔'
  }
];

// 3 Short Questions
const shortQuestions = [
  {
    stem: 'Define Independent Events and Stochastic Independence. State the special multiplication rule along with equivalent conditional formulations.',
    correct: `<p><strong>Definition of Independent Events:</strong></p>
<p>Two events \\(A\\) and \\(B\\) defined on the same sample space are said to be <strong>statistically / stochastically independent</strong> if the occurrence or non-occurrence of one event has no influence on the probability of the occurrence of the other event.</p>

<p><strong>Special Multiplication Rule:</strong></p>
<p>Two events \\(A\\) and \\(B\\) are independent if and only if their joint probability equals the product of their individual probabilities:</p>
<p>$$P(A \\cap B) = P(A) \\cdot P(B)$$</p>

<p><strong>Equivalent Conditional Statements:</strong></p>
<ul>
  <li>\\(P(A|B) = P(A)\\) (provided \\(P(B) > 0\\))</li>
  <li>\\(P(B|A) = P(B)\\) (provided \\(P(A) > 0\\))</li>
</ul>
<p>For \\(k\\) mutually independent events \\(A_1, A_2, \\dots, A_k\\), this rule extends to: \\(P(A_1 \\cap A_2 \\cap \\dots \\cap A_k) = P(A_1) P(A_2) \\dots P(A_k)\\).</p>`,
    explanation: 'From STA301 Handouts Lecture 21, Page 162. Fundamental definition and rule of stochastic independence.',
    urdu_answer: 'اگر ایک واقعے کے رونما ہونے سے دوسرے واقعے کے امکان پر کوئی فرق نہ پڑے تو وہ آزاد واقعات کہلاتے ہیں۔ اس کی ریاضیاتی شرط یہ ہے کہ $P(A \\cap B) = P(A) \\cdot P(B)$، اور مساوی طور پر $P(A|B) = P(A)$ اور $P(B|A) = P(B)$۔'
  },
  {
    stem: 'Evaluate whether the equation $P(A|B) = P(B|A)$ holds true when $P(A) = P(B)$. State whether the assertion is true or false and provide a rigorous mathematical justification.',
    correct: `<p><strong>Statement:</strong> <strong>TRUE</strong>.</p>

<p><strong>Rigorous Mathematical Justification:</strong></p>
<ol>
  <li>By the standard definition of conditional probability:
    <p>$$P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad \\text{and} \\quad P(B|A) = \\frac{P(A \\cap B)}{P(A)}$$</p>
  </li>
  <li>Notice that the numerator in both expressions is identical, as the joint event is commutative:
    <p>$$P(A \\cap B) = P(B \\cap A)$$</p>
  </li>
  <li>We are given the condition that:
    <p>$$P(A) = P(B)$$</p>
  </li>
  <li>Substituting \\(P(B)\\) in place of \\(P(A)\\) in the denominator of \\(P(B|A)\\):
    <p>$$P(B|A) = \\frac{P(A \\cap B)}{P(B)} = P(A|B)$$</p>
  </li>
</ol>
<p>Hence, whenever two events have equal marginal probabilities, their conditional probabilities are symmetric.</p>`,
    explanation: 'From STA301 Midterm Solved Subjectives by Moaaz (Spring 2011, Q4). A frequently examined conceptual proof.',
    urdu_answer: 'یہ بیان بالکل درست (TRUE) ہے۔ مشروط امکان کے فارمولے میں چونکہ مشترکہ امکان $P(A \\cap B)$ دونوں میں یکساں ہوتا ہے، لہٰذا اگر $P(A) = P(B)$ ہو تو مخرج برابر ہونے سے $P(A|B) = P(B|A)$ ثابت ہو جاتا ہے۔'
  },
  {
    stem: 'Define Marginal Probability and Marginal Probability Functions for a bivariate distribution. Explain how they are computed from a joint probability table.',
    correct: `<p><strong>Definition of Marginal Probability:</strong></p>
<p>In a bivariate (two-variable) probability distribution, marginal probability refers to the individual, unconditional probability distribution of a single random variable (either \\(X\\) or \\(Y\\)), obtained by summing out (marginalizing) the other variable over all its possible values.</p>

<p><strong>Formulas for Discrete Random Variables:</strong></p>
<ol>
  <li><strong>Marginal Probability Function of \\(X\\) \\(g(x)\\):</strong>
    <p>$$g(x_i) = \\sum_{j} f(x_i, y_j)$$</p>
    (Obtained by summing the joint probabilities in row \\(i\\) across all columns \\(y_j\\)).
  </li>
  <li><strong>Marginal Probability Function of \\(Y\\) \\(h(y)\\):</strong>
    <p>$$h(y_j) = \\sum_{i} f(x_i, y_j)$$</p>
    (Obtained by summing the joint probabilities in column \\(j\\) down all rows \\(x_i\\)).
  </li>
</ol>
<p><strong>Property:</strong> The sum of all marginal probabilities for any variable always equals 1: \\(\\sum_i g(x_i) = 1\\) and \\(\\sum_j h(y_j) = 1\\).</p>`,
    explanation: 'From STA301 Handouts Lecture 21, Pages 163–164. Basic foundation for joint, marginal, and conditional distributions.',
    urdu_answer: 'دو متغیرات کے مشترکہ جدول میں کسی ایک متغیر کے انفرادی امکان کو مارجنل پروببلٹی کہتے ہیں۔ X کا مارجنل فنکشن قطار کے تمام امکانات کو جمع کر کے: $g(x) = \\sum_j f(x, y_j)$ اور Y کا کالم کے تمام امکانات کو جمع کر کے: $h(y) = \\sum_i f(x_i, y)$ حاصل کیا جاتا ہے۔'
  }
];

// 3 Long / Numerical Questions
const longQuestions = [
  {
    stem: 'Bag 1 contains 10 white and 3 black balls. Bag 2 contains 3 white and 5 black balls. Two balls are transferred at random from Bag 1 into Bag 2, and then one ball is drawn from Bag 2. Calculate the probability that the drawn ball is WHITE. Show all transfer events, conditional probabilities, and the total probability calculation.',
    correct: `<p><strong>Complete Step-by-Step Solution:</strong></p>

<ol>
  <li><strong>Define the Transfer Events from Bag 1:</strong>
    <p>Bag 1 has 13 balls (10 white, 3 black). Total ways to choose 2 balls = \\(\\binom{13}{2} = \\frac{13 \\times 12}{2} = 78\\).</p>
    <ul>
      <li><strong>Event \\(A_1\\):</strong> 2 White balls transferred:
        <p>$$P(A_1) = \\frac{\\binom{10}{2}}{\\binom{13}{2}} = \\frac{45}{78}$$</p>
      </li>
      <li><strong>Event \\(A_2\\):</strong> 1 White and 1 Black ball transferred:
        <p>$$P(A_2) = \\frac{\\binom{10}{1} \\binom{3}{1}}{\\binom{13}{2}} = \\frac{10 \\times 3}{78} = \\frac{30}{78}$$</p>
      </li>
      <li><strong>Event \\(A_3\\):</strong> 2 Black balls transferred:
        <p>$$P(A_3) = \\frac{\\binom{3}{2}}{\\binom{13}{2}} = \\frac{3}{78}$$</p>
      </li>
    </ul>
  </li>

  <li><strong>Conditional Probabilities of Drawing a White Ball (\\(W\\)) from Bag 2:</strong>
    <p>Bag 2 originally contains 8 balls (3 white, 5 black). After receiving 2 balls, it contains 10 balls.</p>
    <ul>
      <li>Under \\(A_1\\): Bag 2 has 5 White and 5 Black balls:
        <p>$$P(W|A_1) = \\frac{5}{10}$$</p>
      </li>
      <li>Under \\(A_2\\): Bag 2 has 4 White and 6 Black balls:
        <p>$$P(W|A_2) = \\frac{4}{10}$$</p>
      </li>
      <li>Under \\(A_3\\): Bag 2 has 3 White and 7 Black balls:
        <p>$$P(W|A_3) = \\frac{3}{10}$$</p>
      </li>
    </ul>
  </li>

  <li><strong>Apply the Law of Total Probability:</strong>
    <p>$$P(W) = P(A_1) P(W|A_1) + P(A_2) P(W|A_2) + P(A_3) P(W|A_3)$$</p>
    <p>$$P(W) = \\left(\\frac{45}{78}\\right)\\left(\\frac{5}{10}\\right) + \\left(\\frac{30}{78}\\right)\\left(\\frac{4}{10}\\right) + \\left(\\frac{3}{78}\\right)\\left(\\frac{3}{10}\\right)$$</p>
    <p>$$P(W) = \\frac{225 + 120 + 9}{780} = \\frac{354}{780}$$</p>
    <p>Dividing numerator and denominator by 6:</p>
    <p>$$P(W) = \\mathbf{\\frac{59}{130} \\approx 0.4538 \\text{ (or } 45.38\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 21, Pages 161–162 (Example on ball transfer using combined addition and multiplication theorems). Classic 5-mark subjective problem.',
    urdu_answer: 'بیگ 1 سے 2 گیندوں کی منتقلی کے 3 ممکنہ واقعات ہیں: 2 سفید (45/78)، 1 سفید و 1 سیاہ (30/78)، اور 2 سیاہ (3/78)۔ بیگ 2 میں اب 10 گیندیں ہو جاتی ہیں۔ لا آف ٹوٹل پروببلٹی لگا کر سفید گیند حاصل کرنے کا امکان $\\frac{354}{780} = \\frac{59}{130} \\approx 0.4538$ (تقریباً 45.38 فیصد) بنتا ہے۔'
  },
  {
    stem: '$A$ and $B$ are two statistically independent events with individual probabilities $P(A) = 0.40$ and $P(B) = 0.30$. Calculate: 1. $P(A \\cap B)$, 2. $P(A \\cup B)$, and 3. $P(A|B)$. State the reasoning for each step.',
    correct: `<p><strong>Step-by-Step Calculation:</strong></p>
<ol>
  <li><strong>Calculation of Joint Probability \\(P(A \\cap B)\\):</strong>
    <p>Since events \\(A\\) and \\(B\\) are statistically independent, the special multiplication rule applies:</p>
    <p>$$P(A \\cap B) = P(A) \\cdot P(B) = 0.40 \\times 0.30 = \\mathbf{0.12}$$</p>
  </li>
  <li><strong>Calculation of Union \\(P(A \\cup B)\\):</strong>
    <p>By the General Addition Theorem:</p>
    <p>$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$</p>
    <p>$$P(A \\cup B) = 0.40 + 0.30 - 0.12 = \\mathbf{0.58}$$</p>
  </li>
  <li><strong>Calculation of Conditional Probability \\(P(A|B)\\):</strong>
    <p>By independence of events:</p>
    <p>$$P(A|B) = P(A) = \\mathbf{0.40}$$</p>
    <p>(Or verified by definition: \\(P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.12}{0.30} = 0.40\\)).</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 21, Page 162; Moaaz Midterm Solved Papers. Comprehensive 5-mark numerical testing both addition and multiplication rules.',
    urdu_answer: 'آزاد واقعات کے اصولوں کے مطابق: 1. مشترکہ امکان $P(A \\cap B) = 0.40 \\times 0.30 = 0.12$، 2. یونین $P(A \\cup B) = 0.40 + 0.30 - 0.12 = 0.58$، اور 3. مشروط امکان $P(A|B) = P(A) = 0.40$۔'
  },
  {
    stem: 'Given a joint probability distribution table where $f(0, 1) = \\frac{6}{28}$, marginal probability $g(0) = \\frac{10}{28}$, and marginal probability $h(1) = \\frac{12}{28}$. Determine with complete proof whether the random variables $X$ and $Y$ are statistically independent.',
    correct: `<p><strong>Proof and Determination of Statistical Independence:</strong></p>

<ol>
  <li><strong>Criterion for Independence in Bivariate Distributions:</strong>
    <p>Two discrete random variables \\(X\\) and \\(Y\\) are statistically independent if and only if:</p>
    <p>$$f(x_i, y_j) = g(x_i) \\cdot h(y_j) \\quad \\text{for ALL pairs } (x_i, y_j)$$</p>
    <p>If this equality fails for even a single pair, the variables are dependent.</p>
  </li>

  <li><strong>Evaluate the Given Pair \\((x=0, y=1)\\):</strong>
    <p>Given joint probability:</p>
    <p>$$f(0, 1) = \\frac{6}{28} = \\frac{3}{14} \\approx 0.2143$$</p>
    <p>Compute the product of the marginal probabilities:</p>
    <p>$$g(0) \\cdot h(1) = \\left(\\frac{10}{28}\\right) \\times \\left(\\frac{12}{28}\\right) = \\frac{120}{784} = \\frac{15}{98} \\approx 0.1531$$</p>
  </li>

  <li><strong>Comparison:</strong>
    <p>$$\\frac{6}{28} = \\frac{42}{196} \\neq \\frac{15}{98} = \\frac{30}{196}$$</p>
    <p>$$f(0, 1) \\neq g(0) \\cdot h(1)$$</p>
  </li>

  <li><strong>Conclusion:</strong>
    <p>Since the joint probability does not equal the product of its marginal probabilities at \\((0, 1)\\), the random variables \\(X\\) and \\(Y\\) are <strong>NOT statistically independent (they are dependent)</strong>.</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 21, Page 164; Lecture 26, Page 203. Standard 5-mark statistical independence verification problem.',
    urdu_answer: 'شماریاتی آزادی کی شرط یہ ہے کہ تمام جوڑوں کے لیے $f(x, y) = g(x) \\cdot h(y)$ ہونا چاہیے۔ چونکہ $g(0) \\cdot h(1) = \\frac{15}{98} \\approx 0.1531$ ہے اور یہ مشترکہ امکان $f(0, 1) = \\frac{6}{28} \\approx 0.2143$ کے برابر نہیں ہے، لہٰذا متغیرات X اور Y آپس میں آزاد نہیں ہیں بلکہ منحصر (Dependent) ہیں۔'
  }
];

// 4. Execute insertions
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

// 5. Verification counts
const countRow = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
const totalRow = db.prepare("SELECT count(*) as count FROM questions").get();
const lecCount = db.prepare("SELECT count(*) as count FROM lectures").get();
const subCount = db.prepare("SELECT count(*) as count FROM subjects").get();

console.log('--- SEEDING COMPLETE ---');
console.log(`Lecture 21 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

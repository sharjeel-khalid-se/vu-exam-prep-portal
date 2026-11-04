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

// 2. Create or fetch Lecture 17
let lec17 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 17").get(sta301.id);
if (!lec17) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 17, 'Permutations, Combinations, Sample Space, and Event Types')
  `).run(sta301.id);
  lec17 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 17 with ID: ${lec17.id}`);
} else {
  console.log(`STA301 Lecture 17 already exists with ID: ${lec17.id}`);
}

const lId = lec17.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 17.`);

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
    stem: 'What is the fundamental difference between a permutation and a combination?',
    options: {
      a: 'In a permutation order is important, whereas in a combination order is not important',
      b: 'In a permutation order is not important, whereas in a combination order is important',
      c: 'A combination is based on classical probability while a permutation is not',
      d: 'A permutation applies only to infinite sets while combinations apply to finite sets'
    },
    correct: 'a',
    explanation: 'A permutation is an ordered sequence/arrangement of items where order matters ($AB \\ne BA$). A combination is an unordered selection of items where order does not matter ($\\{A, B\\} = \\{B, A\\}$) (STA301 Handouts Lecture 17, Pages 137–141). Appeared in 12+ midterm papers.',
    urdu_answer: 'پرموٹیشن میں اشیاء کی ترتیب (Order) کا خیال رکھا جاتا ہے جبکہ کمبی نیشن میں ترتیب کی کوئی اہمیت نہیں ہوتی۔'
  },
  {
    stem: 'When a fair balanced coin is tossed 3 times, the total number of sample points in the sample space is:',
    options: {
      a: '3',
      b: '8',
      c: '6',
      d: '4'
    },
    correct: 'b',
    explanation: 'By the multiplication rule of counting, each coin toss has 2 outcomes (H, T). Tossing the coin 3 times yields $2 \\times 2 \\times 2 = 2^3 = 8$ sample points (STA301 Handouts Lecture 17, Page 145). Appeared in 10+ midterm papers.',
    urdu_answer: 'سکے کو 3 بار اچھالنے پر سیمپل اسپیس میں ممکنہ نتائج کی کل تعداد $2^3 = 8$ ہوتی ہے۔'
  },
  {
    stem: 'When two balanced standard six-sided dice are rolled simultaneously, the total number of sample points in the sample space is:',
    options: {
      a: '6',
      b: '12',
      c: '24',
      d: '36'
    },
    correct: 'd',
    explanation: 'Each die has 6 possible outcomes. Rolling two dice generates a sample space of $6 \\times 6 = 6^2 = 36$ ordered pairs $(x, y)$ (STA301 Handouts Lecture 17, Page 145). Appeared in 9+ midterm papers.',
    urdu_answer: 'دو لڈو کے دانوں کو ایک ساتھ پھینکنے پر سیمپل اسپیس میں کل $6 \\times 6 = 36$ نتائج بنتے ہیں۔'
  },
  {
    stem: 'When a fair coin is tossed 4 times, the total number of sample points in the resulting sample space is:',
    options: {
      a: '4',
      b: '8',
      c: '12',
      d: '16'
    },
    correct: 'd',
    explanation: 'Applying the power rule for repeated binary trials: $2^n = 2^4 = 16$ distinct outcome sequences (STA301 Handouts Lecture 17, Page 145). Appeared in 5+ midterm papers.',
    urdu_answer: 'ایک سکے کو 4 بار اچھالنے پر سیمپل پوائنٹس کی کل تعداد $2^4 = 16$ ہوتی ہے۔'
  },
  {
    stem: 'In probability theory, an event that contains more than one sample point is defined as a(n):',
    options: {
      a: 'Mutually exclusive event',
      b: 'Normal event',
      c: 'Simple event',
      d: 'Compound event'
    },
    correct: 'd',
    explanation: 'A compound event is an event composed of two or more elementary outcomes (e.g., getting an even number on a die $\\{2, 4, 6\\}$) (STA301 Handouts Lecture 17, Page 145). Appeared in 8+ midterm papers.',
    urdu_answer: 'ایسا واقعہ (Event) جو ایک سے زیادہ سیمپل پوائنٹس پر مشتمل ہو، کمپاؤنڈ ایونٹ (Compound event) کہلاتا ہے۔'
  },
  {
    stem: 'An event that contains exactly one single sample point from the sample space is defined as a:',
    options: {
      a: 'Simple event',
      b: 'Compound event',
      c: 'Mutually exclusive event',
      d: 'Exhaustive event'
    },
    correct: 'a',
    explanation: 'A simple event (or elementary event) contains only one sample outcome (e.g., getting a 6 on a single die roll $\\{6\\}$) (STA301 Handouts Lecture 17, Page 145). Appeared in 6+ midterm papers.',
    urdu_answer: 'ایسا واقعہ جو صرف ایک ہی سیمپل پوائنٹ پر مشتمل ہو، سادہ واقعہ یعنی سمپل ایونٹ (Simple event) کہلاتا ہے۔'
  },
  {
    stem: 'Two events $A$ and $B$ belonging to the same sample space are said to be Mutually Exclusive if they:',
    options: {
      a: 'Cannot occur at the same time (have no outcomes in common: $A \\cap B = \\phi$)',
      b: 'Always occur simultaneously',
      c: 'Are statistically independent of each other',
      d: 'Form an exhaustive union'
    },
    correct: 'a',
    explanation: 'Mutually exclusive (disjoint) events cannot happen simultaneously in a single trial of an experiment ($A \\cap B = \\phi$) (STA301 Handouts Lecture 17, Page 146). Appeared in 10+ midterm papers.',
    urdu_answer: 'دو واقعات اس وقت باہم غیر مشترک (Mutually exclusive) کہلاتے ہیں جب وہ دونوں ایک ساتھ رونما نہ ہو سکیں ($A \\cap B = \\phi$)۔'
  },
  {
    stem: 'A set of events $A_1, A_2, \\dots, A_k$ is said to be Collectively Exhaustive when:',
    options: {
      a: 'Their intersection is empty',
      b: 'Their union constitutes the entire sample space $S$ ($A_1 \\cup A_2 \\cup \\dots \\cup A_k = S$)',
      c: 'Their individual probabilities sum to zero',
      d: 'They are completely independent'
    },
    correct: 'b',
    explanation: 'Events are collectively exhaustive if at least one of them must occur whenever the experiment is performed, meaning their union equals $S$ (STA301 Handouts Lecture 17, Page 147). Appeared in 7+ midterm papers.',
    urdu_answer: 'واقعات اس وقت مکمل یعنی Collectively Exhaustive کہلاتے ہیں جب ان سب کا یونین پورے سیمپل اسپیس $S$ کے برابر ہو۔'
  },
  {
    stem: 'When each individual outcome in a sample space has exactly the same likelihood of occurrence as any other, the outcomes are called:',
    options: {
      a: 'Mutually exclusive',
      b: 'Equally likely',
      c: 'Exhaustive',
      d: 'Independent'
    },
    correct: 'b',
    explanation: 'Outcomes that have identical theoretical probabilities of occurrence (such as the 6 faces of an unbiased die, each with $P = 1/6$) are called equally likely events (STA301 Handouts Lecture 17, Page 147). Appeared in 8+ midterm papers.',
    urdu_answer: 'جب سیمپل اسپیس کے تمام ممکنہ نتائج کے آنے کا امکان برابر ہو تو انہیں مساوی امکان والے واقعات (Equally likely events) کہا جاتا ہے۔'
  },
  {
    stem: 'The total number of permutations of $n$ distinct objects taken $r$ at a time without replacement is given by the formula:',
    options: {
      a: '$\\frac{n!}{r!}$',
      b: '$\\frac{n!}{(n-r)!}$',
      c: '$\\frac{n!}{r!(n-r)!}$',
      d: '$n^r$'
    },
    correct: 'b',
    explanation: 'The standard permutation formula for selecting and arranging $r$ distinct items from $n$ items is $n P_r = \\frac{n!}{(n-r)!}$ (STA301 Handouts Lecture 17, Page 137). Appeared in 7+ midterm papers.',
    urdu_answer: '$n$ مختلف اشیاء میں سے $r$ اشیاء کو ترتیب دینے کے پرموٹیشن کا فارمولا $n P_r = \\frac{n!}{(n-r)!}$ ہے۔'
  }
];

// 4 Short Questions
const shorts = [
  {
    stem: 'Differentiate between a Permutation and a Combination, providing their respective mathematical formulas and real-world examples.',
    correct: `<p><strong>Permutations vs. Combinations (STA301 Handouts Lecture 17):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Feature</th>
      <th style="padding: 8px;">Permutation (\\(n P_r\\))</th>
      <th style="padding: 8px;">Combination (\\(n C_r\\))</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Core Concept</strong></td>
      <td style="padding: 8px;">An <strong>ordered arrangement</strong> of \\(r\\) objects chosen from \\(n\\) distinct items.</td>
      <td style="padding: 8px;">An <strong>unordered selection</strong> of \\(r\\) objects chosen from \\(n\\) distinct items.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Significance of Order</strong></td>
      <td style="padding: 8px;"><strong>Order matters:</strong> \\(AB \\ne BA\\).</td>
      <td style="padding: 8px;"><strong>Order does not matter:</strong> \\(\\{A, B\\} = \\{B, A\\}\\).</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Formula</strong></td>
      <td style="padding: 8px;">\\[n P_r = \\frac{n!}{(n-r)!}\\]</td>
      <td style="padding: 8px;">\\[n C_r = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}\\]</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Illustrative Example</strong></td>
      <td style="padding: 8px;">Assigning 1st, 2nd, and 3rd place prizes in a race; telephone numbers; PIN passwords.</td>
      <td style="padding: 8px;">Selecting a 3-person delegation from 10 members; dealing a 5-card poker hand.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'High-frequency 3-mark conceptual question from STA301 Midterm Solved Subjectives and Handouts Pages 137–141.',
    urdu_answer: 'پرموٹیشن میں اشیاء کی ترتیب کا لحاظ رکھا جاتا ہے ($n P_r = \\frac{n!}{(n-r)!}$) جیسے پاس ورڈ یا انعامات کی تقسیم۔ کمبی نیشن میں صرف انتخاب اہم ہوتا ہے، ترتیب نہیں ($n C_r = \\frac{n!}{r!(n-r)!}$) جیسے کمیٹی کے ممبران کا چناؤ۔'
  },
  {
    stem: 'Define and differentiate between a Simple Event and a Compound Event in probability theory, giving examples for each.',
    correct: `<p><strong>Simple Event vs. Compound Event (STA301 Handouts Lecture 17):</strong></p>

<h4>1. Simple Event (Elementary Event):</h4>
<ul>
  <li><strong>Definition:</strong> An event that contains <strong>exactly one sample point</strong> from the sample space \\(S\\). It represents a single, indivisible outcome of an experiment.</li>
  <li><strong>Example:</strong> Rolling a single standard die and observing a \'4\'. The event is represented as \\(E = \\{4\\}\\), containing exactly one element (\\(n(E) = 1\\)).</li>
</ul>

<h4>2. Compound Event:</h4>
<ul>
  <li><strong>Definition:</strong> An event that contains <strong>two or more sample points</strong>. It can always be decomposed into a union of two or more simple events.</li>
  <li><strong>Example:</strong>
    <ul>
      <li>Rolling a single die and observing an <em>even number</em>: \\(E = \\{2, 4, 6\\}\\) (contains 3 sample points).</li>
      <li>Tossing two coins and observing <em>at least one Head</em>: \\(E = \\{HH, HT, TH\\}\\) (contains 3 sample points).</li>
    </ul>
  </li>
</ul>`,
    explanation: 'Core 3-mark conceptual question from STA301 Midterm Solved Subjectives and Handouts Page 145.',
    urdu_answer: 'سادہ واقعہ (Simple event) وہ ہے جس میں صرف ایک ہی سیمپل پوائنٹ ہو جیسے لڈو کے دانے پر 4 آنا $\\{4\\}$۔ کمپاؤنڈ واقعہ (Compound event) وہ ہے جس میں ایک سے زیادہ سیمپل پوائنٹس ہوں جیسے جفت عدد آنا $\\{2, 4, 6\\}$۔'
  },
  {
    stem: 'Differentiate between Mutually Exclusive Events and Collectively Exhaustive Events. Can events be both mutually exclusive and collectively exhaustive?',
    correct: `<p><strong>Mutually Exclusive vs. Collectively Exhaustive Events (STA301 Handouts Lecture 17):</strong></p>

<h4>1. Mutually Exclusive (Disjoint) Events:</h4>
<ul>
  <li>Events \\(A\\) and \\(B\\) cannot occur at the same time in a single trial of an experiment.</li>
  <li>Their intersection is empty:
    \\[A \\cap B = \\phi \\implies P(A \\cap B) = 0\\]
  </li>
  <li><em>Example:</em> When tossing a coin, the events "Head" and "Tail" are mutually exclusive.</li>
</ul>

<h4>2. Collectively Exhaustive Events:</h4>
<ul>
  <li>A collection of events is exhaustive if their occurrence accounts for all possibilities in the sample space \\(S\\).</li>
  <li>Their union equals the entire sample space:
    \\[A_1 \\cup A_2 \\cup \\dots \\cup A_k = S \\implies P(A_1 \\cup A_2 \\dots \\cup A_k) = 1\\]
  </li>
</ul>

<h4>3. Can Events Be Both?</h4>
<p><strong>Yes.</strong> When events are both mutually exclusive and collectively exhaustive, they form a <strong>Partition</strong> of the sample space (e.g., getting an even number \\(\\{2, 4, 6\\}\\) vs. an odd number \\(\\{1, 3, 5\\}\\) on rolling a single die; they share no points and their union spans \\(S\\)).</p>`,
    explanation: 'High-frequency 3-mark subjective question from STA301 Midterm Papers (Spring 2010 Q25, Moaaz) and Handouts Pages 146–147.',
    urdu_answer: 'باہم غیر مشترک (Mutually exclusive) واقعات ایک ساتھ نہیں ہو سکتے ($A \\cap B = \\phi$)۔ جبکہ مکمل (Exhaustive) واقعات کا یونین پورے سیمپل اسپیس کے برابر ہوتا ہے ($A \\cup B = S$)۔ لڈو پر جفت اور طاق اعداد کا آنا بیک وقت دونوں خصوصیات رکھتا ہے۔'
  },
  {
    stem: 'Define Sample Space and Sample Point with reference to random experiments. Illustrate with the experiment of rolling a pair of fair dice.',
    correct: `<p><strong>Sample Space and Sample Points (STA301 Handouts Lecture 17):</strong></p>

<h4>1. Sample Space (\\(S\\)):</h4>
<p>A <strong>sample space</strong> is the universal set of all possible outcomes of a random experiment. Every performance of the experiment must produce one and only one outcome from this set.</p>

<h4>2. Sample Point:</h4>
<p>Each individual element, member, or outcome belonging to the sample space \\(S\\) is called a <strong>sample point</strong>.</p>

<h4>3. Illustration (Rolling a Pair of Fair Dice):</h4>
<p>When two six-sided dice (one red, one green) are rolled, each outcome is an ordered pair \\((x, y)\\) where \\(x, y \\in \\{1, 2, 3, 4, 5, 6\\}\\):</p>
\\[S = \\begin{Bmatrix}
(1,1), & (1,2), & (1,3), & (1,4), & (1,5), & (1,6), \\\\
(2,1), & (2,2), & (2,3), & (2,4), & (2,5), & (2,6), \\\\
(3,1), & (3,2), & (3,3), & (3,4), & (3,5), & (3,6), \\\\
(4,1), & (4,2), & (4,3), & (4,4), & (4,5), & (4,6), \\\\
(5,1), & (5,2), & (5,3), & (5,4), & (5,5), & (5,6), \\\\
(6,1), & (6,2), & (6,3), & (6,4), & (6,5), & (6,6)
\\end{Bmatrix}\\]
<ul>
  <li>The total number of sample points is \\(n(S) = 6 \\times 6 = 36\\).</li>
  <li>The ordered pair \\((3, 5)\\) is an example of an individual <strong>sample point</strong>.</li>
</ul>`,
    explanation: 'Core 3-mark question from STA301 Midterm Solved Papers (Spring 2011 Q1) and Handouts Page 145.',
    urdu_answer: 'سیمپل اسپیس ($S$) کسی تجربے کے تمام ممکنہ نتائج کے سیٹ کو کہتے ہیں، اور اس کے ہر انفرادی نتیجے کو سیمپل پوائنٹ کہا جاتا ہے۔ دو لڈو کے دانے پھینکنے پر کل 36 سیمپل پوائنٹس بنتے ہیں جن میں سے ہر جوڑا مثلاً $(3, 5)$ ایک سیمپل پوائنٹ ہے۔'
  }
];

// 3 Long Questions
const longs = [
  {
    stem: 'How many different (meaningless or meaningful) words can be formed from all the letters of the word "COMMITTEE"? State the combinatorial formula used and show complete step-by-step calculations.',
    correct: `<p><strong>Permutations with Repeated Elements (STA301 Handouts Lecture 17):</strong></p>

<h4>1. Formula for Permutations of Non-Distinct Items:</h4>
<p>When arranging \\(n\\) objects of which \\(n_1\\) are of one kind, \\(n_2\\) of a second kind, ..., and \\(n_k\\) of a \\(k\\)-th kind, the number of distinct permutations is:</p>
\\[P = \\frac{n!}{n_1! \\times n_2! \\times \\dots \\times n_k!}\\]

<h4>2. Frequency Count of Letters in "COMMITTEE":</h4>
<ul>
  <li>Total number of letters (\\(n\\)) = <strong>9</strong></li>
  <li>Count of \'C\': \\(n_1 = 1\\)</li>
  <li>Count of \'O\': \\(n_2 = 1\\)</li>
  <li>Count of \'M\': \\(n_3 = 2\\)</li>
  <li>Count of \'I\': \\(n_4 = 1\\)</li>
  <li>Count of \'T\': \\(n_5 = 2\\)</li>
  <li>Count of \'E\': \\(n_6 = 2\\)</li>
</ul>
<p>Check: \\(1 + 1 + 2 + 1 + 2 + 2 = 9 = n\\).</p>

<h4>3. Step-by-Step Calculation:</h4>
\\[\\text{Total Distinct Words} = \\frac{9!}{1! \\times 1! \\times 2! \\times 1! \\times 2! \\times 2!}\\]
\\[9! = 9 \\times 8 \\times 7 \\times 6 \\times 5 \\times 4 \\times 3 \\times 2 \\times 1 = 362,880\\]
\\[1! \\times 1! \\times 2! \\times 1! \\times 2! \\times 2! = 1 \\times 1 \\times 2 \\times 1 \\times 2 \\times 2 = 8\\]
\\[\\text{Total Distinct Words} = \\frac{362,880}{8} = \\mathbf{45,360}\\]

<p><em>Conclusion:</em> A total of <strong>45,360</strong> distinct words can be formed from the letters of "COMMITTEE".</p>`,
    explanation: 'High-frequency 5-mark subjective problem from STA301 Midterm Solved Papers and Handouts Lecture 17 (Page 139).',
    urdu_answer: 'لفظ "COMMITTEE" میں کل 9 حروف ہیں جن میں M، T اور E دو دو بار آئے ہیں۔ فارمولا $\\frac{9!}{2! \\times 2! \\times 2!} = \\frac{362880}{8} = 45,360$ کے تحت کل 45,360 مختلف الفاظ بنائے جا سکتے ہیں۔'
  },
  {
    stem: 'Construct the sample space for tossing a fair coin 2 times ($S = \\{HH, HT, TH, TT\\}$) and determine the probability of each of the following events:\n1. Getting exactly 2 Heads\n2. Getting at least 1 Head\n3. Getting exactly 1 Tail\n4. Getting at least 2 Tails',
    correct: `<p><strong>Sample Space and Event Probabilities (STA301 Handouts Lecture 17):</strong></p>

<h4>Step 1: Construct the Sample Space (\\(S\\)):</h4>
<p>When tossing a fair coin twice:</p>
\\[S = \\{HH, HT, TH, TT\\}\\]
\\[n(S) = 4 \\quad \\text{(Total equally likely sample points)}\\]

<h4>Step 2: Calculate Event Probabilities:</h4>
<ol>
  <li><strong>Event A: Exactly 2 Heads:</strong>
    \\[A = \\{HH\\} \\implies n(A) = 1\\]
    \\[P(A) = \\frac{n(A)}{n(S)} = \\mathbf{\\frac{1}{4} = 0.25}\\]
  </li>
  <li><strong>Event B: At least 1 Head (1 or 2 Heads):</strong>
    \\[B = \\{HH, HT, TH\\} \\implies n(B) = 3\\]
    \\[P(B) = \\frac{n(B)}{n(S)} = \\mathbf{\\frac{3}{4} = 0.75}\\]
  </li>
  <li><strong>Event C: Exactly 1 Tail:</strong>
    \\[C = \\{HT, TH\\} \\implies n(C) = 2\\]
    \\[P(C) = \\frac{n(C)}{n(S)} = \\frac{2}{4} = \\mathbf{\\frac{1}{2} = 0.50}\\]
  </li>
  <li><strong>Event D: At least 2 Tails (2 Tails):</strong>
    \\[D = \\{TT\\} \\implies n(D) = 1\\]
    \\[P(D) = \\frac{n(D)}{n(S)} = \\mathbf{\\frac{1}{4} = 0.25}\\]
  </li>
</ol>`,
    explanation: 'Core 5-mark probability problem from STA301 Midterm Solved Papers (Spring 2010 Session 4, Moaaz) and Handouts Page 145.',
    urdu_answer: 'سیمپل اسپیس $S = \\{HH, HT, TH, TT\\}$ ہے ($n(S) = 4$)۔ 1. دو ہیڈز کا امکان $1/4$؛ 2. کم از کم ایک ہیڈ کا امکان $3/4$؛ 3. ایک ٹیل کا امکان $2/4 = 1/2$؛ 4. کم از کم دو ٹیلز کا امکان $1/4$ ہے۔'
  },
  {
    stem: 'State the rule of combinations and evaluate the following combinations showing full factorial calculations:\n1. $\\binom{10}{3}$ (Selecting a committee of 3 from 10 candidates)\n2. $\\binom{52}{5}$ (Total possible 5-card poker hands from a standard deck of 52 cards)',
    correct: `<p><strong>Combination Calculations and Applications (STA301 Handouts Lecture 17):</strong></p>

<h4>1. The Combination Formula:</h4>
<p>The number of combinations of \\(n\\) distinct items taken \\(r\\) at a time (where order of selection does not matter) is:</p>
\\[\\binom{n}{r} = \\frac{n!}{r!(n-r)!}\\]

<h4>2. Calculation of \\(\\binom{10}{3}\\):</h4>
\\[\\binom{10}{3} = \\frac{10!}{3!(10-3)!} = \\frac{10!}{3! \\times 7!}\\]
<p>Cancel out \\(7!\\) from numerator and denominator:</p>
\\[\\binom{10}{3} = \\frac{10 \\times 9 \\times 8 \\times 7!}{3 \\times 2 \\times 1 \\times 7!} = \\frac{10 \\times 9 \\times 8}{6} = \\frac{720}{6} = \\mathbf{120}\\]
<p><em>Interpretation:</em> There are 120 different 3-person committees that can be selected from 10 candidates.</p>

<h4>3. Calculation of \\(\\binom{52}{5}\\):</h4>
\\[\\binom{52}{5} = \\frac{52!}{5!(52-5)!} = \\frac{52!}{5! \\times 47!}\\]
<p>Cancel out \\(47!\\):</p>
\\[\\binom{52}{5} = \\frac{52 \\times 51 \\times 50 \\times 49 \\times 48}{5 \\times 4 \\times 3 \\times 2 \\times 1}\\]
\\[= \\frac{311,875,200}{120} = \\mathbf{2,598,960}\\]
<p><em>Interpretation:</em> There are exactly 2,598,960 distinct 5-card hands possible in a game of poker.</p>`,
    explanation: 'Fundamental 5-mark subjective problem on combinations from STA301 Handouts Lecture 17 (Pages 141–142).',
    urdu_answer: 'کمبی نیشن فارمولا $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$ کے تحت: 1. $\\binom{10}{3} = 120$ کمیٹیاں بن سکتی ہیں؛ اور 2. $\\binom{52}{5} = 2,598,960$ پوکر ہینڈز بن سکتے ہیں۔'
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
console.log(`Successfully inserted into STA301 Lecture 17:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for STA301 Lecture 17: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

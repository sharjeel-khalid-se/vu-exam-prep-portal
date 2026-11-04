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

// 2. Create or fetch Lecture 20
let lec20 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 20").get(sta301.id);
if (!lec20) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 20, 'Conditional Probability, Reduced Sample Space, and Multiplication Theorem')
  `).run(sta301.id);
  lec20 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 20 with ID: ${lec20.id}`);
} else {
  console.log(`STA301 Lecture 20 already exists with ID: ${lec20.id}`);
}

const lId = lec20.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 20.`);

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
    stem: 'In the General Multiplication Theorem of probability, $P(A \\cap B)$ equals:',
    options: {
      a: '$P(A) P(B)$',
      b: '$P(A) + P(B)$',
      c: '$P(A) \\times P(B|A)$',
      d: '$P(B|A) \\times P(B)$'
    },
    correct: 'c',
    explanation: 'By the General Multiplication Rule of probability, the joint probability of two events is given by $P(A \\cap B) = P(A) \\times P(B|A)$ (or equivalently $P(B) \\times P(A|B)$) (STA301 Handouts Lecture 20, Page 158). Appeared in 15+ midterm papers.',
    urdu_answer: 'ملٹی پلیکیشن تھیورم کے مطابق دو واقعات کا مشترکہ امکان $P(A \\cap B) = P(A) \\times P(B|A)$ کے برابر ہوتا ہے۔'
  },
  {
    stem: 'Symbolically, the conditional probability of event $A$ given that event $B$ has already occurred is defined as:',
    options: {
      a: '$P(A \\cup B)$',
      b: '$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$',
      c: '$P(AB) = P(A) P(B)$',
      d: '$P(A|B) = \\frac{P(A \\cap B)}{P(A)}$'
    },
    correct: 'b',
    explanation: 'Conditional probability of $A$ given $B$ is defined mathematically as $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$, provided $P(B) > 0$ (STA301 Handouts Lecture 20, Page 157). Appeared in 10+ midterm papers.',
    urdu_answer: 'واقعہ B کے رونما ہونے کے بعد واقعہ A کے ہونے کا مشروط امکان (Conditional Probability) اس فارمولے سے ظاہر کیا جاتا ہے: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$۔'
  },
  {
    stem: 'The probabilities associated with a sample space reduced by receiving additional information pertaining to an outcome are called:',
    options: {
      a: 'Joint probabilities',
      b: 'Marginal probabilities',
      c: 'Conditional probabilities',
      d: 'Prior probabilities'
    },
    correct: 'c',
    explanation: 'When extra information eliminates certain impossible outcomes, the original sample space $S$ is restricted to a subset $B$, and the resulting probabilities are called conditional probabilities (STA301 Handouts Lecture 20, Page 157). Appeared in 8+ midterm papers.',
    urdu_answer: 'اضافی معلومات کی بنیاد پر نمونہ اسپیس کو محدود کرنے کے بعد بننے والے امکانات کو مشروط امکانات (Conditional Probabilities) کہا جاتا ہے۔'
  },
  {
    stem: 'The General Rule of Multiplication is used to combine the probabilities of:',
    options: {
      a: 'Independent events',
      b: 'Events that are dependent / not independent',
      c: 'Mutually exclusive events',
      d: 'Events that total more than 1.00'
    },
    correct: 'b',
    explanation: 'The General Multiplication Rule applies to dependent events (or any arbitrary events), where the occurrence of one event alters the likelihood of the other ($P(B|A) \\neq P(B)$) (STA301 Handouts Lecture 20, Page 158). Appeared in 9+ midterm papers.',
    urdu_answer: 'ملٹی پلیکیشن کا عمومی اصول ان واقعات پر لاگو ہوتا ہے جو غیر آزاد یا منحصر (Dependent) ہوں۔'
  },
  {
    stem: 'The simultaneous occurrence of two events $A$ and $B$ is referred to as their:',
    options: {
      a: 'Prior probability',
      b: 'Subjective probability',
      c: 'Conditional probability',
      d: 'Joint probability'
    },
    correct: 'd',
    explanation: 'The joint probability $P(A \\cap B)$ represents the likelihood that two events occur together at the same time in a single trial (STA301 Handouts Lecture 20, Page 157). Appeared in 11+ midterm papers.',
    urdu_answer: 'دو واقعات A اور B کے بیک وقت ایک ساتھ وقوع پذیر ہونے کو ان کا مشترکہ امکان (Joint Probability) کہا جاتا ہے۔'
  },
  {
    stem: 'At an elementary school, 75% of students come from a two-parent home ($P(B) = 0.75$) and 20% are low-achievers from two-parent homes ($P(A \\cap B) = 0.20$). What is the probability that a student is a low-achiever given that they come from a two-parent home $P(A|B)$?',
    options: {
      a: '0.15',
      b: '0.27',
      c: '0.55',
      d: '0.95'
    },
    correct: 'b',
    explanation: 'By the conditional probability formula: $P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.20}{0.75} = \\frac{4}{15} \\approx 0.2667 \\approx 0.27$ (STA301 Handouts Lecture 20, Page 157). Appeared in 7+ midterm papers.',
    urdu_answer: 'مشروط امکان کے فارمولے کے تحت: $P(A|B) = \\frac{0.20}{0.75} \\approx 0.27$۔'
  },
  {
    stem: 'If $P(A) = 0.45$, $P(B) = 0.35$, and $P(A \\cap B) = 0.25$, then $P(A|B)$ is equal to:',
    options: {
      a: '1.40',
      b: '1.80',
      c: '0.714',
      d: '0.556'
    },
    correct: 'c',
    explanation: 'Using the definition: $P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.25}{0.35} = \\frac{5}{7} \\approx 0.714$ (STA301 Handouts Lecture 20, Page 158). Appeared in 8+ midterm papers.',
    urdu_answer: 'مشروط امکان: $P(A|B) = \\frac{0.25}{0.35} = \\frac{5}{7} \\approx 0.714$۔'
  },
  {
    stem: 'Let $A$ and $B$ be two dependent events such that $P(B) = 1/3$ and $P(A|B) = 1/2$. What is $P(A \\cap B)$?',
    options: {
      a: '1/6',
      b: '1/9',
      c: '1/2',
      d: '1/3'
    },
    correct: 'a',
    explanation: 'By the multiplication theorem: $P(A \\cap B) = P(B) \\times P(A|B) = \\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6}$ (STA301 Midterm MCQs 2020). Appeared in 9+ midterm papers.',
    urdu_answer: 'ضرب کے اصول کے تحت: $P(A \\cap B) = \\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6}$۔'
  },
  {
    stem: 'The conditional probability $P(A|B)$ remains undefined when:',
    options: {
      a: '$P(A) = 0$',
      b: '$P(B) = 0$',
      c: '$P(A \\cap B) = 0$',
      d: '$P(B) = 1$'
    },
    correct: 'b',
    explanation: 'Since $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$, division by zero occurs if $P(B) = 0$, rendering the conditional probability undefined (STA301 Handouts Lecture 20, Page 157). Appeared in 5+ midterm papers.',
    urdu_answer: 'اگر معلوم شدہ واقعے کا امکان صفر ہو ($P(B) = 0$)، تو صفر پر تقسیم کی وجہ سے مشروط امکان غیر واضح (Undefined) ہو جاتا ہے۔'
  },
  {
    stem: 'A fair balanced die is tossed. Given that the die shows an even number, what is the probability that the die shows 6?',
    options: {
      a: '1/6',
      b: '1/3',
      c: '1/2',
      d: '2/3'
    },
    correct: 'b',
    explanation: 'The given condition "even number" reduces the sample space to $B = \\{2, 4, 6\\}$ with $n(B) = 3$. The outcome "6" is one of these 3 equally likely elements, so $P(6|\\text{even}) = 1/3$ (STA301 Handouts Lecture 20, Pages 156–157). Appeared in 6+ midterm papers.',
    urdu_answer: 'جفت عدد آنے کی شرط پر نمونہ اسپیس محدود ہو کر $\\{2, 4, 6\\}$ رہ جاتا ہے جس میں 6 آنے کا امکان $1/3$ ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'Define Conditional Probability. State its mathematical formulas for $P(A|B)$ and $P(B|A)$ along with their necessary conditions.',
    correct: `<p><strong>Conditional Probability Definition:</strong></p>
<p>Conditional probability is the probability of an event \\(A\\) occurring given the condition that another event \\(B\\) has already occurred. In conditional probability, the original sample space \\(S\\) is restricted or reduced to the conditioning event \\(B\\).</p>

<p><strong>Mathematical Formulations:</strong></p>
<ol>
  <li><strong>Probability of \\(A\\) given \\(B\\):</strong>
    <p>$$P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad \\text{provided } P(B) > 0$$</p>
  </li>
  <li><strong>Probability of \\(B\\) given \\(A\\):</strong>
    <p>$$P(B|A) = \\frac{P(A \\cap B)}{P(A)} \\quad \\text{provided } P(A) > 0$$</p>
  </li>
</ol>
<p><em>Note:</em> If the conditioning event has zero probability (\\(P = 0\\)), the conditional probability is undefined.</p>`,
    explanation: 'From STA301 Handouts Lecture 20, Page 157. Fundamental definition and standard formulas for conditional probability.',
    urdu_answer: 'مشروط امکان سے مراد کسی واقعے A کے واقع ہونے کا وہ امکان ہے جب یہ معلوم ہو کہ دوسرا واقعہ B پہلے ہی واقع ہو چکا ہے۔ فارمولا: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ بشرطیکہ $P(B) > 0$ ہو۔'
  },
  {
    stem: 'What is meant by Reduced Sample Space? Explain the concept clearly with a simple die-rolling example.',
    correct: `<p><strong>Concept of Reduced Sample Space:</strong></p>
<p>When additional information regarding the outcome of a random experiment becomes known prior to observing the final result, certain outcomes that are now known to be impossible are eliminated from the universal sample space \\(S\\). The remaining subset of feasible outcomes constitutes the <strong>reduced sample space</strong>.</p>

<p><strong>Example:</strong></p>
<ul>
  <li>Consider the experiment of rolling a single fair six-sided die. The original sample space is:
    <p>$$S = \\{1, 2, 3, 4, 5, 6\\} \\implies n(S) = 6$$</p>
  </li>
  <li>Suppose we are given information that the number that appeared is an <strong>even number</strong>. This event is \\(B = \\{2, 4, 6\\}\\).</li>
  <li>The outcomes \\(\\{1, 3, 5\\}\\) are eliminated. The sample space is now reduced to \\(B\\), containing only 3 outcomes.</li>
  <li>If we now calculate the probability that the face is a '6', it is evaluated with respect to the reduced space:
    <p>$$P(\\text{Six} | \\text{Even}) = \\frac{n(A \\cap B)}{n(B)} = \\frac{1}{3}$$</p>
    (compared to \\(1/6\\) in the original unconstrained sample space).</li>
</ul>`,
    explanation: 'From STA301 Handouts Lecture 20, Pages 156–157. Demonstrates how prior information shrinks the sample space.',
    urdu_answer: 'اضافی معلومات ملنے پر جب غیر ممکنہ نتائج کو اصل نمونہ اسپیس سے خارج کر دیا جائے تو باقی رہ جانے والے ممکنہ نتائج پر مشتمل اسپیس کو Reduced Sample Space کہا جاتا ہے۔ مثال کے طور پر پانسہ پھینکنے پر جفت عدد کی شرط سے اسپیس 6 کے بجائے 3 عناصر {2, 4, 6} تک محدود ہو جاتا ہے۔'
  },
  {
    stem: 'State the General Rule / Theorem of Multiplication of Probabilities for two dependent events, providing both algebraic forms.',
    correct: `<p><strong>General Multiplication Theorem:</strong></p>
<p>The probability that two events \\(A\\) and \\(B\\) will both occur simultaneously is equal to the probability of the first event multiplied by the conditional probability of the second event given that the first has occurred.</p>

<p><strong>Algebraic Forms:</strong></p>
<ol>
  <li>When event \\(A\\) occurs first:
    <p>$$P(A \\cap B) = P(A) \\cdot P(B|A) \\quad \\text{provided } P(A) > 0$$</p>
  </li>
  <li>When event \\(B\\) occurs first:
    <p>$$P(A \\cap B) = P(B) \\cdot P(A|B) \\quad \\text{provided } P(B) > 0$$</p>
  </li>
</ol>
<p>This theorem directly follows from rearranging the definitions of conditional probability \\(P(B|A) = \\frac{P(A \\cap B)}{P(A)}\\) and \\(P(A|B) = \\frac{P(A \\cap B)}{P(B)}\\).</p>`,
    explanation: 'From STA301 Handouts Lecture 20, Pages 157–158. General multiplication theorem applies to dependent and general event relationships.',
    urdu_answer: 'ضرب کے عمومی اصول کے مطابق دو واقعات کے بیک وقت وقوع پذیر ہونے کا امکان، پہلے واقعے کے امکان اور پہلے کی موجودگی میں دوسرے کے مشروط امکان کے حاصل ضرب کے برابر ہوتا ہے: $P(A \\cap B) = P(A) \\cdot P(B|A)$۔'
  },
  {
    stem: 'Clearly differentiate between Joint Probability and Conditional Probability with their mathematical representations.',
    correct: `<p><strong>Comparison between Joint and Conditional Probability:</strong></p>
<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Joint Probability</th>
      <th>Conditional Probability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>Probability that both events \\(A\\) and \\(B\\) occur simultaneously in a single trial.</td>
      <td>Probability that event \\(A\\) occurs given that event \\(B\\) is known to have already occurred.</td>
    </tr>
    <tr>
      <td><strong>Notation</strong></td>
      <td>\\(P(A \\cap B)\\) or \\(P(AB)\\)</td>
      <td>\\(P(A|B)\\) or \\(P(A/B)\\)</td>
    </tr>
    <tr>
      <td><strong>Sample Space</strong></td>
      <td>Evaluated over the universal sample space \\(S\\).</td>
      <td>Evaluated over the reduced sample space \\(B\\).</td>
    </tr>
    <tr>
      <td><strong>Relationship</strong></td>
      <td>\\(P(A \\cap B) = P(B) \\cdot P(A|B)\\)</td>
      <td>\\(P(A|B) = \\frac{P(A \\cap B)}{P(B)}\\)</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From STA301 Handouts Lecture 20, Pages 156–157. A frequently tested comparison in subjective examinations.',
    urdu_answer: 'مشترکہ امکان $P(A \\cap B)$ اصل نمونہ اسپیس میں دو واقعات کے بیک وقت رونما ہونے کو ظاہر کرتا ہے، جبکہ مشروط امکان $P(A|B)$ واقعہ B کے رونما ہونے کے بعد گھٹے ہوئے اسپیس میں واقعہ A کا امکان ناپتا ہے۔'
  }
];

// 3 Long / Numerical Questions
const longQuestions = [
  {
    stem: 'A box contains 15 items, of which 4 are defective and 11 are non-defective (good). Two items are drawn sequentially from the box without replacement. Define the events, state the multiplication rule, and calculate the probability that the first item selected is good and the second item selected is defective.',
    correct: `<p><strong>Problem Solution:</strong></p>
<ol>
  <li><strong>Define the Events:</strong>
    <ul>
      <li>Let \\(A\\) = Event that the first item drawn is good (non-defective).</li>
      <li>Let \\(B\\) = Event that the second item drawn is defective.</li>
      <li>We seek the joint probability \\(P(A \\cap B)\\).</li>
    </ul>
  </li>
  <li><strong>State the Multiplication Rule:</strong>
    <p>Since the items are drawn without replacement, the selection of the second item depends on the first outcome:</p>
    <p>$$P(A \\cap B) = P(A) \\cdot P(B|A)$$</p>
  </li>
  <li><strong>Calculate Probabilities:</strong>
    <ul>
      <li>Total initial items = 15 (11 good, 4 defective).</li>
      <li>Probability of selecting a good item first:
        <p>$$P(A) = \\frac{11}{15}$$</p>
      </li>
      <li>After removing 1 good item, there are 14 items left in the box (10 good, 4 defective).</li>
      <li>Conditional probability of drawing a defective item second given the first was good:
        <p>$$P(B|A) = \\frac{4}{14} = \\frac{2}{7}$$</p>
      </li>
    </ul>
  </li>
  <li><strong>Compute the Joint Probability:</strong>
    <p>$$P(A \\cap B) = \\left(\\frac{11}{15}\\right) \\times \\left(\\frac{4}{14}\\right) = \\frac{44}{210} = \\mathbf{\\frac{22}{105} \\approx 0.2095 \\text{ (or } 20.95\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 20, Pages 158–159 (Example: Sequential selection without replacement). Standard 5-mark midterm exam problem.',
    urdu_answer: 'باکس میں 11 اچھے اور 4 خراب آئٹمز ہیں۔ پہلے اچھے آئٹم کا امکان $11/15$ ہے، اور واپسی کے بغیر دوسرے خراب آئٹم کا امکان $4/14$ ہے۔ پس ضرب کے اصول سے مطلوبہ امکان $\\frac{11}{15} \\times \\frac{4}{14} = \\frac{22}{105} \\approx 0.2095$ ہے۔'
  },
  {
    stem: 'School records over a period of 10 years indicate that 75% of students come from two-parent homes ($P(B) = 0.75$) and 20% of students are low-achievers who belong to two-parent homes ($P(A \\cap B) = 0.20$). Calculate the probability that a randomly selected student is a low-achiever given that they come from a two-parent home.',
    correct: `<p><strong>Problem Solution:</strong></p>
<ol>
  <li><strong>Identify Given Probabilities:</strong>
    <ul>
      <li>Let \\(B\\) = Event that a student comes from a two-parent home \\(\\implies P(B) = 0.75\\).</li>
      <li>Let \\(A\\) = Event that a student is a low-achiever.</li>
      <li>The joint event \\(A \\cap B\\) = Student is a low-achiever AND comes from a two-parent home \\(\\implies P(A \\cap B) = 0.20\\).</li>
    </ul>
  </li>
  <li><strong>Apply the Conditional Probability Formula:</strong>
    <p>We are asked to find \\(P(A|B)\\), the probability of being a low-achiever given that the student is from a two-parent home:</p>
    <p>$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$</p>
  </li>
  <li><strong>Substitute and Calculate:</strong>
    <p>$$P(A|B) = \\frac{0.20}{0.75} = \\frac{20}{75} = \\mathbf{\\frac{4}{15} \\approx 0.2667 \\text{ (or } 26.67\\%\\)}$$</p>
  </li>
  <li><strong>Interpretation:</strong>
    <p>Among students from two-parent homes, approximately 26.67% are classified as low-achievers.</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 20, Page 157 (Elementary school conditional probability case). Appears in multiple midterm papers.',
    urdu_answer: 'فارمولا $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ کا استعمال کرتے ہوئے: $P(A|B) = \\frac{0.20}{0.75} = \\frac{4}{15} \\approx 0.2667$ (یا 26.67 فیصد) ہے۔'
  },
  {
    stem: 'For two dependent events $A$ and $B$, if $P(A) = 0.25$ and the conditional probability $P(B|A) = 0.40$, calculate the joint probability $P(A \\cap B)$. Furthermore, if $P(B) = 0.50$, find the conditional probability $P(A|B)$.',
    correct: `<p><strong>Step-by-Step Solution:</strong></p>
<ol>
  <li><strong>Calculate Joint Probability \\(P(A \\cap B)\\):</strong>
    <p>By the General Multiplication Rule:</p>
    <p>$$P(A \\cap B) = P(A) \\cdot P(B|A)$$</p>
    <p>Substituting the given values:</p>
    <p>$$P(A \\cap B) = 0.25 \\times 0.40 = \\mathbf{0.10}$$</p>
  </li>
  <li><strong>Calculate Conditional Probability \\(P(A|B)\\):</strong>
    <p>By the definition of conditional probability:</p>
    <p>$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$</p>
    <p>Given \\(P(B) = 0.50\\) and \\(P(A \\cap B) = 0.10\\):</p>
    <p>$$P(A|B) = \\frac{0.10}{0.50} = \\mathbf{0.20 \\text{ (or } 20\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 20, Page 158. Demonstrates two-way application of conditional probability and multiplication theorem.',
    urdu_answer: 'ضرب کے اصول سے مشترکہ امکان $P(A \\cap B) = 0.25 \\times 0.40 = 0.10$ حاصل ہوتا ہے۔ پھر $P(A|B) = \\frac{0.10}{0.50} = 0.20$ بنتا ہے۔'
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
console.log(`Lecture 20 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

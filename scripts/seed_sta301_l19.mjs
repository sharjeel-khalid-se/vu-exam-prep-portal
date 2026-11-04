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

// 2. Create or fetch Lecture 19
let lec19 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 19").get(sta301.id);
if (!lec19) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 19, 'Laws of Probability, Complementation, and Addition Rules')
  `).run(sta301.id);
  lec19 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 19 with ID: ${lec19.id}`);
} else {
  console.log(`STA301 Lecture 19 already exists with ID: ${lec19.id}`);
}

const lId = lec19.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 19.`);

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

// 11 MCQs
const mcqs = [
  {
    stem: 'Which formula represents the probability of the complement of event $A$ (denoted by $\\bar{A}$)?',
    options: {
      a: '$1 + P(A)$',
      b: '$1 - P(A)$',
      c: '$P(A)$',
      d: '$P(A) - 1$'
    },
    correct: 'b',
    explanation: 'By the Law of Complementation, the probability that an event will not occur is $1$ minus the probability that it will occur: $P(\\bar{A}) = 1 - P(A)$, or equivalently $P(A) + P(\\bar{A}) = 1$ (STA301 Handouts Lecture 19, Page 148). Appeared in 12+ midterm papers.',
    urdu_answer: 'لا آف کمپلیمنٹیشن کے تحت کسی واقعے کے نہ ہونے کا امکان 1 میں سے واقعے کے ہونے کا امکان تفریق کر کے حاصل ہوتا ہے: $P(\\bar{A}) = 1 - P(A)$۔'
  },
  {
    stem: 'The Special Rule of Addition is used to combine the probabilities of which type of events?',
    options: {
      a: 'Independent Events',
      b: 'Mutually Exclusive Events',
      c: 'Events that total more than 1.00',
      d: 'Events based on subjective probabilities'
    },
    correct: 'b',
    explanation: 'The Special Rule of Addition states that if two events $A$ and $B$ are mutually exclusive (disjoint), then $P(A \\cup B) = P(A) + P(B)$ because they cannot occur together, i.e., $P(A \\cap B) = 0$ (STA301 Handouts Lecture 19, Page 150). Appeared in 10+ midterm papers.',
    urdu_answer: 'اسپیشل رول آف ایڈیشن ان واقعات کے لیے استعمال ہوتا ہے جو آپس میں متضاد یا ایک ساتھ واقع نہ ہو سکیں یعنی Mutually Exclusive Events۔'
  },
  {
    stem: 'If $A$ and $B$ are any two events defined in a sample space $S$, then the General Addition Theorem states that $P(A \\cup B)$ or $P(A \\text{ or } B)$ equals:',
    options: {
      a: '$P(A) + P(B)$',
      b: '$P(A) \\times P(B)$',
      c: '$P(A) + P(B) - P(A \\cap B)$',
      d: '$P(A | B) + P(B | A)$'
    },
    correct: 'c',
    explanation: 'The General Addition Theorem for any two events (whether mutually exclusive or not) is $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. The joint probability $P(A \\cap B)$ is subtracted to avoid double counting the overlapping outcomes (STA301 Handouts Lecture 19, Page 149). Appeared in 15+ midterm papers.',
    urdu_answer: 'جنرل ایڈیشن تھیورم کے مطابق کسی بھی دو واقعات کا یونین $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ کے برابر ہوتا ہے۔'
  },
  {
    stem: 'If $A$ and $B$ are mutually exclusive events, then $P(A \\text{ or } B)$ equals:',
    options: {
      a: '$P(A) + P(B) - P(A \\text{ and } B)$',
      b: '$P(A) \\times P(B)$',
      c: '$P(A) + P(B)$',
      d: '$P(A | B) + P(B | A)$'
    },
    correct: 'c',
    explanation: 'When events $A$ and $B$ are mutually exclusive, their intersection is empty ($A \\cap B = \\phi$), so $P(A \\cap B) = 0$. Hence, the formula simplifies to $P(A \\text{ or } B) = P(A) + P(B)$ (STA301 Handouts Lecture 19, Page 150). Appeared in 14+ midterm papers.',
    urdu_answer: 'جب دو واقعات Mutually Exclusive ہوں تو ان کے بیک وقت واقع ہونے کا امکان صفر ہوتا ہے، لہٰذا $P(A \\text{ or } B) = P(A) + P(B)$۔'
  },
  {
    stem: 'For two mutually exclusive events $A$ and $B$, if $P(A) = 0.2$ and $P(B) = 0.4$, what is $P(A \\cup B)$?',
    options: {
      a: '0.8',
      b: '0.2',
      c: '0.6',
      d: '0.5'
    },
    correct: 'c',
    explanation: 'Since $A$ and $B$ are mutually exclusive: $P(A \\cup B) = P(A) + P(B) = 0.2 + 0.4 = 0.6$ (STA301 Handouts Lecture 19, Page 150). Appeared in 9+ midterm papers.',
    urdu_answer: 'چونکہ دونوں واقعات باہمی طور پر غیر متصل (Mutually Exclusive) ہیں، اس لیے $P(A \\cup B) = 0.2 + 0.4 = 0.6$ ہوگا۔'
  },
  {
    stem: 'If $A$ and $B$ are mutually exclusive events with $P(A) = 0.25$ and $P(B) = 0.50$, then $P(A \\text{ or } B)$ equals:',
    options: {
      a: '0.25',
      b: '0.75',
      c: '0.50',
      d: '1.00'
    },
    correct: 'b',
    explanation: 'By the special addition rule for mutually exclusive events: $P(A \\text{ or } B) = P(A) + P(B) = 0.25 + 0.50 = 0.75$ (STA301 Handouts Lecture 19, Page 150). Appeared in 7+ midterm papers.',
    urdu_answer: 'باہمی غیر متصل واقعات کے لیے دونوں کے امکانات کو جمع کیا جاتا ہے: $0.25 + 0.50 = 0.75$۔'
  },
  {
    stem: 'Given $P(A) = 0.4$, $P(B) = 0.5$, and $P(A \\cup B) = 0.9$, what can be deduced about events $A$ and $B$?',
    options: {
      a: '$A$ and $B$ are not mutually exclusive events',
      b: '$A$ and $B$ are equally likely events',
      c: '$A$ and $B$ are independent events',
      d: '$A$ and $B$ are mutually exclusive events'
    },
    correct: 'd',
    explanation: 'Since $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$, substituting values gives $0.9 = 0.4 + 0.5 - P(A \\cap B) \\implies P(A \\cap B) = 0.9 - 0.9 = 0$. Since their intersection has zero probability, $A$ and $B$ are mutually exclusive events (STA301 Grand Quiz Dec 2020). Appeared in 6+ papers.',
    urdu_answer: 'چونکہ $0.4 + 0.5 = 0.9$ ہے اور یہ $P(A \\cup B)$ کے عین برابر ہے، اس لیے مشترکہ امکان $P(A \\cap B) = 0$ ہے جو ثابت کرتا ہے کہ یہ Mutually Exclusive واقعات ہیں۔'
  },
  {
    stem: 'For any arbitrary event $A$ and its complement $\\bar{A}$, the sum $P(A) + P(\\bar{A})$ is always equal to:',
    options: {
      a: '0',
      b: '0.5',
      c: '1',
      d: 'Infinity'
    },
    correct: 'c',
    explanation: 'An event and its complement partition the entire sample space $S$ ($A \\cup \\bar{A} = S$ and $A \\cap \\bar{A} = \\phi$). Therefore, $P(A) + P(\\bar{A}) = P(S) = 1$ (STA301 Handouts Lecture 19, Page 148). Appeared in 8+ midterm papers.',
    urdu_answer: 'کسی واقعے اور اس کے کمپلیمنٹ کا مجموعہ پورے نمونہ اسپیس کے برابر ہوتا ہے، اس لیے ان کے امکانات کا مجموعہ ہمیشہ 1 ہوتا ہے۔'
  },
  {
    stem: 'A balanced coin is tossed 4 times in succession. What is the probability that at least one head occurs?',
    options: {
      a: '$1/16$',
      b: '$15/16$',
      c: '$1/2$',
      d: '$3/4$'
    },
    correct: 'b',
    explanation: 'Total sample points $n(S) = 2^4 = 16$. The complement event $\\bar{A}$ is "no heads" (all tails: $TTTT$), which has only 1 outcome. So $P(\\bar{A}) = 1/16$. By complementation: $P(\\text{at least one head}) = 1 - P(\\bar{A}) = 1 - 1/16 = 15/16$ (STA301 Handouts Lecture 19, Page 149). Appeared in 5+ midterm papers.',
    urdu_answer: 'چار مرتبہ سکے کو اچھالنے پر کم از کم ایک ہیڈ آنے کا امکان لا آف کمپلیمنٹیشن سے معلوم ہوگا: $1 - 1/16 = 15/16$۔'
  },
  {
    stem: 'If one card is selected at random from a standard deck of 52 playing cards, what is the probability that the card is a club or a face card or both?',
    options: {
      a: '$22/52$',
      b: '$25/52$',
      c: '$13/52$',
      d: '$12/52$'
    },
    correct: 'a',
    explanation: 'Number of clubs = 13 ($P(A) = 13/52$). Number of face cards = 12 ($P(B) = 12/52$). Overlap (clubs that are face cards: J, Q, K of clubs) = 3 ($P(A \\cap B) = 3/52$). Using General Addition Theorem: $P(A \\cup B) = 13/52 + 12/52 - 3/52 = 22/52 = 11/26$ (STA301 Handouts Lecture 19, Page 150). Appeared in 6+ papers.',
    urdu_answer: 'کل 13 چڑیا (Clubs) اور 12 تصویری کارڈز (Face cards) ہوتے ہیں جن میں 3 مشترک ہیں۔ لہٰذا $13/52 + 12/52 - 3/52 = 22/52$ ہوگا۔'
  },
  {
    stem: 'The probability of drawing a red queen card from a well-shuffled pack of 52 playing cards is:',
    options: {
      a: '$1/52$',
      b: '$2/52$',
      c: '$4/52$',
      d: '$13/52$'
    },
    correct: 'b',
    explanation: 'In a standard 52-card pack, there are 4 queens: 2 red (Queen of Hearts, Queen of Diamonds) and 2 black (Queen of Spades, Queen of Clubs). Therefore, $P(\\text{Red Queen}) = 2/52 = 1/26$ (STA301 Handouts Lecture 19, Card Probability Examples). Appeared in 8+ midterm papers.',
    urdu_answer: 'تاش کے 52 پتوں میں کل 2 سرخ بیگمات (Red Queens) ہوتی ہیں، اس لیے اس کا امکان $2/52$ (یا $1/26$) ہوتا ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'State and explain the Law / Rule of Complementation in probability with its mathematical formulation.',
    correct: `<p><strong>Law / Rule of Complementation:</strong></p>
<p>If \\(\\bar{A}\\) is the complement of an event \\(A\\) relative to the sample space \\(S\\), then the probability of \\(\\bar{A}\\) is given by:</p>
<p>$$P(\\bar{A}) = 1 - P(A) \\quad \\text{or equivalently} \\quad P(A) + P(\\bar{A}) = 1$$</p>
<p><strong>Explanation & Importance:</strong></p>
<ul>
  <li>In any random experiment, either event \\(A\\) occurs or its complement \\(\\bar{A}\\) occurs; they are mutually exclusive (\\(A \\cap \\bar{A} = \\phi\\)) and exhaustive (\\(A \\cup \\bar{A} = S\\)).</li>
  <li>The rule implies that the probability of the non-occurrence of an event equals 1 minus the probability of its occurrence.</li>
  <li>It is especially valuable when computing probabilities involving <em>"at least one"</em> or complex event unions where directly enumerating outcomes is tedious.</li>
</ul>`,
    explanation: 'From STA301 Handouts Lecture 19, Page 148. The Law of Complementation is fundamental for reducing computational steps in probability questions.',
    urdu_answer: 'قانون تکمیلیت (Law of Complementation) کے مطابق کسی واقعے کے واقع نہ ہونے کا امکان، 1 میں سے اس واقعے کے ہونے کے امکان کو تفریق کرنے سے حاصل ہوتا ہے، یعنی $P(\\bar{A}) = 1 - P(A)$ یا $P(A) + P(\\bar{A}) = 1$۔'
  },
  {
    stem: 'State the General Addition Theorem of Probability for any two non-mutually exclusive events, explaining why the joint probability is subtracted.',
    correct: `<p><strong>General Addition Theorem of Probability:</strong></p>
<p>If \\(A\\) and \\(B\\) are any two events defined on the same sample space \\(S\\), then the probability that at least one of them occurs (event \\(A \\cup B\\)) is given by:</p>
<p>$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$</p>
<p><strong>Why \\(P(A \\cap B)\\) is subtracted:</strong></p>
<ul>
  <li>When events \\(A\\) and \\(B\\) are non-mutually exclusive, they share common sample points (the intersection \\(A \\cap B\\)).</li>
  <li>Calculating \\(P(A) + P(B)\\) counts these joint/overlapping outcomes twice (once in \\(A\\) and once in \\(B\\)).</li>
  <li>Subtracting \\(P(A \\cap B)\\) eliminates this duplicate counting, ensuring that each favorable outcome is counted exactly once.</li>
</ul>`,
    explanation: 'From STA301 Handouts Lecture 19, Page 149. The General Addition Theorem applies to any two events in sample space S.',
    urdu_answer: 'جنرل ایڈیشن تھیورم کے مطابق $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$۔ مشترکہ امکان $P(A \\cap B)$ کو اس لیے منفی کیا جاتا ہے تاکہ مشترکہ نتائج کی دوہری گنتی (Double Counting) کو ختم کیا جا سکے۔'
  },
  {
    stem: 'State the Corollary of the Addition Theorem for mutually exclusive events (Special Addition Rule) and explain its mathematical condition.',
    correct: `<p><strong>Special Rule of Addition (Corollary for Mutually Exclusive Events):</strong></p>
<p>If events \\(A\\) and \\(B\\) are mutually exclusive (disjoint), the probability that event \\(A\\) or event \\(B\\) occurs is the sum of their individual probabilities:</p>
<p>$$P(A \\cup B) = P(A) + P(B)$$</p>
<p><strong>Mathematical Condition:</strong></p>
<ul>
  <li>Two events are mutually exclusive if and only if they cannot happen simultaneously, meaning their intersection is the empty set:</li>
  <p>$$A \\cap B = \\phi \\implies P(A \\cap B) = 0$$</p>
  <li>Substituting \\(P(A \\cap B) = 0\\) into the general addition formula yields \\(P(A \\cup B) = P(A) + P(B)\\).</li>
  <li>For \\(k\\) mutually exclusive events \\(A_1, A_2, \\dots, A_k\\), this extends to:</li>
  <p>$$P(A_1 \\cup A_2 \\cup \\dots \\cup A_k) = P(A_1) + P(A_2) + \\dots + P(A_k)$$</p>
</ul>`,
    explanation: 'From STA301 Handouts Lecture 19, Page 150. Mutually exclusive events have zero joint occurrence.',
    urdu_answer: 'جب دو واقعات Mutually Exclusive ہوں تو ان کا مشترکہ وقوع ناممکن ہوتا ہے یعنی $P(A \\cap B) = 0$، جس سے فارمولا سادہ ہو کر $P(A \\cup B) = P(A) + P(B)$ بن جاتا ہے۔'
  },
  {
    stem: 'Three horses A, B, and C are in a race. Horse A is twice as likely to win as B, and B is twice as likely to win as C. Assuming ties are impossible, what is the probability that horse A or B wins?',
    correct: `<p><strong>Solution:</strong></p>
<ol>
  <li><strong>Assign relative probabilities in terms of a parameter \\(p\\):</strong>
    <ul>
      <li>Let the probability of horse C winning be \\(P(C) = p\\).</li>
      <li>Since horse B is twice as likely to win as C: \\(P(B) = 2p\\).</li>
      <li>Since horse A is twice as likely to win as B: \\(P(A) = 2 \\times P(B) = 2(2p) = 4p\\).</li>
    </ul>
  </li>
  <li><strong>Apply the Exhaustive Property of Probability:</strong>
    <p>Since one of the three horses must win and ties are impossible, events A, B, and C are mutually exclusive and exhaustive:</p>
    <p>$$P(A) + P(B) + P(C) = 1$$</p>
    <p>$$4p + 2p + p = 1 \\implies 7p = 1 \\implies p = \\frac{1}{7}$$</p>
    <p>Therefore: \\(P(C) = \\frac{1}{7}\\), \\(P(B) = \\frac{2}{7}\\), and \\(P(A) = \\frac{4}{7}\\).</p>
  </li>
  <li><strong>Calculate \\(P(A \\cup B)\\):</strong>
    <p>Since only one horse can win, events A and B are mutually exclusive:</p>
    <p>$$P(A \\cup B) = P(A) + P(B) = \\frac{4}{7} + \\frac{2}{7} = \\mathbf{\\frac{6}{7} \\approx 0.8571 \\text{ (or } 85.71\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 19, Pages 150–151 (Example on horse race probabilities). Appeared in multiple midterm papers.',
    urdu_answer: 'اگر $P(C) = p$ ہو تو $P(B) = 2p$ اور $P(A) = 4p$ ہوگا۔ چونکہ کل امکان 1 ہوتا ہے: $4p + 2p + p = 1 \\implies p = 1/7$۔ لہٰذا A یا B کے جیتنے کا امکان $4/7 + 2/7 = 6/7$ (یا تقریباً 85.71 فیصد) ہے۔'
  }
];

// 3 Long / Numerical Questions
const longQuestions = [
  {
    stem: 'State the General Addition Theorem for two non-mutually exclusive events $A$ and $B$. Using this theorem, calculate the probability that a single card drawn at random from a standard deck of 52 playing cards is a Club or a Face Card or both.',
    correct: `<p><strong>1. Statement of General Addition Theorem:</strong></p>
<p>If \\(A\\) and \\(B\\) are any two non-mutually exclusive events in a sample space \\(S\\), then the probability that at least one of the events occurs is given by:</p>
<p>$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$</p>

<p><strong>2. Card Problem Step-by-Step Solution:</strong></p>
<ol>
  <li><strong>Total Number of Outcomes:</strong>
    <p>A standard deck of cards has \\(n(S) = 52\\) cards.</p>
  </li>
  <li><strong>Probability of Drawing a Club (Event \\(A\\)):</strong>
    <p>There are 13 clubs in the deck. Hence:</p>
    <p>$$n(A) = 13 \\implies P(A) = \\frac{13}{52}$$</p>
  </li>
  <li><strong>Probability of Drawing a Face Card (Event \\(B\\)):</strong>
    <p>There are 12 face cards in total (4 Jacks, 4 Queens, 4 Kings). Hence:</p>
    <p>$$n(B) = 12 \\implies P(B) = \\frac{12}{52}$$</p>
  </li>
  <li><strong>Probability of Joint Occurrence (Event \\(A \\cap B\\)):</strong>
    <p>The cards that are simultaneously clubs and face cards are the Jack, Queen, and King of Clubs (3 cards):</p>
    <p>$$n(A \\cap B) = 3 \\implies P(A \\cap B) = \\frac{3}{52}$$</p>
  </li>
  <li><strong>Apply the General Addition Theorem:</strong>
    <p>$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$</p>
    <p>$$P(A \\cup B) = \\frac{13}{52} + \\frac{12}{52} - \\frac{3}{52} = \\frac{13 + 12 - 3}{52} = \\frac{22}{52} = \\mathbf{\\frac{11}{26} \\approx 0.4231 \\text{ (or } 42.31\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 19, Pages 149–150. Demonstrates proper application of addition theorem with non-disjoint sets.',
    urdu_answer: 'جنرل ایڈیشن تھیورم $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ کا اطلاق کرتے ہوئے: چڑیا کے 13 پتوں کا امکان $13/52$، فیس کارڈز کے 12 پتوں کا امکان $12/52$ اور دونوں کے مشترک 3 پتوں کا امکان $3/52$ ہے۔ پس مطلوبہ امکان $13/52 + 12/52 - 3/52 = 22/52 = 11/26$ (تقریباً 0.4231) ہے۔'
  },
  {
    stem: 'Suppose a pair of fair six-sided dice is tossed. What is the probability of getting a total sum of 5 or a total sum of 11? Show complete sample points, verify mutual exclusivity, and calculate the final probability.',
    correct: `<p><strong>Solution:</strong></p>
<ol>
  <li><strong>Total Sample Points in Experiment:</strong>
    <p>When two balanced dice are rolled, the total number of equally likely outcomes is:</p>
    <p>$$n(S) = 6 \\times 6 = 36$$</p>
  </li>
  <li><strong>Event \\(A\\): Getting a Total of 5:</strong>
    <p>The favorable ordered pairs \\((d_1, d_2)\\) summing to 5 are:</p>
    <p>$$A = \\{(1, 4), (2, 3), (3, 2), (4, 1)\\}$$</p>
    <p>$$n(A) = 4 \\implies P(A) = \\frac{4}{36}$$</p>
  </li>
  <li><strong>Event \\(B\\): Getting a Total of 11:</strong>
    <p>The favorable ordered pairs summing to 11 are:</p>
    <p>$$B = \\{(5, 6), (6, 5)\\}$$</p>
    <p>$$n(B) = 2 \\implies P(B) = \\frac{2}{36}$$</p>
  </li>
  <li><strong>Check Mutual Exclusivity:</strong>
    <p>A single roll of two dice cannot yield a sum that is simultaneously 5 and 11. Therefore, the events have no outcomes in common:</p>
    <p>$$A \\cap B = \\phi \\implies P(A \\cap B) = 0$$</p>
  </li>
  <li><strong>Apply the Special Addition Rule:</strong>
    <p>$$P(A \\cup B) = P(A) + P(B) = \\frac{4}{36} + \\frac{2}{36} = \\frac{6}{36} = \\mathbf{\\frac{1}{6} \\approx 0.1667 \\text{ (or } 16.67\\%\\)}$$</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 19, Page 150 (Example: Sum of two dice). Frequently asked 5-mark question in midterm examinations.',
    urdu_answer: 'دو پانسے پھینکنے پر کل نمونہ نتائج 36 ہوتے ہیں۔ مجموعہ 5 آنے کے 4 جوڑے اور مجموعہ 11 آنے کے 2 جوڑے بنتے ہیں۔ چونکہ دونوں ایک ساتھ ممکن نہیں (Mutually Exclusive)، لہٰذا $P(A \\cup B) = 4/36 + 2/36 = 6/36 = 1/6$ (تقریباً 0.1667) ہوگا۔'
  },
  {
    stem: 'A fair balanced coin is tossed 4 times in succession. Using the Law of Complementation, calculate the probability that at least one head occurs. Contrast this with the direct addition method to demonstrate the efficiency of the complement rule.',
    correct: `<p><strong>Solution using the Law of Complementation:</strong></p>
<ol>
  <li><strong>Total Sample Points:</strong>
    <p>For 4 tosses of a fair coin, the size of the sample space is:</p>
    <p>$$n(S) = 2^4 = 16$$</p>
  </li>
  <li><strong>Define Event and its Complement:</strong>
    <ul>
      <li>Let \\(A\\) = Event that <em>at least one head</em> occurs in the 4 tosses.</li>
      <li>Then \\(\\bar{A}\\) = Event that <em>no head</em> occurs (meaning all 4 tosses result in Tails: \\(\\{TTTT\\}\\)).</li>
    </ul>
  </li>
  <li><strong>Probability of the Complement \\(P(\\bar{A})\\):</strong>
    <p>There is only 1 outcome out of 16 where zero heads appear:</p>
    <p>$$n(\\bar{A}) = 1 \\implies P(\\bar{A}) = \\frac{1}{16}$$</p>
  </li>
  <li><strong>Apply Law of Complementation:</strong>
    <p>$$P(A) = 1 - P(\\bar{A}) = 1 - \\frac{1}{16} = \\mathbf{\\frac{15}{16} = 0.9375 \\text{ (or } 93.75\\%\\)}$$</p>
  </li>
  <li><strong>Efficiency Comparison (Direct Method):</strong>
    <p>To find \\(P(A)\\) directly, one would have to calculate and sum the probabilities of getting exactly 1 head, 2 heads, 3 heads, and 4 heads:</p>
    <p>$$P(A) = P(1H) + P(2H) + P(3H) + P(4H) = \\frac{\\binom{4}{1} + \\binom{4}{2} + \\binom{4}{3} + \\binom{4}{4}}{16} = \\frac{4 + 6 + 4 + 1}{16} = \\frac{15}{16}$$</p>
    <p>The Law of Complementation avoids summing 4 separate terms and directly yields the solution in one simple step: \\(1 - P(\\text{no heads})\\).</p>
  </li>
</ol>`,
    explanation: 'From STA301 Handouts Lecture 19, Page 149 (Example on complementation and coin tosses). Standard 5-mark theoretical and calculation question.',
    urdu_answer: 'سکے کو 4 بار اچھالنے پر کل 16 نتائج بنتے ہیں۔ کوئی ہیڈ نہ آنے (یعنی چاروں ٹیلز TTTT) کا امکان $1/16$ ہے۔ قانون تکمیلیت لاگو کرتے ہوئے کم از کم ایک ہیڈ آنے کا امکان $1 - 1/16 = 15/16 = 0.9375$ ہوگا۔'
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
console.log(`Lecture 19 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

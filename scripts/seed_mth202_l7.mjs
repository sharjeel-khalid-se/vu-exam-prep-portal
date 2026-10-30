import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate MTH202
const mth202 = db.prepare("SELECT id FROM subjects WHERE slug = 'mth202'").get();
if (!mth202) {
  console.error('MTH202 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 7
let lec7 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 7").get(mth202.id);
if (!lec7) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 7, 'Set Theory: Sets, Subsets, Universal Set, Power Sets & Cardinality')
  `).run(mth202.id);
  lec7 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 7 with ID: ${lec7.id}`);
} else {
  console.log(`MTH202 Lecture 7 found with ID: ${lec7.id}`);
}

// 3. Clear existing questions for Lecture 7 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec7.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 7.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Null set is denoted by __________.',
    options: {
      a: '$\\phi$ or $\\{ \\}$',
      b: '$A$',
      c: 'None of these'
    },
    correct: 'a',
    explanation: 'The null (or empty) set contains no elements whatsoever and is standardly denoted by the Greek symbol $\\phi$ (or $\\emptyset$) or empty braces $\\{ \\}$ (MTH202 Handouts Page 30). Appeared 10+ times in Moaaz, Junaid, and Team Hadi files.',
    urdu_answer: 'خالی سیٹ (Null set) کو علامت $\\phi$ یا خالی بریکٹ $\\{ \\}$ سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'The power set of a set A is the set of all subsets of A, denoted P(A).',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'By mathematical definition, the power set of any set $A$, written $\\mathcal{P}(A)$ or $P(A)$, is the set whose elements are all possible subsets of $A$, including the empty set $\\emptyset$ and $A$ itself (MTH202 Handouts Page 40). Appeared 12+ times across Moaaz, Junaid, and All in One.',
    urdu_answer: 'یہ بیان بالکل درست (True) ہے؛ کسی سیٹ کے تمام ممکنہ ذیلی سیٹوں کے مجموعے کو اس کا پاور سیٹ کہا جاتا ہے۔'
  },
  {
    stem: 'If a set A contains n elements, then the number of elements in its power set P(A) is __________.',
    options: {
      a: '$2n$',
      b: '$n^2$',
      c: '$2^n$',
      d: '$n^0$'
    },
    correct: 'c',
    explanation: 'If a finite set $A$ has cardinality $|A| = n$, each element has two choices (either included or excluded in a subset), giving total subsets $|P(A)| = 2^n$ (MTH202 Handouts Page 40). Appeared 15+ times in Grand Quiz 2020, Attiq Kundi, and Moaaz.',
    urdu_answer: 'اگر سیٹ میں n ارکان ہوں تو اس کے پاور سیٹ میں ارکان کی تعداد $2^n$ ہوتی ہے۔'
  },
  {
    stem: 'If a set A has 5 elements, then the power set of A, P(A), contains __________ elements.',
    options: {
      a: '$5^5$',
      b: '$2^n$',
      c: '$4^5$',
      d: '$2^5$'
    },
    correct: 'd',
    explanation: 'Applying the cardinality formula $|P(A)| = 2^n$ where $n = 5$: the number of subsets is $2^5 = 32$ (MTH202 Handouts Page 40). Appeared 8+ times in Junaid and Moaaz papers.',
    urdu_answer: 'اگر سیٹ میں 5 ارکان ہوں تو پاور سیٹ میں $2^5$ یعنی 32 ارکان ہوں گے۔'
  },
  {
    stem: 'If A = {{5}}, then the power set of A is equal to __________.',
    options: {
      a: '$\\{\\{\\emptyset, \\{5\\}\\}\\}$',
      b: '$\\{\\emptyset, \\{5\\}\\}$',
      c: '$\\{\\emptyset, \\{\\{5\\}\\}\\}$',
      d: '$\\{\\{\\emptyset\\}, \\{5\\}\\}$'
    },
    correct: 'c',
    explanation: 'Here $A$ is a singleton set containing exactly one element $x = \\{5\\}$. Its subsets are $\\emptyset$ and $\\{x\\} = \\{\\{5\\}\\}$. Therefore, $P(A) = \\{\\emptyset, \\{\\{5\\}\\}$ (MTH202 Mid-Term by Attiq Kundi Q19).',
    urdu_answer: 'چونکہ سیٹ A کا واحد رکن {5} ہے، اس لیے اس کے ذیلی سیٹ $\\emptyset$ اور {{5}} ہوں گے، اور پاور سیٹ $\\{\\emptyset, \\{\\{5\\}\\}$ بنے گا۔'
  },
  {
    stem: 'The total number of elements in a set is called __________.',
    options: {
      a: 'Strength',
      b: 'Cardinality',
      c: 'Finite',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'The cardinality (or order) of a set $A$, denoted $|A|$ or $n(A)$, is defined as the total number of distinct elements contained in the set (MTH202 Handouts Page 31). Appeared 12+ times.',
    urdu_answer: 'کسی سیٹ کے ارکان کی کل تعداد کو اس سیٹ کی کارڈینالٹی (Cardinality) کہا جاتا ہے۔'
  },
  {
    stem: 'If a set contains exactly m distinct elements where m denotes some non-negative integer, then the set is __________.',
    options: {
      a: 'Finite',
      b: 'Infinite',
      c: 'None of these'
    },
    correct: 'a',
    explanation: 'A set is defined as finite if it is either empty or contains exactly $m$ distinct elements, where $m \\in \\{0, 1, 2, \\dots\\}$ (MTH202 Handouts Page 31). Appeared 10+ times in Junaid, Paper 1, and Paper 7.',
    urdu_answer: 'اگر کسی سیٹ کے ارکان کی تعداد کوئی مخصوص غیر منفی عدد m ہو تو وہ محدود یعنی فائنائٹ (Finite) سیٹ کہلاتا ہے۔'
  },
  {
    stem: 'Identify the FALSE statement among the following:',
    options: {
      a: '$0 \\in \\emptyset$',
      b: '$\\{\\emptyset\\} \\subseteq \\{\\emptyset\\}$',
      c: 'If $A \\subseteq B$ and $B \\subseteq A$, then $A = B$',
      d: 'Two sets are disjoint if their intersection is the empty set'
    },
    correct: 'a',
    explanation: 'The empty set $\\emptyset$ contains no elements whatsoever ($|\\emptyset| = 0$). The number $0$ is an element, so $0 \\in \\emptyset$ is completely FALSE (MTH202 Handouts Page 30). Appeared 6+ times in Moaaz and Junaid.',
    urdu_answer: 'بیان $0 \\in \\emptyset$ غلط ہے کیونکہ خالی سیٹ میں کوئی بھی رکن موجود نہیں ہوتا، جبکہ 0 خود ایک رکن ہے۔'
  },
  {
    stem: 'The same element can never appear twice in a set.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'By standard Cantor set theory definition, a set is a collection of distinct and well-defined objects; repetition of elements has no mathematical significance and elements are not counted twice (MTH202 Handouts Page 29).',
    urdu_answer: 'یہ بیان درست (True) ہے کیونکہ سیٹ منفرد ارکان کا مجموعہ ہوتا ہے اور ایک ہی رکن دوبارہ نہیں لکھا جاتا۔'
  },
  {
    stem: 'The number of elements in the power set of ∅, denoted by P(∅), is __________.',
    options: {
      a: '2',
      b: '1',
      c: '0',
      d: 'n'
    },
    correct: 'b',
    explanation: 'Since the empty set contains $n = 0$ elements, its power set contains $2^0 = 1$ element, namely $P(\\emptyset) = \\{\\emptyset\\}$ (MTH202 Handouts Page 40). Appeared in Grand Quiz 2020.',
    urdu_answer: 'خالی سیٹ کا کوئی رکن نہیں ہوتا ($n=0$)، لہٰذا اس کے پاور سیٹ میں $2^0 = 1$ رکن یعنی $\\{\\emptyset\\}$ ہوتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Set, Subset, Proper Subset, and Improper Subset with examples.',
    correct: `<p><strong>Fundamental Concepts of Set Theory (MTH202 Handouts Page 29–30):</strong></p>
<ol>
  <li><strong>Set:</strong> A well-defined collection of distinct objects. Objects in a set are called its elements or members. Example: $A = \\{1, 2, 3\\}$.</li>
  <li><strong>Subset ($A \\subseteq B$):</strong> Set $A$ is a subset of $B$ if and only if every element of $A$ is also an element of $B$:
    $$\\forall x, (x \\in A \\rightarrow x \\in B)$$
  </li>
  <li><strong>Proper Subset ($A \\subset B$):</strong> $A$ is a proper subset of $B$ if every element of $A$ is in $B$, but $B$ contains at least one element that does not belong to $A$ ($A \\subseteq B$ and $A \\neq B$). Example: $\\{1, 2\\} \\subset \\{1, 2, 3\\}$.</li>
  <li><strong>Improper Subset:</strong> Every set $A$ has two improper subsets: the empty set $\\emptyset$ and the set $A$ itself. Any subset other than $A$ itself is a proper subset.</li>
</ol>`,
    explanation: 'Core set definitions from MTH202 Handouts Page 29–30 and Student Subjective Papers Page 10.',
    urdu_answer: 'سیٹ منفرد اشیاء کا مجموعہ ہے۔ اگر A کا ہر رکن B میں ہو تو A ذیلی سیٹ ہے ($A \\subseteq B$)۔ اگر B میں کم از کم ایک اضافی رکن ہو تو Proper Subset ہے، جبکہ $\\emptyset$ اور خود A امپراپر سب سیٹ ہیں۔'
  },
  {
    stem: 'Define Power Set and state its mathematical formula for Cardinality.',
    correct: `<p><strong>Power Set (MTH202 Handouts Page 40):</strong></p>
<p>The <strong>Power Set</strong> of a given set $A$, denoted $\\mathcal{P}(A)$ or $P(A)$, is defined as the set of all possible subsets of $A$.</p>
$$P(A) = \\{ S \\mid S \\subseteq A \\}$$
<p><strong>Cardinality Formula:</strong></p>
<p>If a set $A$ contains $n$ elements (i.e., $|A| = n$), then its power set contains exactly $2^n$ elements:</p>
$$|P(A)| = 2^n$$
<p><strong>Example:</strong> For $A = \\{a, b\\}$, $|A| = 2$. Then $|P(A)| = 2^2 = 4$, and $P(A) = \\{\\emptyset, \\{a\\}, \\{b\\}, \\{a, b\\}\\}$.</p>`,
    explanation: 'Power set definition and exponential cardinality formula from MTH202 Handouts Page 40.',
    urdu_answer: 'کسی سیٹ کے تمام ممکنہ ذیلی سیٹس کے سیٹ کو پاور سیٹ کہتے ہیں۔ اگر سیٹ میں n ارکان ہوں تو پاور سیٹ میں $2^n$ ارکان ہوتے ہیں۔'
  },
  {
    stem: 'Why is the empty set (∅) a subset of every set? Provide the logical proof.',
    correct: `<p><strong>Proof: The Empty Set is a Subset of Every Set (MTH202 Handouts Page 30):</strong></p>
<p><strong>Definition of Subset:</strong> By definition, for any set $B$:</p>
$$\\emptyset \\subseteq B \\iff \\forall x (x \\in \\emptyset \\rightarrow x \\in B)$$
<p><strong>Logical Evaluation:</strong></p>
<ol>
  <li>The empty set $\\emptyset$ contains no elements by definition.</li>
  <li>Therefore, for any object $x$, the premise condition $x \\in \\emptyset$ is always <strong>FALSE</strong>.</li>
  <li>In mathematical logic, any conditional statement with a False hypothesis ($F \\rightarrow P$) evaluates to <strong>TRUE</strong> regardless of the truth value of the conclusion.</li>
  <li>Consequently, the statement $\\forall x (x \\in \\emptyset \\rightarrow x \\in B)$ is <strong>vacuously true</strong> for any set $B$.</li>
</ol>
<p>Thus, $\\mathbf{\\emptyset \\subseteq B}$ holds universally for every set $B$.</p>`,
    explanation: 'Rigorous vacuous truth proof from MTH202 Handouts Page 30 and Subjective Papers Page 15.',
    urdu_answer: 'چونکہ خالی سیٹ میں کوئی رکن نہیں ہوتا اس لیے $x \\in \\emptyset$ ہمیشہ False ہوتا ہے، اور منطق کے اصول کے مطابق فالس مفروضے والا کنڈیشنل بیان ہمیشہ سچ (Vacuously True) ہوتا ہے۔'
  },
  {
    stem: 'Determine the truth value (True or False) of the following set membership and subset relations:\n1) x ∈ {x}\n2) {x} ⊆ {x}\n3) {x} ∈ {x}\n4) {x} ∈ {{x}}\n5) ∅ ⊆ {x}\n6) ∅ ∈ {x}',
    correct: `<p><strong>Evaluating Set Relations (MTH202 Handouts Page 30):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Statement</th>
      <th class="p-2 border">Truth Value</th>
      <th class="p-2 border">Mathematical Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">$x \\in \\{x\\}$</td>
      <td class="p-2 border font-bold text-emerald-700">TRUE</td>
      <td class="p-2 border">$x$ is an explicit member element of the singleton set $\\{x\\}$.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">$\\{x\\} \\subseteq \\{x\\}$</td>
      <td class="p-2 border font-bold text-emerald-700">TRUE</td>
      <td class="p-2 border">Every set is reflexive and is a subset of itself.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">$\\{x\\} \\in \\{x\\}$</td>
      <td class="p-2 border font-bold text-rose-600">FALSE</td>
      <td class="p-2 border">The set $\\{x\\}$ contains element $x$, not the set $\\{x\\}$ itself.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">$\\{x\\} \\in \\{\\{x\\}\\}$</td>
      <td class="p-2 border font-bold text-emerald-700">TRUE</td>
      <td class="p-2 border">The set $\\{x\\}$ is the single member element inside $\\{\\{x\\}\\}$.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">$\\emptyset \\subseteq \\{x\\}$</td>
      <td class="p-2 border font-bold text-emerald-700">TRUE</td>
      <td class="p-2 border">The empty set $\\emptyset$ is a subset of every set.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">$\\emptyset \\in \\{x\\}$</td>
      <td class="p-2 border font-bold text-rose-600">FALSE</td>
      <td class="p-2 border">The only member element in $\\{x\\}$ is $x$, not the symbol $\\emptyset$.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive set relation evaluation from MTH202 Handouts Page 30.',
    urdu_answer: 'رکنیت ($\\in$) اور ذیلی سیٹ ($\\subseteq$) کے فرق کے تحت: $x \\in \\{x\\}$ سچ ہے، $\\{x\\} \\subseteq \\{x\\}$ سچ ہے، $\\{x\\} \\in \\{x\\}$ غلط ہے، $\\{x\\} \\in \\{\\{x\\}\\}$ سچ ہے، $\\emptyset \\subseteq \\{x\\}$ سچ ہے، اور $\\emptyset \\in \\{x\\}$ غلط ہے۔'
  },
  {
    stem: 'Problem: Give the power set of the set A = {x, y}.',
    correct: `<p><strong>Finding the Power Set of $A = \\{x, y\\}$:</strong></p>
<ol>
  <li><strong>Count Elements:</strong> Set $A$ has $n = 2$ elements.</li>
  <li><strong>Total Subsets:</strong>
    $$|P(A)| = 2^n = 2^2 = 4 \\text{ subsets}$$
  </li>
  <li><strong>List Subsets by Cardinality:</strong>
    <ul>
      <li>Subsets of size 0: $\\emptyset$</li>
      <li>Subsets of size 1: $\\{x\\}, \\{y\\}$</li>
      <li>Subsets of size 2: $\\{x, y\\}$</li>
    </ul>
  </li>
  <li><strong>Power Set:</strong>
    $$P(A) = \\{\\emptyset, \\{x\\}, \\{y\\}, \\{x, y\\}\\}$$
  </li>
</ol>`,
    explanation: 'Standard problem from MTH202 Subjective Papers by Adil Alvi Q4.',
    urdu_answer: 'سیٹ A کے 2 ارکان ہیں اس لیے 4 ذیلی سیٹ بنیں گے: $P(A) = \\{\\emptyset, \\{x\\}, \\{y\\}, \\{x, y\\}\\}$۔'
  },
  {
    stem: 'Problem: If a set A contains 15 elements, calculate the exact number of elements in its power set P(A).',
    correct: `<p><strong>Power Set Cardinality Calculation:</strong></p>
<p>Given:</p>
$$|A| = n = 15$$
<p><strong>Formula:</strong></p>
$$|P(A)| = 2^n = 2^{15}$$
<p><strong>Calculation:</strong></p>
$$2^{10} = 1024$$
$$2^{15} = 2^{10} \\times 2^5 = 1024 \\times 32 = \\mathbf{32,768}$$
<p>Therefore, the power set contains exactly <strong>32,768 elements</strong> (subsets) (MTH202 Grand Quiz 2020).</p>`,
    explanation: 'Numerical cardinality calculation from MTH202 Grand Quiz 2020 and Attiq Kundi.',
    urdu_answer: 'سیٹ کے 15 ارکان ہیں، اس لیے اس کے پاور سیٹ میں $2^{15} = 32,768$ ارکان ہوں گے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Find the successive Power Sets P(∅), P(P(∅)), and P(P(P(∅))) showing step-by-step element counts and subset derivations.',
    correct: `<p><strong>Step-by-Step Derivation of Successive Power Sets of $\\emptyset$:</strong></p>

<h4>1. Find $P(\\emptyset)$:</h4>
<ul>
  <li>The empty set $\\emptyset$ has $0$ elements ($n = 0$).</li>
  <li>Number of subsets: $2^0 = 1$.</li>
  <li>The only subset of $\\emptyset$ is $\\emptyset$ itself.</li>
  <li>$$\\mathbf{P(\\emptyset) = \\{\\emptyset\\}}$$</li>
</ul>

<h4>2. Find $P(P(\\emptyset))$:</h4>
<ul>
  <li>The set $P(\\emptyset) = \\{\\emptyset\\}$ contains $1$ element ($n = 1$).</li>
  <li>Number of subsets: $2^1 = 2$.</li>
  <li>The subsets are: $\\emptyset$ and $\\{\\emptyset\\}$.</li>
  <li>$$\\mathbf{P(P(\\emptyset)) = \\{\\emptyset, \\{\\emptyset\\}\\}}$$</li>
</ul>

<h4>3. Find $P(P(P(\\emptyset)))$:</h4>
<ul>
  <li>The set $P(P(\\emptyset)) = \\{\\emptyset, \\{\\emptyset\\}\\}$ contains $2$ elements ($n = 2$).</li>
  <li>Number of subsets: $2^2 = 4$.</li>
  <li>Subsets:
    <ul>
      <li>Empty set: $\\emptyset$</li>
      <li>Singletons: $\\{\\emptyset\\}, \\{\\{\\emptyset\\}\\}$</li>
      <li>Full set: $\\{\\emptyset, \\{\\emptyset\\}\\}$</li>
    </ul>
  </li>
  <li>$$\\mathbf{P(P(P(\\emptyset))) = \\{\\emptyset, \\{\\emptyset\\}, \\{\\{\\emptyset\\}\\}, \\{\\emptyset, \\{\\emptyset\\}\\}\\}}$$</li>
</ul>`,
    explanation: 'Classic recursive power set question from MTH202 Handouts Page 40 and Junaid solved MCQs.',
    urdu_answer: '$P(\\emptyset) = \\{\\emptyset\\}$ (1 رکن)، $P(P(\\emptyset)) = \\{\\emptyset, \\{\\emptyset\\}\\}$ (2 ارکان)، اور $P(P(P(\\emptyset))) = \\{\\emptyset, \\{\\emptyset\\}, \\{\\{\\emptyset\\}\\}, \\{\\emptyset, \\{\\emptyset\\}\\}\\}$ (4 ارکان)۔'
  }
];

// 7. Insert Statements
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
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'lecture')
`);

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lec7.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec7.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec7.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 7:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short / Problem Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 7: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

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

// 2. Create or fetch Lecture 16
let lec16 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 16").get(sta301.id);
if (!lec16) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 16, 'Introduction to Set Theory, Venn Diagrams, and Set Operations')
  `).run(sta301.id);
  lec16 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 16 with ID: ${lec16.id}`);
} else {
  console.log(`STA301 Lecture 16 already exists with ID: ${lec16.id}`);
}

const lId = lec16.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 16.`);

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

// 14 Past Paper MCQs
const mcqs = [
  {
    stem: 'A set is fundamentally defined as any well-defined collection of:',
    options: {
      a: 'Positive Objects',
      b: 'Negative Objects',
      c: 'Same Objects',
      d: 'Distinct Objects'
    },
    correct: 'd',
    explanation: 'By classical mathematical definition, a set is any well-defined collection of distinct and well-distinguished objects (called its members or elements) (STA301 Handouts Lecture 16, Page 132). Appeared in 6+ midterm papers.',
    urdu_answer: 'سیٹ بنیادی طور پر واضح اور منفرد/مختلف اشیاء (Distinct Objects) کے مجموعے کو کہتے ہیں۔'
  },
  {
    stem: 'A set that contains all possible objects or outcomes under consideration in a particular discussion is known as the:',
    options: {
      a: 'Finite Set',
      b: 'Infinite Set',
      c: 'Universal Set',
      d: 'Power Set'
    },
    correct: 'c',
    explanation: 'The universal set (denoted by $S$ or $U$) is the comprehensive set containing all possible elements or outcomes relevant to a given investigation (STA301 Handouts Lecture 16, Page 134). Appeared in 12+ midterm papers.',
    urdu_answer: 'ایسا سیٹ جس میں زیرِ بحث نظام کے تمام ممکنہ نتائج یا ارکان شامل ہوں، یونیورسل سیٹ (Universal Set) کہلاتا ہے۔'
  },
  {
    stem: 'Which set is considered a subset of every set in set theory?',
    options: {
      a: 'Empty Set ($\\phi$)',
      b: 'Power Set',
      c: 'Universal Set',
      d: 'Super Set'
    },
    correct: 'a',
    explanation: 'By standard theorem, the empty set (null set $\\phi$ or $\\{\\}$) contains no elements and is universally a subset of every set (STA301 Handouts Lecture 16, Page 133). Appeared in 8+ midterm papers.',
    urdu_answer: 'خالی سیٹ (Empty set / $\\phi$) دنیا کے ہر سیٹ کا سب سیٹ (تحتی سیٹ) ہوتا ہے۔'
  },
  {
    stem: 'Consider a set $A = \\{1, 2, 3\\}$. What is the total number of subsets that can be formed from $A$?',
    options: {
      a: '3',
      b: '6',
      c: '8',
      d: '9'
    },
    correct: 'c',
    explanation: 'If a finite set contains $n$ elements, the total number of possible subsets is given by $2^n$. Here $n = 3$, so $2^3 = 8$ subsets (STA301 Handouts Lecture 16, Page 134). Appeared in 10+ midterm papers.',
    urdu_answer: 'اگر سیٹ میں 3 ارکان ہوں تو اس کے سب سیٹس کی کل تعداد $2^n = 2^3 = 8$ ہوتی ہے۔'
  },
  {
    stem: 'If $A = \\{H, T\\}$, which of the following collections represents the complete Power Set $P(A)$?',
    options: {
      a: '$\\{\\{\\}, \\{H, T\\}\\}$',
      b: '$\\{\\{H\\}, \\{T\\}, \\{H, T\\}\\}$',
      c: '$\\{\\{H\\}, \\{T\\}, \\{H, T\\}, \\{T, H\\}\\}$',
      d: '$\\{\\phi, \\{H\\}, \\{T\\}, \\{H, T\\}\\}$'
    },
    correct: 'd',
    explanation: 'The power set $P(A)$ is the set of all subsets of $A$. For $A = \\{H, T\\}$, the $2^2 = 4$ subsets are $\\phi$, $\\{H\\}$, $\\{T\\}$, and $\\{H, T\\}$ (STA301 Handouts Lecture 16, Page 135). Appeared in 6+ midterm papers.',
    urdu_answer: 'سیٹ $A = \\{H, T\\}$ کا پاور سیٹ $\\{\\phi, \\{H\\}, \\{T\\}, \\{H, T\\}\\}$ ہوتا ہے جس میں کل 4 سب سیٹس شامل ہیں۔'
  },
  {
    stem: 'The total number of elements in the Power Set $P(S)$ of the set $S = [\\phi, 1, \\{2, 3\\}]$ is:',
    options: {
      a: '3',
      b: '4',
      c: '8',
      d: '16'
    },
    correct: 'c',
    explanation: 'The set $S$ contains exactly 3 distinct elements ($e_1 = \\phi$, $e_2 = 1$, $e_3 = \\{2, 3\\}$). The number of elements in its power set is $2^n = 2^3 = 8$ (STA301 Handouts Lecture 16, Page 135).',
    urdu_answer: 'چونکہ سیٹ $S$ میں 3 ارکان ہیں، اس لیے اس کے پاور سیٹ میں ارکان کی تعداد $2^3 = 8$ ہوگی۔'
  },
  {
    stem: 'In a Venn diagram, the overlapping region between two intersecting circles representing sets $A$ and $B$ represents the:',
    options: {
      a: 'Union of two sets ($A \\cup B$)',
      b: 'Intersection of two sets ($A \\cap B$)',
      c: 'Difference of two sets ($A - B$)',
      d: 'Complement of the sets'
    },
    correct: 'b',
    explanation: 'In Venn diagrams, the common region shared between overlapping circles depicts the intersection ($A \\cap B$), containing elements common to both sets (STA301 Handouts Lecture 16, Page 134). Appeared in 10+ midterm papers.',
    urdu_answer: 'وین ڈایاگرام میں دو دائروں کے درمیانی مشترکہ (اوورلیپنگ) حصے کو تقاطع یعنی انٹرسیکشن ($A \\cap B$) کہتے ہیں۔'
  },
  {
    stem: 'Let $A = \\{1, 2, 3, 4\\}$ and $B = \\{3, 4, 5, 6\\}$. Then the intersection set $A \\cap B$ is:',
    options: {
      a: '$\\{3, 4\\}$',
      b: '$\\{1, 4\\}$',
      c: '$\\{3, 5\\}$',
      d: '$\\{3, 6\\}$'
    },
    correct: 'a',
    explanation: 'The intersection $A \\cap B$ consists of elements that belong simultaneously to both set $A$ and set $B$, which are $3$ and $4$ (STA301 Handouts Lecture 16, Page 134). Appeared in 9+ midterm papers.',
    urdu_answer: 'سیٹ $A$ اور $B$ میں مشترک ارکان 3 اور 4 ہیں، لہٰذا $A \\cap B = \\{3, 4\\}$ ہے۔'
  },
  {
    stem: 'If $A = \\{1, 2, 3, 4\\}$ and $B = \\{3, 4, 5, 6\\}$, then the union set $A \\cup B$ is:',
    options: {
      a: '$\\{3, 4\\}$',
      b: '$\\{1, 2, 5, 6\\}$',
      c: '$\\{1, 2, 3, 4, 5, 6\\}$',
      d: '$\\{1, 2, 3, 4\\}$'
    },
    correct: 'c',
    explanation: 'The union $A \\cup B$ contains all distinct elements belonging to $A$, to $B$, or to both: $\\{1, 2, 3, 4, 5, 6\\}$ (STA301 Handouts Lecture 16, Page 134). Appeared in 6+ midterm papers.',
    urdu_answer: 'سیٹ $A$ اور $B$ کے تمام ارکان کو ملا کر لکھنے سے یونین $A \\cup B = \\{1, 2, 3, 4, 5, 6\\}$ بنتا ہے۔'
  },
  {
    stem: 'If $A = \\{1, 2, 3, 4\\}$ and $B = \\{3, 4, 5, 6\\}$, then the set difference $A - B$ will be:',
    options: {
      a: '$\\{1, 2\\}$',
      b: '$\\{3, 4\\}$',
      c: '$\\{5, 6\\}$',
      d: '$\\{1, 2, 3, 4, 5, 6\\}$'
    },
    correct: 'a',
    explanation: 'The set difference $A - B$ consists of elements that belong to $A$ but do not belong to $B$. Removing $\\{3, 4\\}$ from $A$ leaves $\\{1, 2\\}$ (STA301 Handouts Lecture 16, Page 134). Appeared in 5+ midterm papers.',
    urdu_answer: 'سیٹ $A - B$ کا مطلب ہے کہ $A$ کے وہ ارکان جو $B$ میں نہ ہوں، لہٰذا جواب $\\{1, 2\\}$ ہے۔'
  },
  {
    stem: 'If $A = \\{1, 2, 3, 4, 5, 10\\}$ and $B = \\{1, 3, 5\\}$, the notation $B \\subset A$ means that:',
    options: {
      a: '$A$ is less than $B$',
      b: '$A$ is contained in $B$',
      c: '$B$ is contained in $A$',
      d: '$B$ is less than $A$'
    },
    correct: 'c',
    explanation: 'The subset notation $B \\subset A$ designates that every element belonging to set $B$ is also an element of set $A$, meaning "$B$ is contained in $A$" (STA301 Handouts Lecture 16, Page 133). Appeared in 8+ midterm papers.',
    urdu_answer: 'علامت $B \\subset A$ کا مطلب ہے کہ سیٹ $B$ سیٹ $A$ کے اندر مکمل طور پر شامل (contained) ہے۔'
  },
  {
    stem: 'Consider a universal set $S = \\{a, b, c, d, e\\}$. Which collection of subsets constitutes a valid PARTITION of $S$?',
    options: {
      a: '$\\{a, b\\}$ and $\\{c, d, e\\}$',
      b: '$\\{\\}$ and $\\{a, b, c, d, e\\}$',
      c: '$\\{a, b, c\\}$ and $\\{c, d, e\\}$',
      d: '$\\{a, b\\}$, $\\{c, d\\}$, and $\\{a, e\\}$'
    },
    correct: 'a',
    explanation: 'A partition requires non-empty subsets that are mutually disjoint ($\\cap = \\phi$) and collectively exhaustive ($\\cup = S$). The pair $\\{a, b\\}$ and $\\{c, d, e\\}$ have no common elements and their union equals $S$ (STA301 Handouts Lecture 16, Page 135). Appeared in 5+ midterm papers.',
    urdu_answer: 'سیٹ کی تقسیم (Partition) کے لیے سب سیٹس کا غیر خالی، غیر مشترک (Disjoint) اور ان کا یونین مکمل سیٹ کے برابر ہونا ضروری ہے، اس لیے $\\{a, b\\}$ اور $\\{c, d, e\\}$ درست پارٹیشن ہے۔'
  },
  {
    stem: 'In set algebra, the intersection of any set $A$ with the empty set $\\phi$ ($A \\cap \\phi$) is always equal to:',
    options: {
      a: '$A$',
      b: '$S$',
      c: '$\\phi$',
      d: '$A^c$'
    },
    correct: 'c',
    explanation: 'Because the empty set contains no elements, there can be no shared elements between $A$ and $\\phi$; thus $A \\cap \\phi = \\phi$ by the Identity Law (STA301 Handouts Lecture 16, Page 135). Appeared in 4+ midterm papers.',
    urdu_answer: 'کسی بھی سیٹ $A$ اور خالی سیٹ کا تقاطع ہمیشہ خالی سیٹ ($A \\cap \\phi = \\phi$) ہوتا ہے۔'
  },
  {
    stem: 'If set $A$ contains 2 elements $\\{H, T\\}$ and set $B$ contains 6 elements $\\{1, 2, 3, 4, 5, 6\\}$, how many ordered pairs are in the Cartesian product $A \\times B$?',
    options: {
      a: '8',
      b: '12',
      c: '36',
      d: '64'
    },
    correct: 'b',
    explanation: 'The cardinality of a Cartesian product is the product of individual cardinalities: $n(A \\times B) = n(A) \\times n(B) = 2 \\times 6 = 12$ ordered pairs (STA301 Handouts Lecture 16, Pages 135–136). Appeared in 4+ midterm papers.',
    urdu_answer: 'کارٹیشین پراڈکٹ $A \\times B$ میں جوڑوں کی کل تعداد $n(A) \\times n(B) = 2 \\times 6 = 12$ ہوگی۔'
  }
];

// 4 Short Questions
const shorts = [
  {
    stem: 'Explain the purpose and importance of Venn Diagrams in set theory and probability.',
    correct: `<p><strong>Venn Diagrams in Set Theory (STA301 Handouts Lecture 16):</strong></p>

<h4>1. Definition:</h4>
<p>A <strong>Venn diagram</strong> (introduced by the English logician John Venn in 1880) is a visual, pictorial representation of sets where the universal set \\(S\\) is represented by a closed rectangle, and subsets within \\(S\\) are represented by circles or ellipses.</p>

<h4>2. Key Uses and Importance:</h4>
<ul>
  <li><strong>Visual Intuition:</strong> It translates abstract set-theoretic relations into immediate geometric representations.</li>
  <li><strong>Verification of Set Operations:</strong> It visually depicts basic operations:
    <ul>
      <li><em>Union (\\(A \\cup B\\)):</em> The combined interior area of circles \\(A\\) and \\(B\\).</li>
      <li><em>Intersection (\\(A \\cap B\\)):</em> The overlapping lens-shaped region common to both circles.</li>
      <li><em>Set Difference (\\(A - B\\)):</em> The crescent portion of \\(A\\) excluding circle \\(B\\).</li>
      <li><em>Complement (\\(A^c\\)):</em> The area inside the rectangle \\(S\\) outside circle \\(A\\).</li>
    </ul>
  </li>
  <li><strong>Proof of Algebraic Laws:</strong> It provides geometric validation for complex set laws, including distributive laws and De Morgan\'s laws.</li>
</ul>`,
    explanation: 'Core 3-mark conceptual question from STA301 Midterm Fall 2012 (Q1) and Current Papers Spring 2022 (Q9).',
    urdu_answer: 'وین ڈایاگرام سیٹوں کی تصویری شکل ہے جس میں یونیورسل سیٹ کو مستطیل اور دیگر سیٹوں کو دائروں سے دکھایا جاتا ہے۔ یہ یونین، تقاطع، تفریق اور ڈی مورگن کے قوانین کو بصری طور پر سمجھنے اور ثابت کرنے میں بنیادی کردار ادا کرتی ہے۔'
  },
  {
    stem: 'Define Set, Subset, and Proper Subset with illustrative mathematical examples.',
    correct: `<p><strong>Definitions: Set, Subset, and Proper Subset (STA301 Handouts Lecture 16):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Concept</th>
      <th style="padding: 8px;">Formal Definition</th>
      <th style="padding: 8px;">Illustrative Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>1. Set</strong></td>
      <td style="padding: 8px;">A well-defined collection of distinct objects. Objects can be listed in roster form or specified via set-builder notation.</td>
      <td style="padding: 8px;">\\(A = \\{1, 2, 3, 4\\}\\)</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>2. Subset (\\(B \\subseteq A\\))</strong></td>
      <td style="padding: 8px;">A set \\(B\\) is a subset of \\(A\\) if every element of \\(B\\) is also an element of \\(A\\). (Note: \\(\\phi\\) is a subset of every set, and every set is a subset of itself).</td>
      <td style="padding: 8px;">If \\(A = \\{1, 2, 3\\}\\), then \\(B = \\{1, 2\\}\\) is a subset of \\(A\\).</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>3. Proper Subset (\\(B \\subset A\\))</strong></td>
      <td style="padding: 8px;">\\(B\\) is a proper subset of \\(A\\) if \\(B \\subseteq A\\) and \\(B \\ne A\\) (i.e., \\(A\\) contains at least one element not present in \\(B\\)).</td>
      <td style="padding: 8px;">\\(\\{1, 3\\} \\subset \\{1, 2, 3\\}\\) is a proper subset because \\(2 \\notin \\{1, 3\\}\\).</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Fundamental 3-mark conceptual question from STA301 Handouts Lecture 16 (Pages 132–133).',
    urdu_answer: 'سیٹ منفرد اشیاء کا مجموعہ ہے۔ سب سیٹ وہ ہے جس کے تمام ارکان دوسرے سیٹ میں موجود ہوں ($B \\subseteq A$)۔ پراپر سب سیٹ (Proper Subset) وہ ہے جس میں تمام ارکان موجود ہوں لیکن وہ اصل سیٹ کے برابر نہ ہو ($B \\ne A$)۔'
  },
  {
    stem: 'What is meant by Partition of a Set? State its two necessary mathematical conditions and give an example.',
    correct: `<p><strong>Partition of a Set (STA301 Handouts Lecture 16):</strong></p>

<h4>1. Definition:</h4>
<p>A <strong>partition</strong> of a universal set \\(S\\) is a decomposition of \\(S\\) into a collection of non-empty subsets \\(A_1, A_2, \\dots, A_k\\) (called cells or blocks).</p>

<h4>2. Necessary Mathematical Conditions:</h4>
<ol>
  <li><strong>Mutually Exclusive (Pairwise Disjoint):</strong> No two cells share any common elements:
    \\[A_i \\cap A_j = \\phi \\quad \\text{for all } i \\ne j\\]
  </li>
  <li><strong>Collectively Exhaustive:</strong> The union of all cells reconstitutes the entire original set \\(S\\):
    \\[A_1 \\cup A_2 \\cup \\dots \\cup A_k = S\\]
  </li>
  <li><strong>Non-Empty Cells:</strong> Each cell must contain at least one element:
    \\[A_i \\ne \\phi \\quad \\text{for all } i\\]
  </li>
</ol>

<h4>3. Example:</h4>
<p>For the set \\(S = \\{a, b, c, d, e\\}\\), the collection of subsets \\(A_1 = \\{a, b\\}\\) and \\(A_2 = \\{c, d, e\\}\\) forms a valid partition because \\(A_1 \\cap A_2 = \\phi\\) and \\(A_1 \\cup A_2 = S\\).</p>`,
    explanation: 'Standard 3-mark question from STA301 Quiz 1 and Handouts Page 135.',
    urdu_answer: 'سیٹ کی پارٹیشن سے مراد کسی سیٹ کو ایسے غیر خالی سب سیٹس میں تقسیم کرنا ہے جو باہم غیر مشترک ہوں ($A_i \\cap A_j = \\phi$) اور ان سب کا یونین مکمل سیٹ کے برابر ہو ($A_1 \\cup A_2 = S$)۔'
  },
  {
    stem: 'What do you understand by the term Power Set? State its general formula and determine the power set for $A = \\{H, T\\}$.',
    correct: `<p><strong>Power Set in Set Theory (STA301 Handouts Lecture 16):</strong></p>

<h4>1. Definition:</h4>
<p>The <strong>Power Set</strong> of any given set \\(A\\), denoted by \\(P(A)\\), is the comprehensive family or set containing <em>all possible subsets</em> of \\(A\\), including the empty set (\\(\\phi\\)) and the improper subset \\(A\\) itself.</p>

<h4>2. General Cardinality Formula:</h4>
\\[n(P(A)) = 2^n\\]
<p>Where \\(n\\) represents the number of elements in set \\(A\\).</p>

<h4>3. Example for \\(A = \\{H, T\\}\\):</h4>
<p>Here, \\(n = 2\\), so the total number of subsets is \\(2^2 = 4\\):</p>
\\[P(A) = \\mathbf{\\{\\phi, \\{H\\}, \\{T\\}, \\{H, T\\}\\}}\\]`,
    explanation: 'Core 3-mark question from STA301 Midterm Solved Papers and Handouts Page 135.',
    urdu_answer: 'کسی سیٹ کے تمام ممکنہ سب سیٹس کے سیٹ کو پاور سیٹ $P(A)$ کہتے ہیں۔ اس کے ارکان کی تعداد کا فارمولا $2^n$ ہے۔ سیٹ $\\{H, T\\}$ کا پاور سیٹ $\\{\\phi, \\{H\\}, \\{T\\}, \\{H, T\\}\\}$ ہے۔'
  }
];

// 3 Long Questions
const longs = [
  {
    stem: 'Given the universal set $S = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$ and subsets $A = \\{1, 2, 3, 4\\}$ and $B = \\{3, 4, 5, 6\\}$:\n1. Find $A \\cup B$ and $A \\cap B$.\n2. Find $A - B$, $\\bar{A}$ ($A^c$), and $\\bar{B}$ ($B^c$).\n3. State and prove De Morgan\'s Law: $\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}$.',
    correct: `<p><strong>Comprehensive Verification of Set Operations and De Morgan\'s Law (STA301 Handouts Lecture 16):</strong></p>

<h4>Part 1: Union and Intersection:</h4>
<ul>
  <li><strong>Union (\\(A \\cup B\\)):</strong>
    \\[A \\cup B = \\{1, 2, 3, 4\\} \\cup \\{3, 4, 5, 6\\} = \\mathbf{\\{1, 2, 3, 4, 5, 6\\}}\\]
  </li>
  <li><strong>Intersection (\\(A \\cap B\\)):</strong>
    \\[A \\cap B = \\{1, 2, 3, 4\\} \\cap \\{3, 4, 5, 6\\} = \\mathbf{\\{3, 4\\}}\\]
  </li>
</ul>

<h4>Part 2: Set Difference and Complements:</h4>
<ul>
  <li><strong>Difference (\\(A - B\\)):</strong>
    \\[A - B = \\{1, 2, 3, 4\\} - \\{3, 4, 5, 6\\} = \\mathbf{\\{1, 2\\}}\\]
  </li>
  <li><strong>Complement of \\(A\\) (\\(\\bar{A}\\)):</strong>
    \\[\\bar{A} = S - A = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\} - \\{1, 2, 3, 4\\} = \\mathbf{\\{5, 6, 7, 8, 9, 10\\}}\\]
  </li>
  <li><strong>Complement of \\(B\\) (\\(\\bar{B}\\)):</strong>
    \\[\\bar{B} = S - B = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\} - \\{3, 4, 5, 6\\} = \\mathbf{\\{1, 2, 7, 8, 9, 10\\}}\\]
  </li>
</ul>

<h4>Part 3: Proof of De Morgan\'s Law (\\(\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}\\)):</h4>
<ol>
  <li><strong>Left-Hand Side (LHS):</strong>
    \\[\\overline{A \\cup B} = S - (A \\cup B)\\]
    \\[= \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\} - \\{1, 2, 3, 4, 5, 6\\} = \\mathbf{\\{7, 8, 9, 10\\}}\\]
  </li>
  <li><strong>Right-Hand Side (RHS):</strong>
    \\[\\bar{A} \\cap \\bar{B} = \\{5, 6, 7, 8, 9, 10\\} \\cap \\{1, 2, 7, 8, 9, 10\\} = \\mathbf{\\{7, 8, 9, 10\\}}\\]
  </li>
</ol>
<p><strong>Conclusion:</strong> Since \\(\\text{LHS} = \\text{RHS} = \\{7, 8, 9, 10\\}\\), De Morgan\'s Law is rigorously proven.</p>`,
    explanation: 'High-frequency 5-mark subjective problem appearing in Moaaz Subjectives (Q26), Team Hadi files (Q25), and Handouts Pages 134–135.',
    urdu_answer: 'یونین $A \\cup B = \\{1, 2, 3, 4, 5, 6\\}$، انٹرسیکشن $A \\cap B = \\{3, 4\\}$، تفریق $A - B = \\{1, 2\\}$ ہے؛ اور ڈی مورگن کا قانون $\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B} = \\{7, 8, 9, 10\\}$ کامیابی سے ثابت ہو گیا۔'
  },
  {
    stem: 'Let universal set $S = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\}$, $A = \\{1, 2\\}$, and $B = \\{3, 4, 5, 6\\}$. Determine:\n1. Complement of $A$ ($\\bar{A}$)\n2. Complement of $B$ ($\\bar{B}$)\n3. Power set of $A$ ($P(A)$) and list all its subsets.',
    correct: `<p><strong>Complements and Power Set Calculations (STA301 Handouts Lecture 16):</strong></p>

<h4>1. Complement of \\(A\\) (\\(\\bar{A}\\)):</h4>
\\[\\bar{A} = S - A\\]
\\[\\bar{A} = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\} - \\{1, 2\\} = \\mathbf{\\{3, 4, 5, 6, 7, 8, 9\\}}\\]

<h4>2. Complement of \\(B\\) (\\(\\bar{B}\\)):</h4>
\\[\\bar{B} = S - B\\]
\\[\\bar{B} = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\} - \\{3, 4, 5, 6\\} = \\mathbf{\\{1, 2, 7, 8, 9\\}}\\]

<h4>3. Power Set of \\(A\\) (\\(P(A)\\)):</h4>
<p>Given \\(A = \\{1, 2\\}\\), the number of elements is \\(n = 2\\). Therefore, total subsets \\(= 2^2 = 4\\):</p>
<ol>
  <li>Empty set: \\(\\phi\\)</li>
  <li>Singletons: \\(\\{1\\}\\), \\(\\{2\\}\\)</li>
  <li>Set itself: \\(\\{1, 2\\}\\)</li>
</ol>
\\[P(A) = \\mathbf{\\{\\phi, \\{1\\}, \\{2\\}, \\{1, 2\\}\\}}\\]`,
    explanation: 'Core 5-mark calculation problem from STA301 Midterm Current Papers and Handouts Page 135.',
    urdu_answer: 'کمپلیمنٹ $\\bar{A} = \\{3, 4, 5, 6, 7, 8, 9\\}$، کمپلیمنٹ $\\bar{B} = \\{1, 2, 7, 8, 9\\}$ ہے؛ اور سیٹ $A$ کا پاور سیٹ $P(A) = \\{\\phi, \\{1\\}, \\{2\\}, \\{1, 2\\}\\}$ ہے۔'
  },
  {
    stem: 'If set $A = \\{H, T\\}$ and set $B = \\{1, 2, 3\\}$, construct the complete Cartesian product $A \\times B$. State its total number of ordered pairs and show that $A \\times B \\ne B \\times A$.',
    correct: `<p><strong>Cartesian Product Construction and Properties (STA301 Handouts Lecture 16):</strong></p>

<h4>1. Definition:</h4>
<p>The Cartesian product \\(A \\times B\\) is the set of all ordered pairs \\((a, b)\\) such that \\(a \\in A\\) and \\(b \\in B\\):</p>
\\[A \\times B = \\{(a, b) \\mid a \\in A \\text{ and } b \\in B\\}\\]

<h4>2. Construction of \\(A \\times B\\):</h4>
<p>Given \\(A = \\{H, T\\}\\) and \\(B = \\{1, 2, 3\\}\\):</p>
\\[A \\times B = \\mathbf{\\{(H, 1), (H, 2), (H, 3), (T, 1), (T, 2), (T, 3)\\}}\\]

<h4>3. Cardinality:</h4>
\\[n(A \\times B) = n(A) \\times n(B) = 2 \\times 3 = \\mathbf{6\\text{ ordered pairs}}\\]

<h4>4. Non-Commutative Property (\\(A \\times B \\ne B \\times A\\)):</h4>
<p>Construct \\(B \\times A\\):</p>
\\[B \\times A = \\{(1, H), (1, T), (2, H), (2, T), (3, H), (3, T)\\}\\]
<p>Since ordered pairs are order-sensitive, \\((H, 1) \\ne (1, H)\\). Hence, \\(A \\times B \\ne B \\times A\\), although \\(n(A \\times B) = n(B \\times A) = 6\\).</p>`,
    explanation: 'Comprehensive 5-mark subjective question on Cartesian products from STA301 Handouts Pages 135–136.',
    urdu_answer: 'کارٹیشین پراڈکٹ $A \\times B = \\{(H, 1), (H, 2), (H, 3), (T, 1), (T, 2), (T, 3)\\}$ ہے جس میں 6 جوڑے ہیں۔ چونکہ ترتیب اہم ہوتی ہے اس لیے $A \\times B \\ne B \\times A$ ہوتا ہے۔'
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
console.log(`Successfully inserted into STA301 Lecture 16:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for STA301 Lecture 16: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

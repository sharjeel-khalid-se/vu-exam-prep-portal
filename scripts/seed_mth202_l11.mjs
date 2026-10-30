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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(mth202.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Relations: Ordered Pairs, Cartesian Products, Binary Relations, Matrices & Directed Graphs')
  `).run(mth202.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`MTH202 Lecture 11 found with ID: ${lec11.id}`);
}

// 3. Clear existing questions for Lecture 11 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec11.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 11.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Cartesian product of two sets A and B is symbolically written as __________.',
    options: {
      a: '$A \\times B = \\{(a, b) \\mid a \\notin A \\text{ and } b \\in B\\}$',
      b: '$A \\times B = \\{(a, b) \\mid a \\in A \\text{ and } b \\notin B\\}$',
      c: '$A \\times B = \\{(a, b) \\mid a \\in A \\text{ and } b \\in B\\}$',
      d: '$A \\times B = \\{(a, b) \\mid a \\notin A \\text{ and } b \\notin B\\}$'
    },
    correct: 'c',
    explanation: 'The Cartesian product of sets $A$ and $B$, denoted $A \\times B$, is the set of all ordered pairs $(a, b)$ where the first component $a \\in A$ and the second component $b \\in B$ (MTH202 Handouts Page 73). Appeared 12+ times across Grand Quiz 2020 and Attiq Kundi.',
    urdu_answer: 'دو سیٹوں A اور B کا کارٹیشین پروڈکٹ ان تمام جوڑوں (a, b) کا مجموعہ ہے جہاں $a \\in A$ اور $b \\in B$ ہو۔'
  },
  {
    stem: 'Let A = {1, 2, 3, ..., 50} and B = {2, 4, 6, 8, 10}. Then the Cartesian product of A and B has __________ elements.',
    options: {
      a: '100',
      b: '250',
      c: '500',
      d: '50'
    },
    correct: 'b',
    explanation: 'The number of elements in $A \\times B$ is $|A| \\times |B|$. Here $|A| = 50$ and $|B| = 5$, so $|A \\times B| = 50 \\times 5 = 250$ ordered pairs (MTH202 Handouts Page 73). Appeared 15+ times in Attiq Kundi and Junaid papers.',
    urdu_answer: 'کارٹیشین پروڈکٹ کے ارکان کی کل تعداد $50 \\times 5 = 250$ ہوگی۔'
  },
  {
    stem: 'Let A = {1, 2, 3} and B = {2, 4}, then the number of binary relations from A to B are __________.',
    options: {
      a: '6',
      b: '12',
      c: '64',
      d: '32'
    },
    correct: 'c',
    explanation: 'A binary relation is any subset of $A \\times B$. Since $|A \\times B| = 3 \\times 2 = 6$, the total number of binary relations is $2^{|A \\times B|} = 2^6 = 64$ (MTH202 Handouts Page 74). Appeared 10+ times in Attiq Kundi and Grand Quiz 2020.',
    urdu_answer: 'چونکہ $A \\times B$ میں 6 ارکان ہیں، اس لیے ممکنہ بائنری ریلیشنز کی کل تعداد $2^6 = 64$ ہوگی۔'
  },
  {
    stem: 'A binary relation R from set A to set B is a __________.',
    options: {
      a: 'Union of A and B',
      b: 'Subset of A × B',
      c: 'Universal set of A × B',
      d: 'Function from A to B'
    },
    correct: 'b',
    explanation: 'By mathematical definition, a binary relation $R$ from a set $A$ to a set $B$ is any subset of the Cartesian product $A \\times B$: $R \\subseteq A \\times B$ (MTH202 Handouts Page 74). Appeared 12+ times.',
    urdu_answer: 'سیٹ A سے سیٹ B پر کوئی بھی بائنری ریلیشن دراصل $A \\times B$ کا ایک سب سیٹ ہوتا ہے۔'
  },
  {
    stem: 'The domain of a relation R from A to B is symbolically written as __________.',
    options: {
      a: '$\\text{Dom}(R) = \\{a \\in A \\mid (a, b) \\in R\\}$',
      b: '$\\text{Dom}(R) = \\{b \\in B \\mid (a, b) \\in R\\}$',
      c: '$\\text{Dom}(R) = \\{a \\in A \\mid (a, b) \\notin R\\}$',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'The domain of a relation $R$, denoted $\\text{Dom}(R)$, is the set of all first coordinates of the ordered pairs that belong to $R$: $\\text{Dom}(R) = \\{a \\in A \\mid (a, b) \\in R\\}$ (MTH202 Handouts Page 74). Appeared 8+ times.',
    urdu_answer: 'ریلیشن کی ڈومین ان تمام پہلے اجزاء (First components) کا سیٹ ہوتی ہے جو ریلیشن کے جوڑوں میں موجود ہوں۔'
  },
  {
    stem: 'The range of a relation R from A to B is symbolically written as __________.',
    options: {
      a: '$\\text{Ran}(R) = \\{a \\in A \\mid (a, b) \\in R\\}$',
      b: '$\\text{Ran}(R) = \\{b \\in B \\mid (a, b) \\in R\\}$',
      c: '$\\text{Ran}(R) = \\{b \\in B \\mid (a, b) \\notin R\\}$',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'The range of a relation $R$, denoted $\\text{Ran}(R)$, is the set of all second coordinates of the ordered pairs belonging to $R$: $\\text{Ran}(R) = \\{b \\in B \\mid (a, b) \\in R\\}$ (MTH202 Handouts Page 74). Appeared 8+ times.',
    urdu_answer: 'ریلیشن کی رینج ان تمام دوسرے اجزاء (Second components) کا سیٹ ہوتی ہے جو ریلیشن کے جوڑوں میں شامل ہوں۔'
  },
  {
    stem: 'Let A be a set with m elements and B be a set with n elements, then the number of elements in A × B are __________.',
    options: {
      a: '$2^{mn}$',
      b: '$m + n$',
      c: '$m \\cdot n$',
      d: '$n^m$'
    },
    correct: 'c',
    explanation: 'By the multiplication principle of combinatorics, if $|A| = m$ and $|B| = n$, then the Cartesian product has $|A \\times B| = m \\cdot n$ ordered pairs (MTH202 Handouts Page 73). Appeared 10+ times in Moaaz and Grand Quiz.',
    urdu_answer: 'کارٹیشین پروڈکٹ کے ارکان کی تعداد دونوں سیٹوں کے ارکان کا حاصل ضرب یعنی $m \\cdot n$ ہوتی ہے۔'
  },
  {
    stem: 'For non-empty and unequal sets A and B, A × B = B × A.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'Cartesian product is non-commutative. Since ordered pairs are sensitive to component order ($(a, b) \\neq (b, a)$ when $a \\neq b$), $A \\times B \\neq B \\times A$ for distinct non-empty sets (MTH202 Handouts Page 74).',
    urdu_answer: 'یہ بیان غلط (False) ہے کیونکہ کارٹیشین پروڈکٹ میں ترتیب اہم ہوتی ہے اور $A \\times B \\neq B \\times A$ ہوتا ہے۔'
  },
  {
    stem: 'For any set A, A × ∅ = __________.',
    options: {
      a: '$A$',
      b: '$\\emptyset$',
      c: '$\\{0\\}$',
      d: '$\\{\\emptyset\\}$'
    },
    correct: 'b',
    explanation: 'Since the empty set $\\emptyset$ has no elements to serve as the second component of an ordered pair, no ordered pair can be formed. Therefore, $A \\times \\emptyset = \\emptyset$ for any set $A$ (MTH202 Handouts Page 74).',
    urdu_answer: 'کسی بھی سیٹ کا خالی سیٹ کے ساتھ کارٹیشین پروڈکٹ ہمیشہ خالی سیٹ ($\\emptyset$) ہوتا ہے۔'
  },
  {
    stem: 'Which of the following is NOT a standard representation of a relation?',
    options: {
      a: 'Matrix',
      b: 'Directed graph',
      c: 'Arrow diagram',
      d: 'Venn diagram'
    },
    correct: 'd',
    explanation: 'Standard graphical/tabular representations of a binary relation include: (1) Arrow diagrams, (2) Directed graphs (digraphs), (3) Matrices (Boolean connection matrix), and (4) Coordinate diagrams. Venn diagrams represent set memberships/operations, not individual binary relations (MTH202 Handouts Page 76–77). Appeared in Attiq Kundi papers.',
    urdu_answer: 'وین ڈایاگرام سیٹ آپریشنز کے لیے ہوتا ہے، ریلیشنز کو ظاہر کرنے کے لیے میٹرکس، ایرو ڈایاگرام یا ڈائریکٹڈ گراف استعمال ہوتے ہیں۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What is an Ordered Pair? State the mathematical condition under which two ordered pairs are equal.',
    correct: `<p><strong>Ordered Pair (MTH202 Handouts Page 73):</strong></p>
<p>An <strong>ordered pair</strong> consists of two elements written in a specific order enclosed within parentheses: $(a, b)$.</p>
<ul>
  <li>$a$ is called the <strong>first component</strong> (or coordinate).</li>
  <li>$b$ is called the <strong>second component</strong> (or coordinate).</li>
  <li>Order is significant: $(a, b) \\neq (b, a)$ unless $a = b$.</li>
</ul>
<p><strong>Equality of Ordered Pairs:</strong></p>
<p>Two ordered pairs $(a, b)$ and $(c, d)$ are mathematically equal if and only if their corresponding components are identical:</p>
$$(a, b) = (c, d) \\iff a = c \\quad \\text{and} \\quad b = d$$`,
    explanation: 'Fundamental concept of ordered pairs from MTH202 Handouts Page 73.',
    urdu_answer: 'ایک آرڈرڈ پیئر $(a, b)$ میں ترتیب اہم ہوتی ہے۔ دو جوڑے $(a, b)$ اور $(c, d)$ صرف تب برابر ہوتے ہیں جب پہلا پہلے کے اور دوسرا دوسرے کے برابر ہو یعنی $a = c$ اور $b = d$۔'
  },
  {
    stem: 'Define the Cartesian Product of Two Sets with Symbolic Set-Builder Notation.',
    correct: `<p><strong>Cartesian Product (MTH202 Handouts Page 73):</strong></p>
<p>Let $A$ and $B$ be two sets. The <strong>Cartesian product</strong> of $A$ and $B$, denoted by $A \\times B$ (read as <em>"A cross B"</em>), is the set of all ordered pairs $(a, b)$ where $a$ belongs to $A$ and $b$ belongs to $B$.</p>
<p><strong>Symbolic Definition:</strong></p>
$$A \\times B = \\{ (a, b) \\mid a \\in A \\text{ and } b \\in B \\}$$
<p><strong>Cardinality Rule:</strong> If $|A| = m$ and $|B| = n$, then $|A \\times B| = m \\cdot n$.</p>`,
    explanation: 'Standard definition from MTH202 Handouts Page 73 and Grand Quiz 2020.',
    urdu_answer: 'سیٹ A اور B کا کارٹیشین پروڈکٹ ان تمام جوڑوں کا سیٹ ہے جس کا پہلا رکن A سے اور دوسرا B سے ہو: $A \\times B = \\{ (a, b) \\mid a \\in A \\wedge b \\in B \\}$۔'
  },
  {
    stem: 'Define Binary Relation, Domain, and Range with their formal notations.',
    correct: `<p><strong>Binary Relation, Domain &amp; Range (MTH202 Handouts Page 74):</strong></p>
<ol>
  <li><strong>Binary Relation:</strong><br>
    Let $A$ and $B$ be sets. A binary relation $R$ from $A$ to $B$ is defined as any subset of the Cartesian product $A \\times B$:
    $$R \\subseteq A \\times B$$
    If $(a, b) \\in R$, we write $a R b$ ($a$ is related to $b$ by $R$).
  </li>
  <li><strong>Domain of $R$:</strong><br>
    The set of all first components of the ordered pairs that belong to $R$:
    $$\\text{Dom}(R) = \\{ a \\in A \\mid (a, b) \\in R \\}$$
  </li>
  <li><strong>Range of $R$:</strong><br>
    The set of all second components of the ordered pairs that belong to $R$:
    $$\\text{Ran}(R) = \\{ b \\in B \\mid (a, b) \\in R \\}$$
  </li>
</ol>`,
    explanation: 'Core binary relation definitions from MTH202 Handouts Page 74 and Subjective Papers Page 4.',
    urdu_answer: 'بائنری ریلیشن $A \\times B$ کا کوئی بھی سب سیٹ ہوتا ہے۔ تمام پہلے ارکان کا سیٹ ڈومین اور تمام دوسرے ارکان کا سیٹ رینج کہلاتا ہے۔'
  },
  {
    stem: 'Explain the Matrix Representation of a Relation.',
    correct: `<p><strong>Matrix Representation of a Relation (MTH202 Handouts Page 77):</strong></p>
<p>Let $A = \\{a_1, a_2, \\dots, a_n\\}$ and $B = \\{b_1, b_2, \\dots, b_m\\}$ be finite sets. A binary relation $R$ from $A$ to $B$ can be represented by an $n \\times m$ binary (0-1) matrix $M_R = [m_{ij}]$, where:</p>
$$m_{ij} = \\begin{cases} 
1 & \\text{if } (a_i, b_j) \\in R \\\\ 
0 & \\text{if } (a_i, b_j) \\notin R 
\\end{cases}$$
<ul>
  <li>The rows of $M_R$ correspond to the elements of set $A$.</li>
  <li>The columns of $M_R$ correspond to the elements of set $B$.</li>
  <li>A value of $1$ at row $i$ and column $j$ indicates that $a_i$ is related to $b_j$; otherwise, $0$ indicates absence of relation.</li>
</ul>`,
    explanation: 'Matrix model representation of relations from MTH202 Handouts Page 77.',
    urdu_answer: 'میٹرکس میں قطاریں سیٹ A کے اور کالمز سیٹ B کے ارکان کو ظاہر کرتے ہیں۔ اگر جوڑا ریلیشن میں موجود ہو تو 1 لکھا جاتا ہے، ورنہ 0۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: 'Given sets A = {1, 2} and B = {a, b, c}:\n1) Find A × B\n2) Find B × A\n3) Is A × B = B × A? Explain why or why not with concrete examples.',
    correct: `<p><strong>Cartesian Product Computation and Non-Commutativity (MTH202 Handouts Page 73–74):</strong></p>
<p>Given sets: $A = \\{1, 2\\}$ ($|A| = 2$) and $B = \\{a, b, c\\}$ ($|B| = 3$).</p>

<h4>1. Compute $A \\times B$:</h4>
<p>Pair each element of $A$ with every element of $B$:</p>
$$A \\times B = \\{ (1, a), (1, b), (1, c), (2, a), (2, b), (2, c) \\}$$
<p>Total elements: $2 \\times 3 = 6$ ordered pairs.</p>

<h4>2. Compute $B \\times A$:</h4>
<p>Pair each element of $B$ with every element of $A$:</p>
$$B \\times A = \\{ (a, 1), (a, 2), (b, 1), (b, 2), (c, 1), (c, 2) \\}$$
<p>Total elements: $3 \\times 2 = 6$ ordered pairs.</p>

<h4>3. Comparison: Is $A \\times B = B \\times A$?</h4>
<ul>
  <li><strong>Answer:</strong> <strong>NO</strong>, $A \\times B \\neq B \\times A$.</li>
  <li><strong>Justification:</strong> By the equality condition of ordered pairs, $(x, y) = (u, v)$ if and only if $x = u$ and $y = v$.</li>
  <li>For example, $(1, a) \\in A \\times B$, but $(1, a) \\notin B \\times A$ because $(1, a) \\neq (a, 1)$ since $1 \\neq a$.</li>
  <li>Hence, the Cartesian product is <strong>non-commutative</strong> unless $A = B$ or one of the sets is empty.</li>
</ul>`,
    explanation: '5-mark subjective question from Adil Alvi Jun 2, 2013 paper and MTH202 Handouts Page 73–74.',
    urdu_answer: '$A \\times B$ اور $B \\times A$ کے ارکان کی تعداد تو 6 ہے مگر جوڑے الٹ ہیں جیسے $(1, a) \\neq (a, 1)$، اس لیے $A \\times B \\neq B \\times A$ ہے۔'
  },
  {
    stem: 'Given A = {1, 2, 3, 4} and B = {x, y, z}. Let R be the relation from A to B defined as R = {(1, y), (1, z), (3, y), (4, x), (4, z)}. Determine the matrix representation of R.',
    correct: `<p><strong>Constructing the 0-1 Matrix Representation $M_R$:</strong></p>
<p>Given sets:</p>
<ul>
  <li>$A = \\{1, 2, 3, 4\\} \\implies 4 \\text{ rows}$ (ordered as row 1 = 1, row 2 = 2, row 3 = 3, row 4 = 4)</li>
  <li>$B = \\{x, y, z\\} \\implies 3 \\text{ columns}$ (ordered as col 1 = $x$, col 2 = $y$, col 3 = $z$)</li>
  <li>Relation: $R = \\{ (1, y), (1, z), (3, y), (4, x), (4, z) \\}$</li>
</ul>

<h4>Matrix Setup:</h4>
<table class="border border-slate-300 w-full text-xs text-center mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border"></th>
      <th class="p-2 border font-bold">$x$ (col 1)</th>
      <th class="p-2 border font-bold">$y$ (col 2)</th>
      <th class="p-2 border font-bold">$z$ (col 3)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold bg-slate-50">1 (row 1)</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold bg-slate-50">2 (row 2)</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold bg-slate-50">3 (row 3)</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">0</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold bg-slate-50">4 (row 4)</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
  </tbody>
</table>

<p><strong>Resulting Matrix:</strong></p>
$$M_R = \\begin{bmatrix}
0 & 1 & 1 \\\\
0 & 0 & 0 \\\\
0 & 1 & 0 \\\\
1 & 0 & 1
\\end{bmatrix}$$`,
    explanation: 'Standard matrix transformation question from MTH202 Handouts Page 77 and Fall 2009 / Spring 2012 Q22.',
    urdu_answer: 'ریلیشن کے موجود جوڑوں کے خانے میں 1 اور باقی تمام خانوں میں 0 رکھ کر 4 قطاروں اور 3 کالموں والا میٹرکس تیار کیا جاتا ہے۔'
  },
  {
    stem: 'Let A = {1, 2, 3} and B = {x, y}. Suppose a relation R from A to B is represented by the matrix:\nM = [[0, 1], [1, 1], [1, 0]]\n(a) List the set of ordered pairs in R.\n(b) Find the domain and range of R.\n(c) Describe the arrow diagram of R.',
    correct: `<p><strong>Decoding Relation from Matrix:</strong></p>
<p>Given $A = \\{1, 2, 3\\}$, $B = \\{x, y\\}$, and matrix:</p>
$$M = \\begin{bmatrix}
0 & 1 \\\\
1 & 1 \\\\
1 & 0
\\end{bmatrix}$$

<h4>(a) Set of Ordered Pairs in $R$:</h4>
<ul>
  <li>Row 1 (element 1): Column 2 is 1 $\\implies (1, y) \\in R$.</li>
  <li>Row 2 (element 2): Column 1 is 1, Column 2 is 1 $\\implies (2, x) \\in R, (2, y) \\in R$.</li>
  <li>Row 3 (element 3): Column 1 is 1 $\\implies (3, x) \\in R$.</li>
</ul>
$$\\mathbf{R = \\{ (1, y), (2, x), (2, y), (3, x) \\}}$$

<h4>(b) Domain and Range:</h4>
<ul>
  <li><strong>Domain:</strong> First components $\\text{Dom}(R) = \\{1, 2, 3\\} = A$.</li>
  <li><strong>Range:</strong> Second components $\\text{Ran}(R) = \\{x, y\\} = B$.</li>
</ul>

<h4>(c) Arrow Diagram Description:</h4>
<p>Draw two parallel vertical columns or ovals: Set $A = \\{1, 2, 3\\}$ on the left, and Set $B = \\{x, y\\}$ on the right.</p>
<ul>
  <li>Draw a directed arrow from $1$ pointing to $y$.</li>
  <li>Draw two directed arrows from $2$, one pointing to $x$ and one pointing to $y$.</li>
  <li>Draw a directed arrow from $3$ pointing to $x$.</li>
</ul>`,
    explanation: 'Multi-part problem from MTH202 Handouts Page 77 and Adil Alvi past subjective papers.',
    urdu_answer: 'میٹرکس میں 1 والی پوزیشنز سے جوڑے نکالیں: $R = \\{(1, y), (2, x), (2, y), (3, x)\\}$، ڈومین پورا A اور رینج پورا B ہے، اور ایرو ڈایاگرام میں ان پر تیر کے نشان لگائے جاتے ہیں۔'
  },
  {
    stem: 'Problem: Find x and y given the equality of ordered pairs: (2x, x + y) = (6, 2). Show complete step-by-step calculation.',
    correct: `<p><strong>Solving Equations from Equal Ordered Pairs:</strong></p>
<p>Given:</p>
$$(2x, x + y) = (6, 2)$$

<h4>Step 1: Equate First Components</h4>
$$2x = 6 \\implies x = \\frac{6}{2} = \\mathbf{3}$$

<h4>Step 2: Equate Second Components</h4>
$$x + y = 2$$
<p>Substitute $x = 3$ into the equation:</p>
$$3 + y = 2 \\implies y = 2 - 3 = \\mathbf{-1}$$

<h4>Step 3: Verification</h4>
$$(2(3), 3 + (-1)) = (6, 2)$$
<p>Both coordinates match the given pair.</p>
<p><strong>Final Answer:</strong> $\\mathbf{x = 3, \\quad y = -1}$ (MTH202 Handouts Page 73).</p>`,
    explanation: 'Ordered pair algebra problem from MTH202 Handouts Page 73.',
    urdu_answer: 'پہلے حصے $2x = 6$ سے $x = 3$ نکلے گا۔ دوسرے حصے $x + y = 2$ میں قیمت رکھنے سے $3 + y = 2$ یعنی $y = -1$ حاصل ہوگا۔'
  },
  {
    stem: 'Problem: Let A = {2, 3, 4} and B = {2, 6, 8}. Let R be the "divides" relation from A to B (i.e., a R b ⟺ a | b). State explicitly all ordered pairs in R, along with its domain and range.',
    correct: `<p><strong>Enumerating the "Divides" Relation ($a \\mid b$):</strong></p>
<p>Given $A = \\{2, 3, 4\\}$ and $B = \\{2, 6, 8\\}$. The relation condition is $a \\mid b$ ($a$ divides $b$ with zero remainder).</p>

<h4>Testing Each Element of $A$ against $B$:</h4>
<ul>
  <li>For $a = 2$:
    <ul>
      <li>$2 \\mid 2$ (since $2/2 = 1$) $\\implies (2, 2) \\in R$</li>
      <li>$2 \\mid 6$ (since $6/2 = 3$) $\\implies (2, 6) \\in R$</li>
      <li>$2 \\mid 8$ (since $8/2 = 4$) $\\implies (2, 8) \\in R$</li>
    </ul>
  </li>
  <li>For $a = 3$:
    <ul>
      <li>$3 \\nmid 2$</li>
      <li>$3 \\mid 6$ (since $6/3 = 2$) $\\implies (3, 6) \\in R$</li>
      <li>$3 \\nmid 8$</li>
    </ul>
  </li>
  <li>For $a = 4$:
    <ul>
      <li>$4 \\nmid 2$</li>
      <li>$4 \\nmid 6$</li>
      <li>$4 \\mid 8$ (since $8/4 = 2$) $\\implies (4, 8) \\in R$</li>
    </ul>
  </li>
</ul>

<h4>Results:</h4>
<ol>
  <li><strong>Explicit Relation:</strong>
    $$\\mathbf{R = \\{ (2, 2), (2, 6), (2, 8), (3, 6), (4, 8) \\}}$$
  </li>
  <li><strong>Domain:</strong> $\\text{Dom}(R) = \\{2, 3, 4\\} = A$</li>
  <li><strong>Range:</strong> $\\text{Ran}(R) = \\{2, 6, 8\\} = B$</li>
</ol>`,
    explanation: 'High-frequency past exam problem from Attiq Kundi and Junaid papers.',
    urdu_answer: 'تقسیم کے اصول ($a \\mid b$) کے تحت: 2 سے 2, 6, 8، 3 سے 6، اور 4 سے 8 تقسیم ہوتا ہے۔ جوڑے: $R = \\{(2, 2), (2, 6), (2, 8), (3, 6), (4, 8)\\}$۔'
  },
  {
    stem: 'Problem: Let A = {2, 4} and B = {6, 8, 10}. Define relations R and S from A to B as:\nx R y ⟺ x | y\nx S y ⟺ y - 4 = x\nState explicitly the ordered pairs in A × B, R, S, R ∪ S, and R ∩ S.',
    correct: `<p><strong>Operations on Binary Relations:</strong></p>
<p>Given $A = \\{2, 4\\}$ and $B = \\{6, 8, 10\\}$.</p>

<h4>1. Cartesian Product $A \\times B$:</h4>
$$A \\times B = \\{ (2, 6), (2, 8), (2, 10), (4, 6), (4, 8), (4, 10) \\}$$

<h4>2. Relation $R$ ($x \\mid y$):</h4>
<ul>
  <li>$2 \\mid 6, \\quad 2 \\mid 8, \\quad 2 \\mid 10$</li>
  <li>$4 \\nmid 6, \\quad 4 \\mid 8, \\quad 4 \\nmid 10$</li>
</ul>
$$R = \\{ (2, 6), (2, 8), (2, 10), (4, 8) \\}$$

<h4>3. Relation $S$ ($y - 4 = x \\iff y = x + 4$):</h4>
<ul>
  <li>For $x = 2 \\implies y = 2 + 4 = 6 \\in B \\implies (2, 6) \\in S$</li>
  <li>For $x = 4 \\implies y = 4 + 4 = 8 \\in B \\implies (4, 8) \\in S$</li>
</ul>
$$S = \\{ (2, 6), (4, 8) \\}$$

<h4>4. Union ($R \\cup S$):</h4>
$$R \\cup S = \\{ (2, 6), (2, 8), (2, 10), (4, 8) \\} = R$$

<h4>5. Intersection ($R \\cap S$):</h4>
$$R \\cap S = \\{ (2, 6), (4, 8) \\} = S$$`,
    explanation: 'Comprehensive relation operations question from MTH202 Handouts Page 75.',
    urdu_answer: '$A \\times B$ میں 6 جوڑے ہیں، ریلیشن R میں 4 جوڑے، ریلیشن S میں 2 جوڑے، اور چونکہ $S \\subseteq R$ ہے اس لیے $R \\cup S = R$ اور $R \\cap S = S$ نکلے گا۔'
  },
  {
    stem: 'Problem: Suppose A = {1} and B = {u, v}. Find the power set of A × B, i.e., P(A × B).',
    correct: `<p><strong>Finding the Power Set of Cartesian Product $P(A \\times B)$:</strong></p>
<ol>
  <li><strong>Find $A \\times B$:</strong>
    $$A \\times B = \\{ (1, u), (1, v) \\}$$
  </li>
  <li><strong>Count Elements:</strong>
    $$|A \\times B| = 2 \\text{ elements}$$
  </li>
  <li><strong>Number of Subsets in Power Set:</strong>
    $$|P(A \\times B)| = 2^2 = 4 \\text{ subsets}$$
  </li>
  <li><strong>List All Subsets:</strong>
    <ul>
      <li>Subset with 0 elements: $\\emptyset$</li>
      <li>Subsets with 1 element: $\\{ (1, u) \\}, \\quad \\{ (1, v) \\}$</li>
      <li>Subset with 2 elements: $\\{ (1, u), (1, v) \\}$</li>
    </ul>
  </li>
  <li><strong>Final Power Set:</strong>
    $$\\mathbf{P(A \\times B) = \\{ \\emptyset, \\{ (1, u) \\}, \\{ (1, v) \\}, \\{ (1, u), (1, v) \\} \\}}$$
  </li>
</ol>`,
    explanation: 'Power set of Cartesian product problem from Sadia Solved Subjective Papers (3 Marks).',
    urdu_answer: '$A \\times B = \\{(1, u), (1, v)\\}$ میں 2 ارکان ہیں، لہٰذا پاور سیٹ میں $2^2 = 4$ ارکان بنیں گے جن میں خالی سیٹ، انفرادی جوڑے اور پورا سیٹ شامل ہے۔'
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
    insMcq.run(lec11.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec11.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec11.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 11:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Problem Proofs: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 11: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

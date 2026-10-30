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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(mth202.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Matrices, Complementary Relations, Inverse Relations & Composition')
  `).run(mth202.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`MTH202 Lecture 13 found with ID: ${lec13.id}`);
}

// 3. Clear existing questions for Lecture 13 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec13.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 13.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'In the matrix representation of a reflexive relation, all the entries in the main diagonal are __________.',
    options: {
      a: '0',
      b: '1',
      c: '2',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'A relation R on set A is reflexive if and only if $(a, a) \\in R$ for every $a \\in A$. Therefore, in its Boolean relation matrix $M_R$, every diagonal element $m_{ii}$ must be 1 (MTH202 Handouts Page 90). Appeared 15+ times across Junaid, Attiq Kundi, and All in One.',
    urdu_answer: 'ریفلیکسو ریلیشن کے میٹرکس میں مین ڈائیگنل (وتر) کے تمام ارکان لازماً 1 ہوتے ہیں۔'
  },
  {
    stem: 'In the matrix representation of an irreflexive relation, all the entries in the main diagonal are __________.',
    options: {
      a: '1',
      b: '0',
      c: '-1',
      d: '2'
    },
    correct: 'b',
    explanation: 'A relation R is irreflexive if no element is related to itself: $\\forall a \\in A, (a, a) \\notin R$. Hence, all main diagonal entries in $M_R$ are strictly 0 (MTH202 Handouts Page 91). Appeared 15+ times in All in One and Attiq Kundi.',
    urdu_answer: 'ار-ریفلیکسو (Irreflexive) ریلیشن کے میٹرکس کے مین ڈائیگنل کے تمام ارکان 0 ہوتے ہیں۔'
  },
  {
    stem: 'Which of the following is always true for the matrix representation of a symmetric relation?',
    options: {
      a: 'Matrix is equal to its transpose ($M = M^t$)',
      b: 'Diagonal entries are all 0',
      c: 'Diagonal entries are all 1',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'In a symmetric relation, $(a_i, a_j) \\in R \\iff (a_j, a_i) \\in R$, which implies $m_{ij} = m_{ji}$ for all $i, j$. Therefore, the matrix is symmetric, meaning it equals its transpose: $M = M^t$ (MTH202 Handouts Page 90). Appeared 12+ times.',
    urdu_answer: 'سیمیٹرک ریلیشن کا میٹرکس ہمیشہ اپنے ٹرانسپوز کے برابر ہوتا ہے یعنی $M = M^t$۔'
  },
  {
    stem: 'The complementary relation R̄ of a relation R from A to B is symbolically written as __________.',
    options: {
      a: '$\\bar{R} = A \\times B - R = \\{(a, b) \\in A \\times B \\mid (a, b) \\notin R\\}$',
      b: '$\\bar{R} = R - A \\times B$',
      c: '$\\bar{R} = R^{-1}$',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'The complementary relation $\\bar{R}$ consists of all ordered pairs in the Cartesian product $A \\times B$ that do NOT belong to $R$: $\\bar{R} = A \\times B - R$ (MTH202 Handouts Page 97). Appeared 10+ times in Junaid and Attiq Kundi.',
    urdu_answer: 'کمپلیمنٹری ریلیشن $\\bar{R}$ ان تمام جوڑوں کا سیٹ ہوتا ہے جو $A \\times B$ میں ہوں مگر ریلیشن R میں شامل نہ ہوں۔'
  },
  {
    stem: 'The inverse relation R⁻¹ from B to A is defined as __________.',
    options: {
      a: '$R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\in R\\}$',
      b: '$R^{-1} = \\{(a, b) \\in A \\times B \\mid (a, b) \\in R\\}$',
      c: '$R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\notin R\\}$',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'The inverse relation $R^{-1}$ is obtained by reversing the order of every ordered pair in $R$: $R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\in R\\}$ (MTH202 Handouts Page 97). Appeared 12+ times.',
    urdu_answer: 'انویرس ریلیشن $R^{-1}$ میں جوڑوں کے ارکان کی پوزیشن بدل دی جاتی ہے یعنی $(a, b)$ بن جاتا ہے $(b, a)$۔'
  },
  {
    stem: 'The matrix representation of inverse relation R⁻¹ is obtained by taking the __________ of the matrix representing R.',
    options: {
      a: 'Transpose ($M^t$)',
      b: 'Determinant',
      c: 'Inverse',
      d: 'Adjoint'
    },
    correct: 'a',
    explanation: 'Since the inverse relation swaps row and column indices ($m_{ij}^{-1} = m_{ji}$), the matrix for $R^{-1}$ is the transpose of the matrix for $R$: $M_{R^{-1}} = M_R^t$ (MTH202 Handouts Page 97). Appeared 10+ times in Handouts and All in One.',
    urdu_answer: 'انویرس ریلیشن کا میٹرکس اصل میٹرکس کا ٹرانسپوز ($M^t$) لینے سے حاصل ہوتا ہے۔'
  },
  {
    stem: 'Let R be a relation on a set A. If R is reflexive, then its complementary relation R̄ is __________.',
    options: {
      a: 'Reflexive',
      b: 'Irreflexive',
      c: 'Symmetric',
      d: 'Transitive'
    },
    correct: 'b',
    explanation: 'If $R$ is reflexive, then $\\forall a \\in A, (a, a) \\in R$. By complement definition, $(a, a) \\notin \\bar{R}$ for all $a \\in A$. Having no element related to itself makes $\\bar{R}$ strictly irreflexive (MTH202 Handouts Page 97). Appeared 8+ times in Team Hadi and Attiq Kundi.',
    urdu_answer: 'اگر کوئی ریلیشن ریفلیکسو ہو تو اس کا کمپلیمنٹری ریلیشن لازماً ار-ریفلیکسو (Irreflexive) ہوتا ہے۔'
  },
  {
    stem: 'The ordered pairs which are not present in a relation R must be present in the __________.',
    options: {
      a: 'Inverse of that relation',
      b: 'Composition of relations',
      c: 'Complementary relation of that relation',
      d: 'Universal relation'
    },
    correct: 'c',
    explanation: 'By set complement definition, any ordered pair $(a, b) \\in A \\times B$ that does not belong to $R$ must belong to its complementary relation $\\bar{R} = A \\times B - R$ (MTH202 Handouts Page 97). Appeared in Team Hadi and All in One.',
    urdu_answer: 'جو جوڑے ریلیشن R میں موجود نہ ہوں وہ لازمی طور پر اس کے کمپلیمنٹری ریلیشن میں موجود ہوتے ہیں۔'
  },
  {
    stem: 'In Boolean addition, 1 + 1 = __________.',
    options: {
      a: '2',
      b: '1',
      c: '0',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'Boolean addition corresponds to logical disjunction (OR operation): $1 + 1 = 1 \\vee 1 = 1$ (MTH202 Handouts Page 99). Appeared 10+ times in All in One.',
    urdu_answer: 'بولین جمع (Boolean addition) میں $1 + 1 = 1$ ہوتا ہے کیونکہ یہ منطقی OR آپریشن ہے۔'
  },
  {
    stem: 'Inverse of a relation can be obtained by __________.',
    options: {
      a: 'Changing signs of elements in ordered pairs',
      b: 'Changing position of elements in ordered pairs',
      c: 'Taking multiplicative inverse of elements',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'The inverse of a relation is formed simply by reversing (swapping) the positions of the coordinates in each ordered pair from $(x, y)$ to $(y, x)$ (MTH202 Handouts Page 97). Appeared 6+ times in Team Hadi.',
    urdu_answer: 'ریلیشن کا انویرس حاصل کرنے کے لیے جوڑے کے ارکان کی جگہ تبدیل کی جاتی ہے یعنی $(a, b)$ کو $(b, a)$ بنایا جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Complementary Relation with Symbolic Notation.',
    correct: `<p><strong>Complementary Relation (MTH202 Handouts Page 97):</strong></p>
<p>Let $R$ be a binary relation from set $A$ to set $B$. The <strong>complementary relation</strong> of $R$, denoted $\\bar{R}$, is defined as the set of all ordered pairs in the Cartesian product $A \\times B$ that do not belong to $R$.</p>
<p><strong>Formal Symbolic Definition:</strong></p>
$$\\bar{R} = A \\times B - R = \\{ (a, b) \\in A \\times B \\mid (a, b) \\notin R \\}$$
<p>If $a$ is related to $b$ in $R$ ($a R b$), then $a$ is NOT related to $b$ in $\\bar{R}$ ($a \\cancel{R} b$), and vice-versa.</p>`,
    explanation: 'Fundamental definition from MTH202 Handouts Page 97 and Attiq Kundi papers.',
    urdu_answer: 'کمپلیمنٹری ریلیشن $\\bar{R}$ ان تمام جوڑوں کا سیٹ ہے جو $A \\times B$ میں موجود ہوں مگر R کا حصہ نہ ہوں: $\\bar{R} = A \\times B - R$۔'
  },
  {
    stem: 'Define Inverse Relation and How to Obtain its Matrix Representation.',
    correct: `<p><strong>Inverse Relation and Its Matrix Representation (MTH202 Handouts Page 97):</strong></p>
<ol>
  <li><strong>Inverse Relation ($R^{-1}$):</strong><br>
    Let $R$ be a relation from set $A$ to set $B$. The inverse relation $R^{-1}$ from $B$ to $A$ is defined by reversing the order of elements in every pair belonging to $R$:
    $$R^{-1} = \\{ (b, a) \\in B \\times A \\mid (a, b) \\in R \\}$$
  </li>
  <li><strong>Matrix Representation:</strong><br>
    Let $M_R$ be the $n \\times m$ matrix representing relation $R$. The matrix representing $R^{-1}$ is the $m \\times n$ <strong>transpose</strong> of $M_R$:
    $$\\mathbf{M_{R^{-1}} = M_R^t}$$
    where $m_{ji}^{-1} = m_{ij}$.
  </li>
</ol>`,
    explanation: 'Core inverse relation concepts from MTH202 Handouts Page 97.',
    urdu_answer: 'انویرس ریلیشن $R^{-1}$ جوڑوں کے ارکان کو الٹنے سے بنتا ہے، اور اس کا میٹرکس اصل میٹرکس کا ٹرانسپوز ($M^t$) لینے سے حاصل ہوتا ہے۔'
  },
  {
    stem: 'Define Composition of Relations (S ∘ R) with its Symbolic Definition and Condition.',
    correct: `<p><strong>Composition of Relations ($S \\circ R$) (MTH202 Handouts Page 98):</strong></p>
<p>Let $R$ be a binary relation from set $A$ to set $B$, and let $S$ be a binary relation from set $B$ to set $C$.</p>
<p>The <strong>composite relation</strong> $S \\circ R$ (or $R \\circ S$ depending on notation, read as <em>"S following R"</em>) is a relation from $A$ to $C$ consisting of all ordered pairs $(a, c)$ for which there exists an intermediate linking element $b \\in B$ such that $(a, b) \\in R$ and $(b, c) \\in S$.</p>
<p><strong>Formal Symbolic Definition:</strong></p>
$$\\mathbf{S \\circ R = \\{ (a, c) \\in A \\times C \\mid \\exists b \\in B \\text{ such that } (a, b) \\in R \\text{ and } (b, c) \\in S \\}}$$`,
    explanation: 'Composition definition from MTH202 Handouts Page 98 and Student Subjective Papers.',
    urdu_answer: 'ریلیشنز کی کمپوزیشن $S \\circ R$ میں اگر $(a, b) \\in R$ اور $(b, c) \\in S$ ہو تو درمیانی رکن b کے ذریعے نیا جوڑا $(a, c)$ بنتا ہے۔'
  },
  {
    stem: 'Prove that a relation R on set A is Reflexive if and only if its complementary relation R̄ is Irreflexive.',
    correct: `<p><strong>Proof: $R$ is Reflexive $\\iff \\bar{R}$ is Irreflexive (MTH202 Handouts Page 97):</strong></p>

<h4>Part 1: $(\\implies)$ Assume $R$ is Reflexive:</h4>
<ol>
  <li>By definition of reflexivity, for all $a \\in A$, $(a, a) \\in R$.</li>
  <li>By definition of complementary relation:
    $$\\bar{R} = A \\times A - R = \\{ (x, y) \\in A \\times A \\mid (x, y) \\notin R \\}$$
  </li>
  <li>Since $(a, a) \\in R$ for every $a \\in A$, it follows directly that $(a, a) \\notin \\bar{R}$ for any $a \\in A$.</li>
  <li>Having $(a, a) \\notin \\bar{R}$ for all $a \\in A$ is the exact definition of an <strong>irreflexive</strong> relation.</li>
  <li>Therefore, $\\bar{R}$ is irreflexive.</li>
</ol>

<h4>Part 2: $(\\impliedby)$ Assume $\\bar{R}$ is Irreflexive:</h4>
<ol>
  <li>By definition of irreflexivity, for all $a \\in A$, $(a, a) \\notin \\bar{R}$.</li>
  <li>Since $(a, a) \\in A \\times A$ and $(a, a) \\notin \\bar{R}$, it must belong to $R$ ($A \\times A - \\bar{R} = R$).</li>
  <li>Thus, $(a, a) \\in R$ for all $a \\in A$, which proves that $R$ is <strong>reflexive</strong>.</li>
</ol>
<p>Hence, $R$ is reflexive if and only if $\\bar{R}$ is irreflexive.</p>`,
    explanation: 'Bidirectional mathematical proof from MTH202 Handouts Page 97.',
    urdu_answer: 'اگر تمام $(a, a)$ ریلیشن R میں ہوں تو کمپلیمنٹ $\\bar{R}$ میں کوئی بھی $(a, a)$ نہیں ہوگا، جو کہ ار-ریفلیکسو کی تعریف ہے۔ اسی طرح اس کا الٹ بھی سچ ہے۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: 'Suppose that the relation R on a set A = {1, 2, 3} is represented by the matrix:\nMR = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]\nDetermine whether R is reflexive, symmetric, and/or antisymmetric with complete justifications.',
    correct: `<p><strong>Matrix Analysis of Relation Properties (MTH202 Handouts Page 90):</strong></p>
<p>Given the $3 \\times 3$ Boolean matrix:</p>
$$M_R = \\begin{bmatrix}
1 & 1 & 0 \\\\
1 & 1 & 1 \\\\
0 & 1 & 1
\\end{bmatrix}$$

<h4>1. Reflexivity:</h4>
<ul>
  <li>Main diagonal elements are $m_{11} = 1$, $m_{22} = 1$, and $m_{33} = 1$.</li>
  <li>Since all entries on the main diagonal are $1$, every $(a, a) \\in R$.</li>
  <li><strong>Result:</strong> $R$ is <strong>REFLEXIVE</strong>.</li>
</ul>

<h4>2. Symmetry:</h4>
<ul>
  <li>Take the transpose $M_R^t$ (interchanging rows and columns):
    $$M_R^t = \\begin{bmatrix}
    1 & 1 & 0 \\\\
    1 & 1 & 1 \\\\
    0 & 1 & 1
    \\end{bmatrix} = M_R$$
  </li>
  <li>Since $M_R = M_R^t$ ($m_{ij} = m_{ji}$ for all $i, j$), $R$ is symmetric. Specifically:
    <ul>
      <li>$m_{12} = 1 \\iff m_{21} = 1$</li>
      <li>$m_{13} = 0 \\iff m_{31} = 0$</li>
      <li>$m_{23} = 1 \\iff m_{32} = 1$</li>
    </ul>
  </li>
  <li><strong>Result:</strong> $R$ is <strong>SYMMETRIC</strong>.</li>
</ul>

<h4>3. Antisymmetry:</h4>
<ul>
  <li>Antisymmetry requires that if $m_{ij} = 1$ and $m_{ji} = 1$ with $i \\neq j$, then no such pair may exist.</li>
  <li>However, $m_{12} = 1$ and $m_{21} = 1$, while $1 \\neq 2$.</li>
  <li>Similarly, $m_{23} = 1$ and $m_{32} = 1$, while $2 \\neq 3$.</li>
  <li><strong>Result:</strong> $R$ is <strong>NOT ANTISYMMETRIC</strong>.</li>
</ul>

<p><strong>Conclusion:</strong> Relation $R$ is <strong>Reflexive and Symmetric</strong>, but <strong>not Antisymmetric</strong> (Sadia Solved Subjective Q11, 5 Marks).</p>`,
    explanation: '5-mark matrix evaluation question from Sadia solved papers and MTH202 Handouts Page 90.',
    urdu_answer: 'مین ڈائیگنل میں 1 ہونے کی وجہ سے ریفلیکسو ہے، ٹرانسپوز برابر ($M = M^t$) ہونے کی وجہ سے سیمیٹرک ہے، مگر $m_{12}=m_{21}=1$ ہونے کی وجہ سے اینٹی سیمیٹرک نہیں ہے۔'
  },
  {
    stem: 'Explain how the matrix representing the Composite Relation S ∘ R is calculated using Boolean Matrix Multiplication (Boolean Product ⊙).',
    correct: `<p><strong>Boolean Product of Matrices for Composition ($S \\circ R$) (MTH202 Handouts Page 99–100):</strong></p>
<p>Let $R$ be a relation from $A$ to $B$ represented by an $m \\times k$ 0-1 matrix $M_R$, and let $S$ be a relation from $B$ to $C$ represented by a $k \\times n$ 0-1 matrix $M_S$.</p>

<h4>1. Formula:</h4>
<p>The matrix representing composite relation $S \\circ R$ is given by the <strong>Boolean Product</strong>:</p>
$$\\mathbf{M_{S \\circ R} = M_R \\odot M_S}$$
<p>where the entry $c_{ij}$ in row $i$ and column $j$ is computed as:</p>
$$c_{ij} = (a_{i1} \\wedge b_{1j}) \\vee (a_{i2} \\wedge b_{2j}) \\vee \\dots \\vee (a_{ik} \\wedge b_{kj})$$

<h4>2. Boolean Arithmetic Rules:</h4>
<ul>
  <li><strong>Boolean Multiplication (AND / $\\wedge$ / $\\cdot$):</strong>
    $$1 \\cdot 1 = 1, \\quad 1 \\cdot 0 = 0, \\quad 0 \\cdot 1 = 0, \\quad 0 \\cdot 0 = 0$$
  </li>
  <li><strong>Boolean Addition (OR / $\\vee$ / $+$):</strong>
    $$1 + 1 = 1, \\quad 1 + 0 = 1, \\quad 0 + 1 = 1, \\quad 0 + 0 = 0$$
  </li>
</ul>

<h4>3. Significance:</h4>
<p>An entry $c_{ij} = 1$ in $M_{S \\circ R}$ signifies that there is at least one intermediate path $k$ in set $B$ connecting element $a_i$ to $c_j$ ($a_i R b_k$ and $b_k S c_j$). If no such path exists, $c_{ij} = 0$.</p>`,
    explanation: 'Theoretical and computational framework from MTH202 Handouts Page 99–100.',
    urdu_answer: 'کمپوزٹ ریلیشن کا میٹرکس بولین پروڈکٹ $M_R \\odot M_S$ سے حاصل ہوتا ہے جس میں بولین ضرب (AND) اور بولین جمع (OR) کے اصول استعمال ہوتے ہیں۔'
  },
  {
    stem: 'Given A = {1, 2, 3} and R = {(1, 1), (1, 3), (2, 2), (2, 3), (3, 1)} on A.\n(a) Find the complementary relation R̄.\n(b) Find the inverse relation R⁻¹.',
    correct: `<p><strong>Finding Complementary and Inverse Relations (MTH202 Handouts Page 97):</strong></p>
<p>Given set $A = \\{1, 2, 3\\}$. Total ordered pairs in $A \\times A$ ($3 \\times 3 = 9$ pairs):</p>
$$A \\times A = \\{ (1,1), (1,2), (1,3), (2,1), (2,2), (2,3), (3,1), (3,2), (3,3) \\}$$
<p>Given relation $R = \\{ (1, 1), (1, 3), (2, 2), (2, 3), (3, 1) \\}$.</p>

<h4>(a) Complementary Relation $\\bar{R} = A \\times A - R$:</h4>
<p>Subtract the pairs of $R$ from $A \\times A$:</p>
$$\\mathbf{\\bar{R} = \\{ (1, 2), (2, 1), (3, 2), (3, 3) \\}}$$

<h4>(b) Inverse Relation $R^{-1}$:</h4>
<p>Swap the coordinates of each ordered pair in $R$:</p>
<ul>
  <li>$(1, 1) \\implies (1, 1)$</li>
  <li>$(1, 3) \\implies (3, 1)$</li>
  <li>$(2, 2) \\implies (2, 2)$</li>
  <li>$(2, 3) \\implies (3, 2)$</li>
  <li>$(3, 1) \\implies (1, 3)$</li>
</ul>
$$\\mathbf{R^{-1} = \\{ (1, 1), (3, 1), (2, 2), (3, 2), (1, 3) \\}}$$`,
    explanation: 'Complete derivation problem from MTH202 Handouts Page 97.',
    urdu_answer: 'کمپلیمنٹری ریلیشن میں وہ تمام جوڑے آئیں گے جو $A \\times A$ میں ہیں مگر R میں نہیں، اور انویرس میں R کے ہر جوڑے کے ارکان کی جگہ بدل دی جائے گی۔'
  },
  {
    stem: 'Problem: Let A = {1, 2, 3}, B = {0, 1, 2}, and C = {a, b}. Let R = {(1, 0), (1, 2), (3, 1), (3, 2)} from A to B and S = {(0, b), (1, a), (2, b)} from B to C. Find the composite relation S ∘ R.',
    correct: `<p><strong>Enumerating Composite Relation $S \\circ R$:</strong></p>
<p>Given:</p>
<ul>
  <li>$R = \\{ (1, 0), (1, 2), (3, 1), (3, 2) \\} \\subseteq A \\times B$</li>
  <li>$S = \\{ (0, b), (1, a), (2, b) \\} \\subseteq B \\times C$</li>
</ul>

<h4>Step-by-Step Composition Search:</h4>
<ol>
  <li>For pair $(1, 0) \\in R$: Look for pairs in $S$ starting with $0$:
    <ul>
      <li>$(0, b) \\in S \\implies \\mathbf{(1, b) \\in S \\circ R}$</li>
    </ul>
  </li>
  <li>For pair $(1, 2) \\in R$: Look for pairs in $S$ starting with $2$:
    <ul>
      <li>$(2, b) \\in S \\implies (1, b) \\in S \\circ R$ (already recorded)</li>
    </ul>
  </li>
  <li>For pair $(3, 1) \\in R$: Look for pairs in $S$ starting with $1$:
    <ul>
      <li>$(1, a) \\in S \\implies \\mathbf{(3, a) \\in S \\circ R}$</li>
    </ul>
  </li>
  <li>For pair $(3, 2) \\in R$: Look for pairs in $S$ starting with $2$:
    <ul>
      <li>$(2, b) \\in S \\implies \\mathbf{(3, b) \\in S \\circ R}$</li>
    </ul>
  </li>
</ol>

<h4>Final Result:</h4>
$$\\mathbf{S \\circ R = \\{ (1, b), (3, a), (3, b) \\}}$$`,
    explanation: 'High-frequency exam problem from Attiq Kundi and All in One.',
    urdu_answer: 'ہر جوڑے کے درمیانی رکن کو ملا کر نتیجہ نکالیں: $(1, 0)$ اور $(0, b)$ سے $(1, b)$، $(3, 1)$ اور $(1, a)$ سے $(3, a)$، اور $(3, 2)$ اور $(2, b)$ سے $(3, b)$ حاصل ہوگا۔'
  },
  {
    stem: 'Problem: Let A = {1, 2, 3} and B = {4, 5, 6}. Let R = {(1, 4), (2, 5), (3, 6), (3, 4)} be a relation from A to B. Find the complementary relation R̄.',
    correct: `<p><strong>Calculating Complementary Relation $\\bar{R}$:</strong></p>
<p>Given sets $A = \\{1, 2, 3\\}$ and $B = \\{4, 5, 6\\}$.</p>
<p>The universal Cartesian product $A \\times B$ contains $3 \\times 3 = 9$ ordered pairs:</p>
$$A \\times B = \\{ (1,4), (1,5), (1,6), (2,4), (2,5), (2,6), (3,4), (3,5), (3,6) \\}$$
<p>Given relation: $R = \\{ (1, 4), (2, 5), (3, 6), (3, 4) \\}$.</p>

<h4>Calculation $\\bar{R} = A \\times B - R$:</h4>
<p>Eliminate the four pairs of $R$ from $A \\times B$:</p>
<ul>
  <li>$(1, 4)$ is in $R \\implies$ excluded.</li>
  <li>$(1, 5) \\implies$ included.</li>
  <li>$(1, 6) \\implies$ included.</li>
  <li>$(2, 4) \\implies$ included.</li>
  <li>$(2, 5)$ is in $R \\implies$ excluded.</li>
  <li>$(2, 6) \\implies$ included.</li>
  <li>$(3, 4)$ is in $R \\implies$ excluded.</li>
  <li>$(3, 5) \\implies$ included.</li>
  <li>$(3, 6)$ is in $R \\implies$ excluded.</li>
</ul>

<h4>Final Answer:</h4>
$$\\mathbf{\\bar{R} = \\{ (1, 5), (1, 6), (2, 4), (2, 6), (3, 5) \\}}$$`,
    explanation: 'Step-by-step complement problem from Junaid and All in One past files.',
    urdu_answer: '$A \\times B$ کے کل 9 جوڑوں میں سے R کے 4 جوڑے نکالنے پر باقی 5 جوڑے کمپلیمنٹری ریلیشن $\\bar{R}$ بناتے ہیں۔'
  },
  {
    stem: 'Problem: Find the inverse relation R⁻¹ for R = {(a, 1), (b, 2), (c, 3), (d, 4)}.',
    correct: `<p><strong>Finding the Inverse Relation $R^{-1}$:</strong></p>
<p>Given relation:</p>
$$R = \\{ (a, 1), (b, 2), (c, 3), (d, 4) \\}$$
<p>By the mathematical definition of inverse relation:</p>
$$R^{-1} = \\{ (y, x) \\mid (x, y) \\in R \\}$$
<p>Reverse the order of each element in the ordered pairs:</p>
<ul>
  <li>$(a, 1) \\implies (1, a)$</li>
  <li>$(b, 2) \\implies (2, b)$</li>
  <li>$(c, 3) \\implies (3, c)$</li>
  <li>$(d, 4) \\implies (4, d)$</li>
</ul>
<p><strong>Final Answer:</strong></p>
$$\\mathbf{R^{-1} = \\{ (1, a), (2, b), (3, c), (4, d) \\}}$$`,
    explanation: 'Direct inverse problem from Junaid past papers.',
    urdu_answer: 'ہر جوڑے کی ترتیب الٹ کر انویرس حاصل کریں: $R^{-1} = \\{(1, a), (2, b), (3, c), (4, d)\\}$۔'
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
    insMcq.run(lec13.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec13.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec13.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 13:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Problem Proofs: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 13: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

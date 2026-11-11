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

// 2. Ensure Lecture 13 title is precise
db.prepare(`
  UPDATE lectures 
  SET title = 'Matrix Representation of Relations & Complementary Relations'
  WHERE subject_id = ? AND number = 13
`).run(mth202.id);

// 3. Create or fetch Lecture 14 for MTH202
let lec14 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 14").get(mth202.id);
if (!lec14) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 14, 'Inverse Relations, Composition of Relations & Boolean Products')
  `).run(mth202.id);
  lec14 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 14 with ID: ${lec14.id}`);
} else {
  console.log(`MTH202 Lecture 14 found with ID: ${lec14.id}`);
}

const lId = lec14.id;

// 4. Clear existing questions for Lecture 14 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 14.`);

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
    stem: 'In the matrix representation of a reflexive relation, all the entries in the main diagonal are ______.',
    options: {
      a: '0',
      b: '1',
      c: '2',
      d: 'None of these'
    },
    correct: 'b',
    explanation: '<p>A relation $R$ on set $A$ is reflexive if and only if $(a, a) \\in R$ for every $a \\in A$. Therefore, in its Boolean relation matrix $M_R$, every diagonal element $m_{ii}$ must be <strong>1</strong> (MTH202 Handouts Page 90). Appeared 15+ times.</p>',
    urdu_answer: 'ریفلیکسو ریلیشن کے میٹرکس میں مین ڈائیگنل کے تمام عناصر ہمیشہ 1 ہوتے ہیں کیونکہ ہر عنصر کا اپنے آپ سے تعلق ہوتا ہے۔'
  },
  {
    stem: 'In the matrix representation of an irreflexive relation, all the entries in the main diagonal are ______.',
    options: {
      a: '1',
      b: '0',
      c: '-1',
      d: '2'
    },
    correct: 'b',
    explanation: '<p>A relation $R$ is irreflexive if no element is related to itself: $\\forall a \\in A, (a, a) \\notin R$. Hence, all main diagonal entries in $M_R$ are strictly <strong>0</strong> (MTH202 Handouts Page 91). Appeared 15+ times.</p>',
    urdu_answer: 'ار-ریفلیکسو ریلیشن کے میٹرکس میں مین ڈائیگنل کے تمام عناصر لازماً 0 ہوتے ہیں کیونکہ کوئی بھی عنصر اپنے آپ سے متعلق نہیں ہوتا۔'
  },
  {
    stem: 'Which of the following is always true for the matrix representation of a symmetric relation?',
    options: {
      a: 'Matrix is equal to its transpose (M = M^t)',
      b: 'Diagonal entries are all 0',
      c: 'Diagonal entries are all 1',
      d: 'None of these'
    },
    correct: 'a',
    explanation: '<p>A relation is symmetric if and only if $(a, b) \\in R \\implies (b, a) \\in R$. In matrix terms, $m_{ij} = m_{ji}$, meaning the matrix is symmetric and equal to its transpose: $M = M^t$ (MTH202 Handouts Page 90). Appeared 12+ times.</p>',
    urdu_answer: 'سیمیٹرک ریلیشن کا میٹرکس ہمیشہ اپنے ٹرانسپوز کے برابر ہوتا ہے ($M = M^t$)۔'
  },
  {
    stem: 'The complementary relation $\\bar{R}$ of a relation $R$ from $A$ to $B$ is symbolically written as ______.',
    options: {
      a: '\\bar{R} = A \\times B - R = \\{(a, b) \\in A \\times B \\mid (a, b) \\notin R\\}',
      b: '\\bar{R} = R - A \\times B',
      c: '\\bar{R} = R^{-1}',
      d: 'None of these'
    },
    correct: 'a',
    explanation: '<p>The complementary relation $\\bar{R}$ contains all ordered pairs in the universal Cartesian product $A \\times B$ that do not belong to $R$: $\\bar{R} = A \\times B - R$ (MTH202 Handouts Page 97). Appeared 10+ times.</p>',
    urdu_answer: 'کمپلیمنٹری ریلیشن $\\bar{R}$ ان تمام جوڑوں پر مشتمل ہوتا ہے جو $A \\times B$ میں موجود ہوں لیکن $R$ میں شامل نہ ہوں۔'
  },
  {
    stem: 'The inverse relation $R^{-1}$ from $B$ to $A$ is defined as ______.',
    options: {
      a: 'R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\in R\\}',
      b: 'R^{-1} = \\{(a, b) \\in A \\times B \\mid (a, b) \\in R\\}',
      c: 'R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\notin R\\}',
      d: 'None of these'
    },
    correct: 'a',
    explanation: '<p>The inverse relation $R^{-1}$ is obtained by reversing the components of every ordered pair in $R$: $R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\in R\\}$ (MTH202 Handouts Page 97). Appeared 12+ times.</p>',
    urdu_answer: 'انورس ریلیشن $R^{-1}$ ریلیشن $R$ کے ہر جوڑے کے عناصر کی پوزیشن کو الٹنے سے حاصل ہوتا ہے۔'
  },
  {
    stem: 'The matrix representation of inverse relation $R^{-1}$ is obtained by taking the ______ of the matrix representing $R$.',
    options: {
      a: 'Transpose (M^t)',
      b: 'Determinant',
      c: 'Inverse',
      d: 'Adjoint'
    },
    correct: 'a',
    explanation: '<p>Since $(b, a) \\in R^{-1} \\iff (a, b) \\in R$, the row and column indices are swapped: $M_{R^{-1}} = (M_R)^t$ (transpose of $M_R$) (MTH202 Handouts Page 97). Appeared 10+ times.</p>',
    urdu_answer: 'انورس ریلیشن $R^{-1}$ کا میٹرکس اصل میٹرکس $M_R$ کا ٹرانسپوز ($M^t$) لینے سے حاصل ہوتا ہے۔'
  },
  {
    stem: 'Let $R$ be a relation on a set $A$. If $R$ is reflexive, then its complementary relation $\\bar{R}$ is ______.',
    options: {
      a: 'Reflexive',
      b: 'Irreflexive',
      c: 'Symmetric',
      d: 'Transitive'
    },
    correct: 'b',
    explanation: '<p>If $R$ is reflexive, then $\\forall a \\in A, (a, a) \\in R$. Consequently, no $(a, a)$ can belong to the complement $\\bar{R}$, making $\\bar{R}$ strictly <strong>irreflexive</strong> (MTH202 Handouts Page 97). Appeared 8+ times.</p>',
    urdu_answer: 'اگر ریلیشن $R$ ریفلیکسو ہو تو اس کا کمپلیمنٹ $\\bar{R}$ لازماً ار-ریفلیکسو (Irreflexive) ہوگا۔'
  },
  {
    stem: 'The ordered pairs which are not present in a relation $R$ must be present in the ______.',
    options: {
      a: 'Inverse of that relation',
      b: 'Composition of relations',
      c: 'Complementary relation of that relation',
      d: 'Universal relation'
    },
    correct: 'c',
    explanation: '<p>By definition, the complementary relation $\\bar{R} = A \\times B - R$ contains precisely all the ordered pairs not present in $R$ (MTH202 Handouts Page 97). Appeared 8+ times.</p>',
    urdu_answer: 'وہ تمام جوڑے جو کسی ریلیشن $R$ میں موجود نہیں ہوتے، وہ اس کے کمپلیمنٹری ریلیشن میں موجود ہوتے ہیں۔'
  },
  {
    stem: 'In Boolean addition (used in Boolean matrix multiplication for relation composition), $1 + 1 = $ ______.',
    options: {
      a: '2',
      b: '1',
      c: '0',
      d: 'None of these'
    },
    correct: 'b',
    explanation: '<p>In Boolean algebra (logical OR), $1 + 1 = 1$, $1 + 0 = 1$, and $0 + 0 = 0$ (MTH202 Handouts Page 99). Appeared 10+ times.</p>',
    urdu_answer: 'بولین جمع (Boolean Addition یا Logical OR) میں $1 + 1 = 1$ ہوتا ہے۔'
  },
  {
    stem: 'The inverse of a relation can be obtained by ______.',
    options: {
      a: 'Changing signs of elements in ordered pairs',
      b: 'Changing position of elements in ordered pairs',
      c: 'Taking multiplicative inverse of elements',
      d: 'None of these'
    },
    correct: 'b',
    explanation: '<p>The inverse relation $R^{-1}$ is obtained by swapping/changing the positions of the first and second elements in each ordered pair: $(a, b) \\to (b, a)$ (MTH202 Handouts Page 97). Appeared 6+ times.</p>',
    urdu_answer: 'کسی بھی ریلیشن کا انورس اس کے تمام جوڑوں کے عناصر کی آپسی جگہ بدلنے (تبدیل کرنے) سے حاصل ہوتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Seeded ${mcqs.length} MCQs for Lecture 14.`);

// 4 Short Questions (3 marks each)
const shortQuestions = [
  {
    stem: 'Define Complementary Relation with its Symbolic Notation.',
    correct: 'Let R be a relation from A to B. The complementary relation R̄ is the set of all ordered pairs in A × B that do not belong to R. Symbolically: R̄ = A × B - R = {(a, b) ∈ A × B | (a, b) ∉ R}.',
    explanation: `<p><strong>Complementary Relation (MTH202 Handouts Page 97):</strong></p>
<p>Let $R$ be a binary relation from set $A$ to set $B$. The <strong>complementary relation</strong> of $R$, denoted $\\bar{R}$, consists of all ordered pairs in the Cartesian product $A \\times B$ that are not in $R$.</p>
<p><strong>Symbolic Definition:</strong></p>
$$\\bar{R} = A \\times B - R = \\{ (a, b) \\in A \\times B \\mid (a, b) \\notin R \\}$$
<p>If $a$ is related to $b$ in $R$ ($a R b$), then $a$ is NOT related to $b$ in $\\bar{R}$ ($a \\cancel{R} b$), and vice versa.</p>`,
    urdu_answer: 'کمپلیمنٹری ریلیشن $\\bar{R}$ ان تمام جوڑوں کا سیٹ ہے جو $A \\times B$ میں موجود ہوں مگر $R$ کا حصہ نہ ہوں: $\\bar{R} = A \\times B - R = \\{(a, b) \\in A \\times B \\mid (a, b) \\notin R\\}$۔'
  },
  {
    stem: 'Define Inverse Relation and explain how its matrix representation is obtained from the matrix of R.',
    correct: 'The inverse relation R⁻¹ from B to A is defined as R⁻¹ = {(b, a) ∈ B × A | (a, b) ∈ R}. Its matrix representation is obtained by taking the transpose of the matrix of R (M_{R⁻¹} = M_R^t).',
    explanation: `<p><strong>Inverse Relation (MTH202 Handouts Page 97):</strong></p>
<p>Let $R$ be a relation from set $A$ to set $B$. The <strong>inverse relation</strong> $R^{-1}$ from $B$ to $A$ is defined by reversing the order of every pair:</p>
$$R^{-1} = \\{ (b, a) \\in B \\times A \\mid (a, b) \\in R \\}$$
<p><strong>Matrix Representation:</strong><br>
The matrix representing $R^{-1}$ is the <strong>transpose</strong> of the matrix representing $R$:</p>
$$M_{R^{-1}} = (M_R)^t$$
<p>The $(j, i)$-th entry of $M_{R^{-1}}$ is 1 if and only if the $(i, j)$-th entry of $M_R$ is 1.</p>`,
    urdu_answer: 'انورس ریلیشن $R^{-1}$ کی تعریف: اگر $R$ ایک ریلیشن ہو تو $R^{-1} = \\{(b, a) \\in B \\times A \\mid (a, b) \\in R\\}$ ہوتا ہے۔ اس کا میٹرکس اصل میٹرکس کا ٹرانسپوز لینے سے حاصل ہوتا ہے: $M_{R^{-1}} = (M_R)^t$۔'
  },
  {
    stem: 'Define Composition of Relations (S ∘ R) and state its formal symbolic definition.',
    correct: 'Let R be a relation from A to B and S be a relation from B to C. The composite relation S ∘ R from A to C consists of all pairs (a, c) such that there exists b ∈ B with (a, b) ∈ R and (b, c) ∈ S. Symbolically: S ∘ R = {(a, c) ∈ A × C | ∃ b ∈ B, (a, b) ∈ R ∧ (b, c) ∈ S}.',
    explanation: `<p><strong>Composition of Relations (MTH202 Handouts Page 98):</strong></p>
<p>Let $R$ be a relation from set $A$ to set $B$, and let $S$ be a relation from set $B$ to set $C$. The <strong>composition of $R$ and $S$</strong>, denoted $S \\circ R$, is a relation from $A$ to $C$ defined as:</p>
$$S \\circ R = \\{ (a, c) \\in A \\times C \\mid \\exists b \\in B \\text{ such that } (a, b) \\in R \\text{ and } (b, c) \\in S \\}$$
<p><strong>Note on Order:</strong> In $S \\circ R$, the relation $R$ is applied first (from $A$ to $B$), followed by $S$ (from $B$ to $C$).</p>`,
    urdu_answer: 'کمپوزیشن آف ریلیشنز ($S \\circ R$): اگر $R$ کا تعلق $A$ سے $B$ اور $S$ کا تعلق $B$ سے $C$ ہو تو $S \\circ R$ ایسا تعلق ہے جس میں $(a, c)$ تب شامل ہوگا جب کوئی درمیانی عنصر $b$ موجود ہو کہ $(a, b) \\in R$ اور $(b, c) \\in S$۔'
  },
  {
    stem: 'Prove that a relation R on set A is Reflexive if and only if its complementary relation R̄ is Irreflexive.',
    correct: '(=>) If R is reflexive, then (a, a) ∈ R for all a ∈ A. By complement definition, (a, a) ∉ R̄ for all a ∈ A, so R̄ is irreflexive. (<=) If R̄ is irreflexive, then (a, a) ∉ R̄ for all a ∈ A. By complement definition, (a, a) ∈ R for all a ∈ A, so R is reflexive.',
    explanation: `<p><strong>Theorem and Proof (MTH202 Handouts Page 97):</strong></p>
<p><strong>Statement:</strong> A relation $R$ on a set $A$ is reflexive $\\iff$ $\\bar{R}$ is irreflexive.</p>
<p><strong>Proof:</strong></p>
<ol>
  <li><strong>Forward Direction ($\\implies$):</strong><br>
    Suppose $R$ is reflexive. Then by definition, $(a, a) \\in R$ for every $a \\in A$.<br>
    By definition of complement, $\\bar{R} = A \\times A - R$. Since $(a, a) \\in R$, $(a, a) \\notin \\bar{R}$ for every $a \\in A$.<br>
    Therefore, no diagonal element belongs to $\\bar{R}$, which means $\\bar{R}$ is <strong>irreflexive</strong>.
  </li>
  <li><strong>Backward Direction ($\\impliedby$):</strong><br>
    Suppose $\\bar{R}$ is irreflexive. Then $(a, a) \\notin \\bar{R}$ for every $a \\in A$.<br>
    Since $(a, a) \\in A \\times A$ and $(a, a) \\notin \\bar{R}$, it must belong to $R$: $(a, a) \\in R$ for every $a \\in A$.<br>
    Hence, $R$ is <strong>reflexive</strong>.
  </li>
</ol>`,
    urdu_answer: 'ثبوت: اگر R ریفلیکسو ہو تو تمام (a, a) اس میں ہوں گے، پس کمپلیمنٹ $\\bar{R}$ میں کوئی (a, a) نہیں ہو سکتا، جس سے وہ ار-ریفلیکسو ثابت ہو گیا۔ اسی طرح اگر $\\bar{R}$ میں کوئی (a, a) نہ ہو تو لازماً وہ تمام R میں ہوں گے، جس سے R ریفلیکسو بن جاتا ہے۔'
  }
];

for (const s of shortQuestions) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Seeded ${shortQuestions.length} Short Questions for Lecture 14.`);

// 6 Long Questions (5 marks each: 3 Analytical + 3 Problem-Solving)
const longQuestions = [
  {
    stem: 'Suppose that the relation R on a set A = {1, 2, 3} is represented by the matrix:\nMR = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]\nDetermine whether R is reflexive, symmetric, and/or antisymmetric with complete mathematical justifications.',
    correct: 'Reflexive because all main diagonal elements are 1. Symmetric because MR = MR^t. Not antisymmetric because m12 = m21 = 1 with 1 != 2.',
    explanation: `<p><strong>Matrix Analysis of Relation Properties (MTH202 Handouts Page 90):</strong></p>
<p>Given the $3 \\times 3$ Boolean matrix:</p>
$$M_R = \\begin{bmatrix}
1 & 1 & 0 \\\\
1 & 1 & 1 \\\\
0 & 1 & 1
\\end{bmatrix}$$

<p><strong>1. Reflexivity:</strong></p>
<ul>
  <li>Main diagonal entries are $m_{11} = 1$, $m_{22} = 1$, and $m_{33} = 1$.</li>
  <li>Since every $m_{ii} = 1$ for all $i \\in \\{1, 2, 3\\}$, $(a, a) \\in R$ for all $a \\in A$.</li>
  <li><strong>Conclusion:</strong> $R$ is <strong>REFLEXIVE</strong>.</li>
</ul>

<p><strong>2. Symmetry:</strong></p>
<ul>
  <li>Compute the transpose $M_R^t$ (swapping rows and columns):
    $$M_R^t = \\begin{bmatrix}
    1 & 1 & 0 \\\\
    1 & 1 & 1 \\\\
    0 & 1 & 1
    \\end{bmatrix} = M_R$$
  </li>
  <li>Since $M_R = M_R^t$ (i.e. $m_{ij} = m_{ji}$ for all $i, j$), $R$ satisfies symmetry.</li>
  <li><strong>Conclusion:</strong> $R$ is <strong>SYMMETRIC</strong>.</li>
</ul>

<p><strong>3. Antisymmetry:</strong></p>
<ul>
  <li>Antisymmetry requires that if $m_{ij} = 1$ and $m_{ji} = 1$, then $i$ must equal $j$.</li>
  <li>However, $m_{12} = 1$ and $m_{21} = 1$, while $1 \\neq 2$.</li>
  <li>Similarly, $m_{23} = 1$ and $m_{32} = 1$, while $2 \\neq 3$.</li>
  <li><strong>Conclusion:</strong> $R$ is <strong>NOT ANTISYMMETRIC</strong>.</li>
</ul>
<p><strong>Final Summary:</strong> Relation $R$ is <strong>Reflexive and Symmetric</strong>, but <strong>not Antisymmetric</strong> (Past paper Sadia Solved Q11, 5 Marks).</p>`,
    urdu_answer: 'مین ڈائیگنل میں تمام 1 ہونے سے ریلیشن ریفلیکسو ہے، ٹرانسپوز $M = M^t$ کے برابر ہونے سے سیمیٹرک ہے، مگر چونکہ $m_{12}=1$ اور $m_{21}=1$ ہیں جبکہ $1 \\neq 2$ ہے، اس لیے اینٹی سیمیٹرک نہیں ہے۔'
  },
  {
    stem: 'Explain how the matrix representing the Composite Relation S ∘ R is calculated using Boolean Matrix Multiplication (Boolean Product ⊙). State the rules of Boolean operations.',
    correct: 'The matrix representing S ∘ R is given by M_{S ∘ R} = M_R ⊙ M_S where ⊙ is the Boolean product. Boolean addition rules are: 1+1=1, 1+0=1, 0+0=0. Boolean multiplication rules are: 1·1=1, 1·0=0, 0·0=0.',
    explanation: `<p><strong>Composite Relation Matrix Calculation (MTH202 Handouts Pages 99–100):</strong></p>
<p>Let $R$ be a relation from $A$ to $B$ represented by matrix $M_R$ (of size $m \\times k$), and let $S$ be a relation from $B$ to $C$ represented by matrix $M_S$ (of size $k \\times n$).</p>
<p>The matrix representing the composite relation $S \\circ R$ (from $A$ to $C$) is computed using the <strong>Boolean Product</strong> (denoted $\\odot$):</p>
$$M_{S \\circ R} = M_R \\odot M_S$$

<p><strong>Rules of Boolean Arithmetic:</strong></p>
<ul>
  <li><strong>Boolean Addition (Logical OR $\\lor$):</strong>
    $$0 + 0 = 0, \\quad 0 + 1 = 1, \\quad 1 + 0 = 1, \\quad 1 + 1 = 1$$
  </li>
  <li><strong>Boolean Multiplication (Logical AND $\\land$):</strong>
    $$0 \\cdot 0 = 0, \\quad 0 \\cdot 1 = 0, \\quad 1 \\cdot 0 = 0, \\quad 1 \\cdot 1 = 1$$
  </li>
</ul>

<p><strong>Entry-wise Calculation:</strong><br>
The $(i, j)$-th entry $c_{ij}$ of $M_{S \\circ R}$ is:
$$c_{ij} = (a_{i1} \\cdot b_{1j}) + (a_{i2} \\cdot b_{2j}) + \\dots + (a_{ik} \\cdot b_{kj})$$
If any term $(a_{ir} \\cdot b_{rj}) = 1$, then $c_{ij} = 1$, confirming there exists an element $b_r \\in B$ connecting $a_i$ to $c_j$.</p>`,
    urdu_answer: 'کمپوزٹ ریلیشن $S \\circ R$ کا میٹرکس $M_R \\odot M_S$ سے معلوم کیا جاتا ہے۔ اس میں بولین ضرب ($1 \\cdot 1 = 1$ ورنہ 0) اور بولین جمع ($1+1=1$, $1+0=1$, $0+0=0$) کے اصول لاگو ہوتے ہیں۔'
  },
  {
    stem: 'Given A = {1, 2, 3} and R = {(1, 1), (1, 3), (2, 2), (2, 3), (3, 1)} on A.\n(a) Find the complementary relation R̄.\n(b) Find the inverse relation R⁻¹.',
    correct: '(a) R̄ = {(1, 2), (2, 1), (3, 2), (3, 3)}. (b) R⁻¹ = {(1, 1), (3, 1), (2, 2), (3, 2), (1, 3)}.',
    explanation: `<p><strong>Step-by-Step Solution (MTH202 Handouts Page 97):</strong></p>
<p><strong>Given:</strong> $A = \\{1, 2, 3\\}$ and $R = \\{(1, 1), (1, 3), (2, 2), (2, 3), (3, 1)\\}$</p>

<p><strong>1. Universal Cartesian Product $A \\times A$:</strong><br>
$$A \\times A = \\begin{Bmatrix}
(1, 1), & (1, 2), & (1, 3), \\\\
(2, 1), & (2, 2), & (2, 3), \\\\
(3, 1), & (3, 2), & (3, 3)
\\end{Bmatrix}$$
Total $3 \\times 3 = 9$ ordered pairs.</p>

<p><strong>Part (a): Complementary Relation $\\bar{R} = A \\times A - R$:</strong><br>
Subtracting the 5 pairs of $R$ from $A \\times A$ leaves the remaining 4 pairs:
$$\\bar{R} = \\{ (1, 2), (2, 1), (3, 2), (3, 3) \\}$$</p>

<p><strong>Part (b): Inverse Relation $R^{-1}$:</strong><br>
Reverse each ordered pair $(a, b) \\in R$:
<ul>
  <li>$(1, 1) \\to (1, 1)$</li>
  <li>$(1, 3) \\to (3, 1)$</li>
  <li>$(2, 2) \\to (2, 2)$</li>
  <li>$(2, 3) \\to (3, 2)$</li>
  <li>$(3, 1) \\to (1, 3)$</li>
</ul>
$$R^{-1} = \\{ (1, 1), (3, 1), (2, 2), (3, 2), (1, 3) \\}$$</p>`,
    urdu_answer: 'حل: (a) تمام 9 جوڑوں میں سے R کے جوڑے نکالنے سے کمپلیمنٹ $\\bar{R} = \\{(1, 2), (2, 1), (3, 2), (3, 3)\\}$ حاصل ہوتا ہے۔ (b) R کے ہر جوڑے کو الٹنے سے انورس $R^{-1} = \\{(1, 1), (3, 1), (2, 2), (3, 2), (1, 3)\\}$ بنتا ہے۔'
  },
  {
    stem: 'Problem-Solving Question 1: Let A = {1, 2, 3}, B = {0, 1, 2}, and C = {a, b}. Let R = {(1, 0), (1, 2), (3, 1), (3, 2)} from A to B and S = {(0, b), (1, a), (2, b)} from B to C. Find the composite relation S ∘ R step-by-step.',
    correct: 'S ∘ R = {(1, b), (3, a), (3, b)}. Trace pairs: (1, 0) and (0, b) -> (1, b); (1, 2) and (2, b) -> (1, b); (3, 1) and (1, a) -> (3, a); (3, 2) and (2, b) -> (3, b).',
    explanation: `<p><strong>Step-by-Step Composition Tracing:</strong></p>
<p><strong>Given:</strong></p>
<ul>
  <li>$R = \\{(1, 0), (1, 2), (3, 1), (3, 2)\\}$ (from $A$ to $B$)</li>
  <li>$S = \\{(0, b), (1, a), (2, b)\\}$ (from $B$ to $C$)</li>
</ul>

<p><strong>Evaluating each pair $(a, b) \\in R$:</strong></p>
<ol>
  <li>For $(1, 0) \\in R$: Look for pairs in $S$ starting with $0$. We have $(0, b) \\in S$.<br>
    $\\implies (1, b) \\in S \\circ R$.</li>
  <li>For $(1, 2) \\in R$: Look for pairs in $S$ starting with $2$. We have $(2, b) \\in S$.<br>
    $\\implies (1, b) \\in S \\circ R$. (Already recorded).</li>
  <li>For $(3, 1) \\in R$: Look for pairs in $S$ starting with $1$. We have $(1, a) \\in S$.<br>
    $\\implies (3, a) \\in S \\circ R$.</li>
  <li>For $(3, 2) \\in R$: Look for pairs in $S$ starting with $2$. We have $(2, b) \\in S$.<br>
    $\\implies (3, b) \\in S \\circ R$.</li>
</ol>

<p><strong>Result:</strong><br>
$$S \\circ R = \\{ (1, b), (3, a), (3, b) \\}$$</p>`,
    urdu_answer: 'مسئلہ 1 کا حل: جوڑوں کو ٹریس کرنے سے: (1, 0) اور (0, b) سے (1, b) بنتا ہے؛ (1, 2) اور (2, b) سے بھی (1, b)؛ (3, 1) اور (1, a) سے (3, a)؛ اور (3, 2) اور (2, b) سے (3, b)۔ حاصل شدہ رزلٹ: $S \\circ R = \\{(1, b), (3, a), (3, b)\\}$۔'
  },
  {
    stem: 'Problem-Solving Question 2: Let A = {1, 2, 3} and B = {4, 5, 6}. Let R = {(1, 4), (2, 5), (3, 6), (3, 4)} be a relation from A to B. Find the complementary relation R̄.',
    correct: 'R̄ = {(1, 5), (1, 6), (2, 4), (2, 6), (3, 5)}. Total elements in A × B = 9; subtracting 4 pairs of R leaves 5 pairs.',
    explanation: `<p><strong>Step-by-Step Complement Calculation:</strong></p>
<p><strong>Given:</strong> $A = \\{1, 2, 3\\}$, $B = \\{4, 5, 6\\}$, and $R = \\{(1, 4), (2, 5), (3, 6), (3, 4)\\}$</p>

<p><strong>1. Form Cartesian Product $A \\times B$:</strong><br>
$$A \\times B = \\begin{Bmatrix}
(1, 4), & (1, 5), & (1, 6), \\\\
(2, 4), & (2, 5), & (2, 6), \\\\
(3, 4), & (3, 5), & (3, 6)
\\end{Bmatrix}$$
Total $3 \\times 3 = 9$ ordered pairs.</p>

<p><strong>2. Remove pairs in $R$:</strong><br>
Remove $(1, 4)$, $(2, 5)$, $(3, 6)$, and $(3, 4)$.</p>

<p><strong>Result:</strong><br>
$$\\bar{R} = \\{ (1, 5), (1, 6), (2, 4), (2, 6), (3, 5) \\}$$</p>`,
    urdu_answer: 'مسئلہ 2 کا حل: کارٹیشین پروڈکٹ $A \\times B$ میں کل 9 جوڑے بنتے ہیں۔ ان میں سے R کے چار جوڑے نکالنے کے بعد باقی 5 جوڑے کمپلیمنٹ بناتے ہیں: $\\bar{R} = \\{(1, 5), (1, 6), (2, 4), (2, 6), (3, 5)\\}$۔'
  },
  {
    stem: 'Problem-Solving Question 3: Given the relation R = {(a, 1), (b, 2), (c, 3), (d, 4)} from set X = {a, b, c, d} to set Y = {1, 2, 3, 4}. Find the inverse relation R⁻¹ and state its domain and range.',
    correct: 'R⁻¹ = {(1, a), (2, b), (3, c), (4, d)}. Domain(R⁻¹) = {1, 2, 3, 4}, Range(R⁻¹) = {a, b, c, d}.',
    explanation: `<p><strong>Step-by-Step Inverse Calculation:</strong></p>
<p><strong>Given:</strong> $R = \\{ (a, 1), (b, 2), (c, 3), (d, 4) \\}$</p>

<p><strong>1. Reversing each ordered pair:</strong><br>
<ul>
  <li>$(a, 1) \\implies (1, a)$</li>
  <li>$(b, 2) \\implies (2, b)$</li>
  <li>$(c, 3) \\implies (3, c)$</li>
  <li>$(d, 4) \\implies (4, d)$</li>
</ul></p>

<p><strong>2. Resulting Inverse Relation:</strong><br>
$$R^{-1} = \\{ (1, a), (2, b), (3, c), (4, d) \\}$$</p>

<p><strong>3. Domain and Range:</strong><br>
<ul>
  <li><strong>Domain($R^{-1}$):</strong> $\\{1, 2, 3, 4\\}$ (equals Range($R$))</li>
  <li><strong>Range($R^{-1}$):</strong> $\\{a, b, c, d\\}$ (equals Domain($R$))</li>
</ul></p>`,
    urdu_answer: 'مسئلہ 3 کا حل: جوڑوں کے عناصر کو الٹنے سے انورس $R^{-1} = \\{(1, a), (2, b), (3, c), (4, d)\\}$ بنتا ہے۔ اس کی ڈومین $\\{1, 2, 3, 4\\}$ اور رینج $\\{a, b, c, d\\}$ ہے۔'
  }
];

for (const l of longQuestions) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Seeded ${longQuestions.length} Long Questions for Lecture 14.`);

const totalCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE lecture_id = ?').get(lId);
const allCount = db.prepare('SELECT COUNT(*) as c FROM questions').get();
console.log(`Lecture 14 questions total: ${totalCount.c}`);
console.log(`Overall database questions total: ${allCount.c}`);

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

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(mth202.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Properties of Relations: Reflexivity, Symmetry, Transitivity, Equivalence & Posets')
  `).run(mth202.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`MTH202 Lecture 12 found with ID: ${lec12.id}`);
}

// 3. Clear existing questions for Lecture 12 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec12.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 12.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'A binary relation R on a set A is called a Partial Order Relation if it is __________.',
    options: {
      a: 'Reflexive and transitive',
      b: 'Symmetric and transitive',
      c: 'Reflexive, symmetric, and transitive',
      d: 'Reflexive, anti-symmetric, and transitive'
    },
    correct: 'd',
    explanation: 'A relation R on a set A is a Partial Order Relation (defining a partially ordered set or poset) if and only if R is reflexive, antisymmetric, and transitive (MTH202 Handouts Page 92). Appeared 20+ times in Junaid, Attiq Kundi, and All in One.',
    urdu_answer: 'ایک بائنری ریلیشن اس وقت پارشل آرڈر ریلیشن (Poset) کہلاتا ہے جب وہ ریفلیکسو، اینٹی سیمیٹرک اور ٹرانزیٹو ہو۔'
  },
  {
    stem: 'A binary relation R on a set A is called an Equivalence Relation if it is __________.',
    options: {
      a: 'Reflexive, symmetric, and transitive',
      b: 'Reflexive, anti-symmetric, and transitive',
      c: 'Symmetric and transitive only',
      d: 'Reflexive only'
    },
    correct: 'a',
    explanation: 'An Equivalence Relation on a set A is defined by three axioms: (1) Reflexivity, (2) Symmetry, and (3) Transitivity (MTH202 Handouts Page 87). Appeared 15+ times across Sadia, Attiq Kundi, and Junaid papers.',
    urdu_answer: 'ایکویویلنس ریلیشن وہ ہوتا ہے جو بیک وقت ریفلیکسو، سیمیٹرک اور ٹرانزیٹو ہو۔'
  },
  {
    stem: 'Symmetric and antisymmetric relations are __________.',
    options: {
      a: 'Negative of each other',
      b: 'Both are same',
      c: 'Not negative of each other',
      d: 'None of these'
    },
    correct: 'c',
    explanation: 'Symmetric and antisymmetric are NOT negatives or opposites of each other. A relation can possess both properties (e.g., the identity relation), neither property, or exactly one of them (MTH202 Handouts Page 82). Appeared 15+ times in Moaaz, Junaid, and Team Hadi.',
    urdu_answer: 'سیمیٹرک اور اینٹی سیمیٹرک ایک دوسرے کی نفی (Negative) نہیں ہیں؛ ایک ریلیشن دونوں بھی ہو سکتا ہے اور دونوں میں سے کوئی بھی نہیں۔'
  },
  {
    stem: 'Let A = {a, b, c} and R = {(a, c), (b, b), (c, a)} be a relation on A. Is R __________.',
    options: {
      a: 'Transitive',
      b: 'Reflexive',
      c: 'Symmetric',
      d: 'Transitive and Reflexive'
    },
    correct: 'c',
    explanation: 'R is symmetric because $(a, c) \\in R \\implies (c, a) \\in R$, and $(b, b) \\in R \\implies (b, b) \\in R$. It is not reflexive because $(a, a) \\notin R$ and $(c, c) \\notin R$. It is not transitive because $(a, c) \\in R$ and $(c, a) \\in R$ but $(a, a) \\notin R$ (MTH202 Handouts Page 79). Appeared 12+ times.',
    urdu_answer: 'یہ ریلیشن سیمیٹرک (Symmetric) ہے کیونکہ ہر جوڑے (x, y) کے لیے اس کا الٹ (y, x) بھی ریلیشن میں موجود ہے۔'
  },
  {
    stem: 'Consider the relation R = {(1,1), (1,2), (1,4), (2,1), (2,2), (3,3), (4,4)} on A = {1, 2, 3, 4}. Then R is __________.',
    options: {
      a: 'Symmetric',
      b: 'Transitive',
      c: 'Reflexive',
      d: 'All of these'
    },
    correct: 'c',
    explanation: 'Since all identity pairs $(1,1), (2,2), (3,3), (4,4)$ are present in R, R is reflexive. It is not symmetric because $(1,4) \\in R$ but $(4,1) \\notin R$ (MTH202 Handouts Page 78). Appeared 12+ times in Moaaz and All in One.',
    urdu_answer: 'کیونکہ تمام ارکان کے لیے $(1,1), (2,2), (3,3), (4,4)$ موجود ہیں اس لیے یہ ریفلیکسو (Reflexive) ہے۔'
  },
  {
    stem: 'Let A = {1, 2, 3, 4} and R = {(1, 1), (2, 2), (3, 3), (4, 4)}, then R is __________.',
    options: {
      a: 'Symmetric',
      b: 'Anti symmetric',
      c: 'Transitive',
      d: 'All given options are true'
    },
    correct: 'd',
    explanation: 'The diagonal / identity relation R on A is simultaneously: (1) Reflexive (all (x, x) exist), (2) Symmetric (if (x, y) in R then (y, x) in R), (3) Antisymmetric (if (x, y) and (y, x) in R then x = y), and (4) Transitive (MTH202 Handouts Page 83). Appeared 10+ times in Grand Quiz 2020.',
    urdu_answer: 'یہ آئیڈینٹٹی ریلیشن بیک وقت سیمیٹرک، اینٹی سیمیٹرک اور ٹرانزیٹو ہے، لہٰذا تمام آپشنز درست ہیں۔'
  },
  {
    stem: 'If R and S are reflexive relations on a set A, then R ∩ S is __________.',
    options: {
      a: 'Reflexive',
      b: 'Irreflexive',
      c: 'Symmetric',
      d: 'Transitive'
    },
    correct: 'a',
    explanation: 'Since both R and S are reflexive, $\\forall a \\in A, (a, a) \\in R$ and $(a, a) \\in S$. By intersection definition, $(a, a) \\in R \\cap S$ for all $a \\in A$, proving $R \\cap S$ is reflexive (MTH202 Handouts Page 88). Appeared 10+ times in Team Hadi and Attiq Kundi.',
    urdu_answer: 'دو ریفلیکسو ریلیشنز کا انٹرسیکشن ہمیشہ ریفلیکسو (Reflexive) ہوتا ہے۔'
  },
  {
    stem: 'If two relations are reflexive, then their composition is __________.',
    options: {
      a: 'Anti-symmetric',
      b: 'Reflexive',
      c: 'Irreflexive',
      d: 'Symmetric'
    },
    correct: 'b',
    explanation: 'If R and S are reflexive relations on set A, then for all $a \\in A$, $(a, a) \\in R$ and $(a, a) \\in S$, which immediately guarantees $(a, a) \\in S \\circ R$. Thus, their composition is reflexive (MTH202 Handouts Page 88). Appeared in Team Hadi and All in One.',
    urdu_answer: 'دو ریفلیکسو ریلیشنز کی کمپوزیشن بھی لازمی طور پر ریفلیکسو ہوتی ہے۔'
  },
  {
    stem: 'Let A = ℤ⁺ (set of positive integers) and let R = {(a, b) ∈ A × A | a < b} be the "less than" relation. Is R symmetric or antisymmetric?',
    options: {
      a: 'Symmetric',
      b: 'Antisymmetric'
    },
    correct: 'b',
    explanation: 'Antisymmetry requires that if $a R b$ and $b R a$, then $a = b$. For the relation $a < b$, it is impossible for both $a < b$ and $b < a$ to be true simultaneously. Thus, the premise condition is always false, making the implication vacuously TRUE. Therefore, R is antisymmetric (MTH202 Handouts Page 90).',
    urdu_answer: 'کیونکہ $a < b$ اور $b < a$ کبھی بیک وقت سچ نہیں ہو سکتے، اس لیے شرط خود بخود سچ (Vacuously true) ہو کر یہ اینٹی سیمیٹرک کہلاتا ہے۔'
  },
  {
    stem: 'Let A = {a, b, c} and R = {(a, a), (b, b), (c, c)}. R is an equivalence relation.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'The identity relation contains $(x, x)$ for all $x \\in A$ (Reflexive), trivially satisfies symmetry (if $(x, y) \\in R$ then $(y, x) \\in R$), and satisfies transitivity. Thus, R is an Equivalence Relation (MTH202 Handouts Page 87). Appeared in Sadia past papers.',
    urdu_answer: 'یہ بیان درست (True) ہے کیونکہ یہ آئیڈینٹٹی ریلیشن ریفلیکسو، سیمیٹرک اور ٹرانزیٹو تینوں ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Reflexive, Symmetric, Antisymmetric, and Transitive Relations on a Set A with their Formal Mathematical Conditions.',
    correct: `<p><strong>Core Properties of Binary Relations on a Set $A$ (MTH202 Handouts Page 78–85):</strong></p>
<ol>
  <li><strong>Reflexive:</strong> A relation $R$ on set $A$ is reflexive if and only if every element in $A$ is related to itself:
    $$\\forall a \\in A, \\quad (a, a) \\in R$$
  </li>
  <li><strong>Symmetric:</strong> A relation $R$ is symmetric if whenever $a$ is related to $b$, then $b$ is related to $a$:
    $$\\forall a, b \\in A, \\quad (a, b) \\in R \\implies (b, a) \\in R$$
  </li>
  <li><strong>Antisymmetric:</strong> A relation $R$ is antisymmetric if whenever $(a, b) \\in R$ and $(b, a) \\in R$, then $a$ must equal $b$ (no two distinct elements are mutually related):
    $$\\forall a, b \\in A, \\quad [(a, b) \\in R \\wedge (b, a) \\in R] \\implies a = b$$
  </li>
  <li><strong>Transitive:</strong> A relation $R$ is transitive if whenever $a$ is related to $b$ and $b$ is related to $c$, then $a$ is related to $c$:
    $$\\forall a, b, c \\in A, \\quad [(a, b) \\in R \\wedge (b, c) \\in R] \\implies (a, c) \\in R$$
  </li>
</ol>`,
    explanation: 'Comprehensive definitions from MTH202 Handouts Page 78–85.',
    urdu_answer: 'ریفلیکسو: ہر رکن کا اپنے ساتھ جوڑا ہو ($(a, a) \\in R$)؛ سیمیٹرک: اگر $(a, b)$ ہو تو $(b, a)$ بھی ہو؛ اینٹی سیمیٹرک: اگر دونوں ہوں تو $a = b$ ہو؛ ٹرانزیٹو: اگر $(a, b)$ اور $(b, c)$ ہوں تو $(a, c)$ بھی ہو۔'
  },
  {
    stem: 'Define Equivalence Relation and Partial Order Relation (Poset). Compare their Defining Axioms.',
    correct: `<p><strong>Equivalence Relation vs. Partial Order Relation (MTH202 Handouts Page 86–92):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Property</th>
      <th class="p-2 border">Equivalence Relation</th>
      <th class="p-2 border">Partial Order Relation (Poset)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">1. Reflexivity</td>
      <td class="p-2 border">Required: $\\forall a \\in A, (a, a) \\in R$</td>
      <td class="p-2 border">Required: $\\forall a \\in A, (a, a) \\in R$</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">2. Symmetry vs Antisymmetry</td>
      <td class="p-2 border">Must be <strong>Symmetric</strong>: $(a, b) \\in R \\implies (b, a) \\in R$</td>
      <td class="p-2 border">Must be <strong>Antisymmetric</strong>: $(a, b) \\in R \\wedge (b, a) \\in R \\implies a = b$</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">3. Transitivity</td>
      <td class="p-2 border">Required: $(a, b) \\in R \\wedge (b, c) \\in R \\implies (a, c) \\in R$</td>
      <td class="p-2 border">Required: $(a, b) \\in R \\wedge (b, c) \\in R \\implies (a, c) \\in R$</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Canonical Examples</td>
      <td class="p-2 border">Congruence modulo $m$ ($a \\equiv b \\pmod m$), Equality ($=$)</td>
      <td class="p-2 border">Subset relation ($\\subseteq$), Less than or equal to ($\\le$), Divisibility ($a \\mid b$)</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Fundamental comparison from MTH202 Handouts Page 86–92.',
    urdu_answer: 'ایکویویلنس ریلیشن ریفلیکسو، سیمیٹرک اور ٹرانزیٹو ہوتا ہے، جبکہ پارشل آرڈر (Poset) ریفلیکسو، اینٹی سیمیٹرک اور ٹرانزیٹو ہوتا ہے۔'
  },
  {
    stem: 'How do you test Reflexivity and Symmetry of a relation using its Directed Graph (Digraph)?',
    correct: `<p><strong>Testing Properties using a Directed Graph (Digraph) (MTH202 Handouts Page 78–82):</strong></p>
<ol>
  <li><strong>Testing Reflexivity:</strong>
    <ul>
      <li>In a directed graph, every element of set $A$ is represented by a vertex (node).</li>
      <li>A relation $R$ is <strong>reflexive</strong> if and only if there is a <strong>self-loop</strong> (a directed arrow starting and ending at the exact same vertex) at <strong>every single vertex</strong> in the graph.</li>
      <li>If even one vertex lacks a self-loop, $R$ is not reflexive.</li>
    </ul>
  </li>
  <li><strong>Testing Symmetry:</strong>
    <ul>
      <li>A relation $R$ is <strong>symmetric</strong> if and only if whenever there is a directed edge (arrow) from vertex $u$ to vertex $v$, there is also a return directed edge (arrow) from vertex $v$ back to vertex $u$.</li>
      <li>Equivalently, all connections between distinct vertices must be bidirectional (two opposing arrows or an undirected edge).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Graphical graph-theoretic testing from MTH202 Handouts Page 78–82.',
    urdu_answer: 'ڈائریکٹڈ گراف میں ریفلیکسو کے لیے ہر نوڈ پر سیلف لوپ (loop) ہونا لازمی ہے، اور سیمیٹرک کے لیے ہر تیر کے بدلے واپسی کا الٹ تیر (bidirectional arrow) ہونا ضروری ہے۔'
  }
];

// 6. Long Questions & Comprehensive Proofs
const longs = [
  {
    stem: 'Let A = {0, 1, 2} and R = {(0,2), (1,1), (2,0)} be a relation on A. Determine whether R is reflexive, symmetric, and/or transitive with complete justifications.',
    correct: `<p><strong>Analyzing Properties of $R = \\{(0,2), (1,1), (2,0)\\}$ on $A = \\{0, 1, 2\\}$:</strong></p>

<h4>1. Reflexivity:</h4>
<ul>
  <li>Condition: $\\forall x \\in \\{0, 1, 2\\}, (x, x) \\in R$.</li>
  <li>Evaluation: We observe that $(1, 1) \\in R$, but $(0, 0) \\notin R$ and $(2, 2) \\notin R$.</li>
  <li><strong>Conclusion:</strong> $R$ is <strong>NOT reflexive</strong>.</li>
</ul>

<h4>2. Symmetry:</h4>
<ul>
  <li>Condition: $(x, y) \\in R \\implies (y, x) \\in R$.</li>
  <li>Evaluation:
    <ul>
      <li>$(0, 2) \\in R \\implies (2, 0) \\in R$ (Satisfied)</li>
      <li>$(2, 0) \\in R \\implies (0, 2) \\in R$ (Satisfied)</li>
      <li>$(1, 1) \\in R \\implies (1, 1) \\in R$ (Satisfied)</li>
    </ul>
  </li>
  <li><strong>Conclusion:</strong> $R$ is <strong>SYMMETRIC</strong>.</li>
</ul>

<h4>3. Transitivity:</h4>
<ul>
  <li>Condition: $(x, y) \\in R \\wedge (y, z) \\in R \\implies (x, z) \\in R$.</li>
  <li>Evaluation:
    <ul>
      <li>Consider pairs $(0, 2) \\in R$ and $(2, 0) \\in R$.</li>
      <li>Transitivity requires $(0, 0) \\in R$.</li>
      <li>However, $(0, 0) \\notin R$.</li>
    </ul>
  </li>
  <li><strong>Conclusion:</strong> $R$ is <strong>NOT transitive</strong>.</li>
</ul>

<p><strong>Final Summary:</strong> Relation $R$ is <strong>Symmetric only</strong> (neither reflexive nor transitive) (MTH202 Handouts Page 81).</p>`,
    explanation: 'High-frequency exam problem from MTH202 Handouts Page 81 and Attiq Kundi papers.',
    urdu_answer: 'ریلیشن میں (0,0) اور (2,2) نہیں ہیں اس لیے ناٹ ریفلیکسو؛ (0,2) کا الٹ (2,0) موجود ہے اس لیے سیمیٹرک؛ اور (0,2) اور (2,0) مل کر (0,0) نہیں بناتے اس لیے ناٹ ٹرانزیٹو ہے۔'
  },
  {
    stem: 'Let ℤ be the set of integers and let R be defined as a R b ⟺ a ≡ b (mod 3) (i.e., 3 | (a - b)). Prove that R is an Equivalence Relation.',
    correct: `<p><strong>Proving Congruence Modulo 3 is an Equivalence Relation on $\\mathbb{Z}$:</strong></p>
<p>Given: $a R b \\iff a \\equiv b \\pmod 3 \\iff 3 \\mid (a - b) \\iff a - b = 3k$ for some integer $k \\in \\mathbb{Z}$.</p>

<h4>1. Reflexivity:</h4>
<p>Let $a$ be any arbitrary integer in $\\mathbb{Z}$.</p>
$$a - a = 0 = 3(0)$$
<p>Since $0$ is an integer multiple of $3$, $3 \\mid (a - a) \\implies a \\equiv a \\pmod 3 \\implies a R a$.</p>
<p>Therefore, $R$ is <strong>reflexive</strong>.</p>

<h4>2. Symmetry:</h4>
<p>Let $a, b \\in \\mathbb{Z}$ such that $a R b$.</p>
$$a R b \\implies 3 \\mid (a - b) \\implies a - b = 3k \\quad \\text{for } k \\in \\mathbb{Z}$$
<p>Multiplying both sides by $-1$:</p>
$$b - a = -(a - b) = -(3k) = 3(-k)$$
<p>Since $-k$ is an integer, $3 \\mid (b - a) \\implies b \\equiv a \\pmod 3 \\implies b R a$.</p>
<p>Therefore, $R$ is <strong>symmetric</strong>.</p>

<h4>3. Transitivity:</h4>
<p>Let $a, b, c \\in \\mathbb{Z}$ such that $a R b$ and $b R c$.</p>
$$a R b \\implies a - b = 3r \\quad \\text{and} \\quad b R c \\implies b - c = 3s \\quad (r, s \\in \\mathbb{Z})$$
<p>Adding the two equations:</p>
$$(a - b) + (b - c) = 3r + 3s \\implies a - c = 3(r + s)$$
<p>Since $(r + s) \\in \\mathbb{Z}$, $3 \\mid (a - c) \\implies a \\equiv c \\pmod 3 \\implies a R c$.</p>
<p>Therefore, $R$ is <strong>transitive</strong>.</p>

<h4>Conclusion:</h4>
<p>Since relation $R$ satisfies Reflexivity, Symmetry, and Transitivity, $R$ is an <strong>Equivalence Relation</strong> (MTH202 Handouts Page 86–87).</p>`,
    explanation: 'Classic 5-mark subjective proof from MTH202 Handouts Page 86–87 and Waqar Siddhu papers.',
    urdu_answer: '$a-a=0$ کی وجہ سے ریفلیکسو، $a-b=3k$ کا الٹ $b-a=3(-k)$ ہونے سے سیمیٹرک، اور دونوں مساواتیں جمع کرنے سے $a-c=3(r+s)$ بننے کی وجہ سے ٹرانزیٹو ثابت ہو کر یہ ایکویویلنس ریلیشن بنتا ہے۔'
  },
  {
    stem: 'Let A be a non-empty set and P(A) its power set. Define the subset relation ⊆ on P(A). Prove that ⊆ is a Partial Order Relation (Poset).',
    correct: `<p><strong>Proving Subset Relation $\\subseteq$ is a Partial Order Relation on $P(A)$:</strong></p>
<p>To prove that $(P(A), \\subseteq)$ forms a partially ordered set (poset), we must demonstrate three properties: Reflexivity, Antisymmetry, and Transitivity (MTH202 Handouts Page 91).</p>

<h4>1. Reflexivity:</h4>
<p>Let $X \\in P(A)$ be any subset of $A$.</p>
<p>By the basic definition of subset containment, every element of $X$ is an element of $X$, so $X \\subseteq X$ holds universally for every set.</p>
<p>Therefore, $\\subseteq$ is <strong>reflexive</strong>.</p>

<h4>2. Antisymmetry:</h4>
<p>Let $X, Y \\in P(A)$ such that $X \\subseteq Y$ and $Y \\subseteq X$.</p>
<p>By the fundamental axiom of set extensionality (set equality):</p>
$$X \\subseteq Y \\wedge Y \\subseteq X \\implies X = Y$$
<p>Therefore, $\\subseteq$ is <strong>antisymmetric</strong>.</p>

<h4>3. Transitivity:</h4>
<p>Let $X, Y, Z \\in P(A)$ such that $X \\subseteq Y$ and $Y \\subseteq Z$.</p>
<p>Let $x \\in X$. Since $X \\subseteq Y$, $x \\in Y$. Furthermore, since $Y \\subseteq Z$, $x \\in Z$.</p>
<p>Since every element of $X$ is in $Z$, $X \\subseteq Z$.</p>
<p>Therefore, $\\subseteq$ is <strong>transitive</strong>.</p>

<h4>Conclusion:</h4>
<p>Since $\\subseteq$ is reflexive, antisymmetric, and transitive, $(P(A), \\subseteq)$ is a <strong>Partial Order Relation</strong> (Poset) (MTH202 Handouts Page 91).</p>`,
    explanation: 'Fundamental poset proof from MTH202 Handouts Page 91 and Attiq Kundi papers.',
    urdu_answer: 'ہر سیٹ اپنا سب سیٹ ہے ($X \\subseteq X$) لہٰذا ریفلیکسو، $X \\subseteq Y$ اور $Y \\subseteq X$ سے $X = Y$ نکلتا ہے لہٰذا اینٹی سیمیٹرک، اور ٹرانزیٹو ہونے کی بدولت یہ پارشل آرڈر (Poset) ہے۔'
  },
  {
    stem: 'Problem: Let A = {1, 2, 3} and R = {(1,1), (2,2), (3,3), (1,3)}. State and verify which properties (reflexive, symmetric, antisymmetric, transitive) hold for R.',
    correct: `<p><strong>Evaluating Properties of $R = \\{(1,1), (2,2), (3,3), (1,3)\\}$ on $A = \\{1, 2, 3\\}$:</strong></p>

<h4>1. Reflexivity:</h4>
<p>The pairs $(1, 1), (2, 2), (3, 3)$ all belong to $R$. Since every element $x \\in A$ has $(x, x) \\in R$, $R$ is <strong>REFLEXIVE</strong>.</p>

<h4>2. Symmetry:</h4>
<p>We have $(1, 3) \\in R$, but the reverse pair $(3, 1) \\notin R$. Hence, $R$ is <strong>NOT SYMMETRIC</strong>.</p>

<h4>3. Antisymmetry:</h4>
<p>Antisymmetry condition: If $(x, y) \\in R$ and $(y, x) \\in R$, then $x = y$.</p>
<p>The only symmetric pairs are the diagonal elements $(1,1), (2,2), (3,3)$ where $x = y$. The pair $(1,3)$ has no opposing pair $(3,1)$. Thus, no distinct counterexample exists.</p>
<p>Hence, $R$ is <strong>ANTISYMMETRIC</strong>.</p>

<h4>4. Transitivity:</h4>
<ul>
  <li>$(1, 1) \\in R$ and $(1, 3) \\in R \\implies (1, 3) \\in R$ (Holds)</li>
  <li>$(1, 3) \\in R$ and $(3, 3) \\in R \\implies (1, 3) \\in R$ (Holds)</li>
</ul>
<p>All transitivity combinations hold. Hence, $R$ is <strong>TRANSITIVE</strong>.</p>

<p><strong>Final Verdict:</strong> $R$ is <strong>Reflexive, Antisymmetric, and Transitive</strong> (it is a Partial Order Relation) (MTH202 Mid MCQs All in One Q117).</p>`,
    explanation: 'Detailed verification problem from MTH202 Mid MCQs All in One Q117 and Attiq Kundi.',
    urdu_answer: 'یہ ریلیشن ریفلیکسو، اینٹی سیمیٹرک اور ٹرانزیٹو ہے، مگر (1,3) کا الٹ نہ ہونے کی وجہ سے سیمیٹرک نہیں ہے۔'
  },
  {
    stem: 'Problem: Let R be a relation on ℤ⁺ defined by a R b ⟺ a × b is odd. Determine whether R is reflexive, symmetric, and/or transitive.',
    correct: `<p><strong>Analyzing the Parity Product Relation $a R b \\iff a \\times b \\text{ is odd}$ on $\\mathbb{Z}^+$:</strong></p>
<p>Note: The product of two integers $a \\times b$ is odd if and only if <strong>both</strong> $a$ and $b$ are odd integers.</p>

<h4>1. Reflexivity:</h4>
<ul>
  <li>Pick an even positive integer, say $2 \\in \\mathbb{Z}^+$.</li>
  <li>$2 \\times 2 = 4$ (which is even, not odd).</li>
  <li>Thus $(2, 2) \\notin R$.</li>
  <li><strong>Result:</strong> $R$ is <strong>NOT reflexive</strong>.</li>
</ul>

<h4>2. Symmetry:</h4>
<ul>
  <li>Let $a R b \\implies a \\times b$ is odd.</li>
  <li>Since integer multiplication is commutative ($a \\times b = b \\times a$), $b \\times a$ is also odd.</li>
  <li>Thus $b R a$.</li>
  <li><strong>Result:</strong> $R$ is <strong>SYMMETRIC</strong>.</li>
</ul>

<h4>3. Transitivity:</h4>
<ul>
  <li>Let $a R b$ and $b R c$.</li>
  <li>$a R b \\implies a \\times b$ is odd $\\implies$ both $a$ and $b$ are odd.</li>
  <li>$b R c \\implies b \\times c$ is odd $\\implies$ both $b$ and $c$ are odd.</li>
  <li>Since $a$ is odd and $c$ is odd, their product $a \\times c$ must be odd.</li>
  <li>Thus $a R c$.</li>
  <li><strong>Result:</strong> $R$ is <strong>TRANSITIVE</strong>.</li>
</ul>

<p><strong>Final Answer:</strong> $R$ is <strong>Symmetric and Transitive</strong>, but <strong>not Reflexive</strong> (MTH202 Handouts Page 80).</p>`,
    explanation: 'Integer parity property proof from MTH202 Handouts Page 80.',
    urdu_answer: '2 ضرب 2 جفت ہے اس لیے ناٹ ریفلیکسو؛ ضرب کمیوٹیٹو ہے اس لیے سیمیٹرک؛ اور دو طاق اعداد کا حاصل ضرب ہمیشہ طاق ہوتا ہے اس لیے ٹرانزیٹو ہے۔'
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
    insMcq.run(lec12.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec12.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec12.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 12:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Problem Proofs: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 12: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

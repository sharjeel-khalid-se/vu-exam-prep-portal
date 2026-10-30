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

// 2. Create or fetch Lecture 8
let lec8 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 8").get(mth202.id);
if (!lec8) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 8, 'Venn Diagrams & Set Operations: Union, Intersection, Difference & Membership Tables')
  `).run(mth202.id);
  lec8 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 8 with ID: ${lec8.id}`);
} else {
  console.log(`MTH202 Lecture 8 found with ID: ${lec8.id}`);
}

// 3. Clear existing questions for Lecture 8 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec8.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 8.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'If A and B are two sets, then the set containing all those elements that belong to A or to B or to both is called __________.',
    options: {
      a: '$A \\cup B$',
      b: '$A \\cap B$',
      c: '$A - B$',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'The union of two sets $A$ and $B$, denoted $A \\cup B$, is defined as the set of all elements that belong to $A$, or to $B$, or to both: $A \\cup B = \\{x \\in U \\mid x \\in A \\vee x \\in B\\}$ (MTH202 Handouts Page 41). Appeared 12+ times across Moaaz, Paper 4, and Team Hadi.',
    urdu_answer: 'سیٹ A اور B کا یونین ($A \\cup B$) ان تمام ارکان کا مجموعہ ہوتا ہے جو A میں ہوں، B میں ہوں یا دونوں میں ہوں۔'
  },
  {
    stem: 'If A and B are two sets, then the set which contains all those elements that belong to both A and B is called __________.',
    options: {
      a: '$A \\cup B$',
      b: '$A \\cap B$',
      c: '$A - B$',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'The intersection of two sets $A$ and $B$, denoted $A \\cap B$, is the set containing elements common to both sets: $A \\cap B = \\{x \\in U \\mid x \\in A \\wedge x \\in B\\}$ (MTH202 Handouts Page 41). Appeared 10+ times in Paper 4 and All in One.',
    urdu_answer: 'دونوں سیٹس A اور B کے تمام مشترکہ ارکان کے سیٹ کو تقاطع یعنی انٹرسیکشن ($A \\cap B$) کہتے ہیں۔'
  },
  {
    stem: 'If A and B are two sets, then the set of all elements that belong to A but not to B is called __________.',
    options: {
      a: '$A \\cup B$',
      b: '$A \\cap B$',
      c: '$A - B$',
      d: 'None of these'
    },
    correct: 'c',
    explanation: 'The set difference (relative complement) of $B$ in $A$, denoted $A - B$ or $A \\setminus B$, is the set of elements in $A$ that do not belong to $B$: $A - B = \\{x \\in U \\mid x \\in A \\wedge x \\notin B\\}$ (MTH202 Handouts Page 42). Appeared 8+ times.',
    urdu_answer: 'سیٹ A کے ان تمام ارکان کا سیٹ جو B میں شامل نہ ہوں، فرق یعنی $A - B$ کہلاتا ہے۔'
  },
  {
    stem: 'The operations of intersection and union on sets are commutative (i.e., A ∪ B = B ∪ A and A ∩ B = B ∩ A).',
    options: {
      a: 'True',
      b: 'False',
      c: 'Depends on the sets given'
    },
    correct: 'a',
    explanation: 'Union and intersection operations are strictly commutative for all sets: changing the order of the sets does not change the resulting elements: $A \\cup B = B \\cup A$ and $A \\cap B = B \\cap A$ (MTH202 Handouts Page 41). Appeared 10+ times in Moaaz and Grand Quiz 2020.',
    urdu_answer: 'یہ بیان بالکل درست (True) ہے؛ سیٹوں کے یونین اور انٹرسیکشن میں خاصیتِ مبادلہ (Commutative Law) پائی جاتی ہے۔'
  },
  {
    stem: 'Set difference is commutative (i.e., A - B = B - A).',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'Set difference is NOT commutative. In general, $A - B \\neq B - A$. For example, if $A = \\{1, 2\\}$ and $B = \\{2, 3\\}$, then $A - B = \\{1\\}$ while $B - A = \\{3\\}$ (MTH202 Handouts Page 42).',
    urdu_answer: 'یہ بیان غلط (False) ہے کیونکہ سیٹوں کے فرق میں خاصیتِ مبادلہ نہیں ہوتی ($A - B \\neq B - A$)۔'
  },
  {
    stem: 'If A ∩ B = ∅, then A and B are called __________.',
    options: {
      a: 'Disjoint',
      b: 'Overlapping',
      c: 'Universal',
      d: 'Subsets'
    },
    correct: 'a',
    explanation: 'Two sets $A$ and $B$ are defined as disjoint (mutually exclusive) if and only if they share no common elements, meaning their intersection is the empty set: $A \\cap B = \\emptyset$ (MTH202 Handouts Page 41). Appeared 12+ times across Team Hadi and All in One.',
    urdu_answer: 'اگر دو سیٹس کا انٹرسیکشن خالی سیٹ ہو ($A \\cap B = \\emptyset$) تو وہ غیر مشترک یعنی ڈس جوائنٹ (Disjoint) کہلاتے ہیں۔'
  },
  {
    stem: 'If A ∩ B ≠ ∅, then A and B are called __________.',
    options: {
      a: 'Disjoint',
      b: 'Overlapping',
      c: 'Universal',
      d: 'Subsets'
    },
    correct: 'b',
    explanation: 'Two sets $A$ and $B$ are said to be overlapping if they contain at least one element in common, which means $A \\cap B \\neq \\emptyset$ (MTH202 Handouts Page 41). Appeared in All in One Q32.',
    urdu_answer: 'اگر دو سیٹس میں کم از کم ایک رکن مشترک ہو ($A \\cap B \\neq \\emptyset$) تو وہ اوورلیپنگ (Overlapping) سیٹس کہلاتے ہیں۔'
  },
  {
    stem: 'Let U be the universal set and A is its subset, then A ∪ Aᶜ = __________.',
    options: {
      a: '$A$',
      b: '$A^c$',
      c: '$\\emptyset$',
      d: '$U$'
    },
    correct: 'd',
    explanation: 'By the Complement Law for sets, the union of any set $A$ and its complement $A^c$ contains all elements in the universe: $A \\cup A^c = U$ (MTH202 Handouts Page 42). Appeared 10+ times in Waqar, Paper 2, Paper 5, and Team Hadi.',
    urdu_answer: 'کسی سیٹ اور اس کے کمپلیمنٹ کا یونین ہمیشہ یونیورسل سیٹ ($U$) کے برابر ہوتا ہے۔'
  },
  {
    stem: 'Let U be the universal set and A is its subset, then A ∩ Aᶜ = __________.',
    options: {
      a: '$A$',
      b: '$A^c$',
      c: '$\\emptyset$',
      d: '$U$'
    },
    correct: 'c',
    explanation: 'By the Complement Law, no element can belong to both set $A$ and its complement $A^c$ simultaneously. Therefore, their intersection is empty: $A \\cap A^c = \\emptyset$ (MTH202 Handouts Page 42). Appeared 8+ times in All in One and Handouts.',
    urdu_answer: 'کسی سیٹ اور اس کے کمپلیمنٹ میں کوئی رکن مشترک نہیں ہوتا، اس لیے ان کا تقاطع خالی سیٹ ($\\emptyset$) ہوتا ہے۔'
  },
  {
    stem: 'A - B is logically equivalent to __________.',
    options: {
      a: '$A \\cap B^c$',
      b: '$A^c \\cap B$',
      c: '$A \\cup B^c$',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'By the Set Difference Law, subtracting set $B$ from set $A$ is algebraically equivalent to intersecting $A$ with the complement of $B$: $A - B = A \\cap B^c$ (MTH202 Handouts Page 45). Appeared 8+ times in All in One Q216.',
    urdu_answer: 'سیٹوں کے فرق کا بنیادی فارمولا $A - B = A \\cap B^c$ کے مساوی ہوتا ہے۔'
  },
  {
    stem: 'If A ∪ B = A, then A ∩ B = __________.',
    options: {
      a: '$B^c$',
      b: '$A$',
      c: '$B$'
    },
    correct: 'c',
    explanation: 'If $A \\cup B = A$, then every element of $B$ must already be contained in $A$, which means $B \\subseteq A$. When $B \\subseteq A$, their intersection is simply the smaller set: $A \\cap B = B$ (MTH202 Handouts Page 41). Appeared 6+ times in Waqar, Paper 1, Paper 5, and Paper 7.',
    urdu_answer: 'اگر $A \\cup B = A$ ہو تو اس کا مطلب ہے کہ $B \\subseteq A$ ہے، لہٰذا ان کا مشترکہ حصہ $A \\cap B = B$ ہوگا۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Set Union, Intersection, Difference, and Complement along with their symbolic set-builder notations.',
    correct: `<p><strong>Fundamental Set Operations (MTH202 Handouts Page 41–43):</strong></p>
<ol>
  <li><strong>Union ($A \\cup B$):</strong> The set containing all elements belonging to $A$ or to $B$ or to both.
    $$A \\cup B = \\{x \\in U \\mid x \\in A \\vee x \\in B\\}$$
  </li>
  <li><strong>Intersection ($A \\cap B$):</strong> The set containing elements that belong to both $A$ and $B$ simultaneously.
    $$A \\cap B = \\{x \\in U \\mid x \\in A \\wedge x \\in B\\}$$
  </li>
  <li><strong>Set Difference ($A - B$ or $A \\setminus B$):</strong> The relative complement of $B$ in $A$, containing elements that belong to $A$ but do NOT belong to $B$.
    $$A - B = \\{x \\in U \\mid x \\in A \\wedge x \\notin B\\}$$
  </li>
  <li><strong>Complement ($A^c$ or $A'$):</strong> The absolute complement containing all elements in the universal set $U$ that do not belong to $A$.
    $$A^c = \\{x \\in U \\mid x \\notin A\\} = U - A$$
  </li>
</ol>`,
    explanation: 'Basic operations and set-builder notation from MTH202 Handouts Page 41–43.',
    urdu_answer: 'یونین ($A \\cup B$) میں تمام ارکان، انٹرسیکشن ($A \\cap B$) میں مشترکہ ارکان، ڈفرنس ($A - B$) میں وہ ارکان جو A میں ہوں مگر B میں نہ ہوں، اور کمپلیمنٹ ($A^c$) میں $U - A$ کے تمام ارکان شامل ہوتے ہیں۔'
  },
  {
    stem: 'Construct the Membership Tables for Union, Intersection, Set Difference, and Complement.',
    correct: `<p><strong>Membership Tables for Set Operations (MTH202 Handouts Page 41–43):</strong></p>
<p>In membership tables, $1$ denotes membership in the set ($x \\in S$) and $0$ denotes non-membership ($x \\notin S$).</p>

<h4>1. Binary Operations ($A \\cup B, A \\cap B, A - B$):</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$A$</th>
      <th class="p-2 border">$B$</th>
      <th class="p-2 border font-bold">$A \\cup B$</th>
      <th class="p-2 border font-bold">$A \\cap B$</th>
      <th class="p-2 border font-bold">$A - B$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">1</td>
      <td class="p-2 border font-bold">1</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">1</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold">1</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">1</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
  </tbody>
</table>

<h4>2. Unary Operation Complement ($A^c$):</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$A$</th>
      <th class="p-2 border font-bold">$A^c$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">1</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive membership table specifications from MTH202 Handouts Page 41–43 and Adil Alvi subjective papers.',
    urdu_answer: 'ممبرشپ ٹیبل میں 1 کا مطلب رکن ہونا اور 0 کا مطلب رکن نہ ہونا ہے۔ یونین میں کم از کم ایک 1، انٹرسیکشن میں دونوں 1، ڈفرنس میں صرف پہلا 1، اور کمپلیمنٹ میں الٹ ہو جاتا ہے۔'
  },
  {
    stem: 'Prove that A - B = A ∩ Bᶜ using a Membership Table.',
    correct: `<p><strong>Proving Set Difference Identity $A - B = A \\cap B^c$:</strong></p>

<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$A$</th>
      <th class="p-2 border">$B$</th>
      <th class="p-2 border font-bold bg-amber-50">Column 3: $A - B$</th>
      <th class="p-2 border">$B^c$</th>
      <th class="p-2 border font-bold bg-amber-50">Column 5: $A \\cap B^c$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
  </tbody>
</table>

<p><strong>Conclusion:</strong></p>
<p>Since the values in <strong>Column 3 ($A - B$)</strong> and <strong>Column 5 ($A \\cap B^c$)</strong> are identical for every possible combination of membership values $(0, 1, 0, 0)$, it is mathematically established that:</p>
$$\\mathbf{A - B = A \\cap B^c}$$`,
    explanation: 'Standard 3-mark proof from MTH202 Handouts Page 45.',
    urdu_answer: 'چونکہ ممبرشپ ٹیبل میں $A - B$ اور $A \\cap B^c$ کے کالمز تمام قطاروں میں یکساں ہیں، اس لیے یہ ثابت ہو گیا کہ $A - B = A \\cap B^c$۔'
  },
  {
    stem: 'Problem: Given U = {1, 2, 3, 4, 5}, B = {1}, with conditions A ∪ B = U and A ∩ B = ∅. Find set A.',
    correct: `<p><strong>Finding Set A from Given Conditions:</strong></p>
<ol>
  <li><strong>Given:</strong>
    <ul>
      <li>Universal set: $U = \\{1, 2, 3, 4, 5\\}$</li>
      <li>Subset: $B = \\{1\\}$</li>
      <li>$A \\cup B = U$</li>
      <li>$A \\cap B = \\emptyset$</li>
    </ul>
  </li>
  <li><strong>Deduction:</strong>
    <p>Because $A \\cup B = U$ and $A \\cap B = \\emptyset$, by definition sets $A$ and $B$ form a partition of $U$, meaning $A$ is the exact set complement of $B$:</p>
    $$A = B^c = U - B$$
  </li>
  <li><strong>Calculation:</strong>
    $$A = \\{1, 2, 3, 4, 5\\} - \\{1\\} = \\mathbf{\\{2, 3, 4, 5\\}}$$
  </li>
</ol>`,
    explanation: 'Set equation problem from MTH202 Handouts Page 43.',
    urdu_answer: 'چونکہ دونوں کا یونین U اور تقاطع خالی ہے، اس لیے A دراصل B کا کمپلیمنٹ ہے: $A = U - B = \\{2, 3, 4, 5\\}$۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: "Prove De Morgan's Law for Sets: (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ using a Membership Table.",
    correct: `<p><strong>Proving De Morgan's Law: $(A \\cap B)^c = A^c \\cup B^c$:</strong></p>

<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$A$</th>
      <th class="p-2 border">$B$</th>
      <th class="p-2 border">$A \\cap B$</th>
      <th class="p-2 border font-bold bg-amber-50">Col 4: $(A \\cap B)^c$</th>
      <th class="p-2 border">$A^c$</th>
      <th class="p-2 border">$B^c$</th>
      <th class="p-2 border font-bold bg-amber-50">Col 7: $A^c \\cup B^c$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
  </tbody>
</table>

<p><strong>Evaluation &amp; Conclusion:</strong></p>
<ul>
  <li>Notice that the entries in <strong>Column 4 [$(A \\cap B)^c$]</strong>: $(0, 1, 1, 1)$.</li>
  <li>Notice that the entries in <strong>Column 7 [$A^c \\cup B^c$]</strong>: $(0, 1, 1, 1)$.</li>
  <li>Because both columns are identical across all rows, the set identity holds true:
    $$\\mathbf{(A \\cap B)^c = A^c \\cup B^c}$$
  </li>
</ul>`,
    explanation: 'High-frequency 5-mark subjective question from MTH202 Handouts Page 45 and Sadia solved papers.',
    urdu_answer: 'ممبرشپ ٹیبل کے کالم 4 اور کالم 7 کی تمام قیمتیں (0, 1, 1, 1) ایک جیسی ہیں، جس سے ڈی مورگن کا قانون ثابت ہوتا ہے۔'
  },
  {
    stem: 'Prove that A - (A - B) = A ∩ B using Venn Diagrams with region breakdown.',
    correct: `<p><strong>Venn Diagram Proof: $A - (A - B) = A \\cap B$:</strong></p>

<h4>1. Region Labeling:</h4>
<p>In a standard two-set Venn diagram inside universal set rectangle $U$:</p>
<ul>
  <li><strong>Region 1:</strong> Elements in $A$ only ($A - B$).</li>
  <li><strong>Region 2:</strong> Elements shared by both $A$ and $B$ ($A \\cap B$).</li>
  <li><strong>Region 3:</strong> Elements in $B$ only ($B - A$).</li>
  <li><strong>Region 4:</strong> Elements outside both sets ($(A \\cup B)^c$).</li>
</ul>

<h4>2. Left-Hand Side (LHS) Evaluation:</h4>
<ol>
  <li>Set $A$ consists of regions:
    $$\\text{Region } A = \\{1, 2\\}$$
  </li>
  <li>The difference $(A - B)$ represents elements exclusively in $A$:
    $$(A - B) = \\{1\\}$$
  </li>
  <li>Subtracting $(A - B)$ from $A$ yields:
    $$A - (A - B) = \\{1, 2\\} - \\{1\\} = \\mathbf{\\{2\\}}$$
  </li>
</ol>

<h4>3. Right-Hand Side (RHS) Evaluation:</h4>
<p>The intersection of $A$ and $B$ is the common overlap region:</p>
$$A \\cap B = \\mathbf{\\{2\\}}$$

<h4>4. Conclusion:</h4>
<p>Both LHS and RHS correspond to the exact same region (Region 2) in the Venn diagram. Therefore:</p>
$$\\mathbf{A - (A - B) = A \\cap B}$$`,
    explanation: 'Step-by-step geometric region proof from MTH202 Handouts Page 44.',
    urdu_answer: 'وین ڈایاگرام کے مطابق سیٹ A ریجن {1, 2} ہے اور $A-B$ ریجن {1} ہے۔ جب A میں سے اسے نکالیں تو صرف مشترکہ ریجن {2} بچتا ہے جو کہ $A \\cap B$ ہے۔'
  },
  {
    stem: 'Describe the exact shaded regions in Venn Diagrams with 3 sets A, B, C for:\na) (A ∩ B) ∩ Cᶜ\nb) Aᶜ ∪ (B ∪ C)\nc) (A - B) ∩ C',
    correct: `<p><strong>Region Identification in a 3-Set Venn Diagram ($A, B, C$ inside $U$):</strong></p>

<h4>Part (a): $(A \\cap B) \\cap C^c$</h4>
<ul>
  <li><strong>Definition:</strong> Elements belonging to both $A$ and $B$, but lying outside set $C$.</li>
  <li><strong>Shaded Area:</strong> Shade exclusively the common overlap region between circle $A$ and circle $B$ that does NOT overlap with circle $C$ (often labeled Region 2).</li>
</ul>

<h4>Part (b): $A^c \\cup (B \\cup C)$</h4>
<ul>
  <li><strong>Definition:</strong> Elements that are outside $A$, OR inside $B$, OR inside $C$.</li>
  <li><strong>Shaded Area:</strong> Shade the entire universal rectangle $U$, <em>except</em> the exclusive portion of circle $A$ that does not intersect with $B$ or $C$ (everything except Region 1).</li>
</ul>

<h4>Part (c): $(A - B) \\cap C$</h4>
<ul>
  <li><strong>Definition:</strong> Elements in $A$ that are not in $B$, but must belong to $C$.</li>
  <li><strong>Shaded Area:</strong> Shade the region where circle $A$ overlaps circle $C$, excluding any portion belonging to circle $B$ (often labeled Region 4).</li>
</ul>`,
    explanation: '5-mark Venn diagram question from MTH202 Handouts Page 43–44 and Adil Alvi Dec 2019 paper.',
    urdu_answer: 'تین سیٹوں والے وین ڈایاگرام میں: (a) A اور B کا مشترکہ حصہ جو C سے باہر ہو، (b) صرف A کے اکیلے حصے کو چھوڑ کر پورا یونیورسل سیٹ، اور (c) A اور C کا مشترکہ حصہ جو B سے باہر ہو۔'
  },
  {
    stem: 'Problem: Given U = {1, 2, 3, ..., 10}, X = {1, 2, 3, 4, 5}, Y = {y | y = 2x, x ∈ X} = {2, 4, 6, 8, 10}, and Z = {z | z² - 9z + 14 = 0} = {2, 7}.\nEnumerate the following set operations step-by-step:\n1) X ∩ Y\n2) Y ∪ Z\n3) X - Z\n4) Yᶜ\n5) Xᶜ - Zᶜ',
    correct: `<p><strong>Step-by-Step Set Operations Enumeration:</strong></p>
<p>Given sets:</p>
<ul>
  <li>$U = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$</li>
  <li>$X = \\{1, 2, 3, 4, 5\\}$</li>
  <li>$Y = \\{2, 4, 6, 8, 10\\}$</li>
  <li>$Z = \\{2, 7\\}$ (Roots of $z^2 - 9z + 14 = (z-2)(z-7) = 0$)</li>
</ul>

<h4>Calculations:</h4>
<ol>
  <li><strong>$X \\cap Y$:</strong> Elements in both $X$ and $Y$:
    $$X \\cap Y = \\{1, 2, 3, 4, 5\\} \\cap \\{2, 4, 6, 8, 10\\} = \\mathbf{\\{2, 4\\}}$$
  </li>
  <li><strong>$Y \\cup Z$:</strong> Elements in $Y$ or $Z$:
    $$Y \\cup Z = \\{2, 4, 6, 8, 10\\} \\cup \\{2, 7\\} = \\mathbf{\\{2, 4, 6, 7, 8, 10\\}}$$
  </li>
  <li><strong>$X - Z$:</strong> Elements in $X$ removing those in $Z$:
    $$X - Z = \\{1, 2, 3, 4, 5\\} - \\{2, 7\\} = \\mathbf{\\{1, 3, 4, 5\\}}$$
  </li>
  <li><strong>$Y^c$:</strong> Elements in $U$ not in $Y$:
    $$Y^c = U - Y = \\{1, 2, \\dots, 10\\} - \\{2, 4, 6, 8, 10\\} = \\mathbf{\\{1, 3, 5, 7, 9\\}}$$
  </li>
  <li><strong>$X^c - Z^c$:</strong>
    <ul>
      <li>$X^c = U - X = \\{6, 7, 8, 9, 10\\}$</li>
      <li>$Z^c = U - Z = \\{1, 3, 4, 5, 6, 8, 9, 10\\}$</li>
      <li>$$X^c - Z^c = \\{6, 7, 8, 9, 10\\} - \\{1, 3, 4, 5, 6, 8, 9, 10\\} = \\mathbf{\\{7\\}}$$</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Comprehensive multi-part set enumeration problem from MTH202 Handouts Page 42.',
    urdu_answer: 'مرحلہ وار نتائج: $X \\cap Y = \\{2, 4\\}$، $Y \\cup Z = \\{2, 4, 6, 7, 8, 10\\}$، $X - Z = \\{1, 3, 4, 5\\}$، $Y^c = \\{1, 3, 5, 7, 9\\}$، اور $X^c - Z^c = \\{7\\}$۔'
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
    insMcq.run(lec8.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec8.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec8.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 8:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Problem Questions: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 8: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

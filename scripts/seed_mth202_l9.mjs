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

// 2. Create or fetch Lecture 9
let lec9 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 9").get(mth202.id);
if (!lec9) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 9, 'Set Identities, Algebraic Proofs, De Morgan & Absorption Laws')
  `).run(mth202.id);
  lec9 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 9 with ID: ${lec9.id}`);
} else {
  console.log(`MTH202 Lecture 9 found with ID: ${lec9.id}`);
}

// 3. Clear existing questions for Lecture 9 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec9.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 9.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'For three sets A, B, C, the identity A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) is called __________.',
    options: {
      a: 'Distributivity of intersection over union',
      b: 'Distributivity of union over intersection',
      c: 'None of these',
      d: 'Distributivity Law'
    },
    correct: 'd',
    explanation: 'The identity $A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)$ is the Distributive Law of set intersection over union. In VU past paper keys, "Distributivity Law" is designated (MTH202 Handouts Page 46). Appeared 12+ times across Moaaz, Junaid, and Latest Solved papers.',
    urdu_answer: 'یہ قانون ڈسٹریبیوٹو لاء (خاصیتِ تقسیم) کہلاتا ہے جس میں انٹرسیکشن یونین پر تقسیم ہو رہا ہے۔'
  },
  {
    stem: 'Let A, B, C be subsets of a universal set U. Then (A ∪ B) ∪ C is equal to __________.',
    options: {
      a: '$(A \\cap B) \\cup C$',
      b: '$(A \\cup B) \\cap C$',
      c: '$\\emptyset$',
      d: '$A \\cup (B \\cup C)$'
    },
    correct: 'd',
    explanation: 'By the Associative Law of Union, the grouping of sets under union operation does not change the result: $(A \\cup B) \\cup C = A \\cup (B \\cup C)$ (MTH202 Handouts Page 46). Appeared 10+ times in Moaaz, Junaid, and Paper 4.',
    urdu_answer: 'یونین کے ایسوسی ایٹو لاء (خاصیتِ تلازم) کے تحت $(A \\cup B) \\cup C = A \\cup (B \\cup C)$ ہوتا ہے۔'
  },
  {
    stem: 'Associative law of Intersection for three sets A, B, C is __________.',
    options: {
      a: '$A \\rightarrow (B \\rightarrow C) = (A \\rightarrow B) \\rightarrow C$',
      b: '$A \\cap (B \\cap C) = (A \\cap B) \\cap C$',
      c: '$A \\rightarrow (B \\rightarrow C) = (A \\rightarrow B) \\rightarrow (A \\rightarrow B)$',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'The Associative Law for set intersection states that $A \\cap (B \\cap C) = (A \\cap B) \\cap C$ (MTH202 Handouts Page 46). Appeared 8+ times in Sadia and Waqar past papers.',
    urdu_answer: 'انٹرسیکشن کے ایسوسی ایٹو قانون کے مطابق $A \\cap (B \\cap C) = (A \\cap B) \\cap C$ ہوتا ہے۔'
  },
  {
    stem: '(A ∩ B)ᶜ = (Aᶜ ∩ Bᶜ) is __________.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'This statement is FALSE. By De Morgan\'s Law, the complement of an intersection is the union of the complements: $(A \\cap B)^c = A^c \\cup B^c$ (MTH202 Handouts Page 46). Appeared 8+ times in Sadia and Waqar files.',
    urdu_answer: 'یہ بیان غلط (False) ہے کیونکہ ڈی مورگن کے قانون کے مطابق $(A \\cap B)^c = A^c \\cup B^c$ بنتا ہے۔'
  },
  {
    stem: 'Let A be a subset of universal set U, then double complement law is __________.',
    options: {
      a: '$(A^c)^c = A^c$',
      b: '$(A^c)^c = A$',
      c: '$(A^c)^c = U$',
      d: '$(A^c)^c = \\emptyset$'
    },
    correct: 'b',
    explanation: 'The Double Complement Law states that taking the complement of a complement returns the original set: $(A^c)^c = A$ (MTH202 Handouts Page 46). Appeared 10+ times in All in One and Formulas sheet.',
    urdu_answer: 'ڈبل کمپلیمنٹ لاء کے مطابق کمپلیمنٹ کا دوبارہ کمپلیمنٹ لینے سے اصل سیٹ حاصل ہوتا ہے یعنی $(A^c)^c = A$۔'
  },
  {
    stem: 'The alternative representation for Set Difference is A - B = __________.',
    options: {
      a: '$A \\cap B^c$',
      b: '$A^c \\cap B$',
      c: '$A \\cup B^c$',
      d: '$A^c \\cup B$'
    },
    correct: 'a',
    explanation: 'By the Set Difference Law, subtracting set $B$ from set $A$ is algebraically equivalent to the intersection of $A$ with the complement of $B$: $A - B = A \\cap B^c$ (MTH202 Handouts Page 46). Appeared 8+ times in All in One Q216.',
    urdu_answer: 'سیٹوں کے فرق کو الجبرائی طور پر $A - B = A \\cap B^c$ لکھا جاتا ہے۔'
  },
  {
    stem: 'The set identity A ∪ (A ∩ B) = A describes __________.',
    options: {
      a: 'Idempotent Law',
      b: 'Absorption Law',
      c: 'Identity Law',
      d: 'Universal Bound Law'
    },
    correct: 'b',
    explanation: 'The identity $A \\cup (A \\cap B) = A$ and its dual $A \\cap (A \\cup B) = A$ are defined as the Absorption Laws in Boolean algebra and set theory (MTH202 Handouts Page 46).',
    urdu_answer: 'یہ فارمولا ابسورپشن لاء (Absorption Law) کہلاتا ہے۔'
  },
  {
    stem: 'A ∪ B = B ∪ A and A ∩ B = B ∩ A are called __________.',
    options: {
      a: 'Idempotent Laws',
      b: 'Commutative Laws',
      c: 'Associative Laws',
      d: 'Distributive Laws'
    },
    correct: 'b',
    explanation: 'Commutative Laws state that the order of the sets in union or intersection operations does not affect the outcome: $A \\cup B = B \\cup A$ and $A \\cap B = B \\cap A$ (MTH202 Handouts Page 46). Appeared in Grand Quiz 2020.',
    urdu_answer: 'ترتیب بدلنے سے فرق نہ پڑنے کو کمیوٹیٹو لاز (خاصیتِ مبادلہ) کہا جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: "State De Morgan's Laws for Sets in both union and intersection forms.",
    correct: `<p><strong>De Morgan's Laws for Set Theory (MTH202 Handouts Page 46):</strong></p>
<ol>
  <li><strong>First Law (Complement of Union):</strong><br>
    The complement of the union of two sets is the intersection of their individual complements:
    $$(A \\cup B)^c = A^c \\cap B^c$$
  </li>
  <li><strong>Second Law (Complement of Intersection):</strong><br>
    The complement of the intersection of two sets is the union of their individual complements:
    $$(A \\cap B)^c = A^c \\cup B^c$$
  </li>
</ol>`,
    explanation: 'Standard 2-mark subjective question from Adil Alvi Dec 21, 2016 paper Q2.',
    urdu_answer: 'ڈی مورگن کے دو قوانین ہیں: 1. $(A \\cup B)^c = A^c \\cap B^c$ اور 2. $(A \\cap B)^c = A^c \\cup B^c$۔'
  },
  {
    stem: 'List the Fundamental Set Identities used in Set Algebra.',
    correct: `<p><strong>Fundamental Set Identities (MTH202 Handouts Page 46):</strong></p>
<ul>
  <li><strong>Commutative Laws:</strong> $A \\cup B = B \\cup A$, $\\quad A \\cap B = B \\cap A$</li>
  <li><strong>Associative Laws:</strong> $(A \\cup B) \\cup C = A \\cup (B \\cup C)$, $\\quad (A \\cap B) \\cap C = A \\cap (B \\cap C)$</li>
  <li><strong>Distributive Laws:</strong> $A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)$, $\\quad A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)$</li>
  <li><strong>Identity Laws:</strong> $A \\cup \\emptyset = A$, $\\quad A \\cap U = A$</li>
  <li><strong>Complement Laws:</strong> $A \\cup A^c = U$, $\\quad A \\cap A^c = \\emptyset$</li>
  <li><strong>Double Complement Law:</strong> $(A^c)^c = A$</li>
  <li><strong>Idempotent Laws:</strong> $A \\cup A = A$, $\\quad A \\cap A = A$</li>
  <li><strong>De Morgan's Laws:</strong> $(A \\cup B)^c = A^c \\cap B^c$, $\\quad (A \\cap B)^c = A^c \\cup B^c$</li>
  <li><strong>Absorption Laws:</strong> $A \\cup (A \\cap B) = A$, $\\quad A \\cap (A \\cup B) = A$</li>
  <li><strong>Set Difference Law:</strong> $A - B = A \\cap B^c$</li>
</ul>`,
    explanation: 'Core reference formula table from MTH202 Handouts Page 46.',
    urdu_answer: 'سیٹ الجبرا کے بنیادی قوانین میں کمیوٹیٹو، ایسوسی ایٹو، ڈسٹریبیوٹو، آئیڈینٹٹی، کمپلیمنٹ، ڈی مورگن اور ابسورپشن قوانین شامل ہیں۔'
  },
  {
    stem: 'Prove that A ⊆ A ∪ B using the Element Method.',
    correct: `<p><strong>Proof: $A \\subseteq A \\cup B$ by Element Method (MTH202 Handouts Page 46):</strong></p>
<ol>
  <li>Let $x$ be an arbitrary element chosen from set $A$:
    $$x \\in A$$
  </li>
  <li>By the logical rule of disjunction addition, if statement $P$ is true, then $P \\vee Q$ is true for any statement $Q$:
    $$x \\in A \\implies x \\in A \\vee x \\in B$$
  </li>
  <li>By the mathematical definition of set union:
    $$x \\in A \\vee x \\in B \\implies x \\in (A \\cup B)$$
  </li>
  <li>Since every arbitrary element $x \\in A$ is proved to be in $(A \\cup B)$, by subset definition:
    $$\\mathbf{A \\subseteq A \\cup B}$$
  </li>
</ol>`,
    explanation: 'Standard deductive proof from MTH202 Handouts Page 46.',
    urdu_answer: 'اگر $x \\in A$ ہو تو منطق کے تحت $x \\in A$ یا $x \\in B$ ہوگا، جس سے $x \\in A \\cup B$ ثابت ہوتا ہے۔ لہٰذا $A \\subseteq A \\cup B$۔'
  },
  {
    stem: 'Simplify the expression (Bᶜ ∪ (Bᶜ - A))ᶜ using set identities step-by-step.',
    correct: `<p><strong>Simplifying $(B^c \\cup (B^c - A))^c$ using Set Identities:</strong></p>
<ol>
  <li><strong>Apply Set Difference Law to $(B^c - A)$:</strong>
    $$B^c - A = B^c \\cap A^c$$
    The expression becomes:
    $$\\left[ B^c \\cup (B^c \\cap A^c) \\right]^c$$
  </li>
  <li><strong>Apply Absorption Law inside the brackets:</strong>
    <p>Recall the Absorption Law: $X \\cup (X \\cap Y) = X$. Here with $X = B^c$ and $Y = A^c$:</p>
    $$B^c \\cup (B^c \\cap A^c) = B^c$$
  </li>
  <li><strong>Substitute back into complement:</strong>
    $$(B^c)^c$$
  </li>
  <li><strong>Apply Double Complement Law:</strong>
    $$(B^c)^c = \\mathbf{B}$$
  </li>
</ol>
<p><strong>Final Simplified Result:</strong> $\\mathbf{B}$ (MTH202 Handouts Page 48).</p>`,
    explanation: 'Set identity simplification problem from MTH202 Handouts Page 48.',
    urdu_answer: 'پہلے $B^c - A = B^c \\cap A^c$ لکھیں، پھر ابسورپشن لاء سے بریکٹ $B^c$ بن جائے گی، اور ڈبل کمپلیمنٹ لینے سے جواب صرف B بچے گا۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: "Prove De Morgan's Law (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ algebraically using the Element Method.",
    correct: `<p><strong>Algebraic Element Method Proof: $(A \\cup B)^c = A^c \\cap B^c$ (MTH202 Handouts Page 47):</strong></p>
<p>To prove two sets are equal, we must demonstrate mutual subset containment: (1) $(A \\cup B)^c \\subseteq A^c \\cap B^c$, and (2) $A^c \\cap B^c \\subseteq (A \\cup B)^c$.</p>

<h4>Part 1: Show $(A \\cup B)^c \\subseteq A^c \\cap B^c$:</h4>
<ol>
  <li>Let $x \\in (A \\cup B)^c$.</li>
  <li>By definition of set complement: $x \\notin (A \\cup B)$.</li>
  <li>By negation of union: $x$ does not belong to $A$ AND $x$ does not belong to $B$ ($x \\notin A \\wedge x \\notin B$).</li>
  <li>By definition of complement: $x \\in A^c$ and $x \\in B^c$.</li>
  <li>By definition of intersection: $x \\in (A^c \\cap B^c)$.</li>
  <li>Therefore:
    $$(A \\cup B)^c \\subseteq A^c \\cap B^c \\quad \\dots (1)$$
  </li>
</ol>

<h4>Part 2: Show $A^c \\cap B^c \\subseteq (A \\cup B)^c$:</h4>
<ol>
  <li>Let $y \\in A^c \\cap B^c$.</li>
  <li>By definition of intersection: $y \\in A^c$ and $y \\in B^c$.</li>
  <li>By definition of complement: $y \\notin A$ and $y \\notin B$.</li>
  <li>This means $y$ cannot belong to the union: $y \\notin (A \\cup B)$.</li>
  <li>Therefore, by definition of complement: $y \\in (A \\cup B)^c$.</li>
  <li>Hence:
    $$A^c \\cap B^c \\subseteq (A \\cup B)^c \\quad \\dots (2)$$
  </li>
</ol>

<h4>Conclusion:</h4>
<p>From equations (1) and (2), by set equality definition:</p>
$$\\mathbf{(A \\cup B)^c = A^c \\cap B^c}$$`,
    explanation: 'Fundamental 5-mark subjective proof from MTH202 Handouts Page 47.',
    urdu_answer: 'دونوں طرف سے ایلیمنٹ میتھڈ کے ذریعے ایک دوسرے کا سب سیٹ ثابت کر کے ڈی مورگن کا قانون $(A \\cup B)^c = A^c \\cap B^c$ مکمل الجبرائی طور پر ثابت کیا جاتا ہے۔'
  },
  {
    stem: 'Prove (A - B) ∪ (A ∩ B) = A using Set Identities.',
    correct: `<p><strong>Proving $(A - B) \\cup (A \\cap B) = A$ using Set Identities (MTH202 Handouts Page 47–48):</strong></p>

<h4>Step-by-Step Proof:</h4>
$$\\begin{aligned}
\\text{LHS} &= (A - B) \\cup (A \\cap B) \\\\
&= (A \\cap B^c) \\cup (A \\cap B) && \\text{[Set Difference Law: } A - B = A \\cap B^c] \\\\
&= A \\cap (B^c \\cup B) && \\text{[Distributive Law of } \\cap \\text{ over } \\cup] \\\\
&= A \\cap (B \\cup B^c) && \\text{[Commutative Law of } \\cup] \\\\
&= A \\cap U && \\text{[Complement Law: } B \\cup B^c = U] \\\\
&= A && \\text{[Identity Law: } A \\cap U = A] \\\\
&= \\text{RHS}
\\end{aligned}$$

<p><strong>Conclusion:</strong> The identity $\\mathbf{(A - B) \\cup (A \\cap B) = A}$ is strictly proved.</p>`,
    explanation: 'Standard 3-mark to 5-mark algebraic proof from MTH202 Handouts Page 47–48.',
    urdu_answer: 'سیٹ ڈفرنس کے فارمولے کے بعد ڈسٹریبیوٹو لاء سے $A$ مشترک نکالیں، $B^c \\cup B$ یونیورسل سیٹ $U$ بن جائے گا، اور $A \\cap U = A$ ثابت ہو جائے گا۔'
  },
  {
    stem: 'Prove A - (A - B) = A ∩ B using Set Identities.',
    correct: `<p><strong>Proving $A - (A - B) = A \\cap B$ using Set Identities (MTH202 Handouts Page 48):</strong></p>

<h4>Step-by-Step Proof:</h4>
$$\\begin{aligned}
\\text{LHS} &= A - (A - B) \\\\
&= A - (A \\cap B^c) && \\text{[Set Difference Law on inner term]} \\\\
&= A \\cap (A \\cap B^c)^c && \\text{[Set Difference Law on outer term]} \\\\
&= A \\cap (A^c \\cup (B^c)^c) && \\text{[De Morgan's Law: } (X \\cap Y)^c = X^c \\cup Y^c] \\\\
&= A \\cap (A^c \\cup B) && \\text{[Double Complement Law: } (B^c)^c = B] \\\\
&= (A \\cap A^c) \\cup (A \\cap B) && \\text{[Distributive Law of } \\cap \\text{ over } \\cup] \\\\
&= \\emptyset \\cup (A \\cap B) && \\text{[Complement Law: } A \\cap A^c = \\emptyset] \\\\
&= A \\cap B && \\text{[Identity Law: } \\emptyset \\cup X = X] \\\\
&= \\text{RHS}
\\end{aligned}$$

<p><strong>Conclusion:</strong> Hence, $\\mathbf{A - (A - B) = A \\cap B}$ is proved algebraically.</p>`,
    explanation: 'Classic set identity simplification from MTH202 Handouts Page 48.',
    urdu_answer: 'پہلے اندرونی اور بیرونی ڈفرنس لاء لگائیں، پھر ڈی مورگن اور ڈبل کمپلیمنٹ سے بریکٹ کھولیں، $A \\cap A^c = \\emptyset$ ہو جائے گا اور نتیجہ $A \\cap B$ بچے گا۔'
  },
  {
    stem: "Prove ((A ∪ B) ∩ Cᶜ)ᶜ = C ∪ (Bᶜ ∩ Aᶜ) using Set Identities.",
    correct: `<p><strong>Proving $[(A \\cup B) \\cap C^c]^c = C \\cup (B^c \\cap A^c)$ using Set Identities:</strong></p>

<h4>Step-by-Step Algebraic Derivation:</h4>
$$\\begin{aligned}
\\text{LHS} &= [(A \\cup B) \\cap C^c]^c \\\\
&= (A \\cup B)^c \\cup (C^c)^c && \\text{[De Morgan's Law on outer intersection]} \\\\
&= (A^c \\cap B^c) \\cup (C^c)^c && \\text{[De Morgan's Law on inner union]} \\\\
&= (A^c \\cap B^c) \\cup C && \\text{[Double Complement Law: } (C^c)^c = C] \\\\
&= C \\cup (A^c \\cap B^c) && \\text{[Commutative Law of } \\cup] \\\\
&= C \\cup (B^c \\cap A^c) && \\text{[Commutative Law of } \\cap] \\\\
&= \\text{RHS}
\\end{aligned}$$

<p><strong>Conclusion:</strong> The identity is proved using De Morgan's, Double Complement, and Commutative Laws (Sadia Solved Subjective Q9, 5 Marks).</p>`,
    explanation: '5-mark subjective proof from Sadia solved past papers and MTH202 Handouts Page 48.',
    urdu_answer: 'پہلے ڈی مورگن کا قانون لگا کر کمپلیمنٹ اندر بھیجیں، $(C^c)^c = C$ بن جائے گا، اور خاصیت مبادلہ سے مطلوبہ نتیجہ $C \\cup (B^c \\cap A^c)$ حاصل ہوگا۔'
  },
  {
    stem: 'Problem: If A ⊆ B, prove algebraically that A ∩ B = A and A ∪ B = B.',
    correct: `<p><strong>Subset Properties Proof: If $A \\subseteq B$, then $A \\cap B = A$ and $A \\cup B = B$ (MTH202 Handouts Page 47):</strong></p>

<h4>1. Proof for $A \\cap B = A$:</h4>
<ul>
  <li>By basic set property, intersection is always a subset of its components:
    $$A \\cap B \\subseteq A \\quad \\dots (1)$$
  </li>
  <li>Now show $A \\subseteq A \\cap B$:
    <br>Let $x \\in A$. Since we are given $A \\subseteq B$, it follows that $x \\in B$.
    <br>Since $x \\in A$ and $x \\in B$, by intersection definition: $x \\in A \\cap B$.
    <br>Therefore:
    $$A \\subseteq A \\cap B \\quad \\dots (2)$$
  </li>
  <li>From (1) and (2): $\\mathbf{A \\cap B = A}$.</li>
</ul>

<h4>2. Proof for $A \\cup B = B$:</h4>
<ul>
  <li>By basic set property, a set is always a subset of its union:
    $$B \\subseteq A \\cup B \\quad \\dots (3)$$
  </li>
  <li>Now show $A \\cup B \\subseteq B$:
    <br>Let $y \\in A \\cup B \\implies y \\in A \\vee y \\in B$.
    <br>If $y \\in B$, it holds directly. If $y \\in A$, since $A \\subseteq B$, $y \\in B$.
    <br>In both cases, $y \\in B$. Therefore:
    $$A \\cup B \\subseteq B \\quad \\dots (4)$$
  </li>
  <li>From (3) and (4): $\\mathbf{A \\cup B = B}$.</li>
</ul>`,
    explanation: 'Deductive subset identity proof from MTH202 Handouts Page 47.',
    urdu_answer: 'اگر A سیٹ B کا ذیلی سیٹ ہو تو ان کا مشترکہ حصہ پورا A ہوگا ($A \\cap B = A$)، اور ان دونوں کا مجموعہ بڑا سیٹ B ہوگا ($A \\cup B = B$)۔'
  },
  {
    stem: 'Problem: Prove the Associative Law for Difference: (A - B) - C = (A - C) - B using Set Difference identity.',
    correct: `<p><strong>Proving $(A - B) - C = (A - C) - B$ using Set Difference Law (MTH202 Handouts Page 48):</strong></p>

<h4>Algebraic Derivation:</h4>
$$\\begin{aligned}
\\text{LHS} &= (A - B) - C \\\\
&= (A \\cap B^c) - C && \\text{[Set Difference Law]} \\\\
&= (A \\cap B^c) \\cap C^c && \\text{[Set Difference Law]} \\\\
&= A \\cap (B^c \\cap C^c) && \\text{[Associative Law of } \\cap] \\\\
&= A \\cap (C^c \\cap B^c) && \\text{[Commutative Law of } \\cap] \\\\
&= (A \\cap C^c) \\cap B^c && \\text{[Associative Law of } \\cap] \\\\
&= (A - C) \\cap B^c && \\text{[Set Difference Law]} \\\\
&= (A - C) - B && \\text{[Set Difference Law]} \\\\
&= \\text{RHS}
\\end{aligned}$$

<p><strong>Conclusion:</strong> The identity $\\mathbf{(A - B) - C = (A - C) - B}$ is established.</p>`,
    explanation: 'Algebraic set difference manipulation from MTH202 Handouts Page 48.',
    urdu_answer: 'سیٹ ڈفرنس $X - Y = X \\cap Y^c$ کے اصول اور تقاطع کے ایسوسی ایٹو و کمیوٹیٹو قوانین کے ذریعے $(A - B) - C = (A - C) - B$ ثابت ہوتا ہے۔'
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
    insMcq.run(lec9.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec9.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec9.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 9:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Algebraic Proofs: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 9: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// ── Step 1: Find MTH202 Subject ──────────────────────────────────────────────
const subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'mth202'`).get();
if (!subj) {
  console.error('MTH202 subject not found');
  process.exit(1);
}

// ── Step 2: Check if MTH202 L3 already exists ────────────────────────────────
const existing = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 3`).get(subj.id);
if (existing) {
  console.log('MTH202 Lecture 3 already exists with ID:', existing.id);
  const count = db.prepare(`SELECT count(*) as c FROM questions WHERE lecture_id = ?`).get(existing.id);
  console.log(`Lecture 3 already has ${count.c} questions.`);
  process.exit(0);
}

// ── Step 3: Insert MTH202 Lecture 3 ──────────────────────────────────────────
const l3res = db.prepare(`
  INSERT INTO lectures (subject_id, number, title)
  VALUES (?, 3, ?)
`).run(subj.id, "Laws of Logic, De Morgan's Laws & Algebraic Simplification");
const l3Id = l3res.lastInsertRowid;
console.log('Inserted MTH202 Lecture 3 with ID:', l3Id);

const ins = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
`);

const insS = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
`);

const insL = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// ── Step 4: Insert 10 MCQs ───────────────────────────────────────────────────

// MCQ 1
ins.run(
  l3Id,
  'The statement ~(~p) ≡ p describes ______.',
  JSON.stringify({
    a: 'Commutative Law',
    b: 'Implication Laws',
    c: 'Double negative law',
    d: 'Equivalence'
  }),
  'c',
  'The Double Negative Law states that negating a proposition twice results in the original proposition: ~(~p) ≡ p.',
  'ڈبل نیگیٹو قانون (Double Negative Law) کے مطابق کسی بیان کی دو بار نفی کرنے سے اصل بیان حاصل ہوتا ہے: ~(~p) ≡ p۔'
);

// MCQ 2
ins.run(
  l3Id,
  'The negation of 1 < x < 10 is "x ≤ 1 or x ≥ 10" by using ______.',
  JSON.stringify({
    a: 'Distributive Law',
    b: 'Inequality Law',
    c: "De-Morgan's Law",
    d: 'None of these'
  }),
  'c',
  "1 < x < 10 represents the conjunction (x > 1 ∧ x < 10). Applying De Morgan's Law ~(p ∧ q) ≡ ~p ∨ ~q negates both inequalities and swaps AND to OR, giving (x ≤ 1 ∨ x ≥ 10).",
  '1 < x < 10 دراصل (x > 1 AND x < 10) ہوتا ہے۔ ڈی مورگن قانون کے تحت اس کی نفی (x ≤ 1 OR x ≥ 10) بنتی ہے۔'
);

// MCQ 3
ins.run(
  l3Id,
  'The negation of 2 < x < 3 is ______.',
  JSON.stringify({
    a: '2 > x OR x < 3',
    b: '2 > x AND x > 3',
    c: 'x ≤ 2 OR x ≥ 3',
    d: '2 > x XOR x > 3'
  }),
  'c',
  "2 < x < 3 is the compound inequality (x > 2 ∧ x < 3). Negating via De Morgan's Law gives ~(x > 2) ∨ ~(x < 3), which simplifies to x ≤ 2 OR x ≥ 3.",
  '2 < x < 3 کی نفی ڈی مورگن کے قانون سے x ≤ 2 OR x ≥ 3 حاصل ہوتی ہے۔'
);

// MCQ 4
ins.run(
  l3Id,
  'The statement form p ∨ (p ∧ q) ≡ p describes which law of logic?',
  JSON.stringify({
    a: 'Associative Law',
    b: 'Distributive Law',
    c: 'Absorption Law',
    d: 'Idempotent Law'
  }),
  'c',
  'The Absorption Laws state that p ∨ (p ∧ q) ≡ p and p ∧ (p ∨ q) ≡ p.',
  'بیان p ∨ (p ∧ q) ≡ p منطق کے جذب کرنے کے قانون (Absorption Law) کو ظاہر کرتا ہے۔'
);

// MCQ 5
ins.run(
  l3Id,
  '~(p ∧ q) ≡ ~p ∨ ~q is known as ______.',
  JSON.stringify({
    a: "De Morgan's Law",
    b: 'Commutative Law',
    c: 'Distributive Law',
    d: 'Absorption Law'
  }),
  'a',
  "De Morgan's first law of logic states that the negation of a conjunction is logically equivalent to the disjunction of the negations: ~(p ∧ q) ≡ ~p ∨ ~q.",
  'کنجنکشن کی نفی کا قانون ~(p ∧ q) ≡ ~p ∨ ~q ڈی مورگن کا قانون (De Morgan\'s Law) کہلاتا ہے۔'
);

// MCQ 6
ins.run(
  l3Id,
  'Let p = "I am not a student", then ~(~p) represents ______.',
  JSON.stringify({
    a: 'It is not that I am not a student.',
    b: 'I am a student.',
    c: 'I am not a student.',
    d: 'None of these'
  }),
  'c',
  'By the Double Negative Law, ~(~p) is logically equivalent to p itself. Since p was defined as "I am not a student", ~(~p) evaluates to "I am not a student".',
  'ڈبل نیگیٹو قانون کے تحت ~(~p) برابر ہوتا ہے p کے۔ چونکہ p کی تعریف ہی "I am not a student" ہے، اس لیے جواب "I am not a student" ہوگا۔'
);

// MCQ 7
ins.run(
  l3Id,
  'According to Universal Bound Law, p ∨ t ≡ ______.',
  JSON.stringify({
    a: 'p',
    b: 't',
    c: 'c',
    d: '~p'
  }),
  'b',
  'The Universal Bound Laws state that p ∨ t ≡ t (disjunction with a tautology is always true) and p ∧ c ≡ c (conjunction with a contradiction is always false).',
  'یونیورسل باؤنڈ قانون کے مطابق کسی بھی بیان کا ٹوٹولوجی کے ساتھ OR ہمیشہ ٹوٹولوجی (t) ہی رہتا ہے: p ∨ t ≡ t۔'
);

// MCQ 8
ins.run(
  l3Id,
  'According to Identity Law, p ∧ t ≡ ______ and p ∨ c ≡ ______.',
  JSON.stringify({
    a: 'p, p',
    b: 't, c',
    c: 'c, t',
    d: '~p, ~p'
  }),
  'a',
  'The Identity Laws state that p ∧ t ≡ p (a tautology acts as the identity element for conjunction) and p ∨ c ≡ p (a contradiction acts as the identity element for disjunction).',
  'شناخت کے قانون (Identity Law) کے مطابق p ∧ t ≡ p اور p ∨ c ≡ p ہوتا ہے۔'
);

// MCQ 9
ins.run(
  l3Id,
  'The equivalence p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r) is known as ______.',
  JSON.stringify({
    a: 'Associative Law',
    b: 'Distributive Law',
    c: 'Commutative Law',
    d: "De Morgan's Law"
  }),
  'b',
  'This statement form represents the Distributive Law of conjunction over disjunction in propositional logic.',
  'یہ ڈسٹری بیوٹو قانون (Distributive Law) کہلاتا ہے۔'
);

// MCQ 10
ins.run(
  l3Id,
  'According to Idempotent Law, p ∧ p ≡ ______ and p ∨ p ≡ ______.',
  JSON.stringify({
    a: 'p, p',
    b: 't, c',
    c: '~p, ~p',
    d: 'c, t'
  }),
  'a',
  'The Idempotent Laws state that combining a proposition with itself under conjunction or disjunction yields the proposition itself: p ∧ p ≡ p and p ∨ p ≡ p.',
  'آئیڈیمپوٹنٹ قانون (Idempotent Law) کے مطابق p ∧ p ≡ p اور p ∨ p ≡ p ہوتا ہے۔'
);

// ── Step 5: Insert 5 Short & Numerical Questions ─────────────────────────────

// SQ 1
insS.run(
  l3Id,
  "State both of De Morgan's Laws for mathematical logic in symbolic and verbal forms.",
  `De Morgan's Laws:

1. First Law (Negation of Conjunction):
• Symbolic Form: ~(p ∧ q) ≡ ~p ∨ ~q
• Verbal Statement: The negation of a conjunction of two statements is logically equivalent to the disjunction of their individual negations.

2. Second Law (Negation of Disjunction):
• Symbolic Form: ~(p ∨ q) ≡ ~p ∧ ~q
• Verbal Statement: The negation of a disjunction of two statements is logically equivalent to the conjunction of their individual negations.`,
  "De Morgan's laws show how negation distributes over ∧ and ∨ by flipping the connective.",
  'ڈی مورگن کے دو بنیادی قوانین: 1. ~(p ∧ q) ≡ ~p ∨ ~q (کنجنکشن کی نفی انفرادی نفیوں کے ڈسجنکشن کے برابر ہوتی ہے)، 2. ~(p ∨ q) ≡ ~p ∧ ~q (ڈسجنکشن کی نفی انفرادی نفیوں کے کنجنکشن کے برابر ہوتی ہے)۔'
);

// SQ 2
insS.run(
  l3Id,
  `Apply De Morgan's Laws to find the negation of each of the following statements:
(a) "The fan is slow or it is very hot"
(b) "Akram is unfit and Saleem is injured"`,
  `Application of De Morgan's Laws:

(a) Statement: "The fan is slow or it is very hot"
• Let p = "The fan is slow", q = "It is very hot".
• Form: p ∨ q
• Negation: ~(p ∨ q) ≡ ~p ∧ ~q
• Negated Sentence: "The fan is not slow and it is not very hot."

(b) Statement: "Akram is unfit and Saleem is injured"
• Let p = "Akram is unfit", q = "Saleem is injured".
• Form: p ∧ q
• Negation: ~(p ∧ q) ≡ ~p ∨ ~q
• Negated Sentence: "Akram is not unfit or Saleem is not injured." (or "Akram is fit or Saleem is not injured").`,
  'Under De Morgan\'s laws, "OR" statements negate to "AND", and "AND" statements negate to "OR".',
  '(الف) "The fan is not slow and it is not very hot." (ب) "Akram is not unfit or Saleem is not injured."'
);

// SQ 3
insS.run(
  l3Id,
  "Using the Laws of Logic, simplify the statement form p ∨ [~(~p ∧ q)]. State the name of the law used in each step.",
  `Simplification of p ∨ [~(~p ∧ q)]:

Step 1: Apply De Morgan's Law to ~(~p ∧ q):
≡ p ∨ [~(~p) ∨ ~q]            (De Morgan's Law)

Step 2: Apply Double Negative Law to ~(~p):
≡ p ∨ (p ∨ ~q)               (Double Negative Law: ~(~p) ≡ p)

Step 3: Apply Associative Law for ∨:
≡ (p ∨ p) ∨ ~q               (Associative Law for ∨)

Step 4: Apply Idempotent Law to (p ∨ p):
≡ p ∨ ~q                     (Idempotent Law: p ∨ p ≡ p)

Final Simplified Form: p ∨ ~q`,
  "Applying standard laws systematically reduces the complex expression to a clean two-literal disjunction.",
  'ڈی مورگن کے بعد ڈبل نیگیٹو قانون لگانے سے p ∨ (p ∨ ~q) حاصل ہوتا ہے، پھر ایسوسی ایٹو اور آئیڈیمپوٹنٹ قانون سے حتمی جواب p ∨ ~q آتا ہے۔'
);

// SQ 4
insS.run(
  l3Id,
  `Rephrase the following conditional statement more simply using the Distributive Law in reverse:
"You will get an A if you are hardworking and the sun shines, or you are hardworking and it rains."`,
  `Simplification using Distributive Law:

1. Identify Components:
Let p = "You are hardworking"
Let q = "The sun shines"
Let r = "It rains"

2. Translate Condition:
The condition part of the statement is:
(p ∧ q) ∨ (p ∧ r)

3. Apply Distributive Law (factoring out p):
(p ∧ q) ∨ (p ∧ r) ≡ p ∧ (q ∨ r)

4. Rephrased English Statement:
"You will get an A if you are hardworking, and either the sun shines or it rains."`,
  'Factoring out the common premise "hardworking" via distributivity simplifies communication and logic.',
  'مشترک مفروضے (hardworking) کو باہر نکال کر جملہ آسان ہو جاتا ہے: "You will get an A if you are hardworking, and either the sun shines or it rains."'
);

// SQ 5 (Numerical / Problem-Solving)
insS.run(
  l3Id,
  "Using De Morgan's Laws, find the negation of the compound double inequality: -1 < x ≤ 4.",
  `Negation of Compound Inequality:

1. Express as Conjunction:
The double inequality -1 < x ≤ 4 means:
(x > -1) ∧ (x ≤ 4)

2. Define Components:
Let p : x > -1
Let q : x ≤ 4
Compound statement = p ∧ q

3. Apply De Morgan's Law:
~(p ∧ q) ≡ ~p ∨ ~q

4. Compute Component Negations:
• ~p = ~(x > -1) is x ≤ -1
• ~q = ~(x ≤ 4) is x > 4

5. Final Negated Inequality:
x ≤ -1 OR x > 4 (symbolically: x ≤ -1 ∨ x > 4)`,
  'The complement of the half-open interval (-1, 4] is (-∞, -1] ∪ (4, ∞).',
  'بند وقفے (-1, 4] کی نفی وقفے سے باہر کے دونوں حصوں کا ملاپ ہے یعنی x ≤ -1 یا x > 4۔'
);

// ── Step 6: Insert 3 Long Questions ──────────────────────────────────────────

// LQ 1
insL.run(
  l3Id,
  `Using the Laws of Logic, verify without using truth tables that:
~(~p ∧ q) ∧ (p ∨ q) ≡ p
Show every intermediate step and clearly state the specific law used.`,
  `Proof of Equivalence Without Truth Tables:

Expression to Simplify: ~(~p ∧ q) ∧ (p ∨ q)

Step 1: Apply De Morgan's Law to ~(~p ∧ q):
≡ [~(~p) ∨ ~q] ∧ (p ∨ q)         [De Morgan's Law]

Step 2: Apply Double Negative Law to ~(~p):
≡ (p ∨ ~q) ∧ (p ∨ q)             [Double Negative Law: ~(~p) ≡ p]

Step 3: Apply Distributive Law in reverse (factoring out p ∨):
≡ p ∨ (~q ∧ q)                   [Distributive Law: (A ∨ B) ∧ (A ∨ C) ≡ A ∨ (B ∧ C)]

Step 4: Apply Negation Law to (~q ∧ q):
≡ p ∨ c                          [Negation Law: ~q ∧ q ≡ c (Contradiction)]

Step 5: Apply Identity Law to (p ∨ c):
≡ p                              [Identity Law: p ∨ c ≡ p]

Conclusion:
Left Hand Side simplifies precisely to p. Hence:
~(~p ∧ q) ∧ (p ∨ q) ≡ p (Proved).`,
  'Algebraic simplification using laws of logic is much faster and more scalable than constructing full truth tables.',
  'ڈی مورگن، ڈبل نیگیٹو، ریورس ڈسٹری بیوٹو، اور نیگیشن قانون لگانے سے عبارت p ∨ c بنتی ہے جو کہ آئیڈینٹٹی قانون سے بالآخر p کے برابر ثابت ہو جاتی ہے۔'
);

// LQ 2
insL.run(
  l3Id,
  'Show without using truth tables that ~(p → q) → p is a Tautology. Justify every logical transformation by naming the law applied.',
  `Proof that ~(p → q) → p is a Tautology Without Truth Tables:

Expression: ~(p → q) → p

Step 1: Express conditional p → q using conjunction negation law (p → q ≡ ~(p ∧ ~q)):
≡ ~[~(p ∧ ~q)] → p               [Implication Law: p → q ≡ ~(p ∧ ~q)]

Step 2: Apply Double Negation Law:
≡ (p ∧ ~q) → p                   [Double Negation Law: ~(~A) ≡ A]

Step 3: Transform implication A → B into ~A ∨ B:
≡ ~(p ∧ ~q) ∨ p                  [Implication Law: A → B ≡ ~A ∨ B]

Step 4: Apply De Morgan's Law to ~(p ∧ ~q):
≡ (~p ∨ ~(~q)) ∨ p               [De Morgan's Law]
≡ (~p ∨ q) ∨ p                   [Double Negation Law: ~(~q) ≡ q]

Step 5: Apply Commutative Law to (~p ∨ q):
≡ (q ∨ ~p) ∨ p                   [Commutative Law for ∨]

Step 6: Apply Associative Law for ∨:
≡ q ∨ (~p ∨ p)                   [Associative Law for ∨]

Step 7: Apply Negation Law to (~p ∨ p):
≡ q ∨ t                          [Negation Law: ~p ∨ p ≡ t (Tautology)]

Step 8: Apply Universal Bound Law to (q ∨ t):
≡ t                              [Universal Bound Law: A ∨ t ≡ t]

Conclusion:
Since the final simplified expression evaluates identically to t (Tautology), the statement form ~(p → q) → p is a TAUTOLOGY.`,
  'If p → q is false, p must be true. Therefore, the hypothesis ~(p → q) implies p directly.',
  'ہر قدم پر لاجک قوانین (ڈی مورگن، ایسوسی ایٹو، نیگیشن قانون) کے نفاذ سے مساوات بالآخر t کے برابر آ جاتی ہے جس سے ثابت ہوتا ہے کہ یہ ایک ٹوٹولوجی ہے۔'
);

// LQ 3
insL.run(
  l3Id,
  'List and write the formal algebraic formulas for the fundamental Laws of Logic in propositional calculus.',
  `The Fundamental Laws of Logic:

1. Commutative Laws:
• p ∧ q ≡ q ∧ p
• p ∨ q ≡ q ∨ p

2. Associative Laws:
• (p ∧ q) ∧ r ≡ p ∧ (q ∧ r)
• (p ∨ q) ∨ r ≡ p ∨ (q ∨ r)

3. Distributive Laws:
• p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
• p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)

4. Identity Laws:
• p ∧ t ≡ p  (t is a tautology)
• p ∨ c ≡ p  (c is a contradiction)

5. Negation Laws:
• p ∨ ~p ≡ t
• p ∧ ~p ≡ c

6. Double Negation Law:
• ~(~p) ≡ p

7. Idempotent Laws:
• p ∧ p ≡ p
• p ∨ p ≡ p

8. De Morgan's Laws:
• ~(p ∧ q) ≡ ~p ∨ ~q
• ~(p ∨ q) ≡ ~p ∧ ~q

9. Universal Bound Laws:
• p ∨ t ≡ t
• p ∧ c ≡ c

10. Absorption Laws:
• p ∨ (p ∧ q) ≡ p
• p ∧ (p ∨ q) ≡ p

11. Negation of t and c:
• ~t ≡ c
• ~c ≡ t`,
  'These 11 laws form the complete algebraic foundation for boolean logic and digital circuit design.',
  'یہ 11 قوانین ریاضیاتی منطق کے بنیادی الجبرائی اصول ہیں جن پر بولین الجبرا اور ڈیجیٹل سرکٹس کی بنیاد رکھی گئی ہے۔'
);

console.log('✅ Successfully seeded MTH202 Lecture 3: 10 MCQs, 5 Short Questions, and 3 Long Questions (Total: 18 Questions).');

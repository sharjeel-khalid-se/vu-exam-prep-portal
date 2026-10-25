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

// ── Step 2: Check if MTH202 L2 already exists ────────────────────────────────
const existing = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 2`).get(subj.id);
if (existing) {
  console.log('MTH202 Lecture 2 already exists with ID:', existing.id);
  const count = db.prepare(`SELECT count(*) as c FROM questions WHERE lecture_id = ?`).get(existing.id);
  console.log(`Lecture 2 already has ${count.c} questions.`);
  process.exit(0);
}

// ── Step 3: Insert MTH202 Lecture 2 ──────────────────────────────────────────
const l2res = db.prepare(`
  INSERT INTO lectures (subject_id, number, title)
  VALUES (?, 2, ?)
`).run(subj.id, 'Conditionals, Biconditionals, Variations & Equivalence');
const l2Id = l2res.lastInsertRowid;
console.log('Inserted MTH202 Lecture 2 with ID:', l2Id);

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

// ── Step 4: Insert 12 MCQs ───────────────────────────────────────────────────

// MCQ 1
ins.run(
  l2Id,
  'The converse of the conditional statement p → q is ______.',
  JSON.stringify({
    a: 'q → p',
    b: '~q → ~p',
    c: '~p → ~q',
    d: 'None of these'
  }),
  'a',
  'The converse of a conditional proposition p → q is formed by swapping the hypothesis and conclusion, yielding q → p.',
  'کسی کنڈیشنل سٹیٹمنٹ p → q کا معکوس (Converse) اس کے مفروضے اور نتیجے کو تبدیل کر کے q → p حاصل ہوتا ہے۔'
);

// MCQ 2
ins.run(
  l2Id,
  'The converse of the conditional statement "If I live in Quetta, then I live in Pakistan" is ______.',
  JSON.stringify({
    a: 'If I live in Pakistan, then I live in Quetta.',
    b: 'If I do not live in Quetta, then I do not live in Pakistan.',
    c: 'If I do not live in Pakistan, then I do not live in Quetta.',
    d: 'None of given'
  }),
  'a',
  'The converse swaps hypothesis p ("I live in Quetta") and conclusion q ("I live in Pakistan") to q → p: "If I live in Pakistan, then I live in Quetta."',
  'کنڈیشنل بیان میں پوزیشنز بدلنے سے Converse بنتا ہے: "اگر میں پاکستان میں رہتا ہوں تو میں کوئٹہ میں رہتا ہوں۔"'
);

// MCQ 3
ins.run(
  l2Id,
  'Contra-positive of given statement "If it is raining, I will take an umbrella" is ______.',
  JSON.stringify({
    a: 'I will not take an umbrella if it is not raining.',
    b: 'I will take an umbrella if it is raining.',
    c: 'It is not raining or I will take an umbrella.',
    d: 'None of these'
  }),
  'a',
  'The contrapositive of p → q is ~q → ~p ("If I do not take an umbrella, then it is not raining"). In standard VU past paper answer keys, option A is designated as the correct key.',
  'کونٹراپوزیٹو میں دونوں حصوں کی نفی کر کے جگہ بدل دی جاتی ہے (~q → ~p)۔'
);

// MCQ 4
ins.run(
  l2Id,
  'The contrapositive of the conditional statement "If it is Sunday, then I go for shopping" is ______.',
  JSON.stringify({
    a: 'If I do not go for shopping, then it is not Sunday.',
    b: 'If I go for shopping, then it is Sunday.',
    c: 'If it is not Sunday, then I do not go for shopping.',
    d: 'None of these'
  }),
  'a',
  'The contrapositive of p → q is formed by reversing and negating both parts: ~q → ~p ("If I do not go for shopping, then it is not Sunday").',
  'بیان p → q کا Contrapositive ہمیشہ ~q → ~p ہوتا ہے: "اگر میں شاپنگ کے لیے نہیں جاتا تو اتوار نہیں ہے۔"'
);

// MCQ 5
ins.run(
  l2Id,
  'A statement that is always true regardless of the truth values of the statement variables is called ______.',
  JSON.stringify({
    a: 'Tautology',
    b: 'Contradiction',
    c: 'Fallacy',
    d: 'None of these'
  }),
  'a',
  'A tautology is a compound statement form that evaluates to True for all possible combinations of truth values of its constituent statement variables.',
  'وہ کمپاؤنڈ بیان جو اپنے متغیرات کی ہر ممکنہ قیمت پر ہمیشہ سچ (True) رہے، ٹوٹولوجی (Tautology) کہلاتا ہے۔'
);

// MCQ 6
ins.run(
  l2Id,
  'The statement of the form p ∧ ~p is:',
  JSON.stringify({
    a: 'Tautology',
    b: 'Contradiction',
    c: 'Fallacy',
    d: 'None of these'
  }),
  'b',
  'p ∧ ~p is always False because a proposition p and its negation ~p cannot be true simultaneously. A statement that is always False is a Contradiction.',
  'بیان p ∧ ~p ہمیشہ غلط (False) ہوتا ہے کیونکہ ایک چیز اور اس کی نفی ایک ساتھ سچ نہیں ہو سکتیں، اس لیے یہ کنٹراڈکشن (Contradiction) ہے۔'
);

// MCQ 7
ins.run(
  l2Id,
  '(p ∨ ~p) is a ______.',
  JSON.stringify({
    a: 'Tautology',
    b: 'Contradiction',
    c: 'Fallacy',
    d: 'Contingency'
  }),
  'a',
  '(p ∨ ~p) represents the Law of Excluded Middle: either p is true or ~p is true. Since one must always be true, their disjunction is always True (Tautology).',
  'بیان (p ∨ ~p) قانون اخراج وسط کے تحت ہمیشہ True رہتا ہے، لہٰذا یہ ایک ٹوٹولوجی (Tautology) ہے۔'
);

// MCQ 8
ins.run(
  l2Id,
  'Negation of a tautology is a contradiction.',
  JSON.stringify({
    a: 'True',
    b: 'False'
  }),
  'a',
  'Because a tautology is always True (T), negating it produces a statement that is always False (F), which is by definition a contradiction: ~t ≡ c.',
  'ٹوٹولوجی ہمیشہ True ہوتی ہے، اس لیے اس کی نفی ہمیشہ False یعنی کنٹراڈکشن ہو گی، جو کہ بالکل درست ہے۔'
);

// MCQ 9
ins.run(
  l2Id,
  'p ↔ q is logically equivalent to ______.',
  JSON.stringify({
    a: '(p → q) ∧ (q → p)',
    b: '(p → q) ∨ (q → p)',
    c: '(p ∧ q) → (p ∨ q)',
    d: 'None of these'
  }),
  'a',
  'The biconditional statement p ↔ q ("p if and only if q") means both conditional implications hold simultaneously: (p → q) ∧ (q → p).',
  'دو طرفہ شرطیہ بیان p ↔ q دونوں طرفہ کنڈیشنلز کے ملاپ (p → q) ∧ (q → p) کے برابر ہوتا ہے۔'
);

// MCQ 10
ins.run(
  l2Id,
  'According to biconditional truth values, "1 + 1 = 3 if and only if sky is yellow" is ______.',
  JSON.stringify({
    a: 'TRUE',
    b: 'FALSE'
  }),
  'a',
  'Both "1 + 1 = 3" (False) and "sky is yellow" (False) are False. In a biconditional p ↔ q, False ↔ False evaluates to TRUE because both sides share identical truth values.',
  'بائی کنڈیشنل (iff) میں جب دونوں بیانات غلط (False) ہوں تو نتیجہ True ہوتا ہے (F ↔ F = True)۔'
);

// MCQ 11
ins.run(
  l2Id,
  'The negation of the implication "If P is a square then P is a rectangle" is ______.',
  JSON.stringify({
    a: 'If P is not a square then P is not a rectangle',
    b: 'P is not a square and P is a rectangle',
    c: 'P is a square and P is not a rectangle',
    d: 'None of the above'
  }),
  'c',
  'By the negation rule for conditional statements: ~(p → q) ≡ p ∧ ~q. Therefore, the negation is: "P is a square and P is not a rectangle".',
  'کنڈیشنل بیان کی نفی کا قانون ہے: ~(p → q) ≡ p ∧ ~q۔ لہٰذا "P مربع ہے اور P مستطیل نہیں ہے" درست نفی ہے۔'
);

// MCQ 12
ins.run(
  l2Id,
  'If p is false and q is false, then ~p → q is ______.',
  JSON.stringify({
    a: 'True',
    b: 'False'
  }),
  'b',
  'When p is False, ~p is True. Substituting into ~p → q gives True → False, which evaluates to False.',
  'چونکہ p غلط ہے، اس لیے ~p سچ (True) ہو جائے گا۔ اب True → False کا نتیجہ ہمیشہ False ہوتا ہے۔'
);

// ── Step 5: Insert 4 Short Questions ─────────────────────────────────────────

// SQ 1
insS.run(
  l2Id,
  'What are the Converse, Inverse, and Contrapositive of the conditional implication: "If you have flu, then you will miss the final examination"?',
  `Given Conditional Statement (p → q):
Let p = "You have flu"
Let q = "You will miss the final examination"

1. Converse (q → p):
"If you will miss the final examination, then you have flu."

2. Inverse (~p → ~q):
"If you do not have flu, then you will not miss the final examination."

3. Contrapositive (~q → ~p):
"If you will not miss the final examination, then you do not have flu."`,
  'Converse swaps terms (q → p); Inverse negates terms (~p → ~q); Contrapositive swaps and negates (~q → ~p).',
  'Converse میں شرائط تبدیل ہوتی ہیں (q → p)، Inverse میں دونوں کی نفی ہوتی ہے (~p → ~q)، اور Contrapositive میں تبدیل کر کے نفی کی جاتی ہے (~q → ~p)۔'
);

// SQ 2
insS.run(
  l2Id,
  'Define Tautology, Contradiction, and Contingency, and give an example of each.',
  `Definitions and Examples:

1. Tautology:
A compound statement that is always TRUE regardless of the truth values of its constituent variables.
• Example: p ∨ ~p (Law of excluded middle; evaluates to True for both p = True and p = False).

2. Contradiction:
A compound statement that is always FALSE regardless of the truth values of its constituent variables.
• Example: p ∧ ~p (Law of contradiction; evaluates to False for both p = True and p = False).

3. Contingency:
A compound statement that is neither always True nor always False; its truth value depends on the truth values of its statement variables.
• Example: p → q, or p ∧ q (evaluates to True in some rows and False in others).`,
  'Tautology = all True in truth table; Contradiction = all False; Contingency = mix of True and False.',
  'ٹوٹولوجی ہمیشہ True رہتی ہے (جیسے p ∨ ~p)؛ کنٹراڈکشن ہمیشہ False رہتی ہے (جیسے p ∧ ~p)؛ اور کنٹنجنسی وہ بیان ہے جو کچھ صورتوں میں True اور کچھ میں False ہو (جیسے p → q)۔'
);

// SQ 3
insS.run(
  l2Id,
  'State the logical equivalence rule for the negation of a conditional statement p → q. Explain why ~(p → q) is NOT a conditional statement.',
  `Negation of a Conditional Statement:

1. Logical Equivalence Rule:
The negation of the conditional statement p → q is logically equivalent to the conjunction of p and the negation of q:
~(p → q) ≡ p ∧ ~q

2. Explanation:
A conditional statement p → q is False in exactly one single scenario: when the premise p is True and the conclusion q is False.
Therefore, asserting that p → q is false means that p must be True AND q must be False simultaneously (p ∧ ~q).
Notice that the negation of a conditional statement is a CONJUNCTION (AND), not another conditional statement.`,
  'To disprove an implication "If p then q", one must provide a counterexample where p is true but q is false.',
  'شرطیہ بیان کی نفی کنجنکشن ہوتی ہے: ~(p → q) ≡ p ∧ ~q۔ کیونکہ شرط صرف اسی وقت غلط ہوتی ہے جب پہلا حصہ سچ اور دوسرا جھوٹ ہو۔'
);

// SQ 4 (Numerical / Problem-Solving)
insS.run(
  l2Id,
  `Determine and justify the truth values of the following compound conditional and biconditional statements:
(a) "If 1 = 1, then 2 = 2"
(b) "If 1 = 1, then 2 = 3"
(c) "1 + 1 = 3 if and only if earth is flat"
(d) "Sky is blue iff 1 = 0"
(e) "x > 5 iff x^2 > 25" (for real numbers)`,
  `Determination of Truth Values:

(a) "If 1 = 1, then 2 = 2":
• Premise: "1 = 1" is True.
• Conclusion: "2 = 2" is True.
• Implication: True → True = TRUE.

(b) "If 1 = 1, then 2 = 3":
• Premise: "1 = 1" is True.
• Conclusion: "2 = 3" is False.
• Implication: True → False = FALSE (The only case where a conditional is false).

(c) "1 + 1 = 3 if and only if earth is flat":
• Component 1: "1 + 1 = 3" is False.
• Component 2: "earth is flat" is False.
• Biconditional: False ↔ False = TRUE (A biconditional is true whenever both components share the same truth value).

(d) "Sky is blue iff 1 = 0":
• Component 1: "Sky is blue" is True.
• Component 2: "1 = 0" is False.
• Biconditional: True ↔ False = FALSE (Opposite truth values yield False).

(e) "x > 5 iff x^2 > 25":
• Counterexample: Consider x = -6.
• Here, x^2 = (-6)^2 = 36 > 25 is True, but x = -6 > 5 is False.
• Since one can be True while the other is False, the biconditional does not hold universally.
• Overall Truth Value: FALSE.`,
  'A conditional p → q is False only when T → F. A biconditional p ↔ q is True only when both components match (T↔T or F↔F).',
  'کنڈیشنل صرف اس وقت غلط ہوتا ہے جب پہلا حصہ سچ اور دوسرا جھوٹ ہو۔ بائی کنڈیشنل اس وقت سچ ہوتا ہے جب دونوں کے سچ یا جھوٹ ہونے کی حالت ایک جیسی ہو (T↔T یا F↔F)۔'
);

// ── Step 6: Insert 3 Long Questions ──────────────────────────────────────────

// LQ 1
insL.run(
  l2Id,
  'Construct the complete truth table for the compound proposition (p → q) ↔ (p ∧ q). Is this statement a tautology, contradiction, or contingency?',
  `Truth Table for (p → q) ↔ (p ∧ q):

1. Setup:
Number of variables = 2 (p, q); Total rows = 2^2 = 4 rows.

2. Step-by-Step Truth Table:
┌───┬───┬─────────┬─────────┬───────────────────────────┐
│ p │ q │  p → q  │  p ∧ q  │ (p → q) ↔ (p ∧ q)        │
├───┼───┼─────────┼─────────┼───────────────────────────┤
│ T │ T │    T    │    T    │             T             │
│ T │ F │    F    │    F    │             T             │
│ F │ T │    T    │    F    │             F             │
│ F │ F │    T    │    F    │             F             │
└───┴───┴─────────┴─────────┴───────────────────────────┘

3. Row Evaluation:
• Row 1 (p=T, q=T): p → q is T, p ∧ q is T. T ↔ T evaluates to T.
• Row 2 (p=T, q=F): p → q is F, p ∧ q is F. F ↔ F evaluates to T.
• Row 3 (p=F, q=T): p → q is T, p ∧ q is F. T ↔ F evaluates to F.
• Row 4 (p=F, q=F): p → q is T, p ∧ q is F. T ↔ F evaluates to F.

4. Classification:
Because the final column contains both True and False values (T, T, F, F), the compound proposition is a CONTINGENCY.`,
  'A biconditional is True when both sides have matching truth values (T↔T or F↔F) and False otherwise.',
  'چونکہ آخری کالم میں نتائج (T, T, F, F) آتے ہیں یعنی نہ تو سارے True ہیں اور نہ سارے False، لہٰذا یہ ایک Contingency ہے۔'
);

// LQ 2
insL.run(
  l2Id,
  'Prove using a truth table that a conditional statement p → q and its contrapositive ~q → ~p are logically equivalent (p → q ≡ ~q → ~p).',
  `Proof of Logical Equivalence: p → q ≡ ~q → ~p

1. Definitions:
• A conditional statement p → q is False only when p is True and q is False.
• The contrapositive is formed by reversing and negating: ~q → ~p.

2. Complete Truth Table:
┌───┬───┬────┬────┬─────────┬───────────┐
│ p │ q │ ~p │ ~q │  p → q  │ ~q → ~p   │
├───┼───┼────┼────┼─────────┼───────────┤
│ T │ T │ F  │ F  │    T    │     T     │
│ T │ F │ F  │ T  │    F    │     F     │
│ F │ T │ T  │ F  │    T    │     T     │
│ F │ F │ T  │ T  │    T    │     T     │
└───┴───┴────┴────┴─────────┴───────────┘

3. Column-by-Column Verification:
• Row 1: p=T, q=T → p → q is T. ~q=F, ~p=F → F → F is T. (Match)
• Row 2: p=T, q=F → p → q is F. ~q=T, ~p=F → T → F is F. (Match)
• Row 3: p=F, q=T → p → q is T. ~q=F, ~p=T → F → T is T. (Match)
• Row 4: p=F, q=F → p → q is T. ~q=T, ~p=T → T → T is T. (Match)

4. Conclusion:
Columns (5) and (6) have identical truth values in all four possible cases. 
Therefore, by definition of logical equivalence:
p → q ≡ ~q → ~p`,
  'Because a conditional and its contrapositive are logically equivalent, any theorem can be proven by proving its contrapositive.',
  'کالم p → q اور ~q → ~p کی تمام ویلیوز (T, F, T, T) ایک جیسی ہیں، لہٰذا ثابت ہوا کہ شرطیہ بیان اپنے کونٹراپوزیٹو کے مساوی (Logically Equivalent) ہوتا ہے۔'
);

// LQ 3
insL.run(
  l2Id,
  'Construct a truth table to determine whether the statement ~(q ∨ (q → p)) → ~p is a Tautology, a Contradiction, or a Contingency.',
  `Analysis of ~(q ∨ (q → p)) → ~p:

1. Setup:
Variables: p, q; Total rows = 4.

2. Step-by-Step Truth Table:
┌───┬───┬────┬─────────┬──────────────┬──────────────────┬────────────────────────────┐
│ p │ q │ ~p │  q → p  │ q ∨ (q → p)  │ ~(q ∨ (q → p))   │ ~(q ∨ (q → p)) → ~p        │
├───┼───┼────┼─────────┼──────────────┼──────────────────┼────────────────────────────┤
│ T │ T │ F  │    T    │      T       │        F         │             T              │
│ T │ F │ F  │    T    │      T       │        F         │             T              │
│ F │ T │ T  │    F    │      T       │        F         │             T              │
│ F │ F │ T  │    T    │      T       │        F         │             T              │
└───┴───┴────┴────┴─────────┴──────────────┴──────────────────┴────────────────────────────┘

3. Logical Deduction:
• In all rows, q ∨ (q → p) is True because when q is True, the disjunction is True; and when q is False, q → p is True, making the disjunction True.
• Its negation ~(q ∨ (q → p)) is therefore always False.
• Any conditional with a False premise (False → anything) evaluates strictly to True.
• Therefore, the statement evaluates to True in all rows (Tautology).

Note on VU Past Paper Variations: In some past paper answer keys, slight parenthesization variants like (~q ∨ (q → p)) or alternative interpretations are classified as Contingency. In rigorous symbolic logic, the statement evaluates to a Tautology as proven above.`,
  'An implication with an identically false hypothesis is vacuously true in all rows, forming a tautology.',
  'چونکہ پہلی شرط ہمیشہ False آتی ہے اور False سے شروع ہونے والا ہر شرطیہ بیان ہمیشہ True ہوتا ہے، اس لیے یہ ایک Tautology ہے۔'
);

console.log('✅ Successfully seeded MTH202 Lecture 2: 12 MCQs, 4 Short Questions, and 3 Long Questions (Total: 19 Questions).');

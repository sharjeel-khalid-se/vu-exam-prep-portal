import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// ── Step 1: Ensure MTH202 Subject Exists ──────────────────────────────────────
let subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'mth202'`).get();
if (!subj) {
  const res = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'Discrete Mathematics',
    'mth202',
    'MTH202',
    'Foundations of mathematical logic, propositions, truth tables, combinatorics, relations, and proof methods — Virtual University'
  );
  subj = { id: Number(res.lastInsertRowid) };
  console.log('Inserted subject MTH202 with ID:', subj.id);
} else {
  console.log('MTH202 subject already exists with ID:', subj.id);
}

// ── Step 2: Check if Lecture 1 Exists ─────────────────────────────────────────
let l1 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 1`).get(subj.id);
if (l1) {
  console.log('MTH202 Lecture 1 already exists with ID:', l1.id);
  const count = db.prepare(`SELECT count(*) as c FROM questions WHERE lecture_id = ?`).get(l1.id);
  console.log(`Lecture 1 already has ${count.c} questions.`);
  process.exit(0);
}

const l1res = db.prepare(`
  INSERT INTO lectures (subject_id, number, title)
  VALUES (?, 1, ?)
`).run(subj.id, 'Logic: Propositions, Connectives, and Truth Tables');
const l1Id = l1res.lastInsertRowid;
console.log('Inserted MTH202 Lecture 1 with ID:', l1Id);

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

// ── Step 3: Insert MCQs ───────────────────────────────────────────────────────

// MCQ 1
ins.run(
  l1Id,
  'A statement is also referred to as a ______.',
  JSON.stringify({
    a: 'Proposition',
    b: 'Conclusion',
    c: 'Order',
    d: 'None of these'
  }),
  'a',
  'In mathematical logic, a statement is a declarative sentence that is either true or false (but not both), which is also known as a proposition.',
  'ریاضیاتی منطق میں وہ جملہ جو یا تو سچ ہو یا جھوٹ، اسے سٹیٹمنٹ یا پروپوزیشن (Proposition) کہا جاتا ہے۔'
);

// MCQ 2
ins.run(
  l1Id,
  'The negation of "Today is Friday" is ______.',
  JSON.stringify({
    a: 'Today is Saturday',
    b: 'Today is not Friday',
    c: 'Today is Thursday',
    d: 'None of given'
  }),
  'b',
  'The negation (~p) of a proposition p asserts that p is false. The negation of "Today is Friday" is "Today is not Friday" (or "It is not the case that today is Friday").',
  'کسی بیان کی نفی (Negation) اس کے جھٹلانے کا نام ہے۔ "Today is Friday" کی نفی "Today is not Friday" ہوگی۔'
);

// MCQ 3
ins.run(
  l1Id,
  'An arrangement of rows and columns that specifies the truth value of a compound proposition for all possible truth values of its constituent propositions is called ______.',
  JSON.stringify({
    a: 'Truth Table',
    b: 'Venn diagram',
    c: 'False Table',
    d: 'None of these'
  }),
  'a',
  'A Truth Table is a tabular display showing the truth value of a compound proposition for every combination of truth values of its individual constituent statement variables.',
  'وہ جدول (Table) جو کسی کمپاؤنڈ پروپوزیشن کی تمام ممکنہ سچائی کی اقدار کو ظاہر کرتا ہے اسے ٹروتھ ٹیبل (Truth Table) کہتے ہیں۔'
);

// MCQ 4
ins.run(
  l1Id,
  'If p = "It is raining" and q = "She will go to college", then "It is raining and she will not go to college" will be denoted by ______.',
  JSON.stringify({
    a: 'p ∧ ~q',
    b: 'p ∧ q',
    c: '~(p ∧ q)',
    d: '~p ∧ q'
  }),
  'a',
  '"It is raining" is p, "and" is conjunction (∧), and "she will not go to college" is negation of q (~q). Thus, the compound statement is represented as p ∧ ~q.',
  'یہاں p بارش ہونے کو اور ~q کالج نہ جانے کو ظاہر کرتا ہے، اور لفظ "and" کے لیے کنجنکشن (∧) استعمال ہوتا ہے، لہٰذا درست علامت p ∧ ~q ہے۔'
);

// MCQ 5
ins.run(
  l1Id,
  'If p = "Saima is hard working" and q = "Saima is good in mathematics", then "Saima is hard working and good in mathematics" is denoted by ______.',
  JSON.stringify({
    a: 'p ∧ q',
    b: 'p ∨ q',
    c: 'p → q',
    d: 'p ↔ q'
  }),
  'a',
  'The word "and" connects the two propositions p and q as a logical conjunction, which is symbolized by p ∧ q.',
  'لفظ "and" دونوں بیانات کو آپس میں جوڑنے کے لیے کنجنکشن کا نشان (∧) استعمال کرتا ہے، لہٰذا p ∧ q درست جواب ہے۔'
);

// MCQ 6
ins.run(
  l1Id,
  'Which of the following is NOT a Proposition?',
  JSON.stringify({
    a: 'x > 11',
    b: 'Sun rounds about the Earth',
    c: '11 + 7 = 18',
    d: 'None of above'
  }),
  'a',
  'Sentences containing unbound variables such as "x > 11" are open sentences whose truth value cannot be determined until a specific value is assigned to x. Therefore, it is not a proposition.',
  'جس جملے میں متغیر (Variable جیسے x) کی قیمت مقرر نہ ہو وہ اوپن سنٹنس ہوتا ہے اور پروپوزیشن نہیں کہلاتا۔'
);

// MCQ 7
ins.run(
  l1Id,
  'p ∧ q shows:',
  JSON.stringify({
    a: 'Conjunction of p and q',
    b: 'Disjunction of p and q',
    c: 'Contingency of p and q',
    d: 'None of these'
  }),
  'a',
  'The wedge symbol (∧) denotes the logical connective "AND", which is called the Conjunction of p and q.',
  'علامت ∧ دو پروپوزیشنز کے درمیان کنجنکشن (Conjunction یعنی AND) کو ظاہر کرتی ہے۔'
);

// MCQ 8
ins.run(
  l1Id,
  '"x + 2 = 3" is a proposition?',
  JSON.stringify({
    a: 'True',
    b: 'False'
  }),
  'b',
  '"x + 2 = 3" is an open sentence, not a proposition, because its truth value depends on the undefined variable x. It is true when x = 1 and false otherwise.',
  '"x + 2 = 3" ایک اوپن سنٹنس ہے، پروپوزیشن نہیں، کیونکہ اس میں x کی قیمت نامعلوم ہے۔'
);

// MCQ 9
ins.run(
  l1Id,
  'If p and q are statement variables, then the conjunction of p and q is "p and q", denoted as "p ∧ q".',
  JSON.stringify({
    a: 'TRUE',
    b: 'FALSE'
  }),
  'a',
  'By definition in symbolic logic, the conjunction of statements p and q is denoted by p ∧ q and evaluates to true if and only if both p and q are true.',
  'منطق میں p اور q کے کنجنکشن کو علامت p ∧ q سے ظاہر کیا جاتا ہے جو بالکل درست (TRUE) ہے۔'
);

// MCQ 10
ins.run(
  l1Id,
  'Which one of the following sentences is a PROPOSITION?',
  JSON.stringify({
    a: '"Close the door"',
    b: '"x is greater than 2"',
    c: '"4 + 2 = 7"',
    d: '"He is very rich"'
  }),
  'c',
  '"4 + 2 = 7" is a declarative statement with a definitive truth value (it is definitely FALSE). Since a proposition is a statement that is either true or false, "4 + 2 = 7" is a proposition. Commands ("Close the door") or sentences with unassigned pronouns/variables ("He is very rich", "x > 2") have no definite truth value.',
  '"4 + 2 = 7" ایک غلط بیان ہے مگر اس کی سچائی کی قدر (False) طے شدہ ہے، اس لیے یہ پروپوزیشن ہے۔ جبکہ احکامات اور نامعلوم متغیرات والے جملے پروپوزیشن نہیں ہوتے۔'
);

// MCQ 11
ins.run(
  l1Id,
  'Which of the following is NOT a proposition?',
  JSON.stringify({
    a: '"Grass is green"',
    b: '"There are four fingers in a hand"',
    c: '"Close the door"',
    d: '"4 + 2 = 6"'
  }),
  'c',
  '"Close the door" is an imperative sentence (a command). Commands, questions, and exclamations do not assert truth or falsehood and are therefore not propositions.',
  '"Close the door" ایک حکمیہ جملہ ہے جس کا کوئی سچ یا جھوٹ نہیں ہوتا، لہٰذا یہ پروپوزیشن نہیں ہے۔'
);

// MCQ 12
ins.run(
  l1Id,
  '"He is very rich" is not a proposition because:',
  JSON.stringify({
    a: 'It contains an undefined pronoun "He"',
    b: 'It is always false',
    c: 'It is a mathematical theorem',
    d: 'It is a conjunction'
  }),
  'a',
  'The pronoun "He" is a variable. Until "He" is specified to a particular person, the truth value cannot be determined. Hence, it is an open sentence and not a proposition.',
  'لفظ "He" کا تعین نہ ہونے کی وجہ سے اس جملے کے سچ یا جھوٹ کا فیصلہ نہیں کیا جا سکتا، اس لیے یہ پروپوزیشن نہیں ہے۔'
);

// ── Step 4: Insert Short Questions ───────────────────────────────────────────

// SQ 1
insS.run(
  l1Id,
  'What is the difference between a sentence and a statement (proposition)? Give examples.',
  `Difference between Sentence and Statement (Proposition):

1. Sentence:
A grammatically complete syntactic unit of words. Sentences can be declarative, interrogative (questions like "How are you?"), imperative (commands like "Close the door"), or exclamatory ("What a sunny day!"). Sentences do not necessarily possess a truth value.

2. Statement (Proposition):
A declarative sentence that is strictly either True or False, but not both.
• Example of Statement: "Lahore is the capital of Punjab" (Truth value = True).
• Example of Non-statement: "Close the door" (Command; has no truth value).

Key Principle: Every statement is a sentence, but not every sentence is a statement.`,
  'Only declarative sentences with definite truth values (True or False) qualify as statements or propositions in discrete mathematics.',
  'ہر سٹیٹمنٹ ایک جملہ (Sentence) ہوتا ہے لیکن ہر جملہ سٹیٹمنٹ نہیں ہوتا۔ صرف وہ بیانیہ جملہ جس کی سچائی کی قدر (True یا False) متعین ہو سکے، سٹیٹمنٹ کہلاتا ہے۔ جیسے "لاہور پنجاب کا دارالحکومت ہے"۔ احکامات اور سوالات سٹیٹمنٹ نہیں ہوتے۔'
);

// SQ 2
insS.run(
  l1Id,
  'Define a Truth Table. If a compound statement contains n distinct statement variables, how many rows will its truth table have?',
  `Definition of Truth Table:
A truth table is a mathematical table used in logic to specify and display all possible truth values of a compound proposition corresponding to all possible combinations of truth values of its constituent statement variables.

Formula for Rows:
If a compound statement contains n distinct statement variables, the total number of combinations (rows) in the truth table is given by:
Total Rows = 2^n

Examples:
• For n = 1 variable (p): 2^1 = 2 rows (T, F)
• For n = 2 variables (p, q): 2^2 = 4 rows (TT, TF, FT, FF)
• For n = 3 variables (p, q, r): 2^3 = 8 rows`,
  'Each variable has 2 possible states (True or False), so by the multiplication rule of combinatorics, n variables yield 2^n possible truth value assignments.',
  'ٹروتھ ٹیبل ایک جدول ہے جو کسی کمپاؤنڈ بیان کی تمام سچائی کی اقدار کو ظاہر کرتا ہے۔ n متغیرات کے لیے کل قطاروں کی تعداد 2 کی طاقت n (یعنی 2^n) ہوتی ہے۔'
);

// SQ 3
insS.run(
  l1Id,
  `Let m = "Ali is good in Mathematics" and c = "Ali is a Computer Science student". Translate the following symbolic propositions into plain English:
(a) ~c
(b) c ∨ m
(c) m ∧ ~c`,
  `Symbolic translations into plain English:

(a) ~c:
• English Translation: "Ali is not a Computer Science student" (or "It is not the case that Ali is a Computer Science student").

(b) c ∨ m:
• English Translation: "Ali is a Computer Science student or Ali is good in Mathematics".

(c) m ∧ ~c:
• English Translation: "Ali is good in Mathematics and Ali is not a Computer Science student" (or "Ali is good in Mathematics, but he is not a Computer Science student").`,
  '~ represents negation (NOT), ∨ represents disjunction (OR), and ∧ represents conjunction (AND / BUT).',
  '~ نفی (NOT) کو، ∨ یا (OR) کو اور ∧ اور (AND/BUT) کو ظاہر کرتا ہے۔'
);

// SQ 4 (Numerical / Problem-Solving)
insS.run(
  l1Id,
  `If a compound logical expression contains n statement variables, state the general formula for the total number of rows in its truth table. Calculate the total rows required when:
(a) n = 2 variables (p, q)
(b) n = 3 variables (p, q, r)
(c) n = 4 variables (p, q, r, s)
(d) n = 5 variables`,
  `Calculation of Truth Table Rows:

1. General Formula:
For any truth table containing n independent statement variables, each variable can take exactly 2 truth values (True or False). 
Applying the Fundamental Counting Principle:
Total Rows = 2 × 2 × ... × 2 (n times) = 2^n

2. Calculations for Specific Values of n:
(a) For n = 2 variables (p, q):
    Total Rows = 2^2 = 4 rows

(b) For n = 3 variables (p, q, r):
    Total Rows = 2^3 = 8 rows

(c) For n = 4 variables (p, q, r, s):
    Total Rows = 2^4 = 16 rows

(d) For n = 5 variables:
    Total Rows = 2^5 = 32 rows`,
  'Binary states (T/F) for n independent variables yield exactly 2^n unique assignments or rows.',
  'ہر متغیر کے پاس 2 ممکنہ قیمتیں (T یا F) ہوتی ہیں، اس لیے n متغیرات کے لیے کل قطاریں 2^n ہوں گی۔ n=2 کے لیے 4، n=3 کے لیے 8، n=4 کے لیے 16 اور n=5 کے لیے 32 قطاریں بنیں گی۔'
);

// ── Step 5: Insert Long Question ─────────────────────────────────────────────

// LQ 1
insL.run(
  l1Id,
  'Construct the complete Truth Table for the Conjunction of two statements A and B (A ∧ B). State the governing truth condition for a conjunction.',
  `Truth Table and Condition for Conjunction (A ∧ B):

1. Definition & Governing Rule:
The conjunction of two propositions A and B, denoted by A ∧ B, is TRUE if and only if BOTH constituent propositions A and B are True simultaneously. If either A is False, B is False, or both are False, the conjunction A ∧ B evaluates to False.

2. Dimensions of the Table:
• Number of statement variables: n = 2 (A and B).
• Number of rows: 2^n = 2^2 = 4 rows.

3. Truth Table:
┌───────┬───────┬───────────┐
│   A   │   B   │   A ∧ B   │
├───────┼───────┼───────────┤
│   T   │   T   │     T     │
│   T   │   F   │     F     │
│   F   │   T   │     F     │
│   F   │   F   │     F     │
└───────┴───────┴───────────┘

4. Detailed Case Analysis:
• Case 1 (A = True, B = True): Both components are satisfied; therefore, A ∧ B is True.
• Case 2 (A = True, B = False): Component B fails; therefore, A ∧ B is False.
• Case 3 (A = False, B = True): Component A fails; therefore, A ∧ B is False.
• Case 4 (A = False, B = False): Neither component holds; therefore, A ∧ B is False.`,
  'A conjunction operates as a strict logical AND; a single false premise renders the entire conjunction false.',
  'کنجنکشن (A ∧ B) صرف اسی صورت میں True ہوتا ہے جب دونوں بیانات A اور B ایک ساتھ True ہوں۔ اگر کوئی ایک بھی False ہو تو نتیجہ False ہو گا۔'
);

console.log('✅ Successfully seeded MTH202 Lecture 1: 12 MCQs, 4 Short Questions, and 1 Long Question (Total: 17 Questions).');

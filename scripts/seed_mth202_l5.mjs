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

// 2. Create or fetch Lecture 5
let lec5 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 5").get(mth202.id);
if (!lec5) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 5, 'Applications of Logic: Digital Logic Gates, Switching Circuits & Rules of Inference')
  `).run(mth202.id);
  lec5 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 5 with ID: ${lec5.id}`);
} else {
  console.log(`MTH202 Lecture 5 found with ID: ${lec5.id}`);
}

// 3. Clear existing questions for Lecture 5 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec5.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 5.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'A circuit with two input signals and one output signal is called __________.',
    options: {
      a: 'NOT-gate (or inverter)',
      b: 'AND-gate',
      c: 'OR-gate',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'In digital circuit design and VU MTH202 exams, an AND-gate (or OR-gate) receives two binary inputs and yields a single binary output signal, whereas a NOT-gate is an inverter taking strictly one input. In VU answer keys, AND-gate is designated (MTH202 Handouts Page 34). Appeared 12+ times across Moaaz, Junaid, All in One, and Students files.',
    urdu_answer: 'ڈیجیٹل سرکٹس میں دو ان پٹ سگنلز اور ایک آؤٹ پٹ سگنل دینے والا گیٹ بنیادی طور پر AND-gate کہلاتا ہے۔'
  },
  {
    stem: 'A circuit with one input signal and one output signal is called __________.',
    options: {
      a: 'NOT-gate (or inverter)',
      b: 'OR-gate',
      c: 'AND-gate',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'A NOT-gate (also referred to as an inverter) receives strictly a single input signal and reverses its state to produce a single output signal: $1 \\rightarrow 0$ and $0 \\rightarrow 1$ (MTH202 Handouts Page 34). Appeared in Paper 4 and Handouts.',
    urdu_answer: 'ایک ان پٹ اور ایک آؤٹ پٹ سگنل والے سرکٹ کو NOT-gate یا انورٹر (inverter) کہا جاتا ہے۔'
  },
  {
    stem: 'What is the output state of an OR-gate if the inputs are 0 and 1?',
    options: {
      a: '0',
      b: '1',
      c: '2',
      d: '3'
    },
    correct: 'b',
    explanation: 'An OR-gate corresponds to logical disjunction ($0 \\vee 1 = 1$). Its output state is 1 if either or both input signals are 1 (MTH202 Handouts Page 35). Appeared 8+ times in Team Hadi, Waqar Sidhu, and All in One.',
    urdu_answer: 'OR-gate میں اگر ایک بھی ان پٹ 1 ہو تو آؤٹ پٹ 1 ہوتا ہے، یعنی $0 \\vee 1 = 1$۔'
  },
  {
    stem: 'The logic gates OR and AND are unary operations on {0, 1}.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'OR and AND operate on two input operands ($P, Q$), making them binary operations on $\\{0, 1\\}$. The NOT gate operates on a single input operand, which makes it unary (MTH202 Handouts Page 34). Appeared in Grand Quiz 2020.',
    urdu_answer: 'یہ بیان غلط (False) ہے کیونکہ OR اور AND دو ان پٹس لیتے ہیں اس لیے یہ بائنری آپریشنز ہیں، صرف NOT گیٹ یونری ہوتا ہے۔'
  },
  {
    stem: 'Two switches P and Q connected in Series correspond to which logical connective?',
    options: {
      a: '$P \\vee Q$ (Disjunction)',
      b: '$P \\wedge Q$ (Conjunction)',
      c: '$P \\rightarrow Q$ (Implication)',
      d: '$\\sim P$ (Negation)'
    },
    correct: 'b',
    explanation: 'When switches P and Q are connected in series, electric current can only flow through the circuit if BOTH switch P AND switch Q are closed simultaneously, corresponding to logical conjunction $P \\wedge Q$ (MTH202 Handouts Page 34).',
    urdu_answer: 'سیریز میں جڑے دو سوئچز کنجکشن یعنی $P \\wedge Q$ کے مساوی ہوتے ہیں کیونکہ کرنٹ تبھی گزرتا ہے جب دونوں بند ہوں۔'
  },
  {
    stem: 'Two switches P and Q connected in Parallel correspond to which logical connective?',
    options: {
      a: '$P \\wedge Q$ (Conjunction)',
      b: '$P \\vee Q$ (Disjunction)',
      c: '$P \\leftrightarrow Q$ (Biconditional)',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'When switches P and Q are connected in parallel, current can flow through the circuit if either switch P OR switch Q (or both) is closed, representing logical disjunction $P \\vee Q$ (MTH202 Handouts Page 34).',
    urdu_answer: 'پیرالل میں جڑے دو سوئچز ڈس جنکشن یعنی $P \\vee Q$ کے مساوی ہوتے ہیں کیونکہ کسی ایک کے بھی بند ہونے پر کرنٹ گزر جاتا ہے۔'
  },
  {
    stem: 'The rule of inference $\\frac{p \\rightarrow q, \\quad p}{\\therefore q}$ is called __________.',
    options: {
      a: 'Modus Tollens',
      b: 'Modus Ponens',
      c: 'Hypothetical Syllogism',
      d: 'Disjunctive Syllogism'
    },
    correct: 'b',
    explanation: 'The argument form where $p \\rightarrow q$ and $p$ lead to conclusion $q$ is Modus Ponens (the law of detachment / method of affirming) (MTH202 Handouts Page 29). Appeared 10+ times in VU past files.',
    urdu_answer: 'مفروضہ $p \\rightarrow q$ اور $p$ سے نتیجہ $q$ حاصل کرنے کے اصول کو Modus Ponens کہا جاتا ہے۔'
  },
  {
    stem: 'The rule of inference $\\frac{p \\rightarrow q, \\quad \\sim q}{\\therefore \\sim p}$ is called __________.',
    options: {
      a: 'Modus Ponens',
      b: 'Modus Tollens',
      c: 'Disjunctive Syllogism',
      d: 'Fallacy of Inverse'
    },
    correct: 'b',
    explanation: 'The rule of inference where $p \\rightarrow q$ and $\\sim q$ lead to $\\therefore \\sim p$ is Modus Tollens (method of denying) (MTH202 Handouts Page 29).',
    urdu_answer: 'مفروضہ $p \\rightarrow q$ اور $\\sim q$ سے نتیجہ $\\sim p$ حاصل کرنے والے استدلال کے اصول کو Modus Tollens کہتے ہیں۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Digital Logic Gates (NOT, AND, OR) with their Input/Output Behavior.',
    correct: `<p><strong>Fundamental Digital Logic Gates (MTH202 Handouts Page 34–35):</strong></p>
<ol>
  <li><strong>NOT-gate (Inverter):</strong>
    <ul>
      <li>Receives <strong>one</strong> input signal $P$ and yields <strong>one</strong> inverted output signal $R = \\sim P$.</li>
      <li>Behavior: Input $1 \\rightarrow$ Output $0$; Input $0 \\rightarrow$ Output $1$.</li>
    </ul>
  </li>
  <li><strong>AND-gate:</strong>
    <ul>
      <li>Receives <strong>two</strong> input signals ($P, Q$) and performs logical conjunction: $R = P \\wedge Q$.</li>
      <li>Behavior: Outputs $1$ if and only if both $P=1$ and $Q=1$; otherwise outputs $0$.</li>
    </ul>
  </li>
  <li><strong>OR-gate:</strong>
    <ul>
      <li>Receives <strong>two</strong> input signals ($P, Q$) and performs logical disjunction: $R = P \\vee Q$.</li>
      <li>Behavior: Outputs $0$ if and only if both $P=0$ and $Q=0$; otherwise outputs $1$.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Core digital logic gate definitions from MTH202 Handouts Page 34–35.',
    urdu_answer: 'NOT گیٹ ان پٹ کو الٹ دیتا ہے، AND گیٹ صرف تب 1 دیتا ہے جب دونوں ان پٹ 1 ہوں، اور OR گیٹ 1 دیتا ہے اگر کوئی بھی ایک ان پٹ 1 ہو۔'
  },
  {
    stem: 'Differentiate between Switches in Series and Switches in Parallel in Switching Circuits.',
    correct: `<p><strong>Switches in Series vs. Switches in Parallel (MTH202 Handouts Page 34):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Configuration</th>
      <th class="p-2 border">Logical Equivalent</th>
      <th class="p-2 border">Conduction Condition (Light ON)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Switches in Series</td>
      <td class="p-2 border">Conjunction ($P \\wedge Q$)</td>
      <td class="p-2 border">Current flows <strong>only</strong> when both switch $P$ <strong>AND</strong> switch $Q$ are closed.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Switches in Parallel</td>
      <td class="p-2 border">Disjunction ($P \\vee Q$)</td>
      <td class="p-2 border">Current flows if switch $P$ <strong>OR</strong> switch $Q$ (or both) is closed.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Switching circuit principles from MTH202 Handouts Page 34.',
    urdu_answer: 'سیریز سوئچز کنجکشن ($P \\wedge Q$) ہیں جن میں دونوں کا بند ہونا لازمی ہے، جبکہ پیرالل سوئچز ڈس جنکشن ($P \\vee Q$) ہیں جن میں کسی ایک کا بند ہونا کافی ہے۔'
  },
  {
    stem: 'Write down the symbolic forms for the primary Rules of Inference: Modus Ponens, Modus Tollens, Disjunctive Syllogism, and Hypothetical Syllogism.',
    correct: `<p><strong>Primary Rules of Inference (MTH202 Handouts Page 29):</strong></p>
<ol>
  <li><strong>Modus Ponens:</strong>
    $$\\begin{aligned} p &\\rightarrow q \\\\ p & \\\\ \\hline \\therefore q & \\end{aligned}$$
  </li>
  <li><strong>Modus Tollens:</strong>
    $$\\begin{aligned} p &\\rightarrow q \\\\ \\sim q & \\\\ \\hline \\therefore \\sim p & \\end{aligned}$$
  </li>
  <li><strong>Disjunctive Syllogism:</strong>
    $$\\begin{aligned} p &\\vee q \\\\ \\sim p & \\\\ \\hline \\therefore q & \\end{aligned}$$
  </li>
  <li><strong>Hypothetical Syllogism:</strong>
    $$\\begin{aligned} p &\\rightarrow q \\\\ q &\\rightarrow r \\\\ \\hline \\therefore p &\\rightarrow r \\end{aligned}$$
  </li>
</ol>`,
    explanation: 'Standard formal rules of inference from MTH202 Handouts Page 29.',
    urdu_answer: 'چار اہم اصول: Modus Ponens ($p\\rightarrow q, p \\therefore q$)، Modus Tollens ($p\\rightarrow q, \\sim q \\therefore \\sim p$)، Disjunctive Syllogism ($p\\vee q, \\sim p \\therefore q$)، اور Hypothetical Syllogism ($p\\rightarrow q, q\\rightarrow r \\therefore p\\rightarrow r$)۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: 'Input/Output Table for Combinational Logic Circuit:\nInputs: X = 1, Y = 0, Z = 0.\nCircuit Structure: Inputs X and Y enter an AND gate, the result enters an OR gate along with input Z, and the output of the OR gate passes through a NOT gate.\nWrite down the step-by-step signals and complete the Input/Output Table.',
    correct: `<p><strong>Analysis of the Combinational Logic Circuit:</strong></p>
<p>Given binary input signals: $X = 1$, $Y = 0$, $Z = 0$.</p>

<h4>1. Step-by-Step Gate Evaluations:</h4>
<ol>
  <li><strong>Stage 1 (AND Gate):</strong>
    $$\\text{Output}_1 = X \\wedge Y = 1 \\wedge 0 = \\mathbf{0}$$
  </li>
  <li><strong>Stage 2 (OR Gate):</strong>
    $$\\text{Output}_2 = \\text{Output}_1 \\vee Z = (X \\wedge Y) \\vee Z = 0 \\vee 0 = \\mathbf{0}$$
  </li>
  <li><strong>Stage 3 (NOT Gate / Final Output $S$):</strong>
    $$S = \\sim[(X \\wedge Y) \\vee Z] = \\sim(0) = \\mathbf{1}$$
  </li>
</ol>

<h4>2. Input / Output Table:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$X$</th>
      <th class="p-2 border">$Y$</th>
      <th class="p-2 border">$Z$</th>
      <th class="p-2 border font-bold">$X \\wedge Y$</th>
      <th class="p-2 border font-bold">$(X \\wedge Y) \\vee Z$</th>
      <th class="p-2 border font-bold bg-amber-50">Final Output: $S = \\sim[(X \\wedge Y) \\vee Z]$</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-emerald-50">
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold">0</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
  </tbody>
</table>

<p><strong>Result:</strong> For the given input pattern $(1, 0, 0)$, the final output signal is $\\mathbf{1}$ (High / ON).</p>`,
    explanation: '10-mark long question from MTH202 Paper 6 Q27 and Handouts Page 36–37.',
    urdu_answer: 'پہلے مرحلے میں AND گیٹ 0 دے گا، دوسرے میں OR گیٹ 0 دے گا، اور آخر میں NOT گیٹ اسے الٹ کر 1 بنا دے گا۔'
  },
  {
    stem: 'Construct a Combinational Logic Circuit for the Boolean expression: S = (P ∧ Q) ∨ ~R. Explain the gate connections and stages.',
    correct: `<p><strong>Constructing Logic Circuit for $S = (P \\wedge Q) \\vee \\sim R$:</strong></p>

<h4>1. Gate Selection and Stage Decomposition:</h4>
<ul>
  <li><strong>Sub-expression 1 ($(P \\wedge Q)$):</strong> Requires a 2-input <strong>AND gate</strong> receiving inputs $P$ and $Q$.</li>
  <li><strong>Sub-expression 2 ($\\sim R$):</strong> Requires a 1-input <strong>NOT gate (inverter)</strong> receiving input $R$.</li>
  <li><strong>Final Synthesis:</strong> The intermediate outputs from the AND gate and NOT gate are fed into a 2-input <strong>OR gate</strong> to generate final signal $S$.</li>
</ul>

<h4>2. Step-by-Step Connection Instructions:</h4>
<ol>
  <li>Feed line $P$ and line $Q$ into the inputs of <strong>AND Gate 1</strong>. The output line carries the signal $(P \\wedge Q)$.</li>
  <li>Feed line $R$ into the input of <strong>NOT Gate 2</strong>. The output line carries the inverted signal $\\sim R$.</li>
  <li>Route the output of AND Gate 1 and the output of NOT Gate 2 into the two input pins of <strong>OR Gate 3</strong>.</li>
  <li>The output of OR Gate 3 produces the required Boolean expression:
    $$S = (P \\wedge Q) \\vee \\sim R$$
  </li>
</ol>`,
    explanation: 'Design problem from MTH202 Handouts Page 37–38.',
    urdu_answer: 'ان پٹس P اور Q کو AND گیٹ سے گزاریں، R کو NOT گیٹ سے گزاریں، اور پھر دونوں کے آؤٹ پٹس کو OR گیٹ میں جوڑ کر S حاصل کریں۔'
  },
  {
    stem: 'Problem: Determine the output signal S of the logic circuit with expression S = ~(P ∧ Q) ∨ R for the following input conditions:\na) P = 1, Q = 1, R = 0\nb) P = 1, Q = 0, R = 0',
    correct: `<p><strong>Evaluating Circuit Output $S = \\sim(P \\wedge Q) \\vee R$:</strong></p>

<h4>Case (a): When $P = 1, Q = 1, R = 0$:</h4>
<ol>
  <li>Evaluate the inner AND gate:
    $$P \\wedge Q = 1 \\wedge 1 = 1$$
  </li>
  <li>Apply the NOT gate inversion:
    $$\\sim(P \\wedge Q) = \\sim(1) = 0$$
  </li>
  <li>Evaluate the final OR operation with $R = 0$:
    $$S = \\sim(P \\wedge Q) \\vee R = 0 \\vee 0 = \\mathbf{0}$$
  </li>
</ol>
<p><strong>Output for Case (a):</strong> $S = \\mathbf{0}$ (Low / OFF).</p>

<h4>Case (b): When $P = 1, Q = 0, R = 0$:</h4>
<ol>
  <li>Evaluate the inner AND gate:
    $$P \\wedge Q = 1 \\wedge 0 = 0$$
  </li>
  <li>Apply the NOT gate inversion:
    $$\\sim(P \\wedge Q) = \\sim(0) = 1$$
  </li>
  <li>Evaluate the final OR operation with $R = 0$:
    $$S = \\sim(P \\wedge Q) \\vee R = 1 \\vee 0 = \\mathbf{1}$$
  </li>
</ol>
<p><strong>Output for Case (b):</strong> $S = \\mathbf{1}$ (High / ON).</p>`,
    explanation: 'Circuit evaluation from MTH202 Handouts Page 36.',
    urdu_answer: 'کیس (a) میں آؤٹ پٹ 0 نکلے گا کیونکہ $1 \\wedge 1=1$ اور الٹ کر 0، پھر $0 \\vee 0 = 0$۔ کیس (b) میں آؤٹ پٹ 1 نکلے گا کیونکہ $1 \\wedge 0=0$ کا الٹ 1، پھر $1 \\vee 0 = 1$۔'
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
    insMcq.run(lec5.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec5.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec5.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 5:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Circuit Problems: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 5: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

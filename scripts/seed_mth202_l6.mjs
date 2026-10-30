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

// 2. Adjust Lecture 5 title to focus on Rules of Inference
db.prepare(`
  UPDATE lectures 
  SET title = 'Rules of Inference & Proof Methods'
  WHERE subject_id = ? AND number = 5
`).run(mth202.id);

// 3. Create or fetch Lecture 6
let lec6 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 6").get(mth202.id);
if (!lec6) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 6, 'Digital Logic Circuits, Switching Networks & Boolean Expressions')
  `).run(mth202.id);
  lec6 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 6 with ID: ${lec6.id}`);
} else {
  console.log(`MTH202 Lecture 6 found with ID: ${lec6.id}`);
}

// 4. Clear existing questions for Lecture 6 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec6.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 6.`);

// 5. MCQs Data
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
    explanation: 'In digital circuit terminology and VU past paper answer keys, an AND-gate (or OR-gate) is designed with two input signals and produces a single output signal, while a NOT gate is an inverter with strictly one input (MTH202 Handouts Page 34). Appeared 12+ times across Moaaz, Junaid, and All in One.',
    urdu_answer: 'ڈیجیٹل سرکٹس میں دو ان پٹس اور ایک آؤٹ پٹ سگنل والے گیٹ کو بنیادی طور پر AND گیٹ کہا جاتا ہے۔'
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
    explanation: 'A NOT-gate (inverter) is a unary circuit that takes strictly one input signal and produces one inverted output signal (MTH202 Handouts Page 34). Appeared in Paper 4 and Handouts.',
    urdu_answer: 'ایک ان پٹ اور ایک آؤٹ پٹ سگنل والے سرکٹ کو NOT-gate یا انورٹر کہتے ہیں۔'
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
    explanation: 'An OR gate implements logical disjunction ($0 \\vee 1 = 1$). Its output state is 1 if either input or both inputs are 1 (MTH202 Handouts Page 35). Appeared 8+ times in Team Hadi and Waqar Sidhu.',
    urdu_answer: 'OR گیٹ کے ان پٹس 0 اور 1 ہونے پر آؤٹ پٹ 1 ہوتا ہے کیونکہ $0 \\vee 1 = 1$۔'
  },
  {
    stem: 'The logic gates OR and AND are unary operations on {0, 1}.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'A unary operation acts on a single operand (like NOT gate). OR and AND require two inputs, making them binary operations on $\\{0, 1\\}$ (MTH202 Handouts Page 34). Appeared in Grand Quiz 2020.',
    urdu_answer: 'یہ بیان غلط (False) ہے؛ AND اور OR دو ان پٹس لیتے ہیں اس لیے وہ بائنری آپریشنز ہیں۔'
  },
  {
    stem: 'The logic gate NOT is a unary operation on {0, 1}.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'A NOT gate takes exactly one binary input value and inverts it ($0 \\rightarrow 1, 1 \\rightarrow 0$), which makes it by definition a unary operation (MTH202 Handouts Page 34). Appeared in Grand Quiz 2020.',
    urdu_answer: 'یہ بیان درست (True) ہے کیونکہ NOT گیٹ صرف ایک ان پٹ پر عمل کرتا ہے لہٰذا یہ یونری آپریشن ہے۔'
  },
  {
    stem: 'The switches connected in series act just like __________.',
    options: {
      a: 'AND gate (∧)',
      b: 'OR gate (∨)',
      c: 'NOT gate (~)',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'In a series circuit, electricity can flow to illuminate the lamp only when both switch P AND switch Q are closed, perfectly modeling the logical AND ($\\wedge$) operation (MTH202 Handouts Page 34).',
    urdu_answer: 'سیریز میں جڑے ہوئے سوئچز AND گیٹ ($P \\wedge Q$) کی طرح کام کرتے ہیں کیونکہ کرنٹ کے لیے دونوں کا بند ہونا ضروری ہے۔'
  },
  {
    stem: 'The switches in parallel act just like __________.',
    options: {
      a: 'AND gate (∧)',
      b: 'OR gate (∨)',
      c: 'NOT gate (~)',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'In a parallel switching circuit, electricity can flow if either switch P OR switch Q (or both) is closed, modeling the logical OR ($\\vee$) operation (MTH202 Handouts Page 34). Appeared in Attiq Kundi and Handouts.',
    urdu_answer: 'پیرالل میں جڑے ہوئے سوئچز OR گیٹ ($P \\vee Q$) کی طرح کام کرتے ہیں کیونکہ کسی ایک کے بھی بند ہونے سے کرنٹ بہتا ہے۔'
  },
  {
    stem: 'In switching circuits, state 1 represents a closed switch (ON) and state 0 represents an open switch (OFF).',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'In electrical switching theory, state 1 denotes a closed (conducting/ON) switch allowing current to pass, whereas state 0 denotes an open (non-conducting/OFF) switch (MTH202 Handouts Page 34).',
    urdu_answer: 'سوئچنگ سرکٹس میں اسٹیٹ 1 بند سوئچ (آن) اور اسٹیٹ 0 کھلے سوئچ (آف) کو ظاہر کرتی ہے۔'
  }
];

// 6. Short Questions
const shorts = [
  {
    stem: 'Define NOT-gate, AND-gate, and OR-gate along with their input/output relations.',
    correct: `<p><strong>Fundamental Digital Logic Gates (MTH202 Handouts Page 34–35):</strong></p>
<ol>
  <li><strong>NOT-Gate (Inverter):</strong>
    <ul>
      <li>Receives <strong>1 input signal</strong> $P$ and yields <strong>1 inverted output signal</strong> $R = \\sim P$.</li>
      <li>Output rule: If input is $1$, output is $0$; if input is $0$, output is $1$.</li>
    </ul>
  </li>
  <li><strong>AND-Gate:</strong>
    <ul>
      <li>Receives <strong>2 input signals</strong> $P$ and $Q$ and yields output $R = P \\wedge Q$.</li>
      <li>Output rule: Outputs $1$ if and only if both $P=1$ and $Q=1$; otherwise outputs $0$.</li>
    </ul>
  </li>
  <li><strong>OR-Gate:</strong>
    <ul>
      <li>Receives <strong>2 input signals</strong> $P$ and $Q$ and yields output $R = P \\vee Q$.</li>
      <li>Output rule: Outputs $0$ if and only if both $P=0$ and $Q=0$; otherwise outputs $1$.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Basic logic gate specifications from MTH202 Handouts Page 34–35.',
    urdu_answer: 'NOT گیٹ سگنل کو الٹ دیتا ہے، AND گیٹ دونوں ان پٹس 1 ہونے پر 1 دیتا ہے، جبکہ OR گیٹ کسی ایک بھی ان پٹ کے 1 ہونے پر 1 دیتا ہے۔'
  },
  {
    stem: 'Differentiate between Switches in Series and Switches in Parallel with Circuit Rules.',
    correct: `<p><strong>Switches in Series vs. Switches in Parallel (MTH202 Handouts Page 34):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Feature</th>
      <th class="p-2 border">Switches in Series</th>
      <th class="p-2 border">Switches in Parallel</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Logical Connective</td>
      <td class="p-2 border">Conjunction ($P \\wedge Q$)</td>
      <td class="p-2 border">Disjunction ($P \\vee Q$)</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Conduction Rule</td>
      <td class="p-2 border">Current flows <strong>only</strong> if both switch $P$ <strong>AND</strong> switch $Q$ are closed (state 1).</td>
      <td class="p-2 border">Current flows if switch $P$ <strong>OR</strong> switch $Q$ (or both) is closed.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Open Switch Effect</td>
      <td class="p-2 border">Opening any single switch completely interrupts current flow.</td>
      <td class="p-2 border">Current can bypass an open switch through the parallel branch.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comparative electrical switching rules from MTH202 Handouts Page 34.',
    urdu_answer: 'سیریز میں دونوں سوئچز کا بند ہونا لازمی ہے ($P \\wedge Q$)، جبکہ پیرالل میں اگر کوئی ایک سوئچ بھی بند ہو تو کرنٹ گزر جاتا ہے ($P \\vee Q$)۔'
  },
  {
    stem: 'What is a Combinational Logic Circuit? State its Core Characteristics.',
    correct: `<p><strong>Combinational Logic Circuit (MTH202 Handouts Page 36):</strong></p>
<p>A combinational logic circuit is a digital circuit constructed by interconnecting fundamental logic gates (AND, OR, NOT) without memory elements or feedback loops.</p>
<ul>
  <li><strong>Instantaneous Determination:</strong> The output signal at any given instant depends entirely and solely on the specific combination of current binary input signals.</li>
  <li><strong>Absence of Memory:</strong> Combinational circuits do not store previous states or history (unlike sequential circuits such as flip-flops).</li>
  <li><strong>Boolean Function Representation:</strong> Every combinational circuit can be expressed mathematically as a Boolean algebraic expression and verified using an Input/Output table.</li>
</ul>`,
    explanation: 'Definition and features of combinational logic from MTH202 Handouts Page 36.',
    urdu_answer: 'کمبینیشنل سرکٹ بنیادی گیٹس سے مل کر بنتا ہے جس کا آؤٹ پٹ کسی بھی لمحے صرف موجودہ ان پٹس پر منحصر ہوتا ہے اور اس میں کوئی میموری نہیں ہوتی۔'
  },
  {
    stem: 'Problem: Write the Boolean expression for a circuit where switch P is placed in series with a parallel combination of switches Q and R.',
    correct: `<p><strong>Deriving Boolean Expression from Switching Configuration:</strong></p>
<ol>
  <li><strong>Parallel Component:</strong> Switches $Q$ and $R$ are connected in parallel, which translates to the logical disjunction:
    $$(Q \\vee R)$$
  </li>
  <li><strong>Series Component:</strong> Switch $P$ is connected in series with this entire combination, which translates to a logical conjunction:
    $$P \\wedge (Q \\vee R)$$
  </li>
</ol>
<p><strong>Final Boolean Expression:</strong></p>
$$\\mathbf{S = P \\wedge (Q \\vee R)}$$
<p>Current flows to turn the light ON if switch $P$ is closed AND at least one of switches $Q$ or $R$ is closed (MTH202 Handouts Page 35).</p>`,
    explanation: 'Switching network translation problem from MTH202 Handouts Page 35.',
    urdu_answer: 'پیرالل کا مطلب $(Q \\vee R)$ ہے اور سیریز کا مطلب $\\wedge$ ہے، لہٰذا مطلوبہ ایکسپریشن $P \\wedge (Q \\vee R)$ بنے گا۔'
  }
];

// 7. Long Questions & Circuit Analyses
const longs = [
  {
    stem: 'Write an Input/Output Table for the following Combinational Logic Circuit:\nInput signals: X = 1, Y = 0, Z = 0.\nCircuit Structure: Inputs X and Y enter an AND gate, the output goes into an OR gate alongside input Z, and the output of the OR gate passes through a NOT gate to produce final output S.',
    correct: `<p><strong>Circuit Signal Evaluation:</strong></p>
<p>Given input signals: $X = 1, Y = 0, Z = 0$.</p>

<h4>1. Stage-by-Stage Signal Computation:</h4>
<ol>
  <li><strong>Stage 1 (AND Gate):</strong>
    $$\\text{Intermediate Output 1} = X \\wedge Y = 1 \\wedge 0 = \\mathbf{0}$$
  </li>
  <li><strong>Stage 2 (OR Gate):</strong>
    $$\\text{Intermediate Output 2} = (X \\wedge Y) \\vee Z = 0 \\vee 0 = \\mathbf{0}$$
  </li>
  <li><strong>Stage 3 (NOT Gate / Final Signal $S$):</strong>
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

<p><strong>Result:</strong> For input combination $(1, 0, 0)$, the final output signal is $\\mathbf{1}$ (High / ON) (MTH202 Handouts Page 36–37 and Paper 6 Q27, 10 Marks).</p>`,
    explanation: '10-mark multi-gate circuit calculation from MTH202 Paper 6 Q27.',
    urdu_answer: 'ان پٹس (1, 0, 0) پر AND گیٹ 0 دے گا، پھر OR گیٹ 0 دے گا، اور آخر میں NOT گیٹ اسے 1 کر دے گا۔'
  },
  {
    stem: 'Construct a Combinational Logic Circuit for the Boolean expression: S = (P ∧ Q) ∨ ~R. Provide step-by-step gate connections.',
    correct: `<p><strong>Constructing Logic Circuit for $S = (P \\wedge Q) \\vee \\sim R$:</strong></p>

<h4>1. Gate Allocation:</h4>
<ul>
  <li><strong>Term 1 ($(P \\wedge Q)$):</strong> Requires a 2-input <strong>AND gate</strong>.</li>
  <li><strong>Term 2 ($\\sim R$):</strong> Requires a 1-input <strong>NOT gate (inverter)</strong>.</li>
  <li><strong>Main Combiner ($\\vee$):</strong> Requires a 2-input <strong>OR gate</strong> to join the two terms.</li>
</ul>

<h4>2. Step-by-Step Construction Procedure:</h4>
<ol>
  <li>Draw two input lines labeled $P$ and $Q$. Connect both lines to the inputs of an <strong>AND gate</strong>. The output wire yields $(P \\wedge Q)$.</li>
  <li>Draw a third input line labeled $R$. Pass it through a <strong>NOT gate (inverter)</strong>. The output wire yields $\\sim R$.</li>
  <li>Connect the output of the AND gate and the output of the NOT gate into the two input pins of an <strong>OR gate</strong>.</li>
  <li>The output terminal of the OR gate provides the complete Boolean output:
    $$S = (P \\wedge Q) \\vee \\sim R$$
  </li>
</ol>`,
    explanation: 'Circuit synthesis from Boolean expression from MTH202 Handouts Page 37–38.',
    urdu_answer: 'ان پٹس P اور Q کو AND گیٹ سے، R کو NOT گیٹ سے گزاریں اور دونوں کے نتائج کو OR گیٹ میں جوڑ کر S حاصل کریں۔'
  },
  {
    stem: 'Construct an Input/Output Table for the XOR (Exclusive-OR) Circuit defined by: S = (P ∨ Q) ∧ ~(P ∧ Q).',
    correct: `<p><strong>Input/Output Table for Exclusive-OR (XOR):</strong></p>
<p>The XOR operation evaluates to True (1) if either $P$ is 1 or $Q$ is 1, but NOT both: $S = (P \\vee Q) \\wedge \\sim(P \\wedge Q)$.</p>

<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$P$</th>
      <th class="p-2 border">$Q$</th>
      <th class="p-2 border">$P \\vee Q$</th>
      <th class="p-2 border">$P \\wedge Q$</th>
      <th class="p-2 border">$\\sim(P \\wedge Q)$</th>
      <th class="p-2 border font-bold bg-amber-50">Output: $S = (P \\vee Q) \\wedge \\sim(P \\wedge Q)$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
    <tr class="bg-emerald-50">
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr class="bg-emerald-50">
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold text-emerald-700">1</td>
    </tr>
    <tr>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">0</td>
      <td class="p-2 border">1</td>
      <td class="p-2 border font-bold">0</td>
    </tr>
  </tbody>
</table>

<p><strong>Conclusion:</strong> The output $S = 1$ exclusively when exactly one of the inputs is 1 (MTH202 Handouts Page 38).</p>`,
    explanation: 'Comprehensive truth table for XOR circuit from MTH202 Handouts Page 38.',
    urdu_answer: 'ایکسکلوسو-او آر (XOR) کا آؤٹ پٹ صرف تب 1 ہوتا ہے جب دونوں ان پٹس مختلف ہوں یعنی ایک 1 ہو اور دوسرا 0۔'
  },
  {
    stem: 'Problem: Find the output signal S for the circuit represented by S = ~(P ∧ Q) ∨ R under the following input conditions:\na) P = 1, Q = 1, R = 0\nb) P = 1, Q = 0, R = 0',
    correct: `<p><strong>Evaluating Circuit Expression $S = \\sim(P \\wedge Q) \\vee R$:</strong></p>

<h4>Case (a): $P = 1, Q = 1, R = 0$:</h4>
<ul>
  <li>Evaluate AND gate: $P \\wedge Q = 1 \\wedge 1 = 1$.</li>
  <li>Apply NOT inversion: $\\sim(P \\wedge Q) = \\sim(1) = 0$.</li>
  <li>Evaluate OR gate: $S = 0 \\vee R = 0 \\vee 0 = \\mathbf{0}$.</li>
</ul>
<p><strong>Result for (a):</strong> $S = \\mathbf{0}$.</p>

<h4>Case (b): $P = 1, Q = 0, R = 0$:</h4>
<ul>
  <li>Evaluate AND gate: $P \\wedge Q = 1 \\wedge 0 = 0$.</li>
  <li>Apply NOT inversion: $\\sim(P \\wedge Q) = \\sim(0) = 1$.</li>
  <li>Evaluate OR gate: $S = 1 \\vee R = 1 \\vee 0 = \\mathbf{1}$.</li>
</ul>
<p><strong>Result for (b):</strong> $S = \\mathbf{1}$.</p>`,
    explanation: 'Numerical circuit evaluation from MTH202 Handouts Page 36.',
    urdu_answer: 'کیس (a) میں آؤٹ پٹ 0 ہوگا کیونکہ دونوں ان پٹس 1 ہونے پر الٹ کر 0 ہو جائیں گے۔ کیس (b) میں آؤٹ پٹ 1 ہوگا۔'
  }
];

// 8. Insert Statements
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
    insMcq.run(lec6.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec6.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec6.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 6:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Circuit Problems: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 6: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

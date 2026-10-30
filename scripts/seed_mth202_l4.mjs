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

// 2. Create or fetch Lecture 4
let lec4 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 4").get(mth202.id);
if (!lec4) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 4, 'Valid and Invalid Arguments, Rules of Inference & Critical Rows')
  `).run(mth202.id);
  lec4 = { id: res.lastInsertRowid };
  console.log(`Created MTH202 Lecture 4 with ID: ${lec4.id}`);
} else {
  console.log(`MTH202 Lecture 4 found with ID: ${lec4.id}`);
}

// 3. Clear existing questions for Lecture 4 to avoid duplicates
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec4.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 4.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'An argument is __________ if the conclusion is true when all the premises are true.',
    options: {
      a: 'Valid',
      b: 'Invalid',
      c: 'False',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'An argument is valid if and only if the conclusion is true in every critical row (where all premises are true). Symbolically, $(P_1 \\wedge P_2 \\wedge \\dots \\wedge P_n) \\rightarrow C$ is a tautology (MTH202 Handouts Page 25). Appeared 15+ times in Moaaz, Junaid, Attiq Kundi, and Team Hadi files.',
    urdu_answer: 'ایک دلیل اس وقت درست (Valid) ہوتی ہے جب تمام مفروضات (Premises) سچ ہونے کی صورت میں نتیجہ بھی لازماً سچ ہو۔'
  },
  {
    stem: 'An argument is __________ if the conclusion is false when all the premises are true.',
    options: {
      a: 'Valid',
      b: 'Invalid',
      c: 'False',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'An argument is invalid if there is at least one row in the truth table where all the premises are true but the conclusion is false (a critical row yielding a false conclusion) (MTH202 Handouts Page 25). Appeared 10+ times in All in One, Moaaz, and Team Hadi.',
    urdu_answer: 'ایک دلیل غیر درست (Invalid) ہوتی ہے اگر تمام مفروضات سچ ہوں لیکن نتیجہ غلط (False) ہو جائے۔'
  },
  {
    stem: 'The row in the truth table of an argument where all premises are true is called __________.',
    options: {
      a: 'Valid row',
      b: 'Invalid row',
      c: 'Critical row',
      d: 'None of these'
    },
    correct: 'c',
    explanation: 'A critical row is defined as a row in the truth table in which all the premises evaluate to True (T) (MTH202 Handouts Page 25). Appeared 15+ times across Moaaz, Junaid, Waqar Sidhu, and Team Hadi.',
    urdu_answer: 'سچائی کے جدول (Truth Table) میں وہ قطار جس میں تمام مفروضات سچ ہوں، اہم قطار (Critical row) کہلاتی ہے۔'
  },
  {
    stem: 'A critical row is that in which __________ premises have truth value T.',
    options: {
      a: 'at least one',
      b: 'exactly one',
      c: 'all',
      d: 'at least two'
    },
    correct: 'c',
    explanation: 'By mathematical definition, a critical row requires ALL premises to possess the truth value True (T) simultaneously (MTH202 Handouts Page 25). Appeared 8+ times in Team Hadi and Waqar Sidhu.',
    urdu_answer: 'کریٹیکل رو وہ ہوتی ہے جس میں تمام (all) مفروضات کی ویلیو سچ (T) ہو۔'
  },
  {
    stem: 'An argument is valid if __________ of its premises implies conclusion.',
    options: {
      a: 'Disjunction',
      b: 'Conjunction',
      c: 'Negation',
      d: 'Conditional'
    },
    correct: 'b',
    explanation: 'An argument with premises $P_1, P_2, \\dots, P_n$ and conclusion $C$ is valid if and only if the conjunction of its premises implies the conclusion as a tautology: $(P_1 \\wedge P_2 \\wedge \\dots \\wedge P_n) \\rightarrow C$ (MTH202 Handouts Page 25).',
    urdu_answer: 'ایک دلیل درست ہوتی ہے اگر اس کے تمام مفروضات کا ملاپ یعنی کنجکشن (Conjunction) نتیجے کی طرف رہنمائی کرے۔'
  },
  {
    stem: 'Let $p_1, p_2, p_3$ be True premises in a given Truth Table. If the conjunctions of the Conclusion with each of $p_1, p_2, p_3$ are True, then the argument is __________.',
    options: {
      a: 'Valid',
      b: 'Invalid',
      c: 'False',
      d: 'True'
    },
    correct: 'a',
    explanation: 'If the conjunction of the conclusion with each true premise is True, the conclusion itself must be True whenever the premises are True. Therefore, the argument is Valid (MTH202 Handouts Page 25). Appeared 5+ times in Attiq Kundi and Grand Quiz 2020.',
    urdu_answer: 'اگر نتیجے کا ہر سچے مفروضے کے ساتھ کنجکشن سچ ہے تو نتیجہ بذاتِ خود سچ ہوگا اور دلیل درست (Valid) ہوگی۔'
  },
  {
    stem: 'Reductio ad absurdum law is symbolically denoted as __________.',
    options: {
      a: '$(p \\wedge q) \\rightarrow r \\equiv p \\rightarrow (q \\rightarrow r)$',
      b: '$p \\leftrightarrow q \\equiv (p \\rightarrow q) \\wedge (q \\rightarrow p)$',
      c: '$p \\rightarrow q \\equiv \\sim p \\vee q$',
      d: '$p \\rightarrow q \\equiv (p \\wedge \\sim q) \\rightarrow c$'
    },
    correct: 'd',
    explanation: 'The Reductio ad absurdum (proof by contradiction) law states that proving $p \\rightarrow q$ is logically equivalent to showing that assuming $p$ and the negation of $q$ leads to a contradiction $c$: $p \\rightarrow q \\equiv (p \\wedge \\sim q) \\rightarrow c$ (MTH202 Handouts Page 29). Appeared 6+ times in Team Hadi and Waqar Sidhu.',
    urdu_answer: 'ریڈکٹیو ایڈ ابسرڈم (تضاد سے ثبوت) کی علامتی شکل $p \\rightarrow q \\equiv (p \\wedge \\sim q) \\rightarrow c$ ہے۔'
  },
  {
    stem: 'Reductio ad absurdum is another name of __________.',
    options: {
      a: 'Proof by contradiction',
      b: 'Direct proof',
      c: 'Proof by contraposition',
      d: 'None of these'
    },
    correct: 'a',
    explanation: 'Reductio ad absurdum (Latin for "reduction to absurdity") is the classic philosophical and mathematical term for Proof by Contradiction (MTH202 Handouts Page 29). Appeared in Junaid past papers.',
    urdu_answer: 'ریڈکٹیو ایڈ ابسرڈم "تضاد سے ثبوت" (Proof by contradiction) کا دوسرا لاطینی نام ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Define Argument, Premises, and Conclusion in Mathematical Logic.',
    correct: `<p><strong>Mathematical Argument:</strong></p>
<p>An argument is a sequence of assertions (statements) consisting of one or more starting statements called <strong>premises</strong> (or assumptions/hypotheses), followed by a final statement called the <strong>conclusion</strong> (MTH202 Handouts Page 25).</p>
<ul>
  <li><strong>Premises ($P_1, P_2, \\dots, P_n$):</strong> Statements asserted as evidence, grounds, or reasons for accepting the conclusion.</li>
  <li><strong>Conclusion ($C$):</strong> The final claim that is asserted on the basis of the premises.</li>
</ul>
<p><strong>Standard Symbolic Form:</strong></p>
$$P_1, P_2, P_3, \\dots, P_n \\quad \\therefore C$$
<p>(The symbol $\\therefore$ is read as <em>"therefore"</em> and immediately precedes the conclusion).</p>`,
    explanation: 'Fundamental logical concepts from MTH202 Handouts Page 25.',
    urdu_answer: 'دلیل بیانات کی ایک ترتیب ہے جس میں شروعاتی بیانات کو مفروضات (Premises) اور آخری نتیجے والے بیان کو کنکلوژن (Conclusion) کہتے ہیں، جسے علامت $\\therefore$ سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'Define Valid and Invalid Arguments with Symbolic Conditions.',
    correct: `<p><strong>Valid vs. Invalid Arguments (MTH202 Handouts Page 25):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Type</th>
      <th class="p-2 border">Truth Condition</th>
      <th class="p-2 border">Symbolic Condition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Valid Argument</td>
      <td class="p-2 border">The conclusion $C$ is <strong>True</strong> in every critical row (where all premises $P_1, \\dots, P_n$ are True).</td>
      <td class="p-2 border">$(P_1 \\wedge P_2 \\wedge \\dots \\wedge P_n) \\rightarrow C$ is a <strong>tautology</strong>.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Invalid Argument</td>
      <td class="p-2 border">There exists at least one critical row where all premises are <strong>True</strong> but the conclusion $C$ is <strong>False</strong>.</td>
      <td class="p-2 border">$(P_1 \\wedge P_2 \\wedge \\dots \\wedge P_n) \\rightarrow C$ is <strong>NOT</strong> a tautology.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core mathematical validity definitions from MTH202 Handouts Page 25.',
    urdu_answer: 'اگر تمام مفروضات کے سچ ہونے پر نتیجہ لازمی سچ ہو تو دلیل Valid ہے، اور اگر مفروضات سچ ہوں مگر نتیجہ غلط ہو جائے تو دلیل Invalid کہلاتی ہے۔'
  },
  {
    stem: 'What is a Critical Row in a Truth Table? Explain its Role in Testing Validity.',
    correct: `<p><strong>Critical Row in a Truth Table:</strong></p>
<p>A <strong>critical row</strong> is any row in the truth table of an argument in which <strong>all premises</strong> evaluate to <strong>True (T)</strong> simultaneously (MTH202 Handouts Page 25–27).</p>
<p><strong>Role in Testing Validity:</strong></p>
<ol>
  <li>Non-critical rows (rows where one or more premises are False) are ignored in validity testing.</li>
  <li>If the conclusion is <strong>True in every critical row</strong>, the argument is <strong>Valid</strong>.</li>
  <li>If the conclusion is <strong>False in even a single critical row</strong>, that row serves as a counterexample, and the argument is <strong>Invalid</strong>.</li>
</ol>`,
    explanation: 'Critical row procedure from MTH202 Handouts Page 25–27 and Team Hadi past papers.',
    urdu_answer: 'کریٹیکل رو سچائی کے جدول کی وہ قطار ہے جہاں تمام مفروضات سچ (T) ہوں۔ اگر ان تمام قطاروں میں نتیجہ بھی سچ ہو تو دلیل درست ہوتی ہے، ورنہ غیر درست۔'
  },
  {
    stem: 'What is Hypothetical Syllogism? State its Rule and Symbolic Form.',
    correct: `<p><strong>Hypothetical Syllogism:</strong></p>
<p>Hypothetical Syllogism is a valid rule of inference / transitive argument form in propositional logic (MTH202 Handouts Page 29):</p>
$$\\begin{aligned}
p &\\rightarrow q \\\\
q &\\rightarrow r \\\\
\\hline
\\therefore p &\\rightarrow r
\\end{aligned}$$
<p><strong>Proof of Validity:</strong> The conditional statement $[(p \\rightarrow q) \\wedge (q \\rightarrow r)] \\rightarrow (p \\rightarrow r)$ evaluates to True in every possible truth assignment and is therefore a <strong>tautology</strong>.</p>`,
    explanation: 'Standard syllogism rule from MTH202 Handouts Page 29 and Student Subjective Papers Page 10.',
    urdu_answer: 'ہائپوتھیٹیکل سلوجزم منطق کا ایک درست اصول ہے: اگر $p \\rightarrow q$ اور $q \\rightarrow r$ سچ ہوں تو نتیجہ $\\therefore p \\rightarrow r$ بھی لازماً سچ ہوگا۔'
  },
  {
    stem: 'How do you check the validity and invalidity of an argument using Venn Diagrams?',
    correct: `<p><strong>Testing Argument Validity Using Venn Diagrams:</strong></p>
<ol>
  <li><strong>Identify Sets:</strong> Represent each categorical term or proposition present in the premises as an overlapping circular region (set) inside a universal set rectangle.</li>
  <li><strong>Represent Premises:</strong> Shade or mark regions to reflect the exact conditions asserted by each premise (e.g., subset containment for conditionals, empty regions for negative assertions).</li>
  <li><strong>Evaluate Conclusion:</strong> Inspect the resulting diagram to determine if the conclusion is unconditionally forced by the premises:
    <ul>
      <li>If the conclusion is <strong>automatically satisfied</strong> without any additional markings, the argument is <strong>Valid</strong>.</li>
      <li>If a region exists where the premises hold but the conclusion does not, that region is a counterexample, making the argument <strong>Invalid</strong>.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Diagrammatic method from MTH202 Subjective Papers and Handouts Page 30.',
    urdu_answer: 'وین ڈایاگرام کے ذریعے مفروضات کو دائروں کے سیٹس سے دکھایا جاتا ہے۔ اگر مفروضات کا علاقہ نتیجے کی مکمل تائید کرے تو دلیل درست ہے، بصورت دیگر غیر درست۔'
  }
];

// 6. Long Questions & Problem-Solving Proofs
const longs = [
  {
    stem: 'Show that the argument form $p \\rightarrow q, \\quad q \\quad \\therefore p$ is Invalid (Fallacy of the Converse / Converse Error).',
    correct: `<p><strong>Testing Validity of the Converse Argument Form:</strong></p>
<p>Premise 1: $p \\rightarrow q$<br>Premise 2: $q$<br>Conclusion: $\\therefore p$</p>

<h4>Truth Table Analysis:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$p$</th>
      <th class="p-2 border">$q$</th>
      <th class="p-2 border font-bold">Premise 1: $p \\rightarrow q$</th>
      <th class="p-2 border font-bold">Premise 2: $q$</th>
      <th class="p-2 border font-bold bg-amber-50">Conclusion: $p$</th>
      <th class="p-2 border">Row Status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-emerald-50">
      <td class="p-2 border">T</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border">Critical Row 1 (Conclusion = T)</td>
    </tr>
    <tr>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">Non-critical (Premises not both T)</td>
    </tr>
    <tr class="bg-rose-50">
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold text-red-600">F</td>
      <td class="p-2 border font-bold text-red-600">Critical Row 2 (Conclusion = F)</td>
    </tr>
    <tr>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">Non-critical (Premises not both T)</td>
    </tr>
  </tbody>
</table>

<p><strong>Evaluation &amp; Conclusion:</strong></p>
<ul>
  <li>Critical rows are Row 1 ($p=T, q=T$) and Row 3 ($p=F, q=T$).</li>
  <li>In Row 3, Premise 1 is True ($F \\rightarrow T \\equiv T$) and Premise 2 is True ($q = T$), but the Conclusion $p$ is <strong>False</strong>.</li>
  <li>Because there exists a critical row yielding a False conclusion, the argument is <strong>INVALID</strong>. This classical logical error is known as the <strong>Fallacy of the Converse (Converse Error)</strong>.</li>
</ul>`,
    explanation: 'Classic 3-mark to 5-mark subjective proof from MTH202 Handouts Page 26 and Paper 4 Q25.',
    urdu_answer: 'سچائی کے جدول کی تیسری قطار میں دونوں مفروضات سچ ہیں لیکن نتیجہ p غلط (F) ہے، لہٰذا یہ دلیل غیر درست ہے جسے Fallacy of Converse کہا جاتا ہے۔'
  },
  {
    stem: 'Prove using a Truth Table that Modus Ponens ($p \\rightarrow q, \\quad p \\quad \\therefore q$) is a Valid Argument Form.',
    correct: `<p><strong>Proving Validity of Modus Ponens (Method of Affirming):</strong></p>
<p>Premise 1: $p \\rightarrow q$<br>Premise 2: $p$<br>Conclusion: $\\therefore q$</p>

<h4>Truth Table Construction:</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$p$</th>
      <th class="p-2 border">$q$</th>
      <th class="p-2 border font-bold">Premise 1: $p \\rightarrow q$</th>
      <th class="p-2 border font-bold">Premise 2: $p$</th>
      <th class="p-2 border font-bold bg-amber-50">Conclusion: $q$</th>
      <th class="p-2 border">Row Status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-emerald-50">
      <td class="p-2 border">T</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold">T</td>
      <td class="p-2 border font-bold text-emerald-700">Critical Row 1 (Conclusion = T)</td>
    </tr>
    <tr>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">Non-critical (Premise 1 is F)</td>
    </tr>
    <tr>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">Non-critical (Premise 2 is F)</td>
    </tr>
    <tr>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">T</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">F</td>
      <td class="p-2 border">Non-critical (Premise 2 is F)</td>
    </tr>
  </tbody>
</table>

<p><strong>Evaluation &amp; Conclusion:</strong></p>
<ul>
  <li>Row 1 ($p=T, q=T$) is the <strong>only critical row</strong> in the table where both Premise 1 and Premise 2 are True.</li>
  <li>In this critical row, the Conclusion $q$ is also <strong>True (T)</strong>.</li>
  <li>Since the conclusion is True in every critical row, Modus Ponens is a <strong>VALID</strong> argument form.</li>
</ul>`,
    explanation: 'Fundamental rule of inference proof from MTH202 Handouts Page 26.',
    urdu_answer: 'جدول میں صرف پہلی قطار کریٹیکل ہے جہاں دونوں مفروضات سچ ہیں اور اس میں نتیجہ q بھی سچ ہے، لہٰذا موڈس پونینس ایک درست (Valid) دلیل ہے۔'
  },
  {
    stem: 'Use a Truth Table to determine whether the argument form $p \\vee q, \\quad p \\rightarrow \\sim q, \\quad p \\rightarrow r \\quad \\therefore r$ is Valid or Invalid.',
    correct: `<p><strong>Testing Validity of the Three-Variable Argument Form:</strong></p>
<p>Premises: (1) $p \\vee q$, (2) $p \\rightarrow \\sim q$, (3) $p \\rightarrow r$<br>Conclusion: $\\therefore r$</p>

<h4>Truth Table Construction ($2^3 = 8$ rows):</h4>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">$p$</th>
      <th class="p-2 border">$q$</th>
      <th class="p-2 border">$r$</th>
      <th class="p-2 border">$p \\vee q$</th>
      <th class="p-2 border">$p \\rightarrow \\sim q$</th>
      <th class="p-2 border">$p \\rightarrow r$</th>
      <th class="p-2 border font-bold bg-amber-50">Conclusion: $r$</th>
      <th class="p-2 border">Critical / Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">Non-critical</td></tr>
    <tr><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">Non-critical</td></tr>
    <tr class="bg-emerald-50"><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border font-bold">T</td><td class="p-2 border">Critical Row 1 (Conclusion = T)</td></tr>
    <tr><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">Non-critical</td></tr>
    <tr class="bg-emerald-50"><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border font-bold">T</td><td class="p-2 border">Critical Row 2 (Conclusion = T)</td></tr>
    <tr class="bg-rose-50"><td class="p-2 border font-bold">F</td><td class="p-2 border font-bold">T</td><td class="p-2 border font-bold">F</td><td class="p-2 border font-bold">T</td><td class="p-2 border font-bold">T</td><td class="p-2 border font-bold">T</td><td class="p-2 border font-bold text-red-600">F</td><td class="p-2 border font-bold text-red-600">Critical Row 3 (Conclusion = F)</td></tr>
    <tr><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">Non-critical</td></tr>
    <tr><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">F</td><td class="p-2 border">T</td><td class="p-2 border">T</td><td class="p-2 border">F</td><td class="p-2 border">Non-critical</td></tr>
  </tbody>
</table>

<p><strong>Evaluation &amp; Conclusion:</strong></p>
<ul>
  <li>The critical rows are Row 3 ($T, F, T$), Row 5 ($F, T, T$), and Row 6 ($F, T, F$).</li>
  <li>In <strong>Row 6</strong> ($p=\\text{False}, q=\\text{True}, r=\\text{False}$), all three premises are True:
    <ul>
      <li>$p \\vee q \\equiv F \\vee T \\equiv T$</li>
      <li>$p \\rightarrow \\sim q \\equiv F \\rightarrow F \\equiv T$</li>
      <li>$p \\rightarrow r \\equiv F \\rightarrow F \\equiv T$</li>
    </ul>
  </li>
  <li>However, the conclusion $r$ is <strong>False</strong> in Row 6.</li>
  <li>Therefore, the argument form is <strong>INVALID</strong> (MTH202 Handouts Page 26–27).</li>
</ul>`,
    explanation: 'Full 8-row truth table proof from MTH202 Handouts Page 26–27.',
    urdu_answer: 'چھٹی قطار میں (p=F, q=T, r=F) تینوں مفروضات سچ ہیں لیکن نتیجہ r غلط ہے، اس لیے یہ دلیل غیر درست (Invalid) ہے۔'
  },
  {
    stem: 'Problem: Test the validity of the following argument (Team Selection):\nPremise 1: If Tariq is not on team A, then Hameed is on team B.\nPremise 2: If Hameed is not on team B, then Tariq is on team A.\nConclusion: Tariq is not on team A or Hameed is not on team B.',
    correct: `<p><strong>Analyzing Team Selection Argument:</strong></p>
<p><strong>1. Assign Variables:</strong></p>
<ul>
  <li>Let $t$ = <em>"Tariq is on team A"</em></li>
  <li>Let $h$ = <em>"Hameed is on team B"</em></li>
</ul>

<p><strong>2. Translate to Symbolic Form:</strong></p>
<ul>
  <li>Premise 1: $\\sim t \\rightarrow h$</li>
  <li>Premise 2: $\\sim h \\rightarrow t$</li>
  <li>Conclusion: $\\therefore \\sim t \\vee \\sim h$</li>
</ul>

<p><strong>3. Test Critical Rows:</strong></p>
<p>Consider the row where both variables are True ($t = \\text{True}, h = \\text{True}$):</p>
<ul>
  <li>Premise 1: $\\sim t \\rightarrow h \\equiv \\text{False} \\rightarrow \\text{True} \\equiv \\textbf{True}$</li>
  <li>Premise 2: $\\sim h \\rightarrow t \\equiv \\text{False} \\rightarrow \\text{True} \\equiv \\textbf{True}$</li>
  <li>Both premises are True, making $(t = \\text{True}, h = \\text{True})$ a <strong>critical row</strong>.</li>
</ul>
<p>Now evaluate the conclusion in this critical row:</p>
$$\\sim t \\vee \\sim h \\equiv \\text{False} \\vee \\text{False} \\equiv \\textbf{False}$$

<p><strong>Conclusion:</strong></p>
<p>Because there is a critical row where all premises are True but the conclusion is False, the argument is <strong>INVALID</strong> (MTH202 Handouts Page 27–28).</p>`,
    explanation: 'Word problem validity proof from MTH202 Handouts Page 27–28.',
    urdu_answer: 'جب طارق ٹیم اے میں ہو اور حمید ٹیم بی میں ہو (دونوں True ہوں)، تو دونوں مفروضات سچ ہوتے ہیں لیکن نتیجہ False ہو جاتا ہے، اس لیے دلیل Invalid ہے۔'
  },
  {
    stem: 'Problem: Test the validity of the following argument (Divisibility Argument):\nPremise 1: If at least one of these two numbers is divisible by 6, then the product of these two numbers is divisible by 6.\nPremise 2: Neither of these two numbers is divisible by 6.\nConclusion: The product of these two numbers is not divisible by 6.',
    correct: `<p><strong>Analyzing Divisibility Argument:</strong></p>
<p><strong>1. Assign Variables:</strong></p>
<ul>
  <li>Let $d$ = <em>"At least one of the two numbers is divisible by 6"</em></li>
  <li>Let $p$ = <em>"The product of the two numbers is divisible by 6"</em></li>
</ul>

<p><strong>2. Translate to Symbolic Form:</strong></p>
<ul>
  <li>Premise 1: $d \\rightarrow p$</li>
  <li>Premise 2: $\\sim d$</li>
  <li>Conclusion: $\\therefore \\sim p$</li>
</ul>

<p><strong>3. Evaluate Validity (Counterexample):</strong></p>
<p>Consider the truth assignment where $d = \\text{False}$ and $p = \\text{True}$:</p>
<ul>
  <li>Premise 1: $d \\rightarrow p \\equiv \\text{False} \\rightarrow \\text{True} \\equiv \\textbf{True}$</li>
  <li>Premise 2: $\\sim d \\equiv \\sim \\text{False} \\equiv \\textbf{True}$</li>
  <li>Conclusion: $\\sim p \\equiv \\sim \\text{True} \\equiv \\textbf{False}$</li>
</ul>
<p><strong>Mathematical Real-world Counterexample:</strong></p>
<p>Let the two numbers be $2$ and $3$.</p>
<ul>
  <li>Neither $2$ nor $3$ is divisible by $6$ (so $\\sim d$ is True).</li>
  <li>However, their product is $2 \\times 3 = 6$, which is clearly divisible by $6$ (so $p$ is True, meaning the conclusion $\\sim p$ is False).</li>
</ul>
<p><strong>Conclusion:</strong></p>
<p>The argument is <strong>INVALID</strong>. This is the classical <strong>Fallacy of the Inverse (Inverse Error)</strong> (MTH202 Handouts Page 28).</p>`,
    explanation: 'Mathematical number theory counterexample and formal logic fallacy from MTH202 Handouts Page 28.',
    urdu_answer: 'یہ دلیل Fallacy of Inverse کی وجہ سے غیر درست (Invalid) ہے۔ مثال کے طور پر 2 اور 3 میں سے کوئی بھی 6 پر تقسیم نہیں ہوتا مگر ان کا حاصل ضرب 6 تقسیم ہو جاتا ہے۔'
  },
  {
    stem: "Problem: Test the validity of the following argument (Bonus and Motorcycle Argument):\nPremise 1: If I got an Eid bonus, I'll buy a stereo.\nPremise 2: If I sell my motorcycle, I'll buy a stereo.\nConclusion: If I get an Eid bonus or I sell my motorcycle, then I'll buy a stereo.",
    correct: `<p><strong>Analyzing Bonus and Motorcycle Argument:</strong></p>
<p><strong>1. Assign Variables:</strong></p>
<ul>
  <li>Let $e$ = <em>"I get an Eid bonus"</em></li>
  <li>Let $m$ = <em>"I sell my motorcycle"</em></li>
  <li>Let $s$ = <em>"I buy a stereo"</em></li>
</ul>

<p><strong>2. Translate to Symbolic Form:</strong></p>
<ul>
  <li>Premise 1: $e \\rightarrow s$</li>
  <li>Premise 2: $m \\rightarrow s$</li>
  <li>Conclusion: $\\therefore (e \\vee m) \\rightarrow s$</li>
</ul>

<p><strong>3. Proof of Validity:</strong></p>
<p>Using logical equivalences and rules of inference:</p>
$$\\begin{aligned}
(e \\rightarrow s) \\wedge (m \\rightarrow s) &\\equiv (\\sim e \\vee s) \\wedge (\\sim m \\vee s) \\\\
&\\equiv (\\sim e \\wedge \\sim m) \\vee s \\quad \\text{(Distributive Law)} \\\\
&\\equiv \\sim(e \\vee m) \\vee s \\quad \\text{(De Morgan's Law)} \\\\
&\\equiv (e \\vee m) \\rightarrow s \\quad \\text{(Conditional Law)}
\\end{aligned}$$
<p>The conjunction of the premises $[(e \\rightarrow s) \\wedge (m \\rightarrow s)]$ is strictly logically equivalent to the conclusion $(e \\vee m) \\rightarrow s$.</p>
<p>Therefore, whenever all premises are True, the conclusion must also be True in every critical row without exception.</p>
<p><strong>Conclusion:</strong></p>
<p>The argument is <strong>VALID</strong> (MTH202 Handouts Page 28–29).</p>`,
    explanation: 'Valid argument proof using truth table and logical equivalence laws from MTH202 Handouts Page 28–29.',
    urdu_answer: 'منطقی مساوات اور قوانین کے تحت دونوں مفروضات کا کنجکشن براہ راست نتیجے کے مساوی ہے، اس لیے یہ دلیل مکمل طور پر درست (Valid) ہے۔'
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
    insMcq.run(lec4.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec4.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec4.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into MTH202 Lecture 4:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long / Problem-Solving Proofs: ${longs.length}`);
console.log(`  - Total for MTH202 Lecture 4: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

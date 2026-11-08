import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS101
const cs101 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs101'").get();
if (!cs101) {
  console.error('CS101 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 15
let lec15 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 15").get(cs101.id);
if (!lec15) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 15, 'Problem-Solving Strategies, Heuristics, and Algorithm Design')
  `).run(cs101.id);
  lec15 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 15 with ID: ${lec15.id}`);
} else {
  console.log(`CS101 Lecture 15 found with ID: ${lec15.id}`);
}

const lId = lec15.id;

// 3. Clear existing questions for Lecture 15 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 15.`);

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

// 14 MCQs
const mcqs = [
  {
    stem: 'An algorithm that always makes the best immediate, locally optimal choice at each step without reconsidering previous decisions is called a:',
    options: {
      a: 'Deterministic Algorithm',
      b: 'Non-deterministic Algorithm',
      c: 'Greedy Algorithm',
      d: 'Randomized Algorithm'
    },
    correct: 'c',
    explanation: '<p>A <strong>Greedy Algorithm</strong> builds up a solution piece by piece, always choosing the next piece that offers the most immediate local benefit or profit, hoping this leads to a globally optimal solution.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers including <code>CS101 MIDTERM FILE 3</code> Q14, <code>FILE 6</code> Q15, and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 102.</p>',
    urdu_answer: 'لالچی الگورتھم (Greedy Algorithm) ہر مرحلے پر فوری اور مقامی طور پر بہترین (Local Best) انتخاب کرتا ہے، اس امید کے ساتھ کہ اس سے مجموعی بہترین حل حاصل ہوگا۔'
  },
  {
    stem: 'A rule-of-thumb computational procedure that usually, but not guaranteed always, works or provides a nearly optimal practical solution is called a:',
    options: {
      a: 'Formal Algorithm',
      b: 'Logarithm',
      c: 'Heuristic Algorithm',
      d: 'Deterministic Procedure'
    },
    correct: 'c',
    explanation: '<p>A <strong>Heuristic</strong> is a practical problem-solving technique or shortcut that is not guaranteed to be mathematically optimal or perfect, but is sufficient for reaching an immediate short-term goal or approximation.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>Cs101-latest -solved-midterm paper 5.pdf</code> Q1 & Q23 and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 102.</p>',
    urdu_answer: 'ہیورسٹک (Heuristic) ایک ایسا عملی اصول یا شارٹ کٹ طریقہ کار ہے جو عام طور پر تسلی بخش یا قریب ترین درست حل فراہم کرتا ہے، اگرچہ یہ سو فیصد درست ہونے کی ضمانت نہیں دیتا۔'
  },
  {
    stem: 'When an algorithm developed for a complex scenario delivers desired approximate results within reasonable time while exact methods take unacceptable computation time, it is termed a:',
    options: {
      a: 'Monte Carlo Algorithm',
      b: 'Greedy Algorithm',
      c: 'Deterministic Algorithm',
      d: 'Heuristic'
    },
    correct: 'd',
    explanation: '<p>When exact algorithmic solutions are computationally intractable (NP-complete problems), computer scientists employ <strong>Heuristics</strong> to trade theoretical optimality for fast, practical execution time.</p><p><strong>Reference:</strong> Appeared in <code>CS101 - 3.pdf</code> (Q14) and <code>CS101 MIDTERM FILE 6 SOLVED BY TEAM HADI.pdf</code> (Q14).</p>',
    urdu_answer: 'جب کوئی مسئلہ اتنا پیچیدہ ہو کہ اس کا مکمل درست حل نکالنے میں ضرورت سے زیادہ وقت درکار ہو، تو مناسب وقت میں مطلوبہ تخمینی نتائج حاصل کرنے کے لیے ہیورسٹکس (Heuristics) استعمال کی جاتی ہیں۔'
  },
  {
    stem: 'The Monte Carlo algorithm, which relies on repeated random sampling to compute numerical results, is an example of a:',
    options: {
      a: 'Randomized Algorithm',
      b: 'Greedy Algorithm',
      c: 'Deterministic Algorithm',
      d: 'Linear Algorithm'
    },
    correct: 'a',
    explanation: '<p>The <strong>Monte Carlo Algorithm</strong> is a classic <em>Randomized Algorithm</em> whose running time or output accuracy depends on random numbers generated during execution.</p><p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 2, Q3).</p>',
    urdu_answer: 'مونٹی کارلو الگورتھم (Monte Carlo Algorithm) رینڈمائزڈ الگورتھمز (Randomized Algorithms) کی ایک کلاسیکی مثال ہے جو نتائج نکالنے کے لیے بے ترتیب نمبرز (Random Numbers) پر انحصار کرتا ہے۔'
  },
  {
    stem: 'Any algorithm whose execution behavior and path are determined not only by its inputs but also by values supplied by a pseudo-random number generator is classified as a:',
    options: {
      a: 'Deterministic Algorithm',
      b: 'Non-deterministic Algorithm',
      c: 'Randomized Algorithm',
      d: 'Brute Force Algorithm'
    },
    correct: 'c',
    explanation: '<p>A <strong>Randomized Algorithm</strong> employs a degree of randomness as part of its logic, meaning multiple runs with the exact same input may follow different execution sequences.</p><p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers.pdf</code> (Q28).</p>',
    urdu_answer: 'ایسا الگورتھم جس کی اندرونی کارکردگی اور فیصلہ سازی میں ان پٹ کے ساتھ ساتھ رینڈم نمبر جنریٹر کی ویلیوز بھی شامل ہوں، رینڈمائزڈ الگورتھم کہلاتا ہے۔'
  },
  {
    stem: 'In algorithmic problem solving, the stepwise refinement technique is a strategy designed to conquer a complex ________ by decomposing it into manageable subcomponents.',
    options: {
      a: 'Task / Problem',
      b: 'Subtask only',
      c: 'Loop statement',
      d: 'Hardware register'
    },
    correct: 'a',
    explanation: '<p>Stepwise refinement (modular decomposition) allows programmers to master an overwhelmingly complex <strong>task or problem</strong> by breaking it down progressively into smaller, manageable subtasks.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 MID by Attiq Kundi.pdf</code> Q125.</p>',
    urdu_answer: 'اسٹیپ وائز ریفائنمنٹ (Stepwise Refinement) ایک ایسی تکنیک ہے جس کے ذریعے کسی بھی پیچیدہ کام (Task) کو چھوٹے اور قابل انتظام ذیلی حصوں میں تقسیم کر کے حل کیا جاتا ہے۔'
  },
  {
    stem: 'Stepwise refinement is characterized as a __________ methodology because it systematically progresses from the general overview down to specific low-level implementations.',
    options: {
      a: 'Bottom-Up',
      b: 'Top-Down',
      c: 'Left-to-Right',
      d: 'Right-to-Left'
    },
    correct: 'b',
    explanation: '<p>The <strong>Top-Down</strong> methodology starts with the high-level abstract conceptual model and breaks it down incrementally into concrete, detailed program statements.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers including <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q94.</p>',
    urdu_answer: 'ٹاپ ڈاؤن (Top-Down) طریقہ کار اوپر سے نیچے کی طرف بڑھتا ہے، یعنی یہ عمومی تصور (General) سے شروع ہو کر مخصوص تفصیلات (Specific) کی طرف مرحلہ وار ترقی کرتا ہے۔'
  },
  {
    stem: 'Which software development methodology begins by constructing basic, specific low-level components and gradually integrates them upward to assemble the general overall system?',
    options: {
      a: 'Top-Down Methodology',
      b: 'Bottom-Up Methodology',
      c: 'Stepwise Refinement',
      d: 'Linear Waterfall'
    },
    correct: 'b',
    explanation: '<p>The <strong>Bottom-Up</strong> methodology starts by writing and testing specific building-block functions or modules and combines them into increasingly complex subsystems until the final application is completed.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 MID by Attiq Kundi.pdf</code> Q126.</p>',
    urdu_answer: 'باٹم اپ (Bottom-Up) طریقہ کار مخصوص نچلی سطح کے ماڈیولز (Specific) کی تیاری سے شروع ہو کر اوپر کی طرف پورے سسٹم (General) کو جوڑتا ہے۔'
  },
  {
    stem: 'The classic four-phase problem-solving framework (Understand, Devise a Plan, Carry Out, Look Back) was published by mathematician George Polya in the year:',
    options: {
      a: '1937',
      b: '1945',
      c: '1950',
      d: '1984'
    },
    correct: 'b',
    explanation: '<p>George Polya introduced his celebrated four-phase problem-solving model in his landmark book <em>"How to Solve It"</em> published in <strong>1945</strong>.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 MID by Attiq Kundi.pdf</code> Q144 and <code>CS101 MID-Term by Attiq Kundi</code>.</p>',
    urdu_answer: 'معروف ریاضی دان جارج پولیا (George Polya) نے مسئلہ حل کرنے کے چار بنیادی مراحل پر مشتمل ماڈل 1945 میں اپنی کتاب "How to Solve It" میں پیش کیا تھا۔'
  },
  {
    stem: 'In structured programming theory, which of the following is NOT considered one of the three fundamental control building blocks of an algorithm?',
    options: {
      a: 'Single Standalone Statements',
      b: 'Sequences (Step-by-step execution)',
      c: 'Conditionals (Selection / If-Else)',
      d: 'Repetitions (Iteration / Loops)'
    },
    correct: 'a',
    explanation: '<p>According to the Böhm-Jacopini theorem, the three canonical structural building blocks of any algorithm are <strong>Sequences, Conditionals (Selection), and Repetitions (Loops)</strong>. Standalone statements alone without these control structures do not form algorithm logic.</p><p><strong>Reference:</strong> Appeared 6+ times in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 107 Q21.</p>',
    urdu_answer: 'اسٹرکچرڈ پروگرامنگ میں الگورتھم کے تین بنیادی بلاکس ترتیب (Sequences)، شرائط (Conditionals)، اور تکرار (Repetitions) ہیں؛ سادہ اسٹیٹمنٹ بذاتِ خود بنیادی کنٹرول بلاک نہیں ہے۔'
  },
  {
    stem: 'According to computer science fundamentals in CS101, algorithms can broadly be classified into how many primary computational strategy paradigms?',
    options: {
      a: '1',
      b: '2',
      c: '3 (Greedy, Deterministic, and Randomized)',
      d: '5'
    },
    correct: 'c',
    explanation: '<p>In CS101 handouts, algorithms are classified across <strong>3</strong> core paradigms: Greedy algorithms, Deterministic algorithms, and Randomized algorithms.</p><p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 76 Q5.</p>',
    urdu_answer: 'سی ایس 101 نصاب کے مطابق الگورتھمز کو بنیادی طور پر 3 حکمت عملیوں میں تقسیم کیا گیا ہے: لالچی (Greedy)، حتمی (Deterministic)، اور رینڈمائزڈ (Randomized)۔'
  },
  {
    stem: 'When executing a Sequential (Linear) Search on an unsorted list containing n elements, what is the average number of comparisons required to locate a target item?',
    options: {
      a: 'n / 2',
      b: 'log2(n)',
      c: 'n^2',
      d: '1'
    },
    correct: 'a',
    explanation: '<p>In a linear search of an unsorted list of size <em>n</em>, the target may appear at any position with equal probability, yielding an average of <strong>n / 2</strong> comparisons.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID by Attiq Kundi.pdf</code> Page 39 and <code>CS101 MIDTERM FILE 7 SOLVED BY TEAM HADI.pdf</code> Q15.</p>',
    urdu_answer: 'جب کسی غیر ترتیب شدہ لسٹ میں لکیری تلاش (Sequential Search) کی جائے تو اوسطاً n/2 موازنے (Comparisons) درکار ہوتے ہیں۔'
  },
  {
    stem: 'When executing a Binary Search on a sorted array of n elements, the average and worst-case number of comparisons is proportional to:',
    options: {
      a: 'log2(n)',
      b: 'n / 2',
      c: 'n * log2(n)',
      d: 'n^2'
    },
    correct: 'a',
    explanation: '<p>Binary search repeatedly divides the search interval in half, requiring at most <strong>log2(n)</strong> comparisons to find the target element or conclude it is absent.</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID by Attiq Kundi.pdf</code> Page 39.</p>',
    urdu_answer: 'ترتیب شدہ لسٹ میں بائنری سرچ کے ذریعے کسی عنصر کو تلاش کرنے کے لیے اوسط اور بدترین صورت میں log2(n) موازنے درکار ہوتے ہیں۔'
  },
  {
    stem: 'For an unsorted array of 6 elements, how many sorting passes/iterations are required by the standard Insertion Sort algorithm to guarantee a fully sorted list?',
    options: {
      a: '5 passes',
      b: '6 passes',
      c: '15 passes',
      d: '36 passes'
    },
    correct: 'a',
    explanation: '<p>For an array of <em>n</em> elements, Insertion Sort requires <strong>n - 1</strong> passes (since an array of 1 element is trivially sorted). For n = 6, <code>6 - 1 = 5</code> passes are required.</p><p><strong>Reference:</strong> Appeared in <code>CS101 Mid Term By JUANID.pdf</code> Q2.</p>',
    urdu_answer: 'انسرشن سارٹ (Insertion Sort) میں n عناصر کی لسٹ کو ترتیب دینے کے لیے n - 1 پاسز درکار ہوتے ہیں۔ چنانچہ 6 عناصر کے لیے 5 پاسز درکار ہوں گے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is a Heuristic? Explain when heuristics are preferred over formal exact algorithms.',
    correct: `<p>A <strong>Heuristic</strong> is a practical rule-of-thumb strategy, guideline, or simplified procedure used to solve difficult problems rapidly when classical exact algorithms are either too slow or impractical.</p>
<h4>When Heuristics are Preferred:</h4>
<ul>
  <li><strong>Intractable Problems:</strong> For NP-hard or NP-complete problems (e.g., Travelling Salesperson Problem) where finding an exact mathematical solution requires exponential time \(O(2^n)\).</li>
  <li><strong>Time-Critical Decisions:</strong> In real-time computer systems, robotics, and game AI (like chess engines) where an immediate "good enough" approximation is required before deadlines pass.</li>
  <li><strong>Incomplete Information:</strong> When full problem parameters are unknown or evolving dynamically.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>cs101 solveds mcqs mega files for papers with 115 papes.pdf</code> (Page 31, Q31) and <code>cs101 midterm subjective by moaaz.pdf</code> (Page 1, Q31).</p>',
    urdu_answer: 'ہیورسٹک ایک عملی شارٹ کٹ یا اصول ہے جو پیچیدہ مسائل کا فوری اور مناسب حل فراہم کرتا ہے۔ یہ اس وقت استعمال ہوتا ہے جب ریاضیاتی طور پر مکمل درست حل نکالنا ناممکن یا بے تحاشا وقت طلب ہو، جیسے شطرنج کے کھیل یا روٹ پلاننگ میں جہاں بروقت فیصلے درکار ہوتے ہیں۔'
  },
  {
    stem: 'What is the Brute Force Strategy in problem-solving? Give an example and state its primary disadvantage.',
    correct: `<p>The <strong>Brute Force Strategy</strong> (exhaustive search) is a straightforward problem-solving approach that systematically evaluates every single possible candidate solution in the search space until the correct answer is found.</p>
<ul>
  <li><strong>Example:</strong> Cracking a 4-digit numeric PIN by systematically testing all 10,000 combinations from <code>0000</code> to <code>9999</code>.</li>
  <li><strong>Primary Disadvantage:</strong> <strong>Poor Scalability / High Computational Inefficiency.</strong> As the problem size \(n\) grows, the search space experiences combinatorial explosion (e.g., \(O(n!)\) or \(O(2^n)\)), causing execution time to quickly become astronomical and computationally impossible.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>Cs101-latest -solved-midterm paper 6.pdf</code> (Q27) and <code>CS101Introduction_to_Computing_Mid_term_Solved_2010_All_in_One_File.pdf</code> (Q27).</p>',
    urdu_answer: 'بروٹ فورس (Brute Force) طریقہ کار میں بغیر کسی سمارٹ منطق کے تمام ممکنہ حلوں کو ایک ایک کر کے آزمایا جاتا ہے (جیسے پاس ورڈ کریک کرنے کے لیے تمام نمبرز ٹرائی کرنا)۔ اس کا سب سے بڑا نقصان یہ ہے کہ بڑے مسائل میں یہ بے انتہا وقت لیتا ہے اور سست ترین طریقہ ہے۔'
  },
  {
    stem: 'What is the Ockham’s Razor principle, and how does it apply to algorithm design and scientific problem-solving?',
    correct: `<p><strong>Ockham’s Razor</strong> (attributed to 14th-century Franciscan friar William of Ockham) is a philosophical and problem-solving guiding principle stating: <em>"Pluralitas non est ponenda sine necessitate"</em> (Entities should not be multiplied beyond necessity).</p>
<h4>Application to Computer Science:</h4>
<ol>
  <li><strong>Simplest Solution is Best:</strong> When multiple competing algorithms or hypotheses explain a set of facts or solve a problem equally well, the simplest one with the fewest assumptions should be preferred.</li>
  <li><strong>Code Maintainability:</strong> Over-engineered algorithms introduce hidden bugs, brittle dependencies, and maintenance overhead; simpler algorithms are easier to prove correct, debug, and optimize.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 solved.pdf</code> (Page 23, Q17).</p>',
    urdu_answer: 'اوکھمز ریزر (Ockham’s Razor) کا اصول یہ کہتا ہے کہ جب کسی مسئلے کے متعدد حل موجود ہوں تو ہمیشہ سب سے سادہ اور کم مفروضوں والے حل کو ترجیح دی جانی چاہیے۔ کمپیوٹر سائنس میں اس کا مطلب ہے کہ بلاوجہ پیچیدہ کوڈ یا الگورتھم لکھنے کے بجائے سادہ اور سیدھا ڈیزائن اپنایا جائے۔'
  },
  {
    stem: 'Define a Randomized Algorithm and state its main advantages over a strictly deterministic algorithm.',
    correct: `<p>A <strong>Randomized Algorithm</strong> is an algorithm that makes random choices during its execution by utilizing a source of random or pseudo-random numbers to guide its logic or state transitions (e.g., Randomized QuickSort, Monte Carlo algorithms).</p>
<h4>Main Advantages over Deterministic Algorithms:</h4>
<ul>
  <li><strong>Avoiding Worst-Case Traps:</strong> Deterministic algorithms can be tricked by specific adversarial inputs into hitting pathological worst-case performance (e.g., \(O(n^2)\) on sorted arrays in deterministic Quicksort); randomization guarantees expected high performance across all inputs.</li>
  <li><strong>Simplicity:</strong> Randomized algorithms are often dramatically simpler and easier to implement than complex deterministic counterparts with identical asymptotic bounds.</li>
  <li><strong>Scalability in High Dimensions:</strong> Used in numerical integration and machine learning optimization where deterministic grid evaluation is impossible.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101AllPastSolvedMidTermPapersinonefileMidtermPapers (1).pdf</code> (Q28).</p>',
    urdu_answer: 'رینڈمائزڈ الگورتھم اپنی پروسیسنگ کے دوران رینڈم نمبرز کی مدد سے فیصلے کرتا ہے۔ اس کا سب سے بڑا فائدہ یہ ہے کہ یہ بدترین صورتحال (Worst-case) سے بچاتا ہے، اس کا کوڈ روایتی طریقوں کے مقابلے میں سادہ ہوتا ہے اور یہ بڑے ڈیٹا سیٹس پر بہت تیز نتائج دیتا ہے۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Elaborate the definition and operational mechanism of a Greedy Algorithm. Provide a solid real-world example where the greedy approach yields an optimal solution, and a counter-example where it fails to produce the global optimum.',
    correct: `<p>A <strong>Greedy Algorithm</strong> is a problem-solving heuristic strategy that builds a solution step by step, choosing at each stage the locally optimal choice that offers the highest immediate gain, without back-tracking or looking ahead.</p>

<h4>1. Example Where Greedy Works (Optimal):</h4>
<p><strong>Standard Coin Change Problem:</strong> Make change for 36 cents using American coinage (quarters = 25¢, dimes = 10¢, nickels = 5¢, pennies = 1¢):</p>
<ul>
  <li>Step 1: Choose the largest denomination &le; 36¢ &rarr; Take <strong>1 Quarter (25¢)</strong>. Remaining = 11¢.</li>
  <li>Step 2: Choose largest &le; 11¢ &rarr; Take <strong>1 Dime (10¢)</strong>. Remaining = 1¢.</li>
  <li>Step 3: Choose largest &le; 1¢ &rarr; Take <strong>1 Penny (1¢)</strong>. Remaining = 0¢.</li>
  <li>Total coins = 3 (25 + 10 + 1), which is mathematically optimal.</li>
</ul>

<h4>2. Counter-Example Where Greedy Fails (Non-Optimal):</h4>
<p>Suppose the available currency denominations are <strong>1¢, 7¢, and 10¢</strong>, and we need change for <strong>14¢</strong>:</p>
<ul>
  <li><strong>Greedy Choice:</strong> Picks 10¢ first (leaving 4¢), then four 1¢ coins &rarr; <code>10 + 1 + 1 + 1 + 1 = 14¢</code> (<strong>5 coins total</strong>).</li>
  <li><strong>True Global Optimum:</strong> Pick two 7¢ coins &rarr; <code>7 + 7 = 14¢</code> (<strong>2 coins total</strong>).</li>
  <li><em>Conclusion:</em> Because greedy never looks ahead or reconsiders earlier decisions, it fell into a sub-optimal trap.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 solved.pdf</code> (Question No. 23, 5 Marks).</p>',
    urdu_answer: 'لالچی الگورتھم ہر قدم پر فوری طور پر سب سے بڑے فائدے کا انتخاب کرتا ہے۔ مثال کے طور پر روایتی سکوں (25، 10، 5، 1) سے 36 پیسے کی ریزگاری میں یہ سب سے پہلے 25 کا سکہ، پھر 10 کا، اور پھر 1 کا لے کر کل 3 سکوں میں درست حل دیتا ہے۔ لیکن اگر سکے 10، 7 اور 1 کے ہوں اور 14 پیسے بنانے ہوں تو لالچی طریقہ 10 کا ایک اور 1 کے چار سکے لے کر 5 سکے بنائے گا، جبکہ بہترین حل 7 کے 2 سکے تھے۔ یہ ثابت کرتا ہے کہ لالچی الگورتھم ہر جگہ کامیاب نہیں ہوتا۔'
  },
  {
    stem: 'Discuss George Polya\'s four fundamental problem-solving phases (1945). In detail, compare the Top-Down (Stepwise Refinement) methodology with the Bottom-Up methodology in software engineering.',
    correct: `<p>In his 1945 classic <em>"How to Solve It"</em>, mathematician <strong>George Polya</strong> formulated four systematic phases for tackling complex intellectual problems:</p>

<h4>1. Polya\'s Four Problem-Solving Phases:</h4>
<ol>
  <li><strong>Understand the Problem:</strong> Clearly identify the unknown, the given data, and the constraints; determine whether the data is sufficient.</li>
  <li><strong>Devise a Plan:</strong> Find connections between the data and the goal; draw diagrams, look for patterns, or use heuristics/analogies to previously solved problems.</li>
  <li><strong>Carry Out the Plan:</strong> Implement each step carefully, verifying every line of logic or code for correctness.</li>
  <li><strong>Look Back (Reflect & Review):</strong> Examine the result obtained, verify edge cases, and ask whether the solution can be simplified or applied to other domains.</li>
</ol>

<h4>2. Top-Down vs. Bottom-Up Methodologies:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Criterion</th>
      <th>Top-Down (Stepwise Refinement)</th>
      <th>Bottom-Up Methodology</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Direction</strong></td>
      <td>General &rarr; Specific (Abstract to Concrete).</td>
      <td>Specific &rarr; General (Concrete to Abstract).</td>
    </tr>
    <tr>
      <td><strong>Approach</strong></td>
      <td>Decomposes the high-level system into smaller sub-modules iteratively until reaching individual code statements.</td>
      <td>Constructs individual, self-contained reusable building blocks first, then links them into higher-level subsystems.</td>
    </tr>
    <tr>
      <td><strong>Testing</strong></td>
      <td>Requires temporary mock functions or <em>stubs</em> to test high-level control logic before sub-modules are built.</td>
      <td>Requires testing harnesses or <em>drivers</em> to verify unit modules before system integration.</td>
    </tr>
    <tr>
      <td><strong>Best Suited For</strong></td>
      <td>Architectural planning, system design, and large enterprise application structuring.</td>
      <td>Library development, utility creation, and Object-Oriented component reuse.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MID by Attiq Kundi.pdf</code> (Q126, Q144) and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> (Q94).</p>',
    urdu_answer: 'جارج پولیا نے 1945 میں مسئلہ حل کرنے کے چار مراحل بتائے: (1) مسئلے کو سمجھنا، (2) حکمت عملی یا منصوبہ بنانا، (3) منصوبے پر عمل کرنا، اور (4) حاصل شدہ نتائج کا جائزہ لینا۔ ٹاپ ڈاؤن طریقہ کار میں بڑے مسئلے کو اوپر سے نیچے چھوٹے حصوں میں تقسیم کیا جاتا ہے، جبکہ باٹم اپ طریقہ کار میں پہلے بنیادی چھوٹے ماڈیولز بنائے جاتے ہیں اور پھر انہیں جوڑ کر بڑا سافٹ ویئر تیار کیا جاتا ہے۔'
  }
];

// 4. Insert All Questions
console.log('Inserting MCQs...');
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Short Questions...');
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Long Questions...');
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

// 5. Verification
const countLec = db.prepare('SELECT COUNT(*) as cnt FROM questions WHERE lecture_id = ?').get(lId);
const countTotal = db.prepare('SELECT COUNT(*) as cnt FROM questions').get();
const totalLectures = db.prepare('SELECT COUNT(*) as cnt FROM lectures').get();
const totalSubjects = db.prepare('SELECT COUNT(*) as cnt FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS101 Lecture 15 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

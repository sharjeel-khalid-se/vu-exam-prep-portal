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

// 2. Create or fetch Lecture 16
let lec16 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 16").get(cs101.id);
if (!lec16) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 16, 'Searching and Sorting Algorithms, Recursion, and Complexity Analysis')
  `).run(cs101.id);
  lec16 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 16 with ID: ${lec16.id}`);
} else {
  console.log(`CS101 Lecture 16 found with ID: ${lec16.id}`);
}

const lId = lec16.id;

// 3. Clear existing questions for Lecture 16 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 16.`);

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
    stem: 'When applied to an unsorted list with n entries, the Sequential (Linear) Search algorithm will interrogate an average of ______ entries to locate a target item.',
    options: {
      a: 'n',
      b: 'n / 2',
      c: '2n',
      d: 'n * n'
    },
    correct: 'b',
    explanation: '<p>Since a target element has an equal probability of appearing at any position from 1 to <em>n</em> in an unsorted list, the average number of comparisons is <strong>n / 2</strong>.</p><p><strong>Reference:</strong> Appeared 20+ times across past papers including <code>CS101 MIDTERM FILE 3</code> Q23, <code>CS101 MID by Attiq Kundi.pdf</code> Page 39, and <code>cs101-lecturewise-midterm.pdf</code> Q145.</p>',
    urdu_answer: 'جب کسی غیر ترتیب شدہ لسٹ میں لکیری تلاش (Sequential Search) کی جائے تو اوسطاً n/2 اندراجات کی جانچ پڑتال کرنی پڑتی ہے۔'
  },
  {
    stem: 'When applied to a sorted list with n entries, the Binary Search algorithm will interrogate an average of ______ entries.',
    options: {
      a: 'log2(n)',
      b: 'n / 2',
      c: 'n',
      d: 'n * log2(n)'
    },
    correct: 'a',
    explanation: '<p>Binary search eliminates half the remaining elements with every single comparison, resulting in an average and worst-case comparison complexity of <strong>log2(n)</strong>.</p><p><strong>Reference:</strong> Appeared 18+ times in <code>CS101 MIDTERM FILE 7 SOLVED BY TEAM HADI.pdf</code> Q15 and <code>CS101 MID by Attiq Kundi.pdf</code>.</p>',
    urdu_answer: 'ترتیب شدہ لسٹ میں بائنری سرچ کے ذریعے مطلوبہ عنصر کو تلاش کرنے کے لیے اوسطاً log2(n) اندراجات کی جانچ پڑتال درکار ہوتی ہے۔'
  },
  {
    stem: 'Which of the following is the most significant disadvantage of the Linear (Sequential) Search algorithm compared to Binary Search?',
    options: {
      a: 'It requires significantly higher auxiliary memory space',
      b: 'It exhibits greater time complexity O(n) making it very slow on large datasets',
      c: 'It is conceptually difficult to understand and implement',
      d: 'It strictly requires the list to be pre-sorted in ascending order'
    },
    correct: 'b',
    explanation: '<p>Linear search has an <strong>O(n) time complexity</strong>, which scales poorly and becomes prohibitively slow when searching lists containing millions of records.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101 MID Term by VU Stars 01.pdf</code> Q1 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q91.</p>',
    urdu_answer: 'لکیری تلاش (Linear Search) کا سب سے بڑا نقصان اس کی زیادہ ٹائم کمپلیکسٹی O(n) ہے، جس کی وجہ سے یہ بڑے ڈیٹا سیٹس پر بہت زیادہ وقت لیتی ہے۔'
  },
  {
    stem: 'While sequential search executes through iterative loops, binary search naturally decomposes each stage into a smaller subtask of the previous stage, a programming technique known as:',
    options: {
      a: 'Static Iteration',
      b: 'Recursion',
      c: 'Infinite Looping',
      d: 'Linear Traversal'
    },
    correct: 'b',
    explanation: '<p><strong>Recursion</strong> is the algorithmic technique where a problem is solved by having a function invoke itself on progressively smaller sub-instances of the same problem.</p><p><strong>Reference:</strong> Appeared 12+ times in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> Page 11/12 and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Q148.</p>',
    urdu_answer: 'بائنری سرچ ہر مرحلے کو اپنے پچھلے مرحلے کے ذیلی کام (Subtask) کے طور پر چلاتا ہے، اس طریقہ کار کو ریکرشن (Recursion) کہا جاتا ہے۔'
  },
  {
    stem: 'If you apply the Bubble Sort algorithm to an array of 4 elements, how many element comparisons will be performed in the first pass?',
    options: {
      a: '5',
      b: '4',
      c: '3',
      d: '2'
    },
    correct: 'c',
    explanation: '<p>In the first pass of Bubble Sort across an array of <em>n</em> elements, the algorithm performs <code>n - 1</code> adjacent comparisons. For n = 4: <code>4 - 1 = 3</code> comparisons.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 - 1.pdf</code> Q18 and <code>CS101 - Midterm Paper 1 by Waqar Solved by Hadi.pdf</code> Q18.</p>',
    urdu_answer: 'ببل سارٹ میں n عناصر کی لسٹ کے پہلے پاس میں ہمیشہ n - 1 موازنے ہوتے ہیں۔ اس لیے 4 عناصر کے لیے پہلے پاس میں 3 موازنے ہوں گے۔'
  },
  {
    stem: 'In standard computer science implementations of sorting algorithms, lists of textual strings are typically organized into:',
    options: {
      a: 'Reverse random order',
      b: 'Alphabetical (lexicographical) order',
      c: 'Arbitrary hash order',
      d: 'Descending length order'
    },
    correct: 'b',
    explanation: '<p>Text sorting algorithms arrange string items into standard <strong>alphabetical (lexicographical) order</strong> based on their ASCII/Unicode character values.</p><p><strong>Reference:</strong> Appeared 8+ times in <code>CS101 MID by Attiq Kundi.pdf</code> Q146 and <code>CS101 MID-Term by Attiq Kundi</code> Page 11.</p>',
    urdu_answer: 'ٹیکسٹ سارٹنگ الگورتھمز میں فہرستوں کو حروفِ تہجی کی ترتیب (Alphabetical / Ascending order) میں منظم کیا جاتا ہے۔'
  },
  {
    stem: 'For the Sequential (Linear) Search algorithm, having the list pre-sorted in ascending alphabetical order is:',
    options: {
      a: 'Strictly mandatory',
      b: 'Not mandatory / Optional',
      c: 'Impossible to process',
      d: 'Required only for numeric lists'
    },
    correct: 'b',
    explanation: '<p>Sequential search examines elements one-by-one from the beginning; therefore, pre-sorting is <strong>not mandatory</strong>. In contrast, Binary Search strictly requires a pre-sorted list.</p><p><strong>Reference:</strong> Appeared 14+ times in <code>CS101 MID Term by VU Stars 01.pdf</code> Q3 & Q32.</p>',
    urdu_answer: 'سیکوئنشل سرچ کے لیے لسٹ کا پہلے سے ترتیب شدہ (Sorted) ہونا لازمی نہیں ہے، جبکہ بائنری سرچ کے لیے لسٹ کا ترتیب شدہ ہونا سختی سے لازمی ہے۔'
  },
  {
    stem: 'During a binary search, if the target value is not found at the middle element, the algorithm continues searching by dividing the remaining search space into:',
    options: {
      a: 'Larger segments',
      b: 'Smaller segments (halves)',
      c: 'Arbitrary clusters',
      d: 'Single unsorted records'
    },
    correct: 'b',
    explanation: '<p>Binary search operates on the divide-and-conquer paradigm: if the target is smaller or larger than the midpoint, it discards the irrelevant half and restricts further search to a <strong>smaller half-segment</strong>.</p><p><strong>Reference:</strong> Appeared 10+ times in <code>CS101 MID by Attiq Kundi.pdf</code> Q147.</p>',
    urdu_answer: 'اگر بائنری سرچ میں درمیانی عنصر مطلوبہ ویلیو کے برابر نہ ہو، تو الگورتھم بقیہ سرچ اسپیس کو مزید چھوٹے نصف حصے (Smaller segment) میں تقسیم کر کے تلاش جاری رکھتا ہے۔'
  },
  {
    stem: 'If we apply Insertion Sort to the names [Fred, Alex, Diana, Byron, Carol], what will the array look like after the first sorting step inserting Alex into the sorted sublist?',
    options: {
      a: 'Fred, Alex, Diana, Byron, Carol',
      b: 'Alex, Fred, Diana, Byron, Carol',
      c: 'Byron, Carol, Diana, Alex, Fred',
      d: 'Alex, Byron, Carol, Diana, Fred'
    },
    correct: 'b',
    explanation: '<p>The first element [Fred] forms the initial 1-element sorted sublist. In the first step, [Alex] is compared with [Fred]. Since Alex precedes Fred alphabetically, Alex is shifted before Fred, yielding: <strong>[Alex, Fred, Diana, Byron, Carol]</strong>.</p><p><strong>Reference:</strong> Appeared 12+ times across past papers including <code>CS101 MID Term by VU Stars 01.pdf</code> Q35 and <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> Q122.</p>',
    urdu_answer: 'انسرشن سارٹ کے پہلے مرحلے میں "Alex" کا موازنہ "Fred" سے ہوتا ہے، چونکہ الیکس حروفِ تہجی میں پہلے آتا ہے، اس لیے پہلی ذیلی لسٹ بنتی ہے: Alex, Fred, Diana, Byron, Carol۔'
  },
  {
    stem: 'The word "Algorithm" was historically derived from the Latinized translation title of the 9th-century arithmetic book written by Persian mathematician Muhammad ibn Musa al-Khwarizmi, titled:',
    options: {
      a: 'Kitab al-Jabr wa-l-Muqabala',
      b: 'Algoritmi de numero Indorum',
      c: 'Liber Abaci',
      d: 'Principia Mathematica'
    },
    correct: 'b',
    explanation: '<p>The word <em>algorithm</em> originates from <strong>Algoritmi de numero Indorum</strong> ("Al-Khwarizmi on the Numerals of the Indians"), the Latin translation of his 9th-century mathematical treatise.</p><p><strong>Reference:</strong> Appeared 15+ times across past papers including <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Page 76/106 and <code>CS101 Mid_term_Solved.pdf</code> Q2.</p>',
    urdu_answer: 'لفظ "الگورتھم" 9ویں صدی کے مسلم ریاضی دان محمد بن موسیٰ الخوارزمی کی کتاب کے لاطینی ترجمے "Algoritmi de numero Indorum" سے اخذ کیا گیا ہے۔'
  },
  {
    stem: 'Given the sorted array [10, 30, 40, 90, 95, 99, 100] and target key 99, what is the middle value evaluated at the second level of recursion in Binary Search?',
    options: {
      a: '90',
      b: '95',
      c: '99',
      d: '100'
    },
    correct: 'c',
    explanation: '<p>Level 1: Array has 7 elements, mid is index 3 (value 90). Since 99 > 90, search right half: [95, 99, 100].<br />Level 2: Sub-array has 3 elements, mid is value <strong>99</strong> (target found!).</p><p><strong>Reference:</strong> Appeared in <code>CS101 MID by Attiq Kundi.pdf</code> Question 11 Page 4.</p>',
    urdu_answer: 'پہلے لیول پر درمیانی عنصر 90 ہے، 99 چونکہ 90 سے بڑا ہے اس لیے دائیں ذیلی لسٹ [95, 99, 100] پر سرچ ہوگی، جہاں دوسرے لیول پر درمیانی عنصر 99 ہی نکلتا ہے اور تلاش مکمل ہو جاتی ہے۔'
  },
  {
    stem: 'If you apply the Bubble Sort algorithm to sort an array containing 5 elements, how many element comparisons are performed during the first pass?',
    options: {
      a: '4 comparisons',
      b: '5 comparisons',
      c: '10 comparisons',
      d: '20 comparisons'
    },
    correct: 'a',
    explanation: '<p>Number of comparisons in pass 1 = <code>n - 1 = 5 - 1 = 4</code> comparisons.</p><p><strong>Reference:</strong> Derived from <code>CS101 - 1.pdf</code> Q18.</p>',
    urdu_answer: 'ببل سارٹ میں 5 عناصر کی لسٹ کے پہلے پاس میں کل n - 1 = 5 - 1 = 4 موازنے ہوں گے۔'
  },
  {
    stem: 'For a sorted dataset containing 1,024 elements (2^10), what is the maximum number of comparisons required by Binary Search in the worst case?',
    options: {
      a: '10 comparisons',
      b: '512 comparisons',
      c: '1,024 comparisons',
      d: '2,048 comparisons'
    },
    correct: 'a',
    explanation: '<p>Binary search requires at most <strong>log2(1024) = 10 comparisons</strong> to locate any item or confirm its absence, compared to up to 1,024 comparisons for sequential search.</p><p><strong>Reference:</strong> Appeared in <code>CS201 Handouts PDF.pdf</code> Page 29 and <code>CS101 MIDTERM FILE 7</code> Q15.</p>',
    urdu_answer: '1,024 عناصر (2 کی پاور 10) پر مشتمل ترتیب شدہ لسٹ میں بائنری سرچ کے ذریعے بدترین صورت میں زیادہ سے زیادہ صرف log2(1024) = 10 موازنے درکار ہوتے ہیں۔'
  },
  {
    stem: 'What is the critical termination condition (base case) required in a recursive binary search algorithm to prevent infinite recursion?',
    options: {
      a: 'When the sublist size becomes 0 (start index exceeds end index) or target is found',
      b: 'When the list contains an even number of elements',
      c: 'When the middle element equals zero',
      d: 'When the recursive function calls another sorting algorithm'
    },
    correct: 'a',
    explanation: '<p>Every recursive function must have a <strong>base case</strong>. For binary search, recursion terminates either when the target key is found at the middle index or when <code>start > end</code> (the sublist has collapsed to empty).</p><p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> Q149.</p>',
    urdu_answer: 'ریکرسیو بائنری سرچ کے رکنے کی بنیادی شرط (Base Case) یہ ہوتی ہے کہ یا تو مطلوبہ عنصر مل جائے یا پھر ذیلی لسٹ خالی ہو جائے یعنی start انڈیکس end انڈیکس سے بڑھ جائے۔'
  }
];

// 4 Short Questions (3 marks each, 3 minutes)
const shortQuestions = [
  {
    stem: 'What is the fundamental difference between Sequential Search and Binary Search in terms of list ordering prerequisites?',
    correct: `<p>The fundamental prerequisite difference between Sequential Search and Binary Search lies in the structural order of the dataset:</p>
<ul>
  <li><strong>Sequential Search:</strong> Does <strong>NOT require</strong> the list to be sorted. It sequentially inspects every element from the start of the list to the end, making it functional on completely random, unordered arrays.</li>
  <li><strong>Binary Search:</strong> Strictly <strong>REQUIRES</strong> the list to be pre-sorted in ascending or descending order. Without an ordered list, the algorithm cannot make the directional decision to eliminate the upper or lower half of the search space.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MID Term by VU Stars 01.pdf</code> (Q32) and <code>CS201 Handouts PDF.pdf</code> (Page 29).</p>',
    urdu_answer: 'سیکوئنشل سرچ کے لیے لسٹ کا پہلے سے ترتیب شدہ (Sorted) ہونا ضروری نہیں ہے، یہ کسی بھی بے ترتیب لسٹ پر کام کرتی ہے۔ جبکہ بائنری سرچ کے لیے لسٹ کا پہلے سے ترتیب شدہ ہونا لازمی شرط ہے، ورنہ یہ نصف حصے کو خارج کرنے کا فیصلہ نہیں کر سکتی۔'
  },
  {
    stem: 'Define Recursion in the context of the Binary Search algorithm. How does it simplify problem solving?',
    correct: `<p>In binary search, <strong>Recursion</strong> is the algorithmic technique where the search function repeatedly invokes itself to process a smaller sub-array of the original data.</p>
<h4>How it Operates:</h4>
<ol>
  <li>The algorithm compares the target key with the middle element of the current range.</li>
  <li>If the key is not found, the algorithm recursively calls itself with updated boundary pointers (either <code>mid + 1 to end</code> or <code>start to mid - 1</code>).</li>
  <li>This divide-and-conquer strategy simplifies problem solving by expressing a large, complex search problem as identical smaller subproblems, until reaching the base case (finding the element or an empty interval).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MID-Term by Attiq Kundi-updated on 24-06-2022.pdf</code> (Page 11/12) and <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Q148).</p>',
    urdu_answer: 'بائنری سرچ میں ریکرشن سے مراد فنکشن کا اپنے آپ کو بار بار چھوٹی ذیلی لسٹ پر کال کرنا ہے۔ یہ بڑے مسئلے کو ہر مرحلے پر آدھا کر کے ایک سادہ ذیلی مسئلے میں بدل دیتا ہے جس سے سرچنگ انتہائی تیز اور کوڈ منظم ہو جاتا ہے۔'
  },
  {
    stem: 'Explain the basic conceptual mechanism of the Insertion Sort algorithm using the name list [Fred, Alex, Diana, Byron, Carol] as an example.',
    correct: `<p><strong>Insertion Sort</strong> works similarly to sorting playing cards in hand: it divides the array into a sorted sublist on the left and an unsorted sublist on the right, inserting each unsorted element into its proper position one at a time.</p>
<h4>Step-by-Step Execution:</h4>
<ol>
  <li><strong>Initial State:</strong> Sorted sublist = <code>[Fred]</code>; Unsorted = <code>[Alex, Diana, Byron, Carol]</code>.</li>
  <li><strong>Pass 1:</strong> Compare <code>Alex</code> with <code>Fred</code>. Since Alex precedes Fred, insert Alex before Fred &rarr; <code>[Alex, Fred]</code>.</li>
  <li><strong>Pass 2:</strong> Take <code>Diana</code>. Diana comes after Alex but before Fred &rarr; <code>[Alex, Diana, Fred]</code>.</li>
  <li><strong>Pass 3:</strong> Take <code>Byron</code>. Byron is inserted between Alex and Diana &rarr; <code>[Alex, Byron, Diana, Fred]</code>.</li>
  <li><strong>Pass 4:</strong> Take <code>Carol</code>. Carol is inserted between Byron and Diana &rarr; <code>[Alex, Byron, Carol, Diana, Fred]</code> (Fully Sorted!).</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> (Q122) and <code>CS101 MID Term by VU Stars 01.pdf</code> (Q35).</p>',
    urdu_answer: 'انسرشن سارٹ تاش کے پتوں کی طرح کام کرتا ہے جس میں بائیں طرف ترتیب شدہ لسٹ ہوتی ہے اور دائیں سے ایک ایک عنصر اٹھا کر مناسب جگہ پر داخل کیا جاتا ہے۔ مثلاً [Fred, Alex, Diana, Byron, Carol] میں پہلے Alex کو Fred سے پہلے رکھا جائے گا، پھر Diana، Byron اور Carol کو ان کے حروفِ تہجی کے مطابق داخل کر کے مکمل فہرست ترتیب دی جائے گی۔'
  },
  {
    stem: 'What are the essential requirements and termination conditions for designing a valid recursive function?',
    correct: `<p>A correctly designed recursive algorithm must fulfill three essential structural requirements to prevent runtime crashes (stack overflow):</p>
<ol>
  <li><strong>Base Case (Stopping Condition):</strong> At least one non-recursive condition where the function directly returns a result without making further recursive calls.</li>
  <li><strong>Progress Toward Base Case:</strong> Each successive recursive invocation must pass modified arguments that move strictly closer to the base case (e.g., shrinking array boundaries or decrementing a counter).</li>
  <li><strong>Correct Combination of Sub-Results:</strong> The algorithm must correctly combine the results returned from recursive sub-calls to formulate the overall solution.</li>
</ol>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101.. MID TERM SOLVED MCQS WITH REFERENCES BY MASOOM FAIRY.pdf</code> (Q149) and <code>CS101 MID-Term by Attiq Kundi</code> Page 11.</p>',
    urdu_answer: 'ایک درست ریکرسیو فنکشن کے لیے تین شرائط لازمی ہیں: (1) بیس کیس (Base Case) یعنی رکنے کی شرط تاکہ لامتناہی لوپ سے بچا جا سکے، (2) ہر کال میں مسئلے کا سائز کم ہونا تاکہ وہ بیس کیس کے قریب پہنچ سکے، اور (3) ذیلی نتائج کو درست طریقے سے جوڑ کر حتمی حل بنانا۔'
  }
];

// 2 Long Questions (5 marks each, 5 minutes)
const longQuestions = [
  {
    stem: 'Compare Sequential Search and Binary Search algorithms in detail. Discuss working mechanisms, mathematical time complexity (N/2 vs. log2 N), preconditions, and architectural tradeoffs.',
    correct: `<p>Searching is a fundamental computing operation to locate a target record within a collection of data. <strong>Sequential Search</strong> and <strong>Binary Search</strong> represent two contrasting algorithmic paradigms:</p>

<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Feature</th>
      <th>Sequential (Linear) Search</th>
      <th>Binary Search</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Working Mechanism</strong></td>
      <td>Scans items one-by-one from the first element to the last until a match is found or end of list is reached.</td>
      <td>Examines the middle item; if unmatched, discards half of the dataset and repeats on the remaining half.</td>
    </tr>
    <tr>
      <td><strong>Precondition</strong></td>
      <td>None; operates effectively on unsorted, random lists.</td>
      <td>Strictly requires elements to be pre-sorted in order.</td>
    </tr>
    <tr>
      <td><strong>Average Comparisons</strong></td>
      <td><code>n / 2</code> comparisons.</td>
      <td><code>log2(n)</code> comparisons.</td>
    </tr>
    <tr>
      <td><strong>Worst-Case Complexity</strong></td>
      <td><code>O(n)</code> (linear time).</td>
      <td><code>O(log n)</code> (logarithmic time).</td>
    </tr>
    <tr>
      <td><strong>Implementation Style</strong></td>
      <td>Simple iterative circular loop.</td>
      <td>Recursive subtasks or divide-and-conquer loops.</td>
    </tr>
    <tr>
      <td><strong>Scalability Example (n = 1,000,000)</strong></td>
      <td>Averages ~500,000 comparisons; worst case = 1,000,000.</td>
      <td>Worst case = at most 20 comparisons (\(2^{20} > 1,000,000\)).</td>
    </tr>
  </tbody>
</table>

<h4>Engineering Tradeoffs:</h4>
<ul>
  <li>Use <strong>Sequential Search</strong> for small lists (e.g., \(n < 50\)) or unsorted collections where searches are infrequent and sorting overhead is unwarranted.</li>
  <li>Use <strong>Binary Search</strong> for large, frequently queried datasets where the initial cost of sorting is repaid thousands of times over by near-instantaneous \(O(\log n)\) retrieval.</li>
</ul>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 MIDTERM FILE 3</code> (Q23), <code>FILE 7</code> (Q15), <code>CS201 Handouts PDF.pdf</code> (Page 29), and <code>CS101 MID by Attiq Kundi.pdf</code> (Q148).</p>',
    urdu_answer: 'سیکوئنشل سرچ اور بائنری سرچ کا تفصیلی موازنہ: سیکوئنشل سرچ غیر ترتیب شدہ لسٹ پر ایک ایک کر کے سرچ کرتی ہے اور اوسطاً n/2 موازنے کرتی ہے (O(n))۔ جبکہ بائنری سرچ کے لیے لسٹ کا ترتیب شدہ ہونا لازمی ہے، یہ ہر بار لسٹ کو آدھا کر دیتی ہے اور صرف log2(n) موازنے کرتی ہے (O(log n))۔ 10 لاکھ کے ڈیٹا سیٹ میں سیکوئنشل سرچ کو 5 لاکھ موازنے کرنے پڑتے ہیں جبکہ بائنری سرچ صرف 20 موازنے میں رزلٹ دے دیتی ہے۔'
  },
  {
    stem: 'Describe the working mechanisms of Sorting Algorithms (Insertion Sort and Bubble Sort). Detail how elements are compared, swapped, and placed into their final sorted positions across successive passes.',
    correct: `<p>Sorting arranges items systematically in ascending or alphabetical order. <strong>Insertion Sort</strong> and <strong>Bubble Sort</strong> are fundamental comparison-based sorting algorithms:</p>

<h4>1. Bubble Sort (Transposition Sort):</h4>
<ul>
  <li><strong>Mechanism:</strong> Iterates repeatedly through the list, comparing adjacent pairs of elements (<code>array[j]</code> and <code>array[j+1]</code>). If they are in the wrong order, they are swapped.</li>
  <li><strong>Bubble Effect:</strong> In pass 1, the largest element "bubbles up" to the last position in \(n - 1\) comparisons. In pass 2, the second largest reaches position \(n - 2\), and so on.</li>
  <li><strong>Complexity:</strong> Requires \(n - 1\) passes and a total of \(\frac{n(n-1)}{2}\) comparisons, yielding an \(O(n^2)\) quadratic time complexity.</li>
</ul>

<h4>2. Insertion Sort:</h4>
<ul>
  <li><strong>Mechanism:</strong> Divides the array conceptually into a "sorted portion" and an "unsorted portion". Initially, the first element is considered sorted.</li>
  <li><strong>Insertion Process:</strong> Takes the next element from the unsorted portion and shifts all greater elements in the sorted portion one position to the right to make room, inserting the element into its exact position.</li>
  <li><strong>Efficiency:</strong> Highly efficient on small or nearly sorted arrays (best-case time \(O(n)\)), though worst-case remains \(O(n^2)\).</li>
</ul>

<h4>Comparison Summary:</h4>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Criterion</th>
      <th>Bubble Sort</th>
      <th>Insertion Sort</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Movement Mechanism</strong></td>
      <td>Frequent adjacent pairwise swapping.</td>
      <td>Shifting elements right and inserting target in place.</td>
    </tr>
    <tr>
      <td><strong>Pass 1 Outcome</strong></td>
      <td>Guarantees largest element is in its final position.</td>
      <td>Guarantees first 2 elements are sorted relative to each other.</td>
    </tr>
    <tr>
      <td><strong>Memory Overhead</strong></td>
      <td>In-place: \(O(1)\) auxiliary memory.</td>
      <td>In-place: \(O(1)\) auxiliary memory.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '<p><strong>Reference:</strong> Appeared in <code>CS101 - 1.pdf</code> (Q18), <code>CS101 MIDTERM SOLVED MCQS By JUNAID.pdf</code> (Q122), and <code>CS101 MID by Attiq Kundi.pdf</code> (Q146).</p>',
    urdu_answer: 'ببل سارٹ ملحقہ جوڑوں کا موازنہ کر کے غلط ترتیب پر انہیں آپس میں تبدیل (Swap) کرتا ہے جس سے ہر پاس میں سب سے بڑا عنصر تیرتا ہوا لسٹ کے آخر میں پہنچ جاتا ہے۔ جبکہ انسرشن سارٹ بائیں طرف ایک ترتیب شدہ لسٹ بناتا ہے اور دائیں سے ایک ایک عنصر لے کر پچھلے عناصر کو کھسکا کر اسے مناسب جگہ پر داخل (Insert) کرتا ہے۔ دونوں الگورتھمز کا اوسط وقت O(n^2) ہے اور یہ اضافی میموری لیے بغیر کام کرتے ہیں۔'
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
console.log(`CS101 Lecture 16 Questions: ${countLec.cnt}`);
console.log(`Total Database Questions: ${countTotal.cnt}`);
console.log(`Total Lectures: ${totalLectures.cnt}`);
console.log(`Total Subjects: ${totalSubjects.cnt}`);

db.close();

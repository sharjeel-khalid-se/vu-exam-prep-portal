import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate ENG101 subject
let eng101 = db.prepare("SELECT id FROM subjects WHERE slug = 'eng101'").get();
if (!eng101) {
  const res = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'English Comprehension',
    'eng101',
    'ENG101',
    'Reading comprehension, vocabulary development, dictionary usage, grammar, and reading techniques — Virtual University'
  );
  eng101 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Subject with ID: ${eng101.id}`);
} else {
  console.log(`ENG101 Subject found with ID: ${eng101.id}`);
}

// 2. Create or fetch Lecture 9
let lec9 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 9").get(eng101.id);
if (!lec9) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 9, 'Reading: Description, Locating Information, and Definition Patterns')
  `).run(eng101.id);
  lec9 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 9 with ID: ${lec9.id}`);
} else {
  console.log(`ENG101 Lecture 9 found with ID: ${lec9.id}`);
}

// 3. Clear existing questions for Lecture 9
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec9.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 9.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Choose the correct word form to complete the sentence: "Data processing refers to the operations which are ________ on the data either to derive information from them or to order them in files."',
    options: {
      a: 'performance',
      b: 'perform',
      c: 'performed',
      d: 'performer'
    },
    correct: 'c',
    explanation: 'In this relative clause, the passive voice construction ("which are + past participle") requires the verb form "performed" to modify the operations carried out upon data (ENG101 Handouts Lesson 9 Word Forms Exercise).',
    urdu_answer: 'جملے میں فعل مجہول (Passive voice) کی ساخت "are performed" کے تحت فعل کی تیسری فارم "performed" کا استعمال درست ہے۔'
  },
  {
    stem: 'Complete the sentence using the correct form of the word in brackets: "The machine carries out the ________ [proceed] which the programmer gives it."',
    options: {
      a: 'procedure',
      b: 'proceed',
      c: 'proceeding',
      d: 'procedural'
    },
    correct: 'a',
    explanation: 'The blank follows the definite article "the" and acts as the direct object noun of the transitive phrasal verb "carries out"; hence the nominal form "procedure" is grammatically required (ENG101 Handouts Lesson 9 & 20). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'آرٹیکل "the" کے بعد اسم (Noun) کی ضرورت ہے، لہٰذا "procedure" (طریقہ کار یا ہدایات کا مجموعہ) درست جواب ہے۔'
  },
  {
    stem: 'Choose the correct word form to fill in the blank: "A computer is limited in its ability by the ________ [imagine] of man."',
    options: {
      a: 'imagine',
      b: 'imagination',
      c: 'imaginable',
      d: 'imaginative'
    },
    correct: 'b',
    explanation: 'The sentence requires a noun following the definite article "the" and preceding the prepositional phrase "of man". The abstract noun derived from the verb imagine is "imagination" (ENG101 Handouts Lesson 9 Word Forms).',
    urdu_answer: 'جملے میں "by the" کے بعد اسم کی ضرورت ہے، اس لیے تخیل اور سوچ کی صلاحیت کے لیے اسم "imagination" درست انتخاب ہے۔'
  },
  {
    stem: 'In technical descriptive texts, which explicit structural phrase is commonly used by writers to define or explain a term?',
    options: {
      a: 'is defined as',
      b: 'refers to',
      c: 'by... we mean',
      d: 'All of the given'
    },
    correct: 'd',
    explanation: 'In expository and technical writing, writers use multiple standardized linguistic signals to introduce formal definitions, including "is defined as", "refers to", and "by [term] we mean" (ENG101 Handouts Lesson 9: Description & Definition Patterns).',
    urdu_answer: 'تکنیکی تحریروں میں کسی اصطلاح کی باقاعدہ تعریف بیان کرنے کے لیے یہ تمام عبارات ("is defined as", "refers to", اور "by... we mean") مستعمل ہیں۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What is the purpose of "Locating Information" as an analytical reading comprehension skill in technical and expository texts?',
    correct: `<p><strong>Locating Information in Reading Comprehension (ENG101 Handouts Lesson 9):</strong></p>

<h4>1. Definition and Objective:</h4>
<p><strong>Locating Information</strong> is an analytical scanning technique designed to rapidly pinpoint the exact paragraph, sentence, or line reference where specific ideas, factual assertions, definitions, or technical data are situated without reading the entire passage word-for-word.</p>

<h4>2. Key Procedural Steps:</h4>
<ol>
  <li><strong>Analyze the Target Prompt:</strong> Identify key nouns, technical terms, or synonyms in the question before looking at the passage.</li>
  <li><strong>Targeted Scanning:</strong> Move eyes rapidly down the text, focusing on topic sentences, organizational markers, and boldfaced terms.</li>
  <li><strong>Verification:</strong> Once the target term is spotted, read the immediate sentence and surrounding co-text carefully to confirm that it addresses the specific inquiry.</li>
</ol>
<p>This skill prevents cognitive fatigue and drastically increases speed and accuracy during academic and professional reading.</p>`,
    explanation: 'Core 3-mark analytical comprehension question from ENG101 Handouts Lesson 9.',
    urdu_answer: 'معلوماتی تلاش (Locating Information) سے مراد تیزی سے اسکیننگ کر کے کسی تکنیکی یا وضاحتی پیراگراف میں سے مخصوص حقائق، اعداد و شمار یا تعریفات کے عین مقام اور پیراگراف کا تعین کرنا ہے۔ یہ مہارت وقت بچاتی ہے اور پڑھنے والے کو غیر ضروری تفصیلات میں الجھنے سے روکتی ہے۔'
  },
  {
    stem: 'What three common structural patterns or methods are used by writers to present definitions or explanations in descriptive writing? Provide an example for each pattern.',
    correct: `<p><strong>Three Structural Definition Patterns in Technical Writing (ENG101 Handouts Lesson 9):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Pattern</th>
      <th style="padding: 8px;">Structural Formula</th>
      <th style="padding: 8px;">Illustrative Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Pattern 1: Explicit Definition Markers</strong></td>
      <td style="padding: 8px;"><em>Term + refers to / is defined as + Definition</em></td>
      <td style="padding: 8px;"><em>"The term computer refers to the processor plus internal memory."</em></td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Pattern 2: Simple Equational Classification</strong></td>
      <td style="padding: 8px;"><em>Term + is / are + General Class / Category</em></td>
      <td style="padding: 8px;"><em>"A computer is an electronic device."</em></td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Pattern 3: Classification with Distinguishing Modifiers</strong></td>
      <td style="padding: 8px;"><em>Term + is/are + Class + which / that + Distinctive Feature</em></td>
      <td style="padding: 8px;"><em>"A computer is an electronic machine which processes information according to programmed instructions."</em></td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Fundamental 3-mark descriptive writing question from ENG101 Handouts Lesson 9.',
    urdu_answer: 'تکنیکی تحریر میں تعریف بیان کرنے کے 3 عام طریقے ہیں: 1. صریح الفاظ کا استعمال (refers to / is defined as)؛ 2. سادہ درجہ بندی (A computer is an electronic device)؛ اور 3. امتیازی خصوصیات کے ساتھ تفصیلی تعریف (جیسے which یا that لگا کر اس کے مخصوص کام کی وضاحت کرنا)۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Fill in the blanks with the correct missing words in the descriptive passage taken from Lecture 9 ("Characteristics of Computers") and explain the information-processing cycle it describes:\n\n"The basic job of computers is the processing of information. For this reason, c_____(1) can be defined as devices which accept i______(2) in the form of instructions c_____(3) a program and characters called data, p____(4) mathematical and / or logical operations o____(5) the information, and then supply results o____(6) these o______(7). The program, or part of i____(8), which tells the c_____(9) what to do and the data, which provide the information n____(10) to solve t____(11) problem, are kept i_____(12) the computer in a place called memory."',
    correct: `<p><strong>Completed Descriptive Passage (ENG101 Handouts Lesson 9):</strong></p>

<ol>
  <li><strong>computers</strong> (For this reason, <em>computers</em> can be defined...)</li>
  <li><strong>information</strong> (accept <em>information</em> in the form of...)</li>
  <li><strong>called</strong> (instructions <em>called</em> a program...)</li>
  <li><strong>perform</strong> (<em>perform</em> mathematical and / or logical operations...)</li>
  <li><strong>on</strong> (operations <em>on</em> the information...)</li>
  <li><strong>of</strong> (results <em>of</em> these operations...)</li>
  <li><strong>operations</strong> (results of these <em>operations</em>...)</li>
  <li><strong>it</strong> (or part of <em>it</em>, which tells...)</li>
  <li><strong>computer</strong> (tells the <em>computer</em> what to do...)</li>
  <li><strong>needed</strong> (information <em>needed</em> to solve...)</li>
  <li><strong>the</strong> (solve <em>the</em> problem...)</li>
  <li><strong>inside</strong> (kept <em>inside</em> the computer in a place called memory.)</li>
</ol>

<h4>Analysis of the Information-Processing Cycle Described:</h4>
<ul>
  <li><strong>Input:</strong> Receiving raw data and program instructions from users or external devices.</li>
  <li><strong>Processing:</strong> Executing arithmetic calculations (addition, subtraction, multiplication, division) and logical comparisons on the ingested data.</li>
  <li><strong>Storage (Memory):</strong> Holding instructions and active problem-solving data in internal memory circuits.</li>
  <li><strong>Output:</strong> Supplying the finalized, structured results of the computations to the user.</li>
</ul>`,
    explanation: 'High-frequency 5-mark cloze descriptive exercise from eng101_mid_term_6 (Exercise 2) and Handouts Lesson 9.',
    urdu_answer: 'خالی جگہوں کے درست جوابات: 1. computers، 2. information، 3. called، 4. perform، 5. on، 6. of، 7. operations، 8. it، 9. computer، 10. needed، 11. the، 12. inside۔ یہ عبارت کمپیوٹر کے چار بنیادی مراحل یعنی ان پٹ، پروسیسنگ، میموری اسٹوریج اور آؤٹ پٹ کے مکمل نظام کی وضاحتی تعریف پیش کرتی ہے۔'
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
console.log(`Successfully inserted into ENG101 Lecture 9:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 9: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

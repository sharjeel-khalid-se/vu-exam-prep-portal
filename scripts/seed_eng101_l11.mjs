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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(eng101.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Reading: Understanding Reading, Purpose, and Tone')
  `).run(eng101.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`ENG101 Lecture 11 found with ID: ${lec11.id}`);
}

// 3. Clear existing questions for Lecture 11
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec11.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 11.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'There are three common purposes of communication that a writer seeks to achieve:',
    options: {
      a: 'to inform, to persuade and to propagate',
      b: 'to inform, to persuade and to collaborate',
      c: 'to inform, to persuade and to entertain',
      d: 'none of the above'
    },
    correct: 'c',
    explanation: 'According to ENG101 Handouts Lesson 11: "There are 3 common purposes of communication: to inform (give facts/data), to persuade (convince/influence opinions), and to entertain (amuse/engage imagination)." Appeared in Team Hadi and Attiq Kundi midterm papers.',
    urdu_answer: 'مواصلات اور تحریر کے تین بنیادی اور مشترکہ مقاصد ہوتے ہیں: معلومات فراہم کرنا (to inform)، قائل کرنا (to persuade)، اور تفریح یا دلچسپی فراہم کرنا (to entertain)۔'
  },
  {
    stem: 'One major cause of slow reading is ________, which means forming the sounds of each word even though you may not say them aloud.',
    options: {
      a: 'Vocalization',
      b: 'Paraphrasing',
      c: 'Skimming',
      d: 'Scanning'
    },
    correct: 'a',
    explanation: 'ENG101 Handouts Lesson 11 states: "One cause of slow reading is VOCALIZATION - the forming of the sounds of each word even though you may not say them aloud." Vocalizing restricts reading speed to speech rate. Appeared in Attiq Kundi and Oxford Handout Shop files.',
    urdu_answer: 'سست روی سے پڑھنے کی ایک بڑی وجہ ووکلائزیشن (Vocalization) ہے، یعنی بغیر بلند آواز نکالے بھی ذہن، ہونٹوں یا گلے میں ہر لفظ کی صوتی ادائیگی کرنا۔'
  },
  {
    stem: '________ is a sure sign that the reader is a poor reader.',
    options: {
      a: 'Vocalization',
      b: 'Skimming',
      c: 'Scanning',
      d: 'Silent reading'
    },
    correct: 'a',
    explanation: 'ENG101 Handouts Lesson 11 identifies vocalization as a definitive trait of an inefficient reader: "Vocalization is very common among our students. It is a sure sign that the reader is a poor reader" because it prevents reading in conceptual phrases. Appeared in Attiq Kundi and Oxford files.',
    urdu_answer: 'ووکلائزیشن (Vocalization) اس بات کی یقینی علامت ہے کہ پڑھنے والا ایک کمزور یا سست قاری ہے کیونکہ وہ لفظ بہ لفظ آواز بنانے میں الجھ جاتا ہے۔'
  },
  {
    stem: 'Choose the correct option: There is an established cognitive relationship between reading speed and ________.',
    options: {
      a: 'reading style',
      b: 'reading ability',
      c: 'reading comprehension',
      d: 'both A and C'
    },
    correct: 'c',
    explanation: 'ENG101 Handouts Lesson 11 explicitly highlights: "There is a relationship between reading speed and reading comprehension." Contrary to the popular misconception that speed harms comprehension, faster readers grasp broader semantic relationships more effectively. Appeared in VU Stars and Attiq Kundi files.',
    urdu_answer: 'پڑھنے کی رفتار (Reading speed) اور سمجھنے کی صلاحیت (Reading comprehension) کے درمیان براہِ راست گہرا تعلق ہوتا ہے۔'
  },
  {
    stem: 'Select the correct statement regarding reading skills: Your comprehension will not suffer if you read ________.',
    options: {
      a: 'consistently',
      b: 'rapidly',
      c: 'in a focused manner',
      d: 'slowly'
    },
    correct: 'b',
    explanation: 'ENG101 Handouts Lesson 11 clarifies: "You may think that if you read rapidly, your comprehension will suffer. This is a false assumption." Reading rapidly allows the working memory to synthesize overarching ideas rather than stalling on disjointed words. Appeared in VU Stars and Attiq Kundi files.',
    urdu_answer: 'یہ ایک غلط فہمی ہے کہ تیز پڑھنے سے فہم کم ہو جائے گا؛ حقیقت میں تیزی سے پڑھنے (rapidly) سے فہم متاثر نہیں ہوتا بلکہ خیالات کے ربط میں مدد ملتی ہے۔'
  },
  {
    stem: 'Choose the correct option: When you push yourself to slow reading, the comprehension level ________.',
    options: {
      a: 'rises',
      b: 'falls / lowers',
      c: 'remains unchanged',
      d: 'doubles'
    },
    correct: 'b',
    explanation: 'ENG101 Handouts Lesson 11 notes: "As you push yourself to read slower you may find that you comprehend less." Excessive slowness causes the mind to wander and leads to loss of the author\'s train of thought. Appeared in Attiq Kundi and Oxford Handout Shop files.',
    urdu_answer: 'جب آپ خود کو غیر فطری طور پر آہستہ پڑھنے پر مجبور کرتے ہیں تو سمجھنے کی شرح گر (falls / lowers) جاتی ہے کیونکہ ذہن بھٹک جاتا ہے اور ربط ٹوٹ جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What is vocalization in reading, and why is it considered a major cause of slow reading and poor comprehension?',
    correct: `<p><strong>Vocalization in Reading (ENG101 Handouts Lesson 11):</strong></p>

<h4>1. Definition:</h4>
<p><strong>Vocalization</strong> (subvocalization) refers to the habit of internally sounding out each word or moving the lips, tongue, and vocal cords while reading silently.</p>

<h4>2. Why It Causes Slow Reading &amp; Diminished Comprehension:</h4>
<ul>
  <li><strong>Acoustic Bottleneck:</strong> The physiological speed of physical speech is capped at approximately 150 to 200 words per minute. Vocalization artificially restrains silent reading to this slow speaking rate, whereas the human eye and brain are capable of processing 400 to 800+ words per minute visually.</li>
  <li><strong>Word-by-Word Fixation:</strong> A vocalizer fixates on every isolated word rather than taking in meaningful semantic word clusters (phrase chunking).</li>
  <li><strong>Cognitive Disconnect:</strong> Because reading is ploddingly slow, the reader frequently loses the beginning of a sentence before reaching its end, leading to attention drift, frequent regression, and reduced overall comprehension.</li>
</ul>`,
    explanation: 'Frequent 3-mark conceptual question from ENG101 Handouts Lesson 11 and Attiq Kundi midterm papers.',
    urdu_answer: 'ووکلائزیشن سے مراد خاموشی سے پڑھتے ہوئے بھی ہر لفظ کی آواز گلے میں بنانا یا ہونٹ ہلانا ہے۔ یہ سست روی کا باعث اس لیے ہے کہ بولنے کی رفتار زیادہ سے زیادہ 200 الفاظ فی منٹ ہوتی ہے جبکہ ذہن 500+ الفاظ فی منٹ سمجھ سکتا ہے۔ اس سے پڑھنے کا فلو ٹوٹتا ہے اور فہم متاثر ہوتا ہے۔'
  },
  {
    stem: 'Enlist and explain the three primary purposes of communication that a writer aims to achieve in written discourse.',
    correct: `<p><strong>Three Primary Purposes of Communication (ENG101 Handouts Lesson 11):</strong></p>

<ol>
  <li><strong>To Inform:</strong>
    <ul>
      <li>The writer presents objective facts, empirical data, educational explanations, technical specifications, or historical accounts without attempting to alter the reader\'s personal convictions (e.g., textbooks, scientific reports, reference manuals).</li>
    </ul>
  </li>
  <li><strong>To Persuade:</strong>
    <ul>
      <li>The writer uses reasoned arguments, emotional appeals, evidence, and rhetorical strategies to convince the reader to accept a specific viewpoint, change a belief, or take a specific course of action (e.g., editorials, political speeches, advertisements).</li>
    </ul>
  </li>
  <li><strong>To Entertain:</strong>
    <ul>
      <li>The writer seeks to amuse, emotionally engage, or stimulate the reader\'s imagination through storytelling, humor, narrative suspense, or aesthetic language (e.g., novels, poetry, plays, comic essays).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Core 3-mark question from ENG101 Handouts Lesson 11 assessing reader awareness of authorial purpose and tone.',
    urdu_answer: 'تحریر کے تین بنیادی مقاصد درج ذیل ہیں: 1. معلومات فراہم کرنا (To Inform) یعنی غیر جانبدارانہ حقائق اور وضاحتیں بیان کرنا؛ 2. قائل کرنا (To Persuade) یعنی دلائل اور ثبوتوں کے ذریعے قاری کو اپنے نقطہ نظر پر لانا؛ اور 3. تفریح دینا (To Entertain) یعنی کہانی یا مزاح کے ذریعے قاری کے تخیل اور جذبات کو متحرک کرنا۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Analyze the dynamic relationship between reading speed and reading comprehension. Address the common misconceptions regarding rapid reading, and explain how cognitive processing enables faster readers to achieve superior comprehension.',
    correct: `<p><strong>Reading Speed vs. Reading Comprehension: Cognitive Dynamics (ENG101 Handouts Lesson 11):</strong></p>

<h4>1. The Direct Cognitive Correlation:</h4>
<p>In cognitive linguistics and reading theory, there is a strong, positive correlation between reading speed and reading comprehension. Contrary to common belief, faster readers generally comprehend texts more thoroughly and retain key information longer than slow, plodding readers.</p>

<h4>2. Debunking the False Assumption:</h4>
<ul>
  <li><strong>The Popular Myth:</strong> Many students falsely believe: <em>"If I read rapidly, my comprehension will suffer; therefore, I must read slowly and examine every word."</em></li>
  <li><strong>The Psychological Reality:</strong> Handouts Lesson 11 emphasizes that forcing oneself to read slowly actually causes comprehension to <strong>fall</strong>. When reading is too slow, the mind becomes under-stimulated, easily succumbs to distractions, and loses the logical thread connecting the beginning of an argument to its conclusion.</li>
</ul>

<h4>3. Why Faster Readers Comprehend Better:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Dimension</th>
      <th style="padding: 8px;">Slow Readers (under 150 wpm)</th>
      <th style="padding: 8px;">Proficient Fast Readers (350–600+ wpm)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Unit of Perception</strong></td>
      <td style="padding: 8px;">Isolated words or syllables (word-by-word fixation).</td>
      <td style="padding: 8px;">Thought chunks, noun phrases, and complete clauses.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Working Memory Load</strong></td>
      <td style="padding: 8px;">Overburdened by assembling isolated tokens into meaning.</td>
      <td style="padding: 8px;">Optimized; ideas are held intact as cohesive conceptual propositions.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Eye Fixation &amp; Regression</strong></td>
      <td style="padding: 8px;">Frequent backward regressions due to loss of contextual confidence.</td>
      <td style="padding: 8px;">Smooth forward saccadic rhythm with minimal regression.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Synthesis of Main Ideas</strong></td>
      <td style="padding: 8px;">Loses sight of the overarching thesis; distracted by minor details.</td>
      <td style="padding: 8px;">Rapidly synthesizes topic sentences, major details, and author\'s tone.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'High-frequency 5-mark subjective question appearing in Solved Midterm Paper 3 (Q17) and Handouts Lesson 11.',
    urdu_answer: 'پڑھنے کی رفتار اور فہم کے درمیان گہرا مثبت تعلق ہوتا ہے۔ یہ عام غلط فہمی ہے کہ آہستہ پڑھنے سے فہم بڑھتا ہے، جبکہ حقیقت میں ضرورت سے زیادہ آہستہ پڑھنے سے دماغ بھٹک جاتا ہے اور فہم گر جاتی ہے۔ تیز رفتار قاری الفاظ کو الگ الگ دیکھنے کی بجائے مکمل فقروں اور خیال کے ٹکڑوں (Thought Chunks) کی صورت میں سمجھتا ہے، جس سے ورکنگ میموری میں خیالات کا ربط قائم رہتا ہے اور بہترین فہم حاصل ہوتی ہے۔'
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
    insMcq.run(lec11.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec11.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec11.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 11:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 11: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

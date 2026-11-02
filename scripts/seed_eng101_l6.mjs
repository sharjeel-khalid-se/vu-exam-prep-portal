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

// 2. Create or fetch Lecture 6
let lec6 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 6").get(eng101.id);
if (!lec6) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 6, 'Reading Skills: Speed Reading, Vocalization, and Comprehension')
  `).run(eng101.id);
  lec6 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 6 with ID: ${lec6.id}`);
} else {
  console.log(`ENG101 Lecture 6 found with ID: ${lec6.id}`);
}

// 3. Clear existing questions for Lecture 6
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec6.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 6.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Choose the correct option: One major cause of slow reading is ________, which means forming the sounds of each word even though you may not say them aloud.',
    options: {
      a: 'Vocalization',
      b: 'Paraphrasing',
      c: 'Skimming',
      d: 'Scanning'
    },
    correct: 'a',
    explanation: 'According to ENG101 Handouts Lesson 11 on reading efficiency: "One cause of slow reading is VOCALIZATION - the forming of the sounds of each word even though you may not say them aloud." Vocalizing slows processing down to the speed of physical speech. Appeared in Attiq Kundi and Oxford Handout Shop midterm files.',
    urdu_answer: 'سست روی سے پڑھنے کی ایک بڑی وجہ ووکلائزیشن (Vocalization) ہے، یعنی بغیر آواز نکالے بھی ذہن یا حلق میں ہر لفظ کی آواز بنانا یا ہونٹ ہلانا۔'
  },
  {
    stem: 'Choose the correct option: ________ is a sure sign that the reader is a poor reader.',
    options: {
      a: 'Vocalization',
      b: 'Skimming',
      c: 'Scanning',
      d: 'Silent reading'
    },
    correct: 'a',
    explanation: 'ENG101 Handouts Lesson 11 states: "Vocalization is very common among our students. It is a sure sign that the reader is a poor reader." Efficient readers absorb ideas visually in thought clusters rather than sounding out individual words. Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'ووکلائزیشن (Vocalization) اس بات کی یقینی علامت ہے کہ پڑھنے والا ایک کمزور قاری ہے کیونکہ وہ الفاظ کو مجموعی مفہوم کی بجائے فرداً فرداً صوتی طور پر پڑھتا ہے۔'
  },
  {
    stem: 'Choose the correct option: There is a direct relationship between reading speed and ________.',
    options: {
      a: 'reading style',
      b: 'reading ability',
      c: 'reading comprehension',
      d: 'both A and C'
    },
    correct: 'c',
    explanation: 'ENG101 Handouts Lesson 11 explicitly notes: "There is a relationship between reading speed and reading comprehension." Contrary to common misconception, faster readers usually comprehend more effectively because ideas remain interconnected in short-term memory. Appeared in VU Stars Grand Quiz file.',
    urdu_answer: 'پڑھنے کی رفتار (Reading speed) اور سمجھنے کی صلاحیت (Reading comprehension) کے درمیان براہِ راست تعلق ہوتا ہے۔'
  },
  {
    stem: 'Select the correct option based on reading skills: Your comprehension will not suffer if you read ________.',
    options: {
      a: 'consistently',
      b: 'rapidly',
      c: 'in a focused manner',
      d: 'slowly'
    },
    correct: 'b',
    explanation: 'ENG101 Handouts Lesson 11 explains: "You may think that if you read rapidly, your comprehension will suffer. This is a false assumption." Reading rapidly forces the brain to synthesize concepts and relationships rather than getting trapped in word-by-word mechanics. Appeared in Attiq Kundi and VU Stars files.',
    urdu_answer: 'یہ ایک غلط مفروضہ ہے کہ تیزی سے پڑھنے سے سمجھ کم آئے گی؛ حقیقت میں تیزی سے پڑھنے (rapidly) سے فہم متاثر نہیں ہوتا بلکہ دماغ خیالات کے باہمی ربط پر توجہ مرکوز کرتا ہے۔'
  },
  {
    stem: 'Choose the correct option: When you push yourself to slow reading, the comprehension level ________.',
    options: {
      a: 'rises',
      b: 'falls',
      c: 'remains unchanged',
      d: 'doubles'
    },
    correct: 'b',
    explanation: 'ENG101 Handouts Lesson 11 notes: "As you push yourself to read slower you may find that you comprehend less." Extremely slow reading causes attention to drift, and by the end of a long sentence, the reader has forgotten the beginning. Appeared in Attiq Kundi and Oxford Handout Shop files.',
    urdu_answer: 'جب آپ خود کو غیر ضروری طور پر بہت آہستہ پڑھنے پر مجبور کرتے ہیں تو سمجھنے کی سطح گر (falls) جاتی ہے کیونکہ ذہن ادھر ادھر بھٹک جاتا ہے اور خیالات کا تسلسل ختم ہو جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What is vocalization in reading, and why is it considered a major cause of slow reading and poor comprehension?',
    correct: `<p><strong>Vocalization in Reading (ENG101 Handouts Lesson 11):</strong></p>

<h4>1. Definition:</h4>
<p><strong>Vocalization</strong> (or subvocalization) is the habit of forming the acoustic sounds of each individual word while reading silently. This manifests as moving the lips, vibrating the vocal cords, or hearing an inner voice enunciate every syllable.</p>

<h4>2. Why It Causes Slow Reading and Poor Comprehension:</h4>
<ul>
  <li><strong>Physical Speech Bottleneck:</strong> Normal human speech operates at approximately 150 to 200 words per minute (wpm). When a reader vocalizes, their silent reading speed is artificially capped at their speaking speed, whereas visual perception can comfortably process 400 to 800+ wpm.</li>
  <li><strong>Word-by-Word Fixation:</strong> Vocalization forces the eyes to stop (fixate) on every isolated word rather than taking in meaningful syntactic phrases (thought chunks).</li>
  <li><strong>Loss of Conceptual Continuity:</strong> Because processing is so slow, by the time the reader reaches the end of a complex sentence, the earlier ideas have faded from working memory, causing frequent back-tracking (regression) and diminished comprehension.</li>
</ul>`,
    explanation: 'High-frequency 3-mark conceptual question from ENG101 Handouts Lesson 11 and Attiq Kundi midterm papers.',
    urdu_answer: 'ووکلائزیشن سے مراد خاموشی سے پڑھتے ہوئے بھی ہر لفظ کی آواز بنانا یا ہونٹ ہلانا ہے۔ یہ سست روی کا سب سے بڑا سبب اس لیے ہے کیونکہ بولنے کی رفتار زیادہ سے زیادہ 150 سے 200 الفاظ فی منٹ ہوتی ہے، جبکہ آنکھیں اور دماغ 500 سے زائد الفاظ فی منٹ سمجھ سکتے ہیں۔ اس عادت سے خیالات کا تسلسل ٹوٹ جاتا ہے اور فہم کمزور ہو جاتی ہے۔'
  },
  {
    stem: 'What strategic approach should a proficient reader adopt when encountering unfamiliar words during an initial reading of a text?',
    correct: `<p><strong>Handling Unfamiliar Words During Reading (ENG101 Handouts Lesson 6 &amp; 9):</strong></p>

<p>When an unfamiliar word is encountered during an initial reading, a proficient reader should adopt the following strategy:</p>
<ol>
  <li><strong>Avoid Stopping for a Dictionary:</strong>
    <ul>
      <li>Do not immediately pause or grab a dictionary. Halting reading every few moments destroys reading rhythm, interrupts mental momentum, and makes understanding the overall main idea nearly impossible.</li>
    </ul>
  </li>
  <li><strong>Deduce Meaning from Context Clues:</strong>
    <ul>
      <li>Examine the surrounding sentence and paragraph for context clues such as:
        <ul>
          <li><em>Definition / Restatement Clues</em> (e.g., set off by commas or dashes).</li>
          <li><em>Contrast / Antonym Clues</em> (e.g., words like <em>unlike, but, however</em>).</li>
          <li><em>Example / Illustration Clues</em> (e.g., <em>such as, for instance</em>).</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><strong>Mark and Verify Later:</strong>
    <ul>
      <li>Make a light mental note or small pencil mark next to the word, finish reading the entire section, and consult a dictionary only afterwards if the exact meaning remains critical.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Core 2-to-3 mark procedural question on reading mechanics from ENG101 Handouts Lesson 6 and 9.',
    urdu_answer: 'پڑھتے وقت جب کوئی نیا یا ناموس لفظ سامنے آئے تو قاری کو فوری طور پر ڈکشنری نہیں کھولنی چاہیے، کیونکہ اس سے پڑھنے کا تسلسل اور روانی ٹوٹ جاتی ہے۔ اس کی بجائے قاری کو سیاق و سباق (Context Clues) کی مدد سے اندازہ لگانا چاہیے اور پیراگراف مکمل کرنے کے بعد ہی اگر ضروری ہو تو لغت دیکھنی چاہیے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Analyze the major impediments to effective reading (vocalization, word-by-word reading, and regression) and explain the proven strategies a reader must cultivate to enhance reading speed while maximizing comprehension.',
    correct: `<p><strong>Overcoming Inefficient Reading Habits to Maximize Speed and Comprehension (ENG101 Lesson 6 &amp; 11):</strong></p>

<h4>1. The Major Impediments to Efficient Reading:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Bad Reading Habit</th>
      <th style="padding: 8px;">Description</th>
      <th style="padding: 8px;">Harmful Effect on Reading</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Vocalization (Subvocalization)</strong></td>
      <td style="padding: 8px;">Sounding out words internally or moving lips/throat muscles while reading.</td>
      <td style="padding: 8px;">Limits reading speed to speech speed (under 200 wpm) and strains cognitive resources.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Word-by-Word Fixation</strong></td>
      <td style="padding: 8px;">Pausing the eyes on every single word individually across the printed line.</td>
      <td style="padding: 8px;">Reduces reading span; causes severe eye fatigue and fragments cohesive thoughts.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Unnecessary Regression</strong></td>
      <td style="padding: 8px;">Habitually darting the eyes backward to re-read phrases out of lack of confidence.</td>
      <td style="padding: 8px;">Destroys reading momentum and breaks the logical progression of the author\'s argument.</td>
    </tr>
  </tbody>
</table>

<h4>2. Key Strategies for Developing Advanced Reading Speed &amp; Comprehension:</h4>
<ol>
  <li><strong>Read in Meaningful Phrase Clusters (Chunking):</strong>
    <ul>
      <li>Train the eyes to take in 3 to 5 words per fixation rather than single words. Group words syntactically into prepositional phrases, noun phrases, or clause segments.</li>
    </ul>
  </li>
  <li><strong>Expand Peripheral Vision:</strong>
    <ul>
      <li>Focus attention slightly inside the margins of the page rather than on the very first and last words, allowing peripheral vision to register margin words.</li>
    </ul>
  </li>
  <li><strong>Suppress the "Inner Voice":</strong>
    <ul>
      <li>Transition from auditory processing to direct visual cognitive recognition. The brain recognizes symbols and images instantaneously without needing phonological conversion.</li>
    </ul>
  </li>
  <li><strong>Pace and Push Forward:</strong>
    <ul>
      <li>Use a pointer, finger, or card to maintain steady forward pace, consciously preventing the eyes from regressing backwards.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Comprehensive 5-mark subjective question synthesizing reading psychology and speed reading methodologies based on ENG101 Handouts Lesson 6 and 11.',
    urdu_answer: 'موثر مطالعے کی راہ میں تین بڑی رکاوٹیں ہیں: ووکلائزیشن (لفظوں کی آواز نکالنا)، لفظ بہ لفظ رکنا، اور ریگریشن (بار بار پیچھے مڑ کر پڑھنا)۔ پڑھنے کی رفتار اور فہم بڑھانے کے لیے ضروری ہے کہ قاری الفاظ کو اکٹھا جوڑوں یا فقروں (Chunks) میں دیکھے، وسعتِ نگاہ (Peripheral vision) کو بڑھائے اور اپنی توجہ لفظوں کے تلفظ کی بجائے براہِ راست مرکزی خیال کے ادراک پر مرکوز رکھے۔'
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
console.log(`Successfully inserted into ENG101 Lecture 6:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 6: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

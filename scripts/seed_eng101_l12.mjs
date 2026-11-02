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

// 2. Create or fetch Lecture 12
let lec12 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 12").get(eng101.id);
if (!lec12) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 12, 'Reading: Making Inferences and Reading Between the Lines')
  `).run(eng101.id);
  lec12 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 12 with ID: ${lec12.id}`);
} else {
  console.log(`ENG101 Lecture 12 found with ID: ${lec12.id}`);
}

// 3. Clear existing questions for Lecture 12
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec12.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 12.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Discovering the implied or underlying ideas in a written text is formally called:',
    options: {
      a: 'making inferences',
      b: 'skimming',
      c: 'scanning',
      d: 'evaluating'
    },
    correct: 'a',
    explanation: 'According to ENG101 Handouts Lesson 12: "To discover the implied or underlying ideas in the writing is called \'making inferences\' or drawing conclusions." Authors frequently imply thoughts rather than stating them explicitly. Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'کسی تحریر میں اشارتاً بیان کیے گئے یا پوشیدہ مفاہیم کو سمجھنے کے عمل کو نتائج اخذ کرنا (Making inferences) کہا جاتا ہے۔'
  },
  {
    stem: 'Practicing the skill of "making inferences" not only makes you a better reader but also a ________.',
    options: {
      a: 'strong thinker',
      b: 'fast writer',
      c: 'fluent speaker',
      d: 'good listener'
    },
    correct: 'a',
    explanation: 'ENG101 Handouts Lesson 12 explicitly highlights: "Our aim is to help you not only become a better reader but a strong thinker." Drawing inferences requires critical reasoning, inductive logic, and analytical evaluation of clues. Appeared in Attiq Kundi and Oxford Handout Shop files.',
    urdu_answer: 'نتائج اخذ کرنے کی باقاعدہ مشق طالب علم کو نہ صرف ایک بہترین قاری بناتی ہے بلکہ ایک مضبوط اور گہرا مفکر (Strong thinker) بھی بناتی ہے۔'
  },
  {
    stem: 'In reading comprehension, to draw conclusions (inferences) refers to discovering:',
    options: {
      a: 'Information that is clearly stated',
      b: 'Information that is not clearly stated',
      c: 'Information that is false',
      d: 'Facts given in a dictionary'
    },
    correct: 'b',
    explanation: 'ENG101 Handouts Lesson 12 notes that inference deals specifically with unstated or indirect information: "To draw conclusions refers to discovering information that is not clearly or directly stated in the text." Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'نتائج اخذ کرنے سے مراد ایسی معلومات تک پہنچنا ہے جو مصنف نے تحریر میں واضح یا براہِ راست الفاظ میں بیان نہیں کی ہوتی۔'
  },
  {
    stem: 'Reading between the lines is a sophisticated cognitive skill that can only be acquired by reading ________.',
    options: {
      a: 'quickly',
      b: 'slowly',
      c: 'extensively',
      d: 'loudly'
    },
    correct: 'c',
    explanation: 'ENG101 Handouts Lesson 12 teaches that deciphering contextual nuance and implied ideas is cultivated through wide, habitual reading: "This is a skill that you can only acquire by reading extensively." Appeared in Attiq Kundi midterm files.',
    urdu_answer: 'سطروں کے درمیان چھپے اشارے سمجھنے کی صلاحیت صرف اور صرف وسیع اور متواتر مطالعے (reading extensively) سے پیدا ہوتی ہے۔'
  },
  {
    stem: 'Read the statement carefully and choose the most logical inference from the given options: "If you get fired from your job, you can infer that:"',
    options: {
      a: 'You did something wrong.',
      b: 'You will never get a job again.',
      c: 'You were the best worker.',
      d: 'You might get a raise.'
    },
    correct: 'a',
    explanation: 'In practical contextual reasoning, involuntary dismissal from employment logically implies an infraction, performance deficit, or violation of organizational standards ("You did something wrong"). Appeared in 5+ midterm past paper compilations including Moaaz and Education Gator.',
    urdu_answer: 'نوکری سے نکالے جانے کے واقعے سے منطقی طور پر یہ نتیجہ نکلتا ہے کہ آپ کی کارکردگی یا رویے میں کوئی خامی یا غلطی ہوئی ہے۔'
  },
  {
    stem: 'Read the statement carefully and choose the most logical inference: "If you see someone fall off of their bike, you can infer that:"',
    options: {
      a: 'It’s a new bike.',
      b: 'They weren’t wearing a helmet.',
      c: 'They have never ridden a bike before.',
      d: 'They have lost their balance.'
    },
    correct: 'd',
    explanation: 'Physical balance is the fundamental requirement for riding a two-wheeled vehicle. Falling from the bicycle directly provides evidence that the rider lost their physical balance. Appeared in 5+ midterm papers.',
    urdu_answer: 'کسی کو سائیکل سے گرتے دیکھنے کا سب سے سیدھا اور سائنسی نتیجہ یہ ہے کہ اس کا جسمانی توازن (balance) بگڑ گیا تھا۔'
  },
  {
    stem: 'Read the statement carefully and choose the most reasonable everyday inference: "If you go to a birthday party, you can infer that:"',
    options: {
      a: 'There will be a cake.',
      b: 'The person is turning 20.',
      c: 'There will be a clown.',
      d: 'You will have a bad time.'
    },
    correct: 'a',
    explanation: 'While clowns or turning 20 are arbitrary assumptions, the presence of a celebratory cake is a virtually universal cultural convention of birthday parties. Appeared in 6+ past paper sources.',
    urdu_answer: 'سالگرہ کی تقریب کے عام ثقافتی رواج کے پیش نظر یہ یقینی اور منطقی قیاس ہے کہ وہاں کیک ضرور ہوگا۔'
  },
  {
    stem: 'Read the statement carefully and choose the logical inference: "If you go to a Mexican restaurant, you can infer that:"',
    options: {
      a: 'They will not serve tea.',
      b: 'They will have hot dogs on the menu.',
      c: 'They have specialized in Mexican food.',
      d: 'They will have the best food in the town.'
    },
    correct: 'c',
    explanation: 'By definition, a restaurant designated by a culinary national heritage specializes in that cuisine (Mexican food) (ENG101 Handouts Lesson 12). Appeared in All Mids Solved papers.',
    urdu_answer: 'میکسیکن ریسٹورنٹ کے عنوان سے منطقی نتیجہ یہ ہے کہ وہ روایتی میکسیکن کھانوں میں خاص مہارت رکھتے ہیں۔'
  },
  {
    stem: 'Based on the statement, choose the inference that is most logically sound: "Sohail always sits in the last row of the classroom."',
    options: {
      a: 'Sohail dislikes his college courses.',
      b: 'Sohail is unprepared for his class.',
      c: 'Sohail feels uncomfortable sitting in the front row.',
      d: 'Sohail is farsighted.'
    },
    correct: 'c',
    explanation: 'From the given evidence in ENG101 Handouts Lesson 12 Exercise 2, consistently selecting the rear seats suggests a psychological discomfort or reluctance to occupy the conspicuous front rows, rather than assuming academic hostility or ophthalmic conditions.',
    urdu_answer: 'کلاس میں ہمیشہ آخری نشست منتخب کرنے کی بنیاد پر معقول ترین قیاس یہی ہے کہ سہیل سامنے کی نشستوں پر بیٹھنے میں بے آرامی محسوس کرتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Making an inference is often described as "reading between the lines." Justify this definition and explain how making inferences elevates reading comprehension.',
    correct: `<p><strong>Reading Between the Lines and Inferential Comprehension (ENG101 Handouts Lesson 12):</strong></p>

<h4>1. Why Inferences Are Called "Reading Between the Lines":</h4>
<p>Writers do not always articulate every fact, motive, or feeling explicitly. <strong>"Reading between the lines"</strong> means detecting what is unwritten—the author provides clues, context, and descriptive cues, while the reader connects those clues with their own background knowledge, experience, and deductive logic to extract the deeper, implied meaning.</p>

<h4>2. How Making Inferences Elevates Reading Comprehension:</h4>
<ul>
  <li><strong>Transforms Passive into Active Reading:</strong> Rather than merely decoding printed vocabulary, the reader actively searches for cause-and-effect relationships, character motivations, and subtle connotations.</li>
  <li><strong>Fosters Critical Thinking:</strong> It cultivates inductive reasoning, enabling readers to distinguish between verifiable facts, plausible deductions, and baseless assumptions.</li>
  <li><strong>Unlocks Literary Nuance:</strong> It allows readers to appreciate irony, metaphor, satire, and subtext in creative and expository literature.</li>
</ul>`,
    explanation: 'High-frequency 3-mark conceptual question from ENG101 Solved Midterm Papers (Paper 1 & Paper 3) and Handouts Lesson 12.',
    urdu_answer: 'نتائج اخذ کرنے کو "بین السطور پڑھنا" اس لیے کہتے ہیں کیونکہ مصنف ہر بات کھل کر نہیں لکھتا بلکہ اشارے اور سیاق دیتا ہے۔ قاری اپنے مشاہدے اور منطق کی مدد سے ان اشاروں کو جوڑ کر اصل مفہوم تک پہنچتا ہے۔ یہ عمل قاری کو محض لفظ پڑھنے والے کی بجائے ایک فعال، گہرا اور تنقیدی مفکر بنا دیتا ہے۔'
  },
  {
    stem: 'What would a perceptive reader logically infer from each of the following two real-world observations?\n1. A high school has armed policemen walking up and down its main hall.\n2. A pet dog shrinks and cringes away when you extend your hand to pat him.',
    correct: `<p><strong>Inferential Deductions from Observational Clues (ENG101 Handouts Lesson 12 Exercise 1):</strong></p>

<ol>
  <li><strong>Incident 1: Policemen walking up and down a high school\'s main hall:</strong>
    <ul>
      <li><strong>Logical Inferences:</strong>
        <ol>
          <li>A serious security breach, emergency protocol, or threat assessment is currently taking place.</li>
          <li>A high-stakes public examination (e.g., board examinations) is in progress requiring strict anti-cheating supervision.</li>
          <li>A high-ranking dignitary or state official is visiting the school premises.</li>
        </ol>
      </li>
    </ul>
  </li>
  <li><strong>Incident 2: A dog cringing or shrinking when a hand is extended to pet him:</strong>
    <ul>
      <li><strong>Logical Inferences:</strong>
        <ol>
          <li>The animal has experienced physical abuse, beatings, or traumatic mistreatment in its past.</li>
          <li>The dog associates raised or approaching human hands with imminent pain rather than affection.</li>
        </ol>
      </li>
    </ul>
  </li>
</ol>`,
    explanation: '3-mark practical inference exercise from ENG101 Handouts Lesson 12 Exercise 1.',
    urdu_answer: '1. سکول میں پولیس اہلکاروں کی گشت سے منطقی نتیجہ یہ نکلتا ہے کہ وہاں کوئی اہم امتحانی ڈیوٹی ہے، کوئی اہم سرکاری شخصیت آئی ہے یا کوئی سیکیورٹی ایمرجنسی ہے۔ 2. کتے کا ہاتھ دیکھ کر سہم جانے کا نتیجہ یہ ہے کہ اس پر ماضی میں تشدد ہوا ہے اور وہ انسانی ہاتھ کو مار کی علامت سمجھتا ہے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Analyze the fundamental difference between how factual (non-fiction) writers and creative (fiction) writers convey meaning to their audience. Elaborate upon the indispensable role that inferences play in the appreciation of literature.',
    correct: `<p><strong>Conveying Meaning: Factual Prose vs. Creative Literature (ENG101 Handouts Lesson 12):</strong></p>

<h4>1. Contrasting Modes of Expression:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Dimension</th>
      <th style="padding: 8px;">Non-Fiction / Factual Writers</th>
      <th style="padding: 8px;">Fiction / Creative Writers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Core Technique</strong></td>
      <td style="padding: 8px;"><strong>Telling:</strong> State assertions, statistics, and definitions directly and literally.</td>
      <td style="padding: 8px;"><strong>Showing:</strong> Create sensory scenes, physical reactions, and dialogue; imply meaning.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Linguistic Style</strong></td>
      <td style="padding: 8px;">Direct, unambiguous, objective, and denotative.</td>
      <td style="padding: 8px;">Evocative, metaphorical, connotative, and symbolic.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Reader\'s Cognitive Role</strong></td>
      <td style="padding: 8px;">Comprehending and assimilating stated facts.</td>
      <td style="padding: 8px;">Inferring emotions, character motivations, and philosophical themes.</td>
    </tr>
  </tbody>
</table>

<h4>2. The Principle of "Showing vs. Telling":</h4>
<p>In literary fiction, an author rarely writes flat statements like <em>"Rashid was furious"</em>. Instead, the writer shows the character\'s emotional state through physical manifestations:</p>
<blockquote><em>"Rashid\'s fists clenched until his knuckles turned white. His nostrils flared, his breathing came in short, ragged gasps, and his eyes drilled into the floor as he slammed the heavy wooden door."</em></blockquote>
<p>The reader immediately infers intense anger without the word "anger" ever appearing in the prose.</p>

<h4>3. The Role of Inferences in Literary Appreciation:</h4>
<ul>
  <li><strong>Uncovering Character Psychology:</strong> Readers deduce true personalities from actions rather than biased self-narrations.</li>
  <li><strong>Interpreting Symbolic Motifs:</strong> A recurring storm, a decaying house, or a wilting flower carries implied thematic resonance.</li>
  <li><strong>Participatory Co-Creation:</strong> Making inferences allows the reader to actively participate in the artistic experience, rendering literature emotionally compelling and intellectually memorable.</li>
</ul>`,
    explanation: 'Comprehensive 5-mark subjective question exploring the mechanics of literary inference and creative showing vs. telling based on ENG101 Handouts Lesson 12.',
    urdu_answer: 'حقائق بیان کرنے والے مصنفین اپنی بات سیدھے اور صریح انداز میں بتاتے ہیں، جبکہ فکشن اور ادب کے تخلیق کار بات کو بتانے (Telling) کی بجائے منظر کشی کے ذریعے دکھاتے (Showing) ہیں (جیسے غصے کے لیے مٹھیوں کا بھنچنا اور دروازہ زور سے بند کرنا)۔ ادب میں قاری کا کام بین السطور چھپے ہوئے استعاروں، کرداروں کے جذبات اور گہرے موضوعات کو نتائج (Inferences) کے ذریعے دریافت کرنا ہوتا ہے۔'
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
    insMcq.run(lec12.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec12.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec12.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 12:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 12: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

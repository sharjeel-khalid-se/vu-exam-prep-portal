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

// 2. Create or fetch Lecture 3
let lec3 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 3").get(eng101.id);
if (!lec3) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 3, 'Reading for Main Idea: Topic Sentences and Supporting Details')
  `).run(eng101.id);
  lec3 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 3 with ID: ${lec3.id}`);
} else {
  console.log(`ENG101 Lecture 3 found with ID: ${lec3.id}`);
}

// 3. Clear existing questions for Lecture 3
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec3.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 3.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'The sentence that states the main idea of a paragraph is called:',
    options: {
      a: 'Main idea of paragraph',
      b: 'Topic of paragraph',
      c: 'Topic sentence',
      d: 'Supporting details'
    },
    correct: 'c',
    explanation: 'In reading comprehension and composition, the sentence that explicitly expresses the central point, controlling idea, or main focus of a paragraph is designated as the topic sentence (ENG101 Handouts Lesson 3). Appeared in ENG101 All Mids Solved papers.',
    urdu_answer: 'وہ جملہ جو کسی پیراگراف کے مرکزی خیال یا اہم ترین نقطہ نظر کو واضح طور پر بیان کرتا ہے، اسے ٹاپک سینٹنس (Topic sentence) کہا جاتا ہے۔'
  },
  {
    stem: 'Mark the following statement as True or False: "A sentence that expresses the main idea of the paragraph in which it occurs is called a topic sentence."',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'True. By definition, a topic sentence is the statement within a paragraph that summarizes the main thought or argument, with the rest of the paragraph providing supporting evidence, explanations, or examples (ENG101 Handouts Lesson 3). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'یہ بیان بالکل درست (True) ہے؛ ٹاپک سینٹنس پیراگراف کے مرکزی خیال کو بیان کرنے والا بنیادی جملہ ہوتا ہے۔'
  },
  {
    stem: 'Mark the statement as True or False: "A topic sentence is always the last sentence of a paragraph."',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'False. While a topic sentence can occur at the end of a paragraph (serving as a conclusion or climax), it most commonly appears at the very beginning (first sentence), or in the middle. Furthermore, some paragraphs convey their main idea implicitly without an explicit topic sentence (ENG101 Handouts Lesson 3). Appeared in Attiq Kundi and Oxford Handout Shop papers.',
    urdu_answer: 'یہ بیان غلط (False) ہے۔ ٹاپک سینٹنس زیادہ تر پیراگراف کے آغاز میں آتا ہے، اگرچہ یہ درمیان یا آخر میں بھی ہو سکتا ہے؛ یہ ہمیشہ آخری جملہ نہیں ہوتا۔'
  },
  {
    stem: 'Topic sentences give you the main idea of the paragraph and are used while ________ written text.',
    options: {
      a: 'Skimming',
      b: 'Scanning'
    },
    correct: 'a',
    explanation: 'Skimming is a fast reading technique where the reader looks through headings, subheadings, and topic sentences to grasp the overall gist or main ideas of a text quickly without reading every word (ENG101 Handouts Lesson 3 & 18). Scanning, in contrast, is searching for a specific fact, date, or keyword. Appeared in VU Stars Grand Quiz file.',
    urdu_answer: 'کسی تحریر کا تیزی سے جائزہ لے کر اس کا مرکزی خیال حاصل کرنے کے لیے ٹاپک سینٹنسز کو پڑھنے کی تکنیک کو Skimming کہا جاتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Read the following text and state the main idea of the passage:\n\n"To many parents, the infant\'s crying may be mainly an irritation, especially if it continues for long periods. But crying serves important functions for the child as well as for the parents. For the child, crying helps improve lung capacity and the respiratory system. Perhaps more important, the cry serves as a signal of distress. When babies cry, they indicate that they are hungry or in pain, and this is important information for parents."',
    correct: `<p><strong>Main Idea of the Passage:</strong></p>
<p>Although infant crying can be perceived by parents as a source of irritation or stress, it serves vital biological and communicative functions: it enhances the baby\'s respiratory health and lung development, and serves as an indispensable distress signal communicating hunger, discomfort, or pain to caregivers.</p>
<p><strong>Core Takeaway:</strong> Crying is not merely noise; it is an essential developmental and survival mechanism for infants.</p>`,
    explanation: 'High-frequency 3-mark subjective question appearing in Moaaz Solved Subjectives (Q14), Paper 3, and generic midterm files.',
    urdu_answer: 'اگرچہ بچوں کا رونا والدین کے لیے باعثِ پریشانی ہو سکتا ہے، لیکن یہ بچے کی سانس کے نظام اور پھیپھڑوں کی مضبوطی کے ساتھ ساتھ بھوک یا تکلیف سے آگاہ کرنے کا ایک ناگزیر اور قدرتی ذریعہ ہے۔'
  },
  {
    stem: 'Identify the following statements regarding paragraph structure and main ideas as True or False:\n1. A paragraph without a topic sentence may have an implied main idea.\n2. A paragraph without a topic sentence does not have supporting details.\n3. When the meaning of a word is not implied by the general sense of its context or by examples, it may be implied by an antonym or by a contrasting thought in a context.',
    correct: `<p><strong>True / False Evaluation:</strong></p>
<ol>
  <li><strong>A paragraph without a topic sentence may have an implied main idea:</strong> <strong>True</strong> — Writers often construct paragraphs where the individual sentences cumulatively convey a clear main message without stating it in a single overt sentence.</li>
  <li><strong>A paragraph without a topic sentence does not have supporting details:</strong> <strong>False</strong> — Even in paragraphs with an implied main idea, the paragraph is entirely composed of supporting details, facts, and descriptions that guide the reader to deduce the overarching point.</li>
  <li><strong>When the meaning of a word is not implied by the general sense of its context or by examples, it may be implied by an antonym or by a contrasting thought in a context:</strong> <strong>True</strong> — Contrast clues, opposition markers (e.g., <em>unlike, whereas, but</em>), and antonyms are standard context clues utilized to infer unfamiliar vocabulary.</li>
</ol>`,
    explanation: '3-mark conceptual question from ENG101 Moaaz Solved Subjectives and Paper 3.',
    urdu_answer: '1. درست (True - بغیر ٹاپک سینٹنس کے بھی پیراگراف کا مفہومی مرکزی خیال ہو سکتا ہے)؛ 2. غلط (False - ایسے پیراگراف میں بھی معاون تفصیلات موجود ہوتی ہیں)؛ 3. درست (True - متضاد خیالات اور اینٹونم سے بھی سیاقی معنی سمجھا جا سکتا ہے)۔'
  },
  {
    stem: 'What are the three core steps in analyzing a paragraph\'s structure? Briefly explain each.',
    correct: `<p><strong>Three Core Steps in Analyzing a Paragraph\'s Structure (ENG101 Handouts Lesson 3):</strong></p>
<ol>
  <li><strong>Identify the Topic:</strong>
    <ul>
      <li>Determine the general subject or who/what the passage is about. It can usually be summarized in a single word or short noun phrase.</li>
    </ul>
  </li>
  <li><strong>Pick the Main Idea:</strong>
    <ul>
      <li>Determine what specific point, argument, or perspective the author is communicating about that topic. This is often encapsulated in the topic sentence.</li>
    </ul>
  </li>
  <li><strong>Recognize Supporting Details:</strong>
    <ul>
      <li>Identify the specific evidence, explanations, statistics, personal anecdotes, or logical reasons that substantiate, elaborate, and prove the main idea.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'Standard 3-mark analytical question appearing in latest ENG101 midterm papers (Paper 2 & 4).',
    urdu_answer: 'پیراگراف کے ساختی تجزیے کے 3 اہم مراحل درج ذیل ہیں: 1. عنوان (Topic) کی شناخت کرنا کہ پیراگراف کس بارے میں ہے، 2. مرکزی خیال (Main Idea) کو تلاش کرنا کہ مصنف کا بنیادی نقطہ نظر کیا ہے، اور 3. معاون تفصیلات (Supporting Details) کی تصدیق کرنا جو مرکزی خیال کو ثابت کرتی ہیں۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Read the paragraph carefully and identify its topic, main idea, and supporting details:\n\n"Myths are stories, the products of fertile imagination, sometimes simple, often containing profound truths. They are not meant to be taken too literally. Details may sometimes appear childish, but most myths express a culture\'s most serious beliefs about human beings, eternity, and God."',
    correct: `<p><strong>Paragraph Analysis (ENG101 Handouts Lesson 3):</strong></p>

<h4>1. Topic:</h4>
<p>Myths and their cultural significance.</p>

<h4>2. Main Idea:</h4>
<p>Although myths are imaginative narratives with details that may appear simple or childish on the surface, they are not intended to be interpreted literally; rather, they embody and communicate a culture\'s deepest and most serious philosophical beliefs regarding human nature, eternity, and the divine.</p>

<h4>3. Supporting Details:</h4>
<ul>
  <li>Myths originate from fertile human imagination yet encompass profound moral and metaphysical truths.</li>
  <li>They should not be evaluated as literal historical accounts.</li>
  <li>Despite seemingly childish narrative motifs, their fundamental objective is to articulate enduring societal values and religious convictions.</li>
</ul>`,
    explanation: 'High-frequency 5-mark subjective question appearing in Moaaz Subjectives (Q16), Past Paper 3 (Q2), and generic midterm files.',
    urdu_answer: 'پیراگراف کا بنیادی عنوان اساطیری کہانیاں (Myths) ہے۔ اس کا مرکزی خیال یہ ہے کہ کہانیاں محض خیالی یا بچکانہ باتیں نہیں ہوتیں اور نہ ہی انہیں لفظی معنوں میں لینا چاہیے، بلکہ وہ کسی قوم اور ثقافت کے خدا، کائنات اور انسانی وجود کے متعلق گہرے ترین عقائد کی ترجمانی کرتی ہیں۔'
  },
  {
    stem: 'Read the paragraph and identify its main idea and primary solution:\n\n"When aging parents need help, it puts a tremendous weight on their adult children. The situation is particularly difficult if the parent does not live nearby. To handle such difficult situations, some health experts advise adult children to investigate community resources such as Meals on Wheels. Another suggestion is to rotate care..."',
    correct: `<p><strong>Paragraph Analysis (ENG101 Handouts Lesson 3):</strong></p>

<h4>1. Topic:</h4>
<p>Caring for aging parents / Eldercare challenges for adult children.</p>

<h4>2. Main Idea:</h4>
<p>Caring for aging parents places severe emotional, logistical, and physical burdens on adult children—especially when separated by distance—but adult children can mitigate and manage these burdens by utilizing structured community services (such as Meals on Wheels) and coordinating shared caregiver schedules.</p>

<h4>3. Key Supporting Solutions:</h4>
<ul>
  <li><strong>Community Support Programs:</strong> Tapping into organized welfare programs like Meals on Wheels for nutritional and social welfare support.</li>
  <li><strong>Care Rotation Strategy:</strong> Distributing caregiving duties across siblings or family members to prevent caregiver burnout.</li>
</ul>`,
    explanation: '5-mark subjective question from Moaaz Solved Subjectives (Q15) and generic midterm exam files.',
    urdu_answer: 'بوڑھے والدین کی دیکھ بھال بالغ اولاد پر بہت زیادہ دباؤ ڈالتی ہے بالخصوص اگر وہ دور رہتے ہوں۔ اس کا حل یہ ہے کہ کمیونٹی کے فلاحی اداروں (جیسے Meals on Wheels) سے مدد لی جائے اور بہن بھائیوں کے درمیان باری باری دیکھ بھال کا نظام بنایا جائے۔'
  },
  {
    stem: 'Read the following passage and identify its topic and main idea, highlighting the author\'s focus on objectivity:\n\n"Anthropology is the scientific study of the origin, the behavior, and the physical, social, and cultural development of human beings. Anthropologists usually go to other places to study the people that live there. When they do, they do not make value judgments. For example, they look at the culture of the people there. But they do not say, \'In my opinion, this culture is terrible.\' Or they study the foods that people eat, but they do not say \'in my view, eating horses is repulsive.\' Instead, anthropologists keep their personal beliefs out of their work, and report only on what they observe while viewing another culture."',
    correct: `<p><strong>Passage Analysis (ENG101 Handouts Lesson 3):</strong></p>

<h4>1. Topic:</h4>
<p>Anthropological fieldwork and cultural objectivity.</p>

<h4>2. Main Idea:</h4>
<p>Anthropology is an empirical science in which researchers systematically observe, document, and analyze human societies and customs with strict scientific neutrality, deliberately withholding personal value judgments, subjective moral biases, or cultural superiority complexes.</p>

<h4>3. Supporting Details and Examples:</h4>
<ul>
  <li>Anthropologists study human origins, social behavior, and cultural evolution worldwide.</li>
  <li>When observing foreign practices or dietary customs (e.g., eating horses), researchers avoid declaring them "terrible" or "repulsive."</li>
  <li>Fieldworkers separate personal convictions from professional scientific observation, ensuring factual, unbiased reporting.</li>
</ul>`,
    explanation: '5-mark analytical subjective question from ENG101 Midterm Paper 3 (Q16).',
    urdu_answer: 'اینتھروپولوجی انسانی ثقافت اور ارتقا کا سائنسی مطالعہ ہے۔ اس کا مرکزی خیال یہ ہے کہ ماہرینِ بشریات دوسرے معاشروں اور ثقافتوں کا مطالعہ کرتے وقت اپنے ذاتی تعصبات اور اخلاقی فیصلوں کو الگ رکھتے ہیں اور بغیر کسی ذاتی رائے زنی کے صرف حقائق کو ریکارڈ کرتے ہیں۔'
  },
  {
    stem: 'Recall your knowledge about main ideas, topic sentences, and supporting details, and evaluate the following statements as True or False:\n1. The sentence in which the author tells his or her most important point about the topic is called topic sentence.\n2. The supporting detail is the author’s most important point about the topic.\n3. A topic sentence is a general sentence that does not make complete sense and sometimes contains the topic.\n4. Main idea of a passage can appear anywhere in the paragraph.\n5. Main idea can appear either in the beginning or at the end but it is never within the paragraph.',
    correct: `<p><strong>True / False Evaluation &amp; Justifications:</strong></p>
<ol>
  <li><strong>The sentence in which the author tells his or her most important point about the topic is called topic sentence:</strong> <strong>True</strong> — A topic sentence explicitly articulates the author\'s main claim or perspective on the topic.</li>
  <li><strong>The supporting detail is the author’s most important point about the topic:</strong> <strong>False</strong> — Supporting details provide secondary clarification, statistics, proof, and examples that support the main point; they are not the central thesis itself.</li>
  <li><strong>A topic sentence is a general sentence that does not make complete sense and sometimes contains the topic:</strong> <strong>False</strong> — A topic sentence is always an independent, grammatically complete sentence that expresses a complete thought.</li>
  <li><strong>Main idea of a passage can appear anywhere in the paragraph:</strong> <strong>True</strong> — Authors can place the controlling idea at the start (deductive), at the end (inductive), in the middle, or leave it implied throughout.</li>
  <li><strong>Main idea can appear either in the beginning or at the end but it is never within the paragraph:</strong> <strong>False</strong> — A main idea can frequently appear in the middle of a paragraph, commonly introduced after introductory background or transitional clauses.</li>
</ol>`,
    explanation: '5-mark comprehensive conceptual question appearing in ENG101 Midterm Solved Paper 1 (Q21).',
    urdu_answer: '1. درست (True)، 2. غلط (False - تفصیلات مرکزی خیال کو سہارا دیتی ہیں)، 3. غلط (False - ٹاپک سینٹنس مکمل معنی خیز جملہ ہوتا ہے)، 4. درست (True - مرکزی خیال کہیں بھی آ سکتا ہے)، 5. غلط (False - مرکزی خیال پیراگراف کے درمیان میں بھی آ سکتا ہے)۔'
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
    insMcq.run(lec3.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec3.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec3.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 3:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 3: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

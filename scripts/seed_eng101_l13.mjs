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

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(eng101.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Reading: Assessing the Text (Facts, Opinions, and Value-Words)')
  `).run(eng101.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`ENG101 Lecture 13 found with ID: ${lec13.id}`);
}

// 3. Clear existing questions for Lecture 13
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec13.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 13.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'If a statement can be proved true through verifiable objective evidence, what is it formally called?',
    options: {
      a: 'Analysis',
      b: 'Proposal',
      c: 'Fact',
      d: 'Opinion'
    },
    correct: 'c',
    explanation: 'According to ENG101 Handouts Lesson 13: "A fact is a statement that can be proved true through objective evidence." Facts are verifiable through empirical observation, official documentation, or scientific measurement. Appeared in 4+ past paper files.',
    urdu_answer: 'ایسا بیان جسے معروضی اور ٹھوس شواہد کے ذریعے سچ ثابت کیا جا سکے، حقیقت (Fact) کہلاتا ہے۔'
  },
  {
    stem: 'In critical reading and textual evaluation, value-words often represent ________.',
    options: {
      a: 'Facts',
      b: 'None of above',
      c: 'Opinions',
      d: 'Both A and B'
    },
    correct: 'c',
    explanation: 'ENG101 Handouts Lesson 13 teaches that value-words (e.g., best, worst, beautiful, horrible, wonderful) reflect subjective personal judgments, emotional reactions, and evaluations; hence they represent opinions rather than facts. Appeared in VU Stars and Attiq Kundi files.',
    urdu_answer: 'قدر پیمائی والے الفاظ (Value-words جیسے اچھا، برا، شاندار، خوفناک) کسی واقعے کی بجائے مصنف کی ذاتی رائے (Opinions) کی عکاسی کرتے ہیں۔'
  },
  {
    stem: 'Which of the following definitions best describes a fact?',
    options: {
      a: 'Something that can be proven',
      b: 'A person\'s thoughts and feelings about something',
      c: 'A prediction about the future',
      d: 'A personal preference'
    },
    correct: 'a',
    explanation: 'A fact is defined as an assertion of actuality that can be definitively proven true or false through empirical verification, records, or scientific observation (ENG101 Handouts Lesson 13). Appeared in Attiq Kundi and Oxford files.',
    urdu_answer: 'حقیقت (Fact) کی بہترین تعریف یہ ہے کہ یہ کوئی ایسی بات ہے جسے ٹھوس شواہد سے ثابت (proven) کیا جا سکتا ہو۔'
  },
  {
    stem: 'Which of the following definitions best describes an opinion?',
    options: {
      a: 'Something that can be proven',
      b: 'A person’s thoughts and feelings about something',
      c: 'Objective statistical evidence',
      d: 'A universal scientific law'
    },
    correct: 'b',
    explanation: 'An opinion expresses personal beliefs, subjective values, moral stances, or emotional attitudes about a subject, and cannot be scientifically or objectively proven true or false (ENG101 Handouts Lesson 13). Appeared in Attiq Kundi and Oxford Handout Shop files.',
    urdu_answer: 'رائے (Opinion) کی تعریف یہ ہے کہ یہ کسی شخص کے ذاتی خیالات، جذبات یا انفرادی سوچ کا اظہار ہوتی ہے۔'
  },
  {
    stem: 'Which one of the following statements expresses a verifiable fact?',
    options: {
      a: 'Professor Ahmad Khan argues that the effect of carbon emissions on the surrounding environment will only get worse.',
      b: 'This product might cause stomach upset for some people in years to come.',
      c: 'In 2005, Brazil and FC Barcelona star Ronaldinho was named FIFA World Footballer of The Year.',
      d: 'Local councilors should spend more time listening to residents and less time listening to each other.'
    },
    correct: 'c',
    explanation: 'Statement C is a historically documented, verifiable sports record. In contrast, A describes an argument/hypothesis, B is speculative future prediction ("might cause"), and D expresses a normative moral recommendation ("should") (ENG101 Handouts Lesson 13). Appeared in 4+ past paper files.',
    urdu_answer: '2005 میں رونالڈینیو کا فیفا ورلڈ فٹبالر آف دی ایئر نامزد ہونا ایک دستاویزی اور تاریخی حقیقت (Fact) ہے جسے ریکارڈز سے ثابت کیا جا سکتا ہے۔'
  },
  {
    stem: 'In order to accurately evaluate and assess an expository text, a reader must be able to discriminate facts from ________.',
    options: {
      a: 'fiction / opinion',
      b: 'grammar',
      c: 'vocabulary',
      d: 'summaries'
    },
    correct: 'a',
    explanation: 'A fundamental objective of critical reading is the ability to separate objective, verifiable evidence (facts) from authorial interpretations, personal values, and creative assertions (fiction/opinion) (ENG101 Handouts Lesson 13 & 16). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'کسی تحریر کا درست تنقیدی جائزہ لینے کے لیے قاری میں حقائق (facts) کو ذاتی آراء یا فکشن (opinion/fiction) سے الگ کرنے کی صلاحیت ہونی چاہیے۔'
  },
  {
    stem: 'Which of the following statements represents an opinion rather than a fact?',
    options: {
      a: 'More people stopped smoking last year than two years ago.',
      b: 'Last year there was a horrible outbreak of flu.',
      c: 'The average temperature in Wyoming in January is 35°F.',
      d: 'In Judaism, Rosh Hashanah is the festival of the New Year.'
    },
    correct: 'b',
    explanation: 'Statement B contains the subjective value-word "horrible", which expresses an emotional evaluation. The other options are verifiable through public health records, meteorological statistics, and religious calendars (ENG101 Handouts Lesson 13). Appeared in VU Stars Grand Quiz file.',
    urdu_answer: 'جملہ B میں لفظ "horrible" ایک ذاتی تاثر اور قدر پیمائی (Value-word) ہے، اس لیے یہ ایک رائے (Opinion) ہے۔'
  },
  {
    stem: 'Which of the following statements expresses a verifiable fact?',
    options: {
      a: 'Dancing is forbidden in some societies.',
      b: 'Dancing is the best form of exercise.',
      c: 'Everyone should learn how to dance.',
      d: 'Dancing is always fun.'
    },
    correct: 'a',
    explanation: 'The prohibition of dancing in specific legal or cultural societies is an objectively verifiable legal/sociological fact. Options B, C, and D contain value judgments ("best", "should", "always fun") (ENG101 Handouts Lesson 13). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'بعض معاشروں میں رقص پر پابندی ہونا ایک قابلِ مشاہدہ اور دستاویزی سماجی حقیقت (Fact) ہے۔'
  },
  {
    stem: 'Identify the nature of the following statement: "The earth is the third planet from the sun."',
    options: {
      a: 'Fact',
      b: 'Opinion',
      c: 'Assumption',
      d: 'Value judgment'
    },
    correct: 'a',
    explanation: 'This is a verified empirical fact determined by astronomical measurements and orbital mechanics (ENG101 Handouts Lesson 13). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'زمین کا نظام شمسی میں سورج سے تیسرا سیارہ ہونا ایک غیر متنازع اور ثابت شدہ سائنسی حقیقت (Fact) ہے۔'
  },
  {
    stem: 'Determine whether the given statement is a Fact or an Opinion: "The rising crime rate is a sign of the times."',
    options: {
      a: 'Fact',
      b: 'Opinion'
    },
    correct: 'b',
    explanation: 'While the raw crime statistics are factual, interpreting the increase as "a sign of the times" is a subjective philosophical commentary and moral opinion (ENG101 Handouts Lesson 13). Appeared in Team Hadi and Attiq Kundi files.',
    urdu_answer: 'اگرچہ جرائم کی شرح کے اعداد و شمار حقیقت ہیں، لیکن اسے "زمانے کے بگاڑ کی علامت" قرار دینا ایک ذاتی تشریح اور رائے (Opinion) ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'Read the following statements and classify each as a Fact or an Opinion, providing a brief justification:\n1. Pizza tastes better than fish.\n2. Many people work Mondays through Fridays at their jobs.\n3. Before electricity, many people burnt candles to give them light.\n4. Jumping rope is a form of exercise.',
    correct: `<p><strong>Fact vs. Opinion Classification &amp; Justification (ENG101 Handouts Lesson 13):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">No.</th>
      <th style="padding: 8px;">Statement</th>
      <th style="padding: 8px;">Classification</th>
      <th style="padding: 8px;">Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">1</td>
      <td style="padding: 8px;">Pizza tastes better than fish.</td>
      <td style="padding: 8px;"><strong>Opinion</strong></td>
      <td style="padding: 8px;">Contains the subjective sensory value-phrase <em>"tastes better"</em>, which varies by individual culinary preference.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">2</td>
      <td style="padding: 8px;">Many people work Mondays through Fridays at their jobs.</td>
      <td style="padding: 8px;"><strong>Fact</strong></td>
      <td style="padding: 8px;">Verifiable through labor statistics and corporate employment schedules worldwide.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">3</td>
      <td style="padding: 8px;">Before electricity, many people burnt candles to give them light.</td>
      <td style="padding: 8px;"><strong>Fact</strong></td>
      <td style="padding: 8px;">Historically documented technological and domestic practice.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">4</td>
      <td style="padding: 8px;">Jumping rope is a form of exercise.</td>
      <td style="padding: 8px;"><strong>Fact</strong></td>
      <td style="padding: 8px;">Universally recognized physiological cardiovascular physical activity.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'High-frequency 3-mark subjective exercise from Moaaz Solved Subjectives (Q11) and Generic Midterm files.',
    urdu_answer: '1. رائے (Opinion) کیونکہ ذائقہ ذاتی پسند پر مبنی ہے؛ 2. حقیقت (Fact) کیونکہ دفتری اوقات کو ریکارڈ سے دیکھا جا سکتا ہے؛ 3. حقیقت (Fact) کیونکہ یہ تاریخی طور پر ثابت ہے؛ 4. حقیقت (Fact) کیونکہ رسی کودنا طبی طور پر ورزش کی تسلیم شدہ قسم ہے۔'
  },
  {
    stem: 'Identify the following statements as Fact or Opinion, stating the analytical basis for your conclusion:\n1. It is easiest to travel to Australia by boat.\n2. My sister looks best in red.\n3. Canada is located on the continent of North America.\n4. Antarctica is the southernmost continent.',
    correct: `<p><strong>Fact vs. Opinion Analysis (ENG101 Handouts Lesson 13):</strong></p>

<ol>
  <li><strong>"It is easiest to travel to Australia by boat":</strong> <strong>Opinion</strong> — The judgment word <em>"easiest"</em> is subjective; most travelers consider modern aviation significantly faster, cheaper, and less arduous than sea voyages.</li>
  <li><strong>"My sister looks best in red":</strong> <strong>Opinion</strong> — The evaluative value-word <em>"looks best"</em> reflects an individual aesthetic judgment.</li>
  <li><strong>"Canada is located on the continent of North America":</strong> <strong>Fact</strong> — Verifiable geographical and geopolitical reality documented on world atlases.</li>
  <li><strong>"Antarctica is the southernmost continent":</strong> <strong>Fact</strong> — Verifiable geographic fact based on terrestrial latitude and polar coordinates.</li>
</ol>`,
    explanation: 'Core 3-mark identification question from ENG101 Midterm Paper 1 (Q11).',
    urdu_answer: '1. رائے (Opinion - لفظ easiest ذاتی رائے ہے)؛ 2. رائے (Opinion - سرخ رنگ میں بہترین لگنا ذاتی پسند ہے)؛ 3. حقیقت (Fact - کینیڈا کا جغرافیائی مقام نقشے سے ثابت ہے)؛ 4. حقیقت (Fact - انٹارکٹیکا کا قطب جنوبی کا براعظم ہونا ثابت شدہ جغرافیہ ہے)۔'
  },
  {
    stem: 'Read the following sentences and classify each as Fact (F), Opinion (O), or a Blend of Both (B), highlighting the presence of evaluative value-words:\n1. Victor Emmanuel II was the first king to rule over a united Italy; he was also a madman, who had his toenail clippings edged in gold and encrusted in diamonds. Then he would give the clippings to palace favorites.\n2. In 1943, the extraordinary Jacques Cousteau invented an improved diving suit that allowed divers to descend 500 feet below the surface of the ocean; nowadays, that suit is usually referred to as a scuba suit.\n3. Richard Rodriguez writes movingly about his personal struggle to honor his Spanish-speaking parents and still excel at speaking English.',
    correct: `<p><strong>Classification of Complex Statements (ENG101 Handouts Lesson 13):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">No.</th>
      <th style="padding: 8px;">Statement Extract</th>
      <th style="padding: 8px;">Tag</th>
      <th style="padding: 8px;">Textual Evidence &amp; Value-Words</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">1</td>
      <td style="padding: 8px;">Victor Emmanuel II was the first king... he was also a madman...</td>
      <td style="padding: 8px;"><strong>Blend / Opinion (B/O)</strong></td>
      <td style="padding: 8px;">While his reign and coronation in 1861 are historical facts, labeling him a <strong>"madman"</strong> injects an extreme subjective evaluation.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">2</td>
      <td style="padding: 8px;">In 1943, the extraordinary Jacques Cousteau invented an improved diving suit...</td>
      <td style="padding: 8px;"><strong>Blend / Fact (B/F)</strong></td>
      <td style="padding: 8px;">The historical invention of the Aqua-Lung in 1943 is a proven fact, though colored by the flattering adjective <strong>"extraordinary"</strong>. (Accepted as F in VU past paper keys).</td>
    </tr>
    <tr>
      <td style="padding: 8px;">3</td>
      <td style="padding: 8px;">Richard Rodriguez writes movingly about his personal struggle...</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">The adverb <strong>"movingly"</strong> is a value-word reflecting the subjective emotional resonance felt by a specific reader.</td>
    </tr>
  </tbody>
</table>`,
    explanation: '3-mark analytical evaluation question appearing in Moaaz Subjectives (Q13) and generic past papers.',
    urdu_answer: '1. رائے / ملا جلا بیان (کیونکہ لفظ "madman" ذاتی رائے ہے اگرچہ بادشاہ ہونا حقیقت ہے)؛ 2. حقیقت (کیونکہ 1943 میں ڈائیونگ سوٹ کی ایجاد تاریخی حقیقت ہے)؛ 3. رائے (کیونکہ "movingly" پڑھنے والے کے ذاتی جذباتی تاثر کو ظاہر کرتا ہے)۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Carefully evaluate the following 10 statements regarding literary figures Edgar Allan Poe and H.P. Lovecraft. Classify each statement as a Fact (F) or an Opinion (O), identifying the objective verification or subjective value-words present in each:\n1. Edgar Allan Poe is the greatest writer of horror stories in the world.\n2. Poe had to leave the University of Virginia because he couldn’t pay his debts.\n3. Edgar Allan Poe should not have drunk so much.\n4. Lovecraft has often been compared to Edgar Allan Poe.\n5. When Lovecraft died, he was practically unknown.\n6. Lovecraft died in the conditions of shameful neglect.\n7. Lovecraft’s stories are far more horrible than those of Edgar Allan Poe.\n8. Edgar Allan Poe’s stories reflect his powerful imagination and his love for analysis.\n9. Baudelaire wrote that Edgar Poe ‘pursued imagination and subjected it to the most stringent analysis’.\n10. It is because of Baudelaire that Edgar Allan Poe became famous in France.',
    correct: `<p><strong>Textual Evaluation: Poe and Lovecraft (ENG101 Handouts Lesson 13 Exercise):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">No.</th>
      <th style="padding: 8px;">Statement</th>
      <th style="padding: 8px;">Type</th>
      <th style="padding: 8px;">Linguistic Clue / Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">1</td>
      <td style="padding: 8px;">Edgar Allan Poe is the greatest writer of horror stories in the world.</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">Superlative value-word <em>"greatest"</em> is a subjective judgment.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">2</td>
      <td style="padding: 8px;">Poe had to leave the University of Virginia because he couldn’t pay his debts.</td>
      <td style="padding: 8px;"><strong>Fact (F)</strong></td>
      <td style="padding: 8px;">Verifiable historical university archival record.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">3</td>
      <td style="padding: 8px;">Edgar Allan Poe should not have drunk so much.</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">Modal auxiliary <em>"should not have"</em> introduces moral/personal advice.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">4</td>
      <td style="padding: 8px;">Lovecraft has often been compared to Edgar Allan Poe.</td>
      <td style="padding: 8px;"><strong>Fact (F)</strong></td>
      <td style="padding: 8px;">Verifiable in published literary criticism and comparative essays.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">5</td>
      <td style="padding: 8px;">When Lovecraft died, he was practically unknown.</td>
      <td style="padding: 8px;"><strong>Fact (F)</strong></td>
      <td style="padding: 8px;">Verifiable publishing and circulation records during Lovecraft\'s lifetime.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">6</td>
      <td style="padding: 8px;">Lovecraft died in the conditions of shameful neglect.</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">The moral qualifier <em>"shameful"</em> expresses emotional reprobation.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">7</td>
      <td style="padding: 8px;">Lovecraft’s stories are far more horrible than those of Edgar Allan Poe.</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">Comparative degree <em>"more horrible"</em> is subjective literary taste.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">8</td>
      <td style="padding: 8px;">Edgar Allan Poe’s stories reflect his powerful imagination and his love for analysis.</td>
      <td style="padding: 8px;"><strong>Opinion (O)</strong></td>
      <td style="padding: 8px;">Qualifiers like <em>"powerful imagination"</em> represent literary interpretation.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">9</td>
      <td style="padding: 8px;">Baudelaire wrote that Edgar Poe \'pursued imagination and subjected it to the most stringent analysis\'.</td>
      <td style="padding: 8px;"><strong>Fact (F)</strong></td>
      <td style="padding: 8px;">Direct historical quotation documented in Charles Baudelaire\'s printed prefaces.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">10</td>
      <td style="padding: 8px;">It is because of Baudelaire that Edgar Allan Poe became famous in France.</td>
      <td style="padding: 8px;"><strong>Fact (F)</strong></td>
      <td style="padding: 8px;">Established historical causation in French literary reception history.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Comprehensive 5-mark exercise evaluating nuanced factual assertions versus subjective literary interpretations from ENG101 Handouts Lesson 13.',
    urdu_answer: 'پو اور لووکرافٹ کے 10 بیانات کا تجزیہ: 1. رائے (O - لفظ greatest)؛ 2. حقیقت (F - ریکارڈ سے ثابت)؛ 3. رائے (O - لفظ should اخلاقی رائے ہے)؛ 4. حقیقت (F - تنقیدی کتب سے ثابت)؛ 5. حقیقت (F)؛ 6. رائے (O - لفظ shameful)؛ 7. رائے (O - ذاتی ادبی پسند)؛ 8. رائے (O - لفظ powerful)؛ 9. حقیقت (F - بوڈلیئر کا لکھا ہوا ریکارڈ ہے)؛ 10. حقیقت (F - تاریخ سے ثابت)۔'
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
    insMcq.run(lec13.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec13.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec13.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 13:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 13: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

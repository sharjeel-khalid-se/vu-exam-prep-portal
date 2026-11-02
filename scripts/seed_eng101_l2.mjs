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

// 2. Create or fetch Lecture 2
let lec2 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 2").get(eng101.id);
if (!lec2) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 2, 'Pronunciation: Phonetics, Vowels, Consonants, and Word Stress')
  `).run(eng101.id);
  lec2 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 2 with ID: ${lec2.id}`);
} else {
  console.log(`ENG101 Lecture 2 found with ID: ${lec2.id}`);
}

// 3. Clear existing questions for Lecture 2
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec2.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 2.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'How many consonant sounds are there in English language?',
    options: {
      a: '20',
      b: '24',
      c: '26',
      d: '23'
    },
    correct: 'b',
    explanation: 'In English phonology, there are 24 distinct consonant sounds (15 voiced and 9 voiceless). Although the written English alphabet contains 21 consonant letters, they combine to produce 24 distinct consonant phonemes (ENG101 Handouts Lecture 2). Appeared repeatedly across ENG101 Midterm Paper 1, Paper 7, Education Gator, and Attiq Kundi files.',
    urdu_answer: 'انگریزی زبان کے صوتیاتی نظام (Phonetics) میں کل 24 کانسوننٹ آوازیں (Consonant sounds) ہوتی ہیں، جن میں 15 آوازیں Voiced اور 9 آوازیں Voiceless ہوتی ہیں۔'
  },
  {
    stem: 'How many vowel phonemes (sounds) are there in English language?',
    options: {
      a: '20',
      b: '24',
      c: '5',
      d: '26'
    },
    correct: 'a',
    explanation: 'There are 20 vowel phonemes (sounds) in standard English, even though there are only 5 written vowel letters (a, e, i, o, u). These 20 vowel sounds consist of 12 pure vowels (monophthongs) and 8 diphthongs (ENG101 Handouts Lecture 2). Appeared in ENG101 Midterm Solved Papers.',
    urdu_answer: 'انگریزی زبان میں 20 واول آوازیں (Vowel phonemes) ہوتی ہیں جن میں 12 خالص واولز (Monophthongs) اور 8 گلائیڈنگ واولز یعنی ڈفتھونگز (Diphthongs) شامل ہیں۔'
  },
  {
    stem: 'How many long vowels are there in English pure vowels (monophthongs)?',
    options: {
      a: '5',
      b: '7',
      c: '8',
      d: '12'
    },
    correct: 'a',
    explanation: 'In standard English phonology, the 12 pure vowels (monophthongs) are divided into 7 short vowels (/ɪ/, /e/, /æ/, /ʌ/, /ɒ/, /ʊ/, /ə/) and 5 long vowels (/iː/, /uː/, /ɑː/, /ɔː/, /ɜː/) (ENG101 Handouts Lecture 2).',
    urdu_answer: 'انگریزی مونوفتھونگز (خالص واولز) میں 5 طویل واولز (Long vowels) ہوتے ہیں جن کی ادائیگی میں آواز نسبتاً لمبی کھینچی جاتی ہے (جیسے /iː/, /uː/, /ɑː/, /ɔː/, /ɜː/)۔'
  },
  {
    stem: 'There are 24 vowel phonemes in English. State True or False.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'b',
    explanation: 'False. Standard English has 20 vowel phonemes and 24 consonant phonemes, making a total of 44 phonemes in Received Pronunciation (RP) (ENG101 Handouts Lecture 2). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'یہ بیان غلط (False) ہے۔ انگریزی میں 20 واول فونیمز اور 24 کانسوننٹ فونیمز ہوتے ہیں جن سے مل کر مجموعی طور پر 44 آوازیں بنتی ہیں۔'
  },
  {
    stem: 'Words with the same spelling stressed differently belong to different parts of speech. State True or False.',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'True. In English morphology and phonology, changing the syllable that receives primary stress often converts a word from a noun/adjective (first syllable stressed, e.g., \'rebel, \'object, \'present) into a verb (second syllable stressed, e.g., re\'bel, ob\'ject, pre\'sent) (ENG101 Handouts Lecture 2). Appeared in ENG101 Midterm Papers.',
    urdu_answer: 'یہ بیان بالکل درست (True) ہے۔ انگریزی میں جب ایک ہی ہجے والے لفظ پر دباؤ (Stress) کی پوزیشن بدلی جائے تو اس کا پارٹ آف اسپیچ اسم سے فعل یا صفت میں تبدیل ہو جاتا ہے۔'
  },
  {
    stem: 'In which of the following words is the initial letter "h" silent?',
    options: {
      a: 'Heir',
      b: 'Hair',
      c: 'House',
      d: 'Horse'
    },
    correct: 'a',
    explanation: 'The letter "h" is completely silent in "heir" (pronounced exactly like "air" /eə(r)/), as well as in "hour", "honest", and "honor". In words like "hair", "house", and "horse", the initial /h/ sound is aspirated and pronounced (ENG101 Handouts Lecture 2). Appeared in Moaaz and Junaid solved midterm files.',
    urdu_answer: 'لفظ "Heir" (وارث) میں ابتدائی حرف "h" خاموش (سائلنٹ) ہوتا ہے اور اس کی آواز /eə(r)/ ادا کی جاتی ہے، جبکہ باقی الفاظ میں "h" کا تلفظ ادا ہوتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'How are vowel sounds produced in English? Explain with reference to the vocal tract.',
    correct: `<p><strong>Production of Vowel Sounds (ENG101 Handouts Lecture 2):</strong></p>
<p>In phonetics, a <strong>vowel sound</strong> is produced when the airstream flows outwards from the lungs and passes freely through the pharynx and mouth cavity without meeting any complete closure, narrowing, or friction.</p>
<p>Key characteristics of vowel production include:</p>
<ul>
  <li><strong>Unobstructed Airflow:</strong> Unlike consonants, there is no physical blockage (such as lips pressing together or tongue touching the teeth/roof).</li>
  <li><strong>Vocal Cord Vibration:</strong> All English vowels are <em>voiced</em>; the vocal cords vibrate as air passes through the larynx.</li>
  <li><strong>Articulatory Modifiers:</strong> Vowel quality is determined by three variables:
    <ol>
      <li><strong>Tongue Height:</strong> High (close), mid (half-close/half-open), or low (open).</li>
      <li><strong>Tongue Part:</strong> Front, central, or back part of the tongue raised towards the palate.</li>
      <li><strong>Lip Position:</strong> Rounded (e.g., in /uː/), unrounded, or neutral/spread (e.g., in /iː/).</li>
    </ol>
  </li>
</ul>`,
    explanation: 'Frequently tested short subjective question (3 marks) from ENG101 Lecture 2 on articulatory phonetics and vowel classification.',
    urdu_answer: 'واول آواز اس وقت پیدا ہوتی ہے جب ہوا پھیپھڑوں سے بغیر کسی رکاوٹ، رگڑ یا بندش کے گلے اور منہ سے آزادانہ طور پر خارج ہو۔ تمام واولز Voiced ہوتے ہیں اور ان کے تلفظ کا تعین زبان کی اونچائی، زبان کے اگلے/پچھلے حصے کی پوزیشن اور ہونٹوں کی گولائی سے ہوتا ہے۔'
  },
  {
    stem: 'What is a consonant sound, and how does its production differ fundamentally from a vowel sound?',
    correct: `<p><strong>Definition and Distinction of Consonant Sounds (ENG101 Handouts Lecture 2):</strong></p>
<p>A <strong>consonant sound</strong> is an articulatory speech sound produced by interrupting, impeding, or constricting the flow of air from the lungs at some point along the vocal tract.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Feature</th>
      <th style="padding: 8px;">Vowel Sound (20 total)</th>
      <th style="padding: 8px;">Consonant Sound (24 total)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Airflow Obstruction</strong></td>
      <td style="padding: 8px;">Completely unobstructed; air escapes freely.</td>
      <td style="padding: 8px;">Obstructed, constricted, or diverted by active articulators.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Voicing</strong></td>
      <td style="padding: 8px;">All vowels are universally voiced.</td>
      <td style="padding: 8px;">Can be voiced (15 sounds, e.g., /b/, /d/, /z/) or voiceless (9 sounds, e.g., /p/, /t/, /s/).</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Syllable Role</strong></td>
      <td style="padding: 8px;">Forms the indispensable nucleus/center of a syllable.</td>
      <td style="padding: 8px;">Typically occupies the syllable margins (onset or coda).</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Primary Articulators</strong></td>
      <td style="padding: 8px;">Shape of tongue cavity and lip rounding.</td>
      <td style="padding: 8px;">Lips, teeth, alveolar ridge, hard palate, soft palate (velum), and glottis.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core conceptual short question (3 marks) contrasting consonants and vowels based on ENG101 Handouts Lecture 2.',
    urdu_answer: 'کانسوننٹ وہ آواز ہے جس کی ادائیگی کے دوران منہ یا گلے میں ہوا کے بہاؤ میں جزوی یا مکمل رکاوٹ (جیسے ہونٹ بند ہونا یا زبان کا تالو سے لگنا) پیش آئے۔ اس کے برعکس واول آواز میں ہوا بغیر کسی رکاوٹ کے خارج ہوتی ہے۔ کانسوننٹ آوازیں Voiced اور Voiceless دونوں ہو سکتی ہیں۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Explain the concept of word stress in English. How does stress shift affect the grammatical function (parts of speech) and meaning of words? Provide illustrative examples.',
    correct: `<p><strong>Word Stress and Stress Shift in English (ENG101 Handouts Lecture 2):</strong></p>

<h4>1. Definition of Word Stress:</h4>
<p><strong>Word stress</strong> (or accent) is the relative prominence or auditory emphasis given to a particular syllable within a polysyllabic word. A stressed syllable is produced with greater breath force, higher pitch, louder volume, and longer vowel duration than an unstressed syllable.</p>

<h4>2. The Phenomenon of Stress Shift (Noun vs. Verb Distinction):</h4>
<p>In the English language, many two-syllable (disyllabic) words that share identical spelling change their <em>part of speech</em> and meaning depending entirely upon which syllable receives the primary stress:</p>
<ul>
  <li><strong>First-Syllable Stress:</strong> When the stress falls on the <strong>first syllable</strong>, the word functions as a <strong>Noun</strong> or occasionally an <strong>Adjective</strong>.</li>
  <li><strong>Second-Syllable Stress:</strong> When the stress shifts to the <strong>second syllable</strong>, the word functions as a <strong>Verb</strong>.</li>
</ul>

<h4>3. Illustrative Comparative Examples:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Word</th>
      <th style="padding: 8px;">Noun / Adjective (Stress on 1st Syllable)</th>
      <th style="padding: 8px;">Verb (Stress on 2nd Syllable)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Present</strong></td>
      <td style="padding: 8px;"><strong>\'pre-sent</strong>: A gift; current time / not absent.</td>
      <td style="padding: 8px;"><strong>pre-\'sent</strong>: To introduce, offer, or deliver a speech.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Rebel</strong></td>
      <td style="padding: 8px;"><strong>\'reb-el</strong>: A person who rises against authority.</td>
      <td style="padding: 8px;"><strong>re-\'bel</strong>: To oppose or fight against government/rule.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Record</strong></td>
      <td style="padding: 8px;"><strong>\'rec-ord</strong>: An official document or audio disc.</td>
      <td style="padding: 8px;"><strong>re-\'cord</strong>: To set down in writing or store electronically.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Object</strong></td>
      <td style="padding: 8px;"><strong>\'ob-ject</strong>: A material thing or goal.</td>
      <td style="padding: 8px;"><strong>ob-\'ject</strong>: To express disapproval or protest.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Conduct</strong></td>
      <td style="padding: 8px;"><strong>\'con-duct</strong>: Personal behavior or deportment.</td>
      <td style="padding: 8px;"><strong>con-\'duct</strong>: To organize, lead, or transmit heat/electricity.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Contract</strong></td>
      <td style="padding: 8px;"><strong>\'con-tract</strong>: A formal legal agreement.</td>
      <td style="padding: 8px;"><strong>con-\'tract</strong>: To shrink, compress, or acquire a disease.</td>
    </tr>
  </tbody>
</table>

<h4>4. Significance for Communication:</h4>
<p>Proper application of stress is crucial in spoken English. Misplacing word stress not only distorts the rhythm and intelligibility of speech but can also completely alter the sentence\'s intended meaning and grammatical structure.</p>`,
    explanation: 'Comprehensive 5-mark subjective question covering word stress, morphological rules, and noun-verb stress shift based on ENG101 Handouts Lecture 2.',
    urdu_answer: 'ورڈ سٹریس (Word Stress) سے مراد کسی لفظ کے مخصوص حصے (Syllable) پر زیادہ زور، بلند آواز اور لمبی مدت کے ساتھ ادائیگی ہے۔ انگریزی میں اگر دو حرفی لفظ کے پہلے حصے پر سٹریس ہو تو وہ لفظ عام طور پر اسم (Noun) بنتا ہے، اور اگر دوسرے حصے پر سٹریس دیا جائے تو وہ فعل (Verb) بن جاتا ہے (جیسے \'present بطور تحفہ اور pre\'sent بطور پیش کرنا)۔'
  }
];

// 7. Insert Statements
const insMcq = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, \'mcq\', ?, ?, ?, ?, ?, 1, 1, \'lecture\')
`);

const insShort = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, \'short\', ?, ?, ?, ?, 3, 3, \'lecture\')
`);

const insLong = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, \'long\', ?, ?, ?, ?, 5, 5, \'lecture\')
`);

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lec2.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec2.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec2.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 2:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 2: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate or create ENG101 subject
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

// 2. Create or fetch Lecture 1
let lec1 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 1").get(eng101.id);
if (!lec1) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 1, 'Reading and Dictionary Usage')
  `).run(eng101.id);
  lec1 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 1 with ID: ${lec1.id}`);
} else {
  console.log(`ENG101 Lecture 1 found with ID: ${lec1.id}`);
}

// 3. Clear existing questions for Lecture 1
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec1.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 1.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Choose the best answer. What is a dictionary?',
    options: {
      a: 'A list of words and their meanings arranged alphabetically',
      b: 'A collection of stories and historical essays',
      c: 'A textbook containing grammatical rules only',
      d: 'A book of scientific formulas and charts'
    },
    correct: 'a',
    explanation: 'A dictionary is fundamentally a reference book containing an alphabetical list of the words of a language, explaining their meanings, pronunciation, etymology, and syntactic usage (ENG101 Handouts Lecture 1). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'ڈکشنری ایک ایسی کتاب ہے جس میں الفاظ اور ان کے معانی حروفِ تہجی کی ترتیب (Alphabetical order) سے درج ہوتے ہیں۔'
  },
  {
    stem: 'Choose the best answer. What is a foreign language dictionary?',
    options: {
      a: 'Tells you what English words mean',
      b: 'Tells you which foreign word says the same thing as an English word',
      c: 'Teaches you how to speak foreign language',
      d: 'All of the given'
    },
    correct: 'd',
    explanation: 'A foreign language bilingual/multilingual dictionary explains English meanings, provides corresponding equivalent foreign words/phrases, and assists learners in pronunciation and communication (ENG101 Handouts Lecture 1). Appeared in Attiq Kundi and Oxford Handout Shop midterm files.',
    urdu_answer: 'فارن لینگویج ڈکشنری انگریزی الفاظ کے معانی بھی بتاتی ہے، ان کے غیر ملکی متبادل الفاظ بھی بتاتی ہے اور بول چال میں مدد دیتی ہے، لہٰذا تمام آپشنز درست ہیں۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'How can a language learner take maximum help from a dictionary? Explain key benefits.',
    correct: `<p><strong>Taking Maximum Advantage of a Dictionary (ENG101 Handouts Lecture 1):</strong></p>
<p>A dictionary is much more than a list of definitions; a language learner can extract maximum benefit from it by utilizing the following resources:</p>
<ol>
  <li><strong>Word Spelling &amp; Syllable Division:</strong> Verifying exact spellings, hyphenation, and syllable boundaries for proper pronunciation and hyphenation in writing.</li>
  <li><strong>Pronunciation &amp; Phonetic Symbols:</strong> Learning standard pronunciation through the International Phonetic Alphabet (IPA) respellings and stress marks (primary and secondary stress).</li>
  <li><strong>Part of Speech &amp; Grammatical Labels:</strong> Identifying whether a word functions as a noun ($n$), verb ($v$), adjective ($adj$), adverb ($adv$), or preposition ($prep$), and whether nouns are countable/uncountable or verbs are transitive/intransitive.</li>
  <li><strong>Contextual Meanings &amp; Nuances:</strong> Choosing the exact definition that fits the context of reading, noting figurative and connotative shades of meaning.</li>
  <li><strong>Idioms, Phrasal Verbs &amp; Collocations:</strong> Understanding fixed idiomatic expressions, prepositional collocations, and phrasal verb combinations.</li>
  <li><strong>Etymology &amp; Word Origins:</strong> Understanding Greek, Latin, or Germanic roots, which helps deduce the meaning of related vocabulary.</li>
  <li><strong>Usage Notes &amp; Synonyms/Antonyms:</strong> Distinguishing between closely related synonyms (e.g., <em>thin</em> vs. <em>skinny</em> vs. <em>slender</em>) and checking formal versus informal registers.</li>
</ol>`,
    explanation: 'High-frequency 3-mark to 5-mark subjective question appearing across multiple ENG101 Midterm Papers (Paper 1, Paper 7 Q19).',
    urdu_answer: 'طالب علم ڈکشنری سے نہ صرف لفظ کے معانی دیکھ سکتا ہے بلکہ اس کا درست ہجے (Spelling)، تلفظ (Pronunciation)، پارٹ آف اسپیچ، گرائمر کے اصول، محاورات، اور ہم معنی الفاظ (Synonyms) کا درست استعمال بھی سیکھ سکتا ہے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Discuss in detail the various types of information provided in a comprehensive dictionary entry and explain how they enhance reading comprehension.',
    correct: `<p><strong>Anatomy of a Dictionary Entry and Its Impact on Reading Comprehension (ENG101 Lecture 1):</strong></p>

<h4>1. Headword and Orthography:</h4>
<ul>
  <li>The bold entry word indicates standard spelling, alternative American/British spellings (e.g., <em>color / colour</em>), and syllable breaks.</li>
</ul>

<h4>2. Phonetic Transcription:</h4>
<ul>
  <li>Enclosed in forward slashes or brackets (e.g., <code>/dɪkʃənri/</code>), revealing vowel qualities, silent letters, and primary/secondary stress markers.</li>
</ul>

<h4>3. Grammatical Profile (Part of Speech):</h4>
<ul>
  <li>Classifies the functional role of the word in a sentence (noun, transitive/intransitive verb, adjective) and provides irregular plural or past tense inflections (e.g., <em>run $\\rightarrow$ ran $\\rightarrow$ run</em>).</li>
</ul>

<h4>4. Layered Definitions and Senses:</h4>
<ul>
  <li>Definitions are arranged chronologically or by frequency of use. Contextual clues in reading require selecting the appropriate sense rather than the first listed definition.</li>
</ul>

<h4>5. Illustrative Example Sentences:</h4>
<ul>
  <li>Shows how the word operates syntactically and semantically in natural English prose.</li>
</ul>

<h4>6. Pragmatic Labels and Collocations:</h4>
<ul>
  <li>Indicates register (formal, informal, archaic, slang, technical) and prepositional attachments (e.g., <em>depend on</em>, <em>interested in</em>), ensuring accurate language production and interpretation.</li>
</ul>`,
    explanation: 'Comprehensive subjective guide on dictionary usage based on ENG101 Handouts Lecture 1.',
    urdu_answer: 'ایک جامع ڈکشنری اندراج میں ہیڈ ورڈ، صوتی تلفظ (IPA)، پارٹ آف اسپیچ، مختلف سیاقی معانی، وضاحتی جملے اور استعمال کے لیبلز شامل ہوتے ہیں جو فہم و تدریس (Comprehension) کو مضبوط بناتے ہیں۔'
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
    insMcq.run(lec1.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec1.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec1.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 1:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 1: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

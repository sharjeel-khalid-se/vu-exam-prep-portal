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

// ==========================================
// SEED LECTURE 7: Prefixes, Stems, and Roots
// ==========================================
let lec7 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 7").get(eng101.id);
if (!lec7) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 7, 'Word Formation: Prefixes, Stems, and Roots')
  `).run(eng101.id);
  lec7 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 7 with ID: ${lec7.id}`);
} else {
  console.log(`ENG101 Lecture 7 found with ID: ${lec7.id}`);
}

db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec7.id);

const mcqs7 = [
  {
    stem: 'Choose the best available meaning / substitute for the root/prefix: Post-',
    options: {
      a: 'against',
      b: 'before',
      c: 'after',
      d: 'around'
    },
    correct: 'c',
    explanation: 'The Latin prefix "post-" means "after" or "behind" in time or position (e.g., postpone, posthumous, post-graduate, script/postscript) (ENG101 Handouts Lesson 7 & 8). Appeared across 4+ midterm papers including Moaaz and Education Gator.',
    urdu_answer: 'لاطینی سابقہ (Prefix) "Post-" کا مطلب "after" (بعد میں) ہوتا ہے، جیسے Post-graduate یا Postpone میں۔'
  },
  {
    stem: 'Choose the best available meaning / substitute for the root/stem: Scrib- / Script-',
    options: {
      a: 'self',
      b: 'life',
      c: 'flow',
      d: 'write'
    },
    correct: 'd',
    explanation: 'The Latin root "scrib-" / "script-" (from scribere) means "to write" (e.g., describe, transcribe, manuscript, inscribe, prescribe) (ENG101 Handouts Lesson 7 & 8). Appeared in 4+ midterm files.',
    urdu_answer: 'لاطینی مادہ (Root) "Scrib-/Script-" کا مطلب "write" (لکھنا) ہوتا ہے، جیسے Manuscript یا Inscribe میں۔'
  },
  {
    stem: 'Choose the best available meaning / substitute for the root/stem: Alter- / Altr-',
    options: {
      a: 'large, great',
      b: 'change, other',
      c: 'outside, beyond',
      d: 'good, well'
    },
    correct: 'b',
    explanation: 'The Latin root "alter-" / "altr-" signifies "other", "another", or "to change" (e.g., alternate, alternative, alteration, altruism) (ENG101 Handouts Lesson 8). Appeared in 5+ midterm past papers.',
    urdu_answer: 'روٹ "Alter-/Altr-" کا مطلب "change" (تبدیل کرنا) یا "other" (دوسرا/متبادل) ہوتا ہے۔'
  },
  {
    stem: 'The word "discover" is formed by adding a ________ to the base word "cover".',
    options: {
      a: 'suffix',
      b: 'prefix',
      c: 'context clue',
      d: 'gerund'
    },
    correct: 'b',
    explanation: 'The word "discover" is created by attaching the negative/reversive prefix "dis-" to the root/base verb "cover" (ENG101 Handouts Lesson 7). Appeared in Team Hadi solved midterm files.',
    urdu_answer: 'لفظ "discover" بنیادی لفظ "cover" کے شروع میں سابقہ (Prefix) "dis-" لگانے سے بنتا ہے۔'
  },
  {
    stem: 'Choose the root / base word of the given derived word: Irreplaceable',
    options: {
      a: 'Replace',
      b: 'Place',
      c: 'Able',
      d: 'Irreplace'
    },
    correct: 'b',
    explanation: 'In morphological analysis, "irreplaceable" consists of two prefixes (ir- [negative] + re- [again]), the base root noun/verb "place", and the adjectival suffix "-able". Thus, the fundamental base word is "Place" (ENG101 Handouts Lesson 7 & 8). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'لفظ "Irreplaceable" کا بنیادی مادہ (Base word) "Place" ہے، جس کے ساتھ دو سابقے (ir-, re-) اور ایک لاحقہ (-able) لگا ہے۔'
  },
  {
    stem: 'The meaning of the classical stem "trad" (as in tradition, extradite) is:',
    options: {
      a: 'chance',
      b: 'hand over, deliver',
      c: 'stand, place',
      d: 'fall'
    },
    correct: 'b',
    explanation: 'The classical stem "trad-" (from Latin tradere) means "to hand over", "deliver", or "transmit" (from which tradition, trade, and extradite are derived) (ENG101 Handouts Lesson 7 & 8). Appeared in All Mids Solved papers.',
    urdu_answer: 'کلاسک مادہ "trad" کا مطلب "hand over, deliver" (حوالے کرنا یا منتقل کرنا) ہوتا ہے، جس سے Tradition کا لفظ نکلا ہے۔'
  }
];

const shorts7 = [
  {
    stem: 'Define the morphological terms: Stem (Base Word), Prefix, Suffix, and Affixes, giving a clear illustrative example for each.',
    correct: `<p><strong>Morphological Components of Word Formation (ENG101 Handouts Lesson 7):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Term</th>
      <th style="padding: 8px;">Definition</th>
      <th style="padding: 8px;">Illustrative Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>1. Stem (Base Word / Root)</strong></td>
      <td style="padding: 8px;">The irreducible core part of a word that holds its principal semantic meaning, common to all derived word forms.</td>
      <td style="padding: 8px;"><em>measure</em>, <em>act</em>, <em>place</em></td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>2. Prefix</strong></td>
      <td style="padding: 8px;">A bound morpheme attached to the <strong>beginning</strong> of a stem to alter its meaning (often creating an antonym or indicating direction/time).</td>
      <td style="padding: 8px;"><em>im-</em> + measure = <strong>immeasurable</strong>; <em>re-</em> + act = <strong>react</strong></td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>3. Suffix</strong></td>
      <td style="padding: 8px;">A bound morpheme attached to the <strong>end</strong> of a stem, typically shifting its part of speech (grammatical category).</td>
      <td style="padding: 8px;">measure + <em>-able</em> = <strong>measurable</strong> ($adj$); act + <em>-or</em> = <strong>actor</strong> ($n$)</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>4. Affixes</strong></td>
      <td style="padding: 8px;">The umbrella linguistic term encompassing all bound morphemes (both prefixes and suffixes) added to base words.</td>
      <td style="padding: 8px;">In <strong>unmanageable</strong>, both <em>un-</em> (prefix) and <em>-able</em> (suffix) are affixes.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Core 3-mark conceptual question from ENG101 Handouts Lesson 7 defining the building blocks of word formation.',
    urdu_answer: 'بنیادی مادہ (Stem) لفظ کا اصل حصہ ہوتا ہے جیسے "measure"؛ سابقہ (Prefix) لفظ کے شروع میں لگ کر معنی بدلتا ہے جیسے "immeasurable"؛ لاحقہ (Suffix) آخر میں لگ کر پارٹ آف اسپیچ بدلتا ہے جیسے "measurable"؛ اور "Affixes" سابقوں اور لاحقوں کا مجموعی نام ہے۔'
  }
];

const longs7 = [
  {
    stem: 'Write the correct negative prefixes in the blanks to form the appropriate antonymous adjectives:\n1. The new house is not _____similar to our old one except that it\'s a bit bigger.\n2. The organization insists that it is _____political and does not identify with any one particular party.\n3. He makes these _____modest statements of his own brilliance.\n4. He was short and overweight and generally fairly _____attractive.\n5. He’s a good teacher, but inclined to be a bit _____patient with slow learners.\n6. He’s been _____honest in his dealings with us.\n7. His sisters thought that his autobiography was _____loyal to the family.',
    correct: `<p><strong>Negative Prefix Adjective Formations (ENG101 Handouts Lesson 7):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">No.</th>
      <th style="padding: 8px;">Target Word</th>
      <th style="padding: 8px;">Correct Negative Prefix</th>
      <th style="padding: 8px;">Formed Adjective</th>
      <th style="padding: 8px;">Grammatical / Morphological Rule</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">1</td>
      <td style="padding: 8px;">similar</td>
      <td style="padding: 8px;"><strong>dis-</strong></td>
      <td style="padding: 8px;"><strong>dissimilar</strong></td>
      <td style="padding: 8px;"><em>dis-</em> denotes reversal or lack of similarity.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">2</td>
      <td style="padding: 8px;">political</td>
      <td style="padding: 8px;"><strong>a-</strong> (or <strong>im-</strong>)</td>
      <td style="padding: 8px;"><strong>apolitical</strong></td>
      <td style="padding: 8px;">Greek prefix <em>a-</em> denotes "without" or completely non-political.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">3</td>
      <td style="padding: 8px;">modest</td>
      <td style="padding: 8px;"><strong>im-</strong></td>
      <td style="padding: 8px;"><strong>immodest</strong></td>
      <td style="padding: 8px;">Assimilation rule: prefix <em>in-</em> becomes <em>im-</em> before bilabials (/m/, /p/).</td>
    </tr>
    <tr>
      <td style="padding: 8px;">4</td>
      <td style="padding: 8px;">attractive</td>
      <td style="padding: 8px;"><strong>un-</strong></td>
      <td style="padding: 8px;"><strong>unattractive</strong></td>
      <td style="padding: 8px;">Standard Germanic negative prefix <em>un-</em> prefixed to adjectives.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">5</td>
      <td style="padding: 8px;">patient</td>
      <td style="padding: 8px;"><strong>im-</strong></td>
      <td style="padding: 8px;"><strong>impatient</strong></td>
      <td style="padding: 8px;">Assimilation: <em>in-</em> shifts to <em>im-</em> before /p/.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">6</td>
      <td style="padding: 8px;">honest</td>
      <td style="padding: 8px;"><strong>dis-</strong></td>
      <td style="padding: 8px;"><strong>dishonest</strong></td>
      <td style="padding: 8px;">Latinate reversive/negative prefix <em>dis-</em>.</td>
    </tr>
    <tr>
      <td style="padding: 8px;">7</td>
      <td style="padding: 8px;">loyal</td>
      <td style="padding: 8px;"><strong>dis-</strong></td>
      <td style="padding: 8px;"><strong>disloyal</strong></td>
      <td style="padding: 8px;">Standard negative prefix <em>dis-</em> attached to loyal.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'High-frequency 5-mark subjective question appearing in 7+ past paper files including Moaaz, Paper 1, and Paper 7.',
    urdu_answer: 'منفی سابقوں کے درست جوابات: 1. dissimilar، 2. apolitical، 3. immodest، 4. unattractive، 5. impatient، 6. dishonest، اور 7. disloyal۔'
  }
];

// ==========================================
// SEED LECTURE 8: Suffixes and Word Endings
// ==========================================
let lec8 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 8").get(eng101.id);
if (!lec8) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 8, 'Word Formation: Suffixes, Spelling Rules, and Word Classes')
  `).run(eng101.id);
  lec8 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 8 with ID: ${lec8.id}`);
} else {
  console.log(`ENG101 Lecture 8 found with ID: ${lec8.id}`);
}

db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec8.id);

const mcqs8 = [
  {
    stem: 'Which suffix can correctly be added to the root word "electric" to form a noun denoting an occupation?',
    options: {
      a: 'ed',
      b: 'ian',
      c: 'sion',
      d: 'y'
    },
    correct: 'b',
    explanation: 'Adding the person-identifying noun suffix "-ian" to "electric" forms "electrician" (a person who works with electrical equipment) (ENG101 Handouts Lesson 7 & 8). Appeared in 6+ midterm files including Moaaz and Education Gator.',
    urdu_answer: 'لفظ "electric" کے ساتھ لاحقہ "-ian" لگانے سے پیشہ ورانہ اسم "electrician" (بجلی کا کام کرنے والا) بنتا ہے۔'
  },
  {
    stem: 'Which one of the following word stems cannot be combined with the noun suffix "-ure"?',
    options: {
      a: 'lect-',
      b: 'fiss-',
      c: 'depart-',
      d: 'polit-'
    },
    correct: 'd',
    explanation: 'Lecture, fissure, and departure are all standard English nouns formed with "-ure". However, "polit-" cannot take "-ure"; it combines with "-ics" (politics) or "-ical" (political) (ENG101 Handouts Lesson 8). Appeared in 6+ past paper sources.',
    urdu_answer: 'سٹیم "polit-" کے ساتھ "-ure" نہیں لگ سکتا کیونکہ اس کے ساتھ "-ics" (Politics) یا "-ical" (Political) لگتا ہے۔ بقیہ تمام الفاظ (Lecture, Fissure, Departure) درست ہیں۔'
  },
  {
    stem: 'Which suffix cannot be grammatically added to the base root word "employ" to make a recognized English word?',
    options: {
      a: 'ment',
      b: 'ing',
      c: 'less',
      d: 'er'
    },
    correct: 'c',
    explanation: 'Employment (-ment), employing (-ing), and employer (-er) or employee (-ee) are valid derived forms. "Employless" is an invalid non-existent English formation (unemployed is used instead) (ENG101 Handouts Lesson 8). Appeared in 6+ midterm papers.',
    urdu_answer: '"employ" کے ساتھ "-less" کا لاحقہ نہیں لگایا جا سکتا (کیونکہ درست لفظ Unemployed ہوتا ہے)، جبکہ employment، employing اور employer سب درست ہیں۔'
  },
  {
    stem: 'Which one of the following stems cannot be combined with the noun suffix "-ion"?',
    options: {
      a: 'Put-',
      b: 'exhaust-',
      c: 'correct-',
      d: 'collect-'
    },
    correct: 'a',
    explanation: 'Exhaustion (exhaust + -ion), correction (correct + -ion), and collection (collect + -ion) are valid nouns. "Put-" does not combine with "-ion" in English morphology (ENG101 Handouts Lesson 8). Appeared in 3+ midterm papers.',
    urdu_answer: '"Put-" کے ساتھ لاحقہ "-ion" نہیں لگ سکتا، جبکہ exhaustion، correction اور collection تمام مستند الفاظ ہیں۔'
  },
  {
    stem: 'Which one of the following stems cannot be used with the adjectival suffix "-ial"?',
    options: {
      a: 'part-',
      b: 'debat-',
      c: 'mart-',
      d: 'commerc-'
    },
    correct: 'b',
    explanation: 'Partial (part + -ial), martial (mart + -ial), and commercial (commerc- + -ial) are standard adjectives. "Debat-" takes "-able" (debatable), not "-ial" (ENG101 Handouts Lesson 8). Appeared in 6+ midterm papers.',
    urdu_answer: '"debat-" کے ساتھ لاحقہ "-ial" نہیں لگ سکتا کیونکہ اس کے ساتھ "-able" لگ کر "debatable" بنتا ہے۔'
  },
  {
    stem: 'When the noun suffix "-ness" is added to the adjective "happy", what is the orthographically correct spelling?',
    options: {
      a: 'hapiness',
      b: 'happyness',
      c: 'happiness',
      d: 'hapyness'
    },
    correct: 'c',
    explanation: 'According to English spelling rules: when a suffix is added to a base word ending in a consonant + "y", the "y" changes to "i" before adding the suffix (happy $\\rightarrow$ happiness) (ENG101 Handouts Lesson 7 & 8). Appeared in 5+ midterm papers.',
    urdu_answer: 'انگریزی ہجے کے اصول کے مطابق جب کسی لفظ کے آخر میں consonant + y ہو تو لاحقہ لگاتے وقت y کو i میں بدل دیا جاتا ہے، اس لیے درست ہجے "happiness" ہے۔'
  }
];

const shorts8 = [
  {
    stem: 'Add the correct suffix (-er, -ed, -ing) to the highlighted root word in each sentence:\n1. You will not be permitted to swim with the sharks! [swim]\n2. The old road has to be repaved. [pave]\n3. Are you planning to visit me in Myrtle Beach? [visit]',
    correct: `<p><strong>Suffix Modification Exercise (ENG101 Handouts Lesson 8):</strong></p>
<ol>
  <li><strong>swimmer</strong> or <strong>swimming</strong> (suffix <strong>-er</strong> / <strong>-ing</strong>, doubling the consonant 'm').</li>
  <li><strong>repaving</strong> (suffix <strong>-ing</strong>, dropping the silent 'e').</li>
  <li><strong>visiting</strong> (suffix <strong>-ing</strong>).</li>
</ol>`,
    explanation: '3-mark inflectional and derivational suffix question from Moaaz Solved Subjectives (Q19) and Past Paper 1.',
    urdu_answer: 'درست لاحقے: 1. swimmer / swimming (-er / -ing)؛ 2. repaving (-ing)؛ 3. visiting (-ing)۔'
  }
];

const longs8 = [
  {
    stem: 'Explain how derivational suffixes function to transform base words into different parts of speech (nouns, adjectives, and verbs). Provide structured examples and outline the key spelling rules governing suffix addition.',
    correct: `<p><strong>Derivational Suffixes and Part-of-Speech Transformation (ENG101 Handouts Lesson 8):</strong></p>

<h4>1. Transforming Stems into Different Parts of Speech:</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Target Category</th>
      <th style="padding: 8px;">Common Suffixes</th>
      <th style="padding: 8px;">Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Noun-Forming Suffixes</strong></td>
      <td style="padding: 8px;"><em>-ment, -tion, -sion, -ness, -ity, -er, -or, -ian</em></td>
      <td style="padding: 8px;">
        govern $\\rightarrow$ govern<strong>ment</strong><br/>
        inform $\\rightarrow$ informa<strong>tion</strong><br/>
        dark $\\rightarrow$ dark<strong>ness</strong><br/>
        electric $\\rightarrow$ electric<strong>ian</strong>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Adjective-Forming Suffixes</strong></td>
      <td style="padding: 8px;"><em>-able, -ible, -ful, -less, -ial, -ic, -ous</em></td>
      <td style="padding: 8px;">
        reason $\\rightarrow$ reason<strong>able</strong><br/>
        care $\\rightarrow$ care<strong>ful</strong> / care<strong>less</strong><br/>
        commerce $\\rightarrow$ commerc<strong>ial</strong><br/>
        danger $\\rightarrow$ danger<strong>ous</strong>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Verb-Forming Suffixes</strong></td>
      <td style="padding: 8px;"><em>-ize, -ify, -en, -ate</em></td>
      <td style="padding: 8px;">
        modern $\\rightarrow$ modern<strong>ize</strong><br/>
        simple $\\rightarrow$ simpl<strong>ify</strong><br/>
        wide $\\rightarrow$ wid<strong>en</strong>
      </td>
    </tr>
  </tbody>
</table>

<h4>2. Key Spelling Rules When Attaching Suffixes:</h4>
<ol>
  <li><strong>Consonant Doubling:</strong> When a one-syllable word ends in a single vowel followed by a single consonant, double the final consonant before a vowel suffix (e.g., <em>swim $\\rightarrow$ swimming / swimmer</em>, <em>run $\\rightarrow$ running</em>).</li>
  <li><strong>Dropping Silent 'e':</strong> When adding a suffix that begins with a vowel, drop the silent final 'e' of the base word (e.g., <em>pave $\\rightarrow$ paving</em>, <em>create $\\rightarrow$ creation</em>).</li>
  <li><strong>Changing 'y' to 'i':</strong> If the base word ends in a consonant + 'y', change 'y' to 'i' before any suffix not beginning with 'i' (e.g., <em>happy $\\rightarrow$ happiness</em>, <em>rely $\\rightarrow$ reliance</em>).</li>
</ol>`,
    explanation: 'Comprehensive 5-mark subjective question on morphological derivation and orthographic suffix rules based on ENG101 Handouts Lesson 8.',
    urdu_answer: 'لاحقے (Suffixes) کسی لفظ کے آخر میں لگ کر اس کا پارٹ آف اسپیچ بدل دیتے ہیں؛ جیسے فعل سے اسم (govern سے government)، اسم سے صفت (danger سے dangerous) وغیرہ۔ لاحقے لگاتے وقت تین بنیادی املا کے اصول ہوتے ہیں: آخری consonant کا ڈبل ہونا (swim سے swimmer)، خاموش \'e\' کا ختم ہونا (pave سے paving)، اور \'y\' کا \'i\' میں بدلنا (happy سے happiness)۔'
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
  // Lecture 7 inserts
  for (const m of mcqs7) {
    insMcq.run(lec7.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts7) {
    insShort.run(lec7.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs7) {
    insLong.run(lec7.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }

  // Lecture 8 inserts
  for (const m of mcqs8) {
    insMcq.run(lec8.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts8) {
    insShort.run(lec8.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs8) {
    insLong.run(lec8.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 7:`);
console.log(`  - MCQs: ${mcqs7.length}`);
console.log(`  - Short Questions: ${shorts7.length}`);
console.log(`  - Long Questions: ${longs7.length}`);
console.log(`  - Total for ENG101 Lecture 7: ${mcqs7.length + shorts7.length + longs7.length}`);

console.log(`\nSuccessfully inserted into ENG101 Lecture 8:`);
console.log(`  - MCQs: ${mcqs8.length}`);
console.log(`  - Short Questions: ${shorts8.length}`);
console.log(`  - Long Questions: ${longs8.length}`);
console.log(`  - Total for ENG101 Lecture 8: ${mcqs8.length + shorts8.length + longs8.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

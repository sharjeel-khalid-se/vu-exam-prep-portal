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

// 2. Create or fetch Lecture 5
let lec5 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 5").get(eng101.id);
if (!lec5) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 5, 'Reading: Contextual References, Pronouns, and Connectives')
  `).run(eng101.id);
  lec5 = { id: res.lastInsertRowid };
  console.log(`Created ENG101 Lecture 5 with ID: ${lec5.id}`);
} else {
  console.log(`ENG101 Lecture 5 found with ID: ${lec5.id}`);
}

// 3. Clear existing questions for Lecture 5
const deleted = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lec5.id);
console.log(`Cleared ${deleted.changes} old questions for Lecture 5.`);

// 4. MCQs Data
const mcqs = [
  {
    stem: 'Identify what the highlighted pronoun refers to in the given sentence:\n"A computer like any other machine is used because **it** does certain jobs better and more efficiently than humans."',
    options: {
      a: 'A computer',
      b: 'Any other machine',
      c: 'Humans',
      d: 'Certain jobs'
    },
    correct: 'a',
    explanation: 'In this sentence, the singular personal pronoun "it" acts as the subject of the subordinate clause and refers back to its clear noun antecedent "A computer" (ENG101 Handouts Lesson 5). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'جملے میں ضمیر (Pronoun) "it" اپنے سابقہ اسم یعنی مرجع "A computer" کی طرف اشارہ کر رہا ہے۔'
  },
  {
    stem: 'Choose the antecedent that the relative pronoun in quotation marks refers to in the sentence:\n"I bought a book from a book fair **\'that\'** cost Rs. 400 to me."',
    options: {
      a: 'a book',
      b: 'a book fair',
      c: 'the author',
      d: 'Rs. 400'
    },
    correct: 'a',
    explanation: 'The relative pronoun "that" refers back to the direct object noun "a book", which is the entity that had the monetary cost of Rs. 400 (ENG101 Handouts Lesson 5). Appeared in Attiq Kundi midterm files.',
    urdu_answer: 'جملے میں لفظ "that" خریدی گئی کتاب ("a book") کی طرف اشارہ کر رہا ہے جس کی قیمت 400 روپے ادا کی گئی تھی۔'
  },
  {
    stem: 'Choose the correct grammatical term: ________ shows the relationship between nouns and pronouns and their verbs, and between nouns and their corresponding pronouns.',
    options: {
      a: 'Agreement',
      b: 'Tense',
      c: 'Punctuation',
      d: 'Context'
    },
    correct: 'a',
    explanation: 'According to ENG101 Handouts Lesson 5 & 27: "Agreement shows the relationship between nouns and pronouns and their verbs and between nouns and their corresponding pronouns." This encompasses subject-verb agreement and pronoun-antecedent agreement in number, person, and gender.',
    urdu_answer: 'گرائمر میں "Agreement" (مطابقت) اسم اور ضمیر کا ان کے فعل کے ساتھ اور اسم کا ان کے متعلقہ ضمائر کے ساتھ تعداد، شخص اور جنس کے لحاظ سے ربط ظاہر کرتی ہے۔'
  },
  {
    stem: 'Complete the sentence by choosing the best pair of connectives:\n"_____ the men _____ their supervisor is to be blamed for the mishap."',
    options: {
      a: 'Neither…and',
      b: 'Either…and',
      c: 'Neither…nor',
      d: 'Either…nor'
    },
    correct: 'c',
    explanation: 'The correct correlative conjunction pair expressing negative alternative correlation is "Neither... nor". Note that the singular verb "is" agrees with the closer subject "their supervisor" (ENG101 Handouts Lesson 5). Appeared across 6+ midterm past paper compilations including Moaaz and Education Gator.',
    urdu_answer: 'انگریزی میں نفی کے دوہرے متبادل کے لیے جوڑا "Neither…nor" استعمال ہوتا ہے، اور فعل قریبی اسم (supervisor) کے مطابق واحد (is) آیا ہے۔'
  },
  {
    stem: 'Complete the sentence by choosing the best connective to signal contrast:\n"James usually has his lunch at this restaurant _____ sometimes he eats elsewhere."',
    options: {
      a: 'if',
      b: 'either',
      c: 'neither',
      d: 'but'
    },
    correct: 'd',
    explanation: 'The coordinating conjunction "but" is used to show contrast between James\' regular habit (eating at this restaurant) and the occasional exception (eating elsewhere) (ENG101 Handouts Lesson 5). Appeared in 5+ past papers.',
    urdu_answer: 'عام معمول اور غیر معمولی استثناء کے درمیان تضاد (Contrast) ظاہر کرنے کے لیے ربطی لفظ "but" (لیکن) استعمال ہوتا ہے۔'
  },
  {
    stem: 'Complete the sentence by choosing the correct pair of correlative connectives:\n"Each class is to present _____ a drama _____ a song for the concert."',
    options: {
      a: 'both…nor',
      b: 'either…or',
      c: 'either…and',
      d: 'both…or'
    },
    correct: 'b',
    explanation: 'The correlative pair "either... or" denotes a choice between two alternatives: presenting a drama or presenting a song (ENG101 Handouts Lesson 5). Appeared in Moaaz and generic midterm papers.',
    urdu_answer: 'دو متبادل چیزوں (ڈراما یا نغمہ) میں سے کسی ایک کے انتخاب کے لیے "either…or" کا جوڑا استعمال ہوتا ہے۔'
  },
  {
    stem: 'Fill in the blank with the appropriate connector showing comparison:\n"__________ other mollusks, the oyster reproduces by eggs."',
    options: {
      a: 'Regarding',
      b: 'As to',
      c: 'Like',
      d: 'With'
    },
    correct: 'c',
    explanation: '"Like" functions as a comparative preposition/connective signifying similarity between the reproductive behavior of the oyster and that of other mollusks (ENG101 Handouts Lesson 5).',
    urdu_answer: 'دیگر مولسکس کے ساتھ مماثلت ظاہر کرنے کے لیے تقابلی لفظ "Like" (کی طرح) کا انتخاب درست ہے۔'
  },
  {
    stem: 'Complete the sentence by choosing the correct correlative option:\n"You must have been _____ daydreaming _____ sleeping in class again."',
    options: {
      a: 'Neither…or',
      b: 'Both…or',
      c: 'Either…or',
      d: 'Either…and'
    },
    correct: 'c',
    explanation: 'The correlative conjunction pair "Either... or" accurately links two alternative possibilities of inattention (daydreaming or sleeping) (ENG101 Handouts Lesson 5).',
    urdu_answer: 'کلاس میں توجہ نہ دینے کی دو ممکنہ صورتوں کے درمیان ربط کے لیے "Either…or" کا استعمال درست ہے۔'
  },
  {
    stem: 'Fill in the blank with an appropriate transitional marker of contrast:\n"People use 43 muscles when they frown; _________ when they smile, they use only 17."',
    options: {
      a: 'However',
      b: 'Therefore',
      c: 'Consequently',
      d: 'In addition'
    },
    correct: 'a',
    explanation: 'The conjunctive adverb "However" is used to highlight the direct contrast between the high number of muscles used in frowning (43) and the lower number used in smiling (17) (ENG101 Handouts Lesson 5). Appeared in Oxford Handout Shop midterm files.',
    urdu_answer: 'تیوری چڑھانے کے 43 پٹھوں اور مسکرانے کے صرف 17 پٹھوں کے استعمال کے درمیان تضاد دکھانے کے لیے "However" (تاہم) درست جواب ہے۔'
  },
  {
    stem: 'Complete the sentence by choosing the correct transitional marker:\n"Hina seems to be quite clever; __________, she often gets low marks."',
    options: {
      a: 'nevertheless',
      b: 'therefore',
      c: 'furthermore',
      d: 'consequently'
    },
    correct: 'a',
    explanation: '"Nevertheless" is an adversative connective indicating that the outcome (getting low marks) is surprising or contrary to expectation given her cleverness (ENG101 Handouts Lesson 5). Appeared in Attiq Kundi midterm papers.',
    urdu_answer: 'ذہانت کے باوجود غیر متوقع طور پر کم نمبر آنے کے تضاد کو بیان کرنے کے لیے "nevertheless" (اس کے باوجود) کا لفظ استعمال ہوتا ہے۔'
  }
];

// 5. Short Questions
const shorts = [
  {
    stem: 'What are transitional markers (connectives) in English reading and writing, and what are the main logical relationships they indicate within a text?',
    correct: `<p><strong>Transitional Markers (Connectives) in Reading Comprehension (ENG101 Handouts Lesson 5):</strong></p>
<p><strong>Transitional markers</strong> (also called connectives, linking words, or cohesive devices) are words and phrases that bridge sentences and paragraphs, guiding the reader by clarifying the logical relationship between consecutive ideas.</p>

<p>The <strong>seven primary logical relationships</strong> signaled by connectives are:</p>
<ol>
  <li><strong>Result / Consequence:</strong> Signals the outcome of a situation (e.g., <em>thus, therefore, consequently, as a result, hence</em>).</li>
  <li><strong>Contrast:</strong> Signals opposition, unexpected outcomes, or counter-arguments (e.g., <em>but, however, nevertheless, on the other hand, yet</em>).</li>
  <li><strong>Comparison:</strong> Points out similarities between two or more subjects (e.g., <em>like, similarly, likewise, in the same manner</em>).</li>
  <li><strong>Illustration / Example:</strong> Introduces specific instances that clarify a broader point (e.g., <em>for example, for instance, specifically, such as</em>).</li>
  <li><strong>Cause and Effect:</strong> Indicates reasons or origins of phenomena (e.g., <em>because, since, as, due to</em>).</li>
  <li><strong>Time Sequence / Order:</strong> Clarifies chronological order or steps in a process (e.g., <em>first, next, then, subsequently, finally</em>).</li>
  <li><strong>Addition:</strong> Continues a train of thought with supplementary points (e.g., <em>and, furthermore, in addition, moreover, besides</em>).</li>
</ol>`,
    explanation: 'Core 3-to-5 mark subjective question from ENG101 Handouts Lesson 5 and Moaaz Solved Subjectives.',
    urdu_answer: 'ٹرانزیشنل مارکرز (Connectives) وہ الفاظ ہوتے ہیں جو تحریر میں جملوں اور پیراگرافز کے درمیان منطقی تعلق قائم کرتے ہیں۔ ان کے ذریعے 7 اہم تعلقات ظاہر کیے جاتے ہیں: نتیجہ (Result)، تضاد (Contrast)، موازنہ (Comparison)، مثال (Illustration)، سبب و اثر (Cause & Effect)، زمانی ترتیب (Time Sequence)، اور اضافہ (Addition)۔'
  },
  {
    stem: 'Explain what is meant by "Pronoun Reference" and discuss why unambiguous reference is essential for effective reading comprehension and clear writing.',
    correct: `<p><strong>Pronoun Reference and Antecedent Clarity (ENG101 Handouts Lesson 5 &amp; 27):</strong></p>

<h4>1. Definition of Pronoun Reference:</h4>
<p>A pronoun is a substitute word that stands in place of a noun. <strong>Pronoun Reference</strong> refers to the clear grammatical relationship between a pronoun and its antecedent—the specific noun or noun phrase to which the pronoun refers back.</p>

<h4>2. Principles of Clear Reference:</h4>
<ul>
  <li><strong>Grammatical Agreement:</strong> The pronoun must match its antecedent in <em>number</em> (singular vs. plural), <em>person</em> (first, second, third person), and <em>gender</em> (masculine, feminine, neuter).</li>
  <li><strong>Proximity and Unambiguity:</strong> The antecedent should be positioned closely enough to avoid confusion with neighboring nouns.</li>
</ul>

<h4>3. Dangers of Faulty Pronoun Reference:</h4>
<ul>
  <li><strong>Ambiguous Reference:</strong> Occurs when a pronoun could logically refer to more than one preceding noun (e.g., <em>"When the car hit the tree, it was damaged"</em>—did the car or tree sustain damage?).</li>
  <li><strong>Vague / Unexpressed Reference:</strong> Occurs when words like <em>this, that, which</em>, or <em>it</em> are used without a concrete noun antecedent.</li>
  <li><strong>Impact on Comprehension:</strong> Faulty pronoun reference forces the reader to stop, reread, and speculate, disrupting reading fluency and distorting meaning.</li>
</ul>`,
    explanation: '3-mark fundamental question on syntactic clarity and pronoun reference from ENG101 Lesson 5 and 27.',
    urdu_answer: 'پروناؤن ریفرنس (Pronoun Reference) سے مراد ضمیر کا اپنے سابقہ اسم (Antecedent) کے ساتھ واضح اور درست تعلق ہے۔ موثر مواصلات کے لیے ضروری ہے کہ ضمیر تعداد، جنس اور پرسن کے لحاظ سے اپنے مرجع کے مطابق ہو اور پڑھنے والے کے ذہن میں یہ ابہام پیدا نہ ہو کہ ضمیر کس اسم کی طرف اشارہ کر رہا ہے۔'
  }
];

// 6. Long Questions
const longs = [
  {
    stem: 'Identify the contextual referents for all boldfaced pronouns and connectives in the following excerpt, explaining each link:\n\n"Some people, of course, still believe that Shakespeare could not have written the plays attributed to **him** (1), but **they** (2) have difficulty in explaining the fact that many contemporaries of Shakespeare, **who** (3) knew and worked with him, considered **him** (4), first, as the actual author, and second, a very fine author indeed. Ben Jonson, for example, never doubted the authenticity of the plays. William Green also referred to Shakespeare as a very fine playwright. **These** (5) are only two of the many contemporary references that leave little doubt that Shakespeare wrote the plays of William Shakespeare."',
    correct: `<p><strong>Contextual Reference Analysis (ENG101 Handouts Lesson 5):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Pronoun / Referent</th>
      <th style="padding: 8px;">Contextual Antecedent</th>
      <th style="padding: 8px;">Grammatical Function &amp; Semantic Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>1. "him"</strong></td>
      <td style="padding: 8px;"><strong>Shakespeare</strong> (William Shakespeare)</td>
      <td style="padding: 8px;">Third-person singular objective pronoun referring back to the playwright to whom the plays were attributed.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>2. "they"</strong></td>
      <td style="padding: 8px;"><strong>Some people</strong> (skeptics / doubters)</td>
      <td style="padding: 8px;">Third-person plural subjective pronoun referring to the individuals who doubt Shakespeare\'s authorship.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>3. "who"</strong></td>
      <td style="padding: 8px;"><strong>contemporaries of Shakespeare</strong></td>
      <td style="padding: 8px;">Relative pronoun referring to the fellow writers, actors, and colleagues living in the same historical period as Shakespeare.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>4. "him"</strong></td>
      <td style="padding: 8px;"><strong>Shakespeare</strong></td>
      <td style="padding: 8px;">Objective pronoun reiterating William Shakespeare as the recognized actual and fine author.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>5. "These"</strong></td>
      <td style="padding: 8px;"><strong>Ben Jonson and William Green</strong> (the specific contemporary testimonies/references)</td>
      <td style="padding: 8px;">Demonstrative pronoun functioning as subject, referring back to the two cited contemporary literary figures and their historical statements.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'High-frequency 5-mark subjective exercise appearing in ENG101 Handouts Lesson 5 and solved past papers (eng101_mid_term_6).',
    urdu_answer: 'متعلقہ ضمائر کے مراجع درج ذیل ہیں: 1. "him" سے مراد شیکسپیئر (Shakespeare) ہے؛ 2. "they" سے مراد شیکسپیئر کی تصنیف پر شک کرنے والے لوگ (Some people) ہیں؛ 3. "who" سے مراد شیکسپیئر کے ہم عصر ساتھی (contemporaries of Shakespeare) ہیں؛ 4. "him" سے مراد دوبارہ شیکسپیئر ہے؛ اور 5. "These" سے مراد دونوں ہم عصر مصنفین بین جانسن اور ولیم گرین کے تاریخی حوالے ہیں۔'
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
    insMcq.run(lec5.id, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lec5.id, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lec5.id, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into ENG101 Lecture 5:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for ENG101 Lecture 5: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

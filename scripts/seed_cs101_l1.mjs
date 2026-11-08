import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate or create CS101 subject
let cs101 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs101'").get();
if (!cs101) {
  const res = db.prepare(`
    INSERT INTO subjects (name, slug, code, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'Introduction to Computing',
    'cs101',
    'CS101',
    'Foundations of computing, computer history, hardware, software, algorithms, data representation, and internet technologies — Virtual University'
  );
  cs101 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Subject with ID: ${cs101.id}`);
} else {
  console.log(`CS101 Subject found with ID: ${cs101.id}`);
}

// 2. Create or fetch Lecture 1
let lec1 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 1").get(cs101.id);
if (!lec1) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 1, 'Introduction to Computing: History, Babbage, Ada Lovelace, and Human vs. Computer')
  `).run(cs101.id);
  lec1 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 1 with ID: ${lec1.id}`);
} else {
  console.log(`CS101 Lecture 1 found with ID: ${lec1.id}`);
}

const lId = lec1.id;

// 3. Clear existing questions for Lecture 1 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 1.`);

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
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// 10 MCQs
const mcqs = [
  {
    stem: 'Ada, Countess of Lovelace, is universally recognized for having developed the first:',
    options: {
      a: 'Electronic Computer',
      b: 'World Wide Web site',
      c: 'Computer Program',
      d: 'Analytical Engine'
    },
    correct: 'c',
    explanation: 'Ada, Countess of Lovelace, is considered the world\'s first computer programmer because she wrote the first algorithm intended to be processed by Charles Babbage\'s Analytical Engine in 1843 (CS101 Handouts Lecture 1). Appeared in 17+ midterm past papers.',
    urdu_answer: 'ایڈا لولیس کو تاریخ کی پہلی کمپیوٹر پروگرامر تسلیم کیا جاتا ہے کیونکہ انہوں نے اینالیٹیکل انجن کے لیے دنیا کا پہلا کمپیوٹر پروگرام لکھا تھا۔'
  },
  {
    stem: 'Charles Babbage, the pioneer of digital programmable computing, was professionally an English:',
    options: {
      a: 'Mathematician',
      b: 'Computer Scientist',
      c: 'Physician',
      d: 'Business Analyst'
    },
    correct: 'a',
    explanation: 'Charles Babbage was an English mathematician, philosopher, and mechanical engineer who originated the concept of a digital programmable computer (CS101 Handouts Lecture 1). Appeared in 12+ midterm past papers.',
    urdu_answer: 'چارلس بیبیج ایک برطانوی ریاضی دان (Mathematician) اور انجینئر تھے جنہوں نے جدید کمپیوٹر کا تصور پیش کیا۔'
  },
  {
    stem: 'The world\'s first computer program was written by:',
    options: {
      a: 'Charles Babbage',
      b: 'Ada Lovelace',
      c: 'Daniel Bernoulli',
      d: 'Isaac Newton'
    },
    correct: 'b',
    explanation: 'Ada Lovelace translated an Italian paper on Babbage\'s machine and appended extensive notes including a step-by-step algorithm to calculate Bernoulli numbers, recognized as the world\'s first computer program (CS101 Handouts Lecture 1). Appeared in 10+ papers.',
    urdu_answer: 'دنیا کا سب سے پہلا کمپیوٹر پروگرام ایڈا لولیس (Ada Lovelace) نے لکھا تھا۔'
  },
  {
    stem: 'Ada Lovelace developed the world\'s first computer program specifically for which calculating device?',
    options: {
      a: 'Analytical Engine',
      b: 'Difference Engine',
      c: 'Harvard Mark 1',
      d: 'Pascaline Mechanical Calculator'
    },
    correct: 'a',
    explanation: 'Ada Lovelace designed her program specifically for Charles Babbage\'s Analytical Engine, which was the first general-purpose programmable computing design (CS101 Handouts Lecture 1). Appeared in 8+ midterm papers.',
    urdu_answer: 'ایڈا لولیس نے اپنا کمپیوٹر پروگرام چارلس بیبیج کے اینالیٹیکل انجن (Analytical Engine) کے لیے لکھا تھا۔'
  },
  {
    stem: '"Every minute dies a man, And one and a sixteenth is born" — this humorous critique of Lord Tennyson\'s poem was remarked by:',
    options: {
      a: 'Alfred, Lord Tennyson',
      b: 'Charles Babbage during video lecture context',
      c: 'Ada, Countess of Lovelace',
      d: 'John von Neumann'
    },
    correct: 'b',
    explanation: 'Charles Babbage humorously critiqued Lord Tennyson\'s poem line "Every minute dies a man, Every minute one is born" by pointing out that if this were true, world population would remain stagnant; he calculated the exact net population growth rate as 1 and 1/16 born per minute (CS101 Handouts Lecture 1). Appeared in multiple midterm files.',
    urdu_answer: 'یہ جملہ چارلس بیبیج نے شاعر لارڈ ٹینیسن کے شعر کی درستی کرتے ہوئے کہا تھا کہ آبادی کے اضافے کے لیے ہر منٹ ایک مرتا ہے اور ایک اور ایک بٹا سولہ پیدا ہوتا ہے۔'
  },
  {
    stem: 'In comparison to modern computer systems, human beings are inherently much better at:',
    options: {
      a: 'Computation efficiency and numerical speed',
      b: 'Mathematical accuracy and precision',
      c: 'Pattern recognition and intuitive reasoning',
      d: 'High-volume data storage and retrieval'
    },
    correct: 'c',
    explanation: 'Humans vastly outperform computers in recognizing patterns, understanding context, exercising common sense, and generating creative ideas, whereas computers excel at speed, storage, and tireless calculation (CS101 Handouts Lecture 1). Appeared in 6+ papers.',
    urdu_answer: 'انسان پیٹرن کی شناخت (Pattern Recognition) اور وجدانی سمجھ بوجھ میں کمپیوٹر سے کہیں زیادہ برتر ہوتے ہیں۔'
  },
  {
    stem: 'Which of the following pair represents the primary weaknesses of computers compared to human intelligence?',
    options: {
      a: 'Pattern recognition and Storage capacity',
      b: 'Execution speed and Innovative ideas',
      c: 'Pattern recognition and Innovative ideas',
      d: 'Arithmetic speed and Data storage'
    },
    correct: 'c',
    explanation: 'Computers cannot generate original or innovative ideas on their own, and they struggle with subtle pattern recognition (such as recognizing faces, voices, or complex visual scenes) compared to the human brain (CS101 Handouts Lecture 1). Appeared in 4+ papers.',
    urdu_answer: 'کمپیوٹر کی سب سے بڑی کمزوریاں پیٹرن کو پہچاننا اور ازخود نئے و تخلیقی خیالات (Innovative ideas) پیدا کرنا ہیں۔'
  },
  {
    stem: 'What are the key strengths and advantages of computers over humans?',
    options: {
      a: 'Tremendous processing speed',
      b: 'Massive and reliable data storage',
      c: 'Ability to execute repetitive tasks without getting bored or tired',
      d: 'All of the given choices'
    },
    correct: 'd',
    explanation: 'Computers excel at high execution speed, vast digital storage capacity, and the flawless execution of repetitive tasks without fatigue or boredom (CS101 Handouts Lecture 1). Appeared in 4+ midterm papers.',
    urdu_answer: 'کمپیوٹر کی اہم خصوصیات میں تیز رفتار، وسیع ڈیٹا اسٹوریج، اور بغیر تھکے یا بور ہوئے کام کرتے رہنا شامل ہیں، یعنی یہ تمام اوصاف درست ہیں۔'
  },
  {
    stem: 'How many chess moves could IBM\'s Deep Blue supercomputer analyze in three minutes when defeating world champion Garry Kasparov?',
    options: {
      a: '300 billion moves',
      b: '400 billion moves',
      c: '200 billion moves',
      d: '700 billion moves'
    },
    correct: 'a',
    explanation: 'Deep Blue was capable of evaluating approximately 200 million chess board positions per second, totaling roughly 300 billion moves in three minutes (CS101 Handouts Lecture 1). Appeared in past midterm papers.',
    urdu_answer: 'آئی بی ایم کا ڈیپ بلیو (Deep Blue) شطرنج کا سپر کمپیوٹر تین منٹ میں تقریباً 300 ارب چالوں کا تجزیہ کر سکتا تھا۔'
  },
  {
    stem: 'Charles Babbage designed and built his early mechanical calculating engines primarily using the technology of:',
    options: {
      a: 'Abacus beads',
      b: 'Technology of Gears, levers, and shafts',
      c: 'Magnetic core memory',
      d: 'Vacuum tubes'
    },
    correct: 'b',
    explanation: 'Babbage\'s Difference Engine and Analytical Engine were purely mechanical machines engineered using brass gears, toothed wheels, shafts, and clockwork mechanics (CS101 Handouts Lecture 1). Appeared in multiple midterm papers.',
    urdu_answer: 'چارلس بیبیج کے مکینیکل انجن دندانوں والے گیئرز اور شافٹ کی ٹیکنالوجی (Technology of Gear) پر مشتمل تھے۔'
  }
];

// 2 Short Questions
const shortQuestions = [
  {
    stem: 'What is the name of the first programmable, mechanical, and digital machine in the history of computing? Briefly state its significance.',
    correct: `<p><strong>The First Programmable, Mechanical, Digital Machine:</strong></p>
<p>The <strong>Analytical Engine</strong>, designed by the English mathematician <strong>Charles Babbage</strong> in 1837, is recognized as the world's first conceptual general-purpose programmable, mechanical, and digital computer.</p>

<p><strong>Key Significance & Architectural Components:</strong></p>
<ul>
  <li><strong>The Mill:</strong> The calculating unit, equivalent to the modern central processing unit's Arithmetic Logic Unit (ALU).</li>
  <li><strong>The Store:</strong> The memory unit where numbers and intermediate results were kept (capable of holding 1,000 numbers of 50 digits each).</li>
  <li><strong>Punched Card Input:</strong> Adopted from the Jacquard loom to supply operational instructions and numerical data.</li>
  <li><strong>Control Flow:</strong> Capable of conditional branching and looping, marking it as a true Turing-complete computing concept over a century before electronic computers.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 1; CS101 Mid Term Past Paper Mega File, Page 13.',
    urdu_answer: 'پہلی قابل پروگرام، میکانیکل اور ڈیجیٹل مشین چارلس بیبیج کا "اینالیٹیکل انجن" (Analytical Engine) تھا۔ اس میں جدید کمپیوٹر کی طرح پروسیسر (The Mill)، میموری (The Store)، اور پنچ کارڈز کے ذریعے ان پٹ دینے کا نظام موجود تھا۔'
  },
  {
    stem: 'What are the major weaknesses of a computer system compared to the capabilities of human beings?',
    correct: `<p><strong>Major Weaknesses of Computer Systems Compared to Humans:</strong></p>
<p>While computers vastly outperform humans in calculation speed, storage capacity, and tireless execution of repetitive tasks, they exhibit fundamental limitations when compared to human intellect:</p>

<ol>
  <li><strong>Inability to Generate Innovative Ideas:</strong>
    <p>Computers cannot think creatively, conceptualize novel thoughts, or originate new hypotheses; they operate strictly within the boundaries set by human software instructions.</p>
  </li>
  <li><strong>Inferior Pattern Recognition:</strong>
    <p>The human brain excels at recognizing complex patterns effortlessly — such as recognizing a familiar face in a crowd, interpreting subtle vocal tones, or discerning distorted handwriting — tasks that require immense computing power and complex AI models for computers.</p>
  </li>
  <li><strong>Lack of Common Sense and Contextual Judgment:</strong>
    <p>Computers lack general reasoning ability, intuitive understanding, and moral judgment. If provided erroneous data or flawed algorithmic logic ("Garbage In, Garbage Out"), they execute the instructions without noticing contextual absurdities.</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 1; cs101 solved mcqs mega files, Page 1.',
    urdu_answer: 'انسانوں کے مقابلے میں کمپیوٹر کی اہم کمزوریاں یہ ہیں: 1. تخلیقی صلاحیت کا فقدان (کمپیوٹر ازخود نئے اور جدید خیالات پیدا نہیں کر سکتا)، 2. پیٹرن کی شناخت میں کمزوری (جیسے چہروں، آوازوں اور سیاق و سباق کو پہچاننا)، 3. عقل عامہ اور وجدان کا نہ ہونا (کمپیوٹر صرف دی گئی ہدایات پر عمل کرتا ہے اور غلط ڈیٹا پر بھی بغیر سمجھے نتیجہ نکال دیتا ہے)۔'
  }
];

// 1 Long Question
const longQuestions = [
  {
    stem: 'Discuss the early history of computing devices in detail, highlighting the pivotal contributions of Charles Babbage (Difference Engine and Analytical Engine) and Ada Lovelace (the world\'s first computer programmer). Explain why their work serves as the foundation for modern computer science.',
    correct: `<p><strong>1. Introduction to Early Mechanical Computing:</strong></p>
<p>Before electronic microprocessors, computational devices evolved from manual tools (like the Abacus and Napier's Bones) to mechanical gear-driven calculators (such as Blaise Pascal's Pascaline and Gottfried Leibniz's Step Reckoner). However, these early devices could only perform single arithmetic operations under direct human intervention.</p>

<p><strong>2. Charles Babbage's Pioneering Contributions:</strong></p>
<ul>
  <li><strong>The Difference Engine (1822):</strong>
    <p>Designed to automatically calculate and tabulate polynomial mathematical and astronomical tables using the method of finite differences. It eliminated human transcription errors that were rampant in navigational nautical almanacs.</p>
  </li>
  <li><strong>The Analytical Engine (1837):</strong>
    <p>Recognizing the limitations of single-purpose calculation, Babbage conceived the <em>Analytical Engine</em> — the blueprint of the modern digital computer. Its architecture anticipated modern computer systems:</p>
    <ul>
      <li><strong>The Mill:</strong> Handled arithmetic calculations (equivalent to the modern CPU/ALU).</li>
      <li><strong>The Store:</strong> Stored numbers and variables (equivalent to RAM/Memory).</li>
      <li><strong>Punched Card Control:</strong> Used Jacquard punched cards for program instructions, data input, and sequencing.</li>
      <li><strong>Conditional Logic:</strong> Supported conditional branching and looping structures.</li>
    </ul>
  </li>
</ul>

<p><strong>3. Ada Lovelace — The First Computer Programmer:</strong></p>
<ul>
  <li>Augusta Ada King, Countess of Lovelace, worked closely with Charles Babbage. In 1843, she translated Luigi Menabrea's French memoir on the Analytical Engine, appending her own extensive "Notes" that were three times the length of the original paper.</li>
  <li><strong>The First Computer Algorithm:</strong> In "Note G", Lovelace described a detailed, step-by-step procedure for calculating Bernoulli numbers using the Analytical Engine. This is universally recognized as the <em>world's first computer program</em>.</li>
  <li><strong>Visionary Foresight:</strong> Lovelace foresaw that computers could manipulate symbols beyond mere numbers, predicting that machines could create music, graphics, and scientific models if appropriate rules were expressed algorithmically.</li>
</ul>

<p><strong>4. Legacy and Modern Significance:</strong></p>
<p>Although mechanical engineering limitations of the Victorian era prevented the full physical construction of the Analytical Engine in Babbage's lifetime, their conceptual separation of hardware (the mechanical engine) and software (the sequence of punched cards) established the foundational paradigm of digital computing over a century before the advent of ENIAC and the von Neumann architecture.</p>`,
    explanation: 'From CS101 Handouts Lecture 1; CS101 Mid Term Past Paper Mega File, Pages 12–13. Comprehensive 5-mark subjective question on computing history.',
    urdu_answer: 'کمپیوٹر کی ابتدائی تاریخ میں چارلس بیبیج کا کردار سب سے اہم ہے جنہوں نے ڈفرنس انجن اور بعد ازاں اینالیٹیکل انجن ڈیزائن کیا جس میں جدید سی پی یو اور میموری کا تصور پیش کیا گیا۔ ایڈا لولیس نے اینالیٹیکل انجن کے لیے برنولی نمبرز کا حساب کرنے کا الگورتھم لکھا، جس کی بنا پر وہ دنیا کی پہلی کمپیوٹر پروگرامر کہلاتی ہیں۔ ان کا یہ کام جدید کمپیوٹر سائنس کی بنیاد بنا۔'
  }
];

// 4. Insert questions
console.log('Inserting MCQs...');
for (const q of mcqs) {
  insMcq.run(lId, q.stem, JSON.stringify(q.options), q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Short Questions...');
for (const q of shortQuestions) {
  insShort.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

console.log('Inserting Long Questions...');
for (const q of longQuestions) {
  insLong.run(lId, q.stem, q.correct, q.explanation, q.urdu_answer);
}

// 5. Verify counts
const countRow = db.prepare('SELECT count(*) as count FROM questions WHERE lecture_id = ?').get(lId);
const totalRow = db.prepare('SELECT count(*) as count FROM questions').get();
const lecCount = db.prepare('SELECT count(*) as count FROM lectures').get();
const subCount = db.prepare('SELECT count(*) as count FROM subjects').get();

console.log('--- SEEDING COMPLETE ---');
console.log(`CS101 Lecture 1 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

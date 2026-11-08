import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS101
const cs101 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs101'").get();
if (!cs101) {
  console.error('CS101 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 6
let lec6 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 6").get(cs101.id);
if (!lec6) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 6, 'Computer Software, Operating Systems, Language Translators, and Algorithms')
  `).run(cs101.id);
  lec6 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 6 with ID: ${lec6.id}`);
} else {
  console.log(`CS101 Lecture 6 found with ID: ${lec6.id}`);
}

const lId = lec6.id;

// 3. Clear existing questions for Lecture 6 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 6.`);

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
    stem: 'Which category of system software translates human-readable source code written in a high-level language into machine-executable binary code?',
    options: {
      a: 'Device Utilities',
      b: 'Hardware Device Drivers',
      c: 'Language Translator (Compiler / Interpreter)',
      d: 'Firmware BIOS'
    },
    correct: 'c',
    explanation: 'A Language Translator (such as a compiler or assembler) is system software that converts source code written in high-level or assembly language into low-level machine code that the CPU can execute (CS101 Handouts Lecture 6). Appeared in 16+ past papers.',
    urdu_answer: 'لینگویج ٹرانسلیٹر (Language Translator) وہ سسٹم سافٹ ویئر ہے جو ہائی لیول لینگویج میں لکھے گئے سورس کوڈ کو مشین لینگویج میں تبدیل کرتا ہے۔'
  },
  {
    stem: 'A language translator program that analyzes and executes instructions line by line written in a high-level programming language is called a/an:',
    options: {
      a: 'Interpreter',
      b: 'Compiler',
      c: 'Predictor',
      d: 'Linker'
    },
    correct: 'a',
    explanation: 'An Interpreter translates and runs the source program line-by-line in real time, stopping immediately when a syntax error is encountered (CS101 Handouts Lecture 6). Appeared in 14+ midterm papers.',
    urdu_answer: 'انٹرپریٹر (Interpreter) وہ پروگرام ہے جو ہائی لیول کوڈ کی ہر لائن کا ایک ایک کر کے ترجمہ کرتا ہے اور ساتھ ہی اسے چلاتا ہے۔'
  },
  {
    stem: 'Which type of language translator processes the entire high-level source code file in one single batch ("in one go") to generate an independent machine-language executable object file?',
    options: {
      a: 'Interpreter',
      b: 'Compiler',
      c: 'Operating system scheduler',
      d: 'Command-line Shell'
    },
    correct: 'b',
    explanation: 'A Compiler translates the entire program at once into machine code (object code), reporting all syntax errors after the compilation pass completes, producing a fast standalone executable (.exe) (CS101 Handouts Lecture 6). Appeared in 10+ papers.',
    urdu_answer: 'کمپائلر (Compiler) پورے پروگرام کا ایک ہی وقت میں مکمل ترجمہ کر کے ایگزیکیوٹیبل مشین کوڈ تیار کرتا ہے۔'
  },
  {
    stem: 'The only native programming language that is directly understood and executed by computer microprocessors without any prior translation is:',
    options: {
      a: 'High-level programming language (e.g., C++, Java)',
      b: 'Machine language (binary instructions)',
      c: 'Assembly language',
      d: 'Structured Query Language (SQL)'
    },
    correct: 'b',
    explanation: 'Machine language consists of raw binary 1s and 0s directly wired into the digital logic gates of the CPU; it requires no translator (CS101 Handouts Lecture 6). Appeared in 12+ midterm papers.',
    urdu_answer: 'مشین لینگویج (Machine language) واحد زبان ہے جسے کمپیوٹر ہارڈ ویئر اور پروسیسر بغیر کسی ترجمے کے براہِ راست سمجھتا ہے۔'
  },
  {
    stem: 'Machine language instructions are represented in 0s and 1s and are therefore fundamentally synonymous with:',
    options: {
      a: 'Assembly Language',
      b: 'Binary Language',
      c: 'High Level Language',
      d: 'HTML Markup Language'
    },
    correct: 'b',
    explanation: 'Because machine code consists solely of binary digits (bits: 0 and 1) representing opcodes and memory addresses, it is also called binary language (CS101 Handouts Lecture 6). Appeared in 10+ past papers.',
    urdu_answer: 'مشین لینگویج 0 اور 1 کے بٹس پر مشتمل ہوتی ہے، اس لیے اسے بائنری لینگویج (Binary Language) بھی کہا جاتا ہے۔'
  },
  {
    stem: 'When a user interacts with a computer to accomplish a computational task, instructions flow from user applications to hardware through:',
    options: {
      a: 'Hardware directly to Software',
      b: 'Monitor directly to Processor',
      c: 'Application Software through System Software',
      d: 'Graphics adapters to Network cards'
    },
    correct: 'c',
    explanation: 'Users interact with Application Software (like MS Word or a browser), which interacts with System Software (the Operating System), which in turn controls the physical Hardware components (CS101 Handouts Lecture 6). Appeared in 12+ papers.',
    urdu_answer: 'صارف اپنے کام کی ہدایات ایپلی کیشن سافٹ ویئر (Application Software) کے ذریعے دیتا ہے، جو سسٹم سافٹ ویئر (OS) کی وساطت سے ہارڈ ویئر تک پہنچتی ہیں۔'
  },
  {
    stem: 'Which software layer manages and coordinates the physical hardware and software resources (memory, CPU scheduling, storage drives) of a computer, typically operating invisibly to the user?',
    options: {
      a: 'File Explorer',
      b: 'Registry System Files',
      c: 'Operating System (OS)',
      d: 'Web Browser Application'
    },
    correct: 'c',
    explanation: 'The Operating System acts as the master resource manager and hardware abstraction supervisor, controlling access to processors, primary memory, and storage invisibly in the background (CS101 Handouts Lecture 6). Appeared in 15+ papers.',
    urdu_answer: 'آپریٹنگ سسٹم (OS) کمپیوٹر کے تمام ہارڈ ویئر اور سافٹ ویئر وسائل (ریم، ہارڈ ڈسک، سی پی یو) کو پس پردہ منظم اور کنٹرول کرتا ہے۔'
  },
  {
    stem: 'Regarding the formal syntax for writing algorithm Pseudocode, there are:',
    options: {
      a: 'Strict international ISO standards',
      b: 'No rigid, standard rules (it is informal human-readable design logic)',
      c: 'Strict compiler-enforced syntax rules',
      d: 'Pre-defined binary bytecode conventions'
    },
    correct: 'b',
    explanation: 'Pseudocode is an informal, high-level description of an algorithm intended for human understanding. It has no standardized formal grammar or compiler syntax (CS101 Handouts Lecture 6). Appeared in 8+ midterm papers.',
    urdu_answer: 'سوڈو کوڈ (Pseudocode) لکھنے کے لیے کوئی سخت یا پہلے سے طے شدہ معیاری قواعد (No standard rules) نہیں ہوتے، یہ عام فہم انسانی زبان میں لکھا جاتا ہے۔'
  },
  {
    stem: 'Which algorithmic representation technique is generally considered more directly suitable for a software developer when transitioning logic into actual programming code?',
    options: {
      a: 'Pseudocode',
      b: 'Graphical Flowchart',
      c: 'Both flowchart and pseudocode equally',
      d: 'Heuristic trial-and-error'
    },
    correct: 'a',
    explanation: 'While flowcharts provide graphical overviews, pseudocode closely mirrors actual programming language constructs (variables, if-else conditions, while/for loops), making it much easier for developers to translate directly into code (CS101 Handouts Lecture 6). Appeared in 6+ papers.',
    urdu_answer: 'سوڈو کوڈ (Pseudocode) پروگرامر کے لیے اصل پروگرامنگ کوڈ میں تبدیل کرنے کے حوالے سے فلو چارٹ سے زیادہ موزوں اور آسان ہوتا ہے۔'
  },
  {
    stem: 'Which of the following is a classic example of commercial "Shrink-wrapped" (off-the-shelf packaged) application software?',
    options: {
      a: 'PIA Custom Flight Reservation System',
      b: 'WinZip trial evaluation package',
      c: 'Linux Kernel Open Source Operating System',
      d: 'Microsoft Word / Microsoft Office'
    },
    correct: 'd',
    explanation: 'Shrink-wrapped software refers to pre-packaged, commercial, off-the-shelf software sold in retail boxes to the general public, exemplified by Microsoft Word and Adobe Photoshop (CS101 Handouts Lecture 6). Appeared in 7+ past papers.',
    urdu_answer: 'مائیکروسافٹ ورڈ (MS Word) شِرنک ریپڈ (Shrink-wrapped) یعنی مارکیٹ میں پیکنگ میں عام فروخت ہونے والے کمرشل سافٹ ویئر کی بہترین مثال ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'What is the fundamental difference between a Compiler and an Interpreter? Compare their translation method, execution speed, and error reporting.',
    correct: `<p><strong>Comparison: Compiler vs. Interpreter:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Criterion</th>
      <th>Compiler</th>
      <th>Interpreter</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Translation Method</strong></td>
      <td>Scans and translates the entire source program in one pass ("in one go") into machine code.</td>
      <td>Translates and executes the source code line-by-line sequentially in real time.</td>
    </tr>
    <tr>
      <td><strong>Execution Speed</strong></td>
      <td>Produces an independent executable object file (<code>.exe</code>); subsequent program execution is extremely fast.</td>
      <td>Slower execution speed because each statement must be interpreted each time it is encountered in a loop.</td>
    </tr>
    <tr>
      <td><strong>Error Reporting</strong></td>
      <td>Reports all syntax errors together after scanning the complete code file.</td>
      <td>Stops execution immediately upon encountering the first syntax error on that line.</td>
    </tr>
    <tr>
      <td><strong>Example Languages</strong></td>
      <td>C, C++, Rust, Fortran, Go.</td>
      <td>JavaScript, Python, Ruby, PHP.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 6; CS101 Mid Term Past Paper Mega File, Page 10; cs101 midterm subjective by moaaz, Page 1.',
    urdu_answer: 'کمپائلر پورے پروگرام کا ایک ہی بار میں ترجمہ کر کے الگ ایگزیکیوٹیبل فائل بناتا ہے اور تمام غلطیاں آخر میں بتاتا ہے۔ جبکہ انٹرپریٹر کوڈ کی ایک ایک لائن کا ترجمہ کر کے ساتھ چلاتا ہے اور غلطی پر فوراً رک جاتا ہے۔'
  },
  {
    stem: 'Explain the two major categories of computer software (System Software and Application Software) and provide two examples for each category.',
    correct: `<p><strong>Two Major Types of Computer Software:</strong></p>

<ol>
  <li><strong>System Software:</strong>
    <p>Programs that control, manage, and coordinate the internal hardware operations and resources of the computer system. It serves as the intermediary platform upon which application software executes.</p>
    <ul>
      <li><strong>Examples:</strong>
        <ol>
          <li><strong>Operating Systems:</strong> Microsoft Windows, Linux, macOS, Android.</li>
          <li><strong>Language Translators & Device Drivers:</strong> C++ Compilers, Printer Drivers, BIOS/UEFI firmware.</li>
        </ol>
      </li>
    </ul>
  </li>
  <li><strong>Application Software:</strong>
    <p>Programs developed to perform specific productive, educational, commercial, or recreational tasks directly for the human end-user.</p>
    <ul>
      <li><strong>Examples:</strong>
        <ol>
          <li><strong>Productivity Suites:</strong> Microsoft Word, Microsoft Excel, Google Docs.</li>
          <li><strong>Web Browsers & Media Players:</strong> Google Chrome, Mozilla Firefox, VLC Media Player.</li>
        </ol>
      </li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 6; CS101 solved past papers, Page 27, Q17.',
    urdu_answer: 'سافٹ ویئر کی دو بڑی اقسام ہیں: 1. سسٹم سافٹ ویئر جو کمپیوٹر کے ہارڈ ویئر کو کنٹرول کرتا ہے (جیسے ونڈوز اور ڈیوائس ڈرائیورز)، اور 2. ایپلی کیشن سافٹ ویئر جو صارفین کے مخصوص کاموں کے لیے بنایا جاتا ہے (جیسے ایم ایس ورڈ اور گوگل کروم)۔'
  },
  {
    stem: 'What is Pseudocode? Explain its purpose in software engineering and clarify whether it adheres to any strict grammatical or syntactical standards.',
    correct: `<p><strong>Definition and Purpose of Pseudocode:</strong></p>
<p><strong>Pseudocode</strong> (literally "fake code") is an informal, high-level, human-readable description of the step-by-step logic of an algorithm. It uses structured plain English combined with mathematical notation and standard programming conventions (like IF-THEN, WHILE, REPEAT).</p>

<p><strong>Key Purposes in Software Engineering:</strong></p>
<ul>
  <li>Allows programmers to focus entirely on designing the correct logic and computational strategy without getting bogged down by strict syntax rules, semicolons, or memory management.</li>
  <li>Facilitates clear communication and code review among team members, technical architects, and non-technical stakeholders.</li>
</ul>

<p><strong>Are There Standard Rules for Writing It?</strong></p>
<p><strong>NO.</strong> There are no formal, standardized, or ISO-mandated syntactical rules for pseudocode. It cannot be directly compiled or executed by a computer. Any clear, logically coherent notation that accurately communicates the algorithmic steps is valid.</p>`,
    explanation: 'From CS101 Handouts Lecture 6; CS101 MID-Term by Attiq Kundi Page 2.',
    urdu_answer: 'سوڈو کوڈ (Pseudocode) الگورتھم کی منطق کو عام فہم اور آسان زبان میں بیان کرنے کا طریقہ ہے۔ اس کے لکھنے کے لیے کوئی پہلے سے طے شدہ سخت یا معیاری قوانین (No standard rules) نہیں ہوتے اور نہ ہی کمپیوٹر اسے براہ راست چلا سکتا ہے۔'
  },
  {
    stem: 'Define an Algorithm. List the three fundamental control building blocks required to express any computer algorithm.',
    correct: `<p><strong>Definition of an Algorithm:</strong></p>
<p>An <strong>algorithm</strong> is a finite, unambiguous, step-by-step sequence of well-defined instructions designed to solve a specific computational problem or accomplish a specific task, taking defined inputs and terminating to produce a defined output.</p>

<p><strong>Three Fundamental Control Building Blocks:</strong></p>
<ol>
  <li><strong>Sequence (Sequential Execution):</strong>
    <p>Instructions are executed in exact linear, chronological order, one statement after another from top to bottom.</p>
  </li>
  <li><strong>Selection (Conditional Branching):</strong>
    <p>Allows the algorithm to make decisions and execute different sets of instructions depending on whether a logical condition evaluates to TRUE or FALSE (e.g., <code>IF-THEN-ELSE</code> constructs).</p>
  </li>
  <li><strong>Iteration (Repetition / Looping):</strong>
    <p>Allows a block of instructions to be repeated multiple times until a specified termination condition is fulfilled (e.g., <code>WHILE</code>, <code>FOR</code>, <code>REPEAT-UNTIL</code> loops).</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 6; CS101 Mid Term Past Paper Mega File, Page 13.',
    urdu_answer: 'الگورتھم کسی مسئلے کو حل کرنے کے لیے مرحلہ وار اور محدود ہدایات کے سیٹ کو کہتے ہیں۔ اس کے تین بنیادی تعمیری اجزاء ہیں: 1. سیکوئنس (ترتیب وار عمل)، 2. سلیکشن (شرط کی بنیاد پر فیصلہ)، اور 3. اِٹریشن یا لوپ (کسی عمل کو بار بار دہرانا)۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Provide a detailed comparative analysis between High-Level Programming Languages and Low-Level Programming Languages (Machine & Assembly Languages). Compare their ease of development, hardware portability, memory management, and runtime execution speed.',
    correct: `<p><strong>Comparative Analysis: High-Level vs. Low-Level Languages</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>High-Level Languages (HLL)</th>
      <th>Low-Level Languages (LLL)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition & Closeness</strong></td>
      <td>Closer to human natural language and mathematics; abstracted away from CPU hardware registers.</td>
      <td>Closer to machine hardware architecture; operates directly on registers, memory addresses, and CPU opcodes.</td>
    </tr>
    <tr>
      <td><strong>Syntax & Readability</strong></td>
      <td>Uses familiar English words (e.g., <code>print</code>, <code>if</code>, <code>while</code>). Highly readable and easy to debug.</td>
      <td>Uses cryptic binary numbers (Machine Language: <code>10110000</code>) or short mnemonics (Assembly Language: <code>MOV AX, 1</code>).</td>
    </tr>
    <tr>
      <td><strong>Hardware Portability</strong></td>
      <td><strong>Machine Independent:</strong> The same source code can run across Intel, ARM, or AMD processors with proper recompilation.</td>
      <td><strong>Machine Dependent:</strong> Assembly code written for an x86 architecture cannot run on an ARM processor; tied to specific CPU instruction sets.</td>
    </tr>
    <tr>
      <td><strong>Execution Speed & Efficiency</strong></td>
      <td>Slightly slower execution speed due to abstraction layers and compiler translation overhead.</td>
      <td>Extremely fast and resource-efficient; allows direct, cycle-accurate control over hardware micro-operations.</td>
    </tr>
    <tr>
      <td><strong>Translation Requirement</strong></td>
      <td>Requires a Compiler or Interpreter to convert source code to machine instructions.</td>
      <td>Machine code needs no translator. Assembly code requires a simple Assembler.</td>
    </tr>
    <tr>
      <td><strong>Examples</strong></td>
      <td>Python, Java, C++, C#, JavaScript.</td>
      <td>Binary Machine Code, x86 Assembly, ARM Assembly.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 6; Cs101 latest midterm paper 9 Q22; CS101 solved past papers Q22.',
    urdu_answer: 'ہائی لیول لینگویجز انسانوں کے لیے سمجھنے اور لکھنے میں آسان ہوتی ہیں (جیسے سی++ اور پائتھون) اور کسی بھی ہارڈ ویئر پر چل سکتی ہیں۔ جبکہ لو لیول لینگویجز (مشین اور اسمبلی لینگویج) کمپیوٹر ہارڈ ویئر کے بہت قریب ہوتی ہیں، کمپیوٹر انہیں انتہائی تیزی سے چلاتا ہے لیکن یہ مخصوص پروسیسر کے تابع ہوتی ہیں اور انسانوں کے لیے لکھنا مشکل ہوتی ہیں۔'
  },
  {
    stem: 'Explain how an Operating System (OS) functions as a comprehensive Resource Allocator in a modern computer system. Detail how it manages the central processor, system RAM, storage disks, and input/output peripherals invisibly on behalf of application software.',
    correct: `<p><strong>1. The Operating System as a Resource Allocator:</strong></p>
<p>A modern computer system consists of numerous shared hardware and software resources (CPU cycles, physical RAM memory, secondary storage drives, display screens, and network interfaces). When multiple user applications run concurrently, they compete for these finite resources. The <strong>Operating System (OS)</strong> acts as the central resource allocator and arbitrator, ensuring fair, secure, efficient, and conflict-free utilization.</p>

<p><strong>2. Core Resource Management Functions:</strong></p>
<ol>
  <li><strong>Processor (CPU) Management & Scheduling:</strong>
    <p>The OS scheduler allocates CPU time slices to competing processes (using algorithms such as Round-Robin or Priority Scheduling), creating the smooth illusion of seamless multi-tasking while preventing any single rogue program from monopolizing the processor.</p>
  </li>
  <li><strong>Memory Management (RAM & Virtual Memory):</strong>
    <p>The OS tracks every byte of primary memory, allocating memory blocks dynamically when programs launch and reclaiming memory when they terminate. It enforces hardware memory protection to ensure one program cannot corrupt or read the private memory space of another program, and pages excess memory to disk via <em>Virtual Memory</em>.</p>
  </li>
  <li><strong>File System & Secondary Storage Management:</strong>
    <p>The OS manages magnetic hard drives and solid-state disks (SSDs), organizing physical blocks into an intuitive hierarchical file system (folders and files), managing access permissions, and tracking free disk clusters invisibly.</p>
  </li>
  <li><strong>Device & I/O Peripheral Management:</strong>
    <p>Using specialized device driver modules, the OS provides standardized system call interfaces (APIs) for keyboards, mice, printers, sound cards, and network adapters. An application simply requests "write to disk" or "output to speaker," and the OS handles all mechanical timing, interrupt handling, and buffering behind the scenes.</p>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 6; Cs101 latest midterm paper 9 Q19; CS101 solved past papers Q19.',
    urdu_answer: 'آپریٹنگ سسٹم کمپیوٹر کا چیف ریسورس منیجر ہوتا ہے۔ جب بیک وقت کئی پروگرام چل رہے ہوں تو OS طے کرتا ہے کہ کس پروگرام کو کتنا سی پی یو ٹائم، کتنی ریم میموری، اور ہارڈ ڈسک کا کتنا حصہ دیا جائے۔ یہ کام OS پس پردہ اتنی مہارت سے انجام دیتا ہے کہ ایپلی کیشنز آپس میں ٹکرائے بغیر تیزی سے کام کرتی رہتی ہیں۔'
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
console.log(`CS101 Lecture 6 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

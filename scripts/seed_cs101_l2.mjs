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

// 2. Create or fetch Lecture 2
let lec2 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 2").get(cs101.id);
if (!lec2) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 2, 'Computer Hardware Evolution: Vacuum Tubes, Transistors, ICs, and Software Classification')
  `).run(cs101.id);
  lec2 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 2 with ID: ${lec2.id}`);
} else {
  console.log(`CS101 Lecture 2 found with ID: ${lec2.id}`);
}

const lId = lec2.id;

// 3. Clear existing questions for Lecture 2 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 2.`);

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

// 13 MCQs
const mcqs = [
  {
    stem: 'In the generational evolution of computing hardware, bulky and heat-generating vacuum tubes were replaced by:',
    options: {
      a: 'Punched cards',
      b: 'Transistors',
      c: 'Microprocessors',
      d: 'Resistors'
    },
    correct: 'b',
    explanation: 'Transistors replaced vacuum tubes starting in the 1950s (Second Generation), ushering in devices that were drastically smaller, consumed less power, generated far less heat, and were immensely more reliable (CS101 Handouts Lecture 2). Appeared in 20+ midterm past papers.',
    urdu_answer: 'کمپیوٹر ہارڈ ویئر کے ارتقاء میں ویکیوم ٹیوبز کی جگہ ٹرانزسٹرز (Transistors) نے لی جس سے کمپیوٹر کا سائز چھوٹا اور رفتار تیز ہو گئی۔'
  },
  {
    stem: 'Which of the following is historically recognized as the world\'s first electronic digital computer?',
    options: {
      a: 'Atanasoff-Berry Computer (ABC)',
      b: 'International Business Machines (IBM PC)',
      c: 'Apple Macintosh (MAC)',
      d: 'Harvard Mark 1'
    },
    correct: 'a',
    explanation: 'Conceived and built between 1937 and 1942 by John Vincent Atanasoff and Clifford Berry at Iowa State College, the Atanasoff-Berry Computer (ABC) was the first electronic digital calculating machine, using vacuum tubes, binary arithmetic, and regenerative capacitor memory (CS101 Handouts Lecture 2). Appeared in multiple past papers.',
    urdu_answer: 'دنیا کا پہلا الیکٹرانک ڈیجیٹل کمپیوٹر اٹاناسوف بیری کمپیوٹر (ABC) تھا جسے 1937 سے 1942 کے دوران ڈیزائن کیا گیا۔'
  },
  {
    stem: 'Which of the following statements accurately characterizes vacuum tubes?',
    options: {
      a: 'They are significantly smaller and more energy efficient than modern transistors',
      b: 'They are electronic devices consisting of two or more electrodes enclosed in an evacuated glass or metal envelope',
      c: 'They were the primary logic components utilized in the original IBM PC',
      d: 'They were invented by World Wide Web pioneer Tim Berners-Lee'
    },
    correct: 'b',
    explanation: 'A vacuum tube (thermionic valve) consists of electrodes sealed in a glass bulb from which air has been evacuated, controlling electric current flow between the electrodes (CS101 Handouts Lecture 2). Appeared in 4+ midterm papers.',
    urdu_answer: 'ویکیوم ٹیوب شیشے یا دھات کے نلکے میں دو یا دو سے زائد الیکٹروڈز پر مشتمل ایک برقی آلہ ہوتا ہے جو کرنٹ کے بہاؤ کو کنٹرول کرتا ہے۔'
  },
  {
    stem: 'The first point-contact transistor was invented at Bell Laboratories in December 1947 by a team led by:',
    options: {
      a: 'William Shockley (along with John Bardeen and Walter Brattain)',
      b: 'Charles Babbage',
      c: 'John von Neumann',
      d: 'Blaise Pascal'
    },
    correct: 'a',
    explanation: 'The transistor was invented at Bell Labs in December 1947 by John Bardeen, Walter Brattain, and William Shockley, for which they were awarded the 1956 Nobel Prize in Physics (CS101 Handouts Lecture 2). Appeared in 8+ midterm papers.',
    urdu_answer: 'پہلا ٹرانزسٹر 1947 میں بیل لیبارٹریز میں ولیم شاکلے اور ان کے ساتھیوں (جان بارڈین اور والٹر بریٹین) نے ایجاد کیا۔'
  },
  {
    stem: 'Today\'s modern electronic computers, microprocessors, and digital memory chips are fundamentally based on the solid-state technology of:',
    options: {
      a: 'Punched cards',
      b: 'Vacuum tubes',
      c: 'Transistors',
      d: 'Relays'
    },
    correct: 'c',
    explanation: 'Modern microprocessors contain billions of microscopic semiconductor transistors integrated on silicon dies that act as high-speed electronic switches (CS101 Handouts Lecture 2). Appeared in 6+ papers.',
    urdu_answer: 'آج کے تمام جدید کمپیوٹرز اور مائیکرو پروسیسرز بنیادی طور پر ٹرانزسٹرز (Transistors) کی ٹیکنالوجی پر کام کرتے ہیں۔'
  },
  {
    stem: 'Prior to the invention of the transistor, the only available electronic component capable of electrical amplification and fast digital switching was the:',
    options: {
      a: 'Punched card',
      b: 'Vacuum tube (thermionic valve)',
      c: 'Microprocessor',
      d: 'Resistor'
    },
    correct: 'b',
    explanation: 'Before solid-state semiconductor transistors, the vacuum tube was the only electrical device capable of fast switching and current regulation, but it suffered from high power consumption, excessive heat, and frequent burnout (CS101 Handouts Lecture 2). Appeared in 3+ papers.',
    urdu_answer: 'ٹرانزسٹر کی ایجاد سے پہلے سگنل سوئچنگ اور کرنٹ کو کنٹرول کرنے کے لیے صرف ویکیوم ٹیوب کا سہارا موجود تھا۔'
  },
  {
    stem: 'A standard transistor is a solid-state semiconductor device used for amplification and switching, and typically features how many physical terminals (leads)?',
    options: {
      a: 'One terminal',
      b: 'Two terminals',
      c: 'Three terminals',
      d: 'Four terminals'
    },
    correct: 'c',
    explanation: 'A standard bipolar junction transistor (BJT) features three terminals: Base, Collector, and Emitter (or Gate, Drain, and Source in FETs) (CS101 Handouts Lecture 2). Appeared in 5+ midterm papers.',
    urdu_answer: 'ایک معیاری ٹرانزسٹر ایک ٹھوس سیمی کنڈکٹر آلہ ہے جس کے تین ٹرمینلز (Three Terminals) ہوتے ہیں۔'
  },
  {
    stem: 'A semiconductor diode functions electronically as the equivalent of a:',
    options: {
      a: 'One-way valve (allowing current to flow in only one direction)',
      b: 'Two-way bidirectional switch',
      c: 'Three-way current amplifier',
      d: 'Four-way signal splitter'
    },
    correct: 'a',
    explanation: 'A diode allows electric current to flow freely in the forward-biased direction while strongly blocking current in the reverse direction, functioning as an electronic one-way valve (CS101 Handouts Lecture 2). Appeared in 7+ midterm papers.',
    urdu_answer: 'ڈائیوڈ (Diode) ایک طرفہ والو (One-way valve) کی طرح کام کرتا ہے جو کرنٹ کو صرف ایک سمت میں بہنے کی اجازت دیتا ہے۔'
  },
  {
    stem: 'British scientist Sir John Ambrose Fleming invented an early thermionic two-electrode vacuum tube in 1904, which became known as a diode or "valve". This historical statement is:',
    options: {
      a: 'True',
      b: 'False'
    },
    correct: 'a',
    explanation: 'Sir John Ambrose Fleming invented the Fleming valve (the thermionic diode) in 1904, which acted as a rectifier to convert alternating current to direct current and detect radio signals (CS101 Handouts Lecture 2). Appeared in multiple past papers.',
    urdu_answer: 'یہ بیان بالکل درست (True) ہے کہ برطانوی سائنسدان جان اے فلیمنگ نے دو الیکٹروڈز والی ویکیوم ٹیوب ایجاد کی جسے والو (یا ڈائیوڈ) کہا جاتا تھا۔'
  },
  {
    stem: 'Which of the following outlines the correct chronological sequence of core technologies used in the evolution of computing machinery?',
    options: {
      a: 'Mechanical -> Electromechanical -> Vacuum Tubes -> Transistors -> Integrated Circuits',
      b: 'Electromechanical -> Mechanical -> Vacuum Tubes -> Transistors',
      c: 'Electronic -> Mechanical -> Electromechanical -> Transistors',
      d: 'Mechanical -> Electrical -> Quantum Computing -> Transistors'
    },
    correct: 'a',
    explanation: 'Computing evolved from manual and mechanical gear machines (Babbage), to electromechanical relay devices (Mark 1), to 1st Generation vacuum tubes (ENIAC), to 2nd Generation transistors, to 3rd Generation ICs and microprocessors (CS101 Handouts Lecture 2). Appeared in past papers.',
    urdu_answer: 'کمپیوٹر ٹیکنالوجی کا درست ارتقائی تسلسل: مکینیکل -> الیکٹرو مکینیکل -> ویکیوم ٹیوبز -> ٹرانزسٹرز -> انٹیگریٹڈ سرکٹس ہے۔'
  },
  {
    stem: 'Compared to first-generation vacuum tubes, solid-state transistors offer which of the following operational advantages?',
    options: {
      a: 'Dramatically smaller physical dimensions and mass',
      b: 'Far superior operational reliability and lifespan',
      c: 'Much lower manufacturing cost and lower power dissipation',
      d: 'All of the given choices'
    },
    correct: 'd',
    explanation: 'Transistors consume a fraction of the power, do not require filament heating, generate minimal heat, are vastly smaller, and operate for tens of thousands of hours without burning out (CS101 Handouts Lecture 2). Appeared in multiple midterm files.',
    urdu_answer: 'ویکیوم ٹیوبز کے مقابلے میں ٹرانزسٹرز کا سائز انتہائی چھوٹا، لاگت کم، اور پائیداری و بھروسہ مندی بہت زیادہ ہوتی ہے، یعنی یہ تمام فوائد درست ہیں۔'
  },
  {
    stem: 'Which of the following electronic components is NOT a microscopic constituent integrated onto an Integrated Circuit (IC)?',
    options: {
      a: 'Transistors',
      b: 'Diodes',
      c: 'Resistors',
      d: 'Vacuum tubes'
    },
    correct: 'd',
    explanation: 'An Integrated Circuit (IC) microchip integrates miniaturized transistors, diodes, resistors, and capacitors onto a single silicon semiconductor wafer; bulky thermionic vacuum tubes are never part of an IC (CS101 Handouts Lecture 2). Appeared in multiple past papers.',
    urdu_answer: 'انٹیگریٹڈ سرکٹ (IC) سلیکون چپ پر بنتا ہے جس میں ٹرانزسٹرز، ڈائیوڈز اور ریزسٹرز شامل ہوتے ہیں، جبکہ ویکیوم ٹیوب اس کا حصہ نہیں ہوتی۔'
  },
  {
    stem: 'In early computing history, the landmark ENIAC machine was originally designed and constructed at the University of Pennsylvania to compute:',
    options: {
      a: 'Artillery firing and ballistic trajectory tables for the military',
      b: 'Commercial payroll databases and census summaries',
      c: 'Weather forecast simulations and climate modeling',
      d: 'Cryptographic decryption of telegraph transmissions'
    },
    correct: 'a',
    explanation: 'ENIAC (Electronic Numerical Integrator and Computer) was built during World War II at the University of Pennsylvania by John Mauchly and J. Presper Eckert specifically to calculate artillery firing tables for the U.S. Army Ballistic Research Laboratory (CS101 Handouts Lecture 2). Appeared in past midterm papers.',
    urdu_answer: 'اینیاک (ENIAC) کمپیوٹر جنگ عظیم کے دوران توپ خانے کے فائرنگ اور بیلسٹک ٹیبلز (Artillery tables) کا تیزی سے حساب کتاب کرنے کے لیے بنایا گیا تھا۔'
  }
];

// 3 Short Questions
const shortQuestions = [
  {
    stem: 'How does the Operating System (OS) manage hardware devices when a particular application software executes? Explain with at least one practical example.',
    correct: `<p><strong>Role of Operating System in Device Management:</strong></p>
<p>The Operating System (OS) serves as an intermediary abstraction layer between user applications and physical hardware. Applications never interact directly with raw hardware; instead, they make standardized <em>System Calls</em> to the OS.</p>

<p><strong>Core Device Management Functions:</strong></p>
<ul>
  <li><strong>Device Drivers:</strong> The OS translates general software commands into specific hardware signals using specialized device driver programs.</li>
  <li><strong>Resource Scheduling & Arbitration:</strong> The OS manages hardware access queues, preventing multiple programs from causing hardware conflicts or data collisions.</li>
  <li><strong>Buffering & Spooling:</strong> The OS provides memory buffers so data transfer rates between fast CPUs and slower peripheral devices are smoothly synchronized.</li>
</ul>

<p><strong>Practical Example (Printing a Word Document):</strong></p>
<p>When you click "Print" in Microsoft Word (Application Software), Word does not directly control the printer's mechanical stepper motors or ink jets. Instead, Word sends the document data to the Operating System's print subsystem. The OS places the job into the print spooler queue, loads the appropriate printer driver, translates the document into printer control language, and transfers the data stream byte-by-byte to the printer over USB or network interfaces while freeing Word to continue editing.</p>`,
    explanation: 'From CS101 Handouts Lecture 2; cs101 solveds mcqs mega files for papers, Page 126, Q3.',
    urdu_answer: 'آپریٹنگ سسٹم ہارڈ ویئر اور ایپلی کیشن سافٹ ویئر کے درمیان پل کا کام کرتا ہے۔ جب کوئی ایپلی کیشن (جیسے ایم ایس ورڈ) چلتی ہے تو وہ براہ راست پرنٹر یا ڈسک سے بات نہیں کرتی بلکہ OS کو کمانڈ بھیجتی ہے۔ OS ڈیوائس ڈرائیورز کی مدد سے پرنٹر تک ڈیٹا منظم طریقے سے پہنچاتا ہے تاکہ سسٹم بغیر کسی رکاوٹ کے چلتا رہے۔'
  },
  {
    stem: 'What are the fundamental differences between Vacuum Tubes and Transistors in the development of computer hardware? Compare their operating principles, size, heat generation, and reliability.',
    correct: `<p><strong>Comparison: Vacuum Tubes vs. Transistors</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Vacuum Tube (Thermionic Valve)</th>
      <th>Transistor (Solid-State Semiconductor)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Technology & Mechanism</strong></td>
      <td>Glass bulb with vacuum; thermionic emission of electrons from a heated cathode filament across a vacuum gap.</td>
      <td>Solid-state crystalline semiconductor (silicon or germanium); electron flow controlled via P-N junctions.</td>
    </tr>
    <tr>
      <td><strong>Physical Size & Mass</strong></td>
      <td>Large, bulky glass envelopes (several centimeters high).</td>
      <td>Microscopically compact (modern chips fit billions on a coin-sized die).</td>
    </tr>
    <tr>
      <td><strong>Power & Heat Generation</strong></td>
      <td>Consumes substantial electrical power; produces intense heat requiring extensive room air conditioning.</td>
      <td>Consumes microscopic amounts of electrical power; produces negligible heat by comparison.</td>
    </tr>
    <tr>
      <td><strong>Reliability & Lifespan</strong></td>
      <td>Fragile; filaments burn out rapidly after hundreds of hours (requiring continuous replacement).</td>
      <td>Extremely rugged solid-state reliability; operates for decades without deterioration.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 2; cs101 solveds mcqs mega files, Pages 64–65.',
    urdu_answer: 'ویکیوم ٹیوب شیشے کے نلکے پر مشتمل ہوتی تھی جو گرم ہو کر بہت زیادہ بجلی اور حرارت پیدا کرتی تھی اور جلد جل جاتی تھی۔ جبکہ ٹرانزسٹر ایک ٹھوس سیمی کنڈکٹر چپ ہے جو بے حد چھوٹی، کم بجلی استعمال کرنے والی، اور سالہا سال بغیر خراب ہوئے تیز رفتار کام کرنے والی ڈیوائس ہے۔'
  },
  {
    stem: 'Define System Software and Application Software. Clearly distinguish between them and provide two examples for each category.',
    correct: `<p><strong>1. System Software:</strong></p>
<p>System Software refers to low-level computer programs designed to operate, control, maintain, and extend the hardware processing capabilities of the computer itself. It acts as the foundational platform upon which application programs run.</p>
<ul>
  <li><strong>Key Characteristic:</strong> Manages internal hardware resources (CPU, RAM, storage, peripherals) directly.</li>
  <li><strong>Examples:</strong>
    <ol>
      <li><strong>Operating Systems:</strong> Microsoft Windows, Linux, macOS, Android.</li>
      <li><strong>System Utilities & Compilers:</strong> Device drivers, disk partitioners, BIOS/UEFI firmware, C++ compilers.</li>
    </ol>
  </li>
</ul>

<p><strong>2. Application Software:</strong></p>
<p>Application Software comprises user-oriented computer programs developed to perform specific productive, educational, commercial, or entertainment tasks directly for human end-users.</p>
<ul>
  <li><strong>Key Characteristic:</strong> Solves real-world user problems rather than managing computer hardware.</li>
  <li><strong>Examples:</strong>
    <ol>
      <li><strong>Word Processing & Productivity:</strong> Microsoft Office Word, Google Docs, Adobe Acrobat Reader.</li>
      <li><strong>Web Browsers & Media:</strong> Google Chrome, Mozilla Firefox, VLC Media Player.</li>
    </ol>
  </li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 2; CS101 solved past papers, Page 27, Q17.',
    urdu_answer: 'سسٹم سافٹ ویئر وہ بنیادی پروگرامز ہیں جو کمپیوٹر کے ہارڈ ویئر کو کنٹرول اور مینیج کرتے ہیں (جیسے ونڈوز یا لینکس آپریٹنگ سسٹم اور ڈیوائس ڈرائیورز)۔ جبکہ ایپلی کیشن سافٹ ویئر وہ پروگرامز ہیں جو صارف کی مخصوص ضرورت اور کام کے لیے بنائے جاتے ہیں (جیسے ایم ایس ورڈ اور گوگل کروم)۔'
  }
];

// 1 Long Question
const longQuestions = [
  {
    stem: 'Trace the generational evolution of computing hardware through its major eras: Mechanical devices, Vacuum Tubes, Transistors, Integrated Circuits (ICs), and Microprocessors. Detail how each milestone revolutionized execution speed, physical size, power dissipation, cost, and system reliability.',
    correct: `<p><strong>Generational Evolution of Computer Hardware:</strong></p>

<ol>
  <li><strong>The Mechanical Era (Pre-1940s):</strong>
    <ul>
      <li><strong>Technology:</strong> Manual levers, brass gears, toothed wheels, and punched cards (Babbage's Difference and Analytical Engines, Jacquard Loom).</li>
      <li><strong>Characteristics:</strong> Purely mechanical; severely restricted by physical friction, mechanical wear, slow operating speeds (seconds per operation), and monumental physical sizes.</li>
    </ul>
  </li>

  <li><strong>First Generation: Vacuum Tubes (1940s – mid-1950s):</strong>
    <ul>
      <li><strong>Technology:</strong> Thermionic vacuum tubes used for digital logic switches and regenerative delay line/electrostatic tubes for memory (ENIAC, EDVAC, UNIVAC I, ABC).</li>
      <li><strong>Impact:</strong> Achieved electronic computation speeds (thousands of additions per second). However, computers occupied entire rooms (ENIAC weighed 30 tons with 18,000 tubes), consumed megawatts of power, emitted intense heat, and suffered frequent tube burnout every few hours.</li>
    </ul>
  </li>

  <li><strong>Second Generation: Transistors (Late 1950s – mid-1960s):</strong>
    <ul>
      <li><strong>Technology:</strong> Discrete solid-state semiconductor transistors (invented at Bell Labs in 1947) replacing vacuum tubes (IBM 7090, CDC 1604).</li>
      <li><strong>Impact:</strong> Dramatically reduced computer dimensions from entire rooms to large cabinets. Power consumption dropped drastically, operational reliability skyrocketed by orders of magnitude, and switching speeds reached microseconds.</li>
    </ul>
  </li>

  <li><strong>Third Generation: Integrated Circuits (ICs) (Mid-1960s – 1970s):</strong>
    <ul>
      <li><strong>Technology:</strong> Small-Scale and Medium-Scale Integration (SSI/MSI) combining dozens to thousands of microscopic transistors, diodes, and resistors onto a single silicon wafer (Robert Noyce and Jack Kilby; IBM System/360).</li>
      <li><strong>Impact:</strong> Drastic reduction in production costs, standardized modular manufacturing, higher computational bandwidth, and the emergence of minicomputers suitable for small enterprises and university labs.</li>
    </ul>
  </li>

  <li><strong>Fourth Generation: Microprocessors & VLSI (1971 – Present):</strong>
    <ul>
      <li><strong>Technology:</strong> Very Large-Scale Integration (VLSI) and Ultra Large-Scale Integration (ULSI) packing an entire central processing unit onto a single microchip (Intel 4004 in 1971 to modern multi-core processors with tens of billions of transistors).</li>
      <li><strong>Impact:</strong> Ushered in the personal computer (PC) revolution, laptops, smartphones, and embedded computing. Processing speeds advanced from kilohertz to gigahertz, memory capacities grew from kilobytes to terabytes, and computing devices became accessible and ubiquitous worldwide.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 2; CS101 Mid Term Past Paper 3, Page 2; cs101 solved past papers, Pages 28, 64.',
    urdu_answer: 'کمپیوٹر ہارڈ ویئر کے ارتقاء میں پانچ اہم ادوار شامل ہیں: 1. مکینیکل دور (گیئرز اور پہیے)، 2. پہلی جنریشن (ویکیوم ٹیوبز - بڑے کمروں جتنے کمپیوٹرز)، 3. دوسری جنریشن (ٹرانزسٹرز - سائز چھوٹا اور رفتار تیز)، 4. تیسری جنریشن (انٹیگریٹڈ سرکٹس - ایک چپ پر ہزاروں ٹرانزسٹرز)، اور 5. چوتھی جنریشن (مائیکرو پروسیسرز - ایک ہی سیلیکون چپ پر مکمل سی پی یو) جس سے پرسنل کمپیوٹرز کا انقلاب برپا ہوا۔'
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
console.log(`CS101 Lecture 2 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

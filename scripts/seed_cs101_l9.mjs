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

// 2. Create or fetch Lecture 9
let lec9 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 9").get(cs101.id);
if (!lec9) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 9, 'Mass Storage Systems, Magnetic & Optical Disks, and File Systems')
  `).run(cs101.id);
  lec9 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 9 with ID: ${lec9.id}`);
} else {
  console.log(`CS101 Lecture 9 found with ID: ${lec9.id}`);
}

const lId = lec9.id;

// 3. Clear existing questions for Lecture 9 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 9.`);

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

// 12 MCQs
const mcqs = [
  {
    stem: 'Which of the following computer components is NOT classified as a non-volatile mass storage (secondary storage) device?',
    options: {
      a: 'Magnetic Tape cartridge',
      b: 'Random Access Memory (RAM)',
      c: 'Floppy Diskette',
      d: 'Digital Versatile Disc (DVD)'
    },
    correct: 'b',
    explanation: 'RAM is volatile primary main memory that loses all data when power is removed, whereas tapes, floppy disks, hard drives, and DVDs are persistent mass storage media (CS101 Handouts Lecture 9). Appeared in 25+ past papers.',
    urdu_answer: 'ریم (RAM) ایک عارضی پرائمری میموری ہے، یہ ماس اسٹوریج یا مستقل سیکنڈری اسٹوریج ڈیوائس نہیں ہے۔'
  },
  {
    stem: 'Due to the volatility and limited capacity of a computer\'s primary main memory, computer systems incorporate persistent secondary storage devices known collectively as:',
    options: {
      a: 'Phase Change RAM (PRAM)',
      b: 'Resistive RAM (RRAM)',
      c: 'Mass Storage systems',
      d: 'Dynamic RAM (DRAM)'
    },
    correct: 'c',
    explanation: 'Mass storage systems (hard disks, SSDs, optical discs) provide non-volatile, high-capacity, low-cost persistence for programs and operating system files when power is turned off (CS101 Handouts Lecture 9). Appeared in 12+ past papers.',
    urdu_answer: 'مین میموری کے عارضی پن اور محدود گنجائش کی وجہ سے کمپیوٹرز میں ماس اسٹوریج (Mass storage) ڈیوائسز شامل کی جاتی ہیں۔'
  },
  {
    stem: 'Which subsystem of the operating system maintains a structured directory index recording the logical names, physical sector locations, sizes, and permissions of all stored files?',
    options: {
      a: 'File Folder icon',
      b: 'File Manager Application',
      c: 'File System',
      d: 'Command Shell Interpreter'
    },
    correct: 'c',
    explanation: 'A file system (such as NTFS, FAT32, or ext4) controls how data is indexed, named, stored, and retrieved from a mass storage drive (CS101 Handouts Lecture 9). Appeared in 10+ midterm papers.',
    urdu_answer: 'فائل سسٹم (File system) اسٹوریج ڈسک پر موجود تمام فائلوں کے ناموں اور ان کے مقامات کی فہرست (Index) کو منظم رکھتا ہے۔'
  },
  {
    stem: 'Unlike magnetic hard drives that format data into concentric circular rings, an optical Compact Disc (CD) stores digital data along a single continuous ________ track spiraling from the inside center outward.',
    options: {
      a: 'Spiral',
      b: 'Round concentric',
      c: 'Rectangular grid',
      d: 'Adjacent parallel'
    },
    correct: 'a',
    explanation: 'Optical media (CDs and DVDs) encode data along one continuous microscopic spiral track that originates near the center hole and spirals outward toward the outer edge (CS101 Handouts Lecture 9). Appeared in multiple past papers.',
    urdu_answer: 'سی ڈی (CD) پر ڈیٹا مرتکز دائروں کے بجائے اندر سے باہر کی طرف جانے والے ایک مسلسل اسپرل (Spiral) ٹریک پر محفوظ ہوتا ہے۔'
  },
  {
    stem: 'The average amount of time required for the rotating magnetic disk platter to spin the desired sector directly underneath the read/write head once the head reaches the track is called:',
    options: {
      a: 'Random Time',
      b: 'Total Access Time',
      c: 'Seek Time',
      d: 'Rotational Delay (Rotational Latency)'
    },
    correct: 'd',
    explanation: 'Rotational delay (or latency) is the time spent waiting for the spinning platter to bring the target data sector under the read/write head (CS101 Handouts Lecture 9). Appeared in multiple past papers.',
    urdu_answer: 'ہیڈ کے ٹریک پر پہنچنے کے بعد مطلوبہ سیکٹر کے گھوم کر ہیڈ کے نیچے آنے میں لگنے والے وقت کو روٹیشنل ڈیلے (Rotational delay) کہتے ہیں۔'
  },
  {
    stem: 'In magnetic hard disk systems, the total time required to locate a block of data, calculated as the mathematical sum of Seek Time and Rotational Delay, is called the:',
    options: {
      a: 'Access Time',
      b: 'Rotational Time',
      c: 'Data Transfer Time',
      d: 'Transmission Delay'
    },
    correct: 'a',
    explanation: 'Access Time represents the total mechanical delay before data transfer begins: $\\text{Access Time} = \\text{Seek Time} + \\text{Rotational Delay}$ (CS101 Handouts Lecture 9). Appeared in multiple past papers.',
    urdu_answer: 'سیک ٹائم (Seek time) اور روٹیشنل ڈیلے کے مجموعے کو ایکسس ٹائم (Access time) کہا جاتا ہے۔'
  },
  {
    stem: 'The mechanical time duration required for the read/write head arm assembly to physically move across the disk platters from its current track to the target track is known as:',
    options: {
      a: 'Seek Time',
      b: 'Rotational Delay',
      c: 'Access Time',
      d: 'Transfer Rate'
    },
    correct: 'a',
    explanation: 'Seek time measures the mechanical arm movement time required to position the read/write head over the radial track containing the requested data (CS101 Handouts Lecture 9). Appeared in 8+ midterm papers.',
    urdu_answer: 'ریڈ/رائٹ ہیڈ کو ایک ٹریک سے مطلوبہ ٹریک تک حرکت کرنے میں جو وقت درکار ہوتا ہے اسے سیک ٹائم (Seek time) کہتے ہیں۔'
  },
  {
    stem: 'What does the optical media acronym "CD" represent?',
    options: {
      a: 'Compute Disk',
      b: 'Conversion Disk',
      c: 'Compact Disc',
      d: 'Copy Disc'
    },
    correct: 'c',
    explanation: 'CD stands for Compact Disc, an optical storage medium molded with microscopic pits and lands read by a laser beam (CS101 Handouts Lecture 9). Appeared in 14+ midterm papers.',
    urdu_answer: 'سی ڈی (CD) کا مکمل نام "Compact Disc" ہے۔'
  },
  {
    stem: 'What is the full expansion of the storage device acronym "SSD"?',
    options: {
      a: 'Solid State Disk (or Solid State Drive)',
      b: 'System State Disk',
      c: 'Static Storage Drive',
      d: 'Synchronous Storage Device'
    },
    correct: 'a',
    explanation: 'SSD stands for Solid State Drive (or Solid State Disk), which utilizes non-volatile flash memory semiconductor chips with zero moving mechanical parts (CS101 Handouts Lecture 9). Appeared in multiple past papers.',
    urdu_answer: 'ایس ایس ڈی (SSD) کا مخفف "Solid State Drive / Disk" ہے جو بغیر کسی متحرک پرزے کے فلیش میموری پر کام کرتی ہے۔'
  },
  {
    stem: 'Which of the following mass storage technologies records data by magnetizing microscopic metallic grains on spinning platters?',
    options: {
      a: 'Magnetic Hard Disk Drive (HDD)',
      b: 'Compact Disc (CD)',
      c: 'Digital Versatile Disc (DVD)',
      d: 'USB Flash Drive'
    },
    correct: 'a',
    explanation: 'Hard disk drives utilize magnetic recording read/write heads to align magnetic domains on ferromagnetic platters; CDs/DVDs use optical lasers, and flash drives use semiconductor floating-gate transistors (CS101 Handouts Lecture 9). Appeared in 6+ papers.',
    urdu_answer: 'ہارڈ ڈسک (Hard Disk) مقناطیسی نظام (Magnetic system) کی مثال ہے جو ڈیٹا کو میگنیٹک چارجز کی صورت میں محفوظ کرتی ہے۔'
  },
  {
    stem: 'In modern graphical operating system file managers, files are conceptually grouped into a labeled organizational bundle called a:',
    options: {
      a: 'Folder (or Directory)',
      b: 'Cluster',
      c: 'Physical Sector',
      d: 'Partition Block'
    },
    correct: 'a',
    explanation: 'Operating systems organize individual files into named containers known as directories or folders (CS101 Handouts Lecture 9). Appeared in 9+ past papers.',
    urdu_answer: 'فائل مینیجر میں متعلقہ فائلوں کو ایک جگہ اکٹھا رکھنے کے لیے فولڈر (Folder) یا ڈائریکٹری استعمال ہوتی ہے۔'
  },
  {
    stem: 'Hierarchical file systems permit directories to contain files as well as nested subdirectories, arranged conceptually in a top-down:',
    options: {
      a: 'Flat sequence',
      b: 'Mesh network organization',
      c: 'Tree organization (Hierarchical tree structure)',
      d: 'Linear circular queue'
    },
    correct: 'c',
    explanation: 'File directory systems are organized as an inverted tree, originating at the root directory and branching downward through directories and subdirectories to individual leaf files (CS101 Handouts Lecture 9). Appeared in multiple past papers.',
    urdu_answer: 'ڈائریکٹریز کے اندر سب ڈائریکٹریز کا نظام ایک درخت جیسی شاخ در شاخ ترتیب (Tree organization) میں منظم ہوتا ہے۔'
  }
];

// 5 Short Questions
const shortQuestions = [
  {
    stem: 'What is the fundamental operational difference between Magnetic Tapes and Floppy Disks in computer mass storage?',
    correct: `<p><strong>Comparison: Magnetic Tapes vs. Floppy Disks:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Magnetic Tape</th>
      <th>Floppy Disk</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Access Method</strong></td>
      <td><strong>Sequential Access:</strong> To read record #500, the drive must physically wind through records 1 to 499 sequentially.</td>
      <td><strong>Direct / Random Access:</strong> The read/write head can jump directly to any track and sector without reading intervening data.</td>
    </tr>
    <tr>
      <td><strong>Access Speed</strong></td>
      <td>Extremely slow access time (seconds or minutes to locate a record).</td>
      <td>Significantly faster access time (measured in milliseconds).</td>
    </tr>
    <tr>
      <td><strong>Primary Application</strong></td>
      <td>Long-term data archiving, enterprise backup, and historical disaster recovery.</td>
      <td>Routine file sharing, booting systems, and everyday document transport.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 9; CS101 past papers Fall 2009 s2 Q27.',
    urdu_answer: 'میگنیٹک ٹیپ میں ڈیٹا سیکوینشل (ترتیب وار) ہوتا ہے یعنی مطلوبہ ریکارڈ تک پہنچنے کے لیے تمام پچھلے ریکارڈز سے گزرنا پڑتا ہے، جبکہ فلوپی ڈسک میں ڈائریکٹ ایکسس (براہ راست رسائی) ہوتی ہے اور ہیڈ سیدھا مطلوبہ ٹریک پر پہنچ جاتا ہے۔'
  },
  {
    stem: 'Differentiate between Main Memory (RAM) and Mass Storage (Secondary Storage). Compare volatility, capacity, relative access speed, and cost per gigabyte.',
    correct: `<p><strong>Comparison: Main Memory (RAM) vs. Mass Storage:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Criterion</th>
      <th>Main Memory (RAM)</th>
      <th>Mass Storage (HDD / SSD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Volatility</strong></td>
      <td><strong>Volatile:</strong> Immediately loses all stored data when electrical power is switched off.</td>
      <td><strong>Non-Volatile:</strong> Permanently retains stored data indefinitely without requiring continuous power.</td>
    </tr>
    <tr>
      <td><strong>Access Speed</strong></td>
      <td>Extremely fast semiconductor speeds (nanoseconds: ~10–50 ns).</td>
      <td>Slower access speeds (milliseconds for HDDs: ~5–12 ms; microseconds for SSDs).</td>
    </tr>
    <tr>
      <td><strong>Storage Capacity</strong></td>
      <td>Relatively limited (typically 8 GB to 64 GB in modern personal computers).</td>
      <td>Vastly larger capacities (typically 512 GB to 10+ Terabytes).</td>
    </tr>
    <tr>
      <td><strong>Cost per Byte</strong></td>
      <td>High cost per gigabyte.</td>
      <td>Extremely economical and low cost per gigabyte.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 9; Team Hadi Midterm File 3 Q18; CS101 MID by Attiq Kundi Page 25.',
    urdu_answer: 'مین میموری (RAM) عارضی اور انتہائی تیز ہوتی ہے جو کمپیوٹر بند ہونے پر ڈیٹا کھو دیتی ہے اور اس کی گنجائش محدود ہوتی ہے۔ جبکہ ماس اسٹوریج (ہارڈ ڈسک یا SSD) مستقل اور سستی ہوتی ہے جس میں کمپیوٹر بند ہونے کے بعد بھی بڑی مقدار میں ڈیٹا محفوظ رہتا ہے۔'
  },
  {
    stem: 'Define Access Time in the context of magnetic disk systems and state its two primary physical delay components.',
    correct: `<p><strong>Definition of Access Time:</strong></p>
<p>In a magnetic hard disk drive, <strong>Access Time</strong> is the total amount of mechanical delay elapsed between the moment the operating system requests a block of data and the moment the read/write head begins reading the first bit of that data.</p>

<p><strong>Two Main Components of Access Time:</strong></p>
<ol>
  <li><strong>Seek Time:</strong>
    <p>The time required for the mechanical actuator arm to physically move the read/write head radially across platters from its current cylinder to the target track containing the data.</p>
  </li>
  <li><strong>Rotational Delay (Rotational Latency):</strong>
    <p>The time spent waiting for the spinning disk platter to rotate the desired sector under the read/write head once the head has arrived at the correct track.</p>
  </li>
</ol>
<p>$$\\text{Access Time} = \\text{Seek Time} + \\text{Rotational Delay}$$</p>`,
    explanation: 'From CS101 Handouts Lecture 9; CS101 Quiz-1 2022 by VU Stars Q5; CS101 MID by Attiq Kundi Q29.',
    urdu_answer: 'ایکسس ٹائم (Access Time) وہ کل وقت ہے جو ہارڈ ڈسک سے ڈیٹا تلاش کرنے میں لگتا ہے۔ اس کے دو بنیادی حصے ہیں: 1. سیک ٹائم (ہیڈ کو ٹریک تک لے جانے کا وقت) اور 2. روٹیشنل ڈیلے (ڈسک کے گھوم کر مطلوبہ سیکٹر کو ہیڈ کے نیچے لانے کا وقت)۔'
  },
  {
    stem: 'How is data physically formatted and recorded differently on a Magnetic Hard Disk compared to an Optical CD-ROM?',
    correct: `<p><strong>Physical Formatting Comparison: Magnetic Disk vs. Optical CD-ROM:</strong></p>

<ol>
  <li><strong>Magnetic Hard Disk:</strong>
    <ul>
      <li>Data is organized into thousands of concentric, circular, non-intersecting rings called <strong>tracks</strong>.</li>
      <li>Each circular track is divided into uniform fixed-capacity segments called <strong>sectors</strong> (typically 512 bytes or 4 KB).</li>
      <li>Data is encoded magnetically by polarizing microscopic ferromagnetic particles on spinning metal or glass platters.</li>
    </ul>
  </li>
  <li><strong>Optical CD-ROM:</strong>
    <ul>
      <li>Data is arranged along a <strong>single, continuous spiral track</strong> that begins at the center clamp hole and winds outward to the rim (similar to a vinyl phonograph record).</li>
      <li>Data is recorded optically as physical microscopic indentations called <strong>pits</strong> and flat reflective spaces called <strong>lands</strong>, read by the reflection of an infrared laser beam.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 9; CS101 Grand Quiz For Mid Term Prepration by VU Stars Q28.',
    urdu_answer: 'ہارڈ ڈسک پر ڈیٹا الگ الگ گول دائروں (Concentric Tracks) اور سیکٹرز میں مقناطیسی طور پر محفوظ ہوتا ہے۔ جبکہ سی ڈی (CD-ROM) پر ڈیٹا ایک ہی مسلسل گھومنے والے اسپرل (Spiral) ٹریک پر لیزر کی مدد سے پٹس اور لینڈز (Pits and Lands) کی صورت میں محفوظ کیا جاتا ہے۔'
  },
  {
    stem: 'If the Seek Time of a hard disk read/write head is 8 milliseconds and the average Rotational Delay is 4 milliseconds, calculate the total Access Time required to locate a block of data on the disk.',
    correct: `<p><strong>Mathematical Calculation of Total Access Time:</strong></p>

<ol>
  <li><strong>Given Parameters:</strong>
    <ul>
      <li>\\(\\text{Seek Time} = 8\\text{ milliseconds (ms)}\\)</li>
      <li>\\(\\text{Average Rotational Delay} = 4\\text{ milliseconds (ms)}\\)</li>
    </ul>
  </li>
  <li><strong>Formula:</strong>
    <p>$$\\text{Access Time} = \\text{Seek Time} + \\text{Rotational Delay}$$</p>
  </li>
  <li><strong>Substitution and Calculation:</strong>
    <p>$$\\text{Access Time} = 8\\text{ ms} + 4\\text{ ms} = \\mathbf{12\\text{ ms}}$$</p>
  </li>
</ol>
<p><strong>Result:</strong> The total access time required to position the read/write head over the requested data block is <strong>12 milliseconds</strong>.</p>`,
    explanation: 'From CS101 Handouts Lecture 9; CS101 Quiz-1 2022 Q5; CS101 MID by Attiq Kundi Q29.',
    urdu_answer: 'فارمولا: Access Time = Seek Time + Rotational Delay۔ قیمتیں درج کرنے سے: 8 ms + 4 ms = 12 ms حاصل ہوتا ہے۔ پس کل ایکسس ٹائم 12 ملی سیکنڈ ہے۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Explain the physical architecture and electromechanical operation of Magnetic Hard Disk Drives (HDDs). Detail how data is structured into Platters, Tracks, Sectors, and Cylinders, and explain the performance metrics: Seek Time, Rotational Latency, and Transfer Rate.',
    correct: `<p><strong>1. Physical Architecture of a Hard Disk Drive (HDD):</strong></p>
<p>A hard disk drive is an electromechanical mass storage unit sealed inside an airtight enclosure. It contains several circular rigid aluminum or glass disks called <strong>platters</strong>, stacked on a central spindle motor that rotates continuously at high speeds (e.g., 5,400 to 15,000 RPM). Each platter surface is coated with a thin magnetic film.</p>

<p><strong>2. Logical Formatting Elements:</strong></p>
<ul>
  <li><strong>Tracks:</strong> Concentric circular rings on each platter surface where data is recorded magnetically.</li>
  <li><strong>Sectors:</strong> Fixed-size angular pie segments into which every track is subdivided, traditionally holding 512 bytes or 4,096 bytes (4 KB Advanced Format).</li>
  <li><strong>Cylinder:</strong> The set of all tracks residing at the exact same radial position across all platters and surfaces. Accessing an entire cylinder requires zero arm movement.</li>
  <li><strong>Read/Write Heads:</strong> Electromagnetic transducers suspended on aerodynamic actuator arms flying mere nanometers above the spinning platter surfaces.</li>
</ul>

<p><strong>3. Key Performance Parameters:</strong></p>
<ol>
  <li><strong>Seek Time:</strong> The mechanical time required for the actuator arm assembly to move the heads to the target cylinder/track (typically 4–10 ms).</li>
  <li><strong>Rotational Latency (Delay):</strong> The time waiting for the target sector to rotate underneath the head (on average, the time for half a revolution: ~4.17 ms at 7,200 RPM).</li>
  <li><strong>Access Time:</strong> The sum of seek time and rotational latency:
    <p>$$\\text{Access Time} = \\text{Seek Time} + \\text{Rotational Delay}$$</p>
  </li>
  <li><strong>Data Transfer Rate:</strong> The rate at which binary data is streamed from the spinning disk surface into the computer's system memory (typically 100 to 250 MB/s for modern HDDs).</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 9; CS101 past papers Fall 2009 s2 Q27; CS101 MID by Attiq Kundi Page 29.',
    urdu_answer: 'ہارڈ ڈسک میں تیز رفتار سے گھومنے والے پلیٹرز (Platters) ہوتے ہیں جن پر ڈیٹا ٹریکس، سیکٹرز اور سلنڈرز میں مقناطیسی طور پر لکھا جاتا ہے۔ ریڈ/رائٹ ہیڈ سیک ٹائم میں ٹریک تک پہنچتا ہے اور روٹیشنل ڈیلے میں سیکٹر اس کے نیچے آتا ہے، جس کے بعد ٹرانسفر ریٹ کے تحت ڈیٹا ریم میں منتقل ہوتا ہے۔'
  },
  {
    stem: 'Describe how an Operating System\'s File System and File Manager organize data on secondary storage. Explain the concepts of hierarchical directory structures (Tree Organization), Root Directory, Pathnames (Absolute vs. Relative), and the role of File Allocation tables.',
    correct: `<p><strong>1. Role of the File System and File Manager:</strong></p>
<p>Mass storage drives are physically organized as millions of unformatted raw sectors. The <strong>File Manager</strong> provides an abstraction layer that maps these raw sectors into user-friendly conceptual entities called <strong>files</strong> and <strong>directories (folders)</strong>.</p>

<p><strong>2. Hierarchical Tree Organization:</strong></p>
<ul>
  <li><strong>Root Directory:</strong> The foundational ancestor directory at the base of the file hierarchy (represented as <code>/</code> in Unix/Linux or <code>C:\\</code> in Windows).</li>
  <li><strong>Subdirectories:</strong> Directories nested inside other directories, branching downward like an inverted tree to allow intuitive categorical organization of documents.</li>
</ul>

<p><strong>3. File Pathnames:</strong></p>
<ol>
  <li><strong>Absolute Pathname:</strong> Specifies the complete, unambiguous location of a file starting from the root directory:
    <br><code>C:\\Users\\Student\\Documents\\CS101\\Assignment1.docx</code>
  </li>
  <li><strong>Relative Pathname:</strong> Specifies the location of a file relative to the user's current working directory (e.g., <code>Documents\\CS101\\Assignment1.docx</code>).</li>
</ol>

<p><strong>4. File Allocation Mechanism:</strong></p>
<p>Large files rarely fit in contiguous physical disk sectors. The file system maintains an allocation structure (such as the File Allocation Table - FAT, Master File Table - MFT in NTFS, or Inodes in ext4) that links together non-contiguous sectors/clusters across the drive, enabling seamless file retrieval while maximizing disk storage efficiency.</p>`,
    explanation: 'From CS101 Handouts Lecture 9; Cs101 latest solved midterm paper 10 Q19; CS101 MIDTERM SOLVED MCQS By JUNAID Q124.',
    urdu_answer: 'فائل سسٹم ہارڈ ڈسک کے کچے سیکٹرز کو منظم فائلوں اور فولڈرز میں تبدیل کرتا ہے۔ یہ نظام ایک الٹے درخت (Tree structure) کی طرح کام کرتا ہے جس کی بنیاد روٹ ڈائریکٹری (جیسے C:\\) ہوتی ہے جہاں سے سب فولڈرز شاخوں کی طرح نکلتے ہیں۔ فائل ایلوکیشن ٹیبل بکھرے ہوئے سیکٹرز کو باہم جوڑ کر مکمل فائل پڑھنے میں مدد دیتا ہے۔'
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
console.log(`CS101 Lecture 9 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

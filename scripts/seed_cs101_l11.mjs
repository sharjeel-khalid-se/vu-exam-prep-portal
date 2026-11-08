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

// 2. Create or fetch Lecture 11
let lec11 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 11").get(cs101.id);
if (!lec11) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 11, 'Process Management, Operating System Security, and Cryptography')
  `).run(cs101.id);
  lec11 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 11 with ID: ${lec11.id}`);
} else {
  console.log(`CS101 Lecture 11 found with ID: ${lec11.id}`);
}

const lId = lec11.id;

// 3. Clear existing questions for Lecture 11 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 11.`);

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
    stem: 'In operating system terminology, an active program that is currently loaded in memory and being executed by the CPU is called a:',
    options: {
      a: 'Process',
      b: 'Program',
      c: 'Batch Job',
      d: 'Subroutine'
    },
    correct: 'a',
    explanation: 'A program is a passive entity stored on disk, whereas a process is an active dynamic instance of a program in execution with assigned memory, registers, and program counter (CS101 Handouts Lecture 11). Appeared in 18+ midterm past papers.',
    urdu_answer: 'کمپیوٹر میں چلنے والے یا زیرِ عمل پروگرام کو پروسیس (Process) کہا جاتا ہے۔'
  },
  {
    stem: 'Which type of malicious software secretly monitors your computing activities, logs keystrokes, and forwards private data to external unauthorized third parties without your consent?',
    options: {
      a: 'Network Worm',
      b: 'Spyware',
      c: 'Boot Sector Virus',
      d: 'Trojan Horse'
    },
    correct: 'b',
    explanation: 'Spyware secretly infiltrates a system to harvest sensitive user information (passwords, banking credentials, browsing habits) and transmits it to unauthorized third parties (CS101 Handouts Lecture 11). Appeared in 15+ past papers.',
    urdu_answer: 'اسپائی ویئر (Spyware) وہ نقصان دہ سافٹ ویئر ہے جو صارف کی اجازت کے بغیر اس کی سرگرمیوں کا ڈیٹا چرا کر باہر کسی کو بھیجتا ہے۔'
  },
  {
    stem: 'A malicious program that enters and installs itself onto a computer system disguised as an attractive, legitimate, or desirable utility program is called a:',
    options: {
      a: 'Trojan Horse',
      b: 'Virus',
      c: 'Network Worm',
      d: 'Adware'
    },
    correct: 'a',
    explanation: 'Named after the mythological Trojan Horse, this malware masquerades as a benign application (like a game or utility) while secretly executing malicious payload operations in the background (CS101 Handouts Lecture 11). Appeared in 12+ past papers.',
    urdu_answer: 'ٹروجن ہارس (Trojan Horse) بظاہر ایک مفید یا دلکش پروگرام بن کر سسٹم میں داخل ہوتا ہے لیکن پس پردہ نقصان پہنچاتا ہے۔'
  },
  {
    stem: 'An uncontrolled, autonomous self-replication of program copies that rapidly spreads across computer networks and severely degrades legitimate system performance is characteristic of a:',
    options: {
      a: 'Virus',
      b: 'Worm',
      c: 'Trojan Horse',
      d: 'Spyware'
    },
    correct: 'b',
    explanation: 'Unlike viruses which require a host executable file, a Worm is a standalone self-replicating program that exploits network vulnerabilities to replicate autonomously across systems, consuming bandwidth and CPU power (CS101 Handouts Lecture 11). Appeared in 10+ past papers.',
    urdu_answer: 'وارم (Worm) ایک خودکار طریقے سے پھیلنے والا پروگرام ہے جو تیزی سے اپنی کاپیاں بنا کر نیٹ ورک اور کمپیوٹر کو سست کر دیتا ہے۔'
  },
  {
    stem: 'Which security software utility is specifically designed to scan storage media, detect the signatures of known malicious code, and eliminate viral infections?',
    options: {
      a: 'IP Spoofing tool',
      b: 'Spyware scanner',
      c: 'Antivirus software',
      d: 'Packet sniffer'
    },
    correct: 'c',
    explanation: 'Antivirus software monitors system memory and disk files, identifying malicious code signatures and behavioral heuristics to quarantine and neutralize infections (CS101 Handouts Lecture 11). Appeared in 14+ past papers.',
    urdu_answer: 'اینٹی وائرس (Antivirus) وہ سیکیورٹی سافٹ ویئر ہے جو وائرسز اور دیگر میلویئر کو پہچان کر ختم کرتا ہے۔'
  },
  {
    stem: 'Which of the following software applications is a legitimate defensive security tool and NOT classified as malware?',
    options: {
      a: 'Trojan Horses',
      b: 'Antivirus Program',
      c: 'Network Worms',
      d: 'Keylogger Spyware'
    },
    correct: 'b',
    explanation: 'Antivirus is a protective security tool, whereas Trojan Horses, Worms, and Spyware are all forms of malicious software (malware) (CS101 Handouts Lecture 11). Appeared in 8+ past papers.',
    urdu_answer: 'اینٹی وائرس ایک حفاظتی پروگرام ہے اور یہ کسی صورت میلویئر (Malware) نہیں ہے۔'
  },
  {
    stem: 'In asymmetric public-key cryptography, the sender of a confidential message encrypts the plaintext using the recipient\'s:',
    options: {
      a: 'Public Key',
      b: 'Private Key',
      c: 'Shared Session Key',
      d: 'Master Secret Key'
    },
    correct: 'a',
    explanation: 'In asymmetric encryption, anyone can encrypt a message using the recipient\'s openly distributed Public Key, but only the intended recipient possessing the corresponding matching Private Key can decrypt it (CS101 Handouts Lecture 11). Appeared in 9+ past papers.',
    urdu_answer: 'پبلک کی انکرپشن میں پیغام بھیجنے والا شخص وصول کنندہ کی پبلک کی (Public key) کا استعمال کر کے پیغام کو انکرپٹ کرتا ہے۔'
  },
  {
    stem: 'In asymmetric cryptography, which secret cryptographic key is strictly required to decrypt ciphertext that was encrypted with a user\'s public key?',
    options: {
      a: 'Public Key',
      b: 'Private Key',
      c: 'Shared Token',
      d: 'Symmetric Passphrase'
    },
    correct: 'b',
    explanation: 'A message encrypted with a public key can mathematically only be deciphered by the recipient holding the paired secret Private Key (CS101 Handouts Lecture 11). Appeared in 11+ past papers.',
    urdu_answer: 'پبلک کی سے انکرپٹ کیے گئے پیغام کو ڈی کرپٹ کرنے کے لیے وصول کنندہ کی خفیہ پرائیویٹ کی (Private key) درکار ہوتی ہے۔'
  },
  {
    stem: 'When a hardware interrupt signal occurs, the CPU switches into privileged kernel supervisor mode and automatically transfers execution control to the ________ within the operating system.',
    options: {
      a: 'Interrupt Handler (Interrupt Service Routine - ISR)',
      b: 'Long-term Job Scheduler',
      c: 'Thread Dispatcher',
      d: 'Virtual Memory Pager'
    },
    correct: 'a',
    explanation: 'The interrupt handler (ISR) is an operating system routine that immediately saves the current process state, handles the interrupting event (e.g., keyboard press, timer tick, disk read completion), and resumes normal execution (CS101 Handouts Lecture 11). Appeared in 10+ past papers.',
    urdu_answer: 'انٹرپٹ سگنل آنے پر پروسیسر آپریٹنگ سسٹم کے انٹرپٹ ہینڈلر (Interrupt handler) کو کنٹرول منتقل کر دیتا ہے۔'
  },
  {
    stem: 'In operating system process administration, the definitive action of prematurely terminating a process and removing its entry from the OS process table is referred to as ________ the process.',
    options: {
      a: 'Suspending',
      b: 'Killing',
      c: 'Swapping',
      d: 'Interrupting'
    },
    correct: 'b',
    explanation: 'Terminating a non-responsive, crashed, or unauthorized process and deallocating its process control block (PCB) from the process table is conventionally called "killing" the process (e.g., Unix kill command, Windows Task Manager End Task) (CS101 Handouts Lecture 11). Appeared in 7+ papers.',
    urdu_answer: 'کسی پروسیس کو زبردستی ختم کر کے پروسیس ٹیبل سے نکالنے کے عمل کو پروسیس کو Kill کرنا کہتے ہیں۔'
  },
  {
    stem: 'Which network security and prevention tool acts as an intermediary with a strong "filtering" connotation, screening client requests before fetching web pages?',
    options: {
      a: 'Proxy Server',
      b: 'Core Router',
      c: 'Default Gateway',
      d: 'Ethernet Switch'
    },
    correct: 'a',
    explanation: 'A proxy server acts as an intermediary between local client browsers and external servers, filtering unauthorized content, blocking malicious sites, and caching frequently accessed web pages (CS101 Handouts Lecture 11). Appeared in 6+ papers.',
    urdu_answer: 'پراکسی سرور (Proxy server) انٹرنیٹ اور کلائنٹ کے درمیان فلٹرنگ کا کام کرتا ہے تاکہ نقصان دہ مواد کو بلاک کیا جا سکے۔'
  },
  {
    stem: 'The operating system technique of buffering and holding output data (such as print jobs) in secondary mass storage until the slower destination device becomes ready to process it is known as:',
    options: {
      a: 'Paging',
      b: 'Spooling (Simultaneous Peripheral Operations On-Line)',
      c: 'Caching',
      d: 'Swapping'
    },
    correct: 'b',
    explanation: 'Spooling intercepts output data intended for slow peripheral devices (like printers) and stores it in a temporary disk queue so the CPU can immediately continue executing other tasks without waiting for the mechanical device (CS101 Handouts Lecture 11). Appeared in 5+ papers.',
    urdu_answer: 'آؤٹ پٹ ڈیٹا (جیسے پرنٹنگ) کو عارضی طور پر ڈسک پر قطار میں محفوظ رکھنے کے عمل کو اسپولنگ (Spooling) کہتے ہیں۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'What is the difference between a Computer Virus, a Worm, and a Trojan Horse? Compare their propagation methods and infection mechanisms.',
    correct: `<p><strong>Comparison: Virus vs. Worm vs. Trojan Horse:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Malware Type</th>
      <th>Host Requirement</th>
      <th>Propagation Method</th>
      <th>Primary Mechanism / Disguise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Virus</strong></td>
      <td><strong>Requires a Host File:</strong> Attaches its code to existing legitimate executable programs (<code>.exe</code>, <code>.doc</code>).</td>
      <td>Spreads only when the infected host program is executed or shared by a human user.</td>
      <td>Modifies host files and replicates when the infected file is opened.</td>
    </tr>
    <tr>
      <td><strong>Worm</strong></td>
      <td><strong>Standalone Program:</strong> Does not require an existing host program to attach itself to.</td>
      <td><strong>Autonomous:</strong> Spreads actively across networks by exploiting operating system vulnerabilities without human intervention.</td>
      <td>Massively self-replicates across networks, consuming bandwidth and exhausting system memory.</td>
    </tr>
    <tr>
      <td><strong>Trojan Horse</strong></td>
      <td><strong>Disguised Program:</strong> Appears as a useful, desirable, or legitimate program (e.g., game, utility).</td>
      <td>Does not replicate automatically; relies on tricking the user into downloading and installing it.</td>
      <td>Hides a malicious backdoor, spyware, or remote administration payload beneath its benign facade.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 11; CS101 MID by Attiq Kundi Q72 & Q86; cs101 solved past papers Page 134.',
    urdu_answer: 'وائرس کسی دوسری فائل کے ساتھ جڑ کر تب پھیلتا ہے جب صارف اسے چلائے۔ وارم خودکار طریقے سے انٹرنیٹ پر پھیل کر نیٹ ورک کو جام کرتا ہے۔ جبکہ ٹروجن ہارس ایک مفید پروگرام کا روپ دھار کر صارف کو دھوکہ دیتا ہے اور پس پردہ نقصان پہنچاتا ہے۔'
  },
  {
    stem: 'What is Public Key (Asymmetric) Encryption, and how does it fundamentally differ from Private Key (Symmetric) Decryption in secure communications?',
    correct: `<p><strong>Public Key (Asymmetric) Cryptography:</strong></p>
<p>Public Key Cryptography utilizes a mathematically linked pair of asymmetric cryptographic keys:</p>
<ul>
  <li><strong>Public Key:</strong> Distributed openly to anyone who wishes to send an encrypted message to the owner.</li>
  <li><strong>Private Key:</strong> Kept strictly confidential and secret by the owner.</li>
</ul>

<p><strong>Core Differences:</strong></p>
<ol>
  <li><strong>Key Asymmetry:</strong> A message encrypted using Alice's <em>Public Key</em> cannot be decrypted by that same public key; it can only be deciphered using Alice's private matching <em>Private Key</em>.</li>
  <li><strong>Solves Key Distribution Problem:</strong> Traditional symmetric encryption required both parties to securely share one identical secret key beforehand. Public-key encryption eliminates this vulnerability, as private keys are never transmitted over insecure networks.</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 11; CS101 MID Term by VU Stars Q27 & Q53; Attiq Kundi Q84 & Q92.',
    urdu_answer: 'پبلک کی انکرپشن میں چابیاں دو مختلف ہوتی ہیں: پبلک کی سب کے لیے دستیاب ہوتی ہے جس سے ڈیٹا انکرپٹ کیا جاتا ہے، جبکہ پرائیویٹ کی صرف وصول کنندہ کے پاس محفوظ ہوتی ہے جس کے بغیر پیغام ڈی کرپٹ نہیں ہو سکتا۔ اس سے خفیہ چابی کے چوری ہونے کا خطرہ ختم ہو جاتا ہے۔'
  },
  {
    stem: 'Define a Denial of Service (DoS) attack on a computer network. What is its ultimate objective, and what are its main phases?',
    correct: `<p><strong>Definition of a Denial of Service (DoS) Attack:</strong></p>
<p>A <strong>Denial of Service (DoS)</strong> attack is a malicious cyber-attack designed to overwhelm a target computer server, website, or network infrastructure with an avalanche of fraudulent requests, exhausting its CPU, memory, or network bandwidth so that legitimate users are completely denied service.</p>

<p><strong>Main Phases of a DoS / DDoS Attack:</strong></p>
<ol>
  <li><strong>Target Reconnaissance & Compromise (Botnet Recruitment):</strong> The attacker scans the internet for vulnerable computers/IoT devices and infects them with malware, creating an army of remotely controlled "zombie" computers (a <em>Botnet</em> in Distributed DoS).</li>
  <li><strong>Coordinated Attack Inundation:</strong> The master command server orders all zombie nodes to simultaneously flood the target IP address with immense volumes of bogus traffic (e.g., SYN floods, UDP packet floods, HTTP requests).</li>
  <li><strong>Service Collapse & Denial:</strong> The target server's connection buffers and network pipes become entirely saturated; legitimate client connection requests time out, causing the system to crash or freeze.</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 11; CS101 MID-Term by Attiq Kundi Page 23; cs101 midterm subjective by moaaz Page 1 Q28.',
    urdu_answer: 'ڈینائل آف سروس (DoS) اٹیک ایک ایسا حملہ ہے جس میں کسی ویب سرور کو اتنی زیادہ جعلی درخواستوں سے گھیر لیا جاتا ہے کہ اس کا سسٹم بیٹھ جائے اور اصل صارفین کے لیے ویب سائٹ یا سروس بند ہو جائے۔'
  },
  {
    stem: 'What is a Network Firewall? Explain how it protects a private computer system or enterprise network from external threats.',
    correct: `<p><strong>Definition of a Firewall:</strong></p>
<p>A <strong>Firewall</strong> is a dedicated network security barrier (implemented as software, hardware, or a combination of both) that monitors, inspects, and filters all incoming and outgoing network traffic based on a predefined set of security rules and policies.</p>

<p><strong>Protective Mechanisms:</strong></p>
<ul>
  <li><strong>Packet Filtering:</strong> Inspects individual data packets, checking source/destination IP addresses, protocol types, and port numbers. Packets originating from blacklisted or suspicious IP addresses are instantly dropped.</li>
  <li><strong>Port Blocking:</strong> Shuts down unused network ports to prevent unauthorized remote entry or port-scanning hackers.</li>
  <li><strong>Stateful Inspection & Intrusion Prevention:</strong> Tracks the active state of established connections, ensuring incoming packets correspond to legitimate requests initiated from inside the trusted local network.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 11; CS101 MID-Term by Attiq Kundi Page 24; Grand Quiz by VU Stars Q1.',
    urdu_answer: 'فائر وال (Firewall) ایک حفاظتی دیوار ہے جو کمپیوٹر یا نیٹ ورک میں آنے اور جانے والی تمام ٹریفک کی جانچ پڑتال کرتی ہے اور غیر مجاز داخلے، ہیکرز اور وائرسز کو روکتی ہے۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Explain the fundamental concepts of Process Management within a Multitasking Operating System. Discuss the lifecycle of process states, the role of the Process Table (PCB), CPU scheduling, and how hardware Interrupts and Interrupt Handlers enable preemptive multitasking.',
    correct: `<p><strong>1. The Concept of Process Management:</strong></p>
<p>In a modern operating system, multiple programs compete for CPU execution. A program stored passively on disk becomes an active <strong>Process</strong> when loaded into memory. The OS manages processes to ensure efficient CPU utilization and system responsiveness.</p>

<p><strong>2. Lifecycle of Process States:</strong></p>
<ul>
  <li><strong>Ready State:</strong> The process is loaded in memory and waiting in the ready queue for the OS scheduler to assign it CPU execution time.</li>
  <li><strong>Running State:</strong> The process instructions are currently being executed by the CPU.</li>
  <li><strong>Waiting / Blocked State:</strong> The process cannot continue until an external event or I/O operation (e.g., waiting for disk read or user keypress) completes.</li>
  <li><strong>Terminated (Killed) State:</strong> The process has completed execution or was aborted; the OS cleans up its allocated resources.</li>
</ul>

<p><strong>3. The Process Control Block (PCB) & Process Table:</strong></p>
<p>The OS maintains a centralized database called the <strong>Process Table</strong>. For each active process, it stores a <em>Process Control Block (PCB)</em> containing: unique Process ID (PID), current state, program counter (memory address of next instruction), CPU register values, memory allocations, and open file descriptors.</p>

<p><strong>4. Role of Interrupts and Interrupt Handlers in Preemption:</strong></p>
<ol>
  <li>To implement preemptive multitasking (where no single process monopolizes the CPU), the hardware timer periodically generates a hardware <strong>timer interrupt</strong>.</li>
  <li>The interrupt temporarily halts the currently running process and automatically switches the CPU into privileged supervisor mode.</li>
  <li>The OS <strong>Interrupt Handler</strong> executes a <strong>Context Switch</strong>: it saves the current register states into that process's PCB, invokes the CPU scheduler (using Round-Robin or Priority algorithms) to select the next ready process, loads that process's saved context, and resumes execution. This occurs hundreds of times per second, creating the smooth illusion of concurrent execution.</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 11; CS101 MID Term by VU Stars Q12, Q31, Q43; CS101 MIDTERM SOLVED MCQS By JUNAID Q127.',
    urdu_answer: 'آپریٹنگ سسٹم میں پروسیس مینجمنٹ بیک وقت کئی پروگرامز کو چلانے کا نظام ہے۔ ہر پروسیس Ready، Running اور Waiting حالتوں سے گزرتا ہے۔ پروسیس ٹیبل میں تمام پروسیسز کا ریکارڈ ہوتا ہے۔ ہارڈ ویئر انٹرپٹس کے ذریعے پروسیسر وقت کے چھوٹے چھوٹے حصوں (Time slices) میں مختلف پروسیسز کو باری باری چلا کر ملٹی ٹاسکنگ ممکن بناتا ہے۔'
  },
  {
    stem: 'Write a comprehensive review of modern Computer Security Threats and their Countermeasures. Discuss Viruses, Worms, Trojan Horses, Spyware, and Denial of Service (DoS) attacks, and detail the defense mechanisms provided by Antivirus software, Firewalls, Public/Private Key Cryptography, and Proxy Servers.',
    correct: `<p><strong>1. Overview of Common Security Threats:</strong></p>
<ul>
  <li><strong>Computer Viruses:</strong> Parasitic code that infects host executables, replicating when the infected file is run and causing data corruption or system instability.</li>
  <li><strong>Network Worms:</strong> Standalone programs that spread autonomously across networks by exploiting security flaws, rapidly consuming network bandwidth.</li>
  <li><strong>Trojan Horses:</strong> Malicious software disguised as legitimate applications, secretly creating backdoors for unauthorized remote control.</li>
  <li><strong>Spyware:</strong> Covert surveillance software that monitors user habits, logs keystrokes, and steals passwords and financial identities.</li>
  <li><strong>Denial of Service (DoS / DDoS):</strong> Flooding a target server with bogus traffic from distributed botnets to crash services and block legitimate users.</li>
</ul>

<p><strong>2. Defense and Countermeasure Mechanisms:</strong></p>
<ol>
  <li><strong>Antivirus & Anti-Malware Software:</strong> Employs signature scanning (matching known virus code patterns) and heuristic behavioral monitoring to detect, quarantine, and eliminate infections in real time.</li>
  <li><strong>Network Firewalls:</strong> Barrier systems that inspect all incoming and outgoing IP packets, blocking unauthorized network connections, restricting unused ports, and preventing unauthorized intrusions.</li>
  <li><strong>Public/Private Key Cryptography (Asymmetric Encryption):</strong> Mathematically secures sensitive data transmissions over public networks (HTTPS/SSL/TLS), ensuring confidentiality, message integrity, and sender authentication.</li>
  <li><strong>Proxy Servers:</strong> Intermediary servers that screen and filter outgoing web requests, shield internal client IP addresses, cache web resources, and block employee access to malicious or unapproved websites.</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 11; cs101 midterm subjective by moaaz Spring 2010 Q41; mega files Page 145 Q41.',
    urdu_answer: 'سیکیورٹی خطرات میں وائرسز، وارمز، ٹروجن ہارس، اسپائی ویئر اور ڈینائل آف سروس اٹیکس شامل ہیں۔ ان سے بچاؤ کے لیے اینٹی وائرس (فائلوں کی صفائی)، فائر وال (نیٹ ورک ٹریفک کی نگرانی)، پبلک و پرائیویٹ کی انکرپشن (ڈیٹا کی رازداری)، اور پراکسی سرورز (مواد کی فلٹرنگ) کا جامع حفاظتی نظام استعمال کیا جاتا ہے۔'
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
console.log(`CS101 Lecture 11 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

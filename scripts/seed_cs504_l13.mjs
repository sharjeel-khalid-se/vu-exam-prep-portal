import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate CS504
const cs504 = db.prepare("SELECT id FROM subjects WHERE slug = 'cs504'").get();
if (!cs504) {
  console.error('CS504 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 13
let lec13 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 13").get(cs504.id);
if (!lec13) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 13, 'Architectural Styles: Client-Server, Repository, N-Tier, Zero Install & Pipe and Filter')
  `).run(cs504.id);
  lec13 = { id: res.lastInsertRowid };
  console.log(`Created CS504 Lecture 13 with ID: ${lec13.id}`);
} else {
  console.log(`CS504 Lecture 13 already exists with ID: ${lec13.id}`);
}

const lId = lec13.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 13.`);

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

// 10 Past Paper MCQs
const mcqs = [
  {
    stem: 'Thin Client Model is one of the configurations of __________ Model.',
    options: {
      a: 'Data-centered',
      b: 'Client Server',
      c: 'Layered',
      d: 'Reference'
    },
    correct: 'b',
    explanation: 'In Client-Server architecture, the Thin Client model delegates application processing and data storage to the server machine, while the client simply handles presentation (CS504 Handouts Page 129).',
    urdu_answer: 'تھن کلائنٹ ماڈل کلائنٹ سرور آرکیٹیکچر کی ایک کنفیگریشن ہے۔'
  },
  {
    stem: 'Fat Client Model is one of the configurations of __________ Model.',
    options: {
      a: 'Data-centered',
      b: 'Layered',
      c: 'Reference',
      d: 'Client Server'
    },
    correct: 'd',
    explanation: 'The Fat Client model is a Client-Server configuration where business logic and data processing execute on the client workstation while data management remains on the server (CS504 Handouts Page 129).',
    urdu_answer: 'فیٹ کلائنٹ ماڈل کلائنٹ سرور آرکیٹیکچر کی ایک کنفیگریشن ہے۔'
  },
  {
    stem: 'What would be the most suitable architecture to develop a commercial web page to do business transactions over the internet?',
    options: {
      a: 'Client server model',
      b: 'Island model',
      c: 'RAD model',
      d: 'Repository model'
    },
    correct: 'a',
    explanation: 'The Client-Server architecture is standard for commercial internet transactions, allowing distributed client browsers to interact with centralized transaction servers and database engines securely (CS504 Handouts Page 129).',
    urdu_answer: 'انٹرنیٹ پر کمرشل کاروباری لین دین کے لیے کلائنٹ سرور ماڈل سب سے موزوں آرکیٹیکچر ہے۔'
  },
  {
    stem: 'N-tier architecture stems from the struggle to find a __________ between the fat-client architecture and the thin-client architecture.',
    options: {
      a: 'Concurrency',
      b: 'Distribution point',
      c: 'Middle ground',
      d: 'Similarity'
    },
    correct: 'c',
    explanation: 'N-Tier architecture emerged to strike a balanced middle ground between the maintenance bottlenecks of fat clients and the server processing overloads of thin clients (CS504 Handouts Page 131).',
    urdu_answer: 'این ٹائر آرکیٹیکچر فیٹ اور تھن کلائنٹ کے درمیان درمیانی راستہ (middle ground) تلاش کرنے سے وجود میں آیا۔'
  },
  {
    stem: 'In the N-Tier Architecture, the idea is to enhance scalability and __________ by distributing both the data and the application using multiple server machines.',
    options: {
      a: 'Usability',
      b: 'Performance',
      c: 'Interoperability',
      d: 'Integrity'
    },
    correct: 'b',
    explanation: 'By isolating presentation, business logic, and database services across dedicated server tiers, N-Tier architecture significantly enhances performance and horizontal scalability (CS504 Handouts Page 131).',
    urdu_answer: 'این ٹائر آرکیٹیکچر میں ایپلیکیشن اور ڈیٹا کو مختلف سرورز پر تقسیم کر کے اسکیلیبلٹی اور کارکردگی (Performance) کو بڑھایا جاتا ہے۔'
  },
  {
    stem: 'Repository model also provides the __________ view of the system.',
    options: {
      a: 'Global',
      b: 'Local',
      c: 'General',
      d: 'Private'
    },
    correct: 'a',
    explanation: "The Repository (Data-Centered) model establishes a centralized shared data store that provides all participating subsystems with a unified, global view of the system's data state (CS504 Handouts Page 130).",
    urdu_answer: 'ریپازیٹری ماڈل سسٹم کو گلوبل (Global) ویو فراہم کرتا ہے۔'
  },
  {
    stem: 'When large amount of data is to be shared, repository model is used. This model has been extensively used in the __________ based application.',
    options: {
      a: 'Mainframe',
      b: 'Super Computers',
      c: 'Personal Computers',
      d: 'Real time'
    },
    correct: 'a',
    explanation: 'Due to centralized data management and transaction processing capabilities, the Repository pattern has been extensively deployed in mainframe-based enterprise systems, CASE tools, and compiler suites (CS504 Handouts Page 130).',
    urdu_answer: 'بڑی مقدار میں ڈیٹا شیئر کرنے کے لیے ریپازیٹری ماڈل مین فریم (Mainframe) سسٹمز میں کثرت سے استعمال ہوتا ہے۔'
  },
  {
    stem: 'Idea of zero install architecture is to develop a system where no installation on the __________ is needed.',
    options: {
      a: 'Client side',
      b: 'Server side',
      c: 'Client & Server side',
      d: 'Network'
    },
    correct: 'a',
    explanation: 'Zero Install Architecture leverages standard web browsers as universal runtimes, eliminating any client-side software installation, setup, or manual desktop configuration (CS504 Handouts Page 133).',
    urdu_answer: 'زیرو انسٹال آرکیٹیکچر کا مقصد یہ ہے کہ کلائنٹ سائیڈ پر کسی قسم کی انسٹالیشن کی ضرورت نہ پڑے۔'
  },
  {
    stem: 'In Pipes and Filters architecture, each processing step is called a __________ and the connecting link from one process to another is called a __________.',
    options: {
      a: 'Filter & Pipe',
      b: 'Pipe & Filter',
      c: 'Process & Data',
      d: 'Node & Link'
    },
    correct: 'a',
    explanation: 'In the Pipe-and-Filter architectural style, computational components that transform data streams are termed Filters, and unidirectional communication conduits transferring streams are called Pipes (CS504 Handouts Page 132).',
    urdu_answer: 'پائپ اینڈ فلٹر میں پراسیسنگ سٹیپ کو فلٹر (Filter) اور کنیکٹنگ لنک کو پائپ (Pipe) کہتے ہیں۔'
  },
  {
    stem: 'The clients and servers, in a client server environment, are connected through __________.',
    options: {
      a: 'Framework',
      b: 'Interface',
      c: 'Middleware',
      d: 'Groupware'
    },
    correct: 'c',
    explanation: 'Middleware represents the software glue (protocols, RPC, message brokers, ORBs) that enables heterogeneous clients and distributed servers to communicate transparently over networks (CS504 Handouts Page 129).',
    urdu_answer: 'کلائنٹ اور سرور کے درمیان رابطے اور کمیونیکیشن کے لیے مڈل ویئر (Middleware) کا استعمال ہوتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs for Lecture 13.`);

// 3 Short Questions
const shorts = [
  {
    stem: 'Differentiate between Thin Client and Fat Client Models in Client-Server Architecture.',
    correct: `<p><strong>Comparison: Thin Client vs. Fat Client Architecture (CS504 Handouts Page 129):</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-2">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Parameter</th>
      <th class="p-2 border">Thin Client Model</th>
      <th class="p-2 border">Fat (Thick) Client Model</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Processing Division</td>
      <td class="p-2 border">Client handles only the <strong>presentation layer</strong> (UI); all application processing and data storage reside on the server.</td>
      <td class="p-2 border">Client handles presentation <em>and</em> heavy <strong>business logic processing</strong>; server only manages data storage.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Hardware Requirements</td>
      <td class="p-2 border">Lightweight hardware / web browser; minimal RAM and CPU needed on client machines.</td>
      <td class="p-2 border">Powerful client PCs with high memory and processing capacity required.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Deployment &amp; Maintenance</td>
      <td class="p-2 border">Very easy; software is updated centrally on the server with zero client re-installation.</td>
      <td class="p-2 border">Complex; software updates must be deployed and re-configured on every individual user machine.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Thin clients centralize processing on servers for easy maintenance, whereas fat clients run business logic on client machines reducing server load.',
    urdu_answer: 'تھن کلائنٹ میں پروسیسنگ سرور پر ہوتی ہے جس سے مینٹیننس آسان ہوتی ہے، جبکہ فیٹ کلائنٹ میں بزنس لاجک کلائنٹ کی مشین پر چلتی ہے۔'
  },
  {
    stem: 'What is Zero Install Architecture? What is its main advantage regarding software deployment and updates?',
    correct: `<p><strong>1. Concept of Zero Install Architecture (CS504 Handouts Page 133):</strong></p>
<p>Zero Install Architecture is a deployment paradigm where an enterprise software system runs entirely within standard web browsers (or generic runtime shells) without requiring users to download, install, compile, or configure any native software on the client workstation.</p>

<p><strong>2. Main Advantages Regarding Deployment &amp; Updates:</strong></p>
<ul>
  <li><strong>Instant Centralized Updates:</strong> When a software bug is fixed or a new feature is launched, developers deploy the update once to the central web server. Every user instantly receives the latest version upon next page reload without manual patching.</li>
  <li><strong>Zero Desktop Administration:</strong> Completely eliminates client-side DLL conflicts, operating system incompatibilities, and high technical support overhead.</li>
  <li><strong>Cross-Platform Accessibility:</strong> Users can securely access the application from any operating system (Windows, macOS, Linux, or mobile devices) equipped with a web browser.</li>
</ul>`,
    explanation: 'Zero Install Architecture utilizes browser runtimes so software changes are deployed centrally on the server without modifying client workstations.',
    urdu_answer: 'زیرو انسٹال آرکیٹیکچر براؤزر کے ذریعے چلتا ہے جس میں کلائنٹ کے کمپیوٹر پر کوئی سافٹ ویئر انسٹال نہیں کرنا پڑتا اور سرور پر ایک ہی اپ ڈیٹ تمام صارفین تک فوری پہنچ جاتی ہے۔'
  },
  {
    stem: 'Define Pipe and Filter (Data Flow) Architectural Style.',
    correct: `<p><strong>Pipe and Filter Architectural Style (CS504 Handouts Page 132):</strong></p>
<p>The Pipe and Filter style is a data-driven architectural pattern where a stream of continuous data is processed by a sequence of independent transformations.</p>

<p><strong>Core Structural Elements:</strong></p>
<ul>
  <li><strong>Filter:</strong> An autonomous data processing component that reads incoming data from an input pipe, executes an internal transformation or enrichment step, and writes the output stream to an outgoing pipe. Filters operate independently without knowing upstream or downstream neighbors.</li>
  <li><strong>Pipe:</strong> A unidirectional communication conduit or buffer that transfers data streams from the output of one filter to the input of another filter.</li>
</ul>
<p><strong>Classical Examples:</strong> Unix shell command pipelines (e.g., <code>cat file.txt | grep "error" | sort | uniq</code>), image processing graphics pipelines, and compiler stages (Lexical $\\rightarrow$ Syntactic $\\rightarrow$ Semantic $\\rightarrow$ Code Generation).</p>`,
    explanation: 'The Pipe and Filter pattern processes continuous data streams through independent modular filters connected by unidirectional data pipes.',
    urdu_answer: 'پائپ اینڈ فلٹر آرکیٹیکچر میں ڈیٹا کے بہاؤ کو آزاد فلٹرز کے ذریعے پروسیس کیا جاتا ہے جو پائپوں کے ذریعے باہم جڑے ہوتے ہیں، جیسا کہ یونکس کمانڈ پائپ لائنز۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions for Lecture 13.`);

// 2 Long Questions
const longs = [
  {
    stem: 'Explain the Repository (Data-Centered) Architectural Model. Discuss its key advantages and disadvantages when sharing large amounts of data among subsystems.',
    correct: `<p><strong>1. Concept of the Repository (Data-Centered) Model:</strong></p>
<p>In a Repository architectural style, all shared persistent data is stored in a centralized data store (the <strong>Repository</strong>), which is accessed and manipulated by multiple independent computational components or subsystems (CS504 Handouts Page 130).</p>

<p><strong>2. Key Architectural Advantages:</strong></p>
<ul>
  <li><strong>Global Cohesive View:</strong> Provides a single, authoritative global view of system data, guaranteeing consistent state across all participating tools.</li>
  <li><strong>Efficient Large-Scale Data Sharing:</strong> Subsystems do not need to transmit massive datasets to one another directly; data is deposited in the central repository and accessed on demand.</li>
  <li><strong>Subsystem Decoupling:</strong> Subsystems remain independent of one another. New analysis, reporting, or transformation tools can be plugged into the repository without modifying existing subsystems.</li>
  <li><strong>Centralized Security &amp; Backups:</strong> Concurrency control, access security, backup policies, and disaster recovery mechanisms are implemented centrally in the repository engine.</li>
</ul>

<p><strong>3. Key Architectural Disadvantages:</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Disadvantage</th>
      <th class="p-2 border">Architectural Implication</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Single Point of Failure (SPOF)</td>
      <td class="p-2 border">If the central repository database fails or is corrupted, all dependent subsystems become completely paralyzed.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Performance Bottleneck</td>
      <td class="p-2 border">High concurrent data read/write requests from multiple subsystems can congest repository I/O and lock critical tables.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Rigid Data Schema Coupling</td>
      <td class="p-2 border">Modifying the repository's central data schema requires costly retrofitting and re-testing across every single participating tool.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'The Repository model centralizes data for seamless sharing and subsystem independence, but risks single-point-of-failure and database schema coupling.',
    urdu_answer: 'ریپازیٹری ماڈل ڈیٹا کو مرکزی جگہ پر محفوظ کر کے تمام سب سسٹمز کے درمیان شیئر کرتا ہے، لیکن مرکزی ڈیٹا بیس خراب ہونے سے پورا سسٹم رک سکتا ہے۔'
  },
  {
    stem: 'Describe Client-Server Architecture and compare 2-Tier Architecture vs 3-Tier / N-Tier Architecture. How does N-Tier architecture enhance system performance and scalability?',
    correct: `<p><strong>1. Foundation of Client-Server Architecture (CS504 Handouts Pages 129–131):</strong></p>
<p>Client-Server architecture distributes computing tasks between <strong>Service Requesters (Clients)</strong> and <strong>Service Providers (Servers)</strong> connected over a network protocol. Systems are structurally organized into tiers based on where Presentation, Business Processing, and Data Management reside.</p>

<p><strong>2. Comparative Structural Matrix: 2-Tier vs. 3-Tier / N-Tier Architecture:</strong></p>
<table class="border border-slate-300 w-full text-xs text-left mb-3">
  <thead class="bg-slate-100">
    <tr>
      <th class="p-2 border">Architectural Characteristic</th>
      <th class="p-2 border">2-Tier Architecture (Client + Database)</th>
      <th class="p-2 border">3-Tier / N-Tier Architecture</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border font-bold">Structural Layers</td>
      <td class="p-2 border">Client (UI + Logic) directly talks to the Database server.</td>
      <td class="p-2 border">Presentation Tier $\\rightarrow$ Application / Logic Tier(s) $\\rightarrow$ Database Tier.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Business Logic Placement</td>
      <td class="p-2 border">Tightly coupled inside client desktop software or embedded database stored procedures.</td>
      <td class="p-2 border">Isolated within an independent application server tier (e.g., Spring, Express, .NET).</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Database Connections</td>
      <td class="p-2 border">Every active client maintains a dedicated open socket connection to the database.</td>
      <td class="p-2 border">The application tier pools database connections, serving thousands of clients via a few DB links.</td>
    </tr>
    <tr>
      <td class="p-2 border font-bold">Scalability Limit</td>
      <td class="p-2 border">Poor; typically chokes when concurrent client connections exceed a few hundred.</td>
      <td class="p-2 border">High; application servers can horizontally scale behind load balancers to serve millions.</td>
    </tr>
  </tbody>
</table>

<p><strong>3. How N-Tier Enhances Performance and Scalability:</strong></p>
<ol class="list-decimal pl-5 space-y-1.5">
  <li><strong>Horizontal Scalability:</strong> Independent application server nodes can be spun up or down dynamically behind a load balancer without touching the database.</li>
  <li><strong>Connection Pooling &amp; Caching:</strong> Middle-tier application servers implement in-memory caches (e.g., Redis) and pooled DB connections, drastically reducing database load.</li>
  <li><strong>Decoupled Evolution:</strong> User interfaces can be updated (e.g., new mobile app or web portal) without re-engineering core business validation rules or database schemas.</li>
</ol>`,
    explanation: 'N-Tier architecture decouples presentation, business logic, and database storage into distinct server layers, enabling horizontal scaling, connection pooling, and high concurrent performance.',
    urdu_answer: 'این ٹائر آرکیٹیکچر پریزنٹیشن، بزنس لاجک اور ڈیٹا بیس کو الگ الگ سرورز پر تقسیم کرتا ہے جس سے کنکشن پولنگ، کیشنگ اور لوڈ بیلنسنگ کے ذریعے پرفارمنس اور اسکیلیبلٹی بہت زیادہ بڑھ جاتی ہے۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long Questions for Lecture 13.`);

const count = db.prepare("SELECT count(*) as count FROM questions WHERE lecture_id = ?").get(lId);
console.log(`Successfully verified ${count.count} total questions for CS504 Lecture 13.`);

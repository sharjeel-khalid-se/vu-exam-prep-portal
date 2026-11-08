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

// 2. Create or fetch Lecture 10
let lec10 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 10").get(cs101.id);
if (!lec10) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 10, 'Data Communications, Computer Networks, Topologies, and Protocols')
  `).run(cs101.id);
  lec10 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 10 with ID: ${lec10.id}`);
} else {
  console.log(`CS101 Lecture 10 found with ID: ${lec10.id}`);
}

const lId = lec10.id;

// 3. Clear existing questions for Lecture 10 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 10.`);

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
    stem: 'Traditional Ethernet networks arranged in a shared Bus topology make use of which media access control protocol to manage transmission collisions?',
    options: {
      a: 'CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)',
      b: 'CSMA/CE (Collision Elimination)',
      c: 'CSMA/CD (Carrier Sense Multiple Access with Collision Detection)',
      d: 'CSMA/AC (Collision Arbitration)'
    },
    correct: 'c',
    explanation: 'In wired Ethernet bus networks, nodes listen to the carrier bus before transmitting (Carrier Sense), transmit simultaneously if idle (Multiple Access), and immediately abort and back off if electrical collisions are detected (Collision Detection) (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'ایتھرنیٹ پر مبنی بس ٹوپولوجی میں ٹکراؤ کی روک تھام کے لیے CSMA/CD (کولیژن ڈیٹیکشن) پروٹوکول استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'Which media access control protocol is specifically engineered for Wireless local area networks (Wi-Fi star topologies) where physical collision detection is technically unfeasible?',
    options: {
      a: 'CSMA/CD',
      b: 'CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)',
      c: 'ALOHA random access',
      d: 'Token Ring deterministic access'
    },
    correct: 'b',
    explanation: 'Because wireless radio transceivers cannot transmit and listen for incoming collisions simultaneously on the same channel, wireless networks use Collision Avoidance (CSMA/CA) with ready-to-send/clear-to-send handshakes (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'وائرلیس اسٹار نیٹ ورکس میں ٹکراؤ سے بچاؤ کے لیے CSMA/CA (کولیژن اوائڈنس) پروٹوکول استعمال ہوتا ہے۔'
  },
  {
    stem: 'A network communication protocol is fundamentally defined as a/an:',
    options: {
      a: 'Set of protocols bundled together',
      b: 'Formal set of rules and conventions that govern the reliable exchange of data across a network',
      c: 'Electronic hardware switching device',
      d: 'Set of database query methods'
    },
    correct: 'b',
    explanation: 'A communication protocol is a standardized set of rules and message formats governing how data is packetized, transmitted, received, and acknowledged across computer networks (CS101 Handouts Lecture 10). Appeared in 15+ past papers.',
    urdu_answer: 'کمیونیکیشن پروٹوکول دراصل اصولوں اور ضوابط کا ایک مجموعہ (Set of rules) ہے جو نیٹ ورک پر ڈیٹا کے تبادلے کو کنٹرول کرتا ہے۔'
  },
  {
    stem: 'Which classification of computer networks spans large geographical distances across cities, countries, or the entire globe?',
    options: {
      a: 'Local Area Network (LAN)',
      b: 'Wide Area Network (WAN)',
      c: 'Metropolitan Area Network (MAN)',
      d: 'Personal Area Network (PAN)'
    },
    correct: 'b',
    explanation: 'A Wide Area Network (WAN), exemplified by the global Internet, interconnects distributed computers and LANs across vast regional, continental, or global geographic boundaries (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'وسیع جغرافیائی حدود، ممالک یا دنیا بھر پر محیط کمپیوٹر نیٹ ورک کو WAN (وائیڈ ایریا نیٹ ورک) کہتے ہیں۔'
  },
  {
    stem: 'A specialized network node or inter-network device that serves as the entry and exit boundary point linking two disparate networks (or providing local LAN access to the global Internet) is called a:',
    options: {
      a: 'Hub',
      b: 'Workstation Node',
      c: 'Gateway',
      d: 'Passive Repeater'
    },
    correct: 'c',
    explanation: 'A Gateway acts as an entrance and translation conduit between different network architectures, commonly interfacing a local enterprise network to the external public Internet (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'وہ انٹرنیٹ ورکنگ ڈیوائس جو دو مختلف نیٹ ورکس کے درمیان پل کا کام کرتی ہے اور انٹرنیٹ کنکشن فراہم کرتی ہے، گیٹ وے (Gateway) کہلاتی ہے۔'
  },
  {
    stem: 'Which Transport Layer protocol establishes a reliable, connection-oriented virtual circuit via a three-way handshake before transmitting messages?',
    options: {
      a: 'HTTP',
      b: 'SMTP',
      c: 'Transmission Control Protocol (TCP)',
      d: 'User Datagram Protocol (UDP)'
    },
    correct: 'c',
    explanation: 'TCP (Transmission Control Protocol) is a reliable, connection-oriented transport protocol that guarantees error-free in-order delivery of data packets (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'ٹی سی پی (TCP) ایک کنکشن اورینٹڈ ٹرانسپورٹ پروٹوکول ہے جو ڈیٹا بھیجنے سے پہلے باقاعدہ کنکشن قائم کرتا ہے۔'
  },
  {
    stem: 'In the standard TCP/IP network protocol stack, what is the correct top-to-bottom sequence of layers through which an outgoing message flows on the SENDER side?',
    options: {
      a: 'Application Layer -> Transport Layer -> Network (Internet) Layer -> Link (Network Interface) Layer',
      b: 'Network Layer -> Link Layer -> Transport Layer -> Application Layer',
      c: 'Application Layer -> Link Layer -> Network Layer -> Transport Layer',
      d: 'Link Layer -> Network Layer -> Transport Layer -> Application Layer'
    },
    correct: 'a',
    explanation: 'At the sender side, data originates at the Application Layer (HTTP/SMTP), moves down to Transport (TCP), down to Network (IP routing), and finally to Link/Physical layer (Ethernet/Wi-Fi frames) (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'بھیجنے والے (Sender) کی طرف نیٹ ورک لیئرز کا درست تسلسل: ایپلی کیشن لیئر -> ٹرانسپورٹ لیئر -> نیٹ ورک لیئر -> لنک لیئر ہے۔'
  },
  {
    stem: 'The interconnection of multiple distinct computer networks to form a unified heterogeneous "internet" is handled by intelligent Layer-3 devices known as:',
    options: {
      a: 'Routers',
      b: 'Passive Hubs',
      c: 'Gateways only',
      d: 'Network Bridges'
    },
    correct: 'a',
    explanation: 'Routers inspect IP destination addresses and route packets across diverse interconnected networks to construct an internet (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'مختلف نیٹ ورکس کو باہم ملا کر انٹرنیٹ بنانے کے لیے روٹرز (Routers) کا استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'In traditional bus-wired network segments, physical hardware Repeaters are deployed to regenerate and pass electrical signals between:',
    options: {
      a: 'Two original bus segments (extending the maximum cable distance)',
      b: 'Two original ring networks',
      c: 'Two satellite downlinks',
      d: 'Two optical lasers'
    },
    correct: 'a',
    explanation: 'A repeater operates at the physical layer, amplifying and reconditioning weak electrical signals to bridge two original bus cable segments and defeat signal attenuation (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'ریپیٹرز (Repeaters) سگنلز کو ایمپلیفائی کر کے دو بس سیگمنٹس (Two original buses) کے درمیان سگنل کو آگے بڑھاتے ہیں۔'
  },
  {
    stem: 'Modern Voice over IP (VoIP) telecommunication systems often allow two distinct host machines to stream real-time audio data directly to each other using the ________ architecture.',
    options: {
      a: 'Client-Server model',
      b: 'Peer-to-Peer (P2P) model',
      c: 'Master-Slave model',
      d: 'Mainframe-Terminal model'
    },
    correct: 'b',
    explanation: 'VoIP applications frequently adopt a Peer-to-Peer (P2P) architecture where end-user workstations communicate directly with equal authority to exchange voice packets without routing continuous audio through a central server (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'وائس اوور آئی پی (VoIP) میں دو مشینیں عام طور پر پیئر ٹو پیئر (P2P) ماڈل کے تحت براہ راست آڈیو کا تبادلہ کرتی ہیں۔'
  },
  {
    stem: 'In network architectures, the computer terminal or program that initiates communication and requests services or resources is called the:',
    options: {
      a: 'Server',
      b: 'Client',
      c: 'Router',
      d: 'Gateway host'
    },
    correct: 'b',
    explanation: 'A client requests data or services (e.g., a web browser requesting a web page), while the server listens for, processes, and fulfills client requests (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'وہ کمپیوٹر یا پروگرام جو نیٹ ورک پر سروسز حاصل کرنے کی درخواست بھیجتا ہے، کلائنٹ (Client) کہلاتا ہے۔'
  },
  {
    stem: 'Each network router maintains an internal dynamic database called a ________ that contains topological knowledge regarding which outgoing network interface a packet must be directed toward.',
    options: {
      a: 'Process Execution Table',
      b: 'Forwarding Table (Routing Table)',
      c: 'Routing Index Directory',
      d: 'MAC Address Cache'
    },
    correct: 'b',
    explanation: 'Routers use forwarding (routing) tables containing network destination IP prefixes and next-hop router addresses to forward incoming packets toward their destination (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'ہر روٹر اپنے پاس ایک فارورڈنگ ٹیبل (Forwarding table) رکھتا ہے جس کی مدد سے وہ طے کرتا ہے کہ ڈیٹا پیکٹ کو کس راستے پر آگے بھیجنا ہے۔'
  },
  {
    stem: 'Because email transmission is not strictly real-time and tolerates minor delivery queuing, mail servers universally utilize the ________ protocol to transmit messages across the Internet.',
    options: {
      a: 'HTTP',
      b: 'Simple Mail Transfer Protocol (SMTP)',
      c: 'File Transfer Protocol (FTP)',
      d: 'Post Office Protocol (POP3)'
    },
    correct: 'b',
    explanation: 'SMTP (Simple Mail Transfer Protocol) is the standard TCP/IP application protocol used for transmitting outgoing emails reliably between mail transfer agents (MTAs) (CS101 Handouts Lecture 10). Appeared in multiple past papers.',
    urdu_answer: 'میل سرورز کے درمیان ای میلز کی ترسیل کے لیے SMTP (سمپل میل ٹرانسفر پروٹوکول) استعمال کیا جاتا ہے۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'What does the networking acronym WAN stand for? Define its core purpose, characteristics, and provide one prominent example.',
    correct: `<p><strong>Definition of WAN (Wide Area Network):</strong></p>
<p><strong>WAN</strong> stands for <strong>Wide Area Network</strong>. It is a telecommunications or computer network that extends over a vast, geographically dispersed area, connecting computers and local area networks across cities, provinces, countries, or whole continents.</p>

<p><strong>Key Characteristics:</strong></p>
<ul>
  <li>Utilizes public telecommunications infrastructure, leased telephone circuits, fiber-optic undersea cables, microwave towers, and communication satellites.</li>
  <li>Characterized by lower bandwidth and higher latency compared to localized private LANs.</li>
  <li><strong>Prominent Example:</strong> The global <strong>Internet</strong> is the world's largest and most famous Wide Area Network.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 10; cs101 midterm subjective by moaaz Page 1.',
    urdu_answer: 'WAN کا مخفف Wide Area Network ہے۔ یہ ایک ایسا نیٹ ورک ہے جو دور دراز کے شہروں، ممالک اور براعظموں تک پھیلا ہوتا ہے۔ انٹرنیٹ دنیا کا سب سے بڑا اور معروف WAN نیٹ ورک ہے۔'
  },
  {
    stem: 'Why is a central Hub used in legacy computer networks, and what is its primary operational limitation compared to modern intelligent switches?',
    correct: `<p><strong>Purpose of a Network Hub:</strong></p>
<p>A <strong>Hub</strong> is a central physical-layer (Layer 1) connectivity device used to connect multiple computers in a star topology, joining their individual network cables into a unified physical segment.</p>

<p><strong>Operational Limitation:</strong></p>
<ul>
  <li><strong>Passive Broadcasting:</strong> A hub has no intelligence or MAC address awareness. When an electrical data packet arrives at one port, the hub blindly regenerates and broadcasts the packet out to <em>all other connected ports</em>.</li>
  <li><strong>Collision Domain & Bandwidth Bottleneck:</strong> All connected computers share a single collision domain, creating severe network congestion and security vulnerabilities as unconcerned nodes receive traffic meant for others. Modern Layer-2 <strong>Switches</strong> have completely replaced hubs by forwarding frames directly to the intended destination port only.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 10; cs101 midterm subjective by moaaz Q33; mega files Q34.',
    urdu_answer: 'ہب (Hub) اسٹار ٹوپولوجی میں تمام کمپیوٹرز کی تاروں کو ایک جگہ جوڑنے کے لیے استعمال ہوتا تھا۔ اس کی بڑی خامی یہ ہے کہ یہ ڈیٹا صرف مطلوبہ کمپیوٹر کو بھیجنے کے بجائے تمام کمپیوٹرز کو بلا تفریق براڈکاسٹ کر دیتا ہے جس سے ٹکراؤ اور سست روی پیدا ہوتی ہے۔'
  },
  {
    stem: 'Differentiate between the Client-Server network architecture and the Peer-to-Peer (P2P) network architecture.',
    correct: `<p><strong>Comparison: Client-Server vs. Peer-to-Peer (P2P):</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Feature</th>
      <th>Client-Server Architecture</th>
      <th>Peer-to-Peer (P2P) Architecture</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Centralization</strong></td>
      <td><strong>Centralized:</strong> Dedicated high-performance servers host resources; client workstations request services.</td>
      <td><strong>Decentralized:</strong> Every workstation (peer) has equal status and privileges; no centralized dedicated server.</td>
    </tr>
    <tr>
      <td><strong>Role of Nodes</strong></td>
      <td>Roles are strictly partitioned: Clients consume; Servers provide.</td>
      <td>Every node acts as both a consumer (client) and provider (server) simultaneously.</td>
    </tr>
    <tr>
      <td><strong>Single Point of Failure</strong></td>
      <td>If the central server goes down, the entire network service becomes unavailable.</td>
      <td>Highly resilient; failure of individual peers does not disrupt the network.</td>
    </tr>
    <tr>
      <td><strong>Examples</strong></td>
      <td>World Wide Web (Web Browsers requesting Apache servers), corporate email systems.</td>
      <td>BitTorrent file sharing, Skype/VoIP telephony, Blockchain networks.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 10; CS101 MID Term by VU Stars Q47.',
    urdu_answer: 'کلائنٹ سرور ماڈل میں ایک مرکزی طاقتور سرور ہوتا ہے جو تمام کلائنٹس کو معلومات فراہم کرتا ہے (جیسے ویب سائٹس)۔ جبکہ پیئر ٹو پیئر (P2P) ماڈل میں تمام کمپیوٹرز برابر کے اختیارات رکھتے ہیں اور بغیر کسی مرکزی سرور کے آپس میں براہ راست فائلوں کا تبادلہ کرتے ہیں۔'
  },
  {
    stem: 'What is the operational difference between a Network Bridge and a Router in computer communications?',
    correct: `<p><strong>Comparison: Bridge vs. Router:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Criterion</th>
      <th>Network Bridge</th>
      <th>Network Router</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>OSI Layer</strong></td>
      <td>Operates at the <strong>Data Link Layer (Layer 2)</strong>.</td>
      <td>Operates at the <strong>Network Layer (Layer 3)</strong>.</td>
    </tr>
    <tr>
      <td><strong>Addressing Used</strong></td>
      <td>Inspects physical <strong>MAC hardware addresses</strong> to filter traffic.</td>
      <td>Inspects logical <strong>IP addresses</strong> to make intelligent routing decisions.</td>
    </tr>
    <tr>
      <td><strong>Network Scope</strong></td>
      <td>Connects two similar segments of the <em>same local network (LAN)</em> to segment traffic.</td>
      <td>Connects completely different, heterogeneous networks to construct an <em>internetwork (WAN)</em>.</td>
    </tr>
    <tr>
      <td><strong>Protocol Dependency</strong></td>
      <td>Protocol independent; simply passes frames based on MAC tables.</td>
      <td>Protocol dependent; interprets network protocols (IP, ICMP) and maintains forwarding tables.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 10; Team Hadi Midterm File 7 Q28; VU Stars Q95.',
    urdu_answer: 'برج (Bridge) ڈیٹا لنک لیئر (Layer 2) پر کام کرتا ہے اور MAC ایڈریس کے ذریعے ایک ہی لوکل نیٹ ورک کے دو حصوں کو جوڑتا ہے۔ جبکہ روٹر (Router) نیٹ ورک لیئر (Layer 3) پر کام کرتا ہے اور IP ایڈریس کی بنیاد پر دو مختلف نیٹ ورکس کے درمیان ٹریفک بھیجتا ہے۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Explain the three primary computer network topologies: Bus, Star, and Ring. For each topology, describe its physical layout, operational mechanism, strengths, limitations, and how collisions are managed (e.g., CSMA/CD and CSMA/CA).',
    correct: `<p><strong>Detailed Analysis of Network Topologies:</strong></p>

<ol>
  <li><strong>Bus Topology:</strong>
    <ul>
      <li><strong>Physical Layout:</strong> All nodes and devices are connected to a single common central cable backbone (the bus), terminated with terminators at both ends.</li>
      <li><strong>Operational Mechanism:</strong> Signals broadcast along the cable in both directions. Every machine receives the transmission, but only the machine with the matching destination address accepts it.</li>
      <li><strong>Collision Protocol:</strong> Uses <strong>CSMA/CD</strong> (Carrier Sense Multiple Access with Collision Detection). If two nodes transmit at once, a collision occurs; both detect it, abort, and wait random backoff intervals.</li>
      <li><strong>Pros & Cons:</strong> Simple to install and requires minimal cabling. However, a single break in the main backbone cable brings down the entire network.</li>
    </ul>
  </li>

  <li><strong>Star Topology:</strong>
    <ul>
      <li><strong>Physical Layout:</strong> Every individual computer is connected via a dedicated cable directly to a central hub, switch, or wireless router.</li>
      <li><strong>Operational Mechanism:</strong> Data travels from the sender through the central switch, which routes it directly to the intended receiver. In wireless star networks (Wi-Fi), communication uses <strong>CSMA/CA</strong> (Collision Avoidance).</li>
      <li><strong>Pros & Cons:</strong> Highly robust; if one individual cable fails, only that single node is affected while the rest of the network operates normally. However, if the central switch fails, the entire network halts.</li>
    </ul>
  </li>

  <li><strong>Ring Topology:</strong>
    <ul>
      <li><strong>Physical Layout:</strong> Computers are connected in a continuous closed circular loop. Signals travel in a single direction around the ring from machine to machine.</li>
      <li><strong>Operational Mechanism:</strong> Uses deterministic <strong>Token Ring</strong> arbitration. A special electronic bit pattern called the "token" circulates constantly; only the workstation currently holding the token is permitted to transmit.</li>
      <li><strong>Pros & Cons:</strong> Collisions are completely impossible because only the token holder transmits. However, a failure in any single computer or cable link breaks the loop and halts the entire ring.</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 10; CS101 Grand Quiz For Mid Term Prepration by VU Stars Q17 & Q18; VU Stars Q4.',
    urdu_answer: 'نیٹ ورک ٹوپولوجیز کی تین بڑی اقسام ہیں: 1. بس ٹوپولوجی (ایک ہی مرکزی تار سے تمام کمپیوٹر جڑے ہوتے ہیں اور CSMA/CD استعمال ہوتا ہے)، 2. اسٹار ٹوپولوجی (تمام کمپیوٹر ایک مرکزی سوئچ سے جڑے ہوتے ہیں، اگر ایک تار ٹوٹے تو باقی نیٹ ورک چلتا رہتا ہے)، اور 3. رنگ ٹوپولوجی (دائرے کی شکل میں ٹوکن کے ذریعے ڈیٹا ایک سمت میں منتقل ہوتا ہے جس سے ٹکراؤ ممکن نہیں ہوتا)۔'
  },
  {
    stem: 'Describe the hierarchical layers of the TCP/IP Protocol Stack (Application, Transport, Network, and Link layers) involved in transmitting a message from a sender to a receiver. Detail the specific functions performed and the headers added at each layer during data encapsulation.',
    correct: `<p><strong>1. Architectural Purpose of the TCP/IP Protocol Stack:</strong></p>
<p>Modern internetworking relies on modular layering where complex communication tasks are divided into separate hierarchical layers. As an outgoing message descends from the user application down through the layers at the sender side, each layer adds specialized administrative control information called a <strong>Header</strong> (a process called <strong>Data Encapsulation</strong>).</p>

<p><strong>2. Detailed Explanation of the Four Layers:</strong></p>
<ol>
  <li><strong>Application Layer:</strong>
    <ul>
      <li><strong>Function:</strong> Interfaces directly with end-user software applications to initiate network communications. Formats raw user messages into protocol-specific data streams.</li>
      <li><strong>Protocols:</strong> HTTP (web browsing), SMTP (email transmission), FTP (file transfers), DNS (domain resolution).</li>
      <li><strong>Output Data Unit:</strong> Raw Application Message.</li>
    </ul>
  </li>

  <li><strong>Transport Layer:</strong>
    <ul>
      <li><strong>Function:</strong> Manages end-to-end process-to-process communication between host applications. Segments large messages into manageable sequential packets, assigns source and destination <strong>Port Numbers</strong> (e.g., Port 80 for HTTP), and handles error detection, flow control, and packet retransmission.</li>
      <li><strong>Protocols:</strong> TCP (reliable, connection-oriented) and UDP (fast, connectionless).</li>
      <li><strong>Output Data Unit:</strong> Segment (TCP) or Datagram (UDP).</li>
    </ul>
  </li>

  <li><strong>Network Layer (Internet Layer):</strong>
    <ul>
      <li><strong>Function:</strong> Manages logical host-to-host addressing and internetwork routing. Encapsulates transport segments with an IP header containing the sender's and receiver's logical <strong>IP Addresses</strong> and determines the optimal path through intermediate routers.</li>
      <li><strong>Protocols:</strong> IP (Internet Protocol - IPv4, IPv6), ICMP (ping diagnostic).</li>
      <li><strong>Output Data Unit:</strong> IP Packet (Datagram).</li>
    </ul>
  </li>

  <li><strong>Link Layer (Network Interface / Physical Layer):</strong>
    <ul>
      <li><strong>Function:</strong> Governs physical hardware transmission across specific physical media (copper wires, fiber optics, radio frequencies). Appends physical source and destination <strong>MAC Hardware Addresses</strong> in a header and a CRC checksum trailer to detect transmission noise.</li>
      <li><strong>Protocols:</strong> Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11).</li>
      <li><strong>Output Data Unit:</strong> Network Frame (and raw physical bits).</li>
    </ul>
  </li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 10; CS101 Grand Quiz by VU Stars Q29; CS101 MID by Attiq Kundi Q3.',
    urdu_answer: 'ٹی سی پی/آئی پی ماڈل کی چار بنیادی تہیں ہیں: 1. ایپلی کیشن لیئر (صارف سے رابطہ جیسے HTTP اور SMTP)، 2. ٹرانسپورٹ لیئر (پورٹ نمبرز اور پیکٹس کی ترتیب جیسے TCP)، 3. نیٹ ورک لیئر (آئی پی ایڈریس اور روٹنگ)، اور 4. لنک لیئر (میک ایڈریس اور فزیکل سگنلز جیسے ایتھرنیٹ اور وائی فائی)۔ ہر لیئر اپنا ہیڈر شامل کرتی ہے جسے ڈیٹا اینکیپسولیشن کہتے ہیں۔'
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
console.log(`CS101 Lecture 10 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

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

// 2. Create or fetch Lecture 3
let lec3 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 3").get(cs101.id);
if (!lec3) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 3, 'The Internet and the World Wide Web: Browsers, Servers, URLs, and Search Engines')
  `).run(cs101.id);
  lec3 = { id: res.lastInsertRowid };
  console.log(`Created CS101 Lecture 3 with ID: ${lec3.id}`);
} else {
  console.log(`CS101 Lecture 3 found with ID: ${lec3.id}`);
}

const lId = lec3.id;

// 3. Clear existing questions for Lecture 3 idempotency
const del = db.prepare('DELETE FROM questions WHERE lecture_id = ?').run(lId);
console.log(`Cleared ${del.changes} old questions for Lecture 3.`);

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

// 15 MCQs
const mcqs = [
  {
    stem: 'What does the acronym "WWW" represent in computer and internet terminology?',
    options: {
      a: 'Wide World Web',
      b: 'World Wide Web',
      c: 'World White Web',
      d: 'World Web Wide'
    },
    correct: 'b',
    explanation: 'WWW stands for World Wide Web, an information system invented by Tim Berners-Lee in 1989 where documents and web resources are identified by URLs and linked via hypertext (CS101 Handouts Lecture 3). Appeared in 18+ midterm past papers.',
    urdu_answer: 'کمپیوٹر کی اصطلاح میں WWW کا مخفف "World Wide Web" ہے۔'
  },
  {
    stem: 'Which of the following is a client application program that uses the HTTP protocol to request, retrieve, and render web pages from web servers on behalf of the user?',
    options: {
      a: 'Web Application',
      b: 'Web Browser',
      c: 'Internet Gateway Application',
      d: 'Hypertext Markup Language (HTML)'
    },
    correct: 'b',
    explanation: 'A Web Browser (such as Google Chrome, Firefox, or Safari) is a client program that interprets HTML, CSS, and JavaScript and communicates with remote web servers via HTTP/HTTPS (CS101 Handouts Lecture 3). Appeared in 15+ papers.',
    urdu_answer: 'ویب براؤزر (Web Browser) ایک کلائنٹ پروگرام ہے جو انٹرنیٹ پر صارف کی جانب سے ویب سرورز سے رابطہ کر کے ویب پیجز لوڈ کرتا ہے۔'
  },
  {
    stem: 'A Uniform Resource Locator (URL) is fundamentally a/an:',
    options: {
      a: 'Hardware Peripheral Device',
      b: 'Internal Network Component',
      c: 'Unique Global Web Address',
      d: 'System Utility Tool'
    },
    correct: 'c',
    explanation: 'A URL is the global address of a specific resource or document located on the World Wide Web (e.g., https://www.vu.edu.pk) (CS101 Handouts Lecture 3). Appeared in 12+ midterm papers.',
    urdu_answer: 'یو آر ایل (URL) بنیادی طور پر ویب پر موجود کسی بھی صفحے یا دستاویز کا منفرد گلوبل پتہ (Address) ہوتا ہے۔'
  },
  {
    stem: 'Which of the following correctly describes a Web Server?',
    options: {
      a: 'It is a desktop software program solely dedicated to sending and receiving email messages',
      b: 'It is a networked computer system running software that stores, processes, and delivers web pages to clients',
      c: 'It is a network device that does not permit electronic chatting or multimedia streaming',
      d: 'It is an anonymous computer that cannot possess an official domain name'
    },
    correct: 'b',
    explanation: 'A web server is a host computer connected to the internet running specialized server software (like Apache or Nginx) designed to store and serve web pages to requesting client web browsers (CS101 Handouts Lecture 3). Appeared in 8+ papers.',
    urdu_answer: 'ویب سرور ایک ایسا کمپیوٹر سسٹم ہے جو ویب پیجز کو اسٹور کرتا ہے اور براؤزر کی درخواست پر انہیں انٹرنیٹ کے ذریعے فراہم کرتا ہے۔'
  },
  {
    stem: 'In the context of the World Wide Web, a Hyperlink functions primarily as a:',
    options: {
      a: 'Physical cable connection between two computers',
      b: 'Diplomatic telecommunications channel between two countries',
      c: 'Clickable navigation gateway to another web page, document, or resource',
      d: 'Satellite link between five continents'
    },
    correct: 'c',
    explanation: 'A hyperlink is a clickable word, phrase, icon, or image that points directly to another section of the same document or an entirely different web page across the internet (CS101 Handouts Lecture 3). Appeared in 7+ papers.',
    urdu_answer: 'ہائپر لنک (Hyperlink) دراصل ایک کلک کے ذریعے اگلے ویب پیج یا دستاویز پر جانے کا راستہ (Gateway) ہوتا ہے۔'
  },
  {
    stem: 'What is the primary role of a Search Engine on the World Wide Web?',
    options: {
      a: 'To crawl, index, and scan the web to help users locate desired information using keywords',
      b: 'To restrict searches exclusively to Usenet newsgroups',
      c: 'To solely catalog high-resolution image files on local servers',
      d: 'To provide closed communication channels exclusively for research scientists'
    },
    correct: 'a',
    explanation: 'Search engines (like Google, Bing, or Yahoo) utilize automated web crawlers/spiders to index billions of public web pages and return ranked search results based on user queries (CS101 Handouts Lecture 3). Appeared in 10+ midterm papers.',
    urdu_answer: 'سرچ انجن پورے انٹرنیٹ سے مطلوبہ معلومات اور ویب سائٹس کو تلاش کر کے صارف کے سامنے فہرست کی صورت میں پیش کرتا ہے۔'
  },
  {
    stem: 'What is the Internet?',
    options: {
      a: 'A vast global decentralized network of interconnected computer networks',
      b: 'A proprietary software package used to access local area networks',
      c: 'A private group of registered computer operators',
      d: 'Any simple network connecting more than two computers in an office'
    },
    correct: 'a',
    explanation: 'The Internet is a global system of interconnected computer networks that communicate using the standard Internet Protocol Suite (TCP/IP) (CS101 Handouts Lecture 3). Appeared in 6+ past papers.',
    urdu_answer: 'انٹرنیٹ دنیا بھر کے کمپیوٹر نیٹ ورکس کا ایک وسیع ترین عالمی جال (Network of networks) ہے۔'
  },
  {
    stem: 'What does the networking acronym "HTTP" stand for?',
    options: {
      a: 'Hyper Text Transmit Protocol',
      b: 'Hyper Text Terminal Protocol',
      c: 'Hyper Text Transfer Protocol',
      d: 'Hyper Terminal Text Protocol'
    },
    correct: 'c',
    explanation: 'HTTP stands for Hypertext Transfer Protocol, the application-level protocol used by the World Wide Web for transferring hypertext documents between web servers and clients (CS101 Handouts Lecture 3). Appeared in 15+ papers.',
    urdu_answer: 'ایچ ٹی ٹی پی (HTTP) کا مکمل نام "Hyper Text Transfer Protocol" ہے۔'
  },
  {
    stem: 'A key distinguishing characteristic of Semantic Web pages is that their contents and metadata:',
    options: {
      a: 'Are completely static and cannot contain hyperlinks',
      b: 'Are machine-readable and meaningfully understood and interpreted by computers',
      c: 'Are incompatible with existing web standards and protocols',
      d: 'Focus solely on correcting spelling and grammatical semantics'
    },
    correct: 'b',
    explanation: 'The Semantic Web, conceptualized by Tim Berners-Lee, adds standardized semantic metadata to web data so that computer programs and software agents can understand the meaning of information, not just its visual display (CS101 Handouts Lecture 3). Appeared in 4+ papers.',
    urdu_answer: 'سیمینٹک ویب پیجز (Semantic Web) کی خاصیت یہ ہے کہ ان کا ڈیٹا کمپیوٹرز اور سافٹ ویئر کے لیے قابل فہم (Understood by computers) ہوتا ہے۔'
  },
  {
    stem: 'The unique, standardized address assigned to locate a specific resource or Web page on the Internet is called a:',
    options: {
      a: 'Frequently Asked Questions (FAQ)',
      b: 'File Transfer Protocol (FTP)',
      c: 'Uniform Resource Locator (URL)',
      d: 'Hypertext Protocol Token'
    },
    correct: 'c',
    explanation: 'A URL (Uniform Resource Locator) specifies the location of a resource on a computer network and a mechanism for retrieving it (CS101 Handouts Lecture 3). Appeared in 9+ midterm papers.',
    urdu_answer: 'کسی بھی ویب پیج کی منفرد لوکیشن کا پتہ URL (یونیفارم ریسورس لوکیٹر) کہلاتا ہے۔'
  },
  {
    stem: 'Which of the following statements accurately defines a Website?',
    options: {
      a: 'A single text file where users can only view information passively',
      b: 'A structured collection of related, interlinked web pages and multimedia hosted under a common domain name',
      c: 'A dedicated server application that only permits data entry and writing',
      d: 'A temporary network session that has no domain name'
    },
    correct: 'b',
    explanation: 'A website is a collection of related web pages, multimedia content, and assets typically published by an organization or individual under a single domain name (CS101 Handouts Lecture 3). Appeared in 8+ papers.',
    urdu_answer: 'ویب سائٹ دراصل ایک مشترکہ ڈومین کے تحت باہم منسلک ویب پیجز اور دستاویزات کے مجموعے کو کہا جاتا ہے۔'
  },
  {
    stem: 'Where is the central headquarters, primary hub, or master control facility of the global Internet located?',
    options: {
      a: 'Near Washington D.C., United States',
      b: 'Inside the Microsoft main corporate campus in Redmond, Washington',
      c: 'Inside a classified subterranean telecommunications facility',
      d: 'Nowhere, the Internet is a decentralized network with no single central hub'
    },
    correct: 'd',
    explanation: 'The Internet is inherently decentralized; it has no centralized switch, central computer, or central hub. If any single node or regional subnetwork fails, traffic is automatically rerouted through alternative paths (CS101 Handouts Lecture 3). Appeared in multiple past papers.',
    urdu_answer: 'انٹرنیٹ کا کوئی مرکزی کنٹرول سینٹر یا ہیڈ کوارٹر نہیں ہے؛ یہ ایک غیر مرکزی (Decentralized) عالمی نظام ہے۔'
  },
  {
    stem: 'Historically, the very first web pages created on the World Wide Web were characterized as:',
    options: {
      a: 'Strictly text-based hypertext documents containing no multimedia, audio, or video content',
      b: 'Complex graphical pages built using nested HTML layout tables',
      c: 'High-definition multimedia streaming documents',
      d: 'Transmitted strictly through point-to-point electronic mail'
    },
    correct: 'a',
    explanation: 'The original web pages developed by Tim Berners-Lee at CERN were plain, black-and-white hypertext documents with text and blue hyperlinks, completely devoid of multimedia, styling, or images until browsers like Mosaic emerged (CS101 Handouts Lecture 3). Appeared in past papers.',
    urdu_answer: 'شروع کے اولین ویب پیجز بغیر کسی تصویر، آڈیو یا ویڈیو کے صرف سادہ ہائپر ٹیکسٹ (Text) پر مشتمل تھے۔'
  },
  {
    stem: 'What is the full expansion of the markup language abbreviation "HTML"?',
    options: {
      a: 'Hyper Text Markup Language',
      b: 'Home Tool Markup Language',
      c: 'Hyperlinks and Text Markup Language',
      d: 'Hyper Transfer Machine Language'
    },
    correct: 'a',
    explanation: 'HTML stands for HyperText Markup Language, the standard authoring language used to create and structure web pages displayed in web browsers (CS101 Handouts Lecture 3). Appeared in 10+ papers.',
    urdu_answer: 'ایچ ٹی ایم ایل کا مخفف "Hyper Text Markup Language" ہے۔'
  },
  {
    stem: 'Information dispersed across the World Wide Web is said to be ________ unified through hyperlinks and the URL addressing scheme.',
    options: {
      a: 'Physically',
      b: 'Logically',
      c: 'Chemically',
      d: 'Mechanically'
    },
    correct: 'b',
    explanation: 'Web pages are stored on millions of physically dispersed servers worldwide, but they are logically unified into a single navigable web through hyperlinks, universal protocols (HTTP), and standardized addresses (URLs) (CS101 Handouts Lecture 3). Appeared in 3+ papers.',
    urdu_answer: 'ورلڈ وائڈ ویب پر معلومات جسمانی طور پر دنیا بھر میں بکھری ہوئی ہیں لیکن ہائپر لنکس کے ذریعے وہ "Logically" طور پر باہم جڑی ہوئی ہیں۔'
  }
];

// 4 Short Questions
const shortQuestions = [
  {
    stem: 'Define URL (Uniform Resource Locator) and explain its primary structure with an illustrative example.',
    correct: `<p><strong>Definition of URL:</strong></p>
<p>A <strong>URL (Uniform Resource Locator)</strong> is a standardized global address used to specify the exact location of a resource (such as a web page, image, or document) on the Internet and the protocol needed to access it.</p>

<p><strong>Standard Structure of a URL:</strong></p>
<p><code>protocol://domain-name:port/path/filename</code></p>

<p><strong>Illustrative Example:</strong></p>
<p><code>https://www.vu.edu.pk/academics/courses.aspx</code></p>
<ul>
  <li><strong>https://</strong>: The communication protocol (Hypertext Transfer Protocol Secure).</li>
  <li><strong>www.vu.edu.pk</strong>: The domain name / host server name.</li>
  <li><strong>academics/</strong>: The directory path on the host web server.</li>
  <li><strong>courses.aspx</strong>: The specific target document/file name.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 3; CS101 past papers Fall 2009 s3 Q27, latest midterm paper 5 Q28.',
    urdu_answer: 'یو آر ایل (URL) انٹرنیٹ پر کسی بھی فائل یا پیج کا منفرد پتہ ہے۔ اس کے اہم حصوں میں پروٹوکول (جیسے https://)، ڈومین نیم (جیسے www.vu.edu.pk) اور فائل کا راستہ (Path) شامل ہوتے ہیں۔'
  },
  {
    stem: 'What is the difference between a Web Page and a Website? Explain with practical examples.',
    correct: `<p><strong>Difference Between a Web Page and a Website:</strong></p>

<table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
  <thead>
    <tr style="background-color:#f2f2f2;">
      <th>Criterion</th>
      <th>Web Page</th>
      <th>Website</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Definition</strong></td>
      <td>A single digital document accessible via a browser, written in HTML and styled with CSS.</td>
      <td>A structured collection of multiple interlinked web pages hosted under a common domain.</td>
    </tr>
    <tr>
      <td><strong>Analogy</strong></td>
      <td>Equivalent to a single page in a printed book.</td>
      <td>Equivalent to the entire book containing multiple chapters and pages.</td>
    </tr>
    <tr>
      <td><strong>URL Specificity</strong></td>
      <td>Has a specific direct file path URL (e.g., <code>https://www.vu.edu.pk/contact.aspx</code>).</td>
      <td>Represented primarily by the base root domain URL (e.g., <code>https://www.vu.edu.pk</code>).</td>
    </tr>
    <tr>
      <td><strong>Content Scope</strong></td>
      <td>Focuses on one specific topic, form, article, or video.</td>
      <td>Contains comprehensive information covering an entire institution, company, or subject.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'From CS101 Handouts Lecture 3; Cs101 latest solved midterm paper 12, Q27.',
    urdu_answer: 'ویب پیج (Web Page) انٹرنیٹ پر صرف ایک واحد دستاویز ہے (جیسے کتاب کا ایک صفحہ)، جبکہ ویب سائٹ (Website) باہم جڑے ہوئے کئی ویب پیجز کا مکمل مجموعہ ہوتی ہے (جیسے پوری کتاب)۔'
  },
  {
    stem: 'List the names of any two major search engines used to locate information on the World Wide Web, and briefly state how they discover new web content.',
    correct: `<p><strong>Two Major Search Engines:</strong></p>
<ol>
  <li><strong>Google Search (www.google.com):</strong> The world's most widely used web search engine.</li>
  <li><strong>Microsoft Bing (www.bing.com):</strong> Microsoft's flagship search platform.</li>
</ol>
<p><em>(Other notable examples include Yahoo Search and DuckDuckGo).</em></p>

<p><strong>How Search Engines Discover New Content:</strong></p>
<ul>
  <li>Search engines deploy automated software programs called <strong>Web Crawlers</strong> (or <em>Spiders/Bots</em>).</li>
  <li>These crawlers systematically traverse the web by following hyperlinks from one page to another.</li>
  <li>The downloaded contents are analyzed, tokenized, and stored in a gigantic organized repository called the <strong>Search Engine Index</strong> to deliver instant search results when a user enters keywords.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 3; CS101 Mid Term Past Paper Mega File, Page 13.',
    urdu_answer: 'دو مشہور سرچ انجن گوگل (Google) اور بنگ (Bing) ہیں۔ یہ سرچ انجنز "ویب کرالرز" یا "اسپائیڈرز" نامی پروگرامز کے ذریعے ویب پیجز کے لنکس کا پیچھا کر کے نئی معلومات تلاش کرتے ہیں اور ان کا انڈیکس بناتے ہیں۔'
  },
  {
    stem: 'What is the Semantic Web and how does it fundamentally improve upon the traditional World Wide Web?',
    correct: `<p><strong>The Semantic Web Concept:</strong></p>
<p>The <strong>Semantic Web</strong> (often described as Web 3.0) is an evolutionary extension of the World Wide Web proposed by Web inventor Sir Tim Berners-Lee. In the traditional web, information is formatted primarily for <em>human visual consumption</em> (using HTML tags like &lt;b&gt;, &lt;p&gt;, and &lt;table&gt;).</p>

<p><strong>Fundamental Improvements:</strong></p>
<ul>
  <li><strong>Machine Readability & Meaning:</strong> The Semantic Web attaches standardized semantic metadata (such as XML, RDF, and OWL) to data elements so computers can comprehend the contextual meaning and relationships between data.</li>
  <li><strong>Automated Data Integration:</strong> Instead of humans manually searching and collating information across different sites, automated software agents can query, cross-reference, and reason with semantic data across diverse databases automatically.</li>
</ul>`,
    explanation: 'From CS101 Handouts Lecture 3; cs101 midterm subjective by moaaz, Page 2, Q34.',
    urdu_answer: 'سیمینٹک ویب (Semantic Web) روایتی ویب کی جدید شکل ہے جس میں معلومات کو اس انداز میں کوڈ کیا جاتا ہے کہ کمپیوٹرز اور سافٹ ویئر ایجنٹس خود اس کا مطلب (Meaning) اور سیاق و سباق سمجھ سکیں اور خودکار طریقے سے کام انجام دے سکیں۔'
  }
];

// 2 Long Questions
const longQuestions = [
  {
    stem: 'Provide a detailed overview of the World Wide Web (WWW). Explain its core client-server architecture and discuss the fundamental design elements required to create effective, user-friendly websites.',
    correct: `<p><strong>1. Overview of the World Wide Web (WWW):</strong></p>
<p>The World Wide Web is an architectural information space on the Internet where documents and digital resources are identified by URLs, interconnected through hypertext links, and accessible via the HTTP/HTTPS protocols. Invented in 1989 by Tim Berners-Lee at CERN, the WWW transformed the Internet from a command-line academic tool into a global multimedia environment.</p>

<p><strong>2. Client-Server Architecture of the Web:</strong></p>
<ul>
  <li><strong>The Client (Web Browser):</strong> Requests resources on behalf of the user, parses HTML/CSS/JavaScript, and renders the visual page.</li>
  <li><strong>The Server (Web Host):</strong> Listens for incoming HTTP connection requests, retrieves the requested files from disk or databases, and transmits HTTP response packages back to the client.</li>
  <li><strong>The Communication Protocol (HTTP):</strong> A stateless request-response protocol defining how messages are formatted and exchanged.</li>
</ul>

<p><strong>3. Fundamental Elements of Web Design:</strong></p>
<ol>
  <li><strong>Clear Information Architecture & Navigation:</strong> Menus and hyperlinks must be intuitive and consistent across all pages so users can reach information in 3 clicks or fewer.</li>
  <li><strong>Visual Design & Layout Consistency:</strong> Cohesive color schemes, legible typography, balanced whitespace, and unified branding elements enhance credibility.</li>
  <li><strong>Usability & Accessibility:</strong> High contrast text, alt text for images, and keyboard accessibility for users with disabilities.</li>
  <li><strong>Responsive / Adaptive Design:</strong> Pages must dynamically adjust layout across desktops, tablets, and smartphones.</li>
  <li><strong>Performance & Fast Loading Speed:</strong> Optimized compressed image assets and efficient script loading to prevent user abandonment.</li>
</ol>`,
    explanation: 'From CS101 Handouts Lecture 3; cs101 solved past papers, Paper 6666 Q5; cs101 midterm subjective by moaaz Spring 2009 Q31.',
    urdu_answer: 'ورلڈ وائڈ ویب (WWW) انٹرنیٹ کا ایک ایسا معلوماتی نظام ہے جہاں ویب پیجز ہائپر لنکس کے ذریعے جڑے ہوتے ہیں اور کلائنٹ سرور ماڈل پر کام کرتے ہیں۔ براؤزر کلائنٹ ہوتا ہے اور ریموٹ سسٹم ویب سرور۔ اچھے ویب ڈیزائن کے لیے واضح نیویگیشن، موبائل کے لیے ریسپانسو لے آؤٹ، تیز لوڈنگ رفتار، اور سادہ و دلکش ڈیزائن بنیادی عناصر ہیں۔'
  },
  {
    stem: 'Can it be argued that a URL and a Semantic Website are identical concepts? Justify your answer thoroughly by defining both terms, highlighting their core purposes, and contrasting their roles in web architecture.',
    correct: `<p><strong>Assertion Evaluation:</strong></p>
<p><strong>NO, a URL and a Semantic Website are NOT the same.</strong> They represent two fundamentally distinct layers in web architecture.</p>

<p><strong>1. Definition and Purpose of a URL (Uniform Resource Locator):</strong></p>
<ul>
  <li>A URL is strictly an <strong>addressing identifier mechanism</strong>.</li>
  <li>It tells the client browser <em>where</em> a resource is physically hosted on the network and <em>which protocol</em> must be used to fetch it (e.g., <code>https://example.com/data.html</code>).</li>
  <li>A URL has no understanding of the semantic meaning, content, context, or truth value of the data stored at that address.</li>
</ul>

<p><strong>2. Definition and Purpose of a Semantic Website:</strong></p>
<ul>
  <li>A Semantic Website is an <strong>intelligent data architecture</strong> where the content and entities on the web page are embedded with standardized semantic metadata (such as RDF, OWL, and schema.org).</li>
  <li>This metadata explicitly explains <em>what the data means</em> and how it relates to real-world concepts (for example, clarifying whether the word "Apple" refers to a fruit or the technology corporation).</li>
  <li>It allows autonomous computer agents and search algorithms to process and reason with information intelligently.</li>
</ul>

<p><strong>3. Summary Comparison:</strong></p>
<p>A URL is simply the <em>postal street address</em> on the envelope, whereas a Semantic Website represents the <em>structured, meaningful, machine-readable contents</em> of the letter inside. Therefore, equating them confuses location with substance.</p>`,
    explanation: 'From CS101 Handouts Lecture 3; CS101 past papers Fall 2009 s2 Q32; Cs101 latest midterm paper 8 Q32.',
    urdu_answer: 'نہیں، یو آر ایل (URL) اور سیمینٹک ویب سائٹ ہرگز ایک چیز نہیں ہیں۔ URL صرف انٹرنیٹ پر کسی فائل یا صفحے کا پتہ (Address) ہے جو یہ بتاتا ہے کہ وہ کہاں موجود ہے۔ جبکہ سیمینٹک ویب سائٹ مواد کی اندرونی ساخت اور معنوی مفہوم کو واضح کرتی ہے تاکہ کمپیوٹرز اس کے معنی سمجھ سکیں۔'
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
console.log(`CS101 Lecture 3 Questions: ${countRow.count}`);
console.log(`Total Database Questions: ${totalRow.count}`);
console.log(`Total Lectures: ${lecCount.count}`);
console.log(`Total Subjects: ${subCount.count}`);

db.close();

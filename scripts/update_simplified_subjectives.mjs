import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');
const db = new Database(dbPath);

const updates = [
  // ==========================================
  // CS403 - LECTURE 1
  // ==========================================
  {
    id: 10,
    correct: `• Data: Raw, unorganized facts without context (e.g., "98.6").
• Information: Processed data that has meaning and context (e.g., "Patient temperature: 98.6°F").`,
    explanation: 'Data is raw input; Information is processed meaningful output.',
    urdu_answer: 'ڈیٹا: خام اور غیر منظم حقائق۔ انفارمیشن: منظم اور با معنی ڈیٹا۔'
  },
  {
    id: 11,
    correct: `• Database: An organized collection of related data.
• DBMS: Software used to create, manage, and query that database (e.g., MySQL, Oracle).`,
    explanation: 'Database is the storage; DBMS is the software that manages it.',
    urdu_answer: 'ڈیٹا بیس: ڈیٹا کا ذخیرہ۔ DBMS: سافٹ ویئر جو ڈیٹا بیس کو کنٹرول اور منظم کرتا ہے۔'
  },
  {
    id: 12,
    correct: `1. Data Redundancy: Same data duplicated across multiple files.
2. Data Inconsistency: Updating one file leaves others outdated.
3. Program-Data Dependence: Changing file format requires rewriting programs.
4. Poor Security: Difficult to enforce access controls.`,
    explanation: 'File systems suffered from data duplication, inconsistency, and tight program coupling.',
    urdu_answer: 'روایتی فائل سسٹم کی خامیاں: ڈیٹا کا بار بار دہرایا جانا، تضاد، سیکیورٹی کی کمی، اور پروگرام پر انحصار۔'
  },
  {
    id: 13,
    correct: `1. Data Management: Storing, searching, and updating data efficiently.
2. Access Control: Managing user permissions and multi-user access safely.`,
    explanation: 'DBMS manages data operations and enforces security and concurrency.',
    urdu_answer: 'DBMS کے دو اہم کام: ڈیٹا اسٹور اور ریٹریو کرنا، اور صارفین کی سیکیورٹی کنٹرول کرنا۔'
  },
  {
    id: 14,
    correct: `A Database System consists of stored data and software to manage it.

Principal Components:
1. Database: The stored collection of related records.
2. DBMS: Software that controls storage, retrieval, and security.
3. Hardware: Storage disks, memory, and processors.
4. Users: DBAs, developers, and end-users.

Key Advantages over Traditional Files:
• Reduces data duplication (Redundancy)
• Keeps data accurate and consistent
• Allows multiple users to work at the same time
• Provides data security and easy backup`,
    explanation: 'Database System = Database + DBMS + Hardware + Users.',
    urdu_answer: 'ڈیٹا بیس سسٹم کے اجزاء: ڈیٹا بیس، سافٹ ویئر، ہارڈ ویئر، اور صارفین۔ فوائد: ڈیٹا کا تحفظ، مستقل مزاجی، اور بیک وقت استعمال۔'
  },
  {
    id: 15,
    correct: `Definitions:
• Data Redundancy: Storing the same data in multiple places (e.g., student address stored in accounts and hostel offices).
• Data Inconsistency: Same data having conflicting values in different files because an update was missed in one copy.

How DBMS Controls Them:
• Stores data in one central place instead of duplicate department files.
• When data is updated once, it immediately updates for all users.`,
    explanation: 'DBMS centralizes data storage to eliminate duplicates and keep data consistent.',
    urdu_answer: 'ریڈنڈنسی: ایک ہی ڈیٹا کا کئی جگہ ہونا۔ تضاد: الگ الگ جگہوں پر مختلف معلومات ہونا۔ DBMS ایک مرکزی جگہ ڈیٹا رکھ کر یہ حل کرتا ہے۔'
  },
  {
    id: 16,
    correct: `A Database Administrator (DBA) is the technical person in charge of managing and protecting the database.

Core Duties:
1. Database Design: Defining tables, columns, and relationships.
2. Security & Access: Creating user accounts and setting permissions.
3. Backup & Recovery: Taking regular backups and restoring data if the system crashes.
4. Performance Tuning: Monitoring query speeds and adding indexes.

Significance:
The DBA ensures the database is always secure, fast, and available for business operations.`,
    explanation: 'The DBA oversees security, performance, design, and backups.',
    urdu_answer: 'DBA کا کردار: ڈیٹا بیس کے ڈیزائن، سیکیورٹی، بیک اپ اور کارکردگی کی مکمل نگرانی کرنا۔'
  },

  // ==========================================
  // CS403 - LECTURE 2
  // ==========================================
  {
    id: 151,
    correct: `• Definition: Metadata is "data about data". It describes the structure, types, and constraints of data.
• Example: In a student table, metadata specifies that "Roll_Number" is an integer and "Name" is text up to 50 characters.`,
    explanation: 'Metadata defines the schema and constraints of stored data.',
    urdu_answer: 'میٹا ڈیٹا: ڈیٹا کے بارے میں ڈیٹا، جیسے کالم کا نام اور ڈیٹا ٹائپ۔'
  },
  {
    id: 152,
    correct: `1. External Level: Individual views seen by end users.
2. Conceptual Level: The entire logical design (tables and relationships) for the whole organization.
3. Internal Level: How data is physically stored on disk (indexes and file records).`,
    explanation: 'The three levels are: External (user view), Conceptual (logical design), and Internal (physical storage).',
    urdu_answer: 'ڈیٹا کے تین لیولز: ایکسٹرنل (یوزر ویو)، کونسیپچوئل (لاجیکل ڈیزائن)، اور انٹرنل (فزیکل اسٹوریج)۔'
  },
  {
    id: 153,
    correct: `1. Software Licensing: High cost of purchasing DBMS software (e.g., Oracle).
2. Hardware Upgrades: Buying faster servers and extra storage.
3. Staff Training: Training existing staff or hiring skilled DBAs.
4. Migration Cost: Converting data from old systems into the new DBMS.`,
    explanation: 'DBMS implementation costs include software, hardware, training, and data migration.',
    urdu_answer: 'لاگت: سافٹ ویئر لائسنس، نیا ہارڈ ویئر، عملے کی ٹریننگ، اور پرانے ڈیٹا کی منتقلی۔'
  },
  {
    id: 154,
    correct: `1. End Users: People who use the system daily to query or enter data (e.g., bank tellers, students).
2. Application Programmers: Developers who write code (in Java, C#, PHP) that connects to the database.
3. Database Administrator (DBA): The expert responsible for database design, security, and maintenance.`,
    explanation: 'Major database users: End Users, Application Programmers, and DBA.',
    urdu_answer: 'ڈیٹا بیس صارفین: روزمرہ صارفین (End users)، پروگرامرز، اور ایڈمنسٹریٹر (DBA)۔'
  },
  {
    id: 155,
    correct: `The three levels of data in a database are:

1. External Level (User Views):
• What individual users see. Different users have different views of the same data.
• Example: A student sees only their own grades; the accounts office sees fee payments.

2. Conceptual Level (Logical Structure):
• The complete logical view of the entire database.
• Defines all tables, columns, relationships, and constraints without storage details.

3. Internal Level (Physical Storage):
• Describes how data is physically arranged on disk drives.
• Deals with storage structures, file allocations, compression, and indexes.`,
    explanation: 'External = what users see; Conceptual = logical design; Internal = physical disk layout.',
    urdu_answer: 'ایکسٹرنل لیول یوزر کا نقطہ نظر ہے، کونسیپچوئل تمام ٹیبلز کا خاکہ ہے، اور انٹرنل ہارڈ ڈسک پر فائل اسٹوریج کی تفصیل ہے۔'
  },
  {
    id: 156,
    correct: `Comparison:

1. Database Administrator (DBA):
• Focus: Manages and protects the entire database server.
• Tasks: Manages security, grants user permissions, takes backups, and tunes performance.
• Level: Works at the conceptual and internal storage levels.

2. Application Programmers:
• Focus: Write software applications (web apps, mobile apps) that connect to the database.
• Tasks: Write queries (SQL), create user interfaces, and build business logic.
• Level: Works at the external user view level.`,
    explanation: 'DBA manages security, storage, and maintenance; Programmers write user software.',
    urdu_answer: 'DBA سیکیورٹی، بیک اپ اور سرور سنبھالتا ہے۔ ایپلیکیشن پروگرامر سافٹ ویئر اور اسکرینیں بناتا ہے۔'
  },

  // ==========================================
  // CS403 - LECTURE 3
  // ==========================================
  {
    id: 168,
    correct: `ANSI/SPARC architecture is a standard three-level framework (External, Conceptual, Internal) designed to separate user views from physical storage, providing data independence.`,
    explanation: 'ANSI/SPARC separates external, conceptual, and internal levels.',
    urdu_answer: 'ANSI/SPARC آرکیٹیکچر کا مقصد یوزر ویو کو فزیکل اسٹوریج سے الگ رکھ کر آزادی دینا ہے۔'
  },
  {
    id: 169,
    correct: `• Logical Data Independence: Ability to change the conceptual schema (e.g., adding a new table or column) without changing user views or application programs.
• Physical Data Independence: Ability to change internal storage (e.g., moving to a new disk or adding an index) without changing conceptual schema or application programs.`,
    explanation: 'Logical protects programs from schema changes; Physical protects schema from storage changes.',
    urdu_answer: 'لاجیکل: ٹیبل میں تبدیلی سے یوزر پروگرام متاثر نہ ہو۔ فزیکل: ہارڈ ڈسک یا انڈیکس بدلنے سے پروگرام متاثر نہ ہو۔'
  },
  {
    id: 170,
    correct: `Inter-Schema Mapping is the translation process between adjacent levels of ANSI/SPARC:
1. External/Conceptual Mapping: Connects user views to the conceptual schema.
2. Conceptual/Internal Mapping: Connects the conceptual schema to physical storage structures.`,
    explanation: 'Mapping translates requests between external, conceptual, and internal levels.',
    urdu_answer: 'انٹر اسکیما میپنگ: مختلف لیولز کے درمیان ڈیٹا کی معلومات کا تبادلہ اور ترجمہ۔'
  },
  {
    id: 171,
    correct: `• Schema Intention: The permanent database structure or design (table names, columns, and data types). Rarely changes.
• Schema Extension: The actual data records stored in the database at a specific moment. Changes frequently with daily inserts and updates.`,
    explanation: 'Intention is the structure; Extension is the data content at a given time.',
    urdu_answer: 'اسکیما انٹینشن: ٹیبل کا مستقل ڈیزائن۔ اسکیما ایکسٹینشن: کسی وقت ٹیبل میں موجود اصل ریکارڈز۔'
  },
  {
    id: 172,
    correct: `The ANSI/SPARC architecture divides the database into three levels:

1. External Level:
• Represents multiple user views. Each user sees only what they need.
• Protects unauthorized data from being seen by regular users.

2. Conceptual Level:
• The central logical representation of all data.
• Defines all entities, attributes, relationships, and integrity rules.

3. Internal Level:
• Physical storage layout on storage drives.
• Details record formats, block sizes, clustering, and index methods.

Mappings:
• External-to-Conceptual and Conceptual-to-Internal mappings ensure that changes at lower levels do not break user programs.`,
    explanation: 'Three levels: External (views), Conceptual (logical model), Internal (physical storage).',
    urdu_answer: 'ANSI/SPARC کے تین درجے: ایکسٹرنل (مخصوص یوزر ویو)، کونسیپچوئل (مکمل لاجیکل نقشہ)، اور انٹرنل (فزیکل ڈسک کا ڈھانچہ)۔'
  },
  {
    id: 173,
    correct: `Data Independence means that changing data definition at one level does not require rewriting programs at higher levels.

Two Types:
1. Logical Data Independence: Adding new columns or tables does not break existing application programs.
2. Physical Data Independence: Moving files to new hard disks or rebuilding indexes does not affect application programs.

Importance:
• In traditional file systems, any change to file layout required rewriting code.
• In DBMS, data independence drastically cuts maintenance time and software development costs.`,
    explanation: 'Data independence isolates programs from changes in database design and storage.',
    urdu_answer: 'ڈیٹا انڈیپینڈنس کا مطلب ہے کہ ڈیٹا یا ہارڈ ڈسک میں تبدیلی کرنے پر سافٹ ویئر کوڈ کو دوبارہ نہ لکھنا پڑے۔'
  },

  // ==========================================
  // CS403 - LECTURE 4
  // ==========================================
  {
    id: 220,
    correct: `1. Data Storage, Retrieval, and Update
2. Data Dictionary / Catalog Management (Metadata)
3. Concurrency Control (Multi-user access)
4. Backup and Recovery Services
5. Security and Authorization Services`,
    explanation: 'Five core DBMS functions: Storage/Retrieval, Catalog, Concurrency, Recovery, and Security.',
    urdu_answer: 'DBMS کے پانچ اہم افعال: ڈیٹا محفوظ اور تلاش کرنا، ڈیٹا ڈکشنری، ملٹی یوزر کنٹرول، بیک اپ اور سیکیورٹی۔'
  },
  {
    id: 221,
    correct: `• Description: In File Server architecture, database files are stored on a central file server, but all processing and query execution happen on client workstations.
• Main Disadvantage: High network traffic because entire files must be sent across the network to clients for each query.`,
    explanation: 'File Server runs queries on clients, causing massive network data transfer.',
    urdu_answer: 'فائل سرور پر تمام پراسیسنگ کلائنٹ کمپیوٹر کرتا ہے، جس سے نیٹ ورک پر ضرورت سے زیادہ بوجھ پڑتا ہے۔'
  },
  {
    id: 222,
    correct: `In Client-Server architecture, the server runs the query and sends back only the filtered result rows to the client (instead of entire files), significantly reducing network traffic and speeding up performance.`,
    explanation: 'Client-server transfers only requested query results, not whole files.',
    urdu_answer: 'کلائنٹ سرور میں سرور صرف مطلوبہ جواب بھیجتا ہے پوری فائل نہیں، جس سے اسپیڈ تیز ہوتی ہے۔'
  },
  {
    id: 223,
    correct: `• Internal View: How the DBMS software manages stored records, field lengths, and indexes.
• Physical View: How the operating system and disk hardware actually store raw bytes, sectors, and tracks on physical disks.`,
    explanation: 'Internal view is DBMS-level storage; Physical view is OS/disk hardware-level storage.',
    urdu_answer: 'انٹرنل ویو: DBMS کا ریکارڈز دیکھنے کا انداز۔ فزیکل ویو: ہارڈ ڈسک پر بائٹس اور سیکٹرز کا اصل ڈھانچہ۔'
  },
  {
    id: 224,
    correct: `1. Teleprocessing:
• A central mainframe handles all processing and storage.
• Users connect through simple "dumb" terminals with no processing power.

2. File Server:
• Files are stored on a central server.
• Client machines run all queries, causing heavy network traffic as whole files travel over the network.

3. Client-Server:
• Processing is split:
  - Client: Handles the user interface (UI).
  - Server: Executes queries, enforces security, and returns only results.
• Fast, scalable, and minimizes network traffic.`,
    explanation: 'Teleprocessing = centralized mainframe; File server = client does processing; Client-server = split processing.',
    urdu_answer: 'ملٹی یوزر آرکیٹیکچر: ٹیلی پراسیسنگ (مرکزی مین فریم)، فائل سرور (کلائنٹ پر کام)، اور کلائنٹ سرور (کام سرور اور کلائنٹ میں تقسیم)۔'
  },
  {
    id: 225,
    correct: `1. Data Storage & Retrieval: Securely storing and fast searching of records.
2. Data Dictionary (Catalog): Storing metadata about tables, fields, and access rules.
3. Concurrency Control: Allowing many users to update data without overwriting each other.
4. Recovery Services: Restoring data safely if power fails or system crashes.
5. Security Services: Enforcing logins and permissions so users only access allowed data.`,
    explanation: 'Core functions: Data storage/retrieval, catalog, concurrency, recovery, and authorization.',
    urdu_answer: 'DBMS کے بنیادی افعال: ڈیٹا سنبھالنا، ڈیٹا ڈکشنری، ملٹی یوزر ہم آہنگی، خرابی کے بعد بحالی، اور حفاظتی کنٹرول۔'
  },

  // ==========================================
  // CS504 - LECTURE 1
  // ==========================================
  {
    id: 184,
    correct: `Software engineering is a "Balancing Act" because engineers must balance conflicting goals:
• Cost vs Quality: Higher quality requires more testing and cost.
• Delivery Time vs Features: Quick release often requires cutting extra features.
• Speed vs Maintainability: Ultra-fast code is often hard to read and modify.

The goal is to find the best balance within the project budget and deadline.`,
    explanation: 'SE balances conflicting trade-offs like cost, schedule, features, and quality.',
    urdu_answer: 'سافٹ ویئر انجینئرنگ ایک بیلنسنگ ایکٹ ہے کیونکہ اس میں لاگت، وقت، کوالٹی اور فیچرز کے درمیان توازن رکھنا پڑتا ہے۔'
  },
  {
    id: 185,
    correct: `1. Software is engineered, not manufactured: Copying software costs virtually nothing, unlike physical factories.
2. Software does not wear out: It does not break from physical friction or rust; it deteriorates due to bugs and changing requirements.
3. Custom-built nature: Most software is custom-written rather than assembled from ready-made catalog parts.`,
    explanation: 'Software is engineered not manufactured, does not wear out physically, and is custom-built.',
    urdu_answer: 'سافٹ ویئر فیکٹری میں تیار نہیں ہوتا، یہ وقت کے ساتھ گھستا یا پرانا نہیں ہوتا، اور زیادہ تر مخصوص بنایا جاتا ہے۔'
  },
  {
    id: 186,
    correct: `Principle:
This is the Law of Diminishing Returns: increasing one input while holding others constant eventually yields smaller and smaller extra benefits.

Application to Software Engineering:
• Testing & Bug Fixing: Early testing finds most bugs quickly. Finding the last few rare bugs requires huge time and money.
• "Good Enough" Quality: Teams stop testing once software reaches an acceptable reliability standard, because 100% bug-free software is impossible and too expensive.`,
    explanation: 'Law of Diminishing Returns: testing beyond a reasonable point yields minimal gains at huge cost.',
    urdu_answer: 'قانونِ گرتی ہوئی افادیت: ایک حد کے بعد مزید ٹیسٹنگ سے کم فائدے اور زیادہ اخراجات ہوتے ہیں، اس لیے قابل قبول کوالٹی پر کام مکمل مانا جاتا ہے۔'
  },

  // ==========================================
  // CS504 - LECTURE 2
  // ==========================================
  {
    id: 193,
    correct: `The four layers of the Software Engineering Framework are:
1. Quality Focus: The foundation and commitment to continuous improvement.
2. Process: The framework that glues activities, milestones, and deliverables together.
3. Methods: The technical "how-to" techniques for requirements, design, and coding.
4. Tools: Automated software that supports methods and processes (e.g., IDEs, Git).`,
    explanation: 'The four layers are Quality Focus, Process, Methods, and Tools.',
    urdu_answer: 'سافٹ ویئر انجینئرنگ کے چار لیئرز: کوالٹی فوکس، پراسیس، میتھڈز اور ٹولز۔'
  },
  {
    id: 194,
    correct: `The four stages of the Software Development Loop are:
1. Status Quo: The current working state and operational system.
2. Problem Definition: Identifying the problem or need for improvement.
3. Technical Development: Designing and coding the software solution.
4. Solution Integration: Deploying the solution to create the new status quo.`,
    explanation: 'Development loop: Status Quo -> Problem Definition -> Technical Development -> Solution Integration.',
    urdu_answer: 'سافٹ ویئر لوپ کے 4 مراحل: موجودہ حالت (Status Quo)، مسئلہ کی پہچان، حل کی تیاری، اور سسٹم میں شمولیت۔'
  },
  {
    id: 195,
    correct: `The Construction phase includes:
1. Detailed Design: Creating module designs and algorithms.
2. Coding: Writing source code in programming languages.
3. Unit & Integration Testing: Testing individual components and their interactions.
4. Debugging & Code Inspection: Finding and fixing code defects.`,
    explanation: 'Construction involves detailed design, coding, testing, and debugging.',
    urdu_answer: 'کنسٹرکشن مرحلے کے کام: تفصیلی ڈیزائن، کوڈنگ، یونٹ ٹیسٹنگ، اور ڈیبگنگ۔'
  },
  {
    id: 196,
    correct: `1. Vision Phase (Why?):
• Identifies business goals, economic feasibility, and reasons for building the system.

2. Definition Phase (What?):
• Elicits user needs and documents functional and non-functional requirements in the SRS.

3. Development Phase (How?):
• Architects, designs, codes, and tests the software.

4. Maintenance Phase (Evolution):
• Fixes production bugs, adapts to environment changes, and adds new features.`,
    explanation: 'Four phases: Vision (Why), Definition (What), Development (How), Maintenance (Evolution).',
    urdu_answer: 'چار بنیادی فیز: وژن (کیوں؟)، ڈیفینیشن (کیا کرنا ہے؟)، ڈیولپمنٹ (کیسے بنانا ہے؟)، اور مینٹیننس (سسٹم کی دیکھ بھال)۔'
  },
  {
    id: 197,
    correct: `Cost Escalation Model:
The cost of fixing a software defect increases exponentially in later phases:
• Requirements Phase: Costs very little ($1x) — simply rewrite a sentence.
• Design Phase: Costs $3x–$5x — update diagrams and contracts.
• Coding Phase: Costs $10x — rewrite code and unit tests.
• Maintenance Phase: Costs $100x+ — causes downtime, emergency patches, and user disruption.

Why Early Detection is Critical:
Finding bugs early prevents defects from multiplying into design and code, saving significant project time and budget.`,
    explanation: 'Fixing bugs in maintenance costs up to 100x more than in requirements; early detection saves money.',
    urdu_answer: 'شروعات میں غلطی ٹھیک کرنا آسان اور سستا ہوتا ہے، جبکہ ریلیز کے بعد بگ ٹھیک کرنا 100 گنا زیادہ مہنگا پڑتا ہے۔'
  },

  // ==========================================
  // CS504 - LECTURE 3
  // ==========================================
  {
    id: 206,
    correct: `• Definition: Requirement Engineering is the disciplined process of discovering, analyzing, validating, and documenting what a software system must do.
• Primary Focus: Belongs to the Definition Phase and focuses strictly on "WHAT" the system must accomplish, not "HOW" to implement it.`,
    explanation: 'Requirement Engineering specifies WHAT to build in the Definition phase.',
    urdu_answer: 'ریکوائرمنٹ انجینئرنگ کا مقصد یہ طے کرنا ہے کہ سسٹم "کیا" کام کرے گا (WHAT)، نہ کہ یہ کہ کیسے بنے گا۔'
  },
  {
    id: 207,
    correct: `1. Root Cause of Failure: 40% to 60% of all software bugs originate from poor or missing requirements.
2. Defect Multiplication: A wrong requirement leads to flawed designs and hundreds of buggy lines of code.
3. Cost Savings: Catching requirement errors early is up to 100 times cheaper than fixing them after product launch.
4. Right Product: Ensures developers build the software the client actually needs.`,
    explanation: 'Poor requirements cause 40-60% of bugs; early elicitation ensures building the right product.',
    urdu_answer: '40 سے 60 فیصد خامیاں غلط ریکوائرمنٹس سے جنم لیتی ہیں، اس لیے صحیح معلومات اکٹھی کرنا سب سے ضروری ہے۔'
  },
  {
    id: 208,
    correct: `The SRS (Software Requirements Specification) document acts as the central contract across the project:
1. Planning: Used by managers to estimate project cost, schedule, and team size.
2. Design & Coding: Serves as the blueprint for programmers to write software features.
3. Testing: Quality assurance teams use it to write test cases and verify system behavior.
4. Scope Control: Baseline document used to evaluate customer change requests and prevent scope creep.`,
    explanation: 'SRS is the central blueprint for project planning, coding, testing, and change management.',
    urdu_answer: 'SRS دستاویز پراجیکٹ کا بنیادی معاہدہ ہے جو پلاننگ، کوڈنگ، ٹیسٹنگ اور تبدیلیوں کو کنٹرول کرنے کے کام آتی ہے۔'
  },
  {
    id: 209,
    correct: `Brooks' Perspective:
Turing Award winner Fred Brooks stated: "The hardest single part of building a software system is deciding precisely what to build."

Why It Is the Hardest Part:
1. Communication Gap: Clients know their business needs but struggle to explain them in technical terms.
2. Shifting Needs: Business requirements constantly change while development is underway.
3. Severe Impact: Coding bugs are easy to fix, but building the wrong system results in complete project failure.`,
    explanation: 'Deciding what to build is hardest due to communication gaps, shifting needs, and high risk of failure.',
    urdu_answer: 'فریڈ بروکس کا قول: سب سے مشکل کام یہ فیصلہ کرنا ہے کہ کیا بنانا ہے۔ غلط سسٹم بن جانے سے پورا پراجیکٹ ڈوب جاتا ہے۔'
  },

  // ==========================================
  // CS504 - LECTURE 4
  // ==========================================
  {
    id: 305,
    correct: `• Functional Requirements: Describe specific behaviors, services, and product features ("WHAT the system does").
  Example: "The student portal shall generate a PDF fee challan upon course registration."

• Non-Functional Requirements: Describe quality attributes, performance benchmarks, and constraints ("HOW WELL the system performs").
  Example: "The fee challan generation must complete within 2 seconds with 99.9% uptime."`,
    explanation: 'Functional = system features; Non-functional = quality and performance benchmarks.',
    urdu_answer: 'فنکشنل: سسٹم کیا کام کرے گا (جیسے چالان بنانا)۔ نان فنکشنل: معیار اور رفتار کیسی ہوگی (جیسے 2 سیکنڈ میں بننا)۔'
  },
  {
    id: 306,
    correct: `A good Requirement Statement document must be:
1. Complete: Covers all necessary features and constraints without missing details.
2. Correct: Accurately reflects authentic user and business needs.
3. Feasible: Can be realistically built within available budget and time.
4. Verifiable: Specified clearly so an objective test can prove compliance.`,
    explanation: 'Four key characteristics: Complete, Correct, Feasible, and Verifiable.',
    urdu_answer: 'ایک اچھے ریکوائرمنٹ ڈاکومنٹ کے 4 خصائص: مکمل (Complete)، درست (Correct)، قابل عمل (Feasible)، اور قابل تصدیق (Verifiable)۔'
  },
  {
    id: 307,
    correct: `• Stakeholders: Anyone who has an interest in or is affected by the software (e.g., end-users, managers, developers, clients).

• Why Identifying All Classes is Important:
1. Prevents Failure: Actual end-users are the most critical stakeholders; ignoring them leads to system rejection.
2. Resolves Conflicts: Different groups have contrasting priorities that must be balanced early.
3. Prevents Scope Creep: Unidentified stakeholders emerge late with costly change requests.`,
    explanation: 'Stakeholders are all affected parties; identifying them prevents project failure and scope creep.',
    urdu_answer: 'اسٹیک ہولڈر: سسٹم سے وابستہ تمام افراد۔ سب کی شناخت اس لیے ضروری ہے تاکہ صارفین کی ضروریات نظر انداز نہ ہوں۔'
  },
  {
    id: 308,
    correct: `The four levels of requirements (using a Spell Checker example):

1. Business Requirements (High-level goal):
• Objective: Why the software is built.
• Example: "Improve document editing speed by 30% to grow educational software sales."

2. User Requirements (User goal):
• Objective: What the user needs to achieve.
• Example: "The author needs to quickly highlight and fix misspelled words."

3. Functional Requirements (System feature):
• Objective: What the software does.
• Example: "The system underlines misspelled words in red and displays 5 suggested corrections on right-click."

4. Non-Functional Requirements (Quality benchmark):
• Objective: How well it performs.
• Example: "The spell check must scan 2,000 words per second and consume less than 30MB RAM."`,
    explanation: 'Four levels: Business (goals), User (tasks), Functional (features), Non-Functional (performance).',
    urdu_answer: 'چار درجات: بزنس (بنیادی مقصد)، یوزر (صارف کی ضرورت)، فنکشنل (سافٹ ویئر کا فیچر)، اور نان فنکشنل (رفتار اور کارکردگی)۔'
  },
  {
    id: 309,
    correct: `1. Requirement Statement vs Requirement Specification:
• Requirement Statement (Definition): Written in simple, non-technical language for clients and users, focusing on business needs and problem overview.
• Requirement Specification (SRS): Written in precise technical language for developers and testers, detailing inputs, outputs, algorithms, and interfaces.

2. Quality Characteristics of a Requirement Statement:
• Complete: No missing functions or gaps.
• Correct: Accurately reflects user needs.
• Feasible: Technically buildable within budget.
• Necessary: Every requirement adds real value.
• Prioritized: Ranked by urgency.
• Unambiguous: Has only one clear interpretation.
• Verifiable: Can be objectively tested.`,
    explanation: 'Statement is user-facing; Specification is developer-facing technical blueprint.',
    urdu_answer: 'سٹیٹمنٹ عام فہم الفاظ میں کلائنٹ کے لیے ہوتی ہے۔ سپیسیفیکیشن پروگرامرز کے لیے تکنیکی دستاویز ہوتی ہے۔'
  },

  // ==========================================
  // CS201 & CS301
  // ==========================================
  {
    id: 25,
    correct: `• while Loop (Entry-controlled): Tests the condition BEFORE executing the loop body. If the condition is false initially, the loop body executes 0 times.
• do-while Loop (Exit-controlled): Executes the loop body FIRST, then tests the condition. The loop body always executes at least once.`,
    explanation: 'while checks condition before execution; do-while executes at least once before checking.',
    urdu_answer: 'while لوپ پہلے شرط چیک کرتا ہے۔ do-while لوپ کم از کم ایک بار ضرور چلتا ہے۔'
  },
  {
    id: 27,
    correct: `• Definition: An Abstract Data Type (ADT) is a mathematical model for data types defined solely by its behavior and supported operations, hiding internal implementation.
• Examples:
  1. Stack: Operations push() and pop() using LIFO (Last In First Out).
  2. Queue: Operations enqueue() and dequeue() using FIFO (First In First Out).`,
    explanation: 'An ADT defines operations and behavior without showing internal implementation.',
    urdu_answer: 'ADT ڈیٹا کی ساخت کو اندرونی کوڈ چھپا کر صرف اس کے کام (Operations) کی بنیاد پر بیان کرتا ہے۔'
  },

  // ==========================================
  // MGT201 - LECTURE 1
  // ==========================================
  {
    id: 36,
    correct: `• Profit Maximization: Focuses strictly on short-term net accounting profit, ignoring the timing of cash flows and business risks.
• Shareholder Wealth Maximization: The primary goal of financial management, focused on maximizing the long-term market price of common stock while accounting for risk and cash flow timing.`,
    explanation: 'Profit maximization is short-term accounting profit; Wealth maximization is long-term stock value.',
    urdu_answer: 'پرافٹ میکسی مائزیشن قلیل مدتی منافع دیکھتی ہے، جبکہ ویلتھ میکسی مائزیشن شیئر کی قیمت اور طویل مدتی قدر بڑھاتی ہے۔'
  },
  {
    id: 37,
    correct: `1. Sole Proprietorship:
• Owned by one individual.
• Unlimited liability (personal assets at risk).
• Life ends with the owner.
• Taxed once as personal income.
• Hard to raise large capital.

2. Partnership:
• Owned by two or more people.
• Unlimited liability for general partners.
• Dissolves when a partner leaves or dies.
• Taxed once as personal income.
• Moderate ability to raise capital.

3. Corporation:
• Separate legal entity owned by shareholders.
• Limited liability (shareholders lose only invested amount).
• Unlimited perpetual life.
• Subject to double taxation (corporate tax + dividend tax).
• Easiest to raise large capital by selling shares.`,
    explanation: 'Three forms: Proprietorship (1 owner, unlimited liability), Partnership (2+ owners), Corporation (limited liability, separate legal entity).',
    urdu_answer: 'سول پروپرائٹرشپ: ایک مالک، لا محدود ذمہ داری۔ پارٹنرشپ: دو یا زیادہ شراکت دار۔ کارپوریشن: الگ قانونی وجود اور محدود ذمہ داری۔'
  },

  // ==========================================
  // MGT201 - LECTURE 2
  // ==========================================
  {
    id: 46,
    correct: `• Primary Market: The market where new securities (stocks or bonds) are issued and sold to investors for the first time (e.g., IPO). The issuing company receives the money.
• Secondary Market: The market where existing securities are traded between investors (e.g., PSX, NYSE). The issuing company receives no money from these trades.`,
    explanation: 'Primary market issues new shares (firm gets cash); Secondary market trades existing shares among investors.',
    urdu_answer: 'پرائمری مارکیٹ میں نئے شیئرز جاری ہوتے ہیں (کمپنی کو پیسے ملتے ہیں)۔ سیکنڈری مارکیٹ میں پرانے شیئرز آپس میں بکے جاتے ہیں۔'
  },
  {
    id: 47,
    correct: `1. Balance Sheet:
• Snapshot of a firm's financial position on a specific date.
• Accounting Equation: Assets = Liabilities + Equity.

2. Income Statement:
• Summarizes operating results over a period of time.
• Equation: Revenues - Expenses = Net Income (Profit or Loss).

3. Cash Flow Statement:
• Shows actual cash inflows and outflows over a period, divided into:
  - Operating Activities (day-to-day business)
  - Investing Activities (buying/selling fixed assets)
  - Financing Activities (issuing stock, paying debt/dividends).`,
    explanation: 'Balance Sheet = Assets & Liabilities at a date; Income Statement = Revenue & Expenses; Cash Flow = Cash movements.',
    urdu_answer: 'بیلنس شیٹ اثاثے اور واجبات دکھاتی ہے۔ انکم اسٹیٹمنٹ منافع یا نقصان دکھاتی ہے۔ کیش فلو کیش کی آمد و رفت ظاہر کرتی ہے۔'
  },

  // ==========================================
  // MGT201 - LECTURE 3
  // ==========================================
  {
    id: 55,
    correct: `• Formulas:
  - Current Ratio = Current Assets / Current Liabilities
  - Quick Ratio = (Current Assets - Inventory) / Current Liabilities

• Why Inventory is Excluded from Quick Ratio:
Inventory is the least liquid current asset. It takes time to sell and convert into cash, and may require price markdowns during urgent liquidation.`,
    explanation: 'Quick ratio excludes inventory because inventory takes time to sell and convert into cash.',
    urdu_answer: 'کوئیک ریشو میں انوینٹری اس لیے نکالتے ہیں کیونکہ سامان آسانی اور جلدی کیش میں تبدیل نہیں ہوتا۔'
  },
  {
    id: 56,
    correct: `The five main categories of Financial Ratios:

1. Liquidity Ratios: Measure ability to pay short-term bills (e.g., Current Ratio, Quick Ratio).
2. Asset Management Ratios: Measure how efficiently assets generate sales (e.g., Inventory Turnover).
3. Debt Management (Leverage) Ratios: Measure the use of borrowed debt financing (e.g., Debt Ratio, Debt-to-Equity).
4. Profitability Ratios: Measure overall net return on sales and investment (e.g., Net Profit Margin, ROE).
5. Market Value Ratios: Measure stock market price relative to earnings and book value (e.g., P/E Ratio).`,
    explanation: 'Five ratio categories: Liquidity, Asset Management, Debt, Profitability, and Market Value.',
    urdu_answer: 'پانچ فنانشل ریشوز: لیکویڈیٹی (قرض ادائیگی)، ایسٹ مینجمنٹ (اثاثوں کا استعمال)، ڈیبٹ (قرضہ)، منافع (پرافٹ)، اور مارکیٹ ویلیو۔'
  },

  // ==========================================
  // MGT201 - LECTURE 4
  // ==========================================
  {
    id: 290,
    correct: `Formula: PV = FV / (1 + r)^n

Given:
• Target Future Value (FV) = Rs. 1,000,000
• Interest rate (r) = 10% = 0.10
• Number of years (n) = 65 - 21 = 44 years

Calculation:
PV = 1,000,000 / (1.10)^44
PV = 1,000,000 / 66.264 = Rs. 15,091.13

Answer: You must invest Rs. 15,091.13 today.`,
    explanation: 'PV = 1,000,000 / (1.10)^44 = Rs. 15,091.13.',
    urdu_answer: 'اج Rs. 15,091.13 انویسٹ کرنے ہوں گے تاکہ 44 سال بعد 10 فیصد پر 10 لاکھ روپے بن سکیں۔'
  },
  {
    id: 291,
    correct: `• Compounding: The process of calculating the Future Value (FV) of present money by earning interest on both principal and past interest. (Moving forward in time).
• Discounting: The process of calculating the Present Value (PV) of future money by removing interest. (Moving backward in time).`,
    explanation: 'Compounding calculates future value; Discounting calculates present value.',
    urdu_answer: 'کمپاؤنڈنگ: مستقبل کی قدر (FV) معلوم کرنا۔ ڈسکاؤنٹنگ: مستقبل کے پیسے کی موجودہ قدر (PV) معلوم کرنا۔'
  },
  {
    id: 292,
    correct: `• Simple Interest: Interest is earned only on the initial principal.
  Example: Rs. 1,000 at 10% for 3 years earns Rs. 100 each year = Rs. 300 interest (Total = Rs. 1,300).

• Compound Interest: Interest is earned on both the principal and previous accumulated interest.
  Example: Rs. 1,000 at 10% for 3 years = Rs. 1,000 × (1.10)^3 = Rs. 1,331 (Interest = Rs. 331).`,
    explanation: 'Simple interest earns only on principal; Compound interest earns interest on interest.',
    urdu_answer: 'سادہ سود صرف اصل رقم پر ملتا ہے۔ کمپاؤنڈ سود میں سود پر بھی مزید سود ملتا ہے۔'
  },
  {
    id: 293,
    correct: `Concept:
A rupee today is worth more than a rupee in the future.

Why Money has Time Value:
1. Earning Capacity: Money in hand can be invested immediately to earn interest.
2. Purchasing Power (Inflation): Future prices rise, reducing purchasing power.
3. Risk / Uncertainty: Future payments carry the risk of default.

Corporate Applications:
Used in project evaluation (NPV, IRR), bond and stock valuation, and loan repayment scheduling.`,
    explanation: 'Money today is worth more due to investment returns, inflation, and default risk.',
    urdu_answer: 'آج کا روپیہ کل کے روپے سے زیادہ قیمتی ہے کیونکہ اس سے فوری منافع کمایا جا سکتا ہے اور مہنگائی اس کی قدر گھٹا دیتی ہے۔'
  },
  {
    id: 294,
    correct: `• Nominal APR: The stated annual interest rate that does not account for compounding during the year.
• Effective Annual Rate (EAR): The actual annual rate earned after accounting for intra-year compounding.
  Formula: EAR = (1 + r/m)^m - 1

Why EAR Increases:
Compounding more frequently (e.g., monthly vs annually) earns interest on interest sooner.

Numerical Comparison (for 12% stated APR):
• Annual compounding (m=1): EAR = 12.00%
• Semi-annual (m=2): (1 + 0.06)^2 - 1 = 12.36%
• Monthly (m=12): (1 + 0.01)^12 - 1 = 12.68%`,
    explanation: 'More compounding periods per year increase the true effective yield (EAR).',
    urdu_answer: 'نومینل ریٹ عام سالانہ شرح ہے، جبکہ EAR اصل شرح ہے جو بار بار سود ملنے سے بڑھ جاتی ہے۔'
  },

  // ==========================================
  // MTH202 - LECTURE 1
  // ==========================================
  {
    id: 238,
    correct: `• Statement (Proposition): A declarative sentence that is either true or false, but not both.
  Examples: "2 + 2 = 4" (True), "Islamabad is in France" (False).

• Sentence: A general statement, question, or command that is not necessarily true or false.
  Examples: "Where are you going?", "Close the door!"`,
    explanation: 'A statement must be strictly true or false; a sentence can be a command or question.',
    urdu_answer: 'اسٹیٹمنٹ وہ جملہ ہے جو یا تو مکمل سچ ہو یا جھوٹ۔ عام جملہ سوال یا حکم بھی ہو سکتا ہے۔'
  },
  {
    id: 239,
    correct: `• Truth Table: A mathematical table showing the truth values of a compound statement for all possible truth values of its variables.
• Total Rows Formula: A truth table with n statement variables has 2^n rows.`,
    explanation: 'Truth tables show all truth value combinations; row count formula is 2^n.',
    urdu_answer: 'ٹروتھ ٹیبل تمام ممکنہ سچ یا جھوٹ کے نتائج دکھاتا ہے۔ n متغیرات کے لیے کل قطاریں 2^n ہوتی ہیں۔'
  },
  {
    id: 240,
    correct: `Given: m = "Ali is good in Mathematics", c = "Ali is a Computer Science student"

(a) ~c:
Ali is not a Computer Science student.

(b) c ∨ m:
Ali is a Computer Science student OR Ali is good in Mathematics.

(c) m ∧ ~c:
Ali is good in Mathematics AND Ali is not a Computer Science student.`,
    explanation: '~ is NOT, ∨ is OR, ∧ is AND.',
    urdu_answer: '(a) علی کمپیوٹر سائنس کا طالب علم نہیں ہے۔ (b) علی طالب علم ہے یا حساب میں اچھا ہے۔ (c) علی حساب میں اچھا ہے اور طالب علم نہیں ہے۔'
  },
  {
    id: 241,
    correct: `General Formula: Total rows = 2^n

Calculations:
(a) n = 2 variables: 2^2 = 4 rows
(b) n = 3 variables: 2^3 = 8 rows
(c) n = 4 variables: 2^4 = 16 rows
(d) n = 5 variables: 2^5 = 32 rows`,
    explanation: 'Total rows = 2^n where n is the number of variables.',
    urdu_answer: 'کل قطاریں = 2^n: دو کے لیے 4، تین کے لیے 8، چار کے لیے 16، اور پانچ کے لیے 32۔'
  },
  {
    id: 242,
    correct: `Rule:
A conjunction (A ∧ B) is TRUE only when BOTH A and B are true. If either statement is false, the conjunction is FALSE.

Truth Table:
A | B | A ∧ B
--+---+------
T | T |   T
T | F |   F
F | T |   F
F | F |   F`,
    explanation: 'Conjunction is true only when both statements are true.',
    urdu_answer: 'کنجنکشن (A ∧ B) صرف اس وقت سچ ہوتا ہے جب A اور B دونوں سچ ہوں۔'
  },

  // ==========================================
  // MTH202 - LECTURE 2
  // ==========================================
  {
    id: 255,
    correct: `Statement (p → q): "If you have flu, then you will miss the final examination."

• Converse (q → p):
"If you miss the final examination, then you have flu."

• Inverse (~p → ~q):
"If you do not have flu, then you will not miss the final examination."

• Contrapositive (~q → ~p):
"If you do not miss the final examination, then you do not have flu."`,
    explanation: 'Converse: q -> p; Inverse: ~p -> ~q; Contrapositive: ~q -> ~p.',
    urdu_answer: 'کنورس: اگر امتحان چھوٹا تو فلو ہے۔ انورس: اگر فلو نہیں تو امتحان نہیں چھوٹے گا۔ کنٹراپوزیٹو: اگر امتحان نہیں چھوٹا تو فلو نہیں تھا۔'
  },
  {
    id: 256,
    correct: `• Tautology: A statement that is ALWAYS TRUE in all cases.
  Example: p ∨ ~p ("It is raining or it is not raining").

• Contradiction: A statement that is ALWAYS FALSE in all cases.
  Example: p ∧ ~p ("It is raining and it is not raining").

• Contingency: A statement that is neither always true nor always false (can be T or F).
  Example: p ∧ q.`,
    explanation: 'Tautology = always true; Contradiction = always false; Contingency = both true and false possible.',
    urdu_answer: 'ٹوٹولوجی ہمیشہ سچ ہوتی ہے، کنٹراڈکشن ہمیشہ جھوٹ ہوتی ہے، اور کنٹنجنسی میں دونوں ممکن ہوتے ہیں۔'
  },
  {
    id: 257,
    correct: `• Negation Rule: ~(p → q) ≡ p ∧ ~q
• Explanation: The negation of "If p then q" means "p happens AND q does not happen". It is NOT a conditional statement because it uses the conjunction operator (∧) instead of an implication arrow (→).`,
    explanation: '~(p -> q) is logically equivalent to p ∧ ~q, which is a conjunction.',
    urdu_answer: '~(p → q) برابر ہے p ∧ ~q کے۔ یہ کنڈیشنل اس لیے نہیں ہے کیونکہ اس میں تیر (→) کے بجائے (∧) آتا ہے۔'
  },
  {
    id: 258,
    correct: `(a) "If 1 = 1 (T), then 2 = 2 (T)":
True (T → T is True).

(b) "If 1 = 1 (T), then 2 = 3 (F)":
False (T → F is False).

(c) "1 + 1 = 3 (F) iff earth is flat (F)":
True (F ↔ F is True).

(d) "Sky is blue (T) iff 1 = 0 (F)":
False (T ↔ F is False).

(e) "x > 5 iff x^2 > 25":
False (For x = -6, x^2 = 36 > 25 is True, but x > 5 is False).`,
    explanation: 'Conditional is false only when T -> F. Biconditional is true when both have the same truth value.',
    urdu_answer: '(a) درست (T)، (b) غلط (F)، (c) درست (T)، (d) غلط (F)، (e) غلط (F کیونکہ منفی نمبرز پر سچ نہیں رہتا)۔'
  },
  {
    id: 259,
    correct: `Truth Table:
p | q | p → q | p ∧ q | (p → q) ↔ (p ∧ q)
--+---+-------+-------+------------------
T | T |   T   |   T   |        T
T | F |   F   |   F   |        T
F | T |   T   |   F   |        F
F | F |   T   |   F   |        F

Classification:
Contingency (the final column contains both True and False values).`,
    explanation: 'The statement evaluates to both T and F, so it is a contingency.',
    urdu_answer: 'یہ بیان ایک کنٹنجنسی (Contingency) ہے کیونکہ اس کا نتیجہ سچ اور جھوٹ دونوں پر مشتمل ہے۔'
  },
  {
    id: 260,
    correct: `Truth Table:
p | q | ~p | ~q | p → q | ~q → ~p
--+---+----+----+-------+--------
T | T |  F |  F |   T   |    T
T | F |  F |  T |   F   |    F
F | T |  T |  F |   T   |    T
F | F |  T |  T |   T   |    T

Conclusion:
Columns (p → q) and (~q → ~p) are identical in every row. Therefore, p → q ≡ ~q → ~p.`,
    explanation: 'The columns for p -> q and ~q -> ~p have identical truth values, proving equivalence.',
    urdu_answer: 'ٹروتھ ٹیبل کے آخری دونوں کالم بالکل یکساں ہیں، لہٰذا ثابت ہوا کہ دونوں بیانات منطقی طور پر برابر ہیں۔'
  },
  {
    id: 261,
    correct: `Truth Table for ~(q ∨ (q → p)) → ~p:
q | p | q → p | q ∨ (q → p) | ~(q ∨ (q → p)) | ~p | Result
--+---+-------+-------------+----------------+----+-------
T | T |   T   |      T      |       F        |  F |   T
T | F |   F   |      T      |       F        |  T |   T
F | T |   T   |      T      |       F        |  F |   T
F | F |   T   |      T      |       F        |  T |   T

Classification:
Tautology (the final column is True in every single row).`,
    explanation: 'All rows evaluate to True, so the statement is a Tautology.',
    urdu_answer: 'تمام قطاروں میں آخری نتیجہ سچ (True) آتا ہے، لہٰذا یہ ایک ٹوٹولوجی (Tautology) ہے۔'
  },

  // ==========================================
  // MTH202 - LECTURE 3
  // ==========================================
  {
    id: 272,
    correct: `De Morgan's Laws for logic:

1. First Law:
• Symbol: ~(p ∧ q) ≡ ~p ∨ ~q
• Words: The negation of a conjunction is the disjunction of the negations.

2. Second Law:
• Symbol: ~(p ∨ q) ≡ ~p ∧ ~q
• Words: The negation of a disjunction is the conjunction of the negations.`,
    explanation: 'Negation flips ∧ to ∨ and negates each variable.',
    urdu_answer: 'ڈی مورگن قوانین: ~(p ∧ q) برابر ہے ~p ∨ ~q کے، اور ~(p ∨ q) برابر ہے ~p ∧ ~q کے۔'
  },
  {
    id: 273,
    correct: `(a) "The fan is slow OR it is very hot"
Negation: "The fan is not slow AND it is not very hot."

(b) "Akram is unfit AND Saleem is injured"
Negation: "Akram is not unfit OR Saleem is not injured."`,
    explanation: 'Replace OR with AND and negate; replace AND with OR and negate.',
    urdu_answer: '(a) پنکھا تیز ہے اور زیادہ گرمی نہیں ہے۔ (b) اکرم ان فٹ نہیں ہے یا سلیم زخمی نہیں ہے۔'
  },
  {
    id: 274,
    correct: `Expression: p ∨ [~(~p ∧ q)]

Step 1: p ∨ [~(~p) ∨ ~q]     (De Morgan's Law)
Step 2: p ∨ (p ∨ ~q)         (Double Negative Law: ~(~p) ≡ p)
Step 3: (p ∨ p) ∨ ~q         (Associative Law)
Step 4: p ∨ ~q               (Idempotent Law: p ∨ p ≡ p)

Simplified Form: p ∨ ~q`,
    explanation: 'Simplifies to p ∨ ~q using De Morgan, Double Negative, Associative, and Idempotent laws.',
    urdu_answer: 'مرحلہ وار قوانین لگانے کے بعد مختصر ترین جواب: p ∨ ~q۔'
  },
  {
    id: 275,
    correct: `Given: "You get an A if (hardworking AND sunny) OR (hardworking AND rainy)."

Applying Distributive Law in reverse:
(h ∧ s) ∨ (h ∧ r) ≡ h ∧ (s ∨ r)

Simplified Statement:
"You will get an A if you are hardworking, AND (the sun shines or it rains)."`,
    explanation: 'Factoring out "hardworking" gives: hardworking AND (sunny OR rainy).',
    urdu_answer: 'مختصر جملہ: آپ کو A گریڈ ملے گا اگر آپ محنتی ہیں اور (دھوپ نکلے یا بارش ہو)۔'
  },
  {
    id: 276,
    correct: `Given: -1 < x ≤ 4
Compound Form: (x > -1) ∧ (x ≤ 4)

Negation using De Morgan's Law:
~[(x > -1) ∧ (x ≤ 4)] ≡ ~(x > -1) ∨ ~(x ≤ 4)
≡ (x ≤ -1) ∨ (x > 4)

Answer: x ≤ -1 OR x > 4`,
    explanation: 'Negation of -1 < x ≤ 4 is x ≤ -1 OR x > 4.',
    urdu_answer: 'نفی: x چھوٹا یا برابر ہے -1 کے، یا x بڑا ہے 4 سے (x ≤ -1 یا x > 4)۔'
  },
  {
    id: 277,
    correct: `Prove: ~(~p ∧ q) ∧ (p ∨ q) ≡ p

Step 1: (~(~p) ∨ ~q) ∧ (p ∨ q)     [De Morgan's Law]
Step 2: (p ∨ ~q) ∧ (p ∨ q)         [Double Negative Law: ~(~p) ≡ p]
Step 3: p ∨ (~q ∧ q)               [Distributive Law in reverse]
Step 4: p ∨ c                      [Complement Law: ~q ∧ q ≡ c]
Step 5: p                          [Identity Law: p ∨ c ≡ p]

Hence verified: LHS ≡ RHS ≡ p.`,
    explanation: 'Proves LHS ≡ p using De Morgan, Double Negative, Distributive, Complement, and Identity laws.',
    urdu_answer: 'منطقی قوانین کے اطلاق سے ثابت ہوا کہ بائیں جانب کا پورا جملہ p کے برابر ہے۔'
  },
  {
    id: 278,
    correct: `Show that ~(p → q) → p is a Tautology:

Step 1: ~[~(p → q)] ∨ p     [Conditional Law: A → B ≡ ~A ∨ B]
Step 2: (p → q) ∨ p         [Double Negative Law]
Step 3: (~p ∨ q) ∨ p         [Conditional Law: p → q ≡ ~p ∨ q]
Step 4: (q ∨ ~p) ∨ p         [Commutative Law]
Step 5: q ∨ (~p ∨ p)         [Associative Law]
Step 6: q ∨ t               [Complement Law: ~p ∨ p ≡ t]
Step 7: t                   [Universal Bound Law: q ∨ t ≡ t]

Conclusion:
The expression simplifies to t (Tautology).`,
    explanation: 'Expression reduces to t (Tautology) through standard algebraic laws of logic.',
    urdu_answer: 'تمام قوانین لگانے کے بعد جواب t (ہمیشہ سچ) آتا ہے، لہٰذا یہ ایک ٹوٹولوجی ہے۔'
  },
  {
    id: 279,
    correct: `Fundamental Laws of Logic:
1. Commutative: p ∧ q ≡ q ∧ p,  p ∨ q ≡ q ∨ p
2. Associative: (p ∧ q) ∧ r ≡ p ∧ (q ∧ r),  (p ∨ q) ∨ r ≡ p ∨ (q ∨ r)
3. Distributive: p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
4. Identity: p ∧ t ≡ p,  p ∨ c ≡ p
5. Complement: p ∨ ~p ≡ t,  p ∧ ~p ≡ c
6. Double Negative: ~(~p) ≡ p
7. Idempotent: p ∧ p ≡ p,  p ∨ p ≡ p
8. De Morgan's: ~(p ∧ q) ≡ ~p ∨ ~q,  ~(p ∨ q) ≡ ~p ∧ ~q`,
    explanation: 'Key laws: Commutative, Associative, Distributive, Identity, Complement, Double Negative, Idempotent, De Morgan.',
    urdu_answer: 'منطق کے بنیادی قوانین: کمیوٹیٹو، ایسوسی ایٹو، ڈسٹریبیوٹو، آئیڈینٹٹی، کمپلیمنٹ اور ڈی مورگن قوانین۔'
  },

  // ==========================================
  // STA301 - LECTURE 1
  // ==========================================
  {
    id: 96,
    correct: `• Plural Sense: Refers to numerical facts or figures collected systematically (e.g., population figures, student exam marks).
• Singular Sense: Refers to the science of collecting, presenting, analyzing, and interpreting numerical data.`,
    explanation: 'Plural sense = numerical data; Singular sense = scientific discipline/methods.',
    urdu_answer: 'جمع معنوں میں: اعداد و شمار (ڈیٹا)۔ واحد معنوں میں: اعداد و شمار کو جمع اور تجزیہ کرنے کا علم۔'
  },
  {
    id: 97,
    correct: `• Nominal Scale: Categorizes data into qualitative groups without order or ranking.
  Example: Gender (Male, Female), Religion, Blood Group.

• Ordinal Scale: Categorizes data into groups that have a natural order or rank, but the distances between ranks cannot be measured.
  Example: Student grades (A, B, C), Military ranks, Customer satisfaction (High, Medium, Low).`,
    explanation: 'Nominal has no order (just labels); Ordinal has meaningful ranking.',
    urdu_answer: 'نومینل اسکیل: بغیر کسی ترتیب کے گروہ (جیسے صنف)۔ آرڈینل اسکیل: ترتیب یا رینک والے گروہ (جیسے گریڈ A, B, C)۔'
  },
  {
    id: 98,
    correct: `• Discrete Variable: Takes distinct, countable values with gaps between them. It cannot take fractional values.
  Examples: Number of children in a family, number of cars in a parking lot.

• Continuous Variable: Can take any numerical value within an interval, measured on a continuous scale.
  Examples: Height, weight, temperature, time.`,
    explanation: 'Discrete is countable with no fractions; Continuous is measurable and can take any decimal value.',
    urdu_answer: 'ڈسکریٹ متغیر: گنے جانے والے عدد (جیسے بچوں کی تعداد)۔ کنٹینیوس متغیر: ناپے جانے والے عدد (جیسے قد، وزن)۔'
  },
  {
    id: 99,
    correct: `Recorded weight = 60 kg (to nearest kg).
Unit of measurement = 1 kg. Half unit = 0.5 kg.

• Lower Limit = 60 - 0.5 = 59.5 kg
• Upper Limit = 60 + 0.5 = 60.5 kg

Answer:
The true weight lies in the interval: 59.5 kg ≤ weight < 60.5 kg.`,
    explanation: 'Limits are 60 ± 0.5 kg, so 59.5 kg to 60.5 kg.',
    urdu_answer: 'طالب علم کا اصل وزن 59.5 کلوگرام سے لے کر 60.5 کلوگرام کے درمیان ہے۔'
  },
  {
    id: 100,
    correct: `The four scales of measurement:

1. Nominal Scale:
• Qualitative categories without order.
• Examples: Eye color, Gender.

2. Ordinal Scale:
• Ordered or ranked categories without measurable differences.
• Examples: Class ranks (1st, 2nd, 3rd), Performance rating (Poor, Fair, Good).

3. Interval Scale:
• Ordered with equal measurable intervals, but NO true zero (zero is arbitrary).
• Examples: Temperature in Celsius/Fahrenheit, IQ scores.

4. Ratio Scale:
• Ordered with equal intervals AND an absolute true zero point (zero means none).
• Examples: Weight, Height, Age, Income.`,
    explanation: 'Four scales: Nominal (labels), Ordinal (ranked), Interval (equal steps, no true zero), Ratio (true zero).',
    urdu_answer: 'پیمائش کے چار اسکیل: نومینل (صرف نام)، آرڈینل (ترتیب وار)، انٹرول (مساوی فاصلہ مگر صفر فرضی)، اور ریشو (حقیقی صفر کے ساتھ)۔'
  },

  // ==========================================
  // STA301 - LECTURE 2
  // ==========================================
  {
    id: 113,
    correct: `• Primary Data: Data collected for the first time by an investigator for a specific purpose (first-hand data).
  Examples: Data gathered via surveys, field experiments, or interviews.

• Secondary Data: Data that has already been collected and published by someone else.
  Examples: Government census reports, data from books or research journals.`,
    explanation: 'Primary is first-hand collected data; Secondary is previously published data.',
    urdu_answer: 'پرائمری ڈیٹا: پہلی بار خود اکٹھا کیا گیا ڈیٹا۔ سیکنڈری ڈیٹا: دوسروں کا پہلے سے شائع شدہ ڈیٹا۔'
  },
  {
    id: 114,
    correct: `A Population in statistics is the complete collection of all elements, individuals, or items about which an investigator wants to draw conclusions.
Example: All enrolled students in a university.`,
    explanation: 'Population is the complete set of all items under study.',
    urdu_answer: 'پاپولیشن: کسی تحقیق سے متعلق تمام افراد یا اشیاء کا مکمل مجموعہ۔'
  },
  {
    id: 115,
    correct: `• Sample: A representative subset or part selected from the population.
• Why Sampling is Used:
1. Low Cost: A complete census is too expensive.
2. Saves Time: Surveying a sample gives quick results.
3. Feasibility: In some cases (e.g., testing light bulbs until they burn out), complete testing destroys the population.`,
    explanation: 'A sample is a subset of a population used to save time, money, and resources.',
    urdu_answer: 'سیمپل پاپولیشن کا ایک نمائندہ حصہ ہوتا ہے۔ یہ وقت اور اخراجات بچانے کے لیے استعمال ہوتا ہے۔'
  },
  {
    id: 116,
    correct: `Five methods of collecting Primary Data:
1. Direct Personal Investigation: Meeting respondents face-to-face.
2. Indirect Oral Interviews: Asking questions from third parties who know the facts.
3. Mailed Questionnaires: Sending question forms by mail or online.
4. Schedules through Enumerators: Trained staff visit respondents and fill forms.
5. Direct Observation: Recording observations without questioning people.`,
    explanation: 'Five methods: Direct interviews, Indirect interviews, Questionnaires, Enumerator schedules, and Observation.',
    urdu_answer: 'پرائمری ڈیٹا جمع کرنے کے 5 طریقے: ذاتی انٹرویو، بالواسطہ معلومات، سوالنامہ، عملے کے ذریعے سروے، اور مشاہدہ۔'
  },
  {
    id: 117,
    correct: `• Definition: A Sampling Frame is a complete, up-to-date list of all individual units in the population from which a sample is selected.
  Example: A telephone directory, student roster, or voter registration list.

• Importance:
Without an accurate sampling frame, elements may be missed, leading to biased and unreliable sample results.`,
    explanation: 'A sampling frame is the actual list from which sample units are drawn.',
    urdu_answer: 'سیمپلنگ فریم: پاپولیشن کے تمام ارکان کی مکمل فہرست جس سے سیمپل چنا جاتا ہے (جیسے ووٹر لسٹ)۔'
  },

  // ==========================================
  // STA301 - LECTURE 3
  // ==========================================
  {
    id: 134,
    correct: `• Class Limits: Stated end values of a class grouping (e.g., 10–19, 20–29). Gaps exist between classes.
• Class Boundaries: True continuous boundaries with no gaps between consecutive classes (e.g., 9.5–19.5, 19.5–29.5). Calculated by subtracting and adding half the gap.`,
    explanation: 'Class limits have gaps between classes; Class boundaries are continuous with no gaps.',
    urdu_answer: 'کلاس لِمٹس میں وقفہ ہوتا ہے (جیسے 10-19) جبکہ کلاس باؤنڈریز مسلسل ہوتی ہیں (جیسے 9.5-19.5)۔'
  },
  {
    id: 135,
    correct: `• Definition: Relative Frequency Distribution expresses each class frequency as a fraction or percentage of total observations.
• Formula:
  Relative Frequency = f / n
  (where f = class frequency, n = total frequency = ∑f).`,
    explanation: 'Relative frequency = class frequency divided by total frequency (f / n).',
    urdu_answer: 'ریلیٹو فریکوئنسی: ہر کلاس کی فریکوئنسی کو کل تعداد پر تقسیم کر کے حاصل ہونے والا تناسب (f / n)۔'
  },
  {
    id: 136,
    correct: `Four main bases of data classification:
1. Qualitative (Attribute): Grouped by qualities (e.g., Gender, Religion).
2. Quantitative (Numeric): Grouped by numerical values (e.g., Age, Income).
3. Geographical (Spatial): Grouped by location (e.g., Sales by City or Province).
4. Chronological (Temporal): Grouped by time (e.g., GDP year by year).`,
    explanation: 'Four classification bases: Qualitative, Quantitative, Geographical, and Chronological.',
    urdu_answer: 'ڈیٹا درجہ بندی کی 4 اقسام: صفاتی (جنس)، عددی (عمر/آمدنی)، جغرافیائی (شہر)، اور زمانی (سال بہ سال)۔'
  },
  {
    id: 137,
    correct: `• Definition: Class Mark (Midpoint) is the central value dividing a class into two equal halves.
• Formula:
  Class Mark (X) = (Lower Limit + Upper Limit) / 2
  or = (Lower Boundary + Upper Boundary) / 2.`,
    explanation: 'Midpoint X = (Lower + Upper) / 2.',
    urdu_answer: 'کلاس مارک (مڈ پوائنٹ): کلاس کی نچلی اور اوپری حد کو جمع کر کے 2 پر تقسیم کرنے سے حاصل ہوتا ہے۔'
  },
  {
    id: 138,
    correct: `Calculation Table (Gap = 33.0 - 32.9 = 0.1, Adjustment = 0.05):

Class Limits | f  | Class Boundaries | Midpoint (X) | Rel. Freq (f/30) | Cum. Freq (cf)
-------------+----+------------------+--------------+------------------+---------------
30.0 – 32.9  | 2  | 29.95 – 32.95    | 31.45        | 2/30 = 0.067     | 2
33.0 – 35.9  | 4  | 32.95 – 35.95    | 34.45        | 4/30 = 0.133     | 6
36.0 – 38.9  | 14 | 35.95 – 38.95    | 37.45        | 14/30 = 0.467    | 20
39.0 – 41.9  | 8  | 38.95 – 41.95    | 40.45        | 8/30 = 0.267     | 28
42.0 – 44.9  | 2  | 41.95 – 44.95    | 43.45        | 2/30 = 0.067     | 30
Total        | 30 |                  |              | 1.000            |`,
    explanation: 'Class boundaries subtract/add 0.05; Midpoints are class averages; cf is running total.',
    urdu_answer: 'جدول میں باؤنڈریز، مڈپوائنٹ، ریلیٹو فریکوئنسی اور مجموعی فریکوئنسی کی آسان حسابی تفصیل۔'
  }
];

const updateStmt = db.prepare(`
  UPDATE questions
  SET correct = ?, explanation = ?, urdu_answer = ?
  WHERE id = ?
`);

const tx = db.transaction(() => {
  let count = 0;
  for (const u of updates) {
    const res = updateStmt.run(u.correct, u.explanation, u.urdu_answer, u.id);
    if (res.changes > 0) count++;
  }
  return count;
});

const updatedCount = tx();
console.log(`Successfully updated ${updatedCount} subjective questions with simple, short, exam-focused answers!`);

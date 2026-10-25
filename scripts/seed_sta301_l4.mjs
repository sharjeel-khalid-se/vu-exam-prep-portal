import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Find STA301
const sta301 = db.prepare(`SELECT id FROM subjects WHERE slug = 'sta301'`).get();
if (!sta301) {
  console.error('STA301 subject not found!');
  process.exit(1);
}

// Check or create Lecture 4
let l4 = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(sta301.id);
if (!l4) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 4, 'Graphical Representation of Data, Frequency Diagrams & Stem-and-Leaf')
  `).run(sta301.id);
  l4 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 4 with ID: ${l4.id}`);
} else {
  console.log(`STA301 Lecture 4 already exists with ID: ${l4.id}`);
}

const lId = l4.id;

// Delete existing questions for idempotent seed
const del = db.prepare(`DELETE FROM questions WHERE lecture_id = ?`).run(lId);
console.log(`Cleaned up ${del.changes} old questions for Lecture 4.`);

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

// 24 MCQs
const mcqs = [
  {
    stem: 'A chart consisting of horizontal or vertical bars of equal width and lengths proportional to the values they represent is called a:',
    options: {
      a: 'Pie Chart',
      b: 'Component Bar Chart',
      c: 'Simple Bar Chart',
      d: 'Multiple Bar Chart'
    },
    correct: 'c',
    explanation: 'A simple bar chart uses bars of equal width where the height/length represents the values.',
    urdu_answer: 'سادہ بار چارٹ مساوی چوڑائی والی سلاخوں پر مشتمل ہوتا ہے جن کی لمبائی اقدار کے متناسب ہوتی ہے۔'
  },
  {
    stem: 'In a simple bar chart:',
    options: {
      a: 'Width of bar is meaningful',
      b: 'Height of bar is meaningful',
      c: 'Height of bar is not meaningful',
      d: 'Height and width both are meaningful'
    },
    correct: 'b',
    explanation: 'Only the height of the bar is meaningful; width has no mathematical significance.',
    urdu_answer: 'سادہ بار چارٹ میں صرف بار کی اونچائی (Height) بامعنی ہوتی ہے، چوڑائی نہیں۔'
  },
  {
    stem: 'From the given data (Year: 1965, 1966, 1967... Turnover: 350000, 42000, 43500...), which one of the following charts can we draw?',
    options: {
      a: 'Simple bar chart',
      b: 'Multiple bar charts',
      c: 'Component bar chart',
      d: 'Pie chart'
    },
    correct: 'a',
    explanation: 'A single variable recorded across different years is represented using a simple bar chart.',
    urdu_answer: 'وقت کے ساتھ ایک متغیر کے اعداد و شمار کو سادہ بار چارٹ سے ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'Component bar charts are used when data is divided into:',
    options: {
      a: 'Parts',
      b: 'Groups',
      c: 'Circles',
      d: 'None of the above'
    },
    correct: 'a',
    explanation: 'A component (sub-divided) bar chart is used when total values are split into component parts.',
    urdu_answer: 'کمپوننٹ بار چارٹ اس وقت بنتا ہے جب ڈیٹا مختلف حصوں (Parts) میں تقسیم ہو۔'
  },
  {
    stem: 'Which of the following techniques is NOT used to represent bivariate qualitative data?',
    options: {
      a: 'Pie Chart',
      b: 'Component Bar Chart',
      c: 'Multiple Bar Chart',
      d: 'Line Chart'
    },
    correct: 'd',
    explanation: 'Line charts are used for quantitative time-series data, not for bivariate qualitative data.',
    urdu_answer: 'لائن چارٹ وقت کے مقداری ڈیٹا کے لیے ہوتا ہے، کوالٹیٹیو ڈیٹا کے لیے نہیں۔'
  },
  {
    stem: 'A circle in which sectors represent various quantities is called a:',
    options: {
      a: 'Histogram',
      b: 'Frequency Polygon',
      c: 'Pie Chart',
      d: 'Component Bar Chart'
    },
    correct: 'c',
    explanation: 'A pie chart divides a circle into sectors proportional to the quantities they represent.',
    urdu_answer: 'دائرے میں سیکٹرز کے ذریعے مقداروں کو دکھانا پائی چارٹ (Pie Chart) کہلاتا ہے۔'
  },
  {
    stem: 'A sector diagram is also called a:',
    options: {
      a: 'Bar diagram',
      b: 'Histogram',
      c: 'Historigram',
      d: 'Pie diagram / Pie chart'
    },
    correct: 'd',
    explanation: 'A pie chart is also known as a sector diagram.',
    urdu_answer: 'سیکٹر ڈایاگرام کو پائی چارٹ یا پائی ڈایاگرام بھی کہتے ہیں۔'
  },
  {
    stem: 'A pie chart consists of:',
    options: {
      a: 'A rectangle',
      b: 'A triangle',
      c: 'A square',
      d: 'A circle'
    },
    correct: 'd',
    explanation: 'A pie chart is constructed inside a circle.',
    urdu_answer: 'پائی چارٹ ایک دائرے (Circle) پر مشتمل ہوتا ہے۔'
  },
  {
    stem: 'The total angle of a Pie Chart is:',
    options: {
      a: '90°',
      b: '180°',
      c: '270°',
      d: '360°'
    },
    correct: 'd',
    explanation: 'A full circle has a total angle of 360 degrees.',
    urdu_answer: 'پائی چارٹ کا کل زاویہ 360 ڈگری ہوتا ہے۔'
  },
  {
    stem: 'In a Pie chart, the angle for each sector is calculated by the formula:',
    options: {
      a: '(Component part / Total) × 100',
      b: '(Component part / Total) × π',
      c: '(Total / Component part) × 360',
      d: '(Component part / Total) × 360°'
    },
    correct: 'd',
    explanation: 'Sector angle = (Component value / Total value) × 360°.',
    urdu_answer: 'سیکٹر اینگل = (جزوی قیمت / کل قیمت) × 360 ڈگری۔'
  },
  {
    stem: 'A Histogram contains a set of:',
    options: {
      a: 'Adjacent Rectangles',
      b: 'Non-adjacent Rectangles',
      c: 'Adjacent Squares',
      d: 'Adjacent Triangles'
    },
    correct: 'a',
    explanation: 'A histogram is composed of a set of adjacent (touching) rectangles.',
    urdu_answer: 'ہسٹوگرام آپس میں جڑی ہوئی مستطیلوں (Adjacent Rectangles) پر مشتمل ہوتا ہے۔'
  },
  {
    stem: 'A histogram consists of a set of adjacent rectangles whose bases are marked off by:',
    options: {
      a: 'Class boundaries',
      b: 'Class limits',
      c: 'Class marks',
      d: 'Class frequency'
    },
    correct: 'a',
    explanation: 'The horizontal base of each rectangle in a histogram is defined by true class boundaries.',
    urdu_answer: 'ہسٹوگرام میں مستطیلوں کی بنیادیں کلاس باؤنڈریز (Class boundaries) پر بنائی جاتی ہیں۔'
  },
  {
    stem: 'The mode of a frequency distribution can be determined graphically by a:',
    options: {
      a: 'Histogram',
      b: 'Frequency curve',
      c: 'Frequency polygon',
      d: 'Ogive'
    },
    correct: 'a',
    explanation: 'Mode can be found graphically by identifying the tallest rectangle in a histogram.',
    urdu_answer: 'موڈ (Mode) کو گراف کی مدد سے معلوم کرنے کے لیے ہسٹوگرام کا استعمال کیا جاتا ہے۔'
  },
  {
    stem: 'A frequency polygon is constructed by plotting frequency of the class interval against the:',
    options: {
      a: 'Upper limit of the class',
      b: 'Lower limit of the class',
      c: 'Mid value (midpoint) of the class',
      d: 'None of the above'
    },
    correct: 'c',
    explanation: 'Frequency polygon points are plotted at (class midpoint, class frequency).',
    urdu_answer: 'فریکوئنسی پولیگون میں فریکوئنسی کو کلاس کے مڈپوائنٹ کے سامنے پلاٹ کیا جاتا ہے۔'
  },
  {
    stem: 'If you connect the mid-points of rectangles in a histogram by a series of lines that also touches the x-axis from both ends, you get a:',
    options: {
      a: 'Ogive',
      b: 'Frequency polygon',
      c: 'Frequency curve',
      d: 'Historigram'
    },
    correct: 'b',
    explanation: 'Joining the midpoints of histogram tops with straight lines touching the x-axis forms a frequency polygon.',
    urdu_answer: 'مستطیلوں کے مڈپوائنٹس کو سیدھی لکیروں سے جوڑنے سے فریکوئنسی پولیگون بنتا ہے۔'
  },
  {
    stem: 'A graph of a cumulative frequency distribution is called a(n):',
    options: {
      a: 'Ogive / Ogive Curve',
      b: 'Frequency Polygon',
      c: 'Pie Chart',
      d: 'Bar Chart'
    },
    correct: 'a',
    explanation: 'An Ogive is the graph of a cumulative frequency distribution.',
    urdu_answer: 'مجموعی فریکوئنسی (Cumulative Frequency) کے گراف کو اوجائیو (Ogive) کہتے ہیں۔'
  },
  {
    stem: 'The data for an ogive is found in which distribution?',
    options: {
      a: 'Frequency distribution',
      b: 'Cumulative frequency distribution',
      c: 'Relative frequency distribution',
      d: 'Continuous distribution'
    },
    correct: 'b',
    explanation: 'An ogive is plotted directly from a cumulative frequency distribution.',
    urdu_answer: 'اوجائیو کے لیے ڈیٹا مجموعی فریکوئنسی ڈسٹریبیوشن سے لیا جاتا ہے۔'
  },
  {
    stem: 'Which graph is used for time series data?',
    options: {
      a: 'Frequency curve',
      b: 'Frequency polygon',
      c: 'Historigram',
      d: 'Histogram'
    },
    correct: 'c',
    explanation: 'A historigram is a line graph of time series data plotted against time.',
    urdu_answer: 'وقت کے ساتھ تبدیلی دکھانے والے ٹائم سیریز ڈیٹا کے لیے ہسٹوریگرام استعمال ہوتا ہے۔'
  },
  {
    stem: 'Stem and leaf display was introduced by:',
    options: {
      a: 'Francis Galton',
      b: 'Friedman',
      c: 'John Tukey',
      d: 'Pearson'
    },
    correct: 'c',
    explanation: 'John Tukey introduced the stem-and-leaf display in 1977.',
    urdu_answer: 'اسٹیم اینڈ لیف ڈسپلے کو جان ٹوکی (John Tukey) نے 1977 میں متعارف کرایا۔'
  },
  {
    stem: 'In a stem and leaf display, the leading digit is called _____ and trailing digit is called _____:',
    options: {
      a: 'Stem, Leaf',
      b: 'Leaf, Stem',
      c: 'Variable, Constant',
      d: 'Class, Interval'
    },
    correct: 'a',
    explanation: 'The leading digit forms the Stem, and the trailing digit forms the Leaf.',
    urdu_answer: 'پہلے ہندسے کو اسٹیم (Stem) اور آخری ہندسے کو لیف (Leaf) کہتے ہیں۔'
  },
  {
    stem: "If '2' is a leading digit in 24335, what are the trailing digits in a Stem-and-Leaf display?",
    options: {
      a: '4',
      b: '335',
      c: '4335',
      d: '43'
    },
    correct: 'c',
    explanation: 'If 2 is the stem (leading digit), the remaining digits 4335 form the leaf.',
    urdu_answer: 'اگر 2 اسٹیم ہے تو باقی ہندسے 4335 لیف بنیں گے۔'
  },
  {
    stem: 'For the data values 12, 48, 31, 54, 71, 29, 42, 62, 67, 57, 74, 27, 18, 71, 26, the stem values are:',
    options: {
      a: '2, 8, 1, 4, 9, 2, 2, 7, 7, 7, 4, 7, 8, 71, 6',
      b: '1, 2, 3, 4, 5, 6, 7',
      c: '2, 2, 3, 4, 5, 7, 8',
      d: '9, 2, 4, 7, 9, 8, 7, 5'
    },
    correct: 'b',
    explanation: 'The tens digits (10s through 70s) form the stems: 1, 2, 3, 4, 5, 6, 7.',
    urdu_answer: 'دہائی کے ہندسے 1 سے 7 تک اسٹیم بنائیں گے۔'
  },
  {
    stem: 'In a stem and leaf plot, what separates the leaf from the stem?',
    options: {
      a: 'Horizontal line',
      b: 'Vertical line',
      c: 'Dot line',
      d: 'Slash'
    },
    correct: 'b',
    explanation: 'A vertical line separates the stem column on the left from the leaves on the right.',
    urdu_answer: 'اسٹیم اور لیف کے درمیان ایک عمودی لکیر (Vertical line) ہوتی ہے۔'
  },
  {
    stem: 'The mode value from raw data can be obtained easily with the help of a:',
    options: {
      a: 'Dot plot',
      b: 'Stem and leaf plot',
      c: 'Bar chart',
      d: 'None of these'
    },
    correct: 'b',
    explanation: 'A stem-and-leaf plot retains all original values and groups identical digits together, making mode easy to spot.',
    urdu_answer: 'اسٹیم اینڈ لیف پلاٹ میں تمام اصل قیمتیں موجود ہوتی ہیں جس سے موڈ آسانی سے مل جاتا ہے۔'
  }
];

for (const m of mcqs) {
  insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
}
console.log(`Inserted ${mcqs.length} MCQs.`);

// 5 Short Questions (Concise, simple words, exam-focused)
const shorts = [
  {
    stem: 'Define multiple bar chart.',
    correct: `A Multiple Bar Chart consists of two or more bars drawn side-by-side in groups for each category.
• Purpose: Used to compare two or more related variables across different categories or years at the same time.`,
    explanation: 'Multiple bar charts group bars together to compare related variables.',
    urdu_answer: 'ملٹیپل بار چارٹ میں ہر کیٹیگری کے لیے دو یا زیادہ بارز ساتھ ساتھ بنائی جاتی ہیں تاکہ موازنہ کیا جا سکے۔'
  },
  {
    stem: 'Define Histogram. On which axis are class boundaries plotted?',
    correct: `• Definition: A Histogram is a graph made of adjacent (touching) rectangles where rectangle area is proportional to class frequency.
• Axis: True Class Boundaries are plotted on the horizontal axis (X-axis), and frequencies are plotted on the vertical axis (Y-axis).`,
    explanation: 'A histogram has adjacent rectangles plotted over class boundaries on the X-axis.',
    urdu_answer: 'ہسٹوگرام آپس میں جڑی مستطیلوں کا گراف ہے۔ کلاس باؤنڈریز X-axis پر اور فریکوئنسی Y-axis پر ہوتی ہے۔'
  },
  {
    stem: 'Differentiate between Frequency Polygon and Frequency Curve.',
    correct: `• Frequency Polygon: Constructed by plotting frequencies against class midpoints and joining the points with straight line segments.
• Frequency Curve: Drawn as a smooth, freehand curve passing through or near the points, removing sharp corners.`,
    explanation: 'Polygon uses straight lines; Curve uses a smooth freehand line.',
    urdu_answer: 'فریکوئنسی پولیگون سیدھی لکیروں سے بنتا ہے، جبکہ فریکوئنسی کرو ایک ہموار (Smooth) خمیدہ لکیر ہوتی ہے۔'
  },
  {
    stem: 'What is an Ogive? How is it constructed?',
    correct: `• Definition: An Ogive is a line graph representing a cumulative frequency distribution.
• Construction: Plot cumulative frequencies on the vertical axis (Y-axis) against upper class boundaries on the horizontal axis (X-axis), and connect points with straight lines.`,
    explanation: 'An ogive plots cumulative frequency against upper class boundaries.',
    urdu_answer: 'اوجائیو مجموعی فریکوئنسی کا گراف ہے۔ اسے اپر کلاس باؤنڈری اور مجموعی فریکوئنسی کو ملا کر بنایا جاتا ہے۔'
  },
  {
    stem: 'What is a Stem-and-Leaf Display? State its main advantage over a frequency table.',
    correct: `• Definition: A graph that splits each number into a Stem (leading digit) and a Leaf (trailing digit).
• Main Advantage: Unlike a frequency table where original data values are lost in classes, a stem-and-leaf plot keeps all original numbers while showing data shape.`,
    explanation: 'Stem-and-leaf separates leading and trailing digits, preserving all original numbers.',
    urdu_answer: 'اسٹیم اینڈ لیف اعداد کو دو حصوں میں بانٹتا ہے۔ اس کا بڑا فائدہ یہ ہے کہ اصل ڈیٹا ضائع نہیں ہوتا۔'
  }
];

for (const s of shorts) {
  insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
}
console.log(`Inserted ${shorts.length} Short Questions.`);

// 2 Long / Problem-solving Questions (5 marks each)
const longs = [
  {
    stem: 'The table shows the medium of instruction chosen by 1200 students: Urdu = 719, English = 481 (Total = 1200). Calculate the sector angles to construct a Pie Chart.',
    correct: `Formula: Sector Angle = (Component / Total) × 360°

Calculations:
1. Urdu Medium:
   Angle = (719 / 1200) × 360° = 215.7°

2. English Medium:
   Angle = (481 / 1200) × 360° = 144.3°

Check: 215.7° + 144.3° = 360.0°`,
    explanation: 'Urdu sector = 215.7°, English sector = 144.3°.',
    urdu_answer: 'اردو میڈیم کا زاویہ 215.7 ڈگری اور انگلش کا 144.3 ڈگری بنتا ہے۔'
  },
  {
    stem: 'Construct a Stem-and-Leaf display for the test scores: 12, 48, 31, 54, 71, 29, 42, 62, 67, 57, 74, 27, 18, 71, 26.',
    correct: `Step 1: Sort data in order:
12, 18, 26, 27, 29, 31, 42, 48, 54, 57, 62, 67, 71, 71, 74

Step 2: Stem (tens digit) | Leaf (units digit):

Stem | Leaf    | Frequency
-----+---------+----------
  1  | 2 8     |    2
  2  | 6 7 9   |    3
  3  | 1       |    1
  4  | 2 8     |    2
  5  | 4 7     |    2
  6  | 2 7     |    2
  7  | 1 1 4   |    3
Total frequency = 15`,
    explanation: 'Stem represents tens digit (1 to 7); leaf represents units digit.',
    urdu_answer: 'اسٹیم میں دہائی (1 سے 7) اور لیف میں اکائی کے ہندسے ترتیب سے لکھے جاتے ہیں۔'
  }
];

for (const l of longs) {
  insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
}
console.log(`Inserted ${longs.length} Long / Numerical Questions.`);

const total = db.prepare(`SELECT count(*) as cnt FROM questions WHERE lecture_id = ?`).get(lId);
console.log(`Successfully verified! Total questions in STA301 Lecture 4: ${total.cnt}`);

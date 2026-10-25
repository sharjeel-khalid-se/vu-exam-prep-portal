import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/exam.db'));
db.pragma('foreign_keys = ON');

// ── Step 1: Find MGT201 Subject ──────────────────────────────────────────────
const subj = db.prepare(`SELECT id FROM subjects WHERE slug = 'mgt201'`).get();
if (!subj) {
  console.error('MGT201 subject not found');
  process.exit(1);
}

// ── Step 2: Check if MGT201 L4 already exists ────────────────────────────────
const existing = db.prepare(`SELECT id FROM lectures WHERE subject_id = ? AND number = 4`).get(subj.id);
if (existing) {
  console.log('MGT201 Lecture 4 already exists with ID:', existing.id);
  const count = db.prepare(`SELECT count(*) as c FROM questions WHERE lecture_id = ?`).get(existing.id);
  console.log(`Lecture 4 already has ${count.c} questions.`);
  process.exit(0);
}

// ── Step 3: Insert MGT201 Lecture 4 ──────────────────────────────────────────
const l4res = db.prepare(`
  INSERT INTO lectures (subject_id, number, title)
  VALUES (?, 4, ?)
`).run(subj.id, 'Time Value of Money (TVM), Compounding & Discounting');
const l4Id = l4res.lastInsertRowid;
console.log('Inserted MGT201 Lecture 4 with ID:', l4Id);

const ins = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'mcq', ?, ?, ?, ?, ?, 1, 1, 'midterm')
`);

const insS = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'short', ?, ?, ?, ?, 3, 3, 'midterm')
`);

const insL = db.prepare(`
  INSERT INTO questions (lecture_id, type, stem, correct, explanation, urdu_answer, marks, time_minutes, question_category)
  VALUES (?, 'long', ?, ?, ?, ?, 5, 5, 'midterm')
`);

// ── Step 4: Insert 10 MCQs ───────────────────────────────────────────────────

// MCQ 1
ins.run(
  l4Id,
  'The process of finding the present value of some future amount is called:',
  JSON.stringify({
    a: 'Discounting',
    b: 'Financing',
    c: 'Lending',
    d: 'Investing'
  }),
  'a',
  'Discounting is the process of translating future cash flows into their equivalent present value using an appropriate discount rate.',
  'مستقبل کی کسی رقم کی موجودہ قیمت (Present Value) معلوم کرنے کا عمل ڈسکاؤنٹنگ (Discounting) کہلاتا ہے۔'
);

// MCQ 2
ins.run(
  l4Id,
  'Nominal Interest Rate is also known as:',
  JSON.stringify({
    a: 'Effective interest Rate',
    b: 'Annual percentage rate',
    c: 'Periodic interest rate',
    d: 'Required interest rate'
  }),
  'b',
  'The nominal interest rate stated on loans or investments without adjusting for intra-year compounding is commonly termed the Annual Percentage Rate (APR).',
  'نامینل انٹرسٹ ریٹ کو اینول پرسنٹیج ریٹ (Annual Percentage Rate - APR) بھی کہا جاتا ہے۔'
);

// MCQ 3
ins.run(
  l4Id,
  'Which of the following is the correct formula to discount a Cash Flow (CF) of a specific period n at discount rate r?',
  JSON.stringify({
    a: 'CF / (1 + r)',
    b: 'CF_n / (1 + r)^n',
    c: 'CF × (1 + r)',
    d: 'CF_n × (1 + r)^n'
  }),
  'b',
  'Present Value of a single future cash flow received in period n is computed as PV = CF_n / (1 + r)^n.',
  'مستقبل کے پیریڈ n کے کیش فلو کی موجودہ قدر معلوم کرنے کا درست فارمولا CF_n / (1 + r)^n ہے۔'
);

// MCQ 4
ins.run(
  l4Id,
  'Which of the following allows depicting graphically the timing of cash flows along with their nature as either inflows or outflows?',
  JSON.stringify({
    a: 'Cash flow diagram',
    b: 'Cash flow statement',
    c: 'Cash budget Analysis',
    d: 'None of the given options'
  }),
  'a',
  'A cash flow diagram (or timeline) visually illustrates the chronological timing and direction (positive for inflows, negative for outflows) of cash movements.',
  'کیش فلو ڈایاگرام (ٹائم لائن) کیش کے آنے (Inflows) اور جانے (Outflows) کے وقت کو گراف کی شکل میں ظاہر کرتا ہے۔'
);

// MCQ 5
ins.run(
  l4Id,
  'What is the future value of Rs. 12,000 to be paid at the end of seven years if the interest rate is 10% compounded annually?',
  JSON.stringify({
    a: 'Rs. 20,400',
    b: 'Rs. 22,400',
    c: 'Rs. 23,385',
    d: 'Rs. 23,900'
  }),
  'c',
  'Future Value = PV × (1 + r)^n = 12,000 × (1 + 0.10)^7 = 12,000 × 1.948717 = Rs. 23,384.60 ≈ Rs. 23,385.',
  'فیوچر ویلیو فارمولا: FV = 12,000 × (1.10)^7 = 12,000 × 1.9487 = 23,385 روپے۔'
);

// MCQ 6
ins.run(
  l4Id,
  'Suppose you deposit Rs. 500 in a bank for 10 years at a 7% annual interest rate. Under the concept of "simple interest", what amount of interest will you receive after 10 years?',
  JSON.stringify({
    a: 'Rs. 350',
    b: 'Rs. 500',
    c: 'Rs. 850',
    d: 'Rs. 35'
  }),
  'a',
  'Simple Interest = Principal × r × t = Rs. 500 × 0.07 × 10 = Rs. 350.',
  'سادہ سود کا فارمولا: سود = اصل زر × شرح × وقت = 500 × 0.07 × 10 = 350 روپے۔'
);

// MCQ 7
ins.run(
  l4Id,
  'The process of accumulating interest on an investment over time to earn "interest on interest" is called:',
  JSON.stringify({
    a: 'Discounting',
    b: 'Compounding',
    c: 'Amortization',
    d: 'Capital budgeting'
  }),
  'b',
  'Compounding involves calculating interest on both the initial principal and the accumulated interest from previous periods.',
  'اصل رقم کے ساتھ ساتھ پچھلے سود پر بھی مزید سود کمانے کے عمل کو کمپاؤنڈنگ (Compounding) کہتے ہیں۔'
);

// MCQ 8
ins.run(
  l4Id,
  'Which of the following generates a higher future value over multi-year horizons under the same nominal interest rate?',
  JSON.stringify({
    a: 'Simple interest',
    b: 'Compound interest',
    c: 'Both yield identical future values',
    d: 'Zero-coupon discounting'
  }),
  'b',
  'Compound interest consistently produces greater future accumulated wealth because interest earned is reinvested to generate additional interest.',
  'کمپاؤنڈ انٹرسٹ ہمیشہ سادہ سود (Simple Interest) سے زیادہ منافع پیدا کرتا ہے کیونکہ اس میں سود پر بھی سود ملتا ہے۔'
);

// MCQ 9
ins.run(
  l4Id,
  'As the discount rate increases, the present value (PV) of a fixed future cash flow:',
  JSON.stringify({
    a: 'Increases',
    b: 'Decreases',
    c: 'Remains constant',
    d: 'Approaches infinity'
  }),
  'b',
  'Because discount rate appears in the denominator PV = FV / (1 + r)^n, an increase in discount rate decreases the present value.',
  'ڈسکاؤنٹ ریٹ بڑھنے سے مستقبل کی رقم کی موجودہ قدر (Present Value) کم ہو جاتی ہے۔'
);

// MCQ 10
ins.run(
  l4Id,
  'In the formula FV = PV × (1 + r)^n, the term (1 + r)^n is officially known as the:',
  JSON.stringify({
    a: 'Future Value Interest Factor (FVIF)',
    b: 'Present Value Interest Factor (PVIF)',
    c: 'Discount Factor',
    d: 'Annuity Factor'
  }),
  'a',
  'The term (1 + r)^n is the Future Value Interest Factor (FVIF_r,n), used to project single sums into the future.',
  'فارمولے میں (1 + r)^n کو فیوچر ویلیو انٹرسٹ فیکٹر (FVIF) کہا جاتا ہے۔'
);

// ── Step 5: Insert 3 Short & Numerical Questions ─────────────────────────────

// SQ 1 (Numerical Problem — 3 Marks)
insS.run(
  l4Id,
  `Suppose you are currently 21 years old and can earn 10 percent annual interest on your investment. How much must you invest today in order to accumulate Rs. 1 million (Rs. 1,000,000) by the time you reach age 65?`,
  `Present Value Calculation:

1. Identify Given Data:
• Target Future Value (FV) = Rs. 1,000,000
• Annual Interest Rate (r) = 10% = 0.10
• Investment Horizon (n) = 65 - 21 = 44 years

2. Formula:
PV = FV / (1 + r)^n

3. Calculation:
PV = 1,000,000 / (1 + 0.10)^44
PV = 1,000,000 / (1.10)^44
PV = 1,000,000 / 66.26408
PV = Rs. 15,091.13

Conclusion:
You need to deposit only Rs. 15,091.13 today at 10% compound annual return to accumulate Rs. 1,000,000 by age 65.`,
  'The massive growth from Rs. 15,091 to Rs. 1,000,000 illustrates the exponential compounding power over 44 years.',
  '65 سال کی عمر میں 10 لاکھ روپے حاصل کرنے کے لیے آج 10 فیصد سالانہ کمپاؤنڈ شرح پر صرف 15,091.13 روپے کی سرمایہ کاری درکار ہے۔'
);

// SQ 2 (Conceptual Comparison — 3 Marks)
insS.run(
  l4Id,
  'Differentiate between Compounding and Discounting in Time Value of Money.',
  `Comparison between Compounding and Discounting:

1. Compounding:
• Process: Projects cash flows forward in time to calculate their Future Value (FV).
• Direction: Moves from Present to Future (left to right on a cash flow timeline).
• Mathematical Operator: Multiplicative: FV = PV × (1 + r)^n.
• Purpose: Determines how much an investment made today will grow into over time.

2. Discounting:
• Process: Brings future cash flows back in time to calculate their Present Value (PV) today.
• Direction: Moves from Future to Present (right to left on a cash flow timeline).
• Mathematical Operator: Divisive: PV = FV / (1 + r)^n.
• Purpose: Determines the fair value today of a future stream of revenues or payments.`,
  'Compounding moves money forward in time (FV = PV × (1+r)^n); Discounting moves money backward in time (PV = FV / (1+r)^n).',
  'کمپاؤنڈنگ موجودہ رقم کو مستقبل میں لے جاتی ہے (FV)، جبکہ ڈسکاؤنٹنگ مستقبل کی رقم کو موجودہ وقت میں واپس لاتی ہے (PV)۔'
);

// SQ 3 (Simple vs. Compound Interest — 3 Marks)
insS.run(
  l4Id,
  'Differentiate between Simple Interest and Compound Interest with a brief numerical example.',
  `Comparison between Simple and Compound Interest:

1. Simple Interest:
• Interest is calculated solely on the original principal amount.
• Formula: Interest = Principal × r × t
• Earnings per period remain constant.

2. Compound Interest:
• Interest is calculated on the original principal PLUS all interest accumulated from prior periods.
• Formula: Total Amount = Principal × (1 + r)^n
• Earnings increase exponentially over successive periods.

Numerical Example (Rs. 1,000 at 10% for 3 years):
• Under Simple Interest: Earns Rs. 100 each year. Total Interest = Rs. 300. Ending Balance = Rs. 1,300.
• Under Compound Interest:
  - Year 1: Rs. 1,000 + Rs. 100 = Rs. 1,100
  - Year 2: Rs. 1,100 + Rs. 110 = Rs. 1,210
  - Year 3: Rs. 1,210 + Rs. 121 = Rs. 1,331
  Ending Balance = Rs. 1,331 (Earns Rs. 31 extra due to "interest on interest").`,
  'Compound interest accelerates wealth accumulation because accumulated interest reinvests automatically.',
  'سادہ سود صرف اصل زر پر ملتا ہے جبکہ کمپاؤنڈ انٹرسٹ میں پچھلے سالوں کے جمع شدہ سود پر بھی منافع حاصل ہوتا ہے۔'
);

// ── Step 6: Insert 2 Long Questions ──────────────────────────────────────────

// LQ 1 (Comprehensive TVM & Rationale — 5 Marks)
insL.run(
  l4Id,
  'Explain the fundamental concept of Time Value of Money (TVM). Why is a rupee today worth more than a rupee in the future? Discuss its primary applications in corporate financial management.',
  `Time Value of Money (TVM):

1. Core Concept:
The Time Value of Money asserts that a specific sum of money received today is worth more than the identical nominal amount received at any future date.

2. Fundamental Reasons Why Money Has Time Value:
a. Earning Capacity (Opportunity Cost):
Money available today can be invested in productive assets, government treasury bills, or bank deposits to generate interest or dividends over time.
b. Inflation Risk:
Prices of goods and services tend to rise over time, eroding currency purchasing power. A rupee in 5 years will purchase fewer real goods than a rupee today.
c. Uncertainty and Default Risk:
Future cash receipts carry inherent uncertainty regarding whether the payer will remain solvent or economic conditions will permit payment.
d. Preference for Current Consumption:
Human psychology places higher utility on satisfying consumption needs immediately rather than postponing them to an uncertain future.

3. Key Corporate Applications:
• Capital Budgeting: Evaluating proposed capital investments using Net Present Value (NPV), Internal Rate of Return (IRR), and Profitability Index.
• Security Valuation: Pricing bonds and stocks based on the discounted present value of expected future coupons, dividends, and capital gains.
• Loan Amortization: Structuring fixed-payment schedules for mortgages, leases, and corporate debt.
• Working Capital Planning: Managing trade credit terms and cash discount optimization.`,
  'TVM is the bedrock of corporate finance; all financial assets are priced by discounting future expected cash flows.',
  'وقت کے ساتھ پیسے کی قدر کی وجوہات: 1. منافع کمانے کی صلاحیت، 2. افراط زر (مہنگائی)، 3. غیر یقینی صورتحال اور رسک، 4. فوری استعمال کی ترجیح۔'
);

// LQ 2 (Nominal vs. Effective Annual Rate — 5 Marks)
insL.run(
  l4Id,
  'Explain the difference between Nominal Interest Rate (APR) and Effective Annual Rate (EAR). Why does EAR increase when compounding occurs more frequently? Provide a comparative numerical example.',
  `Nominal Interest Rate (APR) vs. Effective Annual Rate (EAR):

1. Nominal Interest Rate (Annual Percentage Rate - APR):
• The contractual rate of interest stated on financial instruments or loan agreements.
• Does not adjust for the financial impact of intra-year compounding.

2. Effective Annual Rate (EAR):
• The true, economically equivalent annual rate of interest actually earned or paid over a full year, incorporating compounding frequency.
• Formula: EAR = [1 + (r_nominal / m)]^m - 1
  where r_nominal is the stated nominal rate and m is compounding periods per year.

3. Why EAR Increases with Compounding Frequency:
When interest is compounded semi-annually, quarterly, monthly, or daily (m > 1), interest generated during earlier periods starts earning interest in later periods within the same annual cycle. The greater the frequency of compounding (m), the higher the effective annual yield.

4. Comparative Numerical Example (Stated Nominal Rate = 12% per year):
• Annual Compounding (m = 1):
  EAR = (1 + 0.12/1)^1 - 1 = 12.00%
• Semi-Annual Compounding (m = 2):
  EAR = (1 + 0.12/2)^2 - 1 = (1.06)^2 - 1 = 12.36%
• Quarterly Compounding (m = 4):
  EAR = (1 + 0.12/4)^4 - 1 = (1.03)^4 - 1 = 12.55%
• Monthly Compounding (m = 12):
  EAR = (1 + 0.12/12)^12 - 1 = (1.01)^12 - 1 = 12.68%
• Daily Compounding (m = 365):
  EAR = (1 + 0.12/365)^365 - 1 = 12.75%

Conclusion:
Investors seeking returns prefer maximum compounding frequency, while borrowers prefer annual or less frequent compounding.`,
  'EAR accounts for intra-year compounding; more frequent compounding periods directly yield higher effective returns.',
  'نامینل شرح (APR) میں سال کے اندر بار بار سود کا حساب شامل نہیں ہوتا، جبکہ مؤثر شرح (EAR) میں سالانہ حقیقی منافع ظاہر ہوتا ہے جو تعدد بڑھنے سے بڑھتا ہے۔'
);

console.log('✅ Successfully seeded MGT201 Lecture 4: 10 MCQs, 3 Short Questions, and 2 Long Questions (Total: 15 Questions).');

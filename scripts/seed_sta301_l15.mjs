import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const localDbPath = fs.existsSync(path.join(process.cwd(), 'data', 'exam.db'))
  ? path.join(process.cwd(), 'data', 'exam.db')
  : path.join(process.cwd(), 'exam-portal', 'data', 'exam.db');

const db = new Database(localDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Locate STA301
const sta301 = db.prepare("SELECT id FROM subjects WHERE slug = 'sta301'").get();
if (!sta301) {
  console.error('STA301 subject not found in database!');
  process.exit(1);
}

// 2. Create or fetch Lecture 15
let lec15 = db.prepare("SELECT id FROM lectures WHERE subject_id = ? AND number = 15").get(sta301.id);
if (!lec15) {
  const res = db.prepare(`
    INSERT INTO lectures (subject_id, number, title)
    VALUES (?, 15, 'Simple Linear Regression Analysis & Correlation Analysis')
  `).run(sta301.id);
  lec15 = { id: res.lastInsertRowid };
  console.log(`Created STA301 Lecture 15 with ID: ${lec15.id}`);
} else {
  console.log(`STA301 Lecture 15 already exists with ID: ${lec15.id}`);
}

const lId = lec15.id;

// 3. Clear existing questions for idempotency
const del = db.prepare("DELETE FROM questions WHERE lecture_id = ?").run(lId);
console.log(`Cleared ${del.changes} prior questions for Lecture 15.`);

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

// 14 Past Paper MCQs
const mcqs = [
  {
    stem: 'The variable plotted on the vertical or Y-axis in a scatter diagram (or the variable $Y$ in the regression model $Y = a + bX$) is called the:',
    options: {
      a: 'Independent variable',
      b: 'Dependent variable',
      c: 'Explanatory variable',
      d: 'Correlation variable'
    },
    correct: 'b',
    explanation: 'In regression modeling, the variable to be predicted or explained is plotted on the vertical Y-axis and is known as the dependent variable (also called the response, regressand, or predicted variable) (STA301 Handouts Lecture 15, Pages 116–117). Appeared in 15+ midterm papers.',
    urdu_answer: 'سکیٹر ڈایاگرام میں عمودی (Y) محور پر ظاہر کیا جانے والا متغیر انحصاری متغیر یعنی ڈیپنڈنٹ ویری ایبل (Dependent variable) کہلاتا ہے۔'
  },
  {
    stem: 'The variable plotted on the horizontal or X-axis in a scatter diagram (or the variable $X$ in the regression line $Y = a + bX$) is called the:',
    options: {
      a: 'Dependent variable',
      b: 'Independent variable',
      c: 'Explained variable',
      d: 'Regressand'
    },
    correct: 'b',
    explanation: 'The variable used as the basis for estimation or prediction is plotted on the horizontal X-axis and is called the independent variable (also known as the predictor, regressor, or explanatory variable) (STA301 Handouts Lecture 15, Pages 116–117). Appeared in 14+ midterm papers.',
    urdu_answer: 'سکیٹر ڈایاگرام میں افقی (X) محور پر ظاہر کیا جانے والا متغیر آزاد متغیر یعنی انڈیپنڈنٹ ویری ایبل (Independent variable) کہلاتا ہے۔'
  },
  {
    stem: 'In the simple linear regression model $Y = a + bX + \\epsilon$, the dependent variable "$Y$" is always treated as:',
    options: {
      a: 'A random variable',
      b: 'A non-random variable',
      c: 'Qualitative variable',
      d: 'Constant variable'
    },
    correct: 'a',
    explanation: 'In regression theory, $Y$ is assumed to be a random variable because for any fixed value of $X$, $Y$ has a probability distribution with a random error component $\\epsilon$ (STA301 Handouts Lecture 15, Page 117). Appeared in 9+ midterm papers.',
    urdu_answer: 'سادہ لکیری ریگریشن ماڈل میں متغیر "$Y$" ہمیشہ ایک رینڈم ویری ایبل (Random variable) ہوتا ہے۔'
  },
  {
    stem: 'In the simple linear regression model $Y = a + bX + \\epsilon$, the variable which is non-random (mathematical variable fixed by the experimenter) is:',
    options: {
      a: '$Y$',
      b: '$X$',
      c: 'Both $X$ and $Y$',
      d: 'Neither $X$ nor $Y$'
    },
    correct: 'b',
    explanation: 'In standard regression analysis, values of the independent variable $X$ are assumed to be non-random (predetermined, controlled, or fixed by the investigator) (STA301 Handouts Lecture 15, Page 117). Appeared in 8+ midterm papers.',
    urdu_answer: 'ریگریشن ماڈل میں آزاد متغیر "$X$" ایک غیر رینڈم (Non-random) متغیر ہوتا ہے جس کی قیمتیں پہلے سے متعین کی جا سکتی ہیں۔'
  },
  {
    stem: 'In a Scatter Diagram constructed for bivariate data, we plot:',
    options: {
      a: '$X$ and $Y$',
      b: '$X$ and $\\hat{Y}$',
      c: '$Y$ and $\\hat{Y}$',
      d: '$\\hat{Y}$ and $X$'
    },
    correct: 'a',
    explanation: 'A scatter diagram is constructed by plotting the observed paired data coordinates $(X_i, Y_i)$ on the Cartesian coordinate plane (STA301 Handouts Lecture 15, Page 116). Appeared in 10+ midterm papers.',
    urdu_answer: 'سکیٹر ڈایاگرام میں مشاہداتی جوڑوں کی اصل قیمتوں ($X$ اور $Y$) کو پوائنٹس کی صورت میں گراف پر ظاہر کیا جاتا ہے۔'
  },
  {
    stem: 'In simple linear regression, the line of best fit is mathematically obtained through the:',
    options: {
      a: 'Method of moments',
      b: 'Method of maximum likelihood',
      c: 'Method of least squares',
      d: 'Method of semi-averages'
    },
    correct: 'c',
    explanation: 'The standard criterion for fitting a regression line is the Principle of Least Squares, which minimizes the sum of squared vertical residuals $\\sum(Y - \\hat{Y})^2$ (STA301 Handouts Lecture 15, Pages 117–118). Appeared in 12+ midterm papers.',
    urdu_answer: 'لکیری ریگریشن میں بہترین فٹ ہونے والی لائن میتھڈ آف لیسٹ اسکوائرز (Method of least squares) کے ذریعے حاصل کی جاتی ہے۔'
  },
  {
    stem: 'By using the method of least squares in linear regression, the sum of squared vertical distances between the observed points and the fitted line, $\\sum(Y - \\hat{Y})^2$, is always:',
    options: {
      a: 'Zero',
      b: 'Minimum',
      c: 'Maximum',
      d: 'Constant'
    },
    correct: 'b',
    explanation: 'The fundamental principle of least squares requires that the sum of the squares of vertical deviations from the observed points to the line is as small as possible, i.e., minimized (STA301 Handouts Lecture 15, Page 124).',
    urdu_answer: 'لیسٹ اسکوائر کے طریقہ کار کے تحت عمودی فاصلوں کے مربعات کا مجموعہ ہمیشہ کم سے کم (Minimum) ہوتا ہے۔'
  },
  {
    stem: 'The algebraic sum of the vertical deviations of actual $Y$-values from the corresponding fitted values on the least-squares line, $\\sum(Y - \\hat{Y})$, is always equal to:',
    options: {
      a: 'Maximum',
      b: 'Minimum',
      c: 'Zero',
      d: 'One'
    },
    correct: 'c',
    explanation: 'An essential mathematical property of the least-squares regression line is that positive and negative residuals cancel out exactly: $\\sum(Y - \\hat{Y}) = 0$ (STA301 Handouts Lecture 15, Page 119). Appeared in 5+ midterm papers.',
    urdu_answer: 'اصل اور متوقع قیمتوں کے انحرافات کا الجبری مجموعہ $\\sum(Y - \\hat{Y})$ ہمیشہ صفر (Zero) کے برابر ہوتا ہے۔'
  },
  {
    stem: 'Suppose the estimated regression equation $\\hat{Y} = 5 - 2X$ has been calculated for a set of data. What is the slope of the line?',
    options: {
      a: '0',
      b: '2',
      c: '-2',
      d: '5'
    },
    correct: 'c',
    explanation: 'In the standard linear equation form $\\hat{Y} = a + bX$, $a$ is the Y-intercept and $b$ is the slope. In $\\hat{Y} = 5 - 2X$, the coefficient of $X$ is $b = -2$ (STA301 Handouts Lecture 15, Page 121). Appeared in 7+ midterm papers.',
    urdu_answer: 'مساوات $\\hat{Y} = 5 - 2X$ میں $X$ کا ضریب یعنی سلوپ (Slope) کی قیمت $-2$ ہے۔'
  },
  {
    stem: 'A numerical measure of the strength and direction of the linear relationship between two quantitative variables $X$ and $Y$ is known as:',
    options: {
      a: 'Regression coefficient',
      b: 'Pearson’s Product-Moment Coefficient of Correlation',
      c: 'Standard error of estimate',
      d: 'Coefficient of variation'
    },
    correct: 'b',
    explanation: 'Pearson’s correlation coefficient ($r$) measures the degree and direction of linear association between two variables (STA301 Handouts Lecture 15, Page 128). Appeared in 11+ midterm papers.',
    urdu_answer: 'دو متغیرات کے درمیان لکیری تعلق کی طاقت اور سمت کو ناپنے والا عددی پیمانہ پیئرسن کا پراڈکٹ-مومنٹ کوفیشینٹ آف کوریلیشن ($r$) کہلاتا ہے۔'
  },
  {
    stem: 'The Pearson correlation coefficient $r$ is a pure unitless number whose value strictly lies between:',
    options: {
      a: '0 to 1',
      b: '0 to $\\infty$',
      c: '-1 to +1',
      d: '$-\\infty$ to $+\\infty$'
    },
    correct: 'c',
    explanation: 'The correlation coefficient is bounded such that $-1 \\le r \\le +1$. A value of $+1$ indicates perfect positive linear correlation, $-1$ indicates perfect negative linear correlation, and $0$ indicates absence of linear correlation (STA301 Handouts Lecture 15, Page 128). Appeared in 12+ midterm papers.',
    urdu_answer: 'کوریلیشن کوفیشینٹ $r$ کی قیمت ہمیشہ $-1$ اور $+1$ کے درمیان (یعنی $-1 \\le r \\le +1$) رہتی ہے۔'
  },
  {
    stem: 'If all paired data points fall exactly on a straight line and the line has a positive upward slope, then what is the value of the correlation coefficient $r$?',
    options: {
      a: '$0 \\le r \\le 1$',
      b: '$r = 0$',
      c: '$r = +1$',
      d: '$r = -1$'
    },
    correct: 'c',
    explanation: 'When all points lie precisely along a straight line that rises from left to right, there is a perfect direct linear relationship, meaning $r = +1$ (STA301 Handouts Lecture 15, Page 129). Appeared in 10+ midterm papers.',
    urdu_answer: 'اگر تمام پوائنٹس ایک ہی سیدھی لکیر پر آئیں اور لکیر اوپر کی طرف جا رہی ہو تو کوریلیشن کوفیشینٹ کی قیمت بالکل $+1$ کے برابر ہوتی ہے۔'
  },
  {
    stem: 'In a simple linear regression model $\\hat{Y} = a + bX$, the value of the correlation coefficient $r$ will be zero if the:',
    options: {
      a: 'Intercept $a = 0$',
      b: 'Intercept $a \\ne 0$',
      c: 'Slope $b = 0$',
      d: 'Slope $b \\ne 0$'
    },
    correct: 'c',
    explanation: 'Because $r$ and $b$ share the same numerator ($n\\sum XY - \\sum X \\sum Y$), their algebraic signs are identical ($r = b \\frac{S_x}{S_y}$). If the slope $b = 0$, the regression line is completely horizontal, and $r = 0$ (no linear association) (STA301 Handouts Lecture 15, Page 128). Appeared in 8+ midterm papers.',
    urdu_answer: 'اگر ریگریشن لائن کا سلوپ صفر ہو جائے ($b = 0$) تو کوریلیشن کوفیشینٹ $r$ کی قیمت بھی صفر ہو جاتی ہے۔'
  },
  {
    stem: 'In the mathematical regression model $Y = mX + a$, the dependent variable $Y$ is also commonly designated as the:',
    options: {
      a: 'Predictor variable',
      b: 'Independent variable',
      c: 'Predicted (dependent) variable',
      d: 'Explanatory variable'
    },
    correct: 'c',
    explanation: 'In regression terminology, $Y$ is referred to as the predicted variable, dependent variable, response variable, outcome variable, or regressand (STA301 Handouts Lecture 15, Page 121). Appeared in 7+ midterm papers.',
    urdu_answer: 'ریگریشن ماڈل میں متغیر $Y$ کو متوقع متغیر یعنی پریڈکٹڈ (Predicted/Dependent) ویری ایبل بھی کہا جاتا ہے۔'
  }
];

// 4 Short Questions
const shorts = [
  {
    stem: 'What is a Scatter Diagram? What is its primary diagnostic purpose in regression and correlation analysis?',
    correct: `<p><strong>Scatter Diagram and Its Diagnostic Significance (STA301 Handouts Lecture 15):</strong></p>

<h4>1. Definition:</h4>
<p>A <strong>Scatter Diagram</strong> (or scatter plot) is a fundamental visual graphic for bivariate data where paired observations \\((X_i, Y_i)\\) are plotted as coordinate points on a Cartesian plane, with the independent variable \\(X\\) measured along the horizontal axis and the dependent variable \\(Y\\) along the vertical axis.</p>

<h4>2. Primary Diagnostic Purposes:</h4>
<ul>
  <li><strong>Detection of Relationship:</strong> It immediately reveals whether an empirical association exists between the two variables.</li>
  <li><strong>Pattern Identification (Linear vs. Curvilinear):</strong> It determines whether a straight line (linear model) is appropriate or whether a polynomial/curvilinear curve is required.</li>
  <li><strong>Direction of Association:</strong> An upward cluster of points from left to right signals a positive relationship; a downward cluster signals a negative relationship.</li>
  <li><strong>Identification of Outliers:</strong> It exposes anomalous observations that could disproportionately distort least-squares slope estimates.</li>
</ul>`,
    explanation: 'Core 3-mark conceptual question from STA301 Midterm Solved Subjectives and Handouts Pages 116–117.',
    urdu_answer: 'سکیٹر ڈایاگرام دو متغیرات کے جوڑوں $(X_i, Y_i)$ کا تصویری گراف ہے۔ اس کا بنیادی مقصد یہ دیکھنا ہے کہ آیا دو متغیرات کے درمیان کوئی تعلق موجود ہے یا نہیں، تعلق لکیری (Linear) ہے یا غیر لکیری، اور تعلق مثبت ہے یا منفی۔'
  },
  {
    stem: 'Differentiate clearly between the Dependent Variable ($Y$) and the Independent Variable ($X$) in simple linear regression analysis.',
    correct: `<p><strong>Dependent vs. Independent Variables (STA301 Handouts Lecture 15):</strong></p>

<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px;">Feature</th>
      <th style="padding: 8px;">Independent Variable (\\(X\\))</th>
      <th style="padding: 8px;">Dependent Variable (\\(Y\\))</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Functional Role</strong></td>
      <td style="padding: 8px;">The variable used as the basis of prediction / explanation.</td>
      <td style="padding: 8px;">The variable whose value is to be estimated or explained.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Statistical Nature</strong></td>
      <td style="padding: 8px;"><strong>Non-random variable:</strong> Values are predetermined, fixed, or controlled by the experimenter.</td>
      <td style="padding: 8px;"><strong>Random variable:</strong> Values vary randomly according to a probability distribution for any fixed \\(X\\).</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Alternative Names</strong></td>
      <td style="padding: 8px;">Predictor, Regressor, Explanatory variable, Input variable.</td>
      <td style="padding: 8px;">Predicted, Regressand, Response, Output variable.</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Graphical Axis</strong></td>
      <td style="padding: 8px;">Plotted on the horizontal \\(X\\)-axis.</td>
      <td style="padding: 8px;">Plotted on the vertical \\(Y\\)-axis.</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Frequently tested 3-mark distinction from STA301 Midterm Subjectives and Handouts Pages 116–117.',
    urdu_answer: 'آزاد متغیر ($X$) پیشین گوئی کی بنیاد بنتا ہے، نان رینڈم ہوتا ہے اور افقی محور پر آتا ہے۔ انحصاری متغیر ($Y$) وہ ہے جس کی قیمت کا اندازہ لگایا جاتا ہے، یہ رینڈم ویری ایبل ہوتا ہے اور عمودی محور پر آتا ہے۔'
  },
  {
    stem: 'Write down the two Normal Equations used to obtain the least-squares regression estimates $a$ and $b$ for the line $Y = a + bX$, and state the formulas for $a$ and $b$.',
    correct: `<p><strong>Normal Equations for Simple Linear Regression (STA301 Handouts Lecture 15):</strong></p>

<h4>1. The Two Normal Equations:</h4>
<p>To find the parameters \\(a\\) and \\(b\\) that minimize the sum of squared vertical residuals \\(\\sum(Y - \\hat{Y})^2\\), we differentiate with respect to \\(a\\) and \\(b\\) and set partial derivatives to zero, yielding:</p>
\\[\\begin{aligned}
\\text{(1) } \\sum Y &= n a + b \\sum X \\\\[4pt]
\\text{(2) } \\sum XY &= a \\sum X + b \\sum X^2
\\end{aligned}\\]

<h4>2. Least-Squares Formulas Derived from the Normal Equations:</h4>
<ul>
  <li><strong>Slope (\\(b\\)):</strong>
    \\[b = \\frac{n \\sum XY - (\\sum X)(\\sum Y)}{n \\sum X^2 - (\\sum X)^2}\\]
  </li>
  <li><strong>Y-Intercept (\\(a\\)):</strong>
    \\[a = \\bar{Y} - b \\bar{X} = \\frac{\\sum Y}{n} - b \\left(\\frac{\\sum X}{n}\\right)\\]
  </li>
</ul>`,
    explanation: 'Core 3-mark derivation question from STA301 Midterm Papers and Handouts Page 119.',
    urdu_answer: 'ریگریشن لائن کی نارمل مساواتیں درج ذیل ہیں: 1. $\\sum Y = na + b\\sum X$؛ اور 2. $\\sum XY = a\\sum X + b\\sum X^2$۔ ان کو حل کرنے سے سلوپ $b = \\frac{n\\sum XY - (\\sum X)(\\sum Y)}{n\\sum X^2 - (\\sum X)^2}$ اور انٹرسیپٹ $a = \\bar{Y} - b\\bar{X}$ حاصل ہوتے ہیں۔'
  },
  {
    stem: 'State the key mathematical properties of the Least-Squares Regression Line $\\hat{Y} = a + bX$.',
    correct: `<p><strong>Properties of the Least-Squares Regression Line (STA301 Handouts Lecture 15):</strong></p>

<ol>
  <li><strong>Passes Through the Centroid (Point of Means):</strong>
    <p>The fitted least-squares line always passes through the point of means \\((\\bar{X}, \\bar{Y})\\). Consequently:</p>
    \\[\\bar{Y} = a + b \\bar{X}\\]
  </li>
  <li><strong>Sum of Vertical Residuals is Zero:</strong>
    <p>The algebraic sum of the vertical errors (deviations of observed values \\(Y\\) from fitted values \\(\\hat{Y}\\)) is always identically zero:</p>
    \\[\\sum e_i = \\sum (Y_i - \\hat{Y}_i) = 0\\]
  </li>
  <li><strong>Minimization of Sum of Squared Errors:</strong>
    <p>The sum of squared residuals is minimized; no other straight line fitted to the same dataset can produce a smaller value of \\(\\sum (Y_i - \\hat{Y}_i)^2\\).</p>
  </li>
  <li><strong>Unbiased Prediction:</strong>
    <p>The mean of the predicted values equals the mean of the actual observed values: \\(\\bar{\\hat{Y}} = \\bar{Y}\\).</p>
  </li>
</ol>`,
    explanation: 'High-frequency 3-mark subjective question from STA301 Midterm Solved Subjectives and Handouts Pages 118–119.',
    urdu_answer: 'لیسٹ اسکوائر ریگریشن لائن کی اہم خصوصیات: 1. یہ ہمیشہ اوسط نقطہ $(\\bar{X}, \\bar{Y})$ سے گزرتی ہے؛ 2. انحرافات کا مجموعہ ہمیشہ صفر ہوتا ہے $\\sum(Y - \\hat{Y}) = 0$؛ اور 3. مربعات کا مجموعہ $\\sum(Y - \\hat{Y})^2$ کم سے کم (Minimum) ہوتا ہے۔'
  }
];

// 3 Long Questions
const longs = [
  {
    stem: 'Fit the simple linear regression line of $Y$ on $X$ ($\\hat{Y} = a + bX$) from the following summary data:\n$$\\sum X = 15, \\quad \\sum Y = 10, \\quad \\sum XY = 37, \\quad \\sum X^2 = 55, \\quad \\bar{Y} = 2, \\quad \\bar{X} = 3, \\quad n = 5$$\n1. Calculate the slope ($b$) and y-intercept ($a$).\n2. Write down the fitted regression equation.\n3. Estimate the value of $Y$ when $X = 4.33$.',
    correct: `<p><strong>Fitting the Regression Line from Summary Statistics (STA301 Handouts Lecture 15):</strong></p>

<h4>Given Data:</h4>
\\[n = 5, \\quad \\sum X = 15, \\quad \\sum Y = 10, \\quad \\sum XY = 37, \\quad \\sum X^2 = 55, \\quad \\bar{X} = 3, \\quad \\bar{Y} = 2\\]

<h4>Step 1: Calculate the Slope (\\(b\\)):</h4>
\\[b = \\frac{n \\sum XY - (\\sum X)(\\sum Y)}{n \\sum X^2 - (\\sum X)^2}\\]
\\[b = \\frac{5(37) - (15)(10)}{5(55) - (15)^2} = \\frac{185 - 150}{275 - 225} = \\frac{35}{50} = \\mathbf{0.70}\\]

<h4>Step 2: Calculate the Y-Intercept (\\(a\\)):</h4>
\\[a = \\bar{Y} - b \\bar{X}\\]
\\[a = 2 - (0.70)(3) = 2 - 2.10 = \\mathbf{-0.10}\\]

<h4>Step 3: State the Fitted Regression Equation:</h4>
\\[\\mathbf{\\hat{Y} = -0.10 + 0.70X}\\]

<h4>Step 4: Predict \\(Y\\) for \\(X = 4.33\\):</h4>
\\[\\hat{Y} = -0.10 + 0.70(4.33) = -0.10 + 3.031 = \\mathbf{2.931\\text{ milli-seconds}}\\]
<p><em>Conclusion:</em> For an individual administered 4.33% of the drug, the estimated reaction time is approximately 2.93 ms.</p>`,
    explanation: 'High-frequency 5-mark midterm numerical question appearing in Team Hadi files (Q26) and Handouts Pages 119–121.',
    urdu_answer: 'سلوپ $b = 0.70$ اور انٹرسیپٹ $a = -0.10$ ہے، لہٰذا ریگریشن مساوات $\\hat{Y} = -0.10 + 0.70X$ بنتی ہے۔ $X = 4.33$ کے لیے متوقع قیمت $\\hat{Y} = 2.931$ حاصل ہوتی ہے۔'
  },
  {
    stem: 'An experiment determines how a drug affects human reaction time. The data collected from 5 subjects is:\n\nSubject A: X = 1, Y = 1\nSubject B: X = 2, Y = 1\nSubject C: X = 3, Y = 2\nSubject D: X = 4, Y = 2\nSubject E: X = 5, Y = 4\n\n1. Construct the computation table for $\\sum X, \\sum Y, \\sum X^2, \\sum Y^2, \\sum XY$.\n2. Fit the regression equation $\\hat{Y} = a + bX$.\n3. Calculate Pearson’s Correlation Coefficient ($r$) and interpret the relationship.',
    correct: `<p><strong>Complete Regression and Correlation Analysis (STA301 Handouts Lecture 15):</strong></p>

<h4>Step 1: Construct the Computation Table (\\(n = 5\\)):</h4>
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: center;">
      <th style="padding: 6px;">Subject</th>
      <th style="padding: 6px;">Percentage of Drug (\\(X\\))</th>
      <th style="padding: 6px;">Reaction Time (\\(Y\\))</th>
      <th style="padding: 6px;">\\(X^2\\)</th>
      <th style="padding: 6px;">\\(Y^2\\)</th>
      <th style="padding: 6px;">\\(XY\\)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align: center;"><td>A</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
    <tr style="text-align: center;"><td>B</td><td>2</td><td>1</td><td>4</td><td>1</td><td>2</td></tr>
    <tr style="text-align: center;"><td>C</td><td>3</td><td>2</td><td>9</td><td>4</td><td>6</td></tr>
    <tr style="text-align: center;"><td>D</td><td>4</td><td>2</td><td>16</td><td>4</td><td>8</td></tr>
    <tr style="text-align: center;"><td>E</td><td>5</td><td>4</td><td>25</td><td>16</td><td>20</td></tr>
    <tr style="background-color: #f8fafc; font-weight: bold; text-align: center;">
      <td>Total</td><td>15</td><td>10</td><td>55</td><td>26</td><td>37</td></tr>
  </tbody>
</table>

<h4>Step 2: Fit the Regression Line:</h4>
\\[b = \\frac{n \\sum XY - (\\sum X)(\\sum Y)}{n \\sum X^2 - (\\sum X)^2} = \\frac{5(37) - (15)(10)}{5(55) - (15)^2} = \\frac{185 - 150}{275 - 225} = \\frac{35}{50} = \\mathbf{0.70}\\]
\\[a = \\bar{Y} - b \\bar{X} = \\frac{10}{5} - 0.70\\left(\\frac{15}{5}\\right) = 2 - 2.10 = \\mathbf{-0.10}\\]
\\[\\text{Fitted Line: } \\mathbf{\\hat{Y} = -0.10 + 0.70X}\\]

<h4>Step 3: Pearson\'s Correlation Coefficient (\\(r\\)):</h4>
\\[r = \\frac{n \\sum XY - (\\sum X)(\\sum Y)}{\\sqrt{[n \\sum X^2 - (\\sum X)^2][n \\sum Y^2 - (\\sum Y)^2]}}\\]
\\[r = \\frac{5(37) - (15)(10)}{\\sqrt{[5(55) - (15)^2][5(26) - (10)^2]}} = \\frac{35}{\\sqrt{(50)(130 - 100)}} = \\frac{35}{\\sqrt{(50)(30)}} = \\frac{35}{\\sqrt{1500}} = \\frac{35}{38.73} \\approx \\mathbf{0.903}\\]

<h4>Interpretation:</h4>
<p>Since \\(r = +0.903\\), there is a <strong>very strong positive linear correlation</strong> between the concentration of the drug and the reaction time of the subjects.</p>`,
    explanation: 'Comprehensive 5-mark numerical problem synthesizing table construction, regression line fitting, and Pearson correlation from STA301 Handouts Pages 119–123.',
    urdu_answer: 'کمپیوٹیشن ٹیبل سے مجموعے حاصل کیے گئے؛ ریگریشن مساوات $\\hat{Y} = -0.10 + 0.70X$ حاصل ہوئی؛ اور کوریلیشن کوفیشینٹ $r = 0.903$ ظاہر کرتا ہے کہ دوا کی مقدار اور ردعمل کے وقت کے درمیان انتہائی مضبوط مثبت لکیری تعلق موجود ہے۔'
  },
  {
    stem: 'Using the reaction time regression dataset ($\\sum Y = 10, \\sum Y^2 = 26, \\sum XY = 37, a = -0.10, b = 0.70, n = 5$), calculate the Standard Error of Estimate ($S_{y \\cdot x}$) and explain its meaning.',
    correct: `<p><strong>Calculation and Meaning of Standard Error of Estimate (STA301 Handouts Lecture 15):</strong></p>

<h4>1. Formula:</h4>
<p>The Standard Error of Estimate measures the scatter or dispersion of actual \\(Y\\) values around the fitted regression line:</p>
\\[S_{y \\cdot x} = \\sqrt{\\frac{\\sum (Y - \\hat{Y})^2}{n - 2}} = \\sqrt{\\frac{\\sum Y^2 - a \\sum Y - b \\sum XY}{n - 2}}\\]

<h4>2. Step-by-Step Calculation:</h4>
<p>Given: \\(n = 5\\), \\(\\sum Y = 10\\), \\(\\sum Y^2 = 26\\), \\(\\sum XY = 37\\), \\(a = -0.10\\), \\(b = 0.70\\)</p>
\\[\\text{Numerator: } \\sum Y^2 - a \\sum Y - b \\sum XY = 26 - (-0.10)(10) - (0.70)(37)\\]
\\[= 26 + 1.00 - 25.90 = 27.00 - 25.90 = \\mathbf{1.10}\\]
\\[\\text{Denominator: } n - 2 = 5 - 2 = \\mathbf{3}\\]
\\[S_{y \\cdot x} = \\sqrt{\\frac{1.10}{3}} = \\sqrt{0.3667} \\approx \\mathbf{0.606\\text{ milli-seconds}}\\]

<h4>3. Meaning and Interpretation:</h4>
<ul>
  <li>\\(S_{y \\cdot x} = 0.606\\) represents the standard deviation of residuals.</li>
  <li>It reflects the precision of prediction: smaller values indicate that the data points cluster tightly around the regression line, ensuring high predictive accuracy.</li>
</ul>`,
    explanation: 'Core 5-mark computational problem on residual dispersion from STA301 Handouts Lecture 15 (Pages 122–123).',
    urdu_answer: 'سٹینڈرڈ ایرر آف ایسٹیمیٹ کا فارمولا $S_{y \\cdot x} = \\sqrt{\\frac{\\sum Y^2 - a\\sum Y - b\\sum XY}{n - 2}}$ ہے، جس کی قیمت $0.606$ ملی سیکنڈ حاصل ہوتی ہے۔ یہ بتاتا ہے کہ ریگریشن لائن کے گرد اصل پوائنٹس کا اوسط پھیلاؤ کتنا کم ہے۔'
  }
];

const insertAll = db.transaction(() => {
  for (const m of mcqs) {
    insMcq.run(lId, m.stem, JSON.stringify(m.options), m.correct, m.explanation, m.urdu_answer);
  }
  for (const s of shorts) {
    insShort.run(lId, s.stem, s.correct, s.explanation, s.urdu_answer);
  }
  for (const l of longs) {
    insLong.run(lId, l.stem, l.correct, l.explanation, l.urdu_answer);
  }
});

insertAll();
console.log(`Successfully inserted into STA301 Lecture 15:`);
console.log(`  - MCQs: ${mcqs.length}`);
console.log(`  - Short Questions: ${shorts.length}`);
console.log(`  - Long Questions: ${longs.length}`);
console.log(`  - Total for STA301 Lecture 15: ${mcqs.length + shorts.length + longs.length}`);

const totalQ = db.prepare('SELECT count(*) as count FROM questions').get();
const totalLec = db.prepare('SELECT count(*) as count FROM lectures').get();
const totalSub = db.prepare('SELECT count(*) as count FROM subjects').get();
console.log(`\nUpdated Database Totals:`);
console.log(`  - Subjects: ${totalSub.count}`);
console.log(`  - Lectures: ${totalLec.count}`);
console.log(`  - Questions: ${totalQ.count}`);

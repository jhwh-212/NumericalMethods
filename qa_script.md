# Q&A Script — Technical Questions (with real code)
## (Casual answers + point to the actual code on screen)

---

## Q1: "Where are the formulas written? Where does it take input and calculate?"

"So the app is split into files — each one has one job.

For integration, input is collected here in app.js:"

```js
// app.js — getIntegrationInputs()
function getIntegrationInputs() {
  return {
    expr: document.getElementById('funcInput').value.trim(),   // function f(x)
    a:    document.getElementById('lowerBound').value,         // lower bound
    b:    document.getElementById('upperBound').value,         // upper bound
    n:    document.getElementById('numIntervals').value || 8   // intervals
  };
}
```

"For interpolation, it's different now — the user enters f(x) and x values,
and the app auto-computes the y values. Here's that function:"

```js
// app.js — getInterpolationInputs()
function getInterpolationInputs() {
  const expr  = document.getElementById('funcInputInterp').value.trim();
  const order = +interpOrder.value;
  const numPts = order + 1;  // nth order needs n+1 points

  const xData = [...document.querySelectorAll('.x-point-input')]
                  .map(el => Number(el.value));

  // Auto-compute y = f(x) at each x — no manual y entry needed
  const yData = xData.map(x => NM.evalFn(expr, x));

  return { xData, yData, xInterp: +document.getElementById('interpX').value };
}
```

"Then when Calculate is clicked, app.js passes everything to methods.js:"

```js
// app.js — calculate()
if (currentMethod === 'trapezoidal') {
    data = NM.trapezoidal({ expr, a, b, n });
} else if (currentMethod === 'lagrange') {
    data = NM.lagrange({ xData, yData, xInterp });
} else if (currentMethod === 'newton') {
    data = NM.newton({ xData, yData, xInterp });
}
```

"And that's where the actual math formula runs. For Trapezoidal for example:"

```js
// methods.js — NM.trapezoidal()
const h      = (b - a) / n;
const xs     = Array.from({ length: n+1 }, (_, i) => a + i*h);
const ys     = xs.map(x => NM.evalFn(expr, x));   // evaluate f(x) at each point
const sum    = ys[0] + ys[n] + 2 * ys.slice(1,n).reduce((s,v) => s+v, 0);
const result = (h / 2) * sum;   // ← the actual Trapezoidal formula
```

"So for f(x) = x² + 1, a=0, b=4, n=4:
h=1, points: 0,1,2,3,4, f(x): 1,2,5,10,17
result = (1/2) × [1 + 2(2+5+10) + 17] = 26."

---

## Q2: "How does it know 'integral' in plain English means do an integral?"

"It doesn't. That's the honest answer.

The word 'integral' in the smart input only sets a flag — true or false.
Look at methods.js line 16:"

```js
// methods.js — line 16
const hasIntegral = /\bintegral\b/.test(s);
// true  if user wrote "integral from 0 to 4 of sin x"
// false if user wrote "sin of x"
// does ZERO math either way
```

"The actual math — Trapezoidal, Simpson's, Lagrange, whatever —
is decided by which method the user clicked in the sidebar.
That sets this variable in app.js:"

```js
// app.js — selectMethod()
currentMethod = 'trapezoidal';   // set when user clicks sidebar
```

"Then Calculate uses that to decide which formula to run.
The word 'integral' in the text just tells the app: bounds are required.
That's its only job."

---

## Q3: "So when there are bounds it does the integral math?"

"No — bounds are just two numbers. They don't trigger anything on their own.

Look — in the Trapezoidal function, a and b are just plugged into the formula:"

```js
// methods.js — NM.trapezoidal()
const h  = (b - a) / n;                              // b and a are just numbers
const xs = Array.from({ length: n+1 }, (_, i) => a + i*h);
```

"If you fill in a=0 and b=4 and never click Calculate — nothing happens.
The trigger is always the Calculate button.
And even then, it's the sidebar that decided which formula runs.

So to be clear:
- Sidebar click → decides WHICH formula
- f(x), a, b, n → inputs fed INTO that formula
- Calculate button → actually runs the math
- Bounds alone → just numbers sitting in boxes"

---

## Q4: "Where does it convert plain English to f(x)?
And where does it check 'integral' for the bounds?"

"Both happen in methods.js in the parseNL function.
Same function is used for BOTH integration and interpolation — shared code.

Line 16 — the integral check:"

```js
// methods.js — line 16
const hasIntegral = /\bintegral\b/.test(s);
// "integral from 0 to 4 of sin x" → hasIntegral = true
// "sin of x" → hasIntegral = false
// "x squared plus 2x" → hasIntegral = false (interpolation case)
```

"Line 20 — extract bounds from 'from X to Y' (only relevant for integration):"

```js
// methods.js — line 20
const bm = s.match(/\bfrom\s+([-+]?[\d.]+|pi|e|tau)\s+to\s+([-+]?[\d.]+|pi|e|tau)\b/);
if (bm) { a = bm[1]; b = bm[2]; }
// "from 0 to 4"  → a = "0", b = "4"
// "from 0 to pi" → a = "0", b = "pi"
// for interpolation this is just ignored
```

"Lines 29 to 51 — the phrase replacement table:"

```js
// methods.js — PHRASES table
const PHRASES = [
  ['e to the power of',  'exp('],   // "e to the power of x" → "exp(x"
  ['square root of',     'sqrt('],  // "square root of x"    → "sqrt(x"
  ['sin of',             'sin('],   // "sin of x"            → "sin(x"
  ['multiplied by',      '*'],      // "x multiplied by 2"   → "x*2"
  ['divided by',         '/'],
  // ... and so on (longest phrases first)
];
for (const [from, to] of PHRASES) {
  while (s.includes(from)) s = s.split(from).join(to);
}
```

"Line 67 handles power words — including variable exponents now:"

```js
// methods.js — RX table
[/pow(?:er)?\s*([a-z0-9.]+)/g, '^$1']
// "pow2" → "^2",  "powx" → "^x",  "pow 3" → "^3",  "power x" → "^x"
```

"Line 81 — implicit multiplication:"

```js
s = s.replace(/(\d)x(?!\w)/g, '$1*x');  // "2x" → "2*x"
s = s.replace(/(\d)\s*\(/g,   '$1*(');  // "2(" → "2*("
```

"For INTEGRATION — app.js doConvert() uses hasIntegral to decide bounds:"

```js
// app.js — doConvert()
if (a !== '' && b !== '') {
  lowerEl.value = a;   // bounds detected in text → fill them
  upperEl.value = b;
} else if (!hasIntegral) {
  lowerEl.value = '0'; // no "integral", no bounds → default 0 and 1
  upperEl.value = '1';
}
// if hasIntegral but no bounds → warn the user
```

"For INTERPOLATION — app.js doConvertInterp() only fills f(x), ignores bounds:"

```js
// app.js — doConvertInterp()
function doConvertInterp() {
  const { expr } = NM.parseNL(raw);   // same parser, but ignore a, b
  funcInputInterp.value = expr;        // just fill the function field
  recomputeAllY();                     // re-run f(x) for all x values
}
```

---

## Q5: "How does the order selector work? And how does it auto-compute y?"

"When the user changes the order dropdown, this runs:"

```js
// app.js — interpOrder change listener
interpOrder.addEventListener('change', () => {
  generateXFields(interpOrder.value);
});
```

"generateXFields takes the order n and creates n+1 input rows:"

```js
// app.js — generateXFields(order)
function generateXFields(order) {
  const numPts = order + 1;  // 3rd order → 4 points
  // builds x₀, x₁, x₂, x₃ input fields dynamically
  // each field gets a listener that calls recomputeY when changed
}
```

"recomputeY — this is the live auto-compute. Runs every time user types an x value:"

```js
// app.js — recomputeY(xInput)
function recomputeY(xInput) {
  const expr = document.getElementById('funcInputInterp').value.trim();
  const y    = NM.evalFn(expr, +xInput.value);  // calls math.js
  document.getElementById('ypt_' + idx).textContent = y.toPrecision(8);
}
```

"So if f(x) = x² + 2x − 1 and I type x₀ = 2 — it immediately shows y₀ = 7.
No manual calculation. Math.js evaluates x²+2x−1 at x=2 in real time."

"The validation in getInterpolationInputs checks:
- Is f(x) filled and valid?
- Does the number of x inputs match the selected order?
- Are all x fields filled?
- Any duplicate x values?"

```js
// app.js — getInterpolationInputs() validation
if (xInputs.length !== numPts)
  throw new Error(`Expected ${numPts} x values for ${order}th order.`);

const empty = xVals.findIndex(v => v === '');
if (empty !== -1)
  throw new Error(`x${empty} is empty. Fill all ${numPts} x values.`);

if (new Set(xData).size !== xData.length)
  throw new Error('Duplicate x values are not allowed.');
```

---

## Q6: "How did you put the website live?"

"Four steps.

Step 1 — turned the folder into a git repo:"

```bash
git init
git add .
git commit -m "Initial commit"
```

"Step 2 — created empty repo on GitHub called NumericalMethods.

Step 3 — connected and pushed:"

```bash
git remote add origin https://github.com/jhwh-212/NumericalMethods.git
git branch -M main
git push -u origin main
```

"Step 4 — GitHub settings → Pages → branch: main → Save.
Got the URL: https://jhwh-212.github.io/NumericalMethods/

Works without a server because it's all static files — HTML, CSS, JavaScript.
GitHub hosts those for free. Every update after is just:"

```bash
git add .
git commit -m "description"
git push origin main
```

"Live within a minute."

---
*Point to the file and highlight the code block when you say each answer*
*Q5 is new — expect it since the order selector is a visible feature*

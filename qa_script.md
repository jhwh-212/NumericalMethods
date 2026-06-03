# Q&A Script — Technical Questions (with real code)
## (Casual answers + point to the actual code on screen)

---

## Q1: "Where are the formulas written? Where does it take input and calculate?"

"So the app is split into files — each one has one job.

The INPUT is taken here — in app.js, this function called getIntegrationInputs:"

```js
// app.js — line 188
function getIntegrationInputs() {
  return {
    expr: document.getElementById('funcInput').value.trim(),  // the function user typed
    a:    document.getElementById('lowerBound').value,        // lower bound
    b:    document.getElementById('upperBound').value,        // upper bound
    n:    document.getElementById('numIntervals').value || 8  // number of intervals
  };
}
```

"It just reads the form fields. Nothing fancy.
Then when the user clicks Calculate, this runs in the same file:"

```js
// app.js — line 228
if (currentMethod === 'trapezoidal') {
    data = NM.trapezoidal({ expr: inp.expr, a: inp.a, b: inp.b, n: inp.n });
}
```

"It passes everything to methods.js — and THAT's where the actual formula runs:"

```js
// methods.js — line 122
NM.trapezoidal = function({ expr, a, b, n }) {

  const h  = (b - a) / n;                                    // step size
  const xs = Array.from({ length: n+1 }, (_, i) => a + i*h);// all x points
  const ys = xs.map(x => NM.evalFn(expr, x));               // evaluate f(x)

  const sum    = ys[0] + ys[n] + 2 * ys.slice(1,n).reduce((s,v) => s+v, 0);
  const result = (h / 2) * sum;   // <-- THIS is the Trapezoidal formula

  return { result, steps, xs, ys };
}
```

"So for example if I type f(x) = x² + 1, a = 0, b = 4, n = 4:
- h = (4-0)/4 = 1
- x points: 0, 1, 2, 3, 4
- f(x) at each: 1, 2, 5, 10, 17
- result = (1/2) × [1 + 2(2+5+10) + 17] = (0.5) × 52 = 26

That's the whole thing."

---

## Q2: "How does it know 'integral' in plain English means do an integral?"

"It doesn't — and that's the honest answer.

The word 'integral' in the text only does one thing in the code.
Look at methods.js line 16:"

```js
// methods.js — line 16
const hasIntegral = /\bintegral\b/.test(s);
//                  checks if the word "integral" exists → true or false
//                  does ZERO math
```

"That's it. Just a true/false check. Nothing about formulas.

The actual math — Trapezoidal, Simpson's, whatever —
is decided here in app.js when the user clicks the sidebar:"

```js
// app.js — line 228
if (currentMethod === 'trapezoidal') {
    data = NM.trapezoidal(...);   // runs Trapezoidal formula
} else if (currentMethod === 'simpson') {
    data = NM.simpson(...);       // runs Simpson's formula
}
```

"currentMethod is set the moment you click 'Trapezoidal Rule' in the sidebar.
Not when you type 'integral'. The word just tells the app: hey, bounds are required."

---

## Q3: "So when there are bounds it does the integral math?"

"No — bounds are just numbers. They don't trigger anything.

Look at the Trapezoidal function — bounds a and b are just plugged in here:"

```js
// methods.js — line 129
const h  = (b - a) / n;   // b and a are just numbers in a formula
const xs = Array.from({ length: n+1 }, (_, i) => a + i*h);
```

"If you put a = 0 and b = 4 in a box and never click Calculate,
nothing happens. The math only runs when Calculate is clicked —
and even then, it's the sidebar selection that decides WHAT formula runs.

So:
- Sidebar → decides which formula (Trapezoidal, Simpson's...)
- f(x), a, b, n → the numbers fed INTO that formula
- Calculate button → the trigger that actually runs everything
- Bounds alone → just two numbers sitting in boxes"

---

## Q4: "Where does it convert plain English to f(x)?
And where does it check 'integral' for the bounds?"

"Both happen in methods.js in the parseNL function.
Let me show you the key parts:

First — line 16 — the integral check:"

```js
// methods.js — line 16
const hasIntegral = /\bintegral\b/.test(s);
// if user typed "integral from 0 to 4 of sin x" → hasIntegral = true
// if user typed "sin of x" → hasIntegral = false
```

"Second — line 20 — extract the bounds from 'from X to Y':"

```js
// methods.js — line 20
const bm = s.match(/\bfrom\s+([-+]?[\d.]+|pi|e|tau)\s+to\s+([-+]?[\d.]+|pi|e|tau)\b/);
if (bm) { a = bm[1]; b = bm[2]; }
// "from 0 to 4" → a = "0", b = "4"
// "from 0 to pi" → a = "0", b = "pi"
```

"Third — lines 29 to 51 — the phrase replacement list.
It goes through every phrase one by one and swaps it:"

```js
// methods.js — line 29
const PHRASES = [
  ['e to the power of',  'exp('],  // "e to the power of x" → "exp(x"
  ['square root of',     'sqrt('], // "square root of x"    → "sqrt(x"
  ['sin of',             'sin('],  // "sin of x"            → "sin(x"
  ['multiplied by',      '*'],     // "x multiplied by 2"   → "x*2"
  ['divided by',         '/'],     // ...
  // ... and so on
];
for (const [from, to] of PHRASES) {
  while (s.includes(from)) s = s.split(from).join(to);
}
```

"Then line 67 handles power words:"

```js
// methods.js — line 67
[/pow(?:er)?\s*([a-z0-9.]+)/g, '^$1']
// "pow2"  → "^2"
// "powx"  → "^x"
// "pow 3" → "^3"
```

"Then line 81 fixes implicit multiplication:"

```js
// methods.js — line 81
s = s.replace(/(\d)x(?!\w)/g, '$1*x');  // "2x" → "2*x"
s = s.replace(/(\d)\s*\(/g,   '$1*(');  // "2(" → "2*("
```

"At the end it returns expr, a, b, and hasIntegral.

Then in app.js the doConvert function uses all of that:"

```js
// app.js — line 392
if (a !== '' && b !== '') {
  // bounds found in text → fill them in the form
  lowerEl.value = a;
  upperEl.value = b;

} else if (!hasIntegral) {
  // no "integral" word + no bounds → silently default to 0 and 1
  lowerEl.value = '0';
  upperEl.value = '1';
}
// if hasIntegral=true but no bounds → warn the user
```

"So the full flow for 'integral from 0 to 4 of 2x pow2 plus 5x' is:
1. hasIntegral = true
2. a = 0, b = 4 extracted
3. '2x pow2' → '2*x^2'
4. 'plus' → '+'
5. '5x' → '5*x'
6. result: f(x) = 2*x^2+5*x, a=0, b=4"

---

## Q5: "How did you put the website live?"

"Four commands basically.

Step 1 — turned the folder into a git repo and saved all the files:"

```bash
git init
git add .
git commit -m "Initial commit"
```

"Step 2 — created an empty repo on GitHub called NumericalMethods.

Step 3 — connected the local folder to GitHub and pushed the files:"

```bash
git remote add origin https://github.com/jhwh-212/NumericalMethods.git
git branch -M main
git push -u origin main
```

"Step 4 — in GitHub settings → Pages → set branch to main → Save.
GitHub gave us the URL automatically:
https://jhwh-212.github.io/NumericalMethods/

And it works without a server because everything is HTML, CSS, JavaScript —
static files. GitHub hosts those for free.
Every update after that is just:"

```bash
git add .
git commit -m "what I changed"
git push origin main
```

"Site updates in about a minute."

---
*Point to the actual file and line on screen when you say each code block*

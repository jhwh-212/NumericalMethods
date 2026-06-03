# Presentation Script — MAT 315 Numerical Methods Project
## (Speak naturally, don't rush, look at the screen when you demo)

---

### OPENING

"Okay so, for this project I built a website — a calculator basically —
that solves numerical methods problems. And not just gives you the answer,
it actually shows you every single step, draws you a graph, and even lets
you type the function in plain English instead of math notation.

The website is live, anyone can open it right now from their phone or laptop.
I'll show you."

---

### WHAT THE PROJECT COVERS

"So the app covers six methods from this course:

For integration: Trapezoidal Rule, Simpson's 1/3, Richardson Extrapolation, and Gauss-Legendre.
For interpolation: Lagrange and Newton Divided Difference.

All of them work the same way — you pick a method from the sidebar,
fill in your inputs, hit Calculate, and you get the full solution with a graph."

---

### LIVE DEMO — Integration (Trapezoidal)

*(Open the website, click Trapezoidal Rule)*

"So this is the calculator. At the top you've got the Smart Input box —
this is the main feature I want to show you first."

*(Type in the smart input:)*
**"integral from 0 to 4 of 2x pow2 plus 5x minus 10"**

"I press Convert — and look. It read the plain English,
figured out f(x) is 2x² + 5x − 10, and auto-filled a = 0, b = 4.
I didn't type a single math symbol."

"It works with all kinds of input:
'sin of x', 'e to the x', 'square root of x times cos of x',
'2x pow3', '2**x' — it handles all of it."

*(Click Calculate)*

"Now Calculate. And here's what you get:"

"The formula at the top — rendered in proper LaTeX notation.
Below that — every single step. h, the step size.
A full table with x values, f(x) at each point, and the coefficients.
Then the final calculation showing exactly how the answer was reached."

*(Scroll to graph)*

"And then the graph — it plots the function and shades the actual trapezoids
so you can SEE what the method is doing visually.
You can zoom in, hover on any point, export it as PNG."

---

### LIVE DEMO — Interpolation (Lagrange or Newton)

*(Click Lagrange Interpolation in sidebar)*

"Now for interpolation — same idea.
The Smart Input works here too.
I type 'x squared plus 2x minus 1'..."

*(Type in the interpolation smart input and convert)*

"It fills f(x). Now I pick the order — let's say 3rd order, cubic.
That means the app needs 4 data points: x₀, x₁, x₂, x₃."

*(Enter x values: 0, 1, 2, 3)*

"I enter my x values — and watch the y column.
It computes y = f(xᵢ) automatically for each one.
x₀ = 0 → y₀ = −1, x₁ = 1 → y₁ = 2, x₂ = 2 → y₂ = 7, x₃ = 3 → y₃ = 14.
No manual calculation needed."

"I put the interpolation point — say x* = 1.5 — and hit Calculate."

*(Click Calculate)*

"It builds the Lagrange polynomial, shows the basis polynomials L₀, L₁, L₂, L₃,
evaluates P(1.5), gives me the answer, and plots the polynomial curve
through all the data points with the interpolated point highlighted in green."

---

### VALIDATION

"The app also validates everything.
If I pick 5th order but only give 4 x values — it tells me exactly what's missing.
If I put duplicate x values — it catches that too.
If the function I typed doesn't make sense — it shows a red warning immediately."

---

### HOW IT'S BUILT

"Technically — pure HTML, CSS, and JavaScript. No framework, no backend.

The math is all in methods.js. Each method has its own function.
The graphs are Plotly.js. The formulas are rendered with MathJax.

The Smart Input — that's a custom parser I wrote.
It reads the plain English, replaces words like 'plus' with '+',
'squared' with '^2', 'sin of' with 'sin(', 'pow2' with '^2',
and cleans it up into a valid math expression.

The same parser works for both integration and interpolation —
for integration it also extracts bounds from 'from X to Y',
for interpolation it just fills the f(x) field and the user enters x values."

---

### CLOSING

"So to wrap it up — six methods, step-by-step solutions, interactive graphs,
smart plain-English input, order selection for interpolation,
auto-computed y values, dark mode, mobile responsive, and it's live online.

The code and documentation are all on GitHub.

That's it. Any questions?"

---

### QUICK ANSWERS IF ASKED

**"What's the difference between Lagrange and Newton?"**
"Same polynomial, different algorithm. Lagrange computes basis polynomials for each point.
Newton uses a divided difference table — easier to update if you add more data points.
Both give the same answer."

**"Why does the order matter for interpolation?"**
"The order is the degree of the polynomial. 1st order is a straight line through 2 points.
2nd order is a parabola through 3 points. 3rd order is cubic through 4 points.
Higher order = more accurate fit but needs more data points.
For nth order you need exactly n+1 points."

**"How does it compute y automatically?"**
"Once you enter f(x) and type an x value, the app calls math.js in the background —
same library that evaluates f(x) for the integration methods.
It runs f(x) = expression at that specific x and shows the result instantly."

**"What's the difference between Trapezoidal and Simpson's?"**
"Trapezoidal connects points with straight lines — simple but less accurate.
Simpson's fits a parabola through every two panels — more accurate for the same n.
Richardson takes two trapezoidal estimates at different step sizes and combines them
to get even higher accuracy with no extra work."

**"Why did you use JavaScript instead of Python?"**
"JavaScript runs directly in the browser — no installation, no server needed.
Anyone clicks the link and it works. Python would need a backend or the user
to have Python installed. This way it's just a URL."

**"How did you put it live?"**
"GitHub Pages. Four commands — init, commit, push, then enable Pages in GitHub settings.
GitHub hosts static files for free and gives you a public URL."

---
*Total speaking time: approximately 6–8 minutes with demo*

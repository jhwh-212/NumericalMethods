# Presentation Script — MAT 315 Numerical Methods Project
## (Speak naturally, don't rush, look at the screen when you demo)

---

### OPENING

"Okay so, for this project I built a website — a calculator basically —
that solves numerical methods problems. And not just gives you the answer,
it actually shows you every single step, draws you a graph, and even lets
you type the function in plain English instead of math notation."

"The website is live, anyone can open it right now from their phone or laptop —
I'll show you in a second."

---

### WHAT THE PROJECT IS

"So the idea is simple. In this course we learned methods like Trapezoidal Rule,
Simpson's, Richardson, Gauss-Legendre for integration — and Lagrange and Newton
for interpolation. All of these have formulas you have to apply manually,
and honestly it takes time and you can make mistakes."

"So I thought — why not just build something that does it automatically,
but still shows you the work so you can actually understand what's happening?"

---

### LIVE DEMO — opening the site

*(Open the website on screen)*

"So this is the homepage. You've got all six methods right here as cards.
I click on one — let's say Trapezoidal Rule — and now I'm in the calculator."

---

### THE SMART INPUT FEATURE

"Now here's the part I like the most. You see this box at the top — Smart Input.
Instead of figuring out how to type the function in math notation,
you just... write it like you're talking."

*(Type in the smart input box:)*
**"integral from 0 to 4 of 2x pow2 plus 5x minus 10"**

"I hit Convert — and look. It figured out that f(x) is 2x² + 5x − 10,
it set a = 0, b = 4, automatically. I didn't type a single symbol."

"And it works with things like 'sin of x', 'e to the x', 'square root of x',
'divided by', 'squared'... it reads it and converts it."

---

### CALCULATING

*(Click Calculate)*

"Now I hit Calculate. And here's what you get:"

"First — the formula. You can see the actual Trapezoidal formula rendered
in proper math notation up here."

"Then below that — every single step. It shows you h, the step size.
It gives you a full table with all the x values, f(x) at each point,
and the coefficient — whether it's 1 or 2. Then it shows you the final calculation."

"So you're not just getting a number. You're seeing exactly how the number was reached."

---

### THE GRAPH

"And then there's the graph. It plots the function, shades the trapezoids
so you can actually see what the method is doing visually.
You can zoom in, hover on points, see the values."

"For interpolation it's different — it plots your data points, draws the polynomial
curve through them, and highlights the interpolated point in green."

---

### THE OTHER METHODS

*(Quickly switch to Simpson's, then Lagrange)*

"Simpson's Rule works the same way — you put in your function and bounds,
it shows the parabolic panels in the graph instead of trapezoids."

"For Lagrange and Newton, instead of a function, you enter data points —
x values and y values — and an interpolation point, and it builds the
polynomial and tells you the estimated value at that point."

---

### HOW IT'S BUILT (Part 2 of the project)

"So technically — the whole thing is HTML, CSS, and JavaScript. No framework,
no backend. Pure front-end."

"The math is all in one file called methods.js. Each method is its own function.
For example for the Trapezoidal Rule, it takes the expression, bounds a and b,
and n — computes h, evaluates f(x) at every point using a library called Math.js,
then applies the formula. That's it."

"The graphs are Plotly.js. The formulas you see rendered in LaTeX are MathJax."

"And the Smart Input — that's my own parser I wrote. It reads the plain English,
replaces words like 'plus' with '+', 'squared' with '^2', 'sin of' with 'sin(',
and cleans it up into a valid math expression."

---

### CLOSING

"So to wrap it up — the project covers all six methods from the course,
shows step-by-step solutions, gives you interactive graphs,
works on mobile, has dark mode, and you can export the graph or print the solution."

"The code is all on GitHub, the live site is up and running,
and honestly I think it's actually useful — not just for this course
but for anyone studying numerical methods."

"That's it. Any questions?"

---

### IF THEY ASK ABOUT THE MATH

**"How does the Trapezoidal Rule work?"**
"You split the area under the curve into trapezoids — equal width strips.
You calculate the area of each trapezoid and add them up.
More strips means more accurate. That's basically it."

**"What's the difference between Lagrange and Newton?"**
"They give you the same polynomial — same answer — but they get there differently.
Lagrange is more explicit, you compute basis polynomials for each point.
Newton uses a difference table and is easier to update if you add more data points."

**"Why did you use JavaScript instead of Python?"**
"Because JavaScript runs in the browser — no installation needed, no server,
anyone can just open the link and use it. Python would need a backend
or someone to install libraries. This way it's just a link."

---
*Total speaking time: approximately 5–7 minutes*

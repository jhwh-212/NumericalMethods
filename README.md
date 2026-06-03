# 📐 Numerical Methods Calculator

A modern, responsive, and professional educational web application for **Numerical Analysis**. Students and engineers can solve integration and interpolation problems using six classic numerical methods — with step-by-step solutions, interactive graphs, and a smart natural-language input that converts plain English into math expressions.

🔗 **Live Demo:** [https://jhwh-212.github.io/NumericalMethods/](https://jhwh-212.github.io/NumericalMethods/)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Smart Input** | Type in plain English — the app converts it to a valid math expression |
| 📊 **Interactive Graphs** | Zoom, pan, and hover on Plotly.js visualizations |
| 🔢 **Step-by-Step Solutions** | Every intermediate value shown in formatted tables |
| 🌙 **Dark / Light Mode** | Theme toggle with persistence via localStorage |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| 📄 **Export** | Download graph as PNG or print / save as PDF |
| ✅ **Input Validation** | Friendly error messages for invalid expressions or inputs |

---

## 🔬 Supported Methods

### Integration
| Method | Description |
|---|---|
| **Trapezoidal Rule** | Approximates the integral using trapezoid shapes |
| **Simpson's 1/3 Rule** | Higher-accuracy integration using parabolic arcs |
| **Richardson Extrapolation** | Combines two trapezoidal estimates to boost accuracy |
| **Gauss-Legendre Quadrature** | Optimal Gaussian quadrature (orders 2 – 5) |

### Interpolation
| Method | Description |
|---|---|
| **Lagrange Interpolation** | Constructs a polynomial through given data points |
| **Newton Divided Difference** | Interpolation using the divided difference table |

---

## 🛠️ Technologies

- **HTML5** — semantic structure
- **CSS3** — custom properties, responsive grid, dark/light themes, animations
- **JavaScript (ES6+)** — vanilla JS, no frameworks
- **[Math.js](https://mathjs.org/)** — safe expression evaluation
- **[Plotly.js](https://plotly.com/javascript/)** — interactive graphs
- **[MathJax 3](https://www.mathjax.org/)** — LaTeX formula rendering

---

## 🚀 Getting Started

No build tools or dependencies to install. Just open the file:

```bash
git clone https://github.com/jhwh-212/NumericalMethods.git
cd NumericalMethods
# Open index.html in any modern browser
```

Or visit the live site directly:

```
https://jhwh-212.github.io/NumericalMethods/
```

---

## 📖 How to Use

### Integration Methods
1. Select a method from the sidebar or homepage cards
2. Use **Smart Input** to describe your function in plain English, or type directly in the `f(x)` field
3. Fill in bounds **a** and **b** (auto-filled if you mention them in Smart Input)
4. Set the number of intervals **n**
5. Click **Calculate**

### Interpolation Methods
1. Select Lagrange or Newton from the sidebar
2. Enter the number of data points and click **Generate Fields**
3. Fill in your x and y values
4. Enter the interpolation point x
5. Click **Calculate**

---

## 🧠 Smart Input — Plain English Examples

The Smart Input box accepts natural language and converts it to a valid math expression. Bounds are auto-filled when you include `from X to Y`.

| You type | Converted to |
|---|---|
| `integral from 0 to 4 (2x pow2 plus 5x minus 10)` | `f(x) = 2*x^2+5*x-10`, a=0, b=4 |
| `sin of x plus x squared from 0 to pi` | `f(x) = sin(x)+x^2`, a=0, b=pi |
| `e to the x minus cube root of x` | `f(x) = exp(x)-cbrt(x)` |
| `square root of x times cos of x` | `f(x) = sqrt(x)*cos(x)` |
| `2**x + ln of x from 1 to 5` | `f(x) = 2^x+ln(x)`, a=1, b=5 |
| `x powx` | `f(x) = x^x` |

**Supported keywords:**
- **Powers:** `pow`, `power`, `squared`, `cubed`, `to the power of`, `**`
- **Trig:** `sin`, `cos`, `tan`, `sine of`, `cosine of`, `arcsin`, `sinh`, ...
- **Functions:** `sqrt`, `square root of`, `ln`, `log`, `exp`, `abs`, `absolute value of`, ...
- **Operators:** `plus`, `minus`, `times`, `divided by`, `over`, `negative`
- **Constants:** `pi`, `e`, `phi`, `tau`

---

## 📂 Project Structure

```
NumericalMethods/
├── index.html          # Application shell — sidebar, panel, hero page
├── css/
│   └── styles.css      # All styling — themes, layout, components, animations
├── js/
│   ├── methods.js      # Numerical methods + NL → math parser
│   ├── charts.js       # Plotly.js chart builders per method type
│   └── app.js          # UI controller — routing, conversion, rendering
└── .nojekyll           # Disables Jekyll so GitHub Pages serves assets correctly
```

---

## 📐 Mathematical Formulas

### Trapezoidal Rule
$$T = \frac{h}{2}\left[f(x_0) + 2\sum_{i=1}^{n-1}f(x_i) + f(x_n)\right], \quad h = \frac{b-a}{n}$$

### Simpson's 1/3 Rule
$$S = \frac{h}{3}\left[f(x_0) + 4\sum_{\text{odd}} f(x_i) + 2\sum_{\text{even}} f(x_i) + f(x_n)\right]$$

### Richardson Extrapolation
$$R = \frac{4T(h/2) - T(h)}{3}$$

### Gauss-Legendre
$$I \approx \frac{b-a}{2}\sum_{i=1}^{n} w_i\, f\!\left(\frac{b-a}{2}t_i + \frac{b+a}{2}\right)$$

### Lagrange Interpolation
$$P(x) = \sum_{k=0}^{n} y_k L_k(x), \quad L_k(x) = \prod_{j \neq k} \frac{x - x_j}{x_k - x_j}$$

### Newton Divided Difference
$$P(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1) + \cdots$$

---

## 🖥️ Screenshots

### Homepage — Method Selection
> Six method cards with descriptions, sidebar navigation, and dark/light toggle.

### Smart Input — Natural Language Converter
> Type `integral from 0 to pi of sin of x` → auto-fills f(x), a, b with live preview.

### Step-by-Step Solution
> Every calculation broken into labelled steps with formatted tables.

### Interactive Graph
> Plotly chart with zoom, pan, tooltips — shaded trapezoids / Simpson panels / interpolation curve.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ for Numerical Analysis students
</div>

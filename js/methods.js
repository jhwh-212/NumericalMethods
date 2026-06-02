/* =============================================
   Numerical Methods Implementations
   ============================================= */

const NM = {};

/* =============================================
   Natural Language → Math Expression Parser
   ============================================= */
NM.parseNL = function(input) {
  let s = input.trim().toLowerCase();

  // ── 1. Extract integration bounds ───────────────────────────────────
  // "from 0 to 4", "from -1 to 1", "between 0 and pi"
  let a = '', b = '';
  const boundRe = [
    /from\s+([-+]?[\d.]+|pi|e)\s+to\s+([-+]?[\d.]+|pi|e)/,
    /between\s+([-+]?[\d.]+|pi|e)\s+and\s+([-+]?[\d.]+|pi|e)/,
  ];
  for (const re of boundRe) {
    const m = s.match(re);
    if (m) { a = m[1]; b = m[2]; s = s.replace(m[0], ''); break; }
  }

  // ── 2. Strip structural words ────────────────────────────────────────
  s = s.replace(/\bintegral\b/g, '');
  s = s.replace(/\bfunction\b/g, '');
  s = s.replace(/\bthe\b/g, '');
  s = s.replace(/\bvalue\b/g, '');
  s = s.replace(/\bwhere\b/g, '');

  // ── 3. Functions (longest phrases first to avoid partial matches) ────
  const fnMap = [
    [/\bsquare\s+root\s+of\b/g,             'sqrt('],
    [/\bsquare\s+root\b/g,                  'sqrt('],
    [/\bcube\s+root\s+of\b/g,               'cbrt('],
    [/\bcube\s+root\b/g,                    'cbrt('],
    [/\bsqrt\s+of\b/g,                      'sqrt('],
    [/\bsqrt\b/g,                           'sqrt('],
    [/\bnatural\s+log(?:arithm)?\s+of\b/g,  'ln('],
    [/\bnatural\s+log(?:arithm)?\b/g,       'ln('],
    [/\bln\s+of\b/g,                        'ln('],
    [/\bln\b/g,                             'ln('],
    [/\blog\s+base\s*2\s+of\b/g,            'log2('],
    [/\blog\s+base\s*10\s+of\b/g,           'log10('],
    [/\blog\s*2\s+of\b/g,                   'log2('],
    [/\blog\s*10\s+of\b/g,                  'log10('],
    [/\blog\s+of\b/g,                       'log('],
    [/\blog\b/g,                            'log('],
    [/\be\s+to\s+the\s+power\s+of\b/g,      'exp('],
    [/\be\s+to\s+the\s+power\b/g,           'exp('],
    [/\be\s+to\s+the\b/g,                   'exp('],
    [/\bexponential\s+of\b/g,               'exp('],
    [/\bexp\s+of\b/g,                       'exp('],
    [/\bexp\b/g,                            'exp('],
    [/\babsolute\s+value\s+of\b/g,          'abs('],
    [/\babs\s+of\b/g,                       'abs('],
    [/\babs\b/g,                            'abs('],
    [/\bsinh\b/g,                           'sinh('],
    [/\bcosh\b/g,                           'cosh('],
    [/\btanh\b/g,                           'tanh('],
    [/\bsine\s+of\b/g,                      'sin('],
    [/\bsin\s+of\b/g,                       'sin('],
    [/\bsin\b/g,                            'sin('],
    [/\bcosine\s+of\b/g,                    'cos('],
    [/\bcos\s+of\b/g,                       'cos('],
    [/\bcos\b/g,                            'cos('],
    [/\btangent\s+of\b/g,                   'tan('],
    [/\btan\s+of\b/g,                       'tan('],
    [/\btan\b/g,                            'tan('],
    [/\barcsin\b/g,                         'asin('],
    [/\barccos\b/g,                         'acos('],
    [/\barctan\b/g,                         'atan('],
    [/\bceil(?:ing)?\s+of\b/g,              'ceil('],
    [/\bfloor\s+of\b/g,                     'floor('],
  ];
  for (const [re, rep] of fnMap) s = s.replace(re, rep);

  // ── 4. Powers ────────────────────────────────────────────────────────
  s = s.replace(/\bto\s+the\s+power\s+of\s+([\d.]+)/g,    '^$1');
  s = s.replace(/\bto\s+the\s+power\s+of\s+\((.*?)\)/g,   '^($1)');
  s = s.replace(/\bto\s+the\s+power\s+([\d.]+)/g,         '^$1');
  s = s.replace(/\bto\s+the\s+([\d]+)(?:st|nd|rd|th)\b/g, '^$1');
  s = s.replace(/\bto\s+the\s+([\d.]+)/g,                 '^$1');
  s = s.replace(/\bsquared\b/g,                           '^2');
  s = s.replace(/\bcubed\b/g,                             '^3');
  s = s.replace(/\bpow(?:er)?\s*([\d.]+)/g,               '^$1');
  s = s.replace(/\bpower\s+([\d.]+)/g,                    '^$1');
  // Clean spaces around ^
  s = s.replace(/\s*\^\s*/g, '^');

  // ── 5. Arithmetic operators ──────────────────────────────────────────
  s = s.replace(/\bplus\b/g,           '+');
  s = s.replace(/\bminus\b/g,          '-');
  s = s.replace(/\btimes\b/g,          '*');
  s = s.replace(/\bmultiplied\s+by\b/g,'*');
  s = s.replace(/\bdivided\s+by\b/g,  '/');
  s = s.replace(/\bover\b/g,           '/');
  s = s.replace(/\bnegative\b/g,       '-');

  // ── 6. Constants (protect before implicit-mult step) ────────────────
  s = s.replace(/\bpi\b/g,   'pi');
  s = s.replace(/\bphi\b/g,  'phi');
  s = s.replace(/\btau\b/g,  'tau');
  // standalone 'e' handled carefully below

  // ── 7. Implicit multiplication ───────────────────────────────────────
  // digit + space + letter/( → digit * letter/(
  s = s.replace(/(\d)\s+([a-z(])/g, '$1*$2');
  // digit immediately before letter (not digit, not existing operator)
  // but skip e^ to not break "2e^x" before it's fixed
  s = s.replace(/(\d)(x|pi|phi|tau|sin|cos|tan|log|ln|sqrt|cbrt|abs|exp|asin|acos|atan|sinh|cosh|tanh)/g, '$1*$2');
  // digit before (
  s = s.replace(/(\d)\(/g, '$1*(');
  // x before (  e.g. "x(x+1)" → "x*(x+1)"
  s = s.replace(/x\s*\(/g, 'x*(');
  // digit alone followed by 'e' not part of 'exp'
  s = s.replace(/(\d)e(?!\^|xp)/g, '$1*e');

  // ── 8. Remove leftover plain words that aren't math ─────────────────
  // strip words made entirely of letters that aren't known math tokens
  const mathTokens = /\b(x|pi|phi|tau|e|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|log|log2|log10|ln|exp|abs|ceil|floor|round)\b/;
  s = s.replace(/\b([a-df-wyz][a-z]*)\b/g, (m) => mathTokens.test(m) ? m : '');

  // ── 9. Clean up ──────────────────────────────────────────────────────
  // Remove spaces around all operators
  s = s.replace(/\s*([\+\-\*\/\^])\s*/g, '$1');
  // Collapse multiple spaces
  s = s.replace(/\s+/g, '');
  // Remove leading/trailing dangling operators (not minus, that could be unary)
  s = s.replace(/^[+*\/^]+/, '');
  s = s.replace(/[+*\/^]+$/, '');
  // Fix double operators like "+-" or "--" → keep last one
  s = s.replace(/([+\-*\/^])\s*([+*\/^])/g, '$2');

  // ── 10. Auto-close open parentheses ─────────────────────────────────
  const opens  = (s.match(/\(/g) || []).length;
  const closes = (s.match(/\)/g) || []).length;
  s += ')'.repeat(Math.max(0, opens - closes));

  return { expr: s.trim(), a, b };
};

/* ---- Utility: evaluate f(x) safely ---- */
NM.evalFn = function(expr, x) {
  try {
    return math.evaluate(expr, { x });
  } catch(e) {
    throw new Error('Cannot evaluate expression at x = ' + x + '. Check your formula.');
  }
};

NM.validateFn = function(expr) {
  if (!expr || expr.trim() === '') throw new Error('Function f(x) is required.');
  try { NM.evalFn(expr, 1); } catch(e) { throw new Error('Invalid function: ' + e.message); }
};

/* =============================================
   1. TRAPEZOIDAL RULE
   ============================================= */
NM.trapezoidal = function({ expr, a, b, n }) {
  NM.validateFn(expr);
  a = +a; b = +b; n = Math.round(+n);
  if (isNaN(a) || isNaN(b)) throw new Error('Bounds a and b must be numbers.');
  if (a >= b) throw new Error('Lower bound a must be less than upper bound b.');
  if (n < 1) throw new Error('Number of intervals n must be at least 1.');

  const h = (b - a) / n;
  const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
  const ys = xs.map(x => NM.evalFn(expr, x));

  const sum = ys[0] + ys[n] + 2 * ys.slice(1, n).reduce((s, v) => s + v, 0);
  const result = (h / 2) * sum;

  const steps = [
    {
      title: 'Step 1: Calculate h (step size)',
      content: `h = (b − a) / n = (${b} − ${a}) / ${n} = <code>${h.toPrecision(8)}</code>`
    },
    {
      title: 'Step 2: Generate x-nodes',
      table: {
        headers: ['i', 'xᵢ', 'f(xᵢ)', 'coefficient'],
        rows: xs.map((x, i) => [
          i, x.toPrecision(8), ys[i].toPrecision(8),
          i === 0 || i === n ? '1' : '2'
        ])
      }
    },
    {
      title: 'Step 3: Apply formula',
      content: `T = (h/2) × [f(x₀) + 2∑f(xᵢ) + f(xₙ)]<br>
        = (${h.toPrecision(6)}/2) × ${sum.toPrecision(10)}<br>
        = <code>${result.toPrecision(10)}</code>`
    }
  ];

  return { result, steps, xs, ys, h, n, a, b };
};

/* =============================================
   2. SIMPSON'S 1/3 RULE
   ============================================= */
NM.simpson = function({ expr, a, b, n }) {
  NM.validateFn(expr);
  a = +a; b = +b; n = Math.round(+n);
  if (isNaN(a) || isNaN(b)) throw new Error('Bounds must be numbers.');
  if (a >= b) throw new Error('Lower bound a must be less than upper bound b.');
  if (n < 2) throw new Error('n must be at least 2.');
  if (n % 2 !== 0) throw new Error('n must be even for Simpson\'s 1/3 Rule.');

  const h = (b - a) / n;
  const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
  const ys = xs.map(x => NM.evalFn(expr, x));

  let sumOdd = 0, sumEven = 0;
  for (let i = 1; i < n; i++) {
    if (i % 2 === 1) sumOdd += ys[i];
    else sumEven += ys[i];
  }
  const result = (h / 3) * (ys[0] + 4 * sumOdd + 2 * sumEven + ys[n]);

  const steps = [
    {
      title: 'Step 1: Calculate h',
      content: `h = (b − a) / n = (${b} − ${a}) / ${n} = <code>${h.toPrecision(8)}</code>`
    },
    {
      title: 'Step 2: Tabulate f(xᵢ) with coefficients',
      table: {
        headers: ['i', 'xᵢ', 'f(xᵢ)', 'Coefficient', 'Term'],
        rows: xs.map((x, i) => {
          const coeff = (i === 0 || i === n) ? 1 : (i % 2 === 1 ? 4 : 2);
          return [i, x.toPrecision(8), ys[i].toPrecision(8), coeff, (coeff * ys[i]).toPrecision(8)];
        })
      }
    },
    {
      title: 'Step 3: Apply Simpson\'s formula',
      content: `S = (h/3) × [f(x₀) + 4∑f(xodd) + 2∑f(xeven) + f(xₙ)]<br>
        f(x₀) = ${ys[0].toPrecision(8)}, f(xₙ) = ${ys[n].toPrecision(8)}<br>
        4·∑odd = ${(4 * sumOdd).toPrecision(8)}, 2·∑even = ${(2 * sumEven).toPrecision(8)}<br>
        S = (${h.toPrecision(6)}/3) × ${(ys[0] + 4*sumOdd + 2*sumEven + ys[n]).toPrecision(8)}<br>
        = <code>${result.toPrecision(10)}</code>`
    }
  ];

  return { result, steps, xs, ys, h, n, a, b };
};

/* =============================================
   3. RICHARDSON EXTRAPOLATION
   ============================================= */
NM.richardson = function({ expr, a, b, n }) {
  NM.validateFn(expr);
  a = +a; b = +b; n = Math.round(+n);
  if (isNaN(a) || isNaN(b)) throw new Error('Bounds must be numbers.');
  if (a >= b) throw new Error('Lower bound a must be less than upper bound b.');
  if (n < 2) throw new Error('n must be at least 2.');

  const trap = (intervals) => {
    const h = (b - a) / intervals;
    const xs = Array.from({ length: intervals + 1 }, (_, i) => a + i * h);
    const ys = xs.map(x => NM.evalFn(expr, x));
    const sum = ys[0] + ys[intervals] + 2 * ys.slice(1, intervals).reduce((s, v) => s + v, 0);
    return { val: (h / 2) * sum, h, xs, ys };
  };

  const t1 = trap(n);
  const t2 = trap(2 * n);
  const result = (4 * t2.val - t1.val) / 3;
  const error = Math.abs(result - t2.val);

  const steps = [
    {
      title: 'Step 1: Trapezoidal estimate with n intervals',
      content: `n = ${n}, h₁ = ${t1.h.toPrecision(8)}<br>T(h₁) = <code>${t1.val.toPrecision(10)}</code>`
    },
    {
      title: 'Step 2: Trapezoidal estimate with 2n intervals',
      content: `n = ${2*n}, h₂ = ${t2.h.toPrecision(8)}<br>T(h₂) = <code>${t2.val.toPrecision(10)}</code>`
    },
    {
      title: 'Step 3: Apply Richardson formula',
      content: `R = [4·T(h₂) − T(h₁)] / 3<br>
        = [4 × ${t2.val.toPrecision(8)} − ${t1.val.toPrecision(8)}] / 3<br>
        = <code>${result.toPrecision(10)}</code>`
    },
    {
      title: 'Step 4: Error estimate',
      content: `|R − T(h₂)| = |${result.toPrecision(8)} − ${t2.val.toPrecision(8)}|<br>
        = <code>${error.toExponential(4)}</code>`
    }
  ];

  return { result, steps, xs: t2.xs, ys: t2.ys, h: t2.h, n: 2*n, a, b, error, t1: t1.val, t2: t2.val };
};

/* =============================================
   4. GAUSS-LEGENDRE INTEGRATION
   ============================================= */
NM.gaussLegendre = function({ expr, a, b, n }) {
  NM.validateFn(expr);
  a = +a; b = +b; n = +n;
  if (isNaN(a) || isNaN(b)) throw new Error('Bounds must be numbers.');
  if (a >= b) throw new Error('Lower bound a must be less than upper bound b.');

  // Nodes and weights for [-1,1]
  const GL = {
    2: { nodes: [-0.5773502692, 0.5773502692], weights: [1, 1] },
    3: { nodes: [-0.7745966692, 0, 0.7745966692], weights: [0.5555555556, 0.8888888889, 0.5555555556] },
    4: { nodes: [-0.8611363116, -0.3399810436, 0.3399810436, 0.8611363116],
         weights: [0.3478548451, 0.6521451549, 0.6521451549, 0.3478548451] },
    5: { nodes: [-0.9061798459, -0.5384693101, 0, 0.5384693101, 0.9061798459],
         weights: [0.2369268851, 0.4786286705, 0.5688888889, 0.4786286705, 0.2369268851] }
  };

  const gl = GL[n];
  if (!gl) throw new Error('Order must be between 2 and 5.');

  const mid = (b + a) / 2;
  const half = (b - a) / 2;

  const terms = gl.nodes.map((t, i) => {
    const xi = mid + half * t;
    const fi = NM.evalFn(expr, xi);
    return { t, xi, fi, wi: gl.weights[i], term: gl.weights[i] * fi };
  });

  const sum = terms.reduce((s, t) => s + t.term, 0);
  const result = half * sum;

  const steps = [
    {
      title: 'Step 1: Transform interval [a,b] → [−1,1]',
      content: `x = ((b−a)/2)·t + (b+a)/2<br>
        mid = (${b}+${a})/2 = ${mid.toPrecision(8)}<br>
        half = (${b}−${a})/2 = ${half.toPrecision(8)}`
    },
    {
      title: `Step 2: Gauss-Legendre nodes & weights (n=${n})`,
      table: {
        headers: ['i', 'tᵢ (node)', 'wᵢ (weight)', 'xᵢ = mid+half·tᵢ', 'f(xᵢ)', 'wᵢ·f(xᵢ)'],
        rows: terms.map((t, i) => [
          i+1, t.t.toPrecision(8), t.wi.toPrecision(8),
          t.xi.toPrecision(8), t.fi.toPrecision(8), t.term.toPrecision(8)
        ])
      }
    },
    {
      title: 'Step 3: Apply formula',
      content: `I ≈ ((b−a)/2) × Σ wᵢ·f(xᵢ)<br>
        = ${half.toPrecision(6)} × ${sum.toPrecision(10)}<br>
        = <code>${result.toPrecision(10)}</code>`
    }
  ];

  const xs = terms.map(t => t.xi);
  const ys = terms.map(t => t.fi);

  return { result, steps, xs, ys, a, b, n, nodes: terms };
};

/* =============================================
   5. LAGRANGE INTERPOLATION
   ============================================= */
NM.lagrange = function({ xData, yData, xInterp }) {
  if (!xData || xData.length < 2) throw new Error('At least 2 data points required.');
  if (xData.length !== yData.length) throw new Error('x and y arrays must have same length.');

  xData = xData.map(Number);
  yData = yData.map(Number);
  xInterp = +xInterp;

  if (xData.some(isNaN) || yData.some(isNaN)) throw new Error('All data values must be numbers.');
  if (isNaN(xInterp)) throw new Error('Interpolation point must be a number.');

  // Check for duplicate x values
  const unique = new Set(xData);
  if (unique.size !== xData.length) throw new Error('Duplicate x values are not allowed.');

  const n = xData.length;

  const basisAt = (k, x) => {
    let num = 1, den = 1;
    for (let j = 0; j < n; j++) {
      if (j !== k) { num *= (x - xData[j]); den *= (xData[k] - xData[j]); }
    }
    return num / den;
  };

  const Lvals = xData.map((_, k) => basisAt(k, xInterp));
  const result = Lvals.reduce((sum, Lk, k) => sum + yData[k] * Lk, 0);

  const steps = [
    {
      title: 'Step 1: Data Points',
      table: {
        headers: ['i', 'xᵢ', 'yᵢ = f(xᵢ)'],
        rows: xData.map((x, i) => [i, x, yData[i]])
      }
    },
    {
      title: 'Step 2: Lagrange Basis Polynomials at x = ' + xInterp,
      content: xData.map((_, k) => {
        const numTerms = xData.filter((_, j) => j !== k).map(xj => `(${xInterp}−${xj})`).join('·');
        const denTerms = xData.filter((_, j) => j !== k).map(xj => `(${xData[k]}−${xj})`).join('·');
        return `L<sub>${k}</sub>(${xInterp}) = ${numTerms} / ${denTerms} = <code>${Lvals[k].toPrecision(8)}</code>`;
      }).join('<br>')
    },
    {
      title: 'Step 3: Compute P(x)',
      content: `P(${xInterp}) = Σ yᵢ · Lᵢ(${xInterp})<br>` +
        xData.map((_, k) => `  + ${yData[k]} × ${Lvals[k].toPrecision(6)}`).join('<br>') +
        `<br>= <code>${result.toPrecision(10)}</code>`
    }
  ];

  return { result, steps, xData, yData, xInterp, Lvals };
};

/* =============================================
   6. NEWTON INTERPOLATION (Divided Differences)
   ============================================= */
NM.newton = function({ xData, yData, xInterp }) {
  if (!xData || xData.length < 2) throw new Error('At least 2 data points required.');
  if (xData.length !== yData.length) throw new Error('x and y arrays must have same length.');

  xData = xData.map(Number);
  yData = yData.map(Number);
  xInterp = +xInterp;

  if (xData.some(isNaN) || yData.some(isNaN)) throw new Error('All data values must be numbers.');
  if (isNaN(xInterp)) throw new Error('Interpolation point must be a number.');

  const unique = new Set(xData);
  if (unique.size !== xData.length) throw new Error('Duplicate x values are not allowed.');

  const n = xData.length;

  // Build divided difference table
  const dd = Array.from({ length: n }, (_, i) => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dd[i][0] = yData[i];
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      dd[i][j] = (dd[i+1][j-1] - dd[i][j-1]) / (xData[i+j] - xData[i]);
    }
  }

  const coeffs = dd[0]; // diagonal: coefficients a0, a1, ...

  // Evaluate P(xInterp) using Horner's method
  let result = coeffs[n-1];
  for (let i = n-2; i >= 0; i--) {
    result = result * (xInterp - xData[i]) + coeffs[i];
  }

  // Build the divided difference table rows for display
  const tableRows = [];
  for (let i = 0; i < n; i++) {
    const row = [i, xData[i], yData[i]];
    for (let j = 1; j < n; j++) {
      row.push(i < n - j ? dd[i][j].toPrecision(6) : '');
    }
    tableRows.push(row);
  }
  const ddHeaders = ['i', 'xᵢ', 'f[xᵢ]', ...Array.from({length: n-1}, (_, k) => `f[x₀..x${k+1}]`)];

  const polynomialTerms = coeffs.map((c, k) => {
    if (k === 0) return c.toPrecision(6);
    const factors = xData.slice(0, k).map(xi => `(x−${xi})`).join('');
    return `${c >= 0 ? '+' : ''}${c.toPrecision(6)}${factors}`;
  }).join(' ');

  const steps = [
    {
      title: 'Step 1: Data Points',
      table: {
        headers: ['i', 'xᵢ', 'yᵢ'],
        rows: xData.map((x, i) => [i, x, yData[i]])
      }
    },
    {
      title: 'Step 2: Divided Difference Table',
      table: { headers: ddHeaders, rows: tableRows }
    },
    {
      title: 'Step 3: Newton Polynomial',
      content: `P(x) = ${polynomialTerms}`
    },
    {
      title: 'Step 4: Evaluate at x = ' + xInterp,
      content: `Using Horner\'s method:<br>P(${xInterp}) = <code>${result.toPrecision(10)}</code>`
    }
  ];

  return { result, steps, xData, yData, xInterp, coeffs };
};

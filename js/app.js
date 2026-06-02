/* =============================================
   Main Application Controller
   ============================================= */

(function() {
  'use strict';

  // ---- State ----
  let currentMethod = null;

  // ---- DOM refs ----
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('overlay');
  const menuBtn        = document.getElementById('menuBtn');
  const sidebarClose   = document.getElementById('sidebarClose');
  const themeToggle    = document.getElementById('themeToggle');
  const themeIcon      = document.getElementById('themeIcon');
  const themeLabel     = document.getElementById('themeLabel');
  const heroSection    = document.getElementById('heroSection');
  const calcPanel      = document.getElementById('calculatorPanel');
  const methodTitle    = document.getElementById('methodTitle');
  const formulaDisplay = document.getElementById('formulaDisplay');
  const calcBtn        = document.getElementById('calculateBtn');
  const clearBtn       = document.getElementById('clearBtn');
  const errorMsg       = document.getElementById('errorMessage');
  const resultsCard    = document.getElementById('resultsCard');
  const graphCard      = document.getElementById('graphCard');
  const generatePtsBtn = document.getElementById('generatePointsBtn');
  const exportPngBtn   = document.getElementById('exportPngBtn');
  const printResultBtn = document.getElementById('printResultBtn');
  const printBtn       = document.getElementById('printBtn');
  const exportPdfBtn   = document.getElementById('exportPdfBtn');
  const nlInput        = document.getElementById('nlInput');
  const nlConvertBtn   = document.getElementById('nlConvertBtn');
  const nlPreviewBar   = document.getElementById('nlPreviewBar');
  const nlPreviewIcon  = document.getElementById('nlPreviewIcon');
  const nlPreviewText  = document.getElementById('nlPreviewText');

  // Input containers
  const integInputs    = document.getElementById('integrationInputs');
  const interpInputs   = document.getElementById('interpolationInputs');
  const intervalsGroup = document.getElementById('intervalsGroup');
  const intervalsHint  = document.getElementById('intervalsHint');
  const gaussOrderGroup= document.getElementById('gaussOrderGroup');

  // ---- Method metadata ----
  const METHODS = {
    trapezoidal: {
      label: 'Trapezoidal Rule',
      type: 'integration',
      formula: '$$T = \\frac{h}{2}\\left[f(x_0) + 2\\sum_{i=1}^{n-1}f(x_i) + f(x_n)\\right], \\quad h = \\frac{b-a}{n}$$',
      showIntervals: true, intervalsEven: false, showGauss: false
    },
    simpson: {
      label: "Simpson's 1/3 Rule",
      type: 'integration',
      formula: '$$S = \\frac{h}{3}\\left[f(x_0)+4\\sum_{\\text{odd}}f(x_i)+2\\sum_{\\text{even}}f(x_i)+f(x_n)\\right]$$',
      showIntervals: true, intervalsEven: true, showGauss: false
    },
    richardson: {
      label: 'Richardson Extrapolation',
      type: 'integration',
      formula: '$$R = \\frac{4T(h/2) - T(h)}{3}, \\quad T(h) = \\frac{h}{2}\\left[f(x_0)+2\\sum f(x_i)+f(x_n)\\right]$$',
      showIntervals: true, intervalsEven: false, showGauss: false
    },
    gauss: {
      label: 'Gauss-Legendre Integration',
      type: 'integration',
      formula: '$$I \\approx \\frac{b-a}{2}\\sum_{i=1}^{n}w_i\\,f\\!\\left(\\frac{b-a}{2}t_i+\\frac{b+a}{2}\\right)$$',
      showIntervals: false, intervalsEven: false, showGauss: true
    },
    lagrange: {
      label: 'Lagrange Interpolation',
      type: 'interpolation',
      formula: '$$P(x) = \\sum_{k=0}^{n} y_k L_k(x), \\quad L_k(x) = \\prod_{j \\neq k}\\frac{x-x_j}{x_k-x_j}$$'
    },
    newton: {
      label: 'Newton Divided Difference',
      type: 'interpolation',
      formula: '$$P(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1)+\\cdots$$'
    }
  };

  // ---- Sidebar toggle ----
  function openSidebar()  { sidebar.classList.add('open'); overlay.classList.add('visible'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

  menuBtn.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // ---- Theme ----
  const savedTheme = localStorage.getItem('nm-theme') || 'light';
  applyTheme(savedTheme);

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeIcon.textContent  = t === 'dark' ? '☀️' : '🌙';
    themeLabel.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('nm-theme', t);
  }

  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // ---- Method selection ----
  function selectMethod(method) {
    if (!METHODS[method]) return;
    currentMethod = method;
    closeSidebar();

    // Nav highlight
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.method === method));

    const meta = METHODS[method];

    // Show calculator panel
    heroSection.style.display  = 'none';
    calcPanel.style.display    = 'block';
    methodTitle.textContent    = meta.label;

    // Formula
    formulaDisplay.innerHTML = meta.formula;
    if (window.MathJax) MathJax.typesetPromise([formulaDisplay]).catch(() => {});

    // Show correct inputs
    if (meta.type === 'integration') {
      integInputs.style.display = 'block';
      interpInputs.style.display = 'none';
      intervalsGroup.style.display = meta.showIntervals ? 'block' : 'none';
      gaussOrderGroup.style.display = meta.showGauss ? 'block' : 'none';
      if (meta.intervalsEven) {
        intervalsHint.textContent = 'Must be even (e.g. 2, 4, 6, ...)';
        document.getElementById('numIntervals').setAttribute('step', '2');
        document.getElementById('numIntervals').value = '10';
      } else {
        intervalsHint.textContent = 'e.g. 4, 8, 16';
        document.getElementById('numIntervals').removeAttribute('step');
        document.getElementById('numIntervals').value = '8';
      }
    } else {
      integInputs.style.display = 'none';
      interpInputs.style.display = 'block';
      generateDataTable(+document.getElementById('numPoints').value || 4);
    }

    // Reset results
    hideResults();
    hideError();
  }

  // Nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); selectMethod(el.dataset.method); });
  });

  // Method cards on hero
  document.querySelectorAll('.method-card').forEach(card => {
    card.addEventListener('click', () => selectMethod(card.dataset.method));
  });

  // ---- Generate interpolation table ----
  function generateDataTable(n) {
    n = Math.max(2, Math.min(15, +n || 4));
    const wrapper = document.getElementById('dataPointsTable');
    let html = '<table class="data-table"><thead><tr><th>#</th><th>x</th><th>y = f(x)</th></tr></thead><tbody>';
    for (let i = 0; i < n; i++) {
      html += `<tr>
        <td>${i+1}</td>
        <td><input type="number" step="any" class="pt-x" data-idx="${i}" placeholder="x${i+1}" /></td>
        <td><input type="number" step="any" class="pt-y" data-idx="${i}" placeholder="y${i+1}" /></td>
      </tr>`;
    }
    html += '</tbody></table>';
    wrapper.innerHTML = html;
  }

  generatePtsBtn.addEventListener('click', () => {
    const n = +document.getElementById('numPoints').value;
    if (!n || n < 2 || n > 15) { showError('Number of points must be between 2 and 15.'); return; }
    hideError();
    generateDataTable(n);
  });

  // ---- Collect inputs ----
  function getIntegrationInputs() {
    return {
      expr: document.getElementById('funcInput').value.trim(),
      a: document.getElementById('lowerBound').value,
      b: document.getElementById('upperBound').value,
      n: document.getElementById('numIntervals').value || 8,
      gaussN: document.getElementById('gaussOrder').value
    };
  }

  function getInterpolationInputs() {
    const xInputs = document.querySelectorAll('.pt-x');
    const yInputs = document.querySelectorAll('.pt-y');
    const xData = Array.from(xInputs).map(el => el.value);
    const yData = Array.from(yInputs).map(el => el.value);
    const xInterp = document.getElementById('interpX').value;

    if (xData.some(v => v === '') || yData.some(v => v === '')) {
      throw new Error('All x and y data point fields must be filled.');
    }
    return { xData: xData.map(Number), yData: yData.map(Number), xInterp };
  }

  // ---- Calculate ----
  calcBtn.addEventListener('click', calculate);
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && currentMethod && (e.ctrlKey || e.metaKey)) calculate();
  });

  function calculate() {
    hideError();
    hideResults();

    try {
      const meta = METHODS[currentMethod];
      let data, chartResult;

      if (meta.type === 'integration') {
        const inp = getIntegrationInputs();

        if (currentMethod === 'trapezoidal') {
          data = NM.trapezoidal({ expr: inp.expr, a: inp.a, b: inp.b, n: inp.n });
          Charts.drawTrapezoidal({ ...data, expr: inp.expr }, 'plotContainer');
        } else if (currentMethod === 'simpson') {
          data = NM.simpson({ expr: inp.expr, a: inp.a, b: inp.b, n: inp.n });
          Charts.drawSimpson({ ...data, expr: inp.expr }, 'plotContainer');
        } else if (currentMethod === 'richardson') {
          data = NM.richardson({ expr: inp.expr, a: inp.a, b: inp.b, n: inp.n });
          Charts.drawIntegrationGeneric({ ...data, expr: inp.expr }, 'plotContainer', 'Richardson Extrapolation');
        } else if (currentMethod === 'gauss') {
          data = NM.gaussLegendre({ expr: inp.expr, a: inp.a, b: inp.b, n: inp.gaussN });
          Charts.drawIntegrationGeneric({ ...data, expr: inp.expr }, 'plotContainer', 'Gauss-Legendre Integration');
        }

        showIntegrationResults(data, inp, meta.label);

      } else {
        const inp = getInterpolationInputs();

        if (currentMethod === 'lagrange') {
          data = NM.lagrange(inp);
          Charts.drawInterpolation(data, 'plotContainer', 'Lagrange Interpolation');
        } else {
          data = NM.newton(inp);
          Charts.drawInterpolation(data, 'plotContainer', 'Newton Interpolation');
        }

        showInterpolationResults(data, inp, meta.label);
      }

      graphCard.style.display = 'block';
      resultsCard.style.display = 'block';

      // Typeset any new MathJax
      setTimeout(() => { if (window.MathJax) MathJax.typesetPromise([resultsCard]).catch(()=>{}); }, 100);

      // Smooth scroll to results
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch(err) {
      showError(err.message || 'An error occurred. Check your inputs.');
    }
  }

  // ---- Render Results ----
  function showIntegrationResults(data, inp, methodLabel) {
    const summary = document.getElementById('resultSummary');
    const rows = [
      ['Method', methodLabel],
      ['Function f(x)', `<code>${inp.expr}</code>`],
      ['Lower bound a', inp.a],
      ['Upper bound b', inp.b],
    ];
    if (data.n !== undefined && currentMethod !== 'gauss') rows.push(['Intervals n', data.n]);
    if (data.t1 !== undefined) {
      rows.push(['T(h) — coarse', data.t1.toPrecision(10)]);
      rows.push(['T(h/2) — fine', data.t2.toPrecision(10)]);
      rows.push(['Error estimate', data.error.toExponential(4)]);
    }
    rows.push(['Result ∫f(x)dx', `<span class="result-value highlight">${data.result.toPrecision(10)}</span>`]);

    summary.innerHTML = rows.map(([lbl, val]) =>
      `<div class="result-row"><span class="result-label">${lbl}</span><span class="result-value">${val}</span></div>`
    ).join('');

    renderSteps(data.steps);
  }

  function showInterpolationResults(data, inp, methodLabel) {
    const summary = document.getElementById('resultSummary');
    const rows = [
      ['Method', methodLabel],
      ['Data points', data.xData.length],
      ['x values', data.xData.join(', ')],
      ['y values', data.yData.join(', ')],
      ['Interpolation point', inp.xInterp],
      ['P(x)', `<span class="result-value highlight">${data.result.toPrecision(10)}</span>`]
    ];

    summary.innerHTML = rows.map(([lbl, val]) =>
      `<div class="result-row"><span class="result-label">${lbl}</span><span class="result-value">${val}</span></div>`
    ).join('');

    renderSteps(data.steps);
  }

  function renderSteps(steps) {
    const container = document.getElementById('stepsContent');
    container.innerHTML = '';
    steps.forEach(step => {
      const block = document.createElement('div');
      block.className = 'step-block';
      let inner = `<h5>${step.title}</h5>`;
      if (step.content) inner += `<p>${step.content}</p>`;
      if (step.table) {
        inner += '<div style="overflow-x:auto;"><table class="step-table"><thead><tr>';
        step.table.headers.forEach(h => { inner += `<th>${h}</th>`; });
        inner += '</tr></thead><tbody>';
        step.table.rows.forEach(row => {
          inner += '<tr>';
          row.forEach(cell => { inner += `<td>${cell}</td>`; });
          inner += '</tr>';
        });
        inner += '</tbody></table></div>';
      }
      block.innerHTML = inner;
      container.appendChild(block);
    });
  }

  // ---- Utilities ----
  function showError(msg)  { errorMsg.textContent = msg; errorMsg.style.display = 'block'; }
  function hideError()     { errorMsg.style.display = 'none'; }
  function hideResults()   { resultsCard.style.display = 'none'; graphCard.style.display = 'none'; }

  clearBtn.addEventListener('click', () => {
    document.getElementById('funcInput').value      = '';
    document.getElementById('lowerBound').value     = '';
    document.getElementById('upperBound').value     = '';
    document.getElementById('numIntervals').value   = '8';
    document.getElementById('interpX').value        = '';
    document.querySelectorAll('.pt-x, .pt-y').forEach(el => el.value = '');
    hideError();
    hideResults();
  });

  // ---- Export / Print ----
  exportPngBtn.addEventListener('click', () => Charts.exportPng('plotContainer'));

  function doPrint() {
    window.print();
  }
  printBtn.addEventListener('click', doPrint);
  printResultBtn.addEventListener('click', doPrint);

  exportPdfBtn.addEventListener('click', () => {
    alert('To save as PDF: use Print (Ctrl+P) and select "Save as PDF" as the printer.');
    doPrint();
  });

  // ---- Keyboard shortcut hint ----
  calcBtn.title = 'Calculate (Ctrl+Enter)';

  // ---- Natural Language Converter ────────────────────────────────────
  const funcInput = document.getElementById('funcInput');

  function doConvert() {
    const raw = nlInput.value.trim();
    if (!raw) return;

    const { expr, a, b } = NM.parseNL(raw);

    let valid = false;
    try { NM.evalFn(expr, 1); valid = true; } catch(e) { valid = false; }

    // Fill fields
    funcInput.value = expr;
    if (a !== '') document.getElementById('lowerBound').value = a;
    if (b !== '') document.getElementById('upperBound').value = b;

    // Show preview bar
    showNLPreview(expr, a, b, valid);

    // Flash the funcInput field to signal it was filled
    funcInput.classList.add('field-flash');
    setTimeout(() => funcInput.classList.remove('field-flash'), 600);
  }

  function showNLPreview(expr, a, b, valid) {
    nlPreviewBar.style.display = 'flex';
    nlPreviewBar.className = 'nl-preview-bar ' + (valid ? 'ok' : 'err');
    nlPreviewIcon.textContent = valid ? '✓' : '⚠';
    let msg = 'f(x) = ' + expr;
    if (a) msg += '   a = ' + a;
    if (b) msg += '   b = ' + b;
    if (!valid) msg += '   — expression may need adjustment';
    nlPreviewText.textContent = msg;
  }

  // Live preview while typing (debounced 400ms)
  let _debounce;
  nlInput.addEventListener('input', () => {
    clearTimeout(_debounce);
    _debounce = setTimeout(() => {
      const raw = nlInput.value.trim();
      if (!raw) { nlPreviewBar.style.display = 'none'; return; }
      const { expr, a, b } = NM.parseNL(raw);
      let valid = false;
      try { NM.evalFn(expr, 1); valid = true; } catch(e) {}
      showNLPreview(expr, a, b, valid);
    }, 400);
  });

  // Enter key converts
  nlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doConvert(); }
  });

  nlConvertBtn.addEventListener('click', doConvert);

  // Example chips
  document.querySelectorAll('.nl-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      nlInput.value = chip.dataset.nl;
      nlInput.dispatchEvent(new Event('input')); // trigger live preview
    });
  });

})();

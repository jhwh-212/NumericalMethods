/* =============================================
   Chart / Visualization Layer (Plotly.js)
   ============================================= */

const Charts = {};

Charts._isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

Charts._layout = (title) => ({
  title: { text: title, font: { size: 14, color: Charts._isDark() ? '#e2e8f0' : '#1a202c' } },
  paper_bgcolor: Charts._isDark() ? '#1a1f2e' : '#ffffff',
  plot_bgcolor: Charts._isDark() ? '#141824' : '#f8faff',
  font: { family: 'Segoe UI, system-ui, sans-serif', color: Charts._isDark() ? '#94a3b8' : '#64748b' },
  xaxis: {
    title: 'x', gridcolor: Charts._isDark() ? '#2a3348' : '#e2e8f0',
    zerolinecolor: Charts._isDark() ? '#4a5568' : '#cbd5e0'
  },
  yaxis: {
    title: 'f(x)', gridcolor: Charts._isDark() ? '#2a3348' : '#e2e8f0',
    zerolinecolor: Charts._isDark() ? '#4a5568' : '#cbd5e0'
  },
  margin: { t: 50, l: 55, r: 20, b: 50 },
  legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', bordercolor: 'rgba(0,0,0,0)' },
  hovermode: 'x unified'
});

Charts._config = { responsive: true, displayModeBar: true, displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'] };

/* ---- Smooth curve over [a,b] ---- */
Charts._curve = (expr, a, b, color, name) => {
  const pts = 400;
  const xs = Array.from({ length: pts }, (_, i) => a + (b - a) * i / (pts - 1));
  let ys;
  try { ys = xs.map(x => NM.evalFn(expr, x)); }
  catch(e) { ys = xs.map(() => null); }
  return { x: xs, y: ys, mode: 'lines', name, line: { color, width: 2.5 }, type: 'scatter' };
};

/* =============================================
   Integration: Trapezoidal shading
   ============================================= */
Charts.drawTrapezoidal = function(data, containerId) {
  const { expr, xs, ys, a, b } = data;
  const traces = [Charts._curve(expr, a, b, '#1a56db', 'f(x)')];

  // Shaded trapezoids
  const shapeXs = [], shapeYs = [];
  for (let i = 0; i < xs.length - 1; i++) {
    shapeXs.push(xs[i], xs[i], xs[i+1], xs[i+1], xs[i], null);
    shapeYs.push(0, ys[i], ys[i+1], 0, 0, null);
  }
  traces.push({
    x: shapeXs, y: shapeYs, fill: 'toself',
    fillcolor: 'rgba(26,86,219,0.15)', line: { color: 'rgba(26,86,219,0.5)', width: 1 },
    name: 'Trapezoids', type: 'scatter', mode: 'lines', hoverinfo: 'skip'
  });

  // Node points
  traces.push({
    x: xs, y: ys, mode: 'markers', name: 'Nodes',
    marker: { color: '#ef4444', size: 6 }, type: 'scatter'
  });

  Plotly.newPlot(containerId, traces, Charts._layout('Trapezoidal Rule'), Charts._config);
};

/* =============================================
   Integration: Simpson's shading
   ============================================= */
Charts.drawSimpson = function(data, containerId) {
  const { expr, xs, ys, a, b, n } = data;
  const traces = [Charts._curve(expr, a, b, '#1a56db', 'f(x)')];

  // Shade each pair of panels with a smooth parabola
  for (let i = 0; i < n; i += 2) {
    const x0 = xs[i], x1 = xs[i+1], x2 = xs[i+2];
    const seg = Array.from({ length: 40 }, (_, k) => x0 + (x2 - x0) * k / 39);
    const segY = seg.map(xv => NM.evalFn(expr, xv));
    const fillX = [...seg, x2, x0, x0];
    const fillY = [...segY, 0, 0, segY[0]];
    traces.push({
      x: fillX, y: fillY, fill: 'toself',
      fillcolor: `rgba(14,165,233,${0.1 + 0.05 * (i % 4)})`,
      line: { color: 'rgba(14,165,233,0.4)', width: 1 },
      type: 'scatter', mode: 'lines', hoverinfo: 'skip',
      showlegend: i === 0, name: "Simpson panels"
    });
  }

  traces.push({
    x: xs, y: ys, mode: 'markers', name: 'Nodes',
    marker: { color: '#ef4444', size: 6 }, type: 'scatter'
  });

  Plotly.newPlot(containerId, traces, Charts._layout("Simpson's 1/3 Rule"), Charts._config);
};

/* =============================================
   Integration: Richardson / generic
   ============================================= */
Charts.drawIntegrationGeneric = function(data, containerId, title) {
  const { expr, a, b, xs, ys } = data;
  const traces = [Charts._curve(expr, a, b, '#1a56db', 'f(x)')];

  // Shaded area
  const areaXs = [a, ...xs, b];
  const areaYs = [0, ...ys, 0];
  traces.push({
    x: areaXs, y: areaYs, fill: 'toself',
    fillcolor: 'rgba(26,86,219,0.12)', line: { color: 'rgba(26,86,219,0.35)', width: 1 },
    name: 'Area', type: 'scatter', mode: 'lines', hoverinfo: 'skip'
  });

  if (xs && xs.length <= 20) {
    traces.push({
      x: xs, y: ys, mode: 'markers+lines', name: 'Nodes',
      marker: { color: '#ef4444', size: 7 },
      line: { color: 'rgba(239,68,68,0.3)', width: 1, dash: 'dot' },
      type: 'scatter'
    });
  }

  Plotly.newPlot(containerId, traces, Charts._layout(title), Charts._config);
};

/* =============================================
   Interpolation: Lagrange / Newton
   ============================================= */
Charts.drawInterpolation = function(data, containerId, title) {
  const { xData, yData, xInterp, result } = data;

  const xMin = Math.min(...xData) - (Math.max(...xData) - Math.min(...xData)) * 0.15;
  const xMax = Math.max(...xData) + (Math.max(...xData) - Math.min(...xData)) * 0.15;
  const pts = 400;
  const xs = Array.from({ length: pts }, (_, i) => xMin + (xMax - xMin) * i / (pts - 1));

  // Evaluate polynomial curve
  let ys;
  if (data.Lvals !== undefined) {
    // Lagrange
    ys = xs.map(xv => {
      const n = xData.length;
      return xData.reduce((sum, _, k) => {
        let Lk = 1;
        for (let j = 0; j < n; j++) {
          if (j !== k) Lk *= (xv - xData[j]) / (xData[k] - xData[j]);
        }
        return sum + yData[k] * Lk;
      }, 0);
    });
  } else {
    // Newton (Horner)
    const { coeffs } = data;
    const n = xData.length;
    ys = xs.map(xv => {
      let val = coeffs[n-1];
      for (let i = n-2; i >= 0; i--) val = val * (xv - xData[i]) + coeffs[i];
      return val;
    });
  }

  const traces = [
    {
      x: xs, y: ys, mode: 'lines', name: 'Interpolating Polynomial',
      line: { color: '#1a56db', width: 2.5 }, type: 'scatter'
    },
    {
      x: xData, y: yData, mode: 'markers', name: 'Data Points',
      marker: { color: '#ef4444', size: 9, symbol: 'circle',
        line: { color: '#fff', width: 1.5 } }, type: 'scatter'
    },
    {
      x: [xInterp], y: [result], mode: 'markers', name: `P(${xInterp}) = ${result.toPrecision(6)}`,
      marker: { color: '#10b981', size: 12, symbol: 'diamond',
        line: { color: '#fff', width: 2 } }, type: 'scatter'
    }
  ];

  Plotly.newPlot(containerId, traces, Charts._layout(title), Charts._config);
};

/* =============================================
   Export graph as PNG
   ============================================= */
Charts.exportPng = function(containerId) {
  Plotly.downloadImage(containerId, { format: 'png', width: 900, height: 500, filename: 'numerical-method-graph' });
};

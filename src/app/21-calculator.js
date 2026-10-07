/* ================= Calculator and grapher =================
   A safe expression parser (no eval): numbers, x, pi, e, ans, + - * / ^, parentheses,
   implicit multiplication (2x, 3(x+1), 2pi), functions sin cos tan asin acos atan sqrt cbrt log ln abs. */
const CALC_FN = ['asin', 'acos', 'atan', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs'];
function calcParse(src) {
  const s = String(src).replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/\*\*/g, '^');
  let i = 0;
  const peek = () => s[i];
  function num() { const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i)); if (!m) return null; i += m[0].length; return { t: 'n', v: parseFloat(m[0]) }; }
  function atom() {
    const c = peek();
    if (c === '(') { i++; const e = expr(); if (peek() === ')') i++; return e; }
    if (c === '|') { i++; const e = expr(); if (peek() === '|') i++; return { t: 'f', f: 'abs', a: e }; }
    if (/[\d.]/.test(c)) return num();
    for (const f of CALC_FN) if (s.startsWith(f, i)) { i += f.length; const a = (peek() === '(') ? atom() : power(); return { t: 'f', f, a }; }
    if (s.startsWith('pi', i)) { i += 2; return { t: 'n', v: Math.PI }; }
    if (s.startsWith('ans', i)) { i += 3; return { t: 'ans' }; }
    if (c === 'e' && !/[a-z]/i.test(s[i + 1] || '')) { i++; return { t: 'n', v: Math.E }; }
    if (c === 'x') { i++; return { t: 'x' }; }
    throw new Error('Unexpected “' + (c || 'end') + '”');
  }
  function postfix() { let a = atom(); while (peek() === '!') { i++; a = { t: 'f', f: 'fact', a }; } return a; }
  function power() { const b = postfix(); if (peek() === '^') { i++; const e = unary(); return { t: '^', a: b, b: e }; } return b; }
  function unary() { if (peek() === '-') { i++; return { t: 'neg', a: unary() }; } if (peek() === '+') { i++; return unary(); } return power(); }
  function term() {
    let a = unary();
    for (;;) {
      const c = peek();
      if (c === '*' || c === '/') { i++; const b = unary(); a = { t: c, a, b }; }
      else if (c && (/[\d.(x|a-z]/i.test(c)) && !/[+\-*/^)]/.test(c)) { if (c === '|' ) break; const b = power(); a = { t: '*', a, b }; }
      else break;
    }
    return a;
  }
  function expr() { let a = term(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const b = term(); a = { t: op, a, b }; } return a; }
  const tree = expr(); if (i < s.length) throw new Error('Unexpected “' + s[i] + '”'); return tree;
}
function calcEval(n, x, deg, ans) {
  const E = m => calcEval(m, x, deg, ans); const k = deg ? Math.PI / 180 : 1;
  switch (n.t) {
    case 'n': return n.v; case 'x': return x; case 'ans': return ans || 0; case 'neg': return -E(n.a);
    case '+': return E(n.a) + E(n.b); case '-': return E(n.a) - E(n.b); case '*': return E(n.a) * E(n.b); case '/': return E(n.a) / E(n.b);
    case '^': { const b = E(n.a), e = E(n.b); if (b < 0 && !Number.isInteger(e)) { const inv = 1 / e; if (Number.isInteger(Math.round(inv)) && Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2) return -Math.pow(-b, e); } return Math.pow(b, e); }
    case 'f': { const a = E(n.a); switch (n.f) { case 'sin': return Math.sin(a * k); case 'cos': return Math.cos(a * k); case 'tan': return Math.tan(a * k); case 'asin': return Math.asin(a) / k; case 'acos': return Math.acos(a) / k; case 'atan': return Math.atan(a) / k; case 'sqrt': return Math.sqrt(a); case 'cbrt': return Math.cbrt(a); case 'log': return Math.log10(a); case 'ln': return Math.log(a); case 'abs': return Math.abs(a); case 'fact': { let r = 1; for (let j = 2; j <= a; j++) r *= j; return r; } } }
  }
  return NaN;
}
function calcFmt(v) { if (!isFinite(v)) return isNaN(v) ? 'Undefined' : (v > 0 ? '∞' : '−∞'); if (Math.abs(v) < 1e-12) return '0'; const r = +v.toPrecision(12); let s = Math.abs(r) >= 1e12 || Math.abs(r) < 1e-6 ? r.toExponential(6) : String(r); return s.replace('-', '−'); }
/* best simple fraction for a decimal answer (helps with typed SAT answers) */
function toFrac(v) { if (!isFinite(v) || Number.isInteger(v)) return null; for (let d = 2; d <= 400; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return `${n}/${d}`; } return null; }
const CALC = { hist: [], ans: 0, tab: 'calc', fx: ['', '', ''], win: 10 };
function closeCalc() { const c = $('.calc'); if (c) c.remove(); }
function openCalc(tab) {
  closeCalc(); if (tab) CALC.tab = tab;
  const o = div('calc'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Calculator');
  const keys = [['sin', 'cos', 'tan', 'π', 'C'], ['√', '^', '(', ')', '÷'], ['7', '8', '9', 'x²', '×'], ['4', '5', '6', 'ans', '−'], ['1', '2', '3', '⌫', '+'], ['0', '.', '(−)', 'frac', '=']];
  o.innerHTML = `<div class="chead"><div class="seg ctabs" role="tablist"><button type="button" data-ct="calc" class="${CALC.tab === 'calc' ? 'on' : ''}">${icon('calc')} Calculator</button><button type="button" data-ct="graph" class="${CALC.tab === 'graph' ? 'on' : ''}">${icon('graph')} Graph</button></div><button type="button" class="iconbtn cx" aria-label="Close calculator">${icon('x')}</button></div>
  <div class="cbody" data-p="calc" ${CALC.tab === 'calc' ? '' : 'hidden'}><div class="chist">${CALC.hist.slice(-6).map(h => `<button type="button" class="ch" data-use="${esc(h.e)}"><span>${esc(h.e)}</span><b>= ${esc(h.r)}</b></button>`).join('')}</div><div class="cdisp"><input class="cin" type="text" ${TOUCH ? 'readonly inputmode="none"' : ''} spellcheck="false" autocomplete="off" aria-label="Expression" placeholder="Type or tap an expression"><div class="cres" aria-live="polite"></div></div><div class="cmode"><button type="button" class="btn small ghost" id="cdeg">${S.settings.calcDeg ? 'DEG' : 'RAD'}</button><span class="muted small">Tap a past result to reuse it.</span></div><div class="ckeys">${keys.flat().map(k => `<button type="button" class="ck${/^[0-9.]$/.test(k) ? ' num' : ''}${k === '=' ? ' eq' : ''}" data-k="${k}">${k === 'frac' ? 'a/b' : k}</button>`).join('')}</div></div>
  <div class="cbody" data-p="graph" ${CALC.tab === 'graph' ? '' : 'hidden'}><div class="gfx">${[0, 1, 2].map(j => `<label class="gf c${j + 1}"><span>y =</span><input type="text" data-g="${j}" value="${esc(CALC.fx[j])}" spellcheck="false" autocomplete="off" placeholder="${['2x - 3', 'x^2 - 4', ''][j]}"></label>`).join('')}</div><div class="gwrap"><svg class="gsvg" viewBox="0 0 320 320" aria-label="Graph"></svg><div class="gzoom"><button type="button" class="btn small" data-z="0.5">+</button><button type="button" class="btn small" data-z="2">−</button></div></div><div class="gpts"></div><a class="btn small ghost desmos" href="https://www.desmos.com/calculator" target="_blank" rel="noopener">${icon('link')} Open Desmos (the calculator used on the real SAT)</a></div>`;
  document.body.appendChild(o);
  const inp = $('.cin', o), res = $('.cres', o);
  const preview = () => { const v = inp.value.trim(); if (!v) { res.textContent = ''; return; } try { const r = calcEval(calcParse(v), 0, S.settings.calcDeg, CALC.ans); const f = toFrac(r); res.textContent = '= ' + calcFmt(r) + (f && f.length <= 7 ? `  (${f})` : ''); res.classList.remove('err'); } catch (e) { res.textContent = ''; } };
  const equals = () => { const v = inp.value.trim(); if (!v) return; try { const r = calcEval(calcParse(v), 0, S.settings.calcDeg, CALC.ans); CALC.ans = r; CALC.hist.push({ e: v, r: calcFmt(r) }); CALC.hist = CALC.hist.slice(-20); openCalc(); const n = $('.calc .cin'); n.value = ''; const f = toFrac(r); $('.calc .cres').textContent = 'ans = ' + calcFmt(r) + (f && f.length <= 7 ? `  (${f})` : ''); } catch (e) { res.textContent = e.message || 'Check the expression'; res.classList.add('err'); } };
  inp.oninput = preview; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); equals(); } if (e.key === 'Escape') closeCalc(); };
  $$('.ck', o).forEach(b => b.onclick = () => { const k = b.dataset.k; const ins = t => { inp.value += t; preview(); };
    if (k === '=') return equals(); if (k === 'C') { inp.value = ''; preview(); return; } if (k === '⌫') { inp.value = inp.value.slice(0, -1); preview(); return; }
    if (['sin', 'cos', 'tan'].includes(k)) return ins(k + '('); if (k === '√') return ins('√('); if (k === 'x²') return ins('^2'); if (k === '(−)') return ins('-'); if (k === 'frac') return ins('/'); ins(k); });
  $$('.ch', o).forEach(b => b.onclick = () => { inp.value += b.dataset.use.includes(' ') ? `(${b.dataset.use})` : 'ans'; preview(); });
  $('#cdeg', o).onclick = () => { S.settings.calcDeg = !S.settings.calcDeg; save(); $('#cdeg', o).textContent = S.settings.calcDeg ? 'DEG' : 'RAD'; preview(); };
  $('.cx', o).onclick = closeCalc;
  $$('[data-ct]', o).forEach(b => b.onclick = () => { CALC.tab = b.dataset.ct; openCalc(); });
  $$('[data-g]', o).forEach(g => g.oninput = () => { CALC.fx[+g.dataset.g] = g.value; drawGraph(o); });
  $$('[data-z]', o).forEach(b => b.onclick = () => { CALC.win = clamp(CALC.win * +b.dataset.z, 1, 200); drawGraph(o); });
  if (CALC.tab === 'graph') drawGraph(o); else if (!TOUCH) inp.focus();
}
function drawGraph(o) {
  const svg = $('.gsvg', o), pts = $('.gpts', o); const W = CALC.win, n = 320, X = x => (x + W) / (2 * W) * n, Y = y => n - (y + W) / (2 * W) * n;
  let g = ''; const st = niceStep(2 * W, 10);
  for (let v = Math.ceil(-W / st) * st; v <= W; v += st) { g += `<line x1="${X(v)}" x2="${X(v)}" y1="0" y2="${n}" class="grid"/><line y1="${Y(v)}" y2="${Y(v)}" x1="0" x2="${n}" class="grid"/>`; if (Math.abs(v) > 1e-9 && Math.round(v / st) % 2 === 0) g += `<text x="${X(v)}" y="${Y(0) + 13}" text-anchor="middle" class="ax">${fnum(v)}</text><text x="${X(0) - 4}" y="${Y(v) + 4}" text-anchor="end" class="ax">${fnum(v)}</text>`; }
  g += `<line x1="0" x2="${n}" y1="${Y(0)}" y2="${Y(0)}" class="axis"/><line x1="${X(0)}" x2="${X(0)}" y1="0" y2="${n}" class="axis"/>`;
  const fns = []; let errs = '';
  CALC.fx.forEach((src, j) => { if (!src.trim()) return; try { const t = calcParse(src.replace(/^y\s*=/, '')); const f = x => calcEval(t, x, false, CALC.ans); f(1); fns.push({ f, j }); } catch (e) { errs += `<p class="err small">Line ${j + 1}: ${esc(e.message)}</p>`; } });
  const found = [];
  fns.forEach(({ f, j }) => {
    let d = '', pen = false, prev = null; const N = 600;
    for (let k = 0; k <= N; k++) { const x = -W + 2 * W * k / N, y = f(x); if (!isFinite(y) || Math.abs(y) > W * 50) { pen = false; prev = null; continue; } if (prev != null && Math.abs(y - prev) > W * 4) pen = false; d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`; pen = true; prev = y; }
    g += `<path d="${d}" class="fline c${j + 1}"/>`;
    roots(f, -W, W).forEach(x => found.push({ x, y: 0, t: `x-intercept of line ${j + 1}`, c: j }));
    const y0 = f(0); if (isFinite(y0) && Math.abs(y0) <= W) found.push({ x: 0, y: y0, t: `y-intercept of line ${j + 1}`, c: j });
    extrema(f, -W, W).forEach(p => found.push({ ...p, t: `${p.t} of line ${j + 1}`, c: j }));
  });
  for (let a = 0; a < fns.length; a++) for (let b = a + 1; b < fns.length; b++) { const h = x => fns[a].f(x) - fns[b].f(x); roots(h, -W, W).forEach(x => found.push({ x, y: fns[a].f(x), t: `Lines ${fns[a].j + 1} and ${fns[b].j + 1} meet`, c: 3 })); }
  found.slice(0, 40).forEach(p => { if (Math.abs(p.y) <= W) g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" class="gpt"><title>${esc(p.t)}</title></circle>`; });
  svg.innerHTML = g;
  const r4 = v => calcFmt(+v.toFixed(4));
  pts.innerHTML = errs + (found.length ? `<ul>${found.slice(0, 12).map(p => `<li><i class="dot c${p.c + 1}"></i>${esc(p.t)}: <b>(${r4(p.x)}, ${r4(p.y)})</b></li>`).join('')}</ul>` : fns.length ? '<p class="muted small">No intercepts or turning points in view. Zoom out to see more.</p>' : '<p class="muted small">Type an expression in terms of x, like <b>x^2 - 4</b> or <b>3x + 1</b>.</p>');
}
function roots(f, a, b) { const out = []; const N = 800; let px = a, py = f(a); for (let k = 1; k <= N; k++) { const x = a + (b - a) * k / N, y = f(x); if (isFinite(py) && isFinite(y)) { if (py === 0) out.push(px); else if (py * y < 0) { let lo = px, hi = x, flo = py; for (let it = 0; it < 60; it++) { const mid = (lo + hi) / 2, fm = f(mid); if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; } } const r = (lo + hi) / 2; if (Math.abs(f(r)) < 1e-6 * Math.max(1, Math.abs(py) + Math.abs(y))) out.push(r); } } px = x; py = y; } return out.filter((r, i) => i === 0 || Math.abs(r - out[i - 1]) > 1e-6); }
function extrema(f, a, b) { const out = []; const N = 600, h = (b - a) / N; for (let k = 1; k < N; k++) { const x0 = a + (k - 1) * h, x1 = a + k * h, x2 = a + (k + 1) * h; const y0 = f(x0), y1 = f(x1), y2 = f(x2); if (![y0, y1, y2].every(isFinite)) continue; if ((y1 > y0 && y1 > y2) || (y1 < y0 && y1 < y2)) { let lo = x0, hi = x2; const mx = y1 > y0; for (let it = 0; it < 60; it++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if ((f(m1) < f(m2)) === mx) lo = m1; else hi = m2; } const x = (lo + hi) / 2; out.push({ x, y: f(x), t: mx ? 'Maximum' : 'Minimum' }); } } return out.slice(0, 4); }

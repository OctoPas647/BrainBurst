/* ================= Charts, graphs and geometry figures ================= */
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; }
function niceStep(range, target = 6) { const raw = range / target; const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }
const fnum = v => (Math.abs(v) < 1e-9 ? '0' : String(+v.toFixed(3)));
/* ---------- Data charts (ch) ---------- */
function chartHTML(ch) {
  const cols = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
  const legend = names => `<div class="legend">${names.map((n, i) => `<span><i style="background:${cols[i % 4]}"></i>${esc(n)}</span>`).join('')}</div>`;
  let body = '';
  if (ch.t === 'line' || ch.t === 'bar') {
    const W = 360, H = 220, L = 44, B = ch.xt ? 42 : 30, T = 10, R = ch.t === 'line' ? 24 : 10, max = ch.ymax || niceMax(Math.max(...ch.s.flatMap(s => s.v)) * 1.05), pw = W - L - R, ph = H - T - B;
    const y = v => T + ph - (v / max) * ph; let g = '';
    for (let k = 0; k <= 4; k++) { const v = max * k / 4, yy = y(v); g += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="grid"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" class="ax">${(+v.toFixed(1)).toLocaleString('en-US')}</text>`; }
    const n = ch.x.length;
    if (ch.t === 'line') { const x = i => L + (n === 1 ? pw / 2 : i * pw / (n - 1)); ch.x.forEach((lab, i) => g += `<text x="${x(i)}" y="${T + ph + 18}" text-anchor="middle" class="ax">${esc(lab)}</text>`); ch.s.forEach((s, si) => { g += `<polyline fill="none" stroke="${cols[si % 4]}" stroke-width="3" stroke-linejoin="round" points="${s.v.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/>` + s.v.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${cols[si % 4]}"><title>${esc(s.n)} ${esc(ch.x[i])}: ${v}</title></circle>`).join(''); }); }
    else { const gw = pw / n, bw = gw * 0.78 / ch.s.length; ch.x.forEach((lab, i) => { g += `<text x="${L + gw * i + gw / 2}" y="${T + ph + 18}" text-anchor="middle" class="ax">${esc(lab)}</text>`; ch.s.forEach((s, si) => { const v = s.v[i], xx = L + gw * i + gw * 0.11 + bw * si; g += `<rect x="${xx}" y="${y(v)}" width="${bw - 2}" height="${T + ph - y(v)}" rx="3" fill="${cols[si % 4]}"><title>${esc(s.n)} ${esc(lab)}: ${v}</title></rect>`; }); }); }
    if (ch.xt) g += `<text x="${L + pw / 2}" y="${H - 4}" text-anchor="middle" class="axt">${esc(ch.xt)}</text>`;
    if (ch.yt) g += `<text x="12" y="${T + ph / 2}" text-anchor="middle" class="axt" transform="rotate(-90 12 ${T + ph / 2})">${esc(ch.yt)}</text>`;
    body = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ch.title)}">${g}<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" class="axis"/><line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" class="axis"/></svg>` + (ch.s.length > 1 ? legend(ch.s.map(s => s.n)) : '');
  } else if (ch.t === 'hist') {
    // bins: [[from, to, count], ...]
    const W = 360, H = 220, L = 40, B = 42, T = 10, R = 10, max = niceMax(Math.max(...ch.bins.map(b => b[2])) * 1.05), pw = W - L - R, ph = H - T - B;
    const lo = ch.bins[0][0], hi = ch.bins[ch.bins.length - 1][1], x = v => L + (v - lo) / (hi - lo) * pw, y = v => T + ph - v / max * ph; let g = '';
    const st = niceStep(max, 4); for (let v = 0; v <= max + 1e-9; v += st) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${fnum(v)}</text>`;
    ch.bins.forEach(([a, b, c]) => g += `<rect x="${x(a)}" y="${y(c)}" width="${x(b) - x(a)}" height="${T + ph - y(c)}" fill="var(--c1)" stroke="var(--surface)" stroke-width="1.5"><title>${a}–${b}: ${c}</title></rect>`);
    [...new Set(ch.bins.flatMap(b => [b[0], b[1]]))].forEach(v => g += `<text x="${x(v)}" y="${T + ph + 16}" text-anchor="middle" class="ax">${fnum(v)}</text>`);
    if (ch.xt) g += `<text x="${L + pw / 2}" y="${H - 4}" text-anchor="middle" class="axt">${esc(ch.xt)}</text>`;
    if (ch.yt) g += `<text x="11" y="${T + ph / 2}" text-anchor="middle" class="axt" transform="rotate(-90 11 ${T + ph / 2})">${esc(ch.yt)}</text>`;
    body = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ch.title)}">${g}<line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" class="axis"/><line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" class="axis"/></svg>`;
  } else if (ch.t === 'dot') {
    // vals: [[value, count], ...]
    const W = 360, L = 20, R = 20, maxc = Math.max(...ch.vals.map(v => v[1])), H = 46 + maxc * 16, base = H - 34;
    const lo = ch.min ?? Math.min(...ch.vals.map(v => v[0])), hi = ch.max ?? Math.max(...ch.vals.map(v => v[0])), x = v => L + (v - lo) / ((hi - lo) || 1) * (W - L - R); let g = `<line x1="${L - 8}" x2="${W - R + 8}" y1="${base}" y2="${base}" class="axis"/>`;
    const step = ch.step || 1; for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${x(v)}" x2="${x(v)}" y1="${base}" y2="${base + 5}" class="axis"/><text x="${x(v)}" y="${base + 18}" text-anchor="middle" class="ax">${fnum(v)}</text>`;
    ch.vals.forEach(([v, c]) => { for (let k = 0; k < c; k++) g += `<circle cx="${x(v)}" cy="${base - 9 - k * 16}" r="6" fill="var(--c1)"/>`; });
    if (ch.xt) g += `<text x="${W / 2}" y="${H - 2}" text-anchor="middle" class="axt">${esc(ch.xt)}</text>`;
    body = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ch.title)}">${g}</svg>`;
  } else if (ch.t === 'box') {
    // boxes: [{n, v:[min,q1,med,q3,max]}]
    const W = 360, L = 70, R = 16, rows = ch.boxes.length, H = 30 + rows * 46 + 20;
    const lo = ch.min, hi = ch.max, x = v => L + (v - lo) / (hi - lo) * (W - L - R); let g = '';
    const st = ch.step || niceStep(hi - lo, 6); for (let v = lo; v <= hi + 1e-9; v += st) g += `<line x1="${x(v)}" x2="${x(v)}" y1="10" y2="${H - 26}" class="grid"/><text x="${x(v)}" y="${H - 10}" text-anchor="middle" class="ax">${fnum(v)}</text>`;
    ch.boxes.forEach((b, k) => { const cy = 30 + k * 46, [a, q1, md, q3, z] = b.v; g += `<text x="${L - 8}" y="${cy + 4}" text-anchor="end" class="ax">${esc(b.n)}</text><line x1="${x(a)}" x2="${x(z)}" y1="${cy}" y2="${cy}" class="axis"/><line x1="${x(a)}" x2="${x(a)}" y1="${cy - 8}" y2="${cy + 8}" class="axis"/><line x1="${x(z)}" x2="${x(z)}" y1="${cy - 8}" y2="${cy + 8}" class="axis"/><rect x="${x(q1)}" y="${cy - 14}" width="${x(q3) - x(q1)}" height="28" fill="color-mix(in srgb, var(--c${k % 4 + 1}) 25%, var(--surface))" stroke="var(--c${k % 4 + 1})" stroke-width="2" rx="3"/><line x1="${x(md)}" x2="${x(md)}" y1="${cy - 14}" y2="${cy + 14}" stroke="var(--c${k % 4 + 1})" stroke-width="3"/>`; });
    body = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ch.title)}">${g}</svg>`;
  } else if (ch.t === 'pie') {
    const tot = ch.s.reduce((a, s) => a + s.v, 0); let a0 = -Math.PI / 2, paths = ''; const pc = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--xp)', 'var(--muted)'];
    ch.s.forEach((s, i) => { const a1 = a0 + s.v / tot * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0; paths += `<path d="M100 100 L${100 + 90 * Math.cos(a0)} ${100 + 90 * Math.sin(a0)} A90 90 0 ${lg} 1 ${100 + 90 * Math.cos(a1)} ${100 + 90 * Math.sin(a1)}Z" fill="${pc[i % 6]}" stroke="var(--surface)" stroke-width="2"><title>${esc(s.n)}: ${s.v}%</title></path>`; a0 = a1; });
    body = `<div class="pie"><svg viewBox="0 0 200 200" role="img" aria-label="${esc(ch.title)}">${paths}</svg><div class="legend col">${ch.s.map((s, i) => `<span><i style="background:${pc[i % 6]}"></i>${esc(s.n)} <b>${s.v}%</b></span>`).join('')}</div></div>`;
  } else if (ch.t === 'table') {
    const cell = (c, tag) => `<${tag}>${inlineHTML(String(c))}</${tag}>`;
    body = `<div class="tscroll"><table class="dtable"><thead><tr>${ch.head.map(h => cell(h, 'th')).join('')}</tr></thead><tbody>${ch.rows.map(r => `<tr>${r.map((c, i) => cell(c, i ? 'td' : 'th')).join('')}</tr>`).join('')}</tbody></table></div>`;
  } else if (ch.t === 'flow') {
    body = `<ol class="flow">${ch.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  }
  return `<figure class="chart">${ch.title ? `<figcaption>${inlineHTML(ch.title)}</figcaption>` : ''}${body}${ch.note ? `<p class="fnote">${inlineHTML(ch.note)}</p>` : ''}</figure>`;
}
/* ---------- Coordinate plane and scatterplots (fig.t = 'xy' | 'scatter') ---------- */
function planeSVG(fg) {
  const sc = fg.t === 'scatter';
  const W = 320, H = sc ? 280 : 320, L = sc ? 50 : 18, R = 14, T = 14, B = sc ? 44 : 18;
  const [x0, x1] = fg.x, [y0, y1] = fg.y, pw = W - L - R, ph = H - T - B;
  const X = v => L + (v - x0) / (x1 - x0) * pw, Y = v => T + ph - (v - y0) / (y1 - y0) * ph;
  const gstep = r => (r <= 24 ? 1 : niceStep(r, 10)), lstep = r => (r <= 12 ? 2 : r <= 24 ? 4 : niceStep(r, 5));
  const sx = fg.xs || (sc ? niceStep(x1 - x0, 6) : gstep(x1 - x0)), sy = fg.ys || (sc ? niceStep(y1 - y0, 6) : gstep(y1 - y0));
  const lx = fg.lx || (sc ? sx : lstep(x1 - x0)), ly = fg.ly || (sc ? sy : lstep(y1 - y0));
  let g = '';
  if (fg.grid !== false) { for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T + ph}" class="grid"/>`; for (let v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) g += `<line x1="${L}" x2="${L + pw}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/>`; }
  if (sc) {
    g += `<line x1="${L}" x2="${L + pw}" y1="${T + ph}" y2="${T + ph}" class="axis"/><line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" class="axis"/>`;
    for (let v = Math.ceil(x0 / lx) * lx; v <= x1 + 1e-9; v += lx) g += `<text x="${X(v)}" y="${T + ph + 16}" text-anchor="middle" class="ax">${fnum(v)}</text>`;
    for (let v = Math.ceil(y0 / ly) * ly; v <= y1 + 1e-9; v += ly) g += `<text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" class="ax">${fnum(v)}</text>`;
    if (fg.xl) g += `<text x="${L + pw / 2}" y="${H - 6}" text-anchor="middle" class="axt">${esc(fg.xl)}</text>`;
    if (fg.yl) g += `<text x="13" y="${T + ph / 2}" text-anchor="middle" class="axt" transform="rotate(-90 13 ${T + ph / 2})">${esc(fg.yl)}</text>`;
  } else {
    const ax = clamp(X(0), L, L + pw), ay = clamp(Y(0), T, T + ph);
    g += `<line x1="${L - 6}" x2="${L + pw + 6}" y1="${ay}" y2="${ay}" class="axis" marker-end="url(#arr)" marker-start="url(#arr)"/><line x1="${ax}" x2="${ax}" y1="${T + ph + 6}" y2="${T - 6}" class="axis" marker-end="url(#arr)" marker-start="url(#arr)"/>`;
    g += `<text x="${L + pw + 2}" y="${ay - 7}" text-anchor="end" class="axl">${esc(fg.xl || 'x')}</text><text x="${ax + 7}" y="${T + 6}" class="axl">${esc(fg.yl || 'y')}</text>`;
    for (let v = Math.ceil(x0 / lx) * lx; v <= x1 + 1e-9; v += lx) if (Math.abs(v) > 1e-9) g += `<text x="${X(v)}" y="${ay + 15}" text-anchor="middle" class="ax">${fnum(v)}</text>`;
    for (let v = Math.ceil(y0 / ly) * ly; v <= y1 + 1e-9; v += ly) if (Math.abs(v) > 1e-9) g += `<text x="${ax - 5}" y="${Y(v) + 4}" text-anchor="end" class="ax">${fnum(v)}</text>`;
    if (x0 < 0 && y0 < 0) g += `<text x="${ax - 5}" y="${ay + 15}" text-anchor="end" class="ax">0</text>`;
  }
  const clip = `<clipPath id="pc${planeSVG.n = (planeSVG.n || 0) + 1}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath>`;
  let draw = '';
  (fg.shade || []).forEach(sh => { // shade: {f, side:'above'|'below'}
    const pts = []; for (let k = 0; k <= 160; k++) { const xv = x0 + (x1 - x0) * k / 160; pts.push(`${X(xv)},${Y(sh.f(xv))}`); }
    const edge = sh.side === 'above' ? T - 50 : T + ph + 50; draw += `<polygon points="${X(x0)},${edge} ${pts.join(' ')} ${X(x1)},${edge}" class="shade"/>`;
  });
  (fg.fns || []).forEach((fn, i) => {
    const a = fn.from ?? x0, b = fn.to ?? x1; let d = '', pen = false;
    for (let k = 0; k <= 240; k++) { const xv = a + (b - a) * k / 240; const yv = fn.f(xv); if (!isFinite(yv) || yv > y1 + (y1 - y0) || yv < y0 - (y1 - y0)) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${X(xv).toFixed(1)} ${Y(yv).toFixed(1)}`; pen = true; }
    draw += `<path d="${d}" class="fline c${(fn.c ?? i) % 4 + 1}${fn.dash ? ' dash' : ''}"/>`;
    if (fn.label) { const lx2 = fn.lx ?? (a + (b - a) * 0.82); draw += `<text x="${X(lx2) + 6}" y="${Y(fn.f(lx2)) - 6}" class="flab">${esc(fn.label)}</text>`; }
  });
  (fg.segs || []).forEach(([a, b, c, d2, dash]) => draw += `<line x1="${X(a)}" y1="${Y(b)}" x2="${X(c)}" y2="${Y(d2)}" class="fline c1${dash ? ' dash' : ''}"/>`);
  (fg.pts || []).forEach(([px, py, lab, open]) => { draw += `<circle cx="${X(px)}" cy="${Y(py)}" r="${sc ? 4 : 4.5}" class="${open ? 'fpt open' : 'fpt'}"/>`; if (lab) draw += `<text x="${X(px) + 7}" y="${Y(py) - 7}" class="flab">${esc(lab)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="plane" role="img" aria-label="${esc(fg.alt || 'Graph')}"><defs><marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arrow"/></marker>${clip}</defs>${g}<g clip-path="url(#pc${planeSVG.n})">${draw}</g></svg>`;
}
/* ---------- Geometry figures (fig.t = 'geo') ----------
   P: {A:[x,y],...} points; poly: [['A','B','C']]; seg / dash: [['A','D']]; circ: [{c:'O' or [x,y], r}];
   side: [['A','B','5']] label at midpoint; ang: [['B','A','C','40°']] angle at A; right: [['A','C','B']] right angle at C;
   hide: ['D'] points without a name; lab: {A:'A'} overrides; dots: ['O'] filled point markers */
function geoSVG(fg) {
  const P = fg.P || {}; const pts = Object.values(P);
  (fg.circ || []).forEach(c => { const cc = typeof c.c === 'string' ? P[c.c] : c.c; pts.push([cc[0] - c.r, cc[1] - c.r], [cc[0] + c.r, cc[1] + c.r]); });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const W = 320, Hmax = 250, pad = 30, s = Math.min((W - 2 * pad) / ((maxx - minx) || 1), (Hmax - 2 * pad) / ((maxy - miny) || 1));
  const H = Math.round((maxy - miny) * s + 2 * pad);
  const X = p => pad + (p[0] - minx) * s + (W - 2 * pad - (maxx - minx) * s) / 2, Y = p => H - pad - (p[1] - miny) * s;
  const pt = k => (typeof k === 'string' ? P[k] : k);
  const cx = avg(Object.values(P).map(p => p[0])), cy = avg(Object.values(P).map(p => p[1]));
  let g = '';
  (fg.circ || []).forEach(c => { const cc = typeof c.c === 'string' ? P[c.c] : c.c; g += `<circle cx="${X(cc)}" cy="${Y(cc)}" r="${c.r * s}" class="gshape"/>`; });
  (fg.poly || []).forEach(pl => g += `<polygon points="${pl.map(k => `${X(pt(k))},${Y(pt(k))}`).join(' ')}" class="gshape"/>`);
  (fg.seg || []).forEach(([a, b]) => g += `<line x1="${X(pt(a))}" y1="${Y(pt(a))}" x2="${X(pt(b))}" y2="${Y(pt(b))}" class="gline"/>`);
  (fg.dash || []).forEach(([a, b]) => g += `<line x1="${X(pt(a))}" y1="${Y(pt(a))}" x2="${X(pt(b))}" y2="${Y(pt(b))}" class="gline dash"/>`);
  (fg.right || []).forEach(([a, v, b]) => { const V = pt(v), A = pt(a), Bp = pt(b); const u = d => { const l = Math.hypot(d[0], d[1]) || 1; return [d[0] / l, d[1] / l]; }; const ua = u([A[0] - V[0], A[1] - V[1]]), ub = u([Bp[0] - V[0], Bp[1] - V[1]]); const k = 11 / s; const p1 = [V[0] + ua[0] * k, V[1] + ua[1] * k], p2 = [V[0] + (ua[0] + ub[0]) * k, V[1] + (ua[1] + ub[1]) * k], p3 = [V[0] + ub[0] * k, V[1] + ub[1] * k]; g += `<polyline points="${X(p1)},${Y(p1)} ${X(p2)},${Y(p2)} ${X(p3)},${Y(p3)}" class="gmark"/>`; });
  (fg.ang || []).forEach(([a, v, b, t]) => { const V = pt(v), A = pt(a), Bp = pt(b); const a1 = Math.atan2(A[1] - V[1], A[0] - V[0]), a2 = Math.atan2(Bp[1] - V[1], Bp[0] - V[0]); let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const rr = 16; const p1 = [X(V) + rr * Math.cos(a1), Y(V) - rr * Math.sin(a1)], p2 = [X(V) + rr * Math.cos(a1 + da), Y(V) - rr * Math.sin(a1 + da)]; g += `<path d="M${p1[0]} ${p1[1]} A${rr} ${rr} 0 0 ${da > 0 ? 0 : 1} ${p2[0]} ${p2[1]}" class="gmark"/>`; if (t) { const mid = a1 + da / 2, lr = 31; g += `<text x="${X(V) + lr * Math.cos(mid)}" y="${Y(V) - lr * Math.sin(mid) + 4}" text-anchor="middle" class="glab small">${esc(t)}</text>`; } });
  (fg.side || []).forEach(([a, b, t]) => { const A = pt(a), Bp = pt(b); const mx = (X(A) + X(Bp)) / 2, my = (Y(A) + Y(Bp)) / 2; let nx = -(Y(Bp) - Y(A)), ny = X(Bp) - X(A); const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; const ccx = X([cx, cy]), ccy = Y([cx, cy]); if ((mx + nx - ccx) ** 2 + (my + ny - ccy) ** 2 < (mx - ccx) ** 2 + (my - ccy) ** 2) { nx = -nx; ny = -ny; } g += `<text x="${mx + nx * 13}" y="${my + ny * 13 + 4}" text-anchor="middle" class="glab small">${esc(t)}</text>`; });
  (fg.dots || []).forEach(k => g += `<circle cx="${X(pt(k))}" cy="${Y(pt(k))}" r="3.5" class="gdot"/>`);
  Object.entries(P).forEach(([k, p]) => { if ((fg.hide || []).includes(k)) return; const name = (fg.lab && fg.lab[k]) || k; let dx = X(p) - X([cx, cy]), dy = Y(p) - Y([cx, cy]); const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; g += `<text x="${X(p) + dx * 13}" y="${Y(p) + dy * 13 + 5}" text-anchor="middle" class="glab"><tspan font-style="italic">${esc(name)}</tspan></text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="geo" role="img" aria-label="${esc(fg.alt || 'Figure')}">${g}</svg>`;
}
function figHTML(fg) {
  if (!fg) return '';
  const svg = fg.t === 'geo' ? geoSVG(fg) : planeSVG(fg);
  return `<figure class="mfig">${fg.title ? `<figcaption>${inlineHTML(fg.title)}</figcaption>` : ''}${svg}${fg.note ? `<p class="fnote">${inlineHTML(fg.note)}</p>` : ''}</figure>`;
}

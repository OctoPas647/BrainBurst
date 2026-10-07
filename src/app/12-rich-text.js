/* ================= Rich text and math =================
   rich(s): paragraphs, bullet lines ("- "), **bold**, *italic*, blanks (______)
   and math between $ signs ($$ = a literal dollar sign). */
const MFUN = new Set(['sin', 'cos', 'tan', 'log', 'ln', 'max', 'min', 'mod']);
const MSYM = { ell: 'ℓ', pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', Delta: 'Δ', deg: '°', angle: '∠', triangle: '△', approx: '≈', pm: '±', times: '×', cdot: '·', perp: '⊥', parallel: '∥', infty: '∞', sim: '∼', cong: '≅', div: '÷' };
const MOP = { '=': '=', '+': '+', '<': '&lt;', '>': '&gt;', '≤': '≤', '≥': '≥', '≠': '≠', '≈': '≈' };
function mathHTML(src) {
  let i = 0; const s = String(src);
  const peek = (t) => s.startsWith(t, i);
  function group() { // after a {
    let depth = 1, j = i; while (j < s.length && depth) { if (s[j] === '{') depth++; else if (s[j] === '}') depth--; j++; }
    const inner = s.slice(i, j - 1); i = j; return inner;
  }
  function arg() { while (s[i] === ' ') i++; if (s[i] === '{') { i++; return mathHTML(group()); } // single token
    const m = /^(-?\d+(?:\.\d+)?|[A-Za-z]|.)/.exec(s.slice(i)); if (!m) return ''; i += m[0].length; return mathHTML(m[0]); }
  let out = '', prev = 'start';
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (peek('frac{')) { i += 5; const a = mathHTML(group()); i++; const b = mathHTML(group()); out += `<span class="mfrac"><span class="mnum">${a}</span><span class="mden">${b}</span></span>`; prev = 'atom'; continue; }
    if (peek('sqrt')) { i += 4; let idx = ''; if (s[i] === '[') { const j = s.indexOf(']', i); idx = s.slice(i + 1, j); i = j + 1; } const a = arg(); out += `<span class="msqrt">${idx ? `<sup class="mridx">${esc(idx)}</sup>` : ''}<span class="mrad">√</span><span class="mrc">${a}</span></span>`; prev = 'atom'; continue; }
    if (peek('bar{')) { i += 4; out += `<span class="mbar">${mathHTML(group())}</span>`; prev = 'atom'; continue; }
    if (peek('arc{')) { i += 4; out += `<span class="marc">${mathHTML(group())}</span>`; prev = 'atom'; continue; }
    if (peek('text{')) { i += 5; out += `<span class="mtext">${esc(group())}</span>`; prev = 'atom'; continue; }
    if (c === '^') { i++; out += `<sup>${arg()}</sup>`; prev = 'atom'; continue; }
    if (c === '_') { i++; out += `<sub>${arg()}</sub>`; prev = 'atom'; continue; }
    if (c === '{') { i++; out += mathHTML(group()); prev = 'atom'; continue; }
    if (/[A-Za-z]/.test(c)) {
      const w = /^[A-Za-z]+/.exec(s.slice(i))[0];
      if (MSYM[w]) { const isOp = ['times', 'cdot', 'pm', 'approx', 'div', 'perp', 'parallel', 'sim', 'cong'].includes(w); out += `<span class="${isOp ? 'mop' : 'msym'}">${MSYM[w]}</span>`; i += w.length; prev = isOp ? 'op' : 'atom'; continue; }
      const fn = [...MFUN].find(f => w.startsWith(f) && (w.length === f.length));
      if (fn) { out += `<span class="mfn">${fn}</span>`; i += fn.length; prev = 'atom'; continue; }
      out += w.split('').map(ch => `<i>${ch}</i>`).join(''); i += w.length; prev = 'atom'; continue;
    }
    if (/[0-9.]/.test(c)) { const m = /^[0-9][0-9,]*(?:\.[0-9]+)?|^\.[0-9]+/.exec(s.slice(i)); const t = m ? m[0] : c; out += t.replace(/,(?=\d{3})/g, ',<span class="mth"></span>'); i += t.length; prev = 'atom'; continue; }
    if (peek('<=') || peek('>=') || peek('!=')) { const t = s.substr(i, 2); out += `<span class="mop">${{ '<=': '≤', '>=': '≥', '!=': '≠' }[t]}</span>`; i += 2; prev = 'op'; continue; }
    if (c === '-' || c === '−') { const unary = prev === 'start' || prev === 'op' || prev === 'open'; out += unary ? '−' : '<span class="mop">−</span>'; i++; prev = unary ? 'unary' : 'op'; continue; }
    if (MOP[c]) { out += `<span class="mop">${MOP[c]}</span>`; i++; prev = 'op'; continue; }
    if (c === '*') { out += '<span class="mop">·</span>'; i++; prev = 'op'; continue; }
    if (c === '(' || c === '[') { out += c; i++; prev = 'open'; continue; }
    if (c === ',') { out += ',<span class="mth"></span>'; i++; prev = 'open'; continue; }
    if (c === "'") { out += '′'; i++; continue; }
    out += esc(c); i++; prev = c === ')' || c === ']' || c === '|' || c === '%' || c === '°' ? 'atom' : prev;
  }
  return out;
}
function textHTML(t) {
  return esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<i>$2</i>')
    .replace(/==([^=]+)==/g, '<u>$1</u>')
    .replace(/_{4,}/g, '<span class="blank" aria-label="blank"></span>');
}
function inlineHTML(s) {
  s = String(s ?? ''); let out = '', buf = '', i = 0;
  while (i < s.length) {
    if (s[i] === '$') {
      if (s[i + 1] === '$') { buf += '$'; i += 2; continue; }
      const j = s.indexOf('$', i + 1);
      if (j < 0) { buf += '$'; i++; continue; }
      out += textHTML(buf); buf = ''; out += `<span class="m">${mathHTML(s.slice(i + 1, j))}</span>`; i = j + 1;
    } else buf += s[i++];
  }
  return out + textHTML(buf);
}
const onlyMath = line => /^\s*\$[^$]+\$\s*$/.test(line) && !/^\s*\$\$/.test(line);
function rich(s) {
  return String(s ?? '').split(/\n\s*\n/).map(par => {
    const lines = par.split('\n').filter(l => l.trim() !== '');
    if (!lines.length) return '';
    if (lines.every(onlyMath)) return `<div class="mblock">${lines.map(l => `<div>${inlineHTML(l.trim())}</div>`).join('')}</div>`;
    // runs of "- " lines become a bullet list; other lines stay text (e.g. "the student has taken the following notes:" + bullets)
    const isB = l => /^\s*[-•]\s+/.test(l); let out = '', k = 0;
    while (k < lines.length) {
      const run = []; const b = isB(lines[k]);
      while (k < lines.length && isB(lines[k]) === b) run.push(lines[k++]);
      out += b ? `<ul class="rlist">${run.map(l => `<li>${inlineHTML(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>` : `<p>${run.map(inlineHTML).join('<br>')}</p>`;
    }
    return out;
  }).join('');
}
/* plain text version (for titles, toasts, accessibility labels) */
const plain = s => String(s ?? '').replace(/\$\$/g, '\u0001').replace(/\$([^$]*)\$/g, (m, x) => x.replace(/frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/sqrt/g, '√').replace(/[{}]/g, '')).replace(/\u0001/g, '$').replace(/\*\*?/g, '');

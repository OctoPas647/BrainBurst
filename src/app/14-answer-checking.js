/* ================= Student-produced response (typed answers), SAT rules =================
   - up to 5 characters for a positive answer, 6 with a minus sign
   - fractions and decimals are fine; no mixed numbers, units, %, $ or commas
   - a decimal that doesn't fit must use every available character (truncated or rounded) */
function parseNum(s) {
  s = String(s).trim();
  let m = /^(-?)(\d+)\/(\d+)$/.exec(s); if (m) { const n = +m[2], d = +m[3]; if (!d) return null; return { neg: !!m[1], n, d, v: (m[1] ? -1 : 1) * n / d, frac: true }; }
  m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(s); if (m && (m[2] || m[3])) { const dec = m[3] || ''; return { neg: !!m[1], v: (m[1] ? -1 : 1) * parseFloat((m[2] || '0') + '.' + (dec || '0')), dp: dec.length, frac: false }; }
  return null;
}
function sprProblem(raw) {
  const s = String(raw).trim();
  if (!s) return 'Enter an answer.';
  if (/^-?\d+\s+\d+\/\d+$/.test(s)) return 'Mixed numbers aren’t allowed: write 3 1/2 as 7/2 or 3.5.';
  if (/[%$,]/.test(s)) return 'Leave out symbols like %, $ and commas.';
  if (/[a-z=]/i.test(s)) return 'Enter only the number, not a variable or units.';
  if (!parseNum(s)) return 'That isn’t a number the SAT would accept.';
  const len = s.replace(/^-/, '').length; if (len > 5) return `Too long: the SAT allows 5 characters (6 with a minus sign). Use a fraction or shorten the decimal.`;
  return '';
}
const valOf = a => { const p = parseNum(a); return p ? p.v : NaN; };
/* acceptable decimal entries for a value: exact, or the longest truncation/rounding that fits */
function decimalForms(v) {
  const out = new Set(); const neg = v < 0, av = Math.abs(v);
  for (const lead of [true, false]) {
    const intPart = Math.floor(av), room = 5 - (lead || intPart > 0 ? String(intPart).length : 0) - 1;
    if (room < 1) continue;
    const tr = Math.floor(av * Math.pow(10, room)) / Math.pow(10, room), rd = Math.round(av * Math.pow(10, room)) / Math.pow(10, room);
    for (const x of [tr, rd]) { let t = x.toFixed(room); if (!lead && intPart === 0) t = t.replace(/^0/, ''); out.add((neg ? '-' : '') + t); }
  }
  return [...out];
}
function checkSPR(input, it) {
  const prob = sprProblem(input); if (prob) return { ok: false, msg: prob, invalid: true };
  const p = parseNum(input), raw = String(input).trim();
  if (it.rng) { const [lo, hi, br] = it.rng; const okL = br && br[0] === '(' ? p.v > lo : p.v >= lo - 1e-9, okH = br && br[1] === ')' ? p.v < hi : p.v <= hi + 1e-9; return { ok: okL && okH }; }
  for (const a of it.a) {
    const v = valOf(a); if (isNaN(v)) continue;
    if (Math.abs(p.v - v) < 1e-9) return { ok: true };
    if (!p.frac && p.dp && Math.abs(p.v - v) < Math.pow(10, -p.dp) && raw.replace(/^-/, '').length === 5) { const forms = decimalForms(v); if (forms.includes(raw) || forms.includes(raw.replace(/^(-?)0\./, '$1.'))) return { ok: true }; }
  }
  const v0 = valOf(it.a[0]);
  if (!p.frac && p.dp && Math.abs(p.v - v0) < 0.01 && raw.replace(/^-/, '').length < 5) return { ok: false, msg: 'Close, but the SAT needs every digit that fits: fill all 5 characters (for example .6666 or .6667 for 2/3).' };
  return { ok: false };
}
/* How the answer is shown after checking */
function sprAnswerText(it) {
  if (it.rng) return `any value from ${it.rng[0]} to ${it.rng[1]}`;
  const main = it.a[0]; const v = valOf(main); const alts = [];
  if (main.includes('/')) { const exact = String(+v.toFixed(6)); const forms = Number.isInteger(v * 10000) && exact.replace(/^-?0?/, '').length <= 5 ? [exact.replace(/^(-?)0\./, '$1.')] : decimalForms(v); forms.forEach(f => { if (!alts.includes(f) && f !== main) alts.push(f); }); }
  it.a.slice(1).forEach(x => { if (!alts.includes(x)) alts.push(x); });
  return main + (alts.length ? ` (also accepted: ${alts.slice(0, 4).join(', ')})` : '');
}

/* ================= Helpers for the math question generators =================
   Generators build fresh SAT-style questions from a seed, so the same seed always
   gives the same question (used by Mistake Review, bookmarks and practice tests).

   Math is written between $ signs in a small notation (no backslashes needed):
     frac{a}{b}  sqrt{x}  sqrt[3]{x}  x^2  x^{n+1}  a_1  bar{AB}  pi  theta  <=  >=  !=  deg
   A literal dollar sign is written $$ (e.g. "costs $$12"). */
function RNG(seed) {
  let a = (seed >>> 0) || 1;
  const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const R = {
    f,
    int: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)),
    nz: (lo, hi) => { let v = 0; while (v === 0) v = lo + Math.floor(f() * (hi - lo + 1)); return v; },
    pick: arr => arr[Math.floor(f() * arr.length)],
    chance: p => f() < p,
    sign: () => (f() < 0.5 ? -1 : 1),
    shuffle: arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    distinct: (n, lo, hi, avoid = []) => { const out = []; let guard = 0; while (out.length < n && guard++ < 500) { const v = lo + Math.floor(f() * (hi - lo + 1)); if (!out.includes(v) && !avoid.includes(v)) out.push(v); } return out; }
  };
  return R;
}
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

/* Exact fractions */
function Q(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d); n /= g; d /= g;
  return {
    n, d, v: n / d, isInt: d === 1,
    add: o => (o = toQ(o), Q(n * o.d + o.n * d, d * o.d)),
    sub: o => (o = toQ(o), Q(n * o.d - o.n * d, d * o.d)),
    mul: o => (o = toQ(o), Q(n * o.n, d * o.d)),
    div: o => (o = toQ(o), Q(n * o.d, d * o.n)),
    neg: () => Q(-n, d),
    eq: o => (o = toQ(o), n === o.n && d === o.d),
    tex: () => (d === 1 ? String(n) : `${n < 0 ? '-' : ''}frac{${Math.abs(n)}}{${d}}`),
    str: () => (d === 1 ? String(n) : `${n}/${d}`)
  };
}
const toQ = x => (typeof x === 'number' ? Q(x, 1) : x);

/* Number formatting */
function fmtNum(x, dp = 4) {
  if (typeof x === 'object' && x && 'n' in x) return x.tex();
  if (!isFinite(x)) return String(x);
  let s = (Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp)).toString();
  if (s.includes('e')) s = x.toFixed(dp);
  const neg = s.startsWith('-'); if (neg) s = s.slice(1);
  let [i, f] = s.split('.');
  if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + i + (f ? '.' + f : '');
}
const N = x => fmtNum(x);
function money(x, cents) {
  const withCents = cents || Math.round(x * 100) % 100 !== 0;
  let s = withCents ? Math.abs(x).toFixed(2) : String(Math.round(Math.abs(x)));
  const [i, f] = s.split('.'); s = (i.length > 3 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i) + (f ? '.' + f : '');
  return (x < 0 ? '-' : '') + '$$' + s;
}
const pctS = x => fmtNum(x, 2) + '%';
/* coefficient in front of a variable: 1x -> x, -1x -> -x */
const co = (a, v = 'x') => (a === 1 ? v : a === -1 ? '-' + v : fmtNum(a) + v);
/* polynomial from [coef, var] terms, skipping zeros and fixing signs: poly([[3,'x^2'],[-5,'x'],[2,'']]) */
function poly(terms) {
  let out = '';
  terms.forEach(([c, v]) => {
    if (c === 0 || (typeof c === 'object' && c.n === 0)) return;
    const isQ = typeof c === 'object';
    const neg = isQ ? c.n < 0 : c < 0; const abs = isQ ? Q(Math.abs(c.n), c.d) : Math.abs(c);
    let body;
    if (v === '') body = isQ ? abs.tex() : fmtNum(abs);
    else if (!isQ && abs === 1) body = v;
    else if (isQ && abs.n === 1 && abs.d === 1) body = v;
    else body = (isQ ? abs.tex() : fmtNum(abs)) + v;
    if (!out) out = (neg ? '-' : '') + body; else out += (neg ? ' - ' : ' + ') + body;
  });
  return out || '0';
}
const lin = (a, b, v = 'x') => poly([[a, v], [b, '']]);
/* "+ 3" / "- 3" for appending a constant */
const plus = b => (b < 0 ? ` - ${fmtNum(-b)}` : ` + ${fmtNum(b)}`);
/* wrap in math delimiters */
const m$ = s => `$${s}$`;

/* Multiple choice with numbers: dedupes, fills gaps, sorts ascending (as the SAT does) */
function mcNum(r, ans, wrongs, show = v => m$(fmtNum(v))) {
  const key = v => (typeof v === 'object' ? v.v : v);
  const seen = new Set([+key(ans).toFixed(6)]); const opts = [ans];
  for (const w of wrongs) { if (w == null || !isFinite(key(w))) continue; const k = +key(w).toFixed(6); if (!seen.has(k)) { seen.add(k); opts.push(w); } if (opts.length === 4) break; }
  let step = Math.max(1, Math.round(Math.abs(key(ans)) / 5)), g = 0;
  while (opts.length < 4 && g++ < 50) { const c = key(ans) + r.sign() * step * r.int(1, 3); const k = +c.toFixed(6); if (!seen.has(k)) { seen.add(k); opts.push(typeof ans === 'object' ? Q(Math.round(c * ans.d), ans.d) : c); } }
  const sorted = opts.slice().sort((a, b) => key(a) - key(b));
  return { o: sorted.map(show), a: sorted.indexOf(ans), fx: true };
}
/* Multiple choice with prepared strings: correct first in the list; shuffles unless keep */
function mcStr(r, ans, wrongs, keep) {
  const opts = [ans]; for (const w of wrongs) { if (w && !opts.includes(w)) opts.push(w); if (opts.length === 4) break; }
  const order = keep ? opts.slice() : r.shuffle(opts);
  return { o: order, a: order.indexOf(ans), fx: !!keep };
}
/* Student-produced response: accepted values (numbers or Q fractions) */
/* The first accepted answer is what the app shows as "the answer", so it must be enterable on the SAT
   (5 characters, 6 with a minus sign). A fraction that's too long, like 81/100, is given as a decimal (.81). */
function sprFit(s) {
  if (s.replace(/^-/, '').length <= 5 || !s.includes('/')) return s;
  const [n, d] = s.split('/').map(Number), v = n / d, sign = v < 0 ? '-' : '', t = Math.abs(v), ip = Math.floor(t);
  const room = 4 - (ip ? String(ip).length : 0); if (room < 1) return s;
  const dec = x => sign + x.toFixed(room).replace(/0+$/, '').replace(/\.$/, '').replace(/^0\./, '.');
  return Math.abs(+t.toFixed(room) - t) < 1e-12 ? dec(t) : dec(Math.trunc(t * 10 ** room) / 10 ** room);
}
const spr = vals => ({ k: 'n', a: (Array.isArray(vals) ? vals : [vals]).map(v => sprFit(typeof v === 'object' ? v.str() : String(v))) });

/* Word-problem flavour */
const NAMES = ['Ava', 'Mateo', 'Priya', 'Kwame', 'Lena', 'Diego', 'Hana', 'Omar', 'Zoe', 'Ivan', 'Maya', 'Tariq', 'Nina', 'Luca', 'Aisha', 'Jonah', 'Elif', 'Sami', 'Rosa', 'Theo'];
const pickName = r => r.pick(NAMES);

/* Register generators: defGen('lin1', { 1: [fn, ...], 2: [...], 3: [...] }) */
function defGen(sk, byD) { GENS[sk] = byD; }
function genItem(sk, d, seed) {
  const G = GENS[sk]; if (!G) return null;
  const lv = G[d] ? d : G[2] ? 2 : G[1] ? 1 : 3;
  const r = RNG(seed); const tpl = r.pick(G[lv]);
  const it = tpl(r);
  return Object.assign({ k: 'm' }, it, { sk, d: lv, ref: `g:${sk}:${lv}:${seed}` });
}
const newSeed = () => (Math.floor(Math.random() * 2147483646) + 1);
/* In lesson files: G('lin1', 2, 3) = three fresh questions from that generator at difficulty 2 */
const G = (sk, d, n = 1) => Array.from({ length: n }, () => ({ gen: sk, d }));

// Content checker: loads the content files and reports mistakes with their exact location.
// Run through:  python tools/build.py check
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console }; vm.createContext(ctx);
for (const f of process.argv.slice(2)) {
  try { vm.runInContext(fs.readFileSync(f, 'utf8').replace(/^const (\w+) =/gm, 'var $1 ='), ctx, { filename: f }); }
  catch (e) { console.log(`  ✗ ${path.basename(f)}: ${e.message}`); process.exit(1); }
}
const errors = [], warns = []; const err = (w, m) => errors.push(`${w}: ${m}`), warn = (w, m) => warns.push(`${w}: ${m}`);
const { SKILLS, BANK, UNITS, GENS, TESTS, TEST_SETS, TRICKS, VOCAB, STRATEGIES, genItem } = ctx;
function checkItem(q, where) {
  if (!q || typeof q !== 'object') return err(where, 'not an object');
  if (!SKILLS[q.sk]) err(where, `unknown skill "${q.sk}"`);
  if (!q.p) err(where, 'missing question text p');
  if (!q.x) warn(where, 'no explanation (x)');
  if (![1, 2, 3].includes(q.d)) warn(where, `difficulty d=${q.d} should be 1, 2 or 3`);
  const txt = [q.p, q.ps, q.x, ...(q.o || [])].join(' ');
  if (/undefined|NaN|\[object/.test(txt)) err(where, 'text contains undefined/NaN');
  if ((txt.replace(/\$\$/g, '').match(/\$/g) || []).length % 2) err(where, 'unbalanced $ math delimiters (use $$ for a dollar sign)');
  if (q.k === 'm') {
    if (!Array.isArray(q.o) || q.o.length !== 4) err(where, `needs exactly 4 options (has ${q.o ? q.o.length : 0})`);
    else if (new Set(q.o).size !== 4) err(where, 'two options are identical');
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) err(where, `answer a=${q.a} must be 0–3`);
    whyCheck(q, where, true);
  } else if (q.k === 'n') {
    if (!Array.isArray(q.a) || !q.a.length) err(where, 'typed answer needs a list of accepted answers in a');
  } else err(where, `unknown kind k="${q.k}"`);
}
// w: why each wrong choice is wrong (same order as o, '' for the correct choice)
const WHY = { bank: [0, 0], gen: [0, 0] }; const noWhy = [];
function whyCheck(q, where, isBank) {
  const C = WHY[isBank ? 'bank' : 'gen'];
  if (q.w == null) { C[1] += 3; if (isBank) err(where, 'missing w: add one reason per wrong choice (and \'\' for the correct one)'); return; }
  if (!Array.isArray(q.w) || q.w.length !== (q.o || []).length) return err(where, `w must list one reason per choice (${(q.o || []).length}), with '' for the correct one`);
  if (q.w[q.a]) err(where, `w has a reason for the correct choice (position ${q.a + 1} after shuffling); it should be ''`);
  q.w.forEach((t, i) => { if (i === q.a) return; C[1]++; if (t && String(t).trim()) C[0]++; else if (isBank) err(where, `w is missing the reason for choice “${String(q.o[i]).slice(0, 40)}”`); });
  if (/undefined|NaN|\[object/.test(q.w.join(' '))) err(where, 'w contains undefined/NaN');
  if ((q.w.join(' ').replace(/\$\$/g, '').match(/\$/g) || []).length % 2) err(where, 'w has unbalanced $ math delimiters');
}
Object.values(BANK).forEach(q => checkItem(q, q.id));
(TRICKS || []).forEach(q => { if (!q.t) warn(q.id, 'trap question has no trap name t'); });
let lessons = 0; const ids = new Set();
UNITS.forEach(u => u.lessons.forEach(l => { lessons++; if (ids.has(l.id)) err(l.id, 'duplicate lesson id'); ids.add(l.id); if (!l.items || !l.items.length) err(l.id, 'lesson has no questions'); (l.items || []).forEach(s => { if (typeof s === 'string' && !BANK[s]) err(l.id, `question "${s}" not found`); if (s && s.gen && !GENS[s.gen]) err(l.id, `no generator for "${s.gen}"`); }); }));
// generators: try many seeds
let gen = 0; const GEN_MISSING = new Set();
for (const sk of Object.keys(GENS)) for (const d of Object.keys(GENS[sk])) for (let s = 1; s <= 150; s++) {
  let it; try { it = genItem(sk, +d, s * 7919 + 13); } catch (e) { err(`generator ${sk}/${d}`, `crashed with seed ${s * 7919 + 13}: ${e.message}`); break; }
  gen++; const w = `generator ${sk}/${d} seed ${s * 7919 + 13}`;
  if (it.k === 'm') { if (!it.o || it.o.length !== 4 || new Set(it.o).size !== 4) { err(w, 'needs 4 distinct options'); break; } const e0 = errors.length; whyCheck(it, w, false); if (errors.length > e0) break; if (it.w && it.w.some((t, i) => i !== it.a && !t)) GEN_MISSING.add(`${sk}/${d}`); }
  if (/undefined|NaN|Infinity|\[object/.test(it.p + it.x + (it.o || []).join(' '))) { err(w, 'text contains undefined/NaN'); break; }
}
TESTS.forEach(t => { const T = TEST_SETS[t.id]; if (!T || !T.RW.m1) { warn(t.id, 'Reading & Writing modules not written yet'); return; } ['m1', 'm2e', 'm2h'].forEach(m => { const n = (T.RW[m] || []).length; if (n !== 27) warn(`${t.id} RW ${m}`, `has ${n} questions (the real test has 27)`); }); });
const rw = Object.values(BANK).filter(q => !q.test && q.sk && ['wic', 'tsp', 'ctc', 'cid', 'coet', 'coeq', 'inf', 'bnd', 'fss', 'trn', 'rsy'].includes(q.sk)).length;
const pc = ([a, b]) => (b ? Math.round(a / b * 100) : 100) + '%';
if (GEN_MISSING.size) warn('why-wrong notes', `generators with unexplained wrong choices: ${[...GEN_MISSING].join(', ')}`);
warns.slice(0, 40).forEach(w => console.log('  ⚠ ' + w));
console.log(`  Why-wrong coverage: hand-written ${pc(WHY.bank)}, generated ${pc(WHY.gen)} of wrong choices`);
if (errors.length) { errors.slice(0, 60).forEach(e => console.log('  ✗ ' + e)); console.log(`  ${errors.length} error(s).`); process.exit(1); }
console.log(`  ✓ Content OK: ${lessons} lessons, ${Object.keys(BANK).length} hand-written questions (${rw} R&W practice), ${Object.keys(GENS).length} math generators (${gen} samples), ${VOCAB.length} words, ${STRATEGIES.length} strategies`);

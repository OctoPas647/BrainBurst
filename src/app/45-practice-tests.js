/* ================= Practice tests (Bluebook-style runner) =================
   A section = module 1 (mixed difficulty) + module 2 (easier or harder, depending on module 1).
   Reading & Writing: 27 questions, 32 minutes per module. Math: 22 questions, 35 minutes per module. */
const RW_ORDER = ['wic', 'tsp', 'ctc', 'cid', 'coet', 'coeq', 'inf', 'bnd', 'fss', 'trn', 'rsy'];
const DW = { 1: 0.8, 2: 2, 3: 3 };
function testModules(test, sec) {
  if (sec === 'RW') { const T = TEST_SETS[test.id]; return T && T.RW && T.RW.m1 ? { m1: T.RW.m1.map(id => 'b:' + id), m2e: T.RW.m2e.map(id => 'b:' + id), m2h: T.RW.m2h.map(id => 'b:' + id) } : null; }
  return generatedMath(test.mseed || 1001);
}
const MATH_SPEC = {
  m1: [['lin1', 1], ['linf', 1], ['pct', 1], ['eqv', 1], ['lin2', 1], ['area', 1], ['nleq', 1], ['sys', 2], ['nlf', 2], ['rat', 2], ['ineq', 2], ['eqv', 2], ['lat', 2], ['linf', 2], ['one', 2], ['nleq', 2], ['lin1', 3], ['nlf', 3], ['trig', 3], ['sys', 3], ['eqv', 3], ['circ', 3]],
  m2e: [['lin1', 1], ['pct', 1], ['linf', 1], ['eqv', 1], ['area', 1], ['lin2', 1], ['rat', 1], ['nleq', 1], ['one', 1], ['sys', 1], ['lat', 1], ['nlf', 1], ['ineq', 2], ['lin2', 2], ['prob', 2], ['eqv', 2], ['two', 2], ['nleq', 2], ['trig', 2], ['linf', 2], ['nlf', 2], ['circ', 2]],
  m2h: [['lin1', 2], ['eqv', 2], ['pct', 2], ['sys', 2], ['nlf', 2], ['lat', 2], ['two', 2], ['nleq', 2], ['linf', 3], ['ineq', 3], ['eqv', 3], ['prob', 3], ['nleq', 3], ['sys', 3], ['nlf', 3], ['trig', 3], ['infr', 3], ['circ', 3], ['lin2', 3], ['area', 3], ['nlf', 3], ['nleq', 3]]
};
const mathModule = (seed, mod) => MATH_SPEC[mod].map(([sk, d], i) => `g:${sk}:${d}:${seed + i * 7919 + (mod === 'm1' ? 0 : mod === 'm2e' ? 104729 : 209459)}`);
function generatedMath(seed) { return { m1: mathModule(seed, 'm1'), m2e: mathModule(seed, 'm2e'), m2h: mathModule(seed, 'm2h') }; }
const sortRW = refs => refs.map(itemFromRef).filter(Boolean).sort((a, b) => RW_ORDER.indexOf(a.sk) - RW_ORDER.indexOf(b.sk) || (a.d || 2) - (b.d || 2));
function moduleItems(refs, sec) { return sec === 'RW' ? sortRW(refs) : refs.map(itemFromRef).filter(Boolean); }
function weightOf(items) { return items.reduce((a, it) => a + DW[it.d || 2], 0); }
function scoreSection(sec, m1, m2, route, m2hItems) {
  const earned = [...m1, ...m2].reduce((a, r) => a + (r.ok ? DW[r.d || 2] : 0), 0);
  const max = weightOf(m1) + weightOf(m2hItems);
  return clamp(round10(200 + 600 * earned / max), 200, 800);
}
/* ---------- Tests tab ---------- */
function viewTests() {
  const fixed = TESTS.map(t => { const has = { RW: !!testModules(t, 'RW'), M: true }; const tries = S.tests.filter(x => x.test === t.id); const best = tries.reduce((m, x) => Math.max(m, x.total || 0), 0);
    return `<article class="tcard"><header><span class="mic">${icon('clock')}</span><div><h3>${esc(t.name)}</h3><p class="muted small">${esc(t.d || 'Full-length, adaptive, timed like the real digital SAT.')}${tries.length ? ` · ${plural(tries.length, 'attempt')}${best ? ` · best ${best}` : ''}` : ''}</p></div></header><div class="tbtns"><button type="button" class="btn primary" data-test="${t.id}:full" ${has.RW && has.M ? '' : 'disabled'}>${icon('play')} Full test · 2 h 14 min</button><button type="button" class="btn" data-test="${t.id}:RW" ${has.RW ? '' : 'disabled'}>${icon('book')} Reading & Writing · 64 min</button><button type="button" class="btn" data-test="${t.id}:M">${icon('sigma')} Math · 70 min</button></div></article>`; }).join('');
  const hist = S.tests.slice().reverse();
  return `<header class="vhead"><h1>Practice tests</h1><p class="muted">Bluebook-style: timed modules, a question navigator, mark for review, and a second module that adapts to how you did on the first.</p></header>
  <div class="tlist">${fixed}
  <article class="tcard"><header><span class="mic">${icon('sparkle')}</span><div><h3>New Math section</h3><p class="muted small">A brand-new adaptive Math section generated for you, every time. Unlimited.</p></div></header><div class="tbtns"><button type="button" class="btn primary" data-test="gen:M">${icon('sigma')} Generate · 70 min</button><button type="button" class="btn" data-test="gen:M1">${icon('clock')} One module · 35 min</button></div></article></div>
  <section class="card"><h2>${icon('list')} How scoring works here</h2><p class="muted small">Each section is scored 200–800. Harder questions are worth more, and doing well on module 1 unlocks the harder module 2, which is the only route to the top scores, just like the real test. BrainBurst estimates scores from your answers; it isn’t official College Board scoring.</p><label class="tog"><input type="checkbox" id="tbreak" ${S.settings.testBreak ? 'checked' : ''}> 10-minute break between sections</label></section>
  ${hist.length ? `<section class="card"><h2>Your results</h2><ul class="thist">${hist.map((r, i) => `<li><button type="button" class="threv" data-rev="${S.tests.length - 1 - i}"><span><b>${esc(r.name)}</b><small>${esc(r.d)}${r.secs ? ` · ${fmtTime(r.secs)}` : ''}</small></span><span class="tsc">${r.RW != null ? `<i class="sk-verbal">R&W ${r.RW}</i>` : ''}${r.M != null ? `<i class="sk-math">Math ${r.M}</i>` : ''}${r.total != null ? `<b>${r.total}</b>` : ''}</span>${icon('arrowr')}</button></li>`).join('')}</ul></section>` : ''}`;
}
BIND.tests = () => {
  $$('[data-test]').forEach(b => b.onclick = () => { const [tid, what] = b.dataset.test.split(':'); startTest(tid, what); });
  $$('[data-rev]').forEach(b => b.onclick = () => showReport(S.tests[+b.dataset.rev], true));
  const tb = $('#tbreak'); if (tb) tb.onchange = () => { S.settings.testBreak = tb.checked; save(); };
};
function startTest(tid, what) {
  let name, secs, mods = {};
  if (tid === 'gen') { const seed = newSeed(); mods.M = generatedMath(seed); name = what === 'M1' ? 'Math module (generated)' : 'Math section (generated)'; secs = ['M']; if (what === 'M1') return runTest({ id: 'gen', name, secs, mods, single: true }); }
  else { const t = TESTS.find(x => x.id === tid); name = t.name + (what === 'RW' ? ' · R&W' : what === 'M' ? ' · Math' : ''); secs = what === 'full' ? ['RW', 'M'] : [what]; secs.forEach(s => mods[s] = testModules(t, s)); }
  sheet(`<h2>${icon('clock')} ${esc(name)}</h2><ul class="rlist"><li>${secs.map(s => `${SECTIONS[s].name}: 2 modules × ${SECTIONS[s].qs} questions, ${SECTIONS[s].mins} minutes each`).join('<br>')}</li><li>You can move between questions within a module, mark questions for review and change answers until you submit the module.</li><li>Answers are checked at the end. Wrong answers go to Mistake Review.</li>${secs.includes('M') ? '<li>The calculator and the reference sheet are available on every Math question.</li>' : ''}</ul><label class="tog"><input type="checkbox" id="tuntimed"> Untimed (practice without the clock)</label><div class="mbtns"><button type="button" class="btn primary" id="tgo">${icon('play')} Start</button></div>`, (m, close) => $('#tgo', m).onclick = () => { const untimed = $('#tuntimed', m).checked; close(); runTest({ id: tid, name, secs, mods, untimed }); });
}
/* ---------- The runner ---------- */
let TESTER = null;
function runTest(cfg) {
  const T = { cfg, si: 0, mod: 'm1', res: {}, start: Date.now(), ended: false };
  const ov = div('tester'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); document.body.appendChild(ov); document.body.classList.add('noscroll'); TESTER = T;
  let items = [], answers = [], flags = [], times = [], i = 0, tLeft = 0, tick = null, qStart = 0, cur = null, hideTimer = false;
  const sec = () => cfg.secs[T.si];
  const exit = () => { clearInterval(tick); closeCalc(); ov.remove(); document.body.classList.remove('noscroll'); document.removeEventListener('keydown', kb); TESTER = null; render(); };
  function beginModule() {
    const s = sec(), M = cfg.mods[s]; const refs = T.mod === 'm1' ? M.m1 : T.route === 'hard' ? M.m2h : M.m2e;
    items = moduleItems(refs, s); answers = items.map(() => null); flags = items.map(() => false); times = items.map(() => 0); i = 0;
    tLeft = SECTIONS[s].mins * 60; clearInterval(tick);
    if (!cfg.untimed) tick = setInterval(() => { tLeft--; const el = $('.ttime b', ov); if (el) { el.textContent = fmtTime(tLeft); el.parentElement.classList.toggle('low', tLeft <= 300); } if (tLeft === 300) toast('5 minutes left in this module.'); if (tLeft <= 0) { clearInterval(tick); toast('Time’s up. Module submitted.'); submitModule(); } }, 1000);
    drawQ();
  }
  function saveCur() { if (cur && cur.value) { const v = cur.value(); answers[i] = v === '' ? null : v; } times[i] += (Date.now() - qStart) / 1000; }
  function drawQ() {
    const s = sec(), it = items[i]; qStart = Date.now();
    const modName = `${SECTIONS[s].name} · Module ${T.mod === 'm1' ? 1 : 2}`;
    ov.innerHTML = `<header class="thead"><div class="tmod"><b>${esc(modName)}</b><button type="button" class="linkbtn" id="tdir">Directions</button></div><div class="ttime ${cfg.untimed ? 'off' : ''}">${cfg.untimed ? '<b>Untimed</b>' : `<b ${hideTimer ? 'hidden' : ''}>${fmtTime(tLeft)}</b><button type="button" class="linkbtn" id="thide">${hideTimer ? 'Show' : 'Hide'}</button>`}</div><div class="ttools">${s === 'M' ? `<button type="button" class="tool" id="tcalc" title="Calculator">${icon('calc')}</button><button type="button" class="tool" id="tref" title="Reference">${icon('formula')}</button>` : ''}<button type="button" class="iconbtn" id="tquit" aria-label="Exit test">${icon('x')}</button></div></header>
      <div class="tqbar"><span class="tqn">${i + 1}</span><button type="button" class="tflag ${flags[i] ? 'on' : ''}" id="tflag">${icon('flag')} ${flags[i] ? 'Marked for review' : 'Mark for review'}</button></div>
      <main class="tbody"></main>
      <footer class="tfoot"><button type="button" class="btn ghost" id="tback" ${i === 0 ? 'disabled' : ''}>Back</button><button type="button" class="btn tnav" id="tnav">Question ${i + 1} of ${items.length} ▴</button><button type="button" class="btn primary" id="tnext">${i === items.length - 1 ? 'Review' : 'Next'}</button></footer>`;
    const body = $('.tbody', ov); const wrap = div('screen' + (it.ps ? ' split' : '')); const left = div('sleft'), right = div('sright');
    if (it.ps) { left.innerHTML = `<div class="passage"><div class="paper">${rich(it.ps)}${it.ch ? chartHTML(it.ch) : ''}</div></div>`; wrap.appendChild(left); }
    else { if (it.fig) right.insertAdjacentHTML('beforeend', figHTML(it.fig)); if (it.ch) right.insertAdjacentHTML('beforeend', chartHTML(it.ch)); }
    cur = renderItem(it, { change: () => { }, enter: () => go(1), timers: [] }); right.appendChild(cur.el); wrap.appendChild(right); body.appendChild(wrap);
    if (answers[i] != null) cur.set(answers[i]);
    $('#tback', ov).onclick = () => go(-1); $('#tnext', ov).onclick = () => (i === items.length - 1 ? reviewPage() : go(1)); $('#tnav', ov).onclick = navGrid;
    $('#tflag', ov).onclick = () => { flags[i] = !flags[i]; const b = $('#tflag', ov); b.classList.toggle('on', flags[i]); b.innerHTML = `${icon('flag')} ${flags[i] ? 'Marked for review' : 'Mark for review'}`; };
    $('#tquit', ov).onclick = () => { if (confirm('Exit the test? Your answers in this test will be lost.')) exit(); };
    $('#tdir', ov).onclick = () => sheet(`<h2>Directions</h2>${s === 'RW' ? '<p>The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer based on the passage(s).</p><p>All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.</p>' : '<p>The questions in this section address a number of important math skills. Use of a calculator is permitted for all questions. A reference sheet is available.</p><p>Unless otherwise indicated, all variables and expressions represent real numbers, figures are drawn to scale and lie in a plane, and the domain of a function is all real numbers for which the function is defined.</p><p>For multiple-choice questions, choose the single best answer. For typed-answer questions, enter up to 5 characters (6 for a negative answer); fractions or decimals are fine, mixed numbers are not.</p>'}`);
    const th = $('#thide', ov); if (th) th.onclick = () => { hideTimer = !hideTimer; drawQ2(); };
    if ($('#tcalc', ov)) { $('#tcalc', ov).onclick = () => openCalc(); $('#tref', ov).onclick = () => openReference(); }
  }
  function drawQ2() { saveCur(); drawQ(); }
  function go(d) { saveCur(); const n = i + d; if (n < 0 || n >= items.length) return; i = n; drawQ(); $('.tbody', ov).scrollTop = 0; }
  function gridHTML() { return `<div class="tgrid">${items.map((it, k) => `<button type="button" class="tg ${answers[k] != null ? 'ans' : ''} ${flags[k] ? 'flag' : ''} ${k === i ? 'cur' : ''}" data-q="${k}">${k + 1}${flags[k] ? `<i>${icon('flag')}</i>` : ''}</button>`).join('')}</div><p class="tlegend"><span class="lg cur"></span>Current <span class="lg ans"></span>Answered <span class="lg"></span>Unanswered <span class="lg flag"></span>For review</p>`; }
  function navGrid() { saveCur(); qStart = Date.now(); const close = sheet(`<h2>${esc(SECTIONS[sec()].name)} · Module ${T.mod === 'm1' ? 1 : 2}</h2>${gridHTML()}<div class="mbtns"><button type="button" class="btn" id="tgrev">Go to review page</button></div>`, (m, cl) => { $$('[data-q]', m).forEach(b => b.onclick = () => { cl(); i = +b.dataset.q; drawQ(); }); $('#tgrev', m).onclick = () => { cl(); reviewPage(); }; }); }
  function reviewPage() {
    saveCur(); const un = answers.filter(a => a == null).length, fl = flags.filter(Boolean).length;
    ov.innerHTML = `<header class="thead"><div class="tmod"><b>Check your work</b></div><div class="ttime ${cfg.untimed ? 'off' : ''}">${cfg.untimed ? '<b>Untimed</b>' : `<b>${fmtTime(tLeft)}</b>`}</div><div class="ttools"></div></header><main class="tbody"><div class="screen"><p>On test day you won’t be able to move on to the next module until time expires, but here you can submit early. ${un ? `<b>${plural(un, 'question')} unanswered.</b> There’s no penalty for guessing.` : 'Every question is answered.'} ${fl ? `${plural(fl, 'question')} marked for review.` : ''}</p>${gridHTML()}</div></main><footer class="tfoot"><button type="button" class="btn ghost" id="tback2">Back</button><span></span><button type="button" class="btn primary" id="tsub">Submit module</button></footer>`;
    $$('[data-q]', ov).forEach(b => b.onclick = () => { i = +b.dataset.q; drawQ(); });
    $('#tback2', ov).onclick = () => { i = items.length - 1; drawQ(); };
    $('#tsub', ov).onclick = () => { if (un && !confirm(`Submit with ${plural(un, 'unanswered question')}?`)) return; submitModule(); };
  }
  function submitModule() {
    clearInterval(tick); if (cur && ov.contains(cur.el)) saveCur(); closeCalc();
    const s = sec(); const res = items.map((it, k) => { const a = answers[k]; let ok = false; if (a != null) ok = it.k === 'n' ? checkSPR(a, it).ok : a === it.a; return { ref: it.ref, sk: it.sk, d: it.d || 2, a, ok, s: Math.round(times[k]) }; });
    const R = T.res[s] = T.res[s] || {}; R[T.mod] = res; S.counts.modules++;
    res.forEach((r, k) => { recordAnswer(items[k], r.ok, r.s); rateItem(r.sk, r.d, r.ok ? 1 : 0, 16); if (!r.ok) addMistake(r.ref); });
    if (T.mod === 'm1' && !cfg.single) {
      const ratio = res.reduce((a, r) => a + (r.ok ? DW[r.d] : 0), 0) / weightOf(items); T.route = ratio >= 0.5 ? 'hard' : 'easy'; R.route = T.route; T.mod = 'm2';
      interstitial(`Module 1 complete`, `${res.filter(r => r.ok).length} of ${res.length} correct. Module 2 is ${T.route === 'hard' ? '<b>harder</b>: you did well, and the hard module is the route to top scores' : '<b>easier</b>: aim to get as many right as you can'}.`, 'Start module 2', beginModule);
      save(); return;
    }
    if (T.si < cfg.secs.length - 1) { T.si++; T.mod = 'm1'; T.route = null; save(); if (S.settings.testBreak) return breakScreen(); return interstitial('Section complete', `Next: ${SECTIONS[sec()].name}.`, 'Start', beginModule); }
    finishTest();
  }
  function interstitial(h, p, b, fn) { ov.innerHTML = `<div class="tinter"><div class="bigic">${icon('check')}</div><h2>${h}</h2><p>${p}</p><button type="button" class="btn primary" id="tint">${b}</button></div>`; $('#tint', ov).onclick = fn; }
  function breakScreen() {
    let b = 600; ov.innerHTML = `<div class="tinter"><div class="bigic">${icon('sun')}</div><h2>Take a break</h2><p>On the real test you get 10 minutes between sections. Stand up, stretch, drink some water.</p><b class="bclock">${fmtTime(b)}</b><button type="button" class="btn primary" id="tresume">Resume testing</button></div>`;
    const t2 = setInterval(() => { b--; const el = $('.bclock', ov); if (el) el.textContent = fmtTime(b); if (b <= 0) { clearInterval(t2); go2(); } }, 1000);
    const go2 = () => { clearInterval(t2); beginModule(); }; $('#tresume', ov).onclick = go2;
  }
  function finishTest() {
    const out = { name: cfg.name, test: cfg.id, d: today(), secs: Math.round((Date.now() - T.start) / 1000), detail: {} };
    cfg.secs.forEach(s => {
      const R = T.res[s]; if (!R) return; const M = cfg.mods[s];
      if (cfg.single) { const m1 = R.m1; const w = m1.reduce((a, r) => a + (r.ok ? DW[r.d] : 0), 0) / m1.reduce((a, r) => a + DW[r.d], 0); out.detail[s] = { m1, route: null, m2: [] }; out.mod = { s, pct: Math.round(w * 100), c: m1.filter(r => r.ok).length, n: m1.length }; return; }
      const m2h = moduleItems(M.m2h, s); out[s] = scoreSection(s, R.m1, R.m2, R.route, m2h); out.detail[s] = { m1: R.m1, m2: R.m2, route: R.route };
    });
    if (out.RW != null && out.M != null) out.total = out.RW + out.M;
    if (!cfg.single) { S.tests.push(out); S.counts.tests += cfg.secs.length === 2 ? 1 : 0; }
    addXP(cfg.single ? 30 : 60 * cfg.secs.length); touchStreak(); logScore(); checkAch(); save();
    clearInterval(tick); ov.remove(); document.body.classList.remove('noscroll'); document.removeEventListener('keydown', kb); TESTER = null; render();
    showReport(out, false); if (!cfg.single) confetti();
  }
  const kb = e => { if (!TESTER || document.querySelector('.modal') || document.querySelector('.calc')) return; if (e.target.matches('input, textarea')) return; if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (/^[1-4a-dA-D]$/.test(e.key) && cur && cur.key) cur.key('1234'.includes(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase())); };
  document.addEventListener('keydown', kb);
  beginModule();
}
/* ---------- Score report and answer review ---------- */
function domStats(list) { const by = {}; list.forEach(r => { const d = domOf(r.sk); const o = by[d] || (by[d] = { c: 0, n: 0 }); o.n++; if (r.ok) o.c++; }); return by; }
function showReport(r, fromHistory) {
  const secs = Object.keys(r.detail || {});
  const all = secs.flatMap(s => [...r.detail[s].m1, ...(r.detail[s].m2 || [])]);
  const html = `<div class="treport"><h2>${icon('medal')} ${esc(r.name)}</h2>
    ${r.mod ? `<div class="bsum"><div class="bsumn"><b>${r.mod.c}/${r.mod.n}</b><span>${r.mod.pct}% of the weighted points</span></div><p>A single module doesn’t produce a section score, but every answer counted toward your rating.</p></div>` : `<div class="tscore">${r.total != null ? `<div class="tsbig"><b>${r.total}</b><span>Total score</span></div>` : ''}${secs.map(s => `<div class="tssec sk-${SECTIONS[s].v}"><b>${r[s]}</b><span>${SECTIONS[s].name}</span><small>Module 2: ${r.detail[s].route === 'hard' ? 'harder' : 'easier'}</small></div>`).join('')}</div>`}
    <p class="muted small">${r.d}${r.secs ? ` · ${fmtTime(r.secs)} total` : ''} · Estimated from your answers; not official College Board scoring.</p>
    <h3>By content domain</h3><ul class="domlist">${Object.entries(domStats(all)).map(([d, o]) => `<li class="sk-${SECTIONS[domById(d).sec].v}"><span>${esc(domById(d).name)}</span><span class="skbar"><i style="width:${Math.round(o.c / o.n * 100)}%" class="${o.c / o.n >= 0.8 ? 'hi' : o.c / o.n >= 0.6 ? 'mid' : 'lo'}"></i></span><b>${o.c}/${o.n}</b></li>`).join('')}</ul>
    <h3>Review your answers</h3><div class="seg revf" role="group"><button type="button" class="on" data-rf="wrong">Wrong & skipped (${all.filter(x => !x.ok).length})</button><button type="button" data-rf="all">All (${all.length})</button></div><div class="revlist"></div></div>`;
  sheet(html, m => {
    const list = $('.revlist', m);
    const draw = f => { const rows = []; secs.forEach(s => ['m1', 'm2'].forEach(mod => (r.detail[s][mod] || []).forEach((x, k) => { if (f === 'wrong' && x.ok) return; rows.push({ x, s, mod, k }); }))); list.innerHTML = rows.length ? rows.map(({ x, s, mod, k }, j) => `<details class="revq ${x.ok ? 'ok' : 'no'}" data-j="${j}"><summary><span class="rvn">${SECTIONS[s].short} M${mod === 'm1' ? 1 : 2} · Q${k + 1}</span><span class="rvs">${esc(SKILLS[x.sk].name)}</span><span class="rvt">${x.s ? fmtTime(x.s) : ''}</span>${icon(x.ok ? 'check' : 'x')}</summary><div class="rvbody"></div></details>`).join('') : '<p class="muted">Nothing to review here. Every answer was right!</p>';
      $$('.revq', list).forEach(dq => dq.addEventListener('toggle', () => { if (!dq.open) return; const body = $('.rvbody', dq); if (body.childElementCount) return; const { x } = rows[+dq.dataset.j]; const it = itemFromRef(x.ref); if (!it) { body.textContent = 'This question is no longer available.'; return; } const w = div('revitem'); if (it.ps) w.insertAdjacentHTML('beforeend', `<div class="paper mini">${rich(it.ps)}${it.ch ? chartHTML(it.ch) : ''}</div>`); else { if (it.fig) w.insertAdjacentHTML('beforeend', figHTML(it.fig)); if (it.ch) w.insertAdjacentHTML('beforeend', chartHTML(it.ch)); } const rr = renderItem(it, { change() { }, enter() { }, timers: [] }); w.appendChild(rr.el); if (x.a != null) rr.set(x.a); const res = rr.check(); w.insertAdjacentHTML('beforeend', `<div class="revexp">${x.a == null ? '<p class="muted">You skipped this one.</p>' : ''}${!res.ok ? `<p class="ans">Answer: ${res.answerHTML}</p>` : ''}${it.x ? `<div class="why">${rich(it.x)}</div>` : ''}</div>`); body.appendChild(w); }));
    };
    draw('wrong'); $$('[data-rf]', m).forEach(b => b.onclick = () => { $$('[data-rf]', m).forEach(y => y.classList.toggle('on', y === b)); draw(b.dataset.rf); });
  });
}

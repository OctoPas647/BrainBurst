/* ================= Toolkit: strategies, reference sheets, flashcards ================= */
let STRAT_F = 'all';
function viewToolkit() {
  const list = STRATEGIES.filter(s => STRAT_F === 'all' || s.sec === STRAT_F); const names = { RW: 'Reading & Writing', M: 'Math', X: 'Test day' };
  const wd = cardsDue(), fd = cardsDue('formula');
  return `<header class="vhead"><h1>Toolkit</h1><p class="muted">Reference sheets, a calculator, flashcards and the strategies that win points.</p></header>
  <div class="tools">
    <button type="button" class="tooltile sk-math" data-tool="ref"><span class="mic">${icon('formula')}</span><b>Math reference sheet</b><span>The formulas the SAT gives you</span></button>
    <button type="button" class="tooltile sk-math" data-tool="mem"><span class="mic">${icon('brain')}</span><b>Formulas to memorize</b><span>Not on the reference sheet</span></button>
    <button type="button" class="tooltile sk-verbal" data-tool="gram"><span class="mic">${icon('pen')}</span><b>Grammar rules</b><span>Every Standard English rule tested</span></button>
    <button type="button" class="tooltile sk-math" data-tool="calc"><span class="mic">${icon('calc')}</span><b>Calculator & grapher</b><span>Plus a link to Desmos</span></button>
    <button type="button" class="tooltile sk-verbal" data-tool="cards"><span class="mic">${icon('cards')}</span><b>Word flashcards</b><span>${wd ? `${wd} ready to study` : 'All caught up'}</span></button>
    <button type="button" class="tooltile sk-math" data-tool="fcards"><span class="mic">${icon('formula')}</span><b>Formula flashcards</b><span>${fd ? `${fd} ready to study` : 'All caught up'}</span></button>
    <button type="button" class="tooltile sk-exam" data-tool="day"><span class="mic">${icon('list')}</span><b>Test-day checklist</b><span>What to do the night before and on the day</span></button>
    <button type="button" class="tooltile sk-exam" data-tool="format"><span class="mic">${icon('grid')}</span><b>How the SAT works</b><span>Sections, timing, adaptive modules, scoring</span></button>
  </div>
  <h2 class="psec">Winning strategies</h2>
  <div class="filters" role="group" aria-label="Filter">${[['all', 'All'], ['RW', 'Reading & Writing'], ['M', 'Math'], ['X', 'Test day']].map(([k, n]) => `<button type="button" class="fchip ${STRAT_F === k ? 'on' : ''}" data-sf="${k}">${n}</button>`).join('')}</div>
  <div class="strats">${list.map(s => { const st = S.strat[s.id] || 0; const v = s.sec === 'X' ? 'exam' : SECTIONS[s.sec].v; return `<article class="strat sk-${v}"><header><span class="schip2">${names[s.sec]}</span>${s.drill ? `<span class="stars" aria-label="${st} of 3 stars">${'★'.repeat(st)}<span class="off">${'★'.repeat(3 - st)}</span></span>` : ''}</header><h3>${esc(s.t)}</h3><p>${inlineHTML(s.why)}</p><details><summary>How to do it</summary><ol>${s.steps.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</ol></details>${s.drill ? `<button type="button" class="btn primary small" data-drill="${s.id}">${icon('target')} Practise this</button>` : ''}</article>`; }).join('')}</div>`;
}
BIND.toolkit = () => {
  $$('[data-tool]').forEach(b => b.onclick = () => {
    const t = b.dataset.tool;
    if (t === 'ref') openReference(); else if (t === 'mem') openFormulas(); else if (t === 'gram') openGrammar(); else if (t === 'calc') openCalc(); else if (t === 'cards') startCards(); else if (t === 'fcards') startCards('formula'); else if (t === 'day') openTestDay(); else if (t === 'format') openFormat();
  });
};
function startDrill(id) {
  const s = STRATEGIES.find(x => x.id === id); if (!s || !s.drill) return;
  const items = s.drill.flatMap(([sk, d, n]) => skillItems(sk, n, d));
  const screens = [{ items: [{ k: 'i', p: `**${s.t}**\n\n${s.steps.map((x, i) => `${i + 1}. ${x}`).join('\n')}` }] }, ...items.map(screenOf)];
  play({ title: s.t, badge: 'Strategy drill', screens, mode: 'practice', onClose: render, onDone(sm) { const st = !sm.total ? 3 : sm.acc >= 1 ? 3 : sm.acc >= 0.75 ? 2 : sm.acc >= 0.5 ? 1 : 0; S.strat[id] = Math.max(S.strat[id] || 0, st); quest('strat', 1); return { title: st >= 3 ? 'Strategy mastered' : 'Drill complete', sub: `<span class="bigstars">${'★'.repeat(st)}<span class="off">${'★'.repeat(3 - st)}</span></span>` }; } });
}
/* ---------- Reference sheets ---------- */
function refSheet(title, groups, intro) { sheet(`<div class="refsheet"><h2>${title}</h2>${intro ? `<p class="muted">${intro}</p>` : ''}${groups.map(([g, rows]) => `<h3>${esc(g)}</h3><dl class="reflist">${rows.map(([a, b]) => `<div><dt>${inlineHTML(a)}</dt><dd>${inlineHTML(b)}</dd></div>`).join('')}</dl>`).join('')}</div>`); }
function openReference() {
  const figs = `<div class="reffigs">${[
    ['Circle', { t: 'geo', P: { O: [0, 0], R: [2, 0] }, circ: [{ c: 'O', r: 2 }], seg: [['O', 'R']], side: [['O', 'R', 'r']], dots: ['O'], hide: ['R', 'O'] }, '$A = pi r^2$\n$C = 2pi r$'],
    ['Rectangle', { t: 'geo', P: { A: [0, 0], B: [4, 0], C: [4, 2.4], D: [0, 2.4] }, poly: [['A', 'B', 'C', 'D']], side: [['A', 'B', 'l'], ['B', 'C', 'w']], hide: ['A', 'B', 'C', 'D'] }, '$A = lw$'],
    ['Triangle', { t: 'geo', P: { A: [0, 0], B: [4, 0], C: [1.3, 2.6], D: [1.3, 0] }, poly: [['A', 'B', 'C']], dash: [['C', 'D']], right: [['B', 'D', 'C']], side: [['A', 'B', 'b'], ['C', 'D', 'h']], hide: ['A', 'B', 'C', 'D'] }, '$A = frac{1}{2}bh$'],
    ['Right triangle', { t: 'geo', P: { A: [0, 0], B: [4, 0], C: [4, 3] }, poly: [['A', 'B', 'C']], right: [['A', 'B', 'C']], side: [['A', 'B', 'b'], ['B', 'C', 'a'], ['A', 'C', 'c']], hide: ['A', 'B', 'C'] }, '$c^2 = a^2 + b^2$'],
    ['30°-60°-90°', { t: 'geo', P: { A: [0, 0], B: [3.46, 0], C: [3.46, 2] }, poly: [['A', 'B', 'C']], right: [['A', 'B', 'C']], ang: [['B', 'A', 'C', '30°'], ['A', 'C', 'B', '60°']], side: [['A', 'B', 'x√3'], ['B', 'C', 'x'], ['A', 'C', '2x']], hide: ['A', 'B', 'C'] }, 'Special right triangle'],
    ['45°-45°-90°', { t: 'geo', P: { A: [0, 0], B: [3, 0], C: [3, 3] }, poly: [['A', 'B', 'C']], right: [['A', 'B', 'C']], ang: [['B', 'A', 'C', '45°']], side: [['A', 'B', 's'], ['B', 'C', 's'], ['A', 'C', 's√2']], hide: ['A', 'B', 'C'] }, 'Special right triangle']
  ].map(([n, f, t]) => `<figure class="reffig">${geoSVG(f)}<figcaption><b>${n}</b>${rich(t)}</figcaption></figure>`).join('')}</div>`;
  sheet(`<div class="refsheet"><h2>${icon('formula')} Math reference sheet</h2><p class="muted">The real SAT gives you a sheet like this during the Math section. Know what’s on it so you don’t waste time looking.</p>${figs}<h3>Volume</h3><dl class="reflist">${[['Rectangular box', '$V = lwh$'], ['Cylinder', '$V = pi r^2 h$'], ['Sphere', '$V = frac{4}{3}pi r^3$'], ['Cone', '$V = frac{1}{3}pi r^2 h$'], ['Rectangular pyramid', '$V = frac{1}{3}lwh$']].map(([a, b]) => `<div><dt>${a}</dt><dd>${inlineHTML(b)}</dd></div>`).join('')}</dl><h3>Facts</h3><ul class="rlist"><li>A circle has 360 degrees of arc, which is $2pi$ radians.</li><li>The angles of a triangle add up to 180°.</li></ul></div>`);
}
function openFormulas() { refSheet(`${icon('brain')} Formulas to memorize`, FORMULAS.map(g => [g.g, g.f.map(f => [f[0], f[1]])]), 'These come up all the time but are <b>not</b> on the reference sheet.'); }
function openGrammar() { sheet(`<div class="refsheet"><h2>${icon('pen')} Grammar rules for the SAT</h2><p class="muted">Standard English Conventions questions test a small set of rules. Learn these and you can answer most of them in under 30 seconds.</p>${GRAMMAR.map(g => `<h3>${esc(g.t)}</h3><p>${inlineHTML(g.r)}</p>${g.ex.length ? `<ul class="gex">${g.ex.map(([ok, s]) => `<li class="${ok ? 'gok' : 'gno'}">${icon(ok ? 'check' : 'x')}<span>${inlineHTML(s)}</span></li>`).join('')}</ul>` : ''}`).join('')}</div>`); }
function openTestDay() { sheet(`<div class="refsheet"><h2>${icon('list')} Test-day checklist</h2><p class="muted">Rules can change, so check the latest test-day checklist on the College Board website before your test.</p>${TESTDAY.map(([g, items]) => `<h3>${esc(g)}</h3><ul class="checkl">${items.map(x => `<li><label><input type="checkbox"> <span>${inlineHTML(x)}</span></label></li>`).join('')}</ul>`).join('')}</div>`); }
function openFormat() { sheet(`<div class="refsheet"><h2>${icon('grid')} How the digital SAT works</h2>${SAT_FORMAT.map(([h, p]) => `<h3>${esc(h)}</h3>${rich(p)}`).join('')}</div>`); }
/* ---------- Flashcards with spaced repetition (Leitner boxes) ---------- */
const CARD_GAPS = [0, 1, 2, 4, 8, 16, 32];
const deckCards = deck => (deck === 'formula' ? FORMULAS.flatMap(g => g.f.map(f => ({ id: 'f:' + f[0], front: f[0], back: f[1], note: g.g }))) : VOCAB.map(v => ({ id: 'w:' + v.w, front: v.w, back: v.m, ex: v.ex })));
function cardsDue(deck) { const cards = deckCards(deck); const t = today(); const due = cards.filter(c => S.cards[c.id] && S.cards[c.id].due <= t).length; const newToday = (S.cardsNew && S.cardsNew.d === t ? S.cardsNew[deck || 'w'] || 0 : 0); const unseen = cards.filter(c => !S.cards[c.id]).length; return due + Math.min(unseen, Math.max(0, 8 - newToday)); }
function startCards(deck) {
  const all = deckCards(deck); const t = today(); const key = deck === 'formula' ? 'formula' : 'w';
  if (!S.cardsNew || S.cardsNew.d !== t) S.cardsNew = { d: t };
  const due = shuffle(all.filter(c => S.cards[c.id] && S.cards[c.id].due <= t));
  const fresh = all.filter(c => !S.cards[c.id]).slice(0, Math.max(0, 8 - (S.cardsNew[key] || 0)));
  let queue = due.concat(fresh).slice(0, 20);
  const extra = !queue.length; if (extra) queue = shuffle(all).slice(0, 10);
  let k = 0, flipped = false, knew = 0, seen = 0;
  const o = div('cards'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Flashcards');
  document.body.appendChild(o); document.body.classList.add('noscroll');
  const close = () => { o.remove(); document.body.classList.remove('noscroll'); document.removeEventListener('keydown', kb); save(); render(); };
  const draw = () => {
    if (k >= queue.length) { addXP(seen * 1 + knew); touchStreak(); checkAch(); save(); o.innerHTML = `<div class="cardwrap done"><div class="bigic">${icon('cards')}</div><h2>${extra ? 'Extra practice done' : 'All done for now'}</h2><p>${knew} of ${seen} known. Cards you knew come back later; the rest come back sooner.</p><button type="button" class="btn primary" id="cdone">Finish</button></div>`; $('#cdone', o).onclick = close; return; }
    const c = queue[k]; flipped = false;
    o.innerHTML = `<header class="phead"><button type="button" class="iconbtn cclose" aria-label="Close">${icon('x')}</button><div class="pbar"><i style="width:${k / queue.length * 100}%"></i></div><span class="muted">${k + 1}/${queue.length}</span></header><div class="cardwrap"><button type="button" class="fcard ${deck === 'formula' ? 'sk-math' : 'sk-verbal'}" aria-live="polite"><span class="fside front"><small>${deck === 'formula' ? esc(c.note) : 'What does this word mean?'}</small><b>${inlineHTML(c.front)}</b>${c.ex ? `<em>${inlineHTML(c.ex)}</em>` : ''}<span class="muted small">Tap to flip</span></span><span class="fside back" hidden><small>${inlineHTML(c.front)}</small><b class="fb">${inlineHTML(c.back)}</b>${c.ex ? `<em>${inlineHTML(c.ex)}</em>` : ''}</span></button><div class="cbtns" hidden><button type="button" class="btn" data-k="0">${icon('refresh')} Still learning</button><button type="button" class="btn primary" data-k="1">${icon('check')} Got it</button></div></div>`;
    const card = $('.fcard', o); card.onclick = flip; $('.cclose', o).onclick = close;
    $$('[data-k]', o).forEach(b => b.onclick = () => grade(+b.dataset.k));
  };
  function flip() { if (flipped) return; flipped = true; $('.front', o).hidden = true; $('.back', o).hidden = false; $('.cbtns', o).hidden = false; $('.fcard', o).classList.add('flipped'); }
  function grade(ok) {
    const c = queue[k]; const st = S.cards[c.id]; seen++; S.counts.cards++; quest('cards', 1);
    if (!st) S.cardsNew[key] = (S.cardsNew[key] || 0) + 1;
    if (!extra) { const box = ok ? Math.min(CARD_GAPS.length - 1, (st ? st.b : 0) + 1) : 1; S.cards[c.id] = { b: box, due: dayShift(today(), ok ? CARD_GAPS[box] : 0) }; if (!ok) queue.push(c); }
    if (ok) knew++; k++; draw();
  }
  const kb = e => { if (e.key === 'Escape') close(); else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) flip(); else grade(1); } else if (flipped && (e.key === '1' || e.key === '2')) grade(e.key === '2' ? 1 : 0); };
  document.addEventListener('keydown', kb);
  draw();
}

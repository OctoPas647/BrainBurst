/* ================= Practice modes ================= */
const MODES = [
  { id: 'weak', ic: 'target', t: 'Weak-Spot Drill', d: 'Ten questions aimed at your three weakest skills, picked from your answer history.', tag: 'Rated' },
  { id: 'skill', ic: 'grid', t: 'Skill Drill', d: 'Pick any of the 30 SAT skills and a difficulty. Math questions are generated fresh, so you never run out.', tag: 'Endless math' },
  { id: 'rapid', ic: 'bolt', t: 'Speed Drill', d: 'Answer as many as you can before the clock runs out. Combos multiply your XP.', tag: 'Rated' },
  { id: 'pace', ic: 'clock', t: 'Pacing Trainer', d: 'Ten questions with the real SAT time per question: about 95 seconds for Math and 71 for Reading & Writing.' },
  { id: 'trick', ic: 'eye', t: 'SAT Traps', d: 'Every question hides a classic SAT trap. Progress shows which traps catch you most.', tag: 'Rated in Test mode' },
  { id: 'review', ic: 'refresh', t: 'Mistake Review', d: 'Questions you got wrong come back after 1, 3 and 7 days until they stick.' },
  { id: 'chal', ic: 'sparkle', t: 'Daily Challenge', d: 'One hard question a day. Solve it for 30 gems and keep your challenge streak alive.' },
  { id: 'bm', ic: 'bookmark', t: 'Bookmarks', d: 'Questions you bookmarked with the bookmark button during practice.' },
  { id: 'cards', ic: 'cards', t: 'Word Flashcards', d: 'High-value SAT vocabulary with example sentences, scheduled with spaced repetition.' },
  { id: 'fcards', ic: 'formula', t: 'Formula Flashcards', d: 'Every formula you should know by heart, including the ones not on the reference sheet.' },
  { id: 'match', ic: 'shuffle', t: 'Word Match', d: 'Match SAT words to their meanings against your own mistakes.' }
];
function modeTag(m) {
  if (m.id === 'review') { const d = dueMistakes().length; return `<em>${d} due · ${S.mist.length} saved</em>`; }
  if (m.id === 'bm') return `<em>${S.bm.length} saved</em>`;
  if (m.id === 'chal') return `<em>${S.chal.d === today() ? (S.chal.ok ? 'Solved today' : 'Done today') : 'Ready'}${S.chal.streak ? ` · ${S.chal.streak}🔥` : ''}</em>`;
  if (m.id === 'cards') return `<em>${cardsDue()} due</em>`;
  if (m.id === 'rapid' && Object.keys(S.best).length) return `<em>Best ${Math.max(...Object.values(S.best))}</em>`;
  return m.tag ? `<em>${m.tag}</em>` : '';
}
function viewPractice() { return `<header class="vhead"><h1>Practice</h1><p class="muted">Targeted drills built on the real SAT question types.</p></header><div class="modes">${MODES.map(m => { const off = (m.id === 'review' && !S.mist.length) || (m.id === 'bm' && !S.bm.length); return `<button type="button" class="mode ${off ? 'off' : ''}" data-mode="${m.id}" ${off ? 'aria-disabled="true"' : ''}><span class="mic">${icon(m.ic)}</span><span class="mt"><b>${m.t}</b>${modeTag(m)}</span><span class="md">${m.d}</span></button>`; }).join('')}</div>`; }
BIND.practice = () => { };
const secPicker = (id, val = '') => `<label class="fld">Section<select id="${id}"><option value="" ${!val ? 'selected' : ''}>Both sections</option><option value="M" ${val === 'M' ? 'selected' : ''}>Math</option><option value="RW" ${val === 'RW' ? 'selected' : ''}>Reading & Writing</option></select></label>`;
function startWeak(sec) {
  if (sec == null || sec === 'pick') return sheet(`<h2>${icon('target')} Weak-Spot Drill</h2><p class="muted">Your weakest skills right now: ${weakSkills(null, 3).map(sk => `<b>${esc(SKILLS[sk].name)}</b>`).join(', ')}.</p>${secPicker('wsec')}<div class="mbtns"><button type="button" class="btn primary" id="wgo">Start</button></div>`, (m, close) => $('#wgo', m).onclick = () => { const v = $('#wsec', m).value; close(); startWeak(v || ''); });
  const items = weakItems(10, sec || null);
  play({ title: 'Weak-Spot Drill', badge: sec ? SECTIONS[sec].short : 'Mixed', screens: items.map(screenOf), mode: 'test', rated: true, onClose: render, onDone: sm => ({ title: 'Drill complete', sub: `${sm.correct}/${sm.total} correct on your weak spots`, bonus: 10 }) });
}
function startSkillDrill() {
  const opts = SEC2.map(sec => `<optgroup label="${SECTIONS[sec].name}">${skillsOf(sec).map(sk => `<option value="${sk}">${esc(SKILLS[sk].name)}</option>`).join('')}</optgroup>`).join('');
  sheet(`<h2>${icon('grid')} Skill Drill</h2><label class="fld">Skill<select id="dsk">${opts}</select></label><label class="fld">Difficulty<select id="dd"><option value="0">Mixed</option><option value="1">1 · Foundations</option><option value="2">2 · Core</option><option value="3">3 · Challenge</option></select></label><label class="fld">Questions<select id="dn"><option>5</option><option selected>10</option><option>20</option><option value="999">Endless (math only)</option></select></label><div class="mbtns"><button type="button" class="btn" data-g="practice">${icon('infinity')} Practice</button><button type="button" class="btn primary" data-g="test">${icon('target')} Rated</button></div>`, (m, close) => $$('[data-g]', m).forEach(b => b.onclick = () => {
    const sk = $('#dsk', m).value, d = +$('#dd', m).value || null, n = +$('#dn', m).value, rated = b.dataset.g === 'test'; close();
    const math = secOf(sk) === 'M';
    if (n === 999 && math) return play({ title: SKILLS[sk].name, badge: 'Endless', next: () => screenOf(genItem(sk, d || pick([1, 2, 2, 3]), newSeed())), mode: rated ? 'test' : 'practice', rated, onClose: render, onDone: sm => ({ title: 'Drill done', sub: `${sm.correct}/${sm.total} correct` }) });
    const items = skillItems(sk, Math.min(n, 999), d, { fresh: true });
    if (!items.length) return toast('No questions for that combination yet.');
    play({ title: SKILLS[sk].name, badge: 'Skill drill', screens: items.map(screenOf), mode: rated ? 'test' : 'practice', rated, onClose: render, onDone: sm => ({ title: 'Drill done', sub: `${sm.correct}/${sm.total} correct${!math && items.length < n ? ` · that’s every ${SKILLS[sk].name} question at this level` : ''}` }) });
  }));
}
function startMode(id) {
  if (id === 'weak') return startWeak('pick');
  if (id === 'skill') return startSkillDrill();
  if (id === 'chal') return startChallenge();
  if (id === 'cards') return startCards();
  if (id === 'fcards') return startCards('formula');
  if (id === 'rapid') return sheet(`<h2>${icon('bolt')} Speed Drill</h2><label class="fld">Time<select id="rlen">${[60, 120, 180, 300].map(s => `<option value="${s}" ${s === S.settings.rapidLen ? 'selected' : ''}>${s / 60} min</option>`).join('')}</select></label>${secPicker('rsec', 'M')}<div class="mbtns"><button type="button" class="btn primary" id="rgo">Start</button></div>`, (m, close) => $('#rgo', m).onclick = () => { const len = +$('#rlen', m).value, sec = $('#rsec', m).value; close(); const key = len + (sec || 'X'); play({ title: 'Speed Drill', badge: `${len / 60} min · ${sec ? SECTIONS[sec].short : 'Mixed'}`, timer: len, next: () => { const s = sec || pick(SEC2); const sk = s === 'M' ? pick(['lin1', 'linf', 'lin2', 'sys', 'ineq', 'eqv', 'nleq', 'nlf', 'rat', 'pct', 'one', 'area', 'lat', 'trig', 'circ']) : pick(['bnd', 'fss', 'trn', 'wic']); const [it] = skillItems(sk, 1, pick([1, 1, 2])); return it ? screenOf(it) : screenOf(genItem('lin1', 1, newSeed())); }, rated: true, K: 8, onClose: render, onDone(sm) { const prev = S.best[key] || 0; if (sm.correct > prev) S.best[key] = sm.correct; quest('rapid', sm.correct, true); return { title: sm.correct > prev ? 'New best!' : 'Time!', sub: `${sm.correct} correct · best streak ${sm.best} · best score ${Math.max(prev, sm.correct)}` }; } }); });
  if (id === 'pace') return sheet(`<h2>${icon('clock')} Pacing Trainer</h2><p class="muted">The real SAT gives you about <b>95 seconds</b> per Math question and <b>71 seconds</b> per Reading & Writing question. A clock shows how you’re doing on each one.</p>${secPicker('psec', 'RW')}<div class="mbtns"><button type="button" class="btn primary" id="pgo">Start</button></div>`, (m, close) => $('#pgo', m).onclick = () => { const sec = $('#psec', m).value; close(); const items = mixedItems(10, sec || null); play({ title: 'Pacing Trainer', badge: sec ? SECTIONS[sec].short : 'Mixed', screens: items.map(screenOf), mode: 'practice', pace: true, onClose: render, onDone: sm => paceReport(sm) }); });
  if (id === 'trick') return sheet(`<h2>${icon('eye')} SAT Traps</h2><p>${TRICKS.length} questions, each built around a classic SAT trap. After each one you’ll see which trap it was.</p><label class="fld">Questions<select id="tn"><option value="10">10</option><option value="20">20</option><option value="${TRICKS.length}">All ${TRICKS.length}</option></select></label><div class="mbtns"><button type="button" class="btn" data-g="practice">${icon('infinity')} Practice</button><button type="button" class="btn primary" data-g="test">${icon('heart')} Test · ${S.settings.trickHearts} hearts</button></div>`, (m, close) => $$('[data-g]', m).forEach(b => b.onclick = () => { const n = +$('#tn', m).value, test = b.dataset.g === 'test'; close(); play({ title: 'SAT Traps', badge: test ? 'Test' : 'Practice', screens: shuffle(TRICKS).slice(0, n).map(t => screenOf({ ...t, ref: 'b:' + t.id })), mode: test ? 'test' : 'practice', rated: test, hearts: test ? S.settings.trickHearts : null, onOut: true, onClose: render, onDone: sm => ({ title: sm.failed ? 'Caught by the traps' : 'Traps survived', sub: `${sm.correct}/${sm.total} traps spotted` }) }); }));
  if (id === 'review') { const due = dueMistakes(); if (!S.mist.length) return toast('No mistakes saved yet. Nice.'); const list = due.length ? due : S.mist.slice().sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 10); const sc = shuffle(list).slice(0, 15).map(m => screenFromRef(m.r)).filter(Boolean); return play({ title: 'Mistake Review', badge: due.length ? `${due.length} due` : 'Early review', screens: sc, mode: 'practice', review: true, onClose: render, onDone: sm => ({ title: 'Review done', sub: `${sm.correct} answered correctly · ${dueMistakes().length} still due today` }) }); }
  if (id === 'bm') { if (!S.bm.length) return toast('No bookmarks yet. Tap the bookmark icon during a question to save it.'); const sc = S.bm.slice().reverse().map(screenFromRef).filter(Boolean); return play({ title: 'Bookmarks', badge: `${sc.length} saved`, screens: sc, mode: 'practice', onClose: render, onDone: sm => ({ title: 'Bookmarks reviewed', sub: `${sm.correct}/${sm.total} correct. Remove a bookmark by tapping its icon again.` }) }); }
  if (id === 'match') return play({ title: 'Word Match', badge: 'Vocabulary', screens: Array.from({ length: 4 }, () => screenOf({ k: 'pairs', sk: 'wic', p: 'Match each word with its meaning.', pairs: shuffle(VOCAB).slice(0, 5).map(v => [v.w, v.m]) })), mode: 'practice', onClose: render, onDone: sm => ({ title: 'Match complete', sub: `${sm.correct}/${sm.total} rounds with at most one slip` }) });
}
function paceReport(sm) {
  const t = sm.times; if (!t.length) return { title: 'Pacing done' };
  const tgt = x => (secOf(x.sk) === 'M' ? 95 : 71); const onPace = t.filter(x => x.s <= tgt(x)).length; const tot = t.reduce((a, x) => a + x.s, 0), budget = t.reduce((a, x) => a + tgt(x), 0);
  return { title: onPace === t.length ? 'Right on pace' : 'Pacing report', sub: `${onPace}/${t.length} questions within target · ${fmtTime(tot)} used of ${fmtTime(budget)}`, html: `<ul class="pacelist">${t.map((x, i) => `<li class="${x.ok ? 'ok' : 'no'}"><span>Q${i + 1} · ${esc(SKILLS[x.sk].name)}</span><span class="pbar2"><i style="width:${Math.min(100, x.s / tgt(x) * 100)}%" class="${x.s > tgt(x) ? 'slow' : ''}"></i></span><b>${fmtTime(x.s)}</b></li>`).join('')}</ul><p class="muted small">Green = correct. A bar past the end means you went over the target time.</p>` };
}
/* ---------- Daily challenge ---------- */
function challengeItem(d) {
  const seed = d.split('-').reduce((a, b) => a * 37 + +b, 11); const r = RNG(seed);
  if (seed % 2) { const sk = r.pick(['lin1', 'linf', 'sys', 'eqv', 'nleq', 'nlf', 'pct', 'prob', 'lat', 'trig', 'circ', 'ineq']); return genItem(sk, 3, seed); }
  const pool = RWBANK.filter(q => !q.test && q.d === 3); if (!pool.length) return genItem('nlf', 3, seed);
  const q = pool[seed % pool.length]; return Object.assign({}, q, { ref: 'b:' + q.id });
}
function startChallenge() {
  if (S.chal.d === today()) return toast(S.chal.ok ? 'Already solved today. A new challenge arrives tomorrow.' : 'You’ve had today’s attempt. A new challenge arrives tomorrow.');
  const it = challengeItem(today());
  play({ title: 'Daily Challenge', badge: today(), screens: [screenOf(it)], mode: 'test', rated: true, noSkip: true, onClose: render, onDone(sm) {
    const ok = sm.correct === 1; const y = dayShift(today(), -1); S.chal.streak = ok ? (S.chal.last === y ? S.chal.streak + 1 : 1) : 0; if (ok) { S.chal.last = today(); S.gems += 30; S.counts.chal++; } S.chal.d = today(); S.chal.ok = ok; quest('chal', ok ? 1 : 0);
    return { title: ok ? 'Challenge solved!' : 'Not this time', sub: ok ? `+30 gems · challenge streak ${S.chal.streak}` : 'Read the explanation. It’ll come back in Mistake Review.', bonus: ok ? 15 : 0 };
  } });
}

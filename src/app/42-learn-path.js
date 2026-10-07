/* ================= Learn ================= */
const OFFS = [0, 46, 72, 46, 0, -46, -72, -46];
const DLAB = { 1: 'Foundations', 2: 'Core', 3: 'Challenge' };
function lessonOpen(ls) {
  if (S.settings.unlockAll) return true;
  const sameSkill = ls.unit.lessons.filter(l => l.sk === ls.sk); const k = sameSkill.indexOf(ls);
  return k <= 0 || !!S.done[sameSkill[k - 1].id];
}
function recommend(sec) {
  const order = weakSkills(sec, 40);
  for (const sk of order) { const ls = LESSONS.find(l => l.sk === sk && !S.done[l.id] && lessonOpen(l)); if (ls) return ls; }
  return LESSONS.find(l => (!sec || l.sec === sec) && !S.done[l.id] && lessonOpen(l)) || null;
}
const lessonQCount = ls => ls.items.length;
function viewLearn() {
  const sec = S.settings.sec || 'M'; const SECI = SECTIONS[sec];
  const mine = LESSONS.filter(l => l.sec === sec); const done = mine.filter(l => S.done[l.id]).length; const rec = recommend(sec); const cur = rec && rec.id;
  let h = `<section class="course sk-${SECI.v}"><div class="ctop"><div><h1>Your path to ${S.settings.target}</h1><p class="muted">${done} of ${mine.length} ${SECI.name} lessons complete</p></div><div class="seg secseg" role="group" aria-label="Section">${SEC2.map(s => `<button type="button" data-setsec="${s}" class="${s === sec ? 'on' : ''}">${icon(SECTIONS[s].ic)} ${SECTIONS[s].short}</button>`).join('')}</div></div>
    <div class="bar big" role="progressbar" aria-valuenow="${Math.round(done / mine.length * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${done / mine.length * 100}%"></i></div>
    <div class="ctop2"><div class="seg" role="group" aria-label="Default lesson mode"><button type="button" data-setmode="practice" class="${S.settings.mode === 'practice' ? 'on' : ''}">${icon('infinity')} Practice</button><button type="button" data-setmode="test" class="${S.settings.mode === 'test' ? 'on' : ''}">${icon('heart')} Test</button></div><p class="muted small">${S.settings.mode === 'practice' ? 'Practice: unlimited mistakes, unrated.' : 'Test: hearts, rated, and your answers move your predicted score.'}</p></div>
    ${rec ? `<button type="button" class="btn primary wide" data-lesson="${rec.id}">${icon('play')} Continue: ${esc(rec.t)} <span class="muted-on">· ${esc(SKILLS[rec.sk].name)}</span></button>` : `<p class="muted">Every ${SECI.name} lesson is done. Try a practice test!</p>`}</section><div class="today-inline">${railHTML()}</div>`;
  for (const u of UNITS.filter(x => x.sec === sec)) {
    const prog = unitProgress(u); const dom = domById(u.dom);
    h += `<section class="level sk-${SECI.v}" id="u-${u.id}"><header class="lvhead"><div class="lvband" aria-hidden="true">${icon(SECI.ic)}</div><div class="lvtext"><h2>${esc(u.name)}</h2><p>${esc(dom.d)} <span class="muted">· ${esc(dom.share)} of the section</span></p><div class="bar"><i style="width:${prog * 100}%"></i></div></div></header><div class="path">`;
    let k = 0, lastSk = null;
    u.lessons.forEach(ls => {
      if (ls.sk !== lastSk) { h += `<div class="unit sk-${SECI.v}">${esc(SKILLS[ls.sk].name)}</div>`; lastSk = ls.sk; }
      const d = S.done[ls.id], o = lessonOpen(ls); const st = d ? (d.test ? 'gold' : 'done') : o ? 'open' : 'locked'; const isCur = ls.id === cur;
      h += `<div class="nw" style="--x:${OFFS[k++ % 8]}px">${isCur ? '<span class="start">Start</span>' : ''}<button type="button" class="node sk-${SECI.v} ${st} ${isCur ? 'cur' : ''} ${ls.id === JUST ? 'just' : ''}" data-lesson="${ls.id}" aria-label="${esc(ls.t)}${d ? ', complete' : o ? '' : ', locked'}">${icon(st === 'locked' ? 'lock' : d ? (d.test ? 'trophy' : 'check') : SECI.ic)}</button><span class="nlab">${esc(ls.t)}</span>${d ? `<span class="stars" aria-label="${d.s} stars">${'★'.repeat(d.s)}<span class="off">${'★'.repeat(3 - d.s)}</span></span>` : ''}</div>`;
    });
    h += `</div></section>`;
  }
  return h;
}
function lessonSheet(id) {
  const ls = lessonById(id); if (!ls) return; const d = S.done[id]; regenHearts();
  if (!lessonOpen(ls)) { toast('Finish the previous lesson in this skill first (or turn on “Unlock every lesson” in Customize).'); return; }
  const SECI = SECTIONS[ls.sec];
  sheet(`<div class="lsheet sk-${SECI.v}"><div class="lsic">${icon(SECI.ic)}</div><p class="eyebrow">${esc(ls.unit.name)} · ${esc(SKILLS[ls.sk].name)} · ${DLAB[ls.d] || 'Core'}</p><h2>${esc(ls.t)}</h2><p>${inlineHTML(ls.tip || '')}</p><p class="muted small">${plural(lessonQCount(ls), 'question')}${ls.sec === 'M' ? ' · new numbers every time you play' : ''}${d ? ` · best ${'★'.repeat(d.s)}${d.test ? ' · test passed' : ''}` : ''}</p><div class="mbtns"><button type="button" class="btn ${S.settings.mode === 'practice' ? 'primary' : ''}" data-go="practice">${icon('infinity')} Practice</button><button type="button" class="btn ${S.settings.mode === 'test' ? 'primary' : ''}" data-go="test" ${S.hearts.n <= 0 ? 'disabled' : ''}>${icon('heart')} Test · ${S.hearts.n} hearts</button></div>${S.hearts.n <= 0 ? `<p class="muted small">No hearts left. Next heart in ${fmtTime(nextHeartIn() / 1000)}, or refill in the shop.</p>` : ''}</div>`, (m, close) => $$('[data-go]', m).forEach(b => b.onclick = () => { close(); startLesson(id, b.dataset.go); }));
}
function startLesson(id, mode) {
  const ls = lessonById(id); const test = mode === 'test'; regenHearts(); if (test && S.hearts.n <= 0) { toast('You are out of hearts.'); return; }
  maybeBrief(ls);
  play({ title: ls.t, badge: `${SECTIONS[ls.sec].short} · ${SKILLS[ls.sk].name}`, screens: screensForLesson(ls), mode, rated: test, hearts: test ? 'global' : null, onClose: render,
    onDone(sm) {
      const stars = !sm.total ? 3 : sm.acc >= 1 ? 3 : sm.acc >= 0.8 ? 2 : sm.acc >= 0.6 ? 1 : 0; const prev = S.done[id];
      if (test && sm.failed) return { title: 'Out of hearts', sub: 'Review the explanations, then try again.' };
      if (stars > 0) { JUST = id; S.done[id] = { s: Math.max(stars, prev ? prev.s : 0), test: !!((prev && prev.test) || (test && !sm.failed)), n: (prev ? prev.n : 0) + 1 }; S.counts.lessons++; quest('lessons', 1); if (sm.total && sm.acc === 1) quest('perfect', 1); }
      if (!test) { regenHearts(); S.hearts.n = Math.min(S.settings.heartsMax, S.hearts.n + 1); }
      return { bonus: stars ? (test ? 15 : 10) + (sm.acc === 1 ? 5 : 0) : 0, title: stars ? (test ? 'Test passed!' : 'Lesson complete!') : 'Almost there', sub: stars ? `<span class="bigstars">${'★'.repeat(stars)}<span class="off">${'★'.repeat(3 - stars)}</span></span>${!test ? '<br>+1 heart for practising' : ''}` : 'Score 60% or more to complete the lesson.' };
    } });
}
BIND.learn = () => { const c = $('.node.cur'); if (c && !BIND._scrolled) { BIND._scrolled = true; setTimeout(() => c.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' }), 120); } };

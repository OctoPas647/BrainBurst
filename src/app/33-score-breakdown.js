/* ---------- Score breakdown: why is it this, and how to raise it ---------- */
function skillRowHTML(sk) {
  const st = S.sk[sk] || { a: 0, k: 0, t: 0 }; const acc = st.a ? Math.round(st.k / st.a * 100) : null;
  return `<li class="skrow"><span class="skn">${esc(SKILLS[sk].name)}</span><span class="skbar"><i style="width:${acc ?? 0}%" class="${acc == null ? '' : acc >= 80 ? 'hi' : acc >= 60 ? 'mid' : 'lo'}"></i></span><b>${acc == null ? '–' : acc + '%'}</b><span class="muted small">${st.a ? `${st.a} · ${fmtTime(st.t / st.a)}` : 'new'}</span></li>`;
}
function nextStepSec(sec, p) {
  const s = p[sec].s; if (s == null) return 'No evidence yet. Do a few Test-mode lessons or a timed module to get an estimate.';
  if (s >= 800) return 'That’s a perfect section score. Keep it there with timed practice.';
  const target = Math.min(800, s + 50), Rt = Math.ceil(ratingForScore(target)), dR = Math.max(1, Rt - S.rating[sec]);
  return `To reach about ${target}, raise your ${SECTIONS[sec].short} rating to ${Rt} (+${dR}). Correct answers on hard (level 3) questions in Test mode move it fastest.`;
}
function raiseActions(sec) {
  const acts = []; const ws = weakSkills(sec, 3);
  ws.forEach(sk => { const ls = LESSONS.find(l => l.sk === sk && !S.done[l.id] && lessonOpen(l)) || LESSONS.find(l => l.sk === sk); if (ls) acts.push({ ic: SECTIONS[sec].ic, t: `${SKILLS[sk].name}: ${ls.t}`, d: S.done[ls.id] ? 'Redo it in Test mode for rating.' : 'Your weakest area right now. Start here.', go: `L:${ls.id}` }); });
  acts.push({ ic: 'target', t: 'Weak-Spot Drill', d: `10 questions from your three weakest ${SECTIONS[sec].short} skills.`, go: `W:${sec}` });
  const due = dueMistakes().filter(m => secOf((itemFromRef(m.r) || {}).sk || 'lin1') === sec).length;
  if (due) acts.push({ ic: 'refresh', t: `Mistake Review (${due} due)`, d: 'Questions you missed, spaced out until they stick.', go: 'M:review' });
  acts.push({ ic: 'clock', t: 'Take a timed module', d: 'Real test conditions give the strongest evidence for your score.', go: 'T:tests' });
  return acts;
}
function openScore(focus) {
  const p = predict(); const tgt = S.settings.target; const weakSec = (p.RW.s ?? 0) <= (p.M.s ?? 0) ? 'RW' : 'M';
  const secHTML = SEC2.map(sec => {
    const ps = p[sec]; const tw = ps.parts.reduce((a, x) => a + x.w, 0);
    return `<details class="bsk sk-${SECTIONS[sec].v}" ${(focus ? sec === focus : sec === weakSec) ? 'open' : ''}><summary><span class="bskic">${icon(SECTIONS[sec].ic)}</span><span class="bskn">${SECTIONS[sec].name}</span><b>${fmtScore(ps.s)}</b><span class="conf">${'●'.repeat(ps.conf || 0)}<span class="off">${'●'.repeat(3 - (ps.conf || 0))}</span></span></summary>
      ${ps.parts.length ? `<ul class="bwhy">${ps.parts.map(x => `<li><span>${esc(x.t)}</span><b>${Math.round(x.s)}</b><i style="width:${Math.round(x.w / tw * 100)}%"></i></li>`).join('')}</ul><p class="small muted">Bars show how much each source counts. Practice tests count most.</p>` : '<p class="muted">No evidence yet.</p>'}
      <p class="bnext">${icon('target')} ${nextStepSec(sec, p)}</p>
      <h4>Skills, weakest first</h4><ul class="sklist">${weakSkills(sec, 20).map(skillRowHTML).join('')}</ul>
      <div class="bacts">${raiseActions(sec).map(a => `<button type="button" class="bact" data-bgo="${a.go}"><span class="baic">${icon(a.ic)}</span><span><b>${esc(a.t)}</b><span>${esc(a.d)}</span></span>${icon('arrowr')}</button>`).join('')}</div></details>`;
  }).join('');
  const total = p.total;
  sheet(`<div class="bandsheet"><h2>${icon('target')} Your predicted score</h2>
    <div class="bsum"><div class="bsumn"><b>${fmtScore(total ?? p.partial)}</b><span>${total != null ? 'out of 1600' : p.partial != null ? 'one section so far' : 'No estimate yet'}</span></div>
    <p>${total != null ? `Reading & Writing ${p.RW.s} + Math ${p.M.s}. Each section is scored from 200 to 800.` : 'Answer rated questions (Test mode, Speed Drills, timed modules or practice tests) in both sections to get a full estimate.'} Estimates are based on your answers in BrainBurst, not official College Board scoring.</p></div>
    ${total != null ? `<p class="muted small">Target ${tgt} · ${total >= tgt ? 'reached!' : `${tgt - total} points to go`}</p>` : ''}
    <h3>Sections</h3>${secHTML}</div>`, (m, close) => {
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-bgo]'); if (!b) return; e.stopPropagation(); const [kind, id] = b.dataset.bgo.split(':'); close();
      if (kind === 'L') { regenHearts(); startLesson(id, S.hearts.n > 0 ? 'test' : 'practice'); if (S.hearts.n <= 0) toast('No hearts, so this run is in Practice mode.'); }
      else if (kind === 'M') startMode(id); else if (kind === 'W') startWeak(id); else if (kind === 'T') { TAB = id; render(); window.scrollTo(0, 0); }
    });
  });
}
document.addEventListener('click', e => { const t = e.target.closest('[data-score]'); if (!t || t.closest('.player') || t.closest('.modal')) return; e.preventDefault(); e.stopPropagation(); openScore(t.dataset.score || null); }, true);

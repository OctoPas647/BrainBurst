/* ================= Shell ================= */
const TABS = [['learn', 'path', 'Learn'], ['practice', 'bolt', 'Practice'], ['tests', 'clock', 'Tests'], ['toolkit', 'bulb', 'Toolkit'], ['stats', 'chart', 'Progress'], ['profile', 'user', 'Profile'], ['custom', 'palette', 'Customize']];
let TAB = 'learn';
function navHTML() { return TABS.map(([id, ic, n]) => `<button type="button" class="navb ${TAB === id ? 'on' : ''}" data-tab="${id}" ${TAB === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${n}</span></button>`).join(''); }
function chipsHTML() { regenHearts(); const p = predict(); const nh = nextHeartIn(); return `<span class="schip streak" title="Day streak">${icon('flame')}<b>${S.streak.n}</b></span><span class="schip gems" title="Gems">${icon('gem')}<b>${S.gems}</b></span><span class="schip hearts" title="${nh ? 'Next heart in ' + fmtTime(nh / 1000) : 'Hearts full'}">${icon('heart')}<b>${S.hearts.n}</b></span><button type="button" class="schip band" data-score="" title="Predicted SAT score">SAT <b>${fmtScore(p.total ?? p.partial)}</b></button>`; }
/* What to do today: a short plan built from your weak spots, mistakes and test date */
function todayPlan() {
  const out = []; const dE = daysToExam();
  out.push({ ic: 'sparkle', t: 'Daily challenge', d: S.chal.d === today() ? (S.chal.ok ? 'Solved. See you tomorrow!' : 'Attempted. A new one arrives tomorrow.') : 'One hard question. Bonus gems if you solve it.', go: 'C:', done: S.chal.d === today() });
  const due = dueMistakes().length; if (due) out.push({ ic: 'refresh', t: `Review ${plural(due, 'mistake')}`, d: 'Spaced review makes them stick.', go: 'M:review' });
  const rec = recommend(); if (rec) out.push({ ic: SECTIONS[rec.sec].ic, t: rec.t, d: `${SKILLS[rec.sk].name} · next lesson`, go: `L:${rec.id}` });
  const lastMod = S.tests.length ? S.tests[S.tests.length - 1].d : null; const daysSince = lastMod ? Math.round((new Date(today()) - new Date(lastMod)) / 86400000) : 99;
  if (dE != null && dE >= 0 && dE <= 30 && daysSince >= 5) out.push({ ic: 'clock', t: 'Take a timed practice module', d: `${plural(dE, 'day')} to go. Practise under real timing.`, go: 'T:tests' });
  else if (S.st.a >= 15) { const ws = weakSkills(null, 1)[0]; out.push({ ic: 'target', t: 'Weak-spot drill', d: `Focus: ${SKILLS[ws].name}`, go: `W:${secOf(ws)}` }); }
  const cd = cardsDue(); if (cd) out.push({ ic: 'cards', t: `Study ${plural(cd, 'word card')}`, d: 'Words in context flashcards.', go: 'F:' });
  return out.slice(0, 5);
}
function railHTML() {
  dayRoll(); const p = predict(); const goal = S.settings.dailyGoal; const dx = S.daily.xp; const tgt = S.settings.target; const dE = daysToExam();
  const tot = p.total ?? null;
  const qs = S.quests.list.map(id => { const q = QUESTS.find(x => x.id === id); const v = Math.min(q.g, S.quests.p[id] || 0); return `<li class="${v >= q.g ? 'qdone' : ''}"><span>${esc(q.t)}</span><div class="bar sm"><i style="width:${v / q.g * 100}%"></i></div></li>`; }).join('');
  const R = overallRating();
  return `<section class="card bandcard" data-score="" role="button" tabindex="0" title="Why this score, and how to raise it"><h3>Predicted SAT score</h3><div class="bandbig"><b>${fmtScore(tot ?? p.partial)}</b><span>${tot == null ? (p.partial != null ? 'One section so far' : 'Answer rated questions to get an estimate') : 'out of 1600'}</span></div><div class="skbands">${SEC2.map(sec => `<div class="skb sk-${SECTIONS[sec].v}"><span>${icon(SECTIONS[sec].ic)}</span><b>${fmtScore(p[sec].s)}</b></div>`).join('')}</div><p class="muted small">Target ${tgt}${tot != null ? ` · ${tot >= tgt ? 'on target' : `${tgt - tot} to go`}` : ''}${dE != null && dE >= 0 ? ` · SAT in ${plural(dE, 'day')}` : ''}</p></section>
  <section class="card plan"><h3>Today’s plan</h3><ul class="planl">${todayPlan().map(x => `<li><button type="button" class="planb ${x.done ? 'pdone' : ''}" data-plan="${x.go}"><span class="pic">${icon(x.done ? 'check' : x.ic)}</span><span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></button></li>`).join('')}</ul>${dE == null ? '<p class="muted small"><button type="button" class="linkbtn" data-tab="profile">Add your SAT date</button> for a countdown and a sharper plan.</p>' : ''}</section>
  <section class="card"><h3>Daily goal</h3><div class="goal"><div class="ring sm" style="--p:${Math.min(100, Math.round(dx / goal * 100))}"><b>${dx}</b></div><span>${dx} / ${goal} XP today</span></div></section>
  <section class="card"><h3>Today's quests</h3><ul class="quests">${qs}</ul></section>
  <section class="card"><h3>Rating</h3><div class="rating"><b>${R}</b><span class="tier">${tierOf(R)}</span></div><p class="muted small">${S.games.RW + S.games.M} rated answers. Test mode, drills, modules and practice tests are rated.</p></section>
  <section class="card shop"><h3>Shop</h3><button type="button" class="btn small" data-act="refill" ${S.gems < 50 || S.hearts.n >= S.settings.heartsMax ? 'disabled' : ''}>${icon('heart')} Refill hearts · 50</button><button type="button" class="btn small" data-act="freeze" ${S.gems < 100 ? 'disabled' : ''}>${icon('flame')} Streak freeze · 100 <span class="muted">(${S.streak.freeze} owned)</span></button></section>`;
}
function render() {
  applyTheme(); dayRoll();
  $('#side').innerHTML = `<div class="brand"><span class="logo" aria-hidden="true">${icon('brain')}</span><span>BrainBurst</span></div>${navHTML()}`;
  $('#bottomnav').innerHTML = navHTML();
  $('#topchips').innerHTML = chipsHTML();
  $('#rail').innerHTML = railHTML();
  const views = { learn: viewLearn, practice: viewPractice, tests: viewTests, toolkit: viewToolkit, stats: viewStats, profile: viewProfile, custom: viewCustom };
  $('#main').innerHTML = (views[TAB] || viewLearn)();
  (BIND[TAB] || (() => { }))();
  const mainEl = $('#main'); if (TAB !== LAST_TAB) { mainEl.classList.remove('enter'); void mainEl.offsetWidth; mainEl.classList.add('enter'); LAST_TAB = TAB; }
  if (JUST && TAB === 'learn' && !PLAYER) { const n = $('#main .node.cur') || $('#main .node.just'); if (n) setTimeout(() => n.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' }), 60); setTimeout(() => { JUST = null; }, 900); }
  flushToasts();
}
function flushToasts() { const box = $('#toasts'); while (TOASTS.length) { const msg = TOASTS.shift(); [...box.children].forEach(o => { if (o.textContent === msg) o.remove(); }); while (box.children.length >= 2) box.firstElementChild.remove(); const el = div('toast', esc(msg)); box.appendChild(el); setTimeout(() => el.remove(), 4200); } }
function toast(m) { TOASTS.push(m); flushToasts(); }
function sheet(html, bind) { const m = div('modal'); m.innerHTML = `<div class="mcard" role="dialog" aria-modal="true"><button type="button" class="iconbtn mx" aria-label="Close">${icon('x')}</button>${html}</div>`; document.body.appendChild(m); const close = () => { m.remove(); document.removeEventListener('keydown', k); }; const k = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k); m.onclick = e => { if (e.target === m || e.target.closest('.mx')) close(); }; bind && bind(m, close); const f = $('button:not(.mx), select, input', m); f && !TOUCH && f.focus(); return close; }
const BIND = {}; BIND.profile = () => bindProfile(); let JUST = null, LAST_TAB = null;
function runPlan(go) {
  const [kind, id] = go.split(':');
  if (kind === 'C') startChallenge(); else if (kind === 'M') startMode(id); else if (kind === 'L') lessonSheet(id); else if (kind === 'W') startWeak(id); else if (kind === 'T') { TAB = id; render(); window.scrollTo(0, 0); } else if (kind === 'F') startCards();
}

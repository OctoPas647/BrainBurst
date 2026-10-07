/* ================= Global events & boot ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-lesson],[data-mode],[data-drill],[data-sf],[data-setmode],[data-setsec],[data-act],[data-plan]'); if (!t || t.closest('.player') || t.closest('.tester')) return;
  if (t.closest('.modal') && !t.dataset.tab) return;
  if (t.dataset.tab) { const m = t.closest('.modal'); if (m) m.remove(); TAB = t.dataset.tab; BIND._scrolled = false; render(); window.scrollTo(0, 0); $('#main').focus({ preventScroll: true }); }
  else if (t.dataset.lesson) lessonSheet(t.dataset.lesson);
  else if (t.dataset.mode) { if (t.getAttribute('aria-disabled') === 'true') { toast(t.dataset.mode === 'review' ? 'No mistakes saved yet.' : 'Nothing saved here yet.'); return; } startMode(t.dataset.mode); }
  else if (t.dataset.drill) startDrill(t.dataset.drill);
  else if (t.dataset.sf) { STRAT_F = t.dataset.sf; render(); }
  else if (t.dataset.setmode) { S.settings.mode = t.dataset.setmode; save(); render(); }
  else if (t.dataset.setsec) { S.settings.sec = t.dataset.setsec; BIND._scrolled = false; save(); render(); }
  else if (t.dataset.plan) runPlan(t.dataset.plan);
  else if (t.dataset.act === 'refill') { if (S.gems >= 50) { S.gems -= 50; S.hearts.n = S.settings.heartsMax; save(); render(); toast('Hearts refilled.'); } }
  else if (t.dataset.act === 'freeze') { if (S.gems >= 100) { S.gems -= 100; S.streak.freeze++; save(); render(); toast('Streak freeze added.'); } }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-score], [data-skd]') && !e.target.closest('.player')) { e.preventDefault(); e.target.click(); } });
/* Android back button: close the top layer, or go back to Learn */
window.__back = function () {
  const sel = ['.calc .cx', '.modal .mx', '.brief .bskip', '.cards .cclose', '.tester #tquit', '.player .pclose'];
  for (const s of sel) { const b = document.querySelector(s); if (b) { b.click(); return 'h'; } }
  if (TAB !== 'learn') { TAB = 'learn'; render(); window.scrollTo(0, 0); return 'h'; }
  return '';
};
dayRoll(); render();
setInterval(() => { if (!PLAYER && !TESTER) { const c = $('#topchips'); if (c) c.innerHTML = chipsHTML(); } }, 30000);
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (TAB === 'custom' && !PLAYER) render(); });
/* In the Android app, open external links (like Desmos) in the phone's browser */
document.addEventListener('click', e => { const a = e.target.closest('a[target="_blank"]'); if (a && window.AndroidUI) { e.preventDefault(); location.href = a.href; } });

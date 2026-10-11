/* ================= Lesson player =================
   play(cfg): cfg = { title, badge, screens, next(P), goal, mode: 'practice'|'test', rated, hearts: 'global'|number|null,
   timer (seconds, whole session), pace (target seconds per question), review (Mistake Review), K, onDone(summary), onClose, onOut, noSkip } */
let PLAYER = null;
function play(cfg) {
  if (PLAYER) PLAYER.destroy(true); document.querySelectorAll('.confetti').forEach(c => c.remove());
  regenHearts();
  const useGlobal = cfg.hearts === 'global'; const localHearts = typeof cfg.hearts === 'number' ? cfg.hearts : null;
  const P = { cfg, i: 0, hearts: useGlobal ? S.hearts.n : localHearts, correct: 0, total: 0, xp: 0, combo: 0, best: 0, start: Date.now(), r0: overallRating(), timers: [], ended: false, screens: cfg.screens ? cfg.screens.slice() : [], wrongs: [], times: [], log: [] };
  const rated = !!cfg.rated;
  const ov = div('player'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', cfg.title);
  ov.innerHTML = `<header class="phead"><button type="button" class="iconbtn pclose" aria-label="Close">${icon('x')}</button><div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="pstat"></div></header><div class="ptitle"><span class="pmode">${esc(cfg.badge || '')}</span><span class="ptname">${esc(cfg.title)}</span><span class="ptools"><span class="pace" hidden></span><button type="button" class="tool tcalc" hidden aria-label="Calculator" title="Calculator">${icon('calc')}</button><button type="button" class="tool tref" hidden aria-label="Reference sheet" title="Reference sheet">${icon('formula')}</button><button type="button" class="tool tbm" aria-label="Bookmark this question" title="Bookmark">${icon('bookmark')}</button></span></div><main class="pbody"></main><footer class="pfoot"><div class="pfb" aria-live="polite"></div><div class="pbtns"><button type="button" class="btn ghost pskip">${cfg.timer ? 'Pass' : 'Skip'}</button><button type="button" class="btn primary pcheck" disabled>Check</button></div></footer>`;
  document.body.appendChild(ov); document.body.classList.add('noscroll');
  const body = $('.pbody', ov), foot = $('.pfoot', ov), fb = $('.pfb', ov), btn = $('.pcheck', ov), skip = $('.pskip', ov), bar = $('.pbar i', ov), stat = $('.pstat', ov);
  const tCalc = $('.tcalc', ov), tRef = $('.tref', ov), tBm = $('.tbm', ov), paceEl = $('.pace', ov);
  let cur = null, phase = 'answer', tLeft = cfg.timer || 0, tick = null, qStart = Date.now(), paceT = null;
  const drawStat = () => {
    let h = '';
    if (cfg.timer) h += `<span class="chip-t">${icon('clock')} ${fmtTime(tLeft)}</span><span class="chip-s">${icon('bolt')} ${P.correct}${P.combo >= 3 ? ` <small>×${Math.min(4, 1 + Math.floor(P.combo / 3))}</small>` : ''}</span>`;
    else if (P.hearts != null) { const hit = P._ph != null && P.hearts < P._ph; h += `<span class="chip-h${hit ? ' hit' : ''}">${icon('heart')} ${P.hearts}</span>`; }
    else h += `<span class="chip-inf" title="Practice mode: unlimited mistakes">${icon('infinity')}</span>`;
    stat.innerHTML = h; P._ph = P.hearts; const pct = cfg.timer ? (1 - tLeft / cfg.timer) * 100 : (P.screens.length ? (P.i / (cfg.next ? Math.max(P.i + 1, cfg.goal || P.i + 1) : P.screens.length)) * 100 : 0);
    bar.style.width = pct + '%'; bar.parentElement.setAttribute('aria-valuenow', Math.round(pct));
  };
  P.destroy = (silent) => { P.ended = true; clearInterval(tick); clearInterval(paceT); P.timers.forEach(f => { try { f(); } catch (e) { } }); P.timers = []; document.removeEventListener('keydown', onKey); ov.remove(); document.body.classList.remove('noscroll'); closeCalc(); PLAYER = null; if (!silent) cfg.onClose && cfg.onClose(); };
  const ensureScreen = () => { if (cfg.next && P.i >= P.screens.length) { const n = cfg.next(P); if (n) P.screens.push(n); } return P.screens[P.i]; };
  const PRE = new Map();
  const curItem = () => { const sc = P.screens[P.i]; return sc && sc.items.find(isGraded); };
  const drawTools = () => {
    const it = curItem(); const math = it && secOf(it.sk) === 'M';
    tCalc.hidden = !math; tRef.hidden = !math; tBm.hidden = !it || !it.ref;
    const on = it && it.ref && S.bm.includes(it.ref); tBm.classList.toggle('on', !!on); tBm.setAttribute('aria-pressed', !!on);
  };
  function startPace() {
    clearInterval(paceT); qStart = Date.now();
    const it = curItem(); if (!it || !(cfg.pace || S.settings.showTimer)) { paceEl.hidden = true; return; }
    const target = cfg.pace ? (secOf(it.sk) === 'M' ? 95 : 71) : 0; paceEl.hidden = false;
    const upd = () => { const s = (Date.now() - qStart) / 1000; paceEl.innerHTML = `${icon('clock')} ${fmtTime(s)}${target ? `<small> / ${fmtTime(target)}</small>` : ''}`; paceEl.classList.toggle('slow', !!target && s > target); };
    upd(); paceT = setInterval(upd, 1000);
  }
  function renderScreen() {
    P.timers.forEach(f => { try { f(); } catch (e) { } }); P.timers = [];
    const sc = ensureScreen(); if (!sc) return finish();
    phase = 'answer'; fb.innerHTML = ''; foot.className = 'pfoot'; btn.textContent = sc.items.every(it => !isGraded(it)) ? 'Continue' : 'Check'; btn.disabled = true; skip.hidden = !!cfg.noSkip || sc.items.every(it => !isGraded(it));
    body.innerHTML = ''; body.scrollTop = 0;
    let B = PRE.get(P.i); PRE.delete(P.i); if (!B || B.sc !== sc) B = buildScreen(sc);
    cur = B.cur; body.appendChild(B.wrap); B.ctx.change(); drawStat(); drawTools(); startPace();
    preload();
  }
  function buildScreen(sc) {
    const wrap = div('screen' + (sc.ps ? ' split' : '')); const left = div('sleft'), right = div('sright');
    if (sc.ps) {
      left.innerHTML = `<div class="passage"><div class="phd">${icon('book')} <span>${esc(sc.psTitle || 'Text')}</span><button type="button" class="hl" title="Highlight selected text">${icon('marker')} Highlight</button></div><div class="paper">${rich(sc.ps)}${sc.ch ? chartHTML(sc.ch) : ''}</div></div>`;
      wrap.appendChild(left);
      $('.hl', left).onclick = e => { e.preventDefault(); const s = getSelection(); if (!s.rangeCount || s.isCollapsed) { toast('Select some text in the passage first.'); return; } const r = s.getRangeAt(0); if (!$('.paper', left).contains(r.commonAncestorContainer)) return; try { const m = document.createElement('mark'); r.surroundContents(m); s.removeAllRanges(); } catch (err) { } };
    } else {
      if (sc.fig) right.insertAdjacentHTML('beforeend', figHTML(sc.fig));
      if (sc.ch) right.insertAdjacentHTML('beforeend', chartHTML(sc.ch));
    }
    const ctx = { change: () => { btn.disabled = !(cur && cur.every(c => c.ready())); }, enter: () => !btn.disabled && btn.click(), timers: P.timers };
    const items = sc.items.map(it => { const r = renderItem(it, ctx); r.it = it; right.appendChild(r.el); return r; });
    wrap.appendChild(right); return { sc, wrap, cur: items, ctx };
  }
  function preload() {
    const run = () => { if (P.ended) return; for (let d = 1; d <= 3; d++) { const j = P.i + d; if (PRE.has(j)) continue; if (cfg.next && j >= P.screens.length) { if (j !== P.screens.length) break; const n = cfg.next(P); if (!n) break; P.screens.push(n); } const s2 = P.screens[j]; if (!s2) continue; try { PRE.set(j, buildScreen(s2)); } catch (err) { } } };
    (window.requestIdleCallback ? requestIdleCallback(run, { timeout: 300 }) : setTimeout(run, 30));
  }
  function flair(xp, combo) {
    if (reduceMotion()) return;
    if (xp > 0) { const r = btn.getBoundingClientRect(); const e = div('xpfloat', `+${xp} XP`); e.style.left = (r.left + r.width / 2) + 'px'; e.style.top = (r.top - 6) + 'px'; ov.appendChild(e); setTimeout(() => e.remove(), 900 * SPD()); }
    if (combo >= 3 && !cfg.timer) { const e = div('combo', `${icon('flame')} ${combo} in a row!`); ov.appendChild(e); setTimeout(() => e.remove(), 1300 * SPD()); }
  }
  function check() {
    let allOk = true; const notes = []; const xp0 = P.xp; const secs = (Date.now() - qStart) / 1000; clearInterval(paceT);
    cur.forEach(r => {
      const res = r.check(); const it = r.it; if (res.info) return;
      P.total++; const sk = it.sk;
      if (it.k !== 'pairs') { recordAnswer(it, res.ok, secs); P.times.push({ sk, s: secs, ok: res.ok }); P.log.push({ ref: it.ref, sk, ok: res.ok, s: secs }); }
      if (res.ok) { P.correct++; P.combo++; P.best = Math.max(P.best, P.combo); const mult = cfg.timer ? Math.min(4, 1 + Math.floor((P.combo - 1) / 3)) : 1; P.xp += (cfg.mode === 'test' || rated ? 3 : 2) * mult; if (it.t) { S.counts.tricks++; quest('trick', 1); } }
      else { allOk = false; P.combo = 0; P.wrongs.push(it); if (P.hearts != null) P.hearts--; }
      if (cfg.review && it.ref) reviewResult(it.ref, res.ok); else if (!res.ok && it.ref && it.k !== 'pairs') addMistake(it.ref);
      if (it.t) { const t = S.traps[it.t] || (S.traps[it.t] = { n: 0, fell: 0 }); t.n++; if (!res.ok) t.fell++; }
      if (rated && sk && it.k !== 'pairs') rateItem(sk, (it.d || 2) + (it.t ? 0.5 : 0), res.ok ? 1 : 0, cfg.K);
      const slow = cfg.pace && secs > (secOf(sk) === 'M' ? 95 : 71);
      if (!cfg.timer || !res.ok) notes.push(`${res.ok ? '' : `<p class="ans">${res.answerHTML ? `Answer: ${res.answerHTML}` : ''}</p>`}${res.msg ? `<p class="why">${esc(res.msg)}</p>` : ''}${!cfg.timer && res.pickedWhy ? res.pickedWhy : ''}${it.x && !cfg.timer ? `<div class="why">${rich(it.x)}</div>` : ''}${!cfg.timer && res.othersWhy ? res.othersWhy : ''}${it.t ? `<p class="trap">${icon('eye')} Trap: ${esc(it.t)}</p>` : ''}${cfg.pace ? `<p class="pacefb ${slow ? 'slow' : ''}">${icon('clock')} ${fmtTime(secs)} · target ${fmtTime(secOf(sk) === 'M' ? 95 : 71)}${slow ? ' — too slow for test pace' : ' — on pace'}</p>` : ''}`);
    });
    if (useGlobal && P.hearts != null) S.hearts.n = P.hearts;
    beep(allOk);
    phase = 'feedback'; skip.hidden = true;
    foot.className = 'pfoot ' + (allOk ? 'good' : 'badf');
    fb.innerHTML = `<h3><span class="fbic">${icon(allOk ? 'check' : 'x')}</span>${allOk ? pick(['Correct!', 'Nice!', 'Spot on!', 'Excellent!']) : 'Not quite'}</h3>${notes.join('')}`; flair(P.xp - xp0, allOk ? P.combo : 0);
    btn.textContent = 'Continue'; btn.disabled = false; drawStat(); save();
    if (cfg.timer) { setTimeout(() => { if (!P.ended && phase === 'feedback') next(); }, allOk ? 350 : 1400); }
    if (!TOUCH) btn.focus({ preventScroll: true });
  }
  function next() {
    if (P.hearts != null && P.hearts <= 0) return outOfHearts();
    P.i++; if (!cfg.next && P.i >= P.screens.length) return finish(); if (cfg.goal && P.i >= cfg.goal && !cfg.timer) return finish(); renderScreen();
  }
  function outOfHearts() {
    if (cfg.onOut) return finish(true);
    const m = div('modal'); m.innerHTML = `<div class="mcard"><div class="bigic heart">${icon('heart')}</div><h2>Out of hearts</h2><p>Test mode ends when you run out of hearts.</p><div class="mbtns">${S.gems >= 50 ? `<button type="button" class="btn primary" data-a="refill">${icon('gem')} Refill for 50 gems</button>` : ''}<button type="button" class="btn" data-a="practice">Continue in Practice mode (unrated)</button><button type="button" class="btn ghost" data-a="quit">End lesson</button></div></div>`;
    ov.appendChild(m);
    m.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; m.remove(); if (a.dataset.a === 'refill') { S.gems -= 50; S.hearts.n = S.settings.heartsMax; P.hearts = S.hearts.n; save(); drawStat(); next(); } else if (a.dataset.a === 'practice') { P.hearts = null; P.cfg.mode = 'practice'; P.failedTest = true; drawStat(); next(); } else finish(true); };
  }
  function finish(failed) {
    if (P.ended) return; clearInterval(tick); clearInterval(paceT); paceEl.hidden = true; P.timers.forEach(f => { try { f(); } catch (e) { } }); P.timers = [];
    const acc = P.total ? P.correct / P.total : 1;
    const summary = { acc, correct: P.correct, total: P.total, xp: P.xp, failed: !!failed || !!P.failedTest, best: P.best, wrongs: P.wrongs, secs: (Date.now() - P.start) / 1000, hearts: P.hearts, times: P.times, log: P.log };
    const extra = cfg.onDone ? cfg.onDone(summary) || {} : {};
    addXP(summary.xp + (extra.bonus || 0)); touchStreak(); dayRoll(); if (rated) S.rhist.push({ t: Date.now(), r: overallRating() }); logScore(); checkAch(); save();
    const dr = overallRating() - P.r0;
    const avgT = P.times.length ? avg(P.times.map(t => t.s)) : 0;
    body.innerHTML = `<section class="result"><div class="rhero ${summary.failed ? 'fail' : ''}"><div class="ring" style="--p:${Math.round(acc * 100)}"><b>${Math.round(acc * 100)}%</b><span>accuracy</span></div><h2>${esc(extra.title || (summary.failed ? 'Lesson ended' : 'Lesson complete!'))}</h2>${extra.sub ? `<p>${extra.sub}</p>` : ''}</div><div class="rstats"><div><b>+${summary.xp + (extra.bonus || 0)}</b><span>XP</span></div><div><b>${P.correct}/${P.total}</b><span>correct</span></div>${rated ? `<div><b class="${dr >= 0 ? 'up' : 'down'}">${dr >= 0 ? '+' : ''}${dr}</b><span>rating</span></div>` : '<div><b>Unrated</b><span>practice</span></div>'}<div><b>${fmtTime(avgT)}</b><span>per question</span></div></div>${extra.html || ''}${summary.wrongs.length && !cfg.timer && !cfg.review ? `<p class="muted">${plural(summary.wrongs.length, 'question')} added to Mistake Review.</p>` : ''}</section>`;
    foot.className = 'pfoot neutral'; fb.innerHTML = ''; skip.hidden = true; bar.style.width = '100%'; tCalc.hidden = tRef.hidden = tBm.hidden = true;
    btn.textContent = 'Continue'; btn.disabled = false; phase = 'done'; $$('.bigstars', body).forEach(e => { e.innerHTML = e.innerHTML.replace(/★/g, '<i>★</i>'); }); if (!reduceMotion()) { const xb = $('.rstats b', body); const mm = xb && xb.textContent.match(/^\+(\d+)$/); if (mm && +mm[1] > 0) { const to = +mm[1], t0 = performance.now(); const step = t => { if (P.ended) return; const k = Math.min(1, (t - t0) / (600 * SPD())); xb.textContent = '+' + Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); } }
    if (!summary.failed && acc >= 0.6 && P.total) { confetti(); beep(true); }
  }
  btn.onclick = () => { const sc = P.screens[P.i]; if (phase === 'answer' && sc && sc.items.every(it => !isGraded(it))) { next(); return; } if (phase === 'answer') check(); else if (phase === 'feedback') next(); else if (phase === 'done') P.destroy(); };
  skip.onclick = () => { if (phase !== 'answer') return; clearInterval(paceT); if (cfg.timer) { P.combo = 0; P.total++; P.i++; renderScreen(); return; } cur.forEach(r => { if (isGraded(r.it) && r.it.ref && !cfg.review) addMistake(r.it.ref); }); P.total += cur.filter(r => isGraded(r.it)).length; P.combo = 0; P.i++; if (cfg.next || P.i < P.screens.length) renderScreen(); else finish(); };
  $('.pclose', ov).onclick = () => { if (phase === 'done' || confirm('Quit? Progress in this session will be lost.')) { if (phase === 'done') P.destroy(); else { save(); P.destroy(); } } };
  tCalc.onclick = () => openCalc(); tRef.onclick = () => openReference();
  tBm.onclick = () => { const it = curItem(); if (!it || !it.ref) return; if (S.bm.includes(it.ref)) { S.bm = S.bm.filter(x => x !== it.ref); toast('Bookmark removed.'); } else { S.bm.push(it.ref); toast('Bookmarked. Find it in Practice → Bookmarks.'); } save(); drawTools(); };
  function onKey(e) { if (document.querySelector('.calc')) return; if (e.target.matches('textarea, input, select') && e.key !== 'Enter') return; if (e.key === 'Enter' && !e.target.matches('textarea')) { if (e.target.matches('button:not(.pcheck)')) return; e.preventDefault(); if (!btn.disabled) btn.click(); } else if (/^[1-4a-dA-D]$/.test(e.key) && phase === 'answer' && cur && cur.length === 1 && cur[0].key) cur[0].key('1234'.includes(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase())); else if (e.key === 'Escape') $('.pclose', ov).click(); }
  document.addEventListener('keydown', onKey);
  if (cfg.timer) tick = setInterval(() => { tLeft--; drawStat(); if (tLeft <= 0) finish(); }, 1000);
  PLAYER = P; renderScreen(); return P;
}

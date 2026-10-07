/* ================= Question renderers ================= */
/* Multiple choice, with the SAT answer eliminator (cross out choices you've ruled out) */
function rChoice(it, ctx) {
  const el = div('item'); let sel = null, locked = false; const out = new Set();
  const strike = S.settings.strike;
  el.innerHTML = `<div class="q">${rich(it.p)}</div><div class="opts${strike ? ' canstrike' : ''}" role="radiogroup">${it.o.map((o, i) => `<div class="optrow" data-i="${i}"><button type="button" class="opt" role="radio" aria-checked="false" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span class="ot">${inlineHTML(o)}</span></button>${strike ? `<button type="button" class="strk" data-s="${i}" aria-label="Cross out choice ${'ABCD'[i]}" title="Cross out">${'ABCD'[i]}</button>` : ''}</div>`).join('')}</div>`;
  const btns = $$('.opt', el), rows = $$('.optrow', el);
  const draw = () => { btns.forEach(x => { const i = +x.dataset.i, on = sel === i; x.classList.toggle('sel', on); x.setAttribute('aria-checked', on); rows[i].classList.toggle('out', out.has(i)); }); };
  const choose = i => { if (locked) return; out.delete(i); sel = i; draw(); ctx.change(); };
  btns.forEach(b => b.onclick = () => choose(+b.dataset.i));
  $$('.strk', el).forEach(b => b.onclick = () => { if (locked) return; const i = +b.dataset.s; if (out.has(i)) out.delete(i); else { out.add(i); if (sel === i) sel = null; } draw(); ctx.change(); });
  return { el, ready: () => sel != null, key: n => n < 4 && choose(n), value: () => sel,
    set(v) { if (v != null) { sel = v; draw(); } },
    lock() { locked = true; btns.forEach(b => b.disabled = true); },
    check() { locked = true; btns.forEach(b => { const i = +b.dataset.i; if (i === it.a) b.classList.add('right'); else if (i === sel) b.classList.add('bad'); b.disabled = true; }); return { ok: sel === it.a, answer: `${'ABCD'[it.a]}) ${plain(it.o[it.a])}`, answerHTML: `<b>${'ABCD'[it.a]})</b> ${inlineHTML(it.o[it.a])}` }; } };
}
/* Typed answer (student-produced response) with an on-screen keypad and a live preview */
function sprPreview(v) { v = String(v || '').trim(); if (!v) return '<span class="muted">Answer preview</span>'; const m = /^(-?)(\d+)\/(\d+)$/.exec(v); return `<span class="m">${mathHTML(m ? `${m[1]}frac{${m[2]}}{${m[3]}}` : v)}</span>`; }
function rSPR(it, ctx) {
  const el = div('item'); let locked = false;
  el.innerHTML = `<div class="q">${rich(it.p)}</div><div class="spr"><label class="sprbox"><span class="sprlab">Your answer</span><input class="sprin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="7" ${TOUCH ? 'readonly inputmode="none"' : 'inputmode="decimal"'} aria-label="Your answer"></label><div class="sprprev" aria-live="polite">${sprPreview('')}</div></div><p class="sprwarn" aria-live="polite"></p><div class="keypad" role="group" aria-label="Keypad">${['7', '8', '9', '/', '4', '5', '6', '.', '1', '2', '3', '-', '0', '⌫'].map(k => `<button type="button" class="kp${k === '⌫' ? ' kdel' : ''}${k === '0' ? ' k0' : ''}" data-k="${k}">${k === '-' ? '−' : k}</button>`).join('')}</div><details class="sprrules"><summary>How to enter answers</summary><ul><li>Up to 5 characters (6 with a minus sign).</li><li>Fractions and decimals are fine: 3/4 or .75.</li><li>No mixed numbers: write 3½ as 7/2 or 3.5.</li><li>A long decimal must fill all 5 characters: 2/3 → .6666 or .6667.</li><li>No symbols such as %, $ or commas.</li></ul></details>`;
  const inp = $('.sprin', el), prev = $('.sprprev', el), warn = $('.sprwarn', el);
  const upd = () => { const v = inp.value; prev.innerHTML = sprPreview(v); const pr = v.trim() ? sprProblem(v) : ''; warn.textContent = pr; warn.classList.toggle('on', !!pr); ctx.change(); };
  inp.oninput = upd; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ctx.enter(); } };
  $$('.kp', el).forEach(b => b.onclick = () => { if (locked) return; const k = b.dataset.k; if (k === '⌫') inp.value = inp.value.slice(0, -1); else if (k === '-') { inp.value = inp.value.startsWith('-') ? inp.value.slice(1) : '-' + inp.value; } else if (inp.value.length < 7) inp.value += k; upd(); });
  setTimeout(() => { if (!TOUCH) inp.focus({ preventScroll: true }); }, 60);
  return { el, ready: () => !!inp.value.trim() && !sprProblem(inp.value), value: () => inp.value.trim(),
    set(v) { if (v) { inp.value = v; upd(); } },
    lock() { locked = true; inp.disabled = true; },
    check() { locked = true; inp.disabled = true; $$('.kp', el).forEach(b => b.disabled = true); const r = checkSPR(inp.value, it); inp.classList.add(r.ok ? 'right' : 'bad'); return { ok: r.ok, msg: r.msg, answer: sprAnswerText(it), answerHTML: esc(sprAnswerText(it)) }; } };
}
/* Matching pairs (flashcard game) */
function rPairs(it, ctx) {
  const el = div('item'); const left = shuffle(it.pairs.map((p, i) => i)), right = shuffle(it.pairs.map((p, i) => i)); let pick1 = null, matched = 0, mistakes = 0;
  el.innerHTML = `<div class="q">${rich(it.p)}</div><div class="pairs"><div class="pcol">${left.map(i => `<button type="button" class="pb" data-s="l" data-i="${i}">${inlineHTML(it.pairs[i][0])}</button>`).join('')}</div><div class="pcol">${right.map(i => `<button type="button" class="pb" data-s="r" data-i="${i}">${inlineHTML(it.pairs[i][1])}</button>`).join('')}</div></div>`;
  $$('.pb', el).forEach(b => b.onclick = () => { if (b.disabled) return; if (!pick1 || pick1.dataset.s === b.dataset.s) { $$('.pb.sel', el).forEach(x => x.classList.remove('sel')); pick1 = b; b.classList.add('sel'); return; } if (pick1.dataset.i === b.dataset.i) { [pick1, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; }); matched++; beep(true); } else { mistakes++; const a = pick1; [a, b].forEach(x => x.classList.add('shake')); setTimeout(() => [a, b].forEach(x => x.classList.remove('shake', 'sel')), 450); beep(false); } pick1 = null; ctx.change(); });
  return { el, ready: () => matched === it.pairs.length, check() { return { ok: mistakes <= 1, msg: mistakes ? `${plural(mistakes, 'wrong attempt')}.` : 'Flawless.', answer: '' }; } };
}
function renderItem(it, ctx) {
  switch (it.k) {
    case 'm': return rChoice(it, ctx);
    case 'n': return rSPR(it, ctx);
    case 'pairs': return rPairs(it, ctx);
    default: { const el = div('item info', rich(it.p || '')); return { el, ready: () => true, check: () => ({ ok: true, info: true }) }; }
  }
}
const isGraded = it => it.k === 'm' || it.k === 'n' || it.k === 'pairs';

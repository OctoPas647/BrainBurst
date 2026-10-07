/* ---------- Customize: speed, briefings, icons ---------- */
function customExtrasHTML(st) {
  const spd = st.anim === false ? 0 : st.animSpeed;
  const sel = (k, opts, num) => `<select data-set="${k}" ${num ? 'data-num' : ''}>${opts.map(([v, n]) => `<option value="${v}" ${String(k === 'animSpeed' ? spd : st[k]) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  const rng = (k, l, a, b, s) => `<label class="fld">${l} <output>${st[k]}</output><input type="range" data-set="${k}" min="${a}" max="${b}" step="${s}" value="${st[k]}"></label>`;
  return `<section class="card"><h2>${icon('bolt')} Speed and animation</h2><p class="muted small">Animations never block you: buttons work straight away, and the next screens are prepared in the background.</p>
    <div class="row3"><label class="fld">Animation speed${sel('animSpeed', [[0, 'Off'], [0.5, 'Instant (0.5×)'], [0.75, 'Quick (0.75×)'], [1, 'Normal (1×)'], [1.5, 'Relaxed (1.5×)'], [2, 'Slow (2×)']], true)}</label>
    <label class="fld">Lesson briefings${sel('brief', [['always', 'Before every lesson'], ['new', 'First time for each question type'], ['off', 'Off']])}</label>
    <div class="fld"><span>&nbsp;</span><button type="button" class="btn small" id="bprev">${icon('play')} Preview a briefing</button></div></div>
    ${`<label class="tog"><input type="checkbox" data-set="confetti" ${st.confetti ? 'checked' : ''}> Confetti</label>`}</section>
  <section class="card"><h2>${icon('sparkle')} Icons</h2>
    <div class="row3"><label class="fld">Icon style${sel('iconStyle', [['line', 'Line (default)'], ['thin', 'Thin line'], ['bold', 'Bold line'], ['emoji', 'Emoji']])}</label>
    ${rng('iconSize', 'Icon size', 0.8, 1.6, 0.05)}${rng('nodeSize', 'Lesson bubble size', 0.8, 1.35, 0.05)}</div>
    <p class="iconprev">${['sigma', 'book', 'calc', 'formula', 'flame', 'heart', 'gem', 'trophy', 'bolt', 'target'].map(n => icon(n)).join('')}</p></section>`;
}
function bindCustomExtra() { const b = $('#bprev'); if (b) b.onclick = () => { const ls = pick(LESSONS.filter(l => BRIEF[deckKey(l)])); showBrief(BRIEF[deckKey(ls)], ls); }; }

/* ================= Question bank: lessons, refs, pickers ================= */
/* Every question has a ref so it can come back later (Mistake Review, bookmarks):
     g:<skill>:<difficulty>:<seed>   a generated math question
     b:<id>                          a hand-written question from BANK */
const LESSONS = [];
UNITS.forEach(u => u.lessons.forEach((ls, i) => LESSONS.push(Object.assign(ls, { unit: u, i, sec: u.sec }))));
const lessonById = id => LESSONS.find(l => l.id === id);
function itemFromRef(ref) {
  if (!ref) return null;
  if (ref.startsWith('g:')) { const [, sk, d, seed] = ref.split(':'); return genItem(sk, +d, +seed); }
  const id = ref.slice(2); const q = BANK[id]; return q ? Object.assign({}, q, { ref }) : null;
}
function resolveSpec(spec) {
  if (typeof spec === 'string') return itemFromRef(spec.includes(':') ? spec : 'b:' + spec);
  if (spec.gen) return genItem(spec.gen, spec.d || 2, newSeed());
  return spec.id ? Object.assign({}, spec, { ref: 'b:' + spec.id }) : spec;
}
const screenOf = it => ({ items: [it], ps: it.ps, ch: it.ch, fig: it.fig });
const screensForLesson = ls => ls.items.map(resolveSpec).filter(Boolean).map(screenOf);
const screenFromRef = ref => { const it = itemFromRef(ref); return it ? screenOf(it) : null; };

/* ---------- Pickers ---------- */
const DOM_W = { CS: 0.28, II: 0.26, SEC: 0.26, EOI: 0.2, ALG: 0.35, ADV: 0.35, PSD: 0.15, GEO: 0.15 };
const skillsOf = sec => SKILL_IDS.filter(sk => secOf(sk) === sec);
const isTestItem = q => !!q.test;
/* n questions for one skill. Math is generated fresh; R&W comes from the hand-written bank. */
function skillItems(sk, n, d, opts = {}) {
  if (secOf(sk) === 'M' && GENS[sk]) return Array.from({ length: n }, () => genItem(sk, d || pick([1, 2, 2, 3]), newSeed()));
  let pool = RWBANK.filter(q => q.sk === sk && !isTestItem(q) && (!d || q.d === d));
  if (pool.length < n) pool = RWBANK.filter(q => q.sk === sk && !isTestItem(q));
  if (opts.fresh) { const seen = new Set(Object.keys(S.seen || {})); const fresh = pool.filter(q => !seen.has(q.id)); if (fresh.length >= n) pool = fresh; }
  return shuffle(pool).slice(0, n).map(q => Object.assign({}, q, { ref: 'b:' + q.id }));
}
/* A mixed set weighted like the real SAT */
function pickSkillWeighted(sec) { const doms = DOMAINS.filter(d => d.sec === sec); let r = Math.random() * doms.reduce((a, d) => a + DOM_W[d.id], 0); for (const d of doms) { r -= DOM_W[d.id]; if (r <= 0) return pick(SKILL_IDS.filter(sk => SKILLS[sk].dom === d.id)); } return pick(skillsOf(sec)); }
function mixedItems(n, sec, d) {
  const out = []; let guard = 0;
  while (out.length < n && guard++ < n * 6) { const s = sec || pick(SEC2); const sk = pickSkillWeighted(s); const [it] = skillItems(sk, 1, d); if (it && !out.some(o => o.ref === it.ref)) out.push(it); }
  return out;
}
/* Weakest skills: low rating, adjusted for how little evidence there is */
function skillScore(sk) { const st = S.sk[sk] || { a: 0, k: 0 }; const acc = st.a ? st.k / st.a : 0.6; const conf = Math.min(1, st.a / 8); return conf * (0.6 * acc + 0.4 * clamp((S.rating[sk] - 800) / 700, 0, 1)) + (1 - conf) * 0.55; }
function weakSkills(sec, k = 3) { return SKILL_IDS.filter(sk => !sec || secOf(sk) === sec).sort((a, b) => skillScore(a) - skillScore(b)).slice(0, k); }
function weakItems(n, sec) { const ws = weakSkills(sec, 3); const out = []; for (let i = 0; i < n; i++) { const sk = ws[i % ws.length]; const [it] = skillItems(sk, 1, null, { fresh: true }); if (it && !out.some(o => o.ref === it.ref)) out.push(it); } return out; }
const skillAcc = sk => { const st = S.sk[sk]; return st && st.a ? st.k / st.a : null; };

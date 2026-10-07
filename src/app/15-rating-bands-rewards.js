/* ================= Rating, predicted SAT score, rewards ================= */
const itemRating = d => 950 + (clamp(+d || 2, 1, 3.5) - 1) * 200;
/* Elo rating -> section score (200-800): 950 ~ 400, 1150 ~ 560, 1350 ~ 720, 1450+ ~ 800 */
const scoreFromRating = r => clamp(round10(400 + (r - 950) * 0.8), 200, 800);
const ratingForScore = s => 950 + (s - 400) / 0.8;
function rateItem(sk, d, score, K) {
  const ir = itemRating(d); const sec = secOf(sk);
  for (const key of [sk, sec]) { const r = S.rating[key] ?? 1000; const e = 1 / (1 + Math.pow(10, (ir - r) / 400)); const k = K || ((S.games[key] || 0) < 30 ? 32 : 20); S.rating[key] = Math.round(r + k * (score - e)); S.games[key] = (S.games[key] || 0) + 1; }
}
function recordAnswer(it, ok, secs) {
  const st = S.sk[it.sk] || (S.sk[it.sk] = { a: 0, k: 0, t: 0 }); st.a++; if (ok) st.k++; st.t += Math.min(600, secs || 0);
  S.st.a++; if (ok) S.st.k++;
  if (it.id) { S.seen = S.seen || {}; S.seen[it.id] = (S.seen[it.id] || 0) + 1; }
  quest(secOf(it.sk) === 'M' ? 'math' : 'rw', 1);
}
/* Spaced mistake review: wrong answers come back today, then after 1, 3 and 7 days */
const REVIEW_GAPS = [1, 3, 7];
function addMistake(ref) { if (!ref) return; const m = S.mist.find(x => x.r === ref); if (m) { m.n = 0; m.due = today(); } else S.mist.push({ r: ref, due: today(), n: 0 }); }
function reviewResult(ref, ok) { const m = S.mist.find(x => x.r === ref); if (!m) return; if (!ok) { m.n = 0; m.due = dayShift(today(), 1); return; } if (m.n >= REVIEW_GAPS.length - 1) { S.mist = S.mist.filter(x => x !== m); quest('review', 1); return; } m.due = dayShift(today(), REVIEW_GAPS[m.n]); m.n++; quest('review', 1); }
const dueMistakes = () => S.mist.filter(m => m.due <= today());
/* Predicted section scores: rating evidence + recent practice tests */
function predictSec(sec) {
  const parts = []; const n = S.games[sec] || 0;
  if (n > 0) parts.push({ k: 'rating', s: scoreFromRating(S.rating[sec]), w: Math.min(1, n / 30), t: `${n} rated answers → rating ${S.rating[sec]}` });
  const tests = S.tests.filter(t => t[sec] != null).slice(-2); if (tests.length) parts.push({ k: 'test', s: avg(tests.map(t => t[sec])), w: 1.5, t: `Practice tests: average of the last ${tests.length}` });
  if (!parts.length) return { s: null, conf: 0, parts };
  const tw = parts.reduce((a, p) => a + p.w, 0); const s = clamp(round10(parts.reduce((a, p) => a + p.s * p.w, 0) / tw), 200, 800);
  const ev = n + 40 * tests.length; return { s, conf: ev < 15 ? 1 : ev < 60 ? 2 : 3, parts };
}
function predict() { const out = {}; SEC2.forEach(sec => out[sec] = predictSec(sec)); const have = SEC2.filter(s => out[s].s != null); out.total = have.length === 2 ? out.RW.s + out.M.s : null; out.partial = have.length === 1 ? out[have[0]].s : null; out.provisional = have.length < 2; return out; }
const TIERS = [[0, 'Bronze'], [950, 'Silver'], [1050, 'Gold'], [1150, 'Sapphire'], [1250, 'Ruby'], [1350, 'Emerald'], [1450, 'Diamond'], [1550, 'Obsidian']];
const tierOf = r => TIERS.filter(t => r >= t[0]).pop()[1];
const overallRating = () => Math.round((S.rating.RW + S.rating.M) / 2);
function regenHearts() { const H = S.hearts, max = S.settings.heartsMax, per = S.settings.heartMins * 60000; if (H.n >= max) { H.n = Math.min(H.n, max); H.ts = Date.now(); return; } const add = Math.floor((Date.now() - H.ts) / per); if (add > 0) { H.n = Math.min(max, H.n + add); H.ts += add * per; if (H.n >= max) H.ts = Date.now(); } }
const nextHeartIn = () => { const H = S.hearts; if (H.n >= S.settings.heartsMax) return 0; return S.settings.heartMins * 60000 - (Date.now() - H.ts); };
const QUESTS = [{ id: 'xp', t: 'Earn 60 XP', g: 60 }, { id: 'lessons', t: 'Finish 2 lessons', g: 2 }, { id: 'perfect', t: 'Finish a lesson with no mistakes', g: 1 }, { id: 'rapid', t: 'Score 10+ in a Speed Drill', g: 10, max: true }, { id: 'trick', t: 'Spot 5 SAT traps', g: 5 }, { id: 'review', t: 'Clear 5 mistakes in review', g: 5 }, { id: 'chal', t: 'Solve the daily challenge', g: 1 }, { id: 'math', t: 'Answer 15 math questions', g: 15 }, { id: 'rw', t: 'Answer 15 reading & writing questions', g: 15 }, { id: 'cards', t: 'Study 15 flashcards', g: 15 }, { id: 'strat', t: 'Practise a strategy', g: 1 }];
function dayRoll() { const d = today(); if (S.daily.d !== d) S.daily = { d, xp: 0 }; if (S.quests.d !== d) { let seed = d.split('-').reduce((a, b) => a * 31 + +b, 7); const ids = []; while (ids.length < 3) { seed = (seed * 9301 + 49297) % 233280; const q = QUESTS[seed % QUESTS.length]; if (!ids.includes(q.id)) ids.push(q.id); } S.quests = { d, p: {}, list: ids }; } }
let TOASTS = [];
function quest(id, amt, isMax) { dayRoll(); if (!S.quests.list.includes(id)) return; const q = QUESTS.find(x => x.id === id); const before = S.quests.p[id] || 0; const now = isMax ? Math.max(before, amt) : before + amt; S.quests.p[id] = now; if (before < q.g && now >= q.g) { S.gems += 20; TOASTS.push(`Quest complete: ${q.t} (+20 gems)`); } }
function addXP(n) { if (n <= 0) return; dayRoll(); S.xp += n; S.daily.xp += n; { const td = today(); S.xpLog[td] = (S.xpLog[td] || 0) + n; for (const k of Object.keys(S.xpLog)) if (k < dayShift(td, -40)) delete S.xpLog[k]; } quest('xp', n); }
function touchStreak() { const d = today(); if (S.streak.last === d) return; const y = dayShift(d, -1); if (S.streak.last === y) S.streak.n++; else if (S.streak.last && S.streak.freeze > 0 && S.streak.last === dayShift(d, -2)) { S.streak.freeze--; S.streak.n++; } else S.streak.n = 1; S.streak.last = d; }
function logScore() { const p = predict(); const v = p.total; if (v == null) return; const d = today(); const last = S.shist[S.shist.length - 1]; if (last && last.d === d) last.s = v; else S.shist.push({ d, s: v }); }
const bestTest = () => S.tests.reduce((m, t) => (t.total != null && t.total > (m || 0) ? t.total : m), null);
const ACH = [
  { id: 'first', t: 'First steps', d: 'Finish your first lesson', f: () => S.counts.lessons >= 1, p: () => [S.counts.lessons, 1] },
  { id: 'ten', t: 'Getting serious', d: 'Finish 10 lessons', f: () => S.counts.lessons >= 10, p: () => [S.counts.lessons, 10] },
  { id: 'fifty', t: 'Unstoppable', d: 'Finish 50 lessons', f: () => S.counts.lessons >= 50, p: () => [S.counts.lessons, 50] },
  { id: 'unit', t: 'Unit cleared', d: 'Complete every lesson in a unit', f: () => UNITS.some(u => unitProgress(u) === 1) },
  { id: 'streak3', t: 'On a roll', d: '3-day streak', f: () => S.streak.n >= 3, p: () => [S.streak.n, 3] },
  { id: 'streak7', t: 'Week warrior', d: '7-day streak', f: () => S.streak.n >= 7, p: () => [S.streak.n, 7] },
  { id: 'streak30', t: 'Habit formed', d: '30-day streak', f: () => S.streak.n >= 30, p: () => [S.streak.n, 30] },
  { id: 'gold', t: 'Under pressure', d: 'Pass a lesson in Test mode', f: () => Object.values(S.done).some(d => d.test) },
  { id: 'rapid', t: 'Lightning', d: 'Score 15+ in a Speed Drill', f: () => Object.values(S.best).some(v => v >= 15) },
  { id: 'trap', t: 'Trap hunter', d: 'Answer 20 SAT trap questions correctly', f: () => S.counts.tricks >= 20, p: () => [S.counts.tricks, 20] },
  { id: 'module', t: 'Clock watcher', d: 'Finish a timed module', f: () => S.counts.modules >= 1 },
  { id: 'test', t: 'Dress rehearsal', d: 'Finish a full practice test', f: () => S.counts.tests >= 1, p: () => [S.counts.tests, 1] },
  { id: 'chal7', t: 'Challenge accepted', d: 'Solve 7 daily challenges', f: () => S.counts.chal >= 7, p: () => [S.counts.chal, 7] },
  { id: 'cards', t: 'Word collector', d: 'Study 100 flashcards', f: () => S.counts.cards >= 100, p: () => [S.counts.cards, 100] },
  { id: 's1200', t: '1200 club', d: 'Score 1200+ on a practice test', f: () => (bestTest() || 0) >= 1200 },
  { id: 's1400', t: '1400 club', d: 'Score 1400+ on a practice test', f: () => (bestTest() || 0) >= 1400 },
  { id: 's1500', t: '1500 club', d: 'Score 1500+ on a practice test', f: () => (bestTest() || 0) >= 1500 },
  { id: 's1600', t: 'Perfect 1600', d: 'Score 1600 on a practice test', f: () => (bestTest() || 0) >= 1600 }
];
function checkAch() { for (const a of ACH) if (!S.ach[a.id] && a.f()) { S.ach[a.id] = today(); S.gems += 30; TOASTS.push(`Achievement: ${a.t} (+30 gems)`); } }
function unitProgress(u) { const ids = u.lessons.map(l => l.id); return ids.filter(id => S.done[id]).length / ids.length; }

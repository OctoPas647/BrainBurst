/* ================= Hand-written question bank =================
   Every hand-written question gets an id and lives in BANK.
   Question fields:
     k   'm' multiple choice (default) or 'n' typed answer (student-produced response)
     ps  passage (Reading & Writing), shown beside the question; ______ marks a blank
     p   the question;  o  the four options;  a  index of the correct option (0-3)
         for k:'n', a is a list of accepted answers, e.g. ['3/4', '.75']
     x   explanation;   d  difficulty 1-3;   t  optional trap name (for SAT Traps stats)
     ch  optional table/chart;  fig  optional graph/figure */
const BANK = {};
const LESSON_SETS = {};   // skill id -> [{ n, t, tip, sk, ids }]
const TEST_SETS = {};     // test id -> { RW: { m1, m2e, m2h }, M: {...} } (lists of ids)
/* Answer positions are shuffled once (the same way every time, seeded by the question id)
   so the correct answer isn't always where it was typed. Add fx: true to keep the written order. */
function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function settleOrder(q) {
  if (q.k !== 'm' || q.fx || !Array.isArray(q.o)) return q;
  const perm = RNG(strHash(q.id)).shuffle(q.o.map((_, i) => i));
  q.o = perm.map(i => q.o[i]); q.a = perm.indexOf(q.a); return q;
}
function addItems(prefix, sk, items, extra) {
  return items.map((it, i) => {
    const id = `${prefix}-${String(i + 1).padStart(2, '0')}`;
    const q = settleOrder(Object.assign({ k: 'm', d: 2 }, extra || {}, it, { id, sk: it.sk || sk }));
    BANK[id] = q; if (secOf(q.sk) === 'RW') RWBANK.push(q);
    return id;
  });
}
/* A lesson's worth of hand-written questions for one skill */
function lessonSet(sk, n, t, tip, items) {
  const ids = addItems(`${sk}-L${n}`, sk, items);
  (LESSON_SETS[sk] = LESSON_SETS[sk] || []).push({ n, t, tip, sk, ids });
}
/* Extra practice questions for a skill (used by drills, not by the path) */
function drillSet(sk, items) { addItems(`${sk}-D${(LESSON_SETS[sk] || []).length}${Object.keys(BANK).length}`, sk, items, { drill: true }); }
/* Questions reserved for a fixed practice test module: testSet('t1', 'RW', 'm1', [...]) */
function testSet(test, sec, mod, items) {
  const ids = items.map((it, i) => { const id = `${test}-${sec}-${mod}-${String(i + 1).padStart(2, '0')}`; const q = settleOrder(Object.assign({ k: 'm', d: 2 }, it, { id, test })); BANK[id] = q; if (sec === 'RW') RWBANK.push(q); return id; });
  const T = TEST_SETS[test] = TEST_SETS[test] || { RW: {}, M: {} }; T[sec][mod] = (T[sec][mod] || []).concat(ids);
}

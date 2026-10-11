/* ================= State & persistence ================= */
const SKILL_IDS = Object.keys(SKILLS);
const DEF_SETTINGS = { animSpeed: 1, brief: 'new', iconStyle: 'line', iconSize: 1, nodeSize: 1, mode: 'practice', heartsMax: 5, heartMins: 30, dailyGoal: 50, target: 1600, sound: true, anim: true, confetti: true, unlockAll: false, font: 'rounded', scale: 1, radius: 18, depth: 4, themeMode: 'system', rapidLen: 120, trickHearts: 3, sec: 'M', strike: true, pace: true, calcDeg: true, testBreak: true, showTimer: true, whyOpen: false };
const DEF = () => ({
  v: 1, xp: 0, gems: 150, streak: { n: 0, last: null, freeze: 0 }, hearts: { n: 5, ts: Date.now() },
  done: {}, rating: Object.fromEntries([...SEC2, ...SKILL_IDS].map(k => [k, 1000])), games: Object.fromEntries([...SEC2, ...SKILL_IDS].map(k => [k, 0])),
  sk: {},            // per skill: { a: answered, k: correct, t: seconds spent }
  rhist: [], shist: [], // rating history, predicted score history
  mist: [],          // spaced mistake review: { r: ref, due: 'YYYY-MM-DD', n: level }
  bm: [],            // bookmarked question refs
  seen: {},          // hand-written question id -> times answered
  traps: {}, strat: {}, best: {}, quests: { d: null, p: {}, list: [] }, daily: { d: null, xp: 0 }, ach: {},
  counts: { lessons: 0, tricks: 0, tests: 0, modules: 0, cards: 0, chal: 0, reviewed: 0 },
  tests: [],         // finished practice tests
  cards: {},         // flashcards: { id: { b: box, due } }
  chal: { d: null, ok: null, streak: 0, last: null },
  settings: { ...DEF_SETTINGS }, palette: null,
  profile: { name: '', avatar: '🧠', color: '#5B4CF5', joined: 0, exam: '' },
  xpLog: {}, st: { a: 0, k: 0 }, seenBrief: {}, updatedAt: 0
});
const LSKEY = 'brainburst-sat.v1';
function mergeDeep(base, over) { if (!over || typeof over !== 'object') return base; for (const k of Object.keys(over)) { const v = over[k]; if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = mergeDeep(base[k], v); else base[k] = v; } return base; }
function loadLocal() { try { const raw = localStorage.getItem(LSKEY); if (raw) return mergeDeep(DEF(), JSON.parse(raw)); } catch (e) { } return DEF(); }
let S = loadLocal();
function trim() { S.rhist = S.rhist.slice(-200); S.shist = S.shist.slice(-120); S.mist = S.mist.slice(-250); S.bm = S.bm.slice(-300); S.tests = S.tests.slice(-30); }
function save() { trim(); S.updatedAt = Date.now(); try { localStorage.setItem(LSKEY, JSON.stringify(S)); } catch (e) { } }

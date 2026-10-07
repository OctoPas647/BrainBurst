/* ================= Settings, emoji icons, speed ================= */
const TOUCH = window.matchMedia ? matchMedia('(pointer: coarse)').matches : false;
function SPD() { return Math.max(0.25, +S.settings.animSpeed || 1); }
if (!S.profile.joined) S.profile.joined = Date.now();
const EMOJI = { book: '📖', pen: '✍️', bolt: '⚡', eye: '👁️', target: '🎯', flame: '🔥', heart: '❤️', gem: '💎', star: '⭐', lock: '🔒', chart: '📊', palette: '🎨', flask: '🧪', bulb: '💡', path: '🗺️', clock: '⏱️', trophy: '🏆', sparkle: '✨', shuffle: '🔀', cards: '🃏', alert: '⚠️', user: '👤', calendar: '📅', medal: '🏅', sigma: '➗', calc: '🧮', flag: '🚩', bookmark: '🔖', formula: '📐', graph: '📈', list: '📋', sun: '☀️', brain: '🧠', refresh: '🔁', check: '✅', grid: '🔲', ruler: '📏' };
const ICON_STROKE = { thin: 1.6, line: 2.2, bold: 2.9, emoji: 2.2 };
const secColor = sec => (sec === 'M' ? 'math' : 'verbal');

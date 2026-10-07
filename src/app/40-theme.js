/* ================= Theme ================= */
const TOKENS = [
  ['Base', [['bg', 'bg', 'App background'], ['surface', 'surface', 'Cards'], ['surface2', 'surface2', 'Raised areas'], ['border', 'border', 'Borders'], ['text', 'text', 'Text'], ['muted', 'muted', 'Secondary text'], ['nav', 'nav', 'Navigation']]],
  ['Brand', [['primary', 'primary', 'Primary buttons'], ['primaryInk', 'primary-ink', 'Text on primary'], ['accent', 'accent', 'Accent & gems'], ['xp', 'xp', 'XP & stars'], ['streak', 'streak', 'Streak flame'], ['heart', 'heart', 'Hearts']]],
  ['Feedback', [['correct', 'correct', 'Correct'], ['correctBg', 'correct-bg', 'Correct background'], ['wrong', 'wrong', 'Wrong'], ['wrongBg', 'wrong-bg', 'Wrong background']]],
  ['Sections', [['math', 'math', 'Math'], ['verbal', 'verbal', 'Reading & Writing']]],
  ['Progress', [['fill', 'fill', 'Progress fill'], ['track', 'track', 'Progress track'], ['path', 'path', 'Locked nodes']]],
  ['Passages', [['paper', 'paper', 'Paper'], ['paperInk', 'paper-ink', 'Paper text'], ['mark', 'mark', 'Highlighter']]],
  ['Charts', [['c1', 'c1', 'Series 1'], ['c2', 'c2', 'Series 2'], ['c3', 'c3', 'Series 3'], ['c4', 'c4', 'Series 4']]]
];
const TOKLIST = TOKENS.flatMap(g => g[1]);
const BASE_L = { bg: '#F5F4FC', surface: '#FFFFFF', surface2: '#EEEDF8', border: '#DDDBEE', text: '#1A1838', muted: '#625F82', nav: '#FFFFFF', primary: '#5B4CF5', primaryInk: '#FFFFFF', accent: '#00A6D6', xp: '#F5A800', streak: '#FF7A1A', heart: '#EE3D57', correct: '#1FA968', correctBg: '#E2F7EC', wrong: '#E5384F', wrongBg: '#FDE8EB', math: '#F2612E', verbal: '#0F9F86', fill: '#1FA968', track: '#E4E2F1', path: '#CCC9DF', paper: '#FFFFFF', paperInk: '#1E1E2B', mark: '#FFE45C', c1: '#5B4CF5', c2: '#F2612E', c3: '#0F9F86', c4: '#00A6D6' };
const BASE_D = { bg: '#100F1E', surface: '#19172C', surface2: '#232039', border: '#302C4A', text: '#F0EFFA', muted: '#A19EBD', nav: '#141226', primary: '#8C80FF', primaryInk: '#0E0C1E', accent: '#3CCBF2', xp: '#FFC83D', streak: '#FF9440', heart: '#FF5C74', correct: '#3DD68C', correctBg: '#133628', wrong: '#FF5C74', wrongBg: '#3A1820', math: '#FF8A5C', verbal: '#2FD3B4', fill: '#3DD68C', track: '#2B2843', path: '#3E3A5C', paper: '#1C1A30', paperInk: '#E8E6F2', mark: '#7A6200', c1: '#8C80FF', c2: '#FF8A5C', c3: '#2FD3B4', c4: '#3CCBF2' };
const PRESETS = [
  ['Burst', BASE_L], ['Burst Night', BASE_D],
  ['Meadow', { ...BASE_L, bg: '#F5FAF1', primary: '#3E9B12', fill: '#3E9B12', accent: '#1CB0F6', track: '#E1EDD7', path: '#CADBBD', c1: '#3E9B12' }],
  ['Sofia', { ...BASE_L, bg: '#FAFAFA', primary: '#00875F', fill: '#00875F', accent: '#00875F', heart: '#D62612', wrong: '#D62612', streak: '#D62612', c1: '#00875F', c2: '#D62612' }],
  ['Sunset', { ...BASE_L, bg: '#FFF5EE', primary: '#D9480F', fill: '#E8590C', accent: '#C2255C', track: '#F5E1D5', path: '#E7CBBB', c1: '#E8590C', c2: '#C2255C', c3: '#F59F00', c4: '#7048E8' }],
  ['Ocean', { ...BASE_L, bg: '#EDF6F7', primary: '#0B7285', fill: '#0CA678', accent: '#1098AD', track: '#D3E8EB', path: '#B5D3D8', c1: '#0B7285', c2: '#15AABF', c3: '#0CA678', c4: '#4263EB' }],
  ['Neon Night', { ...BASE_D, bg: '#0D0B16', surface: '#171327', surface2: '#221C38', border: '#2F2747', nav: '#120F1F', primary: '#C84BFF', primaryInk: '#0D0B16', fill: '#2CF2A0', accent: '#3DE3FF', c1: '#C84BFF', c2: '#3DE3FF', c3: '#2CF2A0', c4: '#FFD23D' }],
  ['Print', { ...BASE_L, bg: '#FFFFFF', surface: '#FFFFFF', surface2: '#F2F2F2', border: '#1A1A1A', text: '#000000', muted: '#444444', primary: '#000000', primaryInk: '#FFFFFF', accent: '#000000', fill: '#000000', track: '#DDDDDD', path: '#BBBBBB', math: '#1A1A1A', verbal: '#444444', c1: '#000000', c2: '#777777', c3: '#BBBBBB', c4: '#444444' }],
  ['High contrast', { ...BASE_D, bg: '#000000', surface: '#000000', surface2: '#1A1A1A', border: '#FFFFFF', text: '#FFFFFF', muted: '#E0E0E0', nav: '#000000', primary: '#FFE600', primaryInk: '#000000', correct: '#00FF85', wrong: '#FF4D4D', fill: '#00FF85' }]
];
const FONTS = { rounded: ['"Baloo 2", "Nunito", ui-rounded, system-ui, sans-serif', '"Nunito", ui-rounded, system-ui, sans-serif'], clean: ['"Nunito", system-ui, sans-serif', '"Nunito", system-ui, sans-serif'], serif: ['"Source Serif 4", Georgia, serif', '"Source Serif 4", Georgia, serif'], system: ['system-ui, -apple-system, "Segoe UI", sans-serif', 'system-ui, -apple-system, "Segoe UI", sans-serif'] };
function applyTheme() {
  const r = document.documentElement;
  TOKLIST.forEach(t => r.style.removeProperty('--' + t[1]));
  if (S.palette) { TOKLIST.forEach(t => { if (S.palette[t[0]]) r.style.setProperty('--' + t[1], S.palette[t[0]]); }); r.setAttribute('data-theme', lum(S.palette.bg || '#fff') < 0.4 ? 'dark' : 'light'); }
  else { const m = S.settings.themeMode; if (m === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', m); }
  r.style.setProperty('--radius', S.settings.radius + 'px'); r.style.setProperty('--depth', S.settings.depth + 'px');
  r.style.fontSize = (16 * S.settings.scale) + 'px'; const f = FONTS[S.settings.font] || FONTS.rounded; r.style.setProperty('--font-display', f[0]); r.style.setProperty('--font-ui', f[1]);
  S.settings.anim = (+S.settings.animSpeed || 0) > 0; r.classList.toggle('nomotion', !S.settings.anim); r.style.setProperty('--spd', String(SPD())); r.style.setProperty('--ics', String(S.settings.iconSize || 1)); r.style.setProperty('--nodesz', String(S.settings.nodeSize || 1)); r.style.setProperty('--icw', String(ICON_STROKE[S.settings.iconStyle] || 2.2)); ICON_STYLE = S.settings.iconStyle; r.classList.toggle('touch', TOUCH);
}
function lum(hex) { const m = String(hex).replace('#', ''); if (m.length < 6) return 1; const [r, g, b] = [0, 2, 4].map(i => parseInt(m.substr(i, 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function currentColor(k) { const t = TOKLIST.find(x => x[0] === k); const v = getComputedStyle(document.documentElement).getPropertyValue('--' + t[1]).trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : '#888888'; }

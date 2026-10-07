/* ================= SAT catalog: sections, domains, skills =================
   Mirrors the official digital SAT content domains. Every question and lesson
   points at one skill id below (sk: 'lin1', sk: 'bnd', ...). */
const SECTIONS = {
  RW: { name: 'Reading & Writing', short: 'R&W', v: 'verbal', ic: 'book', qs: 27, mins: 32 },
  M: { name: 'Math', short: 'Math', v: 'math', ic: 'sigma', qs: 22, mins: 35 }
};
const SEC2 = ['RW', 'M'];
const DOMAINS = [
  { id: 'CS', sec: 'RW', name: 'Craft and Structure', share: 'about 28%', d: 'Word meaning in context, how texts are built, and how two texts relate.' },
  { id: 'II', sec: 'RW', name: 'Information and Ideas', share: 'about 26%', d: 'Main ideas, details, evidence from text and data, and logical inferences.' },
  { id: 'SEC', sec: 'RW', name: 'Standard English Conventions', share: 'about 26%', d: 'Punctuation between clauses, agreement, verb forms and sentence sense.' },
  { id: 'EOI', sec: 'RW', name: 'Expression of Ideas', share: 'about 20%', d: 'Transitions between ideas and using notes to meet a writing goal.' },
  { id: 'ALG', sec: 'M', name: 'Algebra', share: 'about 35%', d: 'Linear equations, linear functions, systems and inequalities.' },
  { id: 'ADV', sec: 'M', name: 'Advanced Math', share: 'about 35%', d: 'Equivalent expressions, quadratics, exponentials and other nonlinear functions.' },
  { id: 'PSD', sec: 'M', name: 'Problem-Solving and Data Analysis', share: 'about 15%', d: 'Ratios, percentages, statistics, probability and studies.' },
  { id: 'GEO', sec: 'M', name: 'Geometry and Trigonometry', share: 'about 15%', d: 'Area and volume, angles and triangles, trigonometry and circles.' }
];
const SKILLS = {
  wic: { dom: 'CS', name: 'Words in Context' },
  tsp: { dom: 'CS', name: 'Text Structure and Purpose' },
  ctc: { dom: 'CS', name: 'Cross-Text Connections' },
  cid: { dom: 'II', name: 'Central Ideas and Details' },
  coet: { dom: 'II', name: 'Command of Evidence: Textual' },
  coeq: { dom: 'II', name: 'Command of Evidence: Quantitative' },
  inf: { dom: 'II', name: 'Inferences' },
  bnd: { dom: 'SEC', name: 'Boundaries' },
  fss: { dom: 'SEC', name: 'Form, Structure, and Sense' },
  trn: { dom: 'EOI', name: 'Transitions' },
  rsy: { dom: 'EOI', name: 'Rhetorical Synthesis' },
  lin1: { dom: 'ALG', name: 'Linear equations in one variable' },
  linf: { dom: 'ALG', name: 'Linear functions' },
  lin2: { dom: 'ALG', name: 'Linear equations in two variables' },
  sys: { dom: 'ALG', name: 'Systems of linear equations' },
  ineq: { dom: 'ALG', name: 'Linear inequalities' },
  eqv: { dom: 'ADV', name: 'Equivalent expressions' },
  nleq: { dom: 'ADV', name: 'Nonlinear equations and systems' },
  nlf: { dom: 'ADV', name: 'Nonlinear functions' },
  rat: { dom: 'PSD', name: 'Ratios, rates, proportions and units' },
  pct: { dom: 'PSD', name: 'Percentages' },
  one: { dom: 'PSD', name: 'One-variable data' },
  two: { dom: 'PSD', name: 'Two-variable data and scatterplots' },
  prob: { dom: 'PSD', name: 'Probability and conditional probability' },
  infr: { dom: 'PSD', name: 'Sample statistics and margin of error' },
  stud: { dom: 'PSD', name: 'Observational studies and experiments' },
  area: { dom: 'GEO', name: 'Area and volume' },
  lat: { dom: 'GEO', name: 'Lines, angles and triangles' },
  trig: { dom: 'GEO', name: 'Right triangles and trigonometry' },
  circ: { dom: 'GEO', name: 'Circles' }
};
const SKILL_IDS_ORDER = Object.keys(SKILLS);
const secOf = sk => { const s = SKILLS[sk]; if (!s) return 'M'; return DOMAINS.find(d => d.id === s.dom).sec; };
const domOf = sk => (SKILLS[sk] || {}).dom;
const domById = id => DOMAINS.find(d => d.id === id);

/* Registries filled by the content files that follow */
const UNITS = [];      // learning path units (one per domain, per section)
const GENS = {};       // math question generators, by skill id
const RWBANK = [];     // every Reading & Writing question, tagged with skill and difficulty
const TESTS = [];      // fixed full-length practice tests

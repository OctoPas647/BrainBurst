# Architecture

Plain HTML/CSS/JavaScript, no framework and no npm dependencies. `tools/build.py` joins every file into one page:
content first (`src/content/0*`, `gens/`, `rw/`, `tests/`, `banks/`, `9*`), then `src/app/` in number order.
All code shares one global scope; top-level code may only use things from earlier files.

## Key globals
| Name | File | What it is |
|---|---|---|
| `SECTIONS`, `DOMAINS`, `SKILLS` | content/00-catalog | The SAT structure: 2 sections, 8 domains, 30 skills |
| `GENS`, `genItem(sk, d, seed)` | content/01, gens/ | Math generators; the same seed always gives the same question |
| `BANK`, `lessonSet`, `testSet` | content/02 | Hand-written questions by id |
| `UNITS`, `LESSONS` | content/90, app/13 | The learning path |
| `S` | app/11 | Saved state (localStorage key `brainburst-sat.v1`) |
| `rich`, `mathHTML` | app/12 | Text, markdown-lite and math rendering |
| `itemFromRef`, `skillItems`, `weakSkills` | app/13 | Question refs (`g:sk:d:seed`, `b:id`) and pickers |
| `checkSPR` | app/14 | Typed-answer rules (5 characters, fractions, decimals) |
| `rateItem`, `predict` | app/15 | Elo rating per skill and section, predicted SAT score |
| `chartHTML`, `figHTML` | app/18 | Tables, charts, coordinate planes, geometry figures |
| `play(cfg)` | app/20 | The lesson player |
| `openCalc` | app/21 | Calculator and grapher |
| `runTest` | app/45 | The Bluebook-style practice test runner |

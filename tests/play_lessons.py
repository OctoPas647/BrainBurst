"""Plays every lesson on the learning path in a headless browser and reports problems.
Usage:  python tests/play_lessons.py [accuracy] [mode]     e.g.  python tests/play_lessons.py 0.8 test
  accuracy  share of questions answered correctly (default 1.0)
  mode      'practice' (default) or 'test' (rated, with hearts)
Needs:  pip install playwright  and  playwright install chromium.  Build first:  python tools/build.py web
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist/web/index.html').as_uri()
ACC = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
MODE = sys.argv[2] if len(sys.argv) > 2 else 'practice'
# Answers the current screen: picks the right choice (or a wrong one), or types the first accepted answer.
ANSWER = """([pOk]) => {
  const P = PLAYER; if (!P) return 'closed';
  if (document.querySelector('.player .result')) return 'result';
  const btn = document.querySelector('.player .pcheck');
  if (!btn.disabled && btn.textContent.trim() !== 'Check') return 'next';
  const sc = P.screens[P.i]; const els = [...document.querySelectorAll('.player .pbody .item')];
  sc.items.forEach((it, n) => { const el = els[n]; if (!el) return; const ok = Math.random() < pOk;
    if (it.k === 'm') { const i = ok ? it.a : (it.a + 1) % it.o.length; el.querySelector(`.opt[data-i="${i}"]`).click(); }
    else if (it.k === 'n') { const inp = el.querySelector('.sprin'); inp.value = ok ? it.a[0] : '9999'; inp.dispatchEvent(new Event('input')); }
    else { const b = el.querySelector('.opt, button'); b && b.click(); } });
  return 'answered';
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
    pg.goto(URL); pg.wait_for_timeout(500)
    ids = pg.evaluate("() => { S.settings.brief = 'off'; S.settings.heartsMax = 999; return LESSONS.map(l => l.id) }")
    bad = 0
    for lid in ids:
        n0 = len(errs)
        pg.evaluate("([id, m]) => { S.hearts.n = 999; startLesson(id, m === 'test' ? 'test' : undefined) }", [lid, MODE])
        state, q = '', 0
        for step in range(300):
            state = pg.evaluate(ANSWER, [ACC])
            if state in ('closed', 'result'): break
            if state == 'answered': q += 1
            if pg.evaluate("() => document.querySelector('.player .pcheck').disabled"):
                state = 'stuck: ' + pg.evaluate("() => JSON.stringify(PLAYER.screens[PLAYER.i].items.map(it => ({ k: it.k, ref: it.ref, a: it.a })))"); break
            pg.click('.player .pcheck'); pg.wait_for_timeout(20)
        title = pg.inner_text('.player .result h2') if state == 'result' else ''
        if state != 'result' or len(errs) > n0: bad += 1; print(f'  ✗ {lid}: ended in "{state}" after {q} screens', errs[n0:][:2])
        else: print(f'  ✓ {lid}: {q} screens · {title}')
        pg.evaluate("() => PLAYER && PLAYER.destroy(true)")
    print(f'{len(ids)} lessons, {bad} problem(s), {len(errs)} page error(s)')
    b.close(); sys.exit(1 if bad or errs else 0)

"""Takes a full practice test in a headless (phone-sized) browser, tapping answers and typing on the keypad,
then checks the score report.
Usage:  python tests/play_test.py [test] [right|wrong|mix] [full|RW|M]     e.g.  python tests/play_test.py t1 right
  right -> expects 1600 (or 800 for one section);  wrong -> expects the 200-per-section floor.
Needs:  pip install playwright  and  playwright install chromium.  Build first:  python tools/build.py web
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist/web/index.html').as_uri()
tid = sys.argv[1] if len(sys.argv) > 1 else 't1'; mode = sys.argv[2] if len(sys.argv) > 2 else 'mix'; what = sys.argv[3] if len(sys.argv) > 3 else 'full'
STATE = """() => document.querySelector('.treport') ? 'done' : document.querySelector('#tresume') ? 'break' : document.querySelector('#tint') ? 'inter'
  : document.querySelector('#tsub') ? 'review' : document.querySelector('.tester .item') ? 'q' : 'other'"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915}, has_touch=True, is_mobile=True)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.evaluate("() => { S.settings.testBreak = true; const o = renderItem; window.renderItem = (it, ctx) => { window.__it = it; return o(it, ctx); }; TAB = 'tests'; render(); }")
    pg.click(f'[data-test="{tid}:{what}"]'); pg.wait_for_timeout(200)
    if pg.query_selector('#tgo'): pg.click('#tgo')
    n = typed = 0; rejected = []
    for step in range(500):
        st = pg.evaluate(STATE)
        if st == 'done': break
        if st == 'break': pg.click('#tresume'); continue
        if st == 'inter': print('  ' + pg.inner_text('.tinter').replace('\n', ' ').strip()[:120]); pg.click('#tint'); continue
        if st == 'review': pg.click('#tsub'); pg.wait_for_timeout(100); continue
        if st != 'q': print('  stuck on an unexpected screen'); break
        it = pg.evaluate("() => ({ k: __it.k, a: __it.a, ref: __it.ref })"); n += 1
        right = mode == 'right' or (mode == 'mix' and n % 10 < 7)
        if it['k'] == 'm': pg.click(f'.tester .opt[data-i="{it["a"] if right else (it["a"] + 1) % 4}"]')
        else:
            typed += 1; v = it['a'][0] if right else '9999'
            for ch in v: pg.click(f'.tester .kp[data-k="{ch}"]')
            if right and not pg.evaluate("v => checkSPR(v, __it).ok", v): rejected.append((it['ref'], v))
        pg.click('#tnext'); pg.wait_for_timeout(10)
    pg.wait_for_timeout(300)
    r = pg.evaluate("() => { const t = S.tests[S.tests.length - 1]; return t && { RW: t.RW, M: t.M, total: t.total } }")
    print(f'  {n} questions ({typed} typed on the keypad) · result {r}')
    ok = bool(r) and not errs and not rejected
    secs = [s for s in ('RW', 'M') if r and r.get(s) is not None]
    if mode == 'right': ok = ok and all(r[s] == 800 for s in secs)
    if mode == 'wrong': ok = ok and all(r[s] == 200 for s in secs)
    if rejected: print('  correct typed answers rejected:', rejected[:5])
    if errs: print('  page errors:', errs[:3])
    print('  PASS' if ok else '  FAIL'); b.close(); sys.exit(0 if ok else 1)

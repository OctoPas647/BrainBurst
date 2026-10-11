"""Plays every hand-written practice question (all Reading & Writing drills and lessons, SAT Traps) and a sample of
generated math questions, answering each one wrong, and checks that the "why it's wrong" notes appear.
Usage:  python tests/play_drills.py      Build first:  python tools/build.py web      Needs Playwright.
"""
import pathlib
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist/web/index.html').as_uri()
STEP = """() => {
  const P = PLAYER; if (!P) return 'closed';
  if (document.querySelector('.player .result')) return 'result';
  const btn = document.querySelector('.player .pcheck');
  if (!btn.disabled && btn.textContent.trim() !== 'Check') {
    const sc = P.screens[P.i]; const it = sc && sc.items[0];
    const missing = it && it.k === 'm' && !document.querySelector('.player .pfb .whyw') ? (it.ref || it.id) : '';
    btn.click(); return missing ? 'missing:' + missing : 'next';
  }
  const sc = P.screens[P.i]; const el = document.querySelector('.player .pbody .item'); const it = sc.items[0];
  if (it.k === 'm') el.querySelector(`.opt[data-i="${(it.a + 1) % it.o.length}"]`).click();
  else if (it.k === 'n') { const inp = el.querySelector('.sprin'); inp.value = '9999'; inp.dispatchEvent(new Event('input')); }
  btn.click(); return 'answered';
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
    pg.goto(URL); pg.wait_for_timeout(500)
    sets = pg.evaluate("""() => { S.settings.brief = 'off';
      const rw = SKILL_IDS.filter(sk => secOf(sk) === 'RW').map(sk => ['rw:' + sk, RWBANK.filter(q => q.sk === sk && !q.test).map(q => 'b:' + q.id)]);
      const tr = [['traps', TRICKS.map(t => 'b:' + t.id)]];
      const ma = SKILL_IDS.filter(sk => secOf(sk) === 'M').map(sk => ['gen:' + sk, [1, 2, 3].flatMap(d => Array.from({ length: 12 }, (_, i) => `g:${sk}:${d}:${(i + 1) * 7777 + d}`))]);
      return [...rw, ...tr, ...ma]; }""")
    total = missing = 0
    for name, refs in sets:
        n0 = len(errs)
        pg.evaluate("(refs) => play({ title: 'Check', screens: refs.map(screenFromRef).filter(Boolean), mode: 'practice', onClose: () => {} })", refs)
        answered, miss = 0, []
        for _ in range(len(refs) * 3 + 10):
            st = pg.evaluate(STEP)
            if st == 'answered': answered += 1
            elif st.startswith('missing:'): miss.append(st[8:])
            elif st in ('result', 'closed'): break
        pg.evaluate("() => PLAYER && PLAYER.destroy(true)")
        total += answered; missing += len(miss)
        print(f"  {'✓' if not miss and len(errs) == n0 else '✗'} {name}: {answered} answered" + (f", no why-note: {miss[:5]}" if miss else '') + (f", errors: {errs[n0:][:2]}" if len(errs) > n0 else ''))
    print(f"{total} questions answered wrong, {missing} without a why-note, {len(errs)} page error(s)")
    b.close()

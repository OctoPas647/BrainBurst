"""Plays through lessons automatically and reports any that get stuck.
Usage: python tests/run_lessons.py [from] [to] [accuracy]   e.g. python tests/run_lessons.py 0 100 0.85
Needs: pip install playwright  then  playwright install chromium. Build first: python tools/build.py web
"""
import sys, json
from playwright.sync_api import sync_playwright
AUTO = """
async ([maxSteps, pOk]) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let steps = 0, screens = 0;
  while (steps++ < maxSteps) {
    const ov = document.querySelector('.player'); if (!ov) return {screens, closed: true};
    const btn = ov.querySelector('.pcheck');
    if (document.querySelector('.player .result')) { const t = document.querySelector('.player .result').innerText.slice(0,80); btn.click(); await sleep(100); return {screens, finished: true, t}; }
    if (btn.disabled) {
      const sc = PLAYER && PLAYER.screens[PLAYER.i]; const els = [...ov.querySelectorAll('.pbody .item')];
      els.forEach((el, n) => {
        const it = sc && sc.items[n] || {}; const ok = Math.random() < pOk;
        const ob = el.querySelectorAll('.opt'); 
        if (it.k === 'm') { const t = [...ob].find(b => (+b.dataset.i === it.a) === ok) || ob[0]; t && t.click(); }
        else if (it.k === '2') { [...ob].filter(b => it.a.includes(+b.dataset.i) === ok).slice(0,2).forEach(b => b.click()); }
        else if (it.k === 't' || it.k === 'y') { const t = [...ob].find(b => (b.dataset.v === it.a) === ok); t && t.click(); }
        else if (ob.length) ob[0].click();
        el.querySelectorAll('input.gap').forEach(i => { i.value = ok ? (it.a && it.a[0]) : 'zzz'; i.dispatchEvent(new Event('input')); });
        el.querySelectorAll('.mrows select').forEach((s, k) => { s.value = String(ok ? it.i[k][1] : (it.i[k][1] + 1) % it.o.length); s.dispatchEvent(new Event('change')); });
        if (el.querySelector('.bank')) { const bank = [...el.querySelectorAll('.bank .chip')].sort((a,b)=>+a.dataset.i - +b.dataset.i); (ok ? bank : bank.reverse()).forEach(c => c.click()); }
        el.querySelectorAll('textarea.essay').forEach(t => { t.value = 'Overall, the number rose steadily while the other category fell slightly. '.repeat(8); t.dispatchEvent(new Event('input')); });
        el.querySelectorAll('.checks input').forEach(c => { c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true})); });
        const sb = el.querySelector('.selfband select'); if (sb) { sb.value = '7.0'; sb.dispatchEvent(new Event('change', {bubbles:true})); }
        const sg = el.querySelector('.sgo'), sk = el.querySelector('.sskip:not([hidden])');
        if (sg && !el.dataset.started) { el.dataset.started = 1; sg.click(); } else if (sk) sk.click();
        const ts = el.querySelector('.tscript'); if (ts && !ts.value) { ts.value = 'I think it depends, but mainly because of work.'; ts.dispatchEvent(new Event('input')); }
        el.querySelectorAll('.pb:not(:disabled)').forEach(b => b.click());
      });
      await sleep(60);
    }
    if (btn.disabled) { await sleep(150); if (steps % 8 === 7) { const s = ov.querySelector('.pskip:not([hidden])'); if (s) s.click(); } continue; }
    btn.click(); screens++; await sleep(60);
  }
  return {screens, stuck: true, body: document.querySelector('.player .pbody')?.innerText.slice(0, 200), btn: document.querySelector('.pcheck')?.textContent, kinds: PLAYER && PLAYER.screens[PLAYER.i] && PLAYER.screens[PLAYER.i].items.map(i=>i.k).join(',')};
}
"""
import pathlib
PAGE = (pathlib.Path(__file__).resolve().parent.parent / 'dist/web/bandup.html').as_uri()
args = sys.argv[1:] + ['0', '100', '0.85'][len(sys.argv[1:]):]
a, z, pok = int(args[0]), int(args[1]), float(args[2])
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
    pg=b.new_page(viewport={'width':1366,'height':860})
    pg.on('pageerror', lambda e: print('PAGEERROR', e, flush=True))
    pg.on('console', lambda m: m.type=='error' and print('CONSOLE', m.text[:200], flush=True))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(PAGE); pg.wait_for_timeout(600)
    pg.evaluate("S.settings.unlockAll=true; S.settings.brief='off'; S.hearts.n=99; S.settings.heartsMax=99; void 0")
    ids = pg.evaluate("ALL.map(r=>r.id)")[a:z]
    bad=[]
    for k,id in enumerate(ids):
        mode = 'test' if k % 2 == 0 else 'practice'
        pg.evaluate(f"startLesson('{id}','{mode}'); void 0"); pg.wait_for_timeout(50)
        r = pg.evaluate(AUTO, [60, pok])
        if not r.get('finished'): bad.append((id, r))
        pg.evaluate("document.querySelectorAll('.modal').forEach(m=>m.remove()); if (PLAYER) PLAYER.destroy(true); void 0")
    print('stuck/unfinished:', json.dumps(bad)[:1500])
    print('done', pg.evaluate("Object.keys(S.done).length"), 'xp', pg.evaluate("S.xp"), 'rating', pg.evaluate("JSON.stringify(S.rating)"))
    print('predict', pg.evaluate("JSON.stringify(predict())"))
    b.close()

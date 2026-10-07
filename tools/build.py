#!/usr/bin/env python3
"""
BrainBurst build tool. Run from anywhere:

  python tools/build.py android    signed Android APK          -> dist/android/BrainBurst-<version>.apk
  python tools/build.py web        single-file page for testing -> dist/web/index.html
  python tools/build.py serve      live preview at http://localhost:8000 (refresh to see edits)
  python tools/build.py check      syntax + content checks (needs Node.js)
  python tools/build.py bump [patch|minor|major]   raise the version number

Only Python 3.9+ is needed for web/serve. Android also needs a JDK (17+) and the
Android SDK with build-tools 35+ and platform 34 (see README.md).
"""
import functools, http.server, json, os, pathlib, re, shutil, socketserver, subprocess, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST, BUILD = ROOT / 'dist', ROOT / 'build'
CFG_PATH = ROOT / 'tools' / 'config.json'
CFG = json.loads(CFG_PATH.read_text(encoding='utf-8'))
JS_ORDER = ['src/content/0*.js', 'src/content/gens/*.js', 'src/content/rw/*.js', 'src/content/tests/*.js', 'src/content/banks/*.js', 'src/content/9*.js', 'src/app/*.js']

def read(p): return (ROOT / p).read_text(encoding='utf-8') if not isinstance(p, pathlib.Path) else p.read_text(encoding='utf-8')
def write(p, text): p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')
def say(msg): print(f'  {msg}', flush=True)

# ---------------- bundling ----------------
def js_files():
    files = []
    for pat in JS_ORDER: files += sorted(ROOT.glob(pat))
    return files

def js_bundle():
    return '\n;\n'.join(f'/* ==== {f.relative_to(ROOT).as_posix()} ==== */\n' + read(f) for f in js_files())

def scale_animation_times(css):
    """Multiply animation/transition times by --spd (the in-app animation speed setting). Toasts keep fixed timing."""
    def block(m):
        sel, body = m.group(1), m.group(2)
        if 'toast' in sel: return m.group(0)
        body = re.sub(r'((?:animation|animation-delay|animation-duration|transition)\s*:)([^;]+)',
                      lambda d: d.group(1) + re.sub(r'(?<![\w.-])(\d*\.?\d+)(ms|s)\b', lambda t: f'calc({t.group(1)}{t.group(2)} * var(--spd))', d.group(2)), body)
        return sel + '{' + body + '}'
    return re.sub(r'([^{}]*)\{([^{}]*)\}', block, css)

def css_bundle():
    return scale_animation_times('\n'.join(read(f) for f in sorted((ROOT / 'src/styles').glob('*.css'))))

def page(head='', pre_script='', body_end='', title=None):
    html = read('src/index.template.html')
    for k, v in {'TITLE': title or CFG['title'], 'HEAD': head, 'PRE_SCRIPT': pre_script, 'BODY_END': body_end}.items():
        html = html.replace('{{' + k + '}}', v)
    # CSS and JS last, with a function replacement so backslashes in the code are kept as-is
    html = html.replace('{{CSS}}', css_bundle(), 1)
    return re.sub(r'\{\{JS\}\}', lambda m: js_bundle(), html, count=1)

def local_fonts_head(): return '<style>\n' + read('assets/fonts/fonts.css') + '\n</style>'

def copy_fonts(dest):
    (dest / 'fonts').mkdir(parents=True, exist_ok=True)
    for f in (ROOT / 'assets/fonts').glob('*.woff2'): shutil.copy2(f, dest / 'fonts' / f.name)

# ---------------- targets ----------------
def build_web():
    out = DIST / 'web'
    write(out / 'index.html', page(head=local_fonts_head()))
    copy_fonts(out)
    say(f'web      -> {(out / "index.html").relative_to(ROOT)}  ({(out / "index.html").stat().st_size // 1024} KB)')
    return out

# ---------------- Android ----------------
def find_sdk():
    cands = [os.environ.get('ANDROID_HOME'), os.environ.get('ANDROID_SDK_ROOT'),
             os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Android', 'Sdk'),
             os.path.expanduser('~/Library/Android/sdk'), os.path.expanduser('~/Android/Sdk'), os.path.expanduser('~/android-sdk')]
    for c in cands:
        if c and (pathlib.Path(c) / 'build-tools').is_dir(): return pathlib.Path(c)
    sys.exit('Android SDK not found. Install it (see README.md) and set ANDROID_HOME to its folder.')

def vkey(name): return tuple(int(x) if x.isdigit() else 0 for x in re.split(r'[.-]', name))

def tool(folder, name):
    for ext in ('', '.exe', '.bat'):
        p = folder / (name + ext)
        if p.exists(): return str(p)
    found = shutil.which(name)
    if found: return found
    sys.exit(f'Could not find "{name}" in {folder}')

def java_tool(name):
    jh = os.environ.get('JAVA_HOME')
    if jh:
        for ext in ('', '.exe'):
            p = pathlib.Path(jh) / 'bin' / (name + ext)
            if p.exists(): return str(p)
    found = shutil.which(name)
    if not found: sys.exit(f'"{name}" not found. Install a JDK (17 or newer) and set JAVA_HOME.')
    return found

def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:]); sys.exit(f'Step failed: {pathlib.Path(str(cmd[0])).name}')
    return r.stdout

def build_android():
    sdk = find_sdk()
    bts = sorted((d for d in (sdk / 'build-tools').iterdir() if d.is_dir()), key=lambda d: vkey(d.name))
    bt = bts[-1]
    if vkey(bt.name) < (35,): say(f'warning: build-tools {bt.name} found; 35+ is recommended (older d8 can crash with new JDKs)')
    tgt = CFG['androidTargetSdk']
    plats = sorted((d for d in (sdk / 'platforms').glob('android-*') if (d / 'android.jar').exists()), key=lambda d: vkey(d.name.split('-')[1]))
    plat = next((d for d in plats if d.name == f'android-{tgt}'), plats[-1] if plats else None)
    if not plat: sys.exit('No Android platform installed. Install "platforms;android-34" with sdkmanager.')
    jar = plat / 'android.jar'
    pa = ROOT / 'platforms/android'; b = BUILD / 'android'
    if b.exists(): shutil.rmtree(b)
    for d in ('res', 'assets', 'gen', 'classes', 'dex'): (b / d).mkdir(parents=True)
    # resources: values + launcher icons
    shutil.copytree(pa / 'res', b / 'res', dirs_exist_ok=True)
    shutil.copytree(ROOT / 'assets/icons/android', b / 'res', dirs_exist_ok=True)
    # web app as assets, with the native bridge and bundled fonts
    write(b / 'assets/index.html', page(head=local_fonts_head(), pre_script='<script>\n' + read('platforms/android/bridge.js') + '\n</script>', title=CFG['appName']))
    copy_fonts(b / 'assets')
    manifest = read('platforms/android/AndroidManifest.xml').replace('package="com.brainburst.sat"', f'package="{CFG["androidPackage"]}"')
    write(b / 'AndroidManifest.xml', manifest)
    say(f'android  SDK {sdk} · build-tools {bt.name} · {plat.name}')
    run([tool(bt, 'aapt2'), 'compile', '--dir', b / 'res', '-o', b / 'res.zip'])
    run([tool(bt, 'aapt2'), 'link', '-o', b / 'base.apk', '-I', jar, '--manifest', b / 'AndroidManifest.xml', '-R', b / 'res.zip', '--java', b / 'gen', '-A', b / 'assets',
         '--min-sdk-version', CFG['androidMinSdk'], '--target-sdk-version', tgt, '--version-code', CFG['androidVersionCode'], '--version-name', CFG['version'],
         '--auto-add-overlay', '-0', 'woff2'])
    java = sorted((pa / 'java').rglob('*.java')) + sorted((b / 'gen').rglob('*.java'))
    run([java_tool('javac'), '-nowarn', '-Xlint:-options', '-encoding', 'UTF-8', '-source', '8', '-target', '8', '-bootclasspath', jar, '-classpath', jar, '-d', b / 'classes'] + java)
    run([tool(bt, 'd8'), '--release', '--min-api', CFG['androidMinSdk'], '--lib', jar, '--output', b / 'dex'] + sorted((b / 'classes').rglob('*.class')))
    unsigned = b / 'unsigned.apk'; shutil.copy2(b / 'base.apk', unsigned)
    with zipfile.ZipFile(unsigned, 'a', zipfile.ZIP_DEFLATED) as zf: zf.write(b / 'dex' / 'classes.dex', 'classes.dex')
    run([tool(bt, 'zipalign'), '-p', '-f', '4', unsigned, b / 'aligned.apk'])
    sj = pa / 'signing' / 'signing.json'
    if not sj.exists():
        import secrets
        say('no signing.json found: creating a new signing setup in platforms/android/signing/')
        pw = secrets.token_urlsafe(18)
        write(sj, json.dumps({'keystore': 'brainburst.keystore', 'alias': 'brainburst', 'storePassword': pw, 'keyPassword': pw}, indent=2))
    sg = json.loads(sj.read_text(encoding='utf-8')); ks = pa / 'signing' / sg['keystore']
    if not ks.exists():
        say('no signing key found: creating a new one (phones with an app signed by another key must uninstall it first)')
        run([java_tool('keytool'), '-genkeypair', '-keystore', ks, '-alias', sg['alias'], '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000',
             '-storepass', sg['storePassword'], '-keypass', sg['keyPassword'], '-dname', 'CN=BrainBurst, O=BrainBurst'])
    out = DIST / 'android' / f"BrainBurst-{CFG['version']}.apk"; out.parent.mkdir(parents=True, exist_ok=True)
    run([tool(bt, 'apksigner'), 'sign', '--ks', ks, '--ks-key-alias', sg['alias'], '--ks-pass', 'pass:' + sg['storePassword'], '--key-pass', 'pass:' + sg['keyPassword'], '--out', out, b / 'aligned.apk'])
    run([tool(bt, 'apksigner'), 'verify', out])
    say(f'android  -> {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB, versionCode {CFG["androidVersionCode"]})')
    return out

# ---------------- dev server ----------------
def serve(port=8000):
    dev = BUILD / 'dev'
    def rebuild():
        write(dev / 'index.html', page(head=local_fonts_head(), title=CFG['appName'] + ' (dev)'))
    copy_fonts(dev); rebuild()
    class H(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.split('?')[0] in ('/', '/index.html'):
                try: rebuild()
                except Exception as e: print('  rebuild failed:', e)
            return super().do_GET()
        def end_headers(self): self.send_header('Cache-Control', 'no-store'); super().end_headers()
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), functools.partial(H, directory=str(dev))) as httpd:
        print(f'\n  Live preview: http://localhost:{port}\n  Edit any file in src/ and refresh the page. Ctrl+C to stop.\n')
        try: httpd.serve_forever()
        except KeyboardInterrupt: print('\n  stopped')

# ---------------- checks ----------------
def check():
    node = shutil.which('node')
    if not node: sys.exit('Node.js is needed for checks: install it from nodejs.org, then run this again.')
    b = BUILD / 'check'; b.mkdir(parents=True, exist_ok=True)
    write(b / 'bundle.js', js_bundle())
    r = subprocess.run([node, '--check', str(b / 'bundle.js')], capture_output=True, text=True)
    if r.returncode:
        print(r.stderr); print('  Tip: the error line is in build/check/bundle.js; each file starts with a /* ==== path ==== */ marker.'); sys.exit(1)
    say('JavaScript syntax OK')
    content = [f for f in js_files() if 'src/content' in f.as_posix()]
    r = subprocess.run([node, str(ROOT / 'tools/check_content.js')] + [str(f) for f in content])
    css = css_bundle()
    if css.count('{') != css.count('}'): sys.exit('CSS braces are unbalanced: look for a missing { or } in src/styles/')
    say('CSS braces balanced')
    if r.returncode: sys.exit(1)

def bump(part='patch'):
    v = [int(x) for x in CFG['version'].split('.')]
    i = {'major': 0, 'minor': 1, 'patch': 2}[part]; v[i] += 1
    for j in range(i + 1, 3): v[j] = 0
    CFG['version'] = '.'.join(map(str, v)); CFG['androidVersionCode'] += 1
    write(CFG_PATH, json.dumps(CFG, indent=2) + '\n')
    cl = ROOT / 'CHANGELOG.md'
    if cl.exists():
        t = read(cl); write(cl, t.replace('\n## ', f"\n## {CFG['version']} (unreleased)\n- \n\n## ", 1))
    say(f"version {CFG['version']} · Android versionCode {CFG['androidVersionCode']}")

if __name__ == '__main__':
    args = sys.argv[1:] or ['help']
    cmd = args[0]
    print(f"BrainBurst {CFG['version']}")
    if cmd == 'web': build_web()
    elif cmd == 'android': build_android()
    elif cmd == 'all': build_web(); build_android()
    elif cmd == 'serve': serve(int(args[1]) if len(args) > 1 else 8000)
    elif cmd == 'check': check()
    elif cmd == 'bump': bump(args[1] if len(args) > 1 else 'patch')
    else: print(__doc__)

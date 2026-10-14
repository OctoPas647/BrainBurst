# BrainBurst: SAT prep

A Duolingo-style trainer for the digital SAT, built from BandUp's engine. Two sections, both inside one app:
**SAT Math** and **SAT Reading & Writing**, with a shared streak, XP, hearts, leagues and a predicted score out of 1600.

What's inside:

- **Learning path** for every official SAT content domain and skill (30 skills). Math questions are generated fresh every time, with step-by-step explanations; Reading & Writing questions are hand-written.
- **4 full practice tests** that work like Bluebook: timed modules, a question navigator, mark for review, an adaptive second module, a break, a score report and a full answer review. Plus unlimited generated Math sections.
- **Why each wrong answer is wrong**: every wrong choice, in every lesson, drill and test, has its own short explanation, shown when you pick it and under “Why not the other choices?”.
- **Practice modes**: Weak-Spot Drill, Skill Drill (endless math), Speed Drill, Pacing Trainer, SAT Traps, spaced Mistake Review, Daily Challenge, Bookmarks, Word and Formula flashcards, Word Match.
- **Toolkit**: calculator and grapher (with intercepts and intersections), math reference sheet, formulas to memorize, grammar rules, strategies with drills, test-day checklist, how the SAT works.
- **Progress**: predicted score with a "why this score" breakdown, accuracy and time for every skill, pacing, practice test history, traps that catch you, goal and countdown to test day.

Everything works offline.

Questions are original, written in the style of the digital SAT; they are not College Board questions, and scores are estimates.

**Download:** the latest APK is in [`apk/`](apk/) (currently [BrainBurst-1.2.0.apk](apk/BrainBurst-1.2.0.apk)). Once the signing secret is set up (see below), new versions are also published under **Releases**.

| Target | Command | Output |
|---|---|---|
| Android APK | `python tools/build.py android` | `dist/android/BrainBurst-<version>.apk` |
| Web page (for testing on a PC) | `python tools/build.py web` | `dist/web/index.html` |
| Live preview | `python tools/build.py serve` | http://localhost:8000 |
| Checks | `python tools/build.py check` | syntax + content checks (needs Node.js) |
| Play-throughs | `python tests/play_lessons.py` · `python tests/play_test.py t1 right` | plays the app in a headless browser (needs Playwright) |

## Folder map

```
src/
  index.template.html      page shell (placeholders filled in by the build)
  content/                 everything the learner reads and answers
    00-catalog.js          sections, domains and the 30 SAT skills
    01-gen-helpers.js      helpers for math generators (seeded random numbers, fractions, formatting)
    02-bank-helpers.js     how hand-written questions are registered (lessonSet, testSet)
    gens/                  math question generators, one file per domain
    rw/                    Reading & Writing lessons, one file per domain
    tests/                 practice test definitions and their Reading & Writing modules
    banks/                 reference sheets, strategies, vocabulary, SAT traps
    90-units.js            the learning path (which lessons, in what order)
  app/                     the app code, one file per area, loaded in number order
  styles/                  CSS, one file per area, loaded in number order
platforms/android/         manifest, Java (WebView), bridge.js, signing key (not in git)
.github/workflows/         build-apk.yml: builds and publishes the APK on every push
tests/                     browser play-throughs: play_lessons.py (every lesson), play_test.py (a full practice test)
assets/                    bundled fonts and app icons
tools/                     build.py, check_content.js, config.json (name, version)
```

## Writing questions

Math is written between `$` signs in a small notation without backslashes:
`frac{a}{b}`, `sqrt{x}`, `x^2`, `x^{n+1}`, `bar{AB}`, `pi`, `theta`, `<=`, `>=`, `!=`, `deg`.
A literal dollar sign is `$$` (so `$$12` shows $12).

A Reading & Writing lesson:

```js
lessonSet('wic', 4, 'Lesson title', 'One-line tip shown before the lesson.', [
  { d: 2, ps: 'The passage, with ______ for a blank.', p: 'The question?', o: ['A', 'B', 'C', 'D'], a: 1, x: 'Why B is right.',
    w: ['Why A is wrong.', '', 'Why C is wrong.', 'Why D is wrong.'] }
]);
```

`w` lists why each choice is wrong, in the same order as `o`, with `''` for the correct choice. Every hand-written
multiple-choice question needs it (the checks will tell you if one is missing). In a math generator, write a wrong
choice as `[value, 'why it’s wrong']` inside `mcNum` / `mcStr` and the reasons are attached for you.

`d` is difficulty (1–3). Answer order is shuffled once per question, so write the correct answer anywhere,
and never refer to a choice by its position ("the first choice") in an explanation: quote it instead.
Use `==text==` to underline, `**text**` for bold, `*text*` for italics and lines starting with `- ` for bullet notes.

Extra practice questions that aren't part of a lesson (used by the drills) go in `drillSet('wic', 1, [...])`.
Practice test questions go in `testSet('t1', 'RW', 'm1', [...])` (`m1`, `m2e` easier, `m2h` harder; 27 each),
and every item needs its own `sk`. Tests are listed in `src/content/tests/00-tests.js`; each test’s Math is generated from its `mseed`. Test questions never appear in practice modes.
The number in `lessonSet` / `drillSet` becomes part of each question's id, so don't renumber existing sets:
saved progress (mistakes, bookmarks) refers to those ids.

A math generator returns a fresh question from a seeded random generator `r`; see `src/content/gens/alg.js`.
Run `python tools/build.py check` after editing: it tells you exactly which question has a problem.

## Building the Android APK

You need, once:
- **JDK 17 or newer** (e.g. Eclipse Temurin). Set `JAVA_HOME` to its folder.
- **Android SDK** with *Android 14 (API 34) SDK Platform* and *Build-Tools 35* (Android Studio's SDK Manager, or `sdkmanager "platforms;android-34" "build-tools;35.0.0"`).
- Set `ANDROID_HOME` to the SDK folder (Windows default: `%LOCALAPPDATA%\Android\Sdk`).

Then `python tools/build.py android`.

**Signing key:** put `brainburst.keystore` and `signing.json` in `platforms/android/signing/` (this folder is
kept out of git on purpose because the repository is public). Updates only install over the existing app,
keeping your progress, if they're signed with the same key, so back these two files up somewhere safe.
If the folder is empty, the build creates a new key, and the phone will then need to uninstall the old app first.

Raise the version before each new APK (`python tools/build.py bump`), otherwise Android refuses the update.

## Automatic APK builds on GitHub

`.github/workflows/build-apk.yml` builds the APK on every push to `main`, runs the checks first, and publishes it as a
GitHub Release (**Releases → BrainBurst <version> → BrainBurst-<version>.apk**). Open that page on your phone to install
or update. Pushing again without changing the version replaces the APK in the same release.

It needs your signing key as one repository secret, so the APKs install over the app on your phone:

1. On your PC, zip `brainburst.keystore` and `signing.json` together as `signing.zip`.
2. Turn it into text: `base64 -w0 signing.zip` (Mac: `base64 -i signing.zip`; Windows PowerShell:
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("signing.zip"))`).
3. On GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name it `BRAINBURST_SIGNING`,
   paste the text, save.

Without the secret the build still runs and you can download a test APK from the run’s **Artifacts**, but it’s signed
with a throwaway key and nothing is published.

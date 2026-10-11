# Changelog

## 1.2.0
- Why each wrong answer is wrong: every wrong choice now has its own explanation, in lessons, drills, SAT Traps, Mistake Review and practice test reviews (all 748 hand-written questions and every math generator). Pick a wrong answer and you see why it’s wrong; tap “Why not the other choices?” for the rest. Settings → Study settings can keep that list open.
- Practice Tests 3 and 4: two more full adaptive tests, with 324 new Reading & Writing questions and new Math sections. Test 3’s harder module is closer to the real test’s hardest questions.
- 165 more Reading & Writing drill questions (15 per skill, mostly medium and hard) for Skill Drill, Weak-Spot Drill, Speed Drill and the Daily Challenge.
- Automatic APK builds: every push to GitHub builds a signed APK and publishes it as a release.
- The content checks now require a why-wrong note for every wrong choice.

## 1.1.0
- Practice Tests 1 and 2 now have full Reading & Writing sections: module 1 plus an easier and a harder module 2, 27 questions each (162 new questions), so both full tests can be taken.
- 106 extra Reading & Writing practice questions across all 11 skills, used by Skill Drill, Weak-Spot Drill, Speed Drill, the Daily Challenge and strategy drills.
- Student notes in "Rhetorical Synthesis" questions now show as a bullet list, like on the real test.
- A typed answer key that's too long for the answer box (such as 81/100) is now shown in a form you can enter (.81).
- Clearer explanations: a few now finish the last step (rounding, simplifying), and none refer to answer positions, which are shuffled.
- Line charts no longer cut off the last label; large numbers on chart axes use commas.
- Fixed wording in a few generated Math questions.
- New test scripts: tests/play_lessons.py plays every lesson, tests/play_test.py takes a full practice test.

## 1.0.0
- First version of BrainBurst, built on BandUp's engine.
- SAT Math (19 skills, generated questions with explanations) and SAT Reading & Writing (11 skills, hand-written questions).
- Bluebook-style adaptive practice tests, practice modes, toolkit, flashcards, predicted score out of 1600.

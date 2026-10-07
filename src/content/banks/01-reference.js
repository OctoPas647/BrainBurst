/* ================= Reference content: formulas, grammar, test day, test format ================= */
const FORMULAS = [
  { g: 'Lines', f: [
    ['Slope through two points', '$m = frac{y_2 - y_1}{x_2 - x_1}$'],
    ['Slope-intercept form', '$y = mx + b$: slope $m$, $y$-intercept $b$'],
    ['Point-slope form', '$y - y_1 = m(x - x_1)$'],
    ['Slope of $Ax + By = C$', '$-frac{A}{B}$'],
    ['Parallel lines', 'Equal slopes'],
    ['Perpendicular lines', 'Slopes are negative reciprocals: $m_1 m_2 = -1$']] },
  { g: 'Quadratics', f: [
    ['Quadratic formula', '$x = frac{-b pm sqrt{b^2 - 4ac}}{2a}$'],
    ['Discriminant', '$b^2 - 4ac$: positive → 2 real solutions, zero → 1, negative → none'],
    ['Vertex $x$-coordinate', '$x = -frac{b}{2a}$'],
    ['Vertex form', '$y = a(x - h)^2 + k$ has vertex $(h, k)$'],
    ['Sum and product of solutions', 'Sum $= -frac{b}{a}$, product $= frac{c}{a}$'],
    ['Difference of squares', '$a^2 - b^2 = (a - b)(a + b)$'],
    ['Square of a sum', '$(a + b)^2 = a^2 + 2ab + b^2$']] },
  { g: 'Exponents', f: [
    ['Multiplying powers', '$x^a * x^b = x^{a + b}$'],
    ['Power of a power', '$(x^a)^b = x^{ab}$'],
    ['Negative exponent', '$x^{-a} = frac{1}{x^a}$'],
    ['Fractional exponent', '$x^{frac{m}{n}} = sqrt[n]{x^m}$'],
    ['Zero exponent', '$x^0 = 1$ (for $x != 0$)']] },
  { g: 'Growth and percentages', f: [
    ['Percent change', '$frac{text{new} - text{original}}{text{original}} * 100$'],
    ['Exponential growth', '$y = a(1 + r)^t$'],
    ['Exponential decay', '$y = a(1 - r)^t$'],
    ['Doubling every $k$ units', '$y = a(2)^{frac{t}{k}}$']] },
  { g: 'Coordinate geometry and circles', f: [
    ['Distance between points', '$d = sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$'],
    ['Midpoint', '$(frac{x_1 + x_2}{2}, frac{y_1 + y_2}{2})$'],
    ['Circle equation', '$(x - h)^2 + (y - k)^2 = r^2$: center $(h, k)$, radius $r$'],
    ['Arc length', '$frac{theta}{360} * 2pi r$ (degrees), or $r theta$ (radians)'],
    ['Sector area', '$frac{theta}{360} * pi r^2$'],
    ['Degrees and radians', '$180 deg = pi$ radians']] },
  { g: 'Angles and triangles', f: [
    ['Interior angles of a polygon', '$(n - 2) * 180 deg$'],
    ['Exterior angle of a triangle', 'Equals the sum of the two remote interior angles'],
    ['Similar triangles', 'Corresponding sides are proportional; corresponding angles are equal'],
    ['SOH CAH TOA', '$sin = frac{text{opp}}{text{hyp}}$, $cos = frac{text{adj}}{text{hyp}}$, $tan = frac{text{opp}}{text{adj}}$'],
    ['Complementary angles', '$sin(x deg) = cos(90 deg - x deg)$']] },
  { g: 'Statistics and probability', f: [
    ['Mean', '$frac{text{sum of values}}{text{number of values}}$'],
    ['Median', 'The middle value in order (average the two middle values if there’s an even count)'],
    ['Probability', '$frac{text{favorable outcomes}}{text{total outcomes}}$'],
    ['Independent events', '$P(A text{ and } B) = P(A) * P(B)$'],
    ['Expected count', 'probability × number of trials']] }
];
const GRAMMAR = [
  { t: 'Joining two complete sentences', r: 'Two independent clauses need a period, a semicolon, or a comma plus a FANBOYS word (for, and, nor, but, or, yet, so). A comma alone creates a comma splice.', ex: [[1, 'The museum opened in 1902; it now holds 4,000 paintings.'], [1, 'The museum opened in 1902, and it now holds 4,000 paintings.'], [0, 'The museum opened in 1902, it now holds 4,000 paintings.']] },
  { t: 'Words like “however” and “therefore”', r: 'Conjunctive adverbs (however, therefore, moreover, consequently, nevertheless) can’t join sentences with just a comma. Use a period or semicolon before them.', ex: [[1, 'The trial was small; however, the results were striking.'], [0, 'The trial was small, however, the results were striking.']] },
  { t: 'Colons', r: 'A colon must follow a complete sentence. It introduces a list, an explanation or an example. Never put a colon after “such as”, “including” or a verb.', ex: [[1, 'The team needed one thing: more data.'], [0, 'The kit includes: a map, a torch and water.']] },
  { t: 'Dashes', r: 'Use a pair of dashes around extra information, like a pair of commas. A single dash can work like a colon, after a complete sentence.', ex: [[1, 'The bridge — completed in 1937 — is still in use.'], [0, 'The bridge — completed in 1937, is still in use.']] },
  { t: 'Extra (nonessential) information', r: 'Information that could be removed without changing the sentence’s meaning goes between two commas, two dashes or two parentheses. Be consistent: open and close with the same mark.', ex: [[1, 'Marie Curie, who won two Nobel Prizes, was born in Warsaw.'], [0, 'Marie Curie, who won two Nobel Prizes was born in Warsaw.']] },
  { t: 'Titles and names (restrictive appositives)', r: 'No commas when a title or description comes right before a name and is needed to identify it: “the physicist Lise Meitner”. Use commas when the name is followed by a description: “Lise Meitner, a physicist, …”.', ex: [[1, 'The physicist Lise Meitner explained nuclear fission.'], [0, 'The physicist, Lise Meitner, explained nuclear fission.']] },
  { t: 'No comma between subject and verb', r: 'Never separate a subject from its verb, or a verb from its object, with a single comma, however long the subject is.', ex: [[1, 'The scientists who studied the reef found new species.'], [0, 'The scientists who studied the reef, found new species.']] },
  { t: 'Subject–verb agreement', r: 'Find the true subject and ignore the phrases in between. “The list of tasks is long.” Words like each, every, everyone and a collective noun such as team or committee usually take singular verbs.', ex: [[1, 'The collection of rare stamps is on display.'], [0, 'The collection of rare stamps are on display.']] },
  { t: 'Pronouns', r: 'A pronoun must match the noun it replaces. Singular things, including companies and organizations, take “it/its”; plural nouns take “they/their”. Use “who” for people, “which” or “that” for things.', ex: [[1, 'The company released its annual report.'], [0, 'The company released their annual report.']] },
  { t: 'Possessives and contractions', r: 'its = belonging to it; it’s = it is. their = belonging to them; they’re = they are; there = a place. Singular possessive: the scientist’s notes; plural possessive: the scientists’ notes.', ex: [[1, 'The hive protects its queen.'], [0, 'The hive protects it’s queen.']] },
  { t: 'Verb tense and form', r: 'Keep tenses consistent with the rest of the passage. Use “had” + past participle for an action completed before another past action. Watch irregular forms: had begun, had swum, had written.', ex: [[1, 'By the time the rescue team arrived, the storm had passed.'], [0, 'By the time the rescue team arrived, the storm has passed.']] },
  { t: 'Modifiers', r: 'An introductory descriptive phrase must be followed immediately by the noun it describes.', ex: [[1, 'Walking through the archive, the historian found a forgotten letter.'], [0, 'Walking through the archive, a forgotten letter was found by the historian.']] },
  { t: 'Parallel structure', r: 'Items in a list or comparison must have the same grammatical form.', ex: [[1, 'The program teaches students to code, to design and to test software.'], [0, 'The program teaches students to code, designing and how to test software.']] },
  { t: 'Lists', r: 'Separate three or more items with commas (or with semicolons if the items already contain commas). Don’t put a colon or comma right before the first item if the sentence flows straight into the list.', ex: [[1, 'The expedition visited Lima, Peru; Quito, Ecuador; and Bogotá, Colombia.'], [0, 'The expedition visited, Lima, Quito and Bogotá.']] }
];
const TESTDAY = [
  ['The week before', ['Install or update the Bluebook app and complete the exam setup so you have your admission ticket.', 'Check your test center address and start time, and plan how you’ll get there.', 'Take one full timed practice test, then keep practice light for the last two days.', 'Review your Mistake Review list and the formulas to memorize.']],
  ['The night before', ['Fully charge your testing device and pack the charger.', 'Pack your admission ticket and an acceptable photo ID.', 'Pack pencils or pens for scratch work (scratch paper is provided).', 'Optional: an approved calculator with fresh batteries. Desmos is also built into Bluebook.', 'Pack a snack and water for the break.', 'Go to bed early. Sleep helps more than late-night cramming.']],
  ['On test day', ['Eat breakfast and arrive early.', 'Turn off your phone and put it away when told to.', 'Never leave a question blank: there is no penalty for guessing.', 'Don’t get stuck: mark the question for review and come back.', 'Use the 10-minute break to stand up, drink water and eat your snack.']]
];
const SAT_FORMAT = [
  ['Two sections, four modules', 'The digital SAT has a **Reading and Writing** section and a **Math** section. Each section has two modules.\n\n- Reading and Writing: 2 modules × 27 questions, 32 minutes each (64 minutes total)\n- Math: 2 modules × 22 questions, 35 minutes each (70 minutes total)\n- A 10-minute break between the sections. Total: about 2 hours 14 minutes.'],
  ['It adapts to you', 'Module 1 of each section has a mix of easy, medium and hard questions. How you do on it decides whether module 2 is **easier** or **harder**. The harder module is the only route to the highest scores, so module 1 matters a lot.'],
  ['Scoring', 'Each section is scored from 200 to 800, for a total of 400–1600. Harder questions count for more. There is no penalty for wrong answers, so answer every question. A few questions in each module are unscored pretest questions, and you can’t tell which.'],
  ['Reading and Writing questions', 'Every question has its own short passage (or a pair of passages) and four choices. Questions come grouped by type, roughly in this order: Words in Context, Text Structure and Purpose, Cross-Text Connections, Central Ideas and Details, Command of Evidence, Inferences, Boundaries, Form/Structure/Sense, Transitions and Rhetorical Synthesis.'],
  ['Math questions', 'About three quarters are multiple choice; the rest ask you to type in your answer. A graphing calculator (Desmos) is built in and allowed on every question, and a reference sheet of formulas is available.'],
  ['Domains and weighting', '- Reading and Writing: Craft and Structure about 28%, Information and Ideas about 26%, Standard English Conventions about 26%, Expression of Ideas about 20%\n- Math: Algebra about 35%, Advanced Math about 35%, Problem-Solving and Data Analysis about 15%, Geometry and Trigonometry about 15%']
];

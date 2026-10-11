/* ================= Algebra generators =================
   Each template takes a seeded random generator r and returns one question.
   Difficulty: 1 = easier, 2 = medium, 3 = harder. */

/* ---------- Linear equations in one variable ---------- */
defGen('lin1', {
  1: [
    r => { const x = r.nz(-9, 12), a = r.int(2, 9) * r.pick([1, 1, -1]), b = r.nz(-15, 15), c = a * x + b;
      const p = `$${lin(a, b)} = ${c}$\n\nWhat value of $x$ is the solution to the given equation?`;
      const x_ = `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: $${co(a)} = ${N(c - b)}$. Divide by ${N(a)}: $x = ${N(x)}$.`;
      return r.chance(0.5) ? { p, ...spr(x), x: x_ } : { p, ...mcNum(r, x, [Number.isInteger((c + b) / a) ? [(c + b) / a, `This moves the ${Math.abs(b)} the wrong way: to undo ${b > 0 ? '+' : '−'} ${Math.abs(b)}, ${b > 0 ? 'subtract' : 'add'} ${Math.abs(b)} on both sides.`] : [x - 2, `Check it: $${a}(${x - 2})${plus(b)} = ${a * (x - 2) + b}$, not ${c}.`], [-x, `Sign error. Check it: $${a}(${-x})${plus(b)} = ${-a * x + b}$, not ${c}.`], [x + 1, `Check it: $${a}(${x + 1})${plus(b)} = ${a * (x + 1) + b}$, not ${c}.`], [x - 1, `Check it: $${a}(${x - 1})${plus(b)} = ${a * (x - 1) + b}$, not ${c}.`]]), x: x_ }; },
    r => { const f = r.pick([25, 30, 40, 45, 50, 60]), rate = r.pick([15, 18, 20, 24, 35, 40]), h = r.int(2, 9), T = f + rate * h, who = r.pick(['plumber', 'tutor', 'electrician', 'dog walker', 'cleaning service']);
      return { p: `A ${who} charges a flat fee of ${money(f)} plus ${money(rate)} per hour. A customer paid a total of ${money(T)}. For how many hours was the customer charged?`, ...spr(h), x: `Total = fee + rate × hours, so $${f} + ${rate}h = ${T}$. Then $${rate}h = ${T - f}$ and $h = ${h}$.` }; },
    r => { const a = r.int(2, 9), x = r.int(2, 12), k = r.nz(-9, 9);
      return { p: `If $${a}x = ${a * x}$, what is the value of $${a}x${plus(k)}$?`, ...mcNum(r, a * x + k, [[x + k, `This uses $x = ${x}$ in place of $${a}x = ${a * x}$.`], [a * x - k, `Sign error: the expression is $${a}x${plus(k)}$, so ${k > 0 ? 'add' : 'subtract'} ${Math.abs(k)}.`], [x, `That’s the value of $x$, but the question asks for $${a}x${plus(k)}$.`], [a * (x + k), `This multiplies the ${k} by ${a} too. Only $x$ is multiplied by ${a}.`]]), x: `You don't need $x$: $${a}x$ is already ${a * x}, so $${a}x${plus(k)} = ${a * x}${plus(k)} = ${a * x + k}$.` }; }
  ],
  2: [
    r => { const x = r.nz(-8, 10), a = r.int(2, 7), b = r.nz(-9, 9), c = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== a)), d = a * (x + b) - c * x;
      return { p: `$${a}(${lin(1, b)}) = ${lin(c, d)}$\n\nWhat is the solution to the given equation?`, ...spr(x), x: `Distribute: $${lin(a, a * b)} = ${lin(c, d)}$. Collect $x$ terms on one side and numbers on the other: $${co(a - c)} = ${N(d - a * b)}$${a - c !== 1 ? `, so $x = ${N(x)}$` : ''}.` }; },
    r => { const q = r.int(2, 6), s = r.nz(-6, 9), p0 = r.nz(-8, 8), x = q * s - p0;
      return { p: `$frac{${lin(1, p0)}}{${q}} = ${s}$\n\nWhat value of $x$ satisfies the equation?`, ...mcNum(r, x, [[q * s + p0, `Sign error: to undo ${p0 > 0 ? '+' : '−'} ${Math.abs(p0)}, ${p0 > 0 ? 'subtract' : 'add'} ${Math.abs(p0)}: $x = ${q * s}${plus(-p0)}$.`], [s - p0, `This skips multiplying both sides by ${q} first.`], [s * q, `This multiplies by ${q} but never ${p0 > 0 ? 'subtracts' : 'adds'} the ${Math.abs(p0)}.`], [(s - p0) / q, `This divides by ${q}. To undo dividing by ${q}, multiply both sides by ${q}.`]]), x: `Multiply both sides by ${q}: $${lin(1, p0)} = ${q * s}$. Then $x = ${q * s}${plus(-p0)} = ${x}$.` }; },
    r => { const a = r.int(2, 6), b = r.nz(-9, 9), x = r.nz(-6, 8), c = a * x + b, k = r.int(2, 4);
      return { p: `If $${lin(a, b)} = ${c}$, what is the value of $${lin(k * a, k * b)}$?`, ...mcNum(r, k * c, [[c, `That’s the value of $${lin(a, b)}$. The question’s expression is ${k} times as large.`], [k * c + b, `The new expression is exactly ${k}($${lin(a, b)}$), so its value is $${k}(${c})$ with nothing added.`], [x, `That’s the value of $x$, not of $${lin(k * a, k * b)}$.`], [k * x, `This multiplies $x$ by ${k}. Multiply the value of the whole expression, ${c}, by ${k} instead.`]]), x: `$${lin(k * a, k * b)} = ${k}(${lin(a, b)})$, so its value is $${k} * ${c} = ${k * c}$. Solving for $x$ first also works but takes longer.` }; },
    r => { const a = r.pick([20, 25, 30, 35, 40]), b = r.pick([2, 3, 4, 5, 6]), d = r.int(1, b - 1), x = r.pick([5, 10, 15, 20, 25]), c = a + (b - d) * x;
      return { p: `Phone plan A costs ${money(a)} per month plus ${money(b)} per gigabyte of data. Plan B costs ${money(c)} per month plus ${money(d)} per gigabyte. For how many gigabytes of data in a month do the two plans cost the same?`, ...spr(x), x: `Set the costs equal: $${a} + ${b}g = ${c} + ${d}g$. Then $${b - d}g = ${c - a}$, so $g = ${x}$.` }; }
  ],
  3: [
    r => { const k = r.int(2, 6), m = r.nz(-6, 6), kind = r.pick(['none', 'inf', 'one']);
      let lhs = `${k}(${lin(1, m)})`, rhs, ans;
      if (kind === 'none') { const n = k * m + r.nz(-5, 5); rhs = lin(k, n); ans = 'Zero'; }
      else if (kind === 'inf') { const e = r.int(1, 3); lhs = `${k + e}(${lin(1, m)}) - ${co(e)}`; rhs = poly([[k, 'x'], [(k + e) * m, '']]); ans = 'Infinitely many'; }
      else { const c = r.pick([1, 2, 3, 4, 7, 8].filter(v => v !== k)); rhs = lin(c, r.nz(-9, 9)); ans = 'Exactly one'; }
      const why = { 'Zero': `Both sides have the same $x$ coefficient but different constants, which is impossible to balance, so there are no solutions.`, 'Infinitely many': `Simplifying the left side gives exactly the right side, so every value of $x$ works.`, 'Exactly one': `The $x$ coefficients differ, so the equation simplifies to one value of $x$.` };
      const O = ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'];
      const W = { 'Exactly two': 'A linear equation can’t have exactly two solutions: it has zero, one or infinitely many.',
        'Zero': ans === 'Infinitely many' ? 'Both sides simplify to the same expression, so every value of $x$ works.' : 'The $x$ coefficients differ, so the equation can be solved for one value of $x$.',
        'Exactly one': ans === 'Zero' ? 'The $x$ terms cancel when you simplify, leaving a false statement, so no value of $x$ works.' : 'The $x$ terms cancel and leave a true statement, so every value of $x$ works.',
        'Infinitely many': ans === 'Zero' ? 'After simplifying, the constants differ, so no value of $x$ works, not every value.' : 'The two sides are different expressions, so only one value of $x$ works.' };
      return { p: `$${lhs} = ${rhs}$\n\nHow many solutions does the given equation have?`, o: O, a: O.indexOf(ans), fx: true, w: O.map(o => (o === ans ? '' : W[o])), x: `Expand and compare. ${why[ans]}` }; },
    r => { const m = r.int(2, 9), q = r.nz(-6, 6), s = r.nz(-9, 9), p0 = m * q + s + r.nz(-6, 6);
      return { p: `$kx${plus(p0)} = ${m}(${lin(1, q)})${plus(s)}$\n\nIn the given equation, $k$ is a constant. The equation has no solution. What is the value of $k$?`, ...spr(m), x: `The right side is $${lin(m, m * q + s)}$. With no solution, the $x$ coefficients must match while the constants differ: $k = ${m}$ (and ${p0} ≠ ${m * q + s}).` }; },
    r => { const F = r.pick([
        { p: `$F = frac{9}{5}C + 32$\n\nThe formula converts a temperature $C$ in degrees Celsius to degrees Fahrenheit, $F$. Which equation gives $C$ in terms of $F$?`, a: '$C = frac{5}{9}(F - 32)$', w: [['$C = frac{5}{9}F - 32$', 'The 32 must be subtracted from $F$ before multiplying by $frac{5}{9}$.'], ['$C = frac{9}{5}(F - 32)$', 'To undo multiplying by $frac{9}{5}$, multiply by its reciprocal, $frac{5}{9}$.'], ['$C = frac{5}{9}(F + 32)$', 'To undo adding 32, subtract 32.']], x: 'Subtract 32, then multiply by $frac{5}{9}$: $C = frac{5}{9}(F - 32)$.' },
        { p: `$P = 2l + 2w$\n\nThe formula gives the perimeter $P$ of a rectangle with length $l$ and width $w$. Which equation gives $w$ in terms of $P$ and $l$?`, a: '$w = frac{P - 2l}{2}$', w: [['$w = P - 2l$', 'This gives $2w$. Divide by 2 to get $w$.'], ['$w = frac{P}{2} - 2l$', 'Dividing by 2 applies to the $2l$ as well, which would give $frac{P}{2} - l$.'], ['$w = frac{P + 2l}{2}$', 'To undo adding $2l$, subtract $2l$.']], x: 'Subtract $2l$ and divide by 2: $w = frac{P - 2l}{2}$.' },
        { p: `$v = u + at$\n\nThe equation gives the final speed $v$ of an object with starting speed $u$ and constant acceleration $a$ after time $t$. Which equation gives $t$ in terms of $v$, $u$ and $a$?`, a: '$t = frac{v - u}{a}$', w: [['$t = frac{v + u}{a}$', 'To undo adding $u$, subtract $u$.'], ['$t = frac{v}{a} - u$', 'Subtract $u$ first, then divide all of $v - u$ by $a$.'], ['$t = a(v - u)$', 'To undo multiplying by $a$, divide by $a$.']], x: 'Subtract $u$, then divide by $a$: $t = frac{v - u}{a}$.' },
        { p: `$A = frac{1}{2}h(b + c)$\n\nThe formula gives the area $A$ of a trapezoid with parallel sides $b$ and $c$ and height $h$. Which equation gives $h$ in terms of $A$, $b$ and $c$?`, a: '$h = frac{2A}{b + c}$', w: [['$h = frac{A}{2(b + c)}$', 'To undo the $frac{1}{2}$, multiply by 2; don’t divide by 2.'], ['$h = 2A - (b + c)$', '$h$ is multiplied by $(b + c)$, so divide by it; don’t subtract it.'], ['$h = frac{A}{b + c}$', 'This forgets the $frac{1}{2}$: multiply $A$ by 2 first.']], x: 'Multiply by 2, then divide by $(b + c)$: $h = frac{2A}{b + c}$.' },
        { p: `$I = frac{V}{R}$\n\nOhm’s law relates current $I$, voltage $V$ and resistance $R$. Which equation gives $R$ in terms of $I$ and $V$?`, a: '$R = frac{V}{I}$', w: [['$R = VI$', 'From $IR = V$, divide both sides by $I$; don’t multiply.'], ['$R = frac{I}{V}$', 'This is upside down: from $IR = V$, $R = frac{V}{I}$.'], ['$R = V - I$', 'The variables are related by division, not subtraction.']], x: 'Multiply both sides by $R$: $IR = V$. Divide by $I$: $R = frac{V}{I}$.' },
        { p: `$S = frac{n(a + l)}{2}$\n\nThe formula gives the sum $S$ of $n$ terms of an arithmetic sequence with first term $a$ and last term $l$. Which equation gives $l$ in terms of $S$, $n$ and $a$?`, a: '$l = frac{2S}{n} - a$', w: [['$l = frac{2S - a}{n}$', 'Divide $2S$ by $n$ before subtracting $a$; the $a$ isn’t divided by $n$.'], ['$l = frac{S}{2n} - a$', 'To undo dividing by 2, multiply $S$ by 2; don’t divide.'], ['$l = 2Sn - a$', 'To undo multiplying by $n$, divide by $n$.']], x: 'Multiply by 2 and divide by $n$: $a + l = frac{2S}{n}$. Subtract $a$.' }
      ]);
      return { p: F.p, ...mcStr(r, F.a, F.w), x: F.x }; }
  ]
});

/* ---------- Linear functions ---------- */
const LINF_CTX = [
  { f: 'C', v: 'h', fee: [30, 45, 60], rate: [12, 15, 20, 25], s: (a, b) => `The function $C(h) = ${a} + ${b}h$ gives the total cost, in dollars, of renting a kayak for $h$ hours.`, rateM: 'The cost per hour of renting the kayak', feeM: 'The fixed cost of renting the kayak, in dollars', wrong: ['The total cost of renting the kayak for one hour', 'The number of hours the kayak is rented'], why: [(a, b) => `One hour costs $C(1) = ${a + b}$ dollars, which isn’t either number in the formula.`, () => 'The number of hours is the input $h$, which changes; it isn’t a fixed number in the formula.'] },
  { f: 'W', v: 't', fee: [400, 500, 600], rate: [-8, -10, -12, -15], s: (a, b) => `The function $W(t) = ${a} - ${-b}t$ gives the number of liters of water left in a tank $t$ minutes after it starts draining.`, rateM: 'The number of liters of water that drain from the tank each minute', feeM: 'The number of liters of water in the tank before it starts draining', wrong: ['The number of minutes it takes the tank to empty', 'The number of liters left in the tank after one minute'], why: [(a, b) => `The tank is empty when $W(t) = 0$, at $t = ${fmtNum(a / -b)}$ minutes.`, (a, b) => `After one minute, $W(1) = ${a + b}$ liters.`] },
  { f: 'H', v: 'w', fee: [12, 18, 24], rate: [2, 3, 4], s: (a, b) => `A plant was ${a} centimeters tall when it was first measured. The function $H(w) = ${a} + ${b}w$ gives its height, in centimeters, $w$ weeks after the first measurement.`, rateM: 'The number of centimeters the plant grows each week', feeM: 'The height of the plant, in centimeters, when it was first measured', wrong: ['The height of the plant, in centimeters, after one week', 'The number of weeks the plant was measured'], why: [(a, b) => `After one week, $H(1) = ${a + b}$ centimeters.`, () => 'The number of weeks is the input $w$, which changes; it isn’t a fixed number in the formula.'] },
  { f: 'P', v: 'n', fee: [-200, -150, -300], rate: [4, 5, 6, 8], s: (a, b) => `A club sells candles to raise money. The function $P(n) = ${b}n - ${-a}$ gives the club’s profit, in dollars, from selling $n$ candles.`, rateM: 'The profit, in dollars, the club makes on each candle sold', feeM: 'The club’s costs, in dollars, before any candles are sold', wrong: ['The number of candles the club must sell to make a profit', 'The total profit from selling one candle'], why: [(a, b) => `The club breaks even when $P(n) = 0$, at $n = ${fmtNum(-a / b)}$ candles.`, (a, b) => `Selling one candle gives a profit of $P(1) = ${a + b}$ dollars.`] }
];
defGen('linf', {
  1: [
    r => { const m = r.nz(-6, 7), b = r.nz(-12, 12), k = r.nz(-5, 6);
      return { p: `$f(x) = ${lin(m, b)}$\n\nFor the function $f$ defined above, what is the value of $f(${k})$?`, ...mcNum(r, m * k + b, [[m * k - b, `Sign error on the constant: $f(${k}) = ${m}(${k})${plus(b)}$.`], [m + b + k, `This adds ${k} instead of multiplying it by ${m}.`], [-m * k + b, `Sign error: $${m}(${k}) = ${m * k}$.`], [m * (k + b), `Only $x$ is multiplied by ${m}; the ${b} is added afterward.`]]), x: `Substitute $x = ${k}$: $f(${k}) = ${m}(${k})${plus(b)} = ${m * k + b}$.` }; },
    r => { const c = r.pick(LINF_CTX), a = r.pick(c.fee), b = r.pick(c.rate), askRate = r.chance(0.6);
      const ask = askRate ? N(Math.abs(b)) : N(Math.abs(a)); const ans = askRate ? c.rateM : c.feeM; const other = askRate ? c.feeM : c.rateM;
      return { p: `${c.s(a, b)} What is the best interpretation of ${ask} in this context?`, ...mcStr(r, ans, [[other, askRate ? `That’s what ${N(Math.abs(a))} represents: it comes from the value when $${c.v} = 0$.` : `That’s what ${N(Math.abs(b))} represents: the change for each 1-unit increase in $${c.v}$.`], ...c.wrong.map((t, i) => [t, c.why[i](a, b)])]), x: askRate ? `${ask} multiplies $${c.v}$, so it is how much the output changes for each 1-unit increase in $${c.v}$: the rate.` : `${ask} is the value when $${c.v} = 0$: the starting amount.` }; },
    r => { const m = r.nz(-5, 6), b = r.nz(-10, 10), k = r.nz(-6, 9), v = m * k + b;
      return { p: `The function $f$ is defined by $f(x) = ${lin(m, b)}$. For what value of $x$ does $f(x) = ${v}$?`, ...spr(k), x: `Solve $${lin(m, b)} = ${v}$: $${co(m)} = ${v - b}$, so $x = ${k}$.` }; }
  ],
  2: [
    r => { const m = r.nz(-5, 6), b = r.nz(-9, 9), a1 = r.int(-3, 2), a2 = a1 + r.int(2, 5), c = r.nz(-4, 8), ask = r.pick(['c', 'zero', 'slope']);
      const f = x => m * x + b; const stem = `For the linear function $f$, $f(${a1}) = ${f(a1)}$ and $f(${a2}) = ${f(a2)}$.`;
      if (ask === 'slope') return { p: `${stem} What is the slope of the graph of $y = f(x)$ in the $xy$-plane?`, ...spr(m), x: `Slope $= frac{${f(a2)} - (${f(a1)})}{${a2} - (${a1})} = frac{${f(a2) - f(a1)}}{${a2 - a1}} = ${m}$.` };
      if (ask === 'zero') return { p: `${stem} What is the value of $f(0)$?`, ...spr(b), x: `Slope $= frac{${f(a2) - f(a1)}}{${a2 - a1}} = ${m}$. Then $f(0) = f(${a1}) - ${m}(${a1}) = ${b}$.` };
      return { p: `${stem} What is the value of $f(${c})$?`, ...spr(f(c)), x: `Slope $m = frac{${f(a2) - f(a1)}}{${a2 - a1}} = ${m}$, and $f(x) = ${lin(m, b)}$. So $f(${c}) = ${f(c)}$.` }; },
    r => { const m = r.nz(-4, 5), b = r.nz(-8, 8), x0 = r.int(-2, 1); const X = [x0, x0 + 1, x0 + 2, x0 + 3];
      const ch = { t: 'table', head: ['$x$', ...X.map(String)], rows: [['$f(x)$', ...X.map(v => String(m * v + b))]] };
      return { p: 'The table shows four values of $x$ and their corresponding values of $f(x)$ for the linear function $f$. Which equation defines $f$?', ch, ...mcStr(r, m$(`f(x) = ${lin(m, b)}`), [[m$(`f(x) = ${lin(b, m)}`), 'The slope and the $y$-intercept are swapped.'], [m$(`f(x) = ${lin(m, -b)}`), `The $y$-intercept has the wrong sign: $f(0) = ${b}$.`], [m$(`f(x) = ${lin(-m, b)}`), `The slope has the wrong sign: $f(x)$ ${m > 0 ? 'increases' : 'decreases'} by ${Math.abs(m)} each time $x$ goes up by 1.`], [m$(`f(x) = ${lin(m + 1, b - x0 - 1)}`), `This matches the table only at $x = ${x0 + 1}$. Its slope, ${m + 1}, is wrong.`], [m$(`f(x) = ${lin(m, b + m)}`), `This gives $f(0) = ${b + m}$, but working back from the table, $f(0) = ${b}$.`], [m$(`f(x) = ${lin(-m, -b)}`), 'Both the slope and the $y$-intercept have the wrong sign.']]), x: `Each time $x$ increases by 1, $f(x)$ changes by ${m}, so the slope is ${m}. At $x = 0$, $f(0) = ${b}$. So $f(x) = ${lin(m, b)}$.` }; },
    r => { const m = r.pick([-3, -2, -1, 1, 2, 3, Q(1, 2), Q(-1, 2), Q(2, 3), Q(-3, 2)]), b = r.nz(-4, 4); const mv = typeof m === 'object' ? m.v : m; const mt = typeof m === 'object' ? m : Q(m);
      const fig = { t: 'xy', x: [-6, 6], y: [-6, 6], fns: [{ f: x => mv * x + b }], alt: 'A line in the xy-plane' };
      const opt = (mm, bb) => m$(`y = ${poly([[toQ(mm), 'x'], [bb, '']])}`);
      return { p: 'The graph of $y = f(x)$, where $f$ is a linear function, is shown. Which equation defines $f$?', fig, ...mcStr(r, opt(mt, b), [[opt(mt.neg(), b), `The slope has the wrong sign: the line ${mt.n > 0 ? 'rises' : 'falls'} from left to right.`], [opt(mt, -b), `The line crosses the $y$-axis at ${b}, not ${-b}.`], [opt(Q(mt.d, mt.n), b), `This is run over rise. Slope is rise over run: $${mt.tex()}$.`], [opt(mt.neg(), -b), 'Both the slope and the $y$-intercept have the wrong sign.']]), x: `The line crosses the $y$-axis at ${b}, so the $y$-intercept is ${b}. From that point, move right ${mt.d} and ${mt.n > 0 ? 'up' : 'down'} ${Math.abs(mt.n)}: slope $= ${mt.tex()}$.` }; }
  ],
  3: [
    r => { const m = r.nz(-5, 6), b = r.nz(-9, 9), h = r.nz(-4, 4), k = r.nz(-5, 5), x = r.nz(-4, 5);
      const g = m * (x + h) + b + k;
      return { p: `$f(x) = ${lin(m, b)}$\n\nThe function $g$ is defined by $g(x) = f(${lin(1, h)})${plus(k)}$. What is the value of $g(${x})$?`, ...spr(g), x: `$g(${x}) = f(${x + h})${plus(k)}$. $f(${x + h}) = ${m}(${x + h})${plus(b)} = ${m * (x + h) + b}$, so $g(${x}) = ${g}$.` }; },
    r => { const m = r.int(2, 6) * r.sign(), b = r.nz(-9, 9), a1 = r.int(-2, 2), a2 = a1 + r.int(3, 5), k = r.nz(-4, 9), v = m * k + b;
      return { p: `For a linear function $f$, $f(${a1}) = ${m * a1 + b}$ and $f(${a2}) = ${m * a2 + b}$. If $f(k) = ${v}$, what is the value of $k$?`, ...spr(k), x: `Slope $= frac{${m * (a2 - a1)}}{${a2 - a1}} = ${m}$. Going from $f(${a1}) = ${m * a1 + b}$ to ${v} is a change of ${v - (m * a1 + b)}, which takes $frac{${v - (m * a1 + b)}}{${m}} = ${k - a1}$ steps in $x$. So $k = ${a1} + ${k - a1} = ${k}$.` }; },
    r => { const per = r.pick([4, 5, 6, 8]), start = r.pick([120, 150, 180, 200]), weeks = r.pick([3, 6, 9]), name = pickName(r);
      const total = start + per * 7 * weeks;
      return { p: `${name} saves the same amount of money every day. After ${weeks} weeks, ${name} has ${money(total)} saved, which includes a starting amount of ${money(start)}. If $s(w)$ is the amount saved, in dollars, after $w$ weeks, which function gives $s(w)$?`, ...mcStr(r, m$(`s(w) = ${start} + ${per * 7}w`), [[m$(`s(w) = ${start} + ${per}w`), `${money(per)} is the amount saved each day; each week it is ${money(per * 7)}.`], [m$(`s(w) = ${start * 0 + per * 7}w`), `This leaves out the starting amount of ${money(start)}.`], [m$(`s(w) = ${total} - ${per * 7}w`), 'The savings grow over time, so the weekly amount is added to the starting amount, not subtracted.']]), x: `The weekly increase is $frac{${total} - ${start}}{${weeks}} = ${per * 7}$ dollars (that is ${money(per)} a day × 7). Starting at ${start}: $s(w) = ${start} + ${per * 7}w$.` }; }
  ]
});

/* ---------- Linear equations in two variables ---------- */
defGen('lin2', {
  1: [
    r => { const a = r.int(2, 6), b = r.int(2, 6), x = r.int(0, 6), y = r.int(0, 6), c = a * x + b * y;
      const pt = (p, q) => m$(`(${p}, ${q})`); const wr = [[x + 1, y], [y, x], [x, y + 1], [x + 2, y - 1], [x - 1, y + 2], [x + 1, y + 1], [x + 3, y]].filter(([p, q]) => a * p + b * q !== c).slice(0, 3);
      return { p: `$${a}x + ${b}y = ${c}$\n\nWhich point $(x, y)$ is a solution to the given equation?`, ...mcStr(r, pt(x, y), wr.map(([p, q]) => [pt(p, q), `Check it: $${a}(${p}) + ${b}(${q}) = ${a * p + b * q}$, not ${c}.`])), x: `Substitute each point. $${a}(${x}) + ${b}(${y}) = ${c}$ ✓. The others give a different total.` }; },
    r => { const s = r.pick([2, 3, 4]), l = r.pick([5, 6, 7, 8].filter(v => v % s)), y = r.int(2, 8), x = r.int(2, 10), T = s * x + l * y;
      return { p: `A shipment of small and large boxes weighs ${T} pounds in total. Each small box weighs ${s} pounds and each large box weighs ${l} pounds. The equation $${s}x + ${l}y = ${T}$ represents this situation. If the shipment contains ${y} large boxes, how many small boxes does it contain?`, ...spr(x), x: `Substitute $y = ${y}$: $${s}x + ${l * y} = ${T}$, so $${s}x = ${T - l * y}$ and $x = ${x}$.` }; },
    r => { const m = r.nz(-6, 6), b = r.nz(-9, 9), ask = r.pick(['slope', 'int']);
      return ask === 'slope' ? { p: `What is the slope of the line $y = ${lin(m, b)}$ in the $xy$-plane?`, ...mcNum(r, m, [[b, `${b} is the $y$-intercept. The slope is the coefficient of $x$.`], [-m, `Sign error: the slope is the coefficient of $x$, which is ${m}.`], [-b, 'This is the negative of the $y$-intercept. The slope is the coefficient of $x$.']]), x: `In $y = mx + b$, the slope is the coefficient of $x$: ${m}.` }
        : { p: `What is the $y$-coordinate of the $y$-intercept of the line $y = ${lin(m, b)}$?`, ...mcNum(r, b, [[m, `${m} is the slope. The $y$-intercept is the value of $y$ when $x = 0$.`], [-b, `Sign error: when $x = 0$, $y = ${b}$.`], [-m, 'This is the negative of the slope. Set $x = 0$ to find the $y$-intercept.']]), x: `Set $x = 0$: $y = ${b}$.` }; }
  ],
  2: [
    r => { const x1 = r.int(-5, 3), y1 = r.int(-5, 5), dx = r.int(1, 6), dy = r.nz(-7, 7), m = Q(dy, dx);
      return { p: `A line in the $xy$-plane passes through the points $(${x1}, ${y1})$ and $(${x1 + dx}, ${y1 + dy})$. What is the slope of the line?`, ...spr(m), x: `Slope $= frac{y_2 - y_1}{x_2 - x_1} = frac{${y1 + dy} - (${y1})}{${x1 + dx} - (${x1})} = frac{${dy}}{${dx}} = ${m.tex()}$.` }; },
    r => { const a = r.nz(-7, 7), b = r.nz(-7, 7), c = r.nz(-20, 20); const m = Q(-a, b);
      return { p: `What is the slope of the graph of $${poly([[a, 'x'], [b, 'y']])} = ${c}$ in the $xy$-plane?`, ...mcStr(r, m$(m.tex()), [[Q(a, b), 'Sign error: moving the $x$ term to the other side changes its sign.'], [Q(b, a), 'This is upside down and has the wrong sign. Solve for $y$: the slope is the number in front of $x$.'], [Q(-b, a), 'This is upside down: divide the $x$ coefficient by the $y$ coefficient, not the other way around.'], [Q(c, b), 'That’s the $y$-intercept, not the slope.'], [m.add(1), `Solve for $y$ and read the coefficient of $x$: the slope is $${m.tex()}$.`], [m.sub(1), `Solve for $y$ and read the coefficient of $x$: the slope is $${m.tex()}$.`], [m.mul(2), `This is double the slope, $${m.tex()}$.`], [Q(-c, b), 'That’s the negative of the $y$-intercept, not the slope.']].map(([q, why]) => [m$(q.tex()), why]).filter(([v]) => v !== m$(m.tex()))), x: `Solve for $y$: $${co(b, 'y')} = ${poly([[-a, 'x'], [c, '']])}$, so $y = ${poly([[m, 'x'], [Q(c, b), '']])}$. The slope is $${m.tex()}$.` }; },
    r => { const m = r.nz(-4, 4), x1 = r.nz(-4, 4), y1 = r.nz(-6, 6), b = y1 - m * x1;
      return { p: `Line $ell$ has a slope of ${m} and passes through the point $(${x1}, ${y1})$. Which equation defines line $ell$?`, ...mcStr(r, m$(`y = ${lin(m, b)}`), [[m$(`y = ${lin(m, y1)}`), `This uses ${y1} as the $y$-intercept, but the line passes through $(${x1}, ${y1})$, not $(0, ${y1})$.`], [m$(`y = ${lin(m, y1 + m * x1)}`), `Sign error finding the intercept: $${y1} = ${m}(${x1}) + b$ gives $b = ${b}$.`], [m$(`y = ${lin(-m, b)}`), `The slope must be ${m}, not ${-m}.`]]), x: `Use $y = mx + b$: $${y1} = ${m}(${x1}) + b$, so $b = ${b}$. The line is $y = ${lin(m, b)}$.` }; },
    r => { const m = r.nz(-5, 5), b = r.nz(-12, 12); const xi = Q(-b, m);
      return { p: `In the $xy$-plane, the line $y = ${lin(m, b)}$ crosses the $x$-axis at the point $(a, 0)$. What is the value of $a$?`, ...spr(xi), x: `Set $y = 0$: $0 = ${lin(m, b)}$, so $x = ${xi.tex()}$.` }; }
  ],
  3: [
    r => { const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-12, 12); const perp = Q(b, a);
      return { p: `Line $k$ is perpendicular to the line $${poly([[a, 'x'], [b, 'y']])} = ${c}$ in the $xy$-plane. What is the slope of line $k$?`, ...mcStr(r, m$(perp.tex()), [[Q(-a, b), 'That’s the slope of the given line. A perpendicular slope is its negative reciprocal.'], [Q(a, b), 'This flips the sign of the given slope but doesn’t take the reciprocal.'], [Q(-b, a), 'This takes the reciprocal of the given slope but doesn’t flip the sign.'], [perp.mul(2), `The negative reciprocal of $${Q(-a, b).tex()}$ is $${perp.tex()}$.`], [perp.add(2), `The negative reciprocal of $${Q(-a, b).tex()}$ is $${perp.tex()}$.`], [perp.mul(3), `The negative reciprocal of $${Q(-a, b).tex()}$ is $${perp.tex()}$.`]].map(([q, why]) => [m$(q.tex()), why]).filter(([v]) => v !== m$(perp.tex()))), x: `The given line has slope $${Q(-a, b).tex()}$. A perpendicular slope is the negative reciprocal: $${perp.tex()}$.` }; },
    r => { const m = r.nz(-4, 4), b = r.nz(-6, 6), x1 = r.nz(-5, 5), y1 = r.nz(-8, 8), b2 = y1 - m * x1;
      return { p: `In the $xy$-plane, line $p$ is parallel to the line $y = ${lin(m, b)}$ and passes through the point $(${x1}, ${y1})$. What is the $y$-coordinate of the $y$-intercept of line $p$?`, ...spr(b2), x: `Parallel lines share the slope ${m}. $${y1} = ${m}(${x1}) + b$, so $b = ${b2}$.` }; },
    r => { const x1 = r.int(-5, -1), y1 = r.int(-4, 4), dx = r.int(2, 4), dy = r.nz(-3, 3) * (r.chance(0.5) ? 1 : 1); const m = Q(dy, dx); const b = Q(y1).sub(m.mul(x1));
      if (Math.abs(b.v) > 6) return { p: `A line passes through $(0, 3)$ and $(4, 0)$. What is its slope?`, ...spr(Q(-3, 4)), x: 'Slope $= frac{0 - 3}{4 - 0} = -frac{3}{4}$.' };
      const fig = { t: 'xy', x: [-6, 6], y: [-6, 6], fns: [{ f: x => m.v * x + b.v }], pts: [[x1, y1], [x1 + dx, y1 + dy]], alt: 'A line through two marked points' };
      return { p: 'What is the slope of the line shown in the $xy$-plane? (The marked points have integer coordinates.)', fig, ...spr(m), x: `The marked points are $(${x1}, ${y1})$ and $(${x1 + dx}, ${y1 + dy})$. Slope $= frac{${dy}}{${dx}}${m.d !== dx ? ` = ${m.tex()}` : ''}$.` }; }
  ]
});

/* ---------- Systems of linear equations ---------- */
defGen('sys', {
  1: [
    r => { const k = r.int(2, 5), x = r.int(1, 9), n = x + k * x;
      return { p: `$y = ${k}x$\n$x + y = ${n}$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $x$?`, ...mcNum(r, x, [[k * x, `That’s the value of $y$, not $x$.`], [n - x, `That’s the value of $y$, not $x$.`], [x + 1, `Check it: $x = ${x + 1}$ makes $y = ${k * (x + 1)}$ and $x + y = ${(k + 1) * (x + 1)}$, not ${n}.`], [n - k, `This subtracts ${k} from ${n}. Combine $x + ${k}x = ${k + 1}x$, then divide by ${k + 1}.`]]), x: `Substitute $y = ${k}x$: $x + ${k}x = ${n}$, so $${k + 1}x = ${n}$ and $x = ${x}$.` }; },
    r => { const x = r.int(-5, 12), y = r.int(-6, 9), s = x + y, t = x - y, ask = r.pick(['x', 'y']);
      return { p: `$x + y = ${s}$\n$x - y = ${t}$\n\nIf $(x, y)$ is the solution to the system, what is the value of $${ask}$?`, ...spr(ask === 'x' ? x : y), x: `Add the equations: $2x = ${s + t}$, so $x = ${x}$. Then $y = ${s} - ${x} = ${y}$.` }; }
  ],
  2: [
    r => { const x = r.nz(-6, 6), y = r.nz(-6, 6); let a = r.nz(-5, 5), b = r.nz(-5, 5), d = r.nz(-5, 5), e = r.nz(-5, 5); if (a * e - b * d === 0) e += 1; if (e === 0) e = 2; if (a * e - b * d === 0) { a = 2; b = 3; d = 1; e = -1; }
      const c = a * x + b * y, f = d * x + e * y, ask = r.pick(['x', 'y', 'sum']);
      const val = ask === 'x' ? x : ask === 'y' ? y : x + y;
      return { p: `$${poly([[a, 'x'], [b, 'y']])} = ${c}$\n$${poly([[d, 'x'], [e, 'y']])} = ${f}$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $${ask === 'sum' ? 'x + y' : ask}$?`, ...spr(val), x: `Eliminate one variable (or substitute). The solution is $x = ${x}$, $y = ${y}$${ask === 'sum' ? `, so $x + y = ${x + y}$` : ''}. Check: $${a}(${x}) ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${y}) = ${c}$ ✓.` }; },
    r => { const ad = r.pick([12, 14, 15, 18, 20]), ch = r.pick([6, 7, 8, 9, 10].filter(v => v < ad)), A = r.int(20, 80), C = r.int(20, 90), T = A + C, R = ad * A + ch * C, ev = r.pick(['a school play', 'a museum exhibit', 'a concert', 'a planetarium show']);
      return { p: `Tickets to ${ev} cost ${money(ad)} for adults and ${money(ch)} for children. On one day, ${T} tickets were sold for a total of ${money(R)}. How many adult tickets were sold?`, ...spr(A), x: `Let $a$ = adult and $c$ = child tickets: $a + c = ${T}$ and $${ad}a + ${ch}c = ${R}$. Substitute $c = ${T} - a$: $${ad}a + ${ch}(${T} - a) = ${R}$, so $${ad - ch}a = ${R - ch * T}$ and $a = ${A}$.` }; },
    r => { const x = r.int(1, 8), y = r.int(1, 8), a = r.int(2, 5), b = r.int(1, 4), c = a * x + b * y, d = r.int(1, 4), e = r.int(2, 5), f = d * x + e * y;
      return { p: `$${poly([[a, 'x'], [b, 'y']])} = ${c}$\n$${poly([[d, 'x'], [e, 'y']])} = ${f}$\n\nIf $(x, y)$ satisfies the system, what is the value of $${a + d}x + ${b + e}y$?`, ...mcNum(r, c + f, [[c, `That’s the right side of the first equation only. The coefficients ${a + d} and ${b + e} come from adding both equations.`], [f, `That’s the right side of the second equation only. Add both equations.`], [c - f, `The coefficients ${a + d} and ${b + e} come from adding the equations, so add the right sides too.`], [x + y, `That’s $x + y$, not $${a + d}x + ${b + e}y$.`]]), x: `Add the two equations: $(${a} + ${d})x + (${b} + ${e})y = ${c} + ${f} = ${c + f}$. No need to solve for $x$ and $y$.` }; }
  ],
  3: [
    r => { const a = r.pick([1, 2, 3, 4, 6]), b = r.pick([1, 2, 3, 5]), m = r.pick([2, 3, 4]), c = r.nz(-9, 9), d = m * c + r.nz(-5, 5);
      const k = m * b;
      return { p: `$${poly([[a, 'x'], [b, 'y']])} = ${c}$\n$${poly([[m * a, 'x']])} + ky = ${d}$\n\nIn the given system of equations, $k$ is a constant. If the system has no solution, what is the value of $k$?`, ...spr(k), x: `No solution means the lines are parallel and different: the coefficients must be proportional. The $x$ coefficient was multiplied by ${m}, so $k = ${m} * ${b} = ${k}$ (and the constants are not in that ratio).` }; },
    r => { const a = r.int(2, 6), b = r.int(2, 6), c = r.nz(-12, 12), m = r.int(2, 4);
      return { p: `$${poly([[a, 'x'], [b, 'y']])} = ${c}$\n$${poly([[m * a, 'x']])} + py = q$\n\nIn the given system, $p$ and $q$ are constants. The system has infinitely many solutions. What is the value of $p + q$?`, ...spr(m * b + m * c), x: `Infinitely many solutions means the second equation is the first multiplied by ${m}: $p = ${m * b}$ and $q = ${m * c}$. So $p + q = ${m * b + m * c}$.` }; },
    r => { const m1 = r.nz(-3, 3), b1 = r.nz(-4, 4), m2 = r.pick([-3, -2, -1, 1, 2, 3].filter(v => v !== m1)), x = r.int(-3, 3), b2 = (m1 * x + b1) - m2 * x, y = m1 * x + b1;
      if (Math.abs(b2) > 9 || Math.abs(y) > 6) return { p: '$y = 2x - 1$\n$y = -x + 5$\n\nThe graphs of the equations intersect at $(a, b)$. What is $a + b$?', ...spr(5), x: '$2x - 1 = -x + 5$ gives $x = 2$, $y = 3$, so $a + b = 5$.' };
      const fig = { t: 'xy', x: [-6, 6], y: [-6, 6], fns: [{ f: t => m1 * t + b1, label: 'ℓ' }, { f: t => m2 * t + b2, label: 'k', c: 1 }], alt: 'Two lines crossing' };
      return { p: `The graphs of $y = ${lin(m1, b1)}$ and $y = ${lin(m2, b2)}$ are shown. The solution to the system is $(a, b)$. What is the value of $a + b$?`, fig, ...spr(x + y), x: `Set equal: $${lin(m1, b1)} = ${lin(m2, b2)}$, so $${co(m1 - m2)} = ${b2 - b1}$ and $x = ${x}$. Then $y = ${y}$, so $a + b = ${x + y}$.` }; }
  ]
});

/* ---------- Linear inequalities ---------- */
defGen('ineq', {
  1: [
    r => { const a = r.int(2, 7), b = r.nz(-9, 9), lim = r.int(-3, 8), c = a * lim + b, strict = r.chance(0.5);
      const ok = v => (strict ? a * v + b < c : a * v + b <= c); const cands = [lim - 2, lim - 1, lim, lim + 1, lim + 2, lim + 3]; const good = cands.filter(ok), bad = cands.filter(v => !ok(v));
      const ans = r.pick(good); const opts = r.shuffle(bad).slice(0, 3);
      return { p: `Which value of $x$ is a solution to the inequality $${lin(a, b)} ${strict ? '<' : '<='} ${c}$?`, ...mcNum(r, ans, opts.map(v => [v, `At $x = ${v}$, $${a}(${v})${plus(b)} = ${a * v + b}$, which is not ${strict ? 'less than' : 'less than or equal to'} ${c}.`])), x: `Solve: $${co(a)} ${strict ? '<' : '<='} ${c - b}$, so $x ${strict ? '<' : '<='} ${lim}$. Only ${ans} works among the choices.` }; },
    r => { const n = r.int(3, 12), phr = r.pick([['at least', '>='], ['no more than', '<='], ['more than', '>'], ['less than', '<']]);
      const opt = op => m$(`x ${op} ${n}`); const ops = ['>=', '<=', '>', '<'];
      return { p: `The number of runners, $x$, in a race must be ${phr[0]} ${n}. Which inequality represents this condition?`, ...mcStr(r, opt(phr[1]), ops.filter(o => o !== phr[1]).map(o => [opt(o), `$x ${o} ${n}$ means “${{ '>=': 'at least', '<=': 'at most', '>': 'more than', '<': 'less than' }[o]} ${n}”, not “${phr[0]} ${n}”.`])), x: `“${phr[0]}” translates to “$${phr[1]}$”.` }; }
  ],
  2: [
    r => { const B = r.pick([60, 75, 80, 100, 120]), s = r.pick([12, 15, 18, 22]), p = r.pick([6, 7, 8, 9, 11]), mx = Math.floor((B - s) / p), name = pickName(r);
      return { p: `${name} has ${money(B)} to spend at a fair. Entry costs ${money(s)}, and each ride ticket costs ${money(p)}. What is the greatest number of ride tickets ${name} can buy?`, ...spr(mx), x: `$${s} + ${p}t <= ${B}$, so $t <= frac{${B - s}}{${p}} approx ${((B - s) / p).toFixed(2)}$. The greatest whole number is ${mx}.` }; },
    r => { const a = r.nz(-3, 3), b = r.nz(-3, 3), c = r.pick([-2, -1, 1, 2].filter(v => v !== a)), d = r.nz(-4, 4);
      const good = []; const bad = [];
      for (let x = -4; x <= 4; x++) for (let y = -6; y <= 6; y++) { const s1 = y > a * x + b, s2 = y < c * x + d; (s1 && s2 ? good : bad).push([x, y]); }
      if (!good.length) return { p: 'Which point is a solution to $y > x$ and $y < 4$?', ...mcStr(r, '$(0, 2)$', [['$(3, 1)$', 'At $(3, 1)$, $y > x$ fails: 1 is not greater than 3.'], ['$(1, 5)$', 'At $(1, 5)$, $y < 4$ fails: 5 is not less than 4.'], ['$(4, 4)$', 'At $(4, 4)$, both fail: 4 is not greater than 4, and 4 is not less than 4.']]), x: 'At $(0, 2)$: $2 > 0$ and $2 < 4$ ✓.' };
      const g = r.pick(good); let bs = r.shuffle(bad.filter(([x, y]) => Math.abs(x - g[0]) + Math.abs(y - g[1]) <= 4)).slice(0, 3); if (bs.length < 3) bs = r.shuffle(bad).slice(0, 3);
      const pt = ([x, y]) => m$(`(${x}, ${y})`);
      return { p: `$y > ${lin(a, b)}$\n$y < ${lin(c, d)}$\n\nWhich point $(x, y)$ is a solution to the given system of inequalities?`, ...mcStr(r, pt(g), bs.map(([x, y]) => { const f1 = !(y > a * x + b), f2 = !(y < c * x + d); return [pt([x, y]), `At $(${x}, ${y})$, ${f1 ? `$y > ${lin(a, b)}$ fails: ${y} is not greater than ${a * x + b}` : ''}${f1 && f2 ? ', and ' : ''}${f2 ? `$y < ${lin(c, d)}$ fails: ${y} is not less than ${c * x + d}` : ''}.`]; })), x: `Test $(${g[0]}, ${g[1]})$: $${g[1]} > ${a * g[0] + b}$ ✓ and $${g[1]} < ${c * g[0] + d}$ ✓. Each other point breaks at least one inequality.` }; },
    r => { const a = r.int(2, 6), b = r.nz(-9, 9), lim = r.nz(-6, 6), c = -a * lim + b, op = r.pick(['>=', '>']);
      const flip = { '>=': '<=', '>': '<' }[op];
      return { p: `Which inequality is equivalent to $${lin(-a, b)} ${op} ${c}$?`, ...mcStr(r, m$(`x ${flip} ${lim}`), [[m$(`x ${op} ${lim}`), 'Dividing both sides by a negative number flips the inequality sign.'], [m$(`x ${flip} ${-lim}`), `Sign error in the number: $frac{${c - b}}{${-a}} = ${lim}$.`], [m$(`x ${op} ${-lim}`), `Two slips: the inequality sign must flip, and $frac{${c - b}}{${-a}} = ${lim}$.`]]), x: `Subtract ${b}: $${co(-a)} ${op} ${c - b}$. Dividing by a negative number flips the sign: $x ${flip} ${lim}$.` }; }
  ],
  3: [
    r => { const w = r.pick([14, 15, 16, 18]), t = r.pick([20, 25, 30, 40]), G = r.pick([350, 400, 450, 500, 550]), h = Math.ceil((G - t * 5) / w), name = pickName(r);
      return { p: `${name} earns ${money(w)} per hour at a part-time job and expects ${money(t)} in tips for each of the 5 shifts this week. ${name} wants to earn at least ${money(G)} this week. What is the least number of whole hours ${name} must work?`, ...spr(h), x: `$${w}h + 5(${t}) >= ${G}$ gives $${w}h >= ${G - 5 * t}$, so $h >= ${((G - 5 * t) / w).toFixed(2)}$. Round up: ${h}.` }; },
    r => { const lo = r.int(-6, 2), hi = lo + r.int(5, 12), a = r.pick([2, 3]), b = r.nz(-4, 4);
      const L = a * lo + b, H = a * hi + b; let count = 0; for (let x = -50; x <= 50; x++) if (a * x + b >= L && a * x + b <= H) count++;
      return { p: `$${L} <= ${lin(a, b)} <= ${H}$\n\nHow many integer values of $x$ satisfy the given inequality?`, ...spr(count), x: `Subtract ${b} and divide by ${a}: $${lo} <= x <= ${hi}$. That is $${hi} - (${lo}) + 1 = ${count}$ integers.` }; },
    r => { const m = r.int(1, 3), b = r.int(1, 5), c = r.int(4, 9);
      const fig = { t: 'xy', x: [-6, 6], y: [-6, 10], ly: 2, fns: [{ f: x => m * x + b }], shade: [{ f: x => m * x + b, side: 'below' }], alt: 'A shaded region below a line' };
      return { p: 'The shaded region, including the line, shows the solutions to an inequality. Which inequality is it?', fig, ...mcStr(r, m$(`y <= ${lin(m, b)}`), [[m$(`y >= ${lin(m, b)}`), 'The shading is below the line, so $y$ is less than or equal to the line’s values.'], [m$(`y <= ${lin(-m, b)}`), `The line rises from left to right, so its slope is ${m}, not ${-m}.`], [m$(`y <= ${lin(m, -b)}`), `The line crosses the $y$-axis at ${b}, not ${-b}.`]]), x: `The line has slope ${m} and $y$-intercept ${b}. The region below it (including the line) is $y <= ${lin(m, b)}$.` }; }
  ]
});

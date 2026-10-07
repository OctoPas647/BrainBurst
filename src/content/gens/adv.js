/* ================= Advanced Math generators ================= */
const quad = (a, b, c, v = 'x') => poly([[a, v + '^2'], [b, v], [c, '']]);

/* ---------- Equivalent expressions ---------- */
defGen('eqv', {
  1: [
    r => { const a = r.nz(-7, 7), b = r.nz(-7, 7);
      return { p: `Which expression is equivalent to $(${lin(1, a)})(${lin(1, b)})$?`, ...mcStr(r, m$(quad(1, a + b, a * b)), [m$(quad(1, a * b, a + b)), m$(quad(1, a + b, -a * b)), m$(quad(1, 0, a * b)), m$(quad(1, a - b, a * b)), m$(quad(1, 2 * (a + b), a * b)), m$(quad(1, -(a + b), a * b)), m$(quad(1, a + b, a + b))]), x: `Multiply out (FOIL): $x^2 ${a < 0 ? '-' : '+'} ${co(Math.abs(a))} ${b < 0 ? '-' : '+'} ${co(Math.abs(b))} ${a * b < 0 ? '-' : '+'} ${Math.abs(a * b)} = ${quad(1, a + b, a * b)}$.` }; },
    r => { const a = r.int(2, 9), b = r.nz(-9, 9), c = r.nz(-9, 9), d = r.int(1, 8), e = r.nz(-9, 9), f = r.nz(-9, 9);
      return { p: `Which expression is equivalent to $(${quad(a, b, c)}) - (${quad(d, e, f)})$?`, ...mcStr(r, m$(quad(a - d, b - e, c - f)), [m$(quad(a - d, b + e, c + f)), m$(quad(a + d, b + e, c + f)), m$(quad(a - d, b - e, c + f)), m$(quad(a - d, b + e, c - f))]), x: `Subtract every term of the second expression: $(${a} - ${d})x^2 + (${b} - (${e}))x + (${c} - (${f})) = ${quad(a - d, b - e, c - f)}$.` }; },
    r => { const g = r.int(2, 6), a = r.int(2, 7), b = r.int(1, 9) * r.sign(); if (gcd(a, Math.abs(b)) !== 1) return { p: 'Which expression is equivalent to $6x^2 + 9x$?', ...mcStr(r, '$3x(2x + 3)$', ['$3x(2x + 9)$', '$3(2x^2 + 9x)$', '$x(6x + 3)$']), x: 'The greatest common factor is $3x$: $6x^2 + 9x = 3x(2x + 3)$.' };
      return { p: `Which expression is equivalent to $${poly([[g * a, 'x^2'], [g * b, 'x']])}$?`, ...mcStr(r, m$(`${g}x(${lin(a, b)})`), [m$(`${g}x(${lin(a, g * b)})`), m$(`${g}(${poly([[a, 'x^2'], [g * b, 'x']])})`), m$(`${g}x^2(${lin(a, b)})`), m$(`x(${lin(g * a, b)})`)]), x: `Factor out the greatest common factor, $${g}x$: $${poly([[g * a, 'x^2'], [g * b, 'x']])} = ${g}x(${lin(a, b)})$.` }; }
  ],
  2: [
    r => { const a = r.int(1, 6), b = r.int(1, 9);
      return { p: `Which expression is equivalent to $${poly([[a * a, 'x^2'], [-b * b, '']])}$?`, ...mcStr(r, m$(`(${lin(a, -b)})(${lin(a, b)})`), [m$(`(${lin(a, -b)})^2`), m$(`(${lin(a, b)})^2`), m$(`(${lin(a * a, -b)})(${lin(1, b)})`), m$(`(${lin(a, -b * b)})(${lin(a, 1)})`), m$(`(${lin(a, b)})(${lin(-a, b)})`)]), x: `This is a difference of squares: $(${co(a)})^2 - ${b}^2 = (${lin(a, -b)})(${lin(a, b)})$.` }; },
    r => { const a = r.int(2, 5), b = r.int(2, 4), c = r.int(2, 6);
      return { p: `Which expression is equivalent to $(x^${a})^${b} * x^${c}$, where $x > 0$?`, ...mcStr(r, m$(`x^{${a * b + c}}`), [a + b + c, a * b * c, a + b * c, (a + b) * c, a * (b + c), a * b - c, a * b + c + 1].filter(e => e > 0).map(e => m$(`x^{${e}}`))), x: `Power of a power multiplies exponents: $(x^${a})^${b} = x^{${a * b}}$. Multiplying adds exponents: $x^{${a * b} + ${c}} = x^{${a * b + c}}$.` }; },
    r => { const a = r.int(2, 5), b = r.nz(-7, 7);
      return { p: `Which expression is equivalent to $(${lin(a, b)})^2$?`, ...mcStr(r, m$(quad(a * a, 2 * a * b, b * b)), [m$(quad(a * a, 0, b * b)), m$(quad(a * a, a * b, b * b)), m$(quad(a, 2 * a * b, b * b)), m$(quad(a * a, 2 * a * b, -b * b))]), x: `$(A + B)^2 = A^2 + 2AB + B^2$: $(${co(a)})^2 + 2(${co(a)})(${b}) + (${b})^2 = ${quad(a * a, 2 * a * b, b * b)}$.` }; },
    r => { const a = r.int(1, 5), b = r.nz(-6, 6), c = r.int(1, 5), d = r.nz(-6, 6), ask = r.pick(['q', 'r']);
      const P = a * c, Qm = a * d + b * c, R = b * d;
      return { p: `$(${lin(a, b)})(${lin(c, d)}) = px^2 + qx + r$\n\nIn the given equation, $p$, $q$ and $r$ are constants, and the equation is true for all values of $x$. What is the value of $${ask}$?`, ...spr(ask === 'q' ? Qm : R), x: `Expand: $${co(a)} * ${co(c)} = ${P}x^2$, the middle terms $${co(a)} * ${d} + ${b} * ${co(c)} = ${co(Qm)}$, and $${b} * ${d} = ${R}$. So $q = ${Qm}$ and $r = ${R}$.` }; }
  ],
  3: [
    r => { const [m, n] = r.pick([[2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5]]);
      return { p: `Which expression is equivalent to $x^{frac{${m}}{${n}}}$, where $x > 0$?`, ...mcStr(r, m$(`sqrt[${n}]{x^${m}}`).replace('sqrt[2]', 'sqrt'), [m$(`sqrt[${m}]{x^${n}}`).replace('sqrt[2]', 'sqrt'), m$(`frac{${m}}{${n}}x`), m$(`x^${m} - x^${n}`), m$(`frac{x^${m}}{x^${n}}`)]), x: `A fractional exponent $frac{m}{n}$ means the $n$th root of the $m$th power: $x^{frac{${m}}{${n}}} = sqrt[${n}]{x^${m}}$.`.replace('sqrt[2]', 'sqrt') }; },
    r => { const k = r.int(1, 9);
      return { p: `Which expression is equivalent to $frac{x^2 - ${k * k}}{${lin(1, k)}}$, for $x != ${-k}$?`, ...mcStr(r, m$(lin(1, -k)), [m$(lin(1, k)), m$(lin(1, -k * k)), m$(quad(1, 0, -k)), m$(lin(1, -2 * k)), m$(lin(1, k * k))]), x: `Factor the numerator: $frac{(${lin(1, -k)})(${lin(1, k)})}{${lin(1, k)}} = ${lin(1, -k)}$.` }; },
    r => { const a = r.int(2, 5), b = r.nz(-6, 6), c = r.int(2, 5), d = r.nz(-6, 6);
      const A = a * c, B = a * d + b * c, C = b * d; if (C === 0 || B === 0) return { p: 'If $(ax + 5)(2x + b) = 6x^2 + 19x + 15$ for all $x$, where $a$ and $b$ are constants, what is $a + b$?', ...spr(6), x: '$2a = 6$ gives $a = 3$; $5b = 15$ gives $b = 3$. Check the middle: $3(3) + 5(2) = 19$ ✓. So $a + b = 6$.' };
      return { p: `$(ax${plus(b)})(${co(c)} + d) = ${quad(A, B, C)}$\n\nThe equation is true for all values of $x$, where $a$ and $d$ are constants. What is the value of $a + d$?`, ...spr(a + d), x: `Compare $x^2$ terms: $${c}a = ${A}$, so $a = ${a}$. Compare constants: $${b}d = ${C}$, so $d = ${d}$. Check the middle term: $${a}(${d}) + ${b}(${c}) = ${B}$ ✓. $a + d = ${a + d}$.` }; },
    r => { const k = r.nz(-5, 5), b = r.nz(-8, 8), c = r.nz(-12, 12); const R = k * k - b * k + c;
      return { p: `The expression $frac{${quad(1, b, c)}}{${lin(1, k)}}$ can be written as $x + m + frac{R}{${lin(1, k)}}$, where $m$ and $R$ are constants. What is the value of $R$?`, ...spr(R), x: `The remainder of dividing by $x ${k < 0 ? '-' : '+'} ${Math.abs(k)}$ equals the value of the numerator at $x = ${-k}$: $(${-k})^2 + ${b}(${-k}) + ${c} = ${R}$.` }; }
  ]
});

/* ---------- Nonlinear equations and systems ---------- */
defGen('nleq', {
  1: [
    r => { const s = r.int(2, 15), k = r.pick([0, 0, r.int(1, 20)]);
      return { p: `$x^2${k ? plus(k) : ''} = ${s * s + k}$\n\nWhat is the positive solution to the given equation?`, ...spr(s), x: `${k ? `Subtract ${k}: $x^2 = ${s * s}$. ` : ''}$x = pm ${s}$, so the positive solution is ${s}.` }; },
    r => { const p0 = r.int(1, 9), q0 = r.int(1, 9) * -1, ask = r.pick(['pos', 'sum']);
      const b = -(p0 + q0), c = p0 * q0;
      return ask === 'pos' ? { p: `$${quad(1, b, c)} = 0$\n\nWhat is the positive solution to the given equation?`, ...spr(p0), x: `Factor: $(${lin(1, -p0)})(${lin(1, -q0)}) = 0$, so $x = ${p0}$ or $x = ${q0}$. The positive solution is ${p0}.` }
        : { p: `What is the sum of the solutions to $${quad(1, b, c)} = 0$?`, ...mcNum(r, p0 + q0, [p0 * q0, -(p0 + q0), p0 - q0]), x: `Factor: $(${lin(1, -p0)})(${lin(1, -q0)}) = 0$, so the solutions are ${p0} and ${q0}; their sum is ${p0 + q0}. (Shortcut: the sum is $-frac{b}{a}$.)` }; },
    r => { const b = r.int(2, 9), a = r.nz(-10, 10);
      return { p: `$sqrt{${lin(1, a)}} = ${b}$\n\nWhat is the solution to the given equation?`, ...spr(b * b - a), x: `Square both sides: $${lin(1, a)} = ${b * b}$, so $x = ${b * b - a}$. Check: $sqrt{${b * b}} = ${b}$ ✓.` }; }
  ],
  2: [
    r => { const kind = r.pick([0, 1, 2]); let a = r.int(1, 4), b, c;
      if (kind === 2) { const [p0, q0] = r.distinct(2, -6, 6); b = -a * (p0 + q0); c = a * p0 * q0; }
      else if (kind === 1) { const p0 = r.nz(-6, 6); b = -2 * a * p0; c = a * p0 * p0; }
      else { b = r.int(-6, 6); c = Math.floor(b * b / (4 * a)) + r.int(1, 8); }
      const D = b * b - 4 * a * c; const ans = D > 0 ? 'Exactly two' : D === 0 ? 'Exactly one' : 'Zero'; const O = ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'];
      return { p: `$${quad(a, b, c)} = 0$\n\nHow many distinct real solutions does the given equation have?`, o: O, a: O.indexOf(ans), fx: true, x: `Use the discriminant $b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${D}$. ${D > 0 ? 'Positive: two real solutions.' : D === 0 ? 'Zero: exactly one real solution.' : 'Negative: no real solutions.'}` }; },
    r => { const a = r.int(2, 6), b = r.nz(-15, 15), c = r.nz(-20, 20); const s = Q(-b, a);
      if (b * b - 4 * a * c < 0) return { p: `What is the sum of the solutions to $${quad(a, -b, -c)} = 0$?`, ...spr(Q(b, a)), x: `For $ax^2 + bx + c = 0$, the sum of the solutions is $-frac{b}{a} = ${Q(b, a).tex()}$.` };
      return { p: `What is the sum of the solutions to $${quad(a, b, c)} = 0$?`, ...spr(s), x: `For $ax^2 + bx + c = 0$ the solutions add up to $-frac{b}{a} = -frac{${b}}{${a}}$${s.d !== a ? ` $= ${s.tex()}$` : ''}. (Check: the discriminant is ${b * b - 4 * a * c}, which is not negative, so there are real solutions.)` }; },
    r => { const p0 = r.int(1, 6), q0 = -r.int(1, 6), k = r.int(1, 4), m = r.nz(-5, 5);
      // y = x^2 + m  and  y = kx + n  meet where x^2 - kx + (m - n) = 0 with roots p0, q0 -> sum = k
      const kk = p0 + q0, nn = m - p0 * q0;
      return { p: `$y = x^2${plus(m)}$\n$y = ${lin(kk, nn)}$\n\nThe graphs of the equations in the given system intersect at two points. What is the $x$-coordinate of the intersection point with $x > 0$?`, ...spr(p0), x: `Set equal: $x^2${plus(m)} = ${lin(kk, nn)}$, so $${quad(1, -kk, m - nn)} = 0$. Factor: $(${lin(1, -p0)})(${lin(1, -q0)}) = 0$. The positive root is ${p0}.` }; },
    r => { const a = r.int(2, 5), p0 = r.nz(-5, 5), q0 = r.nz(-5, 5); const b = -a * (p0 + q0), c = a * p0 * q0;
      return { p: `What is the product of the solutions to $${quad(a, b, c)} = 0$?`, ...mcNum(r, p0 * q0, [-(p0 * q0), p0 + q0, c, -b]), x: `The product of the solutions of $ax^2 + bx + c = 0$ is $frac{c}{a} = frac{${c}}{${a}} = ${p0 * q0}$.` }; }
  ],
  3: [
    r => { const v = r.pick(['c', 'k']);
      if (v === 'c') { const h = r.nz(-9, 9); return { p: `$x^2 ${h < 0 ? '+' : '-'} ${Math.abs(2 * h)}x + c = 0$\n\nIn the given equation, $c$ is a constant. The equation has exactly one real solution. What is the value of $c$?`, ...spr(h * h), x: `Exactly one solution means the discriminant is 0: $(${-2 * h})^2 - 4c = 0$, so $c = ${h * h}$. (The left side is $(${lin(1, -h)})^2$.)` }; }
      const t = r.int(1, 5), b = 2 * t * r.int(1, 3), c = t * t; const k = Q(b * b, 4 * c);
      return { p: `$kx^2 + ${b}x + ${c} = 0$\n\nIn the given equation, $k$ is a constant. The equation has exactly one real solution. What is the value of $k$?`, ...spr(k), x: `Set the discriminant to 0: $${b}^2 - 4k(${c}) = 0$, so $${b * b} = ${4 * c}k$ and $k = ${k.tex()}$.` }; },
    r => { const h = r.nz(-4, 4), k = r.nz(-5, 5), c = k + r.pick([-3, -1, 0, 2, 4]);
      const ans = c > k ? 'Exactly two' : c === k ? 'Exactly one' : 'Zero'; const O = ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'];
      return { p: `$y = (${lin(1, -h)})^2${plus(k)}$\n$y = ${c}$\n\nHow many solutions $(x, y)$ does the given system of equations have?`, o: O, a: O.indexOf(ans), fx: true, x: `The parabola opens upward with its lowest point (vertex) at $y = ${k}$. The horizontal line $y = ${c}$ is ${c > k ? 'above the vertex, so it crosses twice' : c === k ? 'exactly at the vertex, so it touches once' : 'below the vertex, so it never meets the parabola'}.` }; },
    r => { // sqrt(x + a) = x - b with one extraneous root
      for (let g = 0; g < 30; g++) { const b = r.int(-3, 4), t = b + r.int(1, 5), a = (t - b) * (t - b) - t; const s = 2 * b + 1 - t;
        const sValid = s - b >= 0 && (s - b) * (s - b) === s + a && s + a >= 0;
        if (sValid || Math.abs(a) > 20) continue;
        return { p: `$sqrt{${lin(1, a)}} = ${lin(1, -b)}$\n\nWhat is the solution to the given equation?`, ...spr(t), x: `Square both sides: $${lin(1, a)} = (${lin(1, -b)})^2$, which gives $${quad(1, -(2 * b + 1), b * b - a)} = 0$, so $x = ${t}$ or $x = ${s}$. Check in the original: $x = ${s}$ makes the right side ${s - b}, which is negative, but a square root can't be negative. Only $x = ${t}$ works.` }; }
      return { p: '$sqrt{x + 7} = x - 5$\n\nWhat is the solution to the given equation?', ...spr(9), x: 'Square: $x + 7 = x^2 - 10x + 25$, so $x^2 - 11x + 18 = 0$: $x = 9$ or $x = 2$. $x = 2$ gives a negative right side, so it is extraneous. The answer is 9.' }; }
  ]
});

/* ---------- Nonlinear functions ---------- */
defGen('nlf', {
  1: [
    r => { const a = r.nz(-3, 4), b = r.nz(-6, 6), c = r.nz(-9, 9), k = r.nz(-3, 4);
      return { p: `$f(x) = ${quad(a, b, c)}$\n\nWhat is the value of $f(${k})$?`, ...mcNum(r, a * k * k + b * k + c, [-a * k * k + b * k + c, a * k * 2 + b * k + c, a * k * k - b * k + c]), x: `$f(${k}) = ${a}(${k})^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${k}) ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${a * k * k} ${b * k < 0 ? '-' : '+'} ${Math.abs(b * k)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${a * k * k + b * k + c}$.` }; },
    r => { const A = r.pick([200, 500, 800, 1200, 2500]), pc = r.pick([2, 3, 4, 5, 6, 8, 12]), thing = r.pick([['the number of members of a club', 'year', 't years after 2020'], ['the population of a town', 'year', 't years after the town was founded'], ['the number of downloads of an app, in thousands', 'month', 't months after launch']]), ask = r.pick(['A', 'r']);
      const f = `${A}(${fmtNum(1 + pc / 100)})^t`;
      return { p: `The function $P(t) = ${f}$ models ${thing[0]}, $t$ ${thing[2].slice(2)}. ${ask === 'A' ? `What is the best interpretation of ${A} in this context?` : `According to the model, by what percent does the quantity increase each ${thing[1]}?`}`, ...(ask === 'A' ? mcStr(r, `The value when $t = 0$`, [`The increase each ${thing[1]}`, `The value after one ${thing[1]}`, `The greatest possible value`]) : mcNum(r, pc, [100 + pc, pc / 100, 1 + pc / 100], v => fmtNum(v) + '%')), x: ask === 'A' ? `At $t = 0$, $(${fmtNum(1 + pc / 100)})^0 = 1$, so $P(0) = ${A}$: the starting value.` : `The growth factor ${fmtNum(1 + pc / 100)} = 1 + ${fmtNum(pc / 100)}, which is an increase of ${pc}% each ${thing[1]}.` }; },
    r => { const b = r.pick([2, 3]), n = r.int(2, b === 2 ? 5 : 3), k = r.nz(-9, 9);
      return { p: `$f(x) = ${b}^x${plus(k)}$\n\nWhat is the value of $f(${n})$?`, ...mcNum(r, Math.pow(b, n) + k, [b * n + k, Math.pow(b, n) - k, Math.pow(n, b) + k]), x: `$${b}^${n} = ${Math.pow(b, n)}$, so $f(${n}) = ${Math.pow(b, n)}${plus(k)} = ${Math.pow(b, n) + k}$.` }; }
  ],
  2: [
    r => { const a = r.pick([1, 2, 3, -1, -2]), h = r.nz(-6, 6), k = r.nz(-9, 9);
      const pt = (x, y) => m$(`(${x}, ${y})`);
      return { p: `$f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}(${lin(1, -h)})^2${plus(k)}$\n\nWhat are the coordinates of the vertex of the graph of $y = f(x)$ in the $xy$-plane?`, ...mcStr(r, pt(h, k), [pt(-h, k), pt(h, -k), pt(-h, -k), pt(k, h)]), x: `In vertex form $a(x - h)^2 + k$, the vertex is $(h, k)$. Here $h = ${h}$ (watch the sign inside the parentheses) and $k = ${k}$.` }; },
    r => { const p0 = r.int(1, 8), q0 = r.int(1, 8), a = r.pick([1, 2, -1]);
      return { p: `$f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}(${lin(1, -p0)})(${lin(1, q0)})$\n\nThe graph of $y = f(x)$ crosses the $x$-axis at the point $(r, 0)$, where $r > 0$. What is the value of $r$?`, ...spr(p0), x: `$f(x) = 0$ when $x = ${p0}$ or $x = ${-q0}$. The positive one is ${p0}.` }; },
    r => { const A = r.pick([18000, 24000, 30000, 1500, 900]), d = r.pick([8, 10, 12, 15, 20, 25]), what = A > 2000 ? 'the value, in dollars, of a car $t$ years after it was bought' : 'the mass, in grams, of a substance remaining $t$ hours after an experiment began', unit = A > 2000 ? 'year' : 'hour';
      const fac = fmtNum(1 - d / 100); const ans = `It decreases by ${d}% each ${unit}.`;
      return { p: `The function $V(t) = ${fmtNum(A)}(${fac})^t$ gives ${what}. Which statement best describes how $V$ changes?`, ...mcStr(r, ans, [`It decreases by ${fmtNum(100 - d)}% each ${unit}.`, `It decreases by ${fac} each ${unit}.`, `It decreases by ${fmtNum(A * d / 100)} each ${unit}.`]), x: `A factor of ${fac} keeps ${fmtNum(100 - d)}% each ${unit}, so the quantity loses ${d}% of its value each ${unit}. The amount lost changes each ${unit}, so it is not a constant ${fmtNum(A * d / 100)}.` }; },
    r => { const a = r.nz(-3, 4), b = r.nz(-5, 5), c = r.int(1, 3), d = r.nz(-4, 4), k = r.nz(-3, 3);
      const g = x => c * x + d, f = x => a * x * x + b;
      return { p: `$f(x) = ${poly([[a, 'x^2'], [b, '']])}$\n$g(x) = ${lin(c, d)}$\n\nWhat is the value of $f(g(${k}))$?`, ...mcNum(r, f(g(k)), [g(f(k)), f(k) * g(k), f(k) + g(k)]), x: `Work from the inside: $g(${k}) = ${g(k)}$. Then $f(${g(k)}) = ${a}(${g(k)})^2${plus(b)} = ${f(g(k))}$.` }; },
    r => { const a = r.pick([1, 1, -1]), h = r.nz(-3, 3), k = r.nz(-4, 4);
      const fig = { t: 'xy', x: [-6, 6], y: [-6, 6], fns: [{ f: x => a * (x - h) * (x - h) + k }], pts: [[h, k]], alt: 'A parabola' };
      const opt = (hh, kk, aa) => m$(`y = ${aa === -1 ? '-' : ''}(${lin(1, -hh)})^2${plus(kk)}`);
      return { p: 'Which equation could define the parabola shown? (The marked point is the vertex.)', fig, ...mcStr(r, opt(h, k, a), [opt(-h, k, a), opt(h, -k, a), opt(h, k, -a), opt(-h, -k, a)]), x: `The vertex is at $(${h}, ${k})$ and the parabola opens ${a > 0 ? 'upward' : 'downward'}, so $y = ${a === -1 ? '-' : ''}(${lin(1, -h)})^2${plus(k)}$.` }; }
  ],
  3: [
    r => { const p0 = r.nz(-5, 5), q0 = r.nz(-6, 6), h = r.nz(-4, 4), k = r.nz(-5, 5);
      const pt = (x, y) => m$(`(${x}, ${y})`);
      return { p: `The vertex of the graph of $y = f(x)$ is $(${p0}, ${q0})$. The function $g$ is defined by $g(x) = f(${lin(1, -h)})${plus(k)}$. What is the vertex of the graph of $y = g(x)$?`, ...mcStr(r, pt(p0 + h, q0 + k), [pt(p0 - h, q0 + k), pt(p0 + h, q0 - k), pt(p0 - h, q0 - k), pt(p0 + k, q0 + h)]), x: `$f(x - h)$ shifts the graph ${h > 0 ? 'right' : 'left'} by ${Math.abs(h)}, and adding ${k} shifts it ${k > 0 ? 'up' : 'down'} by ${Math.abs(k)}. New vertex: $(${p0} + ${h < 0 ? `(${h})` : h}, ${q0} + ${k < 0 ? `(${k})` : k}) = (${p0 + h}, ${q0 + k})$.` }; },
    r => { const A = r.pick([200, 300, 500, 800]), T = r.pick([2, 3, 4, 5, 6]), [what, u] = r.pick([['bacteria in a sample', 'hours'], ['subscribers to a newsletter', 'weeks'], ['fish in a pond', 'months']]);
      return { p: `The number of ${what} is currently ${A} and doubles every ${T} ${u}. Which function gives the number, $N$, after $t$ ${u}?`, ...mcStr(r, m$(`N(t) = ${A}(2)^{frac{t}{${T}}}`), [m$(`N(t) = ${A}(2)^{${T}t}`), m$(`N(t) = ${A}(${T})^{frac{t}{2}}`), m$(`N(t) = ${A} + 2^{frac{t}{${T}}}`), m$(`N(t) = 2(${A})^{frac{t}{${T}}}`)]), x: `Doubling means a factor of 2 for every ${T} ${u}, so the exponent counts how many ${T}-${u.slice(0, -1)} periods have passed: $frac{t}{${T}}$. $N(t) = ${A}(2)^{frac{t}{${T}}}$.` }; },
    r => { const a = r.int(1, 3), K = r.pick([64, 80, 100, 144, 160, 196]), v = 32 * a, h0 = K - 16 * a * a;
      if (h0 < 0) return { p: 'A ball’s height, in feet, $t$ seconds after it is thrown is $h(t) = -16t^2 + 64t + 5$. What is the maximum height of the ball, in feet?', ...spr(69), x: 'The maximum is at $t = frac{-64}{2(-16)} = 2$: $h(2) = -64 + 128 + 5 = 69$.' };
      return { p: `A ball is thrown upward. Its height, in feet, $t$ seconds after it is thrown is given by $h(t) = -16t^2 + ${v}t + ${h0}$. What is the maximum height of the ball, in feet?`, ...spr(K), x: `The maximum is at the vertex: $t = -frac{b}{2a} = -frac{${v}}{2(-16)} = ${a}$. Then $h(${a}) = -16(${a * a}) + ${v * a} + ${h0} = ${K}$.` }; },
    r => { const p0 = r.int(-6, -1), q0 = r.int(1, 7), a = r.pick([1, 2, 3]); const b = -a * (p0 + q0), c = a * p0 * q0; const hv = Q(p0 + q0, 2);
      return { p: `The function $f$ is defined by $f(x) = ${quad(a, b, c)}$. The graph of $y = f(x)$ in the $xy$-plane has a vertex at $(h, k)$. What is the value of $h$?`, ...spr(hv), x: `The vertex is halfway between the $x$-intercepts ${p0} and ${q0} (or use $h = -frac{b}{2a} = -frac{${b}}{${2 * a}}$): $h = ${hv.tex()}$.` }; }
  ]
});

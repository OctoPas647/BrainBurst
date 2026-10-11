/* ================= Problem-Solving and Data Analysis generators ================= */
const sum = a => a.reduce((x, y) => x + y, 0);
const median = a => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };

/* ---------- Ratios, rates, proportions and units ---------- */
defGen('rat', {
  1: [
    r => { const sp = r.pick([45, 50, 55, 60, 62, 65]), h1 = r.int(2, 4), h2 = r.pick([5, 6, 7, 8].filter(v => v !== h1)), what = r.pick(['A car', 'A train', 'A bus']);
      return { p: `${what} travels ${sp * h1} miles in ${h1} hours at a constant speed. At this speed, how many miles will it travel in ${h2} hours?`, ...spr(sp * h2), x: `Speed $= frac{${sp * h1}}{${h1}} = ${sp}$ miles per hour. In ${h2} hours: $${sp} * ${h2} = ${sp * h2}$ miles.` }; },
    r => { const c = r.pick([2, 3, 4]), n1 = r.pick([12, 16, 18, 24]), n2 = r.pick([36, 40, 48, 60, 72].filter(v => v !== n1)), ans = Q(c * n2, n1);
      return { p: `A recipe uses ${c} cups of flour to make ${n1} muffins. At this rate, how many cups of flour are needed to make ${n2} muffins?`, ...spr(ans), x: `Set up a proportion: $frac{${c}}{${n1}} = frac{f}{${n2}}$, so $f = frac{${c} * ${n2}}{${n1}} = ${ans.tex()}$${ans.isInt ? '' : ` (or ${fmtNum(ans.v)})`}.` }; },
    r => { const a = r.int(2, 5), b = r.int(3, 7), k = r.int(3, 9); if (a === b) return { p: 'The ratio of red to blue marbles in a jar is 2 to 3. There are 40 marbles in all. How many are red?', ...spr(16), x: '2 + 3 = 5 parts; each part is 8 marbles; red = 2 × 8 = 16.' };
      const thing = r.pick([['red', 'blue', 'marbles in a jar'], ['fiction', 'nonfiction', 'books on a shelf'], ['cats', 'dogs', 'pets at a shelter']]);
      return { p: `The ratio of ${thing[0]} to ${thing[1]} ${thing[2]} is ${a} to ${b}. There are ${(a + b) * k} ${thing[2].split(' ')[0]} in total, all ${thing[0]} or ${thing[1]}. How many are ${thing[0]}?`, ...spr(a * k), x: `There are $${a} + ${b} = ${a + b}$ equal parts, each worth $frac{${(a + b) * k}}{${a + b}} = ${k}$. ${thing[0][0].toUpperCase() + thing[0].slice(1)}: $${a} * ${k} = ${a * k}$.` }; }
  ],
  2: [
    r => { const [fps, mph] = r.pick([[22, 15], [44, 30], [66, 45], [88, 60], [110, 75]]), toMph = r.chance(0.5);
      return toMph ? { p: `An object moves at ${fps} feet per second. What is this speed in miles per hour? (1 mile = 5,280 feet)`, ...mcNum(r, mph, [[Math.round(fps * 1.5), 'This multiplies by 1.5; convert units step by step instead: feet → miles and seconds → hours.'], [Math.round(fps * 5280 / 3600), 'The conversion factors are upside down: multiply by 3,600 seconds per hour and divide by 5,280 feet per mile.'], [mph * 2, `This is double the correct speed. Check: $${fps} * 3,600 ÷ 5,280 = ${mph}$.`], [fps, 'That’s the speed in feet per second. It still needs converting to miles per hour.']]), x: `$${fps} frac{text{ft}}{text{s}} * 3,600 frac{text{s}}{text{h}} * frac{1 text{ mi}}{5,280 text{ ft}} = frac{${fps * 3600}}{5,280} = ${mph}$ miles per hour.` }
        : { p: `A cyclist rides at ${mph} miles per hour. What is this speed in feet per second? (1 mile = 5,280 feet)`, ...spr(fps), x: `$${mph} * 5,280 = ${mph * 5280}$ feet per hour; divide by 3,600 seconds per hour: $${fps}$ feet per second.` }; },
    r => { const s = r.int(2, 6), dens = r.pick([0.5, 1.5, 2, 2.5, 3, 4]); const mass = s * s * s * dens;
      return { p: `A cube has edges of length ${s} centimeters. The material it is made from has a density of ${fmtNum(dens)} grams per cubic centimeter. What is the mass of the cube, in grams?`, ...spr(mass), x: `Volume $= ${s}^3 = ${s * s * s}$ cubic centimeters. Mass = density × volume $= ${fmtNum(dens)} * ${s * s * s} = ${fmtNum(mass)}$ grams.` }; },
    r => { const sc = r.pick([10, 20, 25, 40, 50]), d = r.pick([1.5, 2.5, 3, 3.5, 4.2, 6]); const real = sc * d;
      return { p: `On a map, 1 inch represents ${sc} miles. Two towns are ${fmtNum(d)} inches apart on the map. What is the actual distance between the towns, in miles?`, ...spr(+real.toFixed(2)), x: `$${fmtNum(d)} * ${sc} = ${fmtNum(real)}$ miles.` }; }
  ],
  3: [
    r => { const ppm = r.pick([12, 15, 18, 20, 24, 25, 30]), hrs = r.pick([2, 3, 4, 5]), pages = ppm * 60 * hrs;
      return { p: `A printer prints ${ppm} pages per minute. At this rate, how many hours will it take to print ${fmtNum(pages)} pages?`, ...spr(hrs), x: `Minutes: $frac{${fmtNum(pages)}}{${ppm}} = ${pages / ppm}$. Hours: $frac{${pages / ppm}}{60} = ${hrs}$.` }; },
    r => { const [a, b] = r.pick([[6, 3], [4, 12], [3, 6], [10, 15], [12, 6], [8, 24], [5, 20]]); const t = Q(a * b, a + b);
      return { p: `Pump A can fill a tank in ${a} hours. Pump B can fill the same tank in ${b} hours. Working together at these rates, how many hours will the two pumps take to fill the tank?`, ...spr(t), x: `Rates add: $frac{1}{${a}} + frac{1}{${b}} = frac{${a + b}}{${a * b}}$ tank per hour. Time $= frac{${a * b}}{${a + b}}${t.d !== a + b || t.n !== a * b ? ` = ${t.tex()}` : ''}$ hours.` }; },
    r => { const mpg = r.pick([24, 25, 30, 32, 40]), price = r.pick([3.2, 3.5, 3.6, 4]), miles = mpg * r.int(4, 12), cost = miles / mpg * price;
      return { p: `A car travels ${mpg} miles per gallon of gasoline. Gasoline costs ${money(price, true)} per gallon. What is the cost, in dollars, of the gasoline needed to drive ${miles} miles?`, ...spr(+cost.toFixed(2)), x: `Gallons: $frac{${miles}}{${mpg}} = ${miles / mpg}$. Cost: $${miles / mpg} * ${fmtNum(price)} = ${fmtNum(cost, 2)}$ dollars.` }; }
  ]
});

/* ---------- Percentages ---------- */
defGen('pct', {
  1: [
    r => { const p0 = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75]), n = r.pick([20, 40, 60, 80, 120, 140, 200, 360]);
      return { p: `What is ${p0}% of ${n}?`, ...spr(+(p0 * n / 100).toFixed(2)), x: `$${p0}% = ${fmtNum(p0 / 100)}$, and $${fmtNum(p0 / 100)} * ${n} = ${fmtNum(p0 * n / 100)}$.` }; },
    r => { const whole = r.pick([20, 25, 40, 50, 60, 80, 200]), p0 = r.pick([10, 15, 20, 30, 35, 40, 45, 60, 75, 80]), part = whole * p0 / 100;
      if (!Number.isInteger(part)) return { p: '45 is what percent of 60?', ...spr(75), x: '$frac{45}{60} = 0.75 = 75%$.' };
      return { p: `${part} is what percent of ${whole}?`, ...spr(p0), x: `$frac{${part}}{${whole}} = ${fmtNum(p0 / 100)}$, which is ${p0}%.` }; }
  ],
  2: [
    r => { const a = r.pick([40, 50, 60, 80, 120, 200, 250]), p0 = r.pick([5, 10, 15, 20, 25, 30, 40, 60]) * r.pick([1, 1, -1]), b = a * (1 + p0 / 100);
      return { p: `The price of an item changed from ${money(a)} to ${money(b)}. By what percent did the price ${p0 > 0 ? 'increase' : 'decrease'}?`, ...spr(Math.abs(p0)), x: `Percent change $= frac{text{change}}{text{original}} * 100 = frac{${fmtNum(Math.abs(b - a))}}{${a}} * 100 = ${Math.abs(p0)}$.` }; },
    r => { const P = r.pick([40, 60, 80, 120, 150]), d = r.pick([10, 20, 25, 30, 40]), t = r.pick([0, 5, 8, 10]);
      const sale = P * (1 - d / 100), total = sale * (1 + t / 100);
      const ansPart = t ? mcNum(r, +total.toFixed(2), [[+(P * (1 - d / 100 + t / 100)).toFixed(2), `This takes both percents of the original price. The tax applies to the sale price, ${money(sale, true)}.`], [+(sale).toFixed(2), 'That’s the sale price before the tax is added.'], [+(P * (1 - (d - t) / 100) * 1.01).toFixed(2), 'This combines the discount and the tax into one percent. Apply them one after the other.'], [+(total + P * 0.05).toFixed(2), `Apply the discount, then the tax: $${fmtNum(sale)}(${fmtNum(1 + t / 100)}) = ${fmtNum(total, 2)}$.`]], v => money(v, true)) : spr(+total.toFixed(2));
      return { p: `A jacket has a price of ${money(P)}. It is on sale for ${d}% off${t ? `, and a ${t}% sales tax is then added to the sale price` : ''}. What is the ${t ? 'total cost' : 'sale price'}, in dollars?`, ...ansPart, x: `Sale price $= ${P}(1 - ${fmtNum(d / 100)}) = ${fmtNum(sale)}$.${t ? ` With tax: $${fmtNum(sale)}(1 + ${fmtNum(t / 100)}) = ${fmtNum(total, 2)}$.` : ''}` }; },
    r => { const orig = r.pick([40, 50, 60, 80, 120, 150, 200]), d = r.pick([10, 20, 25, 40]), up = r.chance(0.3); const now = orig * (up ? 1 + d / 100 : 1 - d / 100);
      return { p: `After a ${d}% ${up ? 'increase' : 'discount'}, the price of a game is ${money(now)}. What was the price, in dollars, before the ${up ? 'increase' : 'discount'}?`, ...mcNum(r, orig, [[up ? now * (1 - d / 100) : now * (1 + d / 100), `This ${up ? 'takes' : 'adds'} ${d}% of the new price, but the ${d}% was ${up ? 'added to' : 'taken off'} the original price.`], [up ? now - d : now + d, `This ${up ? 'subtracts' : 'adds'} ${d} dollars. The change is ${d}%, not ${money(d)}.`], [now / (d / 100), `This divides by ${fmtNum(d / 100)}. The new price is ${up ? 100 + d : 100 - d}% of the original, so divide by ${fmtNum((up ? 100 + d : 100 - d) / 100)}.`]], v => money(v)), x: `The new price is ${up ? 100 + d : 100 - d}% of the original: $${fmtNum((up ? 100 + d : 100 - d) / 100)}p = ${fmtNum(now)}$, so $p = ${orig}$. (Adding ${d}% back to ${fmtNum(now)} is a common mistake: the percent applies to the original price.)` }; }
  ],
  3: [
    r => { const a = r.pick([10, 20, 25, 30, 40, 50]), b = a; const net = (1 + a / 100) * (1 - b / 100); const ch = Math.round((1 - net) * 10000) / 100;
      return { p: `The price of a stock increased by ${a}% on Monday and then decreased by ${b}% on Tuesday. Compared with its price before Monday, what was the overall change?`, ...mcStr(r, `A ${fmtNum(ch)}% decrease`, [[`No change`, `The percents don’t cancel: $${fmtNum(1 + a / 100)} * ${fmtNum(1 - b / 100)} = ${fmtNum(net)}$, which is less than 1.`], [`A ${fmtNum(ch)}% increase`, `The overall factor, ${fmtNum(net)}, is less than 1, so it’s a decrease.`], [`A ${a}% decrease`, 'Percent changes multiply, they don’t add or subtract.']]), x: `Multiply the factors: $${fmtNum(1 + a / 100)} * ${fmtNum(1 - b / 100)} = ${fmtNum(net)}$. That is ${fmtNum(ch)}% below the original. The decrease applies to a bigger number than the increase did.` }; },
    r => { const a = r.pick([120, 125, 150, 160, 200, 250]), b = r.pick([20, 30, 40, 50, 60, 80]);
      return { p: `The number $p$ is ${a}% of $q$, and $q$ is ${b}% of $r$. The number $p$ is what percent of $r$?`, ...spr(a * b / 100), x: `$p = ${fmtNum(a / 100)}q$ and $q = ${fmtNum(b / 100)}r$, so $p = ${fmtNum(a / 100)} * ${fmtNum(b / 100)}r = ${fmtNum(a * b / 10000)}r$, which is ${fmtNum(a * b / 100)}% of $r$.` }; },
    r => { const orig = r.pick([40, 60, 80, 120, 160, 200]), inc = r.pick([25, 50, 20, 75]), pc = r.pick([10, 15, 30, 40, 45]);
      return { p: `When a number is increased by ${inc}%, the result is ${fmtNum(orig * (1 + inc / 100))}. What is ${pc}% of the original number?`, ...spr(+(orig * pc / 100).toFixed(2)), x: `Original: $frac{${fmtNum(orig * (1 + inc / 100))}}{${fmtNum(1 + inc / 100)}} = ${orig}$. Then $${fmtNum(pc / 100)} * ${orig} = ${fmtNum(orig * pc / 100)}$.` }; }
  ]
});

/* ---------- One-variable data ---------- */
defGen('one', {
  1: [
    r => { const n = r.int(4, 7), m = r.int(8, 30); let v = Array.from({ length: n }, () => m + r.int(-6, 6)); const s = sum(v), fix = (n * Math.round(s / n)) - s; v[0] += fix;
      return { p: `What is the mean of the data set ${v.join(', ')}?`, ...spr(sum(v) / n), x: `Mean $= frac{text{sum}}{text{count}} = frac{${sum(v)}}{${n}} = ${sum(v) / n}$.` }; },
    r => { const n = r.pick([5, 6, 7, 8]), v = Array.from({ length: n }, () => r.int(2, 40)); const md = median(v);
      return { p: `What is the median of the data set ${v.join(', ')}?`, ...spr(md), x: `Sort: ${v.slice().sort((a, b) => a - b).join(', ')}. ${n % 2 ? `The middle value is ${md}.` : `The two middle values average to ${fmtNum(md)}.`}` }; }
  ],
  2: [
    r => { const n = r.int(4, 6), mean = r.int(10, 30), v = Array.from({ length: n - 1 }, () => mean + r.int(-7, 7)); const last = n * mean - sum(v);
      if (last < 0) return { p: 'The mean of 5 numbers is 12. Four of them are 10, 14, 9 and 15. What is the fifth number?', ...spr(12), x: 'Sum $= 5 * 12 = 60$; $60 - 48 = 12$.' };
      return { p: `The mean of ${n} numbers is ${mean}. ${n - 1} of the numbers are ${v.join(', ')}. What is the remaining number?`, ...spr(last), x: `The total must be $${n} * ${mean} = ${n * mean}$. The known numbers add to ${sum(v)}, so the last is $${n * mean} - ${sum(v)} = ${last}$.` }; },
    r => { const vals = [0, 1, 2, 3, 4]; const counts = vals.map(() => r.int(1, 6)); const data = vals.flatMap((v, i) => Array(counts[i]).fill(v)); const ask = r.pick(['median', 'mean']);
      const ch = { t: 'table', title: 'Number of pets per household', head: ['Number of pets', 'Frequency'], rows: vals.map((v, i) => [String(v), String(counts[i])]) };
      const ans = ask === 'median' ? median(data) : +(sum(data) / data.length).toFixed(2);
      return { p: `The frequency table summarizes the number of pets in each of ${data.length} households. What is the ${ask} number of pets per household?${ask === 'mean' ? ' (Round to the nearest hundredth if needed.)' : ''}`, ch, ...spr(ans), x: ask === 'median' ? `There are ${data.length} values. The ${data.length % 2 ? `${(data.length + 1) / 2}th` : `${data.length / 2}th and ${data.length / 2 + 1}th`} value${data.length % 2 ? ' is' : 's average to'} ${fmtNum(ans)}.` : `Sum $= ${vals.map((v, i) => `${v}(${counts[i]})`).join(' + ')} = ${sum(data)}$; divide by ${data.length}: ${fmtNum(sum(data) / data.length, 4)}${fmtNum(sum(data) / data.length, 4) !== fmtNum(ans) ? `, which rounds to ${fmtNum(ans)}` : ''}.` }; },
    r => { const lo = r.int(1, 4), vals = [lo, lo + 1, lo + 2, lo + 3, lo + 4, lo + 5], counts = vals.map(() => r.int(0, 5)); counts[r.int(0, 5)] += 2; const data = vals.flatMap((v, i) => Array(counts[i]).fill(v));
      const ch = { t: 'dot', title: 'Goals scored per game', vals: vals.map((v, i) => [v, counts[i]]), min: lo, max: lo + 5, xt: 'Goals' };
      return { p: `The dot plot shows the number of goals a soccer team scored in each of its ${data.length} games. What is the median number of goals per game?`, ch, ...spr(median(data)), x: `Count along the plot to the middle of the ${data.length} values: the median is ${fmtNum(median(data))}.` }; }
  ],
  3: [
    r => { const m = r.int(10, 20), lo1 = m - r.int(4, 8), lo2 = m - r.int(1, 3), hi1 = m + r.int(1, 3), out = m + r.int(25, 60); const data = [lo1, lo2, m, m, m, hi1, out];
      const mean1 = sum(data) / 7, mean2 = sum(data.slice(0, 6)) / 6;
      return { p: `A data set contains the values ${data.join(', ')}. If the value ${out} is removed, which statement is true?`, ...mcStr(r, 'The mean decreases, and the median stays the same.', [['Both the mean and the median decrease.', `The median stays ${m}: the middle values are ${m} both before and after.`], ['The median decreases, and the mean stays the same.', `Removing the very large value ${out} pulls the mean down, and the median stays ${m}.`], ['Neither the mean nor the median changes.', `The mean depends on every value, so removing ${out} lowers it.`]]), x: `The mean drops from ${fmtNum(mean1, 2)} to ${fmtNum(mean2, 2)} because ${out} is far above the rest. The median stays ${m}: the middle values are all ${m} before and after.` }; },
    r => { const k = r.int(3, 12), kind = r.pick(['add', 'mul']);
      return kind === 'add' ? { p: `Each value in a data set is increased by ${k}. Which statement about the new data set is true?`, ...mcStr(r, `The mean increases by ${k}, and the standard deviation does not change.`, [[`The mean and the standard deviation both increase by ${k}.`, 'Shifting every value by the same amount doesn’t change how spread out the values are, so the standard deviation stays the same.'], [`The mean does not change, and the standard deviation increases by ${k}.`, `It’s the other way around: the mean goes up by ${k} and the spread stays the same.`], [`Neither the mean nor the standard deviation changes.`, `Every value goes up by ${k}, so the mean goes up by ${k} too.`]]), x: `Adding the same amount shifts every value (and the mean) by ${k}, but the spread of the values around the mean is unchanged.` }
        : { p: 'Data set A: 10, 10, 11, 12, 12\nData set B: 2, 6, 11, 16, 20\n\nWhich statement compares the standard deviations of the two data sets correctly?', ...mcStr(r, 'The standard deviation of B is greater.', [['The standard deviation of A is greater.', 'The values of A are all close to 11, so A is less spread out.'], ['The standard deviations are equal.', 'The means are equal, but the values of B are much farther from the mean.'], ['There is not enough information to compare them.', 'Every value is listed, so you can see that B is more spread out.']]), x: 'Both sets have a mean of 11, but the values of B are much farther from 11, so B is more spread out and has the greater standard deviation.' }; },
    r => { const a = [r.int(2, 6)], q = [0, 1, 2, 3].map(() => r.int(2, 8)); const v = [a[0]]; q.forEach(d => v.push(v[v.length - 1] + d)); const ask = r.pick(['range', 'iqr']);
      const ch = { t: 'box', title: 'Daily high temperature (°F)', boxes: [{ n: 'Week 1', v }], min: Math.max(0, v[0] - 2 - (v[0] - 2) % 2), max: v[4] + 2 + v[4] % 2, step: 2 };
      return { p: `The box plot summarizes a data set. What is the ${ask === 'range' ? 'range' : 'interquartile range'} of the data?`, ch, ...spr(ask === 'range' ? v[4] - v[0] : v[3] - v[1]), x: ask === 'range' ? `Range = maximum − minimum $= ${v[4]} - ${v[0]} = ${v[4] - v[0]}$.` : `Interquartile range = Q3 − Q1 (the ends of the box) $= ${v[3]} - ${v[1]} = ${v[3] - v[1]}$.` }; }
  ]
});

/* ---------- Two-variable data ---------- */
const SC_CTX = [
  { xl: 'Hours studied', yl: 'Test score', x: [0, 10], y: [40, 100], m: [4, 5, 6], b: [45, 50, 55], unit: ['hour studied', 'points'], who: 'students' },
  { xl: 'Temperature (°F)', yl: 'Drinks sold', x: [50, 100], y: [0, 260], m: [3, 4], b: [-150, -120], unit: ['degree Fahrenheit', 'drinks'], who: 'days at a lemonade stand' },
  { xl: 'Age of car (years)', yl: 'Value (thousands of $)', x: [0, 12], y: [0, 40], m: [-2, -3], b: [32, 36, 38], unit: ['year of age', 'thousand dollars'], who: 'cars' }
];
defGen('two', {
  1: [
    r => { const c = r.pick(SC_CTX), m = r.pick(c.m), b = r.pick(c.b), k = r.int(c.x[0] + 1, c.x[1] - 1), pts = [];
      for (let i = 0; i < 10; i++) { const x = c.x[0] + (c.x[1] - c.x[0]) * (i + 0.5) / 10 + r.int(-1, 1) * (c.x[1] - c.x[0]) / 40; pts.push([+x.toFixed(1), +(m * x + b + r.int(-4, 4) * (c.y[1] - c.y[0]) / 80).toFixed(1)]); }
      const fig = { t: 'scatter', x: c.x, y: c.y, xl: c.xl, yl: c.yl, pts: pts.map(p => [p[0], p[1]]), fns: [{ f: x => m * x + b, c: 1 }], alt: 'Scatterplot with a line of best fit' };
      return { p: `The scatterplot shows data for ${pts.length} ${c.who} and a line of best fit with equation $y = ${lin(m, b)}$. According to the line of best fit, what is the predicted value of $y$ when $x = ${k}$?`, fig, ...spr(m * k + b), x: `Substitute: $y = ${m}(${k})${plus(b)} = ${m * k + b}$.` }; },
    r => { const c = r.pick(SC_CTX), m = r.pick(c.m), b = r.pick(c.b);
      return { p: `A line of best fit for data about ${c.who} is $y = ${lin(m, b)}$, where $x$ is the ${c.xl[0].toLowerCase() + c.xl.slice(1)} and $y$ is the ${c.yl[0].toLowerCase() + c.yl.slice(1)}. What is the best interpretation of ${Math.abs(m)} in this context?`, ...mcStr(r, `Each additional ${c.unit[0]} is associated with ${m > 0 ? 'an increase' : 'a decrease'} of about ${Math.abs(m)} ${c.unit[1]}.`, [[`Each additional ${c.unit[0]} is associated with ${m > 0 ? 'a decrease' : 'an increase'} of about ${Math.abs(m)} ${c.unit[1]}.`, `The slope is ${m > 0 ? 'positive, so it’s an increase' : 'negative, so it’s a decrease'}.`], [`The predicted value of $y$ when $x = 0$ is ${Math.abs(m)}.`, `That’s the $y$-intercept, ${b}. ${Math.abs(m)} is the slope.`], [`Every one of the ${c.who} follows the line exactly, changing by ${Math.abs(m)} ${c.unit[1]}.`, 'A line of best fit describes the overall trend; individual data points don’t lie exactly on it.']]), x: `The slope of the line of best fit is the predicted change in $y$ for each 1-unit increase in $x$. It is ${m > 0 ? 'positive' : 'negative'}, so it's ${m > 0 ? 'an increase' : 'a decrease'}.` }; }
  ],
  2: [
    r => { const m = r.pick([-2, -1, 1, 2]) * r.pick([1, 0.5]), b = r.int(1, 4) * (m < 0 ? 3 : 1), pts = [];
      for (let i = 0; i < 9; i++) { const x = 0.5 + i; pts.push([x, +(m * x + b + (r.f() - 0.5) * 2).toFixed(1)]); }
      const ys = pts.map(p => p[1]); const ymin = Math.min(0, Math.floor(Math.min(...ys))), ymax = Math.ceil(Math.max(...ys)) + 1;
      const fig = { t: 'scatter', x: [0, 10], y: [ymin, ymax], xs: 1, ys: 1, lx: 2, ly: ymax - ymin > 10 ? 2 : 1, xl: 'x', yl: 'y', pts, alt: 'Scatterplot' };
      const opt = (mm, bb) => m$(`y = ${poly([[mm, 'x'], [bb, '']])}`);
      return { p: 'Which equation best models the data shown in the scatterplot?', fig, ...mcStr(r, opt(m, b), [[opt(-m, b), `The slope has the wrong sign: the points ${m > 0 ? 'rise' : 'fall'} from left to right.`], [opt(m, -b), `Near $x = 0$ the data are close to $y = ${b}$, not $y = ${-b}$.`], [opt(-m, -b), 'Both the slope and the $y$-intercept have the wrong sign.'], [opt(m * 3, b), `This line is too steep: it changes by ${fmtNum(Math.abs(m * 3))} for each unit of $x$, but the data change by about ${fmtNum(Math.abs(m))}.`]]), x: `The points ${m > 0 ? 'rise' : 'fall'} from left to right, so the slope is ${m > 0 ? 'positive' : 'negative'}. Near $x = 0$ the data are close to $y = ${b}$, so the $y$-intercept is about ${b}.` }; },
    r => { const c = r.pick(SC_CTX), m = r.pick(c.m), b = r.pick(c.b), x1 = r.int(c.x[0] + 1, c.x[1] - 4), x2 = x1 + r.int(2, 3);
      return { p: `The line of best fit for a data set about ${c.who} is $y = ${lin(m, b)}$, where $x$ is the ${c.xl[0].toLowerCase() + c.xl.slice(1)}. According to the line, how much greater is the predicted value of $y$ at $x = ${x2}$ than at $x = ${x1}$?`, ...spr(m * (x2 - x1)), x: `The difference is the slope times the change in $x$: $${m}(${x2} - ${x1}) = ${m * (x2 - x1)}$.` }; }
  ],
  3: [
    r => { const m = r.int(2, 6), b = r.int(5, 30), x = r.int(3, 9), res = r.nz(-6, 6), y = m * x + b + res;
      return { p: `A line of best fit for a data set is $y = ${lin(m, b)}$. One data point is $(${x}, ${y})$. What is the residual for this point (actual $y$ minus predicted $y$)?`, ...spr(res), x: `Predicted: $${m}(${x}) + ${b} = ${m * x + b}$. Residual $= ${y} - ${m * x + b} = ${res}$.` }; },
    r => { const kind = r.pick(['ei', 'ed', 'li', 'ld']); const x = [0, 1, 2, 3, 4]; let y;
      if (kind === 'ei') { const a = r.pick([2, 3, 5]), g = r.pick([2, 3]); y = x.map(t => a * Math.pow(g, t)); }
      else if (kind === 'ed') { const g = r.pick([2, 3]), a = Math.pow(g, 4) * r.pick([1, 2, 5]); y = x.map(t => a / Math.pow(g, t)); }
      else if (kind === 'li') { const a = r.int(2, 9), d = r.int(3, 12); y = x.map(t => a + d * t); }
      else { const d = r.int(3, 9), a = d * 4 + r.int(5, 30); y = x.map(t => a - d * t); }
      const ch = { t: 'table', head: ['$x$', ...x.map(String)], rows: [['$y$', ...y.map(v => fmtNum(v))]] };
      const L = { ei: 'Increasing exponential', ed: 'Decreasing exponential', li: 'Increasing linear', ld: 'Decreasing linear' };
      return { p: 'Which type of function best models the relationship between $x$ and $y$ shown in the table?', ch, ...mcStr(r, L[kind], Object.values(L).filter(v => v !== L[kind]), true), o: Object.values(L), a: Object.values(L).indexOf(L[kind]), fx: true, w: Object.keys(L).map(kk => (kk === kind ? '' : kk[0] !== kind[0] ? (kk[0] === 'e' ? `$y$ changes by the same amount (${y[1] - y[0]}) each step, which is linear, not exponential.` : '$y$ is multiplied by the same factor each step, which is exponential, not linear.') : `The values ${y[1] > y[0] ? 'increase' : 'decrease'} as $x$ increases.`)), x: kind[0] === 'e' ? `Each time $x$ increases by 1, $y$ is multiplied by the same factor, which makes it exponential (${kind === 'ei' ? 'increasing' : 'decreasing'}).` : `Each time $x$ increases by 1, $y$ changes by the same amount (${y[1] - y[0]}), which makes it linear.` }; }
  ]
});

/* ---------- Probability and conditional probability ---------- */
defGen('prob', {
  1: [
    r => { const red = r.int(2, 9), blue = r.int(2, 9), green = r.int(1, 8), t = red + blue + green, ask = r.pick(['red', 'blue', 'not green']);
      const fav = ask === 'red' ? red : ask === 'blue' ? blue : red + blue; const pr = Q(fav, t);
      return { p: `A bag contains ${red} red, ${blue} blue and ${green} green marbles. One marble is chosen at random. What is the probability that it is ${ask}?`, ...spr(pr), x: `Favorable outcomes: ${fav}. Total: ${t}. Probability $= frac{${fav}}{${t}}${pr.d !== t ? ` = ${pr.tex()}` : ''}$.` }; },
    r => { const a = r.int(5, 24), b = r.int(5, 24), c = r.int(5, 24), d = r.int(5, 24); const T = a + b + c + d;
      const ch = { t: 'table', title: 'Survey of students', head: ['', 'Plays a sport', 'Does not play a sport', 'Total'], rows: [['Grade 10', a, b, a + b], ['Grade 11', c, d, c + d], ['Total', a + c, b + d, T]].map(rw => rw.map(String)) };
      const pr = Q(a + c, T);
      return { p: 'The table shows the results of a survey of students. If one of the students surveyed is chosen at random, what is the probability that the student plays a sport?', ch, ...spr(pr), x: `Students who play a sport: ${a + c}. Total students: ${T}. Probability $= frac{${a + c}}{${T}}$${pr.d !== T ? ` $= ${pr.tex()}$` : ''}.` }; }
  ],
  2: [
    r => { const a = r.int(5, 30), b = r.int(5, 30), c = r.int(5, 30), d = r.int(5, 30); const ask = r.pick(['g11', 'sport']);
      const ch = { t: 'table', title: 'Survey of students', head: ['', 'Plays an instrument', 'Does not play', 'Total'], rows: [['Grade 9', a, b, a + b], ['Grade 12', c, d, c + d], ['Total', a + c, b + d, a + b + c + d]].map(rw => rw.map(String)) };
      if (ask === 'g11') { const pr = Q(c, c + d); return { p: 'Based on the table, if a Grade 12 student from the survey is chosen at random, what is the probability that the student plays an instrument?', ch, ...spr(pr), x: `Only the Grade 12 row counts: $frac{${c}}{${c + d}}$${pr.d !== c + d ? ` $= ${pr.tex()}$` : ''}.` }; }
      const pr = Q(a, a + c); return { p: 'Based on the table, if a student who plays an instrument is chosen at random, what is the probability that the student is in Grade 9?', ch, ...spr(pr), x: `Only the “Plays an instrument” column counts: $frac{${a}}{${a + c}}$${pr.d !== a + c ? ` $= ${pr.tex()}$` : ''}.` }; },
    r => { const p0 = r.pick([0.05, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3]), n = r.pick([200, 300, 400, 500, 600, 800, 1000]);
      return { p: `The probability that a randomly chosen light bulb from a factory is defective is ${fmtNum(p0)}. If ${n} bulbs are chosen at random, how many would be expected to be defective?`, ...spr(Math.round(p0 * n)), x: `Expected number $= ${fmtNum(p0)} * ${n} = ${fmtNum(p0 * n)}$.` }; }
  ],
  3: [
    r => { const a = r.int(5, 20), b = r.int(5, 20), c = r.int(5, 20), d = r.int(5, 20), e = r.int(5, 20), f = r.int(5, 20);
      const ch = { t: 'table', title: 'Preferred lunch option by grade', head: ['', 'Salad', 'Pasta', 'Soup', 'Total'], rows: [['Grade 10', a, b, c, a + b + c], ['Grade 11', d, e, f, d + e + f], ['Total', a + d, b + e, c + f, a + b + c + d + e + f]].map(rw => rw.map(String)) };
      const pr = Q(b, b + c);
      return { p: 'A student from Grade 10 who did not choose salad is selected at random. What is the probability that this student chose pasta?', ch, ...spr(pr), x: `Restrict to Grade 10 students who did not choose salad: $${b} + ${c} = ${b + c}$ students. Of these, ${b} chose pasta: $frac{${b}}{${b + c}}$${pr.d !== b + c ? ` $= ${pr.tex()}$` : ''}.` }; },
    r => { const n = r.pick([6, 8, 10]), k = r.int(1, n - 1);
      return { p: `A fair spinner is divided into ${n} equal sections numbered 1 through ${n}. It is spun twice. What is the probability that both spins land on a number greater than ${k}?`, ...spr(Q((n - k) * (n - k), n * n)), x: `Each spin lands on a number greater than ${k} with probability $frac{${n - k}}{${n}}$. The spins are independent, so multiply: $frac{${(n - k) * (n - k)}}{${n * n}}$${Q((n - k) * (n - k), n * n).d !== n * n ? ` $= ${Q((n - k) * (n - k), n * n).tex()}$` : ''}${sprFit(Q((n - k) * (n - k), n * n).str()).includes('/') ? '' : `, entered as ${sprFit(Q((n - k) * (n - k), n * n).str())} (the fraction is too long for the answer box)`}.` }; }
  ]
});

/* ---------- Sample statistics and margin of error ---------- */
defGen('infr', {
  2: [
    r => { const est = r.int(30, 70), moe = r.pick([2, 3, 4, 5]), topic = r.pick(['support building a new park', 'prefer online classes', 'walk to work', 'own a pet']);
      const inside = est + r.int(-moe + 1, moe - 1), outs = [est - moe - r.int(2, 6), est + moe + r.int(2, 6), est + 2 * moe + r.int(3, 9)];
      return { p: `A survey of a random sample of adults in a city found that ${est}% ${topic}, with a margin of error of ${moe}%. Which of the following is a plausible value for the percent of all adults in the city who ${topic}?`, ...mcNum(r, inside, outs.map(v => [v, `${v}% is outside the plausible range, ${est - moe}% to ${est + moe}%.`]), v => v + '%'), x: `The plausible range is ${est} ± ${moe}, from ${est - moe}% to ${est + moe}%. Only ${inside}% is in that interval.` }; },
    r => { const n = r.pick([100, 120, 150, 200, 250, 400]), p0 = r.pick([0.12, 0.15, 0.18, 0.2, 0.24, 0.3, 0.35]), N0 = r.pick([1200, 1500, 1800, 2000, 2400, 3000]); const k = Math.round(n * p0);
      return { p: `A random sample of ${n} students at a school was asked about their favorite subject; ${k} chose science. The school has ${fmtNum(N0)} students. Based on the sample, about how many students at the school would choose science?`, ...spr(Math.round(N0 * k / n)), x: `The sample proportion is $frac{${k}}{${n}}$. Apply it to the whole school: $frac{${k}}{${n}} * ${fmtNum(N0)} = ${fmtNum(N0 * k / n)}$${Number.isInteger(N0 * k / n) ? '' : `, or about ${fmtNum(Math.round(N0 * k / n))} students`}.` }; }
  ],
  3: [
    r => { const topic = r.pick(['the average number of hours students sleep', 'the percent of voters who support a proposal', 'the average daily screen time of teenagers']);
      return { p: `Researchers estimated ${topic} using a random sample of 300 people, and reported a margin of error. Which change would most likely decrease the margin of error?`, ...mcStr(r, 'Using a random sample of 1,200 people instead', [['Using a random sample of 100 people instead', 'A smaller sample varies more, so the margin of error would increase.'], ['Asking only volunteers who answer an online poll', 'Volunteers aren’t a random sample, so the results could be biased, and the margin of error no longer applies.'], ['Reporting the results to more decimal places', 'Extra decimal places don’t make an estimate any less uncertain.']]), x: 'Larger random samples vary less from sample to sample, so the margin of error gets smaller. Volunteers are not a random sample, and decimal places don’t change uncertainty.' }; },
    r => { const place = r.pick([['members of a gym', 'members of the gym', 'exercise at least three times a week'], ['visitors to a public library', 'visitors to the library', 'read more than ten books a year'], ['skaters at a skate park', 'skaters at the park', 'think the city should build more skate parks']]);
      return { p: `A researcher surveyed 500 randomly selected ${place[0]} and found that 70% ${place[2]}. Which conclusion is best supported?`, ...mcStr(r, `About 70% of all ${place[1]} ${place[2]}.`, [[`About 70% of all adults in the country ${place[2]}.`, `Only ${place[1]} were sampled, so the result can’t be extended to all adults.`], [`About 70% of all residents of the city ${place[2]}.`, `Only ${place[1]} were sampled; they may differ from other residents.`], [`No conclusion can be drawn about any group because the sample was random.`, 'Random sampling is what allows a conclusion about the population that was sampled.']]), x: `Random sampling lets you generalize only to the population that was sampled: ${place[1]}. They are probably different from the general public.` }; }
  ]
});

/* ---------- Observational studies and experiments ---------- */
const STUDY = [
  ['drinking green tea every day', 'blood pressure', 'lower blood pressure'],
  ['listening to music while studying', 'test scores', 'higher test scores'],
  ['taking a daily vitamin D supplement', 'sick days', 'fewer sick days'],
  ['doing a 10-minute stretching routine each day', 'back pain', 'less back pain'],
  ['using a speed-reading app', 'reading speed', 'faster reading speeds']
];
defGen('stud', {
  2: [
    r => { const [tr, out, res] = r.pick(STUDY);
      return { p: `Researchers recruited 200 volunteers. They randomly assigned half of them to start ${tr} for eight weeks; the other half made no change. The group assigned to ${tr} showed significantly ${res}. Which conclusion is most appropriate?`, ...mcStr(r, `${tr[0].toUpperCase() + tr.slice(1)} causes ${res} for people similar to these volunteers.`, [[`${tr[0].toUpperCase() + tr.slice(1)} causes ${res} for all people.`, 'The subjects were volunteers, not a random sample of all people, so the result applies only to people like them.'], [`There is an association, but no cause-and-effect conclusion is possible.`, 'Subjects were randomly assigned to groups, so this experiment does support cause and effect.'], [`People with ${res} are more likely to choose ${tr}.`, 'The researchers assigned the treatment; the subjects didn’t choose it.']]), x: 'Random assignment to groups allows a cause-and-effect conclusion. But the subjects were volunteers, not a random sample, so the result applies only to people like them.' }; }
  ],
  3: [
    r => { const [tr, out, res] = r.pick(STUDY);
      return { p: `A researcher surveyed a random sample of 1,000 adults in a state. Those who reported ${tr} tended to have ${res} than those who did not. Which conclusion is most appropriate?`, ...mcStr(r, `Among adults in the state, ${tr} is associated with ${res}, but it can’t be concluded that one causes the other.`, [[`${tr[0].toUpperCase() + tr.slice(1)} causes ${res} among adults in the state.`, 'This is an observational study with no random assignment, so it can’t show cause and effect.'], [`${tr[0].toUpperCase() + tr.slice(1)} causes ${res} for all people.`, 'No cause and effect (no random assignment), and the sample only represents adults in the state.'], [`No conclusion is possible because the sample was random.`, 'A random sample is what allows a conclusion about all adults in the state, an association.']]), x: 'Random sampling lets you generalize to all adults in the state, but without random assignment to groups (this is an observational study) you can only claim an association, not cause and effect.' }; }
  ]
});

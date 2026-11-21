// 九九乘法（11/21）：草莓、盤子、青蛙、每個數字的生活例子、數字圖卡、牆上的九九乘法表、黑板上的數線與點點陣列。
// 台灣的寫法：a × b 是「每份 a 個，有 b 份」；口訣「a 的乘法」就是 a×1 到 a×9。

export const STRAWBERRY = `<svg viewBox="0 0 40 44" width="34" height="38"><path d="M20 42C6 34 2 20 8 12Q20 6 32 12C38 20 34 34 20 42Z" fill="#e5484d"/>
  ${[[14, 18], [24, 16], [19, 26], [28, 26], [12, 28], [21, 34]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2" fill="#ffe08a"/>`).join('')}
  <path d="M10 11Q20 2 30 11Q24 8 20 12Q16 8 10 11Z" fill="#3fae6a"/><rect x="19" y="2" width="3" height="7" rx="1.5" fill="#3fae6a"/></svg>`;
export const PLATE = `<svg viewBox="0 0 160 70" width="160" height="70"><ellipse cx="80" cy="40" rx="76" ry="26" fill="#fff" stroke="#e2d4c0" stroke-width="4"/><ellipse cx="80" cy="38" rx="52" ry="15" fill="#f6efe4"/></svg>`;
export const BASKET = `<svg viewBox="0 0 140 110" width="140" height="110"><path d="M10 44H130L116 104H24Z" fill="#c98a4a"/><path d="M10 44H130" stroke="#a8743a" stroke-width="8" stroke-linecap="round"/>
  ${[30, 52, 74, 96, 118].map((x) => `<path d="M${x} 48L${x - 8} 100" stroke="#a8743a" stroke-width="4"/>`).join('')}
  ${[[30, 30], [52, 24], [74, 30], [96, 24], [114, 32], [42, 38], [86, 38]].map(([x, y]) => `<g transform="translate(${x - 12} ${y - 14}) scale(.6)"><path d="M20 42C6 34 2 20 8 12Q20 6 32 12C38 20 34 34 20 42Z" fill="#e5484d"/><path d="M10 11Q20 2 30 11Q24 8 20 12Q16 8 10 11Z" fill="#3fae6a"/></g>`).join('')}
  <path d="M30 44Q70 -6 110 44" fill="none" stroke="#a8743a" stroke-width="7"/></svg>`;
export const FROG = `<g><ellipse cx="0" cy="-12" rx="17" ry="13" fill="#5fc96a"/><circle cx="-8" cy="-24" r="6" fill="#5fc96a"/><circle cx="8" cy="-24" r="6" fill="#5fc96a"/>
  <circle cx="-8" cy="-25" r="3" fill="#fff"/><circle cx="8" cy="-25" r="3" fill="#fff"/><circle cx="-8" cy="-25" r="1.6" fill="#1d2433"/><circle cx="8" cy="-25" r="1.6" fill="#1d2433"/>
  <path d="M-7 -10Q0 -5 7 -10" stroke="#2e7a40" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-13" cy="-1" rx="7" ry="3" fill="#3fae6a"/><ellipse cx="13" cy="-1" rx="7" ry="3" fill="#3fae6a"/></g>`;
export const ROTATE_BTN = `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="46" fill="#ffd34d" stroke="#fff" stroke-width="6"/>
  <path d="M30 56A22 22 0 1 0 38 34" fill="none" stroke="#8a5a2b" stroke-width="8" stroke-linecap="round"/><path d="M26 26L40 34L28 46Z" fill="#8a5a2b"/></svg>`;

// ---------- 每個數字的生活例子（一份的樣子），viewBox 0 0 100 100 ----------
const legs = (xs, y1, y2, c = '#8a5a2b', w = 6) => xs.map((x) => `<path d="M${x} ${y1}V${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join('');
export const CTX = {
  2: `<g><path d="M14 70Q14 50 26 48L38 48Q44 60 44 72Q44 82 30 82H18Q12 82 14 70Z" fill="#2f7fe0"/><rect x="12" y="76" width="34" height="8" rx="4" fill="#fff"/>
    <path d="M54 70Q54 50 66 48L78 48Q84 60 84 72Q84 82 70 82H58Q52 82 54 70Z" fill="#2f7fe0"/><rect x="52" y="76" width="34" height="8" rx="4" fill="#fff"/></g>`,
  5: `<g fill="#ffd6b8" stroke="#d9a080" stroke-width="2"><rect x="28" y="46" width="44" height="40" rx="16"/>
    ${[[30, 20], [40, 12], [50, 10], [60, 14]].map(([x, y]) => `<rect x="${x - 5}" y="${y}" width="10" height="${50 - y}" rx="5"/>`).join('')}<rect x="66" y="48" width="26" height="10" rx="5" transform="rotate(-30 66 53)"/></g>`,
  4: `<g><rect x="22" y="14" width="10" height="44" rx="3" fill="#c98a4a"/><rect x="22" y="48" width="58" height="10" rx="3" fill="#e0a868"/>${legs([27, 38, 64, 76], 58, 90)}</g>`,
  8: `<g><ellipse cx="50" cy="36" rx="26" ry="24" fill="#c77dd9"/><circle cx="41" cy="34" r="5" fill="#fff"/><circle cx="59" cy="34" r="5" fill="#fff"/><circle cx="41" cy="35" r="2.4" fill="#1d2433"/><circle cx="59" cy="35" r="2.4" fill="#1d2433"/>
    ${[-56, -40, -24, -8, 8, 24, 40, 56].map((a) => `<path d="M${50 + a * 0.4} 56Q${50 + a * 0.8} 74 ${50 + a * 0.9} 90" stroke="#c77dd9" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}</g>`,
  3: `<g><circle cx="24" cy="74" r="14" fill="none" stroke="#333" stroke-width="6"/><circle cx="76" cy="74" r="14" fill="none" stroke="#333" stroke-width="6"/><circle cx="52" cy="40" r="16" fill="none" stroke="#333" stroke-width="6"/>
    <path d="M24 74L52 40L76 74H24" fill="none" stroke="#e5484d" stroke-width="6" stroke-linejoin="round"/><path d="M52 40V20M44 20H60" stroke="#e5484d" stroke-width="6" stroke-linecap="round"/></g>`,
  6: `<g>${[[-1, 38], [0, 52], [1, 66]].map(([s, y]) => `<path d="M30 ${y}L14 ${y - 6}M70 ${y}L86 ${y - 6}" stroke="#1d2433" stroke-width="5" stroke-linecap="round"/>`).join('')}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#e5484d"/><path d="M50 26V82" stroke="#1d2433" stroke-width="4"/><circle cx="50" cy="26" r="12" fill="#1d2433"/>
    ${[[38, 46], [62, 46], [40, 66], [60, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#1d2433"/>`).join('')}</g>`,
  9: `<g><rect x="10" y="10" width="80" height="80" rx="10" fill="#8a5a2b"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${28 + c * 22}" cy="${28 + r * 22}" r="9" fill="#5a3418"/><circle cx="${25 + c * 22}" cy="${25 + r * 22}" r="3" fill="#8a5a2b"/>`).join('')).join('')}</g>`,
  7: `<g><rect x="4" y="26" width="92" height="52" rx="8" fill="#fff" stroke="#e5734f" stroke-width="4"/><rect x="4" y="26" width="92" height="14" rx="6" fill="#e5734f"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${10 + i * 12}" y="48" width="9" height="20" rx="2" fill="${i === 0 || i === 6 ? '#ffb3b3' : '#ffe08a'}"/>`).join('')}</g>`,
};
export const ctxSvg = (n, size = 84) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${CTX[n]}</svg>`;

// 數字圖卡（pickCard 用，viewBox 0 0 100 100）
export const NUM_CARD = (x) => `<rect width="100" height="100" rx="16" fill="#fff6d6"/><text x="50" y="68" text-anchor="middle" font-size="${x >= 10 ? 46 : 54}" font-weight="bold" fill="#5a3418" font-family="Arial Rounded MT Bold, Arial, sans-serif">${x}</text>`;
// 3 張卡：對的、加一份、少一份（或差 1）
export function wrongsFor(x, a) {
  const c = [x + a, x - a, x + 1, x - 1, x + 10].filter((v, i, arr) => v > 0 && v !== x && arr.indexOf(v) === i);
  return c.slice(0, 2);
}

// ---------- 牆上的九九乘法表：lit = 學過的格子、strong = 熟練的格子（Set of "axb"）----------
export function posterSvg(lit, strong, hot = null) {
  const C = 30;
  const X0 = 30;
  const Y0 = 30;
  let s = `<svg viewBox="0 0 310 310" width="300" height="300"><rect x="2" y="2" width="306" height="306" rx="14" fill="#fff" stroke="#8a5a2b" stroke-width="5"/>`;
  for (let i = 1; i <= 9; i += 1) {
    s += `<text x="${X0 + (i - 1) * C + C / 2}" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#8a5a2b">${i}</text>`;
    s += `<text x="16" y="${Y0 + (i - 1) * C + C / 2 + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#8a5a2b">${i}</text>`;
  }
  for (let a = 1; a <= 9; a += 1) {
    for (let b = 1; b <= 9; b += 1) {
      const k = `${a}x${b}`;
      const on = lit.has(k);
      const st = strong.has(k);
      const x = X0 + (b - 1) * C;
      const y = Y0 + (a - 1) * C;
      s += `<g class="tp-cell${on ? ' on' : ''}${hot === k ? ' hot' : ''}" data-k="${k}"><rect x="${x + 1}" y="${y + 1}" width="${C - 2}" height="${C - 2}" rx="5" fill="${st ? '#ffd34d' : on ? '#bfe6a8' : '#f1ece2'}"/>
        ${on ? `<text x="${x + C / 2}" y="${y + C / 2 + 5}" text-anchor="middle" font-size="12" fill="#3a5a2a">${a * b}</text>` : ''}</g>`;
    }
  }
  return `${s}</svg>`;
}

// ---------- 黑板 524x260 ----------
export const BOARD = { x: 278, y: 78, w: 524, h: 260 };
const CHALK = '#fff';
// 數線：0 到 max，標出走過的點；frogAt 是青蛙現在的位置（數字）
export function numberLine(max, step, visited, frogAt) {
  const x0 = 30;
  const x1 = 494;
  const y = 196;
  const px = (v) => x0 + ((x1 - x0) * v) / max;
  let s = `<svg viewBox="0 0 524 260" width="524" height="260"><path d="M${x0} ${y}H${x1}" stroke="${CHALK}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
  for (let v = 0; v <= max; v += step) s += `<path d="M${px(v)} ${y - 8}V${y + 8}" stroke="${CHALK}" stroke-width="3" opacity=".8"/>`;
  s += `<text x="${px(0)}" y="${y + 34}" text-anchor="middle" font-size="22" fill="${CHALK}">0</text>`;
  let prev = 0;
  for (const v of visited) {
    const a = px(prev);
    const b = px(v);
    s += `<path d="M${a} ${y - 6}Q${(a + b) / 2} ${y - 70} ${b} ${y - 6}" fill="none" stroke="#ffd34d" stroke-width="3" stroke-dasharray="6 5"/>`;
    s += `<text x="${b}" y="${y + 34}" text-anchor="middle" font-size="${v >= 10 ? 20 : 22}" font-weight="bold" fill="#ffd34d">${v}</text>`;
    prev = v;
  }
  s += `<g class="tm-frog" transform="translate(${px(frogAt)} ${y - 6})">${FROG}</g></svg>`;
  return s;
}
// 點點陣列：rows 排、每排 cols 顆；split = [黃色幾行, 藍色幾行]，ghost = 最後一行虛線（9 = 10 - 1）
export function dotArray(rows, cols, { split = null, ghost = false, eq = '' } = {}) {
  const total = cols + (ghost ? 1 : 0);
  // 有算式時下面留給算式（y 210 以下），點點放在上面
  const gap = Math.min(40, (eq ? 188 : 220) / Math.max(rows, 1), 420 / Math.max(total, 1));
  const w = total * gap;
  const h = rows * gap;
  const ox = 262 - w / 2 + gap / 2;
  const oy = (eq ? 106 : 130) - h / 2 + gap / 2;
  let s = `<svg viewBox="0 0 524 260" width="524" height="260">`;
  if (split) {
    const [a] = split;
    // 9：黃色是整排 10 顆（含虛線那顆），藍色區塊換成最後一行虛線（要拿掉的）
    const p2x = ghost ? ox - gap / 2 + (total - 1) * gap : ox - gap / 2 + a * gap;
    const p2w = ghost ? gap : (total - a) * gap;
    s += `<rect class="tm-part p1" x="${ox - gap / 2}" y="${oy - gap / 2}" width="${Math.min(a, total) * gap}" height="${h}" rx="10" fill="#ffd34d" opacity=".28"/>`;
    s += `<rect class="tm-part p2" x="${p2x}" y="${oy - gap / 2}" width="${p2w}" height="${h}" rx="10" fill="${ghost ? 'none' : '#5fc3e8'}" opacity="${ghost ? 1 : 0.28}" ${ghost ? 'stroke="#fff" stroke-width="3" stroke-dasharray="8 6"' : ''}/>`;
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < total; c += 1) {
      const isGhost = ghost && c === total - 1;
      const fill = isGhost ? 'none' : split ? (c < split[0] ? '#ffd34d' : '#9fdcf6') : '#ff8a8a';
      s += `<circle class="tm-dot r${r}" cx="${ox + c * gap}" cy="${oy + r * gap}" r="${gap * 0.32}" fill="${fill}" ${isGhost ? 'stroke="#fff" stroke-width="2" stroke-dasharray="4 3"' : ''}/>`;
    }
  }
  if (eq) s += `<text x="262" y="246" text-anchor="middle" font-size="34" font-weight="bold" fill="${CHALK}">${eq}</text>`;
  return `${s}</svg>`;
}
// 黑板上的一句口訣題目：大大的「4 × 3」，答案出來後變「4 × 3 = 12」
export const boardEq = (a, b, ans = null) => `<svg viewBox="0 0 524 260" width="524" height="260"><text x="262" y="150" text-anchor="middle" font-size="84" font-weight="bold" fill="${ans == null ? '#ffd34d' : CHALK}">${a} × ${b}${ans == null ? '' : ` = ${ans}`}</text></svg>`;

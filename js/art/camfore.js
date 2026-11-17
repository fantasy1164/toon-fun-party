// 立體感鏡頭的最前景（離鏡頭最近，移動最多）：只放在畫面最邊邊，不擋到可以點的東西。
// n：晚上（顏色變暗）

// 戶外：左下、右下的草叢和小花
export function outdoorFore(n) {
  const leaf = n ? '#2a4a32' : '#3f8a3f';
  const leaf2 = n ? '#24402c' : '#2f7a34';
  const flower = n ? '#8a6a8a' : '#ffd34d';
  const flower2 = n ? '#7a5a7a' : '#ff7fa8';
  const tuft = (x, y, s, flip, fc) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    ${[-56, -30, -6, 20, 46].map((a, i) => `<path d="M0 0Q${a * 0.6} -60 ${a} -${100 + (i % 2) * 34}" stroke="${i % 2 ? leaf : leaf2}" stroke-width="15" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="-24" cy="-4" rx="62" ry="22" fill="${leaf2}"/>
    ${[[-24, -112], [28, -96]].map(([fx, fy]) => `<g transform="translate(${fx} ${fy})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-10" rx="7" ry="12" fill="${fc}" transform="rotate(${r})"/>`).join('')}<circle r="6" fill="${n ? '#b0a070' : '#fff6c2'}"/></g>`).join('')}</g>`;
  return `<svg viewBox="0 0 1200 900" overflow="visible">${tuft(-14, 918, 1.05, false, flower2)}${tuft(1218, 918, 1.1, true, flower)}</svg>`;
}

// 室內：左下角一盆大葉子植物（大部分在畫面外，有點模糊，離鏡頭很近）
export function indoorFore(n) {
  const leaf = n ? '#2c4a3a' : '#3d9a5a';
  const leaf2 = n ? '#243e30' : '#2f7d48';
  const pot = n ? '#6a4a3a' : '#c96f45';
  const bigLeaf = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0Q-40 -60 0 -150Q40 -60 0 0Z" fill="${c}"/><path d="M0 -6V-140" stroke="${n ? '#1e3428' : '#256b3b'}" stroke-width="4"/></g>`;
  return `<svg viewBox="0 0 1200 900" overflow="visible">
    <defs><filter id="cfblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
    <g filter="url(#cfblur)" transform="translate(-40 40) scale(.8)">
      ${bigLeaf(-6, 860, -38, 1.15, leaf)}${bigLeaf(24, 870, -8, 1.05, leaf2)}${bigLeaf(40, 880, 26, 0.95, leaf)}
      <path d="M-60 840H90L72 930H-42Z" fill="${pot}"/><rect x="-66" y="830" width="164" height="20" rx="8" fill="${n ? '#7a5a48' : '#e08a5c'}"/>
    </g></svg>`;
}

// 地圖：上面兩朵慢慢飄的雲（白天才有）
export function cloudsFore(n) {
  if (n) return '';
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".82"><ellipse cx="0" cy="0" rx="70" ry="26" fill="#fff"/><ellipse cx="-34" cy="-14" rx="34" ry="24" fill="#fff"/><ellipse cx="22" cy="-22" rx="40" ry="30" fill="#fff"/></g>`;
  return `<svg viewBox="0 0 1200 900" overflow="visible">${cloud(300, 46, 0.9)}${cloud(880, 58, 1.1)}</svg>`;
}

// 超市：貨架、商品、收銀台（栗栗）。商品畫在 100x100。

export const PRODUCTS = {
  apple: `<path d="M50 30C30 18 12 34 16 58C20 82 38 92 50 84C62 92 80 82 84 58C88 34 70 18 50 30Z" fill="#e5484d"/><path d="M50 30Q50 18 56 10" stroke="#7a4a1e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M54 20Q68 8 76 18Q64 28 54 20Z" fill="#4caf50"/><ellipse cx="32" cy="48" rx="6" ry="10" fill="#fff" opacity=".45"/>`,
  banana: `<path d="M18 30Q22 80 78 80Q88 78 86 70Q40 70 30 28Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4" stroke-linejoin="round"/><path d="M16 24L26 32" stroke="#7a5a22" stroke-width="7" stroke-linecap="round"/>`,
  milk: `<path d="M30 30L40 14H60L70 30V90H30Z" fill="#fff" stroke="#9fd8ee" stroke-width="4" stroke-linejoin="round"/><path d="M30 30H70" stroke="#9fd8ee" stroke-width="4"/><path d="M30 52Q50 44 70 52V72Q50 64 30 72Z" fill="#5fa8e8"/><circle cx="50" cy="40" r="5" fill="#ff9fb0"/>`,
  bread: `<path d="M14 50Q14 22 50 22Q86 22 86 50V84H14Z" fill="#e0a45a"/><path d="M20 50Q20 30 50 30Q80 30 80 50V78H20Z" fill="#f6dcae"/><path d="M34 40Q40 36 46 40M54 40Q60 36 66 40" stroke="#e0a45a" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  egg: `<rect x="10" y="44" width="80" height="40" rx="8" fill="#c8a27a"/>${[22, 42, 62, 82].map((x) => `<ellipse cx="${x - 2}" cy="44" rx="10" ry="13" fill="#fff6e6" stroke="#e8d8b8" stroke-width="3"/>`).join('')}<path d="M10 56H90" stroke="#a8825a" stroke-width="3"/>`,
  carrot: `<path d="M32 30L74 92L54 32Z" fill="#ff8a2a" transform="rotate(-20 50 50)"/><path d="M40 26Q34 6 44 4Q48 16 48 26M48 26Q56 8 66 12Q60 22 52 28" fill="#4caf50" transform="rotate(-20 50 50)"/>`,
  fish: `<path d="M10 50C26 26 60 26 74 50C60 74 26 74 10 50Z" fill="#9fd0ff" stroke="#5fa8e8" stroke-width="4"/><path d="M72 50L92 32V68Z" fill="#5fa8e8"/><circle cx="30" cy="46" r="5" fill="#1d2433"/>`,
  cheese: `<path d="M10 70L80 30L92 70Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4" stroke-linejoin="round"/><path d="M10 70V84H92V70" fill="#ffc400" stroke="#e0a800" stroke-width="4"/><circle cx="56" cy="58" r="6" fill="#e0a800"/><circle cx="74" cy="62" r="4" fill="#e0a800"/>`,
  // 誘惑：不在清單上的
  candy: `<path d="M24 50L8 36V64Z M76 50L92 36V64Z" fill="#ff7fb0"/><circle cx="50" cy="50" r="26" fill="#ff7fb0"/><path d="M34 40Q50 30 66 40M30 54Q50 44 70 56M36 66Q50 58 64 66" stroke="#fff" stroke-width="5" fill="none"/>`,
  chips: `<path d="M24 12H76L72 30Q80 50 72 70L76 88H24L28 70Q20 50 28 30Z" fill="#e5484d"/><circle cx="50" cy="50" r="16" fill="#ffd34d"/><path d="M42 50Q50 42 58 50Q50 58 42 50Z" fill="#e0a800"/>`,
  toycar: `<path d="M12 62V48L28 44L38 28H66L78 44L90 48V62Z" fill="#7a5cff"/><rect x="42" y="33" width="20" height="12" rx="3" fill="#d6f4ff"/><circle cx="32" cy="66" r="11" fill="#333"/><circle cx="72" cy="66" r="11" fill="#333"/>`,
  icecream: `<path d="M34 50L50 92L66 50Z" fill="#e0a45a"/><circle cx="40" cy="40" r="16" fill="#ff9fc4"/><circle cx="60" cy="40" r="16" fill="#9fe0c4"/><circle cx="50" cy="26" r="16" fill="#fff3b0"/>`,
};
export const LIST_POOL = ['apple', 'banana', 'milk', 'bread', 'egg', 'carrot', 'fish', 'cheese'];
export const TEMPT = ['candy', 'chips', 'toycar', 'icecream'];
// 商品價格（元）：6 歲版用硬幣付錢
export const PRICE = { apple: 5, banana: 5, milk: 10, bread: 10, egg: 10, carrot: 5, fish: 10, cheese: 5 };

export const ECOBAG = `<path d="M34 34Q34 12 50 12Q66 12 66 34" stroke="#2f8f55" stroke-width="6" fill="none"/><path d="M18 32H82L76 90H24Z" fill="#7bd39a"/><path d="M50 50Q38 58 50 74Q62 58 50 50Z" fill="#2f8f55"/>`;
export const PLASTIC = `<path d="M30 30Q26 10 38 12M70 30Q74 10 62 12" stroke="#ddd" stroke-width="6" fill="none"/><path d="M18 30H82L78 90H22Z" fill="#f2f2f2" stroke="#ccc" stroke-width="3"/>`;
export const COIN = (v) => {
  const r = { 1: 15, 5: 18, 10: 21 }[v];
  const c = { 1: ['#e8b36a', '#b8803a'], 5: ['#d9d9d9', '#a0a0a0'], 10: ['#ffd34d', '#d4a017'] }[v];
  return `<circle cx="25" cy="25" r="${r}" fill="${c[0]}" stroke="${c[1]}" stroke-width="3.5"/><text x="25" y="${25 + r * 0.38}" font-size="${r}" font-weight="900" text-anchor="middle" fill="${c[1]}">${v}</text>`;
};
export const WALLET = `<rect x="10" y="26" width="80" height="56" rx="10" fill="#c96a3a"/><rect x="10" y="26" width="80" height="18" rx="8" fill="#a8542a"/><rect x="60" y="48" width="30" height="18" rx="6" fill="#a8542a"/><circle cx="72" cy="57" r="4" fill="#ffd34d"/>`;
export const LIST_PAPER = (items) => `<svg viewBox="0 0 160 ${40 + items.length * 70}" width="160" height="${40 + items.length * 70}">
  <rect x="4" y="4" width="152" height="${32 + items.length * 70}" rx="10" fill="#fffdf4" stroke="#e8d6b8" stroke-width="4"/>
  ${items.map((it, i) => `<g class="li" data-i="${i}"><g transform="translate(20 ${20 + i * 70}) scale(.6)">${PRODUCTS[it]}</g><path class="tick" d="M98 ${48 + i * 70}l12 12l24 -26" stroke="#3fbf6a" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="92" y="${30 + i * 70}" width="48" height="40" rx="8" fill="none" stroke="#c8b898" stroke-width="3" stroke-dasharray="6 5"/></g>`).join('')}
</svg>`;

// 背景：貨架（商品另外放成按鈕）、收銀台、栗栗站在收銀台後面
export function marketBack(ph) {
  const night = ph === 'night';
  const shelf = (x) => `<rect x="${x}" y="150" width="300" height="430" rx="10" fill="#e8d6b8"/>${[0, 1, 2, 3].map((r) => `<rect x="${x}" y="${238 + r * 106}" width="300" height="14" fill="#c8a27a"/>`).join('')}<rect x="${x}" y="150" width="300" height="20" rx="8" fill="#ff8a5c"/>`;
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#fff4e0"/>
    <rect width="1200" height="120" fill="#ffe0c2"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${60 + i * 190}" y="34" width="120" height="16" rx="8" fill="${night ? '#fff6c8' : '#fff'}"/>`).join('')}
    <rect y="600" width="1200" height="300" fill="#e9eef2"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 110} 600L${i * 110 - 60} 900" stroke="#d6dde3" stroke-width="3"/>`).join('')}
    ${shelf(40)}${shelf(360)}
  </svg>`;
}
export const COUNTER = `<svg viewBox="0 0 1200 900">
    <!-- 收銀台 -->
    <rect x="760" y="430" width="400" height="190" rx="16" fill="#5fa8e8"/><rect x="760" y="420" width="400" height="40" rx="12" fill="#3a7bd5"/>
    <rect x="780" y="430" width="200" height="22" rx="6" fill="#333"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${790 + i * 28} 432V450" stroke="#555" stroke-width="3"/>`).join('')}
    <g transform="translate(1030 330)"><rect x="0" y="40" width="110" height="60" rx="10" fill="#ff8a5c"/><rect x="14" y="0" width="80" height="44" rx="6" fill="#3a3a4a"/><rect x="22" y="8" width="64" height="26" rx="4" fill="#7be0a0"/></g>
</svg>`;

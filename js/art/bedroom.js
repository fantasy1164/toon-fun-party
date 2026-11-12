// 臥室：棉棉的衣服、房間、玩具、收納處、兩本原創故事書的插圖。舞台 1200x900。
import { characterSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

// ---------- 棉棉的衣服（棉棉自己的座標 240x320） ----------
const OUTFITS = {
  day: `<g class="w day"><path d="M62 226Q120 214 178 226L182 290Q120 304 58 290Z" fill="#5fc3e8"/><rect x="92" y="204" width="56" height="40" rx="8" fill="#5fc3e8"/>
    <path d="M96 204L84 176M144 204L156 176" stroke="#3aa6d0" stroke-width="8" stroke-linecap="round"/><circle cx="104" cy="216" r="5" fill="#ffd34d"/><circle cx="136" cy="216" r="5" fill="#ffd34d"/></g>`,
  pj: `<g class="w pj"><path d="M56 180Q120 160 184 180L190 296Q120 314 50 296Z" fill="#b8a4ff"/>
    ${[[84, 212], [150, 206], [118, 250], [76, 270], [164, 268]].map(([x, y]) => `<path d="M${x} ${y - 9}l3 6l7 1l-5 5l1 7l-6 -3l-6 3l1 -7l-5 -5l7 -1Z" fill="#ffd34d"/>`).join('')}
    <path d="M90 176Q120 196 150 176" fill="none" stroke="#9b85f0" stroke-width="8" stroke-linecap="round"/></g>`,
  swim: `<g class="w swim"><path d="M70 222Q120 210 170 222L176 286Q120 300 64 286Z" fill="#ff6b5c"/>
    <path d="M70 240H170M68 258H172M66 274H174" stroke="#fff" stroke-width="7"/></g>`,
  rain: `<g class="w rain"><path d="M70 180Q120 164 170 180L198 304Q120 322 42 304Z" fill="#ffd34d"/>
    <circle cx="120" cy="212" r="6" fill="#e0a800"/><circle cx="120" cy="244" r="6" fill="#e0a800"/><circle cx="120" cy="276" r="6" fill="#e0a800"/></g>`,
};
export const OUTFIT_ICONS = {
  pj: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M24 14L50 22L76 14L94 32L84 48L76 44V92H24V44L16 48L6 32Z" fill="#b8a4ff"/>
    ${[[36, 50], [62, 44], [50, 72]].map(([x, y]) => `<path d="M${x} ${y - 7}l2.5 5l5.5 .8l-4 4l1 5.5l-5 -2.6l-5 2.6l1 -5.5l-4 -4l5.5 -.8Z" fill="#ffd34d"/>`).join('')}</svg>`,
  swim: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M26 20H40Q50 34 60 20H74L78 86Q50 96 22 86Z" fill="#ff6b5c"/><path d="M24 50H76M23 64H77M22 78H78" stroke="#fff" stroke-width="6"/></svg>`,
  rain: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M30 22Q50 12 70 22L88 88Q50 98 12 88Z" fill="#ffd34d"/><path d="M36 18Q50 0 64 18Q50 26 36 18Z" fill="#ffc400"/><circle cx="50" cy="44" r="4" fill="#e0a800"/><circle cx="50" cy="62" r="4" fill="#e0a800"/></svg>`,
};

export function mianSvg() {
  const extra = Object.values(OUTFITS).join('');
  return `<svg viewBox="-40 -20 320 360" width="320" height="360">${characterSvg('mian', { extra })}</svg>`;
}

// ---------- 玩具 ----------
const TOY_ART = {
  block: (c) => `<rect x="14" y="20" width="64" height="64" rx="10" fill="${c}"/><rect x="24" y="30" width="44" height="44" rx="6" fill="#fff" opacity=".35"/>`,
  ball: (c) => `<circle cx="48" cy="52" r="34" fill="${c}"/><path d="M16 46Q48 64 80 46" stroke="#fff" stroke-width="6" fill="none"/><circle cx="36" cy="38" r="7" fill="#fff" opacity=".6"/>`,
  book: (c) => `<rect x="16" y="16" width="62" height="74" rx="6" fill="${c}"/><rect x="24" y="16" width="8" height="74" fill="#000" opacity=".15"/><rect x="38" y="32" width="30" height="8" rx="3" fill="#fff" opacity=".7"/>`,
  plush: (c) => `<circle cx="30" cy="26" r="13" fill="${c}"/><circle cx="66" cy="26" r="13" fill="${c}"/><circle cx="48" cy="52" r="32" fill="${c}"/>
    <circle cx="38" cy="48" r="4" fill="#333"/><circle cx="58" cy="48" r="4" fill="#333"/><ellipse cx="48" cy="60" rx="9" ry="6" fill="#fff" opacity=".7"/>`,
};
export const TOYS = [
  { id: 't1', kind: 'block', c: '#e5484d', x: 470, y: 800 },
  { id: 't2', kind: 'ball', c: '#2f7fe0', x: 565, y: 850 },
  { id: 't3', kind: 'book', c: '#2ea05a', x: 660, y: 805 },
  { id: 't4', kind: 'plush', c: '#f0a8c8', x: 755, y: 855 },
  { id: 't5', kind: 'block', c: '#ffb300', x: 850, y: 805 },
  { id: 't6', kind: 'ball', c: '#ff6b5c', x: 945, y: 852 },
  { id: 't7', kind: 'book', c: '#8e4ec6', x: 1040, y: 808 },
  { id: 't8', kind: 'plush', c: '#c8915a', x: 1130, y: 856 },
];
export const TOY_HOME = { block: 'box', ball: 'basket', book: 'shelf', plush: 'bed' };
export function toySvg(t, size = 90) {
  return `<svg viewBox="0 0 96 96" width="${size}" height="${size}">${TOY_ART[t.kind](t.c)}</svg>`;
}
// 收好後玩具出現的位置
export const HOME_SPOTS = {
  box: [[110, 712], [168, 716]],
  basket: [[300, 720], [356, 724]],
  shelf: [[92, 470], [150, 470]],
  bed: [[930, 500], [1000, 504]],
};

// ---------- 房間 ----------
export function roomSvg(ph, wx) {
  const night = ph === 'night' || ph === 'dusk';
  const { colors: [a, b] } = skyColors(ph, wx);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${night ? '#5a5290' : '#efe6ff'}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<path d="M${60 + i * 120} 120l4 10l10 2l-8 7l2 10l-8 -5l-8 5l2 -10l-8 -7l10 -2Z" fill="#fff" opacity=".35"/>`).join('')}
    <rect y="640" width="1200" height="260" fill="${night ? '#8a6a52' : '#d9b38c'}"/>
    <ellipse cx="640" cy="790" rx="430" ry="90" fill="#c7b3ff" opacity=".7"/>
    <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="bclip"><rect x="500" y="90" width="220" height="200" rx="16"/></clipPath></defs>
    <g clip-path="url(#bclip)"><rect x="500" y="90" width="220" height="200" fill="url(#bsky)"/>
      ${ph === 'night' ? '<circle cx="660" cy="140" r="24" fill="#fff6c8"/><circle cx="672" cy="132" r="22" fill="' + a + '"/>' : '<circle cx="660" cy="140" r="26" fill="#ffd34d"/>'}
      ${weatherLayer(wx, ph, 500, 90, 220, 200)}</g>
    <rect x="500" y="90" width="220" height="200" rx="16" fill="none" stroke="#fff" stroke-width="12"/>
    <path d="M610 90V290" stroke="#fff" stroke-width="8"/>
    <path d="M480 80Q610 140 740 80V300Q700 200 610 200Q520 200 480 300Z" fill="#ffb3c7" opacity=".85"/>

    <!-- 書架 -->
    <rect x="40" y="200" width="190" height="430" rx="10" fill="#b9824f"/>
    <rect x="54" y="214" width="162" height="402" fill="#8a5a2b"/>
    ${[310, 420, 530].map((y) => `<rect x="54" y="${y}" width="162" height="12" fill="#b9824f"/>`).join('')}
    ${[[62, 310, 74, '#e5484d'], [88, 310, 64, '#ffd34d'], [114, 310, 80, '#5fc3e8'], [160, 310, 70, '#2ea05a'], [186, 310, 60, '#ff9fc4'],
      [180, 420, 70, '#ffb300'], [62, 530, 84, '#3aa36a'], [88, 530, 70, '#e5484d'], [150, 530, 76, '#8e4ec6']].map(([x, base, h, c]) =>
      `<rect x="${x}" y="${base - h}" width="22" height="${h}" rx="3" fill="${c}"/>`).join('')}

    <!-- 衣櫃 -->
    <rect x="250" y="170" width="190" height="460" rx="12" fill="#c8915a"/>
    <g class="wd-door l"><rect x="262" y="182" width="80" height="436" rx="6" fill="#d9a066"/><circle cx="330" cy="400" r="8" fill="#8a5a2b"/></g>
    <g class="wd-door r"><rect x="348" y="182" width="80" height="436" rx="6" fill="#d9a066"/><circle cx="360" cy="400" r="8" fill="#8a5a2b"/></g>

    <!-- 床 -->
    <rect x="780" y="440" width="30" height="300" rx="10" fill="#8a5a2b"/>
    <rect x="1140" y="520" width="30" height="220" rx="10" fill="#8a5a2b"/>
    <rect x="790" y="600" width="370" height="90" rx="20" fill="#fff"/>
    <ellipse cx="860" cy="590" rx="70" ry="30" fill="#fff" stroke="#e6e0ff" stroke-width="5"/>
    <rect x="900" y="590" width="260" height="110" rx="26" fill="#9b85f0"/>
    ${[940, 1000, 1060, 1120].map((x) => `<circle cx="${x}" cy="640" r="8" fill="#fff" opacity=".7"/>`).join('')}

    <!-- 床頭櫃與小夜燈 -->
    <rect x="690" y="560" width="80" height="120" rx="10" fill="#b9824f"/>
    <g class="nightlight"><circle class="nl-glow" cx="730" cy="530" r="90" fill="#ffe08a" opacity="0"/>
      <path d="M712 556H748L742 520H718Z" fill="#ffd34d"/><circle cx="730" cy="512" r="14" fill="#fff3c0"/></g>

    <!-- 玩具箱、籃子 -->
    <rect x="60" y="690" width="170" height="130" rx="12" fill="#e5734f"/><rect x="60" y="690" width="170" height="26" rx="8" fill="#c95a3a"/>
    <path d="M110 760h70" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    <path d="M260 700H410L392 830H278Z" fill="#e8c08a"/>
    ${[290, 320, 350, 380].map((x) => `<path d="M${x} 702L${x - 6} 828" stroke="#c8915a" stroke-width="4"/>`).join('')}
    <path d="M262 740H408M266 780H402" stroke="#c8915a" stroke-width="4"/>
  </svg>`;
}

// 點擊區（收納處、衣櫃、開關、書架）
export const SPOTS = {
  box: [50, 660, 190, 180],
  basket: [250, 670, 170, 170],
  shelf: [40, 200, 190, 430],
  bed: [790, 440, 380, 270],
  wardrobe: [250, 170, 190, 460],
  switch: [446, 330, 54, 90],
};
export function spotsSvg() {
  const halo = ([x, y, w, h]) => `<rect class="halo" x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="22" fill="none" stroke="#ffd000" stroke-width="14"/>`;
  return `<svg class="spots" viewBox="0 0 1200 900">
    <g class="switchart"><rect x="452" y="336" width="42" height="78" rx="10" fill="#fff" stroke="#ddd" stroke-width="3"/>
      <rect class="toggle" x="464" y="350" width="18" height="26" rx="5" fill="#ffd34d"/></g>
    ${Object.entries(SPOTS).map(([k, r]) => `<g class="spot" data-spot="${k}">${halo(r)}<rect class="hit" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="transparent"/></g>`).join('')}
  </svg>`;
}

// 被子（棉棉躺好之後蓋在上面）
export const BLANKET = `<svg class="blanket" viewBox="0 0 1200 900"><rect x="880" y="560" width="290" height="140" rx="30" fill="#9b85f0"/>
  ${[920, 980, 1040, 1100].map((x) => `<circle cx="${x}" cy="620" r="9" fill="#fff" opacity=".7"/>`).join('')}</svg>`;

// ---------- 故事書 ----------
export const BOOKS = {
  moon: {
    cover: `<rect width="200" height="260" rx="14" fill="#26386e"/><circle cx="110" cy="110" r="50" fill="#fff6c8"/><circle cx="132" cy="96" r="44" fill="#26386e"/>
      ${[[40, 50], [160, 60], [60, 200], [150, 210], [40, 140]].map(([x, y]) => `<path d="M${x} ${y - 10}l3 7l8 1l-6 5l2 8l-7 -4l-7 4l2 -8l-6 -5l8 -1Z" fill="#ffd34d"/>`).join('')}`,
    pages: [
      `<rect width="800" height="520" fill="#f8b88b"/><rect y="320" width="800" height="200" fill="#6a5a8f"/><circle cx="400" cy="330" r="70" fill="#fff6c8"/>
       <circle cx="380" cy="320" r="7" fill="#333"/><circle cx="420" cy="320" r="7" fill="#333"/><path d="M380 345Q400 360 420 345" stroke="#333" stroke-width="5" fill="none"/>`,
      `<rect width="800" height="520" fill="#26386e"/><circle cx="160" cy="140" r="60" fill="#fff6c8"/>
       ${[[420, 120], [560, 200], [650, 100], [500, 330], [300, 300], [680, 360]].map(([x, y], i) => `<g class="twinkle" style="animation-delay:${i * 0.2}s"><path d="M${x} ${y - 26}l8 18l20 2l-15 13l5 20l-18 -10l-18 10l5 -20l-15 -13l20 -2Z" fill="#ffd34d"/><circle cx="${x - 6}" cy="${y}" r="3" fill="#333"/><circle cx="${x + 6}" cy="${y}" r="3" fill="#333"/></g>`).join('')}`,
      `<rect width="800" height="520" fill="#26386e"/><circle cx="300" cy="250" r="120" fill="#fff6c8"/>
       <circle cx="270" cy="230" r="10" fill="#333"/><circle cx="330" cy="230" r="10" fill="#333"/><path d="M270 280Q300 300 330 280" stroke="#333" stroke-width="7" fill="none"/>
       <path d="M560 210l14 30l34 4l-25 22l8 34l-31 -17l-31 17l8 -34l-25 -22l34 -4Z" fill="#ffd34d"/>
       <path d="M440 170Q480 120 540 150" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="10 10"/>`,
      `<rect width="800" height="520" fill="#1a2550"/><path d="M380 150A80 80 0 1 0 460 250A64 64 0 1 1 380 150Z" fill="#fff6c8"/>
       ${[[150, 120], [620, 140], [240, 380], [560, 400], [700, 280]].map(([x, y]) => `<g><path d="M${x} ${y - 18}l6 12l14 2l-10 9l3 14l-13 -7l-13 7l3 -14l-10 -9l14 -2Z" fill="#ffd34d" opacity=".8"/><path d="M${x - 8} ${y}q8 5 16 0" stroke="#333" stroke-width="3" fill="none"/></g>`).join('')}
       <text x="620" y="110" font-size="40" fill="#fff" opacity=".8">z z</text>`,
    ],
  },
  croc: {
    cover: `<rect width="200" height="260" rx="14" fill="#7be0a0"/><ellipse cx="100" cy="150" rx="70" ry="40" fill="#2ea05a"/>
      <circle cx="70" cy="110" r="16" fill="#2ea05a"/><circle cx="70" cy="108" r="8" fill="#fff"/><circle cx="72" cy="108" r="4" fill="#333"/>
      <path d="M40 160Q100 186 170 160" stroke="#fff" stroke-width="6" stroke-dasharray="8 6" fill="none"/>`,
    pages: [
      `<rect width="800" height="520" fill="#dff5e6"/><ellipse cx="400" cy="300" rx="240" ry="110" fill="#2ea05a"/>
       <circle cx="300" cy="210" r="40" fill="#2ea05a"/><circle cx="300" cy="206" r="20" fill="#fff"/><circle cx="304" cy="206" r="10" fill="#333"/>
       <path d="M200 320L230 300L260 320L290 300L320 320L350 300L380 320L410 300L440 320L470 300L500 320L530 300L560 320" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
       <path d="M560 210l60 -30M560 230l70 0" stroke="#e5484d" stroke-width="8" stroke-linecap="round"/>`,
      `<rect width="800" height="520" fill="#26386e"/><rect x="160" y="160" width="480" height="220" rx="40" fill="#fff"/>
       ${[[240, 270, '#7bc96f'], [340, 250, '#9b7be0'], [440, 280, '#7bc96f'], [540, 255, '#9b7be0']].map(([x, y, c]) => `<g class="twinkle"><circle cx="${x}" cy="${y}" r="34" fill="${c}"/><circle cx="${x - 10}" cy="${y - 6}" r="7" fill="#fff"/><circle cx="${x + 10}" cy="${y - 6}" r="7" fill="#fff"/><path d="M${x - 12} ${y + 12}Q${x} ${y + 22} ${x + 12} ${y + 12}" stroke="#333" stroke-width="4" fill="none"/></g>`).join('')}
       <path d="M200 140l20 -30M600 140l-20 -30M400 130v-40" stroke="#ffd34d" stroke-width="8" stroke-linecap="round"/>`,
      `<rect width="800" height="520" fill="#dff5e6"/><rect x="160" y="160" width="480" height="220" rx="40" fill="#fff"/>
       <g transform="rotate(-20 400 240)"><rect x="300" y="226" width="260" height="28" rx="14" fill="#ff7fa8"/><rect x="250" y="210" width="70" height="60" rx="12" fill="#fff" stroke="#9fd8ee" stroke-width="6"/></g>
       ${[[230, 200], [600, 330], [210, 360], [620, 190], [400, 380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#d6f4ff" stroke="#9fd8ee" stroke-width="4"/>`).join('')}`,
      `<rect width="800" height="520" fill="#26386e"/><ellipse cx="400" cy="320" rx="240" ry="100" fill="#2ea05a"/>
       <path d="M300 230Q320 216 340 230" stroke="#fff" stroke-width="7" fill="none"/>
       <path d="M220 330L250 310L280 330L310 310L340 330L370 310L400 330L430 310L460 330L490 310L520 330" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
       ${[[260, 300], [380, 300], [500, 300]].map(([x, y]) => `<path d="M${x} ${y - 14}l4 9l10 1l-7 6l2 10l-9 -5l-9 5l2 -10l-7 -6l10 -1Z" fill="#ffd34d"/>`).join('')}
       <rect x="160" y="380" width="480" height="80" rx="30" fill="#9b85f0"/>
       <text x="560" y="200" font-size="44" fill="#fff" opacity=".8">z z z</text>`,
    ],
  },
};

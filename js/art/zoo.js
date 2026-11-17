// 動物園各區的背景（1200x900）、圖卡、道具。小孩站在下面的參觀步道（y 700 以下）。
import { weatherLayer, skyColors } from './bathroom.js';
import { ANIMALS, BABIES } from './animals.js';
import { AREAS, tramSvg } from './island.js';

const night = (ph) => ph === 'night' || ph === 'dusk';
const sky = (ph, wx, id, top = 640) => {
  const { colors: [a, b] } = skyColors(ph, wx);
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1200" height="${top}" fill="url(#${id})"/>`;
};
const walk = (n) => `<rect y="700" width="1200" height="200" fill="${n ? '#6a5f52' : '#e8d4a8'}"/>${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${i * 92 + 30}" cy="${760 + (i % 3) * 40}" rx="22" ry="8" fill="${n ? '#5a5046' : '#d8c08e'}"/>`).join('')}`;
const fence = (n, y = 640) => `<rect y="${y}" width="1200" height="10" fill="${n ? '#5a4030' : '#a8743a'}"/><rect y="${y + 34}" width="1200" height="8" fill="${n ? '#5a4030' : '#a8743a'}"/>${Array.from({ length: 31 }, (_, i) => `<rect x="${i * 40}" y="${y - 10}" width="12" height="70" rx="4" fill="${n ? '#6a4a34' : '#c98a4a'}"/>`).join('')}`;
const signBoard = (area, x = 1010, y = 560) => {
  const head = { kids: 'rabbit', taiwan: 'bear', rain: 'elephant', africa: 'lion', desert: 'camel', aus: 'koala', penguin: 'penguin', panda: 'panda' }[area];
  return `<g transform="translate(${x} ${y})"><rect x="40" y="70" width="12" height="70" fill="#8a5a2b"/><rect x="0" y="0" width="140" height="84" rx="14" fill="#4f8a4f" stroke="#fff" stroke-width="5"/><g transform="translate(36 2) scale(.38)">${ANIMALS[head].svg()}</g></g>`;
};
const tree = (x, y, s = 1, c = '#4caf50', c2 = '#43a047') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-10" width="16" height="70" fill="#8a5a2b"/><circle cy="-40" r="56" fill="${c}"/><circle cx="-34" cy="-14" r="36" fill="${c2}"/><circle cx="36" cy="-20" r="38" fill="${c2}"/></g>`;
const bush = (x, y, s = 1, c = '#4f9a4f') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-40" r="40" fill="${c}"/><circle cx="10" cy="-18" r="48" fill="${c}"/><circle cx="56" r="38" fill="${c}"/><rect x="-80" y="0" width="174" height="34" fill="${c}"/></g>`;
const rock = (x, y, s = 1, c = '#9aa0aa') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0Q-56 -50 -10 -56Q40 -60 56 -20Q64 0 60 0Z" fill="${c}"/><path d="M-30 -40Q0 -50 30 -36" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/></g>`;

export function areaBack(area, ph, wx) {
  const n = night(ph);
  const id = `zs${area}`;
  const A = AREAS[area];
  const g1 = n ? '#3f6a4a' : A.ground;
  const g2 = n ? '#36603f' : A.ground2;
  switch (area) {
    case 'kids': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <path d="M0 420Q300 360 600 400Q900 350 1200 410V700H0Z" fill="${g1}"/>
      <g transform="translate(860 230)"><path d="M0 120L130 30L260 120V300H0Z" fill="#e5484d"/><path d="M0 120L130 30L260 120" fill="none" stroke="#fff" stroke-width="10"/><rect x="90" y="170" width="80" height="130" fill="#a8322f"/><path d="M90 170L170 300M170 170L90 300" stroke="#fff" stroke-width="7"/></g>
      ${[[120, 600], [220, 620]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="60" ry="30" fill="#f2d16a"/><path d="M-50 -6H50M-46 10H46" stroke="#d8b040" stroke-width="5"/></g>`).join('')}
      ${tree(60, 380, 0.9)}${fence(n)}${signBoard(area, 30, 520)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'taiwan': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <path d="M0 360L200 220L380 320L560 200L760 330L960 210L1200 320V700H0Z" fill="${n ? '#2f4f3a' : '#6aa86a'}"/>
      <path d="M0 470Q300 400 600 450Q900 400 1200 470V700H0Z" fill="${g1}"/>
      <path d="M0 600Q300 560 520 610T1200 590" stroke="${n ? '#3a5a7a' : '#7cc8ea'}" stroke-width="26" fill="none"/>
      ${tree(120, 420, 1.1, '#2e7a40', '#3f8a4f')}${tree(1080, 410, 1.2, '#2e7a40', '#3f8a4f')}${tree(560, 380, 0.8, '#3f8a4f', '#2e7a40')}
      ${rock(860, 600, 1.2)}${bush(330, 610, 1, n ? '#2f5a3a' : '#4f9a4f')}${bush(700, 620, 0.9, n ? '#2f5a3a' : '#5aa85a')}
      ${fence(n)}${signBoard(area)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'rain': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <rect width="1200" height="700" fill="${n ? '#1f3f2a' : '#3f8a4f'}" opacity=".55"/>
      <path d="M980 120Q1000 300 990 600" stroke="${n ? '#5a7a9a' : '#bfe6fb'}" stroke-width="60" fill="none" opacity=".8"/>
      ${rock(990, 640, 2, n ? '#4a5a5a' : '#7a8a8a')}
      <path d="M0 520Q300 470 600 510Q900 470 1200 520V700H0Z" fill="${g1}"/>
      ${[60, 260, 460, 700].map((x, i) => `<path d="M${x} 0Q${x + 30} 160 ${x + 10} ${260 + i * 30}" stroke="#2e6a3a" stroke-width="8" fill="none"/>${[0, 1, 2].map((k) => `<ellipse cx="${x + 18 + k * 4}" cy="${80 + k * 70}" rx="16" ry="8" fill="#5aa86a" transform="rotate(30 ${x + 18} ${80 + k * 70})"/>`).join('')}`).join('')}
      ${[[90, 640, 1.3], [380, 660, 1], [760, 650, 1.2]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">${[-60, -30, 0, 30, 60].map((a) => `<ellipse cx="${Math.sin(a * Math.PI / 180) * 50}" cy="${-Math.cos(a * Math.PI / 180) * 40}" rx="22" ry="50" fill="${n ? '#2f5a3a' : '#2e8b4f'}" transform="rotate(${a} ${Math.sin(a * Math.PI / 180) * 50} ${-Math.cos(a * Math.PI / 180) * 40})"/>`).join('')}</g>`).join('')}
      ${fence(n)}${signBoard(area, 30, 520)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'africa': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <path d="M0 470Q400 430 800 460Q1000 440 1200 470V700H0Z" fill="${g1}"/>
      ${[[200, 420, 1.2], [900, 400, 1]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 90V0M0 40L-40 -10M0 30L40 -14" stroke="#8a5a2b" stroke-width="12" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-20" rx="120" ry="28" fill="${n ? '#2f5a3a' : '#6aa84a'}"/><ellipse cx="-30" cy="-34" rx="70" ry="18" fill="${n ? '#2a5234' : '#7cbf5a'}"/></g>`).join('')}
      <ellipse cx="760" cy="620" rx="200" ry="36" fill="${n ? '#3a5a7a' : '#7cc8ea'}"/><ellipse cx="760" cy="612" rx="160" ry="20" fill="${n ? '#4a6a8a' : '#a8dcf4'}"/>
      ${Array.from({ length: 30 }, (_, i) => `<path d="M${i * 41 + 10} 660l6 -26l6 26" stroke="${n ? '#5a6a42' : '#c8a850'}" stroke-width="4" fill="none"/>`).join('')}
      ${rock(110, 640, 1.1, n ? '#6a6a5a' : '#c8b490')}
      ${fence(n)}${signBoard(area)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'desert': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <path d="M0 440Q300 360 600 430Q900 360 1200 440V700H0Z" fill="${n ? '#8a7a5a' : '#f6deaa'}"/>
      <path d="M0 520Q400 460 800 520T1200 500V700H0Z" fill="${g1}"/>
      ${[[1130, 560], [150, 470]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-14" y="-110" width="28" height="110" rx="14" fill="#4caf50"/><path d="M-14 -70H-40V-100M14 -50H36V-84" stroke="#4caf50" stroke-width="20" fill="none" stroke-linecap="round"/></g>`).join('')}
      ${rock(1000, 600, 0.9, n ? '#8a6a4a' : '#d8a46a')}
      <!-- 狐獴的洞 -->
      ${[[500, 646], [630, 612], [760, 650], [890, 612], [1010, 650]].map(([x, y]) => `<ellipse class="zo-hole" cx="${x}" cy="${y}" rx="42" ry="14" fill="#6a4a2a"/><ellipse cx="${x}" cy="${y + 4}" rx="56" ry="18" fill="none" stroke="${n ? '#8a7a5a' : '#e6c47e'}" stroke-width="10"/>`).join('')}
      ${fence(n, 660)}${signBoard(area, 30, 520)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'aus': return `<svg viewBox="0 0 1200 900">${sky(ph, wx, id)}
      <path d="M0 470Q400 420 800 460Q1000 440 1200 470V700H0Z" fill="${n ? '#6a4a3a' : '#d9a06a'}"/>
      <path d="M0 560Q400 520 800 560T1200 550V700H0Z" fill="${g1}"/>
      <!-- 尤加利樹（無尾熊住在上面） -->
      <g transform="translate(860 0)"><path d="M60 700V160Q40 80 80 0" stroke="#e6e0d0" stroke-width="40" fill="none"/><path d="M60 300L180 200M60 420L-40 330" stroke="#e6e0d0" stroke-width="20" stroke-linecap="round"/>
        ${[[180, 190], [-40, 320], [100, 60], [0, 120], [200, 260]].map(([x, y]) => `<g fill="${n ? '#3f6a4a' : '#7cbf8a'}">${[0, 40, 80, 120].map((a) => `<ellipse cx="${x + Math.cos(a) * 30}" cy="${y + Math.sin(a) * 20}" rx="12" ry="32" transform="rotate(${a * 40} ${x + Math.cos(a) * 30} ${y + Math.sin(a) * 20})"/>`).join('')}</g>`).join('')}</g>
      ${rock(200, 640, 1, n ? '#6a4a3a' : '#b8784a')}
      ${fence(n)}${signBoard(area, 30, 520)}${walk(n)}${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    case 'penguin': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${n ? '#2a3a5a' : '#cfe8f6'}"/>
      <rect x="0" y="0" width="1200" height="60" fill="#8ab8d8"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${80 + i * 150}" cy="30" r="12" fill="#fff6c8"/>`).join('')}
      <!-- 冰山岩石（上面）＋水池（下面） -->
      <path d="M40 420L160 230L260 330L360 210L480 340L600 260L720 360L860 220L1000 330L1160 250V430H40Z" fill="#f4fbff" stroke="#bfe0f2" stroke-width="6"/>
      <rect x="40" y="420" width="1120" height="260" fill="#3fa0d8"/>
      <path d="M40 470Q300 450 600 470T1160 460V680H40Z" fill="#2f86c0"/>
      ${Array.from({ length: 10 }, (_, i) => `<circle cx="${100 + i * 110}" cy="${520 + (i % 3) * 50}" r="${4 + (i % 3) * 2}" fill="#bfe6fb" opacity=".7"/>`).join('')}
      <!-- 玻璃 -->
      <rect x="40" y="100" width="1120" height="580" rx="16" fill="#fff" opacity=".12" stroke="#fff" stroke-width="12"/>
      <path d="M120 140L200 120M140 170L260 140" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>
      <rect y="680" width="1200" height="20" fill="#5a7a9a"/>${walk(n)}${signBoard(area, 1020, 560)}</svg>`;
    case 'panda': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${n ? '#2a3a2a' : '#e8f6dc'}"/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 80 + 20} 640V${80 + (i % 4) * 40}" stroke="${n ? '#3f6a3a' : '#7cc06a'}" stroke-width="16"/>${[200, 330, 460].map((y) => `<path d="M${i * 80 + 10} ${y + (i % 3) * 20}h20" stroke="#4a9a34" stroke-width="5"/>`).join('')}<path d="M${i * 80 + 20} ${120 + (i % 4) * 40}q30 -20 50 -6" stroke="#5aa84a" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}
      <path d="M0 520Q400 480 800 520T1200 510V680H0Z" fill="${g1}"/>
      <!-- 木頭爬架 -->
      <g transform="translate(160 330)" stroke="#8a5a2b" stroke-width="22" stroke-linecap="round"><path d="M0 330V0M260 330V30M-20 60H280M-20 200H280"/></g>
      <rect x="0" y="80" width="1200" height="600" rx="0" fill="#fff" opacity=".08"/>
      <rect y="680" width="1200" height="20" fill="${n ? '#4a5a4a' : '#8ab878'}"/>${walk(n)}${signBoard(area, 1020, 560)}</svg>`;
    default: return '';
  }
}

// 立體感：前景的步道（跟背景一樣，但放在前面那層）、畫面最旁邊的近景花草
export const WALKWAY = (n) => `<svg viewBox="0 0 1200 900" preserveAspectRatio="none">${walk(n)}</svg>`;
export function foreArt(n) {
  const leaf = n ? '#2a4a32' : '#3f8a3f';
  const leaf2 = n ? '#24402c' : '#2f7a34';
  const flower = n ? '#8a6a8a' : '#ff7fa8';
  const tuft = (x, y, s, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    ${[-50, -25, 0, 25, 50].map((a, i) => `<path d="M0 0Q${a * 0.6} -60 ${a} -${110 + (i % 2) * 30}" stroke="${i % 2 ? leaf : leaf2}" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="-30" cy="-6" rx="60" ry="22" fill="${leaf2}"/>
    ${[[-20, -120], [30, -100]].map(([fx, fy]) => `<g transform="translate(${fx} ${fy})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-10" rx="7" ry="12" fill="${flower}" transform="rotate(${r})"/>`).join('')}<circle r="6" fill="#ffd34d"/></g>`).join('')}</g>`;
  return `<svg viewBox="0 0 1200 900" overflow="visible">${tuft(-10, 915, 1.1, false)}${tuft(1215, 915, 1.15, true)}</svg>`;
}

// 遊園車（大張，小孩坐在上面）
export const TRAM_BIG = (n = false) => `<svg viewBox="0 0 220 70" width="660" height="210" overflow="visible">${tramSvg(0, 0, 1, n)}</svg>`;

// ---------- 圖卡（100x100） ----------
const animalIn = (id, s = 0.46, dx = 4, dy = 4) => `<g transform="translate(${dx} ${dy}) scale(${s})">${ANIMALS[id].svg()}</g>`;
export const FOOD = {
  hay: `<rect width="100" height="100" rx="16" fill="#fff6d6"/><ellipse cx="50" cy="66" rx="36" ry="20" fill="#f2d16a"/><path d="M20 60Q50 30 80 60M26 70Q50 44 74 70M34 56l-6 -20M50 50V28M66 56l6 -20" stroke="#d8b040" stroke-width="4" fill="none"/>`,
  fish: `<rect width="100" height="100" rx="16" fill="#e6f4ff"/><path d="M14 50C28 26 60 26 72 50C60 74 28 74 14 50Z" fill="#7cb8e0"/><path d="M68 50L90 32V68Z" fill="#5a9ac8"/><circle cx="30" cy="46" r="5" fill="#1d2433"/>`,
  bamboo: `<rect width="100" height="100" rx="16" fill="#eaf8e0"/><path d="M40 92V10M62 92V18" stroke="#6cbf4a" stroke-width="12"/><path d="M34 40h12M34 66h12M56 46h12M56 72h12" stroke="#4a9a34" stroke-width="4"/><path d="M46 24Q66 10 76 18Q64 28 48 28Z" fill="#7cd05a"/>`,
  gum: `<rect width="100" height="100" rx="16" fill="#eaf6ee"/><path d="M50 92V20" stroke="#8a6a4a" stroke-width="5"/>${[[38, 30, -40], [62, 40, 40], [36, 56, -40], [64, 66, 40], [40, 80, -30]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="20" fill="#7cbf8a" transform="rotate(${a} ${x} ${y})"/>`).join('')}`,
  meat: `<rect width="100" height="100" rx="16" fill="#ffecec"/><path d="M20 40Q30 20 60 26Q84 34 78 60Q70 80 44 74Q16 66 20 40Z" fill="#d9534f"/><path d="M34 44Q50 36 64 46" stroke="#f4a4a0" stroke-width="5" fill="none"/>`,
  cake: `<rect width="100" height="100" rx="16" fill="#ffeef6"/><path d="M20 50H80V82H20Z" fill="#f6dca0"/><path d="M18 50Q50 30 82 50Z" fill="#ff9fc4"/><circle cx="50" cy="30" r="8" fill="#e5484d"/>`,
  candy: `<rect width="100" height="100" rx="16" fill="#ffeef6"/><circle cx="50" cy="50" r="20" fill="#ec5fa0"/><path d="M30 50L10 36V64Z" fill="#ff9fc4"/><path d="M70 50L90 36V64Z" fill="#ff9fc4"/>`,
};
// 規矩圖卡：對的（綠底）、錯的（紅底）
const ok = (body) => `<rect width="100" height="100" rx="16" fill="#e6f8e6"/>${body}`;
const no = (body) => `<rect width="100" height="100" rx="16" fill="#ffe8e8"/>${body}`;
const kid = (x, y, arm = '') => `<circle cx="${x}" cy="${y}" r="10" fill="#ffd6b8"/><path d="M${x} ${y + 10}V${y + 38}M${x} ${y + 38}l-8 14M${x} ${y + 38}l8 14${arm}" stroke="#3a7bd5" stroke-width="6" stroke-linecap="round"/>`;
export const RULE = {
  look: ok(`${animalIn('macaque', 0.3, 52, 30)}${kid(26, 30, ' M26 50l12 -6M26 50l-10 6')}<circle cx="22" cy="28" r="3" fill="#1d2433"/>`),
  feed: no(`${animalIn('macaque', 0.3, 52, 30)}${kid(26, 30, ' M26 48l22 -14')}<circle cx="52" cy="32" r="7" fill="#d9a066"/><circle cx="50" cy="30" r="1.6" fill="#8a5a2b"/>`),
  gentle: ok(`<rect x="44" y="10" width="50" height="80" rx="6" fill="#bfe6fb" stroke="#fff" stroke-width="4"/>${animalIn('penguin', 0.22, 50, 36)}${kid(24, 30, ' M24 48l10 -4M24 48l-10 4')}`),
  knock: no(`<rect x="44" y="10" width="50" height="80" rx="6" fill="#bfe6fb" stroke="#fff" stroke-width="4"/>${animalIn('penguin', 0.22, 54, 36)}${kid(24, 30, ' M24 44l20 -6')}<path d="M48 30l8 -4M48 40l10 0" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  noflash: ok(`${animalIn('panda', 0.3, 50, 34)}<rect x="10" y="40" width="36" height="26" rx="5" fill="#3a3f4a"/><circle cx="28" cy="53" r="8" fill="#9fd0ff"/><path d="M36 38l8 -8M44 38l-8 -8" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  flash: no(`${animalIn('panda', 0.3, 50, 34)}<rect x="10" y="40" width="36" height="26" rx="5" fill="#3a3f4a"/><circle cx="28" cy="53" r="8" fill="#9fd0ff"/><path d="M40 34L48 24L46 34L56 30" stroke="#ffd34d" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="40" cy="38" r="5" fill="#fff6a8"/>`),
  quiet: ok(`${animalIn('koala', 0.3, 50, 20)}${kid(24, 34)}<path d="M20 40h8" stroke="#e5484d" stroke-width="3"/><path d="M30 36v8" stroke="#ffd6b8" stroke-width="4"/>`),
  loud: no(`${animalIn('koala', 0.3, 50, 20)}${kid(24, 34, ' M24 52l-10 -10M24 52l10 -10')}<path d="M36 26l8 -6M38 34l10 0M36 42l8 6" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  handsin: ok(`<rect x="8" y="50" width="84" height="34" rx="8" fill="#3fae6a"/><rect x="12" y="44" width="76" height="8" rx="4" fill="#ffd34d"/>${kid(50, 18)}<circle cx="34" cy="92" r="7" fill="#333"/><circle cx="70" cy="92" r="7" fill="#333"/>`),
  handsout: no(`<rect x="8" y="50" width="84" height="34" rx="8" fill="#3fae6a"/><rect x="12" y="44" width="76" height="8" rx="4" fill="#ffd34d"/>${kid(40, 18, ' M40 38l40 -10')}<circle cx="34" cy="92" r="7" fill="#333"/><circle cx="70" cy="92" r="7" fill="#333"/>`),
};
// 數字圖卡（點點）
export const NUM = (k) => `<rect width="100" height="100" rx="16" fill="#fff6d6"/>${Array.from({ length: k }, (_, i) => `<circle cx="${k === 1 ? 50 : 22 + (i % 3) * 28}" cy="${k <= 3 ? 50 : 34 + Math.floor(i / 3) * 32}" r="11" fill="#ff9f43"/>`).join('')}`;
// 寶寶的圖比較小（紅毛猩猩寶寶畫在框的下面），放大一點才看得清楚
const CARD_FIT = { orangutan: 'translate(-20 -46) scale(.8)' };
export const ANIMAL_CARD = (id, baby = false) => `<rect width="100" height="100" rx="16" fill="#fff"/><g transform="${baby && CARD_FIT[id] ? CARD_FIT[id] : 'translate(6 2) scale(.44)'}">${baby ? BABIES[id]() : ANIMALS[id].svg()}</g>`;

// 腳印：大象的（大圓）、小孩的
export const FOOT_PANEL = `<svg viewBox="0 0 440 340" width="440" height="340"><rect x="6" y="6" width="428" height="328" rx="40" fill="#f2deb0" stroke="#fff" stroke-width="10"/><path d="M40 300q40 -10 80 0t80 0t80 0t80 0" stroke="#e2c890" stroke-width="6" fill="none"/></svg>`;
export const ELE_PRINT = `<svg viewBox="0 0 300 260" width="300" height="260"><ellipse cx="150" cy="140" rx="138" ry="118" fill="#8a6a4a" opacity=".35"/>
  ${[60, 110, 165, 220].map((x, i) => `<ellipse cx="${x + 10}" cy="${36 + (i % 3 ? 0 : 10)}" rx="22" ry="16" fill="#8a6a4a" opacity=".45"/>`).join('')}</svg>`;
export const KID_PRINT = `<svg viewBox="0 0 60 90" width="60" height="90"><ellipse cx="30" cy="54" rx="20" ry="32" fill="#ff9f43"/>${[[14, 14, 6], [24, 8, 6], [34, 8, 5], [43, 13, 5], [49, 22, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9f43"/>`).join('')}</svg>`;
export const KID_SHADOW = (c = '#ff7fa8') => `<svg viewBox="0 0 80 120" width="96" height="112" overflow="visible"><g stroke="#fff" stroke-width="22" stroke-linecap="round" fill="#fff"><circle cx="40" cy="18" r="16"/><path d="M40 34V78M40 78L26 112M40 78L54 112M40 46L16 66M40 46L64 66"/></g>
  <circle cx="40" cy="18" r="16" fill="${c}"/><path d="M40 34V78M40 78L26 112M40 78L54 112M40 46L16 66M40 46L64 66" stroke="${c}" stroke-width="14" stroke-linecap="round"/></svg>`;
// 洗手台
export const SINK = `<svg viewBox="0 0 200 200" width="200" height="200"><rect x="20" y="90" width="160" height="100" rx="10" fill="#c9d0d6"/><path d="M30 90H170L160 130Q100 150 40 130Z" fill="#f4f8fb"/>
  <path d="M100 90V50Q100 36 120 36H136" stroke="#9aa4b0" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="88" y="26" width="24" height="14" rx="5" fill="#5fc3e8"/></svg>`;
export const SOAP = `<svg viewBox="0 0 100 120" width="100" height="120"><rect x="24" y="40" width="52" height="74" rx="12" fill="#ff9fc4"/><rect x="40" y="18" width="20" height="24" fill="#fff"/><path d="M50 18H76V28" stroke="#fff" stroke-width="8" fill="none"/><circle cx="50" cy="76" r="12" fill="#fff" opacity=".7"/></svg>`;
export const TOWEL = `<svg viewBox="0 0 120 120" width="110" height="110"><rect x="10" y="20" width="100" height="80" rx="10" fill="#7cc8ea"/><path d="M10 80H110" stroke="#fff" stroke-width="8"/><path d="M10 92H110" stroke="#fff" stroke-width="4"/></svg>`;
// 喇叭（再聽一次）
export const SPEAKER = `<svg viewBox="0 0 100 100" width="130" height="130"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#ffb300" stroke-width="6"/><path d="M26 40H40L56 26V74L40 60H26Z" fill="#ff9f43"/><path d="M64 38Q72 50 64 62M72 30Q86 50 72 70" stroke="#ff9f43" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
// 跳一下（袋鼠）
export const JUMP_BTN = `<svg viewBox="0 0 100 100" width="150" height="150"><circle cx="50" cy="50" r="46" fill="#ffd34d" stroke="#fff" stroke-width="6"/><path d="M50 22L70 46H58V76H42V46H30Z" fill="#c07a4a"/></svg>`;
// 保育員的餵食桶
export const BUCKET = `<svg viewBox="0 0 120 120" width="120" height="120"><path d="M20 40H100L92 110H28Z" fill="#5fa8e8"/><path d="M24 40Q60 4 96 40" stroke="#555" stroke-width="5" fill="none"/><rect x="16" y="34" width="88" height="12" rx="6" fill="#3a7bd5"/></svg>`;

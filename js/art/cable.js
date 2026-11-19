// 纜車（11/19）：動物園（上面）和海生館（下面）之間。月台、車廂、車廂裡、窗外的風景。
import { skyColors, weatherLayer } from './bathroom.js';
import { ANIMALS } from './animals.js';
import { gondolaSvg } from './coast.js';
import { shipSvg } from './island.js';

const night = (ph) => ph === 'night' || ph === 'dusk';

// 月台：end = 'zoo'（山上的站，外面是樹和動物園）或 'sea'（山下的站，外面是海）
export function cablePlatform(ph, wx, end = 'sea') {
  const n = night(ph);
  const { colors: [a, b] } = skyColors(ph, wx);
  const out = end === 'sea'
    ? `<path d="M0 260Q300 230 600 250T1200 240V430H0Z" fill="${n ? '#1f3f66' : '#5fc0ec'}"/>${[[200, 320], [700, 300], [1000, 340]].map(([x, y]) => `<path d="M${x - 30} ${y}q15 -8 30 0t30 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`).join('')}<g transform="translate(860 230) scale(.4)">${shipSvg(0, 0, 1, n)}</g>`
    : `<path d="M0 300Q200 220 420 280T820 250T1200 280V430H0Z" fill="${n ? '#2f5a3a' : '#6fb86a'}"/>${[120, 300, 520, 760, 980, 1120].map((x, i) => `<g transform="translate(${x} ${300 + (i % 2) * 20})"><rect x="-6" y="0" width="12" height="40" fill="#8a5a2b"/><circle cy="-10" r="34" fill="${n ? '#2f5a3a' : '#4caf50'}"/></g>`).join('')}<g transform="translate(940 140) scale(.6)">${ANIMALS.giraffe.svg()}</g>`;
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="cbsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="430" fill="url(#cbsky)"/>${out}
    ${weatherLayer(wx, ph, 0, 0, 1200, 430)}
    <!-- 屋頂、柱子 -->
    <path d="M0 0H1200V70H0Z" fill="${n ? '#5a3030' : '#e5484d'}"/><path d="M0 70H1200" stroke="#fff" stroke-width="6"/>
    ${[40, 1120].map((x) => `<rect x="${x}" y="70" width="40" height="640" fill="${n ? '#5a6068' : '#c9d0da'}"/>`).join('')}
    <!-- 軌道和大輪子 -->
    <path d="M0 150H1200" stroke="#5a6676" stroke-width="12"/><path d="M0 164H1200" stroke="#8a96a6" stroke-width="4"/>
    <g transform="translate(1060 150)"><circle r="70" fill="none" stroke="#6a7686" stroke-width="12"/>${[0, 45, 90, 135].map((r) => `<path d="M${(Math.cos(r * Math.PI / 180) * 70).toFixed(1)} ${(Math.sin(r * Math.PI / 180) * 70).toFixed(1)}L${(-Math.cos(r * Math.PI / 180) * 70).toFixed(1)} ${(-Math.sin(r * Math.PI / 180) * 70).toFixed(1)}" stroke="#6a7686" stroke-width="6"/>`).join('')}<circle r="16" fill="#ffd34d"/></g>
    <!-- 地板、月台邊、黃線 -->
    <rect y="430" width="1200" height="40" fill="${n ? '#3a4048' : '#8a96a6'}"/>
    <rect y="470" width="1200" height="430" fill="${n ? '#5a6068' : '#dfe4ea'}"/>
    <rect y="690" width="1200" height="14" fill="#ffd34d"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 42}" y="694" width="20" height="6" fill="#fff" opacity=".6"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 170} 470L${i * 170 - 90} 900" stroke="${n ? '#4a5058' : '#cdd4dc'}" stroke-width="3"/>`).join('')}
  </svg>`;
}
// 排隊的腳印（站在黃線後面）
export const CB_FEET = `<svg viewBox="0 0 120 90" width="120" height="90">${[[38, 50, -8], [82, 50, 8]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="16" ry="26" fill="#5fc3ea" opacity=".85"/>${[[-10, -28, 5], [-2, -33, 5], [6, -33, 4], [12, -28, 4]].map(([a, b, c]) => `<circle cx="${a}" cy="${b}" r="${c}" fill="#5fc3ea" opacity=".85"/>`).join('')}</g>`).join('')}</svg>`;
// 大纜車（月台上）：門會往兩邊打開
export function bigGondola(n = false) {
  return `<svg viewBox="0 0 420 460" width="420" height="460" overflow="visible">
    <path d="M210 0V90" stroke="#5a6676" stroke-width="12"/><rect x="160" y="-10" width="100" height="24" rx="8" fill="#5a6676"/>
    <path d="M60 90H360Q384 90 384 114V420Q384 446 358 446H62Q36 446 36 420V114Q36 90 60 90Z" fill="#e5484d"/>
    <rect x="60" y="112" width="300" height="130" rx="18" fill="${n ? '#ffe680' : '#cfeeff'}"/>
    <path d="M36 300H384" stroke="#fff" stroke-width="6" opacity=".7"/>
    <!-- 門後面：車廂裡面（門打開才看得到） -->
    <rect x="110" y="250" width="200" height="196" rx="8" fill="#5a2228"/><rect x="122" y="372" width="176" height="40" rx="10" fill="#3a5a9a"/><path d="M122 300H298" stroke="#c9d0da" stroke-width="8" stroke-linecap="round"/>
    <g class="cbd cbd-l"><rect x="110" y="250" width="100" height="196" rx="10" fill="#c93a3f"/><rect x="122" y="264" width="76" height="70" rx="8" fill="${n ? '#ffe680' : '#cfeeff'}"/></g>
    <g class="cbd cbd-r"><rect x="210" y="250" width="100" height="196" rx="10" fill="#c93a3f"/><rect x="222" y="264" width="76" height="70" rx="8" fill="${n ? '#ffe680' : '#cfeeff'}"/></g>
  </svg>`;
}
// 車廂裡：大窗戶（中間挖空，看得到外面）、扶手、兩排椅子
export const CB_INSIDE = `<svg viewBox="0 0 1200 900">
  <path fill-rule="evenodd" d="M0 0H1200V900H0Z M130 90H1070Q1110 90 1110 130V530Q1110 570 1070 570H130Q90 570 90 530V130Q90 90 130 90Z" fill="#e5484d"/>
  <path d="M90 130Q90 90 130 90H1070Q1110 90 1110 130V530Q1110 570 1070 570H130Q90 570 90 530Z" fill="none" stroke="#fff" stroke-width="14"/>
  <path d="M600 90V570" stroke="#fff" stroke-width="10"/>
  <path d="M120 600H1080" stroke="#c9d0da" stroke-width="16" stroke-linecap="round"/>${[160, 600, 1040].map((x) => `<rect x="${x - 6}" y="600" width="12" height="40" fill="#9aa4b0"/>`).join('')}
  <rect x="0" y="700" width="1200" height="200" fill="#b8323a"/>
  <rect x="60" y="720" width="1080" height="70" rx="20" fill="#3a5a9a"/><rect x="60" y="780" width="1080" height="20" rx="8" fill="#2a4a80"/>
  <rect x="0" y="860" width="1200" height="40" fill="#8a222a"/>
</svg>`;
// 窗外的風景：一條長長的（1200x2400），上面是動物園、中間山坡、下面海生館和海
export const STRIP_H = 2400;
export function viewStrip(ph, wx) {
  const n = night(ph);
  const { colors: [a, b] } = skyColors(ph, wx);
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="0" width="16" height="50" fill="#8a5a2b"/><circle cy="-14" r="44" fill="${n ? '#2f5a3a' : '#4caf50'}"/><circle cx="-24" cy="4" r="28" fill="${n ? '#2a5234' : '#43a047'}"/></g>`;
  return `<svg viewBox="0 0 1200 ${STRIP_H}" width="1200" height="${STRIP_H}">
    <defs><linearGradient id="cvsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="${STRIP_H}" fill="url(#cvsky)"/>
    <!-- 動物園（上面） -->
    <path d="M0 160Q300 120 600 150T1200 140V720H0Z" fill="${n ? '#3f6a4a' : '#a7dc8a'}"/>
    <path d="M60 520H1140" stroke="#a8743a" stroke-width="8"/>${Array.from({ length: 28 }, (_, i) => `<rect x="${70 + i * 40}" y="496" width="8" height="34" fill="#c98a4a"/>`).join('')}
    ${tree(120, 300)}${tree(1080, 320, 1.1)}${tree(560, 220, 0.8)}
    <g transform="translate(320 300) scale(.9)">${ANIMALS.elephant.svg()}</g>
    <!-- 山坡 -->
    <path d="M0 700Q600 640 1200 700V1700H0Z" fill="${n ? '#2f5a3a' : '#6fb86a'}"/>
    ${[[100, 860], [260, 1000], [140, 1200], [1040, 900], [1120, 1100], [980, 1320], [220, 1440], [1100, 1500], [420, 1260], [760, 1080]].map(([x, y], i) => tree(x, y, 0.9 + (i % 3) * 0.15)).join('')}
    ${[[540, 900], [700, 1250]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-30 0q15 -12 30 0q15 -12 30 0" stroke="#fff" stroke-width="5" fill="none"/></g>`).join('')}
    <!-- 對面那條纜車線 -->
    <path d="M880 0V${STRIP_H}M900 0V${STRIP_H}" stroke="#4a5666" stroke-width="3"/>
    ${[600, 1350].map((y) => `<g transform="translate(890 ${y})"><path d="M-30 120L-8 0H8L30 120" fill="none" stroke="#8a96a6" stroke-width="8"/><rect x="-40" y="-10" width="80" height="14" rx="4" fill="#6a7686"/></g>`).join('')}
    <!-- 海生館（下面）：珊瑚王國館的圓頂、世界水域館的地球、迎賓廣場的噴水池 -->
    <path d="M0 1700Q600 1660 1200 1700V2100H0Z" fill="${n ? '#8a7a5a' : '#f6e2a8'}"/>
    <g transform="translate(330 1620)"><path d="M0 120Q10 0 150 -6Q290 0 300 120Z" fill="#4fa8e0"/><rect x="0" y="116" width="300" height="80" fill="#ffe6e0"/>${[50, 150, 250].map((x) => `<path d="M${x - 26} 50q13 -12 26 0t26 0" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>`).join('')}</g>
    <g transform="translate(720 1700)"><rect width="260" height="130" rx="10" fill="#eef2f8"/><circle cx="130" cy="-20" r="44" fill="#5fc0ec" stroke="#fff" stroke-width="6"/></g>
    <ellipse cx="520" cy="1950" rx="160" ry="50" fill="#a8dcf4"/>${[460, 520, 580].map((x) => `<path d="M${x} 1950Q${x - 4} 1910 ${x} 1890Q${x + 4} 1910 ${x} 1950" fill="#fff"/>`).join('')}
    <!-- 海、碼頭、郵輪 -->
    <path d="M0 2060Q600 2030 1200 2060V${STRIP_H}H0Z" fill="${n ? '#1f3f66' : '#5fc0ec'}"/>
    ${[[160, 2160], [460, 2300], [1000, 2200], [760, 2350]].map(([x, y]) => `<path d="M${x - 30} ${y}q15 -10 30 0t30 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`).join('')}
    <rect x="560" y="2120" width="200" height="30" fill="#b8895a"/>
    <g transform="translate(360 2100) scale(.9)">${shipSvg(0, 0, 1, n)}</g>
    ${weatherLayer(wx, ph, 0, 0, 1200, STRIP_H)}
  </svg>`;
}
// 窗外可以點的東西在長條上的位置（中心）
export const VIEW_SPOTS = {
  giraffe: { at: [880, 330], size: 260 },
  roof: { at: [480, 1680], size: 300 },
  ship: { at: [480, 2180], size: 300 },
};
export const OTHER_GONDOLA = (n = false, c = '#3a7bd5') => `<svg viewBox="-50 -50 100 110" width="120" height="132">${gondolaSvg(0, 0, 1, n, c)}</svg>`;
// 圖卡：坐好（對）、在纜車裡跳（錯）
const ok = (b) => `<rect width="100" height="100" rx="16" fill="#e6f8e6"/>${b}`;
const no = (b) => `<rect width="100" height="100" rx="16" fill="#ffe8e8"/>${b}`;
const cabin = '<rect x="14" y="20" width="72" height="66" rx="10" fill="#e5484d"/><rect x="22" y="28" width="56" height="24" rx="6" fill="#cfeeff"/><path d="M50 4V20" stroke="#5a6676" stroke-width="4"/><rect x="22" y="70" width="56" height="8" rx="3" fill="#3a5a9a"/>';
export const CB_CARD = {
  sit: ok(`${cabin}<circle cx="50" cy="54" r="7" fill="#ffd6b8"/><path d="M50 60V70M44 70H56" stroke="#3a7bd5" stroke-width="5" stroke-linecap="round"/>`),
  jump: no(`<g transform="rotate(10 50 50)">${cabin}</g><circle cx="52" cy="36" r="7" fill="#ffd6b8"/><path d="M52 42V54M52 54l-6 8M52 54l6 8M44 46l-6 -6M60 46l6 -6" stroke="#3a7bd5" stroke-width="4" stroke-linecap="round"/><path d="M8 40q-4 10 0 20M92 40q4 10 0 20" stroke="#e5484d" stroke-width="4" fill="none" stroke-linecap="round"/>`),
};

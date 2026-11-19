// 歡樂島海岸區（第五張地圖，11/19）：動物園在高處、海生館在低處，坐纜車上下。
// 郵輪靠在海岸區的碼頭；地圖上有台灣水域館、珊瑚王國館、世界水域館、鯨典館（暫不開放）、迎賓廣場、纜車站。
// 舞台 1200x900。
import { weatherLayer, skyColors } from './bathroom.js';
import { ANIMALS } from './animals.js';
import { CREATURES } from './sea.js';
import { pierExt } from './island.js';

const night = (ph) => ph === 'night' || ph === 'dusk';

// 地圖上的位置：box [x, y, w, h]、門口（小孩走到這裡）
export const COAST = {
  cable: { box: [30, 104, 240, 210], door: [150, 330] },
  tw: { box: [292, 176, 260, 236], door: [422, 420] },
  coral: { box: [572, 126, 292, 286], door: [718, 420] },
  world: { box: [892, 176, 280, 236], door: [1032, 420] },
  plaza: { box: [420, 520, 360, 236], door: [600, 700] },
  whale: { box: [56, 560, 276, 208], door: [194, 780] },
  pier: { box: [930, 760, 220, 128], door: [1040, 772] },
};
// 出發點：坐船來的在碼頭、坐纜車下來的在纜車站
export const COAST_START = { pier: [1040, 800], cable: [150, 340] };
const UP = 450;      // 上面那條路（三個館的門口）
const DOWN = 800;    // 下面的海濱步道（碼頭、鯨典館）
const MID = 600;     // 中間的路（穿過迎賓廣場）
export function coastPath(dest, from = 'pier') {
  const d = COAST[dest].door;
  const s = COAST_START[from] || COAST_START.pier;
  if (dest === from) return [s];
  if (from === 'cable') {
    const top = [[150, UP]];
    if (dest === 'plaza') return [s, ...top, [MID, UP], d];
    if (dest === 'whale') return [s, ...top, [MID, UP], [MID, DOWN], [d[0], DOWN], d];
    if (dest === 'pier') return [s, ...top, [MID, UP], [MID, DOWN], [d[0], DOWN], d];
    return [s, ...top, [d[0], UP], d];
  }
  if (dest === 'whale') return [s, [d[0], DOWN], d];
  if (dest === 'plaza') return [s, [MID, DOWN], d];
  if (dest === 'cable') return [s, [MID, DOWN], [MID, UP], [150, UP], d];
  return [s, [MID, DOWN], [MID, UP], [d[0], UP], d];
}

const tree = (x, y, s = 1, n = false, c = '#4caf50') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="26" fill="#8a5a2b"/><circle cy="-8" r="22" fill="${n ? '#2f5a3a' : c}"/><circle cx="-12" cy="2" r="14" fill="${n ? '#2a5234' : '#43a047'}"/></g>`;
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q-4 -30 4 -60" stroke="#a87a4a" stroke-width="8" fill="none"/>${[-60, -20, 20, 60, 100, 140].map((a) => `<path d="M4 -60q${Math.cos(a * Math.PI / 180) * 30} ${Math.sin(a * Math.PI / 180) * 16 - 4} ${Math.cos(a * Math.PI / 180) * 44} ${Math.sin(a * Math.PI / 180) * 26 + 10}" stroke="#3f9a4f" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
// 纜車的鐵塔
const pylon = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0L-4 -90H4L14 0" fill="none" stroke="#8a96a6" stroke-width="6"/><path d="M-10 -30H10M-8 -60H8" stroke="#8a96a6" stroke-width="4"/><rect x="-22" y="-96" width="44" height="8" rx="3" fill="#6a7686"/></g>`;
// 小纜車車廂
export function gondolaSvg(x = 0, y = 0, s = 1, n = false, c = '#e5484d') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -40V-6" stroke="#5a6676" stroke-width="5"/><rect x="-14" y="-46" width="28" height="10" rx="4" fill="#5a6676"/>
    <path d="M-34 -6H34Q40 -6 40 2V44Q40 56 28 56H-28Q-40 56 -40 44V2Q-40 -6 -34 -6Z" fill="${c}"/>
    <rect x="-32" y="2" width="64" height="26" rx="6" fill="${n ? '#ffe680' : '#cfeeff'}"/><path d="M0 2V28" stroke="${c}" stroke-width="4"/>
    <path d="M-40 36H40" stroke="#fff" stroke-width="4" opacity=".7"/>
  </g>`;
}
export const MAP_GONDOLA = `<svg viewBox="-50 -50 100 110">${gondolaSvg(0, 0, 1)}</svg>`;

export function coastBack(ph, wx) {
  const n = night(ph);
  const sea = n ? '#1f3f66' : '#5fc0ec';
  const land = n ? '#3f6a4a' : '#a7dc8a';
  const cliff = n ? '#2f5a3a' : '#6fb86a';
  const sand = n ? '#8a7a5a' : '#f6e2a8';
  const road = n ? '#6a5f52' : '#e8d4a8';
  const { colors: [a] } = skyColors(ph, wx);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${sea}"/>
    ${[[80, 870], [330, 880], [760, 880], [1180, 600], [1170, 420]].map(([x, y]) => `<path d="M${x - 30} ${y}q15 -10 30 0t30 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`).join('')}
    <!-- 沙灘、陸地 -->
    <path d="M0 0H1180Q1196 300 1172 560Q1168 760 1100 840L940 846Q900 828 860 840L80 846Q10 840 0 780Z" fill="${sand}"/>
    <path d="M0 0H1160Q1176 300 1154 552Q1150 744 1090 822L80 828Q24 822 0 770Z" fill="${land}"/>
    <!-- 上面是高地（動物園在上面）：山壁、柵欄、長頸鹿探出頭 -->
    <path d="M0 0H1160V60Q1000 96 820 70Q640 46 460 84Q300 110 0 96Z" fill="${cliff}"/>
    <path d="M0 96Q300 110 460 84Q640 46 820 70Q1000 96 1160 60" stroke="${n ? '#24402c' : '#4f9a4f'}" stroke-width="10" fill="none"/>
    <path d="M320 50H1100" stroke="#a8743a" stroke-width="4"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${330 + i * 40}" y="40" width="5" height="20" fill="#c98a4a"/>`).join('')}
    <g transform="translate(980 -6) scale(.42)">${ANIMALS.giraffe.svg()}</g>
    ${tree(380, 30, 0.9, n)}${tree(560, 24, 1, n)}${tree(860, 30, 0.9, n)}${tree(1120, 26, 1, n)}
    <!-- 纜車線：從纜車站往左上（往高地上的動物園） -->
    <path d="M144 130L196 -20M160 130L212 -20" stroke="#4a5666" stroke-width="3"/>
    ${pylon(186, 66, 0.7)}
    <!-- 路 -->
    <path d="M150 ${UP}H1032M${MID} ${UP}V${DOWN}M194 ${DOWN}H1040V772M150 330V${UP}" stroke="${road}" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${['tw', 'coral', 'world'].map((k) => `<path d="M${COAST[k].door[0]} ${COAST[k].door[1]}V${UP}" stroke="${road}" stroke-width="22" stroke-linecap="round"/>`).join('')}
    ${palm(1130, 560, 0.9)}${palm(370, 520, 0.8)}${palm(830, 520, 0.85)}${tree(70, 490, 1, n)}${tree(1110, 470, 0.9, n)}
    ${[[300, 760], [890, 700]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-26" y="-10" width="52" height="8" rx="3" fill="#b8895a"/><rect x="-22" y="-2" width="4" height="12" fill="#8a5a2b"/><rect x="18" y="-2" width="4" height="12" fill="#8a5a2b"/></g>`).join('')}
    ${n ? '' : `<g fill="#fff" opacity=".85"><ellipse cx="240" cy="140" rx="40" ry="11"/><ellipse cx="1080" cy="130" rx="34" ry="10"/></g>`}
    <rect width="1200" height="2" fill="${a}" opacity="0"/>
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

const win = (n) => (n ? '#ffe08a' : '#bfe6fb');
const mini = (id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${CREATURES[id].svg()}</g>`;
// 館名牌（只有圖案）
const plate = (x, y, html, c) => `<g transform="translate(${x} ${y})"><rect x="-34" y="-26" width="68" height="52" rx="14" fill="${c}" stroke="#fff" stroke-width="4"/>${html}</g>`;

// 台灣水域館：屋頂像山和溪流，牆上畫著溪水，招牌是櫻花鉤吻鮭
export function twExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 260 236" overflow="visible">
    <path d="M10 96L70 40L120 80L170 30L250 96Z" fill="${n ? '#3a6a5a' : '#5aa88a'}"/>
    <path d="M70 40L84 54L60 60ZM170 30L186 46L160 52Z" fill="#fff" opacity=".8"/>
    <rect x="16" y="92" width="228" height="136" rx="10" fill="${n ? '#5a7a8a' : '#e6f4f2'}"/>
    <path d="M16 170Q70 150 130 172T244 166V228H16Z" fill="${n ? '#3a6a8a' : '#7cc8ea'}"/>
    <path d="M30 196q16 -8 32 0t32 0M140 200q16 -8 32 0t32 0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>
    ${[40, 82, 178, 220].map((x) => `<rect x="${x - 14}" y="112" width="28" height="34" rx="6" fill="${win(n)}"/>`).join('')}
    <rect x="104" y="150" width="52" height="78" rx="8" fill="${n ? '#2a4a5a' : '#3a7a9a'}"/><path d="M130 150V228" stroke="#fff" stroke-width="3" opacity=".6"/>
    ${plate(130, 116, mini('salmon', -30, -32, 0.3), '#3f9a7a')}
  </svg>`;
}
// 珊瑚王國館：圓頂像海浪，外牆是珊瑚礁，招牌是白鯨
export function coralExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 292 286" overflow="visible">
    <path d="M10 130Q20 20 146 16Q272 20 282 130Z" fill="${n ? '#3a5a8a' : '#4fa8e0'}"/>
    <path d="M30 120Q40 40 146 36Q252 40 262 120" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>
    ${[70, 146, 222].map((x) => `<path d="M${x - 26} 70q13 -12 26 0t26 0" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`).join('')}
    <rect x="14" y="124" width="264" height="154" rx="12" fill="${n ? '#6a5a7a' : '#ffe6e0'}"/>
    ${[[40, 278, '#ff7a6a'], [74, 278, '#ffb35c'], [222, 278, '#c77dff'], [252, 278, '#ff7a9a']].map(([x, y, c]) => `<path d="M${x} ${y}V${y - 46}M${x} ${y - 20}l-12 -14M${x} ${y - 30}l12 -12" stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none"/>`).join('')}
    ${[60, 232].map((x) => `<circle cx="${x}" cy="168" r="18" fill="${win(n)}" stroke="#fff" stroke-width="5"/>`).join('')}
    <path d="M110 278V206Q110 180 146 180Q182 180 182 206V278Z" fill="${n ? '#2a3a6a' : '#3a6ab0'}"/><path d="M146 182V278" stroke="#fff" stroke-width="3" opacity=".6"/>
    ${plate(146, 150, mini('beluga', -34, -36, 0.34), '#3a7bd5')}
  </svg>`;
}
// 世界水域館：方方的現代建築，屋頂上有地球，招牌是企鵝
export function worldExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 280 236" overflow="visible">
    <rect x="14" y="70" width="252" height="160" rx="10" fill="${n ? '#5a6a7a' : '#eef2f8'}"/>
    <rect x="14" y="70" width="252" height="22" fill="${n ? '#3a4a6a' : '#6a8ab8'}"/>
    <g transform="translate(140 42)"><circle r="36" fill="#5fc0ec" stroke="#fff" stroke-width="5"/><path d="M-26 -10Q-10 -24 4 -14Q10 -2 -4 4Q-20 6 -26 -10ZM8 10Q24 4 28 16Q18 30 6 22Z" fill="#7cc06a"/><path d="M-36 0H36M0 -36V36" stroke="#fff" stroke-width="2" opacity=".5"/></g>
    ${[44, 88, 192, 236].map((x) => `<rect x="${x - 16}" y="104" width="32" height="40" rx="6" fill="${win(n)}"/><rect x="${x - 16}" y="154" width="32" height="30" rx="6" fill="${win(n)}"/>`).join('')}
    <rect x="114" y="160" width="52" height="70" rx="8" fill="${n ? '#2a3a5a' : '#4a6a9a'}"/><path d="M140 160V230" stroke="#fff" stroke-width="3" opacity=".6"/>
    ${plate(140, 124, mini('adelie', -26, -34, 0.3), '#6a8ab8')}
  </svg>`;
}
// 鯨典館：屋頂是鯨魚尾巴，目前暫不開放（門口圍起來）
export function whaleExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 276 208" overflow="visible">
    <path d="M138 70Q120 20 70 16Q90 40 110 60Q60 46 30 70Q90 76 138 70Q186 76 246 70Q216 46 166 60Q186 40 206 16Q156 20 138 70Z" fill="${n ? '#5a6a7a' : '#8aa0b8'}"/>
    <rect x="20" y="70" width="236" height="132" rx="10" fill="${n ? '#5a6068' : '#dfe4ea'}"/>
    ${[52, 98, 178, 224].map((x) => `<rect x="${x - 15}" y="96" width="30" height="34" rx="6" fill="${n ? '#4a5058' : '#c8d0da'}"/>`).join('')}
    <rect x="112" y="128" width="52" height="74" rx="8" fill="#8a929c"/>
    <!-- 暫停開放：黃黑欄杆、圓圓的禁止牌 -->
    <g transform="translate(70 168)"><rect width="136" height="16" rx="4" fill="#ffd34d"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${8 + i * 22} 0l12 16h-10l-12 -16z" fill="#2a2a2a"/>`).join('')}<rect x="6" y="16" width="8" height="24" fill="#8a929c"/><rect x="122" y="16" width="8" height="24" fill="#8a929c"/></g>
    <g transform="translate(138 100)"><circle r="22" fill="#fff" stroke="#e5484d" stroke-width="6"/><path d="M-14 0H14" stroke="#e5484d" stroke-width="7" stroke-linecap="round"/></g>
  </svg>`;
}
// 迎賓廣場：圓形廣場、噴水池（戲水）、白鯨雕像
export function plazaExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 360 236" overflow="visible">
    <ellipse cx="180" cy="134" rx="172" ry="96" fill="${n ? '#7a7066' : '#f4e6c8'}"/>
    <ellipse cx="180" cy="134" rx="150" ry="80" fill="none" stroke="${n ? '#8a8076' : '#e6d2a8'}" stroke-width="8" stroke-dasharray="20 12"/>
    <ellipse cx="180" cy="140" rx="96" ry="44" fill="${n ? '#3a6a8a' : '#7cc8ea'}"/>
    <ellipse cx="180" cy="136" rx="82" ry="34" fill="${n ? '#4a7a9a' : '#a8dcf4'}"/>
    ${[[120, 132], [150, 150], [210, 150], [240, 132], [180, 122]].map(([x, y], i) => `<g class="jet" style="animation-delay:${i * 0.3}s"><path d="M${x} ${y}Q${x - 4} ${y - 40} ${x} ${y - 58}Q${x + 4} ${y - 40} ${x} ${y}" fill="#dff4ff" opacity=".9"/><circle cx="${x}" cy="${y - 60}" r="6" fill="#fff"/></g>`).join('')}
    <g transform="translate(180 100) scale(.5)"><path d="M0 -40Q-30 -100 -90 -100Q-60 -60 -24 -40Z" fill="#dde9f1" stroke="#a9c3d4" stroke-width="5"/><path d="M0 -40Q30 -100 90 -100Q60 -60 24 -40Z" fill="#dde9f1" stroke="#a9c3d4" stroke-width="5"/><rect x="-14" y="-44" width="28" height="70" rx="12" fill="#dde9f1" stroke="#a9c3d4" stroke-width="5"/></g>
    ${[[34, 120], [326, 120]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-4" y="-50" width="8" height="54" fill="#5a6676"/><path d="M-4 -48h-30l8 10l-8 10h30z" fill="#5fc3ea"/></g>`).join('')}
  </svg>`;
}
// 纜車站：屋頂下有大輪子，車廂掛在線上。side：coast（線往左上，動物園在上面）、zoo（線往下，海生館在下面）
export function cableExt(ph, { side = 'coast' } = {}) {
  const n = night(ph);
  const coast = side === 'coast';
  return `<svg viewBox="0 0 240 210" overflow="visible">
    ${coast ? '' : '<path d="M110 60L110 260M130 60L130 260" stroke="#4a5666" stroke-width="3"/>'}
    <rect x="20" y="70" width="200" height="132" rx="10" fill="${n ? '#5a6068' : '#f2f4f8'}"/>
    <path d="M6 76L120 22L234 76Z" fill="${n ? '#8a3a3a' : '#e5484d'}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    <g transform="translate(120 104)"><circle r="30" fill="none" stroke="#6a7686" stroke-width="8"/>${[0, 60, 120].map((a) => `<path d="M${(Math.cos(a * Math.PI / 180) * 30).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 30).toFixed(1)}L${(-Math.cos(a * Math.PI / 180) * 30).toFixed(1)} ${(-Math.sin(a * Math.PI / 180) * 30).toFixed(1)}" stroke="#6a7686" stroke-width="5"/>`).join('')}<circle r="8" fill="#ffd34d"/></g>
    <g class="moored">${gondolaSvg(coast ? 70 : 120, coast ? 156 : 160, 0.72, n)}</g>
    <rect x="20" y="194" width="200" height="10" rx="4" fill="#ffd34d"/>
    <rect x="150" y="150" width="56" height="52" rx="6" fill="${n ? '#3a4048' : '#6a7686'}"/>
  </svg>`;
}
// 碼頭（跟歡樂島原本的一樣，船停在旁邊）
export const coastPierExt = (ph) => pierExt(ph, { side: 'island' });

// 動物園地圖上：纜車站的線往下拉到海邊
export const CABLE_DOWN_LINE = (n) => `<path d="M610 840L610 920M630 840L630 920" stroke="${n ? '#8a96a6' : '#4a5666'}" stroke-width="3"/>`;

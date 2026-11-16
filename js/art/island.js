// 歡樂島（第四張地圖）：整座島是動物王國。郊區的碼頭坐郵輪過來。
// 地圖上有 8 個展示區、遊園車站（中間）、美食街、紀念品店、碼頭。舞台 1200x900。
import { weatherLayer, skyColors } from './bathroom.js';
import { ANIMALS, BABIES } from './animals.js';

const night = (ph) => ph === 'night' || ph === 'dusk';

// 8 個展示區（參考臺北市立動物園）
export const AREAS = {
  kids: { name: '兒童動物區', animals: ['llama', 'pony', 'rabbit'], ground: '#b4e39a', ground2: '#9ed882' },
  taiwan: { name: '臺灣動物區', animals: ['bear', 'leopardcat', 'pangolin', 'macaque'], ground: '#8fc97a', ground2: '#76b862' },
  rain: { name: '熱帶雨林區', animals: ['elephant', 'tapir', 'orangutan'], ground: '#5fae6a', ground2: '#4a9a58' },
  africa: { name: '非洲動物區', animals: ['giraffe', 'zebra', 'hippo', 'lion'], ground: '#e8d08a', ground2: '#d8bc6e' },
  desert: { name: '沙漠動物區', animals: ['camel', 'meerkat'], ground: '#f2d9a0', ground2: '#e6c47e' },
  aus: { name: '澳洲動物區', animals: ['kangaroo', 'koala'], ground: '#d9c27a', ground2: '#c8ac62' },
  penguin: { name: '企鵝館', animals: ['penguin'], ground: '#dff2fb', ground2: '#c6e6f6', indoor: true },
  panda: { name: '大貓熊館', animals: ['panda'], ground: '#bfe3a8', ground2: '#a6d48e', indoor: true },
};
export const AREA_IDS = Object.keys(AREAS);

// 地圖上的位置：box [x, y, w, h]、門口（小孩走到這裡）
export const ISLAND = {
  pier: { box: [490, 772, 220, 128], door: [600, 772] },
  tram: { box: [510, 330, 180, 130], door: [600, 470] },
  kids: { box: [118, 92, 196, 139], door: [216, 244] },
  taiwan: { box: [320, 40, 240, 180], door: [440, 244] },
  rain: { box: [640, 40, 240, 180], door: [760, 244] },
  africa: { box: [930, 70, 240, 170], door: [1050, 244] },
  desert: { box: [30, 316, 230, 160], door: [145, 312] },
  aus: { box: [940, 316, 230, 160], door: [1055, 312] },
  penguin: { box: [40, 536, 220, 160], door: [150, 702] },
  snack: { box: [290, 548, 200, 150], door: [390, 702] },
  gift: { box: [710, 548, 200, 150], door: [810, 702] },
  panda: { box: [940, 536, 220, 160], door: [1050, 702] },
};
export const ISLAND_START = [600, 770];
const ROAD_TOP = 280;
const ROAD_BOTTOM = 730;
// 從碼頭走到某個地方：先上大路（下面那條），要去上面的就走中間的路上去
export function islandPath(dest) {
  const d = ISLAND[dest].door;
  const s = ISLAND_START;
  if (dest === 'pier') return [s];
  if (d[1] >= 600) return [s, [600, ROAD_BOTTOM], [d[0], ROAD_BOTTOM], d];
  if (dest === 'tram') return [s, [600, ROAD_BOTTOM], d];
  return [s, [600, ROAD_BOTTOM], [600, ROAD_TOP], [d[0], ROAD_TOP], d];
}

const tree = (x, y, s = 1, n = false, c = '#4caf50') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="26" fill="#8a5a2b"/><circle cy="-8" r="22" fill="${n ? '#2f5a3a' : c}"/><circle cx="-12" cy="2" r="14" fill="${n ? '#2a5234' : '#43a047'}"/></g>`;
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q-4 -30 4 -60" stroke="#a87a4a" stroke-width="8" fill="none"/>${[-60, -20, 20, 60, 100, 140].map((a) => `<path d="M4 -60q${Math.cos(a * Math.PI / 180) * 30} ${Math.sin(a * Math.PI / 180) * 16 - 4} ${Math.cos(a * Math.PI / 180) * 44} ${Math.sin(a * Math.PI / 180) * 26 + 10}" stroke="#3f9a4f" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}</g>`;

export function islandBack(ph, wx) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const n = night(ph);
  const sea = n ? '#1f3f66' : grey ? '#6aa6c8' : '#5fc0ec';
  const land = n ? '#3f6a4a' : grey ? '#9cc08a' : '#a7dc8a';
  const sand = n ? '#8a7a5a' : '#f6e2a8';
  const road = n ? '#6a5f52' : '#e8d4a8';
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="isky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="${sea}"/>
    ${[[80, 860], [300, 880], [880, 870], [1120, 850], [1160, 300], [20, 300]].map(([x, y]) => `<path d="M${x - 30} ${y}q15 -10 30 0t30 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`).join('')}
    <path d="M10 60Q20 10 120 14L1080 10Q1190 14 1192 80L1194 760Q1190 830 1100 836L760 840Q700 900 600 900Q500 900 440 840L100 836Q10 830 8 760Z" fill="${sand}"/>
    <path d="M24 70Q30 26 120 28L1080 24Q1176 28 1178 86L1180 750Q1176 816 1096 820L740 822Q690 880 600 880Q510 880 460 822L104 820Q24 816 22 750Z" fill="${land}"/>
    <!-- 遊園車的鐵軌（繞一圈） -->
    <rect x="290" y="268" width="620" height="472" rx="90" fill="none" stroke="${n ? '#4a4038' : '#b9a27a'}" stroke-width="20"/>
    <rect x="290" y="268" width="620" height="472" rx="90" fill="none" stroke="${n ? '#8a8070' : '#f4ead0'}" stroke-width="10" stroke-dasharray="3 9"/>
    <!-- 步道 -->
    <path d="M600 790V${ROAD_BOTTOM}M60 ${ROAD_BOTTOM}H1140M600 ${ROAD_BOTTOM}V${ROAD_TOP}M60 ${ROAD_TOP}H1140" stroke="${road}" stroke-width="30" fill="none" stroke-linecap="round"/>
    ${Object.entries(ISLAND).filter(([k]) => k !== 'pier').map(([, sp]) => `<path d="M${sp.door[0]} ${sp.door[1]}V${sp.door[1] >= 600 ? ROAD_BOTTOM : sp.door[1] <= ROAD_TOP ? ROAD_TOP : sp.door[1]}" stroke="${road}" stroke-width="22" stroke-linecap="round"/>`).join('')}
    ${tree(300, 500, 1.1, n)}${tree(860, 500, 1, n)}${tree(400, 470, 0.9, n, '#5aa86a')}${tree(800, 470, 1.1, n)}${palm(1150, 520, 0.9)}${palm(40, 520, 0.8)}
    ${[[330, 620], [880, 620]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-26" y="-10" width="52" height="8" rx="3" fill="#b8895a"/><rect x="-22" y="-2" width="4" height="12" fill="#8a5a2b"/><rect x="18" y="-2" width="4" height="12" fill="#8a5a2b"/></g>`).join('')}
    ${n ? '' : '<g fill="#fff" opacity=".9"><ellipse cx="200" cy="40" rx="50" ry="14"/><ellipse cx="1000" cy="30" rx="40" ry="12"/></g>'}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// 展示區外觀：圍欄裡的小棲地、招牌植物、代表動物
const sign = (txtIcon, c) => `<g transform="translate(12 8)"><rect width="58" height="40" rx="10" fill="${c}" stroke="#fff" stroke-width="3"/>${txtIcon}</g>`;
const mini = (id, x, y, s, baby = false) => `<g transform="translate(${x} ${y}) scale(${s})">${baby ? BABIES[id]() : ANIMALS[id].svg()}</g>`;
export function areaExt(area, ph) {
  const A = AREAS[area];
  const n = night(ph);
  const fence = `<path d="M8 150H232" stroke="#a8743a" stroke-width="6"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${12 + i * 19}" y="126" width="6" height="30" rx="2" fill="#c98a4a"/>`).join('')}<path d="M8 136H232" stroke="#a8743a" stroke-width="4"/>`;
  const habitat = `<rect x="6" y="20" width="228" height="140" rx="26" fill="${n ? '#4a6a52' : A.ground}"/><ellipse cx="120" cy="140" rx="110" ry="22" fill="${n ? '#3f5a46' : A.ground2}"/>`;
  const body = {
    kids: `${habitat}<path d="M150 70L190 44L230 70V130H150Z" fill="#e5484d"/><path d="M150 70L190 44L230 70" fill="none" stroke="#fff" stroke-width="4"/><rect x="176" y="96" width="28" height="34" fill="#a8322f"/>${mini('llama', 10, 30, 0.55)}${mini('rabbit', 100, 70, 0.4)}${fence}`,
    taiwan: `${habitat}${tree(40, 90, 1.2, n, '#3f8a4f')}${tree(206, 84, 1.1, n, '#2e7a40')}${mini('bear', 62, 38, 0.52)}${mini('leopardcat', 150, 76, 0.38)}${fence}`,
    rain: `${habitat}${palm(30, 132, 1)}${palm(214, 128, 0.9)}<path d="M60 20Q70 70 64 110M180 20Q172 60 178 96" stroke="#3f8a4f" stroke-width="4" fill="none"/>${mini('elephant', 46, 36, 0.62)}${fence}`,
    africa: `${habitat}<g transform="translate(196 74)"><path d="M0 60V10" stroke="#8a5a2b" stroke-width="7"/><ellipse cy="6" rx="40" ry="10" fill="${n ? '#2f5a3a' : '#6aa84a'}"/></g>${mini('giraffe', 40, -22, 0.78)}${mini('zebra', 110, 64, 0.42)}${fence}`,
    desert: `${habitat}<path d="M20 150Q80 96 150 150Z" fill="${n ? '#6a5a42' : '#e6c47e'}"/><g transform="translate(196 132)"><rect x="-6" y="-48" width="12" height="48" rx="6" fill="#4caf50"/><path d="M-6 -30H-18V-44M6 -22H16V-36" stroke="#4caf50" stroke-width="9" fill="none" stroke-linecap="round"/></g>${mini('camel', 18, 28, 0.6)}${mini('meerkat', 128, 60, 0.45)}${fence}`,
    aus: `${habitat}<g transform="translate(200 60)"><path d="M0 90V0" stroke="#d8d0c0" stroke-width="10"/><g fill="#7cbf8a">${[[-20, 0], [18, -6], [-8, -18], [22, 18]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="16" transform="rotate(${x} ${x} ${y})"/>`).join('')}</g></g>${mini('kangaroo', 30, 30, 0.6)}${mini('koala', 140, 10, 0.4)}${fence}`,
    penguin: `<rect x="8" y="40" width="224" height="120" rx="14" fill="${n ? '#5a7a9a' : '#bfe3f6'}"/><path d="M8 52Q120 -10 232 52Z" fill="${n ? '#6a8aaa' : '#e6f6ff'}" stroke="#8ac6e6" stroke-width="4"/><rect x="30" y="66" width="180" height="78" rx="10" fill="#3fa0d8"/><path d="M30 104Q80 96 120 104T210 104V144H30Z" fill="#2f86c0"/>${mini('penguin', 44, 46, 0.48)}${mini('penguin', 120, 52, 0.42)}<rect x="30" y="66" width="180" height="78" rx="10" fill="none" stroke="#fff" stroke-width="5"/>`,
    panda: `<rect x="8" y="40" width="224" height="120" rx="14" fill="${n ? '#5a7a5a' : '#e8f6dc'}"/><path d="M8 52Q120 -10 232 52Z" fill="${n ? '#4a6a4a' : '#7cc06a'}" stroke="#4a9a3a" stroke-width="4"/>${[22, 40, 196, 214].map((x) => `<path d="M${x} 150V60" stroke="#6cbf4a" stroke-width="7"/><path d="M${x - 6} 90h12M${x - 6} 120h12" stroke="#4a9a34" stroke-width="3"/>`).join('')}<rect x="54" y="66" width="132" height="84" rx="10" fill="${n ? '#5a7a5a' : '#cfeac0'}" stroke="#fff" stroke-width="5"/>${mini('panda', 72, 50, 0.5)}`,
  }[area];
  const head = { kids: 'rabbit', taiwan: 'bear', rain: 'elephant', africa: 'lion', desert: 'camel', aus: 'koala', penguin: 'penguin', panda: 'panda' }[area];
  return `<svg viewBox="0 0 240 170" overflow="visible">${body}${sign(`<g transform="translate(4 -6) scale(.25)">${ANIMALS[head].svg()}</g>`, A.indoor ? '#3a7bd5' : '#4f8a4f')}</svg>`;
}

// 遊園車站（中間）
export function tramExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 180 130" overflow="visible">
    <rect x="10" y="40" width="160" height="10" rx="4" fill="#4f8a4f"/><path d="M4 44L90 6L176 44Z" fill="#6cbf6a" stroke="#4f8a4f" stroke-width="4" stroke-linejoin="round"/>
    <rect x="22" y="50" width="8" height="54" fill="#8a5a2b"/><rect x="150" y="50" width="8" height="54" fill="#8a5a2b"/>
    ${tramSvg(18, 66, 0.62, n)}
    <rect x="0" y="112" width="180" height="10" rx="4" fill="#c9b38a"/>
  </svg>`;
}
// 遊園車（綠色開放式小火車，三節）
export function tramSvg(x = 0, y = 0, s = 1, n = false) {
  const car = (dx, head) => `<g transform="translate(${dx} 0)">
    <rect x="0" y="10" width="${head ? 70 : 64}" height="44" rx="10" fill="#3fae6a"/>
    <rect x="4" y="0" width="${head ? 62 : 56}" height="8" rx="4" fill="#ffd34d"/>
    <path d="M10 8V20M${head ? 58 : 52} 8V20" stroke="#ffd34d" stroke-width="4"/>
    <rect x="6" y="22" width="${head ? 58 : 52}" height="14" rx="4" fill="${n ? '#ffd34d' : '#fff7d6'}"/>
    <circle cx="16" cy="58" r="9" fill="#333"/><circle cx="${head ? 54 : 48}" cy="58" r="9" fill="#333"/>
    ${head ? '<circle cx="66" cy="40" r="5" fill="#fff6a8"/>' : ''}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${car(0)}${car(70)}${car(140, true)}<path d="M64 40H70M134 40H140" stroke="#555" stroke-width="4"/></g>`;
}
// 美食街：冰淇淋車、熱狗攤
export function snackExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 200 150" overflow="visible">
    <g transform="translate(4 30)"><rect y="20" width="90" height="80" rx="10" fill="#ff9fc4"/><path d="M-4 22Q45 -4 94 22Z" fill="#fff"/>${[0, 1, 2, 3].map((i) => `<path d="M${-2 + i * 24} 22q12 14 24 0" fill="${i % 2 ? '#ff9fc4' : '#fff'}"/>`).join('')}
      <rect x="10" y="46" width="70" height="30" rx="6" fill="${n ? '#ffd34d' : '#fff6fb'}"/><g transform="translate(45 22)"><path d="M-10 0L0 24L10 0Z" fill="#e8b46a"/><circle cy="-6" r="10" fill="#fff0c8"/><circle cx="-6" cy="-12" r="8" fill="#ff9fc4"/><circle cx="6" cy="-12" r="8" fill="#8a5a3a"/></g></g>
    <g transform="translate(104 34)"><rect y="20" width="92" height="76" rx="10" fill="#ffd34d"/><path d="M-4 22Q46 -4 96 22Z" fill="#e5484d"/>
      <rect x="10" y="44" width="72" height="30" rx="6" fill="${n ? '#ffe680' : '#fff6d6'}"/><g transform="translate(46 30)"><rect x="-24" y="-6" width="48" height="14" rx="7" fill="#e8b46a"/><rect x="-20" y="-4" width="40" height="8" rx="4" fill="#c4553a"/><path d="M-16 0q4 -4 8 0t8 0t8 0t8 0" stroke="#ffd34d" stroke-width="2" fill="none"/></g></g>
    <g transform="translate(160 118)"><rect x="-10" y="-22" width="20" height="26" rx="4" fill="#3a7bd5"/><path d="M-4 -12l4 -6l4 6M-5 -8l5 6l5 -6" stroke="#fff" stroke-width="2" fill="none"/></g>
  </svg>`;
}
// 紀念品店：櫥窗裡的動物娃娃
export function giftExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 200 150" overflow="visible">
    <rect x="10" y="40" width="180" height="104" rx="8" fill="#fff1d6"/>
    <path d="M4 44Q100 0 196 44Z" fill="#8a6fd0"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${6 + i * 27} 44q13 16 27 0" fill="${i % 2 ? '#8a6fd0' : '#fff'}"/>`).join('')}
    <rect x="20" y="66" width="104" height="66" rx="6" fill="${n ? '#ffe08a' : '#e6f4ff'}" stroke="#8a6fd0" stroke-width="4"/>
    ${mini('panda', 18, 70, 0.26)}${mini('koala', 56, 72, 0.24)}${mini('penguin', 88, 74, 0.24)}
    <rect x="134" y="70" width="44" height="74" rx="6" fill="#6a4fb0"/><circle cx="168" cy="108" r="3" fill="#ffd34d"/>
    <g transform="translate(100 18)"><circle r="16" fill="#fff" stroke="#8a6fd0" stroke-width="3"/><path d="M-8 -2Q0 -12 8 -2Q8 8 0 12Q-8 8 -8 -2Z" fill="#ff7fa8"/></g>
  </svg>`;
}
// 碼頭：木棧道、郵輪（郊區那邊和島上這邊共用）
export function pierExt(ph, { closed = false, side = 'suburb' } = {}) {
  const n = night(ph);
  return `<svg viewBox="0 0 260 230" overflow="visible">
    ${side === 'suburb' ? `<path d="M14 66Q130 28 250 62Q266 150 246 222Q130 238 22 224Q2 150 14 66Z" fill="${n ? '#24466a' : '#6fc3ec'}"/><path d="M10 76q20 -8 40 0t40 0M150 90q20 -8 40 0t40 0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>` : ''}
    <rect x="${side === 'suburb' ? 20 : 30}" y="${side === 'suburb' ? 150 : 40}" width="${side === 'suburb' ? 120 : 160}" height="26" fill="#b8895a"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${(side === 'suburb' ? 24 : 34) + i * 22}" y="${side === 'suburb' ? 172 : 62}" width="8" height="30" fill="#8a5a2b"/>`).join('')}
    ${shipSvg(side === 'suburb' ? 96 : 40, side === 'suburb' ? 62 : -40, side === 'suburb' ? 0.62 : 0.5, n)}
    ${closed ? '<g transform="translate(40 110)"><rect width="56" height="40" rx="8" fill="#fff" stroke="#e5484d" stroke-width="5"/><path d="M14 10L42 30M42 10L14 30" stroke="#e5484d" stroke-width="6" stroke-linecap="round"/></g>' : ''}
  </svg>`;
}
// 郵輪（側面，船頭向右）
export function shipSvg(x = 0, y = 0, s = 1, n = false) {
  const win = n ? '#ffd34d' : '#bfe6fb';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 120H250L226 170H24Z" fill="#2f6fb0"/><path d="M6 132H244" stroke="#fff" stroke-width="6"/>
    <rect x="30" y="76" width="180" height="46" rx="8" fill="#fff"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${50 + i * 28}" cy="99" r="8" fill="${win}" stroke="#9ab8d0" stroke-width="2"/>`).join('')}
    <rect x="70" y="40" width="110" height="40" rx="8" fill="#f4f6fa"/>${[0, 1, 2].map((i) => `<rect x="${82 + i * 32}" y="50" width="22" height="16" rx="4" fill="${win}"/>`).join('')}
    <rect x="120" y="8" width="26" height="36" rx="4" fill="#e5484d"/><rect x="120" y="14" width="26" height="6" fill="#fff"/>
    <path d="M60 76V30" stroke="#888" stroke-width="3"/><path d="M60 30L84 38L60 46Z" fill="#ffd34d"/>
    <circle cx="214" cy="100" r="10" fill="#fff" stroke="#e5484d" stroke-width="5"/>
  </g>`;
}
export const MAP_SHIP = `<svg viewBox="0 0 250 170">${shipSvg(0, 0, 1)}</svg>`;
// 選區卡片
export const ISLAND_CARD = `<svg viewBox="0 0 200 160"><rect width="200" height="160" rx="20" fill="#cfefff"/><path d="M20 116Q100 60 180 116Z" fill="#a7dc8a"/><path d="M0 120H200V160H0Z" fill="#5fc0ec"/>
  <g transform="translate(64 34) scale(.36)">${ANIMALS.panda.svg()}</g><g transform="translate(118 50) scale(.26)">${ANIMALS.giraffe.svg()}</g></svg>`;

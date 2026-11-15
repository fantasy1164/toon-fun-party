// 城鎮地圖：一個畫面看完全部。家在中間，近的地方走路去，遠的（農場、遊樂園）坐噗噗的車去。舞台 1200x900。
import { weatherLayer, skyColors } from './bathroom.js';
import { characterSvg } from './characters.js';

// 每個地方的位置 [x, y, w, h]（舞台座標），門口（走到哪裡）、怎麼去
export const MAP_SPOTS = {
  farm: { box: [96, 150, 190, 182], door: [190, 330], far: true },
  amuse: { box: [800, 40, 380, 310], door: [990, 352], far: true },
  school: { box: [40, 360, 250, 203], door: [165, 562] },
  home: { box: [440, 250, 320, 320], door: [600, 566] },
  car: { box: [800, 450, 140, 118], door: [870, 568] },
  park: { box: [240, 752, 270, 148], door: [375, 752] },
  clinic: { box: [600, 752, 118, 144], door: [659, 754] },
  theater: { box: [760, 742, 112, 158], door: [816, 748] },
  market: { box: [920, 756, 122, 144], door: [981, 758] },
};
export const ROAD_Y = 720;
const WALK_Y = ROAD_Y - 40;   // 人行道
// 從家門口走到各地方的路線（舞台座標的點）：沿著人行道走，在斑馬線過馬路
export function walkPath(dest) {
  const d = MAP_SPOTS[dest].door;
  const start = [MAP_SPOTS.home.door[0], MAP_SPOTS.home.door[1] + 8];
  if (dest === 'car') return [start, [600, 600], [870, 600], d];
  if (dest === 'school') return [start, [600, WALK_Y], [326, WALK_Y], [326, 600], [165, 600], d];
  return [start, [600, WALK_Y], [d[0], WALK_Y], d];
}
// 斑馬線的位置
export const CROSSWALKS = ['park', 'clinic', 'theater', 'market'].map((k) => MAP_SPOTS[k].door[0]);
// 坐車去遠的地方的路線（車子的中心點）
export function drivePath(dest) {
  if (dest === 'farm') return [[870, 600], [870, ROAD_Y], [326, ROAD_Y], [326, 360], [230, 345]];
  return [[870, 600], [870, ROAD_Y], [1150, ROAD_Y], [1150, 380], [1040, 362]];
}

export function mapBack(ph, wx, { december = false } = {}) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night' || ph === 'dusk';
  const g1 = night ? '#3f6a4a' : grey ? '#9cc08a' : '#b4e39a';
  const g2 = night ? '#36603f' : grey ? '#8fb27f' : '#9ed882';
  const road = night ? '#4a4f62' : '#8d939e';
  const roadFar = night ? '#555a6c' : '#a2a8b2';
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="26" fill="#8a5a2b"/><circle cy="-8" r="22" fill="${night ? '#2f5a3a' : '#4caf50'}"/><circle cx="-12" cy="2" r="14" fill="${night ? '#2a5234' : '#43a047'}"/></g>`;
  const lamp = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-3" y="-60" width="6" height="60" fill="#5a5f6a"/><circle cy="-64" r="9" fill="${night ? '#ffe680' : '#e8eef4'}"/>${night ? '<circle cy="-64" r="26" fill="#ffe680" opacity=".25"/>' : ''}</g>`;
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#msky)"/>
    ${night ? [[160, 50], [300, 100], [480, 40], [700, 26], [760, 90]].map(([x, y], i) => `<circle class="tw" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')
      + `<circle cx="620" cy="70" r="34" fill="#fff6c8"/><circle cx="634" cy="60" r="30" fill="${a}"/>`
      : (wx.kind === 'clear' || wx.kind === 'cloudy' ? '<circle cx="620" cy="76" r="42" fill="#ffd34d"/>' : '')}
    ${!night && wx.kind !== 'rain' && wx.kind !== 'storm' ? '<g fill="#fff" opacity=".9" class="clouds"><ellipse cx="220" cy="70" rx="60" ry="20"/><ellipse cx="256" cy="58" rx="38" ry="22"/><ellipse cx="460" cy="110" rx="46" ry="16"/></g>' : ''}
    <!-- 遠山與草地 -->
    <path d="M0 240Q180 150 380 220Q560 140 760 210Q960 150 1200 230V900H0Z" fill="${g1}"/>
    <path d="M0 380Q300 330 600 360Q900 330 1200 370V900H0Z" fill="${g2}"/>
    <!-- 往遠方的小路（農場、遊樂園） -->
    <path d="M326 ${ROAD_Y}V368Q326 350 300 346L232 336" stroke="${roadFar}" stroke-width="26" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M1150 ${ROAD_Y}V392Q1150 372 1124 368L1000 356" stroke="${roadFar}" stroke-width="26" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- 學堂、車庫的小路 -->
    <path d="M326 600H165V560" stroke="#e8d2a8" stroke-width="22" fill="none" stroke-linejoin="round"/>
    <path d="M600 600H870V566" stroke="#e8d2a8" stroke-width="22" fill="none" stroke-linejoin="round"/>
    <!-- 家門口到人行道 -->
    <path d="M600 566V${ROAD_Y - 30}" stroke="#e8d2a8" stroke-width="30"/>
    <!-- 大馬路 -->
    <rect x="0" y="${ROAD_Y - 26}" width="1200" height="52" fill="${road}"/>
    <path d="M0 ${ROAD_Y}H1200" stroke="#ffd34d" stroke-width="4" stroke-dasharray="26 22"/>
    <rect x="0" y="${ROAD_Y - 32}" width="1200" height="6" fill="#d8d2c4"/><rect x="0" y="${ROAD_Y + 26}" width="1200" height="6" fill="#d8d2c4"/>
    <!-- 斑馬線：過馬路走斑馬線 -->
    ${CROSSWALKS.map((x) => `<g fill="#fff">${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - 34 + i * 15}" y="${ROAD_Y - 24}" width="8" height="48"/>`).join('')}</g>`).join('')}
    <!-- 樹、路燈 -->
    ${tree(390, 300, 0.8)}${tree(36, 640, 1)}${tree(556, 872, 0.9)}${tree(1110, 862, 1)}${tree(780, 360, 0.7)}${tree(160, 860, 1)}
    ${lamp(470, ROAD_Y - 34)}${lamp(740, ROAD_Y - 34)}${lamp(1080, ROAD_Y - 34)}
    ${december ? [[600, 240], [180, 330], [990, 340]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 1, 2, 3, 4].map((i) => `<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${(i - 2) * 22}" cy="${Math.abs(i - 2) * 4}" r="6" fill="${['#ffd34d', '#ff6b5c', '#5fc3e8', '#7be0a0'][i % 4]}"/>`).join('')}</g>`).join('') : ''}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// 地圖上的家（小房子，屋頂的圓窗放選好的頭像）
export function homeMini(ph, { newyear = false } = {}) {
  const night = ph === 'night' || ph === 'dusk';
  const win = night ? '#ffd34d' : '#bfe6fb';
  return `<svg viewBox="0 0 320 320">
    <rect x="214" y="40" width="34" height="70" fill="#c9562f"/><rect x="206" y="32" width="50" height="14" rx="5" fill="#a8422a"/>
    <path d="M20 140L160 30L300 140Z" fill="#e5734f"/><path d="M20 140L160 30L300 140" fill="none" stroke="#c9562f" stroke-width="12" stroke-linejoin="round"/>
    <rect x="44" y="134" width="232" height="176" fill="#fff4e0"/>
    <rect x="44" y="216" width="232" height="8" fill="#c8915a"/>
    ${[[70, 152], [190, 152], [70, 236]].map(([x, y]) => `<rect x="${x}" y="${y}" width="60" height="48" rx="6" fill="${win}" stroke="#fff" stroke-width="5"/>`).join('')}
    <rect x="196" y="234" width="56" height="76" rx="6" fill="#d9663f"/><circle cx="242" cy="274" r="5" fill="#ffd34d"/>
    ${newyear ? '<rect x="206" y="244" width="36" height="36" fill="#d6262b" transform="rotate(45 224 262)"/><text x="224" y="272" text-anchor="middle" font-size="26" fill="#ffcf40" transform="rotate(180 224 263)">福</text>' : ''}
    <rect x="36" y="306" width="248" height="10" rx="4" fill="#b9824f"/>
  </svg>`;
}

// 遊樂園外觀：摩天輪、雲霄飛車、大門。沒開的日子大門關著、燈不亮
export function amuseExt(ph, open) {
  const night = ph === 'night' || ph === 'dusk';
  const cabin = ['#e5484d', '#ffc400', '#3fbf7f', '#5fa8e8', '#ff8fb0', '#9b85f0', '#ff9f43', '#3fc1c9'];
  const R = 104;
  return `<svg viewBox="0 0 380 310" overflow="visible">
    <path d="M196 230Q214 60 250 110Q280 160 300 90Q320 40 350 120L370 230" fill="none" stroke="#e5484d" stroke-width="7"/>
    ${[214, 250, 300, 340].map((x) => `<path d="M${x} 230V${x === 250 ? 120 : x === 300 ? 100 : 140}" stroke="#c9c2b4" stroke-width="4"/>`).join('')}
    <g class="am-wheel-mini" style="transform-origin:120px 122px">
      <circle cx="120" cy="122" r="${R}" fill="none" stroke="#5fa8e8" stroke-width="6"/>
      ${cabin.map((c, i) => { const r = (i * 45 * Math.PI) / 180; const x = 120 + R * Math.cos(r); const y = 122 + R * Math.sin(r); return `<path d="M120 122L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#5fa8e8" stroke-width="3"/><rect x="${(x - 12).toFixed(1)}" y="${(y - 9).toFixed(1)}" width="24" height="20" rx="5" fill="${c}"/>`; }).join('')}
    </g>
    <path d="M120 122L70 260M120 122L170 260" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/><circle cx="120" cy="122" r="12" fill="#ffd34d"/>
    <rect x="96" y="232" width="200" height="76" fill="${open ? '#ff8fb0' : '#c9a7b4'}"/>
    <path d="M86 236Q196 186 306 236" fill="none" stroke="${open ? '#ffd34d' : '#a89a8a'}" stroke-width="14" stroke-linecap="round"/>
    ${open && night ? [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${108 + i * 30}" cy="${222 - Math.sin((i / 6) * Math.PI) * 26}" r="6" fill="#fff6a8"/>`).join('') : ''}
    <rect x="160" y="250" width="72" height="58" fill="${open ? '#7a2a4a' : '#6a6a72'}"/>
    ${open ? '<path d="M164 250V308M228 250V308" stroke="#ffd34d" stroke-width="4"/>' : [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${164 + i * 12}" y="252" width="5" height="56" fill="#9aa0aa"/>`).join('')}
    ${open ? '' : '<g transform="translate(232 262)"><rect x="-6" y="-4" width="40" height="30" rx="5" fill="#fff" stroke="#e5484d" stroke-width="4"/><path d="M4 2L24 22M24 2L4 22" stroke="#e5484d" stroke-width="5" stroke-linecap="round"/></g>'}
    ${open ? characterSvg('gaogao', { x: 252, y: 188, s: 0.38 }) : ''}
  </svg>`;
}

// 地圖上走路的小孩、坐車用的車子
export const MAP_CAR = `<svg viewBox="0 0 120 80"><path d="M10 60V44Q14 28 34 26L48 12H84L98 26Q112 30 112 46V60Z" fill="#ff6b5c"/><path d="M52 26L58 18H82L90 26Z" fill="#d6f4ff"/><circle cx="34" cy="62" r="12" fill="#333"/><circle cx="90" cy="62" r="12" fill="#333"/><circle cx="34" cy="62" r="4" fill="#ddd"/><circle cx="90" cy="62" r="4" fill="#ddd"/></svg>`;

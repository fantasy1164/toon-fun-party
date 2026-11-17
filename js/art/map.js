// 三張地圖：生活區（家、學堂、圖書館、公園、診所、牙科、劇場、超市、消防局、火車站）、郊區（農場、遊樂園、海邊）、山區（登山步道）。
// 生活區近的地方走路、遠的坐公車；跨區坐火車；郊區坐噗噗的車；山區從車站走到步道口。舞台 1200x900。
import { weatherLayer, skyColors } from './bathroom.js';
import { characterSvg } from './characters.js';
import { ISLAND, ISLAND_START, islandPath } from './island.js';

export const ROAD_Y = 720;
const WALK_Y = ROAD_Y - 40;   // 人行道
export const BUS_STOP = [700, 690];

// 每個地方：box 位置 [x, y, w, h]、門口、怎麼去（walk 走路、bus 公車、car 噗噗的車）
export const ZONES = {
  city: {
    home: { box: [440, 250, 320, 320], door: [600, 566] },
    car: { box: [800, 450, 140, 118], door: [870, 568], by: 'walk' },
    station: { box: [20, 96, 320, 190], door: [190, 290], by: 'walk' },
    school: { box: [24, 344, 230, 186], door: [140, 530], by: 'walk' },
    library: { box: [270, 404, 140, 125], door: [340, 530], by: 'walk' },
    park: { box: [240, 752, 270, 148], door: [375, 752], by: 'walk' },
    clinic: { box: [586, 752, 118, 144], door: [645, 754], by: 'walk' },
    dental: { box: [708, 772, 90, 126], door: [753, 774], by: 'walk' },
    theater: { box: [820, 742, 112, 158], door: [876, 748], by: 'bus' },
    market: { box: [948, 756, 122, 144], door: [1009, 758], by: 'bus' },
    fire: { box: [850, 60, 320, 256], door: [1010, 318], by: 'bus' },
  },
  suburb: {
    station: { box: [450, 650, 300, 178], door: [600, 650] },
    farm: { box: [60, 230, 300, 288], door: [210, 520], by: 'car' },
    amuse: { box: [760, 60, 400, 326], door: [960, 388], by: 'car' },
    beach: { box: [40, 600, 340, 210], door: [210, 612], by: 'car' },
    // 碼頭（11/17）：坐郵輪去歡樂島
    pier: { box: [935, 556, 260, 230], door: [1010, 712], by: 'walk' },
  },
  mountain: {
    station: { box: [450, 650, 300, 178], door: [600, 650] },
    trail: { box: [120, 150, 400, 330], door: [330, 480], by: 'walk' },
  },
  // 歡樂島（11/17）：整座島是動物園
  island: ISLAND,
};
// 小孩出發的地方：生活區是家門口，郊區、山區是車站旁邊的月台
export const ZONE_START = { city: [600, 566], suburb: [800, 790], mountain: [800, 790], island: ISLAND_START };

// 走路的路線（生活區從家門口出發；其他區從車站出發）
export function walkPath(zone, dest) {
  const Z = ZONES[zone];
  const d = Z[dest].door;
  if (zone === 'mountain') return [ZONE_START.mountain, [800, 560], [330, 560], d];
  if (zone === 'island') return islandPath(dest);
  if (zone === 'suburb') return [ZONE_START.suburb, [d[0], 790], d];
  const start = [Z.home.door[0], Z.home.door[1] + 8];
  if (dest === 'car') return [start, [600, 600], [870, 600], d];
  if (dest === 'station') return [start, [600, WALK_Y], [440, WALK_Y], [440, 600], [440, 330], [190, 330], d];
  if (dest === 'school') return [start, [600, WALK_Y], [440, WALK_Y], [440, 600], [140, 600], d];
  if (dest === 'library') return [start, [600, WALK_Y], [440, WALK_Y], [440, 600], [340, 600], d];
  return [start, [600, WALK_Y], [d[0], WALK_Y], d];
}
// 斑馬線（生活區）
export const CROSSWALKS = ['park', 'clinic', 'dental'].map((k) => ZONES.city[k].door[0]);
// 公車（從公車站牌出發）、噗噗的車（郊區從車站出發）的路線
export function ridePath(zone, dest) {
  if (zone === 'city') {
    const d = ZONES.city[dest].door;
    if (dest === 'fire') return [[BUS_STOP[0], ROAD_Y], [1160, ROAD_Y], [1160, 350], [d[0], 340]];
    return [[BUS_STOP[0], ROAD_Y], [d[0], ROAD_Y], [d[0], d[1] - 6]];
  }
  const d = ZONES.suburb[dest].door;
  if (dest === 'farm') return [[800, 760], [800, 560], [210, 560], d];
  if (dest === 'beach') return [[800, 760], [800, 560], [420, 560], [420, 640], [d[0] + 60, 640]];
  return [[800, 760], [800, 560], [960, 560], [960, 410]];
}

const night = (ph) => ph === 'night' || ph === 'dusk';
function skyAnd(ph, wx, id) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const n = night(ph);
  return {
    grey, n,
    sky: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="1200" height="900" fill="url(#${id})"/>
      ${n ? [[160, 50], [300, 100], [480, 40], [700, 26], [760, 90]].map(([x, y], i) => `<circle class="tw" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')
        + `<circle cx="620" cy="70" r="34" fill="#fff6c8"/><circle cx="634" cy="60" r="30" fill="${a}"/>`
        : (wx.kind === 'clear' || wx.kind === 'cloudy' ? '<circle cx="620" cy="76" r="42" fill="#ffd34d"/>' : '')}
      ${!n && wx.kind !== 'rain' && wx.kind !== 'storm' ? '<g fill="#fff" opacity=".9"><ellipse cx="420" cy="70" rx="60" ry="20"/><ellipse cx="456" cy="58" rx="38" ry="22"/><ellipse cx="760" cy="120" rx="46" ry="16"/></g>' : ''}`,
  };
}
const tree = (x, y, s = 1, n = false) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="26" fill="#8a5a2b"/><circle cy="-8" r="22" fill="${n ? '#2f5a3a' : '#4caf50'}"/><circle cx="-12" cy="2" r="14" fill="${n ? '#2a5234' : '#43a047'}"/></g>`;
const lamp = (x, y, n) => `<g transform="translate(${x} ${y})"><rect x="-3" y="-60" width="6" height="60" fill="#5a5f6a"/><circle cy="-64" r="9" fill="${n ? '#ffe680' : '#e8eef4'}"/>${n ? '<circle cy="-64" r="26" fill="#ffe680" opacity=".25"/>' : ''}</g>`;
const rails = (pts, n) => `<path d="${pts}" stroke="${n ? '#5a4a3a' : '#8a6a4a'}" stroke-width="22" fill="none" stroke-dasharray="4 10"/><path d="${pts}" stroke="#9aa0aa" stroke-width="14" fill="none"/><path d="${pts}" stroke="${n ? '#3f6a4a' : '#b4e39a'}" stroke-width="8" fill="none"/>`;

// ---------- 生活區 ----------
export function mapBack(ph, wx, { december = false } = {}) {
  const { grey, n, sky } = skyAnd(ph, wx, 'msky');
  const g1 = n ? '#3f6a4a' : grey ? '#9cc08a' : '#b4e39a';
  const g2 = n ? '#36603f' : grey ? '#8fb27f' : '#9ed882';
  const road = n ? '#4a4f62' : '#8d939e';
  return `<svg viewBox="0 0 1200 900">${sky}
    <path d="M0 240Q180 150 380 220Q560 140 760 210Q960 150 1200 230V900H0Z" fill="${g1}"/>
    <path d="M0 380Q300 330 600 360Q900 330 1200 370V900H0Z" fill="${g2}"/>
    ${rails('M-20 300H360', n)}
    <!-- 往消防局的路（公車開上去） -->
    <path d="M1160 ${ROAD_Y}V362Q1160 340 1136 340L1010 336" stroke="${road}" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- 小路：火車站、學堂、圖書館、車庫 -->
    <path d="M440 ${WALK_Y}V330H190V300M440 600H140V530M340 600V530" stroke="#e8d2a8" stroke-width="22" fill="none" stroke-linejoin="round"/>
    <path d="M600 600H870V566" stroke="#e8d2a8" stroke-width="22" fill="none" stroke-linejoin="round"/>
    <path d="M600 566V${ROAD_Y - 30}" stroke="#e8d2a8" stroke-width="30"/>
    <rect x="0" y="${ROAD_Y - 26}" width="1200" height="52" fill="${road}"/>
    <path d="M0 ${ROAD_Y}H1200" stroke="#ffd34d" stroke-width="4" stroke-dasharray="26 22"/>
    <rect x="0" y="${ROAD_Y - 32}" width="1200" height="6" fill="#d8d2c4"/><rect x="0" y="${ROAD_Y + 26}" width="1200" height="6" fill="#d8d2c4"/>
    ${CROSSWALKS.map((x) => `<g fill="#fff">${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - 34 + i * 15}" y="${ROAD_Y - 24}" width="8" height="48"/>`).join('')}</g>`).join('')}
    <!-- 公車站牌 -->
    <g transform="translate(${BUS_STOP[0]} ${BUS_STOP[1] - 6})"><rect x="-3" y="-70" width="6" height="70" fill="#5a5f6a"/><rect x="-26" y="-100" width="52" height="36" rx="8" fill="#3a7bd5"/><rect x="-18" y="-92" width="36" height="16" rx="4" fill="#fff"/><rect x="-14" y="-90" width="28" height="12" rx="3" fill="#3a7bd5"/><circle cx="-8" cy="-74" r="3" fill="#fff"/><circle cx="8" cy="-74" r="3" fill="#fff"/></g>
    ${tree(400, 300, 0.8, n)}${tree(556, 872, 0.9, n)}${tree(1110, 862, 1, n)}${tree(780, 360, 0.7, n)}${tree(160, 860, 1, n)}${tree(36, 640, 1, n)}
    ${lamp(470, ROAD_Y - 34, n)}${lamp(1080, ROAD_Y - 34, n)}
    ${december ? [[600, 240], [180, 340], [1010, 330]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 1, 2, 3, 4].map((i) => `<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${(i - 2) * 22}" cy="${Math.abs(i - 2) * 4}" r="6" fill="${['#ffd34d', '#ff6b5c', '#5fc3e8', '#7be0a0'][i % 4]}"/>`).join('')}</g>`).join('') : ''}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// ---------- 郊區 ----------
export function suburbBack(ph, wx) {
  const { grey, n, sky } = skyAnd(ph, wx, 'ssky');
  const g1 = n ? '#3f6a4a' : grey ? '#a8c890' : '#c4eaa0';
  const road = n ? '#6a5f52' : '#d8c09a';
  return `<svg viewBox="0 0 1200 900">${sky}
    <path d="M0 260Q200 180 420 240Q640 170 860 230Q1040 190 1200 240V900H0Z" fill="${g1}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 220 - 60} 900Q${i * 220 + 40} 600 ${i * 220 + 160} 420" stroke="${n ? '#3a6446' : '#b2dc8c'}" stroke-width="40" fill="none" opacity=".5"/>`).join('')}
    <!-- 海 -->
    <path d="M0 640Q200 600 400 640V900H0Z" fill="${n ? '#24466a' : '#6fc3ec'}"/><path d="M0 660Q200 620 400 660" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>
    <!-- 海灣：碼頭在岸邊，郵輪往右開出海 -->
    <path d="M1200 492Q1100 496 1056 566Q1022 626 1040 690Q1056 760 1022 832H1200Z" fill="${n ? '#e0c890' : '#f3dc9c'}" transform="translate(-14 0)"/>
    <path d="M1200 500Q1104 504 1062 570Q1030 628 1046 690Q1062 760 1030 832H1200Z" fill="${n ? '#24466a' : '#6fc3ec'}"/>
    <path d="M1090 560q18 -8 36 0t36 0M1110 780q18 -8 36 0t36 0M1150 640q14 -6 28 0" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>
    <path d="M800 790H1010V716M800 790V560H210V520M800 560H960V400M420 560V640" stroke="${road}" stroke-width="30" fill="none" stroke-linejoin="round"/>
    ${rails('M-20 840H1220', n)}
    ${tree(420, 330, 1, n)}${tree(700, 300, 0.8, n)}${tree(880, 470, 1, n)}${tree(820, 760, 1, n)}${tree(960, 520, 0.9, n)}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// ---------- 山區 ----------
export function mountainBack(ph, wx) {
  const { grey, n, sky } = skyAnd(ph, wx, 'tsky');
  const far = n ? '#3c4f66' : grey ? '#8fa0b4' : '#9fb8d8';
  const mid = n ? '#2f5a3a' : grey ? '#7fa070' : '#6fbf73';
  const near = n ? '#36603f' : grey ? '#9cc08a' : '#a7dc8a';
  const pine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="20" fill="#7a4a22"/><path d="M0 -60L26 0H-26Z" fill="${n ? '#24502e' : '#2e8b4f'}"/><path d="M0 -84L20 -34H-20Z" fill="${n ? '#2a5a34' : '#38a05a'}"/></g>`;
  return `<svg viewBox="0 0 1200 900">${sky}
    <path d="M0 360L180 150L320 260L480 90L640 270L820 120L980 250L1200 140V900H0Z" fill="${far}"/>
    <path d="M480 90L530 150L500 160L470 140L440 160Z M820 120L860 170L830 176L810 160L790 172Z" fill="#fff" opacity="${n ? 0.6 : 0.95}"/>
    <path d="M0 470Q260 330 520 430Q800 320 1200 440V900H0Z" fill="${mid}"/>
    <path d="M0 600Q300 520 600 570Q900 520 1200 600V900H0Z" fill="${near}"/>
    <!-- 露營區、果園（裝飾） -->
    <g transform="translate(820 440)"><path d="M0 80L60 0L120 80Z" fill="#ff9f43"/><path d="M60 0V80" stroke="#c9771f" stroke-width="4"/><path d="M140 80L190 14L240 80Z" fill="#5fa8e8"/><path d="M190 14V80" stroke="#3a7bd5" stroke-width="4"/>
      <path d="M90 104l12 -18l12 18Z" fill="#ffd34d"/><path d="M84 106h36" stroke="#8a5a2b" stroke-width="5"/></g>
    ${[[880, 640], [960, 660], [1040, 640], [1120, 660]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-4" y="0" width="8" height="24" fill="#8a5a2b"/><circle cy="-10" r="22" fill="${n ? '#2f5a3a' : '#4caf50'}"/><circle cx="-8" cy="-14" r="5" fill="#ff6b5c"/><circle cx="8" cy="-4" r="5" fill="#ff6b5c"/><circle cx="2" cy="-20" r="5" fill="#ffc400"/></g>`).join('')}
    <path d="M800 790V560H330V480" stroke="${n ? '#6a5f52' : '#d8c09a'}" stroke-width="26" fill="none" stroke-linejoin="round"/>
    ${rails('M-20 840H1220', n)}
    ${pine(60, 560, 1.2)}${pine(120, 600, 1)}${pine(560, 470, 0.9)}${pine(700, 520, 1.1)}${pine(760, 470, 0.8)}${pine(1170, 520, 1.1)}${pine(80, 760, 1.2)}${pine(330, 740, 1)}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// ---------- 建築外觀 ----------
export function stationExt(ph) {
  const w = night(ph) ? '#ffd34d' : '#d6f4ff';
  return `<svg viewBox="0 0 320 190"><rect x="20" y="70" width="280" height="110" fill="#fff1d6"/><path d="M6 76L160 14L314 76Z" fill="#3a7bd5"/>
    <rect x="128" y="34" width="64" height="40" rx="8" fill="#fff"/><circle cx="160" cy="54" r="15" fill="#fff" stroke="#333" stroke-width="3"/><path d="M160 54V44M160 54L168 58" stroke="#333" stroke-width="3" stroke-linecap="round"/>
    ${[40, 90, 200, 250].map((x) => `<rect x="${x}" y="96" width="34" height="40" rx="5" fill="${w}"/>`).join('')}
    <rect x="134" y="104" width="52" height="76" rx="6" fill="#8a5a2b"/>
    <g transform="translate(22 150)"><rect width="60" height="26" rx="8" fill="#e5484d"/><rect x="6" y="5" width="14" height="10" rx="2" fill="#d6f4ff"/><rect x="26" y="5" width="14" height="10" rx="2" fill="#d6f4ff"/></g>
  </svg>`;
}
// 圖書館（11/17 重畫）：三角山牆＋柱子的老式建築、打開的書招牌、大窗戶裡看得到一排排彩色書背、門口台階
export function libraryExt(ph) {
  const n = night(ph);
  const glass = n ? '#ffe08a' : '#e6f4ff';
  const spines = ['#e5484d', '#3a7bd5', '#ffb300', '#4caf50', '#8a6fd0', '#ff8fa8', '#26a69a'];
  // 窗戶裡的書架：兩層，每層一排彩色書背
  const shelf = (x) => [0, 1].map((r) => {
    const y = 138 + r * 28;
    return `${Array.from({ length: 6 }, (_, i) => `<rect x="${x + 3 + i * 5.3}" y="${y - 20 + (i % 3) * 2}" width="4.4" height="${20 - (i % 3) * 2}" fill="${spines[(i + r * 3 + (x > 100 ? 2 : 0)) % 7]}"/>`).join('')}<rect x="${x}" y="${y}" width="38" height="3" fill="#8a6a4a"/>`;
  }).join('');
  return `<svg viewBox="0 0 280 250">
    <rect x="22" y="86" width="236" height="140" fill="#f4ecdc"/>
    <path d="M8 90L140 20L272 90Z" fill="#b8a2e8"/><path d="M8 90L140 20L272 90Z" fill="none" stroke="#7e64c4" stroke-width="8" stroke-linejoin="round"/>
    <rect x="14" y="86" width="252" height="12" rx="3" fill="#7e64c4"/>
    <g transform="translate(140 62)"><path d="M0 -4Q-16 -14 -34 -10V18Q-16 14 0 24Z" fill="#fff" stroke="#e5484d" stroke-width="4"/><path d="M0 -4Q16 -14 34 -10V18Q16 14 0 24Z" fill="#fff" stroke="#e5484d" stroke-width="4"/><path d="M-26 0H-8M-26 8H-8M8 0H26M8 8H26" stroke="#c9b8ef" stroke-width="3"/></g>
    ${[34, 92, 174, 232].map((x) => `<rect x="${x}" y="100" width="16" height="118" fill="#fffaf0" stroke="#d9cdb4" stroke-width="2"/><rect x="${x - 3}" y="98" width="22" height="6" fill="#e6dcc6"/><rect x="${x - 3}" y="212" width="22" height="6" fill="#e6dcc6"/>`).join('')}
    <rect x="52" y="112" width="38" height="66" rx="4" fill="${glass}"/>${shelf(52)}<rect x="52" y="112" width="38" height="66" rx="4" fill="none" stroke="#7e64c4" stroke-width="4"/>
    <rect x="190" y="112" width="38" height="66" rx="4" fill="${glass}"/>${shelf(190)}<rect x="190" y="112" width="38" height="66" rx="4" fill="none" stroke="#7e64c4" stroke-width="4"/>
    <path d="M114 222V160Q114 134 140 134Q166 134 166 160V222Z" fill="#6a4fb0"/><path d="M140 136V222" stroke="#5a3f9a" stroke-width="3"/><circle cx="132" cy="182" r="3" fill="#ffd34d"/><circle cx="148" cy="182" r="3" fill="#ffd34d"/>
    <rect x="96" y="222" width="88" height="8" fill="#d9cdb4"/><rect x="86" y="230" width="108" height="8" fill="#cfc2a6"/><rect x="76" y="238" width="128" height="8" fill="#c4b698"/>
  </svg>`;
}
// 車庫（11/17 重畫）：跟家一樣的屋頂和牆，捲門拉起一半，看得到噗噗的車頭
export function garageExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 226 190">
    <path d="M6 64L113 10L220 64Z" fill="#e5734f"/><path d="M6 64L113 10L220 64" fill="none" stroke="#c9562f" stroke-width="10" stroke-linejoin="round"/>
    <rect x="18" y="60" width="190" height="130" fill="#fff4e0"/>
    <rect x="34" y="76" width="158" height="114" fill="${n ? '#2e323c' : '#4a4f5a'}"/>
    ${n ? '<rect x="96" y="80" width="34" height="6" rx="3" fill="#ffe680"/>' : ''}
    <g class="carbody">
      <path d="M48 190V150Q52 122 74 118H152Q174 122 178 150V190Z" fill="#ff6b5c"/>
      <path d="M68 146Q74 126 90 126H136Q152 126 158 146Z" fill="#d6f4ff"/>
      <g class="pupu-mini"><ellipse cx="113" cy="140" rx="15" ry="11" fill="#9d8fd0"/><circle cx="107" cy="137" r="2.5" fill="#333"/><circle cx="119" cy="137" r="2.5" fill="#333"/><ellipse cx="113" cy="144" rx="6" ry="3" fill="#7d6fb0"/></g>
      <circle cx="66" cy="164" r="9" fill="#fff6a8" stroke="#e0b800" stroke-width="3"/><circle cx="160" cy="164" r="9" fill="#fff6a8" stroke="#e0b800" stroke-width="3"/>
      <rect x="92" y="160" width="42" height="12" rx="4" fill="#d94a3c"/><rect x="50" y="178" width="126" height="10" rx="4" fill="#c9c9c9"/>
    </g>
    <g fill="#d9dde3" stroke="#b9bfc8" stroke-width="2">${Array.from({ length: 5 }, (_, i) => `<rect x="34" y="${76 + i * 9}" width="158" height="9"/>`).join('')}</g>
    <rect x="98" y="114" width="30" height="5" rx="2" fill="#8d939e"/>
    <rect x="28" y="70" width="170" height="8" rx="3" fill="#c9562f"/>
  </svg>`;
}
export function dentalExt(ph) {
  const w = night(ph) ? '#ffd34d' : '#d6f4ff';
  return `<svg viewBox="0 0 180 252"><rect x="10" y="60" width="160" height="190" fill="#e8f6ff"/><rect x="4" y="48" width="172" height="20" rx="6" fill="#5fc3e8"/>
    <g transform="translate(90 26)"><path d="M-24 -16Q-28 18 -16 30Q-10 34 -6 18Q0 10 6 18Q10 34 16 30Q28 18 24 -16Q12 -24 0 -16Q-12 -24 -24 -16Z" fill="#fff" stroke="#5fc3e8" stroke-width="5"/></g>
    <rect x="30" y="90" width="50" height="44" rx="6" fill="${w}"/><rect x="100" y="90" width="50" height="44" rx="6" fill="${w}"/>
    <rect x="62" y="160" width="56" height="90" rx="6" fill="#3a9bd5"/>
  </svg>`;
}
export function fireExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 320 256"><rect x="20" y="70" width="280" height="180" fill="#e5383b"/><path d="M8 76L160 20L312 76Z" fill="#a8282b"/>
    <rect x="70" y="40" width="180" height="40" rx="8" fill="#fff"/><path d="M160 46l6 11h12l-9 8l3 12l-12 -7l-12 7l3 -12l-9 -8h12z" fill="#e5383b"/>
    <rect x="40" y="120" width="118" height="130" rx="8" fill="${n ? '#3a2a2a' : '#5a4a4a'}"/><rect x="170" y="120" width="118" height="130" rx="8" fill="${n ? '#3a2a2a' : '#5a4a4a'}"/>
    <g transform="translate(50 172)"><rect width="98" height="56" rx="8" fill="#ff4d4f"/><rect x="66" y="8" width="24" height="18" rx="3" fill="#d6f4ff"/><path d="M6 6L60 -4" stroke="#c9d0d6" stroke-width="5"/><circle cx="20" cy="58" r="10" fill="#333"/><circle cx="78" cy="58" r="10" fill="#333"/><rect x="30" y="-6" width="12" height="8" rx="2" fill="#5fc3e8"/></g>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="178" y="${128 + i * 20}" width="102" height="10" fill="${n ? '#4a3a3a' : '#7a6a6a'}"/>`).join('')}
    <rect x="270" y="8" width="20" height="70" fill="#a8282b"/><circle cx="280" cy="10" r="10" fill="${n ? '#ffd34d' : '#ffb84d'}"/>
  </svg>`;
}
export function beachExt(ph, open) {
  return `<svg viewBox="0 0 340 210"><path d="M0 120Q170 70 340 120V210H0Z" fill="#f6dfa4"/>
    <path d="M200 120L210 30" stroke="#8a5a2b" stroke-width="6"/><path d="M150 46Q210 0 270 46Z" fill="${open ? '#ff6b5c' : '#c9a7a0'}"/><path d="M170 46Q210 10 250 46" fill="${open ? '#fff' : '#ddd'}"/>
    <rect x="60" y="128" width="70" height="24" rx="6" fill="${open ? '#5fa8e8' : '#a8b4c0'}"/>
    <g transform="translate(270 150)"><path d="M0 0Q8 -14 16 0Q8 6 0 0Z" fill="#ff8fb0"/><circle cx="8" cy="-4" r="3" fill="#fff"/></g>
    ${open ? '' : '<g transform="translate(40 40)"><rect width="110" height="56" rx="10" fill="#fff" stroke="#5fa8e8" stroke-width="5"/><circle cx="28" cy="28" r="14" fill="#ffd34d"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M28 28L${(28 + Math.cos(i * Math.PI / 4) * 22).toFixed(1)} ${(28 + Math.sin(i * Math.PI / 4) * 22).toFixed(1)}" stroke="#ffd34d" stroke-width="3"/>`).join("")}<path d="M56 28H96" stroke="#5fa8e8" stroke-width="6" stroke-linecap="round"/></g>'}
  </svg>`;
}
export function trailExt(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 400 330"><path d="M0 330L200 40L400 330Z" fill="${n ? '#2f5a3a' : '#5aa86a'}"/><path d="M200 40L230 90L205 96L190 82L170 96Z" fill="#fff" opacity=".9"/>
    <path d="M200 320Q150 260 220 220Q280 180 210 140Q170 110 205 70" stroke="${n ? '#8a7a5a' : '#e8d2a8'}" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="2 18"/>
    <g transform="translate(130 210)"><rect x="0" y="0" width="12" height="110" fill="#8a5a2b"/><rect x="128" y="0" width="12" height="110" fill="#8a5a2b"/><rect x="-10" y="-14" width="160" height="30" rx="6" fill="#a0703a"/>
      <path d="M40 2l14 -10l14 10M76 2l14 -10l14 10" stroke="#fff" stroke-width="5" fill="none"/></g>
    <path d="M196 28V0L222 10L196 20" fill="#ff6b5c"/>
  </svg>`;
}

// 地圖上的交通工具
export const MAP_BUS = `<svg viewBox="0 0 140 80"><rect x="6" y="10" width="128" height="56" rx="12" fill="#3a7bd5"/><rect x="6" y="46" width="128" height="8" fill="#ffd34d"/>${[0, 1, 2, 3].map((i) => `<rect x="${16 + i * 28}" y="18" width="22" height="20" rx="4" fill="#d6f4ff"/>`).join('')}<circle cx="34" cy="68" r="11" fill="#333"/><circle cx="106" cy="68" r="11" fill="#333"/></svg>`;
export const MAP_TRAIN = `<svg viewBox="0 0 220 80"><rect x="4" y="12" width="96" height="52" rx="14" fill="#e5484d"/><rect x="110" y="12" width="104" height="52" rx="8" fill="#e5484d"/>${[0, 1, 2].map((i) => `<rect x="${118 + i * 32}" y="22" width="24" height="18" rx="4" fill="#d6f4ff"/>`).join('')}<rect x="16" y="22" width="34" height="18" rx="4" fill="#d6f4ff"/><rect x="4" y="46" width="210" height="6" fill="#fff"/><circle cx="30" cy="68" r="9" fill="#333"/><circle cx="76" cy="68" r="9" fill="#333"/><circle cx="140" cy="68" r="9" fill="#333"/><circle cx="190" cy="68" r="9" fill="#333"/></svg>`;
// 火車站選要去哪一區的大圖
export const ZONE_CARD = {
  city: `<svg viewBox="0 0 200 160"><rect width="200" height="160" rx="20" fill="#ffe7d6"/><path d="M40 80L100 30L160 80Z" fill="#e5734f"/><rect x="54" y="78" width="92" height="64" fill="#fff4e0"/><rect x="66" y="90" width="24" height="20" fill="#bfe6fb"/><rect x="108" y="100" width="24" height="42" fill="#d9663f"/></svg>`,
  suburb: `<svg viewBox="0 0 200 160"><rect width="200" height="160" rx="20" fill="#e3f6d6"/><circle cx="130" cy="64" r="44" fill="none" stroke="#5fa8e8" stroke-width="6"/>${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${(130 + Math.cos(a * Math.PI / 180) * 44).toFixed(1)}" cy="${(64 + Math.sin(a * Math.PI / 180) * 44).toFixed(1)}" r="7" fill="#ff8fb0"/>`).join('')}<path d="M130 64L110 130M130 64L150 130" stroke="#8a5a2b" stroke-width="6"/><path d="M20 120L56 88L92 120V146H20Z" fill="#d9483b"/></svg>`,
  mountain: `<svg viewBox="0 0 200 160"><rect width="200" height="160" rx="20" fill="#dfefff"/><path d="M10 146L80 40L130 110L150 80L194 146Z" fill="#5aa86a"/><path d="M80 40L98 68L82 72L72 62L62 70Z" fill="#fff"/><path d="M40 146L60 112L80 146Z" fill="#2e8b4f"/><path d="M150 146L166 120L182 146Z" fill="#2e8b4f"/></svg>`,
};

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

export const MAP_CAR = `<svg viewBox="0 0 120 80"><path d="M10 60V44Q14 28 34 26L48 12H84L98 26Q112 30 112 46V60Z" fill="#ff6b5c"/><path d="M52 26L58 18H82L90 26Z" fill="#d6f4ff"/><circle cx="34" cy="62" r="12" fill="#333"/><circle cx="90" cy="62" r="12" fill="#333"/><circle cx="34" cy="62" r="4" fill="#ddd"/><circle cx="90" cy="62" r="4" fill="#ddd"/></svg>`;

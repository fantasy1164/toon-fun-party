// 公園：小猴子跳跳的地盤。溜滑梯（左）、鞦韆（中右）、沙坑與洗手台（右下）、大樹（左上）。舞台 1200x900。
import { weatherLayer, skyColors } from './bathroom.js';
import { avatarSvg, characterSvg } from './characters.js';
import { itemIcon } from './door.js';

// 鞦韆的支點與鍊子長度（舞台座標）
export const SWING = { x: 790, y: 262, len: 290 };
// 溜滑梯路線（腳底座標）
export const SLIDE = { bottom: [196, 650], top: [232, 330], end: [585, 650], exit: [680, 735] };
// 排隊的位置（腳底座標）
export const QUEUE = [[300, 760], [415, 780], [530, 792], [645, 800], [760, 806]];

export function parkBack(ph, wx, { night = false } = {}) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const rain = wx.kind === 'rain' || wx.kind === 'storm';
  const showSun = !night && (wx.kind === 'clear' || wx.kind === 'cloudy');
  const g1 = night ? '#3c6448' : grey ? '#8fb27f' : '#a5dc84';
  const g2 = night ? '#335a3e' : grey ? '#7aa26c' : '#86cf62';
  const lamp = (x) => `<g><rect x="${x - 5}" y="300" width="10" height="330" fill="#3a3f55"/><rect x="${x - 22}" y="284" width="44" height="22" rx="8" fill="#3a3f55"/>
    <ellipse cx="${x}" cy="312" rx="16" ry="10" fill="${night ? '#fff3b0' : '#e8eef4'}"/>${night ? `<circle cx="${x}" cy="318" r="70" fill="#fff3b0" opacity=".18"/>` : ''}</g>`;
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="pksky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#pksky)"/>
    ${night ? [[160, 70], [420, 40], [620, 110], [880, 50], [1100, 90]].map(([x, y]) => `<circle class="tw" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('') + '<circle cx="1040" cy="110" r="44" fill="#fff6c8"/><circle cx="1058" cy="96" r="40" fill="' + a + '"/>' : ''}
    ${showSun ? '<circle class="sun" cx="1040" cy="110" r="54" fill="#ffd34d"/>' : ''}
    ${!night && !rain ? '<g class="cloud" fill="#fff" opacity=".9"><ellipse cx="560" cy="110" rx="70" ry="26"/><ellipse cx="600" cy="94" rx="44" ry="28"/></g>' : ''}
    <path d="M0 430Q240 340 520 410T1200 390V900H0Z" fill="${g1}"/>
    <!-- 遠處的樹 -->
    ${[[420, 400], [520, 380], [960, 380], [1060, 392], [1160, 384]].map(([x, y]) => `<g><rect x="${x - 6}" y="${y}" width="12" height="40" fill="#8a5a2b"/><circle cx="${x}" cy="${y - 10}" r="34" fill="${night ? '#2f5a3a' : '#5cb85c'}"/></g>`).join('')}
    <path d="M0 470Q300 440 600 466T1200 456V900H0Z" fill="${g2}"/>
    <!-- 步道 -->
    <path d="M520 900Q560 760 700 690T1200 640V700Q900 720 760 780T640 900Z" fill="${night ? '#a89a7a' : '#ecd9ae'}"/>
    ${lamp(640)}${lamp(1180)}
    <!-- 大樹 -->
    <ellipse class="shade" cx="110" cy="610" rx="150" ry="34" fill="#000" opacity=".12"/>
    <rect x="80" y="300" width="56" height="310" rx="18" fill="#8a5a2b"/>
    <g fill="${night ? '#2f5a3a' : '#4caf50'}"><circle cx="60" cy="230" r="110"/><circle cx="180" cy="200" r="100"/><circle cx="120" cy="120" r="96"/></g>
    <g fill="${night ? '#3c6a46' : '#66c266'}"><circle cx="90" cy="180" r="56"/><circle cx="170" cy="150" r="46"/></g>
    <!-- 溜滑梯 -->
    <g>
      <rect x="166" y="330" width="12" height="320" fill="#5fa8e8"/><rect x="236" y="330" width="12" height="320" fill="#5fa8e8"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="166" y="${380 + i * 48}" width="82" height="9" rx="4" fill="#5fa8e8"/>`).join('')}
      <rect x="160" y="316" width="150" height="22" rx="8" fill="#e5484d"/>
      <path d="M170 316V260H300V316" fill="none" stroke="#e5484d" stroke-width="10" stroke-linejoin="round"/>
      <path d="M300 320Q420 330 470 470Q520 610 640 630L640 668Q500 660 444 500Q400 372 300 356Z" fill="#ffd34d"/>
      <path d="M300 320Q420 330 470 470Q520 610 640 630" fill="none" stroke="#f0a800" stroke-width="10"/>
      <rect x="296" y="338" width="12" height="312" fill="#5fa8e8"/>
    </g>
    <!-- 鞦韆的架子 -->
    <g stroke="#e5734f" stroke-width="18" stroke-linecap="round"><path d="M650 650L710 250"/><path d="M930 650L870 250"/><path d="M700 252H880"/></g>
    <!-- 沙坑 -->
    <g><rect x="870" y="660" width="310" height="170" rx="20" fill="#c8915a"/><rect x="886" y="676" width="278" height="138" rx="14" fill="${night ? '#b9a275' : '#f2d896'}"/></g>
    <!-- 洗手台 -->
    <g><rect x="1100" y="470" width="18" height="190" fill="#a9b6c4"/><rect x="1060" y="560" width="100" height="22" rx="8" fill="#c8d4de"/><path d="M1118 480H1140V500" stroke="#a9b6c4" stroke-width="12" fill="none" stroke-linecap="round"/></g>
    <!-- 垃圾桶 -->
    <g><rect x="574" y="700" width="72" height="84" rx="10" fill="#4caf50"/><rect x="566" y="690" width="88" height="16" rx="6" fill="#3a8f3e"/><path d="M590 720v52M610 720v52M630 720v52" stroke="#3a8f3e" stroke-width="6" stroke-linecap="round"/><rect x="598" y="676" width="24" height="16" rx="5" fill="#3a8f3e"/></g>
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// 鞦韆（會擺動的部分）：seat 裡放坐著的人
export function swingSvg(seat = '') {
  const { x, y, len } = SWING;
  return `<svg class="pk-swingsvg" viewBox="0 0 1200 900"><g class="swing">
    <path d="M${x - 40} ${y}V${y + len - 10}M${x + 40} ${y}V${y + len - 10}" stroke="#7a8392" stroke-width="5"/>
    <rect x="${x - 56}" y="${y + len - 14}" width="112" height="16" rx="6" fill="#8a5a2b"/>
    <g class="seat">${seat}</g>
  </g></svg>`;
}
// 坐在鞦韆上的人（小孩頭像或跳跳）
export function swingRider(kind) {
  const { x, y, len } = SWING;
  if (kind === 'tiaotiao') return characterSvg('tiaotiao', { x: x - 60, y: y + len - 150, s: 0.5 });
  return `<g transform="translate(${x - 52} ${y + len - 118})"><circle cx="52" cy="52" r="54" fill="#fff"/>${avatarSvg(kind, 104).replace('<svg ', '<svg x="0" y="0" ')}</g>`;
}

// ---------- 小東西 ----------
export const PK = {
  shell: `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M50 18Q86 20 86 60Q70 82 50 82Q30 82 14 60Q14 20 50 18Z" fill="#ffc2d6"/><path d="M50 22V80M34 28L40 80M66 28L60 80M22 40L30 78M78 40L70 78" stroke="#e5738f" stroke-width="3"/></svg>`,
  star: `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M50 10L60 38L90 40L66 58L74 88L50 70L26 88L34 58L10 40L40 38Z" fill="#ff9f43" stroke="#e67e22" stroke-width="3"/></svg>`,
  car: `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M12 64V52Q14 44 24 42L34 30H66L76 42Q88 44 88 54V64Z" fill="#5fa8e8"/><circle cx="30" cy="66" r="10" fill="#333"/><circle cx="70" cy="66" r="10" fill="#333"/></svg>`,
  gem: `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M30 24H70L88 44L50 86L12 44Z" fill="#9b85f0"/><path d="M12 44H88M30 24L40 44L50 86L60 44L70 24" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></svg>`,
  mound: `<svg viewBox="0 0 120 70" width="120" height="70"><ellipse cx="60" cy="50" rx="56" ry="20" fill="#e6c27a"/><ellipse cx="60" cy="40" rx="40" ry="24" fill="#e9c983"/></svg>`,
  bucket: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M22 40H70L64 88H28Z" fill="#ff6b5c"/><path d="M22 40Q46 18 70 40" stroke="#e5484d" stroke-width="4" fill="none"/><path d="M78 14L88 66" stroke="#3fb5e8" stroke-width="7" stroke-linecap="round"/><path d="M82 62Q98 66 90 86Q78 82 82 62Z" fill="#3fb5e8"/></svg>`,
  castle: (n) => `<svg viewBox="0 0 200 170" width="200" height="170">
    ${n >= 1 ? '<rect x="30" y="110" width="140" height="50" rx="6" fill="#e9c983"/>' : ''}
    ${n >= 2 ? '<rect x="44" y="70" width="112" height="44" fill="#e6c27a"/><path d="M44 70h14v-10h14v10h14v-10h14v10h14v-10h14v10h14" fill="#e6c27a"/>' : ''}
    ${n >= 3 ? '<rect x="80" y="26" width="40" height="48" fill="#e9c983"/><path d="M80 26h10v-8h10v8h10v-8h10v8" fill="#e9c983"/><rect x="92" y="130" width="16" height="30" rx="8" fill="#c8915a"/>' : ''}
    ${n >= 4 ? '<path d="M100 18V-6" stroke="#8a5a2b" stroke-width="4"/><path d="M100 -6L126 2L100 10Z" fill="#e5484d"/>' : ''}
  </svg>`,
  faucet: `<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="48" fill="#e9f4f8"/><rect x="20" y="30" width="52" height="16" rx="8" fill="#a9b6c4"/><rect x="58" y="30" width="14" height="28" rx="6" fill="#a9b6c4"/><path class="water" d="M65 60q-6 12 0 26M65 60q6 12 0 26" stroke="#6cc7ea" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  can: `<svg viewBox="0 0 100 100" width="76" height="76"><rect x="30" y="24" width="40" height="56" rx="8" fill="#e5484d" transform="rotate(70 50 52)"/><rect x="30" y="40" width="40" height="12" fill="#fff" transform="rotate(70 50 52)"/></svg>`,
  paper: `<svg viewBox="0 0 100 100" width="76" height="76"><path d="M24 30L56 20L78 40L70 74L36 80L20 56Z" fill="#f4f1ea" stroke="#c8c2b4" stroke-width="3"/><path d="M34 40L60 58M40 64L56 48" stroke="#c8c2b4" stroke-width="3"/></svg>`,
  bottle: `<svg viewBox="0 0 100 100" width="76" height="76"><g transform="rotate(-70 50 50)"><rect x="38" y="30" width="24" height="52" rx="8" fill="#9fd0ff" opacity=".9"/><rect x="43" y="18" width="14" height="14" rx="3" fill="#5fa8e8"/></g></svg>`,
  peel: `<svg viewBox="0 0 100 100" width="76" height="76"><path d="M50 40Q30 50 22 76Q40 66 50 54Q60 66 78 76Q70 50 50 40Z" fill="#ffd34d"/><path d="M50 40Q50 50 50 72" stroke="#e0b000" stroke-width="3"/><rect x="45" y="30" width="10" height="12" fill="#8a5a2b"/></svg>`,
  firefly: `<svg viewBox="0 0 60 60" width="60" height="60"><circle class="ffglow" cx="30" cy="34" r="22" fill="#eaff7a" opacity=".35"/><ellipse cx="30" cy="34" rx="8" ry="10" fill="#d8ff60"/><ellipse cx="30" cy="24" rx="6" ry="6" fill="#3a3f55"/><ellipse cx="21" cy="26" rx="8" ry="5" fill="#fff" opacity=".6"/><ellipse cx="39" cy="26" rx="8" ry="5" fill="#fff" opacity=".6"/></svg>`,
  puddle: `<svg viewBox="0 0 200 70" width="200" height="70"><ellipse cx="100" cy="38" rx="96" ry="28" fill="#7fb4d8"/><ellipse cx="86" cy="32" rx="40" ry="10" fill="#b8dcf2"/></svg>`,
  pavilion: `<svg viewBox="0 0 300 320" width="300" height="320"><path d="M10 110L150 20L290 110Z" fill="#c9562f"/><path d="M10 110H290" stroke="#a8422a" stroke-width="12" stroke-linecap="round"/>
    <rect x="40" y="114" width="18" height="190" fill="#8a5a2b"/><rect x="242" y="114" width="18" height="190" fill="#8a5a2b"/><rect x="60" y="230" width="180" height="16" rx="6" fill="#b9824f"/><rect x="20" y="300" width="260" height="16" rx="6" fill="#a8a29a"/></svg>`,
  stranger: `<svg viewBox="0 0 160 300" width="150" height="280"><g fill="#8a93a6"><ellipse cx="80" cy="60" rx="34" ry="36"/><rect x="40" y="96" width="80" height="120" rx="30"/><rect x="48" y="200" width="26" height="90" rx="12"/><rect x="86" y="200" width="26" height="90" rx="12"/></g>
    <path d="M38 40H122L110 26H50Z" fill="#6a7386"/><rect x="50" y="18" width="60" height="26" rx="8" fill="#6a7386"/>
    <path d="M120 120L148 100" stroke="#8a93a6" stroke-width="16" stroke-linecap="round"/><path d="M148 100V60" stroke="#c8c2b4" stroke-width="4"/><circle cx="148" cy="52" r="16" fill="#ff7fa8"/><path d="M138 52a10 10 0 0 1 20 0" stroke="#fff" stroke-width="3" fill="none"/></svg>`,
};

// ---------- 圖卡（200x200） ----------
const kid = (x, y, c = '#5fa8e8', s = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-58" r="18" fill="#ffd9b8"/><path d="M-18 -62Q0 -86 18 -62Q8 -70 -18 -62Z" fill="#3a2a22"/>
  <rect x="-14" y="-40" width="28" height="34" rx="10" fill="${c}"/><rect x="-12" y="-8" width="10" height="24" rx="4" fill="#3a3f55"/><rect x="2" y="-8" width="10" height="24" rx="4" fill="#3a3f55"/>${extra}</g>`;
const adult = (x, y, c) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="-104" r="20" fill="#ffd9b8"/><path d="M-20 -108Q0 -134 20 -108Z" fill="#3a2a22"/><rect x="-18" y="-84" width="36" height="56" rx="12" fill="${c}"/><rect x="-16" y="-30" width="13" height="40" rx="5" fill="#3a3f55"/><rect x="3" y="-30" width="13" height="40" rx="5" fill="#3a3f55"/></g>`;
const grey = (x, y) => `<g transform="translate(${x} ${y})" fill="#8a93a6"><circle cx="0" cy="-104" r="20"/><rect x="-18" y="-84" width="36" height="56" rx="12"/><rect x="-16" y="-30" width="13" height="40" rx="5"/><rect x="3" y="-30" width="13" height="40" rx="5"/><rect x="-22" y="-130" width="44" height="14" rx="5" fill="#6a7386"/></g>`;
const card = (inner) => `<svg viewBox="0 0 200 200" width="190" height="190"><rect width="200" height="200" rx="24" fill="#f4fbff"/>${inner}</svg>`;
const ground = '<rect x="0" y="170" width="200" height="30" fill="#a5dc84"/>';
const heart = (x, y) => `<path d="M${x} ${y + 8}C${x - 14} ${y - 4} ${x - 6} ${y - 16} ${x} ${y - 6}C${x + 6} ${y - 16} ${x + 14} ${y - 4} ${x} ${y + 8}Z" fill="#ff6b8a"/>`;
const lolly = (x, y) => `<path d="M${x} ${y}V${y - 24}" stroke="#c8c2b4" stroke-width="3"/><circle cx="${x}" cy="${y - 30}" r="9" fill="#ff7fa8"/>`;
const slideShape = '<path d="M30 70H70Q110 72 130 130Q144 166 186 170" fill="none" stroke="#ffd34d" stroke-width="14" stroke-linecap="round"/><path d="M34 70V176M66 70V176" stroke="#5fa8e8" stroke-width="5"/>';

export const CARDS = {
  // 溜滑梯：坐著腳朝下（對）、頭朝下（錯）、從滑道爬上去（錯）
  slide_ok: card(`${ground}${slideShape}<g transform="translate(118 112) rotate(40)"><circle cx="-14" cy="-26" r="13" fill="#ffd9b8"/><rect x="-24" y="-14" width="22" height="22" rx="8" fill="#5fa8e8"/><path d="M-4 4H22" stroke="#3a3f55" stroke-width="9" stroke-linecap="round"/></g>${heart(170, 40)}`),
  slide_head: card(`${ground}${slideShape}<g transform="translate(116 112) rotate(40)"><path d="M-30 -10H-8" stroke="#3a3f55" stroke-width="9" stroke-linecap="round"/><rect x="-8" y="-20" width="24" height="20" rx="8" fill="#5fa8e8"/><circle cx="26" cy="-6" r="13" fill="#ffd9b8"/></g>`),
  slide_climb: card(`${ground}${slideShape}${kid(150, 168, '#5fa8e8', 0.7)}<path d="M140 92L120 76" stroke="#e5484d" stroke-width="5" stroke-linecap="round"/><path d="M120 76l4 12M120 76l12 2" stroke="#e5484d" stroke-width="5" stroke-linecap="round"/>`),
  // 陌生人：不拿、跑去找爸爸媽媽（對）；拿糖果（錯）；跟他走（錯）
  stranger_no: card(`${ground}${adult(130, 170, '#ff9fc0')}${adult(170, 170, '#6fa8dc')}${kid(96, 170)}${heart(150, 40)}<path d="M40 110H74" stroke="#5fa8e8" stroke-width="6" stroke-linecap="round"/><path d="M66 102l10 8l-10 8" stroke="#5fa8e8" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  stranger_take: card(`${ground}${grey(130, 170)}${lolly(106, 128)}${kid(80, 170, '#5fa8e8', 1, '<path d="M14 -30L24 -36" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/>')}`),
  stranger_follow: card(`${ground}${grey(120, 170)}${kid(86, 170, '#5fa8e8', 1, '<path d="M14 -30L24 -40" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/>')}<path d="M150 120H184" stroke="#8a93a6" stroke-width="6" stroke-linecap="round"/><path d="M176 112l10 8l-10 8" stroke="#8a93a6" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  // 走失：站在原地、找穿制服的人（對）；自己亂跑（錯）
  lost_stay: card(`${ground}<g transform="translate(140 170)"><circle cx="0" cy="-104" r="20" fill="#ffd9b8"/><rect x="-22" y="-132" width="44" height="14" rx="5" fill="#1f4fa8"/><rect x="-18" y="-84" width="36" height="56" rx="12" fill="#2f6fd6"/><circle cx="8" cy="-70" r="5" fill="#ffd34d"/><rect x="-16" y="-30" width="13" height="40" rx="5" fill="#1f3a6a"/><rect x="3" y="-30" width="13" height="40" rx="5" fill="#1f3a6a"/></g>${kid(80, 170)}<ellipse cx="80" cy="176" rx="26" ry="6" fill="none" stroke="#ff6b8a" stroke-width="4"/>`),
  lost_run: card(`${ground}<g fill="#5cb85c"><circle cx="40" cy="80" r="26"/><circle cx="170" cy="70" r="24"/></g>${kid(110, 170)}<path d="M60 120q10 -10 0 -20q-10 -10 0 -20M150 130q10 -10 0 -20q-10 -10 0 -20" stroke="#5fa8e8" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  boots: card(`${itemIcon('boots', 150).replace('<svg ', '<svg x="25" y="25" ')}`),
  sneakers: card(`${itemIcon('sneakers', 150).replace('<svg ', '<svg x="25" y="25" ')}`),
};

// 選房間畫面上的公園（300x200）
export function parkExt(ph) {
  const night = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 300 200" overflow="visible">
    <rect x="40" y="70" width="10" height="90" fill="#8a5a2b"/><g fill="${night ? '#2f5a3a' : '#4caf50'}"><circle cx="30" cy="60" r="40"/><circle cx="64" cy="44" r="34"/></g>
    <g><rect x="96" y="80" width="6" height="90" fill="#5fa8e8"/><rect x="122" y="80" width="6" height="90" fill="#5fa8e8"/>${[0, 1, 2, 3].map((i) => `<rect x="96" y="${96 + i * 18}" width="32" height="4" fill="#5fa8e8"/>`).join('')}
      <rect x="92" y="74" width="54" height="10" rx="4" fill="#e5484d"/><path d="M144 80Q190 84 200 130Q210 160 240 164L240 176Q200 172 188 136Q178 98 144 92Z" fill="#ffd34d"/></g>
    <g stroke="#e5734f" stroke-width="7" stroke-linecap="round"><path d="M214 160L236 70M286 160L264 70M232 72H268"/></g>
    <path d="M244 72V126M256 72V126" stroke="#7a8392" stroke-width="2"/><rect x="238" y="124" width="24" height="6" rx="2" fill="#8a5a2b"/>
    ${characterSvg('tiaotiao', { x: 232, y: 80, s: 0.13 })}
    ${night ? '<circle cx="180" cy="40" r="5" fill="#eaff7a"/><circle cx="210" cy="24" r="4" fill="#eaff7a"/>' : ''}
  </svg>`;
}

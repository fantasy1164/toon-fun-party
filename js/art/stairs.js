// 樓梯間（11/21，John：透天厝兩層樓、中間有轉角平台、扶手在欄杆上、沒有安全門）。
// 側面剖開看：一樓地板在下面，第一段樓梯往右上到轉角平台，第二段往左上到二樓。
// 舞台座標 1200x900；小孩站在階梯上時，腳踩在每一階的踏面。

export const ST = {
  F1: 820,      // 一樓地板
  LAND: 520,    // 轉角平台
  F2: 220,      // 二樓地板
  X0: 300,      // 第一段起點（一樓）、第二段終點（二樓）的 x
  X1: 780,      // 轉角平台開始的 x
  LX: 1150,     // 轉角平台最右邊
  N: 8,         // 每段 8 階
  RAIL: 95,     // 扶手比踏面高多少
};
const RUN = (ST.X1 - ST.X0) / ST.N;          // 60
const RISE = (ST.F1 - ST.LAND) / ST.N;       // 37.5

// 第 k 階（1..8）踏面的中心，小孩的腳踩這裡。flight 1：一樓 → 平台；flight 2：平台 → 二樓
export function stepFoot(flight, k) {
  if (k <= 0) return flight === 1 ? [ST.X0 - 90, ST.F1] : [ST.X1 + 70, ST.LAND];
  if (flight === 1) return [ST.X0 + RUN * k - RUN / 2, ST.F1 - RISE * k];
  return [ST.X1 - RUN * k + RUN / 2, ST.LAND - RISE * k];
}
// 扶手線：flight 1 從下往上、flight 2 從平台往上
export function railLine(flight) {
  return flight === 1
    ? [[ST.X0, ST.F1 - ST.RAIL], [ST.X1, ST.LAND - ST.RAIL]]
    : [[ST.X1, ST.LAND - ST.RAIL], [ST.X0, ST.F2 - ST.RAIL]];
}

const WOOD = '#c8915a';
const WOOD2 = '#a8743a';
const TREAD = '#e2b07a';
const RISER = '#c79563';
const METAL = '#5a6474';

function flightSvg(flight) {
  let s = '';
  for (let k = 1; k <= ST.N; k += 1) {
    const x = flight === 1 ? ST.X0 + RUN * (k - 1) : ST.X1 - RUN * k;
    const y = flight === 1 ? ST.F1 - RISE * k : ST.LAND - RISE * k;
    // 踏面＋豎板
    s += `<rect x="${x - 2}" y="${y}" width="${RUN + 4}" height="${RISE}" fill="${RISER}"/><rect x="${x - 4}" y="${y - 6}" width="${RUN + 8}" height="12" rx="4" fill="${TREAD}"/>`;
  }
  // 側板（樓梯下面那一條斜斜的木頭）
  const [a, b] = flight === 1
    ? [[ST.X0, ST.F1], [ST.X1, ST.LAND]]
    : [[ST.X1, ST.LAND], [ST.X0, ST.F2]];
  s += `<path d="M${a[0]} ${a[1] + 8}L${b[0]} ${b[1] + 8}L${b[0]} ${b[1] + 50}L${a[0]} ${a[1] + 50}Z" fill="${WOOD2}"/>`;
  return s;
}
function railSvg(flight) {
  const [[x1, y1], [x2, y2]] = railLine(flight);
  let s = '';
  for (let k = 1; k <= ST.N; k += 1) {
    const [fx, fy] = stepFoot(flight, k);
    const t = (fx - x1) / (x2 - x1);
    const ry = y1 + (y2 - y1) * t;
    s += `<rect x="${fx - 3}" y="${ry}" width="6" height="${fy - ry - 4}" fill="${METAL}"/>`;
  }
  s += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${WOOD}" stroke-width="14" stroke-linecap="round"/><path d="M${x1} ${y1 - 3}L${x2} ${y2 - 3}" stroke="#e8b880" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}

// 背景：night 的時候多一層暗暗的（.st-dark），開燈後 CSS 把它拿掉
export function stairsBack(ph) {
  const night = ph === 'night' || ph === 'dusk';
  const { F1, LAND, F2, X0, X1, LX, RAIL } = ST;
  const sky = night ? '#1d2a4a' : '#bfe6fb';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#f6ead2"/>
    <rect y="${F2 + 34}" width="${X0}" height="${F1 - F2 - 34}" fill="#f0e0c0"/>
    <!-- 牆上的腰板 -->
    <rect y="${F1 - 90}" width="1200" height="8" fill="#e2c89a"/>
    <!-- 轉角平台的窗戶 -->
    <g transform="translate(930 250)"><rect width="150" height="150" rx="10" fill="#fff"/><rect x="10" y="10" width="130" height="130" rx="6" fill="${sky}"/>
      ${night ? '<circle cx="104" cy="44" r="16" fill="#fff6c8"/><circle cx="112" cy="38" r="14" fill="#1d2a4a"/>' : '<circle cx="104" cy="44" r="18" fill="#ffd34d"/><ellipse cx="50" cy="60" rx="28" ry="10" fill="#fff"/>'}
      <path d="M75 10V140M10 75H140" stroke="#fff" stroke-width="8"/></g>
    <!-- 二樓走廊：房門 -->
    <g transform="translate(60 40)"><rect width="120" height="${F2 - 40}" rx="8" fill="#b77a4a"/><rect x="12" y="12" width="96" height="${F2 - 64}" rx="6" fill="#c98a54"/><circle cx="96" cy="${(F2 - 40) / 2 + 10}" r="7" fill="#ffd34d"/></g>
    <!-- 一樓：照片、玩具箱的位置 -->
    <g transform="translate(40 420)"><rect width="110" height="84" rx="6" fill="#fff"/><rect x="8" y="8" width="94" height="68" rx="4" fill="#ffd9e8"/><circle cx="40" cy="38" r="12" fill="#ffd6b8"/><circle cx="70" cy="42" r="10" fill="#ffd6b8"/></g>
    <!-- 平台下面的儲藏空間 -->
    <rect x="${X1 + 20}" y="${LAND + 60}" width="${LX - X1 - 40}" height="${F1 - LAND - 60}" rx="10" fill="#ead6b2"/>
    <!-- 地板 -->
    <rect y="${F1}" width="1200" height="${900 - F1}" fill="#c8a070"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 100}" y="${F1}" width="4" height="${900 - F1}" fill="#b88e60"/>`).join('')}
    <rect y="${F2}" width="${X0 + 4}" height="34" fill="${WOOD2}"/><rect y="${F2 - 8}" width="${X0 + 4}" height="12" rx="4" fill="${TREAD}"/>
    <!-- 轉角平台 -->
    <rect x="${X1 - 4}" y="${LAND - 8}" width="${LX - X1 + 8}" height="14" rx="4" fill="${TREAD}"/><rect x="${X1}" y="${LAND + 6}" width="${LX - X1}" height="44" fill="${WOOD2}"/>
    ${flightSvg(1)}${flightSvg(2)}
    <!-- 欄杆與扶手 -->
    ${railSvg(1)}${railSvg(2)}
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${X1 + 40 + i * 52}" y="${LAND - RAIL}" width="6" height="${RAIL - 6}" fill="${METAL}"/>`).join('')}
    <path d="M${X1} ${LAND - RAIL}H${LX}" stroke="${WOOD}" stroke-width="14" stroke-linecap="round"/>
    <rect x="${X1 - 8}" y="${LAND - RAIL - 14}" width="16" height="${RAIL + 10}" rx="4" fill="${WOOD2}"/>
    <rect x="${LX - 8}" y="${LAND - RAIL - 14}" width="16" height="${RAIL + 10}" rx="4" fill="${WOOD2}"/>
    <!-- 天花板的燈 -->
    <g transform="translate(980 0)"><rect x="-3" width="6" height="60" fill="#888"/><path d="M-40 90Q0 40 40 90Z" fill="#ffd9a0"/><g class="st-bulb"><circle cy="92" r="14" fill="#fff6c8"/></g></g>
    <g class="st-glow"><circle cx="980" cy="96" r="150" fill="#fff6c8" opacity=".35"/></g>
    <g class="st-dark"><rect width="1200" height="900" fill="#0c1430" opacity="${night ? 0.62 : 0}"/></g>
  </svg>`;
}

// 家（房子）左邊加一間樓梯間（點了進樓梯間場景）。viewBox 0 0 134 430，二樓地板在 y 168（對齊房子的 520）
export const STAIRS_ROOM = (night = false) => {
  const zig = (x0, y0, x1, y1, n) => Array.from({ length: n }, (_, i) => {
    const x = x0 + ((x1 - x0) / n) * i;
    const y = y0 + ((y1 - y0) / n) * (i + 1);
    const w = (x1 - x0) / n;
    return `<rect x="${Math.min(x, x + w)}" y="${y}" width="${Math.abs(w)}" height="${Math.abs((y1 - y0) / n) + 1}" fill="${RISER}"/><rect x="${Math.min(x, x + w) - 1}" y="${y - 2}" width="${Math.abs(w) + 2}" height="5" rx="2" fill="${TREAD}"/>`;
  }).join('');
  return `<svg viewBox="0 0 134 430" preserveAspectRatio="none">
    <rect width="134" height="430" fill="${night ? '#e8d4a8' : '#f6ead2'}"/>
    <rect y="160" width="134" height="12" fill="#c8915a"/>
    <rect y="418" width="134" height="12" fill="#c8a070"/>
    ${zig(8, 418, 112, 296, 6)}
    <rect x="100" y="292" width="34" height="8" rx="3" fill="${TREAD}"/>
    ${zig(112, 296, 8, 170, 6)}
    <path d="M8 380L112 258M112 258L8 132" stroke="${WOOD}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${[26, 46, 66, 86].map((x) => `<path d="M${x} ${380 - (x - 8) * 1.17}V${418 - (x - 8) * 1.17}" stroke="${METAL}" stroke-width="2.5"/>`).join('')}
    <path d="M112 258H134" stroke="${WOOD}" stroke-width="6"/>
    <g transform="translate(100 20)"><rect x="-2" width="4" height="20" fill="#888"/><path d="M-14 30Q0 12 14 30Z" fill="#ffd9a0"/><circle cy="31" r="5" fill="${night ? '#fff6c8' : '#fff'}"/></g>
  </svg>`;
};

// ---------- 道具 ----------
export const TOY_BOX = `<svg viewBox="0 0 140 110" width="140" height="110"><rect x="6" y="30" width="128" height="76" rx="10" fill="#ff9f43"/><rect x="0" y="20" width="140" height="20" rx="8" fill="#ffb86b"/><circle cx="40" cy="70" r="10" fill="#fff" opacity=".5"/><rect x="70" y="58" width="30" height="24" rx="4" fill="#fff" opacity=".5"/></svg>`;
export const ST_TOYS = {
  ball: `<svg viewBox="0 0 80 80" width="74" height="74"><circle cx="40" cy="42" r="30" fill="#2f7fe0"/><path d="M12 38Q40 56 68 38" stroke="#fff" stroke-width="6" fill="none"/><circle cx="30" cy="30" r="6" fill="#fff" opacity=".6"/></svg>`,
  car: `<svg viewBox="0 0 90 70" width="84" height="66"><rect x="6" y="26" width="78" height="26" rx="10" fill="#e5484d"/><path d="M22 26L32 10H58L68 26Z" fill="#ff7a7e"/><rect x="34" y="14" width="22" height="12" rx="3" fill="#bfe6fb"/><circle cx="24" cy="54" r="10" fill="#333"/><circle cx="66" cy="54" r="10" fill="#333"/></svg>`,
  block: `<svg viewBox="0 0 80 80" width="70" height="70"><rect x="8" y="30" width="34" height="34" rx="6" fill="#ffb300"/><rect x="40" y="30" width="34" height="34" rx="6" fill="#2ea05a"/><rect x="24" y="0" width="34" height="34" rx="6" fill="#8e4ec6"/></svg>`,
};
export const SWITCH = `<svg viewBox="0 0 70 100" width="70" height="100"><rect x="4" y="4" width="62" height="92" rx="12" fill="#fff" stroke="#d8c8a8" stroke-width="4"/><rect class="sw-key" x="20" y="18" width="30" height="64" rx="8" fill="#e8e0d0"/><rect class="sw-up" x="24" y="22" width="22" height="26" rx="5" fill="#ffd34d"/></svg>`;
export const RAIL_HAND = `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#ffb300" stroke-width="6"/>
  <path d="M34 66V44q0 -6 6 -6t6 6V30q0 -6 6 -6t6 6v8q0 -5 5 -5t5 5v6q0 -5 5 -5t5 5v14q0 18 -18 22h-6q-12 0 -20 -14Z" fill="#ffd6b8" stroke="#d9a080" stroke-width="3" transform="translate(-8 0)"/></svg>`;
// 奇奇抱著一大疊玩具（擋住臉）
export const TOY_STACK = `<svg viewBox="0 0 120 170" width="120" height="170">${['#e5484d', '#2f7fe0', '#ffb300', '#2ea05a', '#8e4ec6'].map((c, i) => `<rect x="${10 + (i % 2) * 8}" y="${130 - i * 30}" width="96" height="30" rx="6" fill="${c}" stroke="#fff" stroke-width="3"/>`).join('')}</svg>`;

// ---------- 圖卡（viewBox 0 0 100 100） ----------
const ok = (body) => `<rect width="100" height="100" rx="16" fill="#e6f8e6"/>${body}`;
const no = (body) => `<rect width="100" height="100" rx="16" fill="#ffe8e8"/>${body}`;
const kid = (x, y, extra = '') => `<circle cx="${x}" cy="${y}" r="8" fill="#ffd6b8"/><path d="M${x} ${y + 8}V${y + 28}M${x} ${y + 28}l-6 12M${x} ${y + 28}l6 12${extra}" stroke="#3a7bd5" stroke-width="5" stroke-linecap="round" fill="none"/>`;
// 一段往右上的樓梯（右邊是平台）
const miniStairs = (rail = true) => `${Array.from({ length: 5 }, (_, i) => `<rect x="${6 + i * 12}" y="${90 - (i + 1) * 9}" width="13" height="${(i + 1) * 9}" fill="${RISER}"/><rect x="${5 + i * 12}" y="${88 - (i + 1) * 9}" width="14" height="4" rx="1" fill="${TREAD}"/>`).join('')}
  <rect x="66" y="43" width="30" height="47" fill="${RISER}"/><rect x="65" y="41" width="32" height="5" rx="2" fill="${TREAD}"/>
  ${rail ? `<path d="M8 66L66 21H96" stroke="${WOOD}" stroke-width="4" fill="none" stroke-linecap="round"/>${[20, 34, 48, 76, 88].map((x) => `<path d="M${x} ${x < 66 ? 66 - (x - 8) * 0.78 : 21}V${x < 66 ? 82 - (x - 8) * 0.75 : 41}" stroke="${METAL}" stroke-width="1.6"/>`).join('')}` : ''}`;
export const ST_CARD = {
  // 平台：扶著扶手走過去 ／ 在平台跳
  landWalk: ok(`${miniStairs()}${kid(80, 12, ` M${80} ${20}l8 -2`)}<path d="M64 28h-8M66 34h-8" stroke="#2ea05a" stroke-width="3" stroke-linecap="round"/>`),
  landJump: no(`${miniStairs()}<g transform="rotate(-14 76 20)">${kid(76, 2, ' M76 12l-9 -7M76 12l9 -7')}</g><path d="M60 8q-6 8 0 16M94 8q6 8 0 16" stroke="#e5484d" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 50l-10 14" stroke="#e5484d" stroke-width="3" stroke-dasharray="4 4"/>`),
  // 下樓：站著扶扶手走 ／ 坐著溜下去
  walkDown: ok(`${miniStairs()}${kid(40, 22, ' M40 30l-8 4')}`),
  slideDown: no(`${miniStairs()}<g transform="rotate(-38 40 54)"><circle cx="40" cy="40" r="8" fill="#ffd6b8"/><path d="M40 48V60M40 60H56M40 52l12 -6" stroke="#3a7bd5" stroke-width="5" stroke-linecap="round" fill="none"/></g><path d="M58 40l10 -8M62 50l10 -8" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>`),
  // 拿東西：一手拿一點、一手扶扶手 ／ 抱一大疊擋住眼睛
  carryLittle: ok(`${miniStairs()}${kid(42, 20, ' M42 30l-8 2M42 30l10 6')}<rect x="50" y="32" width="12" height="10" rx="2" fill="#ffb300"/>`),
  carryStack: no(`${miniStairs()}${kid(42, 20, '')}${['#e5484d', '#2f7fe0', '#ffb300', '#2ea05a'].map((c, i) => `<rect x="${32 + (i % 2) * 2}" y="${30 - i * 9}" width="22" height="9" rx="2" fill="${c}" stroke="#fff" stroke-width="1.5"/>`).join('')}`),
  // 晚上：開燈再走 ／ 暗暗的就走
  lightOn: ok(`<circle cx="70" cy="14" r="22" fill="#fff6c8" opacity=".8"/>${miniStairs()}<path d="M66 0V8M58 10Q66 2 74 10Z" fill="#ffd9a0" stroke="#888" stroke-width="1.5"/>${kid(22, 40, ' M22 48l-6 -6')}`),
  lightOff: no(`${miniStairs()}<rect width="100" height="100" rx="16" fill="#0c1430" opacity=".72"/>${kid(22, 40, '')}<text x="70" y="40" font-size="22" fill="#fff" text-anchor="middle" font-weight="bold">?</text>`),
};

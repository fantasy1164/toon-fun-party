// 廚房（餐桌）：背景、座位、餐具、食物、盤子、水槽。舞台 1200x900。
import { characterSvg, avatarSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

// 三個座位：左邊波波、中間小孩、右邊另一位角色
export const SEATS = [
  { x: 200, who: 'bobo' },
  { x: 600, who: 'kid' },
  { x: 1000, who: 'other' },
];
export const TABLE_Y = 600;

// 一起玩：四個座位（波波、妍卉、向澤、另一位角色），餐具縮小一點
export function seatsFor(profile) {
  if (profile.members.length > 1) {
    return [{ x: 150, who: 'bobo', s: 0.85 }, ...profile.members.map((id, i) => ({ x: i === 0 ? 450 : 750, who: 'kid', id, s: 0.85 })), { x: 1050, who: 'other', s: 0.85 }];
  }
  return SEATS.map((st) => ({ ...st, s: 1, id: st.who === 'kid' ? profile.members[0] : undefined }));
}

export const SEAT_COLORS = { bobo: '#6b3f1d', dudu: '#3aa6d0', kiki: '#f08a3c', yh: '#ff7fa8', xz: '#2ea05a', both: '#ffb300' };

// ---------- 餐具（100x100） ----------
export const WARE = {
  bowl: (c) => `<path d="M6 34H94Q90 82 50 86Q10 82 6 34Z" fill="${c}"/><ellipse cx="50" cy="34" rx="44" ry="11" fill="#fff" opacity=".55"/><ellipse cx="50" cy="34" rx="44" ry="11" fill="none" stroke="${c}" stroke-width="4"/>`,
  spoon: (c) => `<ellipse cx="50" cy="24" rx="16" ry="20" fill="${c}"/><ellipse cx="46" cy="20" rx="6" ry="8" fill="#fff" opacity=".5"/><rect x="45" y="40" width="10" height="54" rx="5" fill="${c}"/>`,
  cup: (c) => `<path d="M24 14H76L70 90H30Z" fill="${c}"/><path d="M28 30H72" stroke="#fff" stroke-width="5" opacity=".6"/><path d="M76 34q16 4 12 22q-4 12 -14 10" fill="none" stroke="${c}" stroke-width="7"/>`,
};
export const WARE_IDS = ['bowl', 'spoon', 'cup'];
// 餐具在座位上的位置（相對座位中心）
const WARE_POS = { bowl: [0, -28, 1.0], spoon: [92, -14, 0.7], cup: [-96, -44, 0.75] };
export function wareSvg(kind, color, size = 100) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${WARE[kind](color)}</svg>`;
}

// ---------- 食物（100x100） ----------
export const FOODS = {
  rice: { g: 'grain', svg: `<path d="M10 46H90Q86 86 50 90Q14 86 10 46Z" fill="#7cc4d8"/><path d="M14 48Q20 14 50 14Q80 14 86 48Z" fill="#fff"/><path d="M30 30h4M46 22h4M62 32h4M40 40h4M56 42h4" stroke="#e6e6e6" stroke-width="4" stroke-linecap="round"/>` },
  broccoli: { g: 'veg', svg: `<rect x="44" y="52" width="14" height="38" rx="6" fill="#8bc34a"/><circle cx="34" cy="40" r="20" fill="#2e8b57"/><circle cx="66" cy="40" r="20" fill="#2e8b57"/><circle cx="50" cy="24" r="20" fill="#3aa36a"/>` },
  carrot: { g: 'veg', svg: `<path d="M30 30L78 86L40 50Z" fill="#f0811f"/><path d="M24 36Q30 22 44 30Q38 46 24 36Z" fill="#f0811f"/><path d="M28 30Q10 10 22 8Q30 20 34 24M34 26Q36 4 46 10Q42 20 38 28" fill="#3aa36a"/>` },
  egg: { g: 'protein', svg: `<path d="M50 12Q84 14 86 48Q88 84 50 88Q12 86 14 52Q16 14 50 12Z" fill="#fff" stroke="#eee" stroke-width="3"/><circle cx="50" cy="50" r="18" fill="#ffc400"/><circle cx="44" cy="44" r="5" fill="#fff" opacity=".6"/>` },
  fish: { g: 'protein', svg: `<path d="M8 50C24 24 60 24 74 50C60 76 24 76 8 50Z" fill="#ff9f6b"/><path d="M70 50L94 30V70Z" fill="#ff7f4b"/><circle cx="26" cy="46" r="5" fill="#1d2433"/><path d="M40 38v24M52 36v28" stroke="#ff7f4b" stroke-width="4"/>` },
  apple: { g: 'fruit', svg: `<path d="M50 28C30 14 10 30 14 56C18 82 40 92 50 84C60 92 82 82 86 56C90 30 70 14 50 28Z" fill="#e5484d"/><path d="M50 28Q48 14 56 6" stroke="#7a4a1e" stroke-width="5" fill="none"/><path d="M54 18Q70 8 76 20Q64 26 54 18Z" fill="#3aa36a"/><ellipse cx="32" cy="46" rx="6" ry="10" fill="#fff" opacity=".4"/>` },
  banana: { g: 'fruit', svg: `<path d="M14 30Q24 84 84 72Q90 66 82 64Q36 66 26 26Z" fill="#ffd34d" stroke="#e0a800" stroke-width="3"/><path d="M22 24l-6 -8" stroke="#7a4a1e" stroke-width="6" stroke-linecap="round"/>` },
  candy: { g: 'junk', svg: `<circle cx="50" cy="50" r="22" fill="#ec5fa0"/><path d="M28 50L8 34V66Z" fill="#ff9fc4"/><path d="M72 50L92 34V66Z" fill="#ff9fc4"/><path d="M40 36Q50 50 40 64M54 34Q64 50 54 66" stroke="#fff" stroke-width="4" fill="none"/>` },
  chips: { g: 'junk', svg: `<path d="M20 12H80L76 90H24Z" fill="#e5484d"/><path d="M20 12L26 4H74L80 12Z" fill="#c9302c"/><circle cx="50" cy="52" r="18" fill="#ffd34d"/><path d="M42 50q8 -10 16 0" stroke="#e0a800" stroke-width="4" fill="none"/>` },
};
export const FOOD_IDS = ['rice', 'broccoli', 'carrot', 'egg', 'fish', 'apple', 'banana', 'candy', 'chips'];
export const GROUPS = ['grain', 'veg', 'protein', 'fruit'];
export function foodSvg(id, size = 100) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${FOODS[id].svg}</svg>`;
}
// 食物在盤子上的位置（相對盤子中心）
export const PLATE_SPOT = { grain: [-66, -58], veg: [66, -58], protein: [-66, 60], fruit: [66, 60], junk: [0, 0] };

// ---------- 場景 ----------
function windowArt(ph, wx) {
  const { colors: [a, b] } = skyColors(ph, wx);
  return `
    <defs><linearGradient id="ksky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="kclip"><rect x="440" y="70" width="320" height="200" rx="18"/></clipPath></defs>
    <g clip-path="url(#kclip)"><rect x="440" y="70" width="320" height="200" fill="url(#ksky)"/>
      ${wx.kind === 'clear' || wx.kind === 'cloudy' ? (ph === 'night' ? '<circle cx="700" cy="120" r="26" fill="#fff6c8"/>' : '<circle cx="700" cy="120" r="30" fill="#ffd34d"/>') : ''}
      <path d="M440 270V230Q560 200 640 226T760 220V270Z" fill="${ph === 'night' ? '#16305a' : '#8fd67a'}"/>
      ${weatherLayer(wx, ph, 440, 70, 320, 200)}</g>
    <rect x="440" y="70" width="320" height="200" rx="18" fill="none" stroke="#fff" stroke-width="14"/>
    <path d="M600 70V270" stroke="#fff" stroke-width="10"/>
    <path d="M420 60Q600 110 780 60V90Q600 140 420 90Z" fill="#ff9f6b"/>`;
}

export function kitchenBack(ph, wx) {
  let tiles = '';
  for (let x = 0; x <= 1200; x += 60) tiles += `<path d="M${x} 300V460" stroke="#f3dcb4" stroke-width="2"/>`;
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#fff1d6"/>
    <rect y="300" width="1200" height="160" fill="#fde7c2"/>${tiles}
    ${windowArt(ph, wx)}
    <rect x="60" y="120" width="240" height="18" rx="8" fill="#b9824f"/>
    <circle cx="110" cy="100" r="22" fill="#fff" stroke="#e6d3b8" stroke-width="4"/><circle cx="170" cy="100" r="22" fill="#7cc4d8"/><circle cx="230" cy="100" r="22" fill="#ffb3c7"/>
    <rect x="900" y="120" width="240" height="18" rx="8" fill="#b9824f"/>
    <rect x="920" y="70" width="40" height="50" rx="6" fill="#e5484d"/><rect x="980" y="60" width="44" height="60" rx="6" fill="#ffd34d"/><rect x="1044" y="80" width="40" height="40" rx="6" fill="#3aa36a"/>
  </svg>`;
}

// 坐在桌子後面的角色（桌子會蓋住下半身）
export function seatedChars(other, seats = seatsFor({ members: ['yh'] })) {
  const bobo = seats[0];
  const oth = seats[seats.length - 1];
  const sc = bobo.s;
  const chair = (x) => `<g class="kid-chair"><rect x="${x - 90 * sc}" y="${380 + (1 - sc) * 150}" width="${180 * sc}" height="${230 * sc}" rx="30" fill="#c8915a"/><rect x="${x - 70 * sc}" y="${400 + (1 - sc) * 150}" width="${140 * sc}" height="${190 * sc}" rx="22" fill="#d9a066"/></g>`;
  return `<svg viewBox="0 0 1200 900">
    <g class="seat-char" data-who="bobo">${characterSvg('bobo', { x: bobo.x - 120 * sc, y: 300 + (1 - sc) * 200, s: sc })}</g>
    ${seats.filter((st) => st.who === 'kid').map((st) => chair(st.x)).join('')}
    <g class="seat-char" data-who="other">${characterSvg(other, { x: oth.x - 120 * sc, y: 300 + (1 - sc) * 200, s: sc })}</g>
  </svg>`;
}

export function tableFront(profile, seats = seatsFor(profile)) {
  return `<svg viewBox="0 0 1200 900">
    <rect x="20" y="${TABLE_Y - 20}" width="1160" height="60" rx="20" fill="#d9a066"/>
    <rect x="20" y="${TABLE_Y + 30}" width="1160" height="20" fill="#b9824f"/>
    <rect x="60" y="${TABLE_Y + 50}" width="40" height="200" fill="#b9824f"/><rect x="1100" y="${TABLE_Y + 50}" width="40" height="200" fill="#b9824f"/>
    <path d="M20 ${TABLE_Y - 8}H1180" stroke="#fff" stroke-width="10" stroke-dasharray="30 30" opacity=".5"/>
    ${seats.filter((st) => st.who === 'kid').map((st) => `<g class="kid-face" data-id="${st.id}" transform="translate(${st.x - 40} ${TABLE_Y - 220})"><circle cx="40" cy="40" r="44" fill="#fff"/>${avatarSvg(st.id, 80).replace('<svg ', '<svg x="0" y="0" ')}</g>`).join('')}
  </svg>`;
}

// 座位上的餐具（先畫好，用 class 決定顯示），以及點座位用的透明感應區
export function placeSettings(colors, seats = SEATS.map((st) => ({ ...st, s: 1 }))) {
  return `<svg class="places" viewBox="0 0 1200 900">
    ${seats.map((st, i) => `
      <g class="place" data-seat="${i}"><g transform="translate(${st.x} ${TABLE_Y}) scale(${st.s}) translate(${-st.x} ${-TABLE_Y})">
        <ellipse class="mat" cx="${st.x}" cy="${TABLE_Y - 10}" rx="150" ry="34" fill="${colors[i]}" opacity=".28"/>
        ${WARE_IDS.map((k) => {
          const [dx, dy, s] = WARE_POS[k];
          return `<g class="ware ${k}" transform="translate(${st.x + dx - 50 * s} ${TABLE_Y + dy - 60 * s}) scale(${s})">${WARE[k](colors[i])}</g>`;
        }).join('')}
        <rect class="hit" x="${st.x - 170}" y="${TABLE_Y - 220}" width="340" height="260" fill="transparent"/>
      </g></g>`).join('')}
  </svg>`;
}

export const SINK = `<g class="prop sink" data-prop="sink">
  <circle class="halo" cx="1080" cy="380" r="110" fill="#ffd000"/>
  <rect x="980" y="330" width="200" height="110" rx="16" fill="#b9c6d2"/><rect x="996" y="346" width="168" height="78" rx="12" fill="#8fa3b5"/>
  <path d="M1080 330V290Q1080 270 1100 270H1120V286H1102Q1096 286 1096 294V330" fill="#9aa9b8"/>
  <rect class="hit" x="970" y="280" width="220" height="170" fill="transparent"/></g>`;

export const PLATE = `<g class="plate-g"><circle r="160" fill="#fff" stroke="#e6e6e6" stroke-width="8"/><circle r="128" fill="none" stroke="#f1f1f1" stroke-width="6"/>
  <path d="M0 -150V150M-150 0H150" stroke="#f1f1f1" stroke-width="5"/></g>`;

export const KNIFE = `<svg viewBox="0 0 100 100" width="90" height="90"><path d="M20 80L70 18Q84 10 80 30L36 86Z" fill="#cfd8dc"/><rect x="8" y="74" width="34" height="14" rx="6" fill="#8a5a2b" transform="rotate(-50 25 81)"/></svg>`;

// 客廳大門區：大門、門外天氣、衣帽架、8 件衣物、奇奇的穿搭與狀態。舞台 1200x900。
import { characterSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

export const ITEM_IDS = ['sneakers', 'boots', 'raincoat', 'umbrella', 'jacket', 'scarf', 'hat', 'bottle'];

// 衣帽架上的圖示（100x100）
const ICONS = {
  sneakers: `<path d="M10 62Q12 44 30 44L44 46Q52 58 70 58L88 62Q94 66 92 74H10Z" fill="#ff6b5c"/><rect x="10" y="72" width="82" height="9" rx="3" fill="#fff" stroke="#ddd" stroke-width="2"/><path d="M34 50l6 7M43 49l6 7" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  boots: `<path d="M30 12H58V60Q58 64 62 66L84 72Q92 76 90 86H30Z" fill="#ffd34d"/><rect x="28" y="84" width="64" height="9" rx="3" fill="#e0a800"/><rect x="28" y="12" width="32" height="10" fill="#e0a800"/>`,
  raincoat: `<path d="M30 22Q50 12 70 22L88 88Q50 98 12 88Z" fill="#ffd34d"/><path d="M36 18Q50 0 64 18Q50 26 36 18Z" fill="#ffc400"/><circle cx="50" cy="42" r="4" fill="#e0a800"/><circle cx="50" cy="58" r="4" fill="#e0a800"/><circle cx="50" cy="74" r="4" fill="#e0a800"/>`,
  umbrella: `<path d="M6 50Q50 -8 94 50Q83 42 72 50Q61 42 50 50Q39 42 28 50Q17 42 6 50Z" fill="#8e4ec6"/><path d="M50 50V84q0 10 -10 10" fill="none" stroke="#555" stroke-width="5" stroke-linecap="round"/>`,
  jacket: `<path d="M30 12L50 20L70 12L94 30L84 50L76 46V92H24V46L16 50L6 30Z" fill="#3f7fd6"/><path d="M50 20V92" stroke="#2c5fa8" stroke-width="4"/><path d="M30 12L50 30L70 12" fill="none" stroke="#2c5fa8" stroke-width="5" stroke-linejoin="round"/>`,
  scarf: `<path d="M12 28Q50 50 88 28L86 46Q50 68 14 46Z" fill="#e5484d"/><path d="M60 50L72 94H54L50 56Z" fill="#e5484d"/><path d="M24 36l3 12M40 42l1 12M56 44v12M72 40l-2 12M56 74H70M57 84H72" stroke="#fff" stroke-width="3"/>`,
  hat: `<ellipse cx="50" cy="66" rx="46" ry="12" fill="#f2d28b"/><path d="M24 66Q26 24 50 24Q74 24 76 66Z" fill="#f2d28b"/><path d="M25 55Q50 63 75 55L76 64Q50 72 24 64Z" fill="#e5484d"/>`,
  bottle: `<rect x="34" y="26" width="32" height="66" rx="10" fill="#5fc3e8"/><rect x="40" y="12" width="20" height="16" rx="4" fill="#2f7fe0"/><rect x="34" y="50" width="32" height="12" fill="#fff" opacity=".6"/>`,
};
export function itemIcon(id, size = 100) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${ICONS[id]}</svg>`;
}

// 穿在奇奇身上的樣子（奇奇自己的座標：240x320，腳底 y=320）
const WEAR = {
  sneakers: `<g class="w sneakers"><rect x="64" y="292" width="58" height="24" rx="11" fill="#ff6b5c"/><rect x="118" y="292" width="58" height="24" rx="11" fill="#ff6b5c"/>
    <rect x="62" y="310" width="62" height="8" rx="3" fill="#fff"/><rect x="116" y="310" width="62" height="8" rx="3" fill="#fff"/></g>`,
  boots: `<g class="w boots"><rect x="68" y="258" width="52" height="58" rx="10" fill="#ffd34d"/><rect x="120" y="258" width="52" height="58" rx="10" fill="#ffd34d"/>
    <rect x="66" y="310" width="56" height="9" rx="3" fill="#e0a800"/><rect x="118" y="310" width="56" height="9" rx="3" fill="#e0a800"/></g>`,
  jacket: `<g class="w jacket"><path d="M62 196Q120 170 178 196L188 302Q120 322 52 302Z" fill="#3f7fd6"/>
    <path d="M120 190V312" stroke="#2c5fa8" stroke-width="5"/><path d="M84 186L120 212L156 186" fill="none" stroke="#2c5fa8" stroke-width="10" stroke-linejoin="round"/>
    <rect x="76" y="258" width="26" height="18" rx="5" fill="#2c5fa8"/><rect x="138" y="258" width="26" height="18" rx="5" fill="#2c5fa8"/></g>`,
  raincoat: `<g class="w raincoat"><path d="M70 182Q120 166 170 182L200 306Q120 324 40 306Z" fill="#ffd34d"/>
    <circle cx="120" cy="214" r="6" fill="#e0a800"/><circle cx="120" cy="244" r="6" fill="#e0a800"/><circle cx="120" cy="274" r="6" fill="#e0a800"/>
    <ellipse cx="120" cy="40" rx="80" ry="15" fill="#ffc400"/><path d="M70 40Q72 -2 120 -4Q168 -2 170 40Z" fill="#ffd34d"/></g>`,
  scarf: `<g class="w scarf"><path d="M60 176Q120 212 180 176L176 204Q120 236 64 204Z" fill="#e5484d"/><path d="M146 202L162 268H140L132 208Z" fill="#e5484d"/>
    <path d="M80 190l4 16M104 198l2 16M128 200v16M152 194l-3 16M142 236H160M144 252H163" stroke="#fff" stroke-width="4"/></g>`,
  hat: `<g class="w hat"><ellipse cx="120" cy="44" rx="100" ry="19" fill="#f2d28b"/><path d="M74 44Q76 -4 120 -6Q164 -4 166 44Z" fill="#f2d28b"/>
    <path d="M76 32Q120 42 164 32L165 44Q120 54 75 44Z" fill="#e5484d"/></g>`,
  bottle: `<g class="w bottle"><path d="M78 186L200 268" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/>
    <rect x="192" y="246" width="28" height="54" rx="9" fill="#5fc3e8"/><rect x="198" y="236" width="16" height="12" rx="3" fill="#2f7fe0"/></g>`,
  umbrella: `<g class="w umbrella"><path d="M196 -24V258" stroke="#555" stroke-width="6"/><path d="M196 258q0 16 -14 16" fill="none" stroke="#555" stroke-width="6" stroke-linecap="round"/>
    <g class="canopy"><path d="M100 -24Q196 -128 292 -24Q268 -40 244 -24Q220 -40 196 -24Q172 -40 148 -24Q124 -40 100 -24Z" fill="#8e4ec6"/></g></g>`,
};

// 開門後的狀態：淋濕、腳濕、流汗、發抖
const STATES = `
  <g class="st wet">
    ${[[60, 90], [180, 70], [100, 200], [150, 240], [70, 260], [200, 180]].map(([x, y]) => `<path d="M${x} ${y}q-7 12 0 17q7-5 0-17z" fill="#5fb8e8"/>`).join('')}
    <ellipse cx="120" cy="320" rx="120" ry="10" fill="#8fd8f5" opacity=".75"/>
  </g>
  <g class="st feet"><ellipse cx="120" cy="320" rx="110" ry="10" fill="#8fd8f5" opacity=".8"/>
    <path d="M60 300q-10-10-2-18M182 300q10-10 2-18" stroke="#5fb8e8" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <g class="st sweat">${[[26, 70], [214, 64], [40, 120], [204, 120]].map(([x, y]) => `<path d="M${x} ${y}q-8 13 0 19q8-6 0-19z" fill="#8fd8f5"/>`).join('')}
    <ellipse cx="62" cy="138" rx="18" ry="11" fill="#ff6b5c" opacity=".55"/><ellipse cx="178" cy="138" rx="18" ry="11" fill="#ff6b5c" opacity=".55"/></g>
  <g class="st cold"><ellipse cx="120" cy="110" rx="92" ry="74" fill="#7fb8ff" opacity=".28"/>
    <path d="M20 40l14 10M30 30l-4 20M226 40l-14 10M216 30l4 20" stroke="#cfe8ff" stroke-width="4" stroke-linecap="round"/></g>`;

// 奇奇（含所有衣物與狀態，靠 class 決定顯示哪些）
export function kikiSvg() {
  // 鞋子最後畫，才不會被雨衣、外套蓋住
  const order = ['raincoat', 'jacket', 'scarf', 'bottle', 'hat', 'umbrella', 'sneakers', 'boots'];
  const extra = order.map((id) => WEAR[id]).join('') + STATES;
  return `<svg viewBox="-60 -140 360 470" width="360" height="470">${characterSvg('kiki', { extra })}</svg>`;
}

// ---------- 門外的景色 ----------
function outside(id, ph, wx, x, y, w, h) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night';
  const sun = wx.kind === 'clear' || wx.kind === 'cloudy'
    ? night ? `<circle cx="${x + w * 0.72}" cy="${y + h * 0.16}" r="30" fill="#fff6c8"/><circle cx="${x + w * 0.72 + 14}" cy="${y + h * 0.16 - 8}" r="27" fill="${a}"/>`
      : `<circle class="sun ${wx.hot ? 'hot' : ''}" cx="${x + w * 0.72}" cy="${y + h * 0.16}" r="${wx.hot ? 42 : 32}" fill="#ffd34d"/>`
    : '';
  const ground = night ? '#1d3a5f' : grey ? '#7fae74' : '#8fd67a';
  return `
    <defs>
      <linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="${id}-c"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    </defs>
    <g clip-path="url(#${id}-c)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-g)"/>
      ${sun}
      <path d="M${x} ${y + h * 0.62}Q${x + w * 0.5} ${y + h * 0.52} ${x + w} ${y + h * 0.6}V${y + h}H${x}Z" fill="${ground}"/>
      <path d="M${x + w * 0.38} ${y + h}L${x + w * 0.46} ${y + h * 0.6}H${x + w * 0.54}L${x + w * 0.62} ${y + h}Z" fill="${night ? '#3a4a66' : '#d9cbb0'}"/>
      <g class="tree ${wx.windy ? 'windy' : ''}"><rect x="${x + w * 0.12}" y="${y + h * 0.42}" width="14" height="${h * 0.2}" fill="#8a5a2b"/>
        <circle cx="${x + w * 0.12 + 7}" cy="${y + h * 0.4}" r="${w * 0.12}" fill="${night ? '#24533a' : '#4caf50'}"/></g>
      ${weatherLayer(wx, ph, x, y, w, h)}
    </g>`;
}

// 場景主圖。回傳背景（含門外景色）SVG。
export function doorView(ph, wx) {
  let planks = '';
  for (let x = 0; x <= 1200; x += 150) planks += `<path d="M${x} 700V900" stroke="#b07a46" stroke-width="3"/>`;
  return `
  <svg class="door-art" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#fbe3c4"/>
    <rect y="560" width="1200" height="140" fill="#efcf9f"/><path d="M0 560H1200" stroke="#fff" stroke-width="8"/>
    <rect y="700" width="1200" height="200" fill="#c8915a"/>${planks}
    <path d="M0 700H1200" stroke="#a87442" stroke-width="8"/>

    <!-- 衣帽架 -->
    <rect x="30" y="150" width="450" height="34" rx="12" fill="#b9824f"/>
    <rect x="30" y="390" width="450" height="34" rx="12" fill="#b9824f"/>
    ${[90, 200, 310, 420].map((cx) => `<circle cx="${cx}" cy="190" r="8" fill="#8a5a2b"/><circle cx="${cx}" cy="430" r="8" fill="#8a5a2b"/>`).join('')}

    <!-- 門框與門外 -->
    <rect x="770" y="130" width="320" height="590" rx="10" fill="#8a5a2b"/>
    <g class="outside">${outside('out', ph, wx, 790, 150, 280, 560)}</g>
    <g class="door-panel">
      <rect x="790" y="150" width="280" height="560" rx="6" fill="#d96c4a"/>
      <g class="glass">${outside('glass', ph, wx, 830, 190, 200, 150)}</g>
      <rect x="830" y="190" width="200" height="150" rx="10" fill="none" stroke="#b8553a" stroke-width="10"/>
      <rect x="830" y="380" width="200" height="290" rx="12" fill="none" stroke="#b8553a" stroke-width="8"/>
      <circle cx="1040" cy="450" r="14" fill="#ffd34d"/><circle cx="1040" cy="450" r="6" fill="#e0a800"/>
    </g>
    <ellipse cx="930" cy="760" rx="170" ry="28" fill="#5fa86a"/>
    <ellipse cx="930" cy="760" rx="150" ry="20" fill="none" stroke="#4c8c56" stroke-width="5" stroke-dasharray="10 8"/>
  </svg>`;
}

// 衣帽架上的衣物（可點）
const RACK = {
  sneakers: [90, 196], boots: [200, 196], raincoat: [310, 196], umbrella: [420, 196],
  jacket: [90, 436], scarf: [200, 436], hat: [310, 436], bottle: [420, 436],
};
export function rackSvg() {
  const items = ITEM_IDS.map((id) => {
    const [cx, y] = RACK[id];
    return `<g class="prop item" data-prop="${id}">
      <circle class="halo" cx="${cx}" cy="${y + 68}" r="66" fill="#ffd000"/>
      <g class="ghost" opacity=".18" transform="translate(${cx - 52} ${y + 12}) scale(1.04)">${ICONS[id]}</g>
      <g class="icon" transform="translate(${cx - 52} ${y + 12}) scale(1.04)">${ICONS[id]}</g>
      <rect class="hit" x="${cx - 55}" y="${y - 6}" width="110" height="140" fill="transparent"/></g>`;
  }).join('');
  return `<svg class="rack" viewBox="0 0 1200 900">${items}
    <g class="prop doorhit" data-prop="door"><rect class="halo door-halo" x="770" y="130" width="320" height="590" rx="14" fill="none" stroke="#ffd000" stroke-width="22"/>
      <rect class="hit" x="770" y="130" width="320" height="590" fill="transparent"/></g></svg>`;
}

export const SPIN_ICON = `<svg viewBox="0 0 100 100" width="76" height="76">
  ${[['#ffd34d', 0], ['#5fc3e8', 90], ['#7fb8ff', 180], ['#ff9f43', 270]].map(([c, r]) =>
    `<path d="M50 50L50 8A42 42 0 0 1 92 50Z" fill="${c}" transform="rotate(${r} 50 50)"/>`).join('')}
  <circle cx="50" cy="50" r="10" fill="#fff"/><path d="M50 2L58 14H42Z" fill="#e5484d"/></svg>`;

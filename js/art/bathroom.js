// 廁所場景的美術。舞台 1200x900。每個可點的道具是 <g class="prop" data-prop="...">，
// 內含一個發光用的 .halo 與一個放大觸控範圍的透明 .hit。
import { characterSvg, CHAR_COLORS } from './characters.js';

const svg = (inner, cls = '') => `<svg class="${cls}" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
const halo = (cx, cy, r) => `<circle class="halo" cx="${cx}" cy="${cy}" r="${r}" fill="#ffd000"/>`;
const hit = (x, y, w, h) => `<rect class="hit" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>`;

const GREY_SKY = { day: ['#8fa3b5', '#c9d4dc'], dawn: ['#b9a7a3', '#d9cfc7'], dusk: ['#a08c94', '#cbbcb6'] };

// 天氣圖層：雲、雨、閃電、霧、風吹葉子。x0,y0,w,h 是窗戶範圍。
export function weatherLayer(wx, ph, x0, y0, w, h) {
  let out = '';
  const dark = ph === 'night';
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  if (wx.kind !== 'clear' && wx.kind !== 'fog') {
    const c = wet ? (dark ? '#3b4a6b' : '#7d8a99') : (dark ? '#4a5a80' : '#eef2f6');
    for (const [dx, dy, k] of [[0.15, 0.18, 1], [0.6, 0.12, 1.2], [0.4, 0.38, 0.9], [0.85, 0.32, 0.8]]) {
      const cx = x0 + w * dx, cy = y0 + h * dy, r = 30 * k;
      out += `<g class="wcloud" fill="${c}"><ellipse cx="${cx}" cy="${cy}" rx="${r * 1.7}" ry="${r * 0.8}"/><ellipse cx="${cx + r * 0.5}" cy="${cy - r * 0.5}" rx="${r}" ry="${r * 0.8}"/></g>`;
    }
  }
  if (wet) {
    let drops = '';
    const n = wx.kind === 'storm' ? 34 : 24;
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i * 37) % w), y = y0 + ((i * 53) % h) - h;
      drops += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 22}" style="animation-delay:-${((i * 0.13) % 0.7).toFixed(2)}s"/>`;
    }
    out += `<g class="rain" stroke="${dark ? '#9fb3ff' : '#ffffff'}" stroke-width="3" stroke-linecap="round" opacity=".8">${drops}</g>`;
  }
  if (wx.kind === 'storm') out += `<rect class="flash" x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/>`;
  if (wx.kind === 'fog') out += `<rect class="fog" x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#e6ebef"/>`;
  if (wx.windy) out += `<g class="leaf"><path d="M${x0} ${y0 + h * 0.5}c10-14 30-14 34 0c-10 12-26 12-34 0Z" fill="#7cc46a"/></g>`;
  return out;
}

const SKY = {
  night: ['#0d1b4a', '#25357a'],
  dawn: ['#ffb38a', '#ffe6b0'],
  day: ['#6ec6ff', '#c9efff'],
  dusk: ['#ff8f6b', '#ffd08a'],
};

export function skyColors(phase, wx) {
  const grey = wx.kind !== 'clear' && phase !== 'night';
  return { grey, colors: grey ? GREY_SKY[phase] : SKY[phase] };
}

function windowView(phase, wx) {
  const { grey, colors: [a, b] } = skyColors(phase, wx);
  const stars = phase === 'night'
    ? [[830, 140], [900, 190], [1010, 130], [1050, 220], [860, 260], [960, 300]]
      .map(([x, y], i) => `<circle class="star" style="animation-delay:${i * 0.4}s" cx="${x}" cy="${y}" r="4" fill="#fff"/>`).join('')
    : '';
  const showSun = wx.kind === 'clear' || wx.kind === 'cloudy';
  const body = !showSun ? '' : phase === 'night'
    ? `<circle cx="1000" cy="190" r="42" fill="#fff6c8"/><circle cx="1020" cy="176" r="38" fill="${a}"/>`
    : phase === 'day'
      ? `<circle class="sun" cx="1000" cy="180" r="44" fill="#ffd34d"/><circle cx="1000" cy="180" r="58" fill="#ffd34d" opacity=".3"/>`
      : `<circle cx="940" cy="350" r="60" fill="#fff0a8"/>`;
  const clouds = phase === 'night' || wx.kind !== 'clear' ? '' : `
    <g class="cloud" fill="#fff" opacity=".9"><ellipse cx="850" cy="250" rx="44" ry="20"/><ellipse cx="880" cy="238" rx="30" ry="20"/></g>`;
  return `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="winclip"><rect x="790" y="100" width="300" height="280" rx="24"/></clipPath>
    </defs>
    <g clip-path="url(#winclip)">
      <rect x="790" y="100" width="300" height="280" fill="url(#sky)"/>
      ${wx.kind === 'clear' || wx.kind === 'cloudy' ? stars : ''}${body}${clouds}
      <path d="M790 380V340Q860 300 940 336T1090 320V380Z" fill="${phase === 'night' ? '#16305a' : grey ? '#7fae74' : '#8fd67a'}"/>
      ${weatherLayer(wx, phase, 790, 100, 300, 280)}
    </g>
    <rect x="790" y="100" width="300" height="280" rx="24" fill="none" stroke="#fff" stroke-width="16"/>
    <path d="M940 100V380M790 240H1090" stroke="#fff" stroke-width="10"/>
    <rect x="770" y="376" width="340" height="20" rx="10" fill="#fff"/>`;
}

function backLayer(phase, wx) {
  let tiles = '';
  for (let x = 0; x <= 1200; x += 100) tiles += `<path d="M${x} 0V560" stroke="#c4e6ea" stroke-width="3"/>`;
  for (let y = 80; y < 560; y += 100) tiles += `<path d="M0 ${y}H1200" stroke="#c4e6ea" stroke-width="3"/>`;
  return svg(`
    <rect width="1200" height="900" fill="#dcf3f5"/>
    ${tiles}
    <rect y="560" width="1200" height="170" fill="#a9dbe6"/>
    <path d="M0 560H1200" stroke="#fff" stroke-width="10"/>
    <rect y="730" width="1200" height="170" fill="#f3e2c6"/>
    <path d="M0 730H1200" stroke="#e2cba6" stroke-width="6"/>
    <path d="M150 730L60 900M450 730L410 900M750 730L790 900M1050 730L1140 900" stroke="#e8d3b0" stroke-width="4"/>
    ${windowView(phase, wx)}
    ${wx.kind === 'rain' || wx.kind === 'storm' ? '<g class="drips" fill="#cfe8f5"><circle cx="840" cy="170" r="5"/><circle cx="1000" cy="300" r="4"/><circle cx="900" cy="260" r="6"/><circle cx="1050" cy="150" r="4"/></g>' : ''}
    <rect x="322" y="82" width="336" height="316" rx="40" fill="#fff"/>
    <rect x="338" y="98" width="304" height="284" rx="28" fill="#d6f2fb"/>
    <path d="M370 350L470 120M410 360L490 180" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".7"/>
  `);
}

function midLayer() {
  return svg(`
    <ellipse cx="490" cy="772" rx="290" ry="18" fill="#000" opacity=".12"/>
    <rect x="250" y="536" width="480" height="230" rx="18" fill="#7cc4d8"/>
    <rect x="272" y="566" width="206" height="180" rx="12" fill="#93d3e4"/>
    <rect x="502" y="566" width="206" height="180" rx="12" fill="#93d3e4"/>
    <circle cx="456" cy="656" r="9" fill="#fff"/><circle cx="524" cy="656" r="9" fill="#fff"/>
    <rect x="228" y="498" width="524" height="44" rx="20" fill="#fff"/>
    <ellipse cx="490" cy="506" rx="120" ry="20" fill="#e3f4f8"/>

    <g class="prop" data-prop="cup">
      ${halo(300, 452, 70)}
      <path d="M266 414H334L324 498H276Z" fill="#ffd34d"/>
      <path d="M266 414H334L332 432H268Z" fill="#ffe58a"/>
      <path class="cup-water" d="M270 440H330L324 498H276Z" fill="#8fd8f5" opacity=".0"/>
      ${hit(240, 380, 120, 130)}
    </g>

    <g class="prop" data-prop="brush">
      ${halo(388, 420, 80)}
      <rect x="366" y="456" width="44" height="44" rx="10" fill="#c7b7f2"/>
      <rect x="380" y="352" width="16" height="130" rx="8" fill="#ff7fa8"/>
      <rect x="372" y="318" width="32" height="46" rx="8" fill="#fff" stroke="#9fd8ee" stroke-width="4"/>
      <path d="M380 326v30M388 326v30M396 326v30" stroke="#9fd8ee" stroke-width="3"/>
      <path class="paste-blob" d="M370 318Q376 300 388 308Q400 296 406 318Z" fill="#7be0c3"/>
      ${hit(340, 300, 100, 210)}
    </g>

    <g class="prop" data-prop="faucet">
      ${halo(490, 440, 70)}
      <path d="M476 500V440Q476 404 512 404H536V426H514Q498 426 498 442V500Z" fill="#b9c6d2"/>
      <rect x="524" y="400" width="18" height="32" rx="6" fill="#9aa9b8"/>
      <circle cx="466" cy="470" r="12" fill="#5fc3e8"/>
      ${hit(440, 380, 110, 125)}
    </g>

    <g class="prop" data-prop="paste">
      ${halo(610, 440, 76)}
      <path d="M588 404H632L626 498H594Z" fill="#fff" stroke="#e3e9ee" stroke-width="3"/>
      <rect x="590" y="430" width="40" height="34" fill="#ff6b5c"/>
      <circle cx="610" cy="447" r="9" fill="#fff"/>
      <rect x="598" y="382" width="24" height="24" rx="5" fill="#ff6b5c"/>
      ${hit(560, 366, 100, 140)}
    </g>

    <g class="prop" data-prop="soap">
      ${halo(696, 468, 62)}
      <ellipse cx="696" cy="498" rx="48" ry="9" fill="#cfe3ea"/>
      <rect x="660" y="458" width="72" height="38" rx="16" fill="#ff9fc4"/>
      <path d="M674 470h30" stroke="#ffd0e3" stroke-width="7" stroke-linecap="round"/>
      <circle cx="724" cy="448" r="9" fill="#fff" opacity=".9"/><circle cx="738" cy="434" r="6" fill="#fff" opacity=".9"/>
      ${hit(650, 410, 100, 100)}
    </g>

    <g class="prop" data-prop="towel">
      ${halo(940, 540, 100)}
      <circle cx="940" cy="440" r="26" fill="none" stroke="#b9c6d2" stroke-width="10"/>
      <circle cx="940" cy="416" r="10" fill="#9aa9b8"/>
      <path d="M886 456H994V628Q940 646 886 628Z" fill="#7fdc9b"/>
      <path d="M886 500H994M886 528H994" stroke="#fff" stroke-width="10"/>
      <path d="M886 610Q940 628 994 610" stroke="#5cc47e" stroke-width="8" fill="none"/>
      ${hit(866, 410, 148, 240)}
    </g>
  `);
}

function charLayer(charId) {
  return svg(characterSvg(charId, { x: 34, y: 436, s: 1.14 }), 'char-layer');
}

export function mainView(charId, phase, wx) {
  return `
    <div class="layer back" style="--d:0.4">${backLayer(phase, wx)}</div>
    <div class="layer mid" style="--d:1">${midLayer()}</div>
    <div class="layer front" style="--d:1.8">${charLayer(charId)}</div>
    <div class="light ${phase}"></div>`;
}

// ---------- 刷牙特寫：大嘴巴 ----------
export const TOOTH_COUNT = 12;
const GERM_ON = new Set([0, 3, 5, 7, 8, 10]);

function tooth(i) {
  const row = i < 6 ? 0 : 1;
  const col = i % 6;
  const x = 258 + col * 115;
  const y = row === 0 ? 236 : 566;
  const w = 104, h = 150;
  const cx = x + w / 2, cy = y + h / 2;
  const germ = GERM_ON.has(i) ? `
    <g class="germ" style="animation-delay:${(i % 4) * 0.2}s">
      <circle cx="${cx}" cy="${cy}" r="30" fill="${i % 2 ? '#9b7be0' : '#7bc96f'}"/>
      <circle cx="${cx - 11}" cy="${cy - 6}" r="7" fill="#fff"/><circle cx="${cx + 11}" cy="${cy - 6}" r="7" fill="#fff"/>
      <circle cx="${cx - 10}" cy="${cy - 5}" r="3.4" fill="#222"/><circle cx="${cx + 12}" cy="${cy - 5}" r="3.4" fill="#222"/>
      <path d="M${cx - 12} ${cy + 16}Q${cx} ${cy + 6} ${cx + 12} ${cy + 16}" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>
    </g>` : '';
  return `
    <g class="tooth" data-i="${i}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#fff"/>
      <rect class="t-dirt" x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#d2a93a"/>
      ${germ}
      <path class="t-shine" d="M${cx} ${cy - 34}l9 25l25 9l-25 9l-9 25l-9-25l-25-9l25-9Z" fill="#fff3a6"/>
      <rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" fill="transparent"/>
    </g>`;
}

export function mouthView(charId) {
  const c = CHAR_COLORS[charId];
  let teeth = '';
  for (let i = 0; i < TOOTH_COUNT; i++) teeth += tooth(i);
  return svg(`
    <rect width="1200" height="900" fill="${c.skin}"/>
    <circle cx="400" cy="70" r="74" fill="#fff"/><circle cx="800" cy="70" r="74" fill="#fff"/>
    <circle cx="410" cy="84" r="36" fill="#1d2433"/><circle cx="810" cy="84" r="36" fill="#1d2433"/>
    <circle cx="424" cy="70" r="12" fill="#fff"/><circle cx="824" cy="70" r="12" fill="#fff"/>
    <rect x="150" y="160" width="900" height="640" rx="190" fill="#f2738a"/>
    <rect x="192" y="200" width="816" height="560" rx="150" fill="#7a1f2e"/>
    <ellipse cx="600" cy="478" rx="250" ry="70" fill="#f58ea0"/>
    <path d="M600 420V520" stroke="#e0667c" stroke-width="8" stroke-linecap="round"/>
    ${teeth}
  `, 'mouth-art');
}

// ---------- 洗手特寫 ----------
function hand(cx, cy, c, flip) {
  const s = flip ? -1 : 1;
  const dirt = [[-34, -20, 20], [26, 30, 24], [-10, 54, 16], [36, -44, 15]]
    .map(([dx, dy, r]) => `<circle class="dirt" cx="${cx + s * dx}" cy="${cy + dy}" r="${r}" fill="#8a5a2b"/>`).join('');
  return `
    <g class="hand">
      <ellipse cx="${cx - 62}" cy="${cy - 92}" rx="26" ry="44" fill="${c.limb}"/>
      <ellipse cx="${cx}" cy="${cy - 116}" rx="28" ry="50" fill="${c.limb}"/>
      <ellipse cx="${cx + 62}" cy="${cy - 92}" rx="26" ry="44" fill="${c.limb}"/>
      <ellipse cx="${cx}" cy="${cy + 10}" rx="104" ry="112" fill="${c.limb}"/>
      <ellipse cx="${cx}" cy="${cy + 26}" rx="52" ry="48" fill="${c.pad}" opacity=".55"/>
      <rect x="${cx - 56}" y="${cy + 100}" width="112" height="240" fill="${c.limb}"/>
      ${dirt}
      <ellipse class="film" cx="${cx}" cy="${cy - 6}" rx="100" ry="118" fill="#fff"/>
      <path class="h-shine" d="M${cx + s * 60} ${cy - 150}l8 22l22 8l-22 8l-8 22l-8-22l-22-8l22-8Z" fill="#fff3a6"/>
    </g>`;
}

export function handsView(charId) {
  const c = CHAR_COLORS[charId];
  let tiles = '';
  for (let x = 0; x <= 1200; x += 120) tiles += `<path d="M${x} 0V420" stroke="#c4e6ea" stroke-width="3"/>`;
  for (let y = 60; y < 420; y += 120) tiles += `<path d="M0 ${y}H1200" stroke="#c4e6ea" stroke-width="3"/>`;
  return svg(`
    <rect width="1200" height="900" fill="#dcf3f5"/>${tiles}
    <rect y="420" width="1200" height="480" fill="#fff"/>
    <ellipse cx="600" cy="720" rx="470" ry="250" fill="#e3f4f8"/>
    <ellipse cx="600" cy="740" rx="400" ry="200" fill="#d2ecf3"/>
    <circle cx="600" cy="800" r="26" fill="#9aa9b8"/><circle cx="600" cy="800" r="14" fill="#6b7a88"/>

    <rect class="stream" x="578" y="270" width="44" height="520" rx="22" fill="#8fd8f5"/>
    <g class="prop" data-prop="faucet">
      ${halo(548, 250, 170)}
      <path d="M440 430V200Q440 90 550 90H560Q650 90 650 200V262H570V200Q570 160 550 160Q500 160 500 200V430Z" fill="#b9c6d2"/>
      <rect x="560" y="250" width="100" height="34" rx="14" fill="#9aa9b8"/>
      <rect x="420" y="410" width="100" height="26" rx="10" fill="#9aa9b8"/>
      <circle cx="470" cy="330" r="34" fill="#5fc3e8"/><path d="M470 304v52M444 330h52" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
      ${hit(410, 50, 310, 370)}
    </g>

    <g class="prop" data-prop="soap">
      ${halo(170, 520, 120)}
      <ellipse cx="170" cy="566" rx="120" ry="22" fill="#cfe3ea"/>
      <rect x="80" y="466" width="180" height="96" rx="40" fill="#ff9fc4"/>
      <path d="M116 498h76" stroke="#ffd0e3" stroke-width="16" stroke-linecap="round"/>
      <circle cx="250" cy="446" r="20" fill="#fff" opacity=".9"/><circle cx="282" cy="412" r="13" fill="#fff" opacity=".9"/>
      ${hit(40, 380, 270, 220)}
    </g>

    <g class="prop" data-prop="towel">
      ${halo(1040, 300, 150)}
      <rect x="930" y="110" width="220" height="22" rx="11" fill="#b9c6d2"/>
      <path d="M956 120H1124V470Q1040 500 956 470Z" fill="#7fdc9b"/>
      <path d="M956 200H1124M956 250H1124" stroke="#fff" stroke-width="18"/>
      <path d="M956 440Q1040 470 1124 440" stroke="#5cc47e" stroke-width="12" fill="none"/>
      ${hit(920, 90, 240, 420)}
    </g>

    <g class="prop paws" data-prop="hands">
      ${halo(600, 600, 250)}
      ${hand(480, 600, c, false)}
      ${hand(720, 600, c, true)}
      ${hit(340, 420, 520, 400)}
    </g>
  `, 'hands-art');
}

// 牙刷游標
export const BRUSH_CURSOR = `<svg viewBox="0 0 160 160" width="160" height="160">
  <rect x="70" y="50" width="20" height="108" rx="10" fill="#ff7fa8" transform="rotate(35 80 80)"/>
  <g transform="rotate(35 80 80)"><rect x="60" y="6" width="40" height="56" rx="10" fill="#fff" stroke="#9fd8ee" stroke-width="5"/>
  <path d="M70 16v36M80 16v36M90 16v36" stroke="#9fd8ee" stroke-width="4"/>
  <path d="M58 8Q66 -12 80 -2Q94 -14 102 8Z" fill="#7be0c3"/></g></svg>`;

// 好寶寶印章：原創圖案（100x100，用 currentColor 上色）、印泥顏色、蓋章原因圖示。
// class="hole" 的部分是鏤空，用紙的顏色填。

const sunRays = Array.from({ length: 8 }, (_, i) =>
  `<rect x="45" y="2" width="10" height="20" rx="5" transform="rotate(${i * 45} 50 50)"/>`).join('');
const petals = Array.from({ length: 5 }, (_, i) => {
  const a = (i * 72 - 90) * Math.PI / 180;
  return `<circle cx="${(50 + Math.cos(a) * 25).toFixed(1)}" cy="${(50 + Math.sin(a) * 25).toFixed(1)}" r="18"/>`;
}).join('');

export const SHAPES = {
  star: `<path d="M50 4L62 35L95 37L70 58L79 92L50 73L21 92L30 58L5 37L38 35Z"/>`,
  heart: `<path d="M50 90C20 68 5 52 5 33C5 18 16 7 30 7C39 7 46 12 50 20C54 12 61 7 70 7C84 7 95 18 95 33C95 52 80 68 50 90Z"/>`,
  dino: `<path d="M10 72C10 54 26 44 44 46H60C66 34 64 20 74 14C83 9 96 13 96 24C96 31 90 33 84 33H79C77 44 75 54 72 62L78 88H66L62 70H44L42 88H30V72C22 74 14 78 4 76C7 74 10 74 10 72Z"/>
    <path d="M24 47L29 35L35 46L40 32L46 45L51 35L56 46Z"/><circle class="hole" cx="85" cy="22" r="3.5"/>`,
  rocket: `<path d="M50 3C67 18 71 42 66 68H34C29 42 33 18 50 3Z"/><path d="M34 50L15 74L34 71Z"/><path d="M66 50L85 74L66 71Z"/>
    <path d="M40 71H60L56 84H44Z"/><path d="M43 87Q50 101 57 87Z"/><circle class="hole" cx="50" cy="34" r="9"/>`,
  rainbow: `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"><path d="M8 80A42 42 0 0 1 92 80"/><path d="M23 80A27 27 0 0 1 77 80"/><path d="M38 80A12 12 0 0 1 62 80"/></g>`,
  crown: `<path d="M10 74L5 26L30 48L50 14L70 48L95 26L90 74Z"/><rect x="10" y="78" width="80" height="14" rx="5"/>
    <circle class="hole" cx="50" cy="56" r="7"/><circle class="hole" cx="28" cy="62" r="5"/><circle class="hole" cx="72" cy="62" r="5"/>`,
  cat: `<path d="M17 32L21 5L41 22Q50 20 59 22L79 5L83 32Q94 46 89 64Q81 92 50 92Q19 92 11 64Q6 46 17 32Z"/>
    <ellipse class="hole" cx="35" cy="52" rx="6" ry="8"/><ellipse class="hole" cx="65" cy="52" rx="6" ry="8"/><path class="hole" d="M44 66H56L50 73Z"/>`,
  sun: `<circle cx="50" cy="50" r="23"/>${sunRays}<circle class="hole" cx="42" cy="46" r="3.5"/><circle class="hole" cx="58" cy="46" r="3.5"/>
    <path class="hole" d="M40 56Q50 66 60 56Q50 61 40 56Z"/>`,
  flower: `${petals}<circle class="hole" cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="7"/>`,
  car: `<path d="M4 66V51L19 47L31 26H67L80 47L96 51V66Z"/><circle cx="27" cy="71" r="13"/><circle cx="73" cy="71" r="13"/>
    <rect class="hole" x="37" y="31" width="25" height="15" rx="3"/><circle class="hole" cx="27" cy="71" r="5"/><circle class="hole" cx="73" cy="71" r="5"/>`,
  butterfly: `<path d="M48 50C40 18 8 8 6 30C4 45 24 53 48 53Z"/><path d="M52 50C60 18 92 8 94 30C96 45 76 53 52 53Z"/>
    <path d="M48 55C29 57 12 66 19 80C26 93 45 77 48 59Z"/><path d="M52 55C71 57 88 66 81 80C74 93 55 77 52 59Z"/>
    <rect x="45" y="28" width="10" height="56" rx="5"/>
    <path d="M47 31Q40 13 32 9M53 31Q60 13 68 9" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  moon: `<path d="M62 6A44 44 0 1 0 94 70A35 35 0 1 1 62 6Z"/><circle class="hole" cx="40" cy="58" r="4"/>`,
};
export const SHAPE_IDS = Object.keys(SHAPES);

export const COLORS = {
  red: '#e5484d',
  orange: '#f0811f',
  yellow: '#e2a900',
  green: '#2ea05a',
  blue: '#2f7fe0',
  purple: '#8e4ec6',
  pink: '#ec5fa0',
};
export const COLOR_IDS = Object.keys(COLORS);

// 印出來的章（有印泥質感）。rot 是旋轉角度，讓每次蓋的都有點不一樣。
export function impressionSvg(shape, color, size = 100, rot = 0, paper = '#fffdf6') {
  return `<svg class="impression" viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${COLORS[color] || color};--paper:${paper}">
    <g transform="rotate(${rot} 50 50)" filter="url(#ink)" opacity=".9" fill="currentColor">${SHAPES[shape] || ''}</g></svg>`;
}

// 乾淨的圖案（選擇畫面用）
export function shapeSvg(shape, color, size = 100, paper = '#fff') {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${COLORS[color] || color};--paper:${paper}">
    <g fill="currentColor">${SHAPES[shape] || ''}</g></svg>`;
}

// 印章本體（木頭握把＋有顏色的章面）
export function stampToolSvg(shape, color, size = 200) {
  const c = COLORS[color] || color;
  return `<svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}">
    <ellipse cx="100" cy="212" rx="70" ry="8" fill="#000" opacity=".12"/>
    <rect x="34" y="150" width="132" height="44" rx="10" fill="${c}"/>
    <rect x="28" y="128" width="144" height="30" rx="10" fill="#b9824f"/>
    <rect x="28" y="128" width="144" height="10" rx="5" fill="#d29a62"/>
    <path d="M84 128V84H116V128Z" fill="#b9824f"/>
    <circle cx="100" cy="58" r="44" fill="#d29a62"/>
    <circle cx="100" cy="58" r="44" fill="none" stroke="#b9824f" stroke-width="6"/>
    <g transform="translate(70 28) scale(.6)" style="color:${c};--paper:#d29a62" fill="currentColor">${SHAPES[shape] || ''}</g>
  </svg>`;
}

// 共用的印泥濾鏡，整份文件放一次
export function ensureInkFilter() {
  if (document.getElementById('ink')) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.style.position = 'absolute';
  defs.innerHTML = `<defs><filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs>`;
  document.body.appendChild(defs);
}

// ---------- 蓋章原因（家長點選；圖示 80x80） ----------
export const REASONS = {
  teeth: { label: '刷牙', icon: `<rect x="34" y="30" width="12" height="44" rx="6" fill="#ff7fa8" transform="rotate(30 40 52)"/><rect x="44" y="8" width="24" height="28" rx="6" fill="#fff" stroke="#6cc7ea" stroke-width="4" transform="rotate(30 56 22)"/>` },
  eat: { label: '吃飯', icon: `<path d="M8 40H72Q70 70 40 72Q10 70 8 40Z" fill="#ffb74d"/><path d="M14 40Q40 22 66 40Z" fill="#fff"/><path d="M50 6L62 38M60 4L68 38" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/>` },
  toys: { label: '收玩具', icon: `<rect x="8" y="36" width="64" height="36" rx="6" fill="#5fc3e8"/><rect x="16" y="14" width="22" height="22" rx="4" fill="#ffd34d"/><circle cx="54" cy="24" r="12" fill="#ff6b5c"/><path d="M8 46H72" stroke="#3aa6d0" stroke-width="4"/>` },
  sleep: { label: '睡覺', icon: `<path d="M48 8A30 30 0 1 0 72 54A24 24 0 1 1 48 8Z" fill="#ffd34d"/><path d="M14 14H28L14 30H28" fill="none" stroke="#7a8cff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` },
  polite: { label: '有禮貌', icon: `<circle cx="34" cy="44" r="26" fill="#ffd9b8"/><circle cx="26" cy="40" r="3.5" fill="#333"/><circle cx="42" cy="40" r="3.5" fill="#333"/><path d="M24 52Q34 62 44 52" fill="none" stroke="#c9462c" stroke-width="4" stroke-linecap="round"/><path d="M52 8H76V30H62L54 38V30H52Z" fill="#fff" stroke="#ff7fa8" stroke-width="4" stroke-linejoin="round"/><path d="M60 19H68" stroke="#ff7fa8" stroke-width="4" stroke-linecap="round"/>` },
  help: { label: '幫忙', icon: `<rect x="36" y="4" width="8" height="46" rx="4" fill="#b9824f"/><path d="M22 48H58L66 76H14Z" fill="#ffd34d"/><path d="M26 56V72M40 56V72M54 56V72" stroke="#e0a800" stroke-width="4"/>` },
  share: { label: '分享', icon: `<path d="M40 70C22 56 10 46 10 32C10 22 18 14 28 14C34 14 38 18 40 22C42 18 46 14 52 14C62 14 70 22 70 32C70 46 58 56 40 70Z" fill="#ff7fa8"/><path d="M26 34H54M46 26L54 34L46 42" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` },
  other: { label: '其他', icon: `<path d="M40 4L50 28L76 30L56 47L63 74L40 59L17 74L24 47L4 30L30 28Z" fill="#ffd34d" stroke="#e0a800" stroke-width="3" stroke-linejoin="round"/>` },
};

export function reasonIcon(id, size = 80) {
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}">${REASONS[id]?.icon || ''}</svg>`;
}

// 首頁：明星總動員歡樂派對。布幕、標題、派對布置、十位明星排排站。
import { characterSvg } from './characters.js';

export const OP_CAST = ['dudu', 'kiki', 'bobo', 'mian', 'gugu', 'doudou', 'pupu', 'tiaotiao', 'yuanyuan', 'lili'];
// 每位明星進場的聲音
export const OP_SND = { dudu: 'squeak', kiki: 'boing', bobo: 'drum', mian: 'baa', gugu: 'ding', doudou: 'boing', pupu: 'horn', tiaotiao: 'whoosh', yuanyuan: 'trumpet', lili: 'coin' };

export function opBack() {
  return `<svg viewBox="0 0 1200 900">
    <defs>
      <radialGradient id="opwall" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#ffe3f1"/><stop offset=".55" stop-color="#ffb8d9"/><stop offset="1" stop-color="#b98cf0"/></radialGradient>
      <linearGradient id="opfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#a8713e"/></linearGradient>
      <radialGradient id="opspot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#opwall)"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M600 -40L${-200 + i * 145} 900" stroke="#fff" stroke-width="34" opacity=".09"/>`).join('')}
    ${Array.from({ length: 26 }, (_, i) => `<circle class="tw" style="animation-delay:${(i % 6) * 0.2}s" cx="${(i * 173) % 1200}" cy="${60 + ((i * 89) % 560)}" r="${3 + (i % 3)}" fill="#fff"/>`).join('')}
    <path d="M0 690Q600 640 1200 690V900H0Z" fill="url(#opfloor)"/>
    <path d="M0 690Q600 640 1200 690" stroke="#ffd34d" stroke-width="10" fill="none"/>
    <ellipse class="op-spot s1" cx="360" cy="780" rx="260" ry="60" fill="url(#opspot)"/>
    <ellipse class="op-spot s2" cx="840" cy="780" rx="260" ry="60" fill="url(#opspot)"/>
  </svg>`;
}

const drape = (flip) => `<svg viewBox="0 0 640 900" preserveAspectRatio="none">
  <path d="${flip ? 'M640 0H0V900H640Z' : 'M0 0H640V900H0Z'}" fill="#c8202a"/>
  ${Array.from({ length: 7 }, (_, i) => `<path d="M${40 + i * 90} 0Q${70 + i * 90} 450 ${40 + i * 90} 900" stroke="${i % 2 ? '#a0161f' : '#e33a44'}" stroke-width="22" fill="none"/>`).join('')}
  <path d="M0 0H640V60Q320 100 0 60Z" fill="#a0161f"/>
  <path d="M${flip ? 20 : 600} 0V900" stroke="#ffd34d" stroke-width="12"/>
</svg>`;
export const CURTAIN_L = drape(false);
export const CURTAIN_R = drape(true);

// 開場按鈕：發亮的大星星，戴派對帽
export const START_STAR = `<svg viewBox="0 0 200 200" width="260" height="260" overflow="visible">
  <path d="M100 18L124 72L182 76L138 114L152 172L100 140L48 172L62 114L18 76L76 72Z" fill="#ffd34d" stroke="#ff9f1c" stroke-width="8" stroke-linejoin="round"/>
  <circle cx="84" cy="102" r="8" fill="#5a2a6a"/><circle cx="116" cy="102" r="8" fill="#5a2a6a"/><circle cx="87" cy="99" r="3" fill="#fff"/><circle cx="119" cy="99" r="3" fill="#fff"/>
  <path d="M84 124Q100 140 116 124" stroke="#5a2a6a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <circle cx="70" cy="122" r="7" fill="#ff8fb0"/><circle cx="130" cy="122" r="7" fill="#ff8fb0"/>
  <path d="M84 30L100 -26L116 30Z" fill="#5fa8e8" stroke="#3a7bd5" stroke-width="4" stroke-linejoin="round"/><path d="M90 10L110 4M88 22L112 16" stroke="#fff" stroke-width="4"/><circle cx="100" cy="-28" r="9" fill="#ff5c8a"/>
</svg>`;

// 有字的標題：每個字不同顏色，白色描邊，一個一個跳出來
const LOGO_COLORS = ['#ff4d6d', '#ff9f1c', '#ffcc00', '#2ec4b6', '#3a86ff', '#8338ec', '#ff5c8a', '#06d6a0', '#ff7b00'];
export function logoSvg() {
  const line = (txt, y, size, x0, gap, off) => [...txt].map((ch, i) => {
    const x = x0 + i * gap;
    const c = LOGO_COLORS[(i + off) % LOGO_COLORS.length];
    return `<g class="lg-ch" style="animation-delay:${((i + off) * 0.09).toFixed(2)}s;transform-origin:${x}px ${y}px">
      <text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" stroke="#5a2a6a" stroke-width="${size * 0.2}" stroke-linejoin="round" fill="#5a2a6a">${ch}</text>
      <text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" stroke="#fff" stroke-width="${size * 0.1}" stroke-linejoin="round" fill="${c}" paint-order="stroke">${ch}</text></g>`;
  }).join('');
  const star = (x, y, r, c, d) => `<path class="lg-star" style="animation-delay:${d}s;transform-origin:${x}px ${y}px" d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.3}L${x + r} ${y - r * 0.24}L${x + r * 0.44} ${y + r * 0.18}L${x + r * 0.6} ${y + r}L${x} ${y + r * 0.56}L${x - r * 0.6} ${y + r}L${x - r * 0.44} ${y + r * 0.18}L${x - r} ${y - r * 0.24}L${x - r * 0.28} ${y - r * 0.3}Z" fill="${c}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 800 260" width="800" height="260" overflow="visible" font-family="'PingFang TC','Heiti TC','Noto Sans TC','Microsoft JhengHei',sans-serif" font-weight="900">
    ${star(40, 60, 34, '#ffd34d', 0.9)}${star(762, 70, 30, '#ff8fb0', 1.0)}${star(120, 210, 22, '#7be0ff', 1.1)}${star(690, 214, 24, '#ffd34d', 1.2)}
    ${line('明星總動員', 120, 118, 160, 120, 0)}
    ${line('歡樂派對', 236, 104, 220, 120, 5)}
  </svg>`;
}

// 派對布置，依序彈出來
const flag = (x, y, c, r) => `<path d="M${x} ${y}L${x + 44} ${y + 4}L${x + 20} ${y + 56}Z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`;
const balloon = (x, y, c, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 62Q8 110 -4 160" stroke="#999" stroke-width="2.5" fill="none"/><ellipse cx="0" cy="0" rx="44" ry="54" fill="${c}"/><path d="M-6 54L6 54L0 64Z" fill="${c}"/><ellipse cx="-16" cy="-20" rx="10" ry="16" fill="#fff" opacity=".45"/></g>`;
export const DECOR = [
  {
    cls: 'bunting', pos: [0, 0, 1200, 140], svg: `<svg viewBox="0 0 1200 140">
      <path d="M0 20Q300 110 600 20Q900 110 1200 20" stroke="#7a5230" stroke-width="4" fill="none"/>
      ${Array.from({ length: 22 }, (_, i) => { const t = (i + 0.5) / 22; const x = t * 1200; const lt = (t % 0.5) * 2; const y = 20 + 90 * 4 * lt * (1 - lt) * 0.92; return flag(x - 22, y - 4, LOGO_COLORS[i % LOGO_COLORS.length], 0); }).join('')}</svg>`,
  },
  {
    cls: 'balloons-l', pos: [0, 140, 220, 420], svg: `<svg viewBox="0 0 220 420" overflow="visible">${balloon(70, 90, '#ff4d6d')}${balloon(150, 60, '#ffcc00', 0.9)}${balloon(110, 170, '#3a86ff', 1.05)}${balloon(40, 220, '#06d6a0', 0.85)}</svg>`,
  },
  {
    cls: 'balloons-r', pos: [980, 140, 220, 420], svg: `<svg viewBox="0 0 220 420" overflow="visible">${balloon(150, 90, '#8338ec')}${balloon(70, 60, '#ff9f1c', 0.9)}${balloon(110, 170, '#ff5c8a', 1.05)}${balloon(180, 220, '#2ec4b6', 0.85)}</svg>`,
  },
  {
    cls: 'disco', pos: [540, -10, 120, 130], svg: `<svg viewBox="0 0 120 130" overflow="visible"><path d="M60 0V34" stroke="#888" stroke-width="4"/><circle cx="60" cy="78" r="44" fill="#c9d3e0"/>
      ${Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect x="${24 + c * 12}" y="${44 + r * 13}" width="10" height="11" fill="${(r + c) % 3 ? '#e8eef6' : '#9fb3c8'}"/>`).join('')).join('')}
      <circle cx="44" cy="62" r="6" fill="#fff"/></svg>`,
  },
  {
    cls: 'streamer-l', pos: [190, 0, 90, 300], svg: `<svg viewBox="0 0 90 300"><path d="M40 0Q80 50 40 100Q0 150 40 200Q80 250 40 300" stroke="#ff8fb0" stroke-width="12" fill="none"/><path d="M60 0Q20 60 60 120Q100 180 60 240" stroke="#7be0ff" stroke-width="10" fill="none"/></svg>`,
  },
  {
    cls: 'streamer-r', pos: [920, 0, 90, 300], svg: `<svg viewBox="0 0 90 300"><path d="M50 0Q10 50 50 100Q90 150 50 200Q10 250 50 300" stroke="#ffd34d" stroke-width="12" fill="none"/><path d="M30 0Q70 60 30 120Q-10 180 30 240" stroke="#b28cff" stroke-width="10" fill="none"/></svg>`,
  },
  {
    cls: 'gifts', pos: [10, 560, 220, 170], svg: `<svg viewBox="0 0 220 170">
      <rect x="10" y="70" width="100" height="90" rx="6" fill="#3a86ff"/><rect x="52" y="70" width="16" height="90" fill="#ffd34d"/><rect x="4" y="58" width="112" height="22" rx="5" fill="#5fa8ff"/><path d="M60 58Q36 26 30 50Q40 62 60 58Q84 26 90 50Q80 62 60 58Z" fill="#ffd34d"/>
      <rect x="122" y="100" width="80" height="62" rx="6" fill="#ff4d6d"/><rect x="154" y="100" width="14" height="62" fill="#fff"/><rect x="116" y="90" width="92" height="18" rx="5" fill="#ff7a90"/><path d="M161 90Q144 66 138 84Q146 94 161 90Q178 66 184 84Q176 94 161 90Z" fill="#fff"/>
    </svg>`,
  },
  {
    cls: 'cake', pos: [970, 520, 220, 210], svg: `<svg viewBox="0 0 220 210">
      <rect x="20" y="150" width="180" height="16" rx="6" fill="#c8915a"/><path d="M60 166V210M160 166V210" stroke="#a8743f" stroke-width="10"/>
      <rect x="44" y="96" width="132" height="56" rx="10" fill="#ffb3c7"/><path d="M44 110Q66 126 88 110Q110 126 132 110Q154 126 176 110" stroke="#fff" stroke-width="8" fill="none"/>
      <rect x="64" y="56" width="92" height="44" rx="10" fill="#fff3d6"/><path d="M64 70Q84 82 110 70Q136 82 156 70" stroke="#ff8fb0" stroke-width="7" fill="none"/>
      ${[86, 110, 134].map((x, i) => `<rect x="${x - 4}" y="30" width="8" height="28" fill="${['#3a86ff', '#ffcc00', '#06d6a0'][i]}"/><path class="flame" d="M${x} 14Q${x + 8} 24 ${x} 32Q${x - 8} 24 ${x} 14Z" fill="#ff9f1c"/>`).join('')}
    </svg>`,
  },
];

// 拉炮（彩紙從兩邊噴出來）
export const POPPER = (flip) => `<svg viewBox="0 0 120 120" width="120" height="120"${flip ? ' style="transform:scaleX(-1)"' : ''}><path d="M14 106L44 36L84 76Z" fill="#ffcc00" stroke="#ff9f1c" stroke-width="5" stroke-linejoin="round"/><path d="M28 74L58 60M22 90L70 70" stroke="#ff4d6d" stroke-width="6"/></svg>`;

// 角色（站在舞台上）
export function opCast() {
  return OP_CAST.map((id, i) => `<div class="op-char${i < 5 ? ' from-l' : ' from-r'}" data-id="${id}" style="left:${100 + i * 100}px;--d:${(i % 4) * 0.15}s"><div class="op-dance"><svg viewBox="0 0 240 320" width="108" height="144">${characterSvg(id)}</svg></div></div>`).join('');
}

// 飄落的彩紙
export function confettiRain() {
  return Array.from({ length: 28 }, (_, i) => `<i style="left:${(i * 43) % 1200}px;background:${LOGO_COLORS[i % LOGO_COLORS.length]};animation-delay:${(i * 0.37) % 6}s;animation-duration:${5 + (i % 4)}s"></i>`).join('');
}

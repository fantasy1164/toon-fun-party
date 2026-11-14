// 生日派對：房間、裝飾、蛋糕、蠟燭、禮物盒、做卡片。舞台 1200x900。
import { characterSvg, avatarSvg } from './characters.js';

export const PARTY_CHARS = [
  ['kiki', 30, 330], ['dudu', 230, 340], ['gugu', 506, 250], ['bobo', 800, 330], ['mian', 1000, 340],
];

export function partyRoom(ph) {
  const night = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${night ? '#c9b8e8' : '#ffe9f2'}"/>
    ${[...Array(13)].map((_, i) => `<rect x="${i * 100}" y="0" width="50" height="560" fill="#fff" opacity=".35"/>`).join('')}
    <rect y="560" width="1200" height="340" fill="${night ? '#a07a5a' : '#e0b07a'}"/>
    ${[600, 660, 740, 830].map((y) => `<rect y="${y}" width="1200" height="4" fill="#c8915a"/>`).join('')}
    ${[[170, 150], [600, 70], [1030, 150], [600, 210]].map(([x, y], i) => `<circle class="hook" data-i="${i}" cx="${x}" cy="${y}" r="10" fill="#d0b0c0"/>`).join('')}
  </svg>`;
}

// 四樣裝飾，各掛到一個鉤子
export const DECOR = {
  red: { spot: 0, w: 220, h: 260, svg: `<svg viewBox="0 0 220 260" width="220" height="260">
    ${[[60, 70, '#e5484d'], [120, 50, '#ffc400'], [170, 80, '#5fa8e8']].map(([x, y, c]) => `<path d="M${x} ${y + 50}Q${x + 6} ${y + 120} 110 230" stroke="#999" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y}" rx="40" ry="50" fill="${c}"/><ellipse cx="${x - 14}" cy="${y - 18}" rx="8" ry="14" fill="#fff" opacity=".5"/>`).join('')}</svg>` },
  flags: { spot: 1, w: 560, h: 120, svg: `<svg viewBox="0 0 560 120" width="560" height="120"><path d="M10 20Q280 70 550 20" stroke="#8a5a2b" stroke-width="4" fill="none"/>
    ${[...Array(9)].map((_, i) => { const x = 30 + i * 62; const y = 22 + Math.sin((i + 0.5) / 9 * Math.PI) * 24; return `<path d="M${x} ${y}L${x + 44} ${y + 2}L${x + 22} ${y + 60}Z" fill="${['#e5484d', '#ffc400', '#3fbf7f', '#5fa8e8', '#c77dff'][i % 5]}"/>`; }).join('')}</svg>` },
  blue: { spot: 2, w: 220, h: 260, svg: `<svg viewBox="0 0 220 260" width="220" height="260">
    ${[[60, 80, '#3fbf7f'], [110, 50, '#ff9fc4'], [165, 74, '#c77dff']].map(([x, y, c]) => `<path d="M${x} ${y + 50}Q${x + 6} ${y + 120} 110 230" stroke="#999" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y}" rx="40" ry="50" fill="${c}"/><ellipse cx="${x - 14}" cy="${y - 18}" rx="8" ry="14" fill="#fff" opacity=".5"/>`).join('')}</svg>` },
  stars: { spot: 3, w: 440, h: 90, svg: `<svg viewBox="0 0 440 90" width="440" height="90"><path d="M10 14Q220 50 430 14" stroke="#c0a0ff" stroke-width="3" fill="none"/>
    ${[...Array(7)].map((_, i) => { const x = 40 + i * 60; const y = 30 + Math.sin((i + 0.5) / 7 * Math.PI) * 14; return `<g transform="translate(${x} ${y + 18})"><path d="M0 -16l5 10l11 1.5l-8 7.5l2 11l-10 -5.5l-10 5.5l2 -11l-8 -7.5l11 -1.5z" fill="${i % 2 ? '#ffd34d' : '#fff'}" stroke="#ffc400" stroke-width="2"/></g>`; }).join('')}</svg>` },
};
// 裝飾掛好的位置（中心點）
export const SPOTS = [[170, 270], [600, 120], [1030, 270], [600, 255]];

// ---------- 蛋糕 ----------
export const FLAVORS = {
  choco: { body: '#7a4a2a', cream: '#5a3420', line: 'bd_flavor_choco' },
  straw: { body: '#ffd0dc', cream: '#ff8fb0', line: 'bd_flavor_straw' },
  mango: { body: '#fff0c0', cream: '#ffc130', line: 'bd_flavor_mango' },
};
export function cakeSvg(flavor) {
  const f = FLAVORS[flavor];
  return `<svg viewBox="0 0 360 300" width="360" height="300" overflow="visible">
    <ellipse cx="180" cy="270" rx="170" ry="26" fill="#fff" stroke="#e8e8e8" stroke-width="5"/>
    <path d="M50 150V250Q180 290 310 250V150Z" fill="${f.body}"/>
    <ellipse cx="180" cy="150" rx="130" ry="34" fill="${f.cream}"/>
    <path d="M50 150${[...Array(9)].map((_, i) => `Q${64 + i * 29} ${190 + (i % 2) * 8} ${79 + i * 29} 160`).join('')}L310 150" fill="${f.cream}"/>
    <path d="M50 214Q180 244 310 214" stroke="${f.cream}" stroke-width="10" fill="none" opacity=".7"/>
    <g class="tops"></g><g class="candles"></g></svg>`;
}
export const TOPPINGS = {
  berry: `<path d="M0 -14Q14 -14 12 4Q8 16 0 18Q-8 16 -12 4Q-14 -14 0 -14Z" fill="#e5484d"/><path d="M-8 -14L0 -8L8 -14L0 -20Z" fill="#3f9a3f"/>${[[-4, -4], [4, 0], [-2, 8], [6, -8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#ffd34d"/>`).join('')}`,
  cherry: `<circle cx="-5" cy="6" r="10" fill="#c8102e"/><circle cx="8" cy="8" r="9" fill="#d81f3e"/><path d="M-5 -4Q0 -20 12 -22M8 -1Q8 -14 12 -22" stroke="#3f9a3f" stroke-width="3" fill="none"/>`,
  cookie: `<path d="M0 -16l5 10l11 1.5l-8 7.5l2 11l-10 -5.5l-10 5.5l2 -11l-8 -7.5l11 -1.5z" fill="#e8b46a" stroke="#c98f4f" stroke-width="2"/>`,
  blueberry: `<circle r="10" fill="#4a5ad8"/><circle cx="-3" cy="-3" r="3" fill="#8a9aff"/>`,
  kiwi: `<circle r="13" fill="#7a5a2a"/><circle r="11" fill="#8fd14f"/><circle r="4" fill="#fff3b0"/>${[0, 60, 120, 180, 240, 300].map((r) => `<circle cy="-6.5" r="1.3" fill="#222" transform="rotate(${r})"/>`).join('')}`,
};
// 蛋糕上放水果的位置（cakeSvg 座標）
export const TOP_SPOTS = [[110, 142], [250, 142], [180, 170], [140, 166], [222, 166]];
export const topSvg = (k, size = 90) => `<svg viewBox="-22 -24 44 44" width="${size}" height="${size}">${TOPPINGS[k]}</svg>`;

// 蠟燭：n 根，排在蛋糕上
export function candlesSvg(n) {
  const w = Math.min(36, 220 / Math.max(1, n));
  return [...Array(n)].map((_, i) => {
    const x = 180 - ((n - 1) * w) / 2 + i * w;
    const y = 146 - (i % 2) * 8;
    const c = ['#5fa8e8', '#ff8fb0', '#ffd34d', '#3fbf7f', '#c77dff'][i % 5];
    return `<g class="candle" data-i="${i}"><rect x="${x - 5}" y="${y - 70}" width="10" height="70" rx="3" fill="${c}"/><path d="M${x - 5} ${y - 56}l10 -8M${x - 5} ${y - 36}l10 -8M${x - 5} ${y - 16}l10 -8" stroke="#fff" stroke-width="3"/>
      <g class="flame" style="transform-origin:${x}px ${y - 72}px"><ellipse cx="${x}" cy="${y - 84}" rx="9" ry="15" fill="#ffb300"/><ellipse cx="${x}" cy="${y - 80}" rx="4.5" ry="8" fill="#fff3b0"/></g>
      <path class="smoke" d="M${x} ${y - 74}q-8 -12 0 -24t0 -24" stroke="#bbb" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle class="fhit" cx="${x}" cy="${y - 84}" r="${Math.max(18, w / 2)}" fill="transparent"/></g>`;
  }).join('');
}

// 禮物盒：每位角色一盒，用角色的顏色
export const BOX_COLORS = { kiki: '#f08a3c', dudu: '#2f3e5c', bobo: '#a0672e', mian: '#ffb3c7', gugu: '#6e5236' };
export const GIFT_OF = { kiki: 'bd_rocket', dudu: 'bd_bubble', bobo: 'bd_cupcake', mian: 'bd_starlamp', gugu: 'bd_musicbox' };
export function boxSvg(c) {
  return `<svg viewBox="0 0 160 170" width="160" height="170" overflow="visible">
    <rect x="16" y="66" width="128" height="100" rx="8" fill="${BOX_COLORS[c]}"/><rect x="72" y="66" width="16" height="100" fill="#ffd34d"/>
    <g class="lid"><rect x="8" y="44" width="144" height="28" rx="8" fill="${BOX_COLORS[c]}" stroke="#fff" stroke-width="3"/><rect x="72" y="44" width="16" height="28" fill="#ffd34d"/>
      <path d="M80 44Q50 10 44 34Q46 46 80 44Q110 10 116 34Q114 46 80 44Z" fill="#ffd34d"/></g>
    <g transform="translate(46 96) scale(.28)">${characterSvg(c)}</g></svg>`;
}

// 派對帽（戴在小孩頭像上）
export const HAT = `<svg viewBox="0 0 80 90" width="80" height="90"><path d="M40 4L72 84H8Z" fill="#c77dff"/><path d="M24 44L56 44M18 62H62" stroke="#ffd34d" stroke-width="7"/><circle cx="40" cy="6" r="9" fill="#ffd34d"/></svg>`;

export function kidSeat(id, cls = '') {
  return `<div class="kid ${cls}" data-id="${id}">${avatarSvg(id, 140)}<div class="hat">${HAT}</div></div>`;
}

// 大廳生日布置
export const HUB_BALLOONS = `<svg class="bd-balloons" viewBox="0 0 1200 900">
  ${[[60, 150, '#e5484d'], [120, 120, '#ffc400'], [1080, 120, '#5fa8e8'], [1140, 150, '#c77dff'], [180, 170, '#3fbf7f'], [1020, 170, '#ff9fc4']].map(([x, y, c], i) => `<g class="bb" style="animation-delay:${i * 0.3}s"><path d="M${x} ${y + 50}Q${x + 10} ${y + 120} ${x} ${y + 200}" stroke="#999" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y}" rx="38" ry="48" fill="${c}"/><ellipse cx="${x - 12}" cy="${y - 16}" rx="7" ry="13" fill="#fff" opacity=".5"/></g>`).join('')}
</svg>`;
export const PARTY_ICON = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#ffe9f2"/>
  ${[[80, 100, '#e5484d'], [140, 70, '#ffc400'], [300, 80, '#5fa8e8'], [350, 110, '#c77dff']].map(([x, y, c]) => `<path d="M${x} ${y + 40}Q${x + 6} ${y + 100} ${x} ${y + 150}" stroke="#999" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y}" rx="30" ry="38" fill="${c}"/>`).join('')}
  <g transform="translate(70 170) scale(.78)">${cakeSvg('straw').replace('<g class="candles"></g>', `<g>${candlesSvg(3)}</g>`)}</g>
</svg>`;

// ---------- 做生日卡（兄弟姊妹） ----------
export const BIG_CARD = (color) => `<svg viewBox="0 0 100 100" width="460" height="460"><path d="M14 18H86V88H14Z" fill="${color}" stroke="#fff" stroke-width="3"/><path d="M14 18L50 8L86 18" fill="${color}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><g class="st"></g></svg>`;

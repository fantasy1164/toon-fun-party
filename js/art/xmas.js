// 聖誕美術：聖誕樹、裝飾品、降臨月曆、禮物、餅乾牛奶、腳印、燈飾、煙囪、印章本。
import { impressionSvg } from './stamps.js';

// 裝飾品（60x60），依天數輪流
const ORN = [
  `<circle cx="30" cy="34" r="22" fill="#e5484d"/><rect x="24" y="6" width="12" height="8" rx="2" fill="#ffd34d"/><path d="M18 26a14 14 0 0 1 10-8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  `<path d="M30 6L37 23L56 24L41 36L46 55L30 44L14 55L19 36L4 24L23 23Z" fill="#ffd34d" stroke="#e0a800" stroke-width="2"/>`,
  `<path d="M14 44Q14 14 30 12Q46 14 46 44Z" fill="#ffd34d"/><rect x="10" y="42" width="40" height="8" rx="4" fill="#e0a800"/><circle cx="30" cy="54" r="5" fill="#e0a800"/>`,
  `<path d="M22 56V18a10 10 0 0 1 20 0" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M22 56V18a10 10 0 0 1 20 0" fill="none" stroke="#e5484d" stroke-width="10" stroke-dasharray="6 6" stroke-linecap="round"/>`,
  `<circle cx="30" cy="34" r="22" fill="#2f7fe0"/><path d="M8 34H52" stroke="#fff" stroke-width="4"/><rect x="24" y="6" width="12" height="8" rx="2" fill="#ffd34d"/>`,
  `<circle cx="30" cy="16" r="10" fill="#c8915a"/><path d="M18 26H42L46 52H38L34 40H26L22 52H14Z" fill="#c8915a"/><circle cx="26" cy="15" r="2" fill="#333"/><circle cx="34" cy="15" r="2" fill="#333"/><path d="M20 34H40" stroke="#fff" stroke-width="3"/>`,
  `<g stroke="#9fd8ee" stroke-width="5" stroke-linecap="round"><path d="M30 6V54M9 18L51 42M9 42L51 18"/></g><circle cx="30" cy="30" r="6" fill="#fff"/>`,
  `<rect x="10" y="22" width="40" height="32" rx="4" fill="#2ea05a"/><rect x="26" y="22" width="8" height="32" fill="#ffd34d"/><path d="M30 22Q20 8 16 18Q22 24 30 22Q40 8 44 18Q38 24 30 22Z" fill="#ffd34d"/>`,
  `<path d="M18 8H40V34L50 44Q52 54 40 54H22Q14 54 16 44L18 40Z" fill="#e5484d"/><rect x="16" y="6" width="26" height="10" rx="3" fill="#fff"/>`,
  `<circle cx="30" cy="34" r="22" fill="#8e4ec6"/><circle cx="22" cy="30" r="4" fill="#fff"/><circle cx="36" cy="40" r="4" fill="#fff"/><circle cx="38" cy="26" r="3" fill="#fff"/><rect x="24" y="6" width="12" height="8" rx="2" fill="#ffd34d"/>`,
  `<path d="M30 54C14 42 6 34 6 24C6 16 12 10 20 10C25 10 28 13 30 17C32 13 35 10 40 10C48 10 54 16 54 24C54 34 46 42 30 54Z" fill="#ec5fa0"/>`,
  `<ellipse cx="30" cy="34" rx="16" ry="22" fill="#a0672e"/><path d="M16 26H44M14 36H46M18 46H42" stroke="#7a4a1e" stroke-width="3"/><path d="M26 10H34V14H26Z" fill="#3a8f4f"/>`,
];
export function ornament(i, size = 60) {
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}">${ORN[i % ORN.length]}</svg>`;
}
const ornInline = (i, x, y, s = 1) => `<g transform="translate(${x - 30 * s} ${y - 30 * s}) scale(${s})">${ORN[i % ORN.length]}</g>`;

// 聖誕樹上的 48 個位置（每天每個小孩一個）
const SLOTS = (() => {
  const rows = [2, 3, 4, 5, 6, 8, 9, 11];
  const out = [];
  rows.forEach((n, r) => {
    const y = 250 + r * 56;
    const half = 50 + r * 40;
    for (let k = 0; k < n; k++) out.push([360 - half + (2 * half * (k + 0.5)) / n, y + ((k % 2) ? 10 : -6)]);
  });
  return out;
})();

// opened：{ yh: [天數...], xz: [...] }
export function treeSvg(opened, { star = false, x = 0, y = 0, s = 1 } = {}) {
  const lights = SLOTS.filter((_, i) => i % 3 === 1).map(([lx, ly], i) =>
    `<circle class="bulb" style="animation-delay:${(i % 5) * 0.3}s" cx="${lx + 18}" cy="${ly + 22}" r="7" fill="${['#ffd34d', '#ff6b5c', '#5fc3e8', '#7be0a0'][i % 4]}"/>`).join('');
  const orns = [];
  for (const [who, base] of [['yh', 0], ['xz', 1]]) {
    for (const d of opened[who] || []) {
      if (d > 24) continue;
      const [ox, oy] = SLOTS[((d - 1) * 2 + base) % SLOTS.length];
      orns.push(`<g class="orn" data-k="${who}-${d}">${ornInline(d - 1 + base * 5, ox, oy, 0.8)}</g>`);
    }
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="360" cy="726" rx="230" ry="18" fill="#000" opacity=".12"/>
    <rect x="330" y="640" width="60" height="80" fill="#8a5a2b"/>
    <path d="M360 170L470 330H420L540 500H470L610 680H110L250 500H180L300 330H250Z" fill="#2e8b57"/>
    <path d="M360 170L470 330H420L540 500H470L610 680H360Z" fill="#267a4b"/>
    ${lights}
    ${orns.join('')}
    <g class="top-star ${star ? 'on' : ''}"><path d="M360 110L374 146L412 148L382 172L392 210L360 188L328 210L338 172L308 148L346 146Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4"/></g>
  </g>`;
}

// 降臨月曆的一格
export function adventDoor(d, state) {
  // state：open / today / past（可補開）/ locked
  const inner = state === 'open' ? ornament(d - 1, 62) : `<span>${d}</span>`;
  return `<button class="adv ${state}" data-d="${d}">${inner}</button>`;
}

export const GIFT = `<svg viewBox="0 0 260 240" width="260" height="240">
  <g class="box"><rect x="30" y="90" width="200" height="140" rx="10" fill="#e5484d"/><rect x="118" y="90" width="24" height="140" fill="#ffd34d"/></g>
  <g class="lid"><rect x="20" y="64" width="220" height="40" rx="10" fill="#d93a3a"/><rect x="118" y="64" width="24" height="40" fill="#ffd34d"/>
    <path d="M130 64Q90 10 74 40Q86 66 130 64Q170 10 186 40Q174 66 130 64Z" fill="#ffd34d"/></g></svg>`;

export const COOKIES = `<g class="cookies">
  <ellipse cx="0" cy="0" rx="90" ry="22" fill="#fff" stroke="#ddd" stroke-width="4"/>
  <g class="full"><circle cx="-36" cy="-8" r="24" fill="#d9a066"/><circle cx="8" cy="-10" r="24" fill="#d9a066"/>
    <circle cx="-42" cy="-12" r="3.5" fill="#6b3f1d"/><circle cx="-28" cy="-2" r="3.5" fill="#6b3f1d"/><circle cx="4" cy="-16" r="3.5" fill="#6b3f1d"/><circle cx="14" cy="-4" r="3.5" fill="#6b3f1d"/></g>
  <g class="eaten"><path d="M-46 -4a16 16 0 0 1 22 -10l-4 8l6 4z" fill="#d9a066"/><circle cx="-6" cy="-4" r="3" fill="#d9a066"/><circle cx="14" cy="-2" r="2.5" fill="#d9a066"/><circle cx="24" cy="-8" r="2" fill="#d9a066"/></g>
  <g class="milk"><rect x="44" y="-70" width="40" height="66" rx="8" fill="#e8f6ff" stroke="#bcd" stroke-width="3"/><rect class="milk-level" x="47" y="-50" width="34" height="43" rx="6" fill="#fff"/></g>
</g>`;

export const FOOTPRINTS = `<g class="steps" fill="#7a5230" opacity=".55">
  ${[[980, 820], [920, 790], [860, 815], [800, 785], [740, 810], [680, 780]].map(([x, y], i) =>
    `<g transform="translate(${x} ${y}) rotate(${i % 2 ? -10 : 10})"><ellipse rx="22" ry="12"/><ellipse cx="-26" rx="10" ry="9"/></g>`).join('')}
</g>`;

// 選房間畫面的燈飾與煙囪
export const ROOF_LIGHTS = `<svg class="xlights" viewBox="0 0 1200 900">
  <rect x="820" y="40" width="70" height="110" fill="#b8553a"/><rect x="808" y="30" width="94" height="22" rx="6" fill="#8a3a28"/>
  <path d="M120 170Q300 190 600 30Q900 190 1080 170" fill="none" stroke="#3a3a3a" stroke-width="3"/>
  ${Array.from({ length: 18 }, (_, i) => {
    const t = (i + 0.5) / 18;
    const x = 120 + t * 960;
    const y = t < 0.5 ? 170 - (t / 0.5) * 140 : 30 + ((t - 0.5) / 0.5) * 140;
    return `<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${x}" cy="${y + 10}" r="9" fill="${['#ffd34d', '#ff6b5c', '#5fc3e8', '#7be0a0'][i % 4]}"/>`;
  }).join('')}
</svg>`;

export const TREE_ICON = `<svg viewBox="0 0 160 160" width="150" height="150">
  <rect x="70" y="120" width="20" height="26" fill="#8a5a2b"/>
  <path d="M80 18L118 70H100L134 122H26L60 70H42Z" fill="#2e8b57"/>
  <circle cx="64" cy="96" r="7" fill="#e5484d"/><circle cx="96" cy="104" r="7" fill="#ffd34d"/><circle cx="82" cy="64" r="6" fill="#5fc3e8"/>
  <path d="M80 4L85 16L98 17L88 25L91 38L80 31L69 38L72 25L62 17L75 16Z" fill="#ffd34d"/></svg>`;

// 聖誕老公公的印章本：12 月蓋的章
export function stampBook(entries) {
  const cells = Array.from({ length: Math.max(12, entries.length) }, (_, i) => {
    const e = entries[i];
    return `<div class="bslot">${e ? `<div class="bstamp" style="animation-delay:${0.5 + i * 0.18}s">${impressionSvg(e.s || 'star', e.c || 'red', 56, e.rot || 0, '#fff7e8')}</div>` : ''}</div>`;
  }).join('');
  return `<div class="stampbook"><div class="page">${cells}</div></div>`;
}

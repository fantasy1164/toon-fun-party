// 明星劇場：紫色牆、紅布幕、燈泡、木頭舞台。上面兩排明星牌，舞台中間是小孩自己的明星牌。
import { characterSvg, avatarSvg } from './characters.js';

export const PLAQUE = { w: 180, h: 212, x0: 120, dx: 196, rows: [92, 318] };
export function plaquePos(i) {
  const r = Math.floor(i / 5);
  return [PLAQUE.x0 + (i % 5) * PLAQUE.dx, PLAQUE.rows[r]];
}

export function hallBack() {
  const bulbs = [];
  for (let i = 0; i < 26; i++) bulbs.push(`<circle class="bulb" style="animation-delay:${(i % 3) * 0.3}s" cx="${30 + i * 45}" cy="62" r="8" fill="${['#ffd34d', '#ff8fb0', '#7be0ff'][i % 3]}"/>`);
  const drape = (x, flip) => `<path d="M${x} 0H${x + (flip ? -120 : 120)}Q${x + (flip ? -70 : 70)} 300 ${x + (flip ? -100 : 100)} 620Q${x + (flip ? -40 : 40)} 660 ${x} 640Z" fill="#c8202a"/>
    <path d="M${x + (flip ? -30 : 30)} 0Q${x + (flip ? -60 : 60)} 300 ${x + (flip ? -40 : 40)} 630" stroke="#a0161f" stroke-width="10" fill="none"/>
    <path d="M${x + (flip ? -80 : 80)} 0Q${x + (flip ? -100 : 100)} 300 ${x + (flip ? -80 : 80)} 630" stroke="#e33a44" stroke-width="8" fill="none"/>
    <circle cx="${x + (flip ? -90 : 90)}" cy="400" r="12" fill="#ffd34d"/>`;
  return `<svg viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="hwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1d5c"/><stop offset="1" stop-color="#6a2f86"/></linearGradient>
      <radialGradient id="hspot" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff6c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
      <linearGradient id="hfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c88a4a"/><stop offset="1" stop-color="#9a6332"/></linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#hwall)"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle class="tw" style="animation-delay:${(i % 5) * 0.25}s" cx="${(i * 137) % 1200}" cy="${120 + ((i * 71) % 420)}" r="${2 + (i % 3)}" fill="#fff" opacity=".5"/>`).join('')}
    <rect y="0" width="1200" height="84" fill="#2b1236"/><path d="M0 84${Array.from({ length: 24 }, (_, i) => `Q${25 + i * 50} 124 ${50 + i * 50} 84`).join('')}V40H0Z" fill="#c8202a"/>
    ${bulbs.join('')}
    ${drape(0, false)}${drape(1200, true)}
    <ellipse cx="600" cy="640" rx="560" ry="120" fill="url(#hspot)"/>
    <path d="M40 600H1160L1200 900H0Z" fill="url(#hfloor)"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 140} 600L${i * 150} 900" stroke="#a8743f" stroke-width="3"/>`).join('')}
    <rect x="30" y="590" width="1140" height="20" rx="8" fill="#ffd34d"/>
  </svg>`;
}

const star = (x, y, r, fill, stroke) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${p.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>`;
};
export const KID_COLOR = { yh: '#ff3d8b', xz: '#19b45a' };

// 星星列：n 顆亮的，共 max 顆
export function starRow(n, max, color, size = 26) {
  const w = size * max + 6 * (max - 1);
  return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}">${Array.from({ length: max }, (_, i) => star(i * (size + 6) + size / 2, size / 2 + 1, size / 2 - 1, i < n ? '#ffd34d' : 'rgba(255,255,255,.18)', i < n ? color : 'rgba(255,255,255,.5)')).join('')}</svg>`;
}

// 明星牌
export function plaqueSvg(id) {
  return `<svg viewBox="0 0 180 170" width="180" height="170">
    <rect x="4" y="4" width="172" height="162" rx="22" fill="#2b1236" stroke="#ffd34d" stroke-width="7"/>
    <ellipse cx="90" cy="54" rx="70" ry="60" fill="#fff6c8" opacity=".18"/>
    <g>${characterSvg(id, { x: 42, y: 12, s: 0.45 })}</g>
  </svg>`;
}

// 好朋友合照
export function photoSvg(id, kidId) {
  return `<div class="hf-photo-in"><svg viewBox="0 0 240 320" width="150" height="200">${characterSvg(id)}</svg><div class="hf-photo-kid">${avatarSvg(kidId, 120)}</div></div>`;
}

// 舞台上小孩自己的明星牌（星星形狀的金框）
export function meSvg() {
  return `<svg viewBox="0 0 200 200" width="200" height="200">${star(100, 104, 98, '#ffd34d', '#ff9f1c')}</svg>`;
}

export const CROWN = `<svg viewBox="0 0 100 60" width="90" height="54"><path d="M8 54L14 14L34 34L50 6L66 34L86 14L92 54Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="40" r="6" fill="#ff5c8a"/></svg>`;
export const NOTE = `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#fff" opacity=".9"/><path d="M40 72V28L72 22V62" stroke="#7a3fa8" stroke-width="8" fill="none" stroke-linejoin="round"/><ellipse cx="32" cy="72" rx="12" ry="9" fill="#7a3fa8"/><ellipse cx="64" cy="64" rx="12" ry="9" fill="#7a3fa8"/></svg>`;
export const CLOSE = `<svg viewBox="0 0 100 100" width="60" height="60"><path d="M28 28L72 72M72 28L28 72" stroke="#7a5230" stroke-width="12" stroke-linecap="round"/></svg>`;

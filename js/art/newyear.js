// 過年：客廳（大掃除、春聯、年夜飯）、年獸、紅包、煙火、元宵燈籠。舞台 1200x900。
import { characterSvg } from './characters.js';
import { skyColors } from './bathroom.js';

// 只用一個「福」字（鐵則的例外）
export const FU = (size = 120, upside = true) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect x="15" y="15" width="70" height="70" fill="#d6262b" stroke="#ffcf40" stroke-width="4" transform="rotate(45 50 50)"/>
  <text x="50" y="66" text-anchor="middle" font-size="46" font-weight="900" fill="#ffcf40" font-family="'PingFang TC','Heiti TC','Noto Sans TC',sans-serif" ${upside ? 'transform="rotate(180 50 50)"' : ''}>福</text></svg>`;
// 春聯：紅底金邊，不寫字（用金色圖案）
export const COUPLET = `<svg viewBox="0 0 80 360" width="80" height="360"><rect x="4" y="4" width="72" height="352" rx="4" fill="#d6262b" stroke="#ffcf40" stroke-width="4"/>
  ${[50, 130, 210, 290].map((y) => `<g transform="translate(40 ${y})"><circle r="20" fill="none" stroke="#ffcf40" stroke-width="4"/><path d="M0 -12l3.5 8l8.5 1l-6.5 5.5l2 8.5l-7.5 -4.5l-7.5 4.5l2 -8.5l-6.5 -5.5l8.5 -1z" fill="#ffcf40"/></g>`).join('')}</svg>`;
export const LANTERN = (c = '#e8262d', lit = true) => `<svg viewBox="0 0 120 170" width="120" height="170" overflow="visible">
  ${lit ? '<ellipse class="glowball" cx="60" cy="82" rx="70" ry="66" fill="#ffd34d" opacity=".35"/>' : ''}
  <rect x="56" y="0" width="8" height="22" fill="#8a5a2b"/><rect x="36" y="20" width="48" height="12" rx="4" fill="#ffcf40"/>
  <ellipse cx="60" cy="82" rx="52" ry="52" fill="${c}"/>${[-30, -12, 12, 30].map((x) => `<path d="M${60 + x} 34Q${60 + x * 1.6} 82 ${60 + x} 130" stroke="#b5141a" stroke-width="3" fill="none"/>`).join('')}
  <rect x="36" y="128" width="48" height="12" rx="4" fill="#ffcf40"/>${[44, 54, 64, 74].map((x) => `<path d="M${x} 140v24" stroke="#ffcf40" stroke-width="4"/>`).join('')}</svg>`;

export function nyRoom(ph, wx, { clean = true } = {}) {
  const { colors: [a, b] } = skyColors(ph, wx);
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="nysky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="#fff1dd"/>
    <rect y="0" width="1200" height="24" fill="#d6262b"/>
    <rect y="540" width="1200" height="360" fill="#d9a066"/>${[600, 670, 760].map((y) => `<rect y="${y}" width="1200" height="4" fill="#c08850"/>`).join('')}
    <!-- 窗戶 -->
    <rect x="70" y="110" width="300" height="260" rx="14" fill="url(#nysky)"/>
    <rect x="70" y="110" width="300" height="260" rx="14" fill="none" stroke="#fff" stroke-width="14"/><path d="M220 110V370M70 240H370" stroke="#fff" stroke-width="10"/>
    <!-- 大門與春聯位置 -->
    <rect x="800" y="130" width="300" height="410" rx="8" fill="#8a3a2a"/><rect x="820" y="150" width="260" height="390" fill="#a8463a"/><path d="M950 150V540" stroke="#7a2a20" stroke-width="6"/>
    <circle cx="930" cy="360" r="9" fill="#ffcf40"/><circle cx="970" cy="360" r="9" fill="#ffcf40"/>
    <rect class="slot" x="716" y="150" width="80" height="360" rx="4" fill="none" stroke="#e6b0a0" stroke-width="4" stroke-dasharray="12 10"/>
    <rect class="slot" x="1104" y="150" width="80" height="360" rx="4" fill="none" stroke="#e6b0a0" stroke-width="4" stroke-dasharray="12 10"/>
    <!-- 玩具箱 -->
    <g transform="translate(560 600)"><rect width="200" height="110" rx="12" fill="#5fa8e8"/><rect y="-16" width="200" height="26" rx="10" fill="#3a86d0"/><circle cx="100" cy="56" r="20" fill="#ffd34d"/></g>
    ${clean ? '' : ''}
  </svg>`;
}

// 窗戶上的灰塵（擦掉）
export const DUST = `<svg viewBox="0 0 300 260" width="300" height="260">${[[60, 60, 50], [180, 80, 60], [110, 170, 55], [230, 190, 45], [40, 200, 35]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9a8a70"/>`).join('')}</svg>`;
// 地上的玩具、灰塵堆
export const TOYS = {
  ball: `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="56" r="34" fill="#e5484d"/><path d="M16 56Q50 40 84 56M50 22Q36 56 50 90" stroke="#fff" stroke-width="6" fill="none"/></svg>`,
  car: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M10 70V56L26 52L36 36H66L76 52L92 56V70Z" fill="#ffc400"/><circle cx="30" cy="72" r="11" fill="#333"/><circle cx="72" cy="72" r="11" fill="#333"/><rect x="40" y="40" width="22" height="12" fill="#9fd8ee"/></svg>`,
  bear: `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="30" cy="26" r="12" fill="#a0672e"/><circle cx="70" cy="26" r="12" fill="#a0672e"/><circle cx="50" cy="44" r="28" fill="#c08850"/><ellipse cx="50" cy="84" rx="28" ry="16" fill="#c08850"/><circle cx="40" cy="40" r="4" fill="#222"/><circle cx="60" cy="40" r="4" fill="#222"/><ellipse cx="50" cy="52" rx="8" ry="6" fill="#f3d2a4"/></svg>`,
};
export const DUSTPILE = `<svg viewBox="0 0 120 70" width="120" height="70"><ellipse cx="60" cy="50" rx="52" ry="16" fill="#9a8a70"/><circle cx="40" cy="40" r="14" fill="#8a7a60"/><circle cx="70" cy="36" r="18" fill="#a89878"/><path d="M90 30l10 -10M20 30l-8 -8" stroke="#8a7a60" stroke-width="4"/></svg>`;

// ---------- 年獸（圓滾滾、可愛） ----------
export const NIAN = `<svg viewBox="0 0 360 320" width="360" height="320" overflow="visible">
  <ellipse cx="180" cy="310" rx="130" ry="12" fill="#000" opacity=".12"/>
  <path d="M110 40L94 -4L140 26ZM250 40L266 -4L220 26Z" fill="#ffd34d"/>
  <ellipse cx="180" cy="180" rx="150" ry="132" fill="#3fbf9f"/>
  ${[[60, 120], [90, 70], [140, 50], [220, 50], [270, 70], [300, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="#3fbf9f"/>`).join('')}
  <ellipse cx="180" cy="220" rx="96" ry="76" fill="#bff0dc"/>
  <g class="neye"><circle cx="128" cy="140" r="30" fill="#fff"/><circle cx="232" cy="140" r="30" fill="#fff"/><circle class="pupil" cx="134" cy="146" r="15" fill="#1d2433"/><circle class="pupil" cx="226" cy="146" r="15" fill="#1d2433"/><circle cx="140" cy="140" r="5" fill="#fff"/><circle cx="232" cy="140" r="5" fill="#fff"/></g>
  <path class="nbrow" d="M96 98L156 112M264 98L204 112" stroke="#1f7a64" stroke-width="10" stroke-linecap="round"/>
  <path class="nmouth" d="M140 214Q180 236 220 214" stroke="#1d2433" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M156 216l8 16l8 -14M188 218l8 14l8 -16" fill="#fff"/>
  <circle cx="96" cy="196" r="16" fill="#ff9fb0" opacity=".7"/><circle cx="264" cy="196" r="16" fill="#ff9fb0" opacity=".7"/>
  <ellipse cx="80" cy="300" rx="44" ry="20" fill="#2fa588"/><ellipse cx="280" cy="300" rx="44" ry="20" fill="#2fa588"/>
</svg>`;
// 嚇年獸的工具（6 歲版有兩樣沒用的）
export const TOOLS = {
  red: { ok: true, svg: `<svg viewBox="0 0 120 120" width="110" height="110"><path d="M10 20Q60 50 110 20" stroke="#8a5a2b" stroke-width="4" fill="none"/>${[22, 60, 98].map((x, i) => `<g transform="translate(${x - 18} ${28 + (i === 1 ? 12 : 0)}) scale(.3)">${LANTERN('#e8262d', false).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`).join('')}</svg>` },
  drum: { ok: true, svg: `<svg viewBox="0 0 120 120" width="110" height="110"><ellipse cx="60" cy="40" rx="44" ry="16" fill="#f3d2a4"/><path d="M16 40V84Q60 104 104 84V40" fill="#d6262b"/><ellipse cx="60" cy="40" rx="44" ry="16" fill="none" stroke="#ffcf40" stroke-width="5"/>${[30, 60, 90].map((x) => `<circle cx="${x}" cy="74" r="4" fill="#ffcf40"/>`).join('')}<path d="M86 10L110 30M98 4L116 22" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/></svg>` },
  light: { ok: true, svg: `<svg viewBox="0 0 120 120" width="110" height="110"><circle cx="60" cy="52" r="34" fill="#ffe680"/><rect x="46" y="84" width="28" height="22" rx="4" fill="#9aa0aa"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<rect x="57" y="0" width="6" height="12" rx="3" fill="#ffc400" transform="rotate(${r} 60 52)"/>`).join('')}</svg>` },
  blue: { ok: false, svg: `<svg viewBox="0 0 120 120" width="110" height="110"><ellipse cx="60" cy="48" rx="34" ry="40" fill="#5fa8e8"/><path d="M60 88Q54 100 62 114" stroke="#888" stroke-width="3" fill="none"/></svg>` },
  pillow: { ok: false, svg: `<svg viewBox="0 0 120 120" width="110" height="110"><path d="M18 40Q14 26 30 26H90Q106 26 102 40V80Q106 94 90 94H30Q14 94 18 80Z" fill="#e8e0f8"/></svg>` },
};

// ---------- 年夜飯 ----------
const plate = (body) => `<svg viewBox="0 0 160 110" width="160" height="110"><ellipse cx="80" cy="66" rx="76" ry="36" fill="#fff" stroke="#e6e6e6" stroke-width="5"/><ellipse cx="80" cy="62" rx="58" ry="24" fill="#f6f6f6"/>${body}</svg>`;
export const DISHES = {
  fish: { line: 'ny_d_fish', svg: plate(`<path d="M30 60Q70 30 112 58Q70 86 30 60Z" fill="#f0a43c"/><path d="M112 58L140 40V78Z" fill="#e08a20"/><circle cx="46" cy="56" r="4" fill="#222"/><path d="M60 52Q66 60 60 68M74 50Q80 60 74 70" stroke="#c9562f" stroke-width="3" fill="none"/>`) },
  cake: { line: 'ny_d_radish', svg: plate(`${[[42, 48], [80, 44], [64, 64], [100, 62]].map(([x, y]) => `<rect x="${x}" y="${y}" width="30" height="20" rx="4" fill="#fff6dc" stroke="#e8c88a" stroke-width="3"/>`).join('')}`) },
  greens: { line: 'ny_d_greens', svg: plate(`${[...Array(7)].map((_, i) => `<path d="M${36 + i * 13} 70Q${44 + i * 13} 30 ${60 + i * 12} 66" stroke="#3f9a3f" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}`) },
  niangao: { line: 'ny_d_niangao', svg: plate(`<ellipse cx="80" cy="56" rx="44" ry="18" fill="#8a4a1e"/><path d="M36 56V64Q80 88 124 64V56" fill="#7a3a12"/><circle cx="80" cy="52" r="8" fill="#e5484d"/>`) },
};
export const EASY_DISHES = ['fish', 'cake', 'greens'];
// 6 歲版：聽描述選出那道菜
export const DISH_QUIZ = [['fish', 'ny_q_fish'], ['cake', 'ny_q_radish'], ['greens', 'ny_q_greens'], ['niangao', 'ny_q_niangao']];

// ---------- 紅包、存錢筒、雙手 ----------
export const ENVELOPE = `<svg viewBox="0 0 100 140" width="100" height="140"><rect x="6" y="6" width="88" height="128" rx="8" fill="#d6262b" stroke="#ffcf40" stroke-width="4"/><path d="M6 40Q50 70 94 40" fill="none" stroke="#ffcf40" stroke-width="4"/><circle cx="50" cy="60" r="16" fill="#ffcf40"/><circle cx="50" cy="60" r="8" fill="#d6262b"/></svg>`;
export const PIGGY = `<svg viewBox="0 0 220 180" width="220" height="180"><ellipse cx="110" cy="100" rx="92" ry="70" fill="#ffb3c7"/><circle cx="196" cy="96" r="22" fill="#ff9fb8"/><circle cx="190" cy="92" r="4" fill="#b8506a"/><circle cx="202" cy="92" r="4" fill="#b8506a"/>
  <path d="M60 40L50 14L84 34Z" fill="#ff9fb8"/><circle cx="160" cy="76" r="7" fill="#1d2433"/><rect x="80" y="30" width="56" height="10" rx="5" fill="#b8506a"/>${[60, 90, 130, 160].map((x) => `<rect x="${x - 10}" y="150" width="20" height="26" rx="6" fill="#ff9fb8"/>`).join('')}</svg>`;
export const HANDS = {
  l: `<svg viewBox="0 0 120 120" width="120" height="120"><g transform="rotate(20 60 70)"><rect x="34" y="50" width="52" height="56" rx="22" fill="#ffd9b8"/>${[0, 1, 2, 3].map((i) => `<rect x="${36 + i * 13}" y="${18 + Math.abs(1.5 - i) * 6}" width="11" height="44" rx="5.5" fill="#ffd9b8"/>`).join('')}<rect x="86" y="58" width="12" height="36" rx="6" fill="#ffd9b8" transform="rotate(35 92 76)"/></g></svg>`,
  r: `<svg viewBox="0 0 120 120" width="120" height="120"><g transform="rotate(-20 60 70)"><rect x="34" y="50" width="52" height="56" rx="22" fill="#ffd9b8"/>${[0, 1, 2, 3].map((i) => `<rect x="${36 + i * 13}" y="${18 + Math.abs(1.5 - i) * 6}" width="11" height="44" rx="5.5" fill="#ffd9b8"/>`).join('')}<rect x="22" y="58" width="12" height="36" rx="6" fill="#ffd9b8" transform="rotate(-35 28 76)"/></g></svg>`,
};

// ---------- 煙火安全：兩張選擇圖 ----------
const card = (body) => `<svg viewBox="0 0 200 160" width="200" height="160">${body}</svg>`;
export const SAFE_CARD = card(`<rect width="200" height="160" rx="16" fill="#1d2a4a"/>${[[150, 40, '#ffd34d'], [110, 30, '#ff6b8a']].map(([x, y, c]) => [0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<path d="M${x} ${y}l${(Math.cos(r * Math.PI / 180) * 18).toFixed(1)} ${(Math.sin(r * Math.PI / 180) * 18).toFixed(1)}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`).join('')).join('')}
  <g transform="translate(14 74) scale(.24)">${characterSvg('kiki')}</g><circle cx="40" cy="104" r="10" fill="#f08a3c"/><circle cx="66" cy="104" r="10" fill="#f08a3c"/><path d="M150 150v-40" stroke="#888" stroke-width="4"/>`);
export const RUN_CARD = card(`<rect width="200" height="160" rx="16" fill="#1d2a4a"/><rect x="130" y="110" width="20" height="40" fill="#d6262b"/><path d="M140 110q6 -14 -2 -24" stroke="#ffd34d" stroke-width="4" fill="none"/><circle cx="140" cy="86" r="6" fill="#ffd34d"/>
  <g transform="translate(60 66) scale(.26) rotate(14 120 160)">${characterSvg('kiki')}</g><path d="M30 100h24M24 116h24" stroke="#aaa" stroke-width="5" stroke-linecap="round"/>`);

// ---------- 元宵：燈籠、燈謎、湯圓 ----------
export const LANTERNS = {
  round: (lit) => LANTERN('#e8262d', lit),
  rabbit: (lit) => `<svg viewBox="0 0 160 170" width="140" height="150" overflow="visible">${lit ? '<ellipse class="glowball" cx="80" cy="96" rx="86" ry="70" fill="#ffd34d" opacity=".35"/>' : ''}
    <rect x="76" y="0" width="8" height="30" fill="#8a5a2b"/><ellipse cx="62" cy="40" rx="12" ry="30" fill="#fff"/><ellipse cx="92" cy="40" rx="12" ry="30" fill="#fff"/>
    <ellipse cx="80" cy="100" rx="70" ry="50" fill="#fff"/><circle cx="120" cy="86" r="6" fill="#e5484d"/><circle cx="104" cy="100" r="8" fill="#ff9fb0" opacity=".7"/>${[50, 80, 110].map((x) => `<rect x="${x - 10}" y="140" width="20" height="20" rx="6" fill="#ff9fb0"/>`).join('')}</svg>`,
  sheep: (lit) => `<svg viewBox="0 0 160 170" width="140" height="150" overflow="visible">${lit ? '<ellipse class="glowball" cx="80" cy="96" rx="86" ry="70" fill="#ffd34d" opacity=".35"/>' : ''}
    <rect x="76" y="0" width="8" height="30" fill="#8a5a2b"/>${[[50, 80], [80, 70], [110, 80], [40, 110], [120, 110], [80, 120], [60, 100], [100, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="28" fill="#fff6f0"/>`).join('')}
    <ellipse cx="130" cy="90" rx="22" ry="26" fill="#ffd9c8"/><circle cx="136" cy="84" r="4" fill="#3a2a22"/><path d="M114 70q-14 -10 -6 -22" stroke="#e8b8a0" stroke-width="8" fill="none"/></svg>`,
};
export const RIDDLE = {
  q: 'ny_riddle',
  right: card(`<ellipse cx="100" cy="110" rx="80" ry="34" fill="#fff" stroke="#e6e6e6" stroke-width="5"/><path d="M24 106Q100 160 176 106" fill="#ffd9c8"/>${[[70, 96], [104, 90], [136, 98], [88, 112], [120, 112]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="15" fill="${i % 2 ? '#ffb3c7' : '#fff'}" stroke="#eee" stroke-width="2"/>`).join('')}`),
  wrong: [
    card(`<ellipse cx="100" cy="110" rx="80" ry="30" fill="#fff" stroke="#e6e6e6" stroke-width="5"/>${[60, 100, 140].map((x) => `<path d="M${x - 26} 104Q${x} 64 ${x + 26} 104Z" fill="#fff6dc" stroke="#e8c88a" stroke-width="3"/>`).join('')}`),
    card(`<ellipse cx="100" cy="116" rx="80" ry="28" fill="#fff" stroke="#e6e6e6" stroke-width="5"/><path d="M50 108Q50 50 100 50Q150 50 150 108Z" fill="#fff" stroke="#eee" stroke-width="3"/><path d="M84 56Q100 40 116 56" stroke="#ddd" stroke-width="4" fill="none"/>`),
  ],
};
export const BOWL = `<svg viewBox="0 0 320 220" width="320" height="220" overflow="visible"><ellipse cx="160" cy="80" rx="150" ry="40" fill="#f6e6d0"/>
  <path d="M10 80Q20 210 160 210Q300 210 310 80Z" fill="#e5484d"/><path d="M40 130Q160 150 280 130" stroke="#ffcf40" stroke-width="6" fill="none"/>
  <g class="balls">${[[100, 72], [150, 62], [200, 72], [130, 88], [180, 90], [230, 84]].map(([x, y], i) => `<circle class="tball" data-i="${i}" cx="${x}" cy="${y}" r="22" fill="${i % 2 ? '#ffb3c7' : '#fff'}" stroke="#eee" stroke-width="2"/>`).join('')}</g></svg>`;

// 元宵夜晚的街道
export function lanternStreet() {
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16204a"/><stop offset="1" stop-color="#3a3a7a"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#lsky)"/>
    <circle cx="980" cy="120" r="60" fill="#fff6c8"/>
    ${[[120, 80], [300, 160], [520, 70], [700, 150], [860, 60], [1120, 220]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff"/>`).join('')}
    <g class="street">${[...Array(11)].map((_, i) => `<g transform="translate(${i * 260 - 60} 300)"><rect width="200" height="260" fill="#2a2440"/><path d="M-20 0L100 -60L220 0Z" fill="#3a2a40"/><rect x="40" y="80" width="40" height="50" fill="#ffd34d" opacity=".7"/><rect x="120" y="80" width="40" height="50" fill="#ffd34d" opacity=".5"/></g>`).join('')}
      <path d="M0 330Q300 380 600 330T1200 330T1800 330T2400 330" stroke="#8a5a2b" stroke-width="3" fill="none"/>
      ${[...Array(12)].map((_, i) => 100 + i * 200).map((x, i) => `<g transform="translate(${x - 18} ${348 + (i % 2) * 10}) scale(.3)">${LANTERN(['#e8262d', '#ff8f3c', '#e8262d'][i % 3], true).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`).join('')}</g>
    <rect y="560" width="1200" height="340" fill="#2a2a44"/><path d="M0 640H1200" stroke="#3a3a5a" stroke-width="6"/>
  </svg>`;
}
// 煙火夜空（從窗戶看出去，整個畫面）
export function fireworkSky() {
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="fsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1430"/><stop offset="1" stop-color="#2a2f5a"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#fsk)"/>
    ${[[150, 520], [330, 480], [520, 540], [760, 470], [960, 520], [1120, 500]].map(([x, y], i) => `<rect x="${x - 60}" y="${y}" width="120" height="${900 - y}" fill="#141a36"/>${[0, 1, 2].map((k) => `<rect x="${x - 40 + k * 30}" y="${y + 30}" width="16" height="20" fill="#ffd34d" opacity="${0.4 + (i + k) % 3 * 0.2}"/>`).join('')}`).join('')}
    <rect y="760" width="1200" height="140" fill="#3a2a2a"/><rect y="760" width="1200" height="16" fill="#5a3a3a"/>
  </svg>`;
}

// 大廳過年布置與房間圖示
export const HUB_NY = `<svg class="ny-deco" viewBox="0 0 1200 900">
  ${[[255, 30], [945, 30]].map(([x, y]) => `<g class="swing" style="transform-origin:${x}px ${y}px"><path d="M${x} 0V${y}" stroke="#8a5a2b" stroke-width="4"/><g transform="translate(${x - 45} ${y}) scale(.75)">${LANTERN('#e8262d', true).replace(/<svg[^>]*>|<\/svg>/g, '')}</g></g>`).join('')}
</svg>`;
export const NY_ICON = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#fff1dd"/><rect width="420" height="40" fill="#d6262b"/>
  <g transform="translate(40 60)">${LANTERN('#e8262d', true).replace(/<svg[^>]*>/, '<svg x="0" y="0" width="120" height="170" viewBox="0 0 120 170">')}</g>
  <g transform="translate(250 50)">${FU(130)}</g>
  <g transform="translate(150 200) scale(.6)">${NIAN}</g>
</svg>`;

// 煙火：點的地方炸開一朵
export function fireworkSvg(color) {
  const rays = [...Array(16)].map((_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `<path d="M${(Math.cos(a) * 30).toFixed(1)} ${(Math.sin(a) * 30).toFixed(1)}L${(Math.cos(a) * 110).toFixed(1)} ${(Math.sin(a) * 110).toFixed(1)}" stroke="${color}" stroke-width="7" stroke-linecap="round"/><circle cx="${(Math.cos(a) * 124).toFixed(1)}" cy="${(Math.sin(a) * 124).toFixed(1)}" r="7" fill="#fff6c8"/>`;
  }).join('');
  return `<svg viewBox="-140 -140 280 280" width="280" height="280">${rays}<circle r="18" fill="#fff6c8"/></svg>`;
}

// 郵輪：郊區碼頭 → 歡樂島。船長噗噗。
import { shipSvg } from './island.js';

const night = (ph) => ph === 'night' || ph === 'dusk';

// 碼頭：木棧道、靠岸的大郵輪、跳板
export function cruisePierBack(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#2a3550' : '#bfe6fb'}"/>
    ${n ? '' : '<g fill="#fff" opacity=".9"><ellipse cx="200" cy="90" rx="70" ry="20"/><ellipse cx="940" cy="70" rx="56" ry="16"/></g>'}
    <rect y="380" width="1200" height="520" fill="${n ? '#1f3f66' : '#5fc0ec'}"/>
    ${[[120, 430], [520, 470], [900, 420], [300, 520]].map(([x, y]) => `<path d="M${x} ${y}q20 -10 40 0t40 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`).join('')}
    ${shipSvg(170, 120, 3.3, n)}
    <rect y="700" width="1200" height="200" fill="#b8895a"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 700V900" stroke="#9a6c3e" stroke-width="4"/>`).join('')}
    <rect y="690" width="1200" height="16" fill="#8a5a2b"/>
    ${[60, 1140].map((x) => `<rect x="${x - 14}" y="660" width="28" height="50" rx="8" fill="#5a3a22"/><path d="M${x - 14} 676h28" stroke="#ffd34d" stroke-width="4"/>`).join('')}
  </svg>`;
}
// 跳板（點了上船）
export const GANGWAY = `<svg viewBox="0 0 260 200" width="260" height="200"><path d="M10 190L230 40L250 60L30 200Z" fill="#c9d0d6" stroke="#8a939e" stroke-width="5" stroke-linejoin="round"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${40 + i * 34} ${170 - i * 22}l20 14" stroke="#8a939e" stroke-width="4"/>`).join('')}
  <path d="M30 150L220 22M44 170L236 42" stroke="#e5484d" stroke-width="6" stroke-linecap="round"/></svg>`;

// 甲板：欄杆、會捲動的海（另外一條）
export function deckBack(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="420" fill="${n ? '#2a3550' : '#bfe6fb'}"/>
    <rect y="600" width="1200" height="300" fill="#e8dcc6"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${620 + i * 24}H1200" stroke="#d8c8aa" stroke-width="3"/>`).join('')}
    <rect y="586" width="1200" height="18" fill="#fff"/>
  </svg>`;
}
export function seaStrip(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 2400 300" preserveAspectRatio="none"><rect width="2400" height="300" fill="${n ? '#1f3f66' : '#5fc0ec'}"/>
    <rect width="2400" height="30" fill="${n ? '#2a4a76' : '#8fd4f4'}"/>
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 100 + (i % 3) * 20} ${80 + (i % 4) * 50}q20 -10 40 0t40 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`).join('')}</svg>`;
}
// 欄杆（在海的前面）
export const RAILING = `<svg viewBox="0 0 1200 220" width="1200" height="220" preserveAspectRatio="none">
  <rect y="20" width="1200" height="16" rx="8" fill="#fff" stroke="#c9d0d6" stroke-width="3"/><rect y="100" width="1200" height="10" rx="5" fill="#fff" stroke="#c9d0d6" stroke-width="2"/>
  ${Array.from({ length: 21 }, (_, i) => `<rect x="${i * 60 - 4}" y="20" width="10" height="200" fill="#fff" stroke="#c9d0d6" stroke-width="2"/>`).join('')}
  <g transform="translate(1040 120)"><circle r="44" fill="#ff6b3d"/><circle r="26" fill="#bfe6fb"/>${[45, 135, 225, 315].map((a) => `<path d="M${Math.cos(a * Math.PI / 180) * 26} ${Math.sin(a * Math.PI / 180) * 26}L${Math.cos(a * Math.PI / 180) * 44} ${Math.sin(a * Math.PI / 180) * 44}" stroke="#fff" stroke-width="12"/>`).join('')}</g></svg>`;
// 遠遠的歡樂島
export const ISLAND_FAR = `<svg viewBox="0 0 500 160" width="500" height="160"><path d="M0 150Q60 60 160 70Q240 20 330 60Q430 50 500 150Z" fill="#7cc46a"/>
  <path d="M0 150Q250 120 500 150Z" fill="#f6e2a8"/><g transform="translate(150 40)"><path d="M0 40V10" stroke="#8a5a2b" stroke-width="6"/><ellipse cy="6" rx="30" ry="9" fill="#5aa84a"/></g>
  <g transform="translate(300 18)"><rect x="-6" y="0" width="12" height="40" fill="#e5484d"/><path d="M6 2L30 10L6 18Z" fill="#ffd34d"/></g>
  <circle cx="380" cy="64" r="22" fill="none" stroke="#ff8fb0" stroke-width="5"/></svg>`;

// 救生衣（穿在小孩身上）、三個扣子
export const LIFE_VEST = `<svg viewBox="0 0 120 120" width="120" height="120"><path d="M20 10H50L56 34H64L70 10H100L110 110H10Z" fill="#ff7a1a" stroke="#d9590a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M14 70H106" stroke="#d8ff3c" stroke-width="8"/><path d="M14 70H106" stroke="#c9d0d6" stroke-width="2"/>
  ${[44, 66, 88].map((y) => `<rect x="50" y="${y - 6}" width="20" height="12" rx="3" fill="#333"/>`).join('')}</svg>`;
export const BUCKLE = (i) => `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#ffb300" stroke-width="6"/>
  <rect x="22" y="38" width="26" height="24" rx="5" fill="#333"/><rect x="52" y="40" width="28" height="20" rx="4" fill="#555"/><path d="M48 50h6" stroke="#ffd34d" stroke-width="5"/>
  <circle cx="${[30, 50, 70][i % 3]}" cy="80" r="5" fill="#ffb300"/></svg>`;

// 海豚、海鷗
export const DOLPHIN = `<svg viewBox="0 0 200 120" width="200" height="120"><path d="M10 80Q50 20 130 30Q170 34 190 54Q172 60 160 58Q150 80 120 86Q80 96 40 92Z" fill="#6a8ab0"/>
  <path d="M40 90Q80 80 130 66Q120 84 90 90Z" fill="#c8d8ea"/><path d="M96 34L110 4L122 34Z" fill="#5a7aa0"/><path d="M16 78L-4 64L4 96Z" fill="#5a7aa0"/>
  <circle cx="160" cy="46" r="5" fill="#1d2433"/><circle cx="162" cy="44" r="1.6" fill="#fff"/><path d="M168 56Q178 60 186 56" stroke="#3a4a6a" stroke-width="2" fill="none"/></svg>`;
export const GULL = `<svg viewBox="0 0 140 120" width="140" height="120"><ellipse cx="66" cy="70" rx="40" ry="26" fill="#fff" stroke="#d8dde4" stroke-width="3"/>
  <path d="M30 60Q60 40 92 62Q70 74 30 70Z" fill="#9aa4b0"/><path d="M26 70L6 62L20 80Z" fill="#9aa4b0"/>
  <circle cx="100" cy="48" r="20" fill="#fff" stroke="#d8dde4" stroke-width="3"/><circle cx="106" cy="44" r="4" fill="#1d2433"/>
  <path d="M116 50L136 54L116 58Z" fill="#ffc400"/><circle cx="130" cy="55" r="2.5" fill="#e5484d"/>
  <path d="M56 94V110M76 94V110" stroke="#ffb300" stroke-width="4"/><path d="M50 110h12M70 110h12" stroke="#ffb300" stroke-width="4" stroke-linecap="round"/></svg>`;

// 圖卡（100x100）
export const CR = {
  hold: `<rect width="100" height="100" rx="16" fill="#e8f6ff"/><path d="M8 40H92M8 64H92" stroke="#fff" stroke-width="6"/><path d="M8 40H92" stroke="#c9d0d6" stroke-width="2"/>
    <circle cx="50" cy="30" r="12" fill="#ffd6b8"/><path d="M50 42V80M50 80L40 96M50 80L60 96M50 50L30 40M50 50L70 40" stroke="#3a7bd5" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="30" r="12" fill="#ffd6b8"/>`,
  climb: `<rect width="100" height="100" rx="16" fill="#ffe8e8"/><path d="M8 50H92M8 74H92" stroke="#c9d0d6" stroke-width="6"/>
    <circle cx="44" cy="22" r="11" fill="#ffd6b8"/><path d="M44 33L52 54M52 54L40 74M52 54L66 50M44 40L30 50M44 40L62 30" stroke="#3a7bd5" stroke-width="7" stroke-linecap="round"/>
    <path d="M8 92q20 -8 40 0t40 0" stroke="#5fc0ec" stroke-width="5" fill="none"/>`,
  feed: `<rect width="100" height="100" rx="16" fill="#ffe8e8"/><g transform="translate(40 30) scale(.4)">${GULL.replace(/<svg[^>]*>|<\/svg>/g, '')}</g><path d="M14 70H40L36 92H18Z" fill="#e5484d"/><circle cx="27" cy="80" r="6" fill="#ffd34d"/><path d="M40 70Q50 60 56 66" stroke="#ffd6b8" stroke-width="6" stroke-linecap="round" fill="none"/>`,
  nofeed: `<rect width="100" height="100" rx="16" fill="#e8f6e8"/><g transform="translate(46 16) scale(.4)">${GULL.replace(/<svg[^>]*>|<\/svg>/g, '')}</g><rect x="12" y="56" width="34" height="34" rx="6" fill="#8a5a2b"/><path d="M12 68H46" stroke="#5a3a22" stroke-width="4"/><path d="M22 52H36V58H22Z" fill="#e5484d"/>`,
  num: (k) => `<rect width="100" height="100" rx="16" fill="#fff6d6"/>${Array.from({ length: k }, (_, i) => `<circle cx="${k === 1 ? 50 : 22 + (i % 3) * 28}" cy="${k <= 3 ? 50 : 34 + Math.floor(i / 3) * 32}" r="11" fill="#6a8ab0"/>`).join('')}`,
};

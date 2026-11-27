// 注音課的圖（11/27）：符號（用筆順資料畫）、結合韻直式卡、22 張圖卡、合音小鳥、坐姿圖
import { STROKES } from '../data/zhuyin.js';

// 一筆的 path（座標 0–100）
export const strokePath = (pts, ox = 0, oy = 0, k = 1) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(ox + x * k).toFixed(1)} ${(oy + y * k).toFixed(1)}`).join('');

// 整個符號：放在 (ox, oy)、邊長 size 的格子裡
export function glyph(sym, { ox = 0, oy = 0, size = 100, color = '#2b3a67', w = 9 } = {}) {
  const k = size / 100;
  return (STROKES[sym] || []).map((s) => `<path d="${strokePath(s, ox, oy, k)}" fill="none" stroke="${color}" stroke-width="${w * k}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
}

// 結合韻卡（viewBox 0 0 100 100）：兩個符號直直排（直式注音）
export function jieheCard(syms, color = '#2b3a67') {
  return `<rect x="22" y="2" width="56" height="96" rx="8" fill="#fffdf6" stroke="#e8dcc4" stroke-width="1.5"/>
    ${glyph(syms[0], { ox: 26, oy: 3, size: 48, color, w: 10 })}${glyph(syms[1], { ox: 26, oy: 50, size: 48, color, w: 10 })}`;
}
// 單一符號卡
export const symCard = (sym, color = '#2b3a67') => `<rect x="6" y="6" width="88" height="88" rx="10" fill="#fffdf6" stroke="#e8dcc4" stroke-width="1.5"/>${glyph(sym, { ox: 10, oy: 10, size: 80, color, w: 10 })}`;

// 習字格（一格，viewBox 單位）：外框＋十字虛線
export function cellSvg(oy = 0) {
  return `<rect x="1.5" y="${oy + 1.5}" width="97" height="97" rx="3" fill="#fffefa" stroke="#e06a5a" stroke-width="1.6"/>
    <path d="M50 ${oy + 4}V${oy + 96}M4 ${oy + 50}H96" stroke="#f0b4aa" stroke-width="0.8" stroke-dasharray="3 3"/>`;
}

// ---------- 22 張圖卡（viewBox 0 0 100 100）----------
const eye = (x, y, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2b2b"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
export const PIC = {
  duck: `<ellipse cx="50" cy="66" rx="30" ry="20" fill="#ffd84d"/><circle cx="68" cy="40" r="15" fill="#ffd84d"/><path d="M80 40L95 44L80 48Z" fill="#ff9a2e"/>${eye(70, 36)}<path d="M30 62Q44 54 54 66" fill="none" stroke="#e6b800" stroke-width="3"/><ellipse cx="50" cy="88" rx="34" ry="5" fill="#8fd3ff"/>`,
  pull: `<path d="M8 40H92" stroke="#b07a3c" stroke-width="5" stroke-linecap="round"/><circle cx="28" cy="30" r="9" fill="#ffcf9e"/><rect x="21" y="40" width="14" height="26" rx="6" fill="#ff8fb8"/><path d="M24 66L18 86M32 66L40 86" stroke="#555" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="30" r="9" fill="#ffcf9e"/><rect x="53" y="40" width="14" height="26" rx="6" fill="#6fd27a"/><path d="M56 66L50 86M64 66L72 86" stroke="#555" stroke-width="5" stroke-linecap="round"/><path d="M88 40Q96 52 88 64" fill="none" stroke="#ffb04d" stroke-width="3"/>${eye(31, 29, 1.8)}${eye(63, 29, 1.8)}`,
  coconut: `<path d="M50 92V40" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/><path d="M50 40Q30 24 10 36M50 40Q70 24 90 36M50 40Q40 18 22 16M50 40Q60 18 78 16" fill="none" stroke="#3aa65a" stroke-width="7" stroke-linecap="round"/><circle cx="43" cy="47" r="7" fill="#7a4a1e"/><circle cx="57" cy="47" r="7" fill="#7a4a1e"/>`,
  cliff: `<path d="M6 92V36L30 30L44 44L56 40V92Z" fill="#a88a64"/><path d="M6 36L30 30L44 44L56 40" fill="none" stroke="#5fae4e" stroke-width="6"/><path d="M56 92H96" stroke="#8fd3ff" stroke-width="10"/><path d="M62 24l4 -6 4 6" fill="none" stroke="#555" stroke-width="2"/><path d="M74 16l4 -6 4 6" fill="none" stroke="#555" stroke-width="2"/>`,
  key: `<circle cx="30" cy="50" r="18" fill="none" stroke="#e6b800" stroke-width="9"/><path d="M46 50H90M78 50V64M88 50V60" stroke="#e6b800" stroke-width="9" stroke-linecap="round"/>`,
  squid: `<path d="M50 8L72 36V60H28V36Z" fill="#ff9a8a"/><path d="M32 60Q26 80 32 92M42 60Q38 82 44 94M50 60V94M58 60Q62 82 56 94M68 60Q74 80 68 92" fill="none" stroke="#ff9a8a" stroke-width="5" stroke-linecap="round"/>${eye(42, 46)}${eye(58, 46)}`,
  eye: `<path d="M8 50Q50 12 92 50Q50 88 8 50Z" fill="#fff" stroke="#2b3a67" stroke-width="4"/><circle cx="50" cy="50" r="17" fill="#6b4a2b"/><circle cx="50" cy="50" r="8" fill="#1d1d1d"/><circle cx="56" cy="44" r="4" fill="#fff"/><path d="M22 30L16 22M38 22L36 13M62 22L64 13M78 30L84 22" stroke="#2b3a67" stroke-width="3" stroke-linecap="round"/>`,
  music: `<path d="M36 72V22L80 12V62" fill="none" stroke="#7b61ff" stroke-width="7" stroke-linejoin="round"/><ellipse cx="27" cy="74" rx="12" ry="9" fill="#7b61ff"/><ellipse cx="71" cy="64" rx="12" ry="9" fill="#7b61ff"/><path d="M36 30L80 20" stroke="#7b61ff" stroke-width="7"/>`,
  sheep: `${[30, 44, 58, 72].map((x) => `<circle cx="${x}" cy="56" r="14" fill="#fff" stroke="#ddd" stroke-width="2"/>`).join('')}${[37, 51, 65].map((x) => `<circle cx="${x}" cy="44" r="12" fill="#fff" stroke="#ddd" stroke-width="2"/>`).join('')}<ellipse cx="20" cy="46" rx="11" ry="13" fill="#f2d7c4"/>${eye(17, 44, 2.4)}<path d="M36 70V88M64 70V88" stroke="#6b5a4e" stroke-width="5" stroke-linecap="round"/>`,
  cherry: `<path d="M48 14Q40 40 30 60M48 14Q60 40 70 58" fill="none" stroke="#4e8a3a" stroke-width="4"/><path d="M48 14Q66 8 74 22Q60 24 48 14Z" fill="#5fae4e"/><circle cx="30" cy="68" r="16" fill="#e0304a"/><circle cx="70" cy="66" r="16" fill="#e0304a"/><circle cx="25" cy="62" r="4" fill="#ff8a9a"/><circle cx="65" cy="60" r="4" fill="#ff8a9a"/>`,
  frog: `<ellipse cx="50" cy="64" rx="34" ry="24" fill="#5fc25a"/><circle cx="34" cy="38" r="12" fill="#5fc25a"/><circle cx="66" cy="38" r="12" fill="#5fc25a"/><circle cx="34" cy="37" r="7" fill="#fff"/><circle cx="66" cy="37" r="7" fill="#fff"/><circle cx="35" cy="38" r="3.5" fill="#222"/><circle cx="67" cy="38" r="3.5" fill="#222"/><path d="M34 66Q50 78 66 66" fill="none" stroke="#2e7a2a" stroke-width="3" stroke-linecap="round"/>`,
  nest: `<path d="M12 56Q50 98 88 56Z" fill="#a8743a"/><path d="M14 58Q50 72 86 58M20 66Q50 80 80 66" fill="none" stroke="#7a5228" stroke-width="3"/><ellipse cx="38" cy="54" rx="9" ry="11" fill="#bfe6ff"/><ellipse cx="52" cy="52" rx="9" ry="11" fill="#bfe6ff"/><ellipse cx="65" cy="55" rx="9" ry="11" fill="#bfe6ff"/>`,
  tilt: `<g transform="rotate(-18 50 88)"><rect x="38" y="18" width="24" height="70" rx="4" fill="#ffcf6e" stroke="#c9952e" stroke-width="3"/><path d="M38 34H62M38 50H62M38 66H62" stroke="#c9952e" stroke-width="3"/><path d="M34 18L50 4L66 18Z" fill="#e0304a"/></g><path d="M6 90H94" stroke="#5fae4e" stroke-width="5" stroke-linecap="round"/>`,
  scarf: `<path d="M18 30Q50 46 82 30L84 44Q50 60 16 44Z" fill="#e0304a"/><path d="M60 50L66 92H50L48 54Z" fill="#e0304a"/><path d="M24 36L26 46M36 40L38 50M48 42V52M60 40L58 50M72 36L70 46M52 70H64M54 82H65" stroke="#fff" stroke-width="3"/>`,
  bowl: `<path d="M10 44H90Q88 84 50 86Q12 84 10 44Z" fill="#7fc4ff"/><path d="M10 44H90" stroke="#4a8fd0" stroke-width="4"/><path d="M34 86H66" stroke="#4a8fd0" stroke-width="6" stroke-linecap="round"/><ellipse cx="50" cy="42" rx="34" ry="8" fill="#fff"/><path d="M58 40L84 12M64 42L90 16" stroke="#b07a3c" stroke-width="3" stroke-linecap="round"/>`,
  mosquito: `<ellipse cx="54" cy="56" rx="22" ry="9" fill="#555" transform="rotate(-15 54 56)"/><circle cx="30" cy="62" r="9" fill="#555"/><path d="M22 66L6 76" stroke="#555" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="36" rx="12" ry="20" fill="#d6ecff" stroke="#9cc" stroke-width="2" transform="rotate(-30 50 36)"/><ellipse cx="64" cy="36" rx="10" ry="18" fill="#d6ecff" stroke="#9cc" stroke-width="2" transform="rotate(20 64 36)"/><path d="M44 62L40 84M54 62L56 86M64 58L74 80" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>${eye(28, 60, 2.4)}`,
  dog: `<ellipse cx="50" cy="56" rx="26" ry="24" fill="#d9a066"/><ellipse cx="24" cy="50" rx="9" ry="18" fill="#8a5a2b"/><ellipse cx="76" cy="50" rx="9" ry="18" fill="#8a5a2b"/>${eye(41, 50)}${eye(59, 50)}<ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#2b2b2b"/><path d="M50 66Q50 76 58 76" fill="none" stroke="#2b2b2b" stroke-width="2"/><path d="M80 20q6 4 0 8M86 14q10 8 0 18" fill="none" stroke="#ffb04d" stroke-width="3" stroke-linecap="round"/>`,
  bee: `<ellipse cx="50" cy="58" rx="26" ry="18" fill="#ffd84d"/><path d="M40 42V74M54 40V76" stroke="#3a3a3a" stroke-width="7"/><ellipse cx="42" cy="34" rx="12" ry="9" fill="#e6f5ff" stroke="#9cc" stroke-width="2"/><ellipse cx="60" cy="32" rx="12" ry="9" fill="#e6f5ff" stroke="#9cc" stroke-width="2"/><circle cx="26" cy="58" r="10" fill="#3a3a3a"/>${eye(24, 56, 2.2)}<path d="M76 58L86 58" stroke="#3a3a3a" stroke-width="3"/><path d="M84 30q4 4 0 8M90 24q8 8 0 16" fill="none" stroke="#ffb04d" stroke-width="3" stroke-linecap="round"/>`,
  moon: `<path d="M62 10A40 40 0 1 0 90 66A32 32 0 1 1 62 10Z" fill="#ffd84d"/><circle cx="20" cy="20" r="2.5" fill="#ffd84d"/><circle cx="86" cy="24" r="2" fill="#ffd84d"/>`,
  circle: `<circle cx="50" cy="50" r="34" fill="none" stroke="#ff8a3d" stroke-width="10"/><circle cx="50" cy="50" r="6" fill="#ff8a3d"/>`,
  cloud: `<path d="M22 70Q6 70 8 56Q10 42 26 44Q28 26 46 28Q58 14 72 28Q92 28 90 48Q96 70 76 70Z" fill="#fff" stroke="#9cc7e6" stroke-width="3"/><path d="M8 82H92" stroke="#bfe6ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 8"/>`,
  swim: `<path d="M4 62Q16 54 28 62T52 62T76 62T100 62V100H0Z" fill="#7fc4ff"/><circle cx="46" cy="50" r="10" fill="#ffcf9e"/><path d="M38 46Q46 36 54 46" fill="#ff6b6b"/><path d="M56 56L80 40M36 56L16 44" stroke="#ffcf9e" stroke-width="6" stroke-linecap="round"/>${eye(49, 51, 1.8)}`,
};

// ---------- 合音小鳥：肚子上寫符號 ----------
export function birdSvg(sym, color = '#7fc4ff', flip = false) {
  // 往左飛的小鳥只翻身體，肚子上的符號不能翻
  const body = `<path d="M20 56Q6 40 18 30Q30 44 34 52Z" fill="${color}" opacity=".8"/>
    <ellipse cx="62" cy="62" rx="44" ry="38" fill="${color}"/>
    <circle cx="80" cy="34" r="20" fill="${color}"/>
    <path d="M98 32L114 38L98 42Z" fill="#ffb04d"/>
    ${eye(86, 30, 3.6)}
    <path d="M50 98L46 108M64 98L66 108" stroke="#ffb04d" stroke-width="4" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 120 110" width="150" height="138">
    <g${flip ? ' transform="translate(120 0) scale(-1 1)"' : ''}>${body}</g>
    <ellipse cx="${flip ? 62 : 58}" cy="70" rx="28" ry="26" fill="#fffdf6"/>
    ${glyph(sym, { ox: flip ? 42 : 38, oy: 50, size: 40, color: '#2b3a67', w: 11 })}
  </svg>`;
}

// ---------- 坐姿（頭正、身直、腳平放）----------
export const POSTURE = `<svg viewBox="0 0 200 200" width="300" height="300">
  <rect x="96" y="96" width="98" height="10" rx="4" fill="#b07a3c"/><rect x="176" y="106" width="8" height="80" fill="#8a5a2b"/>
  <rect x="40" y="132" width="56" height="10" rx="4" fill="#8a5a2b"/><rect x="44" y="142" width="7" height="44" fill="#6b4422"/><rect x="85" y="142" width="7" height="44" fill="#6b4422"/>
  <rect x="38" y="70" width="8" height="66" rx="3" fill="#8a5a2b"/>
  <circle cx="74" cy="40" r="18" fill="#ffcf9e"/><path d="M56 36Q60 18 76 20Q92 22 92 38" fill="#3a2a22"/>
  <rect x="60" y="58" width="28" height="50" rx="10" fill="#ff8fb8"/>
  <path d="M86 70L112 92L140 92" fill="none" stroke="#ffcf9e" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M66 108H104V150M80 108H96V150" fill="none" stroke="#5a6cc9" stroke-width="10" stroke-linejoin="round"/>
  <path d="M96 150V184H112M104 150V184" stroke="#5a6cc9" stroke-width="9" stroke-linecap="round"/>
  <path d="M90 186H116" stroke="#333" stroke-width="7" stroke-linecap="round"/>
  <path d="M148 88L168 72" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/>
  <path d="M30 20V188" stroke="#5fc25a" stroke-width="3" stroke-dasharray="6 6"/>
  <path d="M74 14V2M74 2l-6 8M74 2l6 8" stroke="#5fc25a" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M4 192H196" stroke="#5fc25a" stroke-width="4" stroke-linecap="round"/>
</svg>`;

// 作品牆的一格（今天寫最端正的）：cells＝每一格的筆畫 [[[x,y]...], ...]
export function workSvg(cells, size = 140) {
  const h = cells.length * 100;
  return `<svg viewBox="0 0 100 ${h}" width="${size * (cells.length > 1 ? 0.62 : 1)}" height="${size * (cells.length > 1 ? 1.24 : 1)}">
    ${cells.map((_, i) => cellSvg(i * 100)).join('')}
    ${cells.map((st, i) => st.map((s) => `<path d="${strokePath(s, 0, i * 100)}" fill="none" stroke="#2b3a67" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`).join('')).join('')}
  </svg>`;
}

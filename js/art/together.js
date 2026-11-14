// 「一起做」用的圖示與背景。圖示都是 100x100 的 viewBox。
import { roomSvg } from './bedroom.js';
import { doorView, itemIcon } from './door.js';
import { kitchenBack, wareSvg } from './kitchen.js';
import { classroomBack } from './school.js';
import { farmBack } from './farm.js';
import { roadSvg, CABIN, MIRROR } from './car.js';
import { bathBack } from './bathroom.js';
import { parkBack } from './park.js';

const I = {
  // 玩遊戲：遊戲手把
  game: `<rect x="8" y="30" width="84" height="46" rx="23" fill="#4f7cff"/><rect x="8" y="30" width="84" height="46" rx="23" fill="none" stroke="#2f56c8" stroke-width="4"/>
    <rect x="22" y="47" width="22" height="8" rx="3" fill="#fff"/><rect x="29" y="40" width="8" height="22" rx="3" fill="#fff"/>
    <circle cx="66" cy="45" r="6" fill="#ffd34d"/><circle cx="78" cy="55" r="6" fill="#ff6b8a"/><circle cx="66" cy="63" r="5" fill="#5ed17a"/>`,
  // 一起做的小徽章：兩隻手牽在一起
  hands2: `<path d="M50 88C20 70 8 52 8 36C8 22 18 12 30 12C40 12 46 18 50 26C54 18 60 12 70 12C82 12 92 22 92 36C92 52 80 70 50 88Z" fill="#ff6b8a"/>
    <circle cx="36" cy="44" r="12" fill="#ffd9b8"/><circle cx="64" cy="44" r="12" fill="#f2c39a"/><path d="M36 44H64" stroke="#e8a77a" stroke-width="6" stroke-linecap="round"/>`,
  check: `<path d="M18 52L40 74L84 26" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`,
  moon: `<circle cx="50" cy="50" r="40" fill="#2c3a7a"/><path d="M60 22A30 30 0 1 0 74 72A24 24 0 1 1 60 22Z" fill="#ffe680"/>
    <circle cx="28" cy="30" r="3" fill="#fff"/><circle cx="74" cy="34" r="2.5" fill="#fff"/><circle cx="30" cy="72" r="2" fill="#fff"/>`,
  toybox: `<rect x="14" y="44" width="72" height="44" rx="6" fill="#ff9f43"/><rect x="10" y="38" width="80" height="12" rx="5" fill="#e67e22"/>
    <circle cx="34" cy="30" r="13" fill="#4f7cff"/><rect x="52" y="16" width="24" height="24" rx="4" fill="#5ed17a" transform="rotate(12 64 28)"/><path d="M40 66H60" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  pajamas: `<path d="M30 16L50 24L70 16L90 34L78 46L72 42V86H28V42L22 46L10 34Z" fill="#9b85f0"/>
    <circle cx="38" cy="56" r="4" fill="#fff"/><circle cx="60" cy="66" r="4" fill="#fff"/><circle cx="44" cy="76" r="3" fill="#fff"/><path d="M58 40l3 6l6 1l-4 4l1 6l-6-3l-6 3l1-6l-4-4l6-1Z" fill="#ffe680"/>`,
  toilet: `<rect x="22" y="10" width="30" height="40" rx="6" fill="#e9f4f8" stroke="#9cc6d4" stroke-width="4"/>
    <path d="M14 50H86Q84 72 60 76L64 90H30L34 76Q16 72 14 50Z" fill="#fff" stroke="#9cc6d4" stroke-width="4" stroke-linejoin="round"/><ellipse cx="50" cy="52" rx="30" ry="6" fill="#cfe8f0"/>`,
  toothbrush: `<rect x="44" y="30" width="12" height="64" rx="6" fill="#4f7cff" transform="rotate(30 50 60)"/>
    <g transform="rotate(30 50 60)"><rect x="40" y="6" width="20" height="28" rx="5" fill="#fff" stroke="#9cc6d4" stroke-width="3"/>
    <path d="M44 10V30M50 10V30M56 10V30" stroke="#6cc7ea" stroke-width="3"/><path d="M38 4Q50 -6 62 4" fill="#5ed17a"/></g>`,
  book: `<path d="M50 24Q30 12 10 18V84Q30 78 50 88Z" fill="#ff6b8a"/><path d="M50 24Q70 12 90 18V84Q70 78 50 88Z" fill="#ff8fa8"/>
    <path d="M50 24V88" stroke="#c9466a" stroke-width="3"/><path d="M20 34Q32 30 42 36M20 46Q32 42 42 48M58 36Q68 30 80 34M58 48Q68 42 80 46" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  hands: `<path d="M30 92V56L18 40a7 7 0 0 1 11-9l9 11V20a7 7 0 0 1 14 0V50" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"/>
    <path d="M70 92V56L82 40a7 7 0 0 0-11-9l-9 11V20a7 7 0 0 0-14 0V50" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"/>
    <circle cx="26" cy="20" r="7" fill="#bfe9ff"/><circle cx="78" cy="14" r="5" fill="#bfe9ff"/><circle cx="84" cy="30" r="4" fill="#bfe9ff"/>`,
  faucet: `<rect x="14" y="26" width="58" height="16" rx="8" fill="#a9b6c4"/><rect x="56" y="26" width="16" height="30" rx="6" fill="#a9b6c4"/>
    <rect x="22" y="14" width="22" height="10" rx="4" fill="#4f7cff"/><path d="M64 60q-6 12 0 30M64 60q6 12 0 30" stroke="#6cc7ea" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  soap: `<rect x="16" y="44" width="68" height="40" rx="14" fill="#ffb3d1"/><rect x="24" y="52" width="30" height="10" rx="5" fill="#fff" opacity=".6"/>
    <circle cx="34" cy="30" r="10" fill="#cfefff" stroke="#9cd8f2" stroke-width="2"/><circle cx="56" cy="22" r="7" fill="#cfefff" stroke="#9cd8f2" stroke-width="2"/><circle cx="72" cy="34" r="8" fill="#cfefff" stroke="#9cd8f2" stroke-width="2"/>`,
  towel: `<rect x="12" y="16" width="76" height="12" rx="6" fill="#a9b6c4"/><path d="M20 22H80V86Q50 92 20 86Z" fill="#6cc7ea"/>
    <path d="M20 70H80M20 76H80" stroke="#fff" stroke-width="4"/>`,
  bowl: `<g transform="translate(0 4)">${'<path d="M10 44H90Q88 82 50 84Q12 82 10 44Z" fill="#ffd34d"/><path d="M10 44H90" stroke="#e0a800" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="40" rx="34" ry="10" fill="#fff"/>'}
    <path d="M70 6L56 42" stroke="#c98b5e" stroke-width="5" stroke-linecap="round"/><path d="M80 10L64 44" stroke="#c98b5e" stroke-width="5" stroke-linecap="round"/></g>`,
  table: `<rect x="6" y="40" width="88" height="10" rx="4" fill="#c8915a"/><rect x="14" y="50" width="8" height="40" fill="#a8703a"/><rect x="78" y="50" width="8" height="40" fill="#a8703a"/>
    <path d="M22 26H52Q50 40 37 40Q24 40 22 26Z" fill="#ffd34d"/><ellipse cx="68" cy="34" rx="9" ry="5" fill="#a9b6c4"/><path d="M68 34L84 14" stroke="#a9b6c4" stroke-width="5" stroke-linecap="round"/>`,
  eat: `<circle cx="50" cy="52" r="40" fill="#fff" stroke="#e8d6b8" stroke-width="4"/><circle cx="50" cy="52" r="28" fill="#f7efe0"/>
    <path d="M30 52a20 14 0 0 1 40 0Z" fill="#fff8e6" stroke="#e8d6b8" stroke-width="2"/><circle cx="62" cy="62" r="7" fill="#5ed17a"/><circle cx="40" cy="64" r="6" fill="#ff9f43"/>`,
  thanks: `<path d="M50 90L36 54Q32 40 42 30L50 14L58 30Q68 40 64 54Z" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 22V86" stroke="#c98b5e" stroke-width="3"/><path d="M18 30l8 6M14 50h10M82 30l-8 6M86 50H76" stroke="#ffb300" stroke-width="5" stroke-linecap="round"/>`,
  sink: `<rect x="8" y="50" width="84" height="12" rx="5" fill="#a9b6c4"/><path d="M16 62H84L76 88H24Z" fill="#cfe2ec"/>
    <path d="M28 50Q50 30 72 50" fill="#ffd34d"/><path d="M34 42L48 22" stroke="#c98b5e" stroke-width="5" stroke-linecap="round"/>`,
  shoes: `<g transform="translate(0 12)">${'<path d="M8 50V30Q8 22 16 22H30Q36 36 50 38L60 40Q70 42 70 52V60H8Z" fill="#ff6b5c"/><rect x="6" y="58" width="66" height="10" rx="4" fill="#fff"/>'}<path d="M36 30L42 26M42 34L48 30" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`,
  bag: `<path d="M34 24Q34 8 50 8Q66 8 66 24" fill="none" stroke="#c9466a" stroke-width="7"/><rect x="16" y="22" width="68" height="70" rx="16" fill="#ff6b8a"/>
    <rect x="28" y="56" width="44" height="26" rx="8" fill="#ff8fa8"/><path d="M28 64H72" stroke="#c9466a" stroke-width="3"/><circle cx="50" cy="40" r="6" fill="#ffd34d"/>`,
  lunch: `<path d="M38 26Q38 14 50 14Q62 14 62 26" fill="none" stroke="#2f8f5a" stroke-width="6"/><rect x="14" y="24" width="72" height="64" rx="12" fill="#5ed17a"/>
    <circle cx="36" cy="50" r="8" fill="#fff" opacity=".7"/><circle cx="62" cy="64" r="10" fill="#fff" opacity=".7"/><circle cx="66" cy="40" r="5" fill="#fff" opacity=".7"/>`,
  notebook: `<rect x="20" y="10" width="62" height="82" rx="6" fill="#4f7cff"/><rect x="20" y="10" width="12" height="82" fill="#2f56c8"/>
    <rect x="40" y="24" width="32" height="16" rx="3" fill="#fff"/><path d="M42 54H74M42 64H74M42 74H66" stroke="#bcd0ff" stroke-width="4" stroke-linecap="round"/>`,
  pencilcase: `<rect x="8" y="36" width="84" height="40" rx="16" fill="#ffb300"/><path d="M16 46H84" stroke="#e08a00" stroke-width="4" stroke-dasharray="6 5"/>
    <g transform="rotate(-20 50 30)"><rect x="24" y="22" width="50" height="10" fill="#ff6b5c"/><path d="M74 22L86 27L74 32Z" fill="#f2d28b"/></g>`,
  homework: `<rect x="10" y="40" width="64" height="50" rx="5" fill="#fff" stroke="#bcd0ff" stroke-width="4"/><path d="M20 54H62M20 64H62M20 74H48" stroke="#bcd0ff" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(35 70 40)"><rect x="64" y="0" width="12" height="56" rx="2" fill="#ffd34d"/><path d="M64 56L70 70L76 56Z" fill="#f2d28b"/><rect x="64" y="0" width="12" height="9" fill="#ff8fa8"/></g>`,
  bunny: `<ellipse cx="38" cy="22" rx="8" ry="20" fill="#fff" stroke="#e7c8d6" stroke-width="3"/><ellipse cx="62" cy="22" rx="8" ry="20" fill="#fff" stroke="#e7c8d6" stroke-width="3"/>
    <ellipse cx="38" cy="24" rx="3.5" ry="13" fill="#ffc2d6"/><ellipse cx="62" cy="24" rx="3.5" ry="13" fill="#ffc2d6"/>
    <circle cx="50" cy="60" r="28" fill="#fff" stroke="#e7c8d6" stroke-width="3"/><circle cx="40" cy="56" r="4" fill="#333"/><circle cx="60" cy="56" r="4" fill="#333"/><path d="M46 66Q50 70 54 66" stroke="#ff7fa8" stroke-width="3" fill="none"/>`,
  duck: `<ellipse cx="54" cy="66" rx="32" ry="22" fill="#ffd34d"/><circle cx="36" cy="38" r="18" fill="#ffd34d"/><path d="M16 40L4 44L16 48Z" fill="#ff8a3d"/>
    <circle cx="32" cy="34" r="3.5" fill="#333"/><path d="M60 58Q76 50 82 64" stroke="#e0a800" stroke-width="4" fill="none"/><path d="M44 86L40 96H52ZM64 86L60 96H72Z" fill="#ff8a3d"/>`,
  cat: `<path d="M24 30L30 8L44 24ZM76 30L70 8L56 24Z" fill="#ffb366"/><circle cx="50" cy="42" r="26" fill="#ffb366"/>
    <path d="M30 70Q50 60 70 70L80 92H20Z" fill="#ffb366"/><path d="M38 42q4-4 8 0M54 42q4-4 8 0" stroke="#333" stroke-width="3" fill="none"/>
    <path d="M47 52L50 55L53 52" fill="#ff7fa8"/><path d="M22 50H36M22 56H36M64 50H78M64 56H78" stroke="#a86a2a" stroke-width="2"/>`,
  chick: `<circle cx="50" cy="56" r="30" fill="#ffe14d"/><path d="M22 54Q4 40 10 62Q16 70 26 64ZM78 54Q96 40 90 62Q84 70 74 64Z" fill="#ffd000"/>
    <circle cx="40" cy="48" r="4" fill="#333"/><circle cx="60" cy="48" r="4" fill="#333"/><path d="M44 58L50 66L56 58Z" fill="#ff8a3d"/><path d="M46 26Q50 16 54 26" stroke="#ffd000" stroke-width="5" fill="none"/>`,
  breathe: `<circle cx="50" cy="50" r="38" fill="#cfefff"/><path d="M24 44Q36 34 48 44T72 44M28 58Q40 48 52 58T76 58" stroke="#4f7cff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  belt: `<rect x="14" y="10" width="72" height="80" rx="16" fill="#5a6b80"/><path d="M24 14L74 86" stroke="#2f3e5c" stroke-width="14"/>
    <rect x="52" y="54" width="26" height="18" rx="4" fill="#d9e1ea" transform="rotate(55 65 63)"/><path d="M20 70Q50 60 80 70" stroke="#2f3e5c" stroke-width="12" fill="none"/>`,
  redcar: `<path d="M10 62V50Q10 44 18 42L30 26Q34 22 40 22H62Q68 22 72 28L80 42Q90 44 90 52V62Z" fill="#e5484d"/>
    <path d="M34 30H48V42H26ZM54 30H66L74 42H54Z" fill="#cfefff"/><circle cx="28" cy="64" r="11" fill="#333"/><circle cx="72" cy="64" r="11" fill="#333"/><circle cx="28" cy="64" r="4" fill="#ccc"/><circle cx="72" cy="64" r="4" fill="#ccc"/>`,
  bus: `<rect x="8" y="18" width="84" height="56" rx="10" fill="#ffb300"/><rect x="14" y="26" width="16" height="18" rx="3" fill="#cfefff"/><rect x="34" y="26" width="16" height="18" rx="3" fill="#cfefff"/>
    <rect x="54" y="26" width="16" height="18" rx="3" fill="#cfefff"/><rect x="74" y="26" width="12" height="30" rx="3" fill="#cfefff"/><path d="M8 54H74" stroke="#e08a00" stroke-width="4"/>
    <circle cx="26" cy="76" r="9" fill="#333"/><circle cx="72" cy="76" r="9" fill="#333"/>`,
  tree: `<rect x="44" y="58" width="12" height="34" rx="4" fill="#8a5a2b"/><circle cx="50" cy="38" r="26" fill="#5ed17a"/><circle cx="30" cy="52" r="16" fill="#4cbf68"/><circle cx="70" cy="52" r="16" fill="#4cbf68"/>`,
  light: `<rect x="34" y="6" width="32" height="70" rx="10" fill="#333"/><circle cx="50" cy="20" r="9" fill="#ff5252"/><circle cx="50" cy="41" r="9" fill="#ffd34d"/><circle cx="50" cy="62" r="9" fill="#5ed17a"/><rect x="46" y="76" width="8" height="20" fill="#555"/>`,
  moto: `<circle cx="22" cy="68" r="14" fill="none" stroke="#333" stroke-width="7"/><circle cx="78" cy="68" r="14" fill="none" stroke="#333" stroke-width="7"/>
    <path d="M22 68L42 46H66L78 68" fill="none" stroke="#4f7cff" stroke-width="8" stroke-linejoin="round"/><path d="M36 46H58Q60 36 50 36H40Z" fill="#4f7cff"/><path d="M66 46L70 30H78" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  zebra: `<rect x="4" y="20" width="92" height="64" rx="6" fill="#6b7280"/>${[14, 32, 50, 68].map((x) => `<rect x="${x}" y="26" width="12" height="52" fill="#fff"/>`).join('')}`,
  park: `<rect x="14" y="30" width="8" height="64" fill="#5fa8e8"/><rect x="34" y="30" width="8" height="64" fill="#5fa8e8"/>${[0, 1, 2].map((i) => `<rect x="14" y="${46 + i * 16}" width="28" height="4" fill="#5fa8e8"/>`).join('')}
    <rect x="10" y="24" width="44" height="10" rx="4" fill="#e5484d"/><path d="M52 28Q76 30 82 60Q88 84 98 86V94Q80 92 74 66Q68 40 52 38Z" fill="#ffd34d"/><circle cx="70" cy="14" r="10" fill="#ffd34d"/>`,
  sandtoys: `<path d="M18 44H60L55 90H23Z" fill="#ff6b5c"/><path d="M18 44Q39 24 60 44" stroke="#e5484d" stroke-width="4" fill="none"/><path d="M70 12L80 64" stroke="#3fb5e8" stroke-width="7" stroke-linecap="round"/><path d="M74 60Q92 64 84 86Q72 82 74 60Z" fill="#3fb5e8"/>`,
  sunscreen: `<rect x="34" y="26" width="32" height="64" rx="10" fill="#ffb300"/><rect x="40" y="12" width="20" height="16" rx="4" fill="#fff"/><circle cx="50" cy="58" r="12" fill="#fff"/><g stroke="#fff" stroke-width="3">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M50 58L${50 + 18 * Math.cos(a * Math.PI / 180)} ${58 + 18 * Math.sin(a * Math.PI / 180)}"/>`).join('')}</g>`,
  go: `<circle cx="50" cy="50" r="40" fill="#5ed17a"/><path d="M38 28L72 50L38 72Z" fill="#fff"/>`,
};
// 出門用的衣物沿用大門場景的圖
const DOOR_ITEMS = ['sneakers', 'boots', 'raincoat', 'umbrella', 'jacket', 'scarf', 'hat', 'bottle'];

export function tgIcon(id, size = 100) {
  if (DOOR_ITEMS.includes(id)) return itemIcon(id, size);
  if (id === 'spoon') return wareSvg('spoon', '#ffb300', size);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" overflow="visible">${I[id] || ''}</svg>`;
}

// 各「一起做」的背景，沿用原場景的畫
export function backFor(kind, ph, wx) {
  switch (kind) {
    case 'sleep': return roomSvg(ph, wx);
    case 'out': return doorView(ph, wx);
    case 'meal': return kitchenBack(ph, wx);
    case 'wash': case 'brush': return bathBack(ph, wx);
    case 'bag': case 'homework': return classroomBack(ph, wx);
    case 'gym': return farmBack(ph, wx);
    case 'outing': return parkBack(ph, wx, { night: false });
    case 'ride': return `<svg viewBox="0 0 1200 900">${CABIN}<g>${roadSvg(ph, wx)}</g>${MIRROR}</svg>`;
    default: return '';
  }
}

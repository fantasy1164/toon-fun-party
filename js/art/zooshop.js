// 歡樂島的美食街（冰淇淋、熱狗）和紀念品店。
import { ITEMS, PLUSH_IDS } from './items.js';

const night = (ph) => ph === 'night' || ph === 'dusk';

// ---------- 美食街 ----------
export function snackBack(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#2a3550' : '#bfe6fb'}"/>
    <path d="M0 420Q300 380 600 410Q900 380 1200 420V900H0Z" fill="${n ? '#3f6a4a' : '#a7dc8a'}"/>
    <rect y="600" width="1200" height="300" fill="${n ? '#6a5f52' : '#e8d4a8'}"/>
    <!-- 冰淇淋攤 -->
    <g transform="translate(60 150)"><rect y="90" width="420" height="300" rx="16" fill="#ff9fc4"/><path d="M-20 96Q210 -10 440 96Z" fill="#fff"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-20 + i * 51} 96q25 30 51 0" fill="${i % 2 ? '#ff9fc4' : '#fff'}"/>`).join('')}
      <rect x="30" y="160" width="360" height="120" rx="12" fill="${n ? '#ffe08a' : '#fff6fb'}"/><rect x="30" y="300" width="360" height="40" rx="8" fill="#e5739f"/>
      <g transform="translate(210 70)"><path d="M-26 0L0 60L26 0Z" fill="#e8b46a"/><circle cy="-14" r="24" fill="#fff0c8"/><circle cx="-14" cy="-30" r="20" fill="#ff9fc4"/><circle cx="14" cy="-30" r="20" fill="#8a5a3a"/></g></g>
    <!-- 熱狗攤 -->
    <g transform="translate(720 160)"><rect y="90" width="420" height="290" rx="16" fill="#ffd34d"/><path d="M-20 96Q210 -10 440 96Z" fill="#e5484d"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-20 + i * 51} 96q25 30 51 0" fill="${i % 2 ? '#e5484d' : '#fff'}"/>`).join('')}
      <rect x="30" y="160" width="360" height="110" rx="12" fill="${n ? '#ffe680' : '#fff6d6'}"/><rect x="60" y="250" width="300" height="20" rx="6" fill="#555"/>${[100, 170, 240, 310].map((x) => `<path d="M${x - 20} 246h40" stroke="#c4553a" stroke-width="14" stroke-linecap="round"/>`).join('')}
      <g transform="translate(210 60)"><rect x="-60" y="-16" width="120" height="34" rx="17" fill="#e8b46a"/><rect x="-52" y="-10" width="104" height="20" rx="10" fill="#c4553a"/><path d="M-44 0q10 -8 20 0t20 0t20 0t20 0" stroke="#ffd34d" stroke-width="4" fill="none"/></g></g>
    ${[[480, 640], [700, 660]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="70" ry="16" fill="#fff" stroke="#d8c8aa" stroke-width="4"/><rect x="-6" y="0" width="12" height="60" fill="#c9d0d6"/></g>`).join('')}
  </svg>`;
}
export const STALL_ICE = `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M38 52L50 94L62 52Z" fill="#e8b46a"/><path d="M40 56l20 10M38 70l18 -12" stroke="#c99448" stroke-width="2"/><circle cx="50" cy="44" r="18" fill="#fff0c8"/><circle cx="40" cy="30" r="15" fill="#ff9fc4"/><circle cx="60" cy="30" r="15" fill="#8a5a3a"/></svg>`;
export const STALL_DOG = `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="12" y="38" width="76" height="30" rx="15" fill="#e8b46a"/><rect x="18" y="44" width="64" height="18" rx="9" fill="#c4553a"/><path d="M24 52q6 -6 12 0t12 0t12 0t12 0" stroke="#ffd34d" stroke-width="3" fill="none"/></svg>`;
// 冰淇淋（三種口味）、熱狗、番茄醬、飲料
export const FLAVOR = { straw: '#ff9fc4', choco: '#8a5a3a', vanilla: '#fff0c8' };
export const iceCream = (c, bites = 0) => `<svg viewBox="0 0 100 140" width="120" height="168"><path d="M30 64L50 136L70 64Z" fill="#e8b46a"/><path d="M34 74l30 14M32 92l28 -16M40 110l18 -10" stroke="#c99448" stroke-width="3"/>
  ${bites < 3 ? `<circle cx="50" cy="56" r="${24 - bites * 6}" fill="${c}"/>` : ''}${bites < 2 ? `<circle cx="50" cy="34" r="${18 - bites * 6}" fill="${c}"/>` : ''}${bites < 1 ? '<circle cx="50" cy="18" r="6" fill="#e5484d"/>' : ''}</svg>`;
export const hotDog = (bites = 0, sauce = false) => `<svg viewBox="0 0 140 80" width="190" height="108"><rect x="${8 + bites * 20}" y="24" width="${124 - bites * 30}" height="40" rx="20" fill="#e8b46a"/>
  ${bites < 4 ? `<rect x="${2 + bites * 20}" y="30" width="${136 - bites * 30}" height="24" rx="12" fill="#c4553a"/>` : ''}
  ${sauce && bites < 4 ? `<path d="M${14 + bites * 20} 40q8 -8 16 0t16 0t16 0t16 0t16 0t16 0" stroke="#e5484d" stroke-width="5" fill="none" stroke-linecap="round"/>` : ''}</svg>`;
export const KETCHUP = `<svg viewBox="0 0 80 140" width="80" height="140"><rect x="16" y="40" width="48" height="96" rx="14" fill="#e5484d"/><path d="M28 40L34 14H46L52 40Z" fill="#fff"/><rect x="36" y="2" width="8" height="14" fill="#fff"/><circle cx="40" cy="88" r="14" fill="#fff" opacity=".7"/></svg>`;

// 回收標誌：四個箭頭圍成一圈（看到這個就丟資源回收）
export const RECYCLE_MARK = (size = 60, c = '#2f9a5f') => `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><circle cx="50" cy="50" r="46" fill="#fff"/>
  ${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} 50 50)"><path d="M28 20Q50 8 72 20" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M66 8L80 22L62 28Z" fill="${c}"/></g>`).join('')}</svg>`;
const markIn = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="50" cy="50" r="46" fill="#fff"/>${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} 50 50)"><path d="M28 20Q50 8 72 20" stroke="#2f9a5f" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M66 8L80 22L62 28Z" fill="#2f9a5f"/></g>`).join('')}</g>`;
// 垃圾：寶特瓶、紙盒有回收標誌；衛生紙、木頭小湯匙丟一般垃圾
export const TRASH = {
  bottle: { bin: 'recycle', svg: (empty = false, flat = false) => `<svg viewBox="0 0 80 150" width="80" height="150"><g transform="${flat ? 'translate(0 60) scale(1 .45)' : ''}">
    <rect x="30" y="4" width="20" height="14" rx="3" fill="#3a7bd5"/><path d="M28 18H52L60 40V140Q60 146 54 146H26Q20 146 20 140V40Z" fill="#d6f0ff" stroke="#8fc4e6" stroke-width="3"/>
    ${empty ? '' : '<path d="M21 70H59V140Q59 145 54 145H26Q21 145 21 140Z" fill="#c9a86a" opacity=".8"/>'}
    <rect x="20" y="52" width="40" height="22" fill="#4caf50"/>${markIn(28, 54, 0.18)}</g></svg>` },
  box: { bin: 'recycle', svg: () => `<svg viewBox="0 0 130 90" width="130" height="90"><path d="M10 30H120L110 84H20Z" fill="#f4e4c4" stroke="#c9a86a" stroke-width="3"/><path d="M10 30L30 10H100L120 30" fill="#fff4dc" stroke="#c9a86a" stroke-width="3"/><path d="M40 50h50" stroke="#e5484d" stroke-width="5" stroke-linecap="round"/>${markIn(84, 52, 0.26)}</svg>` },
  napkin: { bin: 'trash', svg: () => `<svg viewBox="0 0 100 90" width="100" height="90"><path d="M20 30Q30 10 50 18Q70 6 82 26Q94 44 80 62Q70 80 48 74Q24 80 16 60Q6 44 20 30Z" fill="#fff" stroke="#d8dde4" stroke-width="3"/><path d="M34 40Q48 30 62 44M40 56Q54 50 66 58" stroke="#e5e8ec" stroke-width="3" fill="none"/><circle cx="56" cy="36" r="5" fill="#ff9fc4" opacity=".5"/></svg>` },
  spoon: { bin: 'trash', svg: () => `<svg viewBox="0 0 120 60" width="120" height="60"><ellipse cx="24" cy="30" rx="18" ry="13" fill="#e8c890" stroke="#c9a86a" stroke-width="3"/><rect x="38" y="25" width="74" height="10" rx="5" fill="#e8c890" stroke="#c9a86a" stroke-width="3"/></svg>` },
};
export const BIN = {
  recycle: `<svg viewBox="0 0 160 200" width="170" height="212"><rect x="20" y="40" width="120" height="156" rx="12" fill="#3a7bd5"/><rect x="10" y="24" width="140" height="26" rx="10" fill="#2f63b0"/><rect x="50" y="30" width="60" height="10" rx="5" fill="#1d3f7a"/>${markIn(40, 80, 0.8)}</svg>`,
  trash: `<svg viewBox="0 0 160 200" width="170" height="212"><rect x="20" y="40" width="120" height="156" rx="12" fill="#8a939e"/><rect x="10" y="24" width="140" height="26" rx="10" fill="#6a737e"/><rect x="50" y="30" width="60" height="10" rx="5" fill="#4a535e"/>
    <g transform="translate(80 128)"><path d="M-26 -20H26L20 34H-20Z" fill="#fff"/><rect x="-30" y="-30" width="60" height="10" rx="4" fill="#fff"/><path d="M-10 -14V26M0 -14V26M10 -14V26" stroke="#8a939e" stroke-width="4"/></g></svg>`,
};
// 錢包、硬幣
export const COIN = (v) => `<svg viewBox="0 0 100 100" width="${v === 10 ? 100 : v === 5 ? 88 : 74}" height="${v === 10 ? 100 : v === 5 ? 88 : 74}"><circle cx="50" cy="50" r="46" fill="${v === 10 ? '#d9a02a' : v === 5 ? '#c9c9c9' : '#e0b070'}" stroke="#fff" stroke-width="4"/>${Array.from({ length: v === 10 ? 10 : v }, (_, i) => `<circle cx="${v === 1 ? 50 : 26 + (i % 5) * 12}" cy="${v === 1 ? 50 : v === 5 ? 50 : 40 + Math.floor(i / 5) * 20}" r="5" fill="#fff"/>`).join('')}</svg>`;
export const PRICE = (v) => `<svg viewBox="0 0 160 90" width="160" height="90"><rect x="4" y="4" width="152" height="82" rx="14" fill="#fff" stroke="#ffb300" stroke-width="5"/>${[10, 5].filter((c) => c <= v).map((c, i) => `<g transform="translate(${16 + i * 66} 14) scale(.62)">${COIN(c).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`).join('')}</svg>`;
export const WALLET = `<svg viewBox="0 0 120 100" width="130" height="108"><rect x="10" y="20" width="100" height="70" rx="12" fill="#e5739f"/><rect x="60" y="40" width="54" height="30" rx="10" fill="#d0628c"/><circle cx="82" cy="55" r="6" fill="#ffd34d"/></svg>`;

// ---------- 紀念品店 ----------
export function giftBack(ph) {
  const n = night(ph);
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#3a2f4a' : '#fff1d6'}"/>
    <path d="M0 0H1200V80Q600 130 0 80Z" fill="#8a6fd0"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 80q50 40 100 0" fill="${i % 2 ? '#8a6fd0' : '#fff'}"/>`).join('')}
    ${[200, 420].map((y) => `<rect x="60" y="${y + 150}" width="1080" height="24" rx="6" fill="#b8895a"/><rect x="60" y="${y + 170}" width="1080" height="10" fill="#8a5a2b"/>`).join('')}
    <rect y="700" width="1200" height="200" fill="${n ? '#5a4a3a' : '#e8c890'}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 100} 700V900" stroke="${n ? '#4a3a2a' : '#d8b878'}" stroke-width="4"/>`).join('')}
    <g transform="translate(860 610)"><rect width="300" height="110" rx="12" fill="#b8895a"/><rect x="20" y="-40" width="90" height="60" rx="8" fill="#3a3f4a"/><rect x="30" y="-30" width="70" height="30" rx="4" fill="#7be0a0"/></g>
  </svg>`;
}
export const plushSvg = (id, size = 150) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${ITEMS[`zp_${id}`]}</svg>`;
export { PLUSH_IDS };
// 深呼吸的氣球
export const BREATH_BALLOON = `<svg viewBox="0 0 100 130" width="160" height="208"><ellipse cx="50" cy="50" rx="40" ry="46" fill="#7cc8ea"/><path d="M50 96L44 104H56Z" fill="#5aa8d0"/><path d="M50 104Q40 118 54 128" stroke="#888" stroke-width="2" fill="none"/><ellipse cx="36" cy="34" rx="8" ry="14" fill="#fff" opacity=".5"/></svg>`;

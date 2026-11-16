// 公車與火車場景的圖：公車站、公車外觀與車廂、火車月台與車廂、乘客（烏龜爺爺、兔子乘客）、圖卡。舞台 1200x900。
import { skyColors } from './bathroom.js';

// ---------- 公車 ----------
export function busStreet(ph, wx) {
  const { colors: [a, b] } = skyColors(ph, wx);
  const n = ph === 'night' || ph === 'dusk';
  const win = n ? '#ffd34d' : '#d6f4ff';
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#bsky)"/>
    ${[[0, 200, '#f6c6a8'], [220, 150, '#c8e0f4'], [460, 230, '#f4e2a8'], [680, 170, '#d8c8f0'], [900, 210, '#c8ecd0']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="210" height="${520 - y}" fill="${c}"/>${[0, 1, 2].map((r) => [0, 1, 2].map((k) => `<rect x="${x + 24 + k * 60}" y="${y + 30 + r * 80}" width="40" height="44" rx="4" fill="${win}"/>`).join('')).join('')}`).join('')}
    <rect y="500" width="1200" height="150" fill="${n ? '#4a4f62' : '#8d939e'}"/>
    <path d="M0 575H1200" stroke="#ffd34d" stroke-width="5" stroke-dasharray="40 30"/>
    <rect y="640" width="1200" height="260" fill="${n ? '#8a8478' : '#ddd5c4'}"/>
    <rect y="636" width="1200" height="12" fill="#c8bfae"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<path d="M${i * 130} 648V900" stroke="#c8bfae" stroke-width="3"/>`).join('')}
    <g transform="translate(150 640)"><rect x="-5" y="-200" width="10" height="200" fill="#5a5f6a"/><rect x="-46" y="-250" width="92" height="64" rx="12" fill="#3a7bd5"/><rect x="-34" y="-238" width="68" height="28" rx="6" fill="#fff"/><rect x="-26" y="-234" width="52" height="20" rx="4" fill="#3a7bd5"/></g>
    <!-- 斑馬線 -->
    <g fill="#fff" opacity=".9">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${980 + i * 30}" y="505" width="18" height="140"/>`).join('')}</g>
  </svg>`;
}
export function busSvg(num) {
  return `<svg viewBox="0 0 700 300"><rect x="10" y="20" width="680" height="240" rx="30" fill="#3a7bd5"/><rect x="10" y="190" width="680" height="24" fill="#ffd34d"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${160 + i * 100}" y="50" width="80" height="90" rx="10" fill="#d6f4ff"/>`).join('')}
    <rect x="40" y="50" width="90" height="190" rx="10" fill="#d6f4ff" stroke="#2a5fa8" stroke-width="6"/><path d="M85 50V240" stroke="#2a5fa8" stroke-width="4"/>
    <rect x="560" y="28" width="110" height="44" rx="8" fill="#222"/><text x="615" y="62" text-anchor="middle" font-size="34" font-weight="700" fill="#ffb300">${num}</text>
    <circle cx="160" cy="262" r="36" fill="#333"/><circle cx="160" cy="262" r="14" fill="#bbb"/><circle cx="560" cy="262" r="36" fill="#333"/><circle cx="560" cy="262" r="14" fill="#bbb"/>
    <rect x="660" y="150" width="30" height="24" rx="6" fill="#fff6a8"/></svg>`;
}
// 公車車廂：窗外風景另外放一條會捲動的
export function busInside() {
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="60" fill="#e8eef4"/><rect y="360" width="1200" height="540" fill="#e8eef4"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${40 + i * 290}" y="90" width="260" height="240" rx="18" fill="none" stroke="#9aa8b4" stroke-width="14"/>`).join('')}
    <rect y="360" width="1200" height="20" fill="#9aa8b4"/>
    <rect y="40" width="1200" height="14" rx="7" fill="#c9d0d6"/>
    ${[160, 450, 740, 1030].map((x) => `<path d="M${x} 54V80" stroke="#c9d0d6" stroke-width="4"/><path d="M${x - 20} 80H${x + 20}V110Q${x} 130 ${x - 20} 110Z" fill="#ffd34d"/>`).join('')}
    <rect x="300" y="380" width="14" height="520" fill="#ffd34d"/><rect x="880" y="380" width="14" height="520" fill="#ffd34d"/>
    ${[[60, '#3a7bd5'], [430, '#e5484d'], [960, '#3a7bd5']].map(([x, c]) => `<rect x="${x}" y="560" width="200" height="40" rx="12" fill="${c}"/><rect x="${x}" y="470" width="40" height="130" rx="12" fill="${c}"/><rect x="${x + 16}" y="600" width="12" height="120" fill="#7a8088"/>`).join('')}
    <path d="M430 560H630" stroke="#ffd34d" stroke-width="6"/>
    <rect y="760" width="1200" height="140" fill="#b0b6bc"/>
    <rect x="460" y="18" width="280" height="56" rx="10" fill="#222"/>
  </svg>`;
}
// 窗外的街景（捲動）
export const BUS_SCENERY = `<svg viewBox="0 0 2400 300" preserveAspectRatio="none">
  <rect width="2400" height="300" fill="#bfe6fb"/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 150 + 10}" y="${80 + (i % 3) * 30}" width="120" height="${220 - (i % 3) * 30}" fill="${['#f6c6a8', '#c8e0f4', '#f4e2a8', '#d8c8f0'][i % 4]}"/>`).join('')}
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${i * 200 + 90}" cy="250" r="34" fill="#4caf50"/>`).join('')}
</svg>`;
// 下車鈴
export const BELL = `<svg viewBox="0 0 100 100" width="120" height="120"><rect x="16" y="16" width="68" height="68" rx="18" fill="#fff" stroke="#c9d0d6" stroke-width="5"/><circle cx="50" cy="50" r="22" fill="#e5484d"/><path d="M40 52Q40 38 50 38Q60 38 60 52H40M46 56H54" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
export const CARD_READER = `<svg viewBox="0 0 100 100" width="130" height="130"><rect x="20" y="10" width="60" height="84" rx="12" fill="#ffd34d"/><rect x="30" y="22" width="40" height="40" rx="6" fill="#3a3f4a"/><path d="M42 36Q50 30 58 36M38 44Q50 34 62 44" stroke="#7be0a0" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="34" y="70" width="32" height="10" rx="4" fill="#fff"/></svg>`;
export const STRAP = `<svg viewBox="0 0 100 140" width="110" height="154"><path d="M50 0V60" stroke="#c9d0d6" stroke-width="8"/><path d="M26 60H74V100Q50 130 26 100Z" fill="#ffd34d" stroke="#d9a02a" stroke-width="5"/></svg>`;

// 烏龜爺爺（要讓座給他）、兔子乘客
export const GRANDPA = `<svg viewBox="0 0 200 260" overflow="visible">
  <ellipse cx="100" cy="252" rx="70" ry="8" fill="#000" opacity=".12"/>
  <path d="M150 120L176 250" stroke="#8a5a2b" stroke-width="8" stroke-linecap="round"/><path d="M150 120Q166 110 170 124" stroke="#8a5a2b" stroke-width="8" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="180" rx="66" ry="60" fill="#5aa86a"/><path d="M60 150L100 130L140 150L130 200L100 214L70 200Z" fill="#7cc48a" stroke="#4a8a58" stroke-width="5"/>
  <rect x="64" y="226" width="26" height="28" rx="10" fill="#9ed8a0"/><rect x="110" y="226" width="26" height="28" rx="10" fill="#9ed8a0"/>
  <ellipse cx="146" cy="160" rx="18" ry="12" fill="#9ed8a0"/>
  <circle cx="100" cy="86" r="44" fill="#9ed8a0"/>
  <circle cx="84" cy="80" r="11" fill="none" stroke="#555" stroke-width="4"/><circle cx="116" cy="80" r="11" fill="none" stroke="#555" stroke-width="4"/><path d="M95 80H105" stroke="#555" stroke-width="4"/>
  <circle cx="84" cy="80" r="4" fill="#333"/><circle cx="116" cy="80" r="4" fill="#333"/>
  <path d="M86 104Q100 114 114 104" stroke="#3a6a44" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M60 60Q100 20 140 60Q120 48 100 50Q80 48 60 60Z" fill="#8a6a4a"/>
</svg>`;
export const BUNNY = (c = '#fff') => `<svg viewBox="0 0 120 200" overflow="visible"><ellipse cx="60" cy="196" rx="40" ry="6" fill="#000" opacity=".12"/><ellipse cx="44" cy="30" rx="11" ry="30" fill="${c}" stroke="#f4b8c6" stroke-width="3"/><ellipse cx="76" cy="30" rx="11" ry="30" fill="${c}" stroke="#f4b8c6" stroke-width="3"/><circle cx="60" cy="80" r="34" fill="${c}" stroke="#f4b8c6" stroke-width="3"/><circle cx="48" cy="76" r="4" fill="#333"/><circle cx="72" cy="76" r="4" fill="#333"/><ellipse cx="60" cy="90" rx="5" ry="4" fill="#ff8fb0"/><path d="M30 116H90L84 190H36Z" fill="#8fc4ff"/><rect x="82" y="128" width="26" height="34" rx="6" fill="#c9771f"/></svg>`;

// 圖卡（100x100）
export const TR = {
  giveSeat: `<rect x="56" y="54" width="36" height="12" rx="4" fill="#3a7bd5"/><rect x="56" y="30" width="10" height="36" rx="4" fill="#3a7bd5"/><path d="M60 66V88M88 66V88" stroke="#7a8088" stroke-width="5"/><circle cx="26" cy="26" r="11" fill="#ffd9b8"/><path d="M16 40H36L34 70H18Z" fill="#ff8fb0"/><path d="M20 70V90M32 70V90" stroke="#555" stroke-width="6" stroke-linecap="round"/><path d="M38 46L54 54" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/><path d="M40 22l4 -6h6" stroke="#3fbf7f" stroke-width="4" fill="none"/>`,
  keepSeat: `<rect x="20" y="54" width="60" height="12" rx="4" fill="#3a7bd5"/><rect x="20" y="24" width="12" height="42" rx="4" fill="#3a7bd5"/><path d="M26 66V90M74 66V90" stroke="#7a8088" stroke-width="5"/><circle cx="54" cy="24" r="11" fill="#ffd9b8"/><path d="M44 38H64L66 56H44Z" fill="#ff8fb0"/><path d="M48 56H70V74" stroke="#555" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="70" y="30" width="22" height="16" rx="3" fill="#3a3f4a"/>`,
  waitBus: `<rect x="8" y="30" width="58" height="36" rx="8" fill="#3a7bd5"/><circle cx="22" cy="68" r="6" fill="#333"/><circle cx="52" cy="68" r="6" fill="#333"/><path d="M60 20L70 10" stroke="#aaa" stroke-width="4"/><circle cx="84" cy="44" r="8" fill="#ffd9b8"/><path d="M78 54H90L88 76H80Z" fill="#ff8fb0"/><path d="M80 76V90M88 76V90" stroke="#555" stroke-width="5" stroke-linecap="round"/><path d="M12 88H96" stroke="#fff" stroke-width="5" stroke-dasharray="8 6"/><circle cx="84" cy="22" r="10" fill="none" stroke="#3fbf7f" stroke-width="4"/><path d="M84 16V22L88 24" stroke="#3fbf7f" stroke-width="3"/>`,
  runFront: `<rect x="40" y="30" width="58" height="36" rx="8" fill="#3a7bd5"/><circle cx="54" cy="68" r="6" fill="#333"/><circle cx="84" cy="68" r="6" fill="#333"/><circle cx="24" cy="38" r="8" fill="#ffd9b8"/><path d="M16 48L32 50L28 70L14 68Z" fill="#ff8fb0"/><path d="M16 68L8 86M28 70L36 86" stroke="#555" stroke-width="5" stroke-linecap="round"/><path d="M2 40h8M0 54h8" stroke="#aaa" stroke-width="3"/>`,
  behindLine: `<rect x="0" y="62" width="100" height="38" fill="#7a8088"/><path d="M0 58H100" stroke="#ffd34d" stroke-width="8"/><circle cx="50" cy="20" r="10" fill="#ffd9b8"/><path d="M42 32H58L56 50H44Z" fill="#ff8fb0"/><path d="M46 50V56M54 50V56" stroke="#555" stroke-width="5"/><path d="M20 46H80" stroke="#3fbf7f" stroke-width="3" stroke-dasharray="4 4"/>`,
  atEdge: `<rect x="0" y="62" width="100" height="38" fill="#7a8088"/><path d="M0 52H100" stroke="#ffd34d" stroke-width="8"/><circle cx="66" cy="18" r="10" fill="#ffd9b8"/><path d="M58 30H74L74 50H60Z" fill="#ff8fb0"/><path d="M62 50V62M70 50V62" stroke="#555" stroke-width="5"/><path d="M84 30l8 -8M86 40h10" stroke="#e5484d" stroke-width="4"/>`,
};

// ---------- 火車 ----------
export function platformBack(ph) {
  const n = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#2a3550' : '#cfe6f6'}"/>
    <path d="M0 0H1200V120L600 60L0 120Z" fill="#8a6fd0"/>
    ${[100, 400, 700, 1000].map((x) => `<rect x="${x}" y="90" width="20" height="420" fill="#a8b4c0"/>`).join('')}
    <rect x="460" y="150" width="280" height="70" rx="10" fill="#222"/><path d="M490 185h30M540 185h160" stroke="#ffb300" stroke-width="10" stroke-linecap="round"/>
    <rect y="420" width="1200" height="120" fill="${n ? '#3a3f4a' : '#7a8088'}"/>
    <path d="M0 470H1200M0 520H1200" stroke="#c9d0d6" stroke-width="10"/>
    <rect y="540" width="1200" height="360" fill="${n ? '#8a8478' : '#ddd5c4'}"/>
    <rect y="560" width="1200" height="22" fill="#ffd34d"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${i * 40 + 20}" cy="571" r="4" fill="#d9a02a"/>`).join('')}
    <g transform="translate(60 640)"><rect width="140" height="200" rx="12" fill="#5fa8e8"/><rect x="14" y="20" width="112" height="60" rx="8" fill="#fff"/><rect x="40" y="100" width="60" height="16" rx="6" fill="#fff"/></g>
  </svg>`;
}
export const TRAIN_SIDE = `<svg viewBox="0 0 1300 360"><rect x="0" y="20" width="1300" height="320" rx="40" fill="#f4f6fa"/><rect x="0" y="230" width="1300" height="26" fill="#e5484d"/>
  ${[60, 360, 960, 1160].map((x) => `<rect x="${x}" y="70" width="180" height="120" rx="14" fill="#9fd0ff"/>`).join('')}
  <g class="tr-door"><rect x="600" y="60" width="100" height="260" fill="#c9d0d6" class="tr-dl"/><rect x="700" y="60" width="100" height="260" fill="#c9d0d6" class="tr-dr"/><rect x="616" y="90" width="68" height="110" rx="8" fill="#9fd0ff" class="tr-dl"/><rect x="716" y="90" width="68" height="110" rx="8" fill="#9fd0ff" class="tr-dr"/></g>
</svg>`;
export function trainInside() {
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="80" fill="#f3ead8"/><rect y="380" width="1200" height="520" fill="#f3ead8"/>
    ${[0, 1, 2].map((i) => `<rect x="${60 + i * 380}" y="100" width="320" height="250" rx="24" fill="none" stroke="#b8a888" stroke-width="16"/>`).join('')}
    <rect y="380" width="1200" height="16" fill="#b8a888"/>
    <rect y="700" width="1200" height="200" fill="#9a8a6a"/>
    <path d="M520 700L480 900M680 700L720 900" stroke="#ffd34d" stroke-width="6"/>
  </svg>`;
}
// 火車窗外的風景（往郊區：田、海；往山區：山；回生活區：房子）
export function trainScenery(to) {
  const tile = to === 'mountain'
    ? Array.from({ length: 8 }, (_, i) => `<path d="M${i * 300} 300L${i * 300 + 150} ${60 + (i % 2) * 40}L${i * 300 + 300} 300Z" fill="${i % 2 ? '#5aa86a' : '#4a9a5a'}"/><path d="M${i * 300 + 150} ${60 + (i % 2) * 40}l26 40h-52z" fill="#fff"/>`).join('')
    : to === 'suburb'
      ? `<rect y="200" width="2400" height="100" fill="#9ed882"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 200}" y="${210 + (i % 2) * 20}" width="160" height="14" rx="7" fill="#7cc46a"/>`).join('')}<rect x="1400" y="180" width="1000" height="120" fill="#6fc3ec"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${i * 360 + 120}" cy="190" r="30" fill="#4caf50"/>`).join('')}`
      : Array.from({ length: 16 }, (_, i) => `<rect x="${i * 150 + 10}" y="${100 + (i % 3) * 30}" width="120" height="${200 - (i % 3) * 30}" fill="${['#f6c6a8', '#c8e0f4', '#f4e2a8', '#d8c8f0'][i % 4]}"/>`).join('');
  return `<svg viewBox="0 0 2400 300" preserveAspectRatio="none"><rect width="2400" height="300" fill="#bfe6fb"/>${tile}</svg>`;
}
export function seatSvg(num) {
  return `<svg viewBox="0 0 160 220" width="150" height="206"><rect x="10" y="10" width="140" height="150" rx="24" fill="#3a7bd5"/><rect x="10" y="140" width="140" height="60" rx="16" fill="#2a5fa8"/><rect x="50" y="24" width="60" height="44" rx="10" fill="#fff"/><text x="80" y="58" text-anchor="middle" font-size="36" font-weight="700" fill="#2a5fa8">${num}</text></svg>`;
}
export function ticketSvg(num) {
  return `<svg viewBox="0 0 220 120" width="220" height="120"><path d="M6 10H214V44A12 12 0 0 0 214 76V110H6V76A12 12 0 0 0 6 44Z" fill="#ffd34d"/><path d="M60 22H100M60 40H130" stroke="#d9a02a" stroke-width="8" stroke-linecap="round"/><rect x="140" y="30" width="60" height="60" rx="10" fill="#fff"/><text x="170" y="74" text-anchor="middle" font-size="40" font-weight="700" fill="#2a5fa8">${num}</text><path d="M20 70h30l10 -14l10 14" stroke="#e5484d" stroke-width="6" fill="none"/></svg>`;
}
export const GATE = `<svg viewBox="0 0 220 220" width="220" height="220"><rect x="10" y="40" width="60" height="170" rx="10" fill="#9aa8b4"/><rect x="150" y="40" width="60" height="170" rx="10" fill="#9aa8b4"/><rect x="22" y="60" width="36" height="30" rx="6" fill="#3a3f4a"/><path d="M30 74Q40 66 50 74" stroke="#7be0a0" stroke-width="4" fill="none"/><g class="gt-flap"><rect x="70" y="110" width="40" height="60" rx="8" fill="#e5484d"/><rect x="110" y="110" width="40" height="60" rx="8" fill="#e5484d"/></g></svg>`;

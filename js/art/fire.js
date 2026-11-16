// 消防局：車庫裡的消防車、逃生演練的房間（煙）、119 按鍵、著火的房子。舞台 1200x900。
export function fireBack(ph) {
  const n = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#3a2a2e' : '#f6e8e0'}"/>
    <rect y="0" width="1200" height="90" fill="#e5383b"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 100}" y="70" width="50" height="20" fill="#fff"/>`).join('')}
    <!-- 牆上的頭盔與水管 -->
    ${[120, 220, 320].map((x) => `<g transform="translate(${x} 170)"><rect x="-4" y="-20" width="8" height="20" fill="#8a6a4a"/><path d="M-36 30Q-34 -6 0 -8Q34 -6 36 30Z" fill="#e5383b"/><path d="M-44 30H44Q42 40 32 40H-32Q-42 40 -44 30Z" fill="#c12a2d"/><path d="M0 2l5 9h10l-8 6l3 10l-10 -6l-10 6l3 -10l-8 -6h10z" fill="#ffd34d"/></g>`).join('')}
    <g transform="translate(130 290)"><circle r="60" fill="none" stroke="#e0a83a" stroke-width="18"/><circle r="30" fill="none" stroke="#e0a83a" stroke-width="18"/></g>
    <rect x="1080" y="90" width="22" height="620" fill="#c9d0d6"/><rect x="1060" y="700" width="62" height="14" rx="6" fill="#9aa0aa"/>
    <!-- 車庫 -->
    <rect x="400" y="140" width="620" height="520" fill="${n ? '#2a2026' : '#e8dcd4'}"/><rect x="400" y="140" width="620" height="24" fill="#a8282b"/>
    <rect y="660" width="1200" height="240" fill="${n ? '#4a4048' : '#c8bcb4'}"/><path d="M0 660H1200" stroke="#ffd34d" stroke-width="8"/>
    <!-- 消防車 -->
    <g class="fi-truck-art" transform="translate(440 330)">
      <rect x="0" y="80" width="400" height="190" rx="18" fill="#e5383b"/><path d="M400 120H500L540 190V270H400Z" fill="#e5383b"/>
      <rect x="420" y="134" width="70" height="56" rx="8" fill="#d6f4ff"/>
      <path d="M20 70L380 20" stroke="#c9d0d6" stroke-width="16"/><path d="M30 60L370 12" stroke="#c9d0d6" stroke-width="8"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${60 + i * 46} ${62 - i * 6}V${74 - i * 6}" stroke="#9aa0aa" stroke-width="6"/>`).join('')}
      <rect x="160" y="64" width="50" height="22" rx="6" fill="#5fc3e8"/>
      <path d="M0 200H540" stroke="#fff" stroke-width="10"/>
      ${[20, 110, 200, 290].map((x) => `<rect x="${x}" y="110" width="70" height="70" rx="8" fill="#c12a2d"/>`).join('')}
      <circle cx="100" cy="276" r="40" fill="#333"/><circle cx="100" cy="276" r="16" fill="#bbb"/><circle cx="460" cy="276" r="40" fill="#333"/><circle cx="460" cy="276" r="16" fill="#bbb"/>
    </g>
  </svg>`;
}

// 逃生演練的房間（煙會從上面慢慢下來）
export const DRILL_ROOM = `<svg viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#f4e8d6"/><rect y="640" width="1200" height="260" fill="#c89a6a"/>
  <rect x="80" y="260" width="240" height="380" rx="10" fill="#a8743f"/><path d="M200 260V640" stroke="#7a5228" stroke-width="5"/><circle cx="185" cy="460" r="7" fill="#ffd34d"/><circle cx="215" cy="460" r="7" fill="#ffd34d"/>
  <rect x="420" y="500" width="320" height="110" rx="20" fill="#8fc4ff"/><rect x="420" y="430" width="70" height="180" rx="16" fill="#6aa8e8"/><rect x="430" y="610" width="20" height="40" fill="#7a5228"/><rect x="710" y="610" width="20" height="40" fill="#7a5228"/>
  <rect x="860" y="230" width="230" height="410" rx="8" fill="#d9663f"/><rect x="880" y="250" width="190" height="370" rx="6" fill="none" stroke="#b8502d" stroke-width="6"/>
  <g transform="translate(600 120)"><circle r="40" fill="#f4f6fa" stroke="#c9d0d6" stroke-width="5"/><circle r="5" fill="#e5383b"/></g>
  <rect x="980" y="660" width="160" height="40" rx="10" fill="#3fbf7f"/><path d="M1000 680h50l-12 -10M1050 680l-12 10" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
export const SMOKE = `<svg viewBox="0 0 1200 500" preserveAspectRatio="none">${Array.from({ length: 14 }, (_, i) => `<circle cx="${i * 92 + 20}" cy="${300 + (i % 3) * 40}" r="${110 + (i % 4) * 20}" fill="#6a6a72" opacity=".55"/>`).join('')}<rect width="1200" height="300" fill="#6a6a72" opacity=".55"/></svg>`;
export const TOWEL = `<svg viewBox="0 0 100 100" width="110" height="110"><path d="M18 20H82V84Q66 76 50 84Q34 76 18 84Z" fill="#7be0e0" stroke="#3fbfc0" stroke-width="4"/><path d="M18 34H82M18 46H82" stroke="#fff" stroke-width="4"/><path d="M60 8Q70 2 78 10" stroke="#5fc3e8" stroke-width="4" fill="none"/></svg>`;
export const KNOB = `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="30" fill="#ffd34d" stroke="#d9a02a" stroke-width="6"/><circle cx="50" cy="50" r="10" fill="#d9a02a"/></svg>`;

// 119 按鍵
export function keypad() {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, ''];
  return `<div class="fi-pad">${keys.map((k) => (k === '' ? '<span></span>' : `<button class="fi-key" data-k="${k}">${k}</button>`)).join('')}</div>`;
}
// 著火的房子
export const BURNING_HOUSE = `<svg viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#ffd9b8"/><rect y="640" width="1200" height="260" fill="#9ed882"/>
  <path d="M640 280L860 120L1080 280Z" fill="#a8743f"/><rect x="670" y="280" width="380" height="360" fill="#f4e8d6"/>
  ${[[700, 320], [920, 320], [700, 480]].map(([x, y]) => `<rect x="${x}" y="${y}" width="100" height="90" rx="8" fill="#5a4a4a"/>`).join('')}
  <rect x="910" y="480" width="90" height="160" rx="8" fill="#8a5a3a"/>
</svg>`;
export const FLAME = `<svg viewBox="0 0 100 120" width="100" height="120"><path class="fl-o" d="M50 6Q86 46 78 84Q72 114 50 114Q28 114 22 84Q14 46 50 6Z" fill="#ff6b3d"/><path class="fl-i" d="M50 46Q70 70 64 92Q60 106 50 106Q40 106 36 92Q30 70 50 46Z" fill="#ffd34d"/></svg>`;
export const STEAM = `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="40" cy="60" r="20" fill="#fff" opacity=".8"/><circle cx="62" cy="50" r="24" fill="#fff" opacity=".7"/><circle cx="50" cy="30" r="18" fill="#fff" opacity=".6"/></svg>`;

// 圖卡（100x100）
export const FI = {
  alarm: `<circle cx="50" cy="50" r="36" fill="#f4f6fa" stroke="#c9d0d6" stroke-width="5"/><circle cx="50" cy="50" r="18" fill="#fff" stroke="#c9d0d6" stroke-width="3"/><circle cx="50" cy="50" r="5" fill="#e5383b"/>${[0, 1].map((i) => `<path d="M${80 + i * 7} ${32 - i * 3}Q${90 + i * 7} 50 ${80 + i * 7} ${68 + i * 3}" stroke="#ff9f43" stroke-width="4" fill="none"/>`).join('')}`,
  doorbell: `<rect x="30" y="16" width="40" height="68" rx="12" fill="#c9d0d6"/><circle cx="50" cy="50" r="12" fill="#ffd34d"/><path d="M80 30l8 -6M82 50h10M80 70l8 6" stroke="#9aa0aa" stroke-width="4"/>`,
  phone: `<rect x="30" y="10" width="40" height="80" rx="10" fill="#3a3f4a"/><rect x="35" y="20" width="30" height="54" rx="4" fill="#9fd0ff"/><circle cx="50" cy="82" r="4" fill="#fff"/><path d="M78 30l8 -6M80 50h10" stroke="#9aa0aa" stroke-width="4"/>`,
  crawl: `<rect x="0" y="0" width="100" height="36" fill="#6a6a72" opacity=".6"/><circle cx="74" cy="60" r="10" fill="#ffd9b8"/><rect x="62" y="62" width="16" height="10" rx="3" fill="#7be0e0"/><path d="M30 66H64" stroke="#ff8fb0" stroke-width="16" stroke-linecap="round"/><path d="M36 74L30 88M58 74L62 88M24 70L12 84" stroke="#555" stroke-width="6" stroke-linecap="round"/><path d="M0 90H100" stroke="#c89a6a" stroke-width="6"/>`,
  stand: `<rect x="0" y="0" width="100" height="36" fill="#6a6a72" opacity=".6"/><circle cx="50" cy="26" r="11" fill="#ffd9b8"/><path d="M42 40H58L56 66H44Z" fill="#ff8fb0"/><path d="M46 66V88M54 66V88" stroke="#555" stroke-width="6" stroke-linecap="round"/><path d="M0 90H100" stroke="#c89a6a" stroke-width="6"/><path d="M70 20l10 -6M72 30h12" stroke="#e5484d" stroke-width="4"/>`,
  exit: `<rect x="20" y="10" width="60" height="80" rx="6" fill="#3fbf7f"/><circle cx="46" cy="30" r="7" fill="#fff"/><path d="M44 40L56 50L48 62L58 76M44 46L34 56M48 62L36 72" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M62 50h12l-6 -6M74 50l-6 6" stroke="#fff" stroke-width="4" fill="none"/>`,
  closet: `<rect x="22" y="8" width="56" height="84" rx="6" fill="#a8743f"/><path d="M50 8V92" stroke="#7a5228" stroke-width="4"/><circle cx="44" cy="50" r="4" fill="#ffd34d"/><circle cx="56" cy="50" r="4" fill="#ffd34d"/><path d="M56 30Q66 34 56 40" stroke="#ffd9b8" stroke-width="4" fill="none"/>`,
  stairs: `<path d="M10 90V74H30V58H50V42H70V26H90V90Z" fill="#c89a6a"/><circle cx="40" cy="38" r="8" fill="#ffd9b8"/><path d="M36 48L44 58M40 48L32 58" stroke="#ff8fb0" stroke-width="6" stroke-linecap="round"/><path d="M64 14l10 -8l10 8" stroke="#3fbf7f" stroke-width="5" fill="none" transform="rotate(180 74 10)"/>`,
  elevator: `<rect x="18" y="8" width="64" height="84" rx="6" fill="#c9d0d6"/><rect x="26" y="20" width="22" height="66" fill="#9aa0aa"/><rect x="52" y="20" width="22" height="66" fill="#9aa0aa"/><path d="M42 12l8 -6l8 6" fill="#ffd34d"/>`,
  giveAdult: `<circle cx="30" cy="26" r="10" fill="#ffd9b8"/><path d="M22 38H38L36 64H24Z" fill="#ff8fb0"/><circle cx="74" cy="20" r="12" fill="#e8c4a0"/><path d="M62 34H86L84 76H64Z" fill="#7a9ad8"/><rect x="44" y="42" width="12" height="18" rx="3" fill="#e5484d"/><path d="M38 50H44M56 50H64" stroke="#ffd9b8" stroke-width="5"/>`,
  playFire: `<circle cx="34" cy="30" r="10" fill="#ffd9b8"/><path d="M26 42H42L40 70H28Z" fill="#ff8fb0"/><rect x="50" y="46" width="12" height="20" rx="3" fill="#e5484d"/><path d="M56 44Q66 30 58 20Q70 26 64 40" fill="#ff6b3d"/><path d="M42 52H50" stroke="#ffd9b8" stroke-width="5"/>`,
};

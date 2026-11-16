// 登山步道：森林小路（有木頭欄杆）、藏在路邊的小動物、山頂的風景、圖卡。舞台 1200x900。
export function trailBack(ph) {
  const n = ph === 'night' || ph === 'dusk';
  const pine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="0" width="16" height="40" fill="#7a4a22"/><path d="M0 -120L56 0H-56Z" fill="${n ? '#24502e' : '#2e8b4f'}"/><path d="M0 -170L44 -70H-44Z" fill="${n ? '#2a5a34' : '#38a05a'}"/></g>`;
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#22324a' : '#bfe6fb'}"/>
    <path d="M0 360L240 160L420 300L640 120L860 300L1060 180L1200 260V900H0Z" fill="${n ? '#3c4f66' : '#9fb8d8'}"/>
    <path d="M0 520Q300 400 600 470Q900 400 1200 500V900H0Z" fill="${n ? '#2f5a3a' : '#6fbf73'}"/>
    <path d="M0 640Q300 600 600 620Q900 600 1200 640V900H0Z" fill="${n ? '#36603f' : '#9ed882'}"/>
    <!-- 步道 -->
    <path d="M200 900Q420 760 560 680Q700 600 900 560" stroke="${n ? '#8a7a5a' : '#e8d2a8'}" stroke-width="120" fill="none" stroke-linecap="round"/>
    <path d="M140 820Q380 700 520 620Q660 540 880 500M300 900Q500 790 620 730Q760 660 940 620" stroke="#a0703a" stroke-width="8" fill="none" stroke-dasharray="70 18"/>
    ${pine(80, 560, 1)}${pine(260, 520, 0.8)}${pine(1080, 560, 1.1)}${pine(980, 470, 0.8)}${pine(700, 470, 0.7)}${pine(1160, 720, 1.2)}${pine(60, 800, 1.2)}
    ${[[420, 520], [820, 720], [180, 700]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="30" fill="${n ? '#2f5a3a' : '#4caf50'}"/><circle cx="26" cy="8" r="24" fill="${n ? '#2a5234' : '#43a047'}"/><circle cx="-24" cy="10" r="22" fill="${n ? '#2a5234' : '#43a047'}"/></g>`).join('')}
  </svg>`;
}
// 山頂的風景（到山頂時蓋上來）
export const SUMMIT = `<svg viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#bfe6fb"/><circle cx="960" cy="160" r="70" fill="#ffd34d"/>
  ${[0, 1, 2, 3].map((i) => `<path d="M${i * 360 - 120} 700L${i * 360 + 60} ${420 + (i % 2) * 60}L${i * 360 + 240} 700Z" fill="${['#9fb8d8', '#8fa8c8'][i % 2]}"/>`).join('')}
  <path d="M0 640Q300 560 600 600Q900 560 1200 640V900H0Z" fill="#6fbf73"/><path d="M300 900L600 560L900 900Z" fill="#a0703a"/><path d="M600 560V470" stroke="#8a5a2b" stroke-width="8"/><path d="M604 474L660 494L604 514Z" fill="#ff6b5c"/>
  <g fill="#fff" opacity=".9"><ellipse cx="240" cy="200" rx="80" ry="24"/><ellipse cx="290" cy="186" rx="50" ry="26"/></g></svg>`;
// 路邊的小動物（只看不抓）
export const CRITTERS = {
  beetle: `<svg viewBox="0 0 100 100" width="90" height="90"><ellipse cx="50" cy="56" rx="26" ry="30" fill="#3a7bd5"/><path d="M50 26V86" stroke="#1a3a7a" stroke-width="4"/><circle cx="50" cy="26" r="12" fill="#1a3a7a"/><path d="M42 18L34 6M58 18L66 6M24 50L12 44M24 66L12 72M76 50L88 44M76 66L88 72" stroke="#1a3a7a" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="50" r="5" fill="#9fd0ff"/><circle cx="60" cy="64" r="5" fill="#9fd0ff"/></svg>`,
  butterfly: `<svg viewBox="0 0 100 100" width="90" height="90"><ellipse cx="30" cy="38" rx="22" ry="18" fill="#ff8fb0"/><ellipse cx="70" cy="38" rx="22" ry="18" fill="#ff8fb0"/><ellipse cx="34" cy="66" rx="16" ry="14" fill="#ffd34d"/><ellipse cx="66" cy="66" rx="16" ry="14" fill="#ffd34d"/><rect x="46" y="28" width="8" height="52" rx="4" fill="#5a3a2a"/><path d="M48 28L40 14M52 28L60 14" stroke="#5a3a2a" stroke-width="3"/></svg>`,
  snail: `<svg viewBox="0 0 100 100" width="90" height="90"><path d="M14 78H86Q92 78 90 70H30Z" fill="#c9a07a"/><circle cx="54" cy="56" r="24" fill="#e0a83a"/><path d="M54 56m-14 0a14 14 0 1 1 14 14a8 8 0 1 1 -8 -8" stroke="#a8743f" stroke-width="4" fill="none"/><path d="M24 70L18 50M30 70L28 50" stroke="#c9a07a" stroke-width="4"/><circle cx="18" cy="48" r="4" fill="#555"/><circle cx="28" cy="48" r="4" fill="#555"/></svg>`,
};
export const BOTTLE_BTN = `<svg viewBox="0 0 100 100" width="100" height="100"><rect x="34" y="20" width="32" height="70" rx="10" fill="#5fc3e8"/><rect x="38" y="10" width="24" height="14" rx="4" fill="#3a7bd5"/><rect x="34" y="44" width="32" height="20" fill="#fff" opacity=".6"/></svg>`;

// 圖卡
export const HK = {
  water: `<rect x="34" y="20" width="32" height="70" rx="10" fill="#5fc3e8"/><rect x="38" y="10" width="24" height="14" rx="4" fill="#3a7bd5"/><rect x="34" y="44" width="32" height="20" fill="#fff" opacity=".6"/>`,
  soda: `<rect x="30" y="14" width="40" height="76" rx="10" fill="#e5484d"/><rect x="30" y="36" width="40" height="22" fill="#fff"/><path d="M38 47h24" stroke="#e5484d" stroke-width="4"/>${[0, 1, 2].map((i) => `<circle cx="${40 + i * 10}" cy="${76 - i * 6}" r="3" fill="#fff" opacity=".7"/>`).join('')}`,
  bag: `<path d="M24 34H76L72 90H28Z" fill="#ff9f43"/><path d="M36 34Q36 14 50 14Q64 14 64 34" stroke="#c9771f" stroke-width="6" fill="none"/><rect x="40" y="46" width="22" height="16" rx="3" fill="#fff6d6" transform="rotate(-10 51 54)"/>`,
  litter: `<path d="M10 80Q50 70 90 80V92H10Z" fill="#9ed882"/><rect x="40" y="56" width="26" height="18" rx="3" fill="#fff6d6" transform="rotate(20 53 65)"/><path d="M60 40l10 -10M66 50h12" stroke="#e5484d" stroke-width="4"/><path d="M30 30L50 50" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/>`,
};

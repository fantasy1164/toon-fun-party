// 圖書館：書架（紅、藍、綠三區）、閱讀桌、借書櫃台與掃描器、還書箱、打開的書、音量表。舞台 1200x900。
export const SHELF_COLORS = { red: '#e5484d', blue: '#3a7bd5', green: '#3fae6a' };

export function libraryBack(ph) {
  const n = ph === 'night' || ph === 'dusk';
  const books = (x0, y, c) => Array.from({ length: 9 }, (_, i) => `<rect x="${x0 + i * 26}" y="${y + (i % 3) * 6}" width="22" height="${70 - (i % 3) * 6}" rx="3" fill="${c}" opacity="${0.75 + (i % 2) * 0.25}"/>`).join('');
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#2e2840' : '#f6f0ff'}"/>
    <rect y="640" width="1200" height="260" fill="${n ? '#4a3a2a' : '#d9b98a'}"/>
    ${Object.values(SHELF_COLORS).map((c, k) => `<g class="lb-shelf" transform="translate(${60 + k * 290} 120)"><rect width="260" height="430" rx="10" fill="#a8743f"/>${[0, 1, 2, 3].map((r) => `<rect x="12" y="${14 + r * 104}" width="236" height="90" fill="#7a5228"/>${books(18, 22 + r * 104, c)}`).join('')}<rect x="80" y="-34" width="100" height="40" rx="10" fill="${c}"/></g>`).join('')}
    <!-- 借書櫃台 -->
    <rect x="930" y="420" width="250" height="220" rx="12" fill="#8a6fd0"/><rect x="920" y="408" width="270" height="22" rx="8" fill="#6a4fb0"/>
    <!-- 閱讀桌 -->
    <rect x="300" y="600" width="420" height="30" rx="10" fill="#c89a6a"/><rect x="320" y="630" width="24" height="120" fill="#a8743f"/><rect x="676" y="630" width="24" height="120" fill="#a8743f"/>
    <!-- 還書箱 -->
    <g transform="translate(980 680)"><rect width="150" height="150" rx="14" fill="#3fae6a"/><rect x="20" y="20" width="110" height="18" rx="6" fill="#1f6a3a"/><path d="M75 58V104M56 86L75 106L94 86" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
  </svg>`;
}
export const SCANNER = `<svg viewBox="0 0 120 100" width="130" height="108"><rect x="10" y="40" width="100" height="50" rx="10" fill="#3a3f4a"/><rect x="24" y="50" width="72" height="20" rx="4" fill="#7be0a0" class="lb-scan-light"/><path d="M40 40L50 10H70L80 40" fill="#5a5f6a"/></svg>`;
export const RETURN_SLOT = `<svg viewBox="0 0 150 150" width="150" height="150"><rect width="150" height="150" rx="14" fill="none"/></svg>`;
export function bookSvg(c = '#e5484d') {
  return `<svg viewBox="0 0 100 100" width="100" height="100"><rect x="18" y="10" width="64" height="80" rx="6" fill="${c}"/><rect x="18" y="10" width="12" height="80" rx="4" fill="#000" opacity=".2"/><rect x="40" y="26" width="32" height="20" rx="4" fill="#fff" opacity=".85"/><path d="M48 60l6 -8l6 8" stroke="#fff" stroke-width="4" fill="none"/></svg>`;
}
// 打開的書（右頁可以翻）
export const OPEN_BOOK = `<svg viewBox="0 0 800 500"><path d="M400 60Q220 10 40 50V460Q220 430 400 480Z" fill="#fffaf0" stroke="#d8c8a8" stroke-width="6"/><path d="M400 60Q580 10 760 50V460Q580 430 400 480Z" fill="#fffaf0" stroke="#d8c8a8" stroke-width="6"/>
  <g transform="translate(120 120)"><circle cx="80" cy="80" r="56" fill="#ffd34d"/><path d="M40 240Q80 170 140 220T240 220" stroke="#4caf50" stroke-width="18" fill="none"/></g>
  <path d="M400 60V480" stroke="#d8c8a8" stroke-width="6"/></svg>`;
export const PAGE = (k) => `<svg viewBox="0 0 360 440" width="100%" height="100%"><path d="M0 10Q180 -30 360 0V410Q180 380 0 430Z" fill="#fffaf0" stroke="#d8c8a8" stroke-width="5"/>
  ${k % 3 === 0 ? '<g transform="translate(90 110)"><ellipse cx="90" cy="120" rx="80" ry="60" fill="#ff8fb0"/><circle cx="160" cy="70" r="40" fill="#ff8fb0"/><circle cx="170" cy="62" r="6" fill="#333"/></g>'
    : k % 3 === 1 ? '<g transform="translate(80 100)"><path d="M100 20L130 90L200 100L150 150L160 220L100 185L40 220L50 150L0 100L70 90Z" fill="#ffd34d"/></g>'
      : '<g transform="translate(70 120)"><rect x="40" y="80" width="140" height="100" fill="#fff4e0"/><path d="M20 90L110 20L200 90Z" fill="#e5734f"/></g>'}</svg>`;

// 圖卡
export const LB = {
  soft: `<circle cx="40" cy="44" r="22" fill="#ffd9b8"/><circle cx="33" cy="40" r="3" fill="#333"/><circle cx="47" cy="40" r="3" fill="#333"/><ellipse cx="40" cy="54" rx="4" ry="3" fill="#c43a4a"/><path d="M66 40q6 4 0 8M74 36q10 8 0 16" stroke="#9fd0ff" stroke-width="3" fill="none"/>`,
  loud: `<circle cx="40" cy="44" r="22" fill="#ffd9b8"/><circle cx="33" cy="38" r="3" fill="#333"/><circle cx="47" cy="38" r="3" fill="#333"/><ellipse cx="40" cy="54" rx="10" ry="9" fill="#c43a4a"/><path d="M66 32q12 12 0 24M76 24q20 20 0 40M86 18q26 26 0 52" stroke="#e5484d" stroke-width="4" fill="none"/>`,
  slot: (c) => `<rect x="8" y="20" width="84" height="66" rx="6" fill="#a8743f"/><rect x="16" y="28" width="68" height="50" fill="#7a5228"/><rect x="30" y="4" width="40" height="20" rx="6" fill="${c}"/>${[0, 1, 2].map((i) => `<rect x="${22 + i * 20}" y="${34 + (i % 2) * 4}" width="14" height="40" rx="2" fill="${c}"/>`).join('')}`,
};

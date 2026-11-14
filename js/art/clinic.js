// 診所：左邊候診椅子、右邊看診區（桌子、視力表、身高尺）。
const kid = (x, y, c = '#5fa8e8') => `<circle cx="${x}" cy="${y}" r="9" fill="#ffd9b8" stroke="#7a5230" stroke-width="2.5"/><path d="M${x - 9} ${y - 2}Q${x} ${y - 15} ${x + 9} ${y - 2}" fill="#5a3a22"/><path d="M${x} ${y + 10}V${y + 34}M${x} ${y + 16}L${x - 10} ${y + 26}M${x} ${y + 16}L${x + 10} ${y + 26}M${x} ${y + 34}L${x - 8} ${y + 50}M${x} ${y + 34}L${x + 8} ${y + 50}" stroke="${c}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
const adult = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#ffd9b8" stroke="#7a5230" stroke-width="2.5"/><path d="M${x - 11} ${y - 2}Q${x} ${y - 18} ${x + 11} ${y - 2}" fill="#3a2a22"/><path d="M${x} ${y + 12}V${y + 44}M${x} ${y + 18}L${x - 12} ${y + 32}M${x} ${y + 18}L${x + 12} ${y + 32}M${x} ${y + 44}L${x - 9} ${y + 66}M${x} ${y + 44}L${x + 9} ${y + 66}" stroke="#e5734f" stroke-width="7" stroke-linecap="round" fill="none"/>`;
const NO = '<circle cx="84" cy="16" r="13" fill="#e5484d"/><path d="M77 9L91 23M91 9L77 23" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>';

export function clinicBack(ph) {
  const night = ph === 'night';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="620" fill="#e6f7f1"/>
    <rect y="560" width="1200" height="60" fill="#cdeee2"/>
    <rect y="620" width="1200" height="280" fill="#f3efe6"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M0 ${640 + i * 30}H1200" stroke="#e6e0d2" stroke-width="2"/>`).join('')}
    <!-- 窗戶 -->
    <rect x="230" y="110" width="200" height="160" rx="10" fill="${night ? '#26386e' : '#bfe6fb'}" stroke="#fff" stroke-width="8"/><path d="M330 110V270M230 190H430" stroke="#fff" stroke-width="6"/>
    <!-- 魚缸 -->
    <rect x="40" y="330" width="170" height="120" rx="12" fill="#bfe9ff" stroke="#9fc8dc" stroke-width="5"/><rect x="40" y="430" width="170" height="20" fill="#e8d2a8"/>
    <path class="fishy" d="M80 380c10 -12 30 -12 38 0c-8 12 -28 12 -38 0ZM118 380l12 -8v16Z" fill="#ff9f43"/><path class="fishy f2" d="M150 404c8 -9 22 -9 28 0c-6 9 -20 9 -28 0ZM178 404l9 -6v12Z" fill="#ff6b8a"/>
    <rect x="70" y="450" width="110" height="80" fill="#c8a27a"/>
    <!-- 候診椅 -->
    ${[250, 360, 470].map((x) => `<rect x="${x}" y="470" width="96" height="90" rx="16" fill="#5fa8e8"/><rect x="${x - 6}" y="548" width="108" height="26" rx="10" fill="#3a7bd5"/><path d="M${x + 8} 574V630M${x + 88} 574V630" stroke="#3a7bd5" stroke-width="8" stroke-linecap="round"/>`).join('')}
    <!-- 視力表（圖形） -->
    <rect x="620" y="150" width="120" height="220" rx="8" fill="#fff" stroke="#cfd8dc" stroke-width="4"/>
    <circle cx="680" cy="190" r="22" fill="#e5484d"/>
    <path d="M656 230l5 10l11 1l-8 7l3 11l-11 -6l-11 6l3 -11l-8 -7l11 -1Z" fill="#ffc400"/><path d="M704 258C694 250 690 245 690 240C690 235 694 233 697 233C700 233 702 235 704 238C706 235 708 233 711 233C714 233 718 235 718 240C718 245 714 250 704 258Z" fill="#ff5c8a"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${648 + i * 21}" cy="296" r="6" fill="#5fa8e8"/>`).join('')}
    ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${644 + i * 18}" cy="330" r="4" fill="#3fbf6a"/>`).join('')}
    <!-- 身高尺 -->
    <rect x="1120" y="140" width="44" height="440" rx="8" fill="#fff"/>${Array.from({ length: 11 }, (_, i) => `<path d="M1120 ${160 + i * 40}h${i % 2 ? 14 : 24}" stroke="${['#e5484d', '#ff9f43', '#ffd34d', '#3fbf6a', '#5fa8e8'][i % 5]}" stroke-width="5"/>`).join('')}
    <!-- 看診桌 -->
    <rect x="880" y="470" width="230" height="22" rx="8" fill="#c8a27a"/><rect x="896" y="492" width="198" height="120" fill="#e8d2a8"/><rect x="980" y="510" width="30" height="8" rx="4" fill="#c8a27a"/>
    <!-- 看診的圓凳 -->
    <ellipse cx="760" cy="650" rx="56" ry="16" fill="#7cc8b4"/><rect x="752" y="652" width="16" height="60" fill="#6aa89a"/><ellipse cx="760" cy="716" rx="40" ry="10" fill="#6aa89a"/>
    ${night ? '<rect width="1200" height="900" fill="#1a2350" opacity=".18"/>' : ''}
  </svg>`;
}

// 圖卡
export const CL = {
  mask: `<circle cx="50" cy="44" r="26" fill="#ffd9b8" stroke="#7a5230" stroke-width="3"/><path d="M24 40Q50 30 76 40" stroke="#5a3a22" stroke-width="0" fill="#5a3a22"/><path d="M28 48Q50 40 72 48V64Q50 76 28 64Z" fill="#9fd8ee" stroke="#6cb8d6" stroke-width="3"/><circle cx="40" cy="38" r="3.5" fill="#1d2433"/><circle cx="60" cy="38" r="3.5" fill="#1d2433"/><path d="M28 50Q18 50 24 40M72 50Q82 50 76 40" stroke="#6cb8d6" stroke-width="3" fill="none"/>`,
  sunglasses: `<circle cx="50" cy="44" r="26" fill="#ffd9b8" stroke="#7a5230" stroke-width="3"/><rect x="28" y="32" width="18" height="12" rx="5" fill="#333"/><rect x="54" y="32" width="18" height="12" rx="5" fill="#333"/><path d="M46 38h8" stroke="#333" stroke-width="3"/><path d="M40 58Q50 64 60 58" stroke="#c9462c" stroke-width="4" fill="none" stroke-linecap="round"/>${NO}`,
  // 吃藥：爸媽拿給你（對）／自己爬上去拿（錯）
  med_parent: `${adult(30, 24)}${kid(70, 46)}<rect x="40" y="46" width="16" height="12" rx="3" fill="#fff" stroke="#5fa8e8" stroke-width="3"/><path d="M44 40h8v6h-8z" fill="#e5484d"/><rect x="4" y="92" width="92" height="5" fill="#c9b79a"/>`,
  med_alone: `<rect x="50" y="10" width="44" height="40" fill="#e8d2a8" stroke="#c8a27a" stroke-width="3"/><rect x="58" y="18" width="12" height="20" rx="3" fill="#fff" stroke="#e5484d" stroke-width="3"/><rect x="74" y="22" width="12" height="16" rx="3" fill="#ffd34d"/><rect x="18" y="62" width="34" height="30" fill="#c8a27a"/>${kid(36, 26)}${NO}`,
  candy_med: `<circle cx="34" cy="56" r="14" fill="#ff7fb0"/><circle cx="62" cy="62" r="12" fill="#7be0a0"/><rect x="38" y="20" width="22" height="30" rx="5" fill="#fff" stroke="#e5484d" stroke-width="3"/>${kid(80, 54)}${NO}`,
  // 生病了：休息喝水（對）／出去玩（錯）
  rest: `<rect x="8" y="60" width="84" height="22" rx="6" fill="#9b85f0"/><rect x="8" y="50" width="26" height="16" rx="6" fill="#fff"/><circle cx="24" cy="48" r="10" fill="#ffd9b8" stroke="#7a5230" stroke-width="2.5"/><path d="M34 62Q60 54 88 60" stroke="#cbb8ff" stroke-width="10" stroke-linecap="round"/><rect x="66" y="22" width="16" height="24" rx="4" fill="#bfe6fb" stroke="#5fa8e8" stroke-width="3"/><path d="M8 82V92M92 82V92" stroke="#7a5cff" stroke-width="5"/>`,
  play_sick: `<rect x="4" y="88" width="92" height="6" fill="#8fd06e"/><path d="M60 30L76 88M60 30L44 88" stroke="#e5484d" stroke-width="5"/><path d="M50 28H70" stroke="#e5484d" stroke-width="6"/>${kid(26, 36)}<path d="M14 24q4 -8 8 0" stroke="#5fa8e8" stroke-width="3" fill="none"/><path d="M38 30l8 -4M38 36h9M38 42l8 4" stroke="#9fd8ee" stroke-width="3" stroke-linecap="round"/>${NO}`,
};

// 道具
export const TOOL = {
  thermo: `<svg viewBox="0 0 100 100" width="110" height="110"><g transform="rotate(-30 50 50)"><rect x="40" y="6" width="20" height="66" rx="10" fill="#fff" stroke="#9aa8b8" stroke-width="4"/><rect class="merc" x="46" y="40" width="8" height="34" rx="4" fill="#e5484d"/><circle cx="50" cy="80" r="14" fill="#e5484d" stroke="#9aa8b8" stroke-width="4"/></g></svg>`,
  light: `<svg viewBox="0 0 100 100" width="110" height="110"><g transform="rotate(-20 50 50)"><rect x="38" y="30" width="24" height="60" rx="8" fill="#5a6b80"/><path d="M34 10H66L62 32H38Z" fill="#a9b6c4"/><ellipse cx="50" cy="10" rx="16" ry="5" fill="#fff6a8"/><rect x="46" y="48" width="8" height="14" rx="3" fill="#ffd34d"/></g></svg>`,
  steth: `<svg viewBox="0 0 100 100" width="120" height="120"><path d="M30 12V40Q30 62 50 62Q70 62 70 40V12" stroke="#4a5568" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="30" cy="12" r="5" fill="#4a5568"/><circle cx="70" cy="12" r="5" fill="#4a5568"/><path d="M50 62V72Q50 86 66 86" stroke="#4a5568" stroke-width="6" fill="none"/><circle cx="74" cy="84" r="12" fill="#c0c8d4" stroke="#4a5568" stroke-width="5"/></svg>`,
  shot: `<svg viewBox="0 0 100 100" width="110" height="110"><g transform="rotate(35 50 50)"><rect x="40" y="20" width="20" height="50" rx="4" fill="#e8f6ff" stroke="#7cc8e8" stroke-width="4"/><rect x="44" y="40" width="12" height="26" fill="#9fe0c4"/><rect x="34" y="14" width="32" height="8" rx="3" fill="#7cc8e8"/><rect x="47" y="2" width="6" height="14" fill="#7cc8e8"/><path d="M50 70V88" stroke="#9aa8b8" stroke-width="3"/></g></svg>`,
  bandage: `<svg viewBox="0 0 100 100" width="70" height="70"><g transform="rotate(-30 50 50)"><rect x="8" y="34" width="84" height="32" rx="16" fill="#f3c08e"/><rect x="34" y="34" width="32" height="32" fill="#f8dcbc"/></g></svg>`,
  heart: `<svg viewBox="0 0 100 100" width="160" height="160"><path d="M50 86C20 64 8 48 8 32C8 18 18 10 30 10C40 10 46 16 50 24C54 16 60 10 70 10C82 10 92 18 92 32C92 48 80 64 50 86Z" fill="#ff5c8a"/></svg>`,
  balloon: `<svg viewBox="0 0 100 100" width="220" height="220"><circle cx="50" cy="46" r="40" fill="#cfefff" stroke="#7cc8e8" stroke-width="5"/><path d="M28 46Q50 22 72 46" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  sticker: `<svg viewBox="0 0 100 100" width="90" height="90"><circle cx="50" cy="50" r="40" fill="#ffd34d" stroke="#ff9f1c" stroke-width="5"/><path d="M50 74C30 60 24 50 24 42C24 34 30 30 36 30C42 30 47 34 50 38C53 34 58 30 64 30C70 30 76 34 76 42C76 50 70 60 50 74Z" fill="#ff5c8a"/></svg>`,
  maskOn: `<svg viewBox="0 0 100 60" width="80" height="48"><path d="M10 14Q50 2 90 14V40Q50 60 10 40Z" fill="#9fd8ee" stroke="#6cb8d6" stroke-width="4"/><path d="M18 24H82M18 34H82" stroke="#6cb8d6" stroke-width="3"/></svg>`,
  bell: `<svg viewBox="0 0 100 100" width="90" height="90"><path d="M50 16Q76 18 78 52L84 72H16L22 52Q24 18 50 16Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4"/><circle cx="50" cy="80" r="9" fill="#e0a800"/></svg>`,
};

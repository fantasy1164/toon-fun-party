// 洗澡：浴室、浴缸（前景，讓嘟嘟坐在裡面）、蓮蓬頭、沐浴乳、浴巾。
const kid = (x, y, c = '#5fa8e8') => `<circle cx="${x}" cy="${y}" r="9" fill="#ffd9b8" stroke="#7a5230" stroke-width="2.5"/><path d="M${x - 9} ${y - 2}Q${x} ${y - 15} ${x + 9} ${y - 2}" fill="#5a3a22"/>`;
const NO = '<circle cx="84" cy="16" r="13" fill="#e5484d"/><path d="M77 9L91 23M91 9L77 23" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>';

export function bathRoomBack(ph, { tub = false } = {}) {
  const night = ph === 'night';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="620" fill="#dcf3f5"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 100 + 50} 0V620" stroke="#c4e6ea" stroke-width="3"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 100 + 50}H1200" stroke="#c4e6ea" stroke-width="3"/>`).join('')}
    <rect y="600" width="1200" height="300" fill="#a9dbe6"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 160} 600L${i * 160 - 90} 900" stroke="#94ccd8" stroke-width="3"/>`).join('')}
    <rect x="60" y="80" width="230" height="170" rx="16" fill="${night ? '#26386e' : '#bfe6fb'}" stroke="#fff" stroke-width="10"/><path d="M175 80V250" stroke="#fff" stroke-width="8"/>
    ${night ? '<circle cx="240" cy="130" r="20" fill="#fff6c8"/>' : '<circle cx="240" cy="130" r="24" fill="#ffd34d"/>'}
    <rect x="70" y="330" width="170" height="12" rx="6" fill="#a9b6c4"/>
    <path d="M1150 60V140Q1150 160 1130 160H770" stroke="#a9b6c4" stroke-width="14" fill="none" stroke-linecap="round"/>
    <rect x="410" y="470" width="700" height="34" rx="16" fill="#fff"/>
    ${tub ? TUB_INNER : ''}
  </svg>`;
}

// 浴缸前面（蓋住嘟嘟的下半身）
const TUB_INNER = `<path d="M420 494H1100V600Q1100 720 980 720H540Q420 720 420 600Z" fill="#7cc4d8"/>
  <path d="M440 510H1080V560Q1060 540 1000 548Q900 560 760 546Q600 532 440 552Z" fill="#9fe0f0" opacity=".7" class="tub-water"/>
  <rect x="404" y="476" width="712" height="30" rx="15" fill="#fff"/>
  <path d="M500 720L486 760M1020 720L1034 760" stroke="#7cc4d8" stroke-width="14" stroke-linecap="round"/>`;
export const TUB_FRONT = `<svg viewBox="0 0 1200 900">${TUB_INNER}</svg>`;

// 道具
export const BT = {
  bottle: `<svg viewBox="0 0 100 100" width="110" height="110"><rect x="30" y="34" width="40" height="58" rx="12" fill="#ff9fc4"/><rect x="40" y="18" width="20" height="18" fill="#fff"/><path d="M50 18V6H70" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="62" r="10" fill="#fff" opacity=".7"/></svg>`,
  faucet: `<svg viewBox="0 0 100 100" width="110" height="110"><rect x="20" y="40" width="50" height="16" rx="8" fill="#a9b6c4"/><path d="M60 48Q80 48 80 70" stroke="#a9b6c4" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="30" y="22" width="12" height="20" rx="4" fill="#e5484d"/><rect x="50" y="22" width="12" height="20" rx="4" fill="#5fa8e8"/><path class="water" d="M80 78V100" stroke="#5fc3e8" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 6"/></svg>`,
  shower: `<svg viewBox="0 0 120 120" width="150" height="150"><path d="M20 30H90L80 50H30Z" fill="#a9b6c4"/><rect x="50" y="10" width="14" height="22" fill="#a9b6c4"/><g class="water">${[34, 46, 58, 70, 82].map((x, i) => `<path d="M${x} 56L${x - 12 + i * 3} 118" stroke="#5fc3e8" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 9"/>`).join('')}</g></svg>`,
  towel: `<svg viewBox="0 0 100 120" width="150" height="180"><rect x="10" y="4" width="80" height="10" rx="5" fill="#a9b6c4"/><path d="M18 14H82V108Q82 114 76 114H24Q18 114 18 108Z" fill="#ffb3c7"/><path d="M18 90H82M18 98H82" stroke="#fff" stroke-width="5"/></svg>`,
  duck: `<svg viewBox="0 0 100 100" width="80" height="80"><ellipse cx="54" cy="66" rx="32" ry="20" fill="#ffd34d"/><circle cx="34" cy="40" r="18" fill="#ffd34d"/><path d="M14 42L2 46L14 50Z" fill="#ff8a2a"/><circle cx="30" cy="36" r="3.5" fill="#1d2433"/></svg>`,
  foam: `<svg viewBox="0 0 100 100" width="110" height="110">${[[50, 50, 22], [28, 40, 15], [72, 42, 16], [36, 66, 14], [66, 68, 15], [50, 26, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#bfe6f5" stroke-width="3"/>`).join('')}</svg>`,
  spot: `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="5" stroke-dasharray="10 8"/></svg>`,
  wrap: `<svg viewBox="0 0 240 320" width="100%" height="100%"><path d="M40 170Q120 140 200 170L208 300H32Z" fill="#ffb3c7"/><path d="M40 200H200M38 240H202" stroke="#fff" stroke-width="8" opacity=".7"/></svg>`,
};

// 圖卡
export const BTC = {
  warm: `<path d="M8 50H92V62Q92 84 70 84H30Q8 84 8 62Z" fill="#7cd4c0"/><rect x="4" y="44" width="92" height="10" rx="5" fill="#fff"/><path d="M36 22Q42 30 36 38M50 18Q56 28 50 38M64 22Q70 30 64 38" stroke="#bfe6f5" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M38 66Q50 76 62 66" stroke="#2f8f55" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="40" cy="60" r="3" fill="#2f8f55"/><circle cx="60" cy="60" r="3" fill="#2f8f55"/>`,
  hot: `<path d="M8 50H92V62Q92 84 70 84H30Q8 84 8 62Z" fill="#ff6b5c"/><rect x="4" y="44" width="92" height="10" rx="5" fill="#fff"/>${[24, 42, 60, 78].map((x) => `<path d="M${x} 12Q${x + 8} 22 ${x} 30Q${x - 8} 38 ${x} 44" stroke="#ff9f8a" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}${NO}`,
  cold: `<path d="M8 50H92V62Q92 84 70 84H30Q8 84 8 62Z" fill="#5fa8e8"/><rect x="4" y="44" width="92" height="10" rx="5" fill="#fff"/><rect x="30" y="56" width="16" height="16" rx="3" fill="#e6f7ff" stroke="#9fd8ee" stroke-width="3" transform="rotate(12 38 64)"/><rect x="56" y="58" width="14" height="14" rx="3" fill="#e6f7ff" stroke="#9fd8ee" stroke-width="3" transform="rotate(-10 63 65)"/>${NO}`,
  walk: `<rect x="4" y="88" width="92" height="6" fill="#a9dbe6"/>${kid(50, 22)}<path d="M50 32V62M50 40L38 52M50 40L62 52M50 62L42 86M50 62L58 86" stroke="#5fa8e8" stroke-width="7" stroke-linecap="round" fill="none"/>`,
  run: `<rect x="4" y="88" width="92" height="6" fill="#a9dbe6"/><ellipse cx="62" cy="88" rx="22" ry="4" fill="#5fc3e8"/>${kid(44, 24)}<path d="M44 34L52 60M48 42L32 48M48 42L66 36M52 60L38 84M52 60L70 76" stroke="#5fa8e8" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M10 40h14M8 52h12M12 64h10" stroke="#999" stroke-width="3" stroke-linecap="round"/>${NO}`,
};

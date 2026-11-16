// 牙科（圓圓診所的一間）：牙醫椅、燈、漱口杯、張大的嘴巴與牙齒、圖卡。舞台 1200x900。
export function dentalBack(ph) {
  const n = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="${n ? '#24384a' : '#e8f6ff'}"/>
    <rect y="620" width="1200" height="280" fill="${n ? '#3a4a5a' : '#cfe4f0'}"/>
    <rect x="80" y="110" width="260" height="200" rx="16" fill="#fff" stroke="#9fd0ff" stroke-width="10"/><path d="M210 110V310M80 210H340" stroke="#9fd0ff" stroke-width="6"/>
    <g transform="translate(980 160)"><rect width="140" height="200" rx="14" fill="#fff"/>${[0, 1, 2].map((i) => `<path d="M${36 + i * 34} ${40 + i * 50}Q${30 + i * 34} ${70 + i * 50} ${40 + i * 34} ${78 + i * 50}Q${46 + i * 34} ${72 + i * 50} ${50 + i * 34} ${78 + i * 50}Q${60 + i * 34} ${70 + i * 50} ${54 + i * 34} ${40 + i * 50}Q${45 + i * 34} ${34 + i * 50} ${36 + i * 34} ${40 + i * 50}Z" fill="#fff" stroke="#5fc3e8" stroke-width="4"/>`).join('')}</g>
    <!-- 牙醫椅 -->
    <path d="M420 600L760 600L840 520L860 540L780 640H420Z" fill="#3fc1c9"/><rect x="380" y="430" width="70" height="200" rx="24" fill="#3fc1c9" transform="rotate(-20 415 530)"/>
    <rect x="580" y="640" width="40" height="120" fill="#9aa8b4"/><ellipse cx="600" cy="770" rx="120" ry="20" fill="#9aa8b4"/>
    <!-- 燈 -->
    <path d="M600 60V180L720 230" stroke="#9aa8b4" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- 漱口台 -->
    <g transform="translate(880 520)"><rect x="0" y="40" width="100" height="160" rx="10" fill="#fff"/><ellipse cx="50" cy="40" rx="56" ry="18" fill="#cfe4f0"/></g>
  </svg>`;
}
export const LAMP = `<svg viewBox="0 0 160 110" width="160" height="110"><ellipse class="dt-lamp-on" cx="80" cy="60" rx="70" ry="44" fill="#fff6a8"/><rect x="20" y="20" width="120" height="60" rx="30" fill="#c9d0d6"/><ellipse cx="80" cy="56" rx="44" ry="18" fill="#fff"/></svg>`;
export const CUP = `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M24 24H76L70 90H30Z" fill="#9fd0ff" stroke="#5fa8e8" stroke-width="5"/><path d="M28 40H72" stroke="#5fc3e8" stroke-width="10" opacity=".6"/></svg>`;
export const CHAIR_BTN = `<svg viewBox="0 0 100 100" width="120" height="120"><path d="M14 70H70L84 50L92 56L78 80H14Z" fill="#3fc1c9"/><rect x="10" y="30" width="18" height="46" rx="8" fill="#3fc1c9" transform="rotate(-20 19 53)"/></svg>`;

// 張大的嘴巴：上下各 4 顆牙（按鈕放在上面）
export const MOUTH = `<svg viewBox="0 0 800 520"><path d="M40 260Q400 -60 760 260Q400 600 40 260Z" fill="#c43a4a"/><path d="M120 260Q400 120 680 260Q400 420 120 260Z" fill="#7a1f2e"/><ellipse cx="400" cy="330" rx="160" ry="50" fill="#ff8f9f"/></svg>`;
export const TEETH = [
  [190, 130], [300, 100], [420, 100], [530, 130],
  [190, 330], [300, 360], [420, 360], [530, 330],
];
export const TOOTH = `<svg viewBox="0 0 80 90" width="80" height="90"><path d="M10 14Q8 70 22 84Q30 90 34 70Q40 60 46 70Q50 90 58 84Q72 70 70 14Q56 2 40 10Q24 2 10 14Z" fill="#fff" stroke="#e0e8f0" stroke-width="4"/><circle class="dt-hole" cx="40" cy="36" r="10" fill="#3a2a2a"/></svg>`;

// 圖卡
export const DT = {
  brush: `<rect x="44" y="18" width="12" height="70" rx="6" fill="#5fa8e8"/><rect x="40" y="10" width="20" height="22" rx="4" fill="#fff" stroke="#9fd0ff" stroke-width="3"/>${[0, 1, 2].map((i) => `<path d="M${44 + i * 6} 10V2" stroke="#9fd0ff" stroke-width="3"/>`).join('')}<path d="M70 20q8 -4 8 4q0 8 -8 6" fill="#fff" stroke="#9fd0ff" stroke-width="3"/><circle cx="24" cy="70" r="12" fill="#ffd34d"/><path d="M18 70a6 6 0 0 0 12 0" fill="#555"/><path d="M14 58l-4 -6M34 58l4 -6" stroke="#ffd34d" stroke-width="3"/>`,
  candy: `<path d="M30 50L14 36V64Z M70 50L86 36V64Z" fill="#ff8fb0"/><circle cx="50" cy="50" r="22" fill="#ff5c93"/><path d="M36 42Q50 34 64 42" stroke="#fff" stroke-width="4" fill="none"/><path d="M20 84Q34 76 30 66" stroke="#555" stroke-width="3" fill="none"/><path d="M70 14q6 -6 12 0t12 0" stroke="#9b85f0" stroke-width="3" fill="none"/>`,
  tell: `<circle cx="30" cy="30" r="11" fill="#ffd9b8"/><path d="M22 42H38L36 70H24Z" fill="#ff8fb0"/><circle cx="74" cy="22" r="13" fill="#e8c4a0"/><path d="M62 36H86L84 80H64Z" fill="#7a9ad8"/><path d="M42 24q8 -8 16 0" stroke="#3fbf7f" stroke-width="4" fill="none"/><path d="M26 34h8" stroke="#fff" stroke-width="3"/><rect x="27" y="33" width="6" height="7" fill="#fff" stroke="#ccc"/>`,
  pull: `<circle cx="50" cy="34" r="16" fill="#ffd9b8"/><path d="M42 42h16" stroke="#c43a4a" stroke-width="4"/><path d="M60 40L80 22" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/><path d="M42 54H58L56 84H44Z" fill="#ff8fb0"/><path d="M84 14l6 -6M86 26h8" stroke="#e5484d" stroke-width="4"/>`,
};

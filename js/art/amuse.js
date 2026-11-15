// 遊樂園：左邊售票亭與大門、後面摩天輪與雲霄飛車、中間旋轉木馬、右邊氣球攤與量身高的長頸鹿。舞台 1200x900。
import { skyColors } from './bathroom.js';
import { characterSvg } from './characters.js';

export const WHEEL = { cx: 300, cy: 300, r: 190 };
export const CAROUSEL = { cx: 640, y: 380 };
export const HEIGHT_STICK = [1060, 360, 90, 400];   // 量身高的牌子 [x, y, w, h]

export function amuseBack(ph, wx) {
  const { colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night' || ph === 'dusk';
  const flags = Array.from({ length: 22 }, (_, i) => `<path d="M${i * 56} 40L${i * 56 + 28} 40L${i * 56 + 14} 68Z" fill="${['#e5484d', '#ffc400', '#3fbf7f', '#5fa8e8', '#ff8fb0'][i % 5]}"/>`).join('');
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#asky)"/>
    <path d="M0 36Q600 70 1200 36" stroke="#888" stroke-width="2" fill="none"/>${flags}
    <!-- 雲霄飛車的軌道 -->
    <path class="am-track" d="M700 520Q760 200 840 260Q900 320 960 170Q1010 80 1080 240Q1120 330 1200 300" fill="none" stroke="#e5484d" stroke-width="12"/>
    ${[760, 840, 900, 960, 1040, 1100, 1160].map((x) => `<path d="M${x} 580V${x === 960 ? 190 : x === 840 ? 262 : 300}" stroke="#c9c2b4" stroke-width="6"/>`).join('')}
    <!-- 摩天輪的腳 -->
    <path d="M${WHEEL.cx} ${WHEEL.cy}L${WHEEL.cx - 110} 600M${WHEEL.cx} ${WHEEL.cy}L${WHEEL.cx + 110} 600" stroke="#8a5a2b" stroke-width="16" stroke-linecap="round"/>
    <!-- 地面 -->
    <rect y="560" width="1200" height="340" fill="${night ? '#6a5f52' : '#f3e6c8'}"/>
    <path d="M0 560H1200" stroke="${night ? '#5a5046' : '#e2d0a8'}" stroke-width="8"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 220 - 40} 900L${i * 220 + 120} 560" stroke="${night ? '#62584c' : '#ead9b4'}" stroke-width="4"/>`).join('')}
    <!-- 旋轉木馬的屋頂與地板 -->
    <g transform="translate(${CAROUSEL.cx} ${CAROUSEL.y})">
      <path d="M-200 100L0 0L200 100Z" fill="#ff8fb0"/>${[0, 1, 2, 3].map((i) => `<path d="M${-200 + i * 100} 100L0 0L${-150 + i * 100} 100Z" fill="#fff"/>`).join('')}
      <path d="M-200 100Q-175 124 -150 100Q-125 124 -100 100Q-75 124 -50 100Q-25 124 0 100Q25 124 50 100Q75 124 100 100Q125 124 150 100Q175 124 200 100" fill="#ffd34d"/>
      <circle cy="-8" r="14" fill="#ffd34d"/>
      <rect x="-8" y="100" width="16" height="170" fill="#ffd34d"/>
      <ellipse cy="290" rx="220" ry="34" fill="#c77dff"/><ellipse cy="280" rx="220" ry="34" fill="#e0b0ff"/>
    </g>
    <!-- 售票亭與大門 -->
    <g transform="translate(20 470)">
      <rect x="0" y="40" width="200" height="200" fill="#ff8fb0"/><path d="M-12 46L100 -10L212 46Z" fill="#e5484d"/>
      <rect x="30" y="80" width="140" height="80" rx="10" fill="#d6f4ff" stroke="#fff" stroke-width="6"/>
      <rect x="20" y="168" width="160" height="16" rx="4" fill="#c43a3f"/>
      <g transform="translate(100 20)"><path d="M-36 -2H36V8A6 6 0 0 0 36 18V28H-36V18A6 6 0 0 0 -36 8Z" fill="#ffd34d"/><path d="M14 -2V28" stroke="#fff" stroke-width="3" stroke-dasharray="4 3"/></g>
    </g>
    <!-- 氣球攤 -->
    <g transform="translate(900 560)">
      <rect x="0" y="80" width="140" height="120" fill="#5fa8e8"/><rect x="-6" y="70" width="152" height="16" rx="4" fill="#3a7bd5"/>
      ${[[20, -10, '#e5484d'], [56, -40, '#ffc400'], [92, -14, '#3fbf7f'], [126, -44, '#ff8fb0'], [70, 10, '#9b85f0']].map(([x, y, c]) => `<path d="M${x} ${y + 34}L70 80" stroke="#888" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="22" ry="27" fill="${c}"/>`).join('')}
    </g>
    ${night ? Array.from({ length: 30 }, (_, i) => `<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${20 + i * 40}" cy="${48 + (i % 2) * 6}" r="5" fill="#fff6a8"/>`).join('') : ''}
  </svg>`;
}

// 會轉的摩天輪（車廂跟著轉回正）
export function wheelSvg() {
  const { r } = WHEEL;
  const cabins = ['#e5484d', '#ffc400', '#3fbf7f', '#5fa8e8', '#ff8fb0', '#9b85f0', '#ff9f43', '#3fc1c9'];
  return `<svg viewBox="${-r - 40} ${-r - 40} ${2 * r + 80} ${2 * r + 80}" overflow="visible">
    <g class="am-spin">
      <circle r="${r}" fill="none" stroke="#5fa8e8" stroke-width="10"/><circle r="${r * 0.55}" fill="none" stroke="#9fd0ff" stroke-width="5"/>
      ${cabins.map((c, i) => { const a = (i * 45 * Math.PI) / 180; const x = r * Math.cos(a); const y = r * Math.sin(a); return `<path d="M0 0L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#5fa8e8" stroke-width="5"/>
        <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="am-cab${i === 6 ? ' mine' : ''}"><path d="M0 0V14" stroke="#555" stroke-width="4"/><rect x="-26" y="14" width="52" height="40" rx="10" fill="${c}"/><rect x="-18" y="20" width="36" height="16" rx="5" fill="#d6f4ff"/>${i === 6 ? '<g class="am-mine"></g>' : ''}</g></g>`; }).join('')}
    </g>
    <circle r="20" fill="#ffd34d"/>
  </svg>`;
}

// 雲霄飛車的車廂（坐的小孩頭像另外放）
export const COASTER_CAR = `<svg viewBox="0 0 220 110"><rect x="10" y="40" width="200" height="56" rx="20" fill="#e5484d"/><rect x="20" y="30" width="80" height="20" rx="8" fill="#c43a3f"/><rect x="120" y="30" width="80" height="20" rx="8" fill="#c43a3f"/>
  <rect class="am-bar-on" x="16" y="34" width="188" height="10" rx="5" fill="#ffd34d"/><circle cx="50" cy="98" r="12" fill="#333"/><circle cx="170" cy="98" r="12" fill="#333"/></svg>`;

// 旋轉木馬上的動物
const POLE = '<rect x="47" y="-40" width="6" height="140" fill="#ffd34d"/>';
export const RIDE_ANIMALS = {
  horse: `${POLE}<path d="M18 52Q18 38 34 38H60Q68 24 80 28L86 40L74 44V58Q74 66 64 66H28Q18 66 18 58Z" fill="#fff" stroke="#c9a0e8" stroke-width="3"/><path d="M60 38Q70 28 78 34" stroke="#c77dff" stroke-width="7" fill="none"/><circle cx="78" cy="36" r="3" fill="#333"/><path d="M26 66V84M40 66V86M56 66V86M66 66V82" stroke="#c9a0e8" stroke-width="6" stroke-linecap="round"/>`,
  rabbit: `${POLE}<ellipse cx="50" cy="60" rx="30" ry="22" fill="#fff" stroke="#f4b8c6" stroke-width="3"/><circle cx="72" cy="40" r="16" fill="#fff" stroke="#f4b8c6" stroke-width="3"/><ellipse cx="66" cy="14" rx="6" ry="18" fill="#fff" stroke="#f4b8c6" stroke-width="3"/><ellipse cx="80" cy="14" rx="6" ry="18" fill="#fff" stroke="#f4b8c6" stroke-width="3"/><circle cx="76" cy="38" r="3" fill="#333"/><circle cx="20" cy="58" r="7" fill="#fff"/>`,
  swan: `${POLE}<path d="M16 56Q16 82 50 82Q84 82 84 56Q70 64 50 60Q30 64 16 56Z" fill="#fff" stroke="#9fd0ff" stroke-width="3"/><path d="M70 60Q60 30 72 18Q84 10 88 22" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M88 20L98 24L88 28Z" fill="#ff9f43"/><circle cx="84" cy="20" r="2.5" fill="#333"/><path d="M20 58Q40 40 60 58" fill="#e8f6ff"/>`,
  car: `${POLE}<path d="M12 70V58Q14 50 24 48L34 34H66L76 48Q88 50 88 60V70Z" fill="#5fa8e8"/><path d="M38 48L42 40H60L66 48Z" fill="#d6f4ff"/><circle cx="30" cy="72" r="10" fill="#333"/><circle cx="70" cy="72" r="10" fill="#333"/>`,
};

// 圖卡（100x100）
export const AM = {
  house: `<path d="M14 50L50 18L86 50Z" fill="#e5734f"/><rect x="22" y="48" width="56" height="40" fill="#fff4e0"/><rect x="30" y="56" width="16" height="14" fill="#bfe6fb"/><rect x="56" y="62" width="16" height="26" fill="#d9663f"/>`,
  school: `<path d="M12 46L50 20L88 46Z" fill="#6e5236"/><rect x="18" y="44" width="64" height="44" fill="#fbeed3"/><rect x="42" y="64" width="16" height="24" fill="#8a5a2b"/><rect x="26" y="52" width="12" height="10" fill="#bfe6fb"/><rect x="62" y="52" width="12" height="10" fill="#bfe6fb"/><rect x="44" y="6" width="12" height="16" fill="#fbeed3"/><circle cx="50" cy="14" r="4" fill="#ffd34d"/>`,
  farm: `<path d="M18 48L50 20L82 48V88H18Z" fill="#d9483b"/><rect x="38" y="60" width="24" height="28" fill="#a8322a"/><path d="M38 60L62 88M62 60L38 88" stroke="#fff" stroke-width="3"/>`,
  balloon1: `<path d="M50 66Q46 80 54 94" stroke="#888" stroke-width="2" fill="none"/><ellipse cx="50" cy="38" rx="24" ry="29" fill="#e5484d"/><path d="M45 66h10l-5 -6z" fill="#c43a3f"/>`,
  balloons: `${[[26, 30, '#e5484d'], [50, 18, '#ffc400'], [74, 30, '#3fbf7f'], [38, 46, '#5fa8e8'], [62, 46, '#ff8fb0'], [50, 36, '#9b85f0']].map(([x, y, c]) => `<path d="M${x} ${y + 18}L50 94" stroke="#888" stroke-width="1.5"/><ellipse cx="${x}" cy="${y}" rx="14" ry="17" fill="${c}"/>`).join('')}`,
  still: `<circle cx="50" cy="26" r="13" fill="#ffd9b8"/><path d="M36 42H64L62 76H38Z" fill="#7ab8ff"/><path d="M42 76V92M58 76V92" stroke="#555" stroke-width="7" stroke-linecap="round"/><path d="M36 46L28 66M64 46L72 66" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/><ellipse cx="50" cy="94" rx="26" ry="5" fill="#000" opacity=".15"/><path d="M14 94H86" stroke="#3fbf7f" stroke-width="4" stroke-dasharray="6 5"/>`,
  run: `<circle cx="58" cy="22" r="13" fill="#ffd9b8"/><path d="M48 36L66 40L58 66L40 62Z" fill="#7ab8ff"/><path d="M44 64L30 86M56 66L70 88" stroke="#555" stroke-width="7" stroke-linecap="round"/><path d="M50 42L32 50M64 44L80 34" stroke="#ffd9b8" stroke-width="7" stroke-linecap="round"/><path d="M8 30h16M4 48h18M10 66h14" stroke="#aaa" stroke-width="4" stroke-linecap="round"/>`,
  staff: characterSvg('gaogao', { x: 14, y: 2, s: 0.3 }),
  stranger: `<circle cx="50" cy="26" r="15" fill="#c9c2b4"/><path d="M34 22Q50 4 66 22" fill="#555"/><rect x="32" y="40" width="36" height="46" rx="8" fill="#7d7d8a"/><path d="M68 54L84 44" stroke="#c9c2b4" stroke-width="7" stroke-linecap="round"/><circle cx="88" cy="40" r="8" fill="#ff5c93"/><path d="M80 40H74M96 40H102" stroke="#ff5c93" stroke-width="4"/>`,
};

// 售票亭、蓋章、安全桿、量身高、爆米花
export const AM_THING = {
  booth: `<svg viewBox="0 0 100 100" width="150" height="150"><path d="M8 34H92V46A8 8 0 0 0 92 60V72H8V60A8 8 0 0 0 8 46Z" fill="#ffd34d"/><path d="M68 34V72" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/><path d="M36 43l4 8h9l-7 6l3 9l-9 -5l-9 5l3 -9l-7 -6h9z" fill="#ff5c93"/></svg>`,
  stamp: `<svg viewBox="0 0 100 100" width="120" height="120"><rect x="38" y="10" width="24" height="40" rx="8" fill="#8a5a2b"/><rect x="22" y="48" width="56" height="20" rx="6" fill="#c9562f"/><rect x="26" y="68" width="48" height="12" rx="3" fill="#ff5c93"/></svg>`,
  handStamp: `<svg viewBox="0 0 100 100" width="44" height="44"><path d="M50 14l9 18h20l-16 13l6 20l-19 -12l-19 12l6 -20l-16 -13h20z" fill="#ff5c93"/></svg>`,
  bar: `<svg viewBox="0 0 100 100" width="130" height="130"><path d="M14 70V40Q14 22 32 22H68Q86 22 86 40V70" fill="none" stroke="#ffd34d" stroke-width="12" stroke-linecap="round"/><path d="M14 70H86" stroke="#ffd34d" stroke-width="12" stroke-linecap="round"/></svg>`,
  bin: `<svg viewBox="0 0 100 120" width="90" height="108"><rect x="14" y="24" width="72" height="92" rx="10" fill="#3fae6a"/><rect x="6" y="10" width="88" height="18" rx="7" fill="#2f8f55"/><path d="M36 54L50 80L64 54" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  popcorn: `<svg viewBox="0 0 100 100" width="90" height="90">${[[34, 30], [46, 22], [58, 28], [66, 36], [40, 40], [54, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff6d6" stroke="#f0d070" stroke-width="2"/>`).join('')}<path d="M26 40H74L66 94H34Z" fill="#fff"/>${[0, 1, 2].map((i) => `<path d="M${32 + i * 14} 40L${38 + i * 12} 94H${44 + i * 12}L${40 + i * 14} 40Z" fill="#e5484d"/>`).join('')}</svg>`,
  coin: (v) => `<svg viewBox="0 0 100 100" width="${v === 10 ? 104 : v === 5 ? 92 : 78}" height="${v === 10 ? 104 : v === 5 ? 92 : 78}"><circle cx="50" cy="50" r="44" fill="${v === 1 ? '#d9a066' : '#e8c35a'}" stroke="${v === 1 ? '#b07a3e' : '#c9a23a'}" stroke-width="6"/><text x="50" y="64" text-anchor="middle" font-size="40" font-weight="700" fill="#7a5a10">${v}</text></svg>`,
};

// 量身高的長頸鹿牌子：線以上（6 歲）才能坐雲霄飛車
export const HEIGHT_SIGN = `<svg viewBox="0 0 90 400" overflow="visible">
  <rect x="30" y="0" width="30" height="400" rx="10" fill="#f5c451"/>
  ${[30, 110, 190, 270, 340].map((y, i) => `<circle cx="${i % 2 ? 40 : 52}" cy="${y}" r="8" fill="#d98a3a"/>`).join('')}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M30 ${50 + i * 44}H${i % 2 ? 42 : 48}" stroke="#7a4a22" stroke-width="3"/>`).join('')}
  <path class="am-line" d="M0 150H90" stroke="#e5484d" stroke-width="8" stroke-linecap="round"/>
  <path d="M84 140l10 10l-10 10z" fill="#e5484d"/>
</svg>`;

// 汽車內：從後座往前看。擋風玻璃外是會捲動的道路；後座三個位子（奇奇、小孩的安全座椅、嘟嘟）。舞台 1200x900。
import { characterSvg, avatarSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

// 擋風玻璃範圍
const W = { x: 140, y: 50, w: 920, h: 330 };

// 擋風玻璃外：天空、道路、路邊的樹、紅綠燈、斑馬線、行人、救護車、目的地公園
export function roadSvg(ph, wx) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night';
  const cx = W.x + W.w / 2;
  const horizon = W.y + 120;
  const bottom = W.y + W.h;
  const trees = [0, 1, 2, 3, 4, 5].map((i) => `
    <g class="rtree l" style="animation-delay:-${i * 0.5}s"><rect x="-6" y="-10" width="12" height="40" fill="#8a5a2b"/><circle cy="-24" r="30" fill="${night ? '#24533a' : '#4caf50'}"/></g>
    <g class="rtree r" style="animation-delay:-${i * 0.5 + 0.25}s"><rect x="-6" y="-10" width="12" height="40" fill="#8a5a2b"/><circle cy="-24" r="30" fill="${night ? '#24533a' : '#43a047'}"/></g>`).join('');
  const dashes = [0, 1, 2, 3].map((i) => `<rect class="dash" style="animation-delay:-${i * 0.25}s" x="${cx - 6}" y="${horizon}" width="12" height="40" rx="4" fill="#fff"/>`).join('');
  return `
  <defs>
    <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <clipPath id="cclip"><path d="M${W.x + 40} ${W.y}H${W.x + W.w - 40}Q${W.x + W.w} ${W.y} ${W.x + W.w} ${W.y + 60}V${bottom}H${W.x}V${W.y + 60}Q${W.x} ${W.y} ${W.x + 40} ${W.y}Z"/></clipPath>
  </defs>
  <g clip-path="url(#cclip)"><g class="road-in">
    <rect x="${W.x - 100}" y="${W.y - 40}" width="${W.w + 200}" height="${W.h + 80}" fill="url(#csky)"/>
    ${wx.kind === 'clear' || wx.kind === 'cloudy' ? (night ? `<circle cx="${W.x + 760}" cy="${W.y + 50}" r="26" fill="#fff6c8"/>` : `<circle cx="${W.x + 760}" cy="${W.y + 52}" r="30" fill="#ffd34d"/>`) : ''}
    <rect x="${W.x - 100}" y="${horizon}" width="${W.w + 200}" height="${bottom - horizon + 40}" fill="${night ? '#1d3a5f' : grey ? '#7fae74' : '#8fd67a'}"/>
    <path d="M${cx - 40} ${horizon}H${cx + 40}L${cx + 420} ${bottom}H${cx - 420}Z" fill="${night ? '#3a3f55' : '#6b6f7a'}"/>
    <path d="M${cx + 40} ${horizon}L${cx + 420} ${bottom}H${cx + 520}L${cx + 70} ${horizon}Z" fill="${night ? '#5a5a6a' : '#c9c2b4'}"/>
    <g class="dashes">${dashes}</g>
    <g class="trees" transform="translate(${cx} ${horizon})">${trees}</g>

    <!-- 斑馬線與行人（小鴨家族） -->
    <g class="crosswalk">${[-3, -2, -1, 0, 1, 2, 3].map((i) => `<rect x="${cx + i * 70 - 24}" y="${bottom - 70}" width="48" height="26" fill="#fff"/>`).join('')}</g>
    <g class="walkers">${[0, 1, 2].map((i) => `<g transform="translate(${-i * 60} ${i % 2 ? 6 : 0}) scale(${i ? 0.7 : 1})">
      <ellipse cx="0" cy="0" rx="26" ry="20" fill="#ffd34d"/><circle cx="18" cy="-20" r="15" fill="#ffd34d"/><path d="M30 -22L44 -18L30 -14Z" fill="#f0811f"/><circle cx="22" cy="-24" r="3" fill="#333"/></g>`).join('')}</g>

    <!-- 紅綠燈 -->
    <g class="tlight" transform="translate(${cx + 230} ${horizon - 30})">
      <rect x="-6" y="40" width="12" height="150" fill="#555"/>
      <rect x="-30" y="-40" width="60" height="150" rx="14" fill="#333"/>
      <circle class="l-red" cx="0" cy="-10" r="18" fill="#5a2020"/><circle class="l-yellow" cx="0" cy="35" r="18" fill="#5a4a20"/><circle class="l-green" cx="0" cy="80" r="18" fill="#204a2a"/>
    </g>

    <!-- 救護車（從後面超過去） -->
    <g class="ambulance" transform="translate(${cx - 200} ${horizon + 60})">
      <rect x="-70" y="-50" width="140" height="80" rx="12" fill="#fff" stroke="#ddd" stroke-width="4"/>
      <rect x="-20" y="-30" width="40" height="12" fill="#e5484d"/><rect x="-6" y="-44" width="12" height="40" fill="#e5484d"/>
      <rect class="siren" x="-20" y="-64" width="40" height="16" rx="6" fill="#e5484d"/>
      <circle cx="-40" cy="34" r="14" fill="#333"/><circle cx="40" cy="34" r="14" fill="#333"/>
    </g>

    <!-- 目的地：公園 -->
    <g class="park">
      <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#csky)"/>
      <rect x="${W.x}" y="${horizon + 40}" width="${W.w}" height="${bottom - horizon}" fill="${night ? '#2f6b45' : '#8fd67a'}"/>
      <g transform="translate(${cx + 120} ${horizon - 20})"><rect x="0" y="0" width="12" height="180" fill="#e5484d"/><rect x="70" y="0" width="12" height="180" fill="#e5484d"/>
        ${[30, 70, 110, 150].map((y) => `<rect x="0" y="${y}" width="82" height="8" fill="#e5484d"/>`).join('')}<path d="M82 8L240 180H216L74 30Z" fill="#ffd34d"/></g>
      <rect x="${cx - 300}" y="${horizon - 40}" width="20" height="160" fill="#8a5a2b"/><circle cx="${cx - 290}" cy="${horizon - 60}" r="70" fill="${night ? '#24533a' : '#4caf50'}"/>
      <rect x="${W.x}" y="${bottom - 50}" width="${W.w}" height="50" fill="#c9c2b4"/>
    </g>
    ${weatherLayer(wx, ph, W.x, W.y, W.w, W.h)}
  </g></g>
  <path d="M${W.x + 40} ${W.y}H${W.x + W.w - 40}Q${W.x + W.w} ${W.y} ${W.x + W.w} ${W.y + 60}V${bottom}H${W.x}V${W.y + 60}Q${W.x} ${W.y} ${W.x + 40} ${W.y}Z" fill="none" stroke="#2b2f3a" stroke-width="22"/>`;
}

// 車內：車頂、照後鏡、儀表板、方向盤、前座椅背
export const CABIN = `
  <rect width="1200" height="900" fill="#3a3f55"/>
  <path d="M0 0H1200V60Q600 20 0 60Z" fill="#2b2f3a"/>
  <rect x="0" y="380" width="1200" height="90" fill="#2b2f3a"/>
  <rect x="80" y="390" width="1040" height="30" rx="14" fill="#444a60"/>
  <g transform="translate(300 470)"><circle r="120" fill="none" stroke="#1d2030" stroke-width="26"/><rect x="-12" y="-120" width="24" height="120" fill="#1d2030"/><circle r="30" fill="#1d2030"/></g>
  <rect x="120" y="470" width="360" height="200" rx="40" fill="#556088"/><rect x="720" y="470" width="360" height="200" rx="40" fill="#556088"/>`;

// 照後鏡（畫在道路上面）：救護車從後面來時會在鏡子裡閃
export const MIRROR = `
  <g class="mirror"><rect x="520" y="34" width="160" height="62" rx="16" fill="#2b2f3a"/><rect class="mirror-glass" x="530" y="42" width="140" height="46" rx="12" fill="#9fb3c8"/>
    <g class="mirror-amb"><rect x="580" y="52" width="40" height="28" rx="5" fill="#fff"/><rect x="596" y="56" width="8" height="18" fill="#e5484d"/><rect x="591" y="61" width="18" height="8" fill="#e5484d"/><rect x="590" y="46" width="20" height="8" rx="3" fill="#e5484d"/></g></g>`;

// 後座三個位子：奇奇（左）、小孩的安全座椅（中）、嘟嘟（右）
export const SEATS = [
  { who: 'kiki', x: 210 },
  { who: 'kid', x: 600 },
  { who: 'dudu', x: 990 },
];

export function backSeat(profile) {
  const kid = profile.members.length > 1 ? 'both' : profile.members[0];
  return `
  <rect x="0" y="560" width="1200" height="340" fill="#6a76a0"/>
  <rect x="20" y="600" width="1160" height="300" rx="50" fill="#7a86b0"/>
  <!-- 奇奇 -->
  <g class="rider" data-who="kiki"><g class="rider-in">${characterSvg('kiki', { x: 90, y: 520, s: 1.0 })}</g></g>
  <!-- 嘟嘟 -->
  <g class="rider" data-who="dudu"><g class="rider-in">${characterSvg('dudu', { x: 870, y: 520, s: 1.0 })}</g></g>
  <!-- 小孩的安全座椅 -->
  <g class="kidseat">
    <path d="M480 900V600Q480 520 600 520Q720 520 720 600V900Z" fill="#e5734f"/>
    <path d="M500 900V610Q500 550 600 550Q700 550 700 610V900Z" fill="#f08a6a"/>
    <g transform="translate(540 580)"><circle cx="60" cy="60" r="62" fill="#fff"/>${avatarSvg(kid, 120).replace('<svg ', '<svg x="0" y="0" ')}</g>
  </g>`;
}

// 安全帶（扣好才顯示）與扣環感應區
export function beltsSvg() {
  const belt = (x, cls) => `<g class="belt ${cls}">
    <path d="M${x - 90} 640L${x + 70} 830" stroke="#2b2f3a" stroke-width="22" stroke-linecap="round"/>
    <path d="M${x - 100} 800H${x + 90}" stroke="#2b2f3a" stroke-width="20" stroke-linecap="round"/>
    <rect x="${x + 50}" y="805" width="44" height="34" rx="8" fill="#c0c6d0"/></g>`;
  const harness = `<g class="belt kid">
    <path d="M560 720V860M640 720V860" stroke="#2b2f3a" stroke-width="18" stroke-linecap="round"/>
    <rect x="572" y="800" width="56" height="40" rx="10" fill="#c0c6d0"/></g>`;
  const buckle = (x, y, who) => `<g class="buckle" data-who="${who}">
    <circle class="halo" cx="${x}" cy="${y}" r="58" fill="#ffd000"/>
    <rect x="${x - 26}" y="${y - 20}" width="52" height="40" rx="10" fill="#e5484d"/><rect x="${x - 14}" y="${y - 8}" width="28" height="16" rx="4" fill="#fff"/>
    <rect class="hit" x="${x - 70}" y="${y - 70}" width="140" height="140" fill="transparent"/></g>`;
  return `<svg class="belts" viewBox="0 0 1200 900">
    ${belt(SEATS[0].x, 'kiki')}${harness}${belt(SEATS[2].x, 'dudu')}
    ${buckle(SEATS[0].x + 120, 830, 'kiki')}${buckle(600, 860, 'kid')}${buckle(SEATS[2].x + 120, 830, 'dudu')}
  </svg>`;
}

// 駕駛按鈕
export const BTN = {
  stop: `<svg viewBox="0 0 100 100" width="84" height="84"><path d="M30 6H70L94 30V70L70 94H30L6 70V30Z" fill="#e5484d" stroke="#fff" stroke-width="5"/><rect x="26" y="44" width="48" height="12" rx="4" fill="#fff"/></svg>`,
  go: `<svg viewBox="0 0 100 100" width="84" height="84"><circle cx="50" cy="50" r="44" fill="#2ea05a" stroke="#fff" stroke-width="5"/><path d="M38 28L72 50L38 72Z" fill="#fff"/></svg>`,
  slow: `<svg viewBox="0 0 100 100" width="84" height="84"><path d="M50 6L94 90H6Z" fill="#ffd34d" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M50 36V62" stroke="#7a5230" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="76" r="5" fill="#7a5230"/></svg>`,
  side: `<svg viewBox="0 0 100 100" width="84" height="84"><circle cx="50" cy="50" r="44" fill="#2f7fe0" stroke="#fff" stroke-width="5"/><path d="M34 74V44Q34 30 48 30H62" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M58 18L74 30L58 42Z" fill="#fff"/></svg>`,
};

// 下車的兩扇門（左邊是馬路、右邊是人行道）
export const DOORS = {
  left: `<svg viewBox="0 0 160 160" width="150" height="150"><rect x="10" y="20" width="140" height="120" rx="20" fill="#556088" stroke="#fff" stroke-width="6"/>
    <path d="M110 80H40M60 56L36 80L60 104" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(18 112) scale(.5)"><rect x="0" y="0" width="90" height="34" rx="10" fill="#e5484d"/><circle cx="20" cy="38" r="9" fill="#333"/><circle cx="70" cy="38" r="9" fill="#333"/></g></svg>`,
  right: `<svg viewBox="0 0 160 160" width="150" height="150"><rect x="10" y="20" width="140" height="120" rx="20" fill="#556088" stroke="#fff" stroke-width="6"/>
    <path d="M50 80H120M100 56L124 80L100 104" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="96" y="118" width="48" height="14" fill="#c9c2b4"/><circle cx="120" cy="108" r="10" fill="#4caf50"/></svg>`,
};

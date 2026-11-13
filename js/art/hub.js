// 選房間畫面：一個社區。中間是剖開的兩層樓房子（臥室、廁所／廚房、客廳），右邊車庫，左後方學堂，右後方農場。
import { characterSvg, NIGHTCAP } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';
import { ANIMALS } from './farm.js';
import { LANTERN, FU } from './newyear.js';

// 每個可以點的地方（舞台座標）
export const SPOTS = {
  bedroom: [345, 275, 245, 235],
  bathroom: [610, 275, 245, 235],
  kitchen: [345, 535, 245, 245],
  door: [610, 535, 245, 245],
  car: [884, 596, 226, 190],
  school: [30, 250, 290, 235],
  farm: [930, 268, 250, 240],
};
// 前院放節慶帳篷、聖誕樹的位置
export const YARD = [[14, 600, 170, 175], [168, 610, 160, 165]];

export function hubBack(ph, wx, { december = false, newyear = false } = {}) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night' || ph === 'dusk';
  const g1 = night ? '#3f6a4a' : grey ? '#8fb27f' : '#a8dd8c';
  const g2 = night ? '#36603f' : grey ? '#7fa36f' : '#8fd06e';
  const lights = december ? (() => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = 292 + t * 616;
      const y = t < 0.5 ? 268 - (t / 0.5) * 178 : 90 + ((t - 0.5) / 0.5) * 178;
      pts.push(`<circle class="bulb" style="animation-delay:${(i % 4) * 0.25}s" cx="${x.toFixed(0)}" cy="${(y + 8).toFixed(0)}" r="8" fill="${['#ffd34d', '#ff6b5c', '#5fc3e8', '#7be0a0'][i % 4]}"/>`);
    }
    return `<path d="M292 276L600 98L908 276" stroke="#333" stroke-width="3" fill="none"/>${pts.join('')}`;
  })() : '';
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#hsky)"/>
    ${night ? [[160, 70], [300, 140], [480, 50], [880, 60], [1040, 140], [1150, 60], [700, 30]].map(([x, y], i) => `<circle class="tw" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')
      + '<circle cx="1050" cy="110" r="44" fill="#fff6c8"/><circle cx="1068" cy="96" r="40" fill="' + a + '"/>'
      : (wx.kind === 'clear' || wx.kind === 'cloudy' ? '<circle cx="1050" cy="110" r="52" fill="#ffd34d"/>' : '')}
    ${!night && wx.kind !== 'rain' && wx.kind !== 'storm' ? `<g fill="#fff" opacity=".9" class="clouds"><ellipse cx="200" cy="110" rx="70" ry="24"/><ellipse cx="240" cy="96" rx="44" ry="26"/><ellipse cx="820" cy="70" rx="56" ry="20"/></g>` : ''}
    <path d="M0 420Q120 250 330 380L330 900H0Z" fill="${g1}"/>
    <path d="M870 380Q1000 270 1200 330V900H870Z" fill="${g1}"/>
    <rect y="760" width="1200" height="140" fill="${g2}"/>
    <path d="M0 520Q160 470 330 520V900H0Z" fill="${g2}"/>
    <!-- 小路 -->
    <path d="M700 790L780 790Q800 850 840 900H640Q680 850 700 790Z" fill="#e8d2a8"/>
    <!-- 房子 -->
    <rect x="770" y="128" width="50" height="110" fill="#c9562f"/><rect x="760" y="118" width="70" height="20" rx="6" fill="#a8422a"/>
    <path d="M292 276L600 92L908 276Z" fill="#e5734f"/><path d="M292 276L600 92L908 276" fill="none" stroke="#c9562f" stroke-width="14" stroke-linejoin="round"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${380 + i * 20} ${232 - i * 12}L${820 - i * 20} ${232 - i * 12}" stroke="#d9663f" stroke-width="5" opacity="${0.6 - i * 0.1}"/>`).join('')}
    <rect x="330" y="262" width="540" height="528" fill="#fff4e0"/>
    <rect x="330" y="520" width="540" height="14" fill="#c8915a"/>
    <rect x="598" y="262" width="14" height="528" fill="#e8d6b8"/>
    <rect x="322" y="786" width="556" height="14" rx="4" fill="#b9824f"/>
    <!-- 車庫 -->
    <path d="M864 562L1126 562L1100 520L890 520Z" fill="#9aa0aa"/><rect x="870" y="562" width="250" height="228" fill="#e8e0d0"/>
    <rect x="884" y="590" width="226" height="200" fill="#5a5f6a"/>
    ${lights}
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// ---------- 房間內部（每間 viewBox 0 0 245 240） ----------
const cap = (id, night) => (night ? NIGHTCAP[id] || '' : '');
export function roomSvg(room, ph, { newyear = false } = {}) {
  const night = ph === 'night';
  const lamp = night ? '<circle cx="200" cy="40" r="60" fill="#ffd34d" opacity=".18"/>' : '';
  const R = {
    bedroom: `<rect width="245" height="240" fill="#cbb8ff"/><rect y="180" width="245" height="60" fill="#a88a72"/>
      <rect x="20" y="20" width="80" height="70" rx="8" fill="${night ? '#26386e' : '#bfe6fb'}" stroke="#fff" stroke-width="6"/>${night ? '<circle cx="74" cy="46" r="12" fill="#fff6c8"/>' : ''}
      <rect x="110" y="140" width="130" height="50" rx="14" fill="#fff"/><rect x="140" y="148" width="100" height="58" rx="16" fill="#9b85f0"/>
      ${characterSvg('mian', { x: 8, y: 92, s: 0.42 })}${lamp}`,
    bathroom: `<rect width="245" height="240" fill="#dcf3f5"/>${[40, 90, 140, 190].map((x) => `<path d="M${x} 0V170" stroke="#c4e6ea" stroke-width="3"/>`).join('')}
      <rect y="170" width="245" height="70" fill="#a9dbe6"/><rect x="120" y="30" width="100" height="78" rx="16" fill="#fff"/><rect x="128" y="38" width="84" height="62" rx="12" fill="#d6f2fb"/>
      <rect x="112" y="150" width="120" height="70" rx="10" fill="#7cc4d8"/><rect x="104" y="140" width="136" height="18" rx="8" fill="#fff"/>
      ${characterSvg('dudu', { x: 6, y: 92, s: 0.42, extra: cap('dudu', night) })}
      ${[[160, 70, 9], [200, 90, 7]].map(([x, y, r]) => `<circle class="bub" cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join('')}${lamp}`,
    kitchen: `<rect width="245" height="245" fill="#fff1d6"/><rect x="140" y="20" width="90" height="70" rx="8" fill="${night ? '#26386e' : '#9fdcff'}" stroke="#fff" stroke-width="6"/>
      <rect x="0" y="170" width="245" height="75" fill="#e0b07a"/><rect x="120" y="150" width="125" height="22" rx="8" fill="#d9a066"/>
      <ellipse cx="180" cy="152" rx="36" ry="9" fill="#fff"/><circle cx="168" cy="146" r="7" fill="#2e8b57"/><circle cx="190" cy="146" r="7" fill="#e5484d"/>
      ${characterSvg('bobo', { x: 6, y: 98, s: 0.42 })}${lamp}`,
    door: `<rect width="245" height="245" fill="#fbe3c4"/><rect y="180" width="245" height="65" fill="#c8915a"/>
      <rect x="140" y="30" width="90" height="160" rx="6" fill="#8a5a2b"/><rect x="148" y="38" width="74" height="152" rx="4" fill="#d96c4a"/><rect x="160" y="52" width="50" height="40" rx="6" fill="${night ? '#26386e' : '#9fdcff'}"/><circle cx="212" cy="120" r="6" fill="#ffd34d"/>${newyear ? `<g transform="translate(160 96) scale(.36)">${FU(140).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>` : ''}
      <rect x="18" y="40" width="96" height="10" rx="5" fill="#b9824f"/><g transform="translate(24 50) scale(.32)"><path d="M30 12L50 20L70 12L94 30L84 50L76 46V92H24V46L16 50L6 30Z" fill="#3f7fd6"/></g>
      ${characterSvg('kiki', { x: 14, y: 96, s: 0.42, extra: cap('kiki', night) })}${lamp}`,
  }[room];
  return `<svg viewBox="0 0 245 ${room === 'kitchen' || room === 'door' ? 245 : 240}" preserveAspectRatio="none">${R}</svg>`;
}

// ---------- 車庫裡的車、學堂、農場（外觀） ----------
export const GARAGE_CAR = `<svg viewBox="0 0 226 190"><rect width="226" height="190" fill="#5a5f6a"/><rect y="160" width="226" height="30" fill="#4a4e58"/>
  <g class="carbody"><path d="M18 150V118Q24 88 56 82H160Q194 88 206 118V150Z" fill="#ff6b5c"/><path d="M52 118Q60 94 82 94H146Q168 94 176 118Z" fill="#d6f4ff"/>
  <circle cx="60" cy="152" r="20" fill="#333"/><circle cx="168" cy="152" r="20" fill="#333"/><circle cx="60" cy="152" r="8" fill="#ddd"/><circle cx="168" cy="152" r="8" fill="#ddd"/>
  <rect x="196" y="122" width="12" height="10" rx="3" fill="#ffe680"/></g></svg>`;

export function schoolExt(ph) {
  const night = ph === 'night' || ph === 'dusk';
  const win = night ? '#ffd34d' : '#bfe6fb';
  return `<svg viewBox="0 0 290 235">
    <path d="M30 100L145 30L260 100Z" fill="#6e5236"/><rect x="40" y="96" width="210" height="130" fill="#fbeed3"/>
    <rect x="128" y="0" width="34" height="40" fill="#fbeed3"/><path d="M122 4L145 -14L168 4Z" fill="#6e5236"/><circle cx="145" cy="22" r="9" fill="#ffd34d"/>
    <rect x="60" y="120" width="56" height="44" rx="6" fill="${win}" stroke="#fff" stroke-width="5"/>
    <rect x="174" y="120" width="56" height="44" rx="6" fill="${win}" stroke="#fff" stroke-width="5"/>
    ${characterSvg('gugu', { x: 178, y: 116, s: 0.2 })}
    <rect x="124" y="160" width="42" height="66" rx="6" fill="#8a5a2b"/><circle cx="158" cy="194" r="4" fill="#ffd34d"/>
    <path d="M70 72Q145 60 220 72" stroke="#fff" stroke-width="3" fill="none"/>${['#e5484d', '#ffd34d', '#4caf50', '#5fa8e8', '#ff9fb0'].map((c, i) => `<path d="M${84 + i * 28} 70L${94 + i * 28} 88L${104 + i * 28} 70Z" fill="${c}"/>`).join('')}
  </svg>`;
}

export function farmExt(ph) {
  const night = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 250 240">
    <path d="M60 110L130 50L200 110V200H60Z" fill="#d9483b"/><path d="M52 114L130 44L208 114" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>
    <rect x="102" y="140" width="56" height="60" fill="#a8322a"/><path d="M102 140L158 200M158 140L102 200" stroke="#fff" stroke-width="5"/>
    <rect x="114" y="82" width="32" height="28" fill="${night ? '#ffd34d' : '#fff8e0'}"/>
    <g stroke="#fff" stroke-width="7" stroke-linecap="round">${[10, 46, 214, 246].map((x) => `<path d="M${x} 230V188"/>`).join('')}<path d="M6 200H60M200 200H248M6 220H60M200 220H248"/></g>
    <g transform="translate(36 232) scale(.34)" class="${night ? 'asleep' : ''}">${ANIMALS.chick}</g>
    <g transform="translate(220 236) scale(.26)">${ANIMALS.cow}</g>
  </svg>`;
}

// 前院的節慶帳篷
export function tentSvg(kind) {
  const c1 = kind === 'newyear' ? '#d6262b' : '#ff8fb0';
  const c2 = kind === 'newyear' ? '#ffcf40' : '#fff';
  const top = kind === 'newyear'
    ? `<g transform="translate(58 6) scale(.36)">${LANTERN('#e8262d', true).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`
    : [[30, 30, '#e5484d'], [80, 14, '#ffc400'], [130, 30, '#5fa8e8']].map(([x, y, cc]) => `<path d="M${x} ${y + 26}Q${x + 4} ${y + 50} ${x} ${y + 64}" stroke="#999" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="18" ry="24" fill="${cc}"/>`).join('');
  return `<svg viewBox="0 0 170 175" overflow="visible">
    ${top}
    <path d="M10 80L85 40L160 80V170H10Z" fill="${c2}"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${10 + i * 30} 80L85 40L${40 + i * 30} 80Z" fill="${i % 2 ? c2 : c1}"/>`).join('')}
    <path d="M10 80L85 40L160 80" fill="none" stroke="${c1}" stroke-width="5"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${10 + i * 30} 80Q${25 + i * 30} 98 ${40 + i * 30} 80" fill="${i % 2 ? c1 : c2}" stroke="${c1}" stroke-width="2"/>`).join('')}
    <path d="M60 170V112Q85 92 110 112V170Z" fill="${kind === 'newyear' ? '#7a1a1a' : '#5a3a6a'}"/>
    ${kind === 'newyear' ? `<g transform="translate(66 104) scale(.28)">${FU(140).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>` : '<circle cx="85" cy="128" r="10" fill="#ffd34d"/>'}
  </svg>`;
}

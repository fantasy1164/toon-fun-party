// 街上：從房子前面的小路走過去。左邊診所、中間明星劇場、右邊超市。
import { characterSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

// 每棟建築可以點的範圍（舞台座標）
export const TOWN_SPOTS = {
  clinic: [36, 318, 330, 400],
  theater: [400, 150, 400, 570],
  market: [834, 318, 340, 400],
  home: [20, 760, 190, 130],
};

export function townBack(ph, wx) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const night = ph === 'night' || ph === 'dusk';
  const g = night ? '#3f6a4a' : grey ? '#8fb27f' : '#a8dd8c';
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#tsky)"/>
    ${night ? [[120, 60], [300, 120], [860, 70], [1080, 130], [1000, 40]].map(([x, y], i) => `<circle class="tw" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')
      + '<circle cx="1080" cy="100" r="40" fill="#fff6c8"/><circle cx="1096" cy="88" r="36" fill="' + a + '"/>'
      : (wx.kind === 'clear' || wx.kind === 'cloudy' ? '<circle cx="1080" cy="100" r="50" fill="#ffd34d"/>' : '')}
    ${!night && wx.kind !== 'rain' && wx.kind !== 'storm' ? '<g fill="#fff" opacity=".9"><ellipse cx="190" cy="120" rx="70" ry="24"/><ellipse cx="230" cy="104" rx="44" ry="26"/><ellipse cx="920" cy="200" rx="56" ry="20"/></g>' : ''}
    <path d="M0 520Q300 430 600 500Q900 430 1200 520V720H0Z" fill="${g}"/>
    ${[[60, 470], [330, 450], [880, 455], [1140, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="38" fill="${night ? '#2f5a3a' : '#6cbf5a'}"/><rect x="${x - 6}" y="${y + 26}" width="12" height="40" fill="#8a5a2b"/>`).join('')}
    <rect y="712" width="1200" height="52" fill="${night ? '#9a948a' : '#d9d2c4'}"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 712V764" stroke="${night ? '#857f76' : '#c4bcab'}" stroke-width="3"/>`).join('')}
    <rect y="764" width="1200" height="136" fill="${night ? '#4a4f5a' : '#6b7280'}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${470 + i * 46}" y="772" width="28" height="120" fill="#fff" opacity=".9"/>`).join('')}
    <path d="M0 830H440M760 830H1200" stroke="#ffd34d" stroke-width="6" stroke-dasharray="40 30"/>
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

const win = (x, y, w, h, night) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${night ? '#ffd34d' : '#bfe6fb'}" stroke="#fff" stroke-width="5"/>`;

// 診所：白色房子、綠色十字招牌（不用紅十字）、窗口有圓圓醫生
export function clinicExt(ph) {
  const night = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 330 400">
    <rect x="20" y="80" width="290" height="320" fill="#f4fbff"/><rect x="10" y="66" width="310" height="24" rx="8" fill="#7cc8b4"/>
    <rect x="125" y="6" width="80" height="80" rx="16" fill="#fff" stroke="#7cc8b4" stroke-width="6"/>
    <path d="M152 22H178V36H192V62H178V76H152V62H138V36H152Z" fill="#3fae6a"/>
    ${win(44, 120, 110, 90, night)}
    <g>${characterSvg('yuanyuan', { x: 56, y: 118, s: 0.27 })}</g>
    ${win(186, 120, 100, 90, night)}
    <rect x="200" y="140" width="72" height="12" rx="6" fill="#ff9fb0" opacity=".8"/><path d="M236 150v40" stroke="#ff9fb0" stroke-width="6" opacity=".8"/>
    <rect x="118" y="270" width="94" height="130" rx="8" fill="#9fd8ee"/><path d="M165 270V400" stroke="#fff" stroke-width="5"/>
    <circle cx="152" cy="336" r="5" fill="#fff"/><circle cx="178" cy="336" r="5" fill="#fff"/>
    <path d="M40 250H100M230 250H290" stroke="#7cc8b4" stroke-width="10" stroke-linecap="round"/>
    ${[50, 80, 248, 278].map((x) => `<circle cx="${x}" cy="380" r="16" fill="#7bd39a"/>`).join('')}
  </svg>`;
}

// 明星劇場：紅色布幕入口、星星招牌、燈泡跑馬燈
export function theaterExt(ph, { party = false } = {}) {
  const night = ph === 'night' || ph === 'dusk';
  const bulbs = [];
  for (let i = 0; i < 17; i++) bulbs.push(`<circle class="bulb" style="animation-delay:${(i % 3) * 0.3}s" cx="${40 + i * 20}" cy="196" r="7" fill="${['#ffd34d', '#ff8fb0', '#7be0ff'][i % 3]}"/>`);
  return `<svg viewBox="0 0 400 570" overflow="visible">
    <path d="M20 210H380V570H20Z" fill="#8a3fa8"/><path d="M20 210H380V240H20Z" fill="#6b2d85"/>
    <path d="M0 214L200 120L400 214Z" fill="#a54fc6"/><path d="M0 214L200 120L400 214" stroke="#ffd34d" stroke-width="8" fill="none" stroke-linejoin="round"/>
    <path d="M200 0L222 48L274 52L234 84L248 134L200 106L152 134L166 84L126 52L178 48Z" fill="#ffd34d" stroke="#ff9f1c" stroke-width="6" stroke-linejoin="round" class="t-star"/>
    <circle cx="186" cy="62" r="5" fill="#1d2433"/><circle cx="214" cy="62" r="5" fill="#1d2433"/><path d="M188 80Q200 90 212 80" stroke="#1d2433" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="30" y="180" width="340" height="34" rx="10" fill="#3a1d4a"/>
    ${bulbs.join('')}
    <path d="M110 570V340Q200 270 290 340V570Z" fill="#2b1236"/>
    <path d="M110 570V340Q150 312 170 330Q160 450 186 570Z" fill="#d6262b"/><path d="M290 570V340Q250 312 230 330Q240 450 214 570Z" fill="#d6262b"/>
    <path d="M118 360Q150 340 166 352M282 360Q250 340 234 352" stroke="#ff6b6b" stroke-width="6" fill="none"/>
    ${[[50, 270], [314, 270]].map(([x, y]) => `<rect x="${x}" y="${y}" width="40" height="120" rx="8" fill="${night ? '#ffd34d' : '#f7c8ff'}" stroke="#ffd34d" stroke-width="5"/><path d="M${x + 20} ${y + 24}l7 14l15 2l-11 10l3 15l-14 -8l-14 8l3 -15l-11 -10l15 -2z" fill="#ffd34d"/>`).join('')}
    ${[60, 340].map((x) => `<rect x="${x - 6}" y="420" width="12" height="150" fill="#ffd34d"/><circle cx="${x}" cy="416" r="14" fill="#fff6c8"/>`).join('')}
    ${party ? [[60, 140, '#e5484d'], [340, 150, '#5fa8e8'], [100, 100, '#ffc400'], [300, 96, '#3fbf7f']].map(([x, y, c]) => `<path d="M${x} ${y + 30}Q${x + 6} ${y + 60} ${x} ${y + 90}" stroke="#888" stroke-width="2" fill="none"/><ellipse class="t-balloon" cx="${x}" cy="${y}" rx="22" ry="28" fill="${c}"/>`).join('') : ''}
  </svg>`;
}

// 超市：條紋遮雨棚、購物車招牌、門口有栗栗
export function marketExt(ph) {
  const night = ph === 'night' || ph === 'dusk';
  return `<svg viewBox="0 0 340 400">
    <rect x="16" y="90" width="308" height="310" fill="#fff4e0"/>
    <rect x="10" y="40" width="320" height="58" rx="10" fill="#ff8a5c"/>
    <g transform="translate(130 46) scale(.46)"><path d="M8 22H22L32 66H80L88 34H26" stroke="#fff" stroke-width="9" fill="none" stroke-linejoin="round"/><circle cx="38" cy="82" r="9" fill="#fff"/><circle cx="74" cy="82" r="9" fill="#fff"/></g>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${16 + i * 38.5} 100H${54.5 + i * 38.5}L${50 + i * 38.5} 138Q${35 + i * 38.5} 150 ${20 + i * 38.5} 138Z" fill="${i % 2 ? '#fff' : '#3fae6a'}"/>`).join('')}
    ${win(32, 170, 120, 110, night)}
    ${[[52, 236, '#e5484d'], [80, 240, '#ffd34d'], [108, 236, '#4caf50'], [130, 242, '#ff9f43']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/>`).join('')}
    <rect x="44" y="252" width="96" height="10" fill="#c8915a"/>
    <rect x="186" y="170" width="120" height="230" rx="6" fill="#bfe6fb" stroke="#fff" stroke-width="6"/><path d="M246 170V400" stroke="#fff" stroke-width="5"/>
    <g>${characterSvg('lili', { x: 192, y: 284, s: 0.36 })}</g>
  </svg>`;
}

// 房子前面的路標：往街上
export const TOWN_SIGN = `<svg viewBox="0 0 290 110" overflow="visible">
  <rect x="134" y="44" width="14" height="70" fill="#8a5a2b"/>
  <path d="M20 10H240L280 46L240 82H20Z" fill="#fff" stroke="#5a8f4a" stroke-width="6" stroke-linejoin="round"/>
  <g transform="translate(36 18)">
    <rect x="0" y="22" width="40" height="38" fill="#f4fbff" stroke="#7cc8b4" stroke-width="3"/><path d="M14 30h12v8h8v10h-8v8h-12v-8h-8v-10h8Z" fill="#3fae6a" transform="translate(0 -4) scale(.9)"/>
    <rect x="52" y="12" width="56" height="48" fill="#8a3fa8"/><path d="M80 -6l6 12l13 1l-10 9l3 13l-12 -7l-12 7l3 -13l-10 -9l13 -1z" fill="#ffd34d"/>
    <rect x="120" y="22" width="44" height="38" fill="#fff4e0" stroke="#ff8a5c" stroke-width="3"/><rect x="118" y="16" width="48" height="10" fill="#ff8a5c"/>
  </g>
  <path d="M212 30L240 46L212 62Z" fill="#5a8f4a"/>
</svg>`;

// 街上回家的牌子
export const HOME_SIGN = `<svg viewBox="0 0 190 130" overflow="visible">
  <rect x="88" y="60" width="14" height="70" fill="#8a5a2b"/>
  <path d="M170 14H50L10 50L50 86H170Z" fill="#fff" stroke="#e5734f" stroke-width="6" stroke-linejoin="round"/>
  <path d="M82 48L112 24L142 48V76H82Z" fill="#fff4e0" stroke="#e5734f" stroke-width="5" stroke-linejoin="round"/><rect x="104" y="56" width="16" height="20" fill="#d96c4a"/>
  <path d="M46 34L22 50L46 66Z" fill="#e5734f"/>
</svg>`;

// 農場：小羊棉棉的家。白天三個區域（動物圍欄、雞窩與乳牛、小菜園），晚上數羊。舞台 1200x900。
import { characterSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';

// ---------- 背景 ----------
export function farmBack(ph, wx) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const showSun = wx.kind === 'clear' || wx.kind === 'cloudy';
  const g1 = grey ? '#8fb27f' : '#9fdc7c';
  const g2 = grey ? '#7aa26c' : '#7ccf5e';
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#fsky)"/>
    ${showSun ? `<circle class="sun" cx="980" cy="120" r="54" fill="#ffd34d"/>` : ''}
    ${wx.kind === 'clear' ? `<g class="cloud" fill="#fff" opacity=".9"><ellipse cx="300" cy="120" rx="70" ry="28"/><ellipse cx="340" cy="104" rx="46" ry="30"/></g>` : ''}
    <path d="M0 420Q200 320 420 400T860 380T1200 400V900H0Z" fill="${g1}"/>
    <path d="M0 470Q300 430 600 460T1200 450V900H0Z" fill="${g2}"/>
    <!-- 紅色穀倉 -->
    <g transform="translate(920 250)">
      <path d="M0 80L110 0L220 80V240H0Z" fill="#d9483b"/><path d="M-10 84L110 -6L230 84" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/>
      <rect x="70" y="130" width="80" height="110" fill="#a8322a"/><path d="M70 130L150 240M150 130L70 240" stroke="#fff" stroke-width="8"/><rect x="70" y="130" width="80" height="110" fill="none" stroke="#fff" stroke-width="8"/>
      <rect x="90" y="50" width="40" height="40" fill="#fff8e0"/>
    </g>
    <!-- 遠處的柵欄 -->
    <g stroke="#fff" stroke-width="10" stroke-linecap="round">${[...Array(16)].map((_, i) => `<path d="M${20 + i * 56} 470V420"/>`).join('')}<path d="M10 436H880M10 458H880"/></g>
    <rect y="760" width="1200" height="140" fill="${grey ? '#6f965f' : '#6cc04f'}"/>
    ${weatherLayer(wx, ph, 0, 0, 1200, 900)}
  </svg>`;
}

// ---------- 動物（原點在腳底中央） ----------
const eye = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d2433"/><circle cx="${x + 2}" cy="${y - 2}" r="${r * 0.35}" fill="#fff"/>`;
export const ANIMALS = {
  chick: `<g class="body">
    <ellipse cx="0" cy="-4" rx="70" ry="10" fill="#000" opacity=".12"/>
    <path d="M-20 -6v-26M20 -6v-26" stroke="#f0a43c" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="0" cy="-80" rx="70" ry="56" fill="#fff"/><path d="M50 -110Q96 -130 80 -70Q70 -90 50 -90Z" fill="#f2f2f2"/>
    <ellipse cx="-24" cy="-80" rx="30" ry="22" fill="#eee"/>
    <circle cx="-44" cy="-140" r="40" fill="#fff"/>
    <path d="M-60 -180Q-54 -196 -44 -180Q-38 -198 -28 -178Q-36 -170 -60 -172Z" fill="#e5484d"/>
    ${eye(-56, -146)}<path d="M-82 -140L-102 -132L-82 -124Z" fill="#f0a43c"/><path d="M-80 -122Q-86 -110 -76 -108Q-72 -116 -74 -122Z" fill="#e5484d"/></g>`,
  cow: `<g class="body">
    <ellipse cx="0" cy="-4" rx="120" ry="12" fill="#000" opacity=".12"/>
    ${[-80, -50, 50, 80].map((x) => `<rect x="${x - 12}" y="-70" width="24" height="66" rx="8" fill="#fff"/><rect x="${x - 12}" y="-18" width="24" height="16" rx="5" fill="#3a2a22"/>`).join('')}
    <rect x="-110" y="-160" width="220" height="110" rx="50" fill="#fff"/>
    <path d="M-60 -160Q-30 -150 -40 -120Q-70 -110 -80 -140Z M30 -150Q70 -160 80 -120Q50 -96 34 -118Z M-20 -90Q10 -96 6 -68Q-20 -60 -30 -80Z" fill="#3a2a22"/>
    <ellipse class="udder" cx="20" cy="-56" rx="30" ry="16" fill="#ffb3c7"/>${[6, 20, 34].map((x) => `<rect x="${x - 4}" y="-46" width="8" height="12" rx="4" fill="#ff8fab"/>`).join('')}
    <path d="M110 -130Q132 -110 124 -70" stroke="#fff" stroke-width="8" fill="none"/><path d="M118 -74l10 14l-14 -2z" fill="#3a2a22"/>
    <g transform="translate(-120 -170)">
      <path d="M-34 -36Q-50 -60 -36 -66Q-28 -50 -18 -42Z M34 -36Q50 -60 36 -66Q28 -50 18 -42Z" fill="#e8d8b0"/>
      <ellipse cx="-44" cy="-20" rx="18" ry="10" fill="#fff" transform="rotate(-20 -44 -20)"/><ellipse cx="44" cy="-20" rx="18" ry="10" fill="#fff" transform="rotate(20 44 -20)"/>
      <rect x="-40" y="-40" width="80" height="90" rx="34" fill="#fff"/>
      <ellipse cx="0" cy="34" rx="38" ry="24" fill="#ffc6d2"/><circle cx="-12" cy="34" r="5" fill="#8a4a5a"/><circle cx="12" cy="34" r="5" fill="#8a4a5a"/>
      ${eye(-16, -6)}${eye(16, -6)}<path d="M-30 -30Q-10 -40 0 -24Q-20 -16 -30 -30Z" fill="#3a2a22"/>
    </g></g>`,
  rabbit: `<g class="body">
    <ellipse cx="0" cy="-4" rx="60" ry="9" fill="#000" opacity=".12"/>
    <ellipse cx="0" cy="-56" rx="56" ry="50" fill="#f4f0f0"/><circle cx="52" cy="-50" r="16" fill="#fff"/>
    <ellipse cx="-30" cy="-12" rx="22" ry="10" fill="#e8e0e0"/><ellipse cx="22" cy="-12" rx="22" ry="10" fill="#e8e0e0"/>
    <ellipse class="ear" cx="-20" cy="-190" rx="14" ry="46" fill="#f4f0f0"/><ellipse cx="-20" cy="-190" rx="7" ry="34" fill="#ffc6d2"/>
    <ellipse class="ear" cx="16" cy="-192" rx="14" ry="46" fill="#f4f0f0" transform="rotate(14 16 -150)"/>
    <circle cx="-4" cy="-122" r="42" fill="#f4f0f0"/>
    ${eye(-20, -128)}${eye(12, -128)}<ellipse class="nose" cx="-4" cy="-108" rx="7" ry="5" fill="#ff8fab"/>
    <circle cx="-30" cy="-108" r="7" fill="#ffc6d2" opacity=".8"/><circle cx="22" cy="-108" r="7" fill="#ffc6d2" opacity=".8"/></g>`,
  pig: `<g class="body">
    <ellipse cx="0" cy="-4" rx="96" ry="10" fill="#000" opacity=".12"/>
    ${[-56, -26, 26, 56].map((x) => `<rect x="${x - 11}" y="-46" width="22" height="42" rx="8" fill="#f5a3b5"/>`).join('')}
    <ellipse cx="0" cy="-86" rx="90" ry="58" fill="#ffb8c8"/>
    <path d="M90 -96q20 -10 12 8q-10 10 4 16" stroke="#f5a3b5" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g transform="translate(-86 -110)">
      <path d="M-30 -40L-20 -70L0 -46Z M30 -40L20 -70L0 -46Z" fill="#f5a3b5"/>
      <circle r="48" fill="#ffb8c8"/>${eye(-18, -12)}${eye(18, -12)}
      <ellipse cx="0" cy="16" rx="24" ry="16" fill="#f58aa2"/><ellipse cx="-8" cy="16" rx="5" ry="7" fill="#b8506a"/><ellipse cx="8" cy="16" rx="5" ry="7" fill="#b8506a"/>
    </g></g>`,
};
// 每隻動物愛吃的東西與音效
export const DIET = {
  chick: { food: 'corn', sound: 'cluck', ask: 'f_chick', hint: 'f_h_chick', en: 'f_en_chick' },
  cow: { food: 'grass', sound: 'moo', ask: 'f_cow', hint: 'f_h_cow', en: 'f_en_cow' },
  rabbit: { food: 'carrot', sound: 'sniff', ask: 'f_rabbit', hint: 'f_h_rabbit', en: 'f_en_rabbit' },
  pig: { food: 'potato', sound: 'oink', ask: 'f_pig', hint: 'f_h_pig', en: 'f_en_pig' },
};
export const FOOD = {
  corn: `<path d="M50 10Q72 30 66 80Q50 92 34 80Q28 30 50 10Z" fill="#ffd34d"/>${[[44, 30], [56, 30], [42, 44], [54, 44], [44, 58], [56, 58], [46, 72], [56, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f0b400"/>`).join('')}<path d="M34 80Q14 60 22 34Q30 64 46 82Z M66 80Q86 60 78 34Q70 64 54 82Z" fill="#6cc04f"/>`,
  grass: `<g fill="#4caf50">${[[20, 90, 30, 20], [34, 90, 44, 10], [48, 90, 52, 6], [62, 90, 66, 12], [76, 90, 82, 22]].map(([x1, y1, x2, y2]) => `<path d="M${x1 - 6} ${y1}Q${x2 - 10} ${(y1 + y2) / 2} ${x2} ${y2}Q${x2 - 2} ${(y1 + y2) / 2} ${x1 + 6} ${y1}Z"/>`).join('')}</g><rect x="18" y="64" width="64" height="12" rx="4" fill="#c9a24a"/>`,
  carrot: `<path d="M30 30Q50 22 62 34L34 92Q24 70 30 30Z" fill="#f08a3c" transform="rotate(20 50 50)"/><path d="M56 26Q60 6 70 4Q66 18 64 28Q78 14 88 18Q76 26 66 34Z" fill="#4caf50"/><path d="M38 46h10M36 60h8" stroke="#c9562f" stroke-width="3"/>`,
  potato: `<path d="M18 56Q14 30 46 24Q80 18 86 46Q90 74 56 80Q22 84 18 56Z" fill="#b5527a"/><path d="M36 44l4 2M60 40l3 3M52 62l4 2" stroke="#7a2a50" stroke-width="3" stroke-linecap="round"/><path d="M84 40Q96 30 92 20" stroke="#4caf50" stroke-width="5" fill="none"/>`,
};
export const foodSvg = (id, size = 110) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${FOOD[id]}</svg>`;
export const animalSvg = (id, s = 1) => `<svg viewBox="-150 -260 300 270" width="${300 * s}" height="${270 * s}" overflow="visible">${ANIMALS[id]}</svg>`;

// ---------- 雞窩、雞蛋、乳牛擠奶、籃子 ----------
export const NEST = `<svg viewBox="-130 -60 260 90" width="260" height="90" overflow="visible">
  <ellipse cx="0" cy="0" rx="120" ry="34" fill="#c9a24a"/>${[...Array(14)].map((_, i) => `<path d="M${-110 + i * 16} ${-6 + (i % 2) * 8}l26 ${i % 2 ? -10 : 10}" stroke="#a8822a" stroke-width="5" stroke-linecap="round"/>`).join('')}</svg>`;
export const EGG = `<svg viewBox="0 0 60 70" width="60" height="70"><ellipse cx="30" cy="38" rx="24" ry="30" fill="#fff6e6" stroke="#e8d8b8" stroke-width="3"/><ellipse cx="22" cy="28" rx="5" ry="9" fill="#fff"/></svg>`;
export const BUCKET = `<svg viewBox="0 0 140 140" width="140" height="140"><path d="M20 30H120L108 130H32Z" fill="#c0c6d0"/><clipPath id="bk"><path d="M20 30H120L108 130H32Z"/></clipPath>
  <rect class="milk" clip-path="url(#bk)" x="0" y="130" width="140" height="100" fill="#fff"/><path d="M20 30H120L108 130H32Z" fill="none" stroke="#8a93a4" stroke-width="6"/>
  <path d="M20 30Q70 -20 120 30" fill="none" stroke="#8a93a4" stroke-width="5"/></svg>`;
export const BASKET = `<svg viewBox="0 0 220 160" width="220" height="160"><path d="M30 60Q110 -40 190 60" fill="none" stroke="#a8722a" stroke-width="12"/>
  <path d="M10 60H210L186 150H34Z" fill="#c98f4f"/>${[0, 1, 2].map((i) => `<path d="M${18 + i * 4} ${86 + i * 24}H${202 - i * 4}" stroke="#a8722a" stroke-width="6"/>`).join('')}
  <g class="in"></g></svg>`;
export const MILK_BOTTLE = `<svg viewBox="0 0 60 90" width="60" height="90"><rect x="20" y="4" width="20" height="12" rx="3" fill="#5fa8e8"/><path d="M20 16H40L50 34V84Q50 88 46 88H14Q10 88 10 84V34Z" fill="#fff" stroke="#c8d0da" stroke-width="3"/><rect x="10" y="44" width="40" height="18" fill="#5fa8e8"/></svg>`;
export const BREAKFAST = `<svg viewBox="0 0 220 160" width="220" height="160"><ellipse cx="110" cy="100" rx="100" ry="46" fill="#fff" stroke="#e6e6e6" stroke-width="5"/>
  <path d="M60 96Q60 60 100 70Q130 50 140 90Q140 120 100 118Q60 124 60 96Z" fill="#fff"/><circle cx="102" cy="94" r="20" fill="#ffc400"/>
  <g transform="translate(150 20)">${MILK_BOTTLE.replace('<svg ', '<svg x="0" y="0" ')}</g></svg>`;

// ---------- 小菜園 ----------
export const CROPS = ['carrot', 'tomato', 'corn'];
export const HARVEST_ITEM = { carrot: 'harvest_carrot', tomato: 'harvest_tomato', corn: 'harvest_corn' };
const leaf = (x, y, rx, ry, rot, c = '#4caf50') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
// 原點在土面中央；stage 0 種子、1 發芽、2 葉子、3 長大、4 開花、5 可以採收
export function plantSvg(crop, stage) {
  const stem = (h) => `<path d="M0 0V${-h}" stroke="#3f9a3f" stroke-width="7" stroke-linecap="round"/>`;
  if (stage <= 0) return `<g><ellipse cx="0" cy="-4" rx="34" ry="12" fill="#7a4a24"/><ellipse cx="0" cy="-8" rx="8" ry="5" fill="#d9b070"/></g>`;
  if (stage === 1) return `<g>${stem(30)}${leaf(-14, -34, 14, 7, -30, '#7ccf5e')}${leaf(14, -34, 14, 7, 30, '#7ccf5e')}</g>`;
  if (stage === 2) return `<g>${stem(60)}${leaf(-20, -40, 22, 10, -30)}${leaf(20, -50, 22, 10, 30)}${leaf(-16, -66, 18, 8, -40)}</g>`;
  if (crop === 'carrot') {
    const tops = (n, h) => [...Array(n)].map((_, i) => `<path d="M0 0Q${(i - (n - 1) / 2) * 20} ${-h / 2} ${(i - (n - 1) / 2) * 34} ${-h}" stroke="#3f9a3f" stroke-width="7" fill="none"/>${leaf((i - (n - 1) / 2) * 34, -h, 16, 10, 0)}`).join('');
    if (stage === 3) return `<g>${tops(4, 90)}</g>`;
    if (stage === 4) return `<g>${tops(5, 110)}${[-40, 0, 40].map((x) => `<circle cx="${x}" cy="-120" r="12" fill="#fff"/>`).join('')}</g>`;
    return `<g>${tops(5, 110)}<path d="M-28 4Q0 -16 28 4L4 60Q0 66 -4 60Z" fill="#f08a3c"/><path d="M-26 0Q0 -14 26 0" fill="#f08a3c"/></g>`;
  }
  if (crop === 'tomato') {
    const vine = `<path d="M0 0V-150" stroke="#8a5a2b" stroke-width="6"/>${stem(140)}${leaf(-26, -40, 26, 11, -20)}${leaf(26, -66, 26, 11, 20)}${leaf(-26, -96, 24, 10, -20)}${leaf(26, -124, 22, 10, 20)}`;
    if (stage === 3) return `<g>${vine}</g>`;
    if (stage === 4) return `<g>${vine}${[[-30, -60], [30, -90], [-24, -120]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="4" ry="9" cy="-8" fill="#ffd34d" transform="rotate(${r})"/>`).join('')}<circle r="4" fill="#f0a43c"/></g>`).join('')}</g>`;
    return `<g>${vine}${[[-30, -56], [32, -84], [-26, -118], [20, -40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#e5484d"/><path d="M${x - 8} ${y - 18}l8 6l8 -6" stroke="#3f9a3f" stroke-width="4" fill="none"/>`).join('')}</g>`;
  }
  // corn
  const stalk = (h) => `${stem(h)}${leaf(-30, -h * 0.35, 36, 9, -30)}${leaf(30, -h * 0.5, 36, 9, 30)}${leaf(-28, -h * 0.7, 32, 8, -40)}${leaf(28, -h * 0.85, 30, 8, 40)}`;
  if (stage === 3) return `<g>${stalk(140)}</g>`;
  if (stage === 4) return `<g>${stalk(170)}<path d="M0 -170l-12 -30M0 -170l0 -34M0 -170l12 -30" stroke="#e0c070" stroke-width="5" stroke-linecap="round"/></g>`;
  return `<g>${stalk(170)}<path d="M0 -170l-12 -30M0 -170l0 -34M0 -170l12 -30" stroke="#e0c070" stroke-width="5" stroke-linecap="round"/>
    ${[[-16, -100, -20], [16, -80, 20]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="13" ry="34" fill="#ffd34d"/><path d="M-13 -10Q-24 20 -6 36M13 -10Q24 20 6 36" fill="#7ccf5e"/></g>`).join('')}</g>`;
}
export function plotSvg(crop, stage) {
  return `<svg viewBox="-160 -290 320 350" width="320" height="350" overflow="visible">
    <ellipse cx="0" cy="10" rx="150" ry="44" fill="#8a5530"/><ellipse cx="0" cy="0" rx="140" ry="36" fill="#a0673a"/>
    ${[-90, -30, 30, 90].map((x) => `<path d="M${x - 20} -6Q${x} -14 ${x + 20} -6" stroke="#7a4a24" stroke-width="4" fill="none"/>`).join('')}
    <g transform="scale(1.35)"><g class="plant">${crop ? plantSvg(crop, stage) : ''}</g></g></svg>`;
}
export const SEED = {
  carrot: `<svg viewBox="0 0 120 150" width="120" height="150"><rect x="10" y="10" width="100" height="130" rx="10" fill="#fff3d6" stroke="#f08a3c" stroke-width="6"/><g transform="translate(10 30)">${FOOD.carrot}</g></svg>`,
  tomato: `<svg viewBox="0 0 120 150" width="120" height="150"><rect x="10" y="10" width="100" height="130" rx="10" fill="#ffe3e3" stroke="#e5484d" stroke-width="6"/><circle cx="60" cy="82" r="32" fill="#e5484d"/><path d="M44 54l16 10l16 -10" stroke="#3f9a3f" stroke-width="6" fill="none"/></svg>`,
  corn: `<svg viewBox="0 0 120 150" width="120" height="150"><rect x="10" y="10" width="100" height="130" rx="10" fill="#fffbe0" stroke="#e0a800" stroke-width="6"/><g transform="translate(10 30)">${FOOD.corn}</g></svg>`,
};
export const CAN = `<svg viewBox="0 0 140 120" width="130" height="112"><path d="M30 40H90V104Q90 110 84 110H36Q30 110 30 104Z" fill="#5fa8e8"/><path d="M90 60L128 30L134 38L96 74Z" fill="#5fa8e8"/><ellipse cx="131" cy="33" rx="9" ry="6" fill="#3a86d0"/>
  <path d="M40 40Q60 6 80 40" fill="none" stroke="#3a86d0" stroke-width="8"/></svg>`;

// ---------- 晚上：數羊 ----------
export const SHEEP = `<svg viewBox="-80 -110 160 120" width="160" height="120" overflow="visible">
  <rect x="-40" y="-36" width="12" height="34" rx="5" fill="#3a3a44"/><rect x="24" y="-36" width="12" height="34" rx="5" fill="#3a3a44"/>
  ${[[-30, -60], [0, -70], [30, -60], [-40, -40], [40, -40], [0, -40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="28" fill="#fff"/>`).join('')}
  <ellipse cx="56" cy="-66" rx="22" ry="26" fill="#3a3a44"/><circle cx="62" cy="-72" r="4" fill="#fff"/><ellipse cx="40" cy="-80" rx="12" ry="6" fill="#3a3a44"/></svg>`;
export function nightField(ph, wx) {
  const { colors: [a, b] } = skyColors('night', wx);
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  const stars = wet ? '' : [[120, 80], [260, 160], [420, 70], [560, 140], [720, 60], [860, 150], [1040, 90], [1120, 200], [330, 240], [640, 230]]
    .map(([x, y], i) => `<circle class="star" style="animation-delay:${(i * 0.33) % 2}s" cx="${x}" cy="${y}" r="4" fill="#fff"/>`).join('');
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="nfsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#nfsky)"/>${stars}
    ${wet ? '' : `<circle cx="960" cy="140" r="56" fill="#fff6c8"/><circle cx="984" cy="122" r="50" fill="${a}"/>`}
    <path d="M0 470Q300 420 600 450T1200 440V900H0Z" fill="#24493a"/>
    <path d="M0 560Q300 530 600 550T1200 545V900H0Z" fill="#2c5a44"/>
    <g transform="translate(600 690)"><g stroke="#c9a77a" stroke-width="14" stroke-linecap="round"><path d="M-110 0V-130M0 0V-140M110 0V-130"/><path d="M-130 -100H130M-130 -50H130"/></g></g>
    ${weatherLayer(wx, 'night', 0, 0, 1200, 900)}
  </svg>`;
}

// 大廳的農場小圖
export const FARM_ICON = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#bfe8ff"/>
  <path d="M0 250Q200 200 420 240V420H0Z" fill="#7ccf5e"/>
  <g transform="translate(250 110) scale(.6)"><path d="M0 80L110 0L220 80V240H0Z" fill="#d9483b"/><rect x="70" y="130" width="80" height="110" fill="#a8322a"/><path d="M70 130L150 240M150 130L70 240" stroke="#fff" stroke-width="8"/></g>
  ${characterSvg('mian', { x: 40, y: 150, s: 0.7 })}
  <g transform="translate(320 380) scale(.55)">${ANIMALS.chick}</g>
</svg>`;

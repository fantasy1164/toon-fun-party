// 學堂（教室）：咕咕老師站在黑板旁，奇奇、小孩、嘟嘟坐前排。晚上換成看星星的大窗戶。舞台 1200x900。
import { characterSvg, avatarSvg } from './characters.js';
import { weatherLayer, skyColors } from './bathroom.js';
import { hour } from '../core/clock.js';

// 前排三張桌子的中心
export const DESKS = { kiki: 240, kid: 600, dudu: 960 };
export const DESK_TOP = 700;

// 牆上的時鐘：指針跟現實時間一樣
function wallClock(cx, cy) {
  const h = hour();
  const ha = ((h % 12) / 12) * 360;
  const ma = ((h % 1) * 60 / 60) * 360;
  const ticks = [...Array(12)].map((_, i) => `<rect x="-3" y="-44" width="6" height="${i % 3 ? 7 : 12}" fill="#3a2a22" transform="rotate(${i * 30})"/>`).join('');
  return `<g transform="translate(${cx} ${cy})"><circle r="56" fill="#fff" stroke="#e5734f" stroke-width="10"/>${ticks}
    <rect x="-4" y="-28" width="8" height="32" rx="4" fill="#3a2a22" transform="rotate(${ha})"/>
    <rect x="-3" y="-40" width="6" height="44" rx="3" fill="#5a6a8a" transform="rotate(${ma})"/><circle r="6" fill="#3a2a22"/></g>`;
}

export function classroomBack(ph, wx) {
  const { grey, colors: [a, b] } = skyColors(ph, wx);
  const win = { x: 40, y: 90, w: 190, h: 250 };
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="swin"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="14"/></clipPath></defs>
    <rect width="1200" height="900" fill="#fbeed3"/>
    <rect y="470" width="1200" height="90" fill="#f3d9a8"/><rect y="466" width="1200" height="10" fill="#e5c08a"/>
    <rect y="560" width="1200" height="340" fill="#d9a86c"/>
    ${[600, 660, 730, 810].map((y) => `<rect y="${y}" width="1200" height="4" fill="#c4935a"/>`).join('')}
    <g clip-path="url(#swin)">
      <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="url(#ssky)"/>
      ${wx.kind === 'clear' || wx.kind === 'cloudy' ? `<circle cx="${win.x + 130}" cy="${win.y + 60}" r="30" fill="#ffd34d"/>` : ''}
      <rect x="${win.x}" y="${win.y + 180}" width="${win.w}" height="70" fill="${grey ? '#7fae74' : '#8fd67a'}"/>
      <circle cx="${win.x + 50}" cy="${win.y + 170}" r="40" fill="#4caf50"/><rect x="${win.x + 44}" y="${win.y + 190}" width="12" height="40" fill="#8a5a2b"/>
      ${weatherLayer(wx, ph, win.x, win.y, win.w, win.h)}
    </g>
    <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="14" fill="none" stroke="#fff" stroke-width="14"/>
    <path d="M${win.x + win.w / 2} ${win.y}V${win.y + win.h}M${win.x} ${win.y + win.h / 2}H${win.x + win.w}" stroke="#fff" stroke-width="10"/>
    <!-- 黑板 -->
    <rect x="262" y="62" width="556" height="292" rx="16" fill="#8a5a2b"/>
    <rect x="278" y="78" width="524" height="260" rx="8" fill="#2f5e4a"/>
    <rect x="300" y="344" width="480" height="14" rx="6" fill="#b9824f"/><rect x="340" y="336" width="30" height="10" rx="3" fill="#fff"/><rect x="390" y="336" width="24" height="10" rx="3" fill="#ffd34d"/>
    <g class="chalk" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85">
      <circle cx="350" cy="140" r="26"/><path d="M350 98v-12M350 182v12M308 140h-12M392 140h12M320 110l-8-8M380 170l8 8M380 110l8-8M320 170l-8 8"/>
      <path d="M700 250q20-40 40 0t40 0" stroke="#ffd34d"/><path d="M690 140l20-40 20 40z" stroke="#ff9fb0"/><circle cx="760" cy="120" r="20" stroke="#9fd8ee"/>
      <path d="M440 280h60M470 250v60" stroke="#9fd8ee"/>
    </g>
    ${wallClock(1000, 112)}
  </svg>`;
}

// 角色：各自一個 HTML 圖層，方便用 CSS 移動（不和 SVG transform 打架）
export function charDiv(id, cls, x, y, s) {
  return `<div class="s-char ${cls}" data-who="${id}" style="left:${x}px;top:${y}px;width:${240 * s}px;height:${320 * s}px">
    <svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg(id)}</svg></div>`;
}

// 前排桌子、小孩的椅子與頭像、嘟嘟的積木
export function desksSvg(profile) {
  const kid = profile.members.length > 1 ? 'both' : profile.members[0];
  const desk = (cx) => `<g>
    <path d="M${cx - 160} ${DESK_TOP}H${cx + 160}L${cx + 176} ${DESK_TOP + 36}H${cx - 176}Z" fill="#f2c48a"/>
    <rect x="${cx - 176}" y="${DESK_TOP + 36}" width="352" height="200" fill="#e0a868"/>
    <rect x="${cx - 176}" y="${DESK_TOP + 36}" width="352" height="12" fill="#c98f4f"/></g>`;
  return `<svg viewBox="0 0 1200 900">
    <g class="kidchair"><rect x="520" y="520" width="160" height="200" rx="30" fill="#5fa8e8"/>
      <g class="kidav" transform="translate(530 530)"><circle cx="70" cy="70" r="72" fill="#fff"/>${avatarSvg(kid, 140).replace('<svg ', '<svg x="0" y="0" ')}</g></g>
    ${desk(DESKS.kiki)}${desk(DESKS.kid)}${desk(DESKS.dudu)}
    <g class="blocks">
      <g class="blk b1"><rect x="${DESKS.dudu - 160}" y="${DESK_TOP - 50}" width="80" height="50" rx="6" fill="#e5484d"/></g>
      <g class="blk b2"><rect x="${DESKS.dudu - 152}" y="${DESK_TOP - 100}" width="64" height="50" rx="6" fill="#ffd34d"/></g>
      <g class="blk b3"><rect x="${DESKS.dudu - 144}" y="${DESK_TOP - 146}" width="48" height="46" rx="6" fill="#4caf50"/></g>
      <g class="blk b4"><path d="M${DESKS.dudu - 146} ${DESK_TOP - 146}L${DESKS.dudu - 120} ${DESK_TOP - 186}L${DESKS.dudu - 94} ${DESK_TOP - 146}Z" fill="#5fa8e8"/></g>
    </g>
  </svg>`;
}

// 小孩桌上的按鈕圖示：揮手、舉手
export const WAVE = `<svg viewBox="0 0 120 120" width="110" height="110"><g transform="rotate(-15 60 70)">
  <rect x="34" y="50" width="52" height="56" rx="22" fill="#ffd9b8"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${36 + i * 13}" y="${18 + Math.abs(1.5 - i) * 6}" width="11" height="44" rx="5.5" fill="#ffd9b8"/>`).join('')}
  <rect x="18" y="58" width="12" height="36" rx="6" fill="#ffd9b8" transform="rotate(-35 24 76)"/></g>
  <path d="M96 24q12 10 8 26M104 14q18 16 12 40" fill="none" stroke="#5fa8e8" stroke-width="5" stroke-linecap="round"/></svg>`;
export const HAND = `<svg viewBox="0 0 120 120" width="110" height="110">
  <rect x="50" y="76" width="22" height="40" rx="8" fill="#5fa8e8"/>
  <rect x="34" y="44" width="52" height="46" rx="20" fill="#ffd9b8"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${36 + i * 13}" y="${8 + Math.abs(1.5 - i) * 5}" width="11" height="46" rx="5.5" fill="#ffd9b8"/>`).join('')}
  <rect x="20" y="50" width="12" height="34" rx="6" fill="#ffd9b8" transform="rotate(-30 26 66)"/></svg>`;
export const HIFIVE = `<svg viewBox="0 0 140 120" width="130" height="112">
  <g transform="rotate(20 40 60)"><rect x="16" y="40" width="46" height="44" rx="18" fill="#f08a3c"/>${[0, 1, 2, 3].map((i) => `<rect x="${18 + i * 11}" y="12" width="10" height="38" rx="5" fill="#f08a3c"/>`).join('')}</g>
  <g transform="rotate(-20 100 60)"><rect x="78" y="40" width="46" height="44" rx="18" fill="#2f3e5c"/>${[0, 1, 2, 3].map((i) => `<rect x="${80 + i * 11}" y="12" width="10" height="38" rx="5" fill="#2f3e5c"/>`).join('')}</g>
  <path d="M70 6v14M56 10l6 10M84 10l-6 10" stroke="#ffd34d" stroke-width="5" stroke-linecap="round"/></svg>`;

// ---------- 問答題：圖卡 ----------
const card = (body) => `<svg viewBox="0 0 200 160" width="200" height="160">${body}</svg>`;
const hands = (y = 70) => `<rect x="54" y="${y}" width="40" height="44" rx="16" fill="#ffd9b8"/><rect x="106" y="${y}" width="40" height="44" rx="16" fill="#ffd9b8"/>`;
export const QUESTIONS = {
  wash: {
    q: 's_q_wash', a: 's_a_wash',
    right: card(`${hands(66)}${[[60, 50], [96, 40], [130, 56], [80, 116], [126, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#d6f4ff" stroke="#6cc7ea" stroke-width="3"/>`).join('')}<rect x="76" y="126" width="48" height="22" rx="8" fill="#ff9fb0"/>`),
    wrong: [
      card(`<path d="M30 110V90L58 84L72 60H128L142 84L170 90V110Z" fill="#ff6b5c"/><circle cx="66" cy="114" r="16" fill="#333"/><circle cx="134" cy="114" r="16" fill="#333"/>`),
      card(`<rect x="40" y="40" width="120" height="84" rx="10" fill="#333"/><rect x="50" y="50" width="100" height="64" rx="6" fill="#6cc7ea"/><path d="M90 70l22 12-22 12z" fill="#fff"/>`),
    ],
  },
  cough: {
    q: 's_q_cough', a: 's_a_cough',
    right: card(`<circle cx="90" cy="80" r="46" fill="#ffd9b8"/><circle cx="76" cy="66" r="6" fill="#333"/><circle cx="106" cy="66" r="6" fill="#333"/><path d="M60 100Q110 74 172 92L176 120Q120 112 66 124Z" fill="#5fa8e8"/>`),
    wrong: [
      card(`<circle cx="90" cy="80" r="46" fill="#ffd9b8"/><circle cx="76" cy="66" r="6" fill="#333"/><circle cx="106" cy="66" r="6" fill="#333"/><ellipse cx="90" cy="100" rx="14" ry="12" fill="#b8412f"/>${[[150, 80], [166, 100], [150, 120], [176, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#9fd8ee"/>`).join('')}`),
      card(`<circle cx="90" cy="80" r="46" fill="#ffd9b8"/><circle cx="76" cy="66" r="6" fill="#333"/><circle cx="106" cy="66" r="6" fill="#333"/><ellipse cx="90" cy="100" rx="14" ry="12" fill="#b8412f"/><rect x="128" y="60" width="44" height="60" rx="18" fill="#ffd9b8"/>${[[150, 40], [176, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#9fd8ee"/>`).join('')}`),
    ],
  },
  cross: {
    q: 's_q_cross', a: 's_a_cross',
    right: card(`${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 44}" y="126" width="30" height="16" fill="#fff" stroke="#ccc"/>`).join('')}<circle cx="70" cy="44" r="20" fill="#ffd9b8"/><rect x="54" y="64" width="32" height="56" rx="12" fill="#5fa8e8"/><circle cx="128" cy="70" r="15" fill="#ffd9b8"/><rect x="116" y="86" width="24" height="38" rx="10" fill="#ff9fb0"/><path d="M86 84Q104 96 118 94" stroke="#ffd9b8" stroke-width="9" fill="none" stroke-linecap="round"/>`),
    wrong: [
      card(`${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 44}" y="126" width="30" height="16" fill="#fff" stroke="#ccc"/>`).join('')}<circle cx="80" cy="70" r="15" fill="#ffd9b8"/><rect x="68" y="86" width="24" height="38" rx="10" fill="#ff9fb0"/><circle cx="140" cy="104" r="18" fill="#ffd34d"/><path d="M30 80h24M24 96h24M34 112h20" stroke="#aaa" stroke-width="5" stroke-linecap="round"/>`),
      card(`<rect x="0" y="100" width="200" height="60" fill="#6b6f7a"/><circle cx="100" cy="60" r="15" fill="#ffd9b8"/><rect x="88" y="76" width="24" height="38" rx="10" fill="#ff9fb0"/><rect x="120" y="90" width="64" height="40" rx="8" fill="#e5484d"/><circle cx="136" cy="132" r="8" fill="#333"/><circle cx="170" cy="132" r="8" fill="#333"/>`),
    ],
  },
};

// 道歉的兩個選擇：說對不起並幫忙撿（對）、跑走（錯）
export const SORRY_CARD = card(`<g transform="translate(18 10) scale(.45)">${characterSvg('kiki')}</g>
  <path d="M150 40c-10-14-30-6-26 10 4 12 26 24 26 24s22-12 26-24c4-16-16-24-26-10z" fill="#ff6b8a"/>
  <rect x="124" y="110" width="30" height="26" rx="4" fill="#e5484d"/><rect x="158" y="114" width="26" height="22" rx="4" fill="#ffd34d"/>`);
export const RUN_CARD = card(`<g transform="translate(60 10) scale(.45) rotate(10 120 160)">${characterSvg('kiki')}</g>
  <path d="M20 60h40M10 84h44M24 108h34" stroke="#aaa" stroke-width="7" stroke-linecap="round"/>
  <g transform="translate(150 130) rotate(30)"><rect x="-14" y="-12" width="28" height="24" rx="4" fill="#e5484d"/></g><g transform="translate(176 120) rotate(-20)"><rect x="-12" y="-10" width="24" height="20" rx="4" fill="#ffd34d"/></g>`);

// ---------- 垃圾分類 ----------
export const TRASH = {
  bottle: { cat: 'plastic', easy: 'recycle', en: 's_en_bottle',
    svg: `<rect x="38" y="6" width="24" height="12" rx="3" fill="#2f7fe0"/><path d="M40 18H60L66 32Q72 40 72 50V88Q72 94 66 94H34Q28 94 28 88V50Q28 40 34 32Z" fill="#cdeefc" stroke="#7cc4d8" stroke-width="4"/><rect x="28" y="52" width="44" height="18" fill="#5fc3e8"/>` },
  paper: { cat: 'paper', easy: 'recycle', en: 's_en_paper',
    svg: `<path d="M18 36L50 22L82 36V78L50 92L18 78Z" fill="#d9a86c"/><path d="M18 36L50 50L82 36M50 50V92" fill="none" stroke="#b07a40" stroke-width="4"/><path d="M18 36L8 24L40 12L50 22" fill="#e8bc84"/>` },
  banana: { cat: 'food', easy: 'general', en: 's_en_banana',
    svg: `<path d="M50 30Q20 50 18 86Q34 60 48 50Z" fill="#ffd34d" stroke="#e0a800" stroke-width="3"/><path d="M50 30Q80 50 84 86Q66 60 52 50Z" fill="#ffd34d" stroke="#e0a800" stroke-width="3"/><path d="M50 30Q46 60 50 90Q54 60 50 30Z" fill="#fff3b0"/><rect x="45" y="12" width="10" height="22" rx="4" fill="#7a5a20"/>` },
  apple: { cat: 'food', easy: 'general', en: 's_en_apple',
    svg: `<path d="M30 14Q50 24 70 14Q62 30 62 50Q62 70 70 86Q50 76 30 86Q38 70 38 50Q38 30 30 14Z" fill="#fff3d6" stroke="#e5484d" stroke-width="6" stroke-linejoin="round"/><ellipse cx="50" cy="44" rx="4" ry="6" fill="#5a3a2a"/><ellipse cx="50" cy="58" rx="4" ry="6" fill="#5a3a2a"/><path d="M50 14Q50 6 56 2" stroke="#7a4a1e" stroke-width="4" fill="none"/>` },
  tissue: { cat: 'general', easy: 'general', en: 's_en_tissue',
    svg: `<path d="M24 50Q18 30 38 26Q44 12 60 20Q80 18 78 38Q90 52 76 66Q78 84 58 80Q46 92 34 78Q14 74 24 50Z" fill="#fff" stroke="#c8d0da" stroke-width="4"/><path d="M38 44Q50 36 60 48M44 62Q56 56 64 64" fill="none" stroke="#c8d0da" stroke-width="4"/>` },
  mask: { cat: 'general', easy: 'general', en: 's_en_mask',
    svg: `<path d="M22 34Q50 26 78 34V66Q50 80 22 66Z" fill="#9fd8ee"/><path d="M22 46Q50 40 78 46M22 56Q50 52 78 56" stroke="#7cc4d8" stroke-width="3" fill="none"/><path d="M22 36Q6 40 10 54Q14 64 22 62M78 36Q94 40 90 54Q86 64 78 62" stroke="#fff" stroke-width="4" fill="none"/>` },
};
export const EASY_TRASH = ['bottle', 'paper', 'tissue', 'mask'];
export const HARD_TRASH = ['bottle', 'paper', 'banana', 'apple', 'tissue', 'mask'];
// 3 歲版：回收、一般垃圾兩桶（香蕉皮先放一般，避免太多概念）；6 歲版：四桶
export const EASY_BINS = ['recycle', 'general'];
export const HARD_BINS = ['paper', 'plastic', 'food', 'general'];
const RECYCLE_ICON = `<g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M38 34L50 14L62 34"/><path d="M70 48L82 68L58 68"/><path d="M30 68L18 68L30 48"/></g>`;
const BALL_ICON = `<path d="M26 50Q20 30 40 24Q56 14 70 28Q86 38 76 58Q74 80 52 78Q30 82 26 50Z" fill="#fff" opacity=".9"/><path d="M38 40L56 52M48 66L66 42" stroke="#888" stroke-width="4"/>`;
const BIN_LOOK = {
  recycle: { body: '#2f7fe0', icon: RECYCLE_ICON },
  general: { body: '#7a808c', icon: BALL_ICON },
  paper: { body: '#2f7fe0', icon: TRASH.paper.svg },
  plastic: { body: '#2ea05a', icon: TRASH.bottle.svg },
  food: { body: '#a0672e', icon: TRASH.banana.svg },
};
export function binSvg(kind) {
  const b = BIN_LOOK[kind];
  return `<svg viewBox="0 0 200 230" width="200" height="230">
    <g class="lid"><rect x="10" y="10" width="180" height="30" rx="12" fill="${b.body}"/><rect x="80" y="0" width="40" height="16" rx="6" fill="${b.body}"/></g>
    <path d="M20 40H180L166 222H34Z" fill="${b.body}"/><path d="M20 40H180L178 60H22Z" fill="#000" opacity=".15"/>
    <circle cx="100" cy="130" r="58" fill="#fff" opacity=".25"/>
    <g transform="translate(50 80)">${b.icon}</g></svg>`;
}

// ---------- 晚上：看星星 ----------
// 北斗七星（可以點），其他是一閃一閃的小星星
export const DIPPER = [[330, 150], [430, 130], [520, 165], [600, 215], [640, 320], [790, 330], [800, 215]];
const star5 = (r) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${p.join(' ')}"/>`;
};
export function nightSky(ph, wx, profile) {
  const { colors: [a, b] } = skyColors(ph === 'dusk' ? 'dusk' : 'night', wx);
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  const W = { x: 90, y: 40, w: 1020, h: 620 };
  const hz = W.y + W.h - 110;
  const tiny = [[180, 100], [250, 260], [700, 90], [900, 120], [980, 260], [1040, 160], [460, 300], [280, 420], [860, 440], [560, 420], [1000, 400]]
    .map(([x, y], i) => `<circle class="tw" style="animation-delay:${(i * 0.37) % 2}s" cx="${x}" cy="${y}" r="3.5" fill="#fff"/>`).join('');
  const kid = profile.members.length > 1 ? 'both' : profile.members[0];
  return `<svg viewBox="0 0 1200 900">
    <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="nwin"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="30"/></clipPath></defs>
    <rect width="1200" height="900" fill="#2a2f48"/>
    <g clip-path="url(#nwin)">
      <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#nsky)"/>
      ${wet ? '' : `${tiny}
      <g class="dipper-lines">${DIPPER.slice(1).map(([x, y], i) => `<path class="dl" d="M${DIPPER[i][0]} ${DIPPER[i][1]}L${x} ${y}" stroke="#ffe680" stroke-width="5" stroke-linecap="round"/>`).join('')}
        <path class="dl" d="M${DIPPER[3][0]} ${DIPPER[3][1]}L${DIPPER[6][0]} ${DIPPER[6][1]}" stroke="#ffe680" stroke-width="5" stroke-linecap="round"/></g>
      ${DIPPER.map(([x, y], i) => `<g class="nstar" data-i="${i}" transform="translate(${x} ${y})"><circle class="halo" r="40" fill="#ffe680"/><g fill="#fff6c8">${star5(20)}</g><circle class="hit" r="48" fill="transparent"/></g>`).join('')}
      <g class="moon" transform="translate(980 150)"><circle class="halo" r="80" fill="#fff6c8"/><circle r="56" fill="#fff6c8"/><circle cx="22" cy="-14" r="50" fill="${a}"/><circle class="hit" r="80" fill="transparent"/></g>`}
      <path d="M${W.x} ${hz + 20}Q300 ${hz - 30} 520 ${hz + 10}T${W.x + W.w} ${hz - 10}V${W.y + W.h}H${W.x}Z" fill="#1b2a3a"/>
      ${[[200, hz + 10], [300, hz], [860, hz - 10], [960, hz + 5]].map(([x, y]) => `<rect x="${x}" y="${y}" width="40" height="${W.y + W.h - y}" fill="#14202e"/><rect x="${x + 10}" y="${y + 14}" width="10" height="12" fill="#ffd34d" opacity=".8"/>`).join('')}
      ${weatherLayer(wx, 'night', W.x, W.y, W.w, W.h)}
    </g>
    <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="30" fill="none" stroke="#5a4a3a" stroke-width="24"/>
    <rect y="${W.y + W.h + 40}" width="1200" height="400" fill="#3a3148"/>
    <ellipse cx="230" cy="820" rx="190" ry="50" fill="#5a4a7a"/>
    <rect x="40" y="${W.y + W.h}" width="1120" height="50" rx="14" fill="#7a5a3a"/>
    <!-- 望遠鏡 -->
    <g transform="translate(720 ${W.y + W.h})"><path d="M0 0L-30 -10L-50 -120" stroke="#5a5a6a" stroke-width="8" fill="none"/><path d="M0 0L30 -10L-30 -110" stroke="#5a5a6a" stroke-width="8"/>
      <g transform="translate(-40 -120) rotate(-30)"><rect x="-70" y="-16" width="150" height="32" rx="10" fill="#e5734f"/><rect x="72" y="-22" width="18" height="44" rx="6" fill="#c9562f"/></g></g>
    <g transform="translate(150 ${W.y + W.h + 60})"><circle cx="80" cy="80" r="84" fill="#fff"/>${avatarSvg(kid, 160).replace('<svg ', '<svg x="0" y="0" ')}</g>
  </svg>`;
}

// 大廳的學堂小圖
export const SCHOOL_ICON = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#fbeed3"/>
  <rect y="300" width="420" height="120" fill="#d9a86c"/>
  <rect x="40" y="50" width="250" height="160" rx="10" fill="#8a5a2b"/><rect x="52" y="62" width="226" height="136" rx="6" fill="#2f5e4a"/>
  <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"><circle cx="100" cy="110" r="20"/><path d="M160 150q15-30 30 0t30 0" stroke="#ffd34d"/></g>
  ${characterSvg('gugu', { x: 250, y: 120, s: 0.62 })}
  <path d="M30 330H230L240 360H20Z" fill="#f2c48a"/><rect x="20" y="360" width="220" height="60" fill="#e0a868"/>
</svg>`;

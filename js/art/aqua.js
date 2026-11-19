// 歡樂島海生館的館內畫面（11/19）：每個展區的背景（1200x900）、玻璃反光、道具、圖卡。
// 小孩站在下面的參觀步道（y 700 以下），前面是欄杆和大大的展示缸。
import { weatherLayer, skyColors } from './bathroom.js';
import { CREATURES } from './sea.js';
import { ANIMALS } from './animals.js';

let uid = 0;
const id = (p) => `${p}${(uid += 1)}`;

// 參觀步道（深藍地毯＋地上的小燈）
const walkway = (c = '#1f2f4f') => `<rect y="700" width="1200" height="200" fill="${c}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${50 + i * 100}" cy="712" r="4" fill="#9fdcf6" opacity=".7"/>`).join('')}
  <path d="M0 760H1200" stroke="#fff" stroke-width="2" opacity=".06"/>`;
// 欄杆（玻璃前面）
const rail = (y = 676) => `<rect x="0" y="${y}" width="1200" height="12" rx="6" fill="#c9d4e0"/><rect x="0" y="${y + 18}" width="1200" height="6" fill="#8a9aae"/>${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 100 + 10}" y="${y}" width="6" height="30" fill="#8a9aae"/>`).join('')}`;

// 大展示缸：牆、玻璃框、水（漸層）、缸裡的佈景（clip 在玻璃裡面）
function tank({ wall = '#16304f', frame = [40, 70, 1120, 610], water = ['#5fc8f0', '#1f6aa8'], inside = '', rays = true, round = 40 }) {
  const [x, y, w, h] = frame;
  const g = id('tw');
  const c = id('tc');
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${water[0]}"/><stop offset="1" stop-color="${water[1]}"/></linearGradient>
    <clipPath id="${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${round}"/></clipPath></defs>
    <rect width="1200" height="900" fill="${wall}"/>
    <rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="${round + 12}" fill="#0c1a2e"/>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/>
      ${rays ? [0, 1, 2, 3].map((i) => `<path class="ray" style="animation-delay:${i * 0.8}s" d="M${x + 140 + i * 260} ${y}L${x + 60 + i * 260} ${y + h}H${x + 160 + i * 260}L${x + 200 + i * 260} ${y}Z" fill="#fff" opacity=".08"/>`).join('') : ''}
      ${inside}
      ${Array.from({ length: 14 }, (_, i) => `<circle class="bub" style="animation-delay:${(i * 0.53) % 4}s;animation-duration:${4 + (i % 4)}s" cx="${x + 40 + ((i * 173) % (w - 80))}" cy="${y + h - 20}" r="${3 + (i % 3) * 2}" fill="#dff6ff" opacity=".55"/>`).join('')}
    </g>`;
}
const sand = (y = 620, c = '#e8d4a0', c2 = '#d8c08a') => `<path d="M0 ${y}Q300 ${y - 30} 600 ${y - 6}T1200 ${y - 10}V900H0Z" fill="${c}"/>${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${60 + i * 72}" cy="${y + 20 + (i % 3) * 12}" rx="10" ry="4" fill="${c2}"/>`).join('')}`;
const rockA = (x, y, s = 1, c = '#5a6a7a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-90 0Q-80 -70 -20 -80Q50 -90 80 -40Q96 -10 90 0Z" fill="${c}"/><path d="M-50 -56Q-10 -70 30 -60" stroke="#fff" stroke-width="6" fill="none" opacity=".15"/></g>`;
const weed = (x, y, h = 160, c = '#3f9a6a', sway = 0) => `<path class="weed" style="animation-delay:${sway}s" d="M${x} ${y}q-20 ${-h / 4} 0 ${-h / 2}t0 ${-h / 2}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
const coral = (x, y, s = 1, c = '#ff7a6a') => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${c}" stroke-width="14" stroke-linecap="round" fill="none"><path d="M0 0V-70M0 -30L-30 -60V-90M0 -46L30 -76V-100M-30 -70L-50 -90M30 -86L46 -104"/></g>`;
const brain = (x, y, s = 1, c = '#c77dff') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 0Q-50 -50 0 -52Q50 -50 50 0Z" fill="${c}"/>${[0, 1, 2].map((i) => `<path d="M${-36 + i * 6} -${8 + i * 12}Q0 -${30 + i * 10} ${36 - i * 6} -${8 + i * 12}" stroke="#fff" stroke-width="4" fill="none" opacity=".4"/>`).join('')}</g>`;
// 海葵（小丑魚的家）
export const ANEMONE = (c = '#ff9fc4') => `<svg viewBox="0 0 160 130" width="160" height="130" overflow="visible"><ellipse cx="80" cy="120" rx="54" ry="12" fill="#c86a8a"/>${Array.from({ length: 13 }, (_, i) => `<path class="tent" style="animation-delay:${(i % 4) * 0.2}s" d="M${30 + i * 8} 120Q${20 + i * 9} ${70 - (i % 3) * 14} ${28 + i * 8} ${40 - (i % 4) * 8}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}</svg>`;

// 牆上的展區牌（只有圖案）
const sign = (x, y, crId, c = '#2f5f9e') => `<g transform="translate(${x} ${y})"><rect width="120" height="84" rx="16" fill="${c}" stroke="#fff" stroke-width="5"/><g transform="translate(18 0) scale(.42)">${CREATURES[crId].svg()}</g></g>`;

export function roomBack(room, ph, wx) {
  const n = ph === 'night' || ph === 'dusk';
  switch (room) {
    // ---------- 台灣水域館 ----------
    case 'stream': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#1d3a3a', water: ['#bff0f0', '#5ab8c8'],
      inside: `<path d="M40 180Q300 140 600 170T1160 160V70H40Z" fill="#7cc06a" opacity=".55"/>
        ${[160, 330, 980, 1080].map((x, i) => `<g transform="translate(${x} ${150 + (i % 2) * 20})"><rect x="-6" y="-10" width="12" height="40" fill="#6a4a2a"/><path d="M0 -70L-40 0H40Z" fill="#3f7a4f"/><path d="M0 -100L-30 -40H30Z" fill="#4f8a5a"/></g>`).join('')}
        <path d="M110 70V600" stroke="#eaffff" stroke-width="44" opacity=".5"/><path d="M110 70V600" stroke="#fff" stroke-width="14" opacity=".55" stroke-dasharray="30 20"/>
        ${sand(600, '#c8b890', '#a89870')}${rockA(250, 640, 1.2, '#7a8a8a')}${rockA(900, 650, 1.5, '#6a7a7a')}${rockA(560, 660, 0.9, '#8a9a9a')}
        ${[[400, 640], [700, 650], [1040, 640], [330, 660]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="12" fill="#b0a890"/>`).join('')}`,
    })}${sign(1040, 600 - 520, 'salmon', '#3f9a7a')}${rail()}${walkway('#1f3434')}</svg>`;
    case 'mangrove': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#20343a"/>
      <rect x="40" y="40" width="1120" height="200" rx="30" fill="${n ? '#3a5a7a' : '#bfe6f6'}"/>
      <path d="M40 240Q400 200 800 230T1160 220V640H40Z" fill="#7aa8a0"/>
      <path d="M40 420Q400 380 800 410T1160 400V660H40Z" fill="#8a7458"/>
      ${[[170, 420], [470, 400], [880, 400], [1080, 420]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[-60, -30, 0, 30, 60].map((d) => `<path d="M${d * 0.4} -120Q${d * 0.8} -60 ${d} 10" stroke="#6a4a32" stroke-width="9" fill="none"/>`).join('')}<rect x="-10" y="-260" width="20" height="150" fill="#6a4a32"/><ellipse cy="-270" rx="110" ry="60" fill="#3f8a4f"/><ellipse cx="-50" cy="-240" rx="60" ry="36" fill="#4f9a5a"/>${[-40, 0, 40].map((d) => `<path d="M${d} -220v50" stroke="#5a7a3a" stroke-width="5"/>`).join('')}</g>`).join('')}
      ${[[300, 560], [520, 600], [740, 570], [960, 600], [620, 520]].map(([x, y]) => `<ellipse class="hole" cx="${x}" cy="${y}" rx="34" ry="12" fill="#4a3a28"/>`).join('')}
      <rect x="40" y="40" width="1120" height="620" rx="30" fill="none" stroke="#0c1a2e" stroke-width="24"/>
      ${rail()}${walkway('#24302f')}</svg>`;
    case 'touch': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#253a4a"/>
      <rect x="40" y="40" width="1120" height="330" rx="30" fill="#2f5a7a"/>
      <path d="M40 300Q300 240 600 280T1160 260V370H40Z" fill="#4a7a9a"/>
      ${[[200, 160], [600, 120], [1000, 170]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-80 30q40 -30 80 0t80 0" stroke="#fff" stroke-width="5" fill="none" opacity=".4"/></g>`).join('')}
      <!-- 觸摸池：矮矮寬寬的岩石池 -->
      <path d="M90 470Q120 400 300 400H900Q1080 400 1110 470L1090 690H110Z" fill="#8a7a6a"/>
      <path d="M140 470Q160 430 300 430H900Q1040 430 1060 470L1040 650H160Z" fill="#3fa0c8"/>
      <path d="M150 500Q600 470 1050 500" stroke="#fff" stroke-width="6" fill="none" opacity=".35"/>
      ${rockA(300, 640, 0.9, '#6a5a4a')}${rockA(860, 645, 1, '#7a6a5a')}${rockA(600, 630, 0.6, '#6a5a4a')}
      <rect x="0" y="690" width="1200" height="12" fill="#c9d4e0"/>${walkway('#22303e')}</svg>`;
    case 'ocean': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#0f2440', frame: [20, 30, 1160, 650], water: ['#3fa8e0', '#123e78'], round: 26,
      inside: `${sand(610, '#c8b890', '#b0a078')}<path d="M700 640Q720 380 880 360Q1040 370 1060 640H980Q970 470 880 460Q800 470 790 640Z" fill="#4a5a6a"/>
        ${rockA(200, 650, 1.6, '#3a4a5a')}${weed(380, 640, 200, '#2f7a5a', 0.4)}${weed(420, 640, 160, '#3f8a6a', 1)}${weed(1120, 640, 220, '#2f7a5a', 0.2)}
        <rect x="540" y="30" width="110" height="650" fill="#fff" opacity=".07"/>`,
    })}${rail()}${walkway('#16233a')}</svg>`;
    // ---------- 珊瑚王國館 ----------
    case 'reef': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#1a3050', water: ['#7fe0f6', '#2f8ad0'],
      inside: `${sand(600)}${coral(150, 620, 1.2)}${coral(1060, 610, 1.1, '#ffb35c')}${brain(330, 640, 1.1)}${brain(870, 650, 1, '#ff9fc4')}${coral(700, 640, 0.9, '#ffd34d')}
        ${weed(80, 630, 150, '#3fbf8a', 0.3)}${weed(1120, 630, 170, '#3fbf8a', 0.9)}`,
    })}${sign(1040, 80, 'clownfish', '#ff8a2a')}${rail()}${walkway('#1d2a44')}</svg>`;
    case 'tunnel': return `<svg viewBox="0 0 1200 900">
      <defs><linearGradient id="tunw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc8f0"/><stop offset="1" stop-color="#1f5a98"/></linearGradient></defs>
      <rect width="1200" height="900" fill="url(#tunw)"/>
      ${Array.from({ length: 5 }, (_, i) => `<path class="ray" style="animation-delay:${i * 0.6}s" d="M${100 + i * 240} 0L${40 + i * 240} 700H${140 + i * 240}L${180 + i * 240} 0Z" fill="#fff" opacity=".07"/>`).join('')}
      <!-- 隧道的玻璃拱 -->
      <path d="M-20 900V420Q-20 60 600 60Q1220 60 1220 420V900" fill="none" stroke="#cfe8f6" stroke-width="26" opacity=".85"/>
      <path d="M40 900V430Q40 130 600 130Q1160 130 1160 430V900" fill="none" stroke="#fff" stroke-width="6" opacity=".35"/>
      ${[200, 400, 600, 800, 1000].map((x) => `<path d="M${x} ${x === 600 ? 60 : 80 + Math.abs(600 - x) * 0.25}V${x === 600 ? 130 : 150 + Math.abs(600 - x) * 0.2}" stroke="#cfe8f6" stroke-width="10" opacity=".6"/>`).join('')}
      <path d="M0 690Q600 650 1200 690V900H0Z" fill="#253858"/><path d="M0 700H1200" stroke="#9fdcf6" stroke-width="4" opacity=".5"/>
      ${walkway('#22314f')}</svg>`;
    case 'beluga': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#16304a', water: ['#cfeefa', '#5aa8d0'],
      inside: `<path d="M40 560Q200 500 340 540L380 690H40Z" fill="#e8f4fa"/><path d="M1160 520Q980 470 860 540L820 690H1160Z" fill="#dff0f8"/>
        ${sand(640, '#d8e4ea', '#c0d0da')}<path d="M300 300L340 250L380 300Z" fill="#fff" opacity=".15"/>`,
    })}${sign(1040, 80, 'beluga', '#5fa8d8')}${rail()}${walkway('#1b2a40')}</svg>`;
    case 'wreck': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#0f2236', water: ['#3a8aa0', '#0f3a52'],
      inside: `${sand(560, '#c8b890', '#b0a078')}
        <g transform="translate(560 470) rotate(-8)"><path d="M-420 -60H340L420 -140V40Q300 120 -340 110Q-420 60 -420 -60Z" fill="#5a4030"/><path d="M-380 -60H320" stroke="#3a2a20" stroke-width="10"/>
          ${[-300, -180, -60, 60, 180].map((x) => `<circle cx="${x}" cy="20" r="18" fill="#2a1a12" stroke="#7a5a40" stroke-width="5"/>`).join('')}<path d="M-120 -60V-240M-120 -200H40" stroke="#4a3426" stroke-width="16"/>${weed(-260, -60, 120, '#3f7a5a')}</g>
        ${[[260, 610], [380, 640], [500, 618], [640, 646], [780, 622], [900, 640]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="6" fill="#8a7a5a"/>`).join('')}`,
    })}${rail()}${walkway('#152034')}</svg>`;
    // ---------- 世界水域館 ----------
    case 'ancient': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#2a2440"/>
      <rect x="60" y="60" width="520" height="300" rx="20" fill="#3a6a8a" stroke="#0c1a2e" stroke-width="16"/>
      <path d="M60 300Q200 260 330 290T580 280V360H60Z" fill="#8a7a5a"/>${[[140, 240], [420, 200]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(.6)">${CREATURES.trilobite.svg()}</g>`).join('')}
      <rect x="640" y="60" width="500" height="420" rx="20" fill="#5a5070"/>
      ${Array.from({ length: 4 }, (_, i) => `<rect x="${670 + (i % 2) * 230}" y="${90 + Math.floor(i / 2) * 190}" width="210" height="170" rx="14" fill="#7a7090"/>`).join('')}
      <g transform="translate(700 110) scale(.55)" opacity=".85"><circle cx="100" cy="100" r="70" fill="#c8b890"/>${CREATURES.trilobite.svg()}</g><g transform="translate(930 280) scale(.6)"><circle cx="100" cy="100" r="70" fill="#c8b890"/><path d="M100 100m-10 0a10 10 0 1 1 20 0a20 20 0 1 1 -40 0a30 30 0 1 1 60 0a40 40 0 1 1 -80 0a50 50 0 1 1 100 0" stroke="#8a7a5a" stroke-width="7" fill="none"/></g>
      <rect x="60" y="400" width="520" height="270" rx="20" fill="#1d3a5a" stroke="#0c1a2e" stroke-width="12"/>
      ${rail(676)}${walkway('#221d36')}</svg>`;
    case 'kelptop': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#16304a', water: ['#9fe6c8', '#2f7a8a'],
      inside: `<rect x="40" y="70" width="1120" height="90" fill="#e8fff6" opacity=".35"/><path d="M40 160Q300 140 600 160T1160 150" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>
        ${[120, 260, 420, 580, 760, 920, 1080].map((x, i) => `<path class="weed" style="animation-delay:${i * 0.3}s" d="M${x} 700Q${x - 40} 450 ${x} 300T${x + 10} 150" stroke="#6a8a2a" stroke-width="22" fill="none"/>${[180, 260, 340].map((y) => `<ellipse cx="${x + 26}" cy="${y + i * 6}" rx="26" ry="10" fill="#8aa83a" transform="rotate(-20 ${x + 26} ${y + i * 6})"/>`).join('')}`).join('')}`,
    })}${rail()}${walkway('#1b2a40')}</svg>`;
    case 'kelp': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#16304a', water: ['#4fb0a0', '#0f4a5a'],
      inside: `${sand(620, '#b8a880', '#9a8a68')}${rockA(200, 650, 1.4, '#4a5a5a')}${rockA(1000, 660, 1.3, '#4a5a5a')}
        ${[90, 230, 380, 520, 680, 830, 980, 1120].map((x, i) => `<path class="weed" style="animation-delay:${i * 0.25}s" d="M${x} 680Q${x + 40} 480 ${x} 320T${x - 10} 70" stroke="#5a7a2a" stroke-width="18" fill="none"/>${[560, 460, 360, 260, 160].map((y) => `<ellipse cx="${x + (y % 200 ? 22 : -22)}" cy="${y}" rx="24" ry="9" fill="#7a9a3a" transform="rotate(${y % 200 ? -24 : 24} ${x} ${y})"/>`).join('')}`).join('')}`,
    })}${rail()}${walkway('#1b2a40')}</svg>`;
    case 'deep': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#060c18', water: ['#0f2040', '#02060e'], rays: false,
      inside: `${sand(630, '#2a2a3a', '#1f1f2c')}${rockA(300, 660, 1.3, '#1a2030')}${rockA(900, 660, 1.6, '#1a2030')}
        ${Array.from({ length: 30 }, (_, i) => `<circle cx="${60 + (i * 137) % 1080}" cy="${90 + (i * 89) % 520}" r="${1.5 + (i % 3)}" fill="#9fdcf6" opacity="${0.15 + (i % 4) * 0.1}"/>`).join('')}`,
    })}${rail()}${walkway('#0c1424')}</svg>`;
    case 'polar': return `<svg viewBox="0 0 1200 900">${tank({
      wall: '#1c3550', water: ['#e6f6ff', '#7ab8e0'], rays: false,
      inside: `<rect x="40" y="70" width="1120" height="610" fill="#eaf8ff"/>
        ${Array.from({ length: 30 }, (_, i) => `<circle class="snow" style="animation-delay:${(i * 0.37) % 5}s" cx="${50 + (i * 131) % 1100}" cy="${80 + (i * 53) % 200}" r="${2 + (i % 3)}" fill="#fff"/>`).join('')}
        <path d="M40 420L150 250L260 350L380 220L520 360L640 300L760 380L900 240L1040 330L1160 260V470H40Z" fill="#fff" stroke="#cfe6f4" stroke-width="6"/>
        <path d="M40 470H1160V680H40Z" fill="#3fa0d8"/><path d="M40 500Q300 480 600 500T1160 490V680H40Z" fill="#2f86c0"/>
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${90 + i * 140} 560q20 -8 40 0" stroke="#bfe6fb" stroke-width="4" fill="none" opacity=".7"/>`).join('')}`,
    })}${sign(180, 84, 'king', '#6a8ab8')}${rail()}${walkway('#1b2a40')}</svg>`;
    case 'lobby': return `<svg viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#dfe8f2"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${40 + i * 230}" y="40" width="200" height="360" rx="14" fill="${n ? '#3a4a6a' : '#bfe6fb'}"/>`).join('')}
      <rect y="400" width="1200" height="300" fill="#eef2f8"/>
      <path d="M0 700H1200" stroke="#c9d4e0" stroke-width="10"/>
      ${[200, 1000].map((x) => `<path d="M${x} 40V420" stroke="#8a9aae" stroke-width="4"/>`).join('')}
      <rect y="700" width="1200" height="200" fill="#c8b490"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 130} 700L${i * 130 - 60} 900" stroke="#b8a480" stroke-width="3"/>`).join('')}
      </svg>`;
    // ---------- 迎賓廣場（戶外） ----------
    case 'plaza': {
      const { colors: [a, b] } = skyColors(ph, wx);
      return `<svg viewBox="0 0 1200 900"><defs><linearGradient id="plsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
        <rect width="1200" height="520" fill="url(#plsky)"/>
        <path d="M0 380Q300 340 600 360T1200 350V520H0Z" fill="${n ? '#2f4f6a' : '#5fc0ec'}"/>
        <g transform="translate(120 230)"><path d="M0 200V60Q120 -20 240 60V200Z" fill="#4fa8e0"/><path d="M40 200V120H90V200ZM150 200V120H200V200Z" fill="#bfe6fb"/></g>
        <g transform="translate(840 250)"><rect width="260" height="180" rx="10" fill="#eef2f8"/><circle cx="130" cy="-10" r="40" fill="#5fc0ec" stroke="#fff" stroke-width="6"/></g>
        <rect y="440" width="1200" height="460" fill="${n ? '#6a6a6a' : '#f2e2c0'}"/>
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 150} 440L${i * 150 - 100} 900" stroke="${n ? '#5a5a5a' : '#e6d2a8'}" stroke-width="4"/>`).join('')}
        <ellipse cx="600" cy="610" rx="440" ry="120" fill="${n ? '#3a5a7a' : '#a8dcf4'}"/><ellipse cx="600" cy="610" rx="400" ry="100" fill="${n ? '#4a6a8a' : '#cfeefa'}"/>
        ${Array.from({ length: 12 }, (_, i) => `<circle cx="${260 + (i % 6) * 136}" cy="${570 + Math.floor(i / 6) * 70}" r="9" fill="#7cc8ea"/>`).join('')}
        <!-- 白鯨尾巴雕像 -->
        <g transform="translate(600 610)"><ellipse cy="10" rx="70" ry="16" fill="#9aa8b8"/><rect x="-20" y="-120" width="40" height="130" rx="16" fill="#e8f2f8" stroke="#a9c3d4" stroke-width="5"/>
          <path d="M0 -110Q-50 -200 -140 -196Q-100 -140 -30 -112Z" fill="#e8f2f8" stroke="#a9c3d4" stroke-width="5"/><path d="M0 -110Q50 -200 140 -196Q100 -140 30 -112Z" fill="#e8f2f8" stroke="#a9c3d4" stroke-width="5"/></g>
        ${[[80, 520], [1120, 520]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 0Q-4 -50 6 -110" stroke="#a87a4a" stroke-width="14" fill="none"/>${[-60, -20, 20, 60, 100, 140].map((a) => `<path d="M6 -110q${(Math.cos(a * Math.PI / 180) * 50).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 26 - 6).toFixed(1)} ${(Math.cos(a * Math.PI / 180) * 76).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 44 + 16).toFixed(1)}" stroke="#3f9a4f" stroke-width="14" fill="none" stroke-linecap="round"/>`).join('')}</g>`).join('')}
        ${[[300, 470], [900, 470]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-4" y="-80" width="8" height="84" fill="#5a6676"/><path d="M-4 -78h-50l12 16l-12 16h50z" fill="#5fc3ea"/></g>`).join('')}
        ${weatherLayer(wx, ph, 0, 0, 1200, 900)}</svg>`;
    }
    default: return '';
  }
}
// 玻璃反光（放在海洋生物前面）
export const GLASS = `<svg viewBox="0 0 1200 900" preserveAspectRatio="none"><path d="M120 110L240 90M140 150L300 118M960 600L1080 570" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".18"/></svg>`;

// 隧道頂上慢慢游過去的魚群（一條長長的帶子，左右重複）
export function tunnelStrip() {
  const fishes = [['turtle', 150, 120, 220], ['butterfly', 560, 200, 120], ['shark', 900, 90, 280], ['ray', 1400, 160, 220], ['clownfish', 1800, 230, 110], ['butterfly', 2050, 130, 110]];
  return `<svg viewBox="0 0 2400 400" width="2400" height="400" overflow="visible">${fishes.map(([k, x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s / 200})">${CREATURES[k].svg()}</g>`).join('')}</svg>`;
}

// ---------- 道具 ----------
// 溪水裡的垃圾
export const TRASH = {
  bottle: `<svg viewBox="0 0 100 100" width="96" height="96"><g transform="rotate(70 50 50)"><rect x="34" y="24" width="32" height="64" rx="12" fill="#bfe6fb" stroke="#7cc8ea" stroke-width="4"/><rect x="42" y="10" width="16" height="16" rx="4" fill="#3a7bd5"/><rect x="34" y="46" width="32" height="18" fill="#e5484d"/></g></svg>`,
  can: `<svg viewBox="0 0 100 100" width="90" height="90"><g transform="rotate(-30 50 50)"><rect x="30" y="20" width="40" height="62" rx="8" fill="#c0c8d4"/><rect x="30" y="34" width="40" height="30" fill="#ffb300"/><ellipse cx="50" cy="22" rx="20" ry="5" fill="#9aa4b0"/></g></svg>`,
  bag: `<svg viewBox="0 0 100 100" width="100" height="100"><path d="M24 34Q20 80 30 86H70Q80 80 76 34Z" fill="#fff" opacity=".85" stroke="#c8d0da" stroke-width="3"/><path d="M34 34Q34 14 42 16Q46 26 44 34M56 34Q54 22 60 16Q68 18 66 34" stroke="#c8d0da" stroke-width="4" fill="none"/></svg>`,
  wrap: `<svg viewBox="0 0 100 100" width="84" height="84"><path d="M14 40L30 34L70 34L86 40L70 62H30Z" fill="#ff7fa8"/><path d="M14 40L4 30M14 40L4 52M86 40L96 30M86 40L96 52" stroke="#ff7fa8" stroke-width="5"/><circle cx="50" cy="48" r="8" fill="#fff"/></svg>`,
};
export const BIN = `<svg viewBox="0 0 120 140" width="120" height="140"><rect x="16" y="30" width="88" height="104" rx="10" fill="#3fae6a"/><rect x="8" y="18" width="104" height="18" rx="8" fill="#2f8e55"/><path d="M44 70l8 -14l8 14M40 76l12 16l12 -16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
// 髒髒的溪水（垃圾撿完會慢慢變乾淨）
export const MURK = `<svg viewBox="0 0 1200 900" preserveAspectRatio="none"><rect x="40" y="70" width="1120" height="610" rx="40" fill="#7a6a3a" opacity=".55"/>${Array.from({ length: 20 }, (_, i) => `<circle cx="${80 + (i * 211) % 1040}" cy="${120 + (i * 97) % 520}" r="${10 + (i % 4) * 6}" fill="#5a4a2a" opacity=".35"/>`).join('')}</svg>`;
// 觸摸池的蓋子（休息時間）＋時鐘（下一場幾點）
export function poolLid(next) {
  const hands = (h) => {
    const hh = Math.floor(h) % 12;
    const mm = Math.round((h % 1) * 60);
    const ha = ((hh + mm / 60) / 12) * Math.PI * 2;
    const ma = (mm / 60) * Math.PI * 2;
    return `<path d="M0 0L${(Math.sin(ha) * 22).toFixed(1)} ${(-Math.cos(ha) * 22).toFixed(1)}" stroke="#1d2433" stroke-width="7" stroke-linecap="round"/><path d="M0 0L${(Math.sin(ma) * 34).toFixed(1)} ${(-Math.cos(ma) * 34).toFixed(1)}" stroke="#1d2433" stroke-width="5" stroke-linecap="round"/>`;
  };
  return `<svg viewBox="0 0 1200 900" preserveAspectRatio="none" overflow="visible">
    <path d="M140 470Q160 430 300 430H900Q1040 430 1060 470L1040 650H160Z" fill="#cfd8e2" opacity=".92"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${180 + i * 74} 440L${170 + i * 74} 650" stroke="#9aa8b8" stroke-width="5"/>`).join('')}
    <path d="M150 520H1050M155 590H1045" stroke="#9aa8b8" stroke-width="5"/>
    ${next == null ? `<g transform="translate(600 470)"><circle r="54" fill="#fff" stroke="#e5484d" stroke-width="10"/><path d="M-34 0H34" stroke="#e5484d" stroke-width="12" stroke-linecap="round"/></g>`
      : `<g transform="translate(600 470)"><circle r="56" fill="#fff" stroke="#3a7bd5" stroke-width="10"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${(Math.sin(i * Math.PI / 6) * 44).toFixed(1)}" cy="${(-Math.cos(i * Math.PI / 6) * 44).toFixed(1)}" r="${i % 3 ? 2.5 : 4}" fill="#3a7bd5"/>`).join('')}${hands(next)}<circle r="5" fill="#e5484d"/></g>`}
  </svg>`;
}
// 放大鏡、手電筒的圖示（找東西的時候畫面中間的圈圈）
export const LENS_ICON = { lens: '#c98a4a', light: '#ffd34d' };

// 化石石板（刷一刷）
export function fossilSlab(kind) {
  const inner = kind === 'tri'
    ? `<g transform="translate(50 30) scale(.8)" opacity=".85">${CREATURES.trilobite.svg().replace(/#9a8a72/g, '#a89070').replace(/#b8a88a/g, '#b89a7a')}</g>`
    : '<g transform="translate(130 130)"><path d="M0 0m-12 0a12 12 0 1 1 24 0a24 24 0 1 1 -48 0a36 36 0 1 1 72 0a48 48 0 1 1 -96 0a60 60 0 1 1 120 0" stroke="#8a6a4a" stroke-width="10" fill="none"/>' + Array.from({ length: 10 }, (_, i) => `<path d="M${(Math.cos(i * 0.62) * (14 + i * 5)).toFixed(1)} ${(Math.sin(i * 0.62) * (14 + i * 5)).toFixed(1)}l${(Math.cos(i * 0.62) * 10).toFixed(1)} ${(Math.sin(i * 0.62) * 10).toFixed(1)}" stroke="#8a6a4a" stroke-width="4"/>`).join('') + '</g>';
  return `<svg viewBox="0 0 260 260" width="260" height="260"><path d="M20 40Q10 10 60 14L210 8Q252 14 248 60L250 210Q246 252 200 248L50 252Q8 248 12 200Z" fill="#c8b490" stroke="#a8946e" stroke-width="6"/>${inner}
    <g class="dust">${Array.from({ length: 22 }, (_, i) => `<circle cx="${40 + (i * 53) % 180}" cy="${40 + (i * 37) % 180}" r="${22 + (i % 3) * 8}" fill="#d8c8a0"/>`).join('')}</g></svg>`;
}
// 海藻一叢（點一下撥開）
export const KELP_CLUMP = `<svg viewBox="0 0 160 420" width="160" height="420" overflow="visible">${[30, 70, 110, 140].map((x, i) => `<path d="M${x} 420Q${x + (i % 2 ? 30 : -30)} 300 ${x} 200T${x + 6} 10" stroke="${i % 2 ? '#6a8a2a' : '#5a7a22'}" stroke-width="20" fill="none"/>${[340, 250, 160, 80].map((y) => `<ellipse cx="${x + (i % 2 ? 20 : -20)}" cy="${y + i * 6}" rx="22" ry="9" fill="#8aa83a" transform="rotate(${i % 2 ? -26 : 26} ${x} ${y + i * 6})"/>`).join('')}`).join('')}</svg>`;
// 公車剪影（藍鯨有兩台公車那麼長）
export const BUS = `<svg viewBox="0 0 300 120" width="520" height="208"><rect x="6" y="14" width="288" height="86" rx="18" fill="#ffc400" stroke="#fff" stroke-width="5"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${26 + i * 52}" y="28" width="40" height="30" rx="6" fill="#bfe6fb"/>`).join('')}<circle cx="70" cy="102" r="16" fill="#333"/><circle cx="232" cy="102" r="16" fill="#333"/></svg>`;
// 藍鯨骨骼（大廳天花板）
export const WHALE_BONES = `<svg viewBox="0 0 1100 260" width="1100" height="260" overflow="visible">
  <path d="M40 120Q60 60 180 70L300 96" stroke="#f4ead8" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M40 140Q70 180 200 160" stroke="#f4ead8" stroke-width="16" fill="none" stroke-linecap="round"/>
  ${Array.from({ length: 28 }, (_, i) => `<rect x="${300 + i * 26}" y="${98 + Math.sin(i / 6) * 8}" width="18" height="26" rx="6" fill="#f4ead8"/>`).join('')}
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${330 + i * 26} ${124 + Math.sin(i / 6) * 8}Q${320 + i * 26} ${190 - i * 3} ${300 + i * 26} ${210 - i * 4}" stroke="#efe2cc" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}
  <path d="M360 140Q340 200 300 214" stroke="#efe2cc" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M1030 110L1080 70M1030 110L1086 140" stroke="#f4ead8" stroke-width="16" stroke-linecap="round"/>
  ${[60, 360, 700, 1000].map((x) => `<path d="M${x} -40V${100}" stroke="#8a9aae" stroke-width="3"/>`).join('')}
</svg>`;
// 迎賓廣場：噴水柱、防曬乳、帽子、水壺、毛巾、乾衣服
export const JET = `<svg viewBox="0 0 80 240" width="80" height="240" overflow="visible"><path d="M40 240Q20 120 40 20Q60 120 40 240Z" fill="#dff4ff" opacity=".95"/><path d="M40 230Q32 140 40 40" stroke="#fff" stroke-width="6" fill="none"/>${[[20, 30], [60, 24], [36, 6], [52, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#bfe6fb"/>`).join('')}</svg>`;
export const SUNSCREEN = `<svg viewBox="0 0 100 120" width="100" height="120"><rect x="28" y="30" width="44" height="80" rx="12" fill="#ffd34d"/><rect x="38" y="12" width="24" height="22" rx="6" fill="#ff8a3c"/><circle cx="50" cy="66" r="14" fill="#ff8a3c"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${50 + Math.cos(a * Math.PI / 180) * 18} ${66 + Math.sin(a * Math.PI / 180) * 18}l${Math.cos(a * Math.PI / 180) * 6} ${Math.sin(a * Math.PI / 180) * 6}" stroke="#ff8a3c" stroke-width="3"/>`).join('')}</svg>`;
export const SUNHAT = `<svg viewBox="0 0 120 70" width="120" height="70"><ellipse cx="60" cy="52" rx="56" ry="14" fill="#f6dca0"/><path d="M26 50Q28 10 60 10Q92 10 94 50Z" fill="#ffe8b0"/><path d="M28 42Q60 34 92 42" stroke="#5fc3ea" stroke-width="7" fill="none"/></svg>`;
export const BOTTLE = `<svg viewBox="0 0 80 130" width="80" height="130"><rect x="18" y="26" width="44" height="96" rx="14" fill="#5fc3ea"/><rect x="26" y="8" width="28" height="22" rx="6" fill="#3a7bd5"/><path d="M18 70H62" stroke="#fff" stroke-width="5" opacity=".6"/></svg>`;
export const DRY_CLOTHES = `<svg viewBox="0 0 120 110" width="120" height="110"><path d="M30 10L10 30L22 44L30 38V100H90V38L98 44L110 30L90 10H74Q60 24 46 10Z" fill="#8fdba8"/><path d="M46 10Q60 24 74 10" stroke="#fff" stroke-width="5" fill="none"/></svg>`;
// 潛水員（大洋池餵食）、保育員（海豹、企鵝餵食）
export const DIVER = `<svg viewBox="0 0 200 200" width="200" height="200" overflow="visible"><g transform="rotate(-10 100 100)">
  <rect x="40" y="76" width="110" height="46" rx="22" fill="#2a2f3a"/><rect x="58" y="58" width="40" height="22" rx="8" fill="#ffc400"/>
  <circle cx="160" cy="96" r="26" fill="#2a2f3a"/><rect x="156" y="82" width="34" height="22" rx="8" fill="#9fdcf6" stroke="#ffc400" stroke-width="4"/>
  <path d="M40 100L6 84M40 104L4 120" stroke="#2a2f3a" stroke-width="14" stroke-linecap="round"/><path d="M4 76L-14 70V92ZM2 112L-16 118V132Z" fill="#ffc400"/>
  <path d="M120 120L136 150" stroke="#2a2f3a" stroke-width="12" stroke-linecap="round"/><rect x="124" y="146" width="34" height="28" rx="6" fill="#e5484d"/>
  ${[0, 1, 2].map((i) => `<circle class="bub" cx="${178 + i * 6}" cy="${60 - i * 20}" r="${5 + i}" fill="#dff6ff" opacity=".7"/>`).join('')}</g></svg>`;
export const KEEPER = `<svg viewBox="0 0 160 260" width="160" height="260" overflow="visible">
  <circle cx="80" cy="56" r="34" fill="#ffd9b8"/><path d="M46 52Q48 18 80 18Q112 18 114 52Q98 36 80 40Q62 36 46 52Z" fill="#4a2f24"/><circle cx="68" cy="58" r="4" fill="#2b2320"/><circle cx="92" cy="58" r="4" fill="#2b2320"/><path d="M70 72Q80 80 90 72" stroke="#c9462c" stroke-width="3" fill="none"/>
  <path d="M40 100Q80 86 120 100L126 200H34Z" fill="#3a7bd5"/><path d="M60 96L80 120L100 96" fill="#fff"/>
  <rect x="44" y="196" width="28" height="56" rx="10" fill="#2f4b7c"/><rect x="88" y="196" width="28" height="56" rx="10" fill="#2f4b7c"/>
  <path d="M120 110L150 150" stroke="#3a7bd5" stroke-width="18" stroke-linecap="round"/><rect x="132" y="140" width="40" height="34" rx="6" fill="#9aa4b0"/></svg>`;
// 樓梯（換樓層的時候）
export const STAIRS = `<svg viewBox="0 0 600 420" width="600" height="420" overflow="visible">
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${40 + i * 70}" y="${60 + i * 50}" width="120" height="20" rx="6" fill="#c9d4e0"/><rect x="${40 + i * 70}" y="${80 + i * 50}" width="120" height="30" fill="#8a9aae"/>`).join('')}
  <path d="M40 30L540 380" stroke="#ffd34d" stroke-width="12" stroke-linecap="round"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${80 + i * 84} ${58 + i * 59}V${100 + i * 59}" stroke="#ffd34d" stroke-width="6"/>`).join('')}
</svg>`;
// 小孩的腳印（隧道裡慢慢走）
export const STEPS = `<svg viewBox="0 0 160 120" width="160" height="120">${[[40, 70, -10], [100, 40, 10]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="20" ry="30" fill="#ff9f43"/>${[[-12, -34, 6], [-3, -40, 6], [6, -40, 5], [14, -35, 5]].map(([a, b, c]) => `<circle cx="${a}" cy="${b}" r="${c}" fill="#ff9f43"/>`).join('')}</g>`).join('')}</svg>`;
// 唱歌的泡泡按鈕（低、中、高）
export const SONG_BTN = (k) => `<svg viewBox="0 0 140 140" width="140" height="140"><circle cx="70" cy="70" r="62" fill="${['#9fdcf6', '#7cc8ea', '#5fb0e0'][k]}" stroke="#fff" stroke-width="8"/><path d="M40 52a30 30 0 0 1 30 -22" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>${Array.from({ length: k + 1 }, (_, i) => `<g transform="translate(${70 + (i - k / 2) * 26} 80)"><ellipse rx="10" ry="8" fill="#1d3a6a"/><path d="M9 0V-34" stroke="#1d3a6a" stroke-width="4"/></g>`).join('')}</svg>`;

// ---------- 圖卡（100x100）：對的綠底、錯的紅底 ----------
const ok = (b) => `<rect width="100" height="100" rx="16" fill="#e6f8e6"/>${b}`;
const no = (b) => `<rect width="100" height="100" rx="16" fill="#ffe8e8"/>${b}`;
const kid = (x, y, arm = '', legs = '') => `<circle cx="${x}" cy="${y}" r="10" fill="#ffd6b8"/><path d="M${x} ${y + 10}V${y + 36}${legs || ` M${x} ${y + 36}l-8 14M${x} ${y + 36}l8 14`}${arm}" stroke="#3a7bd5" stroke-width="6" stroke-linecap="round" fill="none"/>`;
const crIn = (k, s, x, y) => `<g transform="translate(${x} ${y}) scale(${s})">${CREATURES[k].svg()}</g>`;
const tankBox = '<rect x="46" y="10" width="48" height="80" rx="6" fill="#7cc8ea" stroke="#fff" stroke-width="4"/>';
const cam = '<rect x="10" y="40" width="34" height="24" rx="5" fill="#3a3f4a"/><circle cx="27" cy="52" r="7" fill="#9fd0ff"/>';
export const SEA_CARD = {
  gentle: ok(`${tankBox}${crIn('shark', 0.22, 48, 28)}${kid(24, 30, ' M24 48l10 -4M24 48l-10 4')}`),
  knock: no(`${tankBox}${crIn('shark', 0.22, 48, 28)}${kid(24, 30, ' M24 44l20 -6')}<path d="M48 30l8 -4M48 40l10 0" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  noflash: ok(`${crIn('beluga', 0.26, 46, 30)}${cam}<path d="M36 36l8 -8M44 36l-8 -8" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  flash: no(`${crIn('beluga', 0.26, 46, 30)}${cam}<path d="M38 34L46 24L44 34L54 30" stroke="#ffd34d" stroke-width="5" fill="none" stroke-linejoin="round"/>`),
  quiet: ok(`${crIn('gardeneel', 0.3, 50, 34)}${crIn('gardeneel', 0.3, 66, 38)}${kid(24, 34)}<path d="M20 40h8" stroke="#e5484d" stroke-width="3"/><path d="M30 36v8" stroke="#ffd6b8" stroke-width="4"/>`),
  loud: no(`<rect x="50" y="80" width="40" height="8" rx="4" fill="#d8c08e"/>${kid(24, 34, ' M24 52l-10 -10M24 52l10 -10')}<path d="M36 26l8 -6M38 34l10 0M36 42l8 6" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  walk: ok(`${kid(50, 26)}<path d="M28 90h44" stroke="#9fdcf6" stroke-width="6" stroke-linecap="round"/>`),
  run: no(`${kid(54, 24, ' M54 44l14 -10M54 44l-14 6', ` M54 60l-16 12M54 60l14 14`)}<path d="M18 40h14M14 54h16M20 68h12" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/><path d="M28 92h44" stroke="#9fdcf6" stroke-width="6" stroke-linecap="round"/>`),
  rail: ok(`<path d="M14 90L40 70L62 50L86 30" stroke="#8a9aae" stroke-width="8" stroke-linejoin="round" fill="none"/><path d="M14 64L86 6" stroke="#ffd34d" stroke-width="5"/>${kid(44, 28, ' M44 46l14 -14')}`),
  stairsrun: no(`<path d="M14 90L40 70L62 50L86 30" stroke="#8a9aae" stroke-width="8" stroke-linejoin="round" fill="none"/>${kid(48, 20, ' M48 40l14 -10M48 40l-14 6', ' M48 56l-14 12M48 56l12 14')}<path d="M18 30h12M16 44h12" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
  bin: ok(`<g transform="translate(40 26) scale(.46)">${BIN.replace(/<\/?svg[^>]*>/g, '')}</g>${kid(22, 30, ' M22 48l18 -6')}`),
  river: no(`<path d="M0 74Q50 60 100 74V100H0Z" fill="#7cc8ea"/>${kid(26, 18, ' M26 36l22 10')}<g transform="translate(52 52) scale(.3)">${TRASH.bottle.replace(/<\/?svg[^>]*>/g, '')}</g>`),
  putback: ok(`<path d="M6 60Q50 46 94 60V94H6Z" fill="#7cc8ea"/>${crIn('seastar', 0.3, 36, 40)}<path d="M50 20V40M42 32l8 8l8 -8" stroke="#3fae6a" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  takehome: no(`<rect x="44" y="50" width="44" height="40" rx="6" fill="#ffb300"/><path d="M50 50Q66 30 82 50" stroke="#8a6a4a" stroke-width="4" fill="none"/>${crIn('seastar', 0.2, 46, 36)}${kid(22, 30, ' M22 48l20 6')}`),
  dark: ok(`<rect x="6" y="6" width="88" height="88" rx="12" fill="#0f1a30"/>${[[30, 30], [70, 60], [40, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#9fdcf6"/>`).join('')}`),
  bright: no(`<rect x="6" y="6" width="88" height="88" rx="12" fill="#bfeefa"/><circle cx="70" cy="30" r="14" fill="#ffd34d"/>`),
  jacket: ok(`<path d="M30 20L12 36L22 48L30 42V88H70V42L78 48L88 36L70 20H60L50 34L40 20Z" fill="#e5484d"/><path d="M50 34V88" stroke="#fff" stroke-width="3"/>${[50, 62, 74].map((y) => `<circle cx="56" cy="${y}" r="3" fill="#fff"/>`).join('')}<path d="M14 92l6 -8l6 8M74 14l6 -8l6 8" stroke="#9fdcf6" stroke-width="3" fill="none"/>`),
  tshirt: no(`<path d="M32 22L14 36L22 46L32 40V80H68V40L78 46L86 36L68 22H58Q50 32 42 22Z" fill="#ffd34d"/><path d="M14 92l6 -8l6 8M74 14l6 -8l6 8" stroke="#9fdcf6" stroke-width="3" fill="none"/>`),
  wetwalk: ok(`${kid(50, 26)}<ellipse cx="50" cy="90" rx="36" ry="6" fill="#9fdcf6"/>`),
  wetrun: no(`${kid(54, 24, ' M54 44l14 -10M54 44l-14 6', ' M54 60l-16 12M54 60l14 14')}<ellipse cx="50" cy="90" rx="36" ry="6" fill="#9fdcf6"/><path d="M18 40h14M14 54h16" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
};
export const NAUTILUS_CARD = `<rect width="100" height="100" rx="16" fill="#fff"/>${crIn('nautilus', 0.44, 6, 6)}`;
export const FISH_CARD = `<rect width="100" height="100" rx="16" fill="#fff"/>${crIn('grouper', 0.44, 6, 6)}`;
export const CRAB_CARD = `<rect width="100" height="100" rx="16" fill="#fff"/>${crIn('crab', 0.44, 6, 6)}`;
export const AMMONITE_CARD = `<rect width="100" height="100" rx="16" fill="#f4ead8"/><g transform="translate(50 50)"><path d="M0 0m-6 0a6 6 0 1 1 12 0a12 12 0 1 1 -24 0a18 18 0 1 1 36 0a24 24 0 1 1 -48 0a30 30 0 1 1 60 0" stroke="#8a6a4a" stroke-width="6" fill="none"/></g>`;
export { ANIMALS };

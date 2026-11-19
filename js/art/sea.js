// 歡樂島海生館的海洋生物（11/19）：每隻畫在 200x200 的框內（跟動物園的動物一樣），魚頭朝左。
// 參考屏東國立海洋生物博物館的常設展：台灣水域館、珊瑚王國館、世界水域館。
import { ANIMALS } from './animals.js';

const eye = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d2433"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 10) => `<path d="M${x - w / 2} ${y}Q${x} ${y + w * 0.6} ${x + w / 2} ${y}" stroke="#1d2433" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const blush = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9fb0" opacity=".6"/>`;

// 一般的魚：身體顏色、肚子、花紋（額外 svg）、尾巴顏色
function fish({ body, belly = '#fff', fin, pattern = '', w = 140, h = 70, cx = 100, cy = 110 }) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  return `<g class="sw">
    <path d="M${x1 - 8} ${cy}L${x1 + 34} ${cy - h * 0.45}Q${x1 + 22} ${cy} ${x1 + 34} ${cy + h * 0.45}Z" fill="${fin}"/>
    <path d="M${cx - 6} ${cy - h / 2 + 4}Q${cx + 20} ${cy - h / 2 - 24} ${cx + 40} ${cy - h / 2 + 6}Z" fill="${fin}"/>
    <path d="M${x0} ${cy}Q${x0 + 10} ${cy - h / 2} ${cx} ${cy - h / 2}Q${x1} ${cy - h / 2} ${x1} ${cy}Q${x1} ${cy + h / 2} ${cx} ${cy + h / 2}Q${x0 + 10} ${cy + h / 2} ${x0} ${cy}Z" fill="${body}"/>
    <path d="M${x0 + 14} ${cy + 8}Q${cx} ${cy + h / 2 + 2} ${x1 - 14} ${cy + 8}Q${cx} ${cy + h / 2 - 8} ${x0 + 14} ${cy + 8}Z" fill="${belly}" opacity=".85"/>
    ${pattern}
    <path d="M${cx - 4} ${cy + 10}q16 6 18 22q-14 -2 -18 -22Z" fill="${fin}" opacity=".9"/>
    ${eye(x0 + 26, cy - 8, 8)}${smile(x0 + 12, cy + 10, 10)}
  </g>`;
}

// ---------- 台灣水域館 ----------
// 櫻花鉤吻鮭：背是橄欖綠、身上有一排深色橢圓斑（台灣國寶魚）
const salmon = () => fish({
  body: '#8fa86a', belly: '#f4e9d8', fin: '#6f8a4f',
  pattern: `${[62, 86, 110, 134].map((x, i) => `<ellipse cx="${x}" cy="${108 + (i % 2) * 2}" rx="7" ry="12" fill="#4f6a3a" opacity=".75"/>`).join('')}
    <path d="M44 118Q100 132 156 118" stroke="#ff9fb8" stroke-width="6" fill="none" opacity=".75" stroke-linecap="round"/>
    ${[[70, 92], [96, 90], [124, 94], [146, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#3f5a2e"/>`).join('')}`,
});
// 招潮蟹：男生有一隻大大的橘色螯
function fiddler() {
  return `<g class="crab">
    ${[0, 1, 2].map((i) => `<path d="M${70 - i * 12} ${150 + i * 6}l-22 ${18 - i * 4}M${130 + i * 12} ${150 + i * 6}l22 ${18 - i * 4}" stroke="#4a6a8a" stroke-width="7" stroke-linecap="round"/>`).join('')}
    <ellipse cx="100" cy="148" rx="46" ry="28" fill="#5a7fa8"/><ellipse cx="100" cy="142" rx="34" ry="16" fill="#7aa0c8"/>
    <path d="M86 122V100M114 122V100" stroke="#5a7fa8" stroke-width="6"/>${eye(86, 96, 7)}${eye(114, 96, 7)}
    <g class="bigclaw"><path d="M140 140Q164 128 166 108" stroke="#f08a2a" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M150 112Q160 64 196 76Q202 100 182 106Q196 118 186 128Q160 132 150 112Z" fill="#ff9a3c" stroke="#e0761a" stroke-width="4"/></g>
    <path d="M62 140Q48 130 50 118" stroke="#f0c070" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="50" cy="114" r="7" fill="#f6d088"/>
    ${smile(100, 156, 12)}
  </g>`;
}
// 彈塗魚：大眼睛長在頭頂上，會用胸鰭在泥巴上爬
function mudskipper() {
  return `<g>
    <path d="M150 150Q186 132 192 150Q186 168 150 160Z" fill="#7a6a4a"/>
    <path d="M30 160Q34 122 90 120Q150 122 156 156Q150 176 90 176Q34 176 30 160Z" fill="#9a8a62"/>
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${54 + i * 9}" cy="${146 + (i % 3) * 6}" r="2.6" fill="#5fa8e8"/>`).join('')}
    <path d="M80 122Q100 88 128 122" fill="#9a8a62"/><path d="M84 120Q102 94 124 120" stroke="#e8c050" stroke-width="3" fill="none"/>
    <circle cx="52" cy="122" r="14" fill="#9a8a62"/><circle cx="72" cy="116" r="14" fill="#9a8a62"/>${eye(52, 118, 9)}${eye(72, 112, 9)}
    <path d="M70 168Q60 186 82 184" stroke="#7a6a4a" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${smile(40, 156, 12)}
  </g>`;
}
// 海星
function seastar(c = '#ff8a5c', c2 = '#ffb48c') {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    const r = i % 2 ? 30 : 78;
    return `${(100 + Math.cos(a) * r).toFixed(1)} ${(122 + Math.sin(a) * r).toFixed(1)}`;
  });
  return `<g><path d="M${pts.join('L')}Z" fill="${c}" stroke="${c2}" stroke-width="10" stroke-linejoin="round"/>
    ${Array.from({ length: 5 }, (_, i) => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; return [1, 2, 3].map((k) => `<circle cx="${(100 + Math.cos(a) * k * 18).toFixed(1)}" cy="${(122 + Math.sin(a) * k * 18).toFixed(1)}" r="3.5" fill="${c2}"/>`).join(''); }).join('')}
    ${eye(88, 116, 6)}${eye(112, 116, 6)}${smile(100, 130, 10)}</g>`;
}
// 海參：軟軟長長、身上有小肉刺
function seacuke() {
  return `<g><path d="M24 150Q20 120 60 118H150Q186 120 182 150Q178 176 150 176H56Q26 176 24 150Z" fill="#8a5a4a"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${40 + i * 12}" cy="${128 + (i % 2) * 8}" r="5" fill="#a87a62"/>`).join('')}
    <path d="M24 150Q12 144 14 132M24 156Q10 162 14 172" stroke="#f0d0b0" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${eye(44, 146, 6)}${eye(62, 146, 6)}${smile(54, 160, 10)}</g>`;
}
// 海膽：圓圓的、很多刺
function urchin() {
  return `<g>${Array.from({ length: 24 }, (_, i) => { const a = (Math.PI * 2 * i) / 24; return `<path d="M${100 + Math.cos(a) * 36} ${136 + Math.sin(a) * 30}L${100 + Math.cos(a) * 70} ${136 + Math.sin(a) * 58}" stroke="#4a3a6a" stroke-width="5" stroke-linecap="round"/>`; }).join('')}
    <ellipse cx="100" cy="140" rx="46" ry="38" fill="#6a4f8a"/><ellipse cx="88" cy="126" rx="14" ry="8" fill="#8a70aa"/>
    ${eye(88, 140, 6)}${eye(112, 140, 6)}${smile(100, 154, 10)}</g>`;
}
// 海兔：軟軟的，頭上有兩隻像兔子耳朵的觸角
function seahare() {
  return `<g><path d="M30 166Q34 116 96 112Q160 112 176 160Q150 176 100 176Q46 176 30 166Z" fill="#8a7a5a"/>
    ${[[60, 140], [90, 130], [120, 136], [146, 150], [100, 156], [70, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#c8b68a" opacity=".8"/>`).join('')}
    <path d="M56 122Q46 84 62 82Q72 96 68 122M80 116Q80 78 96 80Q100 96 90 118" fill="#8a7a5a" stroke="#6a5a3a" stroke-width="3"/>
    ${eye(52, 140, 6)}${eye(70, 136, 6)}${blush(44, 154)}${smile(60, 154, 10)}</g>`;
}
// 岩岸的螃蟹（紅色）
function crab() {
  return `<g class="crab">
    ${[0, 1, 2].map((i) => `<path d="M${70 - i * 12} ${150 + i * 6}l-24 ${16 - i * 4}M${130 + i * 12} ${150 + i * 6}l24 ${16 - i * 4}" stroke="#b8402a" stroke-width="7" stroke-linecap="round"/>`).join('')}
    <ellipse cx="100" cy="146" rx="50" ry="32" fill="#e0573a"/><ellipse cx="100" cy="138" rx="36" ry="16" fill="#f07a5a"/>
    <path d="M86 118V100M114 118V100" stroke="#e0573a" stroke-width="6"/>${eye(86, 96, 7)}${eye(114, 96, 7)}
    <path d="M56 136Q34 120 40 100M144 136Q166 120 160 100" stroke="#e0573a" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M28 98Q34 74 52 86Q48 100 40 102Z" fill="#e0573a"/><path d="M172 98Q166 74 148 86Q152 100 160 102Z" fill="#e0573a"/>
    ${smile(100, 152, 12)}</g>`;
}
// 鯊魚（大洋池）
function shark() {
  return `<g class="sw">
    <path d="M160 108L198 70Q188 112 198 150Z" fill="#6a8aa8"/>
    <path d="M92 76L110 30L126 80Z" fill="#6a8aa8"/>
    <path d="M6 112Q30 74 100 74Q160 76 172 110Q160 146 100 148Q30 148 6 112Z" fill="#88a6c0"/>
    <path d="M12 116Q60 150 168 116Q120 140 60 138Q24 132 12 116Z" fill="#eef4f8"/>
    <path d="M86 132Q100 156 120 160Q112 140 104 130Z" fill="#6a8aa8"/>
    ${[0, 1, 2].map((i) => `<path d="M${64 + i * 8} 98v18" stroke="#6a86a0" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${eye(36, 104, 7)}<path d="M14 122Q26 128 40 124" stroke="#4a6a86" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;
}
// 魟魚：扁扁的像風箏，尾巴長長
function ray() {
  return `<g class="sw"><path d="M100 70Q150 90 196 118Q150 132 100 160Q50 132 4 118Q50 90 100 70Z" fill="#8a7a6a"/>
    <path d="M100 150Q104 176 140 192" stroke="#7a6a5a" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${[[70, 110], [130, 110], [100, 130], [86, 96], [114, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#6a5a4a"/>`).join('')}
    ${eye(88, 104, 6)}${eye(112, 104, 6)}${smile(100, 118, 10)}</g>`;
}
// 鯧魚群（大洋池裡的柱狀缸）：銀色菱形的魚一大群
function pomfret() {
  const one = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0L0 -22L28 0L0 22Z" fill="#c8d4de"/><path d="M26 0L40 -12V12Z" fill="#a8b8c8"/>${eye(-14, -4, 4)}</g>`;
  return `<g class="sw">${[[60, 80, 1], [120, 70, 0.9], [90, 120, 1.1], [150, 118, 0.85], [40, 140, 0.8], [120, 160, 0.95], [170, 160, 0.7]].map(([x, y, s]) => one(x, y, s)).join('')}</g>`;
}

// ---------- 珊瑚王國館 ----------
const clownfish = () => fish({
  body: '#ff8a2a', belly: '#ffb46a', fin: '#ff8a2a', w: 120, h: 70,
  pattern: `${[[80, 11], [108, 10], [134, 7]].map(([x, w]) => `<path d="M${x} 80Q${x + 9} 110 ${x} 140" stroke="#1d2433" stroke-width="${w + 6}" fill="none" stroke-linecap="round"/><path d="M${x} 80Q${x + 9} 110 ${x} 140" stroke="#fff" stroke-width="${w}" fill="none" stroke-linecap="round"/>`).join('')}`,
});
const butterfly = () => fish({
  body: '#ffd34d', belly: '#fff3a8', fin: '#ffc020', w: 110, h: 100,
  pattern: '<path d="M64 64Q74 110 62 156" stroke="#1d2433" stroke-width="10" fill="none"/><circle cx="132" cy="104" r="9" fill="#1d2433"/><circle cx="132" cy="104" r="12" fill="none" stroke="#fff" stroke-width="3"/>',
});
// 海龜
function turtle() {
  return `<g class="sw"><path d="M60 92Q34 60 8 70Q20 96 52 108Z" fill="#7cbf8a"/><path d="M150 92Q172 64 194 74Q186 98 158 106Z" fill="#7cbf8a"/>
    <path d="M64 148Q40 170 22 168Q32 150 58 136Z" fill="#7cbf8a"/><path d="M146 148Q166 168 182 166Q174 148 150 136Z" fill="#7cbf8a"/>
    <ellipse cx="104" cy="118" rx="64" ry="46" fill="#5a8a4a"/>
    ${[[84, 104], [120, 104], [102, 128], [70, 128], [136, 128]].map(([x, y]) => `<path d="M${x - 14} ${y}L${x - 7} ${y - 12}H${x + 7}L${x + 14} ${y}L${x + 7} ${y + 12}H${x - 7}Z" fill="#7aa85a" stroke="#4a7a3a" stroke-width="3"/>`).join('')}
    <ellipse cx="34" cy="122" rx="24" ry="20" fill="#8ad09a"/>${eye(26, 116, 6)}${smile(22, 128, 8)}</g>`;
}
// 白鯨（真的白鯨，沒戴帽子）：白白胖胖、額頭圓圓
function beluga() {
  return `<g class="sw"><path d="M170 112Q192 90 198 100Q196 116 182 120Q196 128 196 142Q186 148 166 128Z" fill="#dde9f1"/>
    <path d="M8 118Q8 70 64 70Q136 68 174 112Q150 150 80 152Q12 154 8 118Z" fill="#f4f9fc" stroke="#c6d6e2" stroke-width="4"/>
    <path d="M14 104Q20 74 54 74Q46 90 30 104Z" fill="#fff"/>
    <path d="M78 138Q86 164 108 168Q102 148 96 136Z" fill="#dde9f1"/>
    ${eye(38, 108, 6)}${blush(30, 124)}<path d="M12 126Q24 136 40 130" stroke="#9ab0c0" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
}
// 花園鰻：從沙子裡探出頭，細細長長
function gardeneel(c = '#f4ead0', dot = '#2a2a2a') {
  return `<g class="eel"><path d="M100 196Q86 150 100 110Q110 80 92 56" stroke="${c}" stroke-width="22" fill="none" stroke-linecap="round"/>
    ${[170, 146, 122, 98].map((y, i) => `<circle cx="${96 + (i % 2) * 6}" cy="${y}" r="3" fill="${dot}"/>`).join('')}
    ${eye(86, 52, 5)}<ellipse cx="100" cy="198" rx="30" ry="6" fill="#d8c08e"/></g>`;
}

// ---------- 世界水域館 ----------
// 三葉蟲（古代海洋）
function trilobite() {
  return `<g><ellipse cx="100" cy="122" rx="56" ry="70" fill="#9a8a72"/><path d="M100 54V190" stroke="#7a6a52" stroke-width="18"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M48 ${80 + i * 13}Q100 ${70 + i * 13} 152 ${80 + i * 13}" stroke="#7a6a52" stroke-width="4" fill="none"/>`).join('')}
    <path d="M44 74Q100 30 156 74Q100 64 44 74Z" fill="#b8a88a"/>${eye(80, 66, 5)}${eye(120, 66, 5)}</g>`;
}
// 鸚鵡螺
function nautilus() {
  return `<g class="sw"><path d="M60 120Q60 60 120 60Q180 60 180 120Q180 170 128 172Q84 172 84 128Q84 96 116 96Q140 96 140 120" fill="#fff4e6" stroke="#e8c8a0" stroke-width="6"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${90 + i * 20} 64Q${100 + i * 20} 110 ${84 + i * 18} 166" stroke="#d9734a" stroke-width="7" fill="none" opacity=".75"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<path d="M62 ${116 + i * 6}Q36 ${110 + i * 10} 18 ${120 + i * 9}" stroke="#f0c0a0" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
    ${eye(64, 104, 6)}</g>`;
}
// 石斑魚（海藻森林）
const grouper = () => fish({
  body: '#a8784a', belly: '#e8c8a0', fin: '#8a5a32', w: 150, h: 80,
  pattern: `${Array.from({ length: 14 }, (_, i) => `<circle cx="${50 + (i % 7) * 18}" cy="${96 + Math.floor(i / 7) * 22}" r="5" fill="#6a4a2a" opacity=".6"/>`).join('')}`,
});
// 發光的魚（深海）：頭上有一盞小燈
function lantern() {
  return `<g class="sw"><path d="M52 92Q40 40 20 42" stroke="#5a6a8a" stroke-width="4" fill="none"/><circle class="lamp" cx="18" cy="40" r="12" fill="#fff6a8"/><circle cx="18" cy="40" r="22" fill="#fff6a8" opacity=".3"/>
    ${fish({ body: '#3a4a6a', belly: '#5a6a8a', fin: '#2a3a5a', w: 130, h: 80 })}
    ${[60, 84, 108, 132].map((x) => `<circle cx="${x}" cy="138" r="4" fill="#9ff0ff"/>`).join('')}</g>`;
}
// 水母
function jelly(c = '#ffb3e6') {
  return `<g class="jelly"><path d="M40 100Q40 40 100 40Q160 40 160 100Q130 92 100 100Q70 92 40 100Z" fill="${c}" opacity=".85"/>
    <path d="M60 64Q100 46 140 64" stroke="#fff" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>
    ${[56, 78, 100, 122, 144].map((x, i) => `<path d="M${x} 100Q${x + (i % 2 ? 12 : -12)} 130 ${x} 160T${x} 196" stroke="${c}" stroke-width="5" fill="none" opacity=".8"/>`).join('')}
    ${eye(86, 82, 5)}${eye(114, 82, 5)}${smile(100, 90, 8)}</g>`;
}
// 大王具足蟲（深海）：像大大的鼠婦（西瓜蟲）
function isopod() {
  return `<g>${Array.from({ length: 7 }, (_, i) => `<path d="M${46 + i * 18} 166l-4 18M${46 + i * 18} 166l4 18" stroke="#b8a898" stroke-width="4"/>`).join('')}
    <ellipse cx="104" cy="140" rx="74" ry="34" fill="#d8ccc0"/>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${48 + i * 18} 108Q${54 + i * 18} 140 ${48 + i * 18} 172" stroke="#b8aa9a" stroke-width="5" fill="none"/>`).join('')}
    <path d="M30 126Q8 112 4 96M34 132Q10 132 2 124" stroke="#c8baa8" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${eye(36, 132, 5)}${eye(42, 146, 5)}</g>`;
}
// 甘氏巨螯蟹（深海）：腳很長很長
function spidercrab() {
  return `<g class="crab">${[[-1, 0], [-1, 1], [-1, 2], [1, 0], [1, 1], [1, 2]].map(([d, i]) => `<path d="M${100 + d * 20} ${130 + i * 8}Q${100 + d * (70 + i * 10)} ${80 - i * 10} ${100 + d * (96 - i * 4)} ${196}" stroke="#e8743a" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="100" cy="130" rx="34" ry="28" fill="#f08a4a"/>${[[88, 120], [112, 120], [100, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd0a8"/>`).join('')}
    ${eye(90, 108, 5)}${eye(110, 108, 5)}</g>`;
}
// 企鵝（四種）：國王企鵝用動物園那隻；阿德利（白眼圈）、頰帶（下巴一條黑線）、馬可羅尼（頭上黃色羽毛）
function smallPenguin(kind) {
  const head = '#1d2433';
  const face = kind === 'chinstrap'
    ? `<path d="M62 70Q100 50 138 70Q140 104 100 108Q60 104 62 70Z" fill="#fff"/><path d="M66 92Q100 108 134 92" stroke="#1d2433" stroke-width="4" fill="none"/>`
    : '';
  const ring = kind === 'adelie' ? '<circle cx="86" cy="72" r="10" fill="none" stroke="#fff" stroke-width="5"/><circle cx="114" cy="72" r="10" fill="none" stroke="#fff" stroke-width="5"/>' : '';
  const crest = kind === 'macaroni' ? '<path d="M70 58Q60 34 84 40Q78 48 92 54M130 58Q140 34 116 40Q122 48 108 54" stroke="#ffc400" stroke-width="7" fill="none" stroke-linecap="round"/>' : '';
  const beak = kind === 'macaroni' ? '#e0762a' : '#2a2a2a';
  return `<g class="pg"><ellipse cx="100" cy="194" rx="44" ry="7" fill="#000" opacity=".12"/>
    <path d="M100 40Q148 42 152 120Q154 186 100 190Q46 186 48 120Q52 42 100 40Z" fill="${head}"/>
    <path d="M100 96Q132 100 134 140Q132 182 100 184Q68 182 66 140Q68 100 100 96Z" fill="#fff"/>
    ${face}${ring}${crest}
    <path d="M52 110Q30 140 40 168Q56 150 60 124Z" fill="${head}"/><path d="M148 110Q170 140 160 168Q144 150 140 124Z" fill="${head}"/>
    ${eye(86, 72, 6)}${eye(114, 72, 6)}<path d="M92 84L100 98L108 84Z" fill="${beak}"/>
    <path d="M78 188l-12 8h24ZM122 188l12 8h-24Z" fill="#f0a868"/></g>`;
}
// 海豹：灰灰圓圓、大眼睛、有鬍鬚
function seal() {
  return `<g><path d="M152 150Q186 140 196 158Q180 166 160 166Z" fill="#8a9aa8"/>
    <path d="M30 120Q30 70 76 70Q120 70 160 140Q168 172 120 176H60Q24 176 30 120Z" fill="#a8b8c4"/>
    ${[[96, 120], [120, 140], [76, 150], [140, 160], [60, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#8a9aa8"/>`).join('')}
    <path d="M70 156Q60 182 84 184" stroke="#8a9aa8" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${eye(56, 98, 9)}${eye(84, 98, 9)}<ellipse cx="70" cy="114" rx="8" ry="6" fill="#3a3a4a"/>
    <path d="M60 120h-22M60 126h-20M80 120h22M80 126h20" stroke="#6a7a88" stroke-width="2"/>${blush(46, 116)}${blush(94, 116)}</g>`;
}
// 海鸚鵡：黑白身體、橘紅色的大嘴
function puffin() {
  return `<g><ellipse cx="100" cy="194" rx="36" ry="6" fill="#000" opacity=".12"/>
    <path d="M100 60Q140 62 142 124Q142 184 100 186Q58 184 58 124Q60 62 100 60Z" fill="#1d2433"/>
    <path d="M100 116Q128 120 128 150Q126 180 100 182Q74 180 72 150Q72 120 100 116Z" fill="#fff"/>
    <path d="M70 70Q100 56 130 70Q132 104 100 108Q68 104 70 70Z" fill="#f4f6fa"/>
    <path d="M100 82Q132 80 140 96Q132 112 100 104Z" fill="#ff6a2a"/><path d="M110 84Q114 96 110 104" stroke="#ffc400" stroke-width="4"/>
    ${eye(88, 82, 6)}<path d="M80 78l-8 -4" stroke="#e5484d" stroke-width="3"/>
    <path d="M84 184l-10 8h20ZM116 184l10 8h-20Z" fill="#ff6a2a"/></g>`;
}

export const CREATURES = {
  // 台灣水域館
  salmon: { name: '櫻花鉤吻鮭', en: 'Salmon', svg: salmon, size: 200, sound: 'bubble', hall: 'tw' },
  fiddler: { name: '招潮蟹', en: 'Crab', svg: fiddler, size: 150, sound: 'clack', hall: 'tw' },
  mudskipper: { name: '彈塗魚', en: 'Mudskipper', svg: mudskipper, size: 160, sound: 'boing', hall: 'tw' },
  seastar: { name: '海星', en: 'Starfish', svg: () => seastar(), size: 150, sound: 'sparkle', hall: 'tw' },
  seacuke: { name: '海參', en: 'Sea cucumber', svg: seacuke, size: 170, sound: 'bubble', hall: 'tw' },
  urchin: { name: '海膽', en: 'Sea urchin', svg: urchin, size: 150, sound: 'bubble', hall: 'tw' },
  seahare: { name: '海兔', en: 'Sea hare', svg: seahare, size: 160, sound: 'bubble', hall: 'tw' },
  crab: { name: '螃蟹', en: 'Crab', svg: crab, size: 150, sound: 'clack', hall: 'tw' },
  shark: { name: '鯊魚', en: 'Shark', svg: shark, size: 320, sound: 'whoosh', hall: 'tw' },
  ray: { name: '魟魚', en: 'Stingray', svg: ray, size: 240, sound: 'whoosh', hall: 'tw' },
  pomfret: { name: '鯧魚', en: 'Fish', svg: pomfret, size: 260, sound: 'bubble', hall: 'tw' },
  // 珊瑚王國館
  clownfish: { name: '小丑魚', en: 'Clownfish', svg: clownfish, size: 130, sound: 'bubble', hall: 'coral' },
  butterfly: { name: '蝴蝶魚', en: 'Butterflyfish', svg: butterfly, size: 140, sound: 'bubble', hall: 'coral' },
  turtle: { name: '海龜', en: 'Sea turtle', svg: turtle, size: 240, sound: 'bubble', hall: 'coral' },
  beluga: { name: '白鯨', en: 'Beluga', svg: beluga, size: 360, sound: 'whale', hall: 'coral' },
  gardeneel: { name: '花園鰻', en: 'Garden eel', svg: () => gardeneel(), size: 140, sound: 'pop', hall: 'coral' },
  // 世界水域館
  trilobite: { name: '三葉蟲', en: 'Trilobite', svg: trilobite, size: 160, sound: 'sparkle', hall: 'world' },
  nautilus: { name: '鸚鵡螺', en: 'Nautilus', svg: nautilus, size: 170, sound: 'bubble', hall: 'world' },
  grouper: { name: '石斑魚', en: 'Grouper', svg: grouper, size: 230, sound: 'bubble', hall: 'world' },
  urchin2: { name: '海膽', en: 'Sea urchin', svg: urchin, size: 120, sound: 'bubble', hall: 'world' },
  lantern: { name: '燈籠魚', en: 'Lanternfish', svg: lantern, size: 190, sound: 'sparkle', hall: 'world' },
  jelly: { name: '水母', en: 'Jellyfish', svg: () => jelly(), size: 170, sound: 'bubble', hall: 'world' },
  isopod: { name: '大王具足蟲', en: 'Giant isopod', svg: isopod, size: 190, sound: 'clack', hall: 'world' },
  spidercrab: { name: '甘氏巨螯蟹', en: 'Spider crab', svg: spidercrab, size: 230, sound: 'clack', hall: 'world' },
  king: { name: '國王企鵝', en: 'King penguin', svg: () => ANIMALS.penguin.svg(), size: 190, sound: 'penguin', hall: 'world' },
  adelie: { name: '阿德利企鵝', en: 'Adelie penguin', svg: () => smallPenguin('adelie'), size: 150, sound: 'penguin', hall: 'world' },
  chinstrap: { name: '頰帶企鵝', en: 'Chinstrap penguin', svg: () => smallPenguin('chinstrap'), size: 150, sound: 'penguin', hall: 'world' },
  macaroni: { name: '馬可羅尼企鵝', en: 'Macaroni penguin', svg: () => smallPenguin('macaroni'), size: 150, sound: 'penguin', hall: 'world' },
  seal: { name: '海豹', en: 'Seal', svg: seal, size: 220, sound: 'bark', hall: 'world' },
  puffin: { name: '海鸚鵡', en: 'Puffin', svg: puffin, size: 140, sound: 'squeak', hall: 'world' },
};

export function creatureSvg(id, size, { cls = '' } = {}) {
  const C = CREATURES[id];
  const w = size ?? C.size;
  return `<svg class="sc sc-${id} ${cls}" viewBox="0 0 200 200" width="${w}" height="${w}" overflow="visible">${C.svg()}</svg>`;
}
// 圖卡用（100x100，白底）
export const CREATURE_CARD = (id) => `<rect width="100" height="100" rx="16" fill="#eaf6ff"/><g transform="translate(6 2) scale(.44)">${CREATURES[id].svg()}</g>`;

// 海洋生物公仔（每館一個系列）：生物站在圓圓的底座上
const figure = (id, s = 0.5, dy = 0) => `<ellipse cx="50" cy="86" rx="36" ry="9" fill="#5fb8e0"/><ellipse cx="50" cy="83" rx="36" ry="9" fill="#9fdcf6"/><path d="M22 82q7 -4 14 0t14 0t14 0t14 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
  <g transform="translate(${50 - 100 * s} ${84 - 196 * s + dy}) scale(${s})">${CREATURES[id].svg()}</g>`;
export const FIGURES = {
  tw: ['salmon', 'shark', 'fiddler', 'seastar'],
  coral: ['beluga', 'clownfish', 'turtle', 'gardeneel'],
  world: ['king', 'seal', 'puffin', 'jelly'],
};
const FIG_FIT = { shark: [0.42, 18], beluga: [0.42, 22], ray: [0.42, 0], pomfret: [0.4, 10], salmon: [0.46, 22], clownfish: [0.5, 20], turtle: [0.44, 20], jelly: [0.42, 0], gardeneel: [0.42, -4] };
export const FIGURE_ITEMS = Object.fromEntries(Object.values(FIGURES).flat().map((id) => [`fig_${id}`, figure(id, ...(FIG_FIT[id] || [0.44, 0]))]));

// 歡樂島動物園的動物（原創 SVG）。每隻畫在 200x200 的框內，腳底在 y≈192，大多面向右邊。
// 會動的部位加 class：an-eye（眨眼）、an-tail（搖尾巴）、an-ear（動耳朵）、an-breath（呼吸）、an-head（點頭）。
// 動物園的分區參考臺北市立動物園：兒童動物區、臺灣動物區、熱帶雨林區、非洲動物區、沙漠動物區、澳洲動物區、企鵝館、大貓熊館。

const eye = (x, y, r = 6, c = '#1d2433') => `<g class="an-eye"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${Math.max(1.6, r * 0.32)}" fill="#fff"/></g>`;
const shadow = (cx = 100, rx = 70) => `<ellipse cx="${cx}" cy="194" rx="${rx}" ry="6" fill="#000" opacity=".13"/>`;
const blush = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9fb0" opacity=".5"/>`;

// ---------- 兒童動物區 ----------
function llama() {
  const fluff = (cx, cy, rx, ry, n, c) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `<circle cx="${(cx + Math.cos(a) * rx).toFixed(1)}" cy="${(cy + Math.sin(a) * ry).toFixed(1)}" r="9" fill="${c}"/>`;
  }).join('');
  return `${shadow(96, 60)}
    <g class="an-tail"><circle cx="40" cy="104" r="10" fill="#efe2c8"/><circle cx="34" cy="112" r="8" fill="#efe2c8"/></g>
    ${[[52, '#e2d2b2'], [66, '#efe2c8'], [118, '#e2d2b2'], [132, '#efe2c8']].map(([x, c]) => `<rect x="${x}" y="124" width="12" height="62" rx="5" fill="${c}"/><rect x="${x - 1}" y="180" width="14" height="10" rx="4" fill="#6a4a32"/>`).join('')}
    <g class="an-breath">${fluff(94, 112, 52, 26, 18, '#f6ecd8')}<ellipse cx="94" cy="112" rx="54" ry="30" fill="#f6ecd8"/>
      <path d="M58 104Q70 96 82 104M98 100Q110 92 122 100" stroke="#e2d2b2" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <path d="M130 108Q138 60 144 44H166Q160 80 152 116Z" fill="#f6ecd8"/>
    ${[56, 70, 84, 98].map((y) => `<path d="M${142 - (y - 56) * 0.1} ${y}h18" stroke="#e8dcc0" stroke-width="3" stroke-linecap="round"/>`).join('')}
    <g class="an-head">
      <g class="an-ear"><path d="M146 30Q138 8 146 2Q156 12 154 30Z" fill="#efe2c8"/><path d="M148 26Q144 12 147 8Q152 16 152 26Z" fill="#c9a888"/></g>
      <path d="M160 30Q166 8 176 4Q180 18 168 32Z" fill="#efe2c8"/><path d="M164 28Q169 14 174 10Q175 20 168 30Z" fill="#c9a888"/>
      <ellipse cx="160" cy="44" rx="20" ry="17" fill="#f6ecd8"/>
      ${fluff(156, 30, 12, 6, 7, '#fbf4e4')}
      <path d="M168 44Q190 44 192 56Q190 68 172 64Z" fill="#efe2c8"/>
      <ellipse cx="186" cy="52" rx="2.5" ry="2" fill="#6a4a32"/><path d="M180 62Q186 64 190 60" stroke="#6a4a32" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${eye(164, 42, 5.5)}<path d="M158 36q6 -4 12 0" stroke="#3a2a22" stroke-width="2" fill="none"/>
      ${blush(170, 54, 5)}
    </g>`;
}
function pony() {
  return `${shadow(96, 66)}
    <g class="an-tail"><path d="M36 92Q8 100 14 150Q28 130 40 112Z" fill="#5a3a22"/><path d="M34 98Q18 112 20 138" stroke="#7a5236" stroke-width="3" fill="none"/></g>
    ${[50, 64, 120, 134].map((x, i) => `<rect x="${x}" y="118" width="13" height="64" rx="5" fill="${i % 2 ? '#a96a3e' : '#b5774a'}"/><rect x="${x - 1}" y="178" width="15" height="12" rx="3" fill="#3a2a22"/>`).join('')}
    <g class="an-breath"><ellipse cx="94" cy="110" rx="58" ry="32" fill="#b5774a"/><ellipse cx="80" cy="102" rx="30" ry="12" fill="#c98a5a" opacity=".6"/></g>
    <path d="M130 102Q136 66 146 50L170 60Q160 90 154 114Z" fill="#b5774a"/>
    <path d="M132 100Q130 70 142 48Q150 40 156 50Q144 70 146 100Z" fill="#5a3a22"/>
    <g class="an-head">
      <g class="an-ear"><path d="M152 40L150 22L162 34Z" fill="#a96a3e"/></g>
      <path d="M148 46Q160 34 172 40L196 70Q198 82 186 84Q170 80 158 66Z" fill="#b5774a"/>
      <path d="M170 46L188 72" stroke="#fff4e0" stroke-width="6" stroke-linecap="round"/>
      <path d="M146 40Q154 28 164 34Q156 40 152 52Z" fill="#5a3a22"/>
      <ellipse cx="190" cy="76" rx="3" ry="2.4" fill="#3a2a22"/><path d="M182 84Q188 86 194 82" stroke="#3a2a22" stroke-width="2" fill="none"/>
      ${eye(166, 54, 5)}${blush(176, 66, 5)}
    </g>`;
}
function rabbit() {
  return `${shadow(100, 46)}
    <g class="an-tail"><circle cx="58" cy="164" r="12" fill="#fff"/></g>
    <g class="an-breath"><ellipse cx="96" cy="152" rx="44" ry="38" fill="#fff" stroke="#ecd8dc" stroke-width="2"/></g>
    <ellipse cx="124" cy="184" rx="18" ry="8" fill="#fff" stroke="#ecd8dc" stroke-width="2"/><ellipse cx="80" cy="186" rx="16" ry="7" fill="#fff" stroke="#ecd8dc" stroke-width="2"/>
    <g class="an-head">
      <g class="an-ear"><ellipse cx="116" cy="62" rx="11" ry="34" fill="#fff" stroke="#ecd8dc" stroke-width="2" transform="rotate(-12 116 62)"/><ellipse cx="116" cy="64" rx="5" ry="24" fill="#ffb3c7" transform="rotate(-12 116 64)"/></g>
      <ellipse cx="138" cy="66" rx="11" ry="34" fill="#fff" stroke="#ecd8dc" stroke-width="2" transform="rotate(14 138 66)"/><ellipse cx="138" cy="68" rx="5" ry="24" fill="#ffb3c7" transform="rotate(14 138 68)"/>
      <circle cx="128" cy="114" r="30" fill="#fff" stroke="#ecd8dc" stroke-width="2"/>
      ${eye(140, 108, 5.5, '#c43a5a')}
      <path d="M152 120l5 -3l1 5Z" fill="#ff8fb0"/><path d="M156 122Q154 128 150 128M156 122Q158 128 162 128" stroke="#c98a9a" stroke-width="2" fill="none"/>
      <path d="M156 118h16M156 122l14 4" stroke="#d8c8cc" stroke-width="1.5"/>
      ${blush(140, 124, 6)}
    </g>`;
}

// ---------- 臺灣動物區 ----------
function bear() {
  return `${shadow(100, 64)}
    <g class="an-breath">
      <ellipse cx="100" cy="146" rx="58" ry="48" fill="#1f1f24"/>
      <!-- 胸前的白色 V 字：臺灣黑熊的招牌 -->
      <path d="M70 116Q100 152 130 116Q124 124 100 140Q76 124 70 116Z" fill="#fff6e0"/>
      <path d="M72 118Q100 146 128 118" stroke="#f0e2c0" stroke-width="2" fill="none"/>
    </g>
    <ellipse cx="68" cy="182" rx="22" ry="12" fill="#1f1f24"/><ellipse cx="132" cy="182" rx="22" ry="12" fill="#1f1f24"/>
    <ellipse cx="68" cy="184" rx="12" ry="6" fill="#4a3a32"/><ellipse cx="132" cy="184" rx="12" ry="6" fill="#4a3a32"/>
    <ellipse cx="54" cy="150" rx="14" ry="26" fill="#2a2a30" transform="rotate(14 54 150)"/><ellipse cx="146" cy="150" rx="14" ry="26" fill="#2a2a30" transform="rotate(-14 146 150)"/>
    <g class="an-head">
      <g class="an-ear"><circle cx="66" cy="44" r="16" fill="#1f1f24"/><circle cx="66" cy="44" r="7" fill="#3a3a44"/></g>
      <circle cx="134" cy="44" r="16" fill="#1f1f24"/><circle cx="134" cy="44" r="7" fill="#3a3a44"/>
      <ellipse cx="100" cy="74" rx="44" ry="38" fill="#1f1f24"/>
      <ellipse cx="100" cy="90" rx="22" ry="16" fill="#c9a87a"/>
      <ellipse cx="100" cy="82" rx="9" ry="6" fill="#111"/><path d="M100 88V96M92 98Q100 104 108 98" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eye(82, 68, 5.5, '#000')}${eye(118, 68, 5.5, '#000')}
      <circle cx="82" cy="68" r="7.5" fill="none" stroke="#3a3a44" stroke-width="2"/><circle cx="118" cy="68" r="7.5" fill="none" stroke="#3a3a44" stroke-width="2"/>
    </g>`;
}
function leopardcat() {
  const spots = [[64, 116], [80, 108], [96, 112], [112, 106], [72, 130], [90, 128], [108, 124], [124, 118], [58, 128], [118, 134]];
  return `${shadow(96, 62)}
    <g class="an-tail"><path d="M44 120Q14 118 10 150Q8 170 22 168Q24 148 30 138Q36 130 48 132Z" fill="#d9a55a"/>
      ${[[18, 152], [16, 162], [24, 140], [34, 132]].map(([x, y]) => `<path d="M${x - 6} ${y}h12" stroke="#4a3220" stroke-width="4" stroke-linecap="round"/>`).join('')}
      <circle cx="15" cy="166" r="5" fill="#2a1e14"/></g>
    ${[56, 70, 118, 132].map((x) => `<rect x="${x}" y="130" width="12" height="54" rx="5" fill="#d0984e"/><ellipse cx="${x + 6}" cy="186" rx="9" ry="5" fill="#f4e4c4"/>`).join('')}
    <g class="an-breath"><ellipse cx="94" cy="122" rx="54" ry="24" fill="#d9a55a"/><ellipse cx="96" cy="134" rx="40" ry="10" fill="#f4e4c4"/>
      ${spots.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.5" fill="#4a3220"/>`).join('')}</g>
    <g class="an-head">
      <g class="an-ear"><path d="M136 82L132 58L152 74Z" fill="#c98e48"/><circle cx="140" cy="72" r="3.5" fill="#fff"/><path d="M134 78L134 62L146 74Z" fill="#3a2a1a"/></g>
      <path d="M164 82L174 60L178 84Z" fill="#c98e48"/><path d="M168 80L174 66L175 82Z" fill="#3a2a1a"/>
      <ellipse cx="156" cy="100" rx="28" ry="24" fill="#d9a55a"/>
      <!-- 額頭兩條白線（石虎的特徵） -->
      <path d="M150 78Q152 88 152 96M160 78Q160 88 158 96" stroke="#fff6e0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M146 80Q146 90 148 98M166 80Q166 90 162 98" stroke="#4a3220" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="168" cy="112" rx="14" ry="10" fill="#fff6e0"/>
      <path d="M176 104l6 -2l-1 6Z" fill="#c4766a"/><path d="M180 110Q176 116 170 114" stroke="#4a3220" stroke-width="2" fill="none"/>
      <path d="M170 108h22M170 112l20 4M170 106l20 -6" stroke="#8a6a4a" stroke-width="1.2"/>
      ${eye(160, 96, 5.5, '#2a3a1a')}<path d="M154 92q6 -3 12 0" stroke="#fff6e0" stroke-width="2" fill="none"/>
      <path d="M152 104Q148 112 150 118" stroke="#4a3220" stroke-width="2" fill="none"/>
    </g>`;
}
function pangolin(ball = false) {
  const scales = (cx, cy, rx, ry, rows) => Array.from({ length: rows }, (_, r) => {
    const n = 5 + r;
    return Array.from({ length: n }, (_, i) => {
      const a = Math.PI + (i / (n - 1)) * Math.PI;
      const rr = 1 - r / (rows + 1);
      const x = cx + Math.cos(a) * rx * rr;
      const y = cy + Math.sin(a) * ry * rr;
      return `<path d="M${(x - 9).toFixed(1)} ${y.toFixed(1)}Q${x.toFixed(1)} ${(y - 12).toFixed(1)} ${(x + 9).toFixed(1)} ${y.toFixed(1)}Q${x.toFixed(1)} ${(y + 6).toFixed(1)} ${(x - 9).toFixed(1)} ${y.toFixed(1)}Z" fill="${(r + i) % 2 ? '#a87a4a' : '#b8895a'}" stroke="#7a5230" stroke-width="1.5"/>`;
    }).join('');
  }).join('');
  if (ball) {
    return `${shadow(100, 46)}<g class="an-breath"><circle cx="100" cy="150" r="42" fill="#9a6c3e"/>${Array.from({ length: 3 }, (_, r) => Array.from({ length: 8 + r * 2 }, (_, i) => {
      const a = (i / (8 + r * 2)) * Math.PI * 2 + r * 0.3;
      const rr = 40 - r * 13;
      const x = 100 + Math.cos(a) * rr;
      const y = 150 + Math.sin(a) * rr;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${9 - r * 2}" fill="${(i + r) % 2 ? '#a87a4a' : '#b8895a'}" stroke="#7a5230" stroke-width="1.5"/>`;
    }).join('')).join('')}</g><path d="M128 178Q146 172 140 158" stroke="#7a5230" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }
  return `${shadow(100, 72)}
    <g class="an-tail"><path d="M50 150Q14 154 10 182Q30 190 54 172Z" fill="#9a6c3e"/>${[[20, 176], [30, 166], [40, 160]].map(([x, y]) => `<path d="M${x - 7} ${y}Q${x} ${y - 9} ${x + 7} ${y}" fill="#b8895a" stroke="#7a5230" stroke-width="1.5"/>`).join('')}</g>
    <ellipse cx="70" cy="184" rx="10" ry="6" fill="#6a4a2a"/><ellipse cx="124" cy="184" rx="10" ry="6" fill="#6a4a2a"/>
    <g class="an-breath"><ellipse cx="96" cy="150" rx="54" ry="34" fill="#9a6c3e"/>${scales(96, 168, 54, 52, 3)}</g>
    <g class="an-head"><path d="M140 150Q160 140 188 160Q166 172 142 170Z" fill="#c9a07a"/>${eye(158, 154, 3.5)}<circle cx="188" cy="160" r="2.5" fill="#3a2a1a"/></g>`;
}
function macaque() {
  return `${shadow(100, 52)}
    <g class="an-tail"><path d="M62 172Q44 174 40 162" stroke="#7a6a56" stroke-width="8" fill="none" stroke-linecap="round"/></g>
    <g class="an-breath"><ellipse cx="96" cy="146" rx="40" ry="44" fill="#8a7a66"/><ellipse cx="98" cy="154" rx="24" ry="28" fill="#a8987e"/></g>
    <ellipse cx="74" cy="182" rx="20" ry="10" fill="#7a6a56"/><ellipse cx="122" cy="182" rx="20" ry="10" fill="#7a6a56"/>
    <path d="M70 130Q60 160 82 172" stroke="#7a6a56" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M124 130Q138 150 122 168" stroke="#7a6a56" stroke-width="14" fill="none" stroke-linecap="round"/>
    <g class="an-head">
      <circle cx="98" cy="74" r="38" fill="#8a7a66"/>
      <g class="an-ear"><circle cx="62" cy="76" r="10" fill="#e8a8a0"/></g><circle cx="134" cy="76" r="10" fill="#e8a8a0"/>
      <path d="M72 70Q72 50 98 50Q124 50 124 70Q130 96 98 104Q66 96 72 70Z" fill="#f0a8a0"/>
      ${eye(88, 70, 5)}${eye(108, 70, 5)}
      <path d="M80 62q8 -5 16 0M100 62q8 -5 16 0" stroke="#c9787a" stroke-width="2.5" fill="none"/>
      <ellipse cx="94" cy="84" rx="2" ry="1.5" fill="#8a4a4a"/><ellipse cx="102" cy="84" rx="2" ry="1.5" fill="#8a4a4a"/>
      <path d="M90 92Q98 98 106 92" stroke="#8a4a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>`;
}

// ---------- 熱帶雨林區 ----------
function elephant(calf = false) {
  const g = calf ? '#b4b8c2' : '#9aa0aa';
  const d = calf ? '#a0a5b0' : '#878d98';
  return `${shadow(96, 82)}
    <g class="an-tail"><path d="M16 96Q6 120 12 140" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 136l4 10l6 -8Z" fill="#555"/></g>
    ${[[34, d], [54, g], [118, d], [138, g]].map(([x, c]) => `<rect x="${x}" y="120" width="26" height="66" rx="10" fill="${c}"/>${[0, 1, 2].map((k) => `<ellipse cx="${x + 6 + k * 7}" cy="186" rx="3.5" ry="2.5" fill="#e8e2d8"/>`).join('')}`).join('')}
    <g class="an-breath"><ellipse cx="90" cy="104" rx="76" ry="52" fill="${g}"/>
      <path d="M30 86Q50 70 80 76M40 120Q70 128 110 122" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <g class="an-head">
      <ellipse cx="158" cy="78" rx="34" ry="36" fill="${g}"/>
      <!-- 亞洲象的耳朵比較小 -->
      <g class="an-ear"><path d="M138 52Q112 54 114 90Q120 116 142 108Q150 80 138 52Z" fill="${d}"/><path d="M134 62Q122 70 124 92" stroke="#e8b8c0" stroke-width="5" fill="none" opacity=".7"/></g>
      <g class="an-trunk"><path d="M180 92Q196 120 186 150Q182 166 192 172Q202 170 198 160" fill="none" stroke="${g}" stroke-width="20" stroke-linecap="round"/>
        ${[110, 124, 138, 152].map((y) => `<path d="M${180 + (y - 110) * 0.05} ${y}h14" stroke="${d}" stroke-width="2"/>`).join('')}</g>
      ${calf ? '' : '<path d="M174 104Q180 116 172 120" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round"/>'}
      ${eye(166, 70, 5)}<path d="M158 62q8 -4 14 2" stroke="${d}" stroke-width="2.5" fill="none"/>
      ${blush(170, 86, 6)}
      <path d="M150 42Q156 30 160 42" stroke="${d}" stroke-width="2" fill="none"/>
    </g>`;
}
function tapir(baby = false) {
  if (baby) {
    // 馬來貘寶寶：咖啡色、有白色條紋和斑點，像西瓜，長大才變成黑白兩色
    return `${shadow(100, 58)}
      ${[60, 74, 124, 138].map((x) => `<rect x="${x}" y="128" width="12" height="54" rx="5" fill="#6a4630"/><rect x="${x - 1}" y="178" width="14" height="8" rx="3" fill="#3a2a1a"/>`).join('')}
      <g class="an-breath"><ellipse cx="100" cy="124" rx="56" ry="30" fill="#7a5236"/>
        ${[[56, 108, 150, 104], [52, 122, 152, 120], [58, 136, 146, 134]].map(([a, b, c, d2]) => `<path d="M${a} ${b}Q100 ${b - 8} ${c} ${d2}" stroke="#fff6e0" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 8"/>`).join('')}
        ${[[70, 116], [92, 112], [118, 114], [80, 130], [108, 128], [132, 126]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff6e0"/>`).join('')}</g>
      <g class="an-head"><g class="an-ear"><ellipse cx="148" cy="94" rx="7" ry="11" fill="#6a4630"/></g>
        <path d="M144 104Q168 96 180 110Q192 116 192 126Q182 130 172 128Q154 132 144 122Z" fill="#7a5236"/>
        <path d="M150 110Q166 106 178 114" stroke="#fff6e0" stroke-width="3" fill="none" stroke-dasharray="8 5"/>
        ${eye(162, 112, 4)}${blush(170, 122, 4)}</g>`;
  }
  return `${shadow(100, 76)}
    ${[40, 56, 128, 144].map((x) => `<rect x="${x}" y="122" width="16" height="62" rx="6" fill="#22232a"/><rect x="${x - 1}" y="178" width="18" height="10" rx="4" fill="#111"/>`).join('')}
    <g class="an-breath"><ellipse cx="96" cy="112" rx="72" ry="42" fill="#22232a"/>
      <!-- 中間白色的「鞍」：馬來貘的招牌 -->
      <path d="M58 76Q96 66 128 76Q136 110 128 148Q96 156 60 148Q50 110 58 76Z" fill="#f4f2ec"/></g>
    <g class="an-head">
      <g class="an-ear"><ellipse cx="160" cy="70" rx="9" ry="14" fill="#22232a"/><ellipse cx="160" cy="62" rx="7" ry="5" fill="#fff"/></g>
      <path d="M150 80Q180 70 194 94Q200 108 196 120Q186 126 178 116Q164 112 150 110Z" fill="#22232a"/>
      ${eye(170, 90, 4.5, '#5a4a3a')}
      <path d="M190 116Q198 126 192 132" stroke="#22232a" stroke-width="8" fill="none" stroke-linecap="round"/>
    </g>`;
}
function orangutan(baby = false) {
  const o = '#c8652a';
  const d = '#a64e1e';
  const s = baby ? 0.6 : 1;
  return `<g transform="translate(${100 - 100 * s} ${baby ? 70 : 0}) scale(${s})">
    ${baby ? '' : '<path d="M118 0V40" stroke="#a87a4a" stroke-width="7"/>'}
    <g class="an-breath">
      <path d="M118 40Q130 40 132 60Q140 100 124 110" stroke="${o}" stroke-width="18" fill="none" stroke-linecap="round"/>
      <circle cx="118" cy="40" r="10" fill="${d}"/>
      <ellipse cx="100" cy="128" rx="40" ry="44" fill="${o}"/>
      ${[[70, 110], [76, 132], [86, 152], [122, 150], [130, 128]].map(([x, y]) => `<path d="M${x} ${y}q-8 6 -4 14" stroke="${d}" stroke-width="3" fill="none"/>`).join('')}
      <path d="M68 120Q40 150 58 184" stroke="${o}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <ellipse cx="80" cy="184" rx="16" ry="8" fill="${d}"/><ellipse cx="120" cy="184" rx="16" ry="8" fill="${d}"/>
      <path d="M84 160V182M116 160V182" stroke="${o}" stroke-width="18" stroke-linecap="round"/>
    </g>
    <g class="an-head">
      <ellipse cx="96" cy="78" rx="32" ry="30" fill="${o}"/>
      <path d="M72 70Q72 52 96 52Q120 52 120 70Q124 100 96 104Q68 100 72 70Z" fill="#8a5a46"/>
      ${eye(87, 72, 4.5)}${eye(105, 72, 4.5)}
      <ellipse cx="96" cy="90" rx="14" ry="8" fill="#a8786a"/><path d="M88 92Q96 98 104 92" stroke="#5a3a2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M70 58Q80 40 96 46Q112 40 122 58" stroke="${d}" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g></g>`;
}

// ---------- 非洲動物區 ----------
function giraffe(calf = false) {
  const patch = (x, y, s = 1) => `<path d="M${x} ${y}l${8 * s} -${4 * s}l${7 * s} ${5 * s}l-${2 * s} ${8 * s}l-${9 * s} ${2 * s}l-${5 * s} -${6 * s}Z" fill="#c8783a"/>`;
  return `${shadow(80, 46)}
    <g class="an-tail"><path d="M42 104Q34 130 38 146" stroke="#e0aa52" stroke-width="4" fill="none"/><path d="M34 142l4 12l5 -10Z" fill="#5a3a22"/></g>
    ${[46, 60, 100, 114].map((x) => `<rect x="${x}" y="120" width="11" height="64" rx="4" fill="#f2c062"/><rect x="${x - 1}" y="180" width="13" height="8" rx="3" fill="#5a3a22"/>`).join('')}
    <g class="an-breath"><ellipse cx="80" cy="112" rx="44" ry="24" fill="#f2c062"/>${[[50, 104], [66, 98], [84, 100], [100, 98], [58, 118], [76, 116], [94, 116], [110, 112]].map(([x, y]) => patch(x, y)).join('')}</g>
    <path d="M108 104L140 30L156 36L128 112Z" fill="#f2c062"/>
    ${[[124, 86], [132, 66], [140, 48], [118, 98]].map(([x, y]) => patch(x, y, 0.8)).join('')}
    <path d="M138 34L110 100" stroke="#a8622a" stroke-width="5" stroke-dasharray="4 4"/>
    <g class="an-head">
      <path d="M142 14L140 0M154 14L156 0" stroke="#e0aa52" stroke-width="5" stroke-linecap="round"/><circle cx="140" cy="0" r="4" fill="#5a3a22"/><circle cx="156" cy="0" r="4" fill="#5a3a22"/>
      <g class="an-ear"><ellipse cx="134" cy="22" rx="9" ry="5" fill="#f2c062" transform="rotate(-20 134 22)"/></g>
      <path d="M140 14Q170 10 184 26Q190 36 180 40Q160 40 144 34Z" fill="#f2c062"/>
      <ellipse cx="182" cy="32" rx="9" ry="7" fill="#e8b45a"/><ellipse cx="184" cy="30" rx="2" ry="1.5" fill="#5a3a22"/>
      ${eye(158, 22, 4.5)}<path d="M152 16q6 -3 12 0" stroke="#5a3a22" stroke-width="2" fill="none"/>
      ${blush(164, 30, 4)}
    </g>
    ${calf ? '' : ''}`;
}
function zebra() {
  const stripe = (d) => `<path d="${d}" stroke="#1d1d22" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return `${shadow(96, 66)}
    <g class="an-tail"><path d="M36 96Q24 116 28 140" stroke="#eee" stroke-width="5" fill="none"/><path d="M24 136l4 16l6 -14Z" fill="#1d1d22"/></g>
    ${[50, 64, 120, 134].map((x) => `<rect x="${x}" y="118" width="13" height="64" rx="5" fill="#fff"/>${[132, 146, 160].map((y) => `<path d="M${x} ${y}h13" stroke="#1d1d22" stroke-width="5"/>`).join('')}<rect x="${x - 1}" y="178" width="15" height="10" rx="3" fill="#1d1d22"/>`).join('')}
    <g class="an-breath"><ellipse cx="94" cy="108" rx="60" ry="32" fill="#fff" stroke="#e4e4ea" stroke-width="2"/>
      ${stripe('M56 82Q50 108 58 134')}${stripe('M74 78Q68 106 76 138')}${stripe('M92 78Q88 108 94 140')}${stripe('M110 78Q108 108 112 138')}${stripe('M128 84Q128 108 130 132')}
      ${stripe('M40 98Q46 104 44 116')}</g>
    <path d="M130 102Q136 64 146 50L170 60Q160 90 154 114Z" fill="#fff"/>
    ${[[136, 96, 156, 92], [138, 82, 160, 78], [142, 68, 164, 66]].map(([a, b, c, d]) => stripe(`M${a} ${b}L${c} ${d}`)).join('')}
    <path d="M132 100Q130 66 142 48Q150 40 156 50" stroke="#1d1d22" stroke-width="7" fill="none" stroke-dasharray="5 4"/>
    <g class="an-head">
      <g class="an-ear"><path d="M152 40L148 20L162 34Z" fill="#fff" stroke="#1d1d22" stroke-width="2"/></g>
      <path d="M148 46Q160 34 172 40L196 70Q198 82 186 84Q170 80 158 66Z" fill="#fff" stroke="#e4e4ea" stroke-width="2"/>
      ${stripe('M160 44L156 56')}${stripe('M170 48L164 60')}
      <path d="M180 66Q196 70 196 78Q192 86 182 84Z" fill="#1d1d22"/>
      ${eye(166, 54, 5)}
    </g>`;
}
function hippo() {
  const h = '#8a7a8e';
  return `${shadow(100, 80)}
    <g class="an-breath"><ellipse cx="92" cy="128" rx="78" ry="50" fill="${h}"/><ellipse cx="96" cy="150" rx="56" ry="20" fill="#a898a8"/></g>
    ${[36, 66, 116, 146].map((x) => `<rect x="${x}" y="150" width="24" height="36" rx="10" fill="${h}"/>`).join('')}
    <g class="an-tail"><path d="M14 120q-10 4 -8 14" stroke="${h}" stroke-width="6" fill="none" stroke-linecap="round"/></g>
    <g class="an-head">
      <g class="an-ear"><ellipse cx="146" cy="72" rx="7" ry="9" fill="${h}"/><ellipse cx="146" cy="73" rx="3" ry="5" fill="#e8a8b0"/></g>
      <ellipse cx="162" cy="96" rx="32" ry="30" fill="${h}"/>
      <ellipse cx="174" cy="122" rx="30" ry="22" fill="#9a8a9e"/>
      <ellipse cx="190" cy="110" rx="3.5" ry="3" fill="#4a3a4e"/><ellipse cx="180" cy="108" rx="3.5" ry="3" fill="#4a3a4e"/>
      ${eye(158, 86, 5)}<path d="M150 80q8 -5 16 0" stroke="#6a5a6e" stroke-width="3" fill="none"/>
      <circle cx="168" cy="122" r="8" fill="#e8a8b0" opacity=".7"/>
      <path d="M156 136Q178 146 198 130" stroke="#5a4a5e" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`;
}
function lion() {
  const mane = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `<circle cx="${(148 + Math.cos(a) * 30).toFixed(1)}" cy="${(70 + Math.sin(a) * 30).toFixed(1)}" r="16" fill="${i % 2 ? '#a8582a' : '#b8662a'}"/>`;
  }).join('');
  return `${shadow(96, 70)}
    <g class="an-tail"><path d="M36 128Q8 120 14 92" stroke="#e0a84a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="14" cy="88" rx="7" ry="10" fill="#8a4a1e"/></g>
    ${[48, 64, 118, 134].map((x) => `<rect x="${x}" y="124" width="16" height="60" rx="7" fill="#e0a84a"/><ellipse cx="${x + 8}" cy="186" rx="11" ry="6" fill="#e8b860"/>`).join('')}
    <g class="an-breath"><ellipse cx="92" cy="120" rx="60" ry="30" fill="#e0a84a"/><ellipse cx="96" cy="134" rx="40" ry="10" fill="#ecc070"/></g>
    <g class="an-head">
      ${mane}
      <g class="an-ear"><circle cx="132" cy="46" r="8" fill="#e0a84a"/></g><circle cx="166" cy="46" r="8" fill="#e0a84a"/>
      <circle cx="150" cy="72" r="26" fill="#e8b45a"/>
      <ellipse cx="156" cy="84" rx="14" ry="11" fill="#f6dca0"/>
      <path d="M150 76h12l-6 7Z" fill="#7a3a22"/><path d="M156 83V88M150 90Q156 94 162 90" stroke="#7a3a22" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${eye(142, 66, 4.5, '#5a3a1a')}${eye(162, 66, 4.5, '#5a3a1a')}
    </g>`;
}

// ---------- 沙漠動物區 ----------
function camel() {
  return `${shadow(96, 66)}
    <g class="an-tail"><path d="M30 104Q22 124 26 140" stroke="#c8a06a" stroke-width="4" fill="none"/><path d="M22 136l4 10l5 -9Z" fill="#8a6a3a"/></g>
    ${[44, 58, 116, 130].map((x) => `<path d="M${x + 6} 118V170" stroke="#d8b07a" stroke-width="12" stroke-linecap="round"/><ellipse cx="${x + 6}" cy="180" rx="10" ry="6" fill="#c8a06a"/><circle cx="${x + 6}" cy="150" r="7" fill="#c8a06a"/>`).join('')}
    <g class="an-breath"><ellipse cx="88" cy="110" rx="62" ry="28" fill="#d8b07a"/><path d="M58 92Q80 40 110 90Z" fill="#d8b07a"/><path d="M66 86Q82 56 100 84" stroke="#e8c48e" stroke-width="5" fill="none"/></g>
    <path d="M136 102Q150 70 150 54Q156 42 166 46L168 62Q160 70 156 110Z" fill="#d8b07a"/>
    <g class="an-head">
      <g class="an-ear"><ellipse cx="160" cy="40" rx="4" ry="7" fill="#c8a06a"/></g>
      <path d="M158 42Q176 38 190 50Q196 60 188 64Q174 64 162 60Z" fill="#d8b07a"/>
      <path d="M188 58Q192 64 186 66" stroke="#8a6a3a" stroke-width="2" fill="none"/>
      ${eye(170, 48, 4)}<path d="M164 44q6 -4 12 0" stroke="#5a3a22" stroke-width="2.5" fill="none"/>
      <path d="M166 50l-2 3M170 51v3M174 50l2 3" stroke="#5a3a22" stroke-width="1.2"/>
    </g>`;
}
function meerkat() {
  return `${shadow(100, 28)}
    <g class="an-tail"><path d="M108 178Q130 182 136 160" stroke="#b8905e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M136 160l2 -8" stroke="#3a2a1a" stroke-width="7" stroke-linecap="round"/></g>
    <g class="an-breath"><path d="M84 184Q78 120 90 92Q100 80 110 92Q122 120 116 184Z" fill="#c8a070"/>
      <path d="M92 110Q100 120 108 110M90 126Q100 136 110 126M90 142Q100 152 110 142" stroke="#a88050" stroke-width="2.5" fill="none"/>
      <ellipse cx="100" cy="150" rx="12" ry="26" fill="#e8d0a8"/></g>
    <path d="M90 112Q84 124 92 128M110 112Q116 124 108 128" stroke="#b8905e" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="90" cy="186" rx="9" ry="4" fill="#a88050"/><ellipse cx="110" cy="186" rx="9" ry="4" fill="#a88050"/>
    <g class="an-head">
      <ellipse cx="100" cy="74" rx="18" ry="20" fill="#c8a070"/>
      <g class="an-ear"><circle cx="84" cy="66" r="4" fill="#3a2a1a"/></g><circle cx="116" cy="66" r="4" fill="#3a2a1a"/>
      <ellipse cx="92" cy="72" rx="6" ry="5" fill="#3a2a1a"/><ellipse cx="108" cy="72" rx="6" ry="5" fill="#3a2a1a"/>
      ${eye(92, 72, 3.2)}${eye(108, 72, 3.2)}
      <path d="M94 82Q100 96 106 82Z" fill="#e8d0a8"/><circle cx="100" cy="92" r="2.5" fill="#3a2a1a"/>
    </g>`;
}

// ---------- 澳洲動物區 ----------
function kangaroo() {
  return `${shadow(96, 54)}
    <g class="an-tail"><path d="M70 160Q30 172 10 190" stroke="#b86e40" stroke-width="16" fill="none" stroke-linecap="round"/></g>
    <path d="M80 176Q60 190 112 190" stroke="#b86e40" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M118 178Q140 188 152 188" stroke="#a65e32" stroke-width="10" fill="none" stroke-linecap="round"/>
    <g class="an-breath"><path d="M74 176Q60 120 90 84Q112 66 122 90Q134 130 118 178Z" fill="#c07a4a"/>
      <path d="M96 120Q120 118 122 140Q120 164 98 162Z" fill="#e2b48a"/>
      <!-- 育兒袋裡的寶寶 -->
      <g class="an-joey"><path d="M98 136Q104 122 114 128Q120 136 112 140Z" fill="#c98a5a"/><circle cx="108" cy="130" r="1.8" fill="#1d2433"/><path d="M102 126l-2 -6l5 4Z" fill="#c98a5a"/></g>
      <path d="M96 138Q110 148 122 138" stroke="#c98a5a" stroke-width="3" fill="none"/></g>
    <path d="M110 100Q128 112 126 124" stroke="#b86e40" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g class="an-head">
      <g class="an-ear"><ellipse cx="110" cy="38" rx="6" ry="16" fill="#b86e40" transform="rotate(-10 110 38)"/><ellipse cx="110" cy="40" rx="2.5" ry="10" fill="#e8a8a0" transform="rotate(-10 110 40)"/></g>
      <ellipse cx="124" cy="40" rx="6" ry="16" fill="#b86e40" transform="rotate(12 124 40)"/>
      <path d="M104 64Q114 48 130 56Q150 64 152 74Q146 82 128 80Q110 80 104 64Z" fill="#c07a4a"/>
      <ellipse cx="150" cy="72" rx="3" ry="2.5" fill="#3a2a1a"/>
      ${eye(126, 62, 4.5)}${blush(134, 72, 4)}
    </g>`;
}
function koala(sleep = false) {
  return `<path d="M0 150Q100 130 200 160" stroke="#8a6a4a" stroke-width="14" fill="none" stroke-linecap="round"/>
    <g fill="#5aa86a">${[[30, 140], [160, 146], [180, 156]].map(([x, y]) => `<ellipse cx="${x}" cy="${y - 14}" rx="7" ry="16" transform="rotate(30 ${x} ${y})"/>`).join('')}</g>
    <g class="an-breath"><ellipse cx="96" cy="118" rx="40" ry="42" fill="#9aa0a8"/><ellipse cx="96" cy="128" rx="24" ry="26" fill="#d8dce2"/></g>
    <path d="M62 108Q50 128 64 146" stroke="#8a9098" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M130 108Q144 128 128 148" stroke="#8a9098" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M58 146l-4 6M64 148l-1 7M128 150l2 7M134 148l5 5" stroke="#3a3a3a" stroke-width="2.5" stroke-linecap="round"/>
    <g class="an-head">
      <g class="an-ear"><circle cx="56" cy="56" r="22" fill="#9aa0a8"/><circle cx="56" cy="56" r="13" fill="#f4f4f6"/></g>
      <circle cx="136" cy="56" r="22" fill="#9aa0a8"/><circle cx="136" cy="56" r="13" fill="#f4f4f6"/>
      <circle cx="96" cy="72" r="36" fill="#a8aeb6"/>
      <path d="M86 70Q96 60 106 70V88Q96 98 86 88Z" fill="#2a2a30"/><path d="M90 72Q94 68 98 72" stroke="#5a5a62" stroke-width="2" fill="none"/>
      ${sleep
        ? '<path d="M68 70Q74 76 80 70M112 70Q118 76 124 70" stroke="#2a2a30" stroke-width="3" fill="none" stroke-linecap="round"/>'
        : `${eye(74, 70, 4.5)}${eye(118, 70, 4.5)}`}
      ${blush(70, 84, 6)}${blush(122, 84, 6)}
    </g>`;
}

// ---------- 企鵝館 ----------
function kingpenguin(chick = false) {
  if (chick) {
    // 國王企鵝寶寶：全身咖啡色、毛茸茸，長大才換成黑白的羽毛
    return `${shadow(100, 34)}
      <g class="an-breath">${Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return `<circle cx="${(100 + Math.cos(a) * 30).toFixed(1)}" cy="${(134 + Math.sin(a) * 46).toFixed(1)}" r="10" fill="#8a6a50"/>`;
      }).join('')}<ellipse cx="100" cy="134" rx="32" ry="48" fill="#8a6a50"/><ellipse cx="100" cy="144" rx="18" ry="28" fill="#9a7a60"/></g>
      <ellipse cx="90" cy="186" rx="10" ry="5" fill="#3a3a3a"/><ellipse cx="110" cy="186" rx="10" ry="5" fill="#3a3a3a"/>
      <g class="an-head">${eye(92, 108, 4)}${eye(110, 108, 4)}<path d="M100 114l12 4l-12 4Z" fill="#2a2a2a"/>${blush(88, 122, 4)}${blush(114, 122, 4)}</g>`;
  }
  return `${shadow(100, 34)}
    <g class="an-breath"><path d="M100 30Q138 34 136 110Q136 176 100 186Q64 176 64 110Q62 34 100 30Z" fill="#1d2433"/>
      <path d="M100 76Q126 86 124 130Q122 172 100 180Q78 172 76 130Q74 86 100 76Z" fill="#fff"/>
      <path d="M86 80Q100 72 114 80Q114 100 100 104Q86 100 86 80Z" fill="#ffc94d"/>
      <path d="M84 96Q100 112 116 96" fill="none" stroke="#ffe08a" stroke-width="4" opacity=".7"/></g>
    <path d="M66 96Q48 130 62 156" stroke="#1d2433" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M134 96Q152 130 138 156" stroke="#1d2433" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="88" cy="188" rx="12" ry="5" fill="#2a2a2a"/><ellipse cx="112" cy="188" rx="12" ry="5" fill="#2a2a2a"/>
    <g class="an-head">
      <!-- 耳朵旁邊的橘色斑塊：國王企鵝的特徵 -->
      <path d="M78 58Q74 70 82 80Q88 72 86 60Z" fill="#ff9f1a"/><path d="M122 58Q126 70 118 80Q112 72 114 60Z" fill="#ff9f1a"/>
      ${eye(90, 50, 4)}${eye(110, 50, 4)}
      <path d="M100 56Q122 58 128 68Q118 68 100 64Z" fill="#2a2a2a"/><path d="M104 60Q116 60 122 66" stroke="#ff9f1a" stroke-width="3" fill="none"/>
    </g>`;
}

// ---------- 大貓熊館 ----------
function panda() {
  return `${shadow(100, 62)}
    <g class="an-breath"><ellipse cx="100" cy="146" rx="54" ry="46" fill="#fbfbf6"/>
      <path d="M54 118Q100 104 146 118Q150 130 146 138Q100 124 54 138Q50 130 54 118Z" fill="#1f1f24"/></g>
    <ellipse cx="66" cy="182" rx="22" ry="13" fill="#1f1f24"/><ellipse cx="134" cy="182" rx="22" ry="13" fill="#1f1f24"/>
    <ellipse cx="66" cy="184" rx="10" ry="6" fill="#3a3a42"/><ellipse cx="134" cy="184" rx="10" ry="6" fill="#3a3a42"/>
    <!-- 竹子 -->
    <g class="an-bamboo"><path d="M138 70L150 196" stroke="#6cbf4a" stroke-width="8" stroke-linecap="round"/><path d="M140 100h12M143 132h12M146 164h12" stroke="#4a9a34" stroke-width="3"/>
      <path d="M142 96Q164 84 172 92Q160 100 144 100Z" fill="#7cd05a"/><path d="M140 80Q120 66 116 74Q128 84 140 84Z" fill="#7cd05a"/></g>
    <path d="M58 132Q60 160 80 162" stroke="#1f1f24" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M142 132Q150 116 146 104" stroke="#1f1f24" stroke-width="18" fill="none" stroke-linecap="round"/>
    <g class="an-head">
      <g class="an-ear"><circle cx="64" cy="40" r="16" fill="#1f1f24"/></g><circle cx="136" cy="40" r="16" fill="#1f1f24"/>
      <ellipse cx="100" cy="72" rx="46" ry="40" fill="#fbfbf6"/>
      <ellipse cx="80" cy="70" rx="12" ry="16" fill="#1f1f24" transform="rotate(30 80 70)"/><ellipse cx="120" cy="70" rx="12" ry="16" fill="#1f1f24" transform="rotate(-30 120 70)"/>
      ${eye(82, 68, 4.5, '#3a3a44')}${eye(118, 68, 4.5, '#3a3a44')}
      <ellipse cx="100" cy="86" rx="8" ry="5.5" fill="#1f1f24"/><path d="M100 91V96M92 98Q100 104 108 98" stroke="#1f1f24" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${blush(70, 88, 7)}${blush(130, 88, 7)}
    </g>`;
}

// 每隻動物：名字、英文、區、叫聲（sfx）、吃什麼、要畫多大（舞台上的寬度）、一句介紹（台詞代號 zf_<id>）
export const ANIMALS = {
  llama: { name: '草泥馬', en: 'Alpaca', area: 'kids', svg: llama, size: 210, sound: 'hum', food: 'hay' },
  pony: { name: '迷你馬', en: 'Pony', area: 'kids', svg: pony, size: 220, sound: 'neigh', food: 'carrot' },
  rabbit: { name: '兔子', en: 'Rabbit', area: 'kids', svg: rabbit, size: 160, sound: 'squeak', food: 'carrot' },
  bear: { name: '臺灣黑熊', en: 'Black bear', area: 'taiwan', svg: bear, size: 230, sound: 'growl', food: 'fruit' },
  leopardcat: { name: '石虎', en: 'Leopard cat', area: 'taiwan', svg: leopardcat, size: 190, sound: 'meow', food: 'meat' },
  pangolin: { name: '穿山甲', en: 'Pangolin', area: 'taiwan', svg: pangolin, size: 190, sound: 'sniff', food: 'ant' },
  macaque: { name: '臺灣獼猴', en: 'Macaque', area: 'taiwan', svg: macaque, size: 170, sound: 'monkey', food: 'fruit' },
  elephant: { name: '亞洲象', en: 'Elephant', area: 'rain', svg: elephant, size: 330, sound: 'trumpet', food: 'hay' },
  tapir: { name: '馬來貘', en: 'Tapir', area: 'rain', svg: tapir, size: 250, sound: 'squeak', food: 'fruit' },
  orangutan: { name: '紅毛猩猩', en: 'Orangutan', area: 'rain', svg: orangutan, size: 220, sound: 'monkey', food: 'fruit' },
  giraffe: { name: '長頸鹿', en: 'Giraffe', area: 'africa', svg: giraffe, size: 330, sound: 'hum', food: 'leaf' },
  zebra: { name: '斑馬', en: 'Zebra', area: 'africa', svg: zebra, size: 230, sound: 'neigh', food: 'hay' },
  hippo: { name: '河馬', en: 'Hippo', area: 'africa', svg: hippo, size: 280, sound: 'growl', food: 'hay' },
  lion: { name: '獅子', en: 'Lion', area: 'africa', svg: lion, size: 250, sound: 'roar', food: 'meat' },
  camel: { name: '駱駝', en: 'Camel', area: 'desert', svg: camel, size: 270, sound: 'hum', food: 'hay' },
  meerkat: { name: '狐獴', en: 'Meerkat', area: 'desert', svg: meerkat, size: 120, sound: 'squeak', food: 'bug' },
  kangaroo: { name: '袋鼠', en: 'Kangaroo', area: 'aus', svg: kangaroo, size: 240, sound: 'sniff', food: 'hay' },
  koala: { name: '無尾熊', en: 'Koala', area: 'aus', svg: koala, size: 210, sound: 'growl', food: 'gum' },
  penguin: { name: '國王企鵝', en: 'Penguin', area: 'penguin', svg: kingpenguin, size: 190, sound: 'penguin', food: 'fish' },
  panda: { name: '大貓熊', en: 'Panda', area: 'panda', svg: panda, size: 230, sound: 'growl', food: 'bamboo' },
};
// 動物寶寶（找媽媽）
export const BABIES = {
  tapir: () => tapir(true),
  elephant: () => elephant(true),
  penguin: () => kingpenguin(true),
  orangutan: () => orangutan(true),
};
export const PANGOLIN_BALL = () => pangolin(true);
export const KOALA_SLEEP = () => koala(true);

export function animalSvg(id, size, { baby = false, cls = '' } = {}) {
  const body = baby ? BABIES[id]() : ANIMALS[id].svg();
  const w = size ?? ANIMALS[id].size;
  return `<svg class="an an-${id}${baby ? ' baby' : ''} ${cls}" viewBox="0 0 200 200" width="${w}" height="${w}" overflow="visible">${body}</svg>`;
}
// 圖卡用（100x100）
export const animalCard = (id, { baby = false } = {}) => `<g transform="translate(0 4) scale(.5)">${baby ? BABIES[id]() : ANIMALS[id].svg()}</g>`;

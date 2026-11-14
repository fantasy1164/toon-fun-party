// 原創角色與小孩頭像（SVG）。角色畫在 240x320 的框內，腳底在 y=320。

const eye = (x, y, lid) => `
  <g class="eye"><circle cx="${x}" cy="${y}" r="12" fill="#1d2433"/><circle cx="${x + 4}" cy="${y - 4}" r="4" fill="#fff"/>
    <rect class="eyelid" x="${x - 14}" y="${y - 14}" width="28" height="28" rx="12" fill="${lid}"/>
    <path class="shut" d="M${x - 11} ${y}Q${x} ${y + 10} ${x + 11} ${y}" fill="none" stroke="#1d2433" stroke-width="4" stroke-linecap="round"/></g>`;
const eyes = (lx, rx, y, lid) => eye(lx, y, lid) + eye(rx, y, lid);

const zzz = `
  <g class="zzz" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path class="z z1" d="M196 60 h22 l-22 26 h22"/>
    <path class="z z2" d="M214 14 h16 l-16 20 h16"/>
  </g>`;

function dudu(extra = '') {
  return `
  <g class="char dudu">
    <ellipse cx="120" cy="312" rx="96" ry="10" fill="#000" opacity=".12"/>
    <ellipse cx="88" cy="306" rx="30" ry="12" fill="#f6a23c"/>
    <ellipse cx="152" cy="306" rx="30" ry="12" fill="#f6a23c"/>
    <g class="arm arm-l"><ellipse cx="30" cy="205" rx="20" ry="58" fill="#26334d" transform="rotate(16 30 205)"/></g>
    <g class="arm arm-r"><ellipse cx="210" cy="205" rx="20" ry="58" fill="#26334d" transform="rotate(-16 210 205)"/></g>
    <path d="M120 22C190 22 216 100 216 190C216 270 176 305 120 305C64 305 24 270 24 190C24 100 50 22 120 22Z" fill="#2f3e5c"/>
    <path d="M120 100C170 100 190 150 190 205C190 265 160 292 120 292C80 292 50 265 50 205C50 150 70 100 120 100Z" fill="#fff"/>
    <circle cx="88" cy="104" r="38" fill="#fff"/><circle cx="152" cy="104" r="38" fill="#fff"/>
    ${eyes(90, 150, 106, '#fff')}
    <circle cx="64" cy="132" r="11" fill="#ff9fb0" opacity=".75"/><circle cx="176" cy="132" r="11" fill="#ff9fb0" opacity=".75"/>
    <ellipse class="mouth" cx="120" cy="146" rx="14" ry="12" fill="#c9462c"/>
    <path d="M98 128Q120 116 142 128Q132 146 120 148Q108 146 98 128Z" fill="#f6a23c"/>
    <path d="M120 178L88 162V196Z" fill="#5fc3e8"/><path d="M120 178L152 162V196Z" fill="#5fc3e8"/>
    <circle cx="120" cy="178" r="9" fill="#3aa6d0"/>
    ${extra}
    ${zzz}
  </g>`;
}

function kiki(extra = '') {
  return `
  <g class="char kiki">
    <ellipse cx="120" cy="312" rx="92" ry="10" fill="#000" opacity=".12"/>
    <g class="tail">
      <path d="M160 268C236 262 256 176 214 134C226 192 196 222 158 232Z" fill="#f08a3c"/>
      <path d="M214 134C236 154 242 182 232 204C226 178 218 162 206 150Z" fill="#fff7ea"/>
    </g>
    <ellipse cx="94" cy="306" rx="26" ry="11" fill="#5a3a2a"/>
    <ellipse cx="146" cy="306" rx="26" ry="11" fill="#5a3a2a"/>
    <g class="arm arm-l"><ellipse cx="62" cy="228" rx="15" ry="42" fill="#f08a3c" transform="rotate(20 62 228)"/><circle cx="50" cy="262" r="13" fill="#5a3a2a"/></g>
    <g class="arm arm-r"><ellipse cx="178" cy="228" rx="15" ry="42" fill="#f08a3c" transform="rotate(-20 178 228)"/><circle cx="190" cy="262" r="13" fill="#5a3a2a"/></g>
    <ellipse cx="120" cy="240" rx="58" ry="68" fill="#f08a3c"/>
    <ellipse cx="120" cy="252" rx="36" ry="48" fill="#fff7ea"/>
    <path d="M46 74L36 4L100 40Z" fill="#f08a3c"/><path d="M52 60L47 24L82 44Z" fill="#5a3a2a"/>
    <path d="M194 74L204 4L140 40Z" fill="#f08a3c"/><path d="M188 60L193 24L158 44Z" fill="#5a3a2a"/>
    <ellipse cx="120" cy="106" rx="90" ry="72" fill="#f08a3c"/>
    <path d="M30 108C40 166 96 184 120 152C144 184 200 166 210 108C190 142 150 136 120 118C90 136 50 142 30 108Z" fill="#fff7ea"/>
    ${eyes(84, 156, 98, '#f08a3c')}
    <ellipse class="mouth" cx="120" cy="150" rx="13" ry="11" fill="#b8412f"/>
    <path d="M104 142Q120 156 136 142" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="120" cy="130" rx="11" ry="8" fill="#3a2a22"/>
    <path d="M70 176Q120 204 170 176L166 196Q120 222 74 196Z" fill="#3fb58a"/>
    <path d="M150 196L176 232L154 226L146 204Z" fill="#2f9a73"/>
    ${extra}
    ${zzz}
  </g>`;
}

// 小熊波波：貪吃、憨厚（原創造型）
function bobo(extra = '') {
  return `
  <g class="char bobo">
    <ellipse cx="120" cy="312" rx="96" ry="10" fill="#000" opacity=".12"/>
    <ellipse cx="86" cy="304" rx="32" ry="14" fill="#7a4a1e"/><ellipse cx="154" cy="304" rx="32" ry="14" fill="#7a4a1e"/>
    <g class="arm arm-l"><ellipse cx="40" cy="222" rx="24" ry="50" fill="#a0672e" transform="rotate(18 40 222)"/><circle cx="28" cy="264" r="18" fill="#8a5527"/></g>
    <g class="arm arm-r"><ellipse cx="200" cy="222" rx="24" ry="50" fill="#a0672e" transform="rotate(-18 200 222)"/><circle cx="212" cy="264" r="18" fill="#8a5527"/></g>
    <ellipse cx="120" cy="236" rx="86" ry="78" fill="#a0672e"/>
    <ellipse cx="120" cy="250" rx="56" ry="52" fill="#e8c08a"/>
    <circle cx="48" cy="48" r="30" fill="#a0672e"/><circle cx="48" cy="48" r="16" fill="#e8c08a"/>
    <circle cx="192" cy="48" r="30" fill="#a0672e"/><circle cx="192" cy="48" r="16" fill="#e8c08a"/>
    <ellipse cx="120" cy="112" rx="90" ry="78" fill="#a0672e"/>
    <ellipse cx="120" cy="144" rx="44" ry="33" fill="#e8c08a"/>
    ${eyes(86, 154, 102, '#a0672e')}
    <circle cx="58" cy="132" r="12" fill="#ff9fb0" opacity=".7"/><circle cx="182" cy="132" r="12" fill="#ff9fb0" opacity=".7"/>
    <ellipse cx="120" cy="128" rx="15" ry="11" fill="#3a2a22"/>
    <ellipse class="mouth" cx="120" cy="158" rx="12" ry="10" fill="#b8412f"/>
    <path d="M104 150Q120 164 136 150" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>
    <path d="M70 186Q120 206 170 186L160 228Q120 244 80 228Z" fill="#ffd34d"/>
    <path d="M112 200V222M106 204h12M128 200v22" stroke="#e0a800" stroke-width="4" stroke-linecap="round"/>
    ${extra}
    ${zzz}
  </g>`;
}

// 小羊棉棉：害羞、愛睡（原創造型）
const wool = (pts, r, fill = '#fff') => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('');
function mian(extra = '') {
  return `
  <g class="char mian">
    <ellipse cx="120" cy="312" rx="90" ry="10" fill="#000" opacity=".12"/>
    <rect x="80" y="262" width="22" height="50" rx="10" fill="#5a4a4a"/><rect x="138" y="262" width="22" height="50" rx="10" fill="#5a4a4a"/>
    <g class="arm arm-l"><ellipse cx="44" cy="226" rx="18" ry="40" fill="#f6d6c8" transform="rotate(20 44 226)"/></g>
    <g class="arm arm-r"><ellipse cx="196" cy="226" rx="18" ry="40" fill="#f6d6c8" transform="rotate(-20 196 226)"/></g>
    ${wool([[70, 200], [120, 186], [170, 200], [56, 244], [184, 244], [76, 280], [120, 290], [164, 280], [120, 240]], 40, '#eee')}
    ${wool([[70, 196], [120, 182], [170, 196], [58, 240], [182, 240], [78, 276], [120, 286], [162, 276], [120, 236]], 37)}
    <ellipse cx="40" cy="104" rx="34" ry="16" fill="#f6d6c8" transform="rotate(-24 40 104)"/>
    <ellipse cx="200" cy="104" rx="34" ry="16" fill="#f6d6c8" transform="rotate(24 200 104)"/>
    <ellipse cx="120" cy="118" rx="66" ry="60" fill="#f6d6c8"/>
    ${wool([[82, 64], [120, 52], [158, 64], [100, 48], [140, 48]], 24, '#eee')}
    ${wool([[82, 60], [120, 48], [158, 60], [100, 44], [140, 44]], 22)}
    ${eyes(94, 146, 116, '#f6d6c8')}
    <circle cx="74" cy="140" r="11" fill="#ff9fb0" opacity=".8"/><circle cx="166" cy="140" r="11" fill="#ff9fb0" opacity=".8"/>
    <ellipse cx="120" cy="140" rx="9" ry="6" fill="#c98a8a"/>
    <ellipse class="mouth" cx="120" cy="154" rx="10" ry="8" fill="#c9462c"/>
    <path d="M110 150Q120 158 130 150" fill="none" stroke="#7a4a4a" stroke-width="3" stroke-linecap="round"/>
    ${extra}
    ${zzz}
  </g>`;
}

// 貓頭鷹咕咕老師：博學、溫和（原創造型）
function gugu(extra = '') {
  const chev = [[100, 214], [140, 214], [120, 238], [100, 262], [140, 262], [120, 286]]
    .map(([x, y]) => `<path d="M${x - 9} ${y}Q${x} ${y + 9} ${x + 9} ${y}" fill="none" stroke="#c9a77a" stroke-width="4" stroke-linecap="round"/>`).join('');
  return `
  <g class="char gugu">
    <ellipse cx="120" cy="312" rx="92" ry="10" fill="#000" opacity=".12"/>
    <path d="M88 296l-10 16M96 298v16M104 296l10 16M136 296l-10 16M144 298v16M152 296l10 16" stroke="#f0a43c" stroke-width="7" stroke-linecap="round"/>
    <g class="arm arm-l"><path d="M44 150Q4 210 30 282Q60 262 66 200Z" fill="#6e5236"/></g>
    <g class="arm arm-r"><path d="M196 150Q236 210 210 282Q180 262 174 200Z" fill="#6e5236"/></g>
    <path d="M120 40C196 40 212 120 210 200C208 270 176 306 120 306C64 306 32 270 30 200C28 120 44 40 120 40Z" fill="#8a6a4a"/>
    <path d="M36 70L48 16L86 50Z" fill="#8a6a4a"/><path d="M204 70L192 16L154 50Z" fill="#8a6a4a"/>
    <ellipse cx="120" cy="246" rx="62" ry="58" fill="#f3e2c4"/>${chev}
    <circle cx="86" cy="112" r="40" fill="#f3e2c4"/><circle cx="154" cy="112" r="40" fill="#f3e2c4"/>
    ${eyes(88, 152, 112, '#f3e2c4')}
    <circle cx="88" cy="112" r="25" fill="none" stroke="#3a2a22" stroke-width="5"/><circle cx="152" cy="112" r="25" fill="none" stroke="#3a2a22" stroke-width="5"/>
    <path d="M113 110Q120 104 127 110" fill="none" stroke="#3a2a22" stroke-width="5"/>
    <circle cx="58" cy="146" r="10" fill="#ff9fb0" opacity=".7"/><circle cx="182" cy="146" r="10" fill="#ff9fb0" opacity=".7"/>
    <ellipse class="mouth" cx="120" cy="164" rx="9" ry="7" fill="#b8412f"/>
    <path d="M108 136H132L120 160Z" fill="#f0a43c"/>
    <g transform="translate(120 34) rotate(-8)"><path d="M-62 0L0 -24L62 0L0 24Z" fill="#2b2f3a"/><path d="M-30 6V24Q0 38 30 24V6" fill="#2b2f3a"/><path d="M40 4V42" stroke="#ffd34d" stroke-width="4"/><circle cx="40" cy="46" r="7" fill="#ffd34d"/></g>
    ${extra}
    ${zzz}
  </g>`;
}

// 聖誕老公公（原創造型）
function santa(extra = '') {
  return `
  <g class="char santa">
    <ellipse cx="120" cy="312" rx="100" ry="10" fill="#000" opacity=".12"/>
    <ellipse cx="88" cy="304" rx="32" ry="14" fill="#2b2320"/><ellipse cx="152" cy="304" rx="32" ry="14" fill="#2b2320"/>
    <g class="arm arm-l"><ellipse cx="34" cy="214" rx="24" ry="54" fill="#d93a3a" transform="rotate(18 34 214)"/><circle cx="22" cy="262" r="20" fill="#3a8f4f"/></g>
    <g class="arm arm-r"><ellipse cx="206" cy="214" rx="24" ry="54" fill="#d93a3a" transform="rotate(-18 206 214)"/><circle cx="218" cy="262" r="20" fill="#3a8f4f"/></g>
    <ellipse cx="120" cy="230" rx="92" ry="82" fill="#d93a3a"/>
    <rect x="108" y="160" width="24" height="146" fill="#fff"/>
    <rect x="30" y="234" width="180" height="26" fill="#2b2320"/>
    <rect x="102" y="230" width="36" height="34" rx="4" fill="none" stroke="#ffd34d" stroke-width="7"/>
    <circle cx="120" cy="110" r="62" fill="#ffd9b8"/>
    <path d="M56 112Q46 196 120 220Q194 196 184 112Q160 152 120 150Q80 152 56 112Z" fill="#fff"/>
    ${eyes(98, 142, 102, '#ffd9b8')}
    <circle cx="98" cy="102" r="20" fill="none" stroke="#8a5a2b" stroke-width="4"/><circle cx="142" cy="102" r="20" fill="none" stroke="#8a5a2b" stroke-width="4"/>
    <path d="M118 102h4" stroke="#8a5a2b" stroke-width="4"/>
    <circle cx="70" cy="126" r="11" fill="#ff9fb0" opacity=".8"/><circle cx="170" cy="126" r="11" fill="#ff9fb0" opacity=".8"/>
    <ellipse class="mouth" cx="120" cy="156" rx="12" ry="10" fill="#c9462c"/>
    <ellipse cx="100" cy="140" rx="24" ry="12" fill="#fff"/><ellipse cx="140" cy="140" rx="24" ry="12" fill="#fff"/>
    <circle cx="120" cy="128" r="11" fill="#ff9f8a"/>
    <path d="M52 80Q58 16 128 12Q192 8 218 70L198 84Z" fill="#d93a3a"/>
    <rect x="48" y="72" width="146" height="28" rx="14" fill="#fff"/>
    <circle cx="218" cy="72" r="18" fill="#fff"/>
    ${extra}
    ${zzz}
  </g>`;
}

// 睡帽（平安夜用）

// 小河馬噗噗：穩重、很注意安全的司機（原創造型）
function pupu(extra = '') {
  return `
  <g class="char pupu">
    <ellipse cx="120" cy="312" rx="98" ry="10" fill="#000" opacity=".12"/>
    <ellipse cx="88" cy="304" rx="28" ry="12" fill="#7d6fb8"/><ellipse cx="152" cy="304" rx="28" ry="12" fill="#7d6fb8"/>
    <g class="arm arm-l"><ellipse cx="44" cy="220" rx="20" ry="44" fill="#9d8fd0" transform="rotate(20 44 220)"/></g>
    <g class="arm arm-r"><ellipse cx="196" cy="220" rx="20" ry="44" fill="#9d8fd0" transform="rotate(-20 196 220)"/></g>
    <ellipse cx="120" cy="232" rx="84" ry="78" fill="#9d8fd0"/>
    <ellipse cx="120" cy="246" rx="52" ry="54" fill="#c9bff0"/>
    <circle cx="62" cy="52" r="16" fill="#9d8fd0"/><circle cx="62" cy="52" r="8" fill="#e8a0b8"/>
    <circle cx="178" cy="52" r="16" fill="#9d8fd0"/><circle cx="178" cy="52" r="8" fill="#e8a0b8"/>
    <ellipse cx="120" cy="96" rx="76" ry="58" fill="#9d8fd0"/>
    ${eyes(92, 148, 86, '#9d8fd0')}
    <ellipse cx="120" cy="140" rx="70" ry="40" fill="#c9bff0"/>
    <ellipse cx="98" cy="126" rx="6" ry="8" fill="#6a5ca8"/><ellipse cx="142" cy="126" rx="6" ry="8" fill="#6a5ca8"/>
    <circle cx="64" cy="128" r="10" fill="#ff9fb0" opacity=".6"/><circle cx="176" cy="128" r="10" fill="#ff9fb0" opacity=".6"/>
    <ellipse class="mouth" cx="120" cy="156" rx="16" ry="9" fill="#b8412f"/>
    <path d="M100 150Q120 164 140 150" fill="none" stroke="#6a5ca8" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(120 44)"><path d="M-58 4Q-56 -34 0 -38Q56 -34 58 4Z" fill="#2f6fd6"/><path d="M-60 4H74Q76 16 60 16H-60Z" fill="#1f4fa8"/>
      <circle cx="0" cy="-16" r="11" fill="#ffd34d"/><path d="M-6 -16h12M0 -22v12" stroke="#2f6fd6" stroke-width="3"/></g>
    ${extra}
    ${zzz}
  </g>`;
}

// 小狗豆豆：勤勞的牧羊犬，照顧農場動物（原創造型）
function doudou(extra = '') {
  return `
  <g class="char doudou">
    <ellipse cx="120" cy="312" rx="88" ry="10" fill="#000" opacity=".12"/>
    <g class="tail"><path d="M168 258Q226 236 214 186Q206 216 166 236Z" fill="#c98b4f"/><path d="M214 186Q222 198 216 212Q210 200 206 196Z" fill="#fff4e2"/></g>
    <ellipse cx="92" cy="306" rx="24" ry="11" fill="#fff4e2"/><ellipse cx="148" cy="306" rx="24" ry="11" fill="#fff4e2"/>
    <g class="arm arm-l"><ellipse cx="64" cy="226" rx="15" ry="40" fill="#c98b4f" transform="rotate(18 64 226)"/><circle cx="54" cy="260" r="13" fill="#fff4e2"/></g>
    <g class="arm arm-r"><ellipse cx="176" cy="226" rx="15" ry="40" fill="#c98b4f" transform="rotate(-18 176 226)"/><circle cx="186" cy="260" r="13" fill="#fff4e2"/></g>
    <ellipse cx="120" cy="240" rx="58" ry="66" fill="#c98b4f"/>
    <ellipse cx="120" cy="252" rx="34" ry="46" fill="#fff4e2"/>
    <path d="M70 178Q120 200 170 178L176 196Q120 222 64 196Z" fill="#e5484d"/>
    <circle cx="120" cy="206" r="10" fill="#ffd34d"/>
    <path d="M36 66Q14 120 40 156Q60 140 64 92Z" fill="#8a5a2b"/>
    <path d="M204 66Q226 120 200 156Q180 140 176 92Z" fill="#8a5a2b"/>
    <ellipse cx="120" cy="104" rx="80" ry="70" fill="#c98b4f"/>
    <path d="M150 50Q186 60 190 104Q172 84 146 86Z" fill="#fff4e2"/>
    ${eyes(88, 152, 96, '#c98b4f')}
    <ellipse cx="120" cy="142" rx="44" ry="32" fill="#fff4e2"/>
    <ellipse cx="120" cy="124" rx="14" ry="10" fill="#3a2a22"/>
    <circle cx="70" cy="132" r="10" fill="#ff9fb0" opacity=".6"/><circle cx="170" cy="132" r="10" fill="#ff9fb0" opacity=".6"/>
    <ellipse class="mouth" cx="120" cy="152" rx="11" ry="9" fill="#b8412f"/>
    <path d="M104 144Q120 156 136 144" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>
    <path d="M114 158Q120 176 126 158Z" fill="#ff7f9a"/>
    ${extra}
    ${zzz}
  </g>`;
}

// 小猴子跳跳：愛爬愛盪鞦韆的運動高手（原創造型）
function tiaotiao(extra = '') {
  return `
  <g class="char tiaotiao">
    <ellipse cx="120" cy="312" rx="88" ry="10" fill="#000" opacity=".12"/>
    <g class="tail"><path d="M164 270Q236 268 226 206Q218 172 192 184Q210 190 210 212Q212 248 162 250Z" fill="#a0673a"/></g>
    <ellipse cx="94" cy="306" rx="24" ry="11" fill="#f3d2a8"/><ellipse cx="146" cy="306" rx="24" ry="11" fill="#f3d2a8"/>
    <g class="arm arm-l"><path d="M70 190Q24 230 40 280" stroke="#a0673a" stroke-width="24" fill="none" stroke-linecap="round"/><circle cx="40" cy="282" r="14" fill="#f3d2a8"/></g>
    <g class="arm arm-r"><path d="M170 190Q216 230 200 280" stroke="#a0673a" stroke-width="24" fill="none" stroke-linecap="round"/><circle cx="200" cy="282" r="14" fill="#f3d2a8"/></g>
    <ellipse cx="120" cy="240" rx="56" ry="66" fill="#a0673a"/>
    <ellipse cx="120" cy="250" rx="34" ry="44" fill="#f3d2a8"/>
    <circle cx="36" cy="110" r="30" fill="#a0673a"/><circle cx="36" cy="110" r="17" fill="#f3d2a8"/>
    <circle cx="204" cy="110" r="30" fill="#a0673a"/><circle cx="204" cy="110" r="17" fill="#f3d2a8"/>
    <ellipse cx="120" cy="104" rx="78" ry="74" fill="#a0673a"/>
    <path d="M120 74C96 46 52 62 60 104C66 148 96 172 120 172C144 172 174 148 180 104C188 62 144 46 120 74Z" fill="#f3d2a8"/>
    ${eyes(94, 146, 100, '#f3d2a8')}
    <ellipse cx="112" cy="128" rx="3.5" ry="4" fill="#5a3a22"/><ellipse cx="128" cy="128" rx="3.5" ry="4" fill="#5a3a22"/>
    <circle cx="74" cy="134" r="10" fill="#ff9fb0" opacity=".7"/><circle cx="166" cy="134" r="10" fill="#ff9fb0" opacity=".7"/>
    <ellipse class="mouth" cx="120" cy="150" rx="13" ry="10" fill="#b8412f"/>
    <path d="M100 142Q120 160 140 142" fill="none" stroke="#5a3a22" stroke-width="4" stroke-linecap="round"/>
    <path d="M46 62Q120 20 194 62" stroke="#3fb5e8" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M190 60l18 -4l-6 18Z" fill="#3fb5e8"/>
    ${extra}
    ${zzz}
  </g>`;
}

export const NIGHTCAP = {
  dudu: `<g class="cap"><path d="M64 60Q96 -14 176 44L180 60Q120 40 62 74Z" fill="#7a8cff"/><path d="M62 66Q120 44 182 62" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="182" cy="40" r="13" fill="#fff"/></g>`,
  kiki: `<g class="cap"><path d="M70 56Q100 -4 168 34L170 50Q120 36 70 66Z" fill="#7a8cff"/><path d="M70 60Q120 40 172 52" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="174" cy="32" r="12" fill="#fff"/></g>`,
};

const BUILDERS = { dudu, kiki, santa, bobo, mian, gugu, pupu, doudou, tiaotiao };

// 回傳可放進 <svg> 的角色群組，x、y 為左上角，s 為縮放。
export function characterSvg(id, { x = 0, y = 0, s = 1, extra = '' } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${BUILDERS[id](extra)}</g>`;
}

// 角色的代表色，用在特寫畫面。
export const CHAR_COLORS = {
  dudu: { skin: '#2f3e5c', limb: '#26334d', pad: '#42547a', lid: '#2f3e5c' },
  kiki: { skin: '#f08a3c', limb: '#f08a3c', pad: '#ffe3c4', lid: '#f08a3c' },
};

// ---------- 小孩頭像 ----------
const face = `
  <circle cx="100" cy="108" r="62" fill="#ffd9b8"/>
  <circle cx="78" cy="106" r="8" fill="#2b2320"/><circle cx="122" cy="106" r="8" fill="#2b2320"/>
  <circle cx="81" cy="103" r="2.6" fill="#fff"/><circle cx="125" cy="103" r="2.6" fill="#fff"/>
  <circle cx="64" cy="126" r="10" fill="#ff9fb0" opacity=".7"/><circle cx="136" cy="126" r="10" fill="#ff9fb0" opacity=".7"/>
  <path d="M82 130Q100 150 118 130" fill="#c9462c" stroke="#c9462c" stroke-width="3" stroke-linejoin="round"/>`;

function girl() {
  return `
    <circle cx="100" cy="100" r="96" fill="#ffc7dc"/>
    <circle cx="34" cy="96" r="26" fill="#4a2f24"/><circle cx="166" cy="96" r="26" fill="#4a2f24"/>
    <circle cx="48" cy="78" r="10" fill="#ff5c93"/><circle cx="152" cy="78" r="10" fill="#ff5c93"/>
    <circle cx="100" cy="96" r="70" fill="#4a2f24"/>
    ${face}
    <path d="M40 96C44 50 156 50 160 96C140 72 120 66 100 82C80 66 60 72 40 96Z" fill="#4a2f24"/>`;
}

function boy() {
  return `
    <circle cx="100" cy="100" r="96" fill="#bfe3ff"/>
    <circle cx="100" cy="94" r="68" fill="#2b2320"/>
    ${face}
    <path d="M38 100C36 44 164 44 162 100C150 78 130 70 112 72L104 84L98 72C76 70 52 78 38 100Z" fill="#2b2320"/>`;
}

export function avatarSvg(id, size = 200) {
  if (id === 'both') {
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="96" fill="#fff3b8"/>
      <g transform="translate(4 40) scale(.56)">${girl()}</g>
      <g transform="translate(84 40) scale(.56)">${boy()}</g></svg>`;
  }
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}">${id === 'yh' ? girl() : boy()}</svg>`;
}

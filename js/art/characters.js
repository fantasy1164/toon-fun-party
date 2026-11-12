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

function dudu() {
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
    ${zzz}
  </g>`;
}

function kiki() {
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
    ${zzz}
  </g>`;
}

const BUILDERS = { dudu, kiki };

// 回傳可放進 <svg> 的角色群組，x、y 為左上角，s 為縮放。
export function characterSvg(id, { x = 0, y = 0, s = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${BUILDERS[id]()}</g>`;
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

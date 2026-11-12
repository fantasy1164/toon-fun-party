// 虛擬收藏品：每位角色一個系列，每件畫在 100x100 的框內。
export const ITEMS = {
  // 嘟嘟的乾淨系列
  dudu_bubble: `<circle cx="50" cy="52" r="34" fill="#bfeeff" stroke="#6cc7ea" stroke-width="5"/><path d="M32 40a22 22 0 0 1 18-12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  dudu_brush: `<rect x="44" y="34" width="12" height="58" rx="6" fill="#ff7fa8"/><rect x="38" y="10" width="24" height="30" rx="6" fill="#fff" stroke="#9fd8ee" stroke-width="4"/><path d="M44 16v18M50 16v18M56 16v18" stroke="#9fd8ee" stroke-width="3"/>`,
  dudu_fish: `<path d="M12 50C28 24 60 24 74 50C60 76 28 76 12 50Z" fill="#6cc7ea"/><path d="M70 50L92 32V68Z" fill="#3aa6d0"/><circle cx="32" cy="46" r="5" fill="#1d2433"/>`,
  dudu_snow: `<g stroke="#6cc7ea" stroke-width="7" stroke-linecap="round"><path d="M50 12v76M17 31l66 38M17 69l66-38"/></g><circle cx="50" cy="50" r="9" fill="#fff" stroke="#6cc7ea" stroke-width="5"/>`,
  dudu_ice: `<path d="M22 34L52 20L82 34V70L52 86L22 70Z" fill="#d6f4ff" stroke="#6cc7ea" stroke-width="5" stroke-linejoin="round"/><path d="M22 34L52 48L82 34M52 48V86" fill="none" stroke="#6cc7ea" stroke-width="5" stroke-linejoin="round"/>`,
  dudu_bow: `<path d="M50 50L14 28V72Z" fill="#5fc3e8"/><path d="M50 50L86 28V72Z" fill="#5fc3e8"/><circle cx="50" cy="50" r="12" fill="#3aa6d0"/>`,
  // 奇奇的冒險系列
  kiki_leaf: `<path d="M50 10C82 26 86 62 50 88C14 62 18 26 50 10Z" fill="#f08a3c"/><path d="M50 22V92M50 44L32 34M50 58L70 46" stroke="#b55a1c" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  kiki_ball: `<circle cx="50" cy="50" r="36" fill="#ffd34d" stroke="#e0a800" stroke-width="5"/><path d="M16 42C40 56 62 56 84 42M30 20C44 48 44 62 34 82" fill="none" stroke="#e0a800" stroke-width="5"/>`,
  kiki_kite: `<path d="M50 8L82 42L50 76L18 42Z" fill="#3fb58a"/><path d="M50 8V76M18 42H82" stroke="#fff" stroke-width="4"/><path d="M50 76Q62 84 54 96" fill="none" stroke="#f08a3c" stroke-width="5" stroke-linecap="round"/>`,
  kiki_car: `<path d="M12 62V48L28 44L38 28H66L78 44L90 48V62Z" fill="#ff6b5c"/><rect x="42" y="33" width="20" height="12" rx="3" fill="#d6f4ff"/><circle cx="32" cy="66" r="11" fill="#3a2a22"/><circle cx="72" cy="66" r="11" fill="#3a2a22"/><circle cx="32" cy="66" r="4" fill="#ddd"/><circle cx="72" cy="66" r="4" fill="#ddd"/>`,
  kiki_star: `<path d="M50 8L61 36L92 38L68 57L76 88L50 71L24 88L32 57L8 38L39 36Z" fill="#ffd34d" stroke="#e0a800" stroke-width="5" stroke-linejoin="round"/>`,
  kiki_mush: `<path d="M12 52C12 16 88 16 88 52Z" fill="#ff6b5c"/><circle cx="36" cy="36" r="7" fill="#fff"/><circle cx="62" cy="30" r="9" fill="#fff"/><rect x="38" y="52" width="24" height="36" rx="10" fill="#fff7ea" stroke="#e6d3b8" stroke-width="4"/>`,
  // 咕咕老師的學堂系列
  gugu_pencil: `<g transform="rotate(-35 50 50)"><rect x="40" y="10" width="20" height="64" fill="#ffd34d"/><rect x="40" y="10" width="20" height="10" fill="#ff9fb0"/><rect x="40" y="20" width="20" height="5" fill="#c0c6d0"/><path d="M40 74H60L50 94Z" fill="#f3d2a4"/><path d="M46 86H54L50 94Z" fill="#3a2a22"/></g>`,
  gugu_book: `<path d="M50 24Q30 14 10 20V80Q30 74 50 84Z" fill="#5fa8e8"/><path d="M50 24Q70 14 90 20V80Q70 74 50 84Z" fill="#7cc0f5"/><path d="M50 24V84" stroke="#2f6fb0" stroke-width="4"/><path d="M20 36Q32 32 42 38M20 50Q32 46 42 52M58 38Q68 32 80 36M58 52Q68 46 80 50" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  gugu_globe: `<rect x="30" y="84" width="40" height="8" rx="4" fill="#8a5a2b"/><rect x="47" y="70" width="6" height="16" fill="#8a5a2b"/><circle cx="50" cy="42" r="30" fill="#6cc7ea"/><path d="M32 30Q44 22 50 34Q44 46 34 44Z M56 46Q70 40 74 54Q64 66 56 58Z" fill="#4caf50"/><path d="M20 42A30 30 0 0 0 80 42" fill="none" stroke="#c0a060" stroke-width="4"/>`,
  gugu_apple: `<path d="M50 30C30 18 12 34 16 58C20 82 38 92 50 84C62 92 80 82 84 58C88 34 70 18 50 30Z" fill="#e5484d"/><path d="M50 30Q50 18 56 10" stroke="#7a4a1e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M54 20Q68 8 76 18Q64 28 54 20Z" fill="#4caf50"/><ellipse cx="32" cy="46" rx="6" ry="10" fill="#fff" opacity=".5"/>`,
  gugu_bell: `<path d="M50 16Q76 18 78 52L84 72H16L22 52Q24 18 50 16Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4"/><circle cx="50" cy="80" r="9" fill="#e0a800"/><rect x="44" y="6" width="12" height="12" rx="4" fill="#8a5a2b"/>`,
  gugu_crayon: `${['#e5484d', '#ffd34d', '#4caf50', '#5fa8e8'].map((c, i) => `<g transform="translate(${16 + i * 18} 0)"><rect x="0" y="26" width="14" height="64" rx="3" fill="${c}"/><path d="M0 26L7 10L14 26Z" fill="${c}"/><rect x="0" y="44" width="14" height="8" fill="#fff" opacity=".6"/></g>`).join('')}`,
  // 棉棉的農場系列
  mian_yarn: `<circle cx="50" cy="52" r="34" fill="#ff9fb0"/><path d="M22 40Q50 30 78 44M18 56Q50 46 82 60M26 72Q50 62 74 76M40 20Q30 50 44 84M62 20Q72 50 58 86" stroke="#e5738f" stroke-width="4" fill="none"/><path d="M80 70Q96 80 90 94" stroke="#ff9fb0" stroke-width="5" fill="none"/>`,
  mian_egg: `<ellipse cx="50" cy="54" rx="30" ry="38" fill="#fff6e6" stroke="#e8d8b8" stroke-width="4"/><path d="M24 56L34 46L44 58L54 46L64 58L76 48" stroke="#ff9fb0" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="40" cy="74" r="5" fill="#9fd8ee"/><circle cx="60" cy="74" r="5" fill="#ffd34d"/>`,
  mian_flower: `<path d="M50 56V94" stroke="#4caf50" stroke-width="6"/><ellipse cx="38" cy="80" rx="12" ry="6" fill="#4caf50" transform="rotate(-30 38 80)"/>${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="50" cy="22" rx="12" ry="18" fill="#ffb3c7" transform="rotate(${r} 50 40)"/>`).join('')}<circle cx="50" cy="40" r="11" fill="#ffd34d"/>`,
  mian_bell: `<path d="M30 20H70" stroke="#e5484d" stroke-width="8" stroke-linecap="round"/><path d="M32 30H68L76 82H24Z" fill="#ffd34d" stroke="#e0a800" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="86" r="8" fill="#e0a800"/>`,
  mian_cloud: `<g fill="#fff" stroke="#c8d8ea" stroke-width="4"><circle cx="34" cy="56" r="20"/><circle cx="54" cy="44" r="24"/><circle cx="72" cy="58" r="18"/></g><rect x="30" y="56" width="46" height="20" fill="#fff"/><circle cx="46" cy="58" r="3" fill="#555"/><circle cx="62" cy="58" r="3" fill="#555"/>`,
  mian_pillow: `<path d="M14 34Q10 22 24 22H76Q90 22 86 34V66Q90 78 76 78H24Q10 78 14 66Z" fill="#cbb8ff"/><path d="M14 34L6 26M86 34L94 26M14 66L6 74M86 66L94 74" stroke="#cbb8ff" stroke-width="6" stroke-linecap="round"/><path d="M50 40l4 8l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1z" fill="#fff6c8"/>`,
  // 小菜園採收（特別收藏）
  harvest_carrot: `<path d="M50 30Q68 34 64 46L52 94Q50 98 48 94L36 46Q32 34 50 30Z" fill="#f08a3c"/><path d="M42 50h8M44 64h8M46 78h6" stroke="#c9562f" stroke-width="3"/><path d="M50 32Q40 10 30 8M50 32Q50 8 54 4M50 32Q62 12 72 10" stroke="#4caf50" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  harvest_tomato: `<circle cx="50" cy="56" r="34" fill="#e5484d"/><path d="M30 28L50 38L70 28L60 44H40Z" fill="#3f9a3f"/><path d="M50 36V20" stroke="#3f9a3f" stroke-width="5"/><ellipse cx="36" cy="54" rx="6" ry="10" fill="#fff" opacity=".4"/>`,
  harvest_corn: `<g transform="rotate(-20 50 50)"><ellipse cx="50" cy="46" rx="18" ry="38" fill="#ffd34d"/>${[[44, 22], [56, 22], [42, 36], [54, 36], [44, 50], [56, 50], [46, 64], [56, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#f0b400"/>`).join('')}<path d="M34 50Q20 80 46 94Q40 70 44 56Z M66 50Q80 80 54 94Q60 70 56 56Z" fill="#6cc04f"/></g>`,
  // 特別收藏：聖誕節禮物
  xmas_globe: `<ellipse cx="50" cy="88" rx="30" ry="8" fill="#8a5a2b"/><rect x="24" y="74" width="52" height="16" rx="6" fill="#b9824f"/>
    <circle cx="50" cy="44" r="34" fill="#d6f4ff" stroke="#9fd8ee" stroke-width="4"/>
    <path d="M50 22L62 44H56L66 62H34L44 44H38Z" fill="#2e8b57"/><rect x="47" y="62" width="6" height="8" fill="#8a5a2b"/>
    <circle cx="30" cy="34" r="3" fill="#fff"/><circle cx="68" cy="30" r="3" fill="#fff"/><circle cx="62" cy="54" r="2.5" fill="#fff"/><circle cx="36" cy="56" r="2.5" fill="#fff"/>
    <path d="M36 24a20 20 0 0 1 12-8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
};

export const SERIES = {
  dudu: ['dudu_bubble', 'dudu_brush', 'dudu_fish', 'dudu_snow', 'dudu_ice', 'dudu_bow'],
  special: ['xmas_globe', 'harvest_carrot', 'harvest_tomato', 'harvest_corn'],
  mian: ['mian_yarn', 'mian_egg', 'mian_flower', 'mian_bell', 'mian_cloud', 'mian_pillow'],
  gugu: ['gugu_pencil', 'gugu_book', 'gugu_globe', 'gugu_apple', 'gugu_bell', 'gugu_crayon'],
  kiki: ['kiki_leaf', 'kiki_ball', 'kiki_kite', 'kiki_car', 'kiki_star', 'kiki_mush'],
};

export function itemSvg(id, size = 100) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${ITEMS[id] || ''}</svg>`;
}

// 優先給還沒有的；整個系列都有了就隨機重複一件。
export function nextItem(collection, charId) {
  const series = SERIES[charId];
  const missing = series.filter((id) => !collection[id]);
  const pool = missing.length ? missing : series;
  return pool[Math.floor(Math.random() * pool.length)];
}

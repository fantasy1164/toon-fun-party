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
  // 特別收藏：聖誕節禮物
  xmas_globe: `<ellipse cx="50" cy="88" rx="30" ry="8" fill="#8a5a2b"/><rect x="24" y="74" width="52" height="16" rx="6" fill="#b9824f"/>
    <circle cx="50" cy="44" r="34" fill="#d6f4ff" stroke="#9fd8ee" stroke-width="4"/>
    <path d="M50 22L62 44H56L66 62H34L44 44H38Z" fill="#2e8b57"/><rect x="47" y="62" width="6" height="8" fill="#8a5a2b"/>
    <circle cx="30" cy="34" r="3" fill="#fff"/><circle cx="68" cy="30" r="3" fill="#fff"/><circle cx="62" cy="54" r="2.5" fill="#fff"/><circle cx="36" cy="56" r="2.5" fill="#fff"/>
    <path d="M36 24a20 20 0 0 1 12-8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
};

export const SERIES = {
  dudu: ['dudu_bubble', 'dudu_brush', 'dudu_fish', 'dudu_snow', 'dudu_ice', 'dudu_bow'],
  special: ['xmas_globe'],
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

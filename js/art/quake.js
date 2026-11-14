// 地震演習的圖卡（100x100）
const head = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd9b8" stroke="#7a5230" stroke-width="2.5"/><path d="M${x - r} ${y - 2}Q${x} ${y - r - 6} ${x + r} ${y - 2}" fill="#5a3a22"/>`;
const TABLE = `<rect x="14" y="44" width="72" height="8" rx="3" fill="#c8915a"/><rect x="20" y="52" width="6" height="40" fill="#a8743f"/><rect x="74" y="52" width="6" height="40" fill="#a8743f"/>`;
const FLOOR = '<rect x="4" y="92" width="92" height="5" rx="2" fill="#c9b79a"/>';
const NO = '<circle cx="80" cy="18" r="14" fill="#e5484d"/><path d="M72 10L88 26M88 10L72 26" stroke="#fff" stroke-width="5" stroke-linecap="round"/>';
const OK = '<circle cx="80" cy="18" r="14" fill="#3fbf6a"/><path d="M73 18L78 23L88 12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';

export const QK = {
  // 躲到桌子下面（對）
  table: `${FLOOR}${TABLE}<g>${head(48, 70)}<path d="M40 80Q48 74 58 80L64 90H34Z" fill="#5fa8e8"/><path d="M40 66Q48 56 58 66" stroke="#ffd9b8" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
  // 跑出門（錯）
  door: `${FLOOR}<rect x="56" y="18" width="34" height="74" rx="3" fill="#d96c4a"/><circle cx="84" cy="56" r="3" fill="#ffd34d"/>${head(34, 30)}<path d="M34 40V64M34 46L22 56M34 46L48 40M34 64L22 84M34 64L46 82" stroke="#5fa8e8" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M8 40h8M6 52h10" stroke="#999" stroke-width="3" stroke-linecap="round"/>`,
  // 站在窗戶旁邊（錯）
  window: `${FLOOR}<rect x="48" y="12" width="44" height="50" rx="4" fill="#bfe6fb" stroke="#fff" stroke-width="4"/><path d="M70 12V62M48 37H92" stroke="#fff" stroke-width="3"/><path d="M54 22L62 30M76 44L84 52" stroke="#e5484d" stroke-width="3"/>${head(30, 40)}<path d="M30 50V74M30 56L20 66M30 56L40 64M30 74L22 90M30 74L38 90" stroke="#5fa8e8" stroke-width="7" stroke-linecap="round" fill="none"/>`,
  // 趴下
  drop: `${FLOOR}${head(30, 66)}<path d="M38 72Q56 64 72 76L80 90H34Z" fill="#5fa8e8"/><path d="M26 76L24 90M72 80L84 90" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/><path d="M50 20V48M40 38L50 48L60 38" stroke="#ff8a5c" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  // 掩護：躲在桌下、手護著頭
  cover: `${FLOOR}${TABLE}${head(46, 72)}<path d="M36 64Q46 54 56 64" stroke="#ffd9b8" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M38 80Q48 76 60 82L64 90H32Z" fill="#5fa8e8"/>`,
  // 穩住：抓緊桌腳
  hold: `${FLOOR}${TABLE}${head(46, 72)}<path d="M40 64Q46 58 52 64" stroke="#ffd9b8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M54 76Q66 70 74 70" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/><circle cx="76" cy="70" r="5" fill="#ffd9b8"/><path d="M38 80Q48 76 60 82L64 90H32Z" fill="#5fa8e8"/>`,
  // 走樓梯（對）／坐電梯（錯）
  stairs: `${[0, 1, 2, 3].map((i) => `<rect x="${10 + i * 18}" y="${74 - i * 16}" width="${90 - i * 18}" height="16" fill="#c9b79a" stroke="#a8946f" stroke-width="2"/>`).join('')}${head(40, 30)}<path d="M40 40V58M40 46L30 54M40 46L50 52M40 58L32 70M40 58L50 66" stroke="#5fa8e8" stroke-width="6" stroke-linecap="round" fill="none"/>${OK}`,
  lift: `<rect x="16" y="10" width="60" height="84" rx="4" fill="#a9b6c4"/><rect x="22" y="18" width="48" height="76" fill="#d6dee8"/><path d="M46 18V94" stroke="#a9b6c4" stroke-width="3"/><path d="M84 40l6 -8l6 8ZM84 50l6 8l6 -8Z" fill="#5a6b80"/>${NO}`,
};

// 劇烈搖晃時掉下來的小東西（選房間畫面上的動畫）
export const QUAKE_ICON = `<svg viewBox="0 0 100 100"><path d="M20 50L50 26L80 50V86H20Z" fill="#fff4e0" stroke="#e5734f" stroke-width="6" stroke-linejoin="round"/><path d="M6 40l8 6l-8 6l8 6M94 40l-8 6l8 6l-8 6" stroke="#ff8a5c" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="40" y="62" width="20" height="24" fill="#d96c4a"/></svg>`;

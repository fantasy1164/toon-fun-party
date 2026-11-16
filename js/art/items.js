// 虛擬收藏品：每位角色一個系列，每件畫在 100x100 的框內。
import { ANIMALS } from './animals.js';

// 動物娃娃（歡樂島紀念品店，一次只能選一隻）：動物縮小，加上娃娃的標籤和縫線
const plush = (id, dy = 0) => `<circle cx="50" cy="54" r="44" fill="#fff6fb"/><g transform="translate(2 ${2 + dy}) scale(.48)">${ANIMALS[id].svg()}</g>
  <g transform="translate(70 70) rotate(-12)"><rect width="22" height="16" rx="4" fill="#ff7fa8"/><path d="M11 4Q5 0 4 5Q4 9 11 13Q18 9 18 5Q17 0 11 4Z" fill="#fff"/></g>`;
export const PLUSH_IDS = ['panda', 'koala', 'penguin', 'giraffe', 'lion', 'elephant', 'bear', 'leopardcat', 'kangaroo', 'zebra', 'meerkat', 'llama'];

export const ITEMS = {
  ...Object.fromEntries(PLUSH_IDS.map((id) => [`zp_${id}`, plush(id)])),
  // 森森園長的動物園系列
  sen_binoc: `<g transform="rotate(-8 50 50)"><rect x="16" y="30" width="28" height="42" rx="10" fill="#333a48"/><rect x="56" y="30" width="28" height="42" rx="10" fill="#333a48"/><rect x="40" y="40" width="20" height="14" fill="#555c6a"/><circle cx="30" cy="70" r="11" fill="#9fd0ff" stroke="#222" stroke-width="3"/><circle cx="70" cy="70" r="11" fill="#9fd0ff" stroke="#222" stroke-width="3"/><path d="M20 30Q50 4 80 30" stroke="#8a5a2b" stroke-width="4" fill="none"/></g>`,
  sen_hat: `<ellipse cx="50" cy="66" rx="44" ry="12" fill="#d8c08a"/><path d="M18 66Q20 22 50 20Q80 22 82 66Z" fill="#e6d2a0"/><path d="M20 56Q50 48 80 56L82 66Q50 58 18 66Z" fill="#4f8a4f"/><path d="M66 50Q76 38 86 42Q80 54 68 56Z" fill="#6cc070"/>`,
  sen_tram: `<g transform="translate(4 30) scale(.42)"><rect x="0" y="10" width="64" height="44" rx="10" fill="#3fae6a"/><rect x="4" y="0" width="56" height="8" rx="4" fill="#ffd34d"/><rect x="70" y="10" width="64" height="44" rx="10" fill="#3fae6a"/><rect x="74" y="0" width="56" height="8" rx="4" fill="#ffd34d"/><rect x="140" y="10" width="70" height="44" rx="10" fill="#3fae6a"/><rect x="144" y="0" width="62" height="8" rx="4" fill="#ffd34d"/>${[16, 48, 86, 118, 156, 194].map((x) => `<circle cx="${x}" cy="58" r="9" fill="#333"/>`).join('')}</g>`,
  sen_paw: `<ellipse cx="50" cy="60" rx="30" ry="26" fill="#9aa0aa"/>${[[24, 30], [42, 22], [60, 22], [78, 30]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="#9aa0aa"/>`).join('')}<path d="M34 64Q50 74 66 64" stroke="#7a808a" stroke-width="4" fill="none"/>`,
  sen_leaf: `<path d="M50 90V40" stroke="#6cbf4a" stroke-width="8"/><path d="M50 60Q20 50 18 20Q46 24 50 56Z" fill="#7cd05a"/><path d="M50 50Q78 40 84 12Q56 18 50 46Z" fill="#5aa84a"/><path d="M44 70h12" stroke="#4a9a34" stroke-width="3"/>`,
  sen_book: `<path d="M50 24Q30 14 10 20V80Q30 74 50 84Z" fill="#4f8a4f"/><path d="M50 24Q70 14 90 20V80Q70 74 50 84Z" fill="#6cbf6a"/><path d="M50 24V84" stroke="#2f6a2f" stroke-width="4"/><g transform="translate(56 28) scale(.15)">${ANIMALS.panda.svg()}</g><g transform="translate(14 30) scale(.14)">${ANIMALS.giraffe.svg()}</g>`,
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
  // 波波的廚房系列
  bobo_honey: `<path d="M26 34H74V84Q74 92 66 92H34Q26 92 26 84Z" fill="#ffb300"/><rect x="22" y="22" width="56" height="16" rx="6" fill="#c98f4f"/><path d="M26 50Q50 58 74 50V60Q50 68 26 60Z" fill="#fff" opacity=".35"/><path d="M40 70l10 -6l10 6v12l-10 6l-10 -6z" fill="#e08a00"/><path d="M64 30Q80 20 84 34" stroke="#c98f4f" stroke-width="5" fill="none"/>`,
  bobo_pot: `<path d="M14 44H86V74Q86 90 70 90H30Q14 90 14 74Z" fill="#e5734f"/><rect x="8" y="40" width="84" height="10" rx="5" fill="#c9562f"/><path d="M4 56H14M86 56H96" stroke="#555" stroke-width="7" stroke-linecap="round"/><path d="M36 30Q30 20 38 12M52 30Q46 18 54 8M68 30Q62 20 70 12" stroke="#c8d0da" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  bobo_donut: `<circle cx="50" cy="52" r="36" fill="#d9a066"/><path d="M18 46Q20 20 50 18Q80 20 84 46Q78 60 66 52Q58 64 48 54Q38 64 30 52Q22 60 18 46Z" fill="#ff9fc4"/><circle cx="50" cy="52" r="12" fill="#fff"/>${[[34, 32, '#5fa8e8'], [62, 30, '#ffd34d'], [72, 44, '#4caf50'], [28, 44, '#fff'], [46, 26, '#e5484d']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="8" height="3" rx="1.5" fill="${c}" transform="rotate(30 ${x} ${y})"/>`).join('')}`,
  bobo_bread: `<path d="M14 52Q14 24 50 24Q86 24 86 52V82Q86 88 80 88H20Q14 88 14 82Z" fill="#e8b46a"/><path d="M20 54Q20 32 50 32Q80 32 80 54V80H20Z" fill="#fff3d6"/><circle cx="40" cy="58" r="4" fill="#3a2a22"/><circle cx="60" cy="58" r="4" fill="#3a2a22"/><path d="M42 68Q50 74 58 68" stroke="#3a2a22" stroke-width="3" fill="none"/>`,
  bobo_spoon: `<g transform="rotate(-35 50 50)"><ellipse cx="50" cy="26" rx="16" ry="22" fill="#c0c6d0"/><ellipse cx="50" cy="24" rx="10" ry="15" fill="#e6eaf0"/><rect x="45" y="44" width="10" height="50" rx="5" fill="#c98f4f"/></g>`,
  bobo_apron: `<path d="M30 20H70V34Q86 40 84 56L80 90H20L16 56Q14 40 30 34Z" fill="#ff9f43"/><path d="M30 20Q50 6 70 20" stroke="#fff" stroke-width="5" fill="none"/><rect x="34" y="56" width="32" height="20" rx="4" fill="#fff" opacity=".5"/><circle cx="50" cy="44" r="7" fill="#e5484d"/>`,
  // 生日禮物（每位角色一件）
  bd_rocket: `<path d="M50 8Q70 26 68 60H32Q30 26 50 8Z" fill="#e5484d"/><circle cx="50" cy="36" r="9" fill="#9fd8ee" stroke="#fff" stroke-width="3"/><path d="M32 52L18 72L32 68ZM68 52L82 72L68 68Z" fill="#ffd34d"/><path d="M38 60H62L58 70H42Z" fill="#888"/><path d="M42 72Q50 96 58 72Z" fill="#ff9f43"/>`,
  bd_bubble: `<rect x="46" y="50" width="8" height="44" rx="4" fill="#5fa8e8"/><circle cx="50" cy="40" r="14" fill="none" stroke="#5fa8e8" stroke-width="6"/>${[[24, 22, 10], [76, 26, 12], [70, 60, 8], [22, 58, 7], [52, 12, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d6f4ff" stroke="#9fd8ee" stroke-width="2" opacity=".9"/>`).join('')}`,
  bd_cupcake: `<path d="M26 54H74L68 90H32Z" fill="#ff9fc4"/>${[34, 44, 54, 64].map((x) => `<path d="M${x} 54L${x + 2} 90" stroke="#e5738f" stroke-width="3"/>`).join('')}<path d="M22 56Q20 34 40 32Q44 18 58 22Q78 22 78 40Q84 50 76 58Z" fill="#fff3d6"/><circle cx="52" cy="18" r="8" fill="#e5484d"/><rect x="38" y="36" width="8" height="3" fill="#5fa8e8" transform="rotate(30 38 36)"/><rect x="60" y="40" width="8" height="3" fill="#ffd34d"/>`,
  bd_starlamp: `<path d="M50 10l11 23l25 3l-18 17l5 25l-23 -12l-23 12l5 -25l-18 -17l25 -3z" fill="#ffe680" stroke="#ffd34d" stroke-width="4" stroke-linejoin="round"/><circle cx="42" cy="44" r="3" fill="#555"/><circle cx="58" cy="44" r="3" fill="#555"/><path d="M44 54Q50 58 56 54" stroke="#555" stroke-width="3" fill="none"/><rect x="40" y="82" width="20" height="10" rx="3" fill="#cbb8ff"/>`,
  bd_musicbox: `<rect x="16" y="46" width="68" height="44" rx="6" fill="#8e6cd8"/><path d="M16 46L26 28H74L84 46Z" fill="#b39ef0"/><rect x="16" y="60" width="68" height="6" fill="#ffd34d"/><path d="M60 14V30M60 14L72 18" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/><circle cx="56" cy="30" r="5" fill="#3a2a22"/><path d="M30 18V30" stroke="#3a2a22" stroke-width="4"/><circle cx="26" cy="30" r="5" fill="#3a2a22"/>`,
  // 新年系列
  ny_lantern: `<rect x="46" y="4" width="8" height="12" fill="#8a5a2b"/><rect x="32" y="14" width="36" height="8" rx="3" fill="#ffcf40"/><ellipse cx="50" cy="50" rx="34" ry="30" fill="#e8262d"/><path d="M36 22Q28 50 36 78M64 22Q72 50 64 78" stroke="#b5141a" stroke-width="3" fill="none"/><rect x="32" y="78" width="36" height="8" rx="3" fill="#ffcf40"/><path d="M42 86v10M50 86v12M58 86v10" stroke="#ffcf40" stroke-width="3"/>`,
  ny_orange: `<circle cx="50" cy="56" r="34" fill="#ff9f1a"/><circle cx="40" cy="46" r="6" fill="#fff" opacity=".4"/><path d="M50 22Q48 14 54 8" stroke="#7a4a1e" stroke-width="4" fill="none"/><path d="M52 18Q66 6 76 14Q64 24 52 18Z" fill="#3f9a3f"/>`,
  ny_sheep: `${[[34, 50], [50, 42], [66, 50], [30, 66], [70, 66], [50, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#fff6f0" stroke="#eee" stroke-width="2"/>`).join('')}<ellipse cx="50" cy="38" rx="14" ry="16" fill="#ffd9c8"/><circle cx="45" cy="36" r="2.6" fill="#3a2a22"/><circle cx="55" cy="36" r="2.6" fill="#3a2a22"/><path d="M36 30q-10 -6 -4 -16M64 30q10 -6 4 -16" stroke="#e8b8a0" stroke-width="5" fill="none"/><path d="M38 82h24" stroke="#d6262b" stroke-width="6" stroke-linecap="round"/>`,
  ny_drum: `<ellipse cx="50" cy="36" rx="34" ry="12" fill="#f3d2a4"/><path d="M16 36V70Q50 86 84 70V36" fill="#d6262b"/><ellipse cx="50" cy="36" rx="34" ry="12" fill="none" stroke="#ffcf40" stroke-width="4"/><path d="M70 8L90 26M78 4L94 20" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>`,
  ny_tangyuan: `<ellipse cx="50" cy="44" rx="40" ry="12" fill="#f6e6d0"/><path d="M10 44Q14 90 50 90Q86 90 90 44Z" fill="#e5484d"/>${[[34, 40], [50, 36], [66, 40], [42, 48], [58, 48]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="8" fill="${i % 2 ? '#ffb3c7' : '#fff'}"/>`).join('')}`,
  ny_envelope: `<rect x="22" y="10" width="56" height="80" rx="6" fill="#d6262b" stroke="#ffcf40" stroke-width="3"/><path d="M22 32Q50 52 78 32" fill="none" stroke="#ffcf40" stroke-width="3"/><circle cx="50" cy="46" r="10" fill="#ffcf40"/>`,
  ny_nian: `<path d="M30 22L24 6L42 16ZM70 22L76 6L58 16Z" fill="#ffd34d"/><ellipse cx="50" cy="56" rx="40" ry="36" fill="#3fbf9f"/><ellipse cx="50" cy="68" rx="26" ry="20" fill="#bff0dc"/><circle cx="36" cy="46" r="9" fill="#fff"/><circle cx="64" cy="46" r="9" fill="#fff"/><circle cx="37" cy="48" r="4.5" fill="#1d2433"/><circle cx="63" cy="48" r="4.5" fill="#1d2433"/><path d="M40 66Q50 72 60 66" stroke="#1d2433" stroke-width="3" fill="none"/>`,
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

  // 噗噗的汽車系列
  pupu_wheel: `<circle cx="50" cy="50" r="38" fill="none" stroke="#2f3e5c" stroke-width="10"/><circle cx="50" cy="50" r="10" fill="#2f6fd6"/><path d="M50 40V14M42 54L20 70M58 54L80 70" stroke="#2f3e5c" stroke-width="8" stroke-linecap="round"/>`,
  pupu_light: `<rect x="34" y="6" width="32" height="70" rx="10" fill="#333"/><circle cx="50" cy="20" r="9" fill="#ff5252"/><circle cx="50" cy="41" r="9" fill="#ffd34d"/><circle cx="50" cy="62" r="9" fill="#5ed17a"/><rect x="46" y="76" width="8" height="20" fill="#555"/>`,
  pupu_bus: `<rect x="8" y="22" width="84" height="52" rx="10" fill="#9d8fd0"/><rect x="14" y="30" width="16" height="16" rx="3" fill="#cfefff"/><rect x="34" y="30" width="16" height="16" rx="3" fill="#cfefff"/><rect x="54" y="30" width="16" height="16" rx="3" fill="#cfefff"/><rect x="74" y="30" width="12" height="28" rx="3" fill="#cfefff"/><circle cx="26" cy="76" r="9" fill="#333"/><circle cx="72" cy="76" r="9" fill="#333"/>`,
  pupu_cap: `<path d="M14 58Q16 20 50 18Q84 20 86 58Z" fill="#2f6fd6"/><path d="M10 58H94Q96 70 80 70H10Z" fill="#1f4fa8"/><circle cx="50" cy="38" r="10" fill="#ffd34d"/>`,
  pupu_seat: `<path d="M24 92V40Q24 14 50 14Q76 14 76 40V92Z" fill="#e5734f"/><path d="M32 92V44Q32 26 50 26Q68 26 68 44V92Z" fill="#f08a6a"/><path d="M38 50L62 84M62 50L38 84" stroke="#2b2f3a" stroke-width="6" stroke-linecap="round"/><rect x="42" y="62" width="16" height="12" rx="3" fill="#e5484d"/>`,
  pupu_cone: `<path d="M50 10L76 84H24Z" fill="#ff8a3d"/><path d="M40 40H60M34 60H66" stroke="#fff" stroke-width="8"/><rect x="14" y="82" width="72" height="10" rx="4" fill="#e06a1d"/>`,
  // 豆豆的農場系列
  doudou_bone: `<g transform="rotate(-30 50 50)"><rect x="24" y="42" width="52" height="16" rx="8" fill="#fff4e2" stroke="#d8c8a8" stroke-width="3"/><circle cx="22" cy="42" r="11" fill="#fff4e2" stroke="#d8c8a8" stroke-width="3"/><circle cx="22" cy="58" r="11" fill="#fff4e2" stroke="#d8c8a8" stroke-width="3"/><circle cx="78" cy="42" r="11" fill="#fff4e2" stroke="#d8c8a8" stroke-width="3"/><circle cx="78" cy="58" r="11" fill="#fff4e2" stroke="#d8c8a8" stroke-width="3"/></g>`,
  doudou_milk: `<path d="M34 24H66V34L74 48V88H26V48L34 34Z" fill="#fff" stroke="#c8d8ea" stroke-width="4" stroke-linejoin="round"/><rect x="34" y="14" width="32" height="12" rx="3" fill="#5fa8e8"/><path d="M30 56H70" stroke="#5fa8e8" stroke-width="6"/>`,
  doudou_hay: `<rect x="14" y="40" width="72" height="44" rx="8" fill="#f2c84b"/><path d="M14 54H86M14 70H86" stroke="#c99a1e" stroke-width="4"/><path d="M26 40L30 28M44 40L42 24M60 40L64 26M74 40L78 30" stroke="#f2c84b" stroke-width="4" stroke-linecap="round"/>`,
  doudou_carrot: `<path d="M50 30L66 40L42 92Z" fill="#ff8a3d"/><path d="M50 30Q42 12 54 6Q56 20 58 26Q68 14 78 20Q66 26 58 34Z" fill="#4caf50"/>`,
  doudou_bucket: `<path d="M24 34H76L70 88H30Z" fill="#9fb7c9"/><ellipse cx="50" cy="34" rx="26" ry="8" fill="#c8d8ea"/><path d="M24 34Q50 -2 76 34" stroke="#6a7f91" stroke-width="4" fill="none"/><ellipse cx="50" cy="36" rx="20" ry="5" fill="#fff"/>`,
  doudou_hat: `<ellipse cx="50" cy="62" rx="44" ry="14" fill="#e0b25a"/><path d="M26 60Q28 24 50 24Q72 24 74 60Z" fill="#f2c84b"/><path d="M26 54Q50 62 74 54" stroke="#e5484d" stroke-width="7" fill="none"/>`,
  // 跳跳的公園系列
  tiao_kite: `<path d="M50 6L82 40L50 74L18 40Z" fill="#ff6b8a"/><path d="M50 6V74M18 40H82" stroke="#fff" stroke-width="4"/><path d="M50 74Q40 84 52 90Q62 96 50 100" stroke="#5a6b80" stroke-width="3" fill="none"/>`,
  tiao_bubble: `<path d="M20 90L46 54" stroke="#ffb300" stroke-width="7" stroke-linecap="round"/><circle cx="54" cy="44" r="14" fill="none" stroke="#ffb300" stroke-width="6"/><circle cx="76" cy="22" r="12" fill="#cfefff" stroke="#9cd8f2" stroke-width="3"/><circle cx="84" cy="50" r="8" fill="#cfefff" stroke="#9cd8f2" stroke-width="3"/>`,
  tiao_sand: `<path d="M22 44H62L58 88H26Z" fill="#ff6b5c"/><path d="M22 44Q42 26 62 44" stroke="#e5484d" stroke-width="4" fill="none"/><path d="M70 20L82 70" stroke="#3fb5e8" stroke-width="8" stroke-linecap="round"/><path d="M76 66Q92 70 84 88Q74 86 76 66Z" fill="#3fb5e8"/>`,
  tiao_ball: `<circle cx="50" cy="52" r="38" fill="#ffd34d"/><path d="M14 46Q50 64 86 46M50 14Q34 52 50 90" stroke="#e5484d" stroke-width="6" fill="none"/>`,
  tiao_disc: `<ellipse cx="50" cy="54" rx="42" ry="22" fill="#5ed17a"/><ellipse cx="50" cy="48" rx="34" ry="14" fill="#7ee39a"/><ellipse cx="50" cy="48" rx="16" ry="6" fill="#5ed17a"/>`,
  tiao_rope: `<rect x="10" y="12" width="12" height="28" rx="5" fill="#ff6b8a"/><rect x="78" y="12" width="12" height="28" rx="5" fill="#ff6b8a"/><path d="M16 40Q14 96 50 92Q86 96 84 40" stroke="#9b85f0" stroke-width="5" fill="none"/>`,
  // 圓圓醫生的診所系列
  yuan_steth: `<path d="M30 12V40Q30 62 50 62Q70 62 70 40V12" stroke="#4a5568" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="30" cy="12" r="5" fill="#4a5568"/><circle cx="70" cy="12" r="5" fill="#4a5568"/><path d="M50 62V72Q50 86 66 86" stroke="#4a5568" stroke-width="6" fill="none"/><circle cx="74" cy="84" r="12" fill="#c0c8d4" stroke="#4a5568" stroke-width="5"/>`,
  yuan_thermo: `<g transform="rotate(-30 50 50)"><rect x="40" y="8" width="20" height="66" rx="10" fill="#fff" stroke="#9aa8b8" stroke-width="4"/><rect x="46" y="38" width="8" height="38" rx="4" fill="#e5484d"/><circle cx="50" cy="80" r="14" fill="#e5484d" stroke="#9aa8b8" stroke-width="4"/></g>`,
  yuan_bandage: `<g transform="rotate(-30 50 50)"><rect x="8" y="34" width="84" height="32" rx="16" fill="#f3c08e"/><rect x="34" y="34" width="32" height="32" fill="#f8dcbc"/>${[[40, 42], [50, 42], [60, 42], [40, 52], [50, 52], [60, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="2" fill="#d9a066"/>`).join('')}</g>`,
  yuan_mask: `<path d="M22 36Q50 28 78 36V64Q50 78 22 64Z" fill="#9fd8ee" stroke="#6cb8d6" stroke-width="4"/><path d="M28 46H72M28 56H72" stroke="#6cb8d6" stroke-width="3"/><path d="M22 40Q8 44 10 52Q12 60 22 60M78 40Q92 44 90 52Q88 60 78 60" stroke="#fff" stroke-width="4" fill="none"/>`,
  yuan_bag: `<path d="M38 30V20Q38 14 44 14H56Q62 14 62 20V30" stroke="#6b3a1e" stroke-width="6" fill="none"/><rect x="12" y="30" width="76" height="56" rx="12" fill="#8a4a2a"/><rect x="40" y="46" width="20" height="24" fill="#fff"/><rect x="32" y="54" width="36" height="8" fill="#fff"/>`,
  yuan_sticker: `<circle cx="50" cy="50" r="38" fill="#ffd34d" stroke="#ff9f1c" stroke-width="5"/><path d="M50 72C30 58 24 48 24 40C24 32 30 28 36 28C42 28 47 32 50 36C53 32 58 28 64 28C70 28 76 32 76 40C76 48 70 58 50 72Z" fill="#ff5c8a"/>`,
  // 栗栗的超市系列
  lili_cart: `<path d="M8 22H22L32 66H80L88 34H26" stroke="#3a7bd5" stroke-width="6" fill="none" stroke-linejoin="round"/><path d="M30 44H84M32 56H80" stroke="#3a7bd5" stroke-width="4"/><circle cx="38" cy="80" r="8" fill="#333"/><circle cx="74" cy="80" r="8" fill="#333"/>`,
  lili_ecobag: `<path d="M34 34Q34 12 50 12Q66 12 66 34" stroke="#2f8f55" stroke-width="6" fill="none"/><path d="M18 32H82L76 90H24Z" fill="#7bd39a"/><path d="M50 50Q38 58 50 74Q62 58 50 50Z" fill="#2f8f55"/>`,
  lili_coin: `<circle cx="42" cy="54" r="30" fill="#ffd34d" stroke="#e0a800" stroke-width="5"/><text x="42" y="66" font-size="30" font-weight="900" text-anchor="middle" fill="#b8860b">10</text><circle cx="72" cy="30" r="18" fill="#d9d9d9" stroke="#a8a8a8" stroke-width="4"/><text x="72" y="38" font-size="20" font-weight="900" text-anchor="middle" fill="#888">5</text>`,
  lili_milk: `<path d="M30 30L40 14H60L70 30V88H30Z" fill="#fff" stroke="#9fd8ee" stroke-width="4" stroke-linejoin="round"/><path d="M30 30H70" stroke="#9fd8ee" stroke-width="4"/><path d="M30 52Q50 44 70 52V70Q50 62 30 70Z" fill="#5fa8e8"/><circle cx="50" cy="40" r="5" fill="#ff9fb0"/>`,
  lili_acorn: `<path d="M24 44Q50 26 76 44Q76 56 50 56Q24 56 24 44Z" fill="#8a4f22"/><path d="M50 24V34" stroke="#6b3a1e" stroke-width="6" stroke-linecap="round"/><path d="M30 54Q30 88 50 92Q70 88 70 54Z" fill="#d9944a"/><ellipse cx="40" cy="66" rx="5" ry="10" fill="#fff" opacity=".35"/>`,
  lili_register: `<rect x="14" y="44" width="72" height="42" rx="8" fill="#ff8a5c"/><rect x="24" y="16" width="46" height="26" rx="5" fill="#3a3a4a"/><rect x="30" y="22" width="34" height="14" rx="3" fill="#7be0a0"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${26 + c * 16}" y="${52 + r * 10}" width="12" height="7" rx="2" fill="#fff"/>`).join('')).join('')}<rect x="72" y="52" width="8" height="26" rx="3" fill="#ffd34d"/>`,
  // 高高的遊樂園系列
  gao_ticket: `<path d="M10 30H90V44A8 8 0 0 0 90 58V72H10V58A8 8 0 0 0 10 44Z" fill="#ff8fb0"/><path d="M66 30V72" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/><path d="M36 40l4 8h9l-7 6l3 9l-9 -5l-9 5l3 -9l-7 -6h9z" fill="#ffd34d"/>`,
  gao_balloon: `<path d="M50 70Q46 82 54 94" stroke="#888" stroke-width="2" fill="none"/><ellipse cx="50" cy="40" rx="26" ry="31" fill="#e5484d"/><path d="M45 70h10l-5 -6z" fill="#c43a3f"/><ellipse cx="40" cy="28" rx="7" ry="11" fill="#fff" opacity=".45"/>`,
  gao_horse: `<rect x="47" y="6" width="6" height="90" fill="#ffd34d"/><path d="M24 52Q24 38 40 38H62Q70 26 80 30L84 40L74 44V58Q74 66 64 66H34Q24 66 24 58Z" fill="#fff" stroke="#c9a0e8" stroke-width="3"/><path d="M62 38Q70 30 76 36" stroke="#c77dff" stroke-width="6" fill="none"/><circle cx="76" cy="36" r="2.5" fill="#333"/><path d="M32 66V80M44 66V82M58 66V82M68 66V78" stroke="#c9a0e8" stroke-width="5" stroke-linecap="round"/>`,
  gao_ferris: `<circle cx="50" cy="44" r="32" fill="none" stroke="#5fa8e8" stroke-width="5"/>${[0, 60, 120, 180, 240, 300].map((r) => `<path d="M50 44L${(50 + 32 * Math.cos(r * Math.PI / 180)).toFixed(1)} ${(44 + 32 * Math.sin(r * Math.PI / 180)).toFixed(1)}" stroke="#5fa8e8" stroke-width="3"/><rect x="${(44 + 32 * Math.cos(r * Math.PI / 180)).toFixed(1)}" y="${(44 + 32 * Math.sin(r * Math.PI / 180)).toFixed(1)}" width="12" height="10" rx="3" fill="${['#e5484d', '#ffc400', '#3fbf7f'][r / 60 % 3]}"/>`).join('')}<path d="M50 44L32 94M50 44L68 94" stroke="#8a5a2b" stroke-width="5"/><circle cx="50" cy="44" r="6" fill="#ffd34d"/>`,
  gao_popcorn: `${[[34, 30], [46, 22], [58, 28], [66, 36], [40, 40], [54, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff6d6" stroke="#f0d070" stroke-width="2"/>`).join('')}<path d="M26 40H74L66 94H34Z" fill="#fff"/>${[0, 1, 2].map((i) => `<path d="M${32 + i * 14} 40L${38 + i * 12} 94H${44 + i * 12}L${40 + i * 14} 40Z" fill="#e5484d"/>`).join('')}`,
  gao_cap: `<path d="M18 62Q20 22 50 20Q80 22 82 62Z" fill="#e5484d"/><path d="M70 60Q96 58 96 70H66Z" fill="#c43a3f"/><path d="M18 62H82" stroke="#c43a3f" stroke-width="5"/><circle cx="50" cy="40" r="9" fill="#ffd34d"/><path d="M38 20L34 6M62 20L66 6" stroke="#d98a3a" stroke-width="5" stroke-linecap="round"/>`,
  // 勇勇的消防系列
  yong_helmet: `<path d="M14 62Q16 18 50 16Q84 18 86 62Z" fill="#e5383b"/><path d="M6 62H94Q92 74 80 74H20Q8 74 6 62Z" fill="#c12a2d"/><path d="M50 18V58" stroke="#c12a2d" stroke-width="5"/><path d="M50 28l6 11h12l-9 8l3 12l-12 -7l-12 7l3 -12l-9 -8h12z" fill="#ffd34d"/>`,
  yong_hose: `<path d="M20 84Q14 40 50 40Q84 40 78 70Q74 86 58 80" fill="none" stroke="#e0a83a" stroke-width="14" stroke-linecap="round"/><path d="M54 76L74 60L84 72L64 88Z" fill="#9aa0aa"/><path d="M84 66Q94 60 96 50M88 72Q98 70 100 62" stroke="#5fc3e8" stroke-width="4" stroke-linecap="round"/>`,
  yong_truck: `<rect x="8" y="40" width="62" height="36" rx="5" fill="#e5383b"/><path d="M70 50H86L94 62V76H70Z" fill="#e5383b"/><rect x="74" y="54" width="12" height="10" fill="#d6f4ff"/><path d="M12 36L62 22" stroke="#c9d0d6" stroke-width="5"/><path d="M14 30L60 18" stroke="#c9d0d6" stroke-width="3"/><circle cx="26" cy="78" r="9" fill="#333"/><circle cx="78" cy="78" r="9" fill="#333"/><rect x="40" y="34" width="10" height="7" rx="2" fill="#5fc3e8"/><path d="M8 60H70" stroke="#fff" stroke-width="3"/>`,
  yong_ext: `<rect x="34" y="28" width="32" height="64" rx="12" fill="#e5383b"/><rect x="40" y="16" width="20" height="14" rx="3" fill="#333"/><path d="M58 20H76V30" stroke="#333" stroke-width="5" fill="none"/><path d="M60 26Q80 24 82 44" stroke="#333" stroke-width="5" fill="none"/><rect x="38" y="50" width="24" height="18" rx="3" fill="#fff"/>`,
  yong_alarm: `<circle cx="50" cy="50" r="38" fill="#f4f6fa" stroke="#c9d0d6" stroke-width="5"/><circle cx="50" cy="50" r="22" fill="#fff" stroke="#c9d0d6" stroke-width="3"/><circle cx="50" cy="50" r="5" fill="#e5383b"/>${[0, 1, 2].map((i) => `<path d="M${76 + i * 7} ${30 - i * 3}Q${86 + i * 7} 50 ${76 + i * 7} ${70 + i * 3}" stroke="#ff9f43" stroke-width="3" fill="none"/>`).join('')}`,
  yong_badge: `<path d="M50 8L84 22V50Q84 76 50 92Q16 76 16 50V22Z" fill="#ffd34d" stroke="#d9a02a" stroke-width="5"/><path d="M50 30l7 13h14l-11 9l4 14l-14 -8l-14 8l4 -14l-11 -9h14z" fill="#e5383b"/>`,
};

export const SERIES = {
  dudu: ['dudu_bubble', 'dudu_brush', 'dudu_fish', 'dudu_snow', 'dudu_ice', 'dudu_bow'],
  special: ['xmas_globe', 'harvest_carrot', 'harvest_tomato', 'harvest_corn', 'ny_nian'],
  newyear: ['ny_lantern', 'ny_orange', 'ny_sheep', 'ny_drum', 'ny_tangyuan', 'ny_envelope'],
  bobo: ['bobo_honey', 'bobo_pot', 'bobo_donut', 'bobo_bread', 'bobo_spoon', 'bobo_apron'],
  mian: ['mian_yarn', 'mian_egg', 'mian_flower', 'mian_bell', 'mian_cloud', 'mian_pillow'],
  gugu: ['gugu_pencil', 'gugu_book', 'gugu_globe', 'gugu_apple', 'gugu_bell', 'gugu_crayon'],
  pupu: ['pupu_wheel', 'pupu_light', 'pupu_bus', 'pupu_cap', 'pupu_seat', 'pupu_cone'],
  doudou: ['doudou_bone', 'doudou_milk', 'doudou_hay', 'doudou_carrot', 'doudou_bucket', 'doudou_hat'],
  tiaotiao: ['tiao_kite', 'tiao_bubble', 'tiao_sand', 'tiao_ball', 'tiao_disc', 'tiao_rope'],
  yuanyuan: ['yuan_steth', 'yuan_thermo', 'yuan_bandage', 'yuan_mask', 'yuan_bag', 'yuan_sticker'],
  lili: ['lili_cart', 'lili_ecobag', 'lili_coin', 'lili_milk', 'lili_acorn', 'lili_register'],
  yongyong: ['yong_helmet', 'yong_hose', 'yong_truck', 'yong_ext', 'yong_alarm', 'yong_badge'],
  gaogao: ['gao_ticket', 'gao_balloon', 'gao_horse', 'gao_ferris', 'gao_popcorn', 'gao_cap'],
  sensen: ['sen_binoc', 'sen_hat', 'sen_tram', 'sen_paw', 'sen_leaf', 'sen_book'],
  plush: PLUSH_IDS.map((id) => `zp_${id}`),
  kiki: ['kiki_leaf', 'kiki_ball', 'kiki_kite', 'kiki_car', 'kiki_star', 'kiki_mush'],
};

export function itemSvg(id, size = 100) {
  const body = id.startsWith('bdcard~') ? cardItem(id) : (ITEMS[id] || '');
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${body}</svg>`;
}

// 兄弟姊妹做的生日卡：bdcard~<誰做的>~<顏色>~<貼紙.貼紙>~<日期>
export const CARD_COLORS = { pink: '#ffb3c7', blue: '#9fd0ff', yellow: '#ffe07a' };
export const STICKERS = {
  heart: `<path d="M0 10C-10 2 -16 -4 -16 -10C-16 -16 -10 -18 -6 -16C-3 -15 -1 -13 0 -10C1 -13 3 -15 6 -16C10 -18 16 -16 16 -10C16 -4 10 2 0 10Z" fill="#ff5c8a"/>`,
  star: `<path d="M0 -16l5 10l11 1.5l-8 7.5l2 11l-10 -5.5l-10 5.5l2 -11l-8 -7.5l11 -1.5z" fill="#ffc400"/>`,
  flower: `${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-9" rx="6" ry="9" fill="#c77dff" transform="rotate(${r})"/>`).join('')}<circle r="5" fill="#ffd34d"/>`,
  balloon: `<ellipse cy="-4" rx="11" ry="14" fill="#3fbf7f"/><path d="M0 10Q-4 16 2 22" stroke="#888" stroke-width="2" fill="none"/>`,
  cake: `<rect x="-14" y="-4" width="28" height="16" rx="3" fill="#ff9fc4"/><rect x="-14" y="-4" width="28" height="5" fill="#fff"/><rect x="-2" y="-14" width="4" height="10" fill="#5fa8e8"/><ellipse cy="-16" rx="3" ry="4" fill="#ffb300"/>`,
  rainbow: `${['#e5484d', '#ffc400', '#3fbf7f', '#5fa8e8'].map((c, i) => `<path d="M${-16 + i * 4} 8A${16 - i * 4} ${16 - i * 4} 0 0 1 ${16 - i * 4} 8" stroke="${c}" stroke-width="4" fill="none"/>`).join('')}`,
};
export const CARD_SPOTS = [[32, 40], [68, 40], [50, 62], [30, 76], [70, 76]];
function cardItem(id) {
  const [, , color, st = ''] = id.split('~');
  const stickers = st ? st.split('.') : [];
  return `<path d="M14 18H86V88H14Z" fill="${CARD_COLORS[color] || '#fff'}" stroke="#fff" stroke-width="4"/><path d="M14 18L50 8L86 18" fill="${CARD_COLORS[color] || '#fff'}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    ${stickers.map((k, i) => `<g transform="translate(${CARD_SPOTS[i][0]} ${CARD_SPOTS[i][1]}) scale(.8)">${STICKERS[k] || ''}</g>`).join('')}`;
}

// 優先給還沒有的；整個系列都有了就隨機重複一件。
export function nextItem(collection, charId) {
  const series = SERIES[charId];
  const missing = series.filter((id) => !collection[id]);
  const pool = missing.length ? missing : series;
  return pool[Math.floor(Math.random() * pool.length)];
}

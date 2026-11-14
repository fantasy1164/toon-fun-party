// 一起玩的輪流：一個口令一個動作。角色唱名，被叫到的小孩才點。
// iPad 分不出是誰點的，所以靠三件事：唱名、左下右下的頭像（輪到的放大發亮）、
// 發亮的顏色換成那個人的顏色（妍卉粉紅、向澤綠色），可以移動的東西移到輪到的人那一邊（.tside）。
import { speak, isSpeaking } from './voice.js';
import { avatarSvg } from '../art/characters.js';

let ids = [];          // 一起玩：['yh', 'xz']；一個人玩：[]
let cur = null;        // 現在輪到誰
let said = false;      // 這個場景說過「換你囉」了沒
let thank = false;     // 剛換人：下次唱名說「謝謝，換向澤」
let free = false;      // 可以同時一起點的時候
let bar = null;

const SIDE = { yh: 'left', xz: 'right' };   // 姊姊坐左邊、弟弟坐右邊
const START_KEY = 'tfp-turn-start';

const WAIT = `<svg viewBox="0 0 100 100" width="54" height="54"><circle cx="50" cy="50" r="46" fill="#fff"/>
  <rect x="22" y="56" width="56" height="22" rx="11" fill="#ffd9b8"/><rect x="26" y="40" width="20" height="24" rx="10" fill="#ffd9b8"/><rect x="54" y="40" width="20" height="24" rx="10" fill="#ffd9b8"/>
  <path d="M20 84H80" stroke="#c98b5e" stroke-width="5" stroke-linecap="round"/></svg>`;
const POINT = `<svg viewBox="0 0 100 100" width="62" height="62"><g transform="rotate(-30 50 50)"><rect x="40" y="8" width="18" height="50" rx="9" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"/>
  <rect x="26" y="44" width="50" height="44" rx="18" fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"/></g></svg>`;

export function turnsOn() { return ids.length > 1; }
export function whoseTurn() { return turnsOn() ? cur : null; }
export function turnSide() { return turnsOn() ? SIDE[cur] : null; }
export function otherKid(id = cur) { return ids.find((x) => x !== id); }

function paint() {
  const body = document.body;
  body.classList.remove('turn-yh', 'turn-xz', 'turn-free');
  if (!turnsOn()) return;
  body.classList.add(free ? 'turn-free' : `turn-${cur}`);
  if (!bar) return;
  bar.querySelectorAll('.tkid').forEach((n) => {
    n.classList.toggle('on', free || n.dataset.id === cur);
    n.classList.toggle('wait', !free && n.dataset.id !== cur);
  });
}

// 選好頭像時呼叫
export function setupTurns(profile) {
  ids = profile && profile.members.length > 1 ? [...profile.members] : [];
  cur = ids[0] || null;
  free = false;
  paint();
}

// 每進一個場景（或選房間畫面）：在畫面上放兩個頭像；誰先開始輪流換
export function turnsScene(root, { first = null } = {}) {
  bar?.remove();
  bar = null;
  said = false;
  thank = false;
  free = false;
  if (!turnsOn() || !root) { paint(); return; }
  let start = first;
  if (!start) {
    const last = localStorage.getItem(START_KEY);
    start = ids.find((x) => x !== last) || ids[0];
    localStorage.setItem(START_KEY, start);
  }
  cur = start;
  bar = document.createElement('div');
  bar.className = 'turnbar';
  bar.innerHTML = ids.map((id) => `<div class="tkid ${SIDE[id]}" data-id="${id}">
      <div class="face">${avatarSvg(id, 120)}</div><i class="point">${POINT}</i><i class="hold">${WAIT}</i></div>`).join('');
  root.appendChild(bar);
  paint();
}

// 唱名：第一次「妍卉，換你囉」，剛換人時「謝謝，換向澤」，其他時候只叫名字
export async function callTurn(charId, node = null, { line = null } = {}) {
  if (!turnsOn()) return;
  free = false;
  paint();
  const id = line || (!said ? `tg_turn_${cur}` : thank ? `tg_tx_${cur}` : `tg_name_${cur}`);
  said = true;
  thank = false;
  if (charId) await speak(charId, id, { node });
}

// 等角色把話說完再唱名（口令說完，再叫名字，再動作）
export async function untilQuiet(maxMs = 8000) {
  const t0 = Date.now();
  while (isSpeaking() && Date.now() - t0 < maxMs) await new Promise((r) => setTimeout(r, 120));
}
export async function turnCall(charId, node = null) {
  if (!turnsOn()) return;
  await untilQuiet();
  await callTurn(charId, node);
}

// 做完一個動作：換另一個人。給 charId 就馬上說「謝謝，換向澤」；不給就等下一次唱名時說
export async function passTurn(charId = null, node = null) {
  if (!turnsOn()) return;
  cur = otherKid();
  free = false;
  paint();
  if (charId) {
    said = true;
    thank = false;
    await speak(charId, `tg_tx_${cur}`, { node });
  } else {
    thank = true;
  }
}

// 指定輪到誰（例如：一人一題、一起做時問「妍卉做好了嗎」）
export function setTurn(id) {
  if (!turnsOn() || !ids.includes(id)) return;
  cur = id;
  free = false;
  paint();
}

// 可以同時一起點的段落（窗外尋寶、吹蠟燭、放煙火……）
export function freeTurns(on = true) {
  if (!turnsOn()) return;
  free = on;
  paint();
}

// 一起玩時讓活動的總次數是雙數，兩個人次數一樣
export function evenCount(n) { return turnsOn() && n % 2 ? n + 1 : n; }

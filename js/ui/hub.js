// 家：剖開的兩層樓房子，點房間進去；車庫、前院的節慶帳篷與聖誕樹。按回家回到地圖。
import { CHARACTERS, PROFILES } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { turnsScene, callTurn } from '../core/turns.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save } from '../core/store.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import * as weather from '../core/weather.js';
import { hubBack, roomSvg, SPOTS, YARD, GARAGE_CAR, tentSvg } from '../art/hub.js';
import { ICON } from './screens.js';
import * as fest from '../core/festival.js';
import { TREE_ICON } from '../art/xmas.js';
import { HUB_BALLOONS } from '../art/party.js';
import { HUB_NY } from '../art/newyear.js';
import { STAIRS_ROOM, stairsBack, ST, stepFoot } from '../art/stairs.js';

export function showHub(stage, profile) {
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const ph = phase();
    const night = ph === 'night';
    const avatars = profile.members.map((id) => `<div class="av">${avatarSvg(id, 96)}</div>`).join('');
    const bids = fest.birthdayKids();
    const ny = fest.newYear();
    const dec = fest.isDecember();
    const pos = ([x, y, w, h]) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    // 前院：節慶帳篷、聖誕樹，依序放進空位
    const yard = [];
    if (bids.length) yard.push(['party', 'party-room', tentSvg('party')]);
    if (ny) yard.push(['newyear', 'ny-room', tentSvg('newyear')]);
    if (dec) yard.push(['tree', 'treebtn', TREE_ICON]);
    const node = el(`
      <div class="screen hub ${ph} ${night ? 'night' : ''} ${bids.length ? 'bday' : ''} ${ny ? 'ny' : ''}">
        <div class="h-back">${hubBack(ph, weather.current(), { december: dec, newyear: !!ny })}</div>
        ${bids.length ? HUB_BALLOONS : ''}${ny ? HUB_NY : ''}
        ${['bedroom', 'bathroom', 'kitchen', 'door'].map((r) => `<button class="room in" data-room="${r}" style="${pos(SPOTS[r])}">${roomSvg(r, ph, { newyear: !!ny })}</button>`).join('')}
        <button class="room in stairs-room" data-room="stairs" style="${pos(SPOTS.stairs)}">${STAIRS_ROOM(night)}</button>
        <button class="room out garage" data-room="car" style="${pos(SPOTS.car)}">${GARAGE_CAR}</button>
        ${yard.slice(0, YARD.length).map(([room, cls, svg], i) => `<button class="room out yard ${cls}" data-room="${room}" style="${pos(YARD[i])}">${svg}</button>`).join('')}
        <div class="avs">${avatars}</div>
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    let done = false;
    // 一起玩：輪流選房間，被唱名的小孩選
    turnsScene(node);
    const pickLine = async () => { await callTurn(host); if (!done) speak(host, 'hub_pick', { name: profile.name, who: profile.id }); };
    const go = async (room, btn) => {
      if (done) return;
      // 地震演習中只能按回家
      if (node.classList.contains('in-quake') && room !== 'back') return;
      done = true;
      hush();
      sfx('fanfare');
      if (btn) {
        btn.classList.add('chosen');
        const c = centerOf(btn);
        burst(c.x, c.y, { n: 12, kind: 'star', spread: 180 });
        await wait(600);
      }
      resolve(room);
    };
    $$('.room', node).forEach((b) => onTap(b, () => go(b.dataset.room, b)));
    onTap($('.home', node), () => { sfx('tap'); go('back'); });
    // 節慶：帳篷發亮（問候在地圖上）
    if (bids.length) $('.party-room', node)?.classList.add('glow');
    if (ny) $('.ny-room', node)?.classList.add('glow');
    // 樓梯間：還沒玩過的人在，就發亮
    if (profile.members.some((id) => !state.profiles[id].habits?.stairs)) $('.stairs-room', node)?.classList.add('glow');
    pickLine();
  });
}

// 生日當天：五位角色排排站說生日快樂；如果是另一個小孩，奇奇邀他一起準備驚喜
export async function bdGreet(hub, profile, bids) {
  const bid = bids.find((id) => profile.members.includes(id));
  const ids = ['kiki', 'dudu', 'bobo', 'mian', 'gugu'];
  const ov = el(`<div class="bd-greet">
    <svg viewBox="0 0 1200 900">${ids.map((id, i) => characterSvg(id, { x: 60 + i * 225, y: 360, s: 0.85 })).join('')}</svg>
    ${bid ? `<div class="bd-av">${avatarSvg(bid, 170)}</div>` : ''}</div>`);
  hub.appendChild(ov);
  sfx('fanfare');
  const c = centerOf(ov);
  burst(c.x, c.y - 100, { n: 30, kind: 'star', spread: 360 });
  let skip = false;
  onTap(ov, () => { skip = true; hush(); });
  if (bid) {
    for (const id of ids) {
      if (skip) break;
      await speak(id, 'bd_hello', { name: PROFILES[bid].name, who: bid });
    }
  } else {
    await speak('kiki', `bd_sib_hub_${profile.members[0]}`, { name: profile.name, who: profile.id });
  }
  ov.classList.add('away');
  await wait(500);
  ov.remove();
}

// 在家裡換樓層（11/21，John）：每天第一次上樓、第一次下樓，勇勇提醒扶扶手、一階一階走（晚上先開燈）。
// 樓梯間畫面蓋在房子上，小孩自己一階一階走上去（或走下來），大約五秒。
export const ROOM_FLOOR = { bedroom: 2, bathroom: 2, kitchen: 1, door: 1, stairs: 1 };
export async function stairsHint(stage, profile, dir) {
  const today = dateKey();
  const seen = state.stairsHint?.date === today ? state.stairsHint : { date: today };
  if (seen[dir]) return;
  state.stairsHint = { ...seen, [dir]: true };
  save();
  const ph = phase();
  const night = ph === 'night' || ph === 'dusk';
  const kids = profile.members.includes('xz') ? ['xz', ...profile.members.filter((x) => x !== 'xz')] : profile.members;   // 弟弟走前面
  const ov = el(`<div class="stairs-hint ${night ? 'dark' : 'lit'}"><div class="sh-back">${stairsBack(ph)}</div>
    ${kids.map((id) => `<div class="sh-kid">${avatarSvg(id, 110)}</div>`).join('')}</div>`);
  (stage.querySelector('.screen') || stage).appendChild(ov);
  const nodes = [...ov.querySelectorAll('.sh-kid')];
  // 上樓：一樓 → 平台 → 二樓；下樓反過來
  const path = [];
  for (let k = 0; k <= ST.N; k += 1) path.push(stepFoot(1, k));
  path.push([ST.X1 + 120, ST.LAND]);
  for (let k = 1; k <= ST.N; k += 1) path.push(stepFoot(2, k));
  path.push([205, ST.F2]);
  if (dir === 'down') path.reverse();
  const put = (n, [x, y]) => { n.style.left = `${x - 55}px`; n.style.top = `${y - 110}px`; };
  nodes.forEach((n) => put(n, path[0]));
  await wait(60);
  ov.classList.add('show');
  if (night) { await wait(500); sfx('ding'); ov.classList.replace('dark', 'lit'); ov.classList.add('lamp'); }
  const line = speak('yongyong', `sb_${dir}${night ? '_night' : ''}`, { name: profile.name, who: profile.id }).catch(() => {});
  for (let s = 0; s < path.length + 2 * (nodes.length - 1); s += 1) {
    nodes.forEach((n, i) => { const k = s - 2 * i; if (k >= 0 && k < path.length) put(n, path[k]); });
    if (s % 2 === 0) sfx('tap');
    await wait(260);
  }
  await line;
  ov.classList.remove('show');
  await wait(350);
  ov.remove();
}

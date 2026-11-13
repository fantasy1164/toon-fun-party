// 選房間：一個社區，中間是剖開的兩層樓房子，點房間或建築進去。
import { CHARACTERS, PROFILES } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save } from '../core/store.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import * as weather from '../core/weather.js';
import { hubBack, roomSvg, SPOTS, YARD, GARAGE_CAR, schoolExt, farmExt, tentSvg } from '../art/hub.js';
import { ICON } from './screens.js';
import * as fest from '../core/festival.js';
import { TREE_ICON } from '../art/xmas.js';
import { santaPop } from './xmas.js';
import { HUB_BALLOONS } from '../art/party.js';
import { HUB_NY } from '../art/newyear.js';

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
        <button class="room out garage" data-room="car" style="${pos(SPOTS.car)}">${GARAGE_CAR}</button>
        <button class="room out" data-room="school" style="${pos(SPOTS.school)}">${schoolExt(ph)}</button>
        <button class="room out" data-room="farm" style="${pos(SPOTS.farm)}">${farmExt(ph)}</button>
        ${yard.slice(0, YARD.length).map(([room, cls, svg], i) => `<button class="room out yard ${cls}" data-room="${room}" style="${pos(YARD[i])}">${svg}</button>`).join('')}
        <div class="avs">${avatars}</div>
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    let done = false;
    const go = async (room, btn) => {
      if (done) return;
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
    // 12 月第一次進來：聖誕老公公從煙囪探頭打招呼
    const x = fest.isDecember() ? fest.xmas() : null;
    // 生日當天第一次進來：角色們一起說生日快樂（每個頭像每天一次）
    const g = state.bdGreet?.date === dateKey() ? state.bdGreet : { date: dateKey(), seen: [] };
    if (bids.length && !g.seen.includes(profile.id)) {
      g.seen.push(profile.id);
      state.bdGreet = g;
      save();
      bdGreet(node, profile, bids).then(() => { if (!done) $('.party-room', node)?.classList.add('glow'); });
    } else if (ny && !(state.nyGreet?.date === dateKey() && state.nyGreet.seen.includes(profile.id))) {
      const ng = state.nyGreet?.date === dateKey() ? state.nyGreet : { date: dateKey(), seen: [] };
      ng.seen.push(profile.id);
      state.nyGreet = ng;
      save();
      $('.ny-room', node)?.classList.add('glow');
      speak('kiki', `ny_hub_${ny.stage}`, { name: profile.name, who: profile.id });
    } else if (x && fest.day() <= 24 && profile.members.some((id) => !x.greeted[id])) {
      santaPop(node, profile).then(() => { if (!done) speak(host, 'hub_pick', { name: profile.name, who: profile.id }); });
    } else {
      speak(host, 'hub_pick', { name: profile.name, who: profile.id });
    }
  });
}

// 生日當天：五位角色排排站說生日快樂；如果是另一個小孩，奇奇邀他一起準備驚喜
async function bdGreet(hub, profile, bids) {
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

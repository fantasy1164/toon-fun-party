// 街上：診所、明星劇場、超市。點建築進去，點回家的牌子回到房子。
import { el, $, $$, onTap, wait, burst, centerOf } from '../core/dom.js';
import { turnsScene, callTurn } from '../core/turns.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { state } from '../core/store.js';
import { avatarSvg } from '../art/characters.js';
import * as weather from '../core/weather.js';
import { townBack, clinicExt, theaterExt, marketExt, TOWN_SPOTS, HOME_SIGN } from '../art/town.js';
import { ICON } from './screens.js';
import { STARS, FRIEND_MAX } from '../config.js';

export const TOWN_ROOMS = ['clinic', 'theater', 'market'];

// 劇場有新東西：集滿印章要開派對，或有角色剛變成好朋友（還沒看過表演）
export function theaterNews(profile) {
  return profile.members.some((id) => {
    const p = state.profiles[id];
    return (p.partyDue || 0) > 0 || STARS.some((c) => (p.friends?.[c] || 0) >= FRIEND_MAX && !p.starSeen?.[c]);
  });
}

export function showTown(stage, profile) {
  return new Promise((resolve) => {
    const ph = phase();
    const pos = ([x, y, w, h]) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const news = theaterNews(profile);
    const node = el(`
      <div class="screen hub town ${ph}">
        <div class="h-back">${townBack(ph, weather.current())}</div>
        <button class="room out" data-room="clinic" style="${pos(TOWN_SPOTS.clinic)}">${clinicExt(ph)}</button>
        <button class="room out theater-room${news ? ' glow-park' : ''}" data-room="theater" style="${pos(TOWN_SPOTS.theater)}">${theaterExt(ph, { party: profile.members.some((id) => state.profiles[id].partyDue > 0) })}</button>
        <button class="room out" data-room="market" style="${pos(TOWN_SPOTS.market)}">${marketExt(ph)}</button>
        <button class="room out home-sign" data-room="hub" style="${pos(TOWN_SPOTS.home)}">${HOME_SIGN}</button>
        <div class="avs">${profile.members.map((id) => `<div class="av">${avatarSvg(id, 96)}</div>`).join('')}</div>
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    let done = false;
    turnsScene(node);
    const go = async (room, btn) => {
      if (done) return;
      done = true;
      hush();
      sfx(room === 'hub' ? 'tap' : 'fanfare');
      if (btn && room !== 'hub') {
        btn.classList.add('chosen');
        const c = centerOf(btn);
        burst(c.x, c.y, { n: 12, kind: 'star', spread: 180 });
        await wait(600);
      }
      resolve(room);
    };
    $$('.room', node).forEach((b) => onTap(b, () => go(b.dataset.room, b)));
    onTap($('.home', node), () => go('hub'));
    (async () => {
      await wait(300);
      if (done) return;
      await speak('kiki', news ? 'town_news' : 'town_pick', { name: profile.name, who: profile.id });
      if (!done) callTurn('kiki');
    })();
  });
}

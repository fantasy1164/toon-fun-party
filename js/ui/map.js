// 城鎮地圖：一個畫面看完全部。點家進房子；點其他地方，小孩從家門口走過去（遠的地方坐噗噗的車）。
// 同一天去過的地方，第二次走路或坐車會快轉。
import { el, $, $$, onTap, wait, burst, centerOf } from '../core/dom.js';
import { turnsScene, callTurn } from '../core/turns.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, dateKey, hour } from '../core/clock.js';
import { state, save } from '../core/store.js';
import { avatarSvg, kidFigure, useBody } from '../art/characters.js';
import * as weather from '../core/weather.js';
import * as fest from '../core/festival.js';
import { mapBack, homeMini, amuseExt, MAP_SPOTS, walkPath, drivePath, MAP_CAR } from '../art/map.js';
import { schoolExt, farmExt, parkExt, GARAGE_CAR } from '../art/hub.js';
import { clinicExt, theaterExt, marketExt } from '../art/town.js';
import { theaterNews } from './town.js';
import { quakeDue, runQuake } from './quake.js';
import { santaPop } from './xmas.js';
import { bdGreet } from './hub.js';
import { ICON } from './screens.js';
import { HUB_BALLOONS } from '../art/party.js';
import { HUB_NY } from '../art/newyear.js';

// 遊樂園：週末、過年才開，早上 9 點到晚上 7 點
export function amuseOpen() {
  const day = new Date(`${dateKey()}T12:00:00`).getDay();
  const h = hour();
  return ([0, 6].includes(day) || !!fest.newYear()) && h >= 9 && h < 19;
}

// 今天去過哪裡（第二次就快轉）
function tripsToday() {
  if (state.mapTrips?.date !== dateKey()) state.mapTrips = { date: dateKey(), seen: [] };
  return state.mapTrips;
}

export function showMap(stage, profile) {
  return new Promise((resolve) => {
    const ph = phase();
    const night = ph === 'night';
    const bids = fest.birthdayKids();
    const ny = fest.newYear();
    const dec = fest.isDecember();
    const open = amuseOpen();
    const weekend = [0, 6].includes(new Date(`${dateKey()}T12:00:00`).getDay());
    const pos = ([x, y, w, h]) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const news = theaterNews(profile);
    // 家裡有節慶的東西（生日派對、過年、聖誕樹）時，家會發亮
    const homeNews = bids.length || ny;
    const art = {
      farm: farmExt(ph), amuse: amuseExt(ph, open), school: schoolExt(ph), home: homeMini(ph, { newyear: !!ny }),
      car: GARAGE_CAR, park: parkExt(ph), clinic: clinicExt(ph),
      theater: theaterExt(ph, { party: profile.members.some((id) => state.profiles[id].partyDue > 0) }), market: marketExt(ph),
    };
    const glow = { park: weekend && !night, theater: news, home: homeNews, amuse: open };
    const kidsHtml = profile.members.map((id) => (useBody()
      ? `<div class="mw-kid" data-id="${id}">${kidFigure(id, { w: 58 })}</div>`
      : `<div class="mw-kid head" data-id="${id}">${avatarSvg(id, 54)}</div>`)).join('');
    const node = el(`
      <div class="screen hub map ${ph} ${night ? 'night' : ''}">
        <div class="h-back">${mapBack(ph, weather.current(), { december: dec })}</div>
        ${bids.length ? HUB_BALLOONS : ''}${ny ? HUB_NY : ''}
        ${Object.entries(MAP_SPOTS).map(([k, s]) => `<button class="room out map-${k}${glow[k] ? ' glow-park' : ''}${k === 'amuse' && !open ? ' closed' : ''}" data-room="${k}" style="${pos(s.box)}">${art[k]}</button>`).join('')}
        <div class="map-walkers">${kidsHtml}</div>
        <div class="map-car hidden">${MAP_CAR}</div>
        <div class="avs">${profile.members.map((id) => `<div class="av">${avatarSvg(id, 70)}</div>`).join('')}</div>
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    let done = false;
    turnsScene(node);

    // 小孩站在家門口
    const walkers = $$('.mw-kid', node);
    const [hx, hy] = MAP_SPOTS.home.door;
    const place = (n, [x, y], i, ms = 0) => {
      const off = (i - (walkers.length - 1) / 2) * 34;
      n.style.transition = ms ? `left ${ms}ms linear, top ${ms}ms linear` : 'none';
      n.style.left = `${x + off - n.offsetWidth / 2}px`;
      n.style.top = `${y - n.offsetHeight}px`;
    };
    walkers.forEach((n, i) => place(n, [hx, hy + 14], i));

    // 沿著路線走（總時間 ms）
    async function follow(nodes, pts, ms, placeFn) {
      const segs = [];
      for (let i = 1; i < pts.length; i++) segs.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const total = segs.reduce((a, b) => a + b, 0) || 1;
      for (let i = 1; i < pts.length; i++) {
        const t = Math.max(60, Math.round((ms * segs[i - 1]) / total));
        nodes.forEach((n, j) => placeFn(n, pts[i], j, t));
        await wait(t);
      }
    }

    async function travel(room) {
      const trips = tripsToday();
      const again = trips.seen.includes(room);
      if (!again) { trips.seen.push(room); save(); }
      const spot = MAP_SPOTS[room];
      if (spot.far) {
        // 第一次：坐噗噗的車（汽車場景）；同一天第二次：地圖上的車子快快開過去
        if (!again) return { room: 'trip', dest: room };
        walkers.forEach((n) => n.classList.add('hidden'));
        const car = $('.map-car', node);
        const pts = drivePath(room);
        const putCar = (n, [x, y], _i, ms) => {
          n.style.transition = ms ? `left ${ms}ms linear, top ${ms}ms linear` : 'none';
          n.style.left = `${x - 45}px`;
          n.style.top = `${y - 34}px`;
        };
        putCar(car, pts[0], 0, 0);
        car.classList.remove('hidden');
        sfx('horn');
        await follow([car], pts, 1300, putCar);
        return { room };
      }
      node.classList.add('walking');
      sfx('pop');
      await follow(walkers, walkPath(room), again ? 700 : 2200, place);
      node.classList.remove('walking');
      return { room };
    }

    const go = async (room, btn) => {
      if (done) return;
      if (node.classList.contains('in-quake') && room !== 'back') return;
      // 遊樂園沒開
      if (room === 'amuse' && !open) {
        sfx('wrong');
        btn.classList.add('nope');
        setTimeout(() => btn.classList.remove('nope'), 500);
        speak('kiki', 'map_amuse_closed', { name: profile.name, who: profile.id });
        return;
      }
      done = true;
      hush();
      if (room === 'back') { sfx('tap'); resolve({ room }); return; }
      sfx('fanfare');
      btn.classList.add('chosen');
      const c = centerOf(btn);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 160 });
      await wait(450);
      btn.classList.remove('chosen');
      if (room === 'home') { resolve({ room }); return; }
      resolve(await travel(room));
    };
    $$('.room', node).forEach((b) => onTap(b, () => go(b.dataset.room, b)));
    onTap($('.home', node), () => go('back'));

    const pickLine = async () => { await callTurn('kiki'); if (!done) speak('kiki', 'map_pick', { name: profile.name, who: profile.id }); };
    // 第一次進來的問候：生日、過年、聖誕老公公、地震演習、週末去公園
    const x = dec ? fest.xmas() : null;
    const g = state.bdGreet?.date === dateKey() ? state.bdGreet : { date: dateKey(), seen: [] };
    if (bids.length && !g.seen.includes(profile.id)) {
      g.seen.push(profile.id);
      state.bdGreet = g;
      save();
      bdGreet(node, profile, bids).then(() => { if (!done) callTurn('kiki'); });
    } else if (ny && !(state.nyGreet?.date === dateKey() && state.nyGreet.seen.includes(profile.id))) {
      const ng = state.nyGreet?.date === dateKey() ? state.nyGreet : { date: dateKey(), seen: [] };
      ng.seen.push(profile.id);
      state.nyGreet = ng;
      save();
      speak('kiki', `ny_hub_${ny.stage}`, { name: profile.name, who: profile.id }).then(() => { if (!done) callTurn('kiki'); });
    } else if (x && fest.day() <= 24 && profile.members.some((id) => !x.greeted[id])) {
      santaPop(node, profile).then(() => { if (!done) pickLine(); });
    } else if (quakeDue(profile)) {
      runQuake(node, profile, () => done).then(() => { if (!done) pickLine(); });
    } else if (open && !state.amuseHint?.[profile.id + dateKey()]) {
      state.amuseHint = { [profile.id + dateKey()]: true };
      save();
      speak('kiki', 'map_amuse_open', { name: profile.name, who: profile.id }).then(() => { if (!done) pickLine(); });
    } else if (weekend && !night && !state.parkHint?.[profile.id + dateKey()]) {
      state.parkHint = { [profile.id + dateKey()]: true };
      save();
      speak('kiki', 'hub_park', { name: profile.name, who: profile.id }).then(() => { if (!done) pickLine(); });
    } else {
      pickLine();
    }
  });
}

// 地圖（生活區、郊區、山區），各一個畫面。生活區點家進房子；近的地方小孩走過去、遠的坐公車；
// 點火車站選要去哪一區（火車）；郊區坐噗噗的車；山區從車站走到步道口。同一天第二次會快轉。
import { el, $, $$, onTap, wait, burst, centerOf } from '../core/dom.js';
import { turnsScene, callTurn } from '../core/turns.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, dateKey, hour } from '../core/clock.js';
import { state, save } from '../core/store.js';
import { avatarSvg, kidFigure, useBody } from '../art/characters.js';
import * as weather from '../core/weather.js';
import * as fest from '../core/festival.js';
import { mapBack, suburbBack, mountainBack, homeMini, amuseExt, stationExt, libraryExt, dentalExt, fireExt, beachExt, trailExt, ZONES, ZONE_START, ZONE_CARD, walkPath, ridePath, MAP_CAR, MAP_BUS, MAP_TRAIN } from '../art/map.js';
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

// 海邊：夏天（6～9 月）才開（場景之後再做，先一律關著）
export const beachOpen = () => false;

export function showMap(stage, profile, zone = 'city') {
  return new Promise((resolve) => {
    const Z = ZONES[zone];
    const city = zone === 'city';
    const ph = phase();
    const night = ph === 'night';
    const bids = fest.birthdayKids();
    const ny = fest.newYear();
    const dec = fest.isDecember();
    const open = amuseOpen();
    const weekend = [0, 6].includes(new Date(`${dateKey()}T12:00:00`).getDay());
    const pos = ([x, y, w, h]) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const wx = weather.current();
    const art = {
      home: () => homeMini(ph, { newyear: !!ny }), car: () => GARAGE_CAR, station: () => stationExt(ph),
      school: () => schoolExt(ph), library: () => libraryExt(ph), park: () => parkExt(ph), clinic: () => clinicExt(ph), dental: () => dentalExt(ph),
      theater: () => theaterExt(ph, { party: profile.members.some((id) => state.profiles[id].partyDue > 0) }), market: () => marketExt(ph), fire: () => fireExt(ph),
      farm: () => farmExt(ph), amuse: () => amuseExt(ph, open), beach: () => beachExt(ph, beachOpen()), trail: () => trailExt(ph),
    };
    const closed = { amuse: !open, beach: !beachOpen() };
    const glow = city ? { park: weekend && !night, theater: theaterNews(profile), home: bids.length || ny } : { amuse: open };
    const back = city ? mapBack(ph, wx, { december: dec }) : zone === 'suburb' ? suburbBack(ph, wx) : mountainBack(ph, wx);
    const kidsHtml = profile.members.map((id) => (useBody()
      ? `<div class="mw-kid" data-id="${id}">${kidFigure(id, { w: 58 })}</div>`
      : `<div class="mw-kid head" data-id="${id}">${avatarSvg(id, 54)}</div>`)).join('');
    const node = el(`
      <div class="screen hub map zone-${zone} ${ph} ${night ? 'night' : ''}">
        <div class="h-back">${back}</div>
        ${city && bids.length ? HUB_BALLOONS : ''}${city && ny ? HUB_NY : ''}
        ${Object.entries(Z).map(([k, sp]) => `<button class="room out map-${k}${glow[k] ? ' glow-park' : ''}${closed[k] ? ' closed' : ''}" data-room="${k}" style="${pos(sp.box)}">${art[k]()}</button>`).join('')}
        <div class="map-walkers">${kidsHtml}</div>
        <div class="map-car hidden"></div>
        ${city ? `<div class="avs">${profile.members.map((id) => `<div class="av">${avatarSvg(id, 70)}</div>`).join('')}</div>` : ''}
        <div class="map-zones hidden"><div class="mz-row">${['city', 'suburb', 'mountain'].filter((z) => z !== zone).map((z) => `<button class="mz-card" data-zone="${z}">${ZONE_CARD[z]}</button>`).join('')}</div></div>
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic(city ? 'lobby' : zone === 'suburb' ? 'farm' : 'park');
    let done = false;
    turnsScene(node);

    // 小孩站在出發點（生活區是家門口，其他區是車站）
    const walkers = $$('.mw-kid', node);
    const startPt = ZONE_START[zone];
    const place = (n, [x, y], i, ms = 0) => {
      const off = (i - (walkers.length - 1) / 2) * 34;
      n.style.transition = ms ? `left ${ms}ms linear, top ${ms}ms linear` : 'none';
      n.style.left = `${x + off - n.offsetWidth / 2}px`;
      n.style.top = `${y - n.offsetHeight}px`;
    };
    walkers.forEach((n, i) => place(n, [startPt[0], startPt[1] + 14], i));

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
    // 交通工具在地圖上快快開過去
    async function vehicle(svg, pts, ms, w, h, snd) {
      walkers.forEach((n) => n.classList.add('hidden'));
      const car = $('.map-car', node);
      car.innerHTML = svg;
      car.style.width = `${w}px`;
      car.style.height = `${h}px`;
      const put = (n, [x, y], _i, t) => {
        n.style.transition = t ? `left ${t}ms linear, top ${t}ms linear` : 'none';
        n.style.left = `${x - w / 2}px`;
        n.style.top = `${y - h + 10}px`;
      };
      put(car, pts[0], 0, 0);
      car.classList.remove('hidden');
      // 先讓瀏覽器把車放到起點，再開始移動；不然會從上一次的位置斜斜飛過來（例如火車從房子飛到鐵軌）
      void car.offsetWidth;
      sfx(snd);
      await follow([car], pts, ms, put);
    }
    const trainOut = () => vehicle(MAP_TRAIN, [[city ? 190 : 640, city ? 300 : 840], [city ? -260 : 1460, city ? 300 : 840]], 1300, 220, 80, 'horn');

    async function travel(room) {
      const trips = tripsToday();
      const key = `${zone}:${room}`;
      const again = trips.seen.includes(key);
      if (!again) { trips.seen.push(key); save(); }
      const by = Z[room].by || 'walk';
      if (by === 'bus' || by === 'car') {
        if (!again) return { room: 'trip', dest: room, by };
        await vehicle(by === 'bus' ? MAP_BUS : MAP_CAR, ridePath(zone, room), 1300, by === 'bus' ? 120 : 90, by === 'bus' ? 70 : 60, 'horn');
        return { room };
      }
      node.classList.add('walking');
      sfx('pop');
      await follow(walkers, walkPath(zone, room), again ? 700 : 2200, place);
      node.classList.remove('walking');
      return { room };
    }

    // 坐火車去別的區
    async function takeTrain(to) {
      const trips = tripsToday();
      const again = trips.seen.includes('train');
      if (!again) { trips.seen.push('train'); save(); return { room: 'zone', zone: to, trip: true }; }
      await trainOut();
      return { room: 'zone', zone: to };
    }

    const go = async (room, btn) => {
      if (done) return;
      if (node.classList.contains('in-quake') && room !== 'back') return;
      if (closed[room]) {
        sfx('wrong');
        btn.classList.add('nope');
        setTimeout(() => btn.classList.remove('nope'), 500);
        speak('kiki', room === 'beach' ? 'map_beach_closed' : 'map_amuse_closed', { name: profile.name, who: profile.id });
        return;
      }
      if (room === 'station') {
        // 選要去哪一區
        hush();
        sfx('pop');
        $('.map-zones', node).classList.remove('hidden');
        speak('pupu', 'map_train_pick', { name: profile.name, who: profile.id });
        return;
      }
      done = true;
      hush();
      if (room === 'back') {
        sfx('tap');
        if (city) { resolve({ room }); return; }
        // 郊區、山區按回家：坐火車快快回生活區
        await trainOut();
        resolve({ room: 'zone', zone: 'city' });
        return;
      }
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
    $$('.mz-card', node).forEach((b) => onTap(b, async () => {
      if (done) return;
      done = true;
      hush();
      sfx('fanfare');
      const c = centerOf(b);
      burst(c.x, c.y, { n: 14, kind: 'star', spread: 180 });
      await wait(400);
      $('.map-zones', node).classList.add('hidden');
      if (city) await follow(walkers, walkPath('city', 'station'), 900, place);
      resolve(await takeTrain(b.dataset.zone));
    }));
    onTap($('.map-zones', node), (e) => { if (e.target.classList.contains('map-zones')) $('.map-zones', node).classList.add('hidden'); });

    const pickLine = async () => { await callTurn('kiki'); if (!done) speak('kiki', city ? 'map_pick' : `map_pick_${zone}`, { name: profile.name, who: profile.id }); };
    if (!city) { pickLine(); return; }
    // 生活區第一次進來的問候：生日、過年、聖誕老公公、地震演習、遊樂園有開、週末去公園
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

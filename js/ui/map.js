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
import { mapBack, suburbBack, mountainBack, homeMini, amuseExt, stationExt, libraryExt, garageExt, dentalExt, fireExt, beachExt, trailExt, ZONES, ZONE_START, COAST_START, ZONE_CARD, walkPath, ridePath, MAP_CAR, MAP_BUS, MAP_TRAIN } from '../art/map.js';
import { coastBack, twExt, coralExt, worldExt, whaleExt, plazaExt, cableExt, MAP_GONDOLA } from '../art/coast.js';
import { schoolExt, farmExt, parkExt } from '../art/hub.js';
import { clinicExt, theaterExt, marketExt } from '../art/town.js';
import { theaterNews } from './town.js';
import { quakeDue, runQuake } from './quake.js';
import { santaPop } from './xmas.js';
import { bdGreet } from './hub.js';
import { ICON } from './screens.js';
import { islandBack, areaExt, tramExt, snackExt, giftExt, pierExt, MAP_SHIP, AREAS } from '../art/island.js';
import { ZOO_HOURS, SEA_HOURS, SEA_SHOWS, SEA_SHOW_LEN } from '../config.js';
import { HUB_BALLOONS } from '../art/party.js';
import { HUB_NY } from '../art/newyear.js';

// 遊樂園：週末、過年才開，早上 9 點到晚上 7 點
export function amuseOpen() {
  const day = new Date(`${dateKey()}T12:00:00`).getDay();
  const h = hour();
  return ([0, 6].includes(day) || !!fest.newYear()) && h >= 9 && h < 19;
}

// 歡樂島動物園：照臺北市立動物園，每天 9–17 點（16 點停止入園），7、8 月週六到 21 點（20 點停止入園），除夕休園。
// entry：還能不能進去（坐船過去）；不然是園區還開著沒（已經在島上的人）
export function zooOpen({ entry = false } = {}) {
  const d = new Date(`${dateKey()}T12:00:00`);
  if (fest.newYear()?.stage === 'eve') return false;
  const summerSat = d.getDay() === 6 && [6, 7].includes(d.getMonth());
  const H = ZOO_HOURS;
  const end = entry ? (summerSat ? H.summerSatLastEntry : H.lastEntry) : (summerSat ? H.summerSatClose : H.close);
  const h = hour();
  return h >= H.open && h < end;
}

// 歡樂島海生館：照屏東海生館。全年無休；1–6、9–12 月 9:00–17:30；7、8 月平日 9:00–18:00、週末 8:00–18:00；
// 春節初一到初五 8:00–18:00。閉館前一小時停止入館。
export function seaHours() {
  const d = new Date(`${dateKey()}T12:00:00`);
  const H = SEA_HOURS;
  const ny = fest.newYear();
  if (ny && ny.offset >= 0 && ny.offset <= 4) return { open: H.cnyOpen, close: H.cnyClose };
  if ([6, 7].includes(d.getMonth())) return { open: [0, 6].includes(d.getDay()) ? H.summerWeekendOpen : H.summerOpen, close: H.summerClose };
  return { open: H.open, close: H.close };
}
// entry：還能不能進館（停止入館後就不行）；不然是還開著沒
export function seaOpen({ entry = false } = {}) {
  const { open, close } = seaHours();
  const h = hour();
  return h >= open && h < (entry ? close - SEA_HOURS.entryBefore : close);
}
// 為什麼不能進館：early（還沒開，9 點或 8 點開）、entry（停止入館了）、night（閉館了）
export function seaClosedWhy() {
  const { open, close } = seaHours();
  const h = hour();
  if (h < open) return open === 8 ? 'early8' : 'early9';
  if (h < close) return 'entry';
  return 'night';
}
// 現在有沒有某個定時活動（觸摸池、餵食）：回傳那一場的開始時間；沒有就 null
export function seaShowNow(kind) {
  const h = hour();
  return SEA_SHOWS[kind].find((t) => h >= t && h < t + SEA_SHOW_LEN) ?? null;
}
// 下一場什麼時候（今天還有的話），沒有就 null
export function seaShowNext(kind) {
  const h = hour();
  return SEA_SHOWS[kind].find((t) => t > h) ?? null;
}
// 坐船去歡樂島：動物園或海生館還能進去就開船
export const islandOpen = () => zooOpen({ entry: true }) || seaOpen({ entry: true });

// 今天去過哪裡（第二次就快轉）
function tripsToday() {
  if (state.mapTrips?.date !== dateKey()) state.mapTrips = { date: dateKey(), seen: [] };
  return state.mapTrips;
}

// 海邊：夏天（6～9 月）才開（場景之後再做，先一律關著）
export const beachOpen = () => false;

export function showMap(stage, profile, zone = 'city', { arrive = null } = {}) {
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
      home: () => homeMini(ph, { newyear: !!ny }), car: () => garageExt(ph), station: () => stationExt(ph),
      school: () => schoolExt(ph), library: () => libraryExt(ph), park: () => parkExt(ph), clinic: () => clinicExt(ph), dental: () => dentalExt(ph),
      theater: () => theaterExt(ph, { party: profile.members.some((id) => state.profiles[id].partyDue > 0) }), market: () => marketExt(ph), fire: () => fireExt(ph),
      farm: () => farmExt(ph), amuse: () => amuseExt(ph, open), beach: () => beachExt(ph, beachOpen()), trail: () => trailExt(ph),
      pier: () => pierExt(ph, { closed: zone === 'suburb' && !islandOpen(), side: zone === 'suburb' ? 'suburb' : 'island' }),
      tram: () => tramExt(ph), snack: () => snackExt(ph), gift: () => giftExt(ph),
      cable: () => cableExt(ph, { side: zone === 'island' ? 'zoo' : 'coast' }),
      tw: () => twExt(ph), coral: () => coralExt(ph), world: () => worldExt(ph), whale: () => whaleExt(ph), plaza: () => plazaExt(ph),
      ...Object.fromEntries(Object.keys(AREAS).map((a) => [a, () => areaExt(a, ph)])),
    };
    const zooUp = zooOpen();
    const seaIn = seaOpen({ entry: true });
    const closed = zone === 'island'
      ? Object.fromEntries(['tram', 'snack', 'gift', ...Object.keys(AREAS)].map((k) => [k, !zooUp]))
      : zone === 'coast'
        ? { tw: !seaIn, coral: !seaIn, world: !seaIn, plaza: !seaOpen(), whale: true, cable: !zooOpen({ entry: true }) }
        : { amuse: !open, beach: !beachOpen(), pier: zone === 'suburb' && !islandOpen() };
    const glow = city ? { park: weekend && !night, theater: theaterNews(profile), home: bids.length || ny } : { amuse: open };
    const back = city ? mapBack(ph, wx, { december: dec }) : zone === 'suburb' ? suburbBack(ph, wx) : zone === 'island' ? islandBack(ph, wx) : zone === 'coast' ? coastBack(ph, wx) : mountainBack(ph, wx);
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
    playMusic(city ? 'lobby' : zone === 'suburb' ? 'farm' : zone === 'island' ? 'zoo' : zone === 'coast' ? 'sea' : 'park');
    let done = false;
    const guide = zone === 'island' ? 'sensen' : zone === 'coast' ? 'lulu' : 'kiki';
    turnsScene(node);

    // 小孩站在出發點（生活區是家門口，其他區是車站）
    const walkers = $$('.mw-kid', node);
    // 海岸區：坐船來的站在碼頭，坐纜車下來的站在纜車站
    const from = zone === 'coast' ? (arrive === 'cable' ? 'cable' : 'pier') : null;
    const startPt = zone === 'coast' ? COAST_START[from] : ZONE_START[zone];
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
    // 郵輪：從停在碼頭的那艘船出發（同位置、同大小），郊區沿著海灣往右出海；海岸區往右下開走
    const shipOut = async () => {
      const pier = $('.room[data-room="pier"]', node);
      pier?.classList.add('ship-gone');
      if (zone === 'coast') await vehicle(MAP_SHIP, [[1037, 871], [1140, 900], [1340, 920]], 1500, 97, 66, 'horn');
      else await vehicle(MAP_SHIP, [[1108, 713], [1200, 713], [1420, 713]], 1400, 155, 105, 'horn');
    };
    // 纜車：動物園那邊往下開走（去海生館）；海岸區那邊往左上開走（去動物園）
    const cableOut = async () => {
      $('.room[data-room="cable"]', node)?.classList.add('ship-gone');
      if (zone === 'island') await vehicle(MAP_GONDOLA, [[600, 900], [600, 1080]], 1400, 70, 77, 'gondola');
      else await vehicle(MAP_GONDOLA, [[150, 250], [215, -120]], 1400, 70, 77, 'gondola');
    };
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
      await follow(walkers, walkPath(zone, room, from), again ? 700 : 2200, place);
      node.classList.remove('walking');
      return { room };
    }

    // 坐纜車（第一次是纜車場景，同一天第二次快轉）：動物園往下到海生館、海生館往上到動物園
    async function takeCable() {
      const trips = tripsToday();
      const down = zone === 'island';
      if (!trips.seen.includes('cable')) { trips.seen.push('cable'); save(); return { room: 'cable', dir: down ? 'down' : 'up' }; }
      await cableOut();
      return down ? { room: 'zone', zone: 'coast', arrive: 'cable' } : { room: 'zone', zone: 'island' };
    }

    // 坐郵輪去歡樂島（第一次是郵輪場景，同一天第二次快轉）
    async function takeShip() {
      const trips = tripsToday();
      const again = trips.seen.includes('ship');
      if (!again) { trips.seen.push('ship'); save(); return { room: 'ship', zone: 'coast' }; }
      await shipOut();
      return { room: 'zone', zone: 'coast', arrive: 'pier' };
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
        let line = room === 'beach' ? 'map_beach_closed' : room === 'amuse' ? 'map_amuse_closed' : room === 'pier' ? 'map_island_closed' : 'map_zoo_closed';
        if (zone === 'coast') line = room === 'whale' ? 'sea_whale_closed' : room === 'cable' ? 'map_zoo_closed' : `sea_closed_${seaClosedWhy()}`;
        speak(guide, line, { name: profile.name, who: profile.id });
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
        // 郊區、山區按回家：坐火車快快回生活區（歡樂島：動物園先坐纜車、海岸區坐船）
        if (zone === 'island') await cableOut(); else if (zone === 'coast') await shipOut(); else await trainOut();
        resolve({ room: 'zone', zone: 'city' });
        return;
      }
      // 碼頭：郊區坐船去歡樂島（海岸區）；海岸區坐船回郊區
      if (room === 'pier') {
        sfx('fanfare');
        node.classList.add('walking');
        await follow(walkers, walkPath(zone, 'pier', from), 1200, place);
        node.classList.remove('walking');
        if (zone === 'coast') { await shipOut(); resolve({ room: 'zone', zone: 'suburb' }); return; }
        resolve(await takeShip());
        return;
      }
      // 纜車站：動物園往下去海生館；海岸區往上去動物園
      if (room === 'cable') {
        sfx('fanfare');
        node.classList.add('walking');
        await follow(walkers, walkPath(zone, 'cable', from), 1200, place);
        node.classList.remove('walking');
        resolve(await takeCable());
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

    const pickLine = async () => { await callTurn(guide); if (!done) speak(guide, city ? 'map_pick' : `map_pick_${zone}`, { name: profile.name, who: profile.id }); };
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

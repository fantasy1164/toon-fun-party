// 農場：小羊棉棉。白天：餵動物 → 撿雞蛋、擠牛奶 → 小菜園（跟著真實天數長大）。下午 5 點以後：數羊。
import { REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, rainOn, rainOff, waterOn, waterOff } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot, dateKey } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import {
  farmBack, ANIMALS, DIET, FOOD, foodSvg, animalSvg, NEST, EGG, BUCKET, BASKET, MILK_BOTTLE, BREAKFAST,
  CROPS, HARVEST_ITEM, plotSvg, plantSvg, SEED, CAN, SHEEP, nightField,
} from '../art/farm.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const host = (x, y, s, cls = '') => `<div class="f-host ${cls}" style="left:${x}px;top:${y}px;width:${240 * s}px;height:${320 * s}px">
  <svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg('mian')}</svg></div>`;

// 從種下那天算起過了幾天（用遊戲時鐘的日期，測試時可改日期）
function daysSince(key) {
  const a = new Date(`${key}T12:00:00`);
  const b = new Date(`${dateKey()}T12:00:00`);
  return Math.max(0, Math.round((b - a) / 86400000));
}
export function gardenStage(g) {
  return g ? Math.min(5, daysSince(g.planted)) : -1;
}

export function mountFarm(stage, opts) {
  return hour() >= 17 ? mountNight(stage, opts) : mountDay(stage, opts);
}

// ================= 白天 =================
function mountDay(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const wx = weather.current();
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  const animals = hard ? [['chick', 300], ['cow', 560], ['rabbit', 820], ['pig', 1060]] : [['chick', 330], ['cow', 650], ['rabbit', 960]];
  const as = hard ? 0.8 : 1;
  const foods = hard ? ['corn', 'grass', 'carrot', 'potato'] : ['corn', 'grass', 'carrot'];
  const plots = profile.members.length > 1 ? [[profile.members[0], 560], [profile.members[1], 900]] : [[profile.members[0], 730]];

  const root = el(`
    <div class="screen scene farm ${ph}">
      <div class="f-layer">${farmBack(ph, wx)}</div>
      <div class="view pen">
        ${animals.map(([a, x]) => `<div class="animal" data-a="${a}" style="left:${x - 150 * as}px;top:${640 - 260 * as}px">${animalSvg(a, as)}<div class="heart hidden"></div></div>`).join('')}
        <div class="tray">${shuffle(foods).map((f) => `<button class="round-btn food" data-f="${f}">${foodSvg(f, 104)}</button>`).join('')}</div>
      </div>
      <div class="view barn off">
        <div class="nest">${NEST}</div>
        <div class="eggs">${[...Array(hard ? 5 : 3)].map((_, i, arr) => `<button class="egg" data-i="${i}" style="left:${370 - (arr.length - 1) * 34 + i * 68 - 30}px">${EGG}</button>`).join('')}</div>
        <div class="animal hen" data-a="chick" style="left:${370 - 120}px;top:${612 - 216}px">${animalSvg('chick', 0.8)}</div>
        <div class="animal cowb" data-a="cow" style="left:${900 - 150 * 0.9}px;top:${660 - 260 * 0.9}px">${animalSvg('cow', 0.9)}</div>
        <div class="bucket">${BUCKET}</div>
        <button class="udder-hit"></button>
        <div class="basket">${BASKET}</div>
      </div>
      <div class="view garden off">
        ${plots.map(([id, x]) => `<div class="plot" data-id="${id}" style="left:${x - 160}px;top:${640 - 290}px"><div class="plot-art"></div>
          ${profile.members.length > 1 ? `<div class="tag">${avatarSvg(id, 70)}</div>` : ''}</div>`).join('')}
        <button class="round-btn canbtn hidden">${CAN}</button>
        <div class="seeds hidden">${CROPS.map((c) => `<button class="round-btn seed" data-c="${c}">${SEED[c]}</button>`).join('')}</div>
      </div>
      ${host(10, 560, 0.8)}
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="light ${ph}"></div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const mian = $('.f-host', root);

  let alive = true;
  let mode = 'intro';
  let timeUp = false;
  const cleanups = [];
  const say = (line) => speak('mian', line, { name: profile.name, who: profile.id, node: mian });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 450);
  }
  function tapOnce(node) {
    return new Promise((resolve) => {
      const h = (e) => { e.preventDefault(); node.removeEventListener('pointerdown', h); resolve(); };
      node.addEventListener('pointerdown', h);
      cleanups.push(() => { node.removeEventListener('pointerdown', h); resolve(); });
    });
  }
  function rectOf(node) {
    const sr = stage.getBoundingClientRect();
    const k = sr.width / 1200;
    const r = node.getBoundingClientRect();
    return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
  }
  async function fly(html, from, to, ms = 500) {
    const f = el(`<div class="flyer" style="left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px">${html}</div>`);
    root.appendChild(f);
    void f.getBoundingClientRect();
    f.style.transition = `transform ${ms}ms cubic-bezier(.3,1.2,.5,1)`;
    f.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${to.w / from.w})`;
    await wait(ms + 20);
    f.remove();
  }
  function showView(v) {
    $$('.view', root).forEach((n) => n.classList.toggle('off', !n.classList.contains(v)));
    sfx('whoosh');
  }

  // ---------- 一、餵動物 ----------
  async function feed() {
    await say('f_hello');
    guard();
    await say(hard ? 'f_feed_hard' : 'f_feed_easy');
    guard();
    const tray = $('.tray', root);
    for (const [a] of shuffle(animals)) {
      const d = DIET[a];
      const node = $(`.pen .animal[data-a="${a}"]`, root);
      node.classList.add('ask');
      sfx(d.sound);
      await say(d.ask);
      guard();
      if (!hard) $$('.food', tray).forEach((b) => b.classList.toggle('glow', b.dataset.f === d.food));
      tray.classList.add('active');
      const chosen = await new Promise((resolve) => {
        let busy = false;
        const h = async (e) => {
          const b = e.target.closest('.food');
          if (!b || busy) return;
          e.preventDefault();
          if (b.dataset.f !== d.food) {
            busy = true;
            sfx('wrong');
            flash(b, 'nope');
            flash(node, 'nope');
            await say(d.hint);
            busy = false;
            $$('.food', tray).forEach((x) => x.classList.toggle('glow', x.dataset.f === d.food));
            return;
          }
          tray.removeEventListener('pointerdown', h);
          resolve(b);
        };
        tray.addEventListener('pointerdown', h);
        cleanups.push(() => { tray.removeEventListener('pointerdown', h); resolve(null); });
      });
      guard();
      tray.classList.remove('active');
      $$('.food', tray).forEach((x) => x.classList.remove('glow'));
      const from = rectOf(chosen);
      const ar = rectOf(node);
      const mouth = a === 'cow' ? { x: ar.x + ar.w * 0.02, y: ar.y + ar.h * 0.35 } : a === 'pig' ? { x: ar.x + ar.w * 0.1, y: ar.y + ar.h * 0.45 } : { x: ar.x + ar.w * 0.2, y: ar.y + ar.h * 0.3 };
      await fly(foodSvg(d.food, 104), from, { x: mouth.x, y: mouth.y, w: 50, h: 50 }, 520);
      guard();
      node.classList.remove('ask');
      node.classList.add('eat');
      sfx('munch');
      await pause(900);
      node.classList.remove('eat');
      node.classList.add('full');
      $('.heart', node).classList.remove('hidden');
      sfx(d.sound);
      const c = centerOf(node);
      burst(c.x, c.y - 60, { n: 8, kind: 'star', spread: 90 });
      await say(hard ? d.en : pick(['praise1', 'praise2', 'praise3']));
      guard();
    }
    sfx('fanfare');
    await say('f_fed');
    guard();
  }

  // ---------- 二、撿雞蛋、擠牛奶 ----------
  async function barn() {
    showView('barn');
    await pause(500);
    const hen = $('.barn .hen', root);
    await say('f_barn');
    guard();
    hen.classList.add('glow-a');
    await tapOnce(hen);
    guard();
    hen.classList.remove('glow-a');
    hen.classList.add('hop');
    sfx('cluck');
    await pause(700);
    await say('f_eggs');
    guard();
    const basket = $('.basket', root);
    const eggs = $$('.egg', root);
    eggs.forEach((e) => e.classList.add('glow'));
    let n = 0;
    await new Promise((resolve) => {
      eggs.forEach((e) => onTap(e, async () => {
        if (e.classList.contains('taken')) return;
        e.classList.add('taken');
        n += 1;
        const from = rectOf(e);
        sfx('pop');
        const br = rectOf(basket);
        fly(EGG, from, { x: br.x + 40 + (n % 3) * 40, y: br.y + 30, w: 40, h: 46 }, 480).then(() => {
          $('.in', basket).insertAdjacentHTML('beforeend', `<ellipse cx="${50 + (n * 37) % 130}" cy="${66 - (n % 2) * 8}" rx="18" ry="22" fill="#fff6e6" stroke="#e8d8b8" stroke-width="3"/>`);
        });
        say(`m_n${n}`);
        if (n === eggs.length) resolve();
      }));
      cleanups.push(() => resolve());
    });
    guard();
    await pause(900);
    // 擠牛奶：按住或一直點乳房
    await say('f_milk');
    guard();
    const hit = $('.udder-hit', root);
    const cow = $('.barn .cowb', root);
    const milk = $('.bucket .milk', root);
    hit.classList.add('glow');
    let fill = 0;
    await new Promise((resolve) => {
      let timer = null;
      const add = (v) => {
        fill = Math.min(100, fill + v);
        milk.setAttribute('y', String(130 - fill));
        sfx('squirt');
        if (fill >= 100) { stop(); resolve(); }
      };
      const stop = () => { clearInterval(timer); timer = null; cow.classList.remove('milking'); };
      hit.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (fill >= 100) return;
        cow.classList.add('milking');
        add(10);
        clearInterval(timer);
        timer = setInterval(() => add(6), 220);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => hit.addEventListener(ev, stop));
      cleanups.push(() => { stop(); resolve(); });
    });
    guard();
    hit.classList.remove('glow');
    hit.classList.add('hidden');
    sfx('moo');
    await say('f_milk_done');
    guard();
    await fly(MILK_BOTTLE, rectOf($('.bucket', root)), { ...rectOf(basket), w: 50, h: 75 }, 520);
    $('.in', basket).insertAdjacentHTML('beforeend', `<g transform="translate(150 6) scale(.8)">${MILK_BOTTLE.replace('<svg ', '<svg x="0" y="0" ')}</g>`);
    guard();
    // 會變成早餐
    const card = el(`<div class="breakfast">${BREAKFAST}</div>`);
    root.appendChild(card);
    sfx('sparkle');
    await say('f_food_from');
    guard();
    card.classList.add('away');
    await pause(500);
    card.remove();
  }

  // ---------- 三、小菜園 ----------
  function drawPlot(id) {
    const g = state.profiles[id].garden || null;
    const st = gardenStage(g);
    $(`.plot[data-id="${id}"] .plot-art`, root).innerHTML = plotSvg(g?.crop, st);
    return st;
  }
  async function plantFor(id) {
    const plot = $(`.plot[data-id="${id}"]`, root);
    plot.classList.add('glow-p');
    await say('f_plant_pick');
    guard();
    const seeds = $('.seeds', root);
    seeds.classList.remove('hidden');
    const crop = await new Promise((resolve) => {
      $$('.seed', seeds).forEach((b) => onTap(b, () => resolve(b.dataset.c)));
      cleanups.push(() => resolve(null));
    });
    guard();
    seeds.classList.add('hidden');
    seeds.innerHTML = CROPS.map((c) => `<button class="round-btn seed" data-c="${c}">${SEED[c]}</button>`).join('');
    sfx('pop');
    plot.classList.remove('glow-p');
    state.profiles[id].garden = { crop, planted: dateKey() };
    save();
    drawPlot(id);
    plot.classList.add('sprout');
    setTimeout(() => plot.classList.remove('sprout'), 600);
    const c = centerOf(plot);
    burst(c.x, c.y + 60, { n: 8, kind: 'star', spread: 80 });
  }
  async function garden() {
    showView('garden');
    const ids = plots.map(([id]) => id);
    const stages = Object.fromEntries(ids.map((id) => [id, drawPlot(id)]));
    await pause(500);
    await say('f_garden');
    guard();
    let planted = false;
    // 可以採收的先採收
    for (const id of ids.filter((x) => stages[x] >= 5)) {
      const plot = $(`.plot[data-id="${id}"]`, root);
      const crop = state.profiles[id].garden.crop;
      plot.classList.add('glow-p');
      await say('f_ripe');
      guard();
      await tapOnce(plot);
      guard();
      plot.classList.remove('glow-p');
      plot.classList.add('pull');
      sfx('boing');
      await pause(500);
      const item = HARVEST_ITEM[crop];
      addItem(id, item);
      state.profiles[id].garden = null;
      save();
      const gift = el(`<div class="gift"><div class="card">${itemSvg(item, 210)}${ids.length > 1 ? `<div class="owner">${avatarSvg(id, 98)}</div>` : ''}</div></div>`);
      root.appendChild(gift);
      plot.classList.remove('pull');
      drawPlot(id);
      sfx('fanfare');
      await say(`f_harvest_${crop}`);
      guard();
      gift.classList.add('away');
      await pause(650);
      gift.remove();
      stages[id] = -1;
      await say('f_again');
      guard();
    }
    // 還沒種的就種
    for (const id of ids.filter((x) => stages[x] < 0)) {
      await plantFor(id);
      stages[id] = 0;
      planted = true;
    }
    if (planted) await say('f_planted');
    else {
      const best = Math.max(...ids.map((x) => stages[x]));
      await say(`f_grow${best}`);
    }
    guard();
    // 澆水（下雨天就不用）
    if (wet) {
      await say('f_rain_water');
      guard();
      return;
    }
    await say('f_water');
    guard();
    const can = $('.canbtn', root);
    can.classList.remove('hidden');
    can.classList.add('glow');
    await tapOnce(can);
    guard();
    can.classList.remove('glow');
    root.classList.add('watering');
    waterOn();
    await pause(1600);
    waterOff();
    root.classList.remove('watering');
    can.classList.add('hidden');
    $$('.plot', root).forEach((p) => { p.classList.add('happy'); setTimeout(() => p.classList.remove('happy'), 1200); });
    sfx('sparkle');
    await say(pick(['praise1', 'praise2', 'praise3']));
    guard();
  }

  // ---------- 給獎 ----------
  async function celebrate() {
    const slot = currentSlot(REWARD_SLOTS.farm, hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `farm_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, 'mian');
        addItem(id, item);
        claim(id, `farm_${slot}`);
        return { id, item };
      });
      save();
      const cards = gifts.map((g) => `
        <div class="card">${itemSvg(g.item, 210)}
          ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
      const node = el(`<div class="gift">${cards}</div>`);
      root.appendChild(node);
      sfx('sparkle');
      await say('gift');
      await pause(600);
      node.classList.add('away');
      await pause(650);
      node.remove();
    } else {
      await say('practice');
    }
    guard();
    await say('f_mission');
  }

  async function main() {
    mode = 'act';
    await feed();
    await pause(500);
    await barn();
    await pause(400);
    await garden();
    await celebrate();
    mode = 'done';
    if (timeUp) await goodbye();
  }
  async function goodbye() {
    mode = 'end';
    await say(weather.niceOutside(ph) ? 'bye_sunny' : 'bye');
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }
  function destroy() {
    if (!alive) return;
    alive = false;
    cleanups.forEach((fn) => fn());
    waterOff();
    rainOff();
    hush();
  }
  onTap($('.hud .home', root), () => {
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  if (wet) rainOn(wx.kind === 'storm');
  playMusic('farm');
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });
  return {
    destroy,
    hostChar: 'mian',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'done') goodbye();
    },
  };
}

// ================= 晚上：數羊 =================
function mountNight(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const wx = weather.current();
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  const total = hard ? 10 : 5;
  const root = el(`
    <div class="screen scene farm night-farm">
      <div class="f-layer">${nightField(ph, wx)}</div>
      <div class="flock"></div>
      <button class="sheep-btn">${SHEEP}</button>
      ${host(960, 520, 0.8, 'sleepy')}
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const mian = $('.f-host', root);
  const btn = $('.sheep-btn', root);
  const flock = $('.flock', root);
  let alive = true;
  let mode = 'intro';
  let timeUp = false;
  let count = 0;
  let busy = true;
  const say = (line) => speak('mian', line, { name: profile.name, who: profile.id, node: mian });

  onTap(btn, async () => {
    if (busy || !alive || count >= total) return;
    busy = true;
    count += 1;
    btn.classList.remove('glow');
    btn.classList.add('jump');
    sfx('boing');
    setTimeout(() => sfx('baa'), 350);
    await wait(900);
    if (!alive) return;
    btn.classList.remove('jump');
    const i = count - 1;
    flock.insertAdjacentHTML('beforeend', `<div class="fsheep" style="left:${650 + (i % 5) * 76}px;top:${400 + Math.floor(i / 5) * 60}px">${SHEEP}</div>`);
    await say(`m_n${count}`);
    if (!alive) return;
    if (count < total) {
      btn.classList.add('glow');
      busy = false;
      return;
    }
    btn.classList.add('hidden');
    sfx('fanfare');
    await say('f_count_en');
    await say(hard ? 'f_en_count10' : 'f_en_count5');
    if (!alive) return;
    await say('f_sleepy');
    if (!alive) return;
    mian.classList.remove('sleepy');
    mian.classList.add('asleep');
    sfx('snore');
    mode = 'idle';
    if (timeUp) goodbye();
  });

  async function intro() {
    await say(wet ? 'f_night_rain' : 'f_night');
    if (!alive) return;
    busy = false;
    mode = 'act';
    btn.classList.add('glow');
  }
  async function goodbye() {
    if (mode === 'end' || !alive) return;
    mode = 'end';
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }
  function destroy() {
    if (!alive) return;
    alive = false;
    rainOff();
    hush();
  }
  onTap($('.hud .home', root), () => {
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });
  if (wet) rainOn(wx.kind === 'storm');
  playMusic('lullaby');
  intro();
  return {
    destroy,
    hostChar: 'mian',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'idle') goodbye();
    },
  };
}

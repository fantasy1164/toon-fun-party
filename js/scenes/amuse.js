// 遊樂園：長頸鹿高高（穿制服的工作人員），奇奇陪著，嘟嘟會插隊。週末、過年才開。
// 買票（6 歲用硬幣付剛好十元）→ 蓋入園章 → 量身高（6 歲坐雲霄飛車、3 歲還不夠高去坐旋轉木馬）
// → 排隊（嘟嘟插隊要提醒）→ 摩天輪最高處找到家 → 氣球只選一個 → 走失演練（每天一次）→ 丟垃圾 → 煙火、閉園。
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save } from '../core/store.js';
import { PROFILES } from '../config.js';
import { avatarSvg } from '../art/characters.js';
import * as weather from '../core/weather.js';
import { amuseBack, wheelSvg, WHEEL, CAROUSEL, HEIGHT_STICK, HEIGHT_SIGN, COASTER_CAR, RIDE_ANIMALS, AM, AM_THING } from '../art/amuse.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { turnsOn, passTurn, whoseTurn } from '../core/turns.js';

const HOST = 'gaogao';
// 雲霄飛車從右邊的月台出發，沿著軌道往左邊開
const TRACK = [[1150, 300], [1100, 230], [1040, 120], [960, 110], [900, 260], [840, 200], [760, 230], [700, 430], [640, 560]];

export function mountAmuse(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const ph = phase();
  const r = WHEEL.r + 40;
  const animals = Object.keys(RIDE_ANIMALS);
  const inner = `
    <div class="am-wheel" style="left:${WHEEL.cx - r}px;top:${WHEEL.cy - r}px;width:${2 * r}px;height:${2 * r}px">${wheelSvg()}</div>
    <div class="am-coaster" style="left:${TRACK[0][0] - 110}px;top:${TRACK[0][1] - 80}px"><div class="am-riders"></div>${COASTER_CAR}</div>
    <div class="am-horses">${animals.map((a, i) => `<button class="am-ride" data-a="${a}" style="animation-delay:-${i * 1.5}s"><svg viewBox="0 -40 100 140" width="100%" height="100%" overflow="visible">${RIDE_ANIMALS[a]}</svg></button>`).join('')}</div>
    <div class="kt-things"><button class="kt-thing am-bin" style="left:820px;top:690px">${AM_THING.bin}</button></div>
    <div class="am-stick" style="left:${HEIGHT_STICK[0]}px;top:${HEIGHT_STICK[1]}px;width:${HEIGHT_STICK[2]}px;height:${HEIGHT_STICK[3]}px">${HEIGHT_SIGN}</div>
    ${charDiv('kiki', 40, 640, 0.52)}
    ${charDiv(HOST, 226, 330, 0.8)}
    ${charDiv('dudu', 1300, 620, 0.52)}
    ${kids.map((id, i) => kidNode(id, 350 + i * 120, 860)).join('')}
    <div class="am-pay hidden"><div class="am-dish"></div><div class="am-coins"></div></div>
    <div class="kt-cards hidden"></div>
    <div class="am-night"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit amuse', back: amuseBack(ph, weather.current()) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const things = $('.kt-things', root);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const home = (i) => [410 + i * 120, 860];

  // ---------- 買票、蓋入園章 ----------
  async function ticket() {
    await host('am_ticket');
    if (hardNow(profile)) await payCoins();
    else {
      const b = thing('am-booth', AM_THING.booth, [60, 470]);
      await host('am_ticket_easy');
      await tap(b);
      guard();
      sfx('coin');
      b.remove();
    }
    sfx('sparkle');
    await host('am_ticket_ok');
    await host('am_stamp');
    const st = thing('am-stamp', AM_THING.stamp, [560, 430]);
    await tap(st);
    guard();
    st.classList.add('press');
    sfx('pop');
    await pause(300);
    st.remove();
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="am-hand">${AM_THING.handStamp}</div>`));
    await host('am_stamp_ok');
  }

  // 6 歲：用 10、5、1 元硬幣湊剛好十元
  async function payCoins() {
    const pay = $('.am-pay', root);
    const dish = $('.am-dish', pay);
    const coins = $('.am-coins', pay);
    const values = shuffle([10, 5, 5, 1, 1, 1, 1, 1]);
    coins.innerHTML = values.map((v, i) => `<button class="am-coin" data-v="${v}" data-i="${i}">${AM_THING.coin(v)}</button>`).join('');
    pay.classList.remove('hidden');
    await host('am_pay');
    await call();
    let sum = 0;
    await new Promise((resolve) => {
      let busy = false;
      $$('.am-coin', coins).forEach((b) => onTap(b, async () => {
        if (busy || b.classList.contains('used')) return;
        b.classList.add('used');
        sum += +b.dataset.v;
        dish.insertAdjacentHTML('beforeend', AM_THING.coin(+b.dataset.v));
        sfx('coin');
        if (sum === 10) { resolve(); return; }
        if (sum > 10) {
          busy = true;
          sfx('wrong');
          await host('am_too_much').catch(() => {});
          sum = 0;
          dish.innerHTML = '';
          $$('.am-coin', coins).forEach((x) => x.classList.remove('used'));
          busy = false;
        }
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    passTurn();
    await host('am_pay_ok');
    pay.classList.add('hidden');
  }

  // ---------- 量身高 ----------
  async function measure() {
    const stick = $('.am-stick', root);
    const tall = [];
    await moveTo(who(HOST), [860, 600], 800);
    guard();
    for (const id of kids) {
      const k = kidEl(id);
      await moveTo(k, [1000, 762], 700);
      guard();
      if (turnsOn() && whoseTurn() !== id) passTurn();
      await host('am_measure');
      await tap(stick);
      guard();
      const ok = PROFILES[id].level === 'hard';
      stick.classList.add(ok ? 'ok' : 'low');
      sfx(ok ? 'fanfare' : 'ding');
      await host(ok ? 'am_tall_ok' : 'am_tall_no');
      stick.classList.remove('ok', 'low');
      if (ok) tall.push(id);
      await moveTo(k, home(kids.indexOf(id)), 600);
      guard();
    }
    return tall;
  }

  // ---------- 雲霄飛車 ----------
  async function coaster(riders) {
    const car = $('.am-coaster', root);
    $('.am-riders', car).innerHTML = [...riders, 'kiki'].map((id) => (id === 'kiki' ? `<div class="am-rider kiki"><svg viewBox="40 10 160 160" width="70" height="70">${who('kiki').querySelector('svg').innerHTML}</svg></div>` : `<div class="am-rider">${avatarSvg(id, 70)}</div>`)).join('');
    riders.forEach((id) => kidEl(id).classList.add('away'));
    who('kiki').classList.add('away');
    car.classList.add('boarding');
    await host('am_coaster');
    const bar = thing('am-bar', AM_THING.bar, [900, 210]);
    await tap(bar);
    guard();
    bar.remove();
    car.classList.add('bar-down');
    sfx('pop');
    await host('am_bar_ok');
    sfx('whoosh');
    for (let i = 1; i < TRACK.length; i++) {
      const [x, y] = TRACK[i];
      car.style.transition = 'left .55s ease-in-out, top .55s ease-in-out, opacity .4s';
      if (i === TRACK.length - 1) car.style.opacity = '0';
      car.style.left = `${x - 110}px`;
      car.style.top = `${y - 80}px`;
      if (i === 5) { sfx('whoosh'); say('kiki', 'am_coaster_yay').catch(() => {}); }
      await pause(560);
    }
    car.style.transition = 'none';
    car.style.left = `${TRACK[0][0] - 110}px`;
    car.style.top = `${TRACK[0][1] - 80}px`;
    car.style.opacity = '';
    car.classList.remove('boarding', 'bar-down');
    $('.am-riders', car).innerHTML = '';
    riders.forEach((id) => kidEl(id).classList.remove('away'));
    who('kiki').classList.remove('away');
    await pause(400);
  }

  // ---------- 旋轉木馬：說哪一隻就點牠 ----------
  async function carousel() {
    const horses = $('.am-horses', root);
    horses.classList.add('spin');
    playMusic('amuse');
    await host('am_carousel');
    const order = shuffle(animals).slice(0, 3);
    for (const a of order) {
      await call();
      await host(`am_find_${a}`);
      const easy = !hardNow(profile);
      const target = $(`.am-ride[data-a="${a}"]`, horses);
      if (easy) target.classList.add('glow');
      await new Promise((resolve) => {
        $$('.am-ride', horses).forEach((b) => onTap(b, () => {
          if (b === target) { resolve(); return; }
          if (!b.classList.contains('found')) { sfx('wrong'); b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 400); }
        }));
        ctl.cleanups.push(() => resolve());
      });
      guard();
      // 坐上去的是剛剛被唱名、點對的那個人（11/21 John：原本固定妍卉先，跟唱名相反）
      const rider = whoseTurn() || kids[0];
      passTurn();
      target.classList.remove('glow');
      target.classList.add('found');
      sfx('sparkle');
      const c = centerOf(target);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 120 });
      target.insertAdjacentHTML('beforeend', `<div class="am-on">${avatarSvg(rider, 54)}</div>`);
      await host('am_found');
    }
    await pause(800);
    horses.classList.remove('spin');
    $$('.am-on', horses).forEach((n) => n.remove());
    $$('.am-ride', horses).forEach((n) => n.classList.remove('found'));
  }

  // ---------- 排隊坐摩天輪：嘟嘟插隊 ----------
  async function queue() {
    await host('am_line');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [330 + i * 110, 820], 700)));
    guard();
    const du = who('dudu');
    await moveTo(du, [900, 820], 900);
    guard();
    await say('dudu', 'am_cut');
    await moveTo(du, [220, 820], 700);
    guard();
    await host('am_cut_tap');
    du.classList.add('glow-c');
    await ctl.tapOnce(du);
    guard();
    du.classList.remove('glow-c');
    sfx('pop');
    await say('dudu', 'am_cut_sorry');
    await moveTo(du, [330 + kids.length * 110, 820], 700);
    guard();
  }

  // ---------- 摩天輪：在最高的地方找到家 ----------
  async function ferris() {
    const wheel = $('.am-wheel', root);
    await host('am_ferris');
    // 小孩、奇奇坐進摩天輪的車廂
    $('.am-mine', wheel).innerHTML = kids.map((id, i) => `<g transform="translate(${(i - (kids.length - 1) / 2) * 30 - 16} 18)">${avatarSvg(id, 32)}</g>`).join('');
    kids.forEach((id) => kidEl(id).classList.add('away'));
    who('kiki').classList.add('away');
    wheel.classList.add('ride');
    sfx('sparkle');
    await pause(2600);
    wheel.classList.add('top');
    await host('am_top');
    await card(AM.house, [AM.school, AM.farm], 'am_top_wrong');
    await host('am_top_ok');
    wheel.classList.remove('top', 'ride');
    $('.am-mine', wheel).innerHTML = '';
    kids.forEach((id) => kidEl(id).classList.remove('away'));
    who('kiki').classList.remove('away');
    await moveTo(who('dudu'), [1300, 820], 900);
  }

  // ---------- 氣球只選一個 ----------
  async function balloon() {
    await say('kiki', 'am_balloon_want');
    await host('am_balloon_one');
    await card(AM.balloon1, [AM.balloons], 'am_balloon_wrong');
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="am-balloon"><svg viewBox="0 0 100 100" width="90" height="90">${AM.balloon1}</svg></div>`));
    await host('am_balloon_ok');
  }

  // ---------- 走失演練（每天一次） ----------
  async function lost() {
    root.classList.add('lost');
    await host('am_lost');
    await card(AM.still, [AM.run], 'am_lost_wrong1');
    await host('am_lost_who');
    await card(AM.staff, [AM.stranger], 'am_lost_wrong2');
    root.classList.remove('lost');
    sfx('sparkle');
    await host('am_lost_ok');
    for (const id of kids) state.profiles[id].amLost = dateKey();
    save();
  }

  // ---------- 爆米花盒子丟垃圾桶 ----------
  async function trash() {
    const pc = thing('am-pop', AM_THING.popcorn, [600, 640]);
    await host('am_trash');
    const bin = $('.am-bin', root);
    await tap(bin);
    guard();
    await moveTo(pc, [865, 740], 600);
    sfx('pop');
    pc.remove();
    await host('am_trash_ok');
  }

  // ---------- 煙火、閉園 ----------
  async function fireworks() {
    await host('am_close');
    root.classList.add('closing');
    const sr = stage.getBoundingClientRect();
    const k = sr.width / 1200;
    for (let i = 0; i < 7; i++) {
      const x = sr.left + (200 + Math.random() * 800) * k;
      const y = sr.top + (90 + Math.random() * 220) * k;
      burst(x, y, { n: 20, kind: 'star', spread: 200 });
      sfx(i % 2 ? 'pop' : 'sparkle');
      if (i === 2) say('kiki', 'am_fire').catch(() => {});
      await pause(650);
    }
  }

  (async () => {
    playMusic('amuse');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('am_hello');
      await say('kiki', 'am_kiki_wow');
      await ticket();
      const tall = await measure();
      if (tall.length) await coaster(tall);
      if (tall.length < kids.length) await host('am_tall_no_ok');
      await carousel();
      playMusic('amuse');
      await queue();
      await ferris();
      await balloon();
      if (kids.some((id) => state.profiles[id].amLost !== dateKey())) await lost();
      await trash();
      await fireworks();
      await host('dn_amuse');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'amuse', series: HOST, say: host });
      await host('am_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return ctl.api;
}

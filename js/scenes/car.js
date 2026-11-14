// 汽車內：繫好安全帶 → 奇奇調皮要提醒 → 路上的紅綠燈與狀況 → 到公園，安全下車。
import { REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, rainOn, rainOff } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import { roadSvg, CABIN, MIRROR, backSeat, beltsSvg, seatLayout, BTN, DOORS } from '../art/car.js';
import { PROFILES } from '../config.js';
import { turnsOn, turnCall, passTurn, whoseTurn, otherKid } from '../core/turns.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

export function mountCar(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  // 一起玩時兩張安全座椅，各自扣自己的
  const kidKeys = seatLayout(profile).kids.map((k) => k.key);
  const kidIdOf = Object.fromEntries(seatLayout(profile).kids.map((k) => [k.key, k.id]));
  const ph = phase();
  const wx = weather.current();

  const root = el(`
    <div class="screen scene car ${ph}">
      <svg class="c-art" viewBox="0 0 1200 900">${CABIN}<g class="road">${roadSvg(ph, wx)}</g>${MIRROR}${backSeat(profile)}</svg>
      <div class="c-belts">${beltsSvg(profile)}</div>
      <div class="drive">
        ${(hard ? ['stop', 'slow', 'go', 'side'] : ['stop', 'go']).map((k) => `<button class="round-btn dbtn" data-k="${k}">${BTN[k]}</button>`).join('')}
      </div>
      <div class="c-doors hidden">
        <button class="round-btn cdoor" data-d="left">${DOORS.left}</button>
        <button class="round-btn cdoor" data-d="right">${DOORS.right}</button>
      </div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const rider = (who) => $(`.rider[data-who="${who}"]`, root);
  const drive = $('.drive', root);

  let alive = true;
  let mode = 'intro';
  let timeUp = false;
  const cleanups = [];
  const say = (who, id) => speak(who, id, { name: profile.name, who: profile.id, node: who === 'kiki' || who === 'dudu' ? rider(who) : null });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }
  function setDriving(on) { root.classList.toggle('driving', on); }
  function light(color) {
    const t = $('.tlight', root);
    t.classList.remove('red', 'yellow', 'green');
    if (color) t.classList.add(color);
  }
  function show(cls, on) { root.classList.toggle(cls, on); }

  // 等小孩按某個駕駛按鈕；按錯會提醒
  async function waitBtn(correct, hintLine) {
    await turnCall('dudu', rider('dudu'));
    guard();
    return new Promise((resolve) => {
      drive.classList.add('active');
      if (!hard) $$('.dbtn', drive).forEach((b) => b.classList.toggle('glow', correct.includes(b.dataset.k)));
      const h = (e) => {
        const b = e.target.closest('.dbtn');
        if (!b) return;
        e.preventDefault();
        if (!correct.includes(b.dataset.k)) {
          sfx('wrong');
          flash(b, 'nope');
          say('dudu', hintLine || 'wrong');
          if (hard) $$('.dbtn', drive).forEach((x) => x.classList.toggle('glow', correct.includes(x.dataset.k)));
          return;
        }
        drive.removeEventListener('pointerdown', h);
        drive.classList.remove('active');
        $$('.dbtn', drive).forEach((x) => x.classList.remove('glow'));
        sfx('tap');
        passTurn();
        resolve(b.dataset.k);
      };
      drive.addEventListener('pointerdown', h);
      cleanups.push(() => { drive.removeEventListener('pointerdown', h); resolve(null); });
    });
  }

  // ---------- 一、繫安全帶 ----------
  async function buckleUp() {
    await say('dudu', 'c_belt');
    if (!hard) await say('dudu', 'c_belt_easy');
    guard();
    // 一起玩：輪流扣，先幫奇奇、嘟嘟，最後各自扣自己的
    const first = whoseTurn();
    const mine = turnsOn() ? [`kid-${first}`, `kid-${otherKid(first)}`] : kidKeys;
    const order = ['kiki', 'dudu', ...mine];
    if (kidKeys.length > 1) await say('dudu', 'c_belt_both');
    const done = new Set();
    await new Promise((resolve) => {
      const glowNext = () => {
        const next = order.find((w) => !done.has(w));
        $$('.buckle', root).forEach((b) => b.classList.toggle('glow', hard ? !done.has(b.dataset.who) : b.dataset.who === next));
      };
      glowNext();
      let calling = turnsOn();
      if (calling) turnCall('dudu', rider('dudu')).then(() => { calling = false; });
      $$('.buckle', root).forEach((b) => onTap(b, async () => {
        const who = b.dataset.who;
        if (done.has(who) || calling) return;
        if (!hard && who !== order.find((w) => !done.has(w))) { flash(b, 'nope'); return; }
        done.add(who);
        sfx('pop');
        $(`.belt.${who}`, root).classList.add('on');
        b.classList.add('done');
        const c = centerOf(b);
        burst(c.x, c.y, { n: 8, kind: 'star', spread: 90 });
        glowNext();
        if (kidKeys.includes(who)) {
          const id = kidIdOf[who];
          await speak('dudu', 'c_kid_ok', { name: PROFILES[id].name, who: kidKeys.length > 1 ? id : profile.id, node: rider('dudu') });
        }
        else await say(who, 'c_click');
        if (done.size === order.length && !hard) { passTurn(); resolve(); return; }
        if (turnsOn() && done.size < order.length) { calling = true; passTurn(); await turnCall('dudu', rider('dudu')); calling = false; }
      }));
      if (hard) {
        // 6 歲版：自己判斷，點「走」時檢查有沒有每個人都扣好
        const h = async (e) => {
          const b = e.target.closest('.dbtn');
          if (!b) return;
          e.preventDefault();
          if (b.dataset.k !== 'go') { flash(b, 'nope'); return; }
          if (done.size < order.length) {
            sfx('wrong');
            await say('dudu', 'c_not_yet');
            return;
          }
          drive.removeEventListener('pointerdown', h);
          resolve();
        };
        drive.classList.add('active');
        drive.addEventListener('pointerdown', h);
        cleanups.push(() => drive.removeEventListener('pointerdown', h));
      }
      cleanups.push(() => resolve());
    });
    guard();
    drive.classList.remove('active');
    if (!hard) {
      await say('kiki', 'c_ready');
      await waitBtn(['go']);
      guard();
    }
  }

  // ---------- 奇奇調皮：站起來、手伸出窗外 ----------
  async function kikiNaughty() {
    const k = rider('kiki');
    k.classList.add('naughty');
    $('.belt.kiki', root).classList.remove('on');
    await say('kiki', 'c_naughty');
    guard();
    await turnCall('dudu', rider('dudu'));
    guard();
    k.classList.add('glow-char');
    await new Promise((resolve) => {
      const h = (e) => { e.preventDefault(); k.removeEventListener('pointerdown', h); resolve(); };
      k.addEventListener('pointerdown', h);
      cleanups.push(() => { k.removeEventListener('pointerdown', h); resolve(); });
    });
    guard();
    passTurn();
    k.classList.remove('glow-char');
    await say('dudu', 'c_sitdown');
    k.classList.remove('naughty');
    $('.belt.kiki', root).classList.add('on');
    sfx('pop');
    await say('kiki', 'c_ok_sit');
  }

  // ---------- 二、路上的狀況 ----------
  async function redLight() {
    show('show-light', true);
    light('red');
    sfx('pop');
    if (hard) await say('kiki', 'c_what'); else await say('dudu', 'c_red');
    await waitBtn(['stop'], 'c_red');
    guard();
    setDriving(false);
    sfx('whoosh');
    await pause(1500);
    light('green');
    sfx('sparkle');
    if (!hard) await say('dudu', 'c_green');
    await waitBtn(['go'], 'c_green');
    guard();
    setDriving(true);
    await pause(1200);
    show('show-light', false);
  }

  async function yellowLight() {
    show('show-light', true);
    light('yellow');
    sfx('pop');
    await say('kiki', 'c_what');
    await waitBtn(['slow', 'stop'], 'c_yellow');
    guard();
    root.classList.add('slowing');
    await say('dudu', 'c_yellow');
    setDriving(false);
    root.classList.remove('slowing');
    await pause(800);
    light('red');
    await pause(1200);
    light('green');
    await waitBtn(['go'], 'c_green');
    guard();
    setDriving(true);
    await pause(1200);
    show('show-light', false);
  }

  async function walkers() {
    show('show-cross', true);
    await pause(600);
    show('show-walkers', true);
    await say('kiki', 'c_what');
    await waitBtn(['stop'], 'c_walker');
    guard();
    setDriving(false);
    await say('dudu', 'c_walker');
    root.classList.add('walking');
    await say('dudu', 'c_cross');
    await pause(1500);
    show('show-walkers', false);
    root.classList.remove('walking');
    await waitBtn(['go'], 'c_green');
    guard();
    setDriving(true);
    await pause(1200);
    show('show-cross', false);
  }

  async function ambulance() {
    show('amb-mirror', true);
    sfx('whoosh');
    await say('kiki', 'c_siren');
    await waitBtn(['side'], 'c_siren');
    guard();
    root.classList.add('pulled');
    setDriving(false);
    show('amb-mirror', false);
    show('amb-pass', true);
    await pause(2200);
    show('amb-pass', false);
    root.classList.remove('pulled');
    await waitBtn(['go'], 'c_green');
    guard();
    setDriving(true);
    await pause(800);
  }

  // ---------- 三、到了，安全下車 ----------
  async function arrive() {
    await pause(1000);
    setDriving(false);
    show('arrived', true);
    sfx('sparkle');
    await say('kiki', 'c_arrive');
    await say('dudu', 'c_unbuckle');
    guard();
    // 解開安全帶（點扣環）
    await new Promise((resolve) => {
      const left = new Set(['kiki', 'dudu', ...kidKeys]);
      $$('.buckle', root).forEach((b) => { b.classList.remove('done'); b.classList.add('glow'); });
      let calling = turnsOn();
      if (calling) turnCall('dudu', rider('dudu')).then(() => { calling = false; });
      $$('.buckle', root).forEach((b) => onTap(b, async () => {
        const who = b.dataset.who;
        if (!left.has(who) || calling) return;
        left.delete(who);
        sfx('pop');
        $(`.belt.${who}`, root).classList.remove('on');
        b.classList.remove('glow');
        b.classList.add('done');
        passTurn();
        if (!left.size) { resolve(); return; }
        if (turnsOn()) { calling = true; await turnCall('dudu', rider('dudu')); calling = false; }
      }));
      cleanups.push(() => resolve());
    });
    guard();
    const doors = $('.c-doors', root);
    doors.classList.remove('hidden');
    if (hard) await say('dudu', 'c_door');
    else { $('.cdoor[data-d="right"]', root).classList.add('glow'); await say('dudu', 'c_door_easy'); }
    guard();
    await turnCall('dudu', rider('dudu'));
    guard();
    await new Promise((resolve) => {
      $$('.cdoor', root).forEach((b) => onTap(b, async () => {
        if (b.dataset.d === 'left') {
          if (!hard) { flash(b, 'nope'); return; }
          sfx('wrong');
          root.classList.add('honk');
          setTimeout(() => root.classList.remove('honk'), 1200);
          await say('dudu', 'c_door_wrong');
          $('.cdoor[data-d="right"]', root).classList.add('glow');
          return;
        }
        passTurn();
        resolve();
      }));
      cleanups.push(() => resolve());
    });
    guard();
    doors.classList.add('hidden');
    sfx('fanfare');
    root.classList.add('out');
    await say('kiki', 'c_out');
  }

  // ---------- 給獎 ----------
  async function showGift(gifts) {
    const cards = gifts.map((g) => `
      <div class="card">${itemSvg(g.item, 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
    const node = el(`<div class="gift">${cards}</div>`);
    root.appendChild(node);
    sfx('sparkle');
    await say('kiki', 'gift');
    await pause(600);
    node.classList.add('away');
    await pause(650);
    node.remove();
  }
  async function celebrate() {
    guard();
    const slot = currentSlot(REWARD_SLOTS.car, hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `car_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, 'kiki');
        addItem(id, item);
        claim(id, `car_${slot}`);
        return { id, item };
      });
      save();
      await showGift(gifts);
    } else {
      await say('kiki', 'practice');
    }
    guard();
    await say('dudu', 'c_mission');
  }

  // ---------- 流程 ----------
  async function main() {
    mode = 'act';
    await say('kiki', 'c_hello');
    guard();
    await buckleUp();
    guard();
    sfx('fanfare');
    setDriving(true);
    playMusic('car');
    await say('kiki', 'c_go');
    await pause(2500);
    await kikiNaughty();
    guard();
    await pause(1500);
    await redLight();
    guard();
    if (hard) {
      await pause(1500); await yellowLight(); guard();
      await pause(1500); await walkers(); guard();
      await pause(1500); await ambulance(); guard();
    } else {
      await pause(1500); await walkers(); guard();
    }
    await arrive();
    guard();
    await celebrate();
    mode = 'done';
    if (timeUp) await goodbye();
  }

  async function goodbye() {
    mode = 'end';
    await say('kiki', weather.niceOutside(ph) ? 'bye_sunny' : 'bye');
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

  if (wx.kind === 'rain' || wx.kind === 'storm') rainOn(wx.kind === 'storm');
  playMusic(ph === 'night' ? 'bath_night' : 'lobby');
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });

  return {
    destroy,
    hostChar: 'kiki',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'done') goodbye();
    },
  };
}

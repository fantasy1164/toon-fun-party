// 地震演習：每個月一次，在選房間畫面突然搖晃。
// 趴下、掩護、穩住 → 搖晃停了 →（6 歲：走樓梯不坐電梯）→ 到空曠的公園 → 真的躲到桌子下面數到十。
import { el, $, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic, stopMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { hour, dateKey } from '../core/clock.js';
import { state, save, recordHabit } from '../core/store.js';
import { callTurn, turnsOn } from '../core/turns.js';
import { QK } from '../art/quake.js';
import { pickCard, hardNow, tapOne } from '../scenes/kit.js';

const URL_FORCE = new URLSearchParams(location.search).has('quake');
let forcedOnce = false;

// 每個月的哪一天演習（3～22 號之間，每個月不一樣）
export function drillDay(month) {
  let h = 0;
  for (const ch of month) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return 3 + (h % 20);
}

export function quakeDue(profile) {
  if ((URL_FORCE && !forcedOnce) || state.quakeForce) return true;
  const h = hour();
  if (h < 8 || h >= 19) return false;
  const k = dateKey();
  const month = k.slice(0, 7);
  if (+k.slice(8, 10) < drillDay(month)) return false;
  return profile.members.some((id) => state.profiles[id].quakeMonth !== month);
}

export async function runQuake(hub, profile, isDone) {
  forcedOnce = true;
  state.quakeForce = false;
  const month = dateKey().slice(0, 7);
  const ov = el(`<div class="quake"><div class="qk-veil"></div><div class="kt-cards qk-cards hidden"></div>
    <div class="qk-count hidden"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="92"/><circle class="fg" cx="100" cy="100" r="92" transform="rotate(-90 100 100)"/></svg>
      <div class="qk-ic"><svg viewBox="0 0 100 100" width="250" height="250">${QK.table}</svg></div></div></div>`);
  hub.appendChild(ov);
  hub.classList.add('in-quake');
  const box = $('.qk-cards', ov);
  const cleanups = [];
  const alive = () => !isDone() && hub.isConnected;
  const guard = () => { if (!alive()) throw new Error('scene-closed'); };
  const say = async (id) => { guard(); await speak('kiki', id, { name: profile.name, who: profile.id }); guard(); };
  const call = async () => { if (turnsOn()) await callTurn('kiki'); guard(); };
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: wrongLine ? () => say(wrongLine) : null, cleanups });
  let rumble = 0;
  const shake = (on) => {
    hub.classList.toggle('quaking', on);
    clearInterval(rumble);
    if (on) { sfx('rumble'); rumble = setInterval(() => sfx('rumble'), 2800); }
  };
  try {
    stopMusic();
    shake(true);
    await wait(900);
    await say('qk_start');
    await say('qk_where');
    await card(QK.table, [QK.door, QK.window], 'qk_wrong');
    for (const [k, line] of [['drop', 'qk_drop'], ['cover', 'qk_cover'], ['hold', 'qk_hold']]) {
      await say(line);
      await card(QK[k], [], null);
    }
    // 躲好了，數到五，搖晃停了
    for (let i = 1; i <= 5; i++) { await say(`n_${i}`); await wait(300); }
    shake(false);
    await say('qk_stop');
    if (profile.level === 'hard' || profile.members.length > 1) {
      await say('qk_stairs');
      await card(QK.stairs, [QK.lift], 'qk_lift_no');
    }
    // 到空曠的地方：公園
    ov.classList.add('see-park');
    await say('qk_out');
    const park = $('.room[data-room="park"]', hub);
    park.classList.add('qk-target');
    await tapOne(park, { call, cleanups });
    guard();
    park.classList.remove('qk-target');
    sfx('sparkle');
    const c = centerOf(park);
    burst(c.x, c.y, { n: 16, kind: 'star', spread: 200 });
    ov.classList.remove('see-park');
    await say('qk_safe');
    // 真的練習一次：躲到桌子下面，數到十
    await say('qk_real');
    const cnt = $('.qk-count', ov);
    const fg = $('.qk-count .fg', ov);
    const C = 2 * Math.PI * 92;
    cnt.classList.remove('hidden');
    for (let i = 1; i <= 10; i++) {
      fg.setAttribute('stroke-dasharray', `${(C * (1 - i / 10)).toFixed(1)} ${C.toFixed(1)}`);
      const t = wait(1000);
      await say(`n_${i}`);
      await t;
    }
    cnt.classList.add('hidden');
    sfx('fanfare');
    burst(window.innerWidth / 2, window.innerHeight / 2, { n: 24, kind: 'star', spread: 300 });
    await say('dn_quake');
    await say('qk_done');
    for (const id of profile.members) state.profiles[id].quakeMonth = month;
    recordHabit(profile.members, 'quake');
    save();
  } catch (e) {
    if (e.message !== 'scene-closed') throw e;
  } finally {
    shake(false);
    cleanups.forEach((f) => f());
    ov.remove();
    hub.classList.remove('in-quake');
    if (alive()) playMusic('lobby');
    else hush();
  }
}

// 消防局：獅子消防隊長勇勇，奇奇陪著。
// 聽出煙霧警報器 → 逃生演練（低姿勢、毛巾摀口鼻、摸門把、不躲衣櫃、走樓梯）→ 打火機交給大人
// → 練習按 119 → 坐消防車出動、用水管滅火 → 給獎、回家找找家裡的警報器和逃生出口。
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { fireBack, DRILL_ROOM, SMOKE, TOWEL, KNOB, keypad, BURNING_HOUSE, FLAME, STEAM, FI } from '../art/fire.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';
import { passTurn } from '../core/turns.js';

const HOST = 'yongyong';
const FLAMES = [[700, 260], [880, 230], [760, 420], [960, 400], [1060, 300]];

export function mountFire(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="fi-drill"><div class="fi-room">${DRILL_ROOM}</div><div class="fi-smoke">${SMOKE}</div></div>
    <div class="fi-fire"><div class="fi-house">${BURNING_HOUSE}</div>${FLAMES.map(([x, y], i) => `<button class="kt-thing fi-flame" data-i="${i}" style="left:${x}px;top:${y}px">${FLAME}</button>`).join('')}</div>
    <div class="fi-phone hidden"><div class="fi-num"></div>${keypad()}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 180, 600, 0.52)}
    ${charDiv(HOST, 830, 330, 0.88)}
    ${kids.map((id, i) => kidNode(id, 400 + i * 130, 870)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit fire', back: fireBack(ph) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    $('.kt-things', root).appendChild(n);
    return n;
  }

  async function alarm() {
    await host('fi_alarm_q');
    sfx('alarm');
    await pause(2400);
    await card(FI.alarm, [FI.doorbell, FI.phone], 'fi_alarm_wrong');
    await host('fi_alarm_ok');
  }

  async function drill() {
    root.classList.add('drill');
    sfx('alarm');
    await pause(800);
    root.classList.add('smoky');
    await host('fi_smoke');
    await card(FI.crawl, [FI.stand], 'fi_smoke_wrong');
    root.classList.add('crawl');
    await host('fi_smoke_ok');
    const tw = thing('fi-towel', TOWEL, [560, 640]);
    await tap(tw);
    guard();
    tw.remove();
    sfx('pop');
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="fi-mask">${TOWEL}</div>`));
    await host('fi_door');
    const kb = thing('fi-knob', KNOB, [130, 410]);
    await tap(kb);
    guard();
    kb.classList.add('hot');
    sfx('wrong');
    await host('fi_door_hot');
    kb.remove();
    await host('fi_hide_q');
    await card(FI.exit, [FI.closet], 'fi_hide_wrong');
    await host('fi_stairs_q');
    await card(FI.stairs, [FI.elevator], 'fi_stairs_wrong');
    sfx('fanfare');
    root.classList.remove('smoky', 'crawl', 'drill');
    $$('.fi-mask', root).forEach((n) => n.remove());
    await host('fi_out_ok');
  }

  async function lighter() {
    await say('kiki', 'fi_kiki_lighter');
    await card(FI.giveAdult, [FI.playFire], 'fi_lighter_wrong');
    await host('fi_lighter_ok');
  }

  // 練習按 1 1 9
  async function dial() {
    const ph2 = $('.fi-phone', root);
    const num = $('.fi-num', ph2);
    const want = [1, 1, 9];
    await host('fi_119');
    ph2.classList.remove('hidden');
    await call();
    let i = 0;
    const easy = !hardNow(profile);
    const hint = () => {
      $$('.fi-key', ph2).forEach((k) => k.classList.remove('glow'));
      if (easy && i < want.length) $(`.fi-key[data-k="${want[i]}"]`, ph2).classList.add('glow');
    };
    hint();
    await new Promise((resolve) => {
      let busy = false;
      $$('.fi-key', ph2).forEach((k) => onTap(k, async () => {
        if (busy) return;
        if (+k.dataset.k === want[i]) {
          sfx('beep');
          i += 1;
          num.textContent = want.slice(0, i).join(' ');
          hint();
          if (i === want.length) resolve();
          return;
        }
        busy = true;
        sfx('wrong');
        await host('fi_119_wrong').catch(() => {});
        i = 0;
        num.textContent = '';
        hint();
        busy = false;
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    passTurn();
    sfx('ding');
    await pause(500);
    await host('fi_119_ok');
    ph2.classList.add('hidden');
  }

  // 坐消防車出動、用水管滅火
  async function hose() {
    await host('fi_go');
    sfx('siren');
    root.classList.add('rush');
    await pause(1800);
    root.classList.add('fireside');
    root.classList.remove('rush');
    await moveTo(who(HOST), [470, 820], 10);
    await moveTo(who('kiki'), [130, 820], 10);
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [250 + i * 120, 880], 10)));
    await host('fi_hose');
    const flames = $$('.fi-flame', root);
    await tapEach(flames, async (n) => {
      sfx('splash');
      const c = centerOf(n);
      burst(c.x, c.y, { n: 10, kind: 'bubble', spread: 100 });
      n.innerHTML = STEAM;
      n.classList.add('out');
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    await pause(500);
    sfx('fanfare');
    await host('fi_hose_ok');
  }

  (async () => {
    playMusic('fire');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('fi_hello');
      await say('kiki', 'fi_kiki');
      await alarm();
      await drill();
      await lighter();
      await dial();
      await hose();
      await giveReward({ root, kids, reward: 'fire', series: HOST, say: host });
      await host('fi_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

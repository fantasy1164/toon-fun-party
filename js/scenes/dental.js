// 牙科：大象醫生圓圓，奇奇陪著（有一點怕）。
// 坐上牙醫椅、開燈 → 張大嘴巴數牙齒 → 找到蛀牙清乾淨 → 漱口 → 睡前要刷牙不吃糖 → 6 歲：牙齒搖搖要跟爸媽說 → 貼紙、晚上記得刷牙。
import { el, $, $$, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { PROFILES } from '../config.js';
import { dentalBack, LAMP, CUP, CHAIR_BTN, MOUTH, TEETH, TOOTH, DT } from '../art/dental.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';

const HOST = 'yuanyuan';

export function mountDental(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="dt-mouth"><div class="dt-mouth-in">${MOUTH}${TEETH.map(([x, y], i) => `<button class="kt-thing dt-tooth" data-i="${i}" style="left:${x}px;top:${y}px">${TOOTH}</button>`).join('')}</div></div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 60, 600, 0.52)}
    ${charDiv(HOST, 760, 300, 0.85)}
    ${kids.map((id, i) => kidNode(id, 260 + i * 130, 870)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit dental', back: dentalBack(ph) });
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
  const teeth = () => $$('.dt-tooth', root);

  async function sit() {
    await host('dt_sit');
    const ch = thing('dt-chair', CHAIR_BTN, [560, 440]);
    await tap(ch);
    guard();
    ch.remove();
    sfx('pop');
    await moveTo(kidEl(kids[0]), [600, 640], 600);
    const lamp = thing('dt-lamp', LAMP, [640, 190]);
    await host('dt_lamp');
    await tap(lamp);
    guard();
    lamp.classList.add('on');
    sfx('ding');
  }

  async function count() {
    await host('dt_open');
    root.classList.add('open');
    await pause(500);
    await host('dt_count');
    await tapEach(teeth(), async (n) => {
      sfx('pop');
      const c = centerOf(n);
      burst(c.x, c.y, { n: 6, kind: 'star', spread: 60 });
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    teeth().forEach((n) => n.classList.remove('done'));
    await host('dt_count_ok');
  }

  async function cavity() {
    const bad = shuffle(teeth()).slice(0, 2);
    bad.forEach((n) => n.classList.add('hole'));
    await pause(400);
    await host('dt_cavity');
    await tapEach(bad, async (n) => {
      sfx('squirt');
      n.classList.remove('hole');
      const c = centerOf(n);
      burst(c.x, c.y, { n: 10, kind: 'bubble', spread: 80 });
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    await host('dt_cavity_ok');
    root.classList.remove('open');
  }

  async function rinse() {
    await host('dt_rinse');
    const cup = thing('dt-cup', CUP, [920, 470]);
    await tap(cup);
    guard();
    sfx('splash');
    cup.remove();
    await host('dt_rinse_ok');
  }

  (async () => {
    playMusic('clinic');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('dt_hello');
      await say('kiki', 'dt_kiki_scared');
      await host('dt_brave');
      await sit();
      await count();
      await cavity();
      await rinse();
      await host('dt_night_q');
      await card(DT.brush, [DT.candy], 'dt_night_wrong');
      await host('dt_night_ok');
      // 6 歲：換牙
      if (kids.some((id) => PROFILES[id].level === 'hard')) {
        await host('dt_loose');
        await card(DT.tell, [DT.pull], 'dt_loose_wrong');
        await host('dt_loose_ok');
      }
      await say('kiki', 'dt_kiki_ok');
      await host('dn_dental');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'dental', series: HOST, say: host });
      await host('dt_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

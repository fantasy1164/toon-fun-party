// 登山步道（山區）：小猴子跳跳帶路，奇奇陪著。
// 出發前帶水 → 奇奇想離開步道去追蝴蝶要提醒 → 找路邊的小動物（只看不抓）→ 休息喝水 → 垃圾帶下山 → 到山頂看風景。
import { el, $, $$, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { trailBack, SUMMIT, CRITTERS, BOTTLE_BTN, HK } from '../art/hike.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';

const HOST = 'tiaotiao';
const SPOTS = { beetle: [130, 600], butterfly: [880, 380], snail: [1040, 760] };

export function mountHike(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="hk-summit">${SUMMIT}</div>
    <div class="kt-things">${Object.entries(SPOTS).map(([k, [x, y]]) => `<button class="kt-thing hk-critter" data-k="${k}" style="left:${x}px;top:${y}px">${CRITTERS[k]}</button>`).join('')}</div>
    ${charDiv('kiki', 640, 470, 0.5)}
    ${charDiv(HOST, 420, 430, 0.62)}
    ${kids.map((id, i) => kidNode(id, 330 + i * 130, 880)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit hike', back: trailBack(ph) });
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
  const walkOn = async (dx, dy) => {
    sfx('pop');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [330 + dx + i * 130, 880 + dy], 1200)));
  };

  async function offTrail() {
    await walkOn(120, -60);
    const k = who('kiki');
    await say('kiki', 'hk_kiki_off');
    await moveTo(k, [920, 560], 700);
    await host('hk_off_tap');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c');
    await moveTo(k, [700, 620], 600);
    await say('kiki', 'hk_kiki_sorry');
  }

  async function critters() {
    await host('hk_look');
    const nodes = $$('.hk-critter', root);
    root.classList.add('peek');
    await tapEach(nodes, async (n) => {
      sfx('sparkle');
      n.classList.add('seen');
      const c = centerOf(n);
      burst(c.x, c.y, { n: 8, kind: 'star', spread: 80 });
      await host(`hk_see_${n.dataset.k}`).catch(() => {});
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    root.classList.remove('peek');
    await host('hk_look_ok');
  }

  async function rest() {
    await walkOn(260, -120);
    await host('hk_rest');
    const b = thing('hk-bottle', BOTTLE_BTN, [200, 600]);
    await tap(b);
    guard();
    sfx('splash');
    b.remove();
    await host('hk_rest_ok');
  }

  (async () => {
    playMusic('hike');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('hk_hello');
      await host('hk_pack');
      await card(HK.water, [HK.soda], 'hk_pack_wrong');
      await host('hk_pack_ok');
      await offTrail();
      await critters();
      await rest();
      await host('hk_trash');
      await card(HK.bag, [HK.litter], 'hk_trash_wrong');
      await host('hk_trash_ok');
      root.classList.add('top');
      sfx('fanfare');
      await pause(900);
      await host('hk_top');
      await say('kiki', 'hk_kiki_top');
      await giveReward({ root, kids, reward: 'hike', series: HOST, say: host });
      await host('hk_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

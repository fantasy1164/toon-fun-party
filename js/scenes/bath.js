// 洗澡（從廁所的浴缸進來）：幫嘟嘟洗澎澎。
// 試水溫 → 放水 → 擠沐浴乳 → 搓泡泡（頭、手、肚子）→ 洗頭閉眼睛 → 蓮蓬頭沖乾淨 → 浴巾擦乾 → 浴室地板滑，慢慢走。
import { el, $, $$, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic, waterOn, waterOff } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { avatarSvg } from '../art/characters.js';
import { bathRoomBack, TUB_FRONT, BT, BTC } from '../art/bath.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';

const HOST = 'dudu';

export function mountBath(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const inner = `
    ${charDiv(HOST, 250, 420, 0.8)}
    <div class="bt-tub">${TUB_FRONT}</div>
    <div class="kt-things"></div>
    ${kids.map((id, i) => kidNode(id, 40 + i * 130, 850)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit bath', back: bathRoomBack(phase()) });
  const { root, guard, pause } = ctl;
  const du = $(`.p-char[data-who="${HOST}"]`, root);
  const host = async (line) => { guard(); await speak(HOST, line, { name: profile.name, who: profile.id, node: du }); guard(); };
  const things = $('.kt-things', root);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const tap = (n) => tapOne(n, { call, cleanups: ctl.cleanups });
  const card = (right, wrongs, line) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(line), cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const tub = $('.bt-tub', root);

  (async () => {
    playMusic('bath');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('bt_hello');
      // 試水溫、放水
      await host('bt_temp');
      await card(BTC.warm, [BTC.hot, BTC.cold], 'bt_temp_wrong');
      await host('bt_temp_ok');
      const faucet = thing('bt-faucet', BT.faucet, [1000, 380]);
      await host('bt_fill');
      await tap(faucet);
      guard();
      faucet.classList.add('on');
      waterOn();
      tub.classList.add('fill');
      await pause(1800);
      waterOff();
      faucet.classList.remove('on');
      // 嘟嘟進浴缸
      await moveTo(du, [760, 540], 900);
      guard();
      sfx('bubble');
      thing('bt-duck', BT.duck, [900, 470]);
      // 沐浴乳
      const bottle = thing('bt-bottle', BT.bottle, [470, 380]);
      await host('bt_soap');
      await tap(bottle);
      guard();
      sfx('squirt');
      bottle.classList.add('used');
      // 搓泡泡
      await host('bt_rub');
      const dx = parseFloat(du.style.left);
      const dy = parseFloat(du.style.top);
      const spots = [[dx + 48, dy + 6], [dx - 34, dy + 96], [dx + 48, dy + 104], [dx + 130, dy + 96]].map((p) => thing('bt-spot', BT.spot, p));
      const foams = [];
      await tapEach(spots, async (s) => {
        sfx('rub');
        const f = thing('bt-foam', BT.foam, [parseFloat(s.style.left) - 6, parseFloat(s.style.top) - 6]);
        foams.push(f);
        s.remove();
        const c = centerOf(f);
        burst(c.x, c.y, { n: 8, kind: 'bubble', spread: 80 });
      }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
      guard();
      // 洗頭閉眼睛
      await host('bt_eyes');
      du.classList.add('eyes-shut');
      await pause(400);
      // 沖水
      const shower = thing('bt-shower', BT.shower, [688, 150]);
      await host('bt_rinse');
      await tap(shower);
      guard();
      shower.classList.add('on');
      waterOn();
      await tapEach(foams, async (f) => {
        sfx('water');
        f.classList.add('gone');
        setTimeout(() => f.remove(), 400);
      }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
      guard();
      waterOff();
      shower.classList.remove('on');
      du.classList.remove('eyes-shut');
      await host('bt_clean');
      // 浴巾
      const towel = thing('bt-towel', BT.towel, [90, 300]);
      await host('bt_towel');
      await tap(towel);
      guard();
      towel.remove();
      await moveTo(du, [330, 760], 900);
      guard();
      sfx('towel');
      du.insertAdjacentHTML('beforeend', `<div class="bt-wrap">${BT.wrap}</div>`);
      tub.classList.remove('fill');
      await host('bt_thanks');
      // 浴室地板滑
      await host('bt_slip');
      await card(BTC.walk, [BTC.run], 'bt_slip_wrong');
      await host('bt_slip_ok');
      await host('dn_bath');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'bath', series: HOST, say: host });
      await host('bt_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  const api = ctl.api;
  const d = api.destroy;
  api.destroy = () => { waterOff(); d(); };
  return api;
}

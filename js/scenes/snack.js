// 歡樂島美食街：冰淇淋店、熱狗店。森森園長帶著，奇奇陪著。
// 選要吃什麼 → 排隊 → 付錢（3 歲點錢包，6 歲用硬幣湊剛好 15 元）→ 冰淇淋選口味／熱狗擠番茄醬 → 一口一口吃
// → 奇奇把包裝紙丟在地上，點他提醒 → 垃圾分類：先找回收標誌，寶特瓶、紙盒丟資源回收，衛生紙、木頭湯匙丟一般垃圾
//   （6 歲：寶特瓶先倒乾淨、壓扁）。
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { snackBack, STALL_ICE, STALL_DOG, FLAVOR, iceCream, hotDog, KETCHUP, RECYCLE_MARK, TRASH, BIN, COIN, PRICE, WALLET } from '../art/zooshop.js';
import { makeScene, charDiv } from './party.js';
import { tapOne, tapEach, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { turnsOn, passTurn } from '../core/turns.js';

const HOST = 'sensen';

export function mountSnack(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="kt-things"></div>
    ${charDiv('kiki', 600, 640, 0.5)}
    ${charDiv(HOST, 980, 590, 0.62)}
    ${kids.map((id, i) => kidNode(id, 170 + i * 130, 880)).join('')}
    <div class="sn-pay hidden"><div class="sn-dish"></div><div class="sn-coins"></div></div>
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit snack', back: snackBack(ph) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const call = () => ctl.call();
  const hard = () => hardNow(profile);
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  const things = $('.kt-things', root);
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  // 等某一個東西被點（回傳是哪一個）
  function pickOne(nodes) {
    return new Promise((resolve) => {
      nodes.forEach((n) => onTap(n, () => resolve(n)));
      ctl.cleanups.push(() => resolve(nodes[0]));
    });
  }
  let food = 'ice';

  // ---------- 選要吃什麼 ----------
  async function choose() {
    await host('sn_hello');
    await say('kiki', 'sn_kiki_hungry');
    await host('sn_pick');
    const a = thing('sn-stall', STALL_ICE, [270, 300]);
    const b = thing('sn-stall', STALL_DOG, [930, 330]);
    [a, b].forEach((n) => n.classList.add('glow'));
    await call();
    const got = await pickOne([a, b]);
    guard();
    passTurn();
    food = got === a ? 'ice' : 'dog';
    sfx('sparkle');
    a.remove();
    b.remove();
    for (const id of kids) moveTo(kidEl(id), [food === 'ice' ? 300 + kids.indexOf(id) * 120 : 860 + kids.indexOf(id) * 120, 880], 800);
    await moveTo(who('kiki'), [food === 'ice' ? 560 : 680, 820], 800);
    await host(food === 'ice' ? 'sn_line_ice' : 'sn_line_dog');
    await pause(1200);
  }

  // ---------- 付錢 ----------
  async function pay() {
    await host('sn_pay');
    if (!hard()) {
      const w = thing('sn-wallet', WALLET, [520, 470]);
      await host('sn_wallet');
      await tap(w);
      guard();
      sfx('coin');
      w.remove();
      return;
    }
    // 6 歲：湊剛好 15 元（十元一個、五元一個；太多就重來）
    const box = $('.sn-pay', root);
    box.classList.remove('hidden');
    $('.sn-dish', box).innerHTML = PRICE(15);
    $('.sn-coins', box).innerHTML = [10, 5, 1, 10, 5].map((v, i) => `<button class="sn-coin" data-v="${v}" data-i="${i}">${COIN(v)}</button>`).join('');
    await host('sn_coins');
    await call();
    await new Promise((resolve) => {
      let sum = 0;
      $$('.sn-coin', box).forEach((c) => onTap(c, async () => {
        if (c.classList.contains('in')) return;
        c.classList.add('in');
        sfx('coin');
        sum += +c.dataset.v;
        if (sum === 15) { resolve(); return; }
        if (sum > 15) {
          sfx('wrong');
          await host('sn_coins_over');
          sum = 0;
          $$('.sn-coin', box).forEach((x) => x.classList.remove('in'));
        }
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    passTurn();
    sfx('sparkle');
    await host('sn_coins_ok');
    box.classList.add('hidden');
  }

  // ---------- 拿到食物、吃 ----------
  async function eat() {
    let item;
    if (food === 'ice') {
      await host('sn_flavor');
      const fl = Object.keys(FLAVOR).map((f, i) => thing('sn-flavor', `<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="40" fill="${FLAVOR[f]}" stroke="#fff" stroke-width="6"/></svg>`, [380 + i * 150, 420]));
      fl.forEach((n) => n.classList.add('glow'));
      await call();
      const got = await pickOne(fl);
      guard();
      passTurn();
      const c = FLAVOR[Object.keys(FLAVOR)[fl.indexOf(got)]];
      fl.forEach((n) => n.remove());
      sfx('pop');
      item = thing('sn-food', iceCream(c), [540, 360]);
      await host('sn_ice_ok');
      for (let b = 1; b <= 3; b += 1) {
        await tap(item);
        guard();
        sfx('pop');
        item.innerHTML = iceCream(c, b);
        const cc = centerOf(item);
        burst(cc.x, cc.y - 40, { n: 5, kind: 'heart', spread: 70 });
      }
    } else {
      item = thing('sn-food', hotDog(0), [500, 400]);
      await host('sn_dog_wait');
      sfx('splash');
      item.classList.add('sizzle');
      await pause(1600);
      item.classList.remove('sizzle');
      const k = thing('sn-ketchup', KETCHUP, [760, 360]);
      await host('sn_ketchup');
      await tap(k);
      guard();
      sfx('squeak');
      item.innerHTML = hotDog(0, true);
      k.remove();
      for (let b = 1; b <= 4; b += 1) {
        await tap(item);
        guard();
        sfx('pop');
        item.innerHTML = hotDog(b, true);
      }
    }
    item.remove();
    await say('kiki', 'sn_kiki_yum');
    await host('sn_drink');
    await pause(400);
  }

  // ---------- 奇奇亂丟垃圾 ----------
  async function litter() {
    const k = who('kiki');
    const w = thing('sn-litter', TRASH.napkin.svg(), [640, 760]);
    w.style.pointerEvents = 'none';
    w.classList.add('drop');
    sfx('whoosh');
    await say('kiki', 'sn_kiki_litter');
    await host('sn_litter_tap');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c');
    await say('kiki', 'sn_kiki_pick');
    w.remove();
  }

  // ---------- 垃圾分類 ----------
  async function sort() {
    await host('sn_sort');
    const mark = thing('sn-mark', RECYCLE_MARK(200), [500, 220]);
    mark.style.pointerEvents = 'none';
    sfx('sparkle');
    await host('sn_mark');
    mark.remove();
    const bins = { recycle: thing('sn-bin recycle', BIN.recycle, [700, 450]), trash: thing('sn-bin trash', BIN.trash, [920, 450]) };
    Object.values(bins).forEach((b) => { b.style.pointerEvents = 'auto'; });
    const order = shuffle(['bottle', 'box', 'napkin', 'spoon']);
    const pos = [[80, 520], [220, 540], [360, 520], [500, 560]];
    const nodes = order.map((t, i) => thing(`sn-trash t-${t}`, TRASH[t].svg(), pos[i]));
    for (let i = 0; i < order.length; i += 1) {
      const t = order[i];
      const n = nodes[i];
      const H = hard();
      await call();
      n.classList.add('glow');
      await host(`sn_t_${t}`);
      // 6 歲：先找標誌（有就丟回收），寶特瓶要先倒乾淨、壓扁
      if (H && TRASH[t].bin === 'recycle') {
        await host('sn_find_mark');
        await new Promise((resolve) => { onTap(n, () => resolve()); ctl.cleanups.push(() => resolve()); });
        guard();
        sfx('sparkle');
        n.classList.add('marked');
        if (t === 'bottle') {
          await host('sn_pour');
          await new Promise((resolve) => { onTap(n, () => resolve()); ctl.cleanups.push(() => resolve()); });
          guard();
          sfx('splash');
          n.innerHTML = TRASH.bottle.svg(true);
          await host('sn_squash');
          await new Promise((resolve) => { onTap(n, () => resolve()); ctl.cleanups.push(() => resolve()); });
          guard();
          sfx('pop');
          n.innerHTML = TRASH.bottle.svg(true, true);
        }
      }
      n.classList.remove('glow');
      const right = bins[TRASH[t].bin];
      if (!H) right.classList.add('glow');
      await new Promise((resolve) => {
        const handlers = Object.entries(bins).map(([k, b]) => {
          const h = async (e) => {
            e.preventDefault();
            if (k === TRASH[t].bin) { Object.values(bins).forEach((x, j) => x.removeEventListener('pointerdown', handlers[j])); resolve(); return; }
            sfx('wrong');
            b.classList.add('nope');
            setTimeout(() => b.classList.remove('nope'), 500);
            await host(TRASH[t].bin === 'recycle' ? 'sn_wrong_recycle' : 'sn_wrong_trash');
            right.classList.add('glow');
          };
          b.addEventListener('pointerdown', h);
          return h;
        });
        ctl.cleanups.push(() => resolve());
      });
      guard();
      passTurn();
      right.classList.remove('glow');
      const r = ctl.rectOf(right);
      await moveTo(n, [r.x + r.w / 2, r.y + 60], 600);
      n.remove();
      sfx('pop');
      right.classList.add('gulp');
      setTimeout(() => right.classList.remove('gulp'), 400);
    }
    await host('sn_sort_ok');
    Object.values(bins).forEach((b) => b.remove());
  }

  (async () => {
    playMusic('zoo');
    await wait(400);
    try {
      ctl.mode = 'act';
      await choose();
      await pay();
      await eat();
      await litter();
      await sort();
      await giveReward({ root, kids, reward: 'snack', series: HOST, say: host });
      await host('sn_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

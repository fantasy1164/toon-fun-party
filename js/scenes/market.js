// 超市：小松鼠栗栗當店員，奇奇、嘟嘟也來買東西。
// 帶環保袋 → 照圖片清單拿東西（不在清單上的不拿；奇奇想要糖果要提醒他）→ 排隊 → 結帳（6 歲用硬幣付錢）→ 裝進環保袋。
import { PROFILES } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { avatarSvg } from '../art/characters.js';
import { marketBack, COUNTER, PRODUCTS, LIST_POOL, TEMPT, PRICE, ECOBAG, PLASTIC, COIN, WALLET, LIST_PAPER } from '../art/market.js';
import { makeScene, charDiv } from './party.js';
import { turnsOn, passTurn } from '../core/turns.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, shuffle, kidNode } from './kit.js';

const HOST = 'lili';
// 貨架上的位置（左上角）
const SLOTS = [];
for (const r of [150, 256, 362, 468]) for (const x of [58, 158, 258, 378, 478, 578]) SLOTS.push([x, r]);

export function mountMarket(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const nList = profile.level === 'hard' || two ? 4 : 3;
  const list = shuffle(LIST_POOL).slice(0, nList);
  const others = LIST_POOL.filter((x) => !list.includes(x));
  const shelf = shuffle([...list, ...others.slice(0, 3), ...TEMPT.slice(0, 3)]);
  const slots = shuffle(SLOTS).slice(0, shelf.length);
  const inner = `
    ${charDiv(HOST, 900, 238)}
    ${charDiv('dudu', 740, 430)}
    <div class="mk-counter">${COUNTER}</div>
    <div class="kt-things">${shelf.map((p, i) => `<button class="kt-thing mk-prod" data-p="${p}" style="left:${slots[i][0]}px;top:${slots[i][1]}px"><svg viewBox="0 0 100 100" width="88" height="88">${PRODUCTS[p]}</svg></button>`).join('')}</div>
    <div class="mk-list hidden">${LIST_PAPER(list)}</div>
    <div class="mk-cart"><svg viewBox="0 0 100 100" width="170" height="170"><path d="M8 22H22L32 66H80L88 34H26" stroke="#3a7bd5" stroke-width="6" fill="#dbe9ff" stroke-linejoin="round"/><circle cx="38" cy="80" r="8" fill="#333"/><circle cx="74" cy="80" r="8" fill="#333"/></svg><div class="mk-in"></div></div>
    ${charDiv('kiki', 30, 640)}
    ${kids.map((id, i) => kidNode(id, 420 + i * 130, 850)).join('')}
    <div class="mk-belt"></div>
    <div class="mk-pay hidden"></div>
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit market', back: marketBack(phase()) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const cart = $('.mk-cart', root);
  const cartIn = $('.mk-in', root);
  const listBox = $('.mk-list', root);
  const belt = $('.mk-belt', root);
  const payBox = $('.mk-pay', root);
  const prod = (p) => $(`.mk-prod[data-p="${p}"]`, root);
  const waitTap = (scope, sel) => new Promise((res) => {
    const h = (e) => {
      const t = e.target.closest(sel);
      if (!t || !scope.contains(t)) return;
      e.preventDefault();
      scope.removeEventListener('pointerdown', h);
      res(t);
    };
    scope.addEventListener('pointerdown', h);
    ctl.cleanups.push(() => { scope.removeEventListener('pointerdown', h); res(null); });
  });
  async function fly(node, toNode) {
    const a = ctl.rectOf(node);
    const b = ctl.rectOf(toNode);
    await ctl.fly(node.innerHTML, a, { x: b.x + b.w / 2 - a.w / 2, y: b.y + b.h / 2 - a.h / 2, w: a.w * 0.7 }, 500);
  }

  async function bag() {
    await host('mk_hello');
    await host('mk_bag');
    await pickCard(box, { right: ECOBAG, wrongs: [PLASTIC], hard: hardNow(profile), call, onWrong: () => host('mk_bag_wrong'), cleanups: ctl.cleanups });
    cartIn.insertAdjacentHTML('beforeend', `<svg class="mk-bag" viewBox="0 0 100 100" width="70" height="70">${ECOBAG}</svg>`);
    await host('mk_bag_ok');
  }

  async function shopping() {
    listBox.classList.remove('hidden');
    sfx('pop');
    await host('mk_list');
    const got = new Set();
    let kikiDone = false;
    while (got.size < list.length) {
      const easy = !hardNow(profile);
      list.filter((p) => !got.has(p)).forEach((p) => prod(p).classList.toggle('glow', easy));
      await call();
      const t = await waitTap(root, '.mk-prod:not(.taken)');
      guard();
      if (!t) return;
      const p = t.dataset.p;
      if (!list.includes(p)) {
        sfx('wrong');
        t.classList.add('nope');
        await host(TEMPT.includes(p) ? 'mk_tempt' : 'mk_not_list');
        t.classList.remove('nope');
        list.filter((x) => !got.has(x)).forEach((x) => prod(x).classList.add('glow'));
        continue;
      }
      passTurn();
      got.add(p);
      t.classList.remove('glow');
      t.classList.add('taken');
      sfx('pop');
      await fly(t, cart);
      cartIn.insertAdjacentHTML('beforeend', `<svg class="mk-ci" data-p="${p}" viewBox="0 0 100 100" width="58" height="58">${PRODUCTS[p]}</svg>`);
      $(`.li[data-i="${list.indexOf(p)}"]`, listBox).classList.add('done');
      sfx('sparkle');
      if (got.size === 2 && !kikiDone) {
        kikiDone = true;
        $$('.mk-prod.glow', root).forEach((x) => x.classList.remove('glow'));
        await kikiWants();
      }
    }
    $$('.mk-prod.glow', root).forEach((n) => n.classList.remove('glow'));
    await host('mk_all');
  }

  // 奇奇想買糖果：提醒他清單上沒有，下次再買
  async function kikiWants() {
    const ki = who('kiki');
    const candy = prod('candy') || prod(TEMPT.find((x) => prod(x)));
    const home = [parseFloat(ki.style.left) + 75, parseFloat(ki.style.top) + 198];
    if (candy) await moveTo(ki, [Math.min(560, Math.max(110, parseFloat(candy.style.left) + 44)), 700], 800);
    guard();
    await say('kiki', 'mk_kiki_want');
    await host('mk_kiki_tap');
    ki.classList.add('glow-c');
    await tapOne(ki, { call, cleanups: ctl.cleanups });
    guard();
    ki.classList.remove('glow-c');
    await say('kiki', 'mk_kiki_ok');
    await moveTo(ki, home, 800);
    guard();
  }

  async function checkout() {
    listBox.classList.add('hidden');
    await host('mk_queue');
    await Promise.all([moveTo(cart, [620, 760], 900), ...kids.map((id, i) => moveTo($(`.kt-kid[data-id="${id}"]`, root), [470 + i * 110, 860], 900))]);
    guard();
    const du = who('dudu');
    sfx('coin');
    await say('dudu', 'mk_dudu_pay');
    sfx('ding');
    await moveTo(du, [1300, 640], 900);
    guard();
    await host('mk_next');
    await moveTo(cart, [760, 800], 700);
    guard();
    // 把東西放到收銀台上，嗶一聲
    await host('mk_belt');
    const items = $$('.mk-ci', cartIn);
    let n = 0;
    await tapEach(items, async (it) => {
      const p = it.dataset.p;
      const x = 790 + n * 62;
      n += 1;
      const b = el(`<div class="mk-bi" style="left:${x}px;top:360px"><svg viewBox="0 0 100 100" width="60" height="60">${PRODUCTS[p]}</svg></div>`);
      it.remove();
      belt.appendChild(b);
      sfx('beep');
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    const total = list.reduce((s, p) => s + PRICE[p], 0);
    await call();
    if (hardNow(profile)) await payCoins(total);
    else await payWallet(total);
    passTurn();
    sfx('coin');
    await host('mk_thanks');
    // 裝進環保袋
    await host('mk_pack');
    const bagNode = $('.mk-bag', cartIn);
    await tapEach($$('.mk-bi', belt), async (b) => {
      await ctl.fly(b.innerHTML, ctl.rectOf(b), { ...ctl.rectOf(bagNode), w: 40 }, 400);
      b.remove();
      sfx('pop');
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
  }

  async function payWallet(total) {
    payBox.innerHTML = `<button class="kt-thing mk-wallet glow"><svg viewBox="0 0 100 100" width="170" height="170">${WALLET}</svg></button>`;
    payBox.classList.remove('hidden');
    await host(`mk_pay_${total}`);
    await host('mk_wallet');
    await new Promise((res) => { onTap($('.mk-wallet', payBox), res); ctl.cleanups.push(res); });
    guard();
    payBox.classList.add('hidden');
  }

  // 6 歲：從錢包拿硬幣，剛好湊到總共的錢
  async function payCoins(total) {
    const purse = [10, 10, 10, 10, 5, 5, 1, 1];
    payBox.innerHTML = `<div class="mk-tray"></div><div class="mk-purse">${purse.map((v, i) => `<button class="mk-coin c${v}" data-v="${v}" data-i="${i}"><svg viewBox="0 0 50 50" width="${v === 10 ? 92 : v === 5 ? 80 : 68}" height="${v === 10 ? 92 : v === 5 ? 80 : 68}">${COIN(v)}</svg></button>`).join('')}</div>`;
    payBox.classList.remove('hidden');
    await host(`mk_pay_${total}`);
    await host('mk_coins');
    const tray = $('.mk-tray', payBox);
    let sum = 0;
    let wrong = 0;
    await new Promise((resolve) => {
      let busy = false;
      $$('.mk-coin', payBox).forEach((b) => onTap(b, async () => {
        if (busy || b.classList.contains('used')) return;
        busy = true;
        const v = +b.dataset.v;
        b.classList.add('used');
        tray.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 50 50" width="64" height="64">${COIN(v)}</svg>`);
        sfx('coin');
        sum += v;
        if (sum === total) { resolve(); return; }
        if (sum > total) {
          wrong += 1;
          sfx('wrong');
          await host('mk_too_much');
          sum = 0;
          tray.innerHTML = '';
          $$('.mk-coin', payBox).forEach((x) => x.classList.remove('used', 'glow'));
          // 錯第二次以後：發亮提示要拿哪幾個
          if (wrong >= 2) {
            let left = total;
            for (const x of $$('.mk-coin', payBox)) {
              const xv = +x.dataset.v;
              if (xv <= left) { x.classList.add('glow'); left -= xv; }
            }
          }
        }
        busy = false;
      }));
      ctl.cleanups.push(resolve);
    });
    guard();
    sfx('sparkle');
    await host('mk_coins_ok');
    payBox.classList.add('hidden');
  }

  (async () => {
    playMusic('market');
    await wait(400);
    try {
      ctl.mode = 'act';
      await bag();
      await shopping();
      await checkout();
      await host('dn_market');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'market', series: HOST, say: host });
      await host('mk_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return ctl.api;
}

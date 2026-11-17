// 歡樂島紀念品店：架上有各種動物娃娃，只能選一隻（不讓爸爸媽媽困擾）。森森園長帶著，奇奇陪著。
// 奇奇抱著三隻娃娃哭著全部都要 → 點奇奇，陪他深呼吸三次 → 只能選一隻最喜歡的，其他下次再來看
// （6 歲幫奇奇從兩隻裡選一隻；3 歲奇奇自己放回去）→ 小孩自己選一隻（想拿第二隻時，園長溫柔提醒）→ 結帳。
// 選到的娃娃就是今天的收藏品（放進陳列櫃）。
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import { REWARD_SLOTS } from '../config.js';
import { giftBack, plushSvg, PLUSH_IDS, BREATH_BALLOON } from '../art/zooshop.js';
import { itemSvg } from '../art/items.js';
import { avatarSvg } from '../art/characters.js';
import { makeScene, charDiv } from './party.js';
import { tapOne, hardNow, moveTo, kidNode, shuffle } from './kit.js';
import { passTurn, inTurnOrder } from '../core/turns.js';

const HOST = 'sensen';

export function mountGift(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const shelf = PLUSH_IDS.map((id, i) => `<button class="gf-plush" data-id="${id}" style="left:${90 + (i % 6) * 170}px;top:${(i < 6 ? 200 : 420) + 10}px">${plushSvg(id, 150)}</button>`).join('');
  const inner = `
    <div class="gf-shelf">${shelf}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 560, 640, 0.5)}
    ${charDiv(HOST, 1000, 560, 0.6)}
    ${kids.map((id, i) => kidNode(id, 170 + i * 130, 880)).join('')}
    <div class="gf-hug"></div>
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit gift', back: giftBack(ph) });
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
  const plushNode = (id) => $(`.gf-plush[data-id="${id}"]`, root);
  let shopping = false;

  // ---------- 奇奇哭著全部都要 ----------
  async function tantrum() {
    const k = who('kiki');
    const grab = shuffle(['panda', 'koala', 'penguin', 'lion', 'giraffe']).slice(0, 3);
    await moveTo(k, [520, 800], 500);
    const hug = $('.gf-hug', root);
    hug.innerHTML = grab.map((id) => `<div class="gf-held" data-id="${id}">${plushSvg(id, 110)}</div>`).join('');
    grab.forEach((id) => plushNode(id).classList.add('taken'));
    sfx('whoosh');
    await say('kiki', 'gf_kiki_all');
    k.classList.add('crying');
    await say('kiki', 'gf_kiki_cry');
    await host('gf_calm_tap');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c');
    // 一起深呼吸三次：吸氣氣球變大、吐氣變小
    await host('gf_breathe');
    const b = thing('gf-balloon', BREATH_BALLOON, [700, 280]);
    b.style.pointerEvents = 'none';
    for (let i = 0; i < 3; i += 1) {
      b.classList.add('in');
      sfx('whoosh');
      await pause(1700);
      b.classList.remove('in');
      await pause(1500);
    }
    b.remove();
    k.classList.remove('crying');
    await say('kiki', 'gf_kiki_calm');
    await host('gf_one');
    // 6 歲幫奇奇從兩隻裡選一隻；3 歲奇奇自己選
    let keep = grab[0];
    if (hard()) {
      await host('gf_help_pick');
      $$('.gf-held', hug).forEach((n, i) => { if (i === 2) n.classList.add('back'); });
      plushNode(grab[2]).classList.remove('taken');
      const two = $$('.gf-held', hug).filter((n) => !n.classList.contains('back'));
      two.forEach((n) => n.classList.add('glow'));
      await call();
      keep = await new Promise((resolve) => {
        two.forEach((n) => onTap(n, () => resolve(n.dataset.id)));
        ctl.cleanups.push(() => resolve(grab[0]));
      });
      guard();
      passTurn();
    }
    $$('.gf-held', hug).forEach((n) => { if (n.dataset.id !== keep) { n.classList.add('back'); plushNode(n.dataset.id).classList.remove('taken'); } else n.classList.remove('glow'); });
    sfx('sparkle');
    await say('kiki', 'gf_kiki_one');
    await host('gf_kiki_good');
    return keep;
  }

  // ---------- 小孩自己選一隻 ----------
  async function choose(kikiKeep) {
    await host('gf_your_turn');
    const picked = {};
    for (const id of inTurnOrder(kids)) {
      await call();
      shopping = true;
      const free = $$('.gf-plush', root).filter((n) => !n.classList.contains('taken'));
      free.forEach((n) => n.classList.add('glow'));
      const got = await new Promise((resolve) => {
        free.forEach((n) => onTap(n, () => { if (shopping) resolve(n.dataset.id); }));
        ctl.cleanups.push(() => resolve(free[0].dataset.id));
      });
      guard();
      shopping = false;
      free.forEach((n) => n.classList.remove('glow'));
      picked[id] = got;
      const n = plushNode(got);
      n.classList.add('taken');
      sfx('sparkle');
      const c = centerOf(n);
      burst(c.x, c.y, { n: 12, kind: 'heart', spread: 120 });
      kidEl(id).insertAdjacentHTML('beforeend', `<div class="gf-mine">${plushSvg(got, 90)}</div>`);
      passTurn();
      // 想再拿一隻：溫柔提醒
      const more = $$('.gf-plush', root).filter((x) => !x.classList.contains('taken'));
      let told = false;
      const nudge = async () => { if (told || !ctl.alive) return; told = true; sfx('wrong'); await speak(HOST, 'gf_only_one', { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {}); };
      more.forEach((x) => onTap(x, () => { if (!shopping) nudge(); }));
      await host('gf_picked');
    }
    return picked;
  }

  // ---------- 結帳、帶回家 ----------
  async function checkout(picked) {
    await host('gf_pay');
    const reg = thing('gf-reg', `<svg viewBox="0 0 100 100" width="120" height="120"><rect x="10" y="30" width="80" height="60" rx="10" fill="#3a3f4a"/><rect x="22" y="40" width="56" height="24" rx="4" fill="#7be0a0"/><rect x="30" y="10" width="40" height="24" rx="6" fill="#fff"/></svg>`, [880, 470]);
    await tap(reg);
    guard();
    sfx('ding');
    reg.remove();
    // 今天的娃娃（這個時段還沒帶過的人才放進陳列櫃）
    const slot = currentSlot(REWARD_SLOTS.gift, hour());
    const winners = slot ? kids.filter((id) => !hasClaimed(id, `gift_${slot}`)) : [];
    if (!winners.length) { await host('gf_practice'); return; }
    winners.forEach((id) => { addItem(id, `zp_${picked[id]}`); claim(id, `gift_${slot}`); });
    save();
    sfx('fanfare');
    const node = el(`<div class="gift">${winners.map((id) => `<div class="card">${itemSvg(`zp_${picked[id]}`, 210)}${kids.length > 1 ? `<div class="owner">${avatarSvg(id, 98)}</div>` : ''}</div>`).join('')}</div>`);
    root.appendChild(node);
    try {
      await host('gf_gift');
      await wait(600);
    } finally {
      node.classList.add('away');
      sfx('whoosh');
      await wait(650);
      node.remove();
    }
  }

  (async () => {
    playMusic('zoo');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('gf_hello');
      await say('kiki', 'gf_kiki_wow');
      const keep = await tantrum();
      const picked = await choose(keep);
      await checkout(picked);
      await host('gf_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

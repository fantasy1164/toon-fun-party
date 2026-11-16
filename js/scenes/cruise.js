// 郵輪：郊區碼頭坐船去歡樂島。船長噗噗，奇奇陪著。
// 排隊走跳板上船 → 穿救生衣扣好三個扣子 → 開船，奇奇想爬欄杆要提醒（抓扶手站好）
// → 點跳出海面的海豚（6 歲數數看有幾隻）→ 海鷗想吃奇奇的零食：野生動物不能餵 → 看到歡樂島，等船停好再慢慢下船。
import { el, $, $$, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { cruisePierBack, GANGWAY, deckBack, seaStrip, RAILING, ISLAND_FAR, LIFE_VEST, BUCKLE, DOLPHIN, GULL, CR } from '../art/cruise.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';
import { useBody } from '../art/characters.js';

export function mountCruise(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="cr-deck">
      <div class="cr-deckback">${deckBack(ph)}</div>
      <div class="cr-far">${ISLAND_FAR}</div>
      <div class="cr-sea"><div class="cr-strip">${seaStrip(ph)}${seaStrip(ph)}</div></div>
      <div class="cr-rail">${RAILING}</div>
    </div>
    <div class="cr-gang">${GANGWAY}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 600, 600, 0.52)}
    ${charDiv('pupu', 960, 520, 0.66)}
    ${kids.map((id, i) => kidNode(id, 160 + i * 130, 880)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'pupu', { cls: 'kit cruise', back: cruisePierBack(ph) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const cap = (line) => say('pupu', line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => cap(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    $('.kt-things', root).appendChild(n);
    return n;
  }

  // ---------- 走跳板上船（一個一個） ----------
  async function board() {
    await cap('cr_board');
    const g = $('.cr-gang', root);
    for (const id of kids) {
      await tap(g);
      guard();
      sfx('pop');
      await moveTo(kidEl(id), [560, 700], 700);
      kidEl(id).classList.add('gone');
    }
    await moveTo(who('kiki'), [620, 700], 500);
    sfx('whoosh');
    root.classList.add('on-deck');
    await pause(500);
    kids.forEach((id, i) => { const k = kidEl(id); k.classList.remove('gone'); moveTo(k, [200 + i * 140, 880], 10); });
    await moveTo(who('kiki'), [560, 840], 10);
    await pause(400);
  }

  // ---------- 救生衣：每個人扣好三個扣子 ----------
  async function vest() {
    await cap('cr_vest');
    for (const id of kids) {
      const k = kidEl(id);
      k.insertAdjacentHTML('beforeend', `<div class="cr-vest${useBody() ? '' : ' head'}">${LIFE_VEST}</div>`);
      sfx('whoosh');
      const x = 160 + kids.indexOf(id) * 140;
      const bs = [0, 1, 2].map((i) => thing('cr-buckle', BUCKLE(i), [x + 150, 560 + i * 100]));
      await tapEach(bs, async (b) => { sfx('ding'); b.classList.add('clicked'); await wait(250); b.remove(); }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
      guard();
      k.classList.add('vest-on');
      sfx('sparkle');
    }
    await cap('cr_vest_ok');
  }

  // ---------- 開船：奇奇想爬欄杆 ----------
  async function sail() {
    sfx('horn');
    await cap('cr_go');
    root.classList.add('moving');
    await pause(1200);
    const k = who('kiki');
    await moveTo(k, [700, 720], 500);
    k.classList.add('climbing');
    await say('kiki', 'cr_kiki_climb');
    await cap('cr_climb_tap');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c', 'climbing');
    await moveTo(k, [600, 840], 400);
    await cap('cr_climb_q');
    await card(CR.hold, [CR.climb], 'cr_climb_wrong');
    await cap('cr_climb_ok');
  }

  // ---------- 海豚跳出水面 ----------
  async function dolphins() {
    await cap('cr_dolphin');
    const spots = [[160, 330], [520, 300], [880, 340]];
    let n = 0;
    const ds = spots.map((p) => thing('cr-dolphin', DOLPHIN, p));
    ds.forEach((d, i) => { d.style.animationDelay = `${i * 0.7}s`; });
    await tapEach(ds, async (d) => {
      n += 1;
      sfx('splash');
      const c = centerOf(d);
      burst(c.x, c.y, { n: 10, kind: 'bubble', spread: 120 });
      d.classList.add('seen');
      await wait(300);
    }, { free: true, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    if (hardNow(profile)) {
      await cap('cr_dolphin_count');
      await card(CR.num(3), [CR.num(2), CR.num(4)], 'cr_dolphin_wrong');
    }
    await cap('cr_dolphin_ok');
    ds.forEach((d) => d.remove());
  }

  // ---------- 海鷗想吃奇奇的零食 ----------
  async function gull() {
    const g = thing('cr-gull', GULL, [760, 470]);
    g.classList.add('land');
    sfx('squeak');
    await say('kiki', 'cr_kiki_feed');
    await cap('cr_gull_q');
    await card(CR.nofeed, [CR.feed], 'cr_gull_wrong');
    await cap('cr_gull_ok');
    g.classList.add('fly');
    sfx('whoosh');
    await pause(800);
    g.remove();
  }

  // ---------- 到島了：等船停好，慢慢下船 ----------
  async function arrive() {
    root.classList.add('near');
    await cap('cr_island');
    await say('kiki', 'cr_kiki_island');
    await pause(1200);
    root.classList.remove('moving');
    sfx('horn');
    await cap('cr_stop');
    const rope = thing('cr-rope', `<svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="40" fill="none" stroke="#c9a06a" stroke-width="12"/><circle cx="50" cy="50" r="24" fill="none" stroke="#b8895a" stroke-width="10"/></svg>`, [80, 520]);
    await tap(rope);
    guard();
    sfx('pop');
    rope.remove();
    await cap('cr_off');
    for (const id of kids) moveTo(kidEl(id), [1300, 880], 1400);
    await moveTo(who('kiki'), [1320, 840], 1400);
  }

  (async () => {
    playMusic('sea');
    await wait(400);
    try {
      ctl.mode = 'act';
      await cap('cr_hello');
      await say('kiki', 'cr_kiki_hello');
      await board();
      await vest();
      await sail();
      await dolphins();
      await gull();
      await arrive();
      await giveReward({ root, kids, reward: 'ship', series: 'pupu', say: cap });
      ctl.mode = 'done';
      await pause(300);
      ctl.leave('arrive');
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

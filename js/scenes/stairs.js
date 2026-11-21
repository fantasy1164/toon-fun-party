// 樓梯間（11/21，John：透天厝上下樓都要走樓梯；小孩最常在轉角平台玩，最怕跌下來撞到頭）。
// 消防員勇勇講安全、奇奇調皮被提醒：
//   晚上先開燈 → 撿走樓梯上的玩具 → 手指按著扶手上的小手慢慢往上（太快會停下來）
//   → 轉角平台：奇奇跳來跳去（點奇奇、選「直接走過去」）→ 奇奇把頭伸出欄杆（點奇奇）→ 上二樓
//   → 下樓：奇奇推嘟嘟搶第一（點奇奇）、想坐著溜下去（選「扶扶手走下去」）、抱一大疊玩具（選「拿一點、一手扶扶手」）
//   → 扶著扶手下到平台、直接走過去、回到一樓 → 白天問「晚上要先開燈」→ 說原因、給獎、徽章
import { el, $, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, isSpeaking } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { recordHabit } from '../core/store.js';
import { stairsBack, ST, stepFoot, railLine, TOY_BOX, ST_TOYS, SWITCH, RAIL_HAND, TOY_STACK, ST_CARD } from '../art/stairs.js';
import { makeScene, charDiv } from './party.js';
import { turnsOn, passTurn } from '../core/turns.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';

const HOST = 'yongyong';

export function mountStairs(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const night = ph === 'night' || ph === 'dusk';
  const inner = `
    <div class="kt-things"></div>
    ${charDiv('dudu', 70, 60, 0.45)}
    ${charDiv('kiki', 560, 690, 0.5)}
    ${charDiv(HOST, 990, 640, 0.62)}
    ${kids.map((id, i) => kidNode(id, 150 + i * 120, 880)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: `kit stairs${night ? ' dark' : ' lit'}`, back: stairsBack(ph) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  const things = $('.kt-things', root);
  function thing(cls, html, [x, y]) {
    const t = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(t);
    return t;
  }
  const kiki = who('kiki');
  const dudu = who('dudu');
  dudu.classList.add('gone');
  function wobble(node, cls = 'st-wobble', ms = 900) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), ms);
  }
  // 點奇奇提醒他（奇奇發亮）
  async function tapKiki() {
    kiki.classList.add('glow-c');
    await ctl.tapOnce(kiki);
    guard();
    kiki.classList.remove('glow-c', 'st-jumping', 'st-peek');
    sfx('pop');
  }

  // ---------- 開燈 ----------
  async function lightUp() {
    const sw = thing('st-switch', SWITCH, [200, 560]);
    await host('lt_dark');
    await tap(sw);
    guard();
    sfx('ding');
    sw.classList.add('on');
    root.classList.remove('dark');
    root.classList.add('lit', 'lamp');
    await pause(400);
    await host('lt_light_ok');
  }

  // ---------- 撿玩具 ----------
  async function toys() {
    const chest = thing('st-box', TOY_BOX, [14, 720]);
    chest.style.pointerEvents = 'none';
    const spots = [[2, 'ball'], [4, 'car'], [6, 'block']];
    const nodes = spots.map(([k, kind]) => {
      const [x, y] = stepFoot(1, k);
      return thing('st-toy', ST_TOYS[kind], [x - 38, y - 70]);
    });
    await host('lt_toys');
    const cr = ctl.rectOf(chest);
    await tapEach(nodes, async (n) => {
      sfx('pop');
      await moveTo(n, [cr.x + cr.w / 2, cr.y + 60], 600);
      n.classList.add('in-box');
      const c = centerOf(chest);
      burst(c.x, c.y, { n: 8, kind: 'star', spread: 80 });
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    nodes.forEach((n) => n.remove());
    await host('lt_toys_ok');
  }

  // ---------- 扶著扶手走一段樓梯 ----------
  // 手指按著扶手上的小手，沿著扶手慢慢滑；小孩跟著一階一階走。太快：停下來、晃一下、勇勇提醒。
  // 一起玩：弟弟走前面、姊姊在後面等他（跟勇勇說的一樣）
  const order = () => (kids.includes('xz') ? ['xz', ...kids.filter((x) => x !== 'xz')] : kids.slice());
  const lead = 0;
  // 走前面的人在第 k 階，後面的人隔兩階跟著（上樓在下面、下樓在上面）
  let goingUp = true;
  function footAt(flight, k, nth) {
    if (k >= 1 && k <= ST.N) return stepFoot(flight, k);
    if (k > ST.N) return stepFoot(flight, ST.N);
    const [x, y] = stepFoot(flight, 0);   // 樓梯口：一樓在左邊排、平台在右邊排
    return [flight === 1 ? x - 110 * nth : x + 110 * nth, y];
  }
  function placeKids(flight, k, ms = 260) {
    const list = order();
    const first = list[lead % list.length];
    const rest = list.filter((x) => x !== first);
    const ps = [moveTo(kidEl(first), footAt(flight, k, 0), ms)];
    rest.forEach((id, i) => {
      const kk = goingUp ? k - 2 * (i + 1) : k + 2 * (i + 1);
      ps.push(moveTo(kidEl(id), footAt(flight, kk, i + 1), ms));
    });
    return Promise.all(ps);
  }
  async function walkFlight(flight, up) {
    // up：flight 1 從 0 走到 8；flight 2 從 0（平台）走到 8（二樓）。下樓反過來
    goingUp = up;
    const [[ax, ay], [bx, by]] = railLine(flight);
    const [sx, sy, ex, ey] = up ? [ax, ay, bx, by] : [bx, by, ax, ay];
    const len = Math.hypot(ex - sx, ey - sy);
    const ux = (ex - sx) / len;
    const uy = (ey - sy) / len;
    const hand = thing('st-hand glow', RAIL_HAND, [sx - 48, sy - 48]);
    hand.dataset.x1 = sx; hand.dataset.y1 = sy; hand.dataset.x2 = ex; hand.dataset.y2 = ey;
    if (turnsOn()) await call();
    let t = 0;
    let shown = up ? 0 : ST.N;
    let warned = false;
    await new Promise((resolve) => {
      let last = null;
      let hist = [];
      let frozen = false;
      const k = () => stage.getBoundingClientRect().width / 1200;
      const setHand = () => { hand.style.left = `${sx + ux * len * t - 48}px`; hand.style.top = `${sy + uy * len * t - 48}px`; };
      const down = (e) => { e.preventDefault(); if (frozen) return; last = [e.clientX, e.clientY]; hist = []; hand.classList.add('held'); };
      const move = (e) => {
        if (!last || frozen) return;
        const dx = (e.clientX - last[0]) / k();
        const dy = (e.clientY - last[1]) / k();
        last = [e.clientX, e.clientY];
        const along = dx * ux + dy * uy;
        if (along <= 0) return;
        t = Math.min(1, t + along / len);
        const now = performance.now();
        hist.push([now, t]);
        while (hist.length && now - hist[0][0] > 250) hist.shift();
        const v = hist.length > 1 ? ((hist[hist.length - 1][1] - hist[0][1]) * len) / Math.max(60, now - hist[0][0]) * 1000 : 0;
        setHand();
        const step = up ? Math.min(ST.N, Math.floor(t * ST.N + 0.15)) : Math.max(0, ST.N - Math.floor(t * ST.N + 0.15));
        if (step !== shown) {
          shown = step;
          placeKids(flight, step);
          if (step % 2 === 0) sfx('tap');
        }
        // 太快：停下來、晃一下，勇勇提醒（第一次才說），說完可以繼續
        if (v > 1100 && t < 0.97) {
          frozen = true;
          last = null;
          hand.classList.remove('held');
          sfx('wrong');
          kids.forEach((id) => wobble(kidEl(id)));
          const after = () => { frozen = false; };
          if (!warned && !isSpeaking()) { warned = true; speak(HOST, 'lt_slow', { node: who(HOST) }).catch(() => {}).then(after); } else setTimeout(after, 900);
          return;
        }
        if (t >= 1) { off(); resolve(); }
      };
      const up2 = () => { last = null; hand.classList.remove('held'); };
      const off = () => { hand.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up2); window.removeEventListener('pointercancel', up2); };
      hand.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up2);
      window.addEventListener('pointercancel', up2);
      ctl.cleanups.push(() => { off(); resolve(); });
    });
    guard();
    hand.remove();
    if (turnsOn()) passTurn();
    await placeKids(flight, up ? ST.N : 0, 300);
    sfx('sparkle');
  }
  // 平台上：從第一段頂端走到平台中間站好（或反過來）
  async function onLanding() {
    const xs = [ST.X1 + 60, ST.X1 + 160];
    await Promise.all(order().map((id, i) => moveTo(kidEl(id), [xs[i], ST.LAND], 500)));
  }

  // ---------- 轉角平台：奇奇跳、奇奇把頭伸出欄杆 ----------
  async function landingPlay() {
    await moveTo(kiki, [ST.X1 + 40, ST.LAND], 700);
    kiki.classList.add('st-jumping');
    sfx('boing');
    await say('kiki', 'lt_kiki_jump');
    await host('lt_jump_tap');
    await tapKiki();
    await say('kiki', 'lt_kiki_sorry1');
    await host('lt_landing_q');
    await card(ST_CARD.landWalk, [ST_CARD.landJump], 'lt_landing_wrong');
    await host('lt_landing_ok');
    // 奇奇把頭伸出欄杆往下看
    await moveTo(kiki, [ST.LX - 85, ST.LAND], 500);
    kiki.classList.add('st-peek');
    await say('kiki', 'lt_kiki_rail');
    await host('lt_rail_tap');
    await tapKiki();
    await say('kiki', 'lt_kiki_sorry2');
    await host('lt_rail_ok');
    await moveTo(kiki, [ST.LX - 80, ST.LAND], 300);
  }

  // ---------- 二樓：下樓前 ----------
  async function topRules() {
    // 嘟嘟從房間出來，奇奇推他搶第一
    // 奇奇站在第二段上面幾階、嘟嘟在他下面，不跟小孩擠在一起
    kiki.style.transition = 'none';
    await moveTo(kiki, stepFoot(2, 6), 10);
    dudu.classList.remove('gone');
    await moveTo(dudu, stepFoot(2, 4), 600);
    await pause(300);
    kiki.classList.add('st-rush');
    sfx('whoosh');
    wobble(dudu);
    await say('kiki', 'lt_kiki_race');
    await host('lt_push_tap');
    await tapKiki();
    kiki.classList.remove('st-rush');
    await say('kiki', 'lt_kiki_sorry3');
    await say('dudu', 'lt_dudu_thanks');
    await moveTo(dudu, stepFoot(2, 0), 1400);
    dudu.classList.add('gone');
    // 奇奇想坐著溜下去
    kiki.classList.add('st-sit');
    await say('kiki', 'lt_kiki_slide');
    await host('lt_slide_q');
    await card(ST_CARD.walkDown, [ST_CARD.slideDown], 'lt_slide_wrong');
    kiki.classList.remove('st-sit');
    await host('lt_slide_ok');
    // 奇奇抱一大疊玩具
    const stack = el(`<div class="st-stack">${TOY_STACK}</div>`);
    kiki.appendChild(stack);
    await say('kiki', 'lt_kiki_carry');
    await host('lt_carry_q');
    await card(ST_CARD.carryLittle, [ST_CARD.carryStack], 'lt_carry_wrong');
    stack.classList.add('small');
    await host('lt_carry_ok');
    stack.remove();
    kiki.classList.add('gone');
  }

  (async () => {
    playMusic('lobby');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('lt_hello');
      await say('kiki', 'lt_kiki_hi');
      if (night) await lightUp();
      await toys();
      // 上樓
      await host('lt_up');
      if (kids.length > 1) await host('lt_both');
      else await host(kids[0] === 'xz' ? 'lt_small_xz' : 'lt_wait_yh');
      await placeKids(1, 0, 500);
      await walkFlight(1, true);
      await onLanding();
      await landingPlay();
      await walkFlight(2, true);
      order().forEach((id, i) => moveTo(kidEl(id), [205 + i * 100, ST.F2], 500));   // 避開左上角的回家鍵
      await host('lt_top');
      await topRules();
      // 下樓
      await host('lt_down');
      goingUp = false;
      await placeKids(2, ST.N, 400);
      await walkFlight(2, false);
      await host('lt_pass');
      await walkFlight(1, false);
      await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [150 + i * 120, 880], 500)));
      // 白天：問「晚上走樓梯要先做什麼」
      if (!night) {
        await host('lt_light_q');
        await card(ST_CARD.lightOn, [ST_CARD.lightOff], 'lt_light_wrong');
        await host('lt_light_ok2');
      }
      await host('dn_stairs');   // 說出做到了什麼
      recordHabit(kids, 'stairs');
      await giveReward({ root, kids, reward: 'stairs', series: HOST, say: host });
      await host('lt_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

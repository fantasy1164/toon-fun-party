// 公園：小猴子跳跳主持，嘟嘟當玩伴。
// 白天：溜滑梯（排隊、嘟嘟插隊、安全溜法）、盪鞦韆（一個坐一個推、數到十換人、不能走在鞦韆前面）、
//       沙坑（挖寶、蓋沙堡、玩完洗手）；中間撿垃圾、喝水、很熱時戴帽子到樹下；每天一次安全練習（陌生人、走失）。
// 下雨：溜滑梯濕濕的不能溜、穿雨鞋踩水坑、到涼亭躲雨。晚上：數螢火蟲，然後回家。
import { PROFILES, REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { hour, phase, currentSlot, dateKey } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { parkBack, swingSvg, swingRider, PK, CARDS, SLIDE, QUEUE, SWING } from '../art/park.js';
import { makeScene, charDiv } from './party.js';
import { sceneWeather } from './door.js';
import { itemIcon } from '../art/door.js';
import { turnsOn, passTurn, setTurn, callTurn, whoseTurn, otherKid, freeTurns } from '../core/turns.js';

const HOST = 'tiaotiao';
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

export function mountPark(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const two = profile.members.length > 1;
  const wx = weather.current();
  const wk = sceneWeather(wx);
  const h = hour();
  const night = h >= 18 || h < 6;
  const rain = !night && (wk === 'rain' || wk === 'storm');
  const hot = !night && !rain && wk === 'hot';
  const kids = profile.members;

  const inner = `
    <div class="pk-swing">${swingSvg()}</div>
    ${rain ? `<button class="pk-pav">${PK.pavilion}</button>` : ''}
    <div class="pk-things"></div>
    ${charDiv(HOST, 40, 560)}
    ${charDiv('dudu', 860, 440)}
    ${kids.map((id, i) => `<div class="pk-kid k-${id}" data-id="${id}" style="left:${620 + i * 120}px;top:640px">${avatarSvg(id, 110)}</div>`).join('')}
    <div class="pk-cards hidden"></div>
    <div class="p-tray hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, {
    cls: `park ${night ? 'pk-night' : ''} ${rain ? 'pk-rain' : ''}`,
    back: parkBack(phase(), wx, { night }),
  });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.pk-kid[data-id="${id}"]`, root);
  const say = (id, line) => speak(id, line, { name: profile.name, who: profile.id, node: who(id) });
  const host = (line) => say(HOST, line);
  const things = $('.pk-things', root);
  const cardsBox = $('.pk-cards', root);
  const tray = $('.p-tray', root);
  const swing = $('.swing', root);

  // ---------- 小工具 ----------
  // 移動：x、y 是腳底中間（舞台座標）
  function moveTo(node, [x, y], ms = 700) {
    const w = node.offsetWidth || 110;
    const hh = node.offsetHeight || 110;
    node.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`;
    node.style.left = `${x - w / 2}px`;
    node.style.top = `${y - hh}px`;
    return pause(ms + 30);
  }
  const confetti = (node, n = 10) => { const c = centerOf(node); burst(c.x, c.y, { n, kind: 'star', spread: 140 }); };
  const praise = () => host(two ? 'tg_both' : pick(['praise1', 'praise2', 'praise3']));
  // 一起玩：輪到某一個小孩（唱名）
  async function callKid(id) {
    if (!turnsOn()) return;
    setTurn(id);
    await callTurn(HOST, who(HOST));
    guard();
  }
  // 依序點好幾個東西：一起玩時一人一個（free：兩個人可以一起點）
  async function tapEach(nodes, onEach, { free = false } = {}) {
    let left = nodes.length;
    let calling = false;
    nodes.forEach((n) => n.classList.add('glow'));
    if (free) freeTurns(true);
    else if (turnsOn()) { calling = true; await ctl.call(); calling = false; }
    await new Promise((resolve) => {
      nodes.forEach((n) => onTap(n, async () => {
        if (n.classList.contains('done') || calling || !ctl.alive) return;
        n.classList.add('done');
        n.classList.remove('glow');
        if (!free) { passTurn(); calling = turnsOn(); }
        await onEach(n);
        left -= 1;
        if (left === 0) { calling = false; resolve(); return; }
        if (calling) { await ctl.call().catch(() => {}); calling = false; }
      }));
      ctl.cleanups.push(() => resolve());
    });
    if (free) freeTurns(false);
    guard();
  }
  // 圖卡選擇：3 歲版對的發亮、選項少；6 歲版要自己判斷（一起玩時看輪到誰）
  async function cards(right, wrongs, wrongLine) {
    await ctl.call();
    const isHard = two ? PROFILES[whoseTurn()].level === 'hard' : hard;
    const items = shuffle([{ svg: right, ok: true }, ...(isHard ? wrongs : wrongs.slice(0, 1)).map((svg) => ({ svg, ok: false }))]);
    cardsBox.innerHTML = items.map((c, i) => `<button class="pk-card${!isHard && c.ok ? ' glow' : ''}" data-i="${i}">${c.svg}</button>`).join('');
    cardsBox.classList.remove('hidden');
    await new Promise((resolve) => {
      let busy = false;
      $$('.pk-card', cardsBox).forEach((b) => onTap(b, async () => {
        if (busy) return;
        const it = items[+b.dataset.i];
        if (!it.ok) {
          busy = true;
          sfx('wrong');
          b.classList.add('nope');
          await host(wrongLine);
          b.classList.remove('nope');
          $$('.pk-card', cardsBox).forEach((x) => x.classList.toggle('glow', items[+x.dataset.i].ok));
          busy = false;
          return;
        }
        busy = true;
        sfx('sparkle');
        b.classList.add('picked');
        confetti(b, 12);
        resolve();
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    passTurn();
    await pause(600);
    cardsBox.classList.add('hidden');
  }
  function addThing(cls, html, [x, y], extra = '', style = '') {
    const n = el(`<button class="pk-thing ${cls}" style="left:${x}px;top:${y}px;${style}" ${extra}>${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const kidHome = (i) => [680 + i * 120, 780];

  // ================= 溜滑梯 =================
  async function slide() {
    const tt = who(HOST);
    const du = who('dudu');
    await host('pk_slide_line');
    guard();
    // 排隊：跳跳第一個，小孩接著，嘟嘟在旁邊
    await Promise.all([moveTo(tt, SLIDE.bottom), ...kids.map((id, i) => moveTo(kidEl(id), QUEUE[i])), moveTo(du, [880, 760])]);
    // 嘟嘟插隊
    await say('dudu', 'pk_cut');
    guard();
    await moveTo(du, [250, 740], 600);
    await host('pk_cut_tap');
    guard();
    du.classList.add('glow-c');
    await ctl.tapOnce(du);
    guard();
    du.classList.remove('glow-c');
    sfx('pop');
    await say('dudu', 'pk_cut_sorry');
    guard();
    await moveTo(du, QUEUE[kids.length], 700);
    // 跳跳先溜
    await host('pk_slide_me');
    guard();
    await climbAndSlide(tt);
    await moveTo(tt, [120, 760], 500);
    // 6 歲版（一起玩也有）：哪一個是安全的溜法
    if (hard || two) {
      await host('pk_slide_rule');
      guard();
      await cards(CARDS.slide_ok, [CARDS.slide_head, CARDS.slide_climb], 'pk_slide_wrong');
      await host('pk_slide_right');
      guard();
    }
    // 小孩一個一個溜
    const order = turnsOn() ? [whoseTurn(), otherKid()] : kids;
    for (const [i, id] of order.entries()) {
      const k = kidEl(id);
      await moveTo(k, SLIDE.bottom, 500);
      if (i === 0) { await host('pk_slide_you'); guard(); }
      if (turnsOn()) setTurn(id);
      k.classList.add('glow');
      await ctl.tapOnce(k);
      guard();
      k.classList.remove('glow');
      await climbAndSlide(k);
      if (i === 0) { await host('pk_slide_exit'); guard(); }
      if (turnsOn()) setTurn(id);
      k.classList.add('glow');
      await ctl.tapOnce(k);
      guard();
      k.classList.remove('glow');
      sfx('pop');
      await moveTo(k, kidHome(kids.indexOf(id)), 500);
      // 後面的人往前排
      if (i === 0 && order.length > 1) await moveTo(kidEl(order[1]), QUEUE[0], 400);
    }
    // 嘟嘟最後溜
    await moveTo(du, SLIDE.bottom, 500);
    await climbAndSlide(du);
    await moveTo(du, [880, 760], 600);
    await host('pk_slide_done');
    guard();
  }
  async function climbAndSlide(node) {
    await moveTo(node, SLIDE.bottom, 400);
    await moveTo(node, SLIDE.top, 900);
    await pause(250);
    sfx('whoosh');
    node.classList.add('sliding');
    await moveTo(node, SLIDE.end, 650);
    node.classList.remove('sliding');
    await moveTo(node, SLIDE.exit, 350);
  }

  // ================= 盪鞦韆 =================
  function seat(kind) {
    $('.seat', swing).innerHTML = kind ? swingRider(kind) : '';
  }
  // 盪一下：往前再回來，停在後面
  async function swingOnce() {
    swing.classList.remove('go', 'wait');
    void swing.getBoundingClientRect();
    swing.classList.add('go');
    sfx('whoosh');
    await pause(1300);
    swing.classList.remove('go');
    swing.classList.add('wait');
  }
  // 推 n 下：鞦韆停在後面發亮，點一下推一下，跳跳數數
  async function pushes(n, { event = false, pusher = null } = {}) {
    // 鞦韆停在後面（轉 -24 度）時，座位的位置
    const bx = SWING.x + SWING.len * 0.4067;
    const by = SWING.y + SWING.len * 0.9135;
    const push = addThing('pk-push', '', [bx - 85, by - 150]);
    for (let i = 1; i <= n; i++) {
      swing.classList.add('wait');
      push.classList.add('glow');
      await new Promise((resolve) => {
        const hnd = (e) => { e.preventDefault(); push.removeEventListener('pointerdown', hnd); resolve(); };
        push.addEventListener('pointerdown', hnd);
        ctl.cleanups.push(() => { push.removeEventListener('pointerdown', hnd); resolve(); });
      });
      guard();
      push.classList.remove('glow');
      const sw = swingOnce();
      await speak(HOST, `n_${i}`, { node: who(HOST) });
      await sw;
      guard();
      if (event && i === 5) await duduWalks(pusher);
    }
    push.remove();
  }
  // 嘟嘟走到鞦韆前面
  async function duduWalks(pusher) {
    const du = who('dudu');
    await say('dudu', 'pk_swing_walk');
    guard();
    await moveTo(du, [SWING.x, 760], 900);
    await host('pk_swing_stop');
    guard();
    du.classList.add('glow-c');
    await ctl.tapOnce(du);
    guard();
    du.classList.remove('glow-c');
    // 點完嘟嘟，還是同一個人繼續推
    if (pusher && turnsOn()) setTurn(pusher);
    sfx('pop');
    await say('dudu', 'pk_swing_dudu_ok');
    guard();
    await moveTo(du, [1060, 600], 900);
    await host('pk_swing_rule');
    guard();
  }
  async function swingPlay() {
    const tt = who(HOST);
    await Promise.all([moveTo(tt, [SWING.x - 190, 700]), ...kids.map((id, i) => moveTo(kidEl(id), [560 + i * 120, 790])), moveTo(who('dudu'), [1060, 600])]);
    await host('pk_swing');
    guard();
    if (!two) {
      // 跳跳坐、小孩推
      tt.classList.add('away');
      seat(HOST);
      await host('pk_swing_push');
      guard();
      await pushes(10, { event: true });
      await host('pk_swing_switch');
      guard();
      // 換小孩坐、跳跳推（自動）
      seat(null);
      tt.classList.remove('away');
      const k = kidEl(kids[0]);
      k.classList.add('away');
      seat(kids[0]);
      await host('pk_swing_me_push');
      guard();
      for (let i = 1; i <= 10; i++) {
        const sw = swingOnce();
        await speak(HOST, `n_${i}`, { node: tt });
        await sw;
        guard();
      }
      seat(null);
      k.classList.remove('away');
    } else {
      // 一起玩：一個坐、一個推，數到十換人
      await host('pk_swing_two');
      guard();
      const [a, b] = [whoseTurn(), otherKid()];
      for (const [pusher, rider, ev] of [[a, b, true], [b, a, false]]) {
        kidEl(rider).classList.add('away');
        seat(rider);
        await callKid(pusher);
        await pushes(10, { event: ev, pusher });
        passTurn();
        seat(null);
        kidEl(rider).classList.remove('away');
        if (ev) { await host('pk_swing_switch'); guard(); }
      }
    }
    swing.classList.remove('wait');
    await host('pk_swing_done');
    guard();
  }

  // ================= 沙坑 =================
  async function sand() {
    await Promise.all([moveTo(who(HOST), [820, 860]), ...kids.map((id, i) => moveTo(kidEl(id), [760 + i * 110, 650]))]);
    await host('pk_sand');
    guard();
    const spots = [[900, 700], [990, 740], [1070, 696], [1110, 756]];
    const finds = shuffle(['shell', 'star', 'car', 'gem']);
    const mounds = spots.map(([x, y], i) => addThing('pk-mound', PK.mound, [x - 60, y - 40], `data-f="${finds[i]}"`));
    let first = true;
    await tapEach(mounds, async (m) => {
      sfx('scrub');
      m.innerHTML = PK[m.dataset.f];
      m.classList.add('found');
      confetti(m, 8);
      if (first) { first = false; await host('pk_dig_found'); } else { sfx('sparkle'); await pause(400); }
    });
    mounds.forEach((m) => m.remove());
    // 蓋沙堡
    const castle = addThing('pk-castle', PK.castle(0), [930, 590]);
    const bucket = addThing('pk-bucket', PK.bucket, [880, 520]);
    await host('pk_castle');
    guard();
    for (let i = 1; i <= 4; i++) {
      bucket.classList.add('glow');
      await ctl.tapOnce(bucket);
      guard();
      bucket.classList.remove('glow');
      sfx('pop');
      castle.innerHTML = PK.castle(i);
      castle.classList.remove('grow'); void castle.offsetWidth; castle.classList.add('grow');
      await pause(350);
    }
    confetti(castle, 16);
    sfx('fanfare');
    await host('pk_castle_done');
    guard();
    // 洗手
    const faucet = addThing('pk-faucet', PK.faucet, [1054, 410]);
    await host('pk_sand_wash');
    guard();
    faucet.classList.add('glow');
    await ctl.tapOnce(faucet);
    guard();
    faucet.classList.remove('glow');
    faucet.classList.add('on');
    sfx('water');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [1000 + i * 70, 650], 500)));
    await pause(1200);
    faucet.classList.remove('on');
    await host('pk_sand_clean');
    guard();
    [castle, bucket, faucet].forEach((n) => n.remove());
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), kidHome(i), 500)));
  }

  // ================= 小插曲 =================
  async function litter() {
    await host('pk_litter');
    guard();
    const spots = [[300, 800], [460, 760], [760, 820], [820, 600]];
    const kinds = ['can', 'paper', 'bottle', 'peel'];
    const bits = spots.map(([x, y], i) => addThing('pk-litter', PK[kinds[i]], [x - 38, y - 38]));
    const bin = { x: 580, y: 690, w: 60, h: 60 };
    await tapEach(bits, async (b) => {
      sfx('pop');
      const from = ctl.rectOf(b);
      b.classList.add('gone');
      await ctl.fly(b.innerHTML, from, bin, 450);
      b.remove();
    });
    sfx('fanfare');
    await host('pk_litter_done');
    guard();
  }
  async function waterBreak() {
    await host('pk_water');
    guard();
    const bottle = addThing('pk-bottle', itemIcon('bottle', 110), [560, 520]);
    bottle.classList.add('glow');
    await ctl.tapOnce(bottle);
    guard();
    bottle.classList.remove('glow');
    sfx('munch');
    await pause(500);
    bottle.remove();
    await praise();
    guard();
  }
  async function hotBreak() {
    await host('pk_hot');
    guard();
    // 戴帽子、喝水（托盤裡；6 歲版多兩樣用不到的）
    const need = ['hat', 'bottle'];
    const all = hard ? ['hat', 'bottle', 'scarf', 'umbrella'] : need;
    tray.innerHTML = shuffle(all).map((k) => `<button class="tbtn${hard ? '' : ' glow'}" data-k="${k}">${itemIcon(k, 100)}</button>`).join('');
    tray.classList.remove('hidden');
    const got = new Set();
    while (got.size < need.length) {
      const b = await ctl.pickFromTray(tray, { drag: false });
      guard();
      if (!b) return;
      if (!need.includes(b.dataset.k)) { sfx('wrong'); b.classList.add('nope'); await pause(400); b.classList.remove('nope'); continue; }
      b.classList.add('used');
      b.classList.remove('glow');
      got.add(b.dataset.k);
      sfx('pop');
      await pause(300);
    }
    tray.classList.add('hidden');
    // 到大樹下
    await host('pk_shade');
    guard();
    const tree = addThing('pk-tree', '', [20, 120]);
    tree.classList.add('glow');
    await ctl.tapOnce(tree);
    guard();
    tree.remove();
    await Promise.all([moveTo(who(HOST), [120, 640]), ...kids.map((id, i) => moveTo(kidEl(id), [230 + i * 110, 650]))]);
    await praise();
    guard();
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), kidHome(i), 600)));
  }

  // ================= 安全練習（每天一次） =================
  const needSafety = () => kids.some((id) => state.profiles[id].parkSafe !== dateKey());
  async function safety() {
    const st = addThing('pk-stranger', PK.stranger, [960, 380]);
    st.disabled = true;
    await pause(600);
    await host('pk_stranger');
    guard();
    await cards(CARDS.stranger_no, [CARDS.stranger_take, CARDS.stranger_follow], 'pk_stranger_wrong');
    await host('pk_stranger_right');
    guard();
    st.classList.add('gone');
    await pause(500);
    st.remove();
    if (hard || two) {
      await host('pk_lost');
      guard();
      await cards(CARDS.lost_stay, [CARDS.lost_run, CARDS.stranger_follow], 'pk_lost_wrong');
      await host('pk_lost_right');
      guard();
    }
    kids.forEach((id) => { state.profiles[id].parkSafe = dateKey(); });
    save();
  }

  // ================= 回家、給獎 =================
  async function goHome() {
    await host('pk_pack');
    guard();
    const toys = [addThing('pk-toy', PK.bucket, [880, 690]), addThing('pk-toy', PK.shell, [1040, 720])];
    await tapEach(toys, async (t) => { sfx('pop'); const from = ctl.rectOf(t); t.classList.add('gone'); await ctl.fly(t.innerHTML, from, { x: 640, y: 640, w: 50, h: 50 }, 400); t.remove(); });
    await host('pk_bye_dudu');
    guard();
    const du = who('dudu');
    du.classList.add('glow-c');
    await ctl.tapOnce(du);
    guard();
    du.classList.remove('glow-c');
    du.classList.add('wave');
    await say('dudu', 'pk_dudu_bye');
    guard();
    du.classList.remove('wave');
  }
  async function celebrate() {
    sfx('fanfare');
    confetti(who(HOST), 16);
    const slot = currentSlot(REWARD_SLOTS.park, hour());
    const winners = slot ? kids.filter((id) => !hasClaimed(id, `park_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, HOST);
        addItem(id, item);
        claim(id, `park_${slot}`);
        return { id, item };
      });
      save();
      const node = el(`<div class="gift">${gifts.map((g) => `<div class="card">${itemSvg(g.item, 210)}${two ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('')}</div>`);
      root.appendChild(node);
      sfx('sparkle');
      await host('gift');
      await pause(600);
      node.classList.add('away');
      sfx('whoosh');
      await pause(650);
      node.remove();
    } else {
      await host('practice');
    }
    guard();
    await host('pk_mission');
    guard();
  }

  // ================= 三種流程 =================
  const SPOTS = {
    slide: [140, 250, 520, 420],
    swing: [660, 230, 280, 440],
    sand: [866, 650, 320, 190],
  };
  const ACT = { slide, swing: swingPlay, sand };
  async function pickSpot(left, first) {
    const btns = left.map((k) => {
      const [x, y, w, hh] = SPOTS[k];
      return addThing('pk-spot glow', '', [x, y], `data-k="${k}"`, `width:${w}px;height:${hh}px`);
    });
    await host(first ? 'pk_pick' : 'pk_more');
    guard();
    await ctl.call();
    const k = await new Promise((resolve) => {
      btns.forEach((b) => onTap(b, () => resolve(b.dataset.k)));
      ctl.cleanups.push(() => resolve(null));
    });
    guard();
    passTurn();
    sfx('tap');
    btns.forEach((b) => b.remove());
    return k;
  }

  async function day() {
    await host('pk_hello');
    guard();
    await say('dudu', 'pk_dudu_hi');
    guard();
    if (hot) await hotBreak();
    const left = ['slide', 'swing', 'sand'];
    let n = 0;
    while (left.length) {
      const k = await pickSpot(left, n === 0);
      left.splice(left.indexOf(k), 1);
      await ACT[k]();
      n += 1;
      if (n === 1) { if (needSafety()) await safety(); else if (!hot) await waterBreak(); }
      if (n === 2) await litter();
      if (ctl.timeUp) break;
    }
    if (!ctl.timeUp) await goHome();
    await celebrate();
    afterwards();
  }

  async function rainy() {
    await host('pk_hello');
    guard();
    await host('pk_rain');
    guard();
    const du = who('dudu');
    await say('dudu', 'pk_rain_dudu');
    guard();
    await moveTo(du, SLIDE.bottom, 900);
    await host('pk_rain_stop');
    guard();
    du.classList.add('glow-c');
    await ctl.tapOnce(du);
    guard();
    du.classList.remove('glow-c');
    sfx('pop');
    await say('dudu', 'pk_rain_ok');
    guard();
    await moveTo(du, [860, 760], 800);
    // 選鞋子
    await host('pk_boots');
    guard();
    await cards(CARDS.boots, [CARDS.sneakers], 'pk_boots_wrong');
    await host('pk_boots_right');
    guard();
    // 踩水坑
    await host('pk_puddle');
    guard();
    const spots = [[330, 790], [520, 740], [760, 800], [960, 760]];
    const puddles = spots.map(([x, y]) => addThing('pk-puddle', PK.puddle, [x - 100, y - 35]));
    await tapEach(puddles, async (p) => {
      sfx('bubble');
      p.classList.add('splash');
      const c = centerOf(p);
      burst(c.x, c.y, { n: 10, kind: 'star', spread: 90 });
      const k = kidEl(whoseTurn() || kids[0]) || kidEl(kids[0]);
      await moveTo(k, [parseFloat(p.style.left) + 100, parseFloat(p.style.top) + 40], 450);
      k.classList.add('jump');
      await pause(400);
      k.classList.remove('jump');
    });
    // 涼亭
    await host('pk_pavilion');
    guard();
    const pav = $('.pk-pav', root);
    pav.classList.add('glow');
    await ctl.tapOnce(pav);
    guard();
    pav.classList.remove('glow');
    await Promise.all([moveTo(who(HOST), [980, 600]), moveTo(du, [1120, 600]), ...kids.map((id, i) => moveTo(kidEl(id), [1010 + i * 70, 560]))]);
    await host('pk_rain_done');
    guard();
    if (needSafety()) await safety();
    await celebrate();
    afterwards();
  }

  async function nightPark() {
    await host('pk_night');
    guard();
    const total = hard || two ? 10 : 5;
    const pts = [[200, 120], [330, 220], [460, 150], [600, 240], [720, 130], [840, 220], [960, 140], [1080, 250], [380, 330], [900, 340]].slice(0, total);
    const flies = pts.map(([x, y], i) => addThing('pk-ff', PK.firefly, [x, y], '', `animation-delay:${i * 0.2}s`));
    let count = 0;
    await tapEach(flies, async (f) => {
      count += 1;
      f.classList.add('lit');
      sfx('sparkle');
      await speak(HOST, `n_${count}`, { node: who(HOST) });
    });
    await host('pk_night_home');
    guard();
    ctl.mode = 'done';
    if (ctl.timeUp) ctl.goodbye();
  }

  // 做完以後：還可以再玩（練習，不再給獎）
  async function afterwards() {
    ctl.mode = 'done';
    if (ctl.timeUp) { ctl.goodbye(); return; }
    if (rain) return;
    while (ctl.alive && !ctl.timeUp) {
      const k = await pickSpot(['slide', 'swing', 'sand'], false);
      if (!k) return;
      ctl.mode = 'act';
      await ACT[k]();
      ctl.mode = 'done';
    }
    if (ctl.timeUp) ctl.goodbye();
  }

  (async () => {
    playMusic(night ? 'bath_night' : 'park');
    await wait(400);
    try {
      ctl.mode = 'act';
      if (night) await nightPark();
      else if (rain) await rainy();
      else await day();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return ctl.api;
}

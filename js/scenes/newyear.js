// 過年房間（除夕前 7 天到元宵節）。內容依日子不同：
//   prep 大掃除、貼春聯｜eve 年獸故事、年夜飯｜days 拜年、紅包、存錢筒、煙火安全｜lantern 提燈籠、燈謎、吃湯圓
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import * as fest from '../core/festival.js';
import { makeScene, charDiv } from './party.js';
import {
  FU, COUPLET, LANTERN, nyRoom, DUST, TOYS, DUSTPILE, NIAN, TOOLS, DISHES, EASY_DISHES, DISH_QUIZ,
  ENVELOPE, PIGGY, HANDS, SAFE_CARD, RUN_CARD, LANTERNS, RIDDLE, BOWL, lanternStreet, fireworkSky, fireworkSvg,
} from '../art/newyear.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { turnsOn, turnCall, passTurn, freeTurns, setTurn, callTurn, whoseTurn, otherKid, evenCount } from '../core/turns.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const nest = (svg, x, y) => svg.replace('<svg ', `<svg x="${x}" y="${y}" `);
// 已經貼好的春聯與倒福（除夕以後的客廳）
const DOOR_DONE = `<svg class="door-done" viewBox="0 0 1200 900">${nest(COUPLET, 716, 150)}${nest(COUPLET, 1104, 150)}${nest(FU(150, true), 875, 190)}</svg>`;
// 拜年收紅包：一起玩時兩個頭像（妍卉左下、向澤右下），紅包各疊在自己旁邊
const ENV_X = { solo: (n) => 220 + n * 26, yh: (n) => 175 + n * 22, xz: (n) => 965 - n * 22 };
const kidAvs = (profile) => (profile.members.length > 1
  ? profile.members.map((id) => `<div class="ny-kid k-${id}" data-id="${id}">${avatarSvg(id, 130)}</div>`).join('')
  : `<div class="ny-kid">${avatarSvg(profile.members[0], 130)}</div>`);
const kidAv = (profile) => `<div class="ny-kid">${avatarSvg(profile.members.length > 1 ? 'both' : profile.members[0], 130)}</div>`;

export function mountNewYear(stage, opts) {
  const ny = fest.newYear() || { stage: 'days', zodiac: '' };
  const fn = { prep: mountPrep, eve: mountEve, days: mountDays, lantern: mountLantern }[ny.stage];
  return fn(stage, opts, ny);
}

// 共用：每天一次的新年獎品
async function nyGift(ctl, profile, host, say, first = null) {
  const winners = profile.members.filter((id) => !hasClaimed(id, 'ny_day'));
  if (!winners.length) { await say(host, 'practice'); return; }
  const gifts = winners.map((id) => {
    const col = state.profiles[id].collection;
    const item = first && !col[first] ? first : nextItem(col, 'newyear');
    addItem(id, item);
    claim(id, 'ny_day');
    return { id, item };
  });
  save();
  const node = el(`<div class="gift">${gifts.map((g) => `<div class="card">${itemSvg(g.item, 210)}${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('')}</div>`);
  ctl.root.appendChild(node);
  sfx('sparkle');
  await say(host, 'gift');
  await ctl.pause(600);
  node.classList.add('away');
  await ctl.pause(650);
  node.remove();
}

// 共用：圖卡選擇（3 歲版對的會亮）
// 一起玩：先唱名，選對了換人
async function chooseCards(ctl, box, right, wrongs, hard, onWrong) {
  await ctl.call();
  await chooseCardsRaw(ctl, box, right, wrongs, hard, onWrong);
  passTurn();
}
function chooseCardsRaw(ctl, box, right, wrongs, hard, onWrong) {
  const items = shuffle([{ ok: true, svg: right }, ...wrongs.map((svg) => ({ ok: false, svg }))]);
  box.innerHTML = items.map((c, i) => `<button class="tbtn ncard${!hard && c.ok ? ' glow' : ''}" data-i="${i}">${c.svg}</button>`).join('');
  box.classList.remove('hidden');
  return new Promise((resolve) => {
    let busy = false;
    $$('.ncard', box).forEach((b) => onTap(b, async () => {
      if (busy) return;
      if (!items[+b.dataset.i].ok) {
        busy = true;
        sfx('wrong');
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 400);
        await onWrong();
        $$('.ncard', box).forEach((x) => x.classList.toggle('glow', items[+x.dataset.i].ok));
        busy = false;
        return;
      }
      sfx('sparkle');
      const c = centerOf(b);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 120 });
      box.classList.add('hidden');
      resolve();
    }));
    ctl.cleanups.push(() => resolve());
  });
}

const sayer = (ctl, profile) => (id, line) => speak(id, line, { name: profile.name, who: profile.id, node: $(`.p-char[data-who="${id}"]`, ctl.root) });
const finish = async (ctl) => { ctl.mode = 'done'; if (ctl.timeUp) await ctl.goodbye(); };
const run = (ctl, main) => main().catch((e) => { if (e.message !== 'scene-closed') throw e; });

// ================= 除夕前：大掃除、貼春聯 =================
function mountPrep(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const toys = [['ball', 150, 690], ['car', 330, 770], ['bear', 900, 700]];
  const piles = [[200, 830], [640, 830], [1010, 800]];
  const inner = `
    <div class="dustwin">${DUST}</div>
    ${charDiv('dudu', 390, 352, 0.65)}${charDiv('kiki', 560, 352, 0.65)}
    ${toys.map(([k, x, y]) => `<button class="toy" data-k="${k}" style="left:${x}px;top:${y}px">${TOYS[k]}</button>`).join('')}
    ${piles.map(([x, y], i) => `<button class="pile" data-i="${i}" style="left:${x - 60}px;top:${y - 35}px">${DUSTPILE}</button>`).join('')}
    <div class="door-items"></div>
    <div class="p-tray hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'dudu', { cls: 'newyear', back: nyRoom(ph, weather.current()) });
  const { root, guard, pause } = ctl;
  const say = sayer(ctl, profile);
  const tray = $('.p-tray', root);

  async function rubWindow() {
    const win = $('.dustwin', root);
    win.classList.add('glow');
    freeTurns(true);   // 擦窗戶：兩個人可以一起擦
    ctl.cleanups.push(() => freeTurns(false));
    const need = hard ? 3200 : 1600;
    let dist = 0;
    let last = null;
    let lastSfx = 0;
    await new Promise((resolve) => {
      const k = () => stage.getBoundingClientRect().width / 1200;
      const down = (e) => { e.preventDefault(); last = { x: e.clientX, y: e.clientY }; };
      const move = (e) => {
        if (!last) return;
        const d = Math.hypot(e.clientX - last.x, e.clientY - last.y) / k();
        last = { x: e.clientX, y: e.clientY };
        dist += d;
        win.style.opacity = String(Math.max(0, 1 - dist / need));
        if (performance.now() - lastSfx > 180) { sfx('rub'); lastSfx = performance.now(); }
        if (dist >= need) { off(); resolve(); }
      };
      const up = () => { last = null; };
      const off = () => { win.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      win.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      ctl.cleanups.push(() => { off(); resolve(); });
    });
    guard();
    freeTurns(false);
    win.classList.remove('glow');
    win.classList.add('hidden');
    sfx('sparkle');
    burst(...Object.values(centerOf(win)), { n: 14, kind: 'star', spread: 160 });
  }
  // free：兩個人可以一起點（掃灰塵）；不然輪流，一人一個
  async function tapAll(sel, onEach, { free = false } = {}) {
    const nodes = $$(sel, root);
    if (!hard) nodes.forEach((n) => n.classList.add('glow'));
    else nodes.forEach((n) => n.classList.add('live'));
    let left = nodes.length;
    let calling = false;
    if (free) freeTurns(true);
    else if (turnsOn()) { calling = true; await ctl.call(); calling = false; }
    await new Promise((resolve) => {
      nodes.forEach((n) => onTap(n, async () => {
        if (n.classList.contains('done') || calling) return;
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

  async function main() {
    ctl.mode = 'act';
    playMusic('newyear');
    await say('dudu', 'ny_clean_intro');
    guard();
    await say('dudu', 'ny_window');
    guard();
    await rubWindow();
    await say('dudu', 'praise2');
    guard();
    await say('kiki', 'ny_toys');
    guard();
    await tapAll('.toy', async (n) => {
      sfx('pop');
      const from = ctl.rectOf(n);
      n.classList.add('gone');
      await ctl.fly(TOYS[n.dataset.k], from, { x: 630, y: 600, w: 60, h: 60 }, 450);
    });
    await say('dudu', 'ny_sweep');
    guard();
    await tapAll('.pile', async (n) => { sfx('scrub'); n.classList.add('gone'); await wait(300); }, { free: true });
    sfx('fanfare');
    await say('dudu', 'ny_clean_done');
    guard();
    // 貼春聯與福
    await say('kiki', 'ny_couplet');
    guard();
    const items = [['l', COUPLET], ['r', COUPLET], ['fu', FU(110, false)]];
    tray.innerHTML = items.map(([k, svg]) => `<button class="tbtn glow" data-k="${k}">${svg.replace(/width="\d+" height="\d+"/, 'width="90" height="110"')}</button>`).join('');
    tray.classList.remove('hidden');
    const spot = { l: [716, 150, 80, 360], r: [1104, 150, 80, 360], fu: [875, 190, 150, 150] };
    const door = $('.door-items', root);
    for (let i = 0; i < items.length; i++) {
      const b = await ctl.pickFromTray(tray, { drag: hard, accept: (x, y) => x > 650 && y < 560 });
      guard();
      b.classList.add('used');
      const [x, y, w, h] = spot[b.dataset.k];
      const svg = b.dataset.k === 'fu' ? FU(150, false) : COUPLET;
      await ctl.fly(svg, ctl.rectOf(b), { x, y, w, h }, 450);
      guard();
      door.insertAdjacentHTML('beforeend', `<div class="dpiece ${b.dataset.k}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${svg}</div>`);
      sfx('pop');
    }
    tray.classList.add('hidden');
    const fu = $('.dpiece.fu', door);
    await say('dudu', 'ny_fu_flip');
    guard();
    fu.classList.add('glow');
    await ctl.tapOnce(fu);
    guard();
    fu.classList.remove('glow');
    fu.classList.add('flip');
    sfx('sparkle');
    burst(...Object.values(centerOf(fu)), { n: 16, kind: 'star', spread: 160 });
    await say('kiki', 'ny_fu_dao');
    guard();
    await nyGift(ctl, profile, 'dudu', say);
    guard();
    await say('dudu', 'ny_m_clean');
    await finish(ctl);
  }
  run(ctl, main);
  return ctl.api;
}

// ================= 除夕：年獸、年夜飯 =================
function mountEve(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const inner = `
    ${DOOR_DONE}
    <div class="ny-red hidden"><svg viewBox="0 0 1200 200" width="1200" height="200"><path d="M0 20Q600 70 1200 20" stroke="#8a5a2b" stroke-width="4" fill="none"/>${[90, 300, 520, 700].map((x) => nest(LANTERN('#e8262d', false).replace(/width="120" height="170"/, 'width="84" height="120"'), x - 42, 34)).join('')}</svg></div>
    ${charDiv('kiki', 60, 352, 0.65)}${charDiv('gugu', 230, 340, 0.65)}${charDiv('bobo', 400, 352, 0.65)}${charDiv('mian', 570, 360, 0.62)}
    <div class="nian">${NIAN}</div>
    <svg class="nytable hidden" viewBox="0 0 1200 900"><ellipse cx="560" cy="700" rx="380" ry="80" fill="#c0392b"/><ellipse cx="560" cy="690" rx="370" ry="72" fill="#e04a3a"/></svg>
    <div class="dishes"></div>
    <div class="p-tray hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'gugu', { cls: 'newyear', back: nyRoom(ph, weather.current()) });
  const { root, guard, pause } = ctl;
  const say = sayer(ctl, profile);
  const tray = $('.p-tray', root);
  const nian = $('.nian', root);
  const DISH_SPOTS = [[300, 640], [480, 600], [660, 640], [820, 600]];

  async function scare() {
    const keys = hard ? shuffle(Object.keys(TOOLS)) : ['red', 'drum', 'light'];
    tray.innerHTML = keys.map((k) => `<button class="tbtn${hard ? '' : ' glow'}" data-k="${k}">${TOOLS[k].svg}</button>`).join('');
    tray.classList.remove('hidden');
    let scared = 0;
    while (scared < 3) {
      const b = await ctl.pickFromTray(tray, { drag: false });
      guard();
      const k = b.dataset.k;
      if (!TOOLS[k].ok) {
        sfx('wrong');
        b.classList.add('used');
        await say('kiki', 'ny_tool_wrong');
        guard();
        continue;
      }
      b.classList.add('used');
      b.classList.remove('glow');
      scared += 1;
      if (k === 'red') { $('.ny-red', root).classList.remove('hidden'); sfx('pop'); await say('kiki', 'ny_t_red'); }
      if (k === 'drum') { sfx('drum'); root.classList.add('shake'); setTimeout(() => root.classList.remove('shake'), 700); await say('bobo', 'ny_t_drum'); }
      if (k === 'light') { root.classList.add('bright'); sfx('sparkle'); await say('mian', 'ny_t_light'); }
      guard();
      nian.className = `nian in scared s${scared}`;
      sfx('roar');
      await pause(700);
    }
    tray.classList.add('hidden');
  }

  async function dinner() {
    $('.nytable', root).classList.remove('hidden');
    await say('bobo', 'ny_dinner');
    guard();
    const dishes = $('.dishes', root);
    const place = async (b, k, i) => {
      const [x, y] = DISH_SPOTS[i];
      await ctl.fly(DISHES[k].svg, ctl.rectOf(b), { x: x - 80, y: y - 55, w: 160, h: 110 }, 450);
      guard();
      dishes.insertAdjacentHTML('beforeend', `<div class="dish" style="left:${x - 80}px;top:${y - 55}px">${DISHES[k].svg}</div>`);
      sfx('pop');
      await say('bobo', DISHES[k].line);
      guard();
    };
    if (!hard) {
      tray.innerHTML = EASY_DISHES.map((k) => `<button class="tbtn glow dishbtn" data-k="${k}">${DISHES[k].svg}</button>`).join('');
      tray.classList.remove('hidden');
      for (let i = 0; i < EASY_DISHES.length; i++) {
        const b = await ctl.pickFromTray(tray, { drag: false });
        guard();
        b.classList.add('used');
        b.classList.remove('glow');
        await place(b, b.dataset.k, i);
      }
    } else {
      const qs = shuffle(DISH_QUIZ).slice(0, 3);
      tray.innerHTML = shuffle(Object.keys(DISHES)).map((k) => `<button class="tbtn dishbtn" data-k="${k}">${DISHES[k].svg}</button>`).join('');
      tray.classList.remove('hidden');
      for (let i = 0; i < qs.length; i++) {
        const [want, q] = qs[i];
        await say('bobo', q);
        guard();
        for (;;) {
          const b = await ctl.pickFromTray(tray, { drag: false });
          guard();
          if (b.dataset.k !== want) {
            sfx('wrong');
            b.classList.add('nope');
            setTimeout(() => b.classList.remove('nope'), 400);
            await say('bobo', 'ny_q_wrong');
            guard();
            $(`.dishbtn[data-k="${want}"]`, tray).classList.add('glow');
            continue;
          }
          b.classList.add('used');
          b.classList.remove('glow');
          await place(b, want, i);
          break;
        }
      }
    }
    tray.classList.add('hidden');
  }

  async function main() {
    ctl.mode = 'act';
    playMusic('newyear');
    await say('gugu', 'ny_story1');
    guard();
    nian.classList.add('in');
    sfx('roar');
    await pause(900);
    await say('gugu', 'ny_story2');
    guard();
    await scare();
    await say('mian', 'ny_nian_sad');
    guard();
    nian.className = 'nian in friend';
    await say('kiki', 'ny_invite');
    guard();
    sfx('fanfare');
    burst(...Object.values(centerOf(nian)), { n: 18, kind: 'star', spread: 200 });
    await pause(400);
    await dinner();
    await say('gugu', 'ny_together');
    guard();
    await nyGift(ctl, profile, 'gugu', say, 'ny_nian');
    guard();
    await say('gugu', 'ny_m_eve');
    await finish(ctl);
  }
  run(ctl, main);
  return ctl.api;
}

// ================= 初一到十四：拜年、紅包、存錢筒、煙火 =================
function mountDays(stage, { profile, onExit }, ny) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const order = ['kiki', 'dudu', 'bobo', 'mian', 'gugu'];
  const xs = { kiki: 40, dudu: 260, bobo: 480, mian: 700, gugu: 920 };
  const inner = `
    ${DOOR_DONE}
    ${order.map((id) => charDiv(id, xs[id], 352, 0.65)).join('')}
    ${kidAvs(profile)}
    <div class="envs"></div>
    <div class="hands hidden"><button class="hand l">${HANDS.l}</button><button class="hand r">${HANDS.r}</button></div>
    <button class="piggy hidden">${PIGGY}</button>
    <div class="ncards hidden"></div>
    <div class="fw hidden">${fireworkSky()}</div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'kiki', { cls: 'newyear', back: nyRoom(ph, weather.current()) });
  const { root, guard, pause } = ctl;
  const say = sayer(ctl, profile);
  const envs = $('.envs', root);

  // 6 歲版：兩隻手一起按（0.6 秒內兩手都按到）才收下
  async function twoHands() {
    const box = $('.hands', root);
    box.classList.remove('hidden');
    $$('.hand', box).forEach((h) => h.classList.add('glow'));
    let tries = 0;
    await new Promise((resolve) => {
      const t = { l: 0, r: 0 };
      const h = (side) => (e) => {
        e.preventDefault();
        t[side] = performance.now();
        $(`.hand.${side}`, box).classList.add('down');
        setTimeout(() => $(`.hand.${side}`, box)?.classList.remove('down'), 300);
        if (Math.abs(t.l - t.r) < 600) { off(); resolve(); return; }
        tries += 1;
        if (tries >= 6) { off(); resolve(); }
      };
      const hl = h('l');
      const hr = h('r');
      const off = () => { $('.hand.l', box).removeEventListener('pointerdown', hl); $('.hand.r', box).removeEventListener('pointerdown', hr); };
      $('.hand.l', box).addEventListener('pointerdown', hl);
      $('.hand.r', box).addEventListener('pointerdown', hr);
      ctl.cleanups.push(() => { off(); resolve(); });
    });
    guard();
    box.classList.add('hidden');
  }

  async function baiNian() {
    await say('kiki', 'ny_bai');
    guard();
    let n = 0;
    const left = new Set(order);
    order.forEach((id) => $(`.p-char[data-who="${id}"]`, root).classList.add('glow-c'));
    while (left.size) {
      await ctl.call();
      const id = await new Promise((resolve) => {
        const hs = [];
        for (const c of left) {
          const node = $(`.p-char[data-who="${c}"]`, root);
          const h = (e) => { e.preventDefault(); hs.forEach(([nd, fn]) => nd.removeEventListener('pointerdown', fn)); resolve(c); };
          node.addEventListener('pointerdown', h);
          hs.push([node, h]);
        }
        ctl.cleanups.push(() => { hs.forEach(([nd, fn]) => nd.removeEventListener('pointerdown', fn)); resolve(null); });
      });
      guard();
      passTurn();
      left.delete(id);
      const node = $(`.p-char[data-who="${id}"]`, root);
      node.classList.remove('glow-c');
      root.classList.add('bow');
      setTimeout(() => root.classList.remove('bow'), 700);
      sfx('pop');
      await say(id, 'ny_greet');
      guard();
      if (hard) {
        root.classList.add('hold');
        if (n === 0) { await say('dudu', 'ny_two_hands'); guard(); }
        await twoHands();
        root.classList.remove('hold');
      }
      const from = ctl.rectOf(node);
      // 一起玩：每位角色給兩個小孩各一個紅包
      const kids = profile.members.length > 1 ? profile.members : ['solo'];
      await Promise.all(kids.map((k) => ctl.fly(ENVELOPE, { x: from.x + from.w / 2 - 40, y: from.y + from.h / 2, w: 80, h: 112 }, { x: ENV_X[k](n), y: 700, w: 60, h: 84 }, 500)));
      guard();
      kids.forEach((k) => envs.insertAdjacentHTML('beforeend', `<div class="env" data-k="${k}" style="left:${ENV_X[k](n)}px;top:700px">${ENVELOPE}</div>`));
      sfx('sparkle');
      if (n === 0) { await say('kiki', 'ny_say_thanks'); guard(); }
      n += 1;
    }
  }

  async function piggy() {
    // 打開一個紅包：今天的新年禮物
    if (profile.members.some((id) => !hasClaimed(id, 'ny_day'))) {
      await say('gugu', 'ny_open');
      guard();
      // 每個小孩打開自己的最後一個紅包
      const kids = profile.members.length > 1 ? profile.members : ['solo'];
      // 一起玩：輪流，各打開自己的
      const seq = turnsOn() ? [whoseTurn(), otherKid()] : kids;
      for (const k of seq) {
        const last = $$(`.env[data-k="${k}"]`, envs).pop();
        last.classList.add('glow');
        if (turnsOn()) { setTurn(k); await callTurn(ctl.host, ctl.hostNode()); guard(); }
        await ctl.tapOnce(last, { free: true });
        guard();
        passTurn();
        last.remove();
        sfx('pop');
      }
      guard();
      await nyGift(ctl, profile, 'gugu', say);
      guard();
    }
    await say('mian', 'ny_piggy');
    guard();
    const pg = $('.piggy', root);
    pg.classList.remove('hidden');
    pg.classList.add('glow');
    await ctl.tapOnce(pg);
    guard();
    pg.classList.remove('glow');
    const to = ctl.rectOf(pg);
    for (const e of $$('.env', envs)) {
      ctl.fly(ENVELOPE, ctl.rectOf(e), { x: to.x + to.w * 0.4, y: to.y + 10, w: 30, h: 42 }, 420);
      e.remove();
      sfx('pop');
      await pause(160);
    }
    await pause(400);
    sfx('fanfare');
    pg.classList.add('happy');
    await say('mian', 'ny_saved');
    guard();
    pg.classList.add('hidden');
  }

  async function fireworks() {
    await say('kiki', 'ny_fw');
    guard();
    await chooseCards(ctl, $('.ncards', root), SAFE_CARD, [RUN_CARD], hard, async () => { await say('gugu', 'ny_fw_wrong'); });
    guard();
    await say('gugu', 'ny_fw_right');
    guard();
    const fw = $('.fw', root);
    fw.classList.remove('hidden');
    root.classList.add('ears');
    await say('kiki', 'ny_fw_tap');
    guard();
    freeTurns(true);   // 放煙火：兩個人一起點
    let n = 0;
    await new Promise((resolve) => {
      const h = (e) => {
        e.preventDefault();
        n += 1;
        sfx('boom');
        const sr = stage.getBoundingClientRect();
        const k = sr.width / 1200;
        const x = (e.clientX - sr.left) / k;
        const y = Math.min(560, (e.clientY - sr.top) / k);
        const f = el(`<div class="fwb" style="left:${x - 140}px;top:${y - 140}px">${fireworkSvg(['#ff5c8a', '#ffd34d', '#5fd0ff', '#7dff9a', '#c77dff'][n % 5])}</div>`);
        fw.appendChild(f);
        setTimeout(() => f.remove(), 1400);
        if (n >= 8) { fw.removeEventListener('pointerdown', h); resolve(); }
      };
      fw.addEventListener('pointerdown', h);
      ctl.cleanups.push(() => { fw.removeEventListener('pointerdown', h); resolve(); });
    });
    freeTurns(false);
    guard();
    await say('kiki', 'ny_fw_wow');
    guard();
    fw.classList.add('hidden');
    root.classList.remove('ears');
  }

  async function main() {
    ctl.mode = 'act';
    playMusic('newyear');
    await say('kiki', 'ny_hello_days');
    guard();
    if (ny.zodiac === 'goat') { await say('mian', 'ny_goat'); guard(); }
    await baiNian();
    await pause(300);
    await piggy();
    await pause(300);
    await fireworks();
    await say('gugu', 'ny_m_days');
    await finish(ctl);
  }
  run(ctl, main);
  return ctl.api;
}

// ================= 元宵節：提燈籠、燈謎、湯圓 =================
function mountLantern(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const inner = `
    ${charDiv('kiki', 60, 400, 0.62)}${charDiv('gugu', 860, 380, 0.62)}${charDiv('bobo', 1010, 400, 0.6)}
    ${kidAv(profile)}
    <div class="mylantern hidden"></div>
    <div class="ncards hidden"></div>
    <div class="bowl hidden">${BOWL}</div>
    <div class="p-tray hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'gugu', { cls: 'newyear lantern-night', back: lanternStreet() });
  const { root, guard, pause } = ctl;
  const say = sayer(ctl, profile);
  const tray = $('.p-tray', root);

  async function main() {
    ctl.mode = 'act';
    playMusic('lullaby');
    await say('gugu', 'ny_lantern_hi');
    guard();
    await say('kiki', 'ny_pick_lantern');
    guard();
    tray.innerHTML = Object.keys(LANTERNS).map((k) => `<button class="tbtn glow" data-k="${k}">${LANTERNS[k](false).replace(/width="\d+" height="\d+"/, 'width="100" height="110"')}</button>`).join('');
    tray.classList.remove('hidden');
    const b = await ctl.pickFromTray(tray, { drag: false });
    guard();
    tray.classList.add('hidden');
    const my = $('.mylantern', root);
    my.innerHTML = LANTERNS[b.dataset.k](false);
    my.classList.remove('hidden');
    sfx('pop');
    await say('kiki', 'ny_light');
    guard();
    my.classList.add('glow');
    await ctl.tapOnce(my);
    guard();
    my.classList.remove('glow');
    my.innerHTML = LANTERNS[b.dataset.k](true);
    my.classList.add('lit');
    sfx('sparkle');
    burst(...Object.values(centerOf(my)), { n: 14, kind: 'star', spread: 140 });
    // 散步：點一下往前走
    await say('kiki', 'ny_walk');
    guard();
    const street = $('.p-layer .street', root);
    const steps = evenCount(5);   // 一起玩：一人走三步
    for (let i = 1; i <= steps; i++) {
      root.classList.add('tapwalk');
      await ctl.call();
      await new Promise((resolve) => {
        const h = (e) => { if (e.target.closest('.hud')) return; e.preventDefault(); root.removeEventListener('pointerdown', h); resolve(); };
        root.addEventListener('pointerdown', h);
        ctl.cleanups.push(() => { root.removeEventListener('pointerdown', h); resolve(); });
      });
      guard();
      passTurn();
      street.style.transform = `translateX(${-i * (600 / steps)}px)`;
      my.classList.remove('swing'); void my.offsetWidth; my.classList.add('swing');
      sfx('tap');
    }
    root.classList.remove('tapwalk');
    if (hard) {
      await say('gugu', RIDDLE.q);
      guard();
      await chooseCards(ctl, $('.ncards', root), RIDDLE.right, RIDDLE.wrong, true, async () => { await say('gugu', 's_a_wrong'); });
      guard();
      await say('gugu', 'ny_riddle_ok');
      guard();
    }
    await say('bobo', 'ny_tang');
    guard();
    const bowl = $('.bowl', root);
    bowl.classList.remove('hidden');
    const balls = $$('.tball', bowl);
    const need = hard ? balls.length : Math.min(balls.length, evenCount(3));
    let eaten = 0;
    balls.forEach((x) => x.classList.add('glow'));
    let calling = turnsOn();
    if (calling) ctl.call().catch(() => {}).then(() => { calling = false; });
    await new Promise((resolve) => {
      balls.forEach((x) => onTap(x, async () => {
        if (x.classList.contains('eaten') || calling) return;
        x.classList.add('eaten');
        sfx('munch');
        eaten += 1;
        passTurn();
        if (eaten >= need) { resolve(); return; }
        if (turnsOn()) { calling = true; await ctl.call().catch(() => {}); calling = false; }
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    balls.forEach((x) => x.classList.remove('glow'));
    await say('bobo', 'ny_yum');
    guard();
    bowl.classList.add('hidden');
    await nyGift(ctl, profile, 'gugu', say);
    guard();
    await say('gugu', 'ny_m_lantern');
    await finish(ctl);
  }
  run(ctl, main);
  return ctl.api;
}

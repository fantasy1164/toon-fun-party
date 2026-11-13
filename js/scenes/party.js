// 生日派對（只在生日當天出現）。
// 壽星（或「一起玩」裡有壽星）：布置 → 做蛋糕 → 插蠟燭、許願、唱歌、吹蠟燭 → 拆禮物。
// 另一個小孩自己進來：偷偷幫壽星做一張生日卡，放進壽星的陳列櫃。
import { PROFILES } from '../config.js';
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, stopMusic, playTune, BIRTHDAY_SONG } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as fest from '../core/festival.js';
import { micReady, listenBlow } from '../core/mic.js';
import {
  PARTY_CHARS, partyRoom, DECOR, SPOTS, FLAVORS, cakeSvg, TOPPINGS, TOP_SPOTS, topSvg, candlesSvg,
  GIFT_OF, boxSvg, kidSeat, BIG_CARD,
} from '../art/party.js';
import { characterSvg } from '../art/characters.js';
import { itemSvg, CARD_COLORS, STICKERS, CARD_SPOTS } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
export const charDiv = (id, x, y, s = 0.62) => `<div class="p-char" data-who="${id}" style="left:${x}px;top:${y}px;width:${240 * s}px;height:${320 * s}px">
  <svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg(id)}</svg></div>`;

export function mountParty(stage, opts) {
  const bids = fest.birthdayKids();
  const bid = bids.find((id) => opts.profile.members.includes(id));
  if (bid) return mountCelebrate(stage, opts, bid);
  return mountCard(stage, opts, bids[0] || (opts.profile.members[0] === 'yh' ? 'xz' : 'yh'));
}

// 共用：場景外框、等待、拖曳
export function makeScene(stage, profile, onExit, inner, hostId, { cls = '', back = null } = {}) {
  const ph = phase();
  const root = el(`
    <div class="screen scene party ${cls} ${ph}">
      <div class="p-layer">${back ?? partyRoom(ph)}</div>
      ${inner}
      <div class="dim"></div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const ctl = { root, alive: true, mode: 'intro', timeUp: false, cleanups: [] };
  ctl.guard = () => { if (!ctl.alive) throw new Error('scene-closed'); };
  ctl.pause = async (ms) => { await wait(ms); ctl.guard(); };
  ctl.rectOf = (node) => {
    const sr = stage.getBoundingClientRect();
    const k = sr.width / 1200;
    const r = node.getBoundingClientRect();
    return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k, k, sr };
  };
  ctl.fly = async (html, from, to, ms = 500) => {
    const f = el(`<div class="flyer" style="left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px">${html}</div>`);
    root.appendChild(f);
    void f.getBoundingClientRect();
    f.style.transition = `transform ${ms}ms cubic-bezier(.3,1.2,.5,1)`;
    f.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${to.w / from.w})`;
    await wait(ms + 20);
    f.remove();
  };
  ctl.tapOnce = (node) => new Promise((resolve) => {
    const h = (e) => { e.preventDefault(); node.removeEventListener('pointerdown', h); resolve(); };
    node.addEventListener('pointerdown', h);
    ctl.cleanups.push(() => { node.removeEventListener('pointerdown', h); resolve(); });
  });
  // 托盤：點一下（3 歲）或拖到目標區（6 歲）；accept(x, y) 判斷放下的位置（舞台座標）。回傳被選到的按鈕
  ctl.pickFromTray = (tray, { drag, accept }) => new Promise((resolve) => {
    let ghost = null;
    let src = null;
    const toStage = (e) => {
      const sr = stage.getBoundingClientRect();
      const k = sr.width / 1200;
      return { x: (e.clientX - sr.left) / k, y: (e.clientY - sr.top) / k };
    };
    const down = (e) => {
      const b = e.target.closest('.tbtn:not(.used)');
      if (!b || !tray.contains(b)) return;
      e.preventDefault();
      if (!drag) { done(b); return; }
      src = b;
      const p = toStage(e);
      ghost = el(`<div class="ghost" style="left:${p.x - 60}px;top:${p.y - 60}px">${b.innerHTML}</div>`);
      root.appendChild(ghost);
      b.classList.add('lifting');
    };
    const move = (e) => {
      if (!ghost) return;
      const p = toStage(e);
      ghost.style.left = `${p.x - 60}px`;
      ghost.style.top = `${p.y - 60}px`;
    };
    const up = (e) => {
      if (!ghost) return;
      const p = toStage(e);
      ghost.remove();
      ghost = null;
      src.classList.remove('lifting');
      if (accept(p.x, p.y)) done(src);
      else { sfx('wrong'); src.classList.add('nope'); setTimeout(() => src?.classList.remove('nope'), 400); }
    };
    const off = () => {
      tray.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      ghost?.remove();
    };
    function done(b) { off(); resolve(b); }
    tray.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    ctl.cleanups.push(() => { off(); resolve(null); });
  });
  ctl.destroy = () => {
    if (!ctl.alive) return;
    ctl.alive = false;
    ctl.cleanups.forEach((fn) => fn());
    ctl.blow?.stop();
    hush();
  };
  ctl.goodbye = async () => {
    if (ctl.mode === 'end') return;
    ctl.mode = 'end';
    await speak(hostId, 'bye', { name: profile.name, who: profile.id, node: $(`.p-char[data-who="${hostId}"]`, root) });
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!ctl.alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    ctl.destroy();
    onExit('rest');
  };
  onTap($('.hud .home', root), () => {
    if (ctl.mode === 'end') return;
    sfx('tap');
    ctl.destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });
  ctl.api = {
    destroy: ctl.destroy,
    hostChar: hostId,
    requestEnd() {
      if (ctl.timeUp || !ctl.alive) return;
      ctl.timeUp = true;
      if (ctl.mode === 'done') ctl.goodbye();
    },
  };
  return ctl;
}

// ================= 壽星的派對 =================
function mountCelebrate(stage, { profile, onExit }, bid) {
  const hard = profile.level === 'hard';
  const bname = PROFILES[bid].name;
  const age = Math.max(1, Math.min(10, fest.ageOf(bid) || 1));
  const inner = `
    <div class="p-decor"></div>
    ${PARTY_CHARS.map(([id, x, y]) => charDiv(id, x, y)).join('')}
    <svg class="table" viewBox="0 0 1200 900"><rect x="290" y="640" width="620" height="40" rx="14" fill="#fff" opacity=".95"/><path d="M290 660H910V700Q600 730 290 700Z" fill="#ffb3c7"/><rect x="330" y="700" width="20" height="120" fill="#c8915a"/><rect x="850" y="700" width="20" height="120" fill="#c8915a"/></svg>
    <div class="cake hidden"></div>
    ${kidSeat(bid)}
    <div class="p-tray hidden"></div>
    <div class="gifts hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'kiki');
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = (id, line) => speak(id, line, { name: bname, who: bid, node: who(id) });
  const tray = $('.p-tray', root);
  const cake = $('.cake', root);
  const showTray = (html) => { tray.innerHTML = html; tray.classList.remove('hidden'); };
  const confetti = (node, n = 18) => { const c = centerOf(node); burst(c.x, c.y, { n, kind: 'star', spread: 260 }); };

  // ---------- 一、布置 ----------
  async function decorate() {
    await say('kiki', 'bd_decor');
    guard();
    await say('dudu', hard ? 'bd_decor_hard' : 'bd_decor_easy');
    guard();
    const keys = shuffle(Object.keys(DECOR));
    showTray(keys.map((k) => `<button class="tbtn glow" data-k="${k}">${DECOR[k].svg.replace(/width="\d+" height="\d+"/, 'width="110" height="110"')}</button>`).join(''));
    for (let i = 0; i < keys.length; i++) {
      const b = await ctl.pickFromTray(tray, { drag: hard, accept: (x, y) => y < 470 });
      guard();
      const d = DECOR[b.dataset.k];
      const [cx, cy] = SPOTS[d.spot];
      b.classList.add('used');
      b.classList.remove('glow');
      const from = ctl.rectOf(b);
      await ctl.fly(d.svg, from, { x: cx - d.w / 2, y: cy - d.h / 2, w: d.w, h: d.h }, 480);
      guard();
      $('.p-decor', root).insertAdjacentHTML('beforeend', `<div class="deco" style="left:${cx - d.w / 2}px;top:${cy - d.h / 2}px">${d.svg}</div>`);
      sfx('pop');
      sfx('sparkle');
    }
    tray.classList.add('hidden');
    await say('mian', 'bd_decor_done');
    guard();
  }

  // ---------- 二、做蛋糕 ----------
  async function makeCake() {
    await say('bobo', 'bd_cake');
    guard();
    showTray(Object.keys(FLAVORS).map((k) => `<button class="tbtn glow flavor" data-k="${k}">${cakeSvg(k).replace('width="360" height="300"', 'width="120" height="100"')}</button>`).join(''));
    const b = await ctl.pickFromTray(tray, { drag: false });
    guard();
    const flavor = b.dataset.k;
    tray.classList.add('hidden');
    cake.innerHTML = cakeSvg(flavor);
    cake.classList.remove('hidden');
    sfx('pop');
    confetti(cake, 10);
    await say('bobo', FLAVORS[flavor].line);
    guard();
    await say('bobo', hard ? 'bd_top_hard' : 'bd_top_easy');
    guard();
    const keys = hard ? ['berry', 'cherry', 'cookie', 'blueberry', 'kiwi'] : ['berry', 'cherry', 'cookie'];
    showTray(shuffle(keys).map((k) => `<button class="tbtn glow" data-k="${k}">${topSvg(k, 100)}</button>`).join(''));
    const cr = () => ctl.rectOf(cake);
    for (let i = 0; i < keys.length; i++) {
      const t = await ctl.pickFromTray(tray, {
        drag: hard,
        accept: (x, y) => { const r = cr(); return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h; },
      });
      guard();
      t.classList.add('used');
      t.classList.remove('glow');
      const [sx, sy] = TOP_SPOTS[i];
      const r = cr();
      await ctl.fly(topSvg(t.dataset.k, 100), ctl.rectOf(t), { x: r.x + sx - 22, y: r.y + sy - 24, w: 44, h: 44 }, 420);
      guard();
      $('.tops', cake).insertAdjacentHTML('beforeend', `<g transform="translate(${sx} ${sy})">${TOPPINGS[t.dataset.k]}</g>`);
      sfx('pop');
    }
    tray.classList.add('hidden');
    sfx('sparkle');
    await say('bobo', 'bd_yummy');
    guard();
  }

  // ---------- 三、蠟燭、許願、唱歌、吹蠟燭 ----------
  async function candles() {
    await say('gugu', 'bd_candles');
    guard();
    const g = $('.candles', cake);
    g.innerHTML = candlesSvg(age);
    const cs = $$('.candle', g);
    for (let i = 0; i < cs.length; i++) {
      cs[i].classList.add('in');
      sfx('pop');
      await speak('mian', `m_n${i + 1}`, { name: bname, who: bid, node: who('mian') });
      guard();
    }
    await say('gugu', `bd_age${age}`);
    guard();
    await say('kiki', 'bd_light');
    guard();
    root.classList.add('dark');
    for (const c of cs) { c.classList.add('lit'); sfx('tap'); await pause(140); }
    await say('gugu', 'bd_wish');
    guard();
    root.classList.add('wishing');
    sfx('sparkle');
    await pause(3000);
    root.classList.remove('wishing');
    await say('dudu', 'bd_sing');
    guard();
    stopMusic();
    root.classList.add('singing');
    const dur = playTune(BIRTHDAY_SONG, 100, { gain: 0.5 });
    await pause(dur * 1000 + 300);
    root.classList.remove('singing');
    for (const id of ['kiki', 'dudu', 'bobo', 'mian', 'gugu']) {
      await say(id, 'bd_song_end');
      guard();
    }
    await blowOut(cs);
    root.classList.remove('dark');
    sfx('fanfare');
    confetti(cake, 30);
    playMusic('party');
    await say('kiki', 'bd_blown');
    guard();
  }

  async function blowOut(cs) {
    let left = cs.length;
    let resolveAll;
    const allOut = new Promise((r) => { resolveAll = r; });
    const putOut = (c) => {
      if (!c.classList.contains('lit')) return;
      c.classList.remove('lit', 'glow');
      c.classList.add('out');
      sfx('whoosh');
      left -= 1;
      if (left === 0) resolveAll();
    };
    // 不管有沒有麥克風，點火也可以吹熄
    cs.forEach((c) => onTap(c, () => putOut(c)));
    ctl.cleanups.push(() => resolveAll());
    let usingMic = false;
    if (micReady()) {
      try {
        let step = 0;
        ctl.blow = await listenBlow((acc) => {
          // 每吹 0.25 秒熄一根
          const n = Math.floor(acc / 0.25);
          while (step < n && step < cs.length) { putOut(cs.find((c) => c.classList.contains('lit')) || cs[0]); step += 1; }
          root.classList.add('blowing');
          clearTimeout(ctl.bt);
          ctl.bt = setTimeout(() => root.classList.remove('blowing'), 200);
        });
        usingMic = true;
      } catch { usingMic = false; }
    }
    guard();
    await say('kiki', usingMic ? 'bd_blow_mic' : 'bd_blow_tap');
    guard();
    if (!usingMic || !hard) cs.forEach((c) => c.classList.contains('lit') && c.classList.add('glow'));
    // 吹了很久沒熄：提醒可以點
    const hint = setTimeout(() => {
      if (!ctl.alive || left === 0) return;
      cs.forEach((c) => c.classList.contains('lit') && c.classList.add('glow'));
      say('kiki', 'bd_blow_tap');
    }, 9000);
    await allOut;
    clearTimeout(hint);
    ctl.blow?.stop();
    ctl.blow = null;
    guard();
  }

  // ---------- 四、拆禮物 ----------
  async function gifts() {
    // 兄弟姊妹今天偷偷做的卡片
    const today = dateKey();
    const cards = Object.keys(state.profiles[bid].collection).filter((k) => k.startsWith('bdcard~') && k.endsWith(`~${today}`));
    for (const k of cards) {
      const from = k.split('~')[1];
      const node = el(`<div class="gift"><div class="card">${itemSvg(k, 260)}</div></div>`);
      root.appendChild(node);
      sfx('sparkle');
      await say('kiki', `bd_card_from_${from}`);
      guard();
      await pause(800);
      node.classList.add('away');
      await pause(650);
      node.remove();
    }
    if (hasClaimed(bid, 'party_day')) {
      await say('mian', 'practice');
      guard();
      return;
    }
    await say('mian', 'bd_gifts');
    guard();
    const order = ['kiki', 'dudu', 'bobo', 'mian', 'gugu'];
    const box = $('.gifts', root);
    box.innerHTML = order.map((id) => `<button class="gbox glow" data-who="${id}">${boxSvg(id)}</button>`).join('');
    box.classList.remove('hidden');
    let opened = 0;
    await new Promise((resolve) => {
      let busy = false;
      $$('.gbox', box).forEach((b) => onTap(b, async () => {
        if (busy || b.classList.contains('open')) return;
        busy = true;
        b.classList.remove('glow');
        b.classList.add('open');
        sfx('fanfare');
        const id = b.dataset.who;
        const item = GIFT_OF[id];
        addItem(bid, item);
        save();
        b.insertAdjacentHTML('beforeend', `<div class="prize">${itemSvg(item, 130)}</div>`);
        const c = centerOf(b);
        burst(c.x, c.y - 60, { n: 12, kind: 'star', spread: 120 });
        await say(id, 'bd_gift');
        busy = false;
        opened += 1;
        if (opened === order.length) resolve();
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    claim(bid, 'party_day');
    save();
    await pause(800);
    box.classList.add('hidden');
  }

  async function main() {
    ctl.mode = 'act';
    playMusic('party');
    confetti($('.kid', root), 24);
    sfx('fanfare');
    await say('kiki', 'bd_p_hello');
    guard();
    await decorate();
    await pause(400);
    await makeCake();
    await pause(400);
    await candles();
    await pause(400);
    await gifts();
    await say('gugu', 'bd_mission');
    ctl.mode = 'done';
    if (ctl.timeUp) await ctl.goodbye();
  }
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });
  return ctl.api;
}

// ================= 兄弟姊妹：偷偷做生日卡 =================
function mountCard(stage, { profile, onExit }, bid) {
  const sid = profile.members[0];
  const hard = profile.level === 'hard';
  const inner = `
    ${charDiv('kiki', 40, 420, 0.8)}
    ${charDiv('mian', 980, 430, 0.75)}
    <div class="bigcard hidden"></div>
    <div class="p-tray hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'kiki');
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = (id, line) => speak(id, line, { name: profile.name, who: profile.id, node: who(id) });
  const tray = $('.p-tray', root);
  const big = $('.bigcard', root);
  const showTray = (html) => { tray.innerHTML = html; tray.classList.remove('hidden'); };

  async function main() {
    ctl.mode = 'act';
    playMusic('party');
    await say('kiki', `bd_card_intro_${sid}`);
    guard();
    await say('kiki', 'bd_card_color');
    guard();
    showTray(Object.entries(CARD_COLORS).map(([k, c]) => `<button class="tbtn glow swatch" data-k="${k}" style="background:${c}"></button>`).join(''));
    const cb = await ctl.pickFromTray(tray, { drag: false });
    guard();
    const color = cb.dataset.k;
    tray.classList.add('hidden');
    big.innerHTML = BIG_CARD(CARD_COLORS[color]);
    big.classList.remove('hidden');
    sfx('pop');
    await say('kiki', 'bd_card_sticker');
    guard();
    const n = hard ? 5 : 3;
    showTray(Object.keys(STICKERS).map((k) => `<button class="tbtn glow" data-k="${k}"><svg viewBox="-20 -20 40 40" width="96" height="96">${STICKERS[k]}</svg></button>`).join(''));
    const used = [];
    for (let i = 0; i < n; i++) {
      const b = await ctl.pickFromTray(tray, { drag: false });
      guard();
      used.push(b.dataset.k);
      const [x, y] = CARD_SPOTS[i];
      $('.st', big).insertAdjacentHTML('beforeend', `<g class="stk" transform="translate(${x} ${y}) scale(.9)">${STICKERS[b.dataset.k]}</g>`);
      sfx('pop');
    }
    tray.classList.add('hidden');
    sfx('sparkle');
    const c = centerOf(big);
    burst(c.x, c.y, { n: 16, kind: 'star', spread: 200 });
    await say('mian', 'bd_card_done');
    guard();
    const today = dateKey();
    const sent = Object.keys(state.profiles[bid].collection).some((k) => k.startsWith(`bdcard~${sid}~`) && k.endsWith(`~${today}`));
    big.classList.add('send');
    sfx('whoosh');
    await pause(900);
    if (!sent) {
      addItem(bid, `bdcard~${sid}~${color}~${used.join('.')}~${today}`);
      save();
      await say('kiki', `bd_card_hide_${sid}`);
    } else {
      await say('kiki', 'bd_card_again');
    }
    guard();
    await say('kiki', `bd_sib_mission_${sid}`);
    ctl.mode = 'done';
    if (ctl.timeUp) await ctl.goodbye();
  }
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });
  return ctl.api;
}

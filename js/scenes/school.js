// 學堂：咕咕老師上課（打招呼 → 舉手回答 → 垃圾分類 → 說對不起）。下午 5 點以後換成看星星。
import { PROFILES, REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, rainOn, rainOff } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import {
  DESKS, kidDesks, classroomBack, charDiv, desksSvg, WAVE, HAND, HIFIVE, QUESTIONS, SORRY_CARD, RUN_CARD,
  TRASH, EASY_TRASH, HARD_TRASH, EASY_BINS, HARD_BINS, binSvg, nightSky, DIPPER,
} from '../art/school.js';
import { avatarSvg } from '../art/characters.js';
import { turnsOn, turnCall, callTurn, passTurn, setTurn, whoseTurn, otherKid } from '../core/turns.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

export function mountSchool(stage, opts) {
  return hour() >= 17 ? mountNight(stage, opts) : mountClass(stage, opts);
}

// ================= 白天：上課 =================
function mountClass(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  // 一起玩：兩張小孩桌，各有自己的按鈕；回答問題輪流，輪到誰就用誰的難度
  const desks = kidDesks(profile);
  const two = desks.length > 1;
  const ph = phase();
  const wx = weather.current();
  const root = el(`
    <div class="screen scene school">
      <div class="s-layer">${classroomBack(ph, wx)}</div>
      ${charDiv('gugu', 'teacher', 830, 200, 0.95)}
      ${charDiv('kiki', 'pupil', DESKS.kiki - 90, 520, 0.75)}
      ${charDiv('dudu', 'pupil', DESKS.dudu - 90, 520, 0.75)}
      <div class="tears hidden"><i></i><i></i></div>
      <div class="s-layer desks">${desksSvg(profile)}</div>
      ${desks.map((d) => `<div class="raised" data-id="${d.id}" style="left:${d.x + (two ? 30 : 60)}px">${HAND}</div>`).join('')}
      ${desks.map((d) => `<button class="round-btn kidbtn hidden" data-id="${d.id}" style="left:${d.x - 62}px"></button>`).join('')}
      <div class="s-cards hidden"></div>
      <div class="trash hidden"></div>
      <div class="s-bins hidden"></div>
      <button class="round-btn hifive hidden">${HIFIVE}</button>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="light ${ph}"></div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const who = (id) => $(`.s-char[data-who="${id}"]`, root);
  const raisedOf = (id) => $(`.raised[data-id="${id}"]`, root);
  const cardsBox = $('.s-cards', root);

  let alive = true;
  let mode = 'intro';
  let timeUp = false;
  const cleanups = [];
  const say = (id, line) => speak(id, line, { name: profile.name, who: profile.id, node: who(id) });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }
  // 等某個東西被點一下
  function tapOnce(node) {
    return new Promise((resolve) => {
      const h = (e) => { e.preventDefault(); node.removeEventListener('pointerdown', h); resolve(); };
      node.addEventListener('pointerdown', h);
      cleanups.push(() => { node.removeEventListener('pointerdown', h); resolve(); });
    });
  }
  // 小孩桌上的按鈕：一起玩時輪流，先叫一個人按自己的，再換另一個人
  async function kidButton(svg) {
    const order = turnsOn() ? [whoseTurn(), otherKid()] : desks.map((d) => d.id);
    for (const id of order) {
      if (turnsOn()) { setTurn(id); await turnCall('gugu', who('gugu')); guard(); }
      const b = $(`.kidbtn[data-id="${id}"]`, root);
      b.innerHTML = svg;
      b.classList.remove('hidden');
      b.classList.add('glow');
      await tapOnce(b);
      guard();
      b.classList.add('hidden');
      b.classList.remove('glow');
      sfx('pop');
      if (svg === HAND) raisedOf(id).classList.add('up');
      passTurn();
    }
  }
  // 點某個東西（一起玩：先唱名，點了換人）
  async function tapTurn(node) {
    await turnCall('gugu', who('gugu'));
    guard();
    await tapOnce(node);
    guard();
    passTurn();
  }
  // 圖卡選擇題：回傳選對時結束；選錯會說 wrongLine
  async function choose(rightSvg, wrongSvgs, wrongLine, isHard = hard, call = true) {
    if (call) { await turnCall('gugu', who('gugu')); guard(); }
    const items = shuffle([{ ok: true, svg: rightSvg }, ...wrongSvgs.map((svg) => ({ ok: false, svg }))]);
    cardsBox.innerHTML = items.map((c, i) => `<button class="round-btn scard${!isHard && c.ok ? ' glow' : ''}" data-i="${i}">${c.svg}</button>`).join('');
    cardsBox.classList.remove('hidden');
    await new Promise((resolve) => {
      let busy = false;
      $$('.scard', cardsBox).forEach((b) => onTap(b, async () => {
        if (busy) return;
        const c = items[+b.dataset.i];
        if (!c.ok) {
          busy = true;
          sfx('wrong');
          flash(b, 'nope');
          await say('gugu', wrongLine);
          busy = false;
          if (isHard) $$('.scard', cardsBox).forEach((x) => x.classList.toggle('glow', items[+x.dataset.i].ok));
          return;
        }
        b.classList.add('picked');
        sfx('sparkle');
        const p = centerOf(b);
        burst(p.x, p.y, { n: 12, kind: 'star', spread: 120 });
        resolve();
      }));
      cleanups.push(() => resolve());
    });
    guard();
    if (call) passTurn();
    await pause(500);
    cardsBox.classList.add('hidden');
  }

  // ---------- 一、打招呼與舉手 ----------
  async function greet() {
    const am = hour() < 12;
    who('gugu').classList.add('enter');
    await pause(900);
    await say('gugu', 's_hello');
    guard();
    await say('kiki', am ? 's_morning' : 's_noon');
    await say('dudu', am ? 's_morning' : 's_noon');
    guard();
    await say('gugu', hard ? 's_wave_hard' : 's_wave');
    guard();
    await kidButton(WAVE);
    root.classList.add('kid-wave');
    setTimeout(() => root.classList.remove('kid-wave'), 1600);
    await say('gugu', am ? 's_hi_kid_m' : 's_hi_kid_n');
    guard();
  }

  async function handUp() {
    const keys = shuffle(Object.keys(QUESTIONS));
    const q = QUESTIONS[keys[0]];
    await say('gugu', 's_ask_intro');
    await say('gugu', q.q);
    guard();
    // 奇奇沒舉手就搶答
    const k = who('kiki');
    k.classList.add('shout');
    await say('kiki', 's_shout');
    guard();
    k.classList.add('glow-char');
    await tapTurn(k);
    k.classList.remove('glow-char');
    sfx('tap');
    await say('dudu', 's_raise_hand');
    k.classList.remove('shout');
    k.classList.add('hand');
    await say('kiki', 's_ok_hand');
    guard();
    await say('gugu', 's_kid_hand');
    guard();
    await kidButton(HAND);
    root.classList.add('kid-hand');
    k.classList.remove('hand');
    // 一起玩：一人一題，妍卉先（6 歲版），再換向澤（3 歲版）
    const qOrder = turnsOn() ? [whoseTurn(), otherKid()].map((id) => desks.find((d) => d.id === id)) : desks;
    for (const [i, d] of qOrder.entries()) {
      const qq = QUESTIONS[keys[i]];
      const kidHard = two ? PROFILES[d.id].level === 'hard' : hard;
      if (i > 0) {
        await say('gugu', 's_ask_intro');
        await say('gugu', qq.q);
        guard();
      }
      if (two) {
        setTurn(d.id);
        $$('.raised', root).forEach((r) => r.classList.toggle('up', r.dataset.id === d.id));
        await speak('gugu', 's_call_kid', { name: PROFILES[d.id].name, who: d.id, node: who('gugu') });
      } else {
        await say('gugu', 's_call_kid');
      }
      guard();
      await choose(qq.right, kidHard ? qq.wrong : qq.wrong.slice(0, 1), 's_a_wrong', kidHard, false);
      passTurn();
      await say('gugu', qq.a);
      guard();
    }
    root.classList.remove('kid-hand');
    $$('.raised', root).forEach((r) => r.classList.remove('up'));
    if (two) await say('gugu', 'tg_both');
  }

  // ---------- 二、垃圾分類 ----------
  async function sorting() {
    const list = shuffle(hard ? HARD_TRASH : EASY_TRASH);
    const bins = hard ? HARD_BINS : EASY_BINS;
    const box = $('.s-bins', root);
    box.className = `s-bins n${bins.length}`;
    box.innerHTML = bins.map((b) => `<button class="sbin" data-b="${b}">${binSvg(b)}</button>`).join('');
    await say('gugu', 's_sort_intro');
    guard();
    await say('gugu', hard ? 's_sort_hard' : 's_sort_easy');
    guard();
    const trash = $('.trash', root);
    for (const id of list) {
      const t = TRASH[id];
      const want = hard ? t.cat : t.easy;
      trash.innerHTML = `<svg viewBox="0 0 100 100" width="150" height="150">${t.svg}</svg>`;
      trash.className = 'trash pop';
      await turnCall('gugu', who('gugu'));
      guard();
      if (!hard) $$('.sbin', box).forEach((b) => b.classList.toggle('glow', b.dataset.b === want));
      await new Promise((resolve) => {
        let busy = false;
        const h = async (e) => {
          const b = e.target.closest('.sbin');
          if (!b || busy) return;
          e.preventDefault();
          if (b.dataset.b !== want) {
            busy = true;
            sfx('wrong');
            flash(b, 'nope');
            const hint = hard ? { paper: 's_h_paper', plastic: 's_h_plastic', food: 's_h_food', general: 's_h_general' }[want]
              : (want === 'recycle' ? 's_h_recycle' : 's_h_general');
            await say('gugu', hint);
            busy = false;
            $$('.sbin', box).forEach((x) => x.classList.toggle('glow', x.dataset.b === want));
            return;
          }
          box.removeEventListener('pointerdown', h);
          passTurn();
          // 垃圾飛進桶子
          const sr = stage.getBoundingClientRect();
          const k = sr.width / 1200;
          const br = b.getBoundingClientRect();
          const tr = trash.getBoundingClientRect();
          trash.style.setProperty('--dx', `${(br.left + br.width / 2 - (tr.left + tr.width / 2)) / k}px`);
          trash.style.setProperty('--dy', `${(br.top + br.height * 0.3 - (tr.top + tr.height / 2)) / k}px`);
          trash.className = 'trash toss';
          b.classList.add('open');
          setTimeout(() => b.classList.remove('open'), 700);
          resolve();
        };
        box.addEventListener('pointerdown', h);
        cleanups.push(() => { box.removeEventListener('pointerdown', h); resolve(); });
      });
      guard();
      $$('.sbin', box).forEach((x) => x.classList.remove('glow'));
      await pause(450);
      sfx('pop');
      if (hard) await say('gugu', t.en);
      else await say('gugu', pick(['praise1', 'praise2', 'praise3']));
      guard();
      trash.className = 'trash hidden';
    }
    sfx('fanfare');
    await say('gugu', 's_sort_done');
    box.classList.add('hidden');
  }

  // ---------- 三、說對不起 ----------
  async function sorry() {
    await say('gugu', 's_free');
    guard();
    root.classList.add('building');
    await say('dudu', 's_build');
    guard();
    const k = who('kiki');
    k.classList.add('run');
    await say('kiki', 's_run');
    guard();
    await pause(300);
    root.classList.add('crash');
    sfx('thunder');
    await pause(600);
    await say('kiki', 's_oops');
    root.classList.add('crying');
    $('.tears', root).classList.remove('hidden');
    await say('dudu', 's_cry');
    guard();
    await say('gugu', 's_what_do');
    guard();
    await choose(SORRY_CARD, [RUN_CARD], 's_runaway');
    k.classList.add('bow');
    await say('kiki', 's_sorry');
    guard();
    k.classList.remove('bow');
    root.classList.remove('crash');
    sfx('bubble');
    await pause(700);
    $('.tears', root).classList.add('hidden');
    root.classList.remove('crying');
    await say('dudu', 's_its_ok');
    guard();
    await say('gugu', 's_hi5');
    guard();
    const hb = $('.hifive', root);
    hb.classList.remove('hidden');
    hb.classList.add('glow');
    await tapTurn(hb);
    hb.classList.add('hidden');
    root.classList.add('clap');
    sfx('fanfare');
    const c = centerOf(hb);
    burst(c.x, c.y, { n: 16, kind: 'star', spread: 160 });
    await pause(1200);
    root.classList.remove('clap', 'building');
    k.classList.remove('run');
    await say('gugu', 's_friends');
    guard();
  }

  // ---------- 給獎 ----------
  async function celebrate() {
    const slot = currentSlot(REWARD_SLOTS.school, hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `school_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, 'gugu');
        addItem(id, item);
        claim(id, `school_${slot}`);
        return { id, item };
      });
      save();
      const cards = gifts.map((g) => `
        <div class="card">${itemSvg(g.item, 210)}
          ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
      const node = el(`<div class="gift">${cards}</div>`);
      root.appendChild(node);
      sfx('sparkle');
      await say('gugu', 'gift');
      await pause(600);
      node.classList.add('away');
      await pause(650);
      node.remove();
    } else {
      await say('gugu', 'practice');
    }
    guard();
    await say('gugu', 's_mission');
  }

  async function main() {
    mode = 'act';
    await greet();
    await handUp();
    await pause(600);
    await sorting();
    await pause(600);
    await sorry();
    await celebrate();
    mode = 'done';
    if (timeUp) await goodbye();
  }

  async function goodbye() {
    mode = 'end';
    await say('gugu', weather.niceOutside(ph) ? 'bye_sunny' : 'bye');
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }
  function destroy() {
    if (!alive) return;
    alive = false;
    cleanups.forEach((fn) => fn());
    rainOff();
    hush();
  }
  onTap($('.hud .home', root), () => {
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  if (wx.kind === 'rain' || wx.kind === 'storm') rainOn(wx.kind === 'storm');
  playMusic('school');
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });

  return {
    destroy,
    hostChar: 'gugu',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'done') goodbye();
    },
  };
}

// ================= 晚上：看星星 =================
const FACTS = ['s_fact_moon', 's_fact_star', 's_fact_owl', 's_fact_turn', 's_fact_en'];

function mountNight(stage, { profile, onExit }) {
  const ph = phase();
  const wx = weather.current();
  const wet = wx.kind === 'rain' || wx.kind === 'storm';
  const root = el(`
    <div class="screen scene school night-sky">
      <div class="s-layer sky">${nightSky(ph, wx, profile)}</div>
      ${charDiv('gugu', 'teacher sill', 880, 448, 0.8)}
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const gugu = $('.s-char[data-who="gugu"]', root);
  let alive = true;
  let mode = 'intro';
  let timeUp = false;
  let busy = false;
  let facts = shuffle(FACTS);
  let told = 0;
  let saidBye = false;
  const lit = new Set();
  const say = (line) => speak('gugu', line, { name: profile.name, who: profile.id, node: gugu });

  async function tell() {
    if (busy || !alive || mode === 'end') return;
    busy = true;
    if (!facts.length) facts = shuffle(FACTS);
    await say(facts.shift());
    told += 1;
    if (told === 3) await maybeBye();
    busy = false;
  }
  async function maybeBye() {
    if (saidBye || !alive) return;
    saidBye = true;
    await say('s_night_bye');
  }

  // 一起玩：輪流點星星，一人一顆
  let calling = false;
  const nextStar = async () => { if (!turnsOn()) return; calling = true; await turnCall('gugu', gugu); calling = false; };
  $$('.nstar', root).forEach((s) => onTap(s, async () => {
    if (!alive || mode === 'end' || calling) return;
    const i = +s.dataset.i;
    s.classList.remove('tpop'); void s.getBoundingClientRect(); s.classList.add('tpop');
    sfx('sparkle');
    if (lit.has(i)) return;
    lit.add(i);
    s.classList.add('lit');
    passTurn();
    if (lit.size < DIPPER.length) nextStar();
    if (lit.size === DIPPER.length) {
      root.classList.add('dipper');
      sfx('fanfare');
      const c = centerOf($('.nstar[data-i="3"]', root));
      burst(c.x, c.y, { n: 18, kind: 'star', spread: 260 });
      busy = true;
      await say('s_dipper');
      await maybeBye();
      busy = false;
    }
  }));
  const moon = $('.moon', root);
  if (moon) onTap(moon, () => { sfx('pop'); tell(); });
  onTap(gugu, () => { sfx('tap'); tell(); });

  async function intro() {
    busy = true;
    await say(wet ? 's_night_cloudy' : 's_night_hello');
    busy = false;
    if (!alive) return;
    mode = 'idle';
    if (!wet) { $$('.nstar', root).forEach((s) => s.classList.add('glow')); nextStar(); }
    else gugu.classList.add('glow-char');
    if (timeUp) goodbye();
  }
  async function goodbye() {
    if (mode === 'end' || !alive) return;
    mode = 'end';
    hush();
    await speak('gugu', 'bye', { name: profile.name, who: profile.id, node: gugu });
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }
  function destroy() {
    if (!alive) return;
    alive = false;
    rainOff();
    hush();
  }
  onTap($('.hud .home', root), () => {
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  if (wet) rainOn(wx.kind === 'storm');
  playMusic('lullaby');
  intro();
  return {
    destroy,
    hostChar: 'gugu',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'idle') goodbye();
    },
  };
}

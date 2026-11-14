// 一起做：角色陪小孩做真實生活中的事。iPad 放在旁邊，角色示範、計時、放音樂，小孩做完按大勾勾。
// 睡前、出門、吃飯、洗手、整理書包、寫功課、動物體操、坐車尋寶。刷牙沿用廁所場景的陪刷。
import { REWARD_SLOTS, CHARACTERS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, stopMusic, musicLevel } from '../core/audio.js';
import { speak, hush, isSpeaking, quietFor } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import { mianSvg } from '../art/bedroom.js';
import { itemSvg, nextItem } from '../art/items.js';
import { tgIcon, backFor } from '../art/together.js';
import { ICON, openCabinet } from '../ui/screens.js';
import { sceneWeather } from './door.js';
import { callTurn, passTurn, turnsOn, turnsScene, freeTurns } from '../core/turns.js';

// 廁所固定由嘟嘟負責（11/14 起每個場景一位負責的角色）
export function nextCharacter() {
  return 'dudu';
}

// 每個房間有哪些「一起做」
export const TOGETHER = {
  bedroom: ['sleep'], door: ['out'], kitchen: ['meal'], bathroom: ['brush', 'wash'],
  school: ['bag', 'homework'], farm: ['gym'], car: ['ride'], park: ['outing'],
};
const ROOM_HOST = { bedroom: 'mian', door: 'kiki', kitchen: 'bobo', school: 'gugu', farm: 'doudou', car: 'pupu', park: 'tiaotiao' };
// host：陪的角色（null＝廁所輪替）；reward：算哪個場景的每日獎勵；series：送哪一系列的禮物
const MODES = {
  sleep: { host: 'mian', reward: 'bedroom', series: 'mian', track: 'bedroom', icon: 'moon' },
  out: { host: 'kiki', reward: 'door', series: 'kiki', track: 'living', icon: 'shoes' },
  meal: { host: 'bobo', reward: 'kitchen', series: 'bobo', track: 'kitchen', icon: 'bowl' },
  brush: { icon: 'toothbrush' },
  wash: { host: null, reward: 'wash', series: null, track: 'bath_day', icon: 'hands' },
  bag: { host: 'gugu', reward: 'school', series: 'gugu', track: 'school', icon: 'bag' },
  homework: { host: 'gugu', reward: 'school', series: 'gugu', track: 'study', icon: 'homework' },
  gym: { host: 'doudou', reward: 'farm', series: 'doudou', track: 'farm', icon: 'bunny' },
  ride: { host: 'pupu', reward: 'car', series: 'pupu', track: 'car', icon: 'redcar' },
  outing: { host: 'tiaotiao', reward: 'park', series: 'tiaotiao', track: 'park', icon: 'park' },
};
export const MEAL_MIN = 25;   // 吃飯盤子時鐘幾分鐘走完
export const LULLABY_MIN = 10;
export const HOMEWORK_MIN = 10;
export const PARK_MAX_MIN = 60;   // 陪去公園：最多陪 60 分鐘
export const PARK_REMIND_MIN = 15;

const CHECK = `<svg viewBox="0 0 100 100" width="120" height="120"><path d="M18 52L40 74L84 26" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const RING_C = 2 * Math.PI * 92;
// 測試用：?tgfast=60 讓計時快 60 倍
const FAST = parseFloat(new URLSearchParams(location.search).get('tgfast')) || 1;

function hostSvg(id) {
  if (id === 'mian') return mianSvg();
  return `<svg viewBox="-40 -20 320 360" width="320" height="360">${characterSvg(id)}</svg>`;
}

// ---------- 進房間先選：玩遊戲，還是一起做 ----------
export function chooseMode(stage, room, profile) {
  const kinds = (TOGETHER[room] || []).filter((k) => k !== 'homework' || profile.level === 'hard');
  if (!kinds.length) return Promise.resolve({ mode: 'game' });
  const host = room === 'bathroom' ? nextCharacter() : ROOM_HOST[room];
  const ph = phase();
  const root = el(`
    <div class="screen tg tg-pick ${ph}">
      <div class="tg-back">${backFor(kinds[0], ph, weather.current())}</div>
      <div class="tg-veil"></div>
      <div class="tg-host"><div class="tg-host-in o-day">${hostSvg(host)}</div></div>
      <div class="tg-choices n${kinds.length + 1}">
        <button class="round-btn tg-choice game" data-mode="game">${tgIcon('game', 170)}</button>
        ${kinds.map((k) => `<button class="round-btn tg-choice tog" data-kind="${k}">${tgIcon(MODES[k].icon, 150)}<span class="badge">${tgIcon('hands2', 74)}</span></button>`).join('')}
      </div>
      <div class="hud"><button class="round-btn home">${ICON.home}</button></div>
    </div>`);
  stage.replaceChildren(root);
  const hostIn = $('.tg-host-in', root);
  playMusic(MODES[kinds[0]].track || 'lobby');
  let done = false;
  // 一起玩：被唱名的小孩選
  turnsScene(root);
  const say = () => speak(host, 'tg_pick', { name: profile.name, who: profile.id, node: hostIn });
  setTimeout(async () => { if (done) return; await callTurn(host, hostIn); if (!done) say(); }, 300);
  const again = setTimeout(() => { if (!done) say(); }, 14000);
  return new Promise((resolve) => {
    const finish = (v) => {
      if (done) return;
      done = true;
      clearTimeout(again);
      hush();
      sfx('tap');
      resolve({ ...v, host });
    };
    $$('.tg-choice', root).forEach((b) => onTap(b, () => {
      b.classList.add('picked');
      if (b.dataset.mode === 'game') finish({ mode: 'game' });
      else finish({ mode: 'together', kind: b.dataset.kind });
    }));
    onTap($('.hud .home', root), () => finish({ mode: 'home' }));
  });
}

// ---------- 一起做 ----------
export function mountTogether(stage, { profile, onExit, kind, host: hostHint }) {
  const M = MODES[kind];
  const host = M.host || hostHint || nextCharacter();
  const series = M.series || host;
  const hard = profile.level === 'hard';
  const two = profile.members.length > 1;   // 一起玩：每一步兩個勾勾，兩個人都按了才下一步
  const ph = phase();
  const wx = weather.current();

  const root = el(`
    <div class="screen scene tg tg-${kind} ${ph}">
      <div class="tg-back">${backFor(kind, ph, wx)}</div>
      <div class="tg-veil"></div>
      <div class="tg-host"><div class="tg-host-in o-day">${hostSvg(host)}</div><div class="tg-prop"></div></div>
      <div class="tg-dots"></div>
      <div class="tg-card hidden">
        <svg class="tg-ring" viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="92"/><circle class="fg" cx="100" cy="100" r="92" transform="rotate(-90 100 100)"/></svg>
        <div class="tg-icon"></div>
        <div class="tg-count"></div>
      </div>
      <div class="tg-dark"></div>
      <div class="tg-plate hidden"></div>
      <div class="tg-grid hidden"></div>
      <button class="round-btn tg-ok hidden">${CHECK}</button>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const hostIn = $('.tg-host-in', root);
  const hostBox = $('.tg-host', root);
  const card = $('.tg-card', root);
  const iconBox = $('.tg-icon', root);
  const ring = $('.tg-ring .fg', root);
  const countBox = $('.tg-count', root);
  const okBtn = $('.tg-ok', root);
  const dots = $('.tg-dots', root);
  const dark = $('.tg-dark', root);

  let alive = true;
  let mode = 'act';
  const cleanups = [];
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  const say = async (id) => { guard(); await speak(host, id, { name: profile.name, who: profile.id, node: hostIn }); guard(); };
  const sayBg = (id) => { if (alive) speak(host, id, { name: profile.name, who: profile.id, node: hostIn }); };

  // 稱讚：一起玩時等兩個人都好了，一起稱讚（不比誰快）
  const praise = () => say(two ? 'tg_both' : pick(['praise1', 'praise2', 'praise3']));
  const checkLine = () => say('tg_check');

  // iPad 放旁邊時不要自動關螢幕
  let lock = null;
  (async () => {
    try { lock = await navigator.wakeLock?.request('screen'); } catch { lock = null; }
    if (!alive) { try { lock?.release(); } catch { /* 忽略 */ } }
  })();
  cleanups.push(() => { try { lock?.release(); } catch { /* 忽略 */ } });

  // ---------- 畫面小工具 ----------
  function setDots(icons) {
    dots.innerHTML = icons.map((ic, i) => `<div class="tg-dot" data-i="${i}">${tgIcon(ic, 64)}</div>`).join('');
  }
  function markDot(i, cls) {
    const d = $(`.tg-dot[data-i="${i}"]`, dots);
    if (!d) return;
    if (cls === 'on') $$('.tg-dot.on', dots).forEach((x) => x.classList.remove('on'));
    d.classList.add(cls);
    if (cls === 'done') d.classList.remove('on');
  }
  function showIcon(id, anim = '', per = false) {
    card.classList.remove('hidden');
    iconBox.className = `tg-icon ${anim}`;
    // 一起玩時，要拿的東西標上兩個頭像：一人一份
    iconBox.innerHTML = tgIcon(id, 300) + (per && two ? `<div class="tg-per">${profile.members.map((m) => avatarSvg(m, 84)).join('')}</div>` : '');
    void iconBox.getBoundingClientRect();
    iconBox.classList.add('in');
  }
  function setRing(f) {
    card.classList.toggle('timed', f != null);
    ring.setAttribute('stroke-dasharray', `${(RING_C * Math.max(0, Math.min(1, f ?? 0))).toFixed(1)} ${RING_C.toFixed(1)}`);
  }
  function confetti(node, n = 14) {
    const c = centerOf(node);
    burst(c.x, c.y, { n, kind: 'star', spread: 220 });
  }

  // 等小孩按大勾勾。nudge：太久沒按，角色溫柔提醒（最多兩次）
  // 一起玩：一個口令一個動作。先叫輪到的人按，再換另一個人按（勾勾是輪到的人的顏色）
  function waitOk({ nudge = true, play = false } = {}) {
    guard();
    let cancelled = false;
    let cur = null;
    const p = (async () => {
      const rounds = two && !play ? 2 : 1;
      for (let r = 0; r < rounds; r++) {
        if (two && !play) {
          if (r === 0) await callTurn(host, hostIn);
          else await passTurn(host, hostIn);
        }
        if (cancelled || !alive) return false;
        cur = oneOk({ nudge, play });
        const ok = await cur;
        if (!ok || cancelled) return false;
      }
      return true;
    })();
    p.cancel = () => { cancelled = true; cur?.cancel?.(); okBtn.classList.add('hidden'); };
    cleanups.push(p.cancel);
    return p;
  }
  function oneOk({ nudge = true, play = false } = {}) {
    okBtn.classList.toggle('play', play);
    okBtn.innerHTML = play ? tgIcon('go', 130) : CHECK;
    okBtn.classList.remove('hidden');
    let cancel = null;
    const p = new Promise((resolve) => {
      let n = 0;
      const nag = nudge ? setInterval(() => {
        if (n >= 2 || isSpeaking() || quietFor() < 20000) return;
        n++;
        sayBg('tg_nudge');
      }, 5000) : 0;
      const off = () => { clearInterval(nag); okBtn.removeEventListener('pointerdown', h); };
      const h = (e) => {
        e.preventDefault();
        off();
        sfx('tap');
        okBtn.classList.add('hidden');
        resolve(true);
      };
      okBtn.addEventListener('pointerdown', h);
      cancel = () => { off(); okBtn.classList.add('hidden'); resolve(false); };
      cleanups.push(cancel);
    });
    p.cancel = cancel;
    return p;
  }

  // 計時：每 0.2 秒呼叫 tick(已過毫秒)；stop() 可提早結束
  function timer(ms, tick) {
    let stopFn = null;
    const p = new Promise((resolve) => {
      const t0 = performance.now();
      const iv = setInterval(() => {
        if (!alive) { clearInterval(iv); resolve('dead'); return; }
        const e = (performance.now() - t0) * FAST;
        tick?.(Math.min(e, ms));
        if (e >= ms) { clearInterval(iv); resolve('time'); }
      }, 200);
      stopFn = () => { clearInterval(iv); resolve('stop'); };
      cleanups.push(() => clearInterval(iv));
    });
    p.stop = () => stopFn?.();
    return p;
  }

  // 一個步驟：顯示圖示、角色說明、（計時＋音樂）、按大勾勾
  // ms：計時；lock：時間到才能按勾勾；auto：時間到自動下一步（手濕濕不用碰螢幕）
  async function step(i, s) {
    guard();
    markDot(i, 'on');
    showIcon(s.icon, s.anim || '', s.per);
    setRing(s.ms ? 1 : null);
    s.before?.();
    if (s.music) playMusic(s.music);
    for (const l of [].concat(s.line || [])) await say(l);
    if (s.ms) {
      const cues = [...(s.cues || [])];
      const t = timer(s.ms, (e) => {
        setRing(1 - e / s.ms);
        while (cues.length && e >= cues[0][0]) sayBg(cues.shift()[1]);
      });
      if (s.auto || s.lock) {
        await t;
      } else {
        const ok = waitOk({ nudge: false });
        const r = await Promise.race([t, ok.then(() => 'ok')]);
        if (r === 'ok') t.stop(); else ok.cancel();
        guard();
        if (r === 'ok') { done(i, s); return; }
      }
      guard();
      setRing(0);
      if (s.music) playMusic(M.track);
      if (s.endLine) await say(s.endLine);
    }
    if (!s.auto) await waitOk();
    guard();
    done(i, s);
    if (!s.auto) await praise();
  }
  function done(i, s) {
    markDot(i, 'done');
    setRing(null);
    sfx('sparkle');
    confetti(iconBox, 10);
    if (s.music) playMusic(M.track);
  }

  async function runSteps(list) {
    setDots(list.map((s) => s.icon));
    for (let i = 0; i < list.length; i++) {
      await step(i, list[i]);
      // 計時步驟提早按勾勾時，要稱讚一下
      if (list[i].ms && !list[i].auto && !list[i].lock) await praise();
    }
  }

  // ---------- 完成：稱讚、給獎、請爸媽蓋章 ----------
  async function showGift(gifts) {
    const cards = gifts.map((g) => `
      <div class="card">${itemSvg(g.item, 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
    const node = el(`<div class="gift">${cards}</div>`);
    root.appendChild(node);
    sfx('sparkle');
    const r = stage.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { n: 18, kind: 'star', spread: 260 });
    await say('gift');
    await pause(700);
    node.classList.add('away');
    sfx('whoosh');
    await pause(650);
    node.remove();
  }
  async function celebrate() {
    guard();
    card.classList.add('hidden');
    okBtn.classList.add('hidden');
    hostBox.classList.add('happy');
    sfx('fanfare');
    confetti(hostBox, 16);
    await praise();
    const slot = currentSlot(REWARD_SLOTS[M.reward], hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `${M.reward}_${slot}`)) : [];
    hostBox.classList.remove('happy');
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, series);
        addItem(id, item);
        claim(id, `${M.reward}_${slot}`);
        return { id, item };
      });
      save();
      await showGift(gifts);
    } else {
      await say('practice');
    }
    await say('tg_stamp');
  }

  async function finish() {
    mode = 'end';
    await pause(1200);
    destroy();
    onExit('home');
  }

  // ================= 各種一起做 =================
  // ---------- 陪睡前 ----------
  async function runSleep() {
    await say('ts_hello');
    await checkLine();
    await runSteps([
      { icon: 'toybox', line: 'ts_toys', ms: 180000, music: 'tidy', endLine: 'ts_toys_end' },
      { icon: 'pajamas', line: 'ts_pj', before: () => { hostIn.classList.replace('o-day', 'o-pj'); sfx('pop'); } },
      { icon: 'toilet', line: 'ts_potty' },
      { icon: 'toothbrush', line: 'ts_brush', ms: hard ? 120000 : 60000, music: 'brush_song', lock: true, endLine: 'ts_brush_end' },
      { icon: 'book', line: 'ts_book' },
    ]);
    await celebrate();
    // 爸媽唸故事：螢幕全暗、放搖籃曲，時間到自己關掉
    await say('ts_read');
    mode = 'end';
    dots.classList.add('hidden');
    root.classList.add('night-out');
    playMusic('lullaby');
    musicLevel(0.7, 2);
    await timer(LULLABY_MIN * 60000);
    guard();
    musicLevel(0.0001, 20);
    await pause(20000);
    stopMusic();
    root.classList.add('lights-out');
    await pause(1600);
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }

  // ---------- 陪出門 ----------
  function outItems() {
    const wk = sceneWeather(wx);
    const rain = wk === 'rain' || wk === 'storm';
    const list = [rain ? 'boots' : 'sneakers'];
    if (rain) list.push(...(hard ? ['raincoat', 'umbrella'] : ['umbrella']));
    if (wk === 'cold') list.push(...(hard ? ['jacket', 'scarf'] : ['jacket']));
    if (wk === 'windy') list.push('jacket');
    if (wk === 'hot') list.push('hat');
    list.push('bottle');
    return { wk, list };
  }
  async function runOut() {
    const { wk, list } = outItems();
    await say('to_hello');
    await say(`d_w_${wk === 'storm' ? 'rain' : wk}`);
    await runSteps([
      { icon: 'toilet', line: 'to_potty' },
      ...list.map((id, i) => ({ icon: id, per: true, line: i === 0 ? [`i_${id}`, 'to_fetch'] : `i_${id}` })),
    ]);
    // 三、二、一，出發！
    showIcon('go', 'pop');
    const sayP = say('to_ready').catch(() => {});
    await pause(2200);
    for (const n of [3, 2, 1]) {
      countBox.innerHTML = `<b>${n}</b>`;
      sfx('pop');
      await pause(800);
    }
    countBox.replaceChildren();
    await sayP;
    guard();
    sfx('fanfare');
    await celebrate();
    await finish();
  }

  // ---------- 陪吃飯 ----------
  const PLATE_C = 2 * Math.PI * 25;
  async function mealClock() {
    const plate = $('.tg-plate', root);
    plate.innerHTML = `<svg viewBox="0 0 100 100" width="420" height="420">
      <circle cx="50" cy="50" r="48" fill="#fff" opacity=".95"/><circle cx="50" cy="50" r="38" fill="none" stroke="#e8d6b8" stroke-width="2"/>
      <circle class="eat" cx="50" cy="50" r="25" fill="none" stroke="#ffcf6b" stroke-width="50" transform="rotate(-90 50 50)" stroke-dasharray="0 ${PLATE_C.toFixed(1)}"/>
      <circle cx="50" cy="50" r="4" fill="#c98b5e"/></svg>`;
    const eat = $('.eat', plate);
    card.classList.add('hidden');
    await say('tm_rest');
    plate.classList.remove('hidden');
    root.classList.add('dim');
    playMusic('meal');
    musicLevel(0.6, 2);
    const total = MEAL_MIN * 60000;
    const pool = ['tm_r1', 'tm_r2', 'tm_r3', 'tm_r4', 'tm_r5', 'tm_r6'];
    let next = 3.5 * 60000;
    let last = '';
    const t = timer(total, (e) => {
      eat.setAttribute('stroke-dasharray', `${(PLATE_C * e / total).toFixed(1)} ${PLATE_C.toFixed(1)}`);
      if (e >= next && e < total - 60000) {
        next += 4 * 60000;
        last = pick(pool.filter((x) => x !== last));
        sfx('sparkle');
        sayBg(last);
      }
    });
    // 吃完了可以提早按勾勾（勾勾也暗暗的）
    const ok = waitOk({ nudge: false });
    const r = await Promise.race([t, ok.then(() => 'ok')]);
    guard();
    if (r === 'ok') t.stop();
    root.classList.remove('dim');
    playMusic(M.track);
    if (r !== 'ok') {
      ok.cancel();
      await say('tm_time');
      await waitOk();
    }
    plate.classList.add('hidden');
    sfx('sparkle');
  }
  async function runMeal() {
    await say('tm_hello');
    await checkLine();
    const list = [
      { icon: 'hands', line: 'tm_wash' },
      { icon: 'table', line: 'tm_table' },
      { icon: 'eat', line: 'tm_sit' },
      { icon: 'thanks', line: 'tm_thanks' },
      { icon: 'sink', line: 'tm_clear' },
    ];
    setDots(list.map((s) => s.icon));
    for (let i = 0; i < list.length; i++) {
      await step(i, list[i]);
      if (i === 2) {
        // 開動之後：盤子時鐘
        markDot(2, 'on');
        await mealClock();
        markDot(2, 'done');
        await praise();
      }
    }
    await celebrate();
    await finish();
  }

  // ---------- 陪洗手 ----------
  async function runWash() {
    await say('tw_hello');
    const list = [
      { icon: 'faucet', line: 'w_wet', ms: 5000, auto: true },
      { icon: 'soap', line: 'w_soap', ms: 4000, auto: true },
      { icon: 'hands', line: 'tw_rub', ms: 20000, auto: true, music: 'wash_song', anim: 'rub', cues: [[5000, 'tw_back'], [10000, 'tw_fingers'], [15000, 'tw_thumb']] },
      { icon: 'faucet', line: 'w_rinse', ms: 7000, auto: true },
      { icon: 'faucet', line: 'tw_scoop', ms: 5000, auto: true },
      { icon: 'towel', line: 'w_dry' },
    ];
    setDots(list.map((s) => s.icon));
    showIcon('hands');
    await say('tw_ready');
    await waitOk({ play: true });
    for (let i = 0; i < list.length; i++) await step(i, list[i]);
    await say('w_done');
    await celebrate();
    await finish();
  }

  // ---------- 陪整理書包 ----------
  async function runBag() {
    await say('tb_hello');
    const items = [['bottle', 'tb_bottle'], ['lunch', 'tb_lunch'], ['notebook', 'tb_book'], ['jacket', 'tb_coat']];
    if (hard) items.push(['pencilcase', 'tb_pencil']);
    await runSteps(items.map(([icon, line], i) => ({ icon, per: true, line: i === 0 ? [line, 'tb_fetch'] : line })));
    showIcon('bag', 'pop');
    await say('tb_done');
    await celebrate();
    await finish();
  }

  // ---------- 陪寫功課（6 歲） ----------
  async function runHomework() {
    await say('th_hello');
    showIcon('homework');
    await say('th_ready');
    await waitOk({ play: true });
    hostBox.classList.add('reading');
    $('.tg-prop', root).innerHTML = tgIcon('book', 170);
    playMusic('study');
    await say('th_start');
    const total = HOMEWORK_MIN * 60000;
    let mid = false;
    setRing(1);
    const t = timer(total, (e) => {
      setRing(1 - e / total);
      if (!mid && e >= total / 2) { mid = true; sayBg('th_mid'); }
    });
    const ok = waitOk({ nudge: false });
    const r = await Promise.race([t, ok.then(() => 'ok')]);
    guard();
    hostBox.classList.remove('reading');
    $('.tg-prop', root).replaceChildren();
    setRing(null);
    playMusic(M.track);
    if (r === 'ok') t.stop();
    else {
      ok.cancel();
      await say('th_end');
      await waitOk();
    }
    await celebrate();
    await finish();
  }

  // ---------- 動物體操 ----------
  async function runGym() {
    await say('tx_hello');
    await pause(1500);
    const sec = hard ? 60000 : 45000;
    const moves = [['bunny', 'tx_bunny'], ['duck', 'tx_duck'], ['cat', 'tx_cat'], ['chick', 'tx_chick']];
    const list = [
      ...moves.map(([icon, line]) => ({ icon, line, ms: sec, auto: true, music: 'gym', anim: `mv-${icon}`, before: () => { hostBox.dataset.mv = icon; } })),
      { icon: 'breathe', line: 'tx_breathe', ms: 15000, auto: true, anim: 'mv-breathe', before: () => { hostBox.dataset.mv = 'breathe'; } },
    ];
    setDots(list.map((s) => s.icon));
    for (let i = 0; i < list.length; i++) {
      await step(i, list[i]);
      if (i < moves.length - 1) await say('tx_next');
    }
    delete hostBox.dataset.mv;
    await say('tx_done');
    await celebrate();
    await finish();
  }

  // ---------- 陪坐車：窗外尋寶 ----------
  async function runRide() {
    await say('tr_hello');
    setDots(['belt', 'tree']);
    await step(0, { icon: 'belt', line: 'tr_belt' });
    markDot(1, 'on');
    card.classList.add('hidden');
    const targets = hard ? ['redcar', 'bus', 'tree', 'light', 'moto', 'zebra'] : ['redcar', 'bus', 'tree', 'light'];
    const grid = $('.tg-grid', root);
    grid.className = `tg-grid n${targets.length}`;
    grid.innerHTML = targets.map((t) => `<button class="tg-find" data-t="${t}">${tgIcon(t, 150)}<i>${CHECK}</i></button>`).join('');
    root.classList.add('dim');
    musicLevel(0.35, 2);
    freeTurns(true);   // 窗外尋寶：兩個人可以一起找
    const left = new Set(targets);
    let lastAct = Date.now();
    // 先接好點擊，角色說明的時候就可以開始找
    const hunt = new Promise((resolve) => {
      const nag = setInterval(() => {
        if (!alive) { clearInterval(nag); resolve(); return; }
        if (Date.now() - lastAct < 50000 || isSpeaking()) return;
        lastAct = Date.now();
        sayBg(`tr_${pick([...left])}`);
      }, 1000);
      const cap = setTimeout(() => { clearInterval(nag); off(); resolve(); }, 15 * 60000);
      const h = (e) => {
        const b = e.target.closest('.tg-find:not(.found)');
        if (!b) return;
        e.preventDefault();
        b.classList.add('found');
        left.delete(b.dataset.t);
        lastAct = Date.now();
        sfx('sparkle');
        confetti(b, 10);
        hush();
        if (!left.size) { clearInterval(nag); clearTimeout(cap); off(); resolve(); return; }
        (async () => {
          await speak(host, 'tr_found', { node: hostIn });
          if (!alive || !left.size) return;
          await speak(host, pick(['praise1', 'praise2', 'praise3']), { node: hostIn });
        })();
      };
      const off = () => grid.removeEventListener('pointerdown', h);
      grid.addEventListener('pointerdown', h);
      cleanups.push(() => { clearInterval(nag); clearTimeout(cap); off(); resolve(); });
    });
    await say('tr_hunt');
    if (left.size === targets.length) sayBg(`tr_${pick(targets)}`);
    await hunt;
    freeTurns(false);
    guard();
    root.classList.remove('dim');
    musicLevel(1, 1);
    markDot(1, 'done');
    await pause(800);
    await say(left.size ? 'tr_more' : 'tr_done');
    grid.classList.add('hidden');
    await celebrate();
    await finish();
  }

  // ---------- 陪去公園 ----------
  async function runOuting() {
    const wk2 = sceneWeather(wx);
    const sunny = wk2 === 'hot' || wx.kind === 'clear';
    await say('pko_hello');
    await checkLine();
    const list = [
      { icon: 'toilet', line: 'pko_potty' },
      { icon: 'bottle', line: 'pko_water', per: true },
      ...(sunny ? [{ icon: 'hat', line: 'pko_hat', per: true }] : []),
      ...(wk2 === 'hot' ? [{ icon: 'sunscreen', line: 'pko_sun', per: true }] : []),
      { icon: 'sandtoys', line: 'pko_toys' },
    ];
    await runSteps(list);
    showIcon('go', 'pop');
    await say('pko_go');
    // 到公園：螢幕變暗、每 15 分鐘提醒一次；爸媽按勾勾就回家
    card.classList.add('hidden');
    await say('pko_end');
    root.classList.add('dim');
    musicLevel(0.3, 2);
    const total = PARK_MAX_MIN * 60000;
    const pool = ['pko_r1', 'pko_r2', 'pko_r3'];
    let next = PARK_REMIND_MIN * 60000;
    let n = 0;
    const t = timer(total, (e) => {
      if (e >= next) { next += PARK_REMIND_MIN * 60000; sfx('sparkle'); sayBg(pool[n++ % pool.length]); }
    });
    const ok = oneOk({ nudge: false });
    const r = await Promise.race([t, ok.then(() => 'ok')]);
    guard();
    if (r === 'ok') t.stop(); else ok.cancel();
    root.classList.remove('dim');
    musicLevel(1, 1);
    await say('pko_home');
    await celebrate();
    await finish();
  }

  const RUN = { outing: runOuting, sleep: runSleep, out: runOut, meal: runMeal, wash: runWash, bag: runBag, homework: runHomework, gym: runGym, ride: runRide };

  function destroy() {
    if (!alive) return;
    alive = false;
    cleanups.forEach((fn) => fn());
    hush();
  }
  onTap($('.hud .home', root), (e) => {
    e.stopPropagation();
    if (mode === 'end' && !root.classList.contains('night-out')) return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), (e) => {
    e.stopPropagation();
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  (async () => {
    playMusic(M.track);
    await wait(300);
    try {
      await RUN[kind]();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return {
    destroy,
    hostChar: host,
    noClock: true,     // 一起做不算遊玩時間，也不會被下班打斷
    requestEnd() {},
  };
}

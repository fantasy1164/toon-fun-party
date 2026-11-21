// 九九乘法（11/21，John：妍卉大班，先懂再記；建構式，不是填鴨）。咕咕老師的學堂，學堂選單多一個「乘法」。
// 照學校順序 2、5、4、8、3、6、9、7，一天一課；每次進來先複習學過的（最多 5 題，常錯、還不熟的多出現）。
// 一課：① 草莓分到盤子，每盤一樣多 → 奇奇一顆一顆數很慢 → 一盤一盤跳著數（青蛙在數線上跳）→ 選總共幾顆
//      ② 生活例子（一雙鞋 2 隻、一隻手 5 根手指……）一個一個點，青蛙跳到 9 份，黑板上留下這個數的乘法
//      ③ 排排站、按轉轉鈕轉過來：一樣多（交換）
//      ④ 推推看（4、8、3、6、9、7）：把一排拆成學過的兩塊（4＝2＋2、6＝5＋1、9＝10－1）
//      ⑤ 口訣：點黑板上的題目，咕咕老師念一句，牆上的乘法表亮一格（翻過來的那一格也亮）
// 一起玩：向澤負責分草莓、點盤子、點東西（分組、數），妍卉負責選答案、轉、推推看；一樣唱名、輪到的人才點。
// 只有妍卉的乘法進度（state.profiles.yh.times），向澤自己一個人玩時學堂不出現乘法。
import { el, $, $$, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save, recordHabit } from '../core/store.js';
import * as weather from '../core/weather.js';
import { classroomBack } from '../art/school.js';
import { STRAWBERRY, PLATE, BASKET, ROTATE_BTN, ctxSvg, NUM_CARD, wrongsFor, posterSvg, BOARD, numberLine, dotArray, boardEq } from '../art/times.js';
import { makeScene, charDiv } from './party.js';
import { turnsOn, setTurn, passTurn } from '../core/turns.js';
import { pickCard, tapOne, giveReward, moveTo, kidNode } from './kit.js';

const HOST = 'gugu';
export const TIMES_ORDER = [2, 5, 4, 8, 3, 6, 9, 7];
const LEARNER = 'yh';
// 推推看：一排拆成 [黃色幾顆, 藍色幾顆]；9 是 10 顆再拿掉 1 顆（ghost）
const STRAT = { 4: { split: [2, 2] }, 8: { split: [4, 4] }, 3: { split: [2, 1] }, 6: { split: [5, 1] }, 7: { split: [5, 2] }, 9: { split: [10, 0], ghost: true } };

// ---------- 進度 ----------
export function timesState(id = LEARNER) {
  const p = state.profiles[id];
  if (!p.times) p.times = { learned: [], lessonDay: null, cells: {} };
  return p.times;
}
const key = (a, b) => `${a}x${b}`;
// 學過的格子：學過 n 的乘法 → n×1..n×9 和翻過來的 1×n..9×n
export function litCells(t = timesState()) {
  const s = new Set();
  for (const n of t.learned) for (let b = 1; b <= 9; b += 1) { s.add(key(n, b)); s.add(key(b, n)); }
  // 1 的乘法：學了任何一課後 1×1 也算（1 個一數）
  if (t.learned.length) s.add('1x1');
  return s;
}
// 熟練：在兩天以上答對過，而且最後一次是對的（翻過來的那格一起算）
export function strongCells(t = timesState()) {
  const s = new Set();
  for (const [k, c] of Object.entries(t.cells)) {
    if ((c.okDays || []).length >= 2 && c.lastOk) {
      const [a, b] = k.split('x');
      s.add(key(a, b)); s.add(key(b, a));
    }
  }
  return s;
}
export function nextLesson(t = timesState()) { return TIMES_ORDER.find((n) => !t.learned.includes(n)) || null; }
export function timesOpen(profile) { return profile.members.includes(LEARNER); }
function record(a, b, ok) {
  const t = timesState();
  const c = t.cells[key(a, b)] || (t.cells[key(a, b)] = { ok: 0, miss: 0, okDays: [] });
  const today = dateKey();
  if (ok) {
    c.ok += 1;
    if (!c.okDays.includes(today)) c.okDays = [...c.okDays, today].slice(-5);
  } else c.miss += 1;
  c.lastOk = ok;
  c.last = today;
  save();
}
// 複習題：學過的乘法裡挑，常錯、還不熟、很久沒問的比較容易被挑到
function pickReview(t, count = 5) {
  const pool = [];
  for (const n of t.learned) {
    for (let b = 2; b <= 9; b += 1) {
      const c = t.cells[key(n, b)];
      let w = 1;
      if (!c) w = 2;
      else {
        w += c.miss * 2;
        if (!c.lastOk) w += 3;
        if ((c.okDays || []).length < 2) w += 1.5;
        if (c.last === dateKey()) w *= 0.3;
      }
      pool.push({ a: n, b, w });
    }
  }
  const out = [];
  while (out.length < count && pool.length) {
    const sum = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * sum;
    let i = 0;
    while (r > pool[i].w) { r -= pool[i].w; i += 1; }
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

export function mountTimes(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const ph = phase();
  const wx = weather.current();
  const t = timesState();
  const inner = `
    <div class="tm-board"></div>
    <div class="tm-poster">${posterSvg(litCells(t), strongCells(t))}</div>
    <div class="kt-things"></div>
    ${charDiv(HOST, 30, 410, 0.62)}
    ${charDiv('kiki', 1050, 640, 0.5)}
    ${kids.map((id, i) => kidNode(id, 130 + i * 120, 890)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit times', back: classroomBack(ph, wx) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const num = (x) => host(`num_${x}`);
  const box = $('.kt-cards', root);
  const board = $('.tm-board', root);
  const poster = $('.tm-poster', root);
  const things = $('.kt-things', root);
  const call = () => ctl.call();
  // 分工：一起玩時指定這一步輪到誰（向澤分組、點；妍卉算）
  const as = (id) => { if (two && turnsOn()) setTurn(id); };
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  // 答案一律是 6 歲版（三張卡）；選錯先說明（onWrong）再讓對的發亮
  const answer = (x, a, onWrong) => pickCard(box, { right: NUM_CARD(x), wrongs: wrongsFor(x, a).map(NUM_CARD), hard: true, call, onWrong, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const setBoard = (html) => { board.innerHTML = html; };
  function paintPoster(hot = null) { poster.innerHTML = posterSvg(litCells(), strongCells(), hot); }

  // ---------- 複習 ----------
  async function review() {
    const qs = pickReview(timesState());
    if (!qs.length) return false;
    await host('mu_review');
    for (const { a, b } of qs) {
      setBoard(dotArray(b, a, { eq: `${a} × ${b} = ?` }));
      board.classList.add('hide-dots');
      if (two) {
        // 向澤把點點排出來
        as('xz');
        const cover = thing('tm-board-tap', '', [BOARD.x, BOARD.y]);
        cover.style.width = `${BOARD.w}px`;
        cover.style.height = `${BOARD.h}px`;
        await host('mu_review_show');
        await tap(cover);
        guard();
        cover.remove();
      }
      sfx('pop');
      board.classList.remove('hide-dots');
      await pause(300);
      as(LEARNER);
      await host('mu_review_q');
      let missed = false;
      await answer(a * b, a, async () => {
        if (!missed) { missed = true; record(a, b, false); }
        // 一排一排跳著數
        await host('mu_review_wrong');
        for (let r = 0; r < b; r += 1) {
          $$(`.tm-dot.r${r}`, board).forEach((d) => d.classList.add('lit'));
          sfx('pop');
          await num(a * (r + 1));
        }
      });
      guard();
      if (!missed) record(a, b, true);
      setBoard(dotArray(b, a, { eq: `${a} × ${b} = ${a * b}` }));
      await host(`k_${a}_${b}`);
      if (!missed) await host('mu_review_ok');
      paintPoster(key(a, b));
    }
    return true;
  }

  // ---------- 新課 ----------
  async function lesson(n) {
    await host(`mu_intro_${n}`);
    if (two) await host('mu_roles');
    // ① 草莓分到三個盤子
    const basket = thing('tm-basket', BASKET, [950, 520]);
    basket.style.pointerEvents = 'none';
    const plates = [470, 650, 830].map((x) => thing('tm-plate', PLATE, [x - 80, 690]));
    await host(`mu_share_${n}`);
    const br = ctl.rectOf(basket);
    for (const p of plates) {
      as('xz');
      await tap(p);
      guard();
      const pr = ctl.rectOf(p);
      for (let i = 0; i < n; i += 1) {
        const berry = thing('tm-berry', STRAWBERRY, [br.x + 50, br.y + 20]);
        berry.style.pointerEvents = 'none';
        const cols = Math.min(n, 5);
        const row = Math.floor(i / 5);
        const col = i % 5;
        const off = (cols - 1) * 13;
        moveTo(berry, [pr.x + 80 - off + col * 26, pr.y + 46 - row * 20], 380);
        sfx('pop');
        await pause(150);
      }
      await pause(300);
    }
    // 奇奇一顆一顆數，數亂了 → 一盤一盤跳著數
    await host('mu_share_q');
    await say('kiki', 'mu_kiki_slow');
    await host('mu_skip');
    const max3 = n * 3;
    const visited = [];
    setBoard(numberLine(max3, n, visited, 0));
    for (let i = 0; i < 3; i += 1) {
      as('xz');
      await tap(plates[i]);
      guard();
      visited.push(n * (i + 1));
      setBoard(numberLine(max3, n, visited, n * (i + 1)));
      sfx('boing');
      await num(n * (i + 1));
    }
    as(LEARNER);
    await host('mu_total_q');
    await answer(n * 3, n, () => host('mu_review_wrong'));
    guard();
    await host(`k_${n}_3`);
    await say('kiki', 'mu_kiki_wow');
    await host('mu_meaning');
    // ② 生活例子：一份一份變多，青蛙跳到 9 份
    plates.forEach((p) => p.remove());
    $$('.tm-berry', things).forEach((b) => b.remove());
    basket.remove();
    const icons = Array.from({ length: 9 }, (_, i) => thing('tm-ctx dim', ctxSvg(n, 78), [215 + i * 88, 560]));
    await host(`mu_ctx_${n}`);
    await host('mu_ctx_tap');
    const seen = [];
    setBoard(numberLine(n * 9, n, seen, 0));
    for (let i = 0; i < 9; i += 1) {
      // 一起玩：兩個人輪流點（都是在數一份一份）
      if (two) as(i % 2 === 0 ? 'xz' : LEARNER);
      await tap(icons[i]);
      guard();
      icons[i].classList.remove('dim');
      seen.push(n * (i + 1));
      setBoard(numberLine(n * 9, n, seen, n * (i + 1)));
      sfx('boing');
      await num(n * (i + 1));
    }
    await host('mu_table_done');
    icons.forEach((ic) => ic.remove());
    // ③ 排排站、轉過來
    setBoard(dotArray(3, n, { eq: `${n} × 3` }));
    await host('mu_rows');
    const rot = thing('tm-rotate', ROTATE_BTN, [690, 356]);
    as(LEARNER);
    await host('mu_turn_tap');
    await tap(rot);
    guard();
    board.classList.add('spin');
    sfx('whoosh');
    await pause(700);
    board.classList.remove('spin');
    setBoard(dotArray(n, 3, { eq: `3 × ${n}` }));
    rot.remove();
    await host('mu_turn_ok');
    // ④ 推推看
    const S = STRAT[n];
    if (S) {
      await say('kiki', 'mu_kiki_count');
      setBoard(dotArray(3, S.ghost ? 9 : n, { split: S.split, ghost: S.ghost, eq: `${n} × 3` }));
      await host(`mu_strat_${n}`);
      const parts = $$('.tm-part', board);
      const [p1, p2] = S.ghost ? [10 * 3, 3] : [S.split[0] * 3, S.split[1] * 3];
      // 黃色（學過的）
      as(LEARNER);
      await host('mu_strat_tap1');
      const z1 = thing('tm-zone', '', [0, 0]);
      const z2 = thing('tm-zone', '', [0, 0]);
      // 黑板的 svg 跟舞台 1:1，直接用區塊的座標（不受鏡頭位移影響）
      const place = (z, part) => {
        const g = (a) => parseFloat(part.getAttribute(a));
        const w = Math.max(64, g('width'));
        const h = Math.max(64, g('height'));
        z.style.left = `${BOARD.x + g('x') + g('width') / 2 - w / 2}px`;
        z.style.top = `${BOARD.y + g('y') + g('height') / 2 - h / 2}px`;
        z.style.width = `${w}px`;
        z.style.height = `${h}px`;
      };
      place(z1, parts[0]);
      place(z2, parts[1]);
      z2.classList.add('hidden');
      await tap(z1);
      guard();
      parts[0].classList.add('lit');
      await num(p1);
      // 藍色（或虛線那一排要拿掉）：一起玩給向澤點
      as('xz');
      await host(S.ghost ? 'mu_strat_take' : 'mu_strat_tap2');
      z2.classList.remove('hidden');
      await tap(z2);
      guard();
      parts[1].classList.add(S.ghost ? 'gone' : 'lit');
      await num(p2);
      z1.remove(); z2.remove();
      as(LEARNER);
      await host('mu_strat_sum');
      await answer(n * 3, n, () => host('mu_review_wrong'));
      guard();
      await host(`k_${n}_3`);
      await host('mu_strat_ok');
    }
    // ⑤ 口訣：點黑板上的題目，念一句、亮一格
    await host('mu_chant');
    const tt = timesState();
    if (!tt.learned.includes(n)) tt.learned = [...tt.learned, n];
    tt.lessonDay = dateKey();
    save();
    const chip = thing('tm-board-tap', '', [BOARD.x, BOARD.y]);
    chip.style.width = `${BOARD.w}px`;
    chip.style.height = `${BOARD.h}px`;
    for (let b = 1; b <= 9; b += 1) {
      setBoard(boardEq(n, b));
      if (two) as(b % 2 ? LEARNER : 'xz');
      await tap(chip);
      guard();
      setBoard(boardEq(n, b, n * b));
      paintPoster(key(n, b));
      sfx('sparkle');
      await host(`k_${n}_${b}`);
    }
    chip.remove();
    paintPoster();
    poster.classList.add('shine');
    const c = centerOf(poster);
    burst(c.x, c.y, { n: 20, kind: 'star', spread: 200 });
    await host('mu_poster');
    poster.classList.remove('shine');
  }

  (async () => {
    playMusic('study');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('mu_hello');
      const reviewed = await review();
      const n = nextLesson();
      let taught = false;
      if (n && timesState().lessonDay !== dateKey()) {
        await lesson(n);
        taught = true;
      } else if (!n) await host('mu_all');
      else await host('mu_done_today');
      setBoard('');
      if (taught || reviewed) {
        await host(taught ? 'dn_times' : 'dn_times_rv');
        recordHabit([LEARNER], 'times');
        await giveReward({ root, kids, reward: 'times', series: HOST, say: host });   // 一起玩兩個人都有參與
      }
      await host('mu_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

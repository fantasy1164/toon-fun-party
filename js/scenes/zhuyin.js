// 注音課（11/27，John：咕咕老師的學堂新增結合韻和手寫注音，要鼓勵寫字端正）
// 妍卉 37 個會認、寫得不熟；手指、Apple Pencil 都會用；一起玩時分工（向澤讓小鳥飛、找圖卡，妍卉寫字），照樣輪流；
// 寫不端正最多再寫一次（第二個寫完不管結果都說進步的地方，避免挫折）。
// 一天一課：開場複習學過的結合韻 → 坐好（頭正、身直、腳平放）→ 寫 2 個符號（ㄅㄆㄇ 順序）→ 2 個新結合韻（小鳥合音、找圖卡、直式寫）
//          → 今天最端正的貼到作品牆 → 說原因、給獎 → 回家用紙筆寫三次給爸媽看。
// 寫字：老師示範（紅色、筆順數字）→ 描紅（從綠色圓點開始，一筆一筆）→ 自己寫 → 先說一個寫得好的地方，再給一個小建議。
// 只有妍卉的進度（state.profiles.yh.zhuyin）；向澤一個人玩時學堂不出現注音。
import { el, $, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase, dateKey } from '../core/clock.js';
import { state, save, recordHabit } from '../core/store.js';
import * as weather from '../core/weather.js';
import { classroomBack } from '../art/school.js';
import { SYMS, STROKES, JIEHE, JIEHE_BY, JIEHE_LESSONS, symCode } from '../data/zhuyin.js';
import { PIC, jieheCard, birdSvg, POSTURE, workSvg } from '../art/zhuyin.js';
import { evaluate, praiseOf, tipOf } from '../core/handwrite.js';
import { makeScene, charDiv } from './party.js';
import { turnsOn, setTurn, passTurn } from '../core/turns.js';
import { pickCard, tapOne, giveReward, kidNode } from './kit.js';
import { makePad } from './writepad.js';

const HOST = 'gugu';
const LEARNER = 'yh';

// ---------- 進度 ----------
export function zyState(id = LEARNER) {
  const p = state.profiles[id];
  if (!p.zhuyin) p.zhuyin = { symIdx: 0, learned: [], lessonDay: null, syms: {}, jh: {}, works: [] };
  return p.zhuyin;
}
export function zhuyinOpen(profile) { return profile.members.includes(LEARNER); }
export const nextGroup = (z = zyState()) => JIEHE_LESSONS.find((g) => g.some((id) => !z.learned.includes(id))) || null;
// 寫的紀錄：寫過幾次、最好的分數、端正幾次
function recWrite(map, key, r) {
  const c = map[key] || (map[key] = { n: 0, best: 0, neat: 0 });
  c.n += 1;
  c.best = Math.max(c.best, r.score);
  if (r.neat) c.neat += 1;
  c.last = dateKey();
}
// 還不熟的（端正次數少、分數低的先）
function weakest(map, keys, k) {
  return [...keys].sort((a, b) => {
    const A = map[a] || { neat: 0, best: 0 }; const B = map[b] || { neat: 0, best: 0 };
    return (A.neat - B.neat) || (A.best - B.best) || (Math.random() - 0.5);
  }).slice(0, k);
}
// 存作品：座標取整數、點數變少（雲端同步用，越小越好）
const slim = (cells) => cells.map((st) => st.map((s) => {
  const step = Math.max(1, Math.ceil(s.length / 28));
  const out = s.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== s[s.length - 1]) out.push(s[s.length - 1]);
  return out.map(([x, y]) => [Math.round(x), Math.round(y)]);
}));

export function mountZhuyin(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const ph = phase();
  const wx = weather.current();
  const inner = `
    <div class="zy-area"></div>
    ${charDiv(HOST, 30, 410, 0.62)}
    ${kids.map((id, i) => kidNode(id, 130 + i * 120, 890)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit zhuyin', back: classroomBack(ph, wx) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const area = $('.zy-area', root);
  const call = () => ctl.call();
  const as = (id) => { if (two && turnsOn()) setTurn(id); };
  const z = zyState();
  const today = dateKey();
  const works = [];       // 今天寫的（作品牆挑最端正的）
  let salt = Math.floor(Math.random() * 5);
  let penSeen = false;
  let penTold = false;

  // ---------- 寫一個（單一符號或結合韻） ----------
  function judge(cells, syms) {
    const rs = syms.map((s, i) => evaluate(cells[i] || [], STROKES[s]));
    const worst = rs.reduce((a, b) => (b.score < a.score ? b : a));
    const bestR = rs.reduce((a, b) => (b.score > a.score ? b : a));
    return { rs, score: Math.round(rs.reduce((s, r) => s + r.score, 0) / rs.length), neat: rs.every((r) => r.neat), tip: tipOf(worst), praise: praiseOf(bestR, salt++) };
  }
  async function writeTask(syms, intro) {
    const pair = syms.length > 1;
    const pad = makePad(root, { syms, left: pair ? 470 : 440, top: pair ? 92 : 150, size: pair ? 285 : 340, cleanups: ctl.cleanups, onPen: () => { penSeen = true; } });
    ctl.cleanups.push(() => pad.destroy());
    await intro();
    await pad.demo();
    guard();
    // 情境連貫：先說要做什麼，再唱名
    await host('zy_trace');
    as(LEARNER);
    if (two) await call();
    await pad.trace({ onRetry: () => host('zy_trace_retry'), onHelp: () => host('zy_trace_help') });
    guard();
    if (penSeen && !penTold) { penTold = true; await host('zy_pen'); }
    await host('zy_free');
    const first = await pad.free();
    guard();
    if (penSeen && !penTold) { penTold = true; await host('zy_pen'); }
    let r = judge(first, syms);
    let cells = first;
    if (r.neat) {
      sfx('sparkle');
      const c = centerOf(pad.node);
      burst(c.x, c.y, { n: 16, kind: 'star', spread: 180 });
      await host('zy_great');
      await host(r.praise);
    } else {
      await host(r.praise);
      pad.compare(true);
      await host(r.tip || 'zyt_shape');
      await pause(400);
      pad.compare(false);
      await host('zy_again');
      const second = await pad.free();
      guard();
      const r2 = judge(second, syms);
      const better = r2.score >= r.score + 6 || (r2.neat && !r.neat);
      if (better) {
        sfx('sparkle');
        const c = centerOf(pad.node);
        burst(c.x, c.y, { n: 16, kind: 'star', spread: 180 });
      }
      await host(better ? 'zyi_better' : 'zyi_good');
      if (r2.score >= r.score) { r = r2; cells = second; }
    }
    // 紀錄：單一符號記在 syms、結合韻記在 jh（兩個符號也各記一次）
    syms.forEach((s, i) => recWrite(z.syms, s, r.rs[i]));
    if (pair) recWrite(z.jh, JIEHE.find((j) => j.s.join('') === syms.join('')).id, { score: r.score, neat: r.neat });
    works.push({ k: syms.join(''), c: slim(cells), s: r.score, neat: r.neat });
    save();
    await pause(300);
    pad.destroy();
    if (two && turnsOn()) passTurn();   // 寫完換人（下一步向澤會聽到「換向澤囉」）
  }

  // ---------- 複習：聽念法，找結合韻 ----------
  async function review() {
    const ids = [...z.learned].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!ids.length) return false;
    await host('zy_review');
    for (const id of ids) {
      const j = JIEHE_BY[id];
      const others = JIEHE.filter((x) => x.id !== id).sort(() => Math.random() - 0.5);
      if (two) {
        // 向澤先找圖卡
        as('xz');
        await host(`zyj_find_${id}`);
        await pickCard(box, { right: PIC[j.pic], wrongs: others.slice(0, 2).map((x) => PIC[x.pic]), hard: true, call, cleanups: ctl.cleanups });
        guard();
      }
      as(LEARNER);
      await host(`zyj_q_${id}`);
      // 錯的選項先用學過的（比較像），不夠再用別的
      const learnedOthers = others.filter((x) => z.learned.includes(x.id));
      const wr = [...learnedOthers, ...others.filter((x) => !z.learned.includes(x.id))].slice(0, 2);
      let missed = false;
      await pickCard(box, { right: jieheCard(j.s), wrongs: wr.map((x) => jieheCard(x.s)), hard: true, call, cleanups: ctl.cleanups, onWrong: async () => { missed = true; await host(`zyj_join_${id}`); } });
      guard();
      const c = z.jh[id] || (z.jh[id] = { n: 0, best: 0, neat: 0 });
      c.heard = (c.heard || 0) + (missed ? 0 : 1);
      c.miss = (c.miss || 0) + (missed ? 1 : 0);
    }
    save();
    return true;
  }

  // ---------- 坐好 ----------
  async function posture() {
    const card = el(`<div class="zy-posture">${POSTURE}<button class="zy-ready" aria-label="坐好了"><svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="46" fill="#5bc06b"/><path d="M28 52L44 68L74 34" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`);
    area.appendChild(card);
    await host('zy_posture');
    as(LEARNER);
    await tapOne($('.zy-ready', card), { call, cleanups: ctl.cleanups });
    guard();
    sfx('ding');
    await host('zy_posture_ok');
    card.remove();
  }

  // ---------- 新的結合韻：兩隻小鳥合音 → 找圖卡 → 寫 ----------
  async function meet(id) {
    const j = JIEHE_BY[id];
    const birds = el(`<button class="zy-birds"><div class="zy-bird b1">${birdSvg(j.s[0], '#7fc4ff')}</div><div class="zy-bird b2">${birdSvg(j.s[1], '#ffb3c7', true)}</div></button>`);
    area.append(birds);
    await host('zyj_new');
    as(two ? 'xz' : LEARNER);
    await tapOne(birds, { call, cleanups: ctl.cleanups });
    guard();
    birds.classList.add('join');
    const said = host(`zyj_join_${id}`);
    await wait(1600);
    const card = el(`<div class="zy-jcard"><svg viewBox="0 0 100 100" width="260" height="260">${jieheCard(j.s)}</svg></div>`);
    area.appendChild(card);
    sfx('sparkle');
    const c = centerOf(card);
    burst(c.x, c.y, { n: 14, kind: 'star', spread: 160 });
    birds.remove();
    await said;
    guard();
    as(two ? 'xz' : LEARNER);
    await host(`zyj_find_${id}`);
    const others = JIEHE.filter((x) => x.id !== id).sort(() => Math.random() - 0.5).slice(0, 2);
    await pickCard(box, { right: PIC[j.pic], wrongs: others.map((x) => PIC[x.pic]), hard: true, call, cleanups: ctl.cleanups });
    guard();
    card.remove();
  }

  // ---------- 作品牆 ----------
  async function wall() {
    if (!works.length) return;
    const best = [...works].sort((a, b) => b.s - a.s).slice(0, 3);
    z.works = [...best.map((w) => ({ d: today, k: w.k, c: w.c, s: w.s })), ...(z.works || []).filter((w) => w.d !== today)].slice(0, 24);
    save();
    const wallNode = el(`<div class="zy-wall">${best.map((w) => `<div class="zy-frame">${workSvg(w.c, 150)}</div>`).join('')}</div>`);
    area.appendChild(wallNode);
    sfx('sparkle');
    const c = centerOf(wallNode);
    burst(c.x, c.y, { n: 18, kind: 'star', spread: 220 });
    await host('zy_wall');
    await pause(600);
    wallNode.remove();
  }

  (async () => {
    playMusic('study');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('zy_hello');
      if (two) await host('zy_roles');
      await review();
      const fresh = z.lessonDay !== today;
      const taughtSyms = SYMS.slice(0, z.symIdx);
      let singles;
      let group = null;
      let newGroup = false;
      if (fresh) {
        singles = z.symIdx < SYMS.length ? SYMS.slice(z.symIdx, z.symIdx + 2) : weakest(z.syms, SYMS, 2);
        group = nextGroup(z);
        newGroup = !!group;
        if (!group) {
          await host('zy_all');
          group = weakest(z.jh, z.learned, 2);
        }
      } else {
        await host('zy_done_today');
        singles = taughtSyms.length ? weakest(z.syms, taughtSyms, 1) : [SYMS[0]];
        group = z.learned.length ? weakest(z.jh, z.learned, 1) : [];
      }
      await posture();
      for (const s of singles) {
        const k = STROKES[s].length;
        await writeTask([s], async () => { await host(`zys_${symCode(s)}`); await host(`zy_cnt_${k}`); });
      }
      for (const id of group) {
        if (newGroup) await meet(id);
        await writeTask(JIEHE_BY[id].s, () => host('zy_write_pair'));
      }
      if (fresh) {
        if (z.symIdx < SYMS.length) z.symIdx = Math.min(SYMS.length, z.symIdx + singles.length);
        if (newGroup) z.learned = [...new Set([...z.learned, ...group])];
        z.lessonDay = today;
        save();
      }
      await wall();
      await host(fresh && newGroup ? 'dn_zhuyin' : 'dn_zhuyin_rv');
      recordHabit([LEARNER], 'zhuyin');
      await giveReward({ root, kids, reward: 'zhuyin', series: HOST, say: host });
      await host('zy_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

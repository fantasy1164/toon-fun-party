// 明星劇場（名人堂）：奇奇主持。
// 明星牌：點了角色出來自我介紹、做招牌動作；好朋友星星（一起做才會得到）集滿 5 顆有好朋友表演與合照。
// 舞台中間是小孩自己的明星牌：小明星徽章。麥克風：明星演唱會（挑明星上台，看到音符就點）。
// 集滿好寶寶印章：進來先開明星派對。
import { PROFILES, STARS, FRIEND_MAX, BADGE_TIERS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, musicBeat, musicLevel } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { state, save } from '../core/store.js';
import { characterSvg, avatarSvg, kidFigure, useBody } from '../art/characters.js';
import { tgIcon } from '../art/together.js';
import { hallBack, plaquePos, plaqueSvg, starRow, KID_COLOR, photoSvg, meSvg, CROWN, NOTE, CLOSE } from '../art/hall.js';
import { makeScene, charDiv } from './party.js';
import { turnsOn, passTurn, freeTurns } from '../core/turns.js';

const HOST = 'kiki';
// 招牌動作與聲音
const MOVE = { dudu: 'waddle', kiki: 'hop', bobo: 'bounce', mian: 'sway', gugu: 'flap', doudou: 'wag', pupu: 'bounce', tiaotiao: 'flip', yuanyuan: 'hop', lili: 'spin', gaogao: 'sway', yongyong: 'hop', sensen: 'sway', lulu: 'flip' };
const SND = { dudu: 'squeak', kiki: 'boing', bobo: 'drum', mian: 'baa', gugu: 'ding', doudou: 'boing', pupu: 'horn', tiaotiao: 'whoosh', yuanyuan: 'trumpet', lili: 'coin', gaogao: 'ding', yongyong: 'horn', sensen: 'sparkle', lulu: 'bubble' };
// 小明星徽章：一起做的種類 → 圖示
export const HABITS = [
  ['sleep', 'moon'], ['out', 'shoes'], ['meal', 'bowl'], ['brush', 'toothbrush'], ['wash', 'hands'], ['bag', 'bag'], ['homework', 'homework'],
  ['gym', 'bunny'], ['ride', 'redcar'], ['outing', 'park'], ['doctor', 'steth'], ['shop', 'cart'], ['bath', 'bathtub'], ['fun', 'ferris'], ['firecheck', 'alarm'], ['read', 'book'], ['english', 'abc'], ['quake', 'quake'], ['stairs', 'stairs'],
];
const tierOf = (n) => BADGE_TIERS.filter((t) => n >= t).length;

export function mountHall(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const P = (k) => state.profiles[k];
  const friends = (k, id) => Math.min(FRIEND_MAX, P(k).friends?.[id] || 0);
  const best = (id) => kids.some((k) => friends(k, id) >= FRIEND_MAX);

  const plaques = STARS.map((id, i) => {
    const [x, y] = plaquePos(i, STARS.length);
    return `<button class="hf-plaque${best(id) ? ' best' : ''}" data-id="${id}" style="left:${x}px;top:${y}px">${plaqueSvg(id)}
      <div class="hf-stars">${kids.map((k) => starRow(friends(k, id), FRIEND_MAX, KID_COLOR[k], two ? 18 : 24)).join('')}</div></button>`;
  }).join('');
  const inner = `
    <div class="hf-wall">${plaques}</div>
    ${charDiv(HOST, 30, 612)}
    <div class="hf-mes">${kids.map((k) => `<button class="hf-me" data-id="${k}">${meSvg()}<div class="hf-me-av">${avatarSvg(k, 108)}</div></button>`).join('')}</div>
    <button class="round-btn hf-mic">${tgIcon('mic', 130)}</button>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'hall', back: hallBack() });
  const { root, guard, pause } = ctl;
  const hostNode = () => $(`.p-char[data-who="${HOST}"]`, root);
  const host = async (line, who = profile.id, name = profile.name) => { guard(); await speak(HOST, line, { name, who, node: hostNode() }); guard(); };
  const confetti = (node, n = 14) => { const c = centerOf(node); burst(c.x, c.y, { n, kind: 'star', spread: 220 }); };

  const waitTap = (scope, sel) => new Promise((res) => {
    const h = (e) => {
      const t = e.target.closest(sel);
      if (!t || !scope.contains(t)) return;
      e.preventDefault();
      scope.removeEventListener('pointerdown', h);
      res(t);
    };
    scope.addEventListener('pointerdown', h);
    ctl.cleanups.push(() => { scope.removeEventListener('pointerdown', h); res(null); });
  });

  // ---------- 明星出來自我介紹 ----------
  async function showChar(id, { bestKid = null } = {}) {
    const ov = el(`<div class="hf-show"><div class="hf-spot"></div>
      <div class="hf-big mv-${MOVE[id]}"><svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg(id)}</svg></div>
      <div class="hf-bigstars">${kids.map((k) => starRow(friends(k, id), FRIEND_MAX, KID_COLOR[k], 44)).join('')}</div>
      <div class="hf-photo hidden"></div></div>`);
    root.appendChild(ov);
    const big = $('.hf-big', ov);
    let closed = false;
    let ready = false;
    const closedP = new Promise((res) => onTap(ov, () => { if (ready || bestKid === null) { closed = true; res(); } }));
    ctl.cleanups.push(() => { closed = true; });
    const seq = (async () => {
      await wait(250);
      sfx(SND[id]);
      big.classList.add('moving');
      if (!closed) await speak(id, 'hf_intro', { node: big });
      big.classList.remove('moving');
      if (bestKid && !closed) {
        await speak(id, 'hf_best', { name: PROFILES[bestKid].name, who: bestKid, node: big });
        big.classList.add('dance');
        sfx('fanfare');
        confetti(big, 24);
        const ph = $('.hf-photo', ov);
        ph.innerHTML = photoSvg(id, bestKid);
        ph.classList.remove('hidden');
        sfx('sparkle');
        await wait(1800);
        big.classList.remove('dance');
      }
      ready = true;
      await wait(5000);
    })();
    await Promise.race([seq, closedP]);
    if (closed) hush();
    ov.classList.add('away');
    await wait(300);
    ov.remove();
    guard();
  }

  // ---------- 小明星徽章 ----------
  async function showBadges(k) {
    const list = HABITS.filter(([h]) => h !== 'homework' || PROFILES[k].level === 'hard');
    const ov = el(`<div class="hf-badges"><div class="hf-bhead">${CROWN}${avatarSvg(k, 130)}</div>
      <div class="hf-bgrid">${list.map(([h, ic]) => `<button class="hf-badge t${tierOf(P(k).habits?.[h] || 0)}" data-h="${h}">${tgIcon(ic, 92)}</button>`).join('')}</div>
      <button class="round-btn hf-close">${CLOSE}</button></div>`);
    root.appendChild(ov);
    sfx('sparkle');
    await host('hb_open', k, PROFILES[k].name);
    let busy = false;
    $$('.hf-badge', ov).forEach((b) => onTap(b, async () => {
      if (busy) return;
      busy = true;
      const n = P(k).habits?.[b.dataset.h] || 0;
      b.classList.add('pop');
      sfx(n ? 'sparkle' : 'tap');
      try {
        await speak(HOST, n ? `hb_${b.dataset.h}` : 'hb_none', { node: hostNode() });
        if (tierOf(n) === 3) await speak(HOST, 'hb_gold', { node: hostNode() });
      } finally {
        b.classList.remove('pop');
        busy = false;
      }
    }));
    await waitTap(ov, '.hf-close');
    hush();
    sfx('tap');
    ov.remove();
    guard();
  }

  // ---------- 明星演唱會 ----------
  async function concert() {
    const N = two ? 4 : 3;
    const ov = el(`<div class="hf-concert"><div class="hf-lights"></div><div class="hf-cstage"></div>
      <div class="hf-pick">${STARS.map((id) => `<button class="hf-head" data-id="${id}"><svg viewBox="10 0 220 200" width="104" height="96">${characterSvg(id)}</svg></button>`).join('')}</div>
      <div class="hf-aud">${kids.map((k) => (useBody() ? `<div class="hf-aud-kid body k-${k}">${kidFigure(k, { w: 120 })}</div>` : `<div class="hf-aud-kid k-${k}">${avatarSvg(k, 100)}</div>`)).join('')}</div></div>`);
    root.appendChild(ov);
    const cstage = $('.hf-cstage', ov);
    const xs = N === 3 ? [330, 600, 870] : [240, 480, 720, 960];
    await host(two ? 'hc_pick2' : 'hc_pick');
    const chosen = [];
    while (chosen.length < N) {
      await ctl.call();
      const b = await waitTap(ov, '.hf-head:not(.on)');
      guard();
      if (!b) return;
      passTurn();
      b.classList.add('on');
      const id = b.dataset.id;
      sfx(SND[id]);
      const i = chosen.length;
      chosen.push(id);
      const side = two ? (i < 2 ? 'yh' : 'xz') : '';
      const c = el(`<div class="hf-star mv-${MOVE[id]} ${side ? `side-${side}` : ''}" data-i="${i}" style="left:${xs[i] - 108}px"><svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg(id)}</svg></div>`);
      cstage.appendChild(c);
      void c.getBoundingClientRect();
      c.classList.add('in');
    }
    $('.hf-pick', ov).classList.add('hidden');
    ov.classList.add('show');
    await host('hc_go');
    playMusic('concert');
    if (two) freeTurns(true);
    const stars = $$('.hf-star', cstage);
    // 點明星：有音符就是打中了
    stars.forEach((s) => onTap(s, () => {
      const note = $('.hf-note', s);
      if (note && !note.classList.contains('hit')) {
        note.classList.add('hit');
        sfx('note');
        if (Math.random() < 0.3) sfx(SND[chosen[+s.dataset.i]]);
        const c = centerOf(note);
        burst(c.x, c.y, { n: 10, kind: 'star', spread: 120 });
        setTimeout(() => note.remove(), 250);
      } else {
        sfx('pop');
      }
      s.classList.remove('hit');
      void s.getBoundingClientRect();
      s.classList.add('hit');
    }));
    let last = -1;
    for (let n = 0; n < 24; n++) {
      const mb = musicBeat();
      if (mb && mb.name === 'concert') {
        const next = Math.ceil((mb.beat + 0.1) / 2) * 2;
        await pause(Math.max(0, (next - mb.beat) * mb.beatSec * 1000));
      } else {
        await pause(1000);
      }
      let i;
      if (two) i = (n % 2 ? 2 : 0) + Math.floor(Math.random() * 2);
      else do { i = Math.floor(Math.random() * N); } while (i === last);
      last = i;
      const s = stars[i];
      if ($('.hf-note', s)) continue;
      const note = el(`<div class="hf-note">${NOTE}</div>`);
      s.appendChild(note);
      setTimeout(() => { if (!note.classList.contains('hit')) { note.classList.add('miss'); setTimeout(() => note.remove(), 300); } }, 1900);
    }
    await pause(1800);
    if (two) freeTurns(false);
    musicLevel(0.4, 1);
    sfx('applause');
    stars.forEach((s) => s.classList.add('bow'));
    confetti(cstage, 30);
    await host('hc_end');
    await pause(800);
    musicLevel(1, 0.5);
    playMusic('stage');
    ov.remove();
  }

  // ---------- 集滿印章：明星派對 ----------
  async function party(due) {
    const pos = STARS.map((_, i) => (i < 7 ? [40 + i * 160, 140] : [40 + (i - 7) * 160, 320]));
    const ov = el(`<div class="hf-party">
      ${STARS.map((id, i) => `<div class="hf-pc" style="left:${pos[i][0]}px;top:${pos[i][1]}px;animation-delay:${(i % 4) * 0.12}s"><svg viewBox="0 0 240 320" width="100%" height="100%">${characterSvg(id)}</svg></div>`).join('')}
      <div class="hf-pkids">${due.map((k) => `<div class="hf-pkid${useBody() ? ' body' : ''}">${CROWN}${useBody() ? kidFigure(k, { w: 150 }) : avatarSvg(k, 150)}</div>`).join('')}</div></div>`);
    root.appendChild(ov);
    playMusic('party');
    const conf = setInterval(() => {
      const r = stage.getBoundingClientRect();
      burst(r.left + Math.random() * r.width, r.top + Math.random() * r.height * 0.5, { n: 10, kind: 'star', spread: 160 });
    }, 700);
    ctl.cleanups.push(() => clearInterval(conf));
    try {
      sfx('fanfare');
      const who = due.length > 1 ? 'both' : due[0];
      await host('hp_hello', who, due.length > 1 ? PROFILES.both.name : PROFILES[due[0]].name);
      for (const id of [...STARS].filter((x) => x !== HOST).sort(() => Math.random() - 0.5).slice(0, 3)) {
        const i = STARS.indexOf(id);
        const node = $$('.hf-pc', ov)[i];
        node.classList.add('front');
        await speak(id, 'hp_cheer', { node });
        guard();
        node.classList.remove('front');
      }
      ov.classList.add('dance');
      sfx('applause');
      await pause(3500);
      await host('hp_end');
      for (const k of due) P(k).partyDue = Math.max(0, (P(k).partyDue || 0) - 1);
      save();
    } finally {
      clearInterval(conf);
    }
    ov.remove();
    playMusic('stage');
  }

  // ---------- 平常：點明星牌、自己的牌子、麥克風 ----------
  async function idle() {
    while (ctl.alive) {
      ctl.mode = 'done';
      if (ctl.timeUp) { ctl.goodbye(); return; }
      await ctl.call();
      const t = await waitTap(root, '.hf-plaque, .hf-me, .hf-mic');
      if (!t || !ctl.alive) return;
      ctl.mode = 'act';
      passTurn();
      sfx('tap');
      if (t.classList.contains('hf-plaque')) {
        const id = t.dataset.id;
        const k = kids.find((x) => friends(x, id) >= FRIEND_MAX);
        await showChar(id, { bestKid: k || null });
      } else if (t.classList.contains('hf-me')) {
        await showBadges(t.dataset.id);
      } else {
        await concert();
      }
    }
  }

  (async () => {
    playMusic('stage');
    await wait(400);
    try {
      ctl.mode = 'act';
      const due = kids.filter((k) => (P(k).partyDue || 0) > 0);
      if (due.length) await party(due);
      // 剛變成好朋友：好朋友表演、合照
      for (const k of kids) {
        for (const id of STARS) {
          if (friends(k, id) >= FRIEND_MAX && !P(k).starSeen?.[id]) {
            P(k).starSeen = { ...(P(k).starSeen || {}), [id]: true };
            save();
            $(`.hf-plaque[data-id="${id}"]`, root)?.classList.add('best');
            await host('hf_newbest', k, PROFILES[k].name);
            await showChar(id, { bestKid: k });
          }
        }
      }
      if (!state.hallIntro) {
        state.hallIntro = true;
        save();
        await host('hl_first');
      } else {
        await host('hl_hello');
      }
      await idle();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return ctl.api;
}

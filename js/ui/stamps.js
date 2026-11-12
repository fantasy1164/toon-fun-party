// 好寶寶印章：挑印章畫面、蓋章畫面、印章卡。
import { PROFILES, CHARACTERS } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { state, setStamp, addStamp, cardInfo } from '../core/store.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import {
  SHAPE_IDS, COLOR_IDS, COLORS, shapeSvg, impressionSvg, stampToolSvg, ensureInkFilter,
} from '../art/stamps.js';

const CHECK = `<svg viewBox="0 0 100 100" width="70" height="70"><path d="M22 52L42 72L80 30" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const nameOf = (id) => PROFILES[id].name;

// ---------- 印章卡 ----------
// 回傳卡片 HTML。slot 是每格大小（px）。
export function cardHtml(id, slot = 120) {
  const { size, stamps } = cardInfo(id);
  const cols = 5;
  const cells = Array.from({ length: size }, (_, i) => {
    const e = stamps[i];
    const ink = e ? impressionSvg(e.s, e.c, slot * 0.82, e.rot, '#fffdf6') : '';
    return `<div class="slot ${e ? 'done' : ''}" data-i="${i}" style="width:${slot}px;height:${slot}px">${ink}</div>`;
  }).join('');
  return `<div class="stamp-card" style="--cols:${cols}">
    <div class="card-head">${avatarSvg(id, slot * 0.8)}</div>
    <div class="card-grid">${cells}</div></div>`;
}

// ---------- 挑印章 ----------
export function pickStamp(stage, id) {
  ensureInkFilter();
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const cur = state.profiles[id].stamp;
    const repick = !!cur;
    let shape = cur?.shape || null;
    let color = cur?.color || null;
    let tried = repick;

    const tiles = SHAPE_IDS.map((s) => `<button class="tile" data-s="${s}">${shapeSvg(s, '#8a7a66', 96)}</button>`).join('');
    const pads = COLOR_IDS.map((c) => `<button class="pad" data-c="${c}" style="--ink:${COLORS[c]}"></button>`).join('');
    const node = el(`
      <div class="screen picker">
        <div class="who">${avatarSvg(id, 130)}</div>
        <div class="tiles">${tiles}</div>
        <div class="pads">${pads}</div>
        <div class="paper"></div>
        <button class="round-btn ok hidden">${CHECK}</button>
        <svg class="host" viewBox="0 0 1200 900">${characterSvg(host, { x: 20, y: 540, s: 1.0 })}</svg>
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    const hostNode = $('.host', node);
    const say = (line) => speak(host, line, { name: nameOf(id), who: id, node: hostNode });
    const paper = $('.paper', node);
    const ok = $('.ok', node);

    function refresh() {
      $$('.tile', node).forEach((t) => {
        t.classList.toggle('on', t.dataset.s === shape);
        t.innerHTML = shapeSvg(t.dataset.s, color || '#8a7a66', 96);
      });
      $$('.pad', node).forEach((p) => p.classList.toggle('on', p.dataset.c === color));
      paper.classList.toggle('ready', !!(shape && color));
      ok.classList.toggle('hidden', !(shape && color && tried));
    }

    $$('.tile', node).forEach((t) => onTap(t, () => {
      shape = t.dataset.s;
      sfx('pop');
      refresh();
      const c = centerOf(t);
      burst(c.x, c.y, { n: 5, kind: 'star', spread: 60 });
      speak(host, `sh_${shape}`, { node: hostNode }).then(() => { if (!color) say('stamp_color'); });
    }));
    $$('.pad', node).forEach((p) => onTap(p, () => {
      color = p.dataset.c;
      sfx('tap');
      refresh();
      speak(host, `co_${color}`, { node: hostNode }).then(() => { if (shape && !tried) say('stamp_try'); });
    }));
    onTap(paper, (e) => {
      if (!shape || !color) { sfx('wrong'); return; }
      const r = paper.getBoundingClientRect();
      const s = r.width / paper.offsetWidth;
      const x = (e.clientX - r.left) / s;
      const y = (e.clientY - r.top) / s;
      const mark = el(`<div class="mark" style="left:${x - 60}px;top:${y - 60}px">${impressionSvg(shape, color, 120, Math.round(Math.random() * 30 - 15))}</div>`);
      paper.appendChild(mark);
      while (paper.children.length > 6) paper.firstElementChild.remove();
      sfx('stamp');
      if (!tried) { tried = true; refresh(); say('stamp_ok'); }
    });
    onTap(ok, async () => {
      if (!shape || !color) return;
      ok.classList.add('hidden');
      setStamp(id, shape, color);
      sfx('fanfare');
      const c = centerOf(ok);
      burst(c.x, c.y, { n: 16, kind: 'star', spread: 200 });
      hostNode.classList.add('happy');
      await say('stamp_mine');
      await wait(300);
      resolve();
    });

    refresh();
    say(repick ? 'stamp_repick' : 'stamp_pick');
  });
}

// ---------- 蓋章（家長解鎖後，小孩自己蓋） ----------
export function stampSession(stage, id, reasons) {
  ensureInkFilter();
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const p = state.profiles[id];
    const { size, stamps, full } = cardInfo(id);
    const nextIndex = full ? 0 : stamps.length;   // 上一張集滿了，這次會換新卡
    const slot = size > 5 ? 128 : 150;

    const node = el(`
      <div class="screen stamping">
        <div class="desk"></div>
        <div class="card-wrap">${full ? cardHtmlEmpty(id, size, slot) : cardHtml(id, slot)}</div>
        <svg class="host" viewBox="0 0 1200 900">${characterSvg(host, { x: 20, y: 560, s: 0.95 })}</svg>
        <div class="tool">${stampToolSvg(p.stamp.shape, p.stamp.color, 190)}</div>
        <div class="party hidden"><svg viewBox="0 0 1200 900">
          ${characterSvg('dudu', { x: 260, y: 520, s: 1.1 })}${characterSvg('kiki', { x: 700, y: 520, s: 1.1 })}</svg></div>
      </div>`);
    stage.appendChild(node);
    playMusic('lobby');
    const hostNode = $('.host', node);
    const say = (line, n = hostNode, who = host) => speak(who, line, { name: nameOf(id), who: id, node: n });
    const tool = $('.tool', node);
    const target = $(`.slot[data-i="${nextIndex}"]`, node);
    target.classList.add('next');

    let stamped = false;
    onTap(node, async () => {
      if (stamped) return;
      stamped = true;
      target.classList.remove('next');

      // 印章飛到格子上方，按下去
      const sr = stage.getBoundingClientRect();
      const k = sr.width / 1200;
      const tr = target.getBoundingClientRect();
      const tx = (tr.left - sr.left) / k + tr.width / k / 2;
      const ty = (tr.top - sr.top) / k + tr.height / k / 2;
      tool.style.transform = `translate(${tx - 95}px, ${ty - 215}px)`;
      tool.classList.add('flying');
      sfx('whoosh');
      await wait(520);
      tool.classList.add('press');
      await wait(140);
      sfx('stamp');
      const isFull = addStamp(id, reasons);
      const e = p.card[p.card.length - 1];
      target.innerHTML = impressionSvg(e.s, e.c, slot * 0.82, e.rot, '#fffdf6');
      target.classList.add('done', 'fresh');
      const c = centerOf(target);
      burst(c.x, c.y, { n: 14, kind: 'star', spread: 150 });
      await wait(220);
      tool.classList.remove('press');
      tool.classList.add('lift');

      hostNode.classList.add('happy');
      for (const r of reasons.slice(0, 3)) await say(`r_${r}`);
      hostNode.classList.remove('happy');

      if (isFull) {
        // 集滿：大家一起開派對
        $('.party', node).classList.remove('hidden');
        hostNode.classList.add('hidden');
        tool.classList.add('hidden');
        sfx('fanfare');
        const sr2 = stage.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
          setTimeout(() => burst(sr2.left + sr2.width * (0.2 + i * 0.2), sr2.top + sr2.height * 0.3, { n: 16, kind: 'star', spread: 220 }), i * 250);
        }
        await say('card_full', $('.party', node), pick(['dudu', 'kiki']));
      } else {
        await say('stamp_next');
      }
      await wait(1200);
      node.classList.add('fadeout');
      await wait(400);
      node.remove();
      resolve(isFull);
    });

    say('stamp_intro');
  });
}

// 上一張卡集滿時，蓋章畫面直接秀一張新的空卡
function cardHtmlEmpty(id, size, slot) {
  const cells = Array.from({ length: size }, (_, i) =>
    `<div class="slot" data-i="${i}" style="width:${slot}px;height:${slot}px"></div>`).join('');
  return `<div class="stamp-card"><div class="card-head">${avatarSvg(id, slot * 0.8)}</div><div class="card-grid">${cells}</div></div>`;
}

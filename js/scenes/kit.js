// 新場景共用的小工具：圖卡選擇、依序點東西。一起玩時照輪流（唱名、點對才換人）。
import { el, $$, onTap, wait, burst, centerOf } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { PROFILES } from '../config.js';
import { turnsOn, passTurn, whoseTurn, freeTurns } from '../core/turns.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
export { shuffle };

// 現在輪到的人是不是 6 歲版
export function hardNow(profile) {
  if (turnsOn() && whoseTurn()) return PROFILES[whoseTurn()].level === 'hard';
  return profile.level === 'hard';
}

// 圖卡：right 是對的圖，wrongs 是錯的圖（3 歲版只放一張錯的、對的發亮）。
// call()：先唱名；onWrong()：選錯時角色說明。回傳時已換人。
export async function pickCard(box, { right, wrongs = [], hard, call, onWrong, cleanups, size = 220 }) {
  if (call) await call();
  const items = shuffle([{ svg: right, ok: true }, ...(hard ? wrongs : wrongs.slice(0, 1)).map((svg) => ({ svg, ok: false }))]);
  box.innerHTML = items.map((c, i) => `<button class="kt-card${!hard && c.ok ? ' glow' : ''}" data-i="${i}" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100" width="${size * 0.86}" height="${size * 0.86}">${c.svg}</svg></button>`).join('');
  box.classList.remove('hidden');
  await new Promise((resolve) => {
    let busy = false;
    $$('.kt-card', box).forEach((b) => onTap(b, async () => {
      if (busy) return;
      const it = items[+b.dataset.i];
      busy = true;
      if (!it.ok) {
        sfx('wrong');
        b.classList.add('nope');
        await onWrong?.();
        b.classList.remove('nope');
        $$('.kt-card', box).forEach((x) => x.classList.toggle('glow', items[+x.dataset.i].ok));
        busy = false;
        return;
      }
      sfx('sparkle');
      b.classList.add('picked');
      const c = centerOf(b);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 140 });
      resolve();
    }));
    cleanups?.push(() => resolve());
  });
  passTurn();
  await wait(550);
  box.classList.add('hidden');
}

// 依序點好幾個東西：一起玩時一人一個（free：兩個人可以一起點）
export async function tapEach(nodes, onEach, { free = false, call, cleanups, alive = () => true } = {}) {
  let left = nodes.length;
  let calling = false;
  nodes.forEach((n) => n.classList.add('glow'));
  if (free) freeTurns(true);
  else if (turnsOn() && call) { calling = true; await call(); calling = false; }
  // 做完就把這一步的點擊拿掉（11/21：牙科先數牙齒、再點蛀牙，同一批牙齒上留著數牙齒的點擊，
  // 搶先把蛀牙標成 done，蛀牙那一步永遠點不完）
  const handlers = [];
  const off = () => handlers.splice(0).forEach(([n, h]) => n.removeEventListener('pointerdown', h));
  await new Promise((resolve) => {
    if (!left) { resolve(); return; }
    nodes.forEach((n) => {
      const h = async (e) => {
        e.preventDefault();
        if (n.classList.contains('done') || calling || !alive()) return;
        n.classList.add('done');
        n.classList.remove('glow');
        if (!free) { passTurn(); calling = turnsOn(); }
        await onEach(n);
        left -= 1;
        if (left === 0) { calling = false; resolve(); return; }
        if (calling && call) { await call().catch(() => {}); calling = false; }
      };
      n.addEventListener('pointerdown', h);
      handlers.push([n, h]);
    });
    cleanups?.push(() => resolve());
  });
  off();
  if (free) freeTurns(false);
}

// 等點一下某個東西（輪流）
export async function tapOne(node, { call, cleanups, free = false } = {}) {
  node.classList.add('glow');
  if (!free && call) await call();
  await new Promise((resolve) => {
    onTap(node, () => resolve());
    cleanups?.push(() => resolve());
  });
  node.classList.remove('glow');
  if (!free) passTurn();
}

export const elx = el;

// 給獎：這個時段還沒領過的人各拿一件；領過了就說「練習得很好」
import { REWARD_SLOTS } from '../config.js';
import { hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import { itemSvg, nextItem } from '../art/items.js';
import { avatarSvg, kidFigure, useBody } from '../art/characters.js';
// 場景裡的小孩：全身（預設）或只有頭；footY 是腳底（舞台座標）
export function kidNode(id, x, footY, { cls = 'kt-kid', outfit = '' } = {}) {
  if (useBody()) return `<div class="${cls} body k-${id}" data-id="${id}" style="left:${x}px;top:${footY - 173}px">${kidFigure(id, { w: 130, outfit })}</div>`;
  return `<div class="${cls} k-${id}" data-id="${id}" style="left:${x}px;top:${footY - 110}px">${avatarSvg(id, 110)}</div>`;
}
export async function giveReward({ root, kids, reward, series, say }) {
  sfx('fanfare');
  const slot = currentSlot(REWARD_SLOTS[reward], hour());
  const winners = slot ? kids.filter((id) => !hasClaimed(id, `${reward}_${slot}`)) : [];
  if (!winners.length) { await say('practice'); return false; }
  const gifts = winners.map((id) => {
    const item = nextItem(state.profiles[id].collection, series);
    addItem(id, item);
    claim(id, `${reward}_${slot}`);
    return { id, item };
  });
  save();
  const node = el(`<div class="gift">${gifts.map((g) => `<div class="card">${itemSvg(g.item, 210)}${kids.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('')}</div>`);
  root.appendChild(node);
  sfx('sparkle');
  try {
    await say('gift');
    await wait(600);
  } finally {
    node.classList.add('away');
    sfx('whoosh');
    await wait(650);
    node.remove();
  }
  return true;
}

// 移動：x、y 是腳底中間（舞台座標）
export function moveTo(node, [x, y], ms = 700) {
  const w = node.offsetWidth || 110;
  const h = node.offsetHeight || 110;
  node.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`;
  node.style.left = `${x - w / 2}px`;
  node.style.top = `${y - h}px`;
  return wait(ms + 30);
}

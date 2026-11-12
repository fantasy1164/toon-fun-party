// 開場、選人、休息／睡覺畫面、陳列櫃。
import { PROFILES, CHARACTERS } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic, stopMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import * as weather from '../core/weather.js';
import * as fest from '../core/festival.js';
import { NIGHTCAP } from '../art/characters.js';
import { TREE_ICON } from '../art/xmas.js';
import { state, save, shelfLayout, swapShelf, SHELF_COLS } from '../core/store.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import { SERIES, itemSvg } from '../art/items.js';
import { cardHtml } from './stamps.js';
import { ensureInkFilter } from '../art/stamps.js';

const ICON = {
  play: `<svg viewBox="0 0 100 100" width="130" height="130"><path d="M34 20L82 50L34 80Z" fill="#fff" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>`,
  home: `<svg viewBox="0 0 100 100" width="60" height="60"><path d="M50 14L12 48H24V84H42V60H58V84H76V48H88Z" fill="#ff7fa8"/></svg>`,
  cab: `<svg viewBox="0 0 100 100" width="62" height="62"><rect x="14" y="12" width="72" height="76" rx="10" fill="#b9824f"/><path d="M14 50H86" stroke="#8a5a2b" stroke-width="8"/><path d="M50 18l5 10l11 1l-8 8l2 11l-10-6l-10 6l2-11l-8-8l11-1Z" fill="#ffd34d"/><circle cx="36" cy="70" r="9" fill="#6cc7ea"/><circle cx="64" cy="70" r="9" fill="#ff7fa8"/></svg>`,
  close: `<svg viewBox="0 0 100 100" width="56" height="56"><path d="M24 24L76 76M76 24L24 76" stroke="#ff6b5c" stroke-width="14" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 100 100" width="44" height="44"><rect x="24" y="44" width="52" height="40" rx="8" fill="#8a7a66"/><path d="M34 46V34a16 16 0 0 1 32 0V46" fill="none" stroke="#8a7a66" stroke-width="9"/></svg>`,
};
export { ICON };

// ---------- 開場：點一下才能開始（瀏覽器規定要有觸碰才能出聲） ----------
export function showSplash(stage) {
  return new Promise((resolve) => {
    const node = el(`
      <div class="screen splash">
        <svg class="cast" viewBox="0 0 1200 900">
          ${characterSvg('dudu', { x: 120, y: 430, s: 1.2 })}
          ${characterSvg('kiki', { x: 800, y: 430, s: 1.2 })}
        </svg>
        <button class="round-btn play" aria-label="start">${ICON.play}</button>
      </div>`);
    stage.replaceChildren(node);
    let done = false;
    onTap(node, () => {
      if (done) return;
      done = true;
      resolve();
    });
  });
}

// ---------- 家長鎖：長按 3 秒 ----------
export function lockButton(onOpen) {
  const b = el(`<button class="round-btn lock" aria-label="parent">
    <svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42"/></svg>${ICON.lock}</button>`);
  let timer = null;
  const cancel = () => { clearTimeout(timer); timer = null; b.classList.remove('holding'); };
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    b.classList.add('holding');
    timer = setTimeout(() => { cancel(); onOpen(); }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => b.addEventListener(t, cancel));
  return b;
}

// ---------- 選人 ----------
export function showProfiles(stage, { onParent }) {
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const node = el(`
      <div class="screen profiles">
        <button class="who" data-id="yh">${avatarSvg('yh')}</button>
        <button class="who" data-id="both">${avatarSvg('both')}</button>
        <button class="who" data-id="xz">${avatarSvg('xz')}</button>
        <svg class="host" viewBox="0 0 1200 900">${characterSvg(host, { x: 490, y: 590, s: 0.92 })}</svg>
      </div>`);
    node.appendChild(lockButton(onParent));
    stage.replaceChildren(node);
    playMusic('lobby');
    let chosen = false;
    node.querySelectorAll('.who').forEach((b) => onTap(b, async () => {
      if (chosen) return;
      chosen = true;
      b.classList.add('chosen');
      sfx('fanfare');
      const c = centerOf(b);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 160 });
      await wait(700);
      resolve(PROFILES[b.dataset.id]);
    }));
  });
}

// ---------- 休息／睡覺 ----------
// 休息時間還剩多少（0–1）
function restLeft() {
  const total = Math.max(1, state.settings.restMin) * 60000;
  return Math.max(0, Math.min(1, (state.session.restUntil - Date.now()) / total));
}

// 休息倒數：像一片餅乾越吃越小，小孩不用看懂數字
function restRing(left) {
  const C = 2 * Math.PI * 35;
  return `<svg class="rest-ring" viewBox="0 0 200 200" width="190" height="190">
    <circle cx="100" cy="100" r="92" fill="#fff" opacity=".85"/>
    <circle class="pie" cx="100" cy="100" r="35" fill="none" stroke="#ffb300" stroke-width="70"
      stroke-dasharray="${(C * left).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 100 100)"/>
    <circle cx="100" cy="100" r="72" fill="none" stroke="#e0a800" stroke-width="6"/>
    <path d="M100 100V44M100 100L136 120" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="8" fill="#7a5230"/></svg>`;
}

// 角色下班：白天天氣好就在公園玩；晚上或下雨在客廳沙發休息。角色是醒著的。
function restArt(ph) {
  const outside = ph !== 'night' && !['rain', 'storm'].includes(weather.current().kind);
  if (outside) {
    const skyTop = ph === 'dusk' ? '#ff9f6b' : ph === 'dawn' ? '#ffb38a' : '#6ec6ff';
    return { cls: 'park', svg: `
      <defs><linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient></defs>
      <rect width="1200" height="900" fill="url(#rsky)"/>
      <circle class="sun" cx="980" cy="150" r="60" fill="#ffd34d"/>
      <g class="cloud" fill="#fff"><ellipse cx="260" cy="130" rx="70" ry="28"/><ellipse cx="300" cy="112" rx="44" ry="30"/></g>
      <path d="M0 560Q300 500 600 540T1200 520V900H0Z" fill="#8fd67a"/>
      <rect x="120" y="360" width="30" height="220" fill="#8a5a2b"/><circle cx="135" cy="330" r="110" fill="#4caf50"/><circle cx="80" cy="380" r="60" fill="#43a047"/>
      <g transform="translate(860 330)"><rect x="0" y="0" width="16" height="250" fill="#e5484d"/><rect x="90" y="0" width="16" height="250" fill="#e5484d"/>
        ${[40, 90, 140, 190].map((y) => `<rect x="0" y="${y}" width="106" height="10" fill="#e5484d"/>`).join('')}
        <path d="M106 10L300 240H270L96 40Z" fill="#ffd34d"/></g>
      ${characterSvg('kiki', { x: 380, y: 430, s: 1.0 })}
      ${characterSvg('dudu', { x: 600, y: 440, s: 0.95 })}` };
  }
  return { cls: 'lounge', svg: `
    <rect width="1200" height="900" fill="${ph === 'night' ? '#3b3f6b' : '#f7dcc0'}"/>
    <rect y="680" width="1200" height="220" fill="${ph === 'night' ? '#2c2f55' : '#c8915a'}"/>
    <rect x="80" y="80" width="260" height="200" rx="16" fill="${ph === 'night' ? '#16224f' : '#9fb3c8'}" stroke="#fff" stroke-width="12"/>
    <path d="M210 80V280M80 180H340" stroke="#fff" stroke-width="8"/>
    <circle cx="1040" cy="300" r="70" fill="#ffd34d" opacity=".35"/><path d="M1000 320H1080L1060 250H1020Z" fill="#ffe9a8"/><rect x="1034" y="320" width="12" height="300" fill="#7a5230"/>
    <rect x="220" y="470" width="760" height="230" rx="60" fill="#e5734f"/><rect x="260" y="420" width="680" height="140" rx="50" fill="#f08a6a"/>
    ${characterSvg('dudu', { x: 300, y: 330, s: 0.95 })}
    ${characterSvg('kiki', { x: 640, y: 330, s: 0.95 })}
    <rect x="460" y="560" width="120" height="80" rx="8" fill="#5fc3e8" transform="rotate(-8 520 600)"/>` };
}

export function showClosed(stage, { reason, onParent }) {
  const ph = phase();
  if (reason === 'rest') return showRest(stage, { onParent, ph });
  const eveNight = fest.isDecember() && fest.day() === 24;
  const stars = Array.from({ length: 14 }, (_, i) =>
    `<circle class="star" style="animation-delay:${(i % 5) * 0.3}s" cx="${80 + (i * 83) % 1080}" cy="${60 + (i * 137) % 360}" r="${3 + (i % 3)}" fill="#fff"/>`).join('');
  const node = el(`
    <div class="screen closed asleep">
      <svg class="art" viewBox="0 0 1200 900">
        ${stars}<circle cx="980" cy="170" r="70" fill="#fff6c8"/><circle cx="1012" cy="150" r="62" fill="#17255e"/>
        <rect y="640" width="1200" height="260" fill="#16224f"/>
        ${characterSvg('dudu', { x: 250, y: 420, s: 1.2, extra: eveNight ? NIGHTCAP.dudu : '' })}
        ${characterSvg('kiki', { x: 660, y: 420, s: 1.2, extra: eveNight ? NIGHTCAP.kiki : '' })}
      </svg>
      ${fest.isDecember() && fest.day() <= 25 ? `<div class="closed-tree">${TREE_ICON}</div>` : ''}
    </div>`);
  node.appendChild(lockButton(onParent));
  stage.replaceChildren(node);
  stopMusic();
  let last = 0;
  onTap(node, () => {
    const t = Date.now();
    if (t - last < 5000) return;
    last = t;
    sfx('snore');
    speak(pick(['dudu', 'kiki']), eveNight ? 'sleeping_eve' : 'sleeping', { name: '', who: '' });
  });
  return node;
}

// 角色下班休息中：角色醒著在玩或休息，右上角的餅乾越來越小，吃完就可以再玩
function showRest(stage, { onParent, ph }) {
  const art = restArt(ph);
  const node = el(`
    <div class="screen closed resting ${art.cls}">
      <svg class="art" viewBox="0 0 1200 900">${art.svg}</svg>
      <div class="rest-clock">${restRing(restLeft())}</div>
      ${fest.isDecember() && fest.day() <= 25 ? `<div class="closed-tree">${TREE_ICON}</div>` : ''}
    </div>`);
  node.appendChild(lockButton(onParent));
  stage.replaceChildren(node);
  stopMusic();
  const tick = setInterval(() => {
    if (!node.isConnected) { clearInterval(tick); return; }
    $('.rest-clock', node).innerHTML = restRing(restLeft());
  }, 5000);
  let last = 0;
  onTap(node, () => {
    const t = Date.now();
    if (t - last < 5000) return;
    last = t;
    sfx('tap');
    speak(pick(['dudu', 'kiki']), art.cls === 'park' && weather.niceOutside(ph) ? 'resting_sunny' : 'resting', { name: '', who: '' });
  });
  return node;
}

// ---------- 陳列櫃 ----------
export function openCabinet(root, memberIds) {
  ensureInkFilter();
  const unitHtml = (id) => {
    const col = state.profiles[id].collection;
    const shelf = shelfLayout(id);
    const drag = PROFILES[id].level === 'hard';
    const slots = shelf.map((item, i) => {
      const n = item ? col[item] || 0 : 0;
      const dots = n > 1 ? `<span class="dots">${'<i></i>'.repeat(Math.min(n, 5))}</span>` : '';
      return `<div class="slot ${item ? 'have' : 'empty'}" data-i="${i}">${item ? `<div class="thing">${itemSvg(item, 96)}</div>${dots}` : ''}</div>`;
    }).join('');
    const card = state.profiles[id].stamp ? `<div class="card-row">${cardHtml(id, memberIds.length > 1 ? 46 : 64)}</div>` : '';
    return `<div class="unit ${drag ? 'draggable' : ''}" data-id="${id}"><div class="owner">${avatarSvg(id, 104)}</div>${card}
      <div class="shelf" style="--cols:${SHELF_COLS}">${slots}</div></div>`;
  };
  save();
  const node = el(`<div class="cabinet ${memberIds.length > 1 ? 'two' : ''}">${memberIds.map(unitHtml).join('')}<button class="round-btn close">${ICON.close}</button></div>`);
  root.appendChild(node);
  sfx('whoosh');
  const close = () => { sfx('tap'); node.remove(); };
  onTap($('.close', node), close);
  // 點櫃子以外的地方也可以關
  node.addEventListener('pointerdown', (e) => { if (e.target === node) close(); });

  // 6 歲版：拖曳收藏品換位置
  $$('.unit.draggable', node).forEach((unit) => {
    const id = unit.dataset.id;
    let drag = null;
    const stageEl = document.getElementById('stage');
    const toStage = (e) => {
      const r = stageEl.getBoundingClientRect();
      const k = r.width / 1200;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };
    unit.addEventListener('pointerdown', (e) => {
      const slot = e.target.closest('.slot.have');
      if (!slot) return;
      e.preventDefault();
      const p = toStage(e);
      const ghost = el(`<div class="drag-ghost">${slot.querySelector('.thing').innerHTML}</div>`);
      stageEl.appendChild(ghost);
      ghost.style.transform = `translate(${p.x - 55}px, ${p.y - 55}px)`;
      slot.classList.add('lifted');
      drag = { slot, ghost, pid: e.pointerId };
      unit.setPointerCapture?.(e.pointerId);
      sfx('pop');
    });
    unit.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const p = toStage(e);
      drag.ghost.style.transform = `translate(${p.x - 55}px, ${p.y - 55}px)`;
      $$('.slot', unit).forEach((s) => s.classList.remove('over'));
      document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.slot')?.classList.add('over');
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.pid) return;
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.slot');
      const { slot, ghost } = drag;
      drag = null;
      ghost.remove();
      slot.classList.remove('lifted');
      $$('.slot', unit).forEach((s) => s.classList.remove('over'));
      if (!target || !unit.contains(target) || target === slot) return;
      swapShelf(id, +slot.dataset.i, +target.dataset.i);
      unit.outerHTML = unitHtml(id);
      sfx('sparkle');
      // 重新綁定事件：直接重開一次櫃子
      node.remove();
      openCabinet(root, memberIds);
    };
    unit.addEventListener('pointerup', end);
    unit.addEventListener('pointercancel', end);
  });
  return node;
}

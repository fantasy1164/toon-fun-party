// 開場、選人、休息／睡覺畫面、陳列櫃。
import { PROFILES, CHARACTERS } from '../config.js';
import { el, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic, stopMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { state } from '../core/store.js';
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
export function showClosed(stage, { reason, onParent }) {
  const ph = phase();
  const day = reason === 'rest' && ph !== 'night';
  const stars = day ? '' : Array.from({ length: 14 }, (_, i) =>
    `<circle class="star" style="animation-delay:${(i % 5) * 0.3}s" cx="${80 + (i * 83) % 1080}" cy="${60 + (i * 137) % 360}" r="${3 + (i % 3)}" fill="#fff"/>`).join('');
  const sky = day
    ? `<circle cx="980" cy="170" r="70" fill="#ffd34d"/>`
    : `<circle cx="980" cy="170" r="70" fill="#fff6c8"/><circle cx="1012" cy="150" r="62" fill="#17255e"/>`;
  const node = el(`
    <div class="screen closed asleep ${day ? 'daytime' : ''}">
      <svg class="art" viewBox="0 0 1200 900">
        ${stars}${sky}
        ${day ? '' : '<rect y="640" width="1200" height="260" fill="#16224f"/>'}
        ${characterSvg('dudu', { x: 250, y: 420, s: 1.2 })}
        ${characterSvg('kiki', { x: 660, y: 420, s: 1.2 })}
      </svg>
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
    speak(pick(['dudu', 'kiki']), reason === 'bedtime' ? 'sleeping' : 'resting', { name: '', who: '' });
  });
  return node;
}

// ---------- 陳列櫃 ----------
export function openCabinet(root, memberIds) {
  ensureInkFilter();
  const units = memberIds.map((id) => {
    const col = state.profiles[id].collection;
    const slots = [...SERIES.dudu, ...SERIES.kiki].map((item) => {
      const n = col[item] || 0;
      const dots = n > 1 ? `<span class="dots">${'<i></i>'.repeat(Math.min(n, 5))}</span>` : '';
      return `<div class="slot ${n ? 'have' : 'none'}">${itemSvg(item, 96)}${dots}</div>`;
    }).join('');
    const card = state.profiles[id].stamp ? `<div class="card-row">${cardHtml(id, memberIds.length > 1 ? 46 : 64)}</div>` : '';
    return `<div class="unit"><div class="owner">${avatarSvg(id, 104)}</div>${card}<div class="shelf">${slots}</div></div>`;
  }).join('');
  const node = el(`<div class="cabinet ${memberIds.length > 1 ? 'two' : ''}">${units}<button class="round-btn close">${ICON.close}</button></div>`);
  root.appendChild(node);
  sfx('whoosh');
  onTap(node, () => { sfx('tap'); node.remove(); });
  return node;
}

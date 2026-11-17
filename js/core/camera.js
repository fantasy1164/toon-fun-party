// 舞台攝影機（立體感升級，11/17 John 選「保留插畫、加深度和光影」）
// 場景分成幾層，鏡頭移動時遠的動得少、近的動得多，看起來有景深：
//   back：背景（天空、遠山、地面、圍欄）
//   mid：動物（站在圍欄裡）
//   front：前面的步道、角色、小孩、可以點的東西、遊園車
//   fore：畫面最旁邊的近景花草（移動最快）
// 鏡頭：進場景從遠推近、平常像呼吸一樣輕輕動、點到東西稍微靠過去、換區時平移；
// 拿著 iPad 傾斜時跟著動（陀螺儀，家長頁可以關）。
// 光線跟著時間：早上光從左邊來、傍晚偏橘從右邊來、晚上偏藍；角色和動物的影子方向跟著轉。
// 拖曳的關卡（望遠鏡、摸兔子）用 hold() 讓鏡頭停穩。
import { state } from './store.js';
import { hour } from './clock.js';

const DEPTH = { back: 0.55, mid: 0.8, front: 1, fore: 1.35 };
// 放大一點點，鏡頭移動時邊邊不會露出來
const OVERSCAN = { back: 1.08, mid: 1.05, front: 1.03, fore: 1 };
const ORIGIN = '600px 450px';

// ---------- 陀螺儀（全遊戲共用一份） ----------
const tilt = { x: 0, y: 0, on: false, base: null, asked: false };
export const tiltEnabled = () => state.settings.tilt !== false;
function orientationAngle() {
  const a = screen.orientation?.angle ?? window.orientation ?? 0;
  return ((a % 360) + 360) % 360;
}
function onOrient(e) {
  if (e.beta == null || e.gamma == null) return;
  const a = orientationAngle();
  // 換成螢幕的左右、前後（橫拿、直拿都對）
  let lr = e.gamma;
  let fb = e.beta;
  if (a === 90) { lr = e.beta; fb = -e.gamma; }
  else if (a === 270) { lr = -e.beta; fb = e.gamma; }
  else if (a === 180) { lr = -e.gamma; fb = -e.beta; }
  // 拿 iPad 的姿勢當作「不傾斜」，而且會慢慢跟著調整（拿久了換姿勢也會回到中間）
  if (!tilt.base) tilt.base = { lr, fb };
  tilt.base.lr += (lr - tilt.base.lr) * 0.004;
  tilt.base.fb += (fb - tilt.base.fb) * 0.004;
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  tilt.x = clamp((lr - tilt.base.lr) / 22);
  tilt.y = clamp((fb - tilt.base.fb) / 22);
}
// 要在小朋友點螢幕的當下呼叫（iOS 規定）
export async function requestTilt() {
  if (tilt.asked || !tiltEnabled() || typeof DeviceOrientationEvent === 'undefined') return;
  tilt.asked = true;   // 一次開 app 只問一次，拒絕了就不再問
  tilt.on = true;
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const p = await DeviceOrientationEvent.requestPermission();
      if (p !== 'granted') { tilt.on = false; return; }
    }
  } catch { tilt.on = false; return; }
  addEventListener('deviceorientation', onOrient);
}

// ---------- 光線（跟著時間） ----------
export function lightNow(h = hour()) {
  // 太陽位置：6 點在左邊（-1），12 點在頭上（0），18 點在右邊（+1）
  const night = h < 5.5 || h >= 18.5;
  const sun = Math.max(-1, Math.min(1, (h - 12) / 6));
  const low = Math.abs(sun);
  return {
    night,
    // 影子往太陽的反方向；太陽越低影子越長
    sx: night ? 0 : -sun * 16,
    sy: night ? 4 : 6 + (1 - low) * 4,
    sa: night ? 0.12 : 0.18 + (1 - low) * 0.06,
    sun,
    warm: night ? 0 : Math.max(0, low - 0.35) / 0.65,
  };
}
function lightCss(L) {
  if (L.night) return 'radial-gradient(ellipse at 70% 10%, rgba(200,215,255,.22), rgba(40,50,110,.28) 75%)';
  const fromX = L.sun < 0 ? '0%' : '100%';
  const warmA = (0.12 + L.warm * 0.22).toFixed(2);
  const shadeA = (0.06 + Math.abs(L.sun) * 0.1).toFixed(2);
  const warmC = L.warm > 0.5 ? `rgba(255,170,90,${warmA})` : `rgba(255,236,190,${warmA})`;
  return `radial-gradient(ellipse at ${fromX} 0%, ${warmC}, rgba(255,255,255,0) 60%), linear-gradient(${L.sun < 0 ? 90 : 270}deg, rgba(255,255,255,0) 40%, rgba(40,60,110,${shadeA}))`;
}

// ---------- 攝影機 ----------
// layers：{ back: 元素, mid: [元素...], front: [元素...], foreArt: svg 字串, frontArt: svg 字串（放在 front 最底下，例如步道） }
export function setupCamera(root, { back, mid = [], front = [], frontArt = '', foreArt = '' } = {}) {
  const wrap = (cls, nodes, z) => {
    const w = document.createElement('div');
    w.className = `cam-layer ${cls}`;
    w.style.zIndex = z;
    const first = nodes.find((n) => n && n.parentNode === root);
    if (first) root.insertBefore(w, first); else root.appendChild(w);
    nodes.forEach((n) => n && w.appendChild(n));
    return w;
  };
  const midW = wrap('cam-mid', mid, 1);
  const frontW = wrap('cam-front', front, 4);
  if (frontArt) frontW.insertAdjacentHTML('afterbegin', `<div class="cam-ground">${frontArt}</div>`);
  const foreW = document.createElement('div');
  foreW.className = 'cam-layer cam-fore';
  foreW.style.zIndex = 4;
  foreW.innerHTML = foreArt;
  frontW.after(foreW);
  const light = document.createElement('div');
  light.className = 'cam-light';
  foreW.after(light);
  root.classList.add('cam');

  const layers = { back, mid: midW, front: frontW, fore: foreW };
  const cur = { x: 0, y: 0, z: 0.97 };
  const tgt = { x: 0, y: 0, z: 1.015 };
  let focus = null;        // 點到的東西：鏡頭稍微靠過去
  let pan = 0;             // 換區平移
  let held = false;
  let raf = 0;
  const t0 = performance.now();

  function applyLight() {
    const L = lightNow();
    root.style.setProperty('--sh-x', `${L.sx.toFixed(1)}px`);
    root.style.setProperty('--sh-y', `${L.sy.toFixed(1)}px`);
    root.style.setProperty('--sh-a', L.sa.toFixed(2));
    light.style.background = lightCss(L);
  }
  applyLight();
  const lightTimer = setInterval(applyLight, 60 * 1000);

  function frame(t) {
    if (!root.isConnected) { stop(); return; }
    const k = (t - t0) / 1000;
    const calm = held ? 0 : 1;
    // 像呼吸一樣輕輕動
    let x = Math.sin(k / 7 * Math.PI) * 9 * calm;
    let y = Math.sin(k / 9 * Math.PI) * 4 * calm;
    let z = tgt.z + Math.sin(k / 11 * Math.PI) * 0.006 * calm;
    if (focus && !held) { x += focus.x; y += focus.y; z += 0.012; }
    if (tilt.on && tiltEnabled() && !held) { x += tilt.x * 26; y += tilt.y * 12; }
    x += pan;
    cur.x += (x - cur.x) * 0.06;
    cur.y += (y - cur.y) * 0.06;
    cur.z += (z - cur.z) * 0.04;
    for (const [name, node] of Object.entries(layers)) {
      if (!node) continue;
      const f = DEPTH[name];
      const s = OVERSCAN[name] * (1 + (cur.z - 1) * f);
      node.style.transform = `translate3d(${(-cur.x * f).toFixed(2)}px, ${(-cur.y * f).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    }
    raf = requestAnimationFrame(frame);
  }
  for (const node of Object.values(layers)) if (node) { node.style.transformOrigin = ORIGIN; node.style.willChange = 'transform'; }
  raf = requestAnimationFrame(frame);

  function stop() {
    cancelAnimationFrame(raf);
    clearInterval(lightTimer);
  }
  let focusTimer = 0;
  return {
    // 點到某個地方（舞台座標）：鏡頭靠過去一點點，過一下回來
    look(px, py, ms = 2600) {
      focus = { x: (px - 600) * 0.05, y: (py - 450) * 0.03 };
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => { focus = null; }, ms);
    },
    // 換區：鏡頭往右滑出去，換好背景後從左邊滑回來
    async panOut() { pan = 90; await new Promise((r) => setTimeout(r, 700)); },
    panIn() { pan = -90; cur.x = -90; requestAnimationFrame(() => { pan = 0; }); },
    // 拖曳的關卡：鏡頭停穩
    hold(on) { held = on; if (on) focus = null; },
    stop,
  };
}

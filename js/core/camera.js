// 舞台攝影機（立體感升級，11/17 John 選「保留插畫、加深度和光影」；11/17 試玩後放大幅度、推到所有場景）
//
// 每個畫面（.screen）自動裝上鏡頭：
//   world：畫面裡所有東西（背景、角色、小孩、可以點的東西）包在一起，跟著鏡頭推拉平移
//   back：背景，在 world 裡面再多一點相對移動（遠的動得少），看起來有景深
//   mid：（選用）中景，例如動物園的動物
//   fore：最前景（草叢、盆栽、雲），動得最多
//   固定不動：回家、陳列櫃、時間圓餅、輪流頭像、領獎卡片等 UI（z-index 10 以上的也不動）
// 鏡頭：進場景從遠推近、平常像呼吸一樣慢慢動、點東西時往那邊靠一點、傾斜 iPad 跟著動。
// 拖曳的時候鏡頭自動回到正中間停住，放下的位置才會準（場景程式用舞台座標判斷）。
// 光線跟著時間：早上光從左邊來、傍晚偏橘從右邊來、晚上偏藍；角色、動物的影子方向跟著轉。
import { state } from './store.js';
import { hour, phase } from './clock.js';
import { outdoorFore, indoorFore } from '../art/camfore.js';
import { resumeAudio } from './audio.js';

const SRC = 'svg[viewBox="0 0 1200 900"]';
const C = { x: 600, y: 450 };
const FORE_DEPTH = 1.7;
const MID_DEPTH = 0.82;
// 不跟著鏡頭動的 UI
const FIXED = '.hud, .round-btn, .fade, .playclock, .turnbar, .bleed, .cam-light, .cam-world, .flyer, .ghost';

// 鏡頭幅度（舞台座標 px）
const AMP = {
  breathX: 20, breathY: 7, breathZ: 0.012,
  baseZ: 1.02, introZ: 0.94,
  lookX: 0.075, lookY: 0.045, lookZ: 0.035, lookMs: 2600,
  tiltX: 46, tiltY: 22,
  maxX: 62, maxY: 30,
};

// 各種畫面的設定（第一個符合的）
const PRESETS = {
  outdoor: { depth: 0.62, overscan: 1.08, fore: outdoorFore, light: 1 },
  indoor: { depth: 0.8, overscan: 1.09, fore: indoorFore, light: 0.55 },
  vehicle: { depth: 0.72, overscan: 1.09, fore: null, light: 0.6 },
  sky: { depth: 0.55, overscan: 1.08, fore: null, light: 0.6 },
  map: { depth: 0.88, overscan: 1.07, fore: null, light: 0.8 },
  house: { depth: 0.9, overscan: 1.07, fore: outdoorFore, light: 0.8 },
  stage: { depth: 0.85, overscan: 1.08, fore: null, light: 0.35 },
  // 海生館館內（11/19）：暗暗的展示缸，光線很淡
  aqua: { depth: 0.78, overscan: 1.08, fore: null, light: 0.3 },
};
const REGISTRY = [
  ['.tg, .asleep, .resting, .picker, .stamping', null],
  ['.zoo', 'outdoor'],
  ['.sea.outdoor', 'outdoor'],
  ['.sea', 'aqua'],
  ['.cable', 'sky'],
  ['.hub.map', 'map'],
  ['.hub.town', 'map'],
  ['.hub', 'house'],
  ['.opening', 'stage'],
  ['.night-sky', 'sky'],
  ['.farm, .night-farm, .park, .hike, .amuse, .snack, .cruise, .fire', 'outdoor'],
  ['.car, .transit', 'vehicle'],
  ['.scene, .xtree, .xmorning', 'indoor'],
];
function presetFor(root) {
  for (const [sel, name] of REGISTRY) if (root.matches(sel)) return name;
  return null;
}

// ---------- 陀螺儀（全遊戲共用一份） ----------
const tilt = { x: 0, y: 0, on: false, base: null, asked: false };
export const tiltEnabled = () => state.settings.tilt !== false;
export const cameraEnabled = () => state.settings.camera !== false;
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
  tilt.x = clamp((lr - tilt.base.lr) / 16);
  tilt.y = clamp((fb - tilt.base.fb) / 16);
}
// 要在小朋友點螢幕的當下呼叫（iOS 規定）
export async function requestTilt() {
  if (tilt.asked || !tiltEnabled() || typeof DeviceOrientationEvent === 'undefined') return;
  tilt.asked = true;   // 一次開 app 只問一次，拒絕了就不再問
  tilt.on = true;
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const p = await DeviceOrientationEvent.requestPermission();
      // 權限視窗關掉後，iOS 會讓聲音停住：馬上恢復
      resumeAudio();
      setTimeout(resumeAudio, 500);
      if (p !== 'granted') { tilt.on = false; return; }
    }
  } catch { resumeAudio(); tilt.on = false; return; }
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
    sx: night ? 0 : -sun * 18,
    sy: night ? 4 : 6 + (1 - low) * 4,
    sa: night ? 0.12 : 0.2 + (1 - low) * 0.06,
    sun,
    warm: night ? 0 : Math.max(0, low - 0.35) / 0.65,
  };
}
function lightCss(L, k = 1) {
  if (L.night) return `radial-gradient(ellipse at 70% 10%, rgba(200,215,255,${(0.24 * k).toFixed(2)}), rgba(40,50,110,${(0.3 * k).toFixed(2)}) 75%)`;
  const fromX = L.sun < 0 ? '0%' : '100%';
  const warmA = ((0.14 + L.warm * 0.24) * k).toFixed(2);
  const shadeA = ((0.07 + Math.abs(L.sun) * 0.12) * k).toFixed(2);
  const warmC = L.warm > 0.5 ? `rgba(255,170,90,${warmA})` : `rgba(255,236,190,${warmA})`;
  return `radial-gradient(ellipse at ${fromX} 0%, ${warmC}, rgba(255,255,255,0) 60%), linear-gradient(${L.sun < 0 ? 90 : 270}deg, rgba(255,255,255,0) 40%, rgba(40,60,110,${shadeA}))`;
}

// ---------- 攝影機 ----------
// 有鏡頭的畫面：root._cam。場景可以先呼叫 cameraFor(root, 設定) 指定中景、步道、最前景。
// 設定：{ preset, back: 節點, mid: [節點], frontArt: svg, foreArt: svg 或 ''（不要）, backDepth }
export function cameraFor(root, opts = {}) {
  if (root._cam?.alive()) return root._cam;
  root._cam?.stop();
  root._cam = null;
  if (!cameraEnabled()) return null;
  const name = opts.preset || presetFor(root);
  if (!name) return null;
  const P = PRESETS[name];
  if (root.querySelector(':scope > .cam-world')) return null;   // 已經裝過（壞掉的話不要一直重裝）
  try {
    root._cam = build(root, { ...P, ...opts, backDepth: opts.backDepth ?? P.depth });
  } catch (e) {
    console.warn('camera', e);
    root._cam = null;
  }
  return root._cam;
}
export const cameraOf = (root) => root?._cam || null;
// 鏡頭關掉時給場景用的空殼
export const NO_CAM = { look() {}, async panOut() {}, panIn() {}, hold() {}, stop() {} };

function build(root, conf) {
  const night = ['night', 'dusk'].includes(phase());
  // 背景：第一張 1200x900 的圖所在的那一層
  let back = conf.back || null;
  if (!back) {
    const svg = [...root.querySelectorAll(SRC)].find((s) => !s.closest('.bleed'));
    if (svg) { back = svg; while (back.parentElement && back.parentElement !== root) back = back.parentElement; }
    if (back?.parentElement !== root) back = null;
  }
  // 把 UI 以外的東西包進 world（保留原本順序；z-index 10 以上的蓋在上面，不包）
  const world = document.createElement('div');
  world.className = 'cam-world';
  const kids = [...root.children].filter((c) => {
    if (c.matches(FIXED)) return false;
    const z = parseInt(getComputedStyle(c).zIndex, 10);
    return !(z >= 10);
  });
  if (!kids.length) return null;
  root.insertBefore(world, kids[0]);
  kids.forEach((c) => world.appendChild(c));
  if (conf.frontArt) {
    const g = document.createElement('div');
    g.className = 'cam-ground';
    g.innerHTML = conf.frontArt;
    if (back && back.parentElement === world) back.after(g); else world.prepend(g);
  }
  let fore = null;
  const foreHtml = typeof conf.foreArt === 'string' ? conf.foreArt : conf.fore ? conf.fore(night) : '';
  if (foreHtml) {
    fore = document.createElement('div');
    fore.className = 'cam-fore';
    fore.innerHTML = foreHtml;
    world.appendChild(fore);
  }
  const light = document.createElement('div');
  light.className = 'cam-light';
  world.after(light);
  root.classList.add('cam');

  const mids = (conf.mid || []).filter(Boolean);
  const layers = [
    { node: back, f: conf.backDepth, o: conf.overscan },
    ...mids.map((node) => ({ node, f: MID_DEPTH, o: 1.03 })),
    { node: fore, f: FORE_DEPTH, o: 1 },
  ].filter((l) => l.node);
  world.style.transformOrigin = `${C.x}px ${C.y}px`;
  for (const l of layers) l.node.style.transformOrigin = `${C.x}px ${C.y}px`;

  const cur = { x: 0, y: 0, z: AMP.introZ };
  let focus = null;        // 點到的地方：鏡頭往那邊靠一點
  let pan = 0;             // 換區平移
  const holds = new Set(); // 停住鏡頭的理由（拖曳、關卡）
  let raf = 0;
  let alive = true;
  const t0 = performance.now();

  function applyLight() {
    const L = lightNow();
    root.style.setProperty('--sh-x', `${L.sx.toFixed(1)}px`);
    root.style.setProperty('--sh-y', `${L.sy.toFixed(1)}px`);
    root.style.setProperty('--sh-a', L.sa.toFixed(2));
    light.style.background = lightCss(L, conf.light ?? 1);
  }
  applyLight();
  const lightTimer = setInterval(applyLight, 60 * 1000);

  // 某一層的整體位移、縮放（以舞台中心為準）
  const total = (f, o = 1) => ({ tx: -cur.x * f, ty: -cur.y * f, s: o * (1 + (cur.z - 1) * f) });
  // 用 translate、scale 這兩個屬性（不用 transform），場景自己的 transform 動畫（例如地震搖晃）會疊加上去，不會互相蓋掉
  const put = (node, { tx, ty, s }) => {
    node.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
    node.style.scale = s.toFixed(4);
  };
  let lastKey = '';
  let bleeds = [];
  let bleedCheck = 0;

  function frame(t) {
    if (!root.isConnected || !world.isConnected) { stop(); return; }
    const k = (t - t0) / 1000;
    const still = holds.size > 0;
    let x = pan;
    let y = 0;
    let z = 1;
    if (!still) {
      x += Math.sin(k / 7 * Math.PI) * AMP.breathX;
      y += Math.sin(k / 9 * Math.PI) * AMP.breathY;
      z = AMP.baseZ + Math.sin(k / 11 * Math.PI) * AMP.breathZ;
      if (focus) { x += focus.x; y += focus.y; z += AMP.lookZ; }
      if (tilt.on && tiltEnabled()) { x += tilt.x * AMP.tiltX; y += tilt.y * AMP.tiltY; }
      x = Math.max(-AMP.maxX, Math.min(AMP.maxX, x - pan)) + pan;
      y = Math.max(-AMP.maxY, Math.min(AMP.maxY, y));
    }
    const r = still ? 0.2 : 0.055;
    cur.x += (x - cur.x) * r;
    cur.y += (y - cur.y) * r;
    cur.z += (z - cur.z) * (still ? 0.2 : 0.04);
    // 停住的時候完全回到原位（拖曳放下的位置才準）
    if (still && Math.abs(cur.x - x) < 0.3 && Math.abs(cur.y) < 0.3 && Math.abs(cur.z - 1) < 0.0005) { cur.x = x; cur.y = 0; cur.z = 1; }
    const key = `${cur.x.toFixed(2)},${cur.y.toFixed(2)},${cur.z.toFixed(4)}`;
    if (key !== lastKey) {
      lastKey = key;
      const W = total(1);
      put(world, W);
      for (const l of layers) {
        const L = total(l.f, l.o);
        // world 裡面的相對移動
        put(l.node, { tx: (L.tx - W.tx) / W.s, ty: (L.ty - W.ty) / W.s, s: L.s / W.s });
      }
      // 背景往左右延伸的那兩條跟背景一起動
      if (back) {
        if (!bleedCheck--) { bleeds = [...root.querySelectorAll(':scope > .bleed')]; bleedCheck = 30; }
        const B = total(conf.backDepth, conf.overscan);
        for (const b of bleeds) {
          b.style.transformOrigin = `${C.x - b.offsetLeft}px ${C.y}px`;
          put(b, B);
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // 拖曳時停住、點一下時鏡頭往那邊靠
  let down = null;
  const stageXY = (e) => {
    const r = root.getBoundingClientRect();
    const s = r.width / 1200;
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };
  const onDown = (e) => { down = { x: e.clientX, y: e.clientY, drag: false, inWorld: world.contains(e.target) }; };
  const onMove = (e) => {
    if (!down || down.drag) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) { down.drag = true; holds.add('drag'); }
  };
  let dragTimer = 0;
  const onUp = (e) => {
    if (!down) return;
    if (down.drag) {
      clearTimeout(dragTimer);
      dragTimer = setTimeout(() => holds.delete('drag'), 600);
    } else if (down.inWorld && conf.lookOnTap !== false) {
      const p = stageXY(e);
      api.look(p.x, p.y);
    }
    down = null;
  };
  root.addEventListener('pointerdown', onDown, true);
  addEventListener('pointermove', onMove, true);
  addEventListener('pointerup', onUp, true);
  addEventListener('pointercancel', onUp, true);

  function stop() {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    clearInterval(lightTimer);
    clearTimeout(dragTimer);
    root.removeEventListener('pointerdown', onDown, true);
    removeEventListener('pointermove', onMove, true);
    removeEventListener('pointerup', onUp, true);
    removeEventListener('pointercancel', onUp, true);
  }
  let focusTimer = 0;
  const api = {
    world,
    alive: () => alive && root.isConnected && world.isConnected,
    // 點到某個地方（舞台座標）：鏡頭往那邊靠一點，過一下回來
    look(px, py, ms = AMP.lookMs) {
      focus = { x: (px - C.x) * AMP.lookX, y: (py - C.y) * AMP.lookY };
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => { focus = null; }, ms);
    },
    // 換區：鏡頭往右滑出去，換好背景後從左邊滑回來
    async panOut() { pan = 110; await new Promise((r) => setTimeout(r, 700)); },
    panIn() { pan = -110; cur.x = -110; requestAnimationFrame(() => { pan = 0; }); },
    // 需要精準操作的關卡：鏡頭回到正中間停穩
    hold(on, why = 'scene') { if (on) { holds.add(why); focus = null; } else holds.delete(why); },
    stop,
  };
  return api;
}

// 舞台上換畫面時自動裝鏡頭（main.js 呼叫一次）
export function setupStageCamera(stage) {
  let t = 0;
  const run = () => {
    t = 0;
    for (const scr of stage.querySelectorAll(':scope > .screen')) {
      if (scr._cam?.alive()) continue;
      if (scr._camTried === scr.childElementCount) continue;
      scr._camTried = scr.childElementCount;
      cameraFor(scr);
    }
  };
  const mo = new MutationObserver(() => { if (!t) t = setTimeout(run, 0); });
  mo.observe(stage, { childList: true, subtree: true });
  run();
}

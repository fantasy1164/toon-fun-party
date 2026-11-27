// 手寫評分（11/27 注音課）：只用來「說出寫得好的地方＋一個小建議」，不打分數給小孩看。
// 座標都是一格 0–100（y 往下）。model＝標準筆畫（data/zhuyin.js 的 STROKES），user＝小孩寫的。
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function strokeLen(p) { let s = 0; for (let i = 1; i < p.length; i += 1) s += dist(p[i - 1], p[i]); return s; }

// 沿著筆畫等距取 n 個點
export function resample(p, n = 24) {
  if (p.length === 1) return Array(n).fill(p[0]);
  const L = strokeLen(p);
  if (!L) return Array(n).fill(p[0]);
  const out = [p[0]];
  const step = L / (n - 1);
  let acc = 0;
  let prev = p[0];
  for (let i = 1; i < p.length && out.length < n; i += 1) {
    let cur = p[i];
    let d = dist(prev, cur);
    while (acc + d >= step && out.length < n) {
      const t = (step - acc) / d;
      const q = [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
      out.push(q);
      prev = q;
      d = dist(prev, cur);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  while (out.length < n) out.push(p[p.length - 1]);
  return out;
}
const meanDist = (a, b) => { const A = resample(a); const B = resample(b); let s = 0; for (let i = 0; i < A.length; i += 1) s += dist(A[i], B[i]); return s / A.length; };

function bbox(strokes) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  for (const s of strokes) for (const [x, y] of s) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// 太短的（不小心點到）不算一筆
export const cleanStrokes = (user) => user.filter((s) => s.length > 1 && strokeLen(s) >= 4);

// 描紅：這一筆有沒有照著寫（起點在附近、形狀差不多、方向對）
export function traceOk(user, model) {
  if (strokeLen(user) < 4) return false;
  const near = dist(user[0], model[0]);
  const far = dist(user[0], model[model.length - 1]);
  const ml = strokeLen(model);
  if (ml > 14 && far + 6 < near) return false;          // 寫反了
  return near <= 22 && meanDist(user, model) <= 14;
}

// 自己寫一個：回傳各項結果＋分數（比較第一次、第二次有沒有進步用）
export function evaluate(userRaw, model) {
  const user = cleanStrokes(userRaw);
  const r = { count: user.length, need: model.length, less: false, more: false, order: true, dir: true, shape: 0, grid: true, size: 'ok', center: true, straight: null, score: 0 };
  if (!user.length) { r.less = true; r.score = 0; return r; }
  r.less = user.length < model.length;
  r.more = user.length > model.length;
  const bu = bbox(user);
  const bm = bbox(model);
  // 位置與大小（用原本的座標）
  r.grid = user.every((s) => s.every(([x, y]) => x >= 1 && x <= 99 && y >= 1 && y <= 99));
  const su = Math.max(bu.w, bu.h);
  const sm = Math.max(bm.w, bm.h);
  const ratio = su / sm;
  r.size = ratio < 0.62 ? 'small' : ratio > 1.28 ? 'big' : 'ok';
  r.center = Math.hypot(bu.cx - bm.cx, bu.cy - bm.cy) <= 15;
  // 形狀與筆順：先把小孩的字縮放到跟標準一樣大、一樣位置，再一筆一筆比
  const k = su > 0 ? sm / su : 1;
  const norm = user.map((s) => s.map(([x, y]) => [bm.cx + (x - bu.cx) * k, bm.cy + (y - bu.cy) * k]));
  const n = Math.min(norm.length, model.length);
  let shapeSum = 0;
  for (let j = 0; j < n; j += 1) {
    shapeSum += meanDist(norm[j], model[j]);
    // 這一筆最像標準的第幾筆？不是第 j 筆就是筆順不對
    let best = j; let bestD = Infinity;
    for (let i = 0; i < model.length; i += 1) {
      const d = Math.min(meanDist(norm[j], model[i]), meanDist([...norm[j]].reverse(), model[i]));
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best !== j && meanDist(norm[j], model[j]) > bestD + 4) r.order = false;
    // 方向：從另一頭開始寫
    const ml = strokeLen(model[j]);
    if (ml > 14) {
      const fwd = meanDist(norm[j], model[j]);
      const rev = meanDist([...norm[j]].reverse(), model[j]);
      if (rev + 5 < fwd) r.dir = false;
    }
  }
  r.shape = n ? shapeSum / n : 99;
  // 直線：標準是一條直線（兩個點）的筆畫，看小孩寫得直不直
  const lines = [];
  for (let j = 0; j < n; j += 1) {
    const m = model[j];
    if (m.length === 2 && strokeLen(m) > 25) {
      const s = norm[j];
      const a = s[0]; const b = s[s.length - 1];
      const L = dist(a, b) || 1;
      let dev = 0;
      for (const p of s) {
        const d = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
        dev = Math.max(dev, d);
      }
      lines.push(dev / L);
    }
  }
  if (lines.length) r.straight = lines.every((v) => v < 0.12);
  // 分數（只拿來比較兩次）
  let sc = 100;
  if (r.less || r.more) sc -= 30;
  if (!r.order) sc -= 25;
  if (!r.dir) sc -= 10;
  sc -= Math.max(0, Math.min(30, (r.shape - 6) * 3));
  if (!r.grid) sc -= 10;
  if (r.size !== 'ok') sc -= 10;
  if (!r.center) sc -= 10;
  if (r.straight === false) sc -= 8;
  r.score = Math.max(0, Math.round(sc));
  r.neat = !r.less && !r.more && r.order && r.dir && r.shape <= 11 && r.grid && r.size === 'ok' && r.center && r.straight !== false;
  return r;
}

// 稱讚：做到的裡面挑一個（輪流，不要每次都一樣）
export function praiseOf(r, salt = 0) {
  const good = [];
  if (!r.less && !r.more && r.order && r.dir) good.push('zyp_order');
  if (r.grid && r.center) good.push('zyp_grid');
  if (r.size === 'ok') good.push('zyp_size');
  if (r.straight) good.push('zyp_straight');
  if (r.shape <= 9 && !r.less && !r.more) good.push('zyp_shape');
  if (!good.length) return 'zyp_try';
  return good[salt % good.length];
}
// 建議：只說一個，最重要的先說
export function tipOf(r) {
  if (r.less) return 'zyt_less';
  if (r.more) return 'zyt_more';
  if (!r.order) return 'zyt_order';
  if (!r.dir) return 'zyt_dir';
  if (!r.grid) return 'zyt_grid';
  if (r.size === 'small') return 'zyt_small';
  if (r.size === 'big') return 'zyt_big';
  if (r.shape > 11) return 'zyt_shape';
  if (!r.center) return 'zyt_center';
  if (r.straight === false) return 'zyt_straight';
  return null;
}

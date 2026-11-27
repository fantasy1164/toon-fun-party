// 習字本（11/27 注音課）：一格或兩格（結合韻直直排）。手指、Apple Pencil 都可以寫。
// 用法：const pad = makePad(root, { syms: ['ㄧ','ㄚ'], left, top, size, cleanups })
//   await pad.demo()  老師示範（紅色一筆一筆寫，出現筆順數字）
//   await pad.trace({ onRetry, onHelp })  描紅：一筆一筆照著寫，從綠色圓點開始
//   const cells = await pad.free({ onIdle })  自己寫（寫完筆數停一下自動完成，或按勾勾）
// 放在場景 root 的最上層（z-index 12），鏡頭不會帶著它動，寫字的位置才準。
import { el, wait, onTap } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { STROKES } from '../data/zhuyin.js';
import { cellSvg, strokePath } from '../art/zhuyin.js';
import { traceOk, strokeLen } from '../core/handwrite.js';

const NS = 'http://www.w3.org/2000/svg';
const INK = '#2b3a67';
const RED = '#d9534f';
const GHOST = '#f4b9b0';

export function makePad(root, { syms, left, top, size, cleanups = [], onPen = null }) {
  const n = syms.length;
  const node = el(`<div class="wpad" style="left:${left}px;top:${top}px;width:${size}px;height:${size * n}px">
    <svg viewBox="0 0 100 ${n * 100}" width="${size}" height="${size * n}">
      <g class="wp-cells">${syms.map((_, i) => cellSvg(i * 100)).join('')}</g>
      <g class="wp-ghost"></g><g class="wp-guide"></g><g class="wp-ink"></g><g class="wp-live"></g>
    </svg>
    <button class="wp-btn wp-ok" aria-label="寫好了"><svg viewBox="0 0 100 100" width="84" height="84"><circle cx="50" cy="50" r="46" fill="#5bc06b"/><path d="M28 52L44 68L74 34" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button class="wp-btn wp-erase" aria-label="擦掉"><svg viewBox="0 0 100 100" width="70" height="70"><circle cx="50" cy="50" r="46" fill="#ffe08a"/><rect x="26" y="40" width="48" height="26" rx="6" transform="rotate(-30 50 53)" fill="#ff9aa8"/><rect x="26" y="40" width="20" height="26" rx="6" transform="rotate(-30 50 53)" fill="#7fc4ff"/></svg></button>
  </div>`);
  root.appendChild(node);
  const svg = node.querySelector('svg');
  const gGhost = svg.querySelector('.wp-ghost');
  const gGuide = svg.querySelector('.wp-guide');
  const gInk = svg.querySelector('.wp-ink');
  const gLive = svg.querySelector('.wp-live');
  const okBtn = node.querySelector('.wp-ok');
  const eraseBtn = node.querySelector('.wp-erase');
  okBtn.classList.add('hidden');
  eraseBtn.classList.add('hidden');
  const models = syms.map((s) => STROKES[s]);
  window.__padSyms = syms;   // 測試用
  let penSeen = false;
  let alive = true;
  cleanups.push(() => { alive = false; });

  const path = (d, color, w, extra = '') => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', w);
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    if (extra) p.setAttribute('class', extra);
    return p;
  };
  // 筆順數字的位置：起點左上；跟前面某一筆的起點太近（ㄈ、ㄏ、ㄕ 起筆相接）就往下挪
  function labelAt(c, i) {
    const [x, y] = models[c][i][0];
    let dy = 0;
    for (let j = 0; j < i; j += 1) {
      const [px, py] = models[c][j][0];
      if (Math.hypot(px - x, py - y) < 9) dy += 11;
    }
    return [x - 10, c * 100 + y - 5 + dy];
  }
  function ghost(show = true) {
    gGhost.innerHTML = '';
    if (!show) return;
    models.forEach((m, c) => m.forEach((s) => gGhost.appendChild(path(strokePath(s, 0, c * 100), GHOST, 12))));
  }
  // 筆順數字＋起點綠點
  function guide(c, i) {
    gGuide.innerHTML = '';
    if (c < 0) return;
    const s = models[c][i];
    const [x, y] = s[0];
    const [x2, y2] = s[Math.min(1, s.length - 1)];
    const a = Math.atan2(y2 - y, x2 - x);
    const ax = x + Math.cos(a) * 13; const ay = c * 100 + y + Math.sin(a) * 13;
    gGuide.innerHTML = `<circle class="wp-start" cx="${x}" cy="${c * 100 + y}" r="5.5" fill="#3cc35a"/>
      <path d="M${x + Math.cos(a) * 7} ${c * 100 + y + Math.sin(a) * 7}L${ax} ${ay}" stroke="#3cc35a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${ax} ${ay}l${Math.cos(a + 2.5) * 5} ${Math.sin(a + 2.5) * 5}M${ax} ${ay}l${Math.cos(a - 2.5) * 5} ${Math.sin(a - 2.5) * 5}" stroke="#3cc35a" stroke-width="2.6" stroke-linecap="round"/>
      <text x="${labelAt(c, i)[0]}" y="${labelAt(c, i)[1]}" font-size="11" font-weight="700" fill="#3cc35a">${i + 1}</text>`;
  }

  // 畫一筆的動畫（紅色）
  async function animStroke(c, s, color = RED, w = 9) {
    const p = path(strokePath(s, 0, c * 100), color, w);
    p.setAttribute('pathLength', '100');
    p.style.strokeDasharray = '100';
    p.style.strokeDashoffset = '100';
    gInk.appendChild(p);
    const ms = 380 + strokeLen(s) * 9;
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${ms}ms linear`;
    p.style.strokeDashoffset = '0';
    sfx('brush');
    await wait(ms + 160);
    return p;
  }

  // ---------- 老師示範 ----------
  async function demo() {
    gInk.innerHTML = '';
    for (let c = 0; c < n; c += 1) {
      for (let i = 0; i < models[c].length; i += 1) {
        if (!alive) return;
        const [lx, ly] = labelAt(c, i);
        const num = document.createElementNS(NS, 'text');
        num.setAttribute('x', lx); num.setAttribute('y', ly);
        num.setAttribute('font-size', '11'); num.setAttribute('font-weight', '700'); num.setAttribute('fill', RED);
        num.textContent = i + 1;
        gInk.appendChild(num);
        await animStroke(c, models[c][i]);
      }
    }
    await wait(500);
    gInk.innerHTML = '';
  }

  // ---------- 收筆畫 ----------
  let onStroke = null;   // (cellIndex, points) => void
  let drawing = null;
  const toLocal = (e) => {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [pt.x, pt.y];
  };
  svg.addEventListener('pointerdown', (e) => {
    if (!onStroke || drawing) return;
    if (e.pointerType === 'pen') {
      if (!penSeen) { penSeen = true; onPen?.(); }
    } else if (penSeen && e.pointerType === 'touch') return;   // 用筆的時候手掌碰到螢幕不算
    e.preventDefault();
    svg.setPointerCapture?.(e.pointerId);
    const p = toLocal(e);
    drawing = { id: e.pointerId, pts: [p], el: path(`M${p[0]} ${p[1]}`, INK, 7.5) };
    gLive.appendChild(drawing.el);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drawing || e.pointerId !== drawing.id) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) {
      const p = toLocal(ev);
      const last = drawing.pts[drawing.pts.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.8) drawing.pts.push(p);
    }
    drawing.el.setAttribute('d', drawing.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''));
  });
  const up = (e) => {
    if (!drawing || e.pointerId !== drawing.id) return;
    const d = drawing;
    drawing = null;
    if (d.pts.length === 1) d.pts.push([d.pts[0][0] + 0.5, d.pts[0][1] + 0.5]);
    d.el.remove();
    const c = Math.max(0, Math.min(n - 1, Math.floor(d.pts[0][1] / 100)));
    onStroke?.(c, d.pts, d);
  };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);

  const inkPath = (pts) => path(pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''), INK, 7.5);
  const local = (c, pts) => pts.map(([x, y]) => [x, y - c * 100]);

  // ---------- 描紅 ----------
  async function trace({ onRetry, onHelp } = {}) {
    gInk.innerHTML = '';
    ghost(true);
    for (let c = 0; c < n; c += 1) {
      for (let i = 0; i < models[c].length; i += 1) {
        if (!alive) return;
        guide(c, i);
        Object.assign(node.dataset, { mode: 'trace', c, i });   // 測試用：現在描哪一格第幾筆
        let fails = 0;
        await new Promise((resolve) => {
          cleanups.push(resolve);
          const check = async (_cell, pts) => {
            const mine = local(c, pts);
            if (traceOk(mine, models[c][i])) {
              gInk.appendChild(inkPath(pts));
              sfx('pop');
              onStroke = null;
              resolve();
              return;
            }
            // 沒照著寫：淡掉，再試一次；兩次還不行老師帶著寫
            const p = inkPath(pts);
            p.classList.add('wp-fade');
            gInk.appendChild(p);
            setTimeout(() => p.remove(), 700);
            fails += 1;
            onStroke = null;
            if (fails >= 2) {
              await onHelp?.();
              gGuide.innerHTML = '';
              const a = await animStroke(c, models[c][i], INK, 7.5);
              a.style.transition = '';
              resolve();
            } else {
              await onRetry?.();
              if (!alive) { resolve(); return; }
              guide(c, i);
              onStroke = check;
            }
          };
          onStroke = check;
        });
      }
    }
    onStroke = null;
    guide(-1);
    node.dataset.mode = '';
    await wait(400);
  }

  // ---------- 自己寫 ----------
  let cur = null;   // 正在自己寫的這一次
  const total = () => (cur ? cur.strokes.reduce((s, x) => s + x.filter((p) => strokeLen(p) >= 4).length, 0) : 0);
  svg.addEventListener('pointerdown', () => { if (cur) clearTimeout(cur.timer); });
  onTap(okBtn, () => { if (cur && total()) { sfx('tap'); cur.finish(); } });
  onTap(eraseBtn, () => {
    if (!cur) return;
    clearTimeout(cur.timer);
    cur.strokes.forEach((x) => { x.length = 0; });
    gInk.innerHTML = '';
    okBtn.classList.remove('glow');
    sfx('rub');
  });
  function free({ idleMs = 1500 } = {}) {
    gInk.innerHTML = '';
    gGuide.innerHTML = '';
    ghost(false);
    const need = models.reduce((sum, m) => sum + m.length, 0);
    okBtn.classList.remove('hidden');
    eraseBtn.classList.remove('hidden');
    node.dataset.mode = 'free';
    return new Promise((resolve) => {
      const me = { strokes: syms.map(() => []), timer: 0 };
      me.finish = () => {
        if (cur !== me) return;
        clearTimeout(me.timer);
        cur = null;
        onStroke = null;
        node.dataset.mode = '';
        okBtn.classList.add('hidden');
        eraseBtn.classList.add('hidden');
        okBtn.classList.remove('glow');
        resolve(me.strokes);
      };
      cur = me;
      cleanups.push(me.finish);
      onStroke = (c, pts) => {
        me.strokes[c].push(local(c, pts));
        gInk.appendChild(inkPath(pts));
        clearTimeout(me.timer);
        if (total() >= need) {
          okBtn.classList.add('glow');
          me.timer = setTimeout(me.finish, idleMs);
        }
      };
    });
  }

  return {
    node,
    demo,
    trace,
    free,
    ghost,
    // 評語時把老師的字淡淡疊在後面比一比
    compare(on) { ghost(on); gGhost.style.opacity = on ? '0.55' : ''; },
    destroy() { alive = false; node.remove(); },
  };
}

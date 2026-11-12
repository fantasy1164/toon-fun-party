// 小工具：DOM、等待、亂數。
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 觸控友善的點擊：pointerdown 立即反應，避免 300ms 延遲與誤判拖曳。
export function onTap(node, fn) {
  node.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    fn(e);
  });
}

// 在畫面座標噴出粒子（泡泡、星星）。
export function burst(x, y, { n = 8, kind = 'bubble', spread = 90 } = {}) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = `particle ${kind}`;
    const size = rand(10, 30);
    p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;` +
      `--dx:${rand(-spread, spread)}px;--dy:${rand(-spread * 1.3, spread * 0.3)}px;` +
      `animation-duration:${rand(0.6, 1.2)}s`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

export function centerOf(node) {
  const r = node.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

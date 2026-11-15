// 滿版：舞台內容固定 1200x900（可以點的東西都在這個範圍），比 4:3 寬的螢幕左右多出來的地方，
// 把每個畫面背景最左、最右邊的一條拉寬填滿，看起來像背景延伸過去。
// 背景換掉（天氣、白天晚上）會自動重做。--bleed 是左右各多出來多少（舞台座標）。
const SRC = 'svg[viewBox="0 0 1200 900"]';
const STRIP = 6;

function strip(src, side) {
  const vb = side === 'l' ? `0 0 ${STRIP} 900` : `${1200 - STRIP} 0 ${STRIP} 900`;
  return `<svg viewBox="${vb}" preserveAspectRatio="none" width="100%" height="100%">${src.innerHTML}</svg>`;
}

function refresh(stage) {
  for (const scr of stage.querySelectorAll(':scope > .screen, :scope > .screen .screen')) {
    const src = [...scr.querySelectorAll(SRC)].find((s) => !s.closest('.bleed'));
    if (!src) {
      scr.querySelectorAll(':scope > .bleed').forEach((b) => b.remove());
      scr._bleedSrc = null;
      continue;
    }
    if (scr._bleedSrc === src && scr._bleedHtml === src.innerHTML.length) continue;
    scr._bleedSrc = src;
    scr._bleedHtml = src.innerHTML.length;
    scr.querySelectorAll(':scope > .bleed').forEach((b) => b.remove());
    const l = document.createElement('div');
    l.className = 'bleed l';
    l.innerHTML = strip(src, 'l');
    const r = document.createElement('div');
    r.className = 'bleed r';
    r.innerHTML = strip(src, 'r');
    scr.prepend(l, r);
  }
}

export function setupBleed(stage) {
  let t = 0;
  const run = () => { t = 0; refresh(stage); };
  const mo = new MutationObserver((list) => {
    if (list.every((m) => m.target.closest?.('.bleed'))) return;
    if (!t) t = setTimeout(run, 60);
  });
  mo.observe(stage, { childList: true, subtree: true });
  run();
}

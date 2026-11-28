// 家長頁「注音」分頁（11/27）：妍卉寫過哪些、哪些寫得端正、還不熟的；作品牆（每天最端正的手寫字）；
// 筆順總覽（點一個符號看筆順動畫，跟學校的習作對對看）；給家長的坐姿、握筆提醒。
import { state, save } from '../core/store.js';
import { dateKey } from '../core/clock.js';
import { zyState, nextGroup } from '../scenes/zhuyin.js';
import { SYMS, STROKES, JIEHE, JIEHE_BY } from '../data/zhuyin.js';
import { glyph, workSvg, strokePath, cellSvg } from '../art/zhuyin.js';

export function zhuyinBadge() {
  const z = state.profiles.yh?.zhuyin;
  return z?.learned?.length ? `<b class="bd soft">${z.learned.length}/22</b>` : '';
}

const cls = (c) => (!c ? '' : c.neat >= 2 ? 'st' : c.neat ? 'lt' : 'wk');
const symCell = (s, z) => `<button class="zg-cell ${cls(z.syms[s])}" data-act="zy-show" data-s="${s}"><svg viewBox="0 0 100 100" width="40" height="40">${glyph(s, { w: 10 })}</svg></button>`;

export function zhuyinSection() {
  const z = zyState();
  const g = nextGroup(z);
  const today = z.lessonDay === dateKey();
  const syms = SYMS.map((s) => symCell(s, z)).join('');
  const jh = JIEHE.map((j) => `<span class="zg-j ${z.learned.includes(j.id) ? cls(z.jh[j.id]) || 'lt' : ''}"><svg viewBox="22 0 56 100" width="30" height="54">${glyph(j.s[0], { ox: 26, oy: 3, size: 48, w: 10 })}${glyph(j.s[1], { ox: 26, oy: 50, size: 48, w: 10 })}</svg></span>`).join('');
  const weakS = SYMS.filter((s) => z.syms[s] && !z.syms[s].neat);
  const weakJ = z.learned.filter((id) => !(z.jh[id]?.neat));
  const works = (z.works || []).slice(0, 12).map((w) => `<figure class="zg-work">${workSvg(w.c, 92)}<figcaption>${w.d.slice(5).replace('-', '/')}</figcaption></figure>`).join('');
  return `
    <h2>妍卉的注音</h2>
    <p>寫過的符號：${z.symIdx}/37${z.symIdx < 37 ? `（下一次：${SYMS.slice(z.symIdx, z.symIdx + 2).join('、')}）` : '，全部寫過了'}；結合韻：${z.learned.length}/22${g ? `（下一課：${g.map((id) => JIEHE_BY[id].s.join('')).join('、')}${today ? '，明天' : '，下次進學堂'}）` : '，全部學完了'}</p>
    <div class="zg-syms">${syms}</div>
    <div class="zg-jh">${jh}</div>
    <p class="note"><span class="tg-k lt"></span>寫得端正過　<span class="tg-k st"></span>兩次以上端正　<span class="tg-k wk"></span>寫過但還不夠端正　（點一個符號看筆順）</p>
    <div class="zg-show hidden"></div>
    <h2>作品牆</h2>
    ${works ? `<div class="zg-works">${works}</div>` : '<p class="note">還沒有作品。每天最端正的字會貼在這裡，可以看看有沒有進步。</p>'}
    <h2>還不夠端正的</h2>
    <p>${weakS.length || weakJ.length ? [...weakS, ...weakJ.map((id) => JIEHE_BY[id].s.join(''))].join('、') : '目前沒有。'}</p>
    <p class="note">遊戲裡只說寫得好的地方和一個小建議，最多再寫一次，不打分數。在家用紙筆寫的時候也一樣：先稱讚一個寫得好的地方，再提醒一件事就好。<br>
      坐姿：頭正、身直、腳平放；眼睛離紙一尺、胸口離桌子一個拳頭、手指離筆尖一寸。握筆：大拇指和食指捏住、中指在下面托著，不要握太緊。<br>
      「ㄧ」寫成橫的一筆（由左往右），直式結合韻裡也是橫的。筆順照教育部《國語注音符號手冊》，ㄓ、ㄖ 用四畫的寫法；跟學校教的不一樣請告訴 Claude。</p>
    ${g && today ? '<button class="quiet" data-act="zy-more">今天可以再上一課</button>' : ''}
    <button class="quiet small" data-act="zy-reset">重新開始（清除注音進度）</button> <span class="note zy-msg"></span>`;
}

// 筆順動畫
function showStrokes(node, s) {
  const box = node.querySelector('.zg-show');
  box.classList.remove('hidden');
  const strokes = STROKES[s];
  box.innerHTML = `<svg viewBox="0 0 100 100" width="220" height="220">${cellSvg(0)}
    ${strokes.map((st) => `<path d="${strokePath(st)}" fill="none" stroke="#f4b9b0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${strokes.map((st, i) => `<path class="zg-anim" style="animation-delay:${i * 0.9}s" pathLength="100" d="${strokePath(st)}" fill="none" stroke="#d9534f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${strokes.map((st, i) => { const dy = strokes.slice(0, i).filter((p) => Math.hypot(p[0][0] - st[0][0], p[0][1] - st[0][1]) < 9).length * 11; return `<text x="${st[0][0] - 10}" y="${st[0][1] - 5 + dy}" font-size="11" font-weight="700" fill="#2b8a3e">${i + 1}</text>`; }).join('')}
  </svg><span class="note">${strokes.length} 畫</span>`;
}

export function zhuyinClick(act, e, node) {
  if (act === 'zy-show') { showStrokes(node, e.target.closest('[data-s]').dataset.s); return true; }
  if (act === 'zy-more') {
    zyState().lessonDay = null;
    save();
    e.target.remove();
    node.querySelector('.zy-msg').textContent = '好了，下次進學堂會上下一課。';
    return true;
  }
  if (act === 'zy-reset') {
    if (e.target.dataset.sure !== '1') {
      e.target.dataset.sure = '1';
      e.target.textContent = '再按一次確定清除';
      return true;
    }
    state.profiles.yh.zhuyin = null;
    zyState();
    save();
    node.querySelector('[data-pane="zhuyin"]').innerHTML = zhuyinSection();
    return true;
  }
  return false;
}

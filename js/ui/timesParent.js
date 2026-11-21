// 家長頁「乘法」分頁（11/21，John：家長也有義務自己教，不能都透過遊戲）
// 妍卉的九九乘法表：哪些學過、哪些熟了、哪些常錯；常錯的附一句生活中可以問的題目。
import { state, save } from '../core/store.js';
import { dateKey } from '../core/clock.js';
import { timesState, litCells, strongCells, nextLesson, TIMES_ORDER } from '../scenes/times.js';

// 每個數字的生活例子（跟遊戲裡一樣），用來出生活題
const ASK = {
  2: (b) => `${b} 雙鞋子，總共有幾隻？`,
  5: (b) => `${b} 隻手，總共有幾根手指？`,
  4: (b) => `${b} 張椅子，總共有幾隻腳？`,
  8: (b) => `${b} 隻章魚，總共有幾隻腳？`,
  3: (b) => `${b} 台三輪車，總共有幾個輪子？`,
  6: (b) => `${b} 隻瓢蟲，總共有幾隻腳？`,
  7: (b) => `${b} 個星期，總共有幾天？`,
  9: (b) => `${b} 盒巧克力（一盒 9 顆），總共有幾顆？`,
};

export function timesBadge() {
  const t = state.profiles.yh?.times;
  return t?.learned?.length ? `<b class="bd soft">${t.learned.length}/8</b>` : '';
}

export function timesSection() {
  const t = timesState();
  const lit = litCells(t);
  const strong = strongCells(t);
  const n = nextLesson(t);
  const today = t.lessonDay === dateKey();
  let grid = '<table class="tgrid"><tr><th></th>';
  for (let b = 1; b <= 9; b += 1) grid += `<th>${b}</th>`;
  grid += '</tr>';
  for (let a = 1; a <= 9; a += 1) {
    grid += `<tr><th>${a}</th>`;
    for (let b = 1; b <= 9; b += 1) {
      const k = `${a}x${b}`;
      const c = t.cells[k] || t.cells[`${b}x${a}`];
      const weak = c && !c.lastOk;
      const cls = strong.has(k) ? 'st' : lit.has(k) ? (weak ? 'wk' : 'lt') : '';
      grid += `<td class="${cls}">${lit.has(k) ? a * b : ''}</td>`;
    }
    grid += '</tr>';
  }
  grid += '</table>';
  // 常錯的：最後一次答錯，或錯兩次以上
  const weak = Object.entries(t.cells)
    .filter(([, c]) => !c.lastOk || c.miss >= 2)
    .sort((x, y) => (y[1].miss - x[1].miss))
    .slice(0, 8)
    .map(([k, c]) => {
      const [a, b] = k.split('x').map(Number);
      return `<li><b>${a} × ${b} = ${a * b}</b>（錯 ${c.miss} 次${c.lastOk ? '' : '，上次答錯'}）${ASK[a] ? `：生活中問問看「${ASK[a](b)}」` : ''}</li>`;
    }).join('');
  const done = TIMES_ORDER.filter((x) => t.learned.includes(x));
  return `
    <h2>妍卉的九九乘法</h2>
    <p>學過：${done.length ? done.map((x) => `${x} 的乘法`).join('、') : '還沒開始'}${n ? `；下一課：<b>${n} 的乘法</b>${today ? '（明天）' : '（下次進學堂）'}` : '；全部學完了'}</p>
    ${grid}
    <p class="note"><span class="tg-k lt"></span>學過（翻過來的也算）　<span class="tg-k st"></span>熟了（兩天以上答對）　<span class="tg-k wk"></span>上次答錯</p>
    <h2>常錯的</h2>
    ${weak ? `<ul class="tweak">${weak}</ul>` : '<p class="note">目前沒有。</p>'}
    <p class="note">遊戲一天一課、每次先複習 5 題；不計時、答錯會帶著一排一排跳著數。乘法最好在生活中用：吃飯數筷子、出門數輪子，每天順口問一題就好。順序照學校：2、5、4、8、3、6、9、7。</p>
    ${n && today ? '<button class="quiet" data-act="times-more">今天可以再上一課</button>' : ''}
    <button class="quiet small" data-act="times-reset">重新開始（清除乘法進度）</button> <span class="note times-msg"></span>`;
}

// 處理按鈕，回傳 true 表示是乘法分頁的按鈕
export function timesClick(act, e, node) {
  if (act === 'times-more') {
    timesState().lessonDay = null;
    save();
    e.target.remove();
    node.querySelector('.times-msg').textContent = '好了，下次進學堂會上下一課。';
    return true;
  }
  if (act === 'times-reset') {
    if (e.target.dataset.sure !== '1') {
      e.target.dataset.sure = '1';
      e.target.textContent = '再按一次確定清除';
      return true;
    }
    state.profiles.yh.times = { learned: [], lessonDay: null, cells: {} };
    save();
    node.querySelector('[data-pane="times"]').innerHTML = timesSection();
    return true;
  }
  return false;
}

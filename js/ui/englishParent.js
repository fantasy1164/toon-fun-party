// 家長頁「英文複習」：勾選兩個人今天要聽的課（會一直保留到改掉）
import { state, save } from '../core/store.js';
import { now } from '../core/clock.js';
import { EN_FIRST } from '../config.js';
import { ROCKET, YT_LIST, YT_COUNT } from '../data/english.js';
import { loadYT, noReferrer } from '../scenes/english.js';

const NAMES = { yh: '妍卉', xz: '向澤' };
const DAYS = '日一二三四五六';
const picked = (id) => new Set(state.settings.english?.[id] || []);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 播過的影片會記住標題（english.js 的 learnTitle）
const titleOf = (i) => { const id = state.settings.enYtIds?.[i]; return (id && state.settings.enYtTitles?.[id]) || ''; };

function groups() {
  const out = [];
  for (const t of ROCKET) {
    const key = `${t.disk}-${t.ver}`;
    let g = out.find((x) => x.key === key);
    if (!g) { g = { key, title: `Disk ${t.disk}（${t.ver}）`, list: [] }; out.push(g); }
    g.list.push(t);
  }
  return out;
}

export function englishSection() {
  const first = EN_FIRST[now().getDay()];
  const xz = picked('xz');
  const yh = picked('yh');
  const ids = state.settings.enYtIds || [];
  const thumb = (i) => (ids[i] ? `<img loading="lazy" src="https://i.ytimg.com/vi/${ids[i]}/mqdefault.jpg" alt="">` : '<i class="en-ph"></i>');
  return `
    <h2>英文複習</h2>
    <p class="note">每天晚上 8:00–9:30：進臥室選棉棉的「ABC」，或在睡覺／休息畫面點右下角的棉棉。9:30 一到就關。<br>
      今天星期${DAYS[now().getDay()]}：<b>${NAMES[first]}先聽</b>（一、三、五、日向澤先；二、四、六妍卉先）。聽完請按住畫面右下角的勾勾 1 秒，才會換下一個人。<br>
      勾選的課會一直保留，要換課再來改。播放直接連到原本的網站和 YouTube（需要網路），遊戲不會存這些檔案。</p>

    <h3>向澤：Rocket Book 1 <span class="en-n" data-for="xz">已選 ${xz.size} 首</span></h3>
    <button class="quiet small" data-act="en-clear" data-id="xz">全部取消</button>
    <button class="quiet small" data-act="en-check">檢查連結</button> <span class="note en-check-msg"></span>
    ${groups().map((g) => `<details class="en-g"><summary>${g.title}　<span class="en-gn">${g.list.filter((t) => xz.has(t.i)).length || ''}</span>
        <button class="quiet small" data-act="en-all" data-g="${g.key}">整組勾選</button></summary>
      ${g.list.map((t) => `<label class="en-row"><input type="checkbox" data-en="xz" data-i="${t.i}" ${xz.has(t.i) ? 'checked' : ''}> ${t.no}　${t.title} <span class="en-st" data-i="${t.i}"></span></label>`).join('')}
    </details>`).join('')}

    <h3>妍卉：Max &amp; Mousy Book 2（YouTube） <span class="en-n" data-for="yh">已選 ${yh.size} 支</span></h3>
    <button class="quiet small" data-act="en-clear" data-id="yh">全部取消</button>
    <button class="quiet small" data-act="en-thumbs">${ids.length ? '重新載入縮圖' : '載入影片縮圖'}</button> <span class="note en-yt-msg"></span>
    <p class="note">原本的 CD 網站只有 http，iPad 上不能在遊戲裡播放，所以用 YouTube 播放清單。影片標題要在遊戲裡播過一次才會顯示在這裡。</p>
    <div class="en-yt-grid">
      ${Array.from({ length: YT_COUNT }, (_, i) => `<label class="en-v"><input type="checkbox" data-en="yh" data-i="${i}" ${yh.has(i) ? 'checked' : ''}>${thumb(i)}<b>${i + 1}</b>${titleOf(i) ? `<small>${esc(titleOf(i))}</small>` : ''}</label>`).join('')}
    </div>
    <div class="en-yt-probe"></div>`;
}

function setPick(id, i, on) {
  const list = picked(id);
  if (on) list.add(i); else list.delete(i);
  state.settings.english = { ...(state.settings.english || {}), [id]: [...list].sort((a, b) => a - b) };
  save();
}
function refreshCounts(node) {
  const xz = picked('xz');
  node.querySelector('.en-n[data-for="xz"]').textContent = `已選 ${xz.size} 首`;
  node.querySelector('.en-n[data-for="yh"]').textContent = `已選 ${picked('yh').size} 支`;
  node.querySelectorAll('.en-g').forEach((d) => {
    const n = [...d.querySelectorAll('input[data-en="xz"]')].filter((x) => x.checked).length;
    d.querySelector('.en-gn').textContent = n || '';
  });
}

// 用 YouTube 播放器讀出播放清單的影片編號（才能顯示縮圖）
async function loadThumbs(node) {
  const msg = node.querySelector('.en-yt-msg');
  msg.textContent = '載入中…';
  try {
    const YT = await loadYT();
    const box = document.createElement('div');
    node.querySelector('.en-yt-probe').replaceChildren(box);
    const ids = await new Promise((resolve, reject) => {
      let p = null;
      const done = () => { const l = p?.getPlaylist?.(); if (l?.length) { resolve(l); return true; } return false; };
      p = new YT.Player(box, {
        width: 200, height: 113,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { listType: 'playlist', list: YT_LIST },
        events: {
          onReady: () => { p.cuePlaylist({ listType: 'playlist', list: YT_LIST }); setTimeout(done, 1500); },
          onStateChange: () => done(),
          onError: (e) => reject(new Error(`YouTube 錯誤 ${e.data}`)),
        },
      });
      setTimeout(() => (done() ? null : reject(new Error('逾時'))), 15000);
    });
    node.querySelector('.en-yt-probe').replaceChildren();
    state.settings.enYtIds = ids;
    save();
    node.querySelectorAll('.en-v').forEach((v, i) => {
      if (!ids[i]) return;
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = `https://i.ytimg.com/vi/${ids[i]}/mqdefault.jpg`;
      v.querySelector('img, .en-ph')?.replaceWith(img);
    });
    msg.textContent = `共 ${ids.length} 支${ids.length !== YT_COUNT ? `（原本是 ${YT_COUNT} 支，播放清單可能有變動）` : ''}`;
  } catch (e) {
    msg.textContent = `載入失敗：${e.message}（確認有網路；如果影片不允許嵌入，遊戲裡也會播不出來）`;
  }
}

// 每一首試著靜音播一下，讀得到長度就是可以播。
// iOS 沒有點擊就不會載入音檔，所以三個播放器都在按下「檢查連結」的當下先開始播，之後換網址繼續用。
function checkLinks(node) {
  const msg = node.querySelector('.en-check-msg');
  node.querySelectorAll('.en-g').forEach((d) => { d.open = true; });
  noReferrer(true);
  const queue = [...ROCKET];
  let ok = 0;
  let bad = 0;
  const mark = (t, good) => {
    if (good) ok++; else bad++;
    const st = node.querySelector(`.en-st[data-i="${t.i}"]`);
    st.textContent = good ? '✓' : '✗ 播不出來';
    st.className = `en-st ${good ? 'ok' : 'bad'}`;
    msg.textContent = `檢查中 ${ok + bad}/${ROCKET.length}`;
  };
  const worker = (a) => new Promise((done) => {
    let t = null;
    let timer = 0;
    const next = () => {
      clearTimeout(timer);
      t = queue.shift();
      if (!t) { a.pause(); a.removeAttribute('src'); a.load(); done(); return; }
      timer = setTimeout(() => { mark(t, false); next(); }, 15000);
      a.src = t.url;
      a.play().catch(() => {});
    };
    a.addEventListener('loadedmetadata', () => { a.pause(); mark(t, true); next(); });
    a.addEventListener('error', () => { if (a.getAttribute('src')) { mark(t, false); next(); } });
    next();
  });
  const players = Array.from({ length: 3 }, () => { const a = new Audio(); a.muted = true; a.playsInline = true; a.preload = 'auto'; return a; });
  Promise.all(players.map(worker)).then(() => {
    noReferrer(false);
    msg.textContent = bad ? `${ok} 首正常，${bad} 首播不出來（請告訴 Claude 是哪幾首）` : `全部 ${ok} 首都正常`;
  });
}

// 家長頁的 change／click 交給這裡；處理了回傳 true
export function englishChange(e, node) {
  const d = e.target.dataset || {};
  if (!d.en) return false;
  setPick(d.en, +d.i, e.target.checked);
  refreshCounts(node);
  return true;
}
export function englishClick(e, node) {
  const act = e.target.closest?.('[data-act]')?.dataset.act;
  if (!act?.startsWith('en-')) return false;
  e.preventDefault();
  if (act === 'en-clear') {
    const id = e.target.dataset.id;
    state.settings.english = { ...(state.settings.english || {}), [id]: [] };
    save();
    node.querySelectorAll(`input[data-en="${id}"]`).forEach((x) => { x.checked = false; });
    refreshCounts(node);
  }
  if (act === 'en-all') {
    const g = e.target.closest('details');
    const boxes = [...g.querySelectorAll('input[data-en="xz"]')];
    const on = boxes.some((x) => !x.checked);
    boxes.forEach((x) => { x.checked = on; setPick('xz', +x.dataset.i, on); });
    refreshCounts(node);
  }
  if (act === 'en-thumbs') loadThumbs(node);
  if (act === 'en-check') checkLinks(node);
  return true;
}

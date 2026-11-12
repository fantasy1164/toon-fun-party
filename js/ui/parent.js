// 家長頁面：遊玩時間、今日領獎、時間設定、備份。這一頁給大人看，所以有文字。
import { el } from '../core/dom.js';
import { state, save, exportData, importData, stampedToday, cardInfo, redeem } from '../core/store.js';
import { dateKey } from '../core/clock.js';
import { REASONS, reasonIcon, shapeSvg, ensureInkFilter } from '../art/stamps.js';

const NAMES = { yh: '妍卉', xz: '向澤' };
const CLAIM_NAMES = {
  brush_morning: '早上刷牙', brush_evening: '睡前刷牙',
  wash_morning: '早上洗手', wash_noon: '中午洗手', wash_evening: '傍晚洗手',
};

function stampSection(id) {
  const p = state.profiles[id];
  const { size, stamps, full } = cardInfo(id);
  const count = full ? 0 : stamps.length;
  const month = dateKey().slice(0, 7);
  const monthCount = p.log.filter((e) => e.d.startsWith(month)).length;
  const done = stampedToday(id);
  const chips = Object.entries(REASONS).map(([r, v]) =>
    `<button class="chip" data-r="${r}" ${done ? 'disabled' : ''}>${reasonIcon(r, 44)}<span>${v.label}</span></button>`).join('');
  const mine = p.stamp ? shapeSvg(p.stamp.shape, p.stamp.color, 44) : '<span class="note">（還沒挑印章，蓋章前會先讓他挑）</span>';
  return `
    <div class="stamp-row" data-id="${id}">
      <div class="title"><b>${NAMES[id]}</b> ${mine}
        <span>這張卡 ${count} / ${size}</span><span>本月 ${monthCount} 個章</span>
        ${p.owed ? `<span class="owed">待發獎品 ${p.owed} 份 <button class="quiet" data-act="redeem" data-id="${id}">已發一份</button></span>` : ''}
      </div>
      ${done ? '<p class="note">今天已經蓋過章了。</p>' : `
        <p class="note">今天表現好的地方（可以複選），選好後把 iPad 交給${NAMES[id]}自己蓋：</p>
        <div class="chips">${chips}</div>
        <button data-act="stamp" data-id="${id}" disabled>開始蓋章</button>`}
      ${p.stamp && !p.repick ? `<button class="quiet small" data-act="repick" data-id="${id}">下次讓他換印章</button>` : ''}
    </div>`;
}

export function openParent(onClose, { onStamp } = {}) {
  ensureInkFilter();
  const k = dateKey();
  const rows = ['yh', 'xz'].map((id) => {
    const p = state.profiles[id];
    const min = Math.round((p.playMs[k] || 0) / 60000);
    const claims = Object.keys(p.claims[k] || {}).map((c) => CLAIM_NAMES[c] || c).join('、') || '—';
    const items = Object.values(p.collection).reduce((a, b) => a + b, 0);
    return `<tr><th>${NAMES[id]}</th><td>${min} 分鐘</td><td>${claims}</td><td>${items} 件</td></tr>`;
  }).join('');
  const s = state.settings;
  const resting = state.session.restUntil > Date.now();
  const node = el(`
    <div class="parent">
      <h1>家長頁面</h1>
      <h2>好寶寶蓋章</h2>
      ${stampSection('yh')}
      ${stampSection('xz')}
      <h2>今天</h2>
      <table><tr><th></th><th>遊玩時間</th><th>已領獎的活動</th><th>收藏品總數</th></tr>${rows}</table>

      <h2>時間設定</h2>
      <label>每次可玩 <input type="number" data-k="sessionMin" min="1" max="60" value="${s.sessionMin}"> 分鐘</label>
      <label>下班後休息 <input type="number" data-k="restMin" min="0" max="600" value="${s.restMin}"> 分鐘</label><br>
      <label>幾點睡覺 <input type="number" data-k="bedtime" min="17" max="24" value="${s.bedtime}"> 點</label>
      <label>幾點起床 <input type="number" data-k="wake" min="4" max="10" value="${s.wake}"> 點</label>
      <p class="note">${resting ? `角色正在休息，到 ${new Date(state.session.restUntil).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 為止。` : '角色目前沒有在休息。'}</p>
      <button data-act="wake" class="quiet">立刻結束休息</button>

      <h2>備份</h2>
      <p class="note">進度只存在這台 iPad。按「產生備份」後把文字複製到備忘錄保存；要還原時貼回來再按「還原」。</p>
      <textarea spellcheck="false"></textarea><br>
      <button data-act="export" class="quiet">產生備份</button>
      <button data-act="import" class="quiet">還原</button>
      <span class="note msg"></span>

      <h2>&nbsp;</h2>
      <button data-act="close">完成</button>
      <p class="note">天氣資料（之後加入）：Open-Meteo.com</p>
    </div>`);
  document.getElementById('stage').appendChild(node);
  const ta = node.querySelector('textarea');
  const msg = node.querySelector('.msg');

  node.addEventListener('change', (e) => {
    const key = e.target.dataset?.k;
    if (!key) return;
    const v = parseFloat(e.target.value);
    if (!Number.isNaN(v)) { state.settings[key] = v; save(); }
  });
  node.addEventListener('click', (e) => {
    const chip = e.target.closest?.('.chip');
    if (chip && !chip.disabled) {
      chip.classList.toggle('on');
      const row = chip.closest('.stamp-row');
      row.querySelector('[data-act="stamp"]').disabled = !row.querySelector('.chip.on');
      return;
    }
    const act = e.target.dataset?.act;
    const id = e.target.dataset?.id;
    if (act === 'stamp') {
      const row = e.target.closest('.stamp-row');
      const reasons = [...row.querySelectorAll('.chip.on')].map((c) => c.dataset.r);
      if (!reasons.length) return;
      node.remove();
      onStamp?.(id, reasons);
      return;
    }
    if (act === 'redeem') {
      redeem(id);
      node.remove();
      openParent(onClose, { onStamp });
      return;
    }
    if (act === 'repick') {
      state.profiles[id].repick = true; save();
      e.target.textContent = '下次進遊戲時會讓他換印章';
      e.target.disabled = true;
      return;
    }
    if (act === 'wake') {
      state.session.restUntil = 0; state.session.usedMs = 0; save();
      e.target.textContent = '已結束休息';
    } else if (act === 'export') {
      ta.value = exportData(); ta.select(); msg.textContent = '已產生，請全選複製。';
    } else if (act === 'import') {
      try { importData(ta.value); msg.textContent = '還原成功，重新載入中…'; setTimeout(() => location.reload(), 600); }
      catch { msg.textContent = '這段文字不是有效的備份。'; }
    } else if (act === 'close') {
      node.remove(); onClose?.();
    }
  });
  // 家長頁面內的觸碰不要被遊戲層吃掉
  ['pointerdown', 'touchstart', 'touchmove'].forEach((t) => node.addEventListener(t, (e) => e.stopPropagation()));
}

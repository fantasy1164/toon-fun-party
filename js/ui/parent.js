// 家長頁面：遊玩時間、今日領獎、時間設定、備份。這一頁給大人看，所以有文字。
import { el } from '../core/dom.js';
import { state, save, exportData, importData, stampedToday, cardInfo, redeem, restoreDaysAgo, clearAll, snapshotDays } from '../core/store.js';
import { dateKey, now, hour, testSettings, TEST_KEY, testing } from '../core/clock.js';
import { REASONS, reasonIcon, shapeSvg, ensureInkFilter } from '../art/stamps.js';
import * as weather from '../core/weather.js';
import * as fest from '../core/festival.js';

const NAMES = { yh: '妍卉', xz: '向澤' };
const CLAIM_NAMES = {
  brush_morning: '早上刷牙', brush_evening: '睡前刷牙',
  wash_morning: '早上洗手', door_morning: '早上出門準備',
  kitchen_breakfast: '早餐', kitchen_lunch: '午餐', kitchen_dinner: '晚餐', bedroom_evening: '睡前準備', car_day: '坐車安全', wash_noon: '中午洗手', wash_evening: '傍晚洗手',
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

const KIND_NAMES = { clear: '晴天', cloudy: '多雲', rain: '下雨', storm: '雷雨', fog: '起霧' };
function weatherSection() {
  const w = weather.current();
  const p = weather.place();
  const at = weather.lastUpdated();
  const flags = [w.hot && '很熱', w.cold && '很冷', w.windy && '強風'].filter(Boolean).join('、');
  const now = w.none ? '還沒取得天氣資料（需要網路）' :
    `${KIND_NAMES[w.kind] || w.kind}${w.temp !== null ? `，${w.temp}°C` : ''}${flags ? `，${flags}` : ''}${w.fake ? '（測試用）' : ''}`;
  return `
    <p>地點：<b>${p.name}</b>（${(+p.lat).toFixed(2)}, ${(+p.lon).toFixed(2)}）　目前：${now}</p>
    <p class="note">${at ? `更新於 ${new Date(at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}，每 30 分鐘更新。` : ''}遊戲窗外的天氣和角色的提醒都依這裡的天氣。</p>
    <button class="quiet" data-act="geo">用目前位置</button>
    <button class="quiet" data-act="taichung">改回台中</button>
    <span class="note geo-msg"></span>`;
}

const WX_TEST = [['', '真實天氣'], ['clear', '晴天'], ['cloudy', '多雲'], ['rain', '下雨'], ['storm', '雷雨'], ['fog', '起霧'], ['hot', '很熱'], ['cold', '很冷'], ['windy', '強風']];
function testSection() {
  const t = testSettings();
  const n = now();
  const p = (x) => String(x).padStart(2, '0');
  // 沒設定的欄位留空＝用真實的日期或時間
  const d = t.date || '';
  const h = t.hour ?? '';
  const days = snapshotDays();
  return `
    <p class="note">${testing ? `<b style="color:#c9462c">測試模式中</b>：遊戲時間是 ${dateKey()} ${p(n.getHours())}:${p(n.getMinutes())}${t.weather ? `，天氣假裝成「${WX_TEST.find((w) => w[0] === t.weather)?.[1]}」` : ''}。` : '目前使用真實的日期、時間與天氣。'}
      測試時的蓋章、領獎、聖誕進度都會真的寫進存檔，測完可用下面的「清除資料」回復。</p>
    <label>日期 <input type="date" data-t="date" value="${d}"></label>
    <label>時間 <input type="number" data-t="hour" min="0" max="23.5" step="0.5" value="${h}" placeholder="真實"> 點（可用 .5 表示半點）</label>
    <p class="note">日期或時間留空，就用真實的日期或時間。</p>
    <label>天氣 <select data-t="weather">${WX_TEST.map(([v, l]) => `<option value="${v}" ${v === (t.weather || '') ? 'selected' : ''}>${l}</option>`).join('')}</select></label><br>
    <label><input type="checkbox" data-t="nolimit" ${t.nolimit ? 'checked' : ''}> 不限制每次遊玩時間（測試時角色不會下班）</label><br>
    <button data-act="t-apply">套用並重新開始</button>
    <button class="quiet" data-act="t-real">恢復真實時間與天氣</button><br>
    <span class="note">快速設定：</span>
    <button class="quiet small" data-act="t-preset" data-d="12-01" data-h="9">12/1 早上</button>
    <button class="quiet small" data-act="t-preset" data-d="12-24" data-h="19.5">平安夜晚上</button>
    <button class="quiet small" data-act="t-preset" data-d="12-24" data-h="22">平安夜睡覺</button>
    <button class="quiet small" data-act="t-preset" data-d="12-25" data-h="8">聖誕節早上</button>

    <h3>清除資料</h3>
    <p class="note">每天第一次使用時會自動記下當時的進度（保留 35 天，目前有 ${days.length} 天：${days[0] || '—'} 起）。回到今天一開始、回到 30 天前：家長頁面的設定（時間、天氣地點、聖誕開關）會保留；全部清除：連設定一起清掉，回到第一次打開的狀態。</p>
    <button class="quiet" data-act="c-day">回到今天一開始</button>
    <button class="quiet" data-act="c-month">回到 30 天前</button>
    <button class="quiet" data-act="c-all" style="background:#f7c5bd">全部清除</button>
    <span class="note c-msg"></span>`;
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

      <h2>聖誕節</h2>
      <label><input type="checkbox" data-xmas="real" ${fest.xmas().realGift ? 'checked' : ''}> 今年床邊有準備真禮物（12/25 早上聖誕老公公會說「快去看看你的床邊」）</label>
      <p class="note">12 月：選房間畫面會出現聖誕樹與降臨月曆；12/24 晚上可以擺餅乾牛奶；12/25 打開就會拆禮物。</p>
      <button class="quiet small" data-act="xreset">重設今年的聖誕進度</button>

      <h2>天氣</h2>
      <div class="wx">${weatherSection()}</div>

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

      <h2>開發測試</h2>
      <div class="test">${testSection()}</div>

      <h2>&nbsp;</h2>
      <button data-act="close">完成</button>
      <p class="note">天氣資料來源：Open-Meteo.com（CC BY 4.0）</p>
    </div>`);
  document.getElementById('stage').appendChild(node);
  const ta = node.querySelector('textarea');
  const msg = node.querySelector('.msg');

  node.addEventListener('change', (e) => {
    if (e.target.dataset?.xmas === 'real') { fest.setRealGift(e.target.checked); return; }
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
    if (act === 't-apply' || act === 't-preset') {
      const t = {};
      if (act === 't-preset') {
        t.date = `${now().getFullYear()}-${e.target.dataset.d}`;
        t.hour = parseFloat(e.target.dataset.h);
        t.weather = node.querySelector('[data-t="weather"]').value || undefined;
        t.nolimit = node.querySelector('[data-t="nolimit"]').checked || undefined;
      } else {
        t.date = node.querySelector('[data-t="date"]').value || undefined;
        const hv = node.querySelector('[data-t="hour"]').value;
        t.hour = hv === '' ? undefined : parseFloat(hv);
        t.weather = node.querySelector('[data-t="weather"]').value || undefined;
        t.nolimit = node.querySelector('[data-t="nolimit"]').checked || undefined;
      }
      if (t.nolimit) { state.session.usedMs = 0; state.session.restUntil = 0; save(); }
      localStorage.setItem(TEST_KEY, JSON.stringify(t));
      location.reload();
      return;
    }
    if (act === 't-real') {
      localStorage.removeItem(TEST_KEY);
      location.reload();
      return;
    }
    if (act === 'c-day' || act === 'c-month' || act === 'c-all') {
      // 按兩次才執行，避免誤按
      const msg = node.querySelector('.c-msg');
      if (!e.target.classList.contains('armed')) {
        node.querySelectorAll('.armed').forEach((b) => b.classList.remove('armed'));
        e.target.classList.add('armed');
        msg.textContent = '確定的話，再按一次同一個按鈕。';
        return;
      }
      if (act === 'c-all') {
        clearAll();
        msg.textContent = '已全部清除，重新開始…';
      } else {
        const k = restoreDaysAgo(act === 'c-day' ? 0 : 30);
        msg.textContent = k ? `已回到 ${k} 一開始的進度，重新開始…` : '還沒有可以回復的紀錄。';
        if (!k) return;
      }
      setTimeout(() => location.reload(), 700);
      return;
    }
    if (act === 'xreset') {
      fest.resetXmas();
      e.target.textContent = '已重設';
      e.target.disabled = true;
      return;
    }
    if (act === 'repick') {
      state.profiles[id].repick = true; save();
      e.target.textContent = '下次進遊戲時會讓他換印章';
      e.target.disabled = true;
      return;
    }
    if (act === 'geo' || act === 'taichung') {
      const wx = node.querySelector('.wx');
      const done = async (p) => {
        weather.setPlace(p);
        await weather.refresh(true);
        wx.innerHTML = weatherSection();
      };
      if (act === 'taichung') { done(weather.DEFAULT_PLACE); return; }
      const msg = node.querySelector('.geo-msg');
      if (!navigator.geolocation) { msg.textContent = '這台裝置不支援定位。'; return; }
      msg.textContent = '定位中…';
      navigator.geolocation.getCurrentPosition(
        (pos) => done({ name: '目前位置', lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3) }),
        () => { msg.textContent = '無法取得位置（可能沒有允許定位）。'; },
        { timeout: 10000, maximumAge: 600000 },
      );
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

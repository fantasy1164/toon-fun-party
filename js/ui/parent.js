// 家長頁面：遊玩時間、今日領獎、時間設定、備份。這一頁給大人看，所以有文字。
import { el } from '../core/dom.js';
import { syncConfig, setSyncConfig, syncNow, syncStatus, onSyncStatus, configured, deviceName } from '../core/sync.js';
import { state, save, exportData, importData, stampedToday, cardInfo, redeem, restoreDaysAgo, clearAll, snapshotDays } from '../core/store.js';
import { dateKey, testing } from '../core/clock.js';
import { REASONS, reasonIcon, shapeSvg, ensureInkFilter } from '../art/stamps.js';
import * as weather from '../core/weather.js';
import { listen } from '../core/mic.js';
import * as fest from '../core/festival.js';
import { setMusicVolume, playMusic } from '../core/audio.js';
import { englishSection, englishChange, englishClick, englishMounted } from './englishParent.js';
import { timesSection, timesClick, timesBadge } from './timesParent.js';
import { testSection, testClick, testChange, testReset } from './testParent.js';

const NAMES = { yh: '妍卉', xz: '向澤' };
const CLAIM_NAMES = {
  brush_morning: '早上刷牙', brush_evening: '睡前刷牙',
  wash_morning: '早上洗手', door_morning: '早上出門準備',
  kitchen_breakfast: '早餐', kitchen_lunch: '午餐', kitchen_dinner: '晚餐', bedroom_evening: '睡前準備', car_day: '坐車安全', school_day: '上課', farm_day: '農場', park_day: '公園', clinic_day: '診所', market_day: '超市', bath_evening: '洗澎澎', party_day: '生日派對', ny_day: '過年', wash_noon: '中午洗手', wash_evening: '傍晚洗手',
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

// 清除資料（放在「資料」分頁最下面，跟其他按鈕分開）
function clearSection() {
  const days = snapshotDays();
  return `
    <div class="danger">
    <h3>清除資料</h3>
    <p class="note">每天第一次使用時會自動記下當時的進度（保留 35 天，目前有 ${days.length} 天：${days[0] || '—'} 起）。回到今天一開始、回到 30 天前：家長頁面的設定（時間、天氣地點、聖誕開關）會保留；全部清除：連設定一起清掉，回到第一次打開的狀態。</p>
    <button class="quiet" data-act="c-day">回到今天一開始</button>
    <button class="quiet" data-act="c-month">回到 30 天前</button>
    <button class="quiet" data-act="c-all" style="background:#f7c5bd">全部清除</button>
    <span class="note c-msg"></span>
    </div>`;
}

function syncText(st = syncStatus()) {
  const hm = (t) => new Date(t).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  const last = st.last ? `（上次同步 ${new Date(st.last).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} ${hm(st.last)}）` : '';
  if (!configured()) return '還沒設定。設定後，進度會存到你的 Google 雲端硬碟「明星總動員存檔」資料夾，每台裝置打開遊戲時自動載入最新進度。';
  switch (st.kind) {
    case 'test': return '測試模式中，暫停同步（恢復真實時間後繼續）。';
    case 'busy': return '同步中…';
    case 'ok': return `<b style="color:#1a8a3a">✓ 已同步</b>${last}`;
    case 'dirty': return `有新進度，稍後自動上傳${last}`;
    case 'error': return `<b style="color:#c9462c">✗ 同步失敗：${st.msg}</b>，有網路時會自動再試${last}`;
    default: return `已設定${last}`;
  }
}

const attr = (v) => String(v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function syncSection() {
  const c = syncConfig();
  return `
    <p class="note sync-st">${syncText()}</p>
    <label>雲端網址 <input data-sy="url" value="${attr(c.url)}" placeholder="https://script.google.com/macros/s/……/exec" autocomplete="off" autocapitalize="off" spellcheck="false" ></label>
    <label>家庭密碼 <input data-sy="key" type="password" value="${attr(c.key)}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
    <label>這台的名字 <input data-sy="dev" value="${attr(c.dev || deviceName())}" autocomplete="off"></label>
    <button data-act="sy-save">儲存並同步</button>
    <button class="quiet" data-act="sy-now">立即同步</button>
    <button class="quiet" data-act="sy-pull">用雲端進度覆蓋這台</button>
    <p class="note">每台裝置設定一次。之後打開遊戲會自動載入最新進度；玩的時候、離開 app 時自動上傳。兩台在沒網路時各自玩過，連上後會合併（印章、收藏、徽章都不會少）。
      雲端硬碟的「舊版本」資料夾每天留一份，可以找回以前的進度。「用雲端進度覆蓋這台」：這台的進度不要了、直接換成雲端的（例如這台之前測試過）。</p>`;
}

export function openParent(onClose, { onStamp } = {}) {
  ensureInkFilter();
  testReset();
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
  // 分頁（11/19 John 選左側分頁）：照使用頻率排，下次打開停在上次的分頁
  const owed = ['yh', 'xz'].filter((id) => !stampedToday(id)).length;
  const enN = (s.english?.xz?.length || 0) + (s.english?.yh?.length || 0);
  const TABS = [
    ['stamp', '蓋章', owed ? `<b class="bd">${owed}</b>` : ''],
    ['english', '英文複習', enN ? `<b class="bd soft">${enN}</b>` : ''],
    ['times', '乘法', timesBadge()],
    ['time', '作息', ''],
    ['fest', '節日', ''],
    ['look', '畫面聲音', ''],
    ['data', '資料', '<i class="dot"></i>'],
    ['test', '測試', testing ? '<b class="bd">測試中</b>' : ''],
  ];
  let tab = 'stamp';
  try { tab = localStorage.getItem('tfp-parent-tab') || 'stamp'; } catch { /* 忽略 */ }
  if (!TABS.some((t) => t[0] === tab)) tab = 'stamp';
  const pane = (id, html) => `<section class="pp${id === tab ? ' on' : ''}" data-pane="${id}">${html}</section>`;
  const node = el(`
    <div class="parent">
      <nav class="pnav">
        <h1>家長頁面</h1>
        ${TABS.map(([id, t, b]) => `<button class="ptab${id === tab ? ' on' : ''}" data-tab="${id}"><span>${t}</span>${b}</button>`).join('')}
      </nav>
      <div class="pbody">
      <button class="pdone" data-act="close">完成</button>
      ${pane('stamp', `
      <h2>好寶寶蓋章</h2>
      ${stampSection('yh')}
      ${stampSection('xz')}
      <h2>今天</h2>
      <table><tr><th></th><th>遊玩時間</th><th>已領獎的活動</th><th>收藏品總數</th></tr>${rows}</table>`)}

      ${pane('english', englishSection())}

      ${pane('times', timesSection())}

      ${pane('time', `
      <h2>時間設定</h2>
      <label>每次可玩 <input type="number" data-k="sessionMin" min="1" max="60" value="${s.sessionMin}"> 分鐘</label>
      <label>下班後休息 <input type="number" data-k="restMin" min="0" max="600" value="${s.restMin}"> 分鐘</label><br>
      <label>幾點睡覺 <input type="number" data-k="bedtime" min="17" max="24" value="${s.bedtime}"> 點</label>
      <label>幾點起床 <input type="number" data-k="wake" min="4" max="10" value="${s.wake}"> 點</label>
      <p class="note">${resting ? `角色正在休息，到 ${new Date(state.session.restUntil).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 為止。` : '角色目前沒有在休息。'}</p>
      <button data-act="wake" class="quiet">立刻結束休息</button>`)}

      ${pane('fest', `
      <h2>生日</h2>
      <label>妍卉 <input type="date" data-bd="yh" value="${fest.birthday('yh')}"></label>
      <label>向澤 <input type="date" data-bd="xz" value="${fest.birthday('xz')}"></label>
      <p class="note">生日跟著遊戲進度一起存（有設定雲端同步就會同步到其他裝置）。生日當天選房間畫面會出現「派對」房間；另一個小孩進去會偷偷幫壽星做生日卡。</p>
      <button class="quiet" data-act="mic">允許麥克風（吹蠟燭、圖書館輕聲說話用）</button>
      <span class="mic-meter"><i></i></span> <span class="note mic-msg"></span>
      <p class="note">麥克風只用來偵測吹氣的音量，不錄音、不上傳。iPad 主畫面 app 的麥克風授權通常只在這次開啟期間有效，生日當天把 iPad 交給小孩前先按一次；沒有允許的話，吹蠟燭會改成用點的。</p>

      <h2>聖誕節</h2>
      <label><input type="checkbox" data-xmas="real" ${fest.xmas().realGift ? 'checked' : ''}> 今年床邊有準備真禮物（12/25 早上聖誕老公公會說「快去看看你的床邊」）</label>
      <p class="note">12 月：選房間畫面會出現聖誕樹與降臨月曆；12/24 晚上可以擺餅乾牛奶；12/25 打開就會拆禮物。</p>
      <button class="quiet small" data-act="xreset">重設今年的聖誕進度</button>`)}

      ${pane('look', `
      <h2>聲音</h2>
      <span>音樂大小</span>
      ${[['low', '小'], ['mid', '中'], ['high', '大']].map(([v, t]) => `<label><input type="radio" name="mv" data-mv="${v}" ${(s.musicVol || 'mid') === v ? 'checked' : ''}> ${t}</label>`).join('')}
      <p class="note">只調背景音樂和活動歌（刷牙歌、洗手歌……），角色說話的音量不變。改了馬上生效。</p>

      <h2>小孩在遊戲裡的樣子</h2>
      ${[['body', '全身（站著全身、坐著半身）'], ['head', '只有頭']].map(([v, t]) => `<label><input type="radio" name="kl" data-kl="${v}" ${(s.kidLook || 'body') === v ? 'checked' : ''}> ${t}</label>`).join('')}
      <p class="note">下次進場景時換成新的樣子。可以兩種都讓孩子玩幾天，看他們喜歡哪一種。</p>

      <h2>畫面立體感</h2>
      <label><input type="checkbox" data-cam ${s.camera !== false ? 'checked' : ''}> 鏡頭運鏡（景深、鏡頭推拉、光影）</label>
      <label><input type="checkbox" data-tilt ${s.tilt !== false ? 'checked' : ''}> 傾斜 iPad 時畫面跟著動</label>
      <p class="note">下次進場景時生效。傾斜開著的話，每次打開 app 第一次點螢幕時，iPad 會問能不能使用「動作與方向」，按允許即可。孩子容易分心或頭暈就關掉。</p>

      <h2>天氣</h2>
      <div class="wx">${weatherSection()}</div>
      <p class="note">天氣資料來源：Open-Meteo.com（CC BY 4.0）</p>`)}

      ${pane('data', `
      <h2>雲端同步</h2>
      <div class="sync">${syncSection()}</div>

      <h2>備份</h2>
      <p class="note">進度存在這台裝置（有設定雲端同步的話，也會存到 Google 雲端硬碟）。按「產生備份」後把文字複製到備忘錄保存；要還原時貼回來再按「還原」。</p>
      <textarea spellcheck="false"></textarea><br>
      <button data-act="export" class="quiet">產生備份</button>
      <button data-act="import" class="quiet">還原</button>
      <span class="note msg"></span>
      ${clearSection()}`)}

      ${pane('test', `
      <h2>開發測試</h2>
      <div class="test">${testSection()}</div>`)}
      </div>
    </div>`);
  document.getElementById('stage').appendChild(node);
  englishMounted(node);
  const ta = node.querySelector('textarea');
  const body = node.querySelector('.pbody');
  const dot = node.querySelector('.ptab[data-tab="data"] .dot');
  const paintDot = (st = syncStatus()) => { dot.className = `dot ${!configured() ? '' : st.kind === 'error' ? 'bad' : st.kind === 'ok' ? 'ok' : 'wait'}`; };
  paintDot();
  node.querySelectorAll('.ptab').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.tab;
    node.querySelectorAll('.ptab').forEach((x) => x.classList.toggle('on', x === b));
    node.querySelectorAll('.pp').forEach((x) => x.classList.toggle('on', x.dataset.pane === id));
    body.scrollTop = 0;
    try { localStorage.setItem('tfp-parent-tab', id); } catch { /* 忽略 */ }
  }));
  const off = onSyncStatus((st) => {
    if (!node.isConnected) { off(); return; }
    paintDot(st);
    node.querySelector('.sync-st').innerHTML = syncText(st);
  });
  const msg = node.querySelector('.msg');

  node.addEventListener('change', (e) => {
    if (englishChange(e, node)) return;
    if (testChange(e, node)) return;
    if (e.target.dataset?.xmas === 'real') { fest.setRealGift(e.target.checked); return; }
    if (e.target.dataset?.bd) { fest.setBirthday(e.target.dataset.bd, e.target.value); return; }
    if ('cam' in (e.target.dataset || {})) {
      state.settings.camera = e.target.checked;
      save();
      return;
    }
    if ('tilt' in (e.target.dataset || {})) {
      state.settings.tilt = e.target.checked;
      save();
      return;
    }
    if (e.target.dataset?.kl) {
      state.settings.kidLook = e.target.dataset.kl;
      save();
      return;
    }
    if (e.target.dataset?.mv) {
      state.settings.musicVol = e.target.dataset.mv;
      save();
      setMusicVolume(state.settings.musicVol);
      playMusic('lobby');   // 沒有音樂在放的話，放一段讓家長聽
      return;
    }
    const key = e.target.dataset?.k;
    if (!key) return;
    const v = parseFloat(e.target.value);
    if (!Number.isNaN(v)) { state.settings[key] = v; save(); }
  });
  node.addEventListener('click', (e) => {
    if (englishClick(e, node)) return;
    const chip = e.target.closest?.('.chip');
    if (chip && !chip.disabled) {
      chip.classList.toggle('on');
      const row = chip.closest('.stamp-row');
      row.querySelector('[data-act="stamp"]').disabled = !row.querySelector('.chip.on');
      return;
    }
    const act = e.target.dataset?.act;
    const id = e.target.dataset?.id;
    if (act && timesClick(act, e, node)) return;
    if (act && testClick(act, e, node)) return;
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
    if (act === 'sync-test') { location.href = 'sync-test.html'; return; }
    if (act === 'perf-test') { location.href = 'perf-test.html'; return; }
    if (act === 'sy-save' || act === 'sy-now' || act === 'sy-pull') {
      const st = node.querySelector('.sync-st');
      if (act === 'sy-save') {
        const v = (k) => node.querySelector(`[data-sy="${k}"]`).value;
        setSyncConfig({ url: v('url'), key: v('key'), dev: v('dev') });
        if (!configured()) { st.innerHTML = '<b style="color:#c9462c">網址要是 https://script.google.com/macros/s/……/exec，家庭密碼至少 8 碼。</b>'; return; }
      }
      if (act === 'sy-pull' && !e.target.classList.contains('armed')) {
        node.querySelectorAll('.armed').forEach((b) => b.classList.remove('armed'));
        e.target.classList.add('armed');
        st.innerHTML = '這台的進度會被雲端的取代。確定的話，再按一次同一個按鈕。';
        return;
      }
      e.target.classList.remove('armed');
      syncNow({ mode: act === 'sy-pull' ? 'pull' : 'auto' }).then(({ changed }) => {
        // 進度換成雲端的（或合併了）：重新開始，畫面才會是新的
        if (changed) { st.innerHTML = '已載入雲端進度，重新開始…'; setTimeout(() => location.reload(), 700); }
      });
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
    if (act === 'mic') {
      const m = node.querySelector('.mic-msg');
      const bar = node.querySelector('.mic-meter i');
      m.textContent = '請按「允許」，然後對著 iPad 吹吹看…';
      let acc = 0;
      let last = performance.now();
      listen((rms) => {
        const t = performance.now();
        bar.style.width = `${Math.min(100, rms * 500)}%`;
        if (rms > 0.08) acc += (t - last) / 1000;
        last = t;
        if (acc > 0.3) m.textContent = '✓ 有偵測到吹氣，生日當天可以用吹的。';
      })
        .then((probe) => {
          if (!/✓/.test(m.textContent)) m.textContent = '已允許麥克風，對著 iPad 吹吹看…';
          setTimeout(() => { probe.stop(); bar.style.width = '0'; }, 6000);
        })
        .catch(() => { m.textContent = '沒有取得麥克風（可能按了不允許），吹蠟燭會改成用點的。'; });
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

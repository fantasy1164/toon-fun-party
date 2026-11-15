// 安裝引導：用一般瀏覽器打開時，教爸媽把遊戲加到主畫面（變成全螢幕的 App）。
// 從主畫面 App 打開就不顯示。這頁是給大人看的，所以有文字。
const SKIP_KEY = 'tfp-install-skip';
const ua = navigator.userAgent;

export const isStandalone = () => navigator.standalone === true
  || ['fullscreen', 'standalone', 'minimal-ui'].some((m) => matchMedia(`(display-mode: ${m})`).matches);

// ---------- 偵測裝置與瀏覽器 ----------
export function detect() {
  const ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const iphone = /iPhone|iPod/.test(ua);
  const ios = ipad || iphone;
  const android = /Android/.test(ua);
  const inApp = /\bLine\//i.test(ua) ? 'line'
    : /FBAN|FBAV|FB_IAB/.test(ua) ? 'fb'
    : /Instagram/.test(ua) ? 'ig'
    : /MicroMessenger/.test(ua) ? 'wechat'
    : (android && /; wv\)/.test(ua)) ? 'webview' : null;
  let browser = 'other';
  if (ios) browser = /CriOS/.test(ua) ? 'chrome' : /FxiOS/.test(ua) ? 'firefox' : /EdgiOS/.test(ua) ? 'edge' : /Safari/.test(ua) ? 'safari' : 'other';
  else if (android) browser = /SamsungBrowser/.test(ua) ? 'samsung' : /EdgA/.test(ua) ? 'edge' : /Firefox/.test(ua) ? 'firefox' : /Chrome/.test(ua) ? 'chrome' : 'other';
  else browser = /Edg\//.test(ua) ? 'edge' : /Chrome/.test(ua) ? 'chrome' : /Firefox/.test(ua) ? 'firefox' : /Safari/.test(ua) ? 'safari' : 'other';
  const safariVer = +(ua.match(/Version\/(\d+)/)?.[1] || 0);
  return { ipad, iphone, ios, android, desktop: !ios && !android, inApp, browser, safariVer };
}

// Chrome、Edge、Samsung 可以直接跳出「安裝」視窗
let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
  document.dispatchEvent(new CustomEvent('tfp-can-install'));
});

export function needInstallGuide() {
  if (new URLSearchParams(location.search).has('guide')) return true;   // 預覽用
  if (isStandalone()) return false;
  if (navigator.webdriver) return false;   // 自動測試
  const p = new URLSearchParams(location.search);
  if (p.has('noguide')) return false;
  const d = detect();
  if (sessionStorage.getItem(SKIP_KEY)) return false;
  if (d.desktop && localStorage.getItem(SKIP_KEY)) return false;
  return true;
}

// ---------- 小圖示 ----------
const ICON = {
  share: '<svg viewBox="0 0 40 40"><path d="M14 15h-3a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V17a2 2 0 0 0-2-2h-3" fill="none" stroke="#1a7cff" stroke-width="2.6" stroke-linecap="round"/><path d="M20 24V5M13 11l7-7 7 7" fill="none" stroke="#1a7cff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dots: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#333" stroke-width="2.4"/><circle cx="12.5" cy="20" r="2.4" fill="#333"/><circle cx="20" cy="20" r="2.4" fill="#333"/><circle cx="27.5" cy="20" r="2.4" fill="#333"/></svg>',
  kebab: '<svg viewBox="0 0 40 40"><circle cx="20" cy="9" r="3.2" fill="#333"/><circle cx="20" cy="20" r="3.2" fill="#333"/><circle cx="20" cy="31" r="3.2" fill="#333"/></svg>',
  burger: '<svg viewBox="0 0 40 40"><path d="M8 11h24M8 20h24M8 29h24" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>',
  addHome: '<svg viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="7" fill="none" stroke="#333" stroke-width="2.6"/><path d="M20 13v14M13 20h14" stroke="#333" stroke-width="2.6" stroke-linecap="round"/></svg>',
  toggle: '<svg viewBox="0 0 40 40"><rect x="3" y="11" width="34" height="18" rx="9" fill="#34c759"/><circle cx="28" cy="20" r="7.2" fill="#fff"/></svg>',
  add: '<svg viewBox="0 0 40 40"><rect x="2" y="9" width="36" height="22" rx="11" fill="#1a7cff"/><text x="20" y="25" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">新增</text></svg>',
  install: '<svg viewBox="0 0 40 40"><rect x="2" y="9" width="36" height="22" rx="11" fill="#1a73e8"/><text x="20" y="25" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">安裝</text></svg>',
  safari: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#e8f2ff" stroke="#1a7cff" stroke-width="2.4"/><path d="M27 13l-9 5-5 9 9-5z" fill="#ff3b30"/><path d="M27 13l-5 9-9 5" fill="#fff" stroke="#1a7cff" stroke-width="1"/></svg>',
  copy: '<svg viewBox="0 0 40 40"><rect x="13" y="13" width="19" height="21" rx="4" fill="none" stroke="#333" stroke-width="2.6"/><path d="M9 26V9a3 3 0 0 1 3-3h13" fill="none" stroke="#333" stroke-width="2.6" stroke-linecap="round"/></svg>',
  open: '<svg viewBox="0 0 40 40"><path d="M22 7h11v11M33 7L18 22" fill="none" stroke="#333" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 24v7a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3h7" fill="none" stroke="#333" stroke-width="2.6" stroke-linecap="round"/></svg>',
  app: '<img src="assets/icons/icon-192.png" alt="">',
};
const step = (icon, html) => `<li><span class="ig-ic">${ICON[icon]}</span><span>${html}</span></li>`;

// ---------- 各種情況的步驟 ----------
function plan(d) {
  const finish = step('app', '回到主畫面，點<b>「歡樂派對」</b>圖示開始玩');
  // LINE、Facebook 等 App 裡面的瀏覽器：不能加到主畫面，要先換到瀏覽器
  if (d.inApp) {
    const target = d.ios ? 'Safari' : 'Chrome';
    return {
      title: `請先用 ${target} 打開`,
      steps: [
        step('dots', '點右上角的<b>「⋯」</b>'),
        step('open', `選<b>「用瀏覽器開啟」</b>或<b>「在 ${target} 中開啟」</b>`),
        step('copy', `找不到的話，點下面的<b>「複製網址」</b>，打開 ${target} 貼上`),
      ],
      copy: true,
      arrow: 'tr',
    };
  }
  if (d.ios) {
    if (d.browser !== 'safari') {
      return {
        title: '請改用 Safari 打開',
        steps: [
          step('copy', '點下面的<b>「複製網址」</b>'),
          step('safari', '打開 <b>Safari</b>，在網址列貼上並前往'),
          step('share', '在 Safari 裡再看一次這個畫面，照步驟加到主畫面'),
        ],
        copy: true,
        note: `${{ chrome: 'Chrome ', firefox: 'Firefox ', edge: 'Edge ' }[d.browser] || '這個瀏覽器'}也可以從「分享 → 加入主畫面」加入，但用 Safari 最穩定。`,
        arrow: null,
      };
    }
    const newUi = d.safariVer >= 26;
    const s = [];
    if (newUi && d.iphone) {
      s.push(step('dots', '點網址列右邊的<b>「⋯」</b>'));
      s.push(step('share', '點<b>「分享」</b>'));
    } else if (d.iphone) {
      s.push(step('share', '點下方中間的<b>分享按鈕</b>（方框加向上箭頭）'));
    } else {
      s.push(step('share', `點右上角的<b>分享按鈕</b>（方框加向上箭頭）${newUi ? '；看不到的話，先點<b>「⋯」</b>再點<b>「分享」</b>' : ''}`));
    }
    s.push(step('addHome', '往下滑，點<b>「加入主畫面」</b>'));
    if (newUi) s.push(step('toggle', '確認<b>「以網頁 App 打開」</b>是開著的'));
    s.push(step('add', '點右上角的<b>「新增」</b>'));
    s.push(finish);
    return {
      title: '把歡樂派對加到主畫面',
      steps: s,
      note: '在瀏覽器裡玩的進度不會帶到主畫面的 App，建議先加到主畫面再開始玩。',
      arrow: d.iphone ? (newUi ? 'br' : 'bc') : 'tr',
    };
  }
  if (d.android) {
    if (d.browser === 'samsung') {
      return {
        title: '把歡樂派對加到主畫面',
        steps: [
          step('burger', '點下方的<b>選單「≡」</b>'),
          step('addHome', '點<b>「新增頁面至」</b>，選<b>「主螢幕」</b>'),
          step('add', '點<b>「新增」</b>'),
          finish,
        ],
        installBtn: true,
        arrow: 'br',
      };
    }
    if (d.browser !== 'chrome') {
      return {
        title: '請改用 Chrome 打開',
        steps: [
          step('copy', '點下面的<b>「複製網址」</b>'),
          step('open', '打開 <b>Chrome</b>，在網址列貼上並前往'),
          step('kebab', '在 Chrome 裡再看一次這個畫面，照步驟安裝'),
        ],
        copy: true,
        arrow: null,
      };
    }
    return {
      title: '把歡樂派對加到主畫面',
      steps: [
        step('kebab', '點右上角的<b>「⋮」</b>'),
        step('addHome', '點<b>「加到主畫面」</b>（有些手機叫<b>「安裝應用程式」</b>）'),
        step('install', '點<b>「安裝」</b>'),
        finish,
      ],
      installBtn: true,
      arrow: 'tr',
    };
  }
  // 電腦
  const s = [];
  if (d.browser === 'chrome' || d.browser === 'edge') {
    s.push(step('install', '點網址列右邊的<b>安裝圖示</b>（或下面出現的<b>「安裝到電腦」</b>按鈕），就會變成電腦上的 App'));
  } else if (d.browser === 'safari') {
    s.push(step('addHome', 'Mac 的 Safari：選單<b>「檔案 → 加入 Dock」</b>'));
  } else {
    s.push(step('open', '用 Chrome 或 Edge 打開，可以安裝成電腦上的 App'));
  }
  return {
    title: '在電腦上玩',
    steps: s,
    note: '電腦上也可以直接在瀏覽器玩。',
    installBtn: true,
    desktop: true,
    arrow: null,
  };
}

// ---------- 畫面 ----------
export function showInstallGuide() {
  const d = detect();
  // LINE 可以用網址參數直接改用外部瀏覽器打開
  if (d.inApp === 'line' && !location.search.includes('openExternalBrowser')) {
    const u = new URL(location.href);
    u.searchParams.set('openExternalBrowser', '1');
    location.replace(u.toString());
  }
  const p = plan(d);
  return new Promise((resolve) => {
    const node = document.createElement('div');
    node.className = `install${p.desktop ? ' desk' : ''}`;
    node.innerHTML = `
      <div class="ig-card">
        <div class="ig-head"><img class="ig-logo" src="assets/icons/icon-192.png" alt=""><div>
          <h1>${p.title}</h1>
          <p>${p.desktop ? '' : '加到主畫面後就像 App 一樣全螢幕，小朋友不會點到網址列。'}</p>
        </div></div>
        <ol class="ig-steps">${p.steps.join('')}</ol>
        ${p.note ? `<p class="ig-note">${p.note}</p>` : ''}
        <div class="ig-btns">
          ${p.installBtn ? '<button class="ig-install hidden">安裝到主畫面</button>' : ''}
          ${p.copy ? '<button class="ig-copy">複製網址</button>' : ''}
          ${p.desktop ? '<button class="ig-play main">直接在瀏覽器玩</button>' : ''}
        </div>
        ${p.desktop ? '' : '<button class="ig-play">這次先在瀏覽器玩</button>'}
        <p class="ig-msg"></p>
      </div>
      ${p.arrow ? `<div class="ig-arrow ${p.arrow}"><svg viewBox="0 0 60 60"><path d="M30 6v40M14 32l16 16 16-16" fill="none" stroke="#ff5c93" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}`;
    document.body.appendChild(node);
    const msg = node.querySelector('.ig-msg');

    // 可以直接跳出安裝視窗的瀏覽器
    const ib = node.querySelector('.ig-install');
    if (ib) {
      if (p.desktop) ib.textContent = '安裝到電腦';
      const showBtn = () => ib.classList.remove('hidden');
      if (deferred) showBtn();
      document.addEventListener('tfp-can-install', showBtn);
      ib.addEventListener('click', async () => {
        if (!deferred) return;
        deferred.prompt();
        const r = await deferred.userChoice.catch(() => null);
        deferred = null;
        ib.classList.add('hidden');
        if (r?.outcome === 'accepted') msg.textContent = '安裝好了！請到主畫面點「歡樂派對」圖示開始玩。';
      });
    }
    window.addEventListener('appinstalled', () => { msg.textContent = '安裝好了！請到主畫面點「歡樂派對」圖示開始玩。'; });

    node.querySelector('.ig-copy')?.addEventListener('click', async () => {
      const url = location.origin + location.pathname;
      try {
        await navigator.clipboard.writeText(url);
        msg.textContent = '已複製網址';
      } catch (e) {
        msg.textContent = url;   // 不能自動複製就顯示出來，讓爸媽長按複製
      }
    });

    node.querySelectorAll('.ig-play').forEach((b) => b.addEventListener('click', () => {
      sessionStorage.setItem(SKIP_KEY, '1');
      if (d.desktop) localStorage.setItem(SKIP_KEY, '1');
      node.remove();
      resolve();
    }));
  });
}

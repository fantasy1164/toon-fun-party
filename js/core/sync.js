// 雲端同步：進度存在家長自己的 Google 雲端硬碟（透過家長部署的 Google Apps Script，見 tools/sync）。
// 小孩的裝置都不用登入，每台在家長頁輸入一次網址和家庭密碼即可。
//
// 雲端存的是 { rev, at, dev, state }。rev 每上傳一次加 1。
// 這台記得上次同步時的 rev（meta.rev）和之後有沒有改過（meta.dirty）：
//   雲端沒變、這台有改   → 上傳
//   雲端變了、這台沒改   → 直接換成雲端的
//   兩邊都改了（離線時各自玩）→ 合併後上傳
// 清除、回復、還原後（meta.force）→ 以這台為準覆蓋雲端（雲端硬碟「舊版本」資料夾還留有之前的）。
import { state, onSaved, replaceState, SYNC_META_KEY, SYNC_CFG_KEY } from './store.js';
import { testing } from './clock.js';

const PUSH_DELAY = 45 * 1000;   // 有變更後多久上傳（遊玩中每 10 秒存一次，不要每次都傳）
const TIMEOUT = 12 * 1000;

const listeners = new Set();
let status = { kind: 'idle' };   // idle、off、test、busy、ok、dirty、error
let busy = null;
let timer = null;
let seq = 0;                     // 本機每存一次加 1，用來判斷上傳途中有沒有又改了

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || {}; } catch { return {}; }
}
function write(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 忽略 */ }
}

export function syncConfig() { return read(SYNC_CFG_KEY); }
export function setSyncConfig({ url, key, dev }) {
  write(SYNC_CFG_KEY, { ...syncConfig(), url: (url || '').trim(), key: (key || '').trim(), dev: (dev || '').trim() || deviceName() });
  // 換了連線設定：當作第一次加入（有進度就和雲端合併，沒有就直接載入雲端的）
  const m = read(SYNC_META_KEY);
  write(SYNC_META_KEY, { at: m.at || 0, dirty: hasProgress(state), force: !!m.force });
  emit(configured() ? { kind: 'idle' } : { kind: 'off' });
}
export function configured() {
  const c = syncConfig();
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(c.url || '') && (c.key || '').length >= 8;
}
export function syncStatus() { return status; }
export function onSyncStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(s) {
  status = { ...s, last: read(SYNC_META_KEY).synced || status.last };
  for (const fn of listeners) { try { fn(status); } catch { /* 忽略 */ } }
}

export function deviceName() {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return '電腦';
  if (/Macintosh/.test(ua)) return 'Mac';
  return '裝置';
}

function hasProgress(s) {
  return Object.values(s.profiles || {}).some((p) => (p.log || []).length || Object.keys(p.collection || {}).length || Object.keys(p.habits || {}).length);
}

const ERR = {
  key: '家庭密碼不對', nopass: '雲端程式還沒設定家庭密碼', locked: '密碼錯太多次，10 分鐘後再試',
  size: '資料太大', server: '雲端程式出錯', op: '雲端程式版本不對', badjson: '資料格式不對',
};

async function call(body, signal) {
  const c = syncConfig();
  const res = await fetch(c.url, {
    method: 'POST',
    // text/plain：Apps Script 不處理 CORS 預檢，用 application/json 會被瀏覽器擋下
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, key: c.key }),
    redirect: 'follow',
    cache: 'no-store',
    signal,
  });
  const text = await res.text();
  let j;
  try { j = JSON.parse(text); } catch { throw new Error('雲端回傳的不是資料（部署的存取權要選「所有人」）'); }
  if (!j.ok) throw new Error(ERR[j.err] || j.err);
  return j;
}

// ---------- 兩邊都改過時的合併 ----------
const maxMap = (a = {}, b = {}) => {
  const o = { ...a };
  for (const [k, v] of Object.entries(b)) o[k] = Math.max(o[k] || 0, v || 0);
  return o;
};
const unionMap = (a = {}, b = {}) => {
  const o = { ...a };
  for (const [k, v] of Object.entries(b)) o[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? { ...(o[k] || {}), ...v } : (o[k] || v);
  return o;
};
// 印章卡相關的欄位要一起取同一邊，不然張數、獎品數會對不上
const STAMP_GROUP = ['stamp', 'card', 'owed', 'cardsDone', 'repick', 'partyDue', 'cardV', 'shelf'];

function mergeProfile(L = {}, C = {}, cloudNewer) {
  const newer = cloudNewer ? C : L;
  const older = cloudNewer ? L : C;
  const o = { ...older, ...newer };
  o.collection = maxMap(L.collection, C.collection);
  o.playMs = maxMap(L.playMs, C.playMs);
  o.friends = maxMap(L.friends, C.friends);
  o.habits = maxMap(L.habits, C.habits);
  o.claims = unionMap(L.claims, C.claims);
  o.starSeen = { ...(L.starSeen || {}), ...(C.starSeen || {}) };
  const ll = (L.log || []).length;
  const cl = (C.log || []).length;
  const stampSide = cl > ll || (cl === ll && cloudNewer) ? C : L;
  for (const k of STAMP_GROUP) if (k in stampSide) o[k] = stampSide[k];
  // 蓋章紀錄：同一天同樣的理由只算一次
  const seen = new Set();
  o.log = [...(L.log || []), ...(C.log || [])]
    .filter((e) => { const k = `${e.d}|${(e.r || []).join(',')}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return o;
}

export function mergeStates(L, C, cloudNewer) {
  const o = cloudNewer ? { ...L, ...C } : { ...C, ...L };
  o.profiles = {};
  for (const id of new Set([...Object.keys(L.profiles || {}), ...Object.keys(C.profiles || {})])) {
    o.profiles[id] = mergeProfile(L.profiles?.[id], C.profiles?.[id], cloudNewer);
  }
  const ns = (cloudNewer ? C.session : L.session) || {};
  o.session = { ...ns, restUntil: Math.max(L.session?.restUntil || 0, C.session?.restUntil || 0) };
  o.settings = { ...(cloudNewer ? L.settings : C.settings), ...(cloudNewer ? C.settings : L.settings) };
  o.settings.birthdays = { ...(L.settings?.birthdays || {}), ...(C.settings?.birthdays || {}) };
  return o;
}

// ---------- 同步一次 ----------
// mode：auto（一般）、pull（用雲端的覆蓋這台）。回傳 { changed }：這台的進度有沒有被換掉。
export function syncNow({ mode = 'auto', timeout = TIMEOUT } = {}) {
  if (busy) return busy;
  if (!configured()) { emit({ kind: 'off' }); return Promise.resolve({ changed: false }); }
  if (testing) { emit({ kind: 'test' }); return Promise.resolve({ changed: false }); }
  clearTimeout(timer); timer = null;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  emit({ kind: 'busy' });
  busy = (async () => {
    let changed = false;
    try {
      const meta = read(SYNC_META_KEY);
      // 從沒同步過的裝置：有進度就當作有變更（和雲端合併，不會蓋掉這台的進度）
      if (meta.rev === undefined && meta.dirty === undefined) meta.dirty = hasProgress(state);
      const got = await call({ op: 'load' }, ctl.signal);
      let cloud = null;
      try { cloud = got.data ? JSON.parse(got.data) : null; } catch { cloud = null; }
      if (cloud && !cloud.state) cloud = null;

      let push = false;
      if (mode === 'pull') {
        if (cloud) { replaceState(cloud.state); changed = true; write(SYNC_META_KEY, { rev: cloud.rev, at: cloud.at, dirty: false, synced: Date.now() }); }
        emit({ kind: 'ok' });
        return { changed };
      }
      if (meta.force || !cloud) {
        push = true;
      } else if (cloud.rev === meta.rev) {
        push = !!meta.dirty;
      } else if (!meta.dirty || (meta.rev === undefined && !hasProgress(state))) {
        replaceState(cloud.state); changed = true;
        write(SYNC_META_KEY, { rev: cloud.rev, at: cloud.at, dirty: false, synced: Date.now() });
      } else {
        replaceState(mergeStates(state, cloud.state, (cloud.at || 0) > (meta.at || 0)));
        changed = true;
        push = true;
      }

      if (push) {
        const mySeq = seq;
        const env = { rev: (cloud?.rev || 0) + 1, at: Date.now(), dev: syncConfig().dev || deviceName(), state };
        await call({ op: 'save', data: JSON.stringify(env), dev: env.dev }, ctl.signal);
        // 上傳途中又存了檔：下次還要再傳
        const stillDirty = seq !== mySeq;
        write(SYNC_META_KEY, { rev: env.rev, at: stillDirty ? Date.now() : env.at, dirty: stillDirty, synced: Date.now() });
        if (stillDirty) schedule();
      } else if (!changed) {
        write(SYNC_META_KEY, { ...meta, synced: Date.now() });
      }
      emit({ kind: read(SYNC_META_KEY).dirty ? 'dirty' : 'ok' });
    } catch (e) {
      const msg = e.name === 'AbortError' ? '連線逾時' : e instanceof TypeError ? '連不上網路' : e.message;
      emit({ kind: 'error', msg });
    } finally {
      clearTimeout(t);
      busy = null;
    }
    return { changed };
  })();
  return busy;
}

function schedule(ms = PUSH_DELAY) {
  if (timer || !configured() || testing) return;
  timer = setTimeout(() => { timer = null; syncNow(); }, ms);
}

// 這台存了檔：記下有變更，過一會兒上傳
onSaved(() => {
  if (!configured() || testing) return;
  seq += 1;
  const m = read(SYNC_META_KEY);
  write(SYNC_META_KEY, { ...m, dirty: true, at: Date.now() });
  if (status.kind !== 'busy') emit({ kind: 'dirty' });
  schedule();
});

// 離開 app 時馬上傳；回到 app 時，若離開夠久就看看別台有沒有玩過
let hiddenAt = 0;
export function setupSync({ onReplaced } = {}) {
  document.addEventListener('visibilitychange', async () => {
    if (!configured() || testing) return;
    if (document.hidden) {
      hiddenAt = Date.now();
      if (read(SYNC_META_KEY).dirty) syncNow();
      return;
    }
    if (Date.now() - hiddenAt < 5 * 60 * 1000) return;
    const { changed } = await syncNow();
    if (changed) onReplaced?.();
  });
  window.addEventListener('online', () => { if (read(SYNC_META_KEY).dirty) syncNow(); });
}

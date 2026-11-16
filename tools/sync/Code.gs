/**
 * 明星總動員歡樂派對：雲端存檔中繼站（Google Apps Script）
 *
 * 部署在家長自己的 Google 帳號底下，進度存在自己的 Google 雲端硬碟：
 *   我的雲端硬碟／明星總動員存檔／progress.json
 *   我的雲端硬碟／明星總動員存檔／舊版本／（最近 30 份，可手動回復）
 *
 * 部署步驟見同資料夾的 README.md。
 * 唯一要改的是下面這行：家庭密碼（8 碼以上，英數混合）。
 */
const FAMILY_PASS = '請改成你的家庭密碼';

const FOLDER = '明星總動員存檔';
const OLD_FOLDER = '舊版本';
const KEEP = 30;          // 舊版本保留幾份
const MAX_FAILS = 10;     // 10 分鐘內密碼錯幾次就暫停
const MAX_BYTES = 2e6;    // 存檔上限 2 MB

function doGet(e) {
  return run(e && e.parameter ? e.parameter : {});
}

// 網頁端用 Content-Type: text/plain 送 JSON（避免瀏覽器的 CORS 預檢）
function doPost(e) {
  let q = {};
  try { q = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, err: 'badjson' }); }
  return run(q);
}

function run(q) {
  try {
    return out(handle(q));
  } catch (err) {
    return out({ ok: false, err: 'server', msg: String(err && err.message || err) });
  }
}

function handle(q) {
  if (FAMILY_PASS.indexOf('請改成') === 0 || FAMILY_PASS.length < 8) return { ok: false, err: 'nopass' };
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('fails') || 0);
  if (fails >= MAX_FAILS) return { ok: false, err: 'locked' };
  if (q.key !== FAMILY_PASS) {
    cache.put('fails', String(fails + 1), 600);
    return { ok: false, err: 'key' };
  }

  const op = q.op;
  if (op === 'ping') return { ok: true, t: Date.now() };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const slot = q.slot === 'test' ? 'sync-test.json' : 'progress.json';
    const folder = getFolder(FOLDER, DriveApp.getRootFolder());

    if (op === 'load') {
      const f = findFile(folder, slot);
      if (!f) return { ok: true, data: null, t: 0 };
      return { ok: true, data: f.getBlob().getDataAsString('UTF-8'), t: f.getLastUpdated().getTime() };
    }

    if (op === 'save') {
      const text = typeof q.data === 'string' ? q.data : JSON.stringify(q.data);
      if (!text || text.length > MAX_BYTES) return { ok: false, err: 'size' };
      const f = findFile(folder, slot);
      if (f) {
        if (slot === 'progress.json') keepOld(folder, f, q.dev);
        f.setContent(text);
      } else {
        folder.createFile(slot, text, 'application/json');
      }
      return { ok: true, t: Date.now() };
    }

    if (op === 'remove') {
      const f = findFile(folder, slot);
      if (f) f.setTrashed(true);
      return { ok: true };
    }

    return { ok: false, err: 'op' };
  } finally {
    lock.releaseLock();
  }
}

// 覆蓋前先把舊的複製一份到「舊版本」，只留最近 KEEP 份
function keepOld(folder, file, dev) {
  const old = getFolder(OLD_FOLDER, folder);
  const stamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd-HHmmss');
  const tag = String(dev || '').replace(/[^\w一-鿿-]/g, '').slice(0, 20);
  file.makeCopy('progress-' + stamp + (tag ? '-' + tag : '') + '.json', old);
  const all = [];
  const it = old.getFiles();
  while (it.hasNext()) all.push(it.next());
  all.sort((a, b) => b.getName() < a.getName() ? -1 : 1);
  all.slice(KEEP).forEach((f) => f.setTrashed(true));
}

function getFolder(name, parent) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function findFile(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 部署前可在編輯器裡選這個函式按「執行」，用來觸發一次授權並建立資料夾
function setup() {
  const folder = getFolder(FOLDER, DriveApp.getRootFolder());
  getFolder(OLD_FOLDER, folder);
  Logger.log('資料夾已就緒：' + folder.getUrl());
}

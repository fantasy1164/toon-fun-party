// 進入點：畫面縮放、開場、選人、進場景、角色下班與睡覺時間。
import { STAGE_W, STAGE_H } from './config.js';
import { state, save, addPlayTime } from './core/store.js';
import { isAsleep, testing, dateKey, hour, testSettings } from './core/clock.js';
import { unlock, sfx } from './core/audio.js';
import { loadVoiceManifest, hush, primeTts } from './core/voice.js';
import { showSplash, showProfiles, showClosed } from './ui/screens.js';
import { openParent } from './ui/parent.js';
import { mountBathroom } from './scenes/bathroom.js';
import { mountDoor } from './scenes/door.js';
import { mountKitchen } from './scenes/kitchen.js';
import { showHub } from './ui/hub.js';
import { treeScreen, christmasMorning } from './ui/xmas.js';
import * as fest from './core/festival.js';
import { pickStamp, stampSession } from './ui/stamps.js';
import * as weather from './core/weather.js';

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
// 測試用：?session=1 把每次遊玩時間改成 1 分鐘
const sessionOverride = params.has('session') ? parseFloat(params.get('session')) : null;
const sessionMs = () => (testSettings().nolimit ? Infinity : (sessionOverride ?? state.settings.sessionMin) * 60000);

// ---------- 畫面縮放 ----------
function fit() {
  const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  stage.style.setProperty('--s', s.toFixed(4));
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));
fit();

// ---------- 防止 iPad 的縮放、捲動、長按選單 ----------
const inParent = (e) => e.target.closest?.('.parent');
document.addEventListener('touchmove', (e) => { if (!inParent(e)) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('pointerdown', unlock);
// iOS 只把「放開手指／點擊」當成使用者操作，聲音與語音都要在這些事件裡啟動
['touchend', 'pointerup', 'click'].forEach((t) => document.addEventListener(t, () => { unlock(); primeTts(); }, true));

// ---------- 流程 ----------
let scene = null;
let profile = null;
let closedTimer = null;

function closedReason() {
  if (isAsleep(state.settings)) return 'bedtime';
  if (state.session.restUntil > Date.now()) return 'rest';
  return null;
}

function leaveScene() {
  scene?.destroy();
  scene = null;
  profile = null;
}

function parentGate() {
  hush();
  openParent(() => route(), {
    // 家長選好原因後，把畫面交給小孩自己蓋章
    async onStamp(id, reasons) {
      clearInterval(closedTimer);
      if (!state.profiles[id].stamp) await pickStamp(stage, id);
      await stampSession(stage, id, reasons);
      route();
    },
  });
}

async function route() {
  clearInterval(closedTimer);
  leaveScene();
  const reason = closedReason();
  if (reason) {
    showClosed(stage, { reason, onParent: parentGate });
    // 休息結束或天亮後自動回到選人畫面
    closedTimer = setInterval(() => { if (!closedReason() && !document.querySelector('.parent')) route(); }, 5000);
    return;
  }
  const chosen = await showProfiles(stage, { onParent: parentGate });
  if (closedReason()) { route(); return; }
  // 還沒有印章，或上一張卡集滿可以換印章：先挑印章
  for (const id of chosen.members) {
    const p = state.profiles[id];
    if (!p.stamp || p.repick) await pickStamp(stage, id);
  }
  profile = chosen;
  goHub();
}

// 選房間，再進場景；從場景按回家會回到選房間
async function goHub() {
  if (!profile) { route(); return; }
  if (closedReason()) { route(); return; }
  // 聖誕節當天：還沒拆禮物的先拆禮物
  if (fest.isChristmas() && profile.members.some((id) => !fest.xmas().gift[id])) {
    await christmasMorning(stage, profile);
  }
  const room = await showHub(stage, profile);
  if (room === 'back') { profile = null; route(); return; }
  if (room === 'tree') { await treeScreen(stage, profile); goHub(); return; }
  if (closedReason()) { route(); return; }
  const mount = { door: mountDoor, kitchen: mountKitchen }[room] || mountBathroom;
  scene = mount(stage, {
    profile,
    onExit: (why) => {
      scene = null;
      if (why === 'home') goHub(); else route();
    },
  });
}

// 每秒累計遊玩時間；時間到或睡覺時間到，請角色道別
setInterval(() => {
  if (!scene || !profile || document.hidden) return;
  addPlayTime(profile.members, 1000);
  if (state.session.usedMs % 10000 === 0) save();
  if (state.session.usedMs >= sessionMs() || isAsleep(state.settings)) scene.requestEnd();
}, 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

function testBadge() {
  if (!testing) return;
  const b = document.createElement('div');
  b.id = 'testbadge';
  const h = hour();
  const t = testSettings();
  b.textContent = `測試 ${dateKey()} ${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}${t.weather ? ' ' + t.weather : ''}`;
  document.body.appendChild(b);
}

async function boot() {
  testBadge();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  loadVoiceManifest();
  weather.refresh();
  setInterval(() => weather.refresh(), 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) weather.refresh(); });
  await showSplash(stage);
  unlock();
  primeTts();
  sfx('fanfare');
  route();
}
boot();

// 進入點：畫面縮放、開場、選人、進場景、角色下班與睡覺時間。
import { STAGE_W, STAGE_H } from './config.js';
import { state, save, addPlayTime } from './core/store.js';
import { isAsleep } from './core/clock.js';
import { unlock, sfx } from './core/audio.js';
import { loadVoiceManifest, hush, primeTts } from './core/voice.js';
import { showSplash, showProfiles, showClosed } from './ui/screens.js';
import { openParent } from './ui/parent.js';
import { mountBathroom } from './scenes/bathroom.js';

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
// 測試用：?session=1 把每次遊玩時間改成 1 分鐘
const sessionOverride = params.has('session') ? parseFloat(params.get('session')) : null;
const sessionMs = () => (sessionOverride ?? state.settings.sessionMin) * 60000;

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
  openParent(() => route());
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
  profile = chosen;
  scene = mountBathroom(stage, {
    profile,
    onExit: () => route(),
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

async function boot() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  loadVoiceManifest();
  await showSplash(stage);
  unlock();
  primeTts();
  sfx('fanfare');
  route();
}
boot();

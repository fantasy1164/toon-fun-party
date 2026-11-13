// 進入點：畫面縮放、開場、選人、進場景、角色下班與睡覺時間。
import { STAGE_W, STAGE_H } from './config.js';
import { state, save, addPlayTime } from './core/store.js';
import { isAsleep, testing, dateKey, hour, testSettings } from './core/clock.js';
import { unlock, sfx } from './core/audio.js';
import { loadVoiceManifest, hush, primeTts, speak, isSpeaking, quietFor } from './core/voice.js';
import { showSplash, showProfiles, showClosed } from './ui/screens.js';
import { openParent } from './ui/parent.js';
import { mountBathroom } from './scenes/bathroom.js';
import { mountDoor } from './scenes/door.js';
import { mountKitchen } from './scenes/kitchen.js';
import { mountBedroom } from './scenes/bedroom.js';
import { mountCar } from './scenes/car.js';
import { mountSchool } from './scenes/school.js';
import { mountFarm } from './scenes/farm.js';
import { mountParty } from './scenes/party.js';
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
  const mount = { door: mountDoor, kitchen: mountKitchen, bedroom: mountBedroom, car: mountCar, school: mountSchool, farm: mountFarm, party: mountParty }[room] || mountBathroom;
  if (state.session.usedMs === 0) warned = false;
  scene = mount(stage, {
    profile,
    onExit: (why) => {
      scene = null;
      stage.querySelector('.playclock')?.remove();
      if (why === 'home') goHub(); else route();
    },
  });
  updateClock();
}

// ---------- 剩餘遊玩時間：場景右上角的小時鐘餅 ----------
const C_SMALL = 2 * Math.PI * 25;
function playClock() {
  let n = stage.querySelector('.playclock');
  if (!n) {
    n = document.createElement('div');
    n.className = 'playclock';
    n.innerHTML = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" opacity=".9"/>
      <circle class="pie" cx="50" cy="50" r="25" fill="none" stroke="#ffb300" stroke-width="50" transform="rotate(-90 50 50)"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#e0a800" stroke-width="4"/><circle cx="50" cy="50" r="5" fill="#7a5230"/></svg>`;
    stage.appendChild(n);
  }
  return n;
}
let warned = false;
function updateClock() {
  if (!scene) return;
  const total = sessionMs();
  const n = playClock();
  if (!Number.isFinite(total)) { n.classList.add('hidden'); return; }
  const left = Math.max(0, 1 - state.session.usedMs / total);
  n.classList.remove('hidden');
  n.querySelector('.pie').setAttribute('stroke-dasharray', `${(C_SMALL * left).toFixed(1)} ${C_SMALL.toFixed(1)}`);
  const leftMs = total - state.session.usedMs;
  n.classList.toggle('soon', leftMs <= 120000);
  // 剩 2 分鐘：等角色說完話，再提醒一次
  if (!warned && leftMs <= 120000 && leftMs > 0 && !isSpeaking() && quietFor() > 800 && scene.hostChar) {
    warned = true;
    speak(scene.hostChar, 'time_soon');
  }
}

// ---------- 手指提示：停下來 8 秒沒動作，就指出現在發亮的東西 ----------
let lastTouch = Date.now();
document.addEventListener('pointerdown', () => {
  lastTouch = Date.now();
  stage.querySelector('.hint-hand')?.remove();
}, true);
const HAND = `<svg viewBox="0 0 100 120" width="110" height="132"><path d="M38 60V18a9 9 0 0 1 18 0V52l4-2a9 9 0 0 1 9 2l2-1a9 9 0 0 1 11 4a9 9 0 0 1 10 8V86Q92 112 64 114H52Q36 112 28 96L14 70a9 9 0 0 1 14-10Z" fill="#fff" stroke="#7a5230" stroke-width="5" stroke-linejoin="round"/></svg>`;
function hintTick() {
  if (!scene || stage.querySelector('.hint-hand, .cabinet, .parent, .gift, .storybook')) return;
  if (Date.now() - lastTouch < 8000 || quietFor() < 2500) return;
  const target = ['.glow-char', '.prop.glow', '.spot.glow', '.toy.glow', '.glow']
    .map((q) => [...stage.querySelectorAll(q)].find((e) => e.getBoundingClientRect().width > 0))
    .find(Boolean);
  if (!target) return;
  const sr = stage.getBoundingClientRect();
  const k = sr.width / 1200;
  const r = target.getBoundingClientRect();
  const x = (r.left - sr.left + r.width / 2) / k;
  const y = (r.top - sr.top + r.height / 2) / k;
  const h = document.createElement('div');
  h.className = 'hint-hand';
  h.style.left = `${x - 40}px`;
  h.style.top = `${y - 10}px`;
  h.innerHTML = HAND;
  stage.appendChild(h);
  lastTouch = Date.now();  // 出現一次後，再等 8 秒才會再出現
  setTimeout(() => h.remove(), 4000);
}

// 每秒累計遊玩時間；時間到或睡覺時間到，請角色道別
setInterval(() => {
  if (!scene || !profile || document.hidden) return;
  addPlayTime(profile.members, 1000);
  if (state.session.usedMs % 10000 === 0) save();
  updateClock();
  hintTick();
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

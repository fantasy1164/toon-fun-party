// 進入點：畫面縮放、開場、選人、進場景、角色下班與睡覺時間。
import { STAGE_W, STAGE_H, PROFILES } from './config.js';
import { state, save, addPlayTime } from './core/store.js';
import { isAsleep, testing, dateKey, hour, testSettings } from './core/clock.js';
import { unlock, sfx, setMusicVolume } from './core/audio.js';
import { loadVoiceManifest, hush, primeTts, speak, isSpeaking, quietFor } from './core/voice.js';
import { setupBleed } from './core/bleed.js';
import { showSplash, showProfiles, showClosed } from './ui/screens.js';
import { openParent } from './ui/parent.js';
import { needInstallGuide, showInstallGuide } from './ui/install.js';
import { mountBathroom } from './scenes/bathroom.js';
import { mountDoor } from './scenes/door.js';
import { mountKitchen } from './scenes/kitchen.js';
import { mountBedroom } from './scenes/bedroom.js';
import { mountCar } from './scenes/car.js';
import { mountSchool } from './scenes/school.js';
import { mountFarm } from './scenes/farm.js';
import { mountPark } from './scenes/park.js';
import { mountParty } from './scenes/party.js';
import { mountNewYear } from './scenes/newyear.js';
import { showHub } from './ui/hub.js';
import { showMap } from './ui/map.js';
import { mountHall } from './scenes/hall.js';
import { mountClinic } from './scenes/clinic.js';
import { mountMarket } from './scenes/market.js';
import { mountAmuse } from './scenes/amuse.js';
import { mountBus, mountTrain } from './scenes/transit.js';
import { mountFire } from './scenes/fire.js';
import { mountDental } from './scenes/dental.js';
import { mountLibrary } from './scenes/library.js';
import { mountHike } from './scenes/hike.js';
import { mountZoo } from './scenes/zoo.js';
import { mountSnack } from './scenes/snack.js';
import { mountGift } from './scenes/gift.js';
import { mountCruise } from './scenes/cruise.js';
import { chooseMode, mountTogether } from './scenes/together.js';
import { mountEnglish, englishOpen } from './scenes/english.js';
import { setupTurns, turnsScene } from './core/turns.js';
import { treeScreen, christmasMorning } from './ui/xmas.js';
import * as fest from './core/festival.js';
import { pickStamp, stampSession } from './ui/stamps.js';
import * as weather from './core/weather.js';
import { syncNow, setupSync } from './core/sync.js';
import { requestTilt, setupStageCamera } from './core/camera.js';

setMusicVolume(state.settings.musicVol);

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
// 測試用：?session=1 把每次遊玩時間改成 1 分鐘
const sessionOverride = params.has('session') ? parseFloat(params.get('session')) : null;
const sessionMs = () => (testSettings().nolimit ? Infinity : (sessionOverride ?? state.settings.sessionMin) * 60000);

// ---------- 畫面縮放 ----------
function fit() {
  const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  stage.style.setProperty('--s', s.toFixed(4));
  // 比 4:3 寬的螢幕：左右各多出來多少（舞台座標），背景延伸過去填滿
  const bleed = Math.max(0, Math.ceil((window.innerWidth / s - STAGE_W) / 2) + 2);
  document.documentElement.style.setProperty('--bleed', `${bleed}px`);
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));
fit();
setupBleed(stage);
setupStageCamera(stage);

// ---------- 防止 iPad 的縮放、捲動、長按選單 ----------
const inParent = (e) => e.target.closest?.('.parent, .install');
document.addEventListener('touchmove', (e) => { if (!inParent(e)) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('pointerdown', unlock);
// iOS 只把「放開手指／點擊」當成使用者操作，聲音與語音都要在這些事件裡啟動
// 第一次點螢幕：解鎖聲音、問能不能用陀螺儀（立體感的傾斜視差；iOS 要在點擊當下問）
['touchend', 'pointerup', 'click'].forEach((t) => document.addEventListener(t, () => { unlock(); primeTts(); requestTilt(); }, true));

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
  setupTurns(null);
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
    // 晚上 20:00–21:30：睡覺或休息畫面也可以進去複習英文
    const en = englishOpen();
    showClosed(stage, { reason, onParent: parentGate, onEnglish: en ? startEnglish : null });
    // 休息結束、天亮或英文時間開始／結束，自動重畫
    closedTimer = setInterval(() => {
      if (document.querySelector('.parent')) return;
      if (!closedReason() || englishOpen() !== en) route();
    }, 5000);
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
  setupTurns(profile);
  zone = 'city';
  goMap();
}

// 地圖 → 家（房子）或其他地方 → 場景；從場景按回家，回到剛才的地方（房子或地圖）
let zone = 'city';   // 現在在哪一張地圖
async function goMap() {
  if (!profile) { route(); return; }
  if (closedReason()) { route(); return; }
  // 聖誕節當天：還沒拆禮物的先拆禮物
  if (fest.isChristmas() && profile.members.some((id) => !fest.xmas().gift[id])) {
    await christmasMorning(stage, profile);
  }
  const r = await showMap(stage, profile, zone);
  if (r.room === 'back') { profile = null; route(); return; }
  if (closedReason()) { route(); return; }
  if (r.room === 'home') { goHouse(); return; }
  if (r.room === 'zone') {
    if (r.trip) { startTrain(r.zone); return; }
    zone = r.zone;
    goMap();
    return;
  }
  if (r.room === 'trip') { startTrip(r.dest, r.by); return; }
  if (r.room === 'ship') { startShip(); return; }
  enterRoom(r.room, 'map');
}

async function goHouse() {
  if (!profile) { route(); return; }
  if (closedReason()) { route(); return; }
  const room = await showHub(stage, profile);
  if (room === 'back') { goMap(); return; }
  if (room === 'tree') { await treeScreen(stage, profile); goHouse(); return; }
  if (closedReason()) { route(); return; }
  enterRoom(room, 'house');
}
const goBack = (from) => (from === 'house' ? goHouse() : goMap());

// 歡樂島：8 個展示區、遊園車、美食街、紀念品店
const zooArea = (area) => (stage2, opts) => mountZoo(stage2, { ...opts, area });
const ZOO_MOUNT = Object.fromEntries(['kids', 'taiwan', 'rain', 'africa', 'desert', 'aus', 'penguin', 'panda'].map((a) => [a, zooArea(a)]));
const MOUNT = { ...ZOO_MOUNT, tram: (stage2, opts) => mountZoo(stage2, { ...opts, tour: true }), snack: mountSnack, gift: mountGift, door: mountDoor, kitchen: mountKitchen, bedroom: mountBedroom, car: mountCar, school: mountSchool, farm: mountFarm, park: mountPark, party: mountParty, newyear: mountNewYear, theater: mountHall, clinic: mountClinic, market: mountMarket, amuse: mountAmuse, fire: mountFire, dental: mountDental, library: mountLibrary, trail: mountHike };

function startScene(make) {
  if (state.session.usedMs === 0) warned = false;
  scene = make();
  // 一起玩：每個場景都放兩個頭像、輪流（誰先開始每次換）
  turnsScene(stage.querySelector('.screen'));
  updateClock();
}
function sceneExit(from) {
  return (why) => {
    scene = null;
    stage.querySelector('.playclock')?.remove();
    if (why === 'home') goBack(from); else route();
  };
}

// 英文複習：從睡覺／休息畫面進去，兩個人照星期幾的順序聽
function startEnglish() {
  clearInterval(closedTimer);
  hush();
  profile = PROFILES.both;
  scene = mountEnglish(stage, { profile, onExit: () => { scene = null; profile = null; route(); } });
}

async function enterRoom(room, from) {
  // 先選：玩遊戲，還是跟角色一起做
  const choice = await chooseMode(stage, room, profile);
  if (choice.mode === 'home') { goBack(from); return; }
  if (closedReason()) { route(); return; }
  const mount = MOUNT[room] || mountBathroom;
  const onExit = sceneExit(from);
  // 英文複習自己排順序（不用輪流頭像）
  if (choice.kind === 'english') { scene = mountEnglish(stage, { profile, onExit }); return; }
  startScene(() => (choice.mode === 'together' && choice.kind !== 'brush'
    ? mountTogether(stage, { profile, onExit, kind: choice.kind, host: choice.host })
    : mount(stage, { profile, onExit, charId: choice.host, together: choice.kind === 'brush' })));
}

// 地圖上遠的地方：生活區坐公車、郊區坐噗噗的車；到了直接進那個地方
function startTrip(dest, by = 'car') {
  const exitHome = sceneExit('map');
  const mount = by === 'bus' ? mountBus : mountCar;
  startScene(() => mount(stage, {
    profile, dest, trip: true,
    onExit: (why) => {
      if (why !== 'arrive') { exitHome(why); return; }
      scene = null;
      stage.querySelector('.playclock')?.remove();
      if (closedReason()) { route(); return; }
      enterRoom(dest, 'map');
    },
  }));
}

// 坐郵輪去歡樂島：到了換成島的地圖
function startShip() {
  const exitHome = sceneExit('map');
  startScene(() => mountCruise(stage, {
    profile,
    onExit: (why) => {
      scene = null;
      stage.querySelector('.playclock')?.remove();
      if (why === 'arrive') zone = 'island';
      if (why === 'arrive' || why === 'home') { if (closedReason()) route(); else goMap(); return; }
      exitHome(why);
    },
  }));
}

// 坐火車去別的區：到站後換那一區的地圖
function startTrain(to) {
  const exitHome = sceneExit('map');
  startScene(() => mountTrain(stage, {
    profile, from: zone, to,
    onExit: (why) => {
      scene = null;
      stage.querySelector('.playclock')?.remove();
      if (why === 'arrive') zone = to;
      if (why === 'arrive' || why === 'home') { if (closedReason()) route(); else goMap(); return; }
      exitHome(why);
    },
  }));
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
  if (!Number.isFinite(total) || scene.noClock) { n.classList.add('hidden'); return; }
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
    .map((q) => [...stage.querySelectorAll(q)].find((e) => !e.closest('.bleed') && e.getBoundingClientRect().width > 0))
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
  // 一起做是在真實生活裡做事：不算遊玩時間、不提示、也不會被下班打斷
  if (scene.noClock) { updateClock(); return; }
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
  // 雲端進度：開機就去抓，最多等 6 秒（沒網路就先用這台的，之後再合併）
  const synced = syncNow({ timeout: 6000 });
  // 離開很久再回來，別台玩過的話重新開始，載入最新進度
  setupSync({ onReplaced: () => location.reload() });
  weather.refresh();
  setInterval(() => weather.refresh(), 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) weather.refresh(); });
  // 用一般瀏覽器打開：先教爸媽加到主畫面
  if (needInstallGuide()) await showInstallGuide();
  await showSplash(stage);
  unlock();      // 要在點擊的當下解鎖聲音，所以等雲端放在後面
  primeTts();
  await synced;
  route();
}
boot();

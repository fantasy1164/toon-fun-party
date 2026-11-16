// 遊戲進度：存在這台裝置的 localStorage；有設定雲端同步時，由 sync.js 另外上傳到家長的 Google 雲端硬碟。
import { DEFAULT_SETTINGS, CARD_SIZE } from '../config.js';
import { dateKey } from './clock.js';

const KEY = 'toon-fun-party';

function blankProfile() {
  // stamp：選好的印章 { shape, color }；card：目前這張卡上的章；log：所有蓋章紀錄
  // owed：集滿但家長還沒發的獎品數；repick：下次進來可以換印章圖案
  // friends：跟每位角色一起做了幾次（好朋友星星）；habits：每種一起做累計幾次（小明星徽章）
  // partyDue：集滿印章、還沒在明星劇場開派對的次數；starSeen：已經看過好朋友表演的角色
  return { collection: {}, claims: {}, playMs: {}, stamp: null, card: [], log: [], owed: 0, cardsDone: 0, repick: false, shelf: [], friends: {}, habits: {}, partyDue: 0, starSeen: {} };
}

function blank() {
  return {
    v: 1,
    profiles: { yh: blankProfile(), xz: blankProfile() },
    session: { usedMs: 0, restUntil: 0 },
    settings: { ...DEFAULT_SETTINGS },
  };
}

let rawAtLoad = null;

function normalize(s) {
  const b = blank();
  return {
    ...b, ...s,
    profiles: {
      yh: { ...blankProfile(), ...(s.profiles?.yh || {}) },
      xz: { ...blankProfile(), ...(s.profiles?.xz || {}) },
    },
    session: { ...b.session, ...(s.session || {}) },
    settings: { ...b.settings, ...(s.settings || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    rawAtLoad = raw;
    if (!raw) return blank();
    return normalize(JSON.parse(raw));
  } catch {
    return blank();
  }
}

export const state = load();

// 印章卡從 10／5 格改成 20 格：舊卡如果已經集滿（獎品已記在 owed），就從新卡開始，避免同一批章算兩次
function migrate() {
  for (const id of ['yh', 'xz']) {
    const p = state.profiles[id];
    if (p.cardV !== 2) {
      if (p.card.length >= { yh: 10, xz: 5 }[id]) p.card = [];
      p.cardV = 2;
    }
  }
}
migrate();

// ---------- 雲端同步用 ----------
// 存檔後通知 sync.js（有變更要上傳）
const savedHooks = [];
export function onSaved(fn) { savedHooks.push(fn); }

// 雲端同步的狀態（sync.js 讀寫）；清除、回復、還原後要讓雲端改成以這台為準
export const SYNC_META_KEY = 'tfp-sync-meta';
export const SYNC_CFG_KEY = 'tfp-sync';
function forceCloudFromHere() {
  let m = {};
  try { m = JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}') || {}; } catch { m = {}; }
  localStorage.setItem(SYNC_META_KEY, JSON.stringify({ ...m, force: true, dirty: true, at: Date.now() }));
}

// 用另一份進度（雲端的或合併後的）取代目前的進度。
// 保留原本的物件，只換內容：場景裡拿著 state.profiles.yh 的程式也會看到新資料。
export function replaceState(next) {
  const n = normalize(next);
  for (const k of Object.keys(state)) if (!(k in n)) delete state[k];
  for (const [k, v] of Object.entries(n)) {
    if (k === 'profiles') {
      for (const id of Object.keys(v)) {
        const p = state.profiles[id] || (state.profiles[id] = {});
        for (const pk of Object.keys(p)) if (!(pk in v[id])) delete p[pk];
        Object.assign(p, v[id]);
      }
    } else {
      state[k] = v;
    }
  }
  migrate();
  if (frozen) return;
  try {
    snapshotIfNeeded();
    const json = JSON.stringify(state);
    localStorage.setItem(KEY, json);
    lastSaved = json;
  } catch { /* 忽略 */ }
}

// ---------- 每日快照：每天第一次存檔前，先把「今天開始時」的進度存一份，保留 35 天 ----------
const SNAP_KEY = 'tfp-snaps';
let frozen = false;               // 清除或回復後、重新載入前，不再存檔
let lastSaved = JSON.stringify(state);   // 用整理過的進度比較，載入後沒改就不算有變更

function realDayKey(t = Date.now()) {
  const d = new Date(t);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function readSnaps() {
  try { return JSON.parse(localStorage.getItem(SNAP_KEY) || '{}'); } catch { return {}; }
}
function writeSnaps(snaps) {
  const keys = Object.keys(snaps).sort();
  for (const k of keys.slice(0, -35)) delete snaps[k];
  try { localStorage.setItem(SNAP_KEY, JSON.stringify(snaps)); } catch { /* 空間不夠就算了 */ }
}
function snapshotIfNeeded() {
  const snaps = readSnaps();
  const k = realDayKey();
  if (snaps[k]) return;
  snaps[k] = lastSaved;
  writeSnaps(snaps);
}
snapshotIfNeeded();

export function save() {
  if (frozen) return;
  try {
    snapshotIfNeeded();
    const json = JSON.stringify(state);
    if (json === lastSaved) return;   // 沒有變（例如離開 app 時的存檔）：不用通知雲端
    localStorage.setItem(KEY, json);
    lastSaved = json;
  } catch { return; /* 存不進去就算了，不要讓遊戲中斷 */ }
  for (const fn of savedHooks) { try { fn(); } catch { /* 忽略 */ } }
}

export function snapshotDays() {
  return Object.keys(readSnaps()).sort();
}

// 回到 n 天前那一天開始時的進度（0＝今天一開始）。設定保留目前的。回傳實際回到的日期。
export function restoreDaysAgo(n) {
  const snaps = readSnaps();
  const keys = Object.keys(snaps).sort();
  if (!keys.length) return null;
  const target = realDayKey(Date.now() - n * 86400000);
  const k = keys.filter((x) => x <= target).pop() || keys[0];
  const s = JSON.parse(snaps[k]);
  s.settings = state.settings;
  s.session = { usedMs: 0, restUntil: 0 };
  const json = JSON.stringify(s);
  frozen = true;
  localStorage.setItem(KEY, json);
  for (const x of keys) if (x > k) delete snaps[x];
  snaps[realDayKey()] = json;
  writeSnaps(snaps);
  forceCloudFromHere();
  return k;
}

// 全部清除，回到第一次打開的狀態。雲端同步的連線設定保留，雲端進度也會改成清除後的樣子。
export function clearAll() {
  frozen = true;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  keys.filter((k) => (k === KEY || k.startsWith('tfp-')) && k !== SYNC_CFG_KEY && k !== SYNC_META_KEY).forEach((k) => localStorage.removeItem(k));
  forceCloudFromHere();
}

export function addPlayTime(memberIds, ms) {
  const k = dateKey();
  for (const id of memberIds) {
    const p = state.profiles[id];
    p.playMs[k] = (p.playMs[k] || 0) + ms;
  }
  state.session.usedMs += ms;
}

export function hasClaimed(id, claimKey) {
  return !!state.profiles[id].claims[dateKey()]?.[claimKey];
}

export function claim(id, claimKey) {
  const p = state.profiles[id];
  const k = dateKey();
  p.claims[k] = p.claims[k] || {};
  p.claims[k][claimKey] = true;
  // 只留最近 14 天的紀錄
  for (const day of Object.keys(p.claims).sort().slice(0, -14)) delete p.claims[day];
  for (const day of Object.keys(p.playMs).sort().slice(0, -14)) delete p.playMs[day];
}

export function addItem(id, itemId) {
  const c = state.profiles[id].collection;
  c[itemId] = (c[itemId] || 0) + 1;
}

// ---------- 好寶寶印章 ----------
export function setStamp(id, shape, color) {
  const p = state.profiles[id];
  p.stamp = { shape, color };
  p.repick = false;
  save();
}

export function stampedToday(id) {
  const k = dateKey();
  return state.profiles[id].log.some((e) => e.d === k);
}

export function cardInfo(id) {
  const p = state.profiles[id];
  const size = CARD_SIZE[id];
  // 上一張集滿後，下一次蓋章時才換新卡，所以集滿的卡在那之前還看得到
  return { size, stamps: p.card, full: p.card.length >= size };
}

// 蓋一個章。回傳這次是否剛好集滿。
export function addStamp(id, reasons) {
  const p = state.profiles[id];
  const size = CARD_SIZE[id];
  if (p.card.length >= size) p.card = [];
  const entry = { d: dateKey(), r: reasons, s: p.stamp?.shape, c: p.stamp?.color, rot: Math.round(Math.random() * 30 - 15) };
  p.card.push(entry);
  p.log.push({ d: entry.d, r: reasons });
  const full = p.card.length >= size;
  if (full) { p.owed += 1; p.cardsDone += 1; p.repick = true; p.partyDue = (p.partyDue || 0) + 1; }
  save();
  return full;
}

// 完成一次「一起做」（或地震演習）：累計習慣次數，陪的角色多一顆好朋友星星
export function recordHabit(ids, kind, charId = null) {
  for (const id of ids) {
    const p = state.profiles[id];
    p.habits[kind] = (p.habits[kind] || 0) + 1;
    if (charId) p.friends[charId] = (p.friends[charId] || 0) + 1;
  }
  save();
}

export function redeem(id) {
  const p = state.profiles[id];
  p.owed = Math.max(0, p.owed - 1);
  save();
}

// 陳列櫃：每格放一種收藏品（null 是空格）。新拿到的放進第一個空格。
export const SHELF_COLS = 5;
export function shelfLayout(id) {
  const p = state.profiles[id];
  const owned = Object.keys(p.collection).filter((k) => p.collection[k] > 0);
  let shelf = (p.shelf || []).map((k) => (k && owned.includes(k) ? k : null));
  for (const k of owned) {
    if (shelf.includes(k)) continue;
    const i = shelf.indexOf(null);
    if (i >= 0) shelf[i] = k; else shelf.push(k);
  }
  // 至少 3 層，東西多了再加一層，永遠留一點空位
  const need = Math.max(3, Math.ceil((owned.length + 1) / SHELF_COLS)) * SHELF_COLS;
  while (shelf.length > need && shelf[shelf.length - 1] === null) shelf.pop();
  while (shelf.length < need || shelf.length % SHELF_COLS) shelf.push(null);
  p.shelf = shelf;
  return shelf;
}
export function swapShelf(id, a, b) {
  const s = state.profiles[id].shelf;
  [s[a], s[b]] = [s[b], s[a]];
  save();
}

export function exportData() {
  return JSON.stringify(state);
}

export function importData(text) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || !s.profiles) throw new Error('bad data');
  frozen = true;  // 避免重新載入前，舊進度又被存回去
  localStorage.setItem(KEY, JSON.stringify(s));
  forceCloudFromHere();
}

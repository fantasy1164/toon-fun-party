// 遊戲進度：全部存在這台裝置的 localStorage。
import { DEFAULT_SETTINGS, CARD_SIZE } from '../config.js';
import { dateKey } from './clock.js';

const KEY = 'toon-fun-party';

function blankProfile() {
  // stamp：選好的印章 { shape, color }；card：目前這張卡上的章；log：所有蓋章紀錄
  // owed：集滿但家長還沒發的獎品數；repick：下次進來可以換印章圖案
  return { collection: {}, claims: {}, playMs: {}, stamp: null, card: [], log: [], owed: 0, cardsDone: 0, repick: false, shelf: [] };
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

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    rawAtLoad = raw;
    if (!raw) return blank();
    const s = JSON.parse(raw);
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
  } catch {
    return blank();
  }
}

export const state = load();

// 印章卡從 10／5 格改成 20 格：舊卡如果已經集滿（獎品已記在 owed），就從新卡開始，避免同一批章算兩次
for (const id of ['yh', 'xz']) {
  const p = state.profiles[id];
  if (p.cardV !== 2) {
    if (p.card.length >= { yh: 10, xz: 5 }[id]) p.card = [];
    p.cardV = 2;
  }
}

// ---------- 每日快照：每天第一次存檔前，先把「今天開始時」的進度存一份，保留 35 天 ----------
const SNAP_KEY = 'tfp-snaps';
let frozen = false;               // 清除或回復後、重新載入前，不再存檔
let lastSaved = rawAtLoad || JSON.stringify(state);

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
    localStorage.setItem(KEY, json);
    lastSaved = json;
  } catch { /* 存不進去就算了，不要讓遊戲中斷 */ }
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
  return k;
}

// 全部清除，回到第一次打開的狀態
export function clearAll() {
  frozen = true;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  keys.filter((k) => k === KEY || k.startsWith('tfp-')).forEach((k) => localStorage.removeItem(k));
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
  if (full) { p.owed += 1; p.cardsDone += 1; p.repick = true; }
  save();
  return full;
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
}

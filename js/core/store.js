// 遊戲進度：全部存在這台裝置的 localStorage。
import { DEFAULT_SETTINGS, CARD_SIZE } from '../config.js';
import { dateKey } from './clock.js';

const KEY = 'toon-fun-party';

function blankProfile() {
  // stamp：選好的印章 { shape, color }；card：目前這張卡上的章；log：所有蓋章紀錄
  // owed：集滿但家長還沒發的獎品數；repick：下次進來可以換印章圖案
  return { collection: {}, claims: {}, playMs: {}, stamp: null, card: [], log: [], owed: 0, cardsDone: 0, repick: false };
}

function blank() {
  return {
    v: 1,
    profiles: { yh: blankProfile(), xz: blankProfile() },
    session: { usedMs: 0, restUntil: 0 },
    settings: { ...DEFAULT_SETTINGS },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
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

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* 存不進去就算了，不要讓遊戲中斷 */ }
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

export function exportData() {
  return JSON.stringify(state);
}

export function importData(text) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || !s.profiles) throw new Error('bad data');
  localStorage.setItem(KEY, JSON.stringify(s));
}

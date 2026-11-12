// 遊戲進度：全部存在這台裝置的 localStorage。
import { DEFAULT_SETTINGS } from '../config.js';
import { dateKey } from './clock.js';

const KEY = 'toon-fun-party';

function blankProfile() {
  return { collection: {}, claims: {}, playMs: {}, stamps: [], stamp: null };
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

export function exportData() {
  return JSON.stringify(state);
}

export function importData(text) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || !s.profiles) throw new Error('bad data');
  localStorage.setItem(KEY, JSON.stringify(s));
}

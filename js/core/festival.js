// 節慶：聖誕節、生日。日期一律用遊戲時鐘（可用 ?date= 測試）。
import { now, hour } from './clock.js';
import { state, save } from './store.js';

function xmasState() {
  const y = now().getFullYear();
  if (!state.xmas || state.xmas.year !== y) {
    state.xmas = { year: y, greeted: {}, opened: { yh: [], xz: [] }, cookies: false, gift: {}, realGift: state.xmas?.realGift ?? true };
  }
  return state.xmas;
}

export function xmas() { return xmasState(); }

export function isDecember() { return now().getMonth() === 11; }
export function day() { return now().getDate(); }
// 降臨月曆：12/1–12/24 可以開，之前錯過的也可以補開
export function adventOpen() { return isDecember() && day() <= 24; }
export function isEve() { return isDecember() && day() === 24 && hour() >= 18; }
export function isChristmas() { return isDecember() && day() === 25; }

export function greet(id) { xmasState().greeted[id] = true; save(); }
export function openDay(id, d) {
  const x = xmasState();
  if (!x.opened[id].includes(d)) x.opened[id].push(d);
  save();
}
export function placeCookies() { xmasState().cookies = true; save(); }
export function openGift(id) { xmasState().gift[id] = true; save(); }
export function setRealGift(v) { xmasState().realGift = v; save(); }
export function resetXmas() {
  const real = state.xmas?.realGift ?? true;
  state.xmas = null;
  xmasState().realGift = real;
  save();
}
// 12 月蓋了幾個章（給印章本動畫用）
export function decemberStamps(id) {
  const ym = `${now().getFullYear()}-12`;
  return state.profiles[id].log.filter((e) => e.d.startsWith(ym));
}

// ---------- 生日 ----------
// 生日存在 state.settings.birthdays = { yh: 'YYYY-MM-DD', xz: 'YYYY-MM-DD' }（只存在這台 iPad）
export function birthday(id) { return state.settings.birthdays?.[id] || ''; }
export function setBirthday(id, v) {
  state.settings.birthdays = { ...(state.settings.birthdays || {}), [id]: v };
  save();
}
// 今天生日的小孩
export function birthdayKids() {
  const d = now();
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return ['yh', 'xz'].filter((id) => birthday(id).slice(5) === md);
}
export function ageOf(id) {
  const b = birthday(id);
  if (!b) return 0;
  return now().getFullYear() - +b.slice(0, 4);
}

// ---------- 過年（農曆春節） ----------
// 初一的國曆日期（查表；之後的年份要再補）
const CNY = {
  2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03',
  2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08',
};
const ZODIAC = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
// 回傳 null 或 { stage, offset, year, zodiac }：offset＝今天距離初一幾天
//   prep：除夕前 7 天到前 2 天（大掃除、貼春聯）；eve：除夕；days：初一到十四（拜年、紅包、煙火）；lantern：元宵節（十五）
export function newYear() {
  const d = now();
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  for (const y of [d.getFullYear(), d.getFullYear() + 1]) {
    const k = CNY[y];
    if (!k) continue;
    const c = Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10));
    const off = Math.round((today - c) / 86400000);
    if (off < -7 || off > 14) continue;
    const stage = off <= -2 ? 'prep' : off === -1 ? 'eve' : off <= 13 ? 'days' : 'lantern';
    return { stage, offset: off, year: y, zodiac: ZODIAC[(y - 4) % 12] };
  }
  return null;
}

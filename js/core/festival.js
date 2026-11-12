// 節慶：目前只有聖誕節。日期一律用遊戲時鐘（可用 ?date= 測試）。
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

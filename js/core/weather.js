// 天氣：Open-Meteo（免金鑰，資料來源 Open-Meteo.com，CC BY 4.0）。
// 30 分鐘更新一次並存起來；沒網路時沿用上一次的結果。
// 測試用：網址加 ?weather=rain（clear / cloudy / rain / storm / fog / hot / cold / windy）
import { state, save } from './store.js';

const CACHE_KEY = 'tfp-weather';
const MAX_AGE = 30 * 60 * 1000;
export const DEFAULT_PLACE = { name: '台中', lat: 24.1477, lon: 120.6736 };

const override = new URLSearchParams(location.search).get('weather');
let cache = null;
try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { cache = null; }

export function place() {
  return state.settings.place || DEFAULT_PLACE;
}

export function setPlace(p) {
  state.settings.place = p;
  save();
  cache = null;
  try { localStorage.removeItem(CACHE_KEY); } catch { /* 忽略 */ }
}

// WMO 天氣代碼 → 遊戲裡的天氣種類
function kindOf(code) {
  if (code >= 95) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 2 || code === 3) return 'cloudy';
  return 'clear';
}

function interpret(c) {
  const feels = c.apparent_temperature ?? c.temperature_2m;
  return {
    kind: kindOf(c.weather_code ?? 0),
    temp: Math.round(c.temperature_2m ?? 0),
    hot: feels >= 31,
    cold: feels <= 14,
    windy: (c.wind_gusts_10m ?? 0) >= 45 || (c.wind_speed_10m ?? 0) >= 30,
    code: c.weather_code,
  };
}

// 目前的天氣（同步，用快取）。沒有資料時當作晴天。
export function current() {
  if (override) {
    return {
      kind: ['rain', 'storm', 'fog', 'cloudy'].includes(override) ? override : 'clear',
      hot: override === 'hot', cold: override === 'cold', windy: override === 'windy', temp: null, fake: true,
    };
  }
  if (!cache?.data) return { kind: 'clear', hot: false, cold: false, windy: false, temp: null, none: true };
  return interpret(cache.data);
}

export function lastUpdated() {
  return cache?.at || 0;
}

export async function refresh(force = false) {
  if (override) return current();
  if (!force && cache?.at && Date.now() - cache.at < MAX_AGE) return current();
  const p = place();
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: p.lat, longitude: p.lon,
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day',
    timezone: 'auto',
  });
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    if (!j.current) throw new Error('no current');
    cache = { at: Date.now(), data: j.current };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* 沒網路就沿用舊資料 */ }
  return current();
}

// 給角色說的那一句天氣提醒（沒有就回傳 null）
export function adviceLine(ph) {
  const w = current();
  if (w.kind === 'storm') return 'w_storm';
  if (ph === 'night') return null;
  if (w.kind === 'rain') return 'w_rain';
  if (w.windy) return 'w_windy';
  if (w.kind === 'fog') return 'w_fog';
  if (w.hot) return 'w_hot';
  if (w.cold) return 'w_cold';
  return null;
}

// 適合出門玩嗎（晴天或多雲、白天、不會太熱太冷、沒有大風）
export function niceOutside(ph) {
  const w = current();
  return (ph === 'day' || ph === 'dawn') && ['clear', 'cloudy'].includes(w.kind) && !w.hot && !w.cold && !w.windy;
}

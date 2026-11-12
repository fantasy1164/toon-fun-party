// 與現實同步的時間。
// 測試用：網址參數 ?hour=20.5、?date=2026-12-24，或家長頁面「開發測試」存在裝置裡的設定（網址優先）。
const params = new URLSearchParams(location.search);
export const TEST_KEY = 'tfp-test';
export function testSettings() {
  try { return JSON.parse(localStorage.getItem(TEST_KEY) || 'null') || {}; } catch { return {}; }
}
const saved = testSettings();
const hourRaw = params.has('hour') ? params.get('hour') : saved.hour;
const hourOverride = hourRaw !== undefined && hourRaw !== null && hourRaw !== '' ? parseFloat(hourRaw) : null;
const dateRaw = params.get('date') || saved.date || '';
const dateOverride = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw.split('-').map(Number) : null;
export const testing = !!(dateOverride || hourOverride !== null || params.get('weather') || saved.weather || saved.nolimit);

export function now() {
  const d = new Date();
  if (dateOverride) d.setFullYear(dateOverride[0], dateOverride[1] - 1, dateOverride[2]);
  if (hourOverride !== null && !Number.isNaN(hourOverride)) {
    d.setHours(Math.floor(hourOverride), Math.round((hourOverride % 1) * 60), 0, 0);
  }
  return d;
}

export function hour() {
  const d = now();
  return d.getHours() + d.getMinutes() / 60;
}

export function dateKey(d = now()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 一天的四個階段，決定天空、光線、音樂。
export function phase(h = hour()) {
  if (h < 5.5 || h >= 19) return 'night';
  if (h < 7) return 'dawn';
  if (h < 17) return 'day';
  return 'dusk';
}

export function isAsleep(settings, h = hour()) {
  return h >= settings.bedtime || h < settings.wake;
}

// 目前落在哪個領獎時段；不在任何時段回傳 null（純練習）。
export function currentSlot(slots, h = hour()) {
  for (const [name, [a, b]] of Object.entries(slots)) {
    if (h >= a && h < b) return name;
  }
  return null;
}

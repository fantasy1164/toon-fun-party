// 與現實同步的時間。測試時可用網址參數 ?hour=20.5 指定小時。
const params = new URLSearchParams(location.search);
const hourOverride = params.has('hour') ? parseFloat(params.get('hour')) : null;
// 測試用：?date=2026-12-24 指定日期
const dateOverride = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date').split('-').map(Number) : null;

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

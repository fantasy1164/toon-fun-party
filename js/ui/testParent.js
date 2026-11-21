// 家長頁「測試」分頁（11/22 John：日期時間設定不好操作 → 改成大按鈕加減、常用時段、情境快捷；時間預設會往前走）
import { state, save } from '../core/store.js';
import { now, dateKey, testSettings, TEST_KEY, testing } from '../core/clock.js';
import { cnyDate, birthday } from '../core/festival.js';
import { drillDay } from './quake.js';
import { EN_END, SEA_SHOWS, ZOO_HOURS } from '../config.js';

export const WX_TEST = [['', '真實'], ['clear', '晴天'], ['cloudy', '多雲'], ['rain', '下雨'], ['storm', '雷雨'], ['fog', '起霧'], ['hot', '很熱'], ['cold', '很冷'], ['windy', '強風']];
const WEEK = '日一二三四五六';
const p2 = (n) => String(n).padStart(2, '0');

// ---------- 日期小工具（都用「真實」的今天當起點） ----------
function realToday() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function key(d) { return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; }
function parse(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = parse(k); d.setDate(d.getDate() + n); return key(d); }
function nextDow(dow) { const d = realToday(); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7)); return key(d); }
function nextWeekday() { const d = realToday(); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return key(d); }
export function dateLabel(k) { const d = parse(k); return `${d.getMonth() + 1}/${d.getDate()}（${WEEK[d.getDay()]}）`; }
export function timeLabel(h) { const m = Math.round(h * 60); return `${Math.floor(m / 60) % 24}:${p2(m % 60)}`; }
const realHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };

// ---------- 草稿（按「套用」才存） ----------
let draft = null;
export function testReset() { draft = null; }
function initDraft() {
  const t = testSettings();
  const n = now();
  draft = {
    date: t.date ? dateKey(n) : null,                              // null＝真實日期
    hour: t.hour !== undefined && t.hour !== null ? n.getHours() + n.getMinutes() / 60 : null, // null＝真實時間
    weather: t.weather || '',
    freeze: !!t.freeze,
    nolimit: !!t.nolimit,
  };
}

function apply(t) {
  const out = { ...t, setAt: Date.now() };
  for (const k of Object.keys(out)) if (out[k] === null || out[k] === '' || out[k] === false) delete out[k];
  if (out.nolimit) { state.session.usedMs = 0; state.session.restUntil = 0; save(); }
  localStorage.setItem(TEST_KEY, JSON.stringify(out));
  location.reload();
}

// ---------- 情境快捷：點了直接套用 ----------
function scenarios() {
  const today = key(realToday());
  const bed = state.settings.bedtime ?? 21;
  const y = realToday().getFullYear();
  const ym = today.slice(0, 7);
  const before = (h) => h - 2 / 60;   // 到點前 2 分鐘
  // 下一個過年（今天還在元宵以前就用今年的）
  let cny = cnyDate(y);
  if (!cny || addDays(cny, 15) < today) cny = cnyDate(y + 1);
  const special = [
    ['地震演習日', `${ym}-${p2(drillDay(ym))}`, 9],
    ...['yh', 'xz'].filter((id) => birthday(id)).map((id) => [`${id === 'yh' ? '妍卉' : '向澤'}生日`, `${y}-${birthday(id).slice(5)}`, 10]),
    ['12/1 早上', `${y}-12-01`, 9],
    ['平安夜晚上', `${y}-12-24`, 19.5],
    ['平安夜睡覺', `${y}-12-24`, 22],
    ['聖誕節早上', `${y}-12-25`, 8],
  ];
  if (cny) special.push(['除夕晚上', addDays(cny, -1), 18], ['初一早上', cny, 9], ['元宵節晚上', addDays(cny, 14), 19]);
  return [
    ['日常時段', [
      ['平日早上出門', nextWeekday(), 7.5],
      ['週末早上（公園、遊樂園）', nextDow(6), 10],
      ['午餐', today, 12],
      ['晚餐', today, 18],
      ['睡前', today, bed - 0.5],
      ['睡覺時間', today, bed + 0.25],
    ]],
    ['到點才發生的事（前 2 分鐘）', [
      [bed === EN_END.warn ? '英文 9 點提醒／角色睡覺' : '英文 9 點提醒', today, before(EN_END.warn)],
      ['觸摸池開放', today, before(SEA_SHOWS.touch[0])],
      ['海生館餵食', today, before(Math.min(SEA_SHOWS.ocean[0], SEA_SHOWS.seal[0]))],
      ['動物園停止入園', today, before(ZOO_HOURS.lastEntry)],
      ['遊樂園閉園', nextDow(6), before(19)],
      ...(bed === EN_END.warn ? [] : [['角色睡覺', today, before(bed)]]),
    ]],
    ['特別的日子', special],
  ];
}

// ---------- 畫面 ----------
function summary() {
  const d = draft.date ? dateLabel(draft.date) : '真實日期';
  const h = draft.hour !== null ? timeLabel(draft.hour) : '真實時間';
  const w = WX_TEST.find((x) => x[0] === draft.weather)?.[1];
  return `${d} ${h}，${draft.weather ? w : '真實天氣'}${draft.hour !== null || draft.date ? (draft.freeze ? '，時間停住' : '，時間會往前走') : ''}${draft.nolimit ? '，角色不下班' : ''}`;
}

export function testSection() {
  if (!draft) initDraft();
  const t = testSettings();
  const n = now();
  const realD = key(realToday());
  const rh = realHour();
  const chip = (act, val, label, on) => `<button class="tchip${on ? ' on' : ''}" data-act="${act}" data-v="${val}">${label}</button>`;
  const bed = state.settings.bedtime ?? 21;
  const hours = [[7, ''], [8, ''], [12, ''], [15, ''], [18, ''], [bed - 0.5, ''], [bed + 0.5, '']];
  const quickD = [['', '真實'], [realD, '今天'], [addDays(realD, 1), '明天'], [nextDow(6), '這週六'], [nextDow(0), '這週日'], [nextDow(1) === realD ? addDays(realD, 7) : nextDow(1), '下週一']];
  return `
    <p class="note">${testing
      ? `<b style="color:#c9462c">測試模式中</b>：遊戲時間 ${dateLabel(dateKey(n))} ${timeLabel(n.getHours() + n.getMinutes() / 60)}${t.freeze ? '（停住）' : ''}${t.weather ? `，天氣「${WX_TEST.find((w) => w[0] === t.weather)?.[1]}」` : ''}。`
      : '目前使用真實的日期、時間與天氣。'}
      測試時的蓋章、領獎、聖誕進度都會真的寫進存檔，測完可用「資料」分頁的「清除資料」回復。</p>

    <div class="trow"><span class="tlab">日期</span>
      <button class="quiet tstep" data-act="t-day" data-v="-1">－1 天</button>
      <span class="tbig${draft.date ? '' : ' real'}">${draft.date ? dateLabel(draft.date) : `真實 ${dateLabel(realD)}`}</span>
      <button class="quiet tstep" data-act="t-day" data-v="1">＋1 天</button>
    </div>
    <div class="trow sub">${quickD.map(([v, l]) => chip('t-dq', v, l, (draft.date || '') === v && (v || !draft.date))).join('')}
      <label class="tchip tpick">選日期…<input type="date" data-t="pick" value="${draft.date || realD}"></label>
    </div>

    <div class="trow"><span class="tlab">時間</span>
      <button class="quiet tstep" data-act="t-min" data-v="-60">－1 時</button>
      <button class="quiet tstep" data-act="t-min" data-v="-15">－15 分</button>
      <span class="tbig${draft.hour !== null ? '' : ' real'}">${draft.hour !== null ? timeLabel(draft.hour) : `真實 ${timeLabel(rh)}`}</span>
      <button class="quiet tstep" data-act="t-min" data-v="15">＋15 分</button>
      <button class="quiet tstep" data-act="t-min" data-v="60">＋1 時</button>
    </div>
    <div class="trow sub">${chip('t-hq', '', '真實', draft.hour === null)}${hours.map(([h]) => chip('t-hq', h, timeLabel(h), draft.hour === h)).join('')}
      <button class="quiet tstep small" data-act="t-min" data-v="-1">－1 分</button><button class="quiet tstep small" data-act="t-min" data-v="1">＋1 分</button>
    </div>

    <div class="trow"><span class="tlab">天氣</span>${WX_TEST.map(([v, l]) => chip('t-wx', v, l, draft.weather === v)).join('')}</div>

    <div class="trow"><span class="tlab"></span>
      <label><input type="checkbox" data-t="freeze" ${draft.freeze ? 'checked' : ''}> 時間停住（不往前走）</label>
      <label><input type="checkbox" data-t="nolimit" ${draft.nolimit ? 'checked' : ''}> 角色不下班（不限遊玩時間）</label>
    </div>
    <div class="tapply">
      <span class="note">將設為：<b>${summary()}</b></span>
      <span><button class="quiet" data-act="t-real">恢復真實</button><button data-act="t-apply">套用並重新開始</button></span>
    </div>

    <h3>情境快捷</h3>
    <p class="note">點了直接套用並重新開始，時間會往前走；天氣、角色不下班照上面的選擇。</p>
    ${scenarios().map(([g, list]) => `<div class="tgroup"><span class="note">${g}</span>${list.map(([l, d, h]) => `<button class="tchip scn" data-act="t-scn" data-d="${d}" data-h="${h}" title="${dateLabel(d)} ${timeLabel(h)}">${l}<small>${dateLabel(d)} ${timeLabel(h)}</small></button>`).join('')}</div>`).join('')}

    <h3>其他</h3>
    <p class="note">本月地震演習：${+realD.slice(5, 7)} 月 ${drillDay(realD.slice(0, 7))} 日起，早上 8 點到晚上 7 點第一次進選房間時（${['yh', 'xz'].map((id) => `${id === 'yh' ? '妍卉' : '向澤'}${state.profiles[id].quakeMonth === dateKey().slice(0, 7) ? '已演習' : '還沒演習'}`).join('、')}）</p>
    <button class="quiet small" data-act="t-quake">${state.quakeForce ? '已設定：下次進選房間會地震演習' : '下次進選房間就地震演習'}</button>
    <button class="quiet small" data-act="sync-test">雲端同步測試</button>
    <button class="quiet small" data-act="perf-test">立體感效能測試</button>`;
}

function rerender(node) {
  const box = node.querySelector('.test');
  const top = node.querySelector('.pbody')?.scrollTop;
  box.innerHTML = testSection();
  if (top !== undefined) node.querySelector('.pbody').scrollTop = top;
}

// 回傳 true＝已處理
export function testClick(act, e, node) {
  if (!act?.startsWith('t-')) return false;
  const v = e.target.closest('[data-act]')?.dataset.v;
  if (act === 't-day') { draft.date = addDays(draft.date || key(realToday()), +v); rerender(node); return true; }
  if (act === 't-dq') { draft.date = v || null; rerender(node); return true; }
  if (act === 't-min') {
    const h = draft.hour ?? Math.round(realHour() * 60) / 60;
    draft.hour = (((Math.round((h * 60 + +v)) % 1440) + 1440) % 1440) / 60;
    rerender(node); return true;
  }
  if (act === 't-hq') { draft.hour = v === '' ? null : +v; rerender(node); return true; }
  if (act === 't-wx') { draft.weather = v; rerender(node); return true; }
  if (act === 't-apply') { apply({ date: draft.date, hour: draft.hour, weather: draft.weather, freeze: draft.freeze, nolimit: draft.nolimit }); return true; }
  if (act === 't-scn') {
    const b = e.target.closest('[data-act]');
    apply({ date: b.dataset.d, hour: +b.dataset.h, weather: draft.weather, nolimit: draft.nolimit });
    return true;
  }
  if (act === 't-real') { localStorage.removeItem(TEST_KEY); location.reload(); return true; }
  if (act === 't-quake') {
    state.quakeForce = true;
    save();
    e.target.textContent = '已設定：下次進選房間會地震演習';
    return true;
  }
  return false;
}

// 勾選框、日期選擇器（change 事件）
export function testChange(e, node) {
  const k = e.target.dataset?.t;
  if (!k || !e.target.closest('.test')) return false;
  if (k === 'pick') { if (e.target.value) draft.date = e.target.value; rerender(node); return true; }
  if (k === 'freeze' || k === 'nolimit') { draft[k] = e.target.checked; rerender(node); return true; }
  return false;
}

// 遊戲畫面角落的測試標示（main.js 開機時呼叫）
export function showTestBadge() {
  if (!testing) return;
  const t = testSettings();
  const b = document.createElement('div');
  b.id = 'testbadge';
  document.body.appendChild(b);
  const paint = () => {
    const n = now();
    const w = t.weather ? ` ${WX_TEST.find((x) => x[0] === t.weather)?.[1] || ''}` : '';
    b.textContent = `測試 ${dateLabel(dateKey(n))} ${timeLabel(n.getHours() + n.getMinutes() / 60)}${t.freeze ? ' 停' : ''}${w}`;
  };
  paint();
  setInterval(paint, 15000);
}

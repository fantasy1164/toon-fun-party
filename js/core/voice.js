// 角色說話。優先播放 assets/voice 裡的語音檔；還沒有檔案時，
// 暫時用裝置內建的語音合成（依角色調整音高與語速）當佔位。
import { CHARACTERS } from '../config.js';
import { lineText, lineHasName } from '../data/lines.js';
import { getCtx, getVoiceBus, duck } from './audio.js';

let available = new Map();   // 台詞代號 → 檔名（含副檔名）
const buffers = new Map();
let token = 0;
let currentSource = null;

export async function loadVoiceManifest() {
  try {
    const r = await fetch('assets/voice/manifest.json', { cache: 'no-cache' });
    if (!r.ok) return;
    // 清單裡是檔名，例如 dudu/hello.yh.mp3；去掉副檔名就是台詞代號
    for (const f of (await r.json()).files || []) available.set(f.replace(/\.(mp3|wav)$/, ''), f);
  } catch { /* 沒有清單就全部用佔位語音 */ }
}

const synth = window.speechSynthesis || null;
const query = new URLSearchParams(location.search);
const keep = [];          // 留住語音物件，避免還沒說完就被瀏覽器回收（Safari 的已知問題）
let ttsReady = false;     // 是否已在使用者觸碰的當下成功啟動過語音合成
let activeDone = null;

// 除錯用：網址加 ?debug=1 會在畫面左下角顯示語音事件
let dbgBox = null;
function dbg(msg) {
  if (!query.has('debug')) return;
  if (!dbgBox) {
    dbgBox = document.createElement('pre');
    dbgBox.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:999;margin:0;padding:6px;max-width:70vw;' +
      'font:11px/1.3 monospace;color:#0f0;background:rgba(0,0,0,.75);pointer-events:none;white-space:pre-wrap';
    document.body.appendChild(dbgBox);
  }
  const lines = (dbgBox.textContent + '\n' + msg).trim().split('\n').slice(-10);
  dbgBox.textContent = lines.join('\n');
}

function pickTtsVoice() {
  const vs = synth?.getVoices?.() || [];
  return vs.find((v) => v.lang === 'zh-TW') || vs.find((v) => v.lang?.startsWith('zh')) || null;
}

function stopCurrent() {
  token++;
  try { currentSource?.stop(); } catch { /* 已經停了 */ }
  currentSource = null;
  // 沒在說話時不要呼叫 cancel()：iOS 上多餘的 cancel 會讓下一句被吃掉
  try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch { /* 忽略 */ }
  if (activeDone) { const d = activeDone; activeDone = null; d(); }
}

async function playFile(key, my) {
  const ctx = getCtx();
  if (!ctx) return false;
  let buf = buffers.get(key);
  if (!buf) {
    const r = await fetch(`assets/voice/${available.get(key)}`);
    if (!r.ok) return false;
    buf = await ctx.decodeAudioData(await r.arrayBuffer());
    buffers.set(key, buf);
  }
  if (my !== token) return true;
  await new Promise((res) => {
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.connect(getVoiceBus());
    s.onended = res;
    currentSource = s;
    s.start();
  });
  return true;
}

function playTts(text, charId, my) {
  return new Promise((res) => {
    // 估計說話長度，當作保險：有些裝置不會觸發結束事件
    const est = 700 + text.length * 260;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (activeDone === done) activeDone = null;
      res();
    };
    const timer = setTimeout(done, est + 2500);
    // 測試用：?notts=1 不出聲、快速略過
    if (query.has('notts')) { clearTimeout(timer); setTimeout(res, 120); return; }
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      dbg('tts: not supported');
      clearTimeout(timer);
      setTimeout(res, est);
      return;
    }
    activeDone = done;
    const u = new SpeechSynthesisUtterance(text);
    const v = pickTtsVoice();
    if (v) u.voice = v;
    u.lang = 'zh-TW';
    const cfg = CHARACTERS[charId]?.tts || {};
    u.pitch = cfg.pitch ?? 1;
    u.rate = cfg.rate ?? 1;
    u.onstart = () => { ttsReady = true; dbg(`start: ${text.slice(0, 8)}`); };
    u.onend = () => { dbg('end'); done(); };
    u.onerror = (e) => { dbg(`error: ${e.error || '?'}`); done(); };
    keep.push(u);
    if (keep.length > 6) keep.shift();
    // cancel() 之後立刻 speak() 在 iOS 會沒聲音，隔一小段時間再說
    setTimeout(() => {
      if (my !== token) { done(); return; }
      try {
        if (synth.paused) synth.resume();
        synth.speak(u);
        dbg(`speak: voices=${synth.getVoices().length} voice=${v ? v.name : 'default'} ready=${ttsReady}`);
      } catch (err) { dbg(`throw: ${err.message}`); done(); }
    }, 80);
  });
}

// 說一句台詞。回傳的 Promise 在說完（或被下一句打斷）時結束。
export async function speak(charId, lineId, { name = '', who = '', node = null } = {}) {
  stopCurrent();
  const my = token;
  const text = lineText(lineId, charId, name);
  if (!text) return;
  node?.classList.add('talking');
  duck(true);
  try {
    const key = lineHasName(lineId, charId) ? `${charId}/${lineId}.${who}` : `${charId}/${lineId}`;
    let played = false;
    if (available.has(key)) {
      try { played = await playFile(key, my); } catch { played = false; }
    }
    if (!played && my === token) await playTts(text, charId, my);
  } finally {
    node?.classList.remove('talking');
    if (my === token) duck(false);
  }
}

// iOS 規定第一次語音合成必須發生在使用者觸碰的當下（放開手指或點擊的事件裡），
// 之後才能由程式自動說話。每次觸碰都呼叫，直到確認成功為止。
export function primeTts() {
  if (ttsReady || !synth || typeof SpeechSynthesisUtterance === 'undefined' || query.has('notts')) return;
  try {
    synth.getVoices();
    if (synth.speaking || synth.pending) return;
    const u = new SpeechSynthesisUtterance('嗯');
    u.lang = 'zh-TW';
    u.volume = 0;
    u.onstart = () => { ttsReady = true; dbg('primed'); };
    u.onend = () => { ttsReady = true; };
    u.onerror = (e) => dbg(`prime error: ${e.error || '?'}`);
    keep.push(u);
    if (synth.paused) synth.resume();
    synth.speak(u);
  } catch { /* 忽略 */ }
}

export function hush() {
  stopCurrent();
  duck(false);
}

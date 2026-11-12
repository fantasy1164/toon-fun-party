// 角色說話。優先播放 assets/voice 裡的語音檔；還沒有檔案時，
// 暫時用裝置內建的語音合成（依角色調整音高與語速）當佔位。
import { CHARACTERS } from '../config.js';
import { lineText, lineHasName } from '../data/lines.js';
import { getCtx, getVoiceBus, duck } from './audio.js';

let available = new Set();
const buffers = new Map();
let token = 0;
let currentSource = null;

export async function loadVoiceManifest() {
  try {
    const r = await fetch('assets/voice/manifest.json', { cache: 'no-cache' });
    if (r.ok) available = new Set((await r.json()).files || []);
  } catch { /* 沒有清單就全部用佔位語音 */ }
}

function pickTtsVoice() {
  const vs = window.speechSynthesis?.getVoices?.() || [];
  return vs.find((v) => v.lang === 'zh-TW') || vs.find((v) => v.lang?.startsWith('zh')) || null;
}

function stopCurrent() {
  token++;
  try { currentSource?.stop(); } catch { /* 已經停了 */ }
  currentSource = null;
  try { window.speechSynthesis?.cancel(); } catch { /* 忽略 */ }
}

async function playFile(key, my) {
  const ctx = getCtx();
  if (!ctx) return false;
  let buf = buffers.get(key);
  if (!buf) {
    const r = await fetch(`assets/voice/${key}.mp3`);
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
    const done = () => { clearTimeout(timer); res(); };
    const timer = setTimeout(done, est + 2500);
    // 測試用：?notts=1 不出聲、快速略過
    if (new URLSearchParams(location.search).has('notts')) { clearTimeout(timer); setTimeout(res, 120); return; }
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      clearTimeout(timer);
      setTimeout(res, est);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    const v = pickTtsVoice();
    if (v) u.voice = v;
    u.lang = 'zh-TW';
    const cfg = CHARACTERS[charId]?.tts || {};
    u.pitch = cfg.pitch ?? 1;
    u.rate = cfg.rate ?? 1;
    u.onend = done;
    u.onerror = done;
    if (my !== token) { done(); return; }
    synth.speak(u);
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

// iPad 需要在使用者觸碰的當下先啟動一次語音合成，之後才能自動說話
export function primeTts() {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
    synth.getVoices();
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
  } catch { /* 忽略 */ }
}

export function hush() {
  stopCurrent();
  duck(false);
}

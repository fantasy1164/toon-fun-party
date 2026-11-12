// 批次產生角色語音（Gemini TTS），並更新 assets/voice/manifest.json。
//
// 用法（PowerShell）：
//   $env:GEMINI_API_KEY = "你的金鑰"
//   node tools/gen-voice.mjs              # 產生所有還沒有的語音（預設：同一角色多句串成一次請求再切開）
//   node tools/gen-voice.mjs --batch 20   # 每次請求串幾句（預設 25）
//   node tools/gen-voice.mjs --single     # 一句一次請求（舊方式，最穩但最耗額度）
//   node tools/gen-voice.mjs --char dudu  # 只做某個角色
//   node tools/gen-voice.mjs --line hello # 只做某一句
//   node tools/gen-voice.mjs --force      # 已存在的也重做
//   node tools/gen-voice.mjs --dry        # 只列出要做什麼，不呼叫 API
//   node tools/gen-voice.mjs --convert    # 把現有的 wav 轉成 mp3（需要 ffmpeg，不呼叫 API）
//
// 金鑰只放在環境變數，不要寫進任何檔案。
// 角色的聲音與說話風格在 tools/voice-config.json。
// 電腦有 ffmpeg 的話會自動轉成 mp3（檔案小很多）；沒有就保留 wav，遊戲兩種都能播。
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINES } from '../js/data/lines.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_DIR = join(ROOT, 'assets', 'voice');
const cfg = JSON.parse(readFileSync(join(ROOT, 'tools', 'voice-config.json'), 'utf8'));
const API = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta/interactions';
const KEY = process.env.GEMINI_API_KEY;
const WHO = { yh: '妍卉', xz: '向澤', both: '妍卉、向澤' };

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const onlyChar = opt('char');
const onlyLine = opt('line');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const BATCH = flag('single') ? 1 : Math.max(1, parseInt(opt('batch') || '25', 10));

// 展開成一筆一筆要產生的工作
function jobs() {
  const out = [];
  for (const [id, l] of Object.entries(LINES)) {
    if (onlyLine && id !== onlyLine) continue;
    for (const charId of Object.keys(cfg.characters)) {
      if (onlyChar && charId !== onlyChar) continue;
      // 純文字的台詞（顏色、圖案名稱等）只給嘟嘟、奇奇用，其他角色不用產生
      const t = typeof l === 'string' ? (['dudu', 'kiki'].includes(charId) ? l : null) : l[charId];
      if (!t) continue;
      if (t.includes('{name}')) {
        for (const [w, name] of Object.entries(WHO)) out.push({ charId, key: `${charId}/${id}.${w}`, text: t.replaceAll('{name}', name) });
      } else {
        out.push({ charId, key: `${charId}/${id}`, text: t });
      }
    }
  }
  return out;
}

const existing = (key) => ['mp3', 'wav'].find((ext) => existsSync(join(VOICE_DIR, `${key}.${ext}`)));

async function synth({ charId, text }) {  // text 可以是很多句用停頓串起來
  const c = cfg.characters[charId];
  const body = {
    model: cfg.model,
    input: [{
      type: 'user_input',
      content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: c.style }] }],
    }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: c.voice }] },
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return findAudio(await res.json());
    const msg = (await res.text()).slice(0, 600);
    // 每日額度用完：重試沒有用，直接停下整批
    if (res.status === 429 && /per day|daily/i.test(msg)) {
      const e = new Error(`今日額度已用完：${msg}`);
      e.quota = true;
      throw e;
    }
    // 每分鐘太頻繁或伺服器忙：照伺服器建議的時間等，再試
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const m = /retry in (?:(\d+)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i.exec(msg);
      const hinted = m ? (parseInt(m[1] || '0', 10) * 60 + parseFloat(m[2] || '0')) : 0;
      const waitS = Math.ceil(hinted > 0 && hinted <= 120 ? hinted + 2 : attempt * (process.env.GEMINI_API_BASE ? 1 : 15));
      console.log(`    HTTP ${res.status}，${waitS} 秒後重試（第 ${attempt} 次）`);
      await sleep(waitS * 1000);
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
}

// 回應格式可能調整，所以不寫死路徑：在整個回應裡找最後一段 audio 資料
function findAudio(json) {
  let found = null;
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (typeof n.data === 'string' && n.data.length > 200 && (n.type === 'audio' || String(n.mime_type || n.mimeType || '').startsWith('audio/'))) {
      found = { data: n.data, mime: n.mime_type || n.mimeType || 'audio/wav' };
    }
    Object.values(n).forEach(walk);
  })(json);
  if (!found) throw new Error(`回應裡找不到音訊：${JSON.stringify(json).slice(0, 400)}`);
  return found;
}

// 沒有 RIFF 檔頭的原始 PCM，補上 wav 檔頭（24kHz、單聲道、16 位元）
function toWav(buf) {
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') return buf;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + buf.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(buf.length, 40);
  return Buffer.concat([h, buf]);
}

// ---------- 串接後切割 ----------
// 把回傳的音訊轉成 16 位元單聲道 PCM 樣本
function pcmOf(audio) {
  const buf = Buffer.from(audio.data, 'base64');
  let data = buf, rate = 24000;
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') {
    rate = buf.readUInt32LE(24);
    let off = 12;
    while (off < buf.length - 8) {
      const id = buf.subarray(off, off + 4).toString('ascii');
      const size = buf.readUInt32LE(off + 4);
      if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; }
      off += 8 + size;
    }
  }
  return { samples: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length - (data.length % 2))), rate };
}

function wavOf(samples, rate) {
  const body = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + body.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(body.length, 40);
  return Buffer.concat([h, body]);
}

// 找出最長的 n-1 段靜音當切點，切成 n 段。切不出合理結果就回傳 null。
export function splitBySilence(samples, rate, texts) {
  const n = texts.length;
  const frame = Math.round(rate * 0.02);          // 20 毫秒一格
  const frames = Math.floor(samples.length / frame);
  let peak = 1;
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = f * frame; i < (f + 1) * frame; i++) sum += samples[i] * samples[i];
    rms[f] = Math.sqrt(sum / frame);
    if (rms[f] > peak) peak = rms[f];
  }
  const quiet = Math.max(120, peak * 0.03);
  const silent = Array.from(rms, (v) => v < quiet);
  // 句子實際開始與結束的位置（去掉頭尾靜音）
  let first = silent.indexOf(false), last = silent.lastIndexOf(false);
  if (first < 0) return null;
  // 中間的靜音段
  const gaps = [];
  for (let f = first; f <= last; f++) {
    if (!silent[f]) continue;
    let g = f;
    while (g <= last && silent[g]) g++;
    gaps.push({ start: f, end: g, len: g - f });
    f = g;
  }
  if (n === 1) return [[first, last + 1]].map(([a, b]) => samples.slice(Math.max(0, a - 4) * frame, Math.min(frames, b + 4) * frame));
  if (gaps.length < n - 1) return null;
  const chosen = gaps.slice().sort((a, b) => b.len - a.len).slice(0, n - 1).sort((a, b) => a.start - b.start);
  // 選到的停頓至少 0.3 秒，而且要明顯比沒選到的最長停頓長，才表示真的是句子之間
  const minChosen = Math.min(...chosen.map((g) => g.len));
  const nextBest = gaps.length > n - 1 ? gaps.slice().sort((a, b) => b.len - a.len)[n - 1].len : 0;
  if (minChosen * 20 < 300 || minChosen < nextBest * 1.3) return null;
  const bounds = [];
  let a = first;
  for (const g of chosen) { bounds.push([a, g.start]); a = g.end; }
  bounds.push([a, last + 1]);
  // 每段長度要跟字數大致相符（每個字 0.08 到 0.7 秒）
  for (let i = 0; i < n; i++) {
    const sec = (bounds[i][1] - bounds[i][0]) * 0.02;
    const chars = texts[i].replace(/[\s，。！？、…,.!?]/g, '').length || 1;
    if (sec < Math.min(0.25, chars * 0.08) || sec > chars * 0.7 + 2.5) return null;
  }
  return bounds.map(([s0, e0]) => samples.slice(Math.max(0, s0 - 4) * frame, Math.min(frames, e0 + 4) * frame));
}

function saveSamples(key, samples, rate) {
  const wavPath = join(VOICE_DIR, `${key}.wav`);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, wavOf(samples, rate));
  if (!hasFfmpeg) return 'wav';
  const mp3Path = join(VOICE_DIR, `${key}.mp3`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-ac', '1', '-b:a', '64k', mp3Path]);
  if (r.status !== 0) return 'wav';
  unlinkSync(wavPath);
  return 'mp3';
}

// 一批（同一角色）一次請求；切不開就對半再試一次，還不行就放棄這批
async function runBatch(batch, depth = 0) {
  const text = batch.map((j) => j.text).join('\n<long pause>\n');
  const audio = await synth({ charId: batch[0].charId, text });
  const { samples, rate } = pcmOf(audio);
  const parts = splitBySilence(samples, rate, batch.map((j) => j.text));
  if (parts) {
    batch.forEach((j, i) => {
      if (flag('force')) { const ext = existing(j.key); if (ext) unlinkSync(join(VOICE_DIR, `${j.key}.${ext}`)); }
      saveSamples(j.key, parts[i], rate);
    });
    return batch.length;
  }
  if (batch.length === 1 || depth >= 1) {
    const e = new Error(`切不開（${batch.length} 句）`);
    e.split = true;
    throw e;
  }
  console.log(`    切不開，對半各試一次`);
  const mid = Math.ceil(batch.length / 2);
  let ok = 0;
  for (const half of [batch.slice(0, mid), batch.slice(mid)]) {
    await sleep(1200);
    ok += await runBatch(half, depth + 1);
  }
  return ok;
}

function save(key, audio) {
  const wavPath = join(VOICE_DIR, `${key}.wav`);
  mkdirSync(dirname(wavPath), { recursive: true });
  writeFileSync(wavPath, toWav(Buffer.from(audio.data, 'base64')));
  if (!hasFfmpeg) return 'wav';
  const mp3Path = join(VOICE_DIR, `${key}.mp3`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-ac', '1', '-b:a', '64k', mp3Path]);
  if (r.status !== 0) return 'wav';
  unlinkSync(wavPath);
  return 'mp3';
}

// 依實際存在的檔案重寫清單，遊戲靠這份清單知道哪些句子有正式語音
function writeManifest() {
  const files = [];
  if (existsSync(VOICE_DIR)) {
    for (const d of readdirSync(VOICE_DIR, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      for (const f of readdirSync(join(VOICE_DIR, d.name))) {
        if (/\.(mp3|wav)$/.test(f)) files.push(`${d.name}/${f}`);
      }
    }
  }
  files.sort();
  writeFileSync(join(VOICE_DIR, 'manifest.json'), JSON.stringify({ files }, null, 2) + '\n');
  return files.length;
}

if (flag('convert')) {
  if (!hasFfmpeg) { console.error('找不到 ffmpeg'); process.exit(1); }
  let n = 0;
  for (const d of readdirSync(VOICE_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    for (const f of readdirSync(join(VOICE_DIR, d.name))) {
      if (!f.endsWith('.wav')) continue;
      const wav = join(VOICE_DIR, d.name, f);
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-b:a', '64k', wav.replace(/\.wav$/, '.mp3')]);
      if (r.status === 0) { unlinkSync(wav); n++; }
    }
  }
  console.log(`已轉換 ${n} 個檔案；清單已更新：${writeManifest()} 個語音檔`);
  process.exit(0);
}

const all = jobs();
const todo = all.filter((j) => flag('force') || !existing(j.key));
console.log(`共 ${all.length} 句，這次要產生 ${todo.length} 句（模型 ${cfg.model}，${hasFfmpeg ? '輸出 mp3' : '找不到 ffmpeg，輸出 wav'}）`);

if (flag('dry')) {
  todo.forEach((j) => console.log(`  ${j.key}  ←  ${j.text}`));
} else if (todo.length) {
  if (!KEY) { console.error('請先設定環境變數 GEMINI_API_KEY'); process.exit(1); }
  // 依角色分組，每組再切成每批 BATCH 句
  const batches = [];
  for (const charId of Object.keys(cfg.characters)) {
    const mine = todo.filter((j) => j.charId === charId);
    for (let i = 0; i < mine.length; i += BATCH) batches.push(mine.slice(i, i + BATCH));
  }
  console.log(`分成 ${batches.length} 次請求（每次最多 ${BATCH} 句）`);
  let ok = 0;
  let requests = 0;
  let splitFails = 0;
  const failed = [];
  for (const [i, batch] of batches.entries()) {
    console.log(`[${i + 1}/${batches.length}] ${batch[0].charId} ${batch.length} 句：${batch[0].text}${batch.length > 1 ? ' …' : ''}`);
    try {
      ok += await runBatch(batch);
      requests++;
      splitFails = 0;
    } catch (e) {
      failed.push(...batch.map((j) => j.key));
      console.log(`    失敗：${e.message}`);
      if (e.quota) { console.log('今天的每日額度用完了（台灣時間下午 4 點左右重置）。重置後再執行一次，已完成的會自動跳過。'); break; }
      if (e.split) {
        console.log('    這批的停頓不明顯，可以之後用 --batch 5 或 --single 補做。');
        // 連續兩批都切不開：模型可能沒照停頓唸，先停下來，免得浪費額度
        if (++splitFails >= 2) { console.log('連續兩批切不開，先停下來。請改用：node tools/gen-voice.mjs --batch 5'); break; }
      }
      if (failed.length && ok === 0 && i >= 2) { console.log('連續失敗，先停下來。請把上面的錯誤訊息給 Claude 看。'); break; }
    }
    await sleep(1200);
  }
  console.log(`完成 ${ok} 句${failed.length ? `，失敗 ${failed.length} 句（再執行一次會只補做沒完成的）` : ''}`);
}
console.log(`清單已更新：${writeManifest()} 個語音檔`);

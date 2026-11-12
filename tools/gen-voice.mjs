// 批次產生角色語音（Gemini TTS），並更新 assets/voice/manifest.json。
//
// 用法（PowerShell）：
//   $env:GEMINI_API_KEY = "你的金鑰"
//   node tools/gen-voice.mjs              # 產生所有還沒有的語音
//   node tools/gen-voice.mjs --char dudu  # 只做某個角色
//   node tools/gen-voice.mjs --line hello # 只做某一句
//   node tools/gen-voice.mjs --force      # 已存在的也重做
//   node tools/gen-voice.mjs --dry        # 只列出要做什麼，不呼叫 API
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

// 展開成一筆一筆要產生的工作
function jobs() {
  const out = [];
  for (const [id, l] of Object.entries(LINES)) {
    if (onlyLine && id !== onlyLine) continue;
    for (const charId of Object.keys(cfg.characters)) {
      if (onlyChar && charId !== onlyChar) continue;
      const t = typeof l === 'string' ? l : l[charId];
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

async function synth({ charId, text }) {
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

const all = jobs();
const todo = all.filter((j) => flag('force') || !existing(j.key));
console.log(`共 ${all.length} 句，這次要產生 ${todo.length} 句（模型 ${cfg.model}，${hasFfmpeg ? '輸出 mp3' : '找不到 ffmpeg，輸出 wav'}）`);

if (flag('dry')) {
  todo.forEach((j) => console.log(`  ${j.key}  ←  ${j.text}`));
} else if (todo.length) {
  if (!KEY) { console.error('請先設定環境變數 GEMINI_API_KEY'); process.exit(1); }
  let ok = 0;
  const failed = [];
  for (const [i, j] of todo.entries()) {
    process.stdout.write(`[${i + 1}/${todo.length}] ${j.key}  ${j.text}\n`);
    try {
      if (flag('force')) { const ext = existing(j.key); if (ext) unlinkSync(join(VOICE_DIR, `${j.key}.${ext}`)); }
      save(j.key, await synth(j));
      ok++;
    } catch (e) {
      failed.push(j.key);
      console.log(`    失敗：${e.message}`);
      if (e.quota) { console.log('免費額度一天只有很少次。請到 AI Studio 開啟付費（Billing）後再執行一次，已完成的會自動跳過。'); break; }
      // 連續失敗多半是金鑰或格式問題，不要整批硬跑
      if (failed.length >= 3 && ok === 0) { console.log('連續失敗，先停下來。請把上面的錯誤訊息給 Claude 看。'); break; }
    }
    await sleep(1200);
  }
  console.log(`完成 ${ok} 句${failed.length ? `，失敗 ${failed.length} 句：${failed.join(', ')}（再執行一次會只補做失敗的）` : ''}`);
}
console.log(`清單已更新：${writeManifest()} 個語音檔`);

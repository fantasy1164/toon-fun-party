// 麥克風：只用來偵測「吹氣」的音量，不錄音、不上傳。
// iPad 主畫面 app 的麥克風授權通常只在這次開啟期間有效；家長頁可以先按一次，遊戲裡就不會跳出詢問。
import { getCtx, unlock } from './audio.js';

let granted = false;
export const micReady = () => granted;

async function open() {
  const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  granted = true;
  return s;
}

// 家長頁：要求授權（之後立刻關掉麥克風）
export async function requestMic() {
  const s = await open();
  s.getTracks().forEach((t) => t.stop());
  return true;
}

// 監聽音量；onLevel(rms 0~1)。回傳 { stop }
export async function listen(onLevel) {
  unlock();
  const ctx = getCtx();
  const s = await open();
  const src = ctx.createMediaStreamSource(s);
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  src.connect(an);
  const buf = new Float32Array(an.fftSize);
  let raf = 0;
  let alive = true;
  const loop = () => {
    if (!alive) return;
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    onLevel(Math.sqrt(sum / buf.length));
    raf = requestAnimationFrame(loop);
  };
  loop();
  return {
    stop() {
      alive = false;
      cancelAnimationFrame(raf);
      try { src.disconnect(); } catch { /* 已斷開 */ }
      s.getTracks().forEach((t) => t.stop());
    },
  };
}

// 偵測吹氣：先量 0.4 秒環境音，之後音量明顯高於環境就算在吹。onBlow(秒數) 每次吹到就回報累積秒數。
export async function listenBlow(onBlow) {
  let base = 0;
  let n = 0;
  let acc = 0;
  let last = performance.now();
  const t0 = last;
  return listen((rms) => {
    const t = performance.now();
    const dt = (t - last) / 1000;
    last = t;
    if (t - t0 < 400) { base += rms; n += 1; return; }
    const thr = Math.max(0.06, (base / Math.max(1, n)) * 4);
    if (rms > thr) { acc += dt; onBlow(acc, rms); }
  });
}

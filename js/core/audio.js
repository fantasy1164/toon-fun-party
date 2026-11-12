// 聲音引擎：音樂與音效全部用 Web Audio 即時合成，不需要音檔。
let ctx = null;
let musicBus, sfxBus, voiceBus;
let noiseBuf = null;

export function getCtx() { return ctx; }
export function getVoiceBus() { return voiceBus; }

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.32; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1; voiceBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

// 說話時把音樂壓低
export function duck(on) {
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(on ? 0.1 : 0.32, ctx.currentTime, 0.15);
}

// ---------- 基本合成 ----------
function tone(freq, t, dur, { type = 'sine', gain = 0.3, dest = sfxBus, to = null, attack = 0.01 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(t, dur, { freq = 2000, q = 1, gain = 0.3, type = 'bandpass', to = null, dest = sfxBus } = {}) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(sfxBus === dest ? sfxBus : dest);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
}

// ---------- 音效 ----------
const SFX = {
  tap: (t) => tone(520, t, 0.12, { type: 'triangle', to: 880, gain: 0.25 }),
  pop: (t) => tone(900 + Math.random() * 500, t, 0.09, { to: 240, gain: 0.3 }),
  bubble: (t) => tone(400 + Math.random() * 500, t, 0.14, { to: 1300, gain: 0.14 }),
  squirt: (t) => { noise(t, 0.28, { freq: 900, to: 2600, q: 3, gain: 0.3 }); tone(300, t, 0.25, { to: 620, gain: 0.12 }); },
  scrub: (t) => noise(t, 0.1, { freq: 2600 + Math.random() * 1600, q: 1.6, gain: 0.2 }),
  rub: (t) => noise(t, 0.12, { freq: 900 + Math.random() * 500, q: 1.2, gain: 0.16 }),
  towel: (t) => { noise(t, 0.22, { freq: 600, q: 0.8, gain: 0.2 }); noise(t + 0.25, 0.22, { freq: 700, q: 0.8, gain: 0.2 }); },
  gargle: (t) => {
    for (let i = 0; i < 12; i++) tone(180 + Math.random() * 160, t + i * 0.09, 0.1, { to: 520, gain: 0.16 });
    noise(t + 1.15, 0.35, { freq: 1500, to: 500, q: 1, gain: 0.25 });
  },
  wrong: (t) => { tone(330, t, 0.16, { type: 'triangle', to: 250, gain: 0.22 }); tone(250, t + 0.16, 0.22, { type: 'triangle', to: 200, gain: 0.2 }); },
  sparkle: (t) => [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, t + i * 0.07, 0.3, { type: 'triangle', gain: 0.16 })),
  fanfare: (t) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.13, 0.3, { type: 'triangle', gain: 0.25 }));
    [1047, 1319, 1568].forEach((f) => tone(f, t + 0.55, 0.8, { type: 'triangle', gain: 0.16 }));
  },
  stamp: (t) => { tone(140, t, 0.22, { type: 'sine', to: 60, gain: 0.6 }); noise(t, 0.12, { freq: 500, q: 0.8, gain: 0.35 }); },
  thunder: (t) => { noise(t, 2.2, { freq: 160, to: 60, q: 0.7, gain: 0.55, type: 'lowpass' }); noise(t, 0.3, { freq: 900, q: 0.5, gain: 0.25 }); },
  whoosh: (t) => noise(t, 0.4, { freq: 400, to: 3000, q: 0.7, gain: 0.2 }),
  snore: (t) => { noise(t, 0.9, { freq: 140, to: 260, q: 4, gain: 0.5 }); tone(700, t + 1.1, 0.6, { to: 500, gain: 0.05 }); },
  bye: (t) => [784, 659, 523].forEach((f, i) => tone(f, t + i * 0.25, 0.5, { type: 'sine', gain: 0.22 })),
};

export function sfx(name) {
  if (!ctx || ctx.state !== 'running') return;
  SFX[name]?.(ctx.currentTime + 0.005);
}

// 持續的水聲
let water = null;
export function waterOn() {
  if (!ctx || water) return;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.2);
  s.connect(f).connect(g).connect(sfxBus);
  s.start();
  water = { s, g };
}
export function waterOff() {
  if (!water) return;
  const { s, g } = water;
  water = null;
  g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
  s.stop(ctx.currentTime + 0.6);
}

// 持續的雨聲
let rain = null;
export function rainOn(heavy = false) {
  if (!ctx || rain) return;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.4;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  g.gain.linearRampToValueAtTime(heavy ? 0.12 : 0.07, ctx.currentTime + 1.5);
  s.connect(f).connect(g).connect(sfxBus);
  s.start();
  rain = { s, g };
}
export function rainOff() {
  if (!rain) return;
  const { s, g } = rain;
  rain = null;
  g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
  s.stop(ctx.currentTime + 1.5);
}

// ---------- 音樂 ----------
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function hz(name) {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  const semi = NOTE[m[1]] + (m[2] ? 1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (semi - 69) / 12);
}
const seq = (s) => s.trim().split(/\s+/);

// 每格是八分音符，'.' 是休止。旋律皆為本專案原創。
const TRACKS = {
  bath_day: {
    bpm: 108, lead: 'triangle', leadGain: 0.2,
    melody: seq('E5 . G5 . A5 G5 E5 . D5 . E5 . C5 . . .  E5 . G5 . C6 A5 G5 . A5 . G5 E5 D5 . . .'),
    bass: seq('C3 . G3 . A2 . E3 . F2 . C3 . G2 . D3 .  C3 . G3 . A2 . E3 . F2 . G2 . C3 . . .'),
  },
  bath_night: {
    bpm: 70, lead: 'sine', leadGain: 0.16,
    melody: seq('E4 . G4 . A4 . G4 . D4 . E4 . C4 . . .  E4 . G4 . C5 . A4 . G4 . E4 . D4 . . .'),
    bass: seq('C3 . . . A2 . . . F2 . . . G2 . . .  C3 . . . A2 . . . F2 . . . C3 . . .'),
  },
  brush_song: {
    bpm: 132, lead: 'square', leadGain: 0.09,
    melody: seq('G4 G4 A4 G4 E5 . D5 . G4 G4 A4 G4 D5 . C5 .  E5 E5 D5 C5 A4 . C5 . D5 D5 E5 D5 C5 . . .'),
    bass: seq('C3 . C3 G3 C3 . G3 . G2 . G2 D3 G2 . D3 .  A2 . A2 E3 F2 . F2 . G2 . G2 D3 C3 . C3 .'),
  },
  living: {
    bpm: 112, lead: 'triangle', leadGain: 0.18,
    melody: seq('G4 . A4 B4 D5 . B4 . A4 . G4 . E4 . . .  G4 . A4 B4 D5 . E5 . D5 . B4 . A4 . . .'),
    bass: seq('G2 . D3 . E2 . B2 . C3 . G2 . D3 . . .  G2 . D3 . C3 . G2 . D3 . A2 . D3 . . .'),
  },
  lobby: {
    bpm: 100, lead: 'triangle', leadGain: 0.18,
    melody: seq('C5 . E5 . G5 . E5 . A5 . G5 . E5 . . .  D5 . F5 . A5 . G5 . E5 . D5 . C5 . . .'),
    bass: seq('C3 . . G3 . . C3 . F2 . . C3 . . F2 .  D3 . . A2 . . G2 . C3 . . G2 . . C3 .'),
  },
};

let music = null;

export function playMusic(name) {
  if (!ctx) return;
  if (music?.name === name) return;
  stopMusic();
  const tr = TRACKS[name];
  if (!tr) return;
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
  bus.connect(musicBus);
  const stepDur = 60 / tr.bpm / 2;
  const m = { name, bus, step: 0, next: ctx.currentTime + 0.1, timer: null };
  const tick = () => {
    // 背景分頁或休眠回來時，不要一口氣補排一堆音
    if (m.next < ctx.currentTime - 0.2) m.next = ctx.currentTime + 0.05;
    while (m.next < ctx.currentTime + 0.25) {
      const i = m.step % tr.melody.length;
      const n = tr.melody[i];
      if (n !== '.') tone(hz(n), m.next, stepDur * 1.7, { type: tr.lead, gain: tr.leadGain, dest: bus });
      const b = tr.bass[i % tr.bass.length];
      if (b !== '.') tone(hz(b), m.next, stepDur * 1.9, { type: 'sine', gain: 0.22, dest: bus });
      m.step++;
      m.next += stepDur;
    }
  };
  m.timer = setInterval(tick, 80);
  tick();
  music = m;
}

export function stopMusic() {
  if (!music) return;
  const m = music;
  music = null;
  clearInterval(m.timer);
  m.bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
  setTimeout(() => m.bus.disconnect(), 1500);
}

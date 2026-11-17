// 英文複習（棉棉陪，11/17 John 提出）：晚上 20:00–21:30，睡前聽學校的英文。
// 向澤聽 Rocket Book 1 的 mp3，妍卉看 Max & Mousy Book 2 的 YouTube 影片；家長在家長頁勾選今天要聽的。
// 一、三、五、日向澤先聽，二、四、六妍卉先聽；家長按住勾勾（確認聽完了）才換下一個人。
// 只播原網站的連結，不複製檔案；不算遊玩時間；每人每天第一次聽完給棉棉一顆好朋友星星、累計英文徽章。
import { EN_HOURS, EN_FIRST } from '../config.js';
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, stopMusic, resumeAudio } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { hour, now, dateKey } from '../core/clock.js';
import { state, save, recordHabit } from '../core/store.js';
import * as weather from '../core/weather.js';
import { avatarSvg } from '../art/characters.js';
import { mianSvg } from '../art/bedroom.js';
import { tgIcon, backFor } from '../art/together.js';
import { ICON } from '../ui/screens.js';
import { ROCKET, YT_LIST, COURSES, trackKind } from '../data/english.js';

export const englishOpen = (h = hour()) => h >= EN_HOURS.from && h < EN_HOURS.to;

// 課程網站會擋「從別的網站來的」播放（防盜連），不附上來源就可以播。
// YouTube 嵌入反而需要來源，所以只在播 mp3 時切成不附來源，播影片前切回來。
export function noReferrer(on) {
  let m = document.getElementById('en-noref');
  if (!m) {
    if (!on) return;
    m = document.createElement('meta');
    m.id = 'en-noref';
    m.name = 'referrer';
    document.head.appendChild(m);
  }
  m.content = on ? 'no-referrer' : 'strict-origin-when-cross-origin';
}
// 今天誰先聽
export function englishOrder(members) {
  const first = EN_FIRST[now().getDay()];
  return [...members].sort((a, b) => (a === first ? -1 : b === first ? 1 : 0));
}
// 家長勾選的（照課程順序）
export function englishPicks(id) {
  const max = COURSES[id]?.count || 0;
  return [...new Set(state.settings.english?.[id] || [])].filter((i) => Number.isInteger(i) && i >= 0 && i < max).sort((a, b) => a - b);
}

const HOLD_MS = 1200;
const PLAY = `<svg viewBox="0 0 100 100" width="150" height="150"><path d="M34 20L82 50L34 80Z" fill="#fff" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>`;
const PAUSE = `<svg viewBox="0 0 100 100" width="150" height="150"><rect x="24" y="20" width="18" height="60" rx="6" fill="#fff"/><rect x="58" y="20" width="18" height="60" rx="6" fill="#fff"/></svg>`;
const PREV = `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M70 22L34 50L70 78Z" fill="#fff" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><rect x="20" y="22" width="10" height="56" rx="4" fill="#fff"/></svg>`;
const NEXT = `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M30 22L66 50L30 78Z" fill="#fff" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><rect x="70" y="22" width="10" height="56" rx="4" fill="#fff"/></svg>`;
// 家長按住的勾勾（右下角有鎖）
const DONE = `<svg viewBox="0 0 100 100" width="96" height="96"><path d="M18 52L40 74L84 26" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(66 64)"><rect x="0" y="12" width="28" height="22" rx="5" fill="#ffd34d"/><path d="M6 13V7A8 8 0 0 1 22 7V13" fill="none" stroke="#ffd34d" stroke-width="5"/></g></svg>`;
const RING_C = 2 * Math.PI * 70;

// YouTube 播放器的程式（第一次用到才載入）
let ytReady = null;
function loadYT() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytReady) return ytReady;
  ytReady = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { ytReady = null; reject(new Error('yt')); };
    document.head.appendChild(s);
    setTimeout(() => { if (!window.YT?.Player) { ytReady = null; reject(new Error('yt-timeout')); } }, 15000);
  });
  return ytReady;
}
export { loadYT };

export function mountEnglish(stage, { profile, onExit }) {
  const order = englishOrder(profile.members);
  const root = el(`
    <div class="screen scene tg tg-english night">
      <div class="tg-back">${backFor('sleep', 'night', weather.current())}</div>
      <div class="tg-veil"></div>
      <div class="tg-host"><div class="tg-host-in o-pj">${mianSvg()}</div></div>
      <div class="en-who"></div>
      <div class="en-main hidden">
        <div class="en-video hidden"><div class="en-yt"></div></div>
        <div class="en-now"></div>
        <div class="en-row"><button class="round-btn en-prev">${PREV}</button><button class="round-btn en-play">${PLAY}</button><button class="round-btn en-next">${NEXT}</button></div>
        <div class="en-bar"><i></i></div>
      </div>
      <div class="en-list hidden"></div>
      <button class="round-btn en-done"><svg class="en-ring" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70"/></svg>${DONE}</button>
      <div class="hud"><button class="round-btn home">${ICON.home}</button></div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  stopMusic();
  const hostIn = $('.tg-host-in', root);
  const who = $('.en-who', root);
  const main = $('.en-main', root);
  const playBtn = $('.en-play', root);
  const nowBox = $('.en-now', root);
  const videoBox = $('.en-video', root);
  const bar = $('.en-bar i', root);
  const list = $('.en-list', root);
  const doneBtn = $('.en-done', root);
  const ring = $('.en-ring circle', root);
  ring.setAttribute('stroke-dasharray', `0 ${RING_C.toFixed(1)}`);

  let alive = true;
  let ending = false;
  const cleanups = [];
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const say = async (id) => { guard(); await speak('mian', id, { node: hostIn }); guard(); };

  // iPad 放旁邊時不要自動關螢幕
  let lock = null;
  (async () => {
    try { lock = await navigator.wakeLock?.request('screen'); } catch { lock = null; }
    if (!alive) { try { lock?.release(); } catch { /* 忽略 */ } }
  })();
  cleanups.push(() => { try { lock?.release(); } catch { /* 忽略 */ } });

  // ---------- 播放器 ----------
  const au = new Audio();
  au.preload = 'auto';
  cleanups.push(() => { au.pause(); au.removeAttribute('src'); au.load(); noReferrer(false); });
  let bad = 0;
  let yt = null;
  cleanups.push(() => { try { yt?.destroy(); } catch { /* 忽略 */ } yt = null; });

  // iOS：播放 mp3 一定要在手指離開螢幕（click）的當下開始，按下去（pointerdown）的時候會被拒絕
  const onClick = (node, fn) => node.addEventListener('click', (e) => { e.preventDefault(); fn(e); });

  let picks = [];     // 這個人今天要聽的
  let pos = 0;        // 現在第幾個
  let kind = 'audio';
  let heard = false;  // 有沒有真的開始聽
  let allHeard = null;

  // 給家長看的曲目名稱（小孩看書，不看螢幕）
  function label(i) {
    if (kind === 'audio') { const t = ROCKET[picks[i]]; return `${t.disk} ${t.ver} ${t.no} · ${t.title}`; }
    const n = picks[i];
    const title = ytTitle(n);
    return title ? `${n + 1}. ${title}` : `第 ${n + 1} 支`;
  }
  function iconOf(i) { return kind === 'audio' ? trackKind(ROCKET[picks[i]].title) : 'abc'; }
  function paintDots() {
    list.innerHTML = picks.map((p, i) => `<button class="en-li" data-i="${i}"><span class="ic">${tgIcon(iconOf(i), 34)}</span><span class="tx">${label(i)}</span></button>`).join('');
    $$('.en-li', list).forEach((b) => onClick(b, () => { sfx('tap'); jump(+b.dataset.i); }));
    markDots();
  }
  function markDots() {
    $$('.en-li', list).forEach((d, i) => {
      d.classList.toggle('on', i === pos);
      d.classList.toggle('past', i < pos);
    });
    const cur = picks[pos] != null ? pos : picks.length - 1;
    nowBox.innerHTML = picks.length ? `<span class="ic">${tgIcon(iconOf(cur), 34)}</span><span class="tx">${label(cur)}</span>` : '';
    nowBox.classList.toggle('done', pos >= picks.length);
    $('.en-li.on', list)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  // YouTube 的影片標題：播過一次就記住（家長頁也看得到）
  function ytTitle(n) {
    const id = state.settings.enYtIds?.[n];
    return (id && state.settings.enYtTitles?.[id]) || '';
  }
  function learnTitle() {
    try {
      const d = yt?.getVideoData?.();
      const n = yt?.getPlaylistIndex?.();
      if (!d?.title || !d.video_id || n == null || n < 0) return;
      const ids = [...(state.settings.enYtIds || [])];
      if (ids[n] !== d.video_id) { ids[n] = d.video_id; state.settings.enYtIds = ids; }
      if (state.settings.enYtTitles?.[d.video_id] === d.title) return;
      state.settings.enYtTitles = { ...(state.settings.enYtTitles || {}), [d.video_id]: d.title };
      save();
      const i = picks.indexOf(n);
      const row = i >= 0 && $(`.en-li[data-i="${i}"] .tx`, list);
      if (row) row.textContent = label(i);
      markDots();
    } catch { /* 忽略 */ }
  }
  // 進度條
  const barTimer = setInterval(() => {
    let f = 0;
    if (kind === 'audio') f = au.duration ? au.currentTime / au.duration : 0;
    else { try { const d = yt?.getDuration?.(); f = d ? yt.getCurrentTime() / d : 0; } catch { f = 0; } }
    bar.style.width = `${Math.max(0, Math.min(1, f)) * 100}%`;
  }, 400);
  cleanups.push(() => clearInterval(barTimer));
  function setPlaying(on) {
    playBtn.innerHTML = on ? PAUSE : PLAY;
    playBtn.classList.toggle('glow', !on);
    hostIn.classList.toggle('listening', on);
  }

  // mp3：一首接一首
  function loadTrack(i, autoplay) {
    pos = Math.max(0, Math.min(picks.length - 1, i));
    const t = ROCKET[picks[pos]];
    au.src = t.url;
    markDots();
    if (autoplay) au.play().catch(() => setPlaying(false));
  }
  au.addEventListener('play', () => { heard = true; setPlaying(true); });
  au.addEventListener('pause', () => setPlaying(false));
  au.addEventListener('ended', () => {
    if (pos < picks.length - 1) { loadTrack(pos + 1, true); return; }
    pos = picks.length;
    markDots();
    setPlaying(false);
    allHeard?.();
  });
  au.addEventListener('error', () => {
    if (!alive || !au.getAttribute('src')) return;
    const dot = $(`.en-li[data-i="${pos}"]`, list);
    if (dot && !dot.classList.contains('bad')) { dot.classList.add('bad'); bad++; }
    // 全部都放不出來：請爸爸媽媽看看（網路或網站的問題）
    if (bad >= picks.length) {
      setPlaying(false);
      doneBtn.classList.add('pulse');
      if (!ending) speak('mian', 'en_offline', { node: hostIn });
      return;
    }
    // 這一首放不出來：跳下一首
    if (pos < picks.length - 1) setTimeout(() => { if (alive) loadTrack(pos + 1, heard); }, 800);
  });
  au.playsInline = true;
  onClick(playBtn, () => {
    if (au.paused) { sfx('tap'); au.play().catch(() => setPlaying(false)); } else { au.pause(); }
  });

  // 影片：YouTube 播放清單，只播家長勾選的那幾支
  function ytState(e) {
    if (!yt) return;
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING) { heard = true; hostIn.classList.add('listening'); learnTitle(); }
    if (e.data === S.PAUSED) { hostIn.classList.remove('listening'); resumeAudio(); }
    if (e.data === S.ENDED) {
      if (pos < picks.length - 1) { pos++; markDots(); yt.playVideoAt(picks[pos]); }
      else { pos = picks.length; markDots(); hostIn.classList.remove('listening'); yt.stopVideo(); resumeAudio(); allHeard?.(); }
      return;
    }
    // 播放清單自己跳到下一支（不是家長選的）：跳回該播的那一支
    if (e.data === S.PLAYING || e.data === S.BUFFERING) {
      const idx = yt.getPlaylistIndex();
      if (pos >= picks.length) yt.stopVideo();
      else if (idx >= 0 && idx !== picks[pos]) yt.playVideoAt(picks[pos]);
    }
  }
  async function setupVideo() {
    const YT = await loadYT();
    guard();
    const box = document.createElement('div');
    $('.en-yt', root).replaceChildren(box);
    await new Promise((resolve, reject) => {
      yt = new YT.Player(box, {
        width: 600,
        height: 338,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, listType: 'playlist', list: YT_LIST, index: picks[0] },
        events: {
          onReady: () => resolve(),
          onStateChange: ytState,
          onError: (e) => { if (!heard) reject(new Error(`yt-${e.data}`)); },
        },
      });
      setTimeout(() => reject(new Error('yt-timeout')), 15000);
    });
  }
  function jump(n) {
    n = Math.max(0, Math.min(picks.length - 1, n));
    if (kind === 'audio') loadTrack(n, true);
    else if (yt) { pos = n; markDots(); yt.playVideoAt(picks[pos]); }
  }
  function go(d) {
    sfx('tap');
    jump(Math.min(pos, picks.length - 1) + d);
  }
  onClick($('.en-prev', root), () => go(-1));
  onClick($('.en-next', root), () => go(1));

  // ---------- 家長按住勾勾：這個人聽完了 ----------
  let doneWait = null;
  let holdT = 0;
  let holdStart = 0;
  let holdRaf = 0;
  const holdPaint = () => {
    const f = Math.min(1, (performance.now() - holdStart) / HOLD_MS);
    ring.setAttribute('stroke-dasharray', `${(RING_C * f).toFixed(1)} ${RING_C.toFixed(1)}`);
    if (f < 1) holdRaf = requestAnimationFrame(holdPaint);
  };
  const holdOff = () => {
    clearTimeout(holdT);
    cancelAnimationFrame(holdRaf);
    ring.setAttribute('stroke-dasharray', `0 ${RING_C.toFixed(1)}`);
    doneBtn.classList.remove('holding');
  };
  // 按滿 1.2 秒（圈圈滿了、叮一聲），放開手指的那一刻才算完成：iOS 只在放開時允許把被影片暫停的聲音叫回來
  let holdReady = false;
  doneBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    holdReady = false;
    holdStart = performance.now();
    doneBtn.classList.add('holding');
    holdRaf = requestAnimationFrame(holdPaint);
    holdT = setTimeout(() => { holdReady = true; doneBtn.classList.add('ready'); sfx('ding'); }, HOLD_MS);
  });
  doneBtn.addEventListener('pointerup', () => {
    const ok = holdReady;
    holdReady = false;
    doneBtn.classList.remove('ready');
    holdOff();
    if (!ok) return;
    resumeAudio();
    doneWait?.();
  });
  ['pointerleave', 'pointercancel'].forEach((t) => doneBtn.addEventListener(t, () => { holdReady = false; doneBtn.classList.remove('ready'); holdOff(); }));
  cleanups.push(holdOff);

  // ---------- 一個人的複習 ----------
  async function listen(id) {
    picks = englishPicks(id);
    kind = COURSES[id].kind;
    pos = 0;
    heard = false;
    bad = 0;
    noReferrer(kind === 'audio');
    who.innerHTML = `<div class="en-me">${avatarSvg(id, 150)}</div>${order.filter((k) => k !== id).map((k) => `<div class="en-next-kid">${avatarSvg(k, 70)}</div>`).join('')}`;
    who.style.setProperty('--glow', id === 'yh' ? '#ff8fb8' : '#6fd27a');
    main.classList.add('hidden');
    videoBox.classList.add('hidden');
    list.classList.add('hidden');
    list.innerHTML = '';
    bar.style.width = '0%';
    root.classList.toggle('mode-video', kind === 'video');
    root.classList.toggle('mode-audio', kind === 'audio');
    const finished = new Promise((r) => { doneWait = r; });
    doneBtn.classList.remove('pulse');
    allHeard = () => { doneBtn.classList.add('pulse'); if (alive && !ending) speak('mian', 'en_all_heard', { node: hostIn }); };
    if (!picks.length) {
      doneBtn.classList.add('pulse');
      await say('en_none');
      await finished;
      return false;
    }
    paintDots();
    main.classList.remove('hidden');
    list.classList.remove('hidden');
    if (kind === 'audio') {
      loadTrack(0, false);
      setPlaying(false);
      if (!navigator.onLine) { await say('en_offline'); doneBtn.classList.add('pulse'); }
      else await say('en_play');
    } else {
      videoBox.classList.remove('hidden');
      try {
        if (!navigator.onLine) throw new Error('offline');
        await setupVideo();
        await say('en_video');
      } catch (err) {
        guard();
        videoBox.classList.add('hidden');
        doneBtn.classList.add('pulse');
        await say('en_offline');
      }
    }
    await finished;
    guard();
    // 換人前停下來
    au.pause();
    try { yt?.destroy(); } catch { /* 忽略 */ }
    yt = null;
    resumeAudio();
    return heard;
  }

  // 每人每天第一次聽完：棉棉好朋友星星、英文徽章
  async function praise(id, heardIt) {
    const p = state.profiles[id];
    if (heardIt && p.enDay !== dateKey()) {
      p.enDay = dateKey();
      recordHabit([id], 'english', 'mian');
      save();
      const c = centerOf($('.en-me', who) || hostIn);
      burst(c.x, c.y, { n: 18, kind: 'star', spread: 240 });
      sfx('fanfare');
    }
    if (heardIt) await say(`en_good_${id}`);
  }

  async function run() {
    await wait(400);
    guard();
    await say('en_hello');
    if (order.length > 1) await say(`en_first_${order[0]}`);
    for (let k = 0; k < order.length; k++) {
      const id = order[k];
      if (k > 0) await say(`tg_turn_${id}`);
      const h = await listen(id);
      await praise(id, h);
    }
    await say('en_bye');
    finish('bed');
  }

  // 21:30：時間到就關
  const clock = setInterval(async () => {
    if (!alive || ending || englishOpen()) return;
    ending = true;
    au.pause();
    try { yt?.pauseVideo(); } catch { /* 忽略 */ }
    hush();
    try { await speak('mian', 'en_late', { node: hostIn }); } catch { /* 忽略 */ }
    finish('bed');
  }, 5000);
  cleanups.push(() => clearInterval(clock));

  function destroy() {
    if (!alive) return;
    alive = false;
    hush();
    cleanups.forEach((f) => f());
  }
  async function finish(why) {
    if (!alive) return;
    root.classList.add('out');
    await wait(500);
    destroy();
    onExit(why);
  }
  onTap($('.hud .home', root), () => { sfx('tap'); finish('home'); });

  run().catch((e) => { if (e.message !== 'scene-closed') console.error(e); });
  return { destroy, requestEnd() {}, noClock: true, hostChar: 'mian', english: true };
}

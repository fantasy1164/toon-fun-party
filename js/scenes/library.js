// 圖書館：咕咕老師，奇奇陪著（一開始太大聲）。
// 輕聲細語（有麥克風就量音量：太大聲書架會抖、咕咕「噓」；沒有就用圖卡）→ 輕輕翻書（慢慢滑；太快書頁會皺）
// → 借書刷一下 → 看完的書依顏色放回書架 → 還書箱 → 給獎、回家跟爸媽輕輕看一本書。
import { el, $, $$, wait, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, isSpeaking } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { micReady, listen } from '../core/mic.js';
import { libraryBack, SCANNER, bookSvg, OPEN_BOOK, PAGE, LB, SHELF_COLORS } from '../art/library.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { passTurn } from '../core/turns.js';

const HOST = 'gugu';

export function mountLibrary(stage, { profile, onExit }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="lb-meter hidden"><i></i><b></b></div>
    <div class="lb-book hidden"><div class="lb-book-in">${OPEN_BOOK}<div class="lb-page" data-k="0">${PAGE(0)}</div></div></div>
    <div class="kt-things"><button class="kt-thing lb-return" style="left:980px;top:680px"><svg viewBox="0 0 150 150" width="150" height="150"></svg></button></div>
    ${charDiv('kiki', 120, 660, 0.52)}
    ${charDiv(HOST, 920, 230, 0.8)}
    ${kids.map((id, i) => kidNode(id, 500 + i * 130, 870)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit library', back: libraryBack(ph) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    $('.kt-things', root).appendChild(n);
    return n;
  }
  const shake = () => { root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); sfx('rumble'); };

  // 輕聲說話：麥克風量音量（不錄音）
  async function softVoice() {
    if (!micReady()) {
      await host('lb_card_q');
      await card(LB.soft, [LB.loud], 'lb_card_wrong');
      await host('lb_soft_ok');
      return;
    }
    const meter = $('.lb-meter', root);
    meter.classList.remove('hidden');
    await host('lb_try');
    await call();
    let soft = 0;
    let lastLoud = 0;
    let base = 0;
    let n = 0;
    const t0 = performance.now();
    let last = t0;
    let mic = null;
    const ok = await new Promise((resolve) => {
      listen((rms) => {
        const t = performance.now();
        const dt = (t - last) / 1000;
        last = t;
        if (isSpeaking()) return;   // 角色在說話時不算
        if (t - t0 < 500) { base += rms; n += 1; return; }
        const quiet = Math.max(0.012, (base / Math.max(1, n)) * 2.2);
        const loud = Math.max(0.16, quiet * 6);
        $('i', meter).style.width = `${Math.min(100, (rms / loud) * 80)}%`;
        meter.classList.toggle('loud', rms > loud);
        if (rms > loud) {
          if (t - lastLoud > 2500) { lastLoud = t; shake(); speak(HOST, 'lb_too_loud', { node: who(HOST) }).catch(() => {}); }
          soft = 0;
        } else if (rms > quiet) {
          soft += dt;
          if (soft > 0.7) resolve(true);
        }
        if (t - t0 > 25000) resolve(false);
      }).then((m) => { mic = m; }).catch(() => resolve(false));
      ctl.cleanups.push(() => resolve(false));
    });
    mic?.stop();
    guard();
    passTurn();
    meter.classList.add('hidden');
    sfx(ok ? 'sparkle' : 'pop');
    await host('lb_soft_ok');
  }

  // 輕輕翻書：往左慢慢滑；太快書頁會皺。3 歲版點一下也算輕輕翻
  async function pages() {
    const bk = $('.lb-book', root);
    bk.classList.remove('hidden');
    await host('lb_page');
    for (let p = 1; p <= 2; p++) {
      const page = $('.lb-page', bk);
      page.classList.add('glow');
      await call();
      const easy = !hardNow(profile);
      await new Promise((resolve) => {
        let x0 = 0;
        let t0 = 0;
        let down = false;
        page.onpointerdown = (e) => { e.preventDefault(); down = true; x0 = e.clientX; t0 = performance.now(); page.setPointerCapture?.(e.pointerId); };
        page.onpointermove = (e) => { if (down) page.style.transform = `perspective(900px) rotateY(${Math.max(-160, Math.min(0, (e.clientX - x0) / 2))}deg)`; };
        page.onpointerup = async (e) => {
          if (!down) return;
          down = false;
          const dx = e.clientX - x0;
          const ms = performance.now() - t0;
          page.style.transform = '';
          if (Math.abs(dx) < 15) { if (easy) resolve(); return; }
          if (dx < -40 && (Math.abs(dx) / ms) < 1.4) { resolve(); return; }
          if (dx < -40) {
            page.classList.add('crumple');
            sfx('wrong');
            setTimeout(() => page.classList.remove('crumple'), 600);
            host('lb_page_fast').catch(() => {});
          }
        };
        ctl.cleanups.push(() => resolve());
      });
      guard();
      passTurn();
      page.classList.remove('glow');
      page.classList.add('flip');
      sfx('whoosh');
      await pause(600);
      page.outerHTML = `<div class="lb-page" data-k="${p}">${PAGE(p)}</div>`;
      await host(p === 1 ? 'lb_page_ok' : 'lb_page_ok2');
    }
    bk.classList.add('hidden');
  }

  async function borrow() {
    await host('lb_borrow');
    const sc = thing('lb-scan', SCANNER, [960, 300]);
    await tap(sc);
    guard();
    sc.classList.add('beep');
    sfx('beep');
    await pause(400);
    sc.remove();
    await host('lb_borrow_ok');
  }

  // 看完的書放回同顏色的書架
  async function shelve() {
    await host('lb_shelf');
    const colors = shuffle(Object.keys(SHELF_COLORS)).slice(0, 2);
    for (const c of colors) {
      const bk = thing('lb-hold', bookSvg(SHELF_COLORS[c]), [560, 640]);
      await host(`lb_shelf_${c}`);
      const others = Object.keys(SHELF_COLORS).filter((k) => k !== c).map((k) => LB.slot(SHELF_COLORS[k]));
      await card(LB.slot(SHELF_COLORS[c]), others, 'lb_shelf_wrong');
      const i = Object.keys(SHELF_COLORS).indexOf(c);
      await moveTo(bk, [190 + i * 290, 300], 600);
      sfx('pop');
      bk.remove();
    }
    await host('lb_shelf_ok');
  }

  async function giveBack() {
    await host('lb_return');
    const bk = thing('lb-hold', bookSvg('#9b85f0'), [600, 640]);
    const rb = $('.lb-return', root);
    await tap(rb);
    guard();
    await moveTo(bk, [1055, 720], 600);
    sfx('pop');
    bk.remove();
    await host('lb_return_ok');
  }

  (async () => {
    playMusic('study');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host('lb_hello');
      await host('lb_quiet');
      shake();
      await say('kiki', 'lb_kiki_loud');
      sfx('shh');
      await host('lb_shh');
      await say('kiki', 'lb_kiki_sorry');
      await softVoice();
      await pages();
      await borrow();
      await shelve();
      await giveBack();
      await host('dn_library');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'library', series: HOST, say: host });
      await host('lb_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

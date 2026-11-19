// 纜車（11/19）：動物園（山上）和海生館（山下）之間。往下坐是露露館長陪，往上坐是森森園長陪；奇奇一起。
// 排隊站在黃線後面 → 等纜車停好、門自己打開，一個一個上車 → 坐好；奇奇在車廂裡跳、纜車晃來晃去要提醒
// → 看窗外（郵輪、海生館的屋頂、對面的纜車揮揮手、長頸鹿）→ 會怕就看遠方、握家人的手 → 等門打開，小心腳下下車。
import { el, $, wait, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import * as weather from '../core/weather.js';
import { cablePlatform, CB_FEET, bigGondola, CB_INSIDE, viewStrip, STRIP_H, VIEW_SPOTS, OTHER_GONDOLA, CB_CARD } from '../art/cable.js';
import { ANIMALS } from '../art/animals.js';
import { makeScene, charDiv } from './party.js';
import { inTurnOrder, freeTurns } from '../core/turns.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode } from './kit.js';
import { NUM } from '../art/zoo.js';

const WIN_H = 480;

export function mountCable(stage, { profile, onExit, dir = 'down' }) {
  const kids = profile.members;
  const ph = phase();
  const wx = weather.current();
  const n = ph === 'night' || ph === 'dusk';
  const down = dir === 'down';
  const HOST = down ? 'lulu' : 'sensen';
  const from = down ? 'zoo' : 'sea';
  const to = down ? 'sea' : 'zoo';
  // 窗外長條的位置：t 是 translateY（0 看到最上面的動物園，-(STRIP_H-WIN_H) 看到最下面的海）
  const T_TOP = 0;
  const T_BOTTOM = -(STRIP_H - WIN_H);
  const tAt = (y) => Math.max(T_BOTTOM, Math.min(T_TOP, -(y - WIN_H / 2)));
  const inner = `
    <div class="cb-in">
      <div class="cb-view"><div class="cb-strip">${viewStrip(ph, wx)}<div class="cb-spots"></div></div><div class="cb-others"></div></div>
      <div class="cb-frame">${CB_INSIDE}</div>
    </div>
    <div class="cb-gondola">${bigGondola(n)}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 600, 690, 0.5)}
    ${charDiv(HOST, 940, 600, 0.62)}
    ${kids.map((id, i) => kidNode(id, 160 + i * 130, 880)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: `kit cable dir-${dir}`, back: cablePlatform(ph, wx, from) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const t = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    $('.kt-things', root).appendChild(t);
    return t;
  }
  const gond = $('.cb-gondola', root);
  const strip = $('.cb-strip', root);
  let t = down ? T_TOP : T_BOTTOM;
  async function rideTo(nt, ms) {
    strip.style.transition = `transform ${ms}ms ease-in-out`;
    strip.style.transform = `translateY(${nt}px)`;
    t = nt;
    await pause(ms + 50);
  }
  function setStrip(nt) {
    strip.style.transition = 'none';
    strip.style.transform = `translateY(${nt}px)`;
    t = nt;
  }

  // ---------- 月台：排隊、等纜車 ----------
  async function queue() {
    await host('cb_line');
    const feet = kids.map((_, i) => thing('cb-feet', CB_FEET, [330 + i * 170, 740]));
    for (const id of inTurnOrder(kids)) {
      const f = feet[kids.indexOf(id)];
      await tap(f);
      guard();
      sfx('pop');
      const r = ctl.rectOf(f);
      await moveTo(kidEl(id), [r.x + r.w / 2, r.y + r.h + 40], 600);
      f.remove();
    }
    await host('cb_line_ok');
  }
  async function arriveGondola() {
    gond.style.transition = 'none';
    gond.style.left = '-460px';
    void gond.offsetWidth;
    gond.classList.add('show');
    sfx('gondola');
    gond.style.transition = 'left 2.4s cubic-bezier(.2,.7,.3,1)';
    gond.style.left = '390px';
    await host('cb_wait');
    await pause(600);
    sfx('ding');
    gond.classList.add('open');
    await pause(700);
  }
  async function board() {
    await host('cb_board');
    for (const id of inTurnOrder(kids)) {
      await tap(gond);
      guard();
      sfx('pop');
      await moveTo(kidEl(id), [600, 840], 600);
      kidEl(id).classList.add('gone');
    }
    await moveTo(who('kiki'), [600, 850], 500);
    who('kiki').classList.add('gone');
    who(HOST).classList.add('gone');
    gond.classList.remove('open');
    sfx('pop');
    await pause(500);
    // 換到車廂裡
    root.classList.add('inside');
    gond.classList.remove('show');
    setStrip(t);
    kids.forEach((id, i) => { const k = kidEl(id); k.classList.remove('gone'); moveTo(k, [470 + i * 150, 820], 10); });
    moveTo(who('kiki'), [250, 800], 10);
    moveTo(who(HOST), [940, 790], 10);
    who('kiki').classList.remove('gone');
    who(HOST).classList.remove('gone');
    await pause(300);
    await host('cb_sit');
  }

  // ---------- 車廂裡 ----------
  async function look(key) {
    const S = VIEW_SPOTS[key];
    const spot = el(`<button class="cb-spot s-${key}" style="left:${S.at[0] - S.size / 2}px;top:${S.at[1] - S.size / 2}px;width:${S.size}px;height:${S.size}px"></button>`);
    if (key === 'giraffe') spot.innerHTML = `<svg viewBox="0 0 200 200" width="100%" height="100%" overflow="visible">${ANIMALS.giraffe.svg()}</svg>`;
    $('.cb-spots', root).appendChild(spot);
    await host(`cb_see_${key}`);
    spot.classList.add('glow');
    await tapEach([spot], async () => {
      sfx(key === 'ship' ? 'horn' : key === 'giraffe' ? 'hum' : 'sparkle');
      spot.classList.remove('glow');
      spot.classList.add('seen');
      const c = centerOf(spot);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 150 });
      await wait(400);
    }, { free: true, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    await host(`cb_seen_${key}`);
  }
  // 對面的纜車經過：揮揮手（6 歲數有幾台）
  async function others() {
    await host('cb_others');
    const box2 = $('.cb-others', root);
    const colors = ['#3a7bd5', '#3fae6a', '#ffb300'];
    freeTurns(true);
    for (let i = 0; i < 3; i += 1) {
      const g = el(`<button class="cb-other" style="top:${down ? 640 : -160}px">${OTHER_GONDOLA(n, colors[i])}</button>`);
      box2.appendChild(g);
      void g.offsetWidth;
      g.style.transition = 'top 3.2s linear';
      g.style.top = `${down ? -180 : 640}px`;
      sfx('gondola');
      let waved = false;
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (waved) return;
        waved = true;
        g.classList.add('waved');
        sfx('boing');
        const c = centerOf(g);
        burst(c.x, c.y, { n: 8, kind: 'heart', spread: 100 });
      });
      await pause(1900);
    }
    await pause(1500);
    freeTurns(false);
    box2.innerHTML = '';
    if (hardNow(profile)) {
      await host('cb_others_q');
      await card(NUM(3), [NUM(2), NUM(4)], 'cb_others_wrong');
    }
    await host('cb_others_ok');
  }
  // 奇奇在車廂裡跳，纜車晃來晃去
  async function rock() {
    const kk = who('kiki');
    kk.classList.add('climbing');
    root.classList.add('sway');
    await say('kiki', 'cb_kiki_jump');
    sfx('wrong');
    await host('cb_rock_tap');
    kk.classList.add('glow-c');
    await ctl.tapOnce(kk);
    guard();
    kk.classList.remove('glow-c', 'climbing');
    root.classList.remove('sway');
    await host('cb_rock_q');
    await card(CB_CARD.sit, [CB_CARD.jump], 'cb_rock_wrong');
    await say('kiki', 'zr_kiki_sorry');
    await host('cb_rock_ok');
  }

  // ---------- 到站：等門打開、小心腳下 ----------
  async function arrive() {
    await host('cb_arrive');
    await rideTo(down ? T_BOTTOM : T_TOP, 1600);
    root.classList.add('swap');
    await pause(350);
    $('.p-layer', root).innerHTML = cablePlatform(ph, wx, to);
    root.classList.remove('inside');
    gond.style.transition = 'none';
    gond.style.left = '390px';
    gond.classList.add('show');
    kids.forEach((id) => kidEl(id).classList.add('gone'));
    who('kiki').classList.add('gone');
    who(HOST).classList.add('gone');
    root.classList.remove('swap');
    sfx('gondola');
    await pause(600);
    sfx('ding');
    gond.classList.add('open');
    await host('cb_off');
    for (const id of inTurnOrder(kids)) {
      await tap(gond);
      guard();
      sfx('pop');
      const k = kidEl(id);
      moveTo(k, [600, 840], 10);
      k.classList.remove('gone');
      await moveTo(k, [200 + kids.indexOf(id) * 140, 880], 600);
    }
    who('kiki').classList.remove('gone');
    moveTo(who('kiki'), [560, 856], 10);
    who(HOST).classList.remove('gone');
    await moveTo(who(HOST), [1014, 798], 10);
  }

  (async () => {
    playMusic('cable');
    await wait(400);
    try {
      ctl.mode = 'act';
      await host(down ? 'cb_hello_down' : 'cb_hello_up');
      await say('kiki', 'cb_kiki_hello');
      await queue();
      await arriveGondola();
      await board();
      // 往下：先看到長頸鹿，最後看到郵輪；往上相反
      const stops = down ? ['giraffe', 'mid', 'roof', 'ship'] : ['ship', 'roof', 'mid', 'giraffe'];
      const where = { giraffe: tAt(VIEW_SPOTS.giraffe.at[1]), roof: tAt(VIEW_SPOTS.roof.at[1]), ship: tAt(VIEW_SPOTS.ship.at[1]), mid: tAt(1200) };
      for (let i = 0; i < stops.length; i += 1) {
        const s = stops[i];
        await rideTo(where[s], i === 0 ? 1200 : 3200);
        if (i === 1) { await rock(); await host('cb_scared'); }
        if (s === 'mid') await others();
        else await look(s);
      }
      await arrive();
      await host('dn_cable');   // 說出做到了什麼
      await giveReward({ root, kids, reward: 'cable', series: HOST, say: host });
      ctl.mode = 'done';
      await pause(300);
      ctl.leave('arrive');
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

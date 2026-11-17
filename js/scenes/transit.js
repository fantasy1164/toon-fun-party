// 公車（生活區）與火車（跨區），司機和列車長都是噗噗，奇奇陪著。
// 公車：排隊、認公車號碼、刷卡、抓扶手、讓座給烏龜爺爺、到站按下車鈴、等公車開走再過馬路。
// 火車：刷卡進站、站在黃線後面、先下後上、看車票號碼找座位、車廂裡坐好小聲、到站小心月台空隙。
import { el, $, $$, wait, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import * as weather from '../core/weather.js';
import { busStreet, busSvg, busInside, BUS_SCENERY, BELL, CARD_READER, STRAP, GRANDPA, BUNNY, TR, platformBack, TRAIN_SIDE, trainInside, trainScenery, seatSvg, ticketSvg, GATE } from '../art/transit.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { passTurn, inTurnOrder } from '../core/turns.js';

// 公車螢幕上的站（圖）
const STOP_ICON = {
  park: '<rect x="44" y="56" width="12" height="34" fill="#8a5a2b"/><circle cx="50" cy="40" r="30" fill="#4caf50"/>',
  library: '<path d="M50 24Q30 12 10 18V84Q30 78 50 88Z" fill="#ff6b8a"/><path d="M50 24Q70 12 90 18V84Q70 78 50 88Z" fill="#ff8fa8"/>',
  theater: '<path d="M50 14l10 22h24l-19 15l7 24l-22 -14l-22 14l7 -24l-19 -15h24z" fill="#ffd34d"/>',
  market: '<path d="M14 24H26L36 66H78L86 36H30" fill="none" stroke="#3a7bd5" stroke-width="7" stroke-linejoin="round"/><circle cx="42" cy="80" r="7" fill="#3a7bd5"/><circle cx="72" cy="80" r="7" fill="#3a7bd5"/>',
  fire: '<path d="M50 10Q78 40 70 66Q64 88 50 88Q36 88 30 66Q22 40 50 10Z" fill="#ff6b3d"/><path d="M50 40Q64 56 58 72Q54 80 50 80Q44 80 42 72Q38 56 50 40Z" fill="#ffd34d"/>',
  clinic: '<rect x="38" y="14" width="24" height="72" rx="4" fill="#3fbf7f"/><rect x="14" y="38" width="72" height="24" rx="4" fill="#3fbf7f"/>',
};
const icon = (k) => `<svg viewBox="0 0 100 100" width="44" height="44">${STOP_ICON[k] || STOP_ICON.park}</svg>`;

function common(ctl, profile, kids) {
  const { root, guard } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (host, right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => say(host, wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    $('.kt-things', root).appendChild(n);
    return n;
  }
  return { root, guard, who, kidEl, say, call, card, tap, thing };
}

// ======================= 公車 =======================
export function mountBus(stage, { profile, onExit, dest = 'theater', trip = false }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="bt-inside"><div class="bt-view"><div class="bt-strip">${BUS_SCENERY}${BUS_SCENERY}</div></div>${busInside()}<div class="bt-disp"></div></div>
    <div class="bt-goal"><svg viewBox="0 0 100 100" width="90" height="90">${STOP_ICON[dest] || STOP_ICON.park}</svg></div>
    <div class="bt-bus"></div>
    <div class="bt-gp">${GRANDPA}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 470, 640, 0.52)}
    ${charDiv('pupu', 20, 420, 0.6)}
    ${kids.map((id, i) => kidNode(id, 270 + i * 120, 870)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'pupu', { cls: 'kit transit bus', back: busStreet(ph, weather.current()) });
  const { root, guard, who, kidEl, say, card, tap, thing, call } = common(ctl, profile, kids);
  const { pause } = ctl;
  const busEl = $('.bt-bus', root);
  const goal = $('.bt-goal', root);

  async function busIn(num, stopX = 300) {
    busEl.innerHTML = busSvg(num);
    busEl.style.transition = 'none';
    busEl.style.left = '1300px';
    busEl.classList.remove('glow');
    await pause(30);
    sfx('horn');
    busEl.style.transition = 'left 1.4s cubic-bezier(.2,.7,.3,1)';
    busEl.style.left = `${stopX}px`;
    await pause(1450);
  }
  async function busOut() {
    busEl.style.transition = 'left 1.3s ease-in';
    busEl.style.left = '-760px';
    await pause(1300);
  }

  async function waitBus() {
    await say('kiki', 'bus_line');
    await say('kiki', 'bus_num');
    goal.classList.add('show');
    const order = shuffle([3, 8]);
    order.splice(Math.floor(Math.random() * 3), 0, 5);
    for (const num of order) {
      await busIn(num);
      guard();
      if (num === 5) {
        if (!hardNow(profile)) busEl.classList.add('glow');
        await call();
        await new Promise((resolve) => { busEl.onpointerdown = (e) => { e.preventDefault(); busEl.onpointerdown = null; resolve(); }; ctl.cleanups.push(() => resolve()); });
        guard();
        passTurn();
        busEl.classList.remove('glow');
        sfx('fanfare');
        await say('kiki', 'bus_num_ok');
        return;
      }
      let wrong = false;
      busEl.onpointerdown = () => { wrong = true; };
      await pause(2200);
      busEl.onpointerdown = null;
      if (wrong) { sfx('wrong'); await say('kiki', 'bus_not'); }
      await busOut();
    }
  }

  async function board() {
    await say('pupu', 'bus_welcome');
    const rd = thing('bt-reader', CARD_READER, [560, 520]);
    for (let i = 0; i < kids.length; i++) {
      await tap(rd);
      guard();
      sfx('ding');
      kidEl(kids[i]).classList.add('away');
    }
    rd.remove();
    who('kiki').classList.add('away');
    await pause(300);
    root.classList.add('inside');
    who('kiki').classList.remove('away');
    who('pupu').classList.remove('away');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [500 + i * 130, 760], 10)));
    kids.forEach((id) => kidEl(id).classList.remove('away'));
    await moveTo(who('kiki'), [1040, 760], 10);
  }

  async function ride() {
    await say('pupu', 'bus_hold');
    const st = thing('bt-strap', STRAP, [600, 150]);
    await tap(st);
    guard();
    st.remove();
    sfx('pop');
    root.classList.add('moving');
    await say('pupu', 'bus_go');
    // 讓座
    const gp = $('.bt-gp', root);
    gp.classList.add('in');
    await pause(1200);
    await say('kiki', 'bus_gp');
    await card('pupu', TR.giveSeat, [TR.keepSeat], 'bus_seat_wrong');
    gp.classList.add('sit');
    sfx('sparkle');
    await say('kiki', 'bus_gp_thanks');
  }

  async function bell() {
    const disp = $('.bt-disp', root);
    const others = shuffle(Object.keys(STOP_ICON).filter((k) => k !== dest)).slice(0, 2);
    const b = thing('bt-bell', BELL, [1020, 420]);
    await say('pupu', 'bus_bell');
    await call();
    let at = null;
    let early = false;
    const pressed = new Promise((resolve) => {
      onTap(b, () => {
        if (at === dest) { resolve(); return; }
        if (!early) { early = true; sfx('wrong'); say('pupu', 'bus_bell_early').catch(() => {}).finally(() => { early = false; }); }
      });
      ctl.cleanups.push(() => resolve());
    });
    for (const k of [...others, dest]) {
      at = k;
      disp.innerHTML = icon(k);
      sfx('ding');
      if (k === dest) {
        if (!hardNow(profile)) b.classList.add('glow');
        break;
      }
      await Promise.race([pause(2600), pressed]);
      guard();
    }
    await pressed;
    guard();
    passTurn();
    b.classList.remove('glow');
    sfx('ding');
    root.classList.remove('moving');
    await say('pupu', 'bus_stop');
    b.remove();
  }

  async function getOff() {
    root.classList.remove('inside');
    $('.bt-gp', root).classList.add('away');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [820 + i * 110, 860], 10)));
    await moveTo(who('kiki'), [700, 800], 10);
    busEl.style.transition = 'none';
    busEl.style.left = '300px';
    await say('kiki', 'bus_cross');
    await card('pupu', TR.waitBus, [TR.runFront], 'bus_cross_wrong');
    sfx('horn');
    await busOut();
    await say('kiki', 'bus_cross_ok');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [1060 + i * 60, 640], 1000)));
  }

  (async () => {
    playMusic('car');
    await wait(400);
    try {
      ctl.mode = 'act';
      who('pupu').classList.add('away');
      await say('kiki', 'bus_hello');
      await waitBus();
      await board();
      await ride();
      await bell();
      await getOff();
      await giveReward({ root, kids, reward: 'bus', series: 'pupu', say: (l) => say('pupu', l) });
      ctl.mode = 'done';
      if (trip) { await pause(300); ctl.leave('arrive'); return; }
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

// ======================= 火車 =======================
export function mountTrain(stage, { profile, onExit, to = 'suburb' }) {
  const kids = profile.members;
  const ph = phase();
  const inner = `
    <div class="tr-inside"><div class="tr-view"><div class="tr-strip">${trainScenery(to)}${trainScenery(to)}</div></div>${trainInside()}
      <div class="tr-seats">${[5, 6, 7, 8].map((n) => `<button class="tr-seat" data-n="${n}">${seatSvg(n)}</button>`).join('')}</div></div>
    <div class="tr-gate">${GATE}</div>
    <div class="tr-train">${TRAIN_SIDE}</div>
    <div class="tr-bunny b1">${BUNNY('#fff')}</div><div class="tr-bunny b2">${BUNNY('#f4e2d8')}</div>
    <div class="tr-ticket hidden">${ticketSvg(7)}</div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 560, 640, 0.52)}
    ${charDiv('pupu', 980, 560, 0.62)}
    ${kids.map((id, i) => kidNode(id, 300 + i * 120, 870)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, 'pupu', { cls: 'kit transit train', back: platformBack(ph) });
  const { root, guard, who, kidEl, say, card, tap, call } = common(ctl, profile, kids);
  const { pause } = ctl;
  const train = $('.tr-train', root);

  async function gate() {
    await say('pupu', 'tr_gate');
    const g = $('.tr-gate', root);
    for (const id of inTurnOrder(kids)) {
      await tap(g);
      guard();
      sfx('ding');
      g.classList.add('open');
      await moveTo(kidEl(id), [500 + kids.indexOf(id) * 120, 760], 700);
      g.classList.remove('open');
    }
    await moveTo(who('kiki'), [760, 800], 600);
  }

  async function platform() {
    await say('pupu', 'tr_line');
    await card('pupu', TR.behindLine, [TR.atEdge], 'tr_line_wrong');
    await say('pupu', 'tr_line_ok');
    sfx('horn');
    train.classList.add('in');
    await pause(2300);
    train.classList.add('open');
    sfx('pop');
    // 奇奇想衝進去，要先讓車上的人下車
    await moveTo(who('kiki'), [660, 640], 500);
    await say('pupu', 'tr_kiki_rush');
    const k = who('kiki');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c');
    await say('kiki', 'tr_kiki_sorry');
    await moveTo(k, [860, 800], 500);
    $$('.tr-bunny', root).forEach((b) => b.classList.add('out'));
    await pause(1800);
    await say('pupu', 'tr_board');
    kids.forEach((id) => kidEl(id).classList.add('away'));
    k.classList.add('away');
    await pause(400);
  }

  async function seat() {
    root.classList.add('inside');
    who('pupu').classList.add('away');
    const tk = $('.tr-ticket', root);
    tk.classList.remove('hidden');
    await say('pupu', 'tr_seat');
    const right = $('.tr-seat[data-n="7"]', root);
    if (!hardNow(profile)) right.classList.add('glow');
    await call();
    await new Promise((resolve) => {
      $$('.tr-seat', root).forEach((b) => onTap(b, () => {
        if (b === right) { resolve(); return; }
        sfx('wrong');
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 400);
        say('pupu', 'tr_seat_wrong').catch(() => {});
      }));
      ctl.cleanups.push(() => resolve());
    });
    guard();
    passTurn();
    right.classList.remove('glow');
    tk.classList.add('hidden');
    sfx('fanfare');
    const r = right.getBoundingClientRect();
    void r;
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), [640 + i * 120, 820], 10)));
    kids.forEach((id) => kidEl(id).classList.remove('away'));
    await say('pupu', 'tr_seat_ok');
  }

  async function ride() {
    root.classList.add('moving');
    sfx('horn');
    const k = who('kiki');
    await moveTo(k, [300, 800], 10);
    k.classList.remove('away');
    k.classList.add('running');
    await say('kiki', 'tr_kiki_run');
    await say('pupu', 'tr_run_tap');
    k.classList.add('glow-c');
    await ctl.tapOnce(k);
    guard();
    k.classList.remove('glow-c', 'running');
    await say('kiki', 'tr_kiki_ok');
    await say('pupu', `tr_view_${to}`);
    await pause(1500);
    root.classList.remove('moving');
    await say('pupu', `tr_arrive_${to}`);
  }

  (async () => {
    playMusic('car');
    await wait(400);
    try {
      ctl.mode = 'act';
      await say('pupu', 'tr_hello');
      await say('kiki', `tr_where_${to}`);
      await gate();
      await platform();
      await seat();
      await ride();
      await giveReward({ root, kids, reward: 'train', series: 'pupu', say: (l) => say('pupu', l) });
      ctl.mode = 'done';
      await pause(300);
      ctl.leave('arrive');
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

// 歡樂島海生館（11/19）：露露館長（小白鯨）帶路，奇奇陪著。照屏東國立海洋生物博物館的常設展。
//   台灣水域館（1F）：高山溪流撿垃圾 → 河口紅樹林數招潮蟹 → 觸摸池（10:30、13:30、15:30 開放，其他時間用放大鏡找）
//                    → 大洋池（10:00、13:00、16:30 潛水員餵魚）、提醒奇奇不拍玻璃
//   珊瑚王國館（1F → 下潛 B1）：海葵裡找小丑魚 → 走樓梯扶扶手 → 海底隧道慢慢走、越深越暗
//                    → 白鯨池跟白鯨唱歌、關閃光燈 → 沉船旁小聲讓花園鰻探出頭
//   世界水域館（2F → 1F）：古代海洋刷化石 → 海藻森林（二樓看上面、走樓梯到一樓看下面，撥開海藻找魚）
//                    → 深海手電筒 → 極地（10:00、14:00 海豹餵食；11:00、15:00 企鵝餵食；其他時間認企鵝）、冷要穿外套 → 大廳藍鯨骨骼
//   迎賓廣場（戶外）：天氣熱可以戲水（防曬、帽子、喝水、水邊用走的、擦乾換衣服）；涼涼的或下雨只用手玩水
// 每一區先「點點看」：點海洋生物會動，露露介紹一句（6 歲加英文）。每館做完送一個那一館的海洋生物公仔。
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import * as weather from '../core/weather.js';
import { CREATURES, creatureSvg } from '../art/sea.js';
import {
  roomBack, GLASS, tunnelStrip, TRASH, BIN, MURK, poolLid, fossilSlab, KELP_CLUMP, BUS, WHALE_BONES, JET, SUNSCREEN, SUNHAT, BOTTLE,
  DRY_CLOTHES, DIVER, KEEPER, STAIRS, STEPS, SONG_BTN, ANEMONE, SEA_CARD, NAUTILUS_CARD, FISH_CARD, CRAB_CARD,
} from '../art/aqua.js';
import { SINK, TOWEL, NUM, FOOD } from '../art/zoo.js';
import { cameraFor, NO_CAM } from '../core/camera.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { turnsOn, passTurn, freeTurns } from '../core/turns.js';
import { seaShowNow, seaShowNext } from '../ui/map.js';
import { avatarSvg } from '../art/characters.js';

const HOST = 'lulu';
// 每一館：樓層（由上到下）、展區順序、獎勵
export const HALLS = {
  tw: { floors: ['1F'], reward: 'sea_tw', series: 'fig_tw', rooms: ['stream', 'mangrove', 'touch', 'ocean'] },
  coral: { floors: ['1F', 'B1'], reward: 'sea_coral', series: 'fig_coral', rooms: ['reef', 'tunnel', 'beluga', 'wreck'] },
  world: { floors: ['2F', '1F'], reward: 'sea_world', series: 'fig_world', rooms: ['ancient', 'kelptop', 'kelp', 'deep', 'polar', 'lobby'] },
  plaza: { floors: null, reward: 'plaza', series: 'lulu', rooms: ['plaza'] },
};
// 每一區：在哪一層、放哪些海洋生物 [id, 中心 x, 中心 y, 大小, 往右]、關卡、要不要先點點看
const ROOMS = {
  stream: { floor: '1F', show: [['salmon', 360, 430, 210], ['salmon', 780, 360, 180, true], ['salmon', 600, 540, 160]], station: 'trash', explore: 'after', hide: true },
  mangrove: { floor: '1F', show: [['mudskipper', 200, 560, 150], ['mudskipper', 1020, 560, 140, true]], station: 'crabs' },
  touch: { floor: '1F', show: [], station: 'touch', explore: false, kiki: [380, 856] },
  ocean: { floor: '1F', show: [['shark', 340, 300, 340], ['ray', 860, 520, 260, true], ['pomfret', 780, 230, 260]], station: 'ocean' },
  reef: { floor: '1F', show: [['butterfly', 300, 250, 140], ['butterfly', 920, 330, 120, true], ['turtle', 620, 220, 230]], station: 'nemo' },
  tunnel: { floor: 'B1', show: [], station: 'tunnel', explore: false },
  beluga: { floor: 'B1', show: [['beluga', 420, 330, 380], ['beluga', 840, 470, 300, true]], station: 'song' },
  wreck: { floor: 'B1', show: [260, 380, 500, 640, 780, 900].map((x, i) => ['gardeneel', x, 540 + (i % 2) * 24, 190]), station: 'eels', explore: false },
  ancient: { floor: '2F', show: [['nautilus', 840, 260, 170], ['trilobite', 300, 540, 150]], station: 'fossil' },
  kelptop: { floor: '2F', show: [], station: null, explore: false },
  kelp: { floor: '1F', show: [], station: 'kelp', explore: false },
  deep: { floor: '1F', show: [], station: 'dark', explore: false },
  polar: { floor: '1F', show: [['king', 200, 350, 190], ['adelie', 430, 380, 140], ['chinstrap', 640, 360, 140], ['macaroni', 860, 380, 140], ['seal', 560, 580, 230], ['puffin', 1050, 340, 120]], station: 'polar' },
  lobby: { floor: '1F', show: [], station: 'whale', explore: false },
  plaza: { floor: null, show: [], station: 'plaza', explore: false },
};
const KIKI = [560, 856];
const LULU = [1050, 820];

export function mountSea(stage, { profile, onExit, hall = 'tw', from = null }) {
  // from：測試用，從某一區開始
  const H0 = HALLS[hall];
  const H = from && H0.rooms.includes(from) ? { ...H0, rooms: H0.rooms.slice(H0.rooms.indexOf(from)) } : H0;
  const kids = profile.members;
  const ph = phase();
  const wx = weather.current();
  const outdoor = hall === 'plaza';
  const floorsHtml = H.floors ? `<div class="sea-floors">${H.floors.map((f) => `<div class="sf" data-f="${f}"><span>${f}</span></div>`).join('')}</div>` : '';
  const inner = `
    <div class="sea-fx"></div>
    <div class="sea-cr"></div>
    ${outdoor ? '' : `<div class="sea-glass">${GLASS}</div>`}
    <div class="kt-things"></div>
    ${charDiv('kiki', KIKI[0] - 60, KIKI[1] - 160, 0.5)}
    ${charDiv(HOST, LULU[0] - 74, LULU[1] - 198, 0.62)}
    ${kids.map((id, i) => kidNode(id, 150 + i * 130, 880)).join('')}
    <div class="sea-lens hidden"></div>
    <div class="zo-flash"></div>
    <div class="sea-stairs hidden"><div class="ss-steps">${STAIRS}</div><div class="ss-kids">${kids.map((id) => `<div class="ss-kid">${avatarSvg(id, 70)}</div>`).join('')}</div></div>
    ${floorsHtml}
    <div class="kt-cards hidden"></div>`;
  const first = H.rooms[0];
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: `kit sea hall-${hall} room-${first}${outdoor ? ' outdoor' : ''}`, back: roomBack(first, ph, wx) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const hard = () => hardNow(profile);
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hard(), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  const things = $('.kt-things', root);
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const crLayer = $('.sea-cr', root);
  const fx = $('.sea-fx', root);
  const night = ph === 'night' || ph === 'dusk';
  const cam = cameraFor(root, outdoor
    ? { preset: 'outdoor', back: $('.p-layer', root), mid: [crLayer] }
    : { preset: 'aqua', back: $('.p-layer', root), mid: [crLayer], foreArt: '' }) || NO_CAM;
  let room = first;
  const kikiAt = () => ROOMS[room].kiki || KIKI;
  let exploring = false;
  let exploreQueue = Promise.resolve();
  let stairsTaught = false;
  const done = { touch: false };   // 做到了什麼（最後說原因用）

  function react(n, cls = 'react', ms = 700) {
    n.classList.remove(cls);
    void n.offsetWidth;
    n.classList.add(cls);
    setTimeout(() => n.classList.remove(cls), ms);
  }
  // ---------- 海洋生物 ----------
  function placeCreatures(list, hide = false) {
    crLayer.innerHTML = list.map(([id, x, y, size, flip], i) => {
      const w = size || CREATURES[id].size;
      return `<button class="sea-an an-${id}${flip ? ' flip' : ''}${hide ? ' away' : ''}" data-id="${id}" data-i="${i}" style="left:${x - w / 2}px;top:${y - w / 2}px;width:${w}px;height:${w}px;--d:${(i * 0.9).toFixed(1)}s;--t:${(5 + (i % 3) * 1.5).toFixed(1)}s">${creatureSvg(id, '100%')}</button>`;
    }).join('');
    $$('.sea-an', crLayer).forEach((n) => onTap(n, () => poke(n)));
  }
  const crNode = (id) => $(`.sea-an[data-id="${id}"]`, crLayer);
  function addCreature(id, [x, y], size, { flip = false, cls = '' } = {}) {
    const w = size || CREATURES[id].size;
    const n = el(`<button class="sea-an an-${id}${flip ? ' flip' : ''} ${cls}" data-id="${id}" style="left:${x - w / 2}px;top:${y - w / 2}px;width:${w}px;height:${w}px">${creatureSvg(id, '100%')}</button>`);
    crLayer.appendChild(n);
    onTap(n, () => poke(n));
    return n;
  }
  // 點海洋生物：動一下、出聲音；探索時間露露介紹
  async function poke(n) {
    const id = n.dataset.id;
    sfx(CREATURES[id].sound);
    react(n);
    const r = ctl.rectOf(n);
    cam.look(r.x + r.w / 2, r.y + r.h / 2);
    if (!exploring || n.classList.contains('met')) return;
    $$(`.sea-an[data-id="${id}"]`, crLayer).forEach((x) => { x.classList.add('met'); x.classList.remove('glow-an'); });
    exploreQueue = exploreQueue.then(() => intro(id)).catch(() => {});
  }
  async function intro(id) {
    if (!ctl.alive) return;
    await speak(HOST, `sn_${id}`, { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
    if (hard() && ctl.alive) await speak(HOST, `se_${id}`, { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
  }
  // 點點看：每一種都點過一次
  async function explore() {
    const ns = [...new Map($$('.sea-an', crLayer).map((n) => [n.dataset.id, n])).values()];
    if (!ns.length) return;
    ns.forEach((n) => n.classList.add('glow-an'));
    exploring = true;
    freeTurns(true);
    await new Promise((resolve) => {
      const t = setInterval(() => { if (!ctl.alive || ns.every((n) => n.classList.contains('met'))) { clearInterval(t); resolve(); } }, 200);
      ctl.cleanups.push(() => { clearInterval(t); resolve(); });
    });
    freeTurns(false);
    await exploreQueue;
    exploring = false;
    guard();
  }

  // ---------- 換展區、換樓層 ----------
  const floorOf = (r) => ROOMS[r].floor;
  function paintFloor(f) {
    $$('.sea-floors .sf', root).forEach((n) => n.classList.toggle('on', n.dataset.f === f));
  }
  async function walkOut() {
    sfx('whoosh');
    const all = [...kids.map(kidEl), who('kiki'), who(HOST)];
    await Promise.all(all.map((n) => { const r = ctl.rectOf(n); return moveTo(n, [r.x + r.w / 2 + 900, r.y + r.h], 700); }));
    guard();
  }
  async function walkIn() {
    const spots = [...kids.map((id, i) => [kidEl(id), [215 + i * 130, 880]]), [who('kiki'), kikiAt()], [who(HOST), LULU]];
    spots.forEach(([n]) => { n.style.transition = 'none'; const r = ctl.rectOf(n); n.style.left = `${-300 - r.w}px`; });
    void root.offsetWidth;
    await Promise.all(spots.map(([n, p]) => moveTo(n, p, 800)));
    guard();
  }
  // 走樓梯：第一次要先學扶著扶手慢慢走（在原來的展區問，問完再走過去）
  async function teachStairs() {
    if (stairsTaught) return;
    stairsTaught = true;
    await host(hall === 'coral' ? 'sea_down_coral' : 'sea_down_world');
    await host('sea_stairs_q');
    await card(SEA_CARD.rail, [SEA_CARD.stairsrun], 'sea_stairs_wrong');
    await host('sea_stairs_ok');
  }
  async function stairs(down) {
    const s = $('.sea-stairs', root);
    s.classList.remove('hidden', 'go');
    s.classList.toggle('up', !down);
    void s.offsetWidth;
    s.classList.add('go');
    for (let i = 0; i < 6; i += 1) { sfx('tap'); await pause(260); }
    await pause(300);
    s.classList.add('hidden');
  }
  async function goRoom(next) {
    const f0 = floorOf(room);
    const f1 = floorOf(next);
    const climb = f0 && f1 && f0 !== f1;
    if (climb) await teachStairs();
    await walkOut();
    things.innerHTML = '';
    root.classList.add('swap');
    await pause(350);
    if (climb) {
      const order = H.floors;
      await stairs(order.indexOf(f1) > order.indexOf(f0));
      paintFloor(f1);
    }
    $('.p-layer', root).innerHTML = roomBack(next, ph, wx);
    root.className = root.className.replace(/room-\w+/, `room-${next}`);
    room = next;
    placeCreatures(ROOMS[next].show, ROOMS[next].hide);
    fx.innerHTML = '';
    root.classList.remove('swap');
    await walkIn();
  }

  // ---------- 共用的小工具 ----------
  // 奇奇做錯事 → 點奇奇 → 選對的做法
  async function kikiRule({ act, kikiLine, tapLine, q, right, wrong, wrongLine, okLine, onAct = null, near = null }) {
    const kk = who('kiki');
    if (near) await moveTo(kk, near, 500);
    kk.classList.add(act);
    await say('kiki', kikiLine);
    if (onAct) await onAct();
    sfx('wrong');
    await host(tapLine);
    kk.classList.add('glow-c');
    await ctl.tapOnce(kk);
    guard();
    kk.classList.remove('glow-c', act);
    if (q) await host(q);
    await card(right, [wrong], wrongLine);
    await say('kiki', 'zr_kiki_sorry');
    await host(okLine);
    await moveTo(kk, kikiAt(), 400);
  }
  // 拖一下（輕輕摸、刷化石）：回傳 'slow'、'fast'；min 是最少要拖多遠
  function stroke(node, { min = 50, onMove = null } = {}) {
    return new Promise((resolve) => {
      let start = null;
      let last = null;
      let dist = 0;
      const k = () => stage.getBoundingClientRect().width / 1200;
      const down = (e) => { e.preventDefault(); start = performance.now(); last = [e.clientX, e.clientY]; dist = 0; node.classList.add('touching'); };
      const move = (e) => {
        if (!start) return;
        const d = Math.hypot(e.clientX - last[0], e.clientY - last[1]) / k();
        dist += d;
        last = [e.clientX, e.clientY];
        onMove?.(dist, e);
      };
      const up = () => {
        if (!start) return;
        const ms = performance.now() - start;
        node.classList.remove('touching');
        start = null;
        if (dist < min) return;
        off();
        resolve(dist / Math.max(ms, 1) > 0.9 ? 'fast' : 'slow');
      };
      const off = () => { node.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      node.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      ctl.cleanups.push(() => { off(); resolve('slow'); });
    });
  }
  // 放大鏡／手電筒：整片暗暗的，手指拖著鏡頭找；targets：[{ at: [x, y], found: async () => {} }]
  async function lens(kind, targets) {
    cam.hold(true);
    const L = $('.sea-lens', root);
    L.className = `sea-lens lk-${kind}`;
    const setLens = (e) => {
      const r = stage.getBoundingClientRect();
      const s = r.width / 1200;
      pos = [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
      L.style.setProperty('--x', `${pos[0]}px`);
      L.style.setProperty('--y', `${pos[1]}px`);
    };
    let pos = [600, 400];
    L.style.setProperty('--x', '600px');
    L.style.setProperty('--y', '400px');
    L.addEventListener('pointerdown', setLens);
    L.addEventListener('pointermove', setLens);
    const off = () => { L.removeEventListener('pointerdown', setLens); L.removeEventListener('pointermove', setLens); };
    ctl.cleanups.push(off);
    for (const t of targets) {
      const [tx, ty] = t.at;
      if (!hard()) L.insertAdjacentHTML('beforeend', `<div class="zo-hint" style="left:${tx - 40}px;top:${ty - 40}px"></div>`);
      await call();
      await new Promise((resolve) => {
        let since = 0;
        const iv = setInterval(() => {
          if (!ctl.alive) { clearInterval(iv); resolve(); return; }
          const d = Math.hypot(pos[0] - tx, pos[1] - ty);
          since = d < 110 ? since + 100 : 0;
          if (since >= 200 || d < 60) { clearInterval(iv); resolve(); }
        }, 100);
        ctl.cleanups.push(() => { clearInterval(iv); resolve(); });
      });
      guard();
      passTurn();
      $$('.zo-hint', L).forEach((h) => h.remove());
      sfx('sparkle');
      const sr = stage.getBoundingClientRect();
      const s = sr.width / 1200;
      burst(sr.left + tx * s, sr.top + ty * s, { n: 12, kind: 'star', spread: 140 });
      await t.found();
    }
    off();
    L.classList.add('hidden');
    cam.hold(false);
  }
  // 洗手（摸觸摸池前後）
  async function washHands(line) {
    await host(line);
    const sink = thing('zo-sink', SINK, [620, 510]);
    const towel = thing('zo-towel', TOWEL, [850, 600]);
    await tap(sink);
    guard();
    sink.classList.add('water');
    sfx('splash');
    const c = centerOf(sink);
    for (let i = 0; i < 3; i += 1) { burst(c.x, c.y, { n: 6, kind: 'bubble', spread: 110 }); await pause(450); }
    sink.classList.remove('water');
    await tap(towel);
    guard();
    sfx('sparkle');
    [sink, towel].forEach((n) => n.remove());
  }

  // ======================= 台灣水域館 =======================
  // 高山溪流：撿垃圾，溪水變乾淨，櫻花鉤吻鮭游出來
  async function stTrash() {
    $$('.sea-an', crLayer).forEach((n) => n.classList.add('away'));
    fx.innerHTML = `<div class="sea-murk">${MURK}</div>`;
    const spots = [[260, 300], [520, 380], [760, 290], [960, 400]];
    const items = shuffle(Object.keys(TRASH)).map((k, i) => thing(`sea-trash t-${k}`, TRASH[k], spots[i]));
    const bin = thing('sea-bin', BIN, [780, 730]);
    bin.style.pointerEvents = 'none';
    await host('st_trash');
    const br = ctl.rectOf(bin);
    let left = items.length;
    await tapEach(items, async (n) => {
      sfx('pop');
      await moveTo(n, [br.x + br.w / 2, br.y + 40], 600);
      n.remove();
      sfx('ding');
      left -= 1;
      $('.sea-murk', fx).style.opacity = String(left / items.length);
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    if (hard()) {
      await host('st_trash_q');
      await card(SEA_CARD.bin, [SEA_CARD.river], 'st_trash_wrong');
    }
    fx.innerHTML = '';
    bin.remove();
    $$('.sea-an', crLayer).forEach((n) => { n.classList.remove('away'); n.classList.add('swimin'); });
    sfx('splash');
    await host('st_trash_ok');
  }
  // 河口紅樹林：招潮蟹從洞裡跑出來（有大螯的是男生）
  async function stCrabs() {
    await host('st_crab');
    const holes = [[300, 560], [520, 600], [740, 570], [960, 600], [620, 520]];
    const big = shuffle([true, true, true, false, false]);
    for (const i of shuffle([0, 1, 2, 3, 4])) {
      const [x, y] = holes[i];
      const c = addCreature('fiddler', [x, y - 50], 150, { flip: i % 2 === 1, cls: `crab-up${big[i] ? '' : ' nobig'}` });
      sfx('clack');
      if (!hard()) c.classList.add('glow-an');
      await tap(c);
      guard();
      sfx('pop');
      c.classList.remove('glow-an');
      c.classList.add('counted');
      react(c, 'happy', 900);
      await pause(250);
    }
    if (hard()) {
      await host('st_crab_q');
      await card(NUM(3), [NUM(2), NUM(5)], 'st_crab_wrong');
    }
    await host('st_crab_ok');
  }
  // 觸摸池：開放時間洗手、一根手指輕輕摸、不能帶回家、摸完再洗手；休息時間用放大鏡找
  async function stTouch() {
    const open = seaShowNow('touch') != null;
    const pool = [['seastar', [380, 560], 150], ['seacuke', [620, 580], 170], ['seahare', [860, 560], 150]];
    if (open) {
      done.touch = true;
      pool.forEach(([id, p, s]) => addCreature(id, p, s));
      await host('st_touch_open');
      await washHands('st_touch_wash1');
      await host('st_touch_how');
      cam.hold(true);
      const order = shuffle(pool.map((p) => p[0]));
      for (let i = 0; i < order.length; i += 1) {
        const c = crNode(order[i]);
        if (turnsOn()) await call();
        c.classList.add('glow-an', 'stroke-hint');
        for (;;) {
          const how = await stroke(c);
          guard();
          if (how === 'fast') {
            sfx('wrong');
            react(c, 'scared', 900);
            await host('st_touch_fast');
            continue;
          }
          break;
        }
        c.classList.remove('glow-an', 'stroke-hint');
        sfx('heart');
        const cc = centerOf(c);
        burst(cc.x, cc.y - 30, { n: 8, kind: 'heart', spread: 110 });
        react(c, 'happy', 900);
        if (turnsOn()) passTurn();
        await speak(HOST, `sn_${order[i]}`, { name: profile.name, who: profile.id, node: who(HOST) });
        guard();
      }
      cam.hold(false);
      await host('st_touch_q');
      await card(SEA_CARD.putback, [SEA_CARD.takehome], 'st_touch_wrong');
      await host('st_touch_ok');
      await washHands('st_touch_wash2');
      return;
    }
    // 休息時間：池子蓋起來，牆上時鐘指著下一場；先用放大鏡找躲在石頭縫的小動物
    const next = seaShowNext('touch');
    fx.innerHTML = `<div class="sea-lid">${poolLid(next)}</div>`;
    await host(next == null ? 'st_touch_closed_done' : `st_touch_closed_${String(next).replace('.', '_')}`);
    fx.innerHTML = '';
    const hide = [['crab', [250, 600], 120], ['urchin', [930, 610], 120], ['seastar', [600, 640], 110]];
    hide.forEach(([id, p, s]) => addCreature(id, p, s, { cls: 'hidden-rock' }));
    await host('st_touch_look');
    await lens('glass', hide.map(([id, p]) => ({
      at: p,
      found: async () => { const c = crNode(id); c.classList.remove('hidden-rock'); c.classList.add('found'); sfx(CREATURES[id].sound); await intro(id); guard(); },
    })));
    await host('st_look_ok');
  }
  // 大洋池：餵食時間看潛水員餵魚；提醒奇奇不拍玻璃
  async function stOcean() {
    if (seaShowNow('ocean') != null) {
      done.oceanFeed = true;
      await host('st_feed_ocean');
      const dv = thing('sea-diver', DIVER, [480, 160]);
      dv.classList.add('swimin');
      await tapEach([dv], async () => {
        sfx('splash');
        const c = centerOf(dv);
        burst(c.x, c.y + 40, { n: 18, kind: 'bubble', spread: 220 });
        $$('.sea-an', crLayer).forEach((n) => { n.classList.add('rush'); });
        await wait(1400);
        $$('.sea-an', crLayer).forEach((n) => n.classList.remove('rush'));
      }, { free: true, cleanups: ctl.cleanups, alive: () => ctl.alive });
      guard();
      await host('st_feed_ocean_ok');
      dv.remove();
    }
    const shark = crNode('shark');
    await kikiRule({
      act: 'knocking', kikiLine: 'sk_glass', tapLine: 'st_glass_tap', q: 'st_glass_q',
      right: SEA_CARD.gentle, wrong: SEA_CARD.knock, wrongLine: 'st_glass_wrong', okLine: 'st_glass_ok',
      near: [420, 830], onAct: async () => { sfx('drum'); react(shark, 'scared', 1200); },
    });
  }

  // ======================= 珊瑚王國館 =======================
  // 海葵裡找小丑魚
  async function stNemo() {
    await host('st_nemo');
    const spots = [[200, 640], [420, 660], [640, 640], [860, 660], [1060, 640]];
    const has = shuffle([true, true, true, false, false]);
    const anes = spots.map(([x, y], i) => thing(`sea-anemone${has[i] ? ' has' : ''}`, ANEMONE(['#ff9fc4', '#c77dff', '#ffb35c', '#ff9fc4', '#7be0c0'][i]), [x - 80, y - 130]));
    let found = 0;
    freeTurns(true);
    await new Promise((resolve) => {
      let busy = false;
      if (!hard()) anes.forEach((a) => { if (a.classList.contains('has')) a.classList.add('glow'); });
      anes.forEach((a) => onTap(a, async () => {
        if (busy || a.classList.contains('done')) return;
        busy = true;
        if (!a.classList.contains('has')) {
          sfx('wrong');
          react(a, 'nope', 400);
          busy = false;
          return;
        }
        a.classList.add('done');
        a.classList.remove('glow');
        sfx('bubble');
        const r = ctl.rectOf(a);
        const f = addCreature('clownfish', [r.x + r.w / 2, r.y + 20], 110, { cls: 'popout' });
        f.style.pointerEvents = 'none';
        found += 1;
        busy = false;
        if (found >= 3) resolve();
      }));
      ctl.cleanups.push(() => resolve());
    });
    freeTurns(false);
    guard();
    if (hard()) {
      await host('st_nemo_q');
      await card(NUM(3), [NUM(2), NUM(4)], 'st_nemo_wrong');
    }
    await host('st_nemo_ok');
  }
  // 海底隧道：點腳印慢慢走，奇奇想跑；越往下越暗
  async function stTunnel() {
    fx.innerHTML = `<div class="sea-strip"><div class="sea-strip-in">${tunnelStrip()}${tunnelStrip()}</div></div>`;
    const steps = thing('sea-steps', STEPS, [330, 590]);
    const walkOnce = async () => {
      await tap(steps);
      guard();
      sfx('pop');
      root.classList.add('walking');
      await pause(900);
      root.classList.remove('walking');
    };
    await host('st_walk');
    await walkOnce();
    await walkOnce();
    steps.classList.add('hidden');
    await kikiRule({
      act: 'running', kikiLine: 'sk_run', tapLine: 'st_run_tap', q: 'st_run_q',
      right: SEA_CARD.walk, wrong: SEA_CARD.run, wrongLine: 'st_run_wrong', okLine: 'st_run_ok',
      near: [900, 856],
    });
    steps.classList.remove('hidden');
    await walkOnce();
    await walkOnce();
    steps.remove();
    root.classList.add('deeper');
    await host('st_deep');
    if (hard()) {
      await host('st_deep_q');
      await card(SEA_CARD.dark, [SEA_CARD.bright], 'st_deep_wrong');
    }
    await host('st_deep_ok');
    root.classList.remove('deeper');
  }
  // 白鯨池：跟白鯨唱一樣的歌；奇奇開閃光燈
  async function stSong() {
    await host('st_song');
    const btns = [0, 1, 2].map((k) => thing(`sea-note n${k}`, SONG_BTN(k), [380 + k * 170, 560]));
    const whale = crNode('beluga');
    const play = async (seq) => {
      for (const k of seq) {
        sfx(`note${k + 1}`);
        react(whale, 'sing', 500);
        btns[k].classList.add('lit');
        await pause(520);
        btns[k].classList.remove('lit');
        await pause(120);
      }
    };
    for (let r = 0; r < 2; r += 1) {
      await call();
      const len = hard() ? 3 : 2;
      // 每個音都跟前一個不一樣
      const seq = [Math.floor(Math.random() * 3)];
      while (seq.length < len) seq.push((seq[seq.length - 1] + 1 + Math.floor(Math.random() * 2)) % 3);
      await pause(300);
      await play(seq);
      window.__seaSong = seq;   // 測試用
      let i = 0;
      await new Promise((resolve) => {
        const hs = btns.map((b, k) => {
          const h = async (e) => {
            e.preventDefault();
            sfx(`note${k + 1}`);
            react(b, 'react', 300);
            if (k === seq[i]) {
              i += 1;
              if (i >= seq.length) { btns.forEach((x, j) => x.removeEventListener('pointerdown', hs[j])); resolve(); }
              return;
            }
            i = 0;
            btns.forEach((x) => { x.style.pointerEvents = 'none'; });
            await speak(HOST, 'st_song_again', { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
            if (!ctl.alive) return;
            await play(seq).catch(() => {});
            btns.forEach((x) => { x.style.pointerEvents = ''; });
          };
          b.addEventListener('pointerdown', h);
          return h;
        });
        ctl.cleanups.push(() => { btns.forEach((x, j) => x.removeEventListener('pointerdown', hs[j])); resolve(); });
      });
      guard();
      passTurn();
      sfx('whale');
      react(whale, 'happy', 900);
      const c = centerOf(whale);
      burst(c.x, c.y, { n: 12, kind: 'heart', spread: 160 });
      await pause(700);
    }
    btns.forEach((b) => b.remove());
    await host('st_song_ok');
    await kikiRule({
      act: 'flashing', kikiLine: 'sk_flash', tapLine: 'st_flash_tap', q: 'st_flash_q',
      right: SEA_CARD.noflash, wrong: SEA_CARD.flash, wrongLine: 'st_flash_wrong', okLine: 'st_flash_ok',
      onAct: async () => { const f = $('.zo-flash', root); f.classList.add('on'); sfx('pop'); setTimeout(() => f.classList.remove('on'), 300); $$('.sea-an[data-id="beluga"]', crLayer).forEach((w) => react(w, 'scared', 1200)); },
    });
  }
  // 沉船：奇奇大叫，花園鰻躲進沙子；小聲以後一隻一隻探出頭
  async function stEels() {
    const eels = $$('.sea-an[data-id="gardeneel"]', crLayer);
    eels.forEach((e) => { e.style.pointerEvents = 'none'; });
    await kikiRule({
      act: 'shouting', kikiLine: 'sk_eel', tapLine: 'st_eel_tap', q: 'st_eel_q',
      right: SEA_CARD.quiet, wrong: SEA_CARD.loud, wrongLine: 'st_eel_wrong', okLine: 'st_eel_ok',
      onAct: async () => { eels.forEach((e) => e.classList.add('eel-down')); sfx('whoosh'); },
    });
    const n = hard() ? 5 : 4;
    const show = shuffle(eels).slice(0, n);
    await intro('gardeneel');
    guard();
    await host('st_eel_tap2');
    let count = 0;
    for (const e of show) {
      e.classList.remove('eel-down');
      e.style.pointerEvents = '';
      e.classList.add('glow-an');
      sfx('bubble');
      await tap(e);
      guard();
      e.classList.remove('glow-an');
      count += 1;
      e.insertAdjacentHTML('beforeend', `<div class="zo-num">${count}</div>`);
      sfx('pop');
      await pause(200);
    }
    if (hard()) {
      await host('st_eel_count');
      await card(NUM(5), [NUM(3), NUM(4)], 'st_eel_count_wrong');
    }
    await host('st_eel_good');
  }

  // ======================= 世界水域館 =======================
  // 古代海洋：刷掉沙子，看到化石
  async function stFossil() {
    await host('st_fossil');
    const kinds = ['tri', 'amm'];
    for (let i = 0; i < kinds.length; i += 1) {
      const slab = thing('sea-slab', fossilSlab(kinds[i]), [kinds.length > 1 ? 300 + i * 360 : 470, 300]);
      slab.classList.add('glow');
      if (turnsOn()) await call();
      const dust = $$('.dust circle', slab);
      // 刷一刷：手指在石頭上來回刷，刷的距離加起來夠了，沙子就掉光（中間放開手也沒關係）
      await new Promise((resolve) => {
        let last = null;
        let dist = 0;
        let gone = 0;
        const k = () => stage.getBoundingClientRect().width / 1200;
        const down = (e) => { e.preventDefault(); last = [e.clientX, e.clientY]; };
        const move = (e) => {
          if (!last) return;
          dist += Math.hypot(e.clientX - last[0], e.clientY - last[1]) / k();
          last = [e.clientX, e.clientY];
          const want = Math.min(dust.length, Math.floor(dist / 22));
          while (gone < want) { dust[gone].style.opacity = '0'; gone += 1; if (gone % 4 === 0) sfx('brush'); }
          if (gone >= dust.length) { off(); resolve(); }
        };
        const up = () => { last = null; };
        const off = () => { slab.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        slab.addEventListener('pointerdown', down);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        ctl.cleanups.push(() => { off(); resolve(); });
      });
      guard();
      dust.forEach((d) => { d.style.opacity = '0'; });
      slab.classList.remove('glow');
      if (turnsOn()) passTurn();
      sfx('sparkle');
      const c = centerOf(slab);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 160 });
      await host(kinds[i] === 'tri' ? 'st_fossil_tri' : 'st_fossil_amm');
    }
    if (hard()) {
      await host('st_fossil_q');
      await card(NAUTILUS_CARD, [FISH_CARD, CRAB_CARD], 'st_fossil_wrong');
      await host('st_fossil_ok');
    }
    $$('.sea-slab', things).forEach((n) => n.remove());
  }
  // 海藻森林（一樓）：撥開海藻，後面躲著魚
  async function stKelp() {
    await host('st_kelp');
    const hide = [['grouper', [300, 470], 200], ['urchin2', [640, 600], 120], ['grouper', [940, 380], 170, true]];
    hide.forEach(([id, p, s, f]) => addCreature(id, p, s, { flip: !!f, cls: 'behind' }));
    const clumps = hide.map(([, [x, y]]) => thing('sea-kelp', KELP_CLUMP, [x - 80, y - 300]));
    const fishes = $$('.sea-an.behind', crLayer);
    await tapEach(clumps, async (k) => {
      const i = clumps.indexOf(k);
      k.classList.add('apart');
      sfx('whoosh');
      const f = fishes[i];
      f.classList.remove('behind');
      f.classList.add('found');
      sfx(CREATURES[f.dataset.id].sound);
      await wait(400);
    }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    await intro('grouper');
    await intro('urchin2');
    await host('st_kelp_ok');
  }
  // 深海：黑黑的，燈籠魚自己會發光；打開手電筒找其他動物
  async function stDark() {
    const lamp = addCreature('lantern', [820, 300], 190, { cls: 'glowfish' });
    const hide = [['isopod', [300, 600], 190], ['spidercrab', [620, 520], 230], ['jelly', [440, 240], 170]];
    hide.forEach(([id, p, s]) => addCreature(id, p, s, { cls: 'indark' }));
    await host('st_dark');
    lamp.classList.add('glow-an');
    await tap(lamp);
    guard();
    lamp.classList.remove('glow-an');
    sfx('sparkle');
    await intro('lantern');
    await host('st_light');
    await lens('torch', hide.map(([id, p]) => ({
      at: p,
      found: async () => { const c = crNode(id); c.classList.remove('indark'); c.classList.add('found'); sfx(CREATURES[id].sound); await intro(id); guard(); },
    })));
    await host('st_dark_ok');
  }
  // 極地：餵食時間看保育員餵海豹或企鵝；不然認企鵝。最後：冷的時候要穿外套
  async function stPolar() {
    const sealShow = seaShowNow('seal') != null;
    const pgShow = seaShowNow('penguin') != null;
    if (sealShow || pgShow) {
      const k = sealShow ? 'seal' : 'penguin';
      done.polarFeed = k;
      const kp = thing('sea-keeper', KEEPER, [700, 200]);
      kp.style.pointerEvents = 'none';
      await host(`st_feed_${k}`);
      await host('st_feed_food');
      await card(FOOD.fish, [FOOD.candy, FOOD.cake], 'st_feed_wrong');
      const targets = sealShow ? [crNode('seal')] : ['king', 'adelie', 'chinstrap', 'macaroni'].map(crNode);
      await host('st_feed_toss');
      await tapEach(targets.length > 1 ? targets.slice(0, kids.length > 1 ? 4 : 3) : [targets[0]], async (t) => {
        sfx(CREATURES[t.dataset.id].sound);
        const kr = ctl.rectOf(kp);
        const tr = ctl.rectOf(t);
        const f = thing('zo-food', `<svg viewBox="0 0 100 100" width="70" height="70">${FOOD.fish}</svg>`, [kr.x + kr.w - 20, kr.y + 120]);
        await moveTo(f, [tr.x + tr.w / 2, tr.y + tr.h / 2 + 30], 600);
        f.remove();
        react(t, 'happy', 900);
      }, { free: true, cleanups: ctl.cleanups, alive: () => ctl.alive });
      guard();
      await host(`st_feed_ok_${k}`);
      kp.remove();
    } else {
      // 四種企鵝：6 歲聽特徵找是哪一種；3 歲點企鵝讓牠跳下水
      const kinds = shuffle(['king', 'adelie', 'chinstrap', 'macaroni']);
      const rounds = turnsOn() ? 4 : 3;
      for (let r = 0; r < rounds; r += 1) {
        await call();
        const pg = ['king', 'adelie', 'chinstrap', 'macaroni'].map(crNode);
        if (hardNow(profile)) {
          const want = kinds[r % 4];
          await host(`st_pg_${want}`);
          await new Promise((resolve) => {
            const hs = pg.map((p) => {
              const h = async (e) => {
                e.preventDefault();
                if (p.dataset.id === want) { pg.forEach((x, j) => x.removeEventListener('pointerdown', hs[j])); resolve(); return; }
                sfx('wrong');
                react(p, 'nope', 400);
                await speak(HOST, 'st_pg_wrong', { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
                crNode(want).classList.add('glow-an');
              };
              p.addEventListener('pointerdown', h);
              return h;
            });
            ctl.cleanups.push(() => { pg.forEach((x, j) => x.removeEventListener('pointerdown', hs[j])); resolve(); });
          });
          guard();
          const p = crNode(want);
          p.classList.remove('glow-an');
          sfx('sparkle');
          react(p, 'happy', 900);
          sfx('penguin');
        } else {
          await host('st_pg_easy');
          pg.forEach((p) => p.classList.add('glow-an'));
          const p = await new Promise((resolve) => {
            const hs = pg.map((x) => { const h = (e) => { e.preventDefault(); pg.forEach((y, j) => y.removeEventListener('pointerdown', hs[j])); resolve(x); }; x.addEventListener('pointerdown', h); return h; });
            ctl.cleanups.push(() => { pg.forEach((y, j) => y.removeEventListener('pointerdown', hs[j])); resolve(pg[0]); });
          });
          guard();
          pg.forEach((x) => x.classList.remove('glow-an'));
          sfx('penguin');
          p.classList.add('dive');
          sfx('splash');
          await pause(1200);
          p.classList.remove('dive');
        }
        passTurn();
        await pause(300);
      }
    }
    await host('st_cold');
    await card(SEA_CARD.jacket, [SEA_CARD.tshirt], 'st_cold_wrong');
    await host('st_cold_ok');
  }
  // 大廳：藍鯨骨骼有兩台公車那麼長
  async function stWhale() {
    fx.innerHTML = `<div class="sea-bones">${WHALE_BONES}</div>`;
    await host('st_whale_look');
    await host('st_whale');
    const slots = [[50, 300], [570, 300]];
    const bus = thing('sea-bus ghost', BUS, slots[0]);
    for (let i = 0; i < 2; i += 1) {
      await tap(bus);
      guard();
      sfx('horn');
      const b = thing('sea-bus placed', BUS, slots[i]);
      b.style.pointerEvents = 'none';
      if (i === 0) { bus.style.left = `${slots[1][0]}px`; } else bus.remove();
    }
    if (hard()) {
      await host('st_whale_q');
      await card(NUM(2), [NUM(1), NUM(3)], 'st_whale_wrong');
    }
    await host('st_whale_ok');
  }

  // ======================= 迎賓廣場 =======================
  const warm = () => !wx.cold && !['rain', 'storm', 'snow'].includes(wx.kind) && (wx.hot || (wx.temp != null && wx.temp >= 26)) && !night;
  async function jets(n) {
    const spots = [[300, 520], [460, 560], [620, 520], [780, 560], [940, 520]];
    freeTurns(true);
    for (let i = 0; i < n; i += 1) {
      const [x, y] = spots[Math.floor(Math.random() * spots.length)];
      const j = thing('sea-jet', JET, [x - 40, y - 200]);
      sfx('splash');
      await new Promise((resolve) => {
        const t = setTimeout(resolve, 2600);
        onTap(j, () => { clearTimeout(t); resolve(); });
        ctl.cleanups.push(() => { clearTimeout(t); resolve(); });
      });
      guard();
      const c = centerOf(j);
      burst(c.x, c.y - 60, { n: 10, kind: 'bubble', spread: 140 });
      sfx('bubble');
      j.remove();
    }
    freeTurns(false);
  }
  async function stPlaza() {
    const hot = warm();
    done.plazaHot = hot;
    if (hot) {
      await host('sr_plaza');
      await host('st_splash_prep');
      const sc = thing('sea-prop', SUNSCREEN, [380, 520]);
      await tap(sc);
      guard();
      sfx('pop');
      kids.forEach((id) => kidEl(id).classList.add('shiny'));
      sc.remove();
      const hat = thing('sea-prop', SUNHAT, [560, 560]);
      await tap(hat);
      guard();
      sfx('pop');
      kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="sea-hat">${SUNHAT}</div>`));
      hat.remove();
      await host('st_splash_drink');
      const bt = thing('sea-prop', BOTTLE, [720, 520]);
      await tap(bt);
      guard();
      sfx('ding');
      bt.remove();
      await host('st_splash');
      await jets(kids.length > 1 ? 8 : 6);
    } else {
      await host(['rain', 'storm', 'snow'].includes(wx.kind) ? 'sr_plaza_rain' : 'sr_plaza_cool');
      await host('st_hands');
      await jets(4);
    }
    await kikiRule({
      act: 'running', kikiLine: 'sk_run_wet', tapLine: 'st_slip_tap', q: 'st_slip_q',
      right: SEA_CARD.wetwalk, wrong: SEA_CARD.wetrun, wrongLine: 'st_slip_wrong', okLine: 'st_slip_ok',
      near: [880, 856], onAct: async () => { who('kiki').classList.add('slip'); sfx('boing'); await pause(700); who('kiki').classList.remove('slip'); },
    });
    await host(hot ? 'st_dry' : 'st_dry_hands');
    const tw = thing('sea-prop', TOWEL, [480, 540]);
    await tap(tw);
    guard();
    sfx('sparkle');
    tw.remove();
    if (hot) {
      const cl = thing('sea-prop', DRY_CLOTHES, [660, 540]);
      await tap(cl);
      guard();
      sfx('pop');
      cl.remove();
      $$('.sea-hat', root).forEach((n) => n.remove());
      kids.forEach((id) => kidEl(id).classList.remove('shiny'));
    }
  }

  async function station(kind) {
    const S = {
      trash: stTrash, crabs: stCrabs, touch: stTouch, ocean: stOcean, nemo: stNemo, tunnel: stTunnel, song: stSong, eels: stEels,
      fossil: stFossil, kelp: stKelp, dark: stDark, polar: stPolar, whale: stWhale, plaza: stPlaza,
    };
    return S[kind]?.();
  }
  async function visit(r) {
    const R = ROOMS[r];
    if (r !== 'plaza') await host(`sr_${r}`);
    if (R.explore === 'after') {
      if (R.station) await station(R.station);
      await explore();
      return;
    }
    if (R.explore !== false) await explore();
    if (R.station) await station(R.station);
  }

  (async () => {
    playMusic(outdoor ? 'sea' : 'aqua');
    placeCreatures(ROOMS[first].show, ROOMS[first].hide);
    paintFloor(floorOf(first));
    await wait(400);
    try {
      ctl.mode = 'act';
      if (!outdoor) {
        await host(`sea_hello_${hall}`);
        await host('sea_tap');
      }
      for (let i = 0; i < H.rooms.length; i += 1) {
        if (i > 0) await goRoom(H.rooms[i]);
        await visit(H.rooms[i]);
      }
      // 說出做到了什麼（原因），再送公仔
      const dn = hall === 'tw' ? (done.touch ? 'dn_sea_tw' : 'dn_sea_tw2') : hall === 'plaza' ? (done.plazaHot ? 'dn_plaza_hot' : 'dn_plaza_cool') : `dn_sea_${hall}`;
      await host(dn);
      await giveReward({ root, kids, reward: H.reward, series: H.series, say: host });
      await host(`sea_mission_${hall}`);
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

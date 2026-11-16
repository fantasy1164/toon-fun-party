// 歡樂島動物園：森森園長（陸龜）帶路，奇奇陪著。
// 兩種玩法：
//   遊園車（tour）：坐遊園車繞島，每次停 4 站（每次輪流不同區），每站一個動手的關卡。
//   走到某一區（area）：那一區的兩個關卡。
// 每一區先「點點看」：點動物會叫、會動，森森園長介紹一句（6 歲加英文名）。
// 關卡：輕輕摸兔子、摸完洗手、望遠鏡找動物、規矩（不餵動物、不拍玻璃、不開閃光燈、小聲不吵醒無尾熊）、
//       大象腳印、動物寶寶找媽媽、聽叫聲猜動物、長頸鹿有幾個你那麼高、數狐獴、幫保育員準備食物、跟袋鼠一起跳。
import { el, $, $$, wait, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { state, save } from '../core/store.js';
import * as weather from '../core/weather.js';
import { ANIMALS, animalSvg, PANGOLIN_BALL, KOALA_SLEEP } from '../art/animals.js';
import { AREAS } from '../art/island.js';
import { areaBack, TRAM_BIG, FOOD, RULE, NUM, ANIMAL_CARD, FOOT_PANEL, ELE_PRINT, KID_PRINT, KID_SHADOW, SINK, SOAP, TOWEL, SPEAKER, JUMP_BTN, BUCKET } from '../art/zoo.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, tapEach, hardNow, giveReward, moveTo, kidNode, shuffle } from './kit.js';
import { turnsOn, passTurn, freeTurns } from '../core/turns.js';
import { avatarSvg } from '../art/characters.js';

const HOST = 'sensen';
// 遊園車繞島的順序
const LOOP = ['kids', 'taiwan', 'rain', 'africa', 'aus', 'panda', 'penguin', 'desert'];
// 每一區的兩個關卡
const STATIONS = {
  kids: ['pet', 'wash'],
  taiwan: ['find', 'feed'],
  rain: ['baby', 'foot'],
  africa: ['sound', 'tall'],
  desert: ['count', 'food'],
  aus: ['hop', 'quiet'],
  penguin: ['food', 'glass'],
  panda: ['food', 'flash'],
};
// 動物在各區的位置：[id, 腳底 x, 腳底 y, 大小]
const LAYOUT = {
  kids: [['llama', 330, 670, 270], ['pony', 620, 668, 270], ['rabbit', 840, 690, 170]],
  taiwan: [['bear', 290, 640, 290], ['leopardcat', 560, 668, 240], ['pangolin', 760, 680, 220], ['macaque', 880, 600, 210]],
  rain: [['elephant', 400, 672, 420], ['tapir', 790, 680, 300], ['orangutan', 1010, 470, 250]],
  africa: [['giraffe', 250, 668, 480], ['zebra', 500, 676, 270], ['lion', 720, 694, 290], ['hippo', 960, 668, 320]],
  desert: [['camel', 250, 662, 340], ['meerkat', 1000, 572, 150]],
  aus: [['kangaroo', 430, 676, 320], ['koala', 960, 360, 250]],
  penguin: [['penguin', 300, 430, 220], ['penguin', 560, 410, 200], ['penguin', 820, 430, 210]],
  panda: [['panda', 600, 676, 340]],
};
// 規矩關卡：奇奇做錯事 → 點奇奇提醒 → 選對的做法
const RULES = {
  feed: { target: 'macaque', act: 'feeding', right: RULE.look, wrong: RULE.feed },
  glass: { target: 'penguin', act: 'knocking', right: RULE.gentle, wrong: RULE.knock },
  flash: { target: 'panda', act: 'flashing', right: RULE.noflash, wrong: RULE.flash },
  quiet: { target: 'koala', act: 'shouting', right: RULE.quiet, wrong: RULE.loud },
};
// 幫保育員準備食物
const FEEDS = {
  desert: { animal: 'camel', right: 'hay', wrongs: ['fish', 'cake'] },
  penguin: { animal: 'penguin', right: 'fish', wrongs: ['bamboo', 'candy'] },
  panda: { animal: 'panda', right: 'bamboo', wrongs: ['meat', 'cake'] },
};

export function mountZoo(stage, { profile, onExit, area = 'kids', tour = false }) {
  const kids = profile.members;
  const ph = phase();
  const wx = weather.current();
  // 遊園車：每次輪流不同的 4 站（輪流前半圈、後半圈，關卡也輪流）
  const k = state.zooTours?.[profile.id] || 0;
  const stops = tour ? LOOP.slice((k % 2) * 4, (k % 2) * 4 + 4) : [area];
  const inner = `
    <div class="zo-animals"></div>
    <div class="zo-tram hidden">${TRAM_BIG(ph === 'night')}<div class="zo-riders">${kids.map((id) => `<div class="zo-rider">${avatarSvg(id, 74)}</div>`).join('')}</div></div>
    <div class="kt-things"></div>
    ${charDiv('kiki', 560, 690, 0.5)}
    ${charDiv(HOST, 980, 600, 0.62)}
    ${kids.map((id, i) => kidNode(id, 150 + i * 130, 880)).join('')}
    <div class="zo-binoc hidden"></div>
    <div class="zo-flash"></div>
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: `kit zoo area-${stops[0]}`, back: areaBack(stops[0], ph, wx) });
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
  const animalsLayer = $('.zo-animals', root);
  let here = stops[0];
  let exploring = false;

  // ---------- 動物 ----------
  function placeAnimals(a) {
    animalsLayer.innerHTML = LAYOUT[a].map(([id, x, y, size], i) => {
      const w = size || ANIMALS[id].size;
      const svg = id === 'koala' && a === 'aus' ? animalSvg(id, w) : animalSvg(id, w);
      return `<button class="zo-an an-${id}" data-id="${id}" data-i="${i}" style="left:${x - w / 2}px;top:${y - w * 0.96}px;width:${w}px;height:${w}px;--d:${(i * 0.7).toFixed(1)}s">${svg}</button>`;
    }).join('');
    $$('.zo-an', animalsLayer).forEach((n) => onTap(n, () => poke(n)));
  }
  const animalNode = (id) => $(`.zo-an[data-id="${id}"]`, animalsLayer);
  function react(n, cls = 'react', ms = 700) {
    n.classList.remove(cls);
    void n.offsetWidth;
    n.classList.add(cls);
    setTimeout(() => n.classList.remove(cls), ms);
  }
  // 點動物：叫一聲、動一下；探索時間森森園長介紹
  async function poke(n) {
    const id = n.dataset.id;
    sfx(ANIMALS[id].sound);
    react(n);
    if (!exploring || n.classList.contains('met')) return;
    n.classList.add('met');
    n.classList.remove('glow-an');
    exploreQueue = exploreQueue.then(async () => {
      if (!ctl.alive) return;
      await speak(HOST, `zn_${id}`, { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
      if (hard() && ctl.alive) await speak(HOST, `ze_${id}`, { name: profile.name, who: profile.id, node: who(HOST) }).catch(() => {});
    });
  }
  let exploreQueue = Promise.resolve();

  // 先點點看：每隻動物都點過一次
  async function explore(a) {
    await host(`za_${a}`);
    await host('zo_tap');
    const ns = [...new Map($$('.zo-an', animalsLayer).map((n) => [n.dataset.id, n])).values()];
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

  // ---------- 遊園車 ----------
  const tram = $('.zo-tram', root);
  const kidsVisible = (on) => kids.forEach((id) => kidEl(id).classList.toggle('gone', !on));
  async function tramTo(x, ms) {
    tram.style.transition = `left ${ms}ms ease-in-out`;
    tram.style.left = `${x}px`;
    await pause(ms + 40);
  }
  async function board() {
    tram.classList.remove('hidden');
    tram.style.transition = 'none';
    tram.style.left = '-720px';
    void tram.offsetWidth;
    sfx('ding');
    await tramTo(140, 1600);
    await host('zt_hello');
    await host('zt_board');
    await tap($('svg', tram));
    guard();
    sfx('pop');
    kidsVisible(false);
    who('kiki').classList.add('gone');
    tram.classList.add('full');
    await host('zt_hands');
    await card(RULE.handsin, [RULE.handsout], 'zt_hands_wrong');
    await host('zt_hands_ok');
  }
  async function driveTo(a) {
    sfx('ding');
    root.classList.add('driving');
    await tramTo(1300, 1500);
    root.classList.add('swap');
    await pause(350);
    $('.p-layer', root).innerHTML = areaBack(a, ph, wx);
    root.className = root.className.replace(/area-\w+/, `area-${a}`);
    placeAnimals(a);
    here = a;
    tram.style.transition = 'none';
    tram.style.left = '-720px';
    void tram.offsetWidth;
    root.classList.remove('swap');
    await tramTo(140, 1500);
    root.classList.remove('driving');
  }
  async function getOff() {
    sfx('pop');
    tram.classList.remove('full');
    kidsVisible(true);
    who('kiki').classList.remove('gone');
    await tramTo(1300, 1200);
    tram.classList.add('hidden');
  }
  async function getOn() {
    tram.classList.remove('hidden');
    tram.style.transition = 'none';
    tram.style.left = '-720px';
    void tram.offsetWidth;
    await tramTo(140, 1200);
    await host('zt_next');
    sfx('pop');
    kidsVisible(false);
    who('kiki').classList.add('gone');
    tram.classList.add('full');
  }

  // ======================= 關卡 =======================
  // 拖一下（摸兔子）：回傳 'slow'、'fast'
  function stroke(node) {
    return new Promise((resolve) => {
      let start = null;
      let last = null;
      let dist = 0;
      const k = () => stage.getBoundingClientRect().width / 1200;
      const down = (e) => { e.preventDefault(); start = performance.now(); last = [e.clientX, e.clientY]; dist = 0; node.classList.add('touching'); };
      const move = (e) => { if (!start) return; dist += Math.hypot(e.clientX - last[0], e.clientY - last[1]) / k(); last = [e.clientX, e.clientY]; };
      const up = () => {
        if (!start) return;
        const ms = performance.now() - start;
        node.classList.remove('touching');
        start = null;
        if (dist < 50) return;   // 只是點一下，不算
        done();
        resolve(dist / Math.max(ms, 1) > 0.9 ? 'fast' : 'slow');
      };
      const done = () => { node.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      node.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      ctl.cleanups.push(() => { done(); resolve('slow'); });
    });
  }
  // 輕輕摸兔子
  async function stPet() {
    const r = animalNode('rabbit');
    await moveTo(r, [600, 700], 600);
    r.classList.add('big');
    await host('zs_pet');
    for (const id of kids) {
      if (turnsOn()) await call();
      let good = 0;
      while (good < (hard() ? 3 : 2)) {
        r.classList.add('glow-an', 'stroke-hint');
        const how = await stroke(r);
        guard();
        r.classList.remove('stroke-hint');
        if (how === 'fast') {
          sfx('wrong');
          react(r, 'scared', 900);
          await host('zs_pet_fast');
          continue;
        }
        good += 1;
        sfx('heart');
        const c = centerOf(r);
        burst(c.x, c.y - 40, { n: 8, kind: 'heart', spread: 120 });
        react(r, 'happy', 900);
        await pause(500);
      }
      r.classList.remove('glow-an');
      if (turnsOn()) passTurn();
    }
    await host('zs_pet_ok');
    r.classList.remove('big');
  }
  // 摸完動物要洗手
  async function stWash() {
    await host('zs_wash');
    const sink = thing('zo-sink', SINK, [420, 470]);
    const soap = thing('zo-soap', SOAP, [660, 520]);
    const towel = thing('zo-towel', TOWEL, [800, 530]);
    await tap(sink);
    guard();
    sink.classList.add('water');
    sfx('splash');
    await host('zs_wash_soap');
    await tap(soap);
    guard();
    sfx('pop');
    const c = centerOf(sink);
    burst(c.x, c.y, { n: 16, kind: 'bubble', spread: 160 });
    await host('zs_wash_rub');
    for (let i = 0; i < 4; i += 1) { burst(c.x, c.y, { n: 6, kind: 'bubble', spread: 120 }); await pause(700); }
    await host('zs_wash_rinse');
    await tap(sink);
    guard();
    sfx('splash');
    await pause(600);
    sink.classList.remove('water');
    await host('zs_wash_dry');
    await tap(towel);
    guard();
    sfx('sparkle');
    await host('zs_wash_ok');
    [sink, soap, towel].forEach((n) => n.remove());
  }
  // 望遠鏡找動物：拖著望遠鏡看草叢、樹後面
  async function stFind() {
    const targets = shuffle(['leopardcat', 'pangolin', 'bear']).slice(0, kids.length > 1 ? 2 : 3);
    // 先把動物藏起來（躲在草叢、樹後面）
    const spots = { leopardcat: [180, 640], pangolin: [700, 660], bear: [1000, 600] };
    const hideNodes = targets.map((id) => {
      const n = animalNode(id);
      n.classList.add('hiding');
      moveTo(n, spots[id], 10);
      return n;
    });
    $$('.zo-an', animalsLayer).forEach((n) => { if (!targets.includes(n.dataset.id)) n.classList.add('away'); });
    const grass = targets.map((id) => thing('zo-grass', `<svg viewBox="0 0 240 120" width="260" height="130">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 15 + 6} 120Q${i * 15 + (i % 2 ? 20 : -6)} 50 ${i * 15 + 10} ${10 + (i % 3) * 12}" stroke="${['#3f8a4f', '#4f9a4f', '#2e7a40'][i % 3]}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}</svg>`, [spots[id][0] - 130, spots[id][1] - 110]));
    grass.forEach((g) => { g.style.pointerEvents = 'none'; });
    await host('zs_find');
    const bin = $('.zo-binoc', root);
    bin.classList.remove('hidden');
    const k = () => stage.getBoundingClientRect();
    const setLens = (e) => {
      const r = k();
      const s = r.width / 1200;
      bin.style.setProperty('--x', `${(e.clientX - r.left) / s}px`);
      bin.style.setProperty('--y', `${(e.clientY - r.top) / s}px`);
      lens = [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
    };
    let lens = [600, 450];
    bin.style.setProperty('--x', '600px');
    bin.style.setProperty('--y', '450px');
    bin.addEventListener('pointerdown', setLens);
    bin.addEventListener('pointermove', setLens);
    ctl.cleanups.push(() => { bin.removeEventListener('pointerdown', setLens); bin.removeEventListener('pointermove', setLens); });
    for (const id of targets) {
      const n = animalNode(id);
      const [tx, ty] = [spots[id][0], spots[id][1] - 60];
      if (!hard()) bin.insertAdjacentHTML('beforeend', `<div class="zo-hint" style="left:${tx - 40}px;top:${ty - 40}px"></div>`);
      await call();
      await new Promise((resolve) => {
        let since = 0;
        const t = setInterval(() => {
          if (!ctl.alive) { clearInterval(t); resolve(); return; }
          const d = Math.hypot(lens[0] - tx, lens[1] - ty);
          since = d < 110 ? since + 100 : 0;
          if (since >= 200 || d < 60) { clearInterval(t); resolve(); }
        }, 100);
        ctl.cleanups.push(() => { clearInterval(t); resolve(); });
      });
      guard();
      passTurn();
      $$('.zo-hint', bin).forEach((h) => h.remove());
      n.classList.remove('hiding');
      n.classList.add('found');
      sfx('sparkle');
      sfx(ANIMALS[id].sound);
      const c = centerOf(n);
      burst(c.x, c.y, { n: 12, kind: 'star', spread: 140 });
      await host(`zn_${id}`);
      if (hard()) await host(`ze_${id}`);
    }
    bin.classList.add('hidden');
    grass.forEach((g) => g.remove());
    await host('zs_find_ok');
    hideNodes.forEach((n) => n.classList.remove('found'));
    $$('.zo-an', animalsLayer).forEach((n) => n.classList.remove('away'));
    placeAnimals(here);
  }
  // 規矩：奇奇做錯事
  async function stRule(kind) {
    const R = RULES[kind];
    const tgt = animalNode(R.target);
    const kk = who('kiki');
    const t = ctl.rectOf(tgt);
    await moveTo(kk, [Math.min(860, Math.max(320, t.x + t.w / 2 - 170)), 790], 600);
    if (kind === 'quiet') { tgt.innerHTML = `<svg class="an an-koala" viewBox="0 0 200 200" width="100%" height="100%" overflow="visible">${KOALA_SLEEP()}</svg>`; await host('zr_quiet_sleep'); }
    kk.classList.add(R.act);
    await say('kiki', `zr_${kind}_kiki`);
    if (kind === 'flash') { const f = $('.zo-flash', root); f.classList.add('on'); sfx('pop'); setTimeout(() => f.classList.remove('on'), 300); }
    if (kind === 'quiet') { tgt.innerHTML = animalSvg('koala', '100%'); }
    react(tgt, 'scared', 1200);
    sfx('wrong');
    await host(`zr_${kind}_tap`);
    kk.classList.add('glow-c');
    await ctl.tapOnce(kk);
    guard();
    kk.classList.remove('glow-c', R.act);
    await host(`zr_${kind}_why`);
    await card(R.right, [R.wrong], `zr_${kind}_wrong`);
    await say('kiki', 'zr_kiki_sorry');
    await host(`zr_${kind}_ok`);
    if (kind === 'quiet') tgt.innerHTML = `<svg class="an an-koala" viewBox="0 0 200 200" width="100%" height="100%" overflow="visible">${KOALA_SLEEP()}</svg>`;
    await moveTo(kk, [640, 850], 400);
  }
  // 大象的腳印
  async function stFoot() {
    const ele = animalNode('elephant');
    react(ele);
    sfx('trumpet');
    await host('zs_foot');
    const panel = thing('zo-panel', FOOT_PANEL, [380, 240]);
    const pr = thing('zo-print', ELE_PRINT, [450, 280]);
    [panel, pr].forEach((n) => { n.style.pointerEvents = 'none'; });
    const slots = [[530, 320], [610, 320], [530, 420], [610, 420]].map(([x, y]) => thing('zo-slot', KID_PRINT, [x, y]));
    await tapEach(slots, async (s) => { sfx('pop'); s.classList.add('placed'); await wait(200); }, { call, cleanups: ctl.cleanups, alive: () => ctl.alive });
    guard();
    if (hard()) {
      await host('zs_foot_count');
      await card(NUM(4), [NUM(2), NUM(6)], 'zs_foot_wrong');
    }
    await host('zs_foot_ok');
    [panel, pr, ...slots].forEach((n) => n.remove());
  }
  // 動物寶寶找媽媽
  async function stBaby() {
    await host('zb_hello');
    const babies = ['tapir', 'elephant', 'orangutan'];
    for (const b of babies) {
      const bn = thing('zo-baby', `<svg viewBox="0 0 100 100" width="170" height="170">${ANIMAL_CARD(b, true)}</svg>`, [520, 120]);
      bn.classList.add('pop');
      sfx('pop');
      await host(`zb_q_${b}`);
      const mother = animalNode(b);
      await call();
      await new Promise((resolve) => {
        const mothers = $$('.zo-an', animalsLayer);
        if (!hard()) mother.classList.add('glow-an');
        const handlers = mothers.map((m) => {
          const h = async (e) => {
            e.preventDefault();
            if (m.dataset.id === b) { mothers.forEach((x, i) => x.removeEventListener('pointerdown', handlers[i])); resolve(); return; }
            sfx('wrong');
            react(m, 'nope', 500);
            await host('zb_wrong');
            mother.classList.add('glow-an');
          };
          m.addEventListener('pointerdown', h);
          return h;
        });
        ctl.cleanups.push(() => { mothers.forEach((x, i) => x.removeEventListener('pointerdown', handlers[i])); resolve(); });
      });
      guard();
      passTurn();
      mother.classList.remove('glow-an');
      sfx('sparkle');
      const mr = ctl.rectOf(mother);
      await moveTo(bn, [mr.x + mr.w - 20, mr.y + mr.h], 700);
      react(mother, 'happy', 900);
      await host(`zb_${b}`);
      bn.remove();
    }
    await host('zb_ok');
  }
  // 聽叫聲猜動物
  async function stSound() {
    await host('zs_sound');
    const rounds = [['lion', ['zebra', 'giraffe']], ['zebra', ['hippo', 'lion']]];
    const sp = thing('zo-speaker', SPEAKER, [520, 160]);
    let current = null;
    onTap(sp, () => { if (current) sfx(ANIMALS[current].sound); react(sp, 'react', 500); });
    for (const [id, wrongs] of rounds) {
      current = id;
      await pause(300);
      sfx(ANIMALS[id].sound);
      await pause(1200);
      await host('zs_sound_q');
      await card(ANIMAL_CARD(id), wrongs.map((w) => ANIMAL_CARD(w)), 'zs_sound_wrong');
      react(animalNode(id), 'react', 900);
      sfx(ANIMALS[id].sound);
      await host(`zs_sound_${id}`);
    }
    sp.remove();
    react(animalNode('giraffe'));
    await host('zs_giraffe_quiet');
  }
  // 長頸鹿有幾個你那麼高
  async function stTall() {
    const g = animalNode('giraffe');
    react(g);
    await host('zs_tall');
    const base = [420, 668];
    const stack = [];
    const colorOf = (i) => (kids.length > 1 ? (i % 2 ? '#5fc98a' : '#ff7fa8') : (kids[0] === 'xz' ? '#5fc98a' : '#ff7fa8'));
    const btn = thing('zo-stack', KID_SHADOW(colorOf(0)), [base[0] - 48, base[1] - 112]);
    btn.style.opacity = '.55';
    for (let i = 0; i < 4; i += 1) {
      await tap(btn);
      guard();
      sfx('pop');
      const s = thing('zo-shadow', KID_SHADOW(colorOf(i)), [base[0] - 48, base[1] - 112 - i * 112]);
      s.style.pointerEvents = 'none';
      s.classList.add('drop');
      stack.push(s);
      btn.innerHTML = KID_SHADOW(colorOf(i + 1));
      btn.style.top = `${base[1] - 112 - (i + 1) * 112}px`;
      if (i === 3) btn.remove();
    }
    if (hard()) {
      await host('zs_tall_count');
      await card(NUM(4), [NUM(2), NUM(3)], 'zs_tall_wrong');
    }
    await host('zs_tall_ok');
    stack.forEach((n) => n.remove());
  }
  // 數狐獴：洞裡一隻一隻探出頭來
  async function stCount() {
    await host('zs_count');
    const holes = [[500, 646], [630, 612], [760, 650], [890, 612], [1010, 650]];
    const order = shuffle(holes.map((_, i) => i));
    let n = 0;
    for (const hi of order) {
      const [x, y] = holes[hi];
      const m = thing('zo-meer', animalSvg('meerkat', 140), [x - 70, y - 134]);
      m.classList.add('up');
      sfx('squeak');
      if (!hard()) m.classList.add('glow');
      await tap(m);
      guard();
      n += 1;
      sfx('pop');
      m.classList.add('counted');
      m.insertAdjacentHTML('beforeend', `<div class="zo-num">${n}</div>`);
      await pause(250);
    }
    if (hard()) {
      await host('zs_count_q');
      await card(NUM(5), [NUM(3), NUM(4)], 'zs_count_wrong');
    }
    await host('zs_count_ok');
    $$('.zo-meer', things).forEach((x) => x.remove());
  }
  // 幫保育員準備食物（遊客不能餵，是保育員準備的）
  async function stFood(a) {
    const F = FEEDS[a];
    const an = animalNode(F.animal);
    const bucket = thing('zo-bucket', BUCKET, [820, 560]);
    bucket.style.pointerEvents = 'none';
    await host(`zs_food_${F.animal}`);
    await card(FOOD[F.right], F.wrongs.map((w) => FOOD[w]), `zs_food_wrong_${F.animal}`);
    const ar = ctl.rectOf(an);
    const f = thing('zo-food', `<svg viewBox="0 0 100 100" width="100" height="100">${FOOD[F.right]}</svg>`, [840, 520]);
    await moveTo(f, [ar.x + ar.w * 0.6, ar.y + ar.h - 20], 800);
    f.remove();
    bucket.remove();
    an.classList.add('eating');
    sfx('pop');
    await host(`zs_fed_${F.animal}`);
    an.classList.remove('eating');
    await host('zs_nofeed');
  }
  // 跟袋鼠一起跳：按鈕亮的時候按
  async function stHop() {
    const kg = animalNode('kangaroo');
    await moveTo(kg, [560, 690], 500);
    await host('zs_hop');
    const btn = thing('zo-jump', JUMP_BTN, [860, 520]);
    freeTurns(true);
    let n = 0;
    let lit = false;
    const beat = setInterval(() => { lit = true; btn.classList.add('glow'); setTimeout(() => { lit = false; btn.classList.remove('glow'); }, 520); }, 1000);
    ctl.cleanups.push(() => clearInterval(beat));
    await new Promise((resolve) => {
      onTap(btn, () => {
        if (!lit || n >= 5) return;
        lit = false;
        btn.classList.remove('glow');
        n += 1;
        sfx('boing');
        react(kg, 'jump', 600);
        kids.forEach((id) => react(kidEl(id), 'jump', 600));
        const c = centerOf(btn);
        burst(c.x, c.y, { n: 6, kind: 'star', spread: 90 });
        btn.insertAdjacentHTML('beforeend', `<div class="zo-num">${n}</div>`);
        setTimeout(() => $('.zo-num', btn)?.remove(), 500);
        if (n >= 5) resolve();
      });
      ctl.cleanups.push(() => resolve());
    });
    clearInterval(beat);
    freeTurns(false);
    btn.remove();
    guard();
    await host('zs_hop_ok');
  }

  async function station(kind, a) {
    if (kind === 'pet') return stPet();
    if (kind === 'wash') return stWash();
    if (kind === 'find') return stFind();
    if (RULES[kind]) return stRule(kind);
    if (kind === 'foot') return stFoot();
    if (kind === 'baby') return stBaby();
    if (kind === 'sound') return stSound();
    if (kind === 'tall') return stTall();
    if (kind === 'count') return stCount();
    if (kind === 'food') return stFood(a);
    if (kind === 'hop') return stHop();
    return null;
  }

  (async () => {
    playMusic('zoo');
    placeAnimals(stops[0]);
    await wait(400);
    try {
      ctl.mode = 'act';
      if (tour) {
        await board();
        for (let i = 0; i < stops.length; i += 1) {
          const a = stops[i];
          if (i > 0) await getOn();
          await driveTo(a);
          await getOff();
          await explore(a);
          await station(STATIONS[a][(Math.floor(k / 2) + i) % 2], a);
        }
        state.zooTours = { ...(state.zooTours || {}), [profile.id]: k + 1 };
        save();
        await host('zt_end');
      } else {
        await host('zo_hello');
        await explore(area);
        for (const kind of STATIONS[area]) await station(kind, area);
      }
      await giveReward({ root, kids, reward: 'zoo', series: HOST, say: host });
      await host('zo_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();
  return ctl.api;
}

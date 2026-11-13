// 客廳大門區：出門前幫奇奇穿對衣服。第一回合用今天的真實天氣（早上有獎品），之後可以轉天氣轉盤練習。
import { REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, rainOn, rainOff } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import { doorView, rackSvg, kikiSvg, ITEM_IDS, SPIN_ICON } from '../art/door.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const CHAR = 'kiki';
const RAIN_GEAR = ['raincoat', 'umbrella', 'boots'];
const FEET = ['sneakers', 'boots'];

// 3 歲版：只要穿到這些就過關（也只有這些會亮）
const NEEDS_EASY = {
  normal: ['sneakers'],
  hot: ['sneakers', 'hat'],
  rain: ['boots', 'umbrella'],
  cold: ['sneakers', 'jacket'],
  windy: ['sneakers', 'jacket'],
};
// 6 歲版出錯時要提示的東西
const NEEDS_HARD = {
  normal: ['sneakers'],
  hot: ['sneakers', 'hat', 'bottle'],
  rain: ['boots', 'raincoat'],
  cold: ['sneakers', 'jacket', 'scarf'],
  windy: ['sneakers', 'jacket'],
};

// 真實天氣 → 這個場景的天氣種類
export function sceneWeather(w) {
  if (w.kind === 'storm') return 'storm';
  if (w.kind === 'rain') return 'rain';
  if (w.windy) return 'windy';
  if (w.hot) return 'hot';
  if (w.cold) return 'cold';
  return 'normal';
}
// 場景天氣種類 → 畫面用的天氣
function visual(wk) {
  return {
    normal: { kind: 'clear' }, hot: { kind: 'clear', hot: true }, cold: { kind: 'cloudy', cold: true },
    windy: { kind: 'cloudy', windy: true }, rain: { kind: 'rain' }, storm: { kind: 'storm' },
  }[wk];
}

// 檢查穿搭，回傳第一個問題（沒問題回傳 null）
function check(wk, worn, hard) {
  if (!hard) return NEEDS_EASY[wk].every((i) => worn.has(i)) ? null : 'missing';
  if (!FEET.some((i) => worn.has(i))) return 'shoes';
  if (wk === 'rain') {
    if (!worn.has('raincoat') && !worn.has('umbrella')) return 'wet';
    if (!worn.has('boots')) return 'feet';
    return null;
  }
  if (wk === 'hot' && ['jacket', 'scarf', 'raincoat'].some((i) => worn.has(i))) return 'hot';
  if (wk === 'windy' && worn.has('umbrella')) return 'flip';
  if (RAIN_GEAR.some((i) => worn.has(i))) return 'norain';
  if (wk === 'hot' && (!worn.has('hat') || !worn.has('bottle'))) return 'hotneed';
  if ((wk === 'cold' && (!worn.has('jacket') || !worn.has('scarf'))) || (wk === 'windy' && !worn.has('jacket'))) return 'cold';
  return null;
}
// 每種問題：顯示的狀態、要拿掉的東西
const FAIL = {
  shoes: { st: null, remove: [] },
  wet: { st: 'wet', remove: [] },
  feet: { st: 'feet', remove: ['sneakers'] },
  hot: { st: 'sweat', remove: ['jacket', 'scarf', 'raincoat'] },
  hotneed: { st: 'sweat', remove: [] },
  flip: { st: 'flip', remove: ['umbrella'] },
  norain: { st: null, remove: RAIN_GEAR },
  cold: { st: 'cold', remove: [] },
};

export function mountDoor(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const realWk = sceneWeather(weather.current());
  let wk = realWk;
  let real = true;

  const root = el(`
    <div class="screen scene doorroom ${ph === 'night' ? 'sleepy' : ''}">
      <div class="bg"></div>
      <div class="kiki-box"><div class="kiki-in">${kikiSvg()}</div></div>
      <div class="rack-layer">${rackSvg()}</div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
        <button class="round-btn spin hidden">${SPIN_ICON}</button>
      </div>
      <div class="light ${ph}"></div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const kiki = $('.kiki-box', root);
  const kikiIn = $('.kiki-in', root);
  const spinBtn = $('.hud .spin', root);

  let alive = true;
  let mode = 'intro';   // intro | dress | go | storm | done | end
  let timeUp = false;
  let thunderTimer = 0;
  const worn = new Set();

  const say = (id) => speak(CHAR, id, { name: profile.name, who: profile.id, node: kikiIn });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };

  // ---------- 畫面 ----------
  function drawWeather() {
    $('.bg', root).innerHTML = doorView(ph, visual(wk));
    rainOff();
    clearInterval(thunderTimer);
    if (wk === 'rain' || wk === 'storm') rainOn(wk === 'storm');
    if (wk === 'storm') thunderTimer = setInterval(() => { if (Math.random() < 0.3) thunder(); }, 6000);
  }
  function thunder() {
    $$('.flash', root).forEach((f) => { f.classList.remove('on'); void f.getBoundingClientRect(); f.classList.add('on'); });
    setTimeout(() => sfx('thunder'), 450);
  }
  function setDoor(open) { $('.door-panel', root)?.classList.toggle('open', open); }
  function refreshWear() {
    for (const id of ITEM_IDS) {
      kikiIn.classList.toggle(`w-${id}`, worn.has(id));
      $(`.item[data-prop="${id}"]`, root).classList.toggle('taken', worn.has(id));
    }
  }
  function setState(st) {
    ['wet', 'feet', 'sweat', 'cold', 'flip'].forEach((s) => kikiIn.classList.toggle(`st-${s}`, s === st));
  }
  function clearGlow() { $$('.prop.glow', root).forEach((n) => n.classList.remove('glow')); }
  function glow(ids) { ids.forEach((id) => $(`[data-prop="${id}"]`, root)?.classList.add('glow')); }
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }
  function easyComplete() { return NEEDS_EASY[wk].every((i) => worn.has(i)); }
  function hintEasy() {
    clearGlow();
    const left = NEEDS_EASY[wk].filter((i) => !worn.has(i));
    glow(left.length ? left : ['door']);
  }

  // ---------- 穿脫衣物 ----------
  function onItem(id, node) {
    if (mode !== 'dress') return;
    if (worn.has(id)) {
      // 再點一次衣帽架上的空位：拿下來（6 歲版才需要）
      if (!hard) return;
      worn.delete(id);
      sfx('whoosh');
      refreshWear();
      return;
    }
    if (!hard && !NEEDS_EASY[wk].includes(id)) { flash(node, 'nope'); return; }
    if (FEET.includes(id)) FEET.forEach((f) => worn.delete(f));
    worn.add(id);
    sfx('pop');
    refreshWear();
    const c = centerOf(kiki);
    burst(c.x, c.y, { n: 6, kind: 'star', spread: 90 });
    node.classList.remove('glow');
    (async () => {
      await say(`i_${id}`);
      if (hard && mode === 'dress') await say(`en_${id}`);
      if (!hard && mode === 'dress') {
        hintEasy();
        if (easyComplete()) say('d_door');
      }
    })();
    if (hard) glow(['door']);
  }

  // ---------- 開門 ----------
  async function walkToDoor() {
    setDoor(true);
    sfx('whoosh');
    await pause(500);
    kiki.classList.add('at-door');
    await pause(700);
  }
  async function walkBack() {
    kiki.classList.remove('at-door', 'gone');
    await pause(700);
    setDoor(false);
    sfx('tap');
  }

  async function onDoor() {
    if (mode === 'storm') { await stormOpen(); return; }
    if (mode !== 'dress') return;
    if (!hard && !easyComplete()) { flash($('.doorhit', root), 'nope'); hintEasy(); return; }
    mode = 'go';
    clearGlow();
    try {
      await walkToDoor();
      const problem = check(wk, worn, hard);
      if (!problem) { await success(); return; }
      // 用後果來學
      const f = FAIL[problem];
      if (f.st) setState(f.st);
      sfx(problem === 'flip' ? 'whoosh' : 'wrong');
      if (problem === 'wet' || problem === 'feet') sfx('bubble');
      await say(`d_f_${problem}`);
      await pause(300);
      f.remove.forEach((i) => worn.delete(i));
      refreshWear();
      await walkBack();
      setState(null);
      mode = 'dress';
      // 提示還缺的東西
      glow(NEEDS_HARD[wk].filter((i) => !worn.has(i)));
    } catch (e) { if (e.message !== 'scene-closed') throw e; }
  }

  async function success() {
    kiki.classList.add('happy');
    sfx('fanfare');
    const c = centerOf(kiki);
    burst(c.x, c.y, { n: 16, kind: 'star', spread: 200 });
    await say('d_ok');
    kiki.classList.remove('happy');
    kiki.classList.add('gone');
    await pause(900);
    await finishRound();
  }

  async function finishRound() {
    if (real) {
      const slot = currentSlot(REWARD_SLOTS.door, hour());
      const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `door_${slot}`)) : [];
      if (winners.length) {
        const gifts = winners.map((id) => {
          const item = nextItem(state.profiles[id].collection, CHAR);
          addItem(id, item);
          claim(id, `door_${slot}`);
          return { id, item };
        });
        save();
        await showGift(gifts);
      } else {
        await say('practice');
      }
      guard();
      if (wk !== 'storm') await say(`d_m_${wk}`);
    }
    guard();
    // 奇奇回到屋裡，換下衣服，準備下一回合
    worn.clear();
    refreshWear();
    setState(null);
    await walkBack();
    if (timeUp) { await goodbye(); return; }
    mode = 'done';
    spinBtn.classList.remove('hidden');
    spinBtn.classList.add('glow-btn');
    say('d_spin');
  }

  async function showGift(gifts) {
    const cards = gifts.map((g) => `
      <div class="card">${itemSvg(g.item, 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
    const node = el(`<div class="gift">${cards}</div>`);
    root.appendChild(node);
    sfx('sparkle');
    await say('gift');
    await pause(600);
    node.classList.add('away');
    sfx('whoosh');
    await pause(650);
    node.remove();
  }

  // ---------- 打雷：不出門 ----------
  async function stormOpen() {
    mode = 'go';
    clearGlow();
    try {
      setDoor(true);
      await pause(400);
      thunder();
      kiki.classList.add('scared');
      await pause(700);
      await say('d_storm_back');
      kiki.classList.remove('scared');
      setDoor(false);
      sfx('tap');
      await say('d_storm_inside');
      await finishRound();
    } catch (e) { if (e.message !== 'scene-closed') throw e; }
  }

  // ---------- 一回合 ----------
  async function startRound() {
    worn.clear();
    refreshWear();
    setState(null);
    clearGlow();
    if (wk === 'storm') {
      mode = 'storm';
      await say('d_storm_look');
      glow(['door']);
      return;
    }
    await say(`d_w_${wk}`);
    guard();
    mode = 'dress';
    if (hard) {
      say('d_what');
    } else {
      hintEasy();
      say(`d_need_${wk}`);
    }
  }

  // ---------- 天氣轉盤 ----------
  async function spin() {
    if (mode !== 'done') return;
    mode = 'intro';
    spinBtn.classList.remove('glow-btn');
    spinBtn.classList.add('spinning');
    sfx('whoosh');
    await pause(1100);
    spinBtn.classList.remove('spinning');
    spinBtn.classList.add('hidden');
    real = false;
    wk = pick(['normal', 'hot', 'rain', 'cold', 'windy', 'storm'].filter((w) => w !== wk));
    drawWeather();
    sfx('sparkle');
    await startRound();
  }

  // ---------- 結束 ----------
  async function goodbye() {
    mode = 'end';
    clearGlow();
    await say(weather.niceOutside(ph) ? 'bye_sunny' : 'bye');
    sfx('bye');
    root.classList.add('lights-out');
    await wait(1600);
    if (!alive) return;
    state.session.restUntil = Date.now() + state.settings.restMin * 60000;
    state.session.usedMs = 0;
    save();
    destroy();
    onExit('rest');
  }

  function destroy() {
    if (!alive) return;
    alive = false;
    clearInterval(thunderTimer);
    rainOff();
    hush();
  }

  // ---------- 事件 ----------
  $$('.item', root).forEach((n) => onTap(n, () => onItem(n.dataset.prop, n)));
  onTap($('.doorhit', root), () => onDoor());
  onTap(spinBtn, () => spin().catch((e) => { if (e.message !== 'scene-closed') throw e; }));
  onTap($('.hud .home', root), () => {
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), () => {
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  drawWeather();
  (async () => {
    try {
      playMusic(ph === 'night' ? 'bath_night' : 'living');
      await pause(300);
      await say('d_hello');
      if (ph === 'night') await say('d_night');
      if (timeUp) { await goodbye(); return; }
      await startRound();
    } catch (e) { if (e.message !== 'scene-closed') throw e; }
  })();

  return {
    destroy,
    hostChar: CHAR,
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'done') goodbye();
    },
  };
}

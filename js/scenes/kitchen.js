// 廚房（餐桌）：第一個多角色場景。波波固定在左邊，右邊是嘟嘟或奇奇輪替。
// 活動一：擺餐具；活動二：裝一盤均衡的飯 → 一起開動 → 分最後一片水果 → 收碗。
import { REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import {
  SEATS, SEAT_COLORS, WARE_IDS, wareSvg, FOODS, FOOD_IDS, GROUPS, foodSvg, PLATE_SPOT,
  kitchenBack, seatedChars, tableFront, placeSettings, SINK, PLATE, KNIFE,
} from '../art/kitchen.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const SET_ICON = `<svg viewBox="0 0 100 100" width="96" height="96"><path d="M14 46H86Q82 82 50 86Q18 82 14 46Z" fill="#7cc4d8"/><ellipse cx="50" cy="46" rx="36" ry="9" fill="#fff" opacity=".6"/>
  <ellipse cx="26" cy="20" rx="9" ry="12" fill="#ffb3c7"/><rect x="23" y="30" width="6" height="22" rx="3" fill="#ffb3c7"/><path d="M66 10H86L83 38H69Z" fill="#ffd34d"/></svg>`;
const MEAL_ICON = `<svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="54" r="40" fill="#fff" stroke="#e6e6e6" stroke-width="4"/>
  <circle cx="34" cy="42" r="12" fill="#fff" stroke="#eee" stroke-width="2"/><circle cx="34" cy="42" r="6" fill="#ffc400"/>
  <circle cx="64" cy="40" r="10" fill="#2e8b57"/><circle cx="62" cy="68" r="11" fill="#e5484d"/><ellipse cx="36" cy="68" rx="12" ry="8" fill="#f2f2f2"/></svg>`;
const EAT_ICON = `<svg viewBox="0 0 100 100" width="80" height="80"><path d="M30 86L44 14M56 86L42 14" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="60" r="10" fill="#ffd34d"/></svg>`;

export function mountKitchen(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  // 和上一次輪替：上次是嘟嘟就換奇奇，反之亦然
  const last = localStorage.getItem('tfp-last-char');
  const other = last === 'dudu' ? 'kiki' : last === 'kiki' ? 'dudu' : pick(['dudu', 'kiki']);
  localStorage.setItem('tfp-last-char', other);
  const kidKey = profile.members.length > 1 ? 'both' : profile.members[0];
  const colors = [SEAT_COLORS.bobo, SEAT_COLORS[kidKey], SEAT_COLORS[other]];
  const wx = weather.current();

  const root = el(`
    <div class="screen scene kitchen ${ph === 'night' ? 'sleepy' : ''}">
      <div class="k-layer back">${kitchenBack(ph, wx)}</div>
      <div class="k-layer chars">${seatedChars(other)}</div>
      <div class="k-layer table">${tableFront(profile)}</div>
      <div class="k-layer placesl">${placeSettings(colors)}</div>
      <div class="k-layer sinkl"><svg viewBox="0 0 1200 900"><g transform="translate(-920 -150)">${SINK}</g></svg></div>
      <div class="k-layer mealplate hidden"><svg viewBox="0 0 1200 900"><g class="plate-pos" transform="translate(600 630) scale(.86)">${PLATE}<g class="on-plate"></g></g>
        <g class="dish hidden" transform="translate(600 548)"><ellipse rx="70" ry="20" fill="#fff" stroke="#e6e6e6" stroke-width="5"/><g class="slice"><path d="M-30 -6A30 30 0 0 1 30 -6Z" fill="#e5484d"/><path d="M-26 -8A26 26 0 0 1 26 -8Z" fill="#fff3d6"/></g></g></svg></div>
      <div class="counter"></div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="light ${ph}"></div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const counter = $('.counter', root);
  const charNode = (who) => $(`.seat-char[data-who="${who === 'bobo' ? 'bobo' : 'other'}"]`, root);

  let alive = true;
  let mode = 'intro';    // intro | idle | act | end
  let timeUp = false;
  let tableSet = false;
  const cleanups = [];

  const say = (who, id) => speak(who, id, { name: profile.name, who: profile.id, node: charNode(who) });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }

  // ---------- 東西飛過去 ----------
  function rectOf(node) {
    const sr = stage.getBoundingClientRect();
    const k = sr.width / 1200;
    const r = node.getBoundingClientRect();
    return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
  }
  async function fly(html, from, to, ms = 480) {
    const f = el(`<div class="flyer" style="left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px">${html}</div>`);
    root.appendChild(f);
    void f.getBoundingClientRect();
    f.style.transition = `transform ${ms}ms cubic-bezier(.3,1.2,.5,1)`;
    const sx = to.w / from.w;
    f.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${sx})`;
    await wait(ms + 20);
    f.remove();
  }

  // ---------- 選活動 ----------
  function idle() {
    mode = 'idle';
    counter.className = 'counter choose';
    counter.innerHTML = `
      <button class="round-btn pick set glow">${SET_ICON}</button>
      <button class="round-btn pick meal glow">${MEAL_ICON}</button>`;
    onTap($('.set', counter), () => run(runSet));
    onTap($('.meal', counter), () => run(runMeal));
    say('bobo', 'k_pick');
  }

  async function run(activity) {
    if (mode !== 'idle') return;
    mode = 'act';
    counter.innerHTML = '';
    try {
      await activity();
      guard();
      if (timeUp) await goodbye(); else idle();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  }

  // ---------- 活動一：擺餐具 ----------
  const placed = SEATS.map(() => new Set());
  function wareTarget(seat, kind) { return $(`.place[data-seat="${seat}"] .ware.${kind}`, root); }
  function showWare(seat, kind) {
    placed[seat].add(kind);
    wareTarget(seat, kind).classList.add('on');
  }
  function clearTable() {
    placed.forEach((s) => s.clear());
    $$('.ware', root).forEach((w) => w.classList.remove('on'));
    tableSet = false;
  }
  async function thanks(seat) {
    if (SEATS[seat].who === 'kid') { sfx('sparkle'); return; }
    await say(SEATS[seat].who === 'bobo' ? 'bobo' : other, 'k_thanks');
  }

  async function runSet() {
    clearTable();
    await say('bobo', 'k_set');
    guard();
    if (hard) await setHard(); else await setEasy();
    guard();
    tableSet = true;
    sfx('fanfare');
    await say('bobo', 'k_set_done');
    await celebrate();
  }

  // 3 歲：點一疊餐具，自動放到下一個位子，一起數一、二、三
  function setEasy() {
    return new Promise((resolve) => {
      counter.className = 'counter stacks';
      counter.innerHTML = WARE_IDS.map((k) => `<button class="stack" data-k="${k}">${wareSvg(k, '#fff', 110)}${wareSvg(k, '#e8e8e8', 110)}</button>`).join('');
      let kindIndex = 0;
      const glowNext = () => {
        $$('.stack', counter).forEach((b) => b.classList.toggle('glow', b.dataset.k === WARE_IDS[kindIndex]));
      };
      glowNext();
      let busy = false;
      $$('.stack', counter).forEach((b) => onTap(b, async () => {
        if (busy || mode !== 'act') return;
        const kind = WARE_IDS[kindIndex];
        if (b.dataset.k !== kind) { flash(b, 'nope'); return; }
        busy = true;
        const seat = placed.findIndex((s) => !s.has(kind));
        sfx('pop');
        await fly(wareSvg(kind, colors[seat], 110), rectOf(b), rectOf(wareTarget(seat, kind)));
        showWare(seat, kind);
        const n = placed.filter((s) => s.has(kind)).length;
        await speak('bobo', `n_${n}`, { node: charNode('bobo') });
        if (n === SEATS.length) {
          kindIndex++;
          if (kindIndex >= WARE_IDS.length) { counter.innerHTML = ''; resolve(); return; }
          await say('bobo', `k_${WARE_IDS[kindIndex]}`);
          glowNext();
        }
        busy = false;
      }));
      say('bobo', `k_${WARE_IDS[0]}`);
      cleanups.push(() => resolve());
    });
  }

  // 6 歲：每個人的顏色不一樣，先點餐具，再點對的位子
  function setHard() {
    return new Promise((resolve) => {
      const items = [];
      SEATS.forEach((_, seat) => WARE_IDS.forEach((k) => items.push({ seat, k })));
      items.sort(() => Math.random() - 0.5);
      counter.className = 'counter items';
      root.classList.add('placing');
      cleanups.push(() => root.classList.remove('placing'));
      counter.innerHTML = items.map(({ seat, k }) => `<button class="ware-btn" data-seat="${seat}" data-k="${k}">${wareSvg(k, colors[seat], 90)}</button>`).join('');
      let sel = null;
      let busy = false;
      $$('.ware-btn', counter).forEach((b) => onTap(b, () => {
        if (busy) return;
        $$('.ware-btn', counter).forEach((x) => x.classList.remove('sel'));
        if (sel === b) { sel = null; return; }
        sel = b;
        b.classList.add('sel');
        sfx('tap');
        $$('.place', root).forEach((p) => p.classList.add('target'));
      }));
      $$('.place', root).forEach((p) => onTap(p, async () => {
        if (!sel || busy) return;
        const seat = +p.dataset.seat;
        const k = sel.dataset.k;
        if (+sel.dataset.seat !== seat) {
          sfx('wrong');
          flash(p, 'nope');
          say('bobo', 'k_wrong_seat');
          return;
        }
        if (placed[seat].has(k)) return;
        busy = true;
        const b = sel;
        sel = null;
        $$('.place', root).forEach((x) => x.classList.remove('target'));
        sfx('pop');
        b.classList.add('used');
        await fly(wareSvg(k, colors[seat], 90), rectOf(b), rectOf(wareTarget(seat, k)));
        showWare(seat, k);
        b.remove();
        if (k === 'bowl') await thanks(seat);
        else { await say('bobo', `k_${k}`); await say('bobo', `en_k_${k}`); }
        busy = false;
        if (placed.every((s) => s.size === WARE_IDS.length)) { counter.innerHTML = ''; root.classList.remove('placing'); resolve(); }
      }));
      say('bobo', 'k_set_hard');
      cleanups.push(() => resolve());
    });
  }

  // ---------- 活動二：裝一盤均衡的飯 ----------
  async function runMeal() {
    if (!tableSet) {
      // 還沒擺餐具就直接擺好
      SEATS.forEach((_, seat) => WARE_IDS.forEach((k) => showWare(seat, k)));
      tableSet = true;
    }
    const plateLayer = $('.k-layer.mealplate', root);
    const onPlate = $('.on-plate', root);
    onPlate.innerHTML = '';
    plateLayer.classList.remove('hidden');
    $('.dish', root).classList.add('hidden');
    sfx('whoosh');

    if (other === 'dudu') {
      await say('dudu', 'k_dudu_wash');
      sfx('sparkle');
      const c = centerOf(charNode('dudu'));
      burst(c.x, c.y, { n: 10, kind: 'bubble', spread: 120 });
    }
    await say('bobo', 'k_meal');
    if (!hard) await say('bobo', 'k_meal_easy');
    guard();

    const onPlateFoods = [];
    let meatSaid = false;
    let needEncourage = false;
    let encouraged = false;

    counter.className = 'counter foods';
    counter.innerHTML = FOOD_IDS.map((f) => `<button class="food-btn" data-f="${f}">${foodSvg(f, 92)}</button>`).join('') +
      (hard ? `<button class="round-btn eat hidden">${EAT_ICON}</button>` : '');
    const EASY_SET = ['rice', 'broccoli', 'egg', 'apple'];
    const glowEasy = () => {
      const next = EASY_SET.find((f) => !onPlateFoods.includes(f));
      $$('.food-btn', counter).forEach((b) => b.classList.toggle('glow', b.dataset.f === next));
    };
    if (!hard) glowEasy();

    const groupsOn = () => new Set(onPlateFoods.map((f) => FOODS[f].g));
    function addToPlate(f) {
      const g = FOODS[f].g;
      const same = onPlateFoods.filter((x) => FOODS[x].g === g).length;
      const [px, py] = PLATE_SPOT[g];
      const ox = px + same * 20 - 48, oy = py + same * 12 - 48;
      onPlate.insertAdjacentHTML('beforeend', `<g class="pf" data-f="${f}" transform="translate(${ox} ${oy}) scale(.95)">${FOODS[f].svg}</g>`);
      onPlateFoods.push(f);
    }
    function removeJunk() {
      for (let i = onPlateFoods.length - 1; i >= 0; i--) {
        if (FOODS[onPlateFoods[i]].g === 'junk') onPlateFoods.splice(i, 1);
      }
      $$('.pf', onPlate).forEach((n) => { if (FOODS[n.dataset.f].g === 'junk') n.remove(); });
    }

    // 奇奇不愛吃青菜：點奇奇，波波會鼓勵他
    onTap(charNode('other'), async () => {
      if (!needEncourage || encouraged) return;
      encouraged = true;
      charNode('other').classList.remove('glow-char');
      await say('bobo', 'k_encourage');
      await say('kiki', 'k_kiki_try');
      sfx('sparkle');
    });

    await new Promise((resolve) => {
      let busy = false;
      $$('.food-btn', counter).forEach((b) => onTap(b, async () => {
        if (busy || mode !== 'act') return;
        const f = b.dataset.f;
        if (!hard) {
          const next = EASY_SET.find((x) => !onPlateFoods.includes(x));
          if (f !== next) { flash(b, 'nope'); return; }
        }
        busy = true;
        sfx('pop');
        const [px, py] = PLATE_SPOT[FOODS[f].g];
        const target = { x: 600 + px * 0.86 - 41, y: 630 + py * 0.86 - 41, w: 82, h: 82 };
        await fly(foodSvg(f, 92), rectOf(b), target);
        addToPlate(f);
        await say('bobo', `f_${f}`);
        if (hard && FOODS[f].g !== 'junk') await say('bobo', `en_${f}`);
        if (FOODS[f].g === 'protein' && !meatSaid) { meatSaid = true; await say('bobo', 'k_bobo_meat'); }
        if (FOODS[f].g === 'veg' && other === 'kiki' && !needEncourage) {
          needEncourage = true;
          await say('kiki', 'k_kiki_noveg');
          charNode('other').classList.add('glow-char');
        }
        busy = false;
        if (!hard) {
          glowEasy();
          if (EASY_SET.every((x) => onPlateFoods.includes(x))) {
            if (needEncourage && !encouraged) {
              // 等小孩點奇奇鼓勵他
              const wait2 = setInterval(() => { if (encouraged || !alive) { clearInterval(wait2); resolve(); } }, 200);
              cleanups.push(() => clearInterval(wait2));
            } else resolve();
          }
        } else {
          $('.eat', counter)?.classList.remove('hidden');
          if (GROUPS.every((g) => groupsOn().has(g))) $('.eat', counter)?.classList.add('glow');
        }
      }));
      const eatBtn = $('.eat', counter);
      if (eatBtn) onTap(eatBtn, async () => {
        if (busy) return;
        busy = true;
        eatBtn.classList.remove('glow');
        const gs = groupsOn();
        if (gs.has('junk')) {
          // 吃太多零食：肚子痛
          charNode('bobo').classList.add('ouch');
          sfx('wrong');
          await say('bobo', 'k_tummy');
          charNode('bobo').classList.remove('ouch');
          removeJunk();
          busy = false;
          return;
        }
        const missing = GROUPS.filter((g) => !gs.has(g));
        if (missing.length) {
          sfx('wrong');
          await say('bobo', 'k_need');
          $$('.food-btn', counter).forEach((b) => {
            const first = FOOD_IDS.find((x) => FOODS[x].g === FOODS[b.dataset.f].g);
            b.classList.toggle('glow', missing.includes(FOODS[b.dataset.f].g) && first === b.dataset.f);
          });
          busy = false;
          return;
        }
        if (needEncourage && !encouraged) {
          await say('kiki', 'k_kiki_noveg');
          charNode('other').classList.add('glow-char');
          busy = false;
          return;
        }
        resolve();
      });
      cleanups.push(() => resolve());
    });
    guard();
    counter.innerHTML = '';

    // 一起開動
    await say('bobo', 'k_itadaki');
    await say(other, 'k_itadaki');
    $$('.seat-char', root).forEach((c) => c.classList.add('eating'));
    for (const n of $$('.pf', onPlate)) { sfx('bubble'); n.classList.add('gone'); await pause(350); }
    $$('.seat-char', root).forEach((c) => c.classList.remove('eating'));
    await say(other, 'k_yum');
    await say('bobo', 'k_yum');
    guard();

    await shareFruit();
    guard();

    // 收碗
    await say('bobo', 'k_clear');
    const sink = $('.sink', root);
    sink.classList.add('glow');
    await new Promise((resolve) => {
      const h = async () => {
        sink.removeEventListener('pointerdown', h);
        sink.classList.remove('glow');
        sfx('whoosh');
        const to = rectOf($('.sink rect', root));
        const tasks = $$('.ware.on', root).map((w) => fly(`<svg viewBox="0 0 100 100" width="100%" height="100%">${w.innerHTML}</svg>`, rectOf(w), { x: to.x + 40, y: to.y + 10, w: 60, h: 60 }, 600));
        $$('.ware', root).forEach((w) => w.classList.remove('on'));
        plateLayer.classList.add('hidden');
        await Promise.all(tasks);
        sfx('sparkle');
        resolve();
      };
      sink.addEventListener('pointerdown', h);
      cleanups.push(() => { sink.removeEventListener('pointerdown', h); resolve(); });
    });
    guard();
    clearTable();
    await say('bobo', 'k_bye_meal');
    await say(other, 'k_bye_meal');
    await celebrate();
  }

  // 最後一片水果：給誰？還是切一半分享？
  async function shareFruit() {
    const dish = $('.dish', root);
    dish.classList.remove('hidden');
    sfx('pop');
    await say('bobo', 'k_fruit_want');
    await say(other, 'k_fruit_want');
    await say('bobo', 'k_fruit_ask');
    guard();
    counter.className = 'counter share';
    counter.innerHTML = `<button class="round-btn knife glow">${KNIFE}</button>`;
    const bobo = charNode('bobo');
    const oth = charNode('other');
    bobo.classList.add('glow-char');
    oth.classList.add('glow-char');
    const choice = await new Promise((resolve) => {
      onTap($('.knife', counter), () => resolve('share'));
      const hb = () => resolve('bobo');
      const ho = () => resolve('other');
      bobo.addEventListener('pointerdown', hb);
      oth.addEventListener('pointerdown', ho);
      cleanups.push(() => { bobo.removeEventListener('pointerdown', hb); oth.removeEventListener('pointerdown', ho); resolve('share'); });
    });
    guard();
    bobo.classList.remove('glow-char');
    oth.classList.remove('glow-char');
    counter.innerHTML = '';
    sfx('sparkle');
    if (choice === 'share') {
      dish.classList.add('cut');
      await pause(500);
      dish.classList.add('hidden');
      dish.classList.remove('cut');
      $$('.seat-char', root).forEach((c) => c.classList.add('happy'));
      await say('bobo', 'k_share');
      $$('.seat-char', root).forEach((c) => c.classList.remove('happy'));
    } else {
      const winner = choice === 'bobo' ? 'bobo' : other;
      const loser = choice === 'bobo' ? other : 'bobo';
      await fly(`<svg viewBox="-35 -40 70 50" width="100%" height="100%">${$('.slice', root).innerHTML}</svg>`, rectOf($('.slice', root)), rectOf($('.char .mouth', charNode(winner))), 500);
      dish.classList.add('hidden');
      charNode(winner).classList.add('happy');
      await say(winner, 'k_give_happy');
      charNode(winner).classList.remove('happy');
      await say(loser, 'k_turn');
    }
  }

  // ---------- 給獎 ----------
  async function showGift(gifts) {
    const cards = gifts.map((g) => `
      <div class="card">${itemSvg(g.item, 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
    const node = el(`<div class="gift">${cards}</div>`);
    root.appendChild(node);
    sfx('sparkle');
    await say('bobo', 'gift');
    await pause(600);
    node.classList.add('away');
    sfx('whoosh');
    await pause(650);
    node.remove();
  }

  async function celebrate() {
    guard();
    $$('.seat-char', root).forEach((c) => c.classList.add('happy'));
    sfx('fanfare');
    await say('bobo', pick(['praise1', 'praise2', 'praise3']));
    $$('.seat-char', root).forEach((c) => c.classList.remove('happy'));
    const slot = currentSlot(REWARD_SLOTS.kitchen, hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `kitchen_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, pick(['dudu', 'kiki']));
        addItem(id, item);
        claim(id, `kitchen_${slot}`);
        return { id, item };
      });
      save();
      await showGift(gifts);
    } else {
      await say('bobo', 'practice');
    }
    guard();
    await say('bobo', 'k_mission');
  }

  // ---------- 結束 ----------
  async function goodbye() {
    mode = 'end';
    await say('bobo', weather.niceOutside(ph) ? 'bye_sunny' : 'bye');
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
    cleanups.forEach((fn) => fn());
    hush();
  }

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

  (async () => {
    playMusic(ph === 'night' ? 'bath_night' : 'kitchen');
    await wait(300);
    if (!alive) return;
    await say('bobo', 'k_hello');
    if (!alive) return;
    if (timeUp) goodbye(); else idle();
  })();

  return {
    destroy,
    hostChar: 'bobo',
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'idle') goodbye();
    },
  };
}

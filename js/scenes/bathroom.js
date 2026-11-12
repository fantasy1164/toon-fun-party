// 廁所場景：刷牙（純遊戲版）與洗手。
import { CHARACTERS, REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, rand, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic, waterOn, waterOff, rainOn, rainOff } from '../core/audio.js';
import * as weather from '../core/weather.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import { mainView, mouthView, handsView, BRUSH_CURSOR, TOOTH_COUNT } from '../art/bathroom.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const BRUSH_PROPS = ['brush', 'paste', 'cup'];
const WASH_PROPS = ['soap', 'faucet', 'towel'];

// 角色輪替：不連續兩次同一位
function nextCharacter() {
  const ids = Object.keys(CHARACTERS);
  const last = localStorage.getItem('tfp-last-char');
  const pool = ids.filter((id) => id !== last);
  const id = pick(pool.length ? pool : ids);
  localStorage.setItem('tfp-last-char', id);
  return id;
}

export function mountBathroom(stage, { profile, onExit }) {
  const charId = nextCharacter();
  const hard = profile.level === 'hard';
  const ph = phase();
  const track = ph === 'night' ? 'bath_night' : 'bath_day';
  const wx = weather.current();

  const root = el(`
    <div class="screen scene bathroom ${ph === 'night' ? 'sleepy' : ''}">
      <div class="view main">${mainView(charId, ph, wx)}</div>
      <div class="view mouth off">${mouthView(charId)}</div>
      <div class="view hands off">${handsView(charId)}<div class="foam"></div></div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);

  const views = { main: $('.view.main', root), mouth: $('.view.mouth', root), hands: $('.view.hands', root) };
  const charBox = $('.layer.front', root);
  const cursor = document.getElementById('cursor');
  cursor.innerHTML = BRUSH_CURSOR;

  let alive = true;
  let mode = 'intro';        // intro | idle | act | end
  let view = 'main';
  let expect = null;         // 目前等待小孩點的道具
  let hintTimer = null;
  let timeUp = false;
  const cleanups = [];

  const say = (id) => speak(charId, id, { name: profile.name, who: profile.id, node: charBox });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };

  // ---------- 2.5D 視差：緩慢擺動，加上手指位置的影響 ----------
  let tx = 0, ty = 0, px = 0, py = 0, raf = 0;
  const t0 = performance.now();
  function frame(t) {
    if (!alive) return;
    const sway = (t - t0) / 1000;
    const gx = tx + Math.sin(sway * 0.5) * 5;
    const gy = ty + Math.cos(sway * 0.37) * 3;
    px += (gx - px) * 0.06;
    py += (gy - py) * 0.06;
    views.main.style.setProperty('--px', `${px.toFixed(2)}px`);
    views.main.style.setProperty('--py', `${py.toFixed(2)}px`);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const onMoveParallax = (e) => {
    const r = stage.getBoundingClientRect();
    tx = -((e.clientX - r.left) / r.width - 0.5) * 16;
    ty = -((e.clientY - r.top) / r.height - 0.5) * 10;
  };
  root.addEventListener('pointermove', onMoveParallax);
  root.addEventListener('pointerdown', onMoveParallax);

  // ---------- 道具 ----------
  const propsIn = (v, name) => $$(`[data-prop="${name}"]`, views[v]);
  function clearGlow() {
    clearTimeout(hintTimer);
    $$('.prop.glow', root).forEach((n) => n.classList.remove('glow'));
  }
  function glow(names) {
    names.forEach((n) => propsIn(view, n).forEach((node) => node.classList.add('glow')));
  }
  function flash(node, cls) {
    node.classList.remove(cls);
    void node.getBoundingClientRect();
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }

  // 等小孩點對的道具。3 歲版只有正確的會發光；6 歲版要自己找，太久或點錯才提示。
  function choose(target) {
    guard();
    return new Promise((resolve) => {
      expect = { target, resolve };
      if (!hard) glow([target]);
      else hintTimer = setTimeout(() => glow([target]), 7000);
    });
  }

  function onProp(name, node) {
    if (!alive) return;
    if (mode === 'idle') {
      if (BRUSH_PROPS.includes(name)) run(runBrush);
      else if (WASH_PROPS.includes(name)) run(runWash);
      return;
    }
    if (mode !== 'act' || !expect) return;
    if (name === expect.target) {
      sfx('tap');
      clearGlow();
      flash(node, 'used');
      const c = centerOf(node);
      burst(c.x, c.y, { n: 6, kind: 'star', spread: 70 });
      const { resolve } = expect;
      expect = null;
      resolve(node);
    } else if (hard) {
      sfx('wrong');
      flash(node, 'nope');
      clearGlow();
      glow([expect.target]);
      say('wrong');
    } else {
      flash(node, 'nope');
    }
  }
  $$('.prop', root).forEach((node) => onTap(node, () => onProp(node.dataset.prop, node)));

  async function showView(name) {
    guard();
    clearGlow();
    sfx('whoosh');
    views[view].classList.add('off');
    view = name;
    views[name].classList.remove('off');
    await pause(380);
  }

  // ---------- 擦／搓的手勢：手指每移動一小段就算一下 ----------
  function trackScrub(target, onScrub) {
    const last = new Map();
    const down = (e) => { last.set(e.pointerId, { x: e.clientX, y: e.clientY, acc: 0 }); onScrub(e.clientX, e.clientY, true); };
    const move = (e) => {
      const p = last.get(e.pointerId);
      if (!p) return;
      p.acc += Math.hypot(e.clientX - p.x, e.clientY - p.y);
      p.x = e.clientX; p.y = e.clientY;
      while (p.acc > 24) { p.acc -= 24; onScrub(e.clientX, e.clientY, false); }
    };
    const up = (e) => last.delete(e.pointerId);
    target.addEventListener('pointerdown', down);
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    const off = () => {
      target.removeEventListener('pointerdown', down);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    };
    cleanups.push(off);
    return off;
  }

  // ---------- 刷牙 ----------
  function scrubTeeth() {
    return new Promise((resolve) => {
      const teeth = $$('.tooth', views.mouth);
      const dirt = new Array(TOOTH_COUNT).fill(1);
      teeth.forEach((t) => {
        t.classList.remove('clean');
        $('.t-dirt', t).style.opacity = 1;
        $('.germ', t)?.classList.remove('gone');
      });
      const step = hard ? 0.15 : 0.26;
      let lastScrub = Date.now();
      let scrubOff = 0;
      const sr = stage.getBoundingClientRect();
      cursor.style.transform = `translate(${sr.left + sr.width / 2}px, ${sr.top + sr.height / 2}px)`;
      cursor.classList.add('on');

      const nag = setInterval(() => {
        if (Date.now() - lastScrub < 8000) return;
        lastScrub = Date.now();
        say('b_more');
        teeth.filter((t, i) => dirt[i] > 0).forEach((t) => flash(t, 'hint'));
      }, 1000);

      const off = trackScrub(views.mouth, (x, y, isDown) => {
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        cursor.classList.add('scrubbing');
        clearTimeout(scrubOff);
        scrubOff = setTimeout(() => cursor.classList.remove('scrubbing'), 200);
        let node = document.elementFromPoint(x, y)?.closest?.('.tooth');
        let i = node ? +node.dataset.i : -1;
        // 3 歲版：刷到已經乾淨的地方或沒對準，也算在還髒的牙齒上
        if (!hard && (i < 0 || dirt[i] <= 0)) {
          const left = dirt.map((d, k) => (d > 0 ? k : -1)).filter((k) => k >= 0);
          if (!left.length) return;
          i = pick(left);
          node = teeth[i];
        }
        if (i < 0 || dirt[i] <= 0) return;
        lastScrub = Date.now();
        dirt[i] = Math.max(0, dirt[i] - (isDown && !hard ? step * 1.3 : step));
        $('.t-dirt', node).style.opacity = dirt[i];
        sfx('scrub');
        if (Math.random() < 0.35) burst(x, y, { n: 2, kind: 'bubble', spread: 60 });
        const germ = $('.germ', node);
        if (germ && dirt[i] < 0.5 && !germ.classList.contains('gone')) {
          germ.classList.add('gone');
          sfx('pop');
          const c = centerOf(germ);
          burst(c.x, c.y, { n: 6, kind: 'bubble', spread: 80 });
        }
        if (dirt[i] === 0) {
          node.classList.add('clean');
          sfx('bubble');
          if (dirt.every((d) => d === 0)) finish();
        }
      });
      const move = (e) => { cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; };
      views.mouth.addEventListener('pointermove', move);

      let finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        clearInterval(nag);
        off();
        views.mouth.removeEventListener('pointermove', move);
        cursor.classList.remove('on', 'scrubbing');
        resolve();
      }
      cleanups.push(() => { clearInterval(nag); cursor.classList.remove('on', 'scrubbing'); });
    });
  }

  async function runBrush() {
    const brush = propsIn('main', 'brush')[0];
    const cupWater = $('.cup-water', views.main);
    brush.classList.remove('pasted');

    say('b_paste');
    await choose('paste');
    sfx('squirt');
    brush.classList.add('pasted');
    await pause(700);

    say('b_brush');
    await choose('brush');
    if (hard) await say('en_toothbrush');
    await showView('mouth');
    playMusic('brush_song');
    say('b_go');
    await scrubTeeth();
    guard();
    sfx('sparkle');
    await say('b_done');
    await showView('main');
    playMusic(track);
    brush.classList.remove('pasted');

    say('b_rinse');
    cupWater.style.opacity = 0.9;
    await choose('cup');
    if (hard) say('en_cup');
    charBox.classList.add('gargle');
    sfx('gargle');
    await pause(1600);
    charBox.classList.remove('gargle');
    cupWater.style.opacity = 0;

    await celebrate('brush', 'b_mission');
  }

  // ---------- 洗手 ----------
  function rubHands() {
    return new Promise((resolve) => {
      const foam = $('.foam', views.hands);
      const dirtNodes = $$('.dirt', views.hands);
      const need = hard ? 30 : 16;
      let n = 0;
      let lastRub = Date.now();
      glow(['hands']);
      const nag = setInterval(() => {
        if (Date.now() - lastRub < 8000) return;
        lastRub = Date.now();
        say('w_rub');
        glow(['hands']);
      }, 1000);

      const off = trackScrub(views.hands, (x, y) => {
        const onHands = !!document.elementFromPoint(x, y)?.closest?.('.paws');
        if (hard && !onHands) return;
        lastRub = Date.now();
        clearGlow();
        n++;
        sfx(n % 3 === 0 ? 'bubble' : 'rub');
        // 泡泡留在手上（3 歲版沒對準時，泡泡長在手的位置）
        const r = stage.getBoundingClientRect();
        const s = r.width / 1200;
        let fx = (x - r.left) / s, fy = (y - r.top) / s;
        if (!onHands) { fx = rand(400, 800); fy = rand(480, 720); }
        const size = rand(34, 78);
        const b = document.createElement('i');
        b.style.cssText = `left:${fx - size / 2 + rand(-20, 20)}px;top:${fy - size / 2 + rand(-20, 20)}px;width:${size}px;height:${size}px`;
        foam.appendChild(b);
        dirtNodes.forEach((d, k) => { d.style.opacity = Math.max(0, 1 - (n / need) * (1 + k * 0.08)); });
        if (n >= need) {
          clearInterval(nag);
          off();
          resolve();
        }
      });
      cleanups.push(() => clearInterval(nag));
    });
  }

  async function runWash() {
    const v = views.hands;
    const foam = $('.foam', v);
    v.classList.remove('water', 'soapy', 'dry');
    foam.classList.remove('rinse');
    foam.replaceChildren();
    $$('.dirt', v).forEach((d) => { d.style.opacity = 1; });

    await showView('hands');

    say('w_wet');
    await choose('faucet');
    waterOn(); v.classList.add('water');
    await pause(1500);
    waterOff(); v.classList.remove('water');

    say('w_soap');
    await choose('soap');
    if (hard) say('en_soap');
    sfx('squirt');
    v.classList.add('soapy');
    await pause(600);

    say('w_rub');
    await rubHands();
    guard();
    sfx('sparkle');

    say('w_rinse');
    await choose('faucet');
    waterOn(); v.classList.add('water');
    foam.classList.add('rinse');
    v.classList.remove('soapy');
    await pause(1800);
    waterOff(); v.classList.remove('water');
    foam.replaceChildren();

    say('w_dry');
    await choose('towel');
    if (hard) say('en_towel');
    sfx('towel');
    v.classList.add('dry');
    await pause(900);
    sfx('sparkle');
    await say('w_done');
    await showView('main');

    await celebrate('wash', 'w_mission');
  }

  // ---------- 完成：稱讚、給獎、現實任務 ----------
  async function showGift(gifts) {
    const cards = gifts.map((g) => `
      <div class="card">${itemSvg(g.item, 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(g.id, 98)}</div>` : ''}</div>`).join('');
    const node = el(`<div class="gift">${cards}</div>`);
    root.appendChild(node);
    sfx('sparkle');
    const r = stage.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { n: 18, kind: 'star', spread: 260 });
    await say('gift');
    await pause(700);
    node.classList.add('away');
    sfx('whoosh');
    await pause(650);
    node.remove();
    flash($('.hud .cab', root), 'used');
  }

  async function celebrate(activity, missionLine) {
    guard();
    charBox.classList.add('happy');
    sfx('fanfare');
    const c = centerOf(charBox);
    burst(c.x - 300, c.y, { n: 14, kind: 'star', spread: 200 });
    await say(pick(['praise1', 'praise2', 'praise3']));
    guard();

    const slot = currentSlot(REWARD_SLOTS[activity], hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `${activity}_${slot}`)) : [];
    charBox.classList.remove('happy');
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, charId);
        addItem(id, item);
        claim(id, `${activity}_${slot}`);
        return { id, item };
      });
      save();
      await showGift(gifts);
    } else {
      await say('practice');
    }
    guard();
    await say(missionLine);
  }

  // ---------- 流程控制 ----------
  async function run(activity) {
    mode = 'act';
    clearGlow();
    try {
      await activity();
      guard();
      if (timeUp) await goodbye();
      else idle();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  }

  function idle() {
    mode = 'idle';
    expect = null;
    glow(['brush', 'soap']);
    say('bath_pick');
  }

  async function goodbye() {
    mode = 'end';
    clearGlow();
    // 天氣好的白天：角色邀小孩出去玩
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
    cancelAnimationFrame(raf);
    clearInterval(thunderTimer);
    rainOff();
    clearGlow();
    cleanups.forEach((fn) => fn());
    waterOff();
    hush();
    cursor.classList.remove('on', 'scrubbing');
  }

  onTap($('.hud .home', root), (e) => {
    e.stopPropagation();
    if (mode === 'end') return;
    sfx('tap');
    destroy();
    onExit('home');
  });
  onTap($('.hud .cab', root), (e) => {
    e.stopPropagation();
    if (root.querySelector('.cabinet')) return;
    openCabinet(root, profile.members);
  });

  // 雨聲與打雷
  let thunderTimer = 0;
  if (wx.kind === 'rain' || wx.kind === 'storm') rainOn(wx.kind === 'storm');
  if (wx.kind === 'storm') {
    const flash = () => {
      $$('.flash', root).forEach((f) => { f.classList.remove('on'); void f.getBoundingClientRect(); f.classList.add('on'); });
      setTimeout(() => sfx('thunder'), 500);
    };
    thunderTimer = setInterval(() => { if (Math.random() < 0.35) flash(); }, 6000);
  }

  (async () => {
    playMusic(track);
    await wait(300);
    if (!alive) return;
    await say(ph === 'night' ? 'hello_night' : hour() < 11 ? 'hello_morning' : 'hello');
    if (!alive) return;
    const advice = weather.adviceLine(ph);
    if (advice) {
      await say(advice);
      if (!alive) return;
    }
    if (timeUp) goodbye(); else idle();
  })();

  return {
    destroy,
    // 時間到：正在活動就等做完，閒著就直接道別
    requestEnd() {
      if (timeUp || !alive) return;
      timeUp = true;
      if (mode === 'idle') goodbye();
    },
  };
}

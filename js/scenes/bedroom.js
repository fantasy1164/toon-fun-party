// 臥室：幫小羊棉棉準備睡覺。收玩具 → 換睡衣 → 看故事書 → 關燈抱抱 → 晚安。
import { REWARD_SLOTS } from '../config.js';
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase, hour, currentSlot } from '../core/clock.js';
import { state, save, hasClaimed, claim, addItem } from '../core/store.js';
import * as weather from '../core/weather.js';
import {
  mianSvg, roomSvg, spotsSvg, BLANKET, TOYS, TOY_HOME, toySvg, HOME_SPOTS, OUTFIT_ICONS, BOOKS,
} from '../art/bedroom.js';
import { avatarSvg } from '../art/characters.js';
import { itemSvg, nextItem } from '../art/items.js';
import { ICON, openCabinet } from '../ui/screens.js';

const CHAR = 'mian';
const NEXT = `<svg viewBox="0 0 100 100" width="70" height="70"><path d="M34 18L74 50L34 82Z" fill="#fff"/></svg>`;

export function mountBedroom(stage, { profile, onExit }) {
  const hard = profile.level === 'hard';
  const ph = phase();
  const wx = weather.current();

  const root = el(`
    <div class="screen scene bedroom ${ph}">
      <div class="b-layer room">${roomSvg(ph, wx)}</div>
      <div class="b-layer homes"><svg viewBox="0 0 1200 900"><g class="stored"></g></svg></div>
      <div class="mian-box"><div class="mian-in">${mianSvg()}</div></div>
      <div class="b-layer blanketl hidden">${BLANKET}</div>
      <div class="b-layer spotl">${spotsSvg()}</div>
      <div class="b-layer toys"><svg viewBox="0 0 1200 900">${TOYS.map((t) =>
        `<g transform="translate(${t.x - 45} ${t.y - 45})"><g class="toy" data-t="${t.id}"><circle class="halo" cx="45" cy="45" r="52" fill="#ffd000"/>${toySvg(t).replace('<svg ', '<svg x="0" y="0" ')}<rect class="hit" x="-5" y="-5" width="100" height="100" fill="transparent"/></g></g>`).join('')}</svg></div>
      <div class="darkness"></div>
      <div class="b-counter"></div>
      <div class="hud">
        <button class="round-btn home">${ICON.home}</button>
        <button class="round-btn cab">${ICON.cab}</button>
      </div>
      <div class="fade"></div>
    </div>`);
  stage.replaceChildren(root);
  const mianBox = $('.mian-box', root);
  const mianIn = $('.mian-in', root);
  const counter = $('.b-counter', root);
  mianIn.classList.add('o-day');

  let alive = true;
  let mode = 'intro';  // intro | act | done | end
  let timeUp = false;
  const cleanups = [];

  const say = (id) => speak(CHAR, id, { name: profile.name, who: profile.id, node: mianIn });
  const guard = () => { if (!alive) throw new Error('scene-closed'); };
  const pause = async (ms) => { await wait(ms); guard(); };
  function flash(node, cls) {
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 400);
  }
  const spot = (k) => $(`.spot[data-spot="${k}"]`, root);
  function glowSpots(keys) {
    $$('.spot', root).forEach((s) => s.classList.toggle('glow', keys.includes(s.dataset.spot)));
  }
  // 等小孩點某個地方
  function waitTap(node) {
    return new Promise((resolve) => {
      const h = (e) => { e.preventDefault(); node.removeEventListener('pointerdown', h); resolve(); };
      node.addEventListener('pointerdown', h);
      cleanups.push(() => { node.removeEventListener('pointerdown', h); resolve(); });
    });
  }
  function rectOf(node) {
    const sr = stage.getBoundingClientRect();
    const k = sr.width / 1200;
    const r = node.getBoundingClientRect();
    return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
  }
  async function fly(html, from, to, ms = 500) {
    const f = el(`<div class="flyer" style="left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px">${html}</div>`);
    root.appendChild(f);
    void f.getBoundingClientRect();
    f.style.transition = `transform ${ms}ms cubic-bezier(.3,1.2,.5,1)`;
    f.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${to.w / from.w})`;
    await wait(ms + 20);
    f.remove();
  }

  // ---------- 一、收玩具 ----------
  const stored = { box: 0, basket: 0, shelf: 0, bed: 0 };
  async function storeToy(t, node) {
    const home = TOY_HOME[t.kind];
    const [hx, hy] = HOME_SPOTS[home][stored[home]++ % 2];
    sfx('whoosh');
    await fly(toySvg(t), rectOf(node.querySelector('svg')), { x: hx - 30, y: hy - 30, w: 60, h: 60 });
    node.parentNode.remove();
    $('.stored', root).insertAdjacentHTML('beforeend',
      `<g transform="translate(${hx - 30} ${hy - 30})">${toySvg(t, 60).replace('<svg ', '<svg x="0" y="0" ')}</g>`);
    sfx('pop');
  }

  function toysEasy() {
    return new Promise((resolve) => {
      let i = 0;
      let busy = false;
      const glowNext = () => $$('.toy', root).forEach((n) => n.classList.toggle('glow', n.dataset.t === TOYS[i]?.id));
      glowNext();
      $$('.toy', root).forEach((n) => onTap(n, async () => {
        if (busy || mode !== 'act') return;
        const t = TOYS[i];
        if (!t || n.dataset.t !== t.id) { flash(n, 'nope'); return; }
        busy = true;
        n.classList.remove('glow');
        await storeToy(t, n);
        i++;
        await speak(CHAR, `m_n${i}`, { node: mianIn });
        busy = false;
        if (i >= TOYS.length) resolve(); else glowNext();
      }));
      cleanups.push(() => resolve());
    });
  }

  function toysHard() {
    return new Promise((resolve) => {
      let sel = null;
      let busy = false;
      let left = TOYS.length;
      $$('.toy', root).forEach((n) => onTap(n, () => {
        if (busy) return;
        $$('.toy', root).forEach((x) => x.classList.remove('sel'));
        if (sel === n) { sel = null; glowSpots([]); return; }
        sel = n;
        n.classList.add('sel');
        sfx('tap');
        glowSpots(['box', 'basket', 'shelf', 'bed']);
      }));
      ['box', 'basket', 'shelf', 'bed'].forEach((k) => onTap(spot(k), async () => {
        if (!sel || busy || mode !== 'act') return;
        const t = TOYS.find((x) => x.id === sel.dataset.t);
        if (TOY_HOME[t.kind] !== k) {
          sfx('wrong');
          flash(spot(k), 'nope');
          say('m_wrong_place');
          return;
        }
        busy = true;
        const n = sel;
        sel = null;
        glowSpots([]);
        await storeToy(t, n);
        left--;
        await speak(CHAR, `m_n${TOYS.length - left}`, { node: mianIn });
        busy = false;
        if (!left) resolve();
      }));
      cleanups.push(() => resolve());
    });
  }

  // ---------- 二、換睡衣 ----------
  async function pajamas() {
    await say('m_pj');
    glowSpots(['wardrobe']);
    await waitTap(spot('wardrobe'));
    guard();
    glowSpots([]);
    root.classList.add('wd-open');
    sfx('whoosh');
    const opts = hard ? ['swim', 'pj', 'rain'] : ['pj'];
    counter.innerHTML = opts.map((o) => `<button class="outfit ${!hard ? 'glow' : ''}" data-o="${o}">${OUTFIT_ICONS[o]}</button>`).join('');
    if (hard) say('m_pj_hard');
    await new Promise((resolve) => {
      let busy = false;
      $$('.outfit', counter).forEach((b) => onTap(b, async () => {
        if (busy) return;
        busy = true;
        const o = b.dataset.o;
        sfx('pop');
        mianIn.classList.remove('o-day', 'o-pj', 'o-swim', 'o-rain');
        mianIn.classList.add(`o-${o}`);
        const c = centerOf(mianIn);
        burst(c.x, c.y, { n: 8, kind: 'star', spread: 100 });
        if (o === 'pj') { await say('m_pj_ok'); resolve(); return; }
        mianIn.classList.add('shiver');
        await say(`m_pj_${o}`);
        mianIn.classList.remove('shiver', `o-${o}`);
        mianIn.classList.add('o-day');
        busy = false;
      }));
      cleanups.push(() => resolve());
    });
    guard();
    counter.innerHTML = '';
    root.classList.remove('wd-open');
  }

  // ---------- 三、故事書 ----------
  async function storyTime() {
    await say('m_book');
    glowSpots(['shelf']);
    await waitTap(spot('shelf'));
    guard();
    glowSpots([]);
    counter.innerHTML = Object.entries(BOOKS).map(([k, b]) =>
      `<button class="bookbtn glow" data-b="${k}"><svg viewBox="0 0 200 260" width="150" height="195">${b.cover}</svg></button>`).join('');
    const which = await new Promise((resolve) => {
      $$('.bookbtn', counter).forEach((b) => onTap(b, () => resolve(b.dataset.b)));
      cleanups.push(() => resolve('moon'));
    });
    guard();
    counter.innerHTML = '';
    sfx('whoosh');
    const book = BOOKS[which];
    const prefix = which === 'moon' ? 's1' : 's2';
    const node = el(`<div class="storybook"><div class="page"></div><button class="round-btn next hidden">${NEXT}</button></div>`);
    root.appendChild(node);
    for (let i = 0; i < book.pages.length; i++) {
      $('.page', node).innerHTML = `<svg viewBox="0 0 800 520">${book.pages[i]}</svg>`;
      $('.page', node).classList.remove('turn'); void node.offsetWidth; $('.page', node).classList.add('turn');
      sfx('towel');
      await say(`${prefix}_p${i + 1}`);
      guard();
      const next = $('.next', node);
      next.classList.remove('hidden');
      await waitTap(node);
      guard();
      next.classList.add('hidden');
    }
    node.classList.add('away');
    await pause(400);
    node.remove();
    await say('m_book_end');
  }

  // ---------- 四、關燈抱抱 ----------
  async function lightsOut() {
    await say('m_light');
    glowSpots(['switch']);
    await waitTap(spot('switch'));
    guard();
    glowSpots([]);
    sfx('tap');
    root.classList.add('dark');
    await pause(500);
    mianIn.classList.add('shiver');
    await say('m_dark');
    guard();
    if (hard) say('m_hold_hint');
    mianBox.classList.add('huggable');
    await new Promise((resolve) => {
      let timer = null;
      const ring = el(`<div class="hug-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg></div>`);
      mianBox.appendChild(ring);
      const done = () => { clearTimeout(timer); ring.remove(); resolve(); };
      const down = (e) => {
        e.preventDefault();
        if (!hard) { done(); return; }
        ring.classList.add('on');
        timer = setTimeout(done, 2000);
      };
      const up = () => { clearTimeout(timer); ring.classList.remove('on'); };
      mianBox.addEventListener('pointerdown', down);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => mianBox.addEventListener(t, up));
      cleanups.push(() => { mianBox.removeEventListener('pointerdown', down); done(); });
    });
    guard();
    mianBox.classList.remove('huggable');
    mianIn.classList.remove('shiver');
    sfx('sparkle');
    const c = centerOf(mianIn);
    burst(c.x, c.y, { n: 14, kind: 'heart', spread: 160 });
    root.classList.add('nightlight-on');
    await say('m_hug');
    // 棉棉上床，蓋好被子
    playMusic('lullaby');
    mianBox.classList.add('in-bed');
    await pause(900);
    $('.blanketl', root).classList.remove('hidden');
    mianIn.classList.add('asleep-now');
    await say('m_night');
  }

  // ---------- 給獎 ----------
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
    await pause(650);
    node.remove();
  }
  async function celebrate() {
    guard();
    const slot = currentSlot(REWARD_SLOTS.bedroom, hour());
    const winners = slot ? profile.members.filter((id) => !hasClaimed(id, `bedroom_${slot}`)) : [];
    if (winners.length) {
      const gifts = winners.map((id) => {
        const item = nextItem(state.profiles[id].collection, 'mian');
        addItem(id, item);
        claim(id, `bedroom_${slot}`);
        return { id, item };
      });
      save();
      await showGift(gifts);
    }
    guard();
    await say('m_mission');
  }

  // ---------- 流程 ----------
  async function main() {
    mode = 'act';
    await say('m_hello');
    guard();
    await say(hard ? 'm_toys_hard' : 'm_toys_easy');
    guard();
    if (hard) await toysHard(); else await toysEasy();
    guard();
    sfx('fanfare');
    await say('m_toys_done');
    guard();
    await pajamas();
    guard();
    await storyTime();
    guard();
    await lightsOut();
    guard();
    await celebrate();
    mode = 'done';
    if (timeUp) await goodbye();
  }

  async function goodbye() {
    mode = 'end';
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
    cleanups.forEach((fn) => fn());
    hush();
  }

  // 睡著之後點棉棉：小聲打呼
  onTap(mianBox, () => {
    if (mode !== 'done') return;
    sfx('snore');
    speak(CHAR, 'm_sleeping', { node: mianIn });
  });
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

  playMusic('bedroom');
  main().catch((e) => { if (e.message !== 'scene-closed') throw e; });

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

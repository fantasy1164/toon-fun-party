// 聖誕節：降臨月曆與聖誕樹、聖誕老公公從煙囪登場、平安夜餅乾、聖誕節早上拆禮物。
import { PROFILES, CHARACTERS } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { state, save, addItem } from '../core/store.js';
import * as fest from '../core/festival.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import { itemSvg } from '../art/items.js';
import { ensureInkFilter } from '../art/stamps.js';
import { treeSvg, adventDoor, GIFT, COOKIES, FOOTPRINTS, stampBook } from '../art/xmas.js';
import { ICON } from './screens.js';
import { turnsOn, turnsScene, turnCall, passTurn } from '../core/turns.js';

const ROOM_BG = `<rect width="1200" height="900" fill="#f7dcc0"/><rect y="700" width="1200" height="200" fill="#b9824f"/>
  <path d="M0 700H1200" stroke="#9a6a3c" stroke-width="8"/>
  <rect x="40" y="60" width="300" height="220" rx="18" fill="#26386e"/><rect x="40" y="60" width="300" height="220" rx="18" fill="none" stroke="#fff" stroke-width="14"/>
  <path d="M190 60V280M40 170H340" stroke="#fff" stroke-width="10"/>
  ${[[80, 100], [150, 220], [250, 120], [300, 230], [110, 250], [220, 90]].map(([x, y]) => `<circle class="snow" cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join('')}`;

// 打開的格子：多人一起玩時，每個人都開了才算開
function doorState(members, d) {
  const x = fest.xmas();
  const today = fest.day();
  if (members.every((id) => x.opened[id].includes(d))) return 'open';
  if (!fest.adventOpen() && !fest.isChristmas() && !(fest.isDecember() && today > 24)) return 'locked';
  if (d > Math.min(today, 24)) return 'locked';
  return d === today ? 'today' : 'past';
}

// ---------- 降臨月曆與聖誕樹 ----------
export function treeScreen(stage, profile) {
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const eve = fest.isEve();
    const x = fest.xmas();
    const node = el(`
      <div class="screen xtree">
        <svg class="room" viewBox="0 0 1200 900">${ROOM_BG}
          <g class="treeg">${treeSvg(x.opened, { star: x.opened.yh.includes(24) || x.opened.xz.includes(24), x: 120, y: 30, s: 0.95 })}</g>
          ${eve ? `<g class="table"><rect x="640" y="600" width="230" height="20" rx="8" fill="#8a5a2b"/><rect x="660" y="620" width="16" height="90" fill="#8a5a2b"/><rect x="834" y="620" width="16" height="90" fill="#8a5a2b"/>
            <g class="plate ${x.cookies ? 'on' : ''}" transform="translate(745 590)">${COOKIES}</g></g>` : ''}
          <g class="hostg">${characterSvg(host, { x: eve ? 920 : 620, y: 520, s: 0.85 })}</g>
        </svg>
        ${eve ? '' : `<div class="advent">${Array.from({ length: 24 }, (_, i) => adventDoor(i + 1, doorState(profile.members, i + 1))).join('')}</div>`}
        ${eve && !x.cookies ? `<button class="round-btn tray"><svg viewBox="-100 -90 200 120" width="140" height="84">${COOKIES}</svg></button>` : ''}
        <button class="round-btn home">${ICON.home}</button>
      </div>`);
    stage.replaceChildren(node);
    playMusic('xmas');
    const hostNode = $('.hostg', node);
    const say = (line) => speak(host, line, { name: profile.name, who: profile.id, node: hostNode });
    // 一起玩：輪流開降臨月曆
    turnsScene(node);
    let calling = false;
    const next = async () => { if (!turnsOn()) return; calling = true; await turnCall(host, hostNode); calling = false; };

    function redrawTree(withStar) {
      $('.treeg', node).innerHTML = treeSvg(fest.xmas().opened, { star: withStar, x: 120, y: 30, s: 0.95 });
    }

    let busy = false;
    $$('.adv', node).forEach((b) => onTap(b, async () => {
      if (busy || calling) return;
      const d = +b.dataset.d;
      const st = b.classList.contains('open') ? 'open' : b.classList.contains('locked') ? 'locked' : 'go';
      if (st === 'locked') { sfx('wrong'); say('a_wait'); return; }
      if (st === 'open') { sfx('tap'); return; }
      busy = true;
      passTurn();
      sfx('sparkle');
      b.classList.add('opening');
      await wait(450);
      profile.members.forEach((id) => fest.openDay(id, d));
      b.outerHTML = adventDoor(d, 'open');
      const c = centerOf($(`.adv[data-d="${d}"]`, node));
      burst(c.x, c.y, { n: 10, kind: 'star', spread: 120 });
      redrawTree(d === 24 || fest.xmas().opened.yh.includes(24) || fest.xmas().opened.xz.includes(24));
      $$(`.orn[data-k$="-${d}"]`, node).forEach((o) => o.classList.add('fresh'));
      sfx('pop');
      if (d === 24) await say('a_star'); else await say('a_hang');
      const more = $$('.adv.past, .adv.today', node).length;
      await say(more ? 'a_more' : 'a_done');
      if (more) await next();
      busy = false;
    }));

    const tray = $('.tray', node);
    if (tray) onTap(tray, async () => {
      if (calling) return;
      passTurn();
      tray.remove();
      fest.placeCookies();
      $('.plate', node).classList.add('on');
      sfx('pop');
      const c = centerOf($('.plate', node));
      burst(c.x, c.y, { n: 10, kind: 'star', spread: 120 });
      await say('e_ready');
    });

    onTap($('.home', node), () => { hush(); sfx('tap'); resolve(); });

    if (eve) say(x.cookies ? 'e_ready' : 'e_cookie').then(() => { if (!x.cookies) next(); });
    else if ($$('.adv.today, .adv.past', node).length) say('a_open').then(next);
    else say('tree_hi');
  });
}

// ---------- 聖誕老公公從煙囪探頭打招呼（12 月第一次） ----------
export async function santaPop(hubNode, profile) {
  const pop = el(`<svg class="santa-pop" viewBox="0 0 1200 900">${characterSvg('santa', { x: 960, y: 600, s: 0.7 })}</svg>`);
  hubNode.appendChild(pop);
  await wait(50);
  pop.classList.add('up');
  sfx('sparkle');
  await wait(700);
  await speak('santa', 's_hello', { name: profile.name, who: profile.id, node: pop });
  profile.members.forEach((id) => fest.greet(id));
  pop.classList.remove('up');
  await wait(700);
  pop.remove();
}

// ---------- 聖誕節早上：拆禮物 ----------
export function christmasMorning(stage, profile) {
  ensureInkFilter();
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const x = fest.xmas();
    const node = el(`
      <div class="screen xmorning">
        <svg class="room" viewBox="0 0 1200 900">${ROOM_BG}
          ${treeSvg(x.opened, { star: true, x: 120, y: 30, s: 0.95 })}
          <g class="table"><rect x="880" y="600" width="230" height="20" rx="8" fill="#8a5a2b"/><rect x="900" y="620" width="16" height="90" fill="#8a5a2b"/><rect x="1074" y="620" width="16" height="90" fill="#8a5a2b"/>
            <g class="plate on eaten" transform="translate(985 590)">${COOKIES}</g></g>
          ${FOOTPRINTS}
          <g class="hostg">${characterSvg(host, { x: 30, y: 560, s: 0.8 })}</g>
        </svg>
        <div class="giftbox">${GIFT}</div>
        <div class="santa-in"><svg viewBox="0 0 1200 900">${characterSvg('santa', { x: 860, y: 300, s: 1.15 })}</svg></div>
      </div>`);
    stage.replaceChildren(node);
    playMusic('xmas');
    const hostNode = $('.hostg', node);
    const santaNode = $('.santa-in', node);
    const box = $('.giftbox', node);
    const sayHost = (line) => speak(host, line, { name: profile.name, who: profile.id, node: hostNode });
    const saySanta = (line) => speak('santa', line, { name: profile.name, who: profile.id, node: santaNode });

    let taps = 0;
    let started = false;
    // 一起玩：輪流拍禮物盒，一人兩下
    turnsScene(node);
    const need = turnsOn() ? 4 : 3;
    (async () => {
      await sayHost('m_look');
      await sayHost('m_gift');
      await turnCall(host, hostNode);
      started = true;
      box.classList.add('glow');
    })();

    onTap(box, async () => {
      if (!started || taps >= need) return;
      taps++;
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      sfx(taps < need ? 'pop' : 'fanfare');
      passTurn();
      if (taps < need) {
        if (turnsOn()) { started = false; await turnCall(host, hostNode); started = true; }
        return;
      }
      box.classList.remove('glow');
      box.classList.add('open');
      const c = centerOf(box);
      burst(c.x, c.y - 60, { n: 24, kind: 'star', spread: 260 });
      await wait(600);

      // 特別收藏品
      profile.members.forEach((id) => { addItem(id, 'xmas_globe'); fest.openGift(id); });
      save();
      const cards = profile.members.map((id) => `<div class="card">${itemSvg('xmas_globe', 210)}
        ${profile.members.length > 1 ? `<div class="owner">${avatarSvg(id, 98)}</div>` : ''}</div>`).join('');
      const gift = el(`<div class="gift">${cards}</div>`);
      node.appendChild(gift);
      sfx('sparkle');
      await wait(1800);
      gift.classList.add('away');
      await wait(650);
      gift.remove();

      // 聖誕老公公登場
      santaNode.classList.add('in');
      sfx('whoosh');
      await wait(700);
      await saySanta('s_merry');

      // 印章本：12 月蓋的章飛進本子
      const books = profile.members.map((id) => {
        const p = state.profiles[id];
        const entries = fest.decemberStamps(id).map((e, i) => ({ s: p.stamp?.shape, c: p.stamp?.color, rot: (i * 7) % 24 - 12 }));
        return `<div class="bookwrap"><div class="owner">${avatarSvg(id, 90)}</div>${stampBook(entries)}</div>`;
      }).join('');
      const bookNode = el(`<div class="books">${books}</div>`);
      node.appendChild(bookNode);
      sfx('whoosh');
      await wait(1200);
      await saySanta('s_book');
      if (fest.xmas().realGift) await saySanta('s_bed');
      else await saySanta('s_bye');
      await wait(800);
      bookNode.remove();
      resolve();
    });
  });
}

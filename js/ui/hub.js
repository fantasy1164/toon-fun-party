// 選房間：小房子裡的兩個房間，點一個進去。
import { CHARACTERS } from '../config.js';
import { el, $, $$, onTap, wait, pick, burst, centerOf } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak, hush } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { characterSvg, avatarSvg } from '../art/characters.js';
import { ICON } from './screens.js';
import * as fest from '../core/festival.js';
import { ROOF_LIGHTS, TREE_ICON } from '../art/xmas.js';
import { santaPop } from './xmas.js';

const BATH = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#dcf3f5"/>
  ${[60, 140, 220, 300, 380].map((x) => `<path d="M${x} 0V260" stroke="#c4e6ea" stroke-width="3"/>`).join('')}
  <rect y="260" width="420" height="160" fill="#a9dbe6"/>
  <rect x="120" y="60" width="180" height="140" rx="26" fill="#fff"/><rect x="132" y="72" width="156" height="116" rx="18" fill="#d6f2fb"/>
  <rect x="80" y="250" width="260" height="130" rx="14" fill="#7cc4d8"/><rect x="66" y="228" width="288" height="30" rx="14" fill="#fff"/>
  <path d="M200 228V200Q200 182 218 182H232V196H220Q214 196 214 204V228Z" fill="#b9c6d2"/>
  <rect x="110" y="170" width="12" height="60" rx="6" fill="#ff7fa8"/><rect x="104" y="152" width="24" height="26" rx="6" fill="#fff" stroke="#9fd8ee" stroke-width="3"/>
  <rect x="280" y="200" width="54" height="28" rx="12" fill="#ff9fc4"/>
  ${[[150, 110, 16], [250, 140, 12], [300, 90, 10]].map(([x, y, r]) => `<circle class="bub" cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join('')}
</svg>`;

const KITCHEN = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#fff1d6"/>
  <rect x="120" y="40" width="180" height="110" rx="14" fill="#9fdcff" stroke="#fff" stroke-width="10"/>
  ${characterSvg('bobo', { x: 120, y: 120, s: 0.75 })}
  <rect x="20" y="290" width="380" height="36" rx="14" fill="#d9a066"/><rect x="40" y="326" width="24" height="80" fill="#b9824f"/><rect x="356" y="326" width="24" height="80" fill="#b9824f"/>
  <ellipse cx="210" cy="292" rx="70" ry="16" fill="#fff" stroke="#eee" stroke-width="4"/>
  <circle cx="186" cy="284" r="12" fill="#2e8b57"/><circle cx="214" cy="282" r="12" fill="#fff" stroke="#eee" stroke-width="2"/><circle cx="214" cy="282" r="6" fill="#ffc400"/><circle cx="240" cy="284" r="11" fill="#e5484d"/>
</svg>`;

const BED = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#5a5290"/>
  <rect x="150" y="40" width="130" height="110" rx="12" fill="#26386e" stroke="#fff" stroke-width="8"/><circle cx="240" cy="80" r="18" fill="#fff6c8"/>
  <rect y="300" width="420" height="120" fill="#8a6a52"/>
  <rect x="200" y="240" width="200" height="70" rx="18" fill="#fff"/><rect x="240" y="250" width="160" height="80" rx="20" fill="#9b85f0"/>
  ${characterSvg('mian', { x: 20, y: 150, s: 0.7 })}
  <circle cx="380" cy="200" r="40" fill="#ffe08a" opacity=".35"/>
</svg>`;

const CAR = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#9fdcff"/>
  <rect y="260" width="420" height="160" fill="#6b6f7a"/><rect x="0" y="330" width="420" height="10" fill="#fff" opacity=".7"/>
  <path d="M60 270V200Q70 150 120 140H290Q340 150 360 200V270Z" fill="#ff6b5c"/>
  <path d="M110 200Q120 160 150 160H270Q300 160 310 200Z" fill="#d6f4ff"/>
  ${characterSvg('kiki', { x: 150, y: 150, s: 0.32 })}
  <circle cx="120" cy="280" r="34" fill="#333"/><circle cx="300" cy="280" r="34" fill="#333"/><circle cx="120" cy="280" r="14" fill="#ddd"/><circle cx="300" cy="280" r="14" fill="#ddd"/>
  <g transform="translate(360 60)"><rect x="-4" y="40" width="8" height="140" fill="#555"/><rect x="-22" y="-30" width="44" height="100" rx="10" fill="#333"/><circle cy="-10" r="12" fill="#e5484d"/><circle cy="20" r="12" fill="#5a4a20"/><circle cy="50" r="12" fill="#204a2a"/></g>
</svg>`;

const LIVING = `<svg viewBox="0 0 420 420" width="420" height="420">
  <rect width="420" height="420" rx="40" fill="#fbe3c4"/>
  <rect y="300" width="420" height="120" fill="#c8915a"/>
  <rect x="210" y="60" width="160" height="270" rx="8" fill="#8a5a2b"/>
  <rect x="222" y="72" width="136" height="258" rx="6" fill="#d96c4a"/>
  <rect x="242" y="92" width="96" height="70" rx="8" fill="#9fdcff"/>
  <circle cx="340" cy="210" r="9" fill="#ffd34d"/>
  <rect x="30" y="80" width="150" height="18" rx="8" fill="#b9824f"/>
  <g transform="translate(36 98) scale(.55)"><path d="M30 12L50 20L70 12L94 30L84 50L76 46V92H24V46L16 50L6 30Z" fill="#3f7fd6"/></g>
  <g transform="translate(100 96) scale(.55)"><path d="M6 50Q50 -8 94 50Q83 42 72 50Q61 42 50 50Q39 42 28 50Q17 42 6 50Z" fill="#8e4ec6"/><path d="M50 50V84q0 10 -10 10" fill="none" stroke="#555" stroke-width="5"/></g>
  <g transform="translate(40 230) scale(.6)"><path d="M10 62Q12 44 30 44L44 46Q52 58 70 58L88 62Q94 66 92 74H10Z" fill="#ff6b5c"/><rect x="10" y="72" width="82" height="9" rx="3" fill="#fff"/></g>
  ${characterSvg('kiki', { x: 110, y: 168, s: 0.6 })}
</svg>`;

export function showHub(stage, profile) {
  return new Promise((resolve) => {
    const host = pick(Object.keys(CHARACTERS));
    const night = phase() === 'night';
    const avatars = profile.members.map((id) => `<div class="av">${avatarSvg(id, 96)}</div>`).join('');
    const node = el(`
      <div class="screen hub ${night ? 'night' : ''}">
        <div class="roof"></div>
        <div class="avs">${avatars}</div>
        <button class="room" data-room="bathroom">${BATH}</button>
        <button class="room" data-room="kitchen">${KITCHEN}</button>
        <button class="room" data-room="door">${LIVING}</button>
        <button class="room" data-room="bedroom">${BED}</button>
        <button class="room" data-room="car">${CAR}</button>
        <button class="round-btn home">${ICON.home}</button>
        ${fest.isDecember() ? `${ROOF_LIGHTS}<button class="round-btn treebtn">${TREE_ICON}</button>` : ''}
      </div>`);
    stage.replaceChildren(node);
    playMusic('lobby');
    let done = false;
    const go = async (room, btn) => {
      if (done) return;
      done = true;
      hush();
      sfx('fanfare');
      if (btn) {
        btn.classList.add('chosen');
        const c = centerOf(btn);
        burst(c.x, c.y, { n: 12, kind: 'star', spread: 180 });
        await wait(600);
      }
      resolve(room);
    };
    $$('.room', node).forEach((b) => onTap(b, () => go(b.dataset.room, b)));
    onTap($('.home', node), () => { sfx('tap'); go('back'); });
    const tb = $('.treebtn', node);
    if (tb) onTap(tb, () => go('tree', tb));
    // 12 月第一次進來：聖誕老公公從煙囪探頭打招呼
    const x = fest.isDecember() ? fest.xmas() : null;
    if (x && fest.day() <= 24 && profile.members.some((id) => !x.greeted[id])) {
      santaPop(node, profile).then(() => { if (!done) speak(host, 'hub_pick', { name: profile.name, who: profile.id }); });
    } else {
      speak(host, 'hub_pick', { name: profile.name, who: profile.id });
    }
  });
}

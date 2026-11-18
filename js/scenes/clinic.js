// 診所：大象醫生圓圓。奇奇陪著來看病。
// 戴口罩 → 候診安靜坐好（奇奇亂跑要提醒）→ 叫號 → 量體溫、看喉嚨、聽心跳 → 打預防針前深呼吸 → 勇敢貼紙
// → 藥要爸媽拿給你吃（6 歲加：生病要休息）→ 回家洗手。
import { el, $, $$, wait, pick, burst, centerOf, onTap } from '../core/dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { speak } from '../core/voice.js';
import { phase } from '../core/clock.js';
import { avatarSvg } from '../art/characters.js';
import { clinicBack, CL, TOOL } from '../art/clinic.js';
import { makeScene, charDiv } from './party.js';
import { pickCard, tapOne, hardNow, giveReward, moveTo, kidNode } from './kit.js';

const HOST = 'yuanyuan';
const CHAIRS = [[298, 560], [408, 560], [518, 560]];

export function mountClinic(stage, { profile, onExit }) {
  const kids = profile.members;
  const two = kids.length > 1;
  const inner = `
    <div class="kt-things"></div>
    ${charDiv('kiki', 600, 420)}
    ${charDiv(HOST, 930, 420)}
    ${kids.map((id, i) => kidNode(id, 560 + i * 130, 810)).join('')}
    <div class="kt-cards hidden"></div>`;
  const ctl = makeScene(stage, profile, onExit, inner, HOST, { cls: 'kit clinic', back: clinicBack(phase()) });
  const { root, guard, pause } = ctl;
  const who = (id) => $(`.p-char[data-who="${id}"]`, root);
  const kidEl = (id) => $(`.kt-kid[data-id="${id}"]`, root);
  const say = async (id, line) => { guard(); await speak(id, line, { name: profile.name, who: profile.id, node: who(id) }); guard(); };
  const host = (line) => say(HOST, line);
  const things = $('.kt-things', root);
  const box = $('.kt-cards', root);
  const call = () => ctl.call();
  const card = (right, wrongs, wrongLine) => pickCard(box, { right, wrongs, hard: hardNow(profile), call, onWrong: () => host(wrongLine), cleanups: ctl.cleanups });
  const tap = (node) => tapOne(node, { call, cleanups: ctl.cleanups });
  function thing(cls, html, [x, y]) {
    const n = el(`<button class="kt-thing ${cls}" style="left:${x}px;top:${y}px">${html}</button>`);
    things.appendChild(n);
    return n;
  }
  const kidFoot = (i) => (two ? [700 + i * 130, 760] : [760, 760]);

  async function arrive() {
    await host('cl_hello');
    await host('cl_mask');
    await card(CL.mask, [CL.sunglasses], 'cl_mask_wrong');
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="kt-mask">${TOOL.maskOn}</div>`));
    sfx('pop');
    await host('cl_mask_ok');
  }

  async function waiting() {
    await host('cl_wait');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), CHAIRS[i], 800)));
    guard();
    // 奇奇跑來跑去
    const ki = who('kiki');
    ki.classList.add('running');
    await say('kiki', 'cl_kiki_run');
    const runs = [[300, 640], [160, 560], [620, 640]];
    let r = 0;
    const iv = setInterval(() => { moveTo(ki, runs[r++ % runs.length], 600); sfx('pop'); }, 700);
    ctl.cleanups.push(() => clearInterval(iv));
    await host('cl_quiet');
    ki.classList.add('glow-c');
    await tap(ki);
    clearInterval(iv);
    guard();
    ki.classList.remove('glow-c', 'running');
    await pause(650);
    await say('kiki', 'cl_kiki_ok');
    await moveTo(ki, two ? [160, 640] : CHAIRS[2], 700);
    guard();
    await pause(900);
    sfx('ding');
    await host('cl_call');
    await Promise.all(kids.map((id, i) => moveTo(kidEl(id), kidFoot(i), 800)));
    guard();
  }

  async function exam() {
    const k0 = kidEl(kids[0]);
    // 量體溫
    const th = thing('cl-tool', TOOL.thermo, [880, 330]);
    const li = thing('cl-tool', TOOL.light, [1000, 330]);
    const st = thing('cl-tool', TOOL.steth, [1080, 300]);
    await host('cl_thermo');
    await tap(th);
    guard();
    await moveTo(th, [parseFloat(k0.style.left) + 120, parseFloat(k0.style.top) + 70], 600);
    for (let i = 0; i < 3; i++) { sfx('beep'); await pause(350); }
    th.classList.add('ok');
    await host('cl_thermo_ok');
    th.remove();
    // 看喉嚨
    await host('cl_mouth');
    await tap(li);
    guard();
    await moveTo(li, [parseFloat(k0.style.left) + 140, parseFloat(k0.style.top) + 90], 600);
    li.classList.add('on');
    kids.forEach((id) => kidEl(id).classList.add('ah'));
    await host('cl_ah');
    kids.forEach((id) => kidEl(id).classList.remove('ah'));
    await host('cl_mouth_ok');
    li.remove();
    // 聽心跳
    await host('cl_heart');
    await tap(st);
    guard();
    await moveTo(st, [parseFloat(k0.style.left) + 70, parseFloat(k0.style.top) + 140], 600);
    const heart = thing('cl-heart', TOOL.heart, [520, 220]);
    sfx('heart');
    await pause(1300);
    sfx('heart');
    await host('cl_heart_ok');
    heart.remove();
    st.remove();
    // 打預防針：先深呼吸三次
    await host('cl_shot');
    const bal = thing('cl-balloon', TOOL.balloon, [490, 200]);
    for (let i = 0; i < 3; i++) {
      bal.classList.add('big');
      await host('cl_in');
      await tap(bal);
      guard();
      bal.classList.remove('big');
      await host('cl_out');
    }
    bal.remove();
    const shot = thing('cl-tool', TOOL.shot, [880, 330]);
    await moveTo(shot, [parseFloat(k0.style.left) + 140, parseFloat(k0.style.top) + 110], 600);
    sfx('pop');
    await pause(400);
    shot.remove();
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="kt-band">${TOOL.bandage}</div>`));
    await host('cl_shot_ok');
    kids.forEach((id) => kidEl(id).insertAdjacentHTML('beforeend', `<div class="kt-sticker">${TOOL.sticker}</div>`));
    sfx('sparkle');
    kids.forEach((id) => { const c = centerOf(kidEl(id)); burst(c.x, c.y, { n: 12, kind: 'star', spread: 120 }); });
    await host('cl_sticker');
  }

  async function medicine() {
    await host('cl_med');
    await card(CL.med_parent, [CL.med_alone, CL.candy_med], 'cl_med_wrong');
    await host('cl_med_ok');
    if (profile.level === 'hard' || two) {
      await host('cl_rest');
      await card(CL.rest, [CL.play_sick], 'cl_rest_wrong');
      await host('cl_rest_ok');
    }
  }

  (async () => {
    playMusic('clinic');
    await wait(400);
    try {
      ctl.mode = 'act';
      await arrive();
      await waiting();
      await exam();
      await medicine();
      await host('dn_clinic');   // 說出做到了什麼
      await host('cl_bye');
      await giveReward({ root, kids, reward: 'clinic', series: HOST, say: host });
      await host('cl_mission');
      ctl.mode = 'done';
      if (ctl.timeUp) ctl.goodbye();
    } catch (e) {
      if (e.message !== 'scene-closed') throw e;
    }
  })();

  return ctl.api;
}

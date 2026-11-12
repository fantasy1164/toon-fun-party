// 台詞表。{name} 會換成正在玩的小孩名字。
// 每句可以是所有角色共用的字串，或是 { dudu, kiki } 各自的說法。
// 語音檔放 assets/voice/<角色>/<台詞id>.mp3；含 {name} 的句子檔名為 <台詞id>.<yh|xz|both>.mp3。
export const LINES = {
  // ---- 通用 ----
  hello: { dudu: '{name}，你好。我是嘟嘟。', kiki: '嗨！{name}！我是奇奇，一起玩吧！' },
  hello_morning: { dudu: '早安，{name}。今天也要乾乾淨淨喔。', kiki: '早安！{name}！太陽出來囉！' },
  hello_night: { dudu: '{name}，晚上好。睡覺前要刷牙喔。', kiki: '哈啊……{name}，奇奇有點想睡了。' },
  praise1: { dudu: '好棒。', kiki: '哇！超厲害！' },
  praise2: { dudu: '你做得真好。', kiki: '耶！成功了！' },
  praise3: { dudu: '非常乾淨，嘟嘟喜歡。', kiki: 'Good job！太棒了！' },
  wrong: { dudu: '不是這個喔，再找找看。', kiki: '哎呀，不是這個，再試一次！' },
  gift: { dudu: '這個送給你。', kiki: '噹噹！禮物送給你！' },
  practice: { dudu: '練習得很好，下次再送你禮物。', kiki: '練習成功！禮物下次再給你喔！' },
  bye: { dudu: '今天玩得很開心。我們要去休息了，明天見。', kiki: '奇奇要回家吃飯囉！{name}，明天再一起玩！掰掰！' },
  sleeping: { dudu: '噓……大家都睡著了。{name}也去睡覺吧，晚安。', kiki: '呼……呼……晚安……' },
  resting: { dudu: '嘟嘟在休息。{name}也讓眼睛休息一下吧。', kiki: '奇奇出去玩了！{name}也去動一動吧！' },

  // ---- 廁所：選活動 ----
  bath_pick: { dudu: '要刷牙，還是洗手呢？', kiki: '刷牙？洗手？選一個吧！' },

  // ---- 廁所：刷牙 ----
  b_paste: { dudu: '先擠牙膏。一點點就好。', kiki: '先找牙膏！擠一點點！' },
  b_brush: { dudu: '拿起牙刷，幫我把牙齒刷乾淨。', kiki: '牙刷在哪裡？幫奇奇刷牙！' },
  b_go: { dudu: '上面刷刷，下面刷刷。', kiki: '刷刷刷！把小怪物趕走！' },
  b_more: { dudu: '還有髒髒的地方，繼續刷。', kiki: '還有小怪物躲著！快刷！' },
  b_rinse: { dudu: '拿杯子，漱漱口。', kiki: '用杯子漱口！咕嚕咕嚕！' },
  b_done: { dudu: '牙齒亮晶晶。', kiki: '哇！牙齒閃閃發亮！' },
  b_mission: { dudu: '換{name}去刷牙囉。刷完請爸爸媽媽蓋章。', kiki: '換{name}了！快去刷牙，刷完找爸爸媽媽蓋章！' },
  en_toothbrush: 'Toothbrush！牙刷！',
  en_cup: 'Cup！杯子！',

  // ---- 廁所：洗手 ----
  w_wet: { dudu: '打開水龍頭，把手沖濕。', kiki: '開水！把手沖一沖！' },
  w_soap: { dudu: '抹一抹肥皂。', kiki: '肥皂！抹一抹！' },
  w_rub: { dudu: '搓搓手心，搓搓手背，搓出泡泡。', kiki: '搓搓搓！好多泡泡！' },
  w_rinse: { dudu: '再開水，把泡泡沖乾淨。', kiki: '再開水！把泡泡沖光光！' },
  w_dry: { dudu: '用毛巾擦乾。', kiki: '毛巾！擦一擦！' },
  w_done: { dudu: '小手乾乾淨淨。', kiki: '小手香噴噴！' },
  w_mission: { dudu: '{name}吃飯前、上完廁所，也要洗手喔。', kiki: '{name}吃東西以前也要洗手喔！' },
  en_soap: 'Soap！肥皂！',
  en_towel: 'Towel！毛巾！',
};

export function lineText(id, charId, name) {
  const l = LINES[id];
  if (!l) return '';
  const t = typeof l === 'string' ? l : l[charId] || Object.values(l)[0];
  return t.replaceAll('{name}', name);
}

export function lineHasName(id, charId) {
  const l = LINES[id];
  const t = typeof l === 'string' ? l : l?.[charId] || '';
  return t.includes('{name}');
}

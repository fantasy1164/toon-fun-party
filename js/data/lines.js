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

// ---- 好寶寶印章：挑選 ----
Object.assign(LINES, {
  stamp_pick: { dudu: '{name}，選一個你最喜歡的印章吧。', kiki: '{name}！挑一個最酷的印章！' },
  stamp_repick: { dudu: '{name}，要換新的印章嗎？想換就再選一次。', kiki: '新的一張卡！{name}要不要換一個印章？' },
  stamp_color: { dudu: '要什麼顏色呢？', kiki: '選一個顏色！' },
  stamp_try: { dudu: '在紙上蓋蓋看。', kiki: '在紙上咚一下試試看！' },
  stamp_ok: { dudu: '喜歡的話，按綠色的勾勾。', kiki: '喜歡就按綠色勾勾！' },
  stamp_mine: { dudu: '這是{name}的印章，好漂亮。', kiki: '耶！這是{name}專屬的印章！' },
  sh_star: '星星', sh_heart: '愛心', sh_dino: '恐龍', sh_rocket: '火箭', sh_rainbow: '彩虹', sh_crown: '皇冠',
  sh_cat: '小貓', sh_sun: '太陽', sh_flower: '花朵', sh_car: '汽車', sh_butterfly: '蝴蝶', sh_moon: '月亮',
  co_red: '紅色', co_orange: '橘色', co_yellow: '黃色', co_green: '綠色', co_blue: '藍色', co_purple: '紫色', co_pink: '粉紅色',

  // ---- 好寶寶印章：蓋章 ----
  stamp_intro: { dudu: '{name}今天表現很好，可以蓋章喔。把印章按下去。', kiki: '{name}今天超棒的！快把印章咚下去！' },
  r_teeth: { dudu: '牙齒刷得乾乾淨淨。', kiki: '牙齒刷得亮晶晶！' },
  r_eat: { dudu: '吃飯吃得很好。', kiki: '吃飯吃光光！' },
  r_toys: { dudu: '玩具都收好了。', kiki: '玩具全部收好了！' },
  r_sleep: { dudu: '有準時上床睡覺。', kiki: '準時上床睡覺！' },
  r_polite: { dudu: '很有禮貌。', kiki: '超有禮貌！' },
  r_help: { dudu: '會幫忙做家事。', kiki: '會幫忙做家事！' },
  r_share: { dudu: '願意跟別人分享。', kiki: '會分享，好大方！' },
  r_other: { dudu: '今天整天都很棒。', kiki: '今天整天都超棒！' },
  stamp_next: { dudu: '明天也要加油喔。', kiki: '明天也要繼續加油！' },
  card_full: { dudu: '{name}集滿了！好厲害。快去找爸爸媽媽領獎品。', kiki: '哇！{name}集滿了！快去找爸爸媽媽拿獎品！' },
});

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

// 台詞表。{name} 會換成正在玩的小孩名字。
// 每句可以是所有角色共用的字串，或是 { dudu, kiki } 各自的說法。
// 語音檔放 assets/voice/<角色>/<台詞id>.mp3；含 {name} 的句子檔名為 <台詞id>.<yh|xz|both>.mp3。
export const LINES = {
  // ---- 通用 ----
  hello: { dudu: '{name}，你好。我是嘟嘟。', kiki: '嗨！{name}！我是奇奇，一起玩吧！' },
  hello_morning: { dudu: '早安，{name}。今天也要乾乾淨淨喔。', kiki: '早安！{name}！太陽出來囉！' },
  hello_night: { dudu: '{name}，晚上好。睡覺前要刷牙喔。', kiki: '哈啊……{name}，奇奇有點想睡了。' },
  praise1: { dudu: '好棒。', kiki: '哇！超厲害！', bobo: '好棒好棒！', mian: '好棒喔……' },
  praise2: { dudu: '你做得真好。', kiki: '耶！成功了！', bobo: '你做得真好！', mian: '你好厲害……' },
  praise3: { dudu: '非常乾淨，嘟嘟喜歡。', kiki: 'Good job！太棒了！', bobo: '太厲害了，波波好開心！', mian: '謝謝你，棉棉好開心。' },
  wrong: { dudu: '不是這個喔，再找找看。', kiki: '哎呀，不是這個，再試一次！' },
  gift: { dudu: '這個送給你。', kiki: '噹噹！禮物送給你！', bobo: '這個送給你！', mian: '這個……送給你。' },
  practice: { dudu: '練習得很好，下次再送你禮物。', kiki: '練習成功！禮物下次再給你喔！', bobo: '練習得很好，下次再送你禮物喔。', mian: '練習得很好喔，下次再送你禮物。' },
  bye: { dudu: '今天玩得很開心。我們要去休息了，明天見。', kiki: '奇奇要回家吃飯囉！{name}，明天再一起玩！掰掰！', bobo: '吃飽飽了，波波要去睡午覺囉，明天見！', mian: '棉棉好睏……要去睡覺了，明天見。' },
  sleeping: { dudu: '噓……大家都睡著了。{name}也去睡覺吧，晚安。', kiki: '呼……呼……晚安……' },
  resting: { dudu: '嘟嘟在休息，眼睛也要休息喔。等餅乾吃完，我們再一起玩。', kiki: '奇奇在休息！等餅乾吃完再來玩！你也去動一動吧！' },

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

// ---- 廚房（波波＋嘟嘟或奇奇） ----
Object.assign(LINES, {
  k_hello: { bobo: '{name}！一起來吃飯吧！波波肚子好餓喔！' },
  k_pick: { bobo: '要先擺餐具，還是裝一盤好吃的飯呢？' },
  k_set: { bobo: '我們來擺餐具。每個人都要有碗、湯匙和杯子。' },
  k_set_hard: { bobo: '每個人的顏色不一樣喔，咖啡色是波波的。先點餐具，再點那個人的位子。' },
  k_bowl: { bobo: '碗！' }, k_spoon: { bobo: '湯匙！' }, k_cup: { bobo: '杯子！' },
  en_k_bowl: { bobo: 'Bowl！' }, en_k_spoon: { bobo: 'Spoon！' }, en_k_cup: { bobo: 'Cup！' },
  n_1: { bobo: '一！' }, n_2: { bobo: '二！' }, n_3: { bobo: '三！' },
  k_thanks: { bobo: '謝謝你！', dudu: '謝謝。', kiki: '謝謝你！' },
  k_wrong_seat: { bobo: '這個顏色不是這個位子的喔，再看看。' },
  k_set_done: { bobo: '餐具擺好了！好整齊喔！' },
  k_meal: { bobo: '來裝一盤好吃又健康的飯！要有飯、青菜、肉或蛋，還有水果。' },
  k_meal_easy: { bobo: '亮亮的食物，一個一個放進盤子裡！' },
  f_rice: { bobo: '白飯！' }, f_broccoli: { bobo: '花椰菜！' }, f_carrot: { bobo: '紅蘿蔔！' }, f_egg: { bobo: '荷包蛋！' }, f_fish: { bobo: '魚！' },
  f_apple: { bobo: '蘋果！' }, f_banana: { bobo: '香蕉！' }, f_candy: { bobo: '糖果……' }, f_chips: { bobo: '洋芋片……' },
  en_rice: { bobo: 'Rice！' }, en_broccoli: { bobo: 'Broccoli！' }, en_carrot: { bobo: 'Carrot！' }, en_egg: { bobo: 'Egg！' }, en_fish: { bobo: 'Fish！' },
  en_apple: { bobo: 'Apple！' }, en_banana: { bobo: 'Banana！' },
  k_bobo_meat: { bobo: '哇！波波最喜歡吃這個了！' },
  k_kiki_noveg: { kiki: '哎呀，青菜……奇奇不想吃……' },
  k_encourage: { bobo: '奇奇，吃青菜會長高、變強壯喔！' },
  k_kiki_try: { kiki: '好吧，我吃一口……嗯！好好吃！' },
  k_dudu_wash: { dudu: '吃飯前，要先把手洗乾淨喔。' },
  k_itadaki: { bobo: '我開動了！', dudu: '我開動了。', kiki: '我開動了！' },
  k_yum: { bobo: '好好吃喔！', dudu: '很好吃。', kiki: '超好吃！' },
  k_tummy: { bobo: '哎喲，肚子好痛……零食吃太多了。要吃飯和青菜才對。' },
  k_need: { bobo: '還少了什麼呢？亮亮的再找找看。' },
  k_fruit_want: { bobo: '最後一片蘋果！波波想吃！', dudu: '我也想吃。', kiki: '我也要！我也要！' },
  k_fruit_ask: { bobo: '{name}，你覺得要給誰呢？還是用刀子切一半？' },
  k_share: { bobo: '切成一半，大家一起吃！分享最快樂！' },
  k_give_happy: { bobo: '謝謝你！好甜喔！', dudu: '謝謝你。', kiki: '耶！謝謝！' },
  k_turn: { bobo: '沒關係，下次換波波。', dudu: '沒關係，下次換我。', kiki: '好吧，下次換奇奇！' },
  k_clear: { bobo: '吃飽了！點水槽，把碗收好。' },
  k_bye_meal: { bobo: '謝謝招待！', dudu: '謝謝招待。', kiki: '謝謝招待！' },
  k_mission: { bobo: '{name}吃飯要坐好，吃完自己收碗喔！' },
  hub_pick_k: { bobo: '{name}，要去哪裡玩呢？' },
});

// ---- 臥室（棉棉） ----
Object.assign(LINES, {
  m_hello: { mian: '{name}……棉棉想睡覺了，可是房間好亂……你可以幫我收玩具嗎？' },
  m_toys_easy: { mian: '亮亮的玩具，點一下就會回家喔。' },
  m_toys_hard: { mian: '積木放箱子、球放籃子、書放書架、娃娃放床上。先點玩具，再點它的家。' },
  m_n1: { mian: '一。' }, m_n2: { mian: '二。' }, m_n3: { mian: '三。' }, m_n4: { mian: '四。' },
  m_n5: { mian: '五。' }, m_n6: { mian: '六。' }, m_n7: { mian: '七。' }, m_n8: { mian: '八！' },
  m_wrong_place: { mian: '那個不是放這裡喔……' },
  m_toys_done: { mian: '房間變乾淨了，謝謝你。' },
  m_pj: { mian: '接下來要換睡衣。點一下衣櫃。' },
  m_pj_hard: { mian: '哪一件是睡衣呢？' },
  m_pj_ok: { mian: '軟軟的睡衣，好舒服。' },
  m_pj_swim: { mian: '這是游泳穿的泳衣……好冷喔。' },
  m_pj_rain: { mian: '這是下雨天穿的雨衣啦。' },
  m_book: { mian: '我們來看一本故事書。點一下書架。' },
  s1_p1: { mian: '天黑了，小月亮慢慢升上天空，跟大家說晚安。' },
  s1_p2: { mian: '可是小星星們還想玩，一閃一閃的，不想睡覺。' },
  s1_p3: { mian: '小月亮說：早點睡，明天才有精神發光喔。' },
  s1_p4: { mian: '小星星打了一個大哈欠，大家都睡著了。晚安。' },
  s2_p1: { mian: '小鱷魚有好多好多牙齒，可是他不想刷牙。' },
  s2_p2: { mian: '晚上，牙齒上的小蟲子開派對，好吵好吵。' },
  s2_p3: { mian: '小鱷魚趕快刷刷刷，把小蟲子都刷走了。' },
  s2_p4: { mian: '牙齒亮晶晶，小鱷魚笑咪咪地睡著了。' },
  m_book_end: { mian: '故事說完了。' },
  m_light: { mian: '要睡覺了，點一下開關，把燈關掉。' },
  m_dark: { mian: '好黑喔……棉棉有點怕……可以抱抱我嗎？' },
  m_hold_hint: { mian: '按著棉棉不要放開，給我一個大大的抱抱。' },
  m_hug: { mian: '謝謝你的抱抱。有小夜燈，就不怕了。' },
  m_night: { mian: '晚安，{name}。明天見……' },
  m_mission: { mian: '{name}也去換睡衣、選一本故事書，準備睡覺囉。' },
  m_sleeping: { mian: '呼……呼……' },
});

// ---- 汽車（奇奇、嘟嘟） ----
Object.assign(LINES, {
  c_hello: { kiki: '{name}！我們坐車去公園玩！' },
  c_belt: { dudu: '出發以前，大家都要繫好安全帶。' },
  c_belt_easy: { dudu: '亮亮的地方點一下，喀！就扣好了。' },
  c_click: { kiki: '喀！扣好了！', dudu: '扣好了。' },
  c_kid_ok: { dudu: '{name}也坐好安全座椅，扣好了。' },
  c_not_yet: { dudu: '還有人沒繫安全帶，車子不能出發。' },
  c_ready: { kiki: '大家都扣好了！點綠色的按鈕出發！' },
  c_go: { kiki: '出發囉！' },
  c_naughty: { kiki: '哇！外面好漂亮！我要站起來看！' },
  c_sitdown: { dudu: '奇奇，坐車要坐好，手不能伸出窗外，很危險。' },
  c_ok_sit: { kiki: '好啦好啦，我坐好了，安全帶也扣好了。' },
  c_what: { kiki: '前面有狀況！要怎麼辦？' },
  c_red: { dudu: '紅燈了，要停下來。' },
  c_green: { dudu: '綠燈了，可以走了。' },
  c_yellow: { dudu: '黃燈了，要慢慢停下來。' },
  c_walker: { dudu: '有人在過馬路，要停下來讓他們先走。' },
  c_cross: { dudu: '過馬路要牽大人的手，看左邊、看右邊。' },
  c_siren: { kiki: '喔咿喔咿！救護車來了！要靠邊讓路！' },
  c_arrive: { kiki: '到公園囉！' },
  c_unbuckle: { dudu: '車子停好了，才可以解開安全帶。點一下扣環。' },
  c_door: { dudu: '要從哪一邊下車呢？' },
  c_door_easy: { dudu: '從亮亮的那一邊下車，那邊是人行道。' },
  c_door_wrong: { dudu: '叭叭！那邊有車子經過！下車要從人行道那一邊。' },
  c_out: { kiki: '耶！去玩溜滑梯囉！' },
  c_mission: { dudu: '{name}坐車要坐安全座椅、繫好安全帶喔！' },
});

// ---- 快到休息時間 ----
Object.assign(LINES, {
  time_soon: { dudu: '再玩一下下，就要休息囉。', kiki: '再玩一下下就要休息了喔！', bobo: '再玩一下下，波波就要去休息囉。', mian: '再一下下……就要休息了喔。' },
});

// ---- 陪刷 ----
Object.assign(LINES, {
  t_ready: { dudu: '{name}，拿好你的牙刷，擠一點點牙膏。準備好就點一下。', kiki: '{name}！牙刷拿好、牙膏擠好，準備好就點一下！' },
  t_start: { dudu: '開始囉，跟著我一起刷。', kiki: '開始！跟奇奇一起刷刷刷！' },
  z_ul_out: { dudu: '刷上面左邊的外面。', kiki: '上面左邊！刷刷刷！' },
  z_ur_out: { dudu: '刷上面右邊的外面。', kiki: '上面右邊！刷刷刷！' },
  z_ll_out: { dudu: '刷下面左邊的外面。', kiki: '下面左邊！刷刷刷！' },
  z_lr_out: { dudu: '刷下面右邊的外面。', kiki: '下面右邊！刷刷刷！' },
  z_up_in: { dudu: '刷上面牙齒的裡面。', kiki: '上面的裡面也要刷！' },
  z_lo_in: { dudu: '刷下面牙齒的裡面。', kiki: '下面的裡面也要刷！' },
  z_chew: { dudu: '刷咬東西的地方，前後刷一刷。', kiki: '咬東西的地方！前前後後刷！' },
  z_front: { dudu: '最後刷門牙，上下刷一刷。', kiki: '最後是門牙！上上下下！' },
  t_spit: { dudu: '刷好了。吐掉，漱漱口。', kiki: '刷完了！吐掉，咕嚕咕嚕漱口！' },
  t_mission: { dudu: '請爸爸媽媽看看{name}的牙齒，再幫你蓋章。', kiki: '{name}快去給爸爸媽媽看牙齒，請他們蓋章！' },
});

// ---- 天氣 ----
Object.assign(LINES, {
  w_rain: { dudu: '外面在下雨。出門要穿雨衣、帶雨傘，公園濕濕的，溜滑梯今天不能玩喔。', kiki: '下雨了！馬路濕濕滑滑的，過馬路不能跑，要牽好大人的手！' },
  w_storm: { dudu: '外面在打雷，待在家裡最安全。不用怕，嘟嘟陪你。', kiki: '轟隆隆！打雷了！我們待在家裡，最安全！' },
  w_windy: { dudu: '外面風好大，出門要小心，帽子要抓好。', kiki: '呼呼呼！風好大！今天不要去放風箏喔！' },
  w_fog: { dudu: '外面霧霧的，看不清楚，過馬路要特別小心。', kiki: '霧好濃喔！外面白白的，出門要牽好手！' },
  w_hot: { dudu: '今天好熱，出門要戴帽子，記得多喝水。', kiki: '好熱好熱！戴帽子、多喝水，不要曬太久喔！' },
  w_cold: { dudu: '今天好冷，出門要穿外套。', kiki: '好冷喔！外套穿好，圍巾圍好！' },
  bye_sunny: { dudu: '外面天氣真好。{name}，我們一起去外面走走吧，明天見。', kiki: '外面有太陽耶！奇奇要去公園玩了！{name}也出去跑一跑吧！掰掰！', bobo: '外面天氣好好，{name}，吃飽了去外面散散步吧！掰掰！', mian: '外面天氣好好……{name}，去外面曬曬太陽吧，掰掰。' },
  resting_sunny: { dudu: '嘟嘟去散步了。天氣很好，你也出去走走吧。', kiki: '奇奇在公園玩！你也出去玩吧！' },
});

// ---- 聖誕節 ----
Object.assign(LINES, {
  tree_hi: { dudu: '這是我們的聖誕樹。', kiki: '哇！聖誕樹好漂亮！' },
  a_open: { dudu: '打開今天的月曆格子看看。', kiki: '打開今天的格子！裡面有什麼？' },
  a_hang: { dudu: '掛到聖誕樹上，好漂亮。', kiki: '掛上去！聖誕樹變漂亮了！' },
  a_more: { dudu: '還有之前沒打開的格子喔。', kiki: '還有沒打開的格子耶！' },
  a_done: { dudu: '明天還有新的喔。', kiki: '明天再來開新的！' },
  a_star: { dudu: '最後是星星，放在樹的最上面。', kiki: '最後一個是大星星！放到最上面！' },
  a_wait: { dudu: '還沒到那一天喔。', kiki: '那一格還不能開喔！' },
  e_cookie: { dudu: '我們幫聖誕老公公準備餅乾和牛奶吧。', kiki: '幫聖誕老公公準備餅乾跟牛奶！' },
  e_ready: { dudu: '準備好了。聖誕老公公今天晚上會來，要早點睡覺喔。', kiki: '好了！今天晚上聖誕老公公會來，快去睡覺！' },
  sleeping_eve: { dudu: '噓……聖誕老公公快來了，快去睡覺吧，晚安。', kiki: '噓……聖誕老公公要來了……晚安……' },
  m_look: { dudu: '你看，餅乾被吃掉了，地上還有腳印。', kiki: '哇！餅乾被吃掉了！還有大大的腳印！' },
  m_gift: { dudu: '樹下有一個禮物，點點看。', kiki: '樹下有大禮物！快點點看！' },
  s_hello: { santa: '呵呵呵！{name}你好，我是聖誕老公公！這個月要當好寶寶喔，我會看你的印章本！' },
  s_merry: { santa: '呵呵呵！聖誕快樂！' },
  s_book: { santa: '我看了你的印章本，{name}這個月好棒喔！' },
  s_bed: { santa: '快去看看你的床邊有什麼！呵呵呵！' },
  s_bye: { santa: '明年見囉！呵呵呵！' },
});

// ---- 選房間 ----
Object.assign(LINES, {
  hub_pick: { dudu: '{name}，要去哪裡玩呢？', kiki: '{name}！今天要去哪個房間？' },
});

// ---- 客廳大門區（奇奇擔任） ----
Object.assign(LINES, {
  d_hello: { kiki: '{name}！我們要出門去公園囉！先看看外面的天氣！' },
  d_night: { kiki: '天黑了，我們先練習明天出門要穿什麼！' },
  d_w_normal: { kiki: '今天天氣不錯！' },
  d_w_hot: { kiki: '今天太陽好大，好熱喔！' },
  d_w_rain: { kiki: '外面在下雨耶！' },
  d_w_cold: { kiki: '今天好冷喔！' },
  d_w_windy: { kiki: '外面風好大！' },
  d_what: { kiki: '要穿什麼、帶什麼呢？你幫我選！' },
  d_need_normal: { kiki: '穿好鞋子就可以出發！' },
  d_need_hot: { kiki: '要穿鞋子，還要戴帽子！' },
  d_need_rain: { kiki: '要穿雨鞋，還要帶雨傘！' },
  d_need_cold: { kiki: '要穿鞋子，還要穿外套！' },
  d_need_windy: { kiki: '要穿鞋子，還要穿外套！' },
  i_sneakers: { kiki: '運動鞋！' }, i_boots: { kiki: '雨鞋！' }, i_raincoat: { kiki: '雨衣！' }, i_umbrella: { kiki: '雨傘！' },
  i_jacket: { kiki: '外套！' }, i_scarf: { kiki: '圍巾！' }, i_hat: { kiki: '帽子！' }, i_bottle: { kiki: '水壺！' },
  en_sneakers: { kiki: 'Sneakers！' }, en_boots: { kiki: 'Rain boots！' }, en_raincoat: { kiki: 'Raincoat！' }, en_umbrella: { kiki: 'Umbrella！' },
  en_jacket: { kiki: 'Jacket！' }, en_scarf: { kiki: 'Scarf！' }, en_hat: { kiki: 'Hat！' }, en_bottle: { kiki: 'Water bottle！' },
  d_door: { kiki: '準備好了！點大門，出發！' },
  d_ok: { kiki: '耶！準備好了！出發去公園囉！' },
  d_f_shoes: { kiki: '哎呀！忘了穿鞋子，腳好痛！' },
  d_f_wet: { kiki: '哇！全身都濕了！要穿雨衣或撐雨傘！' },
  d_f_feet: { kiki: '哎呀，腳濕濕的！下雨天要穿雨鞋！' },
  d_f_hot: { kiki: '好熱好熱！穿太多了啦，脫掉！' },
  d_f_hotneed: { kiki: '太陽好大！要戴帽子，還要帶水壺喝水！' },
  d_f_flip: { kiki: '哇！雨傘被風吹翻了！風大的時候不要撐傘！' },
  d_f_norain: { kiki: '今天沒有下雨，不用雨具喔！' },
  d_f_cold: { kiki: '好冷好冷！要穿暖暖的才可以出門！' },
  d_storm_look: { kiki: '外面好像在打雷耶……點大門看看。' },
  d_storm_back: { kiki: '哇！打雷了！打雷的時候，待在家裡最安全！' },
  d_storm_inside: { kiki: '今天我們在家裡玩吧！' },
  d_m_normal: { kiki: '換{name}去穿鞋子囉！' },
  d_m_hot: { kiki: '換{name}戴帽子、帶水壺囉！' },
  d_m_rain: { kiki: '換{name}穿雨衣、穿雨鞋囉！' },
  d_m_cold: { kiki: '換{name}穿外套、圍圍巾囉！' },
  d_m_windy: { kiki: '換{name}穿好外套囉！' },
  d_spin: { kiki: '轉轉天氣轉盤，換一個天氣練習！' },
});

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

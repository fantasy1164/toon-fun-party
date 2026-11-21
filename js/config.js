// 全域設定。家長頁面可調的項目存在 store.settings，這裡是預設值。
export const STAGE_W = 1200;
export const STAGE_H = 900;

export const DEFAULT_SETTINGS = {
  sessionMin: 15, // 每次可玩幾分鐘（角色下班）
  restMin: 60,    // 下班後休息幾分鐘才能再玩
  bedtime: 21,    // 幾點後角色都睡了
  wake: 6,        // 幾點起床
  musicVol: 'mid', // 音樂大小：low、mid、high
  kidLook: 'body', // 小孩在遊戲裡的樣子：body（全身／半身）、head（只有頭）
  english: { xz: [], yh: [] }, // 英文複習：家長勾選今天要聽的（向澤：Rocket Book 曲目編號；妍卉：YouTube 播放清單第幾支，從 0 算）
};

// 英文複習（11/19 John）：起床後到 21:00 都可以進去聽；21:00 棉棉暫停、提醒再五分鐘要睡覺，21:05 結束道晚安
export const EN_END = { warn: 21, stop: 21 + 5 / 60 };
// 星期幾誰先聽（0＝星期日）：一、三、五、日向澤先；二、四、六妍卉先
export const EN_FIRST = { 0: 'xz', 1: 'xz', 2: 'yh', 3: 'xz', 4: 'yh', 5: 'xz', 6: 'yh' };

export const PROFILES = {
  yh: { id: 'yh', name: '妍卉', level: 'hard', members: ['yh'] },
  xz: { id: 'xz', name: '向澤', level: 'easy', members: ['xz'] },
  both: { id: 'both', name: '妍卉、向澤', level: 'easy', members: ['yh', 'xz'] },
};

// 好寶寶印章卡一張幾格
// 遊戲難度已分開，印章卡兩人一樣多（公平）
export const CARD_SIZE = { yh: 20, xz: 20 };

export const CHARACTERS = {
  dudu: { id: 'dudu', name: '嘟嘟', tts: { pitch: 1.25, rate: 0.95 } },
  kiki: { id: 'kiki', name: '奇奇', tts: { pitch: 1.7, rate: 1.15 } },
};

// 不參加一般輪替的角色（只在特定時候出現）
export const GUESTS = {
  bobo: { id: 'bobo', name: '波波', tts: { pitch: 0.75, rate: 0.85 } },
  mian: { id: 'mian', name: '棉棉', tts: { pitch: 1.4, rate: 0.85 } },
  gugu: { id: 'gugu', name: '咕咕老師', tts: { pitch: 0.85, rate: 0.9 } },
  santa: { id: 'santa', name: '聖誕老公公', tts: { pitch: 0.7, rate: 0.85 } },
  pupu: { id: 'pupu', name: '噗噗', tts: { pitch: 0.8, rate: 0.9 } },
  doudou: { id: 'doudou', name: '豆豆', tts: { pitch: 1.3, rate: 1.0 } },
  tiaotiao: { id: 'tiaotiao', name: '跳跳', tts: { pitch: 1.5, rate: 1.1 } },
  yuanyuan: { id: 'yuanyuan', name: '圓圓醫生', tts: { pitch: 1.05, rate: 0.9 } },
  lili: { id: 'lili', name: '栗栗', tts: { pitch: 1.45, rate: 1.05 } },
  gaogao: { id: 'gaogao', name: '高高', tts: { pitch: 1.1, rate: 1.0 } },
  yongyong: { id: 'yongyong', name: '勇勇', tts: { pitch: 0.8, rate: 0.98 } },
  sensen: { id: 'sensen', name: '森森園長', tts: { pitch: 0.85, rate: 0.9 } },
  lulu: { id: 'lulu', name: '露露館長', tts: { pitch: 1.35, rate: 0.95 } },
  // 首頁喊標題的兩個小朋友
  kidgirl: { id: 'kidgirl', name: '小女孩', tts: { pitch: 1.9, rate: 1.15 } },
  kidboy: { id: 'kidboy', name: '小男孩', tts: { pitch: 1.7, rate: 1.15 } },
};

// 各活動每天可領獎的時段（對應現實作息）。[開始小時, 結束小時)
export const REWARD_SLOTS = {
  brush: { morning: [5, 11], evening: [18, 22] },
  wash: { morning: [5, 11], noon: [11, 16], evening: [16, 22] },
  door: { morning: [5, 11] },
  kitchen: { breakfast: [5, 10], lunch: [10, 14], dinner: [16, 21] },
  bedroom: { evening: [18, 21] },
  car: { day: [0, 24] },
  school: { day: [8, 17] },
  farm: { day: [8, 17] },
  park: { day: [8, 18] },
  clinic: { day: [8, 18] },
  stairs: { day: [7, 21] },   // 樓梯間（11/21）：晚上上樓睡覺前也能領
  market: { day: [8, 20] },
  bath: { evening: [17, 22] },
  amuse: { day: [9, 19] },
  fire: { day: [8, 18] },
  dental: { day: [8, 18] },
  library: { day: [8, 18] },
  hike: { day: [7, 17] },
  bus: { day: [7, 20] },
  train: { day: [7, 20] },
  // 歡樂島動物園（11/17）：坐船、遊園車或逛展區、美食攤、紀念品店各一次
  ship: { day: [8, 17] },
  zoo: { day: [9, 17] },
  snack: { day: [9, 17] },
  gift: { day: [9, 17] },
  // 歡樂島海生館（11/19）：纜車、迎賓廣場戲水、三個館各一次（每館一個海洋生物公仔）
  cable: { day: [8, 18] },
  plaza: { day: [8, 18] },
  sea_tw: { day: [8, 18] },
  sea_coral: { day: [8, 18] },
  sea_world: { day: [8, 18] },
};

// 歡樂島動物園的開放時間：照臺北市立動物園（2026-11 查一次，之後不再查）
// 每天 9:00–17:00，16:00 停止入園；7、8 月週六延長到 21:00（20:00 停止入園）；農曆除夕休園。
// （每年 6 月的歲修休園日期不固定，遊戲裡不做；室內館輪流週一休館也不做）
export const ZOO_HOURS = { open: 9, close: 17, lastEntry: 16, summerSatClose: 21, summerSatLastEntry: 20 };

// 歡樂島海生館的開放時間：照屏東國立海洋生物博物館（2026-11 查一次，之後不再查）。全年無休。
// 1–6 月、9–12 月 09:00–17:30；7、8 月平日 09:00–18:00、週六日 08:00–18:00；春節初一到初五 08:00–18:00。
// 閉館前一小時停止入館。（國定假日表遊戲裡沒有，7、8 月只分平日、週末）
export const SEA_HOURS = { open: 9, close: 17.5, summerOpen: 9, summerWeekendOpen: 8, summerClose: 18, cnyOpen: 8, cnyClose: 18, entryBefore: 1 };
// 館內的定時活動（同一份查詢）：開始時間（小時），每場遊戲裡算 30 分鐘
// 觸摸池（台灣水域館）10:30、13:30、15:30；大洋池餵食解說 10:00、13:00、16:30；海豹餵食 10:00、14:00；企鵝餵食 11:00、15:00
export const SEA_SHOWS = {
  touch: [10.5, 13.5, 15.5],
  ocean: [10, 13, 16.5],
  seal: [10, 14],
  penguin: [11, 15],
};
export const SEA_SHOW_LEN = 0.5;

// 明星牆：每位角色一塊星星牌（照這個順序）
export const STARS = ['dudu', 'kiki', 'bobo', 'mian', 'gugu', 'doudou', 'pupu', 'tiaotiao', 'yuanyuan', 'lili', 'gaogao', 'yongyong', 'sensen', 'lulu'];
// 好朋友星星：一起做幾次集滿
export const FRIEND_MAX = 5;
// 小明星徽章：累計幾次變銅、銀、金
export const BADGE_TIERS = [1, 5, 15];

// 英文複習的課程（11/17 John 提供）。只存連結，播放時直接從原網站／YouTube 串流，不複製檔案到專案（專案是公開的）。
// 向澤：Rocket Book 1（Melody，mymelodysongs.com 公開的 mp3）
// 妍卉：Max & Mousy 3e Book 3（YouTube 播放清單，凱撒琳親子ABC；11/18 從 Book 2 換成 Book 3）。原本的 CD 網站只有 http，iPad 上不能在 https 的遊戲裡播放。

const ROCKET_BASE = 'https://mymelodysongs.com/wp-content/uploads/2021/03/';
// [光碟, 版本, 軌號, 曲名, 檔名]
const ROCKET_RAW = [
  ['A', '中英', '01', "Song- Rocket", '01-Song-Rocket'],
  ['A', '中英', '02', "Who is Who", '02-Who-is-who'],
  ['A', '中英', '03', "Song- Good Morning", '03-Song-Good-morning'],
  ['A', '中英', '04', "Letters", '04-Letters'],
  ['A', '中英', '05', "Unit 1 Story", '05-Unit-1-Story'],
  ['A', '中英', '06', "Unit 1 Let's Learn", '06-Unit-1-Lets-learn'],
  ['A', '中英', '07', "Unit 1 Song", '07-Unit-1-Song'],
  ['A', '中英', '08', "Unit 1 Go, Say and Paste", '08-Unit-1-Go-Say-and-Paste'],
  ['A', '中英', '09', "Unit 1 Everyday Talk", '09-Unit-1-Everyday-talk'],
  ['A', '中英', '10', "Unit 1 Chant", '10-Unit-1-Chant'],
  ['A', '中英', '11', "Unit 1 Games", '11-Unit-1-Games'],
  ['A', '中英', '12', "Unit 2 Story", '12-Unit-2-Story'],
  ['A', '中英', '13', "Unit 2 Let's Learn", '13-Unit-2-Lets-learn'],
  ['A', '中英', '14', "Unit 2 Song", '14-Unit-2-Song'],
  ['A', '中英', '15', "Unit 2 Say and Paste", '15-Unit-2-Say-and-Paste'],
  ['A', '中英', '16', "Unit 2 Everyday Talk", '16-Unit-2-Everyday-Talk'],
  ['A', '中英', '17', "Unit 2 Chant", '17-Unit-2-Chant'],
  ['A', '中英', '18', "Unit 2 Games", '18-Unit-2-Games'],
  ['A', '中英', '19', "Unit 3 Story", '19-Unit-3-Story'],
  ['A', '中英', '20', "Unit 3 Let's Learn", '20-Unit-3-Lets-learn'],
  ['A', '中英', '21', "Unit 3 Song", '21-Unit-3-Song'],
  ['A', '中英', '22', "Unit 3 Say and Paste", '22-Unit-3-Say-and-paste'],
  ['A', '中英', '23', "Unit 3 Everyday Talk", '23-Unit-3-Everyday-talk'],
  ['A', '中英', '24', "Unit 3 Chant", '24-Unit-3-Chant'],
  ['A', '中英', '25', "Unit 3 Games", '25-Unit-3-Games'],
  ['A', '全英', '26', "Unit 1 Story", '26-Unit-1-Story'],
  ['A', '全英', '27', "Unit 1 Let's Learn", '27-Unit-1-Lets-learn'],
  ['A', '全英', '28', "Unit 1 Go, Say and Paste", '28-Unit-1-Go-say-and-Paste'],
  ['A', '全英', '29', "Unit 1 Everyday Talk", '29-Unit-1-Everyday-talk'],
  ['A', '全英', '30', "Unit 1 Games", '30-Unit-1-Games'],
  ['A', '全英', '31', "Unit 2 Story", '31-Unit-2-Story'],
  ['A', '全英', '32', "Unit 2 Let's Learn", '32-Unit-2-Lets-learn'],
  ['A', '全英', '33', "Unit 2 Say and Paste", '33-Unit-2-Say-and-Paste'],
  ['A', '全英', '34', "Unit 2 Everyday Talk", '34-Unit-2-Everyday-talk'],
  ['A', '全英', '35', "Unit 2 Games", '35-Unit-2-Games'],
  ['A', '全英', '36', "Unit 3 Story", '36-Unit3-Story'],
  ['A', '全英', '37', "Unit 3 Let's Learn", '37-Unit-3-Lets-learn'],
  ['A', '全英', '38', "Unit 3 Say and Paste", '38-Unit-3-Say-and-paste'],
  ['A', '全英', '39', "Unit 3 Everyday Talk", '39-Unit-3-Everyday-talk'],
  ['A', '全英', '40', "Unit 3 Games", '40-Unit-3-Games'],
  ['B', '中英', '01', "Unit 4 Story", '01-Unit-4-Story'],
  ['B', '中英', '02', "Unit 4 Let's Learn", '02-Unit-4-Lets-learn'],
  ['B', '中英', '03', "Unit 4 Song", '03-Unit-4-Song'],
  ['B', '中英', '04', "Unit 4 Say and Paste", '04-Unit-4-Say-and-paste'],
  ['B', '中英', '05', "Unit 4 Everyday Talk", '05-Unit-4-Everyday-talk'],
  ['B', '中英', '06', "Unit 4 Chant", '06-Unit-4-Chant'],
  ['B', '中英', '07', "Unit 4 Games", '07-Unit-4-Games'],
  ['B', '中英', '08', "Unit 5 Story", '08-Unit-5-Story'],
  ['B', '中英', '09', "Unit 5 Let's Learn", '09-Unit-5-Lets-learn'],
  ['B', '中英', '10', "Unit 5 Song", '10-Unit-5-Song'],
  ['B', '中英', '11', "Unit 5 Paste and Say", '11-Unit-5-Paste-and-say'],
  ['B', '中英', '12', "Unit 5 Everyday Talk", '12-Unit-5-Everyday-talk'],
  ['B', '中英', '13', "Unit 5 Chant", '13-Unit-5-Chant'],
  ['B', '中英', '14', "Unit 5 Games", '14-Unit-5-Games'],
  ['B', '中英', '15', "Review", '15-Review'],
  ['B', '中英', '16', "Song- Goodbye", '16-Song-Goodbye'],
  ['B', '中英', '17', "I Can Answer", '17-I-can-answer'],
  ['B', '全英', '18', "Unit 4 Story", '18-Unit-4-Story'],
  ['B', '全英', '19', "Unit 4 Let's Learn", '19-Unit-4-Lets-learn'],
  ['B', '全英', '20', "Unit 4 Say and Paste", '20-Uni-4-Say-and-paste'],
  ['B', '全英', '21', "Unit 4 Everyday Talk", '21-Unit-4-Everyday-talk'],
  ['B', '全英', '22', "Unit 4 Games", '22-Unit-4-Games'],
  ['B', '全英', '23', "Unit 5 Story", '23-Unit-5-Story'],
  ['B', '全英', '24', "Unit 5 Let's Learn", '24-Unit-5-Lets-learn'],
  ['B', '全英', '25', "Unit 5 Paste and Say", '25-Unit-5-Paste-and-say'],
  ['B', '全英', '26', "Unit 5 Everyday Talk", '26-Unit-5-Everyday-talk'],
  ['B', '全英', '27', "Unit 5 Games", '27-Unit-5-Games'],
  ['B', '全英', '28', "Kala- Go Rocket", '28-Kala-Go-Rocket'],
  ['B', '全英', '29', "Kala- Good Morning", '29-Kala-Good-morning'],
  ['B', '全英', '30', "Kala- Ready For School", '30-Kala-Ready-for-school'],
  ['B', '全英', '31', "Kala- I Love You", '31-Kala-I-love-you'],
  ['B', '全英', '32', "Kala- My Pets", '32-Kala-My-Pets'],
  ['B', '全英', '33', "Kala- My Toys", '33-Kala-My-Toys'],
  ['B', '全英', '34', "Kala- Fruit", '34-Kala-Fruit'],
  ['B', '全英', '35', "Kala- Goodbye", '35-Kala-Goodbye'],
  ['B', '全英', '36', "Kala- Unit 1 Chant", '36-Kala-Unit-1-Chant'],
  ['B', '全英', '37', "Kala- Unit 2 Chant", '37-Kala-Unit-2-Chant'],
  ['B', '全英', '38', "Kala- Unit 3 Chant", '38-Kala-Unit-3-Chant'],
  ['B', '全英', '39', "Kala- Unit 4 Chant", '39-Kala-Unit-4-Chant'],
  ['B', '全英', '40', "Kala- Unit 5 Chant", '40-Kala-Unit-5-Chant'],
];
export const ROCKET = ROCKET_RAW.map(([disk, ver, no, title, file], i) => ({ i, disk, ver, no, title, url: `${ROCKET_BASE}${file}.mp3` }));

export const YT_LIST = 'PLSwnJFlaFW6yPJJN0bGFG0fYRLVT_SU9N';
export const YT_COUNT = 47;

// 每個小孩的課程
export const COURSES = {
  xz: { kind: 'audio', name: 'Rocket Book 1', count: ROCKET.length },
  yh: { kind: 'video', name: 'Max & Mousy Book 3', count: YT_COUNT },
};

// 換了播放清單：舊清單的勾選（第幾支）和影片編號都對不上了，清掉重選（影片標題用影片編號記，留著無妨）
export function syncYtList(state) {
  const s = state.settings;
  if (s.enYtList === YT_LIST) return false;
  const changed = !!s.enYtList || !!(s.enYtIds?.length) || !!(s.english?.yh?.length);
  s.enYtList = YT_LIST;
  s.enYtIds = [];
  s.english = { ...(s.english || {}), yh: [] };
  return changed;
}

// 曲目種類 → 小圖示（小孩看不懂字，用圖分辨）
export function trackKind(title) {
  if (/Song|Chant|Kala/i.test(title)) return 'note';
  if (/Story/i.test(title)) return 'book';
  if (/Talk|Who/i.test(title)) return 'talk';
  if (/Game|Paste/i.test(title)) return 'game';
  return 'abc';
}

// ---------- 音樂自動重複（11/22 John）----------
// 曲名是音樂（歌、韻文 chant、Kala 伴唱）→ 播 settings.enRepeat 次（預設 3）再換下一首；不是音樂播一次。
// 判斷錯的，家長頁每一首旁邊可以點來改（settings.enKind[key] = 'music' | 'talk'）。
export const MUSIC_RE = /song|chant|kala|karaoke|\bsing\b|sing-along|rhyme|music|歌|唱|韻文|童謠|律動/i;
export const REPEAT_DEFAULT = 3;
export const repeatTimes = (settings) => Math.max(1, Math.min(5, settings.enRepeat ?? REPEAT_DEFAULT));
// key：mp3 用 a<課程編號>，影片用 v<影片編號>（還不知道編號時沒有 key，只看標題）
export const keyAudio = (i) => `a${i}`;
export const keyVideo = (id) => (id ? `v${id}` : '');
export const autoMusic = (title) => MUSIC_RE.test(title || '');
export function isMusic(settings, key, title) {
  const o = key && settings.enKind?.[key];
  if (o) return o === 'music';
  return autoMusic(title);
}
export const playsFor = (settings, key, title) => (isMusic(settings, key, title) ? repeatTimes(settings) : 1);

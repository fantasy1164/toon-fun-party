# 明星總動員歡樂派對

給妍卉和向澤的 iPad 網頁遊戲：在遊戲中學習生活知識、養成好習慣。
純靜態網頁，部署在 GitHub Pages，進度存在裝置的 localStorage。

## 安裝到 iPad

1. 用 Safari 開啟 GitHub Pages 網址。
2. 分享 → 加入主畫面。
3. 從主畫面的圖示開啟，就是全螢幕。請橫放使用。

## 目前內容

- 選房間：選完頭像後，從小房子裡挑要去的房間
- 場景：廁所（刷牙、洗手、陪刷：點鏡子上的按鈕，角色陪小孩刷自己的牙，6 歲 2 分鐘、3 歲 1 分鐘，可暫停，和遊戲版共用早晚獎品）；客廳大門區（奇奇出門前穿對衣服，依真實天氣，早上有獎品；之後可轉天氣轉盤練習）
- 角色：企鵝嘟嘟、小狐狸奇奇（隨機輪替）
- 三個頭像：妍卉（6 歲版）、向澤（3 歲版）、一起玩
- 日夜依現實時間變化；每次 15 分鐘後角色下班；睡覺時間角色都睡了
- 好寶寶印章：小孩自己挑印章圖案與顏色；家長在家長頁面選今天表現好的原因後，小孩自己蓋章。
  妍卉一張卡 10 格、向澤 5 格，每人每天一個章，不扣章；集滿開派對，家長頁面記錄已發獎品，下一張卡可換印章
- 天氣：Open-Meteo 即時天氣（預設台中，家長頁面可改用目前位置），窗外下雨、打雷、起霧、颳風；角色依天氣提醒；天氣好的白天，角色下班時會邀小孩出去玩
- 聖誕節（12 月）：選房間畫面掛燈飾、聖誕老公公第一次來打招呼；聖誕樹與降臨月曆（每天開一格掛裝飾，錯過可補開）；12/24 晚上擺餅乾牛奶、角色戴睡帽；12/25 拆禮物、聖誕老公公看 12 月印章本，家長頁面可設定是否提醒看床邊真禮物
- 家長頁面：在選人畫面或休息畫面，長按左下角的鎖 3 秒

## 開發

沒有打包步驟，改完直接 commit、push 即可。

    python -m http.server 8000     # 本機預覽 http://localhost:8000

測試日期、時間、天氣也可以在家長頁面的「開發測試」設定（主畫面 app 沒辦法改網址）；那裡也有清除資料：回到今天一開始、回到 30 天前、全部清除。

測試用網址參數：

| 參數 | 作用 |
|---|---|
| `?hour=20.5` | 假裝現在是 20:30（測日夜、領獎時段、睡覺時間） |
| `?session=1` | 每次遊玩時間改成 1 分鐘（測角色下班） |
| `?date=2026-12-24` | 假裝今天是某一天（測聖誕節：12/1、12/24 晚上、12/25） |
| `?weather=rain` | 假裝目前天氣（clear、cloudy、rain、storm、fog、hot、cold、windy） |
| `?notts=1` | 不播放佔位語音 |
| `?debug=1` | 左下角顯示語音事件（查 iOS 不說話的問題） |

## 結構

    index.html, manifest.webmanifest, sw.js
    css/main.css
    js/main.js            進入點與流程
    js/config.js          角色、玩家、領獎時段、預設值
    js/core/              時間、存檔、聲音、語音
    js/data/lines.js      台詞表
    js/art/               SVG 美術（角色、場景、收藏品）
    js/scenes/            場景邏輯
    js/ui/                開場、選人、陳列櫃、家長頁面
    assets/voice/         角色語音檔（還沒有；目前用裝置內建語音當佔位）
    docs/voice-lines.csv  語音台詞清單（node tools/export-lines.mjs 產生）

## 產生角色語音

角色的聲音與說話風格設定在 `tools/voice-config.json`，台詞在 `js/data/lines.js`。

    $env:GEMINI_API_KEY = "你的金鑰"     # PowerShell；金鑰不要寫進任何檔案
    node tools/gen-voice.mjs --dry        # 先看會產生哪些
    node tools/gen-voice.mjs --line hello # 先做一句試聽
    node tools/gen-voice.mjs              # 產生全部還沒有的
    git add -A; git commit -m "角色語音"; git push

- 已存在的檔案會跳過；改了台詞或聲音要重做，加 `--force`（可搭配 `--char dudu` 或 `--line hello`）。
- 有安裝 ffmpeg 會輸出 mp3，沒有則輸出 wav，遊戲都能播。`--convert` 可把現有 wav 轉成 mp3，不呼叫 API。
- 腳本會自動更新 `assets/voice/manifest.json`；沒有語音檔的句子，遊戲會退回裝置內建語音。

新增 js 檔案時，記得加進 `sw.js` 的 `CORE` 清單，並把 `CACHE` 版本號加一。

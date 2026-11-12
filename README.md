# 明星總動員歡樂派對

給妍卉和向澤的 iPad 網頁遊戲：在遊戲中學習生活知識、養成好習慣。
純靜態網頁，部署在 GitHub Pages，進度存在裝置的 localStorage。

## 安裝到 iPad

1. 用 Safari 開啟 GitHub Pages 網址。
2. 分享 → 加入主畫面。
3. 從主畫面的圖示開啟，就是全螢幕。請橫放使用。

## 目前內容

- 場景：廁所（刷牙、洗手）
- 角色：企鵝嘟嘟、小狐狸奇奇（隨機輪替）
- 三個頭像：妍卉（6 歲版）、向澤（3 歲版）、一起玩
- 日夜依現實時間變化；每次 15 分鐘後角色下班；睡覺時間角色都睡了
- 家長頁面：在選人畫面或休息畫面，長按左下角的鎖 3 秒

## 開發

沒有打包步驟，改完直接 commit、push 即可。

    python -m http.server 8000     # 本機預覽 http://localhost:8000

測試用網址參數：

| 參數 | 作用 |
|---|---|
| `?hour=20.5` | 假裝現在是 20:30（測日夜、領獎時段、睡覺時間） |
| `?session=1` | 每次遊玩時間改成 1 分鐘（測角色下班） |
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

## 語音檔

把檔案放到 `docs/voice-lines.csv` 的 `file` 欄位所列的路徑，
再把檔名（不含 `assets/voice/` 與 `.mp3`）加進 `assets/voice/manifest.json` 的 `files` 陣列，
遊戲就會改播真正的語音。

新增 js 檔案時，記得加進 `sw.js` 的 `CORE` 清單，並把 `CACHE` 版本號加一。

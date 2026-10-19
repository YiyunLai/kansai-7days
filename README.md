# 關西七日帖

2027/2/20–2/26 神戶・京都・大阪行程的集印小遊戲。純靜態網頁，放 GitHub Pages 即可。

## 上線

1. GitHub 建一個 Public repository，例如 `kansai-7days`。
2. 把 `index.html`、`config.js`、`.nojekyll` 上傳到根目錄。
3. Settings → Pages → Deploy from a branch → `main` / `/(root)` → Save。
4. 網址會是 `https://yiyunlai.github.io/kansai-7days/`。

## 地圖兩種模式

- **免金鑰（預設）**：Google 地圖嵌入，點哪個景點就顯示哪個；地圖下方是當天景點的照片圓點。
- **有金鑰**：在 `config.js` 填 `googleMapsApiKey`，照片圓點會直接釘在 Google 地圖上，並畫出每天路線。
  - 到 Google Cloud Console 建專案 → 啟用「Maps JavaScript API」→ 建立 API 金鑰。
  - 金鑰限制「HTTP 參照網址」為 `https://yiyunlai.github.io/*`，避免被盜用。
  - 需要綁定帳單，但個人網站的流量通常在免費額度內。

## 照片

景點照片在瀏覽器端從日文維基百科抓條目主圖（Wikimedia Commons），卡片右下角有出處連結。要換成自己的照片，改 `index.html` 裡 `GEO` 的維基條目名稱，或之後再加自訂圖片欄位。

## 修改行程

`index.html` 裡的 `DAYS`（每日行程）、`SPOTS`（景點文字）、`GEO`（座標、Google 搜尋名稱、維基條目）。

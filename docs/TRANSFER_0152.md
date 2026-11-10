# 0.15.2 Vercel傳輸量優化

使用者要求壓縮遊戲，減輕Vercel Fast Data Transfer。此次聚焦實際回傳的圖片位元組、重複網址及瀏覽器快取；保持既有玩法／畫面／原圖／音樂。

## 優化內容

- Vercel建置以sharp 0.35.5將12張PNG轉成無損WebP，原有1張WebP直接保留。13張圖片合計22,195,303→14,948,568 bytes，減32.65%。每次建置都核對尺寸、透明度及所有非全透明像素的RGB，任何可見像素改變立即中止。
- 沒有縮小圖片尺寸、重繪素材、降低音樂碼率；原PNG及MP3保留原byte，GitHub Pages／單檔版繼續使用原圖。
- Vercel頁面先注入圖片網址對照，所有img／CSS sprite／記錄卡／貼圖hint共用同一WebP URL，避免同圖多網址。CSS只在Vercel輸出改寫，遊戲source邏輯保持。
- 圖片及音樂網址加內容SHA256前16字元，圖片改動會自動換版本；WebP／版本化音樂／固定版本圖示及分享圖設一年immutable瀏覽器快取。HTML、JS、CSS及manifest仍重新驗證，避免程式更新被舊快取鎖住。
- 舊 `/play/public/art/*.png` 及更早 `/play/art/*.png` 靜態重寫至新WebP，保護仍開著舊頁面的玩家；不新增API／Function／付費Image Optimization。
- 只發布32個遊戲runtime、13圖、音樂、實用6圖示、原分享圖、Analytics與入口，共57檔；移除未引用原始大圖示／metadata及舊重複目錄。部署包39,992,466→21,077,970 bytes，減47.30%；其中未引用檔案原本不一定被下載，所以另行量度玩家實際路線。
- Vercel文字原本已Brotli，未使用ZIP替代網站、不重複加gzip副本。sharp只是建置用devDependency，鎖定npm lock、npm ci --include=dev，不送原生工具到瀏覽器。

## 實測

本地HTTP Chromium，同一932×430觸控profile、相同首頁／大廳／五桌及大小／輪盤／百家樂牌面情境，音樂關閉，測試額外入口僅在私有副本使用，沒有加入正式程式。

| 指標 | 原版 | 優化後 | 減少 |
| --- | ---: | ---: | ---: |
| 冷首頁傳輸（含本機HTTP標頭） | 5,192,208 B | 3,995,476 B | 23.05% |
| 同一路線傳輸（不計音樂） | 17,127,367 B | 11,582,656 B | 32.37% |
| 路線圖片傳輸 | 16,597,404 B | 11,050,930 B | 33.42% |
| 再次進首頁的圖片傳輸 | 468 B／3次驗證 | 0 B／0次網路驗證 | 快取命中 |

若兩邊都加完整原音樂3,312,369 B，路線估計20,439,736→14,895,025 B，減27.13%。這是推算，不是把音樂播放器完整下載量實測，也不是Vercel帳單保證。

本機文字未模擬Vercel Brotli／TLS開銷；實際Fast Data Transfer受訪客數、路線、瀏覽器快取／清理及社交機器人影響。Vercel CDN HIT仍會對訪客送出內容，不能把HIT當作零傳輸；本次靠減少內容位元組與瀏覽器直接快取減輕用量。

## 品質及功能驗證

447項通過（421單元組件、7單檔、11 Pages、8 Vercel）。Vercel測試涵蓋原輸出隔離、SDK、網址對照、SHA版本、源檔不改、舊路徑及HTML／JS不被immutable鎖住。

每次建置核對13圖的解碼可見像素與尺寸完全相同；Chrome實際PNG/WebP取樣會有最多1/255 RGB階的繪製四捨五入差異，並非縮圖或有損編碼。10對場景截圖已比較，大小結果區的動態「已結算」文字排除時間差後其餘最大差異亦為1。首頁、大廳、五款遊戲、牌面／籌碼、手動確認派彩正常，零pageerror。原證據在本機docs/qa/0152/network.json及summary.json、PNG，未發送假排行或Analytics事件。

## 發布及未驗

部署、公網MIME／Cache-Control／舊PNG重寫及URL hash核對結果以TRANSFER_RELEASE.json為準，完成才標published。

WebP需要現代瀏覽器（Safari14+；現有leaderboard亦已使用WebP）；真iPhone16Plus／iPad／Android、長時間快取／磁碟清理及實際Vercel帳單變化未驗。公開瀏覽器互動受既有測試環境CA限制，不停用TLS。回退父main0f1fa5d6628156e5b8f9807f8e3a9178933de951可恢復原Vercel素材，保留存檔／D1。

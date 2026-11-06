# Vercel部署指南

目標：在使用者自己的Vercel帳戶發布五分鐘賭神，原GitHub Pages及Cloudflare Workers＋D1保持。資料庫不用搬遷，遊玩流程仍全本機，不新增付費資源。

## 專案設定

- GitHub：jacobmaster-97/charity-casino，main。
- Framework Preset：Other（vercel.json中framework:null）。
- Root Directory：專案根目錄。
- Build Command：npm run build:vercel。
- Output Directory：dist/vercel。
- 不需要任何前端管理Token／D1或Cloudflare金鑰。

vercel.json已指定建置及輸出；scripts/vercel.mjs重建原Pages靜態資產後，只把play/src及play/public、入口HTML及manifest放進輸出。Cloudflare程式／設定、Word、交接、測試、預覽及憑證不會被當成網站內容發布。沒有新增Serverless Functions、Cron或另一個資料庫。

## 公開網址及分享圖

建置時按SITE_URL、VERCEL_PROJECT_PRODUCTION_URL、VERCEL_URL順序取得網址；SITE_URL可省略，前提是Vercel提供系統環境變數。SITE_URL只接受實際HTTPS origin，不接受路徑／帳密／query／hash；不預先猜測專案域名。

Vercel輸出的canonical／OG網址和分享圖地址使用新站域名，分享圖位於play/public/social/thumbnail-v4.png。原GitHub入口、metadata和A圖示保持；新站manifest的scope、start_url維持./，加入手機主畫面後仍在該新站開啟。

## 排行榜必須完成的接線

前端繼續呼叫 https://five-minute-god-leaderboard.jameshh998.workers.dev 。目前Worker只允許https://jacobmaster-97.github.io；Vercel前端若未加入允許清單，讀取及上傳會被擋。取得**實際正式網址**後，把其origin追加到原Worker的ALLOWED_ORIGINS（逗號分隔），保留GitHub。只改這個公開變數，不重建D1／改表／清成績，不使用*.vercel.app或允許所有網站。Preview域名不自動放行。

若仍有可用Cloudflare授權，可從現有私有Wrangler設定更新變數並部署同一Worker；否則在原Worker Settings → Variables and Secrets更新ALLOWED_ORIGINS後部署。不可把OAuth檔或Token貼到此文件／HTML／GitHub。新origin的OPTIONS、GET、CORS、手動上傳與重試須另行核對後才能宣稱排行榜完成。

## 本機存檔及帳戶

瀏覽器儲存按網站origin隔離，新Vercel網址不會自動讀到GitHub Pages的本機存檔；舊站資料保持。需要轉移可用原站大廳更多的存檔匯出，以及新站對應存檔匯入，保留完成局與餘秒，不以新挑戰資金覆寫舊檔。排行榜仍共用原D1。

本工作區Vercel CLI的登入憑證放在專案外受限目錄；.vercel/已忽略，絕不發布管理Token。先用官方裝置登入授權，再建立／連接個人帳戶的專案，不自動選擇付費團隊或升級方案。若無CLI授權，也可在Vercel Dashboard以Add New → Project匯入原GitHub倉庫，套用上述設定，再提供公開網址完成CORS。

## 驗證

本機401項通過＝381單元組件＋6單檔＋10 Pages＋4 Vercel建置／輸出檢查。新增測試涵蓋真實網址來源選擇與拒絕無效網址、隔離輸出／不含開發資料、素材逐byte、manifest／圖片路徑／分享metadata及原GitHub入口不變。建置測試中的game-deployment.example是明示測試值，不是正式部署網址。

實際部署、Vercel網址、Worker CORS變更及公網驗證結果另外記錄於VERCEL_RELEASE.json；沒有部署就保持pending，不把本機建置當公網通過。真Safari／手機分享卡片及跨網址存檔轉移仍需要實機驗證。

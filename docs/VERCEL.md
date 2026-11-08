# Vercel部署與更新

正式遊戲：https://5mins-gamber.vercel.app/

原GitHub Pages保留：https://jacobmaster-97.github.io/charity-casino/

## 現況（2026-11-08）

- 遊戲0.15.0，包含Brass Command背景音樂及手機／平板橫向。
- 專案最終名稱依使用者更正為 `5mins-gamber`。
- Vercel範圍 `jerseyprice`（使用者帳戶的Hobby免費團隊），Project ID `prj_RtqkZuZlAHpunRfqecoMw8elmSn2`。
- GitHub `jacobmaster-97/charity-casino` 已連接，Production Branch為 `main`。
- 正式網域已加到專案、verified，跟隨production部署，不是一次性的deployment alias。
- 初次命名後更正前產生的 `5mins-gambers.vercel.app` 已設308轉址至最終網址。
- 沒有升級付費方案、增加資料庫、Functions、Cron或付費建置機；Web Analytics依使用者後續要求啟用基本功能。

初次CLI部署 `dpl_4JscrnfGwpjjkSz4gnKMDP2FcVBJ` 已READY；已再以實際main commit `e691a84cb8abafe5f7d5795d96e3511f7fc6e58b` 驗證GitHub自動部署，產生production部署 `dpl_HC5kcSjSpG3astU91nkbesxwRMzf` READY，正式網域已切換，gitSource SHA／main分支均吻合。原Pages run42494257917亦completed/success。完整收據以 `VERCEL_RELEASE.json` 為準。

## 固定設定

| 項目 | 值 |
| --- | --- |
| Framework Preset | Other（framework:null） |
| Root Directory | 專案根目錄 |
| Node.js | 24.x |
| Build Command | npm run build:vercel |
| Output Directory | dist/vercel |
| Production公開變數 | SITE_URL=https://5mins-gamber.vercel.app |

`SITE_URL` 是公開網址，不是管理金鑰。建置也支援Vercel系統環境變數，但這個正式專案明確固定正確網址，避免更名前的域名出現在canonical及分享圖。Preview網址不自動加入排行榜允許清單。

`vercel.json`、`.vercelignore`及`scripts/vercel.mjs`已在原倉庫。建置只輸出遊戲入口、manifest與play/src、play/public及Web Analytics SDK／License共66檔；不發布後端設定、交接、測試、預覽或登入憑證。單檔離線包仍是另一個產物，不拿來當Vercel網站入口。

## 日後更新

1. 在原專案修改，完成對應測試。
2. 更新原GitHub倉庫的main；Vercel已連接這個分支。
3. 在Vercel專案的Deployments查看該commit是否READY，確認production網域指向它。
4. 核對新站的版本、圖資／音樂及龍虎榜；GitHub Pages仍可使用。

有CLI登入時，也可在已連接的本機執行 `vercel deploy --prod --project 5mins-gamber --scope jerseyprice`。本工作區的登入憑證只在專案外私有目錄；`.vercel/`僅作本機連接且已忽略。CLI曾生成的`.env.local` OIDC檔已移除，靜態遊戲不需要它。不要將Token、密碼或OAuth檔放入HTML／公開倉庫。

## 龍虎榜

仍使用原Worker `https://five-minute-god-leaderboard.jameshh998.workers.dev` 及原D1 `five-minute-god-scores`，DB ID `351a13a7-94af-4667-b7b9-c4394c61dbb0`。

Worker公開變數 `ALLOWED_ORIGINS` 現在是：

```text
https://jacobmaster-97.github.io,https://5mins-gamber.vercel.app
```

沒有 `*.vercel.app`，不放行未知Preview站。Worker源碼SHA仍為 `a26286382cca6982605153c7b62c3aac90f7b0752c5b0269bf3d13b284777436`，此次只有允許網址改變；部署版本 `9d82e4fc-7768-4ef7-9abf-a754bbaf41a3`。D1結構及成績未遷移、沒有建立測試成績。

兩個正式origin的OPTIONS204與GET200均帶正確Allow-Origin，錯誤資料POST400也帶新站CORS；未知origin403。正式合法成績新增／重試以既有單元測試覆蓋，本次沒有為測試而向公開榜單塞入假成績。玩家完場後可實際按上傳驗收。

Cloudflare授權以官方device流程完成；首次最小scope欠Worker scripts權限被拒，補Workers scripts/routes後成功，沒有申請D1管理scope。這是API權限不足的修正，不是資料庫重建。新環境沒有憑證時，需重新官方授權，不能沿用已過期的裝置碼。

## 存檔轉移

本機存檔按網站origin隔離，新Vercel網址不會自動讀到GitHub Pages進度。原站資料保持；需要轉移可在原站「設定→存檔與資料→匯出備份」，到新站同頁「匯入備份」並確認。只轉移完成局與原餘秒，不能把未結算局變成存檔。

## 驗證與限制

- 本階段29項：8 Worker、6排行榜客戶端、4 Vercel建置、11 Pages，全部通過；之前0.15.0完整438項紀錄仍保留，不把重複測試另算新增。
- Vercel全部64個公開檔案HTTP200且SHA逐byte吻合，入口是遊戲而非登入頁；canonical及分享圖是正確正式網址。
- MP3支援Range206／100 bytes；私有.env.local、.vercel/project.json、cloudflare/wrangler.jsonc及交接文件網址404。
- CORS六項公網驗證通過，使用一般瀏覽器相容User-Agent；預設Python UA曾被Cloudflare邊緣1010阻擋，未改弱邊緣安全設定。
- 公網Chromium實際嘗試導覽，因本環境CA信任 `ERR_CERT_AUTHORITY_INVALID` 被阻，未停用TLS。HTTP使用正常CA信任通過；不宣稱公開站互動端到端通過。之前本地Chromium音樂／轉向實測仍有效。
- 真iPhone／iPad Safari、Android、社交平台卡片快取及實際跨網站備份轉移未驗；需要玩家實機確認。

## 回退

Vercel可將production回到已驗證的部署；不刪專案／資料庫。Worker可回先前 `82eb5c1f-d3b3-421f-8bbf-1e1647e31023`，但會失去Vercel跨域允許，GitHub origin保持。更安全的CORS回退是保留同一Worker及D1，只移除新增Vercel origin；任何回退都保留玩家資料。

最終收據／交接在本機補上實際部署結果；dist/github-upload及manifest保持322檔精確已上傳快照，不以補收據再重建覆蓋。

## Web Analytics

使用者指定安裝@vercel/analytics，2.0.1已接官方inject()，僅正式Vercel origin初始化，沒有遊戲自訂事件。見[ANALYTICS.md](ANALYTICS.md)及ANALYTICS_RELEASE.json；本次由64變66輸出檔。

# Vercel Web Analytics

依使用者要求安裝 `npm i @vercel/analytics`，目前npm鎖定2.0.1，MIT授權，來源為官方npm套件及其README。沒有新增React或另一套打包框架。

## 接入

- Vercel `5mins-gamber` 專案已啟用基本Web Analytics，保留Hobby，沒有升級Plus／付費方案。
- 純JavaScript專案使用官方 `inject({mode:'production'})`。`scripts/vercel.mjs`將已安裝的瀏覽器SDK組成獨立analytics.mjs，保留套件程式及MIT License。
- 只有Vercel輸出加入 `type=module async` script；不等待SDK或統計請求才開始遊戲。官方SDK再載入同站 `/_vercel/insights/script.js`。
- 初始化限於建置的正式origin，現在是https://5mins-gamber.vercel.app。原GitHub Pages、localhost、file單檔不接統計；未將SDK放進遊戲模組或動畫／倒數迴圈。
- 只使用標準瀏覽統計，沒有呼叫track或加入姓名、賭本、下注、牌局、派彩及暫停等自訂事件／屬性。Cloudflare排行榜API、D1及存檔保持。
- SDK網絡失敗或廣告攔截不影響遊戲。正式網址變更時，須同步更新Vercel production SITE_URL，避免統計初始化origin不符。

## 建置與驗證

package.json及package-lock.json均納入原倉庫；不發布node_modules。Vercel輸出由64變66檔，新增analytics.mjs及analytics-LICENSE.txt；遊戲runtime仍32檔且原byte不改。

6項Vercel檢查通過，涵蓋原輸出隔離／metadata、SDK與官方來源一致、非正式origin不初始化、重複載入只加一次script、錯誤回調不中止及依賴鎖定。prepare另驗11項Pages，不把反覆測試當成新增項目。GitHub自動部署、公網SDK及正式script端點結果另記ANALYTICS_RELEASE.json。

查看數字：登入Vercel → 5mins-gamber → Analytics。統計需有真實訪客後才出現，可能延遲或被瀏覽器攔截；本次不手動製造假瀏覽事件，也不宣稱報表數字已實測。真手機、公開站瀏覽器互動及Analytics報表入帳待確認；既有環境的Chromium公開TLS信任限制維持，不關閉TLS驗證。

## 停用

在Vercel專案關閉Web Analytics，並移除Vercel建置的SDK注入即可；不需要清存檔或更動排行榜。回退前一部署亦可保留全部遊戲資料。

## 已發布收據

main commit94da3cc63ad4b679ad665ef6ce23f2461d36281c，325檔Git tree SHA全符、12變更，遊戲runtime／圖／MP3／Worker不改。Vercel自動production部署dpl_3d8nd8LyPD8NyFpR6uc5vDgofV6W READY，gitSource.main及SHA吻合；Pages run42495630071 completed/success。66個公開檔案HTTP200及SHA全符、HTML確有async SDK，/_vercel/insights/script.js為HTTP200 JavaScript（4522 bytes）。這是接入與載入證據，不是報表入帳證據。最後收據／交接只補本機，dist/github-upload保持精確已上傳快照。

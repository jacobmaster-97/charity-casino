# GitHub上載與Pages發布

## 本輪狀態

使用者要求將遊戲上載GitHub以便即時存取。已連接帳號`jacobmaster-97`，使用者已指定專用倉庫 https://github.com/jacobmaster-97/charity-casino 。已上載至main，保留原有初始提交。內容提交：`5f9b8e08d42ed3cb45e4a68ff09557f4359750da`；76檔遠端blob SHA全部吻合，收據見GITHUB_UPLOAD.json。

目前GitHub連接器支援既有倉庫的檔案／Git物件寫入，沒有建立倉庫或啟用Pages的工具。CLI認證檢查不成功，不讀取或索取權杖。目標專用倉庫已確認可存取，不需要重新建立。

## 已備妥的發布結構

- `docs/index.html`：GitHub Pages入口。
- `docs/play/src/`：五個runtime檔，沒有開發伺服器。
- `docs/play/art/`：五張實際PNG。
- `docs/.nojekyll`：直接提供靜態檔。

使用`npm run build:pages`更新上述發布檔，`npm run verify:pages`驗證。支援帳號首頁或`https://帳號.github.io/倉庫名稱/`子路徑；CSS採相對網址，程式依module網址解析圖片。

檔案分開提供，瀏覽器可重用圖片快取，後續更新程式時不必每次重新下載包含所有圖片的12MB HTML。原有單檔下載版仍可用，保存schema及槽位名稱不變。

## 目標倉庫

原始碼：https://github.com/jacobmaster-97/charity-casino

預期Pages網址（完成下方設定後）：https://jacobmaster-97.github.io/charity-casino/

不需要提供權杖；透過已連接GitHub工具上載。

## 啟用網頁存取

上載完成後，到目標倉庫：Settings → Pages → Build and deployment → Source選Deploy from a branch → Branch選main → Folder選/docs → Save。

這是帳號／倉庫設定步驟，當前工具不能代按。發布完成後，以GitHub Pages顯示的實際網址為準；尚未上載或啟用前不宣稱網址可用。

後續每次修改來源，先執行`npm run verify`與`npm run verify:pages`，再將來源與更新後docs發布檔一起提交至main，Pages會依設定重新發布。GitHub部署需要處理時間，不承諾零延遲。

## 存檔及回復

- 存檔仍在訪客瀏覽器，不會因上載GitHub而自動變成雲端存檔。
- 本地HTML與github.io是不同儲存來源；請先在本地版匯出最後完成局，再到同模式網頁版匯入。
- 保持發布網址不變有助於維持同來源的存檔。切換網域、瀏覽器、裝置或清除網站資料仍需匯出／匯入。
- 可透過Git提交恢復先前版本；僅需停站時在Settings → Pages取消發布，不改玩家本機資料。

## 檢查

16項規則／保存、3項單檔封裝、3項Pages路徑／圖片校驗通過。瀏覽器與手機實測缺口仍見DEBUG_HANDOFF.md；此輪沒有繞過環境限制重試Chromium。

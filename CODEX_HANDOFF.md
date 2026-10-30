# CODEX_HANDOFF

## Project Goal

《賭王慈善大賽》網頁遊戲。首版$100，總資金$25,000,000勝利、歸零失敗，挑戰最快遊玩時間；電腦滑鼠、手機觸控。美術已選B港式賭片卡通。

## Current Phase

原型候選0.1。使用者已授權按建議同步製作原型與貼圖，先完成B大廳＋大小切片。其他四款保留開發中入口；正式版五款全開範圍維持。程式與PNG已交付，但瀏覽器受環境限制未能啟動，不能宣稱runtime或裝置驗收通過。

## Latest Completed Work

- 最新問題：使用者手機／平板Safari大廳破圖。已由Pages build40895801619的job123524463752確認現況source:.（根目錄），而app／CSS原圖網址是../art，實際在public/art。已修正為../public/art，docs同步為docs/play/public/art，根目錄.nojekyll與入口?v=0.1.1。新增實際解析回歸先失敗後通過，共24測試。尚待同步本次修正與Pages重新部署。


- 已上載至使用者指定公開倉庫 https://github.com/jacobmaster-97/charity-casino 的main分支。內容提交5f9b8e08d42ed3cb45e4a68ff09557f4359750da，parent保留d5653661b6ca31922da11c364ec804349b7b5d5b。76檔遠端blob SHA全部與本地一致，main指向亦已回讀確認；無強推。Pages已由使用者啟用，實際從main根目錄發布，原部署成功；目前修正圖片路徑。收據docs/GITHUB_UPLOAD.json。
- 已新增Pages建置與可上載目錄：docs/index.html、docs/play/、docs/.nojekyll；修正CSS與圖片在專案子路徑的解析。npm run verify與verify:pages通過，共22項。新增.gitignore、GitHub操作文件、prepare-github腳本；原本單檔仍可重新打包。

- 建立無第三方執行依賴的原生HTML／CSS／JS原型：姓名／模式、故事卡、大廳、大小50種多項投注、30秒、骰子結果、保本／透視／重擲、10%商店、暫停遮桌、結算及勝敗。
- 完成局保存、自由模式手動槽、競速／自由分槽、匯出／匯入、壞檔驗證與舊原始存檔備份。只保存完成局；購物跟下次完成局一起記錄。
- 新增四張實際PNG：桌面1672×941、六骰面atlas1024×1536、道具／籌碼atlas1254×1254、骰盅1254×1254。原圖完整複製，來源與SHA-256記錄。
- B大廳lobby-populated-v4.png不變，A／C及舊版保留。新原型不加入上樓玩法或把樓梯當商店。
- scripts/package.mjs產生dist/charity-casino-prototype.html，程式與五張PNG內嵌，可下載後以桌面瀏覽器開啟；另可Node22+執行npm start。無發布／帳號／後端／支付。

## Important Files

- docs/GAME_BRIEF.md及五款遊戲詳規：已確認玩法，勿把原型預設當新增確認。
- docs/PROTOTYPE.md：範圍、所有權、保存／取整預設、驗收證據。
- docs/PROTOTYPE_ART.md、public/art/prototype-b/assets.json：新素材來源與取格。
- docs/ASSET_MANIFEST.md、ART_DIRECTION.md、ART_QA.md：全素材盤點及舊版接觸修正。
- src/rules.mjs、game.mjs、storage.mjs、app.mjs、styles.css、server.mjs：規則、狀態、儲存、介面、預覽。
- tests/game.test.mjs、package.test.mjs：可執行邏輯與封裝驗證。
- tests/browser_smoke.py：瀏覽器腳本，尚未成功執行。
- DEBUG_HANDOFF.md：環境限制，勿反覆嘗試相同socket路線。

## Do Not Lose These Decisions

- 大小全部常見投注，三骰、圍骰大小皆輸、其他注仍按條件派彩。最少$1，不足$1可全押。
- 無免費道具，每件購買前資金10%，每局一件。大小持重擲券且未用其他道具時，開骰後10秒重擲／接受／超時均扣券。
- 百家樂換牌與輪盤重轉須鎖注前啟用，不得套用大小持券分支。
- 保存僅完成局，關閉回最後完成存檔，允許重試未完成局，不宣稱競速防反悔。分頁存活的暫停保留原手／已用道具／剩餘秒數。
- 德州6人無限注、自適應盲注、全資金入座、電腦初資金20%–120%；21點S17、3:2、四手分牌；百家樂八副傳統佣金；輪盤美式38格與已選獨立投注。詳規未因本輪原型更動。
- 首版無帳號或雲端。開場故事卡，不自加達標捐款結尾。後期$20困難／真實賭場／電影模式仍後期。

## Verification

- GitHub內容提交5f9b8e08d42ed3cb45e4a68ff09557f4359750da：76檔SHA與main指向已回讀確認，頁面設定has_pages=false；程式、單檔及Pages測試合計22項通過。

- 規則／存檔16項通過，包括216種結果×50投注、圍骰、保本、三種扣券、資金守恆、暫停12秒、完成快照、壞檔及儲存錯誤。
- 封裝3項通過：無外部依賴、內嵌JS可解析、五張PNG內嵌雜湊等於來源。四張新PNG可解碼及目視骰點1–6。
- 最終npm run verify已執行通過：六模組語法、16項規則／保存、重建HTML、3項封裝。
- HTTP監聽EPERM；Chromium先Crashpad setsockopt遭拒，停用後另一IPC shutdown遭拒。未成功載入頁面，無截圖／瀏覽器／觸控／手機／實機驗證。UI審查見docs/UI_AUDIT.md，不虛構分數。

## Known Risks / Untested Areas

- P0：須在可啟動Chromium環境實跑主要循環及檔案匯入／匯出；本地HTML的儲存權限與手機開啟方式依平台而異。
- 原型預設：整數美分、價格四捨五入且至少1分、保本向下取整；$0.01購物可歸零。第一局前無初始存檔，購物下一完成局才保存。這些待後續確認，不能默認永久規格。
- 跨五桌道具共用存量／容量、其他四桌、手機方向、故事正式文案、難度／盲注級距、排行榜與平衡仍待辦。
- atlas票券採CSS略寬取格，需瀏覽器目視邊緣；無人物動畫、音效或其他四桌貼圖。

## Next Safest Task

將0.1.1路徑修正以原main b4489503cc3bcbbef1feaa06490b75de44c890f0為parent同步至jacobmaster-97/charity-casino，保留既有檔案及舊圖位置，不強推。核對新commit／tree，再等Pages部署成功。向使用者提供 https://jacobmaster-97.github.io/charity-casino/?v=0.1.1 重開測試。存檔key／schema不改，不要求清空Safari資料；iOS實機結果仍待確認。

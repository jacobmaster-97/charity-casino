# CODEX_HANDOFF

## Project Goal

《賭王慈善大賽》網頁遊戲。首版$100，總資金$25,000,000勝利、歸零失敗，挑戰最快遊玩時間；電腦滑鼠、手機觸控。美術已選B港式賭片卡通。

## Current Phase

原型0.1.4介面修正／發布驗證中；線上目前0.1.3。使用者已實玩大小，仍缺自動瀏覽器／手機驗證。使用者已授權按建議同步製作原型與貼圖，先完成B大廳＋大小切片。其他四款保留開發中入口；正式版五款全開範圍維持。程式與PNG已交付，但瀏覽器受環境限制未能啟動，不能宣稱runtime或裝置驗收通過。

## Latest Completed Work

- 最新使用者圖片要求：上骰盅、下完整盤面；移除右欄，把原投注功能放在枱面下方；五款籌碼不同色。完成0.1.4上下布局與底部摘要／五色籌碼／自訂／全押／開骰／清除／明細移除／道具／精準選格。原截盤原因為右側320px欄＋最小1560px盤寬，改全寬適配，放大才啟用移動。新五色atlas原PNG完整複製，飛行及混色堆疊同映射；已通過40項＋九檔語法，非瀏覽器目視見docs/SIC_BO_LAYOUT_014.md。尚未部署0.1.4。

- 使用者最新確認：其餘四款製作時同樣具備大小0.1.3的枱面融合、實際貼圖、籌碼飛入／堆疊／累計、大額快捷操作、電腦／手機／平板與暫停同步。已新建docs/TABLE_PRESENTATION.md並連結總綱與四款詳規，按百家樂單項、德州主／邊池、21點分牌／保險、輪盤多項作規則適配。此次僅本地規格更新，無runtime或GitHub改動；其餘四桌仍未實裝。

- 0.1.3完成發布：main 67578f2f70a84f5993edcc22068ae797e3b22af5，parent保留0.1.2；31變更檔／96發布檔Git blob SHA全部吻合，Pages run40992506875 completed/success。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.1.3 。收據docs/SIC_BO_BOARD_RELEASE.json為發布後本地紀錄，未為記帳再觸發部署。以下「發布進行中／待確認」均為歷史。

- 使用者已確認v2效果並授權實裝。完成透明枱布印刷盤面＋50投注、立體籌碼0.42秒飛入／0.18秒輕彈／5px堆疊，接Game.addBet；動畫隔離資金與存檔、暫停遮桌／停動畫、取消清理、減少動態。新三張原PNG完整複製，入口／所有模組版本0.1.3；根目錄與/docs圖像路徑保留。36項檢查及九檔語法通過；實際SVG層Inkscape目視，非瀏覽器截圖。發布尚在進行，未宣稱已上線。詳見docs/SIC_BO_BOARD.md。

- 最新回覆：使用者要求盤面融入枱面，並明確接受v1投注動畫及節奏。已完成docs/previews/sicbo-board-v2：移除盤面色板，改透明金線／字樣／平面金色骰符直接印在連續枱布內；內收邊界100點確認在綠色枱布內。籌碼立體圖不變，0.42秒飛入＋0.18秒輕彈與5.4秒示範節奏保持，落點配合新位置。50格與賠率無變、區域不重疊，PNG與影片尾格已目視。新枱面外觀仍待確認，不重新要求動畫確認。


- 最新指示：參照使用者上載大小盤面排列，沿用B翠綠／酒紅／金色，加入籌碼飛入投注格動畫；使用者明確要求先預覽、確認後才實裝。本輪已完成docs/previews/sicbo-board-v1/的1600×1000 PNG、5.4秒20fps GIF／MP4及獨立HTML。50格ID／賠率與既有BETS一致、點選區無重疊；100＋500同格累計600。PNG與影片尾格已目視，腳本語法／影片解碼通過。瀏覽器與手機仍未驗證。
- 僅新建候選素材與獨立預覽，33個遊戲來源／發布／素材檔SHA與上次已發布版本一致；沒有GitHub寫入、沒有更改線上0.1.2。候選素材image_gen來源見預覽assets.json，UI文字／賠率／籌碼動畫另為SVG與JS層，不把整張圖當實裝。


- 最新要求：資金增長時提供更大碼值籌碼。0.1.2已改為每局按bankAtStart選五種面額，最高一千萬元；局內不跳動、原選值不自動加碼、自訂與全押保留，窄畫面換行。新增六項規則測試及一項依賴模組快取測試；瀏覽器路徑已補但未執行。最終31項測試已通過，已同步main f6c1762ef06d8dfee7d6a1572ff8aee32c64bb58，85檔遠端SHA核對通過，Pages run40985578413已completed/success。詳見docs/CHIP_DENOMINATIONS.md。


- 最新問題：使用者手機／平板Safari大廳破圖。已由Pages build40895801619的job123524463752確認現況source:.（根目錄），而app／CSS原圖網址是../art，實際在public/art。已修正為../public/art，docs同步為docs/play/public/art，根目錄.nojekyll與入口?v=0.1.1。新增實際解析回歸先失敗後通過，共24測試。已同步main提交dc91dfc61e9aa89699551d178f89dcd2b37645e5，84檔遠端SHA已核對，Pages run40979205888已completed/success，修正版已部署。


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

核對0.1.4候選實際素材取格，完成GitHub main增量同步與Pages狀態回讀後提供?v=0.1.4。使用者已授權本次圖片布局調整，不重問視覺確認。手機預設完整總覽，細格可放大或用精準選格；待平板Safari／手機實測，勿假報瀏覽器驗證。保留schema1、局完成保存、暫停及大額碼值。其餘四桌仍待實作，須沿用docs/TABLE_PRESENTATION.md共同要求。

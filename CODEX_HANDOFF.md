# CODEX_HANDOFF

## 0.13.1 · 已批准龍虎榜介面，完成實裝與測試，準備發布

使用者最新「實裝」已確認leaderboard-v1並取代先預覽限制，沿既有GitHub Pages遊戲流程發布。深玉綠／切角金框／龍虎紋，左側真實三甲、右側第四名起榜單，刷新／上一頁／下一頁及空榜／錯誤／離線提示接現有Client。三甲只隨成功第一頁刷新，翻頁保留，失敗保留原快照；沒有示例補位或新增資料欄位。每頁20、同名各一筆與同次重試去重保持。

排行榜用實際viewport／safe-area及內容局部捲動，44px控制、長名稱換行、超長金額保留全值可橫向閱讀；重繪保留焦點與捲動，新頁才重設。正式圖資為已批准原圖的1200×400 WebP（98,012 bytes），不等待load/decode、不新增首頁全圖預載。原12張遊戲PNG及44份舊PNG／ICO副本不變。保留0.13.0 legacy視圖匯出，避免部分舊快取破壞app匯入。

396項通過＝381單元／組件＋6單檔＋9 Pages，含原500五分鐘／10,000局模擬。CSS以esbuild Safari16／Chrome110目標解析無警告；browser_smoke.py僅Python編譯，未執行真瀏覽器。Worker／migration／公開API設定3檔逐byte不變，13核心engine模組僅快取版本更新；未重部署Cloudflare或寫入D1。商店／道具仍關閉，計時、派彩、資金及存檔規則不改。

發布前檢查及回退見docs/LEADERBOARD_UI_0131.md、LEADERBOARD_UI_VALIDATION.json、LEADERBOARD_UI_RELEASE.json。Safari／Chrome真機觸控、局部捲動、VoiceOver、安全區與各尺寸實際排版仍UNVERIFIED；不得把Node／CSS解析當成畫面驗證。下一步核對main／Pages及公網逐檔SHA，再請使用者於iPhone16Plus開榜驗收；不清資料、不重建D1、不開付費。

## 最新 · 龍虎榜介面v1只做預覽，等待使用者確認

使用者要求「設計龍虎榜的介面，需符合風格，先讓我確認」，覆蓋舊發布授權對本次新設計的適用；正式0.13.0及Cloudflare不變。已按gamestudio UI審閱流程建立docs/previews/leaderboard-v1：深玉綠／切角金框／酒紅榜首銘牌／image_gen原創金箔龍虎紋，左側前三名、右側第四名起榜單，返回／刷新／上下頁；沒有角色頭像。

4橫向尺寸（956×440、667×375、1194×834、1440×900）×示例榜單／空榜／讀取失敗，共12SVG及12個2x PNG；index.html只切換本地PNG，所有數字明示示例，不fetch API或觸碰Game／保存。手機主要資料≥16px、操作≥44px；右側獨立捲動只是本輪靜態構圖意圖，未冒稱實裝觸控或Safari畫面。source image_gen原圖保留，來源／提示詞／SHA在art-source.json。

12組XML／PNG尺寸／幾何、HTML腳本語法、4組主要平面文字對比4.85～10.95通過；407個正式source／素材／API設定／Pages及已發布快照SHA不變。未重跑／引用385項作本輪測試；未啟用HTTP／Chromium IPC、沒有API請求／雲端或GitHub寫入。第一次內嵌裝飾圖造成SVG>10MB靜態parser限制，已將圖資改共用defs去重，12組成功渲染，不涉及production修復。

待確認後才可接正式DOM／CSS／API。需注意：三甲保留首個快照，翻頁不能把21–23名顯示成三甲；缺成績不可用示例補。每頁20／每次一筆規則不變，不新增日期篩選、帳號或本人最佳等未保存資料。真機安全區、VoiceOver／焦點、局部捲動、超長金額原值展示及輕量圖資輸出待實裝驗證。README／validation.json列出完整邊界。下一最安全任務：讓使用者看phone-populated.png及desktop／empty預覽後收修訂或確認；不自動實裝／升版／發布，不改Cloudflare。

## 0.13.0 · Cloudflare排行榜與原GitHub Pages發布完成

使用者授權代操作及device OAuth後完成：原D1建表／索引及0001遷移tracker，Worker API https://five-minute-god-leaderboard.jameshh998.workers.dev，正式版本82eb5c1f-d3b3-421f-8bbf-1e1647e31023。先前Mac空白遷移錯誤未重現，原SQL無修改，沒有重建D1；不杜撰根因。公開結果只存名稱／精確金額及必要ID／衍生欄位；遊戲流程全本機，不收集牌局／下注／暫停／派彩。沒有啟用付費方案，管理OAuth保留受限/tmp設定，不在HTML／GitHub。

原main使用expected_sha1685d583b123bfaec159276127ebd5c430f68a40、force:false發布commit6800e38637fe4a7ea2c33af3f494ca145ac47305／treede7a2f28db0e8194f7833a872eaf2fd977397af6，276檔所有Git blob SHA核對、77個變更路徑、44份PNG／ICO副本不變、私有config未發布。Pages run42046610819 completed/success，head_sha及main一致。正式試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.13.0 。

385項通過（372單元／組件＋5單檔＋8 Pages），原500五分鐘／10,000局回歸保留。公開HTML＋27runtime共28檔HTTP200且逐bytes SHA與已發布快照一致，配置真實API URL。公網上傳201、重試200且只一筆、衝突409、格式400、CORS／OPTIONS、分頁／快取Origin隔離及正式API429／Retry-After60皆通過；只按確定測試ID／名稱／0元刪除測試成績，D1及公網榜讀回0筆，沒有刪他人成績。

限流注意：原生binding是最佳努力；早期小批壓測及固定key探針未見429，受控counter顯示請求分散至多isolate，不能宣稱嚴格全網10次。保留原生binding，加bounded isolate60秒突發計數，單元驗證過期後恢復；正式API22次有界無效請求後回429。臨時probe已還原移除，最終source及repo無調試碼／header，不新增IP或遊玩紀錄到D1；probe目錄清除。基本防護仍不能證明本機金額真實，冷啟動／跨位置限額不保證。

手機Safari／Chrome真實觸控、原生PNG分享、實機完場至上傳尚未驗；Node／DOM／HTTP證據不是實機操作。browser_smoke只Python編譯，不重試既有HTTP／Chromium IPC限制。file:單檔停用排行榜請求但仍可本機遊玩／分享；商店／道具仍false，舊檔相容及餘秒保留。

完整結果docs/LEADERBOARD_RELEASE.json、LEADERBOARD_VALIDATION.json及LEADERBOARD_0130.md；單檔dist/charity-casino-prototype.html、兩個Cloudflare ZIP。dist/github-upload保持276檔精確已發布快照，事後收據／交接更新不另部署，不再prepare覆蓋它。下一最安全任務：使用者用iPhone16Plus真實完成一場→上傳→另一裝置看榜，再測離線失敗恢復網絡重試；不清存檔、不重建DB／升付費。關閉功能只需公開API設定清空後重建發布，保留D1。

## 0.13.0 · D1／Worker已部署、公網防護驗證通過，準備發布原Pages

使用者已授權代操作並完成本工作區device OAuth。原D1 five-minute-god-scores未換庫；初始只有system／migration表。原SQL EXPLAIN通過，直接執行原migration及tracker成功，scores／generated length／index讀回。先前Mac空白ERROR沒有具體D1原因，未重現，不能說已證明是schema或Wrangler bug。sqlite_version診斷被D1禁止，已換成合法schema讀取。

正式Worker https://five-minute-god-leaderboard.jameshh998.workers.dev，版本82eb5c1f-d3b3-421f-8bbf-1e1647e31023，D1綁定及原生10寫／60讀限流已部署；另加bounded isolate60秒突發計數。native-only短時壓測未觀察429；受控檢查證實同一位置的多isolate分配，不能保證嚴格全球10次。新增突發單元測試及正式API22個有界無效請求後觀察429／Retry-After60；臨時probe只在/tmp準備、已移除並恢復正式source，不在公開repo或最終Worker保留。沒有保存額外IP／遊玩紀錄到D1，沒啟用付費。

公網GET／POST／重試去重／衝突409／格式400／預檢／CORS／cursor分頁／快取Origin隔離已通過。測試成績按確定ID／名稱／0元選擇性清除；idempotent INSERT造成自增ID間隙，不能假設測試row一定連號。前端已填公開URL，file:明確停用API，本機遊戲／PNG分享保留。

385項（372單元／組件＋5封裝＋8 Pages）通過，新增17項對照0.12.1；27runtime／原12遊戲PNG及A圖示保持，browser_smoke僅Python編譯，不重試已知HTTP／Chromium IPC。詳LEADERBOARD_0130.md／VALIDATION／RELEASE.json。原259檔已發布快照SHA先核對，準備新snapshot；main尚1685d583b123bfaec159276127ebd5c430f68a40。下一步prepare／SHA／秘密排除核對、expected_sha／force:false發布原main，核對Pages及公開config/API。手機真機觸控、原生分享／實際完場上傳未驗，基本防護不能杜絕作弊。

## 代操作接線 · 使用者改回Mac，裝置授權待完成

使用者要求代為操作，最新已改回Mac；可直接以Mac瀏覽器完成本工作區裝置授權，不再要求其手動上傳至Codespace。已核對可用工具：GitHub可管理檔案，但沒有Codespace終端機／瀏覽器控制；本工作區Cloudflare尚未登入。因此改由本工作區wrangler login --device --browser=false，使用者只須在iPad到Cloudflare官方驗證頁完成一次授權，即可在這裡直接查D1／處理部署。不得索取管理Token／密碼、使用臨時預覽帳戶或改成Sites承載。前一裝置程序結束且whoami仍未登入，已重新啟動新程序；只使用最新碼，驗證碼不寫交接或公開檔。

使用者補充migration log，仍只含Wrangler cli.js:241059 generic UserError及空白ERROR。已對照4.157.0同段原始碼，該處是包裝migration錯誤，不是SQL解析位置；不能據此判定schema錯誤。授權成功後先讀取D1 schema／migration狀態及版本，再取得實際D1錯誤；在原因清楚前不重複apply、不刪表／另建資料庫。仍未部署Cloudflare或更新GitHub，遊戲／SQL未改，未新增測試。

下一步：使用者在官方device verify頁授權後，先用本工作區最新登入程序取得結果，再whoami確認並開始只讀診斷。

## iPad接續 · Codespace已建立，待上傳部署包／裝置登入

使用者現在只有iPad，已完成原GitHub倉庫Code→Codespaces→Create codespace on main。遠端main仍0.12.1，不含候選Cloudflare檔案，不能直接假設可讀本工作區；需下載ready ZIP到iPad，再Upload到Codespace根目錄、unzip -n並ls設定。保留既有D1，不重頭建庫。Mac登入成功不等於Codespace登入成功，改用wrangler4.157.0 login --device；本輪CLI help已核對該旗標，真實裝置登入仍待驗。

已補docs/CLOUDFLARE_LEADERBOARD.md及ZIP內START_HERE的iPad說明，ZIP完整性、D1設定及Worker／SQL原樣核對通過；只改說明及狀態，沒有改SQL／遊戲或重跑383項測試。原migration仍失敗原因未明，不能先deploy或重複apply。下步取得使用者檔案上傳／設定讀取／device登入結果，再做只讀D1診斷取代讀Mac本地log。

## D1遠端遷移失敗 · 等待具體錯誤

使用者已回報Mac登入成功，之後在正確目錄執行remote migrations apply，選擇yes，輸出目標DB ID正確但0001_scores.sql狀態❌。所貼內容最後只有空白ERROR，沒有SQLite／D1錯誤文字或code。不能把本機SQLite／dry-run通過視為這次遠端遷移成功；不能猜測為generated column、權限、既有表或Wrangler錯誤而改SQL。

下一最小證據：使用者開啟Mac ~/Library/Preferences/.wrangler/logs，依修改時間找這次migration的log，只提供ERROR／D1錯誤附近訊息，不索取Token、OAuth code或整份登入記錄。取得原因後才決定修正及重試；先不deploy、不重複migration、不刪表／重建DB。此工作區仍未登入使用者帳戶，不能直接讀取其Mac或遠端D1。

本輪只更新交接／驗證狀態，無SQL、Worker、遊戲或部署包修改，未重跑383項測試，也無新的本機測試宣稱。原GitHub Pages維持0.12.1。

## Mac部署排查 · OAuth CSRF及錯誤工作目錄

使用者Mac回報OAuth request_forbidden／No CSRF value available in the session cookie，隨後migration及deploy在個人主目錄尋找cloudflare/wrangler.jsonc而ENOENT。OAuth未成功、遠端migration／deploy未執行；不是npm版本或D1ID錯誤的證據。cookie/session遺失的具體瀏覽器原因未證實，不能宣稱已修好。

最小下一驗證：Finder拖真正的解壓資料夾到cd，先ls cloudflare/wrangler.jsonc；一般瀏覽器同一Mac登入dash，wrangler login --browser=false取得全新連結直接貼到同一瀏覽器，成功後whoami，再逐項migration／deploy。4.157.0 login --help已核實--browser旗標；用戶Mac登入流程待驗。若同錯誤持續先收新證據，不重複後續部署、不改猜測中的scope／callback或叫使用者公開Token。

已更新docs/CLOUDFLARE_LEADERBOARD.md及ready ZIP內START_HERE.md／指南，ZIP解壓與DB設定核對通過；LEADERBOARD_VALIDATION.json同步hash／未驗狀態。只修部署說明，沒有改遊戲／Worker，也沒有重跑383項遊戲測試或發佈GitHub。

## Cloudflare接線進度 · 已收到D1 ID及名稱

使用者提供同一組database_id兩次，確認資料庫名稱five-minute-god-scores。已以提供的ID建立本機cloudflare/wrangler.jsonc（gitignore且prepare不會收集）；示例config仍保留佔位，前端LEADERBOARD_API仍空字串。Wrangler4.157.0使用已填ID的config deploy --dry-run exit0，正確辨識DB與兩個限流綁定；不代表ID已在遠端核對成功。使用者已建D1是使用者回報，尚未remote migration／部署／公網驗證或更新GitHub。

本工作區沒有Cloudflare登入授權，whoami顯示未登入；不可只靠database_id管理資源，亦不向使用者索取Token。dist/cloudflare-leaderboard-ready-0.13.0.zip含已填ID的config、Worker、migration、指南及START_HERE.md三行登入／遷移／部署指令，ZIP解壓核對通過，無管理憑證。此包供使用者在自己的電腦登入後部署，不加入公開GitHub。只改部署設定與交接，遊戲及測試程式不變，未重跑之前383項遊戲測試。

下一最安全任務：使用者解壓ready ZIP，在該資料夾執行wrangler login、d1 migrations apply DB --remote、deploy，回傳公開workers.dev網址；如果多帳戶選擇持有D1者，勿另建同名資料庫／啟用付費。取得真實URL後才接線遊戲／公網驗證。

## 0.13.0 · 精簡排行榜本機候選完成，等待免費帳戶資源建立

使用者已明確確認本機五分鐘驗收（「1 是」）、每次完成各留一筆；已有免費Cloudflare帳戶，但Worker／D1尚未建立。前置等待已解除，取代下方舊等待紀錄。此次按gamestudio工程／UI流程完成可檢查實作，尚未登入／建立雲端資源、啟用付費或發布GitHub；正式仍0.12.1 commit1685d583b123bfaec159276127ebd5c430f68a40。

新增cloudflare/worker.mjs、0001_scores.sql與安全示例設定；POST只接名稱／精確金額＋UUID標頭，參數SQL／1024bytes／安全文字／CORS／原生限流綁定、同次重試去重、同名多筆、keyset快照分頁及15秒讀取快取。D1無IP／牌局／下注／計時／暫停／派彩紀錄，無管理密鑰入前端。每次新挑戰可選submissionId隨schema2保存，舊檔兼容；完場按上傳才出網，失敗／逾時保留結算與outbox。首頁龍虎榜真接列表／上下頁／刷新，API預設空字串停用，五桌玩法／貼圖／動畫／音效保留，商店／道具仍false。

383項通過（370單元／元件＋5封裝＋8 Pages），新增15項：7 Worker實際SQLite、6 client及2 app接線；含伺服器commit後回應遺失→重載→重試只一筆、同名多筆、巨額排序、格式／限流、DOM安全顯示、逾時及離線、無自動上傳。Wrangler4.157.0 deploy --dry-run成功辨識D1／10次寫／60次讀限流；不是遠端執行證據。27 runtime／Pages一致，12遊戲PNG及圖示原樣；舊259檔dist/github-upload SHA全吻合，保持精確已發布快照，未執行prepare覆蓋。browser_smoke僅Python編譯，未重試已知HTTP／Chromium IPC。

單檔30013106 bytes，SHA256 36ba911c31c1b8250585bbe4ad1450e9835298041d9b38f91a3b4397fd53c65c。完整接線／資源建立／遷移／部署／停用回退見docs/CLOUDFLARE_LEADERBOARD.md；機器結果LEADERBOARD_VALIDATION.json。腳本scripts/smoke-leaderboard.mjs預設只讀，--write-test-score才在公網留下1筆明示的驗證成績，未執行公網腳本。

未驗：真實D1 migration／Worker deploy／公網POST與限流快取、GitHub新版本及iPhone Safari／Chrome橫向觸控／弱網。基本防護不能驗證本機金額真偽，線上上限128位分、清除本機資料可能失去去重ID；不改為全程伺服器驗證。下一最安全任務：由使用者在自己的環境wrangler login／建立D1，填本機config的database_id，remote migration及deploy取得公開HTTPS網址，再設LEADERBOARD_API，公網測試後發布原Pages。不要索取／公開API Token或自行升級付費。

## 最新：排行榜前置核對完成，等待兩項使用者答案

使用者新授權Cloudflare Workers＋D1精簡排行榜，但明確先確認本機五分鐘已完成及驗收，且第9點要求先選每次成績／每人最佳再實作資料規則。已用非同步問題請使用者確認驗收與保留規則，目前沒有答案；不得將等待或舊發布授權當成這兩項已定案。

本輪只重新核對0.12.1本機：npm run verify＋verify:pages共368（355＋5＋8）通過，離線HTML SHA與已發布收據一致，259檔已發布快照SHA不變。實機驗收仍未有紀錄，沒有重試HTTP／Chromium IPC。未開始Worker／D1／排行榜前端，未建立雲端資源／詢問金鑰／啟用付費／修改GitHub。詳docs/LEADERBOARD_PREREQUISITES.md／LEADERBOARD_PREREQUISITES_VALIDATION.json。

下一最安全任務：等本機驗收與保留規則兩項答案；確認後才開始排行榜，僅上傳名稱／最終金額及必要去重技術ID，本機牌局／計時／暫停／下注／派彩不出網、不保存過程，同名不覆寫、基本防護不宣稱杜絕作弊。先做可檢查實作／測試，再詢問缺少的Cloudflare必要設定；管理金鑰不得入HTML或GitHub。正式仍0.12.1 commit1685d583b123bfaec159276127ebd5c430f68a40，商店／道具維持關閉。

## 0.12.1 · 自由挑戰移除已發布，Pages成功

使用者刪除自由挑戰已完成：開始／設定無模式選擇，正式app固定race、100元／300秒；舊mode與manual存讀事件忽略，續玩只讀race-auto，free匯入／直接restore拒絕。原free auto／manual及舊schema1資料原樣保留，不遷移／搬資產；底層free格式僅留相容／歷史回歸，正式玩家無入口。五分鐘存檔仍按餘秒續玩。

以f445c77df6b91e5ba70e31f66ffe4560e6fc2110作parent／expected_sha、force:false更新原main成功。commit 1685d583b123bfaec159276127ebd5c430f68a40／tree b3730b8046b36abd55a8572175d7a6a2a8cda12f，259檔全blob SHA吻合、59改動，44PNG／ICO副本不變。Pages run41801878218 completed/success，head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.12.1 。詳docs/SINGLE_CHALLENGE_0121.md／SINGLE_CHALLENGE_VALIDATION.json／SINGLE_CHALLENGE_RELEASE.json。

368項（355＋5＋8）通過，新增3項：無模式／手動選擇、free檔與原局完整保留／拒絕、race續玩不回填時間。25runtime／Pages一致，原500五分鐘／10,000局回歸保留。單檔30,002,580 bytes，SHA256 c1c6a33a8dca5b0a8cfce6373160e82280c761ba8d574462a55b3a223948721a。browser_smoke僅Python編譯，未重試HTTP／Chromium IPC，未直接HTTP核對公開頁；真Safari開始／設定版面與檔案匯入下載未驗。

主頁五項／加入主畫面指引／A圖示／五桌／計時與保存規則維持，商店與道具仍關閉，無排行榜／Cloudflare。dist/github-upload為259檔精確已發布快照，事後收據／交接不另部署，舊ZIP歷史包。下一最安全任務：iPhone確認開始／設定無自由模式，race續玩保持餘秒；不清存檔。回退整套0.12.0會恢復自由選擇。

## 0.12.1 · 自由挑戰入口已移除，準備發布

依使用者刪除自由挑戰：開始／設定去掉模式選擇，正式app固定race，100元／300秒。續玩／讀檔只讀race-auto；free匯入及直接restore拒絕，舊mode／manual-save／load-manual事件忽略，玩家看不到自由模式／手動保存入口。free的auto／manual及舊schema1資料逐位元組保留，不遷移或合併；底層解碼及歷史回歸格式保留。

368項（355＋5＋8）通過，新增3項；25runtime／Pages一致、原PNG／A圖示不變。原500五分鐘／10,000局回歸保持。browser_smoke僅Python編譯，未重試HTTP／Chromium IPC，真Safari開始／設定版面及匯入下載未驗。單檔30002580 bytes，SHA256 c1c6a33a8dca5b0a8cfce6373160e82280c761ba8d574462a55b3a223948721a。詳docs/SINGLE_CHALLENGE_0121.md／SINGLE_CHALLENGE_VALIDATION.json。

下一步prepare／全檔SHA核對，以f445c77df6b91e5ba70e31f66ffe4560e6fc2110為基準expected_sha／force:false發布原main並核對Pages。主頁五項、加入主畫面指引、五桌／保存規則維持，商店／道具仍關閉，不開排行榜／Cloudflare。

## 0.12.0 · 主頁第五項與平台指引已發布，Pages成功

已按使用者最後修正，設定／支持作者間新增「加到主頁面」，只開子視窗顯示偵測平台對應步驟，取代先前原生安裝提案。Safari3步、iPhone Chrome4步，Android Chrome實際⋮選單；未知可切換、已standalone提示無需再加入、file包可開網頁版。切換／關閉不啟動挑戰、不改Game／存檔，關閉回原按鈕。

五列按實際安全區調整，≥44px，短屏收次要標語，維持主頁單屏。root／docs提供穩定scope／id／start_url的standalone manifest、A192／512及iOS App顯示設定；單檔移除外部manifest。無原生安裝／分享呼叫、無SW／離線承諾，原A圖與12遊戲PNG保持、商店／道具仍關閉。

以dc8427c423c9c56e027c0dcb97e9788326b062c9作parent／expected_sha、force:false更新原main成功。commit f445c77df6b91e5ba70e31f66ffe4560e6fc2110／tree 7eb9c4d9a1d17b44d916bf85ddab1d269f6e8d51，256檔全blob SHA吻合、76改動、舊38PNG副本不變，新4二進位副本對應2個blob亦核對。Pages run41798911012 completed/success，head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.12.0 。詳docs/HOME_INSTALL_0120.md／HOME_INSTALL_VALIDATION.json／HOME_INSTALL_RELEASE.json。

365項（352＋5＋8）通過，25runtime／圖示Pages副本一致，原500五分鐘／10,000局回歸保留。單檔30,003,462 bytes，SHA256 9e02db7c1f24c48791492673235609925be9455a5688ec73921206fbeb7c8a32。browser_smoke僅Python編譯；純幾何／DOM替身不是真Safari，未重試HTTP／Chromium IPC，未直接HTTP核對公開頁。真iPhone16Plus Safari／Chrome、Android選單、主畫面全螢幕啟動／安全區／觸控及WebApp存檔延續未驗。

無排行榜／Cloudflare。dist/github-upload保持256檔精確發布快照，事後收據／本地交接不另部署，舊ZIP歷史包。下一最安全任務：iPhone16Plus在Safari／Chrome點第五項核對步驟，再手動加入主畫面確認App式開啟及原存檔備份／延續；不清存檔。回退整套0.11.1與cache版本。

## 0.12.0 · 五項主選單與加入主畫面指引完成，準備發布

使用者最新修正已取代原生安裝提案：主頁在設定／支持作者間加「加到主頁面」，點擊只顯示子視窗。按Safari／Chrome及iOS／Android偵測顯示對應步驟，亦可自行切換；未知／內嵌提供手動選擇，已standalone提示無需加入，file包可開網頁版。沒有呼叫原生安裝／分享，不建立／改動Game或存檔。

五列依實際安全區調整，主要按鍵≥44px，短螢幕收次要標語，維持主頁單屏。為手動加入後全螢幕提供root／docs manifest與A圖192／512、mobile-web-app-capable，無ServiceWorker或離線承諾。原A5檔及12遊戲PNG不變，商店／道具仍關閉。

365項（352＋5＋8）通過；新增8項，25runtime／Pages副本一致。browser_smoke僅Python編譯，純幾何／DOM替身不是Safari實機，未重試HTTP／Chromium IPC。真iPhone16Plus Safari／Chrome、Android選單、全螢幕啟動／安全區及WebApp存檔延續未驗。單檔30003462 bytes，SHA256 9e02db7c1f24c48791492673235609925be9455a5688ec73921206fbeb7c8a32。詳docs/HOME_INSTALL_0120.md／HOME_INSTALL_VALIDATION.json。

下一步prepare／新PNG blob及全檔SHA核對、expected_sha／force:false更新原main並核對Pages；實際收據另記HOME_INSTALL_RELEASE.json。無排行榜／Cloudflare。

## 0.11.1 · A款書籤圖示已發布，Pages成功

使用者已選A金印賭字並要求實裝／繼續，正式接favicon16／32PNG、ICO16／32／48及iPhone180書籤圖示，原A SHA保持399b38328c1748a5cd68e69e53364b8580db3c2e7c340b94ed4e1359c1d7ee09。只做尺寸格式輸出，不改圖案，root／docs相對路徑與版本同步，單檔圖示內嵌。四個小圖71,962 bytes，頁面不引用2.6MB來源圖。

以2a6d8eb09201abe7ed6456874d6850cff1328e61作parent／expected_sha，force:false更新原main成功。commit dc8427c423c9c56e027c0dcb97e9788326b062c9／tree a1df7419db52a5569a61a7cda8504cbb94698e88，247檔全blob SHA吻合、73檔改動、舊30PNG副本不變；新10二進位副本對應5個blob均核對sha。Pages run41794205854 completed/success，head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.11.1 。詳docs/BOOKMARK_ICON_0111.md／BOOKMARK_ICON_VALIDATION.json／BOOKMARK_ICON_RELEASE.json。

357項（346＋4＋7）通過，原圖及所有PNG／ICO尺寸已解碼，25runtime忽略cache版本與0.11.0一致、12原遊戲PNG不變。單檔29,997,559 bytes，SHA256 1c3f64cbcdd25a6125d7507436bf867aecc861b398c1bcee35fa250cf73ddc5e。發布前臨時驗證腳本曾因Path變數重用誤寫本機source.png，已攔截並逐位元組還原，改名／重驗圖示與Pages、完整manifest及遠端tree SHA後才發布；原始生成圖及舊線上版未受影響。正式匯出script沒有此問題。

真Safari分頁／16px辨識、iPhone16Plus主畫面遮罩與舊書籤快取未驗；未重試HTTP／Chromium IPC，未直接HTTP核對公開頁。商店及道具仍關閉，沒有排行榜／Cloudflare。dist/github-upload保留247檔精確已發布快照，事後收據／本地交接不另部署；舊ZIP歷史包。下一最安全任務：iPhone16Plus開新版並加入主畫面，若舊捷徑快取仍舊圖，重加捷徑即可，不清遊戲存檔。回退整套0.11.0及其快取版本，存檔保留。

## 0.11.1 · A款圖示已實裝，準備發布

使用者選「要a 然後實裝」並要求繼續；A金印賭字接入favicon16／32PNG、ICO16／32／48及Apple180書籤圖示，原圖逐位元組保留、僅標準尺寸格式匯出。root／docs連結版本化，離線包內嵌，小圖71,962 bytes、頁面不引用2.6MB原圖。更多見docs/BOOKMARK_ICON_0111.md／BOOKMARK_ICON_VALIDATION.json。

357項（346＋4＋7）全部通過，runtime及圖示Pages副本一致；新增圖示資產2／單檔1／Pages1檢查。25runtime忽略cache版本與0.11.0一致、12PNG原樣，商店與道具維持關閉。真Safari分頁／iPhone主畫面遮罩及舊書籤快取、16px識別未驗；沒有HTTP／Chromium IPC重試。

單檔29997559 bytes，SHA256 1c3f64cbcdd25a6125d7507436bf867aecc861b398c1bcee35fa250cf73ddc5e。下一步prepare並核對新binary Git blobs／全樹SHA，expected_sha／force:false更新原main，確認Pages成功再記收據；不另開雲端或商店。

## 最新：三款網頁書籤圖示設計待確認，正式保持0.11.0

使用者明確「給我三個版本，確認後才實裝」。依原Logo金色／酒紅／深綠，使用image_gen生成A金印賭字、B五分鐘籌碼、C黑桃王者，原圖保留且複本存docs/previews/bookmark-icons-v1；完整prompts／assets／validation與隔離HTML比較頁齊備。16／32／80px僅CSS示意，非正式小圖匯出；未改favicon／apple-touch-icon或正式界面，未升版／封裝／GitHub。

3張1254×1254 RGB正方形PNG解碼／不透明／原檔一致、12圖片引用與3組16／32px示意檢查通過，3圖已目視檢視。120正式程式／素材／封裝及發布狀態檔SHA未變。沒有重跑或引用本輪353項遊戲測試，未重試HTTP／Chromium IPC。真Safari小尺寸辨識／降採樣、iPhone書籤遮罩、最終ICO／touch-icon及快取均未驗。

正式仍0.11.0 commit2a6d8eb09201abe7ed6456874d6850cff1328e61，商店／道具維持關閉。下一最安全任務：待使用者選A／B／C或修訂，確認後才匯出／接入／封裝及按授權發布；不得沿用舊發布授權自行安裝這輪新圖示。

## 0.11.0 · 21點橢圓桌及商店／道具關閉已發布，Pages成功

使用者「實裝到github」已批准v1正式接入／發布。手機橫向21點為上方莊家／下方玩家的深綠酒紅金邊橢圓桌，無頭像、真實手牌／點數／下注及當前手倒數，分牌1–4手、窄屏局部滑動／換手置中，主要動作48px。桌面／直向保留原布局；保險／派彩／五分鐘／保存及12原PNG維持。商店與道具開關維持false、舊庫存保留，不自動重擲或重開商店。

以原main 2ba346e82210681b29e2c41bee9b7895af8d2a80為parent與expected_sha、force:false更新成功。commit 2a6d8eb09201abe7ed6456874d6850cff1328e61／tree fc566bdd10209bda94ea40053a948f4d9232b9e0；230檔blob SHA全吻合，62檔改動，30PNG副本不變。Pages run 41776326234 completed/success且head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.11.0 。詳docs/BLACKJACK_OVAL_0110.md／BLACKJACK_OVAL_VALIDATION.json／BLACKJACK_OVAL_RELEASE.json。

353項（344＋3＋6）通過，25runtime／Pages鏡像一致，保留500五分鐘及10,000局回歸。新增3項測量配置／四手真DOM標記及結算／滑動跟隨檢查。單檔29,901,233 bytes，SHA256 74661e766ef1a4426108eaeb2824773d804065172feb6e8589b2d8ea7eb65210。瀏覽器腳本僅Python編譯；Node／DOM替身與純幾何不是真Safari畫面，未重試HTTP／Chromium IPC，未直接HTTP核對公開頁。真iPhone16Plus安全區／工具列／1–4手與長手牌／觸控／旋轉、iPad／桌面／直向視覺、原生分享及音訊硬體仍未驗。

沒有排行榜／Cloudflare／付款。dist/github-upload保持230檔精確發布快照，事後收據及本地交接不另部署，舊ZIP歷史包。下一最安全任務：iPhone16Plus開?v=0.11.0測21點下注／分牌／保險／暫停旋轉及無整頁捲動，並確認大廳與各桌無商店／道具入口。回退整套0.10.1會重開商店／道具；若須保持關閉可用本機0.10.2包，保留所有存檔。

## 0.11.0 · 已確認21點橢圓桌接入，準備授權發布

使用者「實裝到github」已批准v1並授權原main／Pages，取代先預覽界線。手機橫向莊家上方／玩家下方，無頭像、真手牌／下注／點數及當前手倒數；分牌1–4手，窄屏僅手牌列滑動，換手置中、原手保留滑動。48px主要動作、35.2px既有頂欄例外，保險／派彩／明細維持原流程。桌面／直向原布局保留。

商店及道具GAME_FEATURES兩項保持false，原庫存與12PNG保留、不自動重擲／開店。新增呈現不改Game派牌／賠率／派彩／五分鐘／保存。353項（344＋3＋6）全部通過、25runtime／Pages一致。新增測量配置／四手DOM／滑動跟隨3項；原500五分鐘與10,000局回歸保留。測量與DOM為替身、browser_smoke僅Python編譯，非Safari或實機證據；沒有HTTP／Chromium IPC重試。

單檔29901233 bytes，SHA256 74661e766ef1a4426108eaeb2824773d804065172feb6e8589b2d8ea7eb65210。詳docs/BLACKJACK_OVAL_0110.md／BLACKJACK_OVAL_VALIDATION.json。真Safari／安全區／1–4手觸控／長手牌／旋轉、桌面／直向視覺及音訊／原生分享未驗。下一步核對main基準2ba346e82210681b29e2c41bee9b7895af8d2a80、準備快照、blob SHA及expected_sha／force:false發布，待Pages成功再記收據。無排行榜／Cloudflare。

## 最新：21點賭枱v1待確認；本機0.10.2隱藏商店／道具，未發布

使用者明確先預覽21點賭枱式設計，docs/previews/blackjack-table-v1提供playing／split／betting三SVG／PNG及切換HTML。無頭像、深綠酒紅金邊橢圓枱、莊家上方／玩家下方、主動作48px，全部示例；正式21點賭枱主markup仍0.10.1，styles.css SHA不變，未接新布局。

使用者第2點已在本機0.10.2完成：src/rules.mjs GAME_FEATURES {shop:false,items:false}傳入Game，隱藏大廳商店／五桌道具及規則文案，阻止隱藏事件／直接購物與道具API、舊庫存自動重擲；不刪庫存／資產／舊程式、不退款、不加排程自動開放。Game底層預設仍支援舊功能回歸，app明確套停用配置，restore不覆寫配置。未來只按使用者決定重開兩開關，跑回歸及重封裝。

350項（341＋3＋6）通過，新增引擎3／app2；原500五分鐘及10,000局保留，12PNG原樣，25runtime／Pages一致。browser_smoke改成無商店／道具路徑，只Python編譯。三PNG 1864×860已檢視，SVG／PNG與28按鍵靜態範圍檢查通過；非瀏覽器或實機證據，真Safari／safe-area／1–4手與長手牌／換牌／原生分享與音訊仍未驗，未重試HTTP／Chromium IPC。詳docs/FEATURES_PAUSED_0102.md／FEATURES_PAUSED_VALIDATION.json及預覽README。

本機單檔29,894,596 bytes，SHA256 8088a765f7b49cc2dd101ab37047a816f8d663990eda83968ffbb14cc9074262。GitHub與dist/github-upload仍原0.10.1 commit2ba346e82210681b29e2c41bee9b7895af8d2a80、224檔精確快照；本輪未呼叫GitHub／prepare，沒有發佈新桌或隱藏功能。dist/manifest清楚標本機0.10.2未發布，原公開網址仍0.10.1。下一最安全任務：等待使用者確認新賭枱外觀，再接真DOM／多手適配並按發布要求處理；不自行開商店、排行榜／Cloudflare。

## 0.10.1 · 21點橫向修正已發布，Pages成功

手機橫向以左右莊家／玩家分區保留完整手牌高度，主操作獨立44px底列，單行35.2px頂欄含兩倒數／更多／暫停。次要工具與玩法用原TablePanels；4手分牌隔離舊直向CSS，換牌長牌列獨立滑動保持可點選。Game／牌局／保存／資金／雙時鐘及原貼圖不改，保留0.9.4即入桌與0.10.0真快照分享。

以原main 2dfb64310848ed15dd973caf84644312dbee1f85為parent及expected_sha、force:false發布commit 2ba346e82210681b29e2c41bee9b7895af8d2a80／tree 6f1e0cfeb8b00105785742c5248930037c8bc0ef；224檔blob SHA全吻合、60變更、30PNG副本不變。Pages run 41773328646 completed/success，head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.10.1 。詳docs/BLACKJACK_LANDSCAPE_0101.md／BLACKJACK_LANDSCAPE_VALIDATION.json／BLACKJACK_LANDSCAPE_RELEASE.json。

345項（336＋3＋6）通過，25runtime及12原PNG一致。單檔29,892,936 bytes，SHA256 9d628eedc4d4990d8d885944741beb535cd0613d916e04b0a8693d698f255fab。browser_smoke僅Python編譯，Node／DOM替身不代表真CSS。未重試HTTP／Chromium IPC，未直接HTTP核對公開頁。真iPhone16Plus Safari比例／safe-area／工具列、1–4手／換牌滑動觸控、iPad／桌面／直向視覺及音訊／原生分享仍未驗。

沿用前次實裝至GitHub後同一頁面的修復範圍；無排行榜／Cloudflare／付款。dist/github-upload保持224檔精確發布快照，事後收據／本地交接不另部署；舊ZIP歷史包。下一最安全任務：iPhone16Plus開?v=0.10.1玩21點，檢查保險／分牌／換牌及旋轉／暫停，確認牌面與五鍵完整、整頁不用捲。回退整套0.10.0及快取版本，保留存檔。

## 0.10.1 · 21點橫向介面修復已完成，準備發布

手機橫向獨立斷點及單行35.2px頂欄；莊家／玩家左右分區，動作獨立底列、次要工具收進更多；隔離舊直向分牌CSS，換牌長手牌可在牌列滑動且每張≥44px。Game／規則／保存／時鐘與12原PNG不改。

345項（336＋3＋6）全部通過，Pages25個runtime與12原PNG一致；browser_smoke僅Python編譯。詳docs/BLACKJACK_LANDSCAPE_0101.md及VALIDATION.json。真Safari比例／安全區／1–4手／換牌觸控／直向與桌面視覺仍未驗，未重試HTTP／Chromium IPC。沿用前次實裝至GitHub後同一已部署頁面修復，下一步核對原main基準與blob SHA、expected_sha／force:false發布並核對Pages；不開排行榜／Cloudflare。

## 最新：0.10.0 v3紀錄及PNG分享已發布，Pages成功

使用者「實裝至GitHub」已批准正式接入及發布。結果頁真DOM使用v3金箔深綠風格；完成隱藏時間，失敗顯示遊玩時間，兩者保留返回／分享及五桌金額，指定次要文字刪除。PNG依真實完成checkpoint.profile凍結快照本機Canvas繪製，不用示例卡；File點按前準備、同步呼叫原生分享，不支援下載PNG、取消不下載、拒絕／產圖逾時可重試。Game／規則／派彩／計時／保存及12原PNG不改，保留0.9.4即入桌。

以0.9.4 commit061601d3b6d73611bd2a7cc364caf7f298c495ae為parent及expected_sha、force:false更新原main成功。新commit2dfb64310848ed15dd973caf84644312dbee1f85／tree 9134056d068e2a4c8eb1a2f41f54ee4c0b6df979，221份發布檔blob SHA全吻合、63檔變更、30PNG副本不改。Pages run41771348441 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.10.0 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/2dfb64310848ed15dd973caf84644312dbee1f85 。

340項（331＋3＋6）通過，新增record12與app3；25runtime與Pages一致，12PNG原樣，保留500五分鐘及10,000局模擬。單檔29,887,474 bytes，SHA256 ebcd1e9c9de91221aaf12b2b0515650ecc34b070c3add34a84c602fb37973c55。詳CHALLENGE_RECORD_0100.md／CHALLENGE_RECORD_VALIDATION.json／CHALLENGE_RECORD_RELEASE.json。dist/github-upload保持221檔精確快照；實際收據及本地交接不另部署，舊ZIP歷史包。

沒有排行榜／Cloudflare／付款。真Safari原生分享／收件App、Canvas實際PNG像素／字型、真DOM比例／safe-area／旋轉／觸控／讀屏／modal捲動及音訊仍未驗；browser_smoke只Python編譯，API／Canvas為替身，不當成實機證據，未重試HTTP／Chromium IPC。下一最安全任務：iPhone16Plus開?v=0.10.0完場，測完成／失敗頁及PNG分享／取消／下載；回退用整套0.9.4及快取，不清存檔。

## 最新：0.10.0 v3紀錄頁／PNG分享已完成，準備授權發布

使用者「實裝至GitHub」已批准v3正式接入及原main／Pages發布。challenge.mjs用真DOM呈現原Logo／金箔深綠結果，完成不顯示時間、失敗顯示遊玩時間；保留五桌金額／返回／分享，指定次要文字刪除。record-share.mjs依真正完成checkpoint.profile凍結本機快照、Canvas動態PNG，不用示例圖、不截UI按鈕；File在點按前準備，原生canShare／share同步從點按觸發，不支援下載PNG，取消不下載，錯誤／逾時可重試。Game／派彩／計時／存檔及12PNG不改，不加全圖入桌門檻／排行榜／雲端。

340項通過（331＋3＋6），新增record12及app3，保留500五分鐘與10,000局模擬。25runtime Pages鏡像一致，12PNG與0.9.4逐位元組不改。單檔29,887,474 bytes，SHA256 ebcd1e9c9de91221aaf12b2b0515650ecc34b070c3add34a84c602fb37973c55。詳CHALLENGE_RECORD_0100.md／CHALLENGE_RECORD_VALIDATION.json。

基準061601d3b6d73611bd2a7cc364caf7f298c495ae已核對；下一步prepare快照、blob SHA核對及expected_sha／force:false更新main，確認Pages成功再記CHALLENGE_RECORD_RELEASE.json。事後收據／本地交接不另部署。Safari真DOM／PNG像素／原生分享及目標App、觸控／讀屏／旋轉／安全區／硬體音訊未驗；不重試HTTP／Chromium IPC，browser_smoke只Python編譯，Canvas/API替身不當成實機證據。

## 最新：挑戰記錄v3時間條件與失敗操作，待確認

使用者要求時間改名「遊玩時間」，成功紀錄不顯示時間，失敗也需返回主頁／分享功能鍵。已新增docs/previews/challenge-record-v3：所有完成介面／分享卡隱藏時間，完成局數改單張橫卡；失敗顯示遊玩時間與局數，失敗介面保留返回主頁／分享挑戰紀錄兩操作，預覽index預設打開失敗介面。分享出去的PNG維持純圖（無操作按鈕）。先預覽限制仍有效，不接正式Game、不升版／部署，線上保持0.9.4。

沿用v2所有精簡要求、五桌金額及PNG原生分享試作；六SVG／PNG、時間條件、失敗兩操作、30行戰績、8操作框、示例帳式及JS語法通過；對v3新PNG重跑9項API替身通過。107正式檔與v2的23檔SHA不改。沒有重跑或引用正式325項，沒有HTTP／Chromium IPC重試。

原生Safari分享、真DOM／觸控／旋轉／長姓名／大金額及真正checkpoint出圖仍未驗；所有資料是示例。詳v3 README／validation。下一最安全任務：等使用者確認v3，再以真DOM接入、按凍結checkpoint產PNG並驗原生分享；不改Game計時或刪存檔內時間，不把固定示例卡當真成績。

## 最新：挑戰記錄v2與PNG分享試作，待確認

使用者修改六項：刪起始／道具、本次增減、姓名旁五分鐘挑戰及底部淨贏取說明；補充明確「只刪底部說明，保留五桌金額」。按鈕改分享挑戰紀錄，需原生手機圖片分享，並提供失敗紀錄卡。本輪延續先預覽限制，只新增docs/previews/challenge-record-v2及文件，正式／GitHub保持0.9.4，不自行實裝／發布。

v2提供手機完成／失敗、小橫向及電腦四介面SVG／PNG，另兩張1600×900純紀錄PNG分享卡（無操作按鈕），共六組；姓名、最終資金、時間／局數與五桌金額保留。失敗例為既有資金歸零，不新增時間到的金額門檻。所有成績為示例，v1的15檔保持原樣。

預覽index.html加隔離分享試作share-preview.js：切狀態預備PNG File、點按同步檢查canShare並調navigator.share，讓系統選目的地；不支援／file限制提供PNG下載，取消不下載、不誤稱已傳送。9項API／File／回呼替身檢查通過，六SVG／六PNG／30行戰績／8按鈕及刪字、原圖SHA與示例帳式通過。107正式檔與v1的15檔SHA不改，沒有沿用舊325項作本輪驗證。詳preview README／validation／validate-share.mjs。

原生分享未在iPhone16Plus Safari HTTPS或目標App驗證；本機file可能只可下載，PNG為Inkscape靜態輸出。正式Game未接、未由真正checkpoint動態繪PNG。下一安全任務：等使用者確認v2外觀，再接真DOM／PNG出圖與原生分享；不能直接用固定示例卡分享實際成績。保留其他存檔備份及0.9.4不阻擋入桌，勿新增排行榜／雲端。

## 最新：挑戰記錄v1僅設計預覽，待確認

使用者「重新設計挑戰記錄頁…先讓我預覽」。本輪以既有完場最終資金＋五桌統計為目標，僅新增docs/previews/challenge-record-v1/及交接，不改src／貼圖／版號／dist／Pages，不部署；正式仍0.9.4 commit061601d3b6d73611bd2a7cc364caf7f298c495ae。此明確先預覽條件優先於過往發布授權，不能自行接入或上傳。

設計為電影感金箔切角框＋深綠戰績板，原Logo／賭場背景／籌碼三素材不改像素；左大金額與本次增減／時間／局數／道具，右五桌局數及淨贏取，保留返回主頁／匯出兩操作，沒有新增排行榜／成就。所有畫面都是示例，帳式與局數一致。提供932×430完成／歸零、667×375較小橫向、1920×1080電腦四組SVG／PNG，以及index.html切圖。

已檢查四SVG XML、四PNG尺寸／解碼、20統計列及8操作框界內且44px以上、三原圖嵌入SHA、整數分示例帳式、builder與HTML script語法；107份正式來源／素材／發布檔SHA不改。目視輸出已確認。詳preview README／layout／samples／validation。沒有跑或挪用正式325項，未試HTTP／Chromium IPC；PNG是Inkscape靜態排版，不是Safari截圖。

932×430的左右59／下21只是示意安全區。未驗六吋可讀性、真DOM／讀屏／鍵盤／觸控／旋轉、長16字姓名／超大BigInt／平板／直向。下一最安全任務：等使用者確認外觀；確認後以真DOM／CSS接既有challengeResultView，沿用Game／金額／存檔，不把整張PNG烤成正式UI，不自行做網絡榜。

## 最新：0.9.4載入回歸修正已發布／Pages成功（2026-11-03）

使用者在0.9.3發布後回報載入更慢，並補充「點選遊戲後，等候進入牌桌」。已移除全圖load／decode入桌門檻及首頁warm，五桌點擊同步入桌；只在指向／聚焦／觸碰某桌時低優先度hint1–2張主要圖，不強制decode，不await、不用晚回呼導航。保留名稱框／派彩modal／規則／存檔及PNG。

沿用使用者上一輪「實裝到GitHub」的原main／Pages發布授權修復隨後回歸，沒有另開功能或等待新批准。以0.9.3 commit1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9為parent及expected_sha、force:false更新。新commit061601d3b6d73611bd2a7cc364caf7f298c495ae／tree 8d6b27eb53fdc078930fd43fdc495db25184c293，215份發布檔blob SHA全吻合，57檔變更、30PNG副本不改。Pages run41665773585 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.4 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/061601d3b6d73611bd2a7cc364caf7f298c495ae 。

325項（316＋3＋6）通過，包括原版lobby != table紅燈、修正後同一直接入桌測試及五桌未完成hint即入桌。app29／table-layout25；12PNG不改、24runtime Pages鏡像一致。單檔29,866,314 bytes，SHA256 891cf19a7268b51672995d4a2ff0ea1cbec495fc6d1f0786a35ce05f673103b6。詳LOAD_RECOVERY_094.md／LOAD_RECOVERY_VALIDATION.json／LOAD_RECOVERY_RELEASE.json。dist/github-upload為215檔精確發布快照，事後收據／補充回答／本地交接不另部署，舊ZIP為歷史包。

Safari實際冷暖秒數、頻寬／CPU／記憶體及冷圖逐步出現觀感仍未驗；不重試HTTP／Chromium IPC，未直接HTTP核對公開頁。沒有排行榜／Cloudflare／付款。回退093會恢復已知門檻，應優先測094。下一最安全任務：iPhone16Plus開?v=0.9.4點入五桌，驗證沒有準備視窗阻擋，觀察慢圖及背景停錶。

## 最新：0.9.4載入回歸修正已完成／待發布核對（2026-11-03）

使用者回報剛發布0.9.3載入更慢，已確認全圖load／decode門檻導致入桌等待。移除首頁全圖warm與入桌Promise.all、pendingTable及準備視窗；點擊同步進原Game，指向／聚焦／觸碰某桌才低優先度hint1–2張主要圖，不強制decode、不await，晚到回呼不導航或改狀態。保留名稱框／派彩／規則／PNG。

325項（316＋3＋6）通過；原版永不完成請求的直接進桌測試lobby != table，修正後同測試及五桌29項app／25項table-layout通過。12PNG不改、24runtime鏡像及原發布212檔快照已核對。單檔29,866,314 bytes、SHA256 891cf19a7268b51672995d4a2ff0ea1cbec495fc6d1f0786a35ce05f673103b6。詳LOAD_RECOVERY_094.md／LOAD_RECOVERY_VALIDATION.json。

沿用使用者上一輪「實裝到GitHub」的同main／Pages授權處理隨後回歸，非另加功能；這是授權範圍解讀，不是假稱使用者新發了0.9.4發布指令。基準1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9已核對。先前只本機為暫定範圍，現準備發布並確認Pages。沒有排行榜／雲端；不重試HTTP／Chromium IPC，Safari速度／圖逐步出現觀感仍未驗，下一安全任務核對來源SHA及部署。

## 最新：0.9.3已發布GitHub／Pages成功（2026-11-03）

使用者「實裝到GitHub」已授權發布完成的名稱框置中、五桌派彩小視窗及九張貼圖預載／解碼入桌準備。遊戲程式與上一輪本機0.9.3相同，沒有再改玩法／保存或素材。

以0.9.2 commitcba6438bb85dc486970e8dcb151a9766a3b54f4b為parent及expected_sha、force:false更新原main成功。新commit1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9，tree 58090b221dd67b223bad2d670afebdb459f206d4；212份發布檔Git blob SHA全部吻合，62檔變更、30份PNG副本不改、沒有預覽目錄或手圖。Pages run41657918981 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.3 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9 。

發布前npm run verify及prepare:github共322項通過（313規則／元件／app替身＋3單檔＋6Pages）；Python smoke只編譯。單檔29,868,711 bytes，SHA256 2f109464727844429a7ba3fdb5f660900a6821fbc25a9ac76d71728dc7c214aa與本機驗證相同。詳docs/UI_POLISH_093.md、UI_POLISH_VALIDATION.json及UI_POLISH_RELEASE.json。dist/github-upload保持212檔精確發布快照；事後收據與本地交接不另觸發部署，舊ZIP仍是歷史包。

沒有排行榜／Cloudflare／付款。Safari真DOM／小視窗／safe-area／旋轉／觸控／捲動、實際冷暖載入耗時／解碼記憶體及音訊仍未驗證，未直接HTTP核對公開頁；沒有重試原HTTP／Chromium IPC限制。回退用完整0.9.2及對應快取，不清存檔。下一最安全任務：iPhone16Plus開?v=0.9.3逐桌測派彩及冷暖載入，不把部署成功當成裝置證據。

## 最新：0.9.3已獲發布授權，待部署核對（2026-11-03）

使用者「實裝到GitHub」已授權發布上一輪完成的0.9.3至原jacobmaster-97/charity-casino main及既有Pages。基準cba6438bb85dc486970e8dcb151a9766a3b54f4b／tree612b98949fe25292926f9bd43bf5a0c447bef823已核對，先前只本機限制解除。沒有另改Game、玩法或PNG。

內容為五桌名稱框置中、統一派彩小視窗、九張共用貼圖預載／解碼及入桌準備。322項驗證與單檔／Pages將在發布前核對，來源細節及UI審核見docs/UI_POLISH_093.md與UI_POLISH_VALIDATION.json。使用非強制expected_sha更新main，完成該commit Pages成功才記UI_POLISH_RELEASE.json。

Safari／真DOM／載入秒數及音訊硬體未驗，不重試HTTP／Chromium IPC；不建立排行榜、Cloudflare或付款。下一安全任務：核對來源SHA、發布及Pages結果；下文僅本機段落為歷史狀態。

## 最新：0.9.3三項畫面修整已本機完成（2026-11-03）

使用者要求大廳名稱框置中／縮框、派彩小視窗、改善入桌貼圖延遲。已水平／垂直置中原五個44px名稱框，保留0.9.2等比例填寬及座標。五桌原大結果區改「查看派彩」入口，完成後自動開居中小視窗；大小／手機輪盤先播原揭曉再顯示。金額直接讀result，保留再玩／返回大廳／自由模式保存／查看盤面；截止及破產不提供新局。視窗不暫停、不重複派彩，Escape關閉並還原焦點，背景沿原暫停。

TableArtCache在既有table-layout維護九張共用貼圖：首頁閒時順序預載、保留已解碼Image及共用Promise；入桌時必需貼圖全load／decode才呼叫原Game.enterTable。未備妥顯示準備視窗，倒數照走，可暫停／取消；15秒每圖逾時或解碼失敗提供重試，只補缺圖。舊回呼、背景完成、截止均不誤開局。沒有改PNG或聲效，不宣稱已減少下載位元組／實測秒數。

重要檔：src/app.mjs、table-layout.mjs、styles.css、五桌*-view.mjs；tests/challenge-app與table-layout各新增9／5項、舊五桌模板斷言及browser_smoke更新。其餘mjs僅快取query0.9.3，Game／rules／保存本體不改。規格／UI審核及機器證據見docs/UI_POLISH_093.md、UI_POLISH_VALIDATION.json；prepare-github只新增該validation白名單，沒有執行上傳準備覆寫0.9.2快照。

npm run verify及verify:pages共322項通過（313規則／元件／app替身＋3單檔＋6Pages），保留500次五分鐘及10,000局模擬。Python smoke只編譯。12runtime PNG與0.9.2發布快照、24src Pages逐位元組一致。單檔dist/charity-casino-prototype.html為29,868,711 bytes，SHA256 2f109464727844429a7ba3fdb5f660900a6821fbc25a9ac76d71728dc7c214aa。

本輪沒有GitHub mutation，網站仍0.9.2 commit cba6438bb85dc486970e8dcb151a9766a3b54f4b。dist/github-upload保持209檔發布快照，舊ZIP為歷史包，新單檔及docs/play才是本機0.9.3；dist/manifest已明示published:false。沒有排行榜／雲端／付款。

未驗證iPhone16Plus Safari小視窗尺寸／safe-area／地址欄／旋轉／點按／捲動、真正冷暖載入時間及材質記憶體／音訊硬體；不重試已知HTTP／Chromium IPC，不把Node當真瀏覽器。下一最安全任務：在可用Safari環境測五桌結算與冷暖載入；使用者要求發布時再準備0.9.3快照，不自行開始排行榜。

## 最新：0.9.2填寬已發布GitHub／Pages成功（2026-11-03）

使用者「實裝至GitHub」批准原填寬預覽及發布。手機橫向依實際安全區內map寬度等比例填寬、偏上15%取景，五入座與圖同scene並依實際按鍵高度限制裁切；極短視口回完整圖。桌面／直向完整圖，原35.2px HUD、五桌規則／存檔／12張runtime PNG不改。沒有硬寫示意932×430或59／21安全區。

以0.9.1 commit735e739a1a32dcdf7812228d3b36645359fc1e39為parent及expected_sha、force:false更新main。新commitcba6438bb85dc486970e8dcb151a9766a3b54f4b，tree 612b98949fe25292926f9bd43bf5a0c447bef823，209份發布檔Git blob SHA全吻合、56檔變更、30PNG副本不改、沒有手圖／預覽目錄。Pages run41607230248 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.2 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/cba6438bb85dc486970e8dcb151a9766a3b54f4b 。

308項通過（299規則／元件／app替身＋3單檔＋6Pages）；新增6項layout含金值／多高度／fallback／量測替身。單檔29,862,635 bytes，SHA256 3bff2220d86ee66868f561090ec1313474b68df38f17cd7c31c0f96bff25ee41。詳docs/LOBBY_WIDE_092.md、LOBBY_WIDE_VALIDATION.json及LOBBY_WIDE_RELEASE.json。dist/github-upload保持209檔精確發布快照；事後收據／本地交接不另部署，舊zip仍為歷史包。

Safari真DOM／iPhone16Plus安全區／網址列／旋轉／裁切體感／捲動／觸控及硬體聲效仍未驗；browser_smoke只Python語法。未直接HTTP驗證公開頁，未重試已知HTTP／Chromium IPC。沒有排行榜／Cloudflare／付款。回復可用完整0.9.1及對應快取，不清存檔。下一最安全任務：實機開?v=0.9.2驗證五入座、地圖裁切、地址欄與旋轉，勿以部署成功當裝置證據。

## 最新：0.9.2填寬已實裝，準備授權發布（2026-11-03）

使用者「實裝至GitHub」已確認先前lobby-iphone16plus-wide-v1，取代只預覽限制。手機橫向依實際DOM安全區內框等比例填寬，偏上15%取景；五入座與圖同scene，讀實際按鍵高度限制裁切，極短回完整圖。桌面／直向完整圖。沒有硬寫932×430或59／21安全區，原35.2px HUD、五桌規則／存檔及12貼圖不變。

308項通過（299元件／規則／app替身＋3封裝＋6Pages），新增6項layout測試；browser_smoke只Python語法，沒有Safari／真DOM／觸控證據。單檔29,862,635 bytes，SHA256 3bff2220d86ee66868f561090ec1313474b68df38f17cd7c31c0f96bff25ee41。詳docs/LOBBY_WIDE_092.md及LOBBY_WIDE_VALIDATION.json。

使用者已授權原main／Pages發布，基準735e739a1a32dcdf7812228d3b36645359fc1e39；本提交為待部署內容，實際結果另於LOBBY_WIDE_RELEASE.json。沒有排行榜／Cloudflare／付款。未重試HTTP／Chromium IPC；下一安全任務：完成檔SHA核對、非強制更新main及確認該commit Pages成功，之後由實機驗證。

## 最新：iPhone 16 Plus大廳填寬預覽v1，先確認後實裝（2026-11-03）

使用者指出0.9.1兩側仍有留白、主要用iPhone 16 Plus，要求用盡橫向寬度；後續明確「先讓我預覽」。本輪只新增docs/previews/lobby-iphone16plus-wide-v1/及文件，沒有改正式程式／素材／版號或部署，102份正式檔SHA與預覽前一致，網站仍0.9.1。

以932×430畫布、左右59／底21px示意安全區，重建目前與建議版PNG／SVG；數值是排版假設，不是實機讀取。建議等比例放大填滿812px地圖內寬，消除原各約83px內側留白；人物不拉伸，偏上15%取景保留壁畫人物及五個入座鍵，下方地板／前景／賭桌底部裁去部分。模型線性放大約25.6%，裁上約14px／下79px，不當Safari實測。

交付lobby-wide.png、lobby-current.png（重建非截圖）、comparison.png及切換index.html，附render-preview.mjs／layout／validation／README。原背景PNG完整嵌入不改像素，按鈕獨立44px，保留原百分比。3PNG解碼／尺寸、SVG XML、10按鍵界內、比例／零左右留白、JS語法及102正式檔SHA通過，輸出已目視。未跑真瀏覽器／Safari／觸控，不用舊302項當預覽證據，未重試HTTP／Chromium IPC。

下一最安全任務：等使用者確認上下裁切／取景與填寬效果，才實裝實際viewport／安全區的填寬邏輯，不硬寫示意手機尺寸、不自行修改或發布正式版。

## 最新：0.9.1大廳更新已發布GitHub／Pages成功（2026-11-03）

使用者「更新GitHub」已授權原倉庫main及Pages。以0.9.0 commit4cc7a668d3b9e9dac989a97fab155445669a8e83為parent及expected_sha、force:false發布成功。新commit735e739a1a32dcdf7812228d3b36645359fc1e39，tree f495bbacb565a7eec40028a101c475dccbc90889；206份發布檔案Git blob SHA一致，56檔變更，30份PNG副本不改，無手圖。完整npm run verify及prepare:github通過302項（293＋3＋6），本輪不再改遊戲程式。

Pages run41602536032 completed/success、head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.1 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/735e739a1a32dcdf7812228d3b36645359fc1e39 。收據docs/LOBBY_VIEW_RELEASE.json及dist發布metadata同步；事後收據及本地交接不另部署。dist/github-upload現為0.9.1發布快照，舊zip仍是歷史包。若需回復可用前版0.9.0整體commit及對應快取，不清玩家保存。

沒有建立Cloudflare、排行榜或付款。Safari／真DOM／橫屏旋轉／35.2px點按／安全區及音訊硬體仍未驗，未直接HTTP核對公開Pages，未重試舊HTTP／Chromium IPC路徑。下一最安全任務：手機／iPad橫向實測地圖、更多、商店及暫停，勿把部署成功當實機驗證。

## 最新：0.9.1大廳地圖／精簡頂欄已本機完成（2026-11-03）

使用者實機回饋橫向地圖太小，允許刪底列／整合功能，指定頂欄縮矮20%。已移除大廳底列、進度條及蓋在地圖上的標題／大型商店鍵；HUD改35.2px（原44px），保留品牌、資金、餘時，商店／更多／暫停在同一列。更多含存檔／讀檔、返回主頁、姓名／完成局數及說明，開啟時照計，到時轉結果，背景仍停錶。Escape與返回還原更多焦點。五桌仍按原1672×941圖／百分比共縮放，入座88–120px寬／44px高，不拆名稱；沒有新圖或拉伸。

主要改app.mjs、styles.css、challenge-app測試及browser_smoke；其餘23個mjs本文與發布0.9.0一致（僅query快取0.9.1），Game／派彩／存檔不改。源碼配置可多出63.8px map高度，屬算式而非實機測量，寬度限制時仍保持圖比例。頂欄35.2px低於一般44px為使用者指定取捨，不套商店／其他牌桌。

驗證302項通過（293規則／元件／app事件替身＋3單檔＋6 Pages），新5項驗證精簡入口、更多照計／存檔、截止替換、背景及Escape／回主頁，保留500五分鐘及10,000局回歸。另補Escape收尾75ms的先紅後綠：先advance再close，避免重設last時漏掉interval間時間。HUD／map／more實際renderer HTML解析平衡；browser_smoke只Python語法。12 PNG與發布0.9.0逐位元組一致、24runtime根／docs同步、無手圖。

本機dist/charity-casino-prototype.html 29,860,401 bytes，SHA256 a7ee68ead686d1e1663b0573068cd0d0fec0dd56d61b68a28071a4bd599092b8；Pages目錄及manifest同步。詳docs/LOBBY_VIEW_091.md／LOBBY_VIEW_VALIDATION.json。未另發布GitHub，最後網站0.9.0 commit4cc7a668d3b9e9dac989a97fab155445669a8e83；舊github-upload／zip不是0.9.1新包。

Safari／真DOM地圖面積、橫屏／旋轉／安全區、35.2px點按舒適度、長金額及聲效硬體未驗證，未重試HTTP／Chromium IPC。下一最安全任務：iPad／手機橫向驗證地圖、更多、商店及停錶；使用者要求後才發布0.9.1，不自行接排行榜。

## 最新：0.9.0已發布GitHub／Pages成功（2026-11-03）

使用者「更新github」已授權原倉庫main及Pages更新。以0.8.0 commit28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65為parent及expected_sha、force:false更新成功。新commit4cc7a668d3b9e9dac989a97fab155445669a8e83，tree c4b91b6234608aa453b77a9712b2210561861036；203份發布檔案Git blob SHA一致，68檔變更，新增兩張PNG各在根／docs各一份，原26份PNG副本不改且無手圖。背景blob f4547d332171bc90916101ae62d6ab557e4f3f5d、Logo blob81db007fa9675b7a55dead226df724870402efbf均核對吻合。

Pages run41567146790 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.0 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/4cc7a668d3b9e9dac989a97fab155445669a8e83 。docs/HOME_SCREEN_RELEASE.json及dist發布metadata已更新；發布後收據及本地交接不另部署。dist/github-upload現為本輪0.9.0發布快照，舊zip仍是歷史包。

發布前完整npm run verify及prepare:github共297項通過（288＋3＋6），另在準備來源無預覽目錄時home8項通過。發布檢查重現tests/home.test對未上傳docs/previews的依賴（乾淨來源7過1個ENOENT），已改核對public/art/home-b/assets.json中原批准SHA，遊戲本體不變。Safari／真DOM／觸控／鍵盤／硬體聲效及公開Pages直接HTTP未驗，未重試舊HTTP／Chromium IPC。沒有排行榜／Cloudflare／付款。回退可用上一0.8.0 commit及整套快取，不清玩家保存。下一最安全任務：iPad Safari驗證主畫面、開始／續玩、旋轉與試聽，不自行開發下一階段。

## 最新：0.9.0五分鐘賭神主畫面已本機實裝／封裝（2026-11-03）

使用者「實裝主畫面」已批准v2，先前等待確認限制解除。已將確認的港漫背景及透明電影感Logo複製至public/art/home-b，逐位元組等於預覽；主頁改為真正DOM四入口：開始遊戲、賭神龍虎榜、設定、支持作者。指定底部文案及舊重複小標不再顯示，頁籤／一般HUD／故事銜接統一新名；技術存檔識別及前綴不改。

開始遊戲開姓名／模式／續玩，驗證後進原故事卡，最後確認才啟動原Game $100／300秒。設定包含原音效／試聽、模式、續玩、匯入及有舊檔才可匯出；排行榜／支持作者清楚說明未開放，不連網、不付款或建立雲端。主頁對話框沿原inert／Tab圈，Escape／返回還原入口焦點，重新排版保留姓名與游標。橫向以1080單位及最少1920寬保持構圖、超寬擴右留白，4:3平板保留16:9置中；直向提供可點備用排列／橫向建議。safe-area及視口量測不改牌桌owner，主要選單至少44px。

重要檔：src/home-view.mjs、app.mjs、styles.css、public/art/home-b及assets.json；build／pages／prepare-github腳本、tests/home.test.mjs、challenge-app及封裝測試；全快取0.9.0。22個其他mjs本文與已發布0.8.0快照一致（僅query快取版本差異），原十張runtime PNG不改。規格／UI審核見docs/HOME_SCREEN_090.md，驗證／SHA見HOME_SCREEN_VALIDATION.json。

最終npm run verify通過288規則／元件／事件替身＋3單檔，verify:pages通過6，共297；新增16主頁／事件流程，保留500次混合五分鐘與10,000局回歸。主頁／四對話框實際renderer HTML解析平衡，browser_smoke只Python語法。12張PNG／24 runtime根與docs一致，無手圖。單檔dist/charity-casino-prototype.html 29,856,799 bytes，SHA256 78908d3a9894d36385a8f334bbd47512d797f5b1fcff9482cbd3314278776e10，manifest同步。

沒有真瀏覽器／Safari／觸控／安全區／軟鍵盤或音訊硬體證據；目前預覽圖不是新實裝截圖，勿混稱。遵守HTTP／Chromium IPC停止重試，未重試。未另行發布GitHub／Pages，最後已發布仍0.8.0 commit28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65；dist/github-upload及zip為歷史包。下一最安全工作：iPad Safari核對主頁四入口、橫向／4:3、開始／續玩、鍵盤焦點及試聽；使用者要求發布時才發0.9.0，不自行開始排行榜。

## 最新：改名五分鐘賭神／港式電影感Logo預覽v2，待確認（2026-11-03）

使用者已確定新遊戲名「五分鐘賭神」，要求刪除「$100開局，五分鐘決勝」及重新設計Logo，參考香港《賭神》《賭俠》《賭聖》的電影片名字體氣勢。延續上一輪先確認才實裝限制，本次只新增docs/previews/home-landscape-v2/及文件，不替換正式主頁或部署，正式0.8.0維持。

image_gen產出原創金色書法／酒紅立體邊緣的透明Logo（2172×724 RGBA），完整五字「五分鐘賭神」，沒有貼上／描摹電影原Logo。logo.png為原始副本，透明alpha及SHA吻合；SVG以contain／viewBox放進原留白，未修PNG像素。保留v1背景人物／四入口，刪底部指定文案及舊重複「五分鐘挑戰」小標。提供1440×480獨立Logo展示、1920×1080／844×390／667×375主頁PNG／SVG及切換HTML，來源／prompt／幾何見該目錄assets、logo-layout、validation及README。

驗證：4份展示PNG解碼／尺寸、SVG XML、預覽JS／generator語法、必需名稱及文字移除、12個主按鍵至少50px／界內、Logo原始SHA及真alpha、背景SHA通過；95份正式檔與事前SHA一致。已目視五字、無遮臉及四選項；未做OCR／瀏覽器／Safari／觸控／實際小螢幕細筆辨識，不以舊281項當新設計證據。未接排行榜或支持付款。

下一最安全任務：待使用者確認新Logo與主頁v2，得到明確確認後才統一正式遊戲名稱並替換原主頁／真DOM接線／實機驗證。不自行部署或開發Cloudflare。

## 最新：橫向開始主頁v1僅設計預覽，等待確認（2026-11-03）

使用者要求參照上載圖片設計橫向開始頁，四入口固定為「開始遊戲／賭神龍虎榜／設定／支持作者」，明確確認後才實裝並更換原主頁。本輪只新增docs/previews/home-landscape-v1/，沒有修改src／public／正式入口／Pages檔或部署。正式仍0.8.0、commit 28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65；上一輪發布授權不表示可以發布這次尚未確認的預覽。

設計：左側港漫三人主視覺／金色標題與維港，右側四個直排立體牌匾；金色開始、酒紅排行榜、翠綠設定、墨綠支持。image_gen以既有promotion-hk-manhua-v5角色方向重構無字背景，精確中文字／按鈕另用SVG排版，不複製上載遊戲角色或石塊。提供1920×1080、844×390、667×375的PNG／SVG與切換HTML（用途提示，非遊戲接線）。source／prompt／分層／SHA／幾何及UI暫評見該目錄assets.json、art-prompt.md、layout.json、validation.json及README。

驗證：3張PNG解碼及尺寸、SVG XML／四個正確標籤、12個按鍵皆在界內且至少50px高、原始插畫副本SHA、預覽JS／generator語法通過；95個正式來源／素材／發布檔與事前SHA一致。已目視輸出確認標題不遮臉、四按鈕可見；最小標籤20.1px、輔助14.2px，純配色對比最低4.67。未執行瀏覽器／Safari／觸控，未以舊281項充當預覽驗證。排行榜／設定／支持作者只入口設計，沒有後端、付款或外連；設定內容／支持連結未定。iPad4:3及直向未設計。

下一最安全任務：讓使用者確認構圖／按鈕比例，得到明確確認後才接入原首頁流程、實作真DOM／安全區與補比例驗證；不得自行更換原主頁、部署或開始Cloudflare排行榜。

## 最新：0.8.0已發布GitHub及Pages成功（2026-11-02）

使用者於本機交付後要求「將新版發佈到GitHub」，已授權更新原jacobmaster-97/charity-casino main及既有Pages，先前本機不發布的邊界已解除。以0.7.1的690c6f02aaa194431fb7c263061d3ad17ee574d0為parent及expected_sha，非force更新main成功。新版commit 28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65，tree 6fef4ace76b4df0f75c93dec4db10703f0fb61bf；192份發布檔案Git blob SHA核對一致，67檔變更，26份PNG副本未改且無手圖。完整npm run verify與prepare:github通過281項，未改遊戲玩法；發布腳本補收LOCAL_FIVE_MINUTE_VALIDATION.json。

Pages run41479517386 completed/success，head_sha與新版commit一致。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.8.0 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65 。收據docs/LOCAL_FIVE_MINUTE_RELEASE.json及dist發布metadata已更新；發布後收據與本地交接不另部署。dist/github-upload現為本輪0.8.0發布快照，舊zip仍是歷史版本，不當新包。需要回退時可回0.7.1 base commit整體版本，不清玩家保存。

未建立Cloudflare、Supabase、排行榜或API。Safari、真DOM比例／整頁捲動、觸控、鍵盤、聲效硬體及原生背景仍UNVERIFIED；Pages部署成功不是實機證據，亦未直接HTTP核對公開Pages內容。下一最安全任務是iPad Safari實機核對05:00／$100、暫停恢復及到時收尾；不得自行開始排行榜。下方本機開發段落為發布前歷史。

## 最新：0.8.0本機五分鐘挑戰已實裝及封裝，階段一停止（2026-11-02）

使用者本輪正式要求執行第一階段，取代下方「只整理提示詞」狀態。本機入口每次$100／有效300秒，以最終資金為目標，不再以$25,000,000通關。購物、大廳、思考、下注及動畫照計；手動或背景／失焦暫停同時凍結總及行動餘秒，回前景需按繼續。Game為唯一計時／資金／派彩owner；到時禁止新輸入及新局，按原超時預設收尾已下注局，保留動畫並只結算一次。全押可用0等派彩後再判破產。

結果含名稱、最終資金、五桌局數及淨贏取（派彩＋保本退款－投注，含負數），購物支出另列。cash.mjs以整數美分及Number／BigInt精確處理五桌、AI籌碼、邊池、成本、顯示與JSON，沒有新增達標上限。新schema2／five-minute-v1用獨立charity-casino-five-minute-v2槽，保留舊schema1及匯出；舊資產不能匯入，恢復不補滿五分鐘。保留完成局checkpoint策略，最終結束亦保存；不新增局中持久快照，重整回最後完成局。引擎預設legacy相容供既有回歸，網頁明確Game({challenge:true})，不能漏此旗標。

重要檔案：src/cash.mjs、challenge.mjs、game.mjs、storage.mjs、app.mjs、五桌金額／視圖與styles.css；tests/challenge.test.mjs、challenge-app.test.mjs；封裝腳本及Pages測試。細節與裝置缺口見docs/LOCAL_FIVE_MINUTE_080.md，最終檢查／SHA見docs/LOCAL_FIVE_MINUTE_VALIDATION.json。既有美術及聲效保留，十張runtime PNG與0.7.1快照及封裝一致、無手圖。

驗證：npm run verify通過272項規則／元件／app事件替身＋3單檔；npm run verify:pages通過6項，共281項。含500次混合五分鐘流程、既有10,000局模擬、超大德州實際牌局／JSON及五款renderer。Python browser_smoke語法及首頁／大廳／商店／五行結果HTML解析通過；這些不是瀏覽器證據。Safari、觸控、原生背景／BFCache、音訊硬體、鍵盤、安全區及實際比例／整頁不捲動仍UNVERIFIED；未重試既知HTTP／Chromium IPC失敗路徑。

交付：dist/charity-casino-prototype.html（23,647,638 bytes；SHA256 58d170b64eb72eab0555b53230c588c15093afaf178c0c12a9b2a299b699a636）及本機docs/index.html／docs/play，23 runtime同步，dist/manifest.json已更新並保留早期發布metadata。未上傳GitHub或部署Pages，遠端仍0.7.1；dist/github-upload是歷史0.7.1快照，github-upload.zip為0.1.2、另一舊zip為0.1.0，不能誤當本輪新包。未建立Cloudflare／Supabase／排行榜／API。依使用者要求階段一完成後停止；下一最安全任務僅為Safari實機核對本機版本，不自行開始提示詞二或發布。

## 最新：已整理兩階段開發提示詞，先本機後排行榜（2026-11-02，香港）

使用者要求現階段整理提示詞，本機遊戲開發完成後才做排行榜。已新增docs/DEVELOPMENT_PROMPTS.md，含兩份可直接使用的提示詞：一、先完成本機$100／有效五分鐘、購物大廳照計、手動／背景停錶、到時自動收尾及五桌／保存／介面回歸；二、本機完成後才接Cloudflare Workers＋D1，只完場上傳名稱金額及基本防護，不接管牌局或暫存驗證。

本輪僅寫提示詞，不代表立即執行其中開發或部署。保留只做基本防護的最新選擇；同名非唯一、每身分最佳／每局一筆仍需釐清，不擅自當定案。正式仍0.7.1，未改runtime／雲端、未跑遊戲測試。下一最安全任務：使用提示詞一完成本機五分鐘挑戰；不得提前接排行榜。


## 最新：Cloudflare精簡排行榜已選基本防護（2026-11-02，香港）

使用者明確選「只上傳名稱金額，接受基本防護」。五分鐘、下注、暫停與派彩均本機處理，完場才發收分請求；不採提案的全程後端或短暫牌局狀態驗證，不保存遊玩流水。只做名稱／金額格式與精度、安全顯示、參數化SQL、限流及同一完場重試去重，不承諾可驗證合法贏款或阻止所有改分。不要再把短暫驗證當待批准需求。

玩法仍為$100起步、有效300秒最高期末資金；購物／大廳照計，手動或切背景停，回前景按繼續保留原總／行動餘秒；到時自動收尾已下注局，結算後破產提早結束。匿名免註冊。同名非唯一身分，每人最佳／每局一筆、去重技術ID、金額精度與逐桌收尾待細化，不用姓名直接覆寫。

已更新docs/FIVE_MINUTE_LEADERBOARD_PLAN.md及LEADERBOARD_ANTICHEAT_OPTIONS.md（原伺服器驗證僅保留為未採用參考），GAME_BRIEF亦同步。正式仍0.7.1，本輪只文件，未建Cloudflare／改runtime／部署／執行測試；舊256項不是新機制證據。下一最安全任務：完成本機五分鐘規格及精簡上傳／查榜API合約，再實作。


## 最新：0.7.1牌型／公共牌位置及主畫面整屏已發布（2026-11-02）

使用者三點回饋：橫向補牌型、公共牌／彩池上移置中且不碰對手、主畫面不用捲動。已恢復自己原框內14px牌型，等待／棄牌亦有提示；公共牌整組量測上三對手的框／底牌／投注足跡後留8px，自己手牌前留10px，偏上置中並在短高度收容。原13飛行目標、勝出金框、牌局／聲效／保存不改。

第3點已提問但尚無回覆，按已說明假設同時處理首頁、大廳、牌桌。首頁分欄及收合存檔音效；大廳圖片與五個入座鍵1672:941同場景縮放，HUD及底列保留；故事卡短橫屏兩欄。快取0.7.1，PNG不改。新增3德州位置／牌型及2大廳比例檢查；256項（247元件＋3封裝＋6 Pages）完整驗收通過。模板一次性解析通過，browser_smoke只語法；Safari／真DOM／觸控／鍵盤仍UNVERIFIED，勿重試舊HTTP／IPC。詳docs/POKER_READABILITY_071.md。已由前版guarded ref發布main 690c6f02aaa194431fb7c263061d3ad17ee574d0，tree c31d14957fd27d3c7d7c0112340b0637dcd332b6；Pages run41389811878 completed/success。180發布檔SHA一致、49檔變更、26份PNG副本不改且無手圖。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.7.1 。發布後POKER_READABILITY_RELEASE.json與本地交接不另部署；可回該commit整體回退，不清保存。下一步：Safari橫屏核對牌型、對手間距及主畫面無整頁捲動。


## 最新：0.7.0德州手機無頭像圍桌版已發布（2026-11-02）

使用者「可實裝畫面」批准v2，先前只預覽限制已解除。橫向手機上三＋左右二名對手、中央公共牌／彩池、下方自己手牌；沒有人物／字母頭像。主列更多／棄牌／跟注或過牌／加注／全押；總額輸入及五色快捷籌碼搬入原生TablePanels面板，確認才扣款，取消不扣款／不暫停。原13籌碼飛行目標、發牌／音效、六人規則、30秒、AI、道具、勝出對手金框與schema1完成手保存保留。旋轉profile亦獨立追蹤；換回合清面板，防止陳舊操作；一般桌面／直向保持。快取0.7.0，無PNG更換。

新增12手機流程＋2面板檢查；完整251項已通過（242元件／規則＋3封裝＋6 Pages）。browser_smoke補無頭像／六席／44px／面板／暫停路徑，只語法驗證；Safari、真DOM、鍵盤、安全區與長金額仍UNVERIFIED，勿重試舊HTTP／IPC。詳docs/POKER_MOBILE_070.md。回退MOBILE_POKER_ENABLED=false並重封裝，不清保存。已由前版guarded ref發布main 58b6be2114e0bef5002637b40c8d0450742be7b5，tree 2f16a8a5545df348a2a1bd08a158130d35c3b786；Pages run41384534881 completed/success。178發布檔SHA一致、50檔變更、26份PNG副本不改且無手圖。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.7.0 。發布後POKER_MOBILE_RELEASE.json與本地交接不另部署。下一最安全工作：Safari橫屏實機核對加注鍵盤、旋轉及小對手牌。


## 最新：德州橫向預覽v2移除角色圖示（2026-11-02）

使用者修正不需角色圖示，已重製docs/previews/poker-mobile-around-table-v2/：對手與自己所有頭像移除，改置中姓名／餘額，玩家僅文字「你」；無替代人物字母徽章。六人圍桌、公共牌／手牌、D位置標記、底部動作及加注面板保持。三圖SVG／PNG及HTML更新；無頭像引用、23主控／6頂欄幾何與53正式檔SHA不變通過。只預覽，仍需使用者確認後才實裝，正式0.6.3未改／未部署，Safari仍UNVERIFIED。下一步等使用者確認v2，不可因移除頭像就自行接入正式遊戲。


## 最新：德州手機橫向圍桌預覽，等待確認（2026-11-02）

使用者要求參考上載撲克介面重新設計，明確「確認後才實裝」並補充需橫向。只新增docs/previews/poker-mobile-around-table-v1/：844×390與667×375的六人圍桌PNG／SVG、加注面板預覽、切換HTML與生成器。上三＋左右二名對手、公共牌置中、自己靠下；底部更多／棄牌／跟注或過牌／加注／全押，加注金額與五色快捷值收臨時面板。沿現有枱布／卡牌／籌碼，頭像為大廳人物PNG暫定裁切，無新正式人物系統。

3圖解碼／XML與幾何通過，23個主控至少44px、6頂欄按鍵35.2px沿已指定例外；53份正式檔SHA不變。未跑瀏覽器／Safari，沒有實裝或部署，正式仍0.6.3；工具列、鍵盤／加注倒數、其他狀態與長金額仍UNVERIFIED。不得將此提案當已批准，下一步等使用者確認橫向布局與加注面板，才接現有Game／六人／30秒／ChipFlights／保存，不自行新增玩法或勝出對手文字。詳該預覽README及validation.json。


## 最新：0.6.3籌碼文字與盤面分色已發布（2026-11-01）

使用者要求完全區分籌碼與盤面字色。盤面暖金保持；共用chipFace面額用深藍字／冰白底／青藍框，SVG大小及百家樂合計額改亮青藍字／深藍牌／青藍框，輪盤合計額用亮青藍＋深藍描邊。五色外圈、面額資料、籌碼落點／飛行／混色堆疊及0.6.2盤面固定不改。CSS與SVG顯示層，無新PNG或遊戲資料變更，快取0.6.3。純色對比12.37:1／12.64:1；原237項（含封裝／Pages）通過。browser_smoke.py新增實際色值區別但只語法驗證；Safari／實機小字仍UNVERIFIED，不重試IPC／HTTP。詳docs/WAGER_COLORS_063.md。前版main1870fb4bc2e7d2be2f0395ac41bb537ec296dbde；已發布main 7f36d66ef73c426c4ff6d85309739ba42a2f59c4，tree 4d91a5a4ffaf4f974a8f105660a6ae7fafeefbcb，Pages run41314949072 completed/success。175檔SHA一致、46檔變更、26份PNG副本不改與手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.3 。發布後本地WAGER_COLORS_RELEASE.json與交接不另部署。


## 最新：0.6.2投注文字固定已發布（2026-11-01）

使用者要求大小／輪盤格名、數字與賠率不因籌碼而移位。已移除輪盤has-bet的translateX及模板--rou-text-shift，文字transform／transition設none；大小原無同類移位，補同樣固定文字限制，不影響骰面原幾何。籌碼飛行／堆疊／金額／投注高亮保持，百家樂不套用。頂欄及小窗沿0.6.1。快取更新0.6.2，規則／保存／聲效／PNG不改。237項既有檢查（含封裝及Pages）通過，browser_smoke.py新增真文字矩形前後比對但只語法通過；未實機或瀏覽器驗證，停用IPC／HTTP路徑保持。詳docs/FIXED_BET_LABELS_062.md。前版main7609a9725dccc5569ba38e65d3d11b5c4c2e7b03；已發布main 1870fb4bc2e7d2be2f0395ac41bb537ec296dbde，tree 6ac4aef39fa3cd1cd7b26e256c3e86c5a416c1bc，Pages run41313768889 completed/success。173檔SHA一致、46檔變更、26份PNG副本不改及手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.2 。發布後本地FIXED_BET_LABELS_RELEASE.json及交接只作收據，不另部署。


## 最新：0.6.1手機頂欄／彈窗尺寸已發布（2026-11-01）

使用者要求頂欄縮矮20%並配合文字、動畫小窗放大20%。只改手機三桌CSS：頂欄44→35.2px，標題16／資金14.4／其他14px；搖骰及輪盤小窗transform1.2，未縮放寬高先反向限制，保持安全區與螢幕邊界。遮罩上沿跟新頂欄高度，底部控制不縮。Game／計時／保存／動畫原進度不改，所有快取0.6.1。237項既有檢查（含封裝及Pages）全部通過。browser_smoke.py新增真DOM比例檢查但只語法通過，Safari／觸控／實際矩形未驗證，不重試舊IPC／HTTP。35.2px頂欄低於一般44px為使用者明確要求取捨，不需再確認。詳docs/MOBILE_TABLES_061.md。前版main4d57dee90b2aa8e6f092fb9fb214bc3868f6f315；已發布main 7609a9725dccc5569ba38e65d3d11b5c4c2e7b03，tree fcba94240f2d7903c79ea00eeca6a5c085d08669，Pages run41312983501 completed/success。171發布檔SHA一致、46檔變更、26份PNG副本不改與手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.1 。發布後本地MOBILE_SIZING_RELEASE.json及交接只作收據，不另部署。宣傳圖v5另留預覽，本輪不換圖或部署宣傳素材。


## 最新：港漫宣傳圖v5女性曲線調整（2026-11-01）

使用者要求增添兩位女性角色身材曲線；已以image_gen在v4基礎調整成年女性腰臀輪廓與合身皮褸剪裁，保留前方男主角、港漫筆觸、三角構圖、無文字及16:9。交付docs/previews/promotion-hk-manhua-v5/charity-casino-manhua-1920x1080.png，尺寸／PNG解碼通過，來源SHA記assets.json，原始生成圖保留。只改宣傳圖預覽，正式遊戲未改／未部署。下一步待使用者確認人物比例。


## 最新：港漫宣傳圖v4後方兩人改為女性（2026-11-01）

使用者要求後方兩名人物改為女性；已用image_gen將v3兩位站姿男子改成兩位成年女性，左短髮紅皮褸持籌碼、右長髮酒紅皮褸持牌。保留前方坐姿男主角、港漫筆觸、三角構圖、維港、三骰盅、輪盤、五色籌碼及無文字。交付docs/previews/promotion-hk-manhua-v4/charity-casino-manhua-1920x1080.png，尺寸及PNG解碼通過；原始生成圖留存，assets.json記SHA。只修改宣傳圖預覽，正式遊戲未變／未部署。下一步待使用者確認此人物版本。


## 最新：人物改為港式漫畫宣傳圖v3（2026-11-01）

使用者上載三張經典港產賭片海報要求替換三位人物與構圖，先生成前坐姿主角＋後方兩名紅皮褸男性的三角海報v2，後再指示以《龍虎門》《中華英雄》《風雲》等港漫繪畫人物。已用image_gen重繪為粗墨線／硬朗成人五官／重黑明暗及排線的原創三男，保留港景、三骰盅、輪盤與籌碼。最新交付docs/previews/promotion-hk-manhua-v3/charity-casino-manhua-1920x1080.png，維持無文字16:9；尺寸及PNG解碼通過，原圖留存，來源SHA記assets.json。屬宣傳圖預覽，不更換正式遊戲人物、玩法或部署。下一步等待使用者評閱畫風，不自行加文字。


## 最新：無文字港式宣傳圖（2026-11-01）

依使用者要求製作16:9無文字宣傳圖，沿用B港式賭片卡通大廳作風格參考，image_gen原創人物／豪華樓梯／翠綠枱布／三骰骰盅／輪盤／五色籌碼。交付docs/previews/promotion-hk-v1/charity-casino-promo-1920x1080.png，1920×1080尺寸及PNG解碼通過；raw-generated.png留原始生成圖，assets.json記來源與SHA。未加入文字、未更換正式素材、未部署，遊戲仍0.6.0。下一步由使用者決定是否調整構圖或後續加標題，不自行加入字樣。


## 最新：0.6.0手機三桌已發布（2026-11-01）

使用者已直接授權實裝大小／百家樂手機版，並改手機輪盤為鎖注後轉輪小窗。完成：大小移出sicbo-view.mjs而保持正式50格；手機大小／輪盤下注時無常駐動畫區，鎖注／有注到期依原Game進度開窗，重擲／重轉10秒仍在窗內。結果只讀停留1400ms或按回盤面，保留原唯一派彩／保存。百家樂手機一體32:68，卡牌按容器量尺寸、換牌／咪牌與旁注保持。合併頂列，更多原生dialog搬原控制，窄版分行且主按鍵44px；一般桌面／平板保留原大小上下／輪盤6:4，21點／德州不套新樣式。

237項檢查已通過（原223＋11手機流程＋3更多dialog），含原10,000局模擬、聲效24與封裝／Pages；23MB單檔與根／docs 21runtime同步，10張PNG不改、無手圖。browser_smoke.py補四小橫向尺寸及真小窗／暫停／更多路徑，僅Python語法檢查；未用瀏覽器或Safari，不重試舊HTTP／IPC。小格、極短高度、鍵盤、安全區、實機觸控／旋轉及聲效仍UNVERIFIED。詳docs/MOBILE_TABLES_060.md。回退首選MOBILE_TABLES_ENABLED=false＋更新快取封裝，勿清保存。發布前版main90b2f88f55ac09f3efa79e306f365b2bdb86adad，準備從該版以guarded ref發布；已發布main 4d57dee90b2aa8e6f092fb9fb214bc3868f6f315，tree 1e282a937219146134e218a50e1eab2a6c69d46f；Pages run41224588739 completed/success。169發布檔SHA一致、55檔變更、26份PNG副本不改及手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.0 。發布後MOBILE_TABLES_RELEASE.json與本地交接只作收據，不另部署。


## 最新：大小搖骰GIF預覽（2026-10-31）

使用者要求GIF，已新增docs/previews/sicbo-mobile-modal-v2/sicbo-lock-shake-reveal.gif、render-gif.mjs、gif-timeline.json及gif-validation.json。1266×585、69幀、8秒循環、約3.13MB；盤面→鎖注→小窗搖骰→揭盅2／3／4→收窗→盤面小區金框及示意+$50。此為正式素材的離線SVG動畫分鏡，不是瀏覽器遊戲實錄，GIF無聲；實機／動畫時序／錢包／保存未接線。全部幀解碼及52份正式檔SHA不變通過，關鍵幀已查看；正式0.5.1未改／未部署，待使用者確認後才實裝。

## 最新：大小橫向改為鎖注後骰盅彈窗預覽（2026-10-31）

使用者否決大小v1過密五列，要求下注後小窗搖骰。本輪只更新獨立docs/previews/sicbo-mobile-modal-v2/，原50格正式boardMarkup直接重用，取消常駐骰盅及工具列，改44px單操作列＋更多。投注容器760×273、比v1面積約增107%；另有368×256搖骰／揭盅窗及自帶素材的離線HTML動效展示。尚未實裝／部署，正式0.5.1保持，其他四桌預覽不改。52份正式檔SHA不變、3張SVG／PNG、50投注格、11主控幾何及預覽JS語法通過；HTML動畫／Safari／實機未驗證。下一步待使用者確認v2，才接鎖注（含倒數）、空注跳過、暫停／重擲10秒及回盤面派彩；不可因自動關窗跳過重擲，展示不得重抽或另存。詳預覽README及validation.json。

## 最新：手機橫向布局僅預覽（2026-10-31）

使用者要求五桌手機橫向比例調適，隨後指示「先讓我預覽」。本輪僅製作docs/previews/mobile-landscape-v1/獨立SVG／PNG／切換HTML與生成器，沒有修改或發布正式遊戲，正式版維持0.5.1。844×390可視範圍（不含瀏覽器工具列），主按鍵44px；百家樂與21點一體、大小分區、德州五對手同列、輪盤左462右308即6:4。沿用正式PNG及卡牌／籌碼／輪盤渲染器。大小五列50格為待確認緊湊重排提案，不能當已批准盤面。

52份src／public／index／package SHA一致，5張SVG/XML與PNG解碼通過，65個主控矩形44px及安全區幾何通過，人工查看五張輸出；不是瀏覽器／Safari／手機通過。密集投注格不足44px，須配放大／精準；其他尺寸、長金額、咪牌／結算／多手狀態及實機觸控仍UNVERIFIED。詳該目錄README與validation.json。下一步等待使用者確認比例與大小緊湊盤面，才修改正式CSS／模板及實機檢查，暫不部署。

## 目標與目前狀態

《賭王慈善大賽》：$100起步、手上資金$25,000,000勝利、歸零失敗，計有效遊玩時間；B港式賭片美術，電腦／手機／平板。大小、百家樂、21點、德州撲克及輪盤五桌原型均已接入。

使用者在iPad Safari實測0.5.0完全無聲，iPadOS版本未提供。本輪0.5.1修正確定程式缺口：首個resume若pending，後續手勢會被舊pending擋住；替身重現先失敗（resume只有1次，預期2），修正後通過。加入touchend、手勢內單樣本靜音primer／resume先於PCM、可用時playback session，主頁／暫停選單新增「啟動並試聽」，保留遊戲及偏好資料。0.5.1已發布：main 90b2f88f55ac09f3efa79e306f365b2bdb86adad，tree 46c4dc587ee8ef379a8b0bbbdf709949ac1344e1，Pages run41166135901 completed/success。223項檢查通過，164個發布檔SHA全部一致，49檔變更，26份PNG副本不改、手圖不存在。遊玩 https://jacobmaster-97.github.io/charity-casino/?v=0.5.1 。修正版實際iPad輸出仍需確認，不能當已證實唯一根因；收據docs/IPAD_AUDIO_RELEASE.json與發布後本地交接不另部署。前版0.5.0 main 6ad8a33c27222314a2eefcbed22f7fc08886fba5供比對。

## 0.5.1本輪完成

- sound.mjs每次未running的有效手勢重試native resume，舊Promise不得清新pending；靜音primer不永久循環，先native啟動再PCM合成。AudioSession playback功能偵測及try/catch，不支援也能走原Web Audio。
- app加touchend捕捉及選單「啟動並試聽」，可在home／pause明確開啟並試播一個籌碼聲；不恢復Game倒數。背景／blur／pagehide與靜音取消播放及尚未完成的試聽；回牌局清掉試聽，普通短聲不補播。
- 223項通過（聲效24，新增6項及調整pending併發測試），含原10,000局模擬與封裝／Pages；20個runtime、10張PNG不改，無手圖，資料格式及玩法不變。browser_smoke.py補試聽入口，只Python語法通過。
- 未使用Safari／iPad實機，工具清單無瀏覽器能力，遵守舊HTTP／Chromium IPC停用紀錄。下一個最安全任務為使用者開0.5.1，在前景按「啟動並試聽」，確認是否有籌碼聲，再玩一局。若仍無聲，蒐集iPadOS版本與實際試聽／系統音量／路由結果再定新假設，不盲目增加音量或重置資料。

## 0.5.0本輪完成

- src/sound.mjs：原創紙聲0.16s、籌碼0.23s、骰盅0.9s、開盅0.32s、輪盤4.8s，無錄音／下載／第三方依賴。獨立固定種子、柔化包絡、PCM peak0.34、master0.55、最多四音源及35ms重複合併，不消耗Game亂數。
- AudioContext懶建立，pointerdown／click／keydown嘗試解鎖，支援webkit前綴；被拒絕／無API安靜降級。主頁／暫停菜單44px靜音、獨立sound-muted-v1設定，不改存檔槽；牌桌HUD保持。
- Game可選onCue／防例外cue只通知真實發牌／揭盅，Blackjack／Poker配合出牌；ChipFlights onLand自然落枱一次，減少動態即響、提早鎖注landAll落定響一次、清除／重排取消不響。聲音不更改資金、道具、結果或checkpoint。
- CasinoSound.sync只讀Game.phase／remaining。暫停、背景、pagehide、離桌／商店清理聲音；短聲不補播，長聲從原offset繼續。render不重播，系統interrupted先斷開再以當下狀態恢復，手動mute歸零master。
- 217項通過：原199＋18聲效PCM／AudioContext替身／真實事件測試，含懶啟動、偏好隔離、loop offset、voice上限、背景與中斷、失敗降級、callback安全、三桌發牌／開盅及chip生命週期。原10,000局資金模擬保持；20個runtime、10張PNG不改、無手圖、單檔及雙Pages同步。
- browser_smoke.py補主頁靜音／重載、暫停內控制，Python語法通過但未執行；Safari／iOS解鎖、靜音鍵、路由、實際音質／音量／效能仍UNVERIFIED，不重試舊IPC路線。詳docs/SOUND_EFFECTS.md。

## 0.4.1本輪完成

- src/roulette-view.mjs只加roulette-layout容器；styles.css具名3fr／2fr、左下注與控制／右轉輪及原資訊，導覽在兩欄外。窄版控制分行，主要動作44px，沒有自動改回上下，其他桌不套此比例。
- 使用原fitRouletteSurface量左欄、同50格座標與ChipFlights落點；轉輪等比例填右欄，暫停仍用原remaining／負delay。Game／storage及PNG不改（runtime只更新快取版本）。
- 199項規則／保存／模板／DOM替身／幾何／封裝／Pages回歸通過，原10,000局模擬保持。browser_smoke.py加實際左／右、同高及60%寬度檢查，Python語法通過但未執行，Safari／手機／比例實機仍UNVERIFIED，不重試舊IPC路線。下一步實機看左右比例、窄版按鈕及右輪大小。

## 0.4.0本輪完成

- 美式38格0／00／1–36、正確美式輪序及18紅18黑2綠；50種獨立投注（38單號、3十二數、3直列、6外圍），淨35／2／1，0／00不屬任何六外圍，無邊線／交點。
- 30秒下注、提早鎖注及空注跳過；五色隨資金大額籌碼、自訂／合法全押、多注、清除／逐項移除。一般最低$1、低於$1可全押；鎖注才扣，最終結算派彩及保本後判達標／歸零，整局只保存一次。
- 三道具全局一件，無免費配給。透視先固定結果，從其餘37無放回排除五號，原倒數內可改下注。保本按全部投注合計淨虧損退50%取整。重轉沿原reroll庫存，商店標重擲／重轉券；須鎖注前先扣，開獎後10秒接受／超時接受／重轉一次，重抽完整38格可同號、原注不改。
- 上轉輪／下完整枱面與底部控制，B枱布及正式五色PNG不改。輪盤／小球與投注格為原創實際SVG遊戲渲染。寬版12×3、窄高3×12，兩版50格，沿同一rouletteCells定位印刷與HTML籌碼層；放大／原生精準選單供小格。已開號及已派注框、排除號虛線刪線／輔助閱讀。
- 4.8秒輪／球反方向多圈減速，最終相對角對應同一美式輪序號碼。Game保留from／to與remaining，視圖負delay／paused恢復同進度，背景遮桌停表照舊。數值、比例與SVG為工程預設可調，未加未定快速模式或號碼紀錄。
- Game唯一錢包／庫存／時間／checkpoint。新roulette.mjs純規則／資料／角度／幾何，roulette-game.mjs方法接Game，roulette-view.mjs正式視圖。round id拒絕空注超時後的舊按鈕。schema1無新必要欄位，兩副牌靴／AI桌面／背包／舊檔保留；輪盤只保存最終完成局。
- 199項檢查：原172＋27項輪盤，包括50注×38結果、零號／合計保本、亂數排除、三道具／預扣重轉／同號／超時、暫停／舊按鈕／達標破產／唯一保存、舊檔及三份跨桌狀態、美式輪球末角、兩版50格不重疊／模板／DOM飛行／混色／尺寸與2,000局守恆；連同原百家樂4,000／21點2,000／德州2,000共10,000局模擬。
- root／docs及單檔同步19個runtime，10張PNG不改，手圖不存在。browser_smoke.py補桌面輪盤下注／轉動暫停／結果／匯出及七視口精準下注／放大，Python語法通過但未執行；不重試已知HTTP／Chromium IPC失敗路線。

## 已確認框架，不可遺失

- 共通：實際貼圖、底部操作、白紅藍綠紫五色籌碼、隨資金大額操作、自訂／合法全押、飛入混色堆疊與金額、暫停遮桌及停表。百家樂與21點一體賭枱，大小分開上骰盅／下盤面；德州採六人桌獨立層次與同枱布，不強制35／65。
- 大小50種投注；圍骰大小皆輸而其他合資格注照派。重擲／接受／超時都扣持有券。
- 百家樂八副連續牌靴、天牌及標準補牌。主注莊／閒／和最多一項，改押搬原額；旁注獨立複選或單押且保留籌碼。莊0.95、閒1、和8，和局莊閒退本金；莊淨贏按95%向下取整美分。
- 莊對／閒對按首兩張牌階11:1，J＋Q不算，第三張不補成對。幸運六須莊6勝、兩牌12／三牌20，和／輸不派，旁注無佣金。換牌後按最後起手兩張判對子及最終勝負判六，保本按全局合計淨虧損退50%一次。鎖注後百家樂不能加注。
- 百家樂發牌571.4286ms，咪牌delivering→squeezing→unfolding700ms→returning700ms，放手保留／直接揭牌／鍵盤／暫停。所押莊閒及幸運六關聯莊方補牌，先閒後莊；只押對子或和自動揭示。手圖按使用者要求已刪，不能恢復。
- 百家樂下注30秒、啟用換牌後選擇10秒，換後重判天牌／補牌；透視不重置時限／改牌序，少於60張下局重洗，無開靴燒牌。21點少於104張下局重洗、無燒牌、空注不耗牌，本輪預設可調校。
- 無免費道具，每件購買前資金10%，每局最多一件；保本／透視共用五桌，重擲限大小／輪盤用作重轉、換牌限百家樂、21點及德州。一般最低每次$1，0<資金<$1可全押，最終結算後判達標／歸零。21點保險可至一美分，所有3:2／半注不足一美分向下取整。
- schema1及原保存槽保持，只保存完成局，牌靴可選全序／cursor／cycle，舊檔缺swap補0；自由手動槽、競速自動槽、模式分開。關閉／重整回最後完成局，未完成局作廢，接受重試、不宣稱防回溯或局中持久保存。
- 暫停／背景／離線／商店停表，回來按繼續，保留原局／剩餘時間。原生工具dialog不自行停表，真正暫停時先關閉dialog防遮住遮桌畫面。
- 無帳號、雲端、支付、排行榜或額外樓層；中央豪華樓梯不是商店。不改德州6人NL／AI資金20%–120%、輪盤美式38格。

- 輪盤0／00分開，美式38格，50種單號／十二數／直列／六外圍，無邊線／交點；淨35／2／1賠率，零號令外圍等額注全輸。透視鎖注前排除五個不出號，結果固定、下注可改；重轉券須鎖注前啟用即扣，首次開獎後10秒接受或從完整38重轉一次（可同號），超時接受，不可疊道具。沿既有reroll共用庫存，不套大小持券自動分支。
- 德州勝出框只改電腦真正主／邊池得主為金色，平分全部標、退款不標、下一手清；不得重新加回使用者取消的可見得主／牌型文字或額外結束modal資訊。

## 重要檔案與發布

- 聲效：src/sound.mjs、tests/sound.test.mjs（24項）、docs/SOUND_EFFECTS.md；Game發cue、app啟動／sync、ChipFlights落枱通知。首選SOUND_ENABLED=false停聲，保持遊戲資料及偏好。

- docs/GAME_BRIEF.md、ROULETTE.md、ROULETTE_IMPLEMENTATION.md、TABLE_PRESENTATION.md及各桌詳規。新增src/roulette.mjs、roulette-game.mjs、roulette-view.mjs、tests/roulette.test.mjs（27項）；app／Game／board／rules及發布腳本最小接線，storage格式不改。
- scripts/package/pages/prepare產生單檔、Pages及上載清單，排除docs/previews。GitHub：https://github.com/jacobmaster-97/charity-casino ，main根目錄Pages。
- 輪盤停用首選ROULETTE_ENABLED=false、更新快取與封裝；保留最新保存器、pokerTable、兩牌靴及庫存，勿清玩家資料或重帶手圖。前版0.3.1 a0658db6f791524371ec26afd5be73244ddcfb9d供比對；收據docs/*_RELEASE.json。

## 風險與下一個最安全任務

Safari／手機／平板、觸控、旋轉、安全區、SVG transform球位、小格可讀性、精準面板／放大及主要按鈕可達性、持續效能與經濟仍UNVERIFIED；程式通過不是裝置視覺證據。下一步先實機五桌整合回測，輪盤重點為精準下注、轉動暫停、重轉10秒、結算與跨桌保存。五桌只是可玩原型，不宣稱已達beta／正式版或平衡通過。

# DEBUG_HANDOFF

## 0.6.0：手機三桌實裝與驗證邊界（2026-11-01）

根因／對策：常駐大小骰盅及輪盤右欄壓縮手機投注空間，已依使用者新指示只在鎖注後用真Game狀態開窗。只讀MobileRoundReveal保留1400ms終局展示、暫停及旋轉生命週期；重擲／重轉10秒仍交由Game，空注不假開獎。較窄控制列分行、不靠縮字，百家樂32:68並改善第三張與換牌容器尺寸。native更多dialog需先還原整個工具列才另開明細，已補三項生命週期檢查。

封裝曾捕捉新大小視圖escape與app名稱重複，專有命名後完整重跑；沒有改玩法修這個打包問題。另確認暫停遮罩z10高於動態小窗z9，原生工具在動畫／暫停前關閉。11項手機流程檢查含空注、10秒重擲／重轉、唯讀／唯一保存、恢復進度、旋轉及破產Game停止計分後仍可結束展示，不依賴額外Game計時器。

既有HTTP／Chromium IPC路徑繼續停用，沒有實機或瀏覽器能力，故未宣稱Safari／觸控／實際排版通過。browser_smoke.py只語法檢查。小格需放大／精準，極短高度、安全區、鍵盤及多狀態仍UNVERIFIED，音訊硬體輸出仍沿0.5.1待使用者回報。發布前待完整檢查／根與docs同步及GitHub Pages新head驗證；詳MOBILE_TABLES_060.md。


## 最新：GIF僅離線輸出（2026-10-31）

本輪只將大小v2預覽輸出8秒GIF，32張離線SVG獨立畫面以Inkscape及ffmpeg轉成69幀；全部解碼、尺寸／循環及52正式檔SHA一致通過。無正式玩法修復、無瀏覽器或裝置驗證、無部署；既有IPC／HTTP停用限制保持。示意固定2／3／4與+$50不可誤認為Game或真實派彩測試。

## 最新：大小骰盅彈窗仍僅預覽（2026-10-31）

使用者要求擴大盤面，v2撤掉常駐骰盅與五列密排，直接沿用正式原50格SVG，鎖注後才在小窗搖骰。只新增docs/previews/sicbo-mobile-modal-v2/及交接文件；52正式檔SHA一致，3圖／11主控／JS語法及50格通過，沒有正式修復或部署。瀏覽器／動畫／Safari尚未驗證；維持既有HTTP／Chromium停用限制。待實裝時必須覆蓋空注、計時暫停／背景、重擲券10秒選擇、展示與唯一派彩保存契約。

## 最新：手機橫向預覽的驗證邊界（2026-10-31）

使用者先要求調適，後改為先預覽，因此未修改任何正式程式／PNG、未發布。獨立docs/previews/mobile-landscape-v1/靜態合成以Inkscape輸出；只有5張圖解碼、65個控制矩形及52份正式檔SHA檢查。骰面首次靜態輸出因巢狀SVG沒有明確clip而顯示整張atlas，已在預覽生成器補專屬clipPath並重新輸出／查看，正式渲染器不改。這是預覽問題，不是遊戲根因或新實機修復。

既有HTTP／Chromium IPC停用限制與Safari音訊UNVERIFIED保持；沒有重試。本輪不能宣稱手機橫向已修好：小格觸控、其他可視尺寸、工具列、安全區、旋轉、多手及結算狀態仍需正式實裝後驗證，等使用者先確認設計。

## 0.5.1：使用者iPad Safari完全無聲

現象：使用者實機回報沒有任何聲效，後確認Safari，iPadOS未提供。0.5.0沒有實機證據，不能將當時217項替身／PCM通過當Safari通過。

確定程式缺口／最小重現：首次AudioContext.resume永不settle，第二次有效手勢才允許running；0.5.0 unlock遇pending直接return，導致實際native resume仍1次，預期2。已先新增回歸測試失敗（/tmp/ipad-sound-red.log），改為未running即重試、舊操作完成不得清新pending後通過。此證實程式路徑，不證實為該iPad唯一根因。

本輪一次相容性切片：touchend capture、手勢內單樣本靜音source.start／native resume先於PCM；可用時navigator.audioSession.type=playback，拒絕／缺失非致命。主頁／暫停「啟動並試聽」明確啟用並播籌碼聲，選單sync不立即切掉手動試聽；進入牌局、靜音、hidden／blur／pagehide停止並取消pending試聽。Game、結果、存檔、原音量與PCM不改，沒有偷偷加大音量或清偏好。

驗證：聲效24／全套223通過，新增6項與pending併發更新，原10,000局守恆保持，20個runtime及10張PNG不改；browser_smoke.py只有Python語法通過。工具清單沒有Safari／browser能力，未重試舊IPC／HTTP失敗路線。修正版iPad硬體輸出、iPadOS差異、音量／路由／靜音開關仍UNVERIFIED，待使用者按0.5.1試聽確認。若同一路徑再次修後仍無聲，不再反覆改resume或放大音量；先取得iPadOS及試聽輸出／路由證據再定新假設。已發布main 90b2f88f55ac09f3efa79e306f365b2bdb86adad，Pages run41166135901 completed/success；164檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記IPAD_AUDIO_RELEASE.json，發布後本地交接不另部署；實機試聽仍待使用者確認。

## 0.5.0：五種聲效與音訊生命週期

使用者要求發牌、籌碼投注、骰盅轉動／開盅及輪盤轉動。原創程序PCM搭配單個懶AudioContext，Game僅發防例外cue、音訊只讀phase／remaining；首次操作解鎖、靜音獨立key、暫停／背景停聲、長聲offset及中斷恢復已接線。快速下注後即開局原會取消飛行而漏籌碼聲，現以landAll在手動／自動鎖注時落定一次，清除與重排仍取消靜音；自然／late callbacks不雙播。context非running時停止並斷開節點，避免中斷後殘留聲音。

217項通過（新增18項PCM／AudioContext替身／Game及ChipFlights事件），含設定隔離、上限／合併、readonly同步、失敗降級與callback不改checkpoint；原10,000局守恆保持。20個runtime、10張PNG不改，無新外部錄音依賴。browser_smoke.py補靜音／重載／暫停內控制，僅Python語法通過，未執行或實機聽聲，不重試既有HTTP／Chromium IPC路線。Safari／iOS首次互動、裝置靜音／音量／路由、背景與中斷、音質混合及合成效能仍UNVERIFIED。已發布main 6ad8a33c27222314a2eefcbed22f7fc08886fba5，Pages run41164989369 completed/success；163檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記SOUND_EFFECTS_RELEASE.json，發布後本地交接不另部署；下一個可否證驗證是實機逐桌聽聲並測轉動暫停／切背景／繼續。

## 0.4.1：輪盤左右6:4

使用者指定左投注60%／右轉輪40%，取代0.4.0上下版。原模板直接把轉輪及投注設為table-screen的縱向flex子項，無法形成左右欄；現以roulette-layout Grid 3fr／2fr包住，具名放左下注及控制／右輪盤與原結果。窄版控制分行、主要44px不縮，手機仍左右；原容器測量及DOM籌碼位置繼續適用。沒有重算結果、賠率、道具、計時或保存，PNG不變。

現有199項回歸通過，未為可逆布局新增鏡像測試；browser_smoke.py新增實際DOM矩形6:4／順序／同高檢查，桌面及七視口呼叫，只有Python語法通過，沒有執行瀏覽器。Safari／觸控／右輪大小／小手機左欄可讀性與控制可達性仍UNVERIFIED；不重試既有HTTP／Chromium IPC。已發布main 05a985461ccaec446a9beec9657992f485eeb480，Pages run41162556964 completed/success；158檔SHA一致、26份PNG副本不改與手圖不存在均已核對。結果記ROULETTE_LAYOUT_RELEASE.json，本地發布後交接不另部署。下一個可否證驗證為實機核對6:4與精準下注／放大、轉動暫停及重轉選擇。

## 0.4.0：第五桌輪盤

依已確認美式雙零／50獨立投注接入第五桌，199項通過，新增27項含全50×38派彩、零號、三道具、預扣重轉／接受／超時／完整38重抽同號／只轉一次、保本後判勝敗、舊round拒絕及2,000局守恆，連同原三桌模擬共10,000局。rouletteCells對兩版印刷／籌碼位置共用資料，ChipFlights用實際DOM；相對末角逐號比對美式輪序，確保數學上球號一致。暫停剩餘時間及CSS負delay／play-state模板有檢查，沒有瀏覽器視覺證據。

19個runtime、10張PNG不改、無手圖；原創輪盤／盤面SVG直接用於遊戲，不是截圖或臨時示意。browser_smoke.py補桌面下注／轉動暫停／結果／匯出及七視口精準下注／放大，僅Python語法通過，不重試舊HTTP／Chromium IPC路線。手機小格以原生精準面板及主動放大補足，實際可讀性、SVG transform、Safari、觸控／旋轉、安全區／效能仍UNVERIFIED；不能把199項當裝置通過。已發布main 4cea5cb4706a4652e5d5726eb3f0bbb6e79dc265，Pages run41161476045 completed/success，157檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記ROULETTE_RELEASE.json，本地發布後記帳不另部署。下一個可否證檢查為實機完整下注→轉動暫停→重轉決策→結算→跨桌存檔。

## 0.3.1：勝出對手框色

使用者最新指定只改勝出對手框色，先前追加可見姓名／牌型及結束modal文字的方案已移除。根因是原座位只標當前行動者／棄牌，沒有將已結算彩池得主映射至對手框。現從result.pots排除uncalled退款、匯總所有實際AI winners，僅結算後套金框及輔助閱讀label；不重算牌型／派彩，不改可見文字、玩家框、暗牌、操作或存檔。新增2項完整視圖語義測試，含普通勝／棄牌勝、平分、不同邊池得主、退款排除、結算前無框／下一手清除及readonly；全套172項通過，原8,000局模擬保持。root／docs／單檔版本0.3.1，10張PNG不改。Safari／觸控／金框對比及手機視覺仍UNVERIFIED，不重試舊IPC路線。已發布main a0658db6f791524371ec26afd5be73244ddcfb9d，Pages run41154601353 completed/success，148檔SHA一致、26份PNG副本不改及手圖不存在均已核對。結果記POKER_WINNER_FRAME_RELEASE.json，發布後本地記帳不另部署。

## 0.3.0：德州撲克與收注節奏

接入六人無限注第四桌，170項程式／封裝／Pages通過，新增34項及2,000手守恆模擬，連同原百家樂4,000／21點2,000共8,000局。完整加注與短碼重開、主邊池／零頭、一次結算／保本後勝敗、舊schema／雙牌靴／AI保存、30秒／道具原倒數及stale turn token均覆蓋。AI只有受限自身底牌／公共資料輸入，高資金縮小估值誤差並增詐唬；不是實玩平衡證明。

節奏假設：最後一次下注若立即清street並收注，會與下注飛行同時發生而缺乏先後。已加入600ms poker-collect等待，測試599ms仍未收、暫停不動、600ms收注後才攤牌、攤牌完成才派彩／保存。卡牌依實際容器等比例計算；畫面三個重點為對手動態／公共牌及自己／當前操作，次要彩池與紀錄進面板。

既有HTTP／Chromium IPC限制仍生效，不重複啟動失敗路線；browser_smoke.py補七視口及桌面一手／暫停／匯出，只做Python語法檢查。真實Safari、觸控、旋轉、安全區、320×568與844×390主操作可達性、字體、效能及AI強度仍UNVERIFIED。10張runtime PNG不改、無手圖。已發布main 82dc70e53971f78263329812ed8215c2f6a45b8d，Pages run41153240944 completed/success，147檔SHA一致、26份PNG不改及手圖不存在已核對。結果docs/POKER_RELEASE.json，本地發布後記帳不另部署；下一個可否證驗證為實機下注至全押邊池結算、暫停回來與存檔匯出。

## 0.2.0：21點接入與驗證界線

使用者直接要求製作21點，沿用一體賭枱。第三桌已接入，136項檢查通過（新增34項及2,000局資金模擬，連同原百家樂共6,000局），三個新模組共用Game資金／時間／保存。六副牌S17、自然3:2、保險、加倍／分後加倍、四手、分A、晚投降及三道具均有測試；零暫存資金不提前判破產。換牌沿原倒數包含動畫；最後發現「點擊前advance可能先讓上一手超時切到下一手」的假設，最小測試以舊hand id發加倍／透視，已新增UI綁定及引擎保護並通過。分牌動畫／追加與籌碼採實際DOM落點；結構、扇形尺寸及暗牌標籤測試不等同實際渲染。

root／docs Pages、單檔同步13個runtime、10張PNG不改、無手圖。browser_smoke.py補分牌／暫停／加倍／結算$105／牌靴cursor7／匯出及七種視口入桌，Python語法通過但未執行。遵守既有socket／IPC停用路線，未再啟動Chromium／HTTP，Safari／觸控／四手大小／旋轉／原生dialog仍UNVERIFIED。下一個可否證檢查是實機從下注到分牌／加倍／結算及背景恢復，尤其320×568與844×390。已發布main 42a68405f28c0ab3298094a7d74e7197fb6ef8fb，Pages run41093009444 completed/success；138檔SHA全部吻合、26份PNG副本不改及手圖仍不存在已核對。結果記docs/BLACKJACK_RELEASE.json，本地發布後交接不另部署；不以程式通過宣稱實機通過。

## 0.1.9確認後接入

使用者已明確選定百家樂一體賭枱、大小分區，前次等待預覽確認已滿足。本輪以單張枱布35／65網格及實際長寬重排SVG解決0.1.8固定高／固定SVG比例假設；印刷、落枱與飛行同一幾何，大小50格保持。102項程式／版式／封裝／Pages檢查通過，含8個新版式測試及原4,000局資金驗證。正式SVG已用Inkscape看空盤／下注錨點，不是瀏覽器截圖。browser_smoke.py補35／65實際尺寸與SVG長寬關係，僅Python語法通過；Safari／觸控／旋轉仍UNVERIFIED，不重試舊IPC路線。已部署main d51e6fab1983ded3fc3c21fc1708a1a8494863df，Pages run41081544887 completed/success；129檔SHA一致，手圖維持刪除。詳TABLE_PRESENTATION_RELEASE.json。


## 比例預覽v1：上下比例失衡（尚未實裝）

使用者0.1.8實況顯示開牌上區卡牌小且左右資訊分散，下區六格集中中央、兩側空白。先前有界高度只處理溢出，沒有驗證自然比例；不能將94項程式測試當作視覺通過。

使用者追加「先提供預覽，確認後才實裝」；本輪僅獨立預覽，不改正式程式／部署。

本輪根因假設：128／150px固定開牌高度及42／52px卡牌上限，配合1200×610固定SVG等比例置中，寬視窗會空出兩側。新方案保留上下分隔，扣除HUD與導航後，候選按上35／下65配置（下區包含底部控制）；卡牌跟隨上區高度，莊閒成組置中。下區SVG依實際長寬重排六格與文字，卡牌與籌碼保持等比例，不用整頁拉伸或裁切。最小可否證檢查：寬／窄SVG幾何邊界、同一幾何用於盤面／籌碼落點、上下可用高度預算及實際視圖接線；Safari視覺仍需回測，不重試既有受限Chromium路線。

本輪完成獨立A分區／B一體枱布候選，共四個1490×617及1280×800配置。版面／HTML控制語法檢查通過；PNG為Inkscape渲染，非瀏覽器截圖。69個正式檔SHA保持0.1.8，GitHub main回讀未變。使用者尚未確認比例或A／B，不實裝；最安全下一步先展示兩版。

## 0.1.8牌桌高度及手圖

根因假設：各區獨立內容高度、SVG按寬度撐高、手機控制逐列及details展開造成頁面超出可用高度。已改有界viewport容器、SVG完整等比例容納、底部控制、次要dialog及咪牌網格；手圖從正式素材移除。94項規則／控制器／面板DOM替身／封裝／Pages通過，無新瀏覽器證據。瀏覽器腳本新增垂直／控制邊界檢查及七種視口，僅Python語法通過；勿將有界CSS當作Safari可讀性實機通過。既有IPC限制不變，不重試同一路線。下一個可否證驗證為Safari實際入桌、橫直向及咪牌／暫停的可見按鈕邊界。已發布main fe35072cd5d7b4aa239ca8119569d58c796188b5，Pages run41075125277 completed/success，126檔SHA一致及兩個正式手圖PNG刪除均已核對。詳VIEWPORT_LAYOUT_RELEASE.json。


## 0.1.7動畫驗證

慢速發牌與咪牌已獲使用者「實裝動畫」批准。87項邏輯／控制器DOM替身／模板／封裝／Pages檢查通過；12項新測試含暫停剩餘時間、進度保留、多指／取消、直接揭牌、牌序／旁注／單次結算。固定手牌測試因新互動更新成明確揭牌決策，4,000局資金模擬仍通過。正式SVG用Inkscape檢查手指／牌角錨點，非瀏覽器截圖。Chromium IPC限制不變，Safari／實機觸控／旋轉未驗證；不重試相同失敗路線。已部署main 358a4a4f4704a1c4557759829b740081d12ee558，Pages run41028807239 completed/success，123檔SHA一致；收據BACCARAT_ANIMATION_RELEASE.json。


## 0.1.6旁注驗證狀態

莊對／閒對／幸運六已接入，75項規則／保存／模板／封裝／Pages檢查通過，新增12項旁注包含2,000局混合資金守恆。尚無新的瀏覽器啟動證據，不重試下方已知IPC失敗路線；六區盤面Safari／手機／平板的觸控及縮放仍UNVERIFIED。咪牌／減速預覽不在本次正式變更內，400ms節奏保持。已部署main 996ba1e615cb97d50dd23130789da88271d6d738，Pages run41024861099 completed/success；114檔SHA吻合。詳CODEX_HANDOFF及docs/BACCARAT_SIDEBETS_RELEASE.json。


## 0.1.5百家樂驗證狀態

已部署main e0ab04dcb6664ac057cf061cfddc3228d995e615，Pages run41010844093成功；63項邏輯／保存／視圖模板／封裝／Pages檢查通過。瀏覽器／Safari／觸控尚未在此環境實跑，舊IPC限制仍有效；不把發牌素材示意圖當瀏覽器截圖。下個有意義驗證是實機入座、改押、換牌10秒／暫停及升級舊存檔。

## 最新問題：平板盤面截斷與投注區佔寬

使用者於0.1.4發布後表示滿意效果；視覺修正已獲確認。回饋未指定實玩裝置及完整路徑，不擴張為跨裝置驗證通過。

使用者上載Safari實況，顯示只見右半盤。根因是舊table-layout保留右側320px欄，同時SVG固定最小1560px寬。0.1.4移除側欄、把控制整合到底部、預設盤面min-width:0及全寬；放大時才啟用大盤。0.1.4已部署main 01032dd50d06400add76f4d3e7bc79df28dd0566，Pages run40995199951成功；40項規則／模板／元件／封裝／Pages檢查通過，尚無實際Safari回測；詳見docs/SIC_BO_LAYOUT_014.md。此問題不歸因於PNG解碼，也不清除玩家資料。舊環境IPC限制繼續適用。

## 目前修正：手機／平板圖片載入失敗

GitHub Pages已啟用，build 40895801619的job123524463752證實從根目錄source:.發布。app／CSS卻請求../art，實際根目錄圖片在public/art。這是先前只測docs布局的覆蓋缺口。新增回歸測試先失敗，改../public/art與docs/play/public/art後通過，共24測試。入口加?v=0.1.1，根目錄加.nojekyll；舊圖片路徑保留相容快取。詳見docs/ASSET_PATH_FIX.md。

修正提交dc91dfc61e9aa89699551d178f89dcd2b37645e5已同步，84檔遠端SHA吻合；Pages run40979205888已成功部署。下一步：提供?v=0.1.1網址讓使用者重開Safari驗證。不要以清除存檔修圖，不要將這次路徑問題誤寫為Safari不支援PNG。實機／瀏覽器仍未驗證。

## 既有環境限制（保留）

## 錯誤現象

原型的環境驗證受限：本地HTTP伺服器與Chromium都無法在預設執行沙箱啟動。

## 最小重現步驟與錯誤

- `npm start`：`listen EPERM 127.0.0.1:4173`。
- Playwright使用已安裝的`/usr/bin/chromium`開啟本地單檔HTML：Crashpad `setsockopt: Operation not permitted`。
- 加入停用Crashpad旗標後：`sandbox_host_linux.cc ... shutdown: Operation not permitted`，仍在頁面載入前退出。
- 一次申請額外網路權限的預覽命令被中止，未取得成功啟動證據；不要將中止當作核准，也不要反覆重試相同申請。

## 已嘗試修法與證據

1. 原生Node本地伺服器：監聽socket遭拒。
2. 改用無伺服器的單檔HTML，Playwright經pipe啟動已安裝瀏覽器：Crashpad socket遭拒。
3. 停用Crashpad：另一瀏覽器程序間socket仍遭拒。

## 根因假設

環境的socket／程序限制阻止預覽基礎設施，尚無證據顯示為遊戲本身的啟動缺陷。瀏覽器未成功開啟，不能宣稱UI／觸控／手機或完整瀏覽器循環已通過。

## 下一個可否證驗證步驟

在允許瀏覽器程序間通訊的環境執行`tests/browser_smoke.py`，或下載`dist/charity-casino-prototype.html`以桌面瀏覽器實測。若頁面能載入但出現JS錯誤，另以該錯誤建立遊戲缺陷假設。

## 不准再重複的修法

不再反覆啟動相同受限瀏覽器／HTTP監聽，不為取得截圖改動玩法、不假報截圖或裝置測試。繼續可執行的規則、存檔、語法及封裝驗證，瀏覽器驗證標記UNVERIFIED。

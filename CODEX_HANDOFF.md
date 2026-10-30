# CODEX_HANDOFF

## 目標與階段

《賭王慈善大賽》：$100起步、手上資金$25,000,000勝利、歸零失敗，計有效遊玩時間；電腦／手機／平板。B港式賭片美術；其餘桌必須沿用使用者滿意的0.1.4上下布局、完整盤面、底部控制、五色籌碼、飛入／混色堆疊及暫停。

目前大小＋百家樂0.1.5已部署；main e0ab04dcb6664ac057cf061cfddc3228d995e615，Pages run41010844093 completed/success，63項檢查通過。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.1.5 。本地收據docs/BACCARAT_RELEASE.json。德州撲克、21點、輪盤仍開發中，正式五桌範圍保持。瀏覽器／實體裝置尚未在此環境成功驗證。

## 0.1.6最新狀態（優先於下方歷史紀錄）

三款旁注已獨立接入正式程式，準備發布；本次使用者要求取代舊三旁注限制。莊對／閒對各11:1；幸運六須莊6點勝，兩牌12:1／三牌20:1，和／輸不派。主注最多一項、旁注可複選或單押，總額受資金限制；改押主注僅搬原額，保留旁注籌碼與動畫。鎖注後不可加注。主注佣金仍0.95，旁注不收佣金。換牌後按最後起手兩張判對子，保本按整局合計淨虧損計一次。

src/baccarat.mjs結算、game.mjs資金、board.mjs／baccarat-view.mjs六區盤面、app.mjs籌碼接線已完成，入口及依賴版本0.1.6，保存schema1及十張PNG保持。新增tests/baccarat-sidebets.test.mjs十二項含2,000局混合投注；全套75項通過（22大小／保存、9盤面、23百家樂、12旁注、3封裝、6Pages）。語法及兩種Pages布局亦通過。

先前「讓我確認後才實裝」限於咪牌與減速動畫，不阻止本次獨立旁注要求。正式動畫仍400ms，沒有接入手圖或咪牌。該預覽尚待使用者確認。早期旁注預覽的60檔不變紀錄是歷史快照，不能再作為0.1.6未改的證明。預覽不隨發布上載；詳docs/BACCARAT_SIDEBETS.md。

本輪發布完成後記錄新提交／檔案SHA核對／Pages run；發布前仍0.1.5 e0ab04dcb6664ac057cf061cfddc3228d995e615。可回復前版且保留保存器與玩家資料。Safari／手機／平板互動仍UNVERIFIED，不重試舊IPC路線。下一步完成發布並提供?v=0.1.6，再等咪牌預覽確認。

## 0.1.5及獨立預覽歷史紀錄

- 最新追加：使用者要求莊對／閒對、幸運六等，照慣常賠率。已核對NUSTAR及City of Dreams官方規則：兩對各11:1；幸運六必須莊6勝，兩牌12／三牌20，和／輸不派；主注保留傳統佣金。完成docs/previews/baccarat-sidebets-v1盤面PNG／獨立HTML／候選結算及檢查，更新BACCARAT_SIDEBETS.md／原詳規／總綱，取代舊「不開放三旁注」限制。主注最多一項、旁注多項／可單押、換牌後判對子及整局保本等為接入候選。正式60檔及GitHub不改；咪牌尚未確認。

- 最新任務轉為百家樂動畫預覽：使用者要求發牌速度減30%，所押方需補牌時親自揭牌，且「讓我確認後才實裝」。提問後已選「拖動牌角慢慢揭開（咪牌／捽牌）」。已完成docs/previews/baccarat-squeeze-v1獨立HTML、GIF／MP4及實際右手候選PNG；400ms÷0.7≈571ms，牌角彎起、手指跟隨、逐步露出、攤開歸位。此動作外觀仍待確認；所有0.1.5正式檔保持，無GitHub寫入。

- GitHub內容提交e0ab04dcb6664ac057cf061cfddc3228d995e615，parent保留01032dd50d06400add76f4d3e7bc79df28dd0566；43個變更檔、111個發布檔Git blob SHA全部吻合，主分支已回讀。發布後本地交接／收據另記，不為記帳再觸發部署。

- src/baccarat.mjs：416張八副牌、無偏洗牌索引、天牌／標準補牌、莊0.95／閒1／和8、和局莊閒退本金、保本、整數美分派彩。
- Game加入baccarat桌別、交替發四張及補牌、單項加注／改押整筆原額、30秒、換牌券鎖注前扣除／四張後10秒選擇／換後重判。持重擲券不套用百家樂，未啟用換牌券不自動用。
- 新swap道具可於商店購買，每次購買前資金10%；保本／透視共用存量，重擲限大小、換牌限百家樂，無免費配給。透視已下注後選莊／閒，隨機看一張點值，原倒數不重置、原牌序不變。
- 新baccarat-view：上牌局／下莊閒和印刷盤面、底部控制、實際正反牌PNG取格及五色籌碼，沿用暫停遮桌及動畫停表；新牌原PNG未改像素，來源見public/art/baccarat-b/assets.json。隱藏牌不洩露牌階／花色CSS。
- 保存仍schema1及原槽名；新增可選baccaratShoe（完整唯一牌序／cursor／cycle）和inventory.swap，舊檔缺swap補0。只在完成局保存，跨桌保存牌靴；關閉／重整仍回最後完成局。
- 63項（22大小／保存、9共用盤面／動畫、23百家樂、3封裝、6Pages）及11檔語法通過。百家樂含10,000種點數／補牌組合、2,000真實牌靴連續局資金守恆、舊檔／壞靴、換牌／透視／暫停／切牌及實際視圖／入口。Inkscape檢查牌面／投注SVG，不是瀏覽器截圖。
- scripts/package/pages/prepare已加入新模組與第10張PNG；根目錄與/docs布局一致，入口及依賴?v=0.1.5。瀏覽器腳本已補百家樂桌面／手機流程，語法通過但未執行。

## 本輪工程預設

詳docs/BACCARAT_IMPLEMENTATION.md，非使用者新增永久規則：剩牌少於60張在下局重洗、不做開靴燒牌儀式；未下注超時將預留四張棄置，不計完成局／不扣錢，已用道具不退；空注無道具離桌不消耗預留。發牌每400ms。莊淨贏款按95%向下取整至美分，佣金逐局結算。以上仍可依實玩回饋調整。

## 不可遺失的規則

- 五款詳規見GAME_BRIEF及各詳規；不改德州6人NL／AI資金20%–120%、21點S17／3:2／最多4手、輪盤美式38格／獨立投注。
- 大小50種投注、圍骰大小輸而其他合資格注照派、重擲／接受／超時皆扣持有券；不能套到百家樂的事先啟用換牌。
- 無開局免費道具；每局最多一件。達標／歸零在最終結算後判定；一般最低$1，0<資金<$1可全押。
- 保存只在局／手完成後；自由模式手動槽、競速單一自動槽、模式分開。允許關閉重試未完成局，不宣稱防回溯。頁面存活的暫停保留原局及剩餘秒數，背景／商店／離線停表，按繼續才恢復。
- 沒有帳號、雲端、支付、排行榜或額外樓層玩法；中央豪華樓梯不是商店。其餘三桌不可誤標已開放。

## 重要檔案

- docs/BACCARAT.md、BACCARAT_IMPLEMENTATION.md、TABLE_PRESENTATION.md、GAME_BRIEF.md。
- src/game.mjs為唯一資金／流程所有者，storage.mjs驗證保存，baccarat.mjs純規則，baccarat-view.mjs及board.mjs呈現／動畫，app.mjs接線。
- tests/game.test.mjs、board.test.mjs、baccarat.test.mjs、package.test.mjs、pages.test.mjs；browser_smoke.py未成功執行。
- public/art/baccarat-b/assets.json（新牌）、sicbo-board-b/assets.json（已確認五色／枱布）、prototype-b/assets.json（原骰及道具）。
- DEBUG_HANDOFF.md保留環境socket／IPC限制，不重試相同HTTP／Chromium路線。

## 已發布與回復

- 線上0.1.5：https://jacobmaster-97.github.io/charity-casino/?v=0.1.5 ，main e0ab04dcb6664ac057cf061cfddc3228d995e615，Pages run41010844093成功，111檔SHA吻合。
- 前版0.1.4：https://jacobmaster-97.github.io/charity-casino/?v=0.1.4
- main 01032dd50d06400add76f4d3e7bc79df28dd0566；35變更／101發布檔SHA吻合，Pages run40995199951成功。使用者已滿意效果，無須重問。
- 0.1.3 main67578f2f70a84f5993edcc22068ae797e3b22af5；0.1.2 f6c1762ef06d8dfee7d6a1572ff8aee32c64bb58。詳各*_RELEASE.json。
- 0.1.5若百家樂有阻塞，BACCARAT_ENABLED可在版本更新後設false，只關閉入口，保留新保存器／庫存／牌靴及大小；不要以舊保存器覆蓋或清除網站資料。

## 風險與下一步

以本檔0.1.6最新狀態為準：本次旁注已實作，完成發布後回讀提交及Pages結果。主注原規則／旁注複選／總資金／首兩張牌階／莊6勝張數／換牌後判定／整局保本已由測試覆蓋。瀏覽器及裝置互動仍未驗證，不重試受限IPC。咪牌與減速仍只預覽，須使用者確認後才實裝；不可因新旁注要求推定動畫通過。平衡仍待實玩調校。

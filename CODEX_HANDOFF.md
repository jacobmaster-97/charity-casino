# CODEX_HANDOFF

## 目標及目前狀態

《賭王慈善大賽》：$100起步，手上資金$25,000,000勝利，歸零失敗，計有效遊玩時間。B港式賭片美術；電腦／手機／平板。大小及百家樂可玩，德州撲克／21點／輪盤仍開發中，正式五桌範圍保持。

本輪使用者明確指示「實裝動畫」，批准先前拖動牌角咪牌預覽及發牌減速。0.1.7已接入、87項檢查通過，準備發布。發布前main為0.1.6 996ba1e615cb97d50dd23130789da88271d6d738，Pages run41024861099成功。完成後於本地補新SHA及Pages收據，不為記帳再觸發一次部署。

## 本輪完成

- 每張發牌／自動補牌400÷0.7＝571.4286ms，CSS同步，速度降30%。
- Game擁有delivering→squeezing→unfolding→returning：蓋牌送到面前、玩家拖動牌角、700ms攤開、700ms歸位，再按原序補下一張／結算。拖動進度單調保留；放手／取消不重置，主要指標防多指干擾；方向鍵、Enter／空白及直接揭牌可用。
- 主注莊／閒關聯該方補牌；幸運六亦關聯莊方，不預告六點或勝負。兩方均有關聯投注時先閒後莊。單押對子／和自動揭示，天牌／不補牌不顯示咪牌。
- 換牌券仍先處理首四張的10秒選擇，再按最終牌面判補牌。動畫不抽牌、不變牌序、不改投注或道具扣除。咪牌等待及動作照計有效時間；無額外超時。暫停／背景／失焦遮桌、停表及停動作，按繼續保留進度與剩餘動畫秒數。
- src/baccarat-squeeze.mjs實際卡牌SVG／牌角／手圖／指標及鍵盤；穩定外SVG捕獲pointer，只更新子圖層；RAF沿用共用advance時鐘，無第二套遊戲時間。面板出現時原桌inert，可暫停及鍵盤循環。減少動態時停用自主移動／翻轉及手圖，仍保留揭牌選擇及相同流程時間。
- public/art/baccarat-b/hand.png為批准預覽生成原PNG，SHA e658775f6de71933c17890c57aae194ab9c98efc04d9e49d087c6d0883a94d21，未改像素；hand-assets.json記來源／錨點。其餘十張原PNG保持。單檔HTML、根目錄及/docs布局均包含新模組及第11張PNG，入口／依賴0.1.7。
- 87項通過：22大小／保存、9盤面、23百家樂、12旁注、12咪牌、3封裝、6Pages。原4,000局模擬改為明確執行揭牌決策，資金／道具／旁注守恆仍通過。控制器用DOM替身，不當作瀏覽器或實機驗證。
- docs/previews/baccarat-squeeze-live-017/peel.png由正式squeezeScene的SVG經Inkscape產生，檢查牌角及手指；不是瀏覽器截圖。browser_smoke.py已補固定合法牌靴、拖動／暫停恢復／鍵盤／直接揭牌路徑，只有Python語法通過，未執行。

## 不可遺失的框架

- 沿用使用者滿意的0.1.4上展示／下完整盤面／底部功能／五色籌碼／飛入混色堆疊與大額操作，見TABLE_PRESENTATION.md。中央豪華樓梯不是商店。
- 大小50種投注，圍骰大小皆輸、其他合資格照派；重擲／接受／超時都扣持有券。
- 百家樂八副連續牌靴、天牌及標準補牌；主注最多一項，改押搬原額，旁注獨立複選／單押且保留籌碼。莊0.95、閒1、和8，和局莊閒退本金；莊淨贏按95%向下取整美分。
- 莊對／閒對按首兩張牌階各11:1；J＋Q不是對子，第三張不補成對。幸運六須莊6勝、兩牌12／三牌20，和／輸不派，旁注無佣金。換牌後按最後起手兩張判對子及最終結果判幸運六；保本按全局合計淨虧損退50%一次。所有投注鎖注後禁止加注。
- 下注30秒、換牌10秒；不足60張下局重洗，無開靴燒牌。透視選莊／閒隨機一張點值，不延長倒數／更改牌序。
- 無免費道具，每件購買前資金10%，每局最多一件。保本／透視共用；重擲限大小、換牌限百家樂。一般最低每次$1，0<資金<$1可全押。達標／歸零在最終結算後判定。
- 只完成局保存，schema1及原槽名保持，可選baccaratShoe保存全靴／cursor／cycle，舊檔缺swap補0。自由手動槽、競速自動槽、模式分開。關閉／重整回最後完成局，未完成局作廢，接受重試，不宣稱防回溯或局中持久保存。
- 暫停保留原局及剩餘時間，背景／離線／商店停表，回來按繼續。無帳號、雲端、支付、排行榜或額外樓層。不改德州6人NL／AI資金20%–120%、21點S17／3:2／最多4手、輪盤美式38格。

## 重要檔案及發布

- docs/GAME_BRIEF.md、BACCARAT.md、BACCARAT_SIDEBETS.md、BACCARAT_ANIMATION.md、TABLE_PRESENTATION.md。
- src/game.mjs唯一資金／流程所有者；baccarat.mjs純規則及時間常數；baccarat-squeeze.mjs互動／動畫；baccarat-view.mjs及board.mjs視圖；app.mjs接線及共用時計；storage.mjs保存驗證。
- tests/baccarat-squeeze.test.mjs、baccarat-fixtures.mjs及原測試；browser_smoke.py仍未實跑。
- scripts/prepare-github.mjs發布清單，排除docs/previews；package.mjs與pages.mjs含11圖／9runtime檔。GitHub：https://github.com/jacobmaster-97/charity-casino ，main根目錄Pages。
- 回復0.1.6：996ba1e615cb97d50dd23130789da88271d6d738；再前0.1.5 e0ab04dcb6664ac057cf061cfddc3228d995e615，0.1.4 01032dd50d06400add76f4d3e7bc79df28dd0566。更新快取版本，保留新保存器／旁注／玩家資料，不清網站存檔。發布證據見docs/*_RELEASE.json。

## 風險與下一個最安全任務

完成0.1.7內容SHA核對、main回讀及Pages成功後提供?v=0.1.7。Safari／觸控捕獲／旋轉／小螢幕可達性均UNVERIFIED，不重試DEBUG_HANDOFF記載的相同HTTP／Chromium IPC失敗路線。實玩回測動畫、暫停及旁注是下個安全任務；經濟平衡仍未驗證。

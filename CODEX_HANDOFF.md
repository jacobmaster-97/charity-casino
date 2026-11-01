# CODEX_HANDOFF

## 最新：0.6.1手機頂欄／彈窗尺寸調整，待發布（2026-11-01）

使用者要求頂欄縮矮20%並配合文字、動畫小窗放大20%。只改手機三桌CSS：頂欄44→35.2px，標題16／資金14.4／其他14px；搖骰及輪盤小窗transform1.2，未縮放寬高先反向限制，保持安全區與螢幕邊界。遮罩上沿跟新頂欄高度，底部控制不縮。Game／計時／保存／動畫原進度不改，所有快取0.6.1。237項既有檢查（含封裝及Pages）全部通過，待核對GitHub發布。browser_smoke.py新增真DOM比例檢查但只語法通過，Safari／觸控／實際矩形未驗證，不重試舊IPC／HTTP。35.2px頂欄低於一般44px為使用者明確要求取捨，不需再確認。詳docs/MOBILE_TABLES_061.md。前版main4d57dee90b2aa8e6f092fb9fb214bc3868f6f315，發布後更新收據。宣傳圖v5另留預覽，本輪不換圖或部署宣傳素材。


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

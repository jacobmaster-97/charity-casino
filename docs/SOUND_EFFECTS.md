# 遊戲聲效0.5.0

使用者要求：發牌、籌碼投注、骰盅轉動／開盅、輪盤轉動。此為五桌既有原型的聲效接入，沒有新增玩法或背景音樂。

## 內容與來源

聲效均為本專案src/sound.mjs原創程序合成，並非外部錄音；沒有網絡素材、付費服務、字型、聲音套件或音檔下載。沿原有B風格，紙擦聲／短碰撞／木質骰盅／滾動減速用噪聲、阻尼正弦及包絡產生，直接作正式遊戲AudioBuffer。

| 聲音 | 長度 | 時機 |
| --- | --- | --- |
| card | 0.16秒 | 百家樂初始發牌／補牌送出；21點新牌或翻牌；德州可見底牌／公共牌／換牌（不播未顯示燒牌） |
| chip | 0.23秒 | 各桌合法籌碼落枱、德州收注／派彩；減少動態偏好下即播；提早開局或自動鎖注時先完成已接納籌碼並播一次 |
| dice-shake | 0.9秒 | 大小revealing階段，與骰盅轉動同長 |
| dice-open | 0.32秒 | 大小真正揭盅時，最終破產也保留開盅聲 |
| roulette-spin | 4.8秒 | 輪盤與小球滾動減速；重轉開始新一段，沿模型剩餘秒數恢復 |

合成使用自己的固定種子，不呼叫Math.random或Game.randomIndex，聲音與號碼／底牌無關。單個樣本峰值規範至0.34、首尾6ms柔化，master gain 0.55，同時最多四個音源；35ms內重複短聲合併，避免慢幀補跑多張牌造成聲音堆積。正常44.1kHz時五個單聲道float buffers約1.13MB，只在首次使用者操作建立AudioContext後產生一次。這些為可調校聲音預設，不是實機音量／質素已獲確認。

## 啟動與控制

AudioContext懶建立，支援AudioContext及webkitAudioContext。捕捉pointerdown、click及keydown嘗試resume，符合瀏覽器互動啟動限制；沒有操作前不自動播放、不排隊補播錯過的短聲。主頁及暫停選單有「音效：開／關」44px以上按鈕、aria-pressed／動作label；牌桌HUD不增加常駐資訊，鍵盤切換後保留焦點。

預設開啟；靜音保存在charity-casino-sound-muted-v1，與schema1及挑戰槽完全分開，不寫入或匯出遊戲存檔。儲存空間拒絕或Web Audio不支援／resume被拒絕，聲效安靜失效，牌局仍正常繼續；下次有效操作可再嘗試解鎖。

暫停、背景／失焦、pagehide、商店、離桌及主頁會停止聲音。正在播放的短聲淡出並取消，不在返回時重播。骰盅／輪盤長聲以目前round／spin物件為key，不因render、resize或工具面板重排重新啟動；繼續時從Game剩餘時間推算buffer offset，不設第二個遊戲時鐘或重設倒數。AudioContext被系統interrupted／suspended時立即清理斷開音源，重新running只恢復當下仍在轉動的長聲。手動靜音使master gain為0並停止所有音源；離線HTML同樣可用。

## 接線與資料邊界

CasinoSound只讀Game狀態、持有音訊節點與裝置偏好，不更改牌局。Game新增可選onCue與防例外cue方法，只在真實發牌／開盅事件通知；Baccarat、Blackjack及Poker不為render發通知，callback失敗不改結果或阻止checkpoint。原onComplete、庫存、牌靴及AI桌面保持。

ChipFlights新增onLand與landAll。真正動畫自然完成只響一次；清除／移注／重排取消不響，late onfinish不重播。玩家快速開局及倒數鎖注以landAll先落定已接納籌碼再進下一階段，保留一次聲音；不從音效方法下注或派錢。原600ms飛行／五色混疊維持。

## 驗證與目前限制

新增18項，連同原199共217項通過：五段PCM長度／峰值／首尾／非零／可重現且不耗遊戲亂數；AudioContext懶啟動、先前短聲不補播、靜音獨立保存／歸零音量、四音源上限／短聲合併、重畫不重播、輪盤／骰盅暫停offset、重轉及完成停聲、最終開盅、背景／商店／離桌清理、interrupted後按進度恢復、resume失敗後重試、無Audio／儲存拒絕／source.start失敗降級、onended清理、三桌發牌事件及開盅、callback例外不改checkpoint、自然／即時／提早鎖注／取消／late chip callbacks只響一次。使用PCM檢查、AudioContext替身及真實Game事件；不是實際聽覺或瀏覽器證據。

root／docs Pages及單檔同步20個runtime檔；既有10張PNG位元組不變、無手圖，無新音檔依賴。browser_smoke.py新增主頁靜音／重載保留及暫停控制檢查，僅Python語法通過，沒有執行瀏覽器或錄音。遵守DEBUG_HANDOFF既有HTTP／Chromium IPC限制，不重試相同失敗路線。

Safari／iOS首次互動解鎖、裝置靜音鍵／系統音量／音訊路由、背景來回、真實音質與相對音量、低階手機合成延遲／持續效能，以及七種既有視口的控制可達性皆UNVERIFIED；沒有以程式測試宣稱實機試聽通過。UI Score Readable／UX／Accessibility／Commercial／Retention／Google Play Risk仍UNVERIFIED。Priority：P0解鎖／停聲、P1控制可達性、P2系統中斷／路由、P3音量混合、P4質感。下一個安全任務為實機五桌聲效試聽，尤其iOS首次操作、轉動中暫停／切背景與繼續。

## 發布與停用

0.5.0，結果記SOUND_EFFECTS_RELEASE.json；發布後本地記帳不另部署。停用可將SOUND_ENABLED=false並更新快取版本／封裝，或在主頁／暫停選單靜音；保持原保存器、玩家資料及設定key，不清網站資料。前版0.4.1 main 05a985461ccaec446a9beec9657992f485eeb480供比對。輪盤仍左下注60%／右轉輪40%，德州仍只標勝出對手金框，不加可見牌型文字。


## 0.5.1：iPad Safari無聲修正

使用者確認iPad Safari，0.5.0實際沒有任何聲音，iPadOS版本未提供。已確認程式缺口：unlock在this.pending存在時直接返回，若第一個resume一直pending，touchend／click也無法再次呼叫native resume。最小重現用第一次永不settle、第二次手勢才running的AudioContext替身；舊碼實際resume次數1、預期2，回歸先失敗，修正後通過。這是確定程式路徑，尚不能證明為使用者裝置唯一根因。

修正：每次有效互動只要尚非running都再呼叫resume，舊Promise完成不能清掉新一次pending；新增touchend capture；在手勢內先啟動單樣本靜音buffer及native resume，才生成較長PCM，避免等待／準備音訊後才嘗試解鎖。靜音buffer每次替換舊source，不永久循環，也無聲音檔／網絡下載。若navigator.audioSession可用，於手勢內嘗試type=playback，拒絕或不支援時不影響其餘路徑；不宣稱所有iPadOS都支援，也不替代系統音量或實際輸出確認。

主頁及暫停選單新增44px「啟動並試聽」：明確開啟偏好並重試解鎖，成功啟動後播放一段籌碼聲，即使選單令牌局暫停也可手動試聽，不恢復遊戲倒數。平時暫停／切背景仍停聲。試聽音源只在同一前景選單保留，重複sync不切斷；開始牌局、靜音、blur／hidden／pagehide會停止，尚未啟動的舊試聽亦取消。正常牌局短聲仍不排隊補播，轉動仍依remaining恢復。牌桌HUD不新增常駐資訊，偏好key及玩家存檔保持。

新增6項（聲效現24、全套223）：首個pending不擋新手勢、native primer／resume先於PCM、playback session可用／拒絕、選單試聽不改Game／不被sync中斷、待播放試聽在背景／靜音／離開範圍取消、進入牌局清除試聽；另改舊併發測試為較舊失敗不能清新pending，沿原18項其他證據。browser_smoke.py補試聽入口／啟用偏好及暫停入口，只有Python語法檢查，未執行瀏覽器。沒有可用Safari／瀏覽器連接器，遵守舊IPC停用路線，不重複啟動失敗的本地Chromium。

0.5.1代碼、封裝及Pages為PASS；iPad Safari實際播放、iPadOS版本差異、音訊路由／音量與靜音開關仍UNVERIFIED，待使用者開新版按「啟動並試聽」確認。P0為實際聽聲／gesture解鎖，P1為試聽按鈕可達性，其他UI Score維持未評分。回退可保留0.5.0聲音但還原解鎖／選單改動，不清任何存檔或偏好；完整前版main 6ad8a33c27222314a2eefcbed22f7fc08886fba5供比對，結果記IPAD_AUDIO_RELEASE.json。

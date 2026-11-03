# 0.9.4：移除入桌的全圖等待

階段：已發布版本的回歸修正。使用者回報剛發布的0.9.3載入更慢；沿用上一輪「實裝到GitHub」授權，將同一遊戲的修正發至原main／Pages。基準1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9，實際結果另記LOAD_RECOVERY_RELEASE.json。

## 已確認問題

0.9.3把「貼圖完整才顯示盤面」實作成Game.enterTable前的Promise.all門檻，等待該桌4–8張PNG的load及decode；大小共8張12,833,572 bytes。首頁閒時亦會順序warm九張牌桌PNG，共15,021,561 bytes。這些是原圖檔案大小，不含瀏覽器壓縮／快取或網路耗時。

全圖門檻確實會讓最慢的素材拖住整個入桌；無關預讀可能爭頻寬／CPU，但沒有Safari瀑布圖，不把後者當成硬體量測結論。0.9.3沒有縮減PNG檔案，預載本身也不保證載入更快。

先加入永不完成的貼圖請求測試，原版在點擊後仍為lobby而非table（26過1失敗，明確lobby !== table）。最小修正後同一測試通過，確認移除這個程式門檻。

## 修正

點擊任一桌直接同步呼叫原Game.enterTable，不檢查cache.ready、不await圖片、不開準備視窗。完整移除pendingTable、下載完成導航回呼、載入重試／取消選單及其樣式。下載完成／失敗不會導航、重新render、重設倒數或更改牌局。

首頁及大廳不再自動warm全部素材。只在大廳pointerover、focusin或pointerdown某一桌時，best-effort預讀該桌1–2張主要素材，fetchPriority=low、decoding=async；不強制呼叫decode，也不等完成。停留其他畫面、暫停或選單開啟時不送hint。相同URL共用請求，失敗／背景逾時只是下次可再hint，不影響入桌。未知桌名／缺少Image API也不能造成卡住。

大小／輪盤只hint felt；百家樂／21點／德州只hint table及cards。整個hint清單只有3種PNG，不包含籌碼、道具、骰子或盅。實際進桌所需貼圖仍由原CSS／SVG／img正常載入；冷快取下仍可能逐步出現貼圖。這次優先恢復即時互動，沒有以等待全部圖片來隱藏載入延遲。

保留0.9.3的五個名稱框置中、五桌派彩小視窗、揭曉、全部PNG及聲效。Game、規則、派彩、金額與存檔owner不改；其餘mjs只換0.9.4快取query。

## 驗證

325項通過：316規則／元件／Node app替身＋3單檔＋6Pages。app共29項，含6項此次新寫／改寫：五桌在未完成hint下即入桌、晚到／失敗不改後續牌局、背景與截止保持Game owner、首頁／大廳零全圖warm、僅使用者指向桌的hint，以及原版紅燈再轉綠的直接回歸。原五桌派彩／破產／不重派／焦點等均保留。

cache共5項：共用兩張hint及不強制decode、失敗只重試缺圖、逾時／晚回呼不破壞新請求、建構零請求及每桌至多兩圖、無Image／未知桌名失敗但不拋錯。首頁／大廳zero warm是此cache新增請求的檢查，不代表整頁沒有首頁／大廳本身的圖像請求。

npm run verify及verify:pages通過；browser_smoke只Python語法。12張runtime PNG與0.9.3發布快照及Pages逐位元組相同，24份src Pages鏡像一致。單檔29,866,314 bytes，SHA256 891cf19a7268b51672995d4a2ff0ea1cbec495fc6d1f0786a35ce05f673103b6。詳LOAD_RECOVERY_VALIDATION.json。

未驗證：實際iPhone16Plus Safari冷／暖載入秒數、CPU／記憶體／頻寬、貼圖逐步出現觀感、safe-area／旋轉／觸控及硬體音訊。未重試HTTP／Chromium IPC限制，不把Node測試當Safari性能資料。沒有壓縮或修改PNG，也不宣稱下載體積變小、加快某個百分比或絕對秒數。

發布準備將dist/github-upload更新為本次0.9.4精確來源快照；先核對Git blob SHA，再以expected_sha／force:false更新原main，完成Pages後另寫本地收據及metadata。事後收據／交接不觸發第二次部署。回退可用完整0.9.3及其快取版本但會恢復已知門檻；保留玩家存檔。下一安全任務：可用Safari環境測冷開首頁與五桌即入，以及無網路／慢圖情況，優先觀察互動是否被卡住。

## UI審核（程式／使用者回報，非實機）

P1：實機速度及冷圖觀感未驗證；原全圖阻塞已被同事件測試證偽後修正。刪除一個阻擋互動的選單，不增加常駐HUD。可讀性暫評3/5；主焦點為盤面★★★★★、牌桌操作★★★★☆、次要工具★★☆☆☆。首30秒：✔可即入桌、✔可操作原盤面、△冷快取貼圖觀感待測。續玩3/5、UI投訴風險25%均為推估。

==========

UI Score（暫評）

Readable 7/10；UX 7/10；Accessibility 6/10；Commercial 6/10；Retention 6/10；Google Play Risk 3/10（越高風險越大）。

Priority：P0不再加入全圖入桌門檻；P1真Safari冷暖載入；P2低速圖片觀感與觸控；P3素材傳輸及解碼量測；P4不增動效。

==========

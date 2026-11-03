# iPhone 16 Plus橫向填寬 0.9.2

2026-11-03；使用者「實裝至GitHub」已批准lobby-iphone16plus-wide-v1的取景／裁切及發布。只改大廳呈現，不擴增玩法、排行或付款。

## 行為

手機／短橫向視口（寬大於高、寬不超1100、高不超600）會在地圖比原圖更寬時，將原1672×941貼圖等比例放大至容器全寬。保留人物比例；上下超出部分裁切，偏上15%取景，保留上方壁畫人物及主要賭桌。五個原入座點仍以百分比跟同一scene定位，不把img單獨放大。

取景使用map.clientWidth／clientHeight，也就是CSS safe-area已預留後的實際空間，不讀取裝置型號、不硬寫932×430或59／21px。resize與visualViewport改變後仍由原relayout重新量測；一般桌面、直向或本身已滿寬的比例保持完整圖。

依實際.station的CSS百分比、offsetHeight及原-25%位移推算按鍵上下邊界，保持8px餘量；若地址欄令視口縮短，優先上移整張圖而非裁掉鍵。極短容器容不下五個入口的填寬構圖時回完整圖。主畫面35.2px頂欄及44px入座鍵不再縮小，窄視口UI極限仍需實機核對。

## 實作

src/table-layout.mjs新增lobbyWideViewport與可獨立驗證的lobbySceneLayout；fitLobbySurface讀取真DOM尺寸、寫width／height／left／top及data-lobby-fit。CSS讓map保持裁切容器，scene以絕對位置擺放並移除max-height:100%限制，避免原最大高度把放大的圖壓扁。切回完整圖會重設座標，沒有殘留的負top。

原Game、五桌規則／計時／存檔／道具／派彩與12張runtime PNG不改；其他mjs只更新0.9.2快取query。封裝仍12張PNG、24 runtime，支援本機單檔及根／docs Pages。回復0.9.1整體程式／快取即可，不清存檔。

## 證據

308項通過（299規則／元件／Node替身＋3封裝＋6 Pages）。新增6項包括：視口策略、批准的812×363.8內框金值、不同地址欄高度時五鍵可見、極短回完整圖、真量測呼叫／60px按鍵／回復座標、無效尺寸。既有500次五分鐘及10,000局回歸保留。

批准示意中的812×363.8輸入得到812×456.9928的等比例scene及top=-13.9789，與預覽取景相同。這是單元模型核對，不是iPhone硬體或Safari真矩形證據。沒有把預覽PNG當成實裝截圖。

browser_smoke.py加入932×430、932×354及430×932，檢查真DOM填寬、圖片比例、五鍵四邊界與safe-area padding；只Python語法通過，未跑瀏覽器。沿DEBUG_HANDOFF停止重試HTTP／Chromium IPC限制，沒有啟動該路徑。

未驗證：iPhone 16 Plus實際Safari安全區／網址列／旋轉、其他瀏覽器、44px點按及細字體、上下裁切真觀感、實際單屏捲動與音訊硬體。發布結果只證明GitHub Pages部署層，見LOBBY_WIDE_RELEASE.json；完整數據／SHA見LOBBY_WIDE_VALIDATION.json。

## UI審核（源碼／模型，待實機）

P1為真Safari的裁切／地址欄變化與安全區尚未驗證；P2為極短視口回復完整圖時的體感。主焦點：地圖／五桌★★★★★、餘時／資金★★★★☆、其他功能★★★☆☆。沒有新增常駐HUD，按鈕保留44px，頂欄35.2px延續使用者指定例外。

首30秒：✔五桌及頂欄功能可辨識；✔與原同位置語意；△旋轉／裁切感待試玩。續玩意願估計3/5，UI投訴風險25%，皆為設計推估。

==========

UI Score（暫評）

Readable 7/10；UX 7/10；Accessibility 6/10；Commercial 6/10；Retention 6/10；Google Play Risk 3/10（越高風險越大）。

Priority：P0暫無已知流程阻塞；P1 iPhone 16 Plus橫向實機；P2地址欄／旋轉／極短；P3裁切觀感；P4未新增動效。

==========

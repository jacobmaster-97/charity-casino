# DEBUG_HANDOFF

## 0.1.7動畫驗證

慢速發牌與咪牌已獲使用者「實裝動畫」批准。87項邏輯／控制器DOM替身／模板／封裝／Pages檢查通過；12項新測試含暫停剩餘時間、進度保留、多指／取消、直接揭牌、牌序／旁注／單次結算。固定手牌測試因新互動更新成明確揭牌決策，4,000局資金模擬仍通過。正式SVG用Inkscape檢查手指／牌角錨點，非瀏覽器截圖。Chromium IPC限制不變，Safari／實機觸控／旋轉未驗證；不重試相同失敗路線。發布結果見CODEX_HANDOFF及完成後的BACCARAT_ANIMATION_RELEASE.json。


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

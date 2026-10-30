# DEBUG_HANDOFF

## 目前修正：手機／平板圖片載入失敗

GitHub Pages已啟用，build 40895801619的job123524463752證實從根目錄source:.發布。app／CSS卻請求../art，實際根目錄圖片在public/art。這是先前只測docs布局的覆蓋缺口。新增回歸測試先失敗，改../public/art與docs/play/public/art後通過，共24測試。入口加?v=0.1.1，根目錄加.nojekyll；舊圖片路徑保留相容快取。詳見docs/ASSET_PATH_FIX.md。

下一步：將來源與生成docs同步GitHub，等待新Pages部署成功，再提供帶版本網址。不要以清除存檔修圖，不要將這次路徑問題誤寫為Safari不支援PNG。實機／瀏覽器仍未驗證。

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

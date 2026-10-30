# 0.1.1 圖片路徑修正

## 使用者現象

手機／平板Safari可操作介面，大廳中央顯示破圖，背景與道具亦無法載入。

## 已確認根因與證據

GitHub Pages建置40895801619、build job123524463752明確記錄`source: .`及`Source: /github/workspace/.`，即main根目錄；該次部署成功。根目錄版從src/app.mjs請求../art，CSS亦請求../art，但實際圖片位於public/art。先前只驗證docs/play版，漏掉真實根目錄部署；不是已證實的Safari解碼差異。

修正前新增回歸測試，根目錄圖片網址斷言實際指向/art，而預期/public/art，測試失敗；原docs複製檢查仍通過，證明舊驗證覆蓋不足。

## 修正

- 原始碼、根目錄Pages及docs版統一src與public/art的相對結構。
- app以module網址解析../public/art；CSS用../public/art。
- docs建置複製圖片至docs/play/public/art，舊docs/play/art保留相容快取，不刪歷史圖片。
- 根目錄新增.nojekyll；兩個入口對CSS與app帶?v=0.1.1，讓舊快取更新。
- 單檔打包支援帶版本的入口，圖片仍嵌入；存檔schema與key不變。

## 驗證

16項規則／存檔、3項單檔、5項Pages共24項通過。Pages回歸測試執行實際asset resolver，覆蓋根目錄／docs、帳號首頁／專案子路徑，並確認CSS及PNG存在與來源一致。

此環境HTTP對外socket仍被拒絕，未重試已失敗的Chromium流程。Safari實機回歸仍待使用者或可啟動瀏覽器環境驗證；不能把部署成功當作實機畫面通過。

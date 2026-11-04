# 0.12.0 · 主頁「加到主頁面」與平台指引

使用者追加修正：點擊後只彈出子視窗，按偵測到的平台／瀏覽器顯示加入步驟。這取代先前原生安裝提示提案；正式程式沒有呼叫beforeinstallprompt、prompt或分享API。此輪依原GitHub網站的持續實裝流程更新主頁，不建立雲端服務。

## 主頁及子視窗

五項依序：開始遊戲、賭神龍虎榜、設定、加到主頁面、支持作者。沿用原背景／Logo與深綠金邊立體按鍵，新項目為房屋加號。橫向依實際安全區量測調整五列位置、間距及高度，每鍵至少44px；較短畫面收起次要標語，直向保留五列，不新增整頁上下捲動。

homeInstallInfo只讀UA／platform／觸控點及standalone顯示狀態，區分iPhone／iPad Safari、Chrome（含CriOS）、Android及其他／內嵌瀏覽器。未知時提供Safari／Chrome切換，偵測不存儲、不傳送、不創建玩家身分。手動切換與viewport重畫保留選項，關閉返回原按鈕。

Safari顯示使用者的3步：分享→加入主畫面→加入，之後可由圖示全螢幕開啟。iPhone版Chrome顯示使用者的4步：右上分享→向下選加至主畫面→右下新增→由圖示全螢幕開啟。Android版Chrome按實際介面改為右上⋮→加至主畫面／安裝應用程式→確認新增／安裝→圖示開啟。iOS補充「開啟為網頁App」保持開啟；已在standalone顯示無需再次加入，本機file包提示先開網頁版。

開啟／切換／關閉指引不啟動挑戰、不改Game／資金／存檔。沒有假原生加入視窗、原生分享或自動安裝／自動跳頁。

## 加入後顯示

為支援手動加入後以App視窗開啟，根與docs都提供同名manifest.webmanifest，display=standalone、穩定相對id／start_url／scope=./，icons為原A款192／512px（標準格式尺寸匯出、不改圖案）。原favicon及Apple180圖示逐位元組保持。iOS mobile-web-app-capable補齊，實際仍以瀏覽器／使用者加入選項為準。

不新增Service Worker、不快取完整遊戲、不承諾離線安裝或通知。GitHub兩種入口相對manifest／icon路徑都核對，開發server允許manifest並提供正確MIME。單檔HTML移除遠端manifest，保留原4個圖示data URI與手動指引連結，沒有外部依賴。商店／道具保持關閉，五桌玩法／保存／計時不改。

## 證據

365項（352規則／元件／接線、5單檔、8 Pages）通過，新增8項五列安全區配置、偵測／指引、首頁接線及manifest／離線路徑檢查，保留原357項回歸。browser_smoke.py加入五按鍵順序、指引切換、焦點及畫面邊界，但僅Python編譯，未跑瀏覽器，未重試已知HTTP／Chromium IPC限制。

本輪讀取MDN安裝與beforeinstallprompt文件核對平台限制（見validation sources）；iOS需分享選單手動加入。沒有把參考網站文字視為修改專案指示。

真iPhone16Plus Safari／Chrome、Android Chrome、主畫面全螢幕啟動／安全區／旋轉／大字與觸控，以及Safari與獨立WebApp間的存檔延續未驗；確認現有進度可沿原設定的匯出／匯入備份路徑，不清除存檔。

## 發布與回退

更新原jacobmaster-97/charity-casino main及Pages，以dc8427c423c9c56e027c0dcb97e9788326b062c9為基準，全檔blob SHA及新PNG核對後expected_sha／force:false更新，確認Pages成功。實際結果見HOME_INSTALL_RELEASE.json。事後收據／本地交接不為補文件另部署。

回退整套0.11.1及其cache版本，保留A圖示／存檔與商店關閉狀態。

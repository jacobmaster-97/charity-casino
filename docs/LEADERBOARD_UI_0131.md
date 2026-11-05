# 龍虎榜介面0.13.1

使用者「實裝」確認leaderboard-v1；本版接入正式首頁龍虎榜並沿原GitHub Pages發布。後端API與D1保持0.13.0，無Cloudflare資源變動。

## 玩家體驗

深玉綠、金箔龍虎及酒紅榜首牌，左側三甲，右側第四名起榜單。沒有玩家角色圖示。真實資料不足三人時只顯已有名次，空榜不放示例。榜單每頁20筆，第二頁沿用首頁三甲；刷新成功才換快照，錯誤保留原頁及三甲。保留既有刷新／分頁與排序規則。

採實際viewport與safe-area，固定頁首／頁尾、內容局部捲動；橫向手機、平板及電腦用兩欄，直向改單欄。按鍵至少44px，短屏先收裝飾。完整金額沿字串格式化，長值可局部橫向閱讀，不作浮點轉換、不縮略失去金額。長名稱安全跳脫並換行。狀態更新保留捲動及焦點，換頁重設清單位置，Tab／Escape／返回主頁沿用可達性處理。

## 素材及封裝

已批准image_gen原圖保留在隔離預覽資料夾，公開版只用1200×400／98,012 bytes WebP；原圖SHA與輸出SHA記於public/art/leaderboard-b/assets.json。只縮放及編碼，未創意重繪。開榜不等待圖資，不新增首頁全圖預載；資料與控制先顯示。單檔內嵌13張圖（12張原PNG＋1 WebP），Pages複製新模組及圖資。舊PNG／ICO未改；預覽示例與原大圖不公開。舊Client視圖匯出與home rank fallback保留，支援部分舊模組快取。

## 證據及限制

npm run verify：381單元／組件＋6封裝；npm run verify:pages：9項，共396項通過。包含分頁三甲一致性、過期回應、失敗保留、0／1／2筆、空榜／離線、名稱跳脫、超長金額、焦點／捲動與動作接線。CSS以Safari16／Chrome110目標解析無警告，browser_smoke.py僅Python語法編譯。原500五分鐘／10,000局回歸保留。

Worker、migration及API設定與0.13.0逐byte一致；13核心engine模組去除快取版本後一致。無D1寫入、無Worker部署、無管理憑證進公開檔。五分鐘計時／派彩／保存與手動完場上傳保持；商店／道具仍關閉。

上述是自動測試與靜態證據。Safari／Chrome真實觸控、安全區、旋轉、VoiceOver、實際排版及超長金額滑動仍未驗證，不能用預覽PNG或CSS解析代替。公開發布／逐檔核對另記LEADERBOARD_UI_RELEASE.json。

## 發布及回退

npm run prepare:github產生明確清單；發布原jacobmaster-97/charity-casino main，expected_sha避免覆蓋他人更新。核對整棵tree、Pages head及公網runtime SHA。不變更D1／Worker。若需回退，重新發布0.13.0前端快照6800e38637fe4a7ea2c33af3f494ca145ac47305及更新快取版本；保留存檔與D1，不重建資料庫。dist/github-upload在成功後保留精確已發布快照，事後本機收據不再覆蓋它。

# 0.12.1 · 移除自由挑戰

使用者要求刪除自由挑戰模式。本輪移除整個玩家入口，正式網站只提供五分鐘挑戰；沿原GitHub網站流程發布。

## 行為

開始遊戲及設定移除模式選擇、自由挑戰／手動保存文案，開始新挑戰固定由$100與五分鐘起步。正式app使用不可變CHALLENGE_MODE='race'，舊mode事件不再切換模式；自由模式的手動保存／讀取按鈕移除，舊事件忽略。

續玩與自動讀檔只讀原race-auto鍵，不讀取／回落到free鍵。匯入及restore入口都檢查mode，拒絕free存檔並維持原挑戰／目前資金；不重命名free為race、不搬移舊資產、不回填倒數。正常race存檔仍按原餘秒／完成局狀態續玩。

自由模式舊auto／manual及schema1存檔原樣保留，沒有刪除、重寫或合併。底層Game／Saves繼續支援舊資料格式與歷史回歸樣本，不構成可玩的正式自由模式入口。五款玩法、總／行動計時、保存schema／前綴、主頁五項、加入主畫面指引及A圖示保持；商店與道具仍關閉。

## 驗證

368項（355規則／元件、5單檔、8 Pages）通過。新增3項覆蓋兩個主頁子視窗沒有模式／手動選項、free匯入及直接restore／舊事件不能改當前局或任何舊存檔、續玩只讀race且保留原餘秒。原模式切換測試改為驗證舊free事件被忽略、姓名保持且新局固定race／100／300秒。

原500五分鐘及10,000局回歸保持，25runtime／Pages一致、12遊戲PNG及所有已發布圖示不變。browser_smoke新增設定無模式選擇檢查，僅Python編譯，不重試HTTP／Chromium IPC。真iPhone Safari開始／設定版面與匯入下載流程未實機驗證。

## 發布及回退

以f445c77df6b91e5ba70e31f66ffe4560e6fc2110為基準更新原jacobmaster-97/charity-casino main／Pages。prepared檔案及全部blob SHA核對後expected_sha／force:false更新，確認Pages head_sha與成功狀態；結果另見SINGLE_CHALLENGE_RELEASE.json。事後收據／本地交接不為補文件另部署。

回退整套0.12.0與cache版本、保留存檔；該版會恢復自由模式選擇。沒有排行榜／Cloudflare或新雲端資源。

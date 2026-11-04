# 0.10.0：v3挑戰記錄及原生PNG分享

使用者「實裝至GitHub」批准已預覽v3正式接入及發布，先預覽限制解除。本版只處理完場紀錄／圖片分享，不加雲端、排行榜或付款。保留0.9.4即入桌流程，不預載全部牌桌。

## 正式介面

challenge.mjs保留原挑戰常數／ID，新增唯讀challengeRecord快照與精確recordCash格式，姓名／最終資金／五桌局數與淨贏取直接取本次資料。結果頁以真正DOM表格及按鈕呈現原Logo、深綠板、金色邊框、五桌小圖示及主金額，沒有把示例PNG鋪成介面。

完成頁及分享PNG都不顯示時間，失敗按既有endReason=bust顯示「遊玩時間」。兩者保留返回主頁／分享挑戰紀錄，刪起始／道具、本次增減、姓名旁模式與底部淨贏取公式；五桌金額及標題保留。沒有改失敗條件或刪除存檔內計時欄位。

版面依真正viewport與safe-area，橫向雙欄、較窄／直向重排；操作至少44px。大金額／長姓名換行而不截斷，必要時只捲動結果視窗，不增加整頁高度。實際Safari像素／小屏舒適度仍待裝置確認。

## 本機圖片分享

record-share.mjs的RecordShare只在結果頁為finished狀態時接收完成checkpoint.profile，複製並凍結姓名、金額及五桌統計。反覆render不會重製相同快照；新挑戰／回主頁清除，過期產圖或分享回呼不能覆蓋另一份成績。

Canvas根據相同快照畫PNG，沒有截整頁、不含返回／分享按鈕，也不使用任何固定示例成績。一般圖寬1600、高900；長金額以原字級換行並延長高度，保留所有整數分。高度上限8192，極端內容拒絕出圖而不截斷／亂算金額，介面與保存資料仍完整。Logo／暗背景重用原PNG；裝飾圖載入失敗或超過2.5秒用本機向量／文字底圖繼續，不讓裝飾阻塞分享。PNG編碼10秒逾時則提供重試。

File在使用者按分享前準備。按下後在同一click事件檢查安全來源、navigator.share及canShare({files})，同步呼叫系統分享選單，使用者自行選App及接收對象。完成只顯示「已交給系統分享」，不宣稱接收者已收到；取消不下載。

不支援檔案分享或File API時下載同一PNG。原生拒絕／出錯保留結果，提供明確下載PNG操作；產圖失敗可重試。暫存blob URL用完延後回收。正式結果頁的匯出操作由圖片分享取代，原存檔設定／備份匯出維持JSON，不改schema或自動保存。

全程不呼叫後端上傳、排行榜或聯絡人API。Game、計時、資金、道具、派彩及checkpoint owner不改；檔名只含遊戲與完成／失敗狀態，不用姓名作路徑。

## 證據及限制

340項通過：331規則／元件／Node app替身、3單檔、6Pages。新增12項紀錄／Canvas命令／File／controller測試及3項app接線，含精確BigInt、唯讀快照、兩種時間顯示、PNG文字／無UI按鈕、長值重排、過長高度保護、裝飾失敗、編碼逾時、同步原生呼叫、防重點、取消／拒絕／下載／URL回收、舊回呼、retry及結果分享不改Game／存檔。保留500五分鐘及10,000局模擬。

一開始正常樣本在字寬替身下超出285px而多一行，PNG變高且全文斷為兩次drawText；把主金額可用寬度改292px（仍在分隔線317px前），同測試回到900高且金額完整。長值繼續換行，不將一般金額或BigInt轉Number。這是程式／命令替身檢查，不是字型實機像素證據。

12張runtime PNG與已發布0.9.4逐位元組不改，25份runtime含新record-share與Pages鏡像相同。單檔29,887,474 bytes，SHA256 ebcd1e9c9de91221aaf12b2b0515650ecc34b070c3add34a84c602fb37973c55。封裝／Pages腳本與快取query同步0.10.0，無新增PNG或外部依賴。

browser_smoke新增完成隱藏時間、失敗保留時間與按鈕、強制fallback下載PNG signature／尺寸及modal擁有捲動的流程，但只Python編譯，未執行瀏覽器。沒有重試已知HTTP／Chromium IPC，也沒有安裝瀏覽器。

未驗證：真iPhone16Plus Safari原生分享選單／目標App收圖、Canvas實際像素／系統字型、真DOM比例／安全區／旋轉／觸控／讀屏／內部捲動及硬體音訊。API／Canvas命令替身不能替代裝置證據。實際部署commit／Pages結果另見CHALLENGE_RECORD_RELEASE.json。

## 發布與回退

已獲原jacobmaster-97/charity-casino main及Pages發布授權；基準0.9.4 commit061601d3b6d73611bd2a7cc364caf7f298c495ae。先prepare:github、逐檔blob SHA核對，再expected_sha／force:false更新；確認該提交Pages成功後記收據。事後收據／本地交接不另觸發第二次部署，舊ZIP為歷史包。

回退需整套0.9.4與對應快取query，保留玩家存檔。若只圖片分享失敗，優先使用PNG下載及重試，不重算牌局或重發獎勵。

## UI審核（源碼／已批准v3設計，待實機）

P1為真Safari分享及Canvas像素／版面未驗；P2為極短視窗、長姓名／金額內部捲動、字型替代及觸控。可讀性暫評3/5，沒有因Node通過提高裝置評分。最終資金★★★★★、五桌戰績★★★★☆、返回／分享★★★☆☆；不加常駐遊戲HUD。

首30秒：✔結果／失敗可辨、✔正負號與顏色並用、✔兩主操作及失敗fallback可辨，△真手指／分享待實機。續玩推估3/5，UI投訴風險推估25%，不是留存／商店量測。

==========

UI Score（暫評）

Readable 7/10；UX 7/10；Accessibility 6/10；Commercial 6/10；Retention 6/10；Google Play Risk 3/10（越高風險越大）。

Priority：P0保留Game／保存合約；P1Safari圖片分享及PNG像素；P2安全區／短高／長字／點按；P3金箔框細節；P4不新增動效。

==========

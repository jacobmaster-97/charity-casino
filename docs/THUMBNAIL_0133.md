# 分享縮圖0.13.3

使用者最新「實裝」已批准thumbnail-v4無人物方案，取代先預覽限制，沿原GitHub Pages流程發布。只有「五分鐘賭神」及「五分鐘 賭出我天地」，不再使用人物版或先前宣傳句。

## 圖片及接線

正式圖片public/social/thumbnail-v4.png，1672×941 RGB PNG、1,753,061 bytes。它與使用者確認的v4原圖逐byte一致（SHA256 d6dcd0b9f20ef6f854031fed1cf12069d79cdf52472e4c099b997e68c022a215），保留比例，沒有裁切、縮放、重繪或程式改像素。原始image_gen圖與各版預覽保留。public/social/assets.json記錄來源、批准及雜湊。

index.html加入canonical、OG網站／語系／名稱／標題／宣傳句／絕對圖片URL／類型／真實尺寸／alt，以及Twitter summary_large_image／標題／宣傳句／圖片／alt。圖片網址：https://jacobmaster-97.github.io/charity-casino/public/social/thumbnail-v4.png 。版本檔名提供穩定新資源，不會沿用不存在的舊縮圖路徑。

metadata放於靜態HTML，爬蟲不須執行遊戲JS。root與docs/index.html使用同一正式絕對HTTPS圖址，canonical／og:url保持原遊戲根網址。scripts/pages.mjs另複製圖片及來源記錄到docs/play/public/social，prepare只包括正式social素材，不包括預覽原圖或其他編輯文件。

分享圖不是遊戲DOM／CSS或新預載項，不增加入桌圖片等待；離線單檔仍只內嵌原13張遊戲圖與原圖示，metadata中的公網分享圖不是離線遊玩依賴。主頁原Logo、背景、A圖示、manifest及一般description不改。版本及import快取同步0.13.3，遊戲src去除快取版本差異後與0.13.2逐byte一致，Worker／D1及API設定保持。

## 驗證與限制

397項通過＝381單元／組件＋6單檔＋10 Pages。新增一項Pages分享測試驗兩個入口的唯一metadata、絕對路徑、內容、真實PNG簽章／尺寸、來源SHA、原像素、零人物來源紀錄及root／docs圖片一致；原500五分鐘／10,000局回歸保留。34個既有root素材／後端／設定檔SHA不變。沒有新增假成績、Worker部署或D1寫入。

發布後另核對Git tree／Pages head／公網圖片HTTP200及image/png／全部runtime與入口SHA，實際結果記於THUMBNAIL_RELEASE.json。HTTP可抓圖及正確metadata不代表各App已更新快取；WhatsApp、Facebook、LINE、iMessage等實際卡片、抓圖更新時機與裁切仍待真機驗證，不能保證某App必定使用新縮圖或保留整幅金邊。完整構圖以原圖網址為準。

## 發布與回退

發布原jacobmaster-97/charity-casino main／Pages，expected_sha避免覆蓋其他更新。保留0.13.2 commitcc0d0da95cb43ddeee2e9abd5510bd938703802e作前端回退參照，不清玩家存檔或D1。成功後dist/github-upload保持精確已發布快照，最終收據／交接只更新本機，不再prepare覆蓋它。

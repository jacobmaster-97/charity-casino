# 0.15.0 背景音樂及橫向遊玩

階段：既有遊戲功能製作／發布。玩家可聽到指定歌曲，手機及平板只在橫向操作遊戲。保留原五桌、畫面素材、完成局保存及雲端榜單資料規則。

## 音樂

- 使用者2026-11-08提供 `Brass Command - usesuno.com.mp3`（206.95秒）。原檔4,985,206 bytes；遊戲版本3,312,369 bytes，MP3立體聲128kbps／44.1kHz，去封面及內嵌metadata，未剪輯曲目。來源及兩份SHA見 `public/audio/assets.json`。原上載檔留附件工作區，不重複公開。
- `CasinoMusic`持有唯一MediaElement，跨DOM render、大廳及牌桌不重新開始，原生loop；首次有效操作才建立／載入，`preload=none`，不預載整首、不await音樂後才進桌。
- 設定→聲音：獨立背景音樂開關、0–100%音量（預設35%）。使用獨立Web Audio GainNode，處理iOS忽略HTMLMediaElement.volume的情況；不套聲效master。無Web Audio時退回媒體音量。
- 偏好鍵 `charity-casino-music-v1`，不寫入挑戰／舊存檔、不帶入備份；原聲效mute／volume鍵保持。儲存失敗只影響本次偏好，顯示提示。
- 手動暫停、背景／失焦、pagehide及手機直向均停止音樂並保留currentTime；繼續後接續。手機瀏覽器要求手勢才可開始或恢復，不繞過自動播放政策。
- 載入／播放拒絕不阻塞遊戲、不在100ms迴圈重試；下次有效操作可重試。pending播放期間切背景亦會保持靜音。

## 橫向

- iPhone／iPad／Android，以及MacIntel＋多點觸控的iPad桌面UA均識別；未知觸控平板以coarse pointer＋實際screen尺寸後備。桌面窄視窗不強制轉向。
- 優先讀實際screen.orientation.type，其次iOS window.orientation，再以layout viewport後備，避免軟鍵盤縮短visual viewport而錯判已轉向。
- manifest宣告 `orientation: landscape`。行動裝置手勢嘗試Screen Orientation API，拒絕或不支援時安靜後備；不強制全螢幕，也不聲稱Safari允許網頁強制旋轉手機。
- 手機／平板直向為深玉綠金邊提示遮罩，底層inert及aria-hidden，阻止表單／點擊／鍵盤遊戲操作。主要文字24px、說明17px、附註16px；不以CSS旋轉整頁或縮小賭桌。
- 遊玩中轉直向沿既有背景暫停路徑，兩倒數、牌局、籌碼及道具狀態保持；回橫向仍需按「繼續」，不自動下注、不派彩、不開新局、不補滿五分鐘。設定開啟時保留設定並返回暫停選單。

## 封裝與載入

- root、docs/play、Vercel輸出同步32個runtime檔及同一MP3。單檔離線HTML內嵌MP3並驗逐byte；原13張runtime圖片及書籤圖示不改。
- 本地server補MP3 audio/mpeg、HEAD／Range 206及416、WebP／social素材路徑。遠端GitHub靜態託管維持原流程。
- 新版瀏覽器實測發現既有TableArtCache將Window計時器當成instance方法，觸發Illegal invocation，改預設wrapper保留Window呼叫語意，附回歸及實際入桌零console error。沒有加回全圖等待門檻。

## 驗證

- `npm run verify`：416單元／組件＋7單檔，全部通過。
- `npm run verify:pages`：11通過；`npm run verify:vercel`：4通過。共438項；重複prepare不另計。
- 新音樂測試包括手勢前零建立／請求、loop、單一element、音量／偏好、iOS GainNode、mute、pending背景競態、autoplay拒絕及儲存／媒體不可用。
- 轉向測試包括手機、平板桌面UA、鍵盤、桌面不限制、原生lock拒絕、直向擋開始、投注後保留兩倒數／籌碼、手動繼續及設定返回路徑。
- Chromium實際MP3解碼／播放、接近曲尾循環、前後currentTime、觸控模擬932×430→430×932→橫向、1024×768及1366×1024設定、無整頁捲動、MP3 Range 206、音樂失敗仍進21點。詳細原始證據及截圖在本機 `docs/qa/0150/`，不當成真iOS測試。
- 本次新環境已成功啟動本地server及Chromium；此前交接的IPC限制已非本次阻擋。沒有以舊限制跳過實測。
- 發布／公網結果分開記於 `MUSIC_LANDSCAPE_RELEASE.json`，只有實際完成才標示published。

## 未驗與回退

未驗iPhone16 Plus／實體iPad Safari、Android Chrome原生orientation lock與主畫面安裝、裝置靜音開關及藍牙／耳機中斷、VoiceOver、真機長時溫度／耗電、實際聽感。模擬及HTTP不代表上述通過。Vercel仍待帳戶授權，沒有新部署或更改Cloudflare／D1。

可回退前端0.14.2 commit `75a809bdae04381dd19c2a91cc5c1a52fbb0783f`；保留本機存檔及D1，音樂偏好即使留在storage亦不影響舊版。

## UI／UX檢視

待實機事項優先：P1確認Safari安全區與實體轉向；P2確認VoiceOver在旋轉遮罩及返回焦點。截圖未見遮擋主要文字，主標24px／說明17px／附註16px；背景深玉綠與金色保持原風格，沒有新增牌桌常駐HUD。手機設定新增內容在原局部scroll內，footer仍固定可達。首次進頁提示明確要求橫向，轉後五桌與主選單保留。30秒繼續意願屬設計估計，未做玩家研究；Google Play未上架，風險評分只代表本次UI的估計嚴重度。

==========

UI Score

Readable
8/10

UX
8/10

Accessibility
6/10

Commercial
8/10

Retention
7/10

Google Play Risk
3/10

==========

Priority

P1 真手機Safari橫向／安全區與音訊恢復確認。

P2 VoiceOver旋轉後焦點驗證。

# 0.11.1 · A款金印賭字書籤圖示

使用者已選「要a 然後實裝」並要求繼續工作，先預覽限制已解除。於既有GitHub遊戲持續實裝流程更新原main／Pages；只接A款，不重新生成或改圖案，不開排行榜／Cloudflare或商店。

## 接線與資產

public/icons/a-gold-seal-v1/source.png保留已批准1254px原圖，SHA256 399b38328c1748a5cd68e69e53364b8580db3c2e7c340b94ed4e1359c1d7ee09。來源OpenAI image_gen，原始檔／另外兩款預覽都保留。

scripts/export-bookmark-icons.mjs只做ImageMagick瀏覽器尺寸／格式輸出：favicon-16.png、favicon-32.png、favicon.ico（16／32／48）及180px apple-touch-icon.png；不裁切、補邊、重繪或修圖。重製時需ImageMagick，平常執行／測試／封裝只用已提交輸出，不需該工具。

根index.html以明確相對路徑及版本化目錄a-gold-seal-v1＋?v=0.11.1接四個icon links，加入iPhone書籤標題「五分鐘賭神」。Pages同步至docs/play/public/icons，docs/index.html改相對連結；專案路徑下不會誤指github.io根目錄。開發server允許public/icons並回傳ICO MIME。無新增Web App manifest／Service Worker或改全螢幕模式。

正式頁面不引用2.6MB原圖；四個小圖合計71,962 bytes，瀏覽器自行選用。單檔HTML將四圖各自內嵌data URI，不需外部圖示檔；原遊戲__CASINO_ART仍只有12張遊戲PNG。正式原圖只作重製來源，不加首頁預載／入桌門檻。

## 保留與驗證

25個runtime檔案在忽略cache版本後與已發布0.11.0一致；唯一其他server變更為圖示路由／MIME。Game／保存／五桌／計時／音效／主畫面及12原PNG不改，商店與道具開關維持false。整套cache版本同步0.11.1。

357項（346規則／元件、4單檔、7 Pages）通過；新增2項PNG／ICO資產完整性、1項離線內嵌、1項根／docs連結與精確圖檔匹配。Python/Pillow只獨立解碼檢查PNG及所有ICO尺寸與不透明，不用於製圖。已目視180px圖示；不將該圖或檔案測試當成實際Safari行為證據。

真Safari分頁圖示、iPhone16Plus加入主畫面遮罩、16px識別及舊書籤快取替換未實機驗證。舊主畫面圖示可能保留快取，可由使用者刪除舊捷徑後重新加入網站；不要清除遊戲存檔。沒有重試已知HTTP／Chromium IPC限制。

## 發布與回退

同jacobmaster-97/charity-casino main／Pages，以2a6d8eb09201abe7ed6456874d6850cff1328e61為基準，舊30PNG副本不變。新圖示以base64 Git blob上傳，完整230＋新增檔案SHA核對後expected_sha／force:false更新main，核對Pages head_sha及成功狀態。實際結果見BOOKMARK_ICON_RELEASE.json；事後收據及交接不另觸發部署。

回退整套0.11.0與快取版本，保留存檔；該版書籤為空圖示，商店及道具仍關閉。

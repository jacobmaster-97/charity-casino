# DEBUG_HANDOFF

## 0.11.0 · 已確認21點橢圓桌接入，準備授權發布

使用者「實裝到github」已批准v1並授權原main／Pages，取代先預覽界線。手機橫向莊家上方／玩家下方，無頭像、真手牌／下注／點數及當前手倒數；分牌1–4手，窄屏僅手牌列滑動，換手置中、原手保留滑動。48px主要動作、35.2px既有頂欄例外，保險／派彩／明細維持原流程。桌面／直向原布局保留。

商店及道具GAME_FEATURES兩項保持false，原庫存與12PNG保留、不自動重擲／開店。新增呈現不改Game派牌／賠率／派彩／五分鐘／保存。353項（344＋3＋6）全部通過、25runtime／Pages一致。新增測量配置／四手DOM／滑動跟隨3項；原500五分鐘與10,000局回歸保留。測量與DOM為替身、browser_smoke僅Python編譯，非Safari或實機證據；沒有HTTP／Chromium IPC重試。

單檔29901233 bytes，SHA256 74661e766ef1a4426108eaeb2824773d804065172feb6e8589b2d8ea7eb65210。詳docs/BLACKJACK_OVAL_0110.md／BLACKJACK_OVAL_VALIDATION.json。真Safari／安全區／1–4手觸控／長手牌／旋轉、桌面／直向視覺及音訊／原生分享未驗。下一步核對main基準2ba346e82210681b29e2c41bee9b7895af8d2a80、準備快照、blob SHA及expected_sha／force:false發布，待Pages成功再記收據。無排行榜／Cloudflare。

## 最新：21點設計僅預覽；道具停用保留庫存

這輪是新設計預覽及明確功能收起，不是上一版布局再次失敗。以獨立示例SVG／PNG供確認，避免未批准新桌直接上線。Game配置與save分離，不能只藏按鈕而仍讓舊重擲券自動進入10秒選擇；現已加入口／直接API與自動重擲三層約束。

使用者第2點已在本機0.10.2完成：src/rules.mjs GAME_FEATURES {shop:false,items:false}傳入Game，隱藏大廳商店／五桌道具及規則文案，阻止隱藏事件／直接購物與道具API、舊庫存自動重擲；不刪庫存／資產／舊程式、不退款、不加排程自動開放。Game底層預設仍支援舊功能回歸，app明確套停用配置，restore不覆寫配置。未來只按使用者決定重開兩開關，跑回歸及重封裝。

350項（341＋3＋6）通過，新增引擎3／app2；原500五分鐘及10,000局保留，12PNG原樣，25runtime／Pages一致。browser_smoke改成無商店／道具路徑，只Python編譯。三PNG 1864×860已檢視，SVG／PNG與28按鍵靜態範圍檢查通過；非瀏覽器或實機證據，真Safari／safe-area／1–4手與長手牌／換牌／原生分享與音訊仍未驗，未重試HTTP／Chromium IPC。詳docs/FEATURES_PAUSED_0102.md／FEATURES_PAUSED_VALIDATION.json及預覽README。

本機單檔29,894,596 bytes，SHA256 8088a765f7b49cc2dd101ab37047a816f8d663990eda83968ffbb14cc9074262。GitHub與dist/github-upload仍原0.10.1 commit2ba346e82210681b29e2c41bee9b7895af8d2a80、224檔精確快照；本輪未呼叫GitHub／prepare，沒有發佈新桌或隱藏功能。dist/manifest清楚標本機0.10.2未發布，原公開網址仍0.10.1。下一最安全任務：等待使用者確認新賭枱外觀，再接真DOM／多手適配並按發布要求處理；不自行開商店、排行榜／Cloudflare。

## 0.10.1 · 修復發布及證據邊界

根因為舊導航與35%／65%上下配置，玩家手牌列再扣下注54px／操作／工具而被壓扁。修正為左右分區及獨立動作底列、下注30px；舊短直向非當前手規則明確排除blackjack-mobile，換牌非重疊44px目標配局部橫向滑動。測試替身曾覆寫resize listener，已改累積並驗證旋轉／暫停不改局與餘秒。

以原main 2dfb64310848ed15dd973caf84644312dbee1f85為parent及expected_sha、force:false發布commit 2ba346e82210681b29e2c41bee9b7895af8d2a80／tree 6f1e0cfeb8b00105785742c5248930037c8bc0ef；224檔blob SHA全吻合、60變更、30PNG副本不變。Pages run 41773328646 completed/success，head_sha與main核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.10.1 。詳docs/BLACKJACK_LANDSCAPE_0101.md／BLACKJACK_LANDSCAPE_VALIDATION.json／BLACKJACK_LANDSCAPE_RELEASE.json。

345項（336＋3＋6）通過，25runtime及12原PNG一致。單檔29,892,936 bytes，SHA256 9d628eedc4d4990d8d885944741beb535cd0613d916e04b0a8693d698f255fab。browser_smoke僅Python編譯，Node／DOM替身不代表真CSS。未重試HTTP／Chromium IPC，未直接HTTP核對公開頁。真iPhone16Plus Safari比例／safe-area／工具列、1–4手／換牌滑動觸控、iPad／桌面／直向視覺及音訊／原生分享仍未驗。

沿用前次實裝至GitHub後同一頁面的修復範圍；無排行榜／Cloudflare／付款。dist/github-upload保持224檔精確發布快照，事後收據／本地交接不另部署；舊ZIP歷史包。下一最安全任務：iPhone16Plus開?v=0.10.1玩21點，檢查保險／分牌／換牌及旋轉／暫停，確認牌面與五鍵完整、整頁不用捲。回退整套0.10.0及快取版本，保留存檔。

## 0.10.1 · 21點手牌裁切根因與修復

截圖對應舊21點未加入mobile HUD及35%／65%高度再扣工具／54px下注列，使手牌彈性列被壓至幾像素。現用共享剩餘高度的左右分區及獨立操作列，下注30px；隔離短直向隱藏非當前手CSS，修正選牌重疊及24px硬下限。新增旋轉測試最初發現事件替身覆寫前一resize listener，改累積後通過；不是正式app故障。

345項（336＋3＋6）全部通過，Pages25個runtime與12原PNG一致；browser_smoke僅Python編譯。詳docs/BLACKJACK_LANDSCAPE_0101.md及VALIDATION.json。真Safari比例／安全區／1–4手／換牌觸控／直向與桌面視覺仍未驗，未重試HTTP／Chromium IPC。沿用前次實裝至GitHub後同一已部署頁面修復，下一步核對原main基準與blob SHA、expected_sha／force:false發布並核對Pages；不開排行榜／Cloudflare。

## 0.10.0發布結果已核對

已依使用者授權發布commit2dfb64310848ed15dd973caf84644312dbee1f85／tree 9134056d068e2a4c8eb1a2f41f54ee4c0b6df979；expected_sha、force:false更新main成功，221檔SHA吻合、63變更、30PNG副本不改。Pages run41771348441 completed/success且head_sha核對，收據及dist metadata同步；事後文件不另觸發部署。

完整340項（331＋3＋6）通過；真實checkpoint分享接線不改Game／保存，取消不下載、fallback／retry／stale callbacks及編碼timeout已檢查。Canvas字寬替身正常樣本285px不足已改292px，同測試回綠；金額保留精確分，長圖高度8192保護，不輸出截斷金額。

未執行真Safari、Canvas像素／字型／share sheet／目標App、DOM／讀屏／safe-area／觸控／旋轉／捲動及音訊硬體驗證，沒有重試已知HTTP／Chromium IPC，未直接HTTP核對公開頁。下一最小驗證：iPhone16Plus用https://jacobmaster-97.github.io/charity-casino/?v=0.10.0完成挑戰後按分享，檢查PNG真數字／兩種時間顯示、取消及不支援時下載，不重算牌局。

## 最新：v3正式接入／分享資料與失敗路徑檢查通過

已按使用者實裝至GitHub接入真正結果DOM與本機Canvas PNG。分享source為完成checkpoint的凍結複本，renderer不讀Game可變狀態，晚回呼sequence隔離；Native File在點按前準備、取消不下載、無canShare時下載PNG，拒絕提供明確fallback，產圖／10秒編碼逾時可重試。裝飾圖2.5秒超時用本機底圖繼續，不影響牌局或重新發獎。

新Canvas字寬替身最初讓正常9字金額超285px而換行，PNG高1000及全文分兩次fillText使兩項斷言失敗；主數字可用區改292px（右緣316、分隔線317），同測試復綠，長數仍換行不截斷。最終340項（331＋3＋6）通過。

沒有canvas／@napi-rs/canvas／skia-canvas本地模組，不安裝新依賴；沒有實際Canvas像素或真Safari分享驗證。browser_smoke增加PNG下載signature／尺寸、失敗／完成時間及modal捲動但僅Python編譯。不重試已知HTTP／Chromium IPC。原始12PNG不改，25runtime同步；準備同main／Pages發布，下一步核對SHA及run，結果另記收據。

## 最新：挑戰記錄v3失敗介面優先顯示

上輪最終回覆展示的是失敗分享PNG（純圖），使用者要求失敗卡也有返回／分享鍵。本輪明確分開：phone-bust是有兩鍵的紀錄頁，share-bust為純PNG輸出；預覽預設phone-bust，避免把純分享圖誤認成完整介面。失敗label改遊玩時間，完成的所有視圖均不顯示時間；只改預覽顯示，不改Game時間數據。

六SVG／六PNG、失敗home／share操作及時間條件檢查通過，9項API替身仍通過。107正式檔、v2的23檔SHA不變；所有圖為Inkscape靜態、所有成績為示例，未驗Safari分享或真正DOM。沒有新規則／存檔變動、未發GitHub，HTTP／Chromium IPC仍不重試。下一步待確認後才正式接入及實機驗證。

## 最新：挑戰記錄v2隔離分享與狀態檢查

使用者確認第2點只刪底部淨贏取說明，五桌金額保留。六組v2預覽已通過刪字／30行／8操作框／分享卡零按鈕與PNG解碼檢查；未改正式0.9.4。107正式檔與v1的15檔SHA一致。

分享試作避免點按後await產圖以保留使用者啟動狀態；狀態變更用sequence保護，準備新圖片及原生分享busy分開，避免分享中切換狀態讓按鈕提早開啟或分享舊檔。9項API替身檢查通過，含原生成功／不支援／非安全來源／取消／拒絕／canShare拋錯／快速切圖／busy與fallback。沒有實際打開手機分享選單，也不自動選收件App。

本機file／不支援的瀏覽器可能只可下載；要用HTTPS Safari測真PNG分享。現在固定示例卡只供預覽，正式需按checkpoint動態繪圖。未重試HTTP／Chromium IPC、未串Game／改存檔／發布。下一步待外觀確認後驗證真機與動態出圖，不能把API替身或PNG靜態圖當作已完成iPhone分享。

## 最新：挑戰記錄預覽v1的靜態輸出修正

僅製作設計，不改正式0.9.4。Inkscape初次對nested SVG overflow未完整裁去籌碼atlas，顯示多顆並越界；改按原chipSprite方式加明確clipPath，目視正常。小橫向註解初次與footer分線相交，縮小row gap及調整註解baseline後分離；這些是預覽排版修正，沒有改PNG像素或正式CSS。

Inkscape因profile／font cache目錄只讀發警告，但四張PNG皆匯出、可解碼、尺寸及目視通過。107正式檔SHA不改，四SVG／四PNG／8操作框／20統計列及示例帳式通過；未使用真瀏覽器，沒有再試已知HTTP／Chromium IPC。不得將靜態渲染當Safari／點按證據，或套用舊325項當預覽檢查。

目前停在使用者明確先預覽的階段，正式及GitHub保持0.9.4。下一步等確認；如果批准，實裝前補長姓名／超大金額及真正viewport重排，保留0.9.4即入桌修正，不重新加入全圖門檻。

## 0.9.4已部署，使用者確認慢在入桌（2026-11-03）

補充回答為「點選遊戲後，等候進入牌桌」，與已證實的全圖門檻相符。原Promise永不完成會留lobby，修正後同一事件入桌；取消全局warm及強制decode，沒有載入完成導航狀態。325項通過，沒有Game／派彩或PNG改動。

已承接前輪原倉庫發布授權更新main commit061601d3b6d73611bd2a7cc364caf7f298c495ae／tree 8d6b27eb53fdc078930fd43fdc495db25184c293，expected_sha且force:false成功；215檔SHA吻合、57變更、30PNG副本不改。Pages run41665773585 completed/success且head_sha核對。收據LOAD_RECOVERY_RELEASE.json及dist metadata同步，事後文件不另部署。

仍未量測Safari真實冷暖耗時／頻寬／CPU／記憶體，移除門檻不代表PNG下載變小或已知快多少；冷圖仍可能逐步出現。HTTP／Chromium IPC不重試；瀏覽器smoke只Python編譯。下一最小驗證：iPhone16Plus開https://jacobmaster-97.github.io/charity-casino/?v=0.9.4點每桌，確認即入且原計時／派彩完整。不要再次加入全圖門檻或全局warm。

## 0.9.4根因驗證及修正通過（2026-11-03）

0.9.3首頁warm9圖15,021,561 bytes，大小入桌必等8圖12,833,572 bytes及decode。以永不完成請求測試原版26過1失敗（lobby != table），證實入桌門檻。修正為同步入桌、無首頁warm、只意圖hint最多2圖／全清單3種，不呼叫decode，沒有下載回呼改Game。全325項通過，未改Game／規則／PNG。

測試新fixture第一次因start:false未填姓名而失敗，補姓名後app29／layout25及全套通過，非正式程式缺陷。node --test包裝首跑未回個別斷言，改專案原node runner得到明確紅燈；不再用該包裝當證據。

承接剛才GitHub發布授權修復同遊戲回歸，待核對Pages，結果另記LOAD_RECOVERY_RELEASE.json。不要再次加全圖門檻／全局warm／強制decode。Safari瀑布圖、冷暖秒數、CPU記憶體及冷圖觀感未驗；原HTTP／Chromium IPC不重試。

## 最新：0.9.3載入變慢，先驗證入桌門檻（2026-11-03）

使用者發布後回報比之前更慢。源碼證據：首頁idle warm全部9張，入桌Promise.all等該桌4–8張圖load＋decode後才Game.enterTable；圖片位元組沒有減少。根因假設：全圖門檻直接增加點擊等待，無關預載及解碼亦可能爭頻寬／CPU；後者未取真Safari瀑布圖，不當成實測。

最小可否證測試：模擬永不完成的貼圖請求，click table應在同一事件進桌；先用0.9.3得到lobby而非table作紅燈。再取消首頁全圖warm及入桌門檻，將預讀限於指向／聚焦／觸碰的該桌1–2張主要素材且不await，不允許晚到回呼導航／扣時／改Game。保留派彩及名稱框；不得再次加全圖或15秒門檻，勿僅縮loading文字。

沿HTTP／Chromium IPC停止重試，無真機載入秒數證據。先完成本機修正、測試及交接；線上仍0.9.3，沒有本輪發布指示。

## 0.9.3發布核對完成（2026-11-03）

已依使用者授權發布1fb3a7bb6c8f4d79e0ab4fd74474158ef98dedb9／tree 58090b221dd67b223bad2d670afebdb459f206d4，以expected_sha、force:false更新main，沒有拒絕或並發變更。212檔blob SHA全吻合、62檔變更、30PNG副本不改。Pages run41657918981 completed/success、head_sha吻合；UI_POLISH_RELEASE.json與dist metadata同步，事後收據及本地交接不另部署。

發布前完整322項（313＋3＋6）通過，封裝SHA與先前本機0.9.3一致，沒有新遊戲修改。保留原HTTP／Chromium IPC停止重試，未啟動；browser_smoke僅Python編譯。未驗Safari實機小視窗、真DOM、旋轉／safe-area／觸控／捲動、實際載入秒數／解碼記憶體及音訊，也未直接HTTP核對公開頁。下一最小驗證：iPhone16Plus開https://jacobmaster-97.github.io/charity-casino/?v=0.9.3從冷快取開始逐桌入座與結算，測載入取消及背景恢復；不要以Pages成功宣稱性能已量測。

## 0.9.3發布準備：原遠端基準核對（2026-11-03）

使用者已授權發布，遠端main仍為預期0.9.2 cba6438bb85dc486970e8dcb151a9766a3b54f4b，沒有並發變更。既有322項本機檢查已完成，發布前再核對封裝與Pages。禁止以舊inline框測試回退新介面，無須改Game；只上傳已完成內容與交接。

以原base tree建立差異、逐檔blob SHA核對、expected_sha且force:false更新。實際commit／run結果另記收據。保留HTTP／Chromium IPC停止重試及Safari／載入秒數未驗證，沒有雲端或排行榜。

## 最新：0.9.3驗證完成／未實機（2026-11-03）

根因與修正：station沿原column flex頂齊，已在lobby owner加align-items／justify-content center，44px不變。舊inline result佔牌桌高度，已五桌統一移至app modal，只讀既有result，不重算／派彩。貼圖原入桌後才load／decode，新增同URL九圖cache及帶取消／重試／暫停／截止防護的準備視窗；每張圖15秒逾時後可重試，沒有永久卡死。

新增app9及cache5項、完整322項（313＋3＋6）通過，含反覆開關／下局不重派、五桌、破產、揭曉先後、背景、過期回呼、decode失敗／逾時重試。browser_smoke只Python語法。12PNG／24runtime鏡像及0.9.2發布209檔快照核對通過；其餘mjs只有快取版本差異。

本輪舊模板測試依次在board next、mobile-poker pk-result及roulette「已保存完成局」失敗，因畫面已按需求移至modal；只更新舊視圖契約，app測試承接實際next／leave／保存金額顯示，不為舊選擇器把大結果框加回，不改Game。bust測試原誤用schema1 lost，改為schema2 finished＋endReason bust。這些屬測試遷移，最後完整verify通過，沒有未解規則失敗。

未重試HTTP／Chromium IPC，未跑Safari真DOM／觸控／安全區／地址欄／旋轉／捲動／記憶體／載入秒數及音訊；首頁預載不等於真機變快證據。沒有GitHub mutation或雲端；線上仍0.9.2。下一最小驗證：可用Safari環境冷快取開始、依序五桌入桌／結算、取消與背景準備再恢復，記錄冷暖時間和小視窗界內；不重試舊受限路徑。

## 0.9.3維護中：派彩移位後回歸斷言更新（2026-11-03）

新增app26項及貼圖cache5項已通過。完整verify先在board舊next斷言失敗，搜尋更新四款舊inline next預期後，第二次在mobile-poker另一個pk-result斷言失敗。根因為原畫面合約已由使用者要求改為查看派彩入口，沒有Game或派彩錯誤；不可為了舊選擇器把大結果框加回，或改計時／派彩。

mobile-poker15項已通過；後續全套在roulette舊「已保存完成局」文字斷言失敗，該文字亦移至app modal。已全面搜尋原結果框、next及保存字句，下一步更新唯一剩餘文字預期，再跑roulette27及sound24、完整verify／Pages。所有next、leave、manual-save與防重複派彩改由真app的五桌modal檢查承接。另bust測試曾錯把schema1 lost套到schema2，已按既有Game finished＋endReason bust修正測試。未重試HTTP／Chromium IPC，不將Node替身當Safari。

## 0.9.2發布及證據邊界（2026-11-03）

已獲使用者授權，main以expected_sha、force:false發布cba6438bb85dc486970e8dcb151a9766a3b54f4b；tree 612b98949fe25292926f9bd43bf5a0c447bef823，209檔SHA吻合、56變更、30PNG副本不改。Pages run41607230248 completed/success且head_sha核對，build／deploy／report-build-status皆成功。收據LOBBY_WIDE_RELEASE.json及dist metadata同步；事後交接／收據不觸發第二次部署。

308項通過（299＋3＋6）；12runtime PNG／24src Pages鏡像逐位元組通過，沒有新玩法修改或GitHub拒絕。保持原HTTP／Chromium IPC停止重試，沒有啟動；Python smoke只編譯。Safari真矩形／safe-area／地址欄／旋轉／捲動／44px點按／音訊及公開頁直接HTTP仍未驗。下一最小驗證：iPhone16Plus開https://jacobmaster-97.github.io/charity-casino/?v=0.9.2橫向查看五桌入口及上下取景；極短高度回完整圖為設計fallback。

## 0.9.2：確認填寬後實裝／發布準備（2026-11-03）

舊contain因高度限制產生內側留白。已按使用者確認接入真DOM frame量測及等比例width fill；scene絕對定位並移除max-height:100%防止圖被壓扁，切回contain重設left／top。五入座座標共用scene，依offsetHeight保護8px邊界；很矮時fallback contain。預覽812×363.8金值符合，沒有硬寫示意安全區。

308項通過（299＋3＋6）；新增6項含視口、金值、短高、fallback、60px實際按鍵替身及非法尺寸，Python編譯通過。12 runtime PNG及24 src Pages鏡像已逐位元組核對。一次性檢查曾把未發布舊v3 PNG及docs/play/art歷史副本當成目前runtime，斷言失敗；改依12張runtime清單及24 src檔核對通過，非遊戲缺陷，沒有為此修改素材。

原HTTP／Chromium IPC限制未重試，真Safari安全區／地址欄／旋轉／捲動／點按及音訊未驗證。GitHub發布授權已獲得，當前基準0.9.1 commit735e739；實際commit／run於部署後寫收據。下一最小驗證為已發布?v=0.9.2的iPhone16Plus橫向，不以模型冒充實機。

## iPhone 16 Plus左右留白：只製作填寬預覽（2026-11-03）

使用者0.9.1實機截圖顯示圖框內左右仍空白；來源fitLobbySurface使用min(frameWidth,frameHeight×原圖比例)以完整顯示整圖，寬橫屏受到高度限制，非padding再縮一點能消除。原計畫改填寬，使用者隨即要求先預覽，故沒有做任何runtime／CSS／快取變更。

只新增lobby-iphone16plus-wide-v1的SVG排版及PNG／HTML對照。取景由居中改偏上15%，避免裁掉上方壁畫人物頭部，下方前景裁切較多；五按鈕均44px完整可見。SVG初次按鈕8位色輸出黑色，改6位色＋fill-opacity後目視正常，此為靜態輸出修正，非正式CSS問題。102份正式檔SHA不改。

3PNG解碼／尺寸、XML、10入座幾何及JS語法通過，812px填滿／25.6%放大是示意模型，左右59／下21安全區未讀自裝置。Safari實際viewport／地址欄／旋轉／觸控未驗證，不跑或挪用舊302項，不重試HTTP／Chromium IPC。下一步先等確認；若日後實裝，需讓同一scene／入座點同步放大、依真正安全區及高度處理裁切，不只改img寬度造成按鈕錯位。

## 0.9.1已發布／部署核對（2026-11-03）

使用者已授權更新GitHub，遠端0.9.0 head與預期一致；以expected_sha、force:false更新main成功，commit735e739a1a32dcdf7812228d3b36645359fc1e39／tree f495bbacb565a7eec40028a101c475dccbc90889。206準備檔SHA吻合、56變更、30PNG副本不改。Pages run41602536032 completed/success且head_sha正確；完整302項發布前檢查通過，無新玩法修改，未遇GitHub拒絕、未讀取或索取權杖。收據LOBBY_VIEW_RELEASE.json及本地metadata更新，不再觸發第二次部署。

未直接HTTP核對公開Pages，Safari／實際DOM矩形／橫向旋轉／35.2px點按／安全區／長金額與硬體聲效仍未驗。保留HTTP／Chromium IPC停止重試，未重試；部署成功只證明GitHub發布層。下一個最小驗證：iPad／手機開?v=0.9.1看地圖及更多，核對商店／暫停與到時結算；不擴做排行榜或付款。

## 0.9.1：大廳高度分配與更多收尾（2026-11-03）

使用者舊版實機截圖顯示高度受限的地圖；來源確認底列44px、進度條3px及內gap8px仍佔flex高度，上方標題／大商店鍵又覆蓋地圖，HUD44px。移除該列／條及遮擋，把商店／更多／暫停放35.2px HUD，按原fitLobbySurface保持原圖與hit target比例。估算回收63.8px是CSS算式，不是假裝量到新Safari畫面。

新更多沿原overlay，必須加進到時覆蓋列表，避免截止仍停留說明。新增5個app替身檢查通過。鍵盤收尾假設：Escape直接closeOverlay重設last，可能漏計前一interval後的時間；以75ms只推performance、不發interval後按Escape，先得到0!=75。補advance後再close，回歸75ms且完整302項通過，不改Game。一次性HUD擷取helper首跑漏傳overlay而ReferenceError，傳null後三個HTML解析通過，非正式app缺陷。

302項＝293＋3＋6，12原runtime PNG不改、24runtime同步。browser_smoke已加35.2px／map可用高度／入座矩形及更多路徑，但只Python語法；實機／Safari／軟鍵盤／安全區／35.2px點按／超長錢額及音訊未驗。繼續禁止重試已知HTTP EPERM／Chromium IPC，沒有啟動該路徑。此輪僅本機0.9.1，尚未更新GitHub，無排行榜或付款。

下一個最小驗證：手機／iPad橫向看頂欄35.2、地圖與五入口，更多開啟時倒數照計，讀檔返回及背景停錶；真正矩形與體感需要裝置，不能用模型或Node替身代替。詳LOBBY_VIEW_091.md及LOBBY_VIEW_VALIDATION.json。

## 0.9.0發布前：素材測試依賴未發布預覽（2026-11-03）

根因假設為prepare-github刻意排除docs/previews，但home.test最後一項直接讀該路徑。最小反證：只複製該測試、home-view及兩正式圖／assets.json至乾淨暫存來源後跑Node，7過1個ENOENT；符合假設。已改以隨倉庫發布的assets.json批准SHA核對圖片，不減少完整圖checksum，也不把整批預覽放入正式發布。完整297項及無預覽的準備來源home8項已通過，遊戲程式未改。

以0.8.0 expected_sha非force發布main成功，commit4cc7a668d3b9e9dac989a97fab155445669a8e83／tree c4b91b6234608aa453b77a9712b2210561861036。203準備檔SHA一致、68變更、新兩圖4份副本、舊26PNG副本不改。Pages run41567146790 completed/success、head_sha正確。HOME_SCREEN_RELEASE.json及本地發布metadata記錄，事後交接不另部署。未遇GitHub拒絕、不索取或讀取權杖。

Safari／真DOM／鍵盤／觸控／聲效硬體仍未驗，未直接HTTP核對公開Pages，沒有重試已停止的HTTP／Chromium IPC路徑。部署成功不是實機證據；不接排行榜／付款。下一最小驗證為iPad Safari開?v=0.9.0，確認四入口、新挑戰及續玩餘秒，並轉向／試聽。

## 0.9.0：主畫面已實裝，事件與封裝證據（2026-11-03）

使用者已批准v2實裝，並非再次僅預覽。舊首頁表單直接可見，現由四入口開原overlay，姓名／模式／續玩放開始窗，聲效／存檔放設定，不能只換整張PNG。新增home-view只管呈現／量測，Game及Saves保持owner；22個其他mjs本文與0.8.0相同（只更新快取query），無玩法改動。

軟鍵盤風險假設：既有render在oldModal時一律focus dialog，resize重繪可能令姓名欄失焦。已保留active id／selection，Node app替身證明重繪後聚焦與游標留存；實際Safari鍵盤未驗，不當已修實機問題。主頁專用backdrop按visualViewport高度，短橫屏表單兩欄及有界內捲；這是預防處理，非已觀察真DOM缺陷。Escape／返回還原主入口焦點回歸通過。

最終297項通過（288＋3＋6），含新16項主頁／事件流程及既有500五分鐘／10,000局；主頁及四窗HTML標籤平衡、browser_smoke.py只語法。12PNG／24runtime同步；新插畫／Logo等於批准原檔，舊十張runtime不改，無手圖。沒有瀏覽器／Safari／實際矩形／細書法／觸控／鍵盤／硬體聲效驗證，不重試舊HTTP EPERM或Chromium IPC／crashpad路徑。Node DOM替身及數學模型不可作為整頁不捲動／實機通過證據。

單檔及Pages目錄僅本機封裝，遠端最後0.8.0未更新；排行榜及支持作者不連網／付款。下一最小反證路徑為可用Safari橫向實測四入口、輸入時轉向與繼續讀檔餘秒。詳HOME_SCREEN_090.md／HOME_SCREEN_VALIDATION.json；若回復0.8.0程式保留存檔槽，勿清玩家資料。

## 主頁v2／五分鐘賭神透明Logo（2026-11-03）

使用者改名並要求電影感Logo，只修訂設計預覽，未修正式runtime。image_gen原創logo.png為RGBA2172×724，alpha0–255、與原生成檔SHA一致；以SVG viewBox／contain置入，沒有Python圖像編輯。v1背景直接重用且SHA一致，指定底部文案與舊重複小標已從三份SVG移除。四份展示圖及12按鍵幾何／XML／語法／95個正式檔不改通過。

已目視確認「五分鐘賭神」繁體五字、透明Logo放於上方留白、不遮臉，預覽仍需使用者確認。書法小尺寸筆畫辨識、Safari焦點／觸控／安全區尚未驗證；沒有OCR、真瀏覽器或遊戲接線，未重試HTTP／Chromium IPC失敗路徑，未以舊281項當新Logo證據。標準SVG陰影鏈沿v1修正保留，本輪無新輸出缺陷。

## 橫向主頁v1預覽及輸出修正（2026-11-03）

本輪為使用者明確要求先確認的設計預覽，沒有正式缺陷修復／Game或發布變更。只新增docs/previews/home-landscape-v1/及文件，95份正式檔事前SHA一致。不得將上一輪0.8.0發布授權延伸到本次預覽。

初次Inkscape輸出未顯示有filter的標題及按鈕，log明示unknown type svg:feDropShadow。假設是該輸出器不支援節點，以標準feGaussianBlur／feOffset／feFlood／feComposite／feMerge鏈替換後，三張PNG目視及解碼通過；不是正式遊戲渲染缺陷。另將標題放於上方留白，避免遮蓋新構圖人物。保留原始生成圖與分層SVG，可重製；profile／font cache目錄警告不影響此次成功輸出。

檢查包括3尺寸／XML、12按鍵幾何至少50px、JS語法、四選項字樣及原插畫副本SHA；純色對比最低4.67，並非真機像素對比。Safari、DOM焦點／觸控、安全區、iPad4:3及直向均未驗證；不重試既有HTTP／Chromium IPC失敗路徑，不用舊281項宣稱新UI可玩。下一步只等使用者確認設計；沒有排行榜服務、支付或支持外連，不自行接正式頁。

## 0.8.0：GitHub及Pages已發布，裝置驗證仍待做（2026-11-02）

此次只發布已完成的新挑戰，並非重開排行榜開發。遠端main與預期0.7.1一致，沿既有create_tree／create_commit／expected_sha、force:false更新ref成功。commit 28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65／tree 6fef4ace76b4df0f75c93dec4db10703f0fb61bf，192份準備檔SHA一致、67檔變更、26份PNG副本不改。Pages run41479517386 completed/success且head_sha吻合；未遇發布拒絕、未讀取或索取權杖。完整281項發布前檢查通過，收據LOCAL_FIVE_MINUTE_RELEASE.json。事後收據／本地交接不另部署。

保留既知HTTP／Chromium IPC停止重試限制，未重試；沒有直接HTTP驗證公開Pages或執行Safari。裝置、觸控、聲效硬體、長金額實際排版及原生背景／BFCache仍未驗證，不因部署成功標為通過。最小下一步為iPad Safari從?v=0.8.0確認05:00／$100及暫停／自動收尾。不開排行榜／雲端；回退可使用上一個0.7.1 commit並保留本機新舊槽。

## 0.8.0：本機五分鐘截止、精度及驗證邊界（2026-11-02）

第一階段現已實作，取代下方「本機尚未實裝」記錄。舊tick排除shop、GOAL／schema1只支援舊挑戰，單純換倒數文字不能完成新規則。已在原Game新增challenge分支、唯一closing／輸入屏障與最終保存，網頁入口明確啟用；舊引擎路徑僅供相容回歸。

截止邊界假設：先expire再扣本段round.remaining會把截止前時間扣進新鎖注動畫。最小反證為有投注、只剩100ms的挑戰tick100後，揭盅動畫必須仍900ms；現先耗原階段時間再expire，回歸通過。分牌收尾假設：只比phase會把同為bj-player的下一手誤判無進展；改比較phase／activeHand／turnId，多手各停牌並唯一結算通過。到時原咪牌、重擲、換牌、輪盤及德州選擇都按原超時預設，不重抽、不另派彩。既有牌局動畫繼續到完成，全球時間固定300000ms。

金額以整數美分的安全Number／BigInt操作，所有派彩、保本、AI籌碼、邊池及JSON對帳精確。首次大額德州保存測試用JSON字串比較把相同值不同鍵順序誤判，已改deepEqual，未放寬金額驗證。一次性HTML檢查最初誤找buy-前綴，實際正式按鍵為data-action=buy；修正檢查定位後商店四購買及結果五行／標籤平衡通過，無對應產品缺陷。

最終npm run verify及verify:pages共281項通過（272＋3＋6），含500次混合五分鐘、10,000局原回歸及大額實際德州／視圖。根與docs的23 runtime SHA同步；十張runtime原PNG／單檔嵌入／Pages一致。能與0.7.1上傳快照對比的11張public PNG一致，另7張非runtime舊素材無該快照，未聲稱全18張有比較證據。細節見docs/LOCAL_FIVE_MINUTE_VALIDATION.json。

未執行真瀏覽器、Safari、觸控、聲效輸出、原生背景／BFCache或實際畫面矩形。app事件測試是Node VM＋DOM替身，browser_smoke.py只語法檢查；不要把它們列為實機通過。遵守既有HTTP EPERM及Chromium IPC／crashpad路徑停止重試限制，本輪沒有啟動該路徑。主要未驗風險是極短橫屏／鍵盤、商店及結果長金額、音訊與原生生命週期。下一最小驗證是可用Safari實機走一局、暫停／回前景及300秒收尾，無需再重跑相同沙箱失敗。

本輪僅本機0.8.0及封裝，未部署，遠端0.7.1保持；未接排行榜或雲端。本階段到此停止，後續需依使用者另行指示。

## 提示詞交付邊界（2026-11-02）

本輪僅整理docs/DEVELOPMENT_PROMPTS.md兩份未執行提示詞；未實裝本機五分鐘或Cloudflare。執行順序已明確為先本機後排行榜。提示詞保留基本防護選擇及金額精度／完成局保存／收尾的必要檢查，未加入全程後端。只核對文件一致性，未跑遊戲或雲端測試，舊256項不是新玩法證據。


## 五分鐘精簡排行榜：使用者已選基本防護（2026-11-02）

只更新文件。已選完場只上傳名稱／金額，接受基本防護；不採短暫伺服器牌局、計時／派彩權威或完整流水。欄位／精度檢查、參數化SQL、安全顯示、限流與重試去重是現行範圍；不能據此宣稱能驗證真實金額／有效五分鐘。前端hash或CAPTCHA亦不構成遊玩證明。不要再要求用戶批准已未選用的完整驗證。詳FIVE_MINUTE_LEADERBOARD_PLAN.md與LEADERBOARD_ANTICHEAT_OPTIONS.md。

購物／大廳照計，手動／背景停錶。現Game GOAL/status、shop tick、schema1金額精度與本機到時收尾仍待實裝。正式0.7.1與既有HTTP／Chromium IPC停止重試限制保持，未執行新測試。


## 0.7.1：牌型隱藏／公共牌偏低／主畫面過長（2026-11-02）

根因假設及最小反證：0.7.0手機CSS隱藏自己標籤所有span，故牌型消失；新增專用pk-hand-hint與已知兩對／等待／棄牌的真renderer檢查。公共牌固定bottom82px，故高螢幕也靠下；改量測上三對手底牌與投注的最下沿，留8px，手牌前留10px，新增可用帶及短屏恢復檢查。主頁舊min-height＋長表單及大廳窄版按鈕逐列造成文件過長；改可視高度、收合次要項並以圖片／入座鍵同場景縮放，新增比例／未解碼fallback檢查。

一次性解析home/lobby模板，抓住場景包裝必須在底列前結束，已核對五個入座鍵在場景內、底列在外及所有標籤平衡。新增共5項，完整256項含封裝及Pages全部通過。browser_smoke新增真DOM牌型／上下距離／主畫面頁高路徑，但只Python語法，未執行。Safari、實際單屏可見性／安全區／鍵盤／長金額仍UNVERIFIED；沿用停止重試HTTP／Chromium IPC路徑。已發布main 690c6f02aaa194431fb7c263061d3ad17ee574d0，Pages run41389811878 completed/success；180檔SHA一致、49檔變更及26份PNG副本不改，無手圖。發布後收據／交接不另部署。詳POKER_READABILITY_071.md；可回main 58b6be2114e0bef5002637b40c8d0450742be7b5，不清保存。


## 0.7.0：德州無頭像手機圍桌實裝（2026-11-02）

新批准已解除v2只預覽限制。圍桌保留13目標／原Game，面板沿TablePanels，不另建計時或下注owner；turnId改變時清面板，旋轉profile獨立檢查，避免兩種mobile尺寸間旋轉未重繪。短橫屏將對手牌與注額合併姓名框；不是隱藏牌或另算結果。新增12流程＋2面板測試，251項含封裝與Pages全部通過。測試首次使用不存在的card-back類別造成一項失敗，已按正式renderer的「未揭示的牌」ARIA修正測試定位，未改合法透視或棄牌規則。

Pages檢查首次捕捉測試寫死0.6.3，已改讀package版本比對根／docs入口，避免以後版本更新漏修測試；未繞過快取同步檢查。

沒有可用瀏覽器工具；browser_smoke更新但只Python語法驗證。Safari實機、可視矩形、鍵盤、安全區、旋轉後焦點及長金額仍UNVERIFIED。保留既有停止HTTP／Chromium IPC路徑限制。回退MOBILE_POKER_ENABLED=false＋重封裝，不清保存；詳POKER_MOBILE_070.md。 已發布main 58b6be2114e0bef5002637b40c8d0450742be7b5，Pages run41384534881 completed/success；178檔SHA一致、26份PNG副本不改，發布後收據與交接不另部署。


## 最新：德州預覽v2無頭像（2026-11-02）

依使用者指示移除預覽所有角色圖示，沒有正式修復或部署。三張輸出／無頭像引用／23主控及6縮頂欄幾何／53正式檔SHA一致通過；實機仍UNVERIFIED，既有IPC停用保持。確認後才實裝限制繼續有效。


## 最新：德州橫向介面僅預覽（2026-11-02）

使用者明確要求確認後才實裝；本輪只新增docs/previews/poker-mobile-around-table-v1/的靜態SVG／PNG與切換頁。沒有正式程式／圖片變更或部署，53份正式檔SHA一致；3圖／23主控／6縮頂欄控制幾何通過，不是Safari或Game流程測試。頭像裁切曾有一張對到枱面，已在預覽資料改正並目視；正式遊戲不改。沿既有HTTP／Chromium IPC停用紀錄，未重試。加注時鍵盤／倒數、換牌、透視與結算需待確認後實裝再驗證。


## 0.6.3：下注金額與盤面印刷同色（2026-11-01）

來源確認大小／百家樂合計額原用暖金#f7ddb0、輪盤額#ffe3a1，與原印刷金色接近；面額原只有深綠字貼PNG。改用冷色：共用面額深藍／冰白底／青藍框，合計額亮青藍／深藍牌或描邊。沒有改資金、結果、位移、貼圖或五色外圈；純色數學對比12.37與12.64。browser_smoke.py新增getComputedStyle對比，只有語法檢查，未跑Safari／瀏覽器；237項及封裝／Pages通過；已發布main 7f36d66ef73c426c4ff6d85309739ba42a2f59c4，Pages run41314949072 completed/success，175檔SHA一致、46檔變更及26份PNG不改，手圖不存在已核對。發布後本地WAGER_COLORS_RELEASE.json及交接不另部署，既有IPC／HTTP限制保持。實機小籌碼底牌／長金額仍待驗證；詳WAGER_COLORS_063.md。


## 0.6.2：投注後盤面文字移位（2026-11-01）

輪盤截圖顯示15號文字左移；來源確定has-bet套translateX(-22%格寬)且150ms過渡。移除CSS位移、過渡及模板未再使用變數；大小原本是固定SVG／獨立籌碼層，補文字transform:none限制而不改骰面圖樣。沒有重算投注、改籌碼座標或碰資金／保存；百家樂讓位維持原樣。

browser_smoke.py補真getBoundingClientRect對比，在大小多注及輪盤精準下注後等飛行完成，檢查印刷文字內容、座標及尺寸；只Python語法通過，未跑瀏覽器／Safari，不重試舊IPC／HTTP。原237項及封裝／Pages已通過；已發布main 1870fb4bc2e7d2be2f0395ac41bb537ec296dbde，Pages run41313768889 completed/success。173檔SHA一致、46檔變更及26份PNG副本不改，手圖不存在已核對。發布後本地FIXED_BET_LABELS_RELEASE.json與交接不另部署。實機固定效果與遮擋程度仍UNVERIFIED；詳FIXED_BET_LABELS_062.md。


## 0.6.1：手機尺寸調整驗證邊界（2026-11-01）

依新使用者指示，頂欄實際flex/min/max高度及按鍵由44→35.2px，高選擇器避免舊pause-button最低高度擋住；文字14–16px。小窗transform1.2，先用反比約束未縮放寬／最高，遮罩跟新頂欄高度。這是顯示層調整，不修／更改Game、聲效、重擲／重轉或保存。browser_smoke.py補真實矩形比例及邊界，但目前只Python語法檢查；既有HTTP／Chromium IPC限制持續，不重試，Safari實際排版與觸控仍UNVERIFIED。原237項及封裝／Pages已通過；已發布main 7609a9725dccc5569ba38e65d3d11b5c4c2e7b03，Pages run41312983501 completed/success，171檔SHA一致、46檔變更及26份PNG副本不改、手圖不存在已核對。MOBILE_SIZING_RELEASE.json與發布後本地交接不另部署。詳MOBILE_TABLES_061.md。


## 0.6.0：手機三桌實裝與驗證邊界（2026-11-01）

根因／對策：常駐大小骰盅及輪盤右欄壓縮手機投注空間，已依使用者新指示只在鎖注後用真Game狀態開窗。只讀MobileRoundReveal保留1400ms終局展示、暫停及旋轉生命週期；重擲／重轉10秒仍交由Game，空注不假開獎。較窄控制列分行、不靠縮字，百家樂32:68並改善第三張與換牌容器尺寸。native更多dialog需先還原整個工具列才另開明細，已補三項生命週期檢查。

封裝曾捕捉新大小視圖escape與app名稱重複，專有命名後完整重跑；沒有改玩法修這個打包問題。另確認暫停遮罩z10高於動態小窗z9，原生工具在動畫／暫停前關閉。11項手機流程檢查含空注、10秒重擲／重轉、唯讀／唯一保存、恢復進度、旋轉及破產Game停止計分後仍可結束展示，不依賴額外Game計時器。

既有HTTP／Chromium IPC路徑繼續停用，沒有實機或瀏覽器能力，故未宣稱Safari／觸控／實際排版通過。browser_smoke.py只語法檢查。小格需放大／精準，極短高度、安全區、鍵盤及多狀態仍UNVERIFIED，音訊硬體輸出仍沿0.5.1待使用者回報。237項檢查及根／docs同步已通過；已發布main 4d57dee90b2aa8e6f092fb9fb214bc3868f6f315，Pages run41224588739 completed/success。169檔SHA一致、55檔變更及26份PNG不改，手圖不存在；發布後本地收據MOBILE_TABLES_RELEASE.json與交接不另部署。詳MOBILE_TABLES_060.md。


## 最新：GIF僅離線輸出（2026-10-31）

本輪只將大小v2預覽輸出8秒GIF，32張離線SVG獨立畫面以Inkscape及ffmpeg轉成69幀；全部解碼、尺寸／循環及52正式檔SHA一致通過。無正式玩法修復、無瀏覽器或裝置驗證、無部署；既有IPC／HTTP停用限制保持。示意固定2／3／4與+$50不可誤認為Game或真實派彩測試。

## 最新：大小骰盅彈窗仍僅預覽（2026-10-31）

使用者要求擴大盤面，v2撤掉常駐骰盅與五列密排，直接沿用正式原50格SVG，鎖注後才在小窗搖骰。只新增docs/previews/sicbo-mobile-modal-v2/及交接文件；52正式檔SHA一致，3圖／11主控／JS語法及50格通過，沒有正式修復或部署。瀏覽器／動畫／Safari尚未驗證；維持既有HTTP／Chromium停用限制。待實裝時必須覆蓋空注、計時暫停／背景、重擲券10秒選擇、展示與唯一派彩保存契約。

## 最新：手機橫向預覽的驗證邊界（2026-10-31）

使用者先要求調適，後改為先預覽，因此未修改任何正式程式／PNG、未發布。獨立docs/previews/mobile-landscape-v1/靜態合成以Inkscape輸出；只有5張圖解碼、65個控制矩形及52份正式檔SHA檢查。骰面首次靜態輸出因巢狀SVG沒有明確clip而顯示整張atlas，已在預覽生成器補專屬clipPath並重新輸出／查看，正式渲染器不改。這是預覽問題，不是遊戲根因或新實機修復。

既有HTTP／Chromium IPC停用限制與Safari音訊UNVERIFIED保持；沒有重試。本輪不能宣稱手機橫向已修好：小格觸控、其他可視尺寸、工具列、安全區、旋轉、多手及結算狀態仍需正式實裝後驗證，等使用者先確認設計。

## 0.5.1：使用者iPad Safari完全無聲

現象：使用者實機回報沒有任何聲效，後確認Safari，iPadOS未提供。0.5.0沒有實機證據，不能將當時217項替身／PCM通過當Safari通過。

確定程式缺口／最小重現：首次AudioContext.resume永不settle，第二次有效手勢才允許running；0.5.0 unlock遇pending直接return，導致實際native resume仍1次，預期2。已先新增回歸測試失敗（/tmp/ipad-sound-red.log），改為未running即重試、舊操作完成不得清新pending後通過。此證實程式路徑，不證實為該iPad唯一根因。

本輪一次相容性切片：touchend capture、手勢內單樣本靜音source.start／native resume先於PCM；可用時navigator.audioSession.type=playback，拒絕／缺失非致命。主頁／暫停「啟動並試聽」明確啟用並播籌碼聲，選單sync不立即切掉手動試聽；進入牌局、靜音、hidden／blur／pagehide停止並取消pending試聽。Game、結果、存檔、原音量與PCM不改，沒有偷偷加大音量或清偏好。

驗證：聲效24／全套223通過，新增6項與pending併發更新，原10,000局守恆保持，20個runtime及10張PNG不改；browser_smoke.py只有Python語法通過。工具清單沒有Safari／browser能力，未重試舊IPC／HTTP失敗路線。修正版iPad硬體輸出、iPadOS差異、音量／路由／靜音開關仍UNVERIFIED，待使用者按0.5.1試聽確認。若同一路徑再次修後仍無聲，不再反覆改resume或放大音量；先取得iPadOS及試聽輸出／路由證據再定新假設。已發布main 90b2f88f55ac09f3efa79e306f365b2bdb86adad，Pages run41166135901 completed/success；164檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記IPAD_AUDIO_RELEASE.json，發布後本地交接不另部署；實機試聽仍待使用者確認。

## 0.5.0：五種聲效與音訊生命週期

使用者要求發牌、籌碼投注、骰盅轉動／開盅及輪盤轉動。原創程序PCM搭配單個懶AudioContext，Game僅發防例外cue、音訊只讀phase／remaining；首次操作解鎖、靜音獨立key、暫停／背景停聲、長聲offset及中斷恢復已接線。快速下注後即開局原會取消飛行而漏籌碼聲，現以landAll在手動／自動鎖注時落定一次，清除與重排仍取消靜音；自然／late callbacks不雙播。context非running時停止並斷開節點，避免中斷後殘留聲音。

217項通過（新增18項PCM／AudioContext替身／Game及ChipFlights事件），含設定隔離、上限／合併、readonly同步、失敗降級與callback不改checkpoint；原10,000局守恆保持。20個runtime、10張PNG不改，無新外部錄音依賴。browser_smoke.py補靜音／重載／暫停內控制，僅Python語法通過，未執行或實機聽聲，不重試既有HTTP／Chromium IPC路線。Safari／iOS首次互動、裝置靜音／音量／路由、背景與中斷、音質混合及合成效能仍UNVERIFIED。已發布main 6ad8a33c27222314a2eefcbed22f7fc08886fba5，Pages run41164989369 completed/success；163檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記SOUND_EFFECTS_RELEASE.json，發布後本地交接不另部署；下一個可否證驗證是實機逐桌聽聲並測轉動暫停／切背景／繼續。

## 0.4.1：輪盤左右6:4

使用者指定左投注60%／右轉輪40%，取代0.4.0上下版。原模板直接把轉輪及投注設為table-screen的縱向flex子項，無法形成左右欄；現以roulette-layout Grid 3fr／2fr包住，具名放左下注及控制／右輪盤與原結果。窄版控制分行、主要44px不縮，手機仍左右；原容器測量及DOM籌碼位置繼續適用。沒有重算結果、賠率、道具、計時或保存，PNG不變。

現有199項回歸通過，未為可逆布局新增鏡像測試；browser_smoke.py新增實際DOM矩形6:4／順序／同高檢查，桌面及七視口呼叫，只有Python語法通過，沒有執行瀏覽器。Safari／觸控／右輪大小／小手機左欄可讀性與控制可達性仍UNVERIFIED；不重試既有HTTP／Chromium IPC。已發布main 05a985461ccaec446a9beec9657992f485eeb480，Pages run41162556964 completed/success；158檔SHA一致、26份PNG副本不改與手圖不存在均已核對。結果記ROULETTE_LAYOUT_RELEASE.json，本地發布後交接不另部署。下一個可否證驗證為實機核對6:4與精準下注／放大、轉動暫停及重轉選擇。

## 0.4.0：第五桌輪盤

依已確認美式雙零／50獨立投注接入第五桌，199項通過，新增27項含全50×38派彩、零號、三道具、預扣重轉／接受／超時／完整38重抽同號／只轉一次、保本後判勝敗、舊round拒絕及2,000局守恆，連同原三桌模擬共10,000局。rouletteCells對兩版印刷／籌碼位置共用資料，ChipFlights用實際DOM；相對末角逐號比對美式輪序，確保數學上球號一致。暫停剩餘時間及CSS負delay／play-state模板有檢查，沒有瀏覽器視覺證據。

19個runtime、10張PNG不改、無手圖；原創輪盤／盤面SVG直接用於遊戲，不是截圖或臨時示意。browser_smoke.py補桌面下注／轉動暫停／結果／匯出及七視口精準下注／放大，僅Python語法通過，不重試舊HTTP／Chromium IPC路線。手機小格以原生精準面板及主動放大補足，實際可讀性、SVG transform、Safari、觸控／旋轉、安全區／效能仍UNVERIFIED；不能把199項當裝置通過。已發布main 4cea5cb4706a4652e5d5726eb3f0bbb6e79dc265，Pages run41161476045 completed/success，157檔SHA一致、26份PNG副本不改及手圖不存在已核對。結果記ROULETTE_RELEASE.json，本地發布後記帳不另部署。下一個可否證檢查為實機完整下注→轉動暫停→重轉決策→結算→跨桌存檔。

## 0.3.1：勝出對手框色

使用者最新指定只改勝出對手框色，先前追加可見姓名／牌型及結束modal文字的方案已移除。根因是原座位只標當前行動者／棄牌，沒有將已結算彩池得主映射至對手框。現從result.pots排除uncalled退款、匯總所有實際AI winners，僅結算後套金框及輔助閱讀label；不重算牌型／派彩，不改可見文字、玩家框、暗牌、操作或存檔。新增2項完整視圖語義測試，含普通勝／棄牌勝、平分、不同邊池得主、退款排除、結算前無框／下一手清除及readonly；全套172項通過，原8,000局模擬保持。root／docs／單檔版本0.3.1，10張PNG不改。Safari／觸控／金框對比及手機視覺仍UNVERIFIED，不重試舊IPC路線。已發布main a0658db6f791524371ec26afd5be73244ddcfb9d，Pages run41154601353 completed/success，148檔SHA一致、26份PNG副本不改及手圖不存在均已核對。結果記POKER_WINNER_FRAME_RELEASE.json，發布後本地記帳不另部署。

## 0.3.0：德州撲克與收注節奏

接入六人無限注第四桌，170項程式／封裝／Pages通過，新增34項及2,000手守恆模擬，連同原百家樂4,000／21點2,000共8,000局。完整加注與短碼重開、主邊池／零頭、一次結算／保本後勝敗、舊schema／雙牌靴／AI保存、30秒／道具原倒數及stale turn token均覆蓋。AI只有受限自身底牌／公共資料輸入，高資金縮小估值誤差並增詐唬；不是實玩平衡證明。

節奏假設：最後一次下注若立即清street並收注，會與下注飛行同時發生而缺乏先後。已加入600ms poker-collect等待，測試599ms仍未收、暫停不動、600ms收注後才攤牌、攤牌完成才派彩／保存。卡牌依實際容器等比例計算；畫面三個重點為對手動態／公共牌及自己／當前操作，次要彩池與紀錄進面板。

既有HTTP／Chromium IPC限制仍生效，不重複啟動失敗路線；browser_smoke.py補七視口及桌面一手／暫停／匯出，只做Python語法檢查。真實Safari、觸控、旋轉、安全區、320×568與844×390主操作可達性、字體、效能及AI強度仍UNVERIFIED。10張runtime PNG不改、無手圖。已發布main 82dc70e53971f78263329812ed8215c2f6a45b8d，Pages run41153240944 completed/success，147檔SHA一致、26份PNG不改及手圖不存在已核對。結果docs/POKER_RELEASE.json，本地發布後記帳不另部署；下一個可否證驗證為實機下注至全押邊池結算、暫停回來與存檔匯出。

## 0.2.0：21點接入與驗證界線

使用者直接要求製作21點，沿用一體賭枱。第三桌已接入，136項檢查通過（新增34項及2,000局資金模擬，連同原百家樂共6,000局），三個新模組共用Game資金／時間／保存。六副牌S17、自然3:2、保險、加倍／分後加倍、四手、分A、晚投降及三道具均有測試；零暫存資金不提前判破產。換牌沿原倒數包含動畫；最後發現「點擊前advance可能先讓上一手超時切到下一手」的假設，最小測試以舊hand id發加倍／透視，已新增UI綁定及引擎保護並通過。分牌動畫／追加與籌碼採實際DOM落點；結構、扇形尺寸及暗牌標籤測試不等同實際渲染。

root／docs Pages、單檔同步13個runtime、10張PNG不改、無手圖。browser_smoke.py補分牌／暫停／加倍／結算$105／牌靴cursor7／匯出及七種視口入桌，Python語法通過但未執行。遵守既有socket／IPC停用路線，未再啟動Chromium／HTTP，Safari／觸控／四手大小／旋轉／原生dialog仍UNVERIFIED。下一個可否證檢查是實機從下注到分牌／加倍／結算及背景恢復，尤其320×568與844×390。已發布main 42a68405f28c0ab3298094a7d74e7197fb6ef8fb，Pages run41093009444 completed/success；138檔SHA全部吻合、26份PNG副本不改及手圖仍不存在已核對。結果記docs/BLACKJACK_RELEASE.json，本地發布後交接不另部署；不以程式通過宣稱實機通過。

## 0.1.9確認後接入

使用者已明確選定百家樂一體賭枱、大小分區，前次等待預覽確認已滿足。本輪以單張枱布35／65網格及實際長寬重排SVG解決0.1.8固定高／固定SVG比例假設；印刷、落枱與飛行同一幾何，大小50格保持。102項程式／版式／封裝／Pages檢查通過，含8個新版式測試及原4,000局資金驗證。正式SVG已用Inkscape看空盤／下注錨點，不是瀏覽器截圖。browser_smoke.py補35／65實際尺寸與SVG長寬關係，僅Python語法通過；Safari／觸控／旋轉仍UNVERIFIED，不重試舊IPC路線。已部署main d51e6fab1983ded3fc3c21fc1708a1a8494863df，Pages run41081544887 completed/success；129檔SHA一致，手圖維持刪除。詳TABLE_PRESENTATION_RELEASE.json。


## 比例預覽v1：上下比例失衡（尚未實裝）

使用者0.1.8實況顯示開牌上區卡牌小且左右資訊分散，下區六格集中中央、兩側空白。先前有界高度只處理溢出，沒有驗證自然比例；不能將94項程式測試當作視覺通過。

使用者追加「先提供預覽，確認後才實裝」；本輪僅獨立預覽，不改正式程式／部署。

本輪根因假設：128／150px固定開牌高度及42／52px卡牌上限，配合1200×610固定SVG等比例置中，寬視窗會空出兩側。新方案保留上下分隔，扣除HUD與導航後，候選按上35／下65配置（下區包含底部控制）；卡牌跟隨上區高度，莊閒成組置中。下區SVG依實際長寬重排六格與文字，卡牌與籌碼保持等比例，不用整頁拉伸或裁切。最小可否證檢查：寬／窄SVG幾何邊界、同一幾何用於盤面／籌碼落點、上下可用高度預算及實際視圖接線；Safari視覺仍需回測，不重試既有受限Chromium路線。

本輪完成獨立A分區／B一體枱布候選，共四個1490×617及1280×800配置。版面／HTML控制語法檢查通過；PNG為Inkscape渲染，非瀏覽器截圖。69個正式檔SHA保持0.1.8，GitHub main回讀未變。使用者尚未確認比例或A／B，不實裝；最安全下一步先展示兩版。

## 0.1.8牌桌高度及手圖

根因假設：各區獨立內容高度、SVG按寬度撐高、手機控制逐列及details展開造成頁面超出可用高度。已改有界viewport容器、SVG完整等比例容納、底部控制、次要dialog及咪牌網格；手圖從正式素材移除。94項規則／控制器／面板DOM替身／封裝／Pages通過，無新瀏覽器證據。瀏覽器腳本新增垂直／控制邊界檢查及七種視口，僅Python語法通過；勿將有界CSS當作Safari可讀性實機通過。既有IPC限制不變，不重試同一路線。下一個可否證驗證為Safari實際入桌、橫直向及咪牌／暫停的可見按鈕邊界。已發布main fe35072cd5d7b4aa239ca8119569d58c796188b5，Pages run41075125277 completed/success，126檔SHA一致及兩個正式手圖PNG刪除均已核對。詳VIEWPORT_LAYOUT_RELEASE.json。


## 0.1.7動畫驗證

慢速發牌與咪牌已獲使用者「實裝動畫」批准。87項邏輯／控制器DOM替身／模板／封裝／Pages檢查通過；12項新測試含暫停剩餘時間、進度保留、多指／取消、直接揭牌、牌序／旁注／單次結算。固定手牌測試因新互動更新成明確揭牌決策，4,000局資金模擬仍通過。正式SVG用Inkscape檢查手指／牌角錨點，非瀏覽器截圖。Chromium IPC限制不變，Safari／實機觸控／旋轉未驗證；不重試相同失敗路線。已部署main 358a4a4f4704a1c4557759829b740081d12ee558，Pages run41028807239 completed/success，123檔SHA一致；收據BACCARAT_ANIMATION_RELEASE.json。


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

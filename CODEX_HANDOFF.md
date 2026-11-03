# CODEX_HANDOFF

## 最新：0.9.3已獲發布授權，待部署核對（2026-11-03）

使用者「實裝到GitHub」已授權發布上一輪完成的0.9.3至原jacobmaster-97/charity-casino main及既有Pages。基準cba6438bb85dc486970e8dcb151a9766a3b54f4b／tree612b98949fe25292926f9bd43bf5a0c447bef823已核對，先前只本機限制解除。沒有另改Game、玩法或PNG。

內容為五桌名稱框置中、統一派彩小視窗、九張共用貼圖預載／解碼及入桌準備。322項驗證與單檔／Pages將在發布前核對，來源細節及UI審核見docs/UI_POLISH_093.md與UI_POLISH_VALIDATION.json。使用非強制expected_sha更新main，完成該commit Pages成功才記UI_POLISH_RELEASE.json。

Safari／真DOM／載入秒數及音訊硬體未驗，不重試HTTP／Chromium IPC；不建立排行榜、Cloudflare或付款。下一安全任務：核對來源SHA、發布及Pages結果；下文僅本機段落為歷史狀態。

## 最新：0.9.3三項畫面修整已本機完成（2026-11-03）

使用者要求大廳名稱框置中／縮框、派彩小視窗、改善入桌貼圖延遲。已水平／垂直置中原五個44px名稱框，保留0.9.2等比例填寬及座標。五桌原大結果區改「查看派彩」入口，完成後自動開居中小視窗；大小／手機輪盤先播原揭曉再顯示。金額直接讀result，保留再玩／返回大廳／自由模式保存／查看盤面；截止及破產不提供新局。視窗不暫停、不重複派彩，Escape關閉並還原焦點，背景沿原暫停。

TableArtCache在既有table-layout維護九張共用貼圖：首頁閒時順序預載、保留已解碼Image及共用Promise；入桌時必需貼圖全load／decode才呼叫原Game.enterTable。未備妥顯示準備視窗，倒數照走，可暫停／取消；15秒每圖逾時或解碼失敗提供重試，只補缺圖。舊回呼、背景完成、截止均不誤開局。沒有改PNG或聲效，不宣稱已減少下載位元組／實測秒數。

重要檔：src/app.mjs、table-layout.mjs、styles.css、五桌*-view.mjs；tests/challenge-app與table-layout各新增9／5項、舊五桌模板斷言及browser_smoke更新。其餘mjs僅快取query0.9.3，Game／rules／保存本體不改。規格／UI審核及機器證據見docs/UI_POLISH_093.md、UI_POLISH_VALIDATION.json；prepare-github只新增該validation白名單，沒有執行上傳準備覆寫0.9.2快照。

npm run verify及verify:pages共322項通過（313規則／元件／app替身＋3單檔＋6Pages），保留500次五分鐘及10,000局模擬。Python smoke只編譯。12runtime PNG與0.9.2發布快照、24src Pages逐位元組一致。單檔dist/charity-casino-prototype.html為29,868,711 bytes，SHA256 2f109464727844429a7ba3fdb5f660900a6821fbc25a9ac76d71728dc7c214aa。

本輪沒有GitHub mutation，網站仍0.9.2 commit cba6438bb85dc486970e8dcb151a9766a3b54f4b。dist/github-upload保持209檔發布快照，舊ZIP為歷史包，新單檔及docs/play才是本機0.9.3；dist/manifest已明示published:false。沒有排行榜／雲端／付款。

未驗證iPhone16Plus Safari小視窗尺寸／safe-area／地址欄／旋轉／點按／捲動、真正冷暖載入時間及材質記憶體／音訊硬體；不重試已知HTTP／Chromium IPC，不把Node當真瀏覽器。下一最安全任務：在可用Safari環境測五桌結算與冷暖載入；使用者要求發布時再準備0.9.3快照，不自行開始排行榜。

## 最新：0.9.2填寬已發布GitHub／Pages成功（2026-11-03）

使用者「實裝至GitHub」批准原填寬預覽及發布。手機橫向依實際安全區內map寬度等比例填寬、偏上15%取景，五入座與圖同scene並依實際按鍵高度限制裁切；極短視口回完整圖。桌面／直向完整圖，原35.2px HUD、五桌規則／存檔／12張runtime PNG不改。沒有硬寫示意932×430或59／21安全區。

以0.9.1 commit735e739a1a32dcdf7812228d3b36645359fc1e39為parent及expected_sha、force:false更新main。新commitcba6438bb85dc486970e8dcb151a9766a3b54f4b，tree 612b98949fe25292926f9bd43bf5a0c447bef823，209份發布檔Git blob SHA全吻合、56檔變更、30PNG副本不改、沒有手圖／預覽目錄。Pages run41607230248 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.2 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/cba6438bb85dc486970e8dcb151a9766a3b54f4b 。

308項通過（299規則／元件／app替身＋3單檔＋6Pages）；新增6項layout含金值／多高度／fallback／量測替身。單檔29,862,635 bytes，SHA256 3bff2220d86ee66868f561090ec1313474b68df38f17cd7c31c0f96bff25ee41。詳docs/LOBBY_WIDE_092.md、LOBBY_WIDE_VALIDATION.json及LOBBY_WIDE_RELEASE.json。dist/github-upload保持209檔精確發布快照；事後收據／本地交接不另部署，舊zip仍為歷史包。

Safari真DOM／iPhone16Plus安全區／網址列／旋轉／裁切體感／捲動／觸控及硬體聲效仍未驗；browser_smoke只Python語法。未直接HTTP驗證公開頁，未重試已知HTTP／Chromium IPC。沒有排行榜／Cloudflare／付款。回復可用完整0.9.1及對應快取，不清存檔。下一最安全任務：實機開?v=0.9.2驗證五入座、地圖裁切、地址欄與旋轉，勿以部署成功當裝置證據。

## 最新：0.9.2填寬已實裝，準備授權發布（2026-11-03）

使用者「實裝至GitHub」已確認先前lobby-iphone16plus-wide-v1，取代只預覽限制。手機橫向依實際DOM安全區內框等比例填寬，偏上15%取景；五入座與圖同scene，讀實際按鍵高度限制裁切，極短回完整圖。桌面／直向完整圖。沒有硬寫932×430或59／21安全區，原35.2px HUD、五桌規則／存檔及12貼圖不變。

308項通過（299元件／規則／app替身＋3封裝＋6Pages），新增6項layout測試；browser_smoke只Python語法，沒有Safari／真DOM／觸控證據。單檔29,862,635 bytes，SHA256 3bff2220d86ee66868f561090ec1313474b68df38f17cd7c31c0f96bff25ee41。詳docs/LOBBY_WIDE_092.md及LOBBY_WIDE_VALIDATION.json。

使用者已授權原main／Pages發布，基準735e739a1a32dcdf7812228d3b36645359fc1e39；本提交為待部署內容，實際結果另於LOBBY_WIDE_RELEASE.json。沒有排行榜／Cloudflare／付款。未重試HTTP／Chromium IPC；下一安全任務：完成檔SHA核對、非強制更新main及確認該commit Pages成功，之後由實機驗證。

## 最新：iPhone 16 Plus大廳填寬預覽v1，先確認後實裝（2026-11-03）

使用者指出0.9.1兩側仍有留白、主要用iPhone 16 Plus，要求用盡橫向寬度；後續明確「先讓我預覽」。本輪只新增docs/previews/lobby-iphone16plus-wide-v1/及文件，沒有改正式程式／素材／版號或部署，102份正式檔SHA與預覽前一致，網站仍0.9.1。

以932×430畫布、左右59／底21px示意安全區，重建目前與建議版PNG／SVG；數值是排版假設，不是實機讀取。建議等比例放大填滿812px地圖內寬，消除原各約83px內側留白；人物不拉伸，偏上15%取景保留壁畫人物及五個入座鍵，下方地板／前景／賭桌底部裁去部分。模型線性放大約25.6%，裁上約14px／下79px，不當Safari實測。

交付lobby-wide.png、lobby-current.png（重建非截圖）、comparison.png及切換index.html，附render-preview.mjs／layout／validation／README。原背景PNG完整嵌入不改像素，按鈕獨立44px，保留原百分比。3PNG解碼／尺寸、SVG XML、10按鍵界內、比例／零左右留白、JS語法及102正式檔SHA通過，輸出已目視。未跑真瀏覽器／Safari／觸控，不用舊302項當預覽證據，未重試HTTP／Chromium IPC。

下一最安全任務：等使用者確認上下裁切／取景與填寬效果，才實裝實際viewport／安全區的填寬邏輯，不硬寫示意手機尺寸、不自行修改或發布正式版。

## 最新：0.9.1大廳更新已發布GitHub／Pages成功（2026-11-03）

使用者「更新GitHub」已授權原倉庫main及Pages。以0.9.0 commit4cc7a668d3b9e9dac989a97fab155445669a8e83為parent及expected_sha、force:false發布成功。新commit735e739a1a32dcdf7812228d3b36645359fc1e39，tree f495bbacb565a7eec40028a101c475dccbc90889；206份發布檔案Git blob SHA一致，56檔變更，30份PNG副本不改，無手圖。完整npm run verify及prepare:github通過302項（293＋3＋6），本輪不再改遊戲程式。

Pages run41602536032 completed/success、head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.1 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/735e739a1a32dcdf7812228d3b36645359fc1e39 。收據docs/LOBBY_VIEW_RELEASE.json及dist發布metadata同步；事後收據及本地交接不另部署。dist/github-upload現為0.9.1發布快照，舊zip仍是歷史包。若需回復可用前版0.9.0整體commit及對應快取，不清玩家保存。

沒有建立Cloudflare、排行榜或付款。Safari／真DOM／橫屏旋轉／35.2px點按／安全區及音訊硬體仍未驗，未直接HTTP核對公開Pages，未重試舊HTTP／Chromium IPC路徑。下一最安全任務：手機／iPad橫向實測地圖、更多、商店及暫停，勿把部署成功當實機驗證。

## 最新：0.9.1大廳地圖／精簡頂欄已本機完成（2026-11-03）

使用者實機回饋橫向地圖太小，允許刪底列／整合功能，指定頂欄縮矮20%。已移除大廳底列、進度條及蓋在地圖上的標題／大型商店鍵；HUD改35.2px（原44px），保留品牌、資金、餘時，商店／更多／暫停在同一列。更多含存檔／讀檔、返回主頁、姓名／完成局數及說明，開啟時照計，到時轉結果，背景仍停錶。Escape與返回還原更多焦點。五桌仍按原1672×941圖／百分比共縮放，入座88–120px寬／44px高，不拆名稱；沒有新圖或拉伸。

主要改app.mjs、styles.css、challenge-app測試及browser_smoke；其餘23個mjs本文與發布0.9.0一致（僅query快取0.9.1），Game／派彩／存檔不改。源碼配置可多出63.8px map高度，屬算式而非實機測量，寬度限制時仍保持圖比例。頂欄35.2px低於一般44px為使用者指定取捨，不套商店／其他牌桌。

驗證302項通過（293規則／元件／app事件替身＋3單檔＋6 Pages），新5項驗證精簡入口、更多照計／存檔、截止替換、背景及Escape／回主頁，保留500五分鐘及10,000局回歸。另補Escape收尾75ms的先紅後綠：先advance再close，避免重設last時漏掉interval間時間。HUD／map／more實際renderer HTML解析平衡；browser_smoke只Python語法。12 PNG與發布0.9.0逐位元組一致、24runtime根／docs同步、無手圖。

本機dist/charity-casino-prototype.html 29,860,401 bytes，SHA256 a7ee68ead686d1e1663b0573068cd0d0fec0dd56d61b68a28071a4bd599092b8；Pages目錄及manifest同步。詳docs/LOBBY_VIEW_091.md／LOBBY_VIEW_VALIDATION.json。未另發布GitHub，最後網站0.9.0 commit4cc7a668d3b9e9dac989a97fab155445669a8e83；舊github-upload／zip不是0.9.1新包。

Safari／真DOM地圖面積、橫屏／旋轉／安全區、35.2px點按舒適度、長金額及聲效硬體未驗證，未重試HTTP／Chromium IPC。下一最安全任務：iPad／手機橫向驗證地圖、更多、商店及停錶；使用者要求後才發布0.9.1，不自行接排行榜。

## 最新：0.9.0已發布GitHub／Pages成功（2026-11-03）

使用者「更新github」已授權原倉庫main及Pages更新。以0.8.0 commit28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65為parent及expected_sha、force:false更新成功。新commit4cc7a668d3b9e9dac989a97fab155445669a8e83，tree c4b91b6234608aa453b77a9712b2210561861036；203份發布檔案Git blob SHA一致，68檔變更，新增兩張PNG各在根／docs各一份，原26份PNG副本不改且無手圖。背景blob f4547d332171bc90916101ae62d6ab557e4f3f5d、Logo blob81db007fa9675b7a55dead226df724870402efbf均核對吻合。

Pages run41567146790 completed/success且head_sha吻合。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.9.0 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/4cc7a668d3b9e9dac989a97fab155445669a8e83 。docs/HOME_SCREEN_RELEASE.json及dist發布metadata已更新；發布後收據及本地交接不另部署。dist/github-upload現為本輪0.9.0發布快照，舊zip仍是歷史包。

發布前完整npm run verify及prepare:github共297項通過（288＋3＋6），另在準備來源無預覽目錄時home8項通過。發布檢查重現tests/home.test對未上傳docs/previews的依賴（乾淨來源7過1個ENOENT），已改核對public/art/home-b/assets.json中原批准SHA，遊戲本體不變。Safari／真DOM／觸控／鍵盤／硬體聲效及公開Pages直接HTTP未驗，未重試舊HTTP／Chromium IPC。沒有排行榜／Cloudflare／付款。回退可用上一0.8.0 commit及整套快取，不清玩家保存。下一最安全任務：iPad Safari驗證主畫面、開始／續玩、旋轉與試聽，不自行開發下一階段。

## 最新：0.9.0五分鐘賭神主畫面已本機實裝／封裝（2026-11-03）

使用者「實裝主畫面」已批准v2，先前等待確認限制解除。已將確認的港漫背景及透明電影感Logo複製至public/art/home-b，逐位元組等於預覽；主頁改為真正DOM四入口：開始遊戲、賭神龍虎榜、設定、支持作者。指定底部文案及舊重複小標不再顯示，頁籤／一般HUD／故事銜接統一新名；技術存檔識別及前綴不改。

開始遊戲開姓名／模式／續玩，驗證後進原故事卡，最後確認才啟動原Game $100／300秒。設定包含原音效／試聽、模式、續玩、匯入及有舊檔才可匯出；排行榜／支持作者清楚說明未開放，不連網、不付款或建立雲端。主頁對話框沿原inert／Tab圈，Escape／返回還原入口焦點，重新排版保留姓名與游標。橫向以1080單位及最少1920寬保持構圖、超寬擴右留白，4:3平板保留16:9置中；直向提供可點備用排列／橫向建議。safe-area及視口量測不改牌桌owner，主要選單至少44px。

重要檔：src/home-view.mjs、app.mjs、styles.css、public/art/home-b及assets.json；build／pages／prepare-github腳本、tests/home.test.mjs、challenge-app及封裝測試；全快取0.9.0。22個其他mjs本文與已發布0.8.0快照一致（僅query快取版本差異），原十張runtime PNG不改。規格／UI審核見docs/HOME_SCREEN_090.md，驗證／SHA見HOME_SCREEN_VALIDATION.json。

最終npm run verify通過288規則／元件／事件替身＋3單檔，verify:pages通過6，共297；新增16主頁／事件流程，保留500次混合五分鐘與10,000局回歸。主頁／四對話框實際renderer HTML解析平衡，browser_smoke只Python語法。12張PNG／24 runtime根與docs一致，無手圖。單檔dist/charity-casino-prototype.html 29,856,799 bytes，SHA256 78908d3a9894d36385a8f334bbd47512d797f5b1fcff9482cbd3314278776e10，manifest同步。

沒有真瀏覽器／Safari／觸控／安全區／軟鍵盤或音訊硬體證據；目前預覽圖不是新實裝截圖，勿混稱。遵守HTTP／Chromium IPC停止重試，未重試。未另行發布GitHub／Pages，最後已發布仍0.8.0 commit28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65；dist/github-upload及zip為歷史包。下一最安全工作：iPad Safari核對主頁四入口、橫向／4:3、開始／續玩、鍵盤焦點及試聽；使用者要求發布時才發0.9.0，不自行開始排行榜。

## 最新：改名五分鐘賭神／港式電影感Logo預覽v2，待確認（2026-11-03）

使用者已確定新遊戲名「五分鐘賭神」，要求刪除「$100開局，五分鐘決勝」及重新設計Logo，參考香港《賭神》《賭俠》《賭聖》的電影片名字體氣勢。延續上一輪先確認才實裝限制，本次只新增docs/previews/home-landscape-v2/及文件，不替換正式主頁或部署，正式0.8.0維持。

image_gen產出原創金色書法／酒紅立體邊緣的透明Logo（2172×724 RGBA），完整五字「五分鐘賭神」，沒有貼上／描摹電影原Logo。logo.png為原始副本，透明alpha及SHA吻合；SVG以contain／viewBox放進原留白，未修PNG像素。保留v1背景人物／四入口，刪底部指定文案及舊重複「五分鐘挑戰」小標。提供1440×480獨立Logo展示、1920×1080／844×390／667×375主頁PNG／SVG及切換HTML，來源／prompt／幾何見該目錄assets、logo-layout、validation及README。

驗證：4份展示PNG解碼／尺寸、SVG XML、預覽JS／generator語法、必需名稱及文字移除、12個主按鍵至少50px／界內、Logo原始SHA及真alpha、背景SHA通過；95份正式檔與事前SHA一致。已目視五字、無遮臉及四選項；未做OCR／瀏覽器／Safari／觸控／實際小螢幕細筆辨識，不以舊281項當新設計證據。未接排行榜或支持付款。

下一最安全任務：待使用者確認新Logo與主頁v2，得到明確確認後才統一正式遊戲名稱並替換原主頁／真DOM接線／實機驗證。不自行部署或開發Cloudflare。

## 最新：橫向開始主頁v1僅設計預覽，等待確認（2026-11-03）

使用者要求參照上載圖片設計橫向開始頁，四入口固定為「開始遊戲／賭神龍虎榜／設定／支持作者」，明確確認後才實裝並更換原主頁。本輪只新增docs/previews/home-landscape-v1/，沒有修改src／public／正式入口／Pages檔或部署。正式仍0.8.0、commit 28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65；上一輪發布授權不表示可以發布這次尚未確認的預覽。

設計：左側港漫三人主視覺／金色標題與維港，右側四個直排立體牌匾；金色開始、酒紅排行榜、翠綠設定、墨綠支持。image_gen以既有promotion-hk-manhua-v5角色方向重構無字背景，精確中文字／按鈕另用SVG排版，不複製上載遊戲角色或石塊。提供1920×1080、844×390、667×375的PNG／SVG與切換HTML（用途提示，非遊戲接線）。source／prompt／分層／SHA／幾何及UI暫評見該目錄assets.json、art-prompt.md、layout.json、validation.json及README。

驗證：3張PNG解碼及尺寸、SVG XML／四個正確標籤、12個按鍵皆在界內且至少50px高、原始插畫副本SHA、預覽JS／generator語法通過；95個正式來源／素材／發布檔與事前SHA一致。已目視輸出確認標題不遮臉、四按鈕可見；最小標籤20.1px、輔助14.2px，純配色對比最低4.67。未執行瀏覽器／Safari／觸控，未以舊281項充當預覽驗證。排行榜／設定／支持作者只入口設計，沒有後端、付款或外連；設定內容／支持連結未定。iPad4:3及直向未設計。

下一最安全任務：讓使用者確認構圖／按鈕比例，得到明確確認後才接入原首頁流程、實作真DOM／安全區與補比例驗證；不得自行更換原主頁、部署或開始Cloudflare排行榜。

## 最新：0.8.0已發布GitHub及Pages成功（2026-11-02）

使用者於本機交付後要求「將新版發佈到GitHub」，已授權更新原jacobmaster-97/charity-casino main及既有Pages，先前本機不發布的邊界已解除。以0.7.1的690c6f02aaa194431fb7c263061d3ad17ee574d0為parent及expected_sha，非force更新main成功。新版commit 28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65，tree 6fef4ace76b4df0f75c93dec4db10703f0fb61bf；192份發布檔案Git blob SHA核對一致，67檔變更，26份PNG副本未改且無手圖。完整npm run verify與prepare:github通過281項，未改遊戲玩法；發布腳本補收LOCAL_FIVE_MINUTE_VALIDATION.json。

Pages run41479517386 completed/success，head_sha與新版commit一致。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.8.0 ，提交 https://github.com/jacobmaster-97/charity-casino/commit/28d4adb6d2fb5cb5e47832396ea4fa16baf1ab65 。收據docs/LOCAL_FIVE_MINUTE_RELEASE.json及dist發布metadata已更新；發布後收據與本地交接不另部署。dist/github-upload現為本輪0.8.0發布快照，舊zip仍是歷史版本，不當新包。需要回退時可回0.7.1 base commit整體版本，不清玩家保存。

未建立Cloudflare、Supabase、排行榜或API。Safari、真DOM比例／整頁捲動、觸控、鍵盤、聲效硬體及原生背景仍UNVERIFIED；Pages部署成功不是實機證據，亦未直接HTTP核對公開Pages內容。下一最安全任務是iPad Safari實機核對05:00／$100、暫停恢復及到時收尾；不得自行開始排行榜。下方本機開發段落為發布前歷史。

## 最新：0.8.0本機五分鐘挑戰已實裝及封裝，階段一停止（2026-11-02）

使用者本輪正式要求執行第一階段，取代下方「只整理提示詞」狀態。本機入口每次$100／有效300秒，以最終資金為目標，不再以$25,000,000通關。購物、大廳、思考、下注及動畫照計；手動或背景／失焦暫停同時凍結總及行動餘秒，回前景需按繼續。Game為唯一計時／資金／派彩owner；到時禁止新輸入及新局，按原超時預設收尾已下注局，保留動畫並只結算一次。全押可用0等派彩後再判破產。

結果含名稱、最終資金、五桌局數及淨贏取（派彩＋保本退款－投注，含負數），購物支出另列。cash.mjs以整數美分及Number／BigInt精確處理五桌、AI籌碼、邊池、成本、顯示與JSON，沒有新增達標上限。新schema2／five-minute-v1用獨立charity-casino-five-minute-v2槽，保留舊schema1及匯出；舊資產不能匯入，恢復不補滿五分鐘。保留完成局checkpoint策略，最終結束亦保存；不新增局中持久快照，重整回最後完成局。引擎預設legacy相容供既有回歸，網頁明確Game({challenge:true})，不能漏此旗標。

重要檔案：src/cash.mjs、challenge.mjs、game.mjs、storage.mjs、app.mjs、五桌金額／視圖與styles.css；tests/challenge.test.mjs、challenge-app.test.mjs；封裝腳本及Pages測試。細節與裝置缺口見docs/LOCAL_FIVE_MINUTE_080.md，最終檢查／SHA見docs/LOCAL_FIVE_MINUTE_VALIDATION.json。既有美術及聲效保留，十張runtime PNG與0.7.1快照及封裝一致、無手圖。

驗證：npm run verify通過272項規則／元件／app事件替身＋3單檔；npm run verify:pages通過6項，共281項。含500次混合五分鐘流程、既有10,000局模擬、超大德州實際牌局／JSON及五款renderer。Python browser_smoke語法及首頁／大廳／商店／五行結果HTML解析通過；這些不是瀏覽器證據。Safari、觸控、原生背景／BFCache、音訊硬體、鍵盤、安全區及實際比例／整頁不捲動仍UNVERIFIED；未重試既知HTTP／Chromium IPC失敗路徑。

交付：dist/charity-casino-prototype.html（23,647,638 bytes；SHA256 58d170b64eb72eab0555b53230c588c15093afaf178c0c12a9b2a299b699a636）及本機docs/index.html／docs/play，23 runtime同步，dist/manifest.json已更新並保留早期發布metadata。未上傳GitHub或部署Pages，遠端仍0.7.1；dist/github-upload是歷史0.7.1快照，github-upload.zip為0.1.2、另一舊zip為0.1.0，不能誤當本輪新包。未建立Cloudflare／Supabase／排行榜／API。依使用者要求階段一完成後停止；下一最安全任務僅為Safari實機核對本機版本，不自行開始提示詞二或發布。

## 最新：已整理兩階段開發提示詞，先本機後排行榜（2026-11-02，香港）

使用者要求現階段整理提示詞，本機遊戲開發完成後才做排行榜。已新增docs/DEVELOPMENT_PROMPTS.md，含兩份可直接使用的提示詞：一、先完成本機$100／有效五分鐘、購物大廳照計、手動／背景停錶、到時自動收尾及五桌／保存／介面回歸；二、本機完成後才接Cloudflare Workers＋D1，只完場上傳名稱金額及基本防護，不接管牌局或暫存驗證。

本輪僅寫提示詞，不代表立即執行其中開發或部署。保留只做基本防護的最新選擇；同名非唯一、每身分最佳／每局一筆仍需釐清，不擅自當定案。正式仍0.7.1，未改runtime／雲端、未跑遊戲測試。下一最安全任務：使用提示詞一完成本機五分鐘挑戰；不得提前接排行榜。


## 最新：Cloudflare精簡排行榜已選基本防護（2026-11-02，香港）

使用者明確選「只上傳名稱金額，接受基本防護」。五分鐘、下注、暫停與派彩均本機處理，完場才發收分請求；不採提案的全程後端或短暫牌局狀態驗證，不保存遊玩流水。只做名稱／金額格式與精度、安全顯示、參數化SQL、限流及同一完場重試去重，不承諾可驗證合法贏款或阻止所有改分。不要再把短暫驗證當待批准需求。

玩法仍為$100起步、有效300秒最高期末資金；購物／大廳照計，手動或切背景停，回前景按繼續保留原總／行動餘秒；到時自動收尾已下注局，結算後破產提早結束。匿名免註冊。同名非唯一身分，每人最佳／每局一筆、去重技術ID、金額精度與逐桌收尾待細化，不用姓名直接覆寫。

已更新docs/FIVE_MINUTE_LEADERBOARD_PLAN.md及LEADERBOARD_ANTICHEAT_OPTIONS.md（原伺服器驗證僅保留為未採用參考），GAME_BRIEF亦同步。正式仍0.7.1，本輪只文件，未建Cloudflare／改runtime／部署／執行測試；舊256項不是新機制證據。下一最安全任務：完成本機五分鐘規格及精簡上傳／查榜API合約，再實作。


## 最新：0.7.1牌型／公共牌位置及主畫面整屏已發布（2026-11-02）

使用者三點回饋：橫向補牌型、公共牌／彩池上移置中且不碰對手、主畫面不用捲動。已恢復自己原框內14px牌型，等待／棄牌亦有提示；公共牌整組量測上三對手的框／底牌／投注足跡後留8px，自己手牌前留10px，偏上置中並在短高度收容。原13飛行目標、勝出金框、牌局／聲效／保存不改。

第3點已提問但尚無回覆，按已說明假設同時處理首頁、大廳、牌桌。首頁分欄及收合存檔音效；大廳圖片與五個入座鍵1672:941同場景縮放，HUD及底列保留；故事卡短橫屏兩欄。快取0.7.1，PNG不改。新增3德州位置／牌型及2大廳比例檢查；256項（247元件＋3封裝＋6 Pages）完整驗收通過。模板一次性解析通過，browser_smoke只語法；Safari／真DOM／觸控／鍵盤仍UNVERIFIED，勿重試舊HTTP／IPC。詳docs/POKER_READABILITY_071.md。已由前版guarded ref發布main 690c6f02aaa194431fb7c263061d3ad17ee574d0，tree c31d14957fd27d3c7d7c0112340b0637dcd332b6；Pages run41389811878 completed/success。180發布檔SHA一致、49檔變更、26份PNG副本不改且無手圖。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.7.1 。發布後POKER_READABILITY_RELEASE.json與本地交接不另部署；可回該commit整體回退，不清保存。下一步：Safari橫屏核對牌型、對手間距及主畫面無整頁捲動。


## 最新：0.7.0德州手機無頭像圍桌版已發布（2026-11-02）

使用者「可實裝畫面」批准v2，先前只預覽限制已解除。橫向手機上三＋左右二名對手、中央公共牌／彩池、下方自己手牌；沒有人物／字母頭像。主列更多／棄牌／跟注或過牌／加注／全押；總額輸入及五色快捷籌碼搬入原生TablePanels面板，確認才扣款，取消不扣款／不暫停。原13籌碼飛行目標、發牌／音效、六人規則、30秒、AI、道具、勝出對手金框與schema1完成手保存保留。旋轉profile亦獨立追蹤；換回合清面板，防止陳舊操作；一般桌面／直向保持。快取0.7.0，無PNG更換。

新增12手機流程＋2面板檢查；完整251項已通過（242元件／規則＋3封裝＋6 Pages）。browser_smoke補無頭像／六席／44px／面板／暫停路徑，只語法驗證；Safari、真DOM、鍵盤、安全區與長金額仍UNVERIFIED，勿重試舊HTTP／IPC。詳docs/POKER_MOBILE_070.md。回退MOBILE_POKER_ENABLED=false並重封裝，不清保存。已由前版guarded ref發布main 58b6be2114e0bef5002637b40c8d0450742be7b5，tree 2f16a8a5545df348a2a1bd08a158130d35c3b786；Pages run41384534881 completed/success。178發布檔SHA一致、50檔變更、26份PNG副本不改且無手圖。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.7.0 。發布後POKER_MOBILE_RELEASE.json與本地交接不另部署。下一最安全工作：Safari橫屏實機核對加注鍵盤、旋轉及小對手牌。


## 最新：德州橫向預覽v2移除角色圖示（2026-11-02）

使用者修正不需角色圖示，已重製docs/previews/poker-mobile-around-table-v2/：對手與自己所有頭像移除，改置中姓名／餘額，玩家僅文字「你」；無替代人物字母徽章。六人圍桌、公共牌／手牌、D位置標記、底部動作及加注面板保持。三圖SVG／PNG及HTML更新；無頭像引用、23主控／6頂欄幾何與53正式檔SHA不變通過。只預覽，仍需使用者確認後才實裝，正式0.6.3未改／未部署，Safari仍UNVERIFIED。下一步等使用者確認v2，不可因移除頭像就自行接入正式遊戲。


## 最新：德州手機橫向圍桌預覽，等待確認（2026-11-02）

使用者要求參考上載撲克介面重新設計，明確「確認後才實裝」並補充需橫向。只新增docs/previews/poker-mobile-around-table-v1/：844×390與667×375的六人圍桌PNG／SVG、加注面板預覽、切換HTML與生成器。上三＋左右二名對手、公共牌置中、自己靠下；底部更多／棄牌／跟注或過牌／加注／全押，加注金額與五色快捷值收臨時面板。沿現有枱布／卡牌／籌碼，頭像為大廳人物PNG暫定裁切，無新正式人物系統。

3圖解碼／XML與幾何通過，23個主控至少44px、6頂欄按鍵35.2px沿已指定例外；53份正式檔SHA不變。未跑瀏覽器／Safari，沒有實裝或部署，正式仍0.6.3；工具列、鍵盤／加注倒數、其他狀態與長金額仍UNVERIFIED。不得將此提案當已批准，下一步等使用者確認橫向布局與加注面板，才接現有Game／六人／30秒／ChipFlights／保存，不自行新增玩法或勝出對手文字。詳該預覽README及validation.json。


## 最新：0.6.3籌碼文字與盤面分色已發布（2026-11-01）

使用者要求完全區分籌碼與盤面字色。盤面暖金保持；共用chipFace面額用深藍字／冰白底／青藍框，SVG大小及百家樂合計額改亮青藍字／深藍牌／青藍框，輪盤合計額用亮青藍＋深藍描邊。五色外圈、面額資料、籌碼落點／飛行／混色堆疊及0.6.2盤面固定不改。CSS與SVG顯示層，無新PNG或遊戲資料變更，快取0.6.3。純色對比12.37:1／12.64:1；原237項（含封裝／Pages）通過。browser_smoke.py新增實際色值區別但只語法驗證；Safari／實機小字仍UNVERIFIED，不重試IPC／HTTP。詳docs/WAGER_COLORS_063.md。前版main1870fb4bc2e7d2be2f0395ac41bb537ec296dbde；已發布main 7f36d66ef73c426c4ff6d85309739ba42a2f59c4，tree 4d91a5a4ffaf4f974a8f105660a6ae7fafeefbcb，Pages run41314949072 completed/success。175檔SHA一致、46檔變更、26份PNG副本不改與手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.3 。發布後本地WAGER_COLORS_RELEASE.json與交接不另部署。


## 最新：0.6.2投注文字固定已發布（2026-11-01）

使用者要求大小／輪盤格名、數字與賠率不因籌碼而移位。已移除輪盤has-bet的translateX及模板--rou-text-shift，文字transform／transition設none；大小原無同類移位，補同樣固定文字限制，不影響骰面原幾何。籌碼飛行／堆疊／金額／投注高亮保持，百家樂不套用。頂欄及小窗沿0.6.1。快取更新0.6.2，規則／保存／聲效／PNG不改。237項既有檢查（含封裝及Pages）通過，browser_smoke.py新增真文字矩形前後比對但只語法通過；未實機或瀏覽器驗證，停用IPC／HTTP路徑保持。詳docs/FIXED_BET_LABELS_062.md。前版main7609a9725dccc5569ba38e65d3d11b5c4c2e7b03；已發布main 1870fb4bc2e7d2be2f0395ac41bb537ec296dbde，tree 6ac4aef39fa3cd1cd7b26e256c3e86c5a416c1bc，Pages run41313768889 completed/success。173檔SHA一致、46檔變更、26份PNG副本不改及手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.2 。發布後本地FIXED_BET_LABELS_RELEASE.json及交接只作收據，不另部署。


## 最新：0.6.1手機頂欄／彈窗尺寸已發布（2026-11-01）

使用者要求頂欄縮矮20%並配合文字、動畫小窗放大20%。只改手機三桌CSS：頂欄44→35.2px，標題16／資金14.4／其他14px；搖骰及輪盤小窗transform1.2，未縮放寬高先反向限制，保持安全區與螢幕邊界。遮罩上沿跟新頂欄高度，底部控制不縮。Game／計時／保存／動畫原進度不改，所有快取0.6.1。237項既有檢查（含封裝及Pages）全部通過。browser_smoke.py新增真DOM比例檢查但只語法通過，Safari／觸控／實際矩形未驗證，不重試舊IPC／HTTP。35.2px頂欄低於一般44px為使用者明確要求取捨，不需再確認。詳docs/MOBILE_TABLES_061.md。前版main4d57dee90b2aa8e6f092fb9fb214bc3868f6f315；已發布main 7609a9725dccc5569ba38e65d3d11b5c4c2e7b03，tree fcba94240f2d7903c79ea00eeca6a5c085d08669，Pages run41312983501 completed/success。171發布檔SHA一致、46檔變更、26份PNG副本不改與手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.1 。發布後本地MOBILE_SIZING_RELEASE.json及交接只作收據，不另部署。宣傳圖v5另留預覽，本輪不換圖或部署宣傳素材。


## 最新：港漫宣傳圖v5女性曲線調整（2026-11-01）

使用者要求增添兩位女性角色身材曲線；已以image_gen在v4基礎調整成年女性腰臀輪廓與合身皮褸剪裁，保留前方男主角、港漫筆觸、三角構圖、無文字及16:9。交付docs/previews/promotion-hk-manhua-v5/charity-casino-manhua-1920x1080.png，尺寸／PNG解碼通過，來源SHA記assets.json，原始生成圖保留。只改宣傳圖預覽，正式遊戲未改／未部署。下一步待使用者確認人物比例。


## 最新：港漫宣傳圖v4後方兩人改為女性（2026-11-01）

使用者要求後方兩名人物改為女性；已用image_gen將v3兩位站姿男子改成兩位成年女性，左短髮紅皮褸持籌碼、右長髮酒紅皮褸持牌。保留前方坐姿男主角、港漫筆觸、三角構圖、維港、三骰盅、輪盤、五色籌碼及無文字。交付docs/previews/promotion-hk-manhua-v4/charity-casino-manhua-1920x1080.png，尺寸及PNG解碼通過；原始生成圖留存，assets.json記SHA。只修改宣傳圖預覽，正式遊戲未變／未部署。下一步待使用者確認此人物版本。


## 最新：人物改為港式漫畫宣傳圖v3（2026-11-01）

使用者上載三張經典港產賭片海報要求替換三位人物與構圖，先生成前坐姿主角＋後方兩名紅皮褸男性的三角海報v2，後再指示以《龍虎門》《中華英雄》《風雲》等港漫繪畫人物。已用image_gen重繪為粗墨線／硬朗成人五官／重黑明暗及排線的原創三男，保留港景、三骰盅、輪盤與籌碼。最新交付docs/previews/promotion-hk-manhua-v3/charity-casino-manhua-1920x1080.png，維持無文字16:9；尺寸及PNG解碼通過，原圖留存，來源SHA記assets.json。屬宣傳圖預覽，不更換正式遊戲人物、玩法或部署。下一步等待使用者評閱畫風，不自行加文字。


## 最新：無文字港式宣傳圖（2026-11-01）

依使用者要求製作16:9無文字宣傳圖，沿用B港式賭片卡通大廳作風格參考，image_gen原創人物／豪華樓梯／翠綠枱布／三骰骰盅／輪盤／五色籌碼。交付docs/previews/promotion-hk-v1/charity-casino-promo-1920x1080.png，1920×1080尺寸及PNG解碼通過；raw-generated.png留原始生成圖，assets.json記來源與SHA。未加入文字、未更換正式素材、未部署，遊戲仍0.6.0。下一步由使用者決定是否調整構圖或後續加標題，不自行加入字樣。


## 最新：0.6.0手機三桌已發布（2026-11-01）

使用者已直接授權實裝大小／百家樂手機版，並改手機輪盤為鎖注後轉輪小窗。完成：大小移出sicbo-view.mjs而保持正式50格；手機大小／輪盤下注時無常駐動畫區，鎖注／有注到期依原Game進度開窗，重擲／重轉10秒仍在窗內。結果只讀停留1400ms或按回盤面，保留原唯一派彩／保存。百家樂手機一體32:68，卡牌按容器量尺寸、換牌／咪牌與旁注保持。合併頂列，更多原生dialog搬原控制，窄版分行且主按鍵44px；一般桌面／平板保留原大小上下／輪盤6:4，21點／德州不套新樣式。

237項檢查已通過（原223＋11手機流程＋3更多dialog），含原10,000局模擬、聲效24與封裝／Pages；23MB單檔與根／docs 21runtime同步，10張PNG不改、無手圖。browser_smoke.py補四小橫向尺寸及真小窗／暫停／更多路徑，僅Python語法檢查；未用瀏覽器或Safari，不重試舊HTTP／IPC。小格、極短高度、鍵盤、安全區、實機觸控／旋轉及聲效仍UNVERIFIED。詳docs/MOBILE_TABLES_060.md。回退首選MOBILE_TABLES_ENABLED=false＋更新快取封裝，勿清保存。發布前版main90b2f88f55ac09f3efa79e306f365b2bdb86adad，準備從該版以guarded ref發布；已發布main 4d57dee90b2aa8e6f092fb9fb214bc3868f6f315，tree 1e282a937219146134e218a50e1eab2a6c69d46f；Pages run41224588739 completed/success。169發布檔SHA一致、55檔變更、26份PNG副本不改及手圖不存在已核對。試玩 https://jacobmaster-97.github.io/charity-casino/?v=0.6.0 。發布後MOBILE_TABLES_RELEASE.json與本地交接只作收據，不另部署。


## 最新：大小搖骰GIF預覽（2026-10-31）

使用者要求GIF，已新增docs/previews/sicbo-mobile-modal-v2/sicbo-lock-shake-reveal.gif、render-gif.mjs、gif-timeline.json及gif-validation.json。1266×585、69幀、8秒循環、約3.13MB；盤面→鎖注→小窗搖骰→揭盅2／3／4→收窗→盤面小區金框及示意+$50。此為正式素材的離線SVG動畫分鏡，不是瀏覽器遊戲實錄，GIF無聲；實機／動畫時序／錢包／保存未接線。全部幀解碼及52份正式檔SHA不變通過，關鍵幀已查看；正式0.5.1未改／未部署，待使用者確認後才實裝。

## 最新：大小橫向改為鎖注後骰盅彈窗預覽（2026-10-31）

使用者否決大小v1過密五列，要求下注後小窗搖骰。本輪只更新獨立docs/previews/sicbo-mobile-modal-v2/，原50格正式boardMarkup直接重用，取消常駐骰盅及工具列，改44px單操作列＋更多。投注容器760×273、比v1面積約增107%；另有368×256搖骰／揭盅窗及自帶素材的離線HTML動效展示。尚未實裝／部署，正式0.5.1保持，其他四桌預覽不改。52份正式檔SHA不變、3張SVG／PNG、50投注格、11主控幾何及預覽JS語法通過；HTML動畫／Safari／實機未驗證。下一步待使用者確認v2，才接鎖注（含倒數）、空注跳過、暫停／重擲10秒及回盤面派彩；不可因自動關窗跳過重擲，展示不得重抽或另存。詳預覽README及validation.json。

## 最新：手機橫向布局僅預覽（2026-10-31）

使用者要求五桌手機橫向比例調適，隨後指示「先讓我預覽」。本輪僅製作docs/previews/mobile-landscape-v1/獨立SVG／PNG／切換HTML與生成器，沒有修改或發布正式遊戲，正式版維持0.5.1。844×390可視範圍（不含瀏覽器工具列），主按鍵44px；百家樂與21點一體、大小分區、德州五對手同列、輪盤左462右308即6:4。沿用正式PNG及卡牌／籌碼／輪盤渲染器。大小五列50格為待確認緊湊重排提案，不能當已批准盤面。

52份src／public／index／package SHA一致，5張SVG/XML與PNG解碼通過，65個主控矩形44px及安全區幾何通過，人工查看五張輸出；不是瀏覽器／Safari／手機通過。密集投注格不足44px，須配放大／精準；其他尺寸、長金額、咪牌／結算／多手狀態及實機觸控仍UNVERIFIED。詳該目錄README與validation.json。下一步等待使用者確認比例與大小緊湊盤面，才修改正式CSS／模板及實機檢查，暫不部署。

## 目標與目前狀態

《賭王慈善大賽》：$100起步、手上資金$25,000,000勝利、歸零失敗，計有效遊玩時間；B港式賭片美術，電腦／手機／平板。大小、百家樂、21點、德州撲克及輪盤五桌原型均已接入。

使用者在iPad Safari實測0.5.0完全無聲，iPadOS版本未提供。本輪0.5.1修正確定程式缺口：首個resume若pending，後續手勢會被舊pending擋住；替身重現先失敗（resume只有1次，預期2），修正後通過。加入touchend、手勢內單樣本靜音primer／resume先於PCM、可用時playback session，主頁／暫停選單新增「啟動並試聽」，保留遊戲及偏好資料。0.5.1已發布：main 90b2f88f55ac09f3efa79e306f365b2bdb86adad，tree 46c4dc587ee8ef379a8b0bbbdf709949ac1344e1，Pages run41166135901 completed/success。223項檢查通過，164個發布檔SHA全部一致，49檔變更，26份PNG副本不改、手圖不存在。遊玩 https://jacobmaster-97.github.io/charity-casino/?v=0.5.1 。修正版實際iPad輸出仍需確認，不能當已證實唯一根因；收據docs/IPAD_AUDIO_RELEASE.json與發布後本地交接不另部署。前版0.5.0 main 6ad8a33c27222314a2eefcbed22f7fc08886fba5供比對。

## 0.5.1本輪完成

- sound.mjs每次未running的有效手勢重試native resume，舊Promise不得清新pending；靜音primer不永久循環，先native啟動再PCM合成。AudioSession playback功能偵測及try/catch，不支援也能走原Web Audio。
- app加touchend捕捉及選單「啟動並試聽」，可在home／pause明確開啟並試播一個籌碼聲；不恢復Game倒數。背景／blur／pagehide與靜音取消播放及尚未完成的試聽；回牌局清掉試聽，普通短聲不補播。
- 223項通過（聲效24，新增6項及調整pending併發測試），含原10,000局模擬與封裝／Pages；20個runtime、10張PNG不改，無手圖，資料格式及玩法不變。browser_smoke.py補試聽入口，只Python語法通過。
- 未使用Safari／iPad實機，工具清單無瀏覽器能力，遵守舊HTTP／Chromium IPC停用紀錄。下一個最安全任務為使用者開0.5.1，在前景按「啟動並試聽」，確認是否有籌碼聲，再玩一局。若仍無聲，蒐集iPadOS版本與實際試聽／系統音量／路由結果再定新假設，不盲目增加音量或重置資料。

## 0.5.0本輪完成

- src/sound.mjs：原創紙聲0.16s、籌碼0.23s、骰盅0.9s、開盅0.32s、輪盤4.8s，無錄音／下載／第三方依賴。獨立固定種子、柔化包絡、PCM peak0.34、master0.55、最多四音源及35ms重複合併，不消耗Game亂數。
- AudioContext懶建立，pointerdown／click／keydown嘗試解鎖，支援webkit前綴；被拒絕／無API安靜降級。主頁／暫停菜單44px靜音、獨立sound-muted-v1設定，不改存檔槽；牌桌HUD保持。
- Game可選onCue／防例外cue只通知真實發牌／揭盅，Blackjack／Poker配合出牌；ChipFlights onLand自然落枱一次，減少動態即響、提早鎖注landAll落定響一次、清除／重排取消不響。聲音不更改資金、道具、結果或checkpoint。
- CasinoSound.sync只讀Game.phase／remaining。暫停、背景、pagehide、離桌／商店清理聲音；短聲不補播，長聲從原offset繼續。render不重播，系統interrupted先斷開再以當下狀態恢復，手動mute歸零master。
- 217項通過：原199＋18聲效PCM／AudioContext替身／真實事件測試，含懶啟動、偏好隔離、loop offset、voice上限、背景與中斷、失敗降級、callback安全、三桌發牌／開盅及chip生命週期。原10,000局資金模擬保持；20個runtime、10張PNG不改、無手圖、單檔及雙Pages同步。
- browser_smoke.py補主頁靜音／重載、暫停內控制，Python語法通過但未執行；Safari／iOS解鎖、靜音鍵、路由、實際音質／音量／效能仍UNVERIFIED，不重試舊IPC路線。詳docs/SOUND_EFFECTS.md。

## 0.4.1本輪完成

- src/roulette-view.mjs只加roulette-layout容器；styles.css具名3fr／2fr、左下注與控制／右轉輪及原資訊，導覽在兩欄外。窄版控制分行，主要動作44px，沒有自動改回上下，其他桌不套此比例。
- 使用原fitRouletteSurface量左欄、同50格座標與ChipFlights落點；轉輪等比例填右欄，暫停仍用原remaining／負delay。Game／storage及PNG不改（runtime只更新快取版本）。
- 199項規則／保存／模板／DOM替身／幾何／封裝／Pages回歸通過，原10,000局模擬保持。browser_smoke.py加實際左／右、同高及60%寬度檢查，Python語法通過但未執行，Safari／手機／比例實機仍UNVERIFIED，不重試舊IPC路線。下一步實機看左右比例、窄版按鈕及右輪大小。

## 0.4.0本輪完成

- 美式38格0／00／1–36、正確美式輪序及18紅18黑2綠；50種獨立投注（38單號、3十二數、3直列、6外圍），淨35／2／1，0／00不屬任何六外圍，無邊線／交點。
- 30秒下注、提早鎖注及空注跳過；五色隨資金大額籌碼、自訂／合法全押、多注、清除／逐項移除。一般最低$1、低於$1可全押；鎖注才扣，最終結算派彩及保本後判達標／歸零，整局只保存一次。
- 三道具全局一件，無免費配給。透視先固定結果，從其餘37無放回排除五號，原倒數內可改下注。保本按全部投注合計淨虧損退50%取整。重轉沿原reroll庫存，商店標重擲／重轉券；須鎖注前先扣，開獎後10秒接受／超時接受／重轉一次，重抽完整38格可同號、原注不改。
- 上轉輪／下完整枱面與底部控制，B枱布及正式五色PNG不改。輪盤／小球與投注格為原創實際SVG遊戲渲染。寬版12×3、窄高3×12，兩版50格，沿同一rouletteCells定位印刷與HTML籌碼層；放大／原生精準選單供小格。已開號及已派注框、排除號虛線刪線／輔助閱讀。
- 4.8秒輪／球反方向多圈減速，最終相對角對應同一美式輪序號碼。Game保留from／to與remaining，視圖負delay／paused恢復同進度，背景遮桌停表照舊。數值、比例與SVG為工程預設可調，未加未定快速模式或號碼紀錄。
- Game唯一錢包／庫存／時間／checkpoint。新roulette.mjs純規則／資料／角度／幾何，roulette-game.mjs方法接Game，roulette-view.mjs正式視圖。round id拒絕空注超時後的舊按鈕。schema1無新必要欄位，兩副牌靴／AI桌面／背包／舊檔保留；輪盤只保存最終完成局。
- 199項檢查：原172＋27項輪盤，包括50注×38結果、零號／合計保本、亂數排除、三道具／預扣重轉／同號／超時、暫停／舊按鈕／達標破產／唯一保存、舊檔及三份跨桌狀態、美式輪球末角、兩版50格不重疊／模板／DOM飛行／混色／尺寸與2,000局守恆；連同原百家樂4,000／21點2,000／德州2,000共10,000局模擬。
- root／docs及單檔同步19個runtime，10張PNG不改，手圖不存在。browser_smoke.py補桌面輪盤下注／轉動暫停／結果／匯出及七視口精準下注／放大，Python語法通過但未執行；不重試已知HTTP／Chromium IPC失敗路線。

## 已確認框架，不可遺失

- 共通：實際貼圖、底部操作、白紅藍綠紫五色籌碼、隨資金大額操作、自訂／合法全押、飛入混色堆疊與金額、暫停遮桌及停表。百家樂與21點一體賭枱，大小分開上骰盅／下盤面；德州採六人桌獨立層次與同枱布，不強制35／65。
- 大小50種投注；圍骰大小皆輸而其他合資格注照派。重擲／接受／超時都扣持有券。
- 百家樂八副連續牌靴、天牌及標準補牌。主注莊／閒／和最多一項，改押搬原額；旁注獨立複選或單押且保留籌碼。莊0.95、閒1、和8，和局莊閒退本金；莊淨贏按95%向下取整美分。
- 莊對／閒對按首兩張牌階11:1，J＋Q不算，第三張不補成對。幸運六須莊6勝、兩牌12／三牌20，和／輸不派，旁注無佣金。換牌後按最後起手兩張判對子及最終勝負判六，保本按全局合計淨虧損退50%一次。鎖注後百家樂不能加注。
- 百家樂發牌571.4286ms，咪牌delivering→squeezing→unfolding700ms→returning700ms，放手保留／直接揭牌／鍵盤／暫停。所押莊閒及幸運六關聯莊方補牌，先閒後莊；只押對子或和自動揭示。手圖按使用者要求已刪，不能恢復。
- 百家樂下注30秒、啟用換牌後選擇10秒，換後重判天牌／補牌；透視不重置時限／改牌序，少於60張下局重洗，無開靴燒牌。21點少於104張下局重洗、無燒牌、空注不耗牌，本輪預設可調校。
- 無免費道具，每件購買前資金10%，每局最多一件；保本／透視共用五桌，重擲限大小／輪盤用作重轉、換牌限百家樂、21點及德州。一般最低每次$1，0<資金<$1可全押，最終結算後判達標／歸零。21點保險可至一美分，所有3:2／半注不足一美分向下取整。
- schema1及原保存槽保持，只保存完成局，牌靴可選全序／cursor／cycle，舊檔缺swap補0；自由手動槽、競速自動槽、模式分開。關閉／重整回最後完成局，未完成局作廢，接受重試、不宣稱防回溯或局中持久保存。
- 暫停／背景／離線／商店停表，回來按繼續，保留原局／剩餘時間。原生工具dialog不自行停表，真正暫停時先關閉dialog防遮住遮桌畫面。
- 無帳號、雲端、支付、排行榜或額外樓層；中央豪華樓梯不是商店。不改德州6人NL／AI資金20%–120%、輪盤美式38格。

- 輪盤0／00分開，美式38格，50種單號／十二數／直列／六外圍，無邊線／交點；淨35／2／1賠率，零號令外圍等額注全輸。透視鎖注前排除五個不出號，結果固定、下注可改；重轉券須鎖注前啟用即扣，首次開獎後10秒接受或從完整38重轉一次（可同號），超時接受，不可疊道具。沿既有reroll共用庫存，不套大小持券自動分支。
- 德州勝出框只改電腦真正主／邊池得主為金色，平分全部標、退款不標、下一手清；不得重新加回使用者取消的可見得主／牌型文字或額外結束modal資訊。

## 重要檔案與發布

- 聲效：src/sound.mjs、tests/sound.test.mjs（24項）、docs/SOUND_EFFECTS.md；Game發cue、app啟動／sync、ChipFlights落枱通知。首選SOUND_ENABLED=false停聲，保持遊戲資料及偏好。

- docs/GAME_BRIEF.md、ROULETTE.md、ROULETTE_IMPLEMENTATION.md、TABLE_PRESENTATION.md及各桌詳規。新增src/roulette.mjs、roulette-game.mjs、roulette-view.mjs、tests/roulette.test.mjs（27項）；app／Game／board／rules及發布腳本最小接線，storage格式不改。
- scripts/package/pages/prepare產生單檔、Pages及上載清單，排除docs/previews。GitHub：https://github.com/jacobmaster-97/charity-casino ，main根目錄Pages。
- 輪盤停用首選ROULETTE_ENABLED=false、更新快取與封裝；保留最新保存器、pokerTable、兩牌靴及庫存，勿清玩家資料或重帶手圖。前版0.3.1 a0658db6f791524371ec26afd5be73244ddcfb9d供比對；收據docs/*_RELEASE.json。

## 風險與下一個最安全任務

Safari／手機／平板、觸控、旋轉、安全區、SVG transform球位、小格可讀性、精準面板／放大及主要按鈕可達性、持續效能與經濟仍UNVERIFIED；程式通過不是裝置視覺證據。下一步先實機五桌整合回測，輪盤重點為精準下注、轉動暫停、重轉10秒、結算與跨桌保存。五桌只是可玩原型，不宣稱已達beta／正式版或平衡通過。

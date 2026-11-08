# 網頁遊戲開發指引

- 本專案為此對話的新網頁遊戲開發空間，現採 B大廳＋大小／百家樂／21點／德州撲克／輪盤五桌原型切片。
- 預設使用 `.agents/skills/gamestudio/SKILL.md`；不需要等待全域技能選單重新載入。
- 開始工作先讀 `CODEX_HANDOFF.md` 與 `docs/GAME_BRIEF.md`；存在 `DEBUG_HANDOFF.md` 時一併讀取。
- 使用繁體中文溝通，先確定玩家體驗、最小可玩驗證與驗收方式，再做對應實作。
- 已確認的遊戲方向及待決策項目以 `docs/GAME_BRIEF.md` 為準，不將助理提議或題號不明的答案寫成已確認需求。使用者已授權按建議同步製作原型與貼圖；目前五桌已整合；0.2.0新增使用者指定的一體賭枱21點，保留百家樂一體、大小分區、整屏、無手圖、動畫及保存，發布結果見CODEX_HANDOFF.md。使用者已明確指示「實裝動畫」，咪牌及減速動畫已獲批准接入。0.3.0按使用者「下一步開發」接入已確認六人無限注德州撲克，盲注／AI／速度為可調校工程預設，詳docs/POKER_IMPLEMENTATION.md。0.4.0接入輪盤，0.4.1左下注60%／右轉輪40%，0.5.0加入使用者指定五種聲效及靜音，0.5.1依iPad Safari無聲回報修正觸控解鎖及加入啟動試聽，詳docs/ROULETTE_IMPLEMENTATION.md、SOUND_EFFECTS.md；各款沿用docs/TABLE_PRESENTATION.md及已確認0.1.4介面基準。
- `src/` 放程式，`public/` 放靜態素材，`docs/` 放設計及驗證紀錄。
- 素材與音效需記錄來源與授權；不預先加入後端、付費服務或帳號系統。
- 每個重要階段更新 `CODEX_HANDOFF.md`；重複除錯失敗時依技能建立 `DEBUG_HANDOFF.md`。
- 沒有執行過的遊戲、瀏覽器或裝置驗證必須明確標示未驗證。

- 0.6.0使用者已授權大小v2與百家樂手機布局實裝，並明確要求手機輪盤鎖注後彈窗轉動，取代手機舊6:4；一般桌面／平板保留6:4，21點／德州本輪不改。詳docs/MOBILE_TABLES_060.md；不要再要求先預覽，勿重算／複寫牌局結果，存檔保持完成局邊界。

- 0.7.0使用者「可實裝畫面」已批准德州手機橫向無頭像v2；已接現有六人Game及TablePanels，加注面板不暫停、不另保存。詳docs/POKER_MOBILE_070.md；過去只預覽的限制已被本次批准取代。桌面與直向保留舊德州布局。

- 0.7.1依最新回饋補回自己牌型，以對手／手牌間可用帶放公共牌；首頁及大廳單屏、次要項收合。第3點主畫面範圍按已說明假設實作，非另行確定新規則。詳docs/POKER_READABILITY_071.md；保存／AI／計時未改。

- 0.8.0已依使用者正式執行第一階段，僅本機五分鐘挑戰／五桌統計／精確金額及獨立新存檔；入口Game({challenge:true})，舊schema1相容路徑僅供保留／回歸。詳docs/LOCAL_FIVE_MINUTE_080.md。本輪不部署GitHub或建立Cloudflare，完成後停止，不自行開始提示詞二。

- 後續使用者明確要求「將新版發佈到GitHub」，已授權發布0.8.0至原jacobmaster-97/charity-casino main及既有Pages，取代上一輪不發布邊界；仍不開發排行榜、不建立Cloudflare或其他服務。

- 0.9.0使用者「實裝主畫面」已確認home-landscape-v2及「五分鐘賭神」名稱／Logo。接入真DOM四入口、原開始／續玩／音效／存檔，詳docs/HOME_SCREEN_090.md；不再要求先確認此主頁，不自行接排行榜或付款。此輪只本機實裝／封裝，未另發布遠端。

- 後續使用者「更新github」已明確授權發布0.9.0至原倉庫main及既有Pages。保持同一網址與存檔前綴，不開發排行榜或付款；發布結果見最新交接及HOME_SCREEN_RELEASE.json。

- 0.9.1依使用者橫向地圖太小回饋，移除大廳底列及地圖遮擋，把商店／更多／暫停放頂欄，44→35.2px（指定20%縮矮例外）；詳docs/LOBBY_VIEW_091.md。沒有另改五款牌桌／玩法或素材，本輪只本機修整及封裝。

- 使用者後續「更新GitHub」已授權發布0.9.1至原main／Pages，取代上一輪未發布界線；仍不開發排行榜／付款。結果見LOBBY_VIEW_RELEASE.json及最新交接。

- 0.9.2使用者「實裝至GitHub」已批准lobby-iphone16plus-wide-v1及發布。手機橫向等比例填滿實際安全區內地圖寬度、偏上15%取景，五入座同scene且依實際高度保護；桌面／直向及極短視窗回完整圖。詳docs/LOBBY_WIDE_092.md；不再等待預覽確認，不硬寫iPhone安全區數字，不開排行榜／付款。

- 0.9.3依使用者三項回饋修正名稱框置中、五桌派彩小視窗與本機貼圖預載／入桌準備，詳docs/UI_POLISH_093.md。原五分鐘規則／貼圖／存檔不改；本輪未另發布GitHub，線上仍0.9.2，不自行接排行榜或雲端。

- 使用者後續「實裝到GitHub」已授權0.9.3發布至原main與Pages，取代上一輪只本機限制。保持五桌／存檔／貼圖及原網址，不開排行榜／Cloudflare／付款；實際結果另見UI_POLISH_RELEASE.json及最新交接。

- 0.9.4回應0.9.3載入變慢：移除全圖load／decode入桌門檻、首頁全圖warm及準備視窗，恢復同步即入桌；只在指向／聚焦／觸碰某桌時選取1–2張主要圖低優先度hint，不強制decode。保留名稱框／派彩modal與全部規則。詳docs/LOAD_RECOVERY_094.md；不准再用全圖等待掩蓋慢圖，本輪只本機，線上仍0.9.3。

- 0.9.4發布範圍解讀：使用者在剛授權「實裝到GitHub」並發布0.9.3後回報載入變慢，沿用同一main／Pages發布授權修復該回歸，取代本輪早先只本機的暫定範圍；不是使用者另行指定新功能。不開排行榜／雲端，部署核對見LOAD_RECOVERY_RELEASE.json。

- 最新挑戰記錄重設計：使用者明確要求先預覽，docs/previews/challenge-record-v1為完場統計頁金箔深綠方案及四組靜態輸出；未實裝、未升版、未部署，正式保持0.9.4。等待使用者確認後才接DOM／CSS，禁止沿用過往發布授權自動上線此設計。

- 挑戰記錄v2：六項修訂及確認「只刪底部說明，保留五桌金額」記於docs/previews/challenge-record-v2。分享按鈕需PNG原生手機分享，另有失敗卡；目前僅預覽＋隔離分享試作，不接正式Game／不部署。固定示例PNG不能作正式成績，真接入要依checkpoint動態產圖並在Safari HTTPS驗證。

- 挑戰記錄v3時間規格：改「遊玩時間」，完成頁及分享圖隱藏時間，失敗頁保留時間與返回主頁／分享挑戰紀錄兩鍵；預覽先開失敗頁，純PNG不帶操作鍵。見docs/previews/challenge-record-v3；仍未批准正式接入／部署，不改Game內時間／保存資料。

- 0.10.0使用者「實裝至GitHub」已批准v3紀錄頁及原生PNG分享正式接入／發布，取代先預覽限制。完成頁／PNG隱藏時間，失敗保留遊玩時間及返回／分享；保留五桌金額、刪指定次要文字。PNG從實際結算快照本機產生，不能用示例，取消不下載、不支援原生分享則PNG下載，不加雲端／排行榜或全圖入桌門檻。詳docs/CHALLENGE_RECORD_0100.md及實際發布收據。

- 0.10.1依使用者21點手機橫向畫面問題修正：獨立landscape斷點、單行35.2px頂欄、莊家／玩家左右分區、底列44px操作，次要工具收入更多；長手牌換牌獨立橫向捲動保持44px目標。桌面／直向與五桌規則／Game／存檔不改。沿用前次「實裝至GitHub」後同一已部署頁面的修復範圍，發布至原main／Pages，不開排行榜或Cloudflare。詳docs/BLACKJACK_LANDSCAPE_0101.md；真Safari未驗須如實交接。

- 最新：使用者要求21點改為德州式賭枱且「先讓我預覽」，docs/previews/blackjack-table-v1只有三張靜態示例與切換HTML，未替換正式21點布局。另按第2點在本機0.10.2以GAME_FEATURES關閉商店／道具，保留存檔庫存／素材，阻止舊券自動重擲；詳docs/FEATURES_PAUSED_0102.md。這輪未發布，GitHub保持0.10.1，不准沿用舊發布授權自動上線新設計。待使用者確認後再接21點與發布；不自行重新開店或啟動排行榜／Cloudflare。

- 0.11.0使用者「實裝到github」已批准blackjack-table-v1設計正式接入及發布，取代上一輪先預覽／未發布界線。手機橫向21點以橢圓深綠酒紅金邊賭枱、莊家上方／玩家下方、真實牌局與行動倒數呈現；分牌保留全部手牌、窄屏局部滑動與自動跟隨，桌面／直向沿用原布局。商店與道具GAME_FEATURES維持false，庫存保留，只有使用者決定才重新開放。詳docs/BLACKJACK_OVAL_0110.md及實際發布收據；不開排行榜／Cloudflare。

- 最新書籤圖示：使用者明確三款先預覽、確認才實裝，docs/previews/bookmark-icons-v1有image_gen生成A金印賭字／B五分鐘籌碼／C黑桃王者。原圖、提示詞、來源hash與隔離大小比較頁保留；未改正式favicon／touch-icon／版本或GitHub。先等選款／修訂，不沿用舊發布授權自動接入或開店。

- 0.11.1使用者「要a 然後實裝」及「繼續工作」已選A金印賭字，取代先預覽限制，沿既有GitHub遊戲流程正式接入／發布。PNG16／32、ICO16／32／48及Apple180，原圖保留，頁面只載小圖，單檔內嵌，root／docs相對路徑同步。詳docs/BOOKMARK_ICON_0111.md；不重繪或改Logo、商店與道具保持關閉，不開排行榜／Cloudflare。

- 0.12.0依使用者最新追加，主頁五項按開始／龍虎榜／設定／加到主頁面／支持作者排列。點新項只顯平台對應步驟子視窗，取代原生安裝提示提案；Safari3步、iPhone Chrome4步，Android用實際⋮選單，未知可切換。補最小standalone manifest與A192／512，無SW或原生安裝／分享API。詳docs/HOME_INSTALL_0120.md；沿原GitHub遊戲流程實裝發布，商店／道具維持關閉，不開排行榜／Cloudflare。

- 0.12.1使用者要求刪除自由挑戰：正式app只提供race五分鐘，移除開始／設定模式選擇及自由模式手動存讀入口，拒絕free匯入／restore且不回落到free自動檔。原free鍵／舊檔不刪不改，底層legacy解碼及歷史測試保留，不能當作重新開放模式。詳docs/SINGLE_CHALLENGE_0121.md；沿原GitHub流程發布，商店／道具仍關閉。

- 0.13.0使用者已回答本機驗收「是」及「每次完成各留一筆」，授權開始Cloudflare Workers＋D1排行榜，取代舊不開排行榜的階段限制。只在完場按鈕上傳名稱／最終金額＋必要提交UUID；每次挑戰獨立，同名不覆寫、同次重試去重，遊玩過程全部留本機。先完成Worker／migration／前端／測試，apiBase預設空字串停用。使用者已有免費帳戶、未建Worker／D1；未有登入授權／ID／公開網址，不自行升級付費或宣稱部署，不把管理金鑰放HTML／GitHub。詳docs/CLOUDFLARE_LEADERBOARD.md；商店／道具仍關閉。

- 0.13.0後續使用者授權代操作，已透過本工作區device OAuth成功登入；原D1未換庫，原SQL直接執行及tracker成功、Worker已部署，原空白migration錯誤原因未重現不可杜撰。前端已填真實公開Worker URL，file:版停用網絡；需完成最後公網防護／發布核對後接原Pages。原生限流外另有bounded isolate突發計數，不收遊玩紀錄／IP到D1，不把OAuth設定放公開倉庫；具體證據見最新交接及LEADERBOARD_RELEASE.json。

- 最新龍虎榜v1：使用者明確要求先確認；docs/previews/leaderboard-v1為隔離設計預覽，只有示例PNG／SVG／切換頁，不接正式前端、不升版、不發布GitHub／Cloudflare。先等使用者確認。橫向深玉綠金箔龍虎、左三甲右榜單；正式接入須保持每頁20、同次去重／每次各一筆，三甲快取與cursor同快照，空榜不得補假資料；不新增日期篩選／帳號欄位。

- 0.13.1使用者最新「實裝」已確認龍虎榜v1正式接入，取代前述先預覽限制，沿現有GitHub Pages發布。新排行榜DOM／CSS、輕量WebP、三甲快照及分頁；Worker／D1／API資料規則及遊玩流程不改，不重建雲端或開付費。真實空榜不可補示例，完整金額不可縮略丟精度，實機未驗須明示。詳docs/LEADERBOARD_UI_0131.md及發布收據。

- 0.13.2使用者在33項Word文案已完成後說「實裝」，授權發布本次修訂到原main／GitHub Pages，取代上一輪只本機限制。不新增尚未確認的設定功能，不改Cloudflare／D1或五分鐘規則；保留存檔。只公開修訂對照，Word及完整編輯文件保留本機。詳docs/TEXT_REVISIONS_0132.md及TEXT_REVISIONS_RELEASE.json。

- 最新thumbnail-v1：使用者明確先確認，只做標題＋簡短宣傳文字預覽。圖在docs/previews/thumbnail-v1；宣傳句「五分鐘，搏出你的傳奇」是未確認提案，不接正式metadata／圖示或發布，正式維持0.13.2。等待新確認，不能沿用前輪發布授權。

- Thumbnail最新v3：使用者要求加入人物並指定「五分鐘 賭出我天地」，取代v1無人物及舊宣傳句。docs/previews/thumbnail-v3為當前設計；仍遵守先確認才實裝，不發布或改metadata，正式維持0.13.2。

- Thumbnail最新v4：使用者要求刪除人物，取代v2／v3的雙人構圖。只保留標題「五分鐘賭神」及「五分鐘 賭出我天地」，docs/previews/thumbnail-v4是當前待確認版；仍未實裝／部署，正式0.13.2不變。

- 0.13.3使用者最新「實裝」批准thumbnail-v4無人物版本，取代此前待確認限制；正式接入OG／Twitter分享metadata並發布原GitHub Pages。原圖逐byte複製，不改主頁／圖示／玩法／Cloudflare；主標五分鐘賭神、宣傳句五分鐘 賭出我天地。詳docs/THUMBNAIL_0133.md及THUMBNAIL_RELEASE.json。

- 0.13.4使用者要求部署Vercel，已有帳戶未建專案。授權準備／建立Vercel遊戲專案，保留GitHub Pages及原Cloudflare／D1，不升付費。vercel.json輸出dist/vercel僅遊戲與素材；取得真實網址才加入Worker精確origin，禁止放寬全部vercel.app。Vercel憑證及.vercel/保持專案外／忽略。狀態見docs/VERCEL.md及VERCEL_RELEASE.json。

- 0.14.0使用者要求按聲音／存檔與資料／說明與關於框架實作設定，並追加回報問題；此新指示批准恢復設定內的備份匯入匯出，取代0.13.2刪除入口的舊要求。橫向分類、音量偏好獨立存、保存時間可選metadata、匯入先確認，問題回報只本機整理並由玩家自行送出。保留暫停／背景及五分鐘規則。沿既有遊戲發布流程更新原GitHub Pages；Vercel仍待帳戶授權，不自行放寬CORS或升付費。詳docs/SETTINGS_0140.md及SETTINGS_RELEASE.json。

- 0.14.1使用者指定主頁「支持作者」點擊直接進入https://buymeacoffee.com/studios_16；以原生HTTPS連結另開分頁，保留原遊戲，主選單不經data-action或中間彈窗。更新原GitHub Pages；不嵌入第三方付款SDK或自動操作付款，不影響Vercel待辦。

- 0.14.2使用者要求刪除回報問題，取代0.14.0該功能規格；已移除UI、草稿／裝置狀態、Clipboard／TXT及GitHub Issue入口。設定固定footer新增原生「關於作者」https://www.threads.com/@studios_16_（保留末尾底線），主頁安全區底部細行「作者：studios_16」，menu依實際署名高度預留間距。Buy Me a Coffee支持作者維持原址。發布原Pages；Vercel仍待授權。

- 0.15.0依使用者加入上載Brass Command背景音樂及手機／平板固定橫向；音樂獨立偏好、循環、手勢解鎖，不能阻塞入桌。直向阻擋並暫停兩倒數保留原局，回橫向需繼續；iOS不支援強制旋轉時保留提示，桌面不受限。manifest橫向、離線包內嵌音樂，原素材／規則／存檔／Cloudflare不改，沿既有原Pages發布流程。詳MUSIC_LANDSCAPE_0150.md及MUSIC_LANDSCAPE_RELEASE.json；本環境此次已成功啟動本地server及Chromium，舊IPC限制不可再當成當前未驗理由，但模擬不是iOS真機。

- 2026-11-08使用者再次要求接入Vercel並更正最終專案名5mins-gamber；已官方device登入、在Hobby jerseyprice建立專案／公開正式域名https://5mins-gamber.vercel.app，連原GitHub main。原Pages保留，原Worker僅追加精確origin、D1不改，不升付費；憑證專案外、CLI生成的OIDC .env.local已移除，.vercel忽略。詳VERCEL.md／VERCEL_RELEASE.json；待以實際GitHub推送驗證自動部署，不能只看Connected即宣稱已驗。

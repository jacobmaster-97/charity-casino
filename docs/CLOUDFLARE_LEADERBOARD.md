> 2026-11-08：已新增Vercel正式origin https://5mins-gamber.vercel.app ，保留 https://jacobmaster-97.github.io 。只改原Worker ALLOWED_ORIGINS，D1結構／資料保持，未新增假成績。部署版本9d82e4fc-7768-4ef7-9abf-a754bbaf41a3；完整跨站證據見VERCEL_RELEASE.json／VERCEL.md。

# Cloudflare Workers＋D1 排行榜部署與接線

日期：2026-11-05（香港）。程式版 0.13.0；D1及Worker、GitHub Pages均已實際發布並完成公網程式／API核對，詳LEADERBOARD_RELEASE.json。使用者已確認本機驗收及「每次完成各留一筆」。不改為每人最佳、不建立帳號、不開啟商店／道具。

目前公開API：`https://five-minute-god-leaderboard.jameshh998.workers.dev`。原D1已建立scores／索引及0001遷移記錄，沒有更換資料庫；之前空白ERROR在直接執行原SQL時未重現，原因仍未確立。以下保留新環境設定步驟，已有資源毋須重新建立。

## 結構及資料界線

GitHub Pages 繼續提供原遊戲。玩家完成本機挑戰後，按「上傳排行榜」才 POST 到 Worker；Worker 驗證、限流及去重後寫 D1。主頁「賭神龍虎榜」GET 同一 Worker，所有玩家可查看。

上傳 JSON 僅 `{ "name": "參賽者", "finalAmount": "123.45" }`，另以 `Idempotency-Key` UUIDv4 標頭識別這次挑戰。沒有牌局、下注、道具、暫停、計時或派彩欄位；不傳本機結算統計。輸贏都可上傳，包括破產的 0.00。無自動上傳、無每局出網、無首頁預載排行榜。

D1 `scores` 僅保存自增 ID、提交 UUID、名稱、整數分字串及其衍生長度；不保存時間、IP、裝置、帳號或遊玩紀錄。IP 經雜湊僅用作 Cloudflare 邊緣短期限流鍵，不寫 D1 或應用日誌；Worker 關閉 observability，沒有 console 記錄。Cloudflare 本身處理連線所需的網絡資訊，這不代表網絡服務不會收到 IP。

每個新挑戰在本機產生獨立 UUID，隨新挑戰存檔保留。上傳前保存本機 outbox，網絡失敗／回應遺失／重新開啟時沿用相同 ID 與內容；同 ID 同內容回成功，相異內容回 409，不覆寫。舊 schema2 存檔沒有 UUID 仍可讀取，首次上傳時建立並在 outbox 記住該份紀錄的提交。舊 free／schema1 資料不遷移。outbox 及原存檔僅留本機；不能清除瀏覽器資料後仍保證重試去重。

金額全程用精確整數分／文字，不轉 JS 浮點數或 SQLite 64 位整數。線上最多 128 位整數分（最多 126 位整數元＋兩位小數）；超限拒絕上傳但保留本機結果。依分字串長度、字串值降序，再按 ID 升序排序；同名各留一筆，同額先提交者先列。

## iPad＋GitHub Codespaces：接續既有資料庫

使用者已在iPad開啟既有charity-casino倉庫的Codespace。此環境與本工作區／Mac互相獨立：GitHub main仍是0.12.1，沒有候選版Cloudflare檔案，不能當成已部署0.13.0；Mac的Wrangler登入亦不會自動帶入。既有D1沿用，先核對migration錯誤，不重建資料庫。

1. 在iPad下載已填D1的 `cloudflare-leaderboard-ready-0.13.0.zip` 到「檔案」App，保留ZIP。
2. Codespaces左方Explorer對專案根資料夾長按／右鍵，選Upload，把ZIP上傳到專案根目錄。保留原檔名。
3. 選 ☰ → Terminal → New Terminal，確認終端機在專案根目錄，再逐行執行：

```bash
unzip -n cloudflare-leaderboard-ready-0.13.0.zip
ls cloudflare/wrangler.jsonc
```

`-n`保留既有同名檔，不覆蓋專案；若遇unzip不存在、ZIP名稱不符或設定找不到，先貼錯誤／pwd與檔名確認，不盲目改目錄。

4. 登入雲端終端機應採裝置碼流程，避免localhost回呼指向iPad：

```bash
npx --yes wrangler@4.157.0 login --device
```

開它這次提供的驗證網址，輸入裝置碼並登入持有D1的Cloudflare帳戶。驗證碼／Token不需貼到對話。CLI4.157.0 help已確認支援--device，但尚未在使用者Codespace完成驗證；如遇Node版本或登入錯誤，先保留錯誤訊息，不改用普通localhost登入或索取Token。

5. 登入成功後先whoami及只讀查詢，核對D1狀態、是否已有scores表，取得上一個migration失敗的具體原因。診斷前不重新apply／deploy、不刪表。部署包仍是同一份SQL，未宣稱已修正遠端遷移問題。

## Mac 首次部署：登入 cookie／找不到設定檔

若顯示 `No CSRF value available in the session cookie`，OAuth未成功；若路徑是 `/Users/你的名字/cloudflare/wrangler.jsonc` 且ENOENT，代表目前在個人主目錄，不是解壓包目錄。兩項需分開處理，與npm版本通知無關。

1. Finder解壓ready部署包，找到同時包含 `START_HERE.md` 及 `cloudflare` 資料夾的目錄。
2. 終端機輸入 `cd `（cd後有空格），把**這個目錄**從Finder拖進終端機，再按Enter。執行下面一行確認；若仍找不到，先修正目錄，不執行遷移／部署。

```bash
ls cloudflare/wrangler.jsonc
```

3. 在**同一部Mac**的Safari或Chrome一般視窗登入 <https://dash.cloudflare.com/>，確認可看到自己的帳戶。終端機執行：

```bash
npx --yes wrangler@4.157.0 login --browser=false
```

保持終端機開啟，把它**這次新產生的完整OAuth網址**直接貼到剛登入的瀏覽器，按畫面授權；不重用對話中的舊網址或截短／改寫URL。回終端機看到登入成功後才繼續。`--browser=false` 已由4.157.0 CLI help核實，只關閉自動開瀏覽器，不跳過登入。這是針對cookie/session問題的排查，尚未在使用者Mac證實。

4. 如仍出同一CSRF錯誤，先回報錯誤，不重複執行migration／deploy，也不需要更新npm、清除所有網站cookie、停用全瀏覽器防護或提供管理Token。
5. 登入成功後逐行執行：

```bash
npx --yes wrangler@4.157.0 whoami
npx --yes wrangler@4.157.0 d1 migrations apply DB --remote --config cloudflare/wrangler.jsonc
npx --yes wrangler@4.157.0 deploy --config cloudflare/wrangler.jsonc
```

whoami應顯示持有D1的帳戶；migration成功後才deploy。部署成功回傳公開workers.dev網址供遊戲接線，不傳OAuth token／回呼code或本機憑證。

## 1. 建立免費帳戶及安裝工具

到 <https://dash.cloudflare.com/> 建立／登入帳戶，維持 Workers Free，不啟用 Paid 或輸入付費升級。如果介面或 CLI 要求升級才能使用本方案，停止並核對，不自動升級。

在自己的電腦安裝 Node.js 24，在專案根目錄執行。以下固定使用已通過本機預演的 Wrangler 4.157.0：

```bash
cd /workspace/web-game
npx --yes wrangler@4.157.0 login
cp cloudflare/wrangler.example.jsonc cloudflare/wrangler.jsonc
npx --yes wrangler@4.157.0 d1 create five-minute-god-scores --config cloudflare/wrangler.jsonc
```

`/workspace/web-game` 是本工作區路徑，在個人電腦請換成實際專案目錄。login 會使用瀏覽器授權，管理憑證只留自己的部署環境，毋須貼到對話。已有同名 D1 時使用既有資源，不能反覆建立。若 CLI 詢問自動修改設定，只修改本機 `cloudflare/wrangler.jsonc`。

亦可在 Dashboard 的 **Workers & Pages → D1 SQL Database → Create** 建立 `five-minute-god-scores`，再執行上面的 cp，毋須再執行 d1 create。帳戶有多個 account 時，在本機 config 加 `account_id` 選擇正確帳戶。

## 2. 綁定 D1 及建立結構

把建立結果的 `database_id` 填入本機 `cloudflare/wrangler.jsonc`，取代 `REPLACE_WITH_D1_DATABASE_ID`。資料庫名稱維持 `five-minute-god-scores`、binding 維持 `DB`。`ALLOWED_ORIGINS` 已設定 `https://jacobmaster-97.github.io`，這是 origin，不包含 `/charity-casino/` 路徑；其他正式網域可用逗號增加，禁止 `*`。

config 同時有 WRITE_LIMITER（每 IP／邊緣位置約 10 次／分鐘）與 READ_LIMITER（60 次／分鐘）綁定。另有每個Worker isolate的60秒記憶體突發計數（寫10／讀60，最多4096個雜湊鍵），補充原生最佳努力限流；不新增D1欄位／IP紀錄，實例重啟及跨節點不保證嚴格總額。namespace_id 1001／1002 需在此帳戶內保留給這個用途；若已有其他服務使用，換成兩個未使用的數字。這是 Cloudflare 原生 Rate Limiting binding，不是 D1 保存 IP，也不是全網精確總限額。

```bash
npx --yes wrangler@4.157.0 d1 migrations apply DB --remote --config cloudflare/wrangler.jsonc
```

檢查待執行的 `0001_scores.sql` 後確認。這是新增表／索引，不刪除成績；Wrangler 自行維護 migration bookkeeping，沒有遊玩紀錄。已有其他業務資料的資料庫不應混用。可檢查：

```bash
npx --yes wrangler@4.157.0 d1 execute DB --remote --config cloudflare/wrangler.jsonc --command="SELECT COUNT(*) AS score_count FROM scores"
```

## 3. 部署 Worker

先做不建立資源的預演，再真正部署：

```bash
npx --yes wrangler@4.157.0 deploy --dry-run --config cloudflare/wrangler.jsonc
npx --yes wrangler@4.157.0 deploy --config cloudflare/wrangler.jsonc
```

記下公開網址，例如 `https://five-minute-god-leaderboard.YOUR-SUBDOMAIN.workers.dev`。`workers.dev` 如尚未啟用，按免費子網域流程設定，不需要購買網域。若 D1 或限流 binding 缺失，API 回 503 並停止寫入，不降級成無限流版本。

## 4. 連接現有遊戲及 GitHub Pages

修改 [src/leaderboard-config.mjs](../src/leaderboard-config.mjs)，只填公開網址：

```js
export const LEADERBOARD_API='https://five-minute-god-leaderboard.YOUR-SUBDOMAIN.workers.dev';
```

不要填 API Token、帳戶管理密碼、Authorization、D1 管理金鑰或帶密碼的 URL。此 API 本來就是公開玩家介面，前端沒有管理權限。空字串是停用開關：不發網絡請求，本機挑戰及分享仍可使用。離線單檔在file:環境會停用排行榜請求，避免Origin:null跨網域失敗；排行榜供正式HTTPS網頁使用，離線遊戲及分享不受影響。

```bash
npm run verify
npm run verify:pages
```

發布同一版 `src/`、根 index／manifest 及 `docs/play/`／docs index 至既有 GitHub 倉庫與 Pages。保持目前 Pages 來源設定及存檔前綴，毋須換主機。**不要在 Worker 尚未部署／API 尚未公網驗證時發布一個填入示例網址的版本。** `npm run prepare:github` 可整理公開檔案，會排除本機 Cloudflare 設定、憑證及快取。

## 5. 公網驗證

部署後可執行只讀測試：

```bash
node scripts/smoke-leaderboard.mjs --api=https://YOUR-WORKER.workers.dev
```

要驗證真正寫入及去重，另加 `--write-test-score`。此選項會在公開榜留下**一筆「連線驗證／0.00」**，並輸出它的 entryId；第二次 POST 使用同一 ID 驗證沒有重複。每次重新執行腳本會建立另一筆驗證成績，勿循環執行。只讀測試不代表寫入成功。

實機測試：手機完成挑戰 → 上傳 → 等約 15 秒 → 另一個瀏覽器開龍虎榜確認；再測飛行模式上傳失敗、恢復連線重試、重新開啟恢復完成紀錄後重試、同名不同挑戰、破產 0.00、橫向短屏局部列表捲動。紀錄實際 Pages commit、Worker version、D1 migration 及測試結果；不能把本機替身測試當成公網驗證。

## API 及防護界線

- POST `/v1/scores`：application/json；上限 1024 bytes；僅 name／finalAmount。名稱 NFC、1–16 個 Unicode 字元，禁止控制／雙向覆蓋字元。金額必須非負、正規兩位小數字串。UUIDv4 `Idempotency-Key` 必填。新建 201，重試 200，衝突 409。
- GET `/v1/leaderboard?limit=20&cursor=...`：每頁 1–50，預設20；回 items（entryId／rank／name／finalAmount）及 nextCursor。keyset 分頁固定首次頁的最大 ID，途中新成績不插入後續頁；重新整理取得新快照。cursor 僅供導覽，並非身份或防作弊憑證。
- 公開讀取快取 15 秒，CORS 在快取後依 origin 套用，POST 不快取。沒有全表 OFFSET、每次全榜下載或每位玩家輪詢。
- 400／413／415 格式錯誤、403 origin、429 限流（Retry-After:60）、503 未設定／服務失敗。錯誤不洩漏 SQL；前端以安全轉義文字顯示名稱，所有 SQL 用綁定參數。
- 瀏覽器 CORS、限流、精度檢查及去重能降低誤用／重複，**不能證明本機金額真實**。改客戶端、偽造請求、換 IP／新 UUID 仍可能提交作弊資料；本版不宣稱杜絕作弊。沒有偷偷加入全程驗證或任意猜測「合理最高分」的截斷。

## 回退與成本

設 `LEADERBOARD_API=''` 後重建／發布可立即關閉遊戲的排行榜網絡入口，不影響本機存檔。服務端可回退前一 Worker version；D1 保留，不 drop table、不清空成績。備份或個別管理刪除需由管理員在部署環境執行，不提供公開刪除 API。

本實作沒有啟用付費方案或設定自動升級。免費請求／讀寫／儲存額度以帳戶 Dashboard 及當日官方說明為準，超額時可能拒絕請求；限流不是帳單總上限。此次官方頁面取用回 403，未重新核實額度，故不承諾固定玩家容量。

官方參考：<https://developers.cloudflare.com/workers/wrangler/commands/>、<https://developers.cloudflare.com/d1/get-started/>、<https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/>、<https://developers.cloudflare.com/workers/platform/pricing/>、<https://developers.cloudflare.com/d1/platform/pricing/>。

## 此次驗證層級

本機：實際 SQLite migration／SQL、Worker Request／Response、前端到 Worker 的遺失回應重試、DOM 接線、遊戲回歸、Pages／單檔封裝及 Wrangler dry-run。詳 `LEADERBOARD_VALIDATION.json`。

已完成實際D1建表／migration記錄及Worker部署、公網GET／POST／重試去重／衝突／分頁／欄位拒絕／CORS。限流已在正式API觀察到429／Retry-After:60；GitHub發布及實機結果以LEADERBOARD_VALIDATION.json／LEADERBOARD_RELEASE.json為準，不能以本機測試冒充公網／實機驗證。

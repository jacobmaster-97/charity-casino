# 賭王慈善大賽 · 原型0.1.8

B港式賭片卡通的大廳＋大小／百家樂原型。其他三桌標示開發中，正式首版五款全開的規劃保持。

## 直接試玩

下載`dist/charity-casino-prototype.html`，以桌面瀏覽器開啟。全部程式與圖片已內嵌，不需Node或連線下載素材；另有下方GitHub Pages網址。

本地HTML保存權限依瀏覽器設定而異，保存失敗時可匯出完成局。手機系統可能用檔案預覽器開啟HTML；手機正式驗證需使用HTTP網站環境。

## 原始碼執行

Node.js 22以上，不需安裝套件：

```sh
npm start
```

開啟 http://127.0.0.1:4173 。可用PORT變更埠號。

```sh
npm run verify
```

執行語法、規則／存檔、單檔打包與封裝校驗。npm run build可重新產生HTML。

## 功能

- 0.1.8：牌桌依可用視窗高度配置，完整盤面及底部主要控制；明細／道具等以彈出面板顯示，咪牌手圖已移除。布局與裝置限制見docs/VIEWPORT_LAYOUT.md。

- 姓名、競速／自由模式、故事卡、B大廳及五桌入口。
- 上下排列的完整翠綠大小盤面、底部投注控制、五色籌碼飛入與混色堆疊、50種投注、同局多注、隨資金調整大額籌碼、自訂／全押、30秒下注、三骰、已確認賠率。
- 百家樂八副連續牌靴、莊閒和單項投注、標準補牌、佣金及和局退注；換牌後重判天牌與補牌。
- 百家樂三款旁注：莊對／閒對各11:1，幸運六莊6勝兩牌12:1／三牌20:1；旁注可複選或單押、共用總投注限制、整局保本。發牌速度減慢30%；所押方補牌可拖動牌角咪牌，亦可直接揭牌，暫停保留進度。
- 商店10%定價、保本／透視／重擲／換牌，每局一件、沒有免費配給。
- 暫停遮桌、兩種計時停表、背景／失焦暫停，按繼續才恢復。
- 完成局自動保存，自由模式另有手動保存；匯出／匯入完成存檔、模式槽分開。
- $100起始、$25,000,000達標、結算後歸零失敗。

第一局完成前沒有初始存檔；購物於下一局完成後一起保存。關閉／重整捨棄未完成局，回最後完成狀態。原型工程預設與限制見docs/PROTOTYPE.md。

## 驗證狀態

共94項通過：規則／存檔22項、盤面／動畫及模板9項、百家樂23項、新旁注12項、咪牌12項、面板／視窗7項、封裝3項、Pages6項。沙箱拒絕HTTP與Chromium所需socket，瀏覽器尚未成功啟動；視覺、觸控及裝置實測未完成，不當作正式發布版。限制見DEBUG_HANDOFF.md，允許Chromium的環境可執行tests/browser_smoke.py。

慢速發牌及咪牌詳規與限制見docs/BACCARAT_ANIMATION.md。百家樂實作及舊檔相容見docs/BACCARAT_IMPLEMENTATION.md；盤面及裝置驗證缺口見docs/SIC_BO_BOARD.md。素材來源見docs/PROTOTYPE_ART.md、public/art/prototype-b/assets.json及public/art/sicbo-board-b/assets.json。技能來源：https://github.com/guangyuspace/codex-gamestudio-skill 。

## GitHub Pages

專案倉庫：https://github.com/jacobmaster-97/charity-casino 。

試玩網址（已啟用Pages）：https://jacobmaster-97.github.io/charity-casino/ 。

遊戲原始碼與Pages檔案已上載至main；0.1.1支援從根目錄或/docs發布，修正手機／平板圖片路徑。`npm run build:pages`產生docs/index.html及docs/play/；`npm run verify:pages`檢查子路徑及圖片。

上載後到Settings → Pages，選Deploy from a branch、main、/（目前設定；亦支援/docs）。後續更新程式時同步提交生成的docs檔案。完整流程見[GitHub Pages說明](docs/GITHUB_PAGES.md)。

網頁版存檔仍在瀏覽器；本地HTML存檔需匯出後再在網頁匯入，不會自動同步。

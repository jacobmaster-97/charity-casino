# 支持作者連結0.14.1

使用者指定：https://buymeacoffee.com/studios_16 。主頁「支持作者」改為同樣式原生a連結，target=_blank、rel=noopener noreferrer，並有另開分頁的輔助名稱。它沒有data-action，避免app點擊代理preventDefault擋住原生跳轉，也不再先開提示視窗。原主選單五項位置／圖案／安全區與44px目標維持。保留的舊support dialog降級入口亦改為真實連結，不再顯示尚未開放。

不讀第三方頁面指令、不嵌入SDK、不自動送出訊息或操作付款。連結不帶遊戲姓名、存檔、牌局或金額參數。遊戲規則／本機資料／Cloudflare／D1不改；Vercel仍待登入授權。

沿用既有測試，更新首頁原生連結與舊降級入口的預期，不新增低影響重複測試。419項通過（399單元組件＋6單檔＋10 Pages＋4 Vercel），單檔／Pages／Vercel輸出同樣使用該連結。正式發布與HTTP檔案證據見SUPPORT_LINK_RELEASE.json；真手機點擊／外部瀏覽器切換及第三方網站流程未操作驗證。

# 知識樹重構研究筆記

## 正式站基線
- URL: https://academy.gugopro.com/en/index.html
- 現有首頁以五個 Level 學程為主：Fundamentals、Stocks、Futures、Quant、Crypto。
- 現有頁首有 GugoPro Academy 品牌、Tools 下拉與語言下拉；頁尾已有基本學程連結、免責聲明。
- 現有首頁已有高殖利率複利工具、TradingView 入口、風報比工具、進階工具庫與 Amazon Hub。
- 主要問題：首頁將學程、文章、工具與導購垂直堆疊，入口分層不夠清楚；新需求的 12 大商品分類尚未形成首頁知識地圖。

## 市場先生參考
- URL: https://rich01.com/
- 觀察到的架構：頂部主選單先用主題分類導覽（投資開戶、新手先看、新手入門、ETF 投資、投資進階、信用卡比較、銀行存款/優惠、關於）。
- 首頁再將最新文章、搜尋、近期文章、文章分類與精選文章分區，將「導覽索引」與「內容流」分離。
- 本專案採用其資訊架構原則：首頁首屏先提供學習定位與商品分類索引，再以可折疊/篩選方式展示 12 類內容；文章與工具採配對卡片呈現，避免一次性長列表。
- 不複製其品牌、圖片或文字，只借鏡分類導覽與內容層級。

## 本地預覽檢查
- URL: http://127.0.0.1:4173/
- 首頁已正確顯示新版標題、知識樹工具列、12 張分類卡、4 張工具預覽卡、3 張閱讀室卡、TradingView、Ko-fi、Amazon Hub 與頁尾導覽。
- 瀏覽器擷取到全部 12 個「閱讀指南」連結，顯示首頁資訊架構已由長列表改為可定位的矩陣。
- 已點擊「股票市場」篩選按鈕，畫面仍正常，按鈕取得 active 狀態；搜尋邏輯由 app.js 綁定。

## 工具工作台驗證
- URL: http://127.0.0.1:4173/tools/index.html#bond-panel
- Hash 直達成功啟用「債券久期」面板；頁面可見 9 個工具分頁、輸入欄位、本機 AI 設定、TradingView CTA 與頁尾導覽。
- 使用預設值執行債券試算，成功輸出理論價格 NT$ 1,045、Macaulay 久期 4.50 年、修正久期 4.41 年、50 bp 變動的近似價格影響 NT$ -23。

## 指南頁驗證
- URL: http://127.0.0.1:4173/guides/bonds.html
- 債券指南的側欄包含 12 個分類連結與 1 個工作台入口；頁面包含 1 張結構化表格、2 個文章工具連結與 1 個 TradingView 合作 CTA。
- DOM 檢查確認所有連結與表格元素存在，且指南內容可從首頁知識樹返回。

## 全工具回歸測試
- URL: http://127.0.0.1:4173/tools/index.html
- 逐一觸發複利、ETF 費用、債券久期、曲線警示、風報比／Kelly、DCF／安全邊際、4% 提領、再平衡與蒙地卡羅，共 9 個計算器，全部產生非空結果。
- 預設情境例：複利終值 NT$ 4,877,171；ETF 費用拖累 NT$ 139,637；風報比 3.00R；DCF 每股價值約 NT$ 164；4% 提領模擬期末剩餘 NT$ 9,745,013；蒙地卡羅跌破半數本金機率 0.00%。

## 正式站部署驗證
- 推送後 GitHub Pages 已回應新版 HTML：`curl` 對根網址與 `index.html` 的快取破除查詢均找到新版標記 `GUGOPRO / FINANCIAL EDUCATION SYSTEM`、`knowledge-tree` 與 `12 類金融商品`。
- 正式站的 `style.css` 已包含新版知識樹 CSS，`app.js` 已包含 `initKnowledgeTree`，正式工具頁已包含 `BROWSER-ONLY / ZERO SERVER CALCULATION`。
- 以 `https://academy.gugopro.com/?v=e49da3e` 開啟時，瀏覽器可讀到新版首頁內容與全部 12 個分類連結。一般無查詢網址在測試瀏覽器仍可能命中舊的語言跳轉快取，屬瀏覽器/CDN 快取表現；版本查詢網址已確認新版已上線。

## 第二次部署與快取修正
- 第二次提交 `ce935cc` 已推送至 `main`，本地狀態為 `main...origin/main`。
- GitHub Pages 建置完成後，正式首頁已回傳 `/style.css?v=20260824` 與 `/app.js?v=20260824`；工具頁已回傳 `/style.css?v=20260824`、`/app.js?v=20260824` 與 `advanced-tools.js?v=20260824`。
- 這次修正用版本化資源 URL 解決了正式瀏覽器曾命中舊 CSS／JS 快取的問題。

## 正式站視覺與 DOM 驗證
- URL: https://academy.gugopro.com/?v=ce935cc
- 正式站瀏覽器主控台讀取到 `hero-grid` 為 CSS Grid，桌面欄位約 `548px 467px`；`knowledge-grid` 為四欄約 `278px`；DOM 中有 12 張知識樹卡與 5 個篩選按鈕。
- `window.changeLanguage` 為可用函式，表示共享腳本已載入；首頁新版 CSS 與互動邏輯已生效。

## 全站 CTA 正式驗證
- 第三次提交 `6e98bd1` 已推送至 `main`。
- `https://academy.gugopro.com/stocks/index.html` 在 GitHub Pages 建置完成後，正式 HTML 已出現 `data-tradingview-cta` 與 `/style.css?v=20260824`；輪詢第三次成功，表示既有文章頁的合作區塊已公開。

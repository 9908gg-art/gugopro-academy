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

## 2026-08-24 全面深度修正基線

目前 `guides/*.html` 的實際正文文字量約 472–610 字，僅有三個短段落／表格，未達本次要求的 1,200 字以上，也缺少清楚的核心概念與實戰段落。現有風報比內容主要位於 `fundamentals/risk-management.html` 與舊版工具頁，尚未有 `guides/risk-reward-ratio.html` 的獨立專題。倉庫目前已有 `privacy-policy.html` 與 `terms-of-service.html`，但本次需求指定的 `privacy.html`、`terms.html` 與 `about.html` 尚不存在。

本次擴充將參考 SEC Investor.gov 對 ETF 結構、NAV、折溢價、費用、流動性與風險的教育說明，以及 SEC 對投資產品與風險適配的基本原則。[SEC ETF guide](https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2) [SEC ETF bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24) [SEC investment options](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/learn-about-investment-options)

選擇權內容將參考 FINRA 的 Options 投資人教育頁，涵蓋類型、買賣、到期、保證金與 pin risk 等議題；衍生品頁面會保持教育性質，不把高槓桿描述成低風險收益。研究來源：[FINRA Options](https://www.finra.org/investors/investing/investment-products/options)。

## 深度修正研究來源

SEC Investor.gov 說明 ETF 是在交易所買賣的投資產品，可能投資股票、債券或其他資產；ETF 的市價可能高於或低於 NAV，投資人也需把費用、買賣價差、流動性與過往績效限制納入判斷。[SEC ETF guide](https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2) [SEC ETF bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24)

SEC Investor.gov 將殖利率曲線定義為不同到期年限債務殖利率的相對關係圖，投資人與分析者可用其評估債券市場與利率預期，但本文會避免把曲線倒掛寫成精準的市場擇時訊號。[SEC yield curve glossary](https://www.investor.gov/introduction-investing/investing-basics/glossary/yield-curve)

FINRA Options 教育頁提供選擇權類型、買賣、風險與關鍵術語的官方投資人入口；內容將用於買方／賣方、保證金、到期與流動性段落的風險框架。[FINRA Options](https://www.finra.org/investors/investing/investment-products/options)

Google AdSense 官方說明要求隱私權政策揭露第三方供應商（包括 Google）可能使用 Cookie、廣告個人化與退出方式；若服務歐洲經濟區、英國或瑞士使用者，還需依 Google 使用者同意政策處理 Cookie、local storage 與個資同意流程。[AdSense required content](https://support.google.com/adsense/answer/1348695?hl=en) [AdSense cookies](https://support.google.com/adsense/answer/7549925?hl=en) [Google consent management](https://support.google.com/adsense/answer/7670013?hl=en)

## R:R 深度修正本地驗證

新版 `tools/risk-reward-calculator.html` 已採用緊湊 Header 與雙欄計算工作台；在預設進場 100、停損 95、目標 115、資金 500,000、單筆風險 1% 下，瀏覽器即時輸出風報比 3R、建議單位數 1,000、最大價格損失約 5,000、目標潛在獲利約 15,000。將目標價改為 90 後，工具正確顯示「價格方向不一致」，再恢復 115 後回到有效結果。

## 深度指南瀏覽器驗證

本地 `guides/risk-reward-ratio.html` 已正確渲染緊湊 Header、12+1 主題側欄與深度正文。DOM 統計為 6 個主要章節、3 列四欄風險比較表、14 個側欄連結（含工具工作台）、1 個 TradingView 合作 CTA、1 個獨立 R:R 工具連結，以及各 1 個 privacy、terms、about Footer 連結。

## AdSense 合規頁本地驗證

`privacy.html` 已以新版緊湊 Header 與合法閱讀卡片渲染。DOM 有 6 個主要政策段落；Cookie、Google AdSense、localStorage、第三方分析四項關鍵揭露均存在；官方 AdSense 來源連結 3 個；Footer 顯示隱私權政策、服務條款與免責、關於我們三個合規入口。

## 正式站 61731ad 最終驗證

GitHub Pages 已同步 commit `61731ad` 的版本化資源。正式站獨立 R:R 工具已渲染新版雙欄工作台、3R 預設結果、TradingView CTA 與三個 Footer 合規連結；首頁已出現 R:R 工具卡與 R:R 閱讀室卡，TradingView CTA 計數 2，Footer 的 privacy、terms、about 各 1 個。首頁 `.site-header` 實際高度約 62px，`.tool-feature-grid` 已為 grid；Hero 標題字級約 69px，未再使用舊版過大的遮擋式 Header。

正式站第一次讀到新 HTML 時仍套用舊 CSS，已透過第二個提交將 48 個頁面的 CSS／JavaScript query string 升級至 f4b3de7，並確認正式 CSS 含 `.rr-hero`、`.rr-tool-shell`、非 sticky 文章 Header 與 `.legal-card`；重新整理後正式 R:R 截圖已恢復卡片化排版。

## 正式站最終 R:R 專題驗證（a15f29e）

正式站 `guides/risk-reward-ratio.html?v=a15f29e` 已完成最終檢查：6 個主要章節、3 列四欄比較表、14 個側欄連結、1 個獨立 R:R 工具連結、1 個 TradingView CTA，以及 Footer privacy、terms、about 各 1 個。`.site-header` 高度約 62px，文章內層 `.guide-hero` 的 position 為 relative、top 為 0px，確認不再以 sticky Header 遮擋文章內容。

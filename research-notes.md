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

## 工具升級本地驗證

新版 `tools/risk-reward-calculator.html` 已渲染搜尋商品／代號、週期、K 線容器、進場／停損／目標三條可拖曳標註、獲利／虧損區間與最近支撐／壓力面板。瀏覽器測試顯示 Binance 公開 K 線端點可直接回應；Yahoo Finance 端點在本地瀏覽器受 CORS 限制時，頁面正確顯示「已切換 TradingView」，TradingView iframe 最終載入 AAPL K 線與圖表工具列，三條價格標註仍覆蓋在圖表上。

## ETF 現金流工具本地驗證

`tools/etf-dividend-calculator.html` 已渲染主流 ETF 選單、單筆投入、每月投入、年化配息率、價格成長、年數與 DRIP 切換。預設 0050 情境可產生 NT$9,600 第一年度配息、期末再投入／領出現金資產與 SVG 曲線。瀏覽器將標的切換為 00919 後，配息率即時更新為 8.5%；關閉 DRIP 後狀態改為領出現金，兩條 SVG path 均有更新資料。

## 網格交易工具本地驗證

`tools/grid-trading-calculator.html` 已渲染上下限、網格數、等差／等比模式、資金、波動率與模擬天數。預設等差 10 格、80–120 區間、90 天、35% 波動率產生 3 回合、NT$2,400 模擬套利毛利與 6.11% 最大回撤。切換等比模式並提高波動率至 80% 後，結果更新為 4.14% 比例間距、17 回合、NT$14,069 毛利、16.76% 最大回撤，SVG 價格路徑也重新產生。

## R:R 加密標的回歸驗證

重新載入競態修正後的 R:R 工具並切換 `BTCUSDT`，瀏覽器端成功取得 Binance Public API 的 180 根日線 K 線；頁面狀態正確更新為 `BTCUSDT / Bitcoin / Tether`，最近支撐約 62,535、最近壓力約 79,500、ATR 波動約 2.44%，Lightweight Charts canvas 與 3 個可拖曳價格標註均保持可見。此測試也確認慢速初始 AAPL 請求不會覆蓋後續 BTCUSDT 狀態。

## 正式站首頁部署驗證

GitHub Pages 設定確認 custom domain `academy.gugopro.com` 使用 `main` 根目錄；提交 `252fdf6` 對應的 Pages workflow 已完成且為 success。正式首頁在建置完成後重新開啟，已顯示 05 風報比即時 K 線分析儀、06 ETF 配息與 DRIP 試算、07 動態網格交易模擬器三張工具卡，並同步顯示 TradingView、Ko-fi、Amazon 與隱私／條款／關於我們 Footer 導覽。

## 正式工具頁驗證

正式 `tools/risk-reward-calculator.html?v=252fdf6` 已部署。公開 Yahoo 端點在瀏覽器受 CORS 限制時狀態顯示切換 TradingView，TradingView iframe 實際呈現 AAPL K 線工具列與圖表；R:R 預設 3R、5,000 風險預算、1,000 單位與三條彩色價格標註皆可見。正式 `tools/etf-dividend-calculator.html?v=252fdf6` 已公開並產生 0050 預設情境的配息、DRIP／領出現金資產比較與 SVG 曲線；頁底 TradingView、Amazon、Ko-fi 與三個政策頁連結均存在。

正式 `tools/grid-trading-calculator.html?v=252fdf6` 已部署。預設等差情境產生 4% 間距、3 回合、NT$2,400 毛利、-1.12% 模擬報酬與 6.11% 最大回撤；切換等比與 80% 波動率後即時更新為 4.14% 比例間距、17 回合、NT$14,069 毛利、16.76% 最大回撤，SVG 路徑存在且頁底合作／政策連結完整。

## 最終提交部署

文件同步提交 `aed398d` 已推送至 GitHub main；GitHub Pages workflow 對應 aed398d 完成 success。正式首頁以 `?v=aed398d-ready` 載入，已確認 05 風報比即時 K 線分析儀、06 ETF 配息與 DRIP 試算、07 動態網格交易模擬器三張工具卡，以及 TradingView／Ko-fi／Amazon／政策 Footer 全部公開。正式站最後輪詢的首頁資源為 `style.css?v=tools-upgrade-20260824`。

## R:R 與 BTC 網格重構驗證

Git 歷史顯示 `45a2957`／`d7fe005` 使用 Canvas 與手動滑桿，後續 `252fdf6` 將 K 線容器、`#rr-chart-zones`、`#rr-chart-labels` 與 TradingView iframe fallback 分離；目前問題根因是價格標註以 chart 外的 absolute 百分比層重繪，未使用 Lightweight Charts 的原生 `priceToCoordinate`／`coordinateToPrice`，並且舊版拖曳路徑可能把畫布座標直接當價格。

新版 R:R 已移除 `#rr-chart-labels`／`#rr-chart-zones`，改用 Lightweight Charts 原生 `createPriceLine`。本地 BTCUSDT 成功取得 Binance 500 根日線；以 pointer 事件將進場線向上拖 36px，價格由 77,406.72 增加至 85,205.97（+7,799.25）；向下拖 30px 後降至 78,706.59（−6,499.38），兩次均為 finite 且無超過 1e12 的溢位。

新版網格工作台預設 BTC/USDT，成功取得 Binance 1,000 根 15 分鐘 K 線，圖表顯示 BTC K 線、綠色買入網格、紅色賣出網格、黃色止損與紫色止盈原生價格線。將 20 格等比改為 30 格等差並設定 70,000–85,000 區間後，原生價格線數量由 23 增至 33；每格間距 0.65%、扣雙邊 0.1% 手續費後淨利潤率 0.45%、資金利用率 23.06%、破網距最近邊界 9.53%、回撤 0.74%，所有輸出為有限數值。

## 原生 R:R／BTC 網格正式站驗證

提交 `cd0309b` 的 GitHub Pages workflow 已完成 success。正式 R:R 頁以 `?v=cd0309b` 載入 BTCUSDT，成功顯示 Binance Public API 500 根 K 線、支撐 76,051、壓力 78,080、ATR 約 2.9%，原生 Lightweight Charts 圖表與 3 條價格線均可見；週期選單包含 1m、5m、15m、1h、1d。正式網格頁成功顯示 BTC/USDT、Binance 1,000 根 15m K 線、等比網格、綠色買入線、紅色賣出線、黃色止損線與紫色止盈線，並輸出單格淨利潤率、資金利用率、破網風險與回撤。

## 最後 cache-bust 版本正式 R:R

`https://academy.gugopro.com/tools/risk-reward-calculator.html?v=96ccdf9` 成功載入 `native-grid-20260824` 資產。瀏覽器顯示 Binance Public API 500 根 BTCUSDT K 線，原生 Lightweight Charts canvas 與進場／停損／目標價格線可見；最新價 77,311.51，支撐 76,051，壓力 78,080，ATR 約 2.9%。本次頁面結果為 R:R 2.00R、單位風險 2,319.35、建議單位數 2，均為有限數值。最終瀏覽器截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_07-57-19_6031.webp`。

## 最後 cache-bust 版本正式 BTC 網格

`https://academy.gugopro.com/tools/grid-trading-calculator.html?v=96ccdf9` 成功載入 `native-grid-20260824` 資產。瀏覽器顯示 Binance Public API 1,000 根 BTCUSDT K 線（15m），綠／紅網格、黃色止損與紫色止盈原生價格線均可見；最新價 77,293.06，單格扣雙邊 0.1% 手續費後淨利潤率 0.81%，單格套利金額 4.04 USDT，資金利用率 24.92%，破網風險距最近邊界 10%，模擬回撤 0.88%。歷史路徑曾觸及止損，故實現套利淨利為 -56.84 USDT；這是教育回放結果，不是座標溢位。最終瀏覽器截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_07-57-54_2631.webp`。

## b5f1539 最終 R:R 重新載入

最後文件提交後，正式 R:R 首次載入遇到一次 Binance 連線逾時並正確切換 TradingView fallback；重新按下「載入 K 線」後即成功恢復 Binance Public API 500 根 K 線與原生價格線。最新價 77,339.03，支撐 76,051，壓力 78,080，ATR 約 2.9%，R:R 2.00R，單位風險 2,320.17，建議單位數 2，均為有限數值。重新載入成功畫面：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_08-00-38_5814.webp`。


## 本輪 Scanner、指南與 Y 軸回歸（2026-08-24）

新增指南使用 SEC Investor.gov、Invesco、Binance 與 OKX 官方教育／產品文件作為概念依據；重點包含基金分配不等於額外報酬、DRIP 是現金流處理方式、等差／等比網格定義、雙邊手續費、區間突破與庫存風險。來源 URL 詳見 `research-notes-next.md` 與兩篇指南的 References。

本地真實瀏覽器在 `tools/risk-reward-calculator.html?v=native-grid-scanner-20260824` 初始載入 Binance 500 根 BTCUSDT 日線，Entry 77,224.01、Swing Low／Stop 57,800.19、Swing High／Target 82,850、ATR 2.9%，原生 Lightweight Charts canvas 可見且無非法座標。切換加密貨幣 Scanner 後完成 6/16 個監控池標的，DOGEUSDT、XRPUSDT、BNBUSDT、BTCUSDT、SOLUSDT、ETHUSDT 均呈現有限的現價、波段低／高點、風險距離、R:R 與狀態；點擊 BTCUSDT 結果可帶回上方原生圖表。截圖分別為 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-12-12_2010.webp`、`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-12-52_3143.webp`、`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-13-15_9385.webp`。

本地 BTC 網格載入 Binance 1000 根 15m K 線；初始情境顯示 1.01% 比例間距、0.81% 費後單格利潤率、4.04 USDT 單格套利、24.89% 利用率、10% 邊界距離、0.8% 回撤與 9,944.10 USDT 期末模擬資產。將網格數改為 60 後完成 101 次回合，狀態文字仍明確說明右側 Y 軸僅顯示上下限、最新價與 SL／TP，中間網格維持虛線，不再把每條線的 axis label 塞滿。截圖為 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-13-26_8111.webp` 與 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-13-42_7225.webp`。

`guides/grid-trading.html` 與 `guides/etf-dividend-drip.html` 均已由生成器建立並在瀏覽器載入；左側導覽顯示 12 + 3 主題，正文含概念、公式、實例、風險比較、檢查清單與外部來源，文末有 R:R、ETF 現金流、BTC 網格三個工具 CTA。ETF 指南 CTA 實測可到 `tools/etf-dividend-calculator.html`，工具頁正常輸出 DRIP／領現金差異並顯示回鏈。截圖為 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-15-12_2203.webp`、`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-15-28_7955.webp`、`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-15-57_1861.webp`。

以 `?symbol=ETHUSDT&timeframe=1h` 測試 R:R URL 直達，搜尋欄與 1 小時選單正確帶入；該次 Binance 公開端點逾時後安全切換 TradingView fallback，頁面保留數值欄位與限制提示，沒有顯示非法值。另已將舊 `tools/risk-reward-scanner.html` 改為導向新版 `risk-reward-calculator.html#rr-market-scanner`，避免舊全站連結落到過時 Scanner。


美股 Scanner 回歸：切換「美股」並啟動批次後，公開 Yahoo／CORS 請求在本次瀏覽器執行中出現逾時，頁面保持「正在批次讀取公開行情」並不把空資料混入結果；與原生圖表同步顯示 TradingView fallback，數值欄位仍可用。此結果驗證了失敗端點的安全排除與使用者提示；加密貨幣批次已在同一版本成功完成 6/16。截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_09-19-14_2656.webp`。


## 推送紀錄（2026-08-24）

本輪功能提交已推送至 GitHub `main`：`18258d8`。提交訊息為 `Manus AI: restore R:R market scanner, fix swing-high anchor and grid Y-axis clutter, add grid/dividend guides with bidirectional links`。推送後 `HEAD` 與 `origin/main` 均指向 `18258d8`，remote URL 維持無認證網址，暫存 askpass 與 PAT 環境已清除。


## a184b60 正式站部署回歸（2026-08-24）

公開 GitHub Actions 查詢確認 `pages build and deployment` run `32711161385`、head `a184b60` 已 `completed / success`；前一個 `18258d8` run 被 GitHub Pages 以新提交取代並標示 cancelled，最終文件提交 a184b60 已完成部署。

正式首頁 `https://academy.gugopro.com/?v=a184b60` 成功載入新版知識樹、12 個分類、三張高階工具卡與 Footer 導流。正式 R:R `https://academy.gugopro.com/tools/risk-reward-calculator.html?v=a184b60#rr-market-scanner` 成功載入 Binance Public API 500 根 BTCUSDT 日線、原生 canvas、Entry 77,298.02、Swing Low／Stop 57,800.19、Swing High／Target 82,850、ATR 2.9%，Scanner 控件與 `createPriceLine` 圖表可見。正式 R:R 截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-23-58_2896.webp` 與行情完成畫面 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-24-08_8146.webp`；首頁截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-23-42_3917.webp`。

正式 BTC 網格 `https://academy.gugopro.com/tools/grid-trading-calculator.html?v=a184b60` 已成功載入 Binance Public API 1000 根 15m K 線與原生 Lightweight Charts。最新價 77,282.20；每格比例 1.01%、費後單格利潤率 0.81%、單格套利 4.04 USDT、資金利用率 24.93%、距最近邊界 10%、回撤 0.86%、期末模擬資產 9,941.15 USDT；圖表可見綠買入／紅賣出網格、黃色 SL、紫色 TP，以及只顯示關鍵價位的右側 Y 軸。正式截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-24-48_1625.webp`。

正式 `https://academy.gugopro.com/guides/grid-trading.html?v=a184b60` 已完成部署回歸：頁面顯示 12 + 3 主題導覽、動態網格定義、等差／等比與費後單格利潤公式、實戰流程、風險比較表、Binance／OKX 來源與文末 R:R／ETF／BTC 網格工具 CTA。截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-25-22_9354.webp`。

正式 `https://academy.gugopro.com/guides/etf-dividend-drip.html?v=a184b60` 已完成部署回歸：頁面顯示 12 + 3 主題導覽、配息來源與除息、DRIP／總報酬公式、策略流程、風險比較表、SEC／Invesco 官方來源與文末三個工具 CTA；ETF 現金流工具回鏈可見。正式截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-25-58_4543.webp`。


## db1177b 最終正式 URL 核對（2026-08-24）

最終文件提交的 Pages workflow `32711616557` 已 `completed / success`。`https://academy.gugopro.com/?v=db1177b` 成功顯示 12 類知識樹、三張高階工具卡、TradingView／Ko-fi／Amazon 與政策 Footer；`https://academy.gugopro.com/tools/risk-reward-calculator.html?v=db1177b#rr-market-scanner` 成功回傳 R:R Scanner、1m／5m／15m／1h／1d 選單、Binance Public API 載入狀態與原生圖表介面。行情完成數值已在上一個 a184b60 正式回歸紀錄確認，db1177b 只新增文件內容，不改動功能檔。最新截圖：首頁 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-28-42_9471.webp`、R:R `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_09-29-04_8798.webp`。


## 最終 main 與 Pages 部署（2026-08-24）

最後文件與正式站核對提交為 `1794581`，Pages workflow `32711884118` 已完成 `completed / success`。最終核對 URL 使用 `?v=1794581`；功能提交 `18258d8` 保留使用者指定的完整 commit message，`1794581` 為文件與驗證紀錄同步提交。`HEAD`、`origin/main` 與 `origin/HEAD` 均指向 1794581，工作樹乾淨。

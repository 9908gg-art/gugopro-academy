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


## HUD 即時行情設計研究（2026-08-24）

本輪前端即時行情採 Binance 官方公開市場資料：官方 Spot WebSocket 文件列出單一 symbol ticker stream `<symbol>@ticker` 的 close price 欄位 `c`、價格變化百分比 `P` 與 1 秒更新；Kline stream `<symbol>@kline_<interval>` 支援 1m、5m、15m、1h、4h、1d、1w 等週期，非 1s 週期通常約 2 秒更新。官方也說明連線會由伺服器發送 ping，客戶端需及時 pong；連線有訊息頻率、stream 數量與週期性斷線限制，因此前端需實作斷線重連、頁面隱藏時清理或降載，以及明確顯示連線狀態。[Binance Spot WebSocket Streams](https://developers.binance.com/en/docs/products/spot/testnet/web-socket-streams)

本輪歷史 K 線仍使用 Binance Spot REST `/api/v3/klines`，以 `limit`、`endTime` 向左分頁載入，避免把 1,000 根視為長期歷史的上限；Lightweight Charts 的 timeScale scroll position 用於觸發較早資料追加。1W 長週期使用官方支援的 `1w` Kline interval；R:R 的股票／ETF 仍保留 Yahoo／fallback 限制，WebSocket 即時跳動只對 Binance 加密資產啟用。


## 本地 R:R HUD 回歸（2026-08-24）

本地 `risk-reward-calculator.html?v=hud-websocket-20260824` 顯示頂部 HUD：商品搜尋、現價／Entry／Stop／Target／R:R 膠囊、1m／5m／15m／1h／4h／1D／1W 快速週期、風險百分比、帳戶資金、建議部位與重置。Binance BTCUSDT 初始載入 2,000 根 K 線，圖表向左歷史邊界測試後狀態更新為已載入 3,000 根；原生 Lightweight Charts canvas 可見。測試數值為現價約 78,357.52、Entry 78,357.52、Swing Low／Stop 57,800.19、Swing High／Target 82,850、ATR 約 2.93%，均為有限值；R:R HUD 會同步更新。瀏覽器頁面顯示本次環境的 WebSocket 狀態仍為未連線，需在網格頁與 console 進一步確認是否為公開 WSS 網路限制或連線重試狀態。截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_12-23-14_3433.webp`。

一次性 browser console WebSocket 探針在本地 R:R 頁成功：`status=open`、`symbol=BTCUSDT`、取得價格約 `78,355.53`。因此先前 HUD 顯示未連線屬於頁面連線重試時序／狀態刷新問題，公開 WSS 本身可達；正式回歸需再等頁面事件或重新載入確認 HUD 狀態文字。

本地 R:R 1W 切換測試完成：快速按鈕可切換並載入約 472 根 BTCUSDT 週線，Swing Low／Stop 約 49,000、Swing High／Target 約 126,199.63、ATR 約 7.61%，均為有限值；圖表原生 canvas 與 HUD 控制無水平溢出。該次公開 REST 歷史追加顯示稍後重試，仍保留已載入週線與可用計畫。


## 本地網格 HUD 回歸（2026-08-24）

本地 `grid-trading-calculator.html?v=hud-websocket-20260824` 成功顯示 Binance／Pionex 現貨網格定位、Upper／Lower／Grids／模式／投資額與 SL／TP／費率緊湊控制列。BTCUSDT 初始載入 2,000 根後狀態更新為 3,000 根；等待後 WebSocket 狀態變為 `WebSocket 已連線 · ticker`，最新價約 78,408、24h 變化約 +1.68%，並即時變動。原生圖表顯示綠色買入、紅色賣出、黃色 SL、紫色 TP，右軸只有 LOWER／UPPER／LATEST／SL／TP；15m 教育情境輸出每格約 1.01%、費後 0.81%、單格 4.04 USDT、利用率約 19.81%、回撤約 0.8%，均無 NaN／Infinity／數億溢位。截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_12-25-11_1026.webp`。

本地網格 4h 切換測試完成：週期選單可載入 3,000 根 K 線，模擬狀態更新為 `BTC/USDT 4h · 3,000 根 K 線`，歷史路徑曾觸及止損與止盈，完成 176 次網格回合；利用率約 89.08%、模擬回撤約 26.27%、期末資產約 9,497.51 USDT，均為教育回放數字，圖表與右軸關鍵標籤維持正常。


## 手機寬度 HUD 回歸（2026-08-24）

以一次性同源 iframe 在 375px 寬度測試兩頁：R:R `viewport=367, scrollWidth=367, overflow=false`，HUD 寬 339、圖表框 313、週期群 315；BTC 網格 `viewport=367, scrollWidth=367, overflow=false`，HUD 寬 335、圖表框 335、控制列 311。兩頁在手機版 CSS 折行後沒有水平溢出。


## 正式站 578876f R:R HUD 回歸（2026-08-24）

Pages workflow `32727416900` 已 `completed / success`。正式 `https://academy.gugopro.com/tools/risk-reward-calculator.html?v=578876f` 成功顯示頂部 HUD、1m／5m／15m／1h／4h／1D／1W、原生 canvas 與 `rr-load-older`。Binance BTCUSDT 初始 2,000 根後顯示已載入 3,000 根；WebSocket 狀態為 `Binance WebSocket 已連線 · ticker`，現價約 78,598。Swing Low／Stop 57,800.19、Swing High／Target 82,850、ATR 約 2.93%，均有限。正式截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_12-31-53_4770.webp`。

正式 `https://academy.gugopro.com/tools/grid-trading-calculator.html?v=578876f` 已回傳新版 Binance／Pionex HUD、1W 選項、`grid-load-older`、右軸清爽說明與指南 CTA。首次正式瀏覽在 Binance REST 載入期間顯示 `載入 Binance BTC/USDT · 15m…`，需以頁面更新按鈕重試以取得最終 K 線／ticker 畫面。


## 正式站 578876f 網格 HUD 回歸（2026-08-24）

正式網格頁首次等待時 Binance REST 載入較慢；點擊「更新行情」後成功恢復原生圖表。正式頁顯示 BTC/USDT 約 78,444、24h +1.77%、`Binance BTC/USDT · 15m`、已載入 3,000 根歷史；更新後 15m 教育情境為每格 1.01%、費後 0.81%、單格 4.04 USDT、利用率 24.63%、距最近邊界 9.73%、回撤 0.67%、期末模擬資產約 9,972.98 USDT，完成 25 次網格回合。圖表可見原生綠／紅網格與 SL，右軸標示 LOWER／UPPER／LATEST／SL／TP；HUD、4h／1D／1W 選單、載入更早歷史與指南 CTA 均在正式版本存在。此次正式頁 WebSocket 狀態在更新瞬間仍顯示未連線，與本地及正式 R:R 已成功連線的結果一致於公開 WSS 可能需要頁面等待／重試；REST 原生圖表與即時 ticker 顯示均可恢復。正式截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_12-33-20_3251.webp`。

正式網格頁再等待後成功顯示 `WebSocket 已連線 · ticker`；最新價約 78,525.99（畫面後續約 78,519.99）與 24h 約 +1.88%。已載入 3,000 根 15m K 線，費後單格約 0.81%、單格 4.04 USDT、利用率約 19.9%、回撤約 0.75%、期末模擬資產約 9,959.36 USDT；原生網格與 LOWER／UPPER／LATEST／SL／TP 軸標籤可見。最終正式截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_12-34-06_8061.webp`。


## 最終文件同步狀態（2026-08-24）

功能提交 `578876f` 的 Pages workflow `32727416900` 與文件同步提交 `1b25eed` 的 Pages workflow `32728003776` 均為 `completed / success`。最終報告將以 `1b25eed` 作為文件同步提交；工具功能仍以 `?v=578876f` cache-bust 版本核對，報告與正式站狀態一致。

最終 main metadata 提交 `123a4c2` 的 GitHub Pages workflow `32728200852` 已 `completed / success`；目前 `origin/main` 與本地 HEAD 均應以該版本為準，前一個文件同步提交為 `1b25eed`。


## 最終 main 26471cd 公開站核對（2026-08-24）

最終 Pages workflow `32728517831` 已 `completed / success`。`https://academy.gugopro.com/?v=26471cd` 正常回傳首頁、12 類知識樹與三張實戰工具卡；`https://academy.gugopro.com/tools/risk-reward-calculator.html?v=26471cd` 正常回傳 HUD、1m／5m／15m／1h／4h／1D／1W 按鈕、`rr-load-older`、Scanner 與 CTA。最終首頁截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_12-44-05_6952.webp`；最終 R:R 載入畫面：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_12-44-25_8135.webp`。


## UI 終極優化本地 R:R 回歸（2026-08-24）

本地 `?v=ui-compact-hud-20260824` 首屏已移除 `LIVE MARKET MAP / LIGHTWEIGHT CHARTS` 與 `BTCUSDT Bitcoin / Tether` 可見標題區；圖表前只保留隱藏語意 h2 與 K 線容器。頂部 HUD 新增原生 `#rr-quick-symbol`，可見 BTCUSDT、ETHUSDT、SOLUSDT、AAPL、NVDA、TSLA、SPY、0050.TW、00919.TW、2330.TW。選擇 ETHUSDT 後搜尋欄同步為 ETHUSDT，公開 Binance K 線成功載入，Swing Low 57,800.19、Swing High 82,850，HUD R:R 顯示 0.16R；Entry／Stop／Target 與 1m–1W 快速週期均清楚可見。更新後圖表直接位於 HUD 下方，無額外市場標題卡造成的垂直空白。正式截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-11-41_9105.webp`。

## UI 終極優化本地網格回歸（2026-08-24）

本地 `?v=ui-compact-hud-20260824` 網格頁已移除 `LIVE MARKET / BTCUSDT` 與大型圖表前標題；HUD 下方直接接 K 線容器，僅保留 3px 級距。`#grid-quick-symbol` 位於 HUD 左側，設定標籤／數值清楚呈現 Lower、Upper、Grids、模式、投資 USDT、SL、TP、單邊費率。BTC/USDT 成功載入 2,000 根後擴充至 3,000 根、WebSocket ticker 已連線，圖表網格線動態渲染；實測 Lower 71,395.21、Upper 87,260.81、每格間距 1.01%、費後單格利潤率 0.81%、資金利用率 19.85%、模擬回撤 0.7%，右軸僅顯示 LOWER／UPPER／LATEST／SL／TP。正式截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-12-18_6155.webp`。

## UI 終極優化 375px 行動版初測（2026-08-24）

同源 375px iframe 初測：網格頁 `bodyClientWidth=367`、`bodyScrollWidth=367`、`overflow=false`；R:R 頁 `bodyClientWidth=367`、`bodyScrollWidth=531`、`overflow=true`。兩頁 quick selector／chart 均存在，舊 `LIVE MARKET MAP / LIGHTWEIGHT CHARTS` 與 `LIVE MARKET / BTCUSDT` 可見標題數量均為 0。R:R 橫向溢出待定位修正後重測。

## UI 終極優化行動版修正與股票切換（2026-08-24）

修正 `.rr-hud-status-row > span` 的 flex `min-width:0` 後，375px 同源 iframe 重測：R:R 與網格皆 `bodyScrollWidth=367`、`rootScrollWidth=367`、`overflow=false`；兩頁 quick selector／chart 均存在，舊圖表大標題可見數量均為 0。網格現場再選擇 AAPL，HUD 商品摘要更新為 AAPL、搜尋／載入狀態更新為 AAPL · Apple，頁面無腳本崩潰；公開股票端點將依瀏覽器 CORS／休市條件顯示資料或 fallback，符合純前端限制。

本地 R:R 選擇 AAPL 回歸：`#rr-quick-symbol` 與商品搜尋同步為 AAPL，狀態更新為「載入 AAPL · Yahoo Finance」，既有 HUD／R:R 欄位保持可用且頁面無崩潰。Yahoo 端點若受 CORS、休市或延遲影響，工具會保留前端 HUD 並依既有 fallback／提示處理，不引入伺服器或 API key。

## UI 終極優化桌面 CSS 計算值（2026-08-24）

本地 Chromium 桌面視窗 `innerWidth=1280` 計算值：R:R quick select 16px／600，設定標籤 14.08px／600，Entry 輸入值 17.92px／700，R:R 核心數字 28px／700；網格 quick select 16px／600，Upper／Lower 標籤 14.08px／600，輸入值 16px／700，最新價 19.84px／700。兩頁可見舊圖表標題數量均為 0；桌面截圖已顯示 HUD 與圖表無裝飾性大標題。

## 本輪部署輪詢初始狀態（2026-08-24）

提交 `113bb35` 已成功推送至 `origin/main`。GitHub 公開 Actions 頁目前顯示最新 `pages build and deployment` Run 78（workflow ID `32732000522`）仍為 `In progress`；上一個 Run 77 為 completed successfully。API 端點當下回應 403，改以公開 Actions 頁面核對，未把任何 token 寫入 remote URL 或報告。

## 113bb35 正式站 R:R 驗證（2026-08-24）

正式 `https://academy.gugopro.com/tools/risk-reward-calculator.html?v=113bb35` 已回傳本輪 HTML。瀏覽器可見 `#rr-quick-symbol` 與完整熱門清單、Entry／Stop／Target、1m／5m／15m／1h／4h／1D／1W、R:R、風險與資金控制；Markdown 與畫面均未出現已移除的 `LIVE MARKET MAP / LIGHTWEIGHT CHARTS` 或大型 `BTCUSDT Bitcoin / Tether` 圖表前標題。正式 R:R 截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-20-56_1406.webp`。

## 113bb35 正式站網格驗證（2026-08-24）

正式 `https://academy.gugopro.com/tools/grid-trading-calculator.html?v=113bb35` 已公開本輪 HTML／CSS／JS。瀏覽器可見 `#grid-quick-symbol` 完整熱門清單、Lower／Upper／Grids／模式／投資／SL／TP／費率控制；BTC/USDT 成功載入 2,000 根後擴充至 3,000 根歷史，WebSocket 顯示已連線，並輸出每格 1.01%、費後單格 0.81%、利用率 19.85%、回撤 0.73% 等有限數值。K 線前沒有 `LIVE MARKET / BTCUSDT` 或重複大型標題，右軸只保留 LOWER／UPPER／LATEST／SL／TP。正式網格截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-21-24_9912.webp`。

## 最終文件部署完成（2026-08-24）

文件同步提交 `f828663` 已推送至 `origin/main`；GitHub 公開 Actions 顯示 pages-build-deployment Run 79（workflow ID `32732268383`）已 `completed successfully`。因此正式站最終版本以 `f828663` 為基準；功能實作提交仍為使用者指定訊息的 `113bb35`。

## 最後文件提交部署輪詢（2026-08-24）

最後研究筆記提交 `c1a04d5` 已推送，GitHub Actions Run 80（workflow ID `32732387019`）目前仍 `In progress`；前一個 Run 79（`32732268383`，對應 f828663）已成功。由於 c1a04d5 僅新增部署紀錄、不改變工具功能，正式功能頁已由成功的 Run 79 驗證；待 Run 80 完成後再作最終狀態確認。

## 最終 main／Pages 狀態（2026-08-24）

最終 `main` HEAD 為 `c1a04d5`，其中包含功能提交 `113bb35` 與完整交付文件。GitHub Actions `pages-build-deployment` Run 80（workflow ID `32732387019`）已顯示 `completed successfully`；Run 79 與 Run 78 亦均成功。正式站以 `?v=c1a04d5` 或頁面正常網址載入時，功能資源與本輪 CSS／HTML／JS 均已由成功 Pages pipeline 發布。

## 本輪 UI 細節修正：本地 R:R 實測

在 `http://127.0.0.1:4173/tools/risk-reward-calculator.html?v=ui-detail-fix-20260824` 以瀏覽器實測：商品輸入框 `#rr-symbol-search` 實際 `width=180px`、`max-width=180px`、`padding-left=36px`、`font-size=16px`；載入按鈕寬度 62px。R:R quick select 實際背景 `rgb(26,31,44)`、文字白色、`color-scheme=dark`；第一個 option 實際白字且深色背景；Scanner select 同樣為深色高對比。當前頁面不存在 `#grid-load-older` 殘留按鈕。

## 本輪 UI 細節修正：本地網格實測

在 `http://127.0.0.1:4173/tools/grid-trading-calculator.html?v=ui-detail-fix-20260824` 以瀏覽器實測：`#grid-quick-symbol` 實際寬度 180px、字體 16px、背景 `rgb(26,31,44)`、文字白色、`color-scheme=dark`；`#grid-timeframe` 寬度 104px、`#grid-mode` 寬度 100px，均為深色白字；quick selector option 實際白字且深色背景。`#grid-load-older` 不存在，頁面按鈕僅保留「繁中」與「更新行情」，未出現歷史冗餘按鈕。

## 本輪 UI 細節修正：本地網格互動實測

本地網格 quick selector 展開畫面確認選項以深色底、白字呈現，完整列出 BTCUSDT、ETHUSDT、SOLUSDT、AAPL、NVDA、TSLA、SPY、0050.TW、00919.TW、2330.TW。選擇 ETHUSDT 後，頁面顯示 ETH/USDT 最新價約 2,492.83、Binance Public API 2,000 根並已載入 3,000 根、WebSocket 已連線；網格統計與原生線圖同步更新。刪除歷史按鈕後，互動流程未出現錯誤。

## 本輪 UI 細節修正：375px 行動版回歸

以同源隱藏 iframe 載入兩頁 `ui-detail-fix-20260824`：R:R `bodyScrollWidth=367`、`documentScrollWidth=367`、`clientWidth=367`、`overflow=false`；R:R 商品輸入框在手機版自適應為 319px，仍保留 `padding-left=36px` 與 16px 字體。網格同樣 `bodyScrollWidth=367`、`documentScrollWidth=367`、`clientWidth=367`、`overflow=false`，quick selector 315px、週期 select 153.5px、16px 字體，按鈕文字僅「繁中」「更新行情」，`#grid-load-older` 不存在。R:R 自身仍保留其既有向左歷史操作按鈕，與本輪只移除網格無效按鈕的要求一致。


## 本輪細節修正：正式站與 Pages 部署

功能提交 `32db21e` 使用指定 commit message 推送至 `main`。GitHub Pages `pages-build-deployment` Run 82（workflow ID `32735220034`）已 `completed successfully`。

正式 R:R URL：`https://academy.gugopro.com/tools/risk-reward-calculator.html?v=ui-detail-fix-20260824`。頁面實測商品輸入框文字與放大鏡保持 36px 左距、桌面欄寬收斂，quick selector 與 Scanner 下拉為深色白字，BTCUSDT 已載入 3,000 根公開 K 線並顯示 Binance ticker；截圖 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-54-10_1226.webp`。

正式網格 URL：`https://academy.gugopro.com/tools/grid-trading-calculator.html?v=ui-detail-fix-20260824`。頁面實測 quick selector／週期／模式 select 深色白字；`#grid-load-older` 不存在，BTC/USDT 已載入 3,000 根歷史、WebSocket 已連線、費後單格利潤率約 0.81%；截圖 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-54-49_2401.webp`。

## Autocomplete upgrade — local R:R checkpoint

本地 `risk-reward-calculator.html?v=autocomplete-search-20260824` 已載入新版三大市場 optgroup。以 `BT` 觸發商品輸入事件，候選清單進入渲染流程；接續以瀏覽器視覺檢查與鍵盤回歸確認代號、全名、分類標籤及浮動定位。

### Local R:R autocomplete visual check

在本地 R:R 輸入 `BT` 後，浮動候選框顯示 `BTCUSDT`、`Bitcoin / Tether`、`加密貨幣` 與 `主流公鏈`；候選框位於搜尋列下方並疊在 HUD／圖表區前，不改變頁面流向。ArrowDown 操作已觸發候選 active 狀態，待以 Enter 完成載入回歸。

## Autocomplete upgrade — local Grid checkpoint

本地 `grid-trading-calculator.html?v=autocomplete-search-20260824` 已顯示新增 `商品／代號` 搜尋列、載入按鈕與 `grid-symbol-suggestions` 容器；快速商品選單已擴充為加密貨幣、台股／台股 ETF、美股與指數 ETF 三大 optgroup，HUD 控制列仍保持緊湊，未將圖表推出視野。

### Local Grid autocomplete visual check

在本地網格工具輸入 `NV` 後，浮動候選列顯示 `NVDA`、`NVIDIA`、`美股與指數 ETF` 與 `科技巨頭`；候選框位於商品搜尋列下方，未推擠週期、區間、網格數或投資額控制。分類 optgroup 與深色 HUD 仍正常呈現。

### Local Grid keyboard check

在網格工具輸入 `NV` 後，候選列可呈現 `NVDA / NVIDIA / 美股與指數 ETF / 科技巨頭`，ArrowDown 觸發第一項 active 狀態；同一畫面仍保有 BTC WebSocket、3,000 根歷史與網格統計，浮動清單未破壞 HUD 或圖表。

### Local Grid Enter selection

在 `NV` 候選 active 狀態按 Enter 後，網格搜尋框與 quick selector 均同步為 `NVDA`，HUD 也切換為 `NVDA · NVIDIA` 並進入公開行情載入流程。因 Yahoo 公開行情可能受 CORS、休市或延遲影響，本次以商品狀態切換與無腳本錯誤為主要回歸條件。

## Autocomplete upgrade — 375px RWD checkpoint

兩個工具的 `autocomplete-search-20260824` 版本已在同源 375px 隱藏 iframe 建立，並執行搜尋輸入、suggestions 容器、optgroup 數量與 body scrollWidth 量測腳本；後續再以更直接的頁面狀態讀取方式確認數值，避免 console 對 iframe 日誌的截斷。

### 375px RWD overflow finding

同源 iframe 量測結果：R:R `bodyScrollWidth=367`、`overflow=false`；網格 `bodyScrollWidth=677`、`overflow=true`。autocomplete 與三組 optgroup 均存在。需定位網格手機版超寬元素，優先檢查新增搜尋列、HUD market row、fallback iframe 與 chart shell。

### Grid 375px overflow diagnosis and fix

元素量測確認網格 `bodyScrollWidth=677` 的根因是新增四欄 `.grid-hud-market-row` 在 720px 以下仍保留 desktop min-width：`grid-hud-connection` 延伸到 677px。已在 autocomplete CSS 末端補上 `@media (max-width:720px)`，將 R:R／Grid market row 恢復為單欄 `grid-template-columns:1fr` 並 `align-items:stretch`。

### 375px RWD final pass

補上手機 media query 後重新量測結果：R:R 與網格 iframe 的 `bodyScrollWidth` 均為 `367px`（viewport 375px），兩頁皆 `overflow=false`；兩頁均有搜尋 input、suggestions 容器、3 組 optgroup 與 28 個 option。網格先前 677px 的橫向溢出已排除。

## Local R:R categorized quick selector

本地 R:R `autocomplete-search-20260824` 版本的 quick selector 已顯示 3 組市場 optgroup、28 個 option，以及商品／代號 autocomplete 輸入列；頁面仍可載入 BTC 公開 K 線並保留原生價格線與長歷史流程。

### Local R:R optgroup visual check

R:R 本地 quick selector 展開畫面確認原生 optgroup 標題以「加密貨幣 · Crypto Assets」「台股與台股 ETF · Taiwan Stocks & ETFs」「美股與指數 ETF · US Equities & Global ETFs」分層，候選文字在深色 HUD 上清晰可辨；畫面截圖：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-46-22_7658.webp`。

### Local R:R selector switch

在 R:R 原生 optgroup 快選中選取 `NVDA · NVIDIA` 後，搜尋輸入同步為 `NVDA`，頁面狀態切換至 `載入 NVDA · Yahoo Finance`，確認分類快選與既有商品載入入口已整合；股票／ETF 仍依公開 Yahoo 端點可用性顯示狀態。

### Local R:R Taiwan ETF autocomplete

在 R:R 搜尋框輸入 `00` 後，候選清單即時顯示 `0050.TW`、`0056.TW`、`00878.TW`、`00919.TW`、`00929.TW`，並保留名稱、台股與台股 ETF 市場標籤及人氣高股息／市值 ETF 細分類；同時可依名稱／代碼比對出 SPY 與 QQQ。操作畫面：`/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-48-05_3721.webp`。

## Autocomplete upgrade — Pages deployment checkpoint

最終功能提交 `8528a10` 已成功推送至 `main`，公開 GitHub Actions 顯示 Pages Run 84（workflow ID `32741183018`）正在進行；待完成後以 `autocomplete-search-20260824` cache-bust 核對正式站兩頁。

### Pages Run 84 continued polling

公開 Actions 在後續刷新仍顯示 Run 84（workflow ID `32741183018`）`In progress`；其餘最近 Runs 82／83 均 completed successfully。功能提交 `8528a10` 已推送且本地／origin HEAD 一致，待 Run 84 完成後再進行正式站 cache-bust 核對。

### Pages Run 84 extended polling

公開 Actions 在約四分鐘後刷新仍將 Run 84（workflow ID `32741183018`）標為 `In progress`。下一步開啟該 run 詳情頁確認實際 job 狀態；未將正式站 cache-bust 視為已完成部署。

## Autocomplete upgrade — Run 84 and official R:R

Run 84（workflow ID `32741183018`）詳情頁已顯示 `Status Success`，commit head 為 `8528a10`，build、report-build-status、deploy 三個 job 均完成；正式站 R:R `?v=autocomplete-search-20260824` 已回傳新版 quick selector、搜尋 input 與 28 項分類商品 DOM，待行情載入後進行正式 autocomplete 操作回歸。

### Official R:R autocomplete

正式站 `https://academy.gugopro.com/tools/risk-reward-calculator.html?v=autocomplete-search-20260824` 已核對 8528a10 的 autocomplete。輸入 `00` 即時顯示 0050.TW、0056.TW、00878.TW、00919.TW、00929.TW，以及名稱比對出的 SPY／QQQ；每列包含代號、全名、市場大分類與細分類。同期 BTC 公開行情顯示 3,000 根 K 線與 Binance ticker，操作截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_14-56-33_3657.webp`。

### Official Grid autocomplete

正式站 `https://academy.gugopro.com/tools/grid-trading-calculator.html?v=autocomplete-search-20260824` 已核對 8528a10。頁面顯示三大 optgroup 與 28 個商品、`商品／代號` autocomplete 搜尋列；BTC/USDT 公開資料載入 3,000 根 K 線、WebSocket 顯示已連線、網格輸出與稀疏右軸正常。正式桌面截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_14-57-10_2855.webp`。

## Final documentation Pages deployment checkpoint

公開 GitHub Actions 顯示文件同步提交 `7c57571` 已觸發 pages-build-deployment Run 85（workflow ID `32741997754`），目前為 `In progress`；功能提交 `8528a10` 對應 Run 84 已完成成功。正式站 autocomplete 功能已由 Run 84 驗證，待 Run 85 完成後再以最終 main 版本做一次狀態核對。

### Pages Run 85 extended polling

公開 Actions 列表在後續刷新仍將 Run 85（workflow ID `32741997754`）標為 `In progress`；其前一個功能 Run 84 已成功。下一步開啟 Run 85 詳情頁確認實際狀態與部署 job。

## Final main official R:R verification

Run 85（workflow ID `32741997754`）已顯示 `Status Success`，commit head `7c57571`，build、report-build-status、deploy 均完成。正式站 R:R `?v=autocomplete-search-20260824` 回傳最終 main 的 3 組 optgroup、28 個熱門商品、autocomplete 輸入與 BTC 3,000 根資料流程；最終畫面截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-02-24_8126.webp`。

## Final main official Grid initial verification

正式站網格 `?v=autocomplete-search-20260824` 已回傳最終 main `7c57571` 的 quick selector、商品搜尋欄與 28 項商品分類 DOM；目前頁面正在取得 BTC 公開歷史，下一步驗證 `NV` autocomplete 與候選 metadata。初始截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-02-48_6737.webp`。

## Final main official Grid autocomplete

最終 main `7c57571` 的正式站網格頁輸入 `NV` 後，即時浮出單筆 `NVDA · NVIDIA · 美股與指數 ETF · 科技巨頭` 候選，清單不推擠下方參數或圖表；同頁 BTC/USDT 顯示 3,000 根 K 線、WebSocket 已連線、單格利潤率 0.81% 與完整網格輸出。最終操作截圖：`/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-03-22_6111.webp`。

## Final main Pages deployment checkpoint

最終研究筆記提交 `448348c` 已觸發 Pages Run 86（workflow ID `32742573873`），公開列表目前顯示 `In progress`；文件提交 `7c57571` 對應 Run 85 已成功。下一步以 Run 86 詳情頁核對實際 job 狀態。


## Final Pages deployment completed

Run 86（workflow ID `32742573873`）詳情頁已顯示 `Status Success`，commit head 為 `448348c`；build 23s、report-build-status 5s、deploy 27s 均完成，公開部署網址為 `https://academy.gugopro.com/`。本次部署包含既有 autocomplete 功能與完整正式站驗證紀錄。


## 本輪 localStorage 持久化本地基線

本地 R:R：`http://127.0.0.1:4173/tools/risk-reward-calculator.html?v=watchlist-persistence-20260824`。初始 DOM 已出現 `rr-watchlist-add`「加入自訂」、`rr-watchlist-manage`「管理清單」與 `rr-watchlist-options` 動態自訂 optgroup，清單計數為 0；R:R 既有商品快選、Entry／Stop／Target、風險與資金欄位均正常渲染，待進行 localStorage 寫入／重整 hydration 測試。


## 本輪 R:R localStorage 初始畫面

本地 R:R `http://127.0.0.1:4173/tools/risk-reward-calculator.html?v=watchlist-persistence-20260824` 已載入 BTCUSDT 公開歷史與 Binance ticker；HUD 可見「加入自訂」／「管理清單 0」，`rr-watchlist-options` 已存在。於商品搜尋欄輸入 `XYZ` 後，Entry／Stop／Target／R:R 仍可正常更新，準備以此頁測試加入自訂與刷新 hydration。

## 本輪 Grid localStorage 初始畫面

本地 Grid：`http://127.0.0.1:4173/tools/grid-trading-calculator.html?v=watchlist-persistence-20260824`。由於與 R:R 同源，已讀到 `XYZ` 自訂項目，頂部顯示「管理清單 1」且快選內容包含 XYZ；Lower／Upper／Grids／模式／投資／SL／TP／費率欄位均可見。初始頁面仍以 BTCUSDT 公開行情載入，待修改全部參數並重整測試。

## 本輪 Grid 參數保存實測

本地 Grid 將週期設為 `1h`，Lower `65000`、Upper `90000`、Grids `31`、模式 `geometric`、投資 `25000`、SL `60000`、TP `98000`、單邊費率 `0.08`。主控台檢查 `gugopro_grid_state_v1` 顯示上述欄位均已寫入，`symbol` 為 `BTCUSDT`、`timeframe` 為 `1h`、`rangeTouched` 為 true；網格模擬輸出仍為有限數值。

## 本輪 Grid 重整 hydration 實測

重新開啟本地 Grid 後，DOM 值仍為 Lower `65000`、Upper `90000`、Grids `31`、模式 `geometric`、投資 `25000`、SL `60000`、TP `98000`、費率 `0.08`；`grid-timeframe` 為 `1h`、快選與搜尋為 `BTCUSDT`、管理清單計數為 `1`。這與 `gugopro_grid_state_v1` 保存 payload 完全一致，顯示網行情初始化未覆蓋已保存參數。

## 本輪 watchlist 管理面板實測

本地 Grid 管理面板可浮動開啟並列出 `IBIT`、`XYZ`，每筆均有「載入／刪除」按鈕與「清空自訂清單」按鈕；以面板刪除 `IBIT` 後計數回到 1，快選中的自訂 optgroup 同步移除該項目，圖表區沒有被面板推擠。

## 本輪 watchlist 清空實測

Grid 管理面板執行「清空自訂清單」後，面板顯示空狀態提示，`grid-watchlist-count` 回到 `0`，動態 `grid-watchlist-options` 不再有 option，且瀏覽器 localStorage 的共享清單為空；面板操作不會清除另一組 Grid 狀態參數。

## 本輪 Grid 375px RWD 實測

以同源隱藏 iframe 設定 viewport 375px 載入 Grid，`body.scrollWidth=367`、`documentElement.scrollWidth=367`，小於 viewport，`overflow=false`；加入自訂按鈕與 `grid-watchlist-options` 均存在，確認新增 watchlist 控制不造成手機橫向破版。

## 本輪 R:R 375px RWD 實測

以同源隱藏 iframe 設定 viewport 375px 載入 R:R，`body.scrollWidth=367`、`documentElement.scrollWidth=367`，`overflow=false`；加入自訂按鈕、`rr-watchlist-options` 與 Entry／Stop／Target／風險／資金五個欄位均存在。

## 本輪 R:R 手動狀態實測

本地 R:R 由保存的 XYZ 切換至 `ETHUSDT`，週期切為 `4h`，手動輸入 Entry `2600`、Stop `2400`、Target `3000`、風險 `2.5`、資金 `125000`；頁面輸出 `2.00R`、風險預算 `3125`、建議部位 `15`。主控台 payload 顯示 `entryPinnedToLive=false`，上述商品、週期與五個欄位均完整保存，表示 WebSocket 更新不會覆蓋手動 Entry。

## 本輪 R:R 重整 hydration 實測

重新開啟本地 R:R 後，DOM 與 localStorage 均顯示商品 `ETHUSDT`、週期 `4h`、Entry `2600`、Stop `2400`、Target `3000`、風險 `2.5`、資金 `125000`，計算結果 `2.00R`；已保存的 `entryPinnedToLive=false` 仍在，確認手動點位沒有被重新取得的波段最高／最低點覆蓋。

## 本輪 1280px 桌面 RWD 實測

以同源隱藏 iframe 設定 viewport 1280px 載入 Grid，`body/documentElement.scrollWidth=1272`、`overflow=false`；`.grid-hud-market-row` 實際五欄為 `180px 274.297px 220.25px 315.438px 168px`，watchlist wrapper 為 `position:relative`、manager panel 為 `position:absolute`，自訂 optgroup 存在且不推擠圖表。

## 本輪 GitHub Pages Run 88 部署進度

公開 GitHub Actions Run 88：`https://github.com/9908gg-art/gugopro-academy/actions/runs/32747280462`，commit head `35f942b`。目前 build 約 23 秒完成，report-build-status 約 13 秒，deploy job 仍顯示 `Deploying to github-pages`／整體 `In progress`；頁面標示 1 個 Node.js 20 deprecation warning，沒有 build failure。

Run 88 後續公開刷新仍為 `In progress`：build `23s`、report-build-status `38s`、deploy `37s`，deploy 卡片仍標示 `Deploying to github-pages`。commit head 仍是 `35f942b`，無 build failure；需等 GitHub Pages 完成後再做正式網址驗證。

Run 88 再次刷新後仍是 `In progress`；build `23s` 已成功，report-build-status 約 `1m27s`、deploy 約 `1m26s`，deploy 卡片仍顯示 `Deploying to github-pages`。這是 GitHub Pages 發布延遲而非建置錯誤，commit head 維持 `35f942b`。

## 正式站 R:R 部署版實測

正式 URL `https://academy.gugopro.com/tools/risk-reward-calculator.html?v=watchlist-persistence-20260824` 已載入 watchlist persistence 版本；頁面顯示「加入自訂／管理清單」、完整 R:R HUD 與 28 商品快選。輸入 `IBIT` 後按「加入自訂」，正式來源的管理計數由 0 變為 1，搜尋欄與自訂 optgroup 均同步更新；正式頁面仍能取得 BTCUSDT 公開 K 線與即時 ticker。

## 正式站 Grid 部署版實測

正式 URL `https://academy.gugopro.com/tools/grid-trading-calculator.html?v=watchlist-persistence-20260824` 已載入 watchlist persistence 版本；由 R:R 同源建立的 `IBIT` 出現在 Grid 的「⭐ 我的自訂清單」optgroup，管理計數為 1，證實共享清單可跨工具讀取。BTC/USDT 公開 K 線、WebSocket ticker、3,000 根歷史、動態網格線及右軸只顯示 LOWER／UPPER／LATEST／SL／TP 的規則均已生效，頁面輸出單格淨利、資金利用率、破網風險與模擬回撤。

## 本輪 Pages Run 88 成功

公開 Run 88 `https://github.com/9908gg-art/gugopro-academy/actions/runs/32747280462` 已完成 `Status Success`，commit head `35f942b`，總時長 41 秒；build 23 秒、report-build-status 6 秒、deploy 9 秒，正式入口為 `https://academy.gugopro.com/`。唯一 annotation 是 GitHub Actions 的 Node.js 20 deprecation warning，非本次程式錯誤。


## 全球商品與 TradingView 研究初步紀錄（2026-08-24）

TradingView 官方 Advanced Real-Time Chart 文件提供可嵌入網站的免費 widget，並連結官方 markets 清單與 widget integration 教學；本輪將以公開 iframe／widget 形式承載非 Binance 全球商品。Binance 官方 Spot WebSocket 文件頁已開啟但內容為動態載入；既有工具的 `api.binance.com/api/v3/klines` REST 與 `wss://stream.binance.com:9443/ws/<symbol>@ticker` 分流仍保留給 Binance Spot 加密貨幣。需要注意：TradingView iframe 與本站 DOM 為跨來源，不能直接在 iframe 內繪製本站 Lightweight Charts 原生價格線；因此非 Binance 路由應顯示 TradingView 圖表並讓 HUD 數值輸入／localStorage 繼續獨立運作，Binance 路由則保留可拖曳的原生價格線。


TradingView 官方 markets 頁說明 widgets 使用其列出的免費市場資料，並提供 North America、Europe、Middle East/Africa、Mexico/South America、Asia/Pacific、Worldwide 分區；官方 Advanced Chart 頁也提供 iframe 類型的 widget 入口。直接猜測的 `/widget-docs/tutorials/iframe/dynamic-symbols/` 路徑回傳「This isn't the page you're looking for」，因此實作時不依賴未確認的跨來源 setSymbol API，而以清空／重建官方 `widgetembed` iframe 來切換代碼與 interval，避免跨來源控制與私有 API 依賴。


本輪官方研究來源：TradingView [Advanced Chart Widget](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/)、[Available Markets](https://www.tradingview.com/widget-docs/markets/) 與 [Dynamically changing the symbol](https://www.tradingview.com/widget-docs/tutorials/iframe/build-page/dynamic-symbols/)。Dynamic Symbols 文件指出 symbol 使用 `{EXCHANGE}:{NAME}` 格式，Advanced Chart 支援 `tvwidgetsymbol` URL 參數；因此 global catalog 會將 NQ／ES／XAUUSD／USOIL／外匯映射至合格 TradingView symbol，並用重建 widget iframe 方式切換。Binance Spot 公開 REST／WebSocket 只繼續服務 Binance-compatible crypto symbols。


## 全球商品全球化本地回歸基線

本地 R:R 已以 `?v=global-symbols-tradingview-20260824` 開啟；瀏覽器 DOM 顯示新的加密貨幣、全球指數與期貨、美股科技權值三個預設 optgroup，搜尋 placeholder 已改為可輸入 SOLUSDT、XAUUSD、EURUSD、NVDA 或任意代碼。為避免前一輪資料影響，本地測試來源已清除 `gugopro_academy_watchlist_v1`、`gugopro_rr_state_v1`、`gugopro_grid_state_v1`，三者均回傳 null。


本地 R:R 乾淨基線實測結果：新 cache `global-symbols-tradingview-20260824` 頁面顯示加密貨幣 6 筆、全球指數／期貨／商品 4 筆、美股科技 5 筆，沒有預設台股標的；初始 `BTCUSDT` 成功取得 Binance Public API 2,000 根並補足至 3,000 根 K 線，HUD 顯示即時價格與 Binance ticker，原生 Lightweight Charts 與 Entry／Stop／Target 價格線可見。


R:R 全球搜尋實測：輸入 `XAUUSD` 後 autocomplete 顯示 `GOLD · Gold / XAUUSD` 與 `XAUUSD · Gold Spot / U.S. Dollar` 兩個清楚的全球分類候選；選取 XAUUSD 後搜尋欄已改為 `XAUUSD`，並觸發非 Binance 行情載入流程。瀏覽器原生 option click 對 ARIA listbox 有選擇限制，改用等價 DOM click 驗證候選事件，未修改產品行為。


R:R XAUUSD route 實測：公開 Yahoo K 線端點逾時後，頁面顯示 `已切換 TradingView · XAUUSD`、`非 Binance 全球商品使用 TradingView 圖表`，`#rr-tv-widget` 可見、原生 `#rr-chart` 標為 fallback hidden；iframe src 使用官方 Advanced Chart widget endpoint，query 為 `tvwidgetsymbol=OANDA%3AXAUUSD`、`interval=D`，未開啟 Binance WebSocket。


本地 Grid 初始回歸：`?v=global-symbols-tradingview-20260824` 顯示全球化頁題、三組預設商品（加密 6、全球指數／期貨／商品 4、美股科技 5），未出現預設台股；初始 BTCUSDT 成功取得 Binance Public API 約 2,000 根並補足至 3,000 根 K 線，WebSocket ticker 已連線，Lower／Upper／網格線／費後收益／破網風險等輸出正常，右軸仍只顯示 LATEST、LOWER、SL 等規則標籤。


Grid 全球搜尋實測：輸入 `XAUUSD` 後 autocomplete 顯示 `XAUUSD · Gold Spot`、市場 `全球商品／外匯` 與 `全球搜尋別名`，DOM click 選取後搜尋欄已改為 XAUUSD，並觸發非 Binance 的 TradingView Advanced Chart 載入流程。


Grid XAUUSD route 實測：公開 Yahoo fallback 後 `#grid-tv-widget` 可見、`#grid-chart` 標為 fallback hidden、active symbol 為 XAUUSD，狀態為 `已切換 TradingView XAUUSD`，連線狀態為 `TradingView Advanced Chart 已待命`；iframe src 使用 `tvwidgetsymbol=OANDA%3AXAUUSD` 與 `interval=15`，未嘗試建立 Binance ticker。


Grid XAUUSD 週期回歸：在 fallback 頁面將週期由 15m 切換至 1h 後，HUD 週期已更新為 1h，XAUUSD active state 保持，TradingView fallback 圖表與網格參數區仍可見；此非 Binance 路由不建立 Binance WebSocket。


R:R 最新路由修正回歸：以 URL 指定 XAUUSD 後，頁面直接顯示 `已切換 TradingView Advanced Chart · XAUUSD`，`#rr-tv-widget` 可見、`#rr-chart` hidden；iframe src 已確認為 `https://www.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=D...`，修正了 widgetembed endpoint 對 `tvwidgetsymbol` query 不採用而回到 AAPL 的問題。HUD 仍保留 Entry／Stop／Target／風險／資金輸入。


Grid 最新 direct-route 回歸：以 `XAUUSD / 1h` 開啟後，active symbol 與 timeframe 正確，`#grid-tv-widget` 可見、`#grid-chart` hidden，狀態為 `已切換 TradingView Advanced Chart · XAUUSD`、連線顯示 `TradingView Advanced Chart 已待命`；iframe src 使用 `widgetembed/?symbol=OANDA%3AXAUUSD&interval=60`，證實非 Binance 路由直接建立 TradingView 圖表。


Grid localStorage 檢查：目前 saved payload 為 `symbol: XAUUSD`、`timeframe: 1h`、`grid-lower: 1800`、`grid-upper: 2400`、`grid-count: 25`、`grid-mode: geometric`、`grid-capital: 12000`、`grid-stop: 1650`、`grid-take: 2750`、`grid-fee: 0.08`、`rangeTouched: true`；搜尋欄雖已輸入 EURUSD，但尚未選取／載入，因此 saved symbol 保持 XAUUSD，符合只保存正式 selected symbol 的設計。


Grid EURUSD direct-route 實測：選取 autocomplete 後 TradingView iframe 顯示 `FX:EURUSD` 的 1h 圖表；頁面狀態為 `已切換 TradingView Advanced Chart · EURUSD`、`TradingView Advanced Chart 已待命`，完整網格參數仍維持 `XAUUSD／1h` 測試值並可編輯。`localStorage` 尚未因單純搜尋欄文字改變而誤寫 EURUSD，符合只保存正式 selected symbol 的設計。


Grid 全球商品 hydration 實測：在 `EURUSD／1h` 選取後重整不帶 `symbol` query，頁面仍還原 EURUSD、1h、Lower 1800、Upper 2400、Grids 25、等比、投資 12000、SL 1650、TP 2750、費率 0.08；TradingView Advanced Chart iframe 仍載入，證明 global selected symbol 與完整參數可由 localStorage 無縫恢復。


Grid 最新 375px RWD 回歸：同源隱藏 iframe 測得 viewport 375、`bodyScrollWidth=367`、`documentScrollWidth=367`、`overflow=false`；watchlist wrapper 與 TradingView fallback DOM 均存在。第一次測量腳本因箭頭函式分號位置造成 console syntax error，未改動產品程式；修正測量表達式後成功取得結果。


R:R 最新 375px RWD 回歸：同源隱藏 iframe 測得 viewport 375、`bodyScrollWidth=367`、`documentScrollWidth=367`、`overflow=false`；`.rr-watchlist-wrap`、`#rr-tv-widget` 與全球搜尋 placeholder 均存在，沒有因全球代碼與 TradingView fallback 增加橫向破版。


最新 cache-bust `global-symbols-tradingview-20260825` 的 R:R 自由搜尋回歸：輸入未列入 catalog 的 `MSTR` 後，autocomplete 正確顯示 `MSTR · 任意標準代碼`，市場提示為「自動判斷資料來源／Binance／TradingView」，證明搜尋已不局限於預設 15 筆商品。


最新 cache-bust R:R MSTR 載入回歸：選取「任意標準代碼」候選後，頁面狀態改為 `已切換 TradingView Advanced Chart · MSTR`，TradingView 圖表實際顯示 `M Strategy Inc`、`BATS_DLY:MSTR`、1D，證實未知標準 ticker 可由自由搜尋導向可用的 TradingView exchange:symbol。

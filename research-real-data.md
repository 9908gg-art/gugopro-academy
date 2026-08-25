# 台股真實資料端點研究（2026-08-25）

## 可用端點與實測結果

| 用途 | 端點／資料集 | 實測結果 |
| --- | --- | --- |
| 官方日 K | `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=YYYYMM01&stockNo=2330` | 回傳 `stat`, `fields`, `data`；含日期、成交股數、成交金額、開高低收、漲跌價差、成交筆數；官方英文頁 HTML 的 form `data-api0` 也指向 `/exchangeReport/STOCK_DAY`。 |
| FinMind 日 K | `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=2330&start_date=...&end_date=...` | `status=200`；資料含 `date`, `open`, `max`, `min`, `close`, `Trading_Volume`, `Trading_money`, `spread`, `Trading_turnover`。 |
| FinMind 法人 | `dataset=TaiwanStockInstitutionalInvestorsBuySell` | `status=200`；資料含 `date`, `buy`, `sell`, `name`；可依 `Foreign_Investor`, `Investment_Trust`, `Dealer_self` 等名稱彙總買賣超。 |
| FinMind 融資融券 | `dataset=TaiwanStockMarginPurchaseShortSale` | `status=200`；資料含 `MarginPurchaseTodayBalance`, `MarginPurchaseYesterdayBalance`、融券餘額等，可計算增減與券資比。 |
| FinMind 本益比 | `dataset=TaiwanStockPER` | `status=200`；資料含 `date`, `dividend_yield`, `PER`, `PBR`，可計算最新 PE、殖利率與歷史分位。 |
| FinMind 股利 | `dataset=TaiwanStockDividend` | `status=200`；資料含 `date`, `StockEarningsDistribution`, 除息交易日等欄位，可彙整歷年現金股利與除息資料。 |

## 實作決策

以 FinMind 作為瀏覽器端主要資料層，因同一 API 可依 `data_id` 取得四項工具需要的台股價格、法人、融資融券、PER 與股利資料；將 `2330`, `2454`, `0050` 等輸入正規化為純代號，支援熱門快選。官方 TWSE `STOCK_DAY` 作為日 K 備援／來源標示，必要時依月份合併歷史資料。

不得在 UI 使用「教育用情境」、要求使用者手動輸入法人買賣超、融資餘額或歷史收盤價作為主要操作流程。外部資料載入失敗時需明確顯示錯誤與重試入口，不以隨機數或假情境靜默填補。計算仍在瀏覽器執行；頁面應標示資料來源、查詢時間與資料可能延遲，並保留交易所／資料服務的原始連結。

## 參考來源

1. [TWSE Daily Trading Value/Volume of Individual Securities](https://www.twse.com.tw/en/trading/historical/stock-day.html)
2. [TWSE STOCK_DAY JSON endpoint](https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=20260801&stockNo=2330)
3. [FinMind API documentation](https://api.finmindtrade.com/docs)
4. [FinMind project overview](https://finmind.github.io/en/)


## 瀏覽器可用性與財報補充

在 FinMind Swagger 頁面同源瀏覽器 context 執行跨來源 `fetch` 實測，五個核心資料集均回傳 HTTP 200、`msg=success`；2330 在 2026-07-01 至 2026-08-25 的價格／融資融券／PER 各有 39 筆，法人有 195 筆（多個法人類別）。因此工具可採瀏覽器直接 fetch，並在 UI 顯示資料來源與查詢時間。

`TaiwanStockFinancialStatements` 對 2330 在 2025-01-01 至 2026-08-25 回傳 `date`, `type`, `value`, `origin_name`，可依 `IncomeAfterTaxes`、`EquityAttributableToOwnersOfParent` 等欄位與最新流通股數資料推導或交代 EPS 來源；若資料集欄位不足，估值工具應明確顯示缺資料，而不是默默使用假 EPS。


## 本地瀏覽器回歸

新版 `tw-institutional-tracker.html` 以 2330 啟動後約 12 秒完成 FinMind fetch：狀態為「資料已更新」、最新收盤 NT$2,400.00、資料日 2026/8/25、Canvas 782×298，結果含 60 日價格／法人／融資融券資料。使用熱門快選依序切換 2603 與 0050，兩者均狀態「資料已更新」並分別顯示 NT$246.00、NT$104.40，確認代號不是只對單一標的硬編碼。


## 四頁本地回歸補充

均線頁以 2330 成功載入最新收盤 NT$2,400.00、5MA 2,382.00、20MA 2,368.50、60MA 2,382.25、RSI 35.01、K/D 58.82/29.41、MACD 5.12，並渲染 4 列扣抵表與 Canvas 價格／量能圖。首次測試發現 MA HUD 缺少標的節點，已補齊並重新生成。

估值頁以 2330 成功載入最新 PE 27.82x、現金殖利率 0.92%、近三年平均填息 3 日、P10-P90 價格帶 NT$1,441.74–2,678.99、近四季 EPS 86.28，並渲染歷史 PE 及股利／填息兩張 Canvas；首次測試發現估值 HUD 缺少標的節點，已補齊並重新生成。

交易成本頁以 2330 真實最新收盤 NT$2,400.00 自動帶入買／賣價與停損價，計算當沖稅 0.150%、2.8 折手續費、ROI、Tick、T+2 與成本圖表；資產版本已更新為 `real-data-tools-20260825-r1`，委託買價 HUD 亦已修正。


## 指標副圖補充

均線工具 r2 版以 2330 載入成功：主圖 Canvas 782×300，指標副圖 Canvas 782×298；HUD 顯示 RSI 35.01、K/D 58.82/29.41、MACD 5.12。指標副圖包含 RSI、KD-K 與標準化 MACD 線／柱狀動能，主圖保留收盤、5MA、20MA 與成交量。

390×844 iframe 回歸：籌碼頁 body/document scrollWidth=382、Canvas 304×260；均線頁 body/document scrollWidth=382、主圖 304×300。估值頁 body/document scrollWidth=382、PE 圖 304×300、股利圖 304×230；交易成本頁 body/document scrollWidth=382、成本圖 304×248；四頁狀態均為「資料已更新」。


## r4 手機版與 HUD 回歸

籌碼頁 r4 版 2330 HUD 已顯示外資 -1,151.1 張／估算金額 NT$-2,762,704,800、投信 658.4 張／NT$1,580,232,000、自營商 475.6 張／NT$1,141,384,800；主 Canvas 782×298，法人 20 日累計線已疊加。

四頁 390×844 回歸均為「資料已更新」，body/document scrollWidth 均為 382：籌碼圖 304×260；均線主圖 304×300、指標副圖 304×260 且 Chart.js instance 存在；估值 PE 圖 304×300、股利圖 304×230；交易成本圖 304×248。四頁沒有水平溢出，結果摘要均非空。

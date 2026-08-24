# GugoPro 財經學院：原生 K 線風報比與 BTC 網格工作台交付報告

**專案：** `9908gg-art/gugopro-academy`  
**正式站：** [academy.gugopro.com](https://academy.gugopro.com/)  
**功能提交：** `cd0309b`  
**最終 main 提交：** `acf1dec`  
**完成日期：** 2026-08-24

## 一、交付摘要

本次針對工具層的座標反向與數值溢位問題進行 Git 歷史考證與重構。風報比頁面不再以 iframe 上方的 absolute HTML 疊層模擬價格線，而是改用 Lightweight Charts 原生 K 線與 `createPriceLine`。拖曳事件透過原生系列的 `coordinateToPrice` 將畫面座標轉回價格，因此往上拖價格增加、往下拖價格減少，並即時更新 R:R、風險預算、建議單位數與潛在獲利。

網格工具已改造成以 BTC/USDT 為預設標的的實戰型工作台。工具會載入 Binance Public API K 線，使用同一個 Lightweight Charts 原生價格軸繪製買入網格、賣出網格、止損與止盈，並以實際 K 線路徑模擬成交、手續費、庫存、資金利用率、回撤與破網風險。所有試算維持瀏覽器端執行，使用者的投入額及風控條件不會送到本站後端。

## 二、Git 歷史考證與根因

已執行 `git log --oneline -- tools/`，並抽查 `45a2957`、`d7fe005`、`f4b3de7` 與 `252fdf6` 的 `tools/risk-reward-calculator.html`／`.js`。歷史脈絡如下：

| 版本 | 原始設計觀察 | 本次處理 |
|---|---|---|
| `45a2957` | 使用 Canvas K 線與按鈕／滑桿調整 Entry、Support、Resistance，BTC 是預設市場 | 保留其商品導向與風控意圖，改由原生圖表座標承接互動 |
| `d7fe005` | 擴充 Canvas 拖曳、支撐／壓力偵測、Yahoo／Binance 與代理端點 | 參考其多市場與結構分析邏輯，不沿用手算畫布座標 |
| `f4b3de7` | 曾縮減成單純數值風報表單 | 恢復完整市場圖表工作台，而非退回純輸入表單 |
| `252fdf6` | 新增 Lightweight Charts 與 TradingView fallback，但又以 `#rr-chart-labels`、`#rr-chart-zones` 的絕對定位層模擬價格標註 | 移除上述舊疊層，改用原生 `createPriceLine` 與 `coordinateToPrice` |

問題根因是最後一版把「圖表座標」和「價格座標」拆成兩個彼此獨立的層：畫面百分比被拿來估算價格，且價格線沒有由 Lightweight Charts 的 price scale 管理。當容器尺寸、價格範圍或行情商品改變時，兩者便可能方向相反或產生極端數字。本次另加入 `finitePrice` 上限、輸入正數驗證及 request sequence 保護，避免非有限值、超大值或慢速舊行情請求污染最新狀態。完整歷史抽取保存在 `history-analysis.md`。

## 三、R:R 原生 K 線分析儀

正式工具：[R:R K 線分析儀](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=96ccdf9)

工具支援 1 分鐘、5 分鐘、15 分鐘、1 小時與 1 日五種週期；商品目錄包含 BTCUSDT、ETHUSDT、SOLUSDT、AAPL、MSFT、NVDA、TSLA、QQQ、0050.TW 與 00919.TW，也可輸入自訂代號。加密資產從 Binance Public API 載入，美股／ETF 優先嘗試 Yahoo Finance；公開端點因 CORS 或網路狀態無法讀取時，會切換 TradingView Advanced Chart Widget，數值風控仍可離線使用。

圖表使用 Lightweight Charts 原生 `candlestickSeries`、`histogramSeries` 與 `createPriceLine`。進場、停損及目標線不再有額外的 `#rr-chart-labels`／`#rr-chart-zones` 疊層；滑鼠按下時以 `priceToCoordinate` 找到最近原生價格線，移動時以 `coordinateToPrice` 更新輸入欄位，然後重新計算結果。

風報比仍採教育用途的清楚公式：

> 單位風險 = `|進場價 − 停損價|`；單位潛在獲利 = `|目標價 − 進場價|`；R 倍數 = 單位潛在獲利 ÷ 單位風險；建議單位數 = floor(風險預算 ÷ 單位風險)。

### 雙向拖曳回歸測試

本地真實瀏覽器在 BTCUSDT 原生 K 線上執行 pointerdown／pointermove／pointerup 測試。向上拖曳進場線 36px，進場價由 **77,406.72** 增加至 **85,205.97**，變化 **+7,799.25**；向下拖曳 30px 後降至 **78,706.59**，變化 **−6,499.38**。兩次均輸出有限數值，沒有超過 `1e12` 的溢位，R:R 與建議部位同步更新。最後部署 96ccdf9 的正式站亦成功顯示 Binance BTCUSDT K 線、支撐 76,051、壓力 78,080 與約 2.9% ATR。

## 四、BTC/USDT 動態網格交易工作台

正式工具：[BTC/USDT 動態網格工作台](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=96ccdf9)

### 交易所標準參數

| 參數 | 功能 |
|---|---|
| BTC/USDT K 線週期 | 5 分鐘、15 分鐘、1 小時、4 小時、1 日；預設 15 分鐘 |
| 價格下限／上限 | 決定網格有效區間，預設會在行情成功後自動以最新價上下約 10% 建立合理情境 |
| 網格數量 | 2–100 格，支援動態增減 |
| 網格模式 | 等差 Arithmetic 或等比 Geometric |
| 總投資額 | 以 USDT 計算每一格可分配資金 |
| 止損／止盈 | 以原生價格線標示保護條件，並在歷史路徑觸及時發出狀態提示 |
| 單邊手續費 | 預設 0.1%，可調整並從雙邊單格收益中扣除 |

### 圖表與模型

Binance K 線成功時，工具使用 Lightweight Charts 原生價格線繪製網格：目前價下方的網格為綠色買入線，上方為紅色賣出線，止損為黃色線，止盈為紫色線。網格線與 K 線共享同一個 price scale，不使用會造成座標反向的外部絕對定位層。使用者調整上下限、網格數或等差／等比模式時，程式會移除舊 price lines，重新計算 levels 並立即重繪。

單格毛利率依等差或等比間距計算，單格淨利潤率扣除雙邊手續費；單格套利金額以每格分配資金乘以淨利潤率估算；資金利用率以模擬過程中的最大庫存市值除以總資金；最大回撤以逐根 K 線標記的資產淨值相對歷史峰值計算。實際成交路徑會使用相鄰 K 線收盤價跨越的網格級距，模擬買入庫存與向上穿越後的賣出配對。

破網風險以目前價格到最近上下界的距離提示；若行情已低於下限或高於上限，狀態會顯示「已跌破下網」或「已突破上網」。歷史 K 線曾觸及止損或止盈時，狀態列也會標示，提醒使用者不要把網格成交次數誤認為低風險。

### 網格回歸測試

本地真實瀏覽器成功載入 Binance 1,000 根 BTCUSDT 15 分鐘 K 線。初始 20 格等比情境繪製 23 條原生價格線（21 條網格＋止損／止盈）；調整為 30 格等差、70,000–85,000 區間後，原生線數增加至 **33 條**，證明上下限、網格數與模式均會即時重繪。該情境輸出每格間距 **0.65%**、扣雙邊 0.1% 後淨利潤率 **0.45%**、資金利用率 **23.06%**、距最近邊界 **9.53%**、最大回撤 **0.74%**，所有輸出均為有限數值。

## 五、保留的其他工具與導流

首頁與工具工作台仍保留 ETF 被動現金流與 Amazon／Ko-fi／TradingView 導流。R:R 與 BTC 網格頁底均含指定 TradingView 合作連結 `https://www.tradingview.com/?aff_id=168714`、既有 Amazon 聯盟標記 `9908qq-20`、Ko-fi 入口，以及隱私權政策、服務條款與關於我們頁面。

## 六、驗證結果

| 驗證項目 | 結果 |
|---|---:|
| Git 歷史檢查 | 已執行 `git log --oneline -- tools/` 與舊版 `git show`，並保存 `history-analysis.md` |
| 文章指南 | 13 / 13，全部通過既有 1,200 字深度門檻 |
| R:R 週期選單 | 1m、5m、15m、1h、1d 全部存在 |
| R:R 原生圖表 | Binance BTCUSDT 500 根 K 線成功載入；Lightweight Charts canvas 存在 |
| R:R 拖曳 | 向上增加、向下減少；雙向 pointer 回歸均 finite，無大數溢位 |
| R:R 舊疊層 | `#rr-chart-labels`、`#rr-chart-zones` 已從頁面移除 |
| BTC 網格行情 | Binance BTCUSDT 1,000 根 15m K 線成功載入 |
| BTC 網格價格線 | 綠色買入、紅色賣出、黃色止損、紫色止盈均以原生 price lines 繪製 |
| 網格聯動 | 20 格／23 線改 30 格／33 線；上下限與模式變更同步生效 |
| 安全數值 | R:R 價格上限 `1e12`，網格價格亦受有限值與正數驗證保護 |
| HTML／連結 | `validate_site.py` 錯誤數 0 |
| JavaScript | R:R、網格、`app.js`、`advanced-tools.js` 全部通過 `node --check` |
| Git 差異 | `git diff --check` 通過 |
| 測試探針 | 已於提交前移除，不會進入正式版本 |

## 七、正式部署與提交

已使用使用者提供的 GitHub PAT 推送至 [GitHub `main`](https://github.com/9908gg-art/gugopro-academy/tree/main)，提交訊息為：

`Manus AI: inspect git history to fix inverted R:R lines and rebuild BTC grid trading station`

功能提交為 `cd0309b`；文件同步提交為 `f485ccc`；最後功能／cache-bust 提交為 `96ccdf9`；最終研究紀錄提交為 `acf1dec`。GitHub Pages 對應 workflow 已完成 `success`，正式頁已確認採用 `native-grid-20260824` 資產版本。正式首頁、正式 R:R、正式 BTC 網格頁均以 `?v=acf1dec` 版本參數驗證；remote URL 不含 PAT，工作樹保持乾淨。

## 八、檔案導覽

| 檔案 | 用途 |
|---|---|
| `tools/risk-reward-calculator.html` | 原生 Lightweight Charts R:R 工作台、五週期、商品搜尋、原生價格線與 fallback |
| `tools/risk-reward-calculator.js` | Binance／Yahoo 請求、座標轉換、拖曳、R:R、支撐壓力、ATR 與請求競態保護 |
| `tools/grid-trading-calculator.html` | BTC/USDT K 線、交易參數、績效／風險面板與導流 |
| `tools/grid-trading-calculator.js` | Binance K 線、原生網格／保護價格線、成交配對、費用、利用率與回撤 |
| `style.css` | 原生圖表工作台、價格線提示、網格圖例與 RWD |
| `validate_site.py` | 全站檔案、DOM、連結及新工具欄位驗證 |
| `history-analysis.md` | Git 歷史與現行根因抽取紀錄 |
| `research-notes.md` | 本次本地與正式站回歸紀錄 |

## 九、限制與風險揭露

公開行情端點可能因 CORS、網路狀態、交易所地區限制或延遲而不可用；R:R 頁提供 TradingView 圖表 fallback，但 fallback 圖表本身不與本站的原生價格線共享互動層，使用者可改用下方數值欄位設定風報計畫。網格模型使用公開 K 線和可重現的成交配對估算，不等同交易所撮合、歷史回測或收益承諾；實盤還要納入滑價、流動性、資金費率、API 中斷、最小下單量與稅務。

[1]: https://tradingview.github.io/lightweight-charts/ "Lightweight Charts 官方文件"
[2]: https://www.tradingview.com/widget/advanced-chart/ "TradingView Advanced Chart Widget"
[3]: https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data "Binance Spot API：Kline/Candlestick Data"
[4]: https://finance.yahoo.com/ "Yahoo Finance 公開行情入口"

本報告由 **Manus AI** 撰寫；所有投資與收益內容僅供教育與研究參考，不構成投資、稅務或法律建議。

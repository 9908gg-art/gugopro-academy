# GugoPro 財經學院高階工具升級交付報告

**專案：** `9908gg-art/gugopro-academy`  
**正式站：** [academy.gugopro.com](https://academy.gugopro.com/)  
**最終提交：** `252fdf6`  
**完成日期：** 2026-08-24

## 一、交付摘要

本次工具層升級將原本的純數值風報比頁面改造成可搜尋商品、載入 K 線、拖曳風報標註、辨識支撐壓力並同步計算部位大小的分析工作台。同時新增 ETF 被動現金流試算機與動態網格交易收益模擬器，並將三款工具同步放入首頁及工具工作台。

所有數值計算維持瀏覽器端執行。帳戶資金、風險百分比、價格標註與試算條件不會送到 GugoPro 後端；行情只透過瀏覽器向公開行情端點或 TradingView Widget 載入。頁面保留指定 TradingView 合作 CTA、Amazon 精選資源、Ko-fi 支持入口，以及隱私權政策、服務條款與關於我們頁面。

## 二、功能交付

| 模組 | 交付內容 | 主要檔案 |
|---|---|---|
| 風報比即時 K 線分析儀 | 熱門美股、台股 ETF、加密資產搜尋與預設；日線／小時／4 小時切換；K 線圖；進場／停損／目標三條可拖曳標註；綠色獲利區；紅色風險區；R 倍數；風險預算；建議單位數與名目部位 | `tools/risk-reward-calculator.html`, `tools/risk-reward-calculator.js` |
| 行情來源與 fallback | 股票／ETF 優先嘗試 Yahoo Finance；加密資產使用 Binance Public API；瀏覽器遇到 CORS 或端點失敗時自動切換 TradingView Advanced Real-Time Chart Widget | `tools/risk-reward-calculator.html`, `tools/risk-reward-calculator.js` |
| 支撐／壓力演算法 | 以最近 80 根 K 線的局部高低點估算最近支撐與壓力，並以平均真實波幅相對收盤價估算 ATR 波動提示；支撐／壓力可一鍵套用至停損或目標 | `tools/risk-reward-calculator.js` |
| ETF 被動現金流 | 主流標的配息率預設、單筆投入、每月定期投入、價格成長、模擬年數、DRIP 切換，再投入與領出現金資產比較 | `tools/etf-dividend-calculator.html`, `tools/etf-dividend-calculator.js` |
| SVG 現金流曲線 | 瀏覽器端繪製再投入與領出現金兩條年度資產曲線，更新期末差距、年度配息及累計領出股息 | `tools/etf-dividend-calculator.js` |
| 動態網格交易 | 價格上下限、網格數、等差／等比模式、投入資金、波動率、模擬天數；輸出網格間距、成交回合、套利毛利、報酬率、最大回撤與期末模擬資產 | `tools/grid-trading-calculator.html`, `tools/grid-trading-calculator.js` |
| SVG 網格圖 | 顯示上下限及網格線、固定情境價格路徑與資產路徑，用於比較波動率、成交與回撤變化 | `tools/grid-trading-calculator.js` |
| 全站入口 | 首頁實戰工具區、工具工作台高階工具區與既有 R:R 指南連結均已同步 | `index.html`, `tools/index.html`, `build_guides.py` |

## 三、R:R 計算與圖表行為

R:R 頁面保留交易風控公式：單位風險為 `|進場價 − 停損價|`，單位潛在獲利為 `|目標價 − 進場價|`，風報倍數為單位潛在獲利除以單位風險；建議單位數以風險預算除以單位風險後向下取整。頁面檢查多頭的「目標 ＞ 進場 ＞ 停損」與空頭的相反方向，避免方向錯誤被誤算為有效計畫。

圖表標註是可操作的互動層。使用者可拖曳「進場」、「停損」或「目標」線，頁面把垂直位置換算回價格並觸發即時計算；也可直接修改數值欄位。公開行情端點可用時由 Lightweight Charts 繪製自訂 K 線；若 Yahoo Finance 因瀏覽器 CORS 限制無法讀取，TradingView Widget 會提供可互動的 AAPL 等商品圖表。商品快速切換採請求序號保護，避免較慢的舊請求覆蓋最新商品狀態。

> **資料來源限制：** 頁面所稱「即時」代表公開端點或 TradingView 可取得的最新資料，不代表無延遲、完整盤中成交或任何交易所保證。正式交易前仍需核對券商、交易所與商品文件。

## 四、兩款新增工具的測試情境

| 工具 | 測試條件 | 結果 |
|---|---|---|
| ETF 被動現金流 | 0050、單筆 NT$300,000、每月 NT$10,000、年化配息率 3.2%、價格成長 4%、20 年、DRIP 開啟 | 第一年度預估配息 NT$9,600；期末再投入 NT$6,537,451；期末領出現金情境 NT$4,373,641；兩條 SVG 曲線均有資料 |
| ETF 分支情境 | 切換 00919 並關閉 DRIP | 配息率即時更新為 8.5%；狀態切換為領出現金；兩條資產路徑重新繪製 |
| 網格預設 | 80–120 區間、10 格、NT$200,000、90 天、35% 波動率、等差 | 4% 估算間距、3 回合、NT$2,400 毛利、-1.12% 模擬報酬、6.11% 最大回撤 |
| 網格高波動 | 同一區間切換等比並提高波動率至 80% | 4.14% 比例間距、17 回合、NT$14,069 毛利、16.76% 最大回撤；SVG 路徑重新生成 |

上述數值為固定假設下的教育模擬，不是歷史回測、收益承諾或交易訊號。網格模擬採可重現的情境路徑，目的是展示參數如何影響成交與回撤，而不是替代交易所撮合紀錄。

## 五、本地驗證結果

`validate_site.py` 已擴充至檢查 13 篇指南、9 個既有工作台面板、3 款獨立高階工具、R:R 圖表與標註 DOM、ETF／網格 SVG 元件、TradingView／Amazon／Ko-fi 導流，以及所有合規 Footer 連結。

| 驗證項目 | 結果 |
|---|---:|
| 指南頁數 | 13 / 13 |
| 深度文章門檻 | 13 / 13 通過 1,200 字 |
| 指南必要結構 | 全部包含核心概念、指標／公式、實例、實戰、四欄比較表、清單與來源 |
| 既有工具工作台 | 9 個面板、9 個 `data-calc` 綁定 |
| 新增獨立工具 | 3 / 3 HTML 與 JS 存在並通過檢查 |
| HTML 相對連結 | 0 個 broken link |
| 重複 DOM ID | 0 |
| JavaScript 語法 | `app.js`、`advanced-tools.js` 與 3 個新工具 JS 全部通過 `node --check` |
| Git 差異格式 | `git diff --check` 通過 |
| TradingView 指定連結 | 首頁、工作台、R:R、ETF、網格與指南 CTA 均存在 |

瀏覽器回歸實際檢查了 R:R AAPL TradingView fallback、R:R BTCUSDT Binance 180 根日線及支撐／壓力／ATR、ETF DRIP 切換、網格等比高波動切換。關鍵輸出與狀態保存在 `research-notes.md`。

## 六、正式部署驗證

GitHub Pages 設定確認 custom domain `academy.gugopro.com` 使用 `main` 分支根目錄。提交 `252fdf6` 對應的 Pages workflow 已完成且為 success。

| 正式頁面 | 驗證觀察 |
|---|---|
| [首頁](https://academy.gugopro.com/?v=252fdf6-pages-ready) | 顯示「風報比即時 K 線分析儀」、「ETF 配息與 DRIP 試算」及「動態網格交易模擬器」三張工具卡；Footer 含 TradingView、Ko-fi、Amazon 與政策頁 |
| [R:R K 線分析](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=252fdf6) | 公開 Yahoo 端點失敗時顯示切換 TradingView；正式頁面呈現 AAPL K 線工具列、搜尋欄、三條標註、3R 預設結果與合作 CTA |
| [ETF 現金流](https://academy.gugopro.com/tools/etf-dividend-calculator.html?v=252fdf6) | 顯示 0050 預設情境、配息與資產統計、DRIP 控制、SVG 曲線及完整合作／政策 Footer |
| [網格模擬](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=252fdf6) | 顯示等差預設情境、等比／高波動切換、SVG 網格線與價格路徑，並含完整合作／政策 Footer |

## 七、檔案導覽與維護

| 檔案／目錄 | 用途 |
|---|---|
| `index.html` | 首頁及三款高階工具卡入口 |
| `style.css` | Header、Hero、工具卡、K 線工作台、SVG 圖表與 RWD 樣式 |
| `tools/risk-reward-calculator.html` | 搜尋、K 線、TradingView fallback 與風報比介面 |
| `tools/risk-reward-calculator.js` | 行情載入、請求競態保護、標註、支撐壓力及風控計算 |
| `tools/etf-dividend-calculator.html`／`.js` | ETF 被動現金流介面與 SVG 情境模擬 |
| `tools/grid-trading-calculator.html`／`.js` | 網格交易介面與 SVG 情境模擬 |
| `tools/index.html` | 九項既有工作台及三款高階工具導覽 |
| `build_guides.py` | 13 篇深度指南共同版型與新版 R:R 文案 |
| `validate_site.py` | 全站連結、ID、工具與圖表元件驗證 |
| `research-notes.md` | 本地及正式站驗證紀錄 |

Yahoo Finance 在部分瀏覽器環境可能拒絕跨來源讀取，因此頁面採「Yahoo／Binance 自訂 K 線 + TradingView fallback」雙路徑，而不是將失敗端點呈現為空白頁。TradingView Widget 的圖表與資料仍由 TradingView 載入；本站不取得或儲存使用者的帳戶、風險或交易資料。ETF 主流標的的配息率是可編輯情境預設，不是現金股利保證。

## 八、參考資料

[1]: https://tradingview.github.io/lightweight-charts/ "Lightweight Charts 官方文件"
[2]: https://www.tradingview.com/widget/advanced-chart/ "TradingView Advanced Chart Widget"
[3]: https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data "Binance Spot API：Kline/Candlestick Data"
[4]: https://finance.yahoo.com/ "Yahoo Finance 公開行情入口"
[5]: https://www.investor.gov/introduction-investing/investing-basics/what-risk "Investor.gov：What Is Risk?"

本報告由 **Manus AI** 撰寫；所有投資、收益與風險內容僅供教育與研究參考，不構成投資、稅務或法律建議。

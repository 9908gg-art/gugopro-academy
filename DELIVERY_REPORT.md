# GugoPro 財經學院：R:R 全市場 Scanner、BTC 網格與策略指南交付報告

**專案：** `9908gg-art/gugopro-academy`
**正式站：** [academy.gugopro.com](https://academy.gugopro.com/)
**本輪功能提交：** `578876f`
**文件同步提交：** `1b25eed`
**最終 main：** `26471cd`
**完成日期：** 2026-08-24
**作者：** Manus AI

## 一、交付摘要

本輪完成四項相互關聯的升級。第一，將全市場風報比智慧掃描器整合至原生 R:R K 線分析儀，提供加密貨幣、美股與台股／ETF 監控池、公開行情批次讀取、波段高低點、即時 R:R、狀態分類與點擊帶回圖表。第二，商品載入或週期切換時，Entry 自動採用最新收盤價，Target 錨定最近可見 K 線波段高點，Stop Loss 錨定波段低點，避免使用任意固定點位。

第三，BTC/USDT 網格工作台的中間網格線仍使用 Lightweight Charts 原生虛線，但不再讓每條線都顯示 Y 軸數字；右側軸只保留 Upper、Lower、最新價與 SL／TP 等關鍵價位。第四，新增兩篇具公式、案例、風險比較、檢查清單與來源的深度指南，並讓指南文末與三個獨立工具頁互相導流，形成文章到工具、工具到策略文章的內鏈閉環。

所有行情與計算仍在瀏覽器端處理。公開行情可能延遲、被 CORS／網路狀態阻擋或受到交易所限制；Scanner 對不可用標的會標示不可用，不以缺資料冒充訊號。所有 R:R、網格與 DRIP 數字都是教育情境，不構成投資建議、回測保證或收益承諾。

## 二、R:R Market Scanner 與波段自動錨定

### 功能與監控池

R:R 工具下方新增 `R:R MARKET SCANNER / SWING MAP` 面板。使用者可以切換全市場、加密貨幣、美股、台股／ETF，選擇 15 分鐘、1 小時或 1 日 Scanner 週期、60／120／250 根回溯範圍與最低 R 倍數，再按「開始掃描」。目前監控池包含主流 Binance 交易對、AAPL／MSFT／NVDA／TSLA／QQQ 等美股，以及 0050.TW、00919.TW 與部分台股權值股；Yahoo 直連失敗時會嘗試公開 CORS fallback，仍失敗則以明確不可用狀態排除。

結果表列出商品代碼、市場、現價、波段低點、波段高點、風險距離、潛在 R:R 與狀態。狀態包括接近波段低點、接近波段高點、較高風報機會與觀察中。每一列提供「帶入圖表」操作；點擊後會以 `?symbol=...&timeframe=...` 帶回上方原生圖表並重新載入該商品。

### 波段點位與公式

對每次行情載入，工具從最新可見區間取最近 120 根 K 線作為主要結構視窗，並依選定週期換算可用資料。波段高點取該視窗最高 High，波段低點取最低 Low，Entry 取最新 Close。多頭教育情境的 Scanner R:R 為：

> `R:R = (Swing High − Current Price) ÷ (Current Price − Swing Low)`。

主圖的自動計畫則令 `Entry = latest close`、`Stop = swing low`、`Target = swing high`，再由原生 `createPriceLine` 畫出三條價格線。所有價格經 `finitePrice`、正數與 `1e12` 上限保護，請求序號也會阻止慢速舊請求覆蓋最新商品。

## 三、BTC/USDT 網格 Y 軸清爽化

網格工具仍以 Binance 公開 BTC/USDT K 線為基礎，支援 5m、15m、1h、4h、1d、Upper／Lower、2–100 格、Arithmetic／Geometric、總投資額、SL／TP 與單邊手續費。每條網格使用 Lightweight Charts 原生 price line；低於最新價為綠色買入線，高於最新價為紅色賣出線，止損為黃色，止盈為紫色。

本輪修正的關鍵是將中間網格線的 `axisLabelVisible` 設為 false，只對 Upper、Lower、最新價、SL 與 TP 顯示右側 Y 軸標籤。這些線仍保留原生虛線與滑鼠 crosshair 的價格讀取，不使用 HTML absolute 疊層。圖表下方也明確說明此顯示策略，避免使用者誤以為中間網格消失。

| 輸出 | 模型意義 |
|---|---|
| 每格間距 | 等差或等比價格層級的毛間距 |
| 單格利潤率（扣費） | 毛間距扣除買入與賣出雙邊手續費後的近似比例 |
| 單格套利金額 | 每格資金配置乘以費後單格利潤率 |
| 資金利用率 | 歷史模擬中最大庫存市值相對總投資額 |
| 破網風險 | 最新價距離最近上下界的百分比與是否已出界 |
| 回撤與實現套利 | 以歷史 K 線路徑做教育情境回放，不代表交易所成交結果 |

## 四、兩篇新增深度指南與雙向內鏈

### 新增指南

`guides/grid-trading.html` 說明現貨網格的區間假設、等差／等比層級公式、費後單格利潤、震盪與單邊行情差異、破網後庫存管理、止損止盈與實盤檢查流程，並引用 Binance 與 OKX 官方文件作為產品參數與風險背景來源。[1] [2]

`guides/etf-dividend-drip.html` 說明基金分配來源、除息與 NAV、DRIP 份額累積、配息率與總報酬差異、費用／稅務／匯率、領現金與再投入的比較口徑，並引用 SEC Investor.gov 與 Invesco 教育資料。[3] [4] [5]

兩篇頁面均由 `build_guides.py` 統一生成，與原有 13 篇指南合計 **15 篇深度指南**。所有指南的左側導覽均同步顯示 12 個原有商品分類、R:R、動態網格與 ETF DRIP 三個主題。

### 文章到工具、工具到文章

每篇指南文末均加入高視覺權重的 `PRACTICE DESK / APPLY THE FRAMEWORK` 卡片，直連風報比 K 線分析儀、ETF 現金流與 DRIP 試算機、BTC 動態網格工作台。三個獨立工具頁也加入專屬指南 CTA：R:R 連到 `guides/risk-reward-ratio.html`，ETF 工具連到 `guides/etf-dividend-drip.html`，BTC 網格連到 `guides/grid-trading.html`。

舊有 `tools/risk-reward-scanner.html` 仍保留可用網址，但已改成導向新版 `risk-reward-calculator.html#rr-market-scanner`，避免既有文章或外部書籤落到過時的獨立 Scanner。

## 五、本地真實瀏覽器驗證

本地預覽使用 `http://127.0.0.1:4173/`。R:R 初始測試以 BTCUSDT 載入 Binance 500 根日線，顯示原生 canvas、Entry 77,224.01、Swing Low／Stop 57,800.19、Swing High／Target 82,850 與約 2.9% ATR，沒有負數或數億級座標。截圖為 `127_0_0_1_2026-08-24_09-12-12_2010.webp`。

切換 Scanner 的加密貨幣分類並啟動批次掃描後，實際完成 6/16 個監控池標的：DOGEUSDT、XRPUSDT、BNBUSDT、BTCUSDT、SOLUSDT、ETHUSDT。表格的現價、波段低點／高點、風險距離、R:R 與狀態皆為有限值，最高範例為 DOGEUSDT 1.16R，BTCUSDT 為 0.29R；進度條到 100%。截圖為 `127_0_0_1_2026-08-24_09-12-52_3143.webp`。

點擊 BTCUSDT 結果後，搜尋欄仍正確為 BTCUSDT，頁面回到原生圖表並重新以行情波段設定計畫，截圖為 `127_0_0_1_2026-08-24_09-13-15_9385.webp`。以 `?symbol=ETHUSDT&timeframe=1h` 直達也正確帶入商品與 1 小時選單；該次公開端點逾時後安全顯示 TradingView fallback，保留數值欄位，沒有非法值。

BTC 網格測試載入 Binance 1000 根 15m K 線，初始輸出為 1.01% 比例間距、0.81% 費後單格利潤率、4.04 USDT 單格套利、24.89% 利用率、10% 邊界距離、0.8% 回撤與 9,944.10 USDT 期末模擬資產。截圖為 `127_0_0_1_2026-08-24_09-13-26_8111.webp`。將網格數改為 60 後完成 101 次歷史回合，狀態文字仍說明中間線只保留虛線，右軸無數字堆疊；截圖為 `127_0_0_1_2026-08-24_09-13-42_7225.webp`。

兩篇新增指南均能在本地載入，顯示 12 + 3 主題側欄、正文、表格、官方來源與工具 CTA。網格指南截圖為 `127_0_0_1_2026-08-24_09-15-12_2203.webp`，ETF DRIP 指南截圖為 `127_0_0_1_2026-08-24_09-15-28_7955.webp`。從 ETF 指南 CTA 到 ETF 工具頁的導流也已實測成功；工具頁顯示 20 年 DRIP 模型與回鏈，截圖為 `127_0_0_1_2026-08-24_09-15-57_1861.webp`。

## 六、驗證結果

| 驗證項目 | 結果 |
|---|---:|
| 指南頁總數 | 15 |
| Scanner 控件與結果表 | 通過 |
| 加密貨幣批次掃描 | 6/16 可用、100% 完成 |
| 波段高低點自動錨定 | 通過 |
| Scanner 點擊帶回圖表 | 通過 |
| R:R 週期 | 1m、5m、15m、1h、1d |
| 網格右軸標籤 | 僅 Upper／Lower／最新價／SL／TP |
| 高密度 60 格網格 | 通過，無 Y 軸文字堆疊 |
| 工具／指南雙向連結 | 通過 |
| `validate_site.py` | `errors=0` |
| JavaScript 語法 | R:R、網格、ETF、`app.js`、`advanced-tools.js` 全部通過 |
| `git diff --check` | 通過 |

完整自動檢查包含 15 篇指南存在、R:R Scanner DOM、`getSwingLevels`／`swingHigh`／`swingLow`／`coordinateToPrice`／Scanner 核心、網格與 ETF 工具頁、雙向指南連結與新版快取版本。

## 七、正式部署與提交

本輪指定提交訊息為：
`Manus AI: streamline R:R and grid tools into compact HUD dashboard with live WebSocket ticks and deep history`
本輪功能提交 `578876f` 已推送至 GitHub `main`，並以 Pages workflow `32727416900` 完成 `completed / success`；文件同步提交 `1b25eed`、metadata 提交 `123a4c2` 與最終 main `26471cd` 的 Pages workflow `32728003776`、`32728200852`、`32728517831` 均為 `completed / success`。提交訊息與上方指定內容完全一致。

正式站驗證網址為：

- [首頁](https://academy.gugopro.com/?v=578876f)
- [R:R HUD K 線與 Market Scanner](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=578876f#rr-market-scanner)
- [BTC/USDT HUD 網格](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=578876f)
- [ETF DRIP 指南](https://academy.gugopro.com/guides/etf-dividend-drip.html?v=578876f)
- [動態網格指南](https://academy.gugopro.com/guides/grid-trading.html?v=578876f)

本輪 HUD 功能 workflow [32727416900](https://github.com/9908gg-art/gugopro-academy/actions/runs/32727416900) 的 head 為 `578876f`、文件同步 workflow [32728003776](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728003776) 的 head 為 `1b25eed`、metadata workflow [32728200852](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728200852) 的 head 為 `123a4c2`，以及最終 main workflow [32728517831](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728517831) 的 head 為 `26471cd`，均已完成 `completed / success`。正式首頁、R:R HUD、BTC 網格 HUD 與兩篇指南以 `?v=578876f` 核對功能；最終 main `?v=26471cd` 亦已核對首頁與 R:R HUD 回應。

本輪正式截圖檔案：首頁 `academy_gugopro_2026-08-24_12-44-05_6952.webp`、R:R HUD `academy_gugopro_2026-08-24_12-44-25_8135.webp`、BTC 網格 HUD `academy_gugopro_2026-08-24_12-34-06_8061.webp`；前一輪首頁與指南截圖仍保留於研究紀錄。

## 八、檔案導覽

| 檔案 | 用途 |
|---|---|
| `tools/risk-reward-calculator.html` | 原生 R:R 圖表、Scanner UI、波段點位與 CTA |
| `tools/risk-reward-calculator.js` | 公開行情、Yahoo fallback、波段分析、Scanner 批次與帶入行為 |
| `tools/risk-reward-scanner.html` | 舊網址導向新版 Scanner anchor |
| `tools/grid-trading-calculator.js` | BTC K 線、原生網格線、稀疏軸標籤、費後模型 |
| `tools/grid-trading-calculator.html` | BTC 網格工作台與指南 CTA |
| `tools/etf-dividend-calculator.html` | ETF DRIP 工具與指南 CTA |
| `build_guides.py` | 15 篇指南、主題側欄、工具 CTA 與來源模板 |
| `guides/grid-trading.html` | 動態網格交易深度指南 |
| `guides/etf-dividend-drip.html` | ETF 股息再投入深度指南 |
| `style.css` | Scanner、CTA、網格與指南響應式樣式 |
| `validate_site.py` | 全站檔案、DOM、腳本與雙向連結驗證 |
| `research-notes.md` | Git 歷史、外部研究、本地回歸與截圖紀錄 |

## 九、限制與風險揭露

Yahoo Finance 與其他公開行情端點可能因 CORS、連線逾時、交易所休市、地區限制或資料延遲而不可用；R:R 工具會顯示明確 fallback 狀態，且不會把失敗資料放進 Scanner 結果。TradingView fallback 不與本站原生價格線共享互動層，若公開 K 線不可用，請使用數值欄位調整風報計畫。

波段高低點只是所選回溯窗口的機械化參考，會隨週期與窗口改變，不能視為支撐阻力保證。網格歷史回放使用 K 線路徑近似成交，未等同交易所撮合；真實執行還要納入滑價、流動性、最小下單量、部分成交、API 中斷、資金費率、稅務與資產配置。ETF DRIP 模型也未完整模擬除息日、稅務、匯率、費用與配息調整。

## 十、本輪 HUD 儀表板與即時行情重構（2026-08-24）

本輪將 R:R 與 BTC 網格工具由「圖表下方設定區」改成 **頂部緊湊 HUD**。R:R HUD 會在圖表前集中顯示現價、Entry、Stop、Target、R:R、風險百分比、帳戶資金、建議部位與風險預算；1m、5m、15m、1h、4h、1D、1W 由按鈕快速切換。網格 HUD 則將 Binance／Pionex 實盤定位、Lower、Upper、Grids、等差／等比、總投資、SL、TP、單邊費率與歷史載入控制集中在 K 線上方，調整任何參數即重繪原生買賣網格。

| 回歸項目 | 實測結果 |
|---|---|
| R:R 初始歷史 | Binance BTCUSDT 初始 2,000 根；向左觸發追加後狀態達 3,000 根 |
| R:R 長週期 | 1W 可載入約 472 根週線；Swing Low 約 49,000、Swing High 約 126,199.63、ATR 約 7.61% |
| R:R 即時行情 | Binance ticker WebSocket console 探針 `status=open`，成功取得 BTCUSDT 價格；頁面 HUD 曾實測由約 78,357.52 更新至 78,386.00，狀態顯示 `Binance ticker` |
| 網格初始歷史 | Binance BTCUSDT 初始 2,000 根；向左追加後狀態達 3,000 根 |
| 網格即時行情 | 頁面顯示 `WebSocket 已連線 · ticker`，最新價約 78,408、24 小時變化約 +1.68% |
| 網格 15m 教育情境 | 每格約 1.01%、費後約 0.81%、單格 4.04 USDT、利用率約 19.81%、回撤約 0.8% |
| 網格 4h 教育情境 | 3,000 根 K 線、176 次網格回合、利用率約 89.08%、回撤約 26.27%；曾觸及 SL／TP，明確標示為歷史回放 |
| Y 軸策略 | 右軸只顯示 LOWER／UPPER／LATEST／SL／TP；中間網格保留原生虛線，不建立 absolute 疊層 |
| 手機版 | 375px 同源 iframe：R:R `overflow=false`、HUD 339px、圖表 313px；網格 `overflow=false`、HUD／圖表 335px、控制列 311px |

即時連線依 Binance 官方 Spot WebSocket Streams 文件使用 `<symbol>@ticker` close price 欄位 `c`，並在頁面隱藏時關閉、回到頁面時重連；斷線會以遞增延遲重試。歷史資料依官方 Kline interval 使用 REST `limit` 與 `endTime` 向左分頁，且 1W 使用官方支援的週線 interval。[6] 由於這是公開前端行情，連線狀態、資料延遲、瀏覽器網路政策與交易所服務狀態都可能影響畫面；失敗時仍顯示 fallback 或明確錯誤，不把缺資料當成交易訊號。

本輪提交使用者指定訊息：

`Manus AI: streamline R:R and grid tools into compact HUD dashboard with live WebSocket ticks and deep history`

## References

[1]: https://www.binance.com/en/support/faq/detail/688ff6ff08734848915de76a07b953dd "Binance Spot Grid Trading Parameters"
[2]: https://www.okx.com/en-us/help/whats-the-spot-grid-bot-and-how-to-use-it "OKX Spot Grid Bot 說明"
[3]: https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/fund-distributions-investor-bulletin "SEC Fund Distributions Investor Bulletin"
[4]: https://www.invesco.com/qqq-etf/en/innovation/dividends-and-capital-appreciation-understanding-total-return.html "Invesco Understanding Total Return"
[5]: https://www.sec.gov/investor/alerts/etfs.pdf "SEC ETF Investor Bulletin"
[6]: https://developers.binance.com/en/docs/products/spot/testnet/web-socket-streams "Binance Spot WebSocket Streams and Kline Streams"

本報告由 **Manus AI** 撰寫；所有投資、交易、稅務與收益內容僅供教育與研究參考，不構成任何個人化建議。

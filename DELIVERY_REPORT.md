# GugoPro 財經學院：R:R 全市場 Scanner、BTC 網格與策略指南交付報告

**專案：** `9908gg-art/gugopro-academy`
**正式站：** [academy.gugopro.com](https://academy.gugopro.com/)
**本輪功能提交：** `578876f`
**文件同步提交：** `1b25eed`
**最終 main：** `482a2c2`
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
本輪功能提交 `578876f` 已推送至 GitHub `main`，並以 Pages workflow `32727416900` 完成 `completed / success`；文件同步提交 `1b25eed`、metadata 提交 `123a4c2`、版本提交 `26471cd` 與最終 main `482a2c2` 的 Pages workflow `32728003776`、`32728200852`、`32728517831`、`32728852164` 均為 `completed / success`。提交訊息與上方指定內容完全一致。

正式站驗證網址為：

- [首頁](https://academy.gugopro.com/?v=578876f)
- [R:R HUD K 線與 Market Scanner](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=578876f#rr-market-scanner)
- [BTC/USDT HUD 網格](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=578876f)
- [ETF DRIP 指南](https://academy.gugopro.com/guides/etf-dividend-drip.html?v=578876f)
- [動態網格指南](https://academy.gugopro.com/guides/grid-trading.html?v=578876f)

本輪 HUD 功能 workflow [32727416900](https://github.com/9908gg-art/gugopro-academy/actions/runs/32727416900) 的 head 為 `578876f`、文件同步 workflow [32728003776](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728003776) 的 head 為 `1b25eed`、metadata workflow [32728200852](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728200852) 的 head 為 `123a4c2`、版本 workflow [32728517831](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728517831) 的 head 為 `26471cd`，以及最終 main workflow [32728852164](https://github.com/9908gg-art/gugopro-academy/actions/runs/32728852164) 的 head 為 `482a2c2`，均已完成 `completed / success`。正式首頁、R:R HUD、BTC 網格 HUD 與兩篇指南以 `?v=578876f` 核對功能；最終 main `?v=482a2c2` 亦已核對部署回應。

本輪正式截圖檔案：首頁 `academy_gugopro_2026-08-24_12-44-05_6952.webp`、R:R HUD `academy_gugopro_2026-08-24_12-44-25_8135.webp`、BTC 網格 HUD `academy_gugopro_2026-08-24_12-34-06_8061.webp`；功能畫面以 `?v=578876f` 截圖，最終 `482a2c2` 部署已完成 workflow 核對。

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

## 十一、本輪 UI 終極優化：零標題浪費、行內商品切換與可讀 HUD（2026-08-24）
本輪針對 `tools/risk-reward-calculator.html` 與 `tools/grid-trading-calculator.html` 進行最後一層人性化修正。兩頁均移除 HUD 與 K 線之間的可見大型市場標題：R:R 不再顯示 `LIVE MARKET MAP / LIGHTWEIGHT CHARTS` 與 `BTCUSDT Bitcoin / Tether`，網格不再顯示 `LIVE MARKET / BTCUSDT` 與重複的大型商品標題；圖表容器現在直接接在 HUD 後方，只保留極小間距與必要的語意標題。

兩個 HUD 最左側均新增原生快速商品下拉選單，包含 BTCUSDT、ETHUSDT、SOLUSDT、AAPL、NVDA、TSLA、SPY、0050.TW、00919.TW、2330.TW。選擇後會同步商品搜尋欄、行情載入、K 線資料、WebSocket 或股票／ETF fallback 路徑；加密資產維持 Binance 公開 REST／ticker WebSocket，股票與 ETF 則維持 Yahoo Finance 與既有 fallback，沒有新增伺服器或 API key。

「緊湊」本輪只消除無意義的 padding、gap 與重複標題，沒有縮小可讀文字。桌面 Chromium 計算值為：R:R 設定標籤 14.08px、Entry 輸入值 17.92px、R:R 核心數字 28px；網格設定標籤 14.08px、輸入值 16px、最新價 19.84px。數值採粗體等寬數字，R:R ratio 保持最大視覺層級。

| 回歸項目 | 本輪實測結果 |
|---|---|
| R:R 本地 BTC／ETH | BTC 預設流程與 ETHUSDT 快速切換成功；ETH 公開 K 線成功載入並以 Swing Low／High 更新 R:R |
| 網格本地 BTC／ETH | BTC 成功載入 2,000 根後至 3,000 根歷史、WebSocket ticker 已連線；ETH 選擇後重新進入加密資產載入流程，網格統計與原生線維持可用 |
| 股票／ETF安全切換 | R:R 與網格均測試 AAPL；HUD 與載入狀態安全更新，Yahoo CORS／休市時保留既有 fallback 與提示，不崩潰 |
| 桌面可讀性 | 1280px viewport；兩頁標籤至少 14px、輸入值至少 16px，R:R 28px 粗體；舊市場標題可見數量 0 |
| 行動版 RWD | 375px 同源 iframe：R:R 與網格 `bodyScrollWidth=367`、`rootScrollWidth=367`、`overflow=false`；quick selector／chart 均存在，舊市場標題可見數量 0 |
| 既有功能保留 | 原生 Lightweight Charts 價格線拖曳、R:R Scanner、網格原生線、稀疏 LOWER／UPPER／LATEST／SL／TP 軸標籤、長歷史向左載入與 WebSocket 重連均未移除 |

本輪檔案同步更新 `validate_site.py`，驗證兩頁快速選單、熱門代碼、新版 `ui-compact-hud-20260824` cache-bust 與可見舊標題移除。截圖檔案為：R:R 本地 ETH 版 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-11-41_9105.webp`、網格本地 BTC 版 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-12-18_6155.webp`；部署後將以正式站版本再補充最終 hash 與 workflow。

## 十二、113bb35 正式部署結論（2026-08-24）
提交 `113bb35` 已使用使用者指定的 commit message 推送至 `main`；GitHub 公開 Actions 的 `pages build and deployment` Run 78（workflow ID `32732000522`）已完成且成功。正式站檢查 URL 如下：

| 正式頁面 | 驗證結果 |
|---|---|
| [R:R HUD 工具](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=113bb35) | 行內商品選單、可讀 Entry／Stop／Target／風險／資金 HUD、放大 R:R、1m–1W 週期、原生 K 線與 Scanner 均存在；可見冗餘圖表標題為 0 |
| [網格 HUD 工具](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=113bb35) | 行內商品選單、Lower／Upper／Grids／投資／SL／TP／費率 HUD、BTC K 線、長歷史、WebSocket、原生網格線與稀疏右軸均存在；可見冗餘圖表標題為 0 |
| [GitHub Pages Actions Run 78](https://github.com/9908gg-art/gugopro-academy/actions/runs/32732000522) | `completed / success` |

正式桌面回歸截圖：R:R `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-20-56_1406.webp`；網格 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-21-24_9912.webp`。本輪所有行情均為公開資料教育用途；股票／ETF 仍受 Yahoo Finance CORS、休市與資料延遲影響，網格歷史模擬不等同交易所撮合，也不構成投資建議。


## 十三、本輪 UI 細節修正：輸入框、下拉選單與網格控制列（2026-08-24）

本輪針對商品搜尋與控制列的實際可用性再做局部收斂。R:R 的 `#rr-symbol-search` 在桌面版限制為 `180px`（不超過 180px），載入按鈕固定為 62px；輸入框保留放大鏡，但將文字左內距明確設為 `36px`，避免 `BTCUSDT`、股票代碼或台股 ETF 代碼壓在 Icon 上。手機寬度低於 560px 時，輸入框改為容器內滿寬，以維持觸控可用性，仍保留 36px 安全左距。

R:R 與網格工具的所有工具內 `<select>` 與 `<option>` 均加入深色高對比樣式：select 使用 `#1a1f2c` 背景與白色文字，option 使用 `#141824` 背景與 `#f8fafc` 文字，選取狀態仍維持深色背景，並指定 `color-scheme: dark`。這涵蓋兩頁的快速商品、週期、模式與 R:R Scanner 篩選下拉，避免 Chromium、Firefox 或手機原生下拉在白底上顯示淺色文字。

網格 HUD 的「載入更早歷史」按鈕已從 HTML 移除，並同步移除腳本對該按鈕的 click／disabled 綁定；圖表原本的向左捲動自動載入歷史邏輯仍保留，因此刪除的是無作用的控制按鈕，不是長歷史能力。兩頁資產 query string 已更新為 `ui-detail-fix-20260824`，以避免正式站沿用前一輪 CSS／JS 快取。

| 回歸項目 | 實測結果 |
|---|---|
| R:R 商品輸入 | `width=180px`、`max-width=180px`、`padding-left=36px`、`font-size=16px`；載入按鈕 62px；文字與 Icon 無重疊 |
| R:R select 對比 | quick selector 與 Scanner select 實際背景 `rgb(26,31,44)`、文字白色、`color-scheme=dark`；option 白字深底 |
| 網格 select 對比 | quick selector 180px、16px；週期 104px、模式 100px；三者皆為深色白字，option 白字深底 |
| 網格冗餘按鈕 | `#grid-load-older` 不存在；頁面按鈕僅保留必要的「更新行情」與導覽控制，未殘留歷史按鈕綁定 |
| ETHUSDT 切換 | 本地網格 quick selector 展開後選擇 ETHUSDT 成功，Binance K 線達 3,000 根、WebSocket 已連線、網格統計與原生線同步更新 |
| 375px RWD | R:R 與網格 `bodyScrollWidth=367`、`documentScrollWidth=367`、`overflow=false`；兩頁均無水平溢出 |
| 靜態驗證 | `validate_site.py`、兩個核心 JS 與全站 JS 語法檢查、`git diff --check` 均通過；驗證器 `errors=0` |

本輪本地截圖：R:R `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-47-50_3800.webp`；網格下拉展開 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-49-16_6375.webp`；ETHUSDT 網格 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_13-49-38_9489.webp`。正式站發布後將補上本輪提交 hash 與 Pages workflow。


## 十四、本輪細節修正正式部署結論（2026-08-24）

本輪功能提交為 `32db21e`，commit message 完全符合使用者指定內容：`Manus AI: fix symbol input overlap and width, fix select dropdown contrast, and remove redundant grid buttons`。GitHub Pages workflow Run 82（[workflow ID 32735220034](https://github.com/9908gg-art/gugopro-academy/actions/runs/32735220034)）已由 `main` 觸發並完成 `completed successfully`。

| 正式頁面 | 本輪核對結果 |
|---|---|
| [R:R 細節修正版](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=ui-detail-fix-20260824) | 商品輸入文字與放大鏡保持 36px 安全距離；桌面輸入框收斂為 180px、載入按鈕 62px；quick selector 與 Scanner select 均為深色白字；BTCUSDT 載入 3,000 根公開 K 線並顯示 Binance ticker |
| [網格細節修正版](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=ui-detail-fix-20260824) | quick selector／週期／模式均為深色白字；`#grid-load-older` 已移除；BTC/USDT 載入 3,000 根公開 K 線、WebSocket 已連線，費後單格利潤率約 0.81% |
| [GitHub Pages Run 82](https://github.com/9908gg-art/gugopro-academy/actions/runs/32735220034) | `completed successfully` |

本輪本地回歸在桌面 Chromium 實測 R:R 商品輸入框 `width=180px`、`max-width=180px`、`padding-left=36px`、`font-size=16px`；R:R 與網格 select 實際背景為 `rgb(26,31,44)`、文字白色，option 為深色背景與白字。375px 同源 iframe 測試兩頁均 `bodyScrollWidth=367`、`documentScrollWidth=367`、`overflow=false`。網格 quick selector 展開後選擇 ETHUSDT 成功，重新取得 3,000 根歷史、WebSocket 與網格統計；AAPL 安全切換路徑亦維持既有 Yahoo／fallback 提示。

正式桌面截圖為：R:R `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-54-10_1226.webp`；網格 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_13-54-49_2401.webp`。本輪所有行情均為公開資料，可能受 CORS、休市、延遲或斷線影響；網格歷史回放與 R:R 點位僅供教育與研究，不構成投資建議。


## 十五、本輪智慧商品搜尋與全市場分類快選升級（2026-08-24）

本輪將 R:R 與網格工具的商品控制列升級為即時模糊搜尋與自動補全。使用者輸入至少 1 個字元即可取得候選；每筆候選以商品代號、全名、市場大分類與細分類呈現，例如 `BTCUSDT · Bitcoin / Tether · 加密貨幣 · 主流公鏈`、`0050.TW · 元大台灣50 · 台股與台股 ETF · 人氣高股息／市值 ETF` 與 `NVDA · NVIDIA · 美股與指數 ETF · 科技巨頭`。候選清單採 absolute 浮動定位與高 z-index，不會推擠 HUD 或 K 線圖；滑鼠點擊、ArrowUp／ArrowDown、Enter 與 Escape 均已接入既有商品載入管線。

兩個工具的原生快速商品選單均改用三組 `<optgroup>`：`加密貨幣 · Crypto Assets`、`台股與台股 ETF · Taiwan Stocks & ETFs`、`美股與指數 ETF · US Equities & Global ETFs`，共 28 個熱門標的。加密貨幣涵蓋 BTCUSDT、ETHUSDT、SOLUSDT、BNBUSDT、DOGEUSDT、XRPUSDT、ADAUSDT、AVAXUSDT、LINKUSDT、SUIUSDT；台股與 ETF 涵蓋 2330.TW、2317.TW、2454.TW、0050.TW、0056.TW、00878.TW、00919.TW、00929.TW；美股與全球 ETF 涵蓋 AAPL、MSFT、NVDA、TSLA、GOOGL、AMZN、SPY、QQQ、SOXX、TLT。R:R 與網格共用一致的 metadata、搜尋比對與載入同步行為。

| 回歸項目 | 本輪實測結果 |
|---|---|
| R:R `BT` autocomplete | 顯示 BTCUSDT、Bitcoin / Tether、加密貨幣、主流公鏈；候選為浮動清單，不推擠圖表 |
| 網格 `NV` autocomplete | 顯示 NVDA、NVIDIA、美股與指數 ETF、科技巨頭；ArrowDown 後 Enter 會同步 quick selector、搜尋欄與 HUD，觸發 NVDA 載入 |
| 分類快選 | R:R 與網格均有 3 組 optgroup、28 個 option；R:R 直接選 NVDA 後進入 Yahoo Finance 載入流程 |
| 深色對比 | autocomplete 使用深色面板與白字；工具 select／option 延續深色高對比規則 |
| 手機版 | 首次量測發現網格 market row 在 720px 以下未覆蓋 desktop 四欄規則，已修正為單欄；最新 R:R／網格 `bodyScrollWidth=367`、`overflow=false` |
| 靜態檢查 | `validate_site.py` `errors=0`；兩個核心 JS、`app.js`、`advanced-tools.js` 語法檢查與 `git diff --check` 通過 |

本輪本地操作截圖包括：R:R `BT` autocomplete `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-38-18_5753.webp`、網格 `NV` autocomplete `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-39-44_9786.webp`、網格 ArrowDown／Enter 後狀態 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-40-35_7528.webp`、R:R optgroup 展開 `/home/ubuntu/screenshots/127_0_0_1_2026-08-24_14-46-22_7658.webp`。正式部署完成後將在下一節補上最終提交與 Pages workflow。


## 十六、本輪智慧搜尋正式部署結論（2026-08-24）

本輪功能提交為 `8528a10`，commit message 完全符合使用者指定內容：`Manus AI: implement instant symbol autocomplete search and multi-category quick selector for R:R and Grid tools`。GitHub Pages Run 84（[workflow ID 32741183018](https://github.com/9908gg-art/gugopro-academy/actions/runs/32741183018)）的 build、report-build-status 與 deploy jobs 均顯示 `Status Success`，正式部署入口為 [academy.gugopro.com](https://academy.gugopro.com/)。

| 正式頁面 | 本輪核對結果 |
|---|---|
| [R:R autocomplete](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=autocomplete-search-20260824) | `00` 即時顯示 0050.TW、0056.TW、00878.TW、00919.TW、00929.TW，以及名稱比對出的 SPY／QQQ；每列具代號、全名、市場大分類與細分類；BTC 同期 3,000 根 K 線與 Binance ticker 正常 |
| [網格 autocomplete](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=autocomplete-search-20260824) | `NV` 即時顯示 NVDA／NVIDIA／美股與指數 ETF／科技巨頭；ArrowDown 後 Enter 同步搜尋框、quick selector 與 HUD；BTC 3,000 根 K 線、WebSocket、網格統計與右軸標籤正常 |
| [Pages Run 84](https://github.com/9908gg-art/gugopro-academy/actions/runs/32741183018) | `completed successfully`；commit head `8528a10` |

本輪正式操作截圖為 R:R `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_14-56-33_3657.webp` 與網格 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_14-57-10_2855.webp`。公開行情仍可能受 Binance／Yahoo Finance CORS、休市、資料延遲或連線狀態影響；股票與 ETF 不可用時，頁面維持安全 fallback 與狀態提示。所有 R:R 與網格數字僅供教育與研究，不構成投資建議。


## 十七、最終文件同步部署（2026-08-24）

最後研究筆記同步提交為 `448348c`，其 Pages Run 86（[workflow ID 32742573873](https://github.com/9908gg-art/gugopro-academy/actions/runs/32742573873)）已顯示 `Status Success`，build、report-build-status 與 deploy jobs 全部完成。最終 `main` 已與 `origin/main` 同步；功能本體仍由 `8528a10`（指定 commit message）提供，正式工具可由 [R:R autocomplete](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=autocomplete-search-20260824) 與 [網格 autocomplete](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=autocomplete-search-20260824) 開啟。最終正式站操作畫面分別為 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-02-24_8126.webp` 與 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-03-22_6111.webp`。

## 十八、本輪自訂觀察清單與全狀態持久化本地驗證（2026-08-24）

本輪實作將兩頁工具的商品列擴充為純前端「加入自訂／管理清單」控制。共享 `tools/watchlist.js` 使用 `gugopro_academy_watchlist_v1` 保存最多 50 筆標的 metadata；每頁快選保留原有三個靜態市場 optgroup 與 28 個熱門商品，另以獨立 `⭐ 我的自訂清單` optgroup 呈現使用者加入的任意代碼。管理面板提供載入、單筆刪除、清空、關閉與空狀態提示，並以 CustomEvent／storage event 同步同源頁面。

R:R 使用 `gugopro_rr_state_v1` 保存目前商品、週期、Entry、Stop、Target、單筆風險百分比、帳戶資金與 Entry 是否跟隨即時價；Grid 使用 `gugopro_grid_state_v1` 保存目前商品、週期、Lower、Upper、Grids、模式、投資額、SL、TP、單邊費率與自訂區間狀態。行情載入完成後才套用已保存的參數，避免自動波段預設覆蓋使用者設定；商品／週期切換、輸入變更、行情成功與 fallback 路徑均會保存。

| 驗證項目 | 本地結果 |
|---|---|
| R:R 加入任意代碼 | 輸入 `XYZ` 後按「加入自訂」，計數由 0 變為 1，`rr-watchlist-options` 出現 `XYZ`，localStorage metadata 以 Yahoo Finance fallback 保存 |
| R:R 重整 hydration | 重開同一 URL 後，搜尋欄與 Entry `79902.86`、Stop `57800.19`、Target `82850`、風險 `1`、資金 `500000` 保持一致；頁面仍可載入公開行情或 fallback |
| Grid 完整參數保存 | 設定 1h、Lower `65000`、Upper `90000`、Grids `31`、等比、投資 `25000`、SL `60000`、TP `98000`、費率 `0.08`，主控台 payload 與 DOM 完全一致 |
| Grid 重整 hydration | 重開後上述 1h、BTCUSDT 與八個輸入／選單值均還原；網格輸出仍為有限數值，既有原生 Y 軸標籤規則不變 |
| 清單管理 | 管理面板列出 `IBIT`／`XYZ`，單筆刪除後計數回到 1；清空後空狀態顯示、計數與共享清單回到 0 |
| 375px RWD | R:R 與 Grid 同源隱藏 iframe 均測得 `body/documentElement.scrollWidth=367`、`overflow=false`；watchlist controls 與自訂 optgroup 均存在 |
| 靜態與語法檢查 | `python3 validate_site.py` 顯示 `errors=0`；`node --check` 通過 watchlist、R:R、Grid 三個腳本；`git diff --check` 通過 |

所有清單與工具參數均留在使用者瀏覽器的 localStorage，不會送到本站後端；清除網站資料、瀏覽器資料或使用私密瀏覽環境可能移除或拒絕保存。Binance／Yahoo Finance 只提供公開行情，可能受 CORS、休市、延遲、頻率限制或網路狀態影響。本工具數字僅供教育與研究，不構成投資建議、交易指令或收益保證。

## 十九、正式站最終部署與驗證（2026-08-24）

本輪功能提交為 `35f942b`，commit message 完全符合指定文字：`Manus AI: implement custom watchlist management and full state/parameter local storage persistence for R:R and Grid tools`。GitHub Pages [Run 88](https://github.com/9908gg-art/gugopro-academy/actions/runs/32747280462) 對應此 commit，最終顯示 `Status Success`；build 23 秒、report-build-status 6 秒、deploy 9 秒，正式入口為 [academy.gugopro.com](https://academy.gugopro.com/)。

| 正式頁面 | 最終核對結果 |
|---|---|
| [R:R 持久化版](https://academy.gugopro.com/tools/risk-reward-calculator.html?v=watchlist-persistence-20260824) | 新 cache-bust 版本已生效；完整 HUD、28 商品／三個靜態 optgroup、`⭐ 我的自訂清單`、加入／管理控制均出現。輸入 `IBIT` 並加入後，管理計數為 1，正式來源的自訂 optgroup 同步出現。頁面可取得 BTCUSDT 3,000 根 K 線與 ticker。 |
| [Grid 持久化版](https://academy.gugopro.com/tools/grid-trading-calculator.html?v=watchlist-persistence-20260824) | 由 R:R 建立的 `IBIT` 在同源 Grid 頁面的自訂 optgroup 與管理計數中可見；BTC／USDT K 線、WebSocket ticker、3,000 根歷史、動態網格線與右軸標籤簡化規則均生效。 |
| [Run 88](https://github.com/9908gg-art/gugopro-academy/actions/runs/32747280462) | `Status Success`；commit head `35f942b`；build、report-build-status、deploy 全部成功。唯一 annotation 為 GitHub Actions Node.js 20 deprecation warning，與本輪程式碼無關。 |

正式站截圖：R:R HUD 與 IBIT 加入清單為 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-52-57_4481.webp`；Grid 跨工具自訂清單、K 線與動態網格為 `/home/ubuntu/screenshots/academy_gugopro_2026-08-24_15-53-30_4257.webp`；Pages Run 88 Success 為 `/home/ubuntu/screenshots/github_2026-08-24_15-53-52_1998.webp`。所有清單與 R:R／Grid 參數只保存在使用者瀏覽器 localStorage；清除網站資料或瀏覽器資料會移除保存內容，本站不接收這些參數。公開行情仍可能受到 Binance／Yahoo Finance CORS、休市、延遲、頻率限制或網路狀態影響；工具輸出僅供教育與研究，不構成投資建議、交易指令或收益保證。


## 二十、全球商品預設、全市場搜尋與 TradingView 圖表升級（2026-08-25）

本輪針對 `tools/risk-reward-calculator.html`、`tools/grid-trading-calculator.html` 完成全球化商品與圖表引擎升級。兩頁快速商品選單已移除預設台股／台股 ETF，改為 15 個 24 小時或全球高流動性預設：BTCUSDT、ETHUSDT、SOLUSDT、BNBUSDT、DOGEUSDT、XRPUSDT 六個加密資產；NQ、ES、GOLD、OIL 四個全球指數／期貨／大宗商品；NVDA、TSLA、AAPL、MSFT、AMZN 五個美股科技權值。額外的 QQQ、SPY、XAUUSD、EURUSD、BTCUSD、ETHUSD 等別名保留在搜尋 catalog，但不擠入預設選單。

搜尋功能不再只限於內部 catalog。兩頁均以 `cleanSymbol()` 正規化輸入，autocomplete 命中 catalog 時顯示商品名稱、市場與分組；未命中且輸入至少兩個字元時，會顯示「任意標準代碼」候選，按下即可載入使用者輸入的 ticker。這讓 SOLUSDT、XAUUSD、NVDA、EURUSD、QQQ 及未列入 catalog 的標準代碼均可由搜尋欄直接進入載入流程，並與既有 watchlist／localStorage selected symbol 記憶相容。

| 行情路由 | 觸發條件 | 圖表與即時資料行為 |
|---|---|---|
| Binance Public API | catalog 中 `binance: true` 的 Binance-compatible USDT 加密資產 | REST K 線、WebSocket ticker／Kline、Lightweight Charts 原生價格線、長歷史向左載入與既有 Grid／R:R overlays。 |
| TradingView Advanced Chart | 所有非 Binance 加密代碼、全球指數／期貨／商品、外匯與美股等非 Binance 商品 | 直接建立 `https://www.tradingview.com/widgetembed/?symbol=EXCHANGE:NAME...`，依目前週期轉換 `interval`；HUD、R:R 數值、網格參數與 localStorage 仍由本頁純前端控制。 |

TradingView symbol mapping 已涵蓋 `NASDAQ:NVDA`、`CME_MINI:NQ1!`、`CME_MINI:ES1!`、`OANDA:XAUUSD`、`TVC:USOIL`、`FX:EURUSD`、`AMEX:SPY`、`NASDAQ:QQQ`、`COINBASE:BTCUSD` 等格式，並依 TradingView 官方 [Advanced Chart widget 文件](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/)、[markets 目錄](https://www.tradingview.com/widget-docs/markets/) 與 [dynamic symbols 教學](https://www.tradingview.com/widget-docs/tutorials/iframe/build-page/dynamic-symbols/) 實作；Binance 分流仍依官方 [Spot WebSocket 文件](https://developers.binance.com/en/docs/binance-spot-api-docs/web-socket-streams) 保持公開端點設計。

| 本地驗證項目 | 結果 |
|---|---|
| R:R 全球 default 與 Binance 回歸 | 乾淨來源顯示三組 global optgroup、無預設台股；BTCUSDT 成功取得約 2,000 根並補足至 3,000 根 K 線，Binance ticker／Lightweight Charts／原生價格線正常。 |
| R:R XAUUSD | autocomplete 顯示 GOLD 與 XAUUSD 全球候選；選取後直接顯示 TradingView Advanced Chart，iframe query 為 `symbol=OANDA:XAUUSD`、`interval=D`，不建立 Binance WebSocket。 |
| Grid XAUUSD／EURUSD | XAUUSD 與 EURUSD 均可由搜尋選取；TradingView iframe 分別使用 `OANDA:XAUUSD` 與 `FX:EURUSD`，1h 週期使用 `interval=60`，頁面狀態顯示 TradingView Advanced Chart 已待命。 |
| 全球商品 localStorage hydration | Grid 以 EURUSD／1h 及 Lower 1800、Upper 2400、Grids 25、等比、投資 12000、SL 1650、TP 2750、費率 0.08 測試；不帶 URL query 重整後 selected symbol、週期與全部參數一致還原。 |
| 375px RWD | R:R 與 Grid 同源隱藏 iframe 均為 `body/documentElement.scrollWidth=367`、`overflow=false`；watchlist、TradingView container 與全球搜尋 placeholder 均存在。 |
| 靜態／腳本檢查 | `python3 validate_site.py` 為 `errors=0`；R:R、Grid、watchlist、`app.js`、`advanced-tools.js` 均通過 `node --check`；`git diff --check` 通過。 |

因 TradingView Advanced Chart 是跨來源 iframe，瀏覽器安全模型不允許本站將 Lightweight Charts 的原生價格線或 Grid 虛線直接覆蓋在外部 TradingView canvas 上；因此 Binance 路由保留既有原生 overlays，TradingView 路由則提供完整全球圖表，而本頁 HUD／R:R 試算／網格參數仍獨立運作。這是跨來源嵌入的技術邊界，不是後端或 API key 限制。所有搜尋、watchlist 與參數仍只保留在使用者瀏覽器 localStorage，本站不接收帳戶資金、風險參數或網格設定；清除網站資料或瀏覽器資料會移除保存內容。公開行情與 TradingView widget 可能受網路、休市、地區、資料延遲、CORS 或供應商限制影響，工具輸出僅供教育與研究，不構成投資建議、交易指令或收益保證。


## 二十一、其他財經工具單屏緊湊化與 API Key 清理（2026-08-25）

本輪針對 R:R／Grid 以外的財經計算工具完成收斂，範圍包括 `tools/index.html` 的九個本地計算面板、`tools/compound-interest.html` 複利獨立頁與 `tools/etf-dividend-calculator.html` ETF DRIP 獨立頁。`risk-reward-scanner.html` 是導向新版 R:R Scanner 的相容轉址頁，`tradingview-guide.html` 是資源導覽頁，兩者沒有本機 AI 設定或計算 API Key 面板，因此未做不必要改動；R:R／Grid 專用 HUD、watchlist、行情與原生圖表行為保持不變。

本輪已徹底移除工具頁底部「本機 AI 設定（選填）」／Gemini API Key 面板、相關輸入框、`saveGugoProGeminiKey`／`getGugoProGeminiKey` 函式、`gugopro_gemini_api_key` localStorage 存取與 API Key 面板 CSS。工具總頁與 advanced-tools.js 仍只處理瀏覽器端金融公式，不再維護無實際用途的 AI 金鑰狀態。

| 版面範圍 | 收斂內容 |
|---|---|
| 工具總頁九個面板 | Hero、工具卡、分頁與 active calculator 改為 compact order；桌面採三欄參數網格，輸入標籤 14px、數值輸入 16px；結果卡保留高對比 14px 輸出。 |
| 複利獨立頁 | 桌面改為左側參數、右側結果／摘要的雙欄；手機修正 legacy header 橫溢出，縮短 hero 與輸入控制高度，保留 16px 數字輸入，核心摘要優先呈現。 |
| ETF DRIP 獨立頁 | 桌面輸入／結果並排，手機六項參數與六個結果指標採三欄緊湊網格；說明、狀態提示與圖表保留於核心操作下方，不犧牲輸入與結果字級。 |
| 資料與隱私 | 本輪沒有新增後端、資料庫、API key 或資料上傳；既有計算仍在瀏覽器內完成。 |

### 本地驗證

使用 `single-screen-tools-20260825` cache-bust 重新載入本地頁面。靜態搜尋 `tools/index.html`、複利頁、ETF DRIP 頁、advanced-tools.js／CSS 與 style.css 的 API Key markers 結果為零；`python3 validate_site.py` 顯示 `errors=0`，所有既有 JavaScript `node --check` 與 `git diff --check` 通過。

| 測試視窗 | 驗證結果 |
|---|---|
| 工具總頁 390×844 | 九個計算面板逐一切換並執行後，結果 bottom 均不超過 640px；`scrollWidth=382`、API Key marker=false。 |
| ETF DRIP 390×844 | 輸出卡 bottom=774；API Key marker=false，無水平溢出。 |
| ETF DRIP 375×667 | 最終輸入項 bottom=424、核心輸出卡 bottom=661；`scrollWidth=367`、無水平溢出。 |
| 複利 390×844 | 最後參數與核心摘要均在第一屏；header overflow 已修正。 |
| 複利 375×667 | 最後參數 bottom=658、核心摘要 bottom=437、`scrollWidth=367`；計算模式按鈕與核心摘要皆可在首屏使用／查看。 |

> 「單一屏幕」本輪定義為核心輸入、操作與計算結果在指定第一屏優先可見；完整圖表、說明、策略指南、合作資源與頁尾仍保留於下方，避免以隱藏內容犧牲教學完整性。390／375px 測試中的首屏高度依瀏覽器 viewport 而定，實際字型、系統瀏覽器工具列與使用者縮放設定可能令可見範圍不同。

正式部署後將以版本化 CSS／JS URL 驗證工具總頁、複利與 ETF DRIP 頁，並檢查 API Key marker、第一屏核心區與水平溢出結果。所有計算輸出僅供教育與研究，不構成投資建議、交易指令或收益保證。


## 二十二、首頁知識樹極致緊湊重構與按鈕對比修復（2026-08-25）

本輪針對首頁 `index.html#knowledge-tree` 完成高資訊密度重構。原有 12 張知識樹卡片、五個分類篩選、搜尋功能與各指南連結均保留；R:R／Grid HUD、watchlist、行情、TradingView 與原生圖表腳本未修改。首頁資產 URL 更新為 `knowledge-tree-compact-20260825`，避免正式站沿用舊版 CSS／JS 快取。

篩選列現在採緊湊水平布局：桌面搜尋框與分類 chip 並排，搜尋框高度 38px、chip 最低高度 36px，與卡片群的間距收斂至 12–14px。啟用分類按鈕強制採 `#f97316` 橘底與 `#ffffff` 純白粗體文字，數量 badge 同樣繼承白色；未啟用狀態使用深色底與淺灰字，hover／focus-visible 提供清晰的橘色邊框與白字回饋，解決原本橘色背景／橘色文字的對比衝突。篩選按鈕同步補上 `role="tab"` 與 `aria-selected`，互動腳本只在知識樹範圍內更新狀態。

| 版面 | 本輪收斂結果 |
|---|---|
| 桌面 1280px | 4 欄；卡片 padding 22px→14px、高度 316px→214px；知識樹核心區約 1282px→877px，縮減約 31.6%；搜尋／分類列 38px；商品標題 17px、描述與關鍵字 13px。 |
| 平板 800px | 3 欄；卡片寬約 241px；搜尋／分類列高度 38px；document/body scrollWidth=792，無水平溢出。 |
| 手機 390×844 | 2 欄；卡片寬約 163px；搜尋列高度 38px、toolbar 高度 120px；document/body scrollWidth=382，無水平溢出。 |
| 對比與互動 | 桌面與兩個響應式斷點點選「股票市場」均顯示 3 張卡片、`aria-selected=true`、完成 transition 後為橘底白字；輸入 `ETF` 均篩出 ETF 單一卡片。 |

本地 validator `python3 validate_site.py` 回報 `errors=0`；`app.js`、`advanced-tools.js`、ETF、R:R、Grid、watchlist 等既有 JavaScript 均通過 `node --check`，`git diff --check` 亦通過。正式部署後將以版本化 URL 核對首頁 DOM、computed style、搜尋／分類互動與正式 Pages workflow；所有知識樹內容仍屬教育用途，不構成投資建議。

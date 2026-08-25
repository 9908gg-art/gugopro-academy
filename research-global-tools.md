# 第02至13分類公開資料研究

- FRED API 文件：https://fred.stlouisfed.org/docs/api/fred/。series observations 可讀取經濟序列；本工具採 fredgraph.csv 讀取 DGS2、DGS10、DGS30、T10Y2Y、WALCL、M2SL、CPIAUCSL、DGS3MO。
- SEC EDGAR API 文件：https://www.sec.gov/edgar/sec-api-documentation。data.sec.gov 提供 submissions 與 XBRL companyfacts，不需要 API key；官方文件明確說 data.sec.gov 不支援瀏覽器 CORS，因此工具必須顯示錯誤／重試，不能假裝取得資料。美股 SEC 工具以公開申報索引為主，必要時回鏈到原始 filing。
- Binance Futures API 文件：https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api。資金費率、global long/short account ratio 與 allForceOrders 為公開市場資料；強平端點是可取得事件樣本，不等同全市場總清算額。
- FinMind 文件：https://api.finmindtrade.com/docs。平台以台股為主，提供 TaiwanStockPrice、TaiwanStockPER、TaiwanStockDividend、TaiwanStockInstitutionalInvestorsBuySell 等資料集；既有台股工具已使用並確認瀏覽器 CORS。
- Yahoo chart endpoint：既有專案使用 https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=...&interval=... 取得跨市場價格與 adjusted close；此端點為公開、非正式開發者 API，工具需把 adjusted close／NAV 顯示為代理並提示端點可能變更。Yahoo options chain 的 `query2.finance.yahoo.com/v7/finance/options/{symbol}` 用於可得時的 IV/PCR；若不可得，只呈現 HV 和明確資料限制。
- 2026-08-25 shell 實測：Yahoo chart SPY 成功返回 metadata／歷史資料；Binance funding BTCUSDT 成功返回 fundingRate、markPrice；SEC NVDA submissions 成功返回公司與 filing metadata。Yahoo quoteSummary 需要 crumb，不能作為核心資料端點。FRED graph CSV 在命令列可能遇到傳輸／壓縮回應，因此瀏覽器層使用 Accept: text/csv，並設置清楚的錯誤狀態。
- 研究結論：可直接由瀏覽器使用的來源優先使用 Yahoo chart、FRED graph CSV、Binance public Futures REST、FinMind；SEC 公開資料在瀏覽器環境若 CORS 失敗，禁止以假數字替代，改顯示資料限制與 SEC 查證入口。房地產與 Kelly 沒有統一免 key 的即時端點，分別採使用者實際物件／銀行條件與使用者交易紀錄參數的透明數學模型，頁面明確標示其輸入性質。

## 本地 Tools Hub 回歸

2026-08-25 本地 `tools/index.html` DOM 驗證：31 張 `[data-tool-card]`、14 張 `[data-global-tool-card]`、14 個分類 tab；全部卡片為可聚焦的 `<a>` 或 `<button>`。Badge 計數為 all=31、equity=9、us=4、etf=7、fixed=4、funds=5、forex=4、commodities=2、futures=6、options=5、crypto=3、real-estate=5、macro=4、strategy=8。搜尋 `CPI` 顯示 1 張，切換 crypto 顯示 3 張，清除後恢復 all=31。第一張新卡目標為 `us-earnings-tracker.html`。

## 房地產工具本地回歸

本地 `real-estate-roi-cap-rate.html` 載入正常；頁面明確要求輸入實際物件與銀行條件，顯示 Cap Rate、NOI、DSCR 與 +1% 升息壓力。以測試值覆蓋價格、租金、費用率、LTV、利率、年限後，主狀態更新為「資料已更新」，Chart.js canvas client size 約 795×300；在 1280px viewport 下 `document.documentElement.scrollWidth=1272`，沒有水平溢位，且頁面不含 Gemini API Key 文案。

## Binance 工具回歸觀察

首輪測試誤用了顯示名稱組成的 `crypto-funding-liquidations.html`，回應 404；Tools Hub 實際連結與正確檔名為 `crypto-funding-rate-liquidations.html`，已確認頁面可載入。正確頁面在瀏覽器初次等待超過一個觀察週期仍顯示「載入中」，需檢查 fetch 是否缺少逾時或公開端點受限，不能以等待中的狀態作為成功。

Binance 頁面在逾時窗口後可從「載入中」轉為「資料載入失敗」，且結果區明確顯示 `HTTP 400`、重新載入提示與「不會以假數字補值」。目前 BTCUSDT 的 funding/ratio 請求至少有一個回傳 400，需要以 endpoint 回應內容與參數檢查原因；此錯誤狀態本身符合透明資料限制要求，但成功路徑仍需修正或清楚標示端點不可用。

重新載入 Binance 工具後，瀏覽器在公開端點等待期間仍維持載入中；前次逾時後顯示 `signal is aborted without reason`，表示至少一個請求受跨域或網路限制。已加入 funding/ratio `allSettled` 與 Yahoo/FRED/Binance 公開 proxy，但需進一步縮短 proxy 逾時並驗證瀏覽器是否能取得 funding；若不能，應快速顯示明確部分錯誤而不是長時間 loading。

Binance r4 回歸：移除直連預設 `Accept` header、加入兩個公開 proxy 並縮短 Binance timeout 後，瀏覽器仍在觀察窗口顯示載入中；目前不能宣稱瀏覽器成功取得 funding。下一步將避免讓頁面等待多個互相受限端點，改採可驗證的公開端點分層與總逾時，確保至少快速呈現 funding 可用或完整資料不可用的明確狀態。

## 美股財報工具回歸觀察

本地 `us-earnings-tracker.html` 可正常渲染 NVDA 預設選擇、Yahoo chart + SEC XBRL 說明、5 項 HUD、Chart.js 區域與 SEC／指南回鏈；初始觀察仍在等待公開請求，需等逾時或完成後記錄實際可用／不可用欄位。

美股財報頁在目前瀏覽器觀察窗口仍顯示載入中，尚未能宣稱 Yahoo 或 SEC 已由瀏覽器成功取得。這暴露出共享公開資料層的 fallback 可能等待過久；下一步需加入每個 loader 的總逾時與 async catch，讓跨域不可用時一定顯示 `資料載入失敗`／`部分資料已更新`，不留下無限 loading。

美股財報 r2 在共享總逾時修正後仍於瀏覽器觀察時顯示 loading，表示不只是 endpoint 延遲；需檢查頁面是否載入最新 runtime、Chart.js／外部腳本阻塞、或 loader 呼叫未被總逾時 wrapper 捕捉。下一步以 DOM 的 script src、runtime 版本與直接 console Promise 驗證定位。

## Kelly 工具本地回歸

本地 `trade-risk-kelly-criterion.html` 載入為數學模型路徑，不依賴行情端點。以帳戶 100,000、進場 100、停損 90、勝率 50%、平均獲利／平均虧損 1.5、單筆風險 1% 測試，結果為 Kelly 16.67%、半 Kelly 8.33%、風險股數 100、固定種子路徑跌破半數頻率 0.00%；狀態為「資料已更新／數學模型計算完成」，canvas client size 約 795×300，`scrollWidth=1272`（1280px viewport），無 Gemini API Key 文案。

首次以 4 個 iframe 連續掃描的瀏覽器腳本在 30 秒工具上限中止，主控台僅記錄 context canceled，不能據此判定頁面故障。後續改成每頁一個短輪詢（最多約 8–12 秒），逐頁保存終態，避免網路工具掃描本身超時。

## 單頁公開資料回歸

瀏覽器單頁 iframe 測試：`us-sec-insider-flow.html` 狀態「資料已更新」，detail 為 SEC submissions 已更新、最近申報 2026/8/24，結果長度 188；`etf-nav-premium-tracker.html` 狀態「資料已更新」，detail 為 Yahoo 價格已更新、2026/8/24、NAV 為 adjusted-close 代理，結果長度 162。兩頁 canvas client size 約 795×300、1280px iframe 下 `scrollWidth=1272`，無水平溢位。

ETF DRIP 修正後本地瀏覽器驗證成功：`0050.TW` 取得 Yahoo chart 公開股利事件 21 筆；顯示期初價格 US$17.50、最新價格 US$103.80、DRIP 終值 US$810,543.59、領現終值 US$661,225.77，圖表兩條路徑成功渲染。結果明確標示此為公開 events 的數學回測，不等同基金正式還原權息或實際稅費後報酬。

## FRED 瀏覽器回歸

FRED `fredgraph.csv` 在瀏覽器直連約 33ms 即因 CORS `Failed to fetch` 失敗；`corsproxy.io` 回應 HTTP 403 並明確表示免費方案不允許此 content type。債券 iframe 在 12 秒觀察時仍顯示 loading，因此 FRED 公開 CSV 目前不應宣稱瀏覽器 live data；必須確保頁面在 fallback／總逾時後快速顯示「FRED 無法由瀏覽器讀取」與重新載入，不以 0 或假曲線補值。Yahoo／SEC／Binance 可用性需分開記錄。

進一步定位：r2 頁面確實載入 `global-market-data.js`／`global-tools-runtime.js` r2；DRIP 的共享 loader 在等待後顯示直連與備援皆 abort。可是同一頁直接測試 `corsproxy.io` 的 Yahoo 0050.TW 10 年 chart events 成功回傳 HTTP 200、2,435 個價格點、21 筆股利事件，延遲約 19.3 秒。這代表 payload／proxy latency 而非資料不存在；DRIP 10 年查詢需改成較快的 5 年窗口或提高該 loader 的可用等待，並在超時時明確顯示限制。

DRIP r3 已使用五年視窗並載入最新共享 JS；在約十秒觀察點仍為 loading，這與先前 corsproxy 0050.TW 約 19 秒回應一致。需再等到共享 30 秒總逾時或完成，並以實際終態記錄，不把中途 loading 當成錯誤或成功。

DRIP r3 完整終態：五年 Yahoo chart 查詢在頁面總逾時後顯示「公開端點無法由瀏覽器讀取」並保留重試與不補假數字說明；雖同一瀏覽器直接測試 corsproxy 最終曾取得 0050.TW 資料，但延遲約 19 秒且不穩定，故不可把此頁當作每次必成功。終態已從 loading 正確轉成可見錯誤。

## Jina bridge 與 DRIP r4 回歸

Jina bridge 回應雖有 Markdown 包裝，但可從 `Markdown Content:` 後解析為原始 Yahoo chart JSON。r4 頁面測試成功：`0050.TW` 五年視窗取得 11 筆公開股利事件，狀態為「資料已更新」，顯示 DRIP 終值 US$352,576.71、領現終值 US$324,474.65，Chart.js 兩條路徑與結果卡正常。

FRED r4 loader 直接測試：`GlobalMarket.fredCsv(['DGS2','DGS10','DGS30','T10Y2Y'])` 約 10.1 秒後回傳「公開端點無法由瀏覽器讀取（Failed to fetch；備援：signal is aborted without reason）」；因此頁面應在相同窗口顯示可見錯誤，而非保留 loading。此結果符合不補假值要求，但 FRED live data 在此瀏覽器不可宣稱成功。

Yahoo r4 loader 直接測試：`GlobalMarket.yahooHistory('NVDA','2y','1d')` 透過 Jina bridge 約 2.46 秒成功取得 501 筆價格點與 8 筆股利事件。因此美股財報 iframe 在 15 秒仍 loading 不是 Yahoo 資料不存在，需另查 SEC promise、iframe cache／load race 或 loader 終態更新問題。

美股財報 r4 最終回歸成功：NVDA 頁面狀態「資料已更新」，detail 顯示 Yahoo 行情 + SEC XBRL；最新收盤 US$212.25、近一年價格報酬 23.78%、最新 SEC EPS 2.39 USD、營收 YoY 74.60%，Chart.js 價格／EPS 圖表正常。財報窗口因申報日期口徑不可得而顯示破折號，沒有補值。

基金／外匯單頁回歸：`forex-interest-carry-calc.html` 狀態「部分資料已更新」，detail 為 Yahoo FX 已更新、FRED 利率代理不可得、未補 carry；結果長度 159，canvas 約 795×300、無水平溢位。`fund-sharpe-drawdown-analyzer.html` 在 15 秒觀察點仍顯示 loading，待進一步確認 FRED／Yahoo allSettled 終態。

商品／期貨單頁回歸：`commodity-gold-oil-ratio.html` 狀態「資料已更新」，detail 為 Yahoo GC／SI／CL 已更新、500 個共同序列；`futures-basis-term-structure.html` 狀態「資料已更新」，detail 為 Yahoo 期貨 + 現貨指數已更新、400 個共同交易日。兩頁 canvas 約 795×300、結果區有內容、1280px iframe `scrollWidth=1272`。

選擇權／Binance 回歸：`options-implied-volatility-rank.html` 狀態「部分資料已更新」，detail 為 SPY 價格已更新、options chain 不可得、未補假 IV／PCR；canvas 約 795×300、結果有內容。Binance r5 狀態「資料載入失敗」，detail 直接呈現 Binance restricted-location 公開回應訊息，結果區可見重試與不補假數字說明，不再出現 `(funding || []).map is not a function`；canvas 仍有正尺寸、`scrollWidth=1272`。

宏觀／手機回歸：`macro-liquidity-cpi-tracker.html` 於 12 秒觀察點仍在等待 FRED／Yahoo，需以 FRED 既有 10 秒 loader 終態再確認；不應宣稱 live macro data。390×844 同源 iframe：`real-estate-roi-cap-rate.html` 與 `trade-risk-kelly-criterion.html` 均 `scrollWidth=382`、viewport=390、canvas client 約 340×250、6 個輸入且無 Gemini API Key 文案；兩頁狀態均為資料已更新。

宏觀／基金完整終態：`macro-liquidity-cpi-tracker.html` 20 秒單頁測試轉為「資料載入失敗」，detail 為 FRED `Failed to fetch` 與 proxy abort，結果區有重試且不補 WALCL／M2／CPI。`fund-sharpe-drawdown-analyzer.html` 20 秒測試為「部分資料已更新」：Yahoo 價格計算年化報酬 11.88%、年化波動 17.53%、Sharpe 0.68（RF 不可得）、Sortino 0.98、MDD -25.36%（2022/10/12），且結果明確寫出 FRED 無風險率未載入、Sharpe 暫以 RF=0；圖表與版面正常。

## 390px RWD 回歸

在 390×844 同源 iframe：`tools/index.html` 有 31 張卡、14 張新公開資料卡，`scrollWidth=382`；`etf-nav-premium-tracker.html` 與 `etf-drip-backtester.html` 均為 `scrollWidth=382`、canvas 約 340×250，且兩者狀態為資料已更新。`guides/etf.html` 有 2 個 global inline links 與 2 個 global CTAs，`scrollWidth=382`；既有 `risk-reward-calculator.html` 與 `grid-trading-calculator.html` 同樣為 382px，保留風報比／網格內容，未因新批次產生水平溢位。

## Production Hub hotfix 回歸

在 `https://academy.gugopro.com/tools/index.html?qa=c0bc06f`：DOM 驗證 31 張卡、14 張全球卡、14 個分類 tab；每張全球卡為直接 `.html` href，icon／kicker／title metadata 均正常，hero 的「13 類市場導航 · 14 張公開資料工具」只出現一次。搜尋 `財報、淨值、Sharpe、Carry、金油、Basis、IV、Funding、Cap Rate、CPI、Kelly` 逐一 render 後各命中 1 張（Kelly 命中 2 張，因既有與新工具同時相關）；點選 02 美股分類命中 4 張；1280px `scrollWidth=1272`。

Production 美股財報回歸（c0bc06f）：`us-earnings-tracker.html?qa=c0bc06f` 取得 Yahoo + SEC XBRL，NVDA 最新收盤 US$212.15、近一年價格報酬 23.69%、SEC EPS 2.39 USD、營收 YoY 74.60%，Chart.js 價格／EPS 圖正常。財報窗口因申報日期不可得維持破折號，未補值。

Production 390×844 最終回歸（c0bc06f）：同源 iframe 的 Tools Hub 有 31 張卡／14 張全球卡，`scrollWidth=382`；NVDA 美股財報頁狀態「資料已更新」、`scrollWidth=382`、canvas 約 340×250；ETF DRIP 頁取得 Yahoo 11 筆公開股利事件、狀態「資料已更新」、結果長度 161、`scrollWidth=382`、canvas 約 340×250。

## 2026-08-26 章節工具擴充研究

本次重新盤點時確認，現有 16 篇指南中第 02–13 類各有多個實質章節，但多數章節仍共用同一個工具入口，未達「每章節一個可操作實務工具」的閉環要求。正式 Tools Hub 目前有 31 張卡，但 13 個分類 badge 的數字是整個 Hub 卡片的分類歸屬計數；部分類別包含跨類既有工具，需在 UI 明確說明並以實際 `data-tool-category` DOM 計數為準。

FRED 官方 API 說明指出，FRED／ALFRED 可透過 HTTPS REST 以 XML 或 JSON 查詢資料；後續實作將保留公開序列的日期、頻率與缺值狀態，不在端點失敗時填入殖利率或宏觀數字。[FRED API Overview](https://fred.stlouisfed.org/docs/api/fred/overview.html)

SEC 官方 Developer Resources 說明，company submissions 與 extracted XBRL data 可透過 `data.sec.gov` 的 REST API 取得 JSON；官方同時要求有效率地下載、只取必要內容並控制請求速率。新增美股工具將維持 filing date、form、accession 與 XBRL fiscal period 的區分，不以申報密度推測買賣方向。[SEC Developer Resources](https://www.sec.gov/about/developer-resources)

Binance 文件頁由舊 URL 導向新版 catalog 路徑；既有 runtime 已驗證受限地區回傳 `{code,msg}` 時會顯示明確限制，而不是把錯誤物件當作陣列。新增或擴充加密工具仍只採成功解析的 public REST 欄位，清算不可得時維持破折號。[Binance USDⓈ-M Futures documentation](https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api)

## 第 02–13 類章節覆蓋稽核

指南目前已具備實質章節，但多數章節仍只共用一個工具入口：美股 4 章、ETF 4 章、債券 4 章、基金 4 章、外匯 4 章、商品 4 章、期貨 4 章、選擇權 4 章、加密資產 4 章、房地產 4 章、總經 4 章、實戰交易 5 章。需要改成每個章節至少有一個與該章公式／流程對應的工具，並保留跨章共用的 R:R／Grid 連結。

實際 canonical section ID：美股 `us-stocks-foundation/us-stocks-metrics/us-stocks-practice/us-stocks-risk`；ETF `etf-foundation/etf-metrics/etf-practice/etf-risk`；債券 `bonds-foundation/bonds-metrics/bonds-practice/bonds-risk`；基金 `funds-foundation/funds-metrics/funds-practice/funds-risk`；外匯 `forex-foundation/forex-carry/forex-hedging/forex-risk`；商品 `commodities-foundation/commodities-metrics/commodities-practice/commodities-risk`；期貨 `futures-foundation/futures-metrics/futures-practice/futures-risk`；選擇權 `options-foundation/options-metrics/options-practice/options-risk`；加密資產 `crypto-foundation/crypto-metrics/crypto-practice/crypto-risk`；房地產 `real-estate-foundation/real-estate-metrics/real-estate-practice/real-estate-risk`；總經 `macro-economics-foundation/macro-economics-metrics/macro-economics-practice/macro-economics-risk`；實戰交易 `technical-system/risk-expectancy/pair-trading/grid-mechanics/position-sizing`。


## 2026-08-26 Hub 與章節工具修正回歸（r2）

修正 `tools-hub.js` 的初始化時序後，正式頁面載入後不再停留在 0：Hero 顯示 80 個工具、14 張公開資料工具、49 張章節工具；13 類 badge 由實際卡片 DOM 計算。逐一點選 equity、us、etf、fixed、funds、forex、commodities、futures、options、crypto、real-estate、macro、strategy，badge、依 `data-tool-category` 計算的 expected count 與可見卡數全部一致，分別為 9、8、11、8、9、8、6、10、9、7、9、8、13。

`us-market-structure.html` 本地點擊執行 SPY 成功：Yahoo Finance chart 取得 1,255 筆日線，最新收盤 764.84、50 日均線 752.73、200 日均線 708.42、歷史最大回撤 -25.36%，Canvas 圖表正常，頁面有原始資料口徑、錯誤狀態與指南 backlink。

章節工具批量稽核 `audit_chapter_tools.py`：49 specs／49 pages／0 errors；`validate_site.py`：errors=0。配對價差 action 已補入 runtime，均線回測文字代號誤當數值的驗證錯誤亦已修正。


`options-black-scholes.html` 本地數學回歸成功：以標的 100、履約價 100、年化波動率 25%、無風險利率 4%、剩餘 30 天的測試條件執行後，Call 理論權利金 3.02、Delta 0.533、Gamma 0.05548、Vega 0.114；Chart.js bar chart 正常，狀態為「計算完成」，頁面明確揭露歐式、固定波動率、無跳躍等限制，不使用行情假值。


`fund-exposure-compare.html` 本地回歸：執行 VTI／SPY 後，雙 Yahoo 公開查詢在該瀏覽器窗口最終轉為「無法完成」，訊息為公開端點／備援 abort；HUD、結果與圖表維持空值，重試按鈕可用，沒有以假績效補值。這是目前資料層對多端點受限的透明錯誤路徑，與先前單標的 SPY 成功結果分開記錄。


`strategy-trade-journal.html` 本地數學回歸成功：以已結束交易紀錄摘要 60 勝／40 負、平均獲利 1.8R、平均虧損 1R、每筆成本 0.1R 執行，結果為勝率 60.00%、成本後期望值 0.580R、損益平衡勝率 39.29%、Profit factor 2.70；Chart.js 圖表正常，頁面明確要求使用者填入自己的交易日誌，不將測試條件當作市場資料。


`strategy-pair-spread.html` 本地公開資料回歸成功：以 SPY／QQQ 與 60 日 Z-score 窗口執行，Yahoo chart 取得 1,255 個共同交易日，報酬相關係數 0.948、目前 Z-score 1.02、normalized 價差均值 -2.44、歷史最大 |Z| 3.99；Chart.js 三條路徑正常。頁面明確說明相關係數不等於協整，仍須檢查 hedge ratio、借券、成本、結構斷裂與樣本外表現。


`strategy-pair-spread.html` 完成後 DOM 回歸：桌面 viewport 1280、`scrollWidth=1272`、Canvas client 732×290、`window.__chapterErrors=[]`；390×844 同源 iframe 回歸交易日誌章節工具，`scrollWidth=382`、viewport=390、5 個輸入、Canvas 336×240，無水平溢位。第一次 iframe 測試因 onload 綁定順序漏接而由測試自身逾時，修正順序後成功完成，未視為網站故障。


本輪章節工具回歸補充：`strategy-pair-spread.html` 的 SPY／QQQ 60 日窗口取得 1,255 個共同交易日，相關係數 0.948、目前 Z-score 1.02、最大 |Z| 3.99；桌面 Canvas 732×290、`scrollWidth=1272`、無章節 runtime JavaScript 錯誤。章節工具稽核維持 49 specs／49 pages／0 errors，Hub 分類逐項 badge 與可見卡數一致。


跨類別章節工具 390×844 同源 iframe sweep 成功：`us-valuation-sensitivity.html` 狀態計算完成、結果長度 125；`crypto-liquidation.html` 計算完成、結果長度 113；`macro-inflation-purchasing.html` 計算完成、結果長度 105；`strategy-position-sizing.html` 計算完成、結果長度 100；`strategy-grid-risk.html` 計算完成、結果長度 110。五頁均 `scrollWidth=382`、Canvas 336×240、`errors=[]`，並各自維持公式限制與無假行情說明。


跨類別章節工具第二輪 390×844 iframe sweep 成功：`options-payoff.html` 計算完成、結果長度 93；`crypto-portfolio-risk.html` 計算完成、結果長度 116；`realestate-rent-buy.html` 計算完成、結果長度 114；`macro-regime-quadrant.html` 框架完成、結果長度 110。四頁均 `scrollWidth=382`、Canvas 336×240、`errors=[]`；總經象限頁明確要求以官方原始序列交叉驗證，不自動產生資產配置答案。


Hub 重建後回歸結果：Hero 實際顯示 80 個工具、14 張公開資料工具、49 張章節工具；逐一點擊 13 類後，badge 與可見卡片數完全一致（equity 9、us 8、etf 11、fixed 8、funds 9、forex 8、commodities 6、futures 10、options 9、crypto 7、real-estate 9、macro 8、strategy 13），每列 `ok=true`。所有數字由卡片 DOM 計算，初始 HTML 改以 `—` 等待 runtime，避免無 JavaScript 時顯示假 0。


章節工具第三輪 390×844 iframe sweep 成功：`bond-duration-convexity.html` 計算完成、結果長度 131；`forex-pip-value.html` 計算完成、結果長度 108；`commodity-carry.html` 計算完成、結果長度 112；`futures-notional-risk.html` 計算完成、結果長度 103；`fund-fee-impact.html` 計算完成、結果長度 102。五頁均 `scrollWidth=382`、Canvas 336×240、`errors=[]`。另以 SPY、20／60 日均線與 0.1% 換手成本測試 `strategy-rule-backtest.html`，Yahoo 取得 1,255 筆日線，策略報酬 13.13%、買入持有 70.38%、策略最大回撤 -29.00%、23 次換手，頁面清楚標示簡化回測限制。


`guides/forex.html` 本地閉環回歸成功：4 個章節 section ID（forex-foundation、forex-carry、forex-hedging、forex-risk），4 個 `data-chapter-inline-tool`、4 個 `data-chapter-tool-cta`，對應 Pip、Carry、避險比例與保證金工具；`scrollWidth=1272`、viewport=1280，工具 href 均可解析，保留既有 R:R／DRIP／Grid 交叉學習連結。

章節工具回歸補充：美股／ETF 390px 批次 8 頁均核心 DOM 齊全、scrollWidth=382、無 runtime errors；Yahoo 美股市場結構成功取得 1,255 筆日線。美股 DCF 以 FCF=100、成長 5%、折現 10%、終值成長 2%、5 年、100 股、現價 80 完成；ETF 再平衡以 60／30／10 目標權重完成。債券／基金 8 頁批次均 DOM 齊全、scrollWidth=382、無 runtime errors；兩個基金多 Yahoo 工具延長等待後均成功取得 1,255 個共同交易日（不再停留處理中）。

章節工具全量回歸收尾：外匯／商品 8 頁均以有效欄位值完成，390px scrollWidth=382、無 runtime errors；商品季節性成功取得 GC=F 1,257 筆日線。期貨／選擇權／虛擬貨幣 12 頁均核心 DOM 齊全、數學結果有內容、390px scrollWidth=382、無 runtime errors。房地產／總體／策略 13 頁中，12 頁有效輸入完成且 scrollWidth=382；FRED 衰退儀表板在 12 秒後明確轉為 Failed to fetch／備援 abort 的可見錯誤，沒有補值；Yahoo 均線回測完成 1,255 筆日線，Yahoo 配對價差完成 1,255 個共同交易日。全量 49 頁均已由靜態 audit 驗證核心標記與 guide backlink，公開資料終態採成功或透明錯誤均可接受。

Hub 最終本地回歸：80 張卡片、14 張公開資料卡、49 張章節卡；Hero 動態顯示 80／14／49、13 類市場導航。以卡片原生 `hidden` 狀態逐一點擊 13 個分類，badge 與實際可見卡片完全 parity：all 80、equity 9、us 8、etf 11、fixed 8、funds 9、forex 8、commodities 6、futures 10、options 9、crypto 7、real-estate 9、macro 8、strategy 13。所有卡片為 `<a>` 或 `<button>`，側欄明確說明「數量來自實際卡片；跨市場工具可同時計入多類」。390×844 iframe 顯示 80／14／49，點擊 crypto 後可見 7 張、badge=7，scrollWidth=382，無水平溢位。

正式站 36de33b 回歸：Tools Hub 80／14／49 與 13 類 parity 全部通過；390px Hub scrollWidth=382。代表工具中 `options-black-scholes.html` 以 100／100／25%／4%／30 日完成，結果長度 120、狀態為計算完成；`macro-recession-dashboard.html` 明確顯示 FRED Failed to fetch／備援 abort，結果長度 107，沒有假序列；`guides/forex.html` 在 390px 有 4 個 inline links、4 個 CTA、scrollWidth=382。`us-market-structure.html` 在正式站本輪 14 秒等待後顯示 Yahoo 公開端點無法由瀏覽器讀取（Failed to fetch；備援 abort）的透明錯誤，結果長度 107、無 runtime errors；未把暫時中途 loading 報為成功，也未填入假價格。這與本地及先前 production 的 Yahoo 間歇成功／受限狀態一致。

正式站最終發布 `5522d11` 交付前回歸：80 張卡片、14 張公開資料卡、49 張章節卡；Hero=80／14／49；13 個分類均 badge=實際 DOM membership=可見卡片（all 80、equity 9、us 8、etf 11、fixed 8、funds 9、forex 8、commodities 6、futures 10、options 9、crypto 7、real-estate 9、macro 8、strategy 13）；1280px `scrollWidth=1272`，正式站無水平溢位。Pages run `32886723499` success。

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

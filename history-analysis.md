# Git 歷史根因分析

## tools history
[33m252fdf6[m Manus AI: restore real-time candlestick chart R:R calculator and launch ETF dividend & grid trading tools
[33m61731ad[m Manus AI: refresh versioned assets after deep content deployment
[33mf4b3de7[m Manus AI: enrich all financial guides with in-depth analysis, fix header layout, restore R:R calculator and add AdSense compliance pages
[33m6e98bd1[m Add site-wide TradingView CTAs and cache-safe assets
[33m759b463[m Manus AI: revert converter hub entries from academy homepage
[33m1dfece0[m Manus AI: launch Converter Hub toolset with subtitle, image, data, and PDF converters plus affiliate modules
[33maf9d951[m Manus AI: integrate original academy tools & affiliate modules with upgraded financial toolset and enriched articles
[33m777e03a[m Fix multi-language asset path resolution by standardizing CSS and JS to root-relative paths, preventing layout breaking across languages
[33m9a3c305[m Fix syntax error caused by duplicate currentDurationStep variable declaration in global scope
[33m3806394[m Implement strict client-side fetch timeouts to prevent packet-drop hangs and ensure instant proxy fallback
[33mf861d4d[m Fix calculator loading lock by wrapping all localStorage reads and writes in try-catch blocks and protecting load listener body
[33mbefe2a2[m Fix calculator loading spinner by implementing local storage standardization and Binance CORS proxy fallback
[33m065138b[m Rename tools to Realtime Risk-Reward (R:R) Calculator, and replace scanner candle count dropdown with backtest duration option
[33ma77aa7b[m Implement new tab link openings, auto fallback to daily charts on stock loading errors, and intuitive adaptive time range slider
[33m6ef4cd8[m Isolate scanner into a standalone risk-reward-scanner.html page, support market categories, historical backtest candles, and live R:R rankings, and update navigation menus globally
[33m4275966[m Compute and display total time-span duration of visible candles next to range slider
[33mb144708[m Implement streaming updates, 15m/30m timeframes, range slider under chart, disabled entry modifications, and touch cluster S/R detection
[33m62ceb90[m Fix trailing Javascript source code leak at the bottom of risk-reward-calculator.html
[33mc1dadd7[m Optimize S/R wave pivot detection, fix badge overlapping, set explicit delay labels and refresh action, add visible K-lines range filter
[33md7fe005[m Implement interactive canvas line dragging, timeframe selection, live sidebar stats, and a full risk-reward scanner in risk-reward-calculator.html
[33m45a2957[m Implement interactive Support/Resistance and Risk-Reward auto-calculator with Canvas Candlestick charting and public API integration, localized in all 7 languages

## COMMIT 45a2957 R:R JS key logic

## COMMIT 45a2957 R:R HTML chart structure
189:        .chart-card {
197:        .chart-header {
204:        .chart-title {
210:        .chart-symbol {
217:        .chart-price-info {
223:        .chart-price-item {
227:        .chart-price-value {
233:        .canvas-container {
243:        canvas {
249:        .chart-loading {
279:        .chart-error {
523:                    <label style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;"><i class="fa-solid fa-magnifying-glass-chart"></i> 搜尋商品代碼</label>
542:                    <label><span>進場價格 (Entry)</span><span id="entry-percent" style="font-size:0.8rem; color:var(--text-muted);">現價點</span></label>
544:                        <button onclick="adjustPrice('entry', -1)"><i class="fa-solid fa-minus"></i></button>
545:                        <input type="number" id="price-entry" step="any" oninput="onManualPriceChange()">
546:                        <button onclick="adjustPrice('entry', 1)"><i class="fa-solid fa-plus"></i></button>
552:                    <label><span>技術支撐 (Support / 停損)</span><span id="support-percent" style="font-size:0.8rem; color:#ff3333;">-2.00%</span></label>
554:                        <button onclick="adjustPrice('support', -1)"><i class="fa-solid fa-minus"></i></button>
555:                        <input type="number" id="price-support" step="any" oninput="onManualPriceChange()">
556:                        <button onclick="adjustPrice('support', 1)"><i class="fa-solid fa-plus"></i></button>
558:                    <input type="range" class="slider-control" id="slider-support" min="80" max="100" value="95" oninput="onSliderChange('support')">
563:                    <label><span>技術壓力 (Resistance / 停利)</span><span id="resistance-percent" style="font-size:0.8rem; color:#4caf50;">+8.00%</span></label>
565:                        <button onclick="adjustPrice('resistance', -1)"><i class="fa-solid fa-minus"></i></button>
566:                        <input type="number" id="price-resistance" step="any" oninput="onManualPriceChange()">
567:                        <button onclick="adjustPrice('resistance', 1)"><i class="fa-solid fa-plus"></i></button>
569:                    <input type="range" class="slider-control" id="slider-resistance" min="100" max="120" value="108" oninput="onSliderChange('resistance')">
576:                <div class="chart-card">
577:                    <div class="chart-header">
578:                        <div class="chart-title">
579:                            <span class="chart-symbol" id="display-symbol">BTC/USDT</span>
582:                        <div class="chart-price-info">
583:                            <span class="chart-price-item">最新價:<span class="chart-price-value" id="price-latest">-</span></span>
584:                            <span class="chart-price-item">最高:<span class="chart-price-value" id="price-high">-</span></span>
585:                            <span class="chart-price-item">最低:<span class="chart-price-value" id="price-low">-</span></span>
590:                    <div class="canvas-container">
591:                        <div class="chart-loading" id="chart-loader">
595:                        <canvas id="kline-canvas"></canvas>
678:        let chartData = [];
680:        let entryPrice = 0;
681:        let supportPrice = 0;
682:        let resistancePrice = 0;
686:        const canvas = document.getElementById('kline-canvas');
687:        const ctx = canvas.getContext('2d');
688:        const loader = document.getElementById('chart-loader');
692:            const container = canvas.parentElement;
693:            canvas.width = container.clientWidth * window.devicePixelRatio;
694:            canvas.height = container.clientHeight * window.devicePixelRatio;
757:            loader.innerHTML = `<div class="chart-error"><i class="fa-solid fa-triangle-exclamation"></i> <span>${msg}</span></div>`;
766:            chartData = data.map(d => ({
779:            const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`;
780:            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
786:            if (!data.chart || !data.chart.result || !data.chart.result[0]) {
790:            const result = data.chart.result[0];
794:            chartData = [];
798:                    chartData.push({
808:            if (chartData.length === 0) throw new Error("Empty Quote dataset");
814:            latestPrice = chartData[chartData.length - 1].close;
815:            entryPrice = latestPrice;
822:            chartData.forEach(d => {
830:            let resistanceLevels = [];
831:            let supportLevels = [];
833:            for (let i = 2; i < chartData.length - 2; i++) {
834:                const cur = chartData[i];
835:                const prev1 = chartData[i-1];
836:                const prev2 = chartData[i-2];
837:                const next1 = chartData[i+1];
838:                const next2 = chartData[i+2];
842:                    resistanceLevels.push(cur.high);
847:                    supportLevels.push(cur.low);
851:            // Find closest support level below current price
852:            let finalSupport = latestPrice * 0.95; // Default 5% stop if none detected
853:            const belowPrices = supportLevels.filter(p => p < latestPrice).sort((a, b) => b - a);
858:            // Find closest resistance level above current price
859:            let finalResistance = latestPrice * 1.08; // Default 8% target if none detected
860:            const abovePrices = resistanceLevels.filter(p => p > latestPrice).sort((a, b) => a - b);
865:            supportPrice = finalSupport;
866:            resistancePrice = finalResistance;
874:            const sliderSupport = document.getElementById('slider-support');
877:            sliderSupport.value = supportPrice;
880:            const sliderResistance = document.getElementById('slider-resistance');
883:            sliderResistance.value = resistancePrice;
894:            if (type === 'entry') {
895:                entryPrice += direction * step;
896:                if (entryPrice < 0) entryPrice = 0;
897:            } else if (type === 'support') {
898:                supportPrice += direction * step;
899:                if (supportPrice < 0) supportPrice = 0;
900:                document.getElementById('slider-support').value = supportPrice;
901:            } else if (type === 'resistance') {
902:                resistancePrice += direction * step;
903:                if (resistancePrice < 0) resistancePrice = 0;
904:                document.getElementById('slider-resistance').value = resistancePrice;
912:            entryPrice = parseFloat(document.getElementById('price-entry').value) || latestPrice;
913:            supportPrice = parseFloat(document.getElementById('price-support').value) || (latestPrice * 0.95);
914:            resistancePrice = parseFloat(document.getElementById('price-resistance').value) || (latestPrice * 1.08);
916:            document.getElementById('slider-support').value = supportPrice;
917:            document.getElementById('slider-resistance').value = resistancePrice;
925:            if (type === 'support') {
926:                supportPrice = parseFloat(document.getElementById('slider-support').value);
927:            } else if (type === 'resistance') {

## COMMIT d7fe005 R:R JS key logic

## COMMIT d7fe005 R:R HTML chart structure
33:            .chart-body {
200:        .chart-card {
208:        .chart-header {
215:        .chart-title {
221:        .chart-symbol {
228:        .chart-price-info {
234:        .chart-price-item {
238:        .chart-price-value {
244:        .canvas-container {
254:        canvas {
260:        .chart-loading {
290:        .chart-error {
534:                    <label style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;"><i class="fa-solid fa-magnifying-glass-chart"></i> 搜尋商品代碼</label>
553:                    <label><span>進場價格 (Entry)</span><span id="entry-percent" style="font-size:0.8rem; color:var(--text-muted);">現價點</span></label>
555:                        <button onclick="adjustPrice('entry', -1)"><i class="fa-solid fa-minus"></i></button>
556:                        <input type="number" id="price-entry" step="any" oninput="onManualPriceChange()">
557:                        <button onclick="adjustPrice('entry', 1)"><i class="fa-solid fa-plus"></i></button>
563:                    <label><span>技術支撐 (Support / 停損)</span><span id="support-percent" style="font-size:0.8rem; color:#ff3333;">-2.00%</span></label>
565:                        <button onclick="adjustPrice('support', -1)"><i class="fa-solid fa-minus"></i></button>
566:                        <input type="number" id="price-support" step="any" oninput="onManualPriceChange()">
567:                        <button onclick="adjustPrice('support', 1)"><i class="fa-solid fa-plus"></i></button>
569:                    <input type="range" class="slider-control" id="slider-support" min="80" max="100" value="95" oninput="onSliderChange('support')">
574:                    <label><span>技術壓力 (Resistance / 停利)</span><span id="resistance-percent" style="font-size:0.8rem; color:#4caf50;">+8.00%</span></label>
576:                        <button onclick="adjustPrice('resistance', -1)"><i class="fa-solid fa-minus"></i></button>
577:                        <input type="number" id="price-resistance" step="any" oninput="onManualPriceChange()">
578:                        <button onclick="adjustPrice('resistance', 1)"><i class="fa-solid fa-plus"></i></button>
580:                    <input type="range" class="slider-control" id="slider-resistance" min="100" max="120" value="108" oninput="onSliderChange('resistance')">
587:                <div class="chart-card">
588:                    <div class="chart-header">
589:                        <div class="chart-title">
590:                            <span class="chart-symbol" id="display-symbol">BTC/USDT</span>
602:                        <div class="chart-price-info">
603:                            <span class="chart-price-item">最新價:<span class="chart-price-value" id="price-latest">-</span></span>
604:                            <span class="chart-price-item">最高:<span class="chart-price-value" id="price-high">-</span></span>
605:                            <span class="chart-price-item">最低:<span class="chart-price-value" id="price-low">-</span></span>
610:                    <div class="chart-body" style="display: grid; grid-template-columns: 1fr 280px; gap: 20px;">
612:                        <div class="canvas-container" style="position: relative; height: 380px;">
613:                            <div class="chart-loading" id="chart-loader">
617:                            <canvas id="kline-canvas"></canvas>
621:                        <div class="chart-sidebar" style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px;">
629:                                        <span id="side-entry-val" style="color: #fff; font-weight: bold;">-</span>
633:                                        <span id="side-support-val" style="color: #ff3333; font-weight: bold;">-</span>
637:                                        <span id="side-resistance-val" style="color: #4caf50; font-weight: bold;">-</span>
799:        let chartData = [];
801:        let entryPrice = 0;
802:        let supportPrice = 0;
803:        let resistancePrice = 0;
810:        let draggedLine = null; // 'support', 'resistance', or 'entry'
811:        let hoveredLine = null;  // 'support', 'resistance', or 'entry'
813:        const canvas = document.getElementById('kline-canvas');
814:        const ctx = canvas.getContext('2d');
815:        const loader = document.getElementById('chart-loader');
819:            const container = canvas.parentElement;
820:            canvas.width = container.clientWidth * window.devicePixelRatio;
821:            canvas.height = container.clientHeight * window.devicePixelRatio;
888:            loader.innerHTML = `<div class="chart-error"><i class="fa-solid fa-triangle-exclamation"></i> <span>${msg}</span></div>`;
897:            chartData = data.map(d => ({
925:            const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${yahooRange}`;
926:            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
932:            if (!data.chart || !data.chart.result || !data.chart.result[0]) {
936:            const result = data.chart.result[0];
940:            chartData = [];
943:                    chartData.push({
953:            if (chartData.length === 0) throw new Error("Empty Quote dataset");
959:            latestPrice = chartData[chartData.length - 1].close;
960:            entryPrice = latestPrice;
967:            chartData.forEach(d => {
975:            let resistanceLevels = [];
976:            let supportLevels = [];
978:            for (let i = 2; i < chartData.length - 2; i++) {
979:                const cur = chartData[i];
980:                const prev1 = chartData[i-1];
981:                const prev2 = chartData[i-2];
982:                const next1 = chartData[i+1];
983:                const next2 = chartData[i+2];
987:                    resistanceLevels.push(cur.high);
992:                    supportLevels.push(cur.low);
996:            // Find closest support level below current price
997:            let finalSupport = latestPrice * 0.95; // Default 5% stop if none detected
998:            const belowPrices = supportLevels.filter(p => p < latestPrice).sort((a, b) => b - a);
1003:            // Find closest resistance level above current price
1004:            let finalResistance = latestPrice * 1.08; // Default 8% target if none detected
1005:            const abovePrices = resistanceLevels.filter(p => p > latestPrice).sort((a, b) => a - b);
1010:            supportPrice = finalSupport;
1011:            resistancePrice = finalResistance;
1019:            const sliderSupport = document.getElementById('slider-support');
1022:            sliderSupport.value = supportPrice;
1025:            const sliderResistance = document.getElementById('slider-resistance');
1028:            sliderResistance.value = resistancePrice;
1039:            if (type === 'entry') {
1040:                entryPrice += direction * step;
1041:                if (entryPrice < 0) entryPrice = 0;
1042:            } else if (type === 'support') {
1043:                supportPrice += direction * step;
1044:                if (supportPrice < 0) supportPrice = 0;
1045:                document.getElementById('slider-support').value = supportPrice;
1046:            } else if (type === 'resistance') {
1047:                resistancePrice += direction * step;
1048:                if (resistancePrice < 0) resistancePrice = 0;
1049:                document.getElementById('slider-resistance').value = resistancePrice;

## COMMIT f4b3de7 R:R JS key logic
3:  const ids = ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'];
10:    const entry = number('rr-entry-price');
11:    const stop = number('rr-stop-price');
12:    const target = number('rr-target-price');

## COMMIT f4b3de7 R:R HTML chart structure
14:<header class="site-header"><div class="nav-container"><a href="../index.html" class="logo" aria-label="GugoPro 財經學院首頁"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><nav class="primary-nav" aria-label="主要導覽"><a href="../index.html#knowledge-tree">知識樹</a><a href="index.html">實戰工具</a><a href="../index.html#reading-room">閱讀室</a></nav><div class="nav-actions"><a class="support-link" data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-mug-hot"></i><span>支持學院</span></a><div class="lang-selector"><button class="lang-btn" type="button"><i class="fa-solid fa-globe"></i><span>繁中</span><i class="fa-solid fa-chevron-down"></i></button><div class="lang-dropdown"><a href="#" onclick="changeLanguage('zh-tw')">繁體中文</a><a href="#" onclick="changeLanguage('zh-cn')">简体中文</a><a href="#" onclick="changeLanguage('en')">English</a></div></div><button class="mobile-nav-toggle" type="button" aria-label="開啟選單" aria-expanded="false"><i class="fa-solid fa-bars"></i></button></div></div></header>
20:      <label>進場價格<input id="rr-entry-price" type="number" min="0" step="any" value="100" inputmode="decimal"></label>
21:      <label>停損價格<input id="rr-stop-price" type="number" min="0" step="any" value="95" inputmode="decimal"></label>
22:      <label>目標價格<input id="rr-target-price" type="number" min="0" step="any" value="115" inputmode="decimal"></label>
29:  <div class="guide-cta"><div><h3>把交易假設放回圖表驗證</h3><p>使用 TradingView 觀察價格結構、支撐阻力與回測結果；優惠內容以合作頁與所在地區規則為準。</p></div><a href="https://www.tradingview.com/?aff_id=168714" target="_blank" rel="noopener noreferrer" class="button button-light">領取優惠註冊 <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>
32:<footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a href="../index.html" class="logo"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><p>把市場雜訊，整理成一條可走的路。</p></div><div class="footer-nav"><div><strong>探索</strong><a href="../index.html#knowledge-tree">12 類知識樹</a><a href="index.html">實戰工具庫</a><a href="../guides/risk-reward-ratio.html">R:R 專題</a></div><div><strong>支持</strong><a data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi 贊助支持</a><a href="https://www.amazon.com/?tag=9908qq-20" target="_blank" rel="noopener noreferrer">Amazon Hub</a></div><div><strong>政策</strong><a href="/privacy.html">隱私權政策</a><a href="/terms.html">服務條款與免責</a><a href="/about.html">關於我們</a></div></div></div><div class="footer-bottom"><span>© 2026 GugoPro Academy</span><span>教育內容，不構成投資建議。</span></div></footer>

## COMMIT 252fdf6 R:R JS key logic
5:  const fields = ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'];
25:    entry: { input: 'rr-entry-price', color: '#7ed6b0', label: '進場', className: 'entry-marker' },
26:    stop: { input: 'rr-stop-price', color: '#f56f62', label: '停損', className: 'stop-marker' },
27:    target: { input: 'rr-target-price', color: '#ffb25f', label: '目標', className: 'target-marker' }
29:  let chart;
31:  let chartData = [];
33:  let chartBounds = { min: 0, max: 1 };
34:  let priceLines = {};
35:  let dragState = null;
47:  function fetchWithTimeout(url, timeout = 10000) {
50:    return fetch(url, { signal: controller.signal, mode: 'cors' }).finally(() => clearTimeout(timer));
53:  async function fetchYahoo(symbol, timeframe) {
56:    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplits`;
57:    const response = await fetchWithTimeout(url);
60:    const result = json?.chart?.result?.[0];
75:  async function fetchBinance(symbol, timeframe) {
79:    const response = await fetchWithTimeout(url);
110:    const container = $('rr-chart');
112:    chart = window.LightweightCharts.createChart(container, {
121:    candleSeries = chart.addCandlestickSeries({
123:      wickUpColor: '#5fd3a0', wickDownColor: '#f56f62', priceLineVisible: false
125:    new ResizeObserver(() => chart?.resize(container.clientWidth, container.clientHeight)).observe(container);
129:  function priceDigits(value) {
136:  function setPriceLine(name, price) {
137:    if (!candleSeries || !Number.isFinite(price)) return;
138:    if (priceLines[name]) candleSeries.removePriceLine(priceLines[name]);
140:    priceLines[name] = candleSeries.createPriceLine({
141:      price,
151:    const values = chartData.flatMap((row) => [row.high, row.low]).concat(Object.keys(markerConfig).map((name) => number(markerConfig[name].input)));
157:    chartBounds = { min: min - padding, max: max + padding };
160:  function priceToPercent(price) {
161:    return Math.max(3, Math.min(97, ((chartBounds.max - price) / (chartBounds.max - chartBounds.min)) * 100));
165:    return chartBounds.max - ((percent / 100) * (chartBounds.max - chartBounds.min));
169:    const layer = $('rr-chart-labels');
170:    const zones = $('rr-chart-zones');
172:    layer.innerHTML = '';
173:    zones.innerHTML = '';
175:    const entry = number('rr-entry-price');
176:    const stop = number('rr-stop-price');
177:    const target = number('rr-target-price');
178:    const positions = { entry: priceToPercent(entry), stop: priceToPercent(stop), target: priceToPercent(target) };
181:      line.className = `rr-drag-line ${config.className}`;
185:      line.innerHTML = `<button type="button" class="rr-marker-label" aria-label="拖曳${config.label}線">${config.label} <b>${format(number(config.input), priceDigits(number(config.input)))}</b></button><span class="rr-line-dash"></span>`;
203:    dragState = { marker, pointerId: event.pointerId };
205:    document.body.classList.add('is-dragging-price');
206:    document.addEventListener('pointermove', dragMarker);
210:  function dragMarker(event) {
211:    if (!dragState) return;
212:    const rect = $('rr-chart').getBoundingClientRect();
213:    const percent = Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100));
214:    const price = percentToPrice(percent);
215:    const input = $(markerConfig[dragState.marker].input);
216:    if (input && Number.isFinite(price)) {
217:      input.value = price.toFixed(priceDigits(price));
223:    dragState = null;
224:    document.body.classList.remove('is-dragging-price');
225:    document.removeEventListener('pointermove', dragMarker);
229:    const entry = number('rr-entry-price');
230:    const stop = number('rr-stop-price');
231:    const target = number('rr-target-price');
287:    setText('rr-support-level', format(support, priceDigits(support)));
288:    setText('rr-resistance-level', format(resistance, priceDigits(resistance)));
290:    setText('rr-structure-note', `近 ${lookback.length} 根 K 線；目前價 ${format(current, priceDigits(current))}`);
291:    $('rr-use-support')?.setAttribute('data-price', support);
292:    $('rr-use-resistance')?.setAttribute('data-price', resistance);
296:    const digits = priceDigits(lastClose);
297:    const entry = Number(lastClose.toFixed(digits));
298:    const stop = Number((lastClose * 0.97).toFixed(digits));
299:    const target = Number((lastClose * 1.06).toFixed(digits));
300:    $('rr-entry-price').value = entry;
301:    $('rr-stop-price').value = stop;
302:    $('rr-target-price').value = target;
316:    widget.innerHTML = '';
318:    $('rr-chart')?.classList.add('is-fallback-hidden');
320:      widget.innerHTML = '<div class="rr-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>公開 K 線端點暫時無法連線</strong><span>請稍後重試；數值風控與價格標註仍可使用。</span></div>';
347:    $('rr-chart-empty')?.classList.remove('is-visible');
349:    $('rr-chart')?.classList.remove('is-fallback-hidden');
351:      chartData = isCrypto(symbol) ? await fetchBinance(symbol, timeframe) : await fetchYahoo(symbol, timeframe);
353:      if (!chart) initChart();
355:      candleSeries.setData(chartData);
356:      chart.timeScale().fitContent();
357:      const lastClose = chartData[chartData.length - 1].close;
363:      $('rr-chart')?.classList.remove('is-fallback-hidden');
364:      setText('rr-data-status', `${meta.source} · ${chartData.length} 根 K 線 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleDateString('zh-TW')}`);
365:      calculateStructure(chartData);
369:      $('rr-chart-empty')?.classList.remove('is-visible');
382:    box.innerHTML = matches.map((item) => `<button type="button" role="option" data-symbol="${item.symbol}"><b>${item.symbol}</b><span>${item.name}</span></button>`).join('');
399:    $('rr-use-support')?.addEventListener('click', () => { $('rr-stop-price').value = $('rr-use-support').dataset.price || ''; calculate(); });
400:    $('rr-use-resistance')?.addEventListener('click', () => { $('rr-target-price').value = $('rr-use-resistance').dataset.price || ''; calculate(); });

## COMMIT 252fdf6 R:R HTML chart structure
11:  <link rel="stylesheet" href="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.css">
14:<body class="tools-page rr-page rr-chart-page">
15:<header class="site-header"><div class="nav-container"><a href="../index.html" class="logo" aria-label="GugoPro 財經學院首頁"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><nav class="primary-nav" aria-label="主要導覽"><a href="../index.html#knowledge-tree">知識樹</a><a href="index.html">實戰工具</a><a href="../index.html#reading-room">閱讀室</a></nav><div class="nav-actions"><a class="support-link" data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-mug-hot"></i><span>支持學院</span></a><div class="lang-selector"><button class="lang-btn" type="button"><i class="fa-solid fa-globe"></i><span>繁中</span><i class="fa-solid fa-chevron-down"></i></button><div class="lang-dropdown"><a href="#" onclick="changeLanguage('zh-tw')">繁體中文</a><a href="#" onclick="changeLanguage('zh-cn')">简体中文</a><a href="#" onclick="changeLanguage('en')">English</a></div></div><button class="mobile-nav-toggle" type="button" aria-label="開啟選單" aria-expanded="false"><i class="fa-solid fa-bars"></i></button></div></div></header>
16:<main class="rr-main rr-chart-main">
18:  <section class="rr-hero rr-chart-hero"><div><div class="eyebrow"><span class="eyebrow-dot"></span>RISK MANAGEMENT / LIVE MARKET MAP</div><h1>先在 K 線上看清楚，<br>再決定要承擔多少。</h1><p>搜尋熱門美股、台股 ETF 或加密資產，載入公開市場 K 線，拖曳進場、停損與目標線，讓支撐、壓力與風報區間同時出現在同一張圖上。</p></div><div class="rr-hero-mark"><span>K 線</span><small>risk before return</small></div></section>
25:  <section class="rr-chart-shell" aria-label="K 線與風報比標註圖表">
26:    <div class="rr-chart-head"><div><span class="section-kicker">LIVE MARKET MAP / CANDLESTICKS</span><h2><span id="rr-active-symbol">AAPL</span> <small id="rr-active-name">Apple Inc.</small></h2></div><div class="rr-chart-legend"><span class="legend-entry">進場</span><span class="legend-stop">停損</span><span class="legend-target">目標</span></div></div>
27:    <div id="rr-chart" class="rr-chart-canvas" aria-label="商品 K 線圖，支援拖曳價格標註"></div><div id="rr-tv-widget" class="rr-tv-widget" aria-label="TradingView 即時圖表"></div>
28:    <div id="rr-chart-zones" class="rr-chart-zones" aria-hidden="true"></div>
29:    <div id="rr-chart-labels" class="rr-chart-labels" aria-hidden="true"></div>
30:    <div id="rr-chart-empty" class="rr-chart-empty"><i class="fa-solid fa-chart-area"></i><strong>輸入或選擇商品以載入 K 線</strong><span>資料由公開市場端點取得；若來源暫時拒絕瀏覽器連線，工具會保留數值風控功能。</span></div>
31:    <p class="rr-chart-caption"><i class="fa-solid fa-circle-info"></i> K 線資料為公開端點的最新可取得資料，可能延遲；不構成即時報價承諾。拖曳圖上的彩色價格標註即可同步更新下方計算。</p>
36:      <label><span class="price-label entry-label">進場價格</span><input id="rr-entry-price" type="number" min="0" step="any" value="100" inputmode="decimal"></label>
37:      <label><span class="price-label stop-label">停損價格</span><input id="rr-stop-price" type="number" min="0" step="any" value="95" inputmode="decimal"></label>
38:      <label><span class="price-label target-label">目標價格</span><input id="rr-target-price" type="number" min="0" step="any" value="115" inputmode="decimal"></label>
45:  <section class="rr-support-resistance"><div><div class="section-kicker">STRUCTURE / AUTOMATED LEVELS</div><h2>最近支撐與壓力</h2><p>以最近一段 K 線的局部高低點聚合，提供可檢查的結構提示，不把演算法結果當作訊號或保證。</p></div><div class="rr-level-cards"><div class="level-card support-level"><span>最近支撐</span><strong id="rr-support-level">—</strong><button id="rr-use-support" type="button">套用為停損</button></div><div class="level-card resistance-level"><span>最近壓力</span><strong id="rr-resistance-level">—</strong><button id="rr-use-resistance" type="button">套用為目標</button></div><div class="level-card volatility-level"><span>區間波動</span><strong id="rr-volatility-level">—</strong><small id="rr-structure-note">等待 K 線資料</small></div></div></section>
49:  <section class="tool-resource-strip"><div class="resource-card resource-tradingview"><span class="section-kicker">PARTNER RESOURCE</span><h3>把交易假設放回圖表驗證</h3><p>用 TradingView 觀察價格結構、支撐阻力與回測結果；優惠內容依合作頁與所在地區規則為準。</p><a class="button button-light" href="https://www.tradingview.com/?aff_id=168714" target="_blank" rel="noopener noreferrer">領取優惠註冊</a></div><div class="resource-card"><span class="section-kicker">RESEARCH DESK</span><h3>延伸閱讀與支持</h3><p>從財經書籍、工具方法到持續維護，透過既有 Amazon 聯盟資源或 Ko-fi 支持學院。</p><div class="resource-links"><a href="https://www.amazon.com/?tag=9908qq-20" target="_blank" rel="noopener noreferrer">Amazon 精選推薦</a><a data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi 贊助支持</a></div></div></section>
52:<footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a href="../index.html" class="logo"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><p>把市場雜訊，整理成一條可走的路。</p></div><div class="footer-nav"><div><strong>探索</strong><a href="../index.html#knowledge-tree">12 類知識樹</a><a href="index.html">實戰工具庫</a><a href="../guides/risk-reward-ratio.html">R:R 專題</a></div><div><strong>支持</strong><a data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi 贊助支持</a><a href="https://www.amazon.com/?tag=9908qq-20" target="_blank" rel="noopener noreferrer">Amazon Hub</a></div><div><strong>政策</strong><a href="/privacy.html">隱私權政策</a><a href="/terms.html">服務條款與免責</a><a href="/about.html">關於我們</a></div></div></div><div class="footer-bottom"><span>© 2026 GugoPro Academy</span><span>教育內容，不構成投資建議。</span></div></footer>
53:<script src="/app.js?v=tools-upgrade-20260824"></script><script src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"></script><script src="https://s3.tradingview.com/tv.js"></script><script src="risk-reward-calculator.js?v=tools-upgrade-20260824"></script>

## Current R:R JS first 460 lines
     1	(() => {
     2	  'use strict';
     3	
     4	  const $ = (id) => document.getElementById(id);
     5	  const fields = ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'];
     6	  const number = (id) => Number($(id)?.value);
     7	  const format = (value, digits = 2) => Number.isFinite(value)
     8	    ? value.toLocaleString('zh-TW', { maximumFractionDigits: digits })
     9	    : '—';
    10	  const symbolCatalog = [
    11	    { symbol: 'AAPL', name: 'Apple Inc.', source: 'Yahoo Finance' },
    12	    { symbol: 'MSFT', name: 'Microsoft Corp.', source: 'Yahoo Finance' },
    13	    { symbol: 'NVDA', name: 'NVIDIA Corp.', source: 'Yahoo Finance' },
    14	    { symbol: 'TSLA', name: 'Tesla Inc.', source: 'Yahoo Finance' },
    15	    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', source: 'Yahoo Finance' },
    16	    { symbol: 'QQQ', name: 'Invesco QQQ Trust', source: 'Yahoo Finance' },
    17	    { symbol: '0050.TW', name: '元大台灣50 ETF', source: 'Yahoo Finance' },
    18	    { symbol: '00919.TW', name: '群益台灣精選高息 ETF', source: 'Yahoo Finance' },
    19	    { symbol: '2330.TW', name: '台積電', source: 'Yahoo Finance' },
    20	    { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', source: 'Binance Public API' },
    21	    { symbol: 'ETHUSDT', name: 'Ethereum / Tether', source: 'Binance Public API' },
    22	    { symbol: 'SOLUSDT', name: 'Solana / Tether', source: 'Binance Public API' }
    23	  ];
    24	  const markerConfig = {
    25	    entry: { input: 'rr-entry-price', color: '#7ed6b0', label: '進場', className: 'entry-marker' },
    26	    stop: { input: 'rr-stop-price', color: '#f56f62', label: '停損', className: 'stop-marker' },
    27	    target: { input: 'rr-target-price', color: '#ffb25f', label: '目標', className: 'target-marker' }
    28	  };
    29	  let chart;
    30	  let candleSeries;
    31	  let chartData = [];
    32	  let activeMeta = symbolCatalog[0];
    33	  let chartBounds = { min: 0, max: 1 };
    34	  let priceLines = {};
    35	  let dragState = null;
    36	  let loadSequence = 0;
    37	
    38	  const setText = (id, value) => { if ($(id)) $(id).textContent = value; };
    39	  const isCrypto = (symbol) => /(?:USDT|USDC|BUSD)$/.test(symbol);
    40	  const cleanSymbol = (value) => String(value || '').trim().toUpperCase().replace(/[\s/:-]/g, '');
    41	  const findMeta = (symbol) => symbolCatalog.find((item) => item.symbol === symbol) || {
    42	    symbol,
    43	    name: isCrypto(symbol) ? `${symbol.replace(/USDT$/, '')} / Tether` : `${symbol} 市場商品`,
    44	    source: isCrypto(symbol) ? 'Binance Public API' : 'Yahoo Finance'
    45	  };
    46	
    47	  function fetchWithTimeout(url, timeout = 10000) {
    48	    const controller = new AbortController();
    49	    const timer = setTimeout(() => controller.abort(), timeout);
    50	    return fetch(url, { signal: controller.signal, mode: 'cors' }).finally(() => clearTimeout(timer));
    51	  }
    52	
    53	  async function fetchYahoo(symbol, timeframe) {
    54	    const interval = timeframe === '1h' ? '1h' : timeframe === '4h' ? '1h' : '1d';
    55	    const range = timeframe === '1h' ? '30d' : timeframe === '4h' ? '90d' : '6mo';
    56	    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplits`;
    57	    const response = await fetchWithTimeout(url);
    58	    if (!response.ok) throw new Error(`Yahoo Finance HTTP ${response.status}`);
    59	    const json = await response.json();
    60	    const result = json?.chart?.result?.[0];
    61	    const timestamps = result?.timestamp || [];
    62	    const quote = result?.indicators?.quote?.[0] || {};
    63	    const rows = timestamps.map((timestamp, index) => ({
    64	      time: timestamp,
    65	      open: Number(quote.open?.[index]),
    66	      high: Number(quote.high?.[index]),
    67	      low: Number(quote.low?.[index]),
    68	      close: Number(quote.close?.[index])
    69	    })).filter((row) => Object.values(row).every(Number.isFinite));
    70	    if (!rows.length) throw new Error('Yahoo Finance 沒有回傳可用 K 線');
    71	    if (timeframe === '4h') return compressHourly(rows, 4);
    72	    return rows;
    73	  }
    74	
    75	  async function fetchBinance(symbol, timeframe) {
    76	    const interval = timeframe === '1d' ? '1d' : timeframe === '4h' ? '4h' : '1h';
    77	    const limit = timeframe === '1d' ? 180 : timeframe === '4h' ? 540 : 720;
    78	    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
    79	    const response = await fetchWithTimeout(url);
    80	    if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
    81	    const rows = await response.json();
    82	    const data = rows.map((row) => ({
    83	      time: Math.floor(Number(row[0]) / 1000),
    84	      open: Number(row[1]),
    85	      high: Number(row[2]),
    86	      low: Number(row[3]),
    87	      close: Number(row[4])
    88	    })).filter((row) => Object.values(row).every(Number.isFinite));
    89	    if (!data.length) throw new Error('Binance 沒有回傳可用 K 線');
    90	    return data;
    91	  }
    92	
    93	  function compressHourly(rows, hours) {
    94	    const grouped = [];
    95	    rows.forEach((row) => {
    96	      const bucket = Math.floor(row.time / (hours * 3600)) * hours * 3600;
    97	      const previous = grouped[grouped.length - 1];
    98	      if (!previous || previous.time !== bucket) {
    99	        grouped.push({ time: bucket, open: row.open, high: row.high, low: row.low, close: row.close });
   100	      } else {
   101	        previous.high = Math.max(previous.high, row.high);
   102	        previous.low = Math.min(previous.low, row.low);
   103	        previous.close = row.close;
   104	      }
   105	    });
   106	    return grouped;
   107	  }
   108	
   109	  function initChart() {
   110	    const container = $('rr-chart');
   111	    if (!container || !window.LightweightCharts) return false;
   112	    chart = window.LightweightCharts.createChart(container, {
   113	      layout: { background: { color: 'transparent' }, textColor: '#a9b6c8', fontFamily: 'DM Sans, sans-serif' },
   114	      grid: { vertLines: { color: 'rgba(170, 193, 218, 0.07)' }, horzLines: { color: 'rgba(170, 193, 218, 0.07)' } },
   115	      rightPriceScale: { borderColor: 'rgba(170, 193, 218, 0.18)', textColor: '#a9b6c8' },
   116	      timeScale: { borderColor: 'rgba(170, 193, 218, 0.18)', timeVisible: true, secondsVisible: false },
   117	      crosshair: { mode: 0, vertLine: { color: 'rgba(255, 178, 95, .5)' }, horzLine: { color: 'rgba(255, 178, 95, .5)' } },
   118	      handleScroll: true,
   119	      handleScale: true
   120	    });
   121	    candleSeries = chart.addCandlestickSeries({
   122	      upColor: '#5fd3a0', downColor: '#f56f62', borderVisible: false,
   123	      wickUpColor: '#5fd3a0', wickDownColor: '#f56f62', priceLineVisible: false
   124	    });
   125	    new ResizeObserver(() => chart?.resize(container.clientWidth, container.clientHeight)).observe(container);
   126	    return true;
   127	  }
   128	
   129	  function priceDigits(value) {
   130	    if (value >= 1000) return 0;
   131	    if (value >= 100) return 2;
   132	    if (value >= 1) return 3;
   133	    return 6;
   134	  }
   135	
   136	  function setPriceLine(name, price) {
   137	    if (!candleSeries || !Number.isFinite(price)) return;
   138	    if (priceLines[name]) candleSeries.removePriceLine(priceLines[name]);
   139	    const config = markerConfig[name];
   140	    priceLines[name] = candleSeries.createPriceLine({
   141	      price,
   142	      color: config.color,
   143	      lineWidth: 2,
   144	      lineStyle: 2,
   145	      axisLabelVisible: true,
   146	      title: config.label
   147	    });
   148	  }
   149	
   150	  function recalcBounds() {
   151	    const values = chartData.flatMap((row) => [row.high, row.low]).concat(Object.keys(markerConfig).map((name) => number(markerConfig[name].input)));
   152	    const valid = values.filter(Number.isFinite);
   153	    if (!valid.length) return;
   154	    const min = Math.min(...valid);
   155	    const max = Math.max(...valid);
   156	    const padding = Math.max((max - min) * 0.1, max * 0.002, 0.000001);
   157	    chartBounds = { min: min - padding, max: max + padding };
   158	  }
   159	
   160	  function priceToPercent(price) {
   161	    return Math.max(3, Math.min(97, ((chartBounds.max - price) / (chartBounds.max - chartBounds.min)) * 100));
   162	  }
   163	
   164	  function percentToPrice(percent) {
   165	    return chartBounds.max - ((percent / 100) * (chartBounds.max - chartBounds.min));
   166	  }
   167	
   168	  function renderMarkers() {
   169	    const layer = $('rr-chart-labels');
   170	    const zones = $('rr-chart-zones');
   171	    if (!layer || !zones) return;
   172	    layer.innerHTML = '';
   173	    zones.innerHTML = '';
   174	    recalcBounds();
   175	    const entry = number('rr-entry-price');
   176	    const stop = number('rr-stop-price');
   177	    const target = number('rr-target-price');
   178	    const positions = { entry: priceToPercent(entry), stop: priceToPercent(stop), target: priceToPercent(target) };
   179	    Object.entries(markerConfig).forEach(([name, config]) => {
   180	      const line = document.createElement('div');
   181	      line.className = `rr-drag-line ${config.className}`;
   182	      line.dataset.marker = name;
   183	      line.style.top = `${positions[name]}%`;
   184	      line.style.setProperty('--marker-color', config.color);
   185	      line.innerHTML = `<button type="button" class="rr-marker-label" aria-label="拖曳${config.label}線">${config.label} <b>${format(number(config.input), priceDigits(number(config.input)))}</b></button><span class="rr-line-dash"></span>`;
   186	      line.addEventListener('pointerdown', startDrag);
   187	      layer.appendChild(line);
   188	    });
   189	    const top = Math.min(positions.entry, positions.target);
   190	    const bottom = Math.max(positions.entry, positions.target);
   191	    const riskTop = Math.min(positions.entry, positions.stop);
   192	    const riskBottom = Math.max(positions.entry, positions.stop);
   193	    const reward = document.createElement('div');
   194	    reward.className = 'rr-zone rr-zone-profit'; reward.style.top = `${top}%`; reward.style.height = `${Math.max(1, bottom - top)}%`; zones.appendChild(reward);
   195	    const risk = document.createElement('div');
   196	    risk.className = 'rr-zone rr-zone-loss'; risk.style.top = `${riskTop}%`; risk.style.height = `${Math.max(1, riskBottom - riskTop)}%`; zones.appendChild(risk);
   197	    Object.entries(markerConfig).forEach(([name]) => setPriceLine(name, number(markerConfig[name].input)));
   198	  }
   199	
   200	  function startDrag(event) {
   201	    event.preventDefault();
   202	    const marker = event.currentTarget.dataset.marker;
   203	    dragState = { marker, pointerId: event.pointerId };
   204	    event.currentTarget.setPointerCapture?.(event.pointerId);
   205	    document.body.classList.add('is-dragging-price');
   206	    document.addEventListener('pointermove', dragMarker);
   207	    document.addEventListener('pointerup', endDrag, { once: true });
   208	  }
   209	
   210	  function dragMarker(event) {
   211	    if (!dragState) return;
   212	    const rect = $('rr-chart').getBoundingClientRect();
   213	    const percent = Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100));
   214	    const price = percentToPrice(percent);
   215	    const input = $(markerConfig[dragState.marker].input);
   216	    if (input && Number.isFinite(price)) {
   217	      input.value = price.toFixed(priceDigits(price));
   218	      input.dispatchEvent(new Event('input', { bubbles: true }));
   219	    }
   220	  }
   221	
   222	  function endDrag() {
   223	    dragState = null;
   224	    document.body.classList.remove('is-dragging-price');
   225	    document.removeEventListener('pointermove', dragMarker);
   226	  }
   227	
   228	  function calculate() {
   229	    const entry = number('rr-entry-price');
   230	    const stop = number('rr-stop-price');
   231	    const target = number('rr-target-price');
   232	    const capital = number('rr-capital');
   233	    const riskPercent = number('rr-risk-percent');
   234	    const values = [entry, stop, target, capital, riskPercent];
   235	    const invalid = values.some((value) => !Number.isFinite(value)) || values.slice(0, 4).some((value) => value <= 0) || riskPercent <= 0 || riskPercent > 100;
   236	    if (invalid) {
   237	      ['rr-ratio', 'rr-risk-per-unit', 'rr-risk-budget', 'rr-position-size', 'rr-notional', 'rr-profit'].forEach((id) => setText(id, '—'));
   238	      setText('rr-direction', '需要有效輸入');
   239	      setText('rr-status', '請輸入大於 0 的價格、資金與 0–100% 之間的單筆風險百分比。');
   240	      renderMarkers();
   241	      return;
   242	    }
   243	    const isLong = target > entry && stop < entry;
   244	    const isShort = target < entry && stop > entry;
   245	    if (!isLong && !isShort) {
   246	      ['rr-ratio', 'rr-risk-per-unit', 'rr-risk-budget', 'rr-position-size', 'rr-notional', 'rr-profit'].forEach((id) => setText(id, '—'));
   247	      setText('rr-direction', '價格方向不一致');
   248	      setText('rr-status', '多頭需符合「目標 > 進場 > 停損」；空頭需符合「停損 > 進場 > 目標」。');
   249	      renderMarkers();
   250	      return;
   251	    }
   252	    const riskPerUnit = Math.abs(entry - stop);
   253	    const rewardPerUnit = Math.abs(target - entry);
   254	    const ratio = rewardPerUnit / riskPerUnit;
   255	    const riskBudget = capital * riskPercent / 100;
   256	    const positionSize = Math.floor(riskBudget / riskPerUnit);
   257	    const notional = positionSize * entry;
   258	    const maxLoss = positionSize * riskPerUnit;
   259	    const profit = positionSize * rewardPerUnit;
   260	    setText('rr-ratio', `${format(ratio)}R`); setText('rr-risk-per-unit', format(riskPerUnit));
   261	    setText('rr-risk-budget', format(riskBudget)); setText('rr-position-size', format(positionSize, 0));
   262	    setText('rr-notional', format(notional)); setText('rr-profit', format(profit));
   263	    setText('rr-direction', isLong ? '多頭計畫 / Long' : '空頭計畫 / Short');
   264	    setText('rr-status', positionSize < 1
   265	      ? `風險預算 ${format(riskBudget)} 小於一單位風險 ${format(riskPerUnit)}；依此設定不應建立部位。`
   266	      : `以 ${format(positionSize, 0)} 單位計算，最大價格損失約 ${format(maxLoss)}，到達目標的模型潛在獲利約 ${format(profit)}；尚未扣除費用、滑價與跳空。`);
   267	    renderMarkers();
   268	  }
   269	
   270	  function calculateStructure(data) {
   271	    const lookback = data.slice(-80);
   272	    const current = data[data.length - 1]?.close;
   273	    const supports = [];
   274	    const resistances = [];
   275	    for (let i = 2; i < lookback.length - 2; i += 1) {
   276	      const row = lookback[i];
   277	      const nearby = lookback.slice(i - 2, i + 3);
   278	      if (row.low <= Math.min(...nearby.map((item) => item.low))) supports.push(row.low);
   279	      if (row.high >= Math.max(...nearby.map((item) => item.high))) resistances.push(row.high);
   280	    }
   281	    const under = supports.filter((value) => value < current);
   282	    const over = resistances.filter((value) => value > current);
   283	    const support = under.length ? under[under.length - 1] : Math.min(...lookback.map((item) => item.low));
   284	    const resistance = over.length ? over[over.length - 1] : Math.max(...lookback.map((item) => item.high));
   285	    const tr = lookback.slice(1).map((row, index) => Math.max(row.high - row.low, Math.abs(row.high - lookback[index].close), Math.abs(row.low - lookback[index].close)));
   286	    const atr = tr.length ? tr.reduce((sum, value) => sum + value, 0) / tr.length : 0;
   287	    setText('rr-support-level', format(support, priceDigits(support)));
   288	    setText('rr-resistance-level', format(resistance, priceDigits(resistance)));
   289	    setText('rr-volatility-level', `${format((atr / current) * 100)}% ATR`);
   290	    setText('rr-structure-note', `近 ${lookback.length} 根 K 線；目前價 ${format(current, priceDigits(current))}`);
   291	    $('rr-use-support')?.setAttribute('data-price', support);
   292	    $('rr-use-resistance')?.setAttribute('data-price', resistance);
   293	  }
   294	
   295	  function seedTradePlan(lastClose) {
   296	    const digits = priceDigits(lastClose);
   297	    const entry = Number(lastClose.toFixed(digits));
   298	    const stop = Number((lastClose * 0.97).toFixed(digits));
   299	    const target = Number((lastClose * 1.06).toFixed(digits));
   300	    $('rr-entry-price').value = entry;
   301	    $('rr-stop-price').value = stop;
   302	    $('rr-target-price').value = target;
   303	  }
   304	
   305	  function tradingViewSymbol(symbol) {
   306	    const known = { SPY: 'AMEX:SPY', QQQ: 'NASDAQ:QQQ', AAPL: 'NASDAQ:AAPL', MSFT: 'NASDAQ:MSFT', NVDA: 'NASDAQ:NVDA', TSLA: 'NASDAQ:TSLA' };
   307	    if (known[symbol]) return known[symbol];
   308	    if (/\.TW$/.test(symbol)) return `TWSE:${symbol.replace('.TW', '')}`;
   309	    if (isCrypto(symbol)) return `BINANCE:${symbol}`;
   310	    return `NASDAQ:${symbol}`;
   311	  }
   312	
   313	  function renderTradingViewFallback(symbol) {
   314	    const widget = $('rr-tv-widget');
   315	    if (!widget) return;
   316	    widget.innerHTML = '';
   317	    widget.classList.add('is-visible');
   318	    $('rr-chart')?.classList.add('is-fallback-hidden');
   319	    if (!window.TradingView) {
   320	      widget.innerHTML = '<div class="rr-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>公開 K 線端點暫時無法連線</strong><span>請稍後重試；數值風控與價格標註仍可使用。</span></div>';
   321	      return;
   322	    }
   323	    new window.TradingView.widget({
   324	      autosize: true,
   325	      symbol: tradingViewSymbol(symbol),
   326	      interval: $('rr-timeframe')?.value === '1d' ? 'D' : '60',
   327	      timezone: 'Asia/Taipei',
   328	      theme: 'dark',
   329	      style: '1',
   330	      locale: 'zh_TW',
   331	      toolbar_bg: '#0d1825',
   332	      enable_publishing: false,
   333	      hide_top_toolbar: false,
   334	      hide_legend: false,
   335	      save_image: false,
   336	      container_id: 'rr-tv-widget'
   337	    });
   338	  }
   339	
   340	  async function loadSymbol(value = $('rr-symbol-search')?.value) {
   341	    const symbol = cleanSymbol(value) || 'AAPL';
   342	    const timeframe = $('rr-timeframe')?.value || '1d';
   343	    const meta = findMeta(symbol);
   344	    const requestId = ++loadSequence;
   345	    activeMeta = meta;
   346	    setText('rr-data-status', `載入 ${meta.symbol} · ${meta.source}…`);
   347	    $('rr-chart-empty')?.classList.remove('is-visible');
   348	    $('rr-tv-widget')?.classList.remove('is-visible');
   349	    $('rr-chart')?.classList.remove('is-fallback-hidden');
   350	    try {
   351	      chartData = isCrypto(symbol) ? await fetchBinance(symbol, timeframe) : await fetchYahoo(symbol, timeframe);
   352	      if (requestId !== loadSequence) return;
   353	      if (!chart) initChart();
   354	      if (!candleSeries) throw new Error('K 線圖表庫尚未載入');
   355	      candleSeries.setData(chartData);
   356	      chart.timeScale().fitContent();
   357	      const lastClose = chartData[chartData.length - 1].close;
   358	      seedTradePlan(lastClose);
   359	      $('rr-symbol-search').value = symbol;
   360	      setText('rr-active-symbol', meta.symbol);
   361	      setText('rr-active-name', meta.name);
   362	      $('rr-tv-widget')?.classList.remove('is-visible');
   363	      $('rr-chart')?.classList.remove('is-fallback-hidden');
   364	      setText('rr-data-status', `${meta.source} · ${chartData.length} 根 K 線 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleDateString('zh-TW')}`);
   365	      calculateStructure(chartData);
   366	      calculate();
   367	    } catch (error) {
   368	      if (requestId !== loadSequence) return;
   369	      $('rr-chart-empty')?.classList.remove('is-visible');
   370	      renderTradingViewFallback(symbol);
   371	      setText('rr-data-status', `公開 K 線端點失敗，已切換 TradingView：${error.name === 'AbortError' ? '連線逾時' : error.message}`);
   372	      setText('rr-structure-note', '請檢查代號或稍後重試；數值風控仍可離線使用。');
   373	      calculate();
   374	    }
   375	  }
   376	
   377	  function showSuggestions(value) {
   378	    const box = $('rr-symbol-suggestions');
   379	    if (!box) return;
   380	    const query = cleanSymbol(value);
   381	    const matches = symbolCatalog.filter((item) => !query || `${item.symbol}${item.name}`.toUpperCase().includes(query)).slice(0, 6);
   382	    box.innerHTML = matches.map((item) => `<button type="button" role="option" data-symbol="${item.symbol}"><b>${item.symbol}</b><span>${item.name}</span></button>`).join('');
   383	    box.classList.toggle('is-visible', matches.length > 0 && document.activeElement === $('rr-symbol-search'));
   384	    box.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
   385	      $('rr-symbol-search').value = button.dataset.symbol;
   386	      box.classList.remove('is-visible');
   387	      loadSymbol(button.dataset.symbol);
   388	    }));
   389	  }
   390	
   391	  function bind() {
   392	    fields.forEach((id) => $(id)?.addEventListener('input', calculate));
   393	    $('rr-load-symbol')?.addEventListener('click', () => loadSymbol());
   394	    $('rr-timeframe')?.addEventListener('change', () => loadSymbol());
   395	    $('rr-symbol-search')?.addEventListener('input', (event) => showSuggestions(event.target.value));
   396	    $('rr-symbol-search')?.addEventListener('focus', (event) => showSuggestions(event.target.value));
   397	    $('rr-symbol-search')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); $('rr-symbol-suggestions')?.classList.remove('is-visible'); loadSymbol(); } });
   398	    document.addEventListener('click', (event) => { if (!event.target.closest('.rr-search-wrap')) $('rr-symbol-suggestions')?.classList.remove('is-visible'); });
   399	    $('rr-use-support')?.addEventListener('click', () => { $('rr-stop-price').value = $('rr-use-support').dataset.price || ''; calculate(); });
   400	    $('rr-use-resistance')?.addEventListener('click', () => { $('rr-target-price').value = $('rr-use-resistance').dataset.price || ''; calculate(); });
   401	    initChart();
   402	    calculate();
   403	    loadSymbol('AAPL');
   404	  }
   405	
   406	  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
   407	  else bind();
   408	})();

## Current grid files key markers
tools/grid-trading-calculator.html:15:  <section class="advanced-tool-hero grid-tool-hero"><div><div class="eyebrow"><span class="eyebrow-dot"></span>SYSTEMATIC STRATEGY / GRID SIMULATION</div><h1>把價格區間切成，<br>一格一格的假設。</h1><p>設定上下限、網格數與波動率，觀察等差／等比網格在固定情境下的成交次數、套利毛利、報酬率與最大回撤。</p></div><div class="advanced-hero-mark"><span>GRID</span><small>range map</small></div></section>
tools/grid-trading-calculator.html:16:  <section class="advanced-tool-grid">
tools/grid-trading-calculator.html:17:    <div class="advanced-input-card"><div class="section-kicker">INPUT / GRID PLAN</div><h2>建立區間與波動情境</h2><div class="advanced-form-grid">
tools/grid-trading-calculator.html:18:      <label>價格下限<input id="grid-lower" type="number" min="0.000001" step="any" value="80"></label>
tools/grid-trading-calculator.html:19:      <label>價格上限<input id="grid-upper" type="number" min="0.000001" step="any" value="120"></label>
tools/grid-trading-calculator.html:20:      <label>網格數量<input id="grid-count" type="number" min="2" max="100" step="1" value="10"></label>
tools/grid-trading-calculator.html:21:      <label>網格模式<select id="grid-mode"><option value="arithmetic">等差網格</option><option value="geometric">等比網格</option></select></label>
tools/grid-trading-calculator.html:22:      <label>投入資金（元）<input id="grid-capital" type="number" min="0" step="1000" value="200000"></label>
tools/grid-trading-calculator.html:23:      <label>模擬波動率 (%)<input id="grid-volatility" type="number" min="0" max="200" step="0.5" value="35"></label>
tools/grid-trading-calculator.html:24:      <label>模擬天數<input id="grid-days" type="number" min="1" max="365" step="1" value="90"></label>
tools/grid-trading-calculator.html:26:    <div class="advanced-result-card"><div class="section-kicker">OUTPUT / RANGE PERFORMANCE</div><h2>網格情境摘要</h2><div class="advanced-stat-grid"><div><span>每格間距</span><strong id="grid-spacing">—</strong></div><div><span>預估成交回合</span><strong id="grid-trades">—</strong></div><div><span>套利毛利</span><strong id="grid-profit">—</strong></div><div><span>模擬報酬率</span><strong id="grid-return">—</strong></div><div><span>最大回撤</span><strong id="grid-drawdown">—</strong></div><div><span>期末模擬資產</span><strong id="grid-final-value">—</strong></div></div><p id="grid-status" class="advanced-status" role="status">輸入條件後，模擬會在瀏覽器即時更新。</p></div>
tools/grid-trading-calculator.html:28:  <section class="svg-chart-card"><div class="chart-card-head"><div><div class="section-kicker">SVG RANGE MAP</div><h2>網格區間與模擬價格路徑</h2></div><div class="svg-legend"><span class="svg-legend-grid">網格線</span><span class="svg-legend-path">模擬路徑</span></div></div><svg id="grid-chart" class="scenario-svg grid-scenario-svg" viewBox="0 0 800 300" role="img" aria-label="網格線與模擬價格路徑"><g id="grid-lines"></g><path id="grid-path" class="grid-path"></path><path id="grid-equity-path" class="grid-equity-path"></path><g id="grid-markers"></g><text x="42" y="286" class="svg-axis-label">第 1 天</text><text x="735" y="286" class="svg-axis-label">期末</text></svg><p class="chart-footnote">上方曲線為價格情境，下方細線為資產變化參考；提高波動率可能增加成交，也可能放大庫存與回撤風險。</p></section>
tools/grid-trading-calculator.html:29:  <section class="grid-method-grid"><div><div class="section-kicker">HOW TO READ</div><h2>網格不是無風險套利。</h2><p>網格策略在震盪區間內可能透過低買高賣累積價差，但若價格單方向穿越區間，策略可能持有大量下跌資產，或在上行時錯失趨勢報酬。區間、每格資金、停用條件與最大庫存必須先寫下來。</p></div><div class="checklist-card"><strong>啟動前檢查</strong><span>上下限是否由市場結構支持？</span><span>單方向突破時是否有停機或移動區間規則？</span><span>每格交易成本是否低於預估價差？</span><span>最大回撤與庫存是否可承受？</span></div></section>
tools/grid-trading-calculator.html:34:<script src="/app.js?v=tools-upgrade-20260824"></script><script src="grid-trading-calculator.js?v=tools-upgrade-20260824"></script>
tools/grid-trading-calculator.js:9:  function gridLevels(lower, upper, count, mode) {
tools/grid-trading-calculator.js:13:      levels.push(mode === 'geometric' ? lower * Math.pow(upper / lower, ratio) : lower + (upper - lower) * ratio);
tools/grid-trading-calculator.js:18:  function simulatePath(lower, upper, days, volatility) {
tools/grid-trading-calculator.js:19:    const midpoint = (lower + upper) / 2;
tools/grid-trading-calculator.js:20:    const amplitude = (upper - lower) * Math.min(0.48, Math.max(0.02, volatility / 100));
tools/grid-trading-calculator.js:23:      return Math.max(lower * 0.5, midpoint + amplitude * cycle);
tools/grid-trading-calculator.js:31:  function renderGrid(levels, lower, upper, path, equityPath) {
tools/grid-trading-calculator.js:32:    const lines = $('grid-lines');
tools/grid-trading-calculator.js:33:    if (lines) lines.innerHTML = levels.map((level) => { const y = 272 - ((level - lower) / (upper - lower)) * 210; return `<line x1="42" x2="770" y1="${y}" y2="${y}"/><text x="10" y="${y + 4}" class="svg-axis-label">${level.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}</text>`; }).join('');
tools/grid-trading-calculator.js:34:    const min = Math.min(...path, lower); const max = Math.max(...path, upper);
tools/grid-trading-calculator.js:35:    if ($('grid-path')) $('grid-path').setAttribute('d', pathFor(path, 800, 300, min, max));
tools/grid-trading-calculator.js:36:    if ($('grid-equity-path')) $('grid-equity-path').setAttribute('d', pathFor(equityPath, 800, 300, Math.min(...equityPath), Math.max(...equityPath)));
tools/grid-trading-calculator.js:37:    const markers = $('grid-markers');
tools/grid-trading-calculator.js:38:    if (markers) markers.innerHTML = levels.map((level) => { const y = 272 - ((level - min) / Math.max(0.00001, max - min)) * 210; return `<circle cx="${42 + (levels.indexOf(level) / Math.max(1, levels.length - 1)) * 728}" cy="${y}" r="2.5" class="grid-level-marker"/>`; }).join('');
tools/grid-trading-calculator.js:42:    const lower = Math.max(0.000001, n('grid-lower'));
tools/grid-trading-calculator.js:43:    const upper = Math.max(lower + 0.000001, n('grid-upper'));
tools/grid-trading-calculator.js:44:    const count = Math.min(100, Math.max(2, Math.floor(n('grid-count'))));
tools/grid-trading-calculator.js:45:    const capital = Math.max(0, n('grid-capital'));
tools/grid-trading-calculator.js:46:    const volatility = Math.max(0, n('grid-volatility'));
tools/grid-trading-calculator.js:47:    const days = Math.min(365, Math.max(1, Math.floor(n('grid-days'))));
tools/grid-trading-calculator.js:48:    const mode = $('grid-mode')?.value || 'arithmetic';
tools/grid-trading-calculator.js:49:    const levels = gridLevels(lower, upper, count, mode);
tools/grid-trading-calculator.js:50:    const path = simulatePath(lower, upper, days, volatility);
tools/grid-trading-calculator.js:51:    const spacing = mode === 'geometric' ? (Math.pow(upper / lower, 1 / count) - 1) * 100 : ((upper - lower) / count / ((upper + lower) / 2)) * 100;
tools/grid-trading-calculator.js:61:      const previous = path[index - 1]; const price = path[index];
tools/grid-trading-calculator.js:62:      const crossed = Math.abs(price - previous);
tools/grid-trading-calculator.js:63:      const traversed = Math.floor(crossed / Math.max(0.000001, (upper - lower) / count));
tools/grid-trading-calculator.js:64:      if (traversed > 0 && price >= lower && price <= upper) {
tools/grid-trading-calculator.js:67:        inventory += price < previous ? allocationPerGrid / Math.max(price, 0.000001) : -allocationPerGrid / Math.max(price, 0.000001);
tools/grid-trading-calculator.js:68:        cash += price < previous ? -allocationPerGrid : allocationPerGrid + gross;
tools/grid-trading-calculator.js:70:      const marked = cash + inventory * price;
tools/grid-trading-calculator.js:77:    latest = { levels, path, equityPath, lower, upper };
tools/grid-trading-calculator.js:78:    if ($('grid-spacing')) $('grid-spacing').textContent = mode === 'geometric' ? `${percent(spacing)}（比例）` : `${percent(spacing)}（估算）`;
tools/grid-trading-calculator.js:79:    if ($('grid-trades')) $('grid-trades').textContent = `${trades.toLocaleString('zh-TW')} 回合`;
tools/grid-trading-calculator.js:80:    if ($('grid-profit')) $('grid-profit').textContent = money(profit);
tools/grid-trading-calculator.js:81:    if ($('grid-return')) $('grid-return').textContent = percent(returnPct);
tools/grid-trading-calculator.js:82:    if ($('grid-drawdown')) $('grid-drawdown').textContent = percent(maxDrawdown * 100);
tools/grid-trading-calculator.js:83:    if ($('grid-final-value')) $('grid-final-value').textContent = money(finalValue);
tools/grid-trading-calculator.js:84:    if ($('grid-status')) $('grid-status').textContent = `${mode === 'geometric' ? '等比' : '等差'} ${count} 格、${days} 天、波動率 ${volatility}% 的固定路徑情境已更新；成交增加不代表風險降低。`;
tools/grid-trading-calculator.js:85:    renderGrid(levels, lower, upper, path, equityPath);
tools/grid-trading-calculator.js:89:    ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-volatility', 'grid-days'].forEach((id) => $(id)?.addEventListener('input', simulate));

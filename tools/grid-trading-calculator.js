(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const value = (id, fallback = 0) => { const parsed = Number($(id)?.value); return Number.isFinite(parsed) ? parsed : fallback; };
  const finitePrice = (raw, fallback = 0) => { const parsed = Number(raw); return Number.isFinite(parsed) ? Math.min(1e12, Math.max(1e-8, parsed)) : fallback; };
  const money = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT` : '—';
  const pct = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}%` : '—';
  const priceText = (amount) => Number.isFinite(amount) ? amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—';
  const setText = (id, text) => { if ($(id)) $(id).textContent = text; };

  const symbolCatalog = [
    { symbol: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', source: 'Binance Public API', tv: 'BINANCE:BTCUSDT', crypto: true },
    { symbol: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', source: 'Binance Public API', tv: 'BINANCE:ETHUSDT', crypto: true },
    { symbol: 'SOLUSDT', label: 'SOL/USDT', name: 'Solana', source: 'Binance Public API', tv: 'BINANCE:SOLUSDT', crypto: true },
    { symbol: 'AAPL', label: 'AAPL', name: 'Apple', source: 'Yahoo Finance', tv: 'NASDAQ:AAPL', crypto: false },
    { symbol: 'NVDA', label: 'NVDA', name: 'NVIDIA', source: 'Yahoo Finance', tv: 'NASDAQ:NVDA', crypto: false },
    { symbol: 'TSLA', label: 'TSLA', name: 'Tesla', source: 'Yahoo Finance', tv: 'NASDAQ:TSLA', crypto: false },
    { symbol: 'SPY', label: 'SPY', name: 'S&P 500 ETF', source: 'Yahoo Finance', tv: 'AMEX:SPY', crypto: false },
    { symbol: '0050.TW', label: '0050.TW', name: '元大台灣50', source: 'Yahoo Finance', tv: 'TWSE:0050', crypto: false },
    { symbol: '00919.TW', label: '00919.TW', name: '群益高息', source: 'Yahoo Finance', tv: 'TWSE:00919', crypto: false },
    { symbol: '2330.TW', label: '2330.TW', name: '台積電', source: 'Yahoo Finance', tv: 'TWSE:2330', crypto: false }
  ];
  const metaFor = (symbol) => symbolCatalog.find((item) => item.symbol === symbol) || symbolCatalog[0];

  const timeframeConfig = {
    '5m': { interval: '5m', limit: 1000, range: '5d', yahooInterval: '5m' },
    '15m': { interval: '15m', limit: 1000, range: '30d', yahooInterval: '15m' },
    '1h': { interval: '1h', limit: 1000, range: '730d', yahooInterval: '1h' },
    '4h': { interval: '4h', limit: 1000, range: '730d', yahooInterval: '1h' },
    '1d': { interval: '1d', limit: 1000, range: '10y', yahooInterval: '1d' },
    '1w': { interval: '1w', limit: 1000, range: 'max', yahooInterval: '1wk' }
  };

  let chart = null;
  let candleSeries = null;
  let volumeSeries = null;
  let chartData = [];
  let activeSymbol = 'BTCUSDT';
  let livePrice = NaN;
  let liveChange = NaN;
  let priceLines = [];
  let rangeTouched = false;
  let requestSequence = 0;
  let historyLoading = false;
  let historyExhausted = false;
  let historyDebounce = null;
  let liveSocket = null;
  let liveReconnectTimer = null;
  let liveReconnectDelay = 1200;
  let liveGeneration = 0;

  function fetchWithTimeout(url, timeout = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store' }).finally(() => window.clearTimeout(timer));
  }

  function parseRows(rows) {
    return rows.map((row) => ({ time: Math.floor(Number(row[0]) / 1000), open: Number(row[1]), high: Number(row[2]), low: Number(row[3]), close: Number(row[4]), volume: Number(row[5]) })).filter((row) => [row.time, row.open, row.high, row.low, row.close].every(Number.isFinite));
  }

  function mergeCandles(...sets) {
    const byTime = new Map();
    sets.flat().forEach((row) => { if (row && Number.isFinite(row.time)) byTime.set(row.time, row); });
    return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
  }

  function resampleCandles(data, bucketSeconds) {
    const buckets = new Map();
    data.forEach((row) => {
      const bucket = Math.floor(row.time / bucketSeconds) * bucketSeconds;
      const previous = buckets.get(bucket);
      if (!previous) buckets.set(bucket, { time: bucket, open: row.open, high: row.high, low: row.low, close: row.close, volume: row.volume || 0 });
      else { previous.high = Math.max(previous.high, row.high); previous.low = Math.min(previous.low, row.low); previous.close = row.close; previous.volume += row.volume || 0; }
    });
    return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
  }

  async function fetchBinancePage(symbol, timeframe, endTime, timeout = 14000) {
    const config = timeframeConfig[timeframe] || timeframeConfig['15m'];
    const end = Number.isFinite(endTime) ? `&endTime=${Math.max(0, Math.floor(endTime))}` : '';
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${config.interval}&limit=${config.limit}${end}`;
    const response = await fetchWithTimeout(url, timeout);
    if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
    const parsed = parseRows(await response.json());
    if (parsed.length < 20) throw new Error('K 線資料不足');
    return parsed;
  }

  async function fetchYahooPage(symbol, timeframe, timeout = 14000) {
    const config = timeframeConfig[timeframe] || timeframeConfig['1d'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.yahooInterval}&includePrePost=false&events=div%2Csplits`;
    let json;
    try {
      const response = await fetchWithTimeout(url, timeout);
      if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
      json = await response.json();
    } catch (directError) {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetchWithTimeout(proxyUrl, timeout + 4000);
      if (!proxyResponse.ok) throw directError;
      const wrapper = await proxyResponse.json();
      json = JSON.parse(wrapper.contents);
    }
    const result = json?.chart?.result?.[0];
    if (!result?.timestamp?.length) throw new Error('公開股票／ETF K 線資料不足');
    const quote = result.indicators?.quote?.[0] || {};
    let parsed = result.timestamp.map((time, index) => ({ time: Number(time), open: Number(quote.open?.[index]), high: Number(quote.high?.[index]), low: Number(quote.low?.[index]), close: Number(quote.close?.[index]), volume: Number(quote.volume?.[index] || 0) })).filter((row) => [row.time, row.open, row.high, row.low, row.close].every(Number.isFinite));
    if (timeframe === '4h') parsed = resampleCandles(parsed, 4 * 60 * 60);
    if (parsed.length < 12) throw new Error('公開股票／ETF K 線資料不足');
    return parsed;
  }

  async function fetchMarketPage(symbol, timeframe, endTime) {
    const meta = metaFor(symbol);
    if (meta.crypto) return fetchBinancePage(symbol, timeframe, endTime);
    if (Number.isFinite(endTime)) throw new Error('股票／ETF 歷史分頁暫不支援');
    return fetchYahooPage(symbol, timeframe);
  }

  async function fetchMarketInitial(symbol, timeframe) {
    const first = await fetchMarketPage(symbol, timeframe);
    if (!metaFor(symbol).crypto || first.length < 1000) return first;
    try {
      const older = await fetchMarketPage(symbol, timeframe, first[0].time * 1000 - 1);
      return mergeCandles(older, first);
    } catch (error) {
      return first;
    }
  }

  function initChart() {
    if (!window.LightweightCharts || !$('grid-chart')) throw new Error('Lightweight Charts 尚未載入');
    const container = $('grid-chart');
    chart = window.LightweightCharts.createChart(container, {
      width: container.clientWidth, height: Math.max(400, container.clientHeight || 480),
      layout: { background: { type: 'solid', color: '#07131d' }, textColor: '#a8bcc5', fontFamily: 'DM Sans, sans-serif' },
      grid: { vertLines: { color: 'rgba(152, 182, 190, 0.08)' }, horzLines: { color: 'rgba(152, 182, 190, 0.08)' } },
      crosshair: { mode: 0, vertLine: { color: 'rgba(255, 178, 95, 0.5)', width: 1, style: 2 }, horzLine: { color: 'rgba(126, 214, 176, 0.6)', width: 1, style: 2 } },
      rightPriceScale: { borderColor: 'rgba(176, 202, 208, 0.25)', scaleMargins: { top: 0.08, bottom: 0.18 } },
      timeScale: { borderColor: 'rgba(176, 202, 208, 0.25)', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true }, handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    });
    candleSeries = chart.addCandlestickSeries({ upColor: '#5fd3a0', downColor: '#f56f62', borderUpColor: '#5fd3a0', borderDownColor: '#f56f62', wickUpColor: '#5fd3a0', wickDownColor: '#f56f62', priceLineVisible: false, lastValueVisible: true });
    volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.82, bottom: 0 } });
    const observer = new ResizeObserver(() => chart?.resize(container.clientWidth, Math.max(400, container.clientHeight || 480)));
    observer.observe(container);
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range && range.from < 28 && chartData.length && metaFor(activeSymbol).crypto && !historyLoading && !historyExhausted) {
        window.clearTimeout(historyDebounce);
        historyDebounce = window.setTimeout(() => loadOlderHistory(), 220);
      }
    });
  }

  function renderCandles(preserveLogicalRange = null) {
    if (!candleSeries || !volumeSeries || !chartData.length) return;
    candleSeries.setData(chartData.map((row) => ({ time: row.time, open: row.open, high: row.high, low: row.low, close: row.close })));
    volumeSeries.setData(chartData.map((row) => ({ time: row.time, value: Math.max(0, row.volume || 0), color: row.close >= row.open ? 'rgba(95, 211, 160, 0.32)' : 'rgba(245, 111, 98, 0.32)' })));
    if (preserveLogicalRange && Number.isFinite(preserveLogicalRange.from) && Number.isFinite(preserveLogicalRange.to)) chart.timeScale().setVisibleLogicalRange(preserveLogicalRange);
    else chart.timeScale().fitContent();
  }

  function levelsFor(lower, upper, count, mode) {
    const safeLower = Math.max(1e-8, lower);
    return Array.from({ length: count + 1 }, (_, index) => { const fraction = index / count; return mode === 'geometric' ? safeLower * Math.pow(upper / safeLower, fraction) : lower + (upper - lower) * fraction; });
  }

  function removeGridLines() {
    if (!candleSeries) return;
    priceLines.forEach((line) => { try { candleSeries.removePriceLine(line); } catch (error) { /* already removed */ } });
    priceLines = [];
  }

  function renderGridLines(levels, current, stop, take) {
    if (!candleSeries) return;
    removeGridLines();
    levels.forEach((level, index) => {
      const isBuy = level < current; const isBoundary = index === 0 || index === levels.length - 1;
      priceLines.push(candleSeries.createPriceLine({ price: level, color: isBuy ? '#5fd3a0' : '#f56f62', lineWidth: isBoundary ? 2 : 1, lineStyle: 2, axisLabelVisible: isBoundary, title: isBoundary ? (index === 0 ? 'LOWER' : 'UPPER') : '' }));
    });
    if (Number.isFinite(current) && current > 0) priceLines.push(candleSeries.createPriceLine({ price: current, color: '#ffcf83', lineWidth: 1, lineStyle: 0, axisLabelVisible: true, title: 'LATEST' }));
    if (stop > 0) priceLines.push(candleSeries.createPriceLine({ price: stop, color: '#f3c969', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'SL' }));
    if (take > 0) priceLines.push(candleSeries.createPriceLine({ price: take, color: '#b78cff', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'TP' }));
  }

  function setDefaultsAroundPrice(current) {
    if (rangeTouched || !Number.isFinite(current) || current <= 0) return;
    $('grid-lower').value = (current * 0.9).toFixed(2); $('grid-upper').value = (current * 1.1).toFixed(2); $('grid-stop').value = (current * 0.85).toFixed(2); $('grid-take').value = (current * 1.15).toFixed(2);
  }

  function syncQuickSymbol(symbol) {
    const quick = $('grid-quick-symbol');
    if (quick) quick.value = symbol;
  }

  function updateLivePrice(price, changePercent = NaN, source = 'Binance ticker') {
    const next = finitePrice(price, NaN); if (!Number.isFinite(next)) return;
    livePrice = next; liveChange = Number.isFinite(Number(changePercent)) ? Number(changePercent) : liveChange;
    setText('grid-live-price', priceText(next)); setText('grid-live-change', Number.isFinite(liveChange) ? `${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}%` : '—');
    setText('grid-connection-status', source === 'Binance ticker' ? 'WebSocket 已連線 · ticker' : source);
    $('grid-hud')?.classList.toggle('is-stream-connected', source === 'Binance ticker');
    simulateGrid();
  }

  function closeLiveStream() {
    liveGeneration += 1; window.clearTimeout(liveReconnectTimer); liveReconnectTimer = null;
    if (liveSocket) { try { liveSocket.close(); } catch (error) { /* already closed */ } liveSocket = null; }
    $('grid-hud')?.classList.remove('is-stream-connected'); setText('grid-connection-status', 'WebSocket 未連線');
  }

  function scheduleReconnect(generation) {
    if (generation !== liveGeneration || document.hidden || !metaFor(activeSymbol).crypto) return;
    window.clearTimeout(liveReconnectTimer); liveReconnectTimer = window.setTimeout(() => connectLiveStream(), liveReconnectDelay); liveReconnectDelay = Math.min(30000, Math.round(liveReconnectDelay * 1.7));
  }

  function connectLiveStream() {
    closeLiveStream();
    if (!metaFor(activeSymbol).crypto) { setText('grid-connection-status', '股票／ETF 使用公開 K 線'); return; }
    if (typeof WebSocket === 'undefined' || document.hidden) { setText('grid-connection-status', '瀏覽器不支援 WebSocket'); return; }
    const generation = liveGeneration; const stream = `${activeSymbol.toLowerCase()}@ticker`;
    try {
      liveSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
      liveSocket.addEventListener('open', () => { if (generation !== liveGeneration) return; liveReconnectDelay = 1200; setText('grid-connection-status', 'WebSocket 已連線 · ticker'); $('grid-hud')?.classList.add('is-stream-connected'); });
      liveSocket.addEventListener('message', (event) => { if (generation !== liveGeneration) return; try { const payload = JSON.parse(event.data); if (payload?.s === activeSymbol) updateLivePrice(payload.c, payload.P); } catch (error) { /* ignore malformed frames */ } });
      liveSocket.addEventListener('error', () => setText('grid-connection-status', 'WebSocket 異常，準備重連'));
      liveSocket.addEventListener('close', () => { if (generation !== liveGeneration) return; $('grid-hud')?.classList.remove('is-stream-connected'); setText('grid-connection-status', 'WebSocket 已斷線，準備重連'); scheduleReconnect(generation); });
    } catch (error) { setText('grid-connection-status', 'WebSocket 無法建立，準備重連'); scheduleReconnect(generation); }
  }

  async function loadOlderHistory() {
    if (!metaFor(activeSymbol).crypto || historyLoading || historyExhausted || !chartData.length) return;
    historyLoading = true; const oldRange = chart?.timeScale().getVisibleLogicalRange?.(); setText('grid-history-status', '正在載入更早 K 線…');
    try {
      const timeframe = $('grid-timeframe')?.value || '15m'; const oldest = chartData[0].time * 1000 - 1; const older = await fetchMarketPage(activeSymbol, timeframe, oldest); const beforeCount = chartData.length;
      chartData = mergeCandles(older, chartData); const added = chartData.length - beforeCount; if (added < 10 || older.length < (timeframeConfig[timeframe]?.limit || 1000)) historyExhausted = true;
      renderCandles(oldRange && added ? { from: oldRange.from + added, to: oldRange.to + added } : oldRange); simulateGrid(); setText('grid-history-status', historyExhausted ? `歷史已接近資料起點 · ${chartData.length.toLocaleString()} 根` : `已載入 ${chartData.length.toLocaleString()} 根 · 可繼續向左捲動`);
    } catch (error) { setText('grid-history-status', `歷史載入失敗：${error.name === 'AbortError' ? '逾時' : '稍後重試'}`); }
    finally { historyLoading = false; }
  }

  function simulateGrid() {
    if (!chartData.length) return;
    const current = finitePrice(Number.isFinite(livePrice) ? livePrice : chartData[chartData.length - 1].close, chartData[chartData.length - 1].close);
    const lower = finitePrice(value('grid-lower'), current * 0.9); const upper = Math.max(lower * 1.000001, finitePrice(value('grid-upper'), current * 1.1)); const count = Math.min(100, Math.max(2, Math.floor(value('grid-count', 20)))); const capital = Math.max(0, value('grid-capital', 10000)); const stop = finitePrice(value('grid-stop'), lower * 0.95); const take = finitePrice(value('grid-take'), upper * 1.05); const feeRate = Math.min(0.05, Math.max(0, value('grid-fee', 0.1) / 100)); const mode = $('grid-mode')?.value || 'geometric';
    const levels = levelsFor(lower, upper, count, mode); const grossSpacing = mode === 'geometric' ? Math.pow(upper / lower, 1 / count) - 1 : (upper - lower) / count / ((upper + lower) / 2); const netMargin = grossSpacing - (feeRate * 2); const orderCapital = capital / count;
    let cash = capital; let lots = []; let realized = 0; let trades = 0; let peak = capital; let maxDrawdown = 0; let maxInventoryValue = 0; let stopTriggered = false; let takeTriggered = false; const equityPath = [capital];
    for (let index = 1; index < chartData.length; index += 1) {
      const previous = chartData[index - 1].close; const price = chartData[index].close; const crossed = levels.filter((level) => level > Math.min(previous, price) && level <= Math.max(previous, price) && level >= lower && level <= upper); const ordered = price >= previous ? crossed.sort((a, b) => a - b) : crossed.sort((a, b) => b - a);
      ordered.forEach((level) => { if (price < previous) { const buyCost = orderCapital * (1 + feeRate); if (cash >= buyCost) { const quantity = orderCapital / level; cash -= buyCost; lots.push({ level, quantity, cost: buyCost }); } } else if (lots.length) { const lot = lots.shift(); const proceeds = lot.quantity * level * (1 - feeRate); cash += proceeds; realized += proceeds - lot.cost; trades += 1; } });
      const inventoryValue = lots.reduce((sum, lot) => sum + lot.quantity * price, 0); const equity = cash + inventoryValue; maxInventoryValue = Math.max(maxInventoryValue, inventoryValue); peak = Math.max(peak, equity); maxDrawdown = Math.max(maxDrawdown, peak > 0 ? (peak - equity) / peak : 0); equityPath.push(equity); if (price <= stop) stopTriggered = true; if (price >= take) takeTriggered = true;
    }
    const finalValue = equityPath[equityPath.length - 1]; const utilization = capital > 0 ? (maxInventoryValue / capital) * 100 : 0; const lowerDistance = current > lower ? ((current - lower) / current) * 100 : 0; const upperDistance = current < upper ? ((upper - current) / current) * 100 : 0; const nearestBoundary = Math.min(lowerDistance, upperDistance); const breakRisk = current <= lower ? '已跌破下網' : current >= upper ? '已突破上網' : `${pct(nearestBoundary)} 距最近邊界`;
    const timeframe = $('grid-timeframe')?.value || '15m'; const meta = metaFor(activeSymbol); const statusParts = [`${meta.label} ${timeframe} · ${chartData.length.toLocaleString()} 根 K 線`, stopTriggered ? '歷史路徑曾觸及止損' : '', takeTriggered ? '歷史路徑曾觸及止盈' : ''].filter(Boolean);
    renderGridLines(levels, current, stop, take); setText('grid-active-symbol', meta.label); setText('grid-live-price', priceText(current)); setText('grid-spacing', `${pct(grossSpacing * 100)}${mode === 'geometric' ? '（比例）' : '（區間）'}`); setText('grid-net-margin', pct(netMargin * 100)); setText('grid-single-profit', money(Math.max(0, orderCapital * netMargin))); setText('grid-utilization', pct(utilization)); setText('grid-break-risk', breakRisk); setText('grid-drawdown', pct(maxDrawdown * 100)); setText('grid-realized-profit', money(realized)); setText('grid-final-value', money(finalValue)); setText('grid-status', `${statusParts.join('；')}；已完成 ${trades} 次網格回合，手續費按單邊 ${value('grid-fee', 0.1)}% 扣除。右軸僅顯示 LOWER／UPPER／LATEST／SL／TP，中間網格保留虛線。`);
  }

  function renderFallback(reason) {
    const widget = $('grid-tv-widget'); if (!widget) return; const meta = metaFor(activeSymbol); const interval = ({ '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D', '1w': 'W' })[$('grid-timeframe')?.value] || '15';
    widget.innerHTML = `<div class="grid-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>${meta.label} 公開 K 線暫時無法連線：${reason}</strong><span>以下仍可使用網格參數檢查；圖表會以 TradingView ${meta.label} fallback 顯示。</span></div><iframe title="TradingView ${meta.label} 即時圖表" src="https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(meta.tv)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=%2307131d&theme=dark&style=1&timezone=Asia%2FTaipei&withdateranges=1&hideideas=1&studies=Volume%40tv-basicstudies" loading="eager" allow="fullscreen" referrerpolicy="origin"></iframe>`;
    widget.classList.add('is-visible'); $('grid-chart')?.classList.add('is-fallback-hidden');
  }

  async function loadMarket() {
    const requestId = ++requestSequence; const timeframe = $('grid-timeframe')?.value || '15m'; activeSymbol = $('grid-quick-symbol')?.value || 'BTCUSDT'; const meta = metaFor(activeSymbol); syncQuickSymbol(activeSymbol); closeLiveStream(); livePrice = NaN; liveChange = NaN; historyExhausted = false; setText('grid-active-symbol', meta.label); setText('grid-live-price', '—'); setText('grid-live-change', '—'); setText('grid-live-status', `載入 ${meta.label} · ${meta.name}…`); setText('grid-history-status', '正在取得歷史資料…'); $('grid-tv-widget')?.classList.remove('is-visible'); $('grid-chart')?.classList.remove('is-fallback-hidden');
    try {
      chartData = await fetchMarketInitial(activeSymbol, timeframe); if (requestId !== requestSequence) return; if (!chart) initChart(); renderCandles(); const lastClose = chartData[chartData.length - 1].close; setDefaultsAroundPrice(lastClose); updateLivePrice(lastClose, NaN, 'REST snapshot'); setText('grid-live-status', `${meta.source} · ${chartData.length.toLocaleString()} 根 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleString('zh-TW')}`); setText('grid-history-status', meta.crypto ? `已載入 ${chartData.length.toLocaleString()} 根 · 向左捲動載入更早資料` : `已載入 ${chartData.length.toLocaleString()} 根 · ${timeframe}`); simulateGrid(); connectLiveStream();
    } catch (error) { if (requestId !== requestSequence) return; chartData = []; renderFallback(error.name === 'AbortError' ? '連線逾時' : error.message); setText('grid-live-status', `已切換 TradingView ${meta.label}`); setText('grid-history-status', '公開 K 線暫時不可用；稍後可更新行情重試。'); setText('grid-connection-status', meta.crypto ? 'WebSocket 未連線' : '股票／ETF 公開行情不可用'); }
  }

  function bind() {
    ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-stop', 'grid-take', 'grid-fee'].forEach((id) => $(id)?.addEventListener('input', () => { rangeTouched = true; simulateGrid(); }));
    $('grid-quick-symbol')?.addEventListener('change', loadMarket); $('grid-timeframe')?.addEventListener('change', loadMarket); $('grid-refresh')?.addEventListener('click', loadMarket);
    document.addEventListener('visibilitychange', () => { if (document.hidden) closeLiveStream(); else connectLiveStream(); });
    simulateGrid(); loadMarket();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

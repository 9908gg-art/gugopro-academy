(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const number = (id) => {
    const value = Number($(id)?.value);
    return Number.isFinite(value) ? value : NaN;
  };
  const finitePrice = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(1e12, Math.max(1e-8, parsed));
  };
  const setText = (id, value) => { if ($(id)) $(id).textContent = value; };
  const formatMoney = (value) => {
    if (!Number.isFinite(value)) return '—';
    if (Math.abs(value) >= 1e11) return value.toExponential(2);
    return value.toLocaleString('zh-TW', { maximumFractionDigits: 2 });
  };
  const formatPrice = (value) => {
    if (!Number.isFinite(value)) return '—';
    const digits = priceDigits(value);
    return value.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: digits });
  };
  const percent = (value) => Number.isFinite(value) ? `${value.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}%` : '—';
  const priceDigits = (value) => {
    const absolute = Math.abs(Number(value) || 0);
    if (absolute >= 1000) return 2;
    if (absolute >= 1) return 4;
    return 8;
  };
  const isCrypto = (symbol) => /(?:USDT|USDC|BUSD)$/.test(symbol);

  const symbolCatalog = [
    { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', source: 'Binance Public API', tv: 'BINANCE:BTCUSDT' },
    { symbol: 'ETHUSDT', name: 'Ethereum / Tether', source: 'Binance Public API', tv: 'BINANCE:ETHUSDT' },
    { symbol: 'SOLUSDT', name: 'Solana / Tether', source: 'Binance Public API', tv: 'BINANCE:SOLUSDT' },
    { symbol: 'AAPL', name: 'Apple Inc.', source: 'Yahoo Finance', tv: 'NASDAQ:AAPL' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', source: 'Yahoo Finance', tv: 'NASDAQ:MSFT' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', source: 'Yahoo Finance', tv: 'NASDAQ:NVDA' },
    { symbol: 'TSLA', name: 'Tesla Inc.', source: 'Yahoo Finance', tv: 'NASDAQ:TSLA' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', source: 'Yahoo Finance', tv: 'NASDAQ:QQQ' },
    { symbol: '0050.TW', name: '元大台灣50', source: 'Yahoo Finance', tv: 'TWSE:0050' },
    { symbol: '00919.TW', name: '群益台灣精選高息', source: 'Yahoo Finance', tv: 'TWSE:00919' }
  ];

  const timeframeConfig = {
    '1m': { interval: '1m', range: '1d', binanceLimit: 1000 },
    '5m': { interval: '5m', range: '5d', binanceLimit: 1000 },
    '15m': { interval: '15m', range: '30d', binanceLimit: 1000 },
    '1h': { interval: '1h', range: '90d', binanceLimit: 1000 },
    '1d': { interval: '1d', range: '1y', binanceLimit: 500 }
  };

  const markerConfig = {
    entry: { input: 'rr-entry-price', color: '#7ed6b0', label: '進場', title: 'ENTRY' },
    stop: { input: 'rr-stop-price', color: '#f56f62', label: '停損', title: 'STOP' },
    target: { input: 'rr-target-price', color: '#ffb25f', label: '目標', title: 'TARGET' }
  };

  let chart = null;
  let candleSeries = null;
  let volumeSeries = null;
  let chartData = [];
  let activeMeta = symbolCatalog[0];
  let priceLines = {};
  let dragState = null;
  let loadSequence = 0;

  function cleanSymbol(value) {
    let symbol = String(value || '').trim().toUpperCase().replace(/[\s/:-]/g, '');
    if (/^\d{4}$/.test(symbol)) symbol += '.TW';
    if (/^(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|LINK)$/.test(symbol)) symbol += 'USDT';
    return symbol || 'BTCUSDT';
  }

  function findMeta(value) {
    const symbol = cleanSymbol(value);
    return symbolCatalog.find((item) => item.symbol === symbol) || {
      symbol,
      name: symbol,
      source: isCrypto(symbol) ? 'Binance Public API' : 'Yahoo Finance',
      tv: isCrypto(symbol) ? `BINANCE:${symbol}` : (/\.TW$/.test(symbol) ? `TWSE:${symbol.replace('.TW', '')}` : `NASDAQ:${symbol}`)
    };
  }

  function fetchWithTimeout(url, timeout = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store' }).finally(() => window.clearTimeout(timer));
  }

  async function fetchBinance(symbol, timeframe) {
    const config = timeframeConfig[timeframe] || timeframeConfig['1d'];
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${config.interval}&limit=${config.binanceLimit}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
    const rows = await response.json();
    const parsed = rows.map((row) => ({
      time: Math.floor(Number(row[0]) / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5])
    })).filter((row) => [row.time, row.open, row.high, row.low, row.close].every(Number.isFinite));
    if (parsed.length < 12) throw new Error('Binance K 線資料不足');
    return parsed;
  }

  async function fetchYahoo(symbol, timeframe) {
    const config = timeframeConfig[timeframe] || timeframeConfig['1d'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.interval}&includePrePost=false&events=div%2Csplits`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result?.timestamp?.length) throw new Error('Yahoo K 線資料不足');
    const quote = result.indicators?.quote?.[0] || {};
    const parsed = result.timestamp.map((time, index) => ({
      time: Number(time),
      open: Number(quote.open?.[index]),
      high: Number(quote.high?.[index]),
      low: Number(quote.low?.[index]),
      close: Number(quote.close?.[index]),
      volume: Number(quote.volume?.[index] || 0)
    })).filter((row) => [row.time, row.open, row.high, row.low, row.close].every(Number.isFinite));
    if (parsed.length < 12) throw new Error('Yahoo K 線資料不足');
    return parsed;
  }

  function initChart() {
    if (!window.LightweightCharts || !$('rr-chart')) throw new Error('Lightweight Charts 尚未載入');
    const container = $('rr-chart');
    chart = window.LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: Math.max(380, container.clientHeight || 440),
      layout: { background: { type: 'solid', color: '#07131d' }, textColor: '#a8bcc5', fontFamily: 'DM Sans, sans-serif' },
      grid: { vertLines: { color: 'rgba(152, 182, 190, 0.08)' }, horzLines: { color: 'rgba(152, 182, 190, 0.08)' } },
      crosshair: { mode: 0, vertLine: { color: 'rgba(255, 178, 95, 0.5)', width: 1, style: 2 }, horzLine: { color: 'rgba(126, 214, 176, 0.6)', width: 1, style: 2 } },
      rightPriceScale: { borderColor: 'rgba(176, 202, 208, 0.25)', scaleMargins: { top: 0.08, bottom: 0.18 } },
      timeScale: { borderColor: 'rgba(176, 202, 208, 0.25)', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    });
    candleSeries = chart.addCandlestickSeries({
      upColor: '#5fd3a0', downColor: '#f56f62', borderUpColor: '#5fd3a0', borderDownColor: '#f56f62', wickUpColor: '#5fd3a0', wickDownColor: '#f56f62',
      priceLineVisible: false, lastValueVisible: true
    });
    volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.applyOptions({ color: 'rgba(126, 214, 176, 0.35)' });
    new ResizeObserver(() => chart?.resize(container.clientWidth, Math.max(380, container.clientHeight || 440))).observe(container);
    container.addEventListener('pointerdown', beginNativeDrag);
    container.addEventListener('pointermove', moveNativeDrag);
    window.addEventListener('pointerup', endNativeDrag);
  }

  function renderChart() {
    if (!candleSeries || !volumeSeries || !chartData.length) return;
    candleSeries.setData(chartData.map((row) => ({ time: row.time, open: row.open, high: row.high, low: row.low, close: row.close })));
    volumeSeries.setData(chartData.map((row) => ({ time: row.time, value: Math.max(0, row.volume || 0), color: row.close >= row.open ? 'rgba(95, 211, 160, 0.34)' : 'rgba(245, 111, 98, 0.34)' })));
    chart.timeScale().fitContent();
  }

  function removePriceLines() {
    if (!candleSeries) return;
    Object.values(priceLines).forEach((line) => { try { candleSeries.removePriceLine(line); } catch (error) { /* line already removed */ } });
    priceLines = {};
  }

  function renderNativePriceLines() {
    if (!candleSeries || !chartData.length) return;
    removePriceLines();
    Object.entries(markerConfig).forEach(([name, config]) => {
      const value = finitePrice(number(config.input), NaN);
      if (!Number.isFinite(value)) return;
      priceLines[name] = candleSeries.createPriceLine({
        price: value,
        color: config.color,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: config.title
      });
    });
  }

  function nearestMarker(y) {
    if (!candleSeries) return null;
    const candidates = Object.entries(markerConfig).map(([name, config]) => {
      const price = finitePrice(number(config.input), NaN);
      const coordinate = Number.isFinite(price) ? candleSeries.priceToCoordinate(price) : null;
      return { name, coordinate };
    }).filter((item) => Number.isFinite(item.coordinate));
    candidates.sort((a, b) => Math.abs(a.coordinate - y) - Math.abs(b.coordinate - y));
    return candidates[0] && Math.abs(candidates[0].coordinate - y) <= 16 ? candidates[0].name : null;
  }

  function beginNativeDrag(event) {
    if (!candleSeries || !chartData.length || event.button !== 0) return;
    const rect = $('rr-chart').getBoundingClientRect();
    const marker = nearestMarker(event.clientY - rect.top);
    if (!marker) return;
    dragState = { marker, pointerId: event.pointerId };
    $('rr-chart').setPointerCapture?.(event.pointerId);
    document.body.classList.add('is-dragging-price');
    event.preventDefault();
  }

  function moveNativeDrag(event) {
    if (!dragState || !candleSeries) return;
    const rect = $('rr-chart').getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const price = finitePrice(candleSeries.coordinateToPrice(y), NaN);
    const input = $(markerConfig[dragState.marker].input);
    if (!input || !Number.isFinite(price)) return;
    input.value = price.toFixed(priceDigits(price));
    calculate();
    event.preventDefault();
  }

  function endNativeDrag() {
    if (!dragState) return;
    dragState = null;
    document.body.classList.remove('is-dragging-price');
  }

  function calculate() {
    const entry = finitePrice(number('rr-entry-price'), NaN);
    const stop = finitePrice(number('rr-stop-price'), NaN);
    const target = finitePrice(number('rr-target-price'), NaN);
    const capital = Math.max(0, number('rr-capital'));
    const riskPercent = Math.min(100, Math.max(0, number('rr-risk-percent')));
    const unitRisk = Math.abs(entry - stop);
    const unitReward = Math.abs(target - entry);
    const validNumbers = [entry, stop, target, capital, riskPercent].every(Number.isFinite) && unitRisk > 0 && unitReward > 0;
    const isLong = validNumbers && target > entry && entry > stop;
    const isShort = validNumbers && target < entry && entry < stop;
    const direction = isLong ? '多頭計畫 / LONG' : isShort ? '空頭計畫 / SHORT' : validNumbers ? '價格方向不一致' : '等待輸入';
    const budget = capital * riskPercent / 100;
    const position = validNumbers ? Math.floor(budget / unitRisk) : 0;
    const ratio = validNumbers ? unitReward / unitRisk : NaN;
    const notional = position * entry;
    const profit = position * unitReward;
    setText('rr-direction', direction);
    setText('rr-ratio', Number.isFinite(ratio) ? `${ratio.toFixed(2)}R` : '—');
    setText('rr-risk-per-unit', Number.isFinite(unitRisk) ? formatMoney(unitRisk) : '—');
    setText('rr-risk-budget', Number.isFinite(budget) ? formatMoney(budget) : '—');
    setText('rr-position-size', validNumbers ? position.toLocaleString('zh-TW') : '—');
    setText('rr-notional', validNumbers ? formatMoney(notional) : '—');
    setText('rr-profit', validNumbers ? formatMoney(profit) : '—');
    setText('rr-status', !validNumbers ? '請輸入有效的正數價格、資金與風險百分比。' : (!isLong && !isShort ? '進出場方向不一致：多頭需目標 ＞ 進場 ＞ 停損，空頭需目標 ＜ 進場 ＜ 停損。' : `以 ${position.toLocaleString('zh-TW')} 單位計算，風險預算約 ${formatMoney(budget)}，模型潛在獲利約 ${formatMoney(profit)}；尚未扣除費用、滑價與跳空。`));
    $('rr-result-card')?.classList.toggle('is-invalid', validNumbers && !isLong && !isShort);
    renderNativePriceLines();
  }

  function calculateStructure(data) {
    if (!data?.length) return;
    const lookback = data.slice(-Math.min(120, data.length));
    const current = lookback[lookback.length - 1].close;
    const pivotsHigh = [];
    const pivotsLow = [];
    for (let i = 2; i < lookback.length - 2; i += 1) {
      const row = lookback[i];
      if (row.high >= lookback[i - 1].high && row.high >= lookback[i - 2].high && row.high >= lookback[i + 1].high && row.high >= lookback[i + 2].high) pivotsHigh.push(row.high);
      if (row.low <= lookback[i - 1].low && row.low <= lookback[i - 2].low && row.low <= lookback[i + 1].low && row.low <= lookback[i + 2].low) pivotsLow.push(row.low);
    }
    const support = [...pivotsLow.filter((value) => value < current), current * 0.97].sort((a, b) => b - a)[0];
    const resistance = [...pivotsHigh.filter((value) => value > current), current * 1.06].sort((a, b) => a - b)[0];
    const trs = lookback.slice(1).map((row, index) => Math.max(row.high - row.low, Math.abs(row.high - lookback[index].close), Math.abs(row.low - lookback[index].close))).filter(Number.isFinite);
    const atr = trs.slice(-14).reduce((sum, value) => sum + value, 0) / Math.max(1, Math.min(14, trs.length));
    const atrPercent = current ? (atr / current) * 100 : NaN;
    setText('rr-support-level', formatPrice(support));
    setText('rr-resistance-level', formatPrice(resistance));
    setText('rr-volatility-level', Number.isFinite(atrPercent) ? `${percent(atrPercent)} ATR` : '—');
    setText('rr-structure-note', `近 ${lookback.length} 根 K 線；最新價 ${formatPrice(current)}`);
    $('rr-use-support')?.setAttribute('data-price', String(support));
    $('rr-use-resistance')?.setAttribute('data-price', String(resistance));
  }

  function setPlanAround(lastClose) {
    const digits = priceDigits(lastClose);
    const entry = Number(lastClose.toFixed(digits));
    const stop = Number((lastClose * 0.97).toFixed(digits));
    const target = Number((lastClose * 1.06).toFixed(digits));
    $('rr-entry-price').value = entry;
    $('rr-stop-price').value = stop;
    $('rr-target-price').value = target;
  }

  function renderTradingViewFallback(symbol, reason = '公開行情端點暫時無法連線') {
    const widget = $('rr-tv-widget');
    if (!widget) return;
    const meta = findMeta(symbol);
    const interval = ({ '1m': '1', '5m': '5', '15m': '15', '1h': '60', '1d': 'D' })[$('rr-timeframe')?.value] || 'D';
    const src = `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(meta.tv)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=%2307131d&theme=dark&style=1&timezone=Asia%2FTaipei&withdateranges=1&hideideas=1&studies=Volume%40tv-basicstudies`;
    widget.innerHTML = `<div class="rr-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>${reason}</strong><span>目前顯示 TradingView 即時圖表；價格線拖曳需在公開行情可用時使用，仍可用下方數值欄位調整風報計畫。</span></div><iframe title="TradingView ${meta.symbol} 即時圖表" src="${src}" loading="eager" allow="fullscreen" referrerpolicy="origin"></iframe>`;
    widget.classList.add('is-visible');
    $('rr-chart')?.classList.add('is-fallback-hidden');
  }

  async function loadSymbol(value = $('rr-symbol-search')?.value) {
    const meta = findMeta(value);
    const timeframe = $('rr-timeframe')?.value || '1d';
    const requestId = ++loadSequence;
    activeMeta = meta;
    setText('rr-active-symbol', meta.symbol);
    setText('rr-active-name', meta.name);
    setText('rr-data-status', `載入 ${meta.symbol} · ${meta.source}…`);
    $('rr-tv-widget')?.classList.remove('is-visible');
    $('rr-chart')?.classList.remove('is-fallback-hidden');
    $('rr-chart-empty')?.classList.remove('is-visible');
    try {
      chartData = isCrypto(meta.symbol) ? await fetchBinance(meta.symbol, timeframe) : await fetchYahoo(meta.symbol, timeframe);
      if (requestId !== loadSequence) return;
      if (!chart) initChart();
      renderChart();
      const lastClose = chartData[chartData.length - 1].close;
      setPlanAround(lastClose);
      setText('rr-data-status', `${meta.source} · ${chartData.length} 根 K 線 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleString('zh-TW')}`);
      calculateStructure(chartData);
      calculate();
    } catch (error) {
      if (requestId !== loadSequence) return;
      chartData = [];
      renderTradingViewFallback(meta.symbol, `公開 K 線端點失敗：${error.name === 'AbortError' ? '連線逾時' : error.message}`);
      setText('rr-data-status', `已切換 TradingView · ${meta.symbol}`);
      setText('rr-structure-note', '公開 K 線暫時不可用；可用下方數值欄位離線調整風報計畫。');
      setText('rr-support-level', '—');
      setText('rr-resistance-level', '—');
      setText('rr-volatility-level', '—');
      calculate();
    }
  }

  function updateSuggestions() {
    const query = cleanSymbol($('rr-symbol-search')?.value || '');
    const matches = symbolCatalog.filter((item) => item.symbol.includes(query) || item.name.toUpperCase().includes(query)).slice(0, 6);
    const box = $('rr-symbol-suggestions');
    if (!box) return;
    box.innerHTML = matches.map((item) => `<button type="button" role="option" data-symbol="${item.symbol}"><b>${item.symbol}</b><span>${item.name}</span></button>`).join('');
    box.classList.toggle('is-visible', Boolean(matches.length && document.activeElement === $('rr-symbol-search')));
  }

  function resetLines() {
    if (chartData.length) setPlanAround(chartData[chartData.length - 1].close);
    calculate();
  }

  function bind() {
    ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'].forEach((id) => $(id)?.addEventListener('input', calculate));
    $('rr-load-symbol')?.addEventListener('click', () => loadSymbol());
    $('rr-timeframe')?.addEventListener('change', () => loadSymbol());
    $('rr-symbol-search')?.addEventListener('input', updateSuggestions);
    $('rr-symbol-search')?.addEventListener('focus', updateSuggestions);
    $('rr-symbol-search')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); loadSymbol(); $('rr-symbol-suggestions')?.classList.remove('is-visible'); } });
    $('rr-symbol-suggestions')?.addEventListener('click', (event) => { const button = event.target.closest('button[data-symbol]'); if (!button) return; $('rr-symbol-search').value = button.dataset.symbol; $('rr-symbol-suggestions').classList.remove('is-visible'); loadSymbol(button.dataset.symbol); });
    document.addEventListener('click', (event) => { if (!$('rr-search-wrap')?.contains(event.target)) $('rr-symbol-suggestions')?.classList.remove('is-visible'); });
    $('rr-use-support')?.addEventListener('click', () => { $('rr-stop-price').value = $('rr-use-support').dataset.price || ''; calculate(); });
    $('rr-use-resistance')?.addEventListener('click', () => { $('rr-target-price').value = $('rr-use-resistance').dataset.price || ''; calculate(); });
    $('rr-reset-lines')?.addEventListener('click', resetLines);
    calculate();
    loadSymbol('BTCUSDT');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

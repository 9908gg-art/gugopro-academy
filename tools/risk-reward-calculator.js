(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fields = ['rr-entry-price', 'rr-stop-price', 'rr-target-price', 'rr-capital', 'rr-risk-percent'];
  const number = (id) => Number($(id)?.value);
  const format = (value, digits = 2) => Number.isFinite(value)
    ? value.toLocaleString('zh-TW', { maximumFractionDigits: digits })
    : '—';
  const symbolCatalog = [
    { symbol: 'AAPL', name: 'Apple Inc.', source: 'Yahoo Finance' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', source: 'Yahoo Finance' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', source: 'Yahoo Finance' },
    { symbol: 'TSLA', name: 'Tesla Inc.', source: 'Yahoo Finance' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', source: 'Yahoo Finance' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', source: 'Yahoo Finance' },
    { symbol: '0050.TW', name: '元大台灣50 ETF', source: 'Yahoo Finance' },
    { symbol: '00919.TW', name: '群益台灣精選高息 ETF', source: 'Yahoo Finance' },
    { symbol: '2330.TW', name: '台積電', source: 'Yahoo Finance' },
    { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', source: 'Binance Public API' },
    { symbol: 'ETHUSDT', name: 'Ethereum / Tether', source: 'Binance Public API' },
    { symbol: 'SOLUSDT', name: 'Solana / Tether', source: 'Binance Public API' }
  ];
  const markerConfig = {
    entry: { input: 'rr-entry-price', color: '#7ed6b0', label: '進場', className: 'entry-marker' },
    stop: { input: 'rr-stop-price', color: '#f56f62', label: '停損', className: 'stop-marker' },
    target: { input: 'rr-target-price', color: '#ffb25f', label: '目標', className: 'target-marker' }
  };
  let chart;
  let candleSeries;
  let chartData = [];
  let activeMeta = symbolCatalog[0];
  let chartBounds = { min: 0, max: 1 };
  let priceLines = {};
  let dragState = null;
  let loadSequence = 0;

  const setText = (id, value) => { if ($(id)) $(id).textContent = value; };
  const isCrypto = (symbol) => /(?:USDT|USDC|BUSD)$/.test(symbol);
  const cleanSymbol = (value) => String(value || '').trim().toUpperCase().replace(/[\s/:-]/g, '');
  const findMeta = (symbol) => symbolCatalog.find((item) => item.symbol === symbol) || {
    symbol,
    name: isCrypto(symbol) ? `${symbol.replace(/USDT$/, '')} / Tether` : `${symbol} 市場商品`,
    source: isCrypto(symbol) ? 'Binance Public API' : 'Yahoo Finance'
  };

  function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors' }).finally(() => clearTimeout(timer));
  }

  async function fetchYahoo(symbol, timeframe) {
    const interval = timeframe === '1h' ? '1h' : timeframe === '4h' ? '1h' : '1d';
    const range = timeframe === '1h' ? '30d' : timeframe === '4h' ? '90d' : '6mo';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplits`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Yahoo Finance HTTP ${response.status}`);
    const json = await response.json();
    const result = json?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0] || {};
    const rows = timestamps.map((timestamp, index) => ({
      time: timestamp,
      open: Number(quote.open?.[index]),
      high: Number(quote.high?.[index]),
      low: Number(quote.low?.[index]),
      close: Number(quote.close?.[index])
    })).filter((row) => Object.values(row).every(Number.isFinite));
    if (!rows.length) throw new Error('Yahoo Finance 沒有回傳可用 K 線');
    if (timeframe === '4h') return compressHourly(rows, 4);
    return rows;
  }

  async function fetchBinance(symbol, timeframe) {
    const interval = timeframe === '1d' ? '1d' : timeframe === '4h' ? '4h' : '1h';
    const limit = timeframe === '1d' ? 180 : timeframe === '4h' ? 540 : 720;
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
    const rows = await response.json();
    const data = rows.map((row) => ({
      time: Math.floor(Number(row[0]) / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4])
    })).filter((row) => Object.values(row).every(Number.isFinite));
    if (!data.length) throw new Error('Binance 沒有回傳可用 K 線');
    return data;
  }

  function compressHourly(rows, hours) {
    const grouped = [];
    rows.forEach((row) => {
      const bucket = Math.floor(row.time / (hours * 3600)) * hours * 3600;
      const previous = grouped[grouped.length - 1];
      if (!previous || previous.time !== bucket) {
        grouped.push({ time: bucket, open: row.open, high: row.high, low: row.low, close: row.close });
      } else {
        previous.high = Math.max(previous.high, row.high);
        previous.low = Math.min(previous.low, row.low);
        previous.close = row.close;
      }
    });
    return grouped;
  }

  function initChart() {
    const container = $('rr-chart');
    if (!container || !window.LightweightCharts) return false;
    chart = window.LightweightCharts.createChart(container, {
      layout: { background: { color: 'transparent' }, textColor: '#a9b6c8', fontFamily: 'DM Sans, sans-serif' },
      grid: { vertLines: { color: 'rgba(170, 193, 218, 0.07)' }, horzLines: { color: 'rgba(170, 193, 218, 0.07)' } },
      rightPriceScale: { borderColor: 'rgba(170, 193, 218, 0.18)', textColor: '#a9b6c8' },
      timeScale: { borderColor: 'rgba(170, 193, 218, 0.18)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0, vertLine: { color: 'rgba(255, 178, 95, .5)' }, horzLine: { color: 'rgba(255, 178, 95, .5)' } },
      handleScroll: true,
      handleScale: true
    });
    candleSeries = chart.addCandlestickSeries({
      upColor: '#5fd3a0', downColor: '#f56f62', borderVisible: false,
      wickUpColor: '#5fd3a0', wickDownColor: '#f56f62', priceLineVisible: false
    });
    new ResizeObserver(() => chart?.resize(container.clientWidth, container.clientHeight)).observe(container);
    return true;
  }

  function priceDigits(value) {
    if (value >= 1000) return 0;
    if (value >= 100) return 2;
    if (value >= 1) return 3;
    return 6;
  }

  function setPriceLine(name, price) {
    if (!candleSeries || !Number.isFinite(price)) return;
    if (priceLines[name]) candleSeries.removePriceLine(priceLines[name]);
    const config = markerConfig[name];
    priceLines[name] = candleSeries.createPriceLine({
      price,
      color: config.color,
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: config.label
    });
  }

  function recalcBounds() {
    const values = chartData.flatMap((row) => [row.high, row.low]).concat(Object.keys(markerConfig).map((name) => number(markerConfig[name].input)));
    const valid = values.filter(Number.isFinite);
    if (!valid.length) return;
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const padding = Math.max((max - min) * 0.1, max * 0.002, 0.000001);
    chartBounds = { min: min - padding, max: max + padding };
  }

  function priceToPercent(price) {
    return Math.max(3, Math.min(97, ((chartBounds.max - price) / (chartBounds.max - chartBounds.min)) * 100));
  }

  function percentToPrice(percent) {
    return chartBounds.max - ((percent / 100) * (chartBounds.max - chartBounds.min));
  }

  function renderMarkers() {
    const layer = $('rr-chart-labels');
    const zones = $('rr-chart-zones');
    if (!layer || !zones) return;
    layer.innerHTML = '';
    zones.innerHTML = '';
    recalcBounds();
    const entry = number('rr-entry-price');
    const stop = number('rr-stop-price');
    const target = number('rr-target-price');
    const positions = { entry: priceToPercent(entry), stop: priceToPercent(stop), target: priceToPercent(target) };
    Object.entries(markerConfig).forEach(([name, config]) => {
      const line = document.createElement('div');
      line.className = `rr-drag-line ${config.className}`;
      line.dataset.marker = name;
      line.style.top = `${positions[name]}%`;
      line.style.setProperty('--marker-color', config.color);
      line.innerHTML = `<button type="button" class="rr-marker-label" aria-label="拖曳${config.label}線">${config.label} <b>${format(number(config.input), priceDigits(number(config.input)))}</b></button><span class="rr-line-dash"></span>`;
      line.addEventListener('pointerdown', startDrag);
      layer.appendChild(line);
    });
    const top = Math.min(positions.entry, positions.target);
    const bottom = Math.max(positions.entry, positions.target);
    const riskTop = Math.min(positions.entry, positions.stop);
    const riskBottom = Math.max(positions.entry, positions.stop);
    const reward = document.createElement('div');
    reward.className = 'rr-zone rr-zone-profit'; reward.style.top = `${top}%`; reward.style.height = `${Math.max(1, bottom - top)}%`; zones.appendChild(reward);
    const risk = document.createElement('div');
    risk.className = 'rr-zone rr-zone-loss'; risk.style.top = `${riskTop}%`; risk.style.height = `${Math.max(1, riskBottom - riskTop)}%`; zones.appendChild(risk);
    Object.entries(markerConfig).forEach(([name]) => setPriceLine(name, number(markerConfig[name].input)));
  }

  function startDrag(event) {
    event.preventDefault();
    const marker = event.currentTarget.dataset.marker;
    dragState = { marker, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.body.classList.add('is-dragging-price');
    document.addEventListener('pointermove', dragMarker);
    document.addEventListener('pointerup', endDrag, { once: true });
  }

  function dragMarker(event) {
    if (!dragState) return;
    const rect = $('rr-chart').getBoundingClientRect();
    const percent = Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100));
    const price = percentToPrice(percent);
    const input = $(markerConfig[dragState.marker].input);
    if (input && Number.isFinite(price)) {
      input.value = price.toFixed(priceDigits(price));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function endDrag() {
    dragState = null;
    document.body.classList.remove('is-dragging-price');
    document.removeEventListener('pointermove', dragMarker);
  }

  function calculate() {
    const entry = number('rr-entry-price');
    const stop = number('rr-stop-price');
    const target = number('rr-target-price');
    const capital = number('rr-capital');
    const riskPercent = number('rr-risk-percent');
    const values = [entry, stop, target, capital, riskPercent];
    const invalid = values.some((value) => !Number.isFinite(value)) || values.slice(0, 4).some((value) => value <= 0) || riskPercent <= 0 || riskPercent > 100;
    if (invalid) {
      ['rr-ratio', 'rr-risk-per-unit', 'rr-risk-budget', 'rr-position-size', 'rr-notional', 'rr-profit'].forEach((id) => setText(id, '—'));
      setText('rr-direction', '需要有效輸入');
      setText('rr-status', '請輸入大於 0 的價格、資金與 0–100% 之間的單筆風險百分比。');
      renderMarkers();
      return;
    }
    const isLong = target > entry && stop < entry;
    const isShort = target < entry && stop > entry;
    if (!isLong && !isShort) {
      ['rr-ratio', 'rr-risk-per-unit', 'rr-risk-budget', 'rr-position-size', 'rr-notional', 'rr-profit'].forEach((id) => setText(id, '—'));
      setText('rr-direction', '價格方向不一致');
      setText('rr-status', '多頭需符合「目標 > 進場 > 停損」；空頭需符合「停損 > 進場 > 目標」。');
      renderMarkers();
      return;
    }
    const riskPerUnit = Math.abs(entry - stop);
    const rewardPerUnit = Math.abs(target - entry);
    const ratio = rewardPerUnit / riskPerUnit;
    const riskBudget = capital * riskPercent / 100;
    const positionSize = Math.floor(riskBudget / riskPerUnit);
    const notional = positionSize * entry;
    const maxLoss = positionSize * riskPerUnit;
    const profit = positionSize * rewardPerUnit;
    setText('rr-ratio', `${format(ratio)}R`); setText('rr-risk-per-unit', format(riskPerUnit));
    setText('rr-risk-budget', format(riskBudget)); setText('rr-position-size', format(positionSize, 0));
    setText('rr-notional', format(notional)); setText('rr-profit', format(profit));
    setText('rr-direction', isLong ? '多頭計畫 / Long' : '空頭計畫 / Short');
    setText('rr-status', positionSize < 1
      ? `風險預算 ${format(riskBudget)} 小於一單位風險 ${format(riskPerUnit)}；依此設定不應建立部位。`
      : `以 ${format(positionSize, 0)} 單位計算，最大價格損失約 ${format(maxLoss)}，到達目標的模型潛在獲利約 ${format(profit)}；尚未扣除費用、滑價與跳空。`);
    renderMarkers();
  }

  function calculateStructure(data) {
    const lookback = data.slice(-80);
    const current = data[data.length - 1]?.close;
    const supports = [];
    const resistances = [];
    for (let i = 2; i < lookback.length - 2; i += 1) {
      const row = lookback[i];
      const nearby = lookback.slice(i - 2, i + 3);
      if (row.low <= Math.min(...nearby.map((item) => item.low))) supports.push(row.low);
      if (row.high >= Math.max(...nearby.map((item) => item.high))) resistances.push(row.high);
    }
    const under = supports.filter((value) => value < current);
    const over = resistances.filter((value) => value > current);
    const support = under.length ? under[under.length - 1] : Math.min(...lookback.map((item) => item.low));
    const resistance = over.length ? over[over.length - 1] : Math.max(...lookback.map((item) => item.high));
    const tr = lookback.slice(1).map((row, index) => Math.max(row.high - row.low, Math.abs(row.high - lookback[index].close), Math.abs(row.low - lookback[index].close)));
    const atr = tr.length ? tr.reduce((sum, value) => sum + value, 0) / tr.length : 0;
    setText('rr-support-level', format(support, priceDigits(support)));
    setText('rr-resistance-level', format(resistance, priceDigits(resistance)));
    setText('rr-volatility-level', `${format((atr / current) * 100)}% ATR`);
    setText('rr-structure-note', `近 ${lookback.length} 根 K 線；目前價 ${format(current, priceDigits(current))}`);
    $('rr-use-support')?.setAttribute('data-price', support);
    $('rr-use-resistance')?.setAttribute('data-price', resistance);
  }

  function seedTradePlan(lastClose) {
    const digits = priceDigits(lastClose);
    const entry = Number(lastClose.toFixed(digits));
    const stop = Number((lastClose * 0.97).toFixed(digits));
    const target = Number((lastClose * 1.06).toFixed(digits));
    $('rr-entry-price').value = entry;
    $('rr-stop-price').value = stop;
    $('rr-target-price').value = target;
  }

  function tradingViewSymbol(symbol) {
    const known = { SPY: 'AMEX:SPY', QQQ: 'NASDAQ:QQQ', AAPL: 'NASDAQ:AAPL', MSFT: 'NASDAQ:MSFT', NVDA: 'NASDAQ:NVDA', TSLA: 'NASDAQ:TSLA' };
    if (known[symbol]) return known[symbol];
    if (/\.TW$/.test(symbol)) return `TWSE:${symbol.replace('.TW', '')}`;
    if (isCrypto(symbol)) return `BINANCE:${symbol}`;
    return `NASDAQ:${symbol}`;
  }

  function renderTradingViewFallback(symbol) {
    const widget = $('rr-tv-widget');
    if (!widget) return;
    widget.innerHTML = '';
    widget.classList.add('is-visible');
    $('rr-chart')?.classList.add('is-fallback-hidden');
    if (!window.TradingView) {
      widget.innerHTML = '<div class="rr-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>公開 K 線端點暫時無法連線</strong><span>請稍後重試；數值風控與價格標註仍可使用。</span></div>';
      return;
    }
    new window.TradingView.widget({
      autosize: true,
      symbol: tradingViewSymbol(symbol),
      interval: $('rr-timeframe')?.value === '1d' ? 'D' : '60',
      timezone: 'Asia/Taipei',
      theme: 'dark',
      style: '1',
      locale: 'zh_TW',
      toolbar_bg: '#0d1825',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: 'rr-tv-widget'
    });
  }

  async function loadSymbol(value = $('rr-symbol-search')?.value) {
    const symbol = cleanSymbol(value) || 'AAPL';
    const timeframe = $('rr-timeframe')?.value || '1d';
    const meta = findMeta(symbol);
    const requestId = ++loadSequence;
    activeMeta = meta;
    setText('rr-data-status', `載入 ${meta.symbol} · ${meta.source}…`);
    $('rr-chart-empty')?.classList.remove('is-visible');
    $('rr-tv-widget')?.classList.remove('is-visible');
    $('rr-chart')?.classList.remove('is-fallback-hidden');
    try {
      chartData = isCrypto(symbol) ? await fetchBinance(symbol, timeframe) : await fetchYahoo(symbol, timeframe);
      if (requestId !== loadSequence) return;
      if (!chart) initChart();
      if (!candleSeries) throw new Error('K 線圖表庫尚未載入');
      candleSeries.setData(chartData);
      chart.timeScale().fitContent();
      const lastClose = chartData[chartData.length - 1].close;
      seedTradePlan(lastClose);
      $('rr-symbol-search').value = symbol;
      setText('rr-active-symbol', meta.symbol);
      setText('rr-active-name', meta.name);
      $('rr-tv-widget')?.classList.remove('is-visible');
      $('rr-chart')?.classList.remove('is-fallback-hidden');
      setText('rr-data-status', `${meta.source} · ${chartData.length} 根 K 線 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleDateString('zh-TW')}`);
      calculateStructure(chartData);
      calculate();
    } catch (error) {
      if (requestId !== loadSequence) return;
      $('rr-chart-empty')?.classList.remove('is-visible');
      renderTradingViewFallback(symbol);
      setText('rr-data-status', `公開 K 線端點失敗，已切換 TradingView：${error.name === 'AbortError' ? '連線逾時' : error.message}`);
      setText('rr-structure-note', '請檢查代號或稍後重試；數值風控仍可離線使用。');
      calculate();
    }
  }

  function showSuggestions(value) {
    const box = $('rr-symbol-suggestions');
    if (!box) return;
    const query = cleanSymbol(value);
    const matches = symbolCatalog.filter((item) => !query || `${item.symbol}${item.name}`.toUpperCase().includes(query)).slice(0, 6);
    box.innerHTML = matches.map((item) => `<button type="button" role="option" data-symbol="${item.symbol}"><b>${item.symbol}</b><span>${item.name}</span></button>`).join('');
    box.classList.toggle('is-visible', matches.length > 0 && document.activeElement === $('rr-symbol-search'));
    box.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      $('rr-symbol-search').value = button.dataset.symbol;
      box.classList.remove('is-visible');
      loadSymbol(button.dataset.symbol);
    }));
  }

  function bind() {
    fields.forEach((id) => $(id)?.addEventListener('input', calculate));
    $('rr-load-symbol')?.addEventListener('click', () => loadSymbol());
    $('rr-timeframe')?.addEventListener('change', () => loadSymbol());
    $('rr-symbol-search')?.addEventListener('input', (event) => showSuggestions(event.target.value));
    $('rr-symbol-search')?.addEventListener('focus', (event) => showSuggestions(event.target.value));
    $('rr-symbol-search')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); $('rr-symbol-suggestions')?.classList.remove('is-visible'); loadSymbol(); } });
    document.addEventListener('click', (event) => { if (!event.target.closest('.rr-search-wrap')) $('rr-symbol-suggestions')?.classList.remove('is-visible'); });
    $('rr-use-support')?.addEventListener('click', () => { $('rr-stop-price').value = $('rr-use-support').dataset.price || ''; calculate(); });
    $('rr-use-resistance')?.addEventListener('click', () => { $('rr-target-price').value = $('rr-use-resistance').dataset.price || ''; calculate(); });
    initChart();
    calculate();
    loadSymbol('AAPL');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

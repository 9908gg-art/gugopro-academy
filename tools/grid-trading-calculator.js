(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const value = (id, fallback = 0) => { const parsed = Number($(id)?.value); return Number.isFinite(parsed) ? parsed : fallback; };
  const finitePrice = (raw, fallback = 0) => { const parsed = Number(raw); return Number.isFinite(parsed) ? Math.min(1e12, Math.max(1e-8, parsed)) : fallback; };
  const money = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT` : '—';
  const pct = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}%` : '—';
  const priceText = (amount) => Number.isFinite(amount) ? amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—';
  const setText = (id, text) => { if ($(id)) $(id).textContent = text; };

  const tvSymbolOverrides = {
    NQ: 'CME_MINI:NQ1!', ES: 'CME_MINI:ES1!', GOLD: 'TVC:GOLD', OIL: 'TVC:USOIL',
    XAUUSD: 'OANDA:XAUUSD', USOIL: 'TVC:USOIL', EURUSD: 'FX:EURUSD',
    QQQ: 'NASDAQ:QQQ', SPY: 'AMEX:SPY', BTCUSD: 'COINBASE:BTCUSD', ETHUSD: 'COINBASE:ETHUSD'
  };
  const yahooSymbolOverrides = {
    NQ: 'NQ=F', ES: 'ES=F', GOLD: 'GC=F', OIL: 'CL=F', XAUUSD: 'GC=F', USOIL: 'CL=F',
    EURUSD: 'EURUSD=X', BTCUSD: 'BTC-USD', ETHUSD: 'ETH-USD'
  };
  const binanceCryptoPattern = /(?:USDT|USDC|BUSD)$/;
  const isBinanceCrypto = (symbol) => binanceCryptoPattern.test(symbol);
  const isCrypto = (symbol) => isBinanceCrypto(symbol) || /^(?:BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|LINK|SUI)USD$/.test(symbol);
  const tradingViewSymbolFor = (symbol) => {
    if (tvSymbolOverrides[symbol]) return tvSymbolOverrides[symbol];
    if (/^\\d{4}\\.TW$/.test(symbol)) return `TWSE:${symbol.replace('.TW', '')}`;
    if (/^[A-Z]{6}$/.test(symbol) && /(?:USD|EUR|JPY|GBP|CHF|AUD|CAD|NZD)$/.test(symbol)) return `FX:${symbol}`;
    if (isCrypto(symbol) && /USD$/.test(symbol)) return `CRYPTOCAP:${symbol}`;
    return `NASDAQ:${symbol}`;
  };
  const yahooSymbolFor = (symbol) => yahooSymbolOverrides[symbol] || symbol;

  const symbolCatalog = [
    { symbol: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:BTCUSDT', yahoo: 'BTC-USD', binance: true, crypto: true },
    { symbol: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:ETHUSDT', yahoo: 'ETH-USD', binance: true, crypto: true },
    { symbol: 'SOLUSDT', label: 'SOL/USDT', name: 'Solana', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:SOLUSDT', binance: true, crypto: true },
    { symbol: 'BNBUSDT', label: 'BNB/USDT', name: 'BNB', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:BNBUSDT', binance: true, crypto: true },
    { symbol: 'DOGEUSDT', label: 'DOGE/USDT', name: 'Dogecoin', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:DOGEUSDT', binance: true, crypto: true },
    { symbol: 'XRPUSDT', label: 'XRP/USDT', name: 'XRP', market: '加密貨幣', category: 'crypto', group: '主流加密資產', source: 'Binance Public API', tv: 'BINANCE:XRPUSDT', binance: true, crypto: true },
    { symbol: 'NQ', label: 'NQ Futures', name: 'Nasdaq-100 E-mini Futures', market: '全球指數／期貨與大宗商品', category: 'global', group: '指數／24H 期貨', source: 'TradingView Advanced Chart', tv: 'CME_MINI:NQ1!', yahoo: 'NQ=F', binance: false, crypto: false },
    { symbol: 'ES', label: 'ES Futures', name: 'S&P 500 E-mini Futures', market: '全球指數／期貨與大宗商品', category: 'global', group: '指數／24H 期貨', source: 'TradingView Advanced Chart', tv: 'CME_MINI:ES1!', yahoo: 'ES=F', binance: false, crypto: false },
    { symbol: 'GOLD', label: 'GOLD / XAUUSD', name: 'Gold', market: '全球指數／期貨與大宗商品', category: 'global', group: '大宗商品', source: 'TradingView Advanced Chart', tv: 'TVC:GOLD', yahoo: 'GC=F', binance: false, crypto: false },
    { symbol: 'OIL', label: 'OIL / USOIL', name: 'Crude Oil', market: '全球指數／期貨與大宗商品', category: 'global', group: '大宗商品', source: 'TradingView Advanced Chart', tv: 'TVC:USOIL', yahoo: 'CL=F', binance: false, crypto: false },
    { symbol: 'NVDA', label: 'NVDA', name: 'NVIDIA', market: '美股科技權值', category: 'us', group: 'US Mega Tech', source: 'TradingView Advanced Chart', tv: 'NASDAQ:NVDA', yahoo: 'NVDA', binance: false, crypto: false },
    { symbol: 'TSLA', label: 'TSLA', name: 'Tesla', market: '美股科技權值', category: 'us', group: 'US Mega Tech', source: 'TradingView Advanced Chart', tv: 'NASDAQ:TSLA', yahoo: 'TSLA', binance: false, crypto: false },
    { symbol: 'AAPL', label: 'AAPL', name: 'Apple', market: '美股科技權值', category: 'us', group: 'US Mega Tech', source: 'TradingView Advanced Chart', tv: 'NASDAQ:AAPL', yahoo: 'AAPL', binance: false, crypto: false },
    { symbol: 'MSFT', label: 'MSFT', name: 'Microsoft', market: '美股科技權值', category: 'us', group: 'US Mega Tech', source: 'TradingView Advanced Chart', tv: 'NASDAQ:MSFT', yahoo: 'MSFT', binance: false, crypto: false },
    { symbol: 'AMZN', label: 'AMZN', name: 'Amazon', market: '美股科技權值', category: 'us', group: 'US Mega Tech', source: 'TradingView Advanced Chart', tv: 'NASDAQ:AMZN', yahoo: 'AMZN', binance: false, crypto: false },
    { symbol: 'QQQ', label: 'QQQ', name: 'Nasdaq-100 ETF', market: '全球指數 ETF', category: 'global', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'NASDAQ:QQQ', yahoo: 'QQQ', binance: false, crypto: false },
    { symbol: 'SPY', label: 'SPY', name: 'S&P 500 ETF', market: '全球指數 ETF', category: 'global', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'AMEX:SPY', yahoo: 'SPY', binance: false, crypto: false },
    { symbol: 'XAUUSD', label: 'XAUUSD', name: 'Gold Spot', market: '全球商品／外匯', category: 'global', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'OANDA:XAUUSD', yahoo: 'GC=F', binance: false, crypto: false },
    { symbol: 'EURUSD', label: 'EURUSD', name: 'Euro / U.S. Dollar', market: '全球外匯', category: 'forex', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'FX:EURUSD', yahoo: 'EURUSD=X', binance: false, crypto: false },
    { symbol: 'BTCUSD', label: 'BTC/USD', name: 'Bitcoin / U.S. Dollar', market: '加密貨幣（非 Binance 路由）', category: 'crypto', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'COINBASE:BTCUSD', yahoo: 'BTC-USD', binance: false, crypto: true },
    { symbol: 'ETHUSD', label: 'ETH/USD', name: 'Ethereum / U.S. Dollar', market: '加密貨幣（非 Binance 路由）', category: 'crypto', group: '全球搜尋別名', source: 'TradingView Advanced Chart', tv: 'COINBASE:ETHUSD', yahoo: 'ETH-USD', binance: false, crypto: true }
  ];
  function cleanSymbol(value) {
    let symbol = String(value || '').trim().toUpperCase().replace(/[\s/:-]/g, '');
    if (/^\d{4}$/.test(symbol)) symbol += '.TW';
    if (/^(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|LINK|SUI)$/.test(symbol)) symbol += 'USDT';
    return symbol || 'BTCUSDT';
  }
  const metaFor = (value) => {
    const symbol = cleanSymbol(value);
    return symbolCatalog.find((item) => item.symbol === symbol) || {
      symbol, label: symbol, name: symbol,
      market: isCrypto(symbol) ? '加密貨幣' : (/\.TW$/.test(symbol) ? '台股與台股 ETF' : '全球金融商品'),
      category: isCrypto(symbol) ? 'crypto' : (/\.TW$/.test(symbol) ? 'tw' : 'global'),
      group: '自由輸入代碼', source: isBinanceCrypto(symbol) ? 'Binance Public API' : 'TradingView Advanced Chart',
      tv: tradingViewSymbolFor(symbol), yahoo: yahooSymbolFor(symbol), binance: isBinanceCrypto(symbol), crypto: isCrypto(symbol)
    };
  };

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
  let suggestionIndex = -1;
  let pendingHydration = null;
  const stateStorageKey = 'gugopro_grid_state_v1';
  const gridPersistedFields = ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-stop', 'grid-take', 'grid-fee'];

  function readPersistedState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(stateStorageKey) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveState() {
    try {
      const payload = { symbol: activeSymbol, timeframe: $('grid-timeframe')?.value || '15m', rangeTouched };
      gridPersistedFields.forEach((id) => { const field = $(id); if (field) payload[id] = field.value; });
      window.localStorage.setItem(stateStorageKey, JSON.stringify(payload));
    } catch (error) { /* private browsing or storage quota can reject writes */ }
  }

  function hydrateState() {
    const saved = readPersistedState();
    if (!saved) return null;
    const symbol = cleanSymbol(saved.symbol || 'BTCUSDT');
    const timeframe = timeframeConfig[saved.timeframe] ? saved.timeframe : '15m';
    gridPersistedFields.forEach((id) => { if (saved[id] !== undefined && $(id)) $(id).value = saved[id]; });
    if ($('grid-timeframe')) $('grid-timeframe').value = timeframe;
    rangeTouched = saved.rangeTouched === true;
    return { ...saved, symbol, timeframe };
  }

  function applyRestoredParameters(saved) {
    if (!saved) return;
    gridPersistedFields.forEach((id) => { if (saved[id] !== undefined && $(id)) $(id).value = saved[id]; });
    rangeTouched = saved.rangeTouched === true;
  }

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
    if (meta.binance) return fetchBinancePage(symbol, timeframe, endTime);
    if (Number.isFinite(endTime)) throw new Error('全球非 Binance 歷史分頁暫不支援');
    return fetchYahooPage(meta.yahoo || symbol, timeframe);
  }

  async function fetchMarketInitial(symbol, timeframe) {
    const first = await fetchMarketPage(symbol, timeframe);
    if (!metaFor(symbol).binance || first.length < 1000) return first;
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
      if (range && range.from < 28 && chartData.length && metaFor(activeSymbol).binance && !historyLoading && !historyExhausted) {
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
    const quick = $('grid-quick-symbol'); if (!quick) return;
    const normalized = cleanSymbol(symbol); quick.value = Array.from(quick.options).some((option) => option.value === normalized) ? normalized : '';
  }
  function syncSearchSymbol(symbol) { const input = $('grid-symbol-search'); if (input) input.value = cleanSymbol(symbol); }
  function hideGridSuggestions() { const input = $('grid-symbol-search'); const box = $('grid-symbol-suggestions'); if (box) box.classList.remove('is-visible'); if (input) { input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); } suggestionIndex = -1; }
  function updateGridSuggestions() {
    const input = $('grid-symbol-search'); const box = $('grid-symbol-suggestions'); if (!input || !box) return;
    const query = String(input.value || '').trim().toUpperCase().replace(/[\s/:-]/g, '');
    const matches = (query ? symbolCatalog.filter((item) => item.symbol.includes(query) || item.name.toUpperCase().includes(query) || item.market.includes(query) || item.group.toUpperCase().includes(query)) : symbolCatalog).slice(0, 8);
    const normalizedQuery = query ? cleanSymbol(query) : '';
    const hasExactCatalogMatch = normalizedQuery && symbolCatalog.some((item) => item.symbol === normalizedQuery);
    const freeEntry = query.length >= 2 && !hasExactCatalogMatch ? `<button type="button" role="option" id="grid-suggestion-free" data-symbol="${escapeHtml(normalizedQuery)}" aria-selected="false"><span class="rr-suggestion-main"><b>${escapeHtml(normalizedQuery)}</b><em>任意標準代碼</em></span><span class="rr-suggestion-market global">自動判斷資料來源<small>Binance／TradingView</small></span></button>` : '';
    suggestionIndex = -1;
    box.innerHTML = matches.map((item, index) => `<button type="button" role="option" id="grid-suggestion-${index}" data-symbol="${item.symbol}" aria-selected="false"><span class="rr-suggestion-main"><b>${item.symbol}</b><em>${item.name}</em></span><span class="rr-suggestion-market ${item.category}">${item.market}<small>${item.group}</small></span></button>`).join('') + freeEntry || '<div class="rr-suggestions-empty">找不到符合的商品，請改用代號或名稱。</div>';
    const visible = Boolean((matches.length || freeEntry) && document.activeElement === input); box.classList.toggle('is-visible', visible); input.setAttribute('aria-expanded', String(visible));
  }
  function activateGridSuggestion(index) {
    const box = $('grid-symbol-suggestions'); const buttons = box ? [...box.querySelectorAll('button[data-symbol]')] : []; if (!buttons.length) return false;
    suggestionIndex = Math.max(0, Math.min(index, buttons.length - 1)); buttons.forEach((button, itemIndex) => { const active = itemIndex === suggestionIndex; button.classList.toggle('is-active', active); button.setAttribute('aria-selected', String(active)); if (active) { button.scrollIntoView({ block: 'nearest' }); $('grid-symbol-search')?.setAttribute('aria-activedescendant', button.id); } }); return true;
  }
  function chooseGridSuggestion(symbol) { const normalized = cleanSymbol(symbol); syncSearchSymbol(normalized); hideGridSuggestions(); loadMarket(normalized); }

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
    if (generation !== liveGeneration || document.hidden || !metaFor(activeSymbol).binance) return;
    window.clearTimeout(liveReconnectTimer); liveReconnectTimer = window.setTimeout(() => connectLiveStream(), liveReconnectDelay); liveReconnectDelay = Math.min(30000, Math.round(liveReconnectDelay * 1.7));
  }

  function connectLiveStream() {
    closeLiveStream();
    if (!metaFor(activeSymbol).binance) { setText('grid-connection-status', '非 Binance 全球商品使用 TradingView 圖表'); return; }
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
    if (!metaFor(activeSymbol).binance || historyLoading || historyExhausted || !chartData.length) return;
    historyLoading = true; const oldRange = chart?.timeScale().getVisibleLogicalRange?.(); setText('grid-history-status', '正在載入更早 K 線…');
    try {
      const timeframe = $('grid-timeframe')?.value || '15m'; const oldest = chartData[0].time * 1000 - 1; const older = await fetchMarketPage(activeSymbol, timeframe, oldest); const beforeCount = chartData.length;
      chartData = mergeCandles(older, chartData); const added = chartData.length - beforeCount; if (added < 10 || older.length < (timeframeConfig[timeframe]?.limit || 1000)) historyExhausted = true;
      renderCandles(oldRange && added ? { from: oldRange.from + added, to: oldRange.to + added } : oldRange); simulateGrid(); setText('grid-history-status', historyExhausted ? `歷史已接近資料起點 · ${chartData.length.toLocaleString()} 根` : `已載入 ${chartData.length.toLocaleString()} 根 · 可繼續向左捲動`);
    } catch (error) { setText('grid-history-status', `歷史載入失敗：${error.name === 'AbortError' ? '逾時' : '稍後重試'}`); }
    finally { historyLoading = false; }
  }

  function simulateGrid() {
    if (!chartData.length) { saveState(); return; }
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
    renderGridLines(levels, current, stop, take); setText('grid-active-symbol', meta.label); setText('grid-live-price', priceText(current)); setText('grid-spacing', `${pct(grossSpacing * 100)}${mode === 'geometric' ? '（比例）' : '（區間）'}`); setText('grid-net-margin', pct(netMargin * 100)); setText('grid-single-profit', money(Math.max(0, orderCapital * netMargin))); setText('grid-utilization', pct(utilization)); setText('grid-break-risk', breakRisk); setText('grid-drawdown', pct(maxDrawdown * 100)); setText('grid-realized-profit', money(realized)); setText('grid-final-value', money(finalValue)); setText('grid-status', `${statusParts.join('；')}；已完成 ${trades} 次網格回合，手續費按單邊 ${value('grid-fee', 0.1)}% 扣除。右軸僅顯示 LOWER／UPPER／LATEST／SL／TP，中間網格保留虛線。`); saveState();
  }

  function renderFallback(reason) {
    const widget = $('grid-tv-widget'); if (!widget) return; const meta = metaFor(activeSymbol); const interval = ({ '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D', '1w': 'W' })[$('grid-timeframe')?.value] || '15';
    widget.innerHTML = `<div class="grid-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>${meta.label} 公開 K 線暫時無法連線：${reason}</strong><span>以下仍可使用網格參數檢查；圖表會以 TradingView Advanced Chart ${meta.label} fallback 顯示。</span></div><iframe title="TradingView Advanced Chart ${meta.label}" src="https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(meta.tv)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=%2307131d&theme=dark&style=1&timezone=Asia%2FTaipei&withdateranges=1&hideideas=1&studies=Volume%40tv-basicstudies" loading="eager" allow="fullscreen" referrerpolicy="origin"></iframe>`;
    widget.classList.add('is-visible'); $('grid-chart')?.classList.add('is-fallback-hidden');
  }

  async function loadMarket(requestedSymbol) {
    const requestId = ++requestSequence; const timeframe = $('grid-timeframe')?.value || '15m'; activeSymbol = cleanSymbol(requestedSymbol || $('grid-symbol-search')?.value || $('grid-quick-symbol')?.value || 'BTCUSDT'); const meta = metaFor(activeSymbol); syncQuickSymbol(activeSymbol); syncSearchSymbol(activeSymbol); hideGridSuggestions(); saveState(); closeLiveStream(); livePrice = NaN; liveChange = NaN; historyExhausted = false; setText('grid-active-symbol', meta.label); setText('grid-live-price', '—'); setText('grid-live-change', '—'); setText('grid-live-status', `載入 ${meta.label} · ${meta.name}…`); setText('grid-history-status', '正在取得歷史資料…'); $('grid-tv-widget')?.classList.remove('is-visible'); $('grid-chart')?.classList.remove('is-fallback-hidden');
    if (!meta.binance) {
      chartData = [];
      renderFallback('非 Binance 全球商品由 TradingView Advanced Chart 直接提供');
      setText('grid-live-status', `已切換 TradingView Advanced Chart · ${meta.label}`);
      setText('grid-history-status', '全球商品圖表由 TradingView 提供；網格參數仍可在瀏覽器端即時計算。');
      setText('grid-connection-status', 'TradingView Advanced Chart 已待命');
      simulateGrid();
      return;
    }
    try {
      chartData = await fetchMarketInitial(activeSymbol, timeframe); if (requestId !== requestSequence) return; if (!chart) initChart(); renderCandles(); const lastClose = chartData[chartData.length - 1].close; if (pendingHydration && pendingHydration.symbol === activeSymbol && pendingHydration.timeframe === timeframe) { applyRestoredParameters(pendingHydration); pendingHydration = null; } else { setDefaultsAroundPrice(lastClose); } updateLivePrice(lastClose, NaN, 'REST snapshot'); setText('grid-live-status', `${meta.source} · ${chartData.length.toLocaleString()} 根 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleString('zh-TW')}`); setText('grid-history-status', meta.binance ? `已載入 ${chartData.length.toLocaleString()} 根 · 向左捲動載入更早資料` : `已載入 ${chartData.length.toLocaleString()} 根 · ${timeframe}`); simulateGrid(); connectLiveStream();
    } catch (error) { if (requestId !== requestSequence) return; chartData = []; renderFallback(error.name === 'AbortError' ? '連線逾時' : error.message); setText('grid-live-status', `已切換 TradingView ${meta.label}`); setText('grid-history-status', '公開 K 線暫時不可用；稍後可更新行情重試。'); setText('grid-connection-status', meta.binance ? 'WebSocket 未連線' : 'TradingView Advanced Chart 已待命'); saveState(); }
  }

  function bind() {
    const persistAndSimulate = () => { rangeTouched = true; simulateGrid(); };
    ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-stop', 'grid-take', 'grid-fee'].forEach((id) => ['input', 'change'].forEach((eventName) => $(id)?.addEventListener(eventName, persistAndSimulate)));
    $('grid-load-symbol')?.addEventListener('click', () => loadMarket());
    window.GugoWatchlist?.mount({ prefix: 'grid', cleanSymbol, findMeta: metaFor, onSelect: (symbol) => loadMarket(symbol) });
    $('grid-quick-symbol')?.addEventListener('change', () => loadMarket($('grid-quick-symbol').value)); $('grid-timeframe')?.addEventListener('change', () => loadMarket(activeSymbol)); $('grid-refresh')?.addEventListener('click', () => loadMarket(activeSymbol));
    $('grid-symbol-search')?.addEventListener('input', updateGridSuggestions); $('grid-symbol-search')?.addEventListener('focus', updateGridSuggestions);
    $('grid-symbol-search')?.addEventListener('keydown', (event) => {
      const box = $('grid-symbol-suggestions');
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { if (!box?.classList.contains('is-visible')) updateGridSuggestions(); const buttons = box ? [...box.querySelectorAll('button[data-symbol]')] : []; const next = event.key === 'ArrowDown' ? suggestionIndex + 1 : suggestionIndex - 1; if (activateGridSuggestion((next + buttons.length) % Math.max(1, buttons.length))) event.preventDefault(); }
      else if (event.key === 'Enter') { event.preventDefault(); const buttons = box ? [...box.querySelectorAll('button[data-symbol]')] : []; const active = buttons[suggestionIndex >= 0 ? suggestionIndex : 0]; active && box?.classList.contains('is-visible') ? chooseGridSuggestion(active.dataset.symbol) : loadMarket(); if (!active || !box?.classList.contains('is-visible')) hideGridSuggestions(); }
      else if (event.key === 'Escape') hideGridSuggestions();
    });
    $('grid-symbol-suggestions')?.addEventListener('click', (event) => { const button = event.target.closest('button[data-symbol]'); if (button) chooseGridSuggestion(button.dataset.symbol); });
    document.addEventListener('click', (event) => { if (!event.target.closest('.grid-hud-search')) hideGridSuggestions(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) closeLiveStream(); else connectLiveStream(); });
    pendingHydration = hydrateState();
    loadMarket(pendingHydration?.symbol || 'BTCUSDT');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

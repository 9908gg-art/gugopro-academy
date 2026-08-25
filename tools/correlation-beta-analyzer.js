(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CONFIG = { yahooHost: 'query2.finance.yahoo.com', yahooRange: '2y', yahooInterval: '1d', binanceInterval: '1d', binanceLimit: 1000, batchSize: 5 };
  const UNIVERSES = {
    all: ['tw', 'us', 'global', 'crypto'],
    tw: ['tw'],
    us: ['us'],
    global: ['global'],
    crypto: ['crypto']
  };
  const LOOKBACK_LABELS = { 30: '短期動能', 60: '中期波段', 120: '半年結構', 250: '年線週期' };
  const tvOverrides = { GOLD: 'GC=F', OIL: 'CL=F', NQ: 'NQ=F', ES: 'ES=F', SILVER: 'SI=F', COPPER: 'HG=F', NG: 'NG=F', DXY: 'DX-Y.NYB', XAUUSD: 'GC=F', USOIL: 'CL=F', BTCUSD: 'BTC-USD', ETHUSD: 'ETH-USD' };
  const binancePattern = /(?:USDT|USDC|BUSD)$/;
  const CATALOG = [
    { symbol: '2330.TW', name: '台積電 Taiwan Semiconductor', market: '台股', category: 'tw', yahoo: '2330.TW' },
    { symbol: '0050.TW', name: '元大台灣 50 ETF', market: '台股 ETF', category: 'tw', yahoo: '0050.TW' },
    { symbol: '0056.TW', name: '元大高股息 ETF', market: '台股 ETF', category: 'tw', yahoo: '0056.TW' },
    { symbol: '00878.TW', name: '國泰永續高股息 ETF', market: '台股 ETF', category: 'tw', yahoo: '00878.TW' },
    { symbol: '00919.TW', name: '群益台灣精選高息 ETF', market: '台股 ETF', category: 'tw', yahoo: '00919.TW' },
    { symbol: '00929.TW', name: '復華台灣科技優息 ETF', market: '台股 ETF', category: 'tw', yahoo: '00929.TW' },
    { symbol: '2317.TW', name: '鴻海 Hon Hai', market: '台股', category: 'tw', yahoo: '2317.TW' },
    { symbol: '2454.TW', name: '聯發科 MediaTek', market: '台股', category: 'tw', yahoo: '2454.TW' },
    { symbol: '2308.TW', name: '台達電 Delta Electronics', market: '台股', category: 'tw', yahoo: '2308.TW' },
    { symbol: '2881.TW', name: '富邦金 Fubon Financial', market: '台股', category: 'tw', yahoo: '2881.TW' },
    { symbol: 'NVDA', name: 'NVIDIA', market: '美股科技權值', category: 'us', yahoo: 'NVDA' },
    { symbol: 'MSFT', name: 'Microsoft', market: '美股科技權值', category: 'us', yahoo: 'MSFT' },
    { symbol: 'AAPL', name: 'Apple', market: '美股科技權值', category: 'us', yahoo: 'AAPL' },
    { symbol: 'AMZN', name: 'Amazon', market: '美股科技權值', category: 'us', yahoo: 'AMZN' },
    { symbol: 'META', name: 'Meta Platforms', market: '美股科技權值', category: 'us', yahoo: 'META' },
    { symbol: 'TSLA', name: 'Tesla', market: '美股科技權值', category: 'us', yahoo: 'TSLA' },
    { symbol: 'GOOGL', name: 'Alphabet Google', market: '美股科技權值', category: 'us', yahoo: 'GOOGL' },
    { symbol: 'SOXX', name: 'iShares 半導體 ETF', market: '美股 ETF', category: 'us', yahoo: 'SOXX' },
    { symbol: 'TLT', name: 'iShares 20 年美債 ETF', market: '美股 ETF', category: 'us', yahoo: 'TLT' },
    { symbol: 'QQQ', name: 'Invesco Nasdaq-100 ETF', market: '美股 ETF', category: 'us', yahoo: 'QQQ' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: '美股 ETF', category: 'us', yahoo: 'SPY' },
    { symbol: 'NQ', name: 'Nasdaq-100 E-mini Futures', market: '全球期貨', category: 'global', yahoo: 'NQ=F' },
    { symbol: 'ES', name: 'S&P 500 E-mini Futures', market: '全球期貨', category: 'global', yahoo: 'ES=F' },
    { symbol: 'GOLD', name: 'Gold Futures / XAUUSD', market: '原物料', category: 'global', yahoo: 'GC=F' },
    { symbol: 'OIL', name: 'Crude Oil / USOIL', market: '原物料', category: 'global', yahoo: 'CL=F' },
    { symbol: 'SILVER', name: 'Silver Futures', market: '原物料', category: 'global', yahoo: 'SI=F' },
    { symbol: 'COPPER', name: 'Copper Futures', market: '原物料', category: 'global', yahoo: 'HG=F' },
    { symbol: 'NG', name: 'Natural Gas Futures', market: '原物料', category: 'global', yahoo: 'NG=F' },
    { symbol: 'DXY', name: 'U.S. Dollar Index', market: '全球指數', category: 'global', yahoo: 'DX-Y.NYB' },
    { symbol: 'TXF', name: '台指期', market: 'TAIFEX 台指期', category: 'futures', yahoo: '^TWII' },
    { symbol: 'MXF', name: '小台指', market: 'TAIFEX 小型台指', category: 'futures', yahoo: '^TWII' },
    { symbol: 'TMF', name: '微型台指', market: 'TAIFEX 微型台指', category: 'futures', yahoo: '^TWII' },
    { symbol: 'MNQ', name: 'Micro E-mini Nasdaq-100 Futures', market: 'CME 微型那指', category: 'futures', yahoo: 'NQ=F' },
    { symbol: 'MES', name: 'Micro E-mini S&P 500 Futures', market: 'CME 微型 S&P', category: 'futures', yahoo: 'ES=F' },
    { symbol: 'GC', name: 'Gold Futures', market: 'COMEX 黃金期貨', category: 'futures', yahoo: 'GC=F' },
    { symbol: 'MGC', name: 'Micro Gold Futures', market: 'COMEX 微型黃金', category: 'futures', yahoo: 'GC=F' },
    { symbol: 'CL', name: 'Crude Oil Futures', market: 'NYMEX 原油期貨', category: 'futures', yahoo: 'CL=F' },
    { symbol: 'FTX', name: '富台期', market: 'TAIFEX 富台期', category: 'futures', yahoo: '^TWII' },
    { symbol: 'HSI', name: 'Hang Seng Index Futures', market: 'HKEX 恆生期貨', category: 'futures', yahoo: '^HSI' },
    { symbol: 'EURUSD', name: 'Euro / U.S. Dollar', market: 'FX 歐元兌美元', category: 'forex', yahoo: 'EURUSD=X' },
    { symbol: 'USDJPY', name: 'U.S. Dollar / Japanese Yen', market: 'FX 美元兌日圓', category: 'forex', yahoo: 'JPY=X' },
    { symbol: 'GBPUSD', name: 'British Pound / U.S. Dollar', market: 'FX 英鎊兌美元', category: 'forex', yahoo: 'GBPUSD=X' },
    { symbol: 'AUDUSD', name: 'Australian Dollar / U.S. Dollar', market: 'FX 澳幣兌美元', category: 'forex', yahoo: 'AUDUSD=X' },
    { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'ETHUSDT', name: 'Ethereum / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'SOLUSDT', name: 'Solana / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'BNBUSDT', name: 'BNB / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'XRPUSDT', name: 'XRP / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'DOGEUSDT', name: 'Dogecoin / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'ADAUSDT', name: 'Cardano / Tether', market: '加密貨幣', category: 'crypto', binance: true },
    { symbol: 'AVAXUSDT', name: 'Avalanche / Tether', market: '加密貨幣', category: 'crypto', binance: true }
  ];

  let targetMeta = findMeta('2330.TW');
  let currentLookback = 60;
  let currentResults = [];
  let targetSeries = [];
  let activeSelection = null;
  let runSequence = 0;
  let suggestionIndex = -1;
  let modalFilter = 'all';
  let modalActiveIndex = -1;
  let modalLastFocus = null;

  function cleanSymbol(value) {
    const raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    const providerMatch = raw.match(/^[A-Z_]+:(.+)$/);
    const provider = providerMatch ? raw.split(':')[0] : '';
    let symbol = providerMatch ? providerMatch[1] : raw;
    if (provider === 'CME_MINI' && /^(NQ|ES)1!?$/.test(symbol)) symbol = symbol.slice(0, 2);
    if (provider === 'TVC' && symbol === 'USOIL') symbol = 'OIL';
    if (provider === 'BINANCE' && /^(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX)$/.test(symbol)) symbol += 'USDT';
    symbol = symbol.replace(/!$/, '');
    if (/^\d{4}$/.test(symbol)) symbol += '.TW';
    if (/^(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|LINK|SUI)$/.test(symbol)) symbol += 'USDT';
    return symbol || '2330.TW';
  }

  function findMeta(value) {
    const symbol = cleanSymbol(value);
    const known = CATALOG.find((item) => item.symbol === symbol);
    if (known) return { ...known };
    const crypto = binancePattern.test(symbol);
    const yahoo = tvOverrides[symbol] || (symbol === 'BTCUSD' ? 'BTC-USD' : symbol);
    return {
      symbol,
      name: symbol,
      market: crypto ? '加密貨幣' : (/\.TW$/.test(symbol) ? '台股／台股 ETF' : '全球金融商品'),
      category: crypto ? 'crypto' : (/\.TW$/.test(symbol) ? 'tw' : 'global'),
      yahoo,
      binance: crypto
    };
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function formatNumber(value, digits = 2) {
    return Number.isFinite(value) ? value.toLocaleString('zh-TW', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
  }

  function formatPercent(value, digits = 2) {
    return Number.isFinite(value) ? `${formatNumber(value, digits)}%` : '—';
  }

  function formatPrice(value) {
    if (!Number.isFinite(value)) return '—';
    const digits = Math.abs(value) >= 1000 ? 2 : (Math.abs(value) >= 1 ? 4 : 8);
    return value.toLocaleString('zh-TW', { maximumFractionDigits: digits });
  }

  function formatDate(time) {
    if (!Number.isFinite(time)) return '—';
    return new Date(time * 1000).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  }

  function setStatus(main, detail, error = false) {
    const status = $('cba-status');
    if (status) status.classList.toggle('is-error', error);
    if ($('cba-status-main')) $('cba-status-main').textContent = main;
    if ($('cba-status-detail')) $('cba-status-detail').textContent = detail;
  }

  function fetchWithTimeout(url, timeout = 10000, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store', headers: { Accept: 'application/json', ...(options.headers || {}) }, ...options }).finally(() => window.clearTimeout(timer));
  }

  function parseBinanceRows(rows) {
    return rows.map((row) => ({ time: Math.floor(Number(row[0]) / 1000), close: Number(row[4]) }))
      .filter((row) => Number.isFinite(row.time) && Number.isFinite(row.close) && row.close > 0);
  }

  async function fetchBinance(meta) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(meta.symbol)}&interval=${CONFIG.binanceInterval}&limit=${CONFIG.binanceLimit}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
    const rows = parseBinanceRows(await response.json());
    if (rows.length < 20) throw new Error('Binance 歷史樣本不足');
    return rows;
  }

  async function fetchYahoo(meta) {
    const yahooSymbol = meta.yahoo || meta.symbol;
    const url = `https://${CONFIG.yahooHost}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${CONFIG.yahooRange}&interval=${CONFIG.yahooInterval}&includePrePost=false&events=div%2Csplits`;
    let json;
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
      json = await response.json();
    } catch (directError) {
      const jinaUrl = `https://r.jina.ai/http://${url.slice('https://'.length)}`;
      const fallbackUrls = [
        { url: jinaUrl, timeout: 18000, options: { headers: { Accept: 'text/plain' } }, parser: (text) => {
          let envelope = null;
          try { envelope = JSON.parse(text); } catch (error) { /* plain Markdown envelope below */ }
          if (envelope?.chart?.result) return envelope;
          if (typeof envelope?.data?.content === 'string') return JSON.parse(envelope.data.content);
          const marker = 'Markdown Content:\n';
          const content = text.split(marker).slice(1).join(marker).trim();
          if (!content) throw new Error('Jina response did not contain chart content');
          return JSON.parse(content);
        } },
        { url: `https://corsproxy.io/?url=${encodeURIComponent(url)}`, timeout: 8000, parser: (text) => JSON.parse(text) },
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, timeout: 8000, parser: (text) => JSON.parse(JSON.parse(text).contents) }
      ];
      let lastError = directError;
      for (const fallback of fallbackUrls) {
        try {
          const fallbackResponse = await fetchWithTimeout(fallback.url, fallback.timeout || 10000, fallback.options || {});
          if (!fallbackResponse.ok) throw new Error(`CORS fallback HTTP ${fallbackResponse.status}`);
          json = fallback.parser(await fallbackResponse.text());
          break;
        } catch (fallbackError) {
          lastError = fallbackError;
        }
      }
      if (!json) throw lastError;
    }
    const result = json?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const parsed = timestamps.map((time, index) => ({ time: Number(time), close: Number(closes[index]) }))
      .filter((row) => Number.isFinite(row.time) && Number.isFinite(row.close) && row.close > 0);
    if (parsed.length < 20) throw new Error('Yahoo 歷史樣本不足');
    return parsed;
  }

  async function fetchHistory(meta) {
    return meta.binance ? fetchBinance(meta) : fetchYahoo(meta);
  }

  function dateKey(time) {
    return new Date(time * 1000).toISOString().slice(0, 10);
  }

  function toDateMap(series) {
    const map = new Map();
    series.forEach((point) => map.set(dateKey(point.time), point));
    return map;
  }

  function alignSeries(baseSeries, compareSeries, lookback) {
    const baseMap = toDateMap(baseSeries);
    const compareMap = toDateMap(compareSeries);
    const dates = [...baseMap.keys()].filter((key) => compareMap.has(key)).sort();
    const selectedDates = dates.slice(-Math.max(lookback, 20));
    return {
      dates: selectedDates,
      target: selectedDates.map((key) => baseMap.get(key).close),
      benchmark: selectedDates.map((key) => compareMap.get(key).close),
      times: selectedDates.map((key) => baseMap.get(key).time)
    };
  }

  function returns(values) {
    const result = [];
    for (let index = 1; index < values.length; index += 1) {
      const previous = values[index - 1];
      const current = values[index];
      result.push(previous > 0 ? current / previous - 1 : NaN);
    }
    return result;
  }

  function mean(values) {
    const valid = values.filter(Number.isFinite);
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : NaN;
  }

  function variance(values) {
    const average = mean(values);
    const valid = values.filter(Number.isFinite);
    return valid.length > 1 ? valid.reduce((sum, value) => sum + (value - average) ** 2, 0) / valid.length : NaN;
  }

  function covariance(first, second) {
    const paired = first.map((value, index) => [value, second[index]]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
    if (paired.length < 2) return NaN;
    const firstMean = mean(paired.map(([a]) => a));
    const secondMean = mean(paired.map(([, b]) => b));
    return paired.reduce((sum, [a, b]) => sum + (a - firstMean) * (b - secondMean), 0) / paired.length;
  }

  function correlation(first, second) {
    const cov = covariance(first, second);
    const denominator = Math.sqrt(variance(first) * variance(second));
    return denominator > 0 ? cov / denominator : NaN;
  }

  function standardDeviation(values) {
    const result = variance(values);
    return Number.isFinite(result) ? Math.sqrt(result) : NaN;
  }

  function calculateMetrics(meta, aligned) {
    const targetReturns = returns(aligned.target);
    const benchmarkReturns = returns(aligned.benchmark);
    const corr = correlation(targetReturns, benchmarkReturns);
    const targetVariance = variance(targetReturns);
    const beta = targetVariance > 0 ? covariance(benchmarkReturns, targetReturns) / targetVariance : NaN;
    const targetReturn = aligned.target.length > 1 ? aligned.target.at(-1) / aligned.target[0] - 1 : NaN;
    const benchmarkReturn = aligned.benchmark.length > 1 ? aligned.benchmark.at(-1) / aligned.benchmark[0] - 1 : NaN;
    const alpha = benchmarkReturn - targetReturn;
    const ratios = aligned.benchmark.map((value, index) => value / aligned.target[index]).filter(Number.isFinite);
    const ratioAverage = mean(ratios);
    const ratioStd = standardDeviation(ratios);
    const zScore = ratioStd > 0 ? (ratios.at(-1) - ratioAverage) / ratioStd : 0;
    return { meta, aligned, targetReturn, benchmarkReturn, alpha, corr, beta, zScore, sample: targetReturns.length };
  }

  function universeMetas(value) {
    const categories = UNIVERSES[value] || UNIVERSES.all;
    return CATALOG.filter((item) => categories.includes(item.category));
  }

  function sortResults(results) {
    const mode = $('cba-rank-mode')?.value || 'positive';
    return [...results].sort((a, b) => mode === 'negative' ? a.corr - b.corr : b.corr - a.corr);
  }

  function renderSelectedOptions() {
    const select = $('cba-selected');
    if (!select) return;
    const previous = select.value;
    select.innerHTML = currentResults.map((result) => `<option value="${escapeHtml(result.meta.symbol)}">${escapeHtml(result.meta.symbol)} · ${escapeHtml(result.meta.name)}</option>`).join('');
    const next = currentResults.some((result) => result.meta.symbol === previous) ? previous : currentResults[0]?.meta.symbol || '';
    select.value = next;
    activeSelection = currentResults.find((result) => result.meta.symbol === next) || null;
  }

  function signalText(result) {
    if (!result) return { text: '等待分析', negative: false };
    if (result.corr < -0.25) return { text: '避險觀察', negative: true };
    if (Math.abs(result.zScore) >= 2) return { text: '偏離警示', negative: false };
    if (result.alpha > 0) return { text: '相對強勢', negative: false };
    return { text: '關係穩定', negative: false };
  }

  function renderRanking() {
    const body = $('cba-results-body');
    if (!body) return;
    const ordered = sortResults(currentResults);
    const limit = Math.max(1, Math.min(12, Number($('cba-limit')?.value) || 8));
    const visible = ordered.slice(0, limit);
    if (!visible.length) {
      body.innerHTML = '<tr><td colspan="7" class="cba-empty"><i class="fa-solid fa-circle-exclamation"></i><br>目前沒有足夠的共同交易日資料。</td></tr>';
      return;
    }
    body.innerHTML = visible.map((result) => {
      const selected = activeSelection?.meta.symbol === result.meta.symbol ? ' class="cba-selected-row"' : '';
      const hedge = result.corr < 0 ? 'cba-negative' : 'cba-positive';
      const zClass = Math.abs(result.zScore) >= 2 ? 'cba-z-alert' : '';
      const alphaClass = result.alpha >= 0 ? 'cba-positive' : 'cba-negative';
      const betaClass = result.beta >= 1 ? 'cba-positive' : (result.beta < 0 ? 'cba-negative' : '');
      return `<tr${selected} data-cba-select="${escapeHtml(result.meta.symbol)}"><td><div class="cba-asset"><span class="cba-asset-mark">${escapeHtml(result.meta.symbol.replace(/[^A-Z0-9]/g, '').slice(0, 3))}</span><span><strong>${escapeHtml(result.meta.symbol)}</strong><small>${escapeHtml(result.meta.name)}</small></span></div></td><td class="${hedge}">${formatNumber(result.corr, 3)}</td><td class="${betaClass}">${formatNumber(result.beta, 2)}</td><td class="${alphaClass}">${formatPercent(result.alpha * 100)}</td><td class="${zClass}">${formatNumber(result.zScore, 2)}</td><td>${result.sample}</td><td><a class="cba-action" href="risk-reward-calculator.html?symbol=${encodeURIComponent(result.meta.symbol)}">帶入 R:R</a></td></tr>`;
    }).join('');
    const signal = signalText(visible[0]);
    const signalEl = $('cba-ranking-signal');
    if (signalEl) { signalEl.textContent = signal.text; signalEl.classList.toggle('negative', signal.negative); }
  }

  function setCanvasSize(canvas) {
    if (!canvas) return null;
    const width = Math.max(260, canvas.parentElement?.clientWidth || 600);
    const height = Math.max(160, canvas.parentElement?.clientHeight || 220);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width, height };
  }

  function chartBase(ctx, width, height, margins) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(5, 17, 14, .28)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '10px DM Sans, sans-serif';
    ctx.strokeStyle = 'rgba(173, 226, 199, .11)';
    ctx.fillStyle = '#78998b';
    for (let i = 0; i <= 4; i += 1) {
      const y = margins.top + (height - margins.top - margins.bottom) * i / 4;
      ctx.beginPath(); ctx.moveTo(margins.left, y); ctx.lineTo(width - margins.right, y); ctx.stroke();
    }
  }

  function drawLine(ctx, values, min, max, margins, width, height, color) {
    const plotWidth = width - margins.left - margins.right;
    const plotHeight = height - margins.top - margins.bottom;
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = margins.left + plotWidth * index / Math.max(1, values.length - 1);
      const y = margins.top + (max - value) / Math.max(1e-9, max - min) * plotHeight;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function drawOverlay(result) {
    const empty = $('cba-overlay-empty');
    const canvas = $('cba-overlay-canvas');
    if (!result || !canvas) { empty?.removeAttribute('hidden'); return; }
    empty?.setAttribute('hidden', 'hidden');
    const size = setCanvasSize(canvas); if (!size) return;
    const { ctx, width, height } = size;
    const margins = { left: 40, right: 12, top: 14, bottom: 25 };
    const target = result.aligned.target.map((value) => value / result.aligned.target[0] * 100);
    const benchmark = result.aligned.benchmark.map((value) => value / result.aligned.benchmark[0] * 100);
    const all = target.concat(benchmark); const rawMin = Math.min(...all); const rawMax = Math.max(...all); const padding = Math.max(.8, (rawMax - rawMin) * .12); const min = rawMin - padding; const max = rawMax + padding;
    chartBase(ctx, width, height, margins);
    for (let i = 0; i <= 4; i += 1) { const value = max - (max - min) * i / 4; const y = margins.top + (height - margins.top - margins.bottom) * i / 4; ctx.fillText(`${value.toFixed(0)}`, 5, y + 3); }
    drawLine(ctx, target, min, max, margins, width, height, '#7ed6b0');
    drawLine(ctx, benchmark, min, max, margins, width, height, '#ffb25f');
    ctx.fillStyle = '#78998b';
    const indices = [0, Math.floor((result.aligned.times.length - 1) / 2), result.aligned.times.length - 1];
    indices.forEach((index) => { const x = margins.left + (width - margins.left - margins.right) * index / Math.max(1, result.aligned.times.length - 1); ctx.fillText(formatDate(result.aligned.times[index]), Math.max(margins.left, x - 16), height - 7); });
    if ($('cba-overlay-caption')) $('cba-overlay-caption').textContent = `${targetMeta.symbol} vs ${result.meta.symbol} · ${result.sample} 個共同報酬樣本`;
    if ($('cba-target-legend')) $('cba-target-legend').textContent = targetMeta.symbol;
    if ($('cba-benchmark-legend')) $('cba-benchmark-legend').textContent = result.meta.symbol;
    if ($('cba-overlay-range')) $('cba-overlay-range').textContent = `${formatDate(result.aligned.times[0])} → ${formatDate(result.aligned.times.at(-1))}`;
  }

  function drawScatter(result) {
    const empty = $('cba-scatter-empty');
    const canvas = $('cba-scatter-canvas');
    if (!result || !canvas) { empty?.removeAttribute('hidden'); return; }
    empty?.setAttribute('hidden', 'hidden');
    const size = setCanvasSize(canvas); if (!size) return;
    const { ctx, width, height } = size;
    const margins = { left: 42, right: 15, top: 14, bottom: 29 };
    const xValues = returns(result.aligned.target); const yValues = returns(result.aligned.benchmark);
    const xMinRaw = Math.min(...xValues); const xMaxRaw = Math.max(...xValues); const yMinRaw = Math.min(...yValues); const yMaxRaw = Math.max(...yValues);
    const xPad = Math.max(.0005, (xMaxRaw - xMinRaw) * .14); const yPad = Math.max(.0005, (yMaxRaw - yMinRaw) * .14);
    const xMin = xMinRaw - xPad; const xMax = xMaxRaw + xPad; const yMin = yMinRaw - yPad; const yMax = yMaxRaw + yPad;
    chartBase(ctx, width, height, margins);
    const plotWidth = width - margins.left - margins.right; const plotHeight = height - margins.top - margins.bottom;
    const point = (x, y) => ({ x: margins.left + (x - xMin) / Math.max(1e-9, xMax - xMin) * plotWidth, y: margins.top + (yMax - y) / Math.max(1e-9, yMax - yMin) * plotHeight });
    const zeroX = point(0, 0).x; const zeroY = point(0, 0).y;
    ctx.strokeStyle = 'rgba(255,178,95,.23)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(zeroX, margins.top); ctx.lineTo(zeroX, height - margins.bottom); ctx.moveTo(margins.left, zeroY); ctx.lineTo(width - margins.right, zeroY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(126,214,176,.72)';
    xValues.forEach((x, index) => { const p = point(x, yValues[index]); ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill(); });
    const x1 = xMin; const x2 = xMax; const intercept = mean(yValues) - result.beta * mean(xValues); const p1 = point(x1, intercept + result.beta * x1); const p2 = point(x2, intercept + result.beta * x2);
    ctx.strokeStyle = '#ffb25f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.fillStyle = '#78998b'; ctx.font = '10px DM Sans, sans-serif'; ctx.fillText(`${(xMin * 100).toFixed(1)}%`, margins.left, height - 8); ctx.fillText(`${(xMax * 100).toFixed(1)}%`, width - margins.right - 28, height - 8); ctx.fillText(`${(yMax * 100).toFixed(1)}%`, 4, margins.top + 4); ctx.fillText(`${(yMin * 100).toFixed(1)}%`, 4, height - margins.bottom);
    if ($('cba-scatter-beta')) $('cba-scatter-beta').textContent = `β ${formatNumber(result.beta, 2)}`;
    if ($('cba-scatter-corr')) $('cba-scatter-corr').textContent = `r ${formatNumber(result.corr, 3)}`;
    if ($('cba-scatter-caption')) $('cba-scatter-caption').textContent = `X 軸：${targetMeta.symbol} 報酬；Y 軸：${result.meta.symbol} 報酬。`;
  }

  function renderSelection() {
    const symbol = $('cba-selected')?.value;
    activeSelection = currentResults.find((result) => result.meta.symbol === symbol) || currentResults[0] || null;
    const signal = signalText(activeSelection);
    const alphaEl = $('cba-selected-alpha'); const zEl = $('cba-selected-z'); const targetReturnEl = $('cba-target-return');
    if (targetReturnEl) targetReturnEl.textContent = formatPercent(activeSelection?.targetReturn * 100);
    if (alphaEl) { alphaEl.textContent = formatPercent(activeSelection?.alpha * 100); alphaEl.className = activeSelection?.alpha >= 0 ? 'cba-positive' : 'cba-negative'; }
    if (zEl) { zEl.textContent = formatNumber(activeSelection?.zScore, 2); zEl.className = Math.abs(activeSelection?.zScore || 0) >= 2 ? 'cba-z-alert' : ''; }
    const signalEl = $('cba-ranking-signal');
    if (signalEl && currentResults.length) { signalEl.textContent = signal.text; signalEl.classList.toggle('negative', signal.negative); }
    drawOverlay(activeSelection); drawScatter(activeSelection); renderRanking();
  }

  function syncQuickSelection(symbol) {
    const quick = $('analyzer-quick-select');
    if (!quick) return;
    const normalized = cleanSymbol(symbol);
    const isKnown = Array.from(quick.options).some((option) => option.value === normalized);
    quick.value = isKnown ? normalized : '';
  }

  const modalCategoryFor = (item) => item.category === 'tw' || item.category === 'us' ? 'stocks' : item.category === 'global' ? (item.symbol === 'DXY' ? 'forex' : 'futures') : item.category;
  const modalExchangeFor = (item) => {
    const symbol = item.symbol;
    if (item.binance) return { name: 'BINANCE', country: '🪙' };
    if (modalCategoryFor(item) === 'forex') return { name: symbol === 'DXY' ? 'ICE' : 'FX', country: symbol === 'DXY' ? '🇺🇸' : '🌐' };
    if (modalCategoryFor(item) === 'futures') {
      if (['TXF', 'MXF', 'TMF', 'FTX'].includes(symbol)) return { name: 'TAIFEX', country: '🇹🇼' };
      if (symbol === 'HSI') return { name: 'HKEX', country: '🇭🇰' };
      if (['GC', 'MGC', 'GOLD', 'SILVER', 'COPPER'].includes(symbol)) return { name: 'COMEX', country: '🇺🇸' };
      if (['CL', 'OIL', 'NG'].includes(symbol)) return { name: 'NYMEX', country: '🇺🇸' };
      return { name: 'CME', country: '🇺🇸' };
    }
    if (/\.TW$/.test(symbol)) return { name: 'TWSE', country: '🇹🇼' };
    return { name: ['SPY', 'QQQ', 'SOXX', 'TLT'].includes(symbol) ? 'NYSE ARCA' : 'NASDAQ', country: '🇺🇸' };
  };
  const modalBadgeFor = (item) => {
    if (item.binance) return item.symbol.replace(/USDT$/, '').slice(0, 3);
    if (item.category === 'futures') return ['GC', 'MGC', 'GOLD', 'SILVER', 'COPPER'].includes(item.symbol) ? 'GC' : item.symbol.slice(0, 3);
    if (modalCategoryFor(item) === 'forex') return item.symbol.slice(0, 3);
    return item.symbol.replace(/[^A-Z0-9]/g, '').slice(0, 3);
  };
  const ISIN_BY_SYMBOL = {
    '2330.TW': 'TW0002330008', '2317.TW': 'TW0002317005', '2454.TW': 'TW0002454007', '0050.TW': 'TW0000050004',
    '0056.TW': 'TW0000056001', '00878.TW': 'TW0000087801', '00919.TW': 'TW0000091902', '00929.TW': 'TW0000092900',
    NVDA: 'US67066G1040', TSLA: 'US88160R1014', AAPL: 'US0378331005', MSFT: 'US5949181045', AMZN: 'US0231351067', GOOGL: 'US02079K3059',
    SPY: 'US78462F1030', QQQ: 'US46090E1038', SOXX: 'US4642875235', TLT: 'US4642874655'
  };
  const SYMBOL_SEARCH_CATALOG = CATALOG.map((item) => ({
    ...item,
    modalCategory: modalCategoryFor(item),
    exchange: modalExchangeFor(item).name,
    country: modalExchangeFor(item).country,
    badge: modalBadgeFor(item),
    isin: item.isin || ISIN_BY_SYMBOL[item.symbol] || ''
  }));

  function modalMatches(entry, query) {
    if (!query) return true;
    const haystack = `${entry.symbol} ${entry.name} ${entry.market} ${entry.exchange} ${entry.isin}`.toUpperCase();
    return haystack.includes(query);
  }

  function renderSymbolModal() {
    const list = $('cba-symbol-list'); const empty = $('cba-modal-empty'); if (!list || !empty) return;
    const raw = String($('cba-modal-search')?.value || '').trim().toUpperCase();
    const filtered = SYMBOL_SEARCH_CATALOG.filter((entry) => (modalFilter === 'all' || entry.modalCategory === modalFilter) && modalMatches(entry, raw));
    const normalized = cleanSymbol(raw);
    const exact = SYMBOL_SEARCH_CATALOG.some((entry) => entry.symbol === normalized || (entry.isin && entry.isin.toUpperCase() === raw));
    const entries = filtered.slice(0, 80);
    if (raw.length >= 2 && !exact) {
      const custom = findMeta(raw);
      const exchange = custom.binance ? { name: 'BINANCE', country: '🪙' } : { name: 'AUTO', country: '自訂代碼' };
      entries.unshift({ ...custom, modalCategory: 'custom', exchange: exchange.name, country: exchange.country, badge: 'ADD', isin: '', custom: true });
    }
    list.innerHTML = entries.map((entry, index) => {
      const detail = entry.isin ? `ISIN ${entry.isin}` : entry.custom ? '搜尋自訂代碼 · 公開端點自動判斷' : `公開行情 · ${entry.modalCategory.toUpperCase()}`;
      return `<button class="cba-symbol-row${index === modalActiveIndex ? ' is-active' : ''}" type="button" role="option" aria-selected="${index === modalActiveIndex}" data-symbol="${escapeHtml(entry.symbol)}"><span class="cba-symbol-badge category-${escapeHtml(entry.modalCategory)}">${escapeHtml(entry.badge)}</span><span class="cba-symbol-copy"><strong>${escapeHtml(entry.symbol)}</strong><small>${escapeHtml(entry.name)}</small><em>${escapeHtml(detail)}</em></span><span class="cba-symbol-market"><strong>${escapeHtml(entry.exchange)}</strong><small>${escapeHtml(entry.country)}</small></span></button>`;
    }).join('');
    empty.hidden = entries.length > 0;
    if (!entries.length) empty.textContent = raw ? `找不到「${raw}」。請修改搜尋，或使用自訂代碼直接載入。` : '此分類目前沒有可顯示的商品。';
    modalActiveIndex = entries.length ? Math.min(Math.max(modalActiveIndex, 0), entries.length - 1) : -1;
  }

  function openSymbolModal() {
    const modal = $('cba-symbol-modal'); const search = $('cba-modal-search'); if (!modal || !search) return;
    modalLastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('cba-modal-open');
    modalFilter = 'all'; modalActiveIndex = -1; search.value = '';
    document.querySelectorAll('[data-symbol-filter]').forEach((tab) => { const active = tab.dataset.symbolFilter === modalFilter; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
    renderSymbolModal();
    window.requestAnimationFrame(() => search.focus());
  }

  function closeSymbolModal() {
    const modal = $('cba-symbol-modal'); if (!modal || modal.hidden) return;
    modal.hidden = true; document.body.classList.remove('cba-modal-open'); modalActiveIndex = -1;
    if (modalLastFocus && typeof modalLastFocus.focus === 'function') modalLastFocus.focus();
    modalLastFocus = null;
  }

  function selectModalSymbol(symbol) {
    const normalized = cleanSymbol(symbol); const input = $('cba-symbol-search');
    if (input) input.value = normalized;
    syncQuickSelection(normalized); closeSymbolModal(); runAnalysis();
  }

  function moveModalActive(step) {
    const options = [...document.querySelectorAll('#cba-symbol-list button[data-symbol]')]; if (!options.length) return;
    modalActiveIndex = (modalActiveIndex + step + options.length) % options.length;
    options.forEach((option, index) => { const active = index === modalActiveIndex; option.classList.toggle('is-active', active); option.setAttribute('aria-selected', String(active)); });
    options[modalActiveIndex]?.focus();
  }

  async function runAnalysis() {
    const runId = ++runSequence;
    const button = $('cba-run'); const input = $('cba-symbol-search'); const universe = $('cba-universe')?.value || 'all';
    targetMeta = findMeta(input?.value || '2330.TW');
    if (input) input.value = targetMeta.symbol;
    syncQuickSelection(targetMeta.symbol);
    $('cba-suggestions')?.classList.remove('is-visible');
    if (input) input.setAttribute('aria-expanded', 'false');
    if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 讀取中'; }
    setStatus('分析中…', `正在讀取 ${targetMeta.symbol} 的 ${currentLookback}D 歷史收盤價與比對池。`);
    currentResults = []; targetSeries = []; activeSelection = null; renderRanking(); drawOverlay(null); drawScatter(null);
    try {
      targetSeries = await fetchHistory(targetMeta);
      if (runId !== runSequence) return;
      const candidates = universeMetas(universe).filter((item) => item.symbol !== targetMeta.symbol);
      const successes = []; let completed = 0;
      for (let index = 0; index < candidates.length; index += CONFIG.batchSize) {
        const batch = candidates.slice(index, index + CONFIG.batchSize);
        const batchResults = await Promise.all(batch.map(async (meta) => {
          try {
            const history = await fetchHistory(meta);
            const aligned = alignSeries(targetSeries, history, currentLookback);
            if (aligned.target.length < 20) throw new Error('共同樣本不足');
            return calculateMetrics(meta, aligned);
          } catch (error) {
            return null;
          } finally {
            completed += 1;
            setStatus('分析中…', `${targetMeta.symbol} 已取得；比對池進度 ${completed}/${candidates.length}。`);
          }
        }));
        successes.push(...batchResults.filter(Boolean));
        if (runId !== runSequence) return;
      }
      currentResults = successes;
      renderSelectedOptions();
      renderRanking();
      renderSelection();
      const source = targetMeta.binance ? 'Binance REST' : 'Yahoo Finance／CORS fallback';
      if (currentResults.length) {
        setStatus('分析完成', `${targetMeta.symbol} · ${LOOKBACK_LABELS[currentLookback]} · ${source} · ${currentResults.length}/${candidates.length} 個對標可用。`);
      } else {
        setStatus('資料不足', `${targetMeta.symbol} 已載入，但比對池暫時沒有足夠共同交易日；可切換池或稍後重試。`, true);
      }
    } catch (error) {
      currentResults = []; renderSelectedOptions(); renderRanking(); drawOverlay(null); drawScatter(null);
      setStatus('載入失敗', `${targetMeta.symbol}：${error?.message || '公開行情端點暫時無法連線'}。請檢查代碼或稍後重試。`, true);
    } finally {
      if (runId === runSequence && button) { button.disabled = false; button.innerHTML = '<i class="fa-solid fa-bolt"></i> 開始分析'; }
    }
  }

  function bind() {
    $('cba-run')?.addEventListener('click', runAnalysis);
    $('analyzer-quick-select')?.addEventListener('change', () => {
      const quick = $('analyzer-quick-select');
      if (!quick?.value) return;
      const input = $('cba-symbol-search');
      if (input) input.value = cleanSymbol(quick.value);
      runAnalysis();
    });
    $('cba-universe')?.addEventListener('change', runAnalysis);
    $('cba-selected')?.addEventListener('change', renderSelection);
    $('cba-limit')?.addEventListener('change', renderRanking);
    $('cba-rank-mode')?.addEventListener('change', renderRanking);

    const openModal = () => openSymbolModal();
    $('cba-open-symbol-modal')?.addEventListener('click', openModal);
    $('cba-search-trigger')?.addEventListener('click', openModal);
    $('cba-search-trigger')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(); }
    });
    document.querySelectorAll('[data-cba-modal-close]').forEach((element) => element.addEventListener('click', closeSymbolModal));
    $('cba-modal-search')?.addEventListener('input', () => { modalActiveIndex = -1; renderSymbolModal(); });
    $('cba-modal-search')?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveModalActive(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveModalActive(-1); }
      else if (event.key === 'Enter') {
        event.preventDefault();
        const options = [...document.querySelectorAll('#cba-symbol-list button[data-symbol]')];
        const active = options[modalActiveIndex >= 0 ? modalActiveIndex : 0];
        if (active) selectModalSymbol(active.dataset.symbol);
      } else if (event.key === 'Escape') closeSymbolModal();
    });
    $('cba-modal-tabs')?.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-symbol-filter]'); if (!tab) return;
      modalFilter = tab.dataset.symbolFilter || 'all'; modalActiveIndex = -1;
      document.querySelectorAll('[data-symbol-filter]').forEach((item) => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
      renderSymbolModal();
    });
    $('cba-symbol-list')?.addEventListener('click', (event) => {
      const row = event.target.closest('button[data-symbol]'); if (row) selectModalSymbol(row.dataset.symbol);
    });
    $('cba-symbol-list')?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); moveModalActive(event.key === 'ArrowDown' ? 1 : -1); }
      else if (event.key === 'Enter') { const row = event.target.closest('button[data-symbol]'); if (row) { event.preventDefault(); selectModalSymbol(row.dataset.symbol); } }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('cba-symbol-modal')?.hidden) closeSymbolModal(); });

    $('cba-results-body')?.addEventListener('click', (event) => { const row = event.target.closest('tr[data-cba-select]'); if (row && !event.target.closest('a')) { if ($('cba-selected')) $('cba-selected').value = row.dataset.cbaSelect; renderSelection(); } });
    document.querySelectorAll('[data-lookback]').forEach((button) => button.addEventListener('click', () => { currentLookback = Number(button.dataset.lookback) || 60; document.querySelectorAll('[data-lookback]').forEach((item) => item.classList.toggle('is-active', item === button)); runAnalysis(); }));
    window.addEventListener('resize', () => { if (activeSelection) { drawOverlay(activeSelection); drawScatter(activeSelection); } });
    const params = new URLSearchParams(window.location.search); const requested = params.get('symbol'); if (requested) { targetMeta = findMeta(requested); if ($('cba-symbol-search')) $('cba-symbol-search').value = targetMeta.symbol; }
    if ($('cba-symbol-search') && !$('cba-symbol-search').value) $('cba-symbol-search').value = targetMeta.symbol;
    syncQuickSelection($('cba-symbol-search')?.value || targetMeta.symbol);
    renderSymbolModal();
    window.setTimeout(runAnalysis, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

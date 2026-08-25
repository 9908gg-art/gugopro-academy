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

  function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store', headers: { Accept: 'application/json' } }).finally(() => window.clearTimeout(timer));
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
        { url: jinaUrl, parser: (text) => JSON.parse(text.split('Markdown Content:\\n').slice(1).join('Markdown Content:\\n').trim()) },
        { url: `https://corsproxy.io/?url=${encodeURIComponent(url)}`, parser: (text) => JSON.parse(text) },
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, parser: (text) => JSON.parse(JSON.parse(text).contents) }
      ];
      let lastError = directError;
      for (const fallback of fallbackUrls) {
        try {
          const fallbackResponse = await fetchWithTimeout(fallback.url, 10000);
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

  function activateSuggestion(symbol) {
    const meta = findMeta(symbol);
    const input = $('cba-symbol-search');
    if (input) input.value = meta.symbol;
    $('cba-suggestions')?.classList.remove('is-visible');
    if (input) input.setAttribute('aria-expanded', 'false');
    suggestionIndex = -1;
    runAnalysis();
  }

  function renderSuggestions() {
    const input = $('cba-symbol-search'); const box = $('cba-suggestions'); if (!input || !box) return;
    const query = cleanSymbol(input.value);
    const raw = String(input.value || '').trim().toUpperCase();
    if (!raw) { box.classList.remove('is-visible'); input.setAttribute('aria-expanded', 'false'); return; }
    const matches = CATALOG.filter((item) => `${item.symbol} ${item.name} ${item.market}`.toUpperCase().includes(raw)).slice(0, 8);
    const free = findMeta(raw);
    const normalizedKnown = CATALOG.find((item) => item.symbol === free.symbol);
    if (!matches.length && normalizedKnown) matches.push(normalizedKnown);
    const known = Boolean(normalizedKnown);
    const items = matches.map((item) => `<button class="cba-suggestion" type="button" role="option" data-symbol="${escapeHtml(item.symbol)}"><span><strong>${escapeHtml(item.symbol)}</strong><small>${escapeHtml(item.name)}</small></span><em>${escapeHtml(item.market)}</em></button>`);
    if (raw.length >= 2 && !known) items.push(`<button class="cba-suggestion" type="button" role="option" data-symbol="${escapeHtml(query)}"><span><strong>${escapeHtml(query)}</strong><small>自訂代碼 · 公開端點自動判斷</small></span><em>Yahoo／Binance</em></button>`);
    box.innerHTML = items.join('');
    box.classList.toggle('is-visible', items.length > 0); input.setAttribute('aria-expanded', items.length > 0 ? 'true' : 'false'); suggestionIndex = -1;
  }

  async function runAnalysis() {
    const runId = ++runSequence;
    const button = $('cba-run'); const input = $('cba-symbol-search'); const universe = $('cba-universe')?.value || 'all';
    targetMeta = findMeta(input?.value || '2330.TW');
    if (input) input.value = targetMeta.symbol;
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
    $('cba-universe')?.addEventListener('change', runAnalysis);
    $('cba-selected')?.addEventListener('change', renderSelection);
    $('cba-limit')?.addEventListener('change', renderRanking);
    $('cba-rank-mode')?.addEventListener('change', renderRanking);
    $('cba-symbol-search')?.addEventListener('input', renderSuggestions);
    $('cba-symbol-search')?.addEventListener('focus', renderSuggestions);
    $('cba-symbol-search')?.addEventListener('keydown', (event) => {
      const box = $('cba-suggestions'); const options = box ? [...box.querySelectorAll('button[data-symbol]')] : [];
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!box?.classList.contains('is-visible')) renderSuggestions();
        const next = event.key === 'ArrowDown' ? suggestionIndex + 1 : suggestionIndex - 1;
        suggestionIndex = (next + options.length) % Math.max(1, options.length);
        options.forEach((option, index) => option.setAttribute('aria-selected', index === suggestionIndex ? 'true' : 'false'));
        options[suggestionIndex]?.focus(); event.preventDefault();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const active = options[suggestionIndex >= 0 ? suggestionIndex : 0];
        if (active && box?.classList.contains('is-visible')) activateSuggestion(active.dataset.symbol); else runAnalysis();
      } else if (event.key === 'Escape') {
        box?.classList.remove('is-visible'); event.target.setAttribute('aria-expanded', 'false');
      }
    });
    $('cba-suggestions')?.addEventListener('click', (event) => { const option = event.target.closest('button[data-symbol]'); if (option) activateSuggestion(option.dataset.symbol); });
    document.addEventListener('click', (event) => { if (!event.target.closest('.cba-search-box')) { $('cba-suggestions')?.classList.remove('is-visible'); $('cba-symbol-search')?.setAttribute('aria-expanded', 'false'); } });
    $('cba-results-body')?.addEventListener('click', (event) => { const row = event.target.closest('tr[data-cba-select]'); if (row && !event.target.closest('a')) { if ($('cba-selected')) $('cba-selected').value = row.dataset.cbaSelect; renderSelection(); } });
    document.querySelectorAll('[data-lookback]').forEach((button) => button.addEventListener('click', () => { currentLookback = Number(button.dataset.lookback) || 60; document.querySelectorAll('[data-lookback]').forEach((item) => item.classList.toggle('is-active', item === button)); runAnalysis(); }));
    window.addEventListener('resize', () => { if (activeSelection) { drawOverlay(activeSelection); drawScatter(activeSelection); } });
    const params = new URLSearchParams(window.location.search); const requested = params.get('symbol'); if (requested) { targetMeta = findMeta(requested); if ($('cba-symbol-search')) $('cba-symbol-search').value = targetMeta.symbol; }
    if ($('cba-symbol-search') && !$('cba-symbol-search').value) $('cba-symbol-search').value = targetMeta.symbol;
    window.setTimeout(runAnalysis, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

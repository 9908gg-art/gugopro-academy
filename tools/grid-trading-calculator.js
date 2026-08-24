(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const value = (id, fallback = 0) => {
    const parsed = Number($(id)?.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const finitePrice = (raw, fallback = 0) => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.min(1e12, Math.max(1e-8, parsed)) : fallback;
  };
  const money = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT` : '—';
  const pct = (amount) => Number.isFinite(amount) ? `${amount.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}%` : '—';
  const priceText = (amount) => Number.isFinite(amount) ? amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—';
  const setText = (id, text) => { if ($(id)) $(id).textContent = text; };

  const timeframeConfig = {
    '5m': { interval: '5m', limit: 1000 },
    '15m': { interval: '15m', limit: 1000 },
    '1h': { interval: '1h', limit: 1000 },
    '4h': { interval: '4h', limit: 1000 },
    '1d': { interval: '1d', limit: 500 }
  };

  let chart = null;
  let candleSeries = null;
  let volumeSeries = null;
  let chartData = [];
  let priceLines = [];
  let rangeTouched = false;
  let requestSequence = 0;

  function fetchWithTimeout(url, timeout = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store' }).finally(() => window.clearTimeout(timer));
  }

  async function fetchBitcoin(timeframe) {
    const config = timeframeConfig[timeframe] || timeframeConfig['15m'];
    const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${config.interval}&limit=${config.limit}`;
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
    if (parsed.length < 20) throw new Error('BTC K 線資料不足');
    return parsed;
  }

  function initChart() {
    if (!window.LightweightCharts || !$('grid-chart')) throw new Error('Lightweight Charts 尚未載入');
    const container = $('grid-chart');
    chart = window.LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: Math.max(420, container.clientHeight || 480),
      layout: { background: { type: 'solid', color: '#07131d' }, textColor: '#a8bcc5', fontFamily: 'DM Sans, sans-serif' },
      grid: { vertLines: { color: 'rgba(152, 182, 190, 0.08)' }, horzLines: { color: 'rgba(152, 182, 190, 0.08)' } },
      crosshair: { mode: 0, vertLine: { color: 'rgba(255, 178, 95, 0.5)', width: 1, style: 2 }, horzLine: { color: 'rgba(126, 214, 176, 0.6)', width: 1, style: 2 } },
      rightPriceScale: { borderColor: 'rgba(176, 202, 208, 0.25)', scaleMargins: { top: 0.08, bottom: 0.18 } },
      timeScale: { borderColor: 'rgba(176, 202, 208, 0.25)', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    });
    candleSeries = chart.addCandlestickSeries({ upColor: '#5fd3a0', downColor: '#f56f62', borderUpColor: '#5fd3a0', borderDownColor: '#f56f62', wickUpColor: '#5fd3a0', wickDownColor: '#f56f62', priceLineVisible: false });
    volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.82, bottom: 0 } });
    new ResizeObserver(() => chart?.resize(container.clientWidth, Math.max(420, container.clientHeight || 480))).observe(container);
  }

  function renderCandles() {
    if (!candleSeries || !volumeSeries || !chartData.length) return;
    candleSeries.setData(chartData.map((row) => ({ time: row.time, open: row.open, high: row.high, low: row.low, close: row.close })));
    volumeSeries.setData(chartData.map((row) => ({ time: row.time, value: Math.max(0, row.volume), color: row.close >= row.open ? 'rgba(95, 211, 160, 0.32)' : 'rgba(245, 111, 98, 0.32)' })));
    chart.timeScale().fitContent();
  }

  function levelsFor(lower, upper, count, mode) {
    return Array.from({ length: count + 1 }, (_, index) => {
      const fraction = index / count;
      return mode === 'geometric' ? lower * Math.pow(upper / lower, fraction) : lower + (upper - lower) * fraction;
    });
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
      const isBuy = level < current;
      priceLines.push(candleSeries.createPriceLine({
        price: level,
        color: isBuy ? '#5fd3a0' : '#f56f62',
        lineWidth: index === 0 || index === levels.length - 1 ? 2 : 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: isBuy ? `B${index}` : `S${index}`
      }));
    });
    if (stop > 0) priceLines.push(candleSeries.createPriceLine({ price: stop, color: '#f3c969', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'SL' }));
    if (take > 0) priceLines.push(candleSeries.createPriceLine({ price: take, color: '#b78cff', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'TP' }));
  }

  function setDefaultsAroundPrice(current) {
    if (rangeTouched || !Number.isFinite(current) || current <= 0) return;
    const lower = current * 0.9;
    const upper = current * 1.1;
    $('grid-lower').value = lower.toFixed(2);
    $('grid-upper').value = upper.toFixed(2);
    $('grid-stop').value = (current * 0.85).toFixed(2);
    $('grid-take').value = (current * 1.15).toFixed(2);
  }

  function simulateGrid() {
    if (!chartData.length) return;
    const current = chartData[chartData.length - 1].close;
    const lower = finitePrice(value('grid-lower'), current * 0.9);
    const upper = Math.max(lower * 1.000001, finitePrice(value('grid-upper'), current * 1.1));
    const count = Math.min(100, Math.max(2, Math.floor(value('grid-count', 20))));
    const capital = Math.max(0, value('grid-capital', 10000));
    const stop = finitePrice(value('grid-stop'), lower * 0.95);
    const take = finitePrice(value('grid-take'), upper * 1.05);
    const feeRate = Math.min(0.05, Math.max(0, value('grid-fee', 0.1) / 100));
    const mode = $('grid-mode')?.value || 'geometric';
    const levels = levelsFor(lower, upper, count, mode);
    const grossSpacing = mode === 'geometric' ? Math.pow(upper / lower, 1 / count) - 1 : (upper - lower) / count / ((upper + lower) / 2);
    const netMargin = grossSpacing - (feeRate * 2);
    const orderCapital = capital / count;
    let cash = capital;
    let lots = [];
    let realized = 0;
    let trades = 0;
    let peak = capital;
    let maxDrawdown = 0;
    let maxInventoryValue = 0;
    let stopTriggered = false;
    let takeTriggered = false;
    const equityPath = [capital];

    for (let index = 1; index < chartData.length; index += 1) {
      const previous = chartData[index - 1].close;
      const price = chartData[index].close;
      const crossed = levels.filter((level) => level > Math.min(previous, price) && level <= Math.max(previous, price) && level >= lower && level <= upper);
      const ordered = price >= previous ? crossed.sort((a, b) => a - b) : crossed.sort((a, b) => b - a);
      ordered.forEach((level) => {
        if (price < previous) {
          const buyCost = orderCapital * (1 + feeRate);
          if (cash >= buyCost) {
            const quantity = orderCapital / level;
            cash -= buyCost;
            lots.push({ level, quantity, cost: buyCost });
          }
        } else if (lots.length) {
          const lot = lots.shift();
          const proceeds = lot.quantity * level * (1 - feeRate);
          cash += proceeds;
          realized += proceeds - lot.cost;
          trades += 1;
        }
      });
      const inventoryValue = lots.reduce((sum, lot) => sum + lot.quantity * price, 0);
      const equity = cash + inventoryValue;
      maxInventoryValue = Math.max(maxInventoryValue, inventoryValue);
      peak = Math.max(peak, equity);
      maxDrawdown = Math.max(maxDrawdown, peak > 0 ? (peak - equity) / peak : 0);
      equityPath.push(equity);
      if (price <= stop) stopTriggered = true;
      if (price >= take) takeTriggered = true;
    }

    const finalValue = equityPath[equityPath.length - 1];
    const returnPct = capital > 0 ? (finalValue / capital - 1) * 100 : 0;
    const utilization = capital > 0 ? (maxInventoryValue / capital) * 100 : 0;
    const lowerDistance = current > lower ? ((current - lower) / current) * 100 : 0;
    const upperDistance = current < upper ? ((upper - current) / current) * 100 : 0;
    const nearestBoundary = Math.min(lowerDistance, upperDistance);
    const breakRisk = current <= lower ? '已跌破下網' : current >= upper ? '已突破上網' : `${pct(nearestBoundary)} 距最近邊界`;
    const statusParts = [
      `BTC/USDT ${$('grid-timeframe')?.value || '15m'} · ${chartData.length} 根 K 線`,
      stopTriggered ? '歷史路徑曾觸及止損' : '',
      takeTriggered ? '歷史路徑曾觸及止盈' : ''
    ].filter(Boolean);

    renderGridLines(levels, current, stop, take);
    setText('grid-live-price', priceText(current));
    setText('grid-spacing', `${pct(grossSpacing * 100)}${mode === 'geometric' ? '（比例）' : '（區間）'}`);
    setText('grid-net-margin', pct(netMargin * 100));
    setText('grid-single-profit', money(Math.max(0, orderCapital * netMargin)));
    setText('grid-utilization', pct(utilization));
    setText('grid-break-risk', breakRisk);
    setText('grid-drawdown', pct(maxDrawdown * 100));
    setText('grid-realized-profit', money(realized));
    setText('grid-final-value', money(finalValue));
    setText('grid-status', `${statusParts.join('；')}；已完成 ${trades} 次網格回合，手續費按單邊 ${value('grid-fee', 0.1)}% 扣除。`);
  }

  function renderFallback(reason) {
    const widget = $('grid-tv-widget');
    if (!widget) return;
    widget.innerHTML = `<div class="grid-tv-fallback-note"><i class="fa-solid fa-chart-line"></i><strong>Binance 公開 K 線暫時無法連線：${reason}</strong><span>以下仍可使用網格收益與風險計算；圖表會以 TradingView BTC/USDT fallback 顯示。</span></div><iframe title="TradingView BTCUSDT 即時圖表" src="https://www.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=15&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=%2307131d&theme=dark&style=1&timezone=Asia%2FTaipei&withdateranges=1&hideideas=1&studies=Volume%40tv-basicstudies" loading="eager" allow="fullscreen" referrerpolicy="origin"></iframe>`;
    widget.classList.add('is-visible');
    $('grid-chart')?.classList.add('is-fallback-hidden');
  }

  async function loadMarket() {
    const requestId = ++requestSequence;
    const timeframe = $('grid-timeframe')?.value || '15m';
    setText('grid-live-status', `載入 Binance BTC/USDT · ${timeframe}…`);
    $('grid-tv-widget')?.classList.remove('is-visible');
    $('grid-chart')?.classList.remove('is-fallback-hidden');
    try {
      chartData = await fetchBitcoin(timeframe);
      if (requestId !== requestSequence) return;
      if (!chart) initChart();
      renderCandles();
      setDefaultsAroundPrice(chartData[chartData.length - 1].close);
      setText('grid-live-status', `Binance Public API · ${chartData.length} 根 · ${new Date(chartData[chartData.length - 1].time * 1000).toLocaleString('zh-TW')}`);
      simulateGrid();
    } catch (error) {
      if (requestId !== requestSequence) return;
      chartData = [];
      renderFallback(error.name === 'AbortError' ? '連線逾時' : error.message);
      setText('grid-live-status', '已切換 TradingView BTC/USDT');
      simulateGrid();
    }
  }

  function bind() {
    ['grid-lower', 'grid-upper', 'grid-count', 'grid-mode', 'grid-capital', 'grid-stop', 'grid-take', 'grid-fee'].forEach((id) => $(id)?.addEventListener('input', () => { rangeTouched = true; simulateGrid(); }));
    $('grid-timeframe')?.addEventListener('change', loadMarket);
    $('grid-refresh')?.addEventListener('click', loadMarket);
    simulateGrid();
    loadMarket();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();

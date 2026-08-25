/* Shared real-market data and chart helpers for the Taiwan chapter tools. */
(function (window) {
  'use strict';

  var API = 'https://api.finmindtrade.com/api/v4/data';
  var DATASETS = {
    price: 'TaiwanStockPrice',
    institutional: 'TaiwanStockInstitutionalInvestorsBuySell',
    margin: 'TaiwanStockMarginPurchaseShortSale',
    per: 'TaiwanStockPER',
    dividend: 'TaiwanStockDividend',
    financial: 'TaiwanStockFinancialStatements'
  };

  function cleanSymbol(value) {
    var raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    var match = raw.match(/\d{4}/);
    return match ? match[0] : raw.replace(/\.(TW|TWO|TWSE)$/i, '').replace(/[^A-Z0-9]/g, '').slice(0, 12);
  }

  function displaySymbol(value) {
    var symbol = cleanSymbol(value);
    return /^\d{4}$/.test(symbol) ? symbol + '.TW' : symbol;
  }

  function dateString(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function dateRange(days) {
    var end = new Date();
    var start = new Date(end.getTime() - Math.max(30, Number(days) || 120) * 86400000);
    return { start: dateString(start), end: dateString(end) };
  }

  function request(dataset, symbol, days, extra) {
    var range = dateRange(days);
    var params = new URLSearchParams({ dataset: dataset, data_id: cleanSymbol(symbol), start_date: range.start, end_date: range.end });
    Object.keys(extra || {}).forEach(function (key) { params.set(key, extra[key]); });
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 15000);
    return fetch(API + '?' + params.toString(), { mode: 'cors', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('資料服務 HTTP ' + response.status);
        return response.json();
      })
      .then(function (json) {
        if (json.status && Number(json.status) >= 400) throw new Error(json.msg || '資料服務回傳錯誤');
        if (!Array.isArray(json.data)) throw new Error('資料格式無法解析');
        return json.data;
      })
      .finally(function () { window.clearTimeout(timer); });
  }

  function finite(value) { return Number.isFinite(Number(value)); }
  function number(value) { return Number(value); }
  function uniqueByDate(rows) {
    var seen = {};
    return rows.filter(function (row) {
      if (!row.date || seen[row.date]) return false;
      seen[row.date] = true;
      return true;
    });
  }
  function sortDate(rows) { return rows.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }); }

  function priceHistory(symbol, days) {
    return request(DATASETS.price, symbol, days || 150).then(function (rows) {
      return sortDate(rows.map(function (row) {
        return { date: row.date, open: number(row.open), high: number(row.max), low: number(row.min), close: number(row.close), volume: number(row.Trading_Volume), turnover: number(row.Trading_money) };
      }).filter(function (row) { return finite(row.close) && row.close > 0; }));
    });
  }

  function institutional(symbol, days) {
    return request(DATASETS.institutional, symbol, days || 110).then(function (rows) {
      var buckets = {};
      rows.forEach(function (row) {
        if (!row.date) return;
        if (!buckets[row.date]) buckets[row.date] = { date: row.date, foreign: 0, trust: 0, dealer: 0 };
        var net = (number(row.buy) - number(row.sell)) / 1000;
        if (row.name === 'Foreign_Investor' || row.name === 'Foreign_Dealer_Self') buckets[row.date].foreign += finite(net) ? net : 0;
        if (row.name === 'Investment_Trust') buckets[row.date].trust += finite(net) ? net : 0;
        if (row.name === 'Dealer_self' || row.name === 'Dealer_Hedging') buckets[row.date].dealer += finite(net) ? net : 0;
      });
      return Object.keys(buckets).sort().map(function (date) {
        var row = buckets[date]; row.total = row.foreign + row.trust + row.dealer; return row;
      });
    });
  }

  function margin(symbol, days) {
    return request(DATASETS.margin, symbol, days || 110).then(function (rows) {
      return sortDate(rows.map(function (row) {
        var finance = number(row.MarginPurchaseTodayBalance);
        var financePrev = number(row.MarginPurchaseYesterdayBalance);
        var short = number(row.ShortSaleTodayBalance);
        var shortPrev = number(row.ShortSaleYesterdayBalance);
        return { date: row.date, margin: finance / 1000, marginPrev: financePrev / 1000, short: short / 1000, shortPrev: shortPrev / 1000 };
      }).filter(function (row) { return finite(row.margin) && finite(row.short); }));
    });
  }

  function per(symbol, days) {
    return request(DATASETS.per, symbol, days || 820).then(function (rows) {
      return sortDate(rows.map(function (row) { return { date: row.date, pe: number(row.PER), yieldRate: number(row.dividend_yield), pbr: number(row.PBR) }; }).filter(function (row) { return finite(row.pe) && row.pe > 0; }));
    });
  }

  function dividend(symbol, days) {
    return request(DATASETS.dividend, symbol, days || 1300).then(function (rows) {
      return rows.map(function (row) {
        return { date: row.date, exDate: row.CashExDividendTradingDate || row.date, cash: number(row.CashEarningsDistribution) };
      }).filter(function (row) { return finite(row.cash) && row.cash >= 0; }).sort(function (a, b) { return String(a.exDate).localeCompare(String(b.exDate)); });
    });
  }

  function financial(symbol, days) {
    return request(DATASETS.financial, symbol, days || 900).then(function (rows) {
      var epsRows = uniqueByDate(rows.filter(function (row) { return row.type === 'EPS' && finite(row.value); }).map(function (row) { return { date: row.date, eps: number(row.value) }; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }));
      return epsRows;
    });
  }

  function allFor(symbol) {
    var clean = cleanSymbol(symbol);
    return Promise.all([priceHistory(clean, 180), institutional(clean, 110), margin(clean, 110), per(clean, 820), dividend(clean, 1300), financial(clean, 900)]).then(function (values) {
      return { symbol: displaySymbol(clean), code: clean, price: values[0], institutional: values[1], margin: values[2], per: values[3], dividend: values[4], financial: values[5], fetchedAt: new Date() };
    });
  }

  function formatNumber(value, digits) {
    return finite(value) ? number(value).toLocaleString('zh-TW', { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }) : '—';
  }
  function formatPrice(value) {
    if (!finite(value)) return '—';
    var digits = Math.abs(number(value)) >= 1000 ? 2 : Math.abs(number(value)) >= 1 ? 2 : 4;
    return number(value).toLocaleString('zh-TW', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function formatPercent(value, digits) { return finite(value) ? formatNumber(value, digits == null ? 2 : digits) + '%' : '—'; }
  function formatDate(value) {
    if (!value) return '—';
    var date = new Date(String(value).length > 10 ? value : value + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
  }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }

  function canvasSize(canvas, minHeight) {
    if (!canvas) return null;
    var width = Math.max(280, canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 640);
    var height = Math.max(minHeight || 240, canvas.clientHeight || (canvas.parentElement && canvas.parentElement.clientHeight) || minHeight || 240);
    var ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    var ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); return { ctx: ctx, width: width, height: height };
  }
  function base(ctx, width, height, margins, title) {
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#07111d'; ctx.fillRect(0, 0, width, height);
    ctx.font = '700 11px DM Sans, sans-serif'; ctx.fillStyle = '#ffcf83'; ctx.fillText(title || 'REAL MARKET DATA', margins.left, 17);
    ctx.strokeStyle = 'rgba(158,181,196,.13)'; ctx.lineWidth = 1; ctx.font = '10px DM Sans, sans-serif'; ctx.fillStyle = '#8298a8';
    for (var i = 0; i <= 4; i += 1) { var y = margins.top + (height - margins.top - margins.bottom) * i / 4; ctx.beginPath(); ctx.moveTo(margins.left, y); ctx.lineTo(width - margins.right, y); ctx.stroke(); }
  }
  function line(ctx, values, min, max, margins, width, height, color, lineWidth) {
    if (!values.length) return;
    var plotW = width - margins.left - margins.right; var plotH = height - margins.top - margins.bottom; ctx.beginPath();
    values.forEach(function (value, index) { var x = margins.left + plotW * index / Math.max(1, values.length - 1); var y = margins.top + (max - value) / Math.max(1e-9, max - min) * plotH; if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 2; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function legend(ctx, items, x, y) { ctx.font = '10px DM Sans, sans-serif'; items.forEach(function (item) { ctx.fillStyle = item.color; ctx.fillRect(x, y - 8, 8, 8); ctx.fillStyle = '#b9c8d2'; ctx.fillText(item.label, x + 12, y); x += 12 + ctx.measureText(item.label).width + 16; }); }

  function drawInstitutionalChart(canvas, prices, institutions) {
    var size = canvasSize(canvas, 260); if (!size) return;
    var ctx = size.ctx, width = size.width, height = size.height, margins = { left: 48, right: 16, top: 30, bottom: 28 };
    var rows = prices || []; var inst = institutions || []; var map = {}; inst.forEach(function (row) { map[row.date] = row; });
    var closes = rows.map(function (row) { return row.close; }); var cumulative = rows.map(function (_, index) { return rows.slice(Math.max(0, index - 19), index + 1).reduce(function (total, row) { var item = map[row.date]; return total + (item ? item.total : 0); }, 0); }); var all = closes.length ? closes : [0]; var min = Math.min.apply(Math, all), max = Math.max.apply(Math, all); var pad = Math.max(1, (max - min) * .1); min -= pad; max += pad;
    base(ctx, width, height, margins, 'CLOSE + INSTITUTIONAL NET BUY / SELL (張)');
    for (var i = 0; i <= 4; i += 1) { var value = max - (max - min) * i / 4; var y = margins.top + (height - margins.top - margins.bottom) * i / 4; ctx.fillText(formatPrice(value), 5, y + 3); }
    var plotW = width - margins.left - margins.right; var barBase = height - margins.bottom; var absMax = 1; rows.forEach(function (row) { var item = map[row.date]; if (item) absMax = Math.max(absMax, Math.abs(item.foreign), Math.abs(item.trust), Math.abs(item.dealer)); });
    rows.forEach(function (row, index) { var item = map[row.date]; if (!item) return; var x = margins.left + plotW * index / Math.max(1, rows.length - 1); var barW = Math.max(1, Math.min(6, plotW / Math.max(20, rows.length) / 3)); [['foreign', '#79b8ff'], ['trust', '#ff8f9f'], ['dealer', '#ffcf83']].forEach(function (entry, entryIndex) { var value = item[entry[0]]; var barH = Math.abs(value) / absMax * 38; ctx.fillStyle = entry[1]; ctx.globalAlpha = .72; ctx.fillRect(x + (entryIndex - 1) * barW, value >= 0 ? barBase - barH : barBase, barW - 1, barH); }); ctx.globalAlpha = 1; });
    line(ctx, closes, min, max, margins, width, height, '#f8fafc', 2.2); var cumulativeMin = Math.min.apply(Math, cumulative.concat([0])), cumulativeMax = Math.max.apply(Math, cumulative.concat([1])); var cumulativeAsPrice = cumulative.map(function (value) { return min + (value - cumulativeMin) / Math.max(1e-9, cumulativeMax - cumulativeMin) * (max - min); }); line(ctx, cumulativeAsPrice, min, max, margins, width, height, '#ffb25f', 1.7);
    ctx.fillStyle = '#8298a8'; ctx.fillText(formatDate(rows[0] && rows[0].date), margins.left, height - 8); ctx.fillText(formatDate(rows[Math.floor(rows.length / 2)] && rows[Math.floor(rows.length / 2)].date), width / 2 - 24, height - 8); ctx.fillText(formatDate(rows[rows.length - 1] && rows[rows.length - 1].date), width - margins.right - 54, height - 8);
    legend(ctx, [{ color: '#f8fafc', label: '收盤' }, { color: '#ffb25f', label: '法人20日累計' }, { color: '#79b8ff', label: '外資' }, { color: '#ff8f9f', label: '投信' }, { color: '#ffcf83', label: '自營' }], margins.left, 27);
  }

  function movingAverage(values, period) { return values.map(function (_, index) { var slice = values.slice(Math.max(0, index - period + 1), index + 1); return slice.reduce(function (sum, value) { return sum + value; }, 0) / slice.length; }); }
  function drawTechnicalChart(canvas, rows) {
    var size = canvasSize(canvas, 300); if (!size) return;
    var ctx = size.ctx, width = size.width, height = size.height, margins = { left: 52, right: 16, top: 30, bottom: 42 }; rows = rows || [];
    var closes = rows.map(function (row) { return row.close; }); var ma5 = movingAverage(closes, 5), ma20 = movingAverage(closes, 20); var all = closes.concat(ma5).concat(ma20); var min = Math.min.apply(Math, all), max = Math.max.apply(Math, all); var pad = Math.max(1, (max - min) * .1); min -= pad; max += pad;
    base(ctx, width, height, margins, 'DAILY PRICE / MA 5 / MA 20 / VOLUME');
    for (var i = 0; i <= 4; i += 1) { var value = max - (max - min) * i / 4; var y = margins.top + (height - margins.top - margins.bottom) * i / 4; ctx.fillText(formatPrice(value), 5, y + 3); }
    line(ctx, closes, min, max, margins, width, height, '#f8fafc', 2.2); line(ctx, ma5, min, max, margins, width, height, '#ffb25f', 1.7); line(ctx, ma20, min, max, margins, width, height, '#7ed6b0', 1.7);
    var plotW = width - margins.left - margins.right; var volumeMax = Math.max.apply(Math, rows.map(function (row) { return row.volume || 0; }).concat([1])); rows.forEach(function (row, index) { var x = margins.left + plotW * index / Math.max(1, rows.length - 1); var barH = (row.volume || 0) / volumeMax * 30; ctx.fillStyle = row.close >= row.open ? 'rgba(126,214,176,.45)' : 'rgba(255,143,159,.45)'; ctx.fillRect(x - 2, height - 30 - barH, 4, barH); });
    ctx.fillStyle = '#8298a8'; ctx.fillText(formatDate(rows[0] && rows[0].date), margins.left, height - 10); ctx.fillText(formatDate(rows[Math.floor(rows.length / 2)] && rows[Math.floor(rows.length / 2)].date), width / 2 - 24, height - 10); ctx.fillText(formatDate(rows[rows.length - 1] && rows[rows.length - 1].date), width - margins.right - 54, height - 10);
    legend(ctx, [{ color: '#f8fafc', label: '收盤' }, { color: '#ffb25f', label: '5MA' }, { color: '#7ed6b0', label: '20MA' }], margins.left, 27);
  }

  function drawIndicatorChart(canvas, rows) {
    canvas.style.height = (window.innerWidth <= 600 ? 220 : 260) + 'px'; var size = canvasSize(canvas, 260); if (!size) return;
    var ctx = size.ctx, width = size.width, height = size.height, margins = { left: 46, right: 16, top: 30, bottom: 30 }; rows = rows || []; var closes = rows.map(function (row) { return row.close; }); var rsi = [], kd = [], macd = [];
    function ema(values, period) { var alpha = 2 / (period + 1), current = values[0] || 0; values.slice(1).forEach(function (value) { current = alpha * value + (1 - alpha) * current; }); return current; }
    closes.forEach(function (_, index) { var slice = closes.slice(Math.max(0, index - 13), index + 1), gains = 0, losses = 0; for (var i = 1; i < slice.length; i += 1) { var change = slice[i] - slice[i - 1]; if (change >= 0) gains += change; else losses -= change; } rsi.push(!losses ? (gains ? 100 : 50) : 100 - 100 / (1 + (gains / Math.max(1, slice.length - 1)) / (losses / Math.max(1, slice.length - 1)))); var kdSlice = closes.slice(Math.max(0, index - 8), index + 1), low = Math.min.apply(Math, kdSlice), high = Math.max.apply(Math, kdSlice); kd.push(high === low ? 50 : (closes[index] - low) / (high - low) * 100); macd.push(ema(closes.slice(0, index + 1), 12) - ema(closes.slice(0, index + 1), 26)); });
    if (window.Chart) { if (canvas.__twChart) canvas.__twChart.destroy(); canvas.__twChart = new window.Chart(canvas.getContext('2d'), { type: 'line', data: { labels: rows.map(function (row) { return row.date; }), datasets: [{ label: 'RSI(14)', data: rsi, borderColor: '#ffb25f', backgroundColor: 'rgba(255,178,95,.12)', borderWidth: 2, pointRadius: 0, tension: .22 }, { label: 'KD-K(9)', data: kd, borderColor: '#7ed6b0', backgroundColor: 'rgba(126,214,176,.1)', borderWidth: 2, pointRadius: 0, tension: .22 }, { label: 'MACD 標準化', data: macd.map(function (value) { return (value - Math.min.apply(Math, macd.concat([0]))) / Math.max(1e-9, Math.max.apply(Math, macd.concat([1])) - Math.min.apply(Math, macd.concat([0]))) * 100; }), borderColor: '#f8fafc', borderWidth: 1.5, pointRadius: 0, tension: .18 }] }, options: { responsive: false, maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { labels: { color: '#dce8ef', boxWidth: 10, font: { size: 10 } } }, tooltip: { callbacks: { title: function (items) { return items[0] ? formatDate(items[0].label) : ''; } } } }, scales: { x: { ticks: { color: '#8298a8', maxTicksLimit: 6, font: { size: 9 } }, grid: { color: 'rgba(158,181,196,.08)' } }, y: { min: 0, max: 100, ticks: { color: '#8298a8', font: { size: 9 } }, grid: { color: 'rgba(158,181,196,.13)' } } } } }); return; }
    base(ctx, width, height, margins, 'OSCILLATORS / RSI 14 / KD 9 / MACD 12-26'); for (var grid = 0; grid <= 4; grid += 1) { var value = 100 - grid * 25, y = margins.top + (height - margins.top - margins.bottom) * grid / 4; ctx.fillStyle = '#8298a8'; ctx.fillText(value.toFixed(0), 10, y + 3); } var macdMin = Math.min.apply(Math, macd.concat([0])), macdMax = Math.max.apply(Math, macd.concat([1])); var macdScaled = macd.map(function (value) { return (value - macdMin) / Math.max(1e-9, macdMax - macdMin) * 100; }); var plotW = width - margins.left - margins.right; macd.forEach(function (value, index) { var x = margins.left + plotW * index / Math.max(1, macd.length - 1), barH = Math.abs(macdScaled[index] - 50) / 50 * 28; ctx.fillStyle = value >= 0 ? 'rgba(126,214,176,.45)' : 'rgba(255,143,159,.45)'; ctx.fillRect(x - 2, value >= 0 ? margins.top + (height - margins.top - margins.bottom) / 2 - barH : margins.top + (height - margins.top - margins.bottom) / 2, 4, barH); }); line(ctx, rsi, 0, 100, margins, width, height, '#ffb25f', 1.8); line(ctx, kd, 0, 100, margins, width, height, '#7ed6b0', 1.8); line(ctx, macdScaled, 0, 100, margins, width, height, '#f8fafc', 1.4); legend(ctx, [{ color: '#ffb25f', label: 'RSI' }, { color: '#7ed6b0', label: 'KD-K' }, { color: '#f8fafc', label: 'MACD 標準化' }], margins.left, 27); ctx.fillStyle = '#8298a8'; ctx.fillText(formatDate(rows[0] && rows[0].date), margins.left, height - 9); ctx.fillText(formatDate(rows[rows.length - 1] && rows[rows.length - 1].date), width - margins.right - 54, height - 9);
  }

  function percentile(values, ratio) { var sorted = values.filter(finite).slice().sort(function (a, b) { return a - b; }); if (!sorted.length) return NaN; return sorted[Math.floor((sorted.length - 1) * ratio)]; }
  function drawValuationChart(canvas, perRows, dividendRows, currentPe) {
    var size = canvasSize(canvas, 300); if (!size) return;
    var ctx = size.ctx, width = size.width, height = size.height, margins = { left: 48, right: 16, top: 32, bottom: 38 }; perRows = perRows || []; dividendRows = dividendRows || [];
    var peValues = perRows.map(function (row) { return row.pe; }); var low = percentile(peValues, .1), mid = percentile(peValues, .5), high = percentile(peValues, .9); var max = Math.max(high || 1, currentPe || 1) * 1.18; var min = Math.max(0, Math.min(low || 0, currentPe || 0) * .82); base(ctx, width, height, margins, 'P/E BAND + DIVIDEND YIELD');
    for (var i = 0; i <= 4; i += 1) { var value = max - (max - min) * i / 4; var y = margins.top + (height - margins.top - margins.bottom) * i / 4; ctx.fillText(formatNumber(value, 1) + 'x', 8, y + 3); }
    var bandY = margins.top + (height - margins.top - margins.bottom) * .68; var bandH = 22; var scale = function (value) { return margins.left + (value - min) / Math.max(1e-9, max - min) * (width - margins.left - margins.right); }; ctx.fillStyle = 'rgba(126,214,176,.6)'; ctx.fillRect(scale(low || min), bandY, Math.max(1, scale(mid || min) - scale(low || min)), bandH); ctx.fillStyle = 'rgba(255,178,95,.64)'; ctx.fillRect(scale(mid || min), bandY, Math.max(1, scale(high || mid) - scale(mid || min)), bandH);
    line(ctx, peValues, min, max, margins, width, height, '#f8fafc', 2); if (finite(currentPe)) { var x = scale(currentPe); ctx.strokeStyle = '#ff8f9f'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x, margins.top); ctx.lineTo(x, bandY + bandH + 10); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ffaaa0'; ctx.fillText('現行 ' + formatNumber(currentPe, 1) + 'x', Math.min(width - 70, Math.max(margins.left, x - 20)), margins.top - 8); }
    ctx.fillStyle = '#9cebc5'; ctx.fillText('便宜 P10 ' + formatNumber(low, 1) + 'x', margins.left, bandY + bandH + 15); ctx.fillStyle = '#ffcf83'; ctx.fillText('中位 P50 ' + formatNumber(mid, 1) + 'x', width / 2 - 24, bandY + bandH + 15); ctx.fillStyle = '#ffaaa0'; ctx.fillText('昂貴 P90 ' + formatNumber(high, 1) + 'x', width - margins.right - 72, bandY + bandH + 15);
    ctx.fillStyle = '#8298a8'; ctx.fillText(formatDate(perRows[0] && perRows[0].date), margins.left, height - 10); ctx.fillText(formatDate(perRows[perRows.length - 1] && perRows[perRows.length - 1].date), width - margins.right - 54, height - 10); legend(ctx, [{ color: '#f8fafc', label: '歷史 PE' }, { color: '#7ed6b0', label: 'P10-P50' }, { color: '#ffb25f', label: 'P50-P90' }], margins.left, 27);
  }

  function drawCostChart(canvas, values) {
    var size = canvasSize(canvas, 210); if (!size) return; var ctx = size.ctx, width = size.width, height = size.height, margins = { left: 42, right: 16, top: 32, bottom: 34 }; base(ctx, width, height, margins, 'TRANSACTION COST BREAKDOWN'); var entries = values || []; var max = Math.max.apply(Math, entries.map(function (item) { return Math.abs(item.value); }).concat([1])); var plotW = width - margins.left - margins.right; var barW = Math.max(22, Math.min(90, plotW / Math.max(1, entries.length) - 12)); entries.forEach(function (item, index) { var x = margins.left + (index + .5) * plotW / Math.max(1, entries.length); var barH = Math.abs(item.value) / max * (height - margins.top - margins.bottom - 8); ctx.fillStyle = item.color || '#ffb25f'; ctx.fillRect(x - barW / 2, height - margins.bottom - barH, barW, barH); ctx.fillStyle = '#dce8ef'; ctx.textAlign = 'center'; ctx.fillText(formatNumber(item.value, 0), x, height - margins.bottom - barH - 7); ctx.fillStyle = '#8298a8'; ctx.fillText(item.label, x, height - 12); }); ctx.textAlign = 'left';
  }

  window.TWMarketData = { API: API, DATASETS: DATASETS, cleanSymbol: cleanSymbol, displaySymbol: displaySymbol, dateRange: dateRange, request: request, priceHistory: priceHistory, institutional: institutional, margin: margin, per: per, dividend: dividend, financial: financial, allFor: allFor, formatNumber: formatNumber, formatPrice: formatPrice, formatPercent: formatPercent, formatDate: formatDate, escapeHtml: escapeHtml, drawInstitutionalChart: drawInstitutionalChart, drawTechnicalChart: drawTechnicalChart, drawIndicatorChart: drawIndicatorChart, drawValuationChart: drawValuationChart, drawCostChart: drawCostChart };
}(window));

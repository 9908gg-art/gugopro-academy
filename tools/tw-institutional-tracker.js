(function () {
  'use strict';
  var md = window.TWMarketData;
  var $ = function (id) { return document.getElementById(id); };
  var state = { data: null, loading: false };
  var meta = { '2330': '台積電', '2454': '聯發科', '2603': '長榮', '0050': '元大台灣50', '00919': '群益台灣精選高息', '2317': '鴻海' };

  function setStatus(main, detail, error) {
    var node = $('tw-inst-status'); if (!node) return;
    node.classList.toggle('is-error', Boolean(error));
    $('tw-inst-status-main').textContent = main;
    $('tw-inst-status-detail').textContent = detail || '';
  }
  function sum(rows, key) { return rows.reduce(function (total, row) { return total + (Number(row[key]) || 0); }, 0); }
  function fmt(value, digits) { return md.formatNumber(value, digits || 0); }
  function netLabel(value) { return value >= 0 ? '買超' : '賣超'; }
  function render(data) {
    var lookback = Number($('tw-inst-lookback').value) || 60;
    var prices = data.price.slice(-lookback);
    var institutions = data.institutional.slice(-lookback);
    var margins = data.margin.slice(-lookback);
    if (!prices.length || !institutions.length) throw new Error('此代號目前沒有足夠的公開歷史資料');
    var latestPrice = prices[prices.length - 1];
    var latestInst = institutions[institutions.length - 1];
    var recent5 = institutions.slice(-5), recent20 = institutions.slice(-20);
    var total5 = sum(recent5, 'total'), total20 = sum(recent20, 'total');
    var streak = 0;
    for (var index = institutions.length - 1; index >= 0; index -= 1) { if (institutions[index].total > 0) streak += 1; else break; }
    var latestMargin = margins[margins.length - 1] || {};
    var marginChange = (latestMargin.margin || 0) - (latestMargin.marginPrev || 0);
    var shortChange = (latestMargin.short || 0) - (latestMargin.shortPrev || 0);
    var ratio = latestMargin.margin > 0 ? latestMargin.short / latestMargin.margin * 100 : NaN;
    var concentrationDenom = institutions.reduce(function (total, row) { return total + Math.abs(row.total); }, 0);
    var concentration = concentrationDenom ? Math.abs(latestInst.total) / concentrationDenom * 100 : 0;
    var warnings = [];
    if (ratio >= 20) warnings.push('券資比達 ' + fmt(ratio, 1) + '%，回補壓力升高，仍需回到價格與成交量確認。');
    if (streak >= 5) warnings.push('法人連續買超 ' + streak + ' 日，避免把延續性直接當成報酬保證。');
    if (latestInst.total < 0 && total20 < 0) warnings.push('最新日與近 20 日法人均為賣超，先檢查支撐與失效條件。');
    if (concentration >= 25) warnings.push('單日淨流向占本窗口絕對流向比重偏高，短期籌碼波動可能放大。');
    $('tw-inst-hud-symbol').textContent = data.symbol;
    [['foreign', 'tw-inst-hud-foreign', 'tw-inst-hud-foreign-detail'], ['trust', 'tw-inst-hud-trust', 'tw-inst-hud-trust-detail'], ['dealer', 'tw-inst-hud-dealer', 'tw-inst-hud-dealer-detail']].forEach(function (entry) { var flow = latestInst[entry[0]]; $(entry[1]).textContent = fmt(flow, 1) + ' 張'; $(entry[2]).textContent = 'NT$ ' + fmt(flow * latestPrice.close * 1000, 0); });
    $('tw-inst-hud-price').textContent = 'NT$ ' + md.formatPrice(latestPrice.close);
    $('tw-inst-hud-date').textContent = md.formatDate(latestPrice.date);
    $('tw-inst-hud-day').textContent = fmt(latestInst.total, 1) + ' 張 ' + netLabel(latestInst.total);
    $('tw-inst-hud-5d').textContent = fmt(total5, 1) + ' 張';
    $('tw-inst-hud-20d').textContent = fmt(total20, 1) + ' 張';
    $('tw-inst-hud-streak').textContent = streak + ' 日';
    $('tw-inst-hud-ratio').textContent = md.formatPercent(ratio, 2);
    $('tw-inst-hud-margin').textContent = (marginChange >= 0 ? '+' : '') + fmt(marginChange, 1) + ' 張';
    $('tw-inst-hud-short').textContent = (shortChange >= 0 ? '+' : '') + fmt(shortChange, 1) + ' 張';
    $('tw-inst-hud-concentration').textContent = md.formatPercent(concentration, 1);
    var name = meta[data.code] ? '／' + meta[data.code] : '';
    $('tw-inst-result').innerHTML = '<p class="tw-result-lead"><strong>' + md.escapeHtml(data.symbol + name) + '</strong> 最新交易日 ' + md.formatDate(latestPrice.date) + '，收盤 NT$ ' + md.formatPrice(latestPrice.close) + '；法人合計 ' + fmt(latestInst.total, 1) + ' 張（' + netLabel(latestInst.total) + '）。</p><div class="tw-stat-grid"><div><span>外資單日</span><strong>' + fmt(latestInst.foreign, 1) + ' 張</strong></div><div><span>投信單日</span><strong>' + fmt(latestInst.trust, 1) + ' 張</strong></div><div><span>自營商單日</span><strong>' + fmt(latestInst.dealer, 1) + ' 張</strong></div><div><span>法人估算淨金額</span><strong>NT$ ' + fmt(latestInst.total * latestPrice.close * 1000, 0) + '</strong></div><div><span>券資比</span><strong>' + md.formatPercent(ratio, 2) + '</strong></div><div><span>融資／融券變化</span><strong>' + fmt(marginChange, 1) + '／' + fmt(shortChange, 1) + ' 張</strong></div></div><p class="tw-result-explain">近 ' + lookback + ' 個交易日共抓取價格 ' + prices.length + ' 筆、法人彙總日 ' + institutions.length + ' 筆與融資融券 ' + margins.length + ' 筆。金額以淨買賣張數 × 收盤價估算，不等同交易所成交金額；法人集中度為本窗口絕對淨流向占比代理值。</p>' + (warnings.length ? '<div class="tw-warning-list"><b>需要再查證</b><ul>' + warnings.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul></div>' : '<p class="tw-result-ok"><i class="fa-solid fa-circle-check"></i> 本窗口沒有觸發條件式警戒，仍請核對原始日報與價格結構。</p>');
    md.drawInstitutionalChart($('tw-inst-chart'), prices, institutions);
    $('tw-inst-chart-caption').textContent = data.symbol + ' · ' + md.formatDate(prices[0].date) + ' → ' + md.formatDate(prices[prices.length - 1].date) + ' · 白線收盤，柱狀為三大法人每日買賣超（張）';
    $('tw-inst-source').textContent = '資料來源：FinMind TaiwanStockPrice／TaiwanStockInstitutionalInvestorsBuySell／TaiwanStockMarginPurchaseShortSale · 更新 ' + new Date().toLocaleString('zh-TW');
  }
  function load() {
    if (state.loading) return;
    var code = md.cleanSymbol($('tw-inst-symbol').value);
    if (!/^\d{4}$/.test(code)) { setStatus('等待有效代號', '請輸入四位台股代號，例如 2330、2454 或 0050。', true); return; }
    $('tw-inst-symbol').value = code + '.TW'; state.loading = true; setStatus('載入中', '正在從 FinMind 取得 ' + code + ' 的公開歷史資料…'); $('tw-inst-result').innerHTML = '<p class="tw-loading"><i class="fa-solid fa-spinner fa-spin"></i> 正在抓取真實資料並計算指標。</p>';
    Promise.all([md.priceHistory(code, 220), md.institutional(code, 220), md.margin(code, 220)]).then(function (values) { state.data = { code: code, symbol: md.displaySymbol(code), price: values[0], institutional: values[1], margin: values[2] }; render(state.data); setStatus('資料已更新', 'FinMind 公開資料 · ' + new Date().toLocaleTimeString('zh-TW')); }).catch(function (error) { setStatus('資料載入失敗', error.message || '公開端點暫時無法回應，請稍後重試。', true); $('tw-inst-result').innerHTML = '<p class="tw-error"><i class="fa-solid fa-triangle-exclamation"></i> 無法取得 ' + md.escapeHtml(code) + ' 的真實資料。請確認代號、網路連線或稍後重試；本工具不使用隨機或假數據替代。</p>'; }).finally(function () { state.loading = false; });
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('tw-inst-load')) return;
    $('tw-inst-load').addEventListener('click', load); $('tw-inst-symbol-select').addEventListener('change', function () { $('tw-inst-symbol').value = this.value; load(); }); $('tw-inst-lookback').addEventListener('change', function () { if (state.data) render(state.data); }); $('tw-inst-symbol').addEventListener('keydown', function (event) { if (event.key === 'Enter') load(); }); window.addEventListener('resize', function () { if (state.data) md.drawInstitutionalChart($('tw-inst-chart'), state.data.price.slice(-Number($('tw-inst-lookback').value)), state.data.institutional.slice(-Number($('tw-inst-lookback').value))); }); load();
  });
}());
